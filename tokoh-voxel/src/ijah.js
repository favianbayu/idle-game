// Mak Ijah: penjual kue subuh di pasar subuh Bantaran, 60-an, bungkuk sedikit, suara nyaring, suka kasih bonus ke anak
// sekolah ("Kue lupis, kue lapis!"). Kulit sawo matang keriput, rambut putih digelung kecil, gigi tinggal sedikit.
// Jualan: kerudung selendang batik longgar + kebaya lusuh cokelat muda + jarik + tampah bambu di atas kepala berisi
// kue lupis, lapis, klepon + sandal jepit. Ngaso: tanpa tampah, selendang di bahu, termos teh di tangan.
// Rangka keluarga Nadia, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  ijSkin: ['#86563a', '#966242', '#a6704c', '#b47e58'], ijSkinS: ['#7e5034'], ijHair: ['#c8c4bc', '#d4d0c8', '#deDad2', '#e8e4dc'],
  ijSelendang: ['#5a3a6a', '#664476', '#724e82', '#7e5a8e'], ijSelendangS: ['#40284e'], ijSelendangK: ['#e0c070'],
  ijKebaya: ['#b89a70', '#c4a67a', '#d0b286', '#dabe92'], ijKebayaS: ['#957a54'],
  ijJarik: ['#3a2a1a', '#463220', '#523a26', '#5e442c'], ijJarikS: ['#241a10'], ijJarikK: ['#c8a868'],
  ijTampah: ['#c8a868', '#d4b474', '#dec080', '#e8cc8e'], ijTampahS: ['#a8884a'], ijDaun: ['#4a8a3a', '#54963e', '#5ea248', '#6aae52'],
  ijLupis: ['#e8e4d0'], ijKelapa: ['#f8f6f0'], ijLapis1: ['#d83a6a'], ijLapis2: ['#f0e0c8'], ijKlepon: ['#3aa84a'], ijGula: ['#6a3a1a'],
  ijSandal: ['#3a8a5a', '#469666', '#52a272', '#5eae7e'], ijTermos: ['#c83a3a', '#d44444', '#e04e4e', '#ea5a5a'], ijTutup: ['#e8e8ea'],
});

const FCH = { B: 'ijHair', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'ijSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis putih z 11, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..sKK....KKs..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....smmmms....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['....smmmms....', F0, F0]),
  marah: F('...BB....BB...', ['..KKK....KKK..', '..WKK....KKW..'], ['....mmmmmm....', F0, F0]),
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mT..Tm....', '....mttttm....', '.....mmmm.....']),   // "Kue lupiiis!" gigi tinggal dua
  nyengir: F(BROW, EYE, ['....mT..Tm....', '.....mmmm.....', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mT..Tm....', '.....mttm.....', F0]),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '.....mmmm.....', F0]),   // encok
};
export const EXPRS = Object.keys(FACES);

const J = o => o.top === 'jualan';
const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const batik = (v, c, cS, cK, m = 5) => { v.each((x, y, z, k) => { if (k !== c) return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + z) % m + m) % m, b = ((u - z) % m + m) % m; if (a === 0 && b === 0) v.set(x, y, z, cK); else if ((a === 0 || b === 0) && (u + z) % 2 === 0) v.set(x, y, z, cS); }); return v; };
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'ijSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'ijSkin'); v.set(7, -1, 5, 'ijSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'ijSkin'); v.box(-1, y, 6, -1, y, 7, 'ijSkinS'); }
  for (const y of [-6, 5]) { v.set(6, y, 3, 'ijSkinS'); v.set(6, y, 7, 'ijSkinS'); }   // keriput
  for (const y of [-4, -2, 1, 3]) v.set(6, y, 13, 'ijSkinS');
  const hair = new Vox();   // putih disisir ke belakang + gelung kecil
  for (let z = 5; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'ijHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -6, -6, 5, 5, 'ijHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 5)) v.set(x, y, z, c); });
  if (!J(o)) for (let x = -12; x <= -8; x++) for (let y = -3; y <= 2; y++) for (let z = 6; z <= 11; z++) { const d = ((x + 10) / 2.6) ** 2 + ((y + 0.5) / 3.2) ** 2 + ((z - 8.5) / 2.8) ** 2; if (d <= 1 && !v.has(x, y, z)) v.set(x, y, z, 'ijHair'); }
  if (J(o)) {
    // selendang batik ungu disampirkan longgar di kepala, jatuh ke bahu
    const h = new Vox();
    for (let z = -2; z <= 17; z++) h.rrect(z, -10, -10, 6, 9, 'ijSelendang', z <= 13 ? 4 : 5);
    h.each((x, y, z, k) => { if (v.has(x, y, z)) return; if (x >= 1 && z <= 13) return; if (z <= 4 && x >= -2 && Math.abs(y + 0.5) < 9) return; v.set(x, y, z, k); });
    batik(v, 'ijSelendang', 'ijSelendangS', 'ijSelendangK', 6);
    // tampah bambu bundar di atas kepala, beralas daun pisang, kue berjajar
    for (let x = -13; x <= 12; x++) for (let y = -13; y <= 12; y++) { const d = Math.hypot(x + 0.5, y + 0.5); if (d <= 12.6) { v.set(x, y, 19, d > 11.4 ? 'ijTampahS' : (x + y) % 2 ? 'ijTampah' : 'ijTampahS'); if (d > 11.4) v.set(x, y, 20, 'ijTampah'); else if (d <= 11) v.set(x, y, 20, 'ijDaun'); } }
    const kue = (cx, cy, c, top) => { for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy - 1; y <= cy + 1; y++) { v.set(x, y, 21, c); v.set(x, y, 22, top || c); } };
    [[-6, -5], [-6, 0], [-6, 5]].forEach(([x, y]) => kue(x, y, 'ijLupis', 'ijGula'));
    [[0, -6], [0, -1], [0, 4]].forEach(([x, y], i) => { for (let xx = x - 1; xx <= x + 1; xx++) for (let yy = y - 1; yy <= y + 1; yy++) for (let z = 21; z <= 23; z++) v.set(xx, yy, z, z % 2 ? 'ijLapis1' : 'ijLapis2'); });
    [[6, -4], [6, 1], [5, 6]].forEach(([x, y]) => kue(x, y, 'ijKlepon', 'ijKelapa'));
  }
  return v;
}

function chest(o) {
  const v = new Vox(), c = 'ijKebaya';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0; v.rrect(z, -5, -7 + t, 4 - t, 6 - t, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'ijSkin', 1);
  for (let z = 33; z <= 49; z++) for (const y of [-1, 0]) v.pf(y, z, 'ijKebayaS');
  for (const z of [36, 41, 46]) v.pf(-2, z, 'ijTutup');
  for (let z = 32; z <= 49; z += 4) for (let y = -6; y <= 5; y += 3) v.pf(y, z, 'ijKebayaS');   // tambalan pudar
  if (J(o)) {   // ujung selendang jatuh di punggung
    for (let z = 38; z <= 50; z++) for (let y = -6; y <= 5; y++) { const x = v.back(y, z); if (x !== null && Math.abs(y + 0.5) <= 3 + (50 - z) * 0.2) v.set(x - 1, y, z, 'ijSelendang'); }
  } else {   // selendang disampirkan di bahu, ujung di depan
    for (let z = 49; z <= 52; z++) v.shell(z, -6, -8, 5, 7, 'ijSelendang', 3);
    for (let z = 36; z <= 49; z++) for (const y of [-6, -5, -4, 3, 4, 5]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'ijSelendang'); }
  }
  return batik(v, 'ijSelendang', 'ijSelendangS', 'ijSelendangK', 6);
}
const jarik = v => batik(v, 'ijJarik', 'ijJarikS', 'ijJarikK', 5);
function pelvis() { const v = jarik(skirtPelvis('ijJarik', 'ijJarikS', 20)); for (let z = 27; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 27 ? 'ijKebayaS' : 'ijKebaya', 3); return v; }
function arm(o) { const v = new Vox(); v.rbox(-2, 6, 40, 2, 10, 50, 'ijKebaya', 2); v.rrect(51, -2, 6, 2, 10, 'ijKebaya', 2); if (J(o)) v.paint(-2, 6, 46, 2, 10, 51, 'ijSelendang'); return batik(v, 'ijSelendang', 'ijSelendangS', 'ijSelendangK', 6); }
function fore(o, side) {
  const v = new Vox();
  v.rbox(-2, 6, 31, 2, 10, 39, 'ijKebaya', 2); v.paint(-2, 6, 31, 2, 10, 31, 'ijKebayaS');
  v.rbox(-2, 6, 27, 3, 10, 30, 'ijSkin', 2); v.rrect(26, -1, 7, 2, 9, 'ijSkin', 1);
  if (!J(o) && side > 0) { for (let z = 14; z <= 28; z++) v.rrect(z, -2, 9, 3, 13, z >= 26 ? 'ijTutup' : 'ijTermos', 2); v.rbox(-1, 10, 29, 2, 12, 29, 'ijTutup', 1); }   // termos teh
  return v;
}
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 6, 6, 0, 'ijSandal', 2); v.rbox(-3, 2, 1, 5, 5, 2, 'ijSkin', 2); v.rbox(-3, 2, 3, 1, 5, 4, 'ijSkin', 2);
  for (const [x, y] of [[4, 4], [3, 3], [3, 5], [2, 2], [2, 6]]) v.set(x, y, 2, 'ijSandal');
  return v;
}

export const OUTFITS = {
  jualan: { name: 'Jualan subuh: selendang batik di kepala + kebaya lusuh + jarik + tampah kue di atas kepala (lupis, lapis, klepon) + sandal jepit', top: 'jualan' },
  ngaso: { name: 'Ngaso: rambut putih digelung + selendang di bahu + termos teh', top: 'ngaso' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.jualan), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = jarik(skirtThigh('ijJarik')), Sn = jarik(skirtShin('ijJarik', 'ijJarikS')), Ft = foot(o);
  const panel = s => { const p = jarik(skirtPanel('ijJarik', 'ijJarikS', s, 5)); if (s > 0) for (let z = 6; z <= 30; z++) { const x = p.front(-6, z); if (x !== null) p.set(x, -6, z, 'ijJarikK'); } return p; };
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'ijSkin', shoulder: 'ijKebaya', elbow: 'ijKebaya', hip: 'ijJarik', knee: 'ijJarik' }, SKEL, TAIL);
  P.skirt = skirtInfo(P, 'ijJarik', 'ijJarikS');
  return P;
}
