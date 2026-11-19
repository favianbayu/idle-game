// Ama: nenek Mei, 72 tahun, penjaga Toko Buku Pena, galak tapi lucu (logat Jawa campur Hokkien). Kecil agak bungkuk,
// kulit kuning langsat berkerut, rambut putih disanggul dengan tusuk giok, kacamata tebal bingkai hitam (mata kelihatan
// besar), blus samfu bunga berkancing tali + celana longgar hitam + selop kain, kipas lipat merah, gelang giok.
// Rangka keluarga Nadia (skala 1.2 lama, dibulatkan ke rangka cewek), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  encim: ['#d8d4cc', '#e8e4dc', '#f4f2ec', '#fdfcf8'], encimS: ['#c8b8a8'], encimK: ['#d46a84'],
  amSkin: ['#c8a07a', '#dab48c', '#e8c49e', '#f2d4b0'], amSkinS: ['#d0a682'], amBlush: ['#e0a08c'],
  amHair: ['#b8b6b0', '#cecccc', '#e0dedc', '#f0eeec'], amHairS: ['#a09e98'], giok: ['#3a8a5a', '#46a06a', '#56b47a', '#6ac88e'],
  kacaAm: ['#141418'], kacaAmS: ['#3a3a42'],
  samfu: ['#3a5a8a', '#44689c', '#4e76ae', '#5c86c0'], samfuS: ['#2a4470'], samfuK: ['#f2d0d8'], samfuT: ['#e8c060'],
  celAm: ['#16161a', '#1e1e24', '#28282e', '#34343c'], selopAm: ['#5a1a1a', '#6a2222', '#7c2a2a', '#903636'], selopAmS: ['#2a0e0e'],
  kipasAm: ['#b81e1e', '#cc2a2a', '#de3a3a', '#ec5050'], kipasAmS: ['#e0b040'],
  celAp: ['#e8e4d8', '#f0ece2', '#f6f4ec', '#fcfaf6'], celApS: ['#d8d0c0'], kukusan: ['#b89a5a', '#c8aa68', '#d8bc7a', '#e6cc8c'], kukusanS: ['#8a6a3a'], bakpao: ['#f4ece0', '#f8f2e8', '#fcf8f2', '#ffffff'], bakpaoT: ['#d84a4a'],
  imlek: ['#a81818', '#bc2020', '#d02a2a', '#e03c3c'], imlekS: ['#7a1010'], imlekK: ['#e8c048'],
});

/* ---------- wajah: alis tipis putih, mata besar di balik lensa tebal, kerut di sudut mata & pipi, bibir tipis */
const FCH = { B: 'amHairS', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'amBlush', s: 'amSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, brow, F0, F0, ...eyes, F0, 's...........s.', F0, ...mouth, F0, F0];   // alis z 12, bingkai z 10..7, mata z 9..8, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['..WKW....WKW..', '..WKW....WKW..'];   // mata bulat besar di dalam bingkai
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0, F0]),
  marah: F('...BBB..BBB...', ['..KKK....KKK..', '..WKW....WKW..'], ['....mmmmmm....', '....m....m....', F0]),   // "Mei! Ojo pacaran ning toko!"
  teriak: F('...BBB..BBB...', ['..WKW....WKW..', '..WKW....WKW..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '....mttttm....', 'rr...mmmm...rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 5, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'amSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'amSkin'); v.set(7, -1, 5, 'amSkinS');   // hidung kecil
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'amSkin'); v.box(-1, y, 6, -1, y, 7, 'amSkinS'); v.set(-1, y + (y < 0 ? -1 : 1), 5, 'giok'); }   // anting giok
  // rambut putih disisir licin ke belakang, sanggul bulat tinggi di belakang kepala + tusuk giok menyilang
  const hair = new Vox();
  for (let z = 5; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'amHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -6, -6, 5, 5, 'amHair', 4);
  const zmin = (x, y) => x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 5;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (let x = -14; x <= -6; x++) for (let y = -5; y <= 4; y++) for (let z = 9; z <= 18; z++) { const d = ((x + 10) / 4) ** 2 + ((y + 0.5) / 4.8) ** 2 + ((z - 13.5) / 4.4) ** 2; if (d <= 1 && !v.has(x, y, z)) v.set(x, y, z, 'amHair'); }
  for (let k = -5; k <= 6; k++) v.set(-11, k, 15 - Math.round(k * 0.45), 'giok');
  // kacamata tebal bingkai hitam: kotak membulat 2 voxel tebal di depan mata (z 7..10), hanya bingkai supaya mata kelihatan
  const fx = v.front(-1, 8) + 1;
  for (const y0 of [-6, 1]) for (let y = y0; y <= y0 + 4; y++) for (let z = 7; z <= 10; z++) {
    const edge = y === y0 || y === y0 + 4 || z === 7 || z === 10, corner = (y === y0 || y === y0 + 4) && (z === 7 || z === 10);
    if (edge && !corner) v.set(fx, y, z, z === 10 ? 'kacaAm' : 'kacaAmS');
  }
  for (const y of [-1, 0]) v.set(fx, y, 9, 'kacaAm');
  for (const y of [-7, 6]) for (let x = fx; x >= 0; x--) if (!v.has(x, y, 9)) v.set(x, y, 9, 'kacaAm');
  return v;
}

/* ---------- badan kecil agak bungkuk (sisi +y; sisi -y = cermin) */
const topC = o => ({ toko: 'samfu', dapur: 'samfu', imlek: 'imlek' }[o.top]);
const floral = (v, c, cS, cK) => {   // bunga peoni kecil (titik merah muda + kelopak)
  v.each((x, y, z, k) => {
    if (k !== c) return;
    const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, su = (u + 40 + (Math.floor((z + 40) / 5) % 2) * 2) % 5, sz = (z + 40) % 5;
    if (su === 2 && sz === 2) v.set(x, y, z, cK); else if (Math.abs(su - 2) + Math.abs(sz - 2) === 1 && (u + z) % 2 === 0) v.set(x, y, z, cK);
    else if (su === 0 && sz === 0) v.set(x, y, z, cS);
  });
  return v;
};
const pat = (o, v) => o.top === 'imlek' ? v.each((x, y, z, k) => { if (k === 'imlek' && (x * 3 + y * 5 + z * 7 + 400) % 11 === 0) v.set(x, y, z, 'imlekK'); }) || v : floral(v, 'samfu', 'samfuS', 'samfuK');
function chest(o) {
  const v = new Vox(), c = topC(o);
  for (let z = 32; z <= 50; z++) { const t = z === 50 ? 1 : 0, hump = z >= 45 ? 1 : 0; v.rrect(z, -5 - hump, -7 + t, 4 - t, 6 - t, c, 3); }   // punggung membungkuk sedikit
  v.rbox(-2, -2, 51, 2, 1, 55, 'amSkin', 1);
  pat(o, v);
  // kerah mandarin tegak + kancing tali (frog button) menyamping dari leher ke ketiak kanan, lalu turun
  for (let z = 51; z <= 52; z++) v.shell(z, -3, -4, 3, 3, c === 'imlek' ? 'imlekK' : 'samfuS', 2);
  for (let k = 0; k <= 5; k++) v.pf(-1 + k, 50 - Math.round(k * 0.4), o.top === 'imlek' ? 'imlekK' : 'samfuT');
  for (const z of [46, 42, 38, 34]) { v.pf(4, z, o.top === 'imlek' ? 'imlekK' : 'samfuT'); v.pf(3, z, o.top === 'imlek' ? 'imlekK' : 'samfuT'); }
  if (o.top === 'imlek') for (let z = 33; z <= 48; z++) v.pf(4, z, 'imlekS');
  if (o.top === 'dapur') {   // celemek putih bertepung
    for (let z = 32; z <= 44; z++) for (let y = -5; y <= 4; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, y === -5 || y === 4 ? 'celApS' : 'celAp'); }
    for (let z = 45; z <= 50; z++) for (const y of [-4, 3]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'celApS'); }
  }
  return v;
}
function pelvis(o) {
  const v = new Vox(), c = topC(o);
  v.rbox(-5, -7, 26, 4, 6, 33, 'celAm', 3); v.box(-3, -2, 24, 2, 1, 25, 'celAm');
  for (let z = 25; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 25 ? (c === 'imlek' ? 'imlekK' : 'samfuS') : c, 3);   // blus panjang menutup pinggul, belahan samping
  for (let z = 25; z <= 28; z++) for (const y of [-8, 7]) v.set(0, y, z, 'celAm');
  pat(o, v);
  if (o.top === 'dapur') for (let z = 20; z <= 31; z++) for (let y = -5; y <= 4; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, y === -5 || y === 4 || z === 20 ? 'celApS' : 'celAp'); }
  return v;
}
function arm(o) { const v = new Vox(), c = topC(o); v.rbox(-2, 6, 40, 2, 10, 49, c, 2); v.rrect(50, -2, 6, 2, 10, c, 2); return pat(o, v); }
function fore(o, side) {
  const v = new Vox(), c = topC(o);
  v.rbox(-3, 5, 32, 3, 11, 39, c, 2); v.paint(-3, 5, 32, 3, 11, 32, c === 'imlek' ? 'imlekK' : 'samfuS');   // lengan lebar sampai bawah siku
  pat(o, v);
  v.rbox(-2, 6, 27, 2, 10, 31, 'amSkin', 2); v.rrect(26, -1, 7, 2, 9, 'amSkin', 1);
  if (side < 0) v.shell(29, -3, 5, 3, 11, 'giok', 2);   // gelang giok
  if (side > 0 && o.top === 'toko') {   // kipas lipat kertas merah terbuka, rangka emas
    for (let x = 2; x <= 4; x++) v.set(x, 8, 27, 'kipasAmS');
    for (let r = 2; r <= 9; r++) for (let a = -7; a <= 7; a++) { const t = a / 7 * 1.1, x = 4 + Math.round(r * Math.cos(t)), z = 27 + Math.round(r * Math.sin(t)); v.set(x, 8, z, r === 9 ? 'kipasAmS' : (a + 7) % 2 ? 'kipasAm' : 'imlekS'); }
  }
  if (side > 0 && o.top === 'dapur') {   // kukusan bambu berisi bakpao (titik merah di atasnya), dibawa di depan perut
    v.rbox(1, 3, 22, 9, 13, 25, 'kukusan', 4); v.paint(1, 3, 22, 9, 13, 22, 'kukusanS');
    for (const [x, y] of [[3, 6], [7, 6], [5, 10], [3, 11], [7, 11]]) { v.rbox(x - 1, y - 1, 26, x + 1, y + 1, 27, 'bakpao', 1); v.set(x, y, 28, 'bakpao'); v.set(x, y, 29, 'bakpaoT'); }
  }
  if (side > 0 && o.top === 'imlek') {   // angpao merah-emas
    v.rbox(0, 7, 19, 4, 9, 26, 'imlek', 0); v.paint(4, 7, 21, 4, 9, 24, 'imlekK');
  }
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-4, 0, 17, 3, 7, 30, 'celAm', 3); v.rrect(31, -3, 1, 2, 6, 'celAm', 3); return v; }
function shin() { const v = new Vox(); v.rbox(-4, 0, 7, 3, 7, 17, 'celAm', 3); v.rrect(18, -3, 1, 2, 6, 'celAm', 3); v.shell(7, -5, -1, 4, 8, 'celAm', 3); v.rbox(-2, 2, 5, 2, 5, 6, 'amSkin', 2); return v; }   // celana longgar menggantung
function foot(o) {   // selop kain bordir (Imlek: merah emas)
  const v = new Vox(), c = o.top === 'imlek' ? 'imlek' : 'selopAm';
  v.rbox(-4, 1, 0, 6, 6, 0, 'selopAmS', 2); v.rbox(-4, 1, 1, 6, 6, 3, c, 2); v.rbox(-3, 2, 4, 1, 5, 4, 'amSkin', 2);
  v.set(5, 3, 3, 'kipasAmS'); v.set(5, 4, 3, 'kipasAmS');
  return v;
}

export const OUTFITS = {
  toko: { name: 'Jaga toko: sanggul + kacamata tebal + samfu biru bunga + celana hitam + kipas lipat + gelang giok', top: 'toko' },
  dapur: { name: 'Bikin bakpao: celemek bertepung + kukusan bambu berisi bakpao', top: 'dapur' },
  imlek: { name: 'Imlek: blus merah bersulam emas + selop merah + angpao', top: 'imlek' },
};
OUTFITS.rumah = { ...OUTFITS.toko, propOn: 'santai', name: 'Rumah: sanggul putih, kacamata tebal, kebaya encim bordir, kipas',
  sw: { samfu: 'encim', samfuS: 'encimS', samfuK: 'encimK', samfuT: 'encimK' } };
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  // game memanggil 'seragam': Ama memakai baju jaga toko
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.toko), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = topC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'amSkin', shoulder: sl, elbow: sl, hip: 'celAm', knee: 'celAm' }, SKEL, TAIL);
}
