// Bu Ratna: guru Matematika yang galak, 40-an, pemegang remedial. Rambut hitam dikonde tinggi rapi, kacamata kotak
// bingkai merah tua, bibir merah, blazer hitam di atas blus putih, rok pensil selutut, pantofel, penggaris kayu panjang
// selalu di tangan kanan. Rangka keluarga Nadia (skala 1.26), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  raSkin: ['#c48e68', '#dca882', '#e8b890', '#f4caa6'], raSkinS: ['#d8a27c'], raLip: ['#a8202c'],
  raHair: ['#08060a', '#100c10', '#1a1418', '#282024'], raHairT: ['#3a3038'], raFrame: ['#6a1420'], raLens: ['#e4eef4'],
  blazerR: ['#121216', '#1a1a20', '#24242a', '#323238'], blazerRS: ['#08080a'], blusR: ['#e6e2da', '#f0ece4', '#f8f6f0', '#ffffff'],
  rokR: ['#1e1e24', '#28282e', '#323238', '#404048'], rokRS: ['#121216'], stocking: ['#b88c6c', '#c89a78', '#d8aa86', '#e2b694'],
  penggaris: ['#a8743a', '#c08a48', '#d8a058', '#e8b670'], penggarisS: ['#5a3a1a'],
  batikR2: ['#6a1a2a', '#7e2232', '#922a3c', '#a83a4c'], batikR2S: ['#3a0a14'], batikR2K: ['#e8c070'],
  kardiR: ['#5a1e2a', '#6a2432', '#7a2c3a', '#8e3a48'], kulotR: ['#2a2a30', '#34343a', '#3e3e46', '#4c4c56'], pantoR: ['#06060a', '#0e0e14', '#1a1a22', '#3a3a48'],
});

/* ---------- wajah: alis tipis menukik tegas, mata tajam di balik kacamata kotak, bibir merah datar tepat di bawah hidung */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'raLip', T: 'teeth', t: 'tongue', s: 'raSkinS', M: 'mouth' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mata z 9..8, mulut z 4
const BROW = '.BBB......BBB.';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0, F0]),
  marah: F('...BBB..BBB...', ['..KKK....KKK..', '...WK....KW...'], ['....mmmmmm....', F0, F0]),   // "Remedial!"
  teriak: F('...BBB..BBB...', EYE, ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['....m....m....', '.....mmmm.....', F0]),   // jarang senyum
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', F0]),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const topZ = (v, x, y) => { for (let z = 30; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'raSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'raSkin'); v.set(7, -1, 4, 'raSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'raSkin'); v.box(-1, y, 6, -1, y, 7, 'raSkinS'); }
  v.set(-1, 8, 5, 'raFrame'); v.set(-1, -9, 5, 'raFrame');   // anting merah kecil
  // rambut ditarik licin ke atas-belakang (belah samping kanan), telinga terbuka, konde bulat tinggi di ubun-ubun belakang
  const hair = new Vox();
  for (let z = 6; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'raHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -6, -6, 5, 5, 'raHair', 4);
  const zmin = (x, y) => x >= 5 ? (Math.abs(y + 0.5) > 4.5 ? 12 : 14) : Math.abs(y + 0.5) > 6.5 && x >= -2 ? 10 : 5;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (let x = -4; x <= 6; x++) { const z = topZ(v, x, 3); if (z !== null) v.set(x, 3, z, 'raHairT'); }   // belahan
  for (const y of [-5, -2, 5]) for (let x = -6; x <= 5; x++) { const z = topZ(v, x, y); if (z !== null && (x + y) % 3 === 0) v.set(x, y, z, 'raHairT'); }
  for (let x = -12; x <= -3; x++) for (let y = -5; y <= 4; y++) for (let z = 12; z <= 21; z++) { const d = ((x + 7.5) / 4.2) ** 2 + ((y + 0.5) / 4.6) ** 2 + ((z - 16.5) / 4) ** 2; if (d <= 1 && !v.has(x, y, z)) v.set(x, y, z, 'raHair'); }
  for (let y = -4; y <= 3; y++) { const x = v.back(y, 16); if (x !== null) v.set(x, y, 16, 'raHairT'); }   // lilitan konde
  for (let k = -5; k <= 4; k++) v.set(-7, k, 19, 'penggaris');   // tusuk konde kayu
  // kacamata kotak bingkai merah tua: tepi tebal 1 voxel di sekeliling mata
  const fx = v.front(-1, 8) + 1;
  for (const y0 of [-6, 1]) for (let y = y0; y <= y0 + 4; y++) for (let z = 7; z <= 10; z++) if (y === y0 || y === y0 + 4 || z === 7 || z === 10) v.set(fx, y, z, 'raFrame');
  for (const y0 of [-6, 1]) v.set(fx, y0 + 3, 9, 'raLens');
  for (const y of [-1, 0]) v.set(fx, y, 9, 'raFrame');
  for (const y of [-7, 6]) v.set(fx, y, 10, 'raFrame');
  for (const y of [-8, 7]) for (let x = fx - 1; x >= -1; x--) if (!v.has(x, y, 10)) v.set(x, y, 10, 'raFrame');
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
const topC = o => ({ blazer: 'blazerR', batik: 'batikR2', santai: 'kardiR' }[o.top]);
const skirtC = o => o.top === 'batik' ? ['batikR2', 'batikR2S'] : ['rokR', 'rokRS'];
const batik = v => { v.each((x, y, z, k) => { if (k !== 'batikR2') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + 40) % 5), b = ((z + 40) % 5); if ((a === 2 && b === 2)) v.set(x, y, z, 'batikR2K'); else if (Math.abs(a - 2) + Math.abs(b - 2) === 2) v.set(x, y, z, 'batikR2S'); }); return v; };
function chest(o) {
  const v = new Vox(), T = o.top, c = topC(o);
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -4, -6 + t + w, 4 - t, 5 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'raSkin', 1);
  if (T === 'blazer') {   // blazer hitam berkerah tajam, blus putih berkerah, satu kancing
    for (let z = 40; z <= 51; z++) { const hw = Math.round((z - 40) * 0.32); for (let y = -1 - hw; y <= hw; y++) v.pf(y, z, 'blusR'); for (const y of [-2 - hw, hw + 1]) v.pf(y, z, 'blazerRS'); }
    for (let z = 32; z <= 39; z++) v.pf(-1, z, 'blazerRS');
    v.pf(0, 38, 'blusR');
    for (let z = 52; z <= 53; z++) v.shell(z, -3, -4, 3, 3, 'blusR', 2);
    for (let y = -6; y <= -3; y++) v.pf(y, 46, 'blazerRS');
    return v;
  }
  if (T === 'batik') { batik(v); for (let z = 52; z <= 53; z++) v.shell(z, -3, -4, 3, 3, 'batikR2', 2); return v; }
  // santai: kardigan marun terbuka di atas kaus putih
  for (let z = 32; z <= 51; z++) for (let y = -2; y <= 1; y++) v.pf(y, z, 'blusR');
  for (let z = 33; z <= 50; z += 4) { v.pf(-3, z, 'blazerRS'); }
  return v;
}
function pelvis(o) {
  if (o.top === 'santai') { const v = new Vox(); v.rbox(-4, -6, 26, 4, 5, 33, 'kulotR', 3); v.box(-3, -2, 24, 2, 1, 25, 'kulotR'); for (let z = 30; z <= 33; z++) v.shell(z, -5, -7, 5, 6, 'kardiR', 3); return v; }
  const [c, cS] = skirtC(o), v = skirtPelvis(c, cS, 20);
  if (o.top === 'blazer') for (let z = 30; z <= 33; z++) v.shell(z, -5, -7, 5, 6, z === 30 ? 'blazerRS' : 'blazerR', 3);
  return o.top === 'batik' ? batik(v) : v;
}
const sleeveC = o => topC(o);
function arm(o) { const v = new Vox(), c = sleeveC(o); v.rbox(-2, 6, 40, 2, 10, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2); return o.top === 'batik' ? batik(v) : v; }
function fore(o, side) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-2, 6, 31, 2, 10, 39, c, 2);
  if (o.top === 'blazer') v.paint(-2, 6, 31, 2, 10, 31, 'blusR');
  if (o.top === 'batik') batik(v);
  v.rbox(-2, 6, 27, 3, 10, 30, 'raSkin', 2); v.rrect(26, -1, 7, 2, 9, 'raSkin', 1);
  if (side > 0 && o.top !== 'santai') {   // penggaris kayu 1 meter digenggam, ujung menunjuk ke bawah depan
    for (let k = 0; k <= 26; k++) for (const y of [8, 9]) v.set(3 + Math.round(k * 0.15), y, 30 - k, k % 4 === 0 && y === 9 ? 'penggarisS' : 'penggaris');
    for (let k = 0; k <= 5; k++) v.set(3, 8, 31 + k, 'penggaris');
  }
  if (side < 0) v.paint(-2, 6, 30, 2, 10, 30, 'blazerRS');   // jam tangan hitam
  return v;
}
const legC = o => o.top === 'santai' ? 'kulotR' : 'stocking';
function thigh(o) { const v = new Vox(), c = o.top === 'santai' ? 'kulotR' : skirtC(o)[0]; v.rbox(-3, 1, 17, 2, 6, 30, c, 2); v.rrect(31, -2, 2, 1, 5, c, 2); return o.top === 'batik' ? batik(v) : v; }
function shin(o) { const c = legC(o), v = new Vox(); v.rbox(-3, 1, 6, 2, 6, 17, c, 2); v.rrect(18, -2, 2, 1, 5, c, 2); return v; }
function foot() {   // pantofel hitam hak rendah
  const v = new Vox();
  v.rbox(-4, 1, 0, 6, 6, 0, 'pantoR', 2); v.rbox(-4, 1, 1, 6, 6, 3, 'pantoR', 2); v.rbox(-3, 2, 4, 1, 5, 4, 'stocking', 2); v.box(-4, 3, 0, -3, 4, 1, 'pantoR');
  v.set(6, 3, 3, 'raLens');
  return v;
}

function pencil(c, cS, s) {   // panel rok pensil: lebar tetap (tidak mengembang), keliman di bawah lutut, belahan belakang
  const v = new Vox();
  for (let z = 15; z <= 31; z++) s > 0 ? v.box(3, -6, z, 5, 5, z, c) : v.box(-6, -6, z, -4, 5, z, c);
  if (s < 0) for (let z = 15; z <= 18; z++) for (const y of [-1, 0]) v.set(-6, y, z, null);
  for (let y = -6; y <= 5; y++) { const x = s > 0 ? v.front(y, 15) : v.back(y, 15); if (x !== null) v.set(x, y, 15, cS); }
  return v;
}

export const OUTFITS = {
  blazer: { name: 'Mengajar: blazer hitam + blus putih + rok pensil + penggaris kayu', top: 'blazer' },
  batik: { name: 'Jumat: terusan batik marun motif kawung + penggaris', top: 'batik' },
  santai: { name: 'Akhir pekan: kardigan marun + kaus putih + kulot hitam', top: 'santai' },
};
export function build(opt = {}) {
  // game memanggil 'seragam': Bu Ratna memakai blazer
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.blazer), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), K = o.top === 'santai', [c, cS] = skirtC(o);
  const panel = s => K ? null : (o.top === 'batik' ? batik(pencil(c, cS, s)) : pencil(c, cS, s));
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'raSkin', shoulder: sl, elbow: sl, hip: K ? 'kulotR' : c, knee: K ? 'kulotR' : 'stocking' }, SKEL, TAIL);
  if (!K) P.skirt = skirtInfo(P, c, cS, false);
  return P;
}
