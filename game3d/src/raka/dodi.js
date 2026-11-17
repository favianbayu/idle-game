// Dodi & Didi: anak SD kembar (9 tahun) di gang Kenanga, selalu berdua, ngajak main layangan ("Kak, main layangan yuk!").
// Wajah & kulit sama persis, bedanya: Dodi poni rata + topi merah dibalik + kaus merah, bawa layangan;
// Didi rambut jabrik + gigi depan ompong + plester di pipi + kaus biru, bawa kaleng benang. Rangka anak (sama dengan Cici).
// File ini membangun keduanya; didi.js hanya memanggil kembar('didi').
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace, skullLayer } from './model.js';

export const SKEL = { ank: 3.5, shin: 8, thigh: 8.5, up: 3, neck: 16, shY: 6.5, shZ: 11, upper: 7, fore: 6.5, hipY: 3, flap: 4.5, ballR: 0.7 };
const PV = pivots(SKEL);
const TAIL = [-7, 0, 6];

addRamps({
  ddSkin: ['#9a6640', '#ae764c', '#c08658', '#d09866'], ddSkinS: ['#a87048'], ddBlush: ['#d8806a'],
  ddHair: ['#100c08', '#18120e', '#22180f', '#302218'], ddHairT: ['#3a2a1c'],
  ddMerah: ['#8e1c22', '#a8242a', '#c22a2a', '#d84444'], ddMerahS: ['#7a161c'], ddPutih: ['#d8d6ce', '#e8e6de', '#f4f2ec', '#fcfbf8'], ddPutihS: ['#c8c6be'],
  ddSepatu: ['#121214', '#1a1a1e', '#26262c', '#36363e'], ddBadge: ['#d8a82a'],
  kausDo: ['#b8282a', '#cc3434', '#de4444', '#ec5c58'], kausDoS: ['#8e1c1e'], kausDoK: ['#f4f2ec'],
  kausDi: ['#1e5aa8', '#2a6ac0', '#3a7cd2', '#5290e0'], kausDiS: ['#16467e'], kausDiK: ['#f2d23a'],
  ddCelana: ['#3a3a40', '#46464e', '#54545c', '#64646e'], ddCelanaS: ['#2a2a30'],
  ddTopi: ['#c82a2a', '#d83636', '#e44646', '#ee5e5e'], ddTopiS: ['#9a1e1e'],
  ddPlester: ['#e8c89a'], ddLuka: ['#c86a5a'], ddJepit: ['#2a6ac0'],
  layang: ['#e8c030', '#f0cc3c', '#f6d84c', '#fae262'], layangM: ['#d8342c'], layangB: ['#7a5a2a'], ddBenang: ['#e8dcc0'],
  kalengD: ['#8a8e96', '#9ea2aa', '#b2b6be', '#c6cad2'], kalengDS: ['#6a6e76'],
  kokoD: ['#e4e2da', '#eeece6', '#f6f4ee', '#fcfbf8'], kokoDS: ['#c8c4b8'], srD: ['#2a5a3a', '#346a46', '#3e7a52', '#4a8c60'], srDS: ['#1a3a24'], srDK: ['#c8a83a'],
  pecD: ['#141418', '#1c1c22', '#26262e', '#32323c'],
});

/* ---------- wajah anak: mata bulat besar, alis tipis + 1 baris jarak, pipi merah; Didi ompong, mulut tepat di bawah hidung */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'ddBlush', s: 'ddSkinS', g: 'mouth' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, ...brow, F0, ...eyes, '.rr........rr.', F0, ...mouth, F0, F0];
const BROW = ['..BBB....BBB..'];
const EYE = ['.KKKK....KKKK.', '.KWKK....KKWK.', '..KK......KK..'];
const faces = gap => {   // Didi: gigi depan ompong (celah gelap di tengah gigi)
  const T2 = gap ? '...mTTggTTm...' : '...mTTTTTTm...', T1 = gap ? '....mTggTm....' : '....mTTTTm....';
  return {
    biasa: F(BROW, EYE, ['....m....m....', '.....mmmm.....', F0]),
    kedip: F(BROW, [F0, '.KKKK....KKKK.', F0], ['....m....m....', '.....mmmm.....', F0]),
    marah: F(['...BB....BB...'], EYE, ['.....mmmm.....', '....m....m....', F0]),
    teriak: F(['..BB......BB..'], EYE, ['....mmmmmm....', T1, '.....mttm.....']),   // "Kak, main layangan yuk!"
    nyengir: F(BROW, EYE, [T2, '....mmmmmm....', F0]),
    ketawa: F(BROW, [F0, '..KK......KK..', '.K..K....K..K.'], [T2, '....mttttm....', '.....mmmm.....']),
    sakit: F(['.BB........BB.'], ['.KK........KK.', '...KK....KK...', F0], ['....mmmmmm....', '.....mmmm.....', F0]),
  };
};
export const FACES = faces(false);
export const FACES_DIDI = faces(true);
export const EXPRS = Object.keys(FACES);

const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
function head(o) {
  const v = new Vox(), D = o.twin === 'didi';
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = z <= 0 ? [-4, -5, 5, 4, 4] : z === 1 ? [-6, -6, 6, 5, 4] : skullLayer(z); v.rrect(z, a, b, c, d, 'ddSkin', r); }
  paintFace(v, o.face || (D ? FACES_DIDI : FACES)[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'ddSkin'); v.set(7, 0, 5, 'ddSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'ddSkin'); v.box(-1, y, 6, -1, y, 7, 'ddSkinS'); }
  const hair = new Vox();
  for (let z = 6; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, 'ddHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -8, -8, 6, 7, 'ddHair', 5);
  if (D) {   // jabrik: duri-duri pendek ke atas & ke belakang, pelipis tipis
    hair.rrect(17, -7, -7, 5, 6, 'ddHair', 4);
    if (!o.peci) for (let x = -6; x <= 5; x += 3) for (let y = -6; y <= 5; y += 3) { const k = rnd(x, y, 3) % 3; for (let z = 18; z <= 18 + k; z++) hair.set(x, y, z, 'ddHair'); hair.set(x + 1, y, 18, 'ddHair'); }
    for (const [x, y] of [[-9, -3], [-9, 2], [-10, 0]]) for (let z = 11; z <= 14; z++) hair.set(x, y, z, 'ddHair');
  } else hair.rrect(17, -6, -6, 4, 5, 'ddHair', 4);
  const zmin = (x, y) => x >= 5 ? (D ? 14 : 13) : Math.abs(y + 0.5) > 6.5 && x >= -2 ? 9 : 6;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  if (!D) for (let y = -6; y <= 5; y++) { const x = v.front(y, 13); if (x !== null && v.get(x, y, 13) === 'ddHair') v.set(x + 1, y, 13, 'ddHair'); }   // poni rata di dahi
  v.each((x, y, z, c) => { if (c === 'ddHair' && z >= 15 && rnd(x, y, z) % 9 === 0) v.set(x, y, z, 'ddHairT'); });
  if (D) { const x = v.front(-5, 6); v.box(x, -6, 6, x, -4, 7, 'ddPlester'); v.set(x, -5, 6, 'ddLuka'); }   // plester di pipi kanan (layar kiri)
  if (o.cap) {   // topi merah dibalik: kubah di atas kepala, pet ke belakang
    for (let z = 14; z <= 19; z++) for (let x = -9; x <= 8; x++) for (let y = -9; y <= 8; y++) {
      const d = ((x + 0.5) / 8.7) ** 2 + ((y + 0.5) / 8.6) ** 2 + (Math.max(0, z - 15) / 5) ** 2;
      if (d <= 1 && (d > 0.6 || z >= 18)) v.set(x, y, z, z === 14 ? 'ddTopiS' : 'ddTopi');
    }
    for (let x = -14; x <= -9; x++) for (let y = -5; y <= 4; y++) if (Math.abs(y + 0.5) <= 5 - Math.max(0, -10 - x)) v.set(x, y, 14, 'ddTopiS');   // pet di belakang
    v.set(0, -1, 20, 'ddTopiS'); v.set(0, 0, 20, 'ddTopiS');
    for (let y = -2; y <= 1; y++) v.set(-9, y, 16, 'ddHair');   // rambut nyembul di lubang tali
  }
  if (o.peci) {
    for (let z = 13; z <= 19; z++) for (let x = -9; x <= 8; x++) for (let y = -9; y <= 8; y++) { const d = ((x + 0.5) / 8.6) ** 2 + ((y + 0.5) / 8.4) ** 2; if (d <= 1 && (d > 0.62 || z >= 18)) v.set(x, y, z, 'pecD'); }
  }
  return v;
}

/* ---------- badan anak (sisi +y; sisi -y = cermin): dada z 21..35, leher 36..38, lengan y 5..8 */
const bodyC = o => ({ sd: 'ddPutih', main: o.twin === 'didi' ? 'kausDi' : 'kausDo', ngaji: 'kokoD' }[o.top]);
function chest(o) {
  const v = new Vox(), c = bodyC(o), T = o.top;
  for (let z = 21; z <= 35; z++) { const t = z === 35 ? 1 : 0, b = z <= 25 ? 1 : 0; v.rrect(z, -3, -5 + t, 3 + b - t, 4 - t, c, 3); }
  v.rbox(-2, -2, 36, 1, 1, 38, 'ddSkin', 1);
  for (let y = -2; y <= 1; y++) v.pf(y, 35, 'ddSkin');
  if (T === 'sd') {   // kemeja putih SD: kerah, kancing, badge kuning, ujung baju masuk celana
    for (let z = 21; z <= 34; z++) v.pf(0, z, 'ddPutihS');
    for (let z = 36; z <= 37; z++) v.shell(z, -3, -3, 2, 2, 'ddPutih', 1);
    v.pfBox(2, 30, 3, 31, 'ddBadge'); v.pf(-4, 31, 'ddMerah');
  } else if (T === 'main') {
    v.shell(36, -3, -3, 2, 2, c, 1);
    if (o.twin === 'didi') { for (const z of [26, 29, 32]) for (let y = -5; y <= 4; y++) v.pf(y, z, 'kausDiK'); }   // garis kuning
    else ['KK.KK', '.K..K', '.K.KK', '.K..K', 'KKKKK'].forEach((row, r) => [...row].forEach((ch, c2) => { if (ch === 'K') v.pf(c2 - 2, 32 - r, 'kausDoK'); }));   // nomor 1 dan 3 ala kaus bola
  } else {   // baju koko: kerah tegak, kancing, bordir di dada
    for (let z = 36; z <= 37; z++) v.shell(z, -3, -3, 2, 2, 'kokoD', 1);
    for (let z = 23; z <= 34; z++) v.pf(-1, z, 'kokoDS');
    for (let z = 29; z <= 34; z++) for (const y of [-3, 2]) if ((z + y) % 2 === 0) v.pf(y, z, 'kokoDS');
  }
  return v;
}
const legC = o => o.top === 'sd' ? 'ddMerah' : o.top === 'ngaji' ? 'srD' : 'ddCelana';
const kotak = v => { v.each((x, y, z, k) => { if (k !== 'srD') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x; if ((u + 40) % 3 === 0 || z % 3 === 0) v.set(x, y, z, (z % 6 === 0 && (u + 40) % 3 === 0) ? 'srDK' : 'srDS'); }); return v; };
function pelvis(o) {
  const v = new Vox(), c = legC(o);
  v.rbox(-3, -4, 16, 3, 3, 22, c, 2);
  for (let z = 15; z <= 22; z++) v.shell(z, -4, -5, 4, 4, z === 22 && o.top === 'sd' ? 'ddSepatu' : c, 3);
  if (o.top === 'sd') { v.pf(0, 22, 'ddBadge'); for (let z = 23; z <= 24; z++) v.shell(z, -3, -5, 3, 4, 'ddPutih', 3); }
  if (o.top === 'main') for (let z = 21; z <= 24; z++) v.shell(z, -3, -5, 3, 4, bodyC(o), 3);   // kaus kedodoran menutupi pinggang
  if (o.top === 'ngaji') { for (let z = 21; z <= 22; z++) v.shell(z, -4, -5, 4, 4, 'srDS', 3); kotak(v); }
  return v;
}
function arm(o) {
  const v = new Vox(), c = bodyC(o), L = o.top === 'ngaji';
  v.rbox(-2, 5, 28, 1, 8, 34, L ? c : 'ddSkin', 2); v.rrect(35, -2, 5, 1, 8, c, 1);
  if (!L) { v.paint(-2, 5, 31, 1, 8, 35, c); v.shell(31, -3, 5, 2, 9, c, 1); }
  return v;
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-2, 5, 21, 1, 8, 27, o.top === 'ngaji' ? 'kokoD' : 'ddSkin', 2);
  v.rbox(-2, 5, 18, 2, 8, 20, 'ddSkin', 2); v.rrect(17, -1, 6, 1, 7, 'ddSkin', 1);
  if (o.top === 'main' && side > 0 && o.twin !== 'didi') {   // layangan kuning-merah dijinjing di samping badan: bidang belah ketupat, rangka bambu, ekor pita
    const y = 9;
    for (let x = -7; x <= 7; x++) for (let z = 6; z <= 22; z++) { const d = Math.abs(x) / 7.5 + Math.abs(z - 14) / 8.5; if (d <= 1) v.set(x, y, z, x === 0 || z === 16 ? 'layangB' : z >= 14 === x > 0 ? 'layangM' : 'layang'); }
    for (let z = 1; z <= 5; z++) v.set(Math.round(Math.sin(z * 0.9)), y, z, z % 3 === 0 ? 'layangM' : 'layang');
  }
  if (o.top === 'main' && side > 0 && o.twin === 'didi') {   // kaleng bekas berisi gulungan benang gelasan
    v.rbox(-2, 4, 12, 2, 9, 17, 'kalengD', 2); v.rbox(-1, 5, 17, 1, 8, 17, 'ddBenang', 1); v.shell(12, -2, 4, 2, 9, 'kalengDS', 2); for (const z of [14, 15]) v.shell(z, -3, 3, 3, 10, 'ddBenang', 2);
    for (let z = 18; z <= 22; z++) v.set(0, 10, z, 'ddBenang');
  }
  return v;
}
function thigh(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-2, 1, 12, 2, 4, 20, o.top === 'ngaji' ? c : 'ddSkin', 2);
  if (o.top !== 'ngaji') for (let z = 16; z <= 20; z++) v.shell(z, -3, 0, 3, 5, c, 2);   // celana pendek sampai atas lutut
  return o.top === 'ngaji' ? kotak(v) : v;
}
function shin(o) {
  const v = new Vox();
  if (o.top === 'ngaji') { v.rbox(-2, 1, 6, 1, 4, 12, 'srD', 2); v.rbox(-2, 1, 4, 1, 4, 5, 'ddSkin', 1); return kotak(v); }   // sarung sampai mata kaki
  v.rbox(-2, 1, 4, 1, 4, 12, 'ddSkin', 2);
  if (o.top === 'sd') v.paint(-2, 1, 4, 1, 4, 7, 'ddPutih');   // kaus kaki putih
  if (o.top === 'main') { const x = v.front(3, 11); v.set(x, 2, 11, 'ddPlester'); v.set(x, 3, 11, 'ddPlester'); v.set(x, 2, 10, 'ddLuka'); }   // lutut lecet
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'sd') { v.rbox(-3, 0, 0, 4, 5, 0, 'belt', 2); v.rbox(-3, 0, 1, 4, 5, 3, 'ddSepatu', 2); v.set(4, 2, 2, 'ddPutih'); v.set(4, 3, 2, 'ddPutih'); return v; }
  v.rbox(-3, 0, 0, 4, 5, 0, 'ddJepit', 2); v.rbox(-2, 1, 1, 4, 4, 2, 'ddSkin', 2); v.rbox(-2, 1, 3, 1, 4, 4, 'ddSkin', 1);
  for (const [x, y] of [[3, 2], [2, 1], [2, 3], [1, 1], [1, 4]]) v.set(x, y, 2, 'ddJepit');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam SD merah putih + kaus kaki putih + sepatu hitam', top: 'sd' },
  main: { name: 'Main: kaus merah nomor 13 + topi dibalik + celana pendek + layangan', top: 'main', cap: true },
  ngaji: { name: 'Ngaji sore: baju koko + sarung kotak hijau + peci hitam', top: 'ngaji', peci: true },
};
export const OUTFITS_DIDI = {
  seragam: { name: 'Seragam SD merah putih + kaus kaki putih + sepatu hitam', top: 'sd' },
  main: { name: 'Main: kaus biru garis kuning + celana pendek + kaleng benang layangan', top: 'main' },
  ngaji: { name: 'Ngaji sore: baju koko + sarung kotak hijau + peci hitam', top: 'ngaji', peci: true },
};
export function kembar(twin, opt = {}) {
  const OUT = twin === 'didi' ? OUTFITS_DIDI : OUTFITS;
  const o = { ...(OUT[opt.outfit] || OUT.main), twin, expr: opt.expr || 'biasa', face: opt.face };
  const Th = thigh(o), Sn = shin(o), Ft = foot(o), A = arm(o), sl = bodyC(o), leg = legC(o), nk = o.top === 'ngaji';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'ddSkin', shoulder: sl, elbow: nk ? sl : 'ddSkin', hip: leg, knee: nk ? leg : 'ddSkin' }, SKEL, TAIL);
}
export const build = opt => kembar('dodi', opt);
