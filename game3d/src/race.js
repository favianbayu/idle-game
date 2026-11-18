// Balap liar drag (guide 87): Jl. Lingkar Selatan, 1 lawan 1, lurus 70 petak. Datang naik motor ke joki di dekat gerobak nasi
// goreng, pasang taruhan, tunggu senter joki, lalu timing gas & ganti gigi di bar hijau. Menang = uang + nyali, kalah = taruhan
// hilang. Habis balap ada peluang razia 25% (segmen 41): kabur lewat jalan tikus, atau kena denda & motor ditahan di Polsek.
import * as THREE from 'three';
import KOTA from './data/kota.json';
import { Merger, col } from './geom.js';
import { MAT } from './common.js';

// gigi: kecepatan puncak (petak/detik) & tenaga dorong; rpm = v / top. Bar hijau = saat ganti gigi paling pas.
const GEARS = [{ top: 6.5, a: 7 }, { top: 10.5, a: 4.6 }, { top: 15, a: 3.3 }, { top: 20, a: 2.4 }];
const GREEN = [0.78, 0.94], LIMIT = 0.97;
const torque = r => r < 0.15 ? 0.55 : r < 0.7 ? 0.55 + 0.45 * (r - 0.15) / 0.55 : r < LIMIT ? 1 : 0;   // mentok limiter = tidak nambah laju
// lawan naik level tiap kali dikalahkan (taruhan Rp 50.000-500.000, segmen 61)
const RIVALS = [
  { sid: 'anakPunk', name: 'Doni Knalpot', bet: 50000, kind: 'bebek', color: '#2a6ac0', power: 0.93, skill: 0.35, win: 'Ah, motor gue lagi masuk angin!', lose: 'Balik sekolah aja, bocah.' },
  { sid: 'kirana', name: 'Kirana', bet: 100000, kind: 'sport', color: '#e07a2a', power: 0.98, skill: 0.6, win: 'Oke... lo lumayan. Lumayan doang.', lose: 'Udah gue bilang, jangan nangis.' },
  { sid: 'kobar', name: 'Kobar', bet: 200000, kind: 'sport', color: '#2a2a2e', power: 1.02, skill: 0.8, win: 'Cih. Lain kali beda cerita.', lose: 'Lingkar punya Serigala Besi.' },
  { sid: 'pemuda', name: 'Joki Serigala Besi', bet: 500000, kind: 'sport', color: '#8a1a1a', power: 1.06, skill: 0.95, win: 'Gila, siapa yang setel motor lo?', lose: 'Upgrade dulu motornya, Dek.' },
];
const X0 = 248, X1 = 178, LANE = 0.85, LEN = X0 - X1;   // start di timur, finis di barat; pemain di lajur kiri (selatan)

// garis tengah jalan: Jl. Lingkar Selatan + sambungan baratnya (tempat ngerem habis finis)
const LR = KOTA.roads.find(r => r.name === 'Jl. Lingkar Selatan');
const WEST = LR && KOTA.roads.find(r => r !== LR && Math.hypot(r.pts.at(-1)[0] - LR.pts[0][0], r.pts.at(-1)[1] - LR.pts[0][1]) < 0.5);
const CL = [...(WEST ? WEST.pts : []), ...(LR ? LR.pts : [])].filter(p => p[0] >= 140).sort((a, b) => a[0] - b[0]);
export const laneZ = x => { for (let i = 1; i < CL.length; i++) if (CL[i][0] >= x) { const [ax, az] = CL[i - 1], [bx, bz] = CL[i], t = (x - ax) / ((bx - ax) || 1); return az + (bz - az) * t; } return CL.at(-1)?.[1] ?? 170; };

export function makeRace({ scene, kota, collision, player, Character, makeRide, npcs, shop, fight, toast, cam, jajan, onCaught }) {
  if (!LR) return { target: () => null, get active() { return false; }, step: () => null, update() {} };
  const rp = shop.rp, flags = () => player.flags || (player.flags = {});
  const say = (n, text, t = 2.6) => { if (n) n.say = { text, t }; };
  const free = (x, z) => { const p = collision.resolve({ x, z }, 0.3); return { x: p.x, z: p.z }; };

  // ---- titik kumpul: joki + penonton di trotoar utara garis start, dekat gerobak nasi goreng
  const nas = jajan.carts.find(c => c.K.id === 'nasgor');
  const js = free(X0 + 0.6, laneZ(X0) - 2.35);
  const mk = (sid, name, p, lines, roam = 0.4) => { const c = new Character(sid, { name }); scene.add(c.group); const n = { sid, name, filler: true, lines, c, home: { ...p }, x: p.x, z: p.z, tx: p.x, tz: p.z, wait: 2, heading: Math.PI / 2, say: null, greetT: Math.random() * 10, roam, key: 'race' + npcs.length }; npcs.push(n); return n; };
  const joki = mk('remaja', 'Bang Ocid (joki)', js, ['Mau adu drag? Bawa motor, siapin taruhan.', 'Start dari senter gue. Gas pas lampu nyala!', 'Polisi suka razia di lingkar. Siap kabur.'], 0.3);
  [['pemuda', 'Penonton', -2.2, -0.2], ['mbak', 'Penonton', 3.2, 0.1], ['ojol', 'Penonton', -3.6, 0.3]].forEach(([sid, name, dx, dz]) =>
    mk(sid, name, free(X0 + dx, laneZ(X0 + dx) - 2.4 + dz), ['Gas, gas, gaaas!', 'Taruhan gue di lajur kiri.', 'Knalpotnya berisik amat.'], 0.5));

  // garis start & finis dicat di aspal (kapur putih) + kerucut di bahu jalan
  { const m = new Merger(), W = col('#f2f2ea'), O = col('#e8602a');
    for (const x of [X0, X1]) { const z = laneZ(x); for (let i = 0; i < 7; i++) m.box({ x, z, a: 0 }, 0, 0.012, -1.5 + i * 0.5, 0.16, 0.012, 0.3, i % 2 ? W : col('#d8d8d0'));
      for (const sd of [-1, 1]) { m.box({ x, z: z + sd * 1.95, a: 0 }, 0, 0, 0, 0.22, 0.04, 0.22, O); m.box({ x, z: z + sd * 1.95, a: 0 }, 0, 0.04, 0, 0.14, 0.24, 0.14, O); m.box({ x, z: z + sd * 1.95, a: 0 }, 0, 0.14, 0, 0.15, 0.04, 0.15, W); } }
    const me = new THREE.Mesh(m.build(), MAT.world); kota.lift(me); me.receiveShadow = true; scene.add(me); }

  // ---- HUD
  const css = document.createElement('style');
  css.textContent = `#race{position:fixed;inset:0;pointer-events:none;display:none;z-index:15;font-family:'Trebuchet MS',system-ui,sans-serif}
  #race .big{position:absolute;top:28%;left:50%;transform:translateX(-50%);font:bold clamp(34px,9vw,54px) 'Trebuchet MS',system-ui,sans-serif;color:#ffd84a;text-shadow:0 3px 0 #000,0 0 8px #000;white-space:nowrap}
  #race .msg{position:absolute;top:42%;left:50%;transform:translateX(-50%);width:max-content;max-width:90vw;text-align:center;font:bold clamp(14px,4vw,20px) 'Trebuchet MS',system-ui,sans-serif;color:#fff;text-shadow:0 2px 0 #000}
  #race .pan{position:absolute;top:calc(max(10px,env(safe-area-inset-top)) + 2px);left:50%;transform:translateX(-50%);width:min(84vw,340px);background:rgba(20,18,14,.72);border:2px solid #000;border-radius:8px;padding:6px 8px;color:#fffbe8;font-size:12px}
  #race .row{display:flex;align-items:center;gap:8px}#race .gear{font:bold 26px 'Trebuchet MS',system-ui,sans-serif;width:30px;text-align:center;color:#ffd84a}
  #race .rpm{position:relative;flex:1;height:16px;background:#3a3630;border:2px solid #000;border-radius:3px;overflow:hidden}
  #race .rpm .gr{position:absolute;top:0;bottom:0;left:${GREEN[0] * 100}%;width:${(GREEN[1] - GREEN[0]) * 100}%;background:#3ac85a}
  #race .rpm .rd{position:absolute;top:0;bottom:0;left:${LIMIT * 100}%;right:0;background:#d23a3a}
  #race .rpm .nd{position:absolute;top:-2px;bottom:-2px;width:4px;margin-left:-2px;background:#fff;box-shadow:0 0 2px #000}
  #race .trk{position:relative;height:14px;margin-top:6px;background:#2a2824;border-radius:3px}
  #race .trk i{position:absolute;top:2px;width:10px;height:10px;margin-left:-5px;border-radius:50%;border:1px solid #000}#race .trk .p{background:#ffd84a}#race .trk .o{background:#e04040}
  #race .trk b{position:absolute;right:2px;top:-1px;font-size:10px;color:#aaa}`;
  document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'race';
  hud.innerHTML = '<div class="pan"><div class="row"><span class="gear">1</span><div class="rpm"><div class="gr"></div><div class="rd"></div><div class="nd"></div></div><span class="kmh">0</span></div><div class="trk"><i class="o"></i><i class="p"></i><b>FINIS</b></div><div class="who"></div></div><div class="big"></div><div class="msg"></div>';
  document.body.appendChild(hud);
  const $ = s => hud.querySelector(s), H = { pan: $('.pan'), gear: $('.gear'), nd: $('.nd'), kmh: $('.kmh'), p: $('.p'), o: $('.o'), big: $('.big'), msg: $('.msg'), who: $('.who') };
  let msgT = 0;
  const flash = (t, d = 1.2) => { H.msg.textContent = t; msgT = d; };

  // ---- lawan & polisi (dibuat sekali, disembunyikan saat tidak dipakai)
  const rigs = new Map();
  function rig(sid, kind, color) {
    const k = sid + kind + color; if (rigs.has(k)) return rigs.get(k);
    const rd = makeRide('motor', kind, color), ch = new Character(sid); rd.mount(ch); rd.group.visible = false; scene.add(rd.group);
    const o = { rd, ch }; rigs.set(k, o); return o;
  }
  const place = (o, x, z, h, v, dt) => { o.rd.group.visible = true; o.rd.group.position.set(x, kota.groundY(x, z), z); o.rd.group.rotation.y = h; o.rd.spin(v * dt); o.ch.update(dt); };

  const rival = () => RIVALS[Math.min(RIVALS.length - 1, flags().drag || 0)];
  let S = null, C = null, saveCam = null, hideT = 0, shown = null;
  const blockZone = (x, z) => x > 140 && x < 262 && Math.abs(z - laneZ(x)) < 4.5;

  function start() {
    const R = rival();
    if (player.uang < R.bet) { say(joki, `Taruhan ${rp(R.bet)}, bro. Duit lo kurang.`); return; }
    if (C) return;
    player.uang -= R.bet; shop.showMoney();
    const o = rig(R.sid, R.kind, R.color);
    for (const n of npcs) if (n.sid === R.sid && !n.key.startsWith('race')) n.away = true;   // tokohnya pindah ke motor
    // AI lawan: makin jago = reaksi cepat & ganti gigi dekat bar hijau
    const sk = R.skill, shifts = GEARS.map(() => Math.min(0.99, (GREEN[0] + GREEN[1]) / 2 + (Math.random() - 0.5) * (1 - sk) * 0.5 + (Math.random() < (1 - sk) * 0.4 ? -0.18 : 0)));
    S = { R, o, phase: 'count', t: 0, go: 3 + Math.random() * 0.7, run: 0,
      p: { x: X0, v: 0, g: 0, st: 0, on: false, jump: 0, done: null, perfect: 0, power: 1 + 0.03 * ((player.upg || {}).motor || 0) },
      q: { x: X0, v: 0, g: 0, st: 0, react: 0.18 + (1 - sk) * 0.45 + Math.random() * 0.12, shifts, done: null, power: R.power } };
    Object.assign(player, { x: X0, z: laneZ(X0) + LANE, heading: Math.PI, vx: 0, vz: 0, emote: null });
    saveCam = { yawT: cam.yawT, distT: cam.distT };
    cam.yawT = Math.PI / 2 - 0.5; cam.distT = Math.max(cam.distT, 10); cam.manualT = 1e9;
    kota.traffic.setBlock?.(blockZone);
    joki.ext = n => { n.anim = S && S.t < S.go ? 'raiseHand' : 'wave'; n.heading = Math.atan2(laneZ(X0) - n.z, X0 - n.x); };
    say(joki, `${R.name} vs Raka! Taruhan ${rp(R.bet)}. Siap...`, 3);
    H.who.textContent = `Lawan: ${R.name} · taruhan ${rp(R.bet)} · Aksi = gas / ganti gigi`;
    hud.style.display = 'block'; H.pan.style.display = '';
  }
  function press() {
    if (!S) return;
    const p = S.p;
    if (S.phase === 'count') { if (!p.on && !p.jump) { p.jump = 1.1; flash('Kecepetan! Mesin brebet...'); } return; }
    if (S.phase !== 'run' || p.done != null) return;
    if (!p.on) { p.on = true; p.at = S.run; const rt = S.run; if (rt < 0.3) { p.v = 1.2; flash('Start mantap!'); } else if (rt > 0.7) flash('Telat start!'); return; }
    if (p.g >= GEARS.length - 1 || p.st > 0 || S.run - (p.at ?? -1) < 0.3) return;   // tekan dobel pas start tidak dihitung ganti gigi
    const r = p.v / GEARS[p.g].top, ok = r >= GREEN[0] && r <= GREEN[1];
    p.g++; p.st = ok ? 0.08 : 0.28; if (ok) p.perfect++;
    flash(ok ? 'Pas!' : r < GREEN[0] ? 'Kecepetan ganti gigi' : 'Telat ganti gigi', 0.8);
  }
  function phys(m, dt, ai) {
    if (m.done != null && m.v <= 0) return;
    if (m.done != null) m.v = Math.max(0, m.v - 13 * dt);   // lewat finis: ngerem
    else if (m.on) {
      const G = GEARS[m.g], r = m.v / G.top;
      if (ai && m.g < GEARS.length - 1 && m.st <= 0 && r >= m.shifts[m.g]) { const ok = r >= GREEN[0] && r <= GREEN[1]; m.g++; m.st = ok ? 0.08 : 0.28; }
      else if (m.st > 0) m.st -= dt;
      else if (m.jump > 0) m.jump -= dt;
      else m.v += G.a * torque(r) * m.power * dt;
    }
    m.x -= m.v * dt;
    if (m.done == null && X0 - m.x >= LEN) m.done = S.run;
  }
  // dipanggil updatePlayer selama balapan: posisi pemain diatur di sini
  function step(dt) {
    if (!S) return null;
    S.t += dt;
    const { p, q } = S;
    if (S.phase === 'count') {
      const left = S.go - S.t;
      H.big.textContent = left > 2 ? '3' : left > 1 ? '2' : left > 0 ? '1' : '';
      if (left <= 0) { S.phase = 'run'; H.big.textContent = 'GAS!'; joki.say = { text: '(senter nyala) GAAAS!', t: 1.5 }; if (p.jump) p.on = true; }
    } else {
      S.run += dt;
      if (S.run > 0.8 && H.big.textContent === 'GAS!') H.big.textContent = '';
      if (S.run >= q.react) q.on = true;
      phys(p, dt, false); phys(q, dt, true);
      if (p.done != null && p.v <= 0 && (q.done != null || S.run > p.done + 4)) end();
      else if (S.run > 25) end();
    }
    if (S) {
      const r = Math.min(1.05, p.v / GEARS[p.g].top);
      H.gear.textContent = p.on || S.phase === 'count' ? String(p.g + 1) : 'N'; H.nd.style.left = (r * 100).toFixed(1) + '%'; H.kmh.textContent = Math.round(p.v * 6) + ' km/j';
      H.p.style.left = (Math.min(1, (X0 - p.x) / LEN) * 100).toFixed(1) + '%'; H.o.style.left = (Math.min(1, (X0 - q.x) / LEN) * 100).toFixed(1) + '%';
      place(S.o, q.x, laneZ(q.x) - LANE, -Math.PI / 2, q.v, dt);
      player.x = p.x; player.z = laneZ(p.x) + LANE; player.heading = Math.PI;
      return { v: p.v };
    }
    return { v: 0 };
  }
  function end() {
    const { R, p, q, o } = S, win = p.done != null && (q.done == null || p.done < q.done);
    const f = flags();
    if (win) {
      player.uang += R.bet; shop.earn(R.bet, `Menang lawan ${R.name}! Taruhan balik,`); fight.gain('nyali', 3 + 2 * RIVALS.indexOf(R)); f.drag = Math.max(f.drag || 0, RIVALS.indexOf(R) + 1);
      H.big.textContent = 'MENANG!'; flash(`${p.done.toFixed(2)} detik · ${R.name}: "${R.win}"`, 3.5);
    } else { H.big.textContent = 'KALAH'; flash(`Taruhan ${rp(R.bet)} melayang · ${R.name}: "${R.lose}"`, 3.5); toast(`Kalah dari ${R.name}.`); }
    if (p.perfect >= 3) fight.gain('kelincahan', 1);
    f.dragN = (f.dragN || 0) + 1;
    H.pan.style.display = 'none'; hideT = 3.5;
    shown = { o, x: q.x, z: laneZ(q.x) - LANE, sid: R.sid, t: 4 };
    cam.yawT = saveCam.yawT; cam.distT = saveCam.distT; cam.manualT = 0;
    joki.ext = null; S = null;
    if (Math.random() < 0.25) razia(); else kota.traffic.setBlock?.(null);
  }

  // ---- razia: polisi bermotor datang dari arah start, kejar pemain. Lolos = jauh / masuk gang sempit / ke dalam bangunan
  function razia() {
    const pol = rig('polisi', 'trail', '#e8e8e8');
    C = { pol, x: Math.min(X0, player.x + 16), z: laneZ(player.x + 16) - LANE, h: -Math.PI / 2, v: 0, t: 0, lost: 0 };
    hud.style.display = 'block'; H.pan.style.display = 'none';
    setTimeout(() => { H.big.textContent = 'RAZIA!'; flash('Polisi! Kabur lewat gang / jalan tikus!', 3); }, 900);
    kota.traffic.setBlock?.(null);
  }
  function chase(dt) {
    C.t += dt;
    const dx = player.x - C.x, dz = player.z - C.z, d = Math.hypot(dx, dz);
    if (player.area !== 'kota' || d > 32 || C.t > 30) {
      C.pol.rd.group.visible = false; C = null; H.big.textContent = ''; flash('Lolos dari razia!', 2.5); toast('Lolos dari razia! Nyali naik.'); fight.gain('nyali', 2); hud.style.display = 'block'; hideT = 2.5; return;
    }
    if (d < 1.15) {
      C.pol.rd.group.visible = false; C = null; H.big.textContent = '';
      const fine = Math.min(player.uang, 100000); player.uang -= fine; shop.showMoney();
      const f = flags(); f.razia = (f.razia || 0) + 1; f.omMarah = true;
      onCaught(fine); return;
    }
    if (C.t < 0.9) return;
    const sp = Math.min(9.4, C.v + 7 * dt); C.v = sp;
    const nx = C.x + dx / d * sp * dt, nz = C.z + dz / d * sp * dt, np = collision.move(C, nx, nz, 0.36);
    const moved = Math.hypot(np.x - C.x, np.z - C.z); if (moved < sp * dt * 0.3) C.v *= 0.6;   // nabrak tembok: melambat
    C.x = np.x; C.z = np.z;
    const want = Math.atan2(dx, dz); let dh = want - C.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); C.h += dh * Math.min(1, dt * 6);
    place(C.pol, C.x, C.z, C.h, C.v, dt);
    H.msg.textContent = `Razia! Polisi ${Math.round(d)} petak di belakang`; msgT = 0.3;
  }

  return {
    get active() { return !!S; },
    get chasing() { return !!C; },
    step,
    target(ride) {
      if (S) return { kind: 'act', label: S.phase === 'count' ? 'Tahan... gas pas senter nyala' : !S.p.on ? 'GAS!' : S.p.g < GEARS.length - 1 ? `Ganti gigi ${S.p.g + 2} (pas di hijau)` : 'Gas pol!', fn: press };
      if (C || player.area !== 'kota' || Math.hypot(player.x - joki.x, player.z - joki.z) > 3.6) return null;
      if (ride === 1) return { kind: 'act', label: 'Joki: "Onthel? Bawa motor, bro!"', fn: () => say(joki, 'Drag pake onthel? Bawa motor dulu, bro!') };
      if (ride !== 2) return null;
      const R = rival();
      return { kind: 'act', label: `Balap drag lawan ${R.name} (taruhan ${rp(R.bet)})`, fn: start };
    },
    update(dt) {
      if (C) chase(dt);
      if (msgT > 0) { msgT -= dt; if (msgT <= 0) H.msg.textContent = ''; }
      if (hideT > 0 && !S && !C) { hideT -= dt; if (hideT <= 0) { hud.style.display = 'none'; H.big.textContent = ''; } }
      if (shown) { shown.t -= dt; shown.o.ch.update(dt); if (shown.t <= 0) { shown.o.rd.group.visible = false; for (const n of npcs) if (n.sid === shown.sid) n.away = false; shown = null; } }
    },
    press, razia, joki, nasgor: nas, RIVALS, X0, X1,
  };
}
