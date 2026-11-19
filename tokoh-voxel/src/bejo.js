// Bejo: anak STM Otomotif kelas X, anggota kecil Serigala Besi yang sok sangar, nongkrong di jembatan selatan
// ("Ngapain anak SMA ke sini?"). Kurus, kulit sawo matang gelap, rambut undercut dengan jambul disisir ke atas, alis
// dicukur satu garis, bekas luka kecil di dagu. Seragam STM: kemeja putih logo roda gigi biru dikeluarkan + lengan digulung +
// celana abu pensil + sepatu safety + kunci inggris. Nongkrong: jaket hitam patch serigala di punggung + kaus merah + jins
// hitam robek di lutut + rantai dompet + boots. Rangka keluarga Arga lebih ramping, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  bjSkin: ['#7e4e2e', '#8e5a36', '#9e663e', '#ac7248'], bjSkinS: ['#7a4a2a'], bjHair: ['#0e0b0a', '#161210', '#201a17', '#2a231f'], bjCukur: ['#3e2c22'], bjHairT: ['#3a302a'],
  bjPutih: ['#dcdee2', '#e8eaec', '#f0f2f4', '#f8f9fa'], bjPutihS: ['#bcc0c8'], bjLogo: ['#2a4c9a'], bjLogoS: ['#e0c040'],
  bjAbu: ['#5a5e66', '#666a72', '#72767e', '#7e828a'], bjAbuS: ['#4a4e56'],
  bjSafety: ['#2a1e14', '#3a2a1c', '#4e3826', '#664a34'], bjSafetyT: ['#e8b830'], bjSol: ['#18140e'],
  bjBesi: ['#8a8e96', '#9a9ea6', '#aaaeb6', '#babec6'], bjBesiS: ['#5a5e66'],
  bjJaket: ['#16161a', '#1e1e22', '#28282c', '#323236'], bjJaketS: ['#3a3a40'], bjSerigala: ['#9aa0aa'], bjMerahMata: ['#e02a2a'],
  bjKaus: ['#a82a2a', '#b83434', '#c83e3e', '#d44a4a'], bjJinsH: ['#1c1c22', '#24242a', '#2c2c34', '#36363e'], bjJinsHS: ['#4a4a54'], bjRantai: ['#c8ccd4'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'bjSkinS', c: 'bjSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, '.....c........', F0, F0];   // alis z 11, mulut z 4, luka dagu z 2
const BROW = '..BBB....B.B..';   // alis kanan dicukur satu garis
const EYE = ['..KKK....KKK..', '..KKW....WKK..'];   // tatapan sinis
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmmm....', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmmm....', F0]),
  marah: F('...BB....B.B..', EYE, ['....mmmmmm....', '...m......m...']),
  teriak: F('...BB....B.B..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....']),   // "Woy!"
  nyengir: F(BROW, EYE, ['......mmmmm...', '.....mTTTm....']),   // seringai miring
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....']),
  sakit: F('..BB......B.B.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....']),
};
export const EXPRS = Object.keys(FACES);

const S_ = o => o.top === 'seragam';
const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'bjSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'bjSkin'); v.set(7, -1, 5, 'bjSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'bjSkin'); v.box(-1, y, 6, -1, y, 7, 'bjSkinS'); }
  // undercut: sisi & belakang dicukur (kulit kepala diwarnai bayangan rambut tipis), atas tebal disisir ke atas jadi jambul
  v.each((x, y, z, c) => { if (c === 'bjSkin' && z >= 9 && z <= 14 && (x <= 3 || Math.abs(y + 0.5) > 6.5) && !(Math.abs(y + 0.5) > 6.5 && x >= -2 && z <= 9)) v.set(x, y, z, 'bjCukur'); });
  const hair = new Vox();
  for (let z = 13; z <= 17; z++) hair.rrect(z, -8, -6, 7, 5, 'bjHair', 3);
  for (let z = 18; z <= 19; z++) hair.rrect(z, -4 + (z - 18) * 2, -5, 7, 4, 'bjHair', 2);   // jambul naik ke depan
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : 13)) v.set(x, y, z, c); });
  for (let x = -7; x <= 7; x++) for (let y = -5; y <= 4; y++) { let z = 21; while (z > 12 && !v.has(x, y, z)) z--; if (z > 12 && v.get(x, y, z) === 'bjHair' && (y + 20) % 3 === 0 && x % 2 === 0) v.set(x, y, z, 'bjHairT'); }   // garis sisiran
  return v;
}

function chest(o) {
  const v = new Vox(), c = S_(o) ? 'bjPutih' : 'bjJaket';
  for (let z = 34; z <= 55; z++) { const w = z <= 47 ? 0 : -1, t = z === 55 ? 1 : 0, g = S_(o) ? 0 : 1; v.rrect(z, -5 - g, -7 + w + t - g, 4 - t + g, 6 - w - t + g, c, z >= 54 ? 4 : 3); }
  v.rbox(-3, -3, 56, 2, 2, 59, 'bjSkin', 2);
  if (S_(o)) {   // kemeja STM dua kancing atas terbuka, logo roda gigi biru di dada kanan layar
    for (let z = 34; z <= 50; z++) v.pf(0, z, 'bjPutihS');
    for (let z = 51; z <= 55; z++) { const h = Math.floor((z - 51) / 2); for (let y = -1 - h; y <= h; y++) v.pf(y, z, 'bjSkin'); }
    for (let z = 55; z <= 57; z++) v.shell(z, -4, -5, 3, 4, 'bjPutih', 2);
    ['L.L.L', '.LLL.', 'LLYLL', '.LLL.', 'L.L.L'].forEach((row, r) => [...row].forEach((ch, cc) => { if (ch !== '.') v.pf(cc + 1, 50 - r, ch === 'L' ? 'bjLogo' : 'bjLogoS'); }));
  } else {   // jaket hitam terbuka di atas kaus merah, patch kepala serigala di punggung
    for (let z = 34; z <= 54; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x !== null) { v.set(x, y, z, null); v.set(x - 1, y, z, 'bjKaus'); } }
    for (let z = 34; z <= 54; z++) { v.pf(-4, z, 'bjJaketS'); v.pf(3, z, 'bjJaketS'); }
    for (let z = 54; z <= 57; z++) v.shell(z, -5, -6, 4, 5, 'bjJaket', 2);
    ['K.....K', 'KK...KK', 'KKKKKKK', 'K.KKK.K', 'KKKKKKK', '.KKrKK.', '..KKK..'].forEach((row, r) => [...row].forEach((ch, cc) => { if (ch !== '.') { v.pb(3 - cc, 52 - r * 2, ch === 'r' ? 'bjMerahMata' : 'bjSerigala'); v.pb(3 - cc, 51 - r * 2, ch === 'r' ? 'bjSerigala' : 'bjSerigala'); } }));
  }
  return v;
}
function pelvis(o) {
  const v = new Vox(), c = S_(o) ? 'bjAbu' : 'bjJinsH';
  v.rbox(-5, -6, 28, 4, 5, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (S_(o)) for (let z = 28; z <= 34; z++) v.shell(z, -6, -8, 5, 7, z === 28 ? 'bjPutihS' : 'bjPutih', 3);   // kemeja dikeluarkan
  else {
    for (let z = 31; z <= 34; z++) v.shell(z, -6, -8, 5, 7, z === 31 ? 'bjJaketS' : 'bjJaket', 3);
    for (let z = 24; z <= 29; z++) { const x = z % 2 ? -6 : -5; v.set(x, 6 + (z % 2), z, 'bjRantai'); }   // rantai dompet menjuntai
  }
  return v;
}
function arm(o) {
  const v = new Vox(), c = S_(o) ? 'bjPutih' : 'bjJaket';
  if (S_(o)) { v.rbox(-2, 7, 43, 2, 11, 54, 'bjSkin', 2); v.rrect(55, -2, 7, 2, 11, c, 2); v.paint(-2, 7, 50, 2, 11, 55, c); v.shell(49, -3, 6, 3, 12, 'bjPutihS', 2); v.shell(50, -3, 6, 3, 12, 'bjPutih', 2); }   // lengan digulung
  else { v.rbox(-3, 6, 43, 3, 12, 54, c, 2); v.rrect(55, -3, 6, 3, 12, c, 2); }
  return v;
}
function fore(o, side) {
  const v = new Vox();
  if (S_(o)) v.rbox(-2, 7, 31, 2, 11, 42, 'bjSkin', 2);
  else { v.rbox(-3, 6, 31, 3, 12, 42, 'bjJaket', 2); v.paint(-3, 6, 31, 3, 12, 32, 'bjJaketS'); }
  v.rbox(-2, 7, 27, 3, 11, 30, 'bjSkin', 2); v.rrect(26, -1, 8, 2, 10, 'bjSkin', 1);
  if (S_(o) && side > 0) {   // kunci inggris diputar-putar
    for (let z = 19; z <= 31; z++) v.set(2, 9, z, 'bjBesi'), v.set(2, 10, z, 'bjBesi');
    v.box(1, 7, 15, 3, 12, 18, 'bjBesi'); v.box(1, 9, 15, 3, 10, 16, null);   // kepala kunci terbuka
    for (let z = 21; z <= 29; z += 4) v.set(3, 9, z, 'bjBesiS');
  }
  if (!S_(o) && side < 0) v.paint(-3, 6, 33, 3, 12, 33, 'bjRantai');   // gelang rantai
  return v;
}
function thigh(o) {
  const c = S_(o) ? 'bjAbu' : 'bjJinsH', v = new Vox(); v.rbox(-4, 2, 18, 3, 6, 31, c, 3); v.rrect(32, -3, 2, 2, 6, c, 3);
  if (!S_(o)) for (let z = 18; z <= 21; z++) for (let y = 3; y <= 5; y++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, (z + y) % 2 ? 'bjSkin' : 'bjJinsHS'); }   // robek di lutut
  return v;
}
function shin(o) { const c = S_(o) ? 'bjAbu' : 'bjJinsH', v = new Vox(); v.rbox(-3, 2, 6, 3, 6, 18, c, 3); v.rrect(19, -3, 2, 2, 6, c, 3); for (let z = 7; z <= 17; z++) v.pf(4, z, S_(o) ? 'bjAbuS' : 'bjJinsHS'); return v; }   // celana pensil
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 7, 1, 'bjSol', 3); v.rbox(-4, 1, 2, 7, 7, 5, 'bjSafety', 3); v.rbox(-4, 1, 6, 2, 7, 8, 'bjSafety', 3);
  for (let z = 3; z <= 7; z += 2) v.set(3, 4, z, 'bjSafetyT');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam STM: kemeja logo roda gigi dikeluarkan + lengan digulung + celana abu pensil + sepatu safety + kunci inggris', top: 'seragam' },
  nongkrong: { name: 'Nongkrong Serigala Besi: jaket hitam patch serigala + kaus merah + jins hitam robek + rantai dompet + boots', top: 'nongkrong' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.seragam), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), s = S_(o), c = s ? 'bjPutih' : 'bjJaket', l = s ? 'bjAbu' : 'bjJinsH';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'bjSkin', shoulder: c, elbow: s ? 'bjSkin' : c, hip: l, knee: l }, SKEL, TAIL);
}
