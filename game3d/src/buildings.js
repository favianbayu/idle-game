// Model bangunan per tipe, mengikuti 05-bangunan.md (K1-K6 kampung, P1-P4 perumahan, R1-R3 ruko,
// rumah panggung bantaran). Bingkai lokal: lebar w di sumbu x, dalam d di sumbu z, DEPAN = +z (menghadap jalan).
import { col, shade, mix } from './geom.js';
import { FLOOR, hash, pick, facade, colLocal, GLASS, GLASS2, FRAME } from './common.js';

export const PAL = {
  kampung: { wall: ['#e8d8b8', '#b8d8b0', '#a8c8d8', '#e8b8b0', '#f0d890', '#b06a4a'], roof: ['#b4583e', '#b4583e', '#a8523a', '#8a6a5a', '#a8a8a0'], accent: ['#2f6a4a', '#2a5a8a'] },
  bantaran: { wall: ['#9a7a56', '#c8b088', '#8a9098'], roof: ['#8a5a44', '#8a5a44', '#2a6ac0'], accent: ['#6a4a30'] },
  perum: { wall: ['#f2eee6', '#c8c2b8', '#e6dcc8'], roof: ['#4a5058', '#2a2c30', '#5a6a80'], accent: ['#8a5a34', '#8a8478'] },
  ruko: { wall: ['#e0dcd2', '#bcbab4', '#ece2c4'], sign: ['#c83a3a', '#2a6ac0', '#f2c230', '#2f8a5a', '#8a3ab0'], canopy: ['#c8503a', '#3a7ac0', '#3a9a6a', '#d8a83a', '#9aa0a6'] },
};
export const L = (xf, lx, lz) => { const c = Math.cos(xf.a), s = Math.sin(xf.a); return [xf.x + lx * c - lz * s, xf.z + lx * s + lz * c]; };
const rot = (xf, da) => ({ x: xf.x, z: xf.z, y: xf.y, a: xf.a + da });
const at = (xf, lx, lz, da = 0, y) => { const [x, z] = L(xf, lx, lz); return { x, z, a: xf.a + da, y: y ?? xf.y }; };

/* ---------- potongan kecil */
export function motor(m, xf, c = '#3a6a8a') {
  m.box(xf, 0, 0.14, 0, 0.32, 0.4, 1.3, col(c)); m.box(xf, 0, 0.5, -0.15, 0.28, 0.1, 0.55, col('#1e1e22'));
  m.box(xf, 0, 0.5, 0.5, 0.42, 0.25, 0.08, col('#2a2a2e'));
  for (const s of [-1, 1]) m.box(xf, 0, 0, s * 0.5, 0.1, 0.38, 0.38, col('#26262a'));
}
export function car(m, xf, c = '#e8e8e8') {
  const cc = col(c);
  m.box(xf, 0, 0.18, 0, 1.5, 0.6, 3.2, cc); m.box(xf, 0, 0.78, -0.2, 1.36, 0.5, 1.7, GLASS2); m.box(xf, 0, 1.28, -0.2, 1.3, 0.06, 1.6, cc);
  for (const [x, z] of [[-0.7, 1], [0.7, 1], [-0.7, -1.05], [0.7, -1.05]]) m.box(xf, x, 0, z, 0.2, 0.45, 0.5, col('#222226'));
  m.box(xf, 0, 0.42, 1.61, 1.2, 0.12, 0.04, col('#f6f0c8'));
}
function chair(m, xf, c = '#d23a3a') { m.box(xf, 0, 0, 0, 0.42, 0.4, 0.42, col(c)); m.box(xf, 0, 0.4, -0.18, 0.42, 0.4, 0.06, col(c)); }
function jemuran(m, xf, lx, lz, len, seed) {
  for (const s of [-1, 1]) m.box(xf, lx + s * len / 2, 0, lz, 0.08, 1.5, 0.08, col('#7a6448'));
  m.box(xf, lx, 1.45, lz, len, 0.03, 0.03, col('#3a3a3a'));
  const cc = ['#e85a5a', '#f2f2f2', '#3a7ac0', '#f2c94c', '#6ab85a', '#c25a8a'];
  for (let i = 0; i < Math.floor(len / 0.45); i++) if (hash(seed, i) < 0.75) m.box(xf, lx - len / 2 + 0.3 + i * 0.45, 0.95 + hash(seed, i + 9) * 0.2, lz, 0.32, 0.5 - hash(seed, i + 9) * 0.2, 0.04, col(pick(cc, hash(seed, i + 3))));
}
function tandon(m, xf, lx, y, lz) { m.box(xf, lx, y, lz, 0.6, 0.12, 0.6, col('#6a6a70')); m.box(xf, lx, y + 0.12, lz, 0.55, 0.7, 0.55, col('#e8823a')); m.box(xf, lx, y + 0.82, lz, 0.3, 0.08, 0.3, col('#c86a2a')); }
function parabola(m, xf, lx, y, lz) { m.box(xf, lx, y, lz, 0.06, 0.5, 0.06, col('#5a5a60')); m.box(rot(xf, 0.4), 0, 0, 0, 0, 0, 0, FRAME); m.box(at(xf, lx, lz, 0.5), 0, y + 0.45, 0, 0.75, 0.6, 0.12, col('#d8d8dc')); }
function windowsSide(m, xf, w, d, floors, side, o = {}) { facade(m, xf, w, d, side, floors, { spacing: 1.6, ...o }); }
// atap pelana dengan bubungan sejajar sumbu z lokal (ujung segitiga menghadap jalan)
function gableZ(m, xf, lx, y, lz, w, d, h, c, wall, ov = 0.22) { m.gable(at(xf, lx, lz, Math.PI / 2, xf.y), 0, y, 0, d, w, h, c, ov, wall); }
function gableX(m, xf, lx, y, lz, w, d, h, c, wall, ov = 0.22) { m.gable(at(xf, lx, lz, 0, xf.y), 0, y, 0, w, d, h, c, ov, wall); }
function body(m, xf, lx, lz, w, d, h, wall, plinth = 0.15) {
  m.box(xf, lx, 0, lz, w + 0.04, plinth, d + 0.04, shade(wall, 0.7));
  m.box(xf, lx, plinth, lz, w, h - plinth, d, wall);
}
function door(m, xf, lx, lz, c, side = 0) {   // pintu menempel di dinding depan (z = lz)
  m.box(xf, lx, 0, lz + 0.03, 0.56, 1.42, 0.06, FRAME); m.box(xf, lx, 0, lz + 0.05, 0.48, 1.36, 0.06, c);
  m.box(xf, lx + 0.15, 0.65, lz + 0.09, 0.05, 0.05, 0.04, col('#d8c060'));
}
function win(m, xf, lx, y, lz, w = 0.62, h = 0.74, glass = GLASS) {
  m.box(xf, lx, y - 0.05, lz + 0.025, w + 0.1, h + 0.1, 0.05, FRAME); m.box(xf, lx, y, lz + 0.05, w, h, 0.05, glass);
  m.box(xf, lx, y + h / 2 - 0.02, lz + 0.08, w, 0.04, 0.02, FRAME);
}
function nako(m, xf, lx, y, lz, w = 0.7) {   // jendela nako (bilah kaca)
  m.box(xf, lx, y - 0.05, lz + 0.025, w + 0.1, 0.84, 0.05, col('#7a4a2a'));
  for (let i = 0; i < 5; i++) m.box(xf, lx, y + i * 0.15, lz + 0.06, w, 0.1, 0.05, i % 2 ? GLASS : GLASS2);
}

/* ---------- RUMAH KAMPUNG */
// o: { wall, roof, accent, seed, veg(list), C(collision), darto }
export function kampung(m, xf, type, o) {
  const { seed } = o, wall = col(o.wall), roof = col(o.roof), acc = col(o.accent), H = FLOOR;
  const C = (lx, lz, sx, sz) => colLocal(o.C, xf, lx, lz, sx, sz);
  const veg = (k, lx, lz, extra = {}) => { const [x, z] = L(xf, lx, lz); o.veg.push({ k, x, z, a: xf.a + hash(seed, x) * 6, ...extra }); };
  const r = k => hash(seed, k);
  if (type === 'K1') {            // rumah petak 3 x 4, pelana menghadap gang, teras semen
    const w = 3, d = 3.2, z0 = -0.4;
    body(m, xf, 0, z0, w, d, H, wall);
    door(m, xf, -0.6, z0 + d / 2, acc); win(m, xf, 0.7, 0.56, z0 + d / 2);
    windowsSide(m, xf, w, d, 1, 2, {}); m.box(xf, 0, 0, d / 2 + z0 + 0.45, w, 0.1, 0.9, col('#c4beb2'));
    gableZ(m, xf, 0, H, z0, w, d, 1.0, roof, wall);
    if (r(1) < 0.6) jemuran(m, xf, w / 2 + 0.6, 0.3, 1.6, seed);
    if (r(2) < 0.5) veg('pot', -w / 2 + 0.3, z0 + d / 2 + 0.5);
    C(0, z0, w, d);
  } else if (type === 'K2') {     // rumah teras 4 x 5: pelana + teras beratap 2 tiang
    const w = 4, d = 3.6, z0 = -0.7;
    body(m, xf, 0, z0, w, d, H, wall);
    door(m, xf, 0, z0 + d / 2, acc); nako(m, xf, -1.2, 0.56, z0 + d / 2); nako(m, xf, 1.2, 0.56, z0 + d / 2);
    windowsSide(m, xf, w, d, 1, 2, {}); windowsSide(m, xf, w, d, 1, 3, {});
    gableX(m, xf, 0, H, z0, w, d, 1.2, roof, wall);
    m.box(xf, 0, 0, z0 + d / 2 + 0.7, w, 0.14, 1.4, col(o.darto ? '#b8b0a0' : '#c8c0b0'));                // lantai teras
    for (const s of [-1, 1]) m.box(xf, s * (w / 2 - 0.15), 0.14, z0 + d / 2 + 1.25, 0.18, H - 0.25, 0.18, FRAME);   // tiang teras
    m.poly([at(xf, -w / 2 - 0.2, z0 + d / 2), at(xf, w / 2 + 0.2, z0 + d / 2), at(xf, w / 2 + 0.2, z0 + d / 2 + 1.6), at(xf, -w / 2 - 0.2, z0 + d / 2 + 1.6)]
      .map((p, i) => [p.x, H + (i < 2 ? 0.05 : -0.2), p.z]), shade(roof, 0.9));                              // atap teras (miring)
    if (o.darto) { m.box(xf, -1.0, 0.14, z0 + d / 2 + 0.45, 1.7, 0.42, 0.42, col('#8a5a34')); motor(m, at(xf, 2.6, z0 + d / 2 + 1.0, 0.2), '#3a6a8a'); veg('pot', 1.6, z0 + d / 2 + 0.3, { c: '#a0d080' }); }
    else { chair(m, at(xf, -1.2, z0 + d / 2 + 0.6, 0.3), pick(['#d23a3a', '#2a6ac0', '#3a9a4a'], r(3))); if (r(4) < 0.35) motor(m, at(xf, 1.0, z0 + d / 2 + 0.75, Math.PI / 2), pick(['#2a2a2e', '#c83a3a', '#2a6ac0'], r(5))); veg('pot', 1.7, z0 + d / 2 + 1.2); }
    if (r(6) < 0.3) m.box(xf, w / 2 - 0.4, H + 0.6, z0 - 0.6, 0.3, 0.3, 0.4, col('#c8c0b0'));               // kandang burung
    C(0, z0, w, d); C(-w / 2 + 0.15, z0 + d / 2 + 1.25, 0.25, 0.25); C(w / 2 - 0.15, z0 + d / 2 + 1.25, 0.25, 0.25);
  } else if (type === 'K3') {     // rumah tumbuh: lt1 bata, lt2 setengah jadi, tandon oranye, tangga besi luar
    const w = 4, d = 3.6, z0 = -0.3, brick = col('#b06a4a');
    body(m, xf, 0, z0, w, d, H, wall);
    door(m, xf, -0.8, z0 + d / 2, acc); win(m, xf, 0.9, 0.56, z0 + d / 2); windowsSide(m, xf, w, d, 1, 3, {});
    m.box(xf, 0, H, z0, w + 0.1, 0.14, d + 0.1, col('#a8a49a'));
    m.box(xf, 0.4, H + 0.14, z0 - 0.5, w - 0.8, FLOOR * 0.7, d - 1.4, brick);
    win(m, xf, 0.4, H + 0.6, z0 - 0.5 + (d - 1.4) / 2, 0.6, 0.5, col('#2a2a2e'));
    for (const [x, zz] of [[-w / 2 + 0.1, z0 + d / 2 - 0.1], [w / 2 - 0.1, z0 + d / 2 - 0.1], [-w / 2 + 0.1, z0 - d / 2 + 0.1]]) m.box(xf, x, H + 0.14, zz, 0.06, 0.6, 0.06, col('#5a4a40'));   // besi cor mencuat
    tandon(m, xf, -1.2, H + 0.14, z0 - 1.1);
    for (let i = 0; i < 6; i++) m.box(xf, w / 2 + 0.3, i * H / 6, z0 + 1.2 - i * 0.35, 0.5, 0.06, 0.32, col('#4a4a50'));   // tangga besi
    m.box(xf, w / 2 + 0.55, 0, z0, 0.04, H + 0.6, d - 0.6, col('#4a4a50'));
    C(0, z0, w + 0.9, d);
  } else if (type === 'K4') {     // rumah L mengapit halaman kecil, pohon mangga & bale bambu
    const w = 5, d = 4.6, z0 = -0.2;
    body(m, xf, 0, z0 - d / 2 + 1.1, w, 2.2, H, wall);
    body(m, xf, -w / 2 + 1.1, z0 + 0.7, 2.2, d - 1.4, H, wall);
    door(m, xf, 0.6, z0 - d / 2 + 2.2, acc); win(m, xf, 1.7, 0.56, z0 - d / 2 + 2.2); nako(m, xf, -w / 2 + 1.1, 0.56, z0 + d / 2);
    gableX(m, xf, 0, H, z0 - d / 2 + 1.1, w, 2.2, 0.9, roof, wall);
    gableZ(m, xf, -w / 2 + 1.1, H, z0 + 0.95, 2.2, d - 1.9, 0.9, roof, wall);
    m.box(xf, 1.4, 0, z0 + 1.1, 1.4, 0.4, 0.9, col('#c8a868')); for (const s of [-1, 1]) m.box(xf, 1.4 + s * 0.6, 0, z0 + 1.1, 0.1, 0.4, 0.9, col('#9a7440'));   // bale bambu
    veg('bulat', 0.4, z0 + 0.6, { s: 0.65 });
    if (r(7) < 0.5) { m.box(xf, w / 2 - 0.3, 0, z0 + 1.8, 0.8, 0.6, 0.6, col('#9a7440')); }   // kandang ayam
    C(0, z0 - d / 2 + 1.1, w, 2.2); C(-w / 2 + 1.1, z0 + 0.7, 2.2, d - 1.4); C(1.4, z0 + 1.1, 1.4, 0.9); C(0.4, z0 + 0.6, 0.4, 0.4);
  } else if (type === 'K5') {     // rumah warung: depan terbuka, etalase, renceng jajanan
    const w = 4, d = 3.6, z0 = -0.2, awn = col(pick(['#2a6ac0', '#c8503a', '#3a9a6a'], r(8)));
    body(m, xf, 0, z0, w, d, H, wall);
    m.box(xf, 0, 0.2, z0 + d / 2 + 0.01, w - 0.6, 1.2, 0.04, col('#3a2a20'));                     // bukaan warung
    m.box(xf, 0, 0, z0 + d / 2 + 0.3, w - 0.4, 0.85, 0.5, col('#c8a878'));                         // meja/etalase
    m.box(xf, -0.6, 0.85, z0 + d / 2 + 0.3, 1.2, 0.45, 0.42, col('#b8d8e8'));
    m.box(xf, 0.9, 0.85, z0 + d / 2 + 0.3, 0.5, 0.35, 0.4, col('#d23a3a'));                          // termos es
    for (let i = 0; i < 7; i++) m.box(xf, -w / 2 + 0.5 + i * 0.5, 1.15, z0 + d / 2 + 0.75, 0.18, 0.45, 0.03, col(pick(['#f2c230', '#e85a5a', '#3a9ae0', '#6ab85a', '#f28ab4'], hash(seed, i + 30))));   // renceng
    m.poly([at(xf, -w / 2, z0 + d / 2), at(xf, w / 2, z0 + d / 2), at(xf, w / 2, z0 + d / 2 + 1.2), at(xf, -w / 2, z0 + d / 2 + 1.2)].map((p, i) => [p.x, (i < 2 ? 1.75 : 1.5), p.z]), awn);
    m.box(xf, 0, H - 0.05, z0 + d / 2 + 0.06, w * 0.7, 0.35, 0.06, col('#f4f0e0'));                // papan nama
    gableX(m, xf, 0, H, z0, w, d, 1.1, roof, wall); windowsSide(m, xf, w, d, 1, 3, {});
    C(0, z0, w, d); C(0, z0 + d / 2 + 0.3, w - 0.4, 0.5);
  } else {                        // K6 rumah gang sempit 2.5 x 5, 2 lantai, balkon besi, parabola
    const w = 2.6, d = 4.2, z0 = -0.2;
    body(m, xf, 0, z0, w, d, 2 * H, wall);
    door(m, xf, -0.5, z0 + d / 2, acc); win(m, xf, 0.6, 0.56, z0 + d / 2, 0.5);
    win(m, xf, 0, H + 0.4, z0 + d / 2, 0.5, 1.0); m.box(xf, 0, H, z0 + d / 2 + 0.3, w - 0.2, 0.08, 0.6, col('#8a8a90'));
    for (let i = 0; i < 6; i++) m.box(xf, -w / 2 + 0.2 + i * (w - 0.4) / 5, H + 0.08, z0 + d / 2 + 0.56, 0.04, 0.55, 0.04, col('#2a2a2e'));
    m.box(xf, 0, H + 0.6, z0 + d / 2 + 0.56, w - 0.2, 0.05, 0.05, col('#2a2a2e'));
    windowsSide(m, xf, w, d, 2, 2, { spacing: 2 });
    gableZ(m, xf, 0, 2 * H, z0, w, d, 0.9, roof, wall);
    parabola(m, xf, w / 2 - 0.3, 2 * H + 0.3, z0 - d / 2 + 0.4);
    veg('pot', w / 2 - 0.3, z0 + d / 2 + 0.25);
    C(0, z0, w, d);
  }
}

/* ---------- RUMAH PANGGUNG BANTARAN */
export function panggung(m, xf, o) {
  const w = 2.6, d = 2.4, st = 0.62, wall = col(o.wall), roof = col(o.roof), wood = col('#6a4a30');
  for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [0, 1]]) m.box(xf, px * (w / 2 - 0.1), 0, pz * (d / 2 - 0.1) - 0.2, 0.14, st, 0.14, wood);
  const y = { ...xf, y: st };
  m.box(y, 0, 0, -0.2, w + 0.3, 0.1, d + 0.3, col('#8a6a4a'));
  // dinding papan: garis-garis papan selang-seling
  m.box(y, 0, 0.1, -0.2, w, FLOOR * 0.9, d, wall);
  for (let i = 0; i < 6; i++) m.box(y, -w / 2 + 0.2 + i * (w - 0.4) / 5, 0.1, -0.2 + d / 2 + 0.02, 0.05, FLOOR * 0.9, 0.03, shade(wall, 0.8));
  door(m, y, -0.5, -0.2 + d / 2, col('#6a4a30')); win(m, y, 0.6, 0.5, -0.2 + d / 2, 0.55, 0.6, col('#3a3028'));
  m.gable(at(y, 0, -0.2, 0, st), 0, FLOOR * 0.9 + 0.1, 0, w, d, 0.7, roof, 0.3, wall);
  for (let i = 0; i < 4; i++) m.box(xf, -0.5, i * st / 4, -0.2 + d / 2 + 0.3 + (3 - i) * 0.18, 0.6, 0.06, 0.2, col('#8a6a4a'));   // tangga kayu
  if (hash(o.seed, 3) < 0.7) jemuran(m, xf, w / 2 + 0.7, -0.2, 1.4, o.seed);
  colLocal(o.C, xf, 0, -0.2, w + 0.2, d + 0.2);
}

/* ---------- RUMAH PERUMAHAN */
export function perum(m, xf, type, o) {
  const wall = col(o.wall), roof = col(o.roof), wood = col('#8a5a34'), H = FLOOR;
  const C = (lx, lz, sx, sz) => colLocal(o.C, xf, lx, lz, sx, sz);
  const veg = (k, lx, lz, extra = {}) => { const [x, z] = L(xf, lx, lz); o.veg.push({ k, x, z, a: xf.a, ...extra }); };
  const { w, d } = o;   // ukuran tapak bangunan
  if (type === 'P1') {   // minimalis: kotak bertumpuk, atap datar, kaca besar, carport
    body(m, xf, -0.5, 0, w - 1, d, H, wall); body(m, at(xf, 0, -0.4, 0, H), 0.2, 0, w - 1.4, d - 0.8, H, shade(wall, 0.95), 0.01);
    m.box(xf, -0.5, H, 0.2, w - 0.8, 0.14, d + 0.2, col('#4a4a50')); m.box(xf, 0.2, 2 * H, -0.4, w - 1.2, 0.18, d - 0.6, col('#3a3a40'));
    m.box(xf, -0.5, 0.2, d / 2 + 0.01, 2.2, 1.3, 0.05, GLASS2); m.box(xf, 0.2, H + 0.3, d / 2 - 0.39, w - 2, 1.0, 0.05, GLASS2);
    m.box(xf, -0.5 + 1.6, 0, d / 2 + 0.01, 0.6, 1.4, 0.06, wood);
    m.box(xf, w / 2 - 0.2, 0, 0.6, 0.12, 2.1, 0.12, col('#3a3a40')); m.box(xf, w / 2 - 0.2, 2.1, 0.6, 2.4, 0.1, 3.4, col('#3a3a40'));   // carport
    car(m, at(xf, w / 2 + 0.6, 0.8), pick(['#e8e8e8', '#2a2a2e', '#a8a8b0'], hash(o.seed, 2)));
    m.box(xf, -w / 2 + 0.1, H, -d / 2 + 0.5, 0.1, H * 0.6, d - 1, wood);
  } else if (type === 'P2') {   // klasik: pilar putih, limas, air mancur, lampu taman bulat
    body(m, xf, 0, 0, w, d, 2 * H, wall);
    for (let f = 0; f < 2; f++) for (const x of [-w / 3, 0, w / 3]) if (!(f === 0 && x === 0)) win(m, xf, x, f * H + 0.5, d / 2, 0.8, 0.9, GLASS2);
    door(m, xf, 0, d / 2, wood); m.box(xf, 0, 1.45, d / 2 + 0.06, 0.9, 0.3, 0.05, FRAME);
    for (const x of [-1.4, -0.6, 0.6, 1.4]) m.box(xf, x, 0, d / 2 + 0.9, 0.3, 2 * H, 0.3, col('#fafaf6'));
    m.box(xf, 0, 2 * H - 0.25, d / 2 + 0.6, 3.6, 0.3, 1.4, col('#fafaf6'));
    m.hip(xf, 0, 2 * H, 0, w, d, 1.8, roof);
    windowsSide(m, xf, w, d, 2, 2, { ww: 0.8, glass: GLASS2 }); windowsSide(m, xf, w, d, 2, 3, { ww: 0.8, glass: GLASS2 });
    const fz = d / 2 + 2.6; m.box(xf, 0, 0, fz, 1.2, 0.3, 1.2, col('#d8d4cc')); m.box(xf, 0, 0.3, fz, 0.9, 0.08, 0.9, col('#6ab0e0')); m.box(xf, 0, 0.3, fz, 0.2, 0.7, 0.2, col('#e8e4dc'));
    for (const x of [-2.6, 2.6]) { m.box(xf, x, 0, fz, 0.08, 0.9, 0.08, col('#2a2a2e')); m.box(xf, x, 0.9, fz, 0.22, 0.22, 0.22, col('#fff6d0')); }
    C(0, fz, 1.2, 1.2);
  } else if (type === 'P3') {   // tropis: limas lebar menjorok, kayu, kolam ikan, kamboja
    body(m, xf, 0, 0, w, d, H, wall); body(m, at(xf, 0, 0, 0, H), 0, 0, w - 0.2, d - 0.2, H, wood, 0.01);
    for (let i = 0; i < 8; i++) m.box(xf, -w / 2 + 0.2 + i * (w - 0.4) / 7, H, d / 2 - 0.08, 0.05, H, 0.03, shade(wood, 0.8));
    door(m, xf, -0.8, d / 2, wood); win(m, xf, 1.0, 0.4, d / 2, 1.4, 1.0, GLASS2); win(m, xf, 0, H + 0.4, d / 2 - 0.1, 2.2, 0.8, GLASS2);
    m.box(xf, 0, 0, d / 2 + 0.7, w - 1, 0.25, 1.4, wood);   // teras kayu
    m.hip(xf, 0, 2 * H, 0, w, d, 1.6, roof, 0.8);
    m.box(xf, w / 2 - 1.1, 0, d / 2 + 2.5, 1.6, 0.06, 1.1, col('#4a90b8'));  // kolam ikan
    veg('bulat', -w / 2 + 0.9, d / 2 + 2.4, { s: 0.55, c: '#f0f0e0' });
    C(-w / 2 + 0.9, d / 2 + 2.4, 0.35, 0.35);
  } else {                      // P4 rumah sudut L, dua mobil, taman luas
    body(m, xf, 0, -d / 4, w, d / 2, 2 * H, wall); body(m, xf, -w / 4, d / 4, w / 2, d / 2, 2 * H, wall);
    windowsSide(m, xf, w, d / 2, 2, 1, { ww: 0.9, glass: GLASS2 });
    for (let f = 0; f < 2; f++) { win(m, at(xf, -w / 4, d / 4), 0, f * H + 0.5, d / 4, 1.4, 0.9, GLASS2); win(m, at(xf, w / 4, -d / 4), 0, f * H + 0.5, d / 4, 1.2, 0.9, GLASS2); }
    door(m, xf, 0.5, 0, wood);
    m.hip(xf, 0, 2 * H, -d / 4, w, d / 2, 1.4, roof); m.hip(at(xf, -w / 4, d / 4), 0, 2 * H, 0, w / 2, d / 2, 1.4, roof);
    car(m, at(xf, w / 4 - 0.6, d / 4 + 0.4), '#2a2a2e'); car(m, at(xf, w / 4 + 1.1, d / 4 + 0.4), '#a83a3a');
    C(-w / 4, d / 4, w / 2, d / 2);
  }
  if (type !== 'P4') C(0, 0, w, d); else C(0, -d / 4, w, d / 2);
  // pagar halaman (yard: { w, front, back }) dengan gerbang di depan
  const Y = o.yard, fc = col(type === 'P1' ? '#2a2a2e' : type === 'P2' ? '#f2f0ea' : type === 'P3' ? '#8a5a34' : '#3f7a40');
  const fz = d / 2 + Y.front, bz = -d / 2 - Y.back, hw = Y.w / 2, gate = 2.2, gx = type === 'P1' ? w / 2 + 0.6 : 0;
  const seg = (x0, z0, x1, z1) => {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sx = Math.abs(x1 - x0) + 0.1, sz = Math.abs(z1 - z0) + 0.1;
    if (type === 'P4') { const [x, z] = L(xf, cx, cz); o.veg.push({ k: 'pagarHidup', x, z, a: xf.a + (sx > sz ? 0 : Math.PI / 2), sx: Math.max(sx, sz) }); }
    else { m.box(xf, cx, 0, cz, sx, 0.15, sz, col('#8a8478')); m.box(xf, cx, 0.15, cz, sx, 0.75, sz, fc); if (type === 'P1') m.box(xf, cx, 0.5, cz, sx + 0.02, 0.06, sz + 0.02, col('#d8d8d8')); }
    C(cx, cz, sx, sz);
  };
  seg(-hw, bz, hw, bz); seg(-hw, bz, -hw, fz); seg(hw, bz, hw, fz);
  seg(-hw, fz, gx - gate / 2, fz); seg(gx + gate / 2, fz, hw, fz);
  for (const x of [gx - gate / 2, gx + gate / 2]) { m.box(xf, x, 0, fz, 0.3, 1.2, 0.3, col('#d8d4cc')); m.box(xf, x, 1.2, fz, 0.22, 0.2, 0.22, col('#fff6d0')); }
  veg('semak', -hw + 0.7, fz - 0.6); veg('semak', hw - 0.7, fz - 0.6); veg('bunga', -hw + 1.4, fz - 0.5, { c: '#f06080' }); veg('bunga', hw - 1.4, fz - 0.5, { c: '#f0d040' });
}

/* ---------- RUKO */
export function ruko(m, xf, type, o) {
  const wall = col(o.wall), sign = col(o.sign), canopy = col(o.canopy), H = FLOOR;
  const { w, d } = o, floors = type === 'R2' ? 3 : 2, Ht = floors * H;
  body(m, xf, 0, 0, w, d, Ht, wall);
  // lantai dasar: rolling door
  const units = type === 'R3' ? 2 : 1;
  for (let u = 0; u < units; u++) {
    const ux = -w / 2 + (u + 0.5) * w / units, uw = w / units - 0.3;
    if (type === 'R2') { m.box(xf, ux, 0.1, d / 2 + 0.02, uw, 1.6, 0.05, GLASS2); m.box(xf, ux, 0, d / 2 + 0.05, 0.9, 1.5, 0.05, col('#a8d0e8')); }
    else { m.box(xf, ux, 0, d / 2 + 0.02, uw, 1.65, 0.05, col('#9aa0a6')); for (let i = 1; i < 8; i++) m.box(xf, ux, i * 0.2, d / 2 + 0.05, uw, 0.025, 0.02, col('#7a8086')); }
  }
  for (let f = 1; f < floors; f++) {
    if (type === 'R2') m.box(xf, 0, f * H + 0.25, d / 2 + 0.02, w - 0.3, H - 0.5, 0.05, mix(GLASS2, col('#a8c8e0'), 0.3));
    else for (let u = 0; u < units * 2; u++) nako(m, xf, -w / 2 + (u + 0.5) * w / (units * 2), f * H + 0.5, d / 2, 0.8);
  }
  if (type === 'R1') { m.box(xf, w / 2 + 0.2, H + 0.4, 0.5, 0.35, 0.5, 0.7, col('#d8d8d0')); for (let i = 0; i < 6; i++) m.box(xf, -w / 2 + 0.3 + i * (w - 0.6) / 5, H + 0.4, d / 2 + 0.1, 0.04, 0.9, 0.04, col('#3a3a3e')); }
  // papan nama (R2: neon box menyala) + kanopi
  m.box(xf, 0, H + (type === 'R2' ? 0.0 : -0.05), d / 2 + 0.1, w - 0.2, 0.42, 0.14, type === 'R1' ? mix(sign, col('#d8d4cc'), 0.35) : sign);
  m.box(xf, 0, H + 0.12, d / 2 + 0.18, w * 0.6, 0.16, 0.02, col('#f8f4e8'));
  if (type === 'R2') m.box(xf, 0, 1.75, d / 2 + 0.7, w, 0.05, 1.3, mix(GLASS2, col('#ffffff'), 0.4));
  else m.poly([at(xf, -w / 2, d / 2), at(xf, w / 2, d / 2), at(xf, w / 2, d / 2 + 1.3), at(xf, -w / 2, d / 2 + 1.3)].map((p, i) => [p.x, i < 2 ? 1.95 : 1.7, p.z]), canopy);
  // atap datar + dinding pembatas + tandon
  m.box(xf, 0, Ht, 0, w, 0.1, d, shade(wall, 0.85));
  for (const [lx, lz, sx, sz] of [[0, d / 2 - 0.06, w, 0.12], [0, -d / 2 + 0.06, w, 0.12], [w / 2 - 0.06, 0, 0.12, d], [-w / 2 + 0.06, 0, 0.12, d]]) m.box(xf, lx, Ht + 0.1, lz, sx, 0.35, sz, shade(wall, 0.95));
  if (hash(o.seed, 4) < 0.5) tandon(m, xf, w / 4, Ht + 0.1, -d / 4);
  if (type === 'R3') for (let i = 0; i < 8; i++) m.box(xf, w / 2 + 0.35, i * H / 8, -d / 2 + 0.5 + i * 0.4, 0.6, 0.08, 0.36, col('#8a8478'));
  colLocal(o.C, xf, 0, 0, w + (type === 'R3' ? 0.9 : 0), d);
}
