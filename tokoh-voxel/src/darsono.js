// Pak Darsono: tukang sol sepatu yang mangkal di trotoar Pusat Kota, 60-an, kurus, teliti, suka nasihat
// ("Sepatumu jebol. Sini, sepuluh ribu."). Kulit cokelat gelap keriput, rambut cepak beruban, kumis putih tipis.
// Keliling: topi kain lusuh + kemeja lengan panjang digulung + celana komprang + sandal karet + pikulan bambu dengan dua
// kotak kayu perkakas. Menjahit: celemek kulit + sepatu yang sedang disol + jarum besar & benang. Rangka keluarga Arga.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  dsSkin: ['#764a2a', '#865632', '#96623a', '#a46e44'], dsSkinS: ['#704426'], dsHair: ['#8a8680', '#9a968e', '#aaa69e', '#b8b4ac'], dsKumis: ['#d0ccc4'], dsKumisG: ['#7a766e'],
  dsTopi: ['#6a6450', '#76705a', '#827c64', '#8e886e'], dsTopiS: ['#544e3e'],
  dsKemeja: ['#8a7a5a', '#968664', '#a2926e', '#ae9e7a'], dsKemejaS: ['#6e6046'], dsCelana: ['#3a3a36', '#44443e', '#4e4e48', '#585852'],
  dsSandal: ['#2a2a2c', '#323234', '#3c3c3e', '#464648'],
  dsBambu: ['#b8a050', '#c4ac5a', '#d0b864', '#dcc470'], dsBambuS: ['#8a7838'], dsKayu: ['#6a4424', '#764e2a', '#825832', '#8e623a'], dsKayuS: ['#4a2e16'],
  dsTali: ['#2a2018'], dsSepatu: ['#2a1a10', '#341f14', '#40281a', '#4c3020'], dsSol: ['#c8b48a'], dsBenang: ['#e8e0c8'], dsJarum: ['#c8ccd4'],
  dsKulit: ['#6a3e1e', '#764824', '#82522c', '#8e5c34'],
});

const FCH = { B: 'dsKumis', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'dsSkinS', k: 'dsKumisG' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, '....kkkkkk....', ...mouth, F0, F0];   // alis putih z 11, kumis z 5, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..sKK....KKs..'];   // mata sipit menua
export const FACES = {
  biasa: F(BROW, EYE, ['....mmmmmm....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['....mmmmmm....', F0, F0]),
  marah: F('...BB....BB...', ['..KKK....KKK..', '..WKK....KKW..'], ['....mmmmmm....', '...m......m...', F0]),
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),   // "Sol sepatuuu!"
  nyengir: F(BROW, EYE, ['....mTT.Tm....', '.....mmmm.....', F0]),   // gigi ompong satu
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTT.Tm....', '.....mttm.....', F0]),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),   // encok
};
export const EXPRS = Object.keys(FACES);

const P_ = o => o.top === 'keliling';
const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'dsSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'dsSkin'); v.set(7, -1, 5, 'dsSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'dsSkin'); v.box(-1, y, 6, -1, y, 7, 'dsSkinS'); }
  for (const y of [-6, 5]) { v.set(6, y, 3, 'dsSkinS'); v.set(6, y, 4, 'dsSkinS'); }   // garis pipi
  for (const y of [-4, -2, 1, 3]) v.set(6, y, 13, 'dsSkinS');   // kerut dahi
  const hair = new Vox();   // cepak beruban
  for (let z = 7; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'dsHair', 4);
  hair.rrect(16, -6, -6, 5, 5, 'dsHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 10 : 7)) v.set(x, y, z, c); });
  if (P_(o)) {   // topi kain lusuh, pinggiran pendek melingkar
    for (let z = 13; z <= 19; z++) for (let x = -10; x <= 9; x++) for (let y = -10; y <= 9; y++) {
      const r = z === 13 ? 10.2 : 8.8, d = ((x + 0.5) / r) ** 2 + ((y + 0.5) / r) ** 2 + (Math.max(0, z - 16) / 3.6) ** 2;
      if (d <= 1 && (d > 0.62 || z >= 19 || z === 13)) v.set(x, y, z, z === 14 ? 'dsTopiS' : (x + y * 3 + z) % 7 === 0 ? 'dsTopiS' : 'dsTopi');
    }
    for (let x = -9; x <= 9; x++) for (let y = -9; y <= 9; y++) { const d = Math.hypot(x + 0.5, y + 0.5); if (d <= 7.8 && v.get(x, y, 13) === 'dsTopi') v.set(x, y, 13, null); }
  }
  return v;
}

function chest(o) {
  const v = new Vox(), c = 'dsKemeja';
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -8 + w + t, 4 - t, 7 - w - t, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'dsSkin', 2);
  for (let z = 55; z <= 57; z++) v.shell(z, -4, -5, 3, 4, 'dsKemejaS', 2);
  for (let y = -2; y <= 1; y++) for (let z = 53; z <= 57; z++) v.pf(y, z, 'dsSkin');
  for (let z = 35; z <= 52; z++) v.pf(-1, z, 'dsKemejaS'); for (const z of [38, 43, 48]) v.pf(0, z, 'dsBenang');
  v.pfBox(3, 47, 6, 50, 'dsKemejaS'); v.pf(4, 51, 'dsJarum'); v.pf(5, 51, 'dsBenang');   // saku & jarum terselip
  if (P_(o)) {   // pikulan bambu di bahu kanan, dua kotak kayu menggantung di depan & belakang
    for (let x = -26; x <= 25; x++) for (const z of [57, 58]) for (const y of [6, 7]) v.set(x, y, z, (x + 40) % 7 === 0 ? 'dsBambuS' : 'dsBambu');
    for (const s of [1, -1]) {
      const x0 = s > 0 ? 19 : -26;
      for (let z = 42; z <= 57; z++) { v.set(x0 + 1, 3, z, 'dsTali'); v.set(x0 + 5, 3, z, 'dsTali'); v.set(x0 + 1, 8, z, 'dsTali'); v.set(x0 + 5, 8, z, 'dsTali'); }
      v.rbox(x0, 1, 30, x0 + 6, 10, 41, 'dsKayu', 1); v.rbox(x0, 1, 41, x0 + 6, 10, 41, 'dsKayuS', 1);
      for (let y = 2; y <= 9; y++) v.set(s > 0 ? x0 + 6 : x0, y, 36, 'dsKayuS');
      if (s > 0) { v.rbox(x0 + 2, 3, 42, x0 + 5, 6, 44, 'dsSepatu', 1); v.box(x0 + 2, 3, 42, x0 + 5, 6, 42, 'dsSol'); }   // sepatu titipan di atas kotak
    }
  } else {   // celemek kulit
    for (let z = 34; z <= 50; z++) for (let y = -6; y <= 5; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === 34 ? 'dsKayuS' : 'dsKulit'); }
    for (let z = 50; z <= 57; z++) for (const y of [-5, 4]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'dsTali'); }
  }
  return v;
}
function pelvis(o) {
  const v = new Vox();
  v.rbox(-5, -9, 28, 4, 8, 33, 'dsCelana', 3); v.box(-4, -2, 26, 3, 1, 27, 'dsCelana');
  for (let z = 30; z <= 34; z++) v.shell(z, -6, -9, 5, 8, z === 30 ? 'dsKemejaS' : 'dsKemeja', 3);   // kemeja dikeluarkan
  if (!P_(o)) for (let z = 24; z <= 34; z++) for (let y = -6; y <= 5; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === 24 ? 'dsKayuS' : 'dsKulit'); }
  return v;
}
function arm() { const v = new Vox(); v.rbox(-3, 8, 43, 2, 13, 55, 'dsKemeja', 2); v.rrect(56, -3, 8, 2, 13, 'dsKemeja', 3); return v; }
function fore(o, side) {
  const v = new Vox();
  v.rbox(-3, 8, 31, 2, 13, 42, 'dsSkin', 2);
  v.rbox(-4, 7, 38, 3, 14, 42, 'dsKemejaS', 2);   // lengan kemeja digulung
  v.rbox(-3, 8, 27, 3, 13, 30, 'dsSkin', 2); v.rrect(26, -2, 9, 2, 12, 'dsSkin', 2);
  if (!P_(o) && side < 0) {   // sepatu yang sedang disol, solnya menganga
    v.rbox(-6, 9, 18, 6, 13, 24, 'dsSepatu', 2); v.rbox(-6, 9, 17, 6, 13, 17, 'dsSol', 1); v.box(3, 9, 18, 6, 13, 18, null);
    for (let x = -5; x <= 2; x += 2) v.set(x, 14, 18, 'dsBenang');
  }
  if (!P_(o) && side > 0) {   // jarum besar dengan benang menjuntai
    for (let z = 24; z <= 33; z++) v.set(4, 10, z, z >= 32 ? 'dsKayu' : 'dsJarum');
    for (let z = 18; z <= 26; z++) v.set(5, 11 + (z % 2), z, 'dsBenang');
  }
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-5, 1, 18, 4, 9, 31, 'dsCelana', 3); v.rrect(32, -3, 2, 2, 8, 'dsCelana', 3); return v; }
function shin() { const v = new Vox(); for (let z = 6; z <= 18; z++) v.rrect(z, -5, 1, 4, 9, 'dsCelana', 3); v.rrect(19, -3, 2, 2, 8, 'dsCelana', 3); v.paint(-5, 1, 6, 4, 9, 6, 'dsTopiS'); return v; }   // celana komprang lebar
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 1, 'dsSandal', 3); v.rbox(-3, 2, 2, 6, 7, 3, 'dsSkin', 3); v.rbox(-3, 2, 4, 2, 7, 5, 'dsSkin', 3);
  v.paint(2, 1, 2, 3, 8, 3, 'dsSandal');
  return v;
}

export const OUTFITS = {
  keliling: { name: 'Keliling: topi kain lusuh + kemeja digulung + celana komprang + sandal + pikulan bambu dua kotak perkakas', top: 'keliling' },
  jahit: { name: 'Menjahit: celemek kulit + sepatu yang disol + jarum besar & benang', top: 'jahit' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.keliling), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'dsSkin', shoulder: 'dsKemeja', elbow: 'dsSkin', hip: 'dsCelana', knee: 'dsCelana' }, SKEL, TAIL);
}
