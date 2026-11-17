// Pak Haris Megantara: pengembang properti, dalang penggusuran, 50-an. Setelan jas abu mahal tiga potong, kemeja putih,
// dasi merah anggur, saputangan saku, rambut disemir hitam klimis belah samping (uban tipis tersisa di cambang),
// kacamata tanpa bingkai, cincin batu akik merah besar, senyum dingin sebelah. Rangka keluarga Arga (skala 1.34),
// tegap ramping, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  hsSkin: ['#b88a66', '#d0a07c', '#e8b890', '#f2c8a4'], hsSkinS: ['#cc9c78'],
  hsHair: ['#060608', '#0c0c10', '#141418', '#20202a'], hsHairT: ['#3a3a4a'], hsUban: ['#9a9a98'],
  lensH: ['#a8b8c2'], lensHT: ['#ffffff'], hrKaca: ['#b8b8c0'],
  jas: ['#3e4046', '#4c4e56', '#5c5e66', '#72747e'], jasS: ['#2c2e34'], jasK: ['#686a74'],
  dasi: ['#4a0e18', '#5e1420', '#741a2a', '#8c2638'], dasiS: ['#3a0a12'], akik: ['#8a0a12', '#b01420', '#d42a34', '#f05a5a'], cincin: ['#b08a2a', '#cca23a', '#e4bc4e', '#f6d872'],
  pantoH: ['#06060a', '#0e0e14', '#1a1a22', '#3a3a48'], hrPolo: ['#e8e6e2', '#f2f0ec', '#faf8f4', '#ffffff'], vest: ['#141c34', '#1a2440', '#222e50', '#2e3c64'],
  hrChino: ['#b09a74', '#c4ae86', '#d6c09a', '#e4d0ae'], batikH: ['#141012', '#1c1618', '#241c20', '#30262a'], batikHS: ['#a8842a'], batikHK: ['#e0b84a'], celHit: ['#141418', '#1c1c22', '#24242c', '#30303a'],
});

/* ---------- wajah: alis tipis lurus tajam, mata sipit dingin (kelopak berat), garis senyum dingin sebelah tepat di bawah
   hidung, kerutan halus di pipi. Kacamata tanpa bingkai: lensa tipis di baris mata. */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'hsSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, ...brow, ...eyes, F0, F0, '..s........s..', ...mouth, F0, F0];   // 15 baris: alis z 11..10, mata z 9..8, mulut z 4
const BROW = ['.BBBBB..BBBBB.', F0];   // baris kedua = tepi atas kacamata
const EYE = ['..sKKK..KKKs..', '...WKK..KKW...'];
export const FACES = {
  biasa: F(BROW, EYE, ['....mmmmmm.m..', '..........m...', F0]),   // senyum dingin: sudut kanan naik sedikit
  kedip: F(BROW, [F0, '..sKKK..KKKs..'], ['....mmmmmm.m..', '..........m...', F0]),
  marah: F(['..BBBB..BBBB..', F0], ['...KKK..KKK...', '...WKK..KKW...'], ['....mmmmmm....', F0, F0]),
  teriak: F(['..BBBB..BBBB..', F0], ['..KKKK..KKKK..', '..WKKK..KKKW..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['...mmTTTTmm...', '..........m...', F0]),   // senyum lebar tanpa sampai ke mata
  ketawa: F(BROW, ['..sKK...KKs...', '..K..K..K..K..'], ['...mTTTTTTm...', '....mttttm....', F0]),
  sakit: F(['..BB......BB..', F0], ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const topZ = (v, x, y) => { for (let z = 30; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-5, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'hsSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'hsSkin'); v.set(8, -1, 5, 'hsSkin'); v.set(8, 0, 5, 'hsSkin'); v.set(7, -1, 4, 'hsSkinS');   // hidung mancung
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'hsSkin'); v.box(-1, y, 6, -1, y, 7, 'hsSkinS'); }
  // rambut semir hitam klimis belah samping kiri, disisir licin ke kanan-belakang, rapat di kepala
  const hair = new Vox();
  for (let z = 5; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'hsHair', z <= 11 ? 4 : 5);
  for (let z = 16; z <= 17; z++) hair.rrect(z, -6 + (z - 16), -7, 6 - (z - 16) * 2, 6, 'hsHair', 4);
  const zmin = (x, y) => x >= 5 ? (y >= -4 ? 14 : 13) : x >= -2 ? (Math.abs(y + 0.5) > 6.5 ? 10 : 0) : x >= -5 ? 7 : 5;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (let x = -6; x <= 5; x++) { const z = topZ(v, x, -4); if (z !== null) v.set(x, -4, z, 'hsHairT'); }   // garis belahan
  for (const y of [-1, 2, 5]) for (let x = -5; x <= 6; x++) { const z = topZ(v, x, y); if (z !== null && (x + y) % 5 !== 0 && v.get(x, y, z) === 'hsHair') v.set(x, y, z, 'hsHairT'); }   // kilau minyak rambut
  for (const y of [-8, 7]) for (const z of [9, 10]) { const x = 1; if (v.get(x, y, z) === 'hsHair') v.set(x, y, z, 'hsUban'); }   // uban yang lolos semir di cambang
  // kacamata tanpa bingkai: hanya kaca persegi tipis + jembatan + gagang perak tipis
  const fx = v.front(-1, 8) + 1;
  for (const y0 of [-6, 0]) for (let y = y0; y <= y0 + 5; y++) for (let z = 7; z <= 10; z++) if (z === 10 || (z >= 8 && (y === -6 || y === 5))) v.set(fx, y, z, z === 10 && (y === y0 + 1 || y === y0 + 2) ? 'lensHT' : 'lensH');
  for (const y of [-7, 6]) v.set(fx, y, 10, 'hrKaca');
  for (const y of [-8, 7]) for (let x = fx - 1; x >= -1; x--) if (!v.has(x, y, 10)) v.set(x, y, 10, 'hrKaca');
  return v;
}
/* ---------- badan tegap (sisi +y; sisi -y = cermin) */
const bodyC = o => ({ jas: 'jas', golf: 'vest', batik: 'batikH' }[o.top]);
function chest(o) {
  const v = new Vox(), T = o.top, body = bodyC(o);
  for (let z = 34; z <= 56; z++) { const w = z <= 40 ? 1 : z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -8 + w + t, 4 - t, 7 - w - t, body, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'hsSkin', 2);
  if (T === 'jas') {   // jas abu: kerah lebar (lapel) membentuk V, kemeja putih + dasi merah anggur, saputangan saku, dua kancing
    for (let z = 42; z <= 56; z++) { const hw = Math.round((z - 42) * 0.32); for (let y = -1 - hw; y <= hw; y++) { const x = v.front(y, z); if (x !== null) { v.set(x, y, z, null); v.set(x - 1, y, z, 'white'); } } }
    for (let z = 42; z <= 56; z++) { const hw = Math.round((z - 42) * 0.32); for (const y of [-2 - hw, -3 - hw, hw + 1, hw + 2]) v.pf(y, z, 'jasK'); }   // lapel
    for (let z = 43; z <= 56; z++) for (let y = -1; y <= 0; y++) v.pf(y, z, z >= 55 ? 'dasiS' : 'dasi');   // dasi
    for (const z of [49, 46]) for (let y = -1; y <= 0; y++) v.pf(y, z, 'dasiS');
    for (let z = 57; z <= 58; z++) v.shell(z, -3, -4, 3, 3, 'white', 2);   // kerah kemeja
    for (let z = 34; z <= 41; z++) v.pf(-1, z, 'jasS');
    for (const z of [40, 37]) v.pf(0, z, 'jasS');
    v.pf(-6, 49, 'white'); v.pf(-5, 49, 'white'); v.pf(-6, 50, 'white');   // saputangan saku dada kiri
    for (let y = -6; y <= -3; y++) v.pf(y, 48, 'jasS');
    for (let y = -7; y <= 6; y++) v.pb(y, 56, 'jasK');
    for (let z = 34; z <= 44; z++) v.pb(-1, z, 'jasS');   // belahan jas di punggung
    return v;
  }
  if (T === 'golf') {   // rompi rajut biru tua leher V di atas polo putih, kerah polo
    for (let z = 46; z <= 56; z++) { const hw = Math.round((z - 46) * 0.45); for (let y = -1 - hw; y <= hw; y++) v.pf(y, z, 'hrPolo'); }
    v.each((x, y, z, c) => { if (c === 'vest' && z % 3 === 0 && (x + y) % 2) v.set(x, y, z, 'vest'); });
    for (let z = 57; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'hrPolo', 2);
    for (let y = -8; y <= 7; y++) if (Math.abs(y + 0.5) > 6.5) for (let z = 50; z <= 56; z++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'hrPolo'); }
    v.pf(-5, 50, 'akik');   // logo kecil
    return v;
  }
  // batik sutra lengan panjang hitam-emas motif kawung, kerah tegak
  v.each((x, y, z, c) => {
    if (c !== 'batikH') return;
    const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + 40) % 6 + 6) % 6, b = (z + 40) % 6;
    const d = Math.abs(a - 3) + Math.abs(b - 3);
    if (d === 2) v.set(x, y, z, 'batikHS'); else if (d === 0) v.set(x, y, z, 'batikHK');
  });
  for (let z = 34; z <= 55; z++) v.pf(-1, z, 'batikH');
  for (let z = 57; z <= 58; z++) v.shell(z, -3, -4, 3, 3, 'batikH', 2);
  return v;
}
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-5, -7, 28, 4, 6, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'jas') { for (let z = 28; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'jas', 3); for (let z = 28; z <= 33; z++) { v.pf(-1, z, 'jasS'); v.pf(0, z, z <= 31 ? null : 'jasS'); } for (const y of [-6, 5]) v.pf(y, 31, 'jasS'); }   // ujung jas menutup pinggul, belahan depan, saku
  else if (o.top === 'batik') for (let z = 29; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 29 ? 'batikHS' : 'batikH', 3);
  else { v.rbox(-5, -7, 32, 4, 6, 33, 'belt', 3); v.pfBox(-1, 32, 0, 33, 'buckle'); for (let z = 33; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'vest', 3); }
  return v;
}
const legC = o => o.top === 'golf' ? 'hrChino' : o.top === 'batik' ? 'celHit' : 'jas';
const sleeveC = o => o.top === 'golf' ? 'hrPolo' : bodyC(o);
function arm(o) {
  const v = new Vox(), c = sleeveC(o);
  if (o.top === 'golf') { v.rbox(-3, 7, 43, 2, 12, 55, 'hsSkin', 2); v.rrect(56, -3, 7, 2, 12, c, 3); v.paint(-3, 7, 48, 2, 12, 56, c); v.shell(48, -4, 7, 3, 13, c, 2); return v; }
  v.rbox(-3, 7, 43, 2, 12, 55, c, 2); v.rrect(56, -3, 7, 2, 12, c, 3);
  if (o.top === 'jas') v.rrect(56, -4, 6, 3, 13, 'jas', 3);   // bantalan bahu jas
  return v;
}
function fore(o, side) {
  const v = new Vox(), G = o.top === 'golf', c = sleeveC(o);
  v.rbox(-3, 7, 31, 2, 12, 42, G ? 'hsSkin' : c, 2);
  v.rbox(-3, 7, 27, 3, 12, 30, 'hsSkin', 2); v.rrect(26, -2, 8, 2, 11, 'hsSkin', 2);
  if (o.top === 'jas') { v.paint(-3, 7, 31, 2, 12, 31, 'white'); v.set(3, 12, 31, 'cincin'); }   // manset kemeja + kancing manset emas
  if (o.top === 'jas' || o.top === 'batik') if (side < 0) v.set(3, 7, 31, 'cincin');
  if (side < 0) v.paint(-3, 7, 30, 2, 12, 30, 'cincin');   // jam emas di kiri
  if (side > 0) { for (const [x, y, z] of [[4, 10, 27], [4, 11, 27], [3, 12, 27], [4, 10, 28]]) v.set(x, y, z, 'cincin'); v.box(4, 10, 28, 5, 11, 29, 'akik'); v.set(5, 11, 29, 'akik'); }   // cincin batu akik merah besar di jari manis kanan
  if (G && side > 0) { v.rbox(-3, 7, 26, 3, 12, 29, 'hrPolo', 2); v.set(4, 9, 28, 'hrPolo'); }   // sarung tangan golf putih (kanan)
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-4, 2, 18, 3, 7, 31, c, 3); v.rrect(32, -3, 2, 2, 7, c, 3); if (o.top !== 'golf') for (let z = 18; z <= 31; z++) v.pf(5, z, c === 'jas' ? 'jasS' : 'batikH'); return v; }
function shin(o) { const c = legC(o), v = new Vox(); v.rbox(-4, 2, 6, 3, 7, 18, c, 3); v.rrect(19, -3, 2, 2, 7, c, 3); for (let z = 6; z <= 18; z++) v.pf(5, z, c === 'jas' ? 'jasS' : c === 'hrChino' ? 'hrChino' : 'batikH'); return v; }   // garis setrika
function foot(o) {   // pantofel hitam mengilap (golf: sepatu putih)
  const v = new Vox(), c = o.top === 'golf' ? 'hrPolo' : 'pantoH';
  v.rbox(-4, 1, 0, 7, 8, 0, o.top === 'golf' ? 'sole' : 'pantoH', 3); v.rbox(-4, 1, 1, 7, 8, 3, c, 3); v.rbox(-4, 2, 4, 2, 7, 5, c, 2);
  if (o.top !== 'golf') v.set(6, 4, 3, 'lensHT'); else for (const x of [1, 3]) v.paint(x, 3, 4, x, 6, 4, 'jasS');
  return v;
}

export const OUTFITS = {
  jas: { name: 'Kantor: jas abu tiga potong + dasi merah anggur + pantofel', top: 'jas' },
  golf: { name: 'Golf: polo putih + rompi rajut biru tua + chino + sarung tangan', top: 'golf' },
  batik: { name: 'Acara resmi: batik sutra hitam-emas lengan panjang', top: 'batik' },
};
export function build(opt = {}) {
  // game memanggil 'seragam': Pak Haris memakai jas
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.jas), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'hsSkin', shoulder: sl, elbow: o.top === 'golf' ? 'hsSkin' : sl, hip: leg, knee: leg }, SKEL, TAIL);
}
