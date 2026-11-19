// Ustaz Hasan: imam musala Al-Ikhlas di Kenanga, 50-an, tenang dan sabar ("Jangan lupa salat, Nak."). Kulit sawo matang,
// janggut tipis beruban di dagu, kumis tipis, peci haji putih rajut, gamis putih sampai mata kaki, sorban kotak merah-putih
// di bahu, tasbih kayu di tangan kanan, sandal kulit. Harian: koko krem + sarung kotak cokelat + peci hitam + Al-Qur'an.
// Rangka keluarga Arga sedikit kurus, voxel 1/64 petak. Gamis & sarung memakai isi rok (P.skirt) supaya tidak terbelah saat jalan.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  uhSkin: ['#94603a', '#a87044', '#b88050', '#c8905e'], uhSkinS: ['#9c663e'], uhHair: ['#2a2622', '#36322c', '#423e38', '#504a44'],
  uhJenggot: ['#6a645c', '#7c766c', '#8e887e', '#a29c92'], uhJenggotS: ['#4a4640'], uhJidat: ['#7a4a2a'],
  gamisH: ['#d8d8d2', '#e6e6e0', '#f2f2ee', '#fbfbf8'], gamisHS: ['#bcbcb4'],
  pecHaji: ['#e6e4dc', '#eeece6', '#f6f4ee', '#fcfbf8'], pecHajiS: ['#ccc8bc'],
  sorban: ['#b8242a', '#c82e32', '#d63a3c', '#e44c4c'], sorbanP: ['#f2f0ea'],
  uhTasbih: ['#4a2a14', '#5a341a', '#6a4020', '#7c4c28'],
  kokoH: ['#c8b890', '#d6c8a0', '#e2d6b0', '#ece2c2'], kokoHS: ['#a8986e'],
  srH: ['#4a3020', '#5a3a28', '#6a4630', '#7c543a'], srHS: ['#2e1c10'], srHK: ['#c8a060'],
  pecHitam: ['#121216', '#1a1a20', '#24242a', '#303038'], quran: ['#1e5a3a', '#266a46', '#2e7a52', '#3a8c60'], quranE: ['#d8b040'],
  sandalH: ['#3a2416', '#4a2e1c', '#5a3824', '#6c442c'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'uhSkinS', k: 'uhJenggot', j: 'uhJenggot' };
const F0 = '..............';
const F = (brow, eyes, m1, m2) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, '....kkkkkk....', m1, m2, ...BEARD];   // alis z 11, kumis z 5, mulut z 4, janggut z 2..0
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
const BEARD = ['..jj......jj..', '..jjjjjjjjjj..', '...jjjjjjjj...'];
const SIDE = '..j........j..';
export const FACES = {
  biasa: F(BROW, EYE, '....mmmmmm....', SIDE),
  kedip: F(BROW, [F0, '..KKK....KKK..'], '....mmmmmm....', SIDE),
  marah: F('...BB....BB...', EYE, '....mmmmmm....', '..jm......mj..'),
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], '....mTTTTm....', '..j.mttttm.j..'),
  nyengir: F(BROW, EYE, '...mTTTTTTm...', '..j.mmmmmm.j..'),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], '...mTTTTTTm...', '..jmttttttmj..'),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], '....mmmmmm....', SIDE),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'uhSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'uhSkin'); v.set(7, -1, 5, 'uhSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'uhSkin'); v.box(-1, y, 6, -1, y, 7, 'uhSkinS'); }
  // janggut tipis: menebal di dagu, turun sedikit di bawah rahang, menyambung ke cambang tipis
  for (let z = -2; z <= 0; z++) for (let y = -4; y <= 3; y++) { if (z === -2 && Math.abs(y + 0.5) > 2.5) continue; const x = (v.front(y, Math.max(z, 0)) ?? 4); v.set(x - (z < 0 ? 1 : 0), y, z, z === -2 ? 'uhJenggotS' : 'uhJenggot'); }
  for (const s of [-1, 1]) for (let z = 1; z <= 6; z++) { const y = s > 0 ? 6 : -7, x = v.front(y, z); if (x !== null) v.set(x, y, z, 'uhJenggot'); }
  v.set(7, -1, 12, 'uhJidat'); v.set(7, 0, 12, 'uhJidat');   // tanda sujud tipis di dahi
  const hair = new Vox();   // rambut pendek beruban, hampir tertutup peci
  for (let z = 6; z <= 14; z++) hair.rrect(z, -8, -8, 7, 7, 'uhHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 99 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 6)) v.set(x, y, z, c); });
  const cap = o.top === 'gamis' ? 'pecHaji' : 'pecHitam';
  for (let z = 13; z <= 20; z++) for (let x = -9; x <= 8; x++) for (let y = -9; y <= 8; y++) {
    const r = z >= 19 ? 0.85 : 1, d = ((x + 0.5) / (8.6 * r)) ** 2 + ((y + 0.5) / (8.4 * r)) ** 2;
    if (d <= 1 && (d > 0.6 || z >= 19)) v.set(x, y, z, cap === 'pecHaji' && (x + y + z) % 3 === 0 ? 'pecHajiS' : cap);   // peci haji rajut berlubang-lubang
  }
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
const bodyC = o => o.top === 'gamis' ? 'gamisH' : 'kokoH';
const skC = o => o.top === 'gamis' ? ['gamisH', 'gamisHS'] : ['srH', 'srHS'];
const kotak = v => { v.each((x, y, z, k) => { if (k !== 'srH') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x; if ((u + 40) % 4 === 0 || z % 4 === 0) v.set(x, y, z, (z % 8 === 0 && (u + 40) % 4 === 0) ? 'srHK' : 'srHS'); }); return v; };
const sk = (o, v) => o.top === 'gamis' ? v : kotak(v);
function chest(o) {
  const v = new Vox(), c = bodyC(o);
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -8 + w + t, 4 - t, 7 - w - t, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'uhSkin', 2);
  for (let z = 56; z <= 58; z++) v.shell(z, -4, -5, 3, 4, c, 2);   // kerah tegak
  for (let z = 44; z <= 55; z++) v.pf(-1, z, bodyC(o) + 'S');
  if (o.top === 'gamis') {   // sorban kotak merah-putih: melingkar di tengkuk, dua ujung menjuntai di dada
    for (let y = -8; y <= 7; y++) { const xb = v.back(y, 56); if (xb !== null) for (let z = 54; z <= 57; z++) v.set(xb - 1, y, z, 'sorban'); }
    for (const [y0, y1] of [[-7, -4], [3, 6]]) for (let z = 40; z <= 57; z++) for (let y = y0; y <= y1; y++) { const x = v.front(y, Math.min(z, 55)); if (x !== null) v.set(x + 1, y, z, (y + z) % 3 === 0 ? 'sorbanP' : 'sorban'); }
    for (const y of [-7, -5, 3, 5]) { const x = v.front(y, 40); v.set(x, y, 39, 'sorbanP'); }   // rumbai
  } else for (let z = 46; z <= 54; z++) for (const y of [-4, 3]) if (z % 2 === 0) v.pf(y, z, 'kokoHS');
  return v;
}
function pelvis(o) {
  const [c, cS] = skC(o), v = new Vox();
  v.rbox(-5, -8, 26, 4, 7, 33, c, 3);
  for (let z = 22; z <= 33; z++) { const f = z <= 27 ? 1 : 0; v.shell(z, -6 - f, -9 - f, 5 + f, 8 + f, c, 3); }
  if (o.top !== 'gamis') { for (let z = 31; z <= 33; z++) v.shell(z, -6, -9, 5, 8, 'kokoH', 3); v.rbox(-6, -9, 30, 5, 8, 30, 'srHS', 3); }   // koko menutupi gulungan sarung
  return sk(o, v);
}
function arm(o) { const v = new Vox(), c = bodyC(o); v.rbox(-3, 8, 43, 2, 12, 55, c, 2); v.rrect(56, -3, 8, 2, 12, c, 3); return v; }
function fore(o, side) {
  const v = new Vox(), c = bodyC(o);
  v.rbox(-3, 8, 31, 2, 12, 42, c, 2); v.shell(31, -4, 7, 3, 13, c + 'S', 2);   // lengan panjang lebar
  v.rbox(-3, 8, 27, 3, 12, 30, 'uhSkin', 2); v.rrect(26, -2, 9, 2, 11, 'uhSkin', 2);
  if (side > 0 && o.top === 'gamis') for (let a = 0; a < 26; a++) {   // tasbih kayu menjuntai dari kepalan
    const t = a / 26 * Math.PI * 2, x = Math.round(Math.sin(t) * 2.5), z = Math.round(21 - (1 - Math.cos(t)) * 4.5);
    v.set(x, 10, z, 'uhTasbih');
  }
  if (side < 0 && o.top !== 'gamis') { v.rbox(-4, 7, 18, 4, 9, 29, 'quran', 1); v.paint(-4, 7, 18, 4, 7, 29, 'quranE'); v.set(0, 6, 24, 'quranE'); }   // Al-Qur'an dikepit
  return v;
}
function thigh(o) { const [c] = skC(o), v = new Vox(); v.rbox(-4, 1, 17, 4, 9, 31, c, 3); v.rrect(32, -3, 2, 2, 8, c, 3); return sk(o, v); }
function shin(o) {
  const [c, cS] = skC(o), v = new Vox();
  for (let z = 5; z <= 18; z++) { const f = z <= 9 ? 1 : 0; v.rrect(z, -4 - f, 1 - f, 4 + f, 9 + f, z === 5 ? cS : c, 3); }
  v.rbox(-2, 3, 3, 2, 7, 4, 'uhSkin', 2);   // mata kaki
  return sk(o, v);
}
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 1, 'sandalH', 3); v.rbox(-3, 2, 2, 6, 7, 2, 'uhSkin', 2); v.rbox(-3, 2, 3, 2, 7, 3, 'uhSkin', 2);
  v.paint(2, 1, 2, 4, 8, 2, 'sandalH');   // tali sandal kulit melintang
  return v;
}

export const OUTFITS = {
  gamis: { name: 'Imam: gamis putih + peci haji rajut + sorban kotak merah-putih + tasbih kayu', top: 'gamis' },
  harian: { name: 'Harian: koko krem + sarung kotak cokelat + peci hitam + Al-Qur\'an', top: 'harian', propOn: 'all' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.gamis), expr: opt.expr || 'biasa', face: opt.face };
  const [c, cS] = skC(o), A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = bodyC(o);
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'uhSkin', shoulder: sl, elbow: sl, hip: c, knee: c }, SKEL, TAIL);
  P.skirt = { mats: [P.mat(c), P.mat(cS)], fill: P.mat(c), parts: ['pelvis', 'thighL', 'thighR', 'shinL', 'shinR'] };
  return P;
}
