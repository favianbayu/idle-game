// Mas Cilok: penjual cilok gerobak di gerbang SMA 3 jam 14.00, 20-an, ramah, hafal anak yang suka ngutang
// ("Cilok! Cilok bumbu kacang!"). Kulit sawo matang, rambut belah tengah, kumis tipis. Jualan: topi kuning terbalik + kaus
// kuning CILOK bergambar bola-bola + handuk kecil di bahu + tas pinggang uang + celana jins selutut + sandal jepit + panci
// cilok mengepul + plastik cilok bertusuk. Pulang: hoodie abu + celana jins panjang + kets. Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  coSkin: ['#9a6440', '#aa7048', '#ba7e54', '#c88c60'], coSkinS: ['#966040'], coHair: ['#140f0c', '#1c1612', '#28201a', '#342a22'], coKumis: ['#241c16'],
  coKuning: ['#d8a81a', '#e4b624', '#eec430', '#f6d040'], coKuningS: ['#b0861a'], coCilok: ['#ece2c8'], coKacang: ['#a8581a'],
  coHanduk: ['#e0e6ea', '#eaeef2', '#f2f6f8', '#ffffff'], coHandukS: ['#3a8ac8'],
  coTas: ['#1e1e22', '#26262a', '#303034', '#3a3a3e'], coJins: ['#2e4266', '#384c72', '#42567e', '#4e628a'], coJinsS: ['#22324e'],
  coSandal: ['#d83a3a'], coPanci: ['#a8acb4', '#b8bcc4', '#c8ccd4', '#d8dce2'], coPanciS: ['#787c84'], coUap: ['#eef2f6'],
  coPlastik: ['#e8f0f4'], coTusuk: ['#d8b878'],
  coHoodie: ['#6a6e74', '#767a80', '#82868c', '#8e9298'], coHoodieS: ['#55595e'], coKets: ['#e6e6e8', '#eeeef0', '#f6f6f8', '#ffffff'], coSol: ['#3a3a3e'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'coSkinS', k: 'coKumis' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, '.....kkkk.....', ...mouth, F0, F0, F0];   // alis z 11, kumis z 5, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....m....m....', '.....mmmm.....']),   // senyum dagang
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['....m....m....', '.....mmmm.....']),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', '...m......m...']),
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....']),   // "Cilok!"
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....']),
};
export const EXPRS = Object.keys(FACES);

const J = o => o.top === 'jualan';
const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'coSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'coSkin'); v.set(7, -1, 5, 'coSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'coSkin'); v.box(-1, y, 6, -1, y, 7, 'coSkinS'); }
  const hair = new Vox();   // belah tengah, poni tirai jatuh ke kanan-kiri dahi
  for (let z = 6; z <= 16; z++) hair.rrect(z, -8, -8, 7, 7, 'coHair', 4);
  hair.rrect(17, -6, -6, 5, 5, 'coHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 6)) v.set(x, y, z, c); });
  for (let y = -7; y <= 6; y++) { if (y === -1 || y === 0) continue; const low = 12 + Math.min(2, Math.floor(Math.abs(y + 0.5) / 2.5)); for (let z = low; z <= 13; z++) { const x = (v.front(y, z) ?? 6) + 1; if (x <= 8) v.set(x, y, z, 'coHair'); } }
  if (J(o)) {   // topi kuning dipakai terbalik: lidah topi di belakang
    for (let z = 14; z <= 19; z++) v.shell(z, -8, -8, 7, 7, 'coKuning', z >= 18 ? 6 : 5);
    v.rrect(19, -6, -6, 5, 5, 'coKuning', 4); v.rrect(20, -4, -4, 3, 3, 'coKuning', 2);
    for (let y = -6; y <= 5; y++) for (let x = -14; x <= -8; x++) if (Math.abs(y + 0.5) <= 6 - (x < -12 ? 1 : 0)) v.set(x, y, 14, 'coKuningS');
    v.set(0, -1, 21, 'coKuningS'); v.set(0, 0, 21, 'coKuningS');
  }
  return v;
}

function chest(o) {
  const v = new Vox(), c = J(o) ? 'coKuning' : 'coHoodie', s = J(o) ? 'coKuningS' : 'coHoodieS', g = J(o) ? 0 : 1;
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -6 - g, -9 + w + t - g, 5 - t + g, 8 - w - t + g, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'coSkin', 2);
  if (J(o)) {
    for (let y = -2; y <= 1; y++) v.pf(y, 56, 'coSkin'); v.shell(57, -4, -5, 3, 4, s, 2);
    for (const [y, z, k] of [[-3, 46, 'coCilok'], [-1, 47, 'coCilok'], [1, 46, 'coCilok'], [3, 47, 'coCilok'], [-2, 44, 'coCilok'], [0, 45, 'coCilok'], [2, 44, 'coCilok'], [-1, 42, 'coKacang'], [0, 42, 'coKacang'], [1, 42, 'coKacang']]) v.pfBox(y, z, y + 1, z, k);   // sablon bola-bola cilok
    for (let z = 40; z <= 49; z++) v.pf(0, z, 'coTusuk');   // tusuk sate di tengah sablon
    // handuk kecil putih bergaris biru di bahu kiri
    for (let x = -7; x <= 6; x++) for (let z = 56; z <= 57; z++) { if (!v.has(x, -6, z)) v.set(x, -6, z, x % 4 === 0 ? 'coHandukS' : 'coHanduk'); if (!v.has(x, -7, z - 1)) v.set(x, -7, z - 1, x % 4 === 0 ? 'coHandukS' : 'coHanduk'); }
    for (let z = 46; z <= 55; z++) { v.set(6, -8, z, 'coHanduk'); v.set(-7, -8, z, 'coHanduk'); }
    v.set(6, -8, 48, 'coHandukS'); v.set(-7, -8, 48, 'coHandukS');
  } else {   // hoodie: tudung di punggung, tali, kantong kanguru
    for (let z = 52; z <= 59; z++) for (let y = -6; y <= 5; y++) { const x = v.back(y, z); if (x !== null && Math.abs(y + 0.5) <= 6 - (z >= 58 ? 2 : 0)) v.set(x - 1, y, z, s); }
    for (let z = 48; z <= 55; z++) { v.pf(-2, z, 'coKets'); v.pf(1, z, 'coKets'); }
    for (let z = 36; z <= 42; z++) for (let y = -5; y <= 4; y++) { const x = v.front(y, z); if (x !== null && (z === 42 || Math.abs(y + 0.5) >= 4.5 - (42 - z) * 0.2)) v.set(x + 1, y, z, s); }
  }
  return v;
}
function pelvis(o) {
  const v = new Vox();
  v.rbox(-5, -8, 28, 4, 7, 33, 'coJins', 3); v.box(-4, -2, 26, 3, 1, 27, 'coJins');
  if (J(o)) {   // ujung kaus + tas pinggang hitam di depan
    for (let z = 31; z <= 34; z++) v.shell(z, -7, -10, 6, 9, 'coKuning', 3);
    v.rbox(4, -5, 27, 7, 4, 32, 'coTas', 1); for (let y = -4; y <= 3; y++) v.set(7, y, 30, 'coSol');
    for (let y = -9; y <= 8; y++) { const x = v.back(y, 31); if (x !== null) v.set(x - 1, y, 31, 'coTas'); }
  } else for (let z = 30; z <= 34; z++) v.shell(z, -8, -11, 7, 10, z === 30 ? 'coHoodieS' : 'coHoodie', 3);
  return v;
}
function arm(o) {
  const v = new Vox(), c = J(o) ? 'coKuning' : 'coHoodie';
  if (J(o)) { v.rbox(-3, 8, 43, 2, 13, 55, 'coSkin', 2); v.rrect(56, -3, 8, 2, 13, c, 3); v.paint(-3, 8, 49, 2, 13, 56, c); v.paint(-3, 8, 49, 2, 13, 49, 'coKuningS'); }
  else { v.rbox(-4, 7, 43, 3, 14, 55, c, 2); v.rrect(56, -4, 7, 3, 14, c, 3); }
  return v;
}
function fore(o, side) {
  const v = new Vox();
  if (J(o)) v.rbox(-3, 8, 31, 2, 13, 42, 'coSkin', 2);
  else { v.rbox(-4, 7, 31, 3, 14, 42, 'coHoodie', 2); v.paint(-4, 7, 31, 3, 14, 33, 'coHoodieS'); }
  v.rbox(-3, 8, 27, 3, 13, 30, 'coSkin', 2); v.rrect(26, -2, 9, 2, 12, 'coSkin', 2);
  if (J(o) && side < 0) {   // panci cilok aluminium bertutup, uap mengepul
    for (let z = 14; z <= 24; z++) { const r = z === 14 ? 4 : 5; for (let x = 4 - r; x <= 4 + r; x++) for (let y = 10 - r; y <= 10 + r; y++) if ((x - 4) ** 2 + (y - 10) ** 2 <= r * r + 1) v.set(x, y, z, z === 24 ? 'coPanciS' : 'coPanci'); }
    for (let x = 1; x <= 7; x++) for (let y = 7; y <= 13; y++) if ((x - 4) ** 2 + (y - 10) ** 2 <= 10) v.set(x, y, 25, 'coPanci');
    v.box(4, 9, 26, 4, 11, 26, 'coPanciS');
    for (const [x, y, z] of [[2, 8, 28], [3, 9, 30], [5, 11, 29], [6, 12, 31], [4, 10, 32]]) v.set(x, y, z, 'coUap');
  }
  if (J(o) && side > 0) {   // plastik cilok berbumbu kacang + tusuk
    v.rbox(3, 9, 20, 6, 12, 26, 'coPlastik', 1);
    for (const [x, y, z] of [[4, 10, 22], [5, 11, 23], [4, 11, 24], [5, 10, 21]]) v.set(x + 2, y, z, 'coCilok');
    v.box(7, 9, 22, 7, 12, 22, 'coKacang');
    for (let z = 26; z <= 31; z++) v.set(5, 10, z, 'coTusuk');
  }
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-4, 2, 18, 3, 8, 31, 'coJins', 3); v.rrect(32, -3, 2, 2, 8, 'coJins', 3); return v; }
function shin(o) {
  const v = new Vox();
  if (J(o)) { v.rbox(-4, 2, 6, 3, 8, 18, 'coSkin', 3); v.rrect(19, -3, 2, 2, 8, 'coSkin', 3); v.shell(17, -5, 1, 4, 9, 'coJinsS', 3); v.shell(18, -5, 1, 4, 9, 'coJins', 3); v.paint(-4, 2, 18, 3, 8, 19, 'coJins'); return v; }   // jins selutut
  v.rbox(-4, 2, 6, 3, 8, 18, 'coJins', 3); v.rrect(19, -3, 2, 2, 8, 'coJins', 3); for (let z = 7; z <= 18; z++) v.pf(5, z, 'coJinsS');
  return v;
}
function foot(o) {
  const v = new Vox();
  if (J(o)) {
    v.rbox(-4, 1, 0, 7, 8, 0, 'coSandal', 3); v.rbox(-3, 2, 1, 6, 7, 2, 'coSkin', 3); v.rbox(-3, 2, 3, 2, 7, 6, 'coSkin', 3);
    for (const [x, y] of [[5, 5], [4, 4], [4, 6], [3, 3], [3, 7]]) v.set(x, y, 2, 'coSandal');
    return v;
  }
  v.rbox(-4, 1, 0, 7, 8, 1, 'coSol', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'coKets', 3); v.rbox(-4, 1, 5, 3, 8, 6, 'coKets', 3);
  return v;
}

export const OUTFITS = {
  jualan: { name: 'Jualan: topi kuning terbalik + kaus kuning sablon cilok + handuk di bahu + tas pinggang + jins selutut + sandal jepit + panci cilok + plastik cilok', top: 'jualan' },
  pulang: { name: 'Pulang: hoodie abu + jins panjang + kets putih', top: 'pulang' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.jualan), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), j = J(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'coSkin', shoulder: j ? 'coKuning' : 'coHoodie', elbow: j ? 'coSkin' : 'coHoodie', hip: 'coJins', knee: j ? 'coSkin' : 'coJins' }, SKEL, TAIL);
}
