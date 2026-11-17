// Wulan Sari: NPC romance cewek, siswi SMK Pariwisata dari Desa Sukamekar, pesilat juara provinsi, pemandu kebun teh.
// Kulit sawo matang terbakar matahari, badan kuat lentur, rambut hitam dikepang satu tebal sampai pinggang, mata besar
// teduh, alis lurus, memar kecil di lengan bawah, senyum tenang. Warna kunci hijau teh, cokelat kayu, putih.
// Rangka keluarga Rani (1.26), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace, skullLayer } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-7, 0, 6];

addRamps({
  wuSkin: ['#94603e', '#a8724c', '#c08a62', '#d09c74'], wuSkinS: ['#a87250'], wuLip: ['#a4524a'], memar: ['#7a5a8a'],
  wuHair: ['#0a0808', '#121012', '#1a1718', '#28231f'], wuHairT: ['#38302a'], hijauW: ['#4e7a38', '#5e8c44', '#7aa35a', '#94bc74'],
  blazer: ['#1a2440', '#222e50', '#2c3a62', '#3e4e7c'], blazerS: ['#141c34'], spanW: ['#1a2440', '#222e50', '#2c3a62', '#3e4e7c'], spanWS: ['#141c34'],
  hak: ['#121214', '#1a1a1e', '#26262c', '#36363e'], pangsi: ['#0c0c0e', '#141416', '#1c1c20', '#2a2a30'], pangsiS: ['#34343c'],
  batikW: ['#5a3a20', '#6a4628', '#7a5233', '#94683e'], batikWS: ['#e0c888'],
  hijauK: ['#3e6a2e', '#4c7c38', '#5e8e44', '#78a85c'], hijauKS: ['#2e5022'], caping: ['#a8884a', '#c09c58', '#d6b46c', '#e8cc88'], capingS: ['#8e7038'],
  bootsK: ['#18241a', '#203022', '#2a3c2c', '#3a503c'], celanaW: ['#2a2a2e', '#343438', '#404046', '#54545c'],
  kausW: ['#b8b0a0', '#c8c0b0', '#d8d0c0', '#e8e2d4'], sarungW: ['#5a3a20', '#6a4628', '#7a5233', '#94683e'], sarungWS: ['#d8b870'],
  kotakW: ['#4e7a38', '#5e8c44', '#7aa35a', '#94bc74'], kotakWS: ['#2e4a22'], kanvas: ['#c8c0ac', '#d8d0bc', '#e8e0cc', '#f3f1ea'],
  anyam: ['#8a6234', '#a07442', '#b88a54', '#cca06a'], anyamS: ['#6e4c26'],
});

/* ---------- wajah: alis lurus 1 baris tebal + 1 baris jarak, mata besar teduh (2 baris + bulu mata bawah tipis),
   senyum tenang tipis tepat di bawah hidung (hidung z 5..6, bibir z 4) */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', p: 'wuLip', m: 'mouth', T: 'teeth', t: 'tongue', s: 'wuSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, ...brow, F0, ...eyes, F0, F0, ...mouth, F0, F0];   // 15 baris, mulut z 4
const BROW = ['.BBBB....BBBB.'];
const EYE = ['.KKKK....KKKK.', '.KWKK....KKWK.', '..KK......KK..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....p....p....', '.....pppp.....', F0]),
  kedip: F(BROW, [F0, '.KKKK....KKKK.', F0], ['....p....p....', '.....pppp.....', F0]),
  marah: F(['..BBB....BBB..'], EYE, ['....pppppp....', F0, F0]),
  teriak: F(['..BBB....BBB..'], EYE, ['....pppppp....', '....pTTTTp....', '.....pttp.....']),
  nyengir: F(BROW, EYE, ['...p......p...', '....pTTTTp....', '.....pppp.....']),
  ketawa: F(BROW, [F0, '..KK......KK..', '.K..K....K..K.'], ['...pTTTTTTp...', '....pttttp....', '.....pppp.....']),
  sakit: F(['...BB....BB...'], ['.KK........KK.', '...KK....KK...', F0], ['....pppppp....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
const topZ = (v, x, y) => { for (let z = 26; z >= -40; z--) if (v.has(x, y, z)) return z; return null; };
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skullLayer(z); v.rrect(z, a, b, c, d, 'wuSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'wuSkin'); v.set(7, 0, 5, 'wuSkinS');
  // rambut ditarik rapi ke belakang (belah tengah tipis), telinga kelihatan, kepang satu tebal sampai pinggang
  const hair = new Vox();
  for (let z = 3; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, 'wuHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -8, -8, 6, 7, 'wuHair', 5); hair.rrect(17, -6, -6, 4, 5, 'wuHair', 4);
  const zmin = (x, y) => x >= 5 ? (Math.abs(y + 0.5) > 5.5 ? 9 : 14) : Math.abs(y + 0.5) > 6.5 && x >= -3 ? 9 : 3;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'wuSkin'); v.box(-1, y, 6, -1, y, 7, 'wuSkinS'); }
  for (let x = -2; x <= 7; x++) { const z = topZ(v, x, -1); if (z !== null && z > 12) v.set(x, -1, z, 'wuHairT'); }   // belahan tengah (lebih gelap? lebih terang tipis)
  // kepang: ruas-ruas bergantian kiri-kanan, dari tengkuk menempel punggung sampai pinggang, ikat hijau di ujung
  for (let z = 4; z >= -26; z--) {
    const seg = Math.floor((z + 40) / 3), off = seg % 2 ? 0 : -1, x0 = z > 0 ? -9 : z > -4 ? -8 : -6, w = z <= -22 ? 1 : 2;
    for (let y = -w - 1 + off; y <= w + off; y++) for (let x = x0 - 1; x <= x0 + 1; x++) if (!v.has(x, y, z)) v.set(x, y, z, (z + 40) % 3 === 0 && Math.abs(y - off + 0.5) > w - 0.5 ? 'wuHairT' : 'wuHair');
  }
  for (let y = -2; y <= 1; y++) for (let x = -8; x <= -5; x++) for (const z of [-23, -24]) v.set(x, y, z, 'hijauW');
  for (let z = -25; z >= -28; z--) for (let y = -1; y <= 0; y++) v.set(-6, y, z, 'wuHair');   // ujung kepang
  if (o.ikat) {   // ikat kepala batik melingkar di dahi atas, simpul + ekor di belakang
    for (let z = 13; z <= 14; z++) { const ring = []; v.each((x, y, zz) => { if (zz === z) ring.push([x, y]); }); for (const [x, y] of ring) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!v.has(x + dx, y + dy, z)) v.set(x + dx, y + dy, z, (x + y + z) % 3 ? 'batikW' : 'batikWS'); }
    for (const [y, z] of [[-1, 12], [0, 12], [-2, 11], [1, 11], [-2, 10], [1, 10]]) v.set(v.back(y, 13) - 1, y, z, 'batikW');
  }
  if (o.caping) {   // caping bambu kerucut lebar, anyaman garis melingkar
    for (let k = 0; k <= 8; k++) { const z = 14 + k, r = 13.5 - k * 1.6; for (let x = -15; x <= 15; x++) for (let y = -15; y <= 15; y++) { const d = Math.hypot(x + 1, y + 0.5); if (d <= r && d > r - 2.2) v.set(x, y, z, k % 2 ? 'capingS' : 'caping'); } }
    for (let x = -15; x <= 15; x++) for (let y = -15; y <= 15; y++) { const d = Math.hypot(x + 1, y + 0.5); if (d <= 13.5 && d > 8) v.set(x, y, 14, 'caping'); }
    v.set(-1, 0, 23, 'capingS');
  }
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function chest(o) {
  const T = o.top, v = new Vox();
  const body = { blazer: 'blazer', pangsi: 'pangsi', pemandu: 'hijauK', desa: 'kausW', kota: 'kotakW' }[T];
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -4, -6 + t + w, 4 - t, 5 - t - w, body, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'wuSkin', 1);
  if (T === 'blazer') {   // blazer biru tua terbuka di atas kemeja putih, pin jurusan pariwisata
    for (let z = 32; z <= 51; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x === null) continue; v.set(x, y, z, null); v.set(x - 1, y, z, 'white'); }
    for (let z = 32; z <= 50; z++) { v.pf(-4, z, 'blazerS'); v.pf(3, z, 'blazerS'); v.pf(0, z, 'whiteS'); }
    for (const [y, z] of [[-1, 50], [0, 50]]) v.pf(y, z, 'wuSkin');
    for (let z = 52; z <= 53; z++) v.shell(z, -3, -4, 3, 3, 'white', 2);
    v.pfBox(-6, 45, -5, 46, 'gold');
    for (const y of [-5, 4]) for (let z = 36; z <= 38; z++) v.pf(y, z, 'blazerS');
    return v;
  }
  if (T === 'pangsi') {   // baju pangsi hitam kerah V, tali pengikat di dada
    for (let z = 44; z <= 51; z++) { const h = Math.floor((z - 44) / 2.5); for (let y = -1 - h; y <= h; y++) v.pf(y, z, 'wuSkin'); }
    for (let z = 32; z <= 44; z++) v.pf(0, z, 'pangsiS');
    for (const z of [40, 36]) { v.pf(-1, z, 'pangsiS'); v.pf(1, z, 'pangsiS'); }
    return v;
  }
  if (T === 'pemandu') {   // kemeja hijau seragam kebun teh: kerah, saku dada dengan logo daun teh, kancing
    for (let z = 32; z <= 50; z++) v.pf(0, z, 'hijauKS');
    for (let z = 34; z <= 48; z += 4) v.pf(-1, z, 'white');
    for (let z = 52; z <= 53; z++) v.shell(z, -3, -4, 3, 3, 'hijauK', 2);
    for (const [y, z] of [[-1, 50], [0, 50]]) v.pf(y, z, 'wuSkin');
    for (let z = 43; z <= 46; z++) for (let y = 2; y <= 4; y++) v.pf(y, z, z === 46 ? 'hijauKS' : 'hijauK');
    v.pf(3, 44, 'white'); v.pf(3, 45, 'hijauW');
    return v;
  }
  if (T === 'desa') {   // kaus lengan panjang polos, kerah bulat
    for (let y = -2; y <= 1; y++) v.pf(y, 51, 'wuSkin');
    v.shell(52, -3, -3, 3, 2, 'kausW', 1);
    return v;
  }
  // kota: kemeja kotak hijau + tali tas punggung anyaman + tas di punggung
  v.each((x, y, z, c) => { if (c === 'kotakW' && ((y + 40) % 4 === 0 || z % 4 === 0)) v.set(x, y, z, 'kotakWS'); });
  for (let z = 32; z <= 50; z++) v.pf(0, z, 'kotakW');
  for (const [y, z] of [[-1, 50], [0, 50], [0, 49]]) v.pf(y, z, 'wuSkin');
  for (let z = 52; z <= 53; z++) v.shell(z, -3, -4, 3, 3, 'kotakW', 2);
  for (const y of [-4, 3]) for (let z = 38; z <= 51; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'anyamS'); }
  const xb = v.back(0, 42);
  for (let z = 34; z <= 49; z++) for (let y = -5; y <= 4; y++) for (let x = xb - 4; x <= xb - 1; x++) v.set(x, y, z, (x + y + z) % 2 ? 'anyam' : 'anyamS');
  for (let y = -3; y <= 2; y++) v.set(xb - 5, y, 44, 'anyamS');
  return v;
}
function pelvis(o) {
  if (o.bottom === 'span') {   // rok span: lurus pas badan, tidak mengembang, belahan kecil di belakang
    const v = new Vox(); v.rbox(-4, -6, 26, 4, 5, 33, 'spanW', 3);
    for (let z = 18; z <= 33; z++) v.shell(z, -5, -7, 4, 6, z >= 32 ? 'spanWS' : 'spanW', 3);
    return v;
  }
  if (o.bottom === 'sarung') { const v = batik(skirtPelvis('sarungW', 'sarungWS', 20)); for (let z = 31; z <= 33; z++) v.shell(z, -5, -7, 4, 6, z === 32 ? 'sarungWS' : 'sarungW', 3); v.rbox(1, 3, 29, 5, 7, 33, 'sarungW', 2); return v; }   // ikatan di pinggang kanan
  const c = legC(o), v = new Vox();
  v.rbox(-4, -6, 26, 4, 5, 33, c, 3); v.box(-3, -2, 24, 2, 1, 25, c);
  if (o.top === 'pangsi') {   // sabuk hijau tingkat tinggi, simpul + ujung menjuntai di kiri
    for (let z = 31; z <= 33; z++) v.shell(z, -5, -7, 5, 6, 'hijauW', 3);
    v.rbox(4, -6, 28, 6, -4, 33, 'hijauW', 1); for (let z = 22; z <= 28; z++) { v.set(5, -6, z, 'hijauW'); v.set(5, -4, z, 'hijauW'); }
  } else if (o.top === 'pemandu') { v.rbox(-4, -6, 32, 4, 5, 33, 'belt', 3); v.pfBox(-1, 32, 0, 33, 'buckle'); for (let z = 30; z <= 31; z++) v.shell(z, -5, -7, 5, 6, 'hijauK', 3); }
  else if (o.top === 'kota') { v.rbox(-4, -6, 32, 4, 5, 33, 'belt', 3); for (let z = 29; z <= 31; z++) v.shell(z, -5, -7, 5, 6, z === 29 ? 'kotakWS' : 'kotakW', 3); }
  return v;
}
const batik = v => { v.each((x, y, z, c) => { if (c === 'sarungW' && ((x * 3 + y * 5 + z * 7) % 11 === 0 || ((y + 40) % 6 === 0 && z % 3 === 0))) v.set(x, y, z, 'sarungWS'); }); return v; };   // motif batik titik & garis
const legC = o => ({ pangsi: 'pangsi', pemandu: 'celanaW', kota: 'jeans', desa: 'sarungW' }[o.top] || 'wuSkin');
const sleeveC = o => ({ blazer: 'blazer', pangsi: 'pangsi', pemandu: 'hijauK', desa: 'kausW', kota: 'kotakW' }[o.top]);
function arm(o) {
  const v = new Vox(), c = sleeveC(o), wide = o.top === 'pangsi' ? 1 : 0;
  v.rbox(-2 - wide, 6 - wide, 40, 2 + wide, 10 + wide, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2);
  if (o.top === 'kota') v.each((x, y, z, cc) => { if (cc === 'kotakW' && ((x + 40) % 4 === 0 || z % 4 === 0)) v.set(x, y, z, 'kotakWS'); });
  if (o.top === 'pemandu') { v.paint(-2, 6, 40, 2, 10, 44, 'wuSkin'); v.shell(45, -3, 6, 3, 11, 'hijauK', 2); }   // lengan digulung
  return v;
}
function fore(o, side) {
  const v = new Vox(), c = sleeveC(o), skin = o.top === 'pemandu', wide = o.top === 'pangsi' ? 1 : 0;
  v.rbox(-2 - wide, 6 - wide, 31, 2 + wide, 10 + wide, 39, skin ? 'wuSkin' : c, 2);
  if (o.top === 'kota') v.each((x, y, z, cc) => { if (cc === 'kotakW' && ((x + 40) % 4 === 0 || z % 4 === 0)) v.set(x, y, z, 'kotakWS'); });
  if (o.top === 'blazer') v.paint(-2, 6, 31, 2, 10, 31, 'white');
  v.rbox(-2, 6, 27, 3, 10, 30, 'wuSkin', 2); v.rrect(26, -1, 7, 2, 9, 'wuSkin', 1);
  if (side < 0) { if (skin) { v.set(-2, 8, 35, 'memar'); v.set(-2, 9, 35, 'memar'); v.set(-2, 8, 34, 'memar'); } else { v.set(3, 8, 28, 'memar'); } }   // memar bekas latihan
  return v;
}
function thigh(o) {
  if (o.bottom === 'sarung') return batik(skirtThigh('sarungW'));
  const c = legC(o), v = new Vox(), W = o.top === 'pangsi';
  if (W) v.rbox(-4, 0, 17, 3, 7, 30, c, 3); else v.rbox(-3, 1, 17, 2, 6, 30, c, 2);
  v.rrect(31, -2, 2, 1, 5, c, 2);
  return v;
}
function shin(o) {
  if (o.bottom === 'sarung') return batik(skirtShin('sarungW', 'sarungWS'));
  const c = legC(o), v = new Vox();
  if (o.top === 'pangsi') { v.rbox(-4, 0, 9, 3, 7, 17, c, 3); v.rbox(-3, 1, 6, 2, 6, 8, 'pangsi', 2); v.paint(-3, 1, 6, 2, 6, 6, 'pangsiS'); return v; }   // pangsi lebar, ujung diikat
  v.rbox(-3, 1, 6, 2, 6, 17, c, 2); v.rrect(18, -2, 2, 1, 5, c, 2);
  if (o.top === 'pemandu') v.rbox(-4, 0, 6, 3, 7, 13, 'bootsK', 3);   // boots karet sampai betis
  return v;
}
function foot(o) {
  const v = new Vox(), T = o.top;
  if (T === 'pangsi') { v.rbox(-3, 1, 0, 6, 6, 2, 'wuSkin', 2); v.rbox(-3, 2, 3, 2, 5, 5, 'wuSkin', 2); return v; }   // bertelanjang kaki
  if (T === 'pemandu') { v.rbox(-4, 0, 0, 6, 7, 0, 'bootsK', 3); v.rbox(-4, 0, 1, 6, 7, 3, 'bootsK', 3); v.rbox(-4, 0, 4, 2, 7, 5, 'bootsK', 3); return v; }
  if (T === 'blazer') { v.rbox(-4, 1, 1, 6, 6, 3, 'hak', 2); v.rbox(-3, 2, 4, 1, 5, 4, 'hak', 2); v.box(-4, 3, 0, -3, 4, 0, 'hak'); return v; }   // sepatu hak rendah
  if (T === 'desa') { v.rbox(-4, 1, 0, 6, 6, 0, 'batikW', 2); v.rbox(-3, 2, 1, 5, 5, 2, 'wuSkin', 2); v.rbox(-3, 2, 3, 2, 5, 5, 'wuSkin', 2); v.paint(2, 1, 1, 2, 6, 2, 'batikW'); return v; }   // sandal
  v.rbox(-4, 1, 0, 6, 6, 1, 'white', 2); v.rbox(-4, 1, 2, 6, 6, 3, 'kanvas', 2); v.rbox(-3, 1, 4, 2, 6, 5, 'kanvas', 2); for (const x of [1, 3]) v.paint(x, 2, 4, x, 5, 4, 'lace');   // sepatu kanvas
  return v;
}

function spanPanel(s) {   // panel rok span: lebar tetap, keliman di lutut, belahan belakang
  const v = new Vox();
  for (let z = 13; z <= 31; z++) s > 0 ? v.box(3, -6, z, 5, 5, z, 'spanW') : v.box(-6, -6, z, -4, 5, z, 'spanW');
  if (s < 0) for (let z = 13; z <= 16; z++) for (const y of [-1, 0]) v.set(-6, y, z, null);
  for (const z of [13]) for (let y = -6; y <= 5; y++) { const x = s > 0 ? v.front(y, z) : v.back(y, z); if (x !== null) v.set(x, y, z, 'spanWS'); }
  return v;
}

export const OUTFITS = {
  seragam: { name: 'SMK Pariwisata: blazer biru tua + kemeja putih + rok span + sepatu hak rendah', top: 'blazer', bottom: 'span' },
  silat: { name: 'Silat: baju pangsi hitam + sabuk hijau + ikat kepala batik', top: 'pangsi', ikat: true },
  pemandu: { name: 'Pemandu kebun teh: kemeja hijau + caping + boots karet', top: 'pemandu', caping: true },
  desa: { name: 'Di desa: kaus lengan panjang + sarung batik', top: 'desa', bottom: 'sarung' },
  kota: { name: 'Ke kota: kemeja kotak hijau + jeans + sepatu kanvas + tas anyaman', top: 'kota' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.seragam), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o);
  const sk = o.bottom === 'span' ? ['spanW', 'spanWS', 13] : o.bottom === 'sarung' ? ['sarungW', 'sarungWS', 5] : null;
  const panel = s => sk && (o.bottom === 'sarung' ? batik(skirtPanel(sk[0], sk[1], s, sk[2])) : spanPanel(s));
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'wuSkin', shoulder: sl, elbow: o.top === 'pemandu' ? 'wuSkin' : sl, hip: sk ? sk[0] : leg, knee: o.bottom === 'span' ? 'wuSkin' : leg }, SKEL, TAIL);
  if (sk) P.skirt = skirtInfo(P, sk[0], sk[1], o.bottom === 'sarung');
  return P;
}
