// Kurir Bayu: kurir paket yang keliling Bukit Asri dan kota, 20-an, buru-buru tapi ramah ("Paket! Paket!"). Kulit sawo
// matang, rambut pendek tertutup topi, plester di dagu. Antar: topi oranye + jaket kurir oranye-hitam tulisan KILAT di
// punggung + tas selempang + kardus paket + celana kargo + sepatu. Istirahat: kaus hitam + topi + HP di tangan.
// Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  krbSkin: ['#9a6640', '#ae764c', '#c08658', '#d09866'], krbSkinS: ['#a87048'], krbHair: ['#0e0c0a', '#161210', '#201a16', '#2c241e'], krbPlester: ['#e8c89a'],
  krbOren: ['#d8601a', '#e86e22', '#f27e30', '#f89244'], krbOrenS: ['#a8460e'], krbHitam: ['#16161a', '#1e1e22', '#28282e', '#34343c'], krbHitamS: ['#0c0c0e'], krbPutih: ['#f2f2ee'],
  krbKargo: ['#4a4e3a', '#565a44', '#62664e', '#70745a'], krbKargoS: ['#363a2a'], krbSepatu: ['#1a1a1e', '#24242a', '#2e2e36', '#3a3a44'], krbSol: ['#d8d8d4'],
  krbKardus: ['#a87a44', '#b88a50', '#c89a5e', '#d6aa6e'], krbKardusS: ['#8a6030'], krbLakban: ['#c8b890'], krbLabel: ['#f4f2ea'],
  krbTas: ['#2a2a30', '#34343a', '#3e3e46', '#4a4a54'], krbHp: ['#1a1a20'], krbLayar: ['#7ac8f0'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'krbSkinS', p: 'krbPlester' };
const F0 = '..............';
const F = (brow, eyes, mouth, chin = F0) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...[...mouth, F0, F0].slice(0, 3), chin, F0];   // alis z 11, mulut z 4, plester z 1
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
const P = '.........pp...';
export const FACES = {
  biasa: F(BROW, EYE, ['....m....m....', '.....mmmm.....'], P),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['....m....m....', '.....mmmm.....'], P),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', F0], P),
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....'], P),   // "Paket! Paket!"
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....'], P),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....'], P),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....'], P),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'krbSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'krbSkin'); v.set(7, -1, 5, 'krbSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'krbSkin'); v.box(-1, y, 6, -1, y, 7, 'krbSkinS'); }
  const hair = new Vox();
  for (let z = 6; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'krbHair', 4);
  hair.rrect(16, -6, -6, 5, 5, 'krbHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 6)) v.set(x, y, z, c); });
  // topi baseball: kubah warna, pet ke depan sedikit miring
  const cap = o.top === 'antar' ? 'krbOren' : 'krbHitam';
  for (let z = 14; z <= 19; z++) for (let x = -9; x <= 8; x++) for (let y = -9; y <= 8; y++) {
    const d = ((x + 0.5) / 8.7) ** 2 + ((y + 0.5) / 8.6) ** 2 + (Math.max(0, z - 15) / 5) ** 2;
    if (d <= 1 && (d > 0.6 || z >= 18)) v.set(x, y, z, z === 14 ? cap + 'S' : cap);
  }
  for (let x = 8; x <= 13; x++) for (let y = -6; y <= 5; y++) if (Math.abs(y + 0.5) <= 6 - Math.max(0, x - 11) * 2) v.set(x, y, 14, cap + 'S');
  v.set(0, -1, 20, cap + 'S'); v.set(0, 0, 20, cap + 'S');
  return v;
}

const bodyC = o => o.top === 'antar' ? 'krbOren' : 'krbHitam';
function chest(o) {
  const v = new Vox(), c = bodyC(o), A = o.top === 'antar';
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5 - (A ? 1 : 0), -8 + w + t - (A ? 1 : 0), 4 - t + (A ? 1 : 0), 7 - w - t + (A ? 1 : 0), c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'krbSkin', 2);
  if (A) {
    for (let z = 56; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'krbHitam', 2);   // kerah hitam
    for (let z = 35; z <= 55; z++) v.pf(-1, z, 'krbHitam');   // ritsleting
    for (let z = 35; z <= 44; z++) for (let y = -9; y <= 8; y++) { const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf, y, z, 'krbHitam'); if (xb !== null) v.set(xb, y, z, 'krbHitam'); }   // jaket dua warna: bawah hitam
    for (let y = -9; y <= 8; y++) { const xf = v.front(y, 45), xb = v.back(y, 45); if (xf !== null) v.set(xf, y, 45, 'krbPutih'); if (xb !== null) v.set(xb, y, 45, 'krbPutih'); }   // lis putih reflektor
    const L = { K: ['X..X', 'X.X.', 'XX..', 'X.X.', 'X..X'], I: ['XXX', '.X.', '.X.', '.X.', 'XXX'], L: ['X..', 'X..', 'X..', 'X..', 'XXX'], A: ['.X.', 'X.X', 'XXX', 'X.X', 'X.X'], T: ['XXX', '.X.', '.X.', '.X.', '.X.'] };
    let y0 = 8; for (const ch of 'KILAT') { L[ch].forEach((row, r) => [...row].forEach((cc, k) => { if (cc === 'X') { const y = y0 - k, z = 54 - r, x = v.back(y, z); if (x !== null) v.set(x, y, z, 'krbHitam'); } })); y0 -= L[ch][0].length; }
    // tali tas selempang dari bahu kanan ke pinggang kiri
    for (let z = 36; z <= 56; z++) { const y = Math.round(-7 + (z - 36) / 20 * 13); for (const dy of [0, 1]) { const yy = y + dy, xf = v.front(yy, z), xb = v.back(yy, z); if (xf !== null) v.set(xf + 1, yy, z, 'krbTas'); if (xb !== null) v.set(xb - 1, -1 - yy, z, 'krbTas'); } }
  } else for (let y = -2; y <= 1; y++) v.pf(y, 56, 'krbSkin');
  return v;
}
function pelvis(o) {
  const v = new Vox();
  v.rbox(-5, -8, 28, 4, 7, 33, 'krbKargo', 3); v.box(-4, -2, 26, 3, 1, 27, 'krbKargo');
  v.shell(33, -6, -9, 5, 8, 'krbHitamS', 3);
  if (o.top === 'antar') { for (let z = 30; z <= 32; z++) v.shell(z, -7, -10, 6, 9, 'krbHitam', 3); v.rbox(-9, 5, 26, -4, 11, 34, 'krbTas', 2); v.paint(-9, 5, 33, -4, 11, 34, 'krbHitamS'); }   // tas selempang di pinggul kiri belakang
  return v;
}
function arm(o) { const v = new Vox(), c = bodyC(o), A = o.top === 'antar'; v.rbox(-3, 8, 43, 2, 12 + (A ? 1 : 0), 55, A ? c : 'krbSkin', 2); v.rrect(56, -3, 8, 2, 12, c, 3); if (!A) { v.paint(-3, 8, 50, 2, 12, 56, c); v.shell(50, -4, 7, 3, 13, c, 2); } else v.shell(48, -4, 7, 3, 14, 'krbPutih', 2); return v; }
function fore(o, side) {
  const v = new Vox(), A = o.top === 'antar';
  v.rbox(-3, 8, 31, 2, 12 + (A ? 1 : 0), 42, A ? 'krbHitam' : 'krbSkin', 2);
  v.rbox(-3, 8, 27, 3, 12, 30, 'krbSkin', 2); v.rrect(26, -2, 9, 2, 11, 'krbSkin', 2);
  if (side > 0 && A) {   // kardus paket berlakban, label alamat putih
    v.rbox(-6, 3, 16, 7, 14, 27, 'krbKardus', 0); v.paint(-6, 3, 27, 7, 14, 27, 'krbKardusS');
    v.paint(-6, 8, 16, 7, 9, 27, 'krbLakban'); v.box(8, 4, 19, 8, 7, 23, 'krbLabel'); v.set(8, 5, 21, 'krbHitam'); v.set(8, 6, 21, 'krbHitam');
  }
  if (side > 0 && !A) { v.rbox(1, 9, 24, 4, 11, 31, 'krbHp', 0); v.paint(4, 9, 25, 4, 11, 30, 'krbLayar'); }
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-4, 2, 18, 3, 8, 31, 'krbKargo', 3); v.rrect(32, -3, 2, 2, 8, 'krbKargo', 3); v.rbox(-2, 9, 21, 2, 9, 26, 'krbKargoS', 1); return v; }   // saku kargo samping
function shin() { const v = new Vox(); v.rbox(-4, 2, 6, 3, 8, 18, 'krbKargo', 3); v.rrect(19, -3, 2, 2, 8, 'krbKargo', 3); v.shell(6, -5, 1, 4, 9, 'krbKargoS', 3); return v; }
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 1, 'krbSol', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'krbSepatu', 3); v.rbox(-4, 1, 5, 2, 8, 5, 'krbSepatu', 3);
  for (const x of [2, 4]) v.paint(x, 3, 4, x, 6, 4, 'krbSol');
  return v;
}

export const OUTFITS = {
  antar: { name: 'Antar paket: topi oranye + jaket kurir oranye-hitam KILAT + tas selempang + kardus paket + celana kargo', top: 'antar' },
  istirahat: { name: 'Istirahat: topi hitam + kaus hitam + celana kargo + main HP', top: 'istirahat' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.antar), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = bodyC(o), J = o.top === 'antar';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'krbSkin', shoulder: sl, elbow: J ? 'krbHitam' : 'krbSkin', hip: 'krbKargo', knee: 'krbKargo' }, SKEL, TAIL);
}
