// Kak Raffi: mahasiswa tingkat akhir yang pulang kampung ke Perumahan Bukit Asri, 23 tahun, santai tapi stres skripsi
// ("Lagi skripsi, jangan tanya kapan lulus."). Kulit kuning langsat, rambut agak gondrong berantakan dibelah tengah,
// kantung mata, kacamata bulat tipis, janggut tipis belum dicukur. Kafe: hoodie navy kampus + celana chino + sneakers +
// tote bag kanvas + es kopi susu. Jogging: kaus lari oranye + celana pendek + headphone + jam pintar + sepatu lari.
// Rangka keluarga Arga agak ramping, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  rfSkin: ['#c8986e', '#d6a87e', '#e2b68c', '#ecc49c'], rfSkinS: ['#cc9e74'], rfKantung: ['#b88a64'], rfJenggot: ['#8a6a50'],
  rfHair: ['#1a1410', '#241c16', '#30261e', '#3e3228'], rfHairT: ['#4a3a2c'], rfKaca: ['#3a3430'],
  hoodieR: ['#1e2a4a', '#26345a', '#2e3e6a', '#3a4c7e'], hoodieRS: ['#141c34'], hoodieRK: ['#e8c040'], hoodieRT: ['#e8e8ec'],
  chinoR: ['#a8906a', '#b8a078', '#c6ae86', '#d4bc96'], chinoRS: ['#8a7450'], sneakR: ['#e4e4e0', '#eeeeea', '#f6f6f4', '#ffffff'], sneakRS: ['#c0c0bc'], sneakRK: ['#1e2a4a'],
  toteR: ['#d8ccae', '#e2d6ba', '#ece2c8', '#f4ecd6'], toteRS: ['#b8a882'], toteRK: ['#2a2a30'],
  esKopi: ['#a87a50', '#b88a5e', '#c69a6e', '#d4aa80'], esKopiC: ['#e6eef2'], esKopiS: ['#2a8a5a'],
  larR: ['#e86a1a', '#f07a2a', '#f68a3c', '#fa9c52'], larRS: ['#b84e0e'], pendekR: ['#22222a', '#2a2a34', '#34343e', '#40404c'], pendekRS: ['#e86a1a'],
  hpR: ['#1a1a1e', '#24242a', '#2e2e36', '#3a3a44'], hpRK: ['#e86a1a'], lariR: ['#2a6ac0', '#3a7cd2', '#4a8ce0', '#5c9cec'], lariRS: ['#f2f2ee'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'rfSkinS', k: 'rfKantung', j: 'rfJenggot' };
const F0 = '..............';
const F = (brow, eyes, mouth, chin = F0) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...[...mouth, F0, F0].slice(0, 3), chin, F0];   // alis z 11, kantung mata z 7, mulut z 4, janggut tipis z 1
const BROW = '..BBB....BBB..';
const EYE = ['...KK....KK...', '...WK....KW...'];
const CH = '....j.jj.j....';
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0], CH),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0], CH),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', F0], CH),   // "Jangan tanya kapan lulus!"
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....'], '....j....j....'),
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....'], CH),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....'], CH),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....'], CH),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'rfSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'rfSkin'); v.set(7, -1, 5, 'rfSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'rfSkin'); v.box(-1, y, 6, -1, y, 7, 'rfSkinS'); }
  // rambut agak gondrong belah tengah: tirai menutup pelipis & telinga atas, belakang sampai tengkuk, ujung acak
  const hair = new Vox();
  for (let z = 2; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, 'rfHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -7, -7, 6, 6, 'rfHair', 5); hair.rrect(17, -5, -5, 4, 4, 'rfHair', 3);
  const zmin = (x, y) => x >= 5 ? (Math.abs(y + 0.5) > 5.5 ? 10 : 13) : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 8 : 2;
  hair.each((x, y, z, c) => { if (v.has(x, y, z) || z < zmin(x, y)) return; if (z <= 4 && rnd(x, y, z) % 3 === 0) return; v.set(x, y, z, rnd(x, y, z) % 6 === 0 ? 'rfHairT' : c); });
  for (let x = -2; x <= 7; x++) for (const y of [-1, 0]) { const z = (() => { for (let zz = 20; zz >= 10; zz--) if (v.has(x, y, zz)) return zz; return null; })(); if (z !== null && z >= 15) v.set(x, y, z, null); }   // belahan tengah
  for (const [y, z] of [[-3, 13], [-4, 13], [2, 13], [3, 13], [-5, 12], [4, 12]]) { const x = v.front(y, z + 1); if (x !== null) v.set(x, y, z, 'rfHair'); }   // poni tirai jatuh ke pelipis
  // kacamata bulat tipis: bingkai 1 voxel di depan mata (z 7..10), mulut tetap terbuka
  const fx = v.front(-1, 8) + 1;
  ['.GGGGG..GGGGG.', 'GG...GGGG...GG', '.G...G..G...G.', '.GGGGG..GGGGG.'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'G') v.set(fx, c - 7, 10 - r, 'rfKaca'); }));
  for (const y of [-7, 6]) for (let x = fx; x >= -1; x--) if (!v.has(x, y, 9)) v.set(x, y, 9, 'rfKaca');
  if (o.hp) {   // headphone di kepala: bando hitam melengkung + bantalan oranye di telinga
    for (let y = -10; y <= 9; y++) { const t = (y + 0.5) / 10, z = 13 + Math.round(5.5 * Math.sqrt(Math.max(0, 1 - t * t))); for (const x of [-1, 0]) { v.set(x, y, z, 'hpR'); } }
    for (const s of [-1, 1]) { const y = s > 0 ? 9 : -10; v.rbox(-3, y, 4, 2, y, 10, 'hpR', 2); v.rbox(-2, y + (s > 0 ? 1 : -1), 5, 1, y + (s > 0 ? 1 : -1), 9, 'hpRK', 1); }
  }
  return v;
}

const bodyC = o => o.top === 'kafe' ? 'hoodieR' : 'larR';
function chest(o) {
  const v = new Vox(), c = bodyC(o), K = o.top === 'kafe';
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5 - (K ? 1 : 0), -8 + w + t - (K ? 1 : 0), 4 - t + (K ? 1 : 0), 7 - w - t + (K ? 1 : 0), c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'rfSkin', 2);
  if (K) {
    // tudung hoodie terlipat di punggung, tali putih, kantung kanguru, tulisan kampus kuning
    for (let z = 52; z <= 59; z++) for (let y = -6; y <= 5; y++) { const x = v.back(y, Math.min(z, 56)); if (x !== null) v.set(x - 1, y, z, z >= 58 ? 'hoodieRS' : 'hoodieR'); }
    for (let z = 56; z <= 58; z++) v.shell(z, -4, -6, 4, 5, 'hoodieR', 2);
    for (const y of [-2, 1]) for (let z = 47; z <= 55; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'hoodieRT'); }
    for (let z = 35; z <= 41; z++) for (let y = -5; y <= 4; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === 41 || Math.abs(y + 0.5) > 4 ? 'hoodieRS' : 'hoodieR'); }
    ['.XXX.', 'XX.XX', '.XXX.'].forEach((row, r) => [...row].forEach((ch, k) => { if (ch === 'X') v.pf(k - 2, 46 - r, 'hoodieRK'); }));   // logo kampus
  } else {
    for (let y = -2; y <= 1; y++) v.pf(y, 56, 'rfSkin');
    for (let z = 35; z <= 55; z++) for (const y of [-8, 7]) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'larRS'); }
    v.shell(56, -4, -4, 3, 3, 'larRS', 2);
  }
  return v;
}
const legC = o => o.top === 'kafe' ? 'chinoR' : 'pendekR';
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-5, -8, 28, 4, 7, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'kafe') for (let z = 29; z <= 33; z++) v.shell(z, -7, -10, 6, 9, z === 29 ? 'hoodieRS' : 'hoodieR', 3);   // ujung hoodie berkaret
  else { for (let z = 31; z <= 33; z++) v.shell(z, -6, -9, 5, 8, 'larR', 3); for (let z = 26; z <= 30; z++) for (const y of [-9, 8]) v.set(0, y, z, 'pendekRS'); }
  return v;
}
function arm(o) { const v = new Vox(), c = bodyC(o), K = o.top === 'kafe'; v.rbox(-3, 8, 43, 2, 12 + (K ? 1 : 0), 55, K ? c : 'rfSkin', 2); v.rrect(56, -3, 8, 2, 12, c, 3); if (!K) { v.paint(-3, 8, 50, 2, 12, 56, c); v.shell(50, -4, 7, 3, 13, 'larRS', 2); } return v; }
function fore(o, side) {
  const v = new Vox(), K = o.top === 'kafe';
  v.rbox(-3, 8, 31, 2, 12 + (K ? 1 : 0), 42, K ? 'hoodieR' : 'rfSkin', 2);
  if (K) v.shell(31, -4, 7, 3, 14, 'hoodieRS', 2);
  v.rbox(-3, 8, 27, 3, 12, 30, 'rfSkin', 2); v.rrect(26, -2, 9, 2, 11, 'rfSkin', 2);
  if (side > 0 && K) {   // es kopi susu gelas plastik dengan sedotan hijau
    v.rbox(-1, 9, 18, 3, 12, 29, 'esKopiC', 1); v.rbox(0, 10, 19, 2, 11, 26, 'esKopi', 1); v.set(1, 10, 27, 'esKopiC');
    for (let z = 30; z <= 33; z++) v.set(1, 11, z, 'esKopiS');
  }
  if (side < 0 && K) {   // tote bag kanvas digantung di bahu kiri, berisi laptop (tampak menyembul)
    for (let z = 22; z <= 34; z++) for (let x = -5; x <= 5; x++) v.set(x, 14, z, z === 34 ? 'toteRS' : 'toteR');
    for (let x = -4; x <= 4; x++) for (const z of [35, 36]) v.set(x, 14, z, 'hpR');
    for (const [x, z] of [[-1, 29], [0, 29], [1, 29], [0, 28], [0, 30]]) v.set(x, 15, z, 'toteRK');
    for (let z = 35; z <= 44; z++) v.set(-4, 13, z, 'toteRS');
  }
  if (side < 0 && !K) v.paint(-3, 8, 31, 2, 12, 32, 'hpR');   // jam pintar
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-4, 2, 18, 3, 8, 31, o.top === 'kafe' ? c : 'rfSkin', 3); v.rrect(32, -3, 2, 2, 8, c, 3); if (o.top !== 'kafe') for (let z = 24; z <= 31; z++) v.shell(z, -5, 1, 4, 9, c, 3); return v; }
function shin(o) {
  const v = new Vox(), K = o.top === 'kafe';
  v.rbox(-3, 3, 6, 2, 7, 18, K ? 'chinoR' : 'rfSkin', 2); v.rrect(19, -3, 3, 2, 7, K ? 'chinoR' : 'rfSkin', 2);
  if (K) v.shell(6, -4, 2, 3, 8, 'chinoRS', 2); else v.paint(-3, 3, 6, 2, 7, 7, 'lariRS');
  return v;
}
function foot(o) {
  const v = new Vox(), K = o.top === 'kafe', c = K ? 'sneakR' : 'lariR';
  v.rbox(-4, 1, 0, 7, 8, 1, K ? 'sneakRS' : 'lariRS', 3); v.rbox(-4, 1, 2, 7, 8, 4, c, 3); v.rbox(-4, 1, 5, 2, 8, 5, c, 3);
  if (K) { v.paint(-4, 1, 2, 7, 1, 3, 'sneakRK'); v.paint(-4, 8, 2, 7, 8, 3, 'sneakRK'); } else for (const x of [1, 3]) v.paint(x, 3, 4, x, 6, 4, 'lariRS');
  return v;
}

export const OUTFITS = {
  kafe: { name: 'Nugas di kafe: hoodie navy kampus + chino + sneakers + tote bag laptop + es kopi susu', top: 'kafe', propOn: 'all' },
  jogging: { name: 'Jogging sore: kaus lari oranye + celana pendek + headphone + jam pintar + sepatu lari', top: 'jogging', hp: true },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.kafe), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = bodyC(o), leg = legC(o), K = o.top === 'kafe';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'rfSkin', shoulder: sl, elbow: K ? sl : 'rfSkin', hip: leg, knee: K ? leg : 'rfSkin' }, SKEL, TAIL);
}
