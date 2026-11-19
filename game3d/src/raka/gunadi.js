// Pak Gunadi: guru Kimia-Fisika eksentrik penjaga lab, 60-an, pemberi resep racikan. Rambut putih berdiri ke segala
// arah, janggut putih pendek, kacamata bulat tebal, jas lab putih bernoda (bekas reaksi warna-warni), kemeja krem, dasi
// kupu-kupu, celana abu, gelas kimia berasap di tangan. Rangka keluarga Arga (skala 1.28, sedikit membungkuk), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';
import { motifKotak } from './props.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 23, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  guPolo: ['#2a4a3a', '#345a46', '#3e6a52', '#4c7e62'], guSarung: ['#4a3a6a', '#5a487e', '#6a5892', '#7e6ca8'], guSarungK: ['#c8b890'],
  guSkin: ['#bc8c68', '#d4a07c', '#e0b088', '#ecc09a'], guSkinS: ['#c89672'], guKerut: ['#b8845e'],
  guHair: ['#a8a49c', '#c0bcb4', '#d6d2ca', '#ecebe6'], guHairS: ['#8e8a82'], guFrame: ['#2a2a30'], guLens: ['#dcecf4'],
  labC: ['#cfd2d6', '#e2e4e8', '#f0f2f4', '#fafbfc'], labS: ['#b0b4ba'], nodaH: ['#5aa04a'], nodaU: ['#8a4ab0'], nodaK: ['#d8a020'], nodaG: ['#4a3a2a'],
  kemG: ['#c8b890', '#d8c8a2', '#e6d8b4', '#f0e6c8'], dasiG: ['#8a1a2a', '#a42234', '#bc2c40', '#d23c52'], celG2: ['#4a4c52', '#585a60', '#686a72', '#7a7c84'],
  gelas: ['#b8e0ec', '#cceaf2', '#ddf2f8', '#eef8fc'], cairan: ['#5ad06a', '#6ae07a', '#7ef08e', '#a0ffb0'], gnAsap: ['#e0e8e4'],
  rompiG: ['#5a4a3a', '#6a5844', '#7a6650', '#8c785e'], rompiGS: ['#3e3226'], kardiG: ['#6a3a2a', '#7a4432', '#8c503c', '#a06048'], pantoG: ['#2a1c14', '#36241a', '#443022', '#56402e'],
});

/* ---------- wajah: alis putih tebal awut-awutan, mata kecil di balik kacamata bulat, janggut putih pendek di dagu, kerut */
const FCH = { B: 'guHair', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'guKerut', j: 'guHair' };
const F0 = '..............';
const BEARD = ['..jjjjjjjjjj..', '...jjjjjjjj...', '....jjjjjj....'];
const F = (brow, eyes, mouth) => [F0, F0, ...brow, ...eyes, '.s..........s.', F0, F0, F0, mouth, ...BEARD, F0];   // alis z 12..11, mata z 10..9, mulut z 4, janggut z 3..1
const BROW = ['.BBBB....BBBB.', '..B.B....B.B..'];
const EYE = ['...KK....KK...', '...KK....KK...'];
export const FACES = {
  biasa: F(BROW, EYE, '....jmmmmj....'),
  kedip: F(BROW, [F0, '..KKK....KKK..'], '....jmmmmj....'),
  marah: F(['...BBB..BBB...', '.....B..B.....'], EYE, '...jmmmmmmj...'),
  teriak: F(['...BBB..BBB...', '.....B..B.....'], EYE, '...jmTTTTmj...'),   // "Jangan sentuh itu!"
  nyengir: F(BROW, EYE, '...jTTTTTTj...'),   // eureka!
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], '...jTttttTj...'),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...'], '...jTTTTTTj...'),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-5, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'guSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 7, 'guSkin'); v.box(8, -1, 5, 8, 0, 6, 'guSkin'); v.set(8, -1, 5, 'guSkinS');   // hidung besar
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'guSkin'); v.box(-1, y, 6, -1, y, 7, 'guSkinS'); }
  // janggut menebal 1 voxel di depan dagu & rahang
  for (let z = -1; z <= 3; z++) for (let y = -6; y <= 5; y++) { const x = v.front(y, Math.max(z, 0)); if (x !== null && (z < 0 || v.get(x, y, z) === 'guHair')) v.set(x + 1, y, z, z <= 0 && Math.abs(y + 0.5) > 3.5 ? null : 'guHair'); }
  // rambut putih: dahi botak lebar, sisi & belakang tebal, gumpalan mencuat ke atas & samping secara acak (n ganjil)
  const hair = new Vox();
  for (let z = 4; z <= 15; z++) hair.rrect(z, -9, -10, 6, 9, 'guHair', z <= 11 ? 4 : 5);
  for (let z = 16; z <= 18; z++) hair.rrect(z, -8, -8, 3, 7, 'guHair', 4);
  const zmin = (x, y) => x >= 4 ? 99 : x >= 1 ? (Math.abs(y + 0.5) > 5.5 ? 9 : 15) : Math.abs(y + 0.5) > 6.5 ? 6 : 4;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (const [x, y, z, h] of [[-3, -9, 13, 4], [-2, 8, 12, 5], [-6, -6, 18, 4], [-4, 5, 18, 5], [0, -2, 18, 3], [-8, 0, 15, 4], [-1, 3, 17, 4]]) {   // jambul mencuat
    for (let k = 0; k <= h; k++) { const dx = x < -4 ? -1 : 0, dy = y < -6 ? -1 : y > 6 ? 1 : 0, dz = Math.abs(y) > 6 ? 0 : 1; v.set(x + dx * k, y + dy * k, z + dz * k, k === h ? 'guHairS' : 'guHair'); v.set(x + dx * k, y + dy * k + (k % 2 ? 1 : 0), z + dz * k, 'guHair'); }
  }
  // kacamata bulat tebal bingkai hitam, lensa tebal
  const fx = v.front(-1, 10) + 1;
  for (const cy of [-3.5, 2.5]) for (let y = -8; y <= 7; y++) for (let z = 6; z <= 13; z++) { const d = Math.hypot(y - cy, z - 9.5); if (d > 2 && d <= 3.1) v.set(fx, y, z, 'guFrame'); }
  v.set(fx, -2, 11, 'guLens'); v.set(fx, 4, 11, 'guLens');
  for (const y of [-1, 0]) v.set(fx, y, 10, 'guFrame');
  for (const y of [-8, 7]) for (let x = fx - 1; x >= -1; x--) if (!v.has(x, y, 10)) v.set(x, y, 10, 'guFrame');
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function stains(v, c) {   // noda reaksi warna-warni di jas lab (hijau, ungu, kuning, gosong)
  for (const [y, z, k] of [[-6, 40, 'nodaH'], [-5, 40, 'nodaH'], [-6, 39, 'nodaH'], [4, 37, 'nodaU'], [5, 37, 'nodaU'], [4, 36, 'nodaU'], [2, 50, 'nodaK'], [-7, 47, 'nodaG'], [-6, 47, 'nodaG']]) v.pf(y, z, k);
  for (const [y, z, k] of [[3, 44, 'nodaH'], [2, 44, 'nodaH'], [-4, 38, 'nodaG']]) v.pb(y, z, k);
}
function chest(o) {
  const v = new Vox(), T = o.top;
  const body = T === 'lab' ? 'labC' : T === 'rompi' ? 'rompiG' : 'kardiG';
  for (let z = 34; z <= 56; z++) { const w = z <= 40 ? 1 : z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -8 + w + t, 4 - t + (z <= 44 ? 1 : 0), 7 - w - t, body, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'guSkin', 2);
  // bagian depan terbuka: kemeja krem + dasi kupu-kupu merah
  for (let z = 34; z <= 56; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x !== null) { v.set(x, y, z, null); v.set(x - 1, y, z, 'kemG'); } }
  for (const [y, z] of [[-3, 55], [-2, 55], [-2, 56], [-3, 56], [1, 55], [2, 55], [1, 56], [2, 56], [-1, 55], [0, 55]]) v.pf(y, z, 'dasiG');   // dasi kupu-kupu
  for (let z = 57; z <= 58; z++) v.shell(z, -4, -5, 3, 4, T === 'lab' ? 'labC' : 'kemG', 2);
  for (let y = -2; y <= 1; y++) for (const x of [3, 4]) for (const z of [57, 58]) { const k = v.get(x, y, z); if (k === 'labC' || k === 'kemG') v.set(x, y, z, null); }
  if (T === 'lab') {   // kerah lebar jas lab + saku dada berisi pulpen & termometer
    for (let z = 48; z <= 56; z++) for (const y of [-4, 3]) v.pf(y, z, 'labS');
    for (let y = -7; y <= -5; y++) v.pf(y, 48, 'labS');
    v.pf(-6, 49, 'dasiG'); v.pf(-5, 50, 'guFrame'); v.pf(-5, 49, 'guFrame');
    stains(v, body);
  } else if (T === 'rompi') { for (let z = 34; z <= 50; z += 4) v.pf(-4, z, 'rompiGS'); }
  return v;
}
function pelvis(o) {
  const v = new Vox();
  v.rbox(-5, -7, 28, 4, 6, 33, 'celG2', 3); v.box(-4, -2, 26, 3, 1, 27, 'celG2');
  v.rbox(-5, -7, 32, 4, 6, 33, 'leather', 3);
  if (o.top === 'lab') {   // jas lab panjang sampai paha, terbuka di depan
    for (let z = 22; z <= 33; z++) { v.shell(z, -6, -8, 6, 7, 'labC', 3); for (let y = -3; y <= 2; y++) for (let x = 3; x <= 7; x++) if (v.get(x, y, z) === 'labC') v.set(x, y, z, null); }
    for (const y of [-7, 6]) for (let z = 26; z <= 29; z++) v.pf(y, z, 'labS');
    v.pf(-6, 24, 'nodaU'); v.pf(5, 30, 'nodaH'); v.pb(-3, 25, 'nodaK');
  }
  return v;
}
const sleeveC = o => o.top === 'lab' ? 'labC' : o.top === 'rompi' ? 'kemG' : 'kardiG';
function arm(o) { const v = new Vox(), c = sleeveC(o); v.rbox(-3, 7, 43, 2, 12, 55, c, 2); v.rrect(56, -3, 7, 2, 12, c, 3); if (o.top === 'lab') v.set(2, 12, 50, 'nodaK'); return v; }
function fore(o, side) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-3, 7, 31, 2, 12, 42, c, 2);
  if (o.top === 'lab') { v.rbox(-4, 6, 31, 3, 13, 34, 'labC', 2); v.set(3, 9, 38, 'nodaH'); }   // manset lebar
  v.rbox(-3, 7, 27, 3, 12, 30, 'guSkin', 2); v.rrect(26, -2, 8, 2, 11, 'guSkin', 2);
  if (side > 0 && o.top === 'lab') {   // gelas kimia berisi cairan hijau berasap
    for (let z = 20; z <= 28; z++) for (let x = 2; x <= 7; x++) for (let y = 7; y <= 12; y++) { const d = Math.hypot(x - 4.5, y - 9.5); if (d <= 2.8 && (d > 1.8 || z === 20 || z <= 24)) v.set(x, y, z, z <= 24 && d <= 1.8 ? 'cairan' : 'gelas'); }
    for (const [x, y, z] of [[4, 9, 29], [5, 10, 30], [4, 10, 31], [5, 9, 32], [4, 10, 34]]) v.set(x, y, z, 'gnAsap');
  }
  if (side < 0) v.paint(-3, 7, 30, 2, 12, 30, 'pantoG');   // jam kulit tua
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-4, 2, 18, 3, 7, 31, 'celG2', 3); v.rrect(32, -3, 2, 2, 7, 'celG2', 3); return v; }
function shin() { const v = new Vox(); v.rbox(-4, 2, 6, 3, 7, 18, 'celG2', 3); v.rrect(19, -3, 2, 2, 7, 'celG2', 3); return v; }
function foot() {   // sepatu kulit cokelat tua, sedikit usang
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 0, 'belt', 3); v.rbox(-4, 1, 1, 7, 8, 3, 'pantoG', 3); v.rbox(-4, 2, 4, 2, 7, 5, 'pantoG', 2);
  for (const x of [1, 3]) v.paint(x, 3, 4, x, 6, 4, 'lace');
  return v;
}

export const OUTFITS = {
  lab: { name: 'Lab: jas lab bernoda + kemeja krem + dasi kupu-kupu + gelas kimia berasap', top: 'lab' },
  rompi: { name: 'Mengajar teori: rompi wol cokelat + kemeja krem + dasi kupu-kupu', top: 'rompi' },
  kardigan: { name: 'Rumah: kardigan rajut bata + kemeja krem', top: 'kardigan' },
};
function rambutBerdiri(v) {   // helai uban mencuat ke atas, gaya ilmuwan
  const top = new Map(); v.each((x, y, z, c) => { if (c === 'guHair' || c === 'guHairS') { const k = x + ',' + y; if (!top.has(k) || top.get(k) < z) top.set(k, z); } });
  for (const [k, z] of top) { const [x, y] = k.split(',').map(Number), h = (Math.abs(x * 7 + y * 13) % 5); if (h >= 2) for (let i = 1; i <= h - 1; i++) v.set(x, y, z + i, i === h - 1 ? 'guHair' : 'guHairS'); }
  return v;
}
OUTFITS.kerja = { ...OUTFITS.lab, name: 'Kerja: jas lab bernoda, rambut putih berdiri', fx: { head: rambutBerdiri } };
const SARUNG_GU = v => motifKotak(v, 'guSarung', 'guSarungK', 3, ['celG2', 'pantoG']);
OUTFITS.rumah = { ...OUTFITS.kardigan, name: 'Rumah: kaus polo hijau tua + sarung kotak ungu',
  sw: { kardiG: 'guPolo', kemG: 'guPolo', dasiG: 'guPolo' },
  fx: { pelvis: SARUNG_GU, thighR: SARUNG_GU, thighL: SARUNG_GU, shinR: SARUNG_GU, shinL: SARUNG_GU } };
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  // game memanggil 'seragam': Pak Gunadi memakai jas lab
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.lab), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'guSkin', shoulder: sl, elbow: sl, hip: 'celG2', knee: 'celG2' }, SKEL, TAIL);
}
