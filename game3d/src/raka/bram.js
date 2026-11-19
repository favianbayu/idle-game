// Bram (Bramantyo Megantara): rival utama, anak orang kaya, ketua geng "anak elite". Tinggi tegap (skala 1.38),
// rambut klimis disisir ke belakang dengan satu helai jatuh di dahi, mata tajam meremehkan, seragam dipermak pas
// & dimasukkan rapi, kancing atas terbuka, jam tangan perak, sepatu kulit cokelat. Voxel halus 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';
import { catZ, jas, lengan, semua } from './props.js';

export const SKEL = { ank: 4.5, shin: 15, thigh: 15.5, up: 4, neck: 24, shY: 10, shZ: 17, upper: 11, fore: 11.5, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  bJersey: ['#0b0a0e', '#141318', '#1c1c22', '#2c2c35'], bEmas: ['#b8902e', '#d4aa40', '#e8c25a', '#f4d87e'], bJas: ['#0c0c10', '#15151a', '#1e1e25', '#2c2c36'], bJasS: ['#2e2e38'],
  mSkin: ['#b8835f', '#cf9b78', '#e2b392', '#eec3a2'], mSkinS: ['#cf9b78'],
  mHair: ['#07050a', '#0e0a0d', '#171115', '#241b20'], mHairT: ['#1c1a22', '#26242e', '#33313d', '#45434f'],
  mPants: ['#121116', '#1b1a20', '#25242b', '#36353e'], leather: ['#3a1a10', '#4f2416', '#6a311f', '#8a4630'],
  watch: ['#7f838c', '#a0a4ad', '#c8ccd4', '#eef0f4'], wine: ['#4f1019', '#661520', '#7a1f2b', '#9a3341'],
  bomber: ['#0b0a0e', '#141318', '#1c1c22', '#2c2c35'], shades: ['#0b0b10'], shadesL: ['#3a4a66'],
  mTee: ['#0b0a0e', '#141318', '#1c1c22', '#2c2c35'], mTrack: ['#3c3f48', '#4e525c', '#646873', '#7e828d'],
});

/* ---------- wajah: mata sipit tajam (kelopak berat), alis menukik, senyum miring meremehkan */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'mSkinS', G: 'shades', g: 'shadesL' };
const F0 = '..............';
const F = (brow, eyes, mid, mouth) => [F0, F0, F0, ...brow, ...eyes, ...mid, ...mouth, F0, F0];
const MID = ['..............', '..............'];
export const FACES = {
  biasa: F(['..............', '.BBB......BBB.', '....B....B....'], ['.KKKK....KKKK.', '..WKK....KKW..'], MID, ['..........m...', '.....mmmmm....']),
  kedip: F(['..............', '.BBB......BBB.', '....B....B....'], ['..............', '.KKKK....KKKK.'], MID, ['..........m...', '.....mmmmm....']),
  marah: F(['.BB........BB.', '...BB....BB...', '.....B..B.....'], ['.KKKK....KKKK.', '..WKK....KKW..'], MID, ['..............', '....mmmmmm....']),
  teriak: F(['.BB........BB.', '...BB....BB...', '.....B..B.....'], ['.KKKK....KKKK.', '..WKK....KKW..'], ['..............', '....mmmmmm....'], ['....mTTTTm....', '.....mmmm.....']),
  nyengir: F(['..........BBB.', '.BBB.....B....', '....B.........'], ['.KKKK....KKKK.', '..WKK....KKW..'], MID, ['.........mm...', '....mTTTTm....']),
  ketawa: F(['.BBB......BBB.', '....B....B....', '..............'], ['..............', '.KKKK....KKKK.'], MID, ['....mTTTTm....', '.....mttm.....']),
  sakit: F(['...BB....BB...', '.BB........BB.', '..............'], ['.KK........KK.', '...KK....KK...'], MID, ['....mmmmmm....', '....TTTTTT....']),
};
export const EXPRS = Object.keys(FACES);
const SHADES = ['GGGGGGGGGGGGGG', '.GggG....GggG.', '..GGG....GGG..'];   // kacamata hitam (baris alis bawah + mata)

// muka V: rahang meruncing ke dagu
const skull = z => z <= 0 ? [-2, -3, 5, 2, 2] : z === 1 ? [-4, -4, 6, 3, 3] : z === 2 ? [-5, -5, 6, 4, 3] : z === 3 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'mSkin', r); }
  const map = (o.face || FACES[o.expr] || FACES.biasa).slice();
  if (o.shades) { map[5] = SHADES[0]; map[6] = SHADES[1]; map[7] = SHADES[2]; }
  paintFace(v, map, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 7, 'mSkin'); v.set(7, -1, 4, 'mSkin');                 // hidung mancung
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'mSkin'); v.box(-1, y, 6, -1, y, 7, 'mSkinS'); }
  if (o.shades) for (const y of [-8, 7]) for (let x = -1; x <= 6; x++) v.set(x, y, 9, 'shades');   // gagang kacamata
  // rambut klimis: disisir ke belakang, belahan di kiri, jambul rendah di depan, satu helai jatuh ke dahi
  const zmin = (x, y) => x >= 5 ? 12 : x >= -2 ? (Math.abs(y + 0.5) > 6.5 ? 9 : 0) : x >= -5 ? 7 : 4;
  const hair = new Vox();
  for (let z = 4; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'mHair', z <= 11 ? 4 : 5);
  for (let z = 16; z <= 17; z++) hair.rrect(z, -6 + (z - 16), -6, 7 - (z - 16) * 2, 5, 'mHair', 4);
  hair.rrect(18, 0, -4, 5, 4, 'mHair', 2);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  // belahan rambut + kilau minyak rambut (garis sisir memanjang ke belakang)
  for (let x = -6; x <= 7; x++) { const z = topZ(v, x, -3); if (z !== null) v.set(x, -3, z, 'mHair'); }
  for (const y of [0, 3]) for (let x = -4; x <= 5; x++) { const z = topZ(v, x, y); if (z !== null && (x + y) % 4 !== 0) v.set(x, y, z, 'mHairT'); }
  // satu helai jatuh di dahi
  for (const [y, z] of [[1, 13], [1, 12], [2, 11], [2, 10]]) v.set(7, y, z, 'mHair');
  v.set(8, 1, 13, 'mHair');
  return v;
}
const topZ = (v, x, y) => { for (let z = 22; z >= 0; z--) if (v.has(x, y, z)) return z; return null; };

function chest(o) {
  const v = new Vox(), B = o.top === 'bomber', T = o.top === 'kaus', body = B ? 'bomber' : T ? 'mTee' : 'white';
  // dada bidang, pinggang ramping (bentuk V)
  for (let z = 37; z <= 58; z++) {
    const w = z <= 42 ? 1 : z <= 46 ? 0 : -1, t = z === 58 ? 1 : 0;
    v.rrect(z, -5, -7 + w + t, 5 - t, 6 - w - t, body, z >= 57 ? 4 : 3);
  }
  v.rbox(-3, -3, 59, 2, 2, 63, 'mSkin', 2);
  if (T) { for (let y = -2; y <= 1; y++) v.pf(y, 58, 'mSkin'); v.shell(59, -3, -4, 3, 3, 'mTee', 2); return v; }
  if (B) {   // jaket bomber hitam, ritsleting perak, kerah rib merah anggur, bordir di dada & punggung
    for (let z = 37; z <= 56; z++) { v.pf(-1, z, 'watch'); }
    for (let z = 59; z <= 60; z++) v.shell(z, -4, -5, 4, 4, 'wine', 2);
    for (let z = 37; z <= 38; z++) for (let y = -8; y <= 7; y++) { v.pf(y, z, 'wine'); v.pb(y, z, 'wine'); }
    for (const s of [-1, 1]) v.psBox(s, -5, 37, 5, 38, 'wine');
    v.pfBox(2, 51, 4, 53, 'wine');
    ['.WWWWWW.', 'WW.WW.WW', 'WWWWWWWW', '..WWWW..', '.W.WW.W.', 'W......W'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pb(c - 4, 53 - r, 'wine'); }));   // bordir kepala serigala
    return v;
  }
  // kemeja permak pas, dimasukkan; kancing atas terbuka (kulit berbentuk V), garis kancing, saku, badge OSIS
  for (const [y, z] of [[-1, 57], [0, 57], [-2, 57], [1, 57], [-1, 56], [0, 56], [-1, 55], [0, 55], [-1, 54], [0, 54]]) v.pf(y, z, 'mSkin');
  for (let z = 37; z <= 53; z++) { v.pf(0, z, 'whiteS'); }
  for (let y = 3; y <= 6; y++) v.pf(y, 52, 'whiteS');
  v.pfBox(4, 48, 5, 50, 'osis'); v.pfBox(-6, 52, -4, 52, 'tag');
  for (let z = 59; z <= 60; z++) { v.shell(z, -4, -5, 3, 4, 'white', 2); for (let y = -2; y <= 1; y++) for (const x of [3, 4]) if (v.get(x, y, z) === 'white') v.set(x, y, z, null); }
  for (const [y0, y1] of [[-5, -3], [2, 4]]) v.fillE(4, y0, 57, 5, y1, 58, 'white');   // kerah tajam
  for (let y = -7; y <= 6; y++) v.pb(y, 54, 'whiteS');
  return v;
}
function pelvis(o) {
  const v = new Vox(), T = o.top === 'kaus', c = T ? 'mTrack' : 'mPants';
  v.rbox(-5, -7, 30, 4, 6, 36, c, 3); v.box(-4, -2, 28, 3, 1, 29, c);
  if (T) { for (let z = 35; z <= 36; z++) v.shell(z, -6, -8, 5, 7, 'mTee', 3); return v; }
  if (o.top === 'bomber') { for (let z = 34; z <= 36; z++) v.shell(z, -6, -8, 5, 7, 'wine', 3); return v; }
  v.rbox(-5, -7, 34, 4, 6, 36, 'leather', 3); v.pfBox(-2, 34, 1, 36, 'watch'); v.pfBox(-1, 35, 0, 35, 'leather');   // ikat pinggang kulit, gesper perak
  return v;
}
function arm(o) {
  const v = new Vox(), B = o.top === 'bomber', T = o.top === 'kaus', c = B ? 'bomber' : T ? 'mTee' : 'white';
  v.rbox(-3, 7, 46, 2, 12, 58, 'mSkin', 2); v.rrect(59, -3, 7, 2, 12, 'mSkin', 3);
  v.paint(-3, 7, B ? 46 : 51, 2, 12, 59, c);
  if (!B) v.shell(51, -3, 7, 3, 13, c, 2);
  return v;
}
function fore(o, side) {
  const v = new Vox(), B = o.top === 'bomber';
  v.rbox(-3, 7, 35, 2, 12, 46, B ? 'bomber' : 'mSkin', 2);
  v.rbox(-3, 7, 30, 3, 12, 34, 'mSkin', 2); v.rrect(29, -2, 8, 2, 11, 'mSkin', 2);
  if (B) v.paint(-3, 7, 35, 2, 12, 36, 'wine');
  else if (side < 0) { v.paint(-3, 7, 35, 2, 12, 36, 'watch'); v.pf(10, 36, 'shadesL'); }   // jam tangan perak
  return v;
}
function thigh(o) { const c = o.top === 'kaus' ? 'mTrack' : 'mPants', v = new Vox(); v.rbox(-4, 1, 20, 3, 7, 34, c, 3); v.rrect(35, -3, 2, 2, 6, c, 2); if (o.top === 'kaus') for (let z = 20; z <= 35; z++) v.set(0, 7, z, 'trackS'); return v; }
function shin(o) { const c = o.top === 'kaus' ? 'mTrack' : 'mPants', v = new Vox(); v.rbox(-4, 1, 7, 3, 7, 20, c, 3); v.rrect(21, -3, 2, 2, 6, c, 2); if (o.top === 'kaus') for (let z = 7; z <= 20; z++) v.set(0, 7, z, 'trackS'); return v; }
function foot(o) {
  const v = new Vox();
  if (o.top === 'kaus') {   // sneakers hitam limited edition, sol putih
    v.rbox(-5, 1, 0, 8, 7, 1, 'sole', 3); v.rbox(-5, 1, 2, 8, 7, 4, 'bomber', 3); v.rbox(-5, 1, 5, 2, 7, 7, 'bomber', 3);
    for (const y of [1, 7]) v.paint(-2, y, 3, 4, y, 3, 'wine');
    return v;
  }
  // sepatu kulit cokelat, ujung runcing mengilap
  v.rbox(-5, 1, 0, 8, 7, 0, 'leather', 3);
  v.rbox(-5, 1, 1, 8, 7, 3, 'leather', 3); v.rbox(-5, 1, 4, 2, 7, 6, 'mPants', 3);
  v.paint(8, 3, 2, 8, 5, 3, 'watch');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam permak, dimasukkan', top: 'kemeja' },
  geng: { name: 'Bomber geng + kacamata hitam', top: 'bomber', shades: true },
  rumah: { name: 'Kaus hitam + training', top: 'kaus' },
};
const NOMOR = [[0, 0], [1, 0], [2, 0], [3, 0], [3, -1], [2, -2], [2, -3], [1, -4], [1, -5]];   // angka 7
OUTFITS.basket = { ...OUTFITS.rumah, name: 'Basket: jersey hitam pribadi, sepatu limited edition',
  sw: { mTrack: 'mTee' },
  fx: { chest: v => { for (const [dy, dz] of NOMOR) v.pf(dy - 2, 52 + dz, 'bEmas'); for (const y of [-8, 7]) for (let z = 37; z <= 56; z++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'bEmas'); } return v; },
        armR: v => semua(v, 'mSkin'), armL: v => semua(v, 'mSkin'),
        shinR: v => catZ(v, 'mSkin', -99, 17), shinL: v => catZ(v, 'mSkin', -99, 17) },
  ball: { shoulder: 'mSkin', knee: 'mSkin' } };
OUTFITS.resmi = { ...OUTFITS.seragam, name: 'Resmi: jas hitam setelan',
  fx: { chest: v => jas(v, 'bJas', 37, 58, 47, 'bJasS'), armR: v => semua(v, 'bJas'), armL: v => semua(v, 'bJas'),
        foreR: v => lengan(v, 'bJas', 35, 'white'), foreL: v => lengan(v, 'bJas', 35, 'white'), pelvis: v => semua(v, 'bJas', ['leather']) },
  ball: { shoulder: 'bJas', elbow: 'bJas' } };
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), top = o.top === 'bomber' ? 'bomber' : o.top === 'kaus' ? 'mTee' : 'white';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'mSkin', shoulder: top === 'white' ? 'white' : top, elbow: o.top === 'bomber' ? 'bomber' : 'mSkin', hip: o.top === 'kaus' ? 'mTrack' : 'mPants', knee: o.top === 'kaus' ? 'mTrack' : 'mPants' }, SKEL, TAIL);
}
