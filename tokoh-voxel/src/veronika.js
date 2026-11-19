// Bu Veronika: ibu senam pagi Perumahan Bukit Asri, 50-an, orang Manado yang heboh dan ramah ("Satu, dua, tiga... eh,
// permisi ya."). Kulit kuning langsat, rambut pendek keriting dicat cokelat kemerahan, bando ungu, alis tebal digambar,
// lipstik merah. Senam: kaus ketat ungu + jaket training diikat di pinggang + legging hitam + kets putih + handuk leher +
// botol minum. Arisan: blus bunga merah + rok span hitam selutut + kalung mutiara + kacamata hitam di kepala + tas tangan.
// Rangka keluarga Nadia, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';
import { skirtPelvis, skirtPanel } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8.5, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.95 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  vrSkin: ['#d4a07a', '#e2b08a', '#ecbe98', '#f4cca8'], vrSkinS: ['#d8a882'], vrBlush: ['#ec9a8a'], vrBibir: ['#c22a3a'],
  vrHair: ['#5a2414', '#6c2e1a', '#7e3820', '#924428'], vrHairT: ['#a85030'], vrBando: ['#8a3ab8'],
  senamV: ['#6a2a98', '#7a32aa', '#8a3cbc', '#9c4ccc'], senamVS: ['#4e1e72'], senamVK: ['#f2f0f6'],
  jaketV: ['#1e5aa8', '#2a6ac0', '#3a7cd2', '#5290e0'], jaketVS: ['#16467e'], leggingV: ['#16161a', '#1e1e22', '#28282e', '#34343c'], leggingVS: ['#0e0e10'],
  ketsV: ['#dcdcd8', '#ececea', '#f6f6f4', '#ffffff'], ketsVS: ['#b8b8b4'], ketsVK: ['#8a3ab8'],
  handukV: ['#f0c8d8', '#f6d4e2', '#fae0ea', '#fdeef4'], botolV: ['#7ac8e8', '#8ad4f0', '#a0e0f6', '#bceafa'], botolVT: ['#e8e8ec'],
  blusV: ['#b8242a', '#c82e32', '#d63a3c', '#e44c4c'], blusVS: ['#8e1a1e'], blusVK: ['#f6e8c8'], blusVD: ['#3a8a3a'],
  spanV: ['#141416', '#1c1c20', '#26262a', '#323238'], spanVS: ['#0a0a0c'], mutiara: ['#f6f2ea'],
  kacaV: ['#16161a'], kacaVL: ['#3a2a4a'], tasV: ['#c8a050', '#d8b060', '#e6c070', '#f0d084'], tasVS: ['#a07a30'], sepatuV: ['#141416', '#1c1c20', '#26262a', '#323238'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'vrBibir', T: 'teeth', t: 'tongue', r: 'vrBlush', s: 'vrSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis tebal z 11, mulut lipstik z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['.KKKK....KKKK.', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....m....m....', '.....mmmm.....', 'rr..........rr']),
  kedip: F(BROW, [F0, '.KKKK....KKKK.'], ['....m....m....', '.....mmmm.....', 'rr..........rr']),
  marah: F('..BBB....BBB..', EYE, ['....mmmmmm....', F0, F0]),
  teriak: F('BBBB......BBBB', ['.KKKK....KKKK.', '.KWKK....KKWK.'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),   // "Satu, dua, tiga!"
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', 'rr..........rr']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', 'rr...mmmm...rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'vrSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'vrSkin'); v.set(7, -1, 5, 'vrSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'vrSkin'); v.box(-1, y, 6, -1, y, 7, 'vrSkinS'); v.set(0, y + (y > 0 ? 1 : -1), 5, 'mutiara'); }   // anting mutiara
  // rambut pendek keriting mengembang (bob keriting sampai telinga), gumpalan acak di permukaan
  const hair = new Vox();
  for (let z = 5; z <= 16; z++) hair.rrect(z, -10, -10, 8, 9, 'vrHair', z <= 12 ? 5 : 6);
  for (let z = 17; z <= 18; z++) hair.rrect(z, -8, -8, 6, 7, 'vrHair', 5);
  const zmin = (x, y) => x >= 5 ? 13 : Math.abs(y + 0.5) > 7.5 && x >= -1 ? 9 : 5;
  hair.each((x, y, z, c) => { if (v.has(x, y, z) || z < zmin(x, y)) return; const edge = !hair.has(x + 1, y, z) || !hair.has(x - 1, y, z) || !hair.has(x, y + 1, z) || !hair.has(x, y - 1, z) || !hair.has(x, y, z + 1); if (edge && rnd(x, y, z) % 4 === 0) return; v.set(x, y, z, rnd(x, y, z) % 5 === 0 ? 'vrHairT' : c); });
  for (let y = -6; y <= 5; y++) { const x = v.front(y, 13); if (x !== null && v.get(x, y, 13) === 'vrHair') v.set(x + 1, y, 13, rnd(y, 3, 1) % 2 ? 'vrHair' : 'vrHairT'); }   // poni ikal
  if (o.bando) for (let y = -10; y <= 9; y++) { const t = (y + 0.5) / 10; const z = 16 + Math.round(2.5 * (1 - t * t)); for (let x = 3; x <= 4; x++) { const xx = x + Math.round(2 * (1 - t * t)); v.set(xx, y, z, 'vrBando'); } }
  if (o.kaca) {   // kacamata hitam nangkring di atas kepala
    for (const y0 of [-6, 1]) for (let y = y0; y <= y0 + 4; y++) { v.set(6, y, 18, 'kacaV'); v.set(6, y, 17, y === y0 || y === y0 + 4 ? 'kacaV' : 'kacaVL'); }
    for (const y of [-1, 0]) v.set(6, y, 18, 'kacaV');
  }
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
const topC = o => o.top === 'senam' ? 'senamV' : 'blusV';
const bunga = v => { v.each((x, y, z, k) => { if (k !== 'blusV') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + 40) % 6), b = ((z + 40) % 6); if (a === 2 && b === 2) v.set(x, y, z, 'blusVK'); else if ((a === 1 || a === 3) && b === 2 || a === 2 && (b === 1 || b === 3)) v.set(x, y, z, 'blusVS'); else if (a === 5 && b === 5) v.set(x, y, z, 'blusVD'); }); return v; };
function chest(o) {
  const v = new Vox(), c = topC(o), S = o.top === 'senam';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, bel = z >= 33 && z <= 44 ? Math.round(1.5 * Math.sin((z - 32) / 12 * Math.PI)) : 0, w = z >= 37 && z <= 41 && S ? 1 : 0; v.rrect(z, -5, -7 + t + w, 4 + bel - t, 6 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'vrSkin', 1);
  for (let y = -3; y <= 2; y++) v.pf(y, 51, 'vrSkin');
  if (S) {   // kaus senam: garis putih menyamping, handuk kecil pink di leher
    for (let z = 33; z <= 50; z++) for (const y of [-7, 6]) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'senamVK'); }
    for (let y = -8; y <= 7; y++) { if (Math.abs(y + 0.5) < 3.5) continue; const xf = v.front(y, 51), xb = v.back(y, 51); if (xf === null) continue; for (let x = xb - 1; x <= xf + 1; x++) v.set(x, y, 52, 'handukV'); }
    for (let z = 42; z <= 51; z++) for (const y of [-6, -5, 4, 5]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'handukV'); }
  } else {
    for (let z = 47; z <= 51; z++) for (let y = -3; y <= 2; y++) if (Math.abs(y + 0.5) <= (z - 46) * 0.9) v.pf(y, z, 'vrSkin');   // kerah V
    for (let y = -4; y <= 3; y++) { const z = 47 + Math.round(Math.abs(y + 0.5) * 0.9), x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'mutiara'); }   // kalung mutiara
    bunga(v);
  }
  return v;
}
function pelvis(o) {
  if (o.top === 'senam') {
    const v = new Vox();
    v.rbox(-5, -7, 26, 4, 6, 33, 'leggingV', 3); v.box(-3, -2, 24, 2, 1, 25, 'leggingV');
    for (let z = 31; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'senamV', 3);
    // jaket training diikat di pinggang: simpul di depan, badan jaket menjuntai di belakang
    for (let z = 28; z <= 31; z++) v.shell(z, -6, -8, 5, 7, z === 28 ? 'jaketVS' : 'jaketV', 3);
    v.rbox(5, -2, 26, 6, 1, 30, 'jaketV', 1); v.set(6, -1, 27, 'jaketVS');
    for (let z = 18; z <= 28; z++) for (let y = -7; y <= 6; y++) { const x = v.back(y, Math.max(z, 26)); v.set((x ?? -5) - 1, y, z, z === 18 ? 'jaketVS' : 'jaketV'); }
    return v;
  }
  const v = skirtPelvis('spanV', 'spanVS', 20);
  for (let z = 31; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'blusV', 3);
  return bunga(v);
}
function arm(o) { const v = new Vox(), c = topC(o); v.rbox(-2, 6, 40, 2, 10, 50, 'vrSkin', 2); v.rrect(51, -2, 6, 2, 10, c, 2); v.paint(-2, 6, 45, 2, 10, 51, c); v.shell(45, -3, 5, 3, 11, c, 2); return o.top === 'senam' ? v : bunga(v); }
function fore(o, side) {
  const v = new Vox(), S = o.top === 'senam';
  v.rbox(-2, 6, 31, 2, 10, 39, 'vrSkin', 2);
  v.rbox(-2, 6, 27, 3, 10, 30, 'vrSkin', 2); v.rrect(26, -1, 7, 2, 9, 'vrSkin', 1);
  if (side > 0) v.paint(-2, 6, 31, 2, 10, 32, S ? 'vrBando' : 'tasV');   // gelang
  if (side < 0 && S) { v.rbox(-2, 6, 18, 2, 10, 30, 'botolV', 2); v.rbox(-1, 7, 31, 1, 9, 33, 'botolVT', 1); }   // botol minum
  if (side < 0 && !S) {   // tas tangan emas, tali di genggaman
    v.rbox(-4, 7, 14, 4, 10, 22, 'tasV', 2); v.paint(-4, 7, 22, 4, 10, 22, 'tasVS'); v.set(4, 8, 19, 'tasVS');
    for (const x of [-2, 2]) for (let z = 23; z <= 26; z++) v.set(x, 8, z, 'tasVS');
  }
  return v;
}
function thigh(o) { const v = new Vox(); v.rbox(-4, 0, 17, 3, 7, 30, o.top === 'senam' ? 'leggingV' : 'vrSkin', 3); v.rrect(31, -3, 1, 2, 6, o.top === 'senam' ? 'leggingV' : 'vrSkin', 3); return v; }
function shin(o) {
  const v = new Vox(), c = o.top === 'senam' ? 'leggingV' : 'vrSkin';
  v.rbox(-3, 1, 6, 3, 6, 17, c, 3); v.rrect(18, -3, 1, 2, 6, c, 3);
  if (o.top === 'senam') v.paint(-3, 1, 6, 3, 6, 7, 'ketsV');   // kaus kaki putih
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'senam') {
    v.rbox(-4, 0, 0, 6, 7, 1, 'ketsVS', 3); v.rbox(-4, 0, 2, 6, 7, 4, 'ketsV', 3); v.rbox(-4, 0, 5, 2, 7, 5, 'ketsV', 3);
    for (const x of [1, 3]) v.paint(x, 2, 4, x, 5, 4, 'ketsVK'); v.paint(-4, 0, 2, -4, 7, 3, 'ketsVK');
    return v;
  }
  v.rbox(-4, 1, 0, -3, 6, 2, 'sepatuV', 1); v.rbox(-2, 1, 2, 6, 6, 3, 'sepatuV', 2); v.rbox(-3, 2, 4, 1, 5, 5, 'vrSkin', 2);   // pantofel hak pendek
  return v;
}

export const OUTFITS = {
  senam: { name: 'Senam pagi: bando ungu + kaus senam + jaket diikat di pinggang + legging + kets + handuk + botol minum', top: 'senam', bando: true },
  arisan: { name: 'Arisan: blus bunga merah + rok span hitam + kalung mutiara + kacamata hitam di kepala + tas emas', top: 'arisan', kaca: true, propOn: 'all' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.senam), expr: opt.expr || 'biasa', face: opt.face };
  const S = o.top === 'senam', A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = topC(o), leg = S ? 'leggingV' : 'vrSkin';
  const list = [
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ];
  if (!S) list.splice(5, 0, ['flapF', skirtPanel('spanV', 'spanVS', 1, 17), PV.flapF], ['flapB', skirtPanel('spanV', 'spanVS', -1, 17), PV.flapB]);
  const P = assemble(list, { neck: 'vrSkin', shoulder: sl, elbow: 'vrSkin', hip: S ? leg : 'spanV', knee: leg }, SKEL, TAIL);
  if (!S) P.skirt = { mats: [P.mat('spanV'), P.mat('spanVS')], fill: P.mat('spanV'), parts: ['pelvis', 'flapF', 'flapB'] };
  return P;
}
