// Wak Udin: nelayan sungai di tepi Kali Cendana, Bantaran, 60-an, sabar, banyak diam, ikannya jarang dapat
// ("Ikannya lagi malas."). Kulit legam, wajah keriput, janggut putih pendek, badan liat. Mancing: caping bambu + singlet
// putih kusam + kain sarung kotak dililit di bahu + celana pendek digulung + sepatu bot karet + joran bambu & ember ikan.
// Ronda: kupluk rajut + jaket tentara lusuh + sarung dikalungkan + senter. Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  udSkin: ['#5e3a20', '#6c4426', '#7a4e2e', '#885a36'], udSkinS: ['#5a361c'], udHair: ['#b8b4ac', '#c6c2ba', '#d2cec6', '#deDad2'], udJenggot: ['#d8d4cc'], udJenggotG: ['#8e8a82'],
  udCaping: ['#c8a868', '#d4b474', '#dec080', '#e8cc8e'], udCapingS: ['#a8884a'], udSinglet: ['#d8d4c4', '#e2ded0', '#eae6da', '#f2eee4'],
  udSarung: ['#3a5a8a', '#446698', '#4e72a6', '#5a80b4'], udSarungS: ['#24406a'], udSarungK: ['#c84a3a'],
  udPendek: ['#4a4a40', '#54544a', '#5e5e54', '#6a6a5e'], udBot: ['#1a1a1c', '#222224', '#2c2c2e', '#38383a'],
  udJoran: ['#a88a4a', '#b49656', '#c0a262', '#ccae6e'], udSenar: ['#e8eef2'], udEmber: ['#2a6ac8', '#3478d4', '#4086de', '#4e94e8'], udIkan: ['#a8b4bc'], udAir: ['#5aa0c8'],
  udKupluk: ['#2a2a30', '#323238', '#3c3c42', '#46464c'], udJaket: ['#4a5236', '#545c3e', '#5e6646', '#6a7250'], udJaketS: ['#363c26'],
  udSenter: ['#c8ccd4'], udCahaya: ['#f8e8a0'],
});

const FCH = { B: 'udJenggot', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'udSkinS', j: 'udJenggotG' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, '.....jjjj.....', '......jj......', F0];   // alis putih z 11, mulut z 4, janggut z 2..1
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..sKK....KKs..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0]),
  marah: F('...BB....BB...', ['..KKK....KKK..', '..WKK....KKW..'], ['....mmmmmm....', F0]),   // kailnya nyangkut
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....']),   // "Dapat!"
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....']),
};
export const EXPRS = Object.keys(FACES);

const M = o => o.top === 'mancing';
const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'udSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'udSkin'); v.set(7, -1, 5, 'udSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'udSkin'); v.box(-1, y, 6, -1, y, 7, 'udSkinS'); }
  for (const y of [-6, 5]) { v.set(6, y, 3, 'udSkinS'); v.set(6, y, 4, 'udSkinS'); }
  for (const y of [-4, -2, 1, 3]) v.set(6, y, 13, 'udSkinS');
  const hair = new Vox();   // putih tipis, cepak
  for (let z = 8; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'udHair', 4);
  hair.rrect(16, -6, -6, 5, 5, 'udHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 10 : 8)) v.set(x, y, z, c); });
  if (M(o)) {   // caping bambu kerucut lebar, anyaman berselang
    for (let z = 14; z <= 22; z++) { const r = 15 - (z - 14) * 1.7; for (let x = -16; x <= 15; x++) for (let y = -16; y <= 15; y++) { const d = Math.hypot(x + 0.5, y + 0.5); if (d <= r && d > r - 2.2) v.set(x, y, z, (Math.round(Math.atan2(y + 0.5, x + 0.5) * 6) + z) % 2 ? 'udCaping' : 'udCapingS'); } }
    v.set(0, -1, 23, 'udCapingS'); v.set(0, 0, 23, 'udCapingS');
  } else {   // kupluk rajut hitam
    for (let z = 11; z <= 19; z++) for (let x = -9; x <= 8; x++) for (let y = -9; y <= 8; y++) {
      const d = ((x + 0.5) / 8.7) ** 2 + ((y + 0.5) / 8.6) ** 2 + (Math.max(0, z - 14) / 5.6) ** 2;
      if (d <= 1 && (d > 0.6 || z >= 18) && !(x >= 4 && z <= 11)) v.set(x, y, z, z <= 12 ? 'udKupluk' : (y + z) % 2 ? 'udKupluk' : 'udJaketS');
    }
  }
  return v;
}

const kotak = v => { v.each((x, y, z, k) => { if (k !== 'udSarung') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x; if (((u % 4) + 4) % 4 === 0 && ((z % 4) + 4) % 4 === 0) v.set(x, y, z, 'udSarungK'); else if (((u % 4) + 4) % 4 === 0 || ((z % 4) + 4) % 4 === 0) v.set(x, y, z, 'udSarungS'); }); return v; };
function chest(o) {
  const v = new Vox(), c = M(o) ? 'udSinglet' : 'udJaket';
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -8 + w + t, 4 - t, 7 - w - t, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'udSkin', 2);
  if (M(o)) {   // singlet: bahu & dada atas kulit, tali tipis
    for (let z = 50; z <= 56; z++) for (let y = -8; y <= 7; y++) { const inner = Math.abs(y + 0.5) < 2.5 + (z - 50) * 0.5, strap = Math.abs(Math.abs(y + 0.5) - 4.5) < 1; if (!strap || z >= 55) { const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null && (inner || Math.abs(y + 0.5) > 5.5 || z >= 55)) v.set(xf, y, z, 'udSkin'); if (xb !== null && (Math.abs(y + 0.5) > 5.5 || z >= 55)) v.set(xb, y, z, 'udSkin'); } }
  } else {
    for (let z = 35; z <= 55; z++) v.pf(-1, z, 'udJaketS');
    for (const z of [42, 43]) for (const y of [-6, -5, -4, 3, 4, 5]) v.pf(y, z, 'udJaketS');
    for (let z = 55; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'udJaketS', 2);
  }
  // kain sarung: mancing = dililit menyilang di bahu kiri; ronda = dikalungkan di leher, ujung jatuh di depan
  if (M(o)) for (let z = 36; z <= 57; z++) { const yc = Math.round(-6 + (57 - z) * 0.6); for (let y = yc - 2; y <= yc + 2; y++) { if (y < -9 || y > 8) continue; const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf + 1, y, z, 'udSarung'); if (xb !== null) v.set(xb - 1, y, z, 'udSarung'); } }
  else { for (let z = 55; z <= 59; z++) v.shell(z, -6, -7, 5, 6, 'udSarung', 3); for (let z = 40; z <= 56; z++) for (const y of [-5, -4, -3, 2, 3, 4]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'udSarung'); } }
  return kotak(v);
}
function pelvis(o) {
  const v = new Vox();
  v.rbox(-5, -8, 28, 4, 7, 33, 'udPendek', 3); v.box(-4, -2, 26, 3, 1, 27, 'udPendek');
  v.shell(33, -6, -9, 5, 8, 'udBot', 3);
  if (!M(o)) for (let z = 30; z <= 34; z++) v.shell(z, -6, -9, 5, 8, z === 30 ? 'udJaketS' : 'udJaket', 3);
  return v;
}
function arm(o) { const v = new Vox(); v.rbox(-3, 8, 43, 2, 13, 55, M(o) ? 'udSkin' : 'udJaket', 2); v.rrect(56, -3, 8, 2, 13, M(o) ? 'udSkin' : 'udJaket', 3); return v; }
function fore(o, side) {
  const v = new Vox();
  v.rbox(-3, 8, 31, 2, 13, 42, M(o) ? 'udSkin' : 'udJaket', 2);
  if (!M(o)) v.paint(-3, 8, 31, 2, 13, 32, 'udJaketS');
  v.rbox(-3, 8, 27, 3, 13, 30, 'udSkin', 2); v.rrect(26, -2, 9, 2, 12, 'udSkin', 2);
  if (M(o) && side > 0) {   // joran bambu condong ke depan atas, senar menjuntai dari ujung
    let tip = null;
    for (let k = 0; k <= 46; k++) { const x = Math.round(-4 + k * 0.62), z = Math.round(22 + k * 0.78); v.set(x, 10, z, k > 34 ? 'udCapingS' : 'udJoran'); if (k < 20) v.set(x, 11, z, 'udJoran'); tip = [x, z]; }
    for (let z = tip[1] - 22; z < tip[1]; z++) v.set(tip[0] + 1, 10, z, 'udSenar');
  }
  if (M(o) && side < 0) {   // ember biru berisi air & dua ikan kecil
    for (let z = 8; z <= 20; z++) v.shell(z, -5, 6, 5, 16, 'udEmber', 4);
    v.rrect(8, -5, 6, 5, 16, 'udEmber', 4); v.rrect(19, -4, 7, 4, 15, 'udAir', 4);
    for (const [x, y] of [[-1, 9], [0, 9], [1, 9], [-2, 12], [-1, 12], [0, 12]]) v.set(x, y, 20, 'udIkan');
    for (let x = -5; x <= 5; x++) v.set(x, 11, 21 + Math.round(5 * Math.sin((x + 5) / 10 * Math.PI)), 'udSenter');   // gagang
  }
  if (!M(o) && side > 0) { v.rbox(1, 9, 23, 6, 12, 27, 'udSenter', 1); v.box(7, 10, 24, 7, 11, 26, 'udCahaya'); }   // senter
  return v;
}
function thigh(o) { const v = new Vox(); v.rbox(-4, 2, 18, 3, 8, 31, 'udPendek', 3); v.rrect(32, -3, 2, 2, 8, 'udPendek', 3); if (M(o)) { v.paint(-4, 2, 18, 3, 8, 20, 'udSkin'); v.shell(21, -5, 1, 4, 9, 'udPendek', 3); v.shell(22, -5, 1, 4, 9, 'udPendek', 3); } return v; }
function shin(o) { const v = new Vox(); v.rbox(-4, 2, 6, 3, 8, 18, M(o) ? 'udSkin' : 'udPendek', 3); v.rrect(19, -3, 2, 2, 8, M(o) ? 'udSkin' : 'udPendek', 3); if (M(o)) for (let z = 6; z <= 13; z++) v.shell(z, -5, 1, 4, 9, z === 13 ? 'udJaketS' : 'udBot', 3); return v; }
function foot(o) {
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 1, 'udBot', 3); v.rbox(-4, 1, 2, 7, 8, 4, M(o) ? 'udBot' : 'udSkin', 3); v.rbox(-4, 1, 5, 3, 8, 6, M(o) ? 'udBot' : 'udSkin', 3);
  if (!M(o)) v.paint(2, 1, 2, 3, 8, 3, 'udBot');   // sandal jepit saat ronda
  return v;
}

export const OUTFITS = {
  mancing: { name: 'Mancing: caping bambu + singlet kusam + sarung kotak dililit di bahu + celana pendek + bot karet + joran & ember ikan', top: 'mancing' },
  ronda: { name: 'Ronda malam: kupluk rajut + jaket tentara lusuh + sarung dikalungkan + senter', top: 'ronda' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.mancing), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), c = M(o) ? 'udSkin' : 'udJaket';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'udSkin', shoulder: c, elbow: c, hip: 'udPendek', knee: M(o) ? 'udSkin' : 'udPendek' }, SKEL, TAIL);
}
