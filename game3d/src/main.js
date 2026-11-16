// Lonceng Pulang 3D: base game (Three.js). Kota Wirabumi + SMA Negeri 3, jalan-jalan dengan Raka.
// Render di resolusi rendah lalu diperbesar tanpa haluskan (nearest) -> tetap terasa pixel/voxel.
import * as THREE from 'three';
import { buildKota, buildSekolah, Collision, SCHOOL_OX } from './world.js';
import { WATER_T } from './kota.js';
import { L } from './buildings.js';
import { SMALL, WIND, plant as vegPlant } from './veg.js';
import { initChars, onCharsReady, Character, preload, styleName } from './chars.js';
import { LINES, NPCS } from './npcs.js';
import { makeRide } from './rides.js';

/* ------------------------------------------------------------------ pengaturan */
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const SAVE_KEY = 'lonceng-pulang-3d';
const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
const opt = Object.assign({ px: 0, quality: isTouch ? 1 : 2, follow: false, zoom: 2, pitch: 1, minimap: !isTouch, fps: true }, saved?.opt || {});
const QUALITY = [{ name: 'Rendah', shadow: 0 }, { name: 'Sedang', shadow: 1024, ext: 22 }, { name: 'Tinggi', shadow: 2048, ext: 30 }];
const ZOOMS = [7, 10, 14, 20];
const PITCHES = [0.42, 0.62, 0.85];   // sudut kamera: rendah (lebih miring), sedang, tinggi (top-down)
const PITCH_NAMES = ['Rendah', 'Sedang', 'Tinggi'];

/* ------------------------------------------------------------------ renderer */
const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
renderer.setPixelRatio(1);
renderer.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene();
const SKY = new THREE.Color('#bcd8ec');
scene.background = SKY; scene.fog = new THREE.Fog(SKY, 35, 85);
const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 160);
const hemi = new THREE.HemisphereLight('#e6efff', '#7a8a5a', 1.9); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff1d6', 2.1); sun.position.set(20, 40, 12); scene.add(sun, sun.target);
sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.04;

function applyQuality() {
  const q = QUALITY[opt.quality];
  renderer.shadowMap.enabled = !!q.shadow; sun.castShadow = !!q.shadow;
  if (q.shadow) {
    sun.shadow.mapSize.set(q.shadow, q.shadow);
    Object.assign(sun.shadow.camera, { left: -q.ext, right: q.ext, top: q.ext, bottom: -q.ext, near: 1, far: 120 });
    sun.shadow.camera.updateProjectionMatrix();
    if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
  }
  scene.traverse(o => { if (o.material) o.material.needsUpdate = true; });
  for (const im of SMALL) im.visible = opt.quality > 0;
}
let pxSize = 3;
function resize() {
  const w = innerWidth, h = innerHeight;
  pxSize = opt.px || Math.max(2, Math.round(Math.min(h, w * 1.2) / (isTouch ? 260 : 330)));
  renderer.setSize(Math.ceil(w / pxSize), Math.ceil(h / pxSize), false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

/* ------------------------------------------------------------------ dunia */
const collision = new Collision();
const kota = buildKota(scene, collision);
const sekolah = buildSekolah(scene, collision);
initChars(__WORKER_SRC__);

const SPAWN = (() => { const [x, z] = L(kota.darto.xf, -0.4, kota.darto.d / 2 + 0.5); return { x, z }; })();
const player = { x: SPAWN.x, z: SPAWN.z, vx: 0, vz: 0, heading: Math.PI / 2, run: false, area: 'kota' };
if (saved?.p) Object.assign(player, saved.p);
const raka = new Character('raka', { xray: true, prio: 10 });
scene.add(raka.group);
// kendaraan pemain: R / tombol Naik = jalan kaki -> sepeda -> motor. Kendaraan (roda berputar, engkol ikut kayuhan) menempel di grup tokoh.
const RIDES = [null,
  { name: 'Sepeda', walk: 3.6, run: 6.0, r: makeRide('sepeda', 'kota', '#2a8ae0') },
  { name: 'Motor', walk: 6.5, run: 10.5, r: makeRide('motor', 'bebek', '#c83a3a') }];
for (const R of RIDES) if (R) { R.r.group.rotation.y = Math.PI / 2; R.r.group.visible = false; raka.group.add(R.r.group); }
let ride = 0;
function toggleRide() {
  if (player.area !== 'kota' && !ride) { toast('Kendaraan cuma bisa dipakai di kota'); return; }
  ride = (ride + 1) % RIDES.length; if (player.area !== 'kota') ride = 0;
  RIDES.forEach((R, i) => R && (R.r.group.visible = i === ride));
  const R = RIDES[ride];
  raka.seat = R ? { ...R.r.seat } : null; raka.blob.scale.setScalar(R ? 1.6 : 1); player.emote = null;
  toast(R ? 'Naik ' + R.name.toLowerCase() + ' (Naik/R lagi: ganti/turun)' : 'Jalan kaki');
}
// gaya (emote) pemain: tombol 1-9, 0 atau tombol Gaya (HP). Berhenti saat bergerak.
const EMOTES = ['wave', 'sitDown', 'squat', 'phone', 'dance', 'salute', 'raiseHand', 'read', 'lie', 'clap', 'laugh', 'think', 'carry', 'bow', 'stretch'];
let emoteI = -1;
function emote(i) { if (ride) return; emoteI = i % EMOTES.length; player.emote = EMOTES[emoteI]; }

const npcs = [];
onCharsReady(() => {
  preload('raka', ['idle', 'walk', 'run'], 10);
  const byRegion = {};
  for (const h of kota.houses) if (!h.special && !h.noHome) (byRegion[h.region] || (byRegion[h.region] = [])).push(h);
  NPCS.forEach((n, idx) => {
    let home;
    const H = n.home;
    if (H === 'darto' && kota.darto) { const [x, z] = L(kota.darto.xf, n.dx, n.dz); home = { x, z }; }
    else if (H === 'musala') { const h = kota.houses.find(h => h.special === 'musala'); if (h) { const [x, z] = L(h.xf, 1.5, 3.6); home = { x, z }; } }
    else if (H.house) { const arr = byRegion[H.house] || []; const h = arr[H.n % Math.max(1, arr.length)]; if (h) { const [x, z] = L(h.xf, 0.6, h.d / 2 + (h.yard ? 1.6 : 0.7)); home = { x, z }; } }
    else if (H.school) home = { x: SCHOOL_OX + H.x, z: H.z };
    else home = { x: H.x, z: H.z };
    if (!home) return;
    const c = new Character(n.sid); scene.add(c.group);
    const p = collision.resolve({ x: home.x, z: home.z }, 0.3);
    home = { x: p.x, z: p.z };
    npcs.push({ ...n, key: 'n' + idx, name: n.name || styleName(n.sid), c, home, x: p.x, z: p.z, tx: p.x, tz: p.z, wait: Math.random() * 3, heading: Math.random() * 6, say: null, greetT: 0 });
    preload(n.sid, ['idle'], 1);
  });
  // tukang parkir di minimarket, lahan parkir, dan parkir liar depan ruko: mondar-mandir sepanjang deretan motor, memberi aba-aba
  const PNAMES = ['Bang Jalu', 'Pak Darno', 'Mas Tejo', 'Bang Ipul', 'Pak Somad', 'Mang Udin', 'Kang Asep', 'Bang Mamat', 'Pak Ogah', 'Mas Bowo', 'Bang Romli', 'Pak Kumis'];
  (kota.parkir || []).forEach((sp, i) => {
    const sid = i % 3 === 2 ? 'tukangParkir2' : 'tukangParkir', c = new Character(sid); scene.add(c.group);
    const ux = Math.cos(sp.a), uz = Math.sin(sp.a), h = sp.len / 2;
    const path = [{ x: sp.x - ux * h, z: sp.z - uz * h }, { x: sp.x + ux * h, z: sp.z + uz * h }];
    const p = collision.resolve({ x: sp.x, z: sp.z }, 0.3);
    npcs.push({ sid, name: PNAMES[i % PNAMES.length], filler: true, linesKey: 'parkir', parkir: true, path, roam: 0, key: 'p' + i, c, home: { x: p.x, z: p.z }, x: p.x, z: p.z, tx: p.x, tz: p.z, wait: Math.random() * 3, heading: sp.a + Math.PI / 2, say: null, greetT: Math.random() * 10 });
  });
  preload('tukangParkir', ['idle', 'walk', 'wave'], 1);
});

/* ------------------------------------------------------------------ input */
const keys = new Set();
addEventListener('keydown', e => {
  if (e.repeat) { if (!['KeyQ', 'KeyE'].includes(e.code)) return; }
  keys.add(e.code);
  if (e.code === 'KeyQ') rotateCam(-1);
  if (e.code === 'KeyE') rotateCam(1);
  if (e.code === 'KeyC') toggleFollow();
  if (e.code === 'KeyM') toggleMinimap();
  if (e.code === 'KeyV') cyclePitch();
  if (e.code === 'KeyR') toggleRide();
  const dg = /^Digit(\d)$/.exec(e.code); if (dg) emote((+dg[1] + 9) % 10);
  if (e.code === 'Space' || e.code === 'KeyF' || e.code === 'Enter') { act(); e.preventDefault(); }
  if (e.code === 'Equal' || e.code === 'NumpadAdd') zoom(-1);
  if (e.code === 'Minus' || e.code === 'NumpadSubtract') zoom(1);
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => keys.clear());

const joy = { x: 0, y: 0, id: null, ox: 0, oy: 0 };
const cam = { yaw: saved?.yaw ?? 0.6, yawT: saved?.yaw ?? 0.6, dist: ZOOMS[opt.zoom], distT: ZOOMS[opt.zoom], pitch: PITCHES[opt.pitch], pitchT: PITCHES[opt.pitch], x: player.x, z: player.z, manualT: 0 };
function rotateCam(d) { cam.yawT = Math.round(cam.yawT / (Math.PI / 4)) * (Math.PI / 4) + d * Math.PI / 4; cam.manualT = 1.5; }
function zoom(d) { opt.zoom = Math.max(0, Math.min(ZOOMS.length - 1, opt.zoom + d)); cam.distT = ZOOMS[opt.zoom]; }
function toggleFollow() { opt.follow = !opt.follow; ui.follow.classList.toggle('on', opt.follow); toast(opt.follow ? 'Kamera: ikut karakter' : 'Kamera: bebas (Q/E putar)'); }
function cyclePitch() { opt.pitch = (opt.pitch + 1) % PITCHES.length; cam.pitchT = PITCHES[opt.pitch]; $('btnPitch').textContent = 'Sudut: ' + PITCH_NAMES[opt.pitch]; toast('Sudut kamera: ' + PITCH_NAMES[opt.pitch]); }
function toggleMinimap() { opt.minimap = !opt.minimap; ui.mapWrap.style.display = opt.minimap ? '' : 'none'; }

// mouse: seret = putar kamera, roda = zoom. Sentuh: joystick kiri, dua jari = putar + cubit zoom.
const touches = new Map();
let drag = null, pinch = null;
canvas.addEventListener('pointerdown', e => {
  canvas.setPointerCapture(e.pointerId);
  if (e.pointerType === 'mouse') { drag = { x: e.clientX, y: e.clientY }; return; }
  touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (touches.size === 1 && e.clientX < innerWidth * 0.5) {
    joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.x = joy.y = 0;
    ui.joy.style.display = 'block'; ui.joy.style.left = e.clientX + 'px'; ui.joy.style.top = e.clientY + 'px'; ui.knob.style.transform = '';
  } else if (touches.size === 1) drag = { x: e.clientX, id: e.pointerId };
  if (touches.size === 2) {
    const [a, b] = [...touches.values()];
    pinch = { ang: Math.atan2(b.y - a.y, b.x - a.x), d: Math.hypot(b.x - a.x, b.y - a.y), dist: cam.distT };
    if (joy.id !== null) endJoy();
    drag = null;
  }
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse') { if (drag && e.buttons) { cam.yawT -= (e.clientX - drag.x) * 0.008; cam.pitchT = Math.max(0.3, Math.min(1.2, cam.pitchT + (e.clientY - drag.y) * 0.004)); cam.manualT = 1.5; drag.x = e.clientX; drag.y = e.clientY; } return; }
  if (!touches.has(e.pointerId)) return;
  touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (e.pointerId === joy.id) {
    let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const R = 46, l = Math.hypot(dx, dy);
    if (l > R) { dx *= R / l; dy *= R / l; }
    joy.x = dx / R; joy.y = dy / R; ui.knob.style.transform = `translate(${dx}px,${dy}px)`;
    player.run = l > R * 1.6 || ui.run.classList.contains('on');
  } else if (pinch && touches.size === 2) {
    const [a, b] = [...touches.values()];
    const ang = Math.atan2(b.y - a.y, b.x - a.x), d = Math.hypot(b.x - a.x, b.y - a.y);
    cam.yawT -= ang - pinch.ang; pinch.ang = ang; cam.manualT = 1.5;
    const my = (a.y + b.y) / 2; if (pinch.my != null) cam.pitchT = Math.max(0.3, Math.min(1.2, cam.pitchT + (my - pinch.my) * 0.005)); pinch.my = my;
    cam.distT = Math.max(ZOOMS[0], Math.min(ZOOMS.at(-1), pinch.dist * pinch.d / d));
  } else if (drag && drag.id === e.pointerId) { cam.yawT -= (e.clientX - drag.x) * 0.012; cam.manualT = 1.5; drag.x = e.clientX; }
});
const endPtr = e => {
  if (e.pointerType === 'mouse') { drag = null; return; }
  touches.delete(e.pointerId);
  if (e.pointerId === joy.id) endJoy();
  if (touches.size < 2) pinch = null;
  if (drag && drag.id === e.pointerId) drag = null;
};
function endJoy() { joy.id = null; joy.x = joy.y = 0; ui.joy.style.display = 'none'; }
canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);
canvas.addEventListener('wheel', e => { cam.distT = Math.max(ZOOMS[0], Math.min(ZOOMS.at(-1), cam.distT * (1 + Math.sign(e.deltaY) * 0.12))); e.preventDefault(); }, { passive: false });
canvas.addEventListener('contextmenu', e => e.preventDefault());

/* ------------------------------------------------------------------ UI */
const $ = id => document.getElementById(id);
const ui = { area: $('area'), prompt: $('prompt'), toast: $('toast'), fps: $('fps'), joy: $('joy'), knob: $('knob'), run: $('btnRun'), follow: $('btnFollow'),
  mapWrap: $('mapWrap'), map: $('map'), fade: $('fade'), bubbles: $('bubbles'), quality: $('btnQuality'), loading: $('loading') };
document.body.classList.toggle('touch', isTouch);
ui.follow.classList.toggle('on', opt.follow);
ui.mapWrap.style.display = opt.minimap ? '' : 'none';
const tap = (el, fn) => el.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); fn(); });
tap($('btnAct'), () => act()); tap($('btnRide'), toggleRide); tap($('btnEmote'), () => emote(emoteI + 1));
const menu = $('menu'); menu.classList.toggle('closed', isTouch);
tap($('btnMenu'), () => menu.classList.toggle('closed'));
tap(ui.run, () => { ui.run.classList.toggle('on'); player.run = ui.run.classList.contains('on'); });
tap($('btnL'), () => rotateCam(-1)); tap($('btnR'), () => rotateCam(1));
tap(ui.follow, toggleFollow); tap($('btnPitch'), cyclePitch); $('btnPitch').textContent = 'Sudut: ' + PITCH_NAMES[opt.pitch]; tap($('btnMap'), toggleMinimap);
tap($('btnZoomIn'), () => zoom(-1)); tap($('btnZoomOut'), () => zoom(1));
tap(ui.quality, () => { opt.quality = (opt.quality + 1) % 3; applyQuality(); ui.quality.textContent = 'Grafik: ' + QUALITY[opt.quality].name; });
tap($('btnPx'), () => { opt.px = opt.px >= 5 ? 0 : (opt.px || pxSize) + 1; resize(); $('btnPx').textContent = 'Pixel: ' + (opt.px || 'auto'); });
ui.quality.textContent = 'Grafik: ' + QUALITY[opt.quality].name; $('btnPx').textContent = 'Pixel: ' + (opt.px || 'auto');
let toastT = 0;
function toast(t) { ui.toast.textContent = t; ui.toast.style.opacity = 1; toastT = 2.2; }

/* ------------------------------------------------------------------ interaksi */
const ENTER_SCHOOL = { x: 109 + kota.smaShift.x, z: 63.5 + kota.smaShift.z };   // depan gerbang SMA 3 di peta kota
const EXIT_SCHOOL = { x: SCHOOL_OX + 39, z: 58.2 };   // trotoar depan gerbang (guide 83)
let target = null;
function findTarget() {
  let best = null, bd = 1e9;
  for (const n of npcs) { const d = Math.hypot(n.x - player.x, n.z - player.z); if (d < 1.9 && d < bd) { bd = d; best = { kind: 'npc', n, label: 'Ngobrol: ' + n.name }; } }
  if (best) return best;
  if (player.area === 'kota') {
    if (Math.hypot(player.x - ENTER_SCHOOL.x, player.z - ENTER_SCHOOL.z) < 3.2) return { kind: 'go', to: 'sekolah', label: 'Masuk SMA Negeri 3' };
    for (const m of kota.marks) if (Math.hypot(m.x - player.x, m.y - player.z) < 3.5) return { kind: 'info', label: m.name, desc: m.desc };
  } else if (Math.hypot(player.x - EXIT_SCHOOL.x, player.z - EXIT_SCHOOL.z) < 3) return { kind: 'go', to: 'kota', label: 'Keluar ke kota (Jl. Merdeka)' };
  return null;
}
let fading = 0;
function act() {
  if (!target || fading) return;
  if (target.kind === 'npc') {
    const n = target.n, lines = LINES[n.linesKey || (n.filler ? n.name : n.sid)] || ['Halo!'];
    n.say = { text: lines[n.line = ((n.line ?? -1) + 1) % lines.length], t: 3.5 };
    n.heading = Math.atan2(player.z - n.z, player.x - n.x); n.wait = 4; n.tx = n.x; n.tz = n.z;
  } else if (target.kind === 'go') {
    fading = 1; ui.fade.style.opacity = 1;
    setTimeout(() => {
      if (ride) { ride = RIDES.length - 1; toggleRide(); }
      if (target.to === 'sekolah') Object.assign(player, { x: EXIT_SCHOOL.x, z: EXIT_SCHOOL.z - 4.2, heading: -Math.PI / 2, area: 'sekolah' });
      else Object.assign(player, { x: ENTER_SCHOOL.x, z: ENTER_SCHOOL.z + 1.5, heading: Math.PI / 2, area: 'kota' });
      cam.x = player.x; cam.z = player.z; cam.yaw = cam.yawT = 0;
      ui.fade.style.opacity = 0; fading = 0;
    }, 350);
  } else toast(target.desc);
}

/* ------------------------------------------------------------------ minimap */
const mctx = ui.map.getContext('2d');
function drawMinimap() {
  const S = 132, sc = 3;   // 3 piksel per petak di minimap
  const inK = player.area === 'kota', img = inK ? kota.groundTex : sekolah.groundTex, ox = inK ? 0 : SCHOOL_OX + sekolah.gx0, oz = inK ? 0 : sekolah.gz0;
  const k = img.width / (inK ? 260 : sekolah.gw);
  mctx.save(); mctx.fillStyle = '#9ab878'; mctx.fillRect(0, 0, S, S);
  mctx.translate(S / 2, S / 2); mctx.rotate(cam.yaw);
  mctx.imageSmoothingEnabled = false;
  mctx.drawImage(img, (player.x - ox) * k - S / sc / 2 * k * 1.5, (player.z - oz) * k - S / sc / 2 * k * 1.5, S / sc * k * 1.5, S / sc * k * 1.5, -S * 0.75, -S * 0.75, S * 1.5, S * 1.5);
  mctx.fillStyle = '#ffd84a';
  for (const n of npcs) { const dx = (n.x - player.x) * sc, dz = (n.z - player.z) * sc; if (Math.abs(dx) < S && Math.abs(dz) < S) mctx.fillRect(dx - 1.5, dz - 1.5, 3, 3); }
  if (player.area === 'kota') { mctx.fillStyle = '#e04040'; for (const m of kota.marks) { const dx = (m.x - player.x) * sc, dz = (m.y - player.z) * sc; if (Math.abs(dx) < S && Math.abs(dz) < S) mctx.fillRect(dx - 2, dz - 2, 4, 4); } }
  mctx.rotate(player.heading); mctx.fillStyle = '#fff'; mctx.strokeStyle = '#000'; mctx.lineWidth = 1;
  mctx.beginPath(); mctx.moveTo(6, 0); mctx.lineTo(-4, -4); mctx.lineTo(-2, 0); mctx.lineTo(-4, 4); mctx.closePath(); mctx.fill(); mctx.stroke();
  mctx.restore();
}

/* ------------------------------------------------------------------ update */
const tmp = { x: 0, z: 0 };
function updatePlayer(dt) {
  let ix = 0, iy = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) iy -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) iy += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
  ix += joy.x; iy += joy.y;
  let l = Math.hypot(ix, iy); if (l > 1) { ix /= l; iy /= l; l = 1; }
  const run = keys.has('ShiftLeft') || keys.has('ShiftRight') || player.run;
  const RD = RIDES[ride], sp = (RD ? (run ? RD.run : RD.walk) : (run ? 4.6 : 2.1)) * Math.min(1, l * 1.3);
  // arah relatif kamera: atas layar = arah pandang kamera
  const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
  const wx = (fx * -iy + rx * ix), wz = (fz * -iy + rz * ix);
  const k = 1 - Math.exp(-dt * 14);
  player.vx += (wx * sp - player.vx) * k; player.vz += (wz * sp - player.vz) * k;
  const np = collision.move(player, player.x + player.vx * dt, player.z + player.vz * dt, ride ? 0.4 : 0.28);
  // kecepatan nyata (supaya animasi berhenti saat menabrak dinding)
  if (dt > 0) { player.vx = (np.x - player.x) / dt; player.vz = (np.z - player.z) / dt; }
  player.x = np.x; player.z = np.z;
  const v = Math.hypot(player.vx, player.vz);
  if (l > 0.1) {
    const want = Math.atan2(wz, wx); let d = want - player.heading; d = Math.atan2(Math.sin(d), Math.cos(d));
    player.heading += d * Math.min(1, dt * 14);
  }
  raka.heading = player.heading;
  if (l > 0.1) player.emote = null;
  if (RD) { raka.play(RD.r.anim); RD.r.spin(v * dt); }
  else raka.play(player.emote || (v > 3.2 ? 'run' : v > 0.35 ? 'walk' : 'idle'));
  raka.group.position.set(player.x, 0, player.z);
  raka.update(RD ? (RD.r.type === 'sepeda' ? dt * Math.min(1.6, v / 2.5) : dt) : dt);
  if (RD) RD.r.syncCrank(raka);
  return v;
}

// variasi diam NPC: siswa main HP/ngobrol/baca, orang dewasa jongkok/peregangan, anak-anak joget; beberapa tokoh punya kebiasaan sendiri (guide)
const STUDENTS = new Set(['raka', 'rani', 'bimo', 'tegar', 'jojo', 'uti', 'nadia', 'sekar', 'laras', 'dimas', 'arga', 'rizal', 'bram', 'rio', 'kevin', 'sasha', 'siswaA', 'siswiA', 'siswiB', 'siswaB', 'paskibra', 'kirana', 'mei', 'andra']);
const KIDS = new Set(['anakSD', 'anakSDcw', 'bocah', 'cici']);
const HABIT = { pakUjang: 'sweep', gilang: 'carry', mei: 'read', rizal: 'read', jojo: 'phone', sekar: 'think', fajar: 'squat', satpam: 'salute', paskibra: 'salute', polisi: 'salute', kakek: 'squat', andra: 'think', laras: 'carry', bimo: 'laugh', tegar: 'read', pakGunadi: 'think', buRatna: 'read' };
const IDLES = { student: ['idle', 'idle', 'phone', 'talk', 'look', 'think', 'laugh', 'read', 'clap'], adult: ['idle', 'idle', 'look', 'phone', 'talk', 'squat', 'stretch', 'scratch'], kid: ['idle', 'look', 'dance', 'squat', 'wave', 'clap'] };
const pick3 = a => a[Math.floor(Math.random() * a.length)];
function pickIdle(n) {
  if (HABIT[n.sid] && Math.random() < 0.45) return HABIT[n.sid];
  const set = STUDENTS.has(n.sid) ? IDLES.student : KIDS.has(n.sid) ? IDLES.kid : IDLES.adult;
  return set[Math.floor(Math.random() * set.length)];
}
function updateNPC(n, dt) {
  const dx = n.x - player.x, dz = n.z - player.z, far = dx * dx + dz * dz > 70 * 70;
  n.c.group.visible = !far;
  if (far) return;
  n.wait -= dt;
  let moving = false;
  if (n.wait <= 0) {
    const tx = n.tx - n.x, tz = n.tz - n.z, d = Math.hypot(tx, tz);
    if (d < 0.2 && n.parkir) {   // tukang parkir: berhenti di satu titik deretan, kasih aba-aba, lalu pindah
      n.idle = pick3(['wave', 'wave', 'raiseHand', 'look', 'idle', 'phone']); n.wait = 2 + Math.random() * 4;
      const t = Math.random(), [a, b] = n.path; n.tx = a.x + (b.x - a.x) * t; n.tz = a.z + (b.z - a.z) * t;
      if (n.idle === 'wave' && !n.say && Math.random() < 0.35) n.say = { text: pick3(['Priiit! Kiri, kiri... terus!', 'Mundur, mundur... stop!', 'Ayo, ayo, masih muat!', 'Priit priiit!']), t: 2.2 };
    }
    else if (d < 0.2) { n.idle = pickIdle(n); n.wait = n.idle === 'idle' ? 2 + Math.random() * 5 : 5 + Math.random() * 8; const a = Math.random() * 6.28, r = Math.random() * (n.roam ?? 3); n.tx = n.home.x + Math.cos(a) * r; n.tz = n.home.z + Math.sin(a) * r; }
    else {
      const s = 1.1 * dt; const p = collision.move(n, n.x + tx / d * s, n.z + tz / d * s, 0.26);
      if (Math.hypot(p.x - n.x, p.z - n.z) < s * 0.3) { n.tx = n.x; n.tz = n.z; }
      n.x = p.x; n.z = p.z; n.heading = Math.atan2(tz, tx); moving = true;
    }
  }
  // jangan tembus pemain
  const pd = Math.hypot(dx, dz); if (pd < 0.55 && pd > 1e-4) { n.x = player.x + dx / pd * 0.55; n.z = player.z + dz / pd * 0.55; }
  n.c.heading = n.heading; n.c.play(moving ? 'walk' : n.say && !n.filler ? 'talk' : n.idle || 'idle');
  n.c.group.position.set(n.x, 0, n.z); n.c.update(dt);
  if (n.say) { n.say.t -= dt; if (n.say.t <= 0) n.say = null; }
  n.greetT -= dt;
  if (n.parkir && ride && !n.say && n.greetT <= 0 && Math.hypot(dx, dz) < 4) { n.say = { text: pick3(['Parkir sini, Mas! Aman!', 'Sini, sini, masih kosong!', 'Helmnya dititip sini aja, Mas.']), t: 3 }; n.greetT = 20; n.idle = 'wave'; n.wait = 3; }
  if (n.filler && !n.say && n.greetT <= 0 && Math.hypot(dx, dz) < 3) { const ls = LINES[n.linesKey || n.name] || ['Halo!']; n.say = { text: ls[Math.floor(Math.random() * ls.length)], t: 3 }; n.greetT = 30; }
}

const v3 = new THREE.Vector3();
const bubbleEls = new Map();
function drawBubbles() {
  const seen = new Set();
  const show = (key, x, y, z, text, cls) => {
    v3.set(x, y, z).project(camera);
    if (v3.z > 1) return;
    let el = bubbleEls.get(key);
    if (!el) { el = document.createElement('div'); ui.bubbles.appendChild(el); bubbleEls.set(key, el); }
    el.className = cls; el.textContent = text;
    el.style.transform = `translate(${(v3.x * 0.5 + 0.5) * innerWidth}px, ${(-v3.y * 0.5 + 0.5) * innerHeight}px) translate(-50%, -100%)`;
    seen.add(key);
  };
  for (const n of npcs) {
    if (!n.c.group.visible) continue;
    const d = Math.hypot(n.x - player.x, n.z - player.z);
    if (n.say) show(n.key, n.x, 2.0, n.z, n.say.text, n.filler ? 'bubble filler' : 'bubble');
    else if (d < 6) show(n.key, n.x, 1.85, n.z, n.name, n.filler ? 'tag filler' : 'tag');
  }
  for (const [k, el] of bubbleEls) if (!seen.has(k)) { el.remove(); bubbleEls.delete(k); }
}

let last = performance.now(), fpsAcc = 0, fpsN = 0, saveT = 0, areaName = '';
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const v = updatePlayer(dt);
  for (const n of npcs) updateNPC(n, dt);
  kota.traffic.update(dt, player);
  kota.signs?.update(now / 1000);
  // kamera
  cam.manualT -= dt;
  if (opt.follow && v > 0.5 && cam.manualT <= 0) {
    const want = Math.atan2(-Math.cos(player.heading), -Math.sin(player.heading));
    let d = want - cam.yawT; d = Math.atan2(Math.sin(d), Math.cos(d));
    cam.yawT += d * Math.min(1, dt * 1.6);
  }
  cam.yaw += (cam.yawT - cam.yaw) * Math.min(1, dt * 8);
  cam.dist += (cam.distT - cam.dist) * Math.min(1, dt * 8);
  cam.pitch += (cam.pitchT - cam.pitch) * Math.min(1, dt * 8);
  WATER_T.value += dt; WIND.value += dt;
  const lk = Math.min(1, dt * 10); cam.x += (player.x - cam.x) * lk; cam.z += (player.z - cam.z) * lk;
  // layar tegak (HP portrait): mundurkan kamera supaya lebar pandang tetap cukup
  const dist = cam.dist * (camera.aspect < 1 ? Math.pow(1 / camera.aspect, 0.6) : 1);
  const cp = Math.cos(cam.pitch) * dist;
  camera.position.set(cam.x + Math.sin(cam.yaw) * cp, Math.sin(cam.pitch) * dist + 0.8, cam.z + Math.cos(cam.yaw) * cp);
  camera.lookAt(cam.x, 0.8, cam.z);
  scene.fog.near = dist * 2.6; scene.fog.far = dist * 2.6 + 50;
  // matahari ikut pemain, dibulatkan ke grid texel bayangan supaya tidak berkedip
  if (sun.castShadow) {
    const q = QUALITY[opt.quality], step = (q.ext * 2) / q.shadow;
    const sx = Math.round(cam.x / step) * step, sz = Math.round(cam.z / step) * step;
    sun.target.position.set(sx, 0, sz); sun.position.set(sx + 22, 45, sz + 14);
  }
  renderer.render(scene, camera);
  // HUD
  target = findTarget();
  ui.prompt.style.display = target ? '' : 'none';
  if (target) ui.prompt.textContent = (isTouch ? '' : '[Spasi] ') + target.label;
  const an = player.area === 'kota' ? kota.regionAt(player.x, player.z) : sekolah.zoneAt(player.x, player.z);
  if (an !== areaName) { areaName = an; ui.area.textContent = an; }
  drawBubbles();
  if (opt.minimap) drawMinimap();
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) ui.toast.style.opacity = 0; }
  fpsAcc += dt; fpsN++;
  if (fpsAcc > 0.5) { ui.fps.textContent = `${Math.round(fpsN / fpsAcc)} fps · ${renderer.info.render.calls} draw · ${renderer.domElement.width}x${renderer.domElement.height}`; fpsAcc = 0; fpsN = 0; }
  saveT += dt;
  if (saveT > 4) { saveT = 0; localStorage.setItem(SAVE_KEY, JSON.stringify({ p: { x: player.x, z: player.z, heading: player.heading, area: player.area }, yaw: cam.yawT, opt })); }
}

resize(); applyQuality();
cam.x = player.x; cam.z = player.z;
renderer.compile(scene, camera);
ui.loading.style.display = 'none';
requestAnimationFrame(t => { last = t; loop(t); });
// debug / tes otomatis
window.__game = { makeRide, toggleRide, emote, vegPlant, Character, player, cam, npcs, renderer, scene, camera, opt, kota, sekolah, act, rotateCam, toggleFollow, zoom, findTarget: () => target };
