// Pak Satpam Udin: satpam SMA 3, 40-an, tegap berperut sedikit, disiplin soal jam gerbang ("Tiga, dua, satu... tutup!").
// Jaga: baret dongker berlencana perak + kemeja putih lengan pendek dengan pangkat bahu dan emblem lengan dongker + papan
// nama + tali peluit perak + kopel hitam dengan pentungan + celana dongker + sepatu PDH. Ronda malam: jaket dongker dengan
// lis putih + kupluk + senter. Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  puSkin: ['#8a5634', '#9a6240', '#ac704a', '#bc7e56'], puSkinS: ['#86522e'], puHair: ['#121010', '#1a1816', '#24201e', '#2e2a26'], puKumis: ['#1c1816'],
  puBaret: ['#1a2242', '#202a50', '#28345e', '#323e6c'], puPerak: ['#c8ccd4'], puEmas: ['#d8b04a'],
  puKemeja: ['#d8dce0', '#e6e8ec', '#f0f2f4', '#fafbfc'], puKemejaS: ['#b8bec6'],
  puDongker: ['#1a2040', '#222a4c', '#2a3458', '#344066'], puDongkerS: ['#141a34'],
  puKopel: ['#141416'], puPentung: ['#0e0e10', '#18181a', '#222224', '#2c2c2e'], puPDH: ['#0c0c0e', '#141416', '#1e1e20', '#2a2a2e'],
  puSenter: ['#3a3a3e'], puLampu: ['#f4f0c0'], puKupluk: ['#2a2a2e', '#323236', '#3c3c40', '#46464a'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'puSkinS', k: 'puKumis' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, '...kkkkkkkk...', ...mouth, F0, F0, F0];   // alis z 11, kumis z 5, mulut z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0]),
  marah: F('..BBB....BBB..', EYE, ['....mmmmmm....', '...m......m...']),   // ada yang telat lompat pagar
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....']),
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....']),
};
export const EXPRS = Object.keys(FACES);

const J = o => o.top === 'jaga';
const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'puSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'puSkin'); v.set(7, -1, 5, 'puSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'puSkin'); v.box(-1, y, 6, -1, y, 7, 'puSkinS'); }
  const hair = new Vox();   // cepak sangat pendek, sisi tipis
  for (let z = 9; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'puHair', 4);
  hair.rrect(16, -6, -6, 5, 5, 'puHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 15 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 12 : 9)) v.set(x, y, z, c); });
  if (J(o)) {   // baret dongker miring ke kanan, lencana perak di depan kiri
    for (let z = 14; z <= 18; z++) for (let x = -9; x <= 8; x++) for (let y = -10; y <= 9; y++) {
      const cy = -0.5 + (z - 14) * 0.5, d = ((x + 0.5) / 8.6) ** 2 + ((y - cy) / 9.2) ** 2;
      if (d <= (z === 18 ? 0.55 : 1) && !(z <= 15 && d < 0.7)) v.set(x, y, z, z === 14 ? 'puDongkerS' : 'puBaret');
    }
    for (let y = 1; y <= 3; y++) for (let z = 15; z <= 16; z++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, z === 16 && y === 2 ? 'puEmas' : 'puPerak'); }
  } else {   // kupluk rajut
    for (let z = 13; z <= 18; z++) v.shell(z, -8, -8, 7, 7, z === 13 ? 'puDongkerS' : 'puKupluk', z >= 17 ? 5 : 4);
    v.rrect(19, -5, -5, 4, 4, 'puKupluk', 3);
  }
  return v;
}

function chest(o) {
  const v = new Vox(), c = J(o) ? 'puKemeja' : 'puDongker', s = J(o) ? 'puKemejaS' : 'puDongkerS';
  for (let z = 34; z <= 56; z++) { const w = z <= 40 ? 1 : z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -6, -9 + w + t, 5 - t + Math.max(0, w), 8 - w - t, c, z >= 55 ? 4 : 3); }   // perut sedikit maju
  v.rbox(-3, -3, 57, 2, 2, 60, 'puSkin', 2);
  for (let z = 55; z <= 58; z++) v.shell(z, -4, -5, 3, 4, s, 2);   // kerah
  for (let z = 35; z <= 55; z++) v.pf(-1, z, s);   // kancing
  if (J(o)) {
    for (let z = 38; z <= 54; z += 4) v.pf(-1, z, 'puPerak');
    for (const y of [-8, -7, -6, 5, 6, 7]) for (let x = -3; x <= 3; x++) { const z = 56; if (v.has(x, y, z)) v.set(x, y, z, 'puDongker'); }   // pangkat bahu
    for (const y of [-7, 6]) v.set(0, y, 57, 'puEmas');
    v.pfBox(3, 49, 6, 50, 'puDongker'); v.pf(4, 50, 'puEmas');   // emblem dada kanan
    v.pfBox(-7, 48, -4, 48, 'puDongkerS'); v.pf(-6, 48, 'puPerak');   // papan nama
    for (let z = 42; z <= 54; z++) { const y = Math.round(-4 - (z - 42) * 0.25); v.pf(y, z, 'puDongker'); }   // tali peluit dari bahu ke saku
    v.pfBox(-6, 41, -5, 42, 'puPerak');
  } else {
    for (const z of [44, 45]) for (let y = -10; y <= 9; y++) { const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf, y, z, 'puKemeja'); if (xb !== null) v.set(xb, y, z, 'puKemeja'); }   // lis putih
    for (let z = 47; z <= 52; z++) for (let y = -5; y <= 4; y++) { const x = v.back(y, z); if (x !== null && (z === 47 || z === 52 || y === -5 || y === 4)) v.set(x, y, z, 'puKemeja'); }   // kotak tulisan di punggung
    for (let y = -3; y <= 2; y++) { const x = v.back(y, 49); if (x !== null && y % 2 === 0) v.set(x, y, 49, 'puKemeja'); const x2 = v.back(y, 50); if (x2 !== null && y % 2) v.set(x2, y, 50, 'puKemeja'); }
  }
  return v;
}
function pelvis(o) {
  const v = new Vox();
  v.rbox(-5, -8, 28, 5, 7, 33, 'puDongker', 3); v.box(-4, -2, 26, 3, 1, 27, 'puDongker');
  if (J(o)) {
    v.rbox(-6, -9, 32, 6, 8, 33, 'puKopel', 3); v.pfBox(-1, 32, 0, 33, 'puPerak');
    for (let z = 20; z <= 33; z++) v.set(-1, -10, z, 'puPentung'); v.set(-1, -11, 30, 'puPentung'); v.set(-1, -11, 31, 'puPentung');   // pentungan di pinggang kiri
  } else for (let z = 30; z <= 34; z++) v.shell(z, -7, -10, 6, 9, z === 30 ? 'puKemeja' : 'puDongker', 3);
  return v;
}
function arm(o) {
  const v = new Vox(), c = J(o) ? 'puKemeja' : 'puDongker';
  v.rbox(-3, 8, 43, 2, 13, 55, J(o) ? 'puSkin' : c, 2); v.rrect(56, -3, 8, 2, 13, c, 3);
  if (J(o)) { v.paint(-3, 8, 47, 2, 13, 56, c); v.paint(-3, 8, 47, 2, 13, 47, 'puKemejaS'); v.psBox(1, -1, 51, 1, 54, 'puDongker'); v.set(0, 13, 53, 'puEmas'); }   // emblem lengan
  else v.paint(-3, 8, 49, 2, 13, 50, 'puKemeja');
  return v;
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-3, 8, 31, 2, 13, 42, J(o) ? 'puSkin' : 'puDongker', 2);
  if (!J(o)) v.paint(-3, 8, 31, 2, 13, 32, 'puDongkerS');
  v.rbox(-3, 8, 27, 3, 13, 30, 'puSkin', 2); v.rrect(26, -2, 9, 2, 12, 'puSkin', 2);
  if (J(o) && side < 0) v.paint(-3, 8, 33, 2, 13, 34, 'puKopel');   // jam tangan
  if (!J(o) && side > 0) { v.box(2, 9, 24, 8, 12, 27, 'puSenter'); v.box(9, 9, 24, 9, 12, 27, 'puLampu'); }   // senter
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-4, 2, 18, 3, 8, 31, 'puDongker', 3); v.rrect(32, -3, 2, 2, 8, 'puDongker', 3); return v; }
function shin() { const v = new Vox(); v.rbox(-4, 2, 6, 3, 8, 18, 'puDongker', 3); v.rrect(19, -3, 2, 2, 8, 'puDongker', 3); for (let z = 7; z <= 18; z++) v.pf(5, z, 'puDongkerS'); return v; }
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 0, 'puKopel', 3); v.rbox(-4, 1, 1, 7, 8, 4, 'puPDH', 3); v.rbox(-4, 1, 5, 3, 8, 7, 'puPDH', 3);
  v.set(7, 4, 3, 'puPerak');
  return v;
}

export const OUTFITS = {
  jaga: { name: 'Jaga gerbang: baret dongker + kemeja putih berpangkat + papan nama + tali peluit + kopel & pentungan + celana dongker + PDH', top: 'jaga' },
  ronda: { name: 'Ronda malam: kupluk + jaket dongker lis putih + senter', top: 'ronda' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.jaga), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), j = J(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'puSkin', shoulder: j ? 'puKemeja' : 'puDongker', elbow: j ? 'puSkin' : 'puDongker', hip: 'puDongker', knee: 'puDongker' }, SKEL, TAIL);
}
