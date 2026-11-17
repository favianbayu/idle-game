// Uda Rizki: pemilik Rumah Makan Padang "Saiyo" di Kenanga, 30-an, urang Minang yang ramah dan cepat ("Rendang baru matang!").
// Kulit sawo matang, rambut hitam pendek disisir rapi ke samping, kumis tipis, senyum lebar. Kemeja putih lengan digulung,
// celemek merah marun, handuk kecil di bahu, tumpukan piring lauk di tangan kiri (gaya pelayan Padang), celana hitam,
// sepatu pantofel. Jumat: baju koko hijau + kopiah hitam. Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  uzSkin: ['#8e5a36', '#a26a40', '#b47a4c', '#c48a5a'], uzSkinS: ['#985f3a'], uzHair: ['#0e0c0a', '#161210', '#201a16', '#2c241e'], uzKumis: ['#161210'],
  uzKemeja: ['#d8d8d2', '#e6e6e0', '#f2f2ee', '#fbfbf8'], uzKemejaS: ['#bcbcb4'],
  uzCelemek: ['#6a1a1e', '#7c2226', '#902a2e', '#a43638'], uzCelemekS: ['#4e1014'], uzCelemekK: ['#e8c050'],
  uzHanduk: ['#d8c8a0', '#e4d6b0', '#eee2c0', '#f6eed2'], uzHandukS: ['#b8a47a'],
  uzCelana: ['#16161a', '#1e1e24', '#28282e', '#34343c'], uzCelanaS: ['#0e0e12'], uzSepatu: ['#140e0c', '#1e1612', '#2a1e18', '#3a2a22'],
  uzPiring: ['#d8d8d4', '#e8e8e4', '#f4f4f0', '#ffffff'], uzPiringS: ['#b4b4b0'],
  rendang: ['#3a1e0e', '#4a2614', '#5a301a', '#6c3c22'], gulai: ['#d8981a', '#e4a826', '#eeb834', '#f6c84a'], daunS: ['#2a6a1a', '#347a22', '#3e8a2a', '#4a9c34'], cabeR: ['#c8281a'],
  kokoR: ['#2a6a4a', '#327a56', '#3a8a62', '#469c70'], kokoRS: ['#1e4e36'], kokoRK: ['#e8d8a0'], kopiahR: ['#121216', '#1a1a20', '#24242a', '#303038'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'uzSkinS', k: 'uzKumis' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, '....kkkkkk....', ...mouth, F0, F0];   // alis z 11, kumis z 5, mulut z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['...m......m...', '....mmmmmm....', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['...m......m...', '....mmmmmm....', F0]),
  marah: F('...BBB..BBB...', EYE, ['....mmmmmm....', '...m......m...', F0]),
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),   // "Rendang baru matang!"
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'uzSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'uzSkin'); v.set(7, -1, 5, 'uzSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'uzSkin'); v.box(-1, y, 6, -1, y, 7, 'uzSkinS'); }
  const hair = new Vox();   // pendek rapi belah samping kiri, jambul kecil ke kanan
  for (let z = 6; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'uzHair', 4);
  hair.rrect(16, -7, -7, 6, 6, 'uzHair', 4); hair.rrect(17, -4, -6, 5, 3, 'uzHair', 3);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 6)) v.set(x, y, z, c); });
  if (o.kopiah) for (let z = 13; z <= 19; z++) for (let x = -9; x <= 8; x++) for (let y = -9; y <= 8; y++) { const d = ((x + 0.5) / 8.6) ** 2 + ((y + 0.5) / 8.3) ** 2; if (d <= 1 && (d > 0.62 || z >= 18)) v.set(x, y, z, 'kopiahR'); }
  return v;
}

const bodyC = o => o.top === 'jualan' ? 'uzKemeja' : 'kokoR';
function chest(o) {
  const v = new Vox(), c = bodyC(o);
  for (let z = 34; z <= 56; z++) { const w = z <= 40 ? 1 : z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -9 + w + t, 4 - t, 8 - w - t, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'uzSkin', 2);
  if (o.top === 'jualan') {
    for (let z = 35; z <= 55; z++) v.pf(-1, z, 'uzKemejaS');
    for (let z = 56; z <= 58; z++) v.shell(z, -4, -5, 3, 4, z === 58 ? 'uzKemejaS' : 'uzKemeja', 2);   // kerah
    for (let y = -2; y <= 1; y++) v.pf(y, 56, 'uzSkin');
    // celemek marun dari dada sampai lutut (bagian dada di sini), tali di leher, tulisan emas "SAIYO" disederhanakan jadi garis
    for (let z = 34; z <= 52; z++) for (let y = -6; y <= 5; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'uzCelemek'); }
    for (let z = 52; z <= 56; z++) for (const y of [-5, 4]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'uzCelemekS'); }
    for (const z of [44, 46]) for (let y = -4; y <= 3; y++) if ((y + z) % 2 === 0 || z === 46) { const x = v.front(y, z); v.set(x, y, z, 'uzCelemekK'); }
    // handuk kecil tersampir di bahu kanan (layar kiri), menjuntai depan & belakang
    for (let y = -10; y <= -5; y++) { const xf = v.front(y, 55), xb = v.back(y, 55); if (xf === null) continue; for (let x = xb - 1; x <= xf + 1; x++) v.set(x, y, 56, 'uzHanduk'); }
    for (let z = 44; z <= 55; z++) for (let y = -9; y <= -6; y++) { const xf = v.front(y, z), xb = v.back(y, z); if (xf === null) continue; v.set(xf + 1, y, z, z === 44 ? 'uzHandukS' : 'uzHanduk'); v.set(xb - 1, y, z, z === 44 ? 'uzHandukS' : 'uzHanduk'); }
  } else {   // baju koko hijau: kerah tegak, bordir krem di dada
    for (let z = 56; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'kokoR', 2);
    for (let z = 36; z <= 55; z++) v.pf(-1, z, 'kokoRS');
    for (let z = 46; z <= 55; z++) for (const y of [-4, -3, 2, 3]) if ((z + y) % 3 === 0) v.pf(y, z, 'kokoRK');
  }
  return v;
}
const legC = () => 'uzCelana';
function pelvis(o) {
  const v = new Vox();
  v.rbox(-5, -8, 28, 4, 7, 33, 'uzCelana', 3); v.box(-4, -2, 26, 3, 1, 27, 'uzCelana');
  if (o.top === 'jualan') {
    v.shell(33, -6, -9, 5, 8, 'belt', 3);
    for (let z = 22; z <= 33; z++) for (let y = -6; y <= 5; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === 22 ? 'uzCelemekS' : 'uzCelemek'); }
  } else for (let z = 27; z <= 33; z++) v.shell(z, -6, -9, 5, 8, z === 27 ? 'kokoRS' : 'kokoR', 3);   // koko menutupi pinggul
  return v;
}
function arm(o) { const v = new Vox(), c = bodyC(o); v.rbox(-3, 8, 43, 2, 13, 55, c, 2); v.rrect(56, -3, 8, 2, 13, c, 3); return v; }
function fore(o, side) {
  const v = new Vox(), J = o.top === 'jualan';
  v.rbox(-3, 8, 31, 2, 13, 42, J ? 'uzSkin' : 'kokoR', 2);
  if (J) for (let z = 38; z <= 42; z++) v.shell(z, -4, 7, 3, 14, z === 38 || z === 40 ? 'uzKemejaS' : 'uzKemeja', 2);   // lengan digulung sampai bawah siku
  v.rbox(-3, 8, 27, 3, 13, 30, 'uzSkin', 2); v.rrect(26, -2, 9, 2, 12, 'uzSkin', 2);
  if (side < 0 && J) {   // tumpukan piring lauk di tangan kiri: rendang, gulai, sayur daun singkong, sambal
    const lauk = ['rendang', 'gulai', 'daunS', 'rendang'];
    for (let i = 0; i < 4; i++) {
      const z = 22 + i * 3, cx = 3 + (i % 2), cy = 10;
      for (let x = cx - 6; x <= cx + 6; x++) for (let y = cy - 6; y <= cy + 6; y++) { const d = Math.hypot(x - cx, y - cy); if (d <= 6.2) v.set(x, y, z, d > 5.2 ? 'uzPiringS' : 'uzPiring'); if (d <= 4) v.set(x, y, z + 1, (x + y) % 4 === 0 && i === 1 ? 'cabeR' : lauk[i]); }
    }
  }
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-4, 2, 18, 3, 8, 31, 'uzCelana', 3); v.rrect(32, -3, 2, 2, 8, 'uzCelana', 3); return v; }
function shin(o) {
  const v = new Vox();
  v.rbox(-4, 2, 6, 3, 8, 18, 'uzCelana', 3); v.rrect(19, -3, 2, 2, 8, 'uzCelana', 3); v.shell(6, -5, 1, 4, 9, 'uzCelanaS', 3);
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'jualan') { v.rbox(-4, 1, 0, 7, 8, 1, 'uzSepatu', 3); v.rbox(-4, 1, 2, 6, 8, 4, 'uzSepatu', 3); v.rbox(-4, 2, 5, 1, 7, 5, 'uzSepatu', 2); return v; }
  v.rbox(-4, 1, 0, 7, 8, 0, 'kopiahR', 3); v.rbox(-3, 2, 1, 6, 7, 2, 'uzSkin', 2); v.rbox(-3, 2, 3, 2, 7, 4, 'uzSkin', 2); v.paint(1, 1, 1, 3, 8, 2, 'kopiahR');   // sandal selop
  return v;
}

export const OUTFITS = {
  jualan: { name: 'Rumah makan: kemeja putih digulung + celemek marun + handuk di bahu + tumpukan piring lauk', top: 'jualan' },
  jumat: { name: 'Jumatan: baju koko hijau + kopiah hitam + celana hitam + selop', top: 'jumat', kopiah: true },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.jualan), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = bodyC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'uzSkin', shoulder: sl, elbow: o.top === 'jualan' ? 'uzSkin' : sl, hip: 'uzCelana', knee: 'uzCelana' }, SKEL, TAIL);
}
