// Kak Nana: kasir minimarket SERBAMART di Pusat Kota, 20-an awal, cekatan, hafal kalimat wajib kasir
// ("Ada tambahan pulsa? Poinnya?"). Kulit kuning langsat, rambut bob sebahu berponi rata, jepit kuning, pipi tembam.
// Jaga kasir: kemeja seragam biru muda + rompi merah SERBAMART + papan nama + celana hitam + sepatu hitam + pemindai barcode.
// Pulang: hoodie abu + celana jogger + sepatu kets + kantong belanja. Rangka keluarga Nadia, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  nnSkin: ['#d09a70', '#dcaa80', '#e6b890', '#f0c8a0'], nnSkinS: ['#cc9670'], nnBlush: ['#ec9a8a'],
  nnHair: ['#2a1a12', '#341f16', '#40281c', '#4c3022'], nnHairT: ['#5a3a28'], nnJepit: ['#f2c230'],
  nnKemeja: ['#8ab8e0', '#98c4e8', '#a8d0ee', '#b8dcf4'], nnRompi: ['#c8222c', '#d42c34', '#e0363e', '#ea444a'], nnRompiS: ['#a01820'], nnLogo: ['#f4f4f6'],
  nnHitam: ['#16161a', '#1e1e22', '#28282e', '#34343a'], nnPapan: ['#f2f2f4'],
  nnScan: ['#d8a818', '#e6b822', '#f0c830', '#f8d848'], nnScanS: ['#2a2a30'], nnLaser: ['#e82a2a'],
  nnHoodie: ['#7a7a80', '#86868c', '#929298', '#a0a0a6'], nnHoodieS: ['#5e5e64'], nnJogger: ['#2a2e3a', '#323644', '#3a3e4e', '#444858'],
  nnKets: ['#e8e8ea', '#f2f2f4', '#f8f8fa', '#ffffff'], nnSol: ['#c8c8cc'], nnKantong: ['#f0f0ee'], nnKantongS: ['#d82c36'], nnRoti: ['#d8a050'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'nnBlush', s: 'nnSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', 'rr..........rr', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', 'rr..........rr', F0]),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', F0, F0]),   // antrean panjang, mesin EDC error
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),   // "Selamat datang di SERBAMART!"
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....', 'rr..........rr']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', 'rr..........rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const K = o => o.top === 'kasir';
const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];   // pipi tembam
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'nnSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'nnSkin'); v.set(7, -1, 5, 'nnSkinS');
  // bob sebahu: cangkang membulat, ujung bawah sedikit melengkung ke dalam, poni rata di atas alis
  const hair = new Vox();
  for (let z = -1; z <= 15; z++) hair.rrect(z, -9, -9 - (z <= 3 ? 0 : 0), 7, 8, 'nnHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -7, -7, 6, 6, 'nnHair', 4); hair.rrect(17, -5, -5, 4, 4, 'nnHair', 3);
  const zmin = (x, y) => x >= 5 ? 12 : Math.abs(y + 0.5) > 6.5 ? (x >= 4 ? 4 : -1) : x <= -6 ? -1 : 13;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, z === -1 ? 'nnHairT' : c); });
  for (let y = -7; y <= 6; y++) for (const z of [12, 13]) { const x = v.front(y, z); if (x !== null && v.get(x, y, z) === 'nnSkin') v.set(x + 1, y, z, 'nnHair'); }   // poni rata
  for (let y = -7; y <= 6; y++) { const x = v.front(y, 14); if (x !== null) v.set(x + 1, y, 14, 'nnHair'); }
  for (const [x, z] of [[2, 12], [3, 12], [1, 12]]) { const y = v.sideP(x, z); if (y !== null) v.set(x, y + 1, z, 'nnJepit'); }   // jepit kuning di samping
  return v;
}

function chest(o) {
  const v = new Vox(), c = K(o) ? 'nnKemeja' : 'nnHoodie';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -5, -7 + t + w, 4 - t, 6 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'nnSkin', 1);
  if (K(o)) {
    for (let z = 50; z <= 52; z++) v.shell(z, -3, -4, 3, 3, 'nnKemeja', 2);
    for (let y = -1; y <= 0; y++) for (let z = 50; z <= 52; z++) v.pf(y, z, 'nnSkin');
    // rompi merah: lapis luar, terbuka di tengah memperlihatkan kemeja
    for (let z = 32; z <= 50; z++) { const t = 0, w = z >= 37 && z <= 41 ? 1 : 0; v.shell(z, -6, -8 + w, 5, 7 - w, 'nnRompi', 3); }
    for (let z = 33; z <= 50; z++) for (let y = -2; y <= 1; y++) { const x = v.front(y, z); if (x !== null && v.get(x, y, z) === 'nnRompi') v.set(x, y, z, null); }
    for (let z = 33; z <= 50; z++) for (const y of [-3, 2]) v.pf(y, z, 'nnRompiS');
    v.pfBox(3, 45, 5, 46, 'nnPapan'); v.pf(4, 45, 'nnHitam');   // papan nama
    // tulisan SERBAMART disingkat jadi logo S putih di punggung
    for (const [r, row] of ['XXXX', 'X...', 'XXXX', '...X', 'XXXX'].entries()) [...row].forEach((ch, k) => { if (ch === 'X') { const y = 1 - k, z = 46 - r, x = v.back(y, z); if (x !== null) v.set(x, y, z, 'nnLogo'); } });
  } else {
    for (let z = 33; z <= 50; z++) v.pf(-1, z, 'nnHoodieS');
    for (let z = 36; z <= 40; z++) for (let y = -4; y <= 3; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === 40 ? 'nnHoodieS' : 'nnHoodie'); }   // saku kanguru
    // tudung di punggung
    for (let z = 45; z <= 54; z++) for (let y = -6; y <= 5; y++) { const x = v.back(y, z); if (x !== null && Math.abs(y + 0.5) <= 6 - Math.max(0, 47 - z)) v.set(x - 1, y, z, z === 54 || Math.abs(y + 0.5) > 4.5 ? 'nnHoodieS' : 'nnHoodie'); }
    for (const y of [-2, 1]) for (let z = 44; z <= 49; z++) v.pf(y, z, 'nnLogo');   // tali tudung
  }
  return v;
}
function pelvis(o) {
  const c = K(o) ? 'nnHitam' : 'nnJogger', v = new Vox();
  v.rbox(-4, -6, 26, 4, 5, 33, c, 3); v.box(-3, -2, 24, 2, 1, 25, c);
  for (let z = 29; z <= 33; z++) v.shell(z, -6, -8, 5, 7, K(o) ? (z === 29 ? 'nnRompiS' : 'nnRompi') : (z === 29 ? 'nnHoodieS' : 'nnHoodie'), 3);
  return v;
}
function arm(o) {
  const v = new Vox(), c = K(o) ? 'nnKemeja' : 'nnHoodie';
  v.rbox(-2, 6, 40, 2, 10, 50, K(o) ? 'nnSkin' : c, 2); v.rrect(51, -2, 6, 2, 10, c, 2);
  if (K(o)) { v.paint(-2, 6, 45, 2, 10, 51, c); v.shell(45, -3, 5, 3, 11, 'nnKemeja', 2); }
  return v;
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-2, 6, 31, 2, 10, 39, K(o) ? 'nnSkin' : 'nnHoodie', 2);
  if (!K(o)) v.paint(-2, 6, 31, 2, 10, 32, 'nnHoodieS');
  v.rbox(-2, 6, 27, 3, 10, 30, 'nnSkin', 2); v.rrect(26, -1, 7, 2, 9, 'nnSkin', 1);
  if (K(o) && side > 0) {   // pemindai barcode genggam, sinar merah
    v.rbox(0, 7, 23, 2, 9, 28, 'nnScanS', 1); v.rbox(0, 6, 29, 5, 10, 32, 'nnScan', 1); v.box(6, 7, 30, 6, 9, 31, 'nnLaser');
  }
  if (!K(o) && side < 0) {   // kantong belanja putih bergaris merah, roti menyembul
    for (let z = 12; z <= 24; z++) v.rrect(z, -4, 9, 4, 13, z === 20 ? 'nnKantongS' : 'nnKantong', 1);
    v.rbox(-2, 10, 25, 1, 12, 27, 'nnRoti', 1);
    for (let z = 25; z <= 28; z++) { v.set(-3, 10, z, 'nnKantong'); v.set(3, 10, z, 'nnKantong'); }
  }
  return v;
}
function thigh(o) { const v = new Vox(), c = K(o) ? 'nnHitam' : 'nnJogger'; v.rbox(-3, 1, 17, 2, 6, 30, c, 2); v.rrect(31, -2, 2, 1, 5, c, 2); return v; }
function shin(o) {
  const v = new Vox(), c = K(o) ? 'nnHitam' : 'nnJogger';
  v.rbox(-3, 1, 6, 2, 6, 17, c, 2); v.rrect(18, -2, 2, 1, 5, c, 2);
  if (!K(o)) { v.shell(6, -4, 0, 3, 7, 'nnHoodieS', 2); for (let z = 7; z <= 17; z++) v.set(0, 6, z, 'nnLogo'); }   // manset jogger + garis samping
  return v;
}
function foot(o) {
  const v = new Vox();
  if (K(o)) { v.rbox(-4, 1, 0, 6, 6, 3, 'nnHitam', 2); v.rbox(-3, 2, 4, 2, 5, 5, 'nnHitam', 2); return v; }
  v.rbox(-4, 1, 0, 6, 6, 1, 'nnSol', 2); v.rbox(-4, 1, 2, 6, 6, 3, 'nnKets', 2); v.rbox(-3, 1, 4, 2, 6, 5, 'nnKets', 2);
  for (const x of [1, 3]) v.paint(x, 2, 4, x, 5, 4, 'nnRompi');
  return v;
}

export const OUTFITS = {
  kasir: { name: 'Jaga kasir: kemeja biru muda + rompi merah SERBAMART + papan nama + celana hitam + pemindai barcode', top: 'kasir' },
  pulang: { name: 'Pulang: hoodie abu + jogger + sepatu kets + kantong belanja', top: 'pulang', propOn: 'all' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.kasir), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = K(o) ? 'nnKemeja' : 'nnHoodie', leg = K(o) ? 'nnHitam' : 'nnJogger';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'nnSkin', shoulder: sl, elbow: K(o) ? 'nnSkin' : sl, hip: leg, knee: leg }, SKEL, TAIL);
}
