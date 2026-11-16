// Interior bangunan yang bisa dimasuki (Aksi di pintu): rumah Om Darto, Indomurah, warung kelontong, markas Lampu Kota,
// GOR, pabrik es tua, Gua Kapur, rumah pohon, pondok. Tiap ruangan dibangun di luar peta (x >= 700) sebagai area 'dalam';
// dinding yang menghalangi kamera disembunyikan (cutaway) supaya isi ruangan selalu kelihatan dari sudut mana pun.
import * as THREE from 'three';
import { Merger, col, shade, mix } from './geom.js';
import { MAT, hash, pick } from './common.js';
import { L } from './buildings.js';
import { CATALOG } from './shop.js';

const OX = 700, OZ = 30, GAP = 40;
const C = c => col(c);
const GOODS = ['#e85a5a', '#f2c230', '#3a7ac0', '#6ab85a', '#f2f2f2', '#e8823a', '#c25a8a', '#2a2a2e', '#8a5a3a', '#5ac0c0'];

// papan tulisan (kanvas) untuk nama toko & poster di dalam ruangan
function textPlane(lines, w, h, bg, fg, px = 64) {
  const cv = document.createElement('canvas'), k = 128; cv.width = Math.round(w * k); cv.height = Math.round(h * k);
  const g = cv.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  const L2 = [].concat(lines); L2.forEach((t, i) => { g.font = `bold ${i ? px * 0.55 : px}px Trebuchet MS, sans-serif`; g.fillText(t, cv.width / 2, cv.height * (i + 0.5) / L2.length); });
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
}

export function makeInteriors({ scene, kota, collision, player, Character, npcs, shop, acts, fight, toast }) {
  const rooms = {}, outDoors = [];
  let slot = 0, cur = null;

  /* ---------------- kerangka ruangan */
  function room(id, name, w, d, o = {}) {
    const ox = OX + slot * GAP, oz = OZ; slot++;
    const H = o.h || 2.5, wc = C(o.wall || '#e8e0cc'), doorX = o.doorX || 0, dw = o.doorW || 1.2;
    const P = (lx, lz, a = 0) => ({ x: ox + lx, z: oz + lz, a });
    const st = new Merger(), W = { back: new Merger(), front: new Merger(), left: new Merger(), right: new Merger() };
    const X = P(0, 0), t = 0.16, trim = shade(wc, 0.75), base = o.base ? C(o.base) : shade(wc, 0.55);
    // dinding: bagian bawah warna lis, atas warna dinding; sisi dalam saja yang penting
    const wall = (m, lx, lz, sx, sz) => { m.box(X, lx, 0, lz, sx, 0.9, sz, base); m.box(X, lx, 0.9, lz, sx, 0.06, sz, trim); m.box(X, lx, 0.96, lz, sx, H - 0.96, sz, wc); };
    wall(W.back, 0, -d / 2 - t / 2, w + t * 2, t); wall(W.left, -w / 2 - t / 2, 0, t, d); wall(W.right, w / 2 + t / 2, 0, t, d);
    const l0 = -w / 2 - t, l1 = doorX - dw / 2, r0 = doorX + dw / 2, r1 = w / 2 + t;
    wall(W.front, (l0 + l1) / 2, d / 2 + t / 2, l1 - l0, t); wall(W.front, (r0 + r1) / 2, d / 2 + t / 2, r1 - r0, t);
    W.front.box(X, doorX, 2.1, d / 2 + t / 2, dw, H - 2.1, t, wc); W.front.box(X, doorX, 2.05, d / 2 + t / 2, dw + 0.12, 0.08, t + 0.04, shade(wc, 0.6));
    // ambang pintu: cahaya luar & keset
    W.front.box(X, doorX, 0, d / 2 + t / 2, dw, 2.05, 0.02, C(o.outside || '#fff6d8'));
    st.box(X, doorX, 0.005, d / 2 - 0.45, dw * 0.8, 0.02, 0.5, C('#8a3a2a'));
    // lis rendah tetap terlihat walau dinding disembunyikan
    for (const [lx, lz, sx, sz] of [[0, -d / 2 - t / 2, w + t * 2, t], [-w / 2 - t / 2, 0, t, d], [w / 2 + t / 2, 0, t, d], [(l0 + l1) / 2, d / 2 + t / 2, l1 - l0, t], [(r0 + r1) / 2, d / 2 + t / 2, r1 - r0, t]]) st.box(X, lx, 0, lz, sx, 0.3, sz, base);
    // lantai + alas gelap di bawahnya
    st.box(X, 0, -0.4, 0, w + 3, 0.38, d + 3, C('#141418'));
    collision.box(ox, oz - d / 2 - t / 2, w / 2 + t, t / 2); collision.box(ox - w / 2 - t / 2, oz, t / 2, d / 2 + t); collision.box(ox + w / 2 + t / 2, oz, t / 2, d / 2 + t);
    collision.box(ox + (l0 + l1) / 2, oz + d / 2 + t / 2, (l1 - l0) / 2, t / 2); collision.box(ox + (r0 + r1) / 2, oz + d / 2 + t / 2, (r1 - r0) / 2, t / 2);
    collision.box(ox + doorX, oz + d / 2 + 0.3, dw / 2, 0.12);   // ambang: tidak bisa jalan keluar tembus, harus lewat Aksi
    const R = { id, name, ox, oz, w, d, H, P, st, W, X, wc, spots: [], walls: {}, extra: { back: [], left: [], right: [], front: [] },
      exit: { x: ox + doorX, z: oz + d / 2 - 0.75 }, dark: o.dark,
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
  const tiles = (R, c1, c2, s = 0.5) => { const a = C(c1), b = C(c2); for (let i = 0; i < Math.ceil(R.w / s); i++) for (let j = 0; j < Math.ceil(R.d / s); j++) { const x0 = -R.w / 2 + i * s, z0 = -R.d / 2 + j * s, sx = Math.min(s, R.w / 2 - x0), sz = Math.min(s, R.d / 2 - z0); R.st.box(R.X, x0 + sx / 2, -0.02, z0 + sz / 2, sx, 0.02, sz, (i + j) % 2 ? a : b); } };
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
    npcs.push({ sid, name, filler: true, lines, c, home: { x, z }, x, z, tx: x, tz: z, wait: Math.random() * 3, heading: Math.PI / 2, say: null, greetT: Math.random() * 6, roam, key: 'in' + R.id + npcs.length, area: 'dalam', ...extra });
  }
  const restOK = { t: -99 };
  const sleep = () => acts.doAct('lie', 3.2, () => { player.fx.hp = fight.maxHP(); toast('Tidur sebentar... Nyawa pulih penuh. (Tersimpan)'); fight.gain('nyali', 0.5); });

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
    R.sign('back', ['WARUNG BU IJAH', 'sedia gas • galon • pulsa'], 1.3, 2.05, 2.2, 0.38, '#e85a2a', '#ffffff', 40);
    R.sign('left', ['ES TEH 3RB', 'GORENGAN 1RB'], 1.6, 1.9, 1.0, 0.5, '#2a2014', '#f2d23a', 40);
    R.spot(-0.2, 1.6, 1.0, 'Jajan / jual ikan ke Bu Ijah', () => shop.open({ title: 'Warung Bu Ijah', sub: 'Bisa ngutang? Nggak.', items: CATALOG.warung, sellFish: true, thanks: 'Makasih, Nak!' }));
    addNPC(R, 'ibuDaster', 'Bu Ijah', -0.4, -0.3, ['Mau beli apa, Nak?', 'Ikanmu Ibu beli, buat digoreng.', 'Om Darto sehat?'], 0.5);
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

  /* ================= 5. GOR: lapangan bulu tangkis/futsal, tribun, papan skor */
  { const R = room('gor', 'GOR Kota (dalam)', 16, 11, { wall: '#d8dce0', base: '#2f5a8a', doorX: 0, h: 3.6, outside: '#f6f6e8' });
    planks(R, '#c8904a', 0.35); const m = R.st, P = R.P, wl = C('#f4f4f0');
    m.box(R.X, 0, 0, 0, 12.4, 0.004, 7.4, C('#3a7a5a')); m.box(R.X, 0, 0.002, 0, 12, 0.004, 7, C('#2f6a9a'));
    for (const z of [-3.5, 3.5]) m.box(R.X, 0, 0.006, z, 12, 0.004, 0.06, wl); for (const x of [-6, 0, 6]) m.box(R.X, x, 0.006, 0, 0.06, 0.004, 7, wl);
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; m.box({ x: R.ox + Math.cos(a) * 1.2, z: R.oz + Math.sin(a) * 1.2, a: a + Math.PI / 2 }, 0, 0.006, 0, 0.34, 0.004, 0.06, wl); }
    for (const sd of [-1, 1]) { const gx = sd * 6.1; m.box(R.X, gx, 0, -0.9, 0.08, 1.0, 0.08, wl); m.box(R.X, gx, 0, 0.9, 0.08, 1.0, 0.08, wl); m.box(R.X, gx, 0.95, 0, 0.08, 0.08, 1.88, wl); m.box(R.X, gx + sd * 0.5, 0, 0, 0.02, 0.9, 1.8, C('#dcdcd4')); R.solid(P(gx + sd * 0.3, 0), 0.6, 1.9); }
    // net bulu tangkis di tengah (dilipat ke samping)
    m.box(R.X, -6.6, 0, 4.4, 0.06, 1.55, 0.06, C('#3a3a40')); m.box(R.X, -3.6, 0, 4.4, 0.06, 1.55, 0.06, C('#3a3a40')); m.box(R.X, -5.1, 0.9, 4.4, 3, 0.6, 0.01, C('#2a2a2a'));
    // tribun bertingkat di sisi kiri & kanan
    for (let i = 0; i < 3; i++) m.box(R.X, 0, 0, -4.1 - i * 0.4, 11, 0.38 * (i + 1), 0.4, C(i % 2 ? '#e8302a' : '#f2c230'));
    R.solid(P(0, -4.5), 11, 1.2);
    R.sign('back', ['GOR KOTA WIRABUMI', 'SEHAT • SPORTIF • GUYUB'], 0, 2.4, 4.4, 0.7, '#2f5a8a', '#ffffff', 52);
    R.sign('back', ['HOME 3 - 2 TAMU'], 5, 2.4, 2.2, 0.6, '#1a1a1a', '#ff6a3a', 44);
    R.sign('left', ['JADWAL', 'Senin badminton • Rabu futsal', 'Sabtu senam pagi'], 0, 2.0, 2.6, 0.9, '#f4f4f0', '#2a2014', 32);
    for (let i = 0; i < 4; i++) crate(m, P(-7.4, -4.6 + i * 0.6), 0.5, '#4a6a8a');
    R.spot(0, 0, 1.6, 'Latihan lari bolak-balik (Kelincahan)', () => acts.doAct('run', 4, () => { fight.gain('kelincahan', 3); toast('Ngos-ngosan... Kelincahan naik!'); }));
    addNPC(R, 'siswaA', 'Andi', -3, -2, ['Futsal yuk, kurang satu orang!', 'Lapangan disewa sampai jam lima.'], 2.5);
    addNPC(R, 'pakRT', 'Pak Komar (penjaga GOR)', 6.8, 4.2, ['Jangan lupa lepas sepatu yang kotor.', 'Bola dikembalikan ke keranjang, ya.'], 0.6);
    finish(R); R.doorLabel = 'Masuk GOR';
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

  /* ---------------- pintu di dunia luar */
  const put = (id, x, z, h, label) => outDoors.push({ id, x, z, h, label: label || rooms[id].doorLabel });
  if (kota.darto) { const D = kota.darto, [x, z] = L(D.xf, -0.6, D.d / 2 + 0.55); put('rumah', x, z, D.xf.a + Math.PI / 2); }
  for (const h of kota.houses) {
    if (h.type === 'MM') { const [x, z] = L(h.xf, 0.3, h.d / 2 + 0.5); put('indomurah', x, z, h.xf.a + Math.PI / 2); }
    else if (h.type === 'R7') { const [x, z] = L(h.xf, 0, h.d / 2 + 0.55); put('warung', x, z, h.xf.a + Math.PI / 2); }
  }
  const g = kota.specials?.gudang; if (g) { const [x, z] = L({ x: g.x, z: g.y, a: g.a }, -0.6, g.h / 2 + 0.5); put('markas', x, z, g.a + Math.PI / 2); }
  for (const d of kota.places?.doors || []) if (rooms[d.id]) put(d.id, d.x, d.z, d.h);

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
        if (best) { const R = rooms[best.id]; return { kind: 'warp', label: best.label, to: { x: R.exit.x, z: R.exit.z, heading: -Math.PI / 2, area: 'dalam' }, after: () => { back = { x: best.x, z: best.z, heading: best.h }; cur = R; } }; }
      } else if (player.area === 'dalam' && cur) {
        if (Math.hypot(cur.exit.x - player.x, cur.exit.z - player.z) < 0.9) return { kind: 'warp', label: 'Keluar', to: { ...(back || { x: kota.darto ? L(kota.darto.xf, -0.6, kota.darto.d / 2 + 0.8)[0] : 40, z: kota.darto ? L(kota.darto.xf, -0.6, kota.darto.d / 2 + 0.8)[1] : 90, heading: 0 }), area: 'kota' }, after: () => { cur = null; } };
        for (const s of cur.spots) if (Math.hypot(s.x - player.x, s.z - player.z) < s.r) return { kind: 'act', label: s.label, fn: s.fn };
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
