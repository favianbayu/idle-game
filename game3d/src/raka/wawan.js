// Pak Wawan: guru BK / tata tertib yang patroli mencari murid bolos, 50-an. Seragam PNS khaki dengan tali bahu, papan
// nama, pin Korpri, perut agak buncit, rambut belah samping berminyak, kumis lebat melengkung, buku pelanggaran merah di
// tangan kiri, pulpen di saku. Rangka keluarga Arga (skala 1.3) dengan perut, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 7, ballR: 1.05 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  waSkin: ['#9e6a46', '#b88058', '#c98e66', '#d6a07a'], waSkinS: ['#b07a54'], waKumis: ['#0e0a08'],
  waHair: ['#120e0c', '#1a1410', '#241c16', '#32281e'], waHairT: ['#4a3e34'],
  khaki: ['#9a8a5e', '#ae9e70', '#c0b082', '#d0c094'], khakiS: ['#7a6c46'], celKhaki: ['#4a3c2c', '#584836', '#665440', '#76624e'],
  bukuW: ['#8a1a1a', '#a42222', '#bc2a2a', '#d23a3a'], bukuWK: ['#f2ecd8'], papanW: ['#16161c'], papanWT: ['#f2f2f2'], korpriW: ['#e0b840'],
  senamW: ['#1c3a7a', '#22468e', '#2a54a2', '#3666b8'], senamWS: ['#e0b840'], batikW: ['#5a3a1a', '#6c4622', '#7e542c', '#926436'], batikWS: ['#2e1c0c'], batikWK: ['#e8d0a0'],
  pantoW: ['#08080c', '#101014', '#1a1a20', '#2c2c36'],
});

/* ---------- wajah: alis tebal menukik curiga, mata menyipit, kumis lebat melengkung ke bawah tepat di bawah hidung */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'waSkinS', k: 'waKumis' };
const F0 = '..............';
const KUMIS = '..kkkk..kkkk..';
const F = (brow, eyes, mouth) => [F0, F0, F0, ...brow, ...eyes, F0, F0, KUMIS, ...mouth, F0, F0];   // alis z 11..10, mata z 9..8, kumis z 5, mulut z 4
const BROW = ['.BBB......BBB.', '...BBB..BBB...'];
const EYE = ['..KKK....KKK..', '..sWK....KWs..'];
export const FACES = {
  biasa: F(BROW, EYE, ['..kk.mmmm.kk..', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['..kk.mmmm.kk..', F0, F0]),
  marah: F(['..BB......BB..', '....BBBBBB....'], EYE, ['..kkmmmmmmkk..', '....m....m....', F0]),
  teriak: F(['..BB......BB..', '....BBBBBB....'], EYE, ['..kkmTTTTmkk..', '....mttttm....', '.....mmmm.....']),   // "Bolos lagi?!"
  nyengir: F(BROW, EYE, ['..kkTTTTTTkk..', '....mmmmmm....', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['..kkTTTTTTkk..', '....mttttm....', F0]),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...'], ['..kkmmmmmmkk..', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const topZ = (v, x, y) => { for (let z = 30; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-4, -6, 5, 5, 3] : z === 1 ? [-6, -7, 6, 6, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'waSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'waSkin'); v.box(8, -1, 5, 8, 0, 5, 'waSkin'); v.set(7, -1, 4, 'waSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'waSkin'); v.box(-1, y, 6, -1, y, 7, 'waSkinS'); }
  // rambut belah samping kiri berminyak, rapat, dahi agak lebar
  const hair = new Vox();
  for (let z = 6; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'waHair', z <= 11 ? 4 : 5);
  for (let z = 16; z <= 17; z++) hair.rrect(z, -6, -7 + (z - 16), 5, 6, 'waHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 6)) v.set(x, y, z, c); });
  for (let x = -6; x <= 5; x++) { const z = topZ(v, x, -4); if (z !== null) v.set(x, -4, z, 'waHairT'); }
  for (const y of [-1, 2, 5]) for (let x = -5; x <= 5; x++) { const z = topZ(v, x, y); if (z !== null && (x + y) % 4 === 0) v.set(x, y, z, 'waHairT'); }
  return v;
}

/* ---------- badan + perut (sisi +y; sisi -y = cermin) */
const bodyC = o => ({ pns: 'khaki', senam: 'senamW', batik: 'batikW' }[o.top]);
function chest(o) {
  const v = new Vox(), T = o.top, body = bodyC(o);
  for (let z = 34; z <= 56; z++) { const bel = z > 50 ? 0 : Math.round(3.5 * Math.sin((z - 31) / 20 * Math.PI)), t = z === 56 ? 1 : 0; v.rrect(z, -6, -9 + t, 4 + bel - t, 8 - t, body, 4); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'waSkin', 2);
  if (T === 'pns') {   // seragam PNS khaki: kerah, kancing, 2 saku bertutup, papan nama hitam, pin Korpri, tali bahu
    for (let z = 34; z <= 55; z++) v.pf(-1, z, 'khakiS');
    for (const z of [52, 47, 42, 37]) v.pf(-1, z, 'korpriW');
    for (const [y0, y1] of [[-7, -3], [2, 6]]) { for (let z = 44; z <= 50; z++) for (let y = y0; y <= y1; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z >= 49 ? 'khakiS' : 'khaki'); } }
    v.pfBox(3, 52, 6, 52, 'papanW'); v.pf(4, 52, 'papanWT'); v.pf(5, 52, 'papanWT');   // papan nama di atas saku kanan
    v.pf(-5, 52, 'korpriW'); v.pf(-6, 51, 'korpriW');   // pin Korpri
    v.pf(-6, 51, 'korpriW'); v.pf(-4, 51, 'bukuWK');   // pulpen
    for (let z = 57; z <= 58; z++) v.shell(z, -5, -6, 3, 5, 'khaki', 3);
    for (let y = -2; y <= 1; y++) for (let x = 2; x <= 5; x++) for (const z of [57, 58]) if (v.get(x, y, z) === 'khaki') v.set(x, y, z, null);
    return v;
  }
  if (T === 'senam') {   // jaket training biru Korpri Jumat: ritsleting kuning, garis kuning di bahu
    for (let z = 34; z <= 56; z++) v.pf(-1, z, 'senamWS');
    for (let z = 57; z <= 59; z++) v.shell(z, -5, -6, 3, 5, 'senamW', 3);
    v.pfBox(3, 50, 4, 51, 'senamWS');
    return v;
  }
  v.each((x, y, z, k) => { if (k !== 'batikW') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + 40) % 6), b = ((z + 40) % 6); if (a === 3 && b === 3) v.set(x, y, z, 'batikWK'); else if (a === 0 || b === 0) v.set(x, y, z, 'batikWS'); });
  for (let z = 34; z <= 55; z++) v.pf(-1, z, 'batikW');
  for (let z = 57; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'batikW', 2);
  return v;
}
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-6, -8, 28, 5, 7, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'senam') { for (let z = 30; z <= 33; z++) v.shell(z, -7, -10, 6 + (z - 30), 9, 'senamW', 4); return v; }
  for (let z = 31; z <= 32; z++) v.shell(z, -6, -9, 7, 8, 'belt', 4); v.pf(-1, 32, 'buckle'); v.pf(0, 32, 'buckle');   // baju dimasukkan, ikat pinggang di bawah perut
  for (let z = 33; z <= 34; z++) v.shell(z, -7, -10, 6 + (z - 32), 9, bodyC(o), 4);
  return v;
}
const legC = o => o.top === 'senam' ? 'senamW' : o.top === 'batik' ? 'pantoW' : 'celKhaki';
const sleeveC = o => bodyC(o);
function arm(o) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-3, 8, 43, 3, 14, 55, c, 3); v.rrect(56, -3, 8, 3, 14, c, 3);
  if (o.top === 'pns') { for (let x = -3; x <= 3; x++) v.set(x, 14, 56, 'khakiS'); v.set(2, 14, 56, 'korpriW'); }   // tali bahu
  if (o.top === 'senam') for (let z = 43; z <= 56; z++) v.set(0, 14, z, 'senamWS');
  if (o.top === 'batik') v.each((x, y, z, k) => { if (k === 'batikW' && ((y + 40) % 6 === 0 || (z + 40) % 6 === 0)) v.set(x, y, z, 'batikWS'); });
  return v;
}
function fore(o, side) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-3, 8, 31, 3, 14, 42, c, 3);
  v.paint(-3, 8, 31, 3, 14, 32, o.top === 'pns' ? 'khakiS' : o.top === 'senam' ? 'senamWS' : 'batikWS');
  v.rbox(-3, 8, 27, 4, 14, 30, 'waSkin', 3); v.rrect(26, -2, 9, 3, 13, 'waSkin', 2);
  if (side < 0 && o.top !== 'senam') {   // buku pelanggaran merah tebal di tangan kiri
    v.rbox(-4, 7, 19, 4, 9, 30, 'bukuW', 0); v.paint(4, 7, 20, 4, 9, 29, 'bukuWK'); v.paint(-4, 9, 19, 4, 9, 30, 'bukuW');
    for (let z = 21; z <= 28; z += 2) v.set(4, 8, z, 'bukuW');
  }
  if (side > 0) v.paint(-3, 8, 30, 3, 14, 30, 'korpriW');   // jam emas
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-5, 2, 18, 4, 8, 31, c, 3); v.rrect(32, -4, 2, 3, 8, c, 3); if (o.top === 'senam') for (let z = 18; z <= 31; z++) v.set(0, 8, z, 'senamWS'); return v; }
function shin(o) { const c = legC(o), v = new Vox(); v.rbox(-4, 2, 6, 3, 7, 18, c, 3); v.rrect(19, -3, 2, 2, 7, c, 3); if (o.top === 'senam') for (let z = 6; z <= 18; z++) v.set(0, 7, z, 'senamWS'); else for (let z = 7; z <= 17; z++) v.pf(4, z, c === 'pantoW' ? 'pantoW' : 'celKhaki'); return v; }
function foot(o) {
  const v = new Vox();
  if (o.top === 'senam') { v.rbox(-4, 1, 0, 7, 8, 1, 'sole', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'pantoW', 3); v.rbox(-4, 1, 5, 2, 8, 6, 'pantoW', 3); for (const x of [2, 4]) v.paint(x, 3, 4, x, 6, 4, 'lace'); return v; }
  v.rbox(-4, 1, 0, 7, 8, 0, 'belt', 3); v.rbox(-4, 1, 1, 7, 8, 3, 'pantoW', 3); v.rbox(-4, 2, 4, 2, 7, 5, 'pantoW', 2); v.set(7, 4, 3, 'papanWT');   // pantofel PNS mengilap
  return v;
}

export const OUTFITS = {
  pns: { name: 'Patroli: seragam PNS khaki + papan nama + buku pelanggaran', top: 'pns' },
  senam: { name: 'Jumat pagi: setelan training biru Korpri + sneakers', top: 'senam' },
  batik: { name: 'Batik cokelat lengan panjang + celana hitam + buku pelanggaran', top: 'batik' },
};
export function build(opt = {}) {
  // game memanggil 'seragam': Pak Wawan memakai seragam PNS
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.pns), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'waSkin', shoulder: sl, elbow: sl, hip: leg, knee: leg }, SKEL, TAIL);
}
