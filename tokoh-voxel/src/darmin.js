// Pak Darmin: tukang ojek pangkalan di ujung gang Kenanga, 40-an, santai dan suka ngobrol. Kulit gelap terbakar matahari,
// rambut cepak, kumis tipis, rompi oranye pangkalan bernomor 07 di atas jaket jeans lusuh, helm di tangan kiri, jeans,
// sepatu kets butut, handuk kecil di leher. Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  dmSkin: ['#6e4428', '#82522e', '#966238', '#a87244'], dmSkinS: ['#7a4c2c'], dmHair: ['#141010', '#1c1614', '#26201c', '#322a24'], dmKumis: ['#1c1614'],
  rompiD: ['#d85a14', '#e8681c', '#f27a2a', '#f88e44'], rompiDS: ['#a8440c'], rompiDK: ['#f2f2ee'],
  jinD: ['#3a4a64', '#445676', '#4e6288', '#5e7498'], jinDS: ['#2a364a'], jeansD: ['#2a3448', '#323e56', '#3c4a66', '#4a5a78'], jeansDS: ['#1e2636'],
  ketsD: ['#5a5a5a', '#6a6a6a', '#7a7a7a', '#8c8c8c'], ketsDS: ['#3a3a3a'], helmD: ['#2a2a30', '#36363e', '#44444c', '#56565e'], helmDV: ['#6a8aa0'],
  handukD: ['#e8e2d4', '#f0ece0', '#f6f4ec', '#fcfaf6'], handukDS: ['#c84a3a'],
  kausD: ['#c8b84a', '#d8c858', '#e6d668', '#f0e27c'], kausDS: ['#a89a34'], kausDK: ['#2a5aa8'], pendekD: ['#4a4a40', '#56564a', '#626256', '#727264'],
  rokokD: ['#f2f2ee'], rokokDA: ['#e86a2a'], dmJepit: ['#1a1a1e'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'dmSkinS', k: 'dmKumis' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, '...kkkkkkkk...', ...mouth, F0, F0];   // alis z 11, kumis z 5, mulut z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....mmmmmm....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['....mmmmmm....', F0, F0]),
  marah: F('...BBB..BBB...', EYE, ['....mmmmmm....', '....m....m....', F0]),
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', F0]),   // "Ojek, Dek?"
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'dmSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'dmSkin'); v.set(7, -1, 5, 'dmSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'dmSkin'); v.box(-1, y, 6, -1, y, 7, 'dmSkinS'); }
  const hair = new Vox();   // cepak tipis, garis rambut sedikit mundur
  for (let z = 6; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'dmHair', 4);
  hair.rrect(16, -6, -6, 5, 5, 'dmHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 6)) v.set(x, y, z, c); });
  if (o.rokok) { for (let x = -1; x <= 3; x++) v.set(x, 8, 10, 'rokokD'); v.set(4, 8, 10, 'rokokDA'); }   // rokok terselip di telinga kanan
  return v;
}

const bodyC = o => o.top === 'ojek' ? 'jinD' : 'kausD';
function chest(o) {
  const v = new Vox(), c = bodyC(o);
  for (let z = 34; z <= 56; z++) { const w = z <= 40 ? 1 : z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -9 + w + t, 4 - t, 8 - w - t, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'dmSkin', 2);
  if (o.top === 'ojek') {
    // rompi oranye pangkalan di atas jaket jeans: badan depan & belakang, nomor 07 putih di punggung, lis putih
    for (let z = 35; z <= 54; z++) for (let y = -8; y <= 7; y++) { if (Math.abs(y + 0.5) < 2 && z > 46) continue; const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf + 1, y, z, 'rompiD'); if (xb !== null) v.set(xb - 1, y, z, 'rompiD'); }
    for (let y = -8; y <= 7; y++) for (const z of [40, 41]) { const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf, y, z, 'rompiDK'); if (xb !== null) v.set(xb, y, z, 'rompiDK'); }
    const D = { 0: ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'], 7: ['XXX', '..X', '.X.', '.X.', '.X.'] };
    [[0, 3], [7, -1]].forEach(([n, y0]) => D[n].forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'X') { const x = v.back(y0 - c, 52 - r); if (x !== null) v.set(x, y0 - c, 52 - r, 'rompiDK'); } })));
    for (let z = 35; z <= 54; z++) v.pf(-1, z, 'rompiDS');
    for (let z = 55; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'jinD', 2);   // kerah jaket
  } else {   // santai: kaus kuning bergambar partai biru, rokok di telinga
    for (let y = -2; y <= 1; y++) v.pf(y, 56, 'dmSkin');
    for (const [y, z] of [[-2, 46], [-1, 46], [0, 46], [1, 46], [-1, 47], [0, 47], [-1, 45], [0, 45], [-1, 44], [0, 44]]) v.pf(y, z, 'kausDK');
    v.shell(56, -4, -4, 3, 3, 'kausDS', 2);
  }
  // handuk kecil di leher, ujung menjuntai di dada kanan
  for (let z = 56; z <= 58; z++) for (let y = -6; y <= 5; y++) { if (Math.abs(y + 0.5) < 3.5) continue; const xf = v.front(y, 56), xb = v.back(y, 56); if (xf === null) continue; for (let x = xb - 1; x <= xf + 1; x++) if (!v.has(x, y, z) || z === 58) v.set(x, y, z, 'handukD'); }
  for (let z = 47; z <= 56; z++) for (let y = 3; y <= 5; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === 47 ? 'handukDS' : 'handukD'); }
  return v;
}
const legC = o => o.top === 'ojek' ? 'jeansD' : 'pendekD';
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-5, -8, 28, 4, 7, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'ojek') for (let z = 30; z <= 33; z++) v.shell(z, -6, -9, 5, 8, z === 30 ? 'jinDS' : 'jinD', 3);
  else for (let z = 31; z <= 33; z++) v.shell(z, -6, -9, 5, 8, 'kausD', 3);
  return v;
}
function arm(o) { const v = new Vox(), c = bodyC(o); v.rbox(-3, 8, 43, 2, 13, 55, o.top === 'ojek' ? c : 'dmSkin', 2); v.rrect(56, -3, 8, 2, 13, c, 3); if (o.top !== 'ojek') { v.paint(-3, 8, 49, 2, 13, 56, c); v.shell(49, -4, 7, 3, 14, c, 2); } return v; }
function fore(o, side) {
  const v = new Vox(), J = o.top === 'ojek';
  v.rbox(-3, 8, 31, 2, 13, 42, J ? 'jinD' : 'dmSkin', 2);
  if (J) v.paint(-3, 8, 31, 2, 13, 32, 'jinDS');
  v.rbox(-3, 8, 27, 3, 13, 30, 'dmSkin', 2); v.rrect(26, -2, 9, 2, 12, 'dmSkin', 2);
  if (side < 0 && J) {   // helm half-face dijinjing di tangan kiri (tali di genggaman)
    for (let z = 22; z <= 27; z++) v.set(0, 10, z, 'dmJepit');
    for (let x = -5; x <= 5; x++) for (let y = 4; y <= 16; y++) for (let z = 10; z <= 21; z++) { const d = (x / 5.5) ** 2 + ((y - 10) / 6.5) ** 2 + ((z - 14) / 7.5) ** 2; if (d <= 1 && d > 0.55 && z >= 12) v.set(x, y, z, z <= 13 ? 'helmDV' : 'helmD'); }
  }
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-4, 2, 18, 3, 8, 31, c, 3); v.rrect(32, -3, 2, 2, 8, c, 3); if (o.top === 'ojek') { v.set(4, 6, 22, 'jeansDS'); v.set(4, 5, 23, 'jeansDS'); } return v; }
function shin(o) {
  const c = legC(o), v = new Vox();
  if (o.top !== 'ojek') { v.rbox(-3, 3, 6, 2, 7, 18, 'dmSkin', 2); v.rrect(19, -3, 3, 2, 7, 'dmSkin', 2); return v; }   // celana pendek: betis telanjang
  v.rbox(-4, 2, 6, 3, 8, 18, c, 3); v.rrect(19, -3, 2, 2, 8, c, 3); v.shell(6, -5, 1, 4, 9, 'jeansDS', 3);
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top !== 'ojek') { v.rbox(-4, 1, 0, 7, 8, 0, 'dmJepit', 3); v.rbox(-3, 2, 1, 6, 7, 2, 'dmSkin', 2); v.rbox(-3, 2, 3, 2, 7, 5, 'dmSkin', 2); for (const [x, y] of [[5, 4], [4, 3], [4, 5], [3, 2], [3, 6]]) v.set(x, y, 2, 'dmJepit'); return v; }
  v.rbox(-4, 1, 0, 7, 8, 1, 'ketsDS', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'ketsD', 3); v.rbox(-4, 1, 5, 2, 8, 5, 'ketsD', 3);
  for (const x of [2, 4]) v.paint(x, 3, 4, x, 6, 4, 'ketsDS');
  return v;
}

export const OUTFITS = {
  ojek: { name: 'Mangkal: rompi oranye nomor 07 + jaket jeans + handuk leher + helm di tangan + kets butut', top: 'ojek' },
  santai: { name: 'Sepi orderan: kaus kuning + celana pendek + sandal jepit + rokok di telinga', top: 'santai', rokok: true },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.ojek), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = bodyC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'dmSkin', shoulder: sl, elbow: o.top === 'ojek' ? sl : 'dmSkin', hip: leg, knee: o.top === 'ojek' ? leg : 'dmSkin' }, SKEL, TAIL);
}
