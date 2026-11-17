// Mbak Rini: ibu muda Kenanga, 20-an, selalu menggendong bayinya (Dek Bilqis) pakai kain jarik. Rambut dicepol asal,
// kantung mata (kurang tidur), kaus longgar + kulot, sandal jepit. Ke posyandu pakai kerudung instan + tunik.
// Rangka keluarga Nadia, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  riSkin: ['#b07a50', '#c48a5e', '#d49c70', '#e2ae84'], riSkinS: ['#bc8458'], riBlush: ['#d88a76'], riKantung: ['#a8785a'],
  riHair: ['#141010', '#1c1614', '#261e1a', '#322822'], riIkat: ['#e05a8a'],
  kausRi: ['#e89aa8', '#f0a8b6', '#f6b8c4', '#facad4'], kausRiS: ['#c87a8a'], kulotRi: ['#4a4a5a', '#56566a', '#62627a', '#72728c'], kulotRiS: ['#3a3a48'],
  jarik: ['#6a3a1a', '#7a4622', '#8c522c', '#a06438'], jarikS: ['#3a1e0a'], jarikK: ['#e8c890'],
  bayi: ['#d8a080', '#e4b090', '#ecbea0', '#f4ccb0'], bayiTopi: ['#f2e070', '#f6e888', '#faf0a0', '#fdf6be'], bayiTopiS: ['#d8c050'],
  kerRi: ['#5a7ab8', '#6688c6', '#7496d2', '#86a6de'], kerRiS: ['#46609a'], tunikRi: ['#e8dcc4', '#f0e6d2', '#f6eee0', '#fbf6ec'], tunikRiS: ['#cfc2a6'],
  jepitRi: ['#e86a9a', '#f07aa6', '#f68ab2', '#fa9cc0'], bukuKia: ['#e8c848'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'riBlush', s: 'riSkinS', k: 'riKantung' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, '..kkk....kkk..', F0, F0, ...mouth, F0, F0];   // alis z 11, mata z 9..8, kantung mata z 7, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['.sKKK....KKKs.', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0, F0]),
  kedip: F(BROW, [F0, '.sKKK....KKKs.'], ['.....mmmm.....', F0, F0]),
  marah: F('...BBB..BBB...', ['..KKK....KKK..', '..WKK....KKW..'], ['....mmmmmm....', F0, F0]),   // "Ssst, bayinya baru tidur."
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....', 'rr........rr..'.padEnd(14, '.')]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', 'rr..........rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const open = (y, z) => { const dy = (y + 0.5) / 6.4, dz = (z - 5.5) / 6.9; return dy * dy + dz * dz <= 1; };
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'riSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'riSkin'); v.set(7, -1, 5, 'riSkinS');
  if (o.hijab) {   // kerudung instan biru: bukaan wajah sampai alis, jatuh menutup dada atas
    const c = o.hijab, h = new Vox();
    for (let z = 1; z <= 14; z++) h.rrect(z, -8, -8, 7, 7, c, z <= 11 ? 4 : 5);
    h.rrect(15, -7, -7, 6, 6, c, 4); h.rrect(16, -5, -5, 4, 4, c, 3);
    for (let z = -6; z <= 0; z++) h.rrect(z, -7, -8, 7, 7, c, 4);
    h.each((x, y, z, k) => { if (v.has(x, y, z)) return; if (x >= 3 && z >= 0 && open(y, z)) return; v.set(x, y, z, k); });
    for (let z = 0; z <= 13; z++) for (let y = -9; y <= 8; y++) { const x = v.front(y, z); if (x !== null && x >= 6 && v.get(x, y, z) === c && open(y + (y < 0 ? 1 : -1), z)) v.set(x, y, z, c + 'S'); }
    return v;
  }
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'riSkin'); v.box(-1, y, 6, -1, y, 7, 'riSkinS'); }
  // rambut ditarik ke belakang, anak rambut berantakan di pelipis, cepol asal di puncak belakang + ikat pink
  const hair = new Vox();
  for (let z = 5; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'riHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -6, -6, 5, 5, 'riHair', 4);
  const zmin = (x, y) => x >= 5 ? (Math.abs(y + 0.5) > 4.5 ? 12 : 14) : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 5;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (const [x, y, z] of [[6, -8, 11], [6, -8, 10], [6, 7, 11], [5, 7, 10], [6, 7, 9]]) v.set(x, y, z, 'riHair');   // anak rambut
  for (let x = -12; x <= -4; x++) for (let y = -5; y <= 4; y++) for (let z = 14; z <= 21; z++) { const d = ((x + 7.5) / 3.8) ** 2 + ((y + 0.5) / 4.2) ** 2 + ((z - 17.5) / 3.4) ** 2; if (d <= 1 && !v.has(x, y, z)) v.set(x, y, z, 'riHair'); }
  for (let y = -3; y <= 2; y++) for (const [x, z] of [[-5, 15], [-6, 14], [-4, 16]]) if (!v.has(x, y, z) || v.get(x, y, z) === 'riHair') v.set(x, y, z, 'riIkat');
  v.set(-11, -3, 20, 'riHair'); v.set(-12, 2, 18, 'riHair');   // ujung cepol mencuat
  return v;
}

/* ---------- badan + gendongan bayi (sisi +y; sisi -y = cermin) */
const topC = o => o.top === 'gendong' ? 'kausRi' : 'tunikRi';
const jarikPat = v => { v.each((x, y, z, k) => { if (k !== 'jarik') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + z) % 5 + 5) % 5; if (a === 0) v.set(x, y, z, 'jarikS'); else if (a === 2 && z % 2 === 0) v.set(x, y, z, 'jarikK'); }); return v; };
function baby(v) {   // bayi digendong menghadap ibu di dada, hanya kepala bertopi kuning & punggung kain yang kelihatan
  for (let x = 4; x <= 11; x++) for (let y = -6; y <= 5; y++) for (let z = 33; z <= 45; z++) { const d = ((x - 7.5) / 4) ** 2 + ((y + 0.5) / 6) ** 2 + ((z - 39) / 6.5) ** 2; if (d <= 1 && !v.has(x, y, z)) v.set(x, y, z, 'jarik'); }
  for (let x = 4; x <= 11; x++) for (let y = -5; y <= 4; y++) for (let z = 44; z <= 52; z++) { const d = ((x - 7.5) / 3.6) ** 2 + ((y + 0.5) / 4.4) ** 2 + ((z - 48) / 4) ** 2; if (d <= 1) v.set(x, y, z, z >= 49 ? 'bayiTopi' : 'bayi'); }
  for (let y = -5; y <= 4; y++) { const x = v.front(y, 49); if (x !== null) v.set(x, y, 49, 'bayiTopiS'); }
  v.set(11, -1, 47, 'bayi');   // pipi tembem kelihatan dari samping
}
function sling(v) {   // kain jarik diselempangkan dari bahu kanan ke pinggang kiri (depan & belakang)
  for (let z = 30; z <= 53; z++) { const t = (z - 30) / 23, y = Math.round(-7 + t * 14); for (let dy = -2; dy <= 2; dy++) { const yy = y + dy; if (yy < -9 || yy > 8) continue; const xf = v.front(yy, z), xb = v.back(yy, z); if (xf !== null && v.get(xf, yy, z) !== 'bayi' && v.get(xf, yy, z) !== 'bayiTopi' && v.get(xf, yy, z) !== 'bayiTopiS') v.set(xf + (v.get(xf, yy, z) === 'jarik' ? 0 : 1), yy, z, 'jarik'); if (xb !== null) v.set(xb - 1, -1 - yy, z, 'jarik'); } }
  for (let y = 4; y <= 8; y++) for (let z = 50; z <= 54; z++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'jarik'); }
  jarikPat(v);
}
function chest(o) {
  const v = new Vox(), c = topC(o);
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -5, -7 + t + w, 4 - t, 6 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, o.hijab || 'riSkin', 1);
  if (o.top === 'gendong') { for (let y = -3; y <= 2; y++) v.pf(y, 51, 'riSkin'); v.shell(51, -4, -5, 4, 4, 'kausRiS', 3); }
  if (o.top === 'posyandu') { for (let z = 33; z <= 50; z++) v.pf(-1, z, 'tunikRiS'); }
  if (o.hijab) for (let z = 45; z <= 54; z++) { const k = Math.min(2, Math.floor((55 - z) / 3)); for (let y = -8 - k; y <= 7 + k; y++) for (let x = -6 - k; x <= 5 + k; x++) { if (z <= 48 && x < 1 && Math.abs(y + 0.5) < 6.5) continue; if (!v.has(x, y, z)) v.set(x, y, z, o.hijab); } }
  baby(v); sling(v);
  return v;
}
function pelvis(o) {
  const v = new Vox(), c = topC(o);
  v.rbox(-5, -7, 26, 4, 6, 33, 'kulotRi', 3); v.box(-3, -2, 24, 2, 1, 25, 'kulotRi');
  for (let z = o.top === 'posyandu' ? 22 : 28; z <= 33; z++) v.shell(z, -6, -8, 5, 7, c, 3);   // kaus longgar / tunik panjang menutup pinggul
  for (let z = 28; z <= 33; z++) { const t = (z - 28) / 23 * 1, y = Math.round(-7 + (z - 30) / 23 * 14); for (let dy = -2; dy <= 2; dy++) { const yy = y + dy; if (yy < -8 || yy > 7) continue; const xf = v.front(yy, z), xb = v.back(yy, z); if (xf !== null) v.set(xf + 1, yy, z, 'jarik'); if (xb !== null) v.set(xb - 1, -1 - yy, z, 'jarik'); } }
  return jarikPat(v);
}
function arm(o) { const v = new Vox(), c = topC(o); v.rbox(-2, 6, 40, 2, 10, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2); return v; }
function fore(o, side) {
  const v = new Vox(), P = o.top === 'posyandu';
  v.rbox(-2, 6, 31, 2, 10, 39, P ? 'tunikRi' : 'riSkin', 2);
  v.rbox(-2, 6, 27, 3, 10, 30, 'riSkin', 2); v.rrect(26, -1, 7, 2, 9, 'riSkin', 1);
  if (side < 0 && P) { v.rbox(-3, 5, 17, 3, 6, 27, 'bukuKia', 0); v.paint(3, 5, 18, 3, 6, 26, 'tunikRi'); }   // buku KIA kuning
  return v;
}
function thigh() { const v = new Vox(); v.rbox(-4, 0, 17, 3, 7, 30, 'kulotRi', 3); v.rrect(31, -3, 1, 2, 6, 'kulotRi', 3); return v; }
function shin() { const v = new Vox(); v.rbox(-4, 0, 8, 3, 7, 17, 'kulotRi', 3); v.rrect(18, -3, 1, 2, 6, 'kulotRi', 3); v.shell(8, -5, -1, 4, 8, 'kulotRiS', 3); v.rbox(-2, 2, 5, 2, 5, 7, 'riSkin', 2); return v; }
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 6, 6, 0, 'jepitRi', 2); v.rbox(-3, 2, 1, 5, 5, 2, 'riSkin', 2); v.rbox(-3, 2, 3, 1, 5, 4, 'riSkin', 2);
  for (const [x, y] of [[4, 4], [3, 3], [3, 5], [2, 2], [2, 6]]) v.set(x, y, 2, 'jepitRi');
  return v;
}

export const OUTFITS = {
  gendong: { name: 'Sehari-hari: cepol + kaus pink longgar + kulot + gendongan jarik + bayi', top: 'gendong' },
  posyandu: { name: 'Ke posyandu: kerudung instan biru + tunik krem + gendongan + buku KIA', top: 'posyandu', hijab: 'kerRi' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.gendong), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = topC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: o.hijab || 'riSkin', shoulder: sl, elbow: o.top === 'posyandu' ? sl : 'riSkin', hip: 'kulotRi', knee: 'kulotRi' }, SKEL, TAIL);
}
