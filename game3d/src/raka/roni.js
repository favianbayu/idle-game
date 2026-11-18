// Pak Roni: pemulung yang keliling Bantaran sampai Pusat Kota, 40-an, kurus legam, ramah, jujur, suka kasih misi
// kumpulkan botol ("Ada botol bekas, Dek?"). Rambut gondrong diikat ke belakang, jenggot tidak terurus. Mulung: topi rimba
// lusuh + kaus partai pudar robek + celana panjang digulung + sepatu bot bekas + karung putih besar di punggung penuh
// botol + gancu besi. Jumatan: koko putih bekas + sarung kotak hijau + peci hitam + sandal. Rangka keluarga Arga.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  rnSkin: ['#5e3a22', '#6c4428', '#7a4e30', '#885a38'], rnSkinS: ['#58361e'], rnHair: ['#18140f', '#201b16', '#2a241e', '#363028'], rnJenggot: ['#2a241e'],
  rnTopi: ['#7a6a4a', '#867656', '#928262', '#9e8e6e'], rnTopiS: ['#5e5038'],
  rnKaus: ['#c8b84a', '#d4c456', '#ded062', '#e8da70'], rnKausS: ['#a89838'], rnSobek: ['#6c4428'],
  rnCelana: ['#4a4438', '#544e40', '#5e5848', '#6a6452'], rnBot: ['#2a3a2a', '#324432', '#3c4e3c', '#465846'],
  rnKarung: ['#e0dcd0', '#e8e4da', '#f0ece4', '#f6f4ee'], rnKarungS: ['#b8b4a8'], rnTali: ['#8a6a3a'], rnBotol1: ['#5ab4e0'], rnBotol2: ['#3a9a5a'], rnTutup: ['#e83a3a'],
  rnGancu: ['#6a6e74', '#767a80', '#82868c', '#8e9298'], rnGagang: ['#6a4424'],
  rnKoko: ['#e2e0d6', '#eceae2', '#f4f2ec', '#faf9f6'], rnKokoS: ['#c4c0b4'], rnSarung: ['#2a6a4a', '#347656', '#3e8262', '#4a8e6e'], rnSarungS: ['#1a4a32'], rnSarungK: ['#c8c070'],
  rnPeci: ['#141416', '#1c1c1e', '#262628', '#303032'], rnSandal: ['#3a2a1e', '#44322a', '#4e3a2e', '#5a4436'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'rnSkinS', j: 'rnJenggot' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, '....j....j....', ...mouth, '...j.jjjj.j...', '....jjjjjj....', F0];   // alis z 11, mulut z 4..3, jenggot berantakan z 2..1
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0]),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', '...m......m...']),
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....']),   // "Rongsookk!"
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....']),
};
export const EXPRS = Object.keys(FACES);

const M = o => o.top === 'mulung';
const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'rnSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'rnSkin'); v.set(7, -1, 5, 'rnSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'rnSkin'); v.box(-1, y, 6, -1, y, 7, 'rnSkinS'); }
  // gondrong diikat ke belakang: kuncir pendek di tengkuk
  const hair = new Vox();
  for (let z = 5; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'rnHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -6, -6, 5, 5, 'rnHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 5)) v.set(x, y, z, c); });
  for (let z = -2; z <= 7; z++) for (let y = -2 + (z < 2 ? 1 : 0); y <= 1 - (z < 2 ? 1 : 0); y++) for (const x of [-9, -10]) v.set(x, y, z, z === 6 ? 'rnTali' : 'rnHair');
  for (const [x, y, z] of [[6, -8, 11], [6, 7, 12], [5, 7, 10]]) v.set(x, y, z, 'rnHair');   // helai lepas
  if (M(o)) {   // topi rimba lusuh, pinggiran melengkung, sedikit penyok
    for (let z = 13; z <= 19; z++) for (let x = -12; x <= 11; x++) for (let y = -12; y <= 11; y++) {
      const brim = z === 13, r = brim ? 11.6 : 8.8, d = ((x + 0.5) / r) ** 2 + ((y + 0.5) / r) ** 2 + (brim ? 0 : (Math.max(0, z - 16) / 3.4) ** 2);
      if (d <= 1 && (d > 0.6 || z >= 19 || brim) && !(z === 19 && x > 2 && y < -2)) v.set(x, y, brim && Math.abs(y + 0.5) > 9 ? z + 1 : z, z === 14 ? 'rnTopiS' : (x * 3 + y + z) % 8 === 0 ? 'rnTopiS' : 'rnTopi');
    }
    for (let x = -8; x <= 8; x++) for (let y = -8; y <= 8; y++) if (Math.hypot(x + 0.5, y + 0.5) < 8 && v.get(x, y, 13) === 'rnTopi') v.set(x, y, 13, null);
  } else {   // peci hitam
    for (let z = 12; z <= 17; z++) v.shell(z, -8, -8, 7, 7, 'rnPeci', 3);
    v.rrect(17, -8, -8, 7, 7, 'rnPeci', 3);
    for (let z = 12; z <= 17; z++) for (let x = -7; x <= 6; x++) for (let y = -7; y <= 6; y++) if (v.get(x, y, z) === 'rnHair') v.set(x, y, z, null);
  }
  return v;
}

function chest(o) {
  const v = new Vox(), c = M(o) ? 'rnKaus' : 'rnKoko';
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -8 + w + t, 4 - t, 7 - w - t, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'rnSkin', 2);
  for (let y = -3; y <= 2; y++) v.pf(y, 56, 'rnSkin');
  if (M(o)) {
    for (let z = 42; z <= 49; z++) for (let y = -3; y <= 2; y++) if (Math.hypot(y + 0.5, z - 45.5) <= 3.2) v.pf(y, z, Math.hypot(y + 0.5, z - 45.5) <= 1.6 ? 'rnTutup' : 'rnKausS');   // gambar partai pudar
    for (const [y, z] of [[-6, 38], [-5, 37], [-6, 37], [4, 51], [5, 50]]) v.pf(y, z, 'rnSobek');   // robek
    // karung putih besar di punggung, tali goni melintang di dada
    for (let z = 30; z <= 60; z++) { const r = z >= 56 ? 7 - (z - 56) : 7 + (z <= 34 ? -(34 - z) : 0); if (r < 2) continue; for (let x = -22; x <= -6; x++) for (let y = -10; y <= 9; y++) { const d = ((x + 13.5) / (r + 1.5)) ** 2 + ((y + 0.5) / (r + 2.6)) ** 2; if (d <= 1) v.set(x, y, z, (x + y + z) % 6 === 0 ? 'rnKarungS' : 'rnKarung'); } }
    for (const [x, y, c2] of [[-12, -4, 'rnBotol1'], [-15, 2, 'rnBotol2'], [-10, 3, 'rnBotol1'], [-16, -2, 'rnBotol1']]) { v.box(x, y, 59, x + 1, y + 1, 63, c2); v.box(x, y, 64, x + 1, y + 1, 64, 'rnTutup'); }
    for (let x = -14; x <= -11; x++) for (let y = -2; y <= 1; y++) v.set(x, y, 61, 'rnTali');   // ikatan mulut karung
    for (let z = 36; z <= 56; z++) { const yc = Math.round(6 - (56 - z) * 0.65); for (const y of [yc, yc + 1]) { if (y < -9 || y > 8) continue; const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'rnTali'); } }
  } else {
    for (let z = 55; z <= 57; z++) v.shell(z, -4, -5, 3, 4, 'rnKoko', 2);
    for (let z = 46; z <= 56; z++) v.pf(-1, z, 'rnKokoS'); for (const z of [48, 51, 54]) v.pf(0, z, 'rnKokoS');
    for (let z = 46; z <= 54; z++) for (const y of [-4, 3]) if (z % 2 === 0) v.pf(y, z, 'rnKokoS');   // bordir
  }
  return v;
}
const sarungPat = v => { v.each((x, y, z, k) => { if (k !== 'rnSarung') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x; const a = ((u % 5) + 5) % 5 === 0, b = ((z % 5) + 5) % 5 === 0; if (a && b) v.set(x, y, z, 'rnSarungK'); else if (a || b) v.set(x, y, z, 'rnSarungS'); }); return v; };
function pelvis(o) {
  const v = new Vox();
  if (M(o)) { v.rbox(-5, -8, 28, 4, 7, 33, 'rnCelana', 3); v.box(-4, -2, 26, 3, 1, 27, 'rnCelana'); for (let z = 31; z <= 34; z++) v.shell(z, -6, -9, 5, 8, z === 31 ? 'rnKausS' : 'rnKaus', 3); return v; }
  v.rbox(-5, -8, 26, 4, 7, 33, 'rnSarung', 3);
  for (let z = 22; z <= 33; z++) { const f = z <= 27 ? 1 : 0; v.shell(z, -6 - f, -9 - f, 5 + f, 8 + f, 'rnSarung', 3); }
  sarungPat(v);
  for (let z = 30; z <= 34; z++) v.shell(z, -6, -9, 5, 8, z === 30 ? 'rnKokoS' : 'rnKoko', 3);   // koko menutupi gulungan sarung
  return v;
}
function arm(o) { const v = new Vox(), c = M(o) ? 'rnKaus' : 'rnKoko'; v.rbox(-3, 8, 43, 2, 12, 55, M(o) ? 'rnSkin' : c, 2); v.rrect(56, -3, 8, 2, 12, c, 3); if (M(o)) v.paint(-3, 8, 49, 2, 12, 56, c); return v; }
function fore(o, side) {
  const v = new Vox(), c = M(o) ? 'rnSkin' : 'rnKoko';
  v.rbox(-3, 8, 31, 2, 12, 42, c, 2);
  if (!M(o)) v.shell(31, -4, 7, 3, 13, 'rnKokoS', 2);
  v.rbox(-3, 8, 27, 3, 12, 30, 'rnSkin', 2); v.rrect(26, -2, 9, 2, 11, 'rnSkin', 2);
  if (M(o) && side > 0) {   // gancu: gagang kayu + batang besi + kait di ujung bawah
    for (let z = 22; z <= 32; z++) v.set(1, 10, z, 'rnGagang');
    for (let z = 4; z <= 21; z++) v.set(1, 10, z, 'rnGancu');
    for (const [x, z] of [[2, 4], [3, 5], [4, 6], [4, 7]]) v.set(x, 10, z, 'rnGancu');
  }
  return v;
}
function thigh(o) {
  const v = new Vox();
  if (M(o)) { v.rbox(-4, 2, 18, 3, 8, 31, 'rnCelana', 3); v.rrect(32, -3, 2, 2, 8, 'rnCelana', 3); return v; }
  v.rbox(-4, 1, 17, 4, 9, 31, 'rnSarung', 3); v.rrect(32, -3, 2, 2, 8, 'rnSarung', 3); return sarungPat(v);
}
function shin(o) {
  const v = new Vox();
  if (M(o)) { v.rbox(-4, 2, 6, 3, 8, 18, 'rnCelana', 3); v.rrect(19, -3, 2, 2, 8, 'rnCelana', 3); v.shell(9, -5, 1, 4, 9, 'rnCelana', 3); v.shell(10, -5, 1, 4, 9, 'rnCelana', 3); for (let z = 6; z <= 8; z++) v.shell(z, -5, 1, 4, 9, 'rnBot', 3); return v; }
  for (let z = 5; z <= 18; z++) { const f = z <= 9 ? 1 : 0; v.rrect(z, -4 - f, 1 - f, 4 + f, 9 + f, z === 5 ? 'rnSarungS' : 'rnSarung', 3); }
  v.rbox(-2, 3, 3, 2, 7, 4, 'rnSkin', 2);
  return sarungPat(v);
}
function foot(o) {
  const v = new Vox();
  if (M(o)) { v.rbox(-4, 1, 0, 7, 8, 1, 'rnBot', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'rnBot', 3); v.rbox(-4, 1, 5, 3, 8, 6, 'rnBot', 3); v.set(7, 3, 2, 'rnSkin'); return v; }   // bot bolong di ujung
  v.rbox(-4, 1, 0, 7, 8, 1, 'rnSandal', 3); v.rbox(-3, 2, 2, 6, 7, 2, 'rnSkin', 2); v.rbox(-3, 2, 3, 2, 7, 3, 'rnSkin', 2);
  v.paint(2, 1, 2, 4, 8, 2, 'rnSandal');
  return v;
}

export const OUTFITS = {
  mulung: { name: 'Mulung: topi rimba lusuh + kaus partai pudar robek + celana digulung + sepatu bot bekas + karung botol di punggung + gancu', top: 'mulung' },
  jumatan: { name: 'Jumatan: peci hitam + koko putih bekas + sarung kotak hijau + sandal', top: 'jumatan' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.mulung), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = M(o) ? 'rnKaus' : 'rnKoko', lg = M(o) ? 'rnCelana' : 'rnSarung';
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'rnSkin', shoulder: sl, elbow: M(o) ? 'rnSkin' : sl, hip: lg, knee: lg }, SKEL, TAIL);
  if (!M(o)) P.skirt = { mats: [P.mat('rnSarung'), P.mat('rnSarungS')], fill: P.mat('rnSarung'), parts: ['pelvis', 'thighL', 'thighR', 'shinL', 'shinR'] };
  return P;
}
