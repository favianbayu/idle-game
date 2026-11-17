// Bu Melati: guru Seni Musik pembina band & pensi, 30-an, nyentrik dan hangat. Rambut hitam panjang bergelombang
// tergerai sampai punggung dengan jepit bunga kamboja, gaun tenun ikat etnik merah muda-ungu, selendang, gelang kayu
// bertumpuk, kalung manik, sandal kulit. Rangka keluarga Nadia (skala 1.25), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  mlSkin: ['#ae7a54', '#c8906a', '#d9a07a', '#e6b28e'], mlSkinS: ['#c08862'], mlBlush: ['#d8806a'],
  mlHair: ['#0e0806', '#160e0a', '#20140e', '#2e1e16'], mlHairT: ['#40281c'], kamboja: ['#f8f4ea'], kambojaC: ['#f0c040'],
  tenun: ['#9a3a6a', '#b04a7c', '#c25a8a', '#d2709c'], tenunS: ['#4a1a3a'], tenunK: ['#f2d27a'], tenunU: ['#5a2a7a'],
  selendang: ['#d88a2a', '#e89a3a', '#f2ac4e', '#fac068'], kayu: ['#6a3e1e', '#7e4c26', '#925a2e', '#a66a3a'], manik: ['#2aa0a0'], manikM: ['#e04a3a'],
  hitamM: ['#141216', '#1c1a1e', '#262428', '#343236'], linen: ['#d8ccb0', '#e4dac0', '#eee6d0', '#f6f0e0'], linenS: ['#c0b494'],
  sandalM: ['#6a4024', '#7e4c2c', '#925a34', '#a86a40'],
});

/* ---------- wajah: alis tebal melengkung ekspresif, mata besar bercelak, senyum lebar hangat tepat di bawah hidung, tahi lalat */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'mlBlush', s: 'mlSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mata z 9..8, mulut z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['.KKKK....KKKK.', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['...m......m...', '....mmmmmm....', '.r..........r.']),
  kedip: F(BROW, [F0, '.KKKK....KKKK.'], ['...m......m...', '....mmmmmm....', '.r..........r.']),
  marah: F('..BBB....BBB..', ['.KKKK....KKKK.', '..WKK....KKW..'], ['....mmmmmm....', F0, F0]),
  teriak: F('.BBB......BBB.', ['.KKKK....KKKK.', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', '.r..........r.']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', '.r...mmmm...r.']),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const topZ = (v, x, y) => { for (let z = 30; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'mlSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'mlSkin'); v.set(7, -1, 4, 'mlSkinS');
  v.set(6, 4, 5, 'mlHair');   // tahi lalat
  // rambut panjang bergelombang belah samping: membingkai wajah sampai bahu, belakang tergerai menempel punggung
  const hair = new Vox();
  for (let z = -2; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, 'mlHair', z <= 11 ? 4 : 5);
  for (let z = 16; z <= 17; z++) hair.rrect(z, -7, -7, 5, 6, 'mlHair', 4);
  const zmin = (x, y) => x >= 5 ? (Math.abs(y + 0.5) > 6.5 ? 0 : y > 2 ? 13 : 14) : x >= 0 ? (Math.abs(y + 0.5) > 6.5 ? -2 : 99) : -2;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && (z >= zmin(x, y) || z >= 13)) v.set(x, y, z, c); });
  for (let y = -6; y <= 2; y++) { const x = (v.front(y, 13) ?? 6) + 1; if (x <= 8) { v.set(x, y, 13, 'mlHair'); if (y <= -3) v.set(x, y, 12, 'mlHair'); } }   // poni sapuan miring
  for (let z = -3; z >= -22; z--) {   // tergerai di punggung, makin bawah makin sempit, ujung bergelombang
    const w = z >= -10 ? 7 : z >= -17 ? 6 : 4, x0 = z > -4 ? -9 : -7;
    for (let y = -w - 1; y <= w; y++) { if (z <= -19 && (y + 40) % 3 === 0) continue; for (let x = x0 - 1; x <= x0; x++) if (!v.has(x, y, z)) v.set(x, y, z, 'mlHair'); }
  }
  v.each((x, y, z, c) => { if (c === 'mlHair' && z <= 8 && v.back(y, z) === x && (Math.floor((z + 40) / 3) + y + 40) % 5 === 0) v.set(x, y, z, 'mlHairT'); });   // alur gelombang di punggung
  // jepit bunga kamboja di atas telinga kanan
  for (const [dy, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) v.set(2, 9 + dy, 11 + dz, dy === 0 && dz === 0 ? 'kambojaC' : 'kamboja');
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
const ikat = v => {   // tenun ikat: pita mendatar berulang (zigzag kuning, belah ketupat ungu)
  v.each((x, y, z, k) => {
    if (k !== 'tenun') return;
    const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, b = ((z + 40) % 8);
    if (b === 0) v.set(x, y, z, 'tenunS');
    else if (b === 2 && ((u + 40) % 4 === 0 || (u + 42) % 4 === 0)) v.set(x, y, z, 'tenunK');
    else if (b === 3 && (u + 41) % 4 === 0) v.set(x, y, z, 'tenunK');
    else if (b >= 5 && b <= 7 && Math.abs(((u + 40) % 6) - 3) + Math.abs(b - 6) <= 1) v.set(x, y, z, 'tenunU');
  });
  return v;
};
const dressC = o => ({ etnik: 'tenun', pensi: 'tenun', santai: 'linen' }[o.top]);
const skirtC = o => o.top === 'santai' ? ['linen', 'linenS'] : ['tenun', 'tenunS'];
function chest(o) {
  const v = new Vox(), T = o.top, c = T === 'pensi' ? 'hitamM' : dressC(o);
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -4, -6 + t + w, 4 - t, 5 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'mlSkin', 1);
  for (let z = 48; z <= 51; z++) for (let y = -3; y <= 2; y++) if (Math.abs(y + 0.5) <= (z - 47) * 0.8) v.pf(y, z, 'mlSkin');   // leher V/sabrina
  if (T === 'etnik') ikat(v);
  // kalung manik-manik panjang
  for (let y = -3; y <= 2; y++) { const z = 46 + Math.round(Math.abs(y + 0.5) * 1.2); const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, (y + 40) % 2 ? 'manik' : 'manikM'); }
  if (T === 'pensi' || T === 'etnik') {   // selendang oranye disampirkan dari bahu kiri ke pinggang kanan
    for (let z = 32; z <= 52; z++) { const y = Math.round(-6 + (52 - z) * 0.55); for (let dy = -1; dy <= 1; dy++) { const yy = y + dy, x = v.front(yy, z); if (x !== null && yy <= 6) v.set(x + 1, yy, z, (z + dy) % 4 === 0 ? 'tenunK' : 'selendang'); } }
    for (let z = 44; z <= 53; z++) for (let y = -8; y <= -5; y++) { const x = v.back(y, z); if (x !== null) v.set(x - 1, y, z, 'selendang'); }
  }
  if (T === 'santai') for (let z = 32; z <= 47; z++) v.pf(-1, z, 'linenS');
  return v;
}
function pelvis(o) {
  const [c, cS] = skirtC(o), v = skirtPelvis(c, cS, 20);
  if (o.top === 'pensi') for (let z = 31; z <= 33; z++) v.shell(z, -5, -7, 4, 6, 'hitamM', 3);
  return c === 'tenun' ? ikat(v) : v;
}
const sleeveC = o => o.top === 'pensi' ? 'hitamM' : dressC(o);
function arm(o) { const v = new Vox(), c = sleeveC(o); v.rbox(-2, 6, 40, 2, 10, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2); return c === 'tenun' ? ikat(v) : v; }
function fore(o, side) {
  const v = new Vox();
  v.rbox(-2, 6, 31, 2, 10, 39, 'mlSkin', 2);   // lengan bajunya sampai siku
  v.rbox(-2, 6, 27, 3, 10, 30, 'mlSkin', 2); v.rrect(26, -1, 7, 2, 9, 'mlSkin', 1);
  for (const [z, k] of side > 0 ? [[31, 'kayu'], [33, 'kayu'], [32, 'tenunK']] : [[31, 'kayu'], [32, 'kayu'], [34, 'kayu'], [33, 'manik']]) v.shell(z, -3, 5, 3, 11, k, 2);   // gelang kayu bertumpuk
  if (side < 0) for (const [x, y, z] of [[3, 8, 27], [3, 9, 27]]) v.set(x, y, z, 'kayu');   // cincin kayu
  return v;
}
function foot() {   // sandal kulit tali silang
  const v = new Vox();
  v.rbox(-4, 1, 0, 6, 6, 0, 'sandalM', 2); v.rbox(-3, 2, 1, 5, 5, 2, 'mlSkin', 2); v.rbox(-3, 2, 3, 1, 5, 4, 'mlSkin', 2);
  for (const [x, y] of [[4, 2], [3, 3], [2, 4], [1, 5], [4, 5], [3, 4], [2, 3], [1, 2]]) v.set(x, y, 2, 'sandalM');
  v.paint(-3, 2, 3, -3, 5, 3, 'sandalM');
  return v;
}

export const OUTFITS = {
  etnik: { name: 'Mengajar: gaun tenun ikat merah muda + selendang + gelang kayu + kalung manik', top: 'etnik' },
  pensi: { name: 'Pensi: atasan hitam + rok tenun + selendang oranye', top: 'pensi' },
  santai: { name: 'Santai: terusan linen krem + gelang kayu', top: 'santai' },
};
export function build(opt = {}) {
  // game memanggil 'seragam': Bu Melati memakai gaun etnik
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.etnik), expr: opt.expr || 'biasa', face: opt.face };
  const [c, cS] = skirtC(o), A = arm(o), Ft = foot(o), sl = sleeveC(o);
  const p = v => c === 'tenun' ? ikat(v) : v;
  const Th = p(skirtThigh(c)), Sn = p(skirtShin(c, cS)), panel = s => p(skirtPanel(c, cS, s, 5));
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'mlSkin', shoulder: sl, elbow: 'mlSkin', hip: c, knee: c }, SKEL, TAIL);
  P.skirt = skirtInfo(P, c, cS);
  return P;
}
