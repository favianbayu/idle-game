// Kevin kecil: bocah 8 tahun anak orang kaya di Perumahan Bukit Asri, pintar tapi manja, selalu main drone di taman
// kompleks ("Drone-ku nyangkut! Tolong!"). Kulit cerah, rambut lurus belah samping rapi, kacamata bulat, pipi tembam.
// Main: polo biru muda + celana pendek krem + sneakers + remote di tangan kanan + drone putih di tangan kiri.
// Sekolah: seragam SD swasta (kemeja putih + dasi kotak + celana kotak biru) + ransel. Rangka anak (sama dengan Cici).
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace, skullLayer } from './model.js';

export const SKEL = { ank: 3.5, shin: 8, thigh: 8.5, up: 3, neck: 16, shY: 6.5, shZ: 11, upper: 7, fore: 6.5, hipY: 3, flap: 4.5, ballR: 0.7 };
const PV = pivots(SKEL);
const TAIL = [-7, 0, 6];

addRamps({
  kkSkin: ['#d8a882', '#e6b892', '#f0c6a2', '#f8d4b4'], kkSkinS: ['#dcac86'], kkBlush: ['#f0a090'],
  kkHair: ['#120e0c', '#1a1412', '#241c18', '#30261e'], kkHairT: ['#3e3026'], kkKaca: ['#2a3a6a'],
  kkPolo: ['#7ab8e0', '#8ac6ea', '#9ed4f2', '#b4e0f8'], kkPoloS: ['#5a98c0'], kkKrem: ['#c8b48a', '#d6c29a', '#e2d0aa', '#ecdcbc'], kkKremS: ['#a8946a'],
  kkSneak: ['#e4e4e0', '#eeeeea', '#f6f6f4', '#ffffff'], kkSneakS: ['#c0c0bc'], kkSneakK: ['#e83a3a'],
  kkRemote: ['#2a2a30', '#34343a', '#3e3e46', '#4a4a54'], kkRemoteL: ['#4ae04a'],
  kkDrone: ['#d8d8dc', '#e4e4e8', '#eeeef2', '#f8f8fa'], kkDroneS: ['#8a8a92'], kkBaling: ['#3a3a44'],
  kkPutih: ['#d8dade', '#e6e8ec', '#f2f3f6', '#fbfbfd'], kkPutihS: ['#b8bcc4'], kkKotak: ['#1e3a7a', '#26468a', '#2e529a', '#3a60ac'], kkKotakS: ['#142a5a'], kkKotakK: ['#c8282a'],
  kkRansel: ['#e85a2a', '#f06a36', '#f67a44', '#fa8c56'], kkRanselS: ['#b8401a'], kkSepatu: ['#121214', '#1a1a1e', '#26262c', '#36363e'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'kkBlush', s: 'kkSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, ...brow, F0, ...eyes, '.rr........rr.', F0, ...mouth, F0, F0];
const BROW = ['..BBB....BBB..'];
const EYE = [F0, '...KK....KK...', '...WK....KW...'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0, F0]),
  kedip: F(BROW, [F0, F0, '...KK....KK...'], ['.....mmmm.....', F0, F0]),
  marah: F(['...BB....BB...'], EYE, ['....mmmmmm....', '....m....m....', F0]),   // ngambek
  teriak: F(['..BB......BB..'], EYE, ['....mmmmmm....', '....mTTTTm....', '.....mttm.....']),   // "Drone-ku nyangkut!"
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', F0]),
  ketawa: F(BROW, [F0, '..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F(['.BB........BB.'], [F0, '.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '.....mmmm.....', F0]),
};
export const EXPRS = Object.keys(FACES);

function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = z <= 0 ? [-4, -5, 5, 4, 4] : z === 1 ? [-6, -6, 6, 5, 4] : skullLayer(z); v.rrect(z, a, b, c, d, 'kkSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'kkSkin'); v.set(7, 0, 5, 'kkSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'kkSkin'); v.box(-1, y, 6, -1, y, 7, 'kkSkinS'); }
  // rambut lurus belah samping kiri, poni disisir rapi ke kanan
  const hair = new Vox();
  for (let z = 6; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, 'kkHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -8, -8, 6, 7, 'kkHair', 5); hair.rrect(17, -6, -6, 4, 5, 'kkHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -2 ? 9 : 6)) v.set(x, y, z, c); });
  for (let y = -3; y <= 6; y++) { const x = v.front(y, 13); if (x !== null && v.get(x, y, 13) === 'kkHair') v.set(x + 1, y, 13, 'kkHair'); }
  for (let x = -6; x <= 7; x++) for (let z = 18; z >= 14; z--) if (v.has(x, -4, z)) { v.set(x, -4, z, 'kkHairT'); break; }
  // kacamata bulat (peta piksel di depan mata, lensa terbuka)
  const fx = v.front(-1, 8) + 1;
  ['.GGGGG..GGGGG.', 'GG...GGGG...GG', '.G...G..G...G.', '.GGGGG..GGGGG.'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'G') v.set(fx, c - 7, 10 - r, 'kkKaca'); }));
  return v;
}

/* ---------- badan anak (sisi +y; sisi -y = cermin): dada z 21..35, lengan y 5..8 */
const bodyC = o => o.top === 'main' ? 'kkPolo' : 'kkPutih';
const legC = o => o.top === 'main' ? 'kkKrem' : 'kkKotak';
const kotak = v => { v.each((x, y, z, k) => { if (k !== 'kkKotak') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x; if ((u + 40) % 3 === 0 && z % 3 === 0) v.set(x, y, z, 'kkKotakK'); else if ((u + 40) % 3 === 0 || z % 3 === 0) v.set(x, y, z, 'kkKotakS'); }); return v; };
function chest(o) {
  const v = new Vox(), c = bodyC(o);
  for (let z = 21; z <= 35; z++) { const t = z === 35 ? 1 : 0, b = z <= 26 ? 1 : 0; v.rrect(z, -3, -5 + t, 3 + b - t, 4 - t, c, 3); }   // perut tembam
  v.rbox(-2, -2, 36, 1, 1, 38, 'kkSkin', 1);
  for (let z = 36; z <= 37; z++) v.shell(z, -3, -3, 2, 2, c, 1);   // kerah
  if (o.top === 'main') { for (let z = 31; z <= 35; z++) v.pf(-1, z, 'kkPoloS'); v.pf(-1, 33, 'kkPutih'); v.pf(-1, 31, 'kkPutih'); v.pf(-4, 31, 'kkSneakK'); }   // kancing polo + logo kecil
  else {
    for (let z = 22; z <= 34; z++) v.pf(0, z, 'kkPutihS');
    for (let z = 26; z <= 35; z++) for (const y of z >= 34 ? [-1, 0, 1, -2] : [-1, 0]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'kkKotak'); }   // dasi kotak
    kotak(v);
    for (let z = 23; z <= 34; z++) for (const y of [-5, 4]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'kkRanselS'); }   // tali ransel
    v.rbox(-9, -4, 23, -4, 3, 34, 'kkRansel', 2); v.paint(-9, -3, 24, -9, 2, 29, 'kkRanselS');   // ransel oranye
  }
  return v;
}
function pelvis(o) {
  const v = new Vox(), c = legC(o);
  v.rbox(-3, -4, 16, 3, 3, 22, c, 2);
  for (let z = 15; z <= 22; z++) v.shell(z, -4, -5, 4, 4, c, 3);
  v.shell(22, -4, -5, 4, 4, 'kkRemote', 3);   // ikat pinggang
  return o.top === 'main' ? v : kotak(v);
}
function arm(o) { const v = new Vox(), c = bodyC(o); v.rbox(-2, 5, 28, 1, 8, 34, 'kkSkin', 2); v.rrect(35, -2, 5, 1, 8, c, 1); v.paint(-2, 5, 31, 1, 8, 35, c); v.shell(31, -3, 5, 2, 9, c, 1); return v; }
function fore(o, side) {
  const v = new Vox();
  v.rbox(-2, 5, 21, 1, 8, 27, 'kkSkin', 2);
  v.rbox(-2, 5, 18, 2, 8, 20, 'kkSkin', 2); v.rrect(17, -1, 6, 1, 7, 'kkSkin', 1);
  if (o.top === 'main' && side > 0) { v.rbox(0, 5, 14, 5, 9, 19, 'kkRemote', 1); v.set(5, 6, 18, 'kkRemoteL'); v.set(5, 8, 18, 'kkRemoteL'); for (let z = 20; z <= 24; z++) v.set(4, 9, z, 'kkRemote'); }   // remote + antena
  if (o.top === 'main' && side < 0) {   // drone quadcopter putih dijinjing: badan, 4 lengan, 4 baling-baling
    v.rbox(-3, 6, 11, 3, 10, 14, 'kkDrone', 1); v.set(3, 8, 12, 'kkDroneS');
    for (const [dx, dy] of [[-5, -2], [-5, 2], [5, -2], [5, 2]]) { const x = dx, y = 8 + dy * 2; for (let t = 0; t <= 4; t++) v.set(Math.round(dx * t / 5), 8 + Math.round(dy * 2 * t / 5), 14, 'kkDroneS'); for (let k = -2; k <= 2; k++) { v.set(x + k, y, 15, 'kkBaling'); v.set(x, y + k, 15, 'kkBaling'); } }
  }
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-2, 1, 12, 2, 4, 20, 'kkSkin', 2); for (let z = 15; z <= 20; z++) v.shell(z, -3, 0, 3, 5, c, 2); return o.top === 'main' ? v : kotak(v); }
function shin(o) { const v = new Vox(); v.rbox(-2, 1, 4, 1, 4, 12, 'kkSkin', 2); v.paint(-2, 1, 4, 1, 4, 7, 'kkSneak'); return v; }
function foot(o) {
  const v = new Vox();
  if (o.top === 'sekolah') { v.rbox(-3, 0, 0, 4, 5, 0, 'belt', 2); v.rbox(-3, 0, 1, 4, 5, 3, 'kkSepatu', 2); return v; }
  v.rbox(-3, 0, 0, 4, 5, 1, 'kkSneakS', 2); v.rbox(-3, 0, 2, 4, 5, 3, 'kkSneak', 2); v.paint(-3, 0, 2, 4, 0, 2, 'kkSneakK'); v.paint(-3, 5, 2, 4, 5, 2, 'kkSneakK');
  return v;
}

export const OUTFITS = {
  main: { name: 'Main drone: polo biru muda + celana pendek krem + sneakers + remote + drone putih', top: 'main' },
  sekolah: { name: 'Sekolah: seragam SD swasta (kemeja putih + dasi kotak + celana kotak biru) + ransel oranye', top: 'sekolah' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.main), expr: opt.expr || 'biasa', face: opt.face };
  const Th = thigh(o), Sn = shin(o), Ft = foot(o), A = arm(o), sl = bodyC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'kkSkin', shoulder: sl, elbow: 'kkSkin', hip: leg, knee: 'kkSkin' }, SKEL, TAIL);
}
