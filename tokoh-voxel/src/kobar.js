// Kobar: 19 tahun, ketua Serigala Besi, kakak Kirana, bos jalanan, jago mesin di bengkel Wijaya Motor.
// Tubuh kekar besar, mohawk hitam-merah dengan sisi dicukur, bekas jahitan di dagu, rompi jeans patch serigala, rantai
// dompet, suka tertawa mengaum. Rangka keluarga Bram (skala 1.36), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 15, thigh: 15.5, up: 4, neck: 24, shY: 10.5, shZ: 17, upper: 11, fore: 11.5, hipY: 5, flap: 6, ballR: 1.1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  koSkin: ['#7a4a2e', '#925c3a', '#a86c48', '#ba7e58'], koSkinS: ['#8a5634'], koScar: ['#d09a78'],
  koHair: ['#0c0a0a', '#141010', '#1c1616', '#2a2020'], koMerah: ['#8a1a14', '#a8221a', '#c23a2a', '#de5a44'], koSide: ['#2c221c', '#342820', '#3c2e26', '#46362c'],
  rompiK: ['#2a3a5a', '#33476c', '#3a5a8a', '#5272a2'], rompiKS: ['#1e2a40'], tankK: ['#121214', '#1a1a1e', '#24242a', '#323238'],
  celanaK: ['#141416', '#1c1c20', '#222226', '#303036'], bootsKo: ['#0c0b0e', '#141317', '#1e1d22', '#302f36'], rantai: ['#8a8e96', '#a8acb4', '#c4c8d0', '#e0e4ea'],
  coverall: ['#4a5258', '#566068', '#646e78', '#7a8590'], coverallS: ['#3a4046'], kbBalap: ['#16181e', '#1e2028', '#282b36', '#363a48'],
});

/* ---------- wajah: alis tebal tegas 2 baris + 1 baris jarak, mata tajam, seringai lebar, jahitan di dagu */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'koSkinS', x: 'koScar' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, ...brow, F0, ...eyes, F0, F0, F0, ...mouth, '......x.x.....', '.......x......'];   // 15 baris, mulut z 4, jahitan dagu z 1..0
const BROW = ['BBBBB....BBBBB', '..BBB....BBB..'];
const EYE = ['.KKKK....KKKK.', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['...mmmmmmm....', '.........m....', F0]),
  kedip: F(BROW, [F0, '.KKKK....KKKK.'], ['...mmmmmmm....', '.........m....', F0]),
  marah: F(['.BB........BB.', '..BBBB..BBBB..'], EYE, ['...mmmmmmmm...', '...m......m...', F0]),
  teriak: F(['.BB........BB.', '..BBBB..BBBB..'], EYE, ['...mTTTTTTm...', '...mtttttm....', '....mmmmm.....']),
  nyengir: F(BROW, EYE, ['..mTTTTTTTTm..', '...mmmmmmmm...', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['..mTTTTTTTTm..', '..mtttttttm...', '...mmmmmmm....']),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...'], ['...mmmmmmmm...', '...TTTTTTTT...', F0]),
};
export const EXPRS = Object.keys(FACES);

const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
const topZ = (v, x, y) => { for (let z = 30; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];   // rahang kotak
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'koSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'koSkin'); v.set(7, -1, 5, 'koSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'koSkin'); v.box(-1, y, 6, -1, y, 7, 'koSkinS'); }
  v.set(-1, 8, 7, 'rantai'); v.set(-1, 8, 6, 'rantai'); v.set(-1, -9, 6, 'rantai');   // anting
  // sisi dicukur tipis (gelap, bukan warna kulit) + jambul mohawk di tengah, ujung merah
  const side = new Vox();
  for (let z = 6; z <= 15; z++) side.rrect(z, -8, -8, 7, 7, 'koSide', 4);
  side.rrect(16, -6, -6, 5, 5, 'koSide', 4);
  side.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 10 : 6)) v.set(x, y, z, c); });
  for (let x = -9; x <= 7; x++) {
    const base = topZ(v, x, 0) ?? 15, h = x >= 5 ? 6 - (x - 5) : x <= -6 ? 4 + (x + 6) : 7;
    for (let y = -2; y <= 1; y++) { const hy = h - (Math.abs(y + 0.5) > 1 ? 1 : 0); for (let k = 0; k <= hy; k++) v.set(x, y, base + k, k >= hy - 2 ? 'koMerah' : 'koHair'); }
  }
  return v;
}

/* ---------- badan kekar (sisi +y; sisi -y = cermin) */
function chest(o) {
  const v = new Vox(), T = o.top;
  const body = T === 'geng' ? 'tankK' : T === 'bengkel' ? 'tankK' : 'kbBalap';
  for (let z = 37; z <= 58; z++) { const w = z <= 42 ? 1 : z <= 46 ? 0 : -1, t = z === 58 ? 1 : 0; v.rrect(z, -6, -9 + w + t, 5 - t, 8 - w - t, body, z >= 57 ? 4 : 3); }
  v.rbox(-3, -3, 59, 2, 2, 62, 'koSkin', 2);
  if (T === 'geng' || T === 'bengkel') {   // kaus kutang hitam: bahu terbuka, kerah U
    for (let z = 52; z <= 58; z++) for (let y = -9; y <= 8; y++) if (Math.abs(y + 0.5) > 5.5 || (Math.abs(y + 0.5) < 2.5 && z >= 55)) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'koSkin'); const xb = v.back(y, z); if (xb !== null && Math.abs(y + 0.5) > 5.5) v.set(xb, y, z, 'koSkin'); }
    v.each((x, y, z, c) => { if (c === 'tankK' && z >= 53 && Math.abs(y + 0.5) > 6.5) v.set(x, y, z, 'koSkin'); });
  }
  if (T === 'geng') {   // rompi jeans terbuka tanpa lengan, patch kepala serigala di punggung, pin di dada
    v.each((x, y, z, c) => { if ((c === 'tankK' || c === 'koSkin') && z <= 57 && (Math.abs(y + 0.5) > 3.5 || x <= 0) && !(z >= 53 && Math.abs(y + 0.5) > 6.5)) v.set(x, y, z, 'rompiK'); });
    for (let z = 37; z <= 57; z++) { v.pf(-5, z, 'rompiKS'); v.pf(4, z, 'rompiKS'); }
    for (let y = -9; y <= 8; y++) v.pb(y, 44, 'rompiKS');
    ['K.....K', 'KK...KK', 'KKKKKKK', 'K.KKK.K', 'KKKKKKK', '.KKrKK.', '..KKK..'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pb(3 - c, 55 - r, ch === 'r' ? 'koMerah' : 'koSide'); }));   // patch serigala (cermin: ditulis dari belakang)
    v.pf(5, 50, 'koMerah'); v.pf(6, 50, 'rantai'); v.pf(-7, 49, 'rantai');
    return v;
  }
  if (T === 'bengkel') {   // kutang hitam + coverall abu dibuka, bagian atasnya diikat di pinggang (lihat pelvis)
    v.each((x, y, z, c) => { if (c === 'tankK' && rnd(x, y, z) % 13 === 0) v.set(x, y, z, 'koSide'); });
    return v;
  }
  // jaket balap: hitam dengan garis biru tebal dari bahu, nomor 1 di punggung, ritsleting
  for (let z = 37; z <= 57; z++) for (const y of [-6, -5, 4, 5]) { v.pf(y, z, 'rompiK'); v.pb(y, z, 'rompiK'); }
  for (let z = 37; z <= 57; z++) v.pf(0, z, 'rantai');
  for (let z = 59; z <= 60; z++) v.shell(z, -4, -5, 3, 4, 'kbBalap', 2);
  ['.X.', 'XX.', '.X.', '.X.', 'XXX'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'X') v.pb(1 - c, 54 - r, 'white'); }));
  return v;
}
function pelvis(o) {
  const c = o.top === 'bengkel' ? 'coverall' : 'celanaK', v = new Vox();
  v.rbox(-6, -8, 30, 5, 7, 36, c, 3); v.box(-4, -2, 28, 3, 1, 29, c);
  if (o.top === 'bengkel') {   // lengan coverall diikat di pinggang, simpul di depan
    for (let z = 34; z <= 37; z++) v.shell(z, -7, -9, 6, 8, z === 37 ? 'coverallS' : 'coverall', 3);
    v.rbox(6, -2, 32, 8, 1, 36, 'coverall', 2); for (const y of [-2, 1]) for (let z = 26; z <= 31; z++) v.set(7, y, z, 'coverall');
  } else {
    v.rbox(-6, -8, 35, 5, 7, 36, 'belt', 3); v.pfBox(-1, 35, 0, 36, 'buckle');
    for (let k = 0; k <= 8; k++) v.set(-6 + Math.round(Math.abs(k - 4) * 0.4) - 1, 8, 34 - Math.round(Math.sin(k / 8 * Math.PI) * 5), 'rantai');   // rantai dompet melengkung di pinggul kanan
    if (o.top === 'balap') for (let z = 35; z <= 36; z++) v.shell(z, -7, -9, 6, 8, 'kbBalap', 3);
  }
  return v;
}
const sleeveC = o => o.top === 'balap' ? 'kbBalap' : 'koSkin';
function arm(o) {   // lengan kekar
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-4, 8, 46, 3, 14, 58, c, 3); v.rrect(59, -3, 8, 3, 14, c, 3);
  if (o.top === 'balap') for (let z = 46; z <= 58; z++) { v.set(0, 14, z, 'rompiK'); v.set(-1, 14, z, 'rompiK'); }
  else for (const [x, z] of [[3, 52], [3, 51], [3, 50], [2, 52], [2, 50], [3, 49]]) v.set(x, 14, z, 'koSide');   // tato taring di lengan atas
  return v;
}
function fore(o, side) {
  const v = new Vox(), B = o.top === 'balap';
  v.rbox(-3, 8, 35, 3, 14, 46, B ? 'kbBalap' : 'koSkin', 3);
  v.rbox(-3, 8, 30, 4, 14, 34, B ? 'glove' : 'koSkin', 3); v.rrect(29, -2, 9, 3, 13, B ? 'glove' : 'koSkin', 2);
  if (B) v.paint(-3, 8, 35, 3, 14, 36, 'rompiK');
  else if (side < 0) for (let y = 8; y <= 14; y++) v.set(4, y, 33, 'rantai');   // gelang rantai
  if (o.top === 'bengkel') for (const [x, y, z] of [[4, 10, 31], [4, 12, 32], [3, 9, 38]]) v.set(x, y, z, 'koSide');
  return v;
}
function thigh(o) { const c = o.top === 'bengkel' ? 'coverall' : 'celanaK', v = new Vox(); v.rbox(-5, 1, 20, 4, 8, 34, c, 3); v.rrect(35, -4, 2, 3, 7, c, 3); return v; }
function shin(o) {
  const c = o.top === 'bengkel' ? 'coverall' : 'celanaK', v = new Vox();
  v.rbox(-5, 1, 12, 4, 8, 20, c, 3); v.rrect(21, -4, 2, 3, 7, c, 3);
  v.rbox(-5, 1, 6, 4, 8, 11, 'bootsKo', 3);   // leher boots
  for (const z of [7, 9]) v.paint(-5, 1, z, -5, 8, z, 'rantai');
  return v;
}
function foot() {   // boots hitam besar, sol tebal, gesper
  const v = new Vox();
  v.rbox(-5, 1, 0, 8, 8, 1, 'sole', 3); v.paint(-5, 1, 0, 8, 8, 1, 'bootsKo');
  v.rbox(-5, 1, 2, 8, 8, 4, 'bootsKo', 3); v.rbox(-5, 1, 5, 3, 8, 7, 'bootsKo', 3);
  v.paint(3, 1, 4, 3, 8, 4, 'rantai');
  return v;
}

export const OUTFITS = {
  geng: { name: 'Serigala Besi: rompi jeans patch serigala + kutang hitam + rantai dompet + boots', top: 'geng' },
  bengkel: { name: 'Wijaya Motor: kutang hitam + coverall diikat di pinggang', top: 'bengkel' },
  balap: { name: 'Balap: jaket balap hitam-biru nomor 1 + sarung tangan', top: 'balap' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  // game memanggil 'seragam': Kobar memakai baju geng
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.geng), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = o.top === 'bengkel' ? 'coverall' : 'celanaK';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'koSkin', shoulder: sl, elbow: sl, hip: leg, knee: leg }, SKEL, TAIL);
}
