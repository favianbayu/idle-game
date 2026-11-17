// Rani: tokoh utama cewek. Berandal di sekolah: kemeja dikeluarkan, dasi longgar, jaket jeans kebesaran,
// rok abu selutut di atas legging hitam (aman buat nendang), sneakers putih, plester di hidung, rambut kuncir kuda tinggi.
// Rangka skala 1.24 (tokoh lama), voxel halus 1/64 petak. Koordinat sama dengan Raka: x maju, y samping, z naik.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace, skullLayer, helmet } from './model.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-9, 0, 12];   // ikatan kuncir (lokal kepala)

addRamps({
  rSkin: ['#b07a55', '#cf9670', '#e8b48c', '#f5caa4'], rSkinS: ['#cf9670'],
  rHair: ['#0f0b0d', '#1b1416', '#281e21', '#3a2c2e'], rHairT: ['#1b1416', '#281e21', '#3e2f31', '#5a4643'],
  scrunch: ['#8e1f2b', '#b02a37', '#d23a46', '#ec6a70'],
  denim: ['#2b4166', '#38557f', '#4a6c9c', '#6a8cbb'], denimL: ['#5b7aa6', '#7593bd', '#93add2', '#b4c8e4'], denimS: ['#9fb7d8'],
  skirt: ['#4c505c', '#626773', '#7b808c', '#959aa6'], tie: ['#3e424c', '#50555f', '#666b76', '#80858f'],
  legging: ['#121116', '#1b1a20', '#26252c', '#383741'],
  kick: ['#a9a79f', '#d2cfc6', '#f2efe6', '#ffffff'], kickK: ['#141318', '#1e1d24', '#2b2a32', '#3f3e49'],
  string: ['#d23a46'], lip: ['#b85a55'],
  rTee: ['#5a1f2a', '#742a37', '#8f3644', '#ad4e5c'], track: ['#1c2440', '#263052', '#323e68', '#465384'], trackS: ['#e8ecf2'],
});

/* ---------- wajah 14 x 15 (3 baris atas tertutup poni). Mata besar 3 baris, alis tipis, plester melintang di hidung */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', l: 'lip', T: 'teeth', t: 'tongue', P: 'plaster', p: 'plasterS', s: 'rSkinS' };
const F0 = '..............';
const F = (brow, eyes, mid, mouth) => [F0, F0, F0, ...brow, ...eyes, ...mid, ...mouth, F0];
const NOSE = ['......PP......', '..............'];
export const FACES = {
  biasa: F(['..............', '..BBB....BBB..', '..............'], ['.KKKK....KKKK.', '..WKK....KKW..', '..WKK....KKW..'], NOSE, ['.........m....', '......mmm.....', '..............']),
  kedip: F(['..............', '..BBB....BBB..', '..............'], ['..............', '..............', '.KKKK....KKKK.'], NOSE, ['.........m....', '......mmm.....', '..............']),
  marah: F(['..............', '..BB......BB..', '....BB..BB....'], ['.KKKK....KKKK.', '..WKK....KKW..', '..WKK....KKW..'], NOSE, ['..............', '.....mmmm.....', '.....m..m.....']),
  teriak: F(['..............', '..BB......BB..', '....BB..BB....'], ['.KKKK....KKKK.', '..WKK....KKW..', '..WKK....KKW..'], NOSE, ['.....mTTm.....', '.....mttm.....', '......mm......']),
  nyengir: F(['.........BBB..', '..BBB.........', '..............'], ['.KKKK....KKKK.', '..WKK....KKW..', '..WKK....KKW..'], NOSE, ['....m....m....', '.....TTTT.....', '.....mmmm.....']),
  ketawa: F(['..BBB....BBB..', '..............', '..............'], ['..............', '..KK......KK..', '.K..K....K..K.'], NOSE, ['....mTTTTm....', '.....mttm.....', '......mm......']),
  sakit: F(['...BB....BB...', '.BB........BB.', '..............'], ['.KK........KK.', '...KK....KK...', '.KK........KK.'], NOSE, ['.....mmmm.....', '.....TTTT.....', '.....mmmm.....']),
};
export const EXPRS = Object.keys(FACES);

// poni tipis menyamping (lokal kepala): garis bawah poni per kolom, kiri layar lebih panjang
const FR = [7, 9, 10, 11, 11, 12, 12, 13, 13, 13, 12, 12, 11, 8];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skullLayer(z); v.rrect(z, a, b, c, d, 'rSkin', r); }
  // dagu sedikit lebih lancip
  for (const y of [-5, 4]) { v.set(5, y, 1, null); v.set(5, y, 2, null); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 4, 7, 0, 4, 'rSkin'); v.box(7, -1, 5, 7, 0, 5, 'plaster');            // hidung + plester di batang hidung
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'rSkin'); v.box(-1, y, 6, -1, y, 7, 'rSkinS'); }
  v.set(-1, 7, 4, 'gold'); v.set(-2, 7, 6, 'gold'); v.set(-1, -8, 4, 'gold');   // anting: dua di kanan, satu di kiri
  if (o.helm) return helmet(v);
  // rambut: menutup kepala, disisir ke belakang ke ikatan kuncir; poni tipis jatuh menyamping; helai samping membingkai pipi
  const zmin = (x, y, z) => x >= 5 ? FR[Math.max(0, Math.min(13, y + 7))] : x >= 1 ? (Math.abs(y + 0.5) > 5.5 ? 4 : 99) : x >= -2 ? (z >= 9 ? 9 : Math.abs(y + 0.5) > 6.5 && z >= 6 ? 6 : 99) : 3;
  const hair = new Vox();
  for (let z = 3; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'rHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -8, -7, 7, 6, 'rHair', 5); hair.rrect(17, -7, -6, 6, 5, 'rHair', 5); hair.rrect(18, -5, -4, 4, 3, 'rHair', 3);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y, z)) v.set(x, y, z, c); });
  // helai samping depan telinga turun ke rahang (kiri lebih panjang)
  v.fillE(3, -9, 3, 5, -8, 12, 'rHair'); v.fillE(3, 7, 5, 5, 8, 12, 'rHair');
  v.set(5, -9, 3, 'rHairT'); v.set(5, 8, 5, 'rHairT');
  // kilau: garis sisir dari dahi ke ikatan
  for (const y of [-4, -1, 2, 4]) for (let x = -6; x <= 5; x += 1) { const zz = topZ(v, x, y); if (zz !== null && (x + y * 3) % 4 === 0 && v.get(x, y, zz) === 'rHair') v.set(x, y, zz, 'rHairT'); }
  for (let c = 0; c < 14; c++) { const y = c - 7, x = v.front(y, FR[c]); if (x !== null && v.get(x, y, FR[c]) === 'rHair') v.set(x, y, FR[c], 'rHairT'); }
  // ikat rambut merah di belakang atas
  for (let y = -2; y <= 1; y++) for (let z = 11; z <= 13; z++) v.set(-9, y, z, 'scrunch');
  v.set(-10, -1, 12, 'scrunch'); v.set(-10, 0, 12, 'scrunch');
  return v;
}
const topZ = (v, x, y) => { for (let z = 22; z >= 0; z--) if (v.has(x, y, z)) return z; return null; };
function ponytail() {   // kuncir kuda (lokal kepala): dari ikatan, mengembang, lalu meruncing sampai tengah punggung
  const v = new Vox();
  const prof = [[13, 2.6], [11, 3.3], [9, 3.6], [7, 3.6], [5, 3.4], [3, 3.1], [1, 2.8], [-1, 2.4], [-3, 2.0], [-5, 1.5], [-7, 1.0]];
  for (const [z, r] of prof) for (let dz = 0; dz < 2; dz++) {
    const xc = -11 - (13 - z) * 0.1;
    for (let x = Math.floor(xc - r); x <= Math.ceil(xc + r); x++) for (let y = -6; y <= 5; y++) {
      const dx = (x + 0.5 - xc) / (r * 0.85), dy = (y + 0.5) / (r * 1.3);
      if (dx * dx + dy * dy <= 1) v.set(x, y, z + dz, 'rHair');
    }
  }
  for (const [y, z0, z1] of [[-1, -2, 8], [1, 0, 10], [0, -6, -3]]) for (let z = z0; z <= z1; z++) { const x = v.back(y, z); if (x !== null) v.set(x, y, z, 'rHairT'); }
  v.set(-12, 0, -7, 'rHairT'); v.set(-11, -1, -7, 'rHairT');
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function chest(o) {
  const v = new Vox(), J = o.top === 'jeans', LK = o.top === 'lampu', T = o.top === 'kaus';
  const body = LK ? 'jk' : T ? 'rTee' : J ? 'denim' : 'white';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -4, -6 + t + w, 4 - t, 5 - t - w, body, z >= 50 ? 3 : 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'rSkin', 1);
  if (T) {   // kaus longgar rumah: leher bulat
    for (let y = -2; y <= 1; y++) v.pf(y, 51, 'rSkin');
    v.shell(52, -3, -3, 3, 2, 'rTee', 1);
    return v;
  }
  if (LK) {   // jaket Lampu Kota tertutup, kerah kuning
    for (let z = 32; z <= 49; z++) { v.pf(-1, z, 'jkG'); v.pf(0, z, 'jkG'); }
    for (let z = 43; z <= 44; z++) { for (let y = -6; y <= 5; y++) { if (v.get(v.front(y, z), y, z) === 'jk') v.pf(y, z, 'jkY'); v.pb(y, z, 'jkY'); } }
    for (let z = 52; z <= 53; z++) v.shell(z, -3, -4, 3, 3, 'jkY', 2);
    ['.XXXX.', 'XXXXXX', 'XXXXXX', '.XXXX.', '.SSSS.', '..SS..'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pb(c - 3, 46 - r, ch === 'X' ? 'jkY' : 'jkG'); }));
    return v;
  }
  // kemeja (di dalam jaket jeans kalau ada): kancing atas terbuka, dasi longgar miring
  const inner = (y, z) => { const x = v.front(y, z); return x; };
  if (J) {   // jaket terbuka: bagian depan tengah = kemeja, satu voxel lebih dalam
    for (let z = 32; z <= 51; z++) for (let y = -3; y <= 2; y++) { const x = inner(y, z); if (x === null) continue; v.set(x, y, z, null); v.set(x - 1, y, z, 'white'); }
    for (let z = 32; z <= 50; z++) { v.pf(-4, z, 'denimL'); v.pf(3, z, 'denimL'); }                       // tepi jaket
    for (const s of [-1, 1]) v.psBox(s, -3, 46, 3, 47, 'denimS');                                        // jahitan bahu
    for (let y = -5; y <= 4; y++) v.pb(y, 46, 'denimS');
    for (const y of [-5, 4]) v.pf(y, 44, 'denimL');                                                       // saku dada
  } else {
    v.pfBox(3, 44, 4, 46, 'osis'); v.pfBox(-5, 46, -3, 46, 'tag');
    for (let y = -5; y <= 4; y++) v.pb(y, 48, 'whiteS');
  }
  for (const [y, z] of [[-1, 50], [0, 50], [-1, 49], [0, 49], [0, 48]]) v.pf(y, z, 'rSkin');               // kancing atas terbuka
  for (const [y, z] of [[-1, 47], [0, 47], [-1, 46], [0, 46], [0, 45], [1, 45], [0, 44], [1, 44], [1, 43], [1, 42], [2, 41]]) v.pf(y, z, 'tie');   // dasi longgar
  const col = J ? 'denim' : 'white';
  for (let z = 52; z <= 53; z++) { v.shell(z, -3, -4, 3, 3, col, 2); for (let y = -1; y <= 0; y++) for (let x = 2; x <= 3; x++) if (v.get(x, y, z) === col) v.set(x, y, z, null); }
  if (!J) for (let z = 52; z <= 52; z++) for (let y = -2; y <= 1; y++) v.fillE(3, y, z, 3, y, z, 'tie');
  return v;
}
function pelvis(o) {
  const v = new Vox(), J = o.top === 'jeans', LK = o.top === 'lampu', T = o.top === 'kaus', PANTS = o.bottom !== 'rok';
  const bot = o.bottom === 'jeans' ? 'jeans' : o.bottom === 'training' ? 'track' : 'skirt';
  v.rbox(-4, -6, 26, 4, 5, 33, PANTS ? bot : 'legging', 3); v.box(-3, -2, 24, 2, 1, 25, PANTS ? bot : 'legging');
  if (!PANTS) {   // rok: pinggang + sisi; panel depan & belakang = flapF / flapB (ikut ayunan paha)
    for (let z = 22; z <= 33; z++) { const f = z <= 26 ? 1 : 0; v.shell(z, -5 - f, -7 - f, 4 + f, 6 + f, 'skirt', 3); }
    for (const s of [-1, 1]) for (const x of [-2, 1]) for (let z = 22; z <= 30; z++) { const y = s > 0 ? v.sideP(x, z) : v.sideN(x, z); if (y !== null && Math.abs(y) >= 7) v.set(x, y, z, 'tie'); }
    for (let z = 22; z <= 31; z++) for (let y = -9; y <= 8; y++) for (let x = -9; x <= 8; x++) if (Math.abs(y + 0.5) < 5.5 && v.get(x, y, z) === 'skirt' && (x >= 3 || x <= -4)) v.set(x, y, z, null);
  }
  if (T) { for (let z = 31; z <= 33; z++) v.shell(z, -5, -7, 4, 6, 'rTee', 3); return v; }
  if (LK) { for (let z = 31; z <= 33; z++) v.shell(z, -5, -7, 4, 6, z === 31 ? 'jkY' : 'jk', 3); return v; }
  // ujung kemeja dikeluarkan, jaket jeans lebih panjang di luarnya
  for (let z = 30; z <= 33; z++) v.shell(z, -5, -7, 4, 6, 'white', 3);
  if (J) {
    for (let z = 29; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 29 ? 'denimL' : 'denim', 3);
    for (let z = 29; z <= 33; z++) for (let y = -3; y <= 2; y++) for (const x of [5, 4]) if (v.get(x, y, z) === 'denim' || v.get(x, y, z) === 'denimL') v.set(x, y, z, null);
  }
  return v;
}
function skirtF() { const v = new Vox(); for (let z = 19; z <= 31; z++) { const f = z <= 25 ? 1 : 0; v.box(5 + f, -6 - f, z, 6 + f, 5 + f, z, 'skirt'); } for (let y = -8; y <= 7; y++) if (v.has(9, y, 19) || v.has(8, y, 19)) { const x = v.front(y, 19); if (x !== null) v.set(x, y, 19, 'tie'); } for (const y of [-3, 2]) for (let z = 20; z <= 28; z++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'tie'); } return v; }
function skirtB() { const v = new Vox(); for (let z = 19; z <= 31; z++) { const f = z <= 25 ? 1 : 0; v.box(-7 - f, -6 - f, z, -6 - f, 5 + f, z, 'skirt'); } for (const y of [-3, 2]) for (let z = 20; z <= 28; z++) { const x = v.back(y, z); if (x !== null) v.set(x, y, z, 'tie'); } return v; }
function arm(o) {
  const v = new Vox(), c = o.top === 'lampu' ? 'jk' : o.top === 'jeans' ? 'denim' : o.top === 'kaus' ? 'rTee' : 'white';
  v.rbox(-2, 6, 40, 2, 10, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2);
  if (o.top === 'lampu') for (let z = 40; z <= 51; z++) v.set(0, 10, z, 'jkY');
  else if (o.top === 'kaus') { v.paint(-2, 6, 40, 2, 10, 44, 'rSkin'); v.shell(45, -3, 6, 3, 11, 'rTee', 2); }
  else for (let z = 40; z <= 41; z++) v.shell(z, -3, 6, 3, 11, o.top === 'jeans' ? 'denimL' : 'white', 2);   // lengan digulung
  return v;
}
function fore(o, side) {
  const v = new Vox(), LK = o.top === 'lampu';
  v.rbox(-2, 6, 31, 2, 10, 39, LK ? 'jk' : 'rSkin', 2);
  v.rbox(-2, 6, 27, 3, 10, 30, LK ? 'glove' : 'rSkin', 2); v.rrect(26, -1, 7, 2, 9, LK ? 'glove' : 'rSkin', 1);
  if (LK) { v.paint(-2, 6, 31, 2, 10, 32, 'jkY'); }
  else if (side > 0) v.paint(-2, 6, 31, 2, 10, 32, 'band');
  else { v.paint(-2, 6, 32, 2, 10, 32, 'string'); v.paint(-2, 6, 30, 2, 10, 30, 'tape'); }
  return v;
}
function thigh(o) { const c = o.bottom === 'jeans' ? 'jeans' : o.bottom === 'training' ? 'track' : 'legging'; const v = new Vox(); v.rbox(-3, 1, 17, 2, 6, 30, c, 2); v.rrect(31, -2, 2, 1, 5, c, 2); if (o.bottom === 'training') for (let z = 17; z <= 31; z++) v.set(0, 6, z, 'trackS'); return v; }
function shin(o) {
  const v = new Vox(), c = o.bottom === 'jeans' ? 'jeans' : o.bottom === 'training' ? 'track' : 'legging';
  v.rbox(-3, 1, 6, 2, 6, 17, c, 2); v.rrect(18, -2, 2, 1, 5, c, 2);
  if (o.bottom === 'training') for (let z = 6; z <= 17; z++) v.set(0, 6, z, 'trackS');
  if (o.bottom === 'jeans') for (let z = 6; z <= 7; z++) v.shell(z, -4, 1, 3, 7, 'jeans', 2);
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.shoe === 'sandal') { v.rbox(-4, 1, 0, 6, 6, 1, 'sandal', 2); v.rbox(-3, 2, 2, 5, 5, 3, 'rSkin', 2); v.rbox(-3, 2, 4, 2, 5, 6, 'rSkin', 2); for (const [x, y] of [[4, 3], [3, 2], [3, 5]]) v.set(x, y, 4, 'shoeK'); return v; }
  // sneakers putih high-top, kerah & tali hitam
  v.rbox(-4, 1, 0, 6, 6, 1, 'kickK', 2);
  v.rbox(-4, 1, 2, 6, 6, 3, 'kick', 2); v.rrect(4, -4, 1, 4, 6, 'kick', 2);
  v.rbox(-4, 1, 5, 2, 6, 6, 'kick', 2); v.rrect(7, -3, 2, 1, 5, 'kickK', 2);
  for (const x of [1, 3]) v.paint(x, 2, 4, x, 5, 6, 'kickK');
  for (const y of [1, 6]) v.paint(-2, y, 3, 2, y, 4, 'kickK');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam berandal + jaket jeans', top: 'jeans', bottom: 'rok' },
  seragam2: { name: 'Seragam berandal', top: 'kemeja', bottom: 'rok' },
  balap: { name: 'Jaket Lampu Kota', top: 'lampu', bottom: 'jeans', helmOk: true },
  rumah: { name: 'Kaus longgar + training', top: 'kaus', bottom: 'training', shoe: 'sandal' },
};
export function build(opt = {}) {
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', helm: !!opt.helm, face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), skirt = o.bottom === 'rok';
  const top = o.top === 'lampu' ? 'jk' : o.top === 'jeans' ? 'denim' : o.top === 'kaus' ? 'rTee' : 'white';
  const leg = o.bottom === 'jeans' ? 'jeans' : o.bottom === 'training' ? 'track' : 'legging';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]], ['tail', ponytail(), TAIL],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest],
    ['flapF', skirt && skirtF(), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', skirt && skirtB(), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'rSkin', shoulder: top, elbow: o.top === 'lampu' ? 'jk' : 'rSkin', hip: leg, knee: leg }, SKEL, TAIL);
}
