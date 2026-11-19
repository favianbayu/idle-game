// Pak Joko: tukang las bengkel las Kenanga, 40-an, kekar, tangan penuh bekas percikan. Topeng las hitam diangkat ke atas
// dahi, wearpack biru dongker berlubang kecil bekas api, sarung tangan kulit tebal, sepatu safety, cambang tebal. Sore-sore
// pakai kaus kutang + celana kerja. Rangka keluarga Bram/Kobar (badan besar), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 15, thigh: 15.5, up: 4, neck: 24, shY: 10.5, shZ: 17, upper: 11, fore: 11.5, hipY: 5, flap: 6, ballR: 1.1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  jkSkin: ['#7a4c2c', '#8e5a34', '#a26a40', '#b47a4e'], jkSkinS: ['#86532f'], jkHair: ['#141010', '#1c1614', '#26201c', '#322a24'], jkBekas: ['#5e3a22'],
  topengL: ['#1a1a1e', '#24242a', '#2e2e36', '#3c3c46'], topengLK: ['#2a5a3a'], topengLS: ['#0c0c10'],
  wpJ: ['#1e2a4a', '#24325a', '#2c3c6a', '#384a7e'], wpJS: ['#141c34'], wpJK: ['#c8a040'], bolong: ['#0a0e1a'],
  glovesJ: ['#8a6a3a', '#9c7a44', '#ae8a50', '#c09c60'], glovesJS: ['#6a4e28'], safetyJ: ['#2a1c12', '#36241a', '#443022', '#56402e'], safetyJK: ['#a8a8b0'],
  kutangJ: ['#d8d4c8', '#e4e0d4', '#eeeae0', '#f6f4ec'], kutangJS: ['#b8b2a2'], celJ: ['#3a3e30', '#46483a', '#525646', '#626654'],
  palu: ['#5a5a62', '#6e6e76', '#82828a', '#9a9aa2'], paluG: ['#6a4422'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'jkSkinS', h: 'jkHair' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, F0, brow, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 10 (di bawah topeng las), mata z 9..8, mulut z 4
const BROW = 'hBBBBB..BBBBBh';
const EYE = ['h.KKK....KKK.h', 'h.WKK....KKW.h'];
const CAMBANG = m => m.map((r, i) => i === 2 ? 'hh' + r.slice(2, 12) + 'hh' : 'h' + r.slice(1, 13) + 'h');
export const FACES = {
  biasa: F(BROW, EYE, CAMBANG(['....mmmmmm....', F0, F0])),
  kedip: F(BROW, ['h............h', 'h.KKK....KKK.h'], CAMBANG(['....mmmmmm....', F0, F0])),
  marah: F('h..BBB..BBB..h', EYE, CAMBANG(['....mmmmmm....', '....m....m....', F0])),   // "Awas matanya!"
  teriak: F('h..BBB..BBB..h', ['h.KKK....KKK.h', 'h.KWK....KWK.h'], CAMBANG(['....mTTTTm....', '....mttttm....', '.....mmmm.....'])),
  nyengir: F(BROW, EYE, CAMBANG(['...mTTTTTTm...', '....mmmmmm....', F0])),
  ketawa: F(BROW, ['h.KK......KK.h', 'hK..K....K..Kh'], CAMBANG(['...mTTTTTTm...', '....mttttm....', '.....mmmm.....'])),
  sakit: F('hBB........BBh', ['hKK........KKh', 'h..KK....KK..h'], CAMBANG(['....mmmmmm....', '....TTTTTT....', F0])),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -7, 6, 6, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];   // rahang kotak
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'jkSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 7, 'jkSkin'); v.box(8, -1, 5, 8, 0, 5, 'jkSkin'); v.set(7, -1, 5, 'jkSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'jkSkin'); v.box(-1, y, 6, -1, y, 7, 'jkSkinS'); }
  v.set(v.front(4, 6), 4, 6, 'jkBekas'); v.set(v.front(-5, 7), -5, 7, 'jkBekas');   // bintik bekas percikan di pipi
  const hair = new Vox();   // rambut pendek tebal agak berantakan
  for (let z = 6; z <= 16; z++) hair.rrect(z, -8, -8, 7, 7, 'jkHair', 4);
  hair.rrect(17, -6, -6, 5, 5, 'jkHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 6 : 6)) v.set(x, y, z, c); });
  if (o.topeng) {   // topeng las diangkat: pelat hitam melengkung di atas dahi menghadap ke atas, kaca hijau, ikat kepala
    for (let z = 15; z <= 25; z++) { const x0 = 6 - Math.round((z - 15) * 0.55); for (let y = -7; y <= 6; y++) {
      const w = 7.5 - Math.max(0, z - 22) * 1.2; if (Math.abs(y + 0.5) > w) continue;
      v.set(x0, y, z, 'topengLS'); v.set(x0 + 1, y, z, (z >= 19 && z <= 21 && Math.abs(y + 0.5) <= 3.5) ? 'topengLK' : 'topengL');
    } }
    v.each((x, y, z, c) => { if (c === 'jkHair' && z === 13 && ((x + 0.5) / 8) ** 2 + ((y + 0.5) / 8) ** 2 > 0.7) v.set(x, y, z, 'topengLS'); });   // tali kepala menempel di rambut
    for (const y of [-8, 7]) for (let z = 13; z <= 15; z++) v.set(4, y, z, 'topengLS');
    v.each((x, y, z, c) => { if (c === 'jkHair' && z >= 12 && x >= 5) v.set(x, y, z, null); });
    
  }
  return v;
}

const bodyC = o => o.top === 'las' ? 'wpJ' : 'kutangJ';
function chest(o) {
  const v = new Vox(), c = bodyC(o);
  for (let z = 37; z <= 58; z++) { const t = z === 58 ? 1 : 0, w = z <= 42 ? 1 : z <= 46 ? 0 : -1; v.rrect(z, -6, -9 + w + t, 5 - t, 8 - w - t, c, z >= 57 ? 4 : 3); }
  v.rbox(-3, -3, 59, 2, 2, 62, 'jkSkin', 2);
  if (o.top === 'las') {   // wearpack: ritsleting, saku dada, lubang kecil bekas api, kerah
    for (let z = 38; z <= 58; z++) v.pf(-1, z, 'wpJS');
    for (let y = 2; y <= 6; y++) for (let z = 50; z <= 54; z++) v.pf(y, z, z === 54 ? 'wpJS' : 'wpJ');
    for (const [y, z] of [[-5, 44], [3, 41], [-3, 52], [6, 47], [-7, 48]]) v.pf(y, z, 'bolong');
    v.pf(4, 55, 'wpJK'); v.pf(5, 55, 'wpJK');
    for (let z = 59; z <= 60; z++) v.shell(z, -4, -5, 3, 4, 'wpJ', 2);
    for (let y = -1; y <= 0; y++) for (let z = 57; z <= 58; z++) v.pf(y, z, 'jkSkin');
  } else {   // kaus kutang: bahu & lengan terbuka, belahan dada
    v.paint(-6, -10, 52, 5, -6, 58, 'jkSkin'); v.paint(-6, 5, 52, 5, 9, 58, 'jkSkin');
    for (let z = 54; z <= 58; z++) for (let y = -4; y <= 3; y++) if (Math.abs(y + 0.5) <= (z - 53) * 0.7) v.pf(y, z, 'jkSkin');
    for (let z = 52; z <= 58; z++) for (const y of [-6, 5]) v.pf(y, z, 'kutangJS');
  }
  return v;
}
const legC = o => o.top === 'las' ? 'wpJ' : 'celJ';
function pelvis(o) { const c = legC(o), v = new Vox(); v.rbox(-6, -9, 30, 5, 8, 36, c, 3); v.box(-4, -2, 28, 3, 1, 29, c); if (o.top === 'las') { v.rbox(-6, -9, 35, 5, 8, 36, 'wpJS', 3); } else { v.rbox(-6, -9, 35, 5, 8, 36, 'safetyJ', 3); v.pfBox(-1, 35, 0, 36, 'safetyJK'); } return v; }
function arm(o) { const v = new Vox(), c = bodyC(o); v.rbox(-3, 8, 46, 3, 14, 58, o.top === 'las' ? c : 'jkSkin', 3); v.rrect(59, -3, 8, 3, 14, o.top === 'las' ? c : 'jkSkin', 3); return v; }
function fore(o, side) {
  const v = new Vox(), L = o.top === 'las';
  v.rbox(-3, 8, 35, 3, 14, 46, L ? 'wpJ' : 'jkSkin', 3);
  if (!L) for (const [x, y, z] of [[3, 10, 38], [3, 12, 41], [2, 9, 43], [3, 11, 36]]) v.set(x, y, z, 'jkBekas');   // bekas percikan
  if (L) { v.rbox(-4, 7, 30, 4, 15, 38, 'glovesJ', 3); v.paint(-4, 7, 38, 4, 15, 38, 'glovesJS'); v.rrect(29, -2, 9, 3, 13, 'glovesJ', 2); }   // sarung tangan kulit sampai siku bawah
  else { v.rbox(-3, 8, 30, 4, 14, 34, 'jkSkin', 3); v.rrect(29, -2, 9, 3, 13, 'jkSkin', 2); }
  if (side > 0 && !L) {   // palu ketok di tangan kanan
    for (let z = 22; z <= 33; z++) v.set(1, 11, z, 'paluG');
    v.rbox(-2, 10, 19, 4, 12, 22, 'palu', 1);
  }
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-5, 1, 20, 4, 8, 34, c, 3); v.rrect(35, -4, 2, 3, 7, c, 3); if (o.top === 'las') v.set(5, 5, 26, 'bolong'); return v; }
function shin(o) { const c = legC(o), v = new Vox(); v.rbox(-5, 1, 10, 4, 8, 20, c, 3); v.rrect(21, -4, 2, 3, 7, c, 3); v.shell(10, -6, 0, 5, 9, c, 3); return v; }
function foot() {   // sepatu safety: ujung besi, sol tebal, tinggi semata kaki
  const v = new Vox();
  v.rbox(-4, 1, 0, 8, 9, 1, 'topengLS', 3); v.rbox(-4, 1, 2, 8, 9, 5, 'safetyJ', 3); v.rbox(-4, 1, 6, 3, 9, 9, 'safetyJ', 3);
  v.paint(6, 2, 2, 8, 8, 4, 'safetyJK'); v.paint(-4, 1, 9, 3, 9, 9, 'topengLS');
  return v;
}

export const OUTFITS = {
  las: { name: 'Ngelas: topeng las diangkat + wearpack biru dongker bolong-bolong + sarung tangan kulit + sepatu safety', top: 'las', topeng: true },
  sore: { name: 'Sore: kaus kutang + celana kerja + palu ketok + sepatu safety', top: 'sore' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.las), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = bodyC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'jkSkin', shoulder: o.top === 'las' ? sl : 'jkSkin', elbow: o.top === 'las' ? sl : 'jkSkin', hip: leg, knee: leg }, SKEL, TAIL);
}
