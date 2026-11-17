// Mas Fajar: montir 20 tahun, anggota senior Lampu Kota, tinggal di kamar bengkel Kampung Bantaran, ikut paket C.
// Rambut jabrik, kaus kerja penuh noda oli, jeans robek, handuk di leher, gelang karet di tangan, senyum ramah capek.
// Rangka keluarga Arga (skala 1.34), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  faSkin: ['#80502e', '#9a663e', '#b8805a', '#c8926a'], faSkinS: ['#9a6844'], faOli: ['#24201c'],
  faHair: ['#0c0a08', '#14100c', '#1a1410', '#2a221c'], faHairT: ['#3a2e24'],
  kerjaF: ['#34404c', '#3e4c5a', '#4a5a6a', '#5e7084'], kerjaFS: ['#2a3440'], handukF: ['#c8c4b8', '#d8d4c8', '#e6e2d6', '#f2eee4'], handukFS: ['#c84a3a'],
  jeansF: ['#1e2840', '#283654', '#2a3a5a', '#3e5276'], gelang: ['#e8c040'], sepatuF: ['#2a2420', '#342c26', '#40362e', '#54483e'],
  kausF: ['#e8e4da', '#f2eee4', '#faf8f2', '#ffffff'],
});

/* ---------- wajah: alis tebal miring 2 baris + 1 baris jarak, mata ramah agak capek (kelopak turun), senyum miring
   tepat di bawah hidung, noda oli di pipi kanan */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'faSkinS', o: 'faOli' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, ...brow, F0, ...eyes, '..........o...', F0, F0, ...mouth, F0, F0, F0];   // 15 baris, mulut z 4
const BROW = ['.BBBB....BBBB.', '..BBB....BBB..'];
const EYE = ['.sKKK....KKKs.', '..KWK....KWK..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmmm.m..', F0]),
  kedip: F(BROW, [F0, '.KKKK....KKKK.'], ['.....mmmmm.m..', F0]),
  marah: F(['.BB........BB.', '...BBB..BBB...'], EYE, ['....mmmmmm....', F0]),
  teriak: F(['.BB........BB.', '...BBB..BBB...'], EYE, ['....mTTTTm....', '.....mttm.....']),
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....']),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....']),
};
export const EXPRS = Object.keys(FACES);

const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
const topZ = (v, x, y) => { for (let z = 30; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'faSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'faSkin'); v.set(7, -1, 5, 'faSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'faSkin'); v.box(-1, y, 6, -1, y, 7, 'faSkinS'); }
  // jabrik: lapis dasar + paku-paku runcing mencuat ke atas & belakang
  const hair = new Vox();
  for (let z = 5; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, 'faHair', z <= 12 ? 4 : 5);
  hair.rrect(16, -8, -8, 6, 7, 'faHair', 5);
  const zmin = (x, y) => x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -3 ? 10 : 5;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  const spikes = [[5, -5], [5, -1], [5, 3], [2, -7], [2, -3], [2, 1], [2, 5], [-1, -6], [-1, -2], [-1, 2], [-1, 6], [-4, -5], [-4, -1], [-4, 3], [-7, -3], [-7, 1]];
  for (const [sx, sy] of spikes) {   // paku: alas 3x3 mengecil, condong ke belakang
    const h = 3 + (rnd(sx, sy, 3) % 3), base = topZ(v, sx, sy) ?? 15;
    for (let k = 1; k <= h; k++) { const r = k <= 1 ? 1 : 0, lean = Math.floor(k / 2), cx = sx - lean - (sx >= 4 ? 0 : 0); for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) v.set(cx + dx, sy + dy, base + k, k === h ? 'faHairT' : 'faHair'); }
  }
  for (const [y, z] of [[-4, 14], [-1, 14], [3, 14], [-4, 13], [3, 13]]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'faHair'); }   // ujung poni jabrik ke depan
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function chest(o) {
  const v = new Vox(), T = o.top, body = T === 'lampu' ? 'jk' : T === 'santai' ? 'kausF' : 'kerjaF';
  for (let z = 34; z <= 56; z++) { const w = z <= 40 ? 1 : z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -8 + w + t, 4 - t, 7 - w - t, body, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'faSkin', 2);
  if (T === 'lampu') {   // jaket Lampu Kota: lis kuning, ritsleting, bohlam di punggung
    for (let z = 34; z <= 54; z++) { v.pf(-1, z, 'jkG'); v.pf(0, z, 'jkG'); }
    for (let z = 47; z <= 48; z++) for (let y = -7; y <= 6; y++) { const x = v.front(y, z); if (x !== null && v.get(x, y, z) === 'jk') v.set(x, y, z, 'jkY'); v.pb(y, z, 'jkY'); }
    for (let z = 57; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'jkY', 2);
    ['.XXXX.', 'XXXXXX', 'XXXXXX', '.XXXX.', '.SSSS.', '..SS..'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pb(c - 3, 52 - r, ch === 'X' ? 'jkY' : 'jkG'); }));
    return v;
  }
  for (let y = -2; y <= 1; y++) v.pf(y, 56, 'faSkin');
  v.shell(57, -4, -4, 3, 3, body, 2);
  if (T === 'bengkel') {   // kaus kerja abu-biru penuh noda oli, nama bengkel di dada
    v.each((x, y, z, c) => { if (c === 'kerjaF' && rnd(x, y, z) % 11 === 0) v.set(x, y, z, 'faOli'); });
    v.each((x, y, z, c) => { if (c === 'kerjaF' && rnd(x, y, z) % 17 === 0) v.set(x, y, z, 'kerjaFS'); });
    for (const [y, z] of [[2, 39], [3, 39], [3, 38], [-5, 42], [-4, 41], [-5, 41], [1, 36]]) v.pf(y, z, 'faOli');   // cap tangan oli
    v.pfBox(-6, 50, -3, 51, 'kausF');
  }
  if (o.towel) {   // handuk di leher, ujung menjuntai di dada (garis merah)
    for (let z = 56; z <= 58; z++) v.shell(z, -4, -5, 4, 4, 'handukF', 2);
    for (const y of [-5, -4, 3, 4]) for (let z = 45; z <= 55; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === 47 ? 'handukFS' : 'handukF'); }
  }
  return v;
}
function pelvis(o) {
  const c = 'jeansF', v = new Vox();
  v.rbox(-5, -7, 28, 4, 6, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'lampu') for (let z = 31; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 31 ? 'jkY' : 'jk', 3);
  else { v.rbox(-5, -7, 32, 4, 6, 33, 'belt', 3); v.pfBox(-1, 32, 0, 33, 'buckle'); }
  if (o.top === 'bengkel') {   // kain lap merah di saku belakang, obeng di saku samping
    for (let z = 26; z <= 31; z++) for (let y = 1; y <= 4; y++) { const x = v.back(y, z); if (x !== null) v.set(x - 1, y, z, z <= 27 ? 'handukFS' : 'handukFS'); }
    for (let z = 27; z <= 33; z++) v.set(1, 7, z, z >= 32 ? 'jkY' : 'zip');
  }
  return v;
}
const sleeveC = o => ({ lampu: 'jk', santai: 'kausF', bengkel: 'kerjaF' }[o.top]);
function arm(o) {
  const v = new Vox(), c = sleeveC(o), L = o.top === 'lampu';
  v.rbox(-3, 7, 43, 2, 12, 55, L ? c : 'faSkin', 2); v.rrect(56, -3, 7, 2, 12, c, 3);
  if (!L) { v.paint(-3, 7, 49, 2, 12, 56, c); v.shell(49, -4, 7, 3, 13, c, 2); }
  if (L) for (let z = 43; z <= 55; z++) v.set(0, 12, z, 'jkY');
  return v;
}
function fore(o, side) {
  const v = new Vox(), L = o.top === 'lampu';
  v.rbox(-3, 7, 31, 2, 12, 42, L ? 'jk' : 'faSkin', 2);
  v.rbox(-3, 7, 27, 3, 12, 30, L ? 'glove' : 'faSkin', 2); v.rrect(26, -2, 8, 2, 11, 'faSkin', 2);
  if (L) { v.paint(-3, 7, 31, 2, 12, 32, 'jkY'); for (let z = 31; z <= 42; z++) v.set(0, 12, z, 'jkY'); }
  if (!L) { v.shell(31, -4, 7, 3, 13, side > 0 ? 'gelang' : 'karet', 2); if (side > 0) v.shell(32, -4, 7, 3, 13, 'karet', 2); }   // gelang karet
  if (o.top === 'bengkel' && !L) for (const [x, y, z] of [[3, 9, 28], [3, 10, 27], [2, 12, 33], [3, 8, 30], [-3, 9, 36]]) v.set(x, y, z, 'faOli');
  return v;
}
function thigh(o) {
  const v = new Vox(); v.rbox(-4, 2, 18, 3, 7, 31, 'jeansF', 3); v.rrect(32, -3, 2, 2, 7, 'jeansF', 3);
  if (o.top !== 'lampu') for (const [y, z] of [[3, 20], [4, 20], [5, 19], [4, 21], [3, 26], [4, 26]]) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, z === 21 || z === 26 ? 'kausF' : 'faSkin'); }   // robek di lutut & paha
  return v;
}
function shin(o) {
  const v = new Vox(); v.rbox(-4, 2, 8, 3, 7, 18, 'jeansF', 3); v.rrect(19, -3, 2, 2, 7, 'jeansF', 3);
  v.rbox(-4, 2, 5, 3, 7, 7, o.top === 'santai' ? 'faSkin' : 'sepatuF', 3);
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'santai') {   // sandal jepit
    v.rbox(-4, 1, 0, 7, 8, 0, 'belt', 2); v.rbox(-3, 2, 1, 6, 7, 2, 'faSkin', 2); v.rbox(-3, 2, 3, 2, 7, 4, 'faSkin', 2);
    for (const [x, y] of [[5, 4], [4, 3], [4, 5], [3, 2], [3, 6]]) v.set(x, y, 2, 'handukFS');
    return v;
  }
  v.rbox(-5, 1, 0, 7, 8, 1, 'sole', 3); v.rbox(-5, 1, 2, 7, 8, 4, 'sepatuF', 3); v.rbox(-5, 1, 5, 2, 8, 6, 'sepatuF', 3);   // sepatu kerja
  v.paint(5, 1, 2, 7, 8, 3, 'faOli'); for (const x of [1, 3]) v.paint(x, 3, 4, x, 6, 4, 'belt');
  return v;
}

export const OUTFITS = {
  bengkel: { name: 'Bengkel: kaus kerja penuh oli + jeans robek + handuk + gelang karet', top: 'bengkel', towel: true },
  lampu: { name: 'Jaket Lampu Kota + sarung tangan + jeans', top: 'lampu' },
  santai: { name: 'Santai: kaus putih + jeans + sandal jepit + handuk', top: 'santai', towel: true },
};
export function build(opt = {}) {
  // game memanggil 'seragam': Mas Fajar memakai baju bengkel
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.bengkel), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'faSkin', shoulder: sl, elbow: o.top === 'lampu' ? 'jk' : 'faSkin', hip: 'jeansF', knee: 'jeansF' }, SKEL, TAIL);
}
