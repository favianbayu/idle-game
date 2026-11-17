// Bu Sum: penjual sayur gerobak keliling Kenanga (06.00-09.00), 40-an, suaranya nyaring "Sayur, sayur!". Kerudung bergo
// hijau, kaus lengan panjang digulung, kain batik dililit jadi rok, tas pinggang uang, caping saat terik, seikat kangkung,
// sandal jepit. Rangka keluarga Nadia (skala 1.22), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8.5, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.95 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  smSkin: ['#8a5634', '#a0663e', '#b47850', '#c48a60'], smSkinS: ['#94603a'], smBlush: ['#c47a5e'],
  smBergo: ['#2e6a3a', '#387a44', '#428a4e', '#529c5e'], smBergoS: ['#22502c'],
  smKaus: ['#c87a2a', '#d88a34', '#e69a42', '#f0ac56'], smKausS: ['#a8621e'],
  kainS: ['#3a2a5a', '#46346c', '#52407e', '#625090'], kainSS: ['#261a3e'], kainSK: ['#e8c060'],
  tasS: ['#2a2a30', '#34343a', '#3e3e46', '#4a4a54'], tasSZ: ['#c8c8d0'], uangS: ['#c84a6a'],
  kangkung: ['#2e7a2e', '#3a8c3a', '#469e46', '#56b056'], kangkungT: ['#8ab060'], tali: ['#c8a868'],
  smCaping: ['#b8944e', '#c8a45c', '#d8b46c', '#e6c47e'], smCapingS: ['#8a6a34'], jepitS: ['#2a5aa8', '#3266b8', '#3a72c8', '#4a84d8'],
  dasS: ['#a83a5a', '#bc466a', '#cc527a', '#dc668c'], dasSS: ['#86284a'], dasSK: ['#f6e0a0'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'smBlush', s: 'smSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mulut z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['s.KKK....KKK.s', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....m....m....', '.....mmmm.....', F0]),
  kedip: F(BROW, [F0, '.sKKK....KKKs.'], ['....m....m....', '.....mmmm.....', F0]),
  marah: F('..BBB....BBB..', ['..KKK....KKK..', '..WKK....KKW..'], ['....mmmmmm....', F0, F0]),
  teriak: F('.BBB......BBB.', ['..KKK....KKK..', '..WKK....KKW..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),   // "Sayur, sayuuur!"
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', F0]),
  ketawa: F(BROW, ['s.KK......KK.s', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', 'rr...mmmm...rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const open = (y, z) => { const dy = (y + 0.5) / 6.4, dz = (z - 5.5) / 6.9; return dy * dy + dz * dz <= 1; };
function head(o) {
  const v = new Vox(), c = o.hijab, cS = c + 'S';
  for (let z = 0; z <= 14; z++) { const [a, b, cc, d, r] = skull(z); v.rrect(z, a, b, cc, d, 'smSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'smSkin'); v.set(7, -1, 5, 'smSkinS');
  const h = new Vox();   // bergo sederhana tanpa pet
  for (let z = 1; z <= 14; z++) h.rrect(z, -8, -8, 7, 7, c, z <= 11 ? 4 : 5);
  h.rrect(15, -7, -7, 6, 6, c, 4); h.rrect(16, -5, -5, 4, 4, c, 3);
  for (let z = -6; z <= 0; z++) h.rrect(z, -7, -8, 7, 7, c, 4);
  h.each((x, y, z, k) => { if (v.has(x, y, z)) return; if (x >= 3 && z >= 0 && open(y, z)) return; v.set(x, y, z, k); });
  for (let z = 0; z <= 13; z++) for (let y = -9; y <= 8; y++) { const x = v.front(y, z); if (x !== null && x >= 6 && v.get(x, y, z) === c && open(y + (y < 0 ? 1 : -1), z)) v.set(x, y, z, cS); }
  if (o.caping) {   // caping bambu kerucut lebar
    for (let z = 15; z <= 22; z++) { const r = (22 - z) * 2 + 2; for (let x = -r; x <= r; x++) for (let y = -r; y <= r; y++) { const d = Math.hypot(x + 0.5, y + 0.5); if (d <= r && d > r - 2.2) v.set(x, y, z, z === 15 ? 'smCapingS' : (Math.round(Math.atan2(y + 0.5, x + 0.5) * 6) % 2 ? 'smCaping' : 'smCapingS')); } }
    for (let x = -15; x <= 14; x++) for (let y = -15; y <= 14; y++) if (Math.hypot(x + 0.5, y + 0.5) <= 15.5 && Math.hypot(x + 0.5, y + 0.5) > 8) v.set(x, y, 15, 'smCaping');
  }
  return v;
}
function drape(v, c, cS) {
  for (let z = 43; z <= 55; z++) {
    const k = Math.min(3, Math.floor((56 - z) / 2.2)), x0 = -6 - (k > 1 ? 1 : 0), x1 = 6 + k, y0 = -8 - k, y1 = 7 + k;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const inner = x > x0 && x < x1 && y > y0 && y < y1;
      if (inner && v.has(x, y, z)) continue;
      if (z <= 46 && x < 2 && Math.abs(y + 0.5) < 7) continue;
      if (z <= 45 && Math.abs(y + 0.5) > 6.5 - (45 - z) * 1.5) continue;
      if (!inner || !v.has(x, y, z)) v.set(x, y, z, c);
    }
  }
  for (let y = -9; y <= 8; y++) { const x = v.front(y, 43); if (x !== null && v.get(x, y, 43) === c) v.set(x, y, 43, cS); }
}
const batik = (v, c, cS, cK) => { v.each((x, y, z, k) => { if (k !== c) return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + z) % 6 + 6) % 6, b = ((u - z) % 6 + 6) % 6; if (a === 0 || b === 0) v.set(x, y, z, cS); else if (a === 3 && b === 3) v.set(x, y, z, cK); }); return v; };
const skirt = o => o.top === 'jualan' ? ['kainS', 'kainSS', 'kainSK'] : ['dasS', 'dasSS', 'dasSK'];
const sk = (o, v) => { const [c, cS, cK] = skirt(o); return batik(v, c, cS, cK); };
const topC = o => o.top === 'jualan' ? 'smKaus' : 'dasS';
function chest(o) {
  const v = new Vox(), c = topC(o);
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, bel = z >= 33 && z <= 46 ? Math.round(1.5 * Math.sin((z - 32) / 14 * Math.PI)) : 0; v.rrect(z, -5, -7 + t, 4 + bel - t, 6 - t, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, o.hijab, 1);
  if (o.top === 'rumah') batik(v, 'dasS', 'dasSS', 'dasSK');
  drape(v, o.hijab, o.hijab + 'S');
  return v;
}
function pelvis(o) {
  const [c, cS] = skirt(o), v = sk(o, skirtPelvis(c, cS, 20));
  if (o.top === 'jualan') {   // kaus menutup pinggul + tas pinggang hitam berisi uang di depan
    for (let z = 28; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 28 ? 'smKausS' : 'smKaus', 3);
    v.rbox(-6, -9, 29, 6, 8, 30, 'tasS', 3);
    v.rbox(4, -4, 25, 8, 3, 30, 'tasS', 2); v.paint(8, -4, 30, 8, 3, 30, 'tasSZ'); v.set(9, -2, 30, 'uangS'); v.set(9, -1, 30, 'uangS');
  }
  return v;
}
function arm(o) { const v = new Vox(), c = topC(o); v.rbox(-2, 6, 40, 2, 10, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2); if (o.top === 'rumah') batik(v, 'dasS', 'dasSS', 'dasSK'); return v; }
function fore(o, side) {
  const v = new Vox(), J = o.top === 'jualan';
  v.rbox(-2, 6, 31, 2, 10, 39, J ? 'smSkin' : 'smSkin', 2);
  if (J) { v.rbox(-3, 5, 36, 3, 11, 39, 'smKaus', 2); v.paint(-3, 5, 36, 3, 11, 36, 'smKausS'); }   // lengan panjang digulung
  else { v.rbox(-2, 6, 37, 2, 10, 39, 'dasS', 2); }
  v.rbox(-2, 6, 27, 3, 10, 30, 'smSkin', 2); v.rrect(26, -1, 7, 2, 9, 'smSkin', 1);
  if (side > 0 && J) {   // seikat kangkung dijinjing, batang diikat tali, daun menjuntai ke bawah
    for (let z = 8; z <= 25; z++) for (let y = 4; y <= 12; y++) for (let x = -3; x <= 5; x++) { const r = z < 17 ? 2 + (17 - z) * 0.3 : 1.6; if (Math.hypot(x - 1, y - 8) <= r && (z >= 17 || (x + y + z) % 3 !== 0)) v.set(x, y, z, z >= 17 ? 'kangkungT' : ((x + z) & 1) ? 'kangkung' : 'kangkungT'); }
    v.shell(20, -1, 6, 3, 10, 'tali', 1);
  }
  return v;
}
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 6, 7, 0, 'jepitS', 2); v.rbox(-3, 2, 1, 5, 6, 2, 'smSkin', 2); v.rbox(-3, 2, 3, 2, 6, 4, 'smSkin', 2);
  for (const [x, y] of [[4, 4], [3, 3], [3, 5], [2, 2], [2, 6]]) v.set(x, y, 2, 'jepitS');
  return v;
}

export const OUTFITS = {
  jualan: { name: 'Keliling jualan: bergo hijau + caping + kaus oranye digulung + kain batik + tas pinggang + kangkung', top: 'jualan', hijab: 'smBergo', caping: true },
  rumah: { name: 'Di rumah: bergo hijau + daster batik merah muda', top: 'rumah', hijab: 'smBergo' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.jualan), expr: opt.expr || 'biasa', face: opt.face };
  const [c, cS] = skirt(o), A = arm(o), Th = sk(o, skirtThigh(c)), Sn = sk(o, skirtShin(c, cS)), Ft = foot(o), sl = topC(o);
  const panel = s => sk(o, skirtPanel(c, cS, s, 5));
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: o.hijab, shoulder: sl, elbow: 'smSkin', hip: c, knee: c }, SKEL, TAIL);
  P.skirt = skirtInfo(P, c, cS);
  return P;
}
