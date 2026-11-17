// Sekar Ayuningtyas: NPC utama cewek, gitaris band "Lantai Dua", pendiam. Kurus, kulit pucat, rambut hitam panjang dikuncir
// dua rendah dengan ikat ungu, poni menutupi alis, mata sayu mengantuk, plester bintang di jari. Seragam + jaket jeans
// kebesaran, rok abu panjang, kets kanvas hitam, gitar di punggung. Rangka skala 1.24 (sama dengan Rani), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace, skullLayer } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  sSkin: ['#c4977a', '#dcb294', '#f0c8a8', '#fad9bf'], sSkinS: ['#dcb294'],
  sHair: ['#0c080a', '#150f12', '#1e1418', '#2e2226'], sHairT: ['#1e1418', '#2e2226', '#433238', '#5a464c'],
  lav: ['#6e4aa0', '#8a5ad0', '#a47ce0', '#c3a6ee'], lavS: ['#b9a3d6', '#cbb9e2', '#dccfee', '#ece4f6'],
  starP: ['#f3d36a'], gig: ['#121116', '#1a191f', '#26252c', '#383740'], gigS: ['#4a4954'],
  canvas: ['#121116', '#1a191f', '#25242b', '#36353e'], bandT: ['#2a2a32', '#36363f', '#44444f', '#575763'], bandP: ['#c9b48a'],
  cargo: ['#141318', '#1d1c22', '#28272e', '#3a3942'], rubber: ['#e8505a'], rubberB: ['#4ab0e0'], rubberY: ['#f2c94c'],
  pajama: ['#3c4a74', '#4a5a8a', '#5a6ca0', '#7487b8'], pajamaS: ['#d8deec'], sock: ['#d7d0e6', '#e6e0f0', '#f2eef8', '#ffffff'],
  sSkirt: ['#4c505c', '#626773', '#7b808c', '#959aa6'], sSkirtS: ['#555a66'],
});

/* ---------- wajah: mata sayu (kelopak turun), alis tertutup poni, mulut kecil */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'sSkinS' };
const F0 = '..............';
const F = (eyes, mouth) => [F0, F0, F0, F0, F0, F0, ...eyes, F0, ...mouth, F0, F0];
export const FACES = {
  biasa: F(['.KKKK....KKKK.', '..WKK....KKW..', '..............'], ['..............', '......mm......', '..............']),
  kedip: F(['..............', '.KKKK....KKKK.', '..............'], ['..............', '......mm......', '..............']),
  marah: F(['.KKKK....KKKK.', '..WKK....KKW..', '..............'], ['..............', '.....mmmm.....', '..............']),
  teriak: F(['.KKKK....KKKK.', '..WKK....KKW..', '..............'], ['.....mmmm.....', '.....mTTm.....', '......mm......']),
  nyengir: F(['..............', '.KKKK....KKKK.', '..............'], ['.....m..m.....', '......mm......', '..............']),
  ketawa: F(['..............', '.K..K....K..K.', '..KK......KK..'], ['.....mTTm.....', '......mm......', '..............']),
  sakit: F(['.KK........KK.', '...KK....KK...', '.KK........KK.'], ['.....mmmm.....', '.....TTTT.....', '..............']),
};
export const EXPRS = Object.keys(FACES);

// poni lurus menutupi alis (garis bawah poni per kolom), sedikit tidak rata
const FR = [8, 9, 10, 10, 10, 9, 10, 10, 10, 9, 10, 10, 9, 8];
const topZ = (v, x, y) => { for (let z = 24; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skullLayer(z); v.rrect(z, a, b, c, d, 'sSkin', r); }
  for (const y of [-5, 4]) { v.set(5, y, 1, null); v.set(5, y, 2, null); v.set(4, y, 0, null); }   // dagu lancip (muka V)
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 5, 'sSkin'); v.set(7, -1, 4, 'sSkinS');
  // rambut panjang: menutup kepala, poni lurus sampai alis, sisi jatuh menutup telinga sampai rahang
  const zmin = (x, y) => x >= 5 ? FR[Math.max(0, Math.min(13, y + 7))] : x >= 2 ? (Math.abs(y + 0.5) > 5.5 ? 2 : 0) : 0;
  const hair = new Vox();
  for (let z = 1; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'sHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -7, -7, 6, 6, 'sHair', 5); hair.rrect(17, -5, -5, 4, 4, 'sHair', 3);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (let c = 0; c < 14; c++) { const y = c - 7; for (let z = FR[c]; z <= 12; z++) v.set(7, y, z, 'sHair'); v.set(7, y, FR[c], c % 3 ? 'sHair' : 'sHairT'); }   // poni maju menutupi dahi
  // kuncir dua rendah di belakang telinga, ikat ungu, jatuh ke depan bahu
  for (const s of [-1, 1]) {
    const yc = s > 0 ? 7.5 : -8.5;
    for (let z = -14; z <= 3; z++) {
      const r = z >= 1 ? 2.2 : z >= -6 ? 2.6 : z >= -11 ? 2.1 : 1.4, xc = -2.5 + Math.max(0, -z) * 0.12;
      for (let x = Math.floor(xc - r); x <= Math.ceil(xc + r); x++) for (let y = Math.floor(yc - r); y <= Math.ceil(yc + r); y++) {
        const dx = x + 0.5 - xc, dy = y + 0.5 - yc;
        if (dx * dx + dy * dy <= r * r && !v.has(x, y, z)) v.set(x, y, z, z >= 1 ? 'lav' : 'sHair');
      }
    }
    for (let z = -12; z <= -1; z += 3) { const x = v.front(Math.round(yc), z); if (x !== null) v.set(x, Math.round(yc), z, 'sHairT'); }
  }
  for (const y of [-3, 0, 3]) for (let x = -6; x <= 4; x++) { const zz = topZ(v, x, y); if (zz !== null && zz > 12 && (x + y) % 3 === 0) v.set(x, y, zz, 'sHairT'); }
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function guitar(v) {   // tas gitar hitam di punggung: badan lebar di bawah, leher naik melewati bahu kiri
  for (let z = 30; z <= 46; z++) { const w = z <= 41 ? 6 : 4; v.rbox(-10, -w - 1, z, -7, w - 1, z, 'gig', 2); }
  for (let z = 47; z <= 60; z++) v.box(-10, -2, z, -8, 0, z, 'gig');
  for (let z = 32; z <= 44; z += 4) v.pb(-1, z, 'gigS');
  for (const y of [-5, 4]) for (let z = 40; z <= 51; z++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'gig'); }   // tali di bahu
}
function chest(o) {
  const v = new Vox(), J = o.top === 'jeans', B = o.top === 'band', R = o.top === 'sweater', FL = o.top === 'flanel';
  const body = J ? 'denim' : B ? 'bandT' : R ? 'lavS' : FL ? 'lav' : 'white';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0, g = R ? 1 : 0; v.rrect(z, -4 - g, -6 + t + w - g, 4 - t + g, 5 - t - w + g, body, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'sSkin', 1);
  if (R) { for (let y = -2; y <= 1; y++) v.pf(y, 51, 'sSkin'); v.shell(52, -3, -3, 3, 2, 'lavS', 1); return v; }
  if (B) {   // kaus band pudar: logo bulat krem
    ['..PPPP..', '.P.PP.P.', 'P.PPPP.P', '.P.PP.P.', '..PPPP..'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'P') v.pf(c - 4, 46 - r, 'bandP'); }));
    for (let y = -2; y <= 1; y++) v.pf(y, 51, 'sSkin'); v.shell(52, -3, -3, 3, 2, 'bandT', 1);
    if (o.gitar) guitar(v);
    return v;
  }
  if (J || FL) {   // jaket jeans / flanel terbuka; di dalamnya kemeja (jeans) atau kaus putih (flanel)
    const edge = J ? 'denimL' : 'lavS';
    for (let z = 32; z <= 51; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x === null) continue; v.set(x, y, z, null); v.set(x - 1, y, z, 'white'); }
    for (let z = 32; z <= 50; z++) { v.pf(-4, z, edge); v.pf(3, z, edge); }
    if (FL) for (let z = 33; z <= 50; z += 3) for (let y = -6; y <= 5; y++) { if (Math.abs(y + 0.5) > 3.5) v.pf(y, z, 'lavS'); v.pb(y, z, 'lavS'); }   // kotak-kotak
    if (J) { for (let y = -5; y <= 4; y++) v.pb(y, 46, 'denimS'); for (const y of [-5, 4]) v.pf(y, 44, 'denimL'); }
  }
  if (!FL) { for (let z = 33; z <= 48; z++) v.pf(0, z, 'whiteS'); v.pfBox(-1, 50, 0, 50, 'sSkin'); }
  const col = J ? 'denim' : FL ? 'lav' : 'white';
  for (let z = 52; z <= 53; z++) { v.shell(z, -3, -4, 3, 3, col, 2); for (let y = -1; y <= 0; y++) for (let x = 2; x <= 3; x++) if (v.get(x, y, z) === col) v.set(x, y, z, null); }
  if (o.gitar) guitar(v);
  return v;
}
function pelvis(o) {
  if (o.bottom === 'rok') {
    const v = skirtPelvis(o.sk, o.sk + 'S');
    if (o.top === 'jeans') for (let z = 29; z <= 33; z++) { v.shell(z, -6, -8, 5, 7, z === 29 ? 'denimL' : 'denim', 3); for (let y = -3; y <= 2; y++) for (const x of [5, 4]) if (/denim/.test(v.get(x, y, z) || '')) v.set(x, y, z, null); }
    if (o.top === 'flanel') for (let z = 29; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'lav', 3);
    return v;
  }
  const v = new Vox(), c = o.bottom === 'kargo' ? 'cargo' : 'pajama';
  v.rbox(-4, -6, 26, 4, 5, 33, c, 3); v.box(-3, -2, 24, 2, 1, 25, c);
  if (o.top === 'band') for (let z = 30; z <= 33; z++) v.shell(z, -5, -7, 4, 6, 'bandT', 3);
  if (o.top === 'sweater') for (let z = 28; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 28 ? 'lav' : 'lavS', 3);
  return v;
}
function arm(o) {
  const v = new Vox(), c = { jeans: 'denim', band: 'bandT', sweater: 'lavS', flanel: 'lav' }[o.top] || 'white';
  v.rbox(-2, 6, 40, 2, 10, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2);
  if (o.top === 'band') { v.paint(-2, 6, 40, 2, 10, 45, 'sSkin'); v.shell(46, -3, 6, 3, 11, 'bandT', 2); }
  return v;
}
function fore(o, side) {
  const v = new Vox(), c = { jeans: 'denim', sweater: 'lavS', flanel: 'lav' }[o.top];
  v.rbox(-2, 6, 31, 2, 10, 39, c || 'sSkin', 2);
  v.rbox(-2, 6, 27, 3, 10, 30, 'sSkin', 2); v.rrect(26, -1, 7, 2, 9, 'sSkin', 1);
  if (o.top === 'jeans') for (let z = 31; z <= 32; z++) v.shell(z, -3, 6, 3, 11, 'denimL', 2);   // lengan digulung sekali
  if (o.top === 'sweater') v.paint(-2, 6, 27, 3, 10, 31, 'lavS');   // lengan kebesaran menutupi punggung tangan
  if (o.top === 'band') { v.paint(-2, 6, 32, 2, 10, 32, 'rubber'); v.paint(-2, 6, 33, 2, 10, 33, 'rubberB'); v.paint(-2, 6, 34, 2, 10, 34, 'rubberY'); }   // gelang karet
  if (side < 0) v.set(3, 8, 27, 'starP');   // plester bintang di jari
  return v;
}
function thigh(o) {
  if (o.bottom === 'rok') return skirtThigh(o.sk);
  const c = o.bottom === 'kargo' ? 'cargo' : 'pajama', v = new Vox();
  v.rbox(-3, 1, 17, 2, 6, 30, c, 2); v.rrect(31, -2, 2, 1, 5, c, 2);
  if (o.bottom === 'kargo') { v.psBox(1, -2, 20, 1, 25, 'canvas'); v.psBox(1, -1, 21, 0, 24, 'cargo'); }   // saku kargo samping
  if (o.bottom === 'piama') for (let z = 18; z <= 30; z += 3) v.paint(-3, 1, z, 2, 6, z, 'pajamaS');
  return v;
}
function shin(o) {
  if (o.bottom === 'rok') return skirtShin(o.sk, o.sk + 'S');
  const c = o.bottom === 'kargo' ? 'cargo' : 'pajama', v = new Vox();
  v.rbox(-3, 1, 6, 2, 6, 17, c, 2); v.rrect(18, -2, 2, 1, 5, c, 2);
  if (o.bottom === 'piama') for (let z = 7; z <= 16; z += 3) v.paint(-3, 1, z, 2, 6, z, 'pajamaS');
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.bottom === 'piama') { v.rbox(-4, 1, 0, 6, 6, 5, 'sock', 2); v.paint(-4, 1, 4, 6, 6, 4, 'lav'); return v; }   // kaus kaki tebal
  // kets kanvas hitam, sol & ujung karet putih
  v.rbox(-4, 1, 0, 6, 6, 1, 'sole', 2);
  v.rbox(-4, 1, 2, 6, 6, 3, 'canvas', 2); v.rbox(-3, 1, 4, 2, 6, 5, 'canvas', 2);
  v.paint(5, 1, 2, 6, 6, 3, 'sole');
  for (const x of [1, 3]) v.paint(x, 2, 4, x, 5, 4, 'lace');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam + jaket jeans + gitar', top: 'jeans', bottom: 'rok', sk: 'sSkirt', gitar: true },
  band: { name: 'Latihan band: kaus band + kargo', top: 'band', bottom: 'kargo', gitar: true },
  jalan: { name: 'Flanel ungu + rok panjang', top: 'flanel', bottom: 'rok', sk: 'denim' },
  rumah: { name: 'Sweater lavender + piama', top: 'sweater', bottom: 'piama' },
};
export function build(opt = {}) {
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), rok = o.bottom === 'rok';
  const top = { jeans: 'denim', band: 'bandT', sweater: 'lavS', flanel: 'lav' }[o.top] || 'white';
  const leg = rok ? o.sk : o.bottom === 'kargo' ? 'cargo' : 'pajama';
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest],
    ['flapF', rok && skirtPanel(o.sk, o.sk + 'S', 1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', rok && skirtPanel(o.sk, o.sk + 'S', -1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'sSkin', shoulder: top, elbow: o.top === 'band' ? 'sSkin' : top, hip: leg, knee: leg }, SKEL, TAIL);
  if (rok) P.skirt = skirtInfo(P, o.sk, o.sk + 'S');
  return P;
}
