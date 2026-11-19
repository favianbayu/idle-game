// Bu Lastri: penjual jamu gendong yang keliling alun-alun Pusat Kota, 50-an, ramah, manggil semua orang "Nak"
// ("Jamu, Nak? Kunyit asam biar seger."). Kulit sawo matang, rambut disanggul dengan uban di pelipis, garis senyum.
// Keliling: kebaya kutubaru kuning kunyit + jarik cokelat + selendang lurik + bakul jamu di punggung berisi botol-botol
// + gelas jamu di tangan + sandal jepit. Meracik: daster batik hijau + celemek + cobek & ulekan. Rangka keluarga Nadia.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  lsSkin: ['#94603a', '#a86e44', '#ba7e50', '#ca8e5e'], lsSkinS: ['#8a5634'], lsBlush: ['#c87a62'],
  lsHair: ['#16120e', '#1e1814', '#2a221c', '#362c24'], lsHairT: ['#40342a'], lsUban: ['#a8a29a'], lsTusuk: ['#d8b040'],
  lsKeb: ['#c8901e', '#d8a02a', '#e6b038', '#f0c04a'], lsKebS: ['#a87010'], lsKebT: ['#f8e0a0'], lsBros: ['#e8e0c8'],
  lsJarik: ['#3a2410', '#4a2e16', '#5a381c', '#6c4424'], lsJarikS: ['#24160a'], lsJarikK: ['#c8a060'],
  lsLurik: ['#7a2a1a', '#8a3420', '#9a3e28', '#ac4a30'], lsLurikS: ['#e0c890'],
  lsBakul: ['#9a6a30', '#aa783a', '#ba8844', '#ca9850'], lsBakulS: ['#6e4a1c'],
  lsBotol: ['#d8e8e0', '#e4f0ea', '#eef6f2', '#f8fcfa'], lsKunyit: ['#e8a018'], lsBeras: ['#e8dcb0'], lsPahit: ['#4a5a20'], lsTutup: ['#c83020'],
  lsGelas: ['#d0e0e8'], lsSandal: ['#2a5aa8', '#3466b8', '#3e72c6', '#4a80d4'],
  lsDaster: ['#2a7a5a', '#348a66', '#3e9a72', '#4aac80'], lsDasterS: ['#1a5a40'], lsDasterK: ['#e8d070'],
  lsCelemek: ['#e8e0d0', '#f0eadc', '#f6f2e8', '#fcfaf4'], lsCelemekS: ['#d8a030'],
  lsCobek: ['#4a4644', '#55514e', '#625e5a', '#706b66'], lsUlek: ['#3a3634'], lsBumbu: ['#e89a20'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'lsBlush', s: 'lsSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0, F0]),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', F0, F0]),
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),   // "Jamuuu!"
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....', 'rr..........rr']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', 'rr..........rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),   // pegal gendong bakul
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'lsSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'lsSkin'); v.set(7, -1, 5, 'lsSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'lsSkin'); v.box(-1, y, 6, -1, y, 7, 'lsSkinS'); }
  // rambut disisir rapi ke belakang, belah tengah, uban di pelipis; sanggul bulat di belakang dengan tusuk konde
  const hair = new Vox();
  for (let z = 5; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'lsHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -6, -6, 5, 5, 'lsHair', 4);
  const zmin = (x, y) => x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 5;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (const y of [-1, 0]) { const x = v.front(y, 14); if (x !== null) v.set(x, y, 14, 'lsSkinS'); }   // belahan tengah
  for (const y of [-8, 7]) for (let z = 9; z <= 12; z++) for (let x = -1; x <= 4; x++) if (v.get(x, y + (y > 0 ? 1 : -1), z) === 'lsHair' && (x + z) % 2 === 0) v.set(x, y + (y > 0 ? 1 : -1), z, 'lsUban');
  for (let x = 2; x <= 5; x++) for (const y of [-6, 5]) { const z = 15; if (v.get(x, y, z) === 'lsHair' && x % 2 === 0) v.set(x, y, z, 'lsUban'); }
  const bun = new Vox();
  for (let z = 7; z <= 15; z++) { const r = Math.round(5 - Math.abs(z - 11) * 0.8); bun.rrect(z, -14, -r - 1, -8, r, 'lsHair', 3); }
  bun.each((x, y, z, c) => { if (!v.has(x, y, z)) v.set(x, y, z, (y + z) % 4 === 0 && x <= -12 ? 'lsHairT' : c); });
  for (let y = -7; y <= 6; y++) v.set(-12, y, 13, 'lsTusuk');   // tusuk konde menyilang sanggul
  v.set(-12, -8, 14, 'lsTusuk'); v.set(-12, 7, 14, 'lsTusuk');
  for (const y of [-9, 8]) { v.set(-1, y, 4, 'lsTusuk'); v.set(-1, y, 3, 'lsTusuk'); }   // anting emas
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
const K = o => o.top === 'keliling';
const batik = (v, c, cS, cK) => { v.each((x, y, z, k) => { if (k !== c) return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + z) % 6 + 6) % 6, b = ((u - z) % 6 + 6) % 6; if (a === 0 && b === 0) v.set(x, y, z, cK); else if ((a === 0 || b === 0) && (u + z) % 2 === 0) v.set(x, y, z, cS); }); return v; };
const jarik = v => batik(v, 'lsJarik', 'lsJarikS', 'lsJarikK');
const daster = v => batik(v, 'lsDaster', 'lsDasterS', 'lsDasterK');
const kain = (o, v) => K(o) ? jarik(v) : daster(v);
const cK = o => K(o) ? 'lsJarik' : 'lsDaster', cKS = o => K(o) ? 'lsJarikS' : 'lsDasterS';
function chest(o) {
  const v = new Vox(), c = K(o) ? 'lsKeb' : 'lsDaster';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -5, -7 + t + w, 4 - t, 6 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'lsSkin', 1);
  for (let y = -3; y <= 2; y++) v.pf(y, 51, 'lsSkin');
  if (K(o)) {
    for (let z = 33; z <= 50; z++) for (let y = -2; y <= 1; y++) v.pf(y, z, 'lsKebT');   // bef kutubaru
    for (let z = 33; z <= 50; z++) for (const y of [-3, 2]) v.pf(y, z, 'lsKebS');
    for (const z of [47, 43, 39]) { v.pf(-1, z, 'lsBros'); v.pf(0, z, 'lsBros'); }   // peniti bros
    for (let z = 32; z <= 50; z += 3) for (let y = -6; y <= 5; y += 4) if (Math.abs(y + 0.5) > 3) v.pf(y, z, 'lsKebT');   // motif renda
    // selendang lurik menyilang dari bahu kanan ke pinggang kiri, menahan bakul di punggung
    const strap = (x, y, z) => v.set(x, y, z, (z % 3 === 0) ? 'lsLurikS' : 'lsLurik');
    for (let z = 33; z <= 51; z++) { const yc = Math.round(5 - (51 - z) * 11 / 18); for (let y = yc - 1; y <= yc + 1; y++) { const x = v.front(y, z); if (x !== null && y >= -7 && y <= 6) strap(x + 1, y, z); } }
    for (let z = 33; z <= 51; z++) { const yc = Math.round(5 - (51 - z) * 11 / 18); for (let y = yc - 1; y <= yc + 1; y++) { const x = v.back(y, z); if (x !== null && y >= -7 && y <= 6) strap(x - 1, y, z); } }
    v.rbox(5, -6, 33, 7, -4, 36, 'lsLurik', 1);   // simpul di depan pinggang kiri
    for (let z = 28; z <= 32; z++) v.set(6, -5, z, z % 2 ? 'lsLurikS' : 'lsLurik');
    // bakul anyaman di punggung, isi botol-botol jamu bertutup merah
    for (let z = 30; z <= 46; z++) v.shell(z, -17, -6, -7, 5, (z % 3 === 0) ? 'lsBakulS' : 'lsBakul', 3);
    v.rbox(-17, -6, 30, -7, 5, 30, 'lsBakulS', 3);
    for (let z = 45; z <= 46; z++) v.shell(z, -17, -6, -7, 5, 'lsBakulS', 3);
    const fills = ['lsKunyit', 'lsBeras', 'lsPahit', 'lsKunyit', 'lsBeras', 'lsKunyit'];
    let i = 0;
    for (const bx of [-15, -11]) for (const by of [-4, 0, 3]) {
      const top = 50 + ((i * 3) % 4), f = fills[i++];
      v.rbox(bx, by, 40, bx + 2, by + 1, top - 3, 'lsBotol', 1);
      v.box(bx, by, 42, bx + 2, by + 1, top - 5, f);
      v.box(bx + 1, by, top - 2, bx + 1, by + 1, top, 'lsBotol'); v.box(bx + 1, by, top + 1, bx + 1, by + 1, top + 1, 'lsTutup');
    }
  } else {   // daster + celemek putih bertepi kuning
    for (let z = 32; z <= 46; z++) for (let y = -5; y <= 4; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, Math.abs(y + 0.5) === 4.5 ? 'lsCelemekS' : 'lsCelemek'); }
    for (let z = 46; z <= 52; z++) for (const y of [-4, 3]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'lsCelemekS'); }
  }
  return o.top === 'keliling' ? v : daster(v);
}
function pelvis(o) {
  const v = kain(o, skirtPelvis(cK(o), cKS(o), 20));
  if (K(o)) for (let z = 28; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 28 ? 'lsKebS' : 'lsKeb', 3);   // ujung kebaya menutup pinggang
  else for (let z = 22; z <= 33; z++) for (let y = -5; y <= 4; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === 22 || Math.abs(y + 0.5) === 4.5 ? 'lsCelemekS' : 'lsCelemek'); }
  return v;
}
function arm(o) {
  const v = new Vox(), c = K(o) ? 'lsKeb' : 'lsDaster';
  v.rbox(-2, 6, 40, 2, 10, 50, K(o) ? c : 'lsSkin', 2); v.rrect(51, -2, 6, 2, 10, c, 2);
  if (!K(o)) { v.paint(-2, 6, 45, 2, 10, 51, c); v.shell(45, -3, 5, 3, 11, 'lsDasterS', 2); }
  return v;
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-2, 6, 31, 2, 10, 39, K(o) ? 'lsKeb' : 'lsSkin', 2);
  if (K(o)) v.paint(-2, 6, 31, 2, 10, 32, 'lsKebT');
  v.rbox(-2, 6, 27, 3, 10, 30, 'lsSkin', 2); v.rrect(26, -1, 7, 2, 9, 'lsSkin', 1);
  if (K(o) && side > 0) {   // gelas jamu kunyit asam yang disodorkan
    v.rbox(3, 7, 24, 6, 9, 30, 'lsKunyit', 1); v.rrect(30, 3, 7, 6, 9, 'lsGelas', 1); v.rrect(24, 3, 7, 6, 9, 'lsGelas', 1);
  }
  if (!K(o) && side < 0) {   // cobek batu berisi bumbu jamu yang lagi diulek
    for (let z = 18; z <= 22; z++) { const r = z === 18 ? 3 : 5; v.shell(z, -r, 8 - r, r, 8 + r, 'lsCobek', r); }
    v.rrect(18, -3, 5, 3, 11, 'lsCobek', 2);
    v.rrect(21, -4, 4, 4, 12, 'lsBumbu', 3);
  }
  if (!K(o) && side > 0) {   // ulekan batu
    v.rbox(-1, 7, 18, 1, 9, 26, 'lsUlek', 1); v.rbox(-2, 6, 15, 2, 10, 18, 'lsCobek', 2);
  }
  return v;
}
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 6, 6, 0, 'lsSandal', 2); v.rbox(-3, 2, 1, 5, 5, 2, 'lsSkin', 2); v.rbox(-3, 2, 3, 1, 5, 4, 'lsSkin', 2);
  for (const [x, y] of [[4, 4], [3, 3], [3, 5], [2, 2], [2, 6]]) v.set(x, y, 2, 'lsSandal');
  return v;
}

export const OUTFITS = {
  keliling: { name: 'Keliling: kebaya kutubaru kuning + jarik cokelat + selendang lurik + bakul jamu + gelas jamu + sandal jepit', top: 'keliling', propOn: 'jual' },
  racik: { name: 'Meracik: daster batik hijau + celemek + cobek & ulekan', top: 'racik' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.keliling), expr: opt.expr || 'biasa', face: opt.face };
  const c = cK(o), cS = cKS(o);
  const A = arm(o), Th = kain(o, skirtThigh(c)), Sn = kain(o, skirtShin(c, cS)), Ft = foot(o), sl = K(o) ? 'lsKeb' : 'lsDaster';
  const panel = s => {
    const p = kain(o, skirtPanel(c, cS, s, 5));
    if (s > 0 && !K(o)) for (let z = 18; z <= 31; z++) for (let y = -5; y <= 4; y++) { const x = p.front(y, z); if (x !== null) p.set(x + 1, y, z, z === 18 || Math.abs(y + 0.5) === 4.5 ? 'lsCelemekS' : 'lsCelemek'); }
    if (s > 0 && K(o)) for (let z = 6; z <= 30; z++) { const x = p.front(-6, z); if (x !== null) p.set(x, -6, z, 'lsJarikK'); }   // wiru jarik
    return p;
  };
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'lsSkin', shoulder: sl, elbow: K(o) ? sl : 'lsSkin', hip: c, knee: c }, SKEL, TAIL);
  P.skirt = skirtInfo(P, c, cS);
  return P;
}
