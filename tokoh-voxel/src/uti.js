// Uti (Putri Maharani): NPC romance cewek, tomboi, montir, kapten futsal putri, sahabat sejak hari pertama. Atletis,
// kulit sawo matang, rambut bob pendek berantakan (potong sendiri), alis tebal, coretan oli di pipi, bekas luka kecil di
// dagu, senyum menyeringai. Seragam + celana panjang abu + jaket marun kebesaran milik almarhum kakak + kunci pas di saku.
// Rangka skala 1.24 (keluarga Rani), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace, skullLayer } from './model.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8.5, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-7, 0, 6];

addRamps({
  uSkin: ['#8e5a38', '#a86c46', '#c99068', '#d9a47c'], uSkinS: ['#ad7550'], uScar: ['#e0b08c'], oli: ['#3a3430'],
  uHair: ['#0e0a08', '#160f0c', '#1e1612', '#30241c'], uHairT: ['#3e2e24'],
  marun: ['#561a22', '#6e222c', '#8c2f39', '#a8434e'], marunS: ['#45141b'], kunciP: ['#7d838c', '#9aa1aa', '#bcc2ca', '#e2e6ea'],
  uHelm: ['#a8821a', '#cc9e22', '#f2c230', '#f8d866'], petir: ['#2a2a2a'],
  uJersey: ['#1c3358', '#22406e', '#2a4a7a', '#3c6296'], uNum: ['#e8e8e8'], decker: ['#151417', '#1f1e22', '#2b2a30', '#3e3d45'],
  futsal: ['#8a1c1c', '#a82424', '#c83030', '#e04848'], kaosK: ['#e2e2dc'],
  wear: ['#141c2c', '#1a2438', '#223048', '#2e405e'], kausH: ['#141316', '#1c1b1f', '#26252a', '#38363d'], sarungT: ['#b8b2a4', '#cfc9bb', '#e2dccf', '#f0ebe0'],
  utBandP: ['#e0b030'], jeansR: ['#22324e', '#2c3e60', '#3a5078', '#4e6894'], benang: ['#d8dce4'],
  bootsK: ['#3e2a1a', '#523822', '#6a4a2e', '#86603e'], topiU: ['#561a22', '#6e222c', '#8c2f39', '#a8434e'],
  uShoe: ['#141318', '#1e1d24', '#2b2a32', '#3f3e49'],
});

/* ---------- wajah: alis tebal (2 baris) dengan 1 baris jarak ke mata, mata tajam berbinar, seringai, oli di pipi,
   bekas luka di dagu. Baris r -> z = 14 - r; hidung z 5..6, mulut mulai z 4 tepat di bawahnya. */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', o: 'oli', x: 'uScar', s: 'uSkinS' };
const F0 = '..............';
const OLI = '..........oo..';
// [brow2, eyes2, pipi, z5, mulut3] -> 15 baris
const F = (brow, eyes, cheek, z5, mouth) => [F0, F0, F0, ...brow, F0, ...eyes, cheek, z5, ...mouth, '........x.....', F0];
const BROW = ['.BBBB....BBBB.', '..BBB....BBB..'];
const MAD = ['.BB........BB.', '..BBBB..BBBB..'];
const EYE = ['.KKKK....KKKK.', '.WKKK....KKKW.'];
export const FACES = {
  biasa: F(BROW, EYE, OLI, '..........m...', ['....mmmmmm....', F0, F0]),
  kedip: F(BROW, [F0, '.KKKK....KKKK.'], OLI, '..........m...', ['....mmmmmm....', F0, F0]),
  marah: F(MAD, EYE, OLI, F0, ['....mmmmmm....', '....m....m....', F0]),
  teriak: F(MAD, EYE, OLI, F0, ['....mmmmmm....', '....mTTTTm....', '.....mttm.....']),
  nyengir: F(BROW, EYE, OLI, '...m......m...', ['....TTTTTT....', '.....mmmm.....', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], OLI, F0, ['...mTTTTTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...'], OLI, F0, ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const FR = [8, 12, 13, 14, 13, 14, 13, 13, 14, 13, 14, 13, 12, 8];   // poni bob potong sendiri: rata-tak-rata, alis tetap kelihatan
const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
const topZ = (v, x, y) => { for (let z = 24; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
function helmU(v) {   // helm half-face kuning bergambar petir; wajah terbuka, ujung bob keluar di bawah
  const h = new Vox();
  for (let z = 6; z <= 19; z++) { const k = z <= 15 ? 0 : z === 16 ? 1 : z === 17 ? 2 : z === 18 ? 3 : 5; h.rrect(z, -9 + k, -9 + k, 8 - k, 8 - k, 'uHelm', 5); }
  h.each((x, y, z, c) => { if (!v.has(x, y, z) && !(x >= 4 && z <= 11)) v.set(x, y, z, c); });
  const bolt = [[3, 16], [2, 15], [1, 14], [2, 14], [3, 14], [2, 13], [1, 12], [0, 11], [-1, 10]];
  for (const s of [-1, 1]) for (const [x, z] of bolt) { const y = s > 0 ? v.sideP(x, z) : v.sideN(x, z); if (y !== null) v.set(x, y, z, 'petir'); }
  for (const y of [-8, 7]) { v.set(3, y, 3, 'strap'); v.set(4, y, 2, 'strap'); v.set(5, y, 1, 'strap'); }
  for (let y = -6; y <= 5; y++) for (let z = 4; z <= 6; z++) if (!v.has(-9, y, z) && (y + z) % 3) v.set(-9, y, z, 'uHair');
  return v;
}
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skullLayer(z); v.rrect(z, a, b, c, d, 'uSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'uSkin'); v.set(7, 0, 5, 'uSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'uSkin'); v.box(-1, y, 6, -1, y, 7, 'uSkinS'); }
  if (o.helm) return helmU(v);
  // bob pendek mengembang, ujung bawah bergerigi (potong sendiri), telinga tertutup, poni rata-tak-rata
  const hair = new Vox();
  for (let z = 2; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, 'uHair', z <= 12 ? 5 : 6);
  hair.rrect(16, -8, -8, 6, 7, 'uHair', 5); hair.rrect(17, -7, -6, 5, 5, 'uHair', 4); hair.rrect(18, -4, -4, 2, 2, 'uHair', 2);
  const zmin = (x, y) => x >= 4 && Math.abs(y + 0.5) > 7 ? 9 : x >= 5 ? FR[Math.max(0, Math.min(13, y + 7))] : x >= 1 ? (Math.abs(y + 0.5) > 6.5 ? 3 + (rnd(x, y, 1) % 3) : 0) : 2 + (rnd(x, y, 2) % 3);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  if (!o.cap) for (const [x, y] of [[-2, 1], [1, -5], [-5, -3], [4, 3], [6, -6], [-7, 5], [0, -2]]) { const z = topZ(v, x, y); if (z !== null) v.set(x, y, z + 1, 'uHair'); }   // jambul berantakan
  for (const y of [-6, -2, 1, 5]) for (let x = -6; x <= 5; x++) { const z = topZ(v, x, y); if (z !== null && rnd(x, y, 5) % 3 === 0 && v.get(x, y, z) === 'uHair') v.set(x, y, z, 'uHairT'); }
  if (o.cap) {   // topi terbalik marun: membungkus rambut bagian atas saja (z >= 13), bob tetap keluar di bawah
    v.each((x, y, z, c) => { if (z >= 13 && (c === 'uHair' || c === 'uHairT')) v.set(x, y, z, 'topiU'); });
    const ring = [];   // lis bawah topi 1 voxel menonjol keluar
    v.each((x, y, z, c) => { if (z === 13 && c === 'topiU') for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!v.has(x + dx, y + dy, z)) ring.push([x + dx, y + dy]); });
    for (const [x, y] of ring) for (let z = 12; z <= 14; z++) v.set(x, y, z, 'marunS');   // lis 3 voxel: 1 ke bawah, 1 ke atas
    for (let y = -6; y <= 5; y++) { const xb = v.back(y, 13), e = Math.abs(y + 0.5) > 4.5 ? 1 : 0; for (let x = xb - 1; x >= xb - 6 + e; x--) v.set(x, y, 13, 'topiU'); }   // pet di belakang
    for (let y = -2; y <= 1; y++) { const z = 14, x = v.front(y, z); if (x !== null) v.set(x, y, z, Math.abs(y + 0.5) < 1 ? 'uHair' : 'marunS'); }   // bukaan pengatur di depan
    const tz = Math.max(...[-1, 0].map(y => topZ(v, -1, y))); v.set(-1, 0, tz + 1, 'marunS');   // kancing atas topi
  }
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function chest(o) {
  const T = o.top, v = new Vox(), J = T === 'jaket' || T === 'malam', F = T === 'futsal', W = T === 'bengkel', B = T === 'band';
  const body = J ? 'marun' : F ? 'uJersey' : (W || B) ? 'kausH' : 'white';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0, f = J ? 1 : 0; v.rrect(z, -4 - f, -6 + t + w - f, 4 - t + f, 5 - t - w + f, body, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'uSkin', 1);
  if (F) {   // jersey futsal putri: garis putih di bahu, nomor 7 di punggung dan dada kecil
    for (let y = -2; y <= 1; y++) v.pf(y, 51, 'uSkin'); v.shell(52, -3, -3, 3, 2, 'uNum', 1);
    for (const s of [-1, 1]) v.psBox(s, -3, 40, 3, 51, 'uNum');
    ['XXXXX', '....X', '...X.', '..X..', '..X..', '.X...', '.X...'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'X') v.pb(2 - c, 48 - r, 'uNum'); }));
    return v;
  }
  if (W || B) {   // kaus hitam (bengkel) / kaus band motor bersablon roda bersayap (jalan)
    for (let y = -2; y <= 1; y++) v.pf(y, 51, 'uSkin'); v.shell(52, -3, -3, 3, 2, 'kausH', 1);
    if (B) ['.X.....X.', 'XXX.Y.XXX', '.XXYYYXX.', '...YYY...', '....Y....'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pf(c - 4, 47 - r, ch === 'X' ? 'utBandP' : 'benang'); }));
    if (W) for (const [y, z] of [[-3, 40], [-2, 39], [2, 44], [3, 43]]) v.pf(y, z, 'oli');
    return v;
  }
  if (J) {   // jaket marun kebesaran: seragam (terbuka, kemeja kelihatan) atau malam (tertutup, ritsleting)
    if (T === 'jaket') {
      for (let z = 32; z <= 51; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x === null) continue; v.set(x, y, z, null); v.set(x - 1, y, z, 'white'); }
      for (let z = 32; z <= 50; z++) { v.pf(-4, z, 'marunS'); v.pf(3, z, 'marunS'); }
      for (const [y, z] of [[-1, 50], [0, 50], [0, 49]]) v.pf(y, z, 'uSkin');
      v.pfBox(1, 44, 2, 45, 'osis');
      for (const [y, z] of [[-6, 38], [-6, 39], [-6, 40], [-7, 40], [-5, 40]]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'kunciP'); }   // kunci pas menyembul dari saku
      v.pfBox(-6, 35, -5, 37, 'marunS');
    } else for (let z = 32; z <= 51; z++) v.pf(0, z, 'kunciP');
    for (let z = 52; z <= 53; z++) v.shell(z, -3, -4, 3, 3, 'marun', 2);
    for (let y = -6; y <= 5; y++) { v.pb(y, 33, 'marunS'); v.pb(y, 47, 'marunS'); }
    return v;
  }
  return v;
}
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-4, -6, 26, 4, 5, 33, c, 3); v.box(-3, -2, 24, 2, 1, 25, c);
  if (o.top === 'jaket' || o.top === 'malam') for (let z = 29; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 29 ? 'marunS' : 'marun', 3);
  else if (o.top === 'bengkel') {   // lengan wearpack diikat di pinggang: lingkar + simpul + lengan menjuntai di depan
    for (let z = 30; z <= 33; z++) v.shell(z, -5, -7, 4, 6, 'wear', 3);
    for (let z = 21; z <= 31; z++) for (let y = -2; y <= 1; y++) v.set(z >= 29 ? 6 : 5, y + (z < 26 ? (y < 0 ? -1 : 1) : 0), z, 'wear');
  } else if (o.top !== 'futsal') { v.rbox(-4, -6, 32, 4, 5, 33, 'belt', 3); v.pfBox(-1, 32, 0, 33, 'buckle'); }
  return v;
}
function legC(o) { return { futsal: 'uJersey', bengkel: 'wear', band: 'jeansR', malam: 'jeansR' }[o.top] || 'pants'; }
const sleeveC = o => ({ jaket: 'marun', malam: 'marun', futsal: 'uJersey', bengkel: 'kausH', band: 'kausH' }[o.top]);
function arm(o) {
  const v = new Vox(), c = sleeveC(o), S = o.top === 'futsal' || o.top === 'bengkel' || o.top === 'band';
  v.rbox(-2, 6, 40, 2, 10, 50, S ? 'uSkin' : c, 2); v.rrect(51, -2, 6, 2, 10, c, 2);
  if (S) { v.paint(-2, 6, 46, 2, 10, 50, c); v.shell(45, -3, 6, 3, 11, c, 2); if (o.top === 'futsal') for (let z = 45; z <= 51; z++) v.set(0, 10, z, 'uNum'); }
  if (c === 'marun') v.rbox(-3, 6, 40, 3, 11, 50, 'marun', 2);   // lengan jaket kebesaran
  return v;
}
function fore(o, side) {
  const v = new Vox(), J = o.top === 'jaket' || o.top === 'malam';
  v.rbox(-2, 6, 31, 2, 10, 39, J && o.top === 'malam' ? 'marun' : 'uSkin', 2);
  if (o.top === 'jaket') for (let z = 37; z <= 39; z++) v.shell(z, -3, 6, 3, 11, z === 38 ? 'marunS' : 'marun', 2);   // lengan digulung ke siku
  const glove = o.top === 'bengkel';
  v.rbox(-2, 6, 27, 3, 10, 30, glove ? 'sarungT' : 'uSkin', 2); v.rrect(26, -1, 7, 2, 9, glove ? 'sarungT' : 'uSkin', 1);
  if (glove) v.paint(-2, 6, 31, 2, 10, 32, 'sarungT');
  if (side > 0 && !glove) v.paint(-2, 6, 32, 2, 10, 32, 'karet');   // karet gelang yang suka dikunyah
  if (side < 0 && o.top !== 'bengkel') { v.pf(8, 35, 'oli'); v.pf(7, 34, 'oli'); }
  return v;
}
function thigh(o) {
  const c = legC(o), v = new Vox(), F = o.top === 'futsal';
  v.rbox(-3, 1, 17, 2, 6, 30, c, 2); v.rrect(31, -2, 2, 1, 5, c, 2);
  if (F) v.paint(-3, 1, 17, 2, 6, 23, 'uSkin');   // celana pendek
  if (c === 'wear') for (let z = 18; z <= 29; z++) v.set(0, 6, z, 'wear');
  return v;
}
function shin(o) {
  const c = legC(o), v = new Vox(), F = o.top === 'futsal';
  v.rbox(-3, 1, 6, 2, 6, 17, F ? 'uSkin' : c, 2); v.rrect(18, -2, 2, 1, 5, F ? 'decker' : c, 2);
  if (F) { v.paint(-3, 1, 6, 2, 6, 13, 'kaosK'); v.rbox(1, 1, 15, 3, 6, 19, 'decker', 1); }   // kaos kaki panjang + decker lutut
  if (o.top === 'band') { for (let z = 16; z <= 18; z++) for (let y = 2; y <= 5; y++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, (y + z) % 2 ? 'uSkin' : 'benang'); } }   // jeans robek di lutut
  if (o.top === 'band') v.rbox(-3, 1, 6, 2, 6, 9, 'bootsK', 2);
  return v;
}
function foot(o) {
  const v = new Vox(), F = o.top === 'futsal', B = o.top === 'band' || o.top === 'bengkel';
  if (F) { v.rbox(-4, 1, 0, 6, 6, 1, 'kaosK', 2); v.rbox(-4, 1, 2, 6, 6, 3, 'futsal', 2); v.rbox(-3, 1, 4, 2, 6, 5, 'futsal', 2); for (const x of [1, 3]) v.paint(x, 2, 4, x, 5, 4, 'lace'); return v; }
  if (B) { v.rbox(-4, 1, 0, 6, 6, 1, 'uShoe', 2); v.rbox(-4, 1, 2, 6, 6, 4, 'bootsK', 2); v.rbox(-3, 1, 5, 2, 6, 6, 'bootsK', 2); for (const x of [1, 3]) v.paint(x, 2, 4, x, 5, 4, 'uShoe'); return v; }
  v.rbox(-4, 1, 0, 6, 6, 1, 'kick', 2); v.rbox(-4, 1, 2, 6, 6, 3, 'uShoe', 2); v.rbox(-3, 1, 4, 2, 6, 5, 'uShoe', 2); for (const x of [1, 3]) v.paint(x, 2, 4, x, 5, 4, 'lace');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam + celana abu + jaket marun kakak', top: 'jaket', helmOk: true },
  futsal: { name: 'Jersey futsal #7 + decker', top: 'futsal' },
  bengkel: { name: 'Bengkel: kaus hitam + wearpack diikat', top: 'bengkel' },
  jalan: { name: 'Kaus band motor + jeans robek + topi terbalik', top: 'band', cap: true },
  malam: { name: 'Malam: jaket marun + helm kuning petir', top: 'malam', helm: true, helmOk: true },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const base = OUTFITS[opt.outfit || 'seragam'];
  const o = { ...base, expr: opt.expr || 'biasa', face: opt.face, helm: base.helm || !!opt.helm };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o), sh = o.top === 'futsal' || o.top === 'bengkel' || o.top === 'band';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'uSkin', shoulder: sl, elbow: sh || o.top === 'jaket' ? 'uSkin' : sl, hip: leg, knee: o.top === 'futsal' ? 'decker' : leg }, SKEL, TAIL);
}
