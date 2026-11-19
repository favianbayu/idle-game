// Bang Jaka: ketua geng Lampu Kota, 24 tahun, pelindung kampung, menyesal tidak lulus SMA. Tinggi besar, rambut gondrong
// diikat rendah di tengkuk, jenggot tipis di dagu dan rahang, jaket hitam berlis kuning Lampu Kota, kaus abu di dalam,
// jeans gelap, boots cokelat tua. Rangka keluarga Bram (skala 1.38), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';
import { catZ } from './props.js';

export const SKEL = { ank: 4.5, shin: 15, thigh: 15.5, up: 4, neck: 24, shY: 10.5, shZ: 17, upper: 11, fore: 11.5, hipY: 5, flap: 6, ballR: 1.1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  jaKaus: ['#141416', '#1c1c1f', '#262629', '#343438'],
  jaSkin: ['#7e5236', '#94603e', '#a8724e', '#ba8460'], jaSkinS: ['#8e5c3c'], jaBeard: ['#2a1c14'],
  jaHair: ['#0a0808', '#121010', '#1a1616', '#282222'], jaHairT: ['#3a302c'], jaIkat: ['#6a4a2a'],
  jaTee: ['#6e7078', '#80828a', '#92949c', '#a6a8b0'], jaJeans: ['#1a2236', '#222c44', '#2c3854', '#3c4a6a'], jaJeansS: ['#141a2a'],
  jaBoots: ['#24160e', '#301e14', '#3e281a', '#543826'], jaBootsS: ['#1a100a'],
  jaTank: ['#1a1a1c', '#222224', '#2c2c30', '#3a3a40'], jaTrain: ['#22242c', '#2a2d36', '#343842', '#444a56'], jaWrap: ['#c8c0b0', '#dad2c2', '#e8e0d0', '#f4eee2'],
  jaFlan: ['#5a1e1a', '#702622', '#86302a', '#9c3c34'], jaFlanS: ['#2a1210'], jaKargo: ['#4a4a36', '#58583e', '#686a4a', '#7a7c5a'],
});

/* ---------- wajah: alis tebal lurus berat, mata tajam setengah turun, mulut datar tepat di bawah hidung, jenggot tipis
   di dagu (dua baris jarang) */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'jaSkinS', b: 'jaBeard' };
const F0 = '..............';
const BEARD = ['...b.bbbb.b...', '....bbbbbb....'];
const F = (brow, eyes, mouth) => [F0, F0, ...brow, F0, ...eyes, F0, F0, F0, ...mouth, ...BEARD];   // 15 baris, mulut z 4
const BROW = ['.BBBBB..BBBBB.', '..............'];
const EYE = ['..KKKK..KKKK..', '..WKKK..KKKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0, '......b.......']),
  kedip: F(BROW, [F0, '..KKKK..KKKK..'], ['.....mmmm.....', F0, '......b.......']),
  marah: F(['.BB........BB.', '..BBBB..BBBB..'], EYE, ['....mmmmmm....', '...m......m...', F0]),
  teriak: F(['.BB........BB.', '..BBBB..BBBB..'], EYE, ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['....mmmmmmm...', '..........m...', F0]),   // senyum tipis sebelah
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', F0]),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];   // rahang kotak
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'jaSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'jaSkin'); v.set(7, -1, 5, 'jaSkinS'); v.set(7, 0, 4, 'jaSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'jaSkin'); v.box(-1, y, 6, -1, y, 7, 'jaSkinS'); }
  // jenggot tipis menyusur rahang dari cambang sampai dagu (jarang)
  for (let z = 0; z <= 5; z++) for (const s of [-1, 1]) { const y = s > 0 ? v.sideP(4 - Math.floor(z / 2), z) : v.sideN(4 - Math.floor(z / 2), z); if (y !== null && rnd(z, y, 3) % 3) v.set(4 - Math.floor(z / 2), y, z, 'jaBeard'); }
  // rambut gondrong disisir ke belakang tanpa poni, garis rambut agak tinggi, telinga tertutup sebagian
  const hair = new Vox();
  for (let z = 3; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, 'jaHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -8, -8, 6, 7, 'jaHair', 5); hair.rrect(17, -6, -6, 4, 5, 'jaHair', 4);
  const zmin = (x, y) => x >= 5 ? (Math.abs(y + 0.5) > 5.5 ? 12 : 14) : Math.abs(y + 0.5) > 6.5 ? (x >= 2 ? 11 : x >= -1 ? 9 : 4) : 3;   // disisir ke belakang: pelipis & telinga terbuka
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (const y of [-6, -3, 2, 5]) for (let x = -7; x <= 6; x++) { const z = topZ(v, x, y); if (z !== null && (x + y) % 4) v.set(x, y, z, 'jaHairT'); }   // alur sisiran ke belakang
  for (const [y, z] of [[-7, 12], [-8, 11], [-8, 10]]) v.set(6, y, z, 'jaHair');   // sehelai lepas di pelipis kanan
  // kuncir rendah: ikat kulit di tengkuk, ekor menempel punggung atas
  for (let y = -2; y <= 1; y++) for (let x = -11; x <= -9; x++) for (const z of [4, 5]) v.set(x, y, z, 'jaIkat');
  for (let z = 3; z >= -7; z--) {
    const w = z >= 0 ? 2 : z >= -4 ? 1 : 0, x0 = z > 0 ? -9 : z > -3 ? -8 : -7;
    for (let y = -w - 1; y <= w; y++) for (let x = x0 - 1; x <= x0; x++) if (!v.has(x, y, z)) v.set(x, y, z, x === x0 - 1 && (y === -1 || y === 0) && z % 2 ? 'jaHairT' : 'jaHair');
  }
  return v;
}
const topZ = (v, x, y) => { for (let z = 30; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };

/* ---------- badan besar (sisi +y; sisi -y = cermin) */
const bodyC = o => ({ lampu: 'jk', latihan: 'jaTank', santai: 'jaFlan' }[o.top]);
function chest(o) {
  const v = new Vox(), T = o.top, body = bodyC(o);
  for (let z = 37; z <= 58; z++) { const w = z <= 42 ? 1 : z <= 46 ? 0 : -1, t = z === 58 ? 1 : 0; v.rrect(z, -6, -9 + w + t, 5 - t, 8 - w - t, body, z >= 57 ? 4 : 3); }
  v.rbox(-3, -3, 59, 2, 2, 62, 'jaSkin', 2);
  if (T === 'lampu') {   // jaket hitam terbuka: kaus abu di tengah, lis kuning di tepi bukaan, kerah, garis dada & ujung
    for (let z = 37; z <= 57; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x !== null) { v.set(x, y, z, null); v.set(x - 1, y, z, 'jaTee'); } }
    for (let z = 37; z <= 57; z++) for (const y of [-4, 3]) v.pf(y, z, 'jkY');
    for (let z = 59; z <= 61; z++) { v.shell(z, -5, -6, 2, 5, 'jk', 3); for (let y = -3; y <= 2; y++) for (let x = 0; x <= 3; x++) if (v.get(x, y, z) === 'jk') v.set(x, y, z, null); }
    for (let y = -6; y <= 5; y++) { const x = v.back(y, 61); if (x !== null) v.set(x, y, 61, 'jkY'); }
    for (let y = -9; y <= 8; y++) if (Math.abs(y + 0.5) > 4) { v.pf(y, 49, 'jkY'); v.pf(y, 50, 'jkY'); }
    for (let y = -9; y <= 8; y++) { v.pb(y, 49, 'jkY'); v.pb(y, 50, 'jkY'); }
    for (const y of [-7, 6]) for (let z = 41; z <= 44; z++) v.pf(y, z, 'jkG');   // ritsleting saku
    // lambang lampu jalan di punggung: tiang + kepala lampu + sinar, dan tulisan LK di bawahnya
    ['..YYYYY..', '.YYYYYYY.', '..GGGGG..', '....Y....', 'Y...Y...Y', '.Y..Y..Y.', '....Y....', '....Y....'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pb(4 - c, 57 - r, ch === 'G' ? 'jkG' : 'jkY'); }));
    ['Y...Y.Y', 'Y...YY.', 'YYY.Y.Y'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pb(3 - c, 46 - r, 'jkY'); }));
    return v;
  }
  if (T === 'latihan') {   // kaus kutang hitam, bahu terbuka, kerah U; keringat di dada
    for (let z = 52; z <= 58; z++) for (let y = -9; y <= 8; y++) if (Math.abs(y + 0.5) > 5.5 || (Math.abs(y + 0.5) < 2.5 && z >= 55)) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'jaSkin'); const xb = v.back(y, z); if (xb !== null && Math.abs(y + 0.5) > 5.5) v.set(xb, y, z, 'jaSkin'); }
    v.each((x, y, z, c) => { if (c === 'jaTank' && z >= 53 && Math.abs(y + 0.5) > 6.5) v.set(x, y, z, 'jaSkin'); });
    for (const [y, z] of [[-1, 50], [0, 49], [-1, 47], [1, 52]]) v.pf(y, z, 'jaTee');
    return v;
  }
  // santai: kemeja flanel merah tua kotak-kotak (garis gelap tiap 5 voxel), lengan digulung, kancing atas terbuka
  plaid(v);
  for (let z = 52; z <= 58; z++) for (let y = -2; y <= 1; y++) if (Math.abs(y + 0.5) <= (z - 51) * 0.6) v.pf(y, z, 'jaTee');
  for (let z = 37; z <= 51; z++) v.pf(-1, z, 'jaFlanS');
  for (let z = 59; z <= 60; z++) v.shell(z, -5, -6, 3, 5, 'jaFlan', 3);
  return v;
}
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-6, -8, 30, 5, 7, 36, c, 3); v.box(-4, -2, 28, 3, 1, 29, c);
  if (o.top === 'latihan') { for (let z = 35; z <= 36; z++) v.shell(z, -6, -8, 5, 7, 'jaTank', 3); for (const y of [-8, 7]) for (let z = 28; z <= 34; z++) v.set(0, y, z, 'jaWrap'); return v; }
  v.rbox(-6, -8, 35, 5, 7, 36, 'belt', 3); v.pfBox(-1, 35, 0, 36, 'buckle');
  if (o.top === 'lampu') for (let z = 33; z <= 36; z++) v.shell(z, -7, -9, 6, 8, z === 33 ? 'jkY' : 'jk', 3);   // ujung jaket berlis kuning
  if (o.top === 'lampu') for (let z = 33; z <= 36; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x !== null && v.get(x, y, z) !== 'belt' && v.get(x, y, z) !== 'buckle') v.set(x, y, z, null); }
  if (o.top === 'santai') { for (let z = 32; z <= 36; z++) v.shell(z, -7, -9, 6, 8, 'jaFlan', 3); plaid(v); }
  return v;
}
const plaid = v => { v.each((x, y, z, c) => { if (c !== 'jaFlan') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x; if (z % 5 === 0 || (u + 40) % 5 === 0) v.set(x, y, z, 'jaFlanS'); }); return v; };
const legC = o => o.top === 'latihan' ? 'jaTrain' : o.top === 'santai' ? 'jaKargo' : 'jaJeans';
const sleeveC = o => o.top === 'latihan' ? 'jaSkin' : bodyC(o);
function arm(o) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-4, 8, 46, 3, 14, 58, c, 3); v.rrect(59, -3, 8, 3, 14, c, 3);
  if (c === 'jaFlan') plaid(v);
  if (o.top === 'lampu') for (const z of [52, 53]) for (let x = -4; x <= 3; x++) v.set(x, 14, z, 'jkY');   // lis kuning di lengan atas
  if (o.top === 'latihan') for (const [x, z] of [[3, 52], [3, 51], [2, 52], [3, 50], [2, 50], [3, 49], [2, 49]]) v.set(x, 14, z, 'jaHair');   // tato kecil lampu
  return v;
}
function fore(o, side) {
  const v = new Vox(), T = o.top;
  const c = T === 'lampu' ? 'jk' : 'jaSkin';
  v.rbox(-3, 8, 35, 3, 14, 46, c, 3);
  v.rbox(-3, 8, 30, 4, 14, 34, 'jaSkin', 3); v.rrect(29, -2, 9, 3, 13, 'jaSkin', 2);
  if (T === 'lampu') v.paint(-3, 8, 35, 3, 14, 36, 'jkY');   // manset kuning
  if (T === 'santai') plaid(v.rbox(-4, 7, 42, 4, 15, 45, 'jaFlan', 3));   // lengan digulung di siku
  if (T === 'latihan') { v.rbox(-3, 8, 30, 4, 14, 34, 'jaWrap', 3); for (let y = 8; y <= 14; y++) v.set(4, y, 32, 'jaSkin'); }   // perban tangan, jari kelihatan
  if (side < 0 && T !== 'latihan') { v.paint(-3, 8, 34, 3, 14, 34, 'jaIkat'); v.set(4, 11, 34, 'rantai'); }   // gelang kulit
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-5, 1, 20, 4, 8, 34, c, 3); v.rrect(35, -4, 2, 3, 7, c, 3); if (o.top === 'santai') { v.rbox(-6, 8, 24, -1, 9, 29, c, 1); v.paint(-6, 9, 29, -1, 9, 29, 'jaFlanS'); } return v; }
function shin(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-5, 1, 12, 4, 8, 20, c, 3); v.rrect(21, -4, 2, 3, 7, c, 3);
  if (o.top === 'latihan') { v.rbox(-4, 2, 6, 3, 7, 11, c, 3); v.paint(-4, 2, 6, 3, 7, 7, 'jaTank'); return v; }
  v.rbox(-5, 1, 6, 4, 8, 11, 'jaBoots', 3);   // leher boots
  if (o.top === 'lampu') for (let z = 12; z <= 13; z++) v.shell(z, -5, 1, 4, 8, 'jaJeansS', 3);   // jeans dilipat di atas boots
  v.paint(-5, 1, 10, -5, 8, 10, 'jaBootsS');
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'latihan') { v.rbox(-4, 1, 0, 7, 8, 1, 'sole', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'jaTank', 3); v.rbox(-4, 2, 5, 2, 7, 5, 'jaTank', 2); for (const x of [2, 4]) v.paint(x, 2, 4, x, 7, 4, 'lace'); return v; }
  v.rbox(-5, 1, 0, 8, 8, 1, 'jaBootsS', 3);
  v.rbox(-5, 1, 2, 8, 8, 4, 'jaBoots', 3); v.rbox(-5, 1, 5, 3, 8, 7, 'jaBoots', 3);
  for (const x of [1, 3]) v.paint(x, 2, 5, x, 7, 5, 'lace');
  v.paint(-5, 1, 2, -5, 8, 2, 'jaBootsS');
  return v;
}

export const OUTFITS = {
  lampu: { name: 'Lampu Kota: jaket hitam lis kuning + kaus abu + jeans + boots', top: 'lampu' },
  latihan: { name: 'Latihan: kutang hitam + celana training + perban tangan (ujian masuk)', top: 'latihan' },
  santai: { name: 'Santai: kemeja flanel merah digulung + celana kargo + boots', top: 'santai' },
};
OUTFITS.kerja = { ...OUTFITS.santai, name: 'Kerja kuli angkut pasar: kaus hitam, celana kargo, sarung tangan kerja',
  sw: { jaFlan: 'jaKaus', jaFlanS: 'jaKaus' },
  fx: { foreR: v => catZ(v, 'prGlove', -99, 34), foreL: v => catZ(v, 'prGlove', -99, 34) } };
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  // game memanggil 'seragam': Bang Jaka memakai jaket Lampu Kota
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.lampu), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'jaSkin', shoulder: sl, elbow: o.top === 'santai' ? 'jaFlan' : sl, hip: leg, knee: leg }, SKEL, TAIL);
}
