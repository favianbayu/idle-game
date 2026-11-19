// Mbah Karto: kakek warga Kenanga yang duduk di teras atau pos ronda, suka cerita "jaman Mbah dulu". Kurus bungkuk,
// botak dengan rambut putih tipis di samping & belakang, kacamata bulat, kumis putih, kaus oblong + sarung kotak, tongkat
// kayu, sandal jepit. Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  krSkin: ['#8a5a36', '#a06a42', '#b47c52', '#c48c62'], krSkinS: ['#9a643e'], krBotak: ['#b88a60', '#c89a6e', '#d6a87c', '#e2b68a'],
  krUban: ['#c4c0b8', '#d4d0c8', '#e2dfd8', '#efede8'], krKumis: ['#9a968e'], krKaca: ['#4a3a2a'],
  oblK: ['#d0ccbe', '#dcd8ca', '#e6e2d6', '#eeebe0'], oblKS: ['#bcb6a6'], srK: ['#2a4a3a', '#325a46', '#3a6a52', '#467c60'], srKS: ['#1a3226'], srKK: ['#d8c890'],
  tongkat: ['#5a3a1e', '#6a4424', '#7a502c', '#8c5e36'], jepitK: ['#2a2a30', '#34343a', '#3e3e46', '#4a4a54'],
  jaketK: ['#4a3a2a', '#584632', '#66523a', '#766246'], jaketKS: ['#34281c'], gelasK: ['#e8e4d8'], kopiK: ['#3a2210'],
});

/* ---------- wajah: alis putih jarang, mata sayu kecil di balik kacamata bulat, kumis putih, senyum ompong */
const FCH = { B: 'krUban', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'krSkinS', k: 'krKumis' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, F0, ...eyes, 's...........s.', '...kkk..kkk...', ...mouth, F0, F0];   // alis z 11, mata z 8..7, kumis z 5, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['...KK....KK...', '..sKK....KKs..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....mmmmmm....', F0, F0]),
  kedip: F(BROW, [F0, '..sKK....KKs..'], ['....mmmmmm....', F0, F0]),
  marah: F('...BBB..BBB...', ['..KKK....KKK..', '..WKK....KKW..'], ['....mmmmmm....', '....m....m....', F0]),
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mT..Tm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['...mT....Tm...', '....mmmmmm....', F0]),   // gigi tinggal dua
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mT....Tm...', '....mttttm....', '.....mmmm.....']),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....T....T....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-5, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 15; z++) { const [a, b, c, d, r] = skull(Math.min(z, 14)); v.rrect(z, a, b, c, d, z >= 12 ? 'krBotak' : 'krSkin', z === 15 ? 5 : r); }   // kepala botak mengilap
  v.rrect(16, -4, -4, 3, 3, 'krBotak', 2);
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 7, 'krSkin'); v.box(8, -1, 5, 8, 0, 5, 'krSkin'); v.set(7, -1, 5, 'krSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 4, 0, y, 8, 'krSkin'); v.box(-1, y, 5, -1, y, 7, 'krSkinS'); }
  v.set(3, -3, 15, 'krUban'); v.set(4, 2, 14, 'krBotak');
  // rambut putih tipis melingkar di samping & belakang (tapal kuda), puncak botak
  for (let z = 5; z <= 11; z++) for (let x = -9; x <= 3; x++) for (let y = -9; y <= 8; y++) {
    if (v.has(x, y, z)) continue;
    const d = ((x + 0.5) / 8.6) ** 2 + ((y + 0.5) / 8.4) ** 2;
    if (d <= 1 && d > 0.7 && !(Math.abs(y + 0.5) > 6.5 && x >= -2 && z <= 8)) v.set(x, y, z, 'krUban');
  }
  // kacamata bulat bingkai cokelat (z 6..9), gagang ke telinga
  const fx = v.front(-1, 8) + 1;
  for (const yc of [-3.5, 2.5]) for (let y = -7; y <= 6; y++) for (let z = 6; z <= 9; z++) { const d = ((y - yc) / 2.6) ** 2 + ((z - 7.5) / 2) ** 2; if (d <= 1.05 && d >= 0.45) v.set(fx, y, z, 'krKaca'); }
  for (const y of [-1, 0]) v.set(fx, y, 8, 'krKaca');
  for (const y of [-7, 6]) for (let x = fx; x >= -1; x--) if (!v.has(x, y, 8)) v.set(x, y, 8, 'krKaca');
  if (o.peci) {
    for (let z = 13; z <= 19; z++) for (let x = -9; x <= 8; x++) for (let y = -9; y <= 8; y++) { const d = ((x + 0.5) / 8.6) ** 2 + ((y + 0.5) / 8.3) ** 2; if (d <= 1 && (d > 0.62 || z >= 18)) v.set(x, y, z, 'jepitK'); }
    for (let x = -8; x <= 7; x++) for (let y = -8; y <= 7; y++) if (((x + 0.5) / 8.6) ** 2 + ((y + 0.5) / 8.3) ** 2 <= 1) for (let z = 13; z <= 17; z++) if (!v.has(x, y, z)) v.set(x, y, z, 'jepitK');
  }
  return v;
}

/* ---------- badan kurus bungkuk (sisi +y; sisi -y = cermin) */
const bodyC = o => o.top === 'ronda' ? 'jaketK' : 'oblK';
const kotak = (v, c, cS, cK) => { v.each((x, y, z, k) => { if (k !== c) return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x; if ((u + 40) % 4 === 0 || z % 4 === 0) v.set(x, y, z, (z % 8 === 0 && (u + 40) % 4 === 0) ? cK : cS); }); return v; };
function chest(o) {
  const v = new Vox(), c = bodyC(o);
  for (let z = 34; z <= 56; z++) { const t = z === 56 ? 1 : 0, hump = z >= 46 ? Math.min(2, Math.floor((z - 44) / 4)) : 0; v.rrect(z, -5 - hump, -8 + t, 3 - t, 7 - t, c, 3); }   // punggung bungkuk
  v.rbox(-3, -3, 57, 2, 2, 60, 'krSkin', 2);
  for (let y = -3; y <= 2; y++) v.pf(y, 56, 'krSkin');
  if (o.top === 'teras') { v.pf(-4, 47, 'oblKS'); v.pf(3, 40, 'oblKS'); v.pf(4, 40, 'oblKS'); }   // kaus belel berlubang
  if (o.top === 'ronda') {   // jaket lusuh terbuka di atas kaus, sarung dikalungkan di leher
    for (let z = 34; z <= 55; z++) for (let y = -2; y <= 1; y++) v.pf(y, z, 'oblK');
    for (let z = 34; z <= 55; z++) for (const y of [-3, 2]) v.pf(y, z, 'jaketKS');
    for (let z = 50; z <= 58; z++) for (let y = -8; y <= 7; y++) { if (Math.abs(y + 0.5) < 3.5 && z < 57) continue; const xf = v.front(y, Math.min(z, 56)), xb = v.back(y, Math.min(z, 56)); if (xf === null) continue; if (z >= 57) { for (let x = xb - 1; x <= xf + 1; x++) v.set(x, y, z, 'srK'); } else if (Math.abs(y + 0.5) <= 5.5) v.set(xf + 1, y, z, 'srK'); }
    kotak(v, 'srK', 'srKS', 'srKK');
  }
  return v;
}
function pelvis(o) {
  const v = new Vox();
  for (let z = 26; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'srK', 3);
  v.rbox(-5, -7, 26, 4, 6, 33, 'srK', 3); v.rbox(-6, -8, 32, 5, 7, 33, 'srKS', 3); v.box(-4, -2, 24, 3, 1, 25, 'srK');   // gulungan sarung di perut
  return kotak(v, 'srK', 'srKS', 'srKK');
}
function arm(o) { const v = new Vox(), c = bodyC(o); v.rbox(-3, 7, 43, 2, 11, 55, o.top === 'ronda' ? c : 'krSkin', 2); v.rrect(56, -3, 7, 2, 11, c, 3); if (o.top !== 'ronda') { v.paint(-3, 7, 49, 2, 11, 56, c); v.shell(49, -4, 6, 3, 12, c, 2); } return v; }
function fore(o, side) {
  const v = new Vox(), R = o.top === 'ronda';
  v.rbox(-3, 7, 31, 2, 11, 42, R ? 'jaketK' : 'krSkin', 2);
  if (R) v.paint(-3, 7, 31, 2, 11, 31, 'jaketKS');
  v.rbox(-3, 7, 27, 3, 11, 30, 'krSkin', 2); v.rrect(26, -2, 8, 2, 10, 'krSkin', 2);
  if (side > 0) {   // tongkat kayu: gagang melengkung di atas kepalan, batang lurus sampai tanah
    for (let z = 1; z <= 30; z++) v.set(1, 9, z, 'tongkat');
    for (let x = 1; x <= 4; x++) v.set(x, 9, 31, 'tongkat'); v.set(4, 9, 30, 'tongkat');
    v.set(1, 9, 0, 'jepitK');
  }
  if (side < 0 && R) {   // gelas kopi hitam
    v.rbox(0, 7, 21, 3, 10, 25, 'gelasK', 1); v.paint(0, 7, 25, 3, 10, 25, 'kopiK');
  }
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-4, 1, 18, 4, 8, 31, 'srK', 3); v.rrect(32, -3, 2, 2, 7, 'srK', 3); return kotak(v, 'srK', 'srKS', 'srKK'); }
function shin() { const v = new Vox(); v.rbox(-4, 1, 8, 4, 8, 18, 'srK', 3); v.rrect(19, -4, 1, 3, 8, 'srK', 3); kotak(v, 'srK', 'srKS', 'srKK'); v.rbox(-2, 3, 5, 2, 6, 7, 'krSkin', 2); return v; }
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 0, 'jepitK', 3); v.rbox(-3, 2, 1, 6, 7, 2, 'krSkin', 2); v.rbox(-3, 2, 3, 2, 7, 4, 'krSkin', 2);
  for (const [x, y] of [[5, 4], [4, 3], [4, 5], [3, 2], [3, 6]]) v.set(x, y, 2, 'jepitK');
  return v;
}

export const OUTFITS = {
  teras: { name: 'Teras: kaus oblong belel + sarung kotak hijau + tongkat + sandal jepit', top: 'teras', propOn: 'all' },
  ronda: { name: 'Pos ronda: peci + jaket lusuh + sarung di leher + kopi hitam', top: 'ronda', peci: true },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.teras), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = bodyC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'krSkin', shoulder: sl, elbow: o.top === 'ronda' ? sl : 'krSkin', hip: 'srK', knee: 'srK' }, SKEL, TAIL);
}
