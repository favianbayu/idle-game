// Bayu "Si Telat": siswa XI SMA 3 yang selalu telat dan langganan lompat pagar ("Bantuin naik pagar, cepet!").
// Kulit sawo matang, rambut jabrik belum disisir, mata sayu kurang tidur, plester di pipi. Seragam: kemeja putih
// dikeluarkan setengah dikancing dengan kaus hitam di dalam + dasi abu longgar miring + ransel hitam di satu bahu + celana abu
// + sepatu kets hitam bertali lepas + roti tawar di mulut tangan. Futsal: jersey oranye #7 + celana pendek hitam + kaus
// kaki panjang + sepatu futsal. Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  btSkin: ['#a06a44', '#b07850', '#c0865c', '#cc9468'], btSkinS: ['#9c6640'], btHair: ['#100c0a', '#18130f', '#221b16', '#2e251e'], btPlester: ['#e8c8a0'],
  btKemeja: ['#dcdee2', '#e8eaec', '#f0f2f4', '#f8f9fa'], btKemejaS: ['#bcc0c8'], btKaus: ['#1a1a1e'], btTie: ['#5e626c'],
  btAbu: ['#62666e', '#6e727a', '#7a7e86', '#868a92'], btAbuS: ['#52565e'], btOsis: ['#d8b048'],
  btRansel: ['#1e2026', '#26282e', '#303238', '#3a3c42'], btRanselS: ['#c83a3a'],
  btKets: ['#16161a', '#1e1e22', '#28282c', '#323236'], btSol: ['#e6e6e8'], btTali: ['#f0f0f0'],
  btRoti: ['#ecd09c'], btRotiK: ['#b07838'],
  btJersey: ['#e0601a', '#ea6c24', '#f27a30', '#f8883e'], btJerseyS: ['#1a1a1e'], btPendek: ['#18181c', '#202024', '#28282c', '#323236'], btKaosKaki: ['#f0f0f2'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'btSkinS', p: 'btPlester' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, '..........pp..', F0, ...mouth, F0, F0];   // alis z 11, plester di pipi z 6, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..KKW....KKW..'];   // kelopak berat: mata sayu
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['......mm......', F0, F0]),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', '...m......m...', F0]),
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),   // "Tungguin!"
  nyengir: F(BROW, EYE, ['...m.....mmm..', '....mmmmm.....', F0]),   // senyum miring tanpa dosa
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', F0]),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const S_ = o => o.top === 'seragam';
const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'btSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'btSkin'); v.set(7, -1, 5, 'btSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'btSkin'); v.box(-1, y, 6, -1, y, 7, 'btSkinS'); }
  // jabrik bangun tidur: jumputan rambut mencuat ke segala arah
  const hair = new Vox();
  for (let z = 7; z <= 16; z++) hair.rrect(z, -8, -8, 7, 7, 'btHair', 4);
  hair.rrect(17, -7, -7, 6, 6, 'btHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 10 : 7)) v.set(x, y, z, c); });
  for (const [x, y, z, h] of [[3, -4, 17, 3], [0, 2, 18, 3], [-3, -3, 18, 2], [-5, 4, 17, 2], [4, 3, 16, 2], [-7, -1, 15, 2]]) {   // gumpalan jabrik 3x3 menyempit ke atas
    for (let i = 0; i < h; i++) { const r = i < h - 1 ? 1 : 0, dx = x > 2 ? i : x < -4 ? -i : 0, dy = y > 0 ? Math.floor(i / 2) : -Math.floor(i / 2); for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) v.set(x + dx + a, y + dy + b, z + i, 'btHair'); }
  }
  for (let y = -6; y <= 5; y++) if (rnd(1, y, 0) % 3) { const x = (v.front(y, 13) ?? 6) + 1; v.set(x, y, 13, 'btHair'); if (rnd(2, y, 0) % 2) v.set(x, y, 12, 'btHair'); }   // poni acak
  return v;
}

function chest(o) {
  const v = new Vox(), c = S_(o) ? 'btKemeja' : 'btJersey';
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -6, -8 + w + t, 5 - t, 7 - w - t, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'btSkin', 2);
  if (S_(o)) {   // kemeja kancing atas terbuka, kaus hitam mengintip, dasi longgar miring ke kanan
    for (let z = 46; z <= 56; z++) { const h = Math.floor((z - 46) / 4); for (let y = -1 - h; y <= h; y++) v.pf(y, z, 'btKaus'); }
    for (let z = 34; z <= 45; z++) v.pf(0, z, 'btKemejaS');
    for (let z = 55; z <= 57; z++) v.shell(z, -4, -5, 3, 4, 'btKemeja', 2);
    for (let z = 38; z <= 52; z++) { const y = Math.round(2 + (52 - z) * 0.15); const x = v.front(y, z); if (x !== null) { v.set(x + 1, y, z, 'btTie'); if (z >= 48) v.set(x + 1, y + 1, z, 'btTie'); } }
    v.pfBox(-6, 47, -4, 48, 'btOsis');
    for (const [y, z] of [[-6, 40], [-5, 41], [4, 38], [5, 43]]) v.pf(y, z, 'btKemejaS');   // kusut
    // tali ransel di bahu kanan saja (depan-belakang)
    for (let z = 40; z <= 57; z++) for (const y of [4, 5]) { const xf = v.front(y, z); if (xf !== null && z >= 50) v.set(xf + 1, y, z, 'btRansel'); }
    for (let z = 38; z <= 57; z++) for (const y of [4, 5]) { const xb = v.back(y, z); if (xb !== null) v.set(xb - 1, y, z, 'btRansel'); }
    v.rbox(-13, 2, 34, -8, 11, 52, 'btRansel', 2);   // ransel menggantung miring di punggung kanan
    for (let z = 36; z <= 50; z += 7) for (let y = 3; y <= 10; y++) v.set(-13, y, z, 'btRanselS');
  } else {   // jersey oranye #7: lis hitam, nomor di punggung
    v.shell(56, -5, -6, 4, 5, 'btJerseyS', 3);
    const N7 = ['XXXXX', '....X', '...X.', '..X..', '..X..', '.X...'];
    N7.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'X') { const y = c - 2, z = 51 - r * 2; for (const zz of [z, z - 1]) { const x = v.back(y, zz); if (x !== null) v.set(x, y, zz, 'btJerseyS'); } } }));
    v.pfBox(3, 49, 4, 50, 'btJerseyS');
  }
  return v;
}
function pelvis(o) {
  const v = new Vox(), c = S_(o) ? 'btAbu' : 'btPendek';
  v.rbox(-5, -8, 28, 4, 7, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (S_(o)) for (let z = 27; z <= 34; z++) v.shell(z, -7, -9, 6, 8, z <= 28 && (z + 20) % 2 ? 'btKemejaS' : 'btKemeja', 3);   // kemeja dikeluarkan menutupi pinggul
  else for (let z = 32; z <= 34; z++) v.shell(z, -7, -9, 6, 8, 'btJersey', 3);
  return v;
}
function arm(o) {
  const v = new Vox(), c = S_(o) ? 'btKemeja' : 'btJersey';
  v.rbox(-3, 8, 43, 2, 12, 55, 'btSkin', 2); v.rrect(56, -3, 8, 2, 12, c, 3); v.paint(-3, 8, 48, 2, 12, 56, c);
  v.paint(-3, 8, 48, 2, 12, 48, S_(o) ? 'btKemejaS' : 'btJerseyS');
  return v;
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-3, 8, 31, 2, 12, 42, 'btSkin', 2);
  v.rbox(-3, 8, 27, 3, 12, 30, 'btSkin', 2); v.rrect(26, -2, 9, 2, 11, 'btSkin', 2);
  if (S_(o) && side > 0) {   // roti tawar setengah digigit
    v.box(3, 8, 24, 4, 13, 31, 'btRoti'); for (let z = 24; z <= 31; z++) { v.set(3, 8, z, 'btRotiK'); v.set(3, 13, z, 'btRotiK'); } for (let y = 8; y <= 13; y++) v.set(3, y, 31, 'btRotiK');
    for (const [y, z] of [[12, 31], [13, 31], [13, 30], [11, 31]]) { v.set(3, y, z, null); v.set(4, y, z, null); }
  }
  return v;
}
function thigh(o) { const c = S_(o) ? 'btAbu' : 'btPendek', v = new Vox(); v.rbox(-4, 2, 18, 3, 7, 31, c, 3); v.rrect(32, -3, 2, 2, 7, c, 3); if (!S_(o)) { v.paint(-4, 2, 18, 3, 7, 21, 'btSkin'); v.shell(22, -5, 1, 4, 8, c, 3); } return v; }
function shin(o) {
  const v = new Vox();
  if (S_(o)) { v.rbox(-4, 2, 6, 3, 7, 18, 'btAbu', 3); v.rrect(19, -3, 2, 2, 7, 'btAbu', 3); for (let z = 7; z <= 18; z++) v.pf(4, z, 'btAbuS'); return v; }
  v.rbox(-4, 2, 6, 3, 7, 18, 'btKaosKaki', 3); v.rrect(19, -3, 2, 2, 7, 'btSkin', 3); v.paint(-4, 2, 17, 3, 7, 18, 'btSkin');   // kaus kaki panjang
  for (const z of [14, 15]) v.shell(z, -4, 2, 3, 7, 'btJersey', 3);
  return v;
}
function foot(o) {
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 7, 1, 'btSol', 3); v.rbox(-4, 1, 2, 7, 7, 4, S_(o) ? 'btKets' : 'btJersey', 3); v.rbox(-4, 1, 5, 3, 7, 6, S_(o) ? 'btKets' : 'btJersey', 3);
  if (S_(o)) { for (const x of [1, 3]) v.paint(x, 3, 4, x, 5, 4, 'btTali'); v.set(5, 8, 1, 'btTali'); v.set(6, 9, 0, 'btTali'); v.set(4, 8, 2, 'btTali'); }   // tali sepatu lepas menjuntai
  else v.paint(-4, 1, 2, 7, 7, 2, 'btKets');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam berantakan: kemeja dikeluarkan + kaus hitam + dasi longgar miring + ransel satu bahu + celana abu + kets bertali lepas + roti tawar', top: 'seragam' },
  futsal: { name: 'Futsal: jersey oranye #7 + celana pendek hitam + kaus kaki panjang + sepatu futsal', top: 'futsal' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.seragam), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), s = S_(o), c = s ? 'btKemeja' : 'btJersey', l = s ? 'btAbu' : 'btPendek';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'btSkin', shoulder: c, elbow: 'btSkin', hip: l, knee: s ? l : 'btSkin' }, SKEL, TAIL);
}
