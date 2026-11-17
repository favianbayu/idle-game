// Raka v3: bagian badan digambar tangan di kisi 2x lebih rapat dari tokoh lama (1 voxel = 1/64 petak),
// dengan PROPORSI tokoh lama (tinggi ±78 voxel halus = ±39 voxel lama, skala 1.3).
// Koordinat: x maju, y samping (negatif = sisi 'L' pose), z naik. Kepala & ekor rambut digambar di koordinat lokal kepala.
import { Vox, dense } from './vox.js';
import { PIV, TAIL_PIV } from './rig.js';

// 4 tingkat warna per bahan (gelap -> terang), atau 1 warna tetap (detail wajah, logo)
export const RAMPS = {
  skin: ['#a2643f', '#c4855b', '#dba274', '#edba8c'], skinS: ['#c4855b'], skinD: ['#a2643f'],
  hair: ['#120d10', '#1d1518', '#291f23', '#362a2e'], hairT: ['#1d1518', '#291f23', '#3b2e31', '#544441'],
  fade: ['#5a3f33', '#6f5142', '#866553', '#9b7862'], fade2: ['#85593f', '#a37354', '#bc8965', '#cf9b75'],
  white: ['#a9adbd', '#cfd1da', '#eeece6', '#fbfaf5'], whiteS: ['#c3c5d0'],
  tee: ['#17161b', '#22212a', '#302f39', '#454452'], print: ['#f4c531'],
  pants: ['#474b57', '#5d626f', '#767b88', '#9196a4'], pantsC: ['#525663', '#6a6f7c', '#858a97', '#a0a5b2'],
  belt: ['#0e0d12', '#17161b', '#22212a', '#34333d'], buckle: ['#dfe2ea'],
  shoe: ['#7f2422', '#a82f2b', '#d43d34', '#ee6a55'], shoeK: ['#141318', '#1e1d24', '#2b2a32', '#3f3e49'],
  sole: ['#a9a79f', '#d2cfc6', '#f2efe6', '#ffffff'], lace: ['#f6f2e8'],
  band: ['#17161b'], tape: ['#b3a184', '#d6c5a3', '#f0e2c2', '#fbf3dc'], chain: ['#c9cdd6'],
  jk: ['#15141a', '#201f27', '#2d2c35', '#45444f'], jkY: ['#a87b14', '#d19e1c', '#f4c531', '#ffe070'], jkG: ['#6a6c7a'],
  jeans: ['#1f2a44', '#2a3959', '#374a72', '#4b6090'], glove: ['#121116', '#1b1a20', '#27262d', '#3a3943'],
  kaus: ['#9c8530', '#c2a843', '#e3c95e', '#f3e08a'], kausS: ['#b89d3c'],
  shorts: ['#252a35', '#333946', '#444b5a', '#5b6373'], sandal: ['#17437d', '#1f579f', '#2a6ac0', '#4a8ada'],
  helm: ['#15141a', '#22212a', '#34333f', '#55546a'], visor: ['#3f7f98', '#62a8c2', '#8fd0e8', '#c2eaf6'], strap: ['#17161b'],
  eyeW: ['#fdfaf3'], eyeK: ['#1c1519'], brow: ['#2c2023'], mouth: ['#7c3b34'], teeth: ['#fdfaf3'], tongue: ['#d0635d'],
  blade: ['#7d8794', '#9da7b4', '#c4ced8', '#e4ecf2'], hilt: ['#6e4a14', '#8d5f1e', '#b07a26', '#cf9a48'], orb: ['#4fa6c8', '#6fc4e4', '#8fe0ff', '#c4f0ff'],
  stick: ['#5e4524', '#7a5c32', '#9a7440', '#b8925e'], bristle: ['#8f7740', '#b09552', '#d4b36a', '#e8cc8a'], phone: ['#1e2230'], line: ['#e8ecf2'],
  box: ['#7a5c34', '#98744a', '#b8905a', '#d2ac78'], seam: ['#d9c49a'], book: ['#22406e', '#2e5590', '#3a6ab0', '#5a88cc'], page: ['#f4f0e2'],
  plaster: ['#f4e2bf'], plasterS: ['#dcc396'], osis: ['#c7922b'], tag: ['#2a3350'], gold: ['#f0cb52'],
};
const MAT = Object.keys(RAMPS), MI = Object.fromEntries(MAT.map((k, i) => [k, i + 1]));
const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const RAMP_RGB = MAT.map(k => RAMPS[k].map(hex));
const mi = c => { const i = MI[c]; if (!i) throw new Error('bahan tidak dikenal: ' + c); return i; };

/* ---------- Wajah: peta 14 kolom x 15 baris (kolom 0 = kiri layar dilihat dari depan, baris 0 = puncak tengkorak).
   . kulit  B alis  c bekas luka di alis  K mata  W putih mata  m mulut  T gigi  t lidah  P plester  p tepi plester */
const FCH = { B: 'brow', c: 'skin', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', P: 'plaster', p: 'plasterS', s: 'skinS' };
const F0 = '..............';
const face = rows => [F0, F0, F0, ...rows];   // 3 baris teratas selalu tertutup poni
export const FACES = {
  biasa: face([
    '..............',
    '.BBB.......BB.',
    '...BB....B....',
    '..............',
    '..WKK....KKW..',
    '..WKK....KKW..',
    '.pPp..........',
    '.pPp..........',
    '.........m....',
    '.....mmmm.....',
    F0, F0]),
  kedip: face([
    '..............',
    '.BBB.......BB.',
    '...BB....B....',
    '..............',
    '..............',
    '..KKK....KKK..',
    '.pPp..........',
    '.pPp..........',
    '.........m....',
    '.....mmmm.....',
    F0, F0]),
  marah: face([
    '..............',
    '.BB........BB.',
    '..BBB....B.B..',
    '....BB..BB....',
    '..KKK....KKK..',
    '..WKK....KKW..',
    '.pPp..........',
    '.pPp..........',
    '..............',
    '....mmmmmm....',
    '....m....m....', F0]),
  teriak: face([
    '..............',
    '.BB........BB.',
    '..BBB....B.B..',
    '....BB..BB....',
    '..KKK....KKK..',
    '..WKK....KKW..',
    '.pPp..........',
    '.pPp..........',
    '....mTTTTm....',
    '....mttttm....',
    '.....mmmm.....', F0]),
  nyengir: face([
    '...........BB.',
    '.BBB.....B....',
    '...BB.........',
    '..............',
    '..KKK....KKK..',
    '..WKK....KKW..',
    '.pPp..........',
    '.pPp..........',
    '...m......m...',
    '....TTTTTT....',
    '....mmmmmm....', F0]),
  ketawa: face([
    '.BBB.......BB.',
    '...BB....B....',
    '..............',
    '..............',
    '..KK......KK..',
    '.K..K....K..K.',
    '.pPp..........',
    '.pPp..........',
    '...mTTTTTTm...',
    '....mttttm....',
    '.....mmmm.....', F0]),
  sakit: face([
    '...BB....B....',
    '.BB........BB.',
    '..............',
    '.KK........KK.',
    '...KK....KK...',
    '.KK........KK.',
    '.pPp..........',
    '.pPp..........',
    '....mmmmmm....',
    '....TTTTTT....',
    '....mmmmmm....', F0]),
};
export const EXPRS = Object.keys(FACES);

// Kepala: tengkorak 14 x 14 x 15 voxel halus + rambut = ukuran kepala tokoh lama (±9 voxel lama).
// garis bawah poni per kolom wajah (z lokal kepala): helai tak rata, pelipis lebih panjang
const FR = [10, 12, 13, 13, 12, 11, 14, 14, 13, 11, 13, 13, 12, 10];
// tinggi jambul di atas kepala per petak 2x2 (baris = x dari belakang ke depan, kolom = y): acak-acakan, depan lebih tinggi
const TUFT = [
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 2, 1, 2, 2, 1, 2, 1],
  [1, 2, 3, 2, 2, 3, 2, 1],
  [1, 3, 2, 3, 2, 2, 3, 1],
  [1, 2, 4, 2, 3, 4, 2, 1],
  [1, 3, 2, 4, 2, 3, 3, 1],
  [0, 2, 4, 3, 4, 2, 3, 0],
  [0, 1, 2, 4, 3, 4, 1, 0]];
const SIDE = [13, 12, 13, 13, 14, 13, 12, 13, 14];   // garis bawah rambut atas di samping (tak rata)
const skullLayer = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];

function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skullLayer(z); v.rrect(z, a, b, c, d, 'skin', r); }
  // wajah: 1 piksel peta = 1 voxel terdepan di kolom itu
  const map = o.face || FACES[o.expr] || FACES.biasa;
  map.forEach((row, r) => [...row].forEach((ch, c) => { const k = FCH[ch]; if (k) v.pf(c - 7, 14 - r, k); }));
  v.box(7, -1, 4, 7, 0, 5, 'skin');                                   // hidung
  // samping dicukur tipis (fade): rambut rata di atas, makin ke bawah makin terang
  // garis fade miring: tinggi di pelipis, turun ke arah tengkuk
  for (const s of [-1, 1]) for (let x = -7; x <= 4; x++) {
    const zh = 10 + Math.floor((x + 8) / 4);
    if (!o.helm) v.psBox(s, x, zh, x, 14, 'hair');
    v.psBox(s, x, zh - 3, x, zh - 1, 'fade');
    if (x <= 0) v.psBox(s, x, zh - 6, x, zh - 4, 'fade2'); else if (x <= 3) v.psBox(s, x, zh - 5 + (x - 1), x, zh - 4, 'fade2');
  }
  v.pbBox(-5, 1, 4, 6, 'fade2');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'skin'); v.box(-1, y, 6, -1, y, 7, 'skinS'); }   // telinga
  v.set(-1, 7, 4, 'gold');                                            // anting
  if (o.helm) return helmet(v);
  // ---- mullet modern: atas bertekstur & bervolume, poni jatuh tak rata, samping tipis, belakang turun ke tengkuk
  const zmin = (x, y, z) => x >= 5 ? FR[Math.max(0, Math.min(13, y + 7))] : x >= -4 ? SIDE[x + 4] : x >= -6 ? 7 : Math.abs(y + 0.5) <= 3.5 + (z - 3) * 0.5 ? 3 : 99;
  const hair = new Vox();
  for (let z = 3; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'hair', z <= 11 ? 4 : 5);
  new Vox().rrect(0, -8, -8, 7, 7, 'hair', 5).each((x, y) => { const h = TUFT[(x + 8) >> 1][(y + 8) >> 1]; for (let k = 1; k <= h; k++) hair.set(x, y, 15 + k, k === h && h >= 4 ? 'hairT' : 'hair'); });
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y, z)) v.set(x, y, z, c); });
  // jambul poni: beberapa helai lebih maju supaya atas-depan bervolume
  v.fillE(8, -5, 14, 8, -3, 16, 'hair'); v.fillE(8, -1, 14, 8, 1, 17, 'hair'); v.fillE(8, 3, 15, 8, 4, 16, 'hair');
  // ujung helai poni lebih terang
  for (let c = 0; c < 14; c++) { const y = c - 7, x = v.front(y, FR[c]); if (x !== null && v.get(x, y, FR[c]) === 'hair') v.set(x, y, FR[c], 'hairT'); }
  // volume di ubun-ubun belakang + beberapa helai terang
  v.fillE(-9, -4, 8, -9, 3, 14, 'hair');
  for (const [y, z0, z1] of [[-4, 9, 13], [-1, 5, 9], [2, 10, 14], [3, 4, 7]]) for (let z = z0; z <= z1; z++) { const x = v.back(y, z); if (x !== null && v.get(x, y, z) === 'hair') v.set(x, y, z, 'hairT'); }
  return v;
}
function helmet(v) {   // helm half-face hitam, garis kuning, goggle di dahi; wajah tetap terlihat, ekor mullet keluar di belakang
  const h = new Vox();
  for (let z = 6; z <= 19; z++) {
    const k = z <= 15 ? 0 : z === 16 ? 1 : z === 17 ? 2 : z === 18 ? 3 : 5;
    h.rrect(z, -9 + k, -9 + k, 8 - k, 8 - k, 'helm', 5);
  }
  for (let z = 2; z <= 5; z++) h.rrect(z, -9, -9, 2 - (5 - z), 8, 'helm', 5);       // pelindung telinga & tengkuk
  h.each((x, y, z, c) => {
    if (v.has(x, y, z)) return;
    if (x >= 4 && z <= 11) return;                      // bukaan wajah
    v.set(x, y, z, Math.abs(y + 0.5) < 1.5 && z >= 10 ? 'jkY' : c);
  });
  v.fillE(9, -6, 12, 10, 5, 13, 'helm');                // pet
  for (let y = -7; y <= 6; y++) for (let z = 14; z <= 16; z++) { const x = v.front(y, z); if (x !== null && x >= 4) v.set(x, y, z, Math.abs(y + 0.5) < 1.5 ? 'strap' : 'visor'); }   // goggle
  for (const s of [-1, 1]) v.psBox(s, -8, 14, 5, 15, 'strap');
  for (const y of [-8, 7]) { v.set(3, y, 2, 'strap'); v.set(4, y, 1, 'strap'); v.set(5, y, 0, 'strap'); }
  return v;
}
function tail() {   // ekor mullet (koordinat lokal kepala): menempel di tengkuk, turun sampai kerah, ujung helai mengibas keluar
  const v = new Vox();
  for (const [y0, y1, zb] of [[-5, -4, -1], [-3, -2, -4], [-1, 0, -5], [1, 2, -3], [3, 4, -2]]) {
    v.box(-7, y0, Math.max(zb, 0), -5, y1, 3, 'hair');                 // di belakang tengkuk
    if (zb < 0) v.box(-6, y0, zb, -4, y1, -1, 'hair');                 // turun menutupi kerah
    v.box(-7, y0, zb, -7, y1, zb, 'hairT'); v.paint(-6, y0, zb, -6, y1, zb, 'hairT');   // ujung mengibas keluar
  }
  for (const s of [-1, 1]) {                                           // helai di kiri-kanan leher, terlihat dari depan
    const y0 = s < 0 ? -6 : 4;
    v.box(-5, y0, -1, -3, y0 + 1, 1, 'hair'); v.box(-5, y0, -2, -4, y0 + 1, -2, 'hairT');
    v.set(-4, s < 0 ? -7 : 6, -1, 'hair'); v.set(-4, s < 0 ? -7 : 6, -2, 'hairT');
  }
  return v;
}

function chest(o) {
  const v = new Vox(), J = o.kind === 'jaket', K = o.kind === 'kaus';
  const body = K ? 'kaus' : J ? 'jk' : 'white', inner = K ? 'kaus' : 'tee';
  for (let z = 34; z <= 55; z++) { const t = z === 55 ? 1 : 0; v.rrect(z, -5, -7 + t, 5 - t, 6 - t, body, z >= 54 ? 4 : 3); }
  v.rbox(-3, -3, 56, 2, 2, 59, 'skin', 2);                               // leher
  if (K) {
    for (let y = -3; y <= 2; y++) for (let z = 54 - (y === -3 || y === 2 ? 0 : 1); z <= 55; z++) v.pf(y, z, 'skin');   // leher kaus
    for (let z = 56; z <= 56; z++) v.shell(z, -4, -4, 3, 3, 'kausS', 2);
    return v;
  }
  // kemeja dibiarkan terbuka (jaket: ritsleting naik sampai dada): kaus dalam terlihat di tengah, satu voxel lebih dalam dari tepi baju
  const open = z => J ? (z >= 53 ? 3 : z >= 51 ? 2 : z >= 49 ? 1 : 0) : (z >= 52 ? 3 : z >= 48 ? 2 : 1);
  for (let z = 34; z <= 55; z++) {
    const w = open(z); if (!w) continue;
    for (let y = -1 - w; y <= w; y++) { const x = v.front(y, z); if (x === null) continue; v.set(x, y, z, null); v.paint(x - 2, y, z, x - 1, y, z, inner); }
  }
  for (let y = -2; y <= 1; y++) for (let z = 54 - (y === -2 || y === 1 ? 0 : 1); z <= 55; z++) v.pf(y, z, 'skin');   // leher kaus
  if (!J) for (const [y, z] of [[0, 49], [1, 49], [-1, 48], [0, 48], [-2, 47], [-1, 47], [0, 47], [1, 47], [0, 46], [1, 46], [-1, 45], [0, 45], [-2, 44], [-1, 44]]) v.pf(y, z, 'print');   // sablon petir
  // kerah berdiri, terbuka di depan
  const col = J ? 'jkY' : 'white';
  for (let z = 56; z <= 57; z++) { v.shell(z, -4, -5, 3, 4, col, 2); for (let y = -2; y <= 1; y++) for (let x = 2; x <= 3; x++) if (v.get(x, y, z) === col) v.set(x, y, z, null); }
  for (const [a, b] of [[-5, -3], [2, 4]]) v.fillE(4, a, 55, 5, b, 56, col);
  if (J) {
    for (let z = 34; z <= 48; z++) { v.pf(-1, z, 'jkG'); v.pf(0, z, 'jkG'); }                                                          // ritsleting
    for (let z = 45; z <= 46; z++) { for (let y = -7; y <= 6; y++) { if (v.get(v.front(y, z), y, z) === 'jk') v.pf(y, z, 'jkY'); v.pb(y, z, 'jkY'); } for (const s of [-1, 1]) v.psBox(s, -5, z, 5, z, 'jkY'); }   // garis dada
    ['..XXXX..', '.XXXXXX.', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '..SSSS..', '...SS...'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pb(c - 4, 44 - r, ch === 'X' ? 'jkY' : 'jkG'); }));   // emblem bohlam Lampu Kota di punggung
  } else {
    for (let y = 3; y <= 6; y++) v.pf(y, 48, 'whiteS');                                // saku
    v.pfBox(4, 44, 5, 46, 'osis');                                                     // badge OSIS
    v.pfBox(-6, 47, -4, 48, 'tag');                                                    // papan nama
    for (let y = -6; y <= 5; y++) v.pb(y, 51, 'whiteS');                               // jahitan bahu belakang
    for (let z = 38; z <= 50; z++) v.pb(0, z, 'whiteS');                               // lipatan punggung
  }
  return v;
}
function pelvis(o) {
  const v = new Vox(), J = o.kind === 'jaket', K = o.kind === 'kaus';
  const pants = K ? 'shorts' : J ? 'jeans' : 'pants';
  v.rbox(-5, -8, 28, 4, 7, 33, pants, 3); v.box(-4, -2, 26, 3, 1, 27, pants);
  if (K) { v.rbox(-5, -8, 32, 4, 7, 33, 'kaus', 3); v.rbox(-5, -7, 34, 4, 6, 35, 'kaus', 3); for (const s of [-1, 1]) v.psBox(s, -5, 32, 4, 32, 'kausS'); for (let y = -8; y <= 7; y++) { v.pf(y, 32, 'kausS'); v.pb(y, 32, 'kausS'); } return v; }
  v.rbox(-5, -7, 34, 4, 6, 35, 'belt', 3); v.pfBox(-1, 34, 0, 35, 'buckle');
  if (o.waist) {                                               // jaket balap diikat di pinggang, ujung kemeja mengintip di bawahnya
    for (let z = 30; z <= 31; z++) v.shell(z, -6, -9, 5, 8, 'white', 4);
    for (let z = 32; z <= 35; z++) v.shell(z, -6, -9, 5, 8, z === 35 ? 'jkY' : 'jk', 4);
    v.fillE(6, -2, 31, 7, 1, 35, 'jk'); v.paint(7, -2, 33, 7, 1, 33, 'jkY');          // simpul lengan jaket
  } else if (J) {                                              // ujung jaket
    for (let z = 32; z <= 35; z++) v.shell(z, -6, -9, 5, 8, z === 32 ? 'jkY' : 'jk', 4);
    for (let z = 32; z <= 35; z++) for (let y = -1; y <= 0; y++) if (v.get(5, y, z)) v.set(5, y, z, 'jkG');
  } else {                                                     // ujung kemeja dikeluarkan, kaus dalam terlihat di tengah
    v.pfBox(-2, 32, 1, 35, 'tee');
    for (let z = 30; z <= 35; z++) v.shell(z, -6, -9, 5, 8, 'white', 4);
    for (let z = 30; z <= 35; z++) for (let y = -2; y <= 1; y++) v.set(5, y, z, null);
    for (const [x, z] of [[3, 31], [2, 29], [1, 28], [0, 27], [-1, 27], [-2, 28], [-3, 29], [-4, 31]]) v.set(x, -10, z, 'chain');   // rantai dompet
  }
  return v;
}
function flapBack() {   // badan jaket menggantung di belakang
  const v = new Vox();
  v.rbox(-8, -8, 21, -7, 7, 33, 'jk', 2);
  for (const y of [-8, 7]) { v.set(-8, y, 21, null); v.set(-7, y, 21, null); v.set(-8, y, 22, null); }
  v.paint(-8, -8, 21, -7, 7, 22, 'jkY'); v.paint(-8, -1, 23, -8, 0, 33, 'jkY');
  return v;
}
function flapFront() {  // dua ujung lengan jaket menjuntai dari simpul
  const v = new Vox();
  v.box(6, -5, 25, 7, -2, 31, 'jk'); v.box(6, 1, 23, 7, 4, 31, 'jk');
  v.paint(6, -5, 25, 7, -2, 26, 'jkY'); v.paint(6, 1, 23, 7, 4, 24, 'jkY');
  return v;
}
// lengan & kaki digambar untuk sisi +y; sisi lain = cermin
function arm(o) {
  const v = new Vox(), J = o.kind === 'jaket', K = o.kind === 'kaus';
  v.rbox(-3, 6, 41, 2, 11, 54, J ? 'jk' : 'skin', 2); v.rrect(55, -3, 6, 2, 11, J ? 'jk' : 'skin', 3); v.rrect(40, -2, 7, 1, 10, J ? 'jk' : 'skin', 2);
  if (J) { for (let z = 41; z <= 55; z++) { v.set(-1, 11, z, 'jkY'); v.set(0, 11, z, 'jkY'); } }
  else {
    const c = K ? 'kaus' : 'white', z0 = K ? 48 : 47;
    v.paint(-3, 6, z0, 2, 11, 55, c);
    if (K) v.paint(-3, 6, z0, 2, 11, z0, 'kausS');
    else for (let z = 46; z <= 47; z++) v.shell(z, -4, 6, 3, 12, 'white', 3);          // lengan baju digulung
  }
  return v;
}
function fore(o, side) {
  const v = new Vox(), J = o.kind === 'jaket';
  v.rbox(-3, 6, 32, 2, 11, 42, J ? 'jk' : 'skin', 2); v.rrect(43, -2, 7, 1, 10, J ? 'jk' : 'skin', 2);
  v.rbox(-3, 6, 28, 3, 11, 31, J ? 'glove' : 'skin', 2); v.rrect(27, -2, 7, 2, 10, J ? 'glove' : 'skin', 2);   // kepalan
  if (J) { v.paint(-3, 6, 32, 2, 11, 33, 'jkY'); for (let z = 34; z <= 42; z++) { v.set(-1, 11, z, 'jkY'); v.set(0, 11, z, 'jkY'); } v.paint(3, 6, 29, 3, 11, 30, 'jkY'); }
  else if (side > 0) v.paint(-3, 6, 28, 3, 11, 30, 'tape');                            // lakban di buku jari tangan kanan
  else v.paint(-3, 6, 33, 2, 11, 34, 'band');                                          // gelang karet
  return v;
}
function thigh(o) {
  const v = new Vox(), K = o.kind === 'kaus', J = o.kind === 'jaket', c = K ? 'shorts' : J ? 'jeans' : 'pants';
  v.rbox(-4, 1, 18, 3, 7, 32, c, 3); v.rrect(33, -3, 2, 2, 6, c, 2); v.rrect(17, -3, 2, 2, 6, c, 2);
  if (K) { v.paint(-4, 1, 17, 3, 7, 21, 'skin'); for (let z = 22; z <= 23; z++) v.shell(z, -5, 1, 4, 8, 'shorts', 3); }
  return v;
}
function shin(o) {
  const v = new Vox(), K = o.kind === 'kaus', J = o.kind === 'jaket', c = K ? 'skin' : J ? 'jeans' : 'pants';
  if (K) { v.rbox(-3, 2, 5, 2, 6, 18, 'skin', 2); v.rrect(19, -2, 3, 1, 5, 'skin', 2); return v; }
  v.rbox(-4, 1, 7, 3, 7, 18, c, 3); v.rrect(19, -3, 2, 2, 6, c, 2);
  for (let z = 7; z <= 8; z++) v.shell(z, -5, 1, 4, 8, J ? 'jeans' : 'pantsC', 3);     // ujung celana sedikit melebar
  if (J) v.paint(-5, 1, 7, 4, 8, 7, 'jkG');
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.kind === 'kaus') {   // sandal jepit
    v.rbox(-5, 1, 0, 7, 7, 1, 'sandal', 3);
    v.rbox(-4, 2, 2, 6, 6, 3, 'skin', 2); v.rbox(-3, 2, 4, 2, 6, 7, 'skin', 2);
    for (const [x, y] of [[5, 4], [4, 3], [4, 5], [3, 2], [3, 6], [2, 2], [2, 6]]) { v.set(x, y, 4, 'shoeK'); if (x <= 3) v.set(x, y, 3, 'shoeK'); }
    return v;
  }
  // sneakers high-top merah, sol & ujung karet putih, kerah hitam
  v.rbox(-5, 1, 0, 7, 7, 1, 'sole', 3);
  v.rbox(-5, 1, 2, 7, 7, 3, 'shoe', 3); v.rrect(4, -5, 1, 5, 7, 'shoe', 3);
  v.rbox(-5, 1, 5, 2, 7, 6, 'shoe', 3); v.rrect(7, -4, 2, 1, 6, 'shoeK', 2);
  v.paint(6, 1, 2, 7, 7, 2, 'sole'); v.paint(7, 1, 3, 7, 7, 3, 'sole');   // ujung karet
  for (const x of [1, 3, 5]) v.paint(x, 3, 4, x, 5, 6, 'lace');      // tali
  v.paint(2, 3, 5, 2, 5, 6, 'shoeK'); v.paint(4, 3, 4, 4, 5, 4, 'shoeK');
  for (const y of [1, 7]) { v.paint(-2, y, 3, 3, y, 3, 'sole'); v.paint(-1, y, 4, 1, y, 4, 'sole'); }   // strip samping
  v.paint(-5, 3, 2, -5, 5, 6, 'shoeK');                              // tumit
  return v;
}

/* ---------- Motor balap (properti, tetap di kerapatan voxel lama seperti kendaraan lain di game).
   Jok, setang, dan pijakan ditaruh pas dengan pantat, tangan, dan kaki pose rideSport. */
export const BIKE_PAL = { tire: '#222127', rim: '#3d3d48', hub: '#cdd1da', eng: '#4c4e5b', engL: '#70738a', steel: '#c9cdd6', steelS: '#8f93a0', bk: '#d43d34', bkS: '#a82f2b', seat: '#1f1e24', lamp: '#ffe9a0', tl: '#ff6a4a', plate: '#f6f2e8', visor: '#8fd0e8' };
const K = 1.3;
export const BIKE_SEAT = [-4, 16];
export function bikeVox(hand, peg) {   // hand = [x, y, z] setang, peg = [x, y, z] pijakan (satuan voxel lama, relatif motor)
  const v = new Vox(), q = a => Math.round(a * K);
  const B = (x0, y0, z0, x1, y1, z1, c) => v.box(q(x0), y0, q(z0), q(x1 + 1) - 1, y1, q(z1 + 1) - 1, c);
  const P = (x0, y0, z0, x1, y1, z1, c) => v.paint(q(x0), y0, q(z0), q(x1 + 1) - 1, y1, q(z1 + 1) - 1, c);
  const R = 5.6 * K, cz = R - 0.1, wx = [q(-10), q(15)];
  const wheel = (cx, fat) => {
    for (let x = cx - 9; x <= cx + 9; x++) for (let z = 0; z <= 16; z++) {
      const r = Math.hypot(x + 0.5 - cx, z + 0.5 - cz);
      if (r > R) continue;
      if (r > R - 2.6) v.box(x, fat ? -2 : -1, z, x, fat ? 1 : 0, z, 'tire');
      else v.box(x, -1, z, x, 0, z, r < 2 ? 'hub' : (Math.abs(x + 0.5 - cx) < 1 || Math.abs(z + 0.5 - cz) < 1) ? 'hub' : 'rim');
    }
  };
  wheel(wx[0], true); wheel(wx[1], false);
  B(-4, -2, 4, 6, 1, 9, 'eng'); P(-2, -2, 6, 4, -2, 7, 'engL'); P(-2, 1, 6, 4, 1, 7, 'engL'); P(-4, -2, 4, 6, 1, 4, 'seat');
  for (const y of [-3, 2]) B(-10, y, 5, -5, y, 5, 'steelS');
  B(1, -2, 10, 9, 1, 13, 'bk'); B(2, -2, 14, 8, 1, 14, 'bk'); P(2, -1, 14, 8, 0, 14, 'plate'); P(1, -2, 10, 9, 1, 10, 'bkS');
  B(-9, -2, 9, 0, 1, 10, 'bk'); P(-9, -2, 9, 0, 1, 9, 'bkS');
  B(-8, -2, 11, 0, 1, 11, 'seat');
  B(-13, -2, 10, -9, 1, 12, 'bk'); B(-13, -2, 13, -10, 1, 13, 'bk'); P(-12, -2, 11, -10, -2, 12, 'plate'); P(-12, 1, 11, -10, 1, 12, 'plate');
  B(-14, -1, 11, -14, 0, 12, 'tl');
  B(-15, -1, 8, -13, 0, 9, 'seat');
  B(-6, 2, 4, 3, 2, 5, 'steelS'); B(-14, 2, 6, -6, 3, 8, 'steel'); P(-14, 2, 6, -14, 3, 8, 'seat'); P(-13, 2, 6, -7, 3, 6, 'steelS');
  B(11, -3, 11, 15, 2, 15, 'bk'); B(12, -3, 16, 14, 2, 16, 'bk'); P(11, -3, 11, 15, 2, 11, 'bkS');
  B(16, -2, 12, 16, 1, 14, 'lamp'); B(16, -3, 12, 16, -3, 14, 'bk'); B(16, 2, 12, 16, 2, 14, 'bk');
  B(12, -2, 17, 13, 1, 18, 'visor'); B(11, -2, 17, 11, 1, 17, 'visor');
  for (const y of [-3, 2]) P(12, y, 12, 14, y, 14, 'plate');
  for (let x = wx[1] - 9; x <= wx[1] + 9; x++) for (let z = Math.round(cz) + 3; z <= 17; z++) { const r = Math.hypot(x + 0.5 - wx[1], z + 0.5 - cz); if (r > R + 0.2 && r <= R + 1.4) v.box(x, -1, z, x, 0, z, 'bk'); }
  const hx = Math.round(hand[0]), hz = Math.round(hand[2]) - 1, hy = Math.round(Math.abs(hand[1])), px = Math.round(peg[0]), pz = Math.round(peg[2]) - 1, py = Math.round(Math.abs(peg[1]));
  for (let z = Math.round(cz); z <= hz; z++) { const x = Math.round(wx[1] + (hx - wx[1]) * (z - cz) / (hz - cz)); for (const y of [-2, 1]) v.box(x, y, z, x + 1, y, z, 'steel'); }
  v.box(hx, -hy - 2, hz, hx + 1, hy + 1, hz, 'steelS'); v.box(hx, -hy - 2, hz, hx + 1, -hy + 1, hz, 'seat'); v.box(hx, hy - 2, hz, hx + 1, hy + 1, hz, 'seat');
  for (const s of [-1, 1]) v.box(px - 2, s > 0 ? 2 : -py - 1, pz, px + 1, s > 0 ? py : -3, pz, 'steelS');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam bandel + jaket di pinggang', kind: 'seragam', waist: true },
  seragam2: { name: 'Seragam bandel', kind: 'seragam', waist: false },
  balap: { name: 'Jaket balap Lampu Kota', kind: 'jaket', waist: false },
  rumah: { name: 'Kaus rumah', kind: 'kaus', waist: false },
};

/* buildParts({ outfit, expr, helm }) -> { parts: [{ name, g, piv, box }], boxes, ballMat, ramps }
   Urutan parts = prioritas saat dua bagian menempati sel yang sama. */
export function buildParts(opt = {}) {
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', helm: !!opt.helm, face: opt.face };
  const parts = [], J = o.kind === 'jaket', K = o.kind === 'kaus';
  const put = (name, v, piv) => { const g = dense(v, mi); parts.push({ name, g, piv, box: [g.o[0] - piv[0], g.o[1] - piv[1], g.o[2] - piv[2], g.o[0] + g.n[0] - piv[0], g.o[1] + g.n[1] - piv[1], g.o[2] + g.n[2] - piv[2]] }); };
  const A = arm(o), T = thigh(o), Sn = shin(o), F = foot(o);
  put('foreR', fore(o, 1), PIV.foreR); put('foreL', fore(o, -1).mirrorY(), PIV.foreL);   // tangan menang atas kepala (menyisir rambut, menutup wajah)
  put('head', head(o), [0, 0, 0]);
  put('tail', tail(), TAIL_PIV);
  put('armR', A, PIV.armR); put('armL', A.mirrorY(), PIV.armL);
  put('chest', chest(o), PIV.chest);
  if (o.waist) put('flapF', flapFront(), PIV.flapF);
  put('pelvis', pelvis(o), PIV.pelvis);
  if (o.waist) put('flapB', flapBack(), PIV.flapB);
  put('footR', F, PIV.footR); put('footL', F.mirrorY(), PIV.footL);
  put('shinR', Sn, PIV.shinR); put('shinL', Sn.mirrorY(), PIV.shinL);
  put('thighR', T, PIV.thighR); put('thighL', T.mirrorY(), PIV.thighL);
  const pants = K ? 'shorts' : J ? 'jeans' : 'pants';
  const ballMat = { neck: mi('skin'), shoulder: mi(K ? 'kaus' : J ? 'jk' : 'white'), elbow: mi(J ? 'jk' : 'skin'), hip: mi(pants), knee: mi(K ? 'skin' : pants) };
  return { parts, boxes: Object.fromEntries(parts.map(p => [p.name, p.box])), ballMat, ramps: RAMP_RGB, mat: mi };
}
