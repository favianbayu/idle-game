// Dimas Aditya: NPC utama cowok, kapten basket, paling tinggi seangkatan, anak tentara yang pemalu. Bahu lebar, kulit
// sawo matang, rambut cepak rapi dengan poni sedikit, wajah ramah, telinga gampang merah, deker hitam di lutut kiri.
// Rangka skala 1.38 (sama dengan Bram), voxel halus 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 15, thigh: 15.5, up: 4, neck: 24, shY: 10, shZ: 17, upper: 11, fore: 11.5, hipY: 4.5, flap: 6, ballR: 1.05 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  dSkin: ['#94603d', '#b07650', '#c98e66', '#dca57c'], dSkinS: ['#b07650'], dEar: ['#9a5e42', '#b87050', '#d08868', '#e09c7c'],
  dHair: ['#080607', '#100c0d', '#1a1415', '#28201f'], dHairF: ['#3a2e2c'],
  royal: ['#1c3a74', '#244a92', '#2f5fb3', '#4a7ad0'], royalW: ['#dfe6f2', '#eef2f8', '#fbfcfe', '#ffffff'], orange: ['#e07b39'],
  deker: ['#0e0d11', '#17161b', '#22212a', '#34333d'], digi: ['#0e0d11'], digiS: ['#7fd0a0'],
  loreng: ['#3a4a2a', '#4a5c34', '#5c7040', '#72874f'], lorengA: ['#2a3420'], lorengB: ['#7a7a52'],
  hoodie: ['#1f3a74', '#2a4b8f', '#365cab', '#4f77c6'], hoodieS: ['#24427f'],
  chino: ['#8a7658', '#a69171', '#c0ab8a', '#d6c4a4'], dShort: ['#1b1d24', '#252832', '#323642', '#454a58'],
});

/* ---------- wajah: mata ramah, alis tebal lurus, senyum lebar sopan */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'dSkinS' };
const F0 = '..............';
const F = (brow, eyes, mid, mouth) => [F0, F0, F0, ...brow, ...eyes, ...mid, ...mouth, F0, F0];
const MID = ['..............', '..............'];
export const FACES = {
  biasa: F(['..............', '.BBBB....BBBB.', '..............'], ['..KKK....KKK..', '..WKK....KKW..'], MID, ['....m....m....', '.....mmmm.....']),
  kedip: F(['..............', '.BBBB....BBBB.', '..............'], ['..............', '..KKK....KKK..'], MID, ['....m....m....', '.....mmmm.....']),
  marah: F(['..............', '..BBB....BBB..', '....BB..BB....'], ['..KKK....KKK..', '..WKK....KKW..'], MID, ['..............', '....mmmmmm....']),
  teriak: F(['..............', '..BBB....BBB..', '....BB..BB....'], ['..KKK....KKK..', '..WKK....KKW..'], ['..............', '....mmmmmm....'], ['....mTTTTm....', '.....mmmm.....']),
  nyengir: F(['.BBBB....BBBB.', '..............', '..............'], ['..KKK....KKK..', '..WKK....KKW..'], MID, ['...mTTTTTTm...', '....mmmmmm....']),
  ketawa: F(['.BBBB....BBBB.', '..............', '..............'], ['..............', '.KKKK....KKKK.'], MID, ['...mTTTTTTm...', '....mttttm....']),
  sakit: F(['...BB....BB...', '.BB........BB.', '..............'], ['.KK........KK.', '...KK....KK...'], MID, ['....mmmmmm....', '....TTTTTT....']),
};
export const EXPRS = Object.keys(FACES);

// muka kotak: rahang tegas selebar pelipis
const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'dSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 4, 7, 0, 6, 'dSkin'); v.set(7, -1, 3, 'dSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 9, 'dEar'); v.box(-1, y, 6, -1, y, 8, 'dSkinS'); }   // telinga kemerahan
  // rambut cepak anak tentara: satu lapis tipis di atas, samping dan belakang dipangkas tipis; poni pendek rapi
  const hair = new Vox();
  for (let z = 6; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'dHair', 4);
  hair.rrect(16, -7, -7, 6, 6, 'dHair', 4); hair.rrect(17, -5, -5, 4, 4, 'dHair', 3);
  const zmin = (x, y) => x >= 5 ? 12 : Math.abs(y + 0.5) > 6.5 ? (x >= -3 ? 10 : 7) : x <= -5 ? 6 : 0;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  // tepi pangkasan samping lebih terang (kulit kepala tembus)
  for (let x = -7; x <= 4; x++) for (const y of [-8, 7]) for (const z of [7, 8, 10]) if (v.get(x, y, z) === 'dHair') v.set(x, y, z, 'dHairF');
  for (const y of [-4, -3, 0, 1, 2]) v.set(8, y, 12, 'dHair');                                   // poni sedikit
  if (o.band) for (let z = 12; z <= 13; z++) for (let y = -9; y <= 8; y++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'royalW'); const b = v.back(y, z); if (b !== null) v.set(b, y, z, 'royalW'); }
  if (o.band) for (let x = -8; x <= 8; x++) for (let z = 12; z <= 13; z++) { const p = v.sideP(x, z), n = v.sideN(x, z); if (p !== null) v.set(x, p, z, 'royalW'); if (n !== null) v.set(x, n, z, 'royalW'); }
  return v;
}

const NUM11 = ['.X..X.', 'XX.XX.', '.X..X.', '.X..X.', '.X..X.', 'XXXXXX'];
function chest(o) {
  const v = new Vox(), J = o.top === 'jersey', R = o.top === 'loreng', H = o.top === 'hoodie';
  const body = J ? 'royal' : R ? 'loreng' : H ? 'hoodie' : 'white';
  for (let z = 37; z <= 58; z++) {   // dada bidang, bahu lebar
    const w = z <= 42 ? 1 : z <= 46 ? 0 : -1, t = z === 58 ? 1 : 0;
    v.rrect(z, -5, -8 + w + t, 5 - t, 7 - w - t, body, z >= 57 ? 4 : 3);
  }
  v.rbox(-3, -3, 59, 2, 2, 63, 'dSkin', 2);
  if (J) {   // jersey tanpa lengan: lubang lengan & leher V bergaris putih, nomor 11 di depan & belakang
    for (let z = 52; z <= 58; z++) for (const y of [-8, -7, 6, 7]) for (let x = -5; x <= 5; x++) if (v.get(x, y, z) === 'royal') v.set(x, y, z, z === 52 ? 'royalW' : null);
    for (const [y, z] of [[-1, 57], [0, 57], [-2, 58], [1, 58], [-1, 56], [0, 56]]) v.pf(y, z, 'dSkin');
    for (const [y, z] of [[-2, 57], [1, 57], [-1, 55], [0, 55], [-3, 58], [2, 58]]) v.pf(y, z, 'royalW');
    NUM11.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'X') { v.pf(c - 3, 52 - r, 'royalW'); v.pb(c - 3, 54 - r, 'royalW'); } }));
    for (let y = -7; y <= 6; y++) { v.pf(y, 37, 'royalW'); v.pb(y, 37, 'royalW'); }
    return v;
  }
  if (R) {   // kaus loreng bekas ayah: bercak acak dua warna
    v.each((x, y, z, c) => { const h = ((x * 7 + 3) * (y * 13 + 5) + z * 11) & 15; if (h < 3) v.set(x, y, z, 'lorengA'); else if (h > 13) v.set(x, y, z, 'lorengB'); });
    for (let y = -2; y <= 1; y++) v.pf(y, 58, 'dSkin');
    v.shell(59, -3, -4, 3, 3, 'loreng', 2);
    return v;
  }
  if (H) {   // hoodie biru polos: kantong kanguru, tali, tudung terlipat di punggung
    v.pfBox(-4, 39, 3, 43, 'hoodieS'); v.pfBox(-3, 40, 2, 42, 'hoodie');
    for (const y of [-2, 1]) for (let z = 50; z <= 56; z++) v.pf(y, z, 'royalW');
    for (let z = 52; z <= 61; z++) { const k = z >= 59 ? 1 : 0; for (let y = -5 + k; y <= 4 - k; y++) { const b = v.back(y, z); if (b !== null || z >= 59) v.set((b ?? -4) - 1, y, z, 'hoodie'); } }
    for (let z = 59; z <= 60; z++) v.shell(z, -4, -5, 3, 4, 'hoodie', 2);
    return v;
  }
  // seragam rapi dimasukkan: kancing sampai atas, saku, badge OSIS, papan nama
  for (let z = 37; z <= 56; z++) v.pf(0, z, 'whiteS');
  for (let y = 3; y <= 6; y++) v.pf(y, 52, 'whiteS');
  v.pfBox(4, 48, 5, 50, 'osis'); v.pfBox(-6, 52, -4, 52, 'tag');
  for (let z = 59; z <= 60; z++) v.shell(z, -4, -5, 3, 4, 'white', 2);
  for (const [y0, y1] of [[-5, -3], [2, 4]]) v.fillE(4, y0, 57, 5, y1, 58, 'white');
  for (let y = -7; y <= 6; y++) v.pb(y, 54, 'whiteS');
  return v;
}
function pelvis(o) {
  const v = new Vox(), S = o.bot === 'short', C = o.bot === 'chino', c = o.top === 'jersey' ? 'royal' : S ? 'dShort' : C ? 'chino' : 'pants';
  v.rbox(-5, -7, 30, 4, 6, 36, c, 3); v.box(-4, -2, 28, 3, 1, 29, c);
  if (o.top === 'jersey') { for (let z = 35; z <= 36; z++) v.shell(z, -6, -8, 5, 7, 'royal', 3); for (const s of [-1, 1]) v.psBox(s, -1, 28, 0, 36, 'royalW'); return v; }
  if (o.top === 'loreng') { for (let z = 34; z <= 36; z++) v.shell(z, -6, -8, 5, 7, 'loreng', 3); return v; }
  if (o.top === 'hoodie') { for (let z = 33; z <= 36; z++) v.shell(z, -6, -8, 5, 7, z === 33 ? 'hoodieS' : 'hoodie', 3); return v; }
  v.rbox(-5, -7, 34, 4, 6, 36, 'belt', 3); v.pfBox(-1, 34, 0, 36, 'buckle');
  return v;
}
function arm(o) {
  const v = new Vox(), J = o.top === 'jersey', H = o.top === 'hoodie', c = o.top === 'loreng' ? 'loreng' : H ? 'hoodie' : 'white';
  v.rbox(-3, 7, 46, 2, 12, 58, 'dSkin', 2); v.rrect(59, -3, 7, 2, 12, 'dSkin', 3);
  if (J) return v;
  v.paint(-3, 7, H ? 46 : 51, 2, 12, 59, c);
  if (!H) v.shell(51, -3, 7, 3, 13, c, 2);
  return v;
}
function fore(o, side) {
  const v = new Vox(), H = o.top === 'hoodie';
  v.rbox(-3, 7, 35, 2, 12, 46, H ? 'hoodie' : 'dSkin', 2);
  v.rbox(-3, 7, 30, 3, 12, 34, 'dSkin', 2); v.rrect(29, -2, 8, 2, 11, 'dSkin', 2);
  if (H) v.paint(-3, 7, 35, 2, 12, 36, 'hoodieS');
  else if (side < 0 && o.top !== 'jersey') { v.paint(-3, 7, 35, 2, 12, 37, 'digi'); v.pf(10, 36, 'digiS'); }   // jam digital hitam
  else if (o.top === 'jersey') v.paint(-3, 7, 35, 2, 12, 37, 'royalW');                              // gelang keringat
  return v;
}
function legC(o) { return o.top === 'jersey' ? 'royal' : o.bot === 'short' ? 'dShort' : o.bot === 'chino' ? 'chino' : 'pants'; }
function thigh(o) {
  const c = legC(o), v = new Vox(), S = o.top === 'jersey' || o.bot === 'short';
  v.rbox(-4, 1, 20, 3, 7, 34, c, 3); v.rrect(35, -3, 2, 2, 6, c, 2);
  if (S) { v.paint(-4, 1, 20, 3, 7, 23, 'dSkin'); for (let z = 24; z <= 25; z++) v.shell(z, -5, 0, 4, 8, c, 3); }   // celana selutut
  if (o.top === 'jersey') v.psBox(1, -1, 26, 0, 35, 'royalW');
  return v;
}
function shin(o, left) {
  const c = legC(o), v = new Vox(), S = o.top === 'jersey' || o.bot === 'short';
  v.rbox(-4, 1, 7, 3, 7, 20, S ? 'dSkin' : c, 3); v.rrect(21, -3, 2, 2, 6, S ? 'dSkin' : c, 2);
  if (left && S) for (let z = 16; z <= 21; z++) v.shell(z, -5, 0, 4, 8, 'deker', 3);   // deker lutut kiri (cedera lama)
  if (o.top === 'jersey') for (let z = 7; z <= 11; z++) v.shell(z, -5, 0, 4, 8, 'royalW', 3);   // kaus kaki tinggi
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'loreng') { v.rbox(-5, 1, 0, 8, 7, 1, 'sandal', 3); v.rbox(-4, 2, 2, 7, 6, 3, 'dSkin', 2); v.rbox(-4, 2, 4, 2, 6, 6, 'dSkin', 2); for (const [x, y] of [[5, 4], [4, 2], [4, 6]]) v.set(x, y, 4, 'shoeK'); return v; }
  // sneakers putih bersih (basket: high-top putih-biru)
  const J = o.top === 'jersey';
  v.rbox(-5, 1, 0, 8, 7, 1, J ? 'royal' : 'sole', 3); v.rbox(-5, 1, 2, 8, 7, 4, 'kick', 3); v.rbox(-5, 1, 5, 2, 7, J ? 9 : 7, 'kick', 3);
  if (J) for (const y of [1, 7]) v.paint(-3, y, 3, 4, y, 5, 'royal');
  for (const x of [2, 4, 6]) v.paint(x, 2, 4, x, 6, 4, 'lace');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam rapi dimasukkan', top: 'kemeja' },
  basket: { name: 'Jersey basket #11 + headband', top: 'jersey', band: true },
  jalan: { name: 'Hoodie biru + chino', top: 'hoodie', bot: 'chino' },
  rumah: { name: 'Kaus loreng + celana pendek', top: 'loreng', bot: 'short' },
};
export function build(opt = {}) {
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Ft = foot(o);
  const top = o.top === 'jersey' ? 'dSkin' : o.top === 'loreng' ? 'loreng' : o.top === 'hoodie' ? 'hoodie' : 'white';
  const knee = o.top === 'jersey' || o.bot === 'short' ? 'dSkin' : legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', shin(o, false), PV.shinR], ['shinL', shin(o, true).mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'dSkin', shoulder: top, elbow: o.top === 'hoodie' ? 'hoodie' : 'dSkin', hip: legC(o), knee }, SKEL, TAIL);
}
