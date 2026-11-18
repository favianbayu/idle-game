// Mandor Proyek Sutris: mandor proyek superblok PT Graha di pagar proyek selatan, 50-an, perut buncit, galak ke anak-anak
// yang mendekat ("Dilarang masuk! Proyek!"). Kulit legam, kumis tebal beruban, rahang lebar. Proyek: helm proyek kuning +
// rompi oranye bergaris reflektor bertulis GRAHA di punggung + kemeja biru lengan panjang + celana kain cokelat + sepatu
// safety + papan jepit & pulpen. Santai: kemeja batik cokelat + celana bahan + pantofel + HP besar & kunci mobil.
// Rangka keluarga Arga dengan perut buncit, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10.5, shZ: 17, upper: 10.5, fore: 12, hipY: 5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  sutSkin: ['#6e4428', '#7e4e2e', '#8e5a36', '#9c663e'], sutSkinS: ['#6a4024'], sutHair: ['#2a2622', '#34302c', '#3e3a36', '#4a4642'], sutKumis: ['#5a5650'],
  sutHelm: ['#e0b01a', '#eabc24', '#f2c830', '#f8d43c'], sutHelmS: ['#b88a12'],
  sutRompi: ['#e05a10', '#ec6a1a', '#f47a26', '#fa8a36'], sutRompiS: ['#b8460a'], sutRefl: ['#d8dce0'],
  sutKemeja: ['#4a6a9a', '#5476a6', '#5e82b2', '#6a8ebe'], sutKemejaS: ['#3a5682'],
  sutCelana: ['#6a5238', '#765c40', '#82664a', '#8e7054'], sutCelanaS: ['#56422c'],
  sutSafety: ['#2a1e14', '#3a2a1c', '#4e3826', '#664a34'], sutSol: ['#18140e'],
  sutPapan: ['#8a5a2a'], sutKertas: ['#f2efe6'], sutGaris: ['#7a8aa0'], sutJepit: ['#a8acb4'],
  sutBatik: ['#5a3a1e', '#664426', '#724e2e', '#7e5836'], sutBatikS: ['#d8a84a'], sutHitam: ['#16161a', '#1e1e22', '#28282c', '#323236'], sutHP: ['#1a1a1e'], sutKunci: ['#c8ccd4'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'sutSkinS', k: 'sutKumis' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, '...kkkkkkkk...', '..kkkkkkkkkk..', ...mouth, F0, F0];   // alis z 11, kumis tebal z 6-5, mulut z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F('..BBBB..BBBB..', EYE, ['.....mmmm.....', F0, F0]),   // cemberut bawaan
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0, F0]),
  marah: F('...BBB..BBB...', EYE, ['....mmmmmm....', '...m......m...', F0]),
  teriak: F('...BBB..BBB...', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),   // "Dilarang masuk!"
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', F0]),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const P_ = o => o.top === 'proyek';
const skull = z => z <= 0 ? [-3, -6, 5, 5, 3] : z === 1 ? [-5, -7, 6, 6, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];   // rahang lebar
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'sutSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 7, 'sutSkin'); v.set(7, -1, 7, 'sutSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'sutSkin'); v.box(-1, y, 6, -1, y, 7, 'sutSkinS'); }
  const hair = new Vox();   // pendek beruban, botak tipis di ubun-ubun tertutup helm
  for (let z = 7; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'sutHair', 4);
  hair.rrect(16, -6, -6, 5, 5, 'sutHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 10 : 7)) v.set(x, y, z, c); });
  if (P_(o)) {   // helm proyek kuning
    v.each((x, y, z, c) => { if (c === 'sutHair' && z >= 12) v.set(x, y, z, null); });   // rambut di bawah helm dibuang supaya tidak tembus: kubah + rusuk tengah + pinggiran lebar
    for (let z = 12; z <= 21; z++) for (let x = -10; x <= 9; x++) for (let y = -10; y <= 9; y++) {
      const d = ((x + 0.5) / 9.4) ** 2 + ((y + 0.5) / 9.2) ** 2 + (Math.max(0, z - 13) / 8.4) ** 2;
      if (d <= 1 && d > 0.55) v.set(x, y, z, 'sutHelm');
    }
    for (let x = -12; x <= 12; x++) for (let y = -11; y <= 10; y++) if (((x + 0.5) / (x > 0 ? 12 : 10.5)) ** 2 + ((y + 0.5) / 10.5) ** 2 <= 1 && !v.has(x, y, 13)) v.set(x, y, 13, 'sutHelmS');
    for (let x = -8; x <= 7; x++) for (const y of [-1, 0]) { let z = 23; while (z > 13 && !v.has(x, y, z)) z--; if (z > 13) v.set(x, y, z + 1, 'sutHelm'); }
  }
  return v;
}

function chest(o) {
  const v = new Vox(), c = P_(o) ? 'sutKemeja' : 'sutBatik';
  for (let z = 34; z <= 56; z++) { const b = z <= 44 ? Math.round(2.6 - Math.abs(z - 39) * 0.3) : 0, t = z === 56 ? 1 : 0, w = z <= 46 ? 0 : -1; v.rrect(z, -6, -10 + w + t, 6 - t + Math.max(0, b), 9 - w - t, c, z >= 55 ? 4 : 3); }   // perut buncit
  v.rbox(-3, -3, 57, 2, 2, 60, 'sutSkin', 2);
  for (let z = 55; z <= 58; z++) v.shell(z, -4, -5, 3, 4, P_(o) ? 'sutKemejaS' : 'sutBatik', 2);
  if (P_(o)) {   // rompi oranye: dua garis reflektor, GRAHA di punggung, kemeja di bukaan depan
    v.each((x, y, z, k) => { if (k === 'sutKemeja' && z <= 55 && (Math.abs(y + 0.5) > 2.5 || x <= 0) && z >= 36) v.set(x, y, z, 'sutRompi'); });
    for (let z = 36; z <= 55; z++) { v.pf(-3, z, 'sutRompiS'); v.pf(2, z, 'sutRompiS'); }
    for (const z of [42, 43, 49, 50]) for (let y = -11; y <= 10; y++) { const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null && Math.abs(y + 0.5) > 2.5) v.set(xf, y, z, 'sutRefl'); if (xb !== null) v.set(xb, y, z, 'sutRefl'); }
    const G = ['GGG.GGG..G..G..G..G..', 'G...G.G.G.G.G..G.G.G.', 'G.G.GG..GGG.GGGG.GGG.', 'GGG.G.G.G.G.G..G.G.G.'];   // GRAHA (dilihat dari belakang, ditulis terbalik)
    G.forEach((row, r) => [...row].forEach((ch, cc) => { if (ch === 'G') v.pb(10 - cc, 47 - r, 'sutRompiS'); }));
    for (let z = 38; z <= 54; z += 4) v.pf(0, z, 'sutKemejaS');
  } else v.each((x, y, z, k) => { if (k === 'sutBatik' && ((x * 3 + y * 5 + z * 2) % 9 === 0)) v.set(x, y, z, 'sutBatikS'); });
  return v;
}
function pelvis(o) {
  const v = new Vox(), c = P_(o) ? 'sutCelana' : 'sutHitam';
  v.rbox(-6, -9, 28, 6, 8, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  v.rbox(-6, -9, 32, 6, 8, 33, 'sutHitam', 3); v.pfBox(-1, 32, 0, 33, 'sutJepit');
  if (!P_(o)) for (let z = 30; z <= 34; z++) v.shell(z, -7, -10, 7, 9, 'sutBatik', 3);   // batik dikeluarkan
  return v;
}
function arm(o) { const v = new Vox(), c = P_(o) ? 'sutKemeja' : 'sutBatik'; v.rbox(-3, 8, 43, 2, 13, 55, c, 2); v.rrect(56, -3, 8, 2, 13, P_(o) ? 'sutRompi' : c, 3); if (!P_(o)) v.paint(-3, 8, 43, 2, 13, 47, 'sutSkin'); return v; }
function fore(o, side) {
  const v = new Vox();
  if (P_(o)) { v.rbox(-3, 8, 31, 2, 13, 42, 'sutKemeja', 2); v.paint(-3, 8, 31, 2, 13, 32, 'sutKemejaS'); }
  else v.rbox(-3, 8, 31, 2, 13, 42, 'sutSkin', 2);
  v.rbox(-3, 8, 27, 3, 13, 30, 'sutSkin', 2); v.rrect(26, -2, 9, 2, 12, 'sutSkin', 2);
  if (P_(o) && side < 0) {   // papan jepit berisi jadwal proyek
    v.box(3, 4, 18, 3, 15, 34, 'sutPapan'); v.box(4, 5, 19, 4, 14, 32, 'sutKertas');
    for (let z = 21; z <= 30; z += 3) for (let y = 6; y <= 13; y++) if ((y + z) % 5) v.set(4, y, z, 'sutGaris');
    v.box(4, 8, 33, 5, 11, 34, 'sutJepit');
  }
  if (P_(o) && side > 0) for (let z = 26; z <= 34; z++) v.set(4, 10, z, z >= 33 ? 'sutKemejaS' : 'sutKertas');   // pulpen
  if (!P_(o) && side < 0) v.box(3, 9, 24, 4, 12, 32, 'sutHP');
  if (!P_(o) && side > 0) { v.box(3, 10, 23, 4, 11, 26, 'sutHitam'); v.set(4, 10, 22, 'sutKunci'); v.set(4, 10, 21, 'sutKunci'); }
  return v;
}
function thigh(o) { const c = P_(o) ? 'sutCelana' : 'sutHitam', v = new Vox(); v.rbox(-4, 2, 18, 4, 9, 31, c, 3); v.rrect(32, -3, 2, 3, 9, c, 3); return v; }
function shin(o) { const c = P_(o) ? 'sutCelana' : 'sutHitam', v = new Vox(); v.rbox(-4, 2, 6, 3, 8, 18, c, 3); v.rrect(19, -3, 2, 2, 8, c, 3); for (let z = 7; z <= 18; z++) v.pf(5, z, P_(o) ? 'sutCelanaS' : 'sutBatik'); return v; }
function foot(o) {
  const v = new Vox();
  if (P_(o)) { v.rbox(-4, 1, 0, 7, 8, 1, 'sutSol', 3); v.rbox(-4, 1, 2, 7, 8, 5, 'sutSafety', 3); v.rbox(-4, 1, 6, 2, 8, 8, 'sutSafety', 3); return v; }
  v.rbox(-4, 1, 0, 7, 8, 0, 'sutSol', 3); v.rbox(-4, 1, 1, 7, 8, 4, 'sutHitam', 3); v.rbox(-3, 2, 5, 2, 7, 6, 'sutHitam', 3); v.set(7, 4, 3, 'sutKunci');
  return v;
}

export const OUTFITS = {
  proyek: { name: 'Proyek: helm kuning + rompi oranye reflektor GRAHA + kemeja biru + celana kain + sepatu safety + papan jepit & pulpen', top: 'proyek' },
  santai: { name: 'Santai: kemeja batik cokelat + celana bahan hitam + pantofel + HP & kunci mobil', top: 'santai' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.proyek), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), p = P_(o), l = p ? 'sutCelana' : 'sutHitam';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'sutSkin', shoulder: p ? 'sutRompi' : 'sutBatik', elbow: p ? 'sutKemeja' : 'sutSkin', hip: l, knee: l }, SKEL, TAIL);
}
