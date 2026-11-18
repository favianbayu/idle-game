// Pak Tarno: tukang parkir di depan deretan ruko Pusat Kota, 50-an, kurus, kulit legam terbakar matahari, kumis tipis beruban
// ("Priiit! Kiri, kiri, terus!"). Parkir: topi biru lusuh + rompi oranye bergaris reflektor dengan rambu P di punggung + kaus
// garis + handuk "good morning" di bahu + peluit bertali + segepok karcis + celana bahan abu + sandal jepit.
// Ngaso: kaus oblong putih + celana pendek + handuk di leher + segelas kopi hitam. Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  trSkin: ['#6e4426', '#7e4e2c', '#8e5a34', '#9e663c'], trSkinS: ['#6a3e22'], trHair: ['#1a1816', '#24201e', '#302b28', '#3c3632'], trUban: ['#9a968e'], trKumis: ['#5a5650'],
  trTopi: ['#2a4a7a', '#34568a', '#3e629a', '#4a70aa'], trTopiS: ['#1e3860'],
  trRompi: ['#e05a10', '#ec6a1a', '#f47a26', '#fa8a36'], trRompiS: ['#b8460a'], trRefl: ['#d8dce0'], trRambu: ['#1a4ab0'], trRambuP: ['#f4f6f8'],
  trKaus: ['#3a4a3a', '#445444', '#4e5e4e', '#5a6a5a'], trKausS: ['#b8b4a8'],
  trHanduk: ['#e8e6e0', '#f0eee8', '#f6f4f0', '#fcfbf8'], trHandukS: ['#c83030'],
  trCelana: ['#5a5a5c', '#646466', '#6e6e70', '#7a7a7c'], trCelanaS: ['#3e3e40'],
  trPeluit: ['#c8ccd4'], trTali: ['#2a2a2e'], trKarcis: ['#f0e0a0'], trKarcisS: ['#c84040'],
  trPutih: ['#d8d6d0', '#e4e2dc', '#eeece6', '#f8f6f0'], trPendek: ['#2a3a5a', '#344466', '#3e4e72', '#4a5a80'],
  trSandal: ['#1a1a1c', '#222224', '#2c2c2e', '#38383a'], trGelas: ['#c8d8e0'], trKopi: ['#2a1608'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'trSkinS', k: 'trKumis' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, '.....kkkk.....', ...mouth, F0, F0];   // alis z 11, kumis z 5, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0, F0]),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', '...m......m...', F0]),   // motor nggak bayar
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['.....mTTm.....', '.....mttm.....', '......mm......']),   // "Priiit!"
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', F0]),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];   // pipi tirus
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'trSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'trSkin'); v.set(7, -1, 5, 'trSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'trSkin'); v.box(-1, y, 6, -1, y, 7, 'trSkinS'); }
  for (const y of [-5, 4]) v.set(6, y, 8, 'trSkinS');   // kerut mata
  const hair = new Vox();   // pendek, uban di samping
  for (let z = 7; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'trHair', 4);
  hair.rrect(16, -6, -6, 5, 5, 'trHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 10 : 7)) v.set(x, y, z, Math.abs(y + 0.5) > 6.5 && z <= 12 && x >= -2 ? 'trUban' : c); });
  // topi baseball biru lusuh, pet agak turun
  for (let z = 13; z <= 19; z++) for (let x = -9; x <= 8; x++) for (let y = -9; y <= 8; y++) {
    const d = ((x + 0.5) / 8.7) ** 2 + ((y + 0.5) / 8.6) ** 2 + (Math.max(0, z - 14) / 5.5) ** 2;
    if (d <= 1 && (d > 0.6 || z >= 18)) v.set(x, y, z, z === 13 ? 'trTopiS' : (x * 3 + y + z * 5) % 11 === 0 ? 'trTopiS' : 'trTopi');
  }
  for (let x = 8; x <= 13; x++) for (let y = -6; y <= 5; y++) if (Math.abs(y + 0.5) <= 6 - Math.max(0, x - 11) * 2) v.set(x, y, x >= 12 ? 12 : 13, 'trTopiS');
  v.set(0, -1, 20, 'trTopiS'); v.set(0, 0, 20, 'trTopiS');
  return v;
}

const P_ = o => o.top === 'parkir';
function towel(v, side) {   // handuk "good morning" tersampir di bahu (side -1 kiri) / melingkar leher
  for (let z = 44; z <= 57; z++) for (let y = -8; y <= -4; y++) {
    const xf = v.front(y, z), xb = v.back(y, z), c = z === 47 || z === 48 ? 'trHandukS' : 'trHanduk';
    if (xf !== null) v.set(xf + 1, y, z, c); if (xb !== null && z >= 48) v.set(xb - 1, y, z, c);
  }
  for (let x = -6; x <= 5; x++) for (let y = -8; y <= -4; y++) v.set(x, y, 58, 'trHanduk');
}
function chest(o) {
  const v = new Vox(), c = P_(o) ? 'trKaus' : 'trPutih';
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -8 + w + t, 4 - t, 7 - w - t, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'trSkin', 2);
  for (let y = -3; y <= 2; y++) v.pf(y, 56, 'trSkin');
  if (P_(o)) {
    for (let z = 35; z <= 55; z += 3) for (let y = -8; y <= 7; y++) { const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf, y, z, 'trKausS'); if (xb !== null) v.set(xb, y, z, 'trKausS'); }   // kaus garis
    // rompi oranye terbuka di tengah, dua garis reflektor; rambu P biru di punggung
    for (let z = 35; z <= 55; z++) for (let y = -9; y <= 8; y++) { if (Math.abs(y + 0.5) < 2.5 && z > 44) continue; const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf + 1, y, z, 'trRompi'); if (xb !== null) v.set(xb - 1, y, z, 'trRompi'); }
    for (const z of [38, 49]) for (let y = -9; y <= 8; y++) { const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null && v.get(xf, y, z) === 'trRompi') v.set(xf, y, z, 'trRefl'); if (xb !== null) v.set(xb, y, z, 'trRefl'); }
    for (let z = 40; z <= 49; z++) for (let y = -5; y <= 4; y++) { const x = v.back(y, z); if (x !== null) v.set(x, y, z, 'trRambu'); }
    for (const [r, row] of ['XXXX', 'X..X', 'X..X', 'XXXX', 'X...', 'X...'].entries()) [...row].forEach((ch, k) => { if (ch === 'X') { const y = 1 - k, z = 47 - r, x = v.back(y, z); v.set(x, y, z, 'trRambuP'); } });
    for (let z = 45; z <= 55; z++) { const y = 3 - Math.round((55 - z) * 0.3), x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'trTali'); }   // tali peluit
    { const x = v.front(1, 44); v.box(x + 1, 0, 43, x + 1, 1, 44, 'trPeluit'); }
  }
  towel(v, -1);
  return v;
}
function pelvis(o) {
  const v = new Vox(), c = P_(o) ? 'trCelana' : 'trPendek';
  v.rbox(-5, -8, 28, 4, 7, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  v.shell(33, -6, -9, 5, 8, 'trTali', 3);
  if (P_(o)) for (let z = 31; z <= 34; z++) v.shell(z, -6, -9, 5, 8, 'trRompi', 3);
  return v;
}
function arm(o) { const v = new Vox(), c = P_(o) ? 'trKaus' : 'trPutih'; v.rbox(-3, 8, 43, 2, 13, 55, 'trSkin', 2); v.rrect(56, -3, 8, 2, 13, c, 3); v.paint(-3, 8, 48, 2, 13, 56, c); if (P_(o)) v.paint(-3, 8, 51, 2, 13, 51, 'trKausS'); return v; }
function fore(o, side) {
  const v = new Vox();
  v.rbox(-3, 8, 31, 2, 13, 42, 'trSkin', 2);
  v.rbox(-3, 8, 27, 3, 13, 30, 'trSkin', 2); v.rrect(26, -2, 9, 2, 12, 'trSkin', 2);
  if (side < 0 && P_(o)) {   // segepok karcis parkir & uang receh
    v.rbox(2, 8, 24, 6, 13, 29, 'trKarcis', 1); for (let y = 8; y <= 13; y++) v.set(6, y, 27, 'trKarcisS');
    for (let z = 24; z <= 29; z += 2) v.set(6, 10, z, 'trKarcisS');
  }
  if (side > 0 && !P_(o)) {   // gelas kopi hitam
    v.rbox(3, 9, 24, 6, 12, 31, 'trGelas', 1); v.rrect(31, 4, 10, 5, 11, 'trKopi', 0); v.box(4, 9, 25, 6, 12, 29, 'trKopi');
    v.rbox(3, 9, 24, 6, 12, 24, 'trGelas', 1);
  }
  return v;
}
function thigh(o) { const v = new Vox(), c = P_(o) ? 'trCelana' : 'trPendek'; v.rbox(-4, 2, 18, 3, 8, 31, c, 3); v.rrect(32, -3, 2, 2, 8, c, 3); if (!P_(o)) { v.paint(-4, 2, 18, 3, 8, 21, 'trSkin'); v.shell(22, -5, 1, 4, 9, c, 3); } return v; }
function shin(o) { const v = new Vox(), c = P_(o) ? 'trCelana' : 'trSkin'; v.rbox(-4, 2, 6, 3, 8, 18, c, 3); v.rrect(19, -3, 2, 2, 8, c, 3); if (P_(o)) for (let z = 7; z <= 18; z++) v.pf(5, z, 'trCelanaS'); return v; }
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 0, 'trSandal', 3); v.rbox(-3, 2, 1, 6, 7, 2, 'trSkin', 3); v.rbox(-3, 2, 3, 2, 7, 6, 'trSkin', 3);
  for (const [x, y] of [[5, 5], [4, 4], [4, 6], [3, 3], [3, 7]]) v.set(x, y, 2, 'trSandal');
  return v;
}

export const OUTFITS = {
  parkir: { name: 'Jaga parkir: topi biru + rompi oranye rambu P + kaus garis + handuk di bahu + peluit + karcis + celana abu + sandal jepit', top: 'parkir' },
  ngaso: { name: 'Ngaso: kaus oblong putih + celana pendek + handuk + segelas kopi hitam', top: 'ngaso' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.parkir), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), c = P_(o) ? 'trKaus' : 'trPutih', cl = P_(o) ? 'trCelana' : 'trPendek';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'trSkin', shoulder: c, elbow: 'trSkin', hip: cl, knee: P_(o) ? cl : 'trSkin' }, SKEL, TAIL);
}
