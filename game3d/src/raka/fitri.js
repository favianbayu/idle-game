// Fitri: siswi X-3 SMA 3, separuh duo gosip bareng Rina, selalu tahu kabar terbaru ("Eh, tahu nggak sih...").
// Kulit sawo matang terang, alis tebal rapi, pipi merona, berjilbab. Seragam: jilbab putih sekolah + kemeja putih lengan panjang
// + badge OSIS + rok abu panjang + sepatu hitam + HP bercasing pink di tangan. Jalan: pashmina lilac + kardigan rajut krem di
// atas kaus putih + rok plisket mocca + tas mini selempang + sneakers. Rangka keluarga Nadia, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  fiSkin: ['#b8805a', '#c89068', '#d4a076', '#e0ae84'], fiSkinS: ['#b47c56'], fiBlush: ['#e08a80'],
  fiPutih: ['#e2e4e8', '#eceef0', '#f4f6f8', '#fcfdfe'], fiPutihS: ['#c4c8d0'],
  fiAbu: ['#62666e', '#6e727a', '#7a7e86', '#868a92'], fiAbuS: ['#52565e'], fiOsis: ['#d8b048'], fiSepatu: ['#141416', '#1c1c1e', '#262628', '#303032'],
  fiHP: ['#e87aa8'], fiLayar: ['#1a1a1e'],
  fiLilac: ['#a88ac8', '#b498d2', '#c0a6dc', '#ccb4e4'], fiLilacS: ['#8a6aac'],
  fiKardigan: ['#d8c8a8', '#e0d2b4', '#e8dcc0', '#f0e6cc'], fiKardiganS: ['#bcac8a'],
  fiPlisket: ['#8a6a50', '#967658', '#a28262', '#ae8e6e'], fiPlisketS: ['#6e523c'],
  fiTas: ['#ece4d8'], fiTali: ['#c8a050'], fiKets: ['#e6e6e8', '#eeeef0', '#f6f6f8', '#ffffff'], fiSol: ['#c8c8cc'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'fiBlush', s: 'fiSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mulut z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', 'r............r', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', 'r............r', F0]),
  marah: F('..BBB....BBB..', EYE, ['....mmmmmm....', F0, F0]),
  teriak: F('.BBBB....BBBB.', ['..KKK....KKK..', '..KWK....KWK..'], ['.....mmmm.....', '.....mttm.....', '......mm......']),   // "Hah, serius?!"
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....', 'r............r']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', 'r............r']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const S_ = o => o.top === 'seragam';
const jc = o => S_(o) ? 'fiPutih' : 'fiLilac';
const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const open = (y, z) => { const dy = (y + 0.5) / 6.4, dz = (z - 5.5) / 6.9; return dy * dy + dz * dz <= 1; };
function head(o) {
  const v = new Vox(), c = jc(o);
  for (let z = 0; z <= 14; z++) { const [a, b, cc, d, r] = skull(z); v.rrect(z, a, b, cc, d, 'fiSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'fiSkin'); v.set(7, -1, 5, 'fiSkinS');
  const h = new Vox();
  for (let z = 1; z <= 14; z++) h.rrect(z, -8, -8, 7, 7, c, z <= 11 ? 4 : 5);
  h.rrect(15, -7, -7, 6, 6, c, 4); h.rrect(16, -5, -5, 4, 4, c, 3);
  for (let z = -6; z <= 0; z++) h.rrect(z, -7, -8, 7, 7, c, 4);
  h.each((x, y, z, k) => { if (v.has(x, y, z)) return; if (x >= 3 && z >= 0 && open(y, z)) return; v.set(x, y, z, k); });
  for (let z = 0; z <= 13; z++) for (let y = -9; y <= 8; y++) { const x = v.front(y, z); if (x !== null && x >= 6 && v.get(x, y, z) === c && open(y + (y < 0 ? 1 : -1), z)) v.set(x, y, z, c + 'S'); }
  if (!S_(o)) for (let z = -5; z <= 10; z++) { const y = 8, x = Math.round(2 - (10 - z) * 0.25); if (!v.has(x, y, z)) v.set(x, y, z, 'fiLilacS'); v.set(x, y + 1, z, 'fiLilac'); }   // ujung pashmina disampirkan ke bahu
  return v;
}

const topC = o => S_(o) ? 'fiPutih' : 'fiKardigan';
function chest(o) {
  const v = new Vox(), c = topC(o), j = jc(o);
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -5, -7 + t + w, 4 - t, 6 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, j, 1);
  if (S_(o)) {
    for (let z = 33; z <= 46; z++) v.pf(-1, z, 'fiPutihS');
    v.pfBox(2, 43, 4, 44, 'fiOsis');
  } else {   // kardigan terbuka di atas kaus putih
    for (let z = 32; z <= 46; z++) for (let y = -2; y <= 1; y++) v.pf(y, z, 'fiPutih');
    for (let z = 32; z <= 46; z++) { v.pf(-3, z, 'fiKardiganS'); v.pf(2, z, 'fiKardiganS'); }
    v.each((x, y, z, k) => { if (k === 'fiKardigan' && z % 3 === 0 && x >= 2) v.set(x, y, z, 'fiKardiganS'); });   // rusuk rajut
    for (let z = 33; z <= 47; z++) { const y = Math.round(-6 + (z - 33) * 10 / 14); const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'fiTali'); }   // tali tas mini
  }
  for (let z = 46; z <= 54; z++) { const k = Math.min(2, Math.floor((55 - z) / 3)); for (let y = -8 - k; y <= 7 + k; y++) for (let x = -6 - k; x <= 5 + k; x++) { if (z <= 49 && x < 1 && Math.abs(y + 0.5) < 6.5) continue; if (!v.has(x, y, z) || (z >= 48 && Math.abs(y + 0.5) < 7.5 && (x === v.front(y, z) || x === v.back(y, z)))) v.set(x, y, z, j); } }
  for (let y = -8; y <= 7; y++) { const x = v.front(y, 46); if (x !== null && v.get(x, y, 46) === j) v.set(x, y, 46, j + 'S'); }
  return v;
}
const skc = o => S_(o) ? 'fiAbu' : 'fiPlisket', sks = o => S_(o) ? 'fiAbuS' : 'fiPlisketS';
const pleat = (o, v) => { if (!S_(o)) v.each((x, y, z, c) => { if (c === 'fiPlisket' && (y + 40) % 3 === 0) v.set(x, y, z, 'fiPlisketS'); }); return v; };
function pelvis(o) {
  const v = pleat(o, skirtPelvis(skc(o), sks(o), 22));
  if (!S_(o)) { for (let z = 28; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 28 ? 'fiKardiganS' : 'fiKardigan', 3); v.rbox(1, -9, 28, 5, -7, 32, 'fiTas', 1); v.set(5, -8, 30, 'fiTali'); }
  return v;
}
function arm(o) { const v = new Vox(), c = topC(o); v.rbox(-2, 6, 40, 2, 10, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2); return v; }
function fore(o, side) {
  const v = new Vox(), c = topC(o);
  v.rbox(-2, 6, 31, 2, 10, 39, c, 2); v.paint(-2, 6, 31, 2, 10, 31, S_(o) ? 'fiPutihS' : 'fiKardiganS');
  v.rbox(-2, 6, 27, 3, 10, 30, 'fiSkin', 2); v.rrect(26, -1, 7, 2, 9, 'fiSkin', 1);
  if (side > 0) { v.box(3, 7, 24, 4, 10, 31, 'fiHP'); v.box(5, 7, 25, 5, 10, 30, 'fiLayar'); }   // HP: grup gosip
  return v;
}
function foot(o) {
  const v = new Vox();
  if (S_(o)) { v.rbox(-4, 1, 0, 6, 6, 0, 'fiAbuS', 2); v.rbox(-4, 1, 1, 6, 6, 3, 'fiSepatu', 2); v.rbox(-3, 2, 4, 1, 5, 4, 'fiSepatu', 2); return v; }
  v.rbox(-4, 1, 0, 6, 6, 1, 'fiSol', 2); v.rbox(-4, 1, 2, 6, 6, 3, 'fiKets', 2); v.rbox(-3, 1, 4, 2, 6, 5, 'fiKets', 2);
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam: jilbab putih + kemeja putih lengan panjang + badge OSIS + rok abu panjang + sepatu hitam + HP pink', top: 'seragam' },
  jalan: { name: 'Jalan: pashmina lilac + kardigan rajut krem + kaus putih + rok plisket mocca + tas mini + sneakers', top: 'jalan' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.seragam), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Ft = foot(o), sl = topC(o), c = skc(o), s = sks(o);
  const Th = pleat(o, skirtThigh(c)), Sn = pleat(o, skirtShin(c, s));
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', pleat(o, skirtPanel(c, s, 1, 5)), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', pleat(o, skirtPanel(c, s, -1, 5)), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: jc(o), shoulder: sl, elbow: sl, hip: c, knee: c }, SKEL, TAIL);
  P.skirt = skirtInfo(P, c, s);
  return P;
}
