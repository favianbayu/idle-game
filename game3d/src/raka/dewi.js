// Mbak SPG Dewi: SPG kartu perdana di depan mal Pusat Kota, 20-an, ceria dan gigih menawarkan ("Paket data murah, Kak!").
// Kulit kuning langsat, kuncir kuda tinggi berikat merah, poni tipis, riasan rapi, lipstik merah. Jaga stan: topi merah
// SINYAL+ + polo merah kerah putih logo kuning + kartu nama bertali + celana hitam ramping + sepatu flat + brosur & HP.
// Pulang: jaket jins + kaus putih + jins + sepatu kets + tas jinjing kanvas. Rangka keluarga Nadia, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  dwSkin: ['#c89068', '#d8a078', '#e4b088', '#eec098'], dwSkinS: ['#c88a64'], dwBlush: ['#e8908a'], dwLip: ['#c02838'],
  dwHair: ['#14100c', '#1c1612', '#261e18', '#322820'], dwHairT: ['#3e3026'], dwIkat: ['#d82030'],
  dwMerah: ['#b81a24', '#c8222c', '#d82c36', '#e63a42'], dwMerahS: ['#901018'], dwPutih: ['#e6e6e8', '#f0f0f2', '#f8f8fa', '#ffffff'], dwLogo: ['#f4c020'],
  dwHitam: ['#16161a', '#1e1e22', '#28282e', '#34343a'], dwTali: ['#d82030'], dwKartu: ['#f4f4f6'],
  dwBrosur: ['#f4c020', '#f8d040', '#fadc60', '#fde880'], dwBrosurS: ['#c8222c'], dwHP: ['#2a2a30'], dwLayar: ['#4aa8e8'],
  dwJins: ['#3a5a8a', '#46689a', '#5276aa', '#6086ba'], dwJinsS: ['#2a446a'], dwJaket: ['#5a7aa8', '#6688b6', '#7296c4', '#80a4d0'], dwJaketS: ['#3e5a84'],
  dwKets: ['#e8e8ea', '#f2f2f4', '#f8f8fa', '#ffffff'], dwSol: ['#c8c8cc'], dwTote: ['#d8ccaa', '#e2d6b6', '#ece0c2', '#f4eace'], dwToteS: ['#8a7a5a'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'dwLip', T: 'teeth', t: 'tongue', r: 'dwBlush', s: 'dwSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['.KKKK....KKKK.', '..WKK....KKW..'];   // bulu mata lentik
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', 'rr..........rr', F0]),
  kedip: F(BROW, ['.KKKK.........', '..WKK....KKKK.'], ['....mmmmmm....', 'rr..........rr', F0]),   // genit menawarkan promo
  marah: F('...BB....BB...', EYE, ['.....mmmm.....', F0, F0]),
  teriak: F('..BBB....BBB..', ['.KKKK....KKKK.', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),   // "Promo, Kak!"
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....', 'rr..........rr']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', 'rr..........rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const S = o => o.top === 'stan';
const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'dwSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'dwSkin'); v.set(7, -1, 5, 'dwSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'dwSkin'); v.box(-1, y, 6, -1, y, 7, 'dwSkinS'); v.set(-1, y + (y > 0 ? 1 : -1), 5, 'dwLogo'); }   // anting kecil
  const hair = new Vox();
  for (let z = 4; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'dwHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -6, -6, 5, 5, 'dwHair', 4);
  const zmin = (x, y) => x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 4;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (let y = -6; y <= 5; y++) { const x = v.front(y, 13); if (x !== null && (y + 40) % 3 !== 0) v.set(x + 1, y, 13, 'dwHair'); }   // poni tipis
  // kuncir kuda tinggi: ikat merah di ubun-ubun belakang, ekor menjuntai sampai tengkuk lalu bergoyang ke punggung
  for (let z = 14; z >= -6; z--) { const w = z >= 4 ? 2 : z >= -2 ? 1 : 0, x1 = z >= 10 ? -9 : -9 - Math.round((10 - z) * 0.15); for (let y = -1 - w; y <= w; y++) for (let x = x1 - 2; x <= x1; x++) if (!v.has(x, y, z)) v.set(x, y, z, (y + z) % 5 === 0 ? 'dwHairT' : 'dwHair'); }
  for (let y = -3; y <= 2; y++) for (let x = -12; x <= -9; x++) v.set(x, y, 15, 'dwIkat');
  if (S(o)) {   // topi merah SINYAL+ dengan pet, lubang belakang untuk kuncir
    for (let z = 14; z <= 19; z++) for (let x = -9; x <= 8; x++) for (let y = -9; y <= 8; y++) {
      const d = ((x + 0.5) / 8.7) ** 2 + ((y + 0.5) / 8.6) ** 2 + (Math.max(0, z - 15) / 5) ** 2;
      if (d <= 1 && (d > 0.6 || z >= 18) && !(x <= -8 && Math.abs(y + 0.5) <= 3.5 && z <= 16)) v.set(x, y, z, z === 14 ? 'dwPutih' : 'dwMerah');
    }
    for (let x = 8; x <= 13; x++) for (let y = -6; y <= 5; y++) if (Math.abs(y + 0.5) <= 6 - Math.max(0, x - 11) * 2) v.set(x, y, 14, 'dwMerahS');
    for (const [y, z] of [[-1, 16], [0, 16], [-1, 17], [0, 17], [1, 16], [-2, 16]]) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'dwLogo'); }
  }
  return v;
}

/* ---------- badan */
function chest(o) {
  const v = new Vox(), c = S(o) ? 'dwMerah' : 'dwPutih';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -5, -7 + t + w, 4 - t, 6 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'dwSkin', 1);
  if (S(o)) {
    for (let z = 50; z <= 52; z++) v.shell(z, -3, -4, 3, 3, 'dwPutih', 2);   // kerah polo putih
    for (let y = -1; y <= 0; y++) v.pf(y, 51, 'dwSkin');
    for (let z = 45; z <= 50; z++) v.pf(-1, z, 'dwMerahS'); for (const z of [47, 49]) v.pf(0, z, 'dwPutih');   // plaket & kancing
    for (const [y, z] of [[3, 46], [4, 46], [3, 45], [4, 45], [2, 45]]) v.pf(y, z, 'dwLogo');   // logo SINYAL+ di dada
    // kartu nama bertali merah
    for (let z = 40; z <= 51; z++) for (const y of [-4 + Math.round((51 - z) * 0.25), 3 - Math.round((51 - z) * 0.25)]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'dwTali'); }
    { const x = v.front(-1, 38); v.box(x + 1, -2, 35, x + 1, 1, 39, 'dwKartu'); v.box(x + 1, -1, 37, x + 1, 0, 38, 'dwMerah'); }
    for (let z = 32; z <= 33; z++) v.shell(z, -5, -7, 4, 6, 'dwMerahS', 3);
    for (let y = -6; y <= 5; y++) { const x = v.back(y, 46); if (x !== null && Math.abs(y + 0.5) <= 4) v.set(x, y, 46, 'dwLogo'); }   // lis logo di punggung
  } else {   // jaket jins terbuka di atas kaus putih
    for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.shell(z, -6, -8 + t + w, 5 - t, 7 - t - w, 'dwJaket', 3); }
    for (let z = 32; z <= 50; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x !== null && v.get(x, y, z) === 'dwJaket') v.set(x, y, z, null); }
    for (let z = 32; z <= 51; z++) for (const y of [-4, 3]) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'dwJaketS'); }
    for (let z = 49; z <= 52; z++) v.shell(z, -4, -5, 3, 4, 'dwJaketS', 2);
    for (let y = -1; y <= 0; y++) for (let z = 51; z <= 52; z++) v.pf(y, z, 'dwSkin');
    for (const y of [-6, 5]) { v.pf(y, 44, 'dwJaketS'); v.pf(y, 45, 'dwJaketS'); }
  }
  return v;
}
function pelvis(o) {
  const c = S(o) ? 'dwHitam' : 'dwJins', v = new Vox();
  v.rbox(-4, -6, 26, 4, 5, 33, c, 3); v.box(-3, -2, 24, 2, 1, 25, c);
  for (let z = 30; z <= 33; z++) v.shell(z, -5, -7, 4, 6, z === 33 ? 'dwHitam' : c, 3);
  if (!S(o)) { for (let z = 30; z <= 34; z++) v.shell(z, -6, -8, 5, 7, z === 30 ? 'dwJaketS' : 'dwJaket', 3); }
  else for (let z = 31; z <= 33; z++) v.shell(z, -5, -7, 4, 6, 'dwMerah', 3);   // ujung polo dimasukkan, sedikit menggembung
  return v;
}
function arm(o) {
  const v = new Vox(), c = S(o) ? 'dwMerah' : 'dwJaket';
  v.rbox(-2, 6, 40, 2, 10, 50, S(o) ? 'dwSkin' : c, 2); v.rrect(51, -2, 6, 2, 10, c, 2);
  if (S(o)) { v.paint(-2, 6, 45, 2, 10, 51, c); v.shell(45, -3, 5, 3, 11, 'dwPutih', 2); }
  return v;
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-2, 6, 31, 2, 10, 39, S(o) ? 'dwSkin' : 'dwJaket', 2);
  if (!S(o)) v.paint(-2, 6, 31, 2, 10, 32, 'dwJaketS');
  v.rbox(-2, 6, 27, 3, 10, 30, 'dwSkin', 2); v.rrect(26, -1, 7, 2, 9, 'dwSkin', 1);
  if (S(o) && side > 0) {   // brosur promo kuning dikipas
    for (let z = 22; z <= 33; z++) for (let y = 6; y <= 11; y++) v.set(4, y, z, (z === 30 || z === 31) && y < 11 ? 'dwBrosurS' : 'dwBrosur');
    for (let y = 7; y <= 10; y++) v.set(4, y, 26, 'dwBrosurS');
  }
  if (S(o) && side < 0) { v.box(3, 7, 25, 4, 9, 31, 'dwHP'); v.box(5, 7, 26, 5, 9, 30, 'dwLayar'); }   // HP buat daftar kartu
  if (!S(o) && side < 0) {   // tas jinjing kanvas
    v.rbox(-4, 10, 12, 4, 13, 24, 'dwTote', 1); v.paint(-4, 10, 18, 4, 13, 19, 'dwToteS');
    for (let z = 25; z <= 29; z++) { v.set(-2, 10, z, 'dwToteS'); v.set(2, 10, z, 'dwToteS'); }
  }
  return v;
}
function thigh(o) { const v = new Vox(), c = S(o) ? 'dwHitam' : 'dwJins'; v.rbox(-3, 1, 17, 2, 6, 30, c, 2); v.rrect(31, -2, 2, 1, 5, c, 2); return v; }
function shin(o) {
  const v = new Vox(), c = S(o) ? 'dwHitam' : 'dwJins';
  v.rbox(-3, 1, 6, 2, 6, 17, c, 2); v.rrect(18, -2, 2, 1, 5, c, 2);
  if (S(o)) v.paint(-3, 1, 5, 2, 6, 5, 'dwSkin'); else for (let z = 6; z <= 17; z++) v.pf(4, z, 'dwJinsS');
  return v;
}
function foot(o) {
  const v = new Vox();
  if (S(o)) { v.rbox(-4, 1, 0, 6, 6, 2, 'dwHitam', 2); v.rbox(-3, 2, 3, 3, 5, 4, 'dwSkin', 2); v.set(6, 3, 2, 'dwPutih'); v.set(6, 4, 2, 'dwPutih'); return v; }
  v.rbox(-4, 1, 0, 6, 6, 1, 'dwSol', 2); v.rbox(-4, 1, 2, 6, 6, 3, 'dwKets', 2); v.rbox(-3, 1, 4, 2, 6, 5, 'dwKets', 2);
  for (const x of [1, 3]) v.paint(x, 2, 4, x, 5, 4, 'dwMerah');
  return v;
}

export const OUTFITS = {
  stan: { name: 'Jaga stan: topi merah SINYAL+ + polo merah kerah putih + kartu nama + celana hitam + sepatu flat + brosur & HP', top: 'stan' },
  pulang: { name: 'Pulang: jaket jins + kaus putih + jins + sepatu kets + tas jinjing kanvas', top: 'pulang' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.stan), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = S(o) ? 'dwMerah' : 'dwJaket', leg = S(o) ? 'dwHitam' : 'dwJins';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'dwSkin', shoulder: sl, elbow: S(o) ? 'dwSkin' : sl, hip: leg, knee: leg }, SKEL, TAIL);
}
