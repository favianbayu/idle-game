// Teh Euis: penjual pecel di lapak Kenanga (06.00-10.00), 30-an, urang Sunda ramah ("Pecel pedas atau sedang, Kasep?").
// Kerudung instan merah muda, blus lengan panjang hijau toska, celemek batik, kain batik cokelat, pincuk pecel di tangan,
// sandal jepit. Hari Minggu pakai gamis kuning + kerudung krem. Rangka keluarga Nadia (skala 1.22), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8.5, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.95 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  euSkin: ['#a8724a', '#bc8458', '#cc966a', '#dca87c'], euSkinS: ['#b47c52'], euBlush: ['#e08a7a'],
  euKer: ['#c8507a', '#d85e88', '#e46e96', '#ee84a8'], euKerS: ['#a83e64'], euKer2: ['#c8b89a', '#d6c8aa', '#e2d6ba', '#ece4cc'], euKer2S: ['#b0a080'],
  blusEu: ['#2a8a8a', '#329a9a', '#3caaaa', '#4ebcbc'], blusEuS: ['#1e6a6a'],
  kainEu: ['#5a3418', '#6a3e1e', '#7c4a26', '#905a30'], kainEuS: ['#341c0a'], kainEuK: ['#e8c070'],
  celEu: ['#7a2a2a', '#8a3232', '#9c3c3c', '#ae4a4a'], celEuS: ['#561c1c'], celEuK: ['#f0d080'],
  pincuk: ['#3a8a3a', '#469a46', '#52aa52', '#62bc62'], pecel: ['#c8902a', '#d89e34', '#e6ae40', '#f0be54'], pecelS: ['#e8e0c8'], pecelH: ['#3a7a2a'],
  gamEu: ['#d8b03a', '#e4be46', '#eecc56', '#f6da6c'], gamEuS: ['#b8902a'], jepitE: ['#d84a8a', '#e65a98', '#f06aa6', '#f67eb6'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'euBlush', s: 'euSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '.sWKK....KKWs.'];
export const FACES = {
  biasa: F(BROW, EYE, ['....m....m....', '.....mmmm.....', 'r............r'.slice(0, 14)]),
  kedip: F(BROW, [F0, '.sKKK....KKKs.'], ['....m....m....', '.....mmmm.....', F0]),
  marah: F('..BBB....BBB..', ['..KKK....KKK..', '..WKK....KKW..'], ['....mmmmmm....', F0, F0]),
  teriak: F('.BBB......BBB.', ['..KKK....KKK..', '..WKK....KKW..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),   // "Pecel, pecel!"
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', F0]),
  ketawa: F(BROW, ['s.KK......KK.s', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', 'rr...mmmm...rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const open = (y, z) => { const dy = (y + 0.5) / 6.4, dz = (z - 5.5) / 6.9; return dy * dy + dz * dz <= 1; };
function head(o) {
  const v = new Vox(), c = o.hijab, cS = c + 'S';
  for (let z = 0; z <= 14; z++) { const [a, b, cc, d, r] = skull(z); v.rrect(z, a, b, cc, d, 'euSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'euSkin'); v.set(7, -1, 5, 'euSkinS');
  const h = new Vox();   // bergo sederhana tanpa pet
  for (let z = 1; z <= 14; z++) h.rrect(z, -8, -8, 7, 7, c, z <= 11 ? 4 : 5);
  h.rrect(15, -7, -7, 6, 6, c, 4); h.rrect(16, -5, -5, 4, 4, c, 3);
  for (let z = -6; z <= 0; z++) h.rrect(z, -7, -8, 7, 7, c, 4);
  h.each((x, y, z, k) => { if (v.has(x, y, z)) return; if (x >= 3 && z >= 0 && open(y, z)) return; v.set(x, y, z, k); });
  for (let z = 0; z <= 13; z++) for (let y = -9; y <= 8; y++) { const x = v.front(y, z); if (x !== null && x >= 6 && v.get(x, y, z) === c && open(y + (y < 0 ? 1 : -1), z)) v.set(x, y, z, cS); }
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
const skirt = o => o.top === 'jualan' ? ['kainEu', 'kainEuS', 'kainEuK'] : ['gamEu', 'gamEuS', null];
const sk = (o, v) => { const [c, cS, cK] = skirt(o); return cK ? batik(v, c, cS, cK) : v; };
const topC = o => o.top === 'jualan' ? 'blusEu' : 'gamEu';
function chest(o) {
  const v = new Vox(), c = topC(o);
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, bel = z >= 33 && z <= 46 ? Math.round(1.5 * Math.sin((z - 32) / 14 * Math.PI)) : 0; v.rrect(z, -5, -7 + t, 4 + bel - t, 6 - t, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, o.hijab, 1);
  if (o.top === 'jualan') {   // celemek batik merah dengan tali di leher & saku uang
    for (let z = 32; z <= 44; z++) for (let y = -5; y <= 4; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'celEu'); }
    batik(v, 'celEu', 'celEuS', 'celEuK');
  } else for (let z = 33; z <= 50; z++) v.pf(-1, z, 'gamEuS');
  drape(v, o.hijab, o.hijab + 'S');
  return v;
}
function pelvis(o) {
  const [c, cS] = skirt(o), v = sk(o, skirtPelvis(c, cS, 20));
  if (o.top === 'jualan') {   // blus menutup pinggul + celemek batik sampai lutut
    for (let z = 28; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 28 ? 'blusEuS' : 'blusEu', 3);
    for (let z = 20; z <= 33; z++) for (let y = -5; y <= 4; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'celEu'); }
    batik(v, 'celEu', 'celEuS', 'celEuK');
  }
  return v;
}
function arm(o) { const v = new Vox(), c = topC(o); v.rbox(-2, 6, 40, 2, 10, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2); return v; }
function fore(o, side) {
  const v = new Vox(), c = topC(o);
  v.rbox(-2, 6, 31, 2, 10, 39, c, 2); v.paint(-2, 6, 31, 2, 10, 31, c + 'S');   // lengan panjang
  v.rbox(-2, 6, 27, 3, 10, 30, 'euSkin', 2); v.rrect(26, -1, 7, 2, 9, 'euSkin', 1);
  if (side > 0 && o.top === 'jualan') {   // pincuk daun pisang berisi pecel (sayur hijau, siraman bumbu kacang, rempeyek)
    v.rbox(2, 3, 25, 10, 13, 25, 'pincuk', 3); v.shell(26, 2, 3, 10, 13, 'pincuk', 3);
    v.rbox(3, 4, 26, 9, 12, 27, 'pecelH', 3); v.rbox(4, 5, 28, 8, 11, 28, 'pecel', 2); v.set(6, 7, 29, 'pecel'); v.set(5, 9, 29, 'pecelS'); v.set(7, 6, 29, 'pecelS');
  }
  return v;
}
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 6, 7, 0, 'jepitE', 2); v.rbox(-3, 2, 1, 5, 6, 2, 'euSkin', 2); v.rbox(-3, 2, 3, 2, 6, 4, 'euSkin', 2);
  for (const [x, y] of [[4, 4], [3, 3], [3, 5], [2, 2], [2, 6]]) v.set(x, y, 2, 'jepitE');
  return v;
}

export const OUTFITS = {
  jualan: { name: 'Jualan pecel: kerudung pink + blus toska + celemek batik merah + kain batik + pincuk pecel', top: 'jualan', hijab: 'euKer' },
  minggu: { name: 'Hari Minggu: kerudung krem + gamis kuning', top: 'minggu', hijab: 'euKer2' },
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
  ], { neck: o.hijab, shoulder: sl, elbow: sl, hip: c, knee: c }, SKEL, TAIL);
  P.skirt = skirtInfo(P, c, cS);
  return P;
}
