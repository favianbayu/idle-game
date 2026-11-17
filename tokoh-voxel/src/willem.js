// Opa Willem: pensiunan Indo-Belanda di Perumahan Bukit Asri, 70-an, kalem dan sedikit cerewet soal tanaman ("Anggrek ini
// umurnya lebih tua dari kamu."). Jangkung agak bungkuk, kulit terang kemerahan, rambut putih tipis disisir ke belakang,
// kumis putih, alis putih lebat, hidung mancung. Taman: topi rimba krem + kemeja lengan pendek kotak biru muda + celana pendek
// khaki + kaus kaki tinggi + sandal kulit + pot anggrek bulan ungu. Ke gereja: jas abu terang + dasi kupu-kupu + fedora + tongkat.
// Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 14, thigh: 14.5, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 11, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  wlSkin: ['#d8a088', '#e4b098', '#eebea8', '#f6ccb8'], wlSkinS: ['#d8a08a'], wlBlush: ['#e88e80'], wlUban: ['#c8c8c4', '#dcdcd8', '#ececea', '#f8f8f6'], wlUbanS: ['#a8a8a4'],
  wlTopi: ['#b8a47a', '#c8b48a', '#d6c29a', '#e2d0aa'], wlTopiS: ['#9a8660'],
  wlKemeja: ['#8ab8d8', '#9ac6e2', '#aad4ec', '#bce0f2'], wlKemejaS: ['#6a98ba'], wlKemejaK: ['#f2f6fa'],
  wlKhaki: ['#9a8660', '#aa966c', '#b8a47a', '#c6b28a'], wlKhakiS: ['#7a6846'], wlKaus: ['#e8e6e0', '#f2f0ea', '#f8f6f2', '#fdfcfa'],
  wlSandal: ['#5a3a20', '#6a4628', '#7a5230', '#8c603a'],
  wlPot: ['#b85a3a', '#c86a46', '#d67a54', '#e48a64'], wlPotS: ['#8a3e24'], wlTanah: ['#3a2a1a'], wlDaun: ['#2a6a2a', '#347a32', '#3e8a3c', '#4a9c48'],
  wlAnggrek: ['#a83a9a', '#b84aaa', '#c85aba', '#d86cca'], wlAnggrekP: ['#f6e8f2'], wlAnggrekK: ['#f2d23a'], wlBatang: ['#5a7a3a'],
  wlJas: ['#7a7e86', '#888c94', '#969aa2', '#a6aab2'], wlJasS: ['#5a5e66'], wlDasi: ['#7a1a2a', '#8a222e', '#9a2a36', '#aa3440'], wlDasiS: ['#5a1020'],
  wlCelana: ['#3a3e46', '#44484e', '#4e525a', '#5a5e66'], wlSepatu: ['#2a1a10', '#341f14', '#40281a', '#4e3222'], wlFedora: ['#4a4e56', '#565a62', '#62666e', '#70747c'], wlPita: ['#1a1a1e'],
  wlTongkat: ['#3a2410', '#4a2e16', '#5a381c', '#6c4424'], wlGagang: ['#c8b080'],
});

const FCH = { B: 'wlUban', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'wlSkinS', k: 'wlUban', r: 'wlBlush' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, 'r..........r..'.padEnd(14, '.'), F0, '...kkkkkkkk...', ...mouth, F0, F0];   // alis putih lebat z 11, kumis putih z 5, mulut z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....mmmmmm....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['....mmmmmm....', F0, F0]),
  marah: F('..BBB....BBB..', EYE, ['....mmmmmm....', '...m......m...', F0]),   // "Jangan injak anggreknya!"
  teriak: F('.BBB......BBB.', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -4, 5, 3, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];   // wajah panjang, dagu sempit
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'wlSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 8, 'wlSkin'); v.box(8, -1, 5, 8, 0, 6, 'wlSkin'); v.set(8, -1, 5, 'wlSkinS');   // hidung mancung panjang
  for (const y of [-8, 7]) { v.box(-2, y, 4, 0, y, 8, 'wlSkin'); v.box(-1, y, 5, -1, y, 7, 'wlSkinS'); }
  const hair = new Vox();   // rambut putih tipis disisir lurus ke belakang, dahi tinggi
  for (let z = 6; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'wlUban', 4);
  hair.rrect(16, -6, -6, 5, 5, 'wlUban', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 4 ? 15 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 6)) v.set(x, y, z, (y + 40) % 3 === 0 && z >= 14 ? 'wlUbanS' : c); });
  if (o.topi === 'rimba') {   // topi rimba krem: kubah rendah + lingkar pinggiran lebar melengkung ke bawah
    for (let z = 14; z <= 19; z++) for (let x = -9; x <= 8; x++) for (let y = -9; y <= 8; y++) { const d = ((x + 0.5) / 8.6) ** 2 + ((y + 0.5) / 8.4) ** 2; if (d <= 1 && (d > 0.6 || z >= 19)) v.set(x, y, z, z === 15 ? 'wlTopiS' : 'wlTopi'); }
    for (let x = -13; x <= 12; x++) for (let y = -13; y <= 12; y++) { const d = Math.hypot(x + 0.5, y + 0.5); if (d > 8.5 && d <= 12.5) v.set(x, y, d > 11 ? 13 : 14, 'wlTopi'); }
  }
  if (o.topi === 'fedora') {   // fedora abu: puncak berlekuk, pita hitam, pinggiran sedang
    for (let z = 14; z <= 21; z++) for (let x = -9; x <= 8; x++) for (let y = -9; y <= 8; y++) { const d = ((x + 0.5) / 8.4) ** 2 + ((y + 0.5) / 8.2) ** 2; if (d <= 1 && (d > 0.6 || z >= 21) && !(z === 21 && Math.abs(y + 0.5) < 1.5)) v.set(x, y, z, z <= 16 ? 'wlPita' : 'wlFedora'); }
    for (let x = -12; x <= 11; x++) for (let y = -11; y <= 10; y++) { const d = ((x + 0.5) / 11.5) ** 2 + ((y + 0.5) / 10.5) ** 2; if (d <= 1 && !v.has(x, y, 14)) v.set(x, y, 14, 'wlFedora'); }
  }
  return v;
}

/* ---------- badan jangkung agak bungkuk (sisi +y; sisi -y = cermin) */
const bodyC = o => o.top === 'taman' ? 'wlKemeja' : 'wlJas';
const kotak = v => { v.each((x, y, z, k) => { if (k !== 'wlKemeja') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x; if ((u + 40) % 4 === 0 && z % 4 === 0) v.set(x, y, z, 'wlKemejaS'); else if ((u + 40) % 4 === 0 || z % 4 === 0) v.set(x, y, z, 'wlKemejaK'); }); return v; };
function chest(o) {
  const v = new Vox(), c = bodyC(o);
  for (let z = 34; z <= 56; z++) { const t = z === 56 ? 1 : 0, hump = z >= 48 ? Math.min(1, Math.floor((z - 46) / 4)) : 0; v.rrect(z, -5 - hump, -8 + t, 4 - t, 7 - t, c, 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'wlSkin', 2);
  for (let z = 56; z <= 58; z++) v.shell(z, -4, -5, 3, 4, c, 2);   // kerah
  if (o.top === 'taman') {
    for (let y = -2; y <= 1; y++) for (let z = 54; z <= 56; z++) if (Math.abs(y + 0.5) <= z - 53) v.pf(y, z, 'wlSkin');
    kotak(v); for (let z = 35; z <= 53; z++) v.pf(-1, z, 'wlKemejaK');
    v.pfBox(-6, 47, -3, 50, 'wlKemejaS');   // saku: kacamata baca menyembul
    v.pf(-5, 51, 'wlPita'); v.pf(-4, 51, 'wlPita');
  } else {   // jas abu, kemeja putih, dasi kupu-kupu merah marun, saputangan di saku
    for (let z = 44; z <= 56; z++) for (let y = -3; y <= 2; y++) if (Math.abs(y + 0.5) <= (z - 43) * 0.35) v.pf(y, z, 'wlKaus');
    for (const [y, z] of [[-3, 55], [-2, 55], [1, 55], [2, 55], [-3, 54], [2, 54], [-1, 55], [0, 55]]) { const x = v.front(y, z); v.set(x + 1, y, z, y === -1 || y === 0 ? 'wlDasiS' : 'wlDasi'); }
    for (let z = 36; z <= 52; z++) for (const y of [-4, 3]) v.pf(y, z, 'wlJasS');
    v.pf(-6, 50, 'wlKaus'); v.pf(-5, 50, 'wlKaus'); v.pfBox(-6, 49, -4, 49, 'wlJasS');
    for (const z of [38, 42]) v.pf(-1, z, 'wlPita');
  }
  return v;
}
const legC = o => o.top === 'taman' ? 'wlKhaki' : 'wlCelana';
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-5, -8, 28, 4, 7, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  v.shell(33, -6, -9, 5, 8, 'wlSandal', 3);   // ikat pinggang kulit, celana tinggi ala opa
  if (o.top === 'gereja') for (let z = 26; z <= 32; z++) v.shell(z, -6, -9, 5, 8, z === 26 ? 'wlJasS' : 'wlJas', 3);   // ekor jas
  return v;
}
function arm(o) { const v = new Vox(), c = bodyC(o), T = o.top === 'taman'; v.rbox(-3, 8, 43, 2, 12, 55, T ? 'wlSkin' : c, 2); v.rrect(56, -3, 8, 2, 12, c, 3); if (T) { v.paint(-3, 8, 48, 2, 12, 56, c); v.shell(48, -4, 7, 3, 13, c, 2); kotak(v); } return v; }
function fore(o, side) {
  const v = new Vox(), T = o.top === 'taman';
  v.rbox(-3, 8, 31, 2, 12, 42, T ? 'wlSkin' : 'wlJas', 2);
  if (!T) v.shell(31, -4, 7, 3, 13, 'wlKaus', 2);   // manset kemeja putih
  v.rbox(-3, 8, 27, 3, 12, 30, 'wlSkin', 2); v.rrect(26, -2, 9, 2, 11, 'wlSkin', 2);
  if (side < 0) v.paint(-3, 8, 32, 2, 12, 33, 'wlGagang');   // jam tangan tua berbingkai emas
  if (side > 0 && T) {   // pot tanah liat anggrek bulan: batang melengkung, bunga ungu berbibir kuning
    for (let z = 14; z <= 22; z++) { const r = 3 + (z - 14) * 0.25; for (let x = -4; x <= 4; x++) for (let y = 6; y <= 14; y++) if (Math.hypot(x, y - 10) <= r) v.set(x, y, z, z === 22 ? 'wlPotS' : 'wlPot'); }
    for (let x = -3; x <= 3; x++) for (let y = 7; y <= 13; y++) if (Math.hypot(x, y - 10) <= 3) v.set(x, y, 23, 'wlTanah');
    for (const [x, y] of [[-3, 10], [3, 10], [0, 7], [0, 13]]) for (let k = 0; k < 4; k++) v.set(x + Math.sign(x) * k, y + Math.sign(y - 10) * k, 24, 'wlDaun');
    for (let z = 24; z <= 33; z++) v.set(Math.round((z - 24) * 0.4), 10, z, 'wlBatang');
    for (const [bx, bz] of [[3, 34], [5, 31], [6, 28]]) for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) <= 2) v.set(bx + dx, 10 + dy, bz + dz, dx === 1 && dz === 0 && dy === 0 ? 'wlAnggrekK' : Math.abs(dy) === 1 && dz === 1 ? 'wlAnggrekP' : 'wlAnggrek');
  }
  if (side > 0 && !T) {   // tongkat kayu bergagang tanduk, sampai tanah
    for (let z = 1; z <= 30; z++) v.set(1, 10, z, 'wlTongkat');
    for (let x = 1; x <= 5; x++) v.set(x, 10, 31, 'wlGagang'); v.set(5, 10, 30, 'wlGagang');
  }
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-4, 2, 18, 3, 8, 31, o.top === 'taman' ? 'wlSkin' : c, 3); v.rrect(32, -3, 2, 2, 8, c, 3); if (o.top === 'taman') for (let z = 22; z <= 31; z++) v.shell(z, -5, 1, 4, 9, c, 3); return v; }
function shin(o) {
  const v = new Vox(), T = o.top === 'taman';
  v.rbox(-3, 3, 6, 2, 7, 18, T ? 'wlSkin' : 'wlCelana', 2); v.rrect(19, -3, 3, 2, 7, T ? 'wlSkin' : 'wlCelana', 2);
  if (T) v.paint(-3, 3, 5, 2, 7, 13, 'wlKaus'); else v.shell(6, -4, 2, 3, 8, 'wlCelana', 2);   // kaus kaki tinggi putih
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'taman') { v.rbox(-4, 1, 0, 7, 8, 1, 'wlSandal', 3); v.rbox(-3, 2, 2, 6, 7, 3, 'wlKaus', 2); v.rbox(-3, 2, 4, 2, 7, 5, 'wlKaus', 2); v.paint(1, 1, 2, 3, 8, 3, 'wlSandal'); v.paint(-3, 1, 2, -3, 8, 4, 'wlSandal'); return v; }
  v.rbox(-4, 1, 0, 7, 8, 1, 'wlSepatu', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'wlSepatu', 3); v.rbox(-4, 2, 5, 2, 7, 5, 'wlSepatu', 2);
  return v;
}

export const OUTFITS = {
  taman: { name: 'Merawat anggrek: topi rimba + kemeja kotak biru muda + celana pendek khaki + kaus kaki tinggi + pot anggrek bulan', top: 'taman', topi: 'rimba' },
  gereja: { name: 'Ke gereja: fedora abu + jas abu terang + dasi kupu-kupu marun + tongkat kayu', top: 'gereja', topi: 'fedora' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.taman), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = bodyC(o), leg = legC(o), T = o.top === 'taman';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'wlSkin', shoulder: sl, elbow: T ? 'wlSkin' : sl, hip: leg, knee: T ? 'wlSkin' : leg }, SKEL, TAIL);
}
