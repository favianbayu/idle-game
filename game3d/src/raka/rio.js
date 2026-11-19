// Rio: tukang pukul geng Bram, kelas 12. Badan besar, potongan undercut (atas cokelat disisir ke belakang, samping
// dicukur tipis), kalung rantai perak, bodoh tapi tidak jahat, mimpi jadi atlet tinju. Rangka keluarga Bram (skala 1.32
// tapi badan lebar), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 15, thigh: 15.5, up: 4, neck: 24, shY: 10.5, shZ: 17, upper: 11, fore: 11.5, hipY: 5, flap: 6, ballR: 1.1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  rioKulit: ['#24160e', '#301e14', '#40281a', '#583824'], rioKulitS: ['#6e4a32'], rioTee: ['#0c0c0e', '#141416', '#1c1c20', '#28282e'],
  rioSkin: ['#ae7c58', '#c89470', '#e0b088', '#ecc29c'], rioSkinS: ['#c48c66'],
  rioHair: ['#4a2a16', '#5a341c', '#6a4024', '#82522e'], rioHairT: ['#9a6a3e'], rioSide: ['#5a4434', '#665040', '#725c4a', '#7e6856'],
  rioTank: ['#e8e4dc', '#f2eee6', '#faf8f2', '#ffffff'], rioShort: ['#8a1a1a', '#a42222', '#bc2c2c', '#d23c3c'], rioShortS: ['#f2d23a'],
  gloveR: ['#8a1010', '#a81818', '#c82424', '#e04040'], gloveRS: ['#f2f2ee'], wrapR: ['#2a2a30'],
  rioHood: ['#1a1a1e', '#222226', '#2c2c32', '#3a3a42'], rioHoodS: ['#c84030'], rioSneak: ['#141418', '#1c1c22', '#26262e', '#363642'],
});

/* ---------- wajah: alis tebal tegak (galak tapi polos), mata kecil bulat, mulut lebar seringai bodoh tepat di bawah hidung */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'rioSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, ...brow, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // 15 baris: alis z 11..10, mata z 9..8, mulut z 4
const BROW = ['.BBBB....BBBB.', F0];
const EYE = ['...KK....KK...', '...KK....KK...'];
export const FACES = {
  biasa: F(BROW, EYE, ['....mmmmmmm...', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['....mmmmmmm...', F0, F0]),
  marah: F(['..BB......BB..', '....BB..BB....'], EYE, ['....mmmmmm....', '...m......m...', F0]),
  teriak: F(['..BB......BB..', '....BB..BB....'], EYE, ['...mTTTTTTm...', '...mttttttm...', '....mmmmmm....']),
  nyengir: F(BROW, EYE, ['..mTTTTTTTTm..', '...mmmmmmmm...', F0]),   // nyengir lebar, polos
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['..mTTTTTTTTm..', '..mtttttttm...', '...mmmmmmm....']),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...'], ['...mmmmmmmm...', '...TTTTTTTT...', F0]),
};
export const EXPRS = Object.keys(FACES);

const topZ = (v, x, y) => { for (let z = 30; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'rioSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'rioSkin'); v.box(8, -1, 5, 8, 0, 5, 'rioSkin'); v.set(7, -1, 4, 'rioSkinS');   // hidung lebar
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'rioSkin'); v.box(-1, y, 6, -1, y, 7, 'rioSkinS'); }
  // samping & belakang dicukur tipis (lapis gelap), atas tebal disisir ke belakang dengan jambul
  const side = new Vox();
  for (let z = 5; z <= 15; z++) side.rrect(z, -8, -8, 7, 7, 'rioSide', z <= 11 ? 4 : 5);
  side.rrect(16, -6, -6, 5, 5, 'rioSide', 4);
  side.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 5)) v.set(x, y, z, c); });
  const top = new Vox();
  for (let z = 14; z <= 17; z++) top.rrect(z, -8, -8, 8, 7, 'rioHair', 5);
  for (let z = 18; z <= 19; z++) top.rrect(z, -6, -6, 7, 5, 'rioHair', 4);
  top.each((x, y, z, c) => { if (Math.abs(y + 0.5) <= 6.5 - (z <= 14 ? 1 : 0) && (!v.has(x, y, z) || v.get(x, y, z) === 'rioSide') && !(z === 14 && x >= 8)) v.set(x, y, z, c); });
  for (const y of [-5, -2, 1, 4]) for (let x = -8; x <= 7; x++) { const z = topZ(v, x, y); if (z !== null && v.get(x, y, z) === 'rioHair' && (x + 40) % 3) v.set(x, y, z, 'rioHairT'); }   // alur sisir
  return v;
}

/* ---------- badan besar (sisi +y; sisi -y = cermin) */
const bodyC = o => ({ seragam: 'white', tinju: 'rioTank', jalan: 'rioHood' }[o.top]);
function chain(v, z0) {   // kalung rantai perak di leher, menggantung di dada
  for (let y = -5; y <= 4; y++) { const z = z0 - Math.round(Math.abs(y + 0.5) < 3 ? 2 - Math.abs(y + 0.5) * 0.4 : 0) + (Math.abs(y + 0.5) > 3 ? 1 : 0); const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, (y + 40) % 2 ? 'chain' : 'watch'); }
}
function chest(o) {
  const v = new Vox(), T = o.top, body = bodyC(o);
  for (let z = 37; z <= 58; z++) { const w = z <= 42 ? 1 : z <= 46 ? 0 : -1, t = z === 58 ? 1 : 0; v.rrect(z, -6, -9 + w + t, 5 - t, 8 - w - t, body, z >= 57 ? 4 : 3); }
  v.rbox(-3, -3, 59, 2, 2, 62, 'rioSkin', 2);
  if (T === 'seragam') {   // seragam dikeluarkan, dua kancing atas terbuka, lengan digulung, rantai kelihatan
    for (let z = 51; z <= 58; z++) for (let y = -3; y <= 2; y++) if (Math.abs(y + 0.5) <= (z - 50) * 0.45) v.pf(y, z, 'rioSkin');
    for (let z = 37; z <= 50; z++) v.pf(-1, z, 'whiteS');
    for (let z = 59; z <= 60; z++) v.shell(z, -5, -6, 3, 5, 'white', 2);
    for (let y = -2; y <= 1; y++) for (const z of [59, 60]) for (const x of [3, 4]) if (v.get(x, y, z) === 'white') v.set(x, y, z, null);
    v.pfBox(3, 51, 5, 53, 'osis'); v.pf(-6, 52, 'tag'); v.pf(-5, 52, 'tag');
    chain(v, 55);
    return v;
  }
  if (T === 'tinju') {   // kaus kutang putih, bahu terbuka, handuk tidak ada
    for (let z = 52; z <= 58; z++) for (let y = -9; y <= 8; y++) if (Math.abs(y + 0.5) > 5.5 || (Math.abs(y + 0.5) < 2.5 && z >= 55)) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'rioSkin'); const xb = v.back(y, z); if (xb !== null && Math.abs(y + 0.5) > 5.5) v.set(xb, y, z, 'rioSkin'); }
    v.each((x, y, z, c) => { if (c === 'rioTank' && z >= 53 && Math.abs(y + 0.5) > 6.5) v.set(x, y, z, 'rioSkin'); });
    chain(v, 55);
    return v;
  }
  // hoodie hitam, garis merah di dada, tali hoodie, tudung di punggung
  for (let y = -9; y <= 8; y++) for (const z of [48, 49]) { v.pf(y, z, 'rioHoodS'); v.pb(y, z, 'rioHoodS'); }
  for (const y of [-2, 1]) for (let z = 50; z <= 55; z++) v.pf(y, z, 'rioTank');
  for (let z = 56; z <= 61; z++) { const k = z - 56; v.rbox(-9 + Math.floor(k / 2), -6 + Math.floor(k / 3), z, -6, 5 - Math.floor(k / 3), z, 'rioHood', 2); }
  for (let z = 59; z <= 60; z++) v.shell(z, -4, -5, 3, 4, 'rioHood', 2);
  return v;
}
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-6, -8, 30, 5, 7, 36, c, 3); v.box(-4, -2, 28, 3, 1, 29, c);
  if (o.top === 'seragam') { for (let z = 32; z <= 36; z++) v.shell(z, -7, -9, 6, 8, z === 32 ? 'whiteS' : 'white', 3); v.pf(-1, 34, 'whiteS'); v.pf(-1, 33, 'whiteS'); }   // baju dikeluarkan
  else if (o.top === 'tinju') { for (let z = 34; z <= 36; z++) v.shell(z, -7, -9, 6, 8, z === 35 ? 'rioShortS' : 'rioShort', 3); }
  else for (let z = 33; z <= 36; z++) v.shell(z, -7, -9, 6, 8, z === 33 ? 'rioHoodS' : 'rioHood', 3);
  return v;
}
const legC = o => o.top === 'tinju' ? 'rioShort' : o.top === 'jalan' ? 'jeans' : 'pants';
const sleeveC = o => bodyC(o);
function arm(o) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-4, 8, 46, 3, 14, 58, o.top === 'jalan' ? c : 'rioSkin', 3); v.rrect(59, -3, 8, 3, 14, o.top === 'tinju' ? 'rioSkin' : c, 3);
  if (o.top === 'seragam') { v.paint(-4, 8, 52, 3, 14, 59, c); v.shell(52, -5, 7, 4, 15, 'whiteS', 3); v.shell(53, -5, 7, 4, 15, c, 3); }   // lengan digulung tebal
  return v;
}
function fore(o, side) {
  const v = new Vox(), T = o.top;
  v.rbox(-3, 8, 35, 3, 14, 46, T === 'jalan' ? 'rioHood' : 'rioSkin', 3);
  v.rbox(-3, 8, 30, 4, 14, 34, 'rioSkin', 3); v.rrect(29, -2, 9, 3, 13, 'rioSkin', 2);
  if (T === 'tinju') {   // sarung tinju merah besar, manset putih, perban hitam di pergelangan
    v.rbox(-4, 7, 26, 6, 15, 33, 'gloveR', 3); v.paint(-4, 7, 32, 6, 15, 33, 'gloveRS'); v.paint(-3, 8, 34, 3, 14, 35, 'wrapR');
    v.set(6, 11, 29, 'gloveRS');
  }
  if (T === 'seragam' && side < 0) v.paint(-3, 8, 35, 3, 14, 35, 'chain');   // gelang rantai
  if (T === 'jalan') v.paint(-3, 8, 35, 3, 14, 36, 'rioHoodS');
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-5, 1, 20, 4, 8, 34, c, 3); v.rrect(35, -4, 2, 3, 7, c, 3); if (o.top === 'tinju') { v.paint(-5, 1, 20, 4, 8, 25, 'rioSkin'); for (let z = 26; z <= 34; z++) v.set(0, 8, z, 'rioShortS'); } return v; }
function shin(o) {
  const c = o.top === 'tinju' ? 'rioSkin' : legC(o), v = new Vox();
  v.rbox(-5, 1, 7, 4, 8, 20, c, 3); v.rrect(21, -4, 2, 3, 7, c, 3);
  if (o.top === 'tinju') v.rbox(-4, 2, 6, 3, 7, 10, 'rioTank', 3);   // kaus kaki
  return v;
}
function foot(o) {   // sneakers hitam besar sol putih (tinju: sepatu tinju merah tinggi)
  const v = new Vox(), c = o.top === 'tinju' ? 'gloveR' : 'rioSneak';
  v.rbox(-5, 1, 0, 8, 8, 1, 'sole', 3); v.rbox(-5, 1, 2, 8, 8, 4, c, 3); v.rbox(-5, 1, 5, 2, 8, 7, c, 3);
  for (const x of [1, 3, 5]) v.paint(x, 3, 4, x, 6, 4, 'lace');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam dikeluarkan, kancing terbuka, lengan digulung + kalung rantai', top: 'seragam' },
  tinju: { name: 'Sasana tinju: kutang putih + celana tinju merah + sarung tinju', top: 'tinju', held: false },   // sarung tinju dipakai, bukan barang
  jalan: { name: 'Nongkrong: hoodie hitam garis merah + jeans + sneakers', top: 'jalan' },
};
OUTFITS.geng = { ...OUTFITS.jalan, name: 'Geng: kaus hitam ketat, jaket kulit imitasi',
  sw: { rioHood: 'rioKulit', rioHoodS: 'rioKulitS', jeans: 'rioTee' },
  fx: { chest: v => { for (let z = 38; z <= 57; z++) for (let y = -2; y <= 1; y++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'rioTee'); } return v; } } };
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
  ], { neck: 'rioSkin', shoulder: o.top === 'tinju' ? 'rioSkin' : sl, elbow: o.top === 'jalan' ? 'rioHood' : 'rioSkin', hip: leg, knee: o.top === 'tinju' ? 'rioSkin' : leg }, SKEL, TAIL);
}
