// Rina: siswi X-3 SMA 3, separuh duo gosip bareng Fitri, heboh dan ekspresif ("Eh, tahu nggak sih...").
// Kulit kuning langsat, rambut hitam lurus panjang sampai punggung dengan poni rata + bando merah, mata bulat, bibir merah
// muda. Seragam: kemeja putih lengan pendek + badge OSIS + rok abu panjang + kaus kaki putih + sepatu hitam + bungkus
// keripik pedas. Jalan: jaket jins crop di atas kaus kuning + celana kulot hitam + sneakers + HP. Rangka keluarga Rani, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace, skullLayer } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  rySkin: ['#d0a07a', '#e0b08a', '#ecc09a', '#f6ceaa'], rySkinS: ['#cc9a74'], ryBlush: ['#ec9a90'], ryLip: ['#d0607a'],
  ryHair: ['#0c0a0a', '#141212', '#1c1a1a', '#262222'], ryHairT: ['#3a3434'], ryBando: ['#c82a3a', '#d63446', '#e24052', '#ec4e60'],
  ryPutih: ['#e2e4e8', '#eceef0', '#f4f6f8', '#fcfdfe'], ryPutihS: ['#c4c8d0'], ryOsis: ['#d8b048'],
  ryAbu: ['#62666e', '#6e727a', '#7a7e86', '#868a92'], ryAbuS: ['#52565e'], ryKaos: ['#f4f4f6'], rySepatu: ['#141416', '#1c1c1e', '#262628', '#303032'],
  ryKeripik: ['#e83a2a', '#f04a34', '#f65a40', '#fc6a4e'], ryKeripikS: ['#f4c83a'],
  ryJins: ['#4a6a9a', '#5476a6', '#5e82b2', '#6a8ebe'], ryJinsS: ['#3a5480'], ryKuning: ['#e8c43a', '#f0cc44', '#f6d450', '#fcdc5c'],
  ryKulot: ['#1c1c20', '#242428', '#2c2c30', '#36363a'], ryKets: ['#e6e6e8', '#eeeef0', '#f6f6f8', '#ffffff'], rySol: ['#c8c8cc'], ryHP: ['#2a2a2e'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'ryLip', T: 'teeth', t: 'tongue', r: 'ryBlush', s: 'rySkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, ...mouth, F0, F0];   // alis z 11 (di bawah poni), mata 9..7, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['.KKKK....KKKK.', '.WKKK....KKKW.', '..KK......KK..'];
export const FACES = {
  biasa: F(BROW, EYE, ['r....mmmm....r', F0, F0]),
  kedip: F(BROW, [F0, F0, '.KKKK....KKKK.'], ['r....mmmm....r', F0, F0]),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', '...m......m...', F0]),
  teriak: F('..BBB....BBB..', ['.KKKK....KKKK.', '.KWKK....KKWK.', '..KK......KK..'], ['....mmmmmm....', '....mttttm....', '.....mmmm.....']),   // "HAH?!"
  nyengir: F(BROW, EYE, ['r..mTTTTTTm..r', '....mmmmmm....', F0]),
  ketawa: F(BROW, [F0, '.K..K....K..K.', F0], ['r..mTTTTTTm..r', '....mttttm....', '.....mmmm.....']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...', '.KK........KK.'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const S_ = o => o.top === 'seragam';
const topZ = (v, x, y) => { for (let z = 24; z >= -30; z--) if (v.has(x, y, z)) return z; return null; };
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skullLayer(z); v.rrect(z, a, b, c, d, 'rySkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'rySkin'); v.set(7, 0, 5, 'rySkinS');
  // rambut lurus panjang: poni rata sampai atas alis, sisi jatuh lurus membingkai wajah, belakang terurai sampai punggung
  const hair = new Vox();
  for (let z = 2; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, 'ryHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -8, -8, 6, 7, 'ryHair', 5); hair.rrect(17, -6, -6, 4, 5, 'ryHair', 4);
  const zmin = (x, y) => x >= 5 ? (Math.abs(y + 0.5) > 5.5 ? 2 : 13) : x >= 2 ? (Math.abs(y + 0.5) > 6.5 ? -4 : 0) : -4;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (let y = -6; y <= 5; y++) for (let z = 12; z <= 13; z++) { const x = v.front(y, z); if (x !== null && x <= 7) v.set(x + 1, y, z, 'ryHair'); }   // poni rata
  for (let z = -22; z <= 1; z++) {
    const half = z <= -18 ? 6 - Math.floor((-18 - z) / 2) : 7;
    for (let y = -half - 1; y <= half; y++) for (let x = -9; x <= -6; x++) if (!v.has(x, y, z)) v.set(x, y, z, 'ryHair');
    if (z >= -8) for (const ys of [-9, 8]) for (let x = -5; x <= 1; x++) if (!v.has(x, ys, z)) v.set(x, ys, z, 'ryHair');
  }
  for (const y of [-3, 2]) for (let z = -16; z <= 8; z++) { const x = v.back(y, z); if (x !== null && v.get(x, y, z) === 'ryHair' && (z + 40) % 8 < 5) v.set(x, y, z, 'ryHairT'); }   // kilau lurus
  // bando merah melengkung dari telinga ke telinga, di belakang poni
  for (let y = -10; y <= 9; y++) { const z = topZ(v, 2, y); if (z !== null) { v.set(2, y, z + 1, 'ryBando'); v.set(3, y, z + 1, 'ryBando'); } }
  return v;
}

const topC = o => S_(o) ? 'ryPutih' : 'ryJins';
function chest(o) {
  const v = new Vox(), c = topC(o);
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -4, -6 + t + w, 4 - t, 5 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'rySkin', 1);
  if (S_(o)) {
    for (let z = 33; z <= 48; z++) v.pf(0, z, 'ryPutihS');
    v.pfBox(2, 43, 4, 44, 'ryOsis');
    for (const [y, z] of [[-1, 50], [0, 50], [0, 49]]) v.pf(y, z, 'rySkin');
    for (let z = 52; z <= 53; z++) { v.shell(z, -3, -4, 3, 3, 'ryPutih', 2); for (let y = -1; y <= 0; y++) for (let x = 2; x <= 3; x++) if (v.get(x, y, z) === 'ryPutih') v.set(x, y, z, null); }
  } else {   // jaket jins crop terbuka di atas kaus kuning; kaus menjulur di bawah jaket
    for (let z = 32; z <= 50; z++) for (let y = -2; y <= 1; y++) v.pf(y, z, 'ryKuning');
    for (let z = 32; z <= 37; z++) for (let y = -6; y <= 5; y++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'ryKuning'); const xb = v.back(y, z); if (xb !== null) v.set(xb, y, z, 'ryKuning'); }
    v.shell(38, -5, -7, 5, 6, 'ryJinsS', 3);
    for (let z = 39; z <= 50; z++) { v.pf(-3, z, 'ryJinsS'); v.pf(2, z, 'ryJinsS'); }
    for (let z = 51; z <= 53; z++) v.shell(z, -4, -5, 3, 4, 'ryJins', 2);
  }
  return v;
}
function pelvis(o) {
  if (S_(o)) return skirtPelvis('ryAbu', 'ryAbuS', 22);
  const v = new Vox(); v.rbox(-4, -6, 26, 4, 5, 33, 'ryKulot', 3); v.box(-3, -2, 24, 2, 1, 25, 'ryKulot');
  for (let z = 31; z <= 33; z++) v.shell(z, -5, -7, 5, 6, 'ryKuning', 3);
  return v;
}
function arm(o) {
  const v = new Vox(), c = topC(o);
  if (S_(o)) { v.rbox(-2, 6, 40, 2, 10, 50, 'rySkin', 2); v.rrect(51, -2, 6, 2, 10, c, 2); v.paint(-2, 6, 45, 2, 10, 51, c); v.shell(45, -3, 5, 3, 11, 'ryPutih', 2); }
  else { v.rbox(-3, 5, 40, 3, 11, 50, c, 2); v.rrect(51, -3, 5, 3, 11, c, 2); }
  return v;
}
function fore(o, side) {
  const v = new Vox();
  if (S_(o)) v.rbox(-2, 6, 31, 2, 10, 39, 'rySkin', 2);
  else { v.rbox(-3, 5, 31, 3, 11, 39, 'ryJins', 2); v.paint(-3, 5, 31, 3, 11, 32, 'ryJinsS'); }
  v.rbox(-2, 6, 27, 3, 10, 30, 'rySkin', 2); v.rrect(26, -1, 7, 2, 9, 'rySkin', 1);
  if (S_(o) && side > 0) {   // bungkus keripik pedas merah bergambar cabai kuning
    v.box(3, 5, 22, 5, 11, 32, 'ryKeripik'); for (let z = 25; z <= 29; z++) v.set(6, 8, z, 'ryKeripikS'); v.set(6, 9, 28, 'ryKeripikS'); v.set(6, 7, 24, 'ryKeripikS');
    v.box(3, 5, 33, 5, 11, 33, 'ryKeripikS');
  }
  if (!S_(o) && side > 0) { v.box(3, 7, 24, 4, 10, 31, 'ryHP'); }
  return v;
}
function legs(o) {
  if (S_(o)) return [skirtThigh('ryAbu'), skirtShin('ryAbu', 'ryAbuS')];
  const th = new Vox(); th.rbox(-4, 0, 17, 3, 8, 31, 'ryKulot', 3);
  const sn = new Vox(); for (let z = 5; z <= 17; z++) { const f = z <= 9 ? 1 : 0; sn.rrect(z, -4 - f, 0 - f, 3 + f, 8 + f, 'ryKulot', 3); }
  return [th, sn];
}
function foot(o) {
  const v = new Vox();
  if (S_(o)) { v.rbox(-4, 1, 0, 6, 6, 0, 'ryAbuS', 2); v.rbox(-4, 1, 1, 6, 6, 3, 'rySepatu', 2); v.rbox(-3, 2, 4, 1, 5, 6, 'ryKaos', 2); return v; }   // sepatu hitam + kaus kaki putih
  v.rbox(-4, 1, 0, 6, 6, 1, 'rySol', 2); v.rbox(-4, 1, 2, 6, 6, 3, 'ryKets', 2); v.rbox(-3, 1, 4, 2, 6, 5, 'ryKets', 2);
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam: bando merah + kemeja putih lengan pendek + badge OSIS + rok abu panjang + kaus kaki putih + sepatu hitam + keripik pedas', top: 'seragam' },
  jalan: { name: 'Jalan: jaket jins crop + kaus kuning + kulot hitam + sneakers + HP', top: 'jalan' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.seragam), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), [Th, Sn] = legs(o), Ft = foot(o), s = S_(o), leg = s ? 'ryAbu' : 'ryKulot';
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', s && skirtPanel('ryAbu', 'ryAbuS', 1, 5), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', s && skirtPanel('ryAbu', 'ryAbuS', -1, 5), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'rySkin', shoulder: topC(o), elbow: s ? 'rySkin' : 'ryJins', hip: leg, knee: leg }, SKEL, TAIL);
  if (s) P.skirt = skirtInfo(P, 'ryAbu', 'ryAbuS');
  return P;
}
