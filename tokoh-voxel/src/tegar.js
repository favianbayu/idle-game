// Tegar Hutomo: NPC romance cowok, ketua kelas & juara umum, kaku, ditekan orang tua masuk kedokteran. Badan sedang,
// kulit putih pucat, rambut hitam lurus belah samping disisir minyak rambut (klimis mengilap), kacamata bingkai hitam
// tebal kotak, kantong mata gelap, wajah serius. Seragam disetrika tajam + dasi abu (satu-satunya yang berdasi tiap hari),
// ikat pinggang kulit, badge ketua kelas, pantofel. Skala lama 1.32, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';
import { tudung } from './props.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  tJas: ['#14306a', '#1a3c80', '#224a96', '#3060b0'], tJasS: ['#e8e070'],
  tSkin: ['#c8987a', '#dcaf8e', '#f0c4a0', '#fad6b6'], tSkinS: ['#d8a888'], tBag: ['#c49a86'],
  tHair: ['#060505', '#0c0a0a', '#141010', '#221c1c'], tHairT: ['#4a4650'], tPart: ['#000000'],
  tFrame: ['#08080a', '#0e0e12', '#16161b', '#26262e'], tLens: ['#d8e8f2'],
  tTie: ['#30343c', '#3c4149', '#4a4f57', '#5e646e'], tBelt: ['#2e1c10', '#3e2616', '#52331e', '#6a4428'], tBuckle: ['#c8ccd4'],
  tBadge: ['#2a5a9a'], tBadgeS: ['#f2c230'],
  langit: ['#5f86aa', '#7499bd', '#8fb6d9', '#acccea'], langitS: ['#6a90b4'], bahan: ['#2a2e36', '#363b44', '#454b55', '#59606b'],
  ransel: ['#1c2638', '#243048', '#2e3c58', '#3e4e70'], bukuT: ['#e8e2cc'], bukuM: ['#b8302a'], bukuH: ['#2a7a4a'],
  piama: ['#141e38', '#1a2848', '#22335a', '#2e4472'], piamaS: ['#d8dde8'], selop: ['#3a3e48', '#4a4f5a', '#5c626e', '#747a88'],
  polo: ['#5a5f68', '#6c727c', '#848a94', '#9ea4ae'], poloS: ['#4a4f57'], tChino: ['#9c8a66', '#b4a07a', '#c9b48c', '#dccaa4'],
  ketsP: ['#c8ccd2', '#e0e3e8', '#f4f6f8', '#ffffff'], pantofelT: ['#0a090c', '#121115', '#1c1b20', '#34323c'],
});

/* ---------- wajah: alis tipis lurus, 1 baris jarak ke mata (bingkai kacamata di baris itu), mata serius, kantong mata
   gelap, mulut datar tepat di bawah hidung (hidung z 5..6, mulut z 4). */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', b: 'tBag', s: 'tSkinS' };
const F0 = '..............';
const F = (brow, eyes, bag, mouth) => [F0, F0, F0, ...brow, F0, ...eyes, ...bag, F0, F0, ...mouth, F0, F0];   // 15 baris, mulut mulai z 4
const BROW = ['.BBBB....BBBB.'];
const EYE = ['.KKKK....KKKK.', '..WKK....KKW..'];
const BAG = ['.bbbb....bbbb.'];
export const FACES = {
  biasa: F(BROW, EYE, BAG, ['.....mmmm.....', F0, F0]),
  kedip: F(BROW, [F0, '.KKKK....KKKK.'], BAG, ['.....mmmm.....', F0, F0]),
  marah: F(['..BBB....BBB..'], ['.KKKK....KKKK.', '..WKK....KKW..'], BAG, ['....mmmmmm....', '....m....m....', F0]),
  teriak: F(['..BBB....BBB..'], ['.KKKK....KKKK.', '.WKKK....KKKW.'], BAG, ['....mmmmmm....', '....mTTTTm....', '.....mttm.....']),
  nyengir: F(BROW, EYE, BAG, ['...mTTTTTTm...', '....mmmmmm....', F0]),   // tawa garing "Hah. Hah. Lucu, kan?"
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], BAG, ['....mTTTTm....', '.....mttm.....', F0]),
  sakit: F(['.BB........BB.'], ['.KK........KK.', '...KK....KK...'], BAG, ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const topZ = (v, x, y) => { for (let z = 22; z >= 0; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-3, -4, 4, 3, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'tSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'tSkin'); v.set(7, -1, 5, 'tSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'tSkin'); v.box(-1, y, 6, -1, y, 7, 'tSkinS'); }
  // rambut klimis belah samping kiri (y = -4): lapis tipis rapat kepala, samping dipangkas rapi, kilau minyak rambut
  const hair = new Vox();
  for (let z = 4; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'tHair', z <= 11 ? 4 : 5);
  for (let z = 16; z <= 17; z++) hair.rrect(z, -6 + (z - 16), -7, 7 - (z - 16) * 2, 6, 'tHair', 4);
  hair.rrect(18, -1, -2, 5, 5, 'tHair', 2);   // jambul sisiran sedikit naik di sisi tebal
  const zmin = (x, y) => x >= 5 ? (y >= -4 ? 13 : 12) : x >= -2 ? (Math.abs(y + 0.5) > 6.5 ? 10 : 0) : x >= -5 ? 7 : 5;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (let x = -6; x <= 4; x++) { const z = topZ(v, x, -4); if (z !== null) v.set(x, -4, z, 'tPart'); }   // garis belahan (alur sisiran gelap; jangan warna kulit, dari atas terbaca botak)
  for (const y of [-1, 2, 5]) for (let x = -5; x <= 6; x++) { const z = topZ(v, x, y); if (z !== null && (x + y) % 5 !== 0 && v.get(x, y, z) === 'tHair') v.set(x, y, z, 'tHairT'); }   // kilau minyak
  // kacamata bingkai hitam tebal kotak: tepi 1 voxel + sisi atas 2 voxel (tebal), di depan wajah; gagang ke telinga
  const fx = v.front(-1, 8) + 1;
  for (const y0 of [-7, 1]) for (let y = y0; y <= y0 + 5; y++) for (let z = 6; z <= 10; z++) {
    if (y === y0 || y === y0 + 5 || z === 6 || z === 10) v.set(fx, y, z, 'tFrame');
    if (z === 10) v.set(fx + 1, y, z, 'tFrame');
  }
  for (const y0 of [-7, 1]) v.set(fx, y0 + 4, 9, 'tLens');
  for (const y of [-1, 0]) v.set(fx, y, 9, 'tFrame');
  for (const y of [-8, 7]) for (let x = fx - 1; x >= -1; x--) if (!v.has(x, y, 10)) v.set(x, y, 10, 'tFrame');
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function chest(o) {
  const v = new Vox(), T = o.top, L = T === 'les', P = T === 'piama', Q = T === 'polo';
  const body = L ? 'langit' : P ? 'piama' : Q ? 'polo' : 'white';
  for (let z = 34; z <= 56; z++) { const w = z <= 40 ? 0 : z <= 47 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -8 + w + t, 4 - t, 7 - w - t, body, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'tSkin', 2);
  const button = L ? 'langitS' : P ? 'piamaS' : Q ? 'poloS' : 'whiteS';
  if (Q) {   // polo abu: kerah lipat, dua kancing, garis di ujung lengan
    for (let z = 51; z <= 55; z++) v.pf(0, z, 'poloS'); v.pf(0, 54, 'tSkin'); v.pf(-1, 54, 'tSkin'); v.pf(-1, 55, 'tSkin'); v.pf(0, 55, 'tSkin');
    for (let z = 56; z <= 57; z++) v.shell(z, -4, -5, 3, 4, 'polo', 2);
    for (let y = -5; y <= 4; y++) v.pb(y, 57, 'poloS');
    return v;
  }
  // kemeja: garis kancing, garis setrika tajam di dada & punggung, kerah
  for (let z = 34; z <= 55; z++) v.pf(0, z, button);
  for (const y of [-5, 4]) for (let z = 36; z <= 52; z++) v.pb(y, z, button);
  for (let z = 56; z <= 57; z++) { v.shell(z, -3, -4, 3, 3, body, 2); for (let y = -1; y <= 0; y++) if (v.get(3, y, z) === body) v.set(3, y, z, null); }
  if (P) { for (let y = -4; y <= 3; y++) v.pf(y, 55, 'piamaS'); for (let z = 34; z <= 55; z++) { v.pf(-1, z, 'piamaS'); } v.pfBox(3, 47, 5, 49, 'piamaS'); return v; }
  if (!L) {   // dasi abu disimpul rapat sampai kerah, badge OSIS + badge ketua kelas, papan nama, saku dengan 2 pulpen sejajar
    for (let z = 38; z <= 56; z++) for (let y = -1; y <= 0; y++) v.pf(y, z, 'tTie');
    v.pf(-2, 55, 'tTie'); v.pf(1, 55, 'tTie');
    v.pfBox(3, 48, 5, 49, 'osis'); v.pfBox(3, 45, 4, 46, 'tBadge'); v.pf(4, 46, 'tBadgeS');
    v.pfBox(-6, 49, -4, 49, 'tag');
    v.pf(5, 51, 'tTie'); v.pf(6, 51, 'tBadge');
  }
  if (L) {   // ransel penuh buku: tali di bahu depan, badan tas di punggung, buku menyembul
    for (const y of [-5, 4]) for (let z = 40; z <= 56; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'ransel'); }
    for (let z = 36; z <= 54; z++) for (let y = -6; y <= 5; y++) { const x = v.back(y, z); if (x !== null) for (let d = 1; d <= 4; d++) v.set(x - d, y, z, 'ransel'); }
    for (let y = -6; y <= 5; y++) for (let x = -12; x <= -10; x++) if (v.has(x, y, 54)) for (const z of [55, 56]) v.set(x, y, z, y % 3 === 0 ? 'bukuM' : y % 3 === 1 ? 'bukuH' : 'bukuT');
    for (let y = -4; y <= 3; y++) v.set(-13, y, 44, 'langitS');
  }
  return v;
}
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-5, -7, 28, 4, 6, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'piama') for (let z = 30; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'piama', 3);   // atasan piama dikeluarkan
  else if (o.top === 'polo') for (let z = 31; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 31 ? 'poloS' : 'polo', 3);
  else { v.rbox(-5, -7, 32, 4, 6, 33, 'tBelt', 3); v.pfBox(-1, 32, 0, 33, 'tBuckle'); }
  return v;
}
const legC = o => ({ les: 'bahan', piama: 'piama', polo: 'tChino' }[o.top] || 'pants');
const sleeveC = o => ({ les: 'langit', piama: 'piama', polo: 'polo' }[o.top] || 'white');
function arm(o) {
  const v = new Vox(), c = sleeveC(o), Q = o.top === 'polo';
  v.rbox(-3, 7, 43, 2, 12, 55, Q ? 'tSkin' : c, 2); v.rrect(56, -3, 7, 2, 12, c, 2);
  if (Q) { v.paint(-3, 7, 49, 2, 12, 56, 'polo'); v.shell(48, -4, 7, 3, 13, 'poloS', 2); }
  return v;
}
function fore(o, side) {
  const v = new Vox(), c = sleeveC(o), long = o.top !== 'polo';
  v.rbox(-3, 7, 31, 2, 12, 42, long ? c : 'tSkin', 2);
  if (long) v.paint(-3, 7, 31, 2, 12, 32, o.top === 'piama' ? 'piamaS' : c === 'langit' ? 'langitS' : 'whiteS');
  v.rbox(-3, 7, 27, 3, 12, 30, 'tSkin', 2); v.rrect(26, -2, 8, 2, 11, 'tSkin', 2);
  if (side < 0 && o.top !== 'piama') v.paint(-3, 7, 33, 2, 12, 34, 'tBelt');   // jam tangan tali kulit
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-4, 2, 18, 3, 7, 31, c, 3); v.rrect(32, -3, 2, 2, 7, c, 3); return v; }
function shin(o) {
  const c = legC(o), v = new Vox(); v.rbox(-4, 2, 6, 3, 7, 18, c, 3); v.rrect(19, -3, 2, 2, 7, c, 3);
  if (o.top === 'piama') { v.paint(-4, 2, 6, 3, 7, 7, 'piamaS'); return v; }
  for (let z = 7; z <= 17; z++) v.pf(5, z, c === 'pants' ? 'pantsC' : c === 'tChino' ? 'tChino' : 'bahan');   // garis setrika tajam
  if (c === 'pants') for (let z = 7; z <= 17; z++) v.pf(4, z, 'pantsC');
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'piama') { v.rbox(-4, 1, 0, 7, 8, 1, 'selop', 2); v.rbox(-3, 2, 2, 6, 7, 3, 'tSkin', 2); v.rbox(-3, 2, 4, 2, 7, 5, 'tSkin', 2); v.paint(2, 1, 2, 5, 8, 3, 'selop'); return v; }
  if (o.top === 'polo') { v.rbox(-4, 1, 0, 7, 8, 1, 'sole', 2); v.rbox(-4, 1, 2, 7, 8, 4, 'ketsP', 2); v.rbox(-3, 1, 5, 2, 8, 6, 'ketsP', 2); for (const x of [1, 3, 5]) v.paint(x, 3, 4, x, 6, 4, 'lace'); return v; }
  v.rbox(-4, 1, 0, 7, 8, 0, 'belt', 2); v.rbox(-4, 1, 1, 7, 8, 4, 'pantofelT', 2); v.rbox(-3, 2, 5, 2, 7, 6, 'pantofelT', 2);
  v.set(7, 4, 3, 'tLens'); v.set(7, 5, 3, 'tLens');   // kilap semir
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam disetrika tajam + dasi + badge ketua kelas', top: 'kemeja' },
  les: { name: 'Les: kemeja biru langit + celana bahan + ransel buku', top: 'les' },
  rumah: { name: 'Piama setelan biru tua', top: 'piama' },
  jalan: { name: 'Polo abu + chino + kets putih bersih', top: 'polo' },
};
OUTFITS.hujan = { ...OUTFITS.les, name: 'Hujan: jas hujan atas-bawah, tas dibungkus plastik',
  sw: { langit: 'tJas', langitS: 'tJasS', bahan: 'tJas', ransel: 'prPlastik', bukuT: 'prPlastik', bukuM: 'prPlastik', bukuH: 'prPlastik' },
  fx: { head: v => tudung(v, 'tJas') } };
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'tSkin', shoulder: sl, elbow: sl === 'polo' ? 'tSkin' : sl, hip: leg, knee: leg }, SKEL, TAIL);
}
