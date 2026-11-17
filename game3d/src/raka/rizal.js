// Rizal: NPC romance cowok, sekretaris OSIS, kutu buku pendiam. Kurus tinggi sedang (skala lama 1.32), kulit kuning
// langsat, rambut hitam-cokelat belah samping dengan poni jatuh ke dahi, kacamata frame tipis kotak, bulu mata panjang,
// mata sayu, alis tipis, mulut kecil, jari bernoda tinta biru. Seragam rapi dimasukkan + rompi rajut cokelat + tas
// selempang kanvas berisi buku. Voxel halus 1/64 petak, rangka sama keluarga Arga tapi lebih ramping.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  rzSkin: ['#b9805a', '#d09a70', '#e8b890', '#f4cca6'], rzSkinS: ['#c88e66'], rLash: ['#1a1210'],
  rzHair: ['#120b08', '#1c120d', '#2a1a12', '#3a271b'], rzHairT: ['#4c3424'], rPart: ['#0c0705'],
  rFrame: ['#3a3c44', '#4c4f58', '#666a75', '#878b96'], rLens: ['#dcebf2'],
  rompi: ['#5a4430', '#6e543c', '#8a6a4a', '#a3825e'], rompiS: ['#76593e'],
  rTie: ['#3a3f4c', '#4a5060', '#5d6476', '#76809a'],
  rAlma: ['#14203f', '#1c2b52', '#263a6a', '#36508a'], rAlmaS: ['#c7a24a'],
  pena: ['#1e3d8a'], penaT: ['#e8e4da'], tinta: ['#2e4a7a'],
  rzKanvas: ['#4e4a38', '#615c46', '#787258', '#918a6c'], kanvasS: ['#3a372a'], buku: ['#b03a2e'], bukuB: ['#e9e2c8'],
  rzTee: ['#b5ad98', '#cfc7b1', '#e6dfca', '#f4efe0'], rPrint: ['#2e6a8a'], rPrintS: ['#e0a63a'],
  sarung: ['#3e1a26', '#521f31', '#6a2a40', '#84384f'], sarungS: ['#a8864e'],
  kotakC: ['#5a3e2a', '#6e4c34', '#86603f', '#9f7650'], kotakS: ['#4e3422'],
  slack: ['#6a5e4a', '#80725a', '#998a6e', '#b2a383'], canvasC: ['#5a3a22', '#704a2c', '#8a5c38', '#a5724a'],
  rzPantofel: ['#0d0c10', '#16151a', '#222127', '#38363f'], rSandal: ['#2a2622', '#3a342e', '#4c453c', '#625a4e'],
});

/* ---------- wajah: alis tipis, mata sayu (kelopak berat) dengan bulu mata panjang mencuat ke luar, mulut kecil
   tepat di bawah hidung (hidung x 7, y -1..0, z 5..6 -> mulut di kolom 6..7, baris z 4). */
const FCH = { B: 'brow', K: 'eyeK', L: 'rLash', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'rzSkinS' };
const F0 = '..............';
// baris: 0-2 tertutup poni (z 14..12), 3-4 alis (z 11..10), 5-7 mata (z 9..7), 8-9 hidung (z 6..5), 10-11 mulut (z 4..3)
const F = (brow, eyes, mouth) => [F0, F0, F0, ...brow, ...eyes, F0, F0, ...mouth, F0, F0, F0];
const BROW = ['..BBB....BBB..', F0];
const EYE = ['LLKKK....KKKLL', '.WKKK....KKKW.', F0];
export const FACES = {
  biasa: F(BROW, EYE, ['......mm......', F0]),
  kedip: F(BROW, [F0, 'LLKKK....KKKLL', F0], ['......mm......', F0]),
  marah: F(['...BB....BB...', '.....B..B.....'], EYE, ['.....mmmm.....', F0]),
  teriak: F(['...BB....BB...', '.....B..B.....'], ['.LKKK....KKKL.', '.WKKK....KKKW.', '..KK......KK..'], ['.....mTTm.....', '......tt......']),
  nyengir: F(BROW, EYE, ['....m.mm......', '.....mm.......']),
  ketawa: F(BROW, [F0, 'LLKKK....KKKLL', '..KK......KK..'], ['.....mTTm.....', '......mm......']),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.LK........KL.', '...KK....KK...', '.KK........KK.'], ['.....mmmm.....', '.....TTTT.....']),
};
export const EXPRS = Object.keys(FACES);

const topZ = (v, x, y) => { for (let z = 22; z >= 0; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-3, -4, 4, 3, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'rzSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'rzSkin'); v.set(7, -1, 5, 'rzSkinS');   // hidung kecil
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'rzSkin'); v.box(-1, y, 6, -1, y, 7, 'rzSkinS'); }
  // rambut belah samping: belahan di y = 3, sisi kiri (y < 3) lebih bervolume dan poninya jatuh miring ke dahi
  const hair = new Vox();
  for (let z = 4; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'rzHair', z <= 11 ? 4 : 5);
  for (let z = 16; z <= 17; z++) hair.rrect(z, -7, -8 + (z - 16), 6, 6 - (z - 16) * 2, 'rzHair', 4);
  hair.rrect(18, -4, -6, 4, 1, 'rzHair', 2);
  const zmin = (x, y) => x >= 5 ? 12 : x >= -2 ? (Math.abs(y + 0.5) > 6.5 ? 9 : 0) : x >= -5 ? 6 : 4;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  // poni jatuh: sapuan miring dari belahan ke pelipis kiri, ujungnya sampai z 11 (di atas alis)
  for (let y = -7; y <= 2; y++) {
    const low = 11 + Math.max(0, Math.round((y + 4) / 3));
    for (let z = low; z <= 13; z++) { const x = (v.front(y, z) ?? 6) + 1; if (x <= 8) v.set(x, y, z, 'rzHair'); }
  }
  for (const [y, z] of [[-5, 10], [-4, 10]]) v.set(8, y, z, 'rzHair');   // dua helai paling panjang
  // garis belahan + kilau rambut tipis searah sisiran
  for (let x = -5; x <= 4; x++) { const z = topZ(v, x, 3); if (z !== null) v.set(x, 3, z, 'rPart'); }
  for (const y of [-5, -1]) for (let x = -3; x <= 5; x++) { const z = topZ(v, x, y); if (z !== null && (x + y) % 3 !== 0) v.set(x, y, z, 'rzHairT'); }
  // kacamata frame tipis kotak: hanya garis tepi, 1 voxel di depan wajah, gagang ke telinga
  const fx = v.front(-1, 8) + 1;
  for (const y0 of [-6, 1]) for (let y = y0; y <= y0 + 4; y++) for (let z = 7; z <= 10; z++) {
    if (y === y0 || y === y0 + 4 || z === 7 || z === 10) v.set(fx, y, z, 'rFrame');
  }
  for (const y0 of [-6, 1]) v.set(fx, y0 + 3, 9, 'rLens');
  v.set(fx, -1, 9, 'rFrame'); v.set(fx, 0, 9, 'rFrame');
  for (const y of [-7, 6]) v.set(fx, y, 10, 'rFrame');
  for (const y of [-8, 7]) for (let x = fx - 1; x >= -1; x--) if (!v.has(x, y, 10)) v.set(x, y, 10, 'rFrame');
  // pulpen di balik telinga kanan (rapat OSIS)
  if (o.pen) { for (let x = -2; x <= 3; x++) v.set(x, 8, 10, 'pena'); v.set(4, 8, 10, 'penaT'); v.set(-3, 8, 10, 'penaT'); }
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin). Ramping: dada 14 voxel, bahu sempit */
function chest(o) {
  const v = new Vox(), R = o.top === 'rompi', A = o.top === 'alma', T = o.top === 'kaus', K = o.top === 'kotak';
  const body = R ? 'rompi' : A ? 'rAlma' : T ? 'rzTee' : K ? 'kotakC' : 'white';
  for (let z = 34; z <= 55; z++) {
    const w = z <= 40 ? 0 : z <= 47 ? 0 : -1, t = z === 55 ? 1 : 0, f = T ? 1 : 0;   // kaus oversized: 1 voxel lebih lebar
    v.rrect(z, -5 - f, -7 + w + t - f, 4 - t + f, 6 - w - t + f, body, z >= 54 ? 4 : 3);
  }
  v.rbox(-3, -3, 56, 2, 2, 59, 'rzSkin', 2);
  if (T) {   // kaus festival literasi kebesaran: kerah bulat, sablon buku terbuka di dada
    for (let y = -2; y <= 1; y++) v.pf(y, 55, 'rzSkin'); v.shell(56, -3, -4, 3, 3, 'rzTee', 2);
    ['.PPPPPP.', 'PPPYYPPP', 'PYYPPYYP', 'PPPPPPPP', '..PPPP..'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pf(c - 4, 50 - r, ch === 'P' ? 'rPrint' : 'rPrintS'); }));
    return v;
  }
  // kemeja: garis kancing, kerah putih di leher, dasi abu
  const shirtFront = () => {
    for (let z = 34; z <= 54; z++) v.pf(0, z, 'whiteS');
    for (let z = 56; z <= 57; z++) { v.shell(z, -3, -4, 3, 3, 'white', 2); for (let y = -1; y <= 0; y++) if (v.get(3, y, z) === 'white') v.set(3, y, z, null); }
    for (let z = 40; z <= 55; z++) for (let y = -1; y <= 0; y++) v.pf(y, z, z >= 54 ? 'rTie' : (z % 4 ? 'rTie' : 'whiteS'));
  };
  if (R) {   // rompi rajut V-neck di atas kemeja: kemeja + dasi kelihatan di V, rusuk rajut, lis bawah
    for (let z = 44; z <= 55; z++) { const h = Math.floor((z - 44) / 2.4); for (let y = -1 - h; y <= h; y++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'white'); } }
    shirtFront();
    v.each((x, y, z, c) => { if (c === 'rompi' && z <= 52 && (y + 30) % 3 === 0 && x >= 3) v.set(x, y, z, 'rompiS'); });
    for (let z = 34; z <= 35; z++) v.shell(z, -5, -7, 4, 6, 'rompiS', 3);
    v.pfBox(-6, 47, -4, 48, 'tag');   // papan nama ditempel di rompi
  } else if (A) {   // jas almamater terbuka: kemeja + dasi di tengah, kerah, lambang emas di dada kiri
    for (let z = 34; z <= 55; z++) for (let y = -2; y <= 1; y++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'white'); }
    shirtFront();
    for (let z = 40; z <= 54; z++) { v.pf(-3, z, 'rAlmaS'); v.pf(2, z, 'rAlma'); }
    v.pfBox(-6, 47, -5, 49, 'rAlmaS'); v.pfBox(4, 46, 5, 47, 'osis');
    for (let z = 37; z <= 49; z += 6) v.pf(2, z, 'rAlmaS');
  } else if (K) {   // kemeja flanel kotak cokelat, kancing sampai atas, garis kotak depan + belakang
    for (let z = 34; z <= 55; z++) v.pf(0, z, 'kotakS');
    for (let z = 36; z <= 55; z += 4) for (let y = -7; y <= 6; y++) { v.pf(y, z, 'kotakS'); v.pb(y, z, 'kotakS'); }
    for (let y = -6; y <= 6; y += 4) for (let z = 34; z <= 55; z++) { v.pb(y, z, 'kotakS'); if (Math.abs(y + 0.5) > 2) v.pf(y, z, 'kotakS'); }
    for (let z = 56; z <= 57; z++) v.shell(z, -3, -4, 3, 3, 'kotakC', 2);
  } else shirtFront();
  // seragam: badge OSIS + saku berisi pulpen; tali tas selempang dari bahu kanan ke pinggul kiri (depan dan belakang)
  if (R || o.top === 'kemeja') { v.pfBox(3, 46, 5, 47, 'osis'); v.pf(5, 50, 'pena'); v.pf(5, 49, 'pena'); }
  if (o.bag) for (let z = 34; z <= 55; z++) {
    const y = Math.round(-7 + (z - 34) * 12 / 21);
    for (const yy of [y, y + 1]) { const xf = v.front(yy, z); if (xf !== null) v.set(xf + 1, yy, z, 'kanvasS'); const xb = v.back(yy, z); if (xb !== null) v.set(xb - 1, yy, z, 'kanvasS'); }
  }
  return v;
}
function pelvis(o) {
  if (o.bot === 'sarung') {   // sarung kotak-kotak: rok panjang lewat rok.js, gulungan di pinggang
    const v = skirtPelvis('sarung', 'sarungS', 22); plaid(v);
    for (let z = 31; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 32 ? 'sarungS' : 'sarung', 3);
    for (let z = 34; z <= 36; z++) v.shell(z, -6, -8, 5, 7, 'rzTee', 3);   // ujung kaus kebesaran menutupi pinggang
    return v;
  }
  const c = o.bot === 'slack' ? 'slack' : 'pants', v = new Vox();
  v.rbox(-5, -6, 28, 4, 5, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'alma') for (let z = 30; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'rAlma', 3);   // ujung jas menutupi pinggang
  else { v.rbox(-5, -6, 32, 4, 5, 33, 'belt', 3); v.pfBox(-1, 32, 0, 33, 'buckle'); }
  if (o.bag) {   // tas selempang kanvas di pinggul kiri belakang: tutup, gesper, buku menyembul
    v.rbox(-9, -8, 23, -6, -2, 32, 'rzKanvas', 1);
    for (let z = 27; z <= 32; z++) for (let y = -8; y <= -2; y++) v.set(-9, y, z, 'kanvasS');
    v.set(-10, -5, 28, 'buckle');
    for (let y = -7; y <= -3; y++) { v.set(-7, y, 33, y === -5 ? 'bukuB' : 'buku'); v.set(-8, y, 33, 'bukuB'); }
  }
  return v;
}
const plaid = v => v.each((x, y, z, c) => { if (c === 'sarung' && (z % 6 === 0 || (y + 40) % 5 === 0)) v.set(x, y, z, 'sarungS'); });
const sleeveC = o => ({ alma: 'rAlma', kaus: 'rzTee', kotak: 'kotakC' }[o.top] || 'white');
function arm(o) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-2, 7, 43, 2, 11, 54, c, 2); v.rrect(55, -2, 7, 2, 11, c, 2);
  if (o.top === 'kaus') { v.rbox(-3, 7, 44, 3, 12, 54, 'rzTee', 2); v.rrect(55, -3, 7, 3, 12, 'rzTee', 2); }   // lengan kaus kebesaran sampai siku
  return v;
}
function fore(o, side) {
  const v = new Vox(), c = sleeveC(o), long = o.top !== 'kaus';
  v.rbox(-2, 7, 31, 2, 11, 42, long ? c : 'rzSkin', 2);
  if (long) v.paint(-2, 7, 31, 2, 11, 32, o.top === 'alma' ? 'white' : c === 'kotakC' ? 'kotakS' : 'whiteS');   // manset
  v.rbox(-2, 7, 27, 3, 11, 30, 'rzSkin', 2); v.rrect(26, -1, 8, 2, 10, 'rzSkin', 1);
  if (side > 0) { v.set(3, 8, 27, 'tinta'); v.set(3, 9, 27, 'tinta'); v.set(2, 8, 26, 'tinta'); v.set(3, 8, 28, 'tinta'); }   // jari bernoda tinta (tangan menulis)
  else v.paint(-2, 7, 33, 2, 11, 34, 'rzPantofel');   // jam tangan tali hitam di kiri
  return v;
}
const legC = o => o.bot === 'slack' ? 'slack' : 'pants';
function thigh(o) {
  if (o.bot === 'sarung') { const v = skirtThigh('sarung'); plaid(v); return v; }
  const c = legC(o), v = new Vox(); v.rbox(-4, 2, 18, 3, 6, 31, c, 3); v.rrect(32, -3, 2, 2, 6, c, 3); return v;
}
function shin(o) {
  if (o.bot === 'sarung') { const v = skirtShin('sarung', 'sarungS'); plaid(v); return v; }
  const c = legC(o), v = new Vox(); v.rbox(-4, 2, 6, 3, 6, 18, c, 3); v.rrect(19, -3, 2, 2, 6, c, 3);
  for (let z = 7; z <= 16; z++) v.pf(4, z, c === 'pants' ? 'pantsC' : 'slack');   // lipatan setrika
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.shoe === 'sandal') { v.rbox(-4, 1, 0, 7, 7, 1, 'rSandal', 2); v.rbox(-3, 2, 2, 6, 6, 3, 'rzSkin', 2); v.rbox(-3, 2, 4, 2, 6, 6, 'rzSkin', 2); v.paint(2, 2, 3, 3, 6, 3, 'rSandal'); return v; }
  if (o.shoe === 'rzKanvas') { v.rbox(-4, 1, 0, 7, 7, 1, 'sole', 2); v.rbox(-4, 1, 2, 7, 7, 4, 'canvasC', 2); v.rbox(-3, 1, 5, 2, 7, 6, 'canvasC', 2); for (const x of [1, 3, 5]) v.paint(x, 3, 4, x, 5, 4, 'lace'); return v; }
  // pantofel hitam rapi, mengilap di ujung
  v.rbox(-4, 1, 0, 7, 7, 0, 'belt', 2); v.rbox(-4, 1, 1, 7, 7, 4, 'rzPantofel', 2); v.rbox(-3, 2, 5, 2, 6, 6, 'rzPantofel', 2);
  v.set(7, 4, 3, 'rFrame');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam rapi + rompi rajut + tas selempang', top: 'rompi', bag: true },
  osis: { name: 'Jas almamater + pulpen di telinga', top: 'alma', pen: true },
  rumah: { name: 'Kaus festival literasi + sarung', top: 'kaus', bot: 'sarung', shoe: 'sandal' },
  jalan: { name: 'Kemeja kotak cokelat + slacks + sepatu kanvas', top: 'kotak', bot: 'slack', shoe: 'rzKanvas' },
};
export function build(opt = {}) {
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), sar = o.bot === 'sarung';
  const leg = sar ? 'sarung' : legC(o);
  const panel = s => { if (!sar) return null; const v = skirtPanel('sarung', 'sarungS', s, 5); plaid(v); return v; };
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'rzSkin', shoulder: sl, elbow: sl === 'rzTee' ? 'rzSkin' : sl, hip: leg, knee: leg }, SKEL, TAIL);
  if (sar) P.skirt = skirtInfo(P, 'sarung', 'sarungS');
  return P;
}
