// Om Hendrik: penjual koran di kios kecil pojok alun-alun Pusat Kota, 60-an, orang Manado yang hafal semua gosip kota
// ("Berita hari ini: proyek superblok!"). Kulit kuning langsat, botak tengah, rambut samping memutih, kumis putih tebal,
// kacamata baca melorot, perut agak buncit. Jaga kios: topi pet flat abu + kemeja kotak lengan pendek + pensil di telinga +
// tumpukan koran di tangan + koran terlipat + celana bahan cokelat + sandal kulit. Antar pagi: jaket parasut biru tua +
// tas kanvas besar penuh koran. Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  hkSkin: ['#c08a62', '#d09a70', '#dcaa80', '#e6b890'], hkSkinS: ['#c08460'], hkHair: ['#b8b4ac', '#c8c4bc', '#d6d2ca', '#e4e0d8'], hkKumis: ['#e0dcd4'],
  hkKaca: ['#3a3a40'], hkPet: ['#5a5a5e', '#666668', '#727274', '#7e7e80'], hkPetS: ['#46464a'],
  hkKemeja: ['#3a6aa0', '#4678ae', '#5286bc', '#6094c8'], hkKotak: ['#a8c4e2'], hkKotakS: ['#24487a'],
  hkCelana: ['#6a4e30', '#765836', '#82623e', '#8e6e48'], hkSabuk: ['#2a1e14'], hkSandal: ['#5a3a1e', '#664222', '#724a28', '#7e5430'],
  hkKoran: ['#d8d6ce', '#e2e0d8', '#eceae2', '#f4f2ec'], hkHuruf: ['#6a6a6e'], hkJudul: ['#c82a2a'],
  hkPensil: ['#e8c030'], hkJaket: ['#1e2e4e', '#26385a', '#2e4266', '#384e74'], hkJaketS: ['#d8a020'],
  hkTas: ['#b8a47a', '#c4b086', '#d0bc92', '#dcc8a0'], hkTasS: ['#8a7854'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'hkSkinS', k: 'hkKumis', b: 'hkKumis' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, '...kkkkkkkk...', ...mouth, F0, F0];   // alis z 11, kumis tebal z 5, mulut z 4
const BROW = '..bbb....bbb..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....mmmmmm....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['....mmmmmm....', F0, F0]),   // "Ini rahasia, ya..."
  marah: F('...bb....bb...', EYE, ['....mmmmmm....', '...m......m...', F0]),
  teriak: F('.bbb......bbb.', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),   // "Koran, koran!"
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F('.bb........bb.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const K = o => o.top === 'kios';
const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-6, -7, 6, 6, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];   // pipi tembam
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'hkSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'hkSkin'); v.box(8, -1, 5, 8, 0, 5, 'hkSkin'); v.set(7, -1, 5, 'hkSkinS');   // hidung besar
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'hkSkin'); v.box(-1, y, 6, -1, y, 7, 'hkSkinS'); }
  for (const y of [-5, 4]) { v.set(6, y, 7, 'hkSkinS'); v.set(6, y + (y > 0 ? 1 : -1), 8, 'hkSkinS'); }   // kerut mata
  // botak tengah: rambut putih hanya di samping & belakang
  const hair = new Vox();
  for (let z = 4; z <= 12; z++) hair.rrect(z, -8, -8, 7, 7, 'hkHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && (Math.abs(y + 0.5) > 6.5 ? x <= 1 && z >= 8 : x <= -4 && z >= 4)) v.set(x, y, z, c); });
  // kacamata baca bingkai tipis (z 7..10), lensa terbuka supaya mata tetap kelihatan
  const fx = v.front(-1, 8) + 1;
  ['.GGGGG..GGGGG.', 'GG...GGGG...GG', '.G...G..G...G.', '.GGGGG..GGGGG.'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'G') v.set(fx, c - 7, 10 - r, 'hkKaca'); }));
  for (const y of [-7, 6]) for (let x = fx; x >= -1; x--) if (!v.has(x, y, 9)) v.set(x, y, 9, 'hkKaca');
  // topi pet flat abu: datar, condong ke depan, pet pendek
  for (let z = 13; z <= 17; z++) for (let x = -9; x <= 9; x++) for (let y = -9; y <= 8; y++) {
    const d = ((x + 0.5 - (z - 13) * 0.4) / 8.8) ** 2 + ((y + 0.5) / 8.6) ** 2;
    if (d <= 1 - (z - 13) * 0.06 && (d > 0.55 || z >= 16)) v.set(x, y, z, z === 13 ? 'hkPetS' : (x + y * 2 + z) % 6 === 0 ? 'hkPetS' : 'hkPet');
  }
  for (let x = 8; x <= 11; x++) for (let y = -6; y <= 5; y++) if (Math.abs(y + 0.5) <= 6 - Math.max(0, x - 9) * 2) v.set(x, y, 13, 'hkPetS');
  if (K(o)) for (let x = -4; x <= 2; x++) v.set(x, 8, 10 + (x > 0 ? 1 : 0), x === 2 ? 'hkKaca' : 'hkPensil');   // pensil di telinga kanan
  return v;
}

const bel = z => Math.round(2 * Math.sin(Math.max(0, Math.min(1, (z - 34) / 16)) * Math.PI));   // perut buncit
const kotak = (v, base) => { v.each((x, y, z, c) => { if (c !== base) return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u % 4) + 4) % 4 === 0, b = ((z % 4) + 4) % 4 === 0; if (a && b) v.set(x, y, z, 'hkKotakS'); else if (a || b) v.set(x, y, z, 'hkKotak'); }); return v; };
function chest(o) {
  const v = new Vox(), c = K(o) ? 'hkKemeja' : 'hkJaket';
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -9 + w + t, 4 - t + bel(z), 8 - w - t, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'hkSkin', 2);
  if (K(o)) {
    kotak(v, 'hkKemeja');
    for (let z = 55; z <= 57; z++) v.shell(z, -4, -5, 3, 4, 'hkKemeja', 2);   // kerah
    for (let y = -2; y <= 1; y++) for (let z = 55; z <= 57; z++) v.pf(y, z, 'hkSkin');
    for (let z = 35; z <= 54; z++) v.pf(-1, z, 'hkKotakS'); for (const z of [38, 43, 48, 53]) v.pf(0, z, 'hkKotak');
    v.pfBox(3, 48, 6, 51, 'hkKemeja'); v.pfBox(3, 51, 6, 51, 'hkKotakS');   // saku dada
    v.pf(4, 52, 'hkPensil'); v.pf(4, 53, 'hkPensil');
  } else {
    for (let z = 35; z <= 55; z++) v.pf(-1, z, 'hkJaketS');
    for (let z = 55; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'hkJaket', 2);
    for (let y = -9; y <= 8; y++) { const xf = v.front(y, 50), xb = v.back(y, 50); if (xf !== null) v.set(xf, y, 50, 'hkJaketS'); if (xb !== null) v.set(xb, y, 50, 'hkJaketS'); }
    // tali tas kanvas menyilang dari bahu kiri
    for (let z = 34; z <= 56; z++) { const yc = Math.round(-7 + (56 - z) * 0.65); for (let y = yc; y <= yc + 1; y++) { const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf + 1, y, z, 'hkTasS'); if (xb !== null) v.set(xb - 1, y, z, 'hkTasS'); } }
  }
  return v;
}
function pelvis(o) {
  const v = new Vox();
  v.rbox(-5, -8, 28, 5, 7, 33, 'hkCelana', 3); v.box(-4, -2, 26, 3, 1, 27, 'hkCelana');
  v.shell(33, -6, -9, 6, 8, 'hkSabuk', 3);
  if (!K(o)) {
    for (let z = 31; z <= 34; z++) v.shell(z, -6, -10, 6, 9, z === 31 ? 'hkJaketS' : 'hkJaket', 3);
    // tas kanvas besar di pinggul kanan, koran mencuat
    v.rbox(-5, 9, 22, 5, 13, 34, 'hkTas', 2); v.paint(-5, 9, 30, 5, 13, 30, 'hkTasS');
    for (let x = -4; x <= 4; x++) for (let y = 10; y <= 12; y++) for (let z = 35; z <= 37 + ((x + 40) % 3); z++) v.set(x, y, z, z === 36 && x % 2 ? 'hkHuruf' : 'hkKoran');
  }
  return v;
}
function arm(o) { const v = new Vox(), c = K(o) ? 'hkKemeja' : 'hkJaket'; v.rbox(-3, 8, 43, 2, 13, 55, K(o) ? 'hkSkin' : c, 2); v.rrect(56, -3, 8, 2, 13, c, 3); if (K(o)) { v.paint(-3, 8, 48, 2, 13, 56, c); kotak(v, c); v.shell(48, -4, 7, 3, 14, 'hkKotakS', 2); } return v; }
function koran(v, x0, y0, y1, z0, z1, thick) {   // koran terlipat: halaman putih, baris huruf abu, judul merah
  for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) for (let x = x0; x < x0 + thick; x++) v.set(x, y, z, 'hkKoran');
  for (let z = z0 + 1; z <= z1 - 3; z += 2) for (let y = y0 + 1; y <= y1 - 1; y++) if ((y + z) % 5) v.set(x0 + thick - 1, y, z, 'hkHuruf');
  for (let y = y0 + 1; y <= y1 - 1; y++) v.set(x0 + thick - 1, y, z1 - 1, 'hkJudul');
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-3, 8, 31, 2, 13, 42, K(o) ? 'hkSkin' : 'hkJaket', 2);
  if (!K(o)) v.paint(-3, 8, 31, 2, 13, 32, 'hkJaketS');
  v.rbox(-3, 8, 27, 3, 13, 30, 'hkSkin', 2); v.rrect(26, -2, 9, 2, 12, 'hkSkin', 2);
  if (K(o) && side < 0) {   // tumpukan koran dikepit
    v.rbox(-5, 13, 20, 4, 17, 36, 'hkKoran', 1);
    for (let z = 21; z <= 35; z++) if (z % 2) for (let x = -4; x <= 3; x++) v.set(x, 18, z, 'hkHuruf');
    for (let x = -4; x <= 3; x++) v.set(x, 18, 34, 'hkJudul');
    for (let z = 21; z <= 33; z += 2) for (let y = 14; y <= 16; y++) v.set(4, y, z, 'hkHuruf');
  }
  if (K(o) && side > 0) koran(v, 4, 6, 14, 22, 33, 2);   // koran terlipat yang ditawarkan
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-4, 2, 18, 3, 8, 31, 'hkCelana', 3); v.rrect(32, -3, 2, 2, 8, 'hkCelana', 3); return v; }
function shin() { const v = new Vox(); v.rbox(-4, 2, 6, 3, 8, 18, 'hkCelana', 3); v.rrect(19, -3, 2, 2, 8, 'hkCelana', 3); for (let z = 7; z <= 18; z++) v.pf(5, z, 'hkSabuk'); return v; }
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 1, 'hkSandal', 3); v.rbox(-3, 2, 2, 6, 7, 3, 'hkSkin', 3); v.rbox(-3, 2, 4, 2, 7, 5, 'hkSkin', 3);
  v.paint(1, 1, 2, 4, 8, 3, 'hkSandal');
  return v;
}

export const OUTFITS = {
  kios: { name: 'Jaga kios: topi pet abu + kacamata baca + kemeja kotak lengan pendek + pensil di telinga + tumpukan koran + celana cokelat + sandal kulit', top: 'kios', propOn: 'jual' },
  antar: { name: 'Antar pagi: jaket parasut biru tua + tas kanvas besar penuh koran + topi pet', top: 'antar' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.kios), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), c = K(o) ? 'hkKemeja' : 'hkJaket';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'hkSkin', shoulder: c, elbow: K(o) ? 'hkSkin' : c, hip: 'hkCelana', knee: 'hkCelana' }, SKEL, TAIL);
}
