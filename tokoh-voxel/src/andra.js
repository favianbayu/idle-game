// Andra Pamungkas: NPC romance cowok, anak STM Bangunan, pelukis mural, anggota Serigala Besi, jembatan damai dua geng.
// Badan sedang, kulit cokelat, rambut ikal sebahu diikat setengah ke atas (beberapa helai jatuh), alis tebal, mata cokelat
// hangat, senyum malas, tindik kecil di telinga kiri, tangan & baju kena cat waktu melukis mural, tato spidol di lengan.
// Skala lama 1.32, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  anSkin: ['#6e4428', '#84543a', '#9a6640', '#b07a52'], anSkinS: ['#865636'], tato: ['#22325a'],
  anHair: ['#100a06', '#180f0a', '#22160e', '#32221a'], anHairT: ['#4a3426'], ikat: ['#2d6cdf'],
  catK: ['#f2c12e'], catB: ['#2d6cdf'], catM: ['#d8402e'], catH: ['#3aa860'], beton: ['#7a7a75', '#8a8a85', '#9a9a95', '#b0b0aa'],
  overall: ['#24385c', '#2e4670', '#3a5888', '#4e6ea2'], overallS: ['#c8a84a'], maskerA: ['#c8ccd0', '#d8dce0', '#e8ecf0', '#f6f8fa'],
  rompiJ: ['#2a3e62', '#344c74', '#40608e', '#5676a8'], rompiJS: ['#22324e'], patch: ['#c8c4b8'], patchK: ['#2a2a2e'],
  kausA: ['#121214', '#1a1a1d', '#242428', '#34343a'], bungaA: ['#2a5a8a', '#336aa0', '#3f7cb8', '#5a94cc'], bungaK: ['#f2c12e'], bungaP: ['#f0f0ea'],
  anKulot: ['#141416', '#1c1c20', '#26262b', '#36363d'], bootsA: ['#3a2a1c', '#4a3624', '#5e4630', '#78583c'], topiA: ['#2d6cdf', '#3a7ce8', '#5090f0', '#70a8f6'],
  sarungA: ['#2a5a3a', '#346c46', '#3e7e52', '#529866'], sarungAS: ['#d8c87a'], partai: ['#d8d0b8', '#ece4cc', '#f8f2e0', '#ffffff'], partaiP: ['#c42a2a'],
});

/* ---------- wajah: alis tebal 2 baris + 1 baris jarak, mata sayu hangat (kelopak), senyum malas miring tepat di bawah
   hidung. Tindik di telinga kiri (sisi +y). */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'anSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, ...brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0, F0];   // 15 baris, mulut mulai z 4
const BROW = ['.BBBB....BBBB.', '..BBB....BBB..'];
const EYE = ['.KKKK....KKKK.', '.KKKW....WKKK.'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmmm.m..', F0]),
  kedip: F(BROW, [F0, '.KKKK....KKKK.'], ['.....mmmmm.m..', F0]),
  marah: F(['.BB........BB.', '..BBBB..BBBB..'], EYE, ['....mmmmmm....', '....m....m....']),
  teriak: F(['.BB........BB.', '..BBBB..BBBB..'], EYE, ['....mTTTTm....', '.....mttm.....']),
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....']),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....']),
};
export const EXPRS = Object.keys(FACES);

const plaid = v => { v.each((x, y, z, c) => { if (c === 'sarungA' && (z % 5 === 0 || (y + 40) % 4 === 0)) v.set(x, y, z, 'sarungAS'); }); return v; };   // sarung kotak: rok panjang lewat rok.js
const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
const topZ = (v, x, y) => { for (let z = 24; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'anSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'anSkin'); v.set(7, -1, 5, 'anSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'anSkin'); v.box(-1, y, 6, -1, y, 7, 'anSkinS'); }
  v.set(-1, 8, 5, 'kunciP');   // tindik telinga kiri
  if (o.mask) for (let y = -6; y <= 5; y++) for (let z = -1; z <= 1; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'maskerA'); }   // masker setengah turun di dagu
  // rambut ikal sebahu: atas diikat setengah ke belakang (cepol kecil), bawah jatuh ikal sampai bahu, helai depan jatuh
  const hair = new Vox();
  for (let z = -6; z <= 15; z++) hair.rrect(z, -10, -10, 7, 9, 'anHair', z <= 11 ? 5 : 6);
  hair.rrect(16, -8, -8, 6, 7, 'anHair', 5); hair.rrect(17, -6, -6, 4, 5, 'anHair', 4);
  const zmin = (x, y) => x >= 5 ? (Math.abs(y + 0.5) > 5.5 ? 6 : 14) : x >= 1 ? (Math.abs(y + 0.5) > 6.5 ? -2 + (rnd(x, y, 1) % 3) : 0) : -6 + (rnd(x, y, 2) % 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y) && !(x >= 3 && z <= 1 && Math.abs(y + 0.5) < 8)) v.set(x, y, z, c); });
  v.each((x, y, z, c) => { if (c === 'anHair') { const k = rnd(x, y, z) % 9; if (k === 0) v.set(x, y, z, 'anHairT'); } });
  // ikal: benjolan acak di permukaan
  const bumps = []; v.each((x, y, z, c) => { if (c === 'anHair' && rnd(x, y, z) % 13 === 0) bumps.push([x, y, z]); });
  for (const [x, y, z] of bumps) { const sy = y < 0 ? -1 : 1; if (x < 0 && !v.has(x - 1, y, z)) v.set(x - 1, y, z, 'anHair'); else if (!v.has(x, y + sy, z)) v.set(x, y + sy, z, 'anHair'); }
  if (o.cap) {   // topi terbalik biru elektrik: menutup rambut atas saja (z >= 13) + lis 3 voxel + pet di belakang
    v.each((x, y, z, c) => { if (z >= 13 && (c === 'anHair' || c === 'anHairT')) v.set(x, y, z, 'topiA'); });
    const ring = []; v.each((x, y, z, c) => { if (z === 13 && c === 'topiA') for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!v.has(x + dx, y + dy, z)) ring.push([x + dx, y + dy]); });
    for (const [x, y] of ring) for (let z = 12; z <= 14; z++) v.set(x, y, z, 'ikat');
    for (let y = -6; y <= 5; y++) { const xb = v.back(y, 13), e = Math.abs(y + 0.5) > 4.5 ? 1 : 0; for (let x = xb - 1; x >= xb - 6 + e; x--) v.set(x, y, 13, 'topiA'); }
  } else {   // cepol kecil setengah ke atas di belakang kepala, ikat biru
    for (let z = 12; z <= 16; z++) for (let y = -2; y <= 1; y++) for (let x = -12; x <= -9; x++) if ((x + 10.5) ** 2 + (y + 0.5) ** 2 + ((z - 14) * 0.8) ** 2 <= 5.5) v.set(x, y, z, 'anHair');
    for (let y = -2; y <= 1; y++) for (let z = 12; z <= 15; z++) v.set(-10, y, z, z === 13 || z === 14 ? 'ikat' : v.get(-10, y, z) || 'anHair');
  }
  for (const [y, zs] of [[-6, [12, 11, 10, 9, 8]], [5, [12, 11, 10, 9]], [-3, [13, 12]]]) for (const z of zs) v.set(8, y + (z < 10 ? (y < 0 ? -1 : 1) : 0), z, 'anHair');   // helai jatuh di depan
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function chest(o) {
  const T = o.top, v = new Vox(), M = T === 'mural', G = T === 'geng', J = T === 'bunga', R = T === 'rumah';
  const body = M ? 'white' : G ? 'rompiJ' : J ? 'bungaA' : R ? 'partai' : 'white';
  for (let z = 34; z <= 56; z++) { const w = z <= 40 ? 1 : z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0, f = J ? 1 : 0; v.rrect(z, -5 - f, -8 + w + t - f, 4 - t + f, 7 - w - t + f, body, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'anSkin', 2);
  const splat = (mats, n) => v.each((x, y, z, c) => { if ((c === 'white' || c === 'pants' || c === 'overall') && rnd(x, y, z) % n === 0) v.set(x, y, z, mats[rnd(z, x, y) % mats.length]); });
  if (R) { for (let y = -2; y <= 1; y++) v.pf(y, 56, 'anSkin'); v.shell(57, -3, -4, 3, 3, 'partai', 2); v.pfBox(-3, 44, 2, 50, 'partaiP'); v.pfBox(-1, 46, 0, 48, 'partai'); return v; }   // kaus partai bekas
  if (G) {   // rompi jeans terbuka di atas kaus hitam, patch kepala serigala di punggung
    for (let z = 34; z <= 56; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x === null) continue; v.set(x, y, z, null); v.set(x - 1, y, z, 'kausA'); }
    for (let z = 34; z <= 55; z++) { v.pf(-4, z, 'rompiJS'); v.pf(3, z, 'rompiJS'); }
    ['P....P', 'PP..PP', 'PPPPPP', 'PKPPKP', 'PPPPPP', '.PPPP.', '..KK..'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pb(2 - c, 52 - r, ch === 'P' ? 'patch' : 'patchK'); }));
    for (let z = 57; z <= 58; z++) v.shell(z, -3, -4, 3, 3, 'kausA', 2);
    return v;
  }
  if (J) {   // kemeja bunga oversize terbuka, kaus putih di dalam
    v.each((x, y, z, c) => { if (c === 'bungaA') { const k = rnd(x, y, z) % 10; if (k === 0) v.set(x, y, z, 'bungaK'); else if (k === 1) v.set(x, y, z, 'bungaP'); } });
    for (let z = 34; z <= 56; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x === null) continue; v.set(x, y, z, null); v.set(x - 1, y, z, 'white'); }
    for (let z = 57; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'bungaA', 2);
    for (let y = -2; y <= 1; y++) v.pf(y, 56, 'anSkin');
    return v;
  }
  if (M) {   // kaus putih penuh cipratan cat + overall jeans, tali kanan terpasang, tali kiri dilepas menjuntai
    for (let y = -2; y <= 1; y++) v.pf(y, 56, 'anSkin'); v.shell(57, -3, -4, 3, 3, 'white', 2);
    for (let z = 34; z <= 44; z++) for (let y = -4; y <= 3; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'overall'); }
    for (let y = -4; y <= 3; y++) v.pf(y, 44, 'overallS');
    for (let z = 44; z <= 56; z++) { const x = v.front(4, z); if (x !== null) v.set(x, 4, z, 'overall'); const xb = v.back(4, z); if (xb !== null) v.set(xb, 4, z, 'overall'); }
    v.pf(4, 44, 'overallS');
    splat(['catK', 'catB', 'catM', 'catH'], 9);
    for (let y = -2; y <= 1; y++) v.pf(y, 54, 'maskerA');
    return v;
  }
  // kemeja putih STM, lengan digulung, logo STM (bersih: cat hanya di baju mural)
  for (let z = 34; z <= 55; z++) v.pf(0, z, 'whiteS');
  ['.X.', 'XYX', '.X.'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pf(c - 6, 50 - r, ch === 'X' ? 'stm' : 'stmS'); }));
  for (const [y, z] of [[-1, 55], [0, 55], [0, 54]]) v.pf(y, z, 'anSkin');
  for (let z = 56; z <= 57; z++) v.shell(z, -3, -4, 3, 3, 'white', 2);
  return v;
}
function pelvis(o) {
  if (o.top === 'rumah') { const v = plaid(skirtPelvis('sarungA', 'sarungAS', 22)); for (let z = 31; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 32 ? 'sarungAS' : 'sarungA', 3); for (let z = 34; z <= 35; z++) v.shell(z, -6, -8, 5, 7, 'partai', 3); return v; }
  const c = legC(o), v = new Vox();
  v.rbox(-5, -7, 28, 4, 6, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'bunga') for (let z = 29; z <= 33; z++) v.shell(z, -7, -9, 6, 8, z === 29 ? 'bungaK' : 'bungaA', 3);
  else if (o.top === 'rumah') { for (let z = 30; z <= 33; z++) v.shell(z, -5, -7, 4, 6, 'partai', 3); }
  else if (o.top === 'mural') { v.pfBox(-1, 30, 0, 31, 'overallS'); }
  else { v.rbox(-5, -7, 32, 4, 6, 33, 'belt', 3); v.pfBox(-1, 32, 0, 33, 'buckle'); }
  if (c === 'overall') v.each((x, y, z, cc) => { if (cc === c && rnd(x, y, z) % 23 === 0) v.set(x, y, z, ['catK', 'catB', 'catM'][rnd(z, x, y) % 3]); });
  if (c === 'sarungA') v.each((x, y, z, cc) => { if (cc === 'sarungA' && (z % 5 === 0 || (y + 40) % 4 === 0)) v.set(x, y, z, 'sarungAS'); });
  return v;
}
const legC = o => ({ mural: 'overall', geng: 'jeans', bunga: 'anKulot', rumah: 'sarungA' }[o.top] || 'pants');
const sleeveC = o => ({ geng: 'kausA', bunga: 'bungaA', rumah: 'partai', mural: 'white' }[o.top] || 'white');
function arm(o) {
  const v = new Vox(), c = sleeveC(o), B = o.top === 'bunga';
  v.rbox(-3, 7, 43, 2, 12, 55, 'anSkin', 2); v.rrect(56, -3, 7, 2, 12, c, 2);
  v.paint(-3, 7, 48, 2, 12, 56, c); v.shell(48, -4, 7, 3, 13, o.top === 'kemeja' ? 'whiteS' : c, 2);   // lengan pendek / digulung
  if (B) { v.rbox(-4, 7, 46, 3, 13, 56, 'bungaA', 2); v.each((x, y, z, cc) => { if (cc === 'bungaA' && rnd(x, y, z) % 10 === 0) v.set(x, y, z, 'bungaK'); }); }
  for (const [x, z] of [[2, 45], [2, 46], [2, 44], [1, 46]]) v.set(x, 12, z, 'tato');   // tato spidol di lengan atas
  return v;
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-3, 7, 31, 2, 12, 42, 'anSkin', 2);
  v.rbox(-3, 7, 27, 3, 12, 30, 'anSkin', 2); v.rrect(26, -2, 8, 2, 11, 'anSkin', 2);
  if (o.top === 'mural' && side > 0) for (const [x, y, z] of [[3, 8, 28], [3, 10, 29], [2, 11, 30], [1, 12, 33], [0, 12, 36], [3, 9, 26], [2, 12, 39]]) v.set(x, y, z, (x + z) % 2 ? 'catK' : 'catB');   // tangan kena cat
  else if (o.top === 'mural') for (const [x, y, z] of [[3, 8, 29], [2, 12, 34], [1, 12, 37]]) v.set(x, y, z, 'catK');
  for (const [x, z] of [[2, 38], [2, 37], [1, 38], [2, 36]]) v.set(x, 12, z, 'tato');
  return v;
}
function thigh(o) {
  if (o.top === 'rumah') return plaid(skirtThigh('sarungA'));
  const c = legC(o), v = new Vox(), W = c === 'anKulot' || c === 'sarungA';
  v.rbox(-4, 2, 18, 3, 7, 31, c, 3); v.rrect(32, -3, 2, 2, 7, c, 3);
  if (W) v.rbox(-5, 1, 18, 4, 8, 28, c, 3);
  if (c === 'sarungA') v.each((x, y, z, cc) => { if (cc === 'sarungA' && (z % 5 === 0 || (y + 40) % 4 === 0)) v.set(x, y, z, 'sarungAS'); });
  if (c === 'overall') v.each((x, y, z, cc) => { if (cc === c && rnd(x, y, z) % 19 === 0) v.set(x, y, z, ['catK', 'catB', 'catM'][rnd(z, x, y) % 3]); });
  return v;
}
function shin(o) {
  if (o.top === 'rumah') return plaid(skirtShin('sarungA', 'sarungAS'));
  const c = legC(o), v = new Vox(), W = c === 'anKulot' || c === 'sarungA';
  v.rbox(-4, 2, 6, 3, 7, 18, c, 3); v.rrect(19, -3, 2, 2, 7, c, 3);
  if (W) v.rbox(-5, 1, 6, 4, 8, 18, c, 3);
  if (c === 'anKulot') v.paint(-5, 1, 6, 4, 8, 7, 'kausA');
  if (c === 'sarungA') v.each((x, y, z, cc) => { if (cc === 'sarungA' && (z % 5 === 0 || (y + 40) % 4 === 0)) v.set(x, y, z, 'sarungAS'); });
  if (o.top === 'kemeja' || o.top === 'geng') v.rbox(-4, 2, 5, 3, 7, 9, 'bootsA', 3);   // leher boots
  if (c === 'overall') v.each((x, y, z, cc) => { if (cc === c && rnd(x, y, z) % 19 === 0) v.set(x, y, z, ['catK', 'catB', 'catM'][rnd(z, x, y) % 3]); });
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'bunga' || o.top === 'rumah') {   // sandal gunung
    v.rbox(-4, 1, 0, 7, 8, 1, 'kausA', 2); v.rbox(-3, 2, 2, 6, 7, 3, 'anSkin', 2); v.rbox(-3, 2, 4, 2, 7, 5, 'anSkin', 2);
    for (const x of [-2, 2, 5]) v.paint(x, 1, 2, x, 8, 3, 'kausA'); v.paint(-3, 1, 4, -3, 8, 5, 'kausA');
    return v;
  }
  if (o.top === 'mural') { v.rbox(-4, 1, 0, 7, 8, 1, 'sole', 2); v.rbox(-4, 1, 2, 7, 8, 3, 'beton', 2); v.rbox(-3, 1, 4, 2, 8, 5, 'beton', 2); v.set(6, 3, 2, 'catK'); v.set(4, 6, 3, 'catB'); return v; }
  v.rbox(-5, 1, 0, 7, 8, 1, 'belt', 3); v.rbox(-5, 1, 2, 7, 8, 4, 'bootsA', 3); v.rbox(-5, 1, 5, 2, 8, 7, 'bootsA', 3);   // boots kerja
  for (const x of [1, 3, 5]) v.paint(x, 3, 4, x, 6, 4, 'belt');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam STM lengan digulung + celana abu + boots', top: 'kemeja' },
  mural: { name: 'Melukis mural: kaus penuh cat + overall + masker + topi terbalik', top: 'mural', cap: true, mask: true },
  geng: { name: 'Serigala Besi: rompi jeans patch serigala + kaus hitam', top: 'geng' },
  jalan: { name: 'Kemeja bunga oversize + kulot hitam + sandal gunung', top: 'bunga' },
  rumah: { name: 'Sarung + kaus partai bekas', top: 'rumah' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o);
  const sar = o.top === 'rumah', panel = sg => sar ? plaid(skirtPanel('sarungA', 'sarungAS', sg, 5)) : null;
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'anSkin', shoulder: sl, elbow: 'anSkin', hip: leg, knee: leg }, SKEL, TAIL);
  if (sar) P.skirt = skirtInfo(P, 'sarungA', 'sarungAS');
  return P;
}
