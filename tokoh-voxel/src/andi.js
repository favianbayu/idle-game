// Andi: siswa X-1 SMA 3, kutu buku penghuni perpustakaan, kurus, pendiam, tiap ada yang ribut cuma bilang "Ssst."
// Kulit kuning langsat, rambut hitam belah pinggir klimis, kacamata bulat tebal berbingkai hitam, gigi kelinci. Seragam:
// kemeja putih dimasukkan rapi sampai kancing atas + dasi abu + badge OSIS + saku penuh pulpen + celana abu + sabuk +
// sepatu hitam + tumpukan buku tebal dipeluk. Rumah: kaus biru tua bergambar planet bercincin + celana pendek + sandal +
// satu buku tebal. Rangka keluarga Rizal (ramping), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  adSkin: ['#c89a70', '#d8aa80', '#e6ba90', '#f2c8a0'], adSkinS: ['#c4946a'], adHair: ['#0e0c0a', '#161310', '#201b17', '#2c2520'], adKilap: ['#4a4038'],
  adFrame: ['#141416'], adKemeja: ['#e0e2e6', '#eceef0', '#f4f6f8', '#fcfdfe'], adKemejaS: ['#c0c4cc'],
  adTie: ['#5a5e68', '#646872', '#6e727c', '#7a7e88'], adAbu: ['#6a6e76', '#767a82', '#82868e', '#8e929a'], adAbuS: ['#585c64'],
  adSabuk: ['#16161a'], adGesper: ['#c8ccd4'], adOsis: ['#d8b048'], adPulpen: ['#1e4aa8'], adPulpenM: ['#c83030'],
  adSepatu: ['#121214', '#1a1a1c', '#242426', '#2e2e30'],
  adBukuA: ['#9a2e2a', '#aa3830', '#ba4236', '#c84e40'], adBukuB: ['#2a5a8a', '#326696', '#3a72a2', '#447eae'], adBukuC: ['#3a7a4a', '#448656', '#4e9262', '#5a9e6e'], adHalaman: ['#efe8d4'],
  adKaus: ['#1e2a4e', '#243258', '#2c3a62', '#34446e'], adPlanet: ['#e09a3a'], adCincin: ['#f0dca0'], adBintang: ['#f4f4e8'],
  adPendek: ['#8a7a5a', '#968664', '#a2926e', '#ae9e7a'], adSandal: ['#3a3a40'],
});

/* wajah: mata kecil di balik kacamata bulat, gigi kelinci saat nyengir/ketawa */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'adSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['...KK....KK...', '...KW....WK...'];
export const FACES = {
  biasa: F(BROW, EYE, ['......mm......', F0, F0]),
  kedip: F(BROW, [F0, '...KK....KK...'], ['......mm......', F0, F0]),
  marah: F('...BB....BB...', EYE, ['.....mmmm.....', F0, F0]),   // "Ssst!"
  teriak: F('..BBB....BBB..', ['...KK....KK...', '...KK....KK...'], ['.....mmmm.....', '.....mTTm.....', '......mm......']),
  nyengir: F(BROW, EYE, ['....mTTTTm....', '......TT......', F0]),   // gigi kelinci
  ketawa: F(BROW, ['..KK......KK..', F0], ['....mTTTTm....', '.....mTTm.....', F0]),
  sakit: F('..BB......BB..', ['..KK......KK..', '....K....K....'], ['....mmmmmm....', F0, F0]),
};
export const EXPRS = Object.keys(FACES);

const S_ = o => o.top === 'seragam';
const skull = z => z <= 0 ? [-3, -4, 4, 3, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const topZ = (v, x, y) => { for (let z = 22; z >= 0; z--) if (v.has(x, y, z)) return z; return null; };
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'adSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'adSkin'); v.set(7, -1, 5, 'adSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'adSkin'); v.box(-1, y, 6, -1, y, 7, 'adSkinS'); }
  // rambut klimis belah pinggir kiri: rata licin, garis belahan, kilap minyak rambut
  const hair = new Vox();
  for (let z = 8; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'adHair', 4);
  hair.rrect(16, -7, -7, 6, 6, 'adHair', 4); hair.rrect(17, -5, -5, 4, 4, 'adHair', 3);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 10 : 8)) v.set(x, y, z, c); });
  for (let x = -5; x <= 5; x++) { const z = topZ(v, x, -4); if (z !== null) v.set(x, -4, z, 'adKilap'); }   // garis belahan (warna kilap, bukan kulit)
  for (let x = -3; x <= 4; x++) { const z = topZ(v, x, 1); if (z !== null && x % 2 === 0) v.set(x, 1, z, 'adKilap'); }
  // kacamata bulat tebal: peta piksel 4 baris di depan wajah, lensa dikosongkan supaya mata terlihat
  const fx = v.front(-1, 8) + 1;
  const G = ['.FFFF....FFFF.', 'F....F..F....F', 'F....FFFF....F', '.FFFF....FFFF.'];
  G.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'F') v.set(fx, c - 7, 10 - r, 'adFrame'); }));
  for (const y of [-8, 7]) for (let x = fx - 1; x >= -1; x--) if (!v.has(x, y, 9)) v.set(x, y, 9, 'adFrame');
  return v;
}

function chest(o) {
  const v = new Vox(), c = S_(o) ? 'adKemeja' : 'adKaus';
  for (let z = 34; z <= 55; z++) { const w = z <= 47 ? 0 : -1, t = z === 55 ? 1 : 0; v.rrect(z, -5, -7 + w + t, 4 - t, 6 - w - t, c, z >= 54 ? 4 : 3); }
  v.rbox(-3, -3, 56, 2, 2, 59, 'adSkin', 2);
  if (S_(o)) {   // kemeja dikancing sampai atas + kerah + dasi abu + badge OSIS + saku penuh pulpen
    for (let z = 34; z <= 54; z++) v.pf(0, z, 'adKemejaS');
    for (let z = 55; z <= 57; z++) v.shell(z, -4, -5, 3, 4, 'adKemeja', 2);
    for (let z = 40; z <= 56; z++) for (let y = -1; y <= 0; y++) v.pf(y, z, 'adTie');
    v.pfBox(-6, 46, -4, 47, 'adOsis');
    v.pfBox(3, 44, 5, 47, 'adKemejaS');
    for (const [y, k] of [[3, 'adPulpen'], [4, 'adPulpenM'], [5, 'adPulpen']]) { const x = v.front(y, 47); if (x !== null) { v.set(x, y, 48, k); v.set(x, y, 49, k); } }
  } else {   // kaus biru tua bergambar planet bercincin + bintang
    for (let y = -2; y <= 1; y++) v.pf(y, 55, 'adSkin'); v.shell(56, -3, -4, 3, 3, 'adKaus', 2);
    for (let y = -3; y <= 2; y++) for (let z = 43; z <= 49; z++) if ((y + 0.5) ** 2 + (z - 46) ** 2 <= 9) v.pf(y, z, 'adPlanet');
    for (let y = -6; y <= 5; y++) { const z = Math.round(46 + (y + 0.5) * 0.25); if (Math.abs(y + 0.5) > 2.5) v.pf(y, z, 'adCincin'); }
    for (const [y, z] of [[-5, 51], [4, 52], [5, 41], [-4, 40]]) v.pf(y, z, 'adBintang');
  }
  return v;
}
function pelvis(o) {
  const v = new Vox(), c = S_(o) ? 'adAbu' : 'adPendek';
  v.rbox(-5, -6, 28, 4, 5, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (S_(o)) { v.rbox(-5, -6, 32, 4, 5, 33, 'adSabuk', 3); v.pfBox(-1, 32, 0, 33, 'adGesper'); }   // celana tinggi, sabuk
  else for (let z = 32; z <= 34; z++) v.shell(z, -6, -8, 5, 7, 'adKaus', 3);
  return v;
}
function arm(o) {
  const v = new Vox(), c = S_(o) ? 'adKemeja' : 'adKaus';
  v.rbox(-2, 7, 43, 2, 11, 54, 'adSkin', 2); v.rrect(55, -2, 7, 2, 11, c, 2);
  v.shell(48, -3, 6, 3, 12, c, 2); v.paint(-2, 7, 48, 2, 11, 55, c);   // lengan pendek longgar
  return v;
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-2, 7, 31, 2, 11, 42, 'adSkin', 2);
  v.rbox(-2, 7, 27, 3, 11, 30, 'adSkin', 2); v.rrect(26, -1, 8, 2, 10, 'adSkin', 1);
  if (side < 0) v.paint(-2, 7, 33, 2, 11, 34, 'adSabuk');   // jam tangan digital
  if (side > 0) {   // tumpukan buku tebal dipeluk di dada (seragam), satu buku di rumah
    const books = S_(o) ? [['adBukuA', 0], ['adBukuB', 1], ['adBukuC', 0]] : [['adBukuB', 0]];
    books.forEach(([k, off], i) => {
      const z0 = 28 + i * 4;
      v.box(1 + off, 2, z0, 7 + off, 11, z0 + 3, k);
      for (let y = 3; y <= 10; y++) v.set(8 + off, y, z0 + 1, 'adHalaman'), v.set(8 + off, y, z0 + 2, 'adHalaman');
    });
  }
  return v;
}
function thigh(o) { const c = S_(o) ? 'adAbu' : 'adPendek', v = new Vox(); v.rbox(-4, 2, 18, 3, 6, 31, c, 3); v.rrect(32, -3, 2, 2, 6, c, 3); if (!S_(o)) { v.paint(-4, 2, 18, 3, 6, 21, 'adSkin'); v.shell(22, -5, 1, 4, 7, c, 3); } return v; }
function shin(o) {
  const v = new Vox(), c = S_(o) ? 'adAbu' : 'adSkin';
  v.rbox(-4, 2, 6, 3, 6, 18, c, 3); v.rrect(19, -3, 2, 2, 6, c, 3);
  if (S_(o)) for (let z = 7; z <= 16; z++) v.pf(4, z, 'adAbuS');
  return v;
}
function foot(o) {
  const v = new Vox();
  if (!S_(o)) { v.rbox(-4, 1, 0, 7, 7, 1, 'adSandal', 2); v.rbox(-3, 2, 2, 6, 6, 3, 'adSkin', 2); v.rbox(-3, 2, 4, 2, 6, 6, 'adSkin', 2); v.paint(2, 2, 3, 3, 6, 3, 'adSandal'); return v; }
  v.rbox(-4, 1, 0, 7, 7, 0, 'adSabuk', 2); v.rbox(-4, 1, 1, 7, 7, 4, 'adSepatu', 2); v.rbox(-3, 2, 5, 2, 6, 6, 'adSepatu', 2);
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam dikancing sampai atas + dasi abu + badge OSIS + saku penuh pulpen + celana abu + tumpukan buku', top: 'seragam' },
  rumah: { name: 'Rumah: kaus biru tua bergambar planet + celana pendek + sandal + satu buku tebal', top: 'rumah' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.seragam), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), s = S_(o), c = s ? 'adKemeja' : 'adKaus', l = s ? 'adAbu' : 'adPendek';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'adSkin', shoulder: c, elbow: 'adSkin', hip: l, knee: s ? l : 'adSkin' }, SKEL, TAIL);
}
