// Pak Polisi Sugeng: polantas di simpang lampu merah Pusat Kota, 40-an, tegas tapi kebapakan ("Helmnya dipakai, Mas!").
// Kulit sawo matang, kumis rapi, rahang kotak. Atur lalu lintas: helm putih polantas + rompi hijau stabilo bergaris reflektor
// tulisan POLISI + seragam cokelat + sarung tangan putih + peluit di mulut tali + sepatu hitam mengilap.
// Dinas: topi pet cokelat + seragam berpangkat + kopel. Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  sgSkin: ['#8e5a36', '#a26a40', '#b47a4c', '#c48a5a'], sgSkinS: ['#985f3a'], sgHair: ['#0e0c0a', '#161210', '#201a16', '#2c241e'], sgKumis: ['#120e0c'],
  sgSeragam: ['#7a6a4a', '#887856', '#968662', '#a69670'], sgSeragamS: ['#5a4c32'], sgCelana: ['#4a3a28', '#56442e', '#624e36', '#705a3e'],
  sgRompi: ['#a8d818', '#b8e428', '#c8ee3a', '#d6f450'], sgRompiS: ['#88b00e'], sgRefl: ['#e8eaee'], sgTulis: ['#1a1a1e'],
  sgHelm: ['#d8dade', '#e6e8ec', '#f2f3f6', '#fbfbfd'], sgHelmS: ['#b8bcc4'], sgVisor: ['#2a2a30'], sgHitam: ['#0c0c0e', '#141416', '#1e1e22', '#2e2e36'],
  sgSarung: ['#e8e8e6', '#f2f2f0', '#f8f8f6', '#ffffff'], sgEmas: ['#c8a030', '#d8b03c', '#e6c04c', '#f2d060'], sgPeluit: ['#c8ccd4'], sgTali: ['#f2c230'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'sgSkinS', k: 'sgKumis' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, '....kkkkkk....', ...mouth, F0, F0];   // alis z 11, kumis z 5, mulut z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....mmmmmm....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['....mmmmmm....', F0, F0]),
  marah: F('...BBB..BBB...', EYE, ['....mmmmmm....', '...m......m...', F0]),   // "Berhenti! Mana SIM-nya?"
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-4, -6, 5, 5, 2] : z === 1 ? [-6, -7, 6, 6, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];   // rahang kotak
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'sgSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'sgSkin'); v.set(7, -1, 5, 'sgSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'sgSkin'); v.box(-1, y, 6, -1, y, 7, 'sgSkinS'); }
  const hair = new Vox();   // cepak rapi
  for (let z = 7; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'sgHair', 4);
  hair.rrect(16, -6, -6, 5, 5, 'sgHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 10 : 7)) v.set(x, y, z, c); });
  if (o.top === 'lantas') {   // helm polantas putih: kubah elips, lis hitam, visor gelap terangkat, lambang emas di depan
    for (let z = 12; z <= 21; z++) for (let x = -10; x <= 9; x++) for (let y = -10; y <= 9; y++) {
      const d = ((x + 0.5) / 9.4) ** 2 + ((y + 0.5) / 9.2) ** 2 + (Math.max(0, z - 14) / 7.5) ** 2;
      if (d <= 1 && (d > 0.62 || z >= 20) && !(x >= 4 && z <= 13)) v.set(x, y, z, z === 12 || z === 13 ? 'sgHitam' : 'sgHelm');
    }
    for (let y = -5; y <= 4; y++) { const x = v.front(y, 16); if (x !== null) v.set(x + 1, y, 16, 'sgVisor'); }
    for (const [y, z] of [[-1, 18], [0, 18], [-1, 19], [0, 19]]) { const x = v.front(y, z); v.set(x, y, z, 'sgEmas'); }
  } else {   // topi pet cokelat dinas
    for (let z = 13; z <= 19; z++) for (let x = -9; x <= 9; x++) for (let y = -9; y <= 8; y++) {
      const r = z >= 18 ? 1.08 : 1, d = ((x + 0.5) / (8.7 * r)) ** 2 + ((y + 0.5) / (8.5 * r)) ** 2;
      if (d <= 1 && (d > 0.6 || z >= 19)) v.set(x, y, z, z === 14 ? 'sgEmas' : 'sgCelana');
    }
    for (let x = 7; x <= 12; x++) for (let y = -7; y <= 6; y++) if (Math.abs(y + 0.5) <= 7 - Math.max(0, x - 10) * 2) v.set(x, y, 13, 'sgHitam');
    for (const [y, z] of [[-1, 16], [0, 16], [-1, 17], [0, 17]]) { const x = v.front(y, z); v.set(x + 1, y, z, 'sgEmas'); }
  }
  return v;
}

function chest(o) {
  const v = new Vox(), L = o.top === 'lantas';
  for (let z = 34; z <= 56; z++) { const w = z <= 40 ? 1 : z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -9 + w + t, 4 - t, 8 - w - t, 'sgSeragam', z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'sgSkin', 2);
  for (let z = 56; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'sgSeragam', 2);
  for (let z = 35; z <= 55; z++) v.pf(-1, z, 'sgSeragamS');
  v.pfBox(3, 50, 6, 51, 'sgHitam'); v.pf(-5, 51, 'sgEmas'); v.pf(-4, 51, 'sgEmas');   // papan nama & lencana
  if (L) {   // rompi stabilo: depan & belakang, dua garis reflektor, tulisan POLISI di punggung
    for (let z = 36; z <= 55; z++) for (let y = -8; y <= 7; y++) { if (Math.abs(y + 0.5) < 2 && z > 48) continue; const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf + 1, y, z, 'sgRompi'); if (xb !== null) v.set(xb - 1, y, z, 'sgRompi'); }
    for (const z of [37, 48]) for (let y = -9; y <= 8; y++) { const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf, y, z, 'sgRefl'); if (xb !== null) v.set(xb, y, z, 'sgRefl'); }
    const LT = { P: ['XX', 'XX', 'X.', 'X.', 'X.'], O: ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'], L: ['X.', 'X.', 'X.', 'X.', 'XX'], I: ['X', 'X', 'X', 'X', 'X'], S: ['XXX', 'X..', 'XXX', '..X', 'XXX'] };
    let y0 = 8; for (const ch of 'POLISI') { LT[ch].forEach((row, r) => [...row].forEach((cc, k) => { if (cc === 'X') { const y = y0 - k, z = 46 - r, x = v.back(y, z); if (x !== null) v.set(x, y, z, 'sgTulis'); } })); y0 -= LT[ch][0].length + 1; }
    for (let z = 48; z <= 55; z++) v.pf(-1, z, 'sgRompiS');
    for (let z = 46; z <= 56; z++) { const y = Math.round((z - 46) * 0.5) - 3, x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'sgTali'); }   // tali peluit
    v.box(v.front(-3, 46) + 1, -4, 45, v.front(-3, 46) + 1, -3, 45, 'sgPeluit');
  }
  return v;
}
function pelvis(o) {
  const v = new Vox();
  v.rbox(-5, -8, 28, 4, 7, 33, 'sgCelana', 3); v.box(-4, -2, 26, 3, 1, 27, 'sgCelana');
  v.shell(33, -6, -9, 5, 8, 'sgHitam', 3); for (const y of [-1, 0]) { const x = v.front(y, 33); v.set(x, y, 33, 'sgEmas'); }
  if (o.top === 'lantas') for (let z = 30; z <= 32; z++) v.shell(z, -6, -9, 5, 8, 'sgRompi', 3);
  return v;
}
function arm(o) { const v = new Vox(); v.rbox(-3, 8, 43, 2, 13, 55, 'sgSkin', 2); v.rrect(56, -3, 8, 2, 13, 'sgSeragam', 3); v.paint(-3, 8, 48, 2, 13, 56, 'sgSeragam'); v.shell(48, -4, 7, 3, 14, 'sgSeragamS', 2); v.psBox(1, -1, 51, 1, 54, 'sgEmas'); return v; }
function fore(o, side) {
  const v = new Vox(), L = o.top === 'lantas';
  v.rbox(-3, 8, 31, 2, 13, 42, 'sgSkin', 2);
  v.rbox(-3, 8, 27, 3, 13, 30, L ? 'sgSarung' : 'sgSkin', 2); v.rrect(26, -2, 9, 2, 12, L ? 'sgSarung' : 'sgSkin', 2);
  if (L) v.rbox(-4, 7, 31, 3, 14, 33, 'sgSarung', 2);   // sarung tangan putih bermanset
  if (side < 0 && !L) v.paint(-3, 8, 31, 2, 13, 32, 'sgHitam');
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-4, 2, 18, 3, 8, 31, 'sgCelana', 3); v.rrect(32, -3, 2, 2, 8, 'sgCelana', 3); return v; }
function shin() { const v = new Vox(); v.rbox(-4, 2, 6, 3, 8, 18, 'sgCelana', 3); v.rrect(19, -3, 2, 2, 8, 'sgCelana', 3); return v; }
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 1, 'sgHitam', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'sgHitam', 3); v.rbox(-4, 1, 5, 3, 8, 6, 'sgHitam', 3);
  v.set(6, 4, 4, 'sgSarung');   // kilap
  return v;
}

export const OUTFITS = {
  lantas: { name: 'Atur lalu lintas: helm putih + rompi stabilo POLISI + sarung tangan putih + peluit', top: 'lantas' },
  dinas: { name: 'Dinas: topi pet cokelat + seragam berpangkat + kopel + jam tangan', top: 'dinas' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.lantas), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'sgSkin', shoulder: 'sgSeragam', elbow: 'sgSkin', hip: 'sgCelana', knee: 'sgCelana' }, SKEL, TAIL);
}
