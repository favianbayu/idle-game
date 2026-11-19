// Kirana Wijaya: NPC romance cewek, anak STM Otomotif, adik ketua Serigala Besi, pembalap jalanan paling cepat di selatan.
// Ramping, kulit kuning langsat agak gelap (sering kena matahari), rambut hitam lurus panjang diikat rendah dengan ujung
// dicat toska, mata tajam agak sipit, satu anting tindik, plester di siku/lutut. Rangka skala 1.26, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace, skullLayer } from './model.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13.5, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9.5, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-7, 0, 6];

addRamps({
  kJas: ['#141c34', '#1c2644', '#263256', '#34426c'], kJasS: ['#e8e070'],
  kSkin: ['#a8784e', '#c08c60', '#d8a878', '#e6bc90'], kSkinS: ['#c4935f'],
  kHair: ['#08080a', '#0e0e12', '#16161c', '#26262e'], kHairT: ['#34343e'], toska: ['#1e766e', '#26908a', '#2fa39a', '#52c0b6'],
  neon: ['#c85418', '#e8661e', '#ff7a2f', '#ff9a5c'], wpK: ['#121214', '#1a1a1e', '#242428', '#34343a'],
  balap: ['#1a6e66', '#228a80', '#2fa39a', '#4cbab0'], balapK: ['#101012', '#18181b', '#222226', '#303036'],
  helmK: ['#0c0c0e', '#141418', '#1e1e24', '#34343e'], visorK: ['#1c2a36', '#24384a', '#30485e', '#4a6a88'],
  stm: ['#2a4c9a'], stmS: ['#e0c040'], safety: ['#2a1e14', '#3a2a1c', '#4e3826', '#664a34'], safetyT: ['#e8b830'],
  kargoK: ['#3e4232', '#4c513e', '#5e644c', '#737a5e'], handukK: ['#d8d8d0', '#e8e8e0', '#f4f4ee', '#ffffff'],
});

/* ---------- wajah: alis lurus, 1 baris jarak, mata tajam sipit (2 baris, putih di sudut dalam), mulut kecil datar
   tepat di bawah hidung. */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'kSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, ...brow, F0, ...eyes, F0, F0, ...mouth, F0, F0];   // 15 baris, mulut mulai z 4
const BROW = ['.BBBB....BBBB.'];
const EYE = ['.KKKK....KKKK.', '..WKK....KKW..', '..WKK....KKW..'];   // mata model Rani: 3 baris, putih di sisi dalam
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0, F0]),
  kedip: F(BROW, [F0, F0, '.KKKK....KKKK.'], ['.....mmmm.....', F0, F0]),
  marah: F(['..BBB....BBB..'], EYE, ['....mmmmmm....', '....m....m....', F0]),
  teriak: F(['..BBB....BBB..'], EYE, ['....mmmmmm....', '....mTTTTm....', '.....mttm.....']),
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', F0]),
  ketawa: F(BROW, [F0, '..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', F0]),
  sakit: F(['.BB........BB.'], ['.KK........KK.', '...KK....KK...', '.KK........KK.'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const FR = [6, 11, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 9];   // poni samping menyapu ke kiri layar, alis tetap kelihatan
const topZ = (v, x, y) => { for (let z = 24; z >= -30; z--) if (v.has(x, y, z)) return z; return null; };
function helmFull(v) {   // helm full-face hitam bulat, visor gelap, motif ombak toska di samping, dagu tertutup
  const out = new Vox();
  for (let z = -4; z <= 20; z++) for (let y = -11; y <= 10; y++) for (let x = -11; x <= 11; x++) {
    const dx = (x + 0.5) / 10.2, dy = (y + 0.5) / 9.6, dz = (z - 7.5) / 12.2;
    if (dx * dx + dy * dy + dz * dz <= 1) out.set(x, y, z, 'helmK');
  }
  for (let y = -6; y <= 5; y++) for (let z = 4; z <= 11; z++) { const x = out.front(y, z); if (x !== null) out.set(x, y, z, z === 11 ? 'balapK' : 'visorK'); }
  for (const s of [-1, 1]) for (let x = -7; x <= 6; x++) {
    const zc = 7 + Math.round(Math.sin(x * 0.7) * 2), y = s > 0 ? out.sideP(x, zc) : out.sideN(x, zc);
    if (y !== null) { out.set(x, y, zc, 'toska'); out.set(x, y, zc + 1, 'toska'); }
  }
  for (let y = -3; y <= 2; y++) { const x = out.front(y, 0); if (x !== null) out.set(x, y, 0, 'toska'); }   // ventilasi dagu
  return out;
}
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skullLayer(z); v.rrect(z, a, b, c, d, 'kSkin', r); }
  for (const y of [-5, 4]) { v.set(5, y, 1, null); v.set(5, y, 2, null); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'kSkin'); v.set(7, -1, 5, 'kSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'kSkin'); v.box(-1, y, 6, -1, y, 7, 'kSkinS'); }
  if (o.helm) return helmFull(v);
  v.set(-1, 8, 5, 'kunciP'); v.set(-1, 8, 7, 'kunciP');   // tindik di satu telinga
  // rambut lurus panjang: disisir ke belakang ke ikatan rendah di tengkuk, poni samping; telinga kanan diselipkan
  const hair = new Vox();
  for (let z = 3; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'kHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -7, -7, 6, 6, 'kHair', 5); hair.rrect(17, -5, -5, 4, 4, 'kHair', 3);
  const zmin = (x, y) => x >= 5 ? FR[Math.max(0, Math.min(13, y + 7))] : y >= 7 && x >= -3 ? 9 : y <= -8 && x >= -3 ? 4 : 3;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (const [x, y] of [[6, -7], [6, -8], [5, -9], [4, -9]]) for (let z = 4; z <= 11; z++) if (!v.has(x, y, z)) v.set(x, y, z, 'kHair');   // helai poni turun di pipi kiri layar
  for (const y of [-4, -1, 2, 5]) for (let x = -6; x <= 5; x++) { const z = topZ(v, x, y); if (z !== null && z > 12 && (x + y) % 4 === 0) v.set(x, y, z, 'kHairT'); }
  // ikatan rendah + ekor lurus panjang sampai punggung, ujung 5 lapis dicat toska
  for (let y = -2; y <= 1; y++) for (let z = 3; z <= 5; z++) v.set(-9, y, z, 'balapK');
  for (let z = -20; z <= 2; z++) {
    const r = z >= -3 ? 1.8 : z >= -14 ? 2.2 : 1.6, xc = -9.5 + Math.min(0, z) * 0.05;
    for (let x = Math.floor(xc - r); x <= Math.ceil(xc + r); x++) for (let y = -3; y <= 2; y++) {
      const dx = (x + 0.5 - xc) / r, dy = (y + 0.5) / (r * 1.2);
      if (dx * dx + dy * dy <= 1 && !v.has(x, y, z)) v.set(x, y, z, z <= -16 ? 'toska' : z % 4 === 0 && y === 0 ? 'kHairT' : 'kHair');
    }
  }
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function chest(o) {
  const T = o.top, v = new Vox(), W = T === 'wear', B = T === 'balap', C = T === 'crop';
  const body = W ? 'wpK' : B ? 'balap' : C ? 'balapK' : 'white';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -4, -6 + t + w, 4 - t, 5 - t - w, body, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'kSkin', 1);
  if (C) {   // crop hoodie hitam: perut terbuka, tali hoodie, kantong
    v.paint(-4, -7, 32, 4, 6, 35, 'kSkin');
    for (let z = 36; z <= 37; z++) v.shell(z, -5, -7, 5, 6, 'kHairT', 3);
    for (const y of [-2, 1]) for (let z = 43; z <= 49; z++) v.pf(y, z, 'handukK');
    for (let z = 51; z <= 53; z++) v.shell(z, -4, -5, 3, 4, 'balapK', 2);
    return v;
  }
  if (B) {   // jaket balap toska-hitam, sisi hitam, lis oranye neon, nomor 21 di punggung, ritsleting
    v.each((x, y, z, c) => { if (c === 'balap' && (Math.abs(y + 0.5) > 4.5 || z <= 34)) v.set(x, y, z, 'balapK'); });
    for (let z = 32; z <= 51; z++) { v.pf(-1, z, 'balapK'); v.pf(0, z, 'zip'); }
    for (const s of [-1, 1]) v.psBox(s, -3, 33, 3, 50, 'neon');
    const D = { 2: ['XXX', '..X', 'XXX', 'X..', 'XXX'], 1: ['.X.', 'XX.', '.X.', '.X.', 'XXX'] };
    [[2, -1], [1, 3]].forEach(([n, y0]) => D[n].forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'X') v.pb(y0 - c, 47 - r, 'handukK'); })));
    for (let z = 52; z <= 54; z++) v.shell(z, -3, -4, 3, 3, 'balapK', 2);
    return v;
  }
  if (W) {   // wearpack hitam: ritsleting, lis oranye neon di dada & samping, handuk kecil di leher
    for (let z = 32; z <= 50; z++) v.pf(0, z, 'zip');
    for (let y = -6; y <= 5; y++) { v.pf(y, 44, 'neon'); v.pb(y, 44, 'neon'); }
    for (const s of [-1, 1]) v.psBox(s, -1, 32, 0, 50, 'neon');
    for (let z = 51; z <= 53; z++) v.shell(z, -3, -4, 3, 3, 'handukK', 2);
    for (const y of [-3, 2]) for (let z = 44; z <= 50; z++) v.pf(y, z, 'handukK', 2);
    return v;
  }
  // kemeja putih STM: logo STM (roda gigi biru) di dada kiri layar, kancing, kerah
  for (let z = 32; z <= 50; z++) v.pf(0, z, 'whiteS');
  ['.X.', 'XYX', '.X.'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pf(c - 5, 46 - r, ch === 'X' ? 'stm' : 'stmS'); }));
  v.pfBox(2, 46, 4, 46, 'tag');
  for (const [y, z] of [[-1, 50], [0, 50]]) v.pf(y, z, 'kSkin');
  for (let z = 52; z <= 53; z++) v.shell(z, -3, -4, 3, 3, 'white', 2);
  return v;
}
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-4, -6, 26, 4, 5, 33, c, 3); v.box(-3, -2, 24, 2, 1, 25, c);
  if (c === 'kargoK') v.rbox(-5, -7, 25, 5, 6, 31, c, 3);   // kargo potongan lebar
  if (o.top === 'balap') for (let z = 30; z <= 33; z++) v.shell(z, -5, -7, 4, 6, z === 30 ? 'neon' : 'balapK', 3);
  else if (o.top !== 'wear') { v.rbox(-4, -6, 32, 4, 5, 33, 'belt', 3); v.pfBox(-1, 32, 0, 33, 'buckle'); }
  if (o.top === 'crop') for (const s of [-1, 1]) v.psBox(s, -2, 27, 1, 31, 'kargoK');
  return v;
}
const legC = o => ({ wear: 'wpK', balap: 'balapK', crop: 'kargoK' }[o.top] || 'pants');
const sleeveC = o => ({ wear: 'wpK', balap: 'balap', crop: 'balapK' }[o.top] || 'white');
function arm(o) {
  const v = new Vox(), c = sleeveC(o), S = o.top === 'kemeja';
  v.rbox(-2, 6, 40, 2, 10, 50, S ? 'kSkin' : c, 2); v.rrect(51, -2, 6, 2, 10, c, 2);
  if (S) { v.paint(-2, 6, 45, 2, 10, 50, 'white'); v.shell(45, -3, 6, 3, 11, 'white', 2); }
  if (o.top === 'balap') for (let z = 40; z <= 51; z++) { v.set(0, 10, z, 'balapK'); v.set(-1, 10, z, 'neon'); }
  if (o.top === 'wear') for (let z = 40; z <= 51; z++) v.set(0, 10, z, 'neon');
  return v;
}
function fore(o, side) {
  const v = new Vox(), c = sleeveC(o), S = o.top === 'kemeja';
  v.rbox(-2, 6, 31, 2, 10, 39, S ? 'kSkin' : c, 2);
  if (S && side > 0) { v.set(-3, 8, 38, 'plaster'); v.set(-3, 9, 38, 'plaster'); v.set(-3, 8, 37, 'plasterS'); }   // plester di siku
  const G = o.top === 'balap' || o.top === 'wear';
  v.rbox(-2, 6, 27, 3, 10, 30, G ? (o.top === 'balap' ? 'balapK' : 'handukK') : 'kSkin', 2); v.rrect(26, -1, 7, 2, 9, G ? (o.top === 'balap' ? 'balapK' : 'handukK') : 'kSkin', 1);
  if (o.top === 'balap') v.paint(-2, 6, 30, 3, 10, 31, 'neon');
  if (side < 0 && !G) v.paint(-2, 6, 31, 2, 10, 32, 'balapK');   // gelang karet hitam
  if (o.top === 'wear') for (let z = 31; z <= 39; z += 4) v.pf(8, z, 'oli');
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-3, 1, 17, 2, 6, 30, c, 2); v.rrect(31, -2, 2, 1, 5, c, 2); if (c === 'kargoK') { v.rbox(-4, 1, 17, 3, 8, 30, c, 3); v.rrect(31, -3, 1, 2, 7, c, 3); } if (o.top === 'balap') for (let z = 17; z <= 31; z++) v.set(0, 6, z, 'neon'); if (o.top === 'crop') v.rbox(-1, 8, 20, 2, 9, 25, 'kargoK', 1); return v; }
function shin(o) {
  const c = legC(o), v = new Vox(); v.rbox(-3, 1, 6, 2, 6, 17, c, 2); v.rrect(18, -2, 2, 1, 5, c, 2);
  if (o.top === 'balap') for (let z = 6; z <= 17; z++) v.set(0, 6, z, 'neon');
  if (o.top === 'crop') { v.rbox(-4, 1, 9, 3, 8, 17, 'kargoK', 3); v.rrect(18, -3, 1, 2, 7, 'kargoK', 3); v.rbox(-3, 1, 6, 2, 6, 9, 'kick', 2); }   // kargo lebar menggantung di atas sneakers tinggi putih
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'crop') { v.rbox(-4, 1, 0, 6, 6, 1, 'sole', 2); v.rbox(-4, 1, 2, 6, 6, 3, 'kick', 2); v.rbox(-3, 1, 4, 2, 6, 6, 'kick', 2); for (const x of [1, 3]) v.paint(x, 2, 4, x, 5, 5, 'kickK'); return v; }
  if (o.top === 'balap') { v.rbox(-4, 1, 0, 6, 6, 1, 'neon', 2); v.rbox(-4, 1, 2, 6, 6, 4, 'balapK', 2); v.rbox(-3, 1, 5, 2, 6, 7, 'balapK', 2); return v; }
  // sepatu safety cokelat tua, ujung baja kuning
  v.rbox(-4, 1, 0, 6, 6, 1, 'belt', 2); v.rbox(-4, 1, 2, 6, 6, 4, 'safety', 2); v.rbox(-3, 1, 5, 2, 6, 6, 'safety', 2);
  v.paint(5, 2, 2, 6, 5, 3, 'safetyT');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam STM: kemeja logo STM + celana abu + sepatu safety', top: 'kemeja' },
  bengkel: { name: 'Wearpack hitam lis oranye neon + handuk di leher', top: 'wear' },
  balap: { name: 'Jaket balap toska-hitam #21 + helm full-face', top: 'balap', helm: true, helmOk: true },
  jalan: { name: 'Crop hoodie hitam + kargo + sneakers tinggi', top: 'crop' },
};
OUTFITS.hujan = { ...OUTFITS.balap, name: 'Hujan: jas hujan setelan motor (biru dongker, lis reflektor) + helm',
  sw: { balap: 'kJas', balapK: 'kJas', toska: 'kJas', neon: 'kJasS' } };
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const base = OUTFITS[opt.outfit || 'seragam'];
  const o = { ...base, expr: opt.expr || 'biasa', face: opt.face, helm: base.helm || !!opt.helm };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'kSkin', shoulder: sl, elbow: o.top === 'kemeja' ? 'kSkin' : sl, hip: leg, knee: leg }, SKEL, TAIL);
}
