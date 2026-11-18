// Mas Ilham: ojek online yang keliling Pusat Kota, 20-an akhir, ramah tapi sering ngeluh orderan sepi ("Orderan sepi, Bro.").
// Kulit sawo matang, rambut ikal pendek, kumis-jenggot tipis. Narik: helm hijau berkaca + jaket hijau OJEK KITA dengan
// logo panah di punggung + celana jins + sepatu kets + HP di tangan. Ngetem: helm ditenteng, jaket dibuka di atas kaus
// hitam + es teh plastik. Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  ihSkin: ['#94603a', '#a66e44', '#b87e50', '#c88e5e'], ihSkinS: ['#9a643c'], ihHair: ['#120e0c', '#1a1512', '#241e1a', '#302824'], ihJenggot: ['#2a221c'],
  ihHijau: ['#14884a', '#1a9a56', '#22ac62', '#2ebe70'], ihHijauS: ['#0e6a38'], ihLogo: ['#f4f6f2'], ihKaca: ['#2a3a40'], ihKacaT: ['#7ab8c8'],
  ihKaus: ['#1e1e22', '#26262a', '#303034', '#3a3a40'], ihJins: ['#2e4266', '#384c72', '#42567e', '#4e628a'], ihJinsS: ['#22324e'],
  ihKets: ['#e6e6e8', '#eeeef0', '#f6f6f8', '#ffffff'], ihSol: ['#3a3a3e'], ihHP: ['#1a1a1e'], ihLayar: ['#3ac87a'],
  ihEsTeh: ['#c87a2a'], ihPlastik: ['#e0ecf0'], ihSedotan: ['#e83a3a'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'ihSkinS', j: 'ihJenggot' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, '.....jjjj.....', ...mouth, '.....jjjj.....', F0, F0];   // alis z 11, kumis z 5, mulut z 4, jenggot z 2
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0]),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', '...m......m...']),   // dibatalin pas udah sampai
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....']),
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....']),
};
export const EXPRS = Object.keys(FACES);

const N = o => o.top === 'narik';
const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'ihSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'ihSkin'); v.set(7, -1, 5, 'ihSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'ihSkin'); v.box(-1, y, 6, -1, y, 7, 'ihSkinS'); }
  const hair = new Vox();   // ikal pendek: permukaan bergelombang
  for (let z = 7; z <= 16; z++) hair.rrect(z, -8, -8, 7, 7, 'ihHair', 4);
  hair.rrect(17, -6, -6, 5, 5, 'ihHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 10 : 7)) v.set(x, y, z, c); });
  for (let x = -7; x <= 6; x += 2) for (let y = -7; y <= 6; y += 2) if ((x + y) % 4 === 0) v.set(x, y, 18, 'ihHair');
  if (N(o)) {   // helm hijau setengah muka dengan kaca bening terangkat
    for (let z = 4; z <= 21; z++) for (let x = -11; x <= 10; x++) for (let y = -11; y <= 10; y++) {
      const d = ((x + 0.5) / 10.2) ** 2 + ((y + 0.5) / 10) ** 2 + (Math.max(0, z - 12) / 9) ** 2;
      if (d <= 1 && d > 0.62 && !(x >= 3 && z <= 13)) v.set(x, y, z, z <= 5 ? 'ihKaus' : (z === 13 && x >= 0) ? 'ihHijauS' : 'ihHijau');
    }
    for (let y = -7; y <= 6; y++) for (let z = 14; z <= 16; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === 16 ? 'ihKaca' : 'ihKacaT'); }
    for (let x = -6; x <= 4; x++) for (const y of [-1, 0]) { const z = 21; if (v.has(x, y, z - 1)) v.set(x, y, z, 'ihLogo'); }
  }
  return v;
}

function chest(o) {
  const v = new Vox(), c = 'ihHijau';
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -6, -9 + w + t, 5 - t, 8 - w - t, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'ihSkin', 2);
  for (let z = 55; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'ihHijauS', 2);   // kerah
  for (let y = -9; y <= 8; y++) for (const z of [35, 36]) { const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf, y, z, 'ihHijauS'); if (xb !== null) v.set(xb, y, z, 'ihHijauS'); }
  if (N(o)) {
    for (let z = 37; z <= 55; z++) v.pf(-1, z, 'ihHijauS');   // ritsleting
    for (const [y, z] of [[4, 50], [5, 50], [6, 50], [5, 51], [5, 49]]) v.pf(y, z, 'ihLogo');   // logo kecil di dada
    // logo panah besar di punggung: lingkaran putih + panah hijau
    for (let z = 40; z <= 52; z++) for (let y = -6; y <= 5; y++) { const r = Math.hypot(y + 0.5, z - 46); const x = v.back(y, z); if (x !== null && r <= 5.6) v.set(x, y, z, r <= 4.4 && Math.abs(z - 46) <= 1 && y >= -3 && y <= 3 ? 'ihHijauS' : r <= 4.4 && ((y === 2 && Math.abs(z - 46) <= 3) || (y === 1 && Math.abs(z - 46) <= 2)) ? 'ihHijauS' : 'ihLogo'); }
  } else {   // jaket dibuka di atas kaus hitam
    for (let z = 37; z <= 55; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x !== null) { v.set(x, y, z, null); v.set(x - 1, y, z, 'ihKaus'); } }
    for (let z = 37; z <= 55; z++) for (const y of [-4, 3]) v.pf(y, z, 'ihHijauS');
  }
  return v;
}
function pelvis(o) {
  const v = new Vox();
  v.rbox(-5, -8, 28, 4, 7, 33, 'ihJins', 3); v.box(-4, -2, 26, 3, 1, 27, 'ihJins');
  for (let z = 30; z <= 34; z++) v.shell(z, -7, -10, 6, 9, z === 30 ? 'ihHijauS' : 'ihHijau', 3);
  if (!N(o)) for (let z = 30; z <= 34; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'ihKaus'); }
  return v;
}
function arm() { const v = new Vox(); v.rbox(-3, 8, 43, 2, 13, 55, 'ihHijau', 2); v.rrect(56, -3, 8, 2, 13, 'ihHijau', 3); v.psBox(1, -3, 50, 2, 51, 'ihLogo'); return v; }
function fore(o, side) {
  const v = new Vox();
  v.rbox(-3, 8, 31, 2, 13, 42, 'ihHijau', 2); v.paint(-3, 8, 31, 2, 13, 33, 'ihHijauS');
  v.rbox(-3, 8, 27, 3, 13, 30, 'ihSkin', 2); v.rrect(26, -2, 9, 2, 12, 'ihSkin', 2);
  if (N(o) && side < 0) { v.box(3, 9, 24, 4, 12, 31, 'ihHP'); v.box(5, 9, 25, 5, 12, 30, 'ihLayar'); }   // HP cek orderan
  if (!N(o) && side < 0) {   // helm ditenteng
    for (let z = 10; z <= 24; z++) for (let x = -8; x <= 8; x++) for (let y = 4; y <= 18; y++) { const d = (x / 8) ** 2 + ((y - 11) / 7.6) ** 2 + ((z - 18) / 8) ** 2; if (d <= 1 && d > 0.6 && !(x >= 4 && z >= 15 && z <= 21)) v.set(x, y, z, z <= 12 ? 'ihKaus' : 'ihHijau'); }
  }
  if (!N(o) && side > 0) {   // es teh plastik bersedotan
    for (let z = 21; z <= 29; z++) v.rrect(z, 3, 9, 6, 12, z >= 27 ? 'ihPlastik' : 'ihEsTeh', 1);
    for (let z = 30; z <= 33; z++) v.set(4, 10, z, 'ihSedotan');
  }
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-4, 2, 18, 3, 8, 31, 'ihJins', 3); v.rrect(32, -3, 2, 2, 8, 'ihJins', 3); return v; }
function shin() { const v = new Vox(); v.rbox(-4, 2, 6, 3, 8, 18, 'ihJins', 3); v.rrect(19, -3, 2, 2, 8, 'ihJins', 3); for (let z = 7; z <= 18; z++) v.pf(5, z, 'ihJinsS'); return v; }
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 1, 'ihSol', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'ihKets', 3); v.rbox(-4, 1, 5, 3, 8, 6, 'ihKets', 3);
  for (const x of [2, 4]) v.paint(x, 3, 4, x, 6, 4, 'ihHijau');
  return v;
}

export const OUTFITS = {
  narik: { name: 'Narik: helm hijau berkaca + jaket hijau OJEK KITA logo panah + jins + kets + HP', top: 'narik' },
  ngetem: { name: 'Ngetem: helm ditenteng + jaket dibuka di atas kaus hitam + es teh plastik', top: 'ngetem' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.narik), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'ihSkin', shoulder: 'ihHijau', elbow: 'ihHijau', hip: 'ihJins', knee: 'ihJins' }, SKEL, TAIL);
}
