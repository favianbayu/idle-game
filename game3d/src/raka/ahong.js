// Koh Ahong: pemilik toko kelontong di Kenanga, 50-an, pelit tapi lucu ("Ada uang ada barang, hehe."). Gempal perut buncit,
// kulit kuning langsat, rambut tipis disisir ke samping menutupi botak, mata sipit, kacamata baca di kepala, kaus singlet
// putih + celana kolor kotak + sandal jepit, pensil di telinga, kalkulator. Imlek: kemeja merah bermotif emas.
// Rangka keluarga Arga dengan perut ala Om Darto, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 7, ballR: 1.05 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  ahSkin: ['#c8a07a', '#d8b08a', '#e6c09a', '#f0d0ac'], ahSkinS: ['#cca47e'], ahBlush: ['#e4a08a'], ahHair: ['#1c1814', '#26201c', '#302824', '#3c342e'],
  ahKaca: ['#6a4a2a'], ahLensa: ['#cfe0ea'],
  singlet: ['#dcdad2', '#e8e6de', '#f2f0ea', '#faf9f6'], singletS: ['#c0bcb0'],
  kolor: ['#2a4a8a', '#32569c', '#3a64ae', '#4a76c0'], kolorS: ['#1e3668'], kolorK: ['#c8d8f0'],
  jepitAh: ['#3a3a40', '#46464c', '#525258', '#606068'], pensilAh: ['#e8c040'], pensilAhT: ['#e88a8a'],
  kalku: ['#2a2a30', '#34343a', '#3e3e46', '#4a4a54'], kalkuL: ['#a8c8a0'], kalkuT: ['#d8d8de'],
  kemAh: ['#a81818', '#bc2020', '#d02a2a', '#e03c3c'], kemAhS: ['#7a1010'], kemAhK: ['#e8c048'], celAh: ['#16161a', '#1e1e24', '#28282e', '#34343c'], sepAh: ['#1a1210', '#241814', '#30201a', '#422e24'],
});

/* ---------- wajah: alis tipis, mata sipit (satu baris), pipi tembam merah, senyum lebar "hehe" */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'ahSkinS', r: 'ahBlush' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, F0, ...eyes, 'rr..........rr', F0, ...mouth, F0, F0];   // alis z 11, mata z 8..7, mulut z 4
const BROW = '..BBBB..BBBB..';
const EYE = ['..KKKK..KKKK..', '...KK....KK...'];
export const FACES = {
  biasa: F(BROW, EYE, ['....mmmmmm....', '.....mmmm.....', F0]),
  kedip: F(BROW, [F0, '..KKKK..KKKK..'], ['....mmmmmm....', '.....mmmm.....', F0]),
  marah: F('...BBB..BBB...', ['..KKKK..KKKK..', '..WKK....KKW..'], ['....mmmmmm....', F0, F0]),   // "Utang? Bayar dulu yang kemarin!"
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, ['.KKKKK..KKKKK.', F0], ['...mTTTTTTm...', '....mmmmmm....', F0]),   // "hehe"
  ketawa: F(BROW, ['..K..K..K..K..', '...KK....KK...'], ['...mTTTTTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-4, -6, 5, 5, 3] : z === 1 ? [-6, -7, 6, 6, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];   // pipi & dagu bulat
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'ahSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'ahSkin'); v.set(7, -1, 5, 'ahSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'ahSkin'); v.box(-1, y, 6, -1, y, 7, 'ahSkinS'); }
  // rambut tipis disisir menyamping dari kiri ke kanan menutupi puncak botak; kulit kepala kelihatan di sela garis
  const hair = new Vox();
  for (let z = 6; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'ahHair', 4);
  hair.rrect(16, -6, -6, 5, 5, 'ahHair', 4);
  hair.each((x, y, z, c) => {
    if (v.has(x, y, z) || z < (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 6)) return;
    if (z >= 16 && (x + 40) % 4 === 1 && Math.abs(y + 0.5) < 3) { v.set(x, y, z, 'ahSkin'); return; }   // sela kulit di puncak
    v.set(x, y, z, c);
  });
  if (o.pencil) { for (let x = -2; x <= 4; x++) v.set(x, 8, 10, 'pensilAh'); v.set(5, 8, 10, 'pensilAhT'); }
  if (o.kaca) {   // kacamata baca nangkring di atas dahi
    for (const y0 of [-6, 1]) for (let y = y0; y <= y0 + 4; y++) { v.set(8, y, 16, 'ahKaca'); v.set(8, y, 15, y === y0 || y === y0 + 4 ? 'ahKaca' : 'ahLensa'); }
    for (const y of [-1, 0]) v.set(8, y, 15, 'ahKaca');
    for (const y of [-8, 7]) for (let x = 7; x >= 0; x--) if (!v.has(x, y, 15)) v.set(x, y, 15, 'ahKaca');
  }
  return v;
}

const bodyC = o => o.top === 'toko' ? 'singlet' : 'kemAh';
function chest(o) {
  const v = new Vox(), c = bodyC(o);
  for (let z = 34; z <= 56; z++) { const bel = z > 50 ? 0 : Math.round(5 * Math.sin((z - 31) / 20 * Math.PI)), t = z === 56 ? 1 : 0; v.rrect(z, -6, -9 + t, 4 + bel - t, 8 - t, c, 4); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'ahSkin', 2);
  if (o.top === 'toko') {   // singlet: bahu & ketiak terbuka, kerah U lebar
    for (let z = 50; z <= 56; z++) for (let y = -9; y <= 8; y++) if (Math.abs(y + 0.5) > 5.5 || (Math.abs(y + 0.5) < 3.5 && z >= 53)) { const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf, y, z, 'ahSkin'); if (xb !== null && Math.abs(y + 0.5) > 5.5) v.set(xb, y, z, 'ahSkin'); }
    v.each((x, y, z, k) => { if (k === 'singlet' && Math.abs(y + 0.5) > 7.5 && z >= 50) v.set(x, y, z, 'ahSkin'); });
    for (const [y, z] of [[-6, 50], [5, 50]]) v.pf(y, z, 'singletS');
    return v;
  }
  for (let z = 35; z <= 55; z++) v.pf(-1, z, 'kemAhS');   // Imlek: kemeja merah motif koin emas, kerah mandarin
  for (let z = 37; z <= 53; z += 4) v.pf(-1, z, 'kemAhK');
  v.each((x, y, z, k) => { if (k !== 'kemAh') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x; if ((u + 40) % 5 === 2 && (z + 40) % 5 === 2) v.set(x, y, z, 'kemAhK'); });
  for (let z = 56; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'kemAh', 2);
  return v;
}
const legC = o => o.top === 'toko' ? 'kolor' : 'celAh';
const kotak = v => { v.each((x, y, z, k) => { if (k !== 'kolor') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x; if ((u + 40) % 4 === 0 || z % 4 === 0) v.set(x, y, z, ((u + 40) % 4 === 0 && z % 4 === 0) ? 'kolorK' : 'kolorS'); }); return v; };
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-6, -8, 28, 5, 7, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'toko') { for (let z = 31; z <= 33; z++) v.shell(z, -7, -10, 6 + (z - 30), 9, 'singlet', 4); kotak(v); }   // singlet menutup perut bawah
  else for (let z = 30; z <= 33; z++) v.shell(z, -7, -10, 6 + (z - 30), 9, 'kemAh', 4);
  return v;
}
function arm(o) { const v = new Vox(), c = bodyC(o); v.rbox(-3, 8, 43, 3, 14, 55, o.top === 'toko' ? 'ahSkin' : c, 3); v.rrect(56, -3, 8, 3, 14, o.top === 'toko' ? 'ahSkin' : c, 3); return v; }
function fore(o, side) {
  const v = new Vox(), K = o.top === 'imlek';
  v.rbox(-3, 8, 31, 3, 14, 42, K ? 'kemAh' : 'ahSkin', 3);
  if (K) v.paint(-3, 8, 31, 3, 14, 31, 'kemAhK');
  v.rbox(-3, 8, 27, 4, 14, 30, 'ahSkin', 3); v.rrect(26, -2, 9, 3, 13, 'ahSkin', 2);
  if (side < 0) v.paint(-3, 8, 31, 3, 14, 31, 'kemAhK');   // gelang/jam emas
  if (side > 0 && o.top === 'toko') {   // kalkulator hitam dengan layar hijau, dipencet jempol
    v.rbox(-3, 7, 20, 3, 8, 30, 'kalku', 0); v.paint(3, 7, 27, 3, 8, 29, 'kalkuL');
    for (const z of [21, 23, 25]) for (const y of [7, 8]) v.set(3, y, z, 'kalkuT');
  }
  if (side > 0 && K) {   // jeruk mandarin untuk tamu Imlek
    for (let x = -2; x <= 2; x++) for (let y = 7; y <= 11; y++) for (let z = 20; z <= 25; z++) if ((x / 2.6) ** 2 + ((y - 9) / 2.6) ** 2 + ((z - 22.5) / 2.8) ** 2 <= 1) v.set(x, y, z, 'pensilAh');
  }
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-5, 2, 18, 4, 8, 31, c, 3); v.rrect(32, -4, 2, 3, 8, c, 3); return o.top === 'toko' ? kotak(v) : v; }
function shin(o) {
  const v = new Vox();
  if (o.top === 'toko') { v.rbox(-3, 3, 6, 2, 7, 18, 'ahSkin', 2); v.rrect(19, -3, 3, 2, 7, 'ahSkin', 2); return v; }
  v.rbox(-4, 2, 6, 3, 7, 18, 'celAh', 3); v.rrect(19, -3, 2, 2, 7, 'celAh', 3);
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'toko') { v.rbox(-4, 1, 0, 7, 8, 0, 'jepitAh', 3); v.rbox(-3, 2, 1, 6, 7, 2, 'ahSkin', 2); v.rbox(-3, 2, 3, 2, 7, 5, 'ahSkin', 2); for (const [x, y] of [[5, 4], [4, 3], [4, 5], [3, 2], [3, 6]]) v.set(x, y, 2, 'jepitAh'); return v; }
  v.rbox(-4, 1, 0, 7, 8, 1, 'sole', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'sepAh', 3); v.rbox(-4, 1, 5, 2, 8, 5, 'sepAh', 3);
  return v;
}

export const OUTFITS = {
  toko: { name: 'Jaga toko: singlet putih + kolor kotak biru + sandal jepit + pensil di telinga + kalkulator + kacamata di dahi', top: 'toko', pencil: true, kaca: true },
  imlek: { name: 'Imlek: kemeja merah motif koin emas + celana hitam + pantofel + jeruk', top: 'imlek' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.toko), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = bodyC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'ahSkin', shoulder: o.top === 'toko' ? 'ahSkin' : sl, elbow: o.top === 'toko' ? 'ahSkin' : sl, hip: leg, knee: o.top === 'toko' ? 'ahSkin' : leg }, SKEL, TAIL);
}
