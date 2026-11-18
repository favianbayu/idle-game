// Bu Inah: buruh cuci di Kampung Bantaran, 40-an, galak soal jemuran tapi baik hati ("Jangan lewat jemuran!").
// Kulit sawo matang gelap, badan agak gemuk, rambut digelung asal dengan karet, tangan kuat. Nyuci: daster bunga ungu
// panjang + lengan digulung + baskom merah berisi cucian di pinggang + sikat + sandal jepit. Jemur: handuk dililit di
// kepala + daster yang sama + kemeja basah & jepitan jemuran di tangan. Rangka keluarga Nadia, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8.5, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  inSkin: ['#86522e', '#965e36', '#a66a40', '#b4784a'], inSkinS: ['#80502c'], inBlush: ['#b86a50'],
  inHair: ['#14100e', '#1c1714', '#26201c', '#322a24'], inKaret: ['#e8a020'],
  inDaster: ['#6a3a8a', '#764498', '#824ea6', '#9058b4'], inDasterS: ['#4e2868'], inBunga: ['#f0c8e0'], inDaun: ['#7ac88a'],
  inSandal: ['#d83a6a', '#e4467a', '#ee5486', '#f66494'],
  inBaskom: ['#c82a2a', '#d43434', '#e03e3e', '#ea4c4c'], inBaskomS: ['#a01c1c'], inCucian1: ['#e8e8ea'], inCucian2: ['#4a86c8'], inCucian3: ['#e8c040'], inBusa: ['#f8fafc'],
  inSikat: ['#2a8a5a'], inBulu: ['#e8d8a0'],
  inHanduk: ['#e8a8b8', '#f0b6c4', '#f6c4d0', '#fad2dc'], inHandukS: ['#c8889a'], inKemeja: ['#5a9ad8', '#68a6e0', '#76b2e8', '#86beee'], inJepit: ['#3ac87a'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'inBlush', s: 'inSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0, F0]),
  marah: F('...BBB..BBB...', EYE, ['....mmmmmm....', '...m......m...', F0]),   // ada yang nabrak jemuran
  teriak: F('...BB....BB...', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),   // "Jangan lewat jemuran!"
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....', 'rr..........rr']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', 'rr..........rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),   // pinggang pegal
};
export const EXPRS = Object.keys(FACES);

const N = o => o.top === 'nyuci';
const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z === 2 ? [-6, -7, 6, 6, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];   // pipi tembam
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'inSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'inSkin'); v.set(7, -1, 5, 'inSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'inSkin'); v.box(-1, y, 6, -1, y, 7, 'inSkinS'); }
  const hair = new Vox();
  for (let z = 5; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'inHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -6, -6, 5, 5, 'inHair', 4);
  const zmin = (x, y) => x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 5;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (const [x, y, z] of [[6, -8, 11], [6, 7, 10], [5, 7, 11], [6, -8, 10]]) v.set(x, y, z, 'inHair');   // anak rambut lepas
  if (N(o)) {   // gelung asal di belakang atas + karet kuning, ujung rambut mencuat
    for (let x = -13; x <= -6; x++) for (let y = -5; y <= 4; y++) for (let z = 11; z <= 19; z++) { const d = ((x + 9.5) / 3.6) ** 2 + ((y + 0.5) / 4.2) ** 2 + ((z - 15) / 3.6) ** 2; if (d <= 1 && !v.has(x, y, z)) v.set(x, y, z, 'inHair'); }
    for (let y = -3; y <= 2; y++) for (const [x, z] of [[-7, 12], [-6, 13], [-8, 11]]) if (v.get(x, y, z) === 'inHair' || !v.has(x, y, z)) v.set(x, y, z, 'inKaret');
    v.set(-12, -3, 19, 'inHair'); v.set(-13, 2, 18, 'inHair'); v.set(-11, 0, 20, 'inHair');
  } else {   // handuk pink dililit jadi turban, simpul di depan atas
    for (let z = 10; z <= 21; z++) for (let x = -10; x <= 9; x++) for (let y = -10; y <= 9; y++) {
      const d = ((x + 0.5) / 9.4) ** 2 + ((y + 0.5) / 9.2) ** 2 + (Math.max(0, z - 15) / 6.5) ** 2;
      if (d <= 1 && (d > 0.6 || z >= 20) && !(x >= 3 && z <= 12)) v.set(x, y, z, ((x + z) % 4 === 0 || z === 10) ? 'inHandukS' : 'inHanduk');
    }
    v.rbox(7, -3, 17, 10, 2, 21, 'inHanduk', 2); for (let y = -3; y <= 2; y++) v.set(10, y, 19, 'inHandukS');
  }
  return v;
}

/* ---------- badan: daster bunga panjang */
const bunga = v => { v.each((x, y, z, k) => { if (k !== 'inDaster') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, gy = Math.floor((u + 40) / 4), gz = Math.floor((z + (gy % 2) * 3) / 6), cy = ((u + 40) % 4), cz = ((z + (gy % 2) * 3) % 6 + 6) % 6; if ((gy + gz) % 2 === 0 && cy >= 1 && cy <= 2 && cz >= 2 && cz <= 3) v.set(x, y, z, 'inBunga'); else if ((gy + gz) % 2 === 0 && cy === 3 && cz === 1) v.set(x, y, z, 'inDaun'); }); return v; };
function chest(o) {
  const v = new Vox(), c = 'inDaster';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 0 : 0; v.rrect(z, -6, -7 + t + w, 5 - t, 6 - t - w, c, 3); }   // badan gempal
  v.rbox(-2, -2, 52, 2, 1, 55, 'inSkin', 1);
  for (let y = -3; y <= 2; y++) { v.pf(y, 51, 'inSkin'); v.pf(y, 50, 'inSkin'); }
  for (let y = -4; y <= 3; y++) v.pf(y, 49, 'inDasterS');   // kerah bulat
  for (let z = 40; z <= 48; z++) v.pf(-1, z, 'inDasterS');
  bunga(v);
  return v;
}
function pelvis(o) {
  const v = bunga(skirtPelvis('inDaster', 'inDasterS', 20));
  if (N(o)) {   // baskom merah berisi cucian & busa, ditopang di pinggang kiri
    for (let z = 24; z <= 31; z++) { const r = z <= 25 ? 6 : 8; v.shell(z, -r, -16 - (r - 6), r - 1, -9 + (r - 6) * 0, z === 31 ? 'inBaskomS' : 'inBaskom', 3); }
    v.rrect(24, -6, -16, 5, -9, 'inBaskomS', 3);
    for (let x = -6; x <= 5; x++) for (let y = -17; y <= -10; y++) if (!v.has(x, y, 31)) v.set(x, y, 30, ((x + y) % 5 === 0) ? 'inBusa' : ((x * 2 + y) % 3 === 0) ? 'inCucian2' : ((x + y * 2) % 4 === 0) ? 'inCucian3' : 'inCucian1');
    for (const [x, y] of [[-3, -13], [0, -12], [2, -14], [-1, -15]]) v.set(x, y, 32, 'inBusa');
  }
  return v;
}
function arm() { const v = new Vox(); v.rbox(-2, 6, 40, 3, 11, 50, 'inSkin', 2); v.rrect(51, -2, 6, 3, 11, 'inDaster', 2); v.paint(-2, 6, 46, 3, 11, 51, 'inDaster'); v.shell(46, -3, 5, 4, 12, 'inDasterS', 2); return v; }
function fore(o, side) {
  const v = new Vox();
  v.rbox(-2, 6, 31, 3, 11, 39, 'inSkin', 2);
  v.rbox(-2, 6, 27, 3, 10, 30, 'inSkin', 2); v.rrect(26, -1, 7, 2, 9, 'inSkin', 1);
  if (N(o) && side > 0) { v.rbox(1, 7, 22, 6, 10, 25, 'inSikat', 1); for (let x = 1; x <= 6; x++) for (let y = 7; y <= 10; y++) if ((x + y) % 2) v.set(x, y, 21, 'inBulu'); }   // sikat cuci
  if (!N(o) && side > 0) {   // kemeja basah menjuntai dari tangan, dijepit jepitan hijau
    for (let z = 10; z <= 27; z++) for (let y = 5; y <= 13; y++) v.set(3, y, z, z >= 24 && Math.abs(y - 9) > 2 ? null : (z === 12 || y === 9) ? 'inKemeja' : 'inKemeja');
    for (let z = 10; z <= 23; z++) v.set(4, 9, z, 'inCucian1');
    for (const y of [6, 12]) v.set(4, y, 27, 'inJepit');
  }
  if (!N(o) && side < 0) for (let k = 0; k < 4; k++) v.box(3, 7 + k * 1, 24 + k * 2, 4, 7 + k * 1, 25 + k * 2, 'inJepit');   // jepitan jemuran
  return v;
}
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 6, 6, 0, 'inSandal', 2); v.rbox(-3, 2, 1, 5, 5, 2, 'inSkin', 2); v.rbox(-3, 2, 3, 1, 5, 4, 'inSkin', 2);
  for (const [x, y] of [[4, 4], [3, 3], [3, 5], [2, 2], [2, 6]]) v.set(x, y, 2, 'inSandal');
  return v;
}

export const OUTFITS = {
  nyuci: { name: 'Nyuci: daster bunga ungu + rambut digelung + baskom cucian di pinggang + sikat + sandal jepit', top: 'nyuci' },
  jemur: { name: 'Jemur: handuk dililit di kepala + daster + kemeja basah & jepitan jemuran', top: 'jemur' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.nyuci), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = bunga(skirtThigh('inDaster')), Sn = bunga(skirtShin('inDaster', 'inDasterS')), Ft = foot(o);
  const panel = s => bunga(skirtPanel('inDaster', 'inDasterS', s, 9));
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'inSkin', shoulder: 'inDaster', elbow: 'inSkin', hip: 'inDaster', knee: 'inDaster' }, SKEL, TAIL);
  P.skirt = skirtInfo(P, 'inDaster', 'inDasterS');
  return P;
}
