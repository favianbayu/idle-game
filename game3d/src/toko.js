// Bangunan komersial pusat kota: ruko bertingkat, hotel/kos, kantor bank, warung kelontong,
// minimarket parodi "Indomurah" dengan parkiran, dan lahan parkir. Bingkai lokal sama dengan buildings.js:
// lebar w di x, dalam d di z, DEPAN = +z (menghadap jalan), titik asal di tengah tapak.
import * as V from './vehicles.js';
import { col, shade, mix } from './geom.js';
import { FLOOR, hash, pick, colLocal, GLASS, GLASS2, FRAME } from './common.js';
import { body, nako, tandon, chair, at } from './buildings.js';
import { shopFor, bannerFor, ledFor, MM } from './signs.js';

const STEEL = col('#5a5e66'), DARK = col('#2a2c30'), WHITE = col('#f4f2ec'), ASPH = col('#4a4c50');

/* ---------- potongan */
// papan nama: rangka kotak + muka bertulisan (atlas) sedikit di depannya
export function board(m, S, xf, lx, y, lz, w, h, cell, frame = DARK) {
  m.box(xf, lx, y - 0.04, lz + 0.06, w + 0.08, h + 0.08, 0.12, frame);
  S.sign(xf, lx, y, lz + 0.125, w, h, cell);
}
// spanduk vinyl diikat tali di empat sudut
export function spanduk(m, S, xf, lx, y, lz, w, h, cell) {
  S.sign(xf, lx, y, lz + 0.03, w, h, cell);
  for (const sx of [-1, 1]) for (const sy of [0, 1]) m.box(xf, lx + sx * (w / 2 + 0.06), y + sy * h - 0.02, lz + 0.02, 0.12, 0.02, 0.02, col('#3a3a30'));
}
// LED berjalan: rumah hitam + layar titik-titik yang bergeser
export function ledStrip(m, S, xf, lx, y, lz, w, row) {
  m.box(xf, lx, y - 0.04, lz - 0.02, w + 0.08, 0.28, 0.08, DARK);
  S.led(xf, lx, y, lz + 0.025, w, 0.2, row);
}
// kanopi terpal bergaris (warung, tenda)
function awning(m, xf, lx, y, lz, w, dep, c1, c2, drop = 0.3) {
  const n = Math.max(4, Math.round(w / 0.3));
  for (let i = 0; i < n; i++) {
    const x0 = lx - w / 2 + i * w / n, x1 = x0 + w / n, P = (x, yy, z) => { const p = at(xf, x, z); return [p.x, yy, p.z]; };
    m.poly2([P(x0, y, lz), P(x1, y, lz), P(x1, y - drop, lz + dep), P(x0, y - drop, lz + dep)], i % 2 ? c1 : c2);
    m.box(xf, (x0 + x1) / 2, y - drop - 0.14, lz + dep, w / n, 0.14, 0.02, i % 2 ? c1 : c2);   // rumbai depan
  }
}
function ac(m, xf, lx, y, lz) { m.box(xf, lx, y, lz + 0.18, 0.5, 0.36, 0.26, col('#e6e6e2')); for (let i = 0; i < 4; i++) m.box(xf, lx, y + 0.05 + i * 0.07, lz + 0.315, 0.38, 0.025, 0.01, col('#9a9a9a')); }
function railing(m, xf, lx, y, lz, w, c = STEEL) {
  m.box(xf, lx, y + 0.62, lz, w, 0.05, 0.05, c);
  for (let i = 0; i <= Math.round(w / 0.16); i++) m.box(xf, lx - w / 2 + i * w / Math.round(w / 0.16), y, lz, 0.03, 0.62, 0.03, c);
}
function rolling(m, xf, lx, lz, w, h = 1.65) { m.box(xf, lx, 0, lz + 0.02, w, h, 0.05, col('#9aa0a6')); for (let i = 1; i < h / 0.2; i++) m.box(xf, lx, i * 0.2, lz + 0.05, w, 0.025, 0.02, col('#7a8086')); }
function shopGlass(m, xf, lx, lz, w, h = 1.55) {
  m.box(xf, lx, 0.12, lz + 0.02, w, h, 0.04, mix(GLASS2, col('#c8e0f0'), 0.25));
  for (let i = 0; i <= Math.max(1, Math.round(w / 0.9)); i++) m.box(xf, lx - w / 2 + i * w / Math.max(1, Math.round(w / 0.9)), 0, lz + 0.05, 0.06, h + 0.12, 0.06, col('#c8ccd0'));
  m.box(xf, lx, 0, lz + 0.05, w, 0.12, 0.06, col('#c8ccd0')); m.box(xf, lx, h + 0.06, lz + 0.05, w, 0.08, 0.06, col('#c8ccd0'));
}
// barang dagangan di balik kaca / rak (warna-warni kecil)
function goods(m, xf, lx, y, lz, w, rows, seed) {
  const C = ['#e85a5a', '#f2c230', '#3a7ac0', '#6ab85a', '#f2f2f2', '#e8823a', '#c25a8a'];
  for (let r = 0; r < rows; r++) { m.box(xf, lx, y + r * 0.32 - 0.03, lz, w, 0.03, 0.3, col('#8a8a8a')); for (let i = 0; i < Math.floor(w / 0.16); i++) if (hash(seed + r, i) < 0.85) m.box(xf, lx - w / 2 + 0.08 + i * 0.16, y + r * 0.32, lz + (hash(i, r) - 0.5) * 0.08, 0.14, 0.12 + hash(seed, i + r) * 0.1, 0.12, col(pick(C, hash(seed * 3 + i, r)))); }
}
function xbanner(m, S, xf, lx, lz, cell) {   // banner berdiri (X-banner) di trotoar
  m.box(xf, lx, 0, lz, 0.05, 1.3, 0.05, STEEL); S.sign({ ...xf, a: xf.a }, lx, 0.25, lz + 0.03, 0.5, 1.05, cell, { vert: true });
}
function parkedMotors(m, xf, lx, lz, n, gap = 0.5, rot = 0) {
  for (let i = 0; i < n; i++) { const p = at(xf, lx + (i - (n - 1) / 2) * gap, lz, rot); const r = hash(Math.round(p.x * 7), Math.round(p.z * 7)); V.motor(m, p, pick(V.MOTOR_COLORS, r), pick(['matic', 'matic', 'bebek', 'sport', 'matic'], hash(r * 99, 3)), { helmet: r > 0.6 ? pick(['#e8e8e8', '#2a2a2e', '#c83a3a', '#2a6ac0'], r * 9 % 1) : null }); }
}

/* ---------- ruko & variasinya */
// R1 rolling door 2 lantai, R2 kaca 3 lantai (neon), R3 dua unit; R4 ruko 3 lantai berbalkon
export function rukoShop(m, S, xf, type, o) {
  const wall = col(o.wall), H = FLOOR, { w, d } = o, r = k => hash(o.seed, k);
  const floors = type === 'R2' || type === 'R4' ? 3 : 2, Ht = floors * H;
  body(m, xf, 0, 0, w, d, Ht, wall);
  const units = type === 'R3' ? 2 : 1;
  for (let u = 0; u < units; u++) {
    const ux = -w / 2 + (u + 0.5) * w / units, uw = w / units - 0.3, rr = hash(o.seed, 20 + u);
    if (type === 'R2' || (type === 'R4' && rr < 0.5)) { shopGlass(m, xf, ux, d / 2, uw); goods(m, xf, ux, 0.25, d / 2 - 0.3, uw - 0.3, 3, o.seed + u); }
    else if (rr < 0.35) rolling(m, xf, ux, d / 2, uw);                                    // toko tutup
    else { rolling(m, xf, ux, d / 2, uw, 0.25); m.box(xf, ux, 0.12, d / 2 - 0.25, uw, 1.4, 0.05, shade(wall, 0.45)); goods(m, xf, ux, 0.2, d / 2 - 0.15, uw - 0.2, 3, o.seed + u * 7); }   // rolling door terangkat: isi toko terlihat
    // papan nama per unit
    board(m, S, xf, ux, H - 0.02, d / 2, uw + 0.1, 0.46, o.cell || S.kinds.shop[shopFor(hash(o.seed, 30 + u))]);
  }
  // lantai atas
  for (let f = 1; f < floors; f++) {
    if (type === 'R2') m.box(xf, 0, f * H + 0.25, d / 2 + 0.02, w - 0.3, H - 0.5, 0.05, mix(GLASS2, col('#a8c8e0'), 0.3));
    else if (type === 'R4') {
      m.box(xf, 0, f * H - 0.06, d / 2 + 0.45, w, 0.1, 0.9, shade(wall, 0.9)); railing(m, xf, 0, f * H + 0.04, d / 2 + 0.88, w - 0.1);
      m.box(xf, 0, f * H + 0.1, d / 2 + 0.02, w * 0.62, 1.2, 0.04, GLASS2); m.box(xf, 0, f * H + 0.1, d / 2 + 0.04, 0.05, 1.2, 0.04, FRAME);
      ac(m, xf, w / 2 - 0.45, f * H + 1.05, d / 2); if (hash(o.seed, f) < 0.5) for (let i = 0; i < 4; i++) m.box(xf, -w / 2 + 0.6 + i * 0.32, f * H + 0.75, d / 2 + 0.8, 0.26, 0.4, 0.02, col(pick(['#e85a5a', '#f2f2f2', '#3a7ac0', '#f2c94c'], hash(o.seed + f, i))));   // jemuran di balkon
    } else for (let u = 0; u < units * 2; u++) nako(m, xf, -w / 2 + (u + 0.5) * w / (units * 2), f * H + 0.5, d / 2, 0.8);
    if (type !== 'R2' && type !== 'R4' && r(40 + f) < 0.4) ac(m, xf, w / 2 - 0.4, f * H + 1.2, d / 2);
  }
  if (type === 'R1') { m.box(xf, w / 2 + 0.2, H + 0.4, 0.5, 0.35, 0.5, 0.7, col('#d8d8d0')); for (let i = 0; i < 6; i++) m.box(xf, -w / 2 + 0.3 + i * (w - 0.6) / 5, H + 0.4, d / 2 + 0.1, 0.04, 0.9, 0.04, col('#3a3a3e')); }
  // kanopi / tritisan
  if (type === 'R2') m.box(xf, 0, 1.75, d / 2 + 0.7, w, 0.05, 1.3, mix(GLASS2, col('#ffffff'), 0.4));
  else m.poly2([at(xf, -w / 2, d / 2), at(xf, w / 2, d / 2), at(xf, w / 2, d / 2 + 1.3), at(xf, -w / 2, d / 2 + 1.3)].map((p, i) => [p.x, i < 2 ? 1.62 : 1.45, p.z]), col(o.canopy));
  // spanduk di lantai atas, LED berjalan menggantung di ujung kanopi, X-banner di depan
  if (r(5) < 0.5) spanduk(m, S, xf, 0, (floors - 1) * H + (type === 'R4' ? 1.05 : 1.3), d / 2 + (type === 'R4' ? 0.95 : 0.02), Math.min(w - 0.4, 3.2), 0.45, S.kinds.banner[bannerFor(r(6))]);
  if (r(7) < 0.45) ledStrip(m, S, xf, 0, 1.36, d / 2 + 1.36, Math.min(w - 0.5, 2.6), ledFor(r(8)));   // menempel di lis depan kanopi
  if (r(9) < 0.3 && !o.liar) xbanner(m, S, xf, w / 2 - 0.3, d / 2 + 1.5, S.kinds.vert[2 + Math.floor(r(10) * 2)]);
  // atap datar + dinding pembatas + tandon; R4 punya papan reklame di atap
  m.box(xf, 0, Ht, 0, w, 0.1, d, shade(wall, 0.85));
  for (const [lx, lz, sx, sz] of [[0, d / 2 - 0.06, w, 0.12], [0, -d / 2 + 0.06, w, 0.12], [w / 2 - 0.06, 0, 0.12, d], [-w / 2 + 0.06, 0, 0.12, d]]) m.box(xf, lx, Ht + 0.1, lz, sx, 0.35, sz, shade(wall, 0.95));
  if (r(4) < 0.5) tandon(m, xf, w / 4, Ht + 0.1, -d / 4);
  if (type === 'R4' && r(11) < 0.6) { for (const sx of [-1, 1]) m.box(xf, sx * w * 0.3, Ht + 0.1, d / 2 - 0.5, 0.08, 1.0, 0.08, STEEL); board(m, S, xf, 0, Ht + 0.7, d / 2 - 0.5, w - 0.4, 0.75, S.kinds.shop[shopFor(r(12))]); }
  if (type === 'R3') for (let i = 0; i < 8; i++) m.box(xf, w / 2 + 0.35, i * H / 8, -d / 2 + 0.5 + i * 0.4, 0.6, 0.08, 0.36, col('#8a8478'));
  colLocal(o.C, xf, 0, 0, w + (type === 'R3' ? 0.9 : 0), d);
}

// R5: hotel melati / kos 4 lantai, ramping, papan vertikal menonjol di sudut depan
export function hotelKos(m, S, xf, o) {
  const wall = col(o.wall), H = FLOOR, { w, d } = o, floors = 4, Ht = floors * H, kos = hash(o.seed, 1) < 0.5;
  body(m, xf, 0, 0, w, d, Ht, wall);
  shopGlass(m, xf, -0.3, d / 2, w - 1.2, 1.5); m.box(xf, w / 2 - 0.5, 0, d / 2 + 0.03, 0.6, 1.45, 0.05, col('#6a4a2a'));
  board(m, S, xf, 0, H - 0.05, d / 2, w - 0.3, 0.42, S.kinds.shop[kos ? 31 : 30]);
  for (let f = 1; f < floors; f++) for (let u = 0; u < 2; u++) { nako(m, xf, -w / 4 + u * w / 2, f * H + 0.5, d / 2, 0.75); if (hash(o.seed, f * 3 + u) < 0.35) ac(m, xf, -w / 4 + u * w / 2 + 0.6, f * H + 0.2, d / 2); }
  for (let f = 1; f < floors; f++) m.box(xf, 0, f * H + 0.3, d / 2 + 0.12, w, 0.06, 0.24, shade(wall, 0.8));   // tritisan jendela
  // papan vertikal (dua sisi) di sudut depan kanan
  m.box(xf, w / 2 + 0.06, H + 0.2, d / 2 - 0.15, 0.12, 2.6, 0.62, DARK);
  S.sign(xf, w / 2 + 0.125, H + 0.25, d / 2 - 0.15, 0.55, 2.5, S.kinds.vert[kos ? 1 : 0], { vert: true, face: 1 });
  S.sign(xf, w / 2 - 0.005, H + 0.25, d / 2 - 0.15, 0.55, 2.5, S.kinds.vert[kos ? 1 : 0], { vert: true, face: -1 });
  m.box(xf, 0, Ht, 0, w, 0.1, d, shade(wall, 0.85)); m.box(xf, 0, Ht + 0.1, d / 2 - 0.06, w, 0.35, 0.12, shade(wall, 0.95));
  tandon(m, xf, -w / 4, Ht + 0.1, -d / 4);
  colLocal(o.C, xf, 0, 0, w + 0.2, d);
}

// R6: kantor bank 5 lantai berdinding kaca, lobi bertiang, logo di atap, ATM di samping
export function kantor(m, S, xf, o) {
  const H = FLOOR, { w, d } = o, floors = 5, Ht = floors * H, wall = col(pick(['#d8d8d4', '#c8ccd2', '#e4dccc'], hash(o.seed, 1)));
  m.box(xf, 0, 0, 0, w + 0.06, 0.16, d + 0.06, shade(wall, 0.7));
  m.box(xf, 0, 0.16, -0.4, w - 0.6, H - 0.16, d - 0.8, mix(GLASS2, col('#a8c0d0'), 0.3));   // lobi kaca menjorok ke dalam
  for (const sx of [-1, -1 / 3, 1 / 3, 1]) m.box(xf, sx * (w / 2 - 0.15), 0, d / 2 - 0.15, 0.3, H, 0.3, wall);
  m.box(xf, 0, H, 0, w, Ht - H, d, mix(GLASS, col('#5a7a9a'), 0.5));
  for (let f = 1; f < floors; f++) m.box(xf, 0, f * H - 0.08, 0, w + 0.04, 0.16, d + 0.04, wall);                     // lis lantai
  for (let i = 0; i <= 6; i++) m.box(xf, -w / 2 + i * w / 6, H, d / 2, 0.08, Ht - H, 0.08, wall);                    // sirip vertikal depan
  for (let i = 0; i <= 5; i++) m.box(xf, w / 2, H, -d / 2 + i * d / 5, 0.08, Ht - H, 0.08, wall);
  m.box(xf, 0, Ht, 0, w + 0.1, 0.4, d + 0.1, wall);
  board(m, S, xf, 0, Ht + 0.45, d / 2 - 0.4, w * 0.7, 0.75, S.kinds.bank, WHITE);
  board(m, S, xf, 0, H - 0.6, d / 2 + 0.05, w * 0.5, 0.42, S.kinds.bank, WHITE);
  // ATM di sisi depan kiri + tangga & bendera
  m.box(xf, -w / 2 + 0.6, 0, d / 2 + 0.4, 0.9, 1.45, 0.6, col('#1a3a8a')); S.sign(xf, -w / 2 + 0.6, 1.1, d / 2 + 0.705, 0.86, 0.3, S.kinds.atm);
  m.box(xf, -w / 2 + 0.6, 0.6, d / 2 + 0.705, 0.4, 0.4, 0.01, col('#7ab0e0'));
  for (let i = 0; i < 3; i++) m.box(xf, 0.4, 0, d / 2 + 0.25 + i * 0.25, 2.4, 0.16 - i * 0.05, 0.25, col('#b8b4aa'));
  m.box(xf, w / 2 - 0.3, 0, d / 2 + 1.0, 0.06, 2.6, 0.06, STEEL); m.box(xf, w / 2 - 0.3 + 0.32, 2.15, d / 2 + 1.0, 0.6, 0.2, 0.02, col('#d0282e')); m.box(xf, w / 2 - 0.3 + 0.32, 1.95, d / 2 + 1.0, 0.6, 0.2, 0.02, WHITE);
  colLocal(o.C, xf, 0, 0, w, d);
}

// R7: warung kelontong satu lantai: terpal bergaris, rak penuh renteng sachet, etalase kaca, bangku panjang
export function warung(m, S, xf, o) {
  const wall = col(o.wall), { w, d } = o, H = 1.9, r = k => hash(o.seed, k);
  body(m, xf, 0, 0, w, d, H, wall);
  m.box(xf, 0, 0.1, d / 2 - 0.4, w - 0.3, 1.5, 0.8, shade(wall, 0.4));                       // bukaan depan
  goods(m, xf, 0, 0.35, d / 2 - 0.65, w - 0.5, 4, o.seed);
  for (let i = 0; i < Math.floor((w - 0.4) / 0.14); i++) m.box(xf, -w / 2 + 0.3 + i * 0.14, 1.05, d / 2 + 0.02, 0.1, 0.5, 0.01, col(pick(['#e8302a', '#f2c230', '#2a8ae0', '#f28a1a', '#3aa85a', '#f2f2f2'], hash(o.seed, i))));   // renteng sachet
  m.box(xf, -w / 4, 0, d / 2 + 0.3, w / 2 - 0.2, 0.8, 0.45, col('#a8784a')); m.box(xf, -w / 4, 0.8, d / 2 + 0.3, w / 2 - 0.2, 0.35, 0.45, mix(GLASS2, col('#ffffff'), 0.5));   // etalase
  goods(m, xf, -w / 4, 0.85, d / 2 + 0.3, w / 2 - 0.4, 1, o.seed + 3);
  m.box(xf, w / 4, 0, d / 2 + 0.9, w / 2 - 0.2, 0.36, 0.3, col('#7a5a3a'));                // bangku panjang
  awning(m, xf, 0, 1.85, d / 2, w + 0.2, 1.2, col(pick(['#2a6ac0', '#d8302a', '#2a8a4a'], r(1))), WHITE, 0.25);
  board(m, S, xf, 0, H + 0.05, d / 2 - 0.05, w - 0.2, 0.42, o.owner != null ? S.kinds.warung[o.owner] : S.kinds.shop[pick([15, 9, 21, 22, 19], r(2))]);
  for (let i = 0; i < 4; i++) m.box(xf, w / 2 + 0.25, 0, -d / 2 + 0.5 + i * 0.32, 0.28, 0.42, 0.28, col('#3a7ac0'));   // galon kosong
  // toples kerupuk di atas etalase, pisang & kerupuk tergantung, krat teh botol, karung beras, tabung gas, papan harga
  for (let i = 0; i < 3; i++) { const x = -w / 4 - 0.45 + i * 0.45; m.box(xf, x, 1.15, d / 2 + 0.3, 0.26, 0.3, 0.26, mix(GLASS2, col('#ffffff'), 0.65)); m.box(xf, x, 1.17, d / 2 + 0.3, 0.2, 0.2, 0.2, col(pick(['#f2e2b0', '#e8a040', '#d85a3a', '#f2c8a0'], hash(o.seed, i + 40)))); m.box(xf, x, 1.45, d / 2 + 0.3, 0.28, 0.05, 0.28, col('#d8302a')); }
  for (let i = 0; i < 3; i++) m.box(xf, w / 2 - 0.35 - i * 0.12, 1.25, d / 2 + 0.55, 0.1, 0.3, 0.1, col('#f2d23a'));
  for (let i = 0; i < 4; i++) m.box(xf, -w / 2 + 0.35 + i * 0.16, 1.15, d / 2 + 0.6, 0.12, 0.42, 0.02, col(pick(['#f2e8c0', '#f28a1a', '#e8302a'], hash(o.seed, i + 50))));
  m.box(xf, w / 4 + 0.55, 0, d / 2 + 0.35, 0.45, 0.32, 0.32, col('#d8a020')); for (let i = 0; i < 6; i++) m.box(xf, w / 4 + 0.4 + (i % 3) * 0.14, 0.32, d / 2 + 0.28 + Math.floor(i / 3) * 0.14, 0.06, 0.2, 0.06, col('#3a8a4a'));
  m.box(xf, -w / 2 + 0.3, 0, d / 2 + 0.15, 0.4, 0.45, 0.3, col('#f2f0e8')); m.box(xf, -w / 2 + 0.3, 0.45, d / 2 + 0.15, 0.26, 0.06, 0.2, col('#e8e4d8'));
  m.box(xf, w / 2 + 0.25, 0, d / 2 - 0.3, 0.24, 0.38, 0.24, col('#3a9a5a')); m.box(xf, w / 2 + 0.25, 0.38, d / 2 - 0.3, 0.08, 0.06, 0.08, col('#3a9a5a'));
  m.box(xf, w / 4, 0.36, d / 2 + 0.9, 0.5, 0.36, 0.02, col('#2a2014')); m.box(xf, w / 4, 0.42, d / 2 + 0.915, 0.42, 0.06, 0.01, col('#f2d23a')); m.box(xf, w / 4, 0.55, d / 2 + 0.915, 0.36, 0.05, 0.01, col('#f2f2f2'));
  m.box(xf, 0, H, 0, w + 0.3, 0.08, d + 0.3, col('#8a8a86'));
  colLocal(o.C, xf, 0, 0, w, d);
}

// MM: minimarket parodi. Kaca penuh di depan, pita biru-kuning-merah, logo di atas, ATM & galon, parkiran di depan
export function minimarket(m, S, xf, o) {
  const { w, d, setback } = o, H = 2.2, r = k => hash(o.seed, k);
  body(m, xf, 0, 0, w, d, H, WHITE);
  shopGlass(m, xf, 0.3, d / 2, w - 1.6, 1.6);
  goods(m, xf, 0.3, 0.3, d / 2 - 0.6, w - 2.0, 4, o.seed);
  m.box(xf, 0.3, 0.12, d / 2 + 0.05, 1.3, 1.55, 0.03, mix(GLASS2, col('#ffffff'), 0.5));   // pintu otomatis
  for (const px of [-w / 2 + 1.4, w / 2 - 1.0]) S.sign(xf, px, 0.9, d / 2 + 0.07, 0.9, 0.55, S.kinds.mm.promo);   // poster promo di kaca
  // pita garis + papan logo
  S.sign(xf, 0, H - 0.5, d / 2 + 0.035, w, 0.45, S.kinds.mm.stripe);
  for (const sx of [-1, 1]) S.sign(xf, sx * w / 2 + sx * 0.035, H - 0.5, 0, d, 0.45, S.kinds.mm.stripe, { face: sx });
  m.box(xf, 0, H, 0, w + 0.2, 0.12, d + 0.2, col('#e8e6e0'));
  for (const sx of [-1, 1]) m.box(xf, sx * 1.2, H + 0.12, d / 2 - 0.2, 0.08, 0.3, 0.08, STEEL);
  board(m, S, xf, 0, H + 0.4, d / 2 - 0.2, 3.4, 0.7, S.kinds.mm.logo, col('#e8e8e4'));
  // ATM di sisi kiri depan, rak galon & gas, bangku & tempat sampah
  m.box(xf, -w / 2 + 0.5, 0, d / 2 + 0.3, 0.8, 1.5, 0.5, col('#c8ccd0')); S.sign(xf, -w / 2 + 0.5, 1.15, d / 2 + 0.555, 0.76, 0.28, S.kinds.atm);
  m.box(xf, -w / 2 + 0.5, 0.6, d / 2 + 0.555, 0.36, 0.36, 0.01, col('#7ab0e0'));
  m.box(xf, w / 2 - 0.5, 0, d / 2 + 0.3, 0.7, 1.1, 0.5, col('#2a6a3a')); for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) m.box(xf, w / 2 - 0.66 + i * 0.32, 0.05 + j * 0.52, d / 2 + 0.32, 0.26, 0.42, 0.26, col(j ? '#7ac0e8' : '#3a9a5a'));
  m.box(xf, -0.9, 0, d / 2 + 0.55, 1.1, 0.4, 0.32, col('#6a4a2a')); m.box(xf, 1.2, 0, d / 2 + 0.5, 0.3, 0.55, 0.3, col('#2a8a4a')); m.box(xf, 1.55, 0, d / 2 + 0.5, 0.3, 0.55, 0.3, col('#f2c230'));
  m.box(xf, 0, 0, d / 2 + 0.6, w, 0.1, 1.0, col('#d8d4cc'));   // teras
  // parkiran: deretan motor serong + 1 mobil
  const pz = d / 2 + 1.1 + (setback - 1.1) / 2;
  parkedMotors(m, xf, -w / 4 - 0.2, pz + 0.3, Math.max(3, Math.round(w / 2 / 0.5) - 1), 0.5, 0.35);
  if (r(3) < 0.6) V.car(m, at(xf, w / 4 + 0.4, pz + 0.2, Math.PI), pick(V.CAR_COLORS, r(4)), pick(['hatch', 'mpv', 'suv'], r(5)));
  else parkedMotors(m, xf, w / 4 + 0.3, pz + 0.3, 4, 0.5, -0.35);
  tandon(m, xf, -w / 4, H + 0.12, -d / 4);
  colLocal(o.C, xf, 0, 0, w, d);
  return { x: at(xf, 0, d / 2 + 1.3).x, z: at(xf, 0, d / 2 + 1.3).z, a: xf.a, len: w - 1 };
}

// PK: lahan parkir terbuka: pos jaga, papan P, motor sederet & mobil berjajar
export function lahanParkir(m, S, xf, o) {
  const { w, d } = o, r = k => hash(o.seed, k);
  // pos jaga + papan
  m.box(xf, w / 2 - 0.6, 0, d / 2 - 0.5, 0.9, 1.6, 0.8, col('#e8e2d0')); m.box(xf, w / 2 - 0.6, 1.6, d / 2 - 0.5, 1.1, 0.08, 1.0, col('#2a6ac0'));
  m.box(xf, w / 2 - 0.6, 0.8, d / 2 - 0.09, 0.6, 0.45, 0.02, GLASS2); chair(m, at(xf, w / 2 - 0.6, d / 2 + 0.1), '#3a7ac0');
  for (const sx of [-1, 1]) m.box(xf, -w / 2 + 0.6 + sx * 0.9, 0, d / 2 - 0.1, 0.07, 2.3, 0.07, STEEL);
  board(m, S, xf, -w / 2 + 0.6, 1.85, d / 2 - 0.1, 2.0, 0.42, S.kinds.parkir);
  // mobil berjajar menghadap ke dalam (belakang), motor sederet di sisi depan
  const nc = Math.max(1, Math.floor((w - 1.8) / 1.75));
  for (let i = 0; i < nc; i++) if (r(10 + i) < 0.8) V.car(m, at(xf, -w / 2 + 1.1 + i * 1.75, -d / 2 + 1.5, Math.PI), pick(V.CAR_COLORS, r(20 + i)), pick(['mpv', 'sedan', 'hatch', 'suv', 'mpv'], r(30 + i)));
  parkedMotors(m, xf, -0.6, d / 2 - 1.6, Math.floor((w - 2.2) / 0.5), 0.5, 0);
  colLocal(o.C, xf, w / 2 - 0.6, d / 2 - 0.5, 0.9, 0.8);
  const p = at(xf, -0.6, d / 2 - 0.6);
  return { x: p.x, z: p.z, a: xf.a, len: w - 2.4 };
}
export { parkedMotors };
