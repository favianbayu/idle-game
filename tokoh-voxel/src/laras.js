// Laras Wibisana: NPC utama cewek, penjual nasi uduk subuh, ceria & keras kepala. Kulit sawo matang terang, pipi bulat,
// gigi gingsul saat tertawa, rambut hitam tebal dikuncir tinggi pakai karet gelang, anak rambut berantakan, jepit kayu
// di poni. Rangka skala 1.24 (sama dengan Rani), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace, skullLayer } from './model.js';
import { tasPinggang, lengan, payungLipat, tudung } from './props.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-7, 0, 15];   // ikatan kuncir tinggi (lokal kepala)

addRamps({
  lPara: ['#b4441c', '#d2562a', '#ea6c3a', '#f68c5c'], lParaS: ['#b4441c'],
  lSkin: ['#9a6640', '#b2774f', '#c48a60', '#d6a074'], lSkinS: ['#b2774f'], lBlush: ['#d9826a'],
  lHair: ['#100b08', '#1a120d', '#24160e', '#382517'], lHairT: ['#24160e', '#382517', '#4e3522', '#664630'],
  karet: ['#c23a2a'], jepit: ['#a87a40', '#c89050', '#dcaa6a', '#ecc488'],
  lOren: ['#a85a34', '#c46a40', '#d9774a', '#e8946a'], kunyit: ['#b88a2a', '#d4a238', '#e8b84a', '#f4d07a'], daun: ['#3a6228', '#4c7a34', '#6c9a4a', '#86b262'],
  handuk: ['#c9d6e2', '#dbe4ec', '#ecf1f6', '#ffffff'], lTrack: ['#22283a', '#2c3448', '#384258', '#4c5670'],
  sandalK: ['#2a6ab0', '#3a7ac0', '#4a8ad0', '#6aa2e0'], tambal: ['#5a4a3a'],
  hijauK: ['#3e5e2c', '#4e7238', '#6c9a4a', '#8ab468'], hijauKS: ['#2e4620'],
  daster: ['#6a3a2a', '#7e4a32', '#9a5e3e', '#b47a54'], dasterS: ['#e8c070'],
  lSkirt: ['#4c505c', '#626773', '#7b808c', '#959aa6'], lSkirtS: ['#555a66'],
});

/* ---------- wajah: mata besar ceria, pipi bulat merah, gigi gingsul (satu gigi menonjol) saat nyengir/ketawa */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', g: 'eyeW', r: 'lBlush', s: 'lSkinS' };
const F0 = '..............';
const F = (brow, eyes, mid, mouth) => [F0, F0, F0, ...brow, ...eyes, mid, ...mouth, F0, F0];
const CH = '.rr........rr.';
export const FACES = {
  biasa: F(['..BBB....BBB..', '..............'], ['.KKKK....KKKK.', '.WKKK....KKKW.', '..KK......KK..'], CH, ['....m....m....', '.....mmmm.....', '..............']),
  kedip: F(['..BBB....BBB..', '..............'], ['..............', '..............', '.KKKK....KKKK.'], CH, ['....m....m....', '.....mmmm.....', '..............']),
  marah: F(['..BB......BB..', '....B....B....'], ['.KKKK....KKKK.', '.WKKK....KKKW.', '..KK......KK..'], CH, ['..............', '....mmmmmm....', '....m....m....']),
  teriak: F(['..BB......BB..', '....B....B....'], ['.KKKK....KKKK.', '.WKKK....KKKW.', '..KK......KK..'], CH, ['....mmmmmm....', '....mTTgTm....', '.....mttm.....']),
  nyengir: F(['..BBB....BBB..', '..............'], ['.KKKK....KKKK.', '.WKKK....KKKW.', '..KK......KK..'], CH, ['...m......m...', '....TTgTTT....', '.....mmmm.....']),
  ketawa: F(['..BBB....BBB..', '..............'], ['..............', '.K..K....K..K.', '..KK......KK..'], CH, ['...mTTTgTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...', '.KK........KK.'], CH, ['....mmmmmm....', '....TTTTTT....', '..............']),
};
export const EXPRS = Object.keys(FACES);

const FR = [6, 9, 12, 13, 12, 13, 13, 12, 13, 13, 12, 13, 9, 6];   // poni pendek berantakan, cukup tinggi supaya alis + jarak ke mata kelihatan
const topZ = (v, x, y) => { for (let z = 24; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
function head(o) {
  const v = new Vox();
  // pipi bulat: rahang selebar pelipis sampai bawah
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = z <= 0 ? [-4, -5, 5, 4, 4] : z === 1 ? [-6, -6, 6, 5, 4] : skullLayer(z); v.rrect(z, a, b, c, d, 'lSkin', r); }
  const map = o.face || FACES[o.expr] || FACES.biasa;
  paintFace(v, map, FCH, 14, -7);
  map.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'g') { const y = c - 7, z = 14 - r, x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'eyeW'); } }));   // gingsul
  v.box(7, -1, 5, 7, 0, 6, 'lSkin'); v.set(7, -1, 4, 'lSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'lSkin'); v.box(-1, y, 6, -1, y, 7, 'lSkinS'); }
  // rambut tebal disisir ke atas ke kuncir tinggi, poni pendek berantakan, anak rambut mencuat
  const zmin = (x, y) => x >= 5 ? FR[Math.max(0, Math.min(13, y + 7))] : Math.abs(y + 0.5) > 5.5 && x >= -3 ? 10 : 6;   // disisir ke atas: telinga & tengkuk kelihatan
  const hair = new Vox();
  for (let z = 3; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'lHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -8, -7, 7, 6, 'lHair', 5); hair.rrect(17, -7, -6, 6, 5, 'lHair', 4); hair.rrect(18, -5, -4, 3, 3, 'lHair', 3);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (const [x, y, z] of [[6, -6, 17], [2, 6, 18], [-3, -7, 17], [7, 3, 15], [-6, 7, 12], [5, -8, 10], [4, 7, 10]]) v.set(x, y, z, 'lHair');   // anak rambut
  for (const y of [-4, -1, 2, 4]) for (let x = -6; x <= 5; x++) { const zz = topZ(v, x, y); if (zz !== null && (x + y * 3) % 4 === 0 && v.get(x, y, zz) === 'lHair') v.set(x, y, zz, 'lHairT'); }
  // jepit kayu di poni kanan (dari depan terlihat di kiri layar)
  for (const [y, z] of [[3, 13], [4, 13], [5, 13], [3, 12]]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'jepit'); }
  // karet gelang merah di pangkal kuncir
  for (let y = -2; y <= 1; y++) for (let z = 14; z <= 16; z++) v.set(-9, y, z, 'karet');
  return v;
}
function ponytail() {   // kuncir tinggi tebal: naik sedikit dari ikatan, lalu jatuh lebat sampai tengkuk
  const v = new Vox();
  const prof = [[16, 2.8], [14, 3.4], [12, 3.7], [10, 3.7], [8, 3.5], [6, 3.2], [4, 2.8], [2, 2.3], [0, 1.8], [-2, 1.2]];
  for (const [z, r] of prof) for (let dz = 0; dz < 2; dz++) {
    const xc = -11 - (16 - z) * 0.12;
    for (let x = Math.floor(xc - r); x <= Math.ceil(xc + r); x++) for (let y = -6; y <= 5; y++) {
      const dx = (x + 0.5 - xc) / (r * 0.85), dy = (y + 0.5) / (r * 1.3);
      if (dx * dx + dy * dy <= 1) v.set(x, y, z + dz, 'lHair');
    }
  }
  for (const [y, z0, z1] of [[-1, 2, 14], [1, 4, 15], [0, -1, 3]]) for (let z = z0; z <= z1; z++) { const x = v.back(y, z); if (x !== null) v.set(x, y, z, 'lHairT'); }
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function chest(o) {
  const v = new Vox(), J = o.top === 'jualan', H = o.top === 'hijau', D = o.top === 'daster';
  const body = J ? 'lOren' : D ? 'daster' : H ? 'white' : 'white';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -4, -6 + t + w, 4 - t, 5 - t - w, body, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'lSkin', 1);
  if (J) {   // kaus oranye pudar + celemek kunyit bergambar daun + handuk kecil di bahu kanan
    for (let y = -2; y <= 1; y++) v.pf(y, 51, 'lSkin');
    v.shell(52, -3, -3, 3, 2, 'lOren', 1);
    for (let z = 32; z <= 46; z++) for (let y = -4; y <= 3; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'kunyit'); }
    for (const [y, z] of [[-2, 40], [-1, 41], [-1, 39], [0, 40], [1, 38], [2, 37], [1, 36]]) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'daun'); }
    for (const s of [-1, 1]) for (let z = 46; z <= 51; z++) { const y = s > 0 ? 3 : -4; const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'kunyit'); }
    for (let x = -5; x <= 4; x++) for (const z of [51, 52]) { if (!v.has(x, 5, z)) v.set(x, 5, z, 'handuk'); if (!v.has(x, 6, z - 1)) v.set(x, 6, z - 1, 'handuk'); }
    for (let z = 44; z <= 50; z++) { v.set(4, 6, z, 'handuk'); v.set(-5, 6, z, 'handuk'); }
    return v;
  }
  if (D) {   // daster batik dipotong pendek: motif titik kuning
    for (let y = -2; y <= 1; y++) v.pf(y, 51, 'lSkin'); v.shell(52, -3, -3, 3, 2, 'daster', 1);
    v.each((x, y, z, c) => { if (c === 'daster' && ((x * 3 + y * 5 + z * 7) % 11) === 0) v.set(x, y, z, 'dasterS'); });
    return v;
  }
  // seragam agak kusut (garis kusut acak), kancing atas terbuka; badge OSIS; atau kemeja kotak di pinggang (jalan)
  for (let z = 33; z <= 48; z++) v.pf(0, z, 'whiteS');
  for (const [y, z] of [[-4, 44], [-3, 43], [2, 38], [3, 37], [-5, 36], [4, 45]]) v.pf(y, z, 'whiteS');
  if (!H) { v.pfBox(3, 44, 4, 46, 'osis'); v.pfBox(-5, 46, -3, 46, 'tag'); }
  for (const [y, z] of [[-1, 50], [0, 50], [0, 49]]) v.pf(y, z, 'lSkin');
  for (let z = 52; z <= 53; z++) { v.shell(z, -3, -4, 3, 3, 'white', 2); for (let y = -1; y <= 0; y++) for (let x = 2; x <= 3; x++) if (v.get(x, y, z) === 'white') v.set(x, y, z, null); }
  return v;
}
function pelvis(o) {
  if (o.bottom === 'rok') return skirtPelvis('lSkirt', 'lSkirtS');
  const v = new Vox(), c = o.bottom === 'training' ? 'lTrack' : o.bottom === 'jeans' ? 'jeans' : 'daster';
  v.rbox(-4, -6, 26, 4, 5, 33, c, 3); v.box(-3, -2, 24, 2, 1, 25, c);
  if (o.top === 'jualan') { for (let z = 30; z <= 33; z++) v.shell(z, -5, -7, 4, 6, 'lOren', 3); for (let z = 26; z <= 31; z++) for (let y = -4; y <= 3; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'kunyit'); } }
  if (o.top === 'hijau') {   // kemeja kotak hijau diikat di pinggang: lingkar + simpul depan + lengan menjuntai
    for (let z = 30; z <= 33; z++) v.shell(z, -5, -7, 4, 6, z % 2 ? 'hijauK' : 'hijauKS', 3);
    for (let z = 22; z <= 31; z++) for (let y = -2; y <= 1; y++) { const x = z >= 29 ? 6 : 5; v.set(x, y + (z < 27 ? (y < 0 ? -1 : 1) : 0), z, (z + y) % 3 ? 'hijauK' : 'hijauKS'); }
    for (let z = 24; z <= 33; z++) for (let y = -6; y <= 5; y++) { const x = v.back(y, z); if (x !== null && z >= 26) v.set(x - 1, y, z, (y + z) % 3 ? 'hijauK' : 'hijauKS'); }
  }
  if (o.top === 'daster') for (let z = 22; z <= 33; z++) { const f = z <= 27 ? 1 : 0; v.shell(z, -5 - f, -7 - f, 4 + f, 6 + f, 'daster', 3); }
  return v;
}
function arm(o) {
  const v = new Vox(), c = { jualan: 'lOren', daster: 'daster' }[o.top] || 'white';
  v.rbox(-2, 6, 40, 2, 10, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2);
  if (o.top === 'jualan') { v.paint(-2, 6, 40, 2, 10, 45, 'lSkin'); v.shell(46, -3, 6, 3, 11, 'lOren', 2); }
  if (o.top === 'daster') v.paint(-2, 6, 40, 2, 10, 46, 'lSkin');
  return v;
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-2, 6, 31, 2, 10, 39, 'lSkin', 2);
  v.rbox(-2, 6, 27, 3, 10, 30, 'lSkin', 2); v.rrect(26, -1, 7, 2, 9, 'lSkin', 1);
  if (side > 0) v.pf(8, 33, 'lSkinS');   // bekas luka kecil kena minyak
  else v.paint(-2, 6, 31, 2, 10, 31, 'karet');   // karet gelang cadangan di pergelangan
  return v;
}
function thigh(o) {
  if (o.bottom === 'rok') return skirtThigh('lSkirt');
  const c = o.bottom === 'training' ? 'lTrack' : o.bottom === 'jeans' ? 'jeans' : 'lSkin', v = new Vox();
  v.rbox(-3, 1, 17, 2, 6, 30, c, 2); v.rrect(31, -2, 2, 1, 5, c, 2);
  if (o.bottom === 'daster') { v.paint(-3, 1, 26, 2, 6, 31, 'daster'); }
  if (o.bottom === 'training') for (let z = 17; z <= 31; z++) v.set(0, 6, z, 'handuk');
  return v;
}
function shin(o) {
  if (o.bottom === 'rok') return skirtShin('lSkirt', 'lSkirtS');
  const c = o.bottom === 'training' ? 'lTrack' : o.bottom === 'jeans' ? 'jeans' : 'lSkin', v = new Vox();
  v.rbox(-3, 1, 6, 2, 6, 17, c, 2); v.rrect(18, -2, 2, 1, 5, c, 2);
  if (o.bottom === 'training') for (let z = 6; z <= 17; z++) v.set(0, 6, z, 'handuk');
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.shoe === 'sandal') { v.rbox(-4, 1, 0, 6, 6, 1, 'sandalK', 2); v.rbox(-3, 2, 2, 5, 5, 3, 'lSkin', 2); v.rbox(-3, 2, 4, 2, 5, 6, 'lSkin', 2); for (const [x, y] of [[4, 3], [3, 2], [3, 5]]) v.set(x, y, 4, 'sandalK'); return v; }
  if (o.shoe === 'kets') { v.rbox(-4, 1, 0, 6, 6, 1, 'sole', 2); v.rbox(-4, 1, 2, 6, 6, 3, 'kick', 2); v.rbox(-3, 1, 4, 2, 6, 5, 'kick', 2); for (const x of [1, 3]) v.paint(x, 2, 4, x, 5, 4, 'lace'); return v; }
  // sepatu sekolah hitam, sol ditambal
  v.rbox(-4, 1, 0, 6, 6, 0, 'tambal', 2); v.rbox(-4, 1, 1, 6, 6, 3, 'bShoe', 2); v.rbox(-3, 2, 4, 1, 5, 4, 'bShoe', 2);
  v.set(-2, 3, 0, 'sole'); v.set(-1, 4, 0, 'sole');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam agak kusut', top: 'kemeja', bottom: 'rok' },
  jualan: { name: 'Jualan subuh: kaus oranye + celemek', top: 'jualan', bottom: 'training', shoe: 'sandal' },
  jalan: { name: 'Kemeja kotak di pinggang + jeans', top: 'hijau', bottom: 'jeans', shoe: 'kets' },
  rumah: { name: 'Daster batik pendek', top: 'daster', bottom: 'daster', shoe: 'sandal' },
};
OUTFITS.malam = { ...OUTFITS.jalan, name: 'Jualan malam: jaket parasut oranye, tas pinggang uang receh',
  sw: { white: 'lPara', whiteS: 'lParaS' }, ball: { elbow: 'lPara' },
  fx: { chest: v => tasPinggang(v, 34), foreR: v => lengan(v, 'lPara', 31, 'lParaS'), foreL: v => lengan(v, 'lPara', 31, 'lParaS') } };
OUTFITS.hujan = { ...OUTFITS.jalan, propOn: 'all', name: 'Hujan: plastik kresek jadi jas hujan, payung sewaan besar (ojek payung)',
  sw: { white: 'prKresek', whiteS: 'prKresekS' },
  fx: { head: v => tudung(v, 'prKresek', 'prKresekS'), foreR: v => payungLipat(v, 'prPayungH', 22) } };
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), rok = o.bottom === 'rok';
  const top = { jualan: 'lOren', daster: 'daster' }[o.top] || 'white';
  const leg = rok ? 'lSkirt' : o.bottom === 'training' ? 'lTrack' : o.bottom === 'jeans' ? 'jeans' : 'lSkin';
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]], ['tail', ponytail(), TAIL],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest],
    ['flapF', rok && skirtPanel('lSkirt', 'lSkirtS', 1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', rok && skirtPanel('lSkirt', 'lSkirtS', -1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'lSkin', shoulder: top, elbow: 'lSkin', hip: leg, knee: o.bottom === 'daster' ? 'lSkin' : leg }, SKEL, TAIL);
  if (rok) P.skirt = skirtInfo(P, 'lSkirt', 'lSkirtS');
  return P;
}
