// Pak Hendro: guru olahraga, pelatih futsal, pengawas liga balap resmi, 40-an. Badan atletis, rambut cepak, kumis
// tebal rapi, topi merah, peluit perak bertali di leher, kaus olahraga merah bergaris putih, celana training biru tua
// bergaris putih, sepatu lari putih. Rangka keluarga Arga (skala 1.36), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';
import { motifKotak } from './props.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  heKausB: ['#1e4a8a', '#26589e', '#3068b2', '#4480c6'], heOblong: ['#cfcfca', '#e0e0da', '#eeeee8', '#fafaf4'], heSarung: ['#3a4a2a', '#4a5c36', '#5c7044', '#728856'], heSarungK: ['#8a6a2a'],
  heSkin: ['#86583a', '#9c6a46', '#b07a52', '#c08c64'], heSkinS: ['#9a6844'], heKumis: ['#120e0c'],
  heHair: ['#1a1410', '#221a14', '#2c221a', '#3a2e24'],
  topiH: ['#9a1e1e', '#b42626', '#cc3030', '#e04848'], topiHS: ['#f2f2f2'], peluit: ['#a8acb4', '#c4c8d0', '#dce0e8', '#f2f4f8'], taliH: ['#1a3a8a'],
  heKaus: ['#a82424', '#c22e2e', '#d23a3a', '#e05252'], kausHS: ['#f2f2f2'], trainH: ['#121c4a', '#18245c', '#1e2c6e', '#283a86'], trainHS: ['#f2f2f2'],
  lariH: ['#e4e4e6', '#eeeef0', '#f8f8fa', '#ffffff'], lariHS: ['#d23a3a'],
  wasitH: ['#121214', '#1a1a1e', '#242428', '#323238'], wasitHS: ['#f0d020'], kartuK: ['#f0d020'], kartuM: ['#d02020'],
  batikHe: ['#1a3a3a', '#224848', '#2a5656', '#346868'], batikHeS: ['#0e2222'], batikHeK: ['#d8c080'], celHe: ['#202024', '#2a2a2e', '#343438', '#424248'],
});

/* ---------- wajah: alis tebal lurus, mata tegas, kumis tebal rapi tepat di bawah hidung (z 5 di kiri-kanan hidung), mulut z 4 */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'heSkinS', k: 'heKumis' };
const F0 = '..............';
const KUMIS = '..kkkk..kkkk..';
const F = (brow, eyes, mouth) => [F0, F0, F0, F0, brow, ...eyes, F0, F0, KUMIS, ...mouth, F0, F0];   // alis z 10 (di bawah lidah topi), mata z 9..8, kumis z 5, mulut z 4
const BROW = '.BBBBB..BBBBB.';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['...kmmmmmmk...', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['...kmmmmmmk...', F0, F0]),
  marah: F('...BBB..BBB...', EYE, ['...kmmmmmmk...', '....m....m....', F0]),
  teriak: F('...BBB..BBB...', EYE, ['...kmTTTTmk...', '....mttttm....', '.....mmmm.....']),   // "Lima putaran!"
  nyengir: F(BROW, EYE, ['...kTTTTTTk...', '....mmmmmm....', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...kTTTTTTk...', '....mttttm....', '.....mmmm.....']),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['...kmmmmmmk...', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'heSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'heSkin'); v.set(7, -1, 5, 'heSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'heSkin'); v.box(-1, y, 6, -1, y, 7, 'heSkinS'); }
  // cepak: lapis tipis rata
  const hair = new Vox();
  for (let z = 6; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'heHair', 4);
  hair.rrect(16, -6, -6, 5, 5, 'heHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 6)) v.set(x, y, z, c); });
  if (o.cap) {   // topi baseball merah: kubah menutup rambut di atas z 12, lidah topi ke depan, lis putih, tombol di puncak
    for (let z = 12; z <= 18; z++) { const r = z <= 15 ? 0 : z - 15; for (let x = -9 + r; x <= 8 - r; x++) for (let y = -9 + r; y <= 8 - r; y++) { const d = ((x + 0.5) / (8.8 - r)) ** 2 + ((y + 0.5) / (8.8 - r)) ** 2; if (d <= 1 && (d > 0.6 || z >= 17)) v.set(x, y, z, 'topiH'); } }
    v.each((x, y, z, c) => { if (c === 'heHair' && z >= 12 && ((x + 0.5) / 8.8) ** 2 + ((y + 0.5) / 8.8) ** 2 > 0.95) v.set(x, y, z, null); });   // rambut tidak tembus topi
    for (let x = 7; x <= 12; x++) for (let y = -6; y <= 5; y++) if (Math.abs(y + 0.5) <= 6 - Math.max(0, x - 10) * 2) v.set(x, y, 12, x === 12 || Math.abs(y + 0.5) > 5 - Math.max(0, x - 10) * 2 ? 'topiHS' : 'topiH');
    v.set(-1, -1, 19, 'topiHS'); v.set(-1, 0, 19, 'topiHS');
    for (let y = -2; y <= 1; y++) for (let z = 13; z <= 15; z++) { const x = v.front(y, z); if (x !== null && x <= 9) v.set(x, y, z, z === 14 ? 'topiHS' : 'topiH'); }   // logo garis putih
  }
  return v;
}

/* ---------- badan atletis (sisi +y; sisi -y = cermin) */
const bodyC = o => ({ olahraga: 'heKaus', wasit: 'wasitH', batik: 'batikHe' }[o.top]);
function whistle(v) {   // tali biru melingkar leher + peluit perak tergantung di dada
  for (let z = 49; z <= 57; z++) for (const y of [-4, 3]) { const yy = y + (z < 53 ? (y < 0 ? 1 : -1) * Math.round((53 - z) * 0.5) : 0); const x = v.front(yy, z); if (x !== null) v.set(x + 1, yy, z, 'taliH'); }
  for (let y = -1; y <= 0; y++) { v.set((v.front(y, 48) ?? 5) + 1, y, 48, 'taliH'); }
  v.box(5, -2, 45, 7, 1, 47, 'peluit'); v.set(8, -1, 46, 'peluit');
}
function chest(o) {
  const v = new Vox(), T = o.top, body = bodyC(o);
  for (let z = 34; z <= 56; z++) { const w = z <= 40 ? 1 : z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -8 + w + t, 4 - t, 7 - w - t, body, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'heSkin', 2);
  if (T === 'olahraga') {   // kaus olahraga merah: dua garis putih di bahu-samping, leher bulat putih, nomor 1 di punggung
    for (let z = 34; z <= 56; z++) for (const s of [-1, 1]) { const y = s > 0 ? v.sideP(0, z) : v.sideN(0, z); if (y !== null) { v.set(0, y, z, 'kausHS'); v.set(-1, y, z, 'kausHS'); } }
    for (let y = -2; y <= 1; y++) v.pf(y, 56, 'heSkin');
    v.shell(57, -3, -4, 3, 3, 'kausHS', 2);
    ['.X.', 'XX.', '.X.', '.X.', 'XXX'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'X') v.pb(1 - c, 52 - r, 'kausHS'); }));
    whistle(v);
    return v;
  }
  if (T === 'wasit') {   // kaus wasit hitam berkerah, lis kuning, kartu kuning & merah di saku dada
    for (let z = 57; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'wasitH', 2);
    for (let y = -5; y <= 4; y++) v.pb(y, 58, 'wasitHS');
    for (let z = 51; z <= 56; z++) v.pf(0, z, 'wasitHS');
    v.pfBox(2, 47, 5, 51, 'wasitH'); v.pf(3, 52, 'kartuK'); v.pf(4, 52, 'kartuM');
    whistle(v);
    return v;
  }
  v.each((x, y, z, k) => { if (k !== 'batikHe') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + z) % 5 + 5) % 5; if (a === 0) v.set(x, y, z, 'batikHeS'); else if (a === 2 && z % 3 === 0) v.set(x, y, z, 'batikHeK'); });
  for (let z = 34; z <= 55; z++) v.pf(-1, z, 'batikHeS');
  for (let z = 57; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'batikHe', 2);
  return v;
}
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-5, -7, 28, 4, 6, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'batik') { v.rbox(-5, -7, 32, 4, 6, 33, 'belt', 3); v.pfBox(-1, 32, 0, 33, 'buckle'); }
  else for (let z = 32; z <= 33; z++) v.shell(z, -5, -7, 4, 6, z === 33 ? 'trainHS' : c, 3);   // karet pinggang
  return v;
}
const legC = o => o.top === 'batik' ? 'celHe' : o.top === 'wasit' ? 'wasitH' : 'trainH';
const sleeveC = o => bodyC(o);
function arm(o) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-3, 7, 43, 2, 12, 55, 'heSkin', 2); v.rrect(56, -3, 7, 2, 12, c, 3);
  v.paint(-3, 7, 49, 2, 12, 56, c); v.shell(49, -4, 7, 3, 13, o.top === 'olahraga' ? 'kausHS' : o.top === 'wasit' ? 'wasitHS' : c, 2);
  if (o.top === 'olahraga') for (let z = 49; z <= 56; z++) { v.set(0, 12, z, 'kausHS'); v.set(-1, 12, z, 'kausHS'); }
  return v;
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-3, 7, 31, 2, 12, 42, 'heSkin', 2);
  v.rbox(-3, 7, 27, 3, 12, 30, 'heSkin', 2); v.rrect(26, -2, 8, 2, 11, 'heSkin', 2);
  if (side < 0) v.paint(-3, 7, 30, 2, 12, 31, 'wasitH');   // jam stopwatch digital hitam
  if (side < 0) v.set(3, 9, 31, 'peluit');
  if (side > 0 && o.top === 'olahraga') {   // papan jalan (clipboard) di tangan kanan
    v.rbox(-4, 6, 18, 5, 7, 30, 'lariH', 0); v.paint(-4, 6, 29, 5, 7, 30, 'peluit'); for (let z = 20; z <= 27; z += 2) v.paint(-2, 6, z, 3, 6, z, 'trainH');
  }
  return v;
}
function thigh(o) {
  const c = legC(o), v = new Vox(); v.rbox(-4, 2, 18, 3, 7, 31, c, 3); v.rrect(32, -3, 2, 2, 7, c, 3);
  if (o.top !== 'batik') for (let z = 18; z <= 32; z++) v.set(0, 7, z, o.top === 'wasit' ? 'wasitHS' : 'trainHS');
  if (o.top === 'wasit') v.paint(-4, 2, 18, 3, 7, 22, 'heSkin');   // celana pendek wasit
  return v;
}
function shin(o) {
  const c = o.top === 'wasit' ? 'heSkin' : legC(o), v = new Vox(); v.rbox(-4, 2, 6, 3, 7, 18, c, 3); v.rrect(19, -3, 2, 2, 7, c, 3);
  if (o.top === 'olahraga') for (let z = 6; z <= 18; z++) v.set(0, 7, z, 'trainHS');
  if (o.top === 'wasit') v.paint(-4, 2, 6, 3, 7, 15, 'wasitH');   // kaus kaki panjang hitam
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'batik') { v.rbox(-4, 1, 0, 7, 8, 0, 'belt', 3); v.rbox(-4, 1, 1, 7, 8, 3, 'wasitH', 3); v.rbox(-4, 2, 4, 2, 7, 5, 'wasitH', 2); return v; }
  v.rbox(-4, 1, 0, 7, 8, 1, 'sole', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'lariH', 3); v.rbox(-4, 1, 5, 2, 8, 6, 'lariH', 3);   // sepatu lari putih
  for (const y of [1, 8]) v.paint(-2, y, 3, 5, y, 3, 'lariHS');
  for (const x of [2, 4]) v.paint(x, 3, 4, x, 6, 4, 'lace');
  return v;
}

export const OUTFITS = {
  olahraga: { name: 'Mengajar: kaus olahraga merah + training + topi + peluit + papan jalan', top: 'olahraga', cap: true },
  wasit: { name: 'Wasit futsal / liga resmi: kaus wasit hitam + kartu + peluit', top: 'wasit' },
  batik: { name: 'Jumat: batik hijau toska lengan pendek + celana bahan', top: 'batik' },
};
OUTFITS.kerja = { ...OUTFITS.olahraga, propOn: 'ajar', name: 'Kerja: kaus olahraga biru sekolah, topi biru, peluit',
  sw: { heKaus: 'heKausB', topiH: 'heKausB' } };
const SARUNG_HE = v => motifKotak(v, 'heSarung', 'heSarungK', 3, ['celHe']);
OUTFITS.rumah = { ...OUTFITS.batik, name: 'Rumah: kaus oblong putih + sarung kotak',
  sw: { batikHe: 'heOblong', batikHeS: 'heOblong', batikHeK: 'heOblong' },
  fx: { pelvis: SARUNG_HE, thighR: SARUNG_HE, thighL: SARUNG_HE, shinR: SARUNG_HE, shinL: SARUNG_HE } };
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  // game memanggil 'seragam': Pak Hendro memakai baju olahraga
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.olahraga), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'heSkin', shoulder: sl, elbow: 'heSkin', hip: leg, knee: o.top === 'wasit' ? 'heSkin' : leg }, SKEL, TAIL);
}
