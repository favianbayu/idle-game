// Interior bangunan yang bisa dimasuki (Aksi di pintu): rumah Om Darto, Indomurah, warung kelontong, markas Lampu Kota,
// GOR, pabrik es tua, Gua Kapur, rumah pohon, pondok. Tiap ruangan dibangun di luar peta (x >= 700) sebagai area 'dalam';
// dinding yang menghalangi kamera disembunyikan (cutaway) supaya isi ruangan selalu kelihatan dari sudut mana pun.
import * as THREE from 'three';
import { Merger, col, shade, mix } from './geom.js';
import { MAT, hash, pick } from './common.js';
import { L } from './buildings.js';
import { CATALOG } from './shop.js';
import { WARUNGS } from './signs.js';
import INTERIORS from './data/interiors.json';
import { makeRide } from './rides.js';

const OX = 700, OZ = 30, GAP = 40, OZB = 130;   // OZB: baris kedua untuk ruangan besar (GOR, STM)
const C = c => col(c);
const GOODS = ['#e85a5a', '#f2c230', '#3a7ac0', '#6ab85a', '#f2f2f2', '#e8823a', '#c25a8a', '#2a2a2e', '#8a5a3a', '#5ac0c0'];

// papan tulisan (kanvas) untuk nama toko & poster di dalam ruangan
function textPlane(lines, w, h, bg, fg, px = 64) {
  const cv = document.createElement('canvas'), k = 128; cv.width = Math.round(w * k); cv.height = Math.round(h * k);
  const g = cv.getContext('2d'); g.textAlign = 'center'; g.textBaseline = 'middle';
  const draw = (lines, bg, fg) => {
    g.fillStyle = bg; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = fg;
    const L2 = [].concat(lines); L2.forEach((t, i) => { g.font = `bold ${i ? px * 0.55 : px}px Trebuchet MS, sans-serif`; g.fillText(t, cv.width / 2, cv.height * (i + 0.5) / L2.length, cv.width - 8); });
  };
  draw(lines, bg, fg);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
  mesh.userData.redraw = (lines, bg2, fg2) => { draw(lines, bg2, fg2); tex.needsUpdate = true; };
  return mesh;
}

export function makeInteriors({ scene, kota, collision, player, Character, npcs, shop, acts, fight, toast, kolam }) {
  const rooms = {}, outDoors = [];
  let slot = 0, cur = null;

  /* ---------------- kerangka ruangan */
  function room(id, name, w, d, o = {}) {
    const ox = o.ox ?? OX + slot * GAP, oz = o.oz ?? OZ; slot++;
    const H = o.h || 2.5, wc = C(o.wall || '#e8e0cc'), doorX = o.doorX || 0, dw = o.doorW || 1.2;
    const P = (lx, lz, a = 0) => ({ x: ox + lx, z: oz + lz, a });
    const st = new Merger(), W = { back: new Merger(), front: new Merger(), left: new Merger(), right: new Merger() };
    const X = P(0, 0), t = 0.16, trim = shade(wc, 0.75), base = o.base ? C(o.base) : shade(wc, 0.55);
    // dinding: bagian bawah warna lis, atas warna dinding; sisi dalam saja yang penting
    const wall = (m, lx, lz, sx, sz) => { m.box(X, lx, 0, lz, sx, 0.9, sz, base); m.box(X, lx, 0.9, lz, sx, 0.06, sz, trim); m.box(X, lx, 0.96, lz, sx, H - 0.96, sz, wc); };
    wall(W.back, 0, -d / 2 - t / 2, w + t * 2, t); wall(W.left, -w / 2 - t / 2, 0, t, d); wall(W.right, w / 2 + t / 2, 0, t, d);
    const l0 = -w / 2 - t, l1 = o.noDoor ? 0 : doorX - dw / 2, r0 = o.noDoor ? 0 : doorX + dw / 2, r1 = w / 2 + t;   // lantai atas: dinding depan utuh
    wall(W.front, (l0 + l1) / 2, d / 2 + t / 2, l1 - l0, t); wall(W.front, (r0 + r1) / 2, d / 2 + t / 2, r1 - r0, t);
    if (!o.noDoor) {
    W.front.box(X, doorX, 2.1, d / 2 + t / 2, dw, H - 2.1, t, wc); W.front.box(X, doorX, 2.05, d / 2 + t / 2, dw + 0.12, 0.08, t + 0.04, shade(wc, 0.6));
    // ambang pintu: cahaya luar & keset
    W.front.box(X, doorX, 0, d / 2 + t / 2, dw, 2.05, 0.02, C(o.outside || '#fff6d8'));
    st.box(X, doorX, 0.005, d / 2 - 0.45, dw * 0.8, 0.02, 0.5, C('#8a3a2a')); }
    // lis rendah tetap terlihat walau dinding disembunyikan
    for (const [lx, lz, sx, sz] of [[0, -d / 2 - t / 2, w + t * 2, t], [-w / 2 - t / 2, 0, t, d], [w / 2 + t / 2, 0, t, d], [(l0 + l1) / 2, d / 2 + t / 2, l1 - l0, t], [(r0 + r1) / 2, d / 2 + t / 2, r1 - r0, t]]) st.box(X, lx, 0, lz, sx, 0.3, sz, base);
    // lantai + alas gelap di bawahnya
    if (!o.noUnder) st.box(X, 0, -0.4, 0, w + 3, 0.38, d + 3, C('#141418'));
    collision.box(ox, oz - d / 2 - t / 2, w / 2 + t, t / 2); collision.box(ox - w / 2 - t / 2, oz, t / 2, d / 2 + t); collision.box(ox + w / 2 + t / 2, oz, t / 2, d / 2 + t);
    collision.box(ox + (l0 + l1) / 2, oz + d / 2 + t / 2, (l1 - l0) / 2, t / 2); collision.box(ox + (r0 + r1) / 2, oz + d / 2 + t / 2, (r1 - r0) / 2, t / 2);
    if (!o.noDoor) collision.box(ox + doorX, oz + d / 2 + 0.3, dw / 2, 0.12);   // ambang: tidak bisa jalan keluar tembus, harus lewat Aksi
    const R = { id, name, ox, oz, w, d, H, P, st, W, X, wc, spots: [], walls: {}, extra: { back: [], left: [], right: [], front: [] },
      exit: o.noDoor ? null : { x: ox + doorX, z: oz + d / 2 - 0.75 }, dark: o.dark,
      solid: (p, sx, sz) => collision.box(p.x, p.z, sx / 2, sz / 2, p.a || 0),
      spot: (lx, lz, r, label, fn) => R.spots.push({ x: ox + lx, z: oz + lz, r, label, fn }),
      sign: (wallName, lines, lx, y, w2, h2, bg, fg, px) => {   // papan di dinding (ikut disembunyikan bersama dindingnya)
        const m = textPlane(lines, w2, h2, bg, fg, px);
        if (wallName === 'back') { m.position.set(ox + lx, y, oz - d / 2 + 0.01); }
        else if (wallName === 'left') { m.position.set(ox - w / 2 + 0.01, y, oz + lx); m.rotation.y = Math.PI / 2; }
        else if (wallName === 'right') { m.position.set(ox + w / 2 - 0.01, y, oz + lx); m.rotation.y = -Math.PI / 2; }
        R.extra[wallName].push(m); scene.add(m); return m;
      } };
    rooms[id] = R; return R;
  }
  function finish(R) {
    const st = new THREE.Mesh(R.st.build(), MAT.world); st.receiveShadow = true; st.castShadow = true; scene.add(st);
    const N = { back: [0, -1], front: [0, 1], left: [-1, 0], right: [1, 0] };
    for (const [k, m] of Object.entries(R.W)) { const mesh = new THREE.Mesh(m.build(), MAT.world); mesh.receiveShadow = true; scene.add(mesh); R.walls[k] = { mesh, n: N[k] }; }
  }

  /* ---------------- perabot (koordinat lokal p, depan = +z) */
  // holes: [x, y, w, h] dalam koordinat denah (0..w, 0..d), lantai dikosongkan (kolam)
  const tiles = (R, c1, c2, s = 0.5, holes = []) => { const a = C(c1), b = C(c2); for (let i = 0; i < Math.ceil(R.w / s); i++) for (let j = 0; j < Math.ceil(R.d / s); j++) { if (holes.some(([hx, hy, hw, hh]) => i * s >= hx - 1e-6 && i * s < hx + hw - 1e-6 && j * s >= hy - 1e-6 && j * s < hy + hh - 1e-6)) continue; const x0 = -R.w / 2 + i * s, z0 = -R.d / 2 + j * s, sx = Math.min(s, R.w / 2 - x0), sz = Math.min(s, R.d / 2 - z0); R.st.box(R.X, x0 + sx / 2, -0.02, z0 + sz / 2, sx, 0.02, sz, (i + j) % 2 ? a : b); } };
  const planks = (R, c, s = 0.3) => { const a = C(c); for (let i = 0; i < Math.ceil(R.w / s); i++) { const x0 = -R.w / 2 + i * s, sx = Math.min(s, R.w / 2 - x0); R.st.box(R.X, x0 + sx / 2, -0.02, 0, sx - 0.015, 0.02, R.d, shade(a, 0.85 + hash(i, 7) * 0.25)); } R.st.box(R.X, 0, -0.03, 0, R.w, 0.01, R.d, shade(a, 0.4)); };
  const flat = (R, c) => R.st.box(R.X, 0, -0.02, 0, R.w, 0.02, R.d, C(c));
  function table(m, p, w, d, h = 0.75, c = '#8a5a34', top) { const k = C(c); m.box(p, 0, h - 0.05, 0, w, 0.05, d, top ? C(top) : k); for (const sx of [-1, 1]) for (const sz of [-1, 1]) m.box(p, sx * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06), 0.06, h - 0.05, 0.06, shade(k, 0.8)); }
  function chair(m, p, c = '#6a4a2a') { const k = C(c); m.box(p, 0, 0.42, 0, 0.4, 0.05, 0.4, k); for (const sx of [-1, 1]) for (const sz of [-1, 1]) m.box(p, sx * 0.17, 0, sz * 0.17, 0.04, 0.42, 0.04, shade(k, 0.8)); m.box(p, 0, 0.47, -0.18, 0.4, 0.45, 0.04, k); }
  function stool(m, p, c = '#d83a2a') { const k = C(c); m.box(p, 0, 0, 0, 0.3, 0.42, 0.3, shade(k, 0.7)); m.box(p, 0, 0.42, 0, 0.34, 0.04, 0.34, k); }
  function sofa(m, p, w, c = '#5a6a8a') { const k = C(c); m.box(p, 0, 0, 0, w, 0.42, 0.8, k); m.box(p, 0, 0.42, -0.3, w, 0.45, 0.2, shade(k, 0.9)); for (const sx of [-1, 1]) m.box(p, sx * (w / 2 - 0.1), 0.42, 0, 0.2, 0.2, 0.8, shade(k, 0.85)); for (let i = 0; i < Math.round(w / 0.6); i++) m.box(p, -w / 2 + 0.35 + i * 0.6, 0.42, 0.02, 0.5, 0.06, 0.55, mix(k, C('#ffffff'), 0.12)); }
  function bed(m, p, sheet = '#4a7ac0') { m.box(p, 0, 0, 0, 1.1, 0.35, 2.0, C('#7a5030')); m.box(p, 0, 0.35, 0.05, 1.04, 0.14, 1.9, C('#f2f0e8')); m.box(p, 0, 0.49, 0.3, 1.06, 0.06, 1.3, C(sheet)); m.box(p, 0, 0.49, -0.7, 0.7, 0.12, 0.35, C('#ffffff')); m.box(p, 0, 0, -1.0, 1.1, 0.95, 0.08, C('#6a4428')); }
  function tv(m, p) { m.box(p, 0, 0, 0, 1.4, 0.5, 0.45, C('#6a4428')); m.box(p, 0, 0.5, 0, 0.9, 0.55, 0.06, C('#1a1a1e')); m.box(p, 0, 0.53, 0.035, 0.82, 0.48, 0.01, C('#3a6a9a')); for (let i = 0; i < 4; i++) m.box(p, -0.5 + i * 0.12, 0.3, 0.23, 0.08, 0.14, 0.02, C(pick(GOODS, hash(i, 3)))); }
  function shelfUnit(m, p, len, h, rows, seed, depth = 0.4, frame = '#9aa0a8', two = false) {
    const f = C(frame);
    for (const sx of [-1, 1]) m.box(p, sx * len / 2, 0, 0, 0.05, h, depth, shade(f, 0.8));
    if (!two) m.box(p, 0, 0, -depth / 2 + 0.02, len, h, 0.03, shade(f, 0.7)); else m.box(p, 0, 0.1, 0, len, h - 0.1, 0.03, shade(f, 0.7));
    for (let r = 0; r < rows; r++) {
      const y = 0.1 + r * (h - 0.15) / rows; m.box(p, 0, y, 0, len, 0.03, depth, f);
      for (const side of two ? [1, -1] : [1]) for (let i = 0; i < Math.floor(len / 0.13); i++) {
        if (hash(seed + r * 7 + side, i) > 0.88) continue;
        const c = C(GOODS[Math.floor(hash(seed + r, i * 3 + side) * GOODS.length)]), tall = 0.1 + hash(seed, i + r * 31) * 0.16, kind = hash(seed * 3 + r, i);
        const gx = -len / 2 + 0.08 + i * 0.13, gz = side * (two ? depth / 4 : 0.02);
        if (kind < 0.3) m.box(p, gx, y + 0.03, gz, 0.07, tall + 0.06, 0.07, c);   // botol
        else if (kind < 0.65) m.box(p, gx, y + 0.03, gz, 0.11, tall, 0.08, c, { top: mix(c, C('#ffffff'), 0.3) });   // kotak
        else { m.box(p, gx, y + 0.03, gz, 0.1, 0.08, 0.1, c); m.box(p, gx, y + 0.11, gz, 0.1, 0.07, 0.1, shade(c, 0.85)); }   // kaleng bertumpuk
      }
      m.box(p, 0, y - 0.04, depth / 2 * (two ? 1 : 1), len, 0.04, 0.01, C('#f2c230'));   // label harga
    }
  }
  function fridge(m, p, w, seed, c = '#e8e8ec') {
    const k = C(c); m.box(p, 0, 0, 0, w, 1.9, 0.6, k); m.box(p, 0, 1.75, 0.305, w - 0.06, 0.13, 0.01, C('#d8202a'));
    for (let r = 0; r < 4; r++) for (let i = 0; i < Math.floor((w - 0.1) / 0.1); i++) m.box(p, -w / 2 + 0.1 + i * 0.1, 0.12 + r * 0.4, 0.2, 0.06, 0.24, 0.06, C(pick(['#3a8a4a', '#e8302a', '#7ac0e8', '#f2c230', '#f28a1a', '#2a2a2e'], hash(seed + r, i))));
    m.box(p, 0, 0.08, 0.3, w - 0.08, 1.62, 0.015, mix(C('#a8d0e8'), C('#ffffff'), 0.4));
    for (let i = 1; i < Math.round(w / 0.7); i++) m.box(p, -w / 2 + i * w / Math.round(w / 0.7), 0.05, 0.31, 0.04, 1.7, 0.02, k);
  }
  function counter(m, p, w, c = '#c83a2a', top = '#e8e4dc') { m.box(p, 0, 0, 0, w, 0.95, 0.6, C(c)); m.box(p, 0, 0.95, 0, w + 0.06, 0.05, 0.66, C(top)); }
  function register(m, p) { m.box(p, 0, 1.0, 0, 0.36, 0.14, 0.3, C('#2a2a2e')); m.box(p, 0, 1.14, -0.06, 0.3, 0.2, 0.04, C('#3a3a40')); m.box(p, 0, 1.17, -0.035, 0.24, 0.12, 0.01, C('#5ac8e8')); }
  function rug(m, p, w, d, c1, c2) { m.box(p, 0, 0, 0, w, 0.015, d, C(c1)); m.box(p, 0, 0.002, 0, w - 0.2, 0.015, d - 0.2, C(c2)); m.box(p, 0, 0.004, 0, w - 0.4, 0.015, d - 0.4, C(c1)); }
  function pot(m, p, s = 1, flower = '#e83a5a') { m.box(p, 0, 0, 0, 0.26 * s, 0.24 * s, 0.26 * s, C('#b8582a')); m.box(p, 0, 0.24 * s, 0, 0.3 * s, 0.04 * s, 0.3 * s, C('#9a4a22')); for (let i = 0; i < 5; i++) { const a = i * 1.3; m.box(p, Math.cos(a) * 0.08 * s, 0.26 * s, Math.sin(a) * 0.08 * s, 0.05 * s, (0.25 + hash(i, 9) * 0.2) * s, 0.05 * s, C('#3a8a3a')); m.box(p, Math.cos(a) * 0.1 * s, (0.48 + hash(i, 9) * 0.2) * s, Math.sin(a) * 0.1 * s, 0.1 * s, 0.08 * s, 0.1 * s, C(i % 2 ? flower : '#f2d23a')); } }
  function crate(m, p, s = 0.5, c = '#a8784a') { const k = C(c); m.box(p, 0, 0, 0, s, s * 0.8, s, k); for (const y of [0.1, 0.5]) m.box(p, 0, s * y, s / 2 + 0.005, s, 0.06, 0.01, shade(k, 0.7)); }
  function sack(m, p, c = '#d8c8a0') { const k = C(c); m.box(p, 0, 0, 0, 0.45, 0.5, 0.3, k); m.box(p, 0, 0.5, 0, 0.3, 0.08, 0.2, shade(k, 0.85)); }
  function poster(R, wallName, lx, y, w, h, c1, c2) { const m = R.W[wallName], X = R.X, o = wallName === 'back' ? [lx, -R.d / 2 + 0.01, w, 0.02] : wallName === 'left' ? [-R.w / 2 + 0.01, lx, 0.02, w] : [R.w / 2 - 0.01, lx, 0.02, w]; m.box(X, o[0], y, o[1], o[2], h, o[3], C(c1)); m.box(X, o[0], y + h * 0.2, o[1], o[2] * (o[2] > 0.1 ? 0.7 : 1.5), h * 0.45, o[3] * (o[3] > 0.1 ? 0.7 : 1.5), C(c2)); }
  function clock(R, lx, y) { R.W.back.box(R.X, lx, y, -R.d / 2 + 0.02, 0.36, 0.36, 0.04, C('#ffffff')); R.W.back.box(R.X, lx, y + 0.17, -R.d / 2 + 0.05, 0.03, 0.14, 0.01, C('#1a1a1a')); R.W.back.box(R.X, lx + 0.05, y + 0.17, -R.d / 2 + 0.05, 0.1, 0.03, 0.01, C('#1a1a1a')); }
  function windowB(R, wallName, lx, w = 1.0) { const m = R.W[wallName]; const glass = C('#bfe0f0'), fr = C('#f2eee6'); if (wallName === 'back') { m.box(R.X, lx, 1.05, -R.d / 2 + 0.01, w + 0.1, 1.0, 0.03, fr); m.box(R.X, lx, 1.1, -R.d / 2 + 0.03, w, 0.9, 0.01, glass); m.box(R.X, lx, 1.1, -R.d / 2 + 0.04, 0.04, 0.9, 0.01, fr); } else { const s = wallName === 'left' ? -1 : 1; m.box(R.X, s * (R.w / 2 - 0.01), 1.05, lx, 0.03, 1.0, w + 0.1, fr); m.box(R.X, s * (R.w / 2 - 0.03), 1.1, lx, 0.01, 0.9, w, glass); } }
  function lampBulbs(m, R, y, c = '#fff2a0') { for (let i = 0; i < 9; i++) { const x = -R.w / 2 + 0.4 + i * (R.w - 0.8) / 8; m.box(R.X, x, y - Math.sin(i / 8 * Math.PI) * 0.25, -R.d / 2 + 0.3, 0.1, 0.12, 0.1, C(c)); } }
  function rock(m, p, s, c = '#8a8a82') { const k = C(c); m.box(p, 0, 0, 0, s, s * 0.7, s * 0.9, k); m.box(p, s * 0.1, s * 0.6, -s * 0.05, s * 0.7, s * 0.4, s * 0.6, shade(k, 1.1)); }

  /* ---------------- NPC di dalam ruangan */
  function addNPC(R, sid, name, lx, lz, lines, roam = 0.4, extra = {}) {
    const c = new Character(sid); scene.add(c.group); const x = R.ox + lx, z = R.oz + lz;
    const n = { sid, name, filler: true, lines, c, home: { x, z }, x, z, tx: x, tz: z, wait: Math.random() * 3, heading: Math.PI / 2, say: null, greetT: Math.random() * 6, roam, key: 'in' + R.id + npcs.length, area: 'dalam', ...extra };
    npcs.push(n); return n;
  }
  const restOK = { t: -99 };
  const sleep = () => acts.doAct('lie', 3.2, () => { player.fx.hp = fight.maxHP(); const f = player.flags || (player.flags = {}); f.gymN = 0; f.gymPaid = false; f.poolPaid = false; f.day = (f.day || 0) + 1; dispatchEvent(new CustomEvent('newday', { detail: f.day })); toast('Tidur... bangun, hari baru! Nyawa pulih penuh. (Tersimpan)'); fight.gain('nyali', 0.5); });   // tidur = ganti hari (jatah sesi gym)

  // ruangan besar (GOR, bengkel STM) pakai koordinat denah guide: (x, y) petak dari pojok kiri atas, y ke bawah = ke arah pintu
  function plan(R) {
    const W = R.w, D = R.d, m = R.st;
    const at = (x, y, a = 0) => R.P(x - W / 2, y - D / 2, a);
    const solid = (x, y, w, h) => collision.box(R.ox + x + w / 2 - W / 2, R.oz + y + h / 2 - D / 2, w / 2, h / 2);
    const box = (x, y, w, h, hy, c, o = {}) => { m.box(R.X, x + w / 2 - W / 2, o.y || 0, y + h / 2 - D / 2, w, hy, h, typeof c === 'string' ? C(c) : c, o.top ? { top: C(o.top) } : undefined); if (o.solid) solid(x, y, w, h); };
    // sekat setinggi dada (isi ruangan tetap kelihatan) dengan celah pintu [a, b] di sepanjang sekat
    const part = (x0, y0, x1, y1, gaps = [], h = 1.3, c = '#e8e2d0') => {
      const hor = y0 === y1, a1 = hor ? x1 : y1; let s0 = hor ? x0 : y0;
      for (const g of [...gaps].sort((p, q) => p[0] - q[0]).concat([[a1, a1]])) {
        const e = Math.min(a1, g[0]);
        if (e - s0 > 0.1) { if (hor) { box(s0, y0 - 0.07, e - s0, 0.14, h, c, { solid: true }); box(s0, y0 - 0.08, e - s0, 0.16, 0.05, '#8a6a4a', { y: h }); } else { box(x0 - 0.07, s0, 0.14, e - s0, h, c, { solid: true }); box(x0 - 0.08, s0, 0.16, e - s0, 0.05, '#8a6a4a', { y: h }); } }
        s0 = Math.max(s0, g[1]);
      }
    };
    const label = (x, y, text, w = 2.6) => { const lab = textPlane([text], w, 0.42, '#2a2014', '#fff6d8', 46); lab.rotation.x = -Math.PI / 2; lab.position.set(R.ox + x - W / 2, 0.016, R.oz + y - D / 2); scene.add(lab); };
    const spot = (x, y, r, l, fn) => R.spot(x - W / 2, y - D / 2, r, l, fn);
    const npc = (sid, name, x, y, lines, roam = 0.6) => addNPC(R, sid, name, x - W / 2, y - D / 2, lines, roam);
    const plane = (lines, x, y, h, w, hh, rotY, bg, fg, px) => { const t = textPlane(lines, w, hh, bg, fg, px); t.position.set(R.ox + x - W / 2, h, R.oz + y - D / 2); t.rotation.y = rotY; scene.add(t); return t; };
    const world = (x, y) => [R.ox + x - W / 2, R.oz + y - D / 2];
    return { at, box, solid, part, label, spot, npc, plane, world, m };
  }
  // sesi latihan gym GOR (guide 89): tiket harian Rp15.000 / member bulanan, maks 2 sesi sehari (lewat dari itu cedera ringan),
  // tiap sesi stat +1 level (setengahnya setelah level 5)
  function gymSession(name, anim, stats) {
    return () => {
      const f = player.flags || (player.flags = {}), st = player.stats || {};
      if ((f.gymN || 0) >= 2) { acts.doAct(anim, 1.6, () => { player.fx.hp = Math.max(1, Math.round(player.fx.hp * 0.5)); toast('Otot ketarik! Kebanyakan latihan, cedera ringan. Tidur dulu biar pulih.'); }); return; }
      if (!f.gymMember && !f.gymPaid) { if (player.uang < 15000) { toast('Tiket harian gym Rp15.000. Uangnya kurang...'); return; } player.uang -= 15000; shop.showMoney(); f.gymPaid = true; toast('Bayar tiket harian gym Rp15.000'); }
      acts.doAct(anim, 4, () => { f.gymN = (f.gymN || 0) + 1; for (const k of stats) { const lv = st[k] || 1; fight.gain(k, (6 + lv * 6) * (lv < 5 ? 1 : 0.5)); } toast(`${name} selesai (sesi ${f.gymN}/2 hari ini)`); });
    };
  }

  /* ================= 1. Rumah Om Darto: ruang tamu, kamar Raka, dapur + stok kopi warkop */
  { const R = room('rumah', 'Rumah Om Darto', 9, 7, { wall: '#d8e8c8', base: '#8a6a4a', doorX: -2.2 });
    tiles(R, '#e8dcc0', '#d8ccb0', 0.5); const m = R.st, P = R.P;
    // ruang tamu (depan kiri)
    rug(m, P(-2.2, 0.6), 2.4, 1.8, '#a83a2a', '#e8c070'); sofa(m, P(-2.2, -0.6), 2.0, '#6a7a5a'); R.solid(P(-2.2, -0.6), 2.0, 0.8);
    table(m, P(-2.2, 0.6), 1.0, 0.55, 0.42, '#6a4428'); R.solid(P(-2.2, 0.6), 1.0, 0.55);
    m.box(P(-2.2, 0.6), -0.2, 0.42, 0, 0.1, 0.1, 0.1, C('#ffffff')); m.box(P(-2.2, 0.6), 0.15, 0.42, 0.05, 0.1, 0.1, 0.1, C('#ffffff')); m.box(P(-2.2, 0.6), 0.15, 0.52, 0.05, 0.08, 0.01, 0.08, C('#3a2214'));   // gelas kopi
    tv(m, P(-2.2, 2.5, Math.PI)); R.solid(P(-2.2, 2.5), 1.4, 0.45);
    // dinding belakang: foto keluarga, kalender, jam, jendela
    poster(R, 'back', -3.4, 1.4, 0.6, 0.45, '#6a4428', '#c8a080'); poster(R, 'back', -2.2, 1.5, 0.5, 0.6, '#f4f4f0', '#d83a2a'); clock(R, -1.2, 1.7); windowB(R, 'back', 0.6, 1.0);
    // pembatas kamar Raka (kanan)
    m.box(R.X, 1.5, 0, -0.2, 0.1, 2.2, 4.4, C('#c8d8b8')); R.solid(P(1.5, -0.2), 0.12, 4.4);
    bed(m, P(3.4, -2.2)); R.solid(P(3.4, -2.2), 1.1, 2.0);
    table(m, P(2.3, -3.1), 1.1, 0.55, 0.75, '#8a6a4a'); chair(m, P(2.3, -2.6, Math.PI), '#3a5a8a'); R.solid(P(2.3, -3.1), 1.1, 0.55);
    m.box(P(2.3, -3.1), -0.35, 0.75, 0, 0.3, 0.05, 0.22, C('#f2f2ee')); m.box(P(2.3, -3.1), -0.33, 0.8, 0, 0.26, 0.04, 0.2, C('#e8302a')); m.box(P(2.3, -3.1), 0.35, 0.75, -0.1, 0.08, 0.35, 0.08, C('#2a2a2e')); m.box(P(2.3, -3.1), 0.3, 1.08, -0.05, 0.2, 0.06, 0.14, C('#f2c230'));   // buku, lampu belajar
    m.box(P(4.0, -0.3), 0, 0, 0, 0.5, 1.6, 0.5, C('#8a5a34')); R.solid(P(4.0, -0.3), 0.5, 0.5);   // lemari
    m.box(P(3.0, 0.6), 0, 0, 0, 0.4, 0.5, 0.25, C('#2a4a7a')); m.box(P(3.0, 0.6), 0, 0.5, 0, 0.3, 0.1, 0.2, C('#2a4a7a'));   // tas sekolah
    poster(R, 'right', -2.8, 1.3, 0.8, 0.9, '#1a1a1a', '#e8302a'); poster(R, 'right', -1.4, 1.4, 0.6, 0.7, '#2a6ac0', '#f2c230');   // poster band & motor
    m.box(P(2.4, 1.6), 0, 0, 0, 0.9, 0.04, 0.5, C('#3a3a40')); m.box(P(2.4, 1.6), 0, 0.04, 0, 0.5, 0.3, 0.12, C('#d83a2a'));   // gitar tergeletak (badan + leher)
    m.box(P(2.4, 1.6), 0.55, 0.04, 0, 0.5, 0.05, 0.06, C('#6a4428'));
    // dapur (kiri belakang)
    m.box(P(-3.9, -2.6), 0, 0, 0, 1.0, 0.85, 1.4, C('#c8c0b0')); m.box(P(-3.9, -2.6), 0, 0.85, 0, 1.04, 0.05, 1.44, C('#7a7a7a')); R.solid(P(-3.9, -2.6), 1.0, 1.4);
    m.box(P(-3.9, -3.0), 0, 0.9, 0, 0.5, 0.06, 0.4, C('#2a2a2e')); m.box(P(-3.9, -3.0), 0, 0.96, 0, 0.22, 0.16, 0.22, C('#c8c8cc')); m.box(P(-3.9, -2.2), 0, 0.9, 0, 0.4, 0.12, 0.36, C('#a8b0b8'));   // kompor, panci, bak cuci
    m.box(P(-3.9, -1.5), 0, 0, 0, 0.36, 1.05, 0.36, C('#e8e8ec')); m.box(P(-3.9, -1.5), 0, 1.05, 0, 0.3, 0.42, 0.3, C('#7ac0e8')); R.solid(P(-3.9, -1.5), 0.36, 0.36);   // dispenser galon
    R.W.left.box(R.X, -4.48, 1.4, -2.6, 0.04, 0.05, 1.4, C('#6a4428')); for (let i = 0; i < 5; i++) R.W.left.box(R.X, -4.44, 1.45, -3.1 + i * 0.25, 0.04, 0.2, 0.2, C('#f4f4f0'));   // rak piring
    table(m, P(-1.2, -2.4), 1.4, 0.8, 0.75, '#8a5a34'); R.solid(P(-1.2, -2.4), 1.4, 0.8); for (const [x, z, a] of [[-1.7, -1.8, Math.PI], [-0.7, -1.8, Math.PI], [-1.7, -3.0, 0], [-0.7, -3.0, 0]]) chair(m, P(x, z, a));
    m.box(P(-1.2, -2.4), 0, 0.75, 0, 0.4, 0.12, 0.4, C('#d8d0c0')); m.box(P(-1.2, -2.4), 0, 0.87, 0, 0.3, 0.05, 0.3, C('#f4f0e8')); m.box(P(-1.2, -2.4), 0.45, 0.75, 0.1, 0.18, 0.1, 0.18, C('#e8a040'));   // tudung saji, piring
    for (let i = 0; i < 3; i++) sack(m, P(0.6, -3.0 + i * 0.36), '#8a5a34');   // stok biji kopi warkop
    R.sign('back', ['KOPI', 'Warkop Simpang'], -0.2, 1.3, 0.7, 0.32, '#3a2214', '#f2d29a', 40);
    pot(m, P(-4.1, 3.0), 1.1, '#e83a5a'); pot(m, P(1.0, 3.0), 1.0, '#f2f2f2');
    R.spot(3.4, -1.0, 1.1, 'Tidur (nyawa pulih)', sleep);
    R.spot(-1.2, -1.6, 1.0, 'Makan masakan Bu Narti (gratis)', () => acts.doAct('sitDown', 2.4, () => { player.fx.hp = Math.min(fight.maxHP(), player.fx.hp + 6); toast('Kenyang! Nyawa +6'); }));
    R.spot(2.3, -2.3, 0.9, 'Belajar (Nyali +)', () => acts.doAct('read', 4, () => { fight.gain('nyali', 1.5); toast('Belajar bikin pede. Nyali naik dikit.'); }));
    R.spot(-2.2, 0.2, 1.0, 'Nonton TV', () => { player.emote = 'sitDown'; toast('Berita: balap liar di Jalan Lingkar makin rame...'); });
    addNPC(R, 'cici', 'Cici', 0.4, 1.2, ['Kak Raka, bantuin PR matematika dong!', 'Om Darto lagi di gerobak.', 'Jangan berantem terus, nanti dimarahin Om.'], 0.8);
    finish(R); R.doorLabel = 'Masuk rumah Om Darto';
  }

  /* ================= 2. Indomurah: lorong rak, kulkas minuman, kasir, rak impuls */
  { const R = room('indomurah', 'Indomurah', 10, 8, { wall: '#f4f4f0', base: '#1f4fb0', doorX: 2.6, outside: '#e8f4ff' });
    tiles(R, '#f2f2ee', '#e2e2de', 0.6); const m = R.st, P = R.P;
    for (const [i, x] of [-3.6, -1.4, 0.8].entries()) { shelfUnit(m, P(x, -0.6, Math.PI / 2), 4.0, 1.5, 4, 11 + i * 5, 0.7, '#c8ccd0', true); R.solid(P(x, -0.6), 0.7, 4.0); }
    fridge(m, P(-2.0, -3.6), 5.4, 3); R.solid(P(-2.0, -3.6), 5.4, 0.6);
    shelfUnit(m, P(-4.65, 2.2, Math.PI / 2), 2.6, 1.6, 4, 41, 0.5); R.solid(P(-4.65, 2.2), 0.5, 2.6);
    shelfUnit(m, P(3.2, -3.65), 3.0, 1.8, 4, 57, 0.5); R.solid(P(3.2, -3.65), 3.0, 0.5);
    // kasir
    counter(m, P(3.4, 1.4, Math.PI / 2), 2.4, '#1f4fb0'); R.solid(P(3.4, 1.4), 0.6, 2.4); register(m, P(3.4, 1.9, -Math.PI / 2));
    shelfUnit(m, P(4.7, 1.4, -Math.PI / 2), 2.2, 1.7, 5, 77, 0.35, '#2a2a2e'); R.solid(P(4.7, 1.4), 0.35, 2.2);
    for (let i = 0; i < 5; i++) m.box(P(3.05, 0.7 + i * 0.12), 0, 0.95, 0, 0.1, 0.12, 0.08, C(pick(GOODS, hash(i, 91))));   // permen & cokelat di meja kasir
    m.box(P(1.5, 2.6), 0, 0, 0, 0.6, 0.85, 0.5, C('#e8302a')); m.box(P(1.5, 2.6), 0, 0.85, 0, 0.56, 0.1, 0.46, C('#bfe0f0')); R.solid(P(1.5, 2.6), 0.6, 0.5);   // freezer es krim
    for (let i = 0; i < 3; i++) m.box(P(-0.6 + i * 0.3, 3.4), 0, 0, 0, 0.26, 0.5, 0.36, C('#2a6ac0'));   // keranjang belanja
    m.box(P(0.2, 3.2), 0, 0, 0, 0.5, 0.9, 0.04, C('#f2c230'));   // papan promo
    R.sign('back', ['Indomurah', 'MUDAH • MURAH • DEKAT'], 2.4, 2.0, 2.6, 0.42, '#1f4fb0', '#ffffff', 44);
    R.sign('left', ['PROMO', 'Beli 2 gratis 1'], -1.2, 1.9, 1.2, 0.5, '#f6c81a', '#d8202a', 40);
    R.sign('back', ['MINUMAN DINGIN'], -2.0, 2.12, 2.2, 0.26, '#d8202a', '#ffffff', 40);
    R.spot(2.6, 1.4, 1.2, 'Belanja di kasir', () => shop.open({ title: 'Indomurah', sub: 'Mbak Dewi di kasir', items: CATALOG.indomurah, thanks: 'Terima kasih, selamat belanja kembali!' }));
    addNPC(R, 'mbak', 'Mbak Dewi (kasir)', 4.1, 1.2, ['Selamat datang di Indomurah, selamat berbelanja!', 'Pulsanya sekalian, Kak?', 'Kembaliannya didonasikan?'], 0.15);
    addNPC(R, 'pemuda', 'Mas Andre (pegawai)', -0.3, -2.6, ['Lagi nyusun barang, Mas.', 'Promo minggu ini: beli 2 gratis 1.'], 1.2);
    finish(R); R.doorLabel = 'Masuk Indomurah';
  }

  /* ================= 3. Warung kelontong: rak kayu penuh, renteng sachet, toples kerupuk, gas & beras */
  { const R = room('warung', 'Warung Bu Ijah', 5.5, 4.6, { wall: '#e8d8b0', base: '#6a8a5a', doorX: 0.8 });
    flat(R, '#9a9a92'); for (let i = 0; i < 12; i++) R.st.box(R.X, -2.6 + hash(i, 2) * 5.2, -0.01, -2.2 + hash(i, 5) * 4.4, 0.4, 0.02, 0.3, C('#8a8a84'));
    const m = R.st, P = R.P;
    shelfUnit(m, P(-0.6, -2.05), 4.0, 1.9, 5, 21, 0.45, '#8a5a34'); R.solid(P(-0.6, -2.05), 4.0, 0.45);
    shelfUnit(m, P(-2.5, 0, Math.PI / 2), 2.6, 1.7, 4, 33, 0.4, '#8a5a34'); R.solid(P(-2.5, 0), 0.4, 2.6);
    // etalase kaca + toples kerupuk
    m.box(P(-0.2, 0.9), 0, 0, 0, 2.6, 0.8, 0.55, C('#a8784a')); m.box(P(-0.2, 0.9), 0, 0.8, 0, 2.6, 0.32, 0.55, mix(C('#c8e0f0'), C('#ffffff'), 0.4)); R.solid(P(-0.2, 0.9), 2.6, 0.55);
    for (let i = 0; i < 5; i++) { const x = -1.2 + i * 0.5; m.box(P(-0.2, 0.9), x, 1.12, 0, 0.32, 0.36, 0.32, mix(C('#c8e0f0'), C('#ffffff'), 0.6)); m.box(P(-0.2, 0.9), x, 1.14, 0, 0.26, 0.26, 0.26, C(pick(['#f2e2b0', '#e8a040', '#f2c8a0', '#d85a3a'], hash(i, 4)))); m.box(P(-0.2, 0.9), x, 1.48, 0, 0.34, 0.06, 0.34, C('#e8302a')); }
    for (let i = 0; i < 6; i++) m.box(P(-0.2, 0.9), -1.1 + i * 0.4, 0.84, 0.05, 0.3, 0.12, 0.3, C(pick(GOODS, hash(i, 14))));
    // renteng sachet tergantung di depan rak
    for (let i = 0; i < 24; i++) m.box(P(-0.6, -1.7), -1.9 + i * 0.165, 1.25 - (i % 3) * 0.05, 0, 0.11, 0.6, 0.01, C(pick(['#e8302a', '#f2c230', '#2a8ae0', '#f28a1a', '#3aa85a', '#f2f2f2', '#6a3a1a'], hash(i, 23))));
    m.box(P(-0.6, -1.7), 0, 1.88, 0, 4.0, 0.03, 0.03, C('#5a5a5a'));
    // kulkas es, galon, gas melon, beras, krat botol
    fridge(m, P(2.2, -1.9), 0.8, 9, '#d8202a'); R.solid(P(2.2, -1.9), 0.8, 0.6);
    for (let i = 0; i < 3; i++) { m.box(P(2.45, -0.7 + i * 0.35), 0, 0, 0, 0.26, 0.42, 0.26, C('#3a9a5a')); m.box(P(2.45, -0.7 + i * 0.35), 0, 0.42, 0, 0.1, 0.06, 0.1, C('#3a9a5a')); }   // tabung gas melon
    for (let i = 0; i < 2; i++) sack(m, P(1.6 + i * 0.5, 1.8), '#f2f0e8');
    crate(m, P(2.3, 1.7), 0.5, '#d8a020'); for (let i = 0; i < 9; i++) m.box(P(2.3, 1.7), -0.16 + (i % 3) * 0.16, 0.4, -0.16 + Math.floor(i / 3) * 0.16, 0.06, 0.22, 0.06, C('#3a8a4a'));   // krat teh botol
    R.solid(P(2.0, 1.75), 1.3, 0.5); R.solid(P(2.45, -0.35), 0.3, 1.0);
    for (let i = 0; i < 4; i++) m.box(P(-1.8 + i * 0.25, 0.3), 0, 1.6, 0, 0.12, 0.35, 0.12, C('#f2d23a'));   // pisang tergantung
    stool(m, P(0.2, 1.8), '#3a7ac0'); stool(m, P(-0.6, 1.8), '#e8302a');
    const board = R.sign('back', ['WARUNG BU IJAH', 'GAS • GALON • PULSA'], 1.3, 2.05, 2.2, 0.38, '#e85a2a', '#ffffff', 40);
    R.sign('left', ['ES TEH 3RB', 'GORENGAN 1RB'], 1.6, 1.9, 1.0, 0.5, '#2a2014', '#f2d23a', 40);
    // satu ruangan dipakai semua warung; pemilik, papan nama, obrolan & barang andalan diganti tiap masuk pintu yang berbeda
    const keeper = addNPC(R, 'ibuDaster', 'Bu Ijah', -0.4, -0.3, [], 0.5), bodies = { ibuDaster: keeper.c };
    let owner = WARUNGS[0], oi = 0;
    R.setOwner = i => {
      oi = i ?? 0; owner = WARUNGS[oi] || WARUNGS[0];
      const [t, sub, bg, fg, , sid, name] = owner, nick = name.split(' ')[0];
      R.name = t.split(' ').map(w => w[0] + w.slice(1).toLowerCase()).join(' ') + (/MADURA|SINAR/.test(t) ? ' (' + name + ')' : '');
      board.userData.redraw([t, sub], bg, fg);
      if (keeper.sid !== sid) {
        keeper.c.group.visible = false;
        if (!bodies[sid]) { bodies[sid] = new Character(sid); scene.add(bodies[sid].group); }
        keeper.c = bodies[sid]; keeper.c.group.visible = true; keeper.sid = sid;
      }
      keeper.name = name; keeper.x = keeper.tx = keeper.home.x; keeper.z = keeper.tz = keeper.home.z; keeper.say = null;
      const self = { Bu: 'Ibu', Mak: 'Mak', Mbak: 'Mbak', Pak: 'Bapak', Mbah: 'Mbah', Koh: 'Engkoh', Cak: 'Cak', Mas: 'Mas' }[nick] || 'Saya';
      keeper.lines = oi === 0 ? ['Mau beli apa, Nak?', 'Ikanmu Ibu beli, buat digoreng.', 'Om Darto sehat?']
        : [`Mau beli apa? ${self} ada ${sub.toLowerCase().split(' • ')[0]}.`, pick(['Ikan hasil mancing juga ' + self.toLowerCase() + ' terima.', 'Jangan lupa bayar ya, hehe.', 'Udah pulang sekolah?', 'Hati-hati di jalan, banyak motor ngebut.', 'Belanja di sini lebih murah dari Indomurah!'], hash(oi, 3)),
          pick(['Kenal Bu Ijah? Warungnya deket rumah Om Darto.', 'Anak SMA 3 ya? Seragamnya keliatan.', 'Dulu ' + self.toLowerCase() + ' juga suka main bola di lapangan kampung.', 'Kemarin ada yang nyari Bang Jaka di sini.'], hash(oi, 7))];
    };
    R.spot(-0.2, 1.6, 1.0, 'Jajan / jual ikan', () => shop.open({ title: R.name, sub: oi === 0 ? 'Bisa ngutang? Nggak.' : owner[1].toLowerCase(), items: CATALOG.warung, sellFish: true, thanks: oi === 0 ? 'Makasih, Nak!' : pick(['Makasih ya!', 'Mampir lagi ya!', 'Nuwun, Mas!', 'Matur suwun!'], hash(oi, 9)) }));
    R.setOwner(0);
    finish(R); R.doorLabel = 'Masuk warung';
  }

  /* ================= 4. Markas Lampu Kota (gudang): sofa bekas, motor dibongkar, samsak, papan rencana */
  { const R = room('markas', 'Markas Lampu Kota', 10, 7, { wall: '#3a3a40', base: '#2a2a2e', doorX: -0.6, outside: '#f6e8b0' });
    flat(R, '#6a6a68'); for (let i = 0; i < 10; i++) R.st.box(R.X, -4.5 + hash(i, 3) * 9, -0.01, -3 + hash(i, 8) * 6, 0.6 + hash(i, 1), 0.02, 0.4 + hash(i, 2) * 0.6, C('#4a4a46'));   // noda oli
    const m = R.st, P = R.P;
    sofa(m, P(-3.0, -2.6), 2.4, '#7a3a2a'); R.solid(P(-3.0, -2.6), 2.4, 0.8); sofa(m, P(-4.4, -0.8, Math.PI / 2), 1.6, '#4a5a3a'); R.solid(P(-4.4, -0.8), 0.8, 1.6);
    m.box(P(-3.0, -1.4), 0, 0, 0, 1.2, 0.4, 0.6, C('#a8784a')); R.solid(P(-3.0, -1.4), 1.2, 0.6);   // meja dari palet
    for (let i = 0; i < 4; i++) m.box(P(-3.0, -1.4), -0.4 + i * 0.25, 0.4, 0, 0.08, 0.14, 0.08, C(pick(['#3a8a4a', '#d8202a', '#f2c230'], hash(i, 2))));
    m.box(P(-3.0, -1.4), 0.3, 0.4, 0.1, 0.4, 0.04, 0.3, C('#e8e4d0'));   // kartu remi
    // motor dibongkar + alat
    { const p = P(2.6, -2.2, 0.3); m.box(p, 0, 0.3, 0, 1.5, 0.35, 0.35, C('#c83a3a')); m.box(p, 0.6, 0, 0, 0.1, 0.55, 0.1, C('#2a2a2a')); m.box(p, -0.6, 0, 0, 0.5, 0.5, 0.12, C('#1a1a1a')); m.box(p, 0.65, 0.7, 0, 0.1, 0.4, 0.6, C('#5a5a5a')); R.solid(p, 1.6, 0.6); }
    m.box(P(3.4, -0.9), 0, 0, 0, 0.7, 0.55, 0.45, C('#d8202a')); m.box(P(3.4, -0.9), 0, 0.55, 0, 0.6, 0.06, 0.4, C('#5a5a5a')); R.solid(P(3.4, -0.9), 0.7, 0.45);   // kotak perkakas
    for (let i = 0; i < 4; i++) m.box(P(4.5, -2.6 + i * 0.5), 0, 0, 0, 0.5, 0.12, 0.5, C('#1a1a1a')), m.box(P(4.5, -2.6 + i * 0.5), 0, 0.12, 0, 0.5, 0.12, 0.5, C('#222222'));   // ban bekas
    R.solid(P(4.5, -1.85), 0.5, 2.0);
    for (let i = 0; i < 6; i++) R.W.right.box(R.X, 4.97, 1.0 + (i % 2) * 0.35, -2.5 + i * 0.4, 0.04, 0.3, 0.06, C('#8a8a8a'));   // kunci-kunci di dinding
    lampBulbs(R.W.back, R, 2.3); R.sign('back', ['LAMPU KOTA', 'nyala buat yang lemah'], -0.4, 1.4, 2.6, 0.7, '#1a1a1a', '#f6c81a', 48);
    R.sign('left', ['RENCANA:', 'jaga pasar • lawan Kobar', 'jangan ganggu warga'], 1.5, 1.3, 1.6, 0.8, '#e8e4d0', '#2a2014', 32);
    m.box(P(0.8, 2.6), 0, 0, 0, 0.6, 0.9, 0.6, C('#4a5a6a')); m.box(P(0.8, 2.6), 0, 0.9, 0, 0.5, 0.3, 0.4, C('#5a3a2a')); R.solid(P(0.8, 2.6), 0.6, 0.6);   // drum + radio
    acts.addBag(R.ox + 0.6, R.oz + 0.2, 0, 'Samsak markas');
    R.spot(-3.0, -1.8, 0.9, 'Duduk di sofa', () => { player.emote = 'sitDown'; });
    addNPC(R, 'pemuda', 'Bang Ucok', -2.6, -0.6, ['Raka! Latihan samsak dulu sana.', 'Bang Jaka bilang, berantem itu buat jagain orang.', 'Kobar makin sering nongol di pasar.'], 0.6);
    addNPC(R, 'anakPunk', 'Bejo', 2.4, -1.1, ['Ini motor Bang Jaka, jangan disenggol.', 'Mau ikut patroli malam?'], 0.4);
    finish(R); R.doorLabel = 'Masuk markas Lampu Kota';
  }

  /* ================= 5. GOR Kota Wirabumi (guide 89, gor/interior_gor.png): arena 32 x 16 + tribun utara/selatan, panggung lipat,
     papan skor; gym & ruang beladiri; lobi (loket, lemari piala, papan jadwal event), kantin, ganti & bilas, medis, panitia,
     gudang alat, musala. Lebih luas dari tampak luarnya (segmen 81). */
  { const R = room('gor', 'GOR Kota Wirabumi', 66, 44, { ox: OX + 40, oz: OZB, wall: '#d8dce0', base: '#2f5a8a', doorX: 22 - 33, doorW: 3, h: 4.2, outside: '#f6f6e8' });
    planks(R, '#c8904a', 0.35);
    const { at, box, solid, part, label, spot, npc, plane, world, m } = plan(R), WL = '#f4f4f0';
    // lapangan multifungsi: basket, futsal, voli, bulu tangkis
    const x0 = 10, y0 = 7.5, cw = 32, chh = 16, cz = y0 + chh / 2;
    box(x0 - 0.6, y0 - 0.6, cw + 1.2, chh + 1.2, 0.02, '#2f6a9a', { y: -0.012 }); box(x0, y0, cw, chh, 0.022, '#ce9660', { y: -0.01 });
    const line = (x, y, w, h, c = WL) => box(x, y, w, h, 0.004, c, { y: 0.013 });
    line(x0, y0, cw, 0.08); line(x0, y0 + chh - 0.08, cw, 0.08); line(x0, y0, 0.08, chh); line(x0 + cw - 0.08, y0, 0.08, chh); line(x0 + cw / 2 - 0.04, y0, 0.08, chh);
    for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; m.box(at(x0 + cw / 2 + Math.cos(a) * 2.2, cz + Math.sin(a) * 2.2, a + Math.PI / 2), 0, 0.013, 0, 0.5, 0.004, 0.08, C(WL)); }
    for (const kx of [x0, x0 + cw - 6]) { line(kx, y0 + 5, 6, 0.08); line(kx, y0 + 11, 6, 0.08); line(kx === x0 ? kx + 6 : kx, y0 + 5, 0.08, 6); }
    for (const [x, y, w, h] of [[x0 + 2, y0 + 2, cw - 4, 0.06], [x0 + 2, y0 + chh - 2, cw - 4, 0.06], [x0 + 2, y0 + 2, 0.06, chh - 4], [x0 + cw - 2, y0 + 2, 0.06, chh - 4]]) line(x, y, w, h, '#f0c83c');
    for (const sd of [-1, 1]) {
      const gx = sd < 0 ? x0 + 0.1 : x0 + cw - 0.9;   // gawang futsal (dalam garis) + ring basket (tiang di luar lapangan)
      box(gx, cz - 1.5, 0.8, 0.08, 1.0, WL); box(gx, cz + 1.42, 0.8, 0.08, 1.0, WL); box(sd < 0 ? gx : gx + 0.72, cz - 1.5, 0.08, 3, 1.0, '#c8c8c0'); box(gx, cz - 1.5, 0.8, 3, 0.06, WL, { y: 1.0 }); solid(gx, cz - 1.5, 0.8, 3);
      const px = sd < 0 ? x0 - 1.3 : x0 + cw + 1.1; box(px, cz - 0.1, 0.2, 0.2, 3.0, '#3a3a40', { solid: true }); box(sd < 0 ? px : px - 0.9, cz - 0.06, 1.1, 0.12, 0.12, '#3a3a40', { y: 2.8 });
      const bx = sd < 0 ? x0 - 0.3 : x0 + cw + 0.24; box(bx, cz - 0.8, 0.06, 1.6, 1.0, '#f4f4f0', { y: 2.3 }); box(bx, cz - 0.3, 0.07, 0.6, 0.45, '#e8302a', { y: 2.4 }); box(sd < 0 ? bx + 0.06 : bx - 0.45, cz - 0.22, 0.45, 0.44, 0.04, '#f26a1a', { y: 2.45 });
    }
    // tribun teleskopik 5 baris: utara naik ke dinding belakang, selatan naik ke arah lobi
    for (const [ty, dir] of [[1, -1], [24.5, 1]]) {
      for (let r = 0; r < 5; r++) { const yy = dir < 0 ? ty + 5.2 - (r + 1) * 1.04 : ty + r * 1.04, hy = 0.32 * (r + 1); box(8, yy, 36, 1.04, hy, r % 2 ? '#9aa0a8' : '#b8bec6'); for (let i = 0; i < 18; i++) box(8.3 + i * 2, yy + (dir < 0 ? 0.5 : 0.1), 1.5, 0.42, 0.14, pick(['#2f5a8a', '#f2c230', '#c83a3a'], hash(i, r)), { y: hy }); }
      solid(8, ty, 36, 5.2); label(26, dir < 0 ? 6.5 : 24.2, dir < 0 ? 'Tribun utara' : 'Tribun selatan');
    }
    box(1, 9, 6, 14, 0.6, '#b8302a', { top: '#c83a3a', solid: true }); for (let i = 0; i < 4; i++) box(7, 10 + i * 3.4, 0.06, 2.6, 0.5, '#8a2a24'); label(4, 8.5, 'Panggung lipat', 2.4);
    box(44.6, 12, 0.2, 0.2, 2.8, '#3a3a40', { solid: true }); box(44.6, 18.8, 0.2, 0.2, 2.8, '#3a3a40', { solid: true }); box(44.72, 12.2, 0.4, 6.6, 1.4, '#1a1a1e', { y: 1.45 });
    plane(['HOME 0 - 0 TAMU', 'LIGA BASKET ANTAR-SMA'], 44.69, 15.5, 2.15, 6.2, 1.2, -Math.PI / 2, '#1a1a1e', '#ff6a3a', 60);
    R.sign('back', ['GOR KOTA WIRABUMI', 'SEHAT • SPORTIF • GUYUB'], 26 - 33, 3.3, 6, 0.9, '#2f5a8a', '#ffffff', 52);
    // sekat ruangan
    part(46, 0, 46, 44, [[13, 16], [28.5, 30.5], [37, 39]]); part(0, 31, 46, 31, [[5, 8], [18, 22], [37, 40]]); part(11, 31, 11, 44); part(32, 31, 32, 44, [[41, 43]]);
    part(46, 27, 66, 27, [[57, 60]]); part(46, 35, 66, 35); part(53, 27, 53, 44, [[39, 41]]);
    // lantai tiap ruang
    box(46.1, 0.05, 19.85, 26.9, 0.02, '#4a4a52', { y: -0.012 }); box(0.05, 31.1, 10.9, 12.85, 0.02, '#dde6ea', { y: -0.012 }); box(11.1, 31.1, 20.8, 12.85, 0.02, '#e6e2d8', { y: -0.012 });
    box(32.1, 31.1, 13.8, 12.85, 0.02, '#e0d4b8', { y: -0.012 }); box(46.1, 27.1, 6.8, 7.8, 0.02, '#eef2f2', { y: -0.012 }); box(46.1, 35.1, 6.8, 8.85, 0.02, '#c8c8c0', { y: -0.012 });
    box(53.1, 27.1, 12.85, 7.8, 0.02, '#9a968c', { y: -0.012 }); box(53.1, 35.1, 12.85, 8.85, 0.02, '#3a7a5a', { y: -0.012 });
    for (const [x, y, t, w] of [[56, 0.6, 'Gym & beladiri', 2.6], [5.5, 32, 'Ganti & bilas', 2.6], [21.5, 39.5, 'Lobi', 1.4], [39, 43.2, 'Kantin GOR', 2.4], [49.5, 27.6, 'R. medis', 2], [49.5, 43.2, 'Panitia & wasit', 2.6], [59.5, 27.6, 'Gudang alat', 2.4], [59.5, 43.2, 'Musala', 1.6]]) label(x, y, t, w);
    // GYM: kardio, beban bebas, mesin, ring tinju, samsak, matras silat
    for (let k = 0; k < 4; k++) { const x = 48 + k * 2.2; box(x + 0.2, 3, 1.2, 3, 0.25, '#2a2a30'); box(x + 0.3, 3.3, 1.0, 2.6, 0.02, '#4a4a50', { y: 0.25 }); box(x + 0.2, 3, 0.1, 0.3, 1.2, '#6a6a70'); box(x + 1.3, 3, 0.1, 0.3, 1.2, '#6a6a70'); box(x + 0.2, 3, 1.2, 0.35, 0.3, '#3a3a40', { y: 1.15 }); box(x + 0.45, 3.32, 0.7, 0.04, 0.2, '#5ac8e8', { y: 1.2 }); solid(x + 0.2, 3, 1.2, 3); }
    for (let k = 0; k < 3; k++) { const x = 48 + k * 2.2; box(x + 0.6, 7.2, 0.3, 1.6, 0.25, '#3a3a40'); box(x + 0.65, 7.45, 0.2, 0.2, 0.75, '#6a6a70'); box(x + 0.5, 7.35, 0.5, 0.4, 0.08, '#1a1a1a', { y: 0.75 }); box(x + 0.65, 8.4, 0.2, 0.2, 1.0, '#6a6a70'); box(x + 0.35, 8.4, 0.8, 0.12, 0.06, '#1a1a1a', { y: 1.0 }); box(x + 0.62, 7.9, 0.26, 0.5, 0.5, '#c83a3a', { y: 0.2 }); solid(x + 0.4, 7.2, 0.8, 1.6); }
    box(57.5, 3, 7.5, 1.2, 0.75, '#3a3a40', { solid: true }); for (let r = 0; r < 2; r++) for (let i = 0; i < 12; i++) box(57.75 + i * 0.6, 3.2 + r * 0.45, 0.42, 0.22, 0.14, i % 3 ? '#1a1a1e' : '#c83a3a', { y: 0.75 });
    for (let k = 0; k < 3; k++) { const x = 57.5 + k * 2.6; box(x + 0.3, 5.7, 0.6, 2.6, 0.45, '#c83a3a', { top: '#d84a3a' }); box(x + 0.05, 5.5, 0.1, 0.1, 1.15, '#8a8a90'); box(x + 1.05, 5.5, 0.1, 0.1, 1.15, '#8a8a90'); box(x - 0.35, 5.52, 1.9, 0.06, 0.06, '#c8c8cc', { y: 1.08 }); for (const ex of [-0.3, 1.45]) box(x + ex, 5.42, 0.08, 0.26, 0.42, '#1a1a1e', { y: 0.88 }); solid(x + 0.1, 5.4, 1.0, 3); }
    { const x = 57.5, y = 9.5; for (const [dx, dy] of [[0.4, 0.4], [2.4, 0.4], [0.4, 2.4], [2.4, 2.4]]) box(x + dx, y + dy, 0.14, 0.14, 2.2, '#3a3a40'); box(x + 0.4, y + 0.4, 2.14, 0.1, 0.1, '#3a3a40', { y: 2.2 }); box(x + 0.4, y + 2.4, 2.14, 0.1, 0.1, '#3a3a40', { y: 2.2 }); box(x - 0.1, y + 1.45, 3.2, 0.06, 0.06, '#c8c8cc', { y: 1.4 }); for (const ex of [-0.05, 2.95]) box(x + ex, y + 1.3, 0.1, 0.36, 0.5, '#1a1a1e', { y: 1.2 }); solid(x + 0.3, y + 0.3, 2.4, 2.4); }
    { const x = 61.6, y = 9.5; box(x + 0.4, y + 0.3, 0.18, 0.18, 2.3, '#3a3a40'); box(x + 0.4, y + 0.3, 2.4, 0.18, 0.12, '#3a3a40', { y: 2.2 }); box(x + 2.6, y + 0.3, 0.6, 0.5, 1.4, '#5a5a60'); box(x + 0.9, y + 1.0, 1.0, 1.2, 0.48, '#c83a3a'); box(x + 0.6, y + 0.4, 1.6, 0.06, 0.06, '#c8c8cc', { y: 1.9 }); solid(x + 0.3, y + 0.3, 2.9, 2.2); }
    { const x = 48, y = 10.5; box(x + 0.3, y + 0.6, 3.4, 1.4, 0.3, '#3a3a40'); box(x + 0.5, y + 0.8, 1.2, 1.0, 0.55, '#c83a3a', { y: 0.3 }); box(x + 2.8, y + 0.7, 0.8, 1.2, 0.9, '#5a5a60', { y: 0.3 }); for (const ex of [0, 1]) box(x + 3.0, y + 0.5 + ex * 1.3, 0.4, 0.12, 0.5, '#1a1a1e', { y: 0.6 }); solid(x + 0.3, y + 0.5, 3.4, 1.6); }
    { const x = 48, y = 14.5, r = 7; box(x, y, r, r, 0.05, '#2a5aa8', { top: '#3a6ac0' }); box(x + 0.3, y + 0.3, r - 0.6, r - 0.6, 0.004, '#4a7ad0', { y: 0.05 });
      for (const [dx, dy, c] of [[0, 0, '#d8302a'], [r - 0.25, 0, '#2a5aa8'], [0, r - 0.25, '#f4f4f0'], [r - 0.25, r - 0.25, '#f4f4f0']]) box(x + dx, y + dy, 0.25, 0.25, 1.25, c, { solid: true });
      for (const hy of [0.55, 0.8, 1.05]) { box(x, y + 0.08, r, 0.05, 0.04, '#e8e8e8', { y: hy }); box(x, y + r - 0.13, r, 0.05, 0.04, '#e8e8e8', { y: hy }); box(x + 0.08, y, 0.05, r, 0.04, '#e8e8e8', { y: hy }); box(x + r - 0.13, y, 0.05, r, 0.04, '#e8e8e8', { y: hy }); }
      label(x + r / 2, y - 0.4, 'Ring tinju', 2); }
    for (let k = 0; k < 4; k++) { const [wx, wz] = world(56.5 + k * 2.1 + 0.6, 15.4); acts.addBag(wx, wz, 0, 'Samsak GOR'); }
    box(56.5, 18, 8.5, 5.5, 0.05, '#3a8a4a', { top: '#4a9a5a' }); box(56.8, 18.3, 7.9, 4.9, 0.004, '#5aaa6a', { y: 0.05 }); label(60.75, 17.6, 'Matras silat & beladiri', 3);
    box(48, 23.6, 7, 0.12, 1.9, '#c8e0f0', { y: 0.1 }); box(48, 23.66, 7, 0.1, 0.1, '#8a8a90', { solid: true }); box(48, 23.66, 7, 0.1, 0.06, '#8a8a90', { y: 2.0 });
    box(56.5, 24.5, 4, 0.8, 0.95, '#5a6a7a', { top: '#e8e4dc', solid: true }); box(61.5, 25.3, 3.5, 0.6, 1.9, '#8a9aa8', { solid: true }); for (let i = 1; i < 6; i++) box(61.5 + i * 0.58, 25.28, 0.03, 0.02, 1.8, '#5a6a78', { y: 0.05 });
    R.sign('right', ['GYM & BELADIRI', 'harian Rp15rb • bulanan Rp150rb'], 13.5 - 22, 2.6, 4.4, 0.8, '#1a1a1e', '#f2c230', 46);
    // ganti & bilas
    box(0.3, 32.6, 0.6, 6, 1.9, '#8a9aa8', { solid: true }); for (let i = 1; i < 10; i++) box(0.88, 32.6 + i * 0.6, 0.02, 0.03, 1.8, '#5a6a78', { y: 0.05 });
    for (let i = 0; i < 3; i++) { box(1 + i * 3.2, 40.4, 0.1, 3.4, 1.9, '#9ab8c8', { solid: true }); box(1.2 + i * 3.2, 40.6, 2.8, 3.2, 0.02, '#c8dce6', { y: -0.005 }); box(2.4 + i * 3.2, 43.5, 0.3, 0.1, 0.1, '#c8c8cc', { y: 2.0 }); }
    box(10.6, 40.4, 0.1, 3.4, 1.9, '#9ab8c8', { solid: true }); box(4, 35.5, 3.2, 0.5, 0.45, '#8a5a34', { solid: true });
    // lobi: loket, lemari piala, papan jadwal event
    box(12.5, 33.4, 5, 0.8, 1.0, '#2f5a8a', { top: '#e8e4dc', solid: true }); register(m, at(14, 33.8));
    box(24, 31.3, 6, 0.6, 1.9, '#6a4428', { solid: true }); box(24.1, 31.88, 5.8, 0.02, 1.6, '#c8e0f0', { y: 0.2 }); for (let i = 0; i < 6; i++) box(24.5 + i * 0.9, 31.5, 0.3, 0.3, 0.35 + (i % 3) * 0.1, '#e8c040', { y: 0.95 }); for (let i = 0; i < 5; i++) box(24.8 + i * 1.1, 31.5, 0.2, 0.2, 0.25, '#c8c8cc', { y: 0.45 });
    box(22.4, 37.4, 0.12, 0.12, 2.2, '#5a3a22', { solid: true }); box(25.6, 37.4, 0.12, 0.12, 2.2, '#5a3a22', { solid: true }); box(22.4, 37.42, 3.3, 0.08, 1.4, '#6a4428', { y: 0.75 });
    plane(['JADWAL EVENT GOR', 'Liga basket antar-SMA • Turnamen futsal', 'Turnamen silat (2 minggu sekali)', 'Debat calon ketua OSIS • Pensi gabungan', 'Badminton bebas tiap sore Rp20.000/jam'], 24.05, 37.53, 1.45, 3.1, 1.3, 0, '#f4f0e0', '#2a2014', 30);
    // kantin, medis, panitia, gudang alat, musala
    box(33, 31.5, 12, 0.8, 0.95, '#c83a2a', { top: '#e8e4dc', solid: true }); box(33, 31.2, 12, 0.3, 1.8, '#d8c8a8', { y: 0.95 }); for (let i = 0; i < 3; i++) { const tx = 35 + i * 3.6; table(m, at(tx, 38.5), 1.6, 0.9); solid(tx - 0.8, 38.05, 1.6, 0.9); for (const sz of [-1, 1]) chair(m, at(tx, 38.5 + sz * 0.75, sz > 0 ? Math.PI : 0), '#c83a2a'); }
    bed(m, at(48, 31, 0), '#e8e8f0'); solid(47.45, 30, 1.1, 2.0); box(51, 27.7, 1.6, 0.6, 1.6, '#f4f4f0', { solid: true }); box(51.4, 28.28, 0.6, 0.02, 0.6, '#d8302a', { y: 1.0 });
    table(m, at(49.5, 39), 2.6, 1.2); solid(48.2, 38.4, 2.6, 1.2); for (const dx of [-0.8, 0, 0.8]) chair(m, at(49.5 + dx, 40, Math.PI));
    for (let i = 0; i < 6; i++) crate(m, at(54 + (i % 3) * 0.7, 28.2 + Math.floor(i / 3) * 0.7), 0.6, '#4a6a8a'); solid(53.6, 27.8, 2.2, 1.5);
    box(58, 28, 1.4, 1.0, 0.6, '#8a8a90', { solid: true }); for (let i = 0; i < 6; i++) box(58.1 + (i % 3) * 0.42, 28.1 + Math.floor(i / 3) * 0.42, 0.36, 0.36, 0.36, '#f26a1a', { y: 0.6 });
    for (let i = 0; i < 3; i++) box(61 + i * 1.3, 28.2, 0.9, 2.6, 0.5, '#e8e8e8', { solid: true }); box(60.5, 32, 5, 2.6, 0.12, '#3a8a4a', { solid: false });
    for (let r = 0; r < 3; r++) box(55, 36.5 + r * 2.2, 10, 1.6, 0.02, r % 2 ? '#a83a3a' : '#c84a4a', { y: 0.005 }); box(54, 40.6, 0.6, 1.6, 0.5, '#7a5030', { solid: true });
    // titik interaksi
    spot(26, cz, 1.6, 'Latihan lari bolak-balik (Kelincahan)', () => acts.doAct('run', 4, () => { fight.gain('kelincahan', 3); toast('Ngos-ngosan... Kelincahan naik!'); }));
    spot(18, cz - 3, 1.4, 'Main badminton (sewa lapangan Rp20.000)', () => { if (player.uang < 20000) { toast('Sewa lapangan Rp20.000 sejam. Uangnya kurang.'); return; } player.uang -= 20000; shop.showMoney(); acts.doAct('raiseHand', 4, () => { fight.gain('kelincahan', 4); toast('Smes! Sejam main badminton. Kelincahan naik.'); }); });
    spot(51, 6.6, 1.5, 'Lari di treadmill (kardio: Kelincahan)', gymSession('Kardio treadmill', 'run', ['kelincahan']));
    spot(52, 9.75, 1.3, 'Sepeda statis (kardio: Kelincahan)', gymSession('Sepeda statis', 'run', ['kelincahan']));
    spot(60.5, 9.0, 1.2, 'Dumbel & bench press (Kekuatan)', gymSession('Beban bebas', 'carry', ['kekuatan']));
    spot(55, 13.4, 1.3, 'Leg press & lat pulldown (Kekuatan)', gymSession('Latihan mesin', 'squat', ['kekuatan']));
    spot(51.5, 18, 1.6, 'Sparring di ring tinju (Kekuatan + Nyali)', gymSession('Sparring', 'straight', ['kekuatan', 'nyali']));
    spot(60.75, 20.75, 1.8, 'Latihan silat di matras (Kelincahan)', gymSession('Latihan silat', 'kickHigh', ['kelincahan']));
    spot(58.5, 24, 1.2, 'Daftar member gym bulanan (Rp150.000)', () => { const f = player.flags || (player.flags = {}); if (f.gymMember) { toast('Kamu udah member. Latihan maksimal 2 sesi sehari, ya.'); return; } if (player.uang < 150000) { toast('Member bulanan Rp150.000. Uangnya kurang.'); return; } player.uang -= 150000; shop.showMoney(); f.gymMember = true; toast('Resmi jadi member gym GOR! Gak perlu bayar harian lagi.'); });
    spot(24, 38.6, 1.3, 'Lihat papan jadwal event', () => toast('Minggu ini: badminton bebas tiap sore (Rp20.000/jam). Liga basket, futsal, silat & pensi menyusul.'));
    spot(27, 32.4, 1.2, 'Lemari piala', () => toast('Piala liga basket antar-SMA: SMA 3 juara 2019 & 2022. Futsal: STM Karya Bangsa tiga tahun beruntun.'));
    spot(15, 34.9, 1.2, 'Loket tiket event', () => toast('Petugas: "Belum ada event minggu ini, Dik. Gym & badminton buka tiap hari."'));
    spot(39, 32.9, 1.3, 'Jajan di Kantin GOR', () => shop.open({ title: 'Kantin GOR', sub: 'Habis olahraga, isi tenaga', items: CATALOG.warung, thanks: 'Semangat latihannya!' }));
    spot(49.5, 32.4, 1.1, 'Rebahan di ruang medis (nyawa +50%)', () => acts.doAct('lie', 3, () => { player.fx.hp = Math.min(fight.maxHP(), player.fx.hp + fight.maxHP() * 0.5); toast('Dikompres es & dikasih plester. Mendingan.'); }));
    spot(59.5, 40, 1.4, 'Salat sebentar (hati tenang, Nyali +)', () => acts.doAct('bow', 3, () => { fight.gain('nyali', 1); toast('Hati jadi tenang.'); }));
    npc('pakRT', 'Coach Herman', 57.5, 23.4, ['Latihan itu konsisten, bukan sekali gas.', 'Maksimal dua sesi sehari. Otot juga butuh tidur.', 'Kardio buat napas, beban buat tenaga, silat buat gesit.'], 1.2);
    npc('kakek', 'Pak Komar (penjaga GOR)', 15, 35.6, ['Jangan lupa lepas sepatu yang kotor.', 'Bola dikembalikan ke keranjang, ya.'], 0.6);
    npc('ibuHijab', 'Bu Kantin GOR', 38, 32.6, ['Es teh, es jeruk, nasi bungkus!', 'Habis main basket pasti haus.'], 0.4);
    npc('siswaA', 'Andi', 22, 12, ['Futsal yuk, kurang satu orang!', 'Lapangan disewa sampai jam lima.'], 2.5);
    npc('siswiA', 'Rina', 30, 19, ['Badminton yuk, raketnya bawa dua.', 'Liga basket bentar lagi, SMA 3 harus juara!'], 2.0);
    R.spot(5.5 - 33, 37.5 - 22, 1.3, 'Ke kolam renang lomba (tiket Rp10.000)', null);
    { const sp = R.spots.at(-1), fl = () => player.flags || (player.flags = {});
      sp.warp = () => { const K = rooms.gor_kolam; return { x: K.ox + K.entry.x, z: K.oz + K.entry.z, heading: -Math.PI / 2, room: K }; };
      sp.gate = { ok: () => fl().poolPaid || player.uang >= 10000, no: () => toast('Tiket berenang Rp10.000. Uangnya kurang...'),
        pay: () => { const f = fl(); if (f.poolPaid) return; player.uang -= 10000; shop.showMoney(); f.poolPaid = true; toast('Bayar tiket kolam Rp10.000 (berlaku sampai tidur)'); } }; }
    finish(R); R.doorLabel = 'Masuk GOR';
  }

  /* ================= 5b. Kolam renang lomba GOR (guide 89, gor/denah_tapak_gor.png no. 4-8): kolam 8 lintasan 25 m dengan
     balok start & tali merah-kuning, tribun beratap 4 baris, kolam loncat dalam + menara 1/3/5 m, papan skor, bilas & ganti.
     Masuk dari ruang ganti GOR. Mini game: balap renang & loncat indah (kolam.js). */
  { const R = room('gor_kolam', 'Kolam Renang Lomba GOR', 24, 42, { ox: OX + 95, oz: OZB, wall: '#e4ecf0', base: '#2a6a9a', h: 6.6, noDoor: true, noUnder: true });
    tiles(R, '#e8eef0', '#d4dee2', 0.5, [[2, 4, 12, 25], [2, 32, 8, 8]]);
    const { at, box, solid, label, spot, npc, plane, world, m } = plan(R), WY = -0.18;
    // kolam: dinding & lantai keramik biru, air semi-bening (lantai ruangan di y 0)
    const basin = (x, y, w, h, depth) => {
      box(x - 0.3, y - 0.3, w + 0.6, 0.3, 0.06, '#f4f4f0'); box(x - 0.3, y + h, w + 0.6, 0.3, 0.06, '#f4f4f0'); box(x - 0.3, y, 0.3, h, 0.06, '#f4f4f0'); box(x + w, y, 0.3, h, 0.06, '#f4f4f0');   // bibir kolam
      box(x, y, w, h, 0.02, '#2a78b8', { y: -depth }); for (const [bx, by, bw, bh] of [[x, y, w, 0.05], [x, y + h - 0.05, w, 0.05], [x, y, 0.05, h], [x + w - 0.05, y, 0.05, h]]) box(bx, by, bw, bh, depth, '#5ab0e0', { y: -depth });
      const wm = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ color: '#4ab8e8', transparent: true, opacity: 0.72 })); wm.rotation.x = -Math.PI / 2; const [wx, wz] = world(x + w / 2, y + h / 2); wm.position.set(wx, WY, wz); wm.renderOrder = 2; scene.add(wm);
      acts.addPool({ x: wx, z: wz, w, d: h, a: 0, name: 'Kolam renang GOR' });
    };
    // kolam lomba 8 lintasan x 25 m: balok start di sisi utara (dekat papan skor)
    const px = 2, py = 4, LW = 1.5, LEN = 25; basin(px, py, LW * 8, LEN, 1.4);
    for (let i = 0; i < 8; i++) box(px + i * LW + LW / 2 - 0.05, py + 0.4, 0.1, LEN - 0.8, 0.003, '#1a3a6a', { y: -1.38 });   // garis dasar
    for (let i = 1; i < 8; i++) for (let k = 0; k < LEN / 0.5; k++) box(px + i * LW - 0.06, py + k * 0.5, 0.12, 0.42, 0.07, k < 10 || k > 39 ? '#d83a2a' : '#f2c230', { y: WY - 0.03 });   // tali lintasan
    for (let i = 0; i < 8; i++) { const bx = px + i * LW + LW / 2; box(bx - 0.3, py - 0.75, 0.6, 0.55, 0.5, '#f4f4f0', { top: '#3a8ac0', solid: true }); plane([String(i + 1)], bx, py - 0.47, 0.32, 0.3, 0.2, 0, '#2a6a9a', '#ffffff', 60); }
    for (const yy of [py + 5, py + LEN - 5]) for (let k = 0; k < 8; k++) box(px + k * 1.5, yy, 0.6, 0.04, 0.04, k % 2 ? '#f4f4f0' : '#d83a2a', { y: 1.9 });   // bendera gaya punggung
    // tribun kolam beratap 4 baris (di timur kolam), menghadap barat
    for (let r = 0; r < 4; r++) { const xx = 16.5 + r * 1.2, hy = 0.4 * (r + 1); box(xx, py, 1.2, LEN, hy, r % 2 ? '#9aa0a8' : '#b8bec6'); for (let i = 0; i < 12; i++) box(xx + 0.1, py + 0.6 + i * 2, 0.5, 1.5, 0.12, pick(['#2f5a8a', '#f2c230', '#c83a3a'], hash(i, r + 9)), { y: hy }); }
    solid(16.5, py, 4.8, LEN); for (const yy of [py, py + LEN / 2, py + LEN - 0.2]) box(21.2, yy, 0.2, 0.2, 3.6, '#5a6a78'); box(16.2, py, 5.4, LEN, 0.1, '#e8eef2', { y: 3.6 });
    label(18.9, py - 0.5, 'Tribun kolam', 2.4);
    // papan skor kolam di dinding utara
    const board = R.sign('back', ['PAPAN SKOR KOLAM', 'Balap renang & loncat indah', '--', '--'], px + 6 - 12, 3.6, 7, 2.2, '#10161e', '#ffd84a', 44);
    // kolam loncat (dalam) + menara 1/3/5 m di sisi timurnya, papan menjorok ke barat
    const dx = 2, dy = 32, DW = 8; basin(dx, dy, DW, DW, 3.2);
    const tx = dx + DW + 0.4, TOW = [[1, dy + 6.4, 2.6], [3, dy + 4, 3.2], [5, dy + 1.6, 3.8]];   // papan menjorok ke atas air
    box(tx, dy + 0.6, 2.2, 7, 0.2, '#c8ccd0', { solid: true });
    for (const [h, yy, len] of TOW) {
      box(tx + 1.4, yy - 0.5, 0.25, 0.25, h, '#d8dce0', { solid: true }); box(tx + 1.4, yy + 0.25, 0.25, 0.25, h, '#d8dce0', { solid: true });
      box(tx - len + 1.6, yy - 0.5, len, 1.0, 0.12, h === 1 ? '#3a8ac0' : '#e8e8ec', { y: h - 0.12 }); box(tx - len + 1.6, yy - 0.5, 0.06, 1.0, 0.03, '#c83a2a', { y: h });
      for (let k = 0; k < Math.round(h * 3); k++) box(tx + 1.75, yy - 0.15, 0.25, 0.3, 0.04, '#9aa0a8', { y: k / 3 + 0.2 });   // anak tangga
      plane([h + ' m'], tx + 1.8, yy + 0.7, h + 0.25, 0.5, 0.3, Math.PI / 2, '#2a6a9a', '#ffffff', 60);
    }
    label(dx + DW / 2, dy - 0.6, 'Kolam loncat (dalam)', 3); label(tx + 1.2, dy + 7.9, 'Menara 1/3/5 m', 2.4);
    // bilas & ganti
    box(15.5, 31.5, 0.12, 9.5, 2.1, '#9ab8c8', { solid: true }); box(15.6, 31.6, 7.6, 0.6, 1.9, '#8a9aa8', { solid: true });
    for (let i = 1; i < 12; i++) box(15.6 + i * 0.62, 32.2, 0.02, 0.02, 1.8, '#5a6a78', { y: 0.05 });
    for (let i = 0; i < 3; i++) { box(16.5 + i * 2.4, 38.8, 0.08, 2.4, 1.9, '#9ab8c8', { solid: true }); box(17.6 + i * 2.4, 40.9, 0.3, 0.1, 0.1, '#c8c8cc', { y: 2.0 }); }
    box(18, 35, 3, 0.45, 0.45, '#8a5a34', { solid: true }); label(19.4, 31.1, 'Bilas & ganti', 2.4);
    R.sign('back', ['KOLAM RENANG LOMBA', 'GOR KOTA WIRABUMI • 06.00-17.00'], 19 - 12, 4.6, 6, 0.9, '#2a6a9a', '#ffffff', 46);
    // posisi lintasan (dunia) untuk kolam.js: berangkat dari balok start (utara) ke selatan
    const lanes = Array.from({ length: 8 }, (_, i) => { const [x, z0] = world(px + i * LW + LW / 2, py + 0.4), [, z1] = world(0, py + LEN - 0.4); return { x, z0, z1 }; });
    const towers = {}; for (const [h, yy, len] of TOW) { const [x, z] = world(tx - len + 1.9, yy); towers[h] = { x, z, y: h, h: Math.PI }; }
    const [ex, ez] = world(px + 4 * LW, py - 1.6), [en, enz] = world(18, 37.5);
    R.entry = { x: en - R.ox, z: enz - R.oz };
    kolam?.setup({ lanes, len: LEN, waterY: WY, blockY: 0.5, towers, board, exitRace: { x: ex, z: ez, h: -Math.PI / 2 } });
    // titik interaksi
    spot(px + 4 * LW, py - 1.4, 1.5, 'Balap renang 50 m (4 perenang)', () => kolam?.race(4, 2));
    spot(px + 2 * LW, py - 1.4, 1.3, 'Balap renang 100 m (8 perenang)', () => kolam?.race(8, 4));
    for (const [h, yy] of TOW) spot(tx + 2.2, yy - 0.1, 0.8, `Loncat indah: menara ${h} m${h === 5 ? ' (uji nyali)' : ''}`, () => kolam?.dive(h));
    spot(18, 37.5, 1.3, 'Kembali ke GOR', null); R.spots.at(-1).warp = () => { const G = rooms.gor; return { x: G.ox + 5.5 - 33, z: G.oz + 36.5 - 22, heading: Math.PI / 2, room: G }; };
    // perenang latihan di lintasan, penonton di tribun, penjaga kolam
    const lap = (lane, ph) => { const p = lanes[lane]; return (n, dt) => { n.t = (n.t ?? ph) + dt * 0.055; const u = n.t % 2, d = u < 1 ? u : 2 - u; n.x = p.x; n.z = p.z0 + (p.z1 - p.z0) * d; n.heading = u < 1 ? Math.PI / 2 : -Math.PI / 2; n.anim = 'swim'; }; };
    [[0, 'siswiA', 'Fitri'], [6, 'pemuda', 'Kang Yusuf'], [7, 'remaja', 'Dewa']].forEach(([lane, sid, name], k) => { const n = addNPC(R, sid, name, 0, 0, ['Glup... halo!', 'Latihan buat lomba antar-sekolah.'], 0, { ext: lap(lane, k * 0.7), yAbs: WY, sink: 0.3 }); n.filler = true; });
    for (let i = 0; i < 4; i++) { const r = i % 4, [wx, wz] = world(16.9 + r * 1.2, py + 3 + i * 5.5); const n = addNPC(R, pick(['siswiB', 'siswaA', 'ibuHijab2', 'bocah'], hash(i, 3)), 'Penonton', wx - R.ox, wz - R.oz, ['Ayo! Ayo!', 'Nunggu adikku lomba.'], 0, { ext: nn => { nn.heading = Math.PI; nn.anim = 'sitDown'; }, yAbs: 0.4 * (r + 1) }); }
    npc('satpam', 'Pak Darma (penjaga kolam)', 13.3, 2.6, ['Jangan lari di pinggir kolam, licin!', 'Menara 5 meter cuma buat yang berani.', 'Balap renang? Naik ke balok start.'], 0.8);
    finish(R);
  }

  /* ================= 6. Pabrik es tua: mesin berkarat, cetakan es, drum api, tempat nongkrong geng Kobar */
  { const R = room('pabrik', 'Pabrik Es Tua', 14, 9, { wall: '#7a7a72', base: '#4a4a44', doorX: -1, h: 3.4, outside: '#d8d0b0', dark: true });
    flat(R, '#5a5a56'); for (let i = 0; i < 14; i++) R.st.box(R.X, -6.5 + hash(i, 4) * 13, -0.01, -4 + hash(i, 6) * 8, 0.5 + hash(i, 2) * 1.2, 0.02, 0.4 + hash(i, 7), C(hash(i, 9) < 0.5 ? '#3a4a52' : '#6a5a48'));
    const m = R.st, P = R.P, rust = C('#8a5a3a');
    for (const [x, z] of [[-4.5, -3], [-1, -3.1], [2.5, -3]]) { const p = P(x, z); m.box(p, 0, 0, 0, 2.4, 1.6, 1.4, shade(rust, 0.9 + hash(x * 9, 1) * 0.2)); m.box(p, 0, 1.6, 0, 1.6, 0.6, 1.0, C('#6a6a6a')); m.box(p, 0.9, 2.2, 0, 0.2, 1.2, 0.2, rust); m.box(p, -0.8, 0.4, 0.71, 0.4, 0.4, 0.02, C('#2a2a2a')); R.solid(p, 2.4, 1.4); }
    for (let i = 0; i < 6; i++) m.box(R.X, -6 + i * 2.4, 2.9, -2.2, 0.16, 0.16, 0.16, C('#5a5a52')), m.box(R.X, 0, 2.9, -2.2, 13, 0.14, 0.14, rust);   // pipa
    // cetakan es panjang
    for (let i = 0; i < 3; i++) { const p = P(-4.2 + i * 1.8, 0.4); m.box(p, 0, 0, 0, 1.4, 0.5, 2.2, C('#8a9aa0')); for (let j = 0; j < 4; j++) m.box(p, 0, 0.5, -0.8 + j * 0.53, 1.3, 0.04, 0.45, C('#bfe0f0')); R.solid(p, 1.4, 2.2); }
    for (let i = 0; i < 5; i++) crate(m, P(4.5 + (i % 2) * 0.6, 1.5 + Math.floor(i / 2) * 0.6), 0.55, '#7a5a3a'); R.solid(P(4.8, 2.1), 1.2, 1.8);
    // drum api unggun + kursi bekas
    { const p = P(1.8, 1.8); m.box(p, 0, 0, 0, 0.6, 0.85, 0.6, C('#3a4a5a')); m.box(p, 0, 0.85, 0, 0.5, 0.25, 0.5, C('#f28a1a')); m.box(p, 0, 1.0, 0, 0.3, 0.25, 0.3, C('#ffd84a')); R.solid(p, 0.6, 0.6); }
    for (const [x, z] of [[0.8, 2.6], [2.9, 1.2]]) chair(m, P(x, z, Math.atan2(1.8 - z, 1.8 - x) - Math.PI / 2), '#5a5a5a');
    R.sign('back', ['KOBAR', 'RAJA JALANAN'], 5.5, 1.5, 1.8, 0.8, '#5a5a52', '#e8302a', 50);
    R.sign('left', ['ES BALOK', 'PT. SEGAR JAYA 1978'], -1, 2.6, 2.4, 0.6, '#5a6a72', '#d8dcd0', 40);
    windowB(R, 'back', -5.5, 1.2);
    addNPC(R, 'anakPunk', 'Anak geng Kobar', 2.6, 2.6, ['Ngapain lu ke sini?', 'Ini daerah Kobar. Pulang sana!', 'Mau cari ribut?'], 0.8);
    addNPC(R, 'pemuda', 'Anak geng Kobar', 0.9, 1.0, ['Bos lagi balapan.', 'Lu anak Lampu Kota ya?'], 0.8);
    finish(R); R.doorLabel = 'Masuk pabrik es';
  }

  /* ================= 7. Gua Kapur: batu, stalagmit, genangan, obor, peti tua */
  { const R = room('gua', 'Gua Kapur', 9, 7, { wall: '#7a766a', base: '#5a564c', doorX: 0, h: 3.0, outside: '#c8e0a8', dark: true });
    flat(R, '#6a665a'); const m = R.st, P = R.P;
    for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, rx = 4.2 * Math.cos(a), rz = 3.2 * Math.sin(a); if (rz > 2.6 && Math.abs(rx) < 1.2) continue; const s = (0.6 + hash(i, 3) * 0.9) * (rz > 0.5 ? 0.55 : 1); rock(m, P(rx, rz, a), s, pick(['#8a867a', '#9a968a', '#7a766a'], hash(i, 5))); }
    for (let i = 0; i < 9; i++) { const x = -3 + hash(i, 11) * 6, z = -2.2 + hash(i, 12) * 3.6, h = 0.3 + hash(i, 13) * 0.7; m.box(P(x, z), 0, 0, 0, 0.22, h, 0.22, C('#b8b4a4')); m.box(P(x, z), 0, h, 0, 0.12, 0.2, 0.12, C('#c8c4b4')); R.solid(P(x, z), 0.24, 0.24); }   // stalagmit
    m.box(P(1.6, 0.4), 0, 0.002, 0, 1.6, 0.01, 1.1, C('#3a5a6a')); m.box(P(1.6, 0.4), 0, 0.004, 0, 1.2, 0.01, 0.8, C('#4a7a8a'));   // genangan
    for (const [x, z] of [[-3.4, 1.8], [3.2, 1.6]]) { m.box(P(x, z), 0, 0, 0, 0.08, 1.2, 0.08, C('#5a3a22')); m.box(P(x, z), 0, 1.2, 0, 0.16, 0.2, 0.16, C('#f28a1a')); m.box(P(x, z), 0, 1.35, 0, 0.1, 0.15, 0.1, C('#ffd84a')); }
    R.W.back.box(R.X, -1.5, 1.0, -3.45, 1.6, 0.6, 0.02, C('#a8a090')); for (let i = 0; i < 5; i++) R.W.back.box(R.X, -2.1 + i * 0.3, 1.1 + hash(i, 2) * 0.3, -3.43, 0.1, 0.2, 0.01, C('#7a3a22'));   // coretan purba
    { const p = P(-1.4, -1.5, 0.3); m.box(p, 0, 0, 0, 0.8, 0.45, 0.5, C('#6a4428')); m.box(p, 0, 0.45, 0, 0.84, 0.15, 0.54, C('#5a3a20')); m.box(p, 0, 0.3, 0.26, 0.14, 0.14, 0.02, C('#c8a040')); R.solid(p, 0.8, 0.5); }
    const flags = player.flags || (player.flags = {});
    R.spot(-1.2, -0.8, 0.9, 'Buka peti tua', () => { if (flags.peti) { toast('Petinya sudah kosong.'); return; } flags.peti = true; acts.doAct('squat', 1.5, () => { shop.earn(50000, 'Isi peti: uang kuno & korek api tua.'); fight.gain('nyali', 3); }); });
    finish(R); R.doorLabel = 'Masuk Gua Kapur';
  }

  /* ================= 8. Rumah pohon: lantai papan, tikar, komik, lentera, teropong */
  { const R = room('rumahPohon', 'Rumah Pohon', 4, 3.6, { wall: '#a8784a', base: '#7a5030', doorX: 0, h: 2.1, outside: '#a8d8a0' });
    planks(R, '#b88a5a', 0.25); const m = R.st, P = R.P;
    rug(m, P(-0.4, 0), 1.8, 1.4, '#3a7a5a', '#e8c070');
    for (let i = 0; i < 6; i++) m.box(P(-0.6 + (i % 3) * 0.32, -0.2 + Math.floor(i / 3) * 0.3, hash(i, 1)), 0, 0.02 + i * 0.006, 0, 0.24, 0.02, 0.32, C(pick(GOODS, hash(i, 31))));   // komik berserakan
    m.box(P(1.4, -1.4), 0, 0, 0, 0.7, 0.5, 0.45, C('#6a4428')); R.solid(P(1.4, -1.4), 0.7, 0.45);   // peti kecil
    m.box(P(1.4, -1.4), 0, 0.5, 0, 0.12, 0.25, 0.12, C('#f2c230'));   // lentera
    m.box(P(-1.5, -1.4), 0, 0, 0, 0.06, 0.9, 0.06, C('#3a3a40')); m.box(P(-1.5, -1.4), 0.1, 0.9, 0, 0.4, 0.1, 0.1, C('#2a2a2e'));   // teropong
    windowB(R, 'back', 0, 0.9); windowB(R, 'left', 0, 0.8);
    R.sign('back', ['MARKAS', 'RAHASIA!'], -1.35, 1.2, 1.0, 0.5, '#f4f0e0', '#c83a2a', 44);
    R.spot(-0.4, 0, 1.0, 'Baca komik (santai)', () => acts.doAct('read', 3, () => { player.fx.hp = Math.min(fight.maxHP(), player.fx.hp + 3); toast('Komik silat... jadi semangat!'); fight.gain('nyali', 0.5); }));
    R.spot(-1.3, -1.0, 0.8, 'Lihat pakai teropong', () => toast('Dari sini kelihatan menara air & jalan lingkar.'));
    finish(R); R.doorLabel = 'Naik ke rumah pohon';
  }

  /* ================= 9. Pondok kayu: bale-bale, tungku, kendi, perkakas tergantung */
  { const R = room('pondok', 'Pondok Hutan', 5, 4, { wall: '#8a6a44', base: '#5a4028', doorX: -0.5, h: 2.2, outside: '#a8d0a0' });
    planks(R, '#9a7a4a', 0.2); const m = R.st, P = R.P;
    { const p = P(1.3, -0.9); m.box(p, 0, 0.4, 0, 2.0, 0.08, 1.4, C('#c8a060')); for (let i = 0; i < 10; i++) m.box(p, -0.9 + i * 0.2, 0.48, 0, 0.12, 0.02, 1.36, C('#d8b070')); for (const sx of [-1, 1]) for (const sz of [-1, 1]) m.box(p, sx * 0.9, 0, sz * 0.6, 0.08, 0.4, 0.08, C('#6a4a2a')); R.solid(p, 2.0, 1.4); }
    { const p = P(-1.6, -1.4); m.box(p, 0, 0, 0, 0.9, 0.5, 0.6, C('#9a6a4a')); m.box(p, 0, 0.5, 0, 0.3, 0.12, 0.3, C('#2a2a2a')); m.box(p, 0, 0.62, 0, 0.36, 0.2, 0.36, C('#3a3a3a')); m.box(p, 0, 0.1, 0.31, 0.3, 0.2, 0.02, C('#f28a1a')); R.solid(p, 0.9, 0.6); }   // tungku + kuali
    for (let i = 0; i < 3; i++) { m.box(P(-2.1 + i * 0.3, 1.4), 0, 0, 0, 0.22, 0.3, 0.22, C('#a8582a')); m.box(P(-2.1 + i * 0.3, 1.4), 0, 0.3, 0, 0.1, 0.08, 0.1, C('#a8582a')); }   // kendi
    for (let i = 0; i < 3; i++) R.W.back.box(R.X, -0.6 + i * 0.5, 1.1, -1.98, 0.08, 0.8, 0.04, C(['#6a4a2a', '#8a8a8a', '#6a4a2a'][i]));   // cangkul, golok, arit
    windowB(R, 'right', 0, 0.8);
    R.spot(1.3, 0.1, 1.0, 'Rebahan di bale-bale', sleep);
    addNPC(R, 'kakek', 'Mbah Dirjo', -1.2, -0.3, ['Hutan ini dulu angker, Le.', 'Jangan ke curug sendirian kalau malam.', 'Minum dulu, airnya dari kendi.'], 0.5);
    finish(R); R.doorLabel = 'Masuk pondok';
  }

  /* ================= 10. Bengkel Mas Fajar: lift motor, kompresor, rak suku cadang, ban, kamar Fajar (guide 82) */
  { const R = room('bengkel', 'Bengkel Mas Fajar', 11, 8, { wall: '#c8c4b8', base: '#3a3a40', doorX: 0, h: 2.8, outside: '#e8e4d8' });
    flat(R, '#7a7a76'); for (let i = 0; i < 12; i++) R.st.box(R.X, -5 + hash(i, 3) * 10, -0.01, -3.6 + hash(i, 8) * 7, 0.5 + hash(i, 1) * 0.7, 0.02, 0.4 + hash(i, 2) * 0.5, C('#4a4a46'));
    const m = R.st, P = R.P;
    { const p = P(-2.6, -1.2); m.box(p, 0, 0, 0, 2.2, 0.5, 0.9, C('#d8202a')); m.box(p, 0, 0.5, 0, 2.3, 0.06, 1.0, C('#5a5a5a')); m.box(p, 0, 0.56, 0, 1.5, 0.4, 0.3, C('#2a6ac0')); m.box(p, 0.7, 0.56, 0, 0.12, 0.5, 0.5, C('#1a1a1a')); m.box(p, -0.7, 0.56, 0, 0.12, 0.5, 0.5, C('#1a1a1a')); m.box(p, 0.6, 1.0, 0, 0.08, 0.35, 0.5, C('#8a8a8a')); R.solid(p, 2.3, 1.0); }   // lift + motor
    { const p = P(-4.6, 1.2); m.box(p, 0, 0, 0, 0.6, 0.55, 0.45, C('#d8202a')); m.box(p, 0, 0.55, 0, 0.36, 0.36, 0.36, C('#c8c8c8')); m.box(p, 0, 0.1, 0.25, 0.1, 0.1, 0.1, C('#2a2a2a')); R.solid(p, 0.6, 0.45); }   // kompresor
    shelfUnit(m, P(1.5, -3.75), 4.0, 1.9, 4, 201, 0.45, '#3a4a5a'); R.solid(P(1.5, -3.75), 4.0, 0.45);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3 - (i % 2); j++) m.box(P(4.9, -1.5 + i * 0.55), 0, j * 0.14, 0, 0.5, 0.13, 0.5, C(j % 2 ? '#2a2a2a' : '#1a1a1a'));   // tumpukan ban
    R.solid(P(4.9, -0.4), 0.5, 2.8);
    for (let i = 0; i < 3; i++) { m.box(P(-4.7 + i * 0.5, -3.5), 0, 0, 0, 0.42, 0.75, 0.42, C(['#2a6a3a', '#c8a020', '#2a4a8a'][i])); m.box(P(-4.7 + i * 0.5, -3.5), 0, 0.75, 0, 0.3, 0.03, 0.3, C('#5a5a5a')); } R.solid(P(-4.2, -3.5), 1.5, 0.45);   // drum oli
    table(m, P(2.6, 0.4), 2.0, 0.8, 0.9, '#5a5a5e', '#8a8a8a'); R.solid(P(2.6, 0.4), 2.0, 0.8); m.box(P(2.6, 0.4), -0.5, 0.9, 0, 0.4, 0.25, 0.3, C('#d8202a')); m.box(P(2.6, 0.4), 0.3, 0.9, 0.1, 0.5, 0.06, 0.2, C('#8a8a8a')); m.box(P(2.6, 0.4), 0.6, 0.9, -0.15, 0.15, 0.3, 0.15, C('#3a3a3a'));   // meja kerja + toolbox + ragum
    for (let i = 0; i < 8; i++) R.W.back.box(R.X, -0.5 + i * 0.22, 1.0 + (i % 2) * 0.25, -3.97, 0.05, 0.3, 0.03, C('#9a9aa0'));   // kunci pas di papan
    R.W.back.box(R.X, 0.3, 0.9, -3.99, 1.9, 0.75, 0.02, C('#c8a060'));
    // kamar Fajar (pojok kanan belakang): kasur lipat, kipas, foto
    m.box(R.X, 3.6, 0, -2.0, 0.1, 2.0, 2.6, C('#a8a49a')); R.solid(P(3.6, -2.0), 0.12, 2.6);
    m.box(P(4.6, -2.8), 0, 0, 0, 0.9, 0.15, 1.6, C('#3a6aa8')); m.box(P(4.6, -3.4), 0, 0.15, 0, 0.6, 0.1, 0.3, C('#f2f2ee'));
    R.sign('back', ['BENGKEL MAS FAJAR', 'servis • tambal ban • oli • modif ringan'], -2.6, 1.9, 3.2, 0.55, '#1a1a1a', '#f6c81a', 44);
    R.sign('left', ['DAFTAR HARGA', 'Ganti oli 35rb • Servis 50rb', 'Tambal ban 10rb'], 0.5, 1.6, 1.8, 0.8, '#f4f0e0', '#2a2014', 30);
    R.spot(0.6, 0.4, 1.3, 'Upgrade sepeda / motor (Mas Fajar)', () => shop.open({ title: 'Bengkel Mas Fajar', sub: 'Upgrade kendaraan', items: CATALOG.bengkel, thanks: 'Mantap, makin ngebut!' }));
    addNPC(R, 'fajar', 'Mas Fajar', 0.8, -0.6, ['Motor Om Darto udah waktunya ganti oli.', 'Kalau mau ngebut, rem dulu yang bener.', 'Malam aku sekolah paket C, bengkel tutup jam 6.'], 0.8);
    finish(R); R.doorLabel = 'Masuk Bengkel Mas Fajar';
  }

  /* ================= 11. STM Karya Bangsa (guide 88, stm/interior_bengkel_otomotif.png): Bengkel Otomotif TKR & TSM (4 bay mobil +
     lift, 6 stand motor, ruang dyno, gudang oli & part = koperasi, kelas teori, R. guru produktif, toilet) + gudang lama markas
     Serigala Besi. Masuk tanpa diajak = disemprot Pak Bonar. */
  const stmEnter = () => { const f = player.flags || {}; if (!f.stmInvite) toast(Math.random() < 0.3 ? 'Siswa STM: "Anak SMA 3? Ngapain lo ke sini?"' : 'Pak Bonar: "Anak SMA 3? Jangan bikin ribut di sini, ya!"'); };
  { const R = room('stm_bengkel', 'STM Karya Bangsa · Bengkel Otomotif', 40, 24, { ox: OX + 140, oz: OZB, wall: '#c8c8c4', base: '#7a2a2a', doorX: 17 - 20, doorW: 3, h: 3.4, outside: '#e8e4d8' });
    flat(R, '#8a8a86'); for (let i = 0; i < 16; i++) R.st.box(R.X, -18 + hash(i, 5) * 36, -0.01, -9 + hash(i, 9) * 20, 0.6 + hash(i, 1) * 1.4, 0.02, 0.4 + hash(i, 3) * 0.9, C(hash(i, 7) < 0.5 ? '#4a4a46' : '#5a5650'));   // noda oli
    const { at, box, solid, part, label, spot, npc, plane, world, m } = plan(R);
    for (const k of [0, 1, 3]) { const lx = 1.5 + k * 6.5 + 2.5 - 20; R.W.front.box(R.X, lx, 0, 12 - 0.03, 5, 2.7, 0.04, C('#9a3a30')); for (let r = 0; r < 9; r++) R.W.front.box(R.X, lx, 0.15 + r * 0.3, 12 - 0.06, 5, 0.04, 0.02, C('#7a2a24')); }   // pintu rolling merah
    // 4 bay mobil + lift
    for (let k = 0; k < 4; k++) {
      const x = 1 + k * 6.5; box(x, 14, 6, 9.6, 0.02, '#6a6a68', { y: -0.012 }); box(x + 0.1, 14.1, 5.8, 0.08, 0.004, '#f2c230', { y: 0.01 }); part(x, 14, x, 22.6, [], 0.9, '#b8b8b4'); if (k === 3) part(x + 6, 14, x + 6, 22.6, [], 0.9, '#b8b8b4');
      for (const [dx, dy] of [[1.2, 15.4], [4.6, 15.4], [1.2, 20.8], [4.6, 20.8]]) box(x + dx, dy, 0.24, 0.24, 2.0, '#2a5aa8', { solid: true });
      const lift = k === 1 ? 0 : k === 3 ? -1 : 1.0;
      if (lift >= 0) { box(x + 1.4, 15.6, 3.2, 0.12, 0.1, '#2a5aa8', { y: lift + 0.1 }); box(x + 1.4, 20.7, 3.2, 0.12, 0.1, '#2a5aa8', { y: lift + 0.1 });
        const c = pick(['#e8e8e8', '#c83a3a', '#2a5aa0', '#3a3a40'], hash(k, 4)), y0 = lift + 0.2;
        box(x + 2.25, 15.9, 1.5, 4.6, 0.55, c, { y: y0 + 0.2 }); box(x + 2.35, 17.1, 1.3, 2.2, 0.5, c, { y: y0 + 0.75 }); box(x + 2.33, 17.25, 1.34, 1.9, 0.3, '#3a4a5a', { y: y0 + 0.86 }); box(x + 2.45, 17.08, 1.1, 2.24, 0.3, '#3a4a5a', { y: y0 + 0.86 });
        for (const [wx, wy] of [[2.1, 16.4], [3.65, 16.4], [2.1, 19.6], [3.65, 19.6]]) box(x + wx, wy, 0.25, 0.6, 0.55, '#1a1a1a', { y: y0 }); }
      solid(x + 1.2, 15.4, 3.6, 5.6);
      label(x + 3, 23.1, 'Bay ' + (k + 1), 1.2);
    }
    // 6 stand motor praktik + meja kerja
    const KND = ['bebek', 'matic', 'sport', 'trail', 'bebek', 'vespa'], CLR = ['#c83a3a', '#2a2a2e', '#2a6ac0', '#e8e8e8', '#3a9a5a', '#e07a2a'];
    for (let k = 0; k < 6; k++) {
      const x = 1 + k * 4.2; box(x, 9, 2.4, 1.2, 0.12, '#3a3a40', { solid: true });
      const rd = makeRide('motor', KND[k], CLR[k]), [wx, wz] = world(x + 1.2, 9.6); rd.group.position.set(wx, 0.12, wz); rd.group.rotation.y = Math.PI / 2; scene.add(rd.group);
      box(x, 7.4, 2.4, 0.8, 0.9, '#5a5a5e', { top: '#8a8a8a', solid: true }); box(x + 0.2, 7.55, 0.4, 0.3, 0.25, '#d8202a', { y: 0.9 }); box(x + 1.4, 7.6, 0.7, 0.2, 0.06, '#8a8a8a', { y: 0.9 });
    }
    // ruang belakang: kelas teori, R. guru produktif, toilet | ruang tune-up & dyno, gudang oli & part
    part(0, 6.5, 27.5, 6.5, [[6, 7.6], [16.6, 18.2], [23.8, 25.2]]); part(13.5, 0, 13.5, 6.5); part(21.5, 0, 21.5, 6.5);
    part(27.5, 0, 27.5, 14, [[7, 8.8], [11, 12.8]]); part(27.5, 9, 40, 9); part(27.5, 14, 40, 14, [[32.5, 34.5]]);
    for (let k = 0; k < 3; k++) { const tx = 2.4 + k * 3.6 + 1.3; table(m, at(tx, 4.0), 2.4, 0.8); solid(tx - 1.2, 3.6, 2.4, 0.8); for (const dx of [-0.6, 0.6]) chair(m, at(tx + dx, 4.75, Math.PI)); }
    R.sign('back', ['TSM: SISTEM BAHAN BAKAR', 'karburator • injeksi • busi'], 7 - 20, 1.7, 3.4, 0.8, '#f4f4f0', '#2a2a6a', 36);
    table(m, at(17.5, 3.0), 2.4, 1.0); solid(16.3, 2.5, 2.4, 1.0); chair(m, at(17.5, 3.8, Math.PI)); box(14, 0.4, 1.2, 0.6, 1.8, '#8a7a5a', { solid: true });
    for (let i = 0; i < 2; i++) { box(22 + i * 2.6, 0.2, 0.08, 2.2, 1.8, '#c8d0d8', { solid: true }); box(22.8 + i * 2.6, 0.5, 0.5, 0.6, 0.45, '#f4f4f0', { solid: true }); } box(27.3, 0.2, 0.08, 2.2, 1.8, '#c8d0d8');
    box(29, 3.5, 5, 2.4, 0.3, '#1a1a1e', { solid: true }); for (const dy of [4.1, 5.1]) box(29.3, dy, 4.4, 0.3, 0.06, '#5a5a60', { y: 0.3 });
    { const rd = makeRide('motor', 'sport', '#d83a2a'), [wx, wz] = world(31.5, 4.7); rd.group.position.set(wx, 0.32, wz); rd.group.rotation.y = Math.PI / 2; scene.add(rd.group); }
    box(35, 3.5, 3, 1.6, 0.75, '#6a4428', { solid: true }); box(35.8, 3.7, 1.2, 0.08, 0.7, '#1a1a1e', { y: 0.75 }); box(35.85, 3.78, 1.1, 0.01, 0.6, '#2a8a5a', { y: 0.8 }); box(34.5, 1.2, 0.8, 0.8, 1.2, '#4a4a50', { solid: true });
    shelfUnit(m, at(31, 10.4), 5, 1.6, 4, 77, 0.5, '#3a4a5a'); solid(28.5, 10.1, 5, 0.6); for (let i = 0; i < 4; i++) box(36 + (i % 2) * 0.6, 10.3 + Math.floor(i / 2) * 0.6, 0.48, 0.48, 0.8, ['#2a6a3a', '#c8a020', '#2a4a8a', '#c83a3a'][i]); solid(35.9, 10.2, 1.3, 1.3);
    box(37.6, 12.2, 2, 0.8, 0.95, '#5a5a5e', { top: '#e8e4dc', solid: true });
    shelfUnit(m, at(33, 15.6), 9.6, 1.9, 4, 91, 0.5, '#3a4a5a'); solid(28.2, 15.3, 9.6, 0.6);
    box(28.3, 18.2, 3.4, 2.4, 0.85, '#d8dcdc', { solid: true }); box(28.5, 18.4, 3.0, 2.0, 0.02, '#4aa8d8', { y: 0.86 });
    box(33.5, 18.6, 1.6, 0.8, 0.9, '#d8202a', { solid: true }); box(33.7, 18.7, 1.2, 0.6, 0.4, '#c8c8c8', { y: 0.9 }); box(35.6, 18.2, 2.8, 2.4, 0.04, '#3a3a36', { y: 0.005 });
    for (const [x, y, t, w] of [[7, 0.6, 'Kelas teori', 2], [17.5, 0.6, 'R. guru produktif', 2.6], [24.5, 0.6, 'Toilet', 1.2], [33.7, 0.6, 'Tune-up & dyno', 2.6], [32, 9.6, 'Gudang oli & part', 2.8], [33, 14.5, 'Rak kunci & alat', 2.6], [13, 6.95, 'Stand motor praktik', 3]]) label(x, y, t, w);
    R.sign('back', ['BENGKEL OTOMOTIF', 'TKR • TSM • STM KARYA BANGSA'], 20 - 20, 2.7, 5.2, 0.6, '#2a2a2a', '#f0c850', 44);
    let workT = -999;
    spot(3.2, 11.3, 1.3, 'Servis motor praktik (+Rp15.000)', () => {
      if (performance.now() - workT < 60000) { toast('Pak Darmo: "Motornya udah beres semua. Nanti lagi."'); return; }
      toast('Ganti oli...'); acts.doAct('squat', 2, () => { toast('Setel karbu...'); acts.doAct('crouch', 2, () => { toast('Ganti kampas rem...'); acts.doAct('squat', 2, () => { workT = performance.now(); shop.earn(15000, 'Servis beres! Upah praktik'); fight.gain('kelincahan', 1); }); }); });
    });
    spot(33, 7.6, 1.3, 'Ukur tenaga motor di dyno', () => { const u = (player.upg || {}).motor || 0; acts.doAct('crouch', 2.5, () => toast(`Dyno: motor bebek kamu ${(8.2 * (1 + 0.1 * u)).toFixed(1)} dk, top speed ±${Math.round(116 * (1 + 0.03 * u))} km/j (upgrade ${u}/5).`)); });
    spot(36.5, 12.4, 1.3, 'Koperasi suku cadang (20% lebih murah)', () => shop.open({ title: 'Koperasi Suku Cadang STM', sub: 'Part murah anak STM, 20% di bawah bengkel kota', items: CATALOG.bengkel.map(([n, p, e, c]) => [n, Math.round(p * 0.8 / 1000) * 1000, e, c]), thanks: 'Pasang sendiri ya, anak STM.' }));
    npc('bapakPeci', 'Pak Darmo (guru produktif)', 24, 10.5, ['Servis itu bukan asal bongkar. Catat urutannya.', 'Mau ukur tenaga motor? Dyno di pojok kanan.', 'Kirana paling rapi kalau nyetel karbu.'], 1.0);
    npc('remaja', 'Ipul (siswa TSM)', 9, 11.3, ['Motor lo standar banget, bro.', 'Knalpot racing bikin berisik doang kalau karbu nggak disetel.'], 1.2);
    npc('anakPunk', 'Gendon (siswa TKR)', 16, 13.2, ['Ngapain anak SMA 3 di bengkel kita?', 'Jangan pegang kunci-kunci, nanti hilang.'], 1.0);
    finish(R); R.doorLabel = 'Masuk Bengkel Otomotif STM'; R.onEnter = stmEnter;
  }
  { const R = room('stm_gudang', 'Gudang Lama (markas Serigala Besi)', 9, 7, { ox: OX + 190, oz: OZB, wall: '#6a6a62', base: '#3a3a36', doorX: 2.6, h: 2.8, outside: '#d8d0b0', dark: true });
    flat(R, '#5a5a54'); const m = R.st, P = R.P;
    sofa(m, P(-2.4, -2.6), 2.4, '#6a5a3a'); R.solid(P(-2.4, -2.6), 2.4, 0.8); sofa(m, P(-3.9, -0.6, Math.PI / 2), 1.8, '#4a4a5a'); R.solid(P(-3.9, -0.6), 0.8, 1.8);
    { const p = P(-1.6, -0.6); m.box(p, 0, 0, 0, 0.6, 0.85, 0.6, C('#3a4a5a')); m.box(p, 0, 0.85, 0, 0.5, 0.2, 0.5, C('#f28a1a')); m.box(p, 0, 0.98, 0, 0.3, 0.22, 0.3, C('#ffd84a')); R.solid(p, 0.6, 0.6); }   // drum api
    for (const [x, z, c] of [[3.6, -2.9, '#2a4a8a'], [3.0, -2.9, '#c83a3a'], [3.6, -2.3, '#4a5a3a']]) { m.box(P(x, z), 0, 0, 0, 0.5, 0.85, 0.5, C(c)); } R.solid(P(3.3, -2.6), 1.2, 1.2);
    for (let i = 0; i < 4; i++) crate(m, P(3.6 - (i % 2) * 0.6, 0.6 + Math.floor(i / 2) * 0.6), 0.55, '#6a5a3a'); R.solid(P(3.3, 0.9), 1.2, 1.2);
    R.sign('back', ['SERIGALA BESI', 'STM KB • LINGKAR PUNYA KITA'], 0.4, 1.6, 2.6, 0.8, '#3a3a36', '#c8302a', 46);
    R.sign('left', ['◎ TARGET', '10 • 20 • 50'], 0.8, 1.4, 1.0, 1.0, '#e8e4d0', '#c8302a', 40);
    R.spot(-2.2, 0.8, 1.1, 'Lempar dart ke papan target', () => acts.doAct('straight', 1.2, () => { const sc = pick([10, 20, 20, 50, 0], Math.random()); toast(sc ? `Kena ${sc}! Anak Serigala Besi melirik.` : 'Meleset... diketawain satu gudang.'); if (sc >= 50) fight.gain('nyali', 1); }));
    R.spot(-0.2, -1.6, 1.1, 'Tawarkan damai (Lampu Kota vs Serigala Besi)', () => toast('Codet: "Damai? Ngomong sama Kobar. Kalahin dia dulu di lingkar, baru kita dengerin."'));
    addNPC(R, 'anakPunk', 'Codet (Serigala Besi)', -2.0, -1.6, ['Ini wilayah Serigala Besi. Salah masuk, lo.', 'Kobar lagi di depan. Mau ketemu?', 'Anak Lampu Kota sok jagoan.'], 0.5);
    addNPC(R, 'pemuda', 'Bogel (Serigala Besi)', 1.4, -0.8, ['Ssst, jangan berisik. Bonar galak.', 'Malam Selasa sama Jumat, kita di lingkar.'], 0.5);
    finish(R); R.doorLabel = 'Masuk gudang lama STM (Serigala Besi)'; R.onEnter = stmEnter;
  }

  /* ================= interior dari data guide 92 (docs/desain-sma/peta/interior_data.py -> data/interiors.json)
     Denah: petak dari pojok kiri atas, pintu utama di sisi bawah (= jalan). Bangunan bertingkat (R berlabel LT/Lantai/Loteng)
     dipecah jadi satu ruangan per lantai, tangga = pindah lantai. Sekat antarkamar setinggi dada supaya isi tetap kelihatan. */
  const HAND = new Set(['indomurah', 'warung_kelontong', 'rumah_pohon']);                                   // sudah ada versi buatan tangan
  const AWAY = new Set(['basecamp', 'warung_seafood', 'rumah_wulan', 'rumah_dimas', 'warung_mak_iyah']);   // di luar kota / di sekolah
  const FLOORC = { toko: '#e6e4de', gudang: '#9a968c', warung: '#c8a878', luar: '#b8b4a8', koridor: '#d8d0c0', seni: '#b89a78', kantin: '#e0d4b8', kelas: '#d8ccb0', ibadah: '#3a7a5a', kantor: '#c8c8c0', toilet: '#dde6ea', rumah: '#c89a6a', rahasia: '#6a5a4a', balkon: '#a8784a', bengkel: '#7a7a78' };
  const WALLC = { toko: '#f4f2ec', warung: '#e8d8b0', koridor: '#e8e2d0', seni: '#e6d6c0', kantin: '#f0e6d0', kelas: '#efe6d0', ibadah: '#f2eee2', kantor: '#e4e8ec', rumah: '#f0e2c8', bengkel: '#c8c4b8', luar: '#e8e2d0', gudang: '#c8c0b0', rahasia: '#8a7a64' };
  const FC = { rak: '#9aa0a8', meja: '#8a5a34', kasur: '#4a7ac0', sofa: '#5a6a8a', putih: '#ecece8', logam: '#a8acb0', hitam: '#2a2a30', kain: '#c84a6a', kuning: '#f2c230', merah: '#c83a3a', hijau: '#3a8a4a', air: '#4aa8d8' };
  // penjaga tiap tempat usaha: [sid, nama, kalimat]
  const KEEP = {
    warnet: ['pemuda', 'Bang Opik', ['Sejam empat ribu. Mi rebus ada.', 'Jangan teriak, yang sebelah lagi ranked.']],
    kafe: ['pemuda', 'Kak Dion', ['Kopi susu gula aren? Andalan kita.', 'Jumat malam ada akustik, datang ya.']],
    karaoke: ['mbak', 'Mbak Lilis', ['Bilik kosong tinggal satu, sejam lima puluh.', 'Mikrofonnya jangan dibanting ya.']],
    pasar: ['ibuHijab', 'Bu Sumi', ['Cabe lagi mahal, Mas.', 'Pagi-pagi ke sini, sayurnya masih seger.']],
    plaza: ['mbak', 'Mbak SPG', ['Diskon akhir pekan, Kak!', 'Bioskop lantai tiga, ya.']],
    masjid_agung: ['bapakPeci', 'Pak Marbot', ['Sandalnya taruh di rak, Nak.', 'Atap? Nggak boleh naik sembarangan.']],
    bank: ['mbak', 'Teller Bank', ['Mau setor atau tarik, Kak?', 'Ambil nomor antrean dulu, ya.']],
    puskesmas: ['ibuHijab', 'Bidan Rina', ['Luka habis berantem lagi? Sini diobati.', 'Jangan lupa minum air putih.']],
    polsek: ['pakRT', 'Pak Polisi Darsono', ['Ada perlu apa, Dik?', 'Balap liar itu bahaya. Ingat.']],
    studio_foto: ['kakek', 'Pak Jono', ['Pas foto 3x4, sepuluh menit jadi.', 'Jojo lagi di kamarnya, atas.']],
    stasiun: ['pakRT', 'Petugas Stasiun', ['Kereta berikutnya dua jam lagi.', 'Tiket lima ribu, Dik.']],
    bengkel_wijaya: ['pemuda', 'Bang Wijaya', ['Motor balap? Sini, saya setel.', 'Kirana lagi di dalam, jangan ganggu.']],
    kos_narti: ['buNarti', 'Bu Narti', ['Kamar nomor lima masih kosong.', 'Jam sepuluh malam pagar dikunci!']],
    kontainer_proyek: ['pemuda', 'Mandor Proyek', ['Ini area proyek. Keluar, Dik.', 'Pak Haris nggak suka orang asing di sini.']],
  };
  const SIGN_BG = { warnet: ['#2a1a4a', '#d8c8ff'], kafe: ['#3a2a1e', '#f6e0b0'], karaoke: ['#5a1a4a', '#ffe08a'], bank: ['#1e4a8a', '#ffffff'], puskesmas: ['#2a8a5a', '#ffffff'], polsek: ['#2a2a3a', '#f2d23a'], studio_foto: ['#c83a3a', '#ffffff'], stasiun: ['#f6f4ec', '#1e1e1e'], masjid_agung: ['#2f6a4a', '#f0d27a'], pasar: ['#8a3a1a', '#f6e0a0'], plaza: ['#1a2a4a', '#f2c230'], bengkel_wijaya: ['#1a1a1a', '#e83a2a'] };
  const dataRooms = {};
  let nextX = OX + 12 * GAP;
  for (const I of INTERIORS) {
    if (HAND.has(I.id) || AWAY.has(I.id)) continue;
    const Rs = I.isi.filter(e => e.t === 'R'), Fl = Rs.filter(r => /^(LT|Lantai|Loteng)/i.test(r.label));
    const floors = Fl.length >= 2 ? Fl.sort((a, b) => a.x - b.x) : [{ x: 0, y: 0, w: I.w, h: I.h, label: '' }];
    const inF = (f, x, y) => x >= f.x - 0.05 && x <= f.x + f.w + 0.05 && y >= f.y - 0.05 && y <= f.y + f.h + 0.05;
    const list = [];
    floors.forEach((f, k) => {
      const W = f.w, Dd = f.h, items = I.isi.filter(e => e.t !== 'R' || e !== f).filter(e => inF(f, e.x + (e.w || 0) / 2, e.y + (e.h || 0) / 2));
      const outer = I.isi.filter(e => e.t === 'D' && !e.v && e.x >= f.x - 0.05 && e.x + e.n <= f.x + f.w + 0.05);
      let main = outer.filter(e => Math.abs(e.y - (f.y + f.h)) < 0.06).sort((a, b) => b.n - a.n)[0], mirror = false;
      if (!main && k === 0) { main = outer.filter(e => Math.abs(e.y - f.y) < 0.06).sort((a, b) => b.n - a.n)[0]; mirror = !!main; }
      const T = (x, y) => [x - f.x - W / 2, mirror ? -(y - f.y - Dd / 2) : y - f.y - Dd / 2];
      const subs = items.filter(e => e.t === 'R' && !(e.w >= W - 0.1 && e.h >= Dd - 0.1));
      const bigR = items.filter(e => e.t === 'R').sort((a, b) => b.w * b.h - a.w * a.h)[0], mk = f.kind || bigR?.kind || Rs[0]?.kind || 'rumah';
      const doorX = main ? T(main.x + main.n / 2, 0)[0] : 0;
      const R = room(I.id + (k ? '_' + k : ''), I.name.replace(/\s*\(.*\)$/, '') + (floors.length > 1 ? ' · ' + f.label : ''), W, Dd,
        { ox: nextX + W / 2, wall: WALLC[mk] || '#e8e0cc', doorX, doorW: main ? Math.min(main.n, 3) : 1.2, h: 2.7, noDoor: !main, outside: '#fff6d8' });
      nextX += W + 30;
      const { P, st: m, X } = R;
      if (mk === 'toko' || mk === 'kantor' || mk === 'toilet' || mk === 'koridor' || mk === 'kantin') tiles(R, FLOORC[mk], '#d2cec6', 0.6);
      else if (mk === 'rumah' || mk === 'seni' || mk === 'warung') planks(R, FLOORC[mk]);
      else flat(R, FLOORC[mk] || '#c8b89a');
      // sub-ruang: lantai sendiri + sekat setinggi dada dengan celah di pintu dalam
      const doorsIn = I.isi.filter(e => e.t === 'D');
      for (const r of subs) {
        const [cx, cz] = T(r.x + r.w / 2, r.y + r.h / 2);
        m.box(X, cx, -0.018, cz, r.w, 0.021, r.h, C(FLOORC[r.kind] || '#c8b89a'));
        const edges = [[r.x, r.y, r.x + r.w, r.y], [r.x, r.y + r.h, r.x + r.w, r.y + r.h], [r.x, r.y, r.x, r.y + r.h], [r.x + r.w, r.y, r.x + r.w, r.y + r.h]]
          .filter(([x0, y0, x1, y1]) => !(y0 === y1 && (Math.abs(y0 - f.y) < 0.25 || Math.abs(y0 - f.y - Dd) < 0.25)) && !(x0 === x1 && (Math.abs(x0 - f.x) < 0.25 || Math.abs(x0 - f.x - W) < 0.25)));
        const gaps = edges.map(([x0, y0, x1, y1]) => doorsIn.filter(d => y0 === y1 ? !d.v && Math.abs(d.y - y0) < 0.3 && d.x + d.n > x0 && d.x < x1 : d.v && Math.abs(d.x - x0) < 0.3 && d.y + d.n > y0 && d.y < y1).map(d => y0 === y1 ? [d.x, d.x + d.n] : [d.y, d.y + d.n]));
        if (edges.length && gaps.every(g => !g.length)) { const i = Math.max(0, edges.findIndex(([, y0, , y1]) => y0 === y1 && y0 > r.y)); const [x0, y0, x1, y1] = edges[i], c = y0 === y1 ? (x0 + x1) / 2 : (y0 + y1) / 2; gaps[i] = [[c - 0.6, c + 0.6]]; }
        edges.forEach(([x0, y0, x1, y1], i) => {
          const hor = y0 === y1, a0 = hor ? x0 : y0, a1 = hor ? x1 : y1, cuts = gaps[i].sort((p, q) => p[0] - q[0]); let s0 = a0;
          for (const seg of [...cuts, [a1, a1]]) { const e0 = Math.min(a1, seg[0]); if (e0 - s0 > 0.15) { const mid = (s0 + e0) / 2, [px, pz] = hor ? T(mid, y0) : T(x0, mid), sx = hor ? e0 - s0 : 0.1, sz = hor ? 0.1 : e0 - s0;
            m.box(X, px, 0, pz, sx, 1.15, sz, shade(C(WALLC[r.kind] || '#e8e0cc'), 0.9)); m.box(X, px, 1.15, pz, sx + 0.02, 0.05, sz + 0.02, C('#8a6a4a')); collision.box(R.ox + px, R.oz + pz, sx / 2, sz / 2); } s0 = Math.max(s0, seg[1]); }
        });
        if (r.label) { const lab = textPlane([r.label], Math.min(r.w - 0.3, 2.6), 0.42, '#2a2014', '#fff6d8', 46), [lx, lz] = T(r.x + r.w / 2, r.y + r.h - 0.45); lab.rotation.x = -Math.PI / 2; lab.position.set(R.ox + lx, 0.012, R.oz + lz); scene.add(lab); }
      }
      // perabot
      for (const e of items.filter(e => e.t === 'F')) {
        let [cx, cz] = T(e.x + e.w / 2, e.y + e.h / 2); const sw = e.w, sd = e.h, c = FC[e.kind] || '#a8a8a0', long = Math.max(sw, sd), short = Math.min(sw, sd), rot = sw >= sd ? 0 : Math.PI / 2;
        // jalur masuk dari pintu (lebar pintu x 2 petak) harus bebas: perabot yang menghalangi digeser ke dalam
        if (main && Math.min(sw, sd) >= 0.35 && Math.abs(cx - doorX) < sw / 2 + Math.min(main.n, 3) / 2 + 0.1 && cz + sd / 2 > Dd / 2 - 2.4) { const nz = Dd / 2 - 2.5 - sd / 2; if (nz - sd / 2 > -Dd / 2) cz = nz; else continue; }
        const p = P(cx, cz, rot), seed = Math.round(e.x * 13 + e.y * 7);
        if (short < 0.35) { m.box(X, cx, 0.001, cz, sw, 0.02, sd, C(c)); continue; }   // garis lantai, saf, renceng
        if (long <= 2.6) {
          if (e.kind === 'rak') shelfUnit(m, p, long - 0.1, 1.5, 4, seed, Math.min(0.6, Math.max(0.3, short)), '#9aa0a8', short > 0.7);
          else if (e.kind === 'meja') { table(m, p, long, Math.min(short, 1.4), 0.75, '#8a5a34'); if (short >= 1) for (const sx of [-1, 1]) chair(m, P(cx + (rot ? 0 : sx * (long / 2 + 0.3)), cz + (rot ? sx * (long / 2 + 0.3) : 0), rot ? (sx > 0 ? Math.PI : 0) : sx * -Math.PI / 2)); }
          else if (e.kind === 'kasur' && long >= 1.8 && short >= 0.9) bed(m, P(cx, cz, sw >= sd ? Math.PI / 2 : 0), pick(['#4a7ac0', '#c84a6a', '#5aa85a', '#e0a040'], hash(seed, 1)));
          else if (e.kind === 'sofa') sofa(m, p, long, '#5a6a8a');
          else if (e.kind === 'hitam' && short <= 1.6) { table(m, p, long, short * 0.8, 0.72, '#3a3a40'); m.box(p, 0, 0.72, -short * 0.2, 0.6, 0.42, 0.05, C('#1a1a1e')); m.box(p, 0, 0.76, -short * 0.2 + 0.03, 0.54, 0.34, 0.01, C('#3a8ac8')); chair(m, P(cx + (rot ? short / 2 + 0.2 : 0), cz + (rot ? 0 : short / 2 + 0.2), rot ? -Math.PI / 2 : Math.PI), '#2a2a2e'); }
          else if (e.kind === 'air') { m.box(p, 0, 0, 0, long, 0.5, short, C('#e8e4dc')); m.box(p, 0, 0.5, 0, long - 0.15, 0.02, short - 0.15, C('#4aa8d8')); }
          else if (e.kind === 'putih') m.box(p, 0, 0, 0, long, 1.3, short, C(c), { top: C('#ffffff') });
          else if (e.kind === 'logam') { m.box(p, 0, 0, 0, long, 0.92, short, C(c)); m.box(p, 0, 0.92, 0, long + 0.04, 0.04, short + 0.04, C('#d8dcdc')); }
          else if (e.kind === 'kain') { m.box(p, 0, 0, 0, long, 0.5, short, C(c)); m.box(p, 0, 0.5, 0, long - 0.1, 0.08, short - 0.1, shade(C(c), 1.15)); }
          else { m.box(p, 0, 0, 0, long, 0.9, short, C(c)); m.box(p, 0, 0.9, 0, long + 0.04, 0.05, short + 0.04, shade(C(c), 0.8)); }
          collision.box(R.ox + cx, R.oz + cz, sw / 2, sd / 2);
          continue;
        }
        // area besar: alas warna + isi sesuai jenis + papan nama gantung
        m.box(X, cx, -0.01, cz, sw - 0.1, 0.015, sd - 0.1, mix(C(c), C(FLOORC[mk] || '#c8b89a'), 0.55));
        const solid = (lx, lz, a, w2, d2) => { const q = L({ x: R.ox + cx, z: R.oz + cz, a: rot }, lx, lz); collision.box(q[0], q[1], w2 / 2, d2 / 2, rot + a); };
        const Q = (lx, lz, a = 0) => { const q = L({ x: cx, z: cz, a: rot }, lx, lz); return P(q[0], q[1], rot + a); };
        const lab = (e.label + ' ' + e.fn).toLowerCase();
        if (/piano/.test(lab)) { m.box(Q(0, -0.2), 0, 0, 0, 1.6, 1.0, 0.6, C('#1a1a1e')); m.box(Q(0, 0.12), 0, 0.72, 0, 1.5, 0.04, 0.2, C('#f2f2ee')); for (let i = 0; i < 14; i++) m.box(Q(-0.7 + i * 0.105, 0.1), 0, 0.765, 0, 0.05, 0.03, 0.12, C('#1a1a1e')); m.box(Q(0, 0.75), 0, 0, 0, 0.8, 0.45, 0.35, C('#2a2a2e')); solid(0, -0.2, 0, 1.6, 0.6); }
        else if (/gym|latihan|beban/.test(lab)) { for (let i = 0; i < 2; i++) { const lx = -long / 4 + i * long / 2; m.box(Q(lx, 0), 0, 0, 0, 0.5, 0.45, 1.4, C('#2a2a2e')); m.box(Q(lx, -0.5), 0, 0.9, 0, 1.4, 0.05, 0.05, C('#a8acb0')); for (const sx of [-0.6, 0.6]) m.box(Q(lx + sx, -0.5), 0, 0.72, 0, 0.08, 0.4, 0.4, C('#1a1a1e')); for (const sx of [-0.4, 0.4]) m.box(Q(lx + sx, -0.5), 0, 0, 0, 0.06, 0.9, 0.06, C('#6a6a70')); solid(lx, -0.2, 0, 1.4, 1.6); }
          m.box(Q(0, -short / 2 + 0.3), 0, 0, 0, long - 0.6, 0.35, 0.4, C('#5a5a60')); for (let i = 0; i < Math.floor((long - 0.8) / 0.4); i++) m.box(Q(-long / 2 + 0.6 + i * 0.4, -short / 2 + 0.3), 0, 0.35, 0, 0.16, 0.16, 0.16, C('#1a1a1e')); }
        else if (/dapur|bar\b/.test(lab)) { counter(m, Q(0, -short / 2 + 0.35), long - 0.4, '#e8e4dc', '#8a8e94'); solid(0, -short / 2 + 0.35, 0, long - 0.4, 0.6); m.box(Q(-long / 4, -short / 2 + 0.35), 0, 1.0, 0, 0.6, 0.06, 0.4, C('#2a2a2e')); m.box(Q(long / 4, -short / 2 + 0.35), 0, 0.96, 0, 0.5, 0.05, 0.35, C('#a8c8d8'));
          m.box(Q(0, -short / 2 + 0.15), 0, 1.6, 0, long - 0.4, 0.6, 0.3, C('#c8b8a0')); if (short > 2.4) { counter(m, Q(0, 0.4), Math.min(long - 1.2, 2.4), '#6a4428', '#e8e4dc'); solid(0, 0.4, 0, Math.min(long - 1.2, 2.4), 0.6); for (let i = 0; i < 3; i++) stool(m, Q(-0.8 + i * 0.8, 1.05), '#2a2a2e'); } }
        else if (/arkade|dance|capit/.test(lab)) { for (let i = 0; i < Math.floor((long - 0.4) / 1.0); i++) for (const sz of [-1, 1]) { const lx = -long / 2 + 0.7 + i * 1.0, lz = sz * (short / 2 - 0.5), a = sz > 0 ? Math.PI : 0; m.box(Q(lx, lz, a), 0, 0, 0, 0.7, 1.7, 0.6, C(pick(['#c83a8a', '#3a6ac8', '#f2c230', '#3ac87a'], hash(seed + i, sz)))); m.box(Q(lx, lz - sz * 0.31, a), 0, 1.0, 0, 0.5, 0.4, 0.01, C('#5ac8f8')); solid(lx, lz, 0, 0.7, 0.6); } }
        else if (/bangku|kursi|lesehan/.test(lab)) { const n = Math.max(1, Math.floor(short / 1.2)); for (let i = 0; i < n; i++) { const lz = -short / 2 + (i + 0.5) * short / n; sofa(m, Q(0, lz), Math.min(long - 0.4, 4.2), c === FC.kuning ? '#3a6ac0' : c); solid(0, lz, 0, Math.min(long - 0.4, 4.2), 0.8); } }
        else if (/sandal/.test(lab)) { m.box(Q(0, 0), 0, 0, 0, long - 0.2, 0.5, Math.min(short, 0.6), C('#7a5030')); for (let i = 0; i < Math.floor(long / 0.3); i++) m.box(Q(-long / 2 + 0.25 + i * 0.3, 0), 0, 0.5, 0, 0.2, 0.05, 0.4, C(pick(['#2a2a2e', '#3a6ac0', '#c83a3a', '#e8e8e8', '#6a4428'], hash(seed, i)))); solid(0, 0, 0, long - 0.2, 0.6); }
        else if (e.kind === 'rak') { const n = Math.max(1, Math.floor(short / 1.4)); for (let i = 0; i < n; i++) { const lz = -short / 2 + (i + 0.5) * short / n; shelfUnit(m, Q(0, lz), long - 0.6, 1.6, 4, seed + i, 0.6, '#9aa0a8', true); solid(0, lz, 0, long - 0.5, 0.65); } }
        else if (e.kind === 'meja') { const tw = Math.min(long - 0.8, 3.2), td = Math.min(short - 0.8, 1.4); table(m, Q(0, 0), tw, td, 0.75); for (let i = 0; i < Math.max(1, Math.floor(tw / 0.8)); i++) for (const sz of [-1, 1]) chair(m, Q(-tw / 2 + 0.4 + i * 0.8, sz * (td / 2 + 0.3), sz > 0 ? Math.PI : 0)); solid(0, 0, 0, tw, td); }
        else if (e.kind === 'kasur') { bed(m, Q(0, -short / 2 + 1.1, 0), pick(['#4a7ac0', '#c84a6a', '#5aa85a'], hash(seed, 2))); solid(0, -short / 2 + 1.1, 0, 1.1, 2.0); m.box(Q(long / 2 - 0.5, -short / 2 + 0.35), 0, 0, 0, 0.8, 1.8, 0.5, C('#7a5030')); solid(long / 2 - 0.5, -short / 2 + 0.35, 0, 0.8, 0.5); }
        else if (e.kind === 'sofa') { sofa(m, Q(0, -short / 2 + 0.5), Math.min(long - 0.6, 3.6)); table(m, Q(0, 0.4), 1.2, 0.6, 0.4, '#6a4428'); rug(m, Q(0, 0.3), Math.min(long - 0.4, 3.2), Math.min(short - 0.6, 2.2), '#8a3a2a', '#c87a4a'); solid(0, -short / 2 + 0.5, 0, Math.min(long - 0.6, 3.6), 0.8); }
        else if (e.kind === 'hitam') { m.box(Q(0, -short / 2 + 0.2), 0, 0.3, 0, long - 0.4, 1.6, 0.1, C('#1a1a1e')); m.box(Q(0, -short / 2 + 0.26), 0, 0.42, 0, long - 0.7, 1.36, 0.01, C('#3a6a9a')); solid(0, -short / 2 + 0.2, 0, long - 0.4, 0.15);
          for (let j = 0; j < Math.floor((short - 1.2) / 1.0); j++) for (let i = 0; i < Math.floor((long - 0.8) / 0.7); i++) stool(m, Q(-long / 2 + 0.75 + i * 0.7, -short / 2 + 1.4 + j * 1.0), '#c83a3a'); }
        else if (e.kind === 'air') { m.box(Q(0, 0), 0, 0, 0, long, 0.45, short, C('#e8e4dc')); m.box(Q(0, 0), 0, 0.45, 0, long - 0.3, 0.02, short - 0.3, C('#4aa8d8')); solid(0, 0, 0, long, short); }
        else if (e.kind === 'kain') { for (let i = 0; i < Math.max(1, Math.floor(short / 1.3)); i++) { const lz = -short / 2 + 0.65 + i * 1.3; m.box(Q(0, lz), 0, 1.3, 0, long - 0.8, 0.05, 0.05, C('#8a8a90')); for (let j = 0; j < Math.floor((long - 0.9) / 0.22); j++) m.box(Q(-long / 2 + 0.55 + j * 0.22, lz), 0, 0.45, 0, 0.16, 0.85, 0.45, C(pick(['#c84a6a', '#3a6ac0', '#f2c230', '#2a2a2e', '#e8e8e8', '#5aa85a'], hash(seed + i, j)))); solid(0, lz, 0, long - 0.8, 0.5); } }
        else if (e.kind === 'hijau') { for (let i = 0; i < Math.floor(long / 0.9); i++) for (const sz of [-1, 1]) pot(m, Q(-long / 2 + 0.45 + i * 0.9, sz * (short / 2 - 0.3)), 1.4); }
        else { const col2 = C(c); counter(m, Q(0, short / 2 - 0.4), long - 0.4, e.kind === 'logam' ? '#8a8e94' : e.kind === 'putih' ? '#dcdcd8' : c); solid(0, short / 2 - 0.4, 0, long - 0.4, 0.6);
          m.box(Q(0, -short / 2 + 0.25), 0, 0, 0, long - 0.4, 1.7, 0.4, shade(col2, 0.85)); solid(0, -short / 2 + 0.25, 0, long - 0.4, 0.4);
          if (e.kind === 'putih') shelfUnit(m, Q(0, -short / 2 + 0.7), long - 1, 1.4, 3, seed, 0.4, '#a8acb0'); }
        if (e.label) { const lab = textPlane([e.label], Math.min(long, 3), 0.42, '#2a2014', '#fff6d8', 46), [lx, lz] = [cx, cz - sd / 2 + 0.05]; lab.position.set(R.ox + lx, 2.15, R.oz + lz); scene.add(lab); }
      }
      // tangga
      for (const e of items.filter(e => e.t === 'S')) {
        const [cx, cz] = T(e.x + e.w / 2, e.y + e.h / 2), long = Math.max(e.w, e.h), short = Math.min(e.w, e.h), rot = e.w >= e.h ? Math.PI / 2 : 0, p = P(cx, cz, rot);
        const n = 7; for (let i = 0; i < n; i++) m.box(p, 0, 0, -long / 2 + (i + 0.5) * long / n, short - 0.1, (i + 1) * 0.18, long / n, shade(C('#b8b0a0'), 0.8 + (i % 2) * 0.1));
        for (const sx of [-1, 1]) m.box(p, sx * (short / 2 - 0.03), 0.9, 0, 0.05, 0.05, long, C('#5a4a3a'));
        const ax = rot ? 1 : 0, cand = [[ax ? long / 2 + 0.7 : 0, ax ? 0 : long / 2 + 0.7], [ax ? -long / 2 - 0.7 : 0, ax ? 0 : -long / 2 - 0.7], [ax ? 0 : short / 2 + 0.7, ax ? short / 2 + 0.7 : 0], [ax ? 0 : -short / 2 - 0.7, ax ? -short / 2 - 0.7 : 0]]
          .map(([dx, dz]) => [cx + dx, cz + dz]).filter(([x, z]) => Math.abs(x) < W / 2 - 0.4 && Math.abs(z) < Dd / 2 - 0.4).sort((p1, p2) => Math.hypot(...p1) - Math.hypot(...p2));
        const [lx, lz] = cand[0] || [0, Dd / 2 - 1];
        R.stairs = { lx, lz, label: e.label || 'Tangga' };
      }
      // titik interaksi bernomor
      for (const e of items.filter(e => e.t === 'M')) { const [lx, lz] = T(e.x, e.y), desc = e.desc; R.spot(lx, lz, 1.1, desc.length > 46 ? desc.slice(0, 44) + '…' : desc, () => toast(desc)); }
      // papan nama di dinding belakang & penjaga
      const sb = SIGN_BG[I.id]; if (sb && k === 0) R.sign('back', [I.name.replace(/\s*\(.*\)$/, '').toUpperCase()], 0, 2.05, Math.min(W - 1, 5), 0.5, sb[0], sb[1], 44);
      const kp = KEEP[I.id]; if (kp && k === 0) { const m1 = items.find(e => e.t === 'M'); const [lx, lz] = m1 ? T(m1.x, m1.y) : [0, 0]; addNPC(R, kp[0], kp[1], lx, Math.max(-Dd / 2 + 0.6, lz - 0.9), kp[2], 0.6); }
      finish(R); R.doorLabel = 'Masuk ' + R.name.split(' · ')[0];
      list.push(R);
    });
    // pindah lantai: tangga di lantai ini -> lantai berikutnya (lantai teratas: turun ke bawah)
    list.forEach((R, k) => {
      const up = list[k + 1], dn = list[k - 1];
      const land = T2 => T2.stairs ? { x: T2.ox + T2.stairs.lx, z: T2.oz + T2.stairs.lz } : { x: T2.ox, z: T2.oz + T2.d / 2 - 1 };
      const at = R.stairs ? { lx: R.stairs.lx, lz: R.stairs.lz } : { lx: 0, lz: R.d / 2 - 1 };
      if (up) R.spot(at.lx, at.lz, 1.3, 'Naik ke ' + up.name.split(' · ')[1], null), R.spots.at(-1).warp = () => ({ ...land(up), room: up });
      if (dn) R.spot(at.lx + (up ? 1.4 : 0), at.lz, 1.3, 'Turun ke ' + dn.name.split(' · ')[1], null), R.spots.at(-1).warp = () => ({ ...land(dn), room: dn });
      if (!up && !dn && R.stairs) R.spot(at.lx, at.lz, 1.2, R.stairs.label, () => toast(R.stairs.label + ': belum bisa naik sekarang.'));
    });
    dataRooms[I.id] = list[0];
  }

  /* ---------------- pintu di dunia luar */
  const put = (id, x, z, h, label) => outDoors.push({ id, x, z, h, label: label || rooms[id].doorLabel });
  if (kota.darto) { const D = kota.darto, [x, z] = L(D.xf, -0.6, D.d / 2 + 0.55); put('rumah', x, z, D.xf.a + Math.PI / 2); }
  for (const h of kota.houses) {
    if (h.type === 'MM') { const [x, z] = L(h.xf, 0.3, h.d / 2 + 0.5); put('indomurah', x, z, h.xf.a + Math.PI / 2); }
    else if (h.type === 'R7') { const [x, z] = L(h.xf, 0, h.d / 2 + 0.55), W = WARUNGS[h.owner || 0]; put('warung', x, z, h.xf.a + Math.PI / 2, 'Masuk warung ' + W[6]); outDoors.at(-1).owner = h.owner || 0; }
    else if (h.bengkel) { const [x, z] = L(h.xf, h.type === 'R3' ? -h.w / 4 : 0, h.d / 2 + 0.5); put('bengkel', x, z, h.xf.a + Math.PI / 2); }
  }
  const g = kota.specials?.gudang; if (g) { const [x, z] = L({ x: g.x, z: g.y, a: g.a }, -0.6, g.h / 2 + 0.5); put('markas', x, z, g.a + Math.PI / 2); }
  for (const d of kota.places?.doors || []) if (rooms[d.id]) put(d.id, d.x, d.z, d.h);
  // pintu interior guide 92: usaha & rumah NPC (ditandai h.named di kota.js), gedung kunci, kontainer proyek
  for (const h of kota.houses) if (h.named && dataRooms[h.named]) { const [x, z] = L(h.xf, h.type === 'R3' ? -h.w / 4 : 0, h.d / 2 + 0.55); put(h.named, x, z, h.xf.a + Math.PI / 2); }
  for (const [id, sp] of [['masjid_agung', 'masjid'], ['pasar', 'pasar'], ['plaza', 'plaza'], ['stasiun', 'stasiun'], ['rumah_bram', 'bram']]) {
    const b = kota.specials?.[sp]; if (!b || !dataRooms[id]) continue; const [x, z] = L({ x: b.x, z: b.y, a: b.a }, 0, b.h / 2 + 0.6); put(id, x, z, b.a + Math.PI / 2); }
  if (dataRooms.kontainer_proyek) put('kontainer_proyek', 220, 157.4, Math.PI / 2);
  // STM: pintu bengkel di ujung depan sayap bengkel, pintu gudang lama di halaman; Pak Bonar jaga di depan
  const stm = kota.specials?.stm;
  if (stm) {
    const xf = { x: stm.x, z: stm.y, a: stm.a }; let [x, z] = L(xf, stm.w / 2 - 1.6, 2.2 + 0.55); put('stm_bengkel', x, z, stm.a + Math.PI / 2);
    [x, z] = L(xf, -3.4, -stm.h / 2 + 3.2 + 0.55); put('stm_gudang', x, z, stm.a + Math.PI / 2);
    [x, z] = L(xf, -1.0, stm.h / 2 + 0.7); const p = collision.resolve({ x, z }, 0.3), c = new Character('satpam'); scene.add(c.group);
    npcs.push({ sid: 'satpam', name: 'Pak Bonar (satpam STM)', filler: true, lines: ['Anak SMA 3? Mau ngapain ke sini?', 'Masuk boleh, bikin ribut jangan.', 'Kobar sama gengnya jangan diladenin.'], c, home: { ...p }, x: p.x, z: p.z, tx: p.x, tz: p.z, wait: 2, heading: stm.a + Math.PI / 2, say: null, greetT: 0, roam: 1.2, key: 'bonar' });
  }

  /* ---------------- API */
  let back = null;
  return {
    rooms, outDoors,
    get cur() { return cur; },
    // target Aksi: pintu luar (di kota) atau pintu keluar (di dalam)
    target() {
      if (player.riding) return null;
      if (player.area === 'kota') {
        let best = null, bd = 1.5;
        for (const o of outDoors) { const d = Math.hypot(o.x - player.x, o.z - player.z); if (d < bd) { bd = d; best = o; } }
        if (best) { const R = rooms[best.id]; return { kind: 'warp', label: best.label, to: { x: R.exit.x, z: R.exit.z, heading: -Math.PI / 2, area: 'dalam' }, after: () => { back = { x: best.x, z: best.z, heading: best.h, owner: best.owner }; cur = R; R.setOwner?.(best.owner); R.onEnter?.(); } }; }
      } else if (player.area === 'dalam' && cur) {
        if (cur.exit && Math.hypot(cur.exit.x - player.x, cur.exit.z - player.z) < 0.9) return { kind: 'warp', label: 'Keluar', to: { ...(back || { x: kota.darto ? L(kota.darto.xf, -0.6, kota.darto.d / 2 + 0.8)[0] : 40, z: kota.darto ? L(kota.darto.xf, -0.6, kota.darto.d / 2 + 0.8)[1] : 90, heading: 0 }), area: 'kota' }, after: () => { cur = null; } };
        for (const s of cur.spots) if (Math.hypot(s.x - player.x, s.z - player.z) < s.r) {
          if (s.warp) { if (s.gate && !s.gate.ok()) return { kind: 'act', label: s.label, fn: s.gate.no };
            const T = s.warp(); return { kind: 'warp', label: s.label, to: { x: T.x, z: T.z, heading: T.heading ?? -Math.PI / 2, area: 'dalam' }, after: () => { cur = T.room; s.gate?.pay(); } }; }
          return { kind: 'act', label: s.label, fn: s.fn };
        }
      }
      return null;
    },
    // di ruangan mana pemain berada (setelah memuat simpanan)
    locate() { cur = null; if (player.area !== 'dalam') return; for (const R of Object.values(rooms)) if (Math.abs(player.x - R.ox) < R.w / 2 + 1 && Math.abs(player.z - R.oz) < R.d / 2 + 1) cur = R; },
    // cutaway: dinding di antara kamera dan isi ruangan disembunyikan
    update(camera) {
      if (!cur) return;
      const dx = camera.position.x - cur.ox, dz = camera.position.z - cur.oz, l = Math.hypot(dx, dz) || 1;
      for (const [k, w] of Object.entries(cur.walls)) { const vis = (w.n[0] * dx + w.n[1] * dz) / l < 0.25; w.mesh.visible = vis; for (const e of cur.extra[k]) e.visible = vis; }
    },
  };
}
