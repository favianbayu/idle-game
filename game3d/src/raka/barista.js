// Mas Barista Kevin: barista kafe modern "Senja Kopi" di Pusat Kota (saingan warkop Om Darto), 20-an, sok keren tapi ramah
// ("Single origin, mau coba?"). Kulit kuning langsat, rambut diikat man bun, undercut samping, janggut tipis rapi.
// Kafe: kaus hitam + celemek kanvas cokelat bertali kulit + tato garis di lengan + cangkir latte. Santai: kemeja flanel
// kotak merah + jeans + sneakers + tumbler. Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  brSkin: ['#c8986e', '#d6a87e', '#e2b68c', '#ecc49c'], brSkinS: ['#cc9e74'], brHair: ['#2a1c12', '#342418', '#402c1e', '#4e3626'], brUndercut: ['#5a4434'], brJenggot: ['#3a2a1e'],
  brTato: ['#3a4a5a'], brKaus: ['#16161a', '#1e1e22', '#28282e', '#34343c'], brKausS: ['#0c0c0e'],
  brCelemek: ['#8a6a44', '#9a7850', '#aa875c', '#ba976c'], brCelemekS: ['#6a4e30'], brKulit: ['#4a2e18', '#5a381e', '#6a4426', '#7c502e'], brLogam: ['#c8ccd4'],
  brCangkir: ['#e8e6e0', '#f2f0ea', '#f8f6f2', '#fdfcfa'], brLatte: ['#c89a6a'], brFoam: ['#f4ead8'],
  brFlanel: ['#a82a2a', '#b83232', '#c83c3c', '#d84a4a'], brFlanelS: ['#1e1e22'], brFlanelK: ['#5a1414'],
  brJeans: ['#2a3a5a', '#324468', '#3a4e76', '#465a86'], brJeansS: ['#1e2a42'], brSneak: ['#e4e4e0', '#eeeeea', '#f6f6f4', '#ffffff'], brSneakS: ['#c0c0bc'], brSepatu: ['#3a2a1e', '#46321e', '#523c26', '#62482e'],
  brTumbler: ['#2a6a5a', '#327a68', '#3a8a76', '#469c86'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'brSkinS', j: 'brJenggot' };
const F0 = '..............';
const F = (brow, eyes, mouth, m3 = '...jjjjjjjj...') => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, m3, '....jjjjjj....', F0];   // alis z 11, mulut z 4, janggut z 2..1
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', '..j........j..']),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['....m....m....', '..j..mmmm..j..']),   // kedip ke pelanggan
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', '..j........j..']),
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '..jjmttttmjj..'], '...jjmmmmjj...'),
  nyengir: F(BROW, EYE, ['....mTTTTm....', '..j..mmmm..j..']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '..jjmttttmjj..']),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '..j.TTTTTT.j..']),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'brSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'brSkin'); v.set(7, -1, 5, 'brSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'brSkin'); v.box(-1, y, 6, -1, y, 7, 'brSkinS'); }
  // undercut: samping & belakang bawah cukur tipis, atas panjang disisir ke belakang jadi man bun
  for (let z = 6; z <= 12; z++) for (let y = -8; y <= 7; y++) for (let x = -8; x <= 4; x++) { if (v.has(x, y, z)) continue; const d = ((x + 0.5) / 8.4) ** 2 + ((y + 0.5) / 8.2) ** 2; if (d <= 1 && d > 0.72 && !(Math.abs(y + 0.5) > 6.5 && x >= -2 && z <= 8)) v.set(x, y, z, 'brUndercut'); }
  for (let z = 7; z <= 8; z++) for (let y = -8; y <= 7; y++) { const x = v.front(y, z); if (x !== null && x < 5 && Math.abs(y + 0.5) > 6.5) v.set(x, y, z, 'brJenggot'); }   // cambang
  const hair = new Vox();
  for (let z = 13; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'brHair', 4);
  hair.rrect(16, -7, -7, 6, 6, 'brHair', 4); hair.rrect(17, -5, -5, 4, 4, 'brHair', 3);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z)) v.set(x, y, z, c); });
  for (let x = -11; x <= -6; x++) for (let y = -3; y <= 2; y++) for (let z = 15; z <= 20; z++) { const d = ((x + 8.5) / 3) ** 2 + ((y + 0.5) / 3) ** 2 + ((z - 17.5) / 3) ** 2; if (d <= 1 && !v.has(x, y, z)) v.set(x, y, z, 'brHair'); }   // man bun
  for (let y = -2; y <= 1; y++) v.set(-7, y, 16, 'brKulit');   // ikat rambut
  return v;
}

const bodyC = o => o.top === 'kafe' ? 'brKaus' : 'brFlanel';
const kotak = v => { v.each((x, y, z, k) => { if (k !== 'brFlanel') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = (u + 40) % 5 < 2, b = (z + 40) % 5 < 2; if (a && b) v.set(x, y, z, 'brFlanelK'); else if (a || b) v.set(x, y, z, 'brFlanelS'); }); return v; };
function chest(o) {
  const v = new Vox(), c = bodyC(o), K = o.top === 'kafe';
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -8 + w + t, 4 - t, 7 - w - t, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'brSkin', 2);
  if (K) {
    for (let y = -2; y <= 1; y++) v.pf(y, 56, 'brSkin'); v.shell(56, -4, -4, 3, 3, 'brKausS', 2);
    // celemek kanvas: dada sampai lutut, tali kulit menyilang di punggung, paku keling logam, saku pulpen
    for (let z = 34; z <= 53; z++) for (let y = -6; y <= 5; y++) { if (z >= 50 && Math.abs(y + 0.5) > 4.5) continue; const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'brCelemek'); }
    for (let z = 53; z <= 57; z++) for (const y of [-5, 4]) { const x = v.front(y, Math.min(z, 55)); if (x !== null) v.set(x + 1, y, z, 'brKulit'); }
    for (const y of [-5, 4]) { const x = v.front(y, 53); v.set(x, y, 53, 'brLogam'); }
    for (let z = 36; z <= 56; z++) { const y = Math.round(-7 + (z - 36) / 20 * 13); for (const yy of [y, -1 - y]) { const x = v.back(yy, z); if (x !== null) v.set(x - 1, yy, z, 'brKulit'); } }
    v.pfBox(1, 44, 4, 47, 'brCelemekS'); v.pf(2, 48, 'brKaus'); v.pf(3, 48, 'brLogam');
  } else {   // flanel terbuka di atas kaus hitam
    for (let z = 35; z <= 55; z++) for (let y = -2; y <= 1; y++) v.pf(y, z, 'brKaus');
    kotak(v); for (let z = 56; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'brFlanel', 2);
  }
  return v;
}
function pelvis(o) {
  const c = o.top === 'kafe' ? 'brKaus' : 'brJeans', v = new Vox();
  v.rbox(-5, -8, 28, 4, 7, 33, o.top === 'kafe' ? 'brCelemekS' : 'brJeans', 3); v.box(-4, -2, 26, 3, 1, 27, 'brJeans');
  v.shell(33, -6, -9, 5, 8, 'brKulit', 3);
  if (o.top === 'kafe') { v.paint(-5, -8, 28, 4, 7, 32, 'brKaus'); for (let z = 22; z <= 33; z++) for (let y = -6; y <= 5; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'brCelemek'); } }
  else for (let z = 29; z <= 33; z++) v.shell(z, -6, -9, 5, 8, 'brFlanel', 3), kotak(v);
  return v;
}
function arm(o) { const v = new Vox(), c = bodyC(o), K = o.top === 'kafe'; v.rbox(-3, 8, 43, 2, 12, 55, K ? 'brSkin' : c, 2); v.rrect(56, -3, 8, 2, 12, c, 3); if (K) { v.paint(-3, 8, 50, 2, 12, 56, c); v.shell(50, -4, 7, 3, 13, 'brKausS', 2); v.each((x, y, z, k) => { if (k === 'brSkin' && z <= 49 && (z + y) % 4 === 0) v.set(x, y, z, 'brTato'); }); } else kotak(v); return v; }
function fore(o, side) {
  const v = new Vox(), K = o.top === 'kafe';
  v.rbox(-3, 8, 31, 2, 12, 42, K ? 'brSkin' : 'brFlanel', 2);
  if (K) { if (side > 0) v.each((x, y, z, k) => { if (k === 'brSkin' && z >= 34 && ((z + y + x) % 5 === 0 || z === 36)) v.set(x, y, z, 'brTato'); }); }
  else { for (let z = 38; z <= 42; z++) v.shell(z, -4, 7, 3, 13, 'brFlanel', 2); kotak(v); }   // lengan flanel digulung
  v.rbox(-3, 8, 27, 3, 12, 30, 'brSkin', 2); v.rrect(26, -2, 9, 2, 11, 'brSkin', 2);
  if (side > 0 && K) {   // cangkir latte di atas lepek, latte art hati
    v.rbox(0, 6, 25, 8, 14, 25, 'brCangkir', 3); v.rbox(1, 7, 26, 7, 13, 30, 'brCangkir', 3); v.rbox(2, 8, 31, 6, 12, 31, 'brLatte', 2);
    for (const [x, y] of [[4, 9], [4, 10], [3, 9], [5, 10], [3, 11], [4, 11]]) v.set(x, y, 31, 'brFoam');
    v.rbox(-1, 9, 27, -1, 11, 29, 'brCangkir', 0);
  }
  if (side > 0 && !K) v.rbox(0, 8, 20, 3, 12, 31, 'brTumbler', 1);
  return v;
}
function thigh(o) { const c = o.top === 'kafe' ? 'brJeans' : 'brJeans', v = new Vox(); v.rbox(-4, 2, 18, 3, 8, 31, c, 3); v.rrect(32, -3, 2, 2, 8, c, 3); return v; }
function shin(o) { const v = new Vox(); v.rbox(-4, 2, 6, 3, 8, 18, 'brJeans', 3); v.rrect(19, -3, 2, 2, 8, 'brJeans', 3); v.shell(6, -5, 1, 4, 9, 'brJeansS', 3); v.shell(7, -5, 1, 4, 9, 'brJeansS', 3); return v; }
function foot(o) {
  const v = new Vox();
  if (o.top === 'kafe') { v.rbox(-4, 1, 0, 7, 8, 1, 'brKulit', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'brSepatu', 3); v.rbox(-4, 1, 5, 2, 8, 6, 'brSepatu', 3); return v; }   // boots kulit
  v.rbox(-4, 1, 0, 7, 8, 1, 'brSneakS', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'brSneak', 3); v.rbox(-4, 1, 5, 2, 8, 5, 'brSneak', 3);
  return v;
}

export const OUTFITS = {
  kafe: { name: 'Di bar: man bun + kaus hitam + celemek kanvas bertali kulit + tato lengan + latte + boots', top: 'kafe' },
  santai: { name: 'Santai: kemeja flanel merah + jeans + sneakers + tumbler', top: 'santai' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.kafe), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = bodyC(o), K = o.top === 'kafe';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'brSkin', shoulder: sl, elbow: K ? 'brSkin' : sl, hip: 'brJeans', knee: 'brJeans' }, SKEL, TAIL);
}
