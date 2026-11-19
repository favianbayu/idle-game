// Pak Satpam Bambang: satpam pos gerbang Perumahan Bukit Asri, 40-an, tegas tapi baik ("Mau ke rumah siapa, Dek? Tulis di
// buku tamu."). Gempal, kulit sawo matang, kumis tebal melintang, topi pet satpam biru dongker. Kemeja putih lengan pendek
// dengan pangkat bahu & badge, celana biru dongker, sabuk kopel, pentungan & HT di pinggang, sepatu PDL mengilap.
// Ronda malam: jaket hitam tulisan SECURITY kuning di punggung + senter. Rangka keluarga Arga berperut, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 7, ballR: 1.05 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  bbSkin: ['#8a5634', '#9e663e', '#b0764a', '#c08658'], bbSkinS: ['#94603a'], bbHair: ['#0e0c0a', '#161210', '#201a16', '#2c241e'], bbKumis: ['#120e0c'],
  bbKemeja: ['#d8dade', '#e6e8ec', '#f2f3f6', '#fbfbfd'], bbKemejaS: ['#b8bcc4'],
  bbDongker: ['#141c32', '#1a243e', '#222e4c', '#2c3a5e'], bbDongkerS: ['#0c1222'], bbEmas: ['#c8a030', '#d8b03c', '#e6c04c', '#f2d060'], bbMerah: ['#c82a2a'],
  bbKopel: ['#101012', '#18181c', '#222226', '#2e2e34'], bbGesper: ['#d8dce4'], bbPentung: ['#1a1a1e', '#222226', '#2c2c32', '#3a3a40'],
  bbHt: ['#1e1e22', '#28282c', '#323238', '#3e3e46'], bbHtL: ['#e84a2a'], bbSepatu: ['#0c0c0e', '#141416', '#1e1e22', '#2e2e36'],
  bbJaket: ['#16161a', '#1e1e22', '#28282e', '#34343c'], bbJaketS: ['#0e0e10'], bbKuning: ['#f2c230'],
  bbSenter: ['#2a2a30', '#36363e', '#44444c', '#56565e'], bbSenterL: ['#fff0a0'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'bbSkinS', k: 'bbKumis' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, '...kkkkkkkk...', '..kkk....kkk..', ...mouth, F0, F0];   // alis z 11, kumis tebal z 6..5, mulut z 4
const BROW = '.BBBBB..BBBBB.';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....mmmmmm....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['....mmmmmm....', F0, F0]),
  marah: F('...BBBBBBBB...', EYE, ['....mmmmmm....', '...m......m...', F0]),   // "Berhenti! Mau ke mana?"
  teriak: F('..BBBB..BBBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-4, -6, 5, 5, 3] : z === 1 ? [-6, -7, 6, 6, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'bbSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 7, 'bbSkin'); v.box(8, -1, 6, 8, 0, 6, 'bbSkin'); v.set(7, -1, 6, 'bbSkinS');   // hidung besar
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'bbSkin'); v.box(-1, y, 6, -1, y, 7, 'bbSkinS'); }
  const hair = new Vox();   // cepak tentara, samping tipis
  for (let z = 6; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'bbHair', 4);
  hair.rrect(16, -6, -6, 5, 5, 'bbHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 10 : 7)) v.set(x, y, z, c); });
  if (o.topi) {   // topi pet satpam: badan silinder dongker, pita emas, lambang di depan, pet hitam mengilap
    for (let z = 13; z <= 19; z++) for (let x = -9; x <= 9; x++) for (let y = -9; y <= 8; y++) {
      const r = z >= 18 ? 1.08 : 1, d = ((x + 0.5) / (8.7 * r)) ** 2 + ((y + 0.5) / (8.5 * r)) ** 2;
      if (d <= 1 && (d > 0.6 || z >= 19)) v.set(x, y, z, z === 14 ? 'bbEmas' : 'bbDongker');
    }
    for (let x = 7; x <= 12; x++) for (let y = -7; y <= 6; y++) if (Math.abs(y + 0.5) <= 7 - Math.max(0, x - 10) * 2) v.set(x, y, 13, 'bbKopel');   // pet
    for (const [y, z] of [[-1, 16], [0, 16], [-1, 17], [0, 17], [-2, 16], [1, 16]]) { const x = v.front(y, z); v.set(x + 1, y, z, 'bbEmas'); }
  }
  return v;
}

const bodyC = o => o.top === 'jaga' ? 'bbKemeja' : 'bbJaket';
function chest(o) {
  const v = new Vox(), c = bodyC(o);
  for (let z = 34; z <= 56; z++) { const bel = z > 50 ? 0 : Math.round(3 * Math.sin((z - 31) / 20 * Math.PI)), t = z === 56 ? 1 : 0; v.rrect(z, -6, -9 + t, 4 + bel - t, 8 - t, c, 4); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'bbSkin', 2);
  if (o.top === 'jaga') {
    for (let z = 35; z <= 55; z++) v.pf(-1, z, 'bbKemejaS');
    for (const z of [38, 43, 48, 53]) v.pf(-1, z, 'bbKemejaS');
    for (let z = 56; z <= 58; z++) v.shell(z, -4, -5, 3, 4, z === 58 ? 'bbKemejaS' : 'bbKemeja', 2);   // kerah
    for (let y = -2; y <= 1; y++) v.pf(y, 56, 'bbSkin');
    v.pfBox(2, 49, 6, 50, 'bbDongker'); v.pf(4, 51, 'bbEmas'); v.pf(-5, 50, 'bbEmas'); v.pf(-4, 50, 'bbEmas'); v.pf(-6, 50, 'bbEmas');   // papan nama & lencana
    v.pfBox(-6, 44, -3, 47, 'bbKemejaS');   // saku kiri
  } else {   // jaket ronda: ritsleting depan, tulisan SECURITY kuning di punggung
    for (let z = 35; z <= 55; z++) v.pf(-1, z, 'bbJaketS');
    for (let z = 56; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'bbJaket', 2);
    const L = { S: ['XXX', 'X..', 'XXX', '..X', 'XXX'], E: ['XXX', 'X..', 'XX.', 'X..', 'XXX'], C: ['XXX', 'X..', 'X..', 'X..', 'XXX'] };
    ['S', 'E', 'C'].forEach((ch, i) => L[ch].forEach((row, r) => [...row].forEach((cc, k) => { if (cc === 'X') { const y = 7 - i * 5 - k, z = 52 - r, x = v.back(y, z); if (x !== null) v.set(x, y, z, 'bbKuning'); } })));
    for (let y = -8; y <= 7; y++) { const x = v.back(y, 45); if (x !== null) v.set(x, y, 45, 'bbKuning'); }
  }
  return v;
}
function pelvis(o) {
  const v = new Vox();
  v.rbox(-6, -8, 28, 5, 7, 33, 'bbDongker', 3); v.box(-4, -2, 26, 3, 1, 27, 'bbDongker');
  v.shell(33, -7, -9, 6, 8, 'bbKopel', 3);
  for (const y of [-1, 0]) { const x = v.front(y, 33); v.set(x, y, 33, 'bbGesper'); }
  if (o.top === 'jaga') {
    for (let z = 22; z <= 33; z++) v.set(-2, 9, z, 'bbPentung'); v.box(-3, 9, 31, -1, 9, 33, 'bbKopel');   // pentungan di pinggang kiri (kanan layar)
    v.rbox(-4, -11, 28, -1, -9, 34, 'bbHt', 1); v.set(-3, -10, 35, 'bbHt'); v.set(-3, -10, 36, 'bbHt'); v.set(-1, -10, 34, 'bbHtL');   // HT di pinggang kanan
  } else for (let z = 30; z <= 33; z++) v.shell(z, -7, -10, 6, 9, z === 30 ? 'bbJaketS' : 'bbJaket', 4);
  return v;
}
function arm(o) { const v = new Vox(), c = bodyC(o); v.rbox(-3, 8, 43, 3, 14, 55, c, 3); v.rrect(56, -3, 8, 3, 14, c, 3); if (o.top === 'jaga') { v.box(-2, 9, 56, 2, 12, 57, 'bbDongker'); v.set(0, 10, 57, 'bbEmas'); v.set(0, 11, 57, 'bbEmas'); v.shell(48, -4, 7, 4, 15, 'bbKemejaS', 3); v.psBox(1, -1, 50, 1, 53, 'bbDongker'); v.set(0, v.sideP(0, 51), 51, 'bbEmas'); } return v; }
function fore(o, side) {
  const v = new Vox(), J = o.top === 'jaga';
  v.rbox(-3, 8, 31, 3, 14, 42, J ? 'bbSkin' : 'bbJaket', 3);
  if (!J) v.paint(-3, 8, 31, 3, 14, 31, 'bbJaketS');
  v.rbox(-3, 8, 27, 4, 14, 30, 'bbSkin', 3); v.rrect(26, -2, 9, 3, 13, 'bbSkin', 2);
  if (side < 0 && J) v.paint(-3, 8, 31, 3, 14, 32, 'bbKopel');   // jam tangan hitam
  if (side > 0 && !J) {   // senter panjang menyala ke depan
    v.rbox(-2, 9, 27, 12, 12, 29, 'bbSenter', 1); v.rbox(13, 8, 26, 14, 13, 30, 'bbSenter', 1); v.box(15, 9, 27, 15, 12, 29, 'bbSenterL');
  }
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-5, 2, 18, 4, 8, 31, 'bbDongker', 3); v.rrect(32, -4, 2, 3, 8, 'bbDongker', 3); return v; }
function shin() {
  const v = new Vox();
  v.rbox(-4, 2, 8, 3, 7, 18, 'bbDongker', 3); v.rrect(19, -3, 2, 2, 7, 'bbDongker', 3);
  return v;
}
function foot() {   // sepatu PDL tinggi semata kaki, mengilap
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 1, 'bbSepatu', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'bbSepatu', 3); v.rbox(-4, 1, 5, 3, 8, 9, 'bbSepatu', 3);
  v.set(6, 4, 3, 'bbGesper');
  return v;
}

export const OUTFITS = {
  jaga: { name: 'Jaga gerbang: topi pet + kemeja putih berpangkat + celana dongker + kopel + pentungan & HT + sepatu PDL', top: 'jaga', topi: true },
  ronda: { name: 'Patroli malam: jaket hitam SECURITY + topi pet + senter', top: 'ronda', topi: true },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.jaga), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = bodyC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'bbSkin', shoulder: sl, elbow: o.top === 'jaga' ? 'bbSkin' : sl, hip: 'bbDongker', knee: 'bbDongker' }, SKEL, TAIL);
}
