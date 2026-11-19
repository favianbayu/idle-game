// Bimo Prasetyo: sahabat sebangku. Gendut, ceria, anak tukang bakso, rambut keriting tebal, pipi bulat,
// seragam sesak di perut (kancing hampir lepas), HP di saku. Rangka skala 1.3 + perut buncit, voxel halus 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';
import { lapis, handukBahu } from './props.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10, shZ: 17, upper: 10.5, fore: 12.5, hipY: 5, flap: 7, ballR: 1.15 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  bKausR: ['#b8862a', '#d09a34', '#e4ae46', '#f0c466'], bMi: ['#f6e6a0'], bMiK: ['#c8402e'],
  bSkin: ['#94603d', '#b07650', '#c98e66', '#dca57c'], bSkinS: ['#b07650'], blush: ['#d9826e'],
  bHair: ['#0d0a09', '#17120f', '#221a16', '#33281f'], bHairT: ['#1a1411', '#28201a', '#382b22', '#46372b'],
  btn: ['#d8d8d2'], glass: ['#141218', '#1c1a21', '#26232c', '#3a3642'], lensG: ['#cfe3f0'], phoneB: ['#2a2e3a'],
  bTee: ['#b9b6ad', '#dedbd2', '#f6f4ee', '#ffffff'], bowl: ['#d23a3a'], bowlY: ['#f2c94c'],
  apron: ['#1f5a3a', '#2a7049', '#36885a', '#4ea372'], apronS: ['#e8e2c8'],
  bShort: ['#1f3a6e', '#2a4a8a', '#3a5ca6', '#5478c0'], bShoe: ['#0e0d11', '#17161b', '#22212a', '#34333d'],
});

/* ---------- wajah: mata kecil bulat, alis tebal, senyum lebar, pipi merah */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'blush', s: 'bSkinS' };
const F0 = '..............';
const F = (brow, eyes, mid, mouth) => [F0, F0, F0, F0, ...brow, ...eyes, ...mid, ...mouth, F0];
const CHEEK = ['.rr........rr.', '..............'];
export const FACES = {
  biasa: F(['.BBB......BBB.', '..............'], ['..KK......KK..', '..KK......KK..', '..............'], CHEEK, ['....m....m....', '.....mmmm.....', '..............']),
  kedip: F(['.BBB......BBB.', '..............'], ['..............', '..KK......KK..', '..............'], CHEEK, ['....m....m....', '.....mmmm.....', '..............']),
  marah: F(['..BB......BB..', '....B....B....'], ['..KK......KK..', '..KK......KK..', '..............'], CHEEK, ['..............', '.....mmmm.....', '....m....m....']),
  teriak: F(['.BB........BB.', '...BB....BB...'], ['..KK......KK..', '..KK......KK..', '..............'], CHEEK, ['....mmmmmm....', '....mTTTTm....', '....mttttm....']),
  nyengir: F(['.BBB......BBB.', '..............'], ['..KK......KK..', '..KK......KK..', '..............'], CHEEK, ['...m......m...', '....TTTTTT....', '....mmmmmm....']),
  ketawa: F(['.BBB......BBB.', '..............'], ['..............', '.KKKK....KKKK.', '..............'], CHEEK, ['...mTTTTTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...', '.KK........KK.'], CHEEK, ['....mmmmmm....', '....m....m....', '.....mmmm.....']),
};
export const EXPRS = Object.keys(FACES);

// kepala bulat: pipi tembem (rahang selebar pelipis)
const skull = z => z <= 0 ? [-4, -5, 5, 4, 4] : z === 1 ? [-6, -7, 6, 6, 4] : z <= 11 ? [-7, -8, 6, 7, 4] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'bSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'bSkin'); v.box(8, -1, 5, 8, 0, 5, 'bSkin');          // hidung bulat
  for (const y of [-9, 8]) { v.box(-2, y, 5, 0, y, 8, 'bSkin'); v.box(-1, y, 6, -1, y, 7, 'bSkinS'); }
  // kacamata frame hitam tebal, kotak membulat: berdiri 1 voxel di depan wajah, lensa kosong (mata tetap kelihatan)
  const fx = v.front(-1, 7) + 1;
  for (const y0 of [-7, 1]) for (let y = y0; y <= y0 + 5; y++) for (let z = 5; z <= 9; z++) {
    const edgeY = y === y0 || y === y0 + 5, edgeZ = z === 5 || z === 9;
    if ((edgeY && edgeZ) || !(edgeY || edgeZ)) continue;   // sudut dibuang supaya membulat
    v.set(fx, y, z, 'glass');
  }
  for (const y0 of [-7, 1]) v.set(fx, y0 + 4, 8, 'lensG');   // kilau lensa
  v.set(fx, -1, 8, 'glass'); v.set(fx, 0, 8, 'glass');
  for (const y of [-8, 7]) { const sy = y < 0 ? -1 : 1; for (let x = fx; x >= -1; x--) { const yy = v.has(x, y, 8) ? y + sy : y; v.set(x, yy, 8, 'glass'); } }
  // rambut keriting tebal: cangkang mengembang + gumpalan bulat acak
  const hair = new Vox(), rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
  for (let z = 6; z <= 16; z++) hair.rrect(z, -10, -10, 8, 9, 'bHair', 6);
  for (let z = 17; z <= 19; z++) hair.rrect(z, -9 + (z - 17), -9 + (z - 17), 7 - (z - 17), 8 - (z - 17), 'bHair', 5);
  const zmin = (x, y) => x >= 5 ? 12 + (rnd(y, 1, 0) % 2) : x >= -2 ? (Math.abs(y + 0.5) > 7 ? 9 : 0) : 5;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  // gumpalan keriting di permukaan: beberapa voxel menonjol + titik terang
  const add = [];
  v.each((x, y, z, c) => { if (c !== 'bHair') return; const h = rnd(x, y, z) % 11; if (h === 0) add.push([x, y, z]); });
  for (const [x, y, z] of add) for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1]]) if (!v.has(x + dx, y + dy, z + dz) && z + dz >= zmin(x + dx, y + dy)) { v.set(x + dx, y + dy, z + dz, 'bHair'); break; }
  v.each((x, y, z, c) => { if (c === 'bHair' && rnd(x + 3, y, z) % 7 === 0) v.set(x, y, z, 'bHairT'); });
  return v;
}
function tail() { return null; }

function chest(o) {
  const v = new Vox(), K = o.top === 'kaus', A = o.top === 'koki', body = K || A ? 'bTee' : 'white';
  // dada lebar + perut buncit (menonjol ke depan & samping di bawah)
  for (let z = 34; z <= 56; z++) {
    const b = z <= 46 ? Math.round(3 * Math.sin(Math.PI * (z - 33) / 14)) : 0, t = z === 56 ? 1 : 0;
    v.rrect(z, -6, -9 + t - (b > 1 ? 1 : 0), 6 + b - t, 8 - t + (b > 1 ? 1 : 0), body, z >= 55 ? 4 : 4);
  }
  v.rbox(-3, -3, 57, 3, 2, 60, 'bSkin', 2);
  if (K || A) {
    for (let y = -3; y <= 2; y++) for (let z = 55; z <= 56; z++) v.pf(y, z, 'bSkin');
    v.shell(57, -4, -4, 4, 3, 'bTee', 2);
    if (K) ['..YYYY..', '.RRRRRR.', 'RRRRRRRR', '.RRRRRR.', '..RRRR..'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pf(c - 4, 48 - r, ch === 'R' ? 'bowl' : 'bowlY'); }));   // gambar mangkuk bakso
    if (A) {   // celemek hijau Warkop Simpang
      for (let z = 34; z <= 52; z++) for (let y = -6; y <= 5; y++) { const x = v.front(y, z); if (x !== null && x >= 3) v.set(x, y, z, 'apron'); }
      for (const s of [-1, 1]) for (let z = 46; z <= 56; z++) { const y = s > 0 ? 5 : -6; const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'apron'); }
      for (let y = -2; y <= 1; y++) v.pf(y, 47, 'apronS');
      for (let z = 42; z <= 44; z++) for (let y = -9; y <= 8; y++) { const x = v.back(y, z); if (x !== null && z === 43) v.set(x, y, z, 'apron'); }
    }
    return v;
  }
  // kemeja sesak: garis kancing, celah di antara kancing (kaus dalam putih), saku dengan HP, badge
  for (let z = 34; z <= 54; z++) { v.pf(0, z, 'whiteS'); if (z % 4 === 0) v.pf(-1, z, 'btn'); }
  for (const z of [38, 42]) { v.pf(0, z, 'bTee'); v.pf(1, z, 'bTee'); }
  for (let y = 3; y <= 6; y++) v.pf(y, 49, 'whiteS');
  v.pfBox(4, 50, 5, 53, 'phoneB');
  v.pfBox(-6, 50, -4, 50, 'tag'); v.pfBox(-5, 46, -4, 47, 'osis');
  for (let z = 56; z <= 57; z++) v.shell(z, -4, -5, 4, 4, 'white', 2);
  for (let y = -1; y <= 0; y++) for (let z = 55; z <= 57; z++) { const x = v.front(y, z); if (x !== null && z === 57) v.set(x, y, z, null); }
  return v;
}
function pelvis(o) {
  const v = new Vox(), K = o.top === 'kaus' || o.top === 'koki', c = K ? 'bShort' : 'pants';
  v.rbox(-6, -9, 28, 6, 8, 33, c, 4); v.box(-4, -2, 26, 3, 1, 27, c);
  if (K) { for (let z = 32; z <= 33; z++) v.shell(z, -7, -10, 7, 9, 'bTee', 4); if (o.top === 'koki') for (let z = 26; z <= 33; z++) for (let y = -6; y <= 5; y++) { const x = v.front(y, z); if (x !== null) v.set(x + (z >= 32 ? 0 : 1), y, z, 'apron'); } return v; }
  // kemeja dimasukkan, ikat pinggang di bawah perut
  v.rbox(-6, -9, 32, 6, 8, 33, 'belt', 4); v.pfBox(-1, 32, 0, 33, 'buckle');
  return v;
}
function arm(o) {
  const K = o.top === 'kaus' || o.top === 'koki', v = new Vox(), c = K ? 'bTee' : 'white';
  v.rbox(-3, 7, 41, 3, 13, 55, 'bSkin', 3); v.rrect(56, -3, 7, 3, 13, 'bSkin', 3);
  v.paint(-3, 7, 47, 3, 13, 56, c);
  for (let z = 46; z <= 47; z++) v.shell(z, -4, 7, 4, 14, c, 3);
  return v;
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-3, 7, 31, 3, 13, 42, 'bSkin', 3); v.rrect(43, -2, 8, 2, 12, 'bSkin', 2);
  v.rbox(-3, 7, 27, 3, 13, 30, 'bSkin', 3);
  if (side < 0) { v.paint(-3, 7, 32, 3, 13, 33, 'bShoe'); v.pf(10, 32, 'eyeW'); }   // jam digital murah
  return v;
}
function thigh(o) { const K = o.top === 'kaus' || o.top === 'koki', c = K ? 'bShort' : 'pants', v = new Vox(); v.rbox(-5, 1, 18, 4, 9, 31, c, 3); v.rrect(32, -4, 2, 3, 8, c, 3); if (K) { v.paint(-5, 1, 17, 4, 9, 21, 'bSkin'); for (let z = 22; z <= 23; z++) v.shell(z, -6, 1, 5, 10, 'bShort', 3); } return v; }
function shin(o) {
  const K = o.top === 'kaus' || o.top === 'koki', v = new Vox();
  if (K) { v.rbox(-4, 2, 6, 3, 8, 18, 'bSkin', 3); return v; }
  v.rbox(-5, 1, 7, 4, 9, 18, 'pants', 3); v.rrect(19, -4, 2, 3, 8, 'pants', 3);
  for (let z = 7; z <= 8; z++) v.shell(z, -6, 1, 5, 10, 'pantsC', 3);
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'kaus' || o.top === 'koki') { v.rbox(-5, 1, 0, 7, 8, 1, 'sandal', 3); v.rbox(-4, 2, 2, 6, 7, 3, 'bSkin', 3); v.rbox(-3, 2, 4, 2, 7, 6, 'bSkin', 2); for (const [x, y] of [[5, 4], [5, 5], [4, 3], [4, 6]]) v.set(x, y, 4, 'shoeK'); return v; }
  // sepatu sekolah hitam, agak lebar
  v.rbox(-5, 1, 0, 7, 8, 1, 'sole', 3);
  v.rbox(-5, 1, 2, 7, 8, 4, 'bShoe', 3); v.rbox(-5, 1, 5, 2, 8, 6, 'bShoe', 3);
  for (const x of [2, 4]) v.paint(x, 3, 5, x, 6, 5, 'lace');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam (sesak di perut)', top: 'kemeja' },
  kaus: { name: 'Kaus Bakso Pak Pras', top: 'kaus' },
  koki: { name: 'Koki Warkop (celemek)', top: 'koki' },
};
OUTFITS.rumah = { ...OUTFITS.kaus, name: 'Rumah: kaus kebesaran bergambar mi, celana pendek',
  sw: { bTee: 'bKausR', bowl: 'bMiK', bowlY: 'bMi' },
  fx: { pelvis: v => lapis(v, 'bTee', 28, 99) } };
OUTFITS.masak = { ...OUTFITS.koki, name: 'Masak: celemek bakso ayahnya, handuk di bahu',
  fx: { chest: v => handukBahu(v, 'prHanduk', 1) } };
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), K = o.top !== 'kemeja';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'bSkin', shoulder: K ? 'bTee' : 'white', elbow: 'bSkin', hip: K ? 'bShort' : 'pants', knee: K ? 'bSkin' : 'pants' }, SKEL, TAIL);
}
