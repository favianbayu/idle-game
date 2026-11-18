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
import { makeFight } from './fight.js';
import { makeBigMap } from './bigmap.js';
import { makeActivities } from './activities.js';
import { makeShop } from './shop.js';
import { makeInteriors } from './interior.js';
import { makeJajan } from './jajan.js';
import { makeAnimals } from './animals.js';
import { makeRace } from './race.js';
import { makeKolam } from './kolam.js';
import { makeStory } from './story.js';
import { makeWaktu } from './waktu.js';
import { parked } from './parked.js';
import { makeLuar } from './luar.js';

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
const SKY = new THREE.Color('#bcd8ec'), DARKBG = new THREE.Color('#16141a'), SKYNOW = SKY.clone();
let wasInside = false;
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
  // auto: layar sentuh (HP/tablet) tetap pixel besar supaya FPS aman; PC/laptop pakai resolusi penuh (pixel 1, halus)
  pxSize = opt.px || (isTouch ? Math.max(2, Math.round(Math.min(h, w * 1.2) / 260)) : 1);
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
if (saved?.stats) player.stats = saved.stats;
if (saved) { if (saved.uang != null) player.uang = saved.uang; if (saved.inv) player.inv = saved.inv; if (saved.flags) player.flags = saved.flags; if (saved.upg) player.upg = saved.upg; }
function tick0save() { localStorage.setItem(SAVE_KEY, JSON.stringify({ p: { x: player.x, z: player.z, heading: player.heading, area: player.area, zone: player.zone }, yaw: cam.yawT, opt, garage, stats: player.stats, uang: player.uang, inv: player.inv, flags: player.flags, upg: player.upg })); }
const HERO = opt.hero === 'rani' ? 'rani' : 'raka';   // tokoh pemain: Raka (cowok) atau Rani (cewek), dipilih di menu
const raka = new Character(HERO, { xray: true, prio: 10 });
scene.add(raka.group);
// kendaraan pemain: tidak muncul dari udara. Tiap kendaraan diparkir di dunia (awal: lorong samping rumah Om Darto),
// Aksi di dekatnya = naik, Aksi saat berkendara = turun & parkir di tempat. Mode cerita: awal cuma punya onthel Om.
const RIDES = [null,
  { name: 'Sepeda onthel', walk: 3.0, run: 5.0, r: makeRide('sepeda', 'onthel', '#2f5a3e') },
  { name: 'Motor', walk: 6.5, run: 10.5, r: makeRide('motor', 'bebek', '#c83a3a') }];
const HOME_PARK = (() => {
  const D = kota.darto, sd = D.cart && D.cart.lx > 0 ? -1 : 1, out = [];
  for (const lx of [sd * 1.3, sd * 2.3, sd * 0.5, -sd * 1.5]) {
    const [x, z] = L(D.xf, lx, D.d / 2 + 0.75), p = collision.resolve({ x, z }, 0.35);
    if (Math.hypot(p.x - x, p.z - z) < 0.3 && kota.M.roadDist(p.x, p.z) > 0.25) out.push({ x: p.x, z: p.z, h: D.xf.a + Math.PI / 2 });
  }
  while (out.length < 2) { const [x, z] = L(D.xf, -0.4 + out.length * 0.9, D.d / 2 + 1.2); out.push({ x, z, h: D.xf.a + Math.PI / 2 }); }
  return out;
})();
const garage = { owned: { 1: true, 2: !opt.story }, spot: { 1: { ...HOME_PARK[0], area: 'kota' }, 2: { ...HOME_PARK[1], area: 'kota' } } };
if (saved?.garage) { Object.assign(garage.owned, saved.garage.owned); Object.assign(garage.spot, saved.garage.spot); }
for (const [i, R] of RIDES.entries()) if (R) {
  R.r.group.rotation.y = Math.PI / 2; R.holder = new THREE.Group(); R.holder.add(R.r.group); scene.add(R.holder);
}
let ride = 0;
const groundAt = (area, x, z) => area === 'kota' ? kota.groundY(x, z) : area === 'luar' ? luar.groundY(x, z) : 0;
// kendaraan di tanjakan: tinggi & kemiringan dari tanah di bawah roda depan & belakang (tidak menembus jalan)
function slopeAt(area, x, z, h, hl) {
  const cx = Math.cos(h), cz = Math.sin(h), f = groundAt(area, x + cx * hl, z + cz * hl), b = groundAt(area, x - cx * hl, z - cz * hl);
  return { y: Math.max(groundAt(area, x, z), (f + b) / 2), pitch: Math.atan2(f - b, 2 * hl) };
}
function placeParked() {
  for (const [i, R] of RIDES.entries()) if (R && i !== ride) {
    const sp = garage.spot[i]; R.holder.add(R.r.group);
    const t = slopeAt(sp.area, sp.x, sp.z, sp.h, R.r.half || 0.45);
    R.holder.position.set(sp.x, t.y, sp.z); R.holder.rotation.set(0, -sp.h, t.pitch, 'YXZ');
    R.holder.visible = !!garage.owned[i] && sp.area === player.area && (sp.area !== 'luar' || sp.zone === luar.cur?.id);
  }
}
function mount(i) {
  if (player.fx && (player.fx.down > 0 || player.fx.atk)) return;
  if (player.swim) return;
  const R = RIDES[i], sp = garage.spot[i];
  ride = i; raka.group.add(R.r.group); R.holder.visible = false;
  Object.assign(player, { x: sp.x, z: sp.z, heading: sp.h, vx: 0, vz: 0, emote: null });
  raka.seat = { ...R.r.seat }; raka.blob.scale.setScalar(1.6);
  toast('Naik ' + R.name.toLowerCase() + ' (Aksi lagi: turun & parkir)');
}
function dismount(quiet) {
  if (!ride) return;
  const i = ride, R = RIDES[i];
  garage.spot[i] = { x: player.x, z: player.z, h: player.heading, area: player.area, zone: player.area === 'luar' ? player.zone : undefined };
  ride = 0; raka.seat = null; raka.blob.scale.setScalar(1); placeParked();
  // turun di samping kendaraan, bukan di joknya
  const sx = -Math.sin(player.heading), sz = Math.cos(player.heading);
  const p = collision.resolve({ x: player.x + sx * 0.55, z: player.z + sz * 0.55 }, 0.28); player.x = p.x; player.z = p.z;
  if (!quiet) toast(R.name + ' diparkir di sini');
}
// kendaraan yang diparkir ikut jadi penghalang (dua lingkaran: depan & belakang)
function pushParked(p, r) {
  for (const [i, R] of RIDES.entries()) if (R && i !== ride && R.holder.visible) {
    const sp = garage.spot[i], hl = R.r.half || 0.45;
    for (const sd of [1, -1, 0]) {
      const cx = sp.x + Math.cos(sp.h) * hl * sd * 0.8, cz = sp.z + Math.sin(sp.h) * hl * sd * 0.8, dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz), m = r + 0.2;
      if (d < m && d > 1e-5) { p.x = cx + dx / d * m; p.z = cz + dz / d * m; }
    }
  }
  return p;
}
// gaya (emote) pemain: tombol 1-9, 0 atau tombol Gaya (HP). Berhenti saat bergerak.
const EMOTES = ['wave', 'sitDown', 'squat', 'phone', 'dance', 'salute', 'raiseHand', 'read', 'lie', 'clap', 'laugh', 'think', 'carry', 'bow', 'stretch'];
let emoteI = -1;
function emote(i) { if (ride) return; emoteI = i % EMOTES.length; player.emote = EMOTES[emoteI]; }

const npcs = [];
let fading = 0;
// KO: pingsan, dibawa pulang Om Darto (layar gelap, bangun di depan rumah)
function onKO() {
  fading = 1; ui.fade.style.opacity = 1;
  setTimeout(() => { if (ride) dismount(true); luar.unload(); player.zone = null; Object.assign(player, { x: SPAWN.x, z: SPAWN.z, vx: 0, vz: 0, area: 'kota', swim: null }); cam.x = player.x; cam.z = player.z; placeParked(); ui.fade.style.opacity = 0; fading = 0; toast('Kamu pingsan... Om Darto bawa kamu pulang. Latihan dulu biar kuat!'); }, 600);
}
const fight = makeFight({ player, raka, npcs, collision, riding: () => !!ride, toast, onKO: () => onKO(), save: () => { saveT = 99; } });
const shop = makeShop({ player, toast, fight });
const acts = makeActivities({ scene, kota, collision, player, Character, toast, npcs, gain: (k, x) => fight.gain(k, x), say: (n, text) => { if (n) n.say = { text, t: 2.5 }; } });
const story = makeStory({ player, toast: (...a) => toast(...a), shop, fight, acts });   // alur bab, misi wilayah, hati (guide 04 & 33)
const waktu = makeWaktu({ player, toast: (...a) => toast(...a) }); story.setWaktu(waktu);   // jam, siang-malam, kalender tahun ajaran
const kolam = makeKolam({ scene, player, Character, fight, shop, toast, getCam: () => cam });   // kolam lomba GOR: balap renang & loncat indah
const interiors = makeInteriors({ scene, kota, collision, player, Character, npcs, shop, acts, fight, toast, kolam });
interiors.locate();
const jajan = makeJajan({ scene, kota, collision, player, Character, npcs, shop, acts, toast });
const animals = makeAnimals({ scene, kota, collision, player, toast });
// wilayah luar kota (guide 86): area terpisah, dimuat satu-satu lewat travel
const luar = makeLuar({ scene, collision, player, Character, npcs });
if (player.area === 'luar') { if (luar.ZONES.some(Z => Z.id === player.zone)) luar.load(player.zone); else Object.assign(player, { x: SPAWN.x, z: SPAWN.z, area: 'kota' }); }
placeParked();
if (player.area === 'dalam' && !interiors.cur) Object.assign(player, { x: SPAWN.x, z: SPAWN.z, area: 'kota' });
// reset posisi (tombol menu / R): kalau nyangkut di air, tembok, atau peta berubah, balik ke depan rumah Om Darto
function resetPos(msg = 'Balik ke depan rumah Om Darto') {
  if (race.active) return;
  if (ride) dismount(true);
  acts.cancel?.(); shop.close();
  luar.unload(); player.zone = null;
  Object.assign(player, { x: SPAWN.x, z: SPAWN.z, vx: 0, vz: 0, area: 'kota', swim: null, gy: 0 }); interiors.locate();
  cam.x = player.x; cam.z = player.z; toast(msg); saveT = 99;
}
// lepas otomatis saat dimuat: posisi simpanan lama bisa jatuh di air (kolam diperbesar) atau di dalam tembok/bangunan baru
if (player.area === 'kota') {
  const p = collision.resolve({ x: player.x, z: player.z }, 0.3), moved = Math.hypot(p.x - player.x, p.z - player.z);
  if (collision.blockedMask(player.x, player.z) && !player.swim) { if (kota.M.waterAt(player.x, player.z)) player.swim = 'air'; else { player.x = SPAWN.x; player.z = SPAWN.z; } }
  else if (moved > 0.6) { player.x = SPAWN.x; player.z = SPAWN.z; } else { player.x = p.x; player.z = p.z; }
}
onCharsReady(() => {
  preload(HERO, ['idle', 'walk', 'run'], 10);
  const byRegion = {};
  for (const h of kota.houses) if (!h.special && !h.noHome) (byRegion[h.region] || (byRegion[h.region] = [])).push(h);
  NPCS.forEach((n, idx) => {
    let home;
    const H = n.home;
    if (H === 'darto' && kota.darto) { const ct = kota.darto.cart, [x, z] = n.sid === 'omDarto' && ct ? L(kota.darto.xf, ct.lx - 0.2, ct.lz - 0.9) : L(kota.darto.xf, n.dx, n.dz); home = { x, z }; }
    else if (H === 'minimarket') { const h = kota.houses.find(h => h.type === 'MM' && h.region === 'pusat') || kota.houses.find(h => h.type === 'MM'); if (h) { const [x, z] = L(h.xf, 0.6, h.d / 2 + 1.2); home = { x, z }; } }
    else if (H === 'musala') { const h = kota.houses.find(h => h.special === 'musala'); if (h) { const [x, z] = L(h.xf, 1.5, 3.6); home = { x, z }; } }
    else if (H.house) { const arr = byRegion[H.house] || []; const h = arr[H.n % Math.max(1, arr.length)]; if (h) { const [x, z] = L(h.xf, 0.6, h.d / 2 + (h.yard ? 1.6 : 0.7)); home = { x, z }; } }
    else if (H.school) home = { x: SCHOOL_OX + H.x, z: H.z };
    else if (n.name === 'Pak Satpam Bambang' && kota.posSatpam) home = { ...kota.posSatpam };
    else home = { x: H.x, z: H.z };
    if (!home) return;
    const c = new Character(n.sid, { name: n.name }); scene.add(c.group);
    const p = collision.resolve({ x: home.x, z: home.z }, 0.3);
    home = { x: p.x, z: p.z };
    npcs.push({ ...n, key: 'n' + idx, name: n.name || styleName(n.sid), c, home, x: p.x, z: p.z, tx: p.x, tz: p.z, wait: Math.random() * 3, heading: Math.random() * 6, say: null, greetT: 0 });
    preload(c.vsid, ['idle'], 1);
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
  // pejalan kaki: menyusuri trotoar jalan raya bolak-balik, sesekali berhenti (tidak turun ke badan jalan)
  const WSIDS = ['ibuHijab', 'bapakPeci', 'mbak', 'pemuda', 'ibuDaster', 'kakek', 'remaja', 'ibuHijab2', 'ojol', 'anakSD', 'pakRT', 'anakSDcw'];
  const WNAMES = ['Bu Wati', 'Pak Joko', 'Mbak Sinta', 'Mas Dani', 'Bu Enok', 'Mbah Karso', 'Dewi', 'Bu Lilis', 'Bang Ojol', 'Fikri', 'Pak Hadi', 'Nisa', 'Bu Tarmi', 'Pak Usman', 'Mbak Ayu', 'Mas Rendi', 'Bu Iyem', 'Kakek Sabar'];
  const WLINES = ['Mau ke pasar, Dek.', 'Panas banget hari ini, ya.', 'Jalan kaki aja, sehat.', 'Hati-hati nyebrang, Dek.', 'Nunggu angkot lewat.', 'Abis dari bank, antre panjang.', 'Lewat trotoar aja, jalan raya rame.'];
  const walkExt = (n, dt) => {
    const pdx = player.x - n.x, pdz = player.z - n.z;
    if (n.stopT > 0 || pdx * pdx + pdz * pdz < 0.5) { n.stopT -= dt; n.anim = n.stopT > 0 ? n.idleA : 'idle'; return; }
    const tgt = n.path[n.k + n.dir];
    if (!tgt) { n.dir *= -1; n.stopT = 1 + Math.random() * 3; n.idleA = pick3(['idle', 'look', 'phone', 'idle']); return; }
    const dx = tgt.x - n.x, dz = tgt.z - n.z, d = Math.hypot(dx, dz), st = n.spd * dt;
    if (d <= st) { n.x = tgt.x; n.z = tgt.z; n.k += n.dir; if (Math.random() < 0.012) { n.stopT = 2 + Math.random() * 4; n.idleA = pick3(['look', 'phone', 'idle', 'stretch']); } }
    else { n.x += dx / d * st; n.z += dz / d * st; n.heading = Math.atan2(dz, dx); }
    n.anim = 'walk';
  };
  const WP = (kota.walkPaths || []).slice().sort((a, b) => b.length - a.length), used = [];
  let wi = 0;
  for (const path of WP) {
    if (wi >= 18) break;
    const mid = path[path.length >> 1]; if (used.some(u => Math.hypot(u.x - mid.x, u.z - mid.z) < 14)) continue; used.push(mid);
    for (let r = 0; r < (path.length > 70 ? 2 : 1) && wi < 18; r++, wi++) {
      const sid = WSIDS[wi % WSIDS.length], c = new Character(sid); scene.add(c.group);
      const k = Math.floor((r + 0.3 + Math.random() * 0.4) / 2 * path.length) % path.length, p = path[k];
      npcs.push({ sid, name: WNAMES[wi % WNAMES.length], filler: true, lines: [WLINES[wi % WLINES.length], WLINES[(wi * 3 + 2) % WLINES.length]], roam: 0, key: 'w' + wi, c, home: { x: p.x, z: p.z }, x: p.x, z: p.z, tx: p.x, tz: p.z, wait: 0, heading: 0, say: null, greetT: Math.random() * 10,
        path, k, dir: Math.random() < 0.5 ? 1 : -1, spd: sid === 'kakek' ? 0.7 : 0.95 + Math.random() * 0.3, stopT: Math.random() * 2, idleA: 'idle', ext: walkExt });
    }
  }
});

/* ------------------------------------------------------------------ input */
const keys = new Set();
addEventListener('keydown', e => {
  if (e.repeat) { if (!['KeyQ', 'KeyE'].includes(e.code)) return; }
  keys.add(e.code);
  const sh = e.shiftKey;
  if (e.code === 'KeyF' || e.code === 'KeyJ') { if (!acts.action()) fight.attack('A', sh); }
  if (e.code === 'KeyK') fight.attack('B', sh);
  if (e.code === 'KeyR') resetPos();
  if (e.code === 'KeyL') fight.dodge(true);
  if (e.code === 'KeyI') fight.grab();
  if (e.code === 'KeyT') fight.taunt();
  if (e.code === 'KeyU') toggleStatus();
  if (e.code === 'KeyB') story.toggle();
  if (e.code === 'KeyQ') rotateCam(-1);
  if (e.code === 'KeyE') rotateCam(1);
  if (e.code === 'KeyC') toggleFollow();
  if (e.code === 'Escape' && shop.isOpen) shop.close(); else if (e.code === 'Escape' && $('status').style.display === 'block') toggleStatus();
  else if (e.code === 'KeyM' || (e.code === 'Escape' && bigmap.isOpen)) bigmap.toggle();
  if (e.code === 'KeyN') toggleMinimap();
  if (e.code === 'KeyV') cyclePitch();
  const dg = /^Digit(\d)$/.exec(e.code); if (dg) emote((+dg[1] + 9) % 10);
  if (e.code === 'Space' || e.code === 'Enter') { acts.setHold(true); act(); e.preventDefault(); }
  if (e.code === 'Equal' || e.code === 'NumpadAdd') zoom(-1);
  if (e.code === 'Minus' || e.code === 'NumpadSubtract') zoom(1);
});
addEventListener('keyup', e => { keys.delete(e.code); if (e.code === 'Space' || e.code === 'Enter') acts.setHold(false); if (e.code === 'KeyL') fight.dodge(false); });
addEventListener('blur', () => keys.clear());

const joy = { x: 0, y: 0, id: null, ox: 0, oy: 0 };
const cam = { yaw: saved?.yaw ?? 0.6, yawT: saved?.yaw ?? 0.6, dist: ZOOMS[opt.zoom], distT: ZOOMS[opt.zoom], pitch: PITCHES[opt.pitch], pitchT: PITCHES[opt.pitch], x: player.x, z: player.z, manualT: 0 };
// balap liar drag Jl. Lingkar Selatan (guide 87). Kena razia: denda, motor ditahan di halaman Polsek, pemain diantar ke sana.
const race = makeRace({ scene, kota, collision, player, Character, makeRide, npcs, shop, fight, toast, cam, jajan, onCaught: fine => {
  fading = 1; ui.fade.style.opacity = 1;
  setTimeout(() => {
    const pol = kota.houses.find(h => h.named === 'polsek'), at = (lx, lz) => { const [x, z] = pol ? L(pol.xf, lx, pol.d / 2 + lz) : [SPAWN.x, SPAWN.z]; return collision.resolve({ x, z }, 0.35); };
    if (ride) dismount(true);
    const m = at(1.2, 1.1); garage.spot[2] = { x: m.x, z: m.z, h: pol ? pol.xf.a + Math.PI / 2 : 0, area: 'kota' };
    const p = at(-0.8, 1.6); Object.assign(player, { x: p.x, z: p.z, vx: 0, vz: 0, area: 'kota', swim: null });
    cam.x = player.x; cam.z = player.z; placeParked(); ui.fade.style.opacity = 0; fading = 0; saveT = 99;
    toast(`Kena razia! Denda ${shop.rp(fine)}, motor ditahan di Polsek. Om Darto pasti marah...`);
  }, 600);
} });
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
tap($('btnAct'), () => { acts.setHold(true); act(); }); $('btnAct').addEventListener('pointerup', () => acts.setHold(false)); $('btnAct').addEventListener('pointercancel', () => acts.setHold(false)); tap($('btnHit'), () => { if (!acts.action()) fight.attack('A', player.fx.nyali >= 100); }); tap($('btnKick'), () => fight.attack('B')); tap($('btnGrab'), () => fight.grab()); tap($('btnDodge'), () => fight.dodge(true)); for (const ev of ['pointerup', 'pointercancel']) $('btnDodge').addEventListener(ev, () => fight.dodge(false)); tap($('btnStatus'), () => toggleStatus()); tap($('btnJurnal'), () => story.toggle()); tap($('btnReset'), () => resetPos()); tap($('btnRide'), () => bigmap.toggle()); tap($('btnBigMap'), () => bigmap.toggle()); tap(ui.mapWrap, () => bigmap.open()); tap($('btnEmote'), () => emote(emoteI + 1));
const menu = $('menu'); menu.classList.toggle('closed', isTouch);
tap($('btnMenu'), () => menu.classList.toggle('closed'));
tap(ui.run, () => { ui.run.classList.toggle('on'); player.run = ui.run.classList.contains('on'); });
tap($('btnL'), () => rotateCam(-1)); tap($('btnR'), () => rotateCam(1));
tap(ui.follow, toggleFollow); tap($('btnPitch'), cyclePitch); $('btnPitch').textContent = 'Sudut: ' + PITCH_NAMES[opt.pitch]; tap($('btnMap'), toggleMinimap);
tap($('btnZoomIn'), () => zoom(-1)); tap($('btnZoomOut'), () => zoom(1));
tap(ui.quality, () => { opt.quality = (opt.quality + 1) % 3; applyQuality(); ui.quality.textContent = 'Grafik: ' + QUALITY[opt.quality].name; });
tap($('btnHero'), () => {   // ganti tokoh pemain: simpan pilihan lalu muat ulang
  opt.hero = HERO === 'rani' ? 'raka' : 'rani'; saveT = 99; tick0save(); location.reload();
});
$('btnHero').textContent = 'Tokoh: ' + (HERO === 'rani' ? 'Rani' : 'Raka');
tap($('btnPx'), () => { opt.px = opt.px >= 5 ? 0 : (opt.px || 0) + 1; /* auto -> 1 (halus, resolusi penuh) -> 2 ... 5 -> auto */ resize(); $('btnPx').textContent = 'Pixel: ' + (opt.px || 'auto'); });
ui.quality.textContent = 'Grafik: ' + QUALITY[opt.quality].name; $('btnPx').textContent = 'Pixel: ' + (opt.px || 'auto');
const bigmap = makeBigMap({ kota, player, isTouch, parked: () => RIDES.flatMap((R, i) => R && R.holder.visible && player.area === 'kota' ? [{ x: garage.spot[i].x, z: garage.spot[i].z, icon: i === 1 ? 'S' : 'M' }] : []) });
{ const bmOpen = bigmap.open; bigmap.open = () => player.area === 'luar' ? toast('Peta besar baru ada untuk kota. Di luar kota pakai minimap & halte.') : bmOpen(); }
// panel status diri: Kekuatan / Kelincahan / Nyali, reputasi, dan peta kekuatan lawan (guide 70 "Upgrade diri")
const statusEl = $('status');
const NEEDXP = lv => 6 + lv * 6;
const STAT_INFO = { kekuatan: ['Kekuatan', 'pukulan lebih sakit, nyawa lebih banyak · latihan samsak, menang berantem'], kelincahan: ['Kelincahan', 'serangan lebih cepat · main bola/basket, tangkis tepat'], nyali: ['Nyali', 'tahan gertakan · menang lawan berat, kunci lengan'] };
const verdict = lv => { const k = player.stats.kekuatan; return lv >= k + 3 ? ['Masih berat', 'lvHard'] : lv >= k + 1 ? ['Seimbang', 'lvEven'] : ['Bisa dikalahkan', 'lvEasy']; };
function renderStatus() {
  const st = player.stats; let h = '<button class="x">✕</button><h3>Status Raka</h3>';
  for (const [k, [nm, how]] of Object.entries(STAT_INFO)) h += `<div class="sr"><b>${nm} ${st[k]}</b><span class="sb"><i style="width:${st[k] >= 10 ? 100 : Math.min(100, st[k + 'Xp'] / NEEDXP(st[k]) * 100)}%"></i></span></div><div style="font-size:11px;opacity:.75;margin:-3px 0 4px">${how}</div>`;
  h += `<div>Nyawa maks: <b>${fight.maxHP()}</b> · Reputasi: <b>${st.rep >= 0 ? '+' : ''}${st.rep}</b></div>`;
  const seen = new Map(); for (const n of npcs) { const p = fight.STRENGTH[n.sid]; if (p && !n.ext && !seen.has(n.sid)) seen.set(n.sid, { name: p.boss || n.name, p }); }
  h += '<table><tr><td><b>Lawan</b></td><td><b>Lv</b></td><td><b>Tipe</b></td><td></td></tr>' + [...seen.values()].sort((a, b) => a.p.lv - b.p.lv).map(({ name, p }) => { const [v, c] = verdict(p.lv); return `<tr><td>${name}</td><td>${p.lv}</td><td>${p.type}</td><td style="font-weight:bold;color:${c === 'lvHard' ? '#c0392b' : c === 'lvEven' ? '#b07a00' : '#2a8a3a'}">${v}</td></tr>`; }).join('') + '</table>';
  h += '<p style="font-size:11px;margin:8px 0 0">Pukul (J/F) · Tendang (K) · Hindar (L, tahan = tangkis, tepat waktu = parry) · Pegang (I, lawan pusing = kunci lengan) · Provokasi (T) · Nyali penuh: Shift+J / tombol JURUS.<br>Combo: A-A-A-B Bel Pulang, A-A-B Ojek Lewat, A-B Sapu Pasar, B-B Angkot Ngerem.</p>';
  statusEl.innerHTML = h; statusEl.querySelector('.x').addEventListener('pointerdown', e => { e.stopPropagation(); toggleStatus(); });
}
function toggleStatus() { const on = statusEl.style.display !== 'block'; statusEl.style.display = on ? 'block' : 'none'; if (on) renderStatus(); }
statusEl.addEventListener('pointerdown', e => e.stopPropagation());
let toastT = 0;
function toast(t) { ui.toast.textContent = t; ui.toast.style.opacity = 1; toastT = 2.2; }

/* ------------------------------------------------------------------ interaksi */
const ENTER_SCHOOL = { x: 109 + kota.smaShift.x, z: 63.5 + kota.smaShift.z };   // depan gerbang SMA 3 di peta kota
const EXIT_SCHOOL = { x: SCHOOL_OX + 39, z: 58.2 };   // trotoar depan gerbang (guide 83)
let target = null;
function findTarget() {
  let best = null, bd = 1e9;
  if (kolam.active) return kolam.target();
  if (ride || race.active) {
    const rt = race.target(ride); if (rt) return rt;
    if (player.area === 'kota' && Math.hypot(player.x - ENTER_SCHOOL.x, player.z - ENTER_SCHOOL.z) < 3.2) return { kind: 'go', to: 'sekolah', label: 'Parkir & masuk SMA Negeri 3' };
    if (!race.active && (player.area === 'kota' || player.area === 'luar')) { const lt = luar.target(player.area, player.x, player.z); if (lt && lt.kind === 'travel') return lt; }
    return { kind: 'park', label: 'Turun & parkir' };
  }
  const at = acts.target(), it = interiors.target() || jajan.target() || animals.target();
  if (at && at.kind === 'act' && !at.label.startsWith('Duduk')) return at;
  if (it) return it;
  for (const [i, R] of RIDES.entries()) if (R && R.holder.visible) { const sp = garage.spot[i], d = Math.hypot(sp.x - player.x, sp.z - player.z); if (d < 1.4 && d < bd) { bd = d; best = { kind: 'ride', i, label: 'Naik ' + R.name.toLowerCase() }; } }
  if (best) return best;
  for (const n of npcs) { const d = Math.hypot(n.x - player.x, n.z - player.z); if (d < 1.9 && d < bd) { bd = d; best = { kind: 'npc', n, label: 'Ngobrol: ' + n.name }; } }
  if (best) return story.npcTarget(best.n) || best;
  if (at) return at;
  if (player.area === 'kota' || player.area === 'luar') { const lt = luar.target(player.area, player.x, player.z); if (lt) return lt; }
  if (player.area === 'kota') for (const [key, label] of [['terminal', 'Terminal: naik bus/angkot ke luar kota'], ['stasiun', 'Stasiun: naik kereta ke Pesisir Lintang']]) {
    const b = kota.specials?.[key]; if (b && Math.hypot(b.x - player.x, b.y - player.z) < Math.max(b.w, b.h) / 2 + 3) return { kind: 'menu', from: key, label };
  }
  if (player.area === 'kota') {
    if (Math.hypot(player.x - ENTER_SCHOOL.x, player.z - ENTER_SCHOOL.z) < 3.2) return { kind: 'go', to: 'sekolah', label: 'Masuk SMA Negeri 3' };
    for (const m of kota.marks) if (Math.hypot(m.x - player.x, m.y - player.z) < 3.5) return { kind: 'info', label: m.name, desc: m.desc };
  } else if (Math.hypot(player.x - EXIT_SCHOOL.x, player.z - EXIT_SCHOOL.z) < 3) return { kind: 'go', to: 'kota', label: 'Keluar ke kota (Jl. Merdeka)' };
  return null;
}
function act() {
  if (!target || fading) return;
  if (target.kind === 'act') { target.fn(); return; }
  if (target.kind === 'warp') { const t = target; fading = 1; ui.fade.style.opacity = 1; setTimeout(() => { Object.assign(player, t.to, { vx: 0, vz: 0, swim: null }); t.after?.(); cam.x = player.x; cam.z = player.z; if (t.to.area === 'dalam') { cam.saveDist ??= cam.distT; cam.distT = cam.dist = Math.min(cam.distT, ZOOMS[1]); } else if (cam.saveDist) { cam.distT = cam.saveDist; cam.saveDist = null; } placeParked(); ui.fade.style.opacity = 0; fading = 0; }, 380); return; }
  if (target.kind === 'swim') { player.swim = 'air'; player.x = target.x; player.z = target.z; toast('Byur! Berenang (jalan ke tepi untuk naik)'); return; }
  if (target.kind === 'go2') { const to = target.to; fading = 1; ui.fade.style.opacity = 1; setTimeout(() => { Object.assign(player, { x: to.x, z: to.z, vx: 0, vz: 0 }); cam.x = player.x; cam.z = player.z; ui.fade.style.opacity = 0; fading = 0; toast('Sampai di seberang. Bayar 2 ribu ke tukang rakit.'); }, 450); return; }
  if (target.kind === 'travel') { travel({ ...target.to, keepRide: true }); return; }
  if (target.kind === 'halte') { travelMenu(target.zone.id); return; }
  if (target.kind === 'menu') { travelMenu(target.from); return; }
  if (target.kind === 'ride') { mount(target.i); return; }
  if (target.kind === 'park') { dismount(); return; }
  if (target.kind === 'npc') {
    if (target.n.mood) return;
    const n = target.n, lines = n.lines || LINES[n.linesKey || (n.filler ? n.name : n.sid)] || ['Halo!'];
    if (n.sid === 'omDarto' && player.flags?.omMarah) { player.flags.omMarah = false; n.say = { text: 'Raka! Balap liar lagi?! Om udah bilang, jalan lingkar itu bukan sirkuit. Om pernah lihat sendiri akibatnya...', t: 5 }; n.heading = Math.atan2(player.z - n.z, player.x - n.x); n.wait = 5; return; }
    const sv = story.talk(n);
    n.say = { text: sv || lines[n.line = ((n.line ?? -1) + 1) % lines.length], t: 3.5 };
    n.heading = Math.atan2(player.z - n.z, player.x - n.x); n.wait = 4; n.tx = n.x; n.tz = n.z;
  } else if (target.kind === 'go') {
    fading = 1; ui.fade.style.opacity = 1;
    setTimeout(() => {
      if (ride) dismount(true);
      if (target.to === 'sekolah') Object.assign(player, { x: EXIT_SCHOOL.x, z: EXIT_SCHOOL.z - 4.2, heading: -Math.PI / 2, area: 'sekolah' });
      else Object.assign(player, { x: ENTER_SCHOOL.x, z: ENTER_SCHOOL.z + 1.5, heading: Math.PI / 2, area: 'kota' });
      cam.x = player.x; cam.z = player.z; cam.yaw = cam.yawT = 0; placeParked();
      ui.fade.style.opacity = 0; fading = 0;
    }, 350);
  } else toast(target.desc);
}

/* ------------------------------------------------------------------ travel ke wilayah luar */
// t: { zone ('kota' | id wilayah), x, z (koordinat peta dunia), h, keepRide, cost, msg }
function travel(t) {
  if (fading) return;
  if (t.zone !== 'kota') { const g = story.zoneOpen(t.zone); if (!g.ok) { toast(`Wilayah ini baru terbuka di Bab ${g.bab} (mode cerita). Cek Jurnal (B).`); return; } }
  if (t.cost) { if ((player.uang || 0) < t.cost) { toast('Uangnya kurang buat ongkos...'); return; } player.uang -= t.cost; shop.showMoney(); }
  fading = 1; ui.fade.style.opacity = 1; if (t.zone !== 'kota') { ui.loading.textContent = 'Dalam perjalanan…'; ui.loading.style.display = ''; }
  setTimeout(() => {
    const keep = t.keepRide && ride;
    if (ride && !keep) dismount(true);
    acts.cancel?.();
    if (t.zone === 'kota') { luar.unload(); player.zone = null; Object.assign(player, { area: 'kota', x: t.x, z: t.z }); }
    else { luar.load(t.zone); Object.assign(player, { area: 'luar', zone: t.zone, x: t.x, z: t.z + luar.LZ }); }
    Object.assign(player, { heading: t.h ?? player.heading, vx: 0, vz: 0, swim: null, gy: undefined });
    const p = collision.resolve({ x: player.x, z: player.z }, 0.3); player.x = p.x; player.z = p.z;
    cam.x = player.x; cam.z = player.z; placeParked(); ui.loading.style.display = 'none'; ui.fade.style.opacity = 0; fading = 0; saveT = 99;
    toast(t.msg || 'Sampai: ' + (t.zone === 'kota' ? 'Kota Wirabumi' : luar.cur.name)); if (t.zone !== 'kota') story.ev('zone', t.zone);
  }, 450);
}
// titik turun di kota: depan terminal / stasiun
function townStop(key) {
  const b = kota.specials?.[key]; if (!b) return { x: SPAWN.x, z: SPAWN.z, h: 0 };
  for (const d of [2.5, 3.5, 4.5]) { const [x, z] = L({ x: b.x, z: b.y, a: b.a }, 0, b.h / 2 + d), p = collision.resolve({ x, z }, 0.3); if (Math.hypot(p.x - x, p.z - z) < 0.3) return { x, z, h: b.a + Math.PI / 2 }; }
  const [x, z] = L({ x: b.x, z: b.y, a: b.a }, 0, b.h / 2 + 2.5); return { x, z, h: 0 };
}
function travelMenu(from) {
  const items = [], col = { Angkot: '#8ac8e0', Bus: '#e8a040', Ojek: '#3a9a5a', Kereta: '#c83a3a' };
  if (from === 'kota' || from === 'terminal' || from === 'stasiun') {
    for (const Z of luar.ZONES) { if ((from === 'stasiun') !== (Z.mode === 'Kereta')) continue;
      items.push([Z.name, Z.fare, { desc: Z.mode + ' · turun di halte', btn: 'Naik', fn: () => travel({ zone: Z.id, x: Z.stop.x, z: Z.stop.z, h: Z.stop.h, cost: Z.fare, msg: `Naik ${Z.mode.toLowerCase()}... sampai di ${Z.name}` }) }, col[Z.mode]]); }
    shop.open({ title: from === 'stasiun' ? 'Stasiun Wirabumi' : 'Terminal Wirabumi', sub: from === 'stasiun' ? 'Kereta lokal ke pesisir' : 'Bus, angkot & ojek pangkalan ke luar kota', items });
  } else {
    const Z = luar.ZONES.find(z => z.id === from), back = Z.mode === 'Kereta' ? 'stasiun' : 'terminal', s = townStop(back);
    items.push(['Pulang ke kota (' + (back === 'stasiun' ? 'Stasiun' : 'Terminal') + ' Wirabumi)', Z.fare, { desc: Z.mode, btn: 'Naik', fn: () => travel({ zone: 'kota', x: s.x, z: s.z, h: s.h, cost: Z.fare, msg: 'Sampai lagi di Kota Wirabumi' }) }, col[Z.mode]]);
    shop.open({ title: 'Halte ' + Z.name, sub: 'Angkutan pulang ke kota', items });
  }
}

/* ------------------------------------------------------------------ minimap */
const mctx = ui.map.getContext('2d');
function drawMinimap() {
  const S = 132, sc = 3;   // 3 piksel per petak di minimap
  if (player.area === 'dalam') { mctx.fillStyle = '#2a2420'; mctx.fillRect(0, 0, S, S); mctx.fillStyle = '#fffbe8'; mctx.font = 'bold 13px Trebuchet MS'; mctx.textAlign = 'center'; mctx.fillText('di dalam', S / 2, S / 2 - 6); mctx.fillText(interiors.cur?.name || '', S / 2, S / 2 + 12); return; }
  const LM = player.area === 'luar' && luar.map, inK = player.area === 'kota', img = LM ? LM.img : inK ? kota.groundTex : sekolah.groundTex, ox = LM ? LM.ox : inK ? 0 : SCHOOL_OX + sekolah.gx0, oz = LM ? LM.oz : inK ? 0 : sekolah.gz0;
  const k = LM ? LM.k : img.width / (inK ? 260 : sekolah.gw);
  mctx.save(); mctx.fillStyle = '#9ab878'; mctx.fillRect(0, 0, S, S);
  mctx.translate(S / 2, S / 2); mctx.rotate(cam.yaw);
  mctx.imageSmoothingEnabled = false;
  mctx.drawImage(img, (player.x - ox) * k - S / sc / 2 * k * 1.5, (player.z - oz) * k - S / sc / 2 * k * 1.5, S / sc * k * 1.5, S / sc * k * 1.5, -S * 0.75, -S * 0.75, S * 1.5, S * 1.5);
  mctx.fillStyle = '#ffd84a';
  for (const n of npcs) { const dx = (n.x - player.x) * sc, dz = (n.z - player.z) * sc; if (Math.abs(dx) < S && Math.abs(dz) < S) mctx.fillRect(dx - 1.5, dz - 1.5, 3, 3); }
  if (player.area === 'luar') { mctx.fillStyle = '#e04040'; for (const m of luar.marks) { const dx = (m.x - player.x) * sc, dz = (m.z + luar.LZ - player.z) * sc; if (Math.abs(dx) < S && Math.abs(dz) < S) mctx.fillRect(dx - 2, dz - 2, 4, 4); } }
  if (player.area === 'kota') { mctx.fillStyle = '#e04040'; for (const m of kota.marks) { const dx = (m.x - player.x) * sc, dz = (m.y - player.z) * sc; if (Math.abs(dx) < S && Math.abs(dz) < S) mctx.fillRect(dx - 2, dz - 2, 4, 4); } }
  mctx.rotate(player.heading); mctx.fillStyle = '#fff'; mctx.strokeStyle = '#000'; mctx.lineWidth = 1;
  mctx.beginPath(); mctx.moveTo(6, 0); mctx.lineTo(-4, -4); mctx.lineTo(-2, 0); mctx.lineTo(-4, 4); mctx.closePath(); mctx.fill(); mctx.stroke();
  mctx.restore();
}

/* ------------------------------------------------------------------ update */
const tmp = { x: 0, z: 0 };
var saveT = 0;
function updatePlayer(dt) {
  let ix = 0, iy = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) iy -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) iy += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
  ix += joy.x; iy += joy.y;
  { const l0 = Math.hypot(ix, iy), fx0 = -Math.sin(cam.yaw), fz0 = -Math.cos(cam.yaw), rx0 = Math.cos(cam.yaw), rz0 = -Math.sin(cam.yaw);
    player.inMove = l0 > 0.15; const wx0 = fx0 * -iy + rx0 * ix, wz0 = fz0 * -iy + rz0 * ix, wl = Math.hypot(wx0, wz0);
    player.inDir = player.inMove && wl > 1e-3 ? { x: wx0 / wl, z: wz0 / wl } : null; }
  if (race.active) {   // balap drag: posisi & laju diatur race.js, input cuma tombol Aksi
    const r = race.step(dt), RD = RIDES[ride];
    if (r) {
      player.vx = -r.v; player.vz = 0; raka.heading = player.heading;
      if (RD) { raka.play(RD.r.anim); RD.r.spin(r.v * dt); }
      player.gy = kota.groundY(player.x, player.z); raka.group.position.set(player.x, player.gy, player.z); raka.update(dt);
      return r.v;
    }
  }
  if (kolam.active) {   // mini game kolam: posisi, putaran & animasi diatur kolam.js
    const r = kolam.step(dt);
    if (r) {
      Object.assign(player, { x: r.x, z: r.z, heading: r.heading, vx: 0, vz: 0, gy: r.y, pitch: 0 }); raka.heading = r.heading; raka.play(r.anim); raka.sink = r.sink; raka.blob.visible = !r.sink && r.y < 0.6;
      raka.group.position.set(r.x, r.y, r.z); raka.group.rotation.order = 'YXZ'; raka.group.rotation.z = r.rot || 0; raka.update(dt);
      return r.speed || 0;
    }
  }
  const lock = player.area ? fight.updatePlayer(dt) : null;
  player.riding = !!ride;
  const inp = Math.hypot(ix, iy) > 0.15 && !bigmap.isOpen;
  const ac = acts.update(dt, inp);   // juga di sekolah: basket di lapangan SMA
  if (lock || bigmap.isOpen || ac.lock) { ix = 0; iy = 0; }
  let l = Math.hypot(ix, iy); if (l > 1) { ix /= l; iy /= l; l = 1; }
  const run = keys.has('ShiftLeft') || keys.has('ShiftRight') || player.run;
  const RD = RIDES[ride], swim = player.swim;
  const sp = (RD ? (run ? RD.run : RD.walk) * (1 + 0.1 * ((player.upg || {})[ride === 1 ? 'sepeda' : 'motor'] || 0)) : swim ? (run ? 2.3 : 1.5) : (run ? 4.6 : 2.1)) * Math.min(1, l * 1.3);
  // arah relatif kamera: atas layar = arah pandang kamera
  const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
  const wx = (fx * -iy + rx * ix), wz = (fz * -iy + rz * ix);
  const k = 1 - Math.exp(-dt * (swim ? 5 : 14));
  player.vx += (wx * sp - player.vx) * k; player.vz += (wz * sp - player.vz) * k;
  let np;
  if (swim === 'air') {   // berenang di kali/danau/curug: boleh bergerak di air, menepi = naik ke darat
    const raw = collision.resolve({ x: player.x + player.vx * dt, z: player.z + player.vz * dt }, 0.28);
    if (kota.M.waterAt(raw.x, raw.z)) np = raw;
    else if (!collision.blockedMask(raw.x, raw.z)) { np = raw; player.swim = null; toast('Naik ke darat, basah kuyup'); }
    else np = { x: player.x, z: player.z };
  } else np = collision.move(player, player.x + player.vx * dt, player.z + player.vz * dt, ride ? 0.32 : 0.28);
  if (ride) {   // kendaraan pemain: ujung depan & belakang ikut ditabrakkan, bukan cuma titik tengah
    const hl = RIDES[ride].r.half || 0.45, cx = Math.cos(player.heading), cz = Math.sin(player.heading);
    for (const sd of [1, -1]) { const f = { x: np.x + cx * hl * sd, z: np.z + cz * hl * sd }, g = collision.resolve({ ...f }, 0.26); np = { x: np.x + g.x - f.x, z: np.z + g.z - f.z }; }
    if (collision.blockedMask(np.x, np.z) || acts.poolAt(np.x, np.z)) np = { x: player.x, z: player.z };
  }
  if (player.area === 'luar' && luar.traffic) luar.traffic.push(np, ride ? 0.4 : 0.28);
  if (player.area === 'kota') { kota.traffic.push(np, ride ? 0.4 : 0.28); if (ride) { const hl = RIDES[ride].r.half || 0.45, cx = Math.cos(player.heading), cz = Math.sin(player.heading); for (const sd of [1, -1]) { const f = { x: np.x + cx * hl * sd, z: np.z + cz * hl * sd }, g = kota.traffic.push({ ...f }, 0.25); np.x += g.x - f.x; np.z += g.z - f.z; } } }
  pushParked(np, ride ? 0.4 : 0.28);
  if (player.area === 'luar' && !luar.allowed(np.x, np.z)) np = luar.allowed(np.x, player.z) ? { x: np.x, z: player.z } : luar.allowed(player.x, np.z) ? { x: player.x, z: np.z } : { x: player.x, z: player.z };   // batas wilayah: keluar lewat jalan (Aksi)
  // kolam renang: masuk = langsung berenang, keluar = jalan lagi
  if ((player.area === 'kota' || player.area === 'dalam') && player.swim !== 'air') { const pool = !ride && acts.poolAt(np.x, np.z); if (pool && !player.swim) toast('Berenang di ' + pool.name.toLowerCase()); player.swim = pool ? 'kolam' : null; }
  // kecepatan nyata (supaya animasi berhenti saat menabrak dinding)
  if (dt > 0) { player.vx = (np.x - player.x) / dt; player.vz = (np.z - player.z) / dt; }
  player.x = np.x; player.z = np.z;
  const v = Math.hypot(player.vx, player.vz);
  if (l > 0.1) {
    const want = Math.atan2(wz, wx); let d = want - player.heading; d = Math.atan2(Math.sin(d), Math.cos(d));
    player.heading += d * Math.min(1, dt * (player.swim ? 6 : 14));
  }
  raka.heading = player.heading;
  if (l > 0.1 || player.swim) player.emote = null;
  // tenggelam sebagian saat berenang: badan di bawah permukaan air, kepala & bahu kelihatan
  const sw = player.swim, moveA = v > 0.3;
  raka.sink = sw ? (sw === 'air' ? 0.48 : 0) + (moveA ? 0.3 : 0.62) : 0; raka.blob.visible = !sw;
  if (RD) { raka.play(RD.r.anim); RD.r.spin(v * dt); }
  else if (sw) raka.play(moveA ? 'swim' : 'tread');
  else raka.play(lock || ac.anim || player.emote || (v > 3.2 ? 'run' : v > 0.35 ? 'walk' : 'idle'));
  { let gy = player.area === 'kota' && !player.swim ? kota.groundY(player.x, player.z) : player.area === 'luar' ? luar.groundY(player.x, player.z) : 0, pt = 0;
    if (RD) { const t = slopeAt(player.area, player.x, player.z, player.heading, RD.r.half || 0.45); gy = t.y; pt = t.pitch; }   // motor/sepeda ikut miring di tanjakan
    player.gy = (player.gy ?? gy) + (gy - (player.gy ?? gy)) * Math.min(1, dt * 18);
    player.pitch = (player.pitch || 0) + (pt - (player.pitch || 0)) * Math.min(1, dt * 14); }
  raka.group.position.set(player.x, player.gy, player.z); raka.group.rotation.order = 'YXZ'; raka.group.rotation.z = player.pitch;
  raka.update(RD ? (RD.r.type === 'sepeda' ? dt * Math.min(1.6, v / 2.5) : dt) : dt);
  if (RD) RD.r.syncCrank(raka);
  return v;
}

// variasi diam NPC: siswa main HP/ngobrol/baca, orang dewasa jongkok/peregangan, anak-anak joget; beberapa tokoh punya kebiasaan sendiri (guide)
const STUDENTS = new Set(['raka', 'rani', 'bimo', 'tegar', 'jojo', 'uti', 'nadia', 'sekar', 'laras', 'dimas', 'arga', 'rizal', 'bram', 'rio', 'kevin', 'sasha', 'siswaA', 'siswiA', 'siswiB', 'siswaB', 'paskibra', 'kirana', 'mei', 'andra', 'anakSTM', 'anakSTMgaul', 'anakSTMbengkel']);
const KIDS = new Set(['anakSD', 'anakSDcw', 'bocah', 'cici']);
const HABIT = { pakUjang: 'sweep', mei: 'read', rizal: 'read', jojo: 'phone', sekar: 'think', fajar: 'squat', satpam: 'salute', paskibra: 'salute', polisi: 'salute', kakek: 'squat', andra: 'think', laras: 'carry', bimo: 'laugh', tegar: 'read', pakGunadi: 'think', buRatna: 'read', anakSTM: 'talk', anakSTMgaul: 'phone', anakSTMbengkel: 'squat' };
const IDLES = { student: ['idle', 'idle', 'phone', 'talk', 'look', 'think', 'laugh', 'read', 'clap'], adult: ['idle', 'idle', 'look', 'phone', 'talk', 'squat', 'stretch', 'scratch'], kid: ['idle', 'look', 'dance', 'squat', 'wave', 'clap'] };
const pick3 = a => a[Math.floor(Math.random() * a.length)];
function pickIdle(n) {
  if (HABIT[n.sid] && Math.random() < 0.45) return HABIT[n.sid];
  const set = STUDENTS.has(n.sid) ? IDLES.student : KIDS.has(n.sid) ? IDLES.kid : IDLES.adult;
  return set[Math.floor(Math.random() * set.length)];
}
function updateNPC(n, dt) {
  const dx = n.x - player.x, dz = n.z - player.z, far = n.away || dx * dx + dz * dz > 70 * 70;   // away: tokohnya sedang dipakai di tempat lain (mis. balapan)
  n.c.group.visible = !far;
  if (far) return;
  if (fight.updateNPC(n, dt)) { n.galon = false; return; }   // berantem: galon Gilang ditaruh dulu
  if (n.ext) {   // NPC dengan perilaku sendiri (anak main bola): posisi & animasi diatur modulnya
    n.ext(n, dt); n.c.heading = n.heading; n.c.play(n.anim || 'idle'); n.c.sink = n.sink || 0; n.c.blob.visible = !n.sink;
    n.c.group.position.set(n.x, n.yAbs ?? (n.area === 'luar' ? luar.groundY(n.x, n.z) : kota.groundY(n.x, n.z)) + (n.dy || 0), n.z); n.c.update(dt);
    if (n.say) { n.say.t -= dt; if (n.say.t <= 0) n.say = null; }
    n.greetT -= dt;   // warga luar kota & pejalan kaki: sapa pemain yang lewat dekat
    if (n.filler && n.lines && !n.say && n.greetT <= 0 && dx * dx + dz * dz < 9) { n.say = { text: n.lines[Math.floor(Math.random() * n.lines.length)], t: 3 }; n.greetT = 30; }
    return;
  }
  n.wait -= dt;
  let moving = false;
  if (n.wait <= 0) {
    const tx = n.tx - n.x, tz = n.tz - n.z, d = Math.hypot(tx, tz);
    if (d < 0.2 && n.parkir) {   // tukang parkir: berhenti di satu titik deretan, kasih aba-aba, lalu pindah
      n.idle = pick3(['wave', 'wave', 'raiseHand', 'look', 'idle', 'phone']); n.wait = 2 + Math.random() * 4;
      const t = Math.random(), [a, b] = n.path; n.tx = a.x + (b.x - a.x) * t; n.tz = a.z + (b.z - a.z) * t;
      if (n.idle === 'wave' && !n.say && Math.random() < 0.35) n.say = { text: pick3(['Priiit! Kiri, kiri... terus!', 'Mundur, mundur... stop!', 'Ayo, ayo, masih muat!', 'Priit priiit!']), t: 2.2 };
    }
    else if (d < 0.2) { n.idle = pickIdle(n); if (n.sid === 'gilang') { n.galon = Math.random() < 0.6; if (n.galon) n.idle = 'galon'; }   // lagi nganter galon: galon di pundak
      n.wait = n.idle === 'idle' ? 2 + Math.random() * 5 : 5 + Math.random() * 8; const a = Math.random() * 6.28, r = Math.random() * (n.roam ?? 3); n.tx = n.home.x + Math.cos(a) * r; n.tz = n.home.z + Math.sin(a) * r; }
    else {
      const s = 1.1 * dt; const p = n.parkir ? { x: n.x + tx / d * s, z: n.z + tz / d * s } : collision.move(n, n.x + tx / d * s, n.z + tz / d * s, 0.26); if (!n.parkir) kota.traffic.push(p, 0.26);   // tukang parkir menyusup di sela motor
      if (Math.hypot(p.x - n.x, p.z - n.z) < s * 0.3) { n.tx = n.x; n.tz = n.z; }
      n.x = p.x; n.z = p.z; n.heading = Math.atan2(tz, tx); moving = true;
    }
  }
  // jangan tembus pemain
  const pd = Math.hypot(dx, dz); if (pd < 0.55 && pd > 1e-4) { n.x = player.x + dx / pd * 0.55; n.z = player.z + dz / pd * 0.55; }
  n.c.heading = n.heading; n.c.play(moving ? (n.galon ? 'galonWalk' : 'walk') : n.galon ? 'galon' : n.say && !n.filler ? 'talk' : n.idle || 'idle');
  n.c.group.position.set(n.x, !n.area || n.area === 'kota' ? kota.groundY(n.x, n.z) : n.area === 'luar' ? luar.groundY(n.x, n.z) : 0, n.z); n.c.update(dt);
  if (n.say) { n.say.t -= dt; if (n.say.t <= 0) n.say = null; }
  n.greetT -= dt;
  if (n.parkir && ride && !n.say && n.greetT <= 0 && Math.hypot(dx, dz) < 4) { n.say = { text: pick3(['Parkir sini, Mas! Aman!', 'Sini, sini, masih kosong!', 'Helmnya dititip sini aja, Mas.']), t: 3 }; n.greetT = 20; n.idle = 'wave'; n.wait = 3; }
  if (n.filler && !n.say && n.greetT <= 0 && Math.hypot(dx, dz) < 3) { const ls = n.lines || LINES[n.linesKey || n.name] || ['Halo!']; n.say = { text: ls[Math.floor(Math.random() * ls.length)], t: 3 }; n.greetT = 30; }
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
    if (n.say) show(n.key, n.x, 2.0, n.z, n.say.text, n.say.cls ? 'bubble ' + n.say.cls : n.filler ? 'bubble filler' : 'bubble');
    else if (d < 6) { const p = fight.STRENGTH[n.sid]; if (p && !n.ext) { const [, c] = verdict(p.lv); show(n.key, n.x, 1.85, n.z, `${n.name} · lv ${p.lv}`, 'tag ' + c); } else show(n.key, n.x, 1.85, n.z, n.name, n.filler ? 'tag filler' : 'tag'); }
  }
  for (const b of animals.bubbles()) show(b.key, b.x, b.y, b.z, b.text, 'bubble filler');
  for (const [k, el] of bubbleEls) if (!seen.has(k)) { el.remove(); bubbleEls.delete(k); }
}

let last = performance.now(), fpsAcc = 0, fpsN = 0, areaName = '';
function loop(now) {
  requestAnimationFrame(loop);
  const rdt = Math.min(0.05, (now - last) / 1000); last = now;
  const dt = rdt * fight.stopFactor(rdt);   // hit-stop: dunia membeku sebentar saat pukulan kena
  const v = updatePlayer(dt);
  for (const n of npcs) updateNPC(n, dt);
  kota.traffic.update(dt, player);
  if (player.area === 'luar') luar.traffic?.update(dt, player);
  kota.portal?.update(dt, player, kota.traffic.cars, !!ride);
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
  cam.y = (cam.y ?? 0) + ((player.gy || 0) - (cam.y ?? 0)) * lk;   // ikut naik-turun kontur tanah
  camera.position.set(cam.x + Math.sin(cam.yaw) * cp, Math.sin(cam.pitch) * dist + 0.8 + cam.y, cam.z + Math.cos(cam.yaw) * cp);
  camera.lookAt(cam.x, 0.8 + cam.y, cam.z);
  { const sk = fight.shake(rdt); if (sk) { camera.position.x += (Math.random() - 0.5) * sk; camera.position.y += (Math.random() - 0.5) * sk; } }
  scene.fog.near = dist * 2.6; scene.fog.far = dist * 2.6 + 50;
  // matahari ikut pemain, dibulatkan ke grid texel bayangan supaya tidak berkedip
  waktu.update(dt, !!fading);
  const sunOff = player.area === 'dalam' ? { dx: 22, dy: 45, dz: 14 } : waktu.light({ scene, hemi, sun, sky: SKYNOW });
  {
    const q = QUALITY[opt.quality], step = (q.ext * 2) / (q.shadow || 1024);
    const sx = Math.round(cam.x / step) * step, sz = Math.round(cam.z / step) * step;
    sun.target.position.set(sx, 0, sz); sun.position.set(sx + sunOff.dx, sunOff.dy, sz + sunOff.dz);
  }
  jajan.update(dt); animals.update(dt); race.update(dt); kolam.update(dt); story.update(dt);
  const inside = player.area === 'dalam';
  if (inside !== wasInside) { wasInside = inside; if (inside) { scene.background = DARKBG; scene.fog.color.copy(DARKBG); hemi.intensity = 1.9; hemi.color.set('#e6efff'); sun.intensity = 2.1; sun.color.set('#fff1d6'); } }
  if (inside) { scene.fog.near = 60; scene.fog.far = 140; interiors.update(camera); }
  renderer.render(scene, camera);
  // HUD
  target = findTarget();
  ui.prompt.style.display = target ? '' : 'none';
  if (target) ui.prompt.textContent = (isTouch ? '' : '[Spasi] ') + target.label;
  const an = player.area === 'kota' ? kota.regionAt(player.x, player.z) : player.area === 'luar' ? luar.nameAt(player.x, player.z) : player.area === 'dalam' ? (interiors.cur?.name || '') : sekolah.zoneAt(player.x, player.z);
  if (an !== areaName) { areaName = an; ui.area.textContent = an; }
  drawBubbles();
  if (isTouch) { const sp = player.fx.nyali >= 100, b = $('btnHit'); if (b.classList.contains('on') !== sp) { b.classList.toggle('on', sp); b.textContent = sp ? 'JURUS' : 'Pukul'; } }
  bigmap.update(dt);
  if (opt.minimap) drawMinimap();
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) ui.toast.style.opacity = 0; }
  fpsAcc += dt; fpsN++;
  if (fpsAcc > 0.5) { ui.fps.textContent = `${Math.round(fpsN / fpsAcc)} fps · ${renderer.info.render.calls} draw · ${renderer.domElement.width}x${renderer.domElement.height}`; fpsAcc = 0; fpsN = 0; }
  saveT += dt;
  if (saveT > 4) { saveT = 0; tick0save(); }
}

// kendaraan parkir kota & sekolah: jumlahnya ganti tiap hari (hari berganti saat Raka tidur)
const parkAvoid = () => [player, ...RIDES.flatMap((R, i) => R && garage.owned[i] ? [garage.spot[i]] : [])];
parked.setDay(player.flags?.day || 0, parkAvoid());
addEventListener('newday', e => parked.setDay(e.detail, parkAvoid()));
resize(); applyQuality();
cam.x = player.x; cam.z = player.z;
renderer.compile(scene, camera);
ui.loading.style.display = 'none';
requestAnimationFrame(t => { last = t; loop(t); });
// debug / tes otomatis
window.__game = { kolam, story, waktu, luar, travel, parked, race, collision, fight, acts, shop, interiors, jajan, animals, makeRide, mount, dismount, garage, emote, vegPlant, Character, player, cam, npcs, renderer, scene, camera, opt, kota, sekolah, act, rotateCam, toggleFollow, zoom, findTarget: () => target };
