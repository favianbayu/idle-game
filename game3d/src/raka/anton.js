// Mr. Anton: guru Bahasa Inggris muda pembina klub debat, 28 tahun, gaul dan ramah. Rambut quiff modern bertekstur dengan
// samping tipis, kemeja slim biru muda lengan digulung, chino abu, sneakers putih, jam pintar, senyum lebar.
// Rangka keluarga Arga (skala 1.34), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  anKemP: ['#c8ccd0', '#dce0e4', '#eceef2', '#fafbfc'], anKemPS: ['#a8b0b8'], anKaus: ['#4a5a4a', '#586a58', '#687c68', '#7c927c'],
  anSkin2: ['#b88460', '#cc9670', '#d9a27a', '#e6b28a'], anSkin2S: ['#c48e68'],
  anHair2: ['#140c08', '#1c120c', '#241810', '#322216'], anHair2T: ['#4a3626'], anFade: ['#4a3a30', '#544238', '#5e4a40', '#6a564a'],
  kemA: ['#6c96c4', '#82aad4', '#98bee2', '#b0d0ee'], kemAS: ['#5480b0'], chinoA: ['#5a5c62', '#686a72', '#787a82', '#8a8c94'],
  sneakA: ['#e8e8ea', '#f2f2f4', '#fafafa', '#ffffff'], sneakAS: ['#1a2a4a'], watchA: ['#1a1a20'], watchAS: ['#5ad0f0'],
  blazerA: ['#1a2440', '#222e52', '#2a3a64', '#38497a'], blazerAS: ['#121a30'], teeA: ['#e8e8e4', '#f2f2ee', '#fafaf6', '#ffffff'],
  denimA: ['#3a5a8a', '#46689c', '#5276ae', '#6488c0'], denimAS: ['#2a4470'], teeAH: ['#141418', '#1c1c20', '#26262a', '#343438'],
});

/* ---------- wajah: alis tebal rapi, mata cerah, senyum lebar ramah tepat di bawah hidung, lesung pipi */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'anSkin2S' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mata z 9..8, mulut z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['...m......m...', '....mmmmmm....', F0]),
  kedip: F(BROW, ['..KKK.........', '..WKK....KKK..'], ['...m......m...', '....mmmmmm....', F0]),   // mengedip sebelah
  marah: F('...BBB..BBB...', EYE, ['....mmmmmm....', F0, F0]),
  teriak: F('...BBB..BBB...', EYE, ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['s..mTTTTTTm..s', '....mmmmmm....', F0]),   // "Good morning!"
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['s..mTTTTTTm..s', '....mttttm....', '.....mmmm.....']),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const topZ = (v, x, y) => { for (let z = 30; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-5, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'anSkin2', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'anSkin2'); v.set(7, -1, 5, 'anSkin2S');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'anSkin2'); v.box(-1, y, 6, -1, y, 7, 'anSkin2S'); }
  // samping tipis (fade gelap), atas quiff: tinggi di depan, menurun ke belakang, ujung depan sedikit terangkat
  const side = new Vox();
  for (let z = 5; z <= 14; z++) side.rrect(z, -8, -8, 7, 7, 'anFade', 4);
  side.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 5)) v.set(x, y, z, c); });
  for (let x = -8; x <= 8; x++) {
    const hTop = x >= 4 ? 21 : x >= 0 ? 20 : x >= -4 ? 18 : 16;
    for (let y = -6; y <= 5; y++) { const ey = Math.abs(y + 0.5) > 4.5 ? 1 : 0; for (let z = 13; z <= hTop - ey; z++) if (!v.has(x, y, z) || v.get(x, y, z) === 'anFade') v.set(x, y, z, 'anHair2'); }
  }
  for (const y of [-4, -1, 2, 4]) for (let x = -7; x <= 8; x++) { const z = topZ(v, x, y); if (z !== null && (x + y + 40) % 3 === 0) v.set(x, y, z, 'anHair2T'); }   // tekstur
  for (let y = -5; y <= 4; y++) v.set(9, y, 20, 'anHair2');   // ujung quiff maju
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
const bodyC = o => ({ kemeja: 'kemA', debat: 'blazerA', denim: 'denimA' }[o.top]);
function chest(o) {
  const v = new Vox(), T = o.top, body = bodyC(o);
  for (let z = 34; z <= 56; z++) { const w = z <= 40 ? 1 : z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -8 + w + t, 4 - t, 7 - w - t, body, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'anSkin2', 2);
  if (T === 'kemeja') {   // kemeja slim dimasukkan, kancing atas terbuka, kerah tajam
    for (let z = 34; z <= 53; z++) v.pf(0, z, 'kemAS');
    for (const [y, z] of [[-1, 56], [0, 56], [-1, 55], [0, 55], [-1, 54], [0, 54], [-2, 56], [1, 56]]) v.pf(y, z, 'anSkin2');
    for (let z = 57; z <= 58; z++) { v.shell(z, -4, -5, 3, 4, 'kemA', 2); for (let y = -2; y <= 1; y++) for (const x of [3, 4]) if (v.get(x, y, z) === 'kemA') v.set(x, y, z, null); }
    for (let y = 2; y <= 5; y++) v.pf(y, 50, 'kemAS');
    return v;
  }
  // blazer biru tua / jaket denim terbuka di atas kaus (putih / hitam)
  const inner = T === 'debat' ? 'teeA' : 'teeAH', edge = T === 'debat' ? 'blazerAS' : 'denimAS';
  for (let z = 34; z <= 56; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x !== null) { v.set(x, y, z, null); v.set(x - 1, y, z, inner); } }
  for (let z = 34; z <= 55; z++) { v.pf(-4, z, edge); v.pf(3, z, edge); }
  for (let z = 57; z <= 58; z++) v.shell(z, -4, -5, 3, 4, body, 2);
  for (let y = -2; y <= 1; y++) for (const x of [3, 4]) for (const z of [57, 58]) if (v.get(x, y, z) === body) v.set(x, y, z, null);
  if (T === 'denim') { for (const y of [-7, -5, 4, 6]) for (let z = 46; z <= 50; z++) v.pf(y, z, 'denimAS'); for (let y = -8; y <= 7; y++) v.pb(y, 48, 'denimAS'); v.pf(-6, 51, 'buckle'); v.pf(5, 51, 'buckle'); }
  else { for (let y = -7; y <= -4; y++) v.pf(y, 49, 'blazerAS'); v.pf(-6, 50, 'teeA'); }   // saku dada + saputangan
  return v;
}
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-5, -7, 28, 4, 6, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'kemeja') { v.rbox(-5, -7, 32, 4, 6, 33, 'leather', 3); v.pfBox(-1, 32, 0, 33, 'buckle'); }
  else if (o.top === 'debat') for (let z = 30; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'blazerA', 3);
  else for (let z = 31; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 31 ? 'denimAS' : 'denimA', 3);
  return v;
}
const legC = o => o.top === 'denim' ? 'jeans' : 'chinoA';
const sleeveC = o => bodyC(o);
function arm(o) { const v = new Vox(), c = sleeveC(o); v.rbox(-3, 7, 43, 2, 12, 55, c, 2); v.rrect(56, -3, 7, 2, 12, c, 3); return v; }
function fore(o, side) {
  const v = new Vox(), c = sleeveC(o), K = o.top === 'kemeja';
  v.rbox(-3, 7, 31, 2, 12, 42, K ? 'anSkin2' : c, 2);
  if (K) { v.rbox(-4, 6, 37, 3, 13, 42, 'kemA', 2); v.paint(-4, 6, 37, 3, 13, 37, 'kemAS'); }   // lengan digulung sampai bawah siku
  else v.paint(-3, 7, 31, 2, 12, 32, o.top === 'debat' ? 'blazerAS' : 'denimAS');
  v.rbox(-3, 7, 27, 3, 12, 30, 'anSkin2', 2); v.rrect(26, -2, 8, 2, 11, 'anSkin2', 2);
  if (side < 0) { v.paint(-3, 7, 31, 2, 12, 32, 'watchA'); v.set(3, 9, 32, 'watchAS'); v.set(3, 10, 32, 'watchAS'); }   // jam pintar
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-4, 2, 18, 3, 7, 31, c, 3); v.rrect(32, -3, 2, 2, 7, c, 3); return v; }
function shin(o) {   // celana slim, ujung digulung di atas mata kaki
  const c = legC(o), v = new Vox(); v.rbox(-4, 2, 8, 3, 7, 18, c, 3); v.rrect(19, -3, 2, 2, 7, c, 3);
  v.shell(8, -5, 1, 4, 8, c, 3); v.rbox(-3, 3, 6, 2, 6, 7, 'anSkin2', 2);
  return v;
}
function foot() {   // sneakers putih minimalis, aksen biru tua di tumit
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 1, 'sole', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'sneakA', 3); v.rbox(-4, 1, 5, 2, 8, 5, 'sneakA', 3);
  v.paint(-4, 1, 2, -4, 8, 5, 'sneakAS');
  for (const x of [2, 4]) v.paint(x, 3, 4, x, 6, 4, 'lace');
  return v;
}

export const OUTFITS = {
  kemeja: { name: 'Mengajar: kemeja slim biru muda digulung + chino abu + sneakers putih', top: 'kemeja' },
  debat: { name: 'Klub debat: blazer biru tua + kaus putih + chino', top: 'debat' },
  denim: { name: 'Akhir pekan: jaket denim + kaus hitam + jeans', top: 'denim' },
};
OUTFITS.kerja = { ...OUTFITS.kemeja, name: 'Kerja: kemeja slim putih digulung + chino + sneakers',
  sw: { kemA: 'anKemP', kemAS: 'anKemPS' } };
OUTFITS.rumah = { ...OUTFITS.denim, name: 'Rumah: kaus hijau lumut + jeans',
  sw: { denimA: 'anKaus', denimAS: 'anKaus', teeAH: 'anKaus' } };
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  // game memanggil 'seragam': Mr. Anton memakai kemeja
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.kemeja), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'anSkin2', shoulder: sl, elbow: o.top === 'kemeja' ? 'kemA' : sl, hip: leg, knee: leg }, SKEL, TAIL);
}
