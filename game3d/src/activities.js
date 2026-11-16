// Aktivitas bebas (guide 50, 71, 85): sepak bola di lapangan kampung (gawang berjaring + bola + Dodi & Didi ikut main),
// basket 3x3 di lapangan umum (ring + bola, dribel, tembak), memancing (lempar, tunggu, tarik-ulur benang), berenang,
// rakit penyeberangan dan duduk di api unggun. Semua fisika bola sederhana: gravitasi, pantul, gesek, tabrak penghalang.
import * as THREE from 'three';
import { Merger, col } from './geom.js';
import { MAT, hash } from './common.js';

const G = 9.5;
const FB = { x: 88, z: 104, hl: 5.6, gw: 1.2, gh: 1.15, gd: 0.85, w: 6.4, l: 6.6 };   // lapangan bola: setengah panjang ke garis gawang, setengah lebar gawang, tinggi, dalam jaring
const BK = { x: 127, z: 46, hw: 4, hd: 3, rimY: 2.0, rimR: 0.21, rims: [] };
const FISH = [['Nila', 0.25, 0.7, 30], ['Mujair', 0.2, 0.5, 26], ['Lele', 0.3, 1.2, 22], ['Ikan mas', 0.4, 1.6, 12], ['Gurame', 0.6, 2.2, 6], ['Patin', 0.8, 2.6, 4], ['Sandal jepit', 0, 0, 5], ['Kaleng bekas', 0, 0, 4]];

export function makeActivities({ scene, kota, collision, player, Character, toast, npcs, say, gain = () => {} }) {
  const M = kota.M, P = kota.places || {}, white = col('#f4f4f0'), net = col('#dcdcd4');
  const mg = new Merger(), thin = new Merger();
  const box = (m, x, y, z, sx, sy, sz, c, a = 0) => m.box({ x, z, a }, 0, y, 0, sx, sy, sz, c);

  /* ---------------- lapangan bola: garis kapur, gawang berjaring, bendera sudut */
  { const { x: cx, z: cz, hl, gw, gh, gd } = FB, L0 = cx - 6.3, L1 = cx + 6.3, Z0 = cz - 3.5, Z1 = cz + 3.5, ln = 0.07;
    for (const z of [Z0, Z1]) box(mg, cx, 0.004, z, L1 - L0, 0.008, ln, white);
    for (const x of [L0, L1, cx]) box(mg, x, 0.004, cz, ln, 0.008, Z1 - Z0, white);
    for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; box(mg, cx + Math.cos(a) * 1.1, 0.004, cz + Math.sin(a) * 1.1, 0.36, 0.008, ln, white, a + Math.PI / 2); }
    for (const sd of [-1, 1]) { const gx = cx + sd * hl, bx = gx - sd * 1.4;
      box(mg, bx, 0.004, cz, ln, 0.008, 4.0, white); for (const z of [cz - 2, cz + 2]) box(mg, (bx + sd * 6.3 + cx) / 2 + (sd > 0 ? 0 : 0), 0.004, z, Math.abs(cx + sd * 6.3 - bx), 0.008, ln, white);
      box(mg, gx - sd * 1.0, 0.006, cz, 0.12, 0.008, 0.12, white);   // titik penalti
      // gawang: tiang, mistar, rangka belakang, jaring
      for (const z of [cz - gw, cz + gw]) { box(mg, gx, 0, z, 0.1, gh, 0.1, white); collision.circle(gx, z, 0.07); box(thin, gx + sd * gd, 0, z, 0.05, gh - 0.25, 0.05, net); box(thin, gx + sd * gd / 2, gh - 0.15, z, gd, 0.04, 0.04, net); box(thin, gx + sd * gd / 2, 0, z, gd, 0.03, 0.03, net); collision.circle(gx + sd * gd, z, 0.05); }
      box(mg, gx, gh - 0.05, cz, 0.1, 0.1, gw * 2 + 0.1, white); box(thin, gx + sd * gd, gh - 0.3, cz, 0.04, 0.04, gw * 2, net); box(thin, gx + sd * gd, 0, cz, 0.04, 0.03, gw * 2, net);
      for (let z = cz - gw; z <= cz + gw + 1e-3; z += 0.2) { box(thin, gx + sd * gd, 0, z, 0.012, gh - 0.28, 0.012, net); box(thin, gx + sd * gd / 2, gh - 0.17, z, gd, 0.012, 0.012, net, 0); }
      for (let y = 0.2; y < gh - 0.25; y += 0.2) { box(thin, gx + sd * gd, y, cz, 0.012, 0.012, gw * 2, net); for (const z of [cz - gw, cz + gw]) box(thin, gx + sd * gd / 2, y, z, gd, 0.012, 0.012, net); }
      for (let u = 0.2; u < gd; u += 0.2) for (const z of [cz - gw, cz + gw]) box(thin, gx + sd * u, 0, z, 0.012, gh - 0.15 - (u / gd) * 0.12, 0.012, net);
      for (const z of [Z0, Z1]) { const fx = cx + sd * 6.3; box(thin, fx, 0, z, 0.03, 0.7, 0.03, col('#e8e4d8')); box(thin, fx + 0.12 * -sd, 0.55, z, 0.22, 0.14, 0.01, col('#e83a2a')); }
    } }

  /* ---------------- lapangan basket umum: garis, ring berjaring, papan pantul */
  { const { x: cx, z: cz, hw, hd, rimY, rimR } = BK, ln = 0.06;
    box(mg, cx, 0.045, cz, ln, 0.005, hd * 2, white);
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; box(mg, cx + Math.cos(a) * 0.85, 0.045, cz + Math.sin(a) * 0.85, 0.3, 0.005, ln, white, a + Math.PI / 2); }
    for (const z of [cz - hd + 0.05, cz + hd - 0.05]) box(mg, cx, 0.045, z, hw * 2, 0.005, ln, white);
    for (const sd of [-1, 1]) {
      const bx = cx + sd * (hw - 0.05);
      box(mg, cx + sd * (hw - 0.95), 0.044, cz, 1.8, 0.004, 1.8, col('#b85a3a'));   // daerah kunci
      for (const z of [cz - 0.9, cz + 0.9]) box(mg, cx + sd * (hw - 0.95), 0.045, z, 1.8, 0.005, ln, white);
      box(mg, cx + sd * (hw - 1.85), 0.045, cz, ln, 0.005, 1.8, white);
      for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + i / 16 * Math.PI, r = 2.9, x = bx - sd * 0.3 - sd * Math.cos(a) * r, z = cz + Math.sin(a) * r; if (Math.abs(z - cz) < hd - 0.1) box(mg, x, 0.045, z, 0.3, 0.005, ln, white, -sd * a); }   // garis 3 angka
      // tiang + lengan + papan + ring + jaring
      const px = cx + sd * (hw + 0.45), brd = cx + sd * (hw - 0.25), rx = cx + sd * (hw - 0.5);
      box(mg, px, 0, cz, 0.16, 2.55, 0.16, col('#3a3a40')); box(mg, px, 0, cz, 0.4, 0.15, 0.4, col('#5a5a60')); collision.circle(px, cz, 0.16);
      box(mg, (px + brd) / 2, 2.12, cz, Math.abs(px - brd), 0.09, 0.09, col('#3a3a40'));
      box(mg, brd, 1.82, cz, 0.05, 0.68, 1.05, white); box(mg, brd - sd * 0.03, 1.98, cz, 0.01, 0.28, 0.4, col('#d83a2a')); box(mg, brd - sd * 0.035, 2.02, cz, 0.01, 0.2, 0.32, white);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; box(mg, rx + Math.cos(a) * rimR, rimY, cz + Math.sin(a) * rimR, 0.12, 0.025, 0.025, col('#e8601a'), a + Math.PI / 2); }
      box(mg, (rx + brd) / 2, rimY - 0.02, cz, Math.abs(rx - brd) - rimR, 0.03, 0.06, col('#e8601a'));
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; box(thin, rx + Math.cos(a) * rimR * 0.85, rimY - 0.34, cz + Math.sin(a) * rimR * 0.85, 0.012, 0.34, 0.012, net); }
      for (const [y, k] of [[rimY - 0.12, 0.9], [rimY - 0.26, 0.75]]) for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; box(thin, rx + Math.cos(a) * rimR * k, y, cz + Math.sin(a) * rimR * k, 0.1, 0.012, 0.012, net, a + Math.PI / 2); }
      BK.rims.push({ x: rx, y: rimY, z: cz, sd, board: brd });
    } }
  scene.add(new THREE.Mesh(mg.build(), MAT.world)); { const t = new THREE.Mesh(thin.build(), MAT.world); scene.add(t); }

  /* ---------------- bola */
  const ballMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  function ballMesh(kind, r) {
    const g = new THREE.IcosahedronGeometry(r, 1), pos = g.attributes.position, c = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) / r, y = pos.getY(i) / r, z = pos.getZ(i) / r;
      if (kind === 'bola') { const k = Math.floor(i / 3), dark = hash(k, 7) < 0.28; c.push(...(dark ? [0.08, 0.08, 0.09] : [0.95, 0.95, 0.93])); }
      else { const seam = Math.abs(y) < 0.12 || Math.abs(x) < 0.12 || Math.abs(Math.abs(z) - 0.7) < 0.1; c.push(...(seam ? [0.15, 0.06, 0.03] : [0.92, 0.42, 0.12])); }
    }
    const ng = g.toNonIndexed ? g : g; ng.setAttribute('color', new THREE.Float32BufferAttribute(c.length === pos.count * 3 ? c : c, 3));
    const m = new THREE.Mesh(ng, ballMat); m.castShadow = true; scene.add(m); return m;
  }
  const mkBall = (kind, home) => ({ kind, home, r: kind === 'bola' ? 0.14 : 0.13, p: { x: home.x, y: 0.3, z: home.z }, v: { x: 0, y: 0, z: 0 }, mesh: ballMesh(kind, kind === 'bola' ? 0.14 : 0.13),
    bounce: kind === 'bola' ? 0.55 : 0.78, fric: kind === 'bola' ? 1.1 : 1.6, held: false, out: 0, cd: 0, shot: null });
  const ball = mkBall('bola', { x: FB.x, z: FB.z }), bball = mkBall('basket', { x: BK.x, z: BK.z + 1 });
  const balls = [ball, bball];
  const q = new THREE.Quaternion(), ax = new THREE.Vector3();
  function stepBall(b, dt) {
    b.cd = Math.max(0, b.cd - dt);
    if (b.resetIn > 0 && (b.resetIn -= dt) <= 0) reset(b);
    if (b.held) return;
    const py = b.p.y;
    b.v.y -= G * dt; b.p.x += b.v.x * dt; b.p.y += b.v.y * dt; b.p.z += b.v.z * dt;
    if (b.p.y < b.r) { b.p.y = b.r; if (b.v.y < 0) { b.v.y = -b.v.y * b.bounce; if (b.v.y < 0.7) b.v.y = 0; } const f = Math.exp(-dt * b.fric); b.v.x *= f; b.v.z *= f; }
    // penghalang statis (pagar, tiang, bangunan)
    if (b.p.y < 1.6) { const r = collision.resolve({ x: b.p.x, z: b.p.z }, b.r), nx = r.x - b.p.x, nz = r.z - b.p.z, l = Math.hypot(nx, nz);
      if (l > 1e-5) { const ux = nx / l, uz = nz / l, d = b.v.x * ux + b.v.z * uz; if (d < 0) { b.v.x -= 1.6 * d * ux; b.v.z -= 1.6 * d * uz; } b.p.x = r.x; b.p.z = r.z; } }
    if (b.kind === 'bola') goalNet(b, py); else hoop(b, py, dt);
    // keluar lapangan / masuk air: kembali ke tengah setelah sebentar
    const home = b.home, far = Math.hypot(b.p.x - home.x, b.p.z - home.z) > (b.kind === 'bola' ? 9 : 7.5);
    if (far || M.waterAt(b.p.x, b.p.z) || M.roadDist(b.p.x, b.p.z) < 0) b.out += dt; else b.out = 0;
    if (b.out > 1.5) reset(b);
    // putar bola sesuai arah gelinding
    const sp = Math.hypot(b.v.x, b.v.z); if (sp > 0.05) { ax.set(b.v.z, 0, -b.v.x).normalize(); q.setFromAxisAngle(ax, sp * dt / b.r); b.mesh.quaternion.premultiply(q); }
  }
  function reset(b) { b.p.x = b.home.x; b.p.z = b.home.z; b.p.y = 1.2; b.v.x = b.v.z = 0; b.v.y = 0; b.out = 0; b.shot = null; b.held = false; }

  /* ---------------- sepak bola: gol, jaring, skor, Dodi & Didi */
  const score = { L: 0, R: 0 }; let goalT = 0;
  function goalNet(b, py) {
    const dx = b.p.x - FB.x, sd = Math.sign(dx), ad = Math.abs(dx), dz = Math.abs(b.p.z - FB.z);
    if (ad > FB.hl && ad < FB.hl + FB.gd + 0.3 && dz < FB.gw + 0.05 && b.p.y < FB.gh) {
      if (ad > FB.hl + FB.gd - b.r) { b.p.x = FB.x + sd * (FB.hl + FB.gd - b.r); b.v.x *= -0.15; b.v.z *= 0.5; }   // jaring belakang
      if (dz > FB.gw - b.r) { b.p.z = FB.z + Math.sign(b.p.z - FB.z) * (FB.gw - b.r); b.v.z *= -0.2; }
      if (goalT <= 0) { goalT = 2.2; b.resetIn = 2; const side = sd < 0 ? 'R' : 'L'; score[side]++; toast(`GOOOL! Skor ${score.L} - ${score.R}`); for (const k of kids) if (k.goal === sd) { say(k, 'GOOOL!!'); k.cheer = 2; } }
    } else if (ad > FB.hl && ad < FB.hl + 0.4 && dz < FB.gw + 0.1 && b.p.y >= FB.gh && b.p.y < FB.gh + 0.2 && b.v.y < 0) b.v.y = Math.abs(b.v.y) * 0.4;   // kena mistar
  }
  // dua anak SD main bola: mengejar bola dan menendang ke gawang lawannya
  const kids = [];
  [['Dodi', 'anakSD', -1], ['Didi', 'anakSDcw', 1]].forEach(([name, sid, goal], i) => {
    const c = new Character(sid); scene.add(c.group);
    const k = { sid, name, filler: true, key: 'kid' + i, c, goal, x: FB.x - goal * 2, z: FB.z + (i ? 1 : -1), home: { x: FB.x - goal * 2, z: FB.z }, heading: 0, cd: 0, cheer: 0, anim: 'idle', say: null, greetT: 0, linesKey: 'bocahBola',
      ext: (n, dt) => kidAI(n, dt) };
    npcs.push(k); kids.push(k);
  });
  function kidAI(k, dt) {
    k.cd -= dt; k.cheer -= dt; k.kickT = Math.max(0, (k.kickT || 0) - dt);
    if (k.cheer > 0) { k.anim = 'cheer'; return; }
    if (k.kickT > 0) { k.anim = 'kickBall'; return; }
    const inField = Math.abs(ball.p.x - FB.x) < 7 && Math.abs(ball.p.z - FB.z) < 4.2 && !ball.held;
    // tiap anak jaga jarak dari gawang sendiri: penyerang mengejar bola, kalau bola jauh di belakang kembali ke posisi
    let tx = inField ? ball.p.x - k.goal * 0.35 : k.home.x, tz = inField ? ball.p.z : k.home.z;
    const dx = tx - k.x, dz = tz - k.z, d = Math.hypot(dx, dz), sp = d > 2 ? 2.7 : 1.8;
    if (d > 0.15) { const s = Math.min(d, sp * dt), r = collision.resolve({ x: k.x + dx / d * s, z: k.z + dz / d * s }, 0.22); k.x = r.x; k.z = r.z; k.heading = Math.atan2(dz, dx); k.anim = sp > 2 ? 'run' : 'walk'; }
    else k.anim = 'idle';
    const pd = Math.hypot(k.x - player.x, k.z - player.z); if (pd < 0.5 && pd > 1e-4) { k.x = player.x + (k.x - player.x) / pd * 0.5; k.z = player.z + (k.z - player.z) / pd * 0.5; }
    const bd = Math.hypot(ball.p.x - k.x, ball.p.z - k.z);
    if (inField && bd < 0.5 && ball.p.y < 0.5 && k.cd <= 0) {
      const gx = FB.x + k.goal * (FB.hl + 0.3), gz = FB.z + (Math.random() - 0.5) * FB.gw * 2.2, ux = gx - ball.p.x, uz = gz - ball.p.z, l = Math.hypot(ux, uz) || 1, pw = l > 4 ? 6.5 : 4.5 + Math.random() * 2;
      ball.v.x = ux / l * pw; ball.v.z = uz / l * pw; ball.v.y = l > 4 ? 1.8 : 0.6; k.cd = 0.9 + Math.random() * 0.8; k.kickT = 0.45; k.heading = Math.atan2(uz, ux);
    }
  }

  /* ---------------- basket: pantulan papan & ring, masuk keranjang */
  const bscore = { n: 0 };
  function hoop(b, py, dt) {
    for (const R of BK.rims) {
      // papan
      if (Math.sign(b.p.x - R.board) === -R.sd && Math.abs(b.p.x - R.board) < b.r && Math.abs(b.p.z - R.z) < 0.55 && b.p.y > 1.8 && b.p.y < 2.52 && b.v.x * R.sd > 0) { b.v.x *= -0.55; b.p.x = R.board - R.sd * b.r; }
      if (py >= R.y && b.p.y < R.y) {
        const r = Math.hypot(b.p.x - R.x, b.p.z - R.z);
        if (r < R.rimR || r < BK.rimR - 0.03) {
          if (b.shot && !b.shot.made) { b.shot.made = true; const pts = b.shot.d > 3.1 ? 3 : 2; bscore.n += pts; toast(`Masuk! +${pts} (total ${bscore.n})`); }
          b.v.x *= 0.25; b.v.z *= 0.25; b.v.y = Math.min(b.v.y, -1.0);
        } else if (r < BK.rimR + 0.16) {   // kena ring: memantul keluar
          const ux = (b.p.x - R.x) / (r || 1), uz = (b.p.z - R.z) / (r || 1); b.v.x = ux * 1.4 + b.v.x * 0.3; b.v.z = uz * 1.4 + b.v.z * 0.3; b.v.y = Math.abs(b.v.y) * 0.5; b.p.y = R.y + 0.01;
          if (b.shot && !b.shot.made && !b.shot.rim) { b.shot.rim = true; toast('Klang! Kena ring'); }
        }
      }
    }
  }

  /* ---------------- samsak latihan (guide 70 "Upgrade diri"): depan markas Lampu Kota & halaman Om Darto. Aksi = 5 detik latihan, Kekuatan naik */
  const bags = [];
  { const cand = [];
    const g = kota.specials?.gudang; if (g) { const xf = { x: g.x, z: g.y, a: g.a }; for (const lx of [g.w / 2 - 0.9, g.w / 2 - 1.8, -g.w / 2 + 0.9]) cand.push([xf, lx, g.h / 2 + 1.5, 'Samsak markas Lampu Kota']); }
    const D = kota.darto; if (D) for (const lx of [-1.6, 1.6, -0.6]) cand.push([D.xf, lx, -D.d / 2 - 1.2, 'Samsak Om Darto'], [D.xf, D.w / 2 + 1.1, lx * 0.6, 'Samsak Om Darto']);
    const used = new Set();
    for (const [xf, lx, lz, name] of cand) {
      if (used.has(name)) continue;
      const c = Math.cos(xf.a), sn = Math.sin(xf.a), x = xf.x + lx * c - lz * sn, z = xf.z + lx * sn + lz * c;
      const ok = [[0, 0], [0.7, 0], [-0.7, 0], [0, 0.7], [0, -0.7]].every(([u, v]) => !collision.blockedMask(x + u, z + v) && M.roadDist(x + u, z + v) > 0.5 && !M.waterAt(x + u, z + v));
      const p = collision.resolve({ x, z }, 0.45); if (!ok || Math.hypot(p.x - x, p.z - z) > 0.05) continue;
      used.add(name);
      // rangka kayu + rantai + karung goni berisi pasir
      const fr = new Merger(), wood = col('#6a4a2a'), a = xf.a;
      fr.box({ x, z, a }, -0.55, 0, 0, 0.1, 2.15, 0.1, wood); fr.box({ x, z, a }, 0.55, 0, 0, 0.1, 2.15, 0.1, wood); fr.box({ x, z, a }, 0, 2.1, 0, 1.3, 0.1, 0.12, wood);
      fr.box({ x, z, a }, -0.55, 0, 0, 0.3, 0.06, 0.5, wood); fr.box({ x, z, a }, 0.55, 0, 0, 0.3, 0.06, 0.5, wood);
      scene.add(new THREE.Mesh(fr.build(), MAT.world));
      const bm = new Merger(); bm.box({ x: 0, z: 0, a: 0 }, 0, -0.38, 0, 0.02, 0.38, 0.02, col('#8a8a8a'));
      bm.box({ x: 0, z: 0, a: 0 }, 0, -1.25, 0, 0.36, 0.88, 0.36, col('#9a2a22')); bm.box({ x: 0, z: 0, a: 0 }, 0, -1.25, 0, 0.38, 0.08, 0.38, col('#2a2a2a')); bm.box({ x: 0, z: 0, a: 0 }, 0, -0.5, 0, 0.38, 0.08, 0.38, col('#2a2a2a'));
      const piv = new THREE.Group(); piv.position.set(x, 2.1, z); piv.add(new THREE.Mesh(bm.build(), MAT.world)); piv.children[0].castShadow = true; scene.add(piv);
      collision.circle(x, z, 0.24);
      bags.push({ x, z, a, name, piv, sw: 0, sv: 0 });
    } }
  function trainBag(b) {
    player.heading = Math.atan2(b.z - player.z, b.x - player.x); player.emote = null;
    let hits = 0;
    actT = { anim: 'bagPunch', t: 0, dur: 4.5, at: 99, tick: t => { const n = Math.floor(t * 12 / 6); if (n > hits) { hits = n; b.sv += 2.2; } }, fn: () => {} ,
      end: () => { gain('kekuatan', 3); gain('nyali', 0.5); toast(`Latihan samsak selesai. Kekuatan ${player.stats?.kekuatan ?? 1} (xp ${Math.floor(player.stats?.kekuatanXp ?? 0)})`); } };
  }

  /* ---------------- aksi pemain: tendang / tembak / pegang bola */
  let actT = null;   // { anim, t, dur, at, fn }
  const heading = () => ({ x: Math.cos(player.heading), z: Math.sin(player.heading) });
  function nearBall(b, r) { return Math.hypot(b.p.x - player.x, b.p.z - player.z) < r && b.p.y < 0.6; }
  function kick() {
    if (!nearBall(ball, 1.0) || ball.held) return false;
    actT = { anim: 'kickBall', t: 0, dur: 8 / 13, at: 0.28, fn: () => {
      if (!nearBall(ball, 1.15)) return;
      let { x: hx, z: hz } = heading();
      for (const sd of [-1, 1]) { const gx = FB.x + sd * FB.hl, gz = FB.z, ux = gx - ball.p.x, uz = gz - ball.p.z, l = Math.hypot(ux, uz); if (l < 7 && (ux * hx + uz * hz) / l > 0.8) { hx = ux / l; hz = uz / l; const e = (Math.random() - 0.5) * 0.25; const c = Math.cos(e), s = Math.sin(e); [hx, hz] = [hx * c - hz * s, hx * s + hz * c]; } }
      gain('kelincahan', 0.4);
      const pw = player.run ? 9.5 : 7; ball.v.x = hx * pw; ball.v.z = hz * pw; ball.v.y = player.run ? 2.8 : 1.6; ball.cd = 0.4;
    } };
    return true;
  }
  function shoot() {
    if (!bball.held) return false;
    actT = { anim: 'shoot', t: 0, dur: 10 / 12, at: 0.45, fn: () => {
      bball.held = false; const { x: hx, z: hz } = heading();
      bball.p.x = player.x + hx * 0.25; bball.p.z = player.z + hz * 0.25; bball.p.y = 1.45;
      const R = BK.rims.slice().sort((a, b) => Math.hypot(a.x - player.x, a.z - player.z) - Math.hypot(b.x - player.x, b.z - player.z))[0];
      const d = Math.hypot(R.x - bball.p.x, R.z - bball.p.z), skill = 1 + ((player.stats?.kelincahan || 1) - 1) * 0.04;
      const pIn = Math.max(0.12, Math.min(0.92, (1.02 - d * 0.1 - (Math.hypot(player.vx, player.vz) > 1 ? 0.15 : 0)) * skill));
      const ok = Math.random() < pIn, ea = Math.random() * Math.PI * 2, er = ok ? Math.random() * 0.06 : 0.24 + Math.random() * 0.22;
      const tx = R.x + Math.cos(ea) * er, tz = R.z + Math.sin(ea) * er, ty = R.y + 0.02, T = 0.62 + d * 0.09;
      bball.v.x = (tx - bball.p.x) / T; bball.v.z = (tz - bball.p.z) / T; bball.v.y = (ty - bball.p.y + 0.5 * G * T * T) / T;
      bball.shot = { d, made: false }; bball.cd = 0.8; gain('kelincahan', ok ? 0.6 : 0.3);
    } };
    return true;
  }
  function holdBall(dt) {
    if (!bball.held) {
      if (!player.swim && !player.riding && bball.cd <= 0 && nearBall(bball, 0.5) && Math.hypot(bball.p.x - BK.x, bball.p.z - BK.z) < 8) { bball.held = true; bball.shot = null; }
      return;
    }
    if (Math.hypot(player.x - BK.x, player.z - BK.z) > 9 || player.riding || player.swim) { bball.held = false; bball.v.x = bball.v.z = 0; bball.cd = 1; return; }
    const { x: hx, z: hz } = heading(), t = performance.now() / 1000, mv = Math.hypot(player.vx, player.vz) > 0.3;
    bball.p.x = player.x + hx * 0.33 - hz * 0.1; bball.p.z = player.z + hz * 0.33 + hx * 0.1;
    bball.p.y = actT ? 1.0 : 0.13 + Math.abs(Math.sin(t * (mv ? 9 : 7))) * 0.42;
    if (bball.mesh) bball.mesh.rotation.x += dt * 4;
  }
  function dribbleFoot(dt) {   // bola sepak menempel di kaki saat berlari ke arahnya
    if (actT || player.riding || player.swim || ball.cd > 0) return;
    const dx = ball.p.x - player.x, dz = ball.p.z - player.z, d = Math.hypot(dx, dz), sp = Math.hypot(player.vx, player.vz);
    if (d < 0.5 && ball.p.y < 0.35) {
      const { x: hx, z: hz } = heading();
      if (sp > 0.4) { const tx = player.x + hx * 0.42, tz = player.z + hz * 0.42; ball.v.x = player.vx * 1.05 + (tx - ball.p.x) * 7; ball.v.z = player.vz * 1.05 + (tz - ball.p.z) * 7; }
      else if (d < 0.32) { ball.p.x = player.x + dx / (d || 1) * 0.32; ball.p.z = player.z + dz / (d || 1) * 0.32; }
    }
  }

  /* ---------------- memancing: lempar -> tunggu -> umpan dimakan -> tarik-ulur -> dapat ikan */
  const spots = [...(P.fish || [])];
  if (P.raft) for (const e of [P.raft.a, P.raft.b]) { let best = null; for (let a = 0; a < 6.28; a += 0.2) { const x = e.x + Math.cos(a) * 1.4, z = e.z + Math.sin(a) * 1.4; if (M.waterAt(x, z)) { best = a; break; } } if (best !== null) spots.push({ x: e.x + Math.cos(best) * 0.25, z: e.z + Math.sin(best) * 0.25, h: best, name: 'Dermaga rakit' }); }
  const fishUI = document.createElement('div'); fishUI.id = 'fishUI';
  fishUI.innerHTML = '<b>Tarik-ulur!</b> <span>tahan Aksi = gulung, lepas = ulur</span><div class="fu-bar"><i class="fu-zone"></i><i class="fu-mark"></i></div><div class="fu-prog"><i></i></div>';
  document.body.appendChild(fishUI);
  const fz = fishUI.querySelector('.fu-zone'), fm = fishUI.querySelector('.fu-mark'), fp = fishUI.querySelector('.fu-prog i');
  const bobber = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshLambertMaterial({ color: '#e83a2a' })); bobber.visible = false; scene.add(bobber);
  let fish = null, hold = false;
  const inv = player.inv || (player.inv = {});
  function startFish(s) {
    player.x = s.x; player.z = s.z; player.heading = s.h; player.vx = player.vz = 0;
    fish = { s, st: 'cast', t: 0, bite: 2 + Math.random() * 5, tension: 0.4, prog: 0, pull: 0 };
  }
  function stopFish(msg) { if (msg) toast(msg); fish = null; bobber.visible = false; fishUI.style.display = 'none'; }
  function updateFish(dt, moving) {
    if (!fish) return null;
    fish.t += dt;
    const bx = fish.s.x + Math.cos(fish.s.h) * 2.0, bz = fish.s.z + Math.sin(fish.s.h) * 2.0, wy = M.waterAt(bx, bz) ? -0.46 : 0.05;
    if (fish.st !== 'cast' && moving) { stopFish('Pancing digulung'); return null; }
    if (fish.st === 'cast') { if (fish.t > 0.85) { fish.st = 'wait'; fish.t = 0; bobber.visible = true; } return 'fishCast'; }
    bobber.position.set(bx, wy + Math.sin(fish.t * 3) * 0.015, bz);
    if (fish.st === 'wait') {
      if (fish.t > fish.bite) { fish.st = 'bite'; fish.t = 0; say(null, '!'); toast('Umpan dimakan! Tekan Aksi!'); }
      return 'fishWait';
    }
    if (fish.st === 'bite') { bobber.position.y = wy - 0.06 - Math.abs(Math.sin(fish.t * 18)) * 0.04; if (fish.t > 1.3) { fish.st = 'wait'; fish.t = 0; fish.bite = 2 + Math.random() * 4; toast('Yah, umpannya lepas...'); } return 'fishWait'; }
    if (fish.st === 'reel') {
      fish.pull -= dt; if (fish.pull <= 0) { fish.pull = 0.5 + Math.random() * 1.2; fish.kick = (Math.random() - 0.3) * 0.5; }
      fish.tension += ((hold ? 0.75 : -0.55) + fish.kick) * dt;
      fish.tension = Math.max(0, fish.tension);
      const good = fish.tension > 0.3 && fish.tension < 0.72;
      fish.prog = Math.max(0, Math.min(1, fish.prog + (good ? 0.22 : -0.08) * dt));
      fz.style.left = '30%'; fz.style.width = '42%'; fm.style.left = Math.min(100, fish.tension * 100) + '%'; fp.style.width = fish.prog * 100 + '%';
      fm.style.background = good ? '#3aa84a' : '#e83a2a';
      bobber.position.y = wy - 0.08; bobber.position.x += Math.sin(fish.t * 9) * 0.05;
      if (fish.tension >= 1) { stopFish('Senarnya putus! Ikannya kabur.'); return null; }
      if (fish.tension <= 0.02 && fish.t > 2) { stopFish('Ikannya lepas, senar terlalu kendor.'); return null; }
      if (fish.prog >= 1) {
        const pond = fish.s.pond, tot = FISH.reduce((a, f) => a + f[3] * (pond && f[1] === 0 ? 0.3 : 1), 0); let r = Math.random() * tot, f = FISH[0];
        for (const k of FISH) { r -= k[3] * (pond && k[1] === 0 ? 0.3 : 1); if (r <= 0) { f = k; break; } }
        const kg = f[1] ? (f[1] + Math.random() * (f[2] - f[1])).toFixed(1) : 0;
        inv[f[0]] = (inv[f[0]] || 0) + 1;
        fish = { st: 'show', t: 0, s: fish.s }; fishUI.style.display = 'none'; bobber.visible = false;
        toast(kg ? `Dapat ${f[0]} ${kg} kg! (${Object.entries(inv).map(([k, v]) => k + ' ' + v).join(', ')})` : `Dapat... ${f[0].toLowerCase()}. Hmm.`);
        return 'fishShow';
      }
      return 'fishPull';
    }
    if (fish.st === 'show') { if (fish.t > 2.2) stopFish(); return 'fishShow'; }
    return null;
  }

  /* ---------------- kolam renang (berenang otomatis saat masuk), air kali/danau (Nyebur) */
  const pools = P.pools || [];
  function poolAt(x, z) { for (const p of pools) { const c = Math.cos(-p.a), s = Math.sin(-p.a), dx = x - p.x, dz = z - p.z; if (Math.abs(dx * c - dz * s) < p.w / 2 - 0.05 && Math.abs(dx * s + dz * c) < p.d / 2 - 0.05) return p; } return null; }

  /* ---------------- API untuk main.js */
  return {
    balls, score, poolAt, spots, bags,
    setHold(v) { hold = v; },
    get busy() { return !!fish || !!actT; }, get fishState() { return fish && fish.st + ' ' + fish.t.toFixed(2); },
    // tombol Pukul / F: tendang atau tembak dulu kalau sedang main bola
    action() { if (actT) return true; return shoot() || kick(); },
    target() {
      if (player.riding) return null;
      if (bball.held) return { kind: 'act', label: 'Tembak ke ring', fn: shoot };
      if (nearBall(ball, 0.9)) return { kind: 'act', label: 'Tendang bola', fn: kick };
      if (fish) return fish.st === 'bite' ? { kind: 'act', label: 'Tarik!', fn: () => { fish.st = 'reel'; fish.t = 0; fish.tension = 0.45; fishUI.style.display = 'block'; } } : fish.st === 'wait' ? { kind: 'act', label: 'Sabar... (gerak = gulung pancing)', fn: () => {} } : null;
      for (const s of spots) if (Math.hypot(s.x - player.x, s.z - player.z) < 1.1) return { kind: 'act', label: 'Mancing (' + s.name + ')', fn: () => startFish(s) };
      if (P.raft) for (const [e, o] of [[P.raft.a, P.raft.b], [P.raft.b, P.raft.a]]) if (Math.hypot(e.x - player.x, e.z - player.z) < 1.6) return { kind: 'go2', label: 'Naik rakit ke seberang (2rb)', to: o };
      for (const b of bags) if (Math.hypot(b.x - player.x, b.z - player.z) < 1.2) return { kind: 'act', label: 'Latihan samsak (Kekuatan)', fn: () => trainBag(b) };
      if (P.fire && Math.hypot(P.fire.x - player.x, P.fire.z - player.z) < 2.2) return { kind: 'act', label: 'Duduk di api unggun', fn: () => { player.emote = 'sitDown'; player.heading = Math.atan2(P.fire.z - player.z, P.fire.x - player.x); } };
      if (!player.swim) { const { x: hx, z: hz } = heading(); for (const d of [0.7, 1.0, 1.3]) { const x = player.x + hx * d, z = player.z + hz * d; if (M.waterAt(x, z) && !M.waterAt(player.x, player.z) && M.roadDist(x, z) > 0.4) return { kind: 'swim', label: 'Nyebur (berenang)', x, z }; } }
      return null;
    },
    // dipanggil tiap frame setelah gerak pemain; mengembalikan animasi pengganti (atau null) dan apakah gerak dikunci
    update(dt, moving) {
      goalT -= dt;
      for (const b of balls) stepBall(b, dt);
      dribbleFoot(dt); holdBall(dt);
      for (const b of balls) b.mesh.position.set(b.p.x, b.p.y, b.p.z);
      let anim = null, lock = false;
      for (const b of bags) { b.sv += (-b.sw * 9 - b.sv * 1.2) * dt; b.sw += b.sv * dt; b.piv.rotation.set(0, -b.a, 0); b.piv.rotateX(b.sw * 0.12); }
      if (actT) { actT.t += dt; actT.tick?.(actT.t); if (!actT.done && actT.t >= actT.at) { actT.done = true; actT.fn(); } anim = actT.anim; lock = true; if (actT.t >= actT.dur) { actT.end?.(); actT = null; } }
      const fa = updateFish(dt, moving); if (fa) { anim = fa; lock = fish && fish.st !== 'wait' && fish.st !== 'bite' ? true : false; }
      if (!anim && bball.held && !moving) anim = 'dribble';
      return { anim, lock };
    },
  };
}
