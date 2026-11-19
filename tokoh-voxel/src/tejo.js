// Mas Tejo: penjaga pintu air di Kampung Bantaran, 30-an, badan tegap, waspada tiap musim hujan
// ("Kalau hujan deras, jangan ke sini!"). Jaga: jas hujan kuning stabilo bertudung + garis reflektor + celana hujan hitam +
// sepatu bot karet setinggi lutut + HT berantena + kunci putar pintu air dari besi. Santai: kaus oblong biru pudar +
// celana pendek kargo + sandal jepit + HT di saku + segelas kopi hitam. Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  tjSkin: ['#80502e', '#905a34', '#a0663c', '#b07446'], tjSkinS: ['#7a4a2a'], tjHair: ['#141210', '#1c1916', '#26221e', '#302b26'], tjKumis: ['#221c18'],
  tjJas: ['#c8c41a', '#d6d424', '#e2e230', '#eeee44'], tjJasS: ['#9e9a10'], tjRefl: ['#cfd4d8'],
  tjCelana: ['#1c1c20', '#242428', '#2c2c30', '#36363a'], tjBot: ['#141414', '#1c1c1c', '#242424', '#2e2e2e'], tjBotS: ['#3a3a3a'],
  tjBesi: ['#5a5e64', '#666a70', '#72767c', '#80848a'], tjBesiS: ['#3e4246'], tjKarat: ['#8a4a24'],
  tjHT: ['#1a1a1c'], tjHTL: ['#e07a1a'], tjHTA: ['#2a2a2e'],
  tjKaus: ['#4a6a8a', '#547494', '#5e7e9e', '#6a8aaa'], tjKausS: ['#3a5672'],
  tjKargo: ['#5a5a3a', '#646444', '#6e6e4c', '#7a7a56'], tjKargoS: ['#46462c'], tjSandal: ['#2a5ab0'],
  tjGelas: ['#d8e6ea'], tjKopi: ['#2a1a10'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'tjSkinS', k: 'tjKumis' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, '....kkkkkk....', ...mouth, F0, F0, F0];   // alis z 11, kumis z 5, mulut z 4
const BROW = '..BBBB..BBBB..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0]),
  marah: F('...BBB..BBB...', EYE, ['....mmmmmm....', '...m......m...']),   // ada yang nekat main di bantaran
  teriak: F('..BBBB..BBBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....']),
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....']),
};
export const EXPRS = Object.keys(FACES);

const J = o => o.top === 'jaga';
const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'tjSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'tjSkin'); v.set(7, -1, 5, 'tjSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'tjSkin'); v.box(-1, y, 6, -1, y, 7, 'tjSkinS'); }
  if (J(o)) {   // tudung jas hujan: cangkang lonjong, muka terbuka
    for (let z = -1; z <= 20; z++) for (let x = -11; x <= 9; x++) for (let y = -11; y <= 10; y++) {
      const d = ((x + 1) / 9.6) ** 2 + ((y + 0.5) / 9.8) ** 2 + (Math.max(0, z - 10) / 10) ** 2;
      if (d <= 1 && d > 0.6 && !(x >= 2 && z >= 1 && z <= 15)) v.set(x, y, z, z <= 0 ? 'tjJasS' : 'tjJas');
    }
    for (let y = -9; y <= 8; y++) for (let z = 1; z <= 16; z++) { const x = v.front(y, z); if (x !== null && x >= 7 && (Math.abs(y + 0.5) >= 7.5 || z === 16)) v.set(x, y, z, 'tjJasS'); }   // pinggir tudung
    return v;
  }
  const hair = new Vox();   // cepak rapi
  for (let z = 8; z <= 16; z++) hair.rrect(z, -8, -8, 7, 7, 'tjHair', 4);
  hair.rrect(17, -6, -6, 5, 5, 'tjHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 15 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 11 : 8)) v.set(x, y, z, c); });
  return v;
}

function chest(o) {
  const v = new Vox(), c = J(o) ? 'tjJas' : 'tjKaus', s = J(o) ? 'tjJasS' : 'tjKausS';
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0, g = J(o) ? 1 : 0; v.rrect(z, -6 - g, -9 + w + t - g, 5 - t + g, 8 - w - t + g, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'tjSkin', 2);
  if (J(o)) {
    for (let z = 55; z <= 59; z++) v.shell(z, -5, -6, 4, 5, 'tjJasS', 2);   // kerah tinggi
    for (let z = 36; z <= 56; z++) v.pf(-1, z, 'tjJasS');   // kancing jepret
    for (let z = 38; z <= 54; z += 4) v.pf(0, z, 'tjBesiS');
    for (const z of [41, 42, 47, 48]) for (let y = -10; y <= 9; y++) {   // dua garis reflektor keliling badan
      const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf, y, z, 'tjRefl'); if (xb !== null) v.set(xb, y, z, 'tjRefl');
    }
    for (const z of [41, 42, 47, 48]) for (let x = -8; x <= 7; x++) for (let y = -11; y <= 10; y++) if (v.has(x, y, z) && (!v.has(x, y - 1, z) || !v.has(x, y + 1, z))) v.set(x, y, z, 'tjRefl');
  } else {
    v.shell(56, -4, -5, 3, 4, s, 2);   // kerah kaus
    for (let y = -9; y <= 8; y++) for (const z of [34, 35]) { const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf, y, z, s); if (xb !== null) v.set(xb, y, z, s); }
    for (let z = 46; z <= 50; z++) for (let y = 3; y <= 6; y++) v.pf(y, z, 'tjKausS');   // saku dada
  }
  return v;
}
function pelvis(o) {
  const v = new Vox(), c = J(o) ? 'tjCelana' : 'tjKargo';
  v.rbox(-5, -8, 28, 4, 7, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (J(o)) for (let z = 25; z <= 34; z++) v.shell(z, -8, -11, 7, 10, z === 25 ? 'tjJasS' : 'tjJas', 3);   // jas hujan sampai pinggul
  else {
    for (let y = -8; y <= 7; y++) { const x = v.front(y, 33); if (x !== null) v.set(x, y, 33, 'tjKargoS'); }
    v.box(-1, -10, 25, 1, -9, 32, 'tjHT'); v.set(1, -10, 30, 'tjHTL'); for (let z = 33; z <= 38; z++) v.set(0, -10, z, 'tjHTA');   // HT dijepit di pinggang kiri
  }
  return v;
}
function arm(o) {
  const v = new Vox();
  if (J(o)) { v.rbox(-4, 7, 43, 3, 14, 55, 'tjJas', 2); v.rrect(56, -4, 7, 3, 14, 'tjJas', 3); v.paint(-4, 7, 49, 3, 14, 50, 'tjRefl'); return v; }
  v.rbox(-3, 8, 43, 2, 13, 55, 'tjSkin', 2); v.rrect(56, -3, 8, 2, 13, 'tjKaus', 3); v.paint(-3, 8, 48, 2, 13, 56, 'tjKaus'); v.paint(-3, 8, 48, 2, 13, 48, 'tjKausS');
  return v;
}
function fore(o, side) {
  const v = new Vox();
  if (J(o)) { v.rbox(-4, 7, 31, 3, 14, 42, 'tjJas', 2); v.paint(-4, 7, 31, 3, 14, 32, 'tjJasS'); v.paint(-4, 7, 37, 3, 14, 38, 'tjRefl'); }
  else v.rbox(-3, 8, 31, 2, 13, 42, 'tjSkin', 2);
  v.rbox(-3, 8, 27, 3, 13, 30, 'tjSkin', 2); v.rrect(26, -2, 9, 2, 12, 'tjSkin', 2);
  if (J(o) && side > 0) {   // kunci putar pintu air: batang besi berpegangan T, ujung bawah lubang kotak
    v.box(4, 10, 6, 5, 11, 36, 'tjBesi'); for (let z = 8; z <= 34; z += 5) v.set(5, 10, z, 'tjBesiS');
    v.box(4, 4, 37, 5, 17, 38, 'tjBesi'); v.box(4, 4, 37, 5, 5, 38, 'tjBesiS'); v.box(4, 16, 37, 5, 17, 38, 'tjBesiS');
    v.rbox(3, 9, 2, 6, 12, 6, 'tjBesiS', 1); v.set(6, 10, 3, 'tjKarat'); v.set(6, 11, 5, 'tjKarat');
  }
  if (J(o) && side < 0) {   // HT berantena
    v.box(3, 9, 23, 5, 12, 31, 'tjHT'); v.box(6, 10, 26, 6, 11, 29, 'tjHTL'); v.set(6, 10, 24, 'tjHTL');
    for (let z = 32; z <= 40; z++) v.set(4, 12, z, 'tjHTA'); v.set(4, 11, 32, 'tjHTL');
  }
  if (!J(o) && side > 0) {   // gelas kopi hitam
    v.rbox(3, 9, 24, 6, 12, 31, 'tjGelas', 1); v.box(4, 9, 25, 6, 12, 30, 'tjKopi'); v.rrect(31, 4, 10, 5, 11, 'tjKopi', 0);
  }
  return v;
}
function thigh(o) {
  const v = new Vox(), c = J(o) ? 'tjCelana' : 'tjKargo';
  v.rbox(-4, 2, 18, 3, 8, 31, c, 3); v.rrect(32, -3, 2, 2, 8, c, 3);
  if (!J(o)) { v.paint(-4, 2, 18, 3, 8, 20, 'tjSkin'); v.shell(21, -5, 1, 4, 9, 'tjKargoS', 3); v.shell(22, -5, 1, 4, 9, c, 3);
    for (let z = 24; z <= 29; z++) for (let x = -2; x <= 1; x++) v.set(x, 9, z, z === 29 ? 'tjKargoS' : c); }   // saku samping kargo
  return v;
}
function shin(o) {
  const v = new Vox();
  if (J(o)) {   // bot karet setinggi lutut
    v.rbox(-4, 2, 6, 3, 8, 18, 'tjCelana', 3); v.rrect(19, -3, 2, 2, 8, 'tjCelana', 3);
    for (let z = 6; z <= 17; z++) v.shell(z, -5, 1, 4, 9, z === 17 ? 'tjBotS' : 'tjBot', 3);
    return v;
  }
  v.rbox(-4, 2, 6, 3, 8, 18, 'tjSkin', 3); v.rrect(19, -3, 2, 2, 8, 'tjSkin', 3);
  return v;
}
function foot(o) {
  const v = new Vox();
  if (J(o)) { v.rbox(-5, 1, 0, 7, 8, 1, 'tjBotS', 3); v.rbox(-5, 1, 2, 7, 8, 4, 'tjBot', 3); v.rbox(-5, 1, 5, 4, 8, 6, 'tjBot', 3); return v; }
  v.rbox(-4, 1, 0, 7, 8, 0, 'tjSandal', 3); v.rbox(-3, 2, 1, 6, 7, 2, 'tjSkin', 3); v.rbox(-3, 2, 3, 2, 7, 6, 'tjSkin', 3);
  for (const [x, y] of [[5, 5], [4, 4], [4, 6], [3, 3], [3, 7]]) v.set(x, y, 2, 'tjSandal');
  return v;
}

export const OUTFITS = {
  jaga: { name: 'Jaga pintu air: jas hujan kuning bertudung + garis reflektor + celana hujan + bot karet + HT + kunci putar besi', top: 'jaga' },
  santai: { name: 'Santai: kaus oblong biru pudar + HT di saku + celana pendek kargo + sandal jepit + kopi hitam', top: 'santai' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.jaga), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), jg = J(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'tjSkin', shoulder: jg ? 'tjJas' : 'tjKaus', elbow: jg ? 'tjJas' : 'tjSkin', hip: jg ? 'tjCelana' : 'tjKargo', knee: jg ? 'tjBot' : 'tjSkin' }, SKEL, TAIL);
}
