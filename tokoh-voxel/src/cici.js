// Cici: sepupu pemain, anak Om Darto, 8 tahun. Rambut dikuncir dua tinggi dengan ikat rambut stroberi, gigi depan ompong,
// pipi bulat, cerewet ("Kak! Kak!"). Seragam SD merah putih, atau kaus kartun + rok tutu.
// Rangka anak (skala lama 0.98): kepala tetap ukuran tokoh lain (gaya chibi), badan & kaki jauh lebih pendek. Voxel 1/64.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace, skullLayer } from './model.js';

// rangka anak: pinggul z 20, dada z 23, bahu z 34, kepala z 39
export const SKEL = { ank: 3.5, shin: 8, thigh: 8.5, up: 3, neck: 16, shY: 6.5, shZ: 11, upper: 7, fore: 6.5, hipY: 3, flap: 4.5, ballR: 0.7 };
const PV = pivots(SKEL);
const TAIL = [-7, 0, 6];

addRamps({
  ciSkin: ['#b47e58', '#c8926a', '#d9a27a', '#e6b48e'], ciSkinS: ['#c48c66'], ciBlush: ['#ec9a8a'],
  ciHair: ['#120c08', '#1c140e', '#24160e', '#342418'], ciHairT: ['#44301e'],
  stroberi: ['#d8344a'], stroberiD: ['#5aa040'], merahSD: ['#8e1c22', '#a8242a', '#c22a2a', '#d84444'], merahSDS: ['#7a161c'],
  kausC: ['#e078a0', '#ec8eb0', '#f6a8c4', '#fcc2d6'], kucingC: ['#f4f0e8'], kucingK: ['#2a2a2a'],
  tutu: ['#e888b0', '#f2a0c2', '#fab8d2', '#ffd0e2'], tutuS: ['#e070a0'], piamaC: ['#9ac4e8', '#acd2f0', '#c0def6', '#d4eafa'], bintang: ['#f5d13a'],
  sepatuC: ['#121214', '#1a1a1e', '#26262c', '#36363e'], sandalC: ['#e85a8a'],
});

/* ---------- wajah anak: alis tipis + 1 baris jarak, mata bulat besar berbinar, pipi merah, gigi depan ompong
   (lubang gelap di tengah gigi atas), mulut tepat di bawah hidung */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'ciBlush', s: 'ciSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, ...brow, F0, ...eyes, '.rr........rr.', F0, ...mouth, F0, F0];   // 15 baris, mulut z 4
const BROW = ['..BB......BB..'];
const EYE = ['.KKKK....KKKK.', '.KWKK....KKWK.', '..KK......KK..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....mTmmTm....', '.....mmmm.....', F0]),
  kedip: F(BROW, [F0, '.KKKK....KKKK.', F0], ['....mTmmTm....', '.....mmmm.....', F0]),
  marah: F(['...BB....BB...'], EYE, ['.....mmmm.....', '....m....m....', F0]),
  teriak: F(['...BB....BB...'], EYE, ['....mmmmmm....', '....mTmmTm....', '.....mttm.....']),
  nyengir: F(BROW, EYE, ['...mTTmmTTm...', '....mmmmmm....', F0]),
  ketawa: F(BROW, [F0, '..KK......KK..', '.K..K....K..K.'], ['...mTTmmTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F(['.BB........BB.'], ['.KK........KK.', '...KK....KK...', F0], ['....mmmmmm....', '.....mmmm.....', F0]),
};
export const EXPRS = Object.keys(FACES);

const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
function head(o) {
  const v = new Vox();
  // pipi bulat anak: rahang lebar
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = z <= 0 ? [-4, -5, 5, 4, 4] : z === 1 ? [-6, -6, 6, 5, 4] : skullLayer(z); v.rrect(z, a, b, c, d, 'ciSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'ciSkin'); v.set(7, 0, 5, 'ciSkinS');
  // rambut belah tengah, poni tipis rata tinggi, dikuncir dua tinggi di atas telinga
  const hair = new Vox();
  for (let z = 4; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, 'ciHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -8, -8, 6, 7, 'ciHair', 5); hair.rrect(17, -6, -6, 4, 5, 'ciHair', 4);
  const zmin = (x, y) => x >= 5 ? (Math.abs(y + 0.5) > 5.5 ? 10 : 14) : Math.abs(y + 0.5) > 6.5 && x >= -2 ? 9 : 4;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'ciSkin'); v.box(-1, y, 6, -1, y, 7, 'ciSkinS'); }
  for (let x = -6; x <= 7; x++) { const z = (() => { for (let zz = 20; zz >= 0; zz--) if (v.has(x, -1, zz)) return zz; return null; })(); if (z !== null && z > 12) v.set(x, -1, z, 'ciHairT'); }
  for (const s of [-1, 1]) {   // kuncir: ikat stroberi di atas sisi kepala, ekor mengembang ke luar lalu jatuh
    const ys = s > 0 ? 9 : -10, yo = s > 0 ? 1 : -1;
    for (let x = -2; x <= 1; x++) for (let z = 13; z <= 16; z++) v.set(x, ys, z, (x === -2 || x === 1) && (z === 13 || z === 16) ? 'stroberiD' : 'stroberi');
    for (const [x, z] of [[-1, 17], [0, 17]]) v.set(x, ys, z, 'stroberiD');
    for (const [x, z] of [[-1, 14], [0, 15]]) v.set(x + (s > 0 ? 0 : 0), ys + yo, z, 'kaosP');   // bintik biji stroberi
    for (let k = 0; k <= 13; k++) {   // ekor kuncir
      const z = 15 - k, out = k <= 3 ? k : k <= 9 ? 3 : 3 - Math.floor((k - 9) / 2), w = k <= 2 ? 1 : 2;
      for (let x = -2; x <= 1; x++) for (let d = 0; d < w; d++) { const y = ys + yo * (1 + out + d); if (!v.has(x, y, z) && !(k > 10 && (x === -2 || x === 1))) v.set(x, y, z, rnd(x, y, z) % 7 === 0 ? 'ciHairT' : 'ciHair'); }
    }
  }
  return v;
}

/* ---------- badan anak (sisi +y; sisi -y = cermin): dada z 21..35, leher 36..38, lengan y 5..8 */
function chest(o) {
  const T = o.top, v = new Vox(), body = { sd: 'white', kartun: 'kausC', piama: 'piamaC' }[T];
  for (let z = 21; z <= 35; z++) { const t = z === 35 ? 1 : 0, b = z <= 25 ? 1 : 0; v.rrect(z, -3, -5 + t, 3 + b - t, 4 - t, body, 3); }   // perut anak sedikit membulat
  v.rbox(-2, -2, 36, 1, 1, 38, 'ciSkin', 1);
  for (let y = -2; y <= 1; y++) v.pf(y, 35, 'ciSkin');
  if (T === 'sd') {   // kemeja putih SD: kerah, garis kancing, badge
    for (let z = 21; z <= 34; z++) v.pf(0, z, 'whiteS');
    for (let z = 36; z <= 37; z++) v.shell(z, -3, -3, 2, 2, 'white', 1);
    v.pfBox(2, 30, 3, 31, 'merahSD'); v.pf(-4, 31, 'osis');
    return v;
  }
  v.shell(36, -3, -3, 2, 2, body, 1);
  if (T === 'kartun') ['K...K', 'KCCCK', 'CKCKC', 'CCrCC', '.CCC.'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pf(c - 2, 32 - r, ch === 'K' ? 'kucingK' : ch === 'r' ? 'stroberi' : 'kucingC'); }));
  if (T === 'piama') v.each((x, y, z, c) => { if (c === 'piamaC' && rnd(x, y, z) % 11 === 0) v.set(x, y, z, 'bintang'); });
  return v;
}
function pelvis(o) {
  const v = new Vox(), T = o.top;
  if (T === 'piama') { v.rbox(-3, -4, 16, 3, 3, 22, 'piamaC', 2); return v; }
  v.rbox(-3, -4, 16, 3, 3, 22, 'ciSkin', 2);
  const c = T === 'sd' ? 'merahSD' : 'tutu', cS = T === 'sd' ? 'merahSDS' : 'tutuS';
  for (let z = 14; z <= 22; z++) {   // rok pendek mengembang (rok tutu lebih mekar, berlapis)
    const f = T === 'kartun' ? (z <= 16 ? 3 : z <= 18 ? 2 : 1) : (z <= 16 ? 2 : z <= 19 ? 1 : 0);
    v.shell(z, -4 - f, -5 - f, 4 + f, 4 + f, z >= 21 ? cS : c, 3);
  }
  if (T === 'sd') for (let z = 14; z <= 20; z++) for (const y of [-4, -1, 2]) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, cS); }   // lipit
  if (T === 'kartun') v.each((x, y, z, cc) => { if (cc === 'tutu' && z % 3 === 0) v.set(x, y, z, 'tutuS'); });
  return v;
}
const sleeveC = o => ({ sd: 'white', kartun: 'kausC', piama: 'piamaC' }[o.top]);
function arm(o) {
  const v = new Vox(), c = sleeveC(o), L = o.top === 'piama';
  v.rbox(-2, 5, 28, 1, 8, 34, L ? c : 'ciSkin', 2); v.rrect(35, -2, 5, 1, 8, c, 1);
  if (!L) { v.paint(-2, 5, 31, 1, 8, 35, c); v.shell(31, -3, 5, 2, 9, c, 1); }
  return v;
}
function fore(o) {
  const v = new Vox();
  v.rbox(-2, 5, 21, 1, 8, 27, o.top === 'piama' ? 'piamaC' : 'ciSkin', 2);
  v.rbox(-2, 5, 18, 2, 8, 20, 'ciSkin', 2); v.rrect(17, -1, 6, 1, 7, 'ciSkin', 1);
  return v;
}
function thigh(o) { const c = o.top === 'piama' ? 'piamaC' : 'ciSkin', v = new Vox(); v.rbox(-2, 1, 12, 2, 4, 20, c, 2); return v; }
function shin(o) {
  const c = o.top === 'piama' ? 'piamaC' : 'ciSkin', v = new Vox();
  v.rbox(-2, 1, 4, 1, 4, 12, c, 2);
  if (o.top === 'sd') v.paint(-2, 1, 4, 1, 4, 7, 'white');   // kaus kaki putih
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'sd') { v.rbox(-3, 0, 0, 4, 5, 0, 'belt', 2); v.rbox(-3, 0, 1, 4, 5, 3, 'sepatuC', 2); v.set(4, 2, 2, 'white'); v.set(4, 3, 2, 'white'); return v; }   // sepatu hitam SD
  if (o.top === 'piama') { v.rbox(-3, 0, 0, 4, 5, 3, 'tutu', 2); v.rbox(1, 1, 3, 3, 4, 4, 'kucingC', 1); return v; }   // sandal bulu
  v.rbox(-3, 0, 0, 4, 5, 0, 'sandalC', 2); v.rbox(-2, 1, 1, 4, 4, 2, 'ciSkin', 2); v.rbox(-2, 1, 3, 1, 4, 4, 'ciSkin', 1); v.paint(1, 0, 1, 1, 5, 2, 'sandalC'); v.set(3, 2, 3, 'stroberi');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam SD merah putih + kaus kaki putih + sepatu hitam', top: 'sd' },
  main: { name: 'Main: kaus kucing + rok tutu + sandal stroberi', top: 'kartun' },
  piama: { name: 'Piama bintang + sandal bulu', top: 'piama' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.seragam), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = o.top === 'piama' ? 'piamaC' : 'ciSkin';
  return assemble([
    ['foreR', fore(o), PV.foreR], ['foreL', fore(o).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'ciSkin', shoulder: sl, elbow: o.top === 'piama' ? sl : 'ciSkin', hip: leg, knee: leg }, SKEL, TAIL);
}
