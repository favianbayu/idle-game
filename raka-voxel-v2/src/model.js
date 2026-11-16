// Raka: model voxel digambar tangan, per bagian badan. Koordinat: x maju, y samping (negatif = sisi 'L' pose), z naik.
// Tinggi total ±39 voxel (1 voxel = 1/32 petak -> ±1.2 petak), sama dengan tokoh game skala 1.3.
import { Vox, meshVox } from './vox.js';
import { PIV } from './rig.js';

export const PAL = {
  skin: '#dba274', skinL: '#e9b487', skinS: '#c2855a', skinD: '#a36a45',
  hair: '#2a2124', hairL: '#4a3a3a', hairD: '#1a1416', fade: '#7d5c4b', fadeL: '#a87a5c',
  white: '#f6f3ec', whiteS: '#dadbe0', whiteD: '#b9bccb',
  tee: '#2c2b33', teeL: '#42414d', print: '#f4c531',
  pants: '#767b88', pantsS: '#5f6471', pantsL: '#8d92a0',
  belt: '#1f1e24', buckle: '#dfe2ea',
  shoe: '#d43d34', shoeS: '#a82f2b', sole: '#f6f2e8', shoeK: '#26252c',
  band: '#1f1e24', chain: '#c9cdd6',
  jk: '#2b2a32', jkL: '#414050', jkY: '#f4c531', jkYs: '#d3a11e',
  jeans: '#35476b', jeansS: '#293855', jeansL: '#46598a',
  glove: '#222127', eyeW: '#fdfaf3', eyeK: '#1c1519', brow: '#35272a', mouth: '#7c3b34', teeth: '#fdfaf3', tongue: '#d0635d',
  plaster: '#f4e2bf', plasterS: '#dcc396', osis: '#c7922b', tag: '#2a3350', gold: '#f0cb52',
  tire: '#222127', rim: '#3d3d48', hub: '#cdd1da', eng: '#4c4e5b', engL: '#70738a', steel: '#c9cdd6', steelS: '#8f93a0', bk: '#d43d34', bkS: '#a82f2b', seat: '#1f1e24', lamp: '#ffe9a0', tl: '#ff6a4a', plate: '#f6f2e8',
  helm: '#2b2a32', helmL: '#454455', visor: '#8fd0e8', strap: '#1f1e24',
  kaus: '#e3c95e', kausS: '#c4aa45', shorts: '#3f4654', shortsS: '#333946', sandal: '#2a6ac0', sandalS: '#1f4f92',
};

/* ---------- Wajah: peta 10 x 10 (kolom 0 = kiri layar saat dilihat dari depan, baris 0 = atas tengkorak)
   . kulit  s bayangan  B alis  K mata gelap  W putih mata  m mulut  T gigi  t lidah  P plester  p tepi plester
   n bawah hidung  c bekas luka (alis terbelah)  L kulit terang */
const FCH = { s: 'skinS', d: 'skinD', B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', P: 'plaster', p: 'plasterS', n: 'skinS', c: 'skinL', L: 'skinL' };
export const FACES = {
  biasa:   ['..........', '..........', '..........', '.BBB..BcB.', '..KK..KK..', '..WK..KW..', '.PP.......', '....mmm...', '..........', '..........'],
  kedip:   ['..........', '..........', '..........', '.BBB..BcB.', '..........', '..KK..KK..', '.PP.......', '....mmm...', '..........', '..........'],
  marah:   ['..........', '..........', '..........', '.BB....cB.', '..BK..KB..', '..WK..KW..', '.PP.......', '...mmmm...', '..........', '..........'],
  teriak:  ['..........', '..........', '..........', '.BB....cB.', '..BK..KB..', '..WK..KW..', '.PP.......', '...mTTm...', '...mttm...', '..........'],
  nyengir: ['..........', '..........', '......BcB.', '.BBB......', '..KK..KK..', '..WK..KW..', '.PP.......', '...TTTTm..', '..........', '..........'],
  ketawa:  ['..........', '..........', '.BBB..BcB.', '..........', '..........', '.KKK..KKK.', '.PP.......', '...mTTm...', '...mttm...', '..........'],
  sakit:   ['..........', '..........', '...B..B...', '.BB....cB.', '..........', '.KKK..KKK.', '.PP.......', '...mTTm...', '..........', '..........'],
};
export const EXPRS = Object.keys(FACES);

function head(o) {
  const v = new Vox();
  // tengkorak: kotak 9 x 10 x 10, dagu sedikit menyempit, sudut belakang dipotong
  v.box(-4, -5, 1, 4, 4, 9, 'skin');
  v.box(-3, -4, 0, 4, 3, 0, 'skin');
  for (let z = 1; z <= 9; z++) { v.set(-4, -5, z, null); v.set(-4, 4, z, null); }
  // wajah
  const map = o.face || FACES[o.expr] || FACES.biasa;
  map.forEach((row, r) => [...row].forEach((ch, c) => { const k = FCH[ch]; if (k && v.has(4, c - 5, 9 - r)) v.set(4, c - 5, 9 - r, k); }));
  // hidung: tonjolan kecil
  v.box(5, -1, 3, 5, 0, 3, 'skin');
  // telinga + anting
  for (const y of [-6, 5]) { v.box(-1, y, 3, 0, y, 5, 'skinS'); v.set(-1, y, 4, 'skinD'); }
  v.set(0, 5, 3, 'gold');
  if (o.helm) return helmet(v);
  // ---- rambut: mullet modern (atas berlapis & bertekstur, poni jatuh, samping fade, belakang pendek sampai kerah)
  // samping: burst fade di sekitar telinga
  for (const y of [-5, 4]) { v.paint(-3, y, 5, 3, y, 6, 'fade'); v.paint(-3, y, 2, -2, y, 4, 'fadeL'); v.paint(1, y, 4, 2, y, 4, 'fadeL'); v.paint(2, y, 5, 3, y, 6, 'hair'); }
  v.paint(-4, -4, 1, -4, 3, 3, 'fadeL'); v.paint(-4, -4, 4, -4, 3, 6, 'fade');
  // pelat rambut di atas telinga (lebih lebar dari tengkorak -> volume di atas, tipis di samping)
  for (const y of [-6, 5]) { v.box(-4, y, 7, 4, y, 10, 'hair'); for (const x of [3, 0, -3]) v.set(x, y, 7, null); v.set(4, y, 10, null); v.set(-4, y, 10, null); }
  // atas: dua lapis bertingkat dengan tepi zig-zag (choppy), tepi depan tiap lapis lebih terang
  v.box(-5, -5, 10, 4, 4, 10, 'hair');
  for (let y = -5; y <= 4; y++) {
    const p = (y + 6) >> 1 & 1, edge = y === -5 || y === 4;
    const x1 = 4 - p - (edge ? 1 : 0);                      // lapis 1 (z=11)
    for (let x = -4; x <= x1; x++) v.set(x, y, 11, x === x1 ? 'hairL' : 'hair');
    if (edge) continue;
    const x2 = 1 + p;                                       // lapis 2 / ubun-ubun (z=12)
    for (let x = -2 - p; x <= x2; x++) v.set(x, y, 12, x === x2 ? 'hairL' : 'hair');
  }
  // poni: jatuh ke depan sampai alis, ujungnya tak rata
  const fr = o.fr || [8, 7, 8, 8, 7, 8, 7, 8, 8, 7];
  for (let c = 0; c < 10; c++) for (let z = fr[c]; z <= 10; z++) v.set(5, c - 5, z, z === fr[c] ? 'hairL' : 'hair');
  for (let c = 0; c < 10; c++) v.paint(4, c - 5, 8, 4, c - 5, 9, 'hair');
  // belakang: penuh di atas, menyempit ke tengkuk
  v.box(-5, -5, 7, -5, 4, 10, 'hair'); v.box(-6, -4, 7, -6, 3, 10, 'hair');
  v.box(-5, -4, 4, -5, 3, 6, 'hair'); v.box(-6, -3, 5, -6, 2, 6, 'hair');
  v.box(-5, -3, 1, -5, 2, 3, 'hair');
  for (const y of [-6, 5]) v.box(-5, y, 7, -5, y, 9, 'hair');
  for (const [y, z0, z1] of [[-3, 8, 9], [1, 7, 9], [-1, 5, 6], [2, 5, 5]]) v.paint(-6, y, z0, -6, y, z1, 'hairL');
  for (const [y, z0, z1] of [[-2, 2, 3], [1, 1, 2]]) v.paint(-5, y, z0, -5, y, z1, 'hairL');
  return v;
}
function helmet(v) {   // helm half-face: wajah tetap terlihat, ekor mullet keluar di belakang
  v.box(-6, -6, 6, 5, 5, 11, 'helm');
  v.box(-5, -5, 12, 4, 4, 12, 'helm');
  v.box(-6, -6, 4, 1, -6, 5, 'helm'); v.box(-6, 5, 4, 1, 5, 5, 'helm'); v.box(-6, -5, 3, -6, 4, 5, 'helm');
  for (let z = 0; z <= 8; z++) for (let y = -5; y <= 4; y++) { if (v.get(5, y, z) === 'helm') v.set(5, y, z, null); }
  v.box(5, -5, 9, 5, 4, 10, 'helm'); v.box(6, -4, 9, 6, 3, 9, 'helmL');          // pet
  v.box(-6, -1, 6, 5, 0, 12, 'jkY'); v.box(-5, -1, 12, 4, 0, 12, 'jkY');          // garis kuning
  v.box(5, -5, 10, 5, 4, 11, 'visor'); v.box(5, -1, 10, 5, 0, 11, 'helm');        // goggle di dahi
  for (const y of [-6, 5]) v.set(2, y, 3, 'strap'), v.set(3, y, 2, 'strap');
  return v;
}
function tail() {   // ekor mullet (koordinat lokal kepala): menempel di tengkuk, pendek sampai kerah, ujung mengibas keluar
  const v = new Vox();
  v.box(-5, -3, 0, -4, 2, 0, 'hair');
  v.box(-5, -3, -1, -3, 2, -1, 'hair');
  v.box(-5, -3, -3, -4, 2, -2, 'hair');
  for (const y of [-3, -1, 0, 2]) v.box(-6, y, -4, -5, y, -4, 'hairL');
  for (const y of [-4, 3]) { v.box(-5, y, -2, -4, y, -1, 'hair'); v.set(-5, y, -3, 'hairL'); }   // helai samping yang terlihat dari depan
  for (const [y, z] of [[-2, -1], [-2, -2], [1, -2], [1, -3], [-1, -4]]) v.paint(-5, y, z, -5, y, z, 'hairL');
  return v;
}

function chest(o) {
  const v = new Vox(), J = o.kind === 'jaket', K = o.kind === 'kaus';
  const body = K ? 'kaus' : J ? 'jk' : 'white', sh = K ? 'kausS' : J ? 'jkL' : 'whiteS', inner = K ? 'kaus' : 'tee';
  v.box(-3, -5, 16, 2, 4, 24, body);
  v.box(-2, -2, 25, 1, 1, 26, 'skin');                       // leher
  if (K) { v.paint(2, -2, 24, 2, 1, 24, 'skin'); v.paint(-3, -5, 16, 2, 4, 16, sh); return v; }
  // kemeja/jaket terbuka: kaus dalam terlihat di tengah, dua sisi kemeja menonjol 1 voxel
  v.paint(2, -2, 16, 2, 1, 24, inner);
  v.paint(2, -1, 24, 2, 0, 24, 'skin');
  for (const [a, b] of [[-5, -3], [2, 4]]) v.box(3, a, 16, 3, b, 24, body);
  if (!J) { v.paint(3, -3, 16, 3, -3, 23, 'whiteS'); v.paint(3, 2, 16, 3, 2, 23, 'whiteS'); }
  // sablon kaus: petir kecil
  v.set(2, 0, 21, 'print'); v.set(2, -1, 20, 'print'); v.set(2, 0, 20, 'print'); v.set(2, -1, 19, 'print');
  // kerah berdiri
  const col = J ? 'jkY' : 'white';
  for (let x = -3; x <= 2; x++) for (let y = -3; y <= 2; y++) {
    const inside = x >= -2 && x <= 1 && y >= -2 && y <= 1;
    if (!inside && !(x === 2 && y >= -2 && y <= 1)) v.set(x, y, 25, col);
  }
  v.set(3, -3, 25, col); v.set(3, 2, 25, col);
  if (J) {
    for (const y of [-3, 2]) v.paint(3, y, 16, 3, y, 24, 'jkY');                      // lis ritsleting
    v.paint(-3, -5, 23, 3, 4, 23, 'jkY');                                             // garis dada/bahu
    for (const [y, z] of [[-1, 22], [0, 22], [-2, 21], [-1, 21], [0, 21], [1, 21], [-2, 20], [-1, 20], [0, 20], [1, 20], [-1, 19], [0, 19], [-1, 18], [0, 18]]) v.set(-3, y, z, z <= 18 ? 'jkL' : 'jkY');   // emblem bohlam Lampu Kota
    v.paint(-3, -5, 16, 3, 4, 16, 'jkY');
  } else {
    v.box(3, 2, 20, 3, 4, 20, 'whiteS'); v.set(3, 3, 21, 'osis'); v.set(3, 3, 22, 'osis'); v.set(3, 4, 21, 'osis'); v.set(3, 4, 22, 'osis');   // saku + badge OSIS
    v.set(3, -5, 22, 'tag'); v.set(3, -4, 22, 'tag');                                 // papan nama
    v.paint(-3, -1, 16, -3, 0, 22, 'whiteS');                                         // lipatan punggung
  }
  return v;
}
function pelvis(o) {
  const v = new Vox(), J = o.kind === 'jaket', K = o.kind === 'kaus';
  const pants = K ? 'shorts' : J ? 'jeans' : 'pants';
  v.box(-3, -5, 13, 2, 4, 15, pants);
  if (K) { v.box(-3, -5, 14, 2, 4, 15, 'kaus'); v.paint(-3, -5, 14, 2, 4, 14, 'kausS'); return v; }
  v.paint(-3, -5, 15, 2, 4, 15, 'belt');
  v.paint(2, -2, 14, 2, 1, 15, 'tee');                         // ujung kaus keluar
  if (o.waist) {                                               // jaket balap diikat di pinggang
    v.box(-4, -6, 14, 3, 5, 15, 'jk');
    v.box(-3, -5, 14, 2, 4, 15, 'belt'); v.paint(2, -2, 14, 2, 1, 15, 'tee');
    v.paint(-4, -6, 15, 3, 5, 15, 'jkY');
    v.box(3, -2, 13, 4, 1, 15, 'jkL'); v.paint(4, -2, 15, 4, 1, 15, 'jkY');   // simpul
  } else {                                                     // ujung kemeja/jaket menggantung di luar celana
    const c = J ? 'jk' : 'white', cs = J ? 'jkY' : 'whiteS';
    for (let z = 13; z <= 15; z++) {
      for (let x = -4; x <= 3; x++) for (const y of [-6, 5]) v.set(x, y, z, z === 13 ? cs : c);
      for (let y = -6; y <= 5; y++) v.set(-4, y, z, z === 13 ? cs : c);
      for (const y of [-5, -4, -3, 2, 3, 4]) v.set(3, y, z, z === 13 ? cs : c);
    }
    if (!J) for (const [x, z] of [[1, 12], [0, 11], [-1, 11], [-2, 12]]) v.set(x, -7, z, 'chain');   // rantai dompet
  }
  return v;
}
function flapBack() {   // badan jaket menggantung di belakang
  const v = new Vox();
  v.box(-5, -5, 8, -4, 4, 13, 'jk');
  v.paint(-5, -5, 8, -5, 4, 8, 'jkY'); v.paint(-5, -1, 9, -5, 0, 13, 'jkY');
  v.box(-5, -6, 10, -4, -6, 13, 'jk'); v.box(-5, 5, 10, -4, 5, 13, 'jk');
  for (const y of [-5, 4]) v.set(-5, y, 8, null), v.set(-4, y, 8, null);
  return v;
}
function flapFront() {  // dua ujung lengan jaket menjuntai dari simpul
  const v = new Vox();
  v.box(4, -3, 10, 4, -2, 13, 'jk'); v.box(4, 1, 9, 4, 2, 13, 'jk');
  v.paint(4, -3, 10, 4, -2, 10, 'jkY'); v.paint(4, 1, 9, 4, 2, 9, 'jkY');
  return v;
}
// sisi +y; sisi lain = cermin
function arm(o) {
  const v = new Vox(), J = o.kind === 'jaket', K = o.kind === 'kaus';
  v.box(-2, 5, 18, 1, 8, 24, 'skin');
  if (J) { v.paint(-2, 5, 18, 1, 8, 24, 'jk'); v.paint(-1, 8, 18, 0, 8, 24, 'jkY'); v.paint(-1, 5, 24, 0, 8, 24, 'jkY'); }
  else {
    const c = K ? 'kaus' : 'white', cs = K ? 'kausS' : 'whiteS';
    v.paint(-2, 5, 21, 1, 8, 24, c);
    v.paint(-2, 5, 21, 1, 8, 21, cs);                               // lipatan lengan digulung
    v.box(-2, 9, 21, 1, 9, 24, c); v.set(-2, 9, 21, cs); v.set(-1, 9, 21, cs); v.set(0, 9, 21, cs); v.set(1, 9, 21, cs);   // lengan baju sedikit lebih lebar dari lengan
  }
  return v;
}
function fore(o, side) {
  const v = new Vox(), J = o.kind === 'jaket';
  v.box(-2, 5, 15, 1, 8, 18, J ? 'jk' : 'skin');
  if (J) { v.paint(-1, 8, 16, 0, 8, 18, 'jkY'); v.paint(-2, 5, 15, 1, 8, 15, 'jkY'); } else v.paint(-2, 5, 15, 1, 8, 15, 'band');
  v.box(-2, 5, 12, 2, 8, 14, J ? 'glove' : 'skin');             // kepalan
  if (J) v.paint(-2, 5, 12, 2, 8, 12, 'jkY'); else v.paint(-2, 5, 12, 2, 8, 12, 'skinS');
  return v;
}
function thigh(o) {
  const v = new Vox(), K = o.kind === 'kaus', J = o.kind === 'jaket';
  const c = K ? 'shorts' : J ? 'jeans' : 'pants', cs = K ? 'shortsS' : J ? 'jeansS' : 'pantsS';
  v.box(-2, 1, 7, 2, 4, 14, c);
  if (K) { v.paint(-2, 1, 7, 2, 4, 8, 'skin'); v.paint(-2, 1, 9, 2, 4, 9, cs); }
  else v.paint(-2, 1, 7, 2, 1, 14, cs);
  return v;
}
function shin(o) {
  const v = new Vox(), K = o.kind === 'kaus', J = o.kind === 'jaket';
  const c = K ? 'skin' : J ? 'jeans' : 'pants', cs = K ? 'skinS' : J ? 'jeansS' : 'pantsS';
  v.box(-2, 1, 3, 2, 4, 7, c);
  if (!K) { v.paint(-2, 1, 4, 2, 1, 7, cs); v.box(-3, 1, 4, 2, 5, 4, J ? 'jeansL' : 'pantsL'); v.box(-2, 1, 4, 2, 4, 4, J ? 'jeansL' : 'pantsL'); v.paint(-2, 1, 3, 2, 4, 3, 'skin'); }
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.kind === 'kaus') {   // sandal jepit
    v.box(-3, 1, 0, 4, 4, 0, 'sandal'); v.box(-2, 1, 1, 3, 4, 2, 'skin'); v.box(-2, 1, 3, 1, 4, 3, 'skin');
    v.paint(1, 1, 2, 2, 4, 2, 'sandalS');
    return v;
  }
  // sneakers high-top merah
  v.box(-3, 1, 0, 4, 5, 0, 'sole');
  v.box(-3, 1, 1, 3, 5, 2, 'shoe'); v.box(4, 1, 1, 4, 5, 1, 'shoe'); v.paint(4, 2, 1, 4, 4, 1, 'sole');   // ujung karet putih
  v.box(-3, 1, 3, 1, 5, 3, 'shoeK');
  v.paint(2, 2, 2, 3, 4, 2, 'sole'); v.paint(1, 2, 3, 1, 4, 3, 'sole');   // tali
  v.paint(-3, 1, 1, -3, 5, 2, 'shoeS');
  for (const y of [1, 5]) v.paint(-1, y, 2, 0, y, 2, 'sole');             // strip samping
  return v;
}

// Motor balap sederhana untuk pose naik motor. x maju. Badan motor digambar di kisi kecil lalu diskalakan K;
// jok, setang, dan pijakan ditaruh pas dengan pantat, tangan, dan kaki pose rideSport.
const K = 1.3;
export const BIKE_SEAT = [-4, 16];
function bike() {
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
  // mesin + rangka
  B(-4, -2, 4, 6, 1, 9, 'eng'); P(-2, -2, 6, 4, -2, 7, 'engL'); P(-2, 1, 6, 4, 1, 7, 'engL'); P(-4, -2, 4, 6, 1, 4, 'seat');
  for (const y of [-3, 2]) B(-10, y, 5, -5, y, 5, 'steelS');                           // lengan ayun
  // tangki
  B(1, -2, 10, 9, 1, 13, 'bk'); B(2, -2, 14, 8, 1, 14, 'bk'); P(2, -1, 14, 8, 0, 14, 'plate'); P(1, -2, 10, 9, 1, 10, 'bkS');
  // jok + buritan
  B(-9, -2, 9, 0, 1, 10, 'bk'); P(-9, -2, 9, 0, 1, 9, 'bkS');
  B(-8, -2, 11, 0, 1, 11, 'seat');
  B(-13, -2, 10, -9, 1, 12, 'bk'); B(-13, -2, 13, -10, 1, 13, 'bk'); P(-12, -2, 11, -10, -2, 12, 'plate'); P(-12, 1, 11, -10, 1, 12, 'plate');
  B(-14, -1, 11, -14, 0, 12, 'tl');
  B(-15, -1, 8, -13, 0, 9, 'seat');                                                    // spakbor belakang
  // knalpot (sisi +y)
  B(-6, 2, 4, 3, 2, 5, 'steelS'); B(-14, 2, 6, -6, 3, 8, 'steel'); P(-14, 2, 6, -14, 3, 8, 'seat'); P(-13, 2, 6, -7, 3, 6, 'steelS');
  // fairing, lampu, kaca
  B(11, -3, 11, 15, 2, 15, 'bk'); B(12, -3, 16, 14, 2, 16, 'bk'); P(11, -3, 11, 15, 2, 11, 'bkS');
  B(16, -2, 12, 16, 1, 14, 'lamp'); B(16, -3, 12, 16, -3, 14, 'bk'); B(16, 2, 12, 16, 2, 14, 'bk');
  B(12, -2, 17, 13, 1, 18, 'visor'); B(11, -2, 17, 11, 1, 17, 'visor');
  for (const y of [-3, 2]) P(12, y, 12, 14, y, 14, 'plate');
  // spakbor depan
  for (let x = wx[1] - 9; x <= wx[1] + 9; x++) for (let z = Math.round(cz) + 3; z <= 17; z++) { const r = Math.hypot(x + 0.5 - wx[1], z + 0.5 - cz); if (r > R + 0.2 && r <= R + 1.4) v.box(x, -1, z, x, 0, z, 'bk'); }
  // setang (di posisi tangan), garpu depan dari as roda ke setang, pijakan (di bawah telapak kaki)
  const hx = BIKE_SEAT[0] + 16, hz = BIKE_SEAT[1] + 3, px = BIKE_SEAT[0] + 6, pz = BIKE_SEAT[1] - 9;
  for (let z = Math.round(cz); z <= hz; z++) { const x = Math.round(wx[1] + (hx - wx[1]) * (z - cz) / (hz - cz)); for (const y of [-2, 1]) v.box(x, y, z, x + 1, y, z, 'steel'); }
  v.box(hx, -9, hz, hx + 1, 8, hz, 'steelS'); v.box(hx, -9, hz, hx + 1, -6, hz, 'seat'); v.box(hx, 5, hz, hx + 1, 8, hz, 'seat');
  for (const y of [-6, 3]) v.box(px - 1, y, pz, px + 2, y + 2, pz, 'steelS');
  return v;
}
export function buildBike() { const mesh = meshVox(bike(), PAL, [0, 0, 0]); return [{ name: 'bike', mesh }]; }

export const OUTFITS = {
  seragam: { name: 'Seragam bandel', kind: 'seragam', waist: true },
  seragam2: { name: 'Seragam, tanpa jaket di pinggang', kind: 'seragam', waist: false },
  balap: { name: 'Jaket balap Lampu Kota', kind: 'jaket', waist: false },
  rumah: { name: 'Kaus rumah', kind: 'kaus', waist: false },
};

/* buildParts({ outfit, expr, helm }) -> [{ name, mesh, box }]  (nama = sendi di rig.js) */
export function buildParts(opt = {}) {
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', helm: !!opt.helm, face: opt.face, fr: opt.fr };
  const parts = [];
  const put = (name, v, pivot) => {
    const mesh = meshVox(v, PAL, pivot), b = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
    for (let i = 0; i < mesh.pos.length; i += 3) for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], mesh.pos[i + k]); b[k + 3] = Math.max(b[k + 3], mesh.pos[i + k]); }
    parts.push({ name, mesh, box: b });
  };
  put('head', head(o), [0, 0, 0]);
  put('tail', tail(), [-4, 0, 1]);
  put('chest', chest(o), PIV.chest);
  put('pelvis', pelvis(o), PIV.pelvis);
  if (o.waist) { put('flapB', flapBack(), PIV.flapB); put('flapF', flapFront(), PIV.flapF); }
  const A = arm(o), T = thigh(o), Sn = shin(o), F = foot(o);
  put('armR', A, PIV.armR); put('armL', A.mirrorY(), PIV.armL);
  put('foreR', fore(o, 1), PIV.foreR); put('foreL', fore(o, -1).mirrorY(), PIV.foreL);
  put('thighR', T, PIV.thighR); put('thighL', T.mirrorY(), PIV.thighL);
  put('shinR', Sn, PIV.shinR); put('shinL', Sn.mirrorY(), PIV.shinL);
  put('footR', F, PIV.footR); put('footL', F.mirrorY(), PIV.footL);
  return parts;
}
export const partBoxes = parts => Object.fromEntries(parts.map(p => [p.name, p.box]));
