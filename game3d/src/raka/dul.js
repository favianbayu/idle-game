// Pengamen Dul: pengamen ukulele yang naik-turun angkot dan mangkal di alun-alun Pusat Kota, 20-an, kurus, santai, suaranya
// lumayan ("Satu lagu buat yang lagi kasmaran..."). Kulit sawo matang, rambut gondrong sebahu berikat bandana, jenggot tipis.
// Ngamen: bandana merah + kaus hitam bergambar matahari pudar + rompi jins penuh tambalan + ukulele + kantong permen untuk
// receh + jins robek + sandal. Nongkrong: jaket parka hijau + ukulele disandang di punggung. Rangka keluarga Arga.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  dlSkin: ['#8e5a36', '#a06842', '#b2784e', '#c2885c'], dlSkinS: ['#94603a'], dlHair: ['#14100e', '#1c1714', '#26201c', '#322a24'], dlHairT: ['#3e342c'], dlJenggot: ['#2a221c'],
  dlBandana: ['#a81c1c', '#b82424', '#c82e2e', '#d83a3a'], dlBandanaS: ['#f0e8e0'],
  dlKaus: ['#1e1e22', '#26262a', '#303034', '#3a3a40'], dlGambar: ['#c88a2a'], dlGambarS: ['#8a5a1a'],
  dlRompi: ['#4a6a8e', '#567a9c', '#6288aa', '#7096b8'], dlRompiS: ['#34506e'], dlTambal: ['#b84a2a'], dlTambal2: ['#3a8a5a'],
  dlJins: ['#3a4e6e', '#44587a', '#4e6286', '#5a6e92'], dlJinsS: ['#2a3a54'], dlSobek: ['#d8d4c8'],
  dlUkulele: ['#a8642a', '#b87234', '#c8803e', '#d8904a'], dlUkuleleS: ['#6e3a14'], dlLubang: ['#1a0e06'], dlSenar: ['#e8e4dc'], dlLeher: ['#4a2a12'],
  dlPlastik: ['#d8e4ea'], dlPermen: ['#e83a5a'], dlPermen2: ['#3aa8e8'],
  dlParka: ['#4a5a32', '#56663a', '#627244', '#6e7e4e'], dlParkaS: ['#38462a'], dlBulu: ['#c8b898'], dlTali: ['#2a2018'],
  dlSandal: ['#3a2a1e', '#44322a', '#4e3a2e', '#5a4436'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'dlSkinS', j: 'dlJenggot' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, '.....jjjj.....', F0, F0];   // alis z 11, mulut z 4, jenggot z 2
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
const EYEZ = ['..KKK....KKK..', '..KKK....KKK..'];   // mata sayu menghayati lagu
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0]),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', '...m......m...']),
  teriak: F('..BBB....BBB..', [F0, EYEZ[0]], ['....mTTTTm....', '....mttttm....']),   // nyanyi sepenuh hati
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....']),   // diusir satpam
};
export const EXPRS = Object.keys(FACES);

const N = o => o.top === 'ngamen';
const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'dlSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'dlSkin'); v.set(7, -1, 5, 'dlSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'dlSkin'); v.box(-1, y, 6, -1, y, 7, 'dlSkinS'); }
  for (let z = 1; z <= 3; z++) for (const y of [-6, 5]) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'dlJenggot'); }   // jambang tipis
  // gondrong sebahu belah tengah, ujung bergerigi; menutup telinga, menjuntai ke tengkuk
  const hair = new Vox();
  for (let z = -4; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, 'dlHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -6, -6, 5, 5, 'dlHair', 4);
  const zmin = (x, y) => x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 ? (x >= 3 ? 9 : -3 + ((x + y + 40) % 3)) : x <= -6 ? -4 + ((y + 40) % 3) : 7;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y) && (z >= 2 || x <= 1)) v.set(x, y, z, (x * 2 + y + z) % 7 === 0 ? 'dlHairT' : c); });
  for (let x = -6; x <= 5; x++) for (let z = 13; z <= 15; z++) for (const y of [-1, 0]) if (v.get(x, y, z + 1) === undefined && v.get(x, y, z) === 'dlHair') v.set(x, y, z, 'dlHairT');
  if (N(o)) {   // bandana merah melingkar di dahi, simpul & ekor di belakang
    for (let z = 12; z <= 13; z++) for (let x = -10; x <= 9; x++) for (let y = -10; y <= 9; y++) { const d = ((x + 0.5) / 8.6) ** 2 + ((y + 0.5) / 9.3) ** 2; if (d <= 1 && d > 0.66) v.set(x, y, z, (x + y) % 4 === 0 ? 'dlBandanaS' : 'dlBandana'); }
    v.rbox(-12, -1, 11, -10, 0, 13, 'dlBandana', 0); for (let z = 6; z <= 10; z++) { v.set(-11, -2, z, 'dlBandana'); v.set(-11, 1, z - 1, 'dlBandana'); }
  }
  return v;
}

function uke(v, back) {   // ukulele: badan angka-8, lubang suara, leher ke kiri atas
  const X = back ? x => -x - 0 : x => x, xb = back ? -7 : 6;
  const body = (cy, cz, r) => { for (let z = cz - r; z <= cz + r; z++) for (let y = cy - r; y <= cy + r; y++) if ((y - cy) ** 2 + (z - cz) ** 2 <= r * r + 1) for (let d = 0; d <= 2; d++) v.set(back ? xb - d : xb + d, y, z, d === (back ? 0 : 2) ? 'dlUkulele' : 'dlUkuleleS'); };
  body(3, 38, 4); body(1, 44, 3);
  const xs = back ? xb - 2 : xb + 2;
  for (const [y, z] of [[2, 41], [1, 41], [2, 40], [1, 40]]) v.set(xs, y, z, 'dlLubang');
  for (let k = 0; k <= 12; k++) { const y = 0 - Math.round(k * 0.55), z = 47 + k; for (let d = 0; d <= 1; d++) v.set(back ? xb - d : xb + 1 + d, y, z, k >= 11 ? 'dlUkuleleS' : 'dlLeher'); }
  for (let z = 36; z <= 46; z++) v.set(back ? xs - 1 : xs + 1, Math.round(1.5 - (z - 36) * 0.1), z, 'dlSenar');
  v.box(back ? xs - 1 : xs + 1, 2, 35, back ? xs - 1 : xs + 1, 4, 35, 'dlUkuleleS');
  return X;
}
function chest(o) {
  const v = new Vox(), c = N(o) ? 'dlKaus' : 'dlParka';
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0, p = N(o) ? 0 : 1; v.rrect(z, -5 - p, -8 + w + t - p, 4 - t + p, 7 - w - t + p, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'dlSkin', 2);
  if (N(o)) {
    for (let y = -3; y <= 2; y++) v.pf(y, 56, 'dlSkin');
    // rompi jins terbuka, tambalan warna-warni
    for (let z = 35; z <= 55; z++) for (let y = -9; y <= 8; y++) { const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null && !(Math.abs(y + 0.5) < 4 && z > 37)) v.set(xf + 1, y, z, 'dlRompi'); if (xb !== null) v.set(xb - 1, y, z, 'dlRompi'); }
    for (let z = 36; z <= 55; z++) for (const y of [-5, 4]) { const x = v.front(y, z); if (x !== null && v.get(x, y, z) === 'dlRompi') v.set(x, y, z, 'dlRompiS'); }
    [['dlTambal', -8, 40, -6, 42], ['dlTambal', 5, 47, 7, 49]].forEach(([m, y0, z0, y1, z1], i) => { for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, i ? 'dlTambal2' : 'dlTambal'); } });
    for (let z = 43; z <= 48; z++) for (let y = -4; y <= 3; y++) { const x = v.back(y, z); if (x !== null && v.get(x, y, z) === 'dlRompi') v.set(x, y, z, (y + z) % 2 ? 'dlTambal' : 'dlRompiS'); }   // tambalan besar di punggung
    // gambar matahari pudar di kaus
    for (let z = 40; z <= 48; z++) for (let y = -3; y <= 2; y++) { const r = Math.hypot(y + 0.5, z - 44); const x = v.front(y, z); if (x !== null && v.get(x, y, z) === 'dlKaus' && (r <= 2.2 || (r <= 3.6 && (y + z) % 2 === 0))) v.set(x, y, z, r <= 2.2 ? 'dlGambar' : 'dlGambarS'); }
    uke(v, false);
    for (let z = 44; z <= 56; z++) { const y = 7 - Math.round((56 - z) * 0.3); const x = v.back(y, z); if (x !== null) v.set(x - 1, y, z, 'dlTali'); }   // tali ukulele
  } else {
    for (let z = 35; z <= 55; z++) v.pf(-1, z, 'dlParkaS');
    for (let z = 55; z <= 59; z++) v.shell(z, -6, -6, 5, 5, 'dlBulu', 3);   // kerah berbulu
    for (const z of [39, 40]) for (const y of [-7, -6, -5, 4, 5, 6]) v.pf(y, z, 'dlParkaS');   // saku
    uke(v, true);
    for (let z = 36; z <= 56; z++) { const yc = Math.round(6 - (56 - z) * 0.6); for (let y = yc; y <= yc + 1; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'dlTali'); } }   // tali sandang
  }
  return v;
}
function pelvis(o) {
  const v = new Vox();
  v.rbox(-5, -8, 28, 4, 7, 33, 'dlJins', 3); v.box(-4, -2, 26, 3, 1, 27, 'dlJins');
  v.shell(33, -6, -9, 5, 8, 'dlTali', 3);
  if (!N(o)) for (let z = 28; z <= 34; z++) v.shell(z, -7, -10, 6, 9, z === 28 ? 'dlParkaS' : 'dlParka', 3);
  return v;
}
function arm(o) { const v = new Vox(), c = N(o) ? 'dlKaus' : 'dlParka'; v.rbox(-3, 8, 43, 2, 13, 55, N(o) ? 'dlSkin' : c, 2); v.rrect(56, -3, 8, 2, 13, c, 3); if (N(o)) v.paint(-3, 8, 50, 2, 13, 56, c); return v; }
function fore(o, side) {
  const v = new Vox();
  v.rbox(-3, 8, 31, 2, 13, 42, N(o) ? 'dlSkin' : 'dlParka', 2);
  if (!N(o)) v.paint(-3, 8, 31, 2, 13, 32, 'dlParkaS');
  else if (side > 0) for (const z of [33, 34]) v.shell(z, -4, 7, 3, 14, (z % 2) ? 'dlBandana' : 'dlGambar', 2);   // gelang tali
  v.rbox(-3, 8, 27, 3, 13, 30, 'dlSkin', 2); v.rrect(26, -2, 9, 2, 12, 'dlSkin', 2);
  if (N(o) && side < 0) {   // kantong bungkus permen untuk receh
    for (let z = 14; z <= 24; z++) { const r = z <= 16 ? 2 : 3; v.shell(z, -r, 10 - r, r, 10 + r, 'dlPlastik', 1); }
    v.rrect(14, -1, 9, 1, 11, 'dlPlastik', 0);
    for (let z = 15; z <= 20; z++) for (let y = 8; y <= 12; y++) for (let x = -2; x <= 2; x++) if ((x + y * 2 + z * 3) % 4 === 0) v.set(x, y, z, (x + z) % 2 ? 'dlPermen' : 'dlPermen2');
  }
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-4, 2, 18, 3, 8, 31, 'dlJins', 3); v.rrect(32, -3, 2, 2, 8, 'dlJins', 3); for (let y = 3; y <= 6; y++) v.pf(y, 19, 'dlSobek'); for (let y = 4; y <= 5; y++) v.pf(y, 20, 'dlSkin'); return v; }
function shin() { const v = new Vox(); v.rbox(-4, 2, 6, 3, 8, 18, 'dlJins', 3); v.rrect(19, -3, 2, 2, 8, 'dlJins', 3); for (let z = 7; z <= 17; z++) v.pf(5, z, 'dlJinsS'); v.paint(-4, 2, 6, 3, 8, 6, 'dlJinsS'); return v; }
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 1, 'dlSandal', 3); v.rbox(-3, 2, 2, 6, 7, 3, 'dlSkin', 3); v.rbox(-3, 2, 4, 2, 7, 5, 'dlSkin', 3);
  v.paint(2, 1, 2, 3, 8, 3, 'dlSandal');
  return v;
}

export const OUTFITS = {
  ngamen: { name: 'Ngamen: bandana merah + kaus hitam matahari + rompi jins tambalan + ukulele + kantong permen + jins robek + sandal', top: 'ngamen' },
  nongkrong: { name: 'Nongkrong: jaket parka hijau kerah bulu + ukulele disandang di punggung + jins', top: 'nongkrong' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.ngamen), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), c = N(o) ? 'dlKaus' : 'dlParka';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'dlSkin', shoulder: c, elbow: N(o) ? 'dlSkin' : c, hip: 'dlJins', knee: 'dlJins' }, SKEL, TAIL);
}
