// Kevin: otak licik geng Bram, ahli fitnah lewat media sosial, kelas 12. Kurus jangkung, rambut hitam belah tengah
// (poni tirai jatuh ke dua sisi dahi), kacamata bulat bingkai tipis, HP selalu di tangan kanan, senyum tipis meremehkan.
// Rangka keluarga Rizal (ramping, skala 1.34), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  kvSkin: ['#c89a78', '#e0b490', '#f0c4a0', '#f8d4b4'], kvSkinS: ['#dcae8a'],
  kvHair: ['#060506', '#0e0b0c', '#181314', '#261e20'], kvHairT: ['#3a3034'], kvPart: ['#020202'],
  kvFrame: ['#8a7a5a'], kvLens: ['#e4eef4'], kvPhone: ['#16161c', '#1e1e26', '#2a2a34', '#3a3a48'], kvScreen: ['#5ab4e8'],
  kvHood: ['#6a6e78', '#7c808a', '#8e929c', '#a2a6b0'], kvHoodS: ['#4e525c'], kvKaus: ['#1e2a4a', '#263458', '#2e4068', '#3c507c'],
  kvShort: ['#3a3a40', '#46464c', '#525258', '#626268'], kvSneak: ['#e8e8ea', '#f2f2f4', '#fafafa', '#ffffff'], kvSneakS: ['#2a2a30'],
});

/* ---------- wajah: alis tipis lurus (satu terangkat), mata sipit setengah tertutup, senyum tipis sebelah tepat di bawah hidung */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'kvSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, ...brow, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11..10, mata z 9..8, mulut z 4
const BROW = ['.........BBB..', '..BBB.........'];
const EYE = ['..KKK....KKK..', '..sWK....KWs..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.m...', '.........m....', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.m...', '.........m....', F0]),
  marah: F(['..BBB....BBB..', F0], ['..KKK....KKK..', '...WK....KW...'], ['....mmmmmm....', F0, F0]),
  teriak: F(['..BBB....BBB..', F0], ['..KKK....KKK..', '..WKK....KKW..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['....mTTTTmm...', '.........m....', F0]),   // licik
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTTm...', '.....mttm.....', F0]),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const topZ = (v, x, y) => { for (let z = 30; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-3, -4, 4, 3, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'kvSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'kvSkin'); v.set(7, -1, 5, 'kvSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'kvSkin'); v.box(-1, y, 6, -1, y, 7, 'kvSkinS'); }
  // rambut belah tengah: kubah bervolume, poni tirai melengkung dari belahan ke pelipis kiri & kanan
  const hair = new Vox();
  for (let z = 5; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'kvHair', z <= 11 ? 4 : 5);
  for (let z = 16; z <= 17; z++) hair.rrect(z, -7, -7, 6, 6, 'kvHair', 4);
  hair.rrect(18, -5, -4, 4, 3, 'kvHair', 3);
  const zmin = (x, y) => x >= 5 ? 14 : x >= -2 ? (Math.abs(y + 0.5) > 6.5 ? 9 : 0) : 5;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (let y = -8; y <= 7; y++) {   // poni tirai: dekat belahan pendek (z 14), makin ke pelipis makin turun (z 12)
    const d = Math.abs(y + 0.5), low = d < 1 ? 15 : d < 3 ? 13 : d < 5.5 ? 12 : 11;
    for (let z = low; z <= 14; z++) { const x = (v.front(y, z) ?? 6) + 1; if (x <= 8 && !(d < 1)) v.set(Math.min(x, 7), y, z, 'kvHair'); }
  }
  for (let x = -6; x <= 4; x++) for (const y of [-1, 0]) { const z = topZ(v, x, y); if (z !== null) v.set(x, y, z, 'kvPart'); }   // garis belahan tengah
  for (const y of [-5, -3, 2, 4]) for (let x = -4; x <= 6; x++) { const z = topZ(v, x, y); if (z !== null && (x + y) % 3 === 0 && v.get(x, y, z) === 'kvHair') v.set(x, y, z, 'kvHairT'); }
  // kacamata bulat bingkai tipis: lingkaran r 2.6 di depan tiap mata, jembatan, gagang ke telinga
  const fx = v.front(-1, 8) + 1;
  for (const cy of [-3.5, 2.5]) for (let y = -8; y <= 7; y++) for (let z = 6; z <= 11; z++) { const d = Math.hypot(y - cy, z - 8.5); if (d > 1.9 && d <= 2.9) v.set(fx, y, z, 'kvFrame'); }
  v.set(fx, -3, 10, 'kvLens'); v.set(fx, 3, 10, 'kvLens');
  for (const y of [-1, 0]) v.set(fx, y, 9, 'kvFrame');
  for (const y of [-8, 7]) for (let x = fx - 1; x >= -1; x--) if (!v.has(x, y, 9)) v.set(x, y, 9, 'kvFrame');
  return v;
}

/* ---------- badan ramping (sisi +y; sisi -y = cermin) */
const bodyC = o => ({ seragam: 'white', jalan: 'kvHood', rumah: 'kvKaus' }[o.top]);
function chest(o) {
  const v = new Vox(), T = o.top, body = bodyC(o);
  for (let z = 34; z <= 55; z++) { const w = z <= 47 ? 0 : -1, t = z === 55 ? 1 : 0; v.rrect(z, -5, -7 + w + t, 4 - t, 6 - w - t, body, z >= 54 ? 4 : 3); }
  v.rbox(-3, -3, 56, 2, 2, 59, 'kvSkin', 2);
  if (T === 'seragam') {   // seragam rapi dimasukkan, kancing atas tertutup, badge, pulpen mahal di saku
    for (let z = 34; z <= 54; z++) v.pf(0, z, 'whiteS');
    for (let z = 56; z <= 57; z++) { v.shell(z, -3, -4, 3, 3, 'white', 2); for (let y = -1; y <= 0; y++) if (v.get(3, y, z) === 'white') v.set(3, y, z, null); }
    v.pfBox(3, 47, 4, 49, 'osis'); v.pfBox(-5, 50, -3, 50, 'tag');
    for (let y = -5; y <= -3; y++) v.pf(y, 49, 'whiteS'); v.pf(-4, 51, 'kvPhone'); v.pf(-4, 52, 'kvPhone');
    return v;
  }
  if (T === 'jalan') {   // hoodie abu kebesaran, kantong kanguru, tali, earphone kabel putih di leher
    for (let y = -4; y <= 3; y++) v.pf(y, 42, 'kvHoodS'); for (let z = 36; z <= 41; z++) { v.pf(-5, z, 'kvHoodS'); v.pf(4, z, 'kvHoodS'); }   // kantong kanguru
    for (const y of [-2, 1]) for (let z = 47; z <= 53; z++) v.pf(y, z, 'white');
    for (let z = 55; z <= 59; z++) { const k = z - 55; v.rbox(-8 + Math.floor(k / 2), -5 + Math.floor(k / 3), z, -5, 4 - Math.floor(k / 3), z, 'kvHood', 2); }
    for (let z = 56; z <= 57; z++) v.shell(z, -4, -5, 3, 4, 'kvHood', 2);
    return v;
  }
  for (let y = -2; y <= 1; y++) v.pf(y, 55, 'kvSkin');
  v.shell(56, -4, -4, 3, 3, 'kvKaus', 2);
  ['X..', 'XX.', 'XXX', 'XX.', 'X..'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'X') v.pf(1 - c, 49 - r, 'white'); }));   // logo tombol play
  return v;
}
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-5, -6, 28, 4, 5, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'seragam') { v.rbox(-5, -6, 32, 4, 5, 33, 'belt', 3); v.pfBox(-1, 32, 0, 33, 'buckle'); }
  else if (o.top === 'jalan') for (let z = 29; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 29 ? 'kvHoodS' : 'kvHood', 3);
  else for (let z = 31; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'kvKaus', 3);
  return v;
}
const legC = o => o.top === 'jalan' ? 'jeans' : o.top === 'rumah' ? 'kvShort' : 'pants';
const sleeveC = o => bodyC(o);
function arm(o) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-2, 7, 43, 2, 11, 54, o.top === 'rumah' ? 'kvSkin' : c, 2); v.rrect(55, -2, 7, 2, 11, c, 2);
  if (o.top === 'rumah') v.rbox(-3, 6, 49, 3, 12, 55, c, 2);
  return v;
}
function fore(o, side) {
  const v = new Vox(), c = sleeveC(o), L = o.top !== 'rumah';
  v.rbox(-2, 7, 31, 2, 11, 42, L ? c : 'kvSkin', 2);
  if (o.top === 'seragam') v.paint(-2, 7, 31, 2, 11, 32, 'whiteS');
  if (o.top === 'jalan') v.paint(-2, 7, 31, 2, 11, 32, 'kvHoodS');
  v.rbox(-2, 7, 27, 3, 11, 30, 'kvSkin', 2); v.rrect(26, -1, 8, 2, 10, 'kvSkin', 1);
  if (side > 0) {   // HP besar di tangan kanan, layar menyala menghadap ke dalam
    v.rbox(1, 8, 22, 4, 10, 30, 'kvPhone', 0); v.paint(1, 8, 23, 3, 8, 29, 'kvScreen');
  } else v.paint(-2, 7, 31, 2, 11, 31, 'watch');   // jam pintar
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-4, 2, 18, 3, 6, 31, c, 3); v.rrect(32, -3, 2, 2, 6, c, 3); return v; }
function shin(o) {
  const c = o.top === 'rumah' ? 'kvSkin' : legC(o), v = new Vox(); v.rbox(-4, 2, 6, 3, 6, 18, c, 3); v.rrect(19, -3, 2, 2, 6, c, 3);
  if (o.top === 'rumah') v.paint(-4, 2, 6, 3, 6, 7, 'white');
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'seragam') { v.rbox(-4, 1, 0, 7, 7, 0, 'belt', 2); v.rbox(-4, 1, 1, 7, 7, 4, 'kvPhone', 2); v.rbox(-3, 2, 5, 2, 6, 6, 'kvPhone', 2); for (const x of [1, 3]) v.paint(x, 2, 4, x, 6, 4, 'lace'); return v; }   // sepatu hitam
  v.rbox(-4, 1, 0, 7, 7, 1, 'sole', 2); v.rbox(-4, 1, 2, 7, 7, 4, 'kvSneak', 2); v.rbox(-3, 1, 5, 2, 7, 6, 'kvSneak', 2);   // sneakers putih bersih
  for (const y of [1, 7]) v.paint(-2, y, 3, 4, y, 3, 'kvSneakS');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam rapi dimasukkan + HP di tangan', top: 'seragam' },
  jalan: { name: 'Hoodie abu kebesaran + jeans + sneakers putih + earphone', top: 'jalan' },
  rumah: { name: 'Kaus biru tua + celana pendek', top: 'rumah' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.seragam), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'kvSkin', shoulder: sl, elbow: o.top === 'rumah' ? 'kvSkin' : sl, hip: leg, knee: o.top === 'rumah' ? 'kvSkin' : leg }, SKEL, TAIL);
}
