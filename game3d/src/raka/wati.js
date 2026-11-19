// Bu Wati: teller & customer service Bank Kota Raya di Pusat Kota, 30-an, sabar dan rapi, suka menjelaskan pelan-pelan
// ("Mau buka tabungan pelajar?"). Kulit sawo matang terang, alis rapi, lipstik nude, berjilbab. Kantor: jilbab segi empat
// marun berbros emas + blazer biru dongker lis emas + blus putih + kartu pegawai + rok span hitam panjang + pantofel + buku
// tabungan & brosur. Akhir pekan: jilbab peach + tunik hijau mint + kulot krem + tas selempang kecil + sepatu flat.
// Rangka keluarga Nadia, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  wtSkin: ['#b07a52', '#c08a60', '#cc9a70', '#d8a87e'], wtSkinS: ['#b07650'], wtBlush: ['#d48a78'], wtLip: ['#a85a50'],
  wtJilbab: ['#6a1a2a', '#7a2232', '#8a2a3c', '#9c3448'], wtJilbabS: ['#521220'], wtEmas: ['#c8a038', '#d8b044', '#e6c052', '#f2d064'],
  wtBlazer: ['#1a2440', '#222e4e', '#2a385c', '#34446c'], wtBlazerS: ['#121a30'], wtBlus: ['#e8e8ea', '#f2f2f4', '#f8f8fa', '#ffffff'],
  wtRok: ['#16161a', '#1e1e22', '#28282e', '#34343a'], wtRokS: ['#0c0c0e'], wtKartu: ['#f4f4f6'], wtTali: ['#7a2232'],
  wtBuku: ['#2a6a4a', '#347a56', '#3e8a62', '#4a9a70'], wtBrosur: ['#f2e6c8'], wtBrosurS: ['#7a2232'],
  wtPeach: ['#e0987a', '#e8a688', '#f0b498', '#f6c2a8'], wtPeachS: ['#c87e62'],
  wtTunik: ['#7ac0a8', '#88ccb4', '#98d6c0', '#a8e0cc'], wtTunikS: ['#5aa088'], wtKulot: ['#d8c8a8', '#e0d2b4', '#e8dcc0', '#f0e6cc'], wtKulotS: ['#b8a888'],
  wtTas: ['#8a5a3a', '#966444', '#a2704e', '#ae7c5a'], wtFlat: ['#c8b090'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'wtLip', T: 'teeth', t: 'tongue', r: 'wtBlush', s: 'wtSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['.KKKK....KKKK.', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', 'r............r', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', 'r............r', F0]),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', F0, F0]),   // antrean nyerobot
  teriak: F('..BBB....BBB..', ['.KKKK....KKKK.', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....', 'rr..........rr']),   // senyum pelayanan prima
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', 'rr..........rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const W = o => o.top === 'kantor';
const jc = o => W(o) ? 'wtJilbab' : 'wtPeach';
const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const open = (y, z) => { const dy = (y + 0.5) / 6.4, dz = (z - 5.5) / 6.9; return dy * dy + dz * dz <= 1; };
function head(o) {
  const v = new Vox(), c = jc(o);
  for (let z = 0; z <= 14; z++) { const [a, b, cc, d, r] = skull(z); v.rrect(z, a, b, cc, d, 'wtSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'wtSkin'); v.set(7, -1, 5, 'wtSkinS');
  // jilbab: bukaan wajah oval sampai alis, menutup leher & jatuh ke dada; segi empat (kantor) lebih tegas di dahi
  const h = new Vox();
  for (let z = 1; z <= 14; z++) h.rrect(z, -8, -8, 7, 7, c, z <= 11 ? 4 : 5);
  h.rrect(15, -7, -7, 6, 6, c, 4); h.rrect(16, -5, -5, 4, 4, c, 3);
  for (let z = -6; z <= 0; z++) h.rrect(z, -7, -8, 7, 7, c, 4);
  h.each((x, y, z, k) => { if (v.has(x, y, z)) return; if (x >= 3 && z >= 0 && open(y, z)) return; v.set(x, y, z, k); });
  for (let z = 0; z <= 13; z++) for (let y = -9; y <= 8; y++) { const x = v.front(y, z); if (x !== null && x >= 6 && v.get(x, y, z) === c && open(y + (y < 0 ? 1 : -1), z)) v.set(x, y, z, c + 'S'); }
  for (let y = -6; y <= 5; y++) { const x = v.front(y, 13); if (x !== null && v.get(x, y, 13) === c) v.set(x + (W(o) ? 1 : 0), y, 13, c + 'S'); }   // lipatan dahi
  if (W(o)) { const x = v.front(-1, -2); if (x !== null) { v.box(x + 1, -1, -3, x + 1, 0, -2, 'wtEmas'); } }   // bros emas di dagu
  return v;
}

/* ---------- badan */
const topC = o => W(o) ? 'wtBlazer' : 'wtTunik';
function chest(o) {
  const v = new Vox(), c = topC(o), j = jc(o);
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -5, -7 + t + w, 4 - t, 6 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, j, 1);
  if (W(o)) {
    for (let z = 33; z <= 47; z++) { const hw = Math.max(1, Math.round((z - 33) * 0.3)); for (let y = -hw; y <= hw - 1; y++) v.pf(y, z, 'wtBlus'); }   // blus putih di bukaan V blazer
    for (let z = 33; z <= 47; z++) { const hw = Math.max(1, Math.round((z - 33) * 0.3)) + 1; for (const y of [-hw, hw - 1]) v.pf(y, z, 'wtEmas'); }   // lis emas kerah
    for (const z of [36, 40]) v.pf(-2, z, 'wtEmas');   // kancing
    for (let z = 32; z <= 33; z++) v.shell(z, -5, -7, 4, 6, 'wtBlazerS', 3);
    // kartu pegawai bertali marun
    for (let z = 38; z <= 46; z++) { const x = v.front(4, z); if (x !== null) v.set(x + 1, 4, z, 'wtTali'); }
    { const x = v.front(4, 36); v.box(x + 1, 3, 34, x + 1, 5, 37, 'wtKartu'); v.set(x + 1, 4, 36, 'wtBlazer'); }
  } else for (let z = 33; z <= 47; z++) v.pf(-1, z, 'wtTunikS');
  // jilbab jatuh menutup dada atas & punggung atas
  for (let z = 46; z <= 54; z++) { const k = Math.min(2, Math.floor((55 - z) / 3)); for (let y = -8 - k; y <= 7 + k; y++) for (let x = -6 - k; x <= 5 + k; x++) { if (z <= 49 && x < 1 && Math.abs(y + 0.5) < 6.5) continue; if (!v.has(x, y, z) || (z >= 48 && Math.abs(y + 0.5) < 7.5 && (x === v.front(y, z) || x === v.back(y, z)))) v.set(x, y, z, j); } }
  for (let y = -8; y <= 7; y++) { const x = v.front(y, 46); if (x !== null && v.get(x, y, 46) === j) v.set(x, y, 46, j + 'S'); }
  return v;
}
function pelvis(o) {
  if (W(o)) { const v = skirtPelvis('wtRok', 'wtRokS', 22); for (let z = 27; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 27 ? 'wtBlazerS' : 'wtBlazer', 3); return v; }   // ujung blazer menutup pinggul
  const v = new Vox(); v.rbox(-4, -6, 26, 4, 5, 33, 'wtKulot', 3); v.box(-3, -2, 24, 2, 1, 25, 'wtKulot');
  for (let z = 22; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 22 ? 'wtTunikS' : 'wtTunik', 3);   // tunik panjang sampai paha
  return v;
}
function arm(o) { const v = new Vox(), c = topC(o); v.rbox(-2, 6, 40, 2, 10, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2); return v; }
function fore(o, side) {
  const v = new Vox(), c = topC(o);
  v.rbox(-2, 6, 31, 2, 10, 39, c, 2);
  v.paint(-2, 6, 31, 2, 10, 31, W(o) ? 'wtBlus' : 'wtTunikS');
  v.rbox(-2, 6, 27, 3, 10, 30, 'wtSkin', 2); v.rrect(26, -1, 7, 2, 9, 'wtSkin', 1);
  if (W(o) && side < 0) { v.paint(-2, 6, 32, 2, 10, 32, 'wtEmas'); }   // jam tangan
  if (W(o) && side > 0) {   // buku tabungan hijau + brosur "Tabungan Pelajar"
    v.rbox(3, 6, 22, 5, 11, 30, 'wtBuku', 0); for (let y = 7; y <= 10; y++) v.set(5, y, 28, 'wtEmas');
    for (let z = 20; z <= 32; z++) for (let y = 11; y <= 13; y++) v.set(4, y, z, z >= 29 ? 'wtBrosurS' : 'wtBrosur');
  }
  if (!W(o) && side < 0) { v.rbox(-3, 11, 20, 3, 13, 25, 'wtTas', 1); v.set(3, 12, 23, 'wtEmas'); }   // tas selempang kecil
  return v;
}
function legs(o) {
  if (W(o)) return [skirtThigh('wtRok'), skirtShin('wtRok', 'wtRokS')];
  const th = new Vox(); th.rbox(-4, 0, 17, 3, 8, 31, 'wtKulot', 3);
  const sn = new Vox(); for (let z = 5; z <= 17; z++) { const f = z <= 9 ? 1 : 0; sn.rrect(z, -4 - f, 0 - f, 3 + f, 8 + f, 'wtKulot', 3); }
  for (let z = 6; z <= 16; z++) sn.set(sn.front(4, z) ?? 3, 4, z, 'wtKulotS');
  return [th, sn];
}
function foot(o) {
  const v = new Vox();
  if (W(o)) { v.rbox(-4, 1, 0, 6, 6, 2, 'wtRok', 2); v.rbox(-3, 2, 3, 2, 5, 4, 'wtSkin', 2); v.set(6, 3, 2, 'wtEmas'); v.set(6, 4, 2, 'wtEmas'); return v; }   // pantofel
  v.rbox(-4, 1, 0, 6, 6, 1, 'wtFlat', 2); v.rbox(-4, 1, 2, 6, 6, 2, 'wtTas', 2); v.rbox(-3, 2, 3, 2, 5, 4, 'wtSkin', 2);
  return v;
}

export const OUTFITS = {
  kantor: { name: 'Kantor bank: jilbab marun bros emas + blazer biru dongker lis emas + blus putih + kartu pegawai + rok span hitam + pantofel + buku tabungan & brosur', top: 'kantor' },
  libur: { name: 'Akhir pekan: jilbab peach + tunik mint + kulot krem + tas selempang kecil + sepatu flat', top: 'libur', propOn: 'all' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.kantor), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), [Th, Sn] = legs(o), Ft = foot(o), sl = topC(o), leg = W(o) ? 'wtRok' : 'wtKulot';
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', W(o) && skirtPanel('wtRok', 'wtRokS', 1, 5), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', W(o) && skirtPanel('wtRok', 'wtRokS', -1, 5), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: jc(o), shoulder: sl, elbow: sl, hip: leg, knee: leg }, SKEL, TAIL);
  if (W(o)) P.skirt = skirtInfo(P, 'wtRok', 'wtRokS');
  return P;
}
