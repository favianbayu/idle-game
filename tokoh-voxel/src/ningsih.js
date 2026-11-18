// Bu Kantin Ningsih: penjual soto di kantin SMA 3, 40-an, montok dan cerewet tapi baik, hafal pesanan tiap anak
// ("Soto lagi? Pakai nasi atau lontong?"). Kantin: jilbab bergo hijau tosca + blus lengan panjang krem + celemek kotak merah
// bernoda kuah + rok batik cokelat + sandal + sendok sayur & mangkuk soto. Ke pasar: bergo cokelat + gamis bunga + keranjang
// belanja plastik berisi sayur. Rangka keluarga Nadia sedikit lebih lebar, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12, thigh: 12.5, up: 4, neck: 21, shY: 8.5, shZ: 15, upper: 10, fore: 9, hipY: 4.5, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  ngSkin: ['#a87048', '#b87e54', '#c68c60', '#d29a6c'], ngSkinS: ['#a46c44'], ngBlush: ['#cc7c66'],
  ngBergo: ['#1a7a72', '#208a80', '#289a8e', '#34aa9c'], ngBergoS: ['#126058'],
  ngBlus: ['#d8ccb0', '#e2d6bc', '#eae0c8', '#f2ead6'], ngBlusS: ['#c0b494'],
  ngCelemek: ['#c83a3a', '#d44646', '#de5454', '#e86262'], ngCelemekS: ['#f2e8e0'], ngNoda: ['#c8902a'],
  ngRok: ['#4a2e1a', '#583820', '#664226', '#744c2e'], ngRokS: ['#c89a50'], ngSandal: ['#2a2a2e'],
  ngSendok: ['#b8bcc4', '#c8ccd4', '#d8dce2', '#e8eaee'], ngMangkuk: ['#f2f2ee'], ngMangkukS: ['#3a7ac0'], ngKuah: ['#d8a83a'], ngDaun: ['#3a8a3a'],
  ngCoklat: ['#6a4a32', '#76543a', '#826044', '#8e6a4e'], ngCoklatS: ['#54382a'],
  ngGamis: ['#5a6a9a', '#6474a6', '#6e7eb0', '#7a8aba'], ngGamisS: ['#f0c0d0'],
  ngKeranjang: ['#d03a5a', '#dc4866', '#e65674', '#ee6680'], ngKeranjangS: ['#a42a44'], ngSayur: ['#4a9a3a'], ngWortel: ['#e8781a'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'ngBlush', s: 'ngSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....m....m....', '.r...mmmm...r.', F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['....m....m....', '.r...mmmm...r.', F0]),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', '...m......m...', F0]),   // ngutang belum bayar
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.r...mmmm...r.', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.r...mttm...r.', F0]),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const K = o => o.top === 'kantin';
const jc = o => K(o) ? 'ngBergo' : 'ngCoklat';
const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z === 2 ? [-6, -7, 6, 6, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const open = (y, z) => { const dy = (y + 0.5) / 6.6, dz = (z - 5.5) / 6.9; return dy * dy + dz * dz <= 1; };
function head(o) {
  const v = new Vox(), c = jc(o);
  for (let z = 0; z <= 14; z++) { const [a, b, cc, d, r] = skull(z); v.rrect(z, a, b, cc, d, 'ngSkin', r); }   // pipi tembam
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'ngSkin'); v.set(7, -1, 5, 'ngSkinS');
  // bergo instan: pet kecil di dahi, bukaan wajah oval, kain jatuh lebar ke dada
  const h = new Vox();
  for (let z = 1; z <= 14; z++) h.rrect(z, -8, -8, 7, 7, c, z <= 11 ? 4 : 5);
  h.rrect(15, -7, -7, 6, 6, c, 4); h.rrect(16, -5, -5, 4, 4, c, 3);
  for (let z = -6; z <= 0; z++) h.rrect(z, -8, -9, 7, 8, c, 4);
  h.each((x, y, z, k) => { if (v.has(x, y, z)) return; if (x >= 3 && z >= 0 && open(y, z)) return; v.set(x, y, z, k); });
  for (let y = -4; y <= 3; y++) v.set((v.front(y, 13) ?? 6) + 1, y, 13, c + 'S');   // pet bergo menonjol di dahi
  for (let z = 0; z <= 12; z++) for (let y = -9; y <= 8; y++) { const x = v.front(y, z); if (x !== null && x >= 6 && v.get(x, y, z) === c && open(y + (y < 0 ? 1 : -1), z)) v.set(x, y, z, c + 'S'); }
  return v;
}

const topC = o => K(o) ? 'ngBlus' : 'ngGamis';
function chest(o) {
  const v = new Vox(), c = topC(o), j = jc(o);
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z <= 38 ? -1 : 0; v.rrect(z, -6, -8 + t - w, 5 - t, 7 - t + w, c, 3); }   // badan montok
  v.rbox(-2, -2, 52, 2, 1, 55, j, 1);
  if (K(o)) {   // celemek kotak merah-putih bertali leher, noda kuah kuning
    for (let z = 32; z <= 47; z++) for (let y = -6; y <= 5; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, ((y + 20) % 3 === 0 || z % 3 === 0) ? 'ngCelemekS' : 'ngCelemek'); }
    for (const [y, z] of [[-3, 37], [-2, 37], [-2, 36], [2, 41], [3, 40]]) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'ngNoda'); }
    for (let z = 34; z <= 36; z++) for (let y = -9; y <= 8; y++) { const x = v.back(y, z); if (x !== null && Math.abs(y + 0.5) < 2) v.set(x - 1, y, z, 'ngCelemek'); }   // simpul tali di punggung
  } else v.each((x, y, z, k) => { if (k === 'ngGamis' && (x * 5 + y * 3 + z * 7) % 23 === 0) v.set(x, y, z, 'ngGamisS'); });
  for (let z = 45; z <= 54; z++) { const k = Math.min(2, Math.floor((55 - z) / 3)); for (let y = -9 - k; y <= 8 + k; y++) for (let x = -7 - k; x <= 6 + k; x++) { if (z <= 48 && x < 1 && Math.abs(y + 0.5) < 7.5) continue; if (!v.has(x, y, z) || (z >= 47 && Math.abs(y + 0.5) < 8.5 && (x === v.front(y, z) || x === v.back(y, z)))) v.set(x, y, z, j); } }
  for (let y = -9; y <= 8; y++) { const x = v.front(y, 45); if (x !== null && v.get(x, y, 45) === j) v.set(x, y, 45, j + 'S'); }
  return v;
}
const batik = v => v.each((x, y, z, c) => { if (c === 'ngRok' && ((x + y * 2 + z * 3) % 7 === 0)) v.set(x, y, z, 'ngRokS'); });
const gamisDot = v => v.each((x, y, z, c) => { if (c === 'ngGamis' && (x * 5 + y * 3 + z * 7) % 23 === 0) v.set(x, y, z, 'ngGamisS'); });
const apron = (v, z0, z1) => { for (let z = z0; z <= z1; z++) for (let y = -6; y <= 5; y++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, ((y + 20) % 3 === 0 || z % 3 === 0) ? 'ngCelemekS' : 'ngCelemek'); } return v; };
const apronTop = v => { let hi = -99; v.each((x, y, z) => { hi = Math.max(hi, z); }); return apron(v, hi - 9, hi); };
const skc = o => K(o) ? 'ngRok' : 'ngGamis', sks = o => K(o) ? 'ngRokS' : 'ngGamisS';
const deco = (o, v) => { if (K(o)) batik(v); else gamisDot(v); return v; };
function pelvis(o) {
  const v = deco(o, skirtPelvis(skc(o), sks(o), 22));
  if (K(o)) apron(v, 26, 33);   // celemek sampai paha
  else for (let z = 30; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'ngGamis', 3);
  return v;
}
function arm(o) { const v = new Vox(), c = topC(o); v.rbox(-3, 6, 40, 2, 11, 50, c, 2); v.rrect(51, -3, 6, 2, 11, c, 2); return v; }
function fore(o, side) {
  const v = new Vox(), c = topC(o);
  v.rbox(-3, 6, 31, 2, 11, 39, c, 2); v.paint(-3, 6, 31, 2, 11, 32, K(o) ? 'ngBlusS' : 'ngGamisS');
  v.rbox(-2, 6, 27, 3, 10, 30, 'ngSkin', 2); v.rrect(26, -1, 7, 2, 9, 'ngSkin', 1);
  if (K(o) && side > 0) {   // sendok sayur bergagang panjang
    for (let z = 22; z <= 36; z++) v.set(3, 8, z, 'ngSendok');
    for (let x = 2; x <= 6; x++) for (let y = 6; y <= 10; y++) { const d = (x - 4) ** 2 + (y - 8) ** 2; if (d <= 5) v.set(x, y, 20, 'ngSendok'); if (d <= 5 && d >= 3) v.set(x, y, 21, 'ngSendok'); }
  }
  if (K(o) && side < 0) {   // mangkuk soto bergaris biru: kuah kuning + daun bawang
    for (let z = 22; z <= 26; z++) { const r = z === 22 ? 2 : z <= 24 ? 3 : 4; for (let x = 4 - r; x <= 4 + r; x++) for (let y = 8 - r; y <= 8 + r; y++) if ((x - 4) ** 2 + (y - 8) ** 2 <= r * r + 1) v.set(x, y, z, z === 25 ? 'ngMangkukS' : 'ngMangkuk'); }
    for (let x = 1; x <= 7; x++) for (let y = 5; y <= 11; y++) if ((x - 4) ** 2 + (y - 8) ** 2 <= 9) v.set(x, y, 26, (x + y) % 4 === 0 ? 'ngDaun' : 'ngKuah');
  }
  if (!K(o) && side < 0) {   // keranjang belanja plastik pink berisi sayur & wortel
    v.rbox(-3, 8, 12, 5, 16, 21, 'ngKeranjang', 1);
    for (let z = 13; z <= 20; z += 2) for (let y = 8; y <= 16; y += 2) v.set(5, y, z, 'ngKeranjangS');
    for (let x = -2; x <= 4; x++) for (let y = 9; y <= 15; y++) v.set(x, y, 22, (x + y) % 3 ? 'ngSayur' : 'ngWortel');
    for (let z = 22; z <= 29; z++) { v.set(1, 9, z, 'ngKeranjang'); v.set(1, 15, z, 'ngKeranjang'); } for (let y = 9; y <= 15; y++) v.set(1, y, 29, 'ngKeranjang');
  }
  return v;
}
function foot(o) {
  const v = new Vox();
  v.rbox(-4, 1, 0, 6, 6, 1, 'ngSandal', 2); v.rbox(-3, 2, 2, 5, 5, 3, 'ngSkin', 2); v.rbox(-3, 2, 4, 2, 5, 5, 'ngSkin', 2);
  v.paint(2, 2, 3, 3, 5, 3, 'ngSandal');
  return v;
}

export const OUTFITS = {
  kantin: { name: 'Kantin: bergo hijau tosca + blus krem + celemek kotak merah bernoda kuah + rok batik + sandal + sendok sayur & mangkuk soto', top: 'kantin' },
  pasar: { name: 'Ke pasar: bergo cokelat + gamis biru bunga + keranjang belanja plastik berisi sayur', top: 'pasar' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.kantin), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Ft = foot(o), sl = topC(o), c = skc(o), s = sks(o);
  const Th = deco(o, skirtThigh(c)), Sn = deco(o, skirtShin(c, s));
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', K(o) ? apronTop(deco(o, skirtPanel(c, s, 1, 5))) : deco(o, skirtPanel(c, s, 1, 5)), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', deco(o, skirtPanel(c, s, -1, 5)), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: jc(o), shoulder: sl, elbow: sl, hip: c, knee: c }, SKEL, TAIL);
  P.skirt = skirtInfo(P, c, s);
  return P;
}
