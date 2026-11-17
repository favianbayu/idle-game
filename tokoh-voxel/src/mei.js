// Mei Lestari: NPC romance cewek, anak pemilik Toko Buku Pena, ilustrator, ceria tapi canggung, sekolah di SMA Bina Bangsa.
// Paling mungil, kulit kuning langsat, rambut bob sebahu hitam dengan jepit pensil kuning, kacamata bulat besar, pipi
// tembam, mata sipit (hilang saat tertawa), noda tinta di jari kanan. Rangka keluarga Rani (1.24), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace, skullLayer } from './model.js';
import { skirtPelvis, skirtPanel, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-7, 0, 6];

addRamps({
  meSkin: ['#c8a07a', '#dcb690', '#f0cfa8', '#f8dcbc'], meSkinS: ['#dcb08a'], meBlush: ['#f0a090'],
  meHair: ['#08080a', '#101014', '#18181e', '#28282f'], meHairT: ['#363642'],
  pensil: ['#e3b23c'], pensilT: ['#f4ead2'], bulat: ['#3a2a1e', '#4a3626', '#5c4430', '#74583e'], bulatL: ['#e0eef4'],
  hijauT: ['#2a4a36', '#345a42', '#3f6b4f', '#548460'], hijauTS: ['#24402e'], kotakM: ['#4c7a5c'], pita: ['#8a2a2a'],
  mustard: ['#b8882a', '#cc9c32', '#e3b23c', '#eec65e'], apron: ['#2e5a40', '#386a4c', '#3f6b4f', '#558462'], kertas: ['#d8ccb0', '#e8dec4', '#f4ead2', '#fcf6e6'],
  piamaM: ['#d0c8b8', '#e0d8c8', '#eee6d6', '#faf4e8'], kucing: ['#e8943a'], kucingK: ['#2a2a2a'], kaosM: ['#f0f0ec'], kaosB: ['#e05a7a'],
  overallM: ['#2c4468', '#36527c', '#426292', '#5878aa'], garis: ['#d8d8d4'], garisM: ['#c84848'], baret: ['#2a4a36', '#345a42', '#3f6b4f', '#548460'],
  tote: ['#c8bc9c', '#dcd0b0', '#ece2c4', '#f8f0d8'], pinA: ['#e05a5a'], pinB: ['#4a8ad8'], mLoafer: ['#24160e', '#341f14', '#4a2c1c', '#6a4430'],
});

/* ---------- wajah: alis tipis, 1 baris jarak, mata sipit 2 baris (hilang jadi garis saat tertawa), pipi tembam merah,
   mulut kecil tepat di bawah hidung. Kacamata bulat besar berdiri 1 voxel di depan wajah. */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'meBlush', s: 'meSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, ...brow, F0, ...eyes, '.rr........rr.', F0, F0, ...mouth, F0, F0];
const BROW = ['..BBB....BBB..'];
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....m....m....', '.....mmmm.....', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['....m....m....', '.....mmmm.....', F0]),
  marah: F(['...BB....BB...'], EYE, ['....mmmmmm....', '....m....m....', F0]),
  teriak: F(['...BB....BB...'], EYE, ['....mmmmmm....', '....mTTTTm....', '.....mttm.....']),
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', F0]),
  ketawa: F(BROW, [F0, '.KKK......KKK.'], ['...mTTTTTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F(['.BB........BB.'], ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const FR = [6, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 11, 6];   // poni rata (alis tetap kelihatan)
const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
const topZ = (v, x, y) => { for (let z = 24; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
function head(o) {
  const v = new Vox();
  // pipi tembam: rahang lebar sampai bawah
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = z <= 0 ? [-4, -5, 5, 4, 4] : z === 1 ? [-6, -6, 6, 5, 4] : skullLayer(z); v.rrect(z, a, b, c, d, 'meSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'meSkin'); v.set(7, 0, 5, 'meSkinS');
  // bob sebahu: lurus, ujung rata di z 0..1, poni rata, telinga tertutup
  const hair = new Vox();
  for (let z = 0; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, 'meHair', z <= 12 ? 4 : 5);
  hair.rrect(16, -8, -8, 6, 7, 'meHair', 5); hair.rrect(17, -6, -6, 4, 5, 'meHair', 4);
  const zmin = (x, y) => x >= 5 ? FR[Math.max(0, Math.min(13, y + 7))] : x >= 2 ? (Math.abs(y + 0.5) > 6.5 ? 0 : 0) : -1;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (let x = -9; x <= 7; x++) for (let y = -9; y <= 8; y++) if (v.get(x, y, 0) === 'meHair' && !v.has(x, y, -1) && (x < 2 || Math.abs(y + 0.5) > 7)) v.set(x, y, -1, 'meHair');
  for (const y of [-5, -1, 3]) for (let x = -6; x <= 5; x++) { const z = topZ(v, x, y); if (z !== null && (x + y) % 4 === 0) v.set(x, y, z, 'meHairT'); }
  // jepit pensil kuning menyilang di sisi kanan layar
  for (let k = 0; k < 6; k++) { const x = 4 - k, z = 12 - Math.floor(k / 2), y = v.sideP(x, z); if (y !== null) v.set(x, y + (k % 5 === 0 ? 0 : 1), z, k === 0 ? 'pensilT' : 'pensil'); }   // menempel di rambut
  // kacamata bulat besar: cincin 6x5 tanpa sudut, frame cokelat, 1 voxel di depan wajah
  const fx = v.front(-1, 8) + 1;
  for (const y0 of [-7, 1]) for (let y = y0; y <= y0 + 5; y++) for (let z = 6; z <= 10; z++) {
    const ey = y === y0 || y === y0 + 5, ez = z === 6 || z === 10;
    if (ey && ez) continue;
    if (ey || ez) v.set(fx, y, z, 'bulat');
  }
  for (const y0 of [-7, 1]) { v.set(fx, y0 + 4, 9, 'bulatL'); for (const [y, z] of [[y0, 6], [y0 + 5, 6], [y0, 10], [y0 + 5, 10]]) v.set(fx - 1, y, z, null); }
  v.set(fx, -1, 9, 'bulat'); v.set(fx, 0, 9, 'bulat');
  for (const y of [-8, 7]) for (let x = fx - 1; x >= -1; x--) if (!v.has(x, y, 9)) v.set(x, y, 9, 'bulat');
  if (o.pencil) for (let x = -2; x <= 3; x++) v.set(x, -10, 9, x === 3 ? 'pensilT' : 'pensil');   // pensil di telinga
  if (o.beret) {   // baret hijau miring: menutup rambut atas, sedikit mengembang ke satu sisi, tangkai kecil di atas
    v.each((x, y, z, c) => { if (z >= 14 && (c === 'meHair' || c === 'meHairT')) v.set(x, y, z, 'baret'); });
    for (let x = -7; x <= 5; x++) for (let y = -8; y <= 7; y++) { const z = topZ(v, x, y); if (z !== null && z >= 15 && (x - 1) ** 2 + (y - 1.5) ** 2 < 40) v.set(x, y, z + 1, 'baret'); }
    for (let x = -8; x <= 6; x++) for (let y = 3; y <= 9; y++) if (!v.has(x, y, 14) && v.has(x, y - 1, 14)) v.set(x, y, 14, 'baret');
    const tz = topZ(v, 0, 1); v.set(0, 1, tz + 1, 'hijauTS');
  }
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function chest(o) {
  const T = o.top, v = new Vox(), S = T === 'seragam', K = T === 'toko', P = T === 'piama', J = T === 'jalan';
  const body = S ? 'hijauT' : K ? 'mustard' : P ? 'piamaM' : J ? 'garis' : 'white';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -4, -6 + t + w, 4 - t, 5 - t - w, body, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'meSkin', 1);
  if (S) {   // rompi kotak hijau tua (V-neck) di atas kemeja putih, dasi pita merah
    v.each((x, y, z, c) => { if (c === 'hijauT' && ((y + 40) % 4 === 0 || z % 4 === 0)) v.set(x, y, z, 'kotakM'); });
    for (let z = 43; z <= 51; z++) { const h = Math.floor((z - 43) / 2.5); for (let y = -1 - h; y <= h; y++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'white'); } }
    for (let z = 32; z <= 33; z++) v.shell(z, -4, -6, 4, 5, 'hijauTS', 3);
    for (const [y, z] of [[-3, 49], [-2, 49], [1, 49], [2, 49], [-2, 48], [1, 48], [-1, 49], [0, 49], [-1, 48], [0, 48], [-1, 47], [0, 46]]) v.pf(y, z, 'pita');
    for (let z = 52; z <= 53; z++) v.shell(z, -3, -4, 3, 3, 'white', 2);
    return v;
  }
  if (K) {   // kaus mustard + apron hijau bertuliskan PENA
    for (let y = -2; y <= 1; y++) v.pf(y, 51, 'meSkin'); v.shell(52, -3, -3, 3, 2, 'mustard', 1);
    for (let z = 32; z <= 47; z++) for (let y = -4; y <= 3; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'apron'); }
    for (const s of [-1, 1]) for (let z = 47; z <= 51; z++) { const y = s > 0 ? 3 : -4; const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'apron'); }
    const G = { P: ['XX', 'XX', 'X.'], E: ['XX', 'X.', 'XX'], N: ['X.X', 'XXX', 'X.X'], A: ['.X.', 'XXX', 'X.X'] };
    [['PE', 45, -3], ['NA', 41, -4]].forEach(([w, z0, y0]) => { let y = y0; for (const ch of w) { G[ch].forEach((row, r) => [...row].forEach((k, c) => { if (k === 'X') v.pf(y + c, z0 - r, 'kertas'); })); y += G[ch][0].length + 1; } });
    return v;
  }
  if (P) {   // piama bergambar kucing, kerah bulat
    for (let y = -2; y <= 1; y++) v.pf(y, 51, 'meSkin'); v.shell(52, -3, -3, 3, 2, 'piamaM', 1);
    ['K...K', 'KOOOK', 'O.O.O', 'OOOOO', '.OOO.'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pf(c - 2, 46 - r, ch === 'K' ? 'kucingK' : 'kucing'); }));
    return v;
  }
  if (J) {   // kaus garis-garis + overall jeans (kutang dada + 2 tali)
    v.each((x, y, z, c) => { if (c === 'garis' && z % 3 === 0) v.set(x, y, z, 'garisM'); });
    for (let y = -2; y <= 1; y++) v.pf(y, 51, 'meSkin'); v.shell(52, -3, -3, 3, 2, 'garis', 1);
    for (let z = 32; z <= 42; z++) for (let y = -4; y <= 3; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'overallM'); }
    for (const y of [-4, 3]) for (let z = 42; z <= 51; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'overallM'); const xb = v.back(y, z); if (xb !== null) v.set(xb - 1, y, z, 'overallM'); }
    for (const y of [-4, 3]) v.pf(y, 42, 'mustard');
    for (let z = 32; z <= 51; z++) { const y = Math.round(5 - (z - 32) * 10 / 19); const x = v.back(y, z); if (x !== null) v.set(x - 1, y, z, 'tote'); }   // tali tote
    return v;
  }
  return v;
}
function pelvis(o) {
  if (o.top === 'seragam') return skirtPelvis('hijauT', 'kotakM', 20);
  const c = legC(o), v = new Vox();
  v.rbox(-4, -6, 26, 4, 5, 33, c, 3); v.box(-3, -2, 24, 2, 1, 25, c);
  if (o.top === 'toko') for (let z = 26; z <= 33; z++) for (let y = -4; y <= 3; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'apron'); }
  if (o.top === 'jalan') {   // tas tote penuh pin di pinggul kiri belakang
    v.rbox(-9, -8, 20, -6, -1, 30, 'tote', 1);
    for (const [y, z, m] of [[-6, 27, 'pinA'], [-3, 25, 'pinB'], [-5, 22, 'pensil'], [-2, 28, 'pinB']]) v.set(-10, y, z, m);
  }
  return v;
}
const legC = o => ({ toko: 'jeans', piama: 'piamaM', jalan: 'overallM' }[o.top] || 'meSkin');
const sleeveC = o => ({ toko: 'mustard', piama: 'piamaM', jalan: 'garis' }[o.top] || 'white');
function arm(o) {
  const v = new Vox(), c = sleeveC(o), S = o.top !== 'piama';
  v.rbox(-2, 6, 40, 2, 10, 50, S ? 'meSkin' : c, 2); v.rrect(51, -2, 6, 2, 10, c, 2);
  if (S) { v.paint(-2, 6, 45, 2, 10, 50, c); v.shell(45, -3, 6, 3, 11, c, 2); }
  if (o.top === 'jalan') v.each((x, y, z, cc) => { if (cc === 'garis' && z % 3 === 0) v.set(x, y, z, 'garisM'); });
  return v;
}
function fore(o, side) {
  const v = new Vox(), P = o.top === 'piama';
  v.rbox(-2, 6, 31, 2, 10, 39, P ? 'piamaM' : 'meSkin', 2);
  v.rbox(-2, 6, 27, 3, 10, 30, 'meSkin', 2); v.rrect(26, -1, 7, 2, 9, 'meSkin', 1);
  if (side > 0) { v.set(3, 8, 27, 'tinta'); v.set(3, 8, 26, 'tinta'); }   // noda tinta di jari tengah kanan
  return v;
}
function thigh(o) {
  const c = legC(o), v = new Vox(); v.rbox(-3, 1, 17, 2, 6, 30, c, 2); v.rrect(31, -2, 2, 1, 5, c, 2);
  if (o.top === 'jalan') v.paint(-3, 1, 17, 2, 6, 19, 'overallM');
  return v;
}
function shin(o) {
  const c = legC(o), v = new Vox(); v.rbox(-3, 1, 6, 2, 6, 17, c, 2); v.rrect(18, -2, 2, 1, 5, c, 2);
  if (o.top === 'seragam') v.paint(-3, 1, 6, 2, 6, 15, 'kaosM');   // kaus kaki putih panjang
  if (o.top === 'jalan') v.paint(-3, 1, 6, 2, 6, 8, 'overallM');
  return v;
}
function foot(o, side) {
  const v = new Vox();
  if (o.top === 'piama') { v.rbox(-4, 1, 0, 6, 6, 3, side > 0 ? 'kaosB' : 'kaosM', 2); v.rbox(-3, 1, 4, 2, 6, 5, side > 0 ? 'kaosB' : 'kaosM', 2); if (side > 0) v.paint(-4, 1, 1, 6, 6, 1, 'kaosM'); return v; }   // kaus kaki tidak sepasang
  if (o.top === 'jalan') { v.rbox(-4, 1, 0, 6, 6, 1, 'sole', 2); v.rbox(-4, 1, 2, 6, 6, 3, 'kertas', 2); v.rbox(-3, 1, 4, 2, 6, 5, 'kertas', 2); for (const x of [1, 3]) v.paint(x, 2, 4, x, 5, 4, 'garisM'); return v; }
  v.rbox(-4, 1, 0, 6, 6, 0, 'belt', 2); v.rbox(-4, 1, 1, 6, 6, 3, 'mLoafer', 2); v.rbox(-3, 2, 4, 1, 5, 4, 'mLoafer', 2); v.set(4, 3, 3, 'pensil'); v.set(4, 4, 3, 'pensil');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam Bina Bangsa: rompi & rok kotak hijau + dasi pita', top: 'seragam' },
  toko: { name: 'Jaga toko: kaus mustard + apron PENA + jeans + pensil di telinga', top: 'toko', pencil: true },
  rumah: { name: 'Piama kucing + kaus kaki tidak sepasang', top: 'piama' },
  jalan: { name: 'Overall jeans + kaus garis + baret hijau + tas tote', top: 'jalan', beret: true },
};
export function build(opt = {}) {
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), sl = sleeveC(o), leg = legC(o), S = o.top === 'seragam';
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest],
    ['flapF', S && skirtPanel('hijauT', 'kotakM', 1, 16), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', S && skirtPanel('hijauT', 'kotakM', -1, 16), PV.flapB],
    ['footR', foot(o, 1), PV.footR], ['footL', foot(o, -1).mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'meSkin', shoulder: sl, elbow: o.top === 'piama' ? 'piamaM' : 'meSkin', hip: S ? 'hijauT' : leg, knee: leg }, SKEL, TAIL);
  if (S) P.skirt = skirtInfo(P, 'hijauT', 'kotakM', false);
  return P;
}
