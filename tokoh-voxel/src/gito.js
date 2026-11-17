// Pak Gito: rentenir yang menagih utang warkop tiap Jumat, 50-an. Kemeja safari cokelat empat saku dengan tali bahu dan
// sabuk kain, tas pinggang kulit, gigi emas yang kelihatan tiap nyengir, rokok terselip di telinga kanan, kumis tipis,
// rambut menipis disisir ke belakang (dahi lebar), perut agak buncit. Rangka keluarga Arga (skala 1.3), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 7, ballR: 1.05 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  gtSkin: ['#94603a', '#ae7448', '#c48a60', '#d29c72'], gtSkinS: ['#a87048'], gtKumis: ['#1a1410'], emas: ['#e8b830'],
  gtHair: ['#0e0c0a', '#16120f', '#201a16', '#2c2420'], gtHairT: ['#3e342c'],
  safari: ['#5a3e22', '#6a4a2a', '#7c5832', '#906a40'], safariS: ['#3e2a16'], tasG: ['#2a1a10', '#3a2416', '#4a301e', '#5e3e28'], tasGM: ['#c8a040'],
  celG: ['#22222a', '#2a2a32', '#34343e', '#44444e'], sepatuG: ['#1a120c', '#241812', '#30201a', '#463024'],
  rokok: ['#f4f0e6'], filter: ['#d88a3a'], kalung: ['#b08a2a', '#cca23a', '#e4bc4e', '#f6d872'],
  bungaG: ['#1a5a6a', '#1e6a7c', '#24808e', '#3096a2'], bungaGM: ['#f0e0a0'], bungaGR: ['#e05a4a'], kacamataG: ['#0c0c10', '#16161c', '#222228', '#34343e'],
  kulitG: ['#140e0c', '#1c1410', '#261c16', '#382a20'], kausG: ['#6a1a1a', '#7e2222', '#942c2c', '#a83a3a'],
});

/* ---------- wajah: alis tipis naik sebelah (curiga), mata kecil licik, kumis tipis di kiri-kanan hidung, mulut tepat di
   bawah hidung; senyum "biasa"-nya miring dan memperlihatkan satu gigi emas */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'gtSkinS', k: 'gtKumis', g: 'emas' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, ...brow, F0, ...eyes, F0, F0, '...kkk..kkk...', ...mouth, F0, F0];   // 15 baris, kumis z 5, mulut z 4
const BROW = ['.........BBBB.', '..BBBB........'];
const EYE = ['...KKK...KKK..', '...WKK...KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....mmTgTm....', '.....mmmm.....', F0]),   // nyengir miring, gigi emas
  kedip: F(BROW, [F0, '..sKKK..sKKK..'], ['....mmTgTm....', '.....mmmm.....', F0]),
  marah: F(['..BBB....BBB..', '....BB..BB....'], EYE, ['....mmmmmm....', F0, F0]),
  teriak: F(['..BBB....BBB..', '....BB..BB....'], EYE, ['....mTgTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['...mTTgTTTm...', '....mmmmmm....', F0]),
  ketawa: F(BROW, ['...KK....KK...', '..K..K..K..K..'], ['...mTTgTTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTgTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const topZ = (v, x, y) => { for (let z = 30; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-4, -6, 5, 5, 3] : z === 1 ? [-6, -7, 6, 6, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'gtSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'gtSkin'); v.box(8, -1, 5, 8, 0, 5, 'gtSkin'); v.set(7, -1, 4, 'gtSkinS');   // hidung besar
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'gtSkin'); v.box(-1, y, 6, -1, y, 7, 'gtSkinS'); }
  // rambut tipis disisir ke belakang dengan minyak: dahi lebar (garis rambut mundur), alur sisir kelihatan
  const hair = new Vox();
  for (let z = 6; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'gtHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -6, -6, 5, 5, 'gtHair', 4);
  const zmin = (x, y) => x >= 3 ? 16 : x >= 1 ? 15 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 6;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (const y of [-6, -3, 0, 3, 6]) for (let x = -8; x <= 4; x++) { const z = topZ(v, x, y); if (z !== null && v.get(x, y, z) === 'gtHair') v.set(x, y, z, 'gtHairT'); }
  // rokok terselip di telinga kanan, filter oranye di depan
  for (let x = -3; x <= 3; x++) v.set(x, 8, 10, x >= 2 ? 'filter' : 'rokok');
  if (o.shades) {   // kacamata hitam aviator
    const fx = v.front(-1, 8) + 1;
    for (const y0 of [-6, 0]) for (let y = y0; y <= y0 + 5; y++) for (let z = 7; z <= 10; z++) if (!(z === 7 && (y === y0 || y === y0 + 5))) v.set(fx, y, z, 'kacamataG');
    for (const y of [-8, 7]) for (let x = fx - 1; x >= -1; x--) if (!v.has(x, y, 10)) v.set(x, y, 10, 'kalung');
    v.set(fx, -6, 10, 'kalung'); v.set(fx, 5, 10, 'kalung');
  }
  return v;
}

/* ---------- badan agak buncit (sisi +y; sisi -y = cermin) */
const bodyC = o => ({ safari: 'safari', bunga: 'bungaG', kulit: 'kulitG' }[o.top]);
function pocket(v, y0, y1, z0, z1, c, cS) {   // saku tempel + tutup saku + kancing
  for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z >= z1 - 1 ? cS : c); }
  const yc = Math.round((y0 + y1) / 2); const x = v.front(yc, z1 - 2); if (x !== null) v.set(x, yc, z1 - 2, cS);
  for (let z = z0; z <= z1 - 2; z++) { const x0 = v.front(y0, z); if (x0 !== null) v.set(x0, y0, z, cS); }
}
function chest(o) {
  const v = new Vox(), T = o.top, body = bodyC(o);
  for (let z = 34; z <= 56; z++) {
    const bel = z > 50 ? 0 : Math.round(3.5 * Math.sin((z - 31) / 20 * Math.PI)), t = z === 56 ? 1 : 0;
    v.rrect(z, -6, -9 + t, 4 + bel - t, 8 - t, body, 4);
  }
  v.rbox(-3, -3, 57, 2, 2, 60, 'gtSkin', 2);
  if (T === 'safari') {   // kemeja safari: kerah lebar terbuka, 4 saku bertutup, tali bahu, sabuk kain
    for (let z = 34; z <= 55; z++) v.pf(-1, z, 'safariS');
    for (const z of [52, 48, 44, 40, 36]) v.pf(-1, z, 'tasGM');
    for (let z = 53; z <= 56; z++) for (let y = -2; y <= 1; y++) if (Math.abs(y + 0.5) <= (z - 52) * 0.6) v.pf(y, z, 'gtSkin');   // leher terbuka V
    for (let z = 57; z <= 58; z++) v.shell(z, -5, -6, 3, 5, 'safari', 3);   // kerah
    for (const y of [-3, 2]) for (let z = 55; z <= 57; z++) v.pf(y, z, 'safariS');
    pocket(v, -7, -3, 46, 51, 'safari', 'safariS'); pocket(v, 2, 6, 46, 51, 'safari', 'safariS');
    pocket(v, -7, -3, 36, 41, 'safari', 'safariS'); pocket(v, 2, 6, 36, 41, 'safari', 'safariS');
    for (let y = -9; y <= 8; y++) for (const z of [34, 35]) { const x = v.front(y, z); if (x !== null) v.set(x + (Math.abs(y + 0.5) < 6 ? 1 : 0), y, z, 'safariS'); v.pb(y, z, 'safariS'); }   // sabuk kain
    v.pf(-1, 35, 'tasGM'); v.pf(0, 35, 'tasGM');
    for (let y = -9; y <= 8; y++) v.pb(y, 50, 'safariS');   // sambungan punggung
    return v;
  }
  if (T === 'bunga') {   // kemeja motif bunga tropis hijau toska dibuka dua kancing, kalung emas
    v.each((x, y, z, c) => {
      if (c !== 'bungaG') return;
      const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, su = (u + 40 + (Math.floor((z + 40) / 6) % 2) * 3) % 6, sz = (z + 40) % 6;
      const d = Math.abs(su - 3) + Math.abs(sz - 3);
      if (d === 0) v.set(x, y, z, 'bungaGM'); else if (d === 1) v.set(x, y, z, 'bungaGR'); else if (d === 3 && su === 3) v.set(x, y, z, 'bungaGM');
    });
    for (let z = 34; z <= 55; z++) v.pf(-1, z, 'bungaG');
    for (let z = 50; z <= 56; z++) for (let y = -3; y <= 2; y++) if (Math.abs(y + 0.5) <= (z - 49) * 0.55) v.pf(y, z, 'gtSkin');
    for (let y = -3; y <= 2; y++) { const z = 53 - Math.round(Math.abs(y + 0.5) * -0.6) - 2; const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'kalung'); }
    v.pf(-1, 50, 'kalung'); v.pf(0, 50, 'kalung'); v.pf(-1, 49, 'kalung');
    for (let z = 57; z <= 58; z++) v.shell(z, -5, -6, 3, 5, 'bungaG', 3);
    return v;
  }
  // jaket kulit hitam terbuka, kaus merah di dalam, kalung emas
  for (let z = 34; z <= 56; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x !== null) { v.set(x, y, z, null); v.set(x - 1, y, z, 'kausG'); } }
  for (let z = 34; z <= 55; z++) { v.pf(-4, z, 'zip'); v.pf(3, z, 'kulitG'); }
  for (let z = 57; z <= 59; z++) v.shell(z, -5, -6, 3, 5, 'kulitG', 3);
  for (let y = -2; y <= 1; y++) v.pf(y, 53, 'kalung');
  return v;
}
function pelvis(o) {
  const v = new Vox();
  v.rbox(-6, -8, 28, 5, 7, 33, 'celG', 3); v.box(-4, -2, 26, 3, 1, 27, 'celG');
  const c = bodyC(o);
  for (let z = 30; z <= 33; z++) v.shell(z, -7, -10, 6 + (z - 30), 9, c, 4);   // baju dikeluarkan menutup perut bawah
  if (o.top === 'safari') v.each((x, y, z, k) => { if (k === 'safari' && z === 30) v.set(x, y, z, 'safariS'); });
  // tas pinggang kulit: tali melingkar + kantong di depan kanan, ritsleting emas
  for (let z = 29; z <= 30; z++) v.shell(z, -7, -10, 7, 9, 'tasG', 4);
  v.rbox(7, 1, 25, 10, 8, 30, 'tasG', 2); v.paint(10, 1, 29, 10, 8, 29, 'tasGM'); v.set(10, 7, 28, 'tasGM');
  return v;
}
const sleeveC = o => bodyC(o);
function arm(o) {
  const v = new Vox(), c = sleeveC(o), K = o.top === 'kulit';
  v.rbox(-3, 8, 43, 3, 14, 55, K ? c : 'gtSkin', 3); v.rrect(56, -3, 8, 3, 14, c, 3);
  if (!K) { v.paint(-3, 8, 48, 3, 14, 56, c); v.shell(48, -4, 7, 4, 15, o.top === 'safari' ? 'safariS' : c, 3); }
  if (o.top === 'safari') { for (let x = -3; x <= 3; x++) v.set(x, 14, 56, 'safariS'); v.set(2, 14, 56, 'tasGM'); }   // tali bahu (epolet)
  if (o.top === 'bunga') v.each((x, y, z, k) => { if (k === 'bungaG' && (x * 3 + z * 2 + y) % 7 === 0) v.set(x, y, z, 'bungaGR'); });
  return v;
}
function fore(o, side) {
  const v = new Vox(), K = o.top === 'kulit';
  v.rbox(-3, 8, 31, 3, 14, 42, K ? 'kulitG' : 'gtSkin', 3);
  v.rbox(-3, 8, 27, 4, 14, 30, 'gtSkin', 3); v.rrect(26, -2, 9, 3, 13, 'gtSkin', 2);
  if (side < 0) v.paint(-3, 8, 31, 3, 14, 31, 'kalung');   // jam emas
  if (side > 0) v.box(4, 10, 27, 4, 11, 28, 'kalung');   // cincin emas
  if (side > 0 && o.top === 'safari') {   // buku utang kecil hitam di tangan kanan
    v.rbox(-3, 7, 21, 3, 8, 30, 'kacamataG', 0); v.paint(4, 7, 22, 4, 8, 29, 'rokok'); v.paint(-3, 7, 21, -3, 8, 30, 'filter');
  }
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-5, 2, 18, 4, 8, 31, 'celG', 3); v.rrect(32, -4, 2, 3, 8, 'celG', 3); return v; }
function shin() { const v = new Vox(); v.rbox(-4, 2, 6, 3, 7, 18, 'celG', 3); v.rrect(19, -3, 2, 2, 7, 'celG', 3); return v; }
function foot() {   // sepatu kulit cokelat tua, ujung lancip
  const v = new Vox();
  v.rbox(-4, 1, 0, 8, 8, 0, 'sole', 3); v.rbox(-4, 1, 1, 7, 8, 3, 'sepatuG', 3); v.rbox(-4, 2, 4, 2, 7, 5, 'sepatuG', 2); v.box(8, 3, 1, 8, 6, 2, 'sepatuG');
  return v;
}

export const OUTFITS = {
  safari: { name: 'Menagih: kemeja safari cokelat + tas pinggang kulit + buku utang', top: 'safari' },
  bunga: { name: 'Santai: kemeja bunga tropis + kalung emas + kacamata hitam', top: 'bunga', shades: true },
  kulit: { name: 'Malam: jaket kulit hitam + kaus merah + kalung emas', top: 'kulit' },
};
export function build(opt = {}) {
  // game memanggil 'seragam': Pak Gito memakai safari
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.safari), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'gtSkin', shoulder: sl, elbow: o.top === 'kulit' ? 'kulitG' : 'gtSkin', hip: 'celG', knee: 'celG' }, SKEL, TAIL);
}
