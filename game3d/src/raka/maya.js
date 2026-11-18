// Maya: anggota Paskibra SMA 3, kelas XI, disiplin, suara lantang, berdiri tegak ("Kiri, kanan, kiri!").
// Kulit sawo matang, alis tegas, rambut disisir licin ke belakang jadi cepol rendah berjaring hitam, tanpa anak rambut.
// Seragam: kemeja putih disetrika licin + dasi abu + emblem merah putih di lengan + lencana paskibra di dada + rok abu panjang
// + sepatu PDH hitam mengilap. Latihan: topi putih + kaus putih lis merah + celana training dongker + kets putih + peluit
// bertali merah putih. Rangka keluarga Rani, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace, skullLayer } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  mySkin: ['#a87450', '#b8825c', '#c69068', '#d29e76'], mySkinS: ['#a4704c'], myBlush: ['#d08070'], myLip: ['#b4505a'], myLash: ['#141010'], myAnting: ['#e8e4dc'],
  myHair: ['#0e0b0a', '#161210', '#1e1916', '#28221e'], myJaring: ['#2c2c30'],
  myPutih: ['#e4e6ea', '#eef0f2', '#f6f8fa', '#ffffff'], myPutihS: ['#c6cad2'], myTie: ['#5e626c'],
  myMerah: ['#c82a2a', '#d43434', '#de4040', '#e84c4c'], myEmas: ['#d8b048'],
  myAbu: ['#62666e', '#6e727a', '#7a7e86', '#868a92'], myAbuS: ['#52565e'],
  myPDH: ['#0a0a0c', '#121214', '#1c1c1e', '#2a2a2e'], myKilap: ['#8a8a92'],
  myTrain: ['#1a2242', '#202a50', '#28345e', '#323e6c'], myTrainS: ['#e8e8ec'], myKets: ['#e6e6e8', '#eeeef0', '#f6f6f8', '#ffffff'], mySol: ['#c8c8cc'], myPeluit: ['#c8ccd4'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', L: 'myLash', m: 'myLip', T: 'teeth', t: 'tongue', r: 'myBlush', s: 'mySkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mulut z 4
const BROW = '.BBBB....BBBB.';   // alis tegas
const EYE = ['.LKKK....KKKL.', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', 'r............r', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0, F0]),
  marah: F('..BBB....BBB..', EYE, ['....mmmmmm....', F0, F0]),
  teriak: F('..BBBB..BBBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mmmmmm....', '....mttttm....', '.....mmmm.....']),   // aba-aba
  nyengir: F(BROW, EYE, ['....mTTTTm....', 'r....mmmm....r', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', 'r....mttm....r', F0]),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const S_ = o => o.top === 'seragam';
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skullLayer(z); v.rrect(z, a, b, c, d, 'mySkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'mySkin'); v.set(7, -1, 5, 'mySkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'mySkin'); v.box(-1, y, 6, -1, y, 7, 'mySkinS'); }
  // rambut licin ke belakang: dahi terbuka, garis rambut rapi, telinga terlihat
  const hair = new Vox();
  for (let z = 4; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'myHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -7, -7, 6, 6, 'myHair', 4); hair.rrect(17, -5, -5, 4, 4, 'myHair', 3);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 15 : Math.abs(y + 0.5) > 6.5 && x >= -2 ? 8 : 4)) v.set(x, y, z, c); });
  for (const y of [-5, -2, 1, 4]) for (let x = -6; x <= 5; x++) { let z = 18; while (z > 0 && !v.has(x, y, z)) z--; if (v.get(x, y, z) === 'myHair' && (x + 20) % 3 === 0) v.set(x, y, z, 'myJaring'); }   // garis sisir licin
  for (const y of [-8, 7]) v.set(0, y, 4, 'myAnting');   // anting mutiara kecil
  // cepol rendah berjaring di tengkuk
  for (let x = -14; x <= -8; x++) for (let y = -5; y <= 4; y++) for (let z = 2; z <= 10; z++) {
    const d = ((x + 10.5) / 3.6) ** 2 + ((y + 0.5) / 4.6) ** 2 + ((z - 6) / 4.2) ** 2;
    if (d <= 1 && !v.has(x, y, z)) v.set(x, y, z, (x + y + z) % 2 === 0 ? 'myJaring' : 'myHair');
  }
  if (!S_(o)) {   // topi putih latihan
    for (let z = 13; z <= 18; z++) v.shell(z, -8, -8, 7, 7, 'myPutih', z >= 17 ? 6 : 5);
    v.rrect(18, -6, -6, 5, 5, 'myPutih', 4); v.rrect(19, -3, -3, 2, 2, 'myPutih', 1);
    for (let x = 7; x <= 12; x++) for (let y = -6; y <= 5; y++) if (Math.abs(y + 0.5) <= 6 - (x > 10 ? 1 : 0)) v.set(x, y, 13, x === 7 ? 'myMerah' : 'myPutihS');
  }
  return v;
}

const topC = o => 'myPutih';
function chest(o) {
  const v = new Vox(), c = topC(o);
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -4, -6 + t + w, 4 - t, 5 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'mySkin', 1);
  if (S_(o)) {   // kemeja rapi dikancing, dasi abu, lencana paskibra (merah putih + emas)
    for (let z = 33; z <= 48; z++) v.pf(0, z, 'myPutihS');
    for (let z = 52; z <= 54; z++) v.shell(z, -3, -4, 3, 3, 'myPutih', 2);
    for (let z = 38; z <= 53; z++) for (let y = -1; y <= 0; y++) v.pf(y, z, 'myTie');
    v.pfBox(2, 45, 4, 45, 'myMerah'); v.pfBox(2, 44, 4, 44, 'myPutih'); v.pf(3, 46, 'myEmas'); v.pf(3, 43, 'myEmas');
    v.pfBox(-5, 46, -3, 46, 'myPutihS');
  } else {   // kaus putih lis merah, peluit bertali merah putih
    for (let y = -2; y <= 1; y++) v.pf(y, 51, 'mySkin');
    v.shell(52, -3, -3, 3, 2, 'myMerah', 1);
    for (let z = 40; z <= 51; z++) { const y = Math.round(-3 + (51 - z) * 0.15); v.pf(y, z, z % 2 ? 'myMerah' : 'myPutihS'); v.pf(-y - 1, z, z % 2 ? 'myMerah' : 'myPutihS'); }
    v.pfBox(-1, 39, 0, 40, 'myPeluit');
    for (const z of [32, 33]) v.shell(z, -4, -6, 4, 5, 'myMerah', 3);
  }
  return v;
}
function pelvis(o) {
  if (S_(o)) return skirtPelvis('myAbu', 'myAbuS', 22);
  const v = new Vox(); v.rbox(-4, -6, 26, 4, 5, 33, 'myTrain', 3); v.box(-3, -2, 24, 2, 1, 25, 'myTrain');
  return v;
}
function arm(o) {
  const v = new Vox(), c = topC(o);
  v.rbox(-2, 6, 40, 2, 10, 50, 'mySkin', 2); v.rrect(51, -2, 6, 2, 10, c, 2); v.paint(-2, 6, 45, 2, 10, 51, c);
  v.shell(45, -3, 5, 3, 11, S_(o) ? 'myPutih' : 'myMerah', 2);
  if (S_(o)) { v.psBox(1, -1, 47, 1, 48, 'myMerah'); v.psBox(1, -1, 46, 1, 46, 'myPutihS'); }   // emblem merah putih di lengan
  return v;
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-2, 6, 31, 2, 10, 39, 'mySkin', 2);
  v.rbox(-2, 6, 27, 3, 10, 30, 'mySkin', 2); v.rrect(26, -1, 7, 2, 9, 'mySkin', 1);
  if (side < 0) v.paint(-2, 6, 32, 2, 10, 33, 'myPDH');   // jam tangan hitam
  return v;
}
function legs(o) {
  if (S_(o)) return [skirtThigh('myAbu'), skirtShin('myAbu', 'myAbuS')];
  const th = new Vox(); th.rbox(-4, 1, 17, 3, 7, 31, 'myTrain', 3); for (let z = 17; z <= 31; z++) th.set(0, 8, z, 'myTrainS');
  const sn = new Vox(); sn.rbox(-4, 1, 5, 3, 7, 17, 'myTrain', 3); for (let z = 5; z <= 17; z++) sn.set(0, 8, z, 'myTrainS');
  return [th, sn];
}
function foot(o) {
  const v = new Vox();
  if (S_(o)) { v.rbox(-4, 1, 0, 6, 6, 0, 'myPDH', 2); v.rbox(-4, 1, 1, 6, 6, 3, 'myPDH', 2); v.rbox(-3, 2, 4, 1, 5, 5, 'myPDH', 2); v.set(6, 3, 2, 'myKilap'); v.set(6, 4, 3, 'myKilap'); return v; }
  v.rbox(-4, 1, 0, 6, 6, 1, 'mySol', 2); v.rbox(-4, 1, 2, 6, 6, 3, 'myKets', 2); v.rbox(-3, 1, 4, 2, 6, 5, 'myKets', 2); v.paint(-4, 1, 2, -4, 6, 3, 'myMerah');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam: cepol berjaring + kemeja putih licin + dasi abu + lencana paskibra + emblem merah putih + rok abu panjang + sepatu PDH mengilap', top: 'seragam' },
  latihan: { name: 'Latihan: topi putih + kaus putih lis merah + peluit bertali merah putih + celana training dongker + kets putih', top: 'latihan' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.seragam), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), [Th, Sn] = legs(o), Ft = foot(o), s = S_(o), leg = s ? 'myAbu' : 'myTrain';
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', s && skirtPanel('myAbu', 'myAbuS', 1, 5), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', s && skirtPanel('myAbu', 'myAbuS', -1, 5), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'mySkin', shoulder: 'myPutih', elbow: 'mySkin', hip: leg, knee: leg }, SKEL, TAIL);
  if (s) P.skirt = skirtInfo(P, 'myAbu', 'myAbuS');
  return P;
}
