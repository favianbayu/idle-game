// Arga: NPC utama cowok, anggota muda Lampu Kota, pendiam, cucu Pak Ujang penjaga sekolah. Ramping berotot, kulit sawo
// matang gelap, rambut buzz cut, bekas luka tipis memotong alis kanan, mata sayu waspada, lesung pipit kiri saat senyum.
// Seragam dikeluarkan + jaket kulit cokelat warisan ayah, boots hitam. Rangka skala ±1.32 (tinggi pinggul = Raka), voxel 1/64.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  aSkin: ['#7a4a2e', '#94603d', '#b07a52', '#c48c62'], aSkinS: ['#94603d'], aScar: ['#d8a07a'],
  aBuzz: ['#1a1413', '#241c19', '#30251f', '#3e3028'], aBuzzT: ['#4a3a30'],
  kulit: ['#2e1c12', '#3e271a', '#5a3a28', '#74503a'], kulitS: ['#8a6448'], zip: ['#a0a4ad'],
  asap: ['#4e5258', '#62666d', '#7b7f86', '#959aa2'], kerja: ['#3a3628', '#4a4532', '#5c563f', '#716a50'], kunci: ['#d9b44a'],
  flanel: ['#4a4e56', '#5c6069', '#72767f', '#8b9099'], flanelK: ['#2e3036'], jeansK: ['#121116', '#1a1a20', '#24242c', '#33333d'],
  boots: ['#0b0a0d', '#141317', '#1f1e24', '#34333c'],
});

/* ---------- wajah: mata sayu tajam, alis tebal (alis kanan terpotong bekas luka), mulut datar, lesung pipit kiri */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'aSkinS', x: 'aScar' };
const F0 = '..............';
const F = (brow, eyes, mid, mouth) => [F0, F0, F0, ...brow, ...eyes, ...mid, ...mouth, F0, F0];
const MID = ['..........x...', '..............'];
const BROW = ['..........x...', '.BBBB....B.BB.', '..........x...'];
export const FACES = {
  biasa: F(BROW, ['.KKKK....KKKK.', '..WKK....KKW..'], MID, ['..............', '.....mmmm.....']),
  kedip: F(BROW, ['..............', '.KKKK....KKKK.'], MID, ['..............', '.....mmmm.....']),
  marah: F(['..........x...', '..BBB....B.B..', '....BB..BB....'], ['.KKKK....KKKK.', '..WKK....KKW..'], MID, ['..............', '....mmmmmm....']),
  teriak: F(['..........x...', '..BBB....B.B..', '....BB..BB....'], ['.KKKK....KKKK.', '..WKK....KKW..'], ['..........x...', '....mmmmmm....'], ['....mTTTTm....', '.....mmmm.....']),
  nyengir: F(BROW, ['.KKKK....KKKK.', '..WKK....KKW..'], MID, ['..s.......m...', '.....mmmmm....']),
  ketawa: F(BROW, ['..............', '.KKKK....KKKK.'], MID, ['..s.mTTTTm....', '.....mmmm.....']),
  sakit: F(['...BB....B.B..', '.BB........BB.', '..........x...'], ['.KK........KK.', '...KK....KK...'], MID, ['....mmmmmm....', '....TTTTTT....']),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'aSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 4, 7, 0, 6, 'aSkin'); v.set(7, -1, 3, 'aSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'aSkin'); v.box(-1, y, 6, -1, y, 7, 'aSkinS'); }
  // buzz cut: satu lapis tipis rata mengikuti bentuk kepala, tekstur bintik pangkal rambut
  const hair = new Vox();
  for (let z = 4; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'aBuzz', 4);
  hair.rrect(16, -6, -6, 5, 5, 'aBuzz', 4);
  const zmin = (x, y) => x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 4;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  v.each((x, y, z, c) => { if (c === 'aBuzz' && (((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0) % 7 === 0) v.set(x, y, z, 'aBuzzT'); });
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function chest(o) {
  const v = new Vox(), K = o.top === 'kulit', LK = o.top === 'lampu', T = o.top === 'kaus', FL = o.top === 'flanel';
  const body = K ? 'kulit' : LK ? 'jk' : T ? 'asap' : FL ? 'flanel' : 'white';
  for (let z = 34; z <= 56; z++) {   // ramping berotot: dada lebih lebar dari pinggang
    const w = z <= 40 ? 1 : z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0;
    v.rrect(z, -5, -8 + w + t, 4 - t, 7 - w - t, body, z >= 55 ? 4 : 3);
  }
  v.rbox(-3, -3, 57, 2, 2, 60, 'aSkin', 2);
  if (T) { for (let y = -2; y <= 1; y++) v.pf(y, 56, 'aSkin'); v.shell(57, -3, -4, 3, 3, 'asap', 2); return v; }
  if (LK) {   // jaket Lampu Kota: lis kuning di dada & lengan, ritsleting, logo lampu di punggung
    for (let z = 34; z <= 54; z++) { v.pf(-1, z, 'jkG'); v.pf(0, z, 'jkG'); }
    for (let z = 47; z <= 48; z++) for (let y = -7; y <= 6; y++) { const x = v.front(y, z); if (x !== null && v.get(x, y, z) === 'jk') v.set(x, y, z, 'jkY'); v.pb(y, z, 'jkY'); }
    for (let z = 57; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'jkY', 2);
    ['.XXXX.', 'XXXXXX', 'XXXXXX', '.XXXX.', '.SSSS.', '..SS..'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pb(c - 3, 52 - r, ch === 'X' ? 'jkY' : 'jkG'); }));
    return v;
  }
  if (K || FL) {   // jaket kulit / flanel terbuka; kemeja seragam (K) atau kaus abu (FL) di dalam
    const inner = K ? 'white' : 'asap';
    for (let z = 34; z <= 56; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x === null) continue; v.set(x, y, z, null); v.set(x - 1, y, z, inner); }
    for (let z = 34; z <= 55; z++) { v.pf(-4, z, K ? 'zip' : 'flanelK'); v.pf(3, z, K ? 'kulitS' : 'flanelK'); }
    if (K) { for (let z = 57; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'kulit', 2); for (const y of [-6, 5]) for (let z = 44; z <= 46; z++) v.pf(y, z, 'kulitS'); for (let y = -7; y <= 6; y++) v.pb(y, 50, 'kulitS'); }
    if (FL) { for (let z = 35; z <= 55; z += 3) for (let y = -8; y <= 7; y++) { if (Math.abs(y + 0.5) > 3.5) v.pf(y, z, 'flanelK'); v.pb(y, z, 'flanelK'); } for (let y = -7; y <= 6; y += 3) for (let z = 34; z <= 55; z++) v.pb(y, z, 'flanelK'); }
    if (K) { for (let z = 36; z <= 52; z++) v.pf(0, z, 'whiteS'); for (const [y, z] of [[-1, 55], [0, 55], [-1, 54], [0, 54]]) v.pf(y, z, 'aSkin'); }
    return v;
  }
  return v;
}
function pelvis(o) {
  const v = new Vox(), c = o.bot === 'jeansK' ? 'jeansK' : o.bot === 'kerja' ? 'kerja' : o.bot === 'jeans' ? 'jeans' : 'pants';
  v.rbox(-5, -7, 28, 4, 6, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'kulit') {   // kemeja dikeluarkan menggantung di bawah jaket, ujung jaket kulit
    for (let z = 28; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'white', 3);
    for (let z = 32; z <= 33; z++) { v.shell(z, -7, -9, 6, 8, 'kulit', 3); for (let y = -3; y <= 2; y++) for (const x of [6, 5]) if (v.get(x, y, z) === 'kulit') v.set(x, y, z, null); }
  } else if (o.top === 'lampu') for (let z = 31; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 31 ? 'jkY' : 'jk', 3);
  else if (o.top === 'flanel') for (let z = 29; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 29 ? 'flanelK' : 'flanel', 3);
  else { v.rbox(-5, -7, 32, 4, 6, 33, 'belt', 3); for (const [y, z] of [[3, 31], [4, 30], [4, 29]]) v.pf(y, z, 'kunci'); }   // kunci-kunci di pinggang
  return v;
}
function sleeve(o) { return { kulit: 'kulit', lampu: 'jk', flanel: 'flanel', kaus: 'asap' }[o.top]; }
function arm(o) {
  const v = new Vox(), c = sleeve(o);
  v.rbox(-3, 7, 43, 2, 12, 55, c === 'asap' ? 'aSkin' : c, 2); v.rrect(56, -3, 7, 2, 12, c, 3);
  if (c === 'asap') { v.paint(-3, 7, 49, 2, 12, 56, 'asap'); v.shell(48, -4, 7, 3, 13, 'asap', 2); }
  if (c === 'jk') for (let z = 43; z <= 55; z++) v.set(0, 12, z, 'jkY');
  return v;
}
function fore(o, side) {
  const v = new Vox(), c = sleeve(o), L = c && c !== 'asap';
  v.rbox(-3, 7, 31, 2, 12, 42, L ? c : 'aSkin', 2);
  v.rbox(-3, 7, 27, 3, 12, 30, o.top === 'lampu' ? 'glove' : 'aSkin', 2); v.rrect(26, -2, 8, 2, 11, 'aSkin', 2);   // sarung tangan tanpa jari
  if (o.top === 'kulit') for (let z = 36; z <= 37; z++) v.shell(z, -4, 7, 3, 13, 'kulitS', 2);   // lengan jaket didorong ke siku
  if (o.top === 'kulit') v.paint(-3, 7, 31, 2, 12, 35, 'aSkin');
  if (o.top === 'lampu') { v.paint(-3, 7, 31, 2, 12, 32, 'jkY'); for (let z = 31; z <= 42; z++) v.set(0, 12, z, 'jkY'); }
  return v;
}
function legC(o) { return o.bot === 'jeansK' ? 'jeansK' : o.bot === 'kerja' ? 'kerja' : o.bot === 'jeans' ? 'jeans' : 'pants'; }
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-4, 2, 18, 3, 7, 31, c, 3); v.rrect(32, -3, 2, 2, 7, c, 3); if (o.bot === 'kerja') v.psBox(1, -2, 21, 1, 26, 'kerja'); return v; }
function shin(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-4, 2, 9, 3, 7, 18, c, 3); v.rrect(19, -3, 2, 2, 7, c, 3);
  v.rbox(-4, 2, 5, 3, 7, 9, 'boots', 3);   // leher boots di bawah celana
  return v;
}
function foot() {   // boots hitam, sol tebal, tali
  const v = new Vox();
  v.rbox(-5, 1, 0, 7, 8, 1, 'sole', 3); v.paint(-5, 1, 0, 7, 8, 1, 'boots');
  v.rbox(-5, 1, 1, 7, 8, 1, 'jeansK', 3);
  v.rbox(-5, 1, 2, 7, 8, 4, 'boots', 3); v.rbox(-5, 1, 5, 2, 8, 7, 'boots', 3);
  for (const x of [1, 3, 5]) v.paint(x, 3, 4, x, 6, 4, 'zip');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam dikeluarkan + jaket kulit', top: 'kulit' },
  lampu: { name: 'Jaket Lampu Kota + sarung tangan', top: 'lampu', bot: 'jeans' },
  jalan: { name: 'Flanel abu + jeans hitam', top: 'flanel', bot: 'jeansK' },
  kerja: { name: 'Bantu kakek: kaus abu + celana kerja', top: 'kaus', bot: 'kerja' },
};
export function build(opt = {}) {
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeve(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'aSkin', shoulder: sl, elbow: sl === 'asap' || o.top === 'kulit' ? 'aSkin' : sl, hip: legC(o), knee: legC(o) }, SKEL, TAIL);
}
