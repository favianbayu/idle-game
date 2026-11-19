// Sasha Aurelia: NPC romance cewek, anak elite di geng Bram, populer, punya jalur penebusan. Kulit putih bersih, rambut
// cokelat kemerahan panjang bergelombang (dicat), wajah tirus, bulu mata lentik, lip tint merah muda, alis melengkung.
// Seragam dipermak pas badan, rok sedikit lebih pendek dari aturan, cardigan rajut pink, jam tangan emas, loafers.
// Rangka skala 1.24 (keluarga Rani), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace, skullLayer } from './model.js';
import { skirtPelvis, skirtPanel, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-7, 0, 6];

addRamps({
  saSatin: ['#cfcac2', '#e4e0d8', '#f4f1ea', '#fffdf8'], saSatinS: ['#d6cfc2'], saBulu: ['#e89ab0', '#f2b0c2', '#f8c6d4', '#fdd8e2'], ketsK: ['#5e5a54', '#706c66', '#86827a', '#9a968e'],
  saSkin: ['#c8a088', '#dcb498', '#f2cdb0', '#fadcc4'], saSkinS: ['#e0b498'], lipP: ['#d86a84'], saBlush: ['#eea0a0'],
  saHair: ['#3a1c12', '#4a2618', '#5a3020', '#74402c'], saHairT: ['#8e5236'],
  pinkC: ['#c88898', '#dca0b0', '#f2b8c6', '#f8ccd8'], pinkCS: ['#d896a8'], saGold: ['#8e6e2a', '#ad8936', '#c9a24a', '#e0bc66'],
  saRok: ['#5a5f6b', '#6e7380', '#878c99', '#a0a5b2'], saRokS: ['#62677a'], kaosP: ['#e8e6e0'],
  loafer: ['#1e120c', '#2e1c12', '#44291a', '#6a4430'], tasP: ['#d8d4cc', '#ebe8e2', '#f7f1e6', '#ffffff'], kacaH: ['#0c0c10', '#16161c', '#22222a', '#3a3a46'],
  dressP: ['#d8b0a8', '#ecc4bc', '#f8dcd2', '#fff0ea'], bunga: ['#e8829a'], daunP: ['#8fb88a'], denimW: ['#c8ccd2', '#dcdfe4', '#eef0f3', '#ffffff'], denimWS: ['#b4b8c0'],
  hoodK: ['#0e0e11', '#16161a', '#202026', '#2e2e36'], hoodKS: ['#3a3a44'], masker: ['#1a1a1e', '#24242a', '#303038', '#44444e'], ketsL: ['#8a8680', '#a29e98', '#bab6ae', '#ccc8c0'],
});

/* ---------- wajah: alis melengkung (ujung luar turun), 1 baris jarak, bulu mata lentik mencuat, mata tajam, lip tint
   tepat di bawah hidung (hidung z 5..6, bibir mulai z 4). Muka V: dagu dipangkas. */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', p: 'lipP', m: 'mouth', T: 'teeth', t: 'tongue', r: 'saBlush', s: 'saSkinS' };
const F0 = '..............';
// [alis 2 (z 12-11)], jarak (z 10), [mata 2 (z 9-8)], pipi (z 7), z 6, [mulut 4 (z 5..2)], z 1, z 0
const F = (brow, eyes, cheek, mouth) => [F0, F0, ...brow, F0, ...eyes, cheek, F0, ...mouth, F0, F0];
const BROW = ['..BBB....BBB..', '.B..........B.'];
const EYE = ['KKKKK....KKKKK', '.WKKK....KKKW.'];
const CH = '.rr........rr.';
export const FACES = {
  biasa: F(BROW, EYE, CH, ['.........p....', '.....pppp.....', '......pp......', F0]),
  kedip: F(BROW, [F0, 'KKKKK....KKKKK'], CH, ['.........p....', '.....pppp.....', '......pp......', F0]),
  marah: F(['.BB........BB.', '...BB....BB...'], EYE, CH, [F0, '....pppppp....', '....p....p....', F0]),
  teriak: F(['.BB........BB.', '...BB....BB...'], EYE, CH, [F0, '....pppppp....', '....pTTTTp....', '.....pttp.....']),
  nyengir: F(BROW, EYE, CH, ['...p......p...', '....pTTTTp....', '.....pppp.....', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], CH, [F0, '...pTTTTTTp...', '....pttttp....', '.....pppp.....']),
  sakit: F(['...BB....BB...', '.B..........B.'], ['.KK........KK.', '...KK....KK...'], F0, [F0, '....pppppp....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
const topZ = (v, x, y) => { for (let z = 24; z >= -30; z--) if (v.has(x, y, z)) return z; return null; };
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skullLayer(z); v.rrect(z, a, b, c, d, 'saSkin', r); }
  for (const y of [-5, 4]) { v.set(5, y, 1, null); v.set(5, y, 2, null); v.set(4, y, 0, null); v.set(5, y, 0, null); }   // muka tirus
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'saSkin'); v.set(7, 0, 5, 'saSkinS');
  if (o.mask) for (let y = -6; y <= 5; y++) for (let z = 1; z <= 6; z++) { const x = v.front(y, z); if (x !== null && x >= 4) { v.set(x, y, z, 'masker'); if (y >= -1 && y <= 0) v.set(x, y, z, 'masker'); } }
  // rambut panjang bergelombang belah tengah: menutup kepala, tanpa poni (dahi terbuka), sisi jatuh membingkai wajah,
  // bagian belakang terurai sampai tengah punggung; gelombang = geser maju-mundur per 4 lapis
  const hair = new Vox(), H = o.hood ? null : 'saHair';
  if (H) {
    for (let z = 2; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, H, z <= 11 ? 4 : 5);
    hair.rrect(16, -8, -8, 6, 7, H, 5); hair.rrect(17, -6, -6, 4, 5, H, 4);
    const zmin = (x, y) => x >= 5 ? (Math.abs(y + 0.5) > 5.5 ? 6 : 14) : x >= 2 ? (Math.abs(y + 0.5) > 6.5 ? -4 : 0) : -4;
    hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
    for (let z = -24; z <= 1; z++) {   // terurai di punggung + gelombang di dua sisi depan bahu
      const w = Math.round(Math.sin(z * 0.8) * 1.0), half = z <= -18 ? 6 - Math.floor((-18 - z) / 2) : 7;
      for (let y = -half - 1; y <= half; y++) for (let x = -9 + w; x <= -6 + w; x++) if (!v.has(x, y, z)) v.set(x, y, z, H);
      if (z >= -12) for (const ys of [-9, 8]) for (let x = -5 + w; x <= -1 + w; x++) if (!v.has(x, ys, z)) v.set(x, ys, z, H);
    }
    v.each((x, y, z, c) => { if (c === H && rnd(x, y, z) % 5 === 0 && (z + y) % 3 === 0) v.set(x, y, z, 'saHairT'); });
    for (let x = -6; x <= 7; x++) { const z = topZ(v, x, -1); if (z !== null && z > 12) v.set(x, -1, z, 'saHair'); }
    if (o.shades) for (let y = -6; y <= 5; y++) for (const x of [3, 4]) { const z = topZ(v, x, y); if (z !== null) v.set(x, y, z + 1, Math.abs(y + 0.5) < 1 ? 'saGold' : 'kacaH'); }   // kacamata hitam di kepala
  } else {   // hoodie hitam menutup kepala (penyamaran malam), wajah terbuka
    for (let z = 1; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, 'hoodK', z <= 3 ? 4 : 6);
    hair.rrect(16, -8, -8, 6, 7, 'hoodK', 6); hair.rrect(17, -6, -6, 4, 5, 'hoodK', 4); hair.rrect(18, -4, -4, 2, 3, 'hoodK', 2);
    hair.each((x, y, z, c) => { if (!v.has(x, y, z) && !(x >= 4 && z <= 13 && Math.abs(y + 0.5) < 7.5)) v.set(x, y, z, c); });
    for (let y = -7; y <= 6; y++) { const x = v.front(y, 14); if (x !== null) v.set(x, y, 14, 'hoodKS'); }
    for (let y = -5; y <= 4; y++) v.set(6, y, 13, 'saHair');   // ujung poni mengintip
  }
  for (const y of [-8, 7]) v.set(1, y, 3, 'saGold');   // anting emas kecil
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function chest(o) {
  const T = o.top, v = new Vox(), C = T === 'cardigan', D = T === 'dress', H = T === 'hoodie';
  const body = C ? 'pinkC' : D ? 'dressP' : H ? 'hoodK' : 'white';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 36 && z <= 41 ? 1 : 0; v.rrect(z, -4, -6 + t + w, 4 - t, 5 - t - w, body, 3); }   // pinggang ramping (dipermak)
  v.rbox(-2, -2, 52, 2, 1, 55, 'saSkin', 1);
  if (H) { for (let z = 32; z <= 50; z++) v.pf(0, z, 'hoodKS'); v.pfBox(-3, 33, 2, 37, 'hoodKS'); v.pfBox(-2, 34, 1, 36, 'hoodK'); for (const y of [-2, 1]) for (let z = 44; z <= 49; z++) v.pf(y, z, 'hoodKS'); return v; }
  if (D) {   // dress bunga pastel + jaket denim putih terbuka + tas mini rantai emas selempang
    v.each((x, y, z, c) => { if (c === 'dressP' && rnd(x, y, z) % 9 === 0) v.set(x, y, z, (x + z) % 3 ? 'bunga' : 'daunP'); });
    for (let z = 34; z <= 51; z++) for (let y = -6; y <= 5; y++) { if (Math.abs(y + 0.5) < 3) continue; const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'denimW'); }
    v.each((x, y, z, c) => { if (c === 'dressP' && x <= 1) v.set(x, y, z, 'denimW'); });
    for (let z = 34; z <= 50; z++) { v.pf(-3, z, 'denimWS'); v.pf(2, z, 'denimWS'); }
    for (let y = -2; y <= 1; y++) v.pf(y, 51, 'saSkin');
    for (let z = 34; z <= 50; z++) { const y = Math.round(-6 + (z - 34) * 11 / 16); const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'saGold'); }
    return v;
  }
  // kemeja dipermak pas: garis kancing, kancing atas terbuka, kerah; cardigan pink terbuka di luarnya
  for (let z = 32; z <= 50; z++) v.pf(0, z, 'whiteS');
  for (const [y, z] of [[-1, 50], [0, 50], [0, 49]]) v.pf(y, z, 'saSkin');
  if (C) {
    for (let z = 32; z <= 51; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x === null) continue; v.set(x, y, z, null); v.set(x - 1, y, z, 'white'); }
    for (let z = 32; z <= 50; z++) { v.pf(-4, z, 'pinkCS'); v.pf(3, z, 'pinkCS'); }
    for (let z = 33; z <= 47; z += 3) v.pf(3, z, 'tasP');   // kancing mutiara
    v.each((x, y, z, c) => { if (c === 'pinkC' && (y + 20) % 2 === 0 && z <= 49) v.set(x, y, z, 'pinkCS'); });
    for (const [y, z] of [[-1, 50], [0, 50], [0, 49]]) v.pf(y, z, 'saSkin');
  } else { v.pfBox(3, 44, 4, 46, 'osis'); v.pfBox(-5, 46, -3, 46, 'tag'); }
  for (let z = 52; z <= 53; z++) v.shell(z, -3, -4, 3, 3, C ? 'pinkC' : 'white', 2);
  return v;
}
function pelvis(o) {
  if (o.bottom === 'rok') {
    const v = skirtPelvis('saRok', 'saRokS', 20);
    if (o.top === 'cardigan') for (let z = 30; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 30 ? 'pinkCS' : 'pinkC', 3);
    return v;
  }
  if (o.bottom === 'dress') { const v = skirtPelvis('dressP', 'denimWS', 20); v.each((x, y, z, c) => { if (c === 'dressP' && rnd(x, y, z) % 9 === 0) v.set(x, y, z, (x + z) % 3 ? 'bunga' : 'daunP'); }); return v; }
  const v = new Vox(); v.rbox(-4, -6, 26, 4, 5, 33, 'hoodK', 3); v.box(-3, -2, 24, 2, 1, 25, 'hoodK');
  for (let z = 30; z <= 33; z++) v.shell(z, -5, -7, 4, 6, z === 30 ? 'hoodKS' : 'hoodK', 3);
  return v;
}
const sleeveC = o => ({ cardigan: 'pinkC', dress: 'denimW', hoodie: 'hoodK' }[o.top] || 'white');
function arm(o) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-2, 6, 40, 2, 10, 50, o.top === 'kemeja' ? 'saSkin' : c, 2); v.rrect(51, -2, 6, 2, 10, c, 2);
  if (o.top === 'kemeja') { v.paint(-2, 6, 45, 2, 10, 50, 'white'); v.shell(45, -3, 6, 3, 11, 'whiteS', 2); }   // lengan pendek pas
  return v;
}
function fore(o, side) {
  const v = new Vox(), c = sleeveC(o), L = o.top !== 'kemeja';
  v.rbox(-2, 6, 31, 2, 10, 39, L ? c : 'saSkin', 2);
  if (o.top === 'cardigan') v.paint(-2, 6, 31, 2, 10, 32, 'pinkCS');
  v.rbox(-2, 6, 27, 3, 10, 30, 'saSkin', 2); v.rrect(26, -1, 7, 2, 9, 'saSkin', 1);
  if (side < 0 && o.top !== 'hoodie') v.paint(-2, 6, 31, 2, 10, 31, 'saGold');   // jam tangan emas
  if (o.bag && side < 0) {   // tas tangan putih tergantung di lengan bawah kiri
    v.rbox(-3, 11, 31, 3, 15, 36, 'tasP', 1); v.paint(-3, 11, 36, 3, 15, 36, 'saGold');
    for (let z = 37; z <= 39; z++) { v.set(-1, 11, z, 'saGold'); v.set(1, 11, z, 'saGold'); }
  }
  return v;
}
function thigh(o) {
  const v = new Vox(), c = o.bottom === 'training' ? 'hoodK' : 'saSkin';
  v.rbox(-3, 1, 17, 2, 6, 30, c, 2); v.rrect(31, -2, 2, 1, 5, c, 2);
  return v;
}
function shin(o) {
  const v = new Vox(), c = o.bottom === 'training' ? 'hoodK' : 'saSkin';
  v.rbox(-3, 1, 6, 2, 6, 17, c, 2); v.rrect(18, -2, 2, 1, 5, c, 2);
  if (o.bottom === 'rok') v.paint(-3, 1, 6, 2, 6, 8, 'kaosP');   // kaus kaki pendek putih
  if (o.bottom === 'training') for (let z = 6; z <= 17; z++) v.set(0, 6, z, 'hoodKS');
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.shoe === 'kets') { v.rbox(-4, 1, 0, 6, 6, 1, 'sole', 2); v.rbox(-4, 1, 2, 6, 6, 3, 'ketsL', 2); v.rbox(-3, 1, 4, 2, 6, 5, 'ketsL', 2); for (const x of [1, 3]) v.paint(x, 2, 4, x, 5, 4, 'lace'); v.set(5, 2, 2, 'sole'); return v; }
  if (o.shoe === 'flat') { v.rbox(-4, 1, 0, 6, 6, 0, 'tasP', 2); v.rbox(-4, 1, 1, 6, 6, 2, 'tasP', 2); v.rbox(-3, 2, 3, 3, 5, 4, 'saSkin', 2); v.set(5, 3, 2, 'saGold'); v.set(5, 4, 2, 'saGold'); return v; }
  // loafers cokelat tua mengilap, tali emas kecil
  v.rbox(-4, 1, 0, 6, 6, 0, 'belt', 2); v.rbox(-4, 1, 1, 6, 6, 3, 'loafer', 2); v.rbox(-3, 2, 4, 1, 5, 4, 'loafer', 2);
  v.set(4, 3, 3, 'saGold'); v.set(4, 4, 3, 'saGold'); v.set(6, 3, 2, 'saHairT');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam dipermak + rok pendek + cardigan pink', top: 'cardigan', bottom: 'rok' },
  geng: { name: 'Bareng geng: kacamata hitam di kepala + tas putih', top: 'kemeja', bottom: 'rok', shades: true, bag: true },
  jalan: { name: 'Dress bunga + jaket denim putih + tas mini', top: 'dress', bottom: 'dress', shoe: 'flat' },
  malam: { name: 'Penyamaran malam: hoodie hitam + masker', top: 'hoodie', bottom: 'training', shoe: 'kets', hood: true, mask: true },
};
OUTFITS.rumah = { ...OUTFITS.malam, hood: false, mask: false, name: 'Rumah: piama satin putih, sandal bulu',
  sw: { hoodK: 'saSatin', hoodKS: 'saSatinS', ketsL: 'saBulu', sole: 'saBulu', lace: 'saBulu' } };
OUTFITS.rahasia = { ...OUTFITS.malam, name: 'Rahasia: hoodie hitam polos, celana training, masker, kets lusuh (penyamaran)',
  sw: { hoodKS: 'hoodK', ketsL: 'ketsK', lace: 'ketsK' } };
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o);
  const sk = o.bottom === 'rok' ? ['saRok', 'saRokS'] : o.bottom === 'dress' ? ['dressP', 'denimWS'] : null;
  const leg = o.bottom === 'training' ? 'hoodK' : 'saSkin';
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest],
    ['flapF', sk && skirtPanel(sk[0], sk[1], 1, 18), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', sk && skirtPanel(sk[0], sk[1], -1, 18), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'saSkin', shoulder: sl, elbow: o.top === 'kemeja' ? 'saSkin' : sl, hip: sk ? sk[0] : leg, knee: leg }, SKEL, TAIL);
  if (sk) P.skirt = skirtInfo(P, sk[0], sk[1], false);
  return P;
}
