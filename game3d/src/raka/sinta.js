// Bu Sinta: guru Bahasa Indonesia pembina mading & lomba menulis, 30-an, lembut dan puitis. Hijab segi empat pastel
// persik dengan bros bunga, kardigan rajut krem di atas blus, rok panjang cokelat susu, flat shoes, buku novel dijepit
// di tangan kiri. Rangka keluarga Nadia (skala 1.24), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  siSkin: ['#c8946c', '#e0ac86', '#e8b48c', '#f4c8a4'], siSkinS: ['#d8a27c'], siBlush: ['#f0a090'],
  hijabSi: ['#c87a62', '#dc9078', '#eca890', '#f8c4ae'], hijabSiS: ['#c07058'], brosSi: ['#f4f0e8'], brosSiC: ['#e8b840'],
  hijabSiL: ['#7a6a9a', '#8e7eae', '#a494c2', '#bcaed6'], hijabSiLS: ['#6a5a8a'], hijabSiM: ['#4a7a6a', '#5a8c7a', '#6c9e8c', '#84b4a2'], hijabSiMS: ['#3a6a5a'],
  kardiS: ['#c4b494', '#d4c4a4', '#e2d4b6', '#eee2c8'], kardiSS: ['#b0a080'], blusSi: ['#e8a890', '#f0b8a0', '#f6c8b2', '#fcdac8'],
  rokSi: ['#7a5a40', '#8c6a4c', '#a07c5a', '#b48e6a'], rokSiS: ['#5e4430'], gamisSi: ['#8e7eae', '#a090c0', '#b2a4d0', '#c6badf'], gamisSiS: ['#76669a'],
  batikSi: ['#2a4a6a', '#32587c', '#3c668e', '#4a78a2'], batikSiS: ['#1a2e44'], batikSiK: ['#f0d8a0'],
  flatSi: ['#6a4430', '#7e5238', '#925e42', '#a6704e'], novel: ['#2a6a5a', '#327a68', '#3a8c78', '#4aa08a'], novelK: ['#f4ecd8'],
});

/* ---------- wajah: alis tipis melengkung lembut, mata besar teduh berbulu mata, senyum kecil manis tepat di bawah hidung */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'siBlush', s: 'siSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mata z 9..8, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['.KKKK....KKKK.', '..WKK....KKW..'];
const BL = '.rr........rr.';
export const FACES = {
  biasa: F(BROW, EYE, ['....m....m....', '.....mmmm.....', BL]),
  kedip: F(BROW, [F0, '.KKKK....KKKK.'], ['....m....m....', '.....mmmm.....', BL]),
  marah: F('...BB....BB...', ['..KKK....KKK..', '..WKK....KKW..'], ['.....mmmm.....', F0, F0]),
  teriak: F('.BB........BB.', ['..KKK....KKK..', '..KWK....KWK..'], ['.....mmmm.....', '.....mttm.....', '......mm......']),
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....', BL]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', BL]),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['.....mmmm.....', '.....TTTT.....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const open = (y, z) => { const dy = (y + 0.5) / 6.4, dz = (z - 5.5) / 6.9; return dy * dy + dz * dz <= 1; };   // bukaan wajah sampai baris alis
const hijabC = o => ({ kardigan: 'hijabSi', gamis: 'hijabSiL', batik: 'hijabSiM' }[o.top]);
function head(o) {
  const v = new Vox(), c = hijabC(o), cS = c + 'S';
  for (let z = 0; z <= 14; z++) { const [a, b, cc, d, r] = skull(z); v.rrect(z, a, b, cc, d, 'siSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'siSkin'); v.set(7, -1, 4, 'siSkinS');
  // hijab segi empat: lapisan kain di luar kepala, kubah sedikit tinggi, membungkus leher di bawah dagu
  const h = new Vox();
  for (let z = 2; z <= 14; z++) h.rrect(z, -8, -8, 7, 7, c, z <= 11 ? 4 : 5);
  h.rrect(15, -7, -7, 6, 6, c, 4); h.rrect(16, -4, -4, 3, 3, c, 2);
  for (let z = -4; z <= 1; z++) h.rrect(z, -6, -7, 6, 6, c, 4);
  h.each((x, y, z, k) => { if (v.has(x, y, z)) return; if (x >= 3 && z >= 0 && open(y, z)) return; v.set(x, y, z, k); });
  for (let y = -5; y <= 4; y++) { const x = v.front(y, 13); if (x !== null && v.get(x, y, 13) === c) v.set(x, y, 13, cS); }   // lipatan dahi
  // bros bunga putih di sisi kiri dagu
  const bx = (v.front(-5, 0) ?? 6);
  for (const [y, z] of [[-5, 0], [-6, 0], [-4, 0], [-5, 1], [-5, -1]]) v.set(bx + 1, y, z, y === -5 && z === 0 ? 'brosSiC' : 'brosSi');
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function drape(v, c, cS) {   // kain hijab jatuh menutup bahu & dada, ujung depan meruncing
  for (let z = 44; z <= 55; z++) {
    const k = Math.min(3, Math.floor((56 - z) / 2.2)), x0 = -5 - (k > 1 ? 1 : 0), x1 = 4 + k, y0 = -6 - k, y1 = 5 + k;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const inner = x > x0 && x < x1 && y > y0 && y < y1;
      if (inner && v.has(x, y, z)) continue;
      if (z <= 47 && x < 2 && Math.abs(y + 0.5) < 6) continue;
      if (z <= 46 && Math.abs(y + 0.5) > 4.5 - (46 - z)) continue;
      if (!inner || !v.has(x, y, z)) v.set(x, y, z, c);
    }
  }
  for (let z = 44; z <= 52; z++) { const x = v.front(-1, z); if (x !== null && v.get(x, -1, z) === c) v.set(x, -1, z, cS); }
}
const skirtC = o => ({ kardigan: ['rokSi', 'rokSiS'], gamis: ['gamisSi', 'gamisSiS'], batik: ['rokSi', 'rokSiS'] }[o.top]);
const topC = o => ({ kardigan: 'kardiS', gamis: 'gamisSi', batik: 'batikSi' }[o.top]);
const batik = v => { v.each((x, y, z, k) => { if (k !== 'batikSi') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + 40) % 5), b = ((z + 40) % 5); if (a === 2 && b === 2) v.set(x, y, z, 'batikSiK'); else if (Math.abs(a - 2) + Math.abs(b - 2) === 2 && (a + b) % 2 === 0) v.set(x, y, z, 'batikSiS'); }); return v; };
function chest(o) {
  const v = new Vox(), T = o.top, c = topC(o);
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -4, -6 + t + w, 4 - t, 5 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, hijabC(o), 1);
  if (T === 'kardigan') {   // kardigan rajut terbuka di depan, blus persik di tengah, rusuk rajut
    for (let z = 32; z <= 50; z++) for (let y = -2; y <= 1; y++) v.pf(y, z, 'blusSi');
    for (let z = 32; z <= 50; z++) for (const y of [-3, 2]) v.pf(y, z, 'kardiSS');
    v.each((x, y, z, k) => { if (k === 'kardiS' && (y + 40) % 3 === 0 && z % 2) v.set(x, y, z, 'kardiSS'); });
    for (let y = -6; y <= 5; y++) { v.pf(y, 32, 'kardiSS'); v.pb(y, 32, 'kardiSS'); }
  } else if (T === 'gamis') for (let z = 34; z <= 43; z++) v.pf(0, z, 'gamisSiS');
  else { batik(v); for (let z = 32; z <= 43; z++) v.pf(0, z, 'batikSiS'); }
  drape(v, hijabC(o), hijabC(o) + 'S');
  return v;
}
function pelvis(o) {
  const [c, cS] = skirtC(o), v = skirtPelvis(c, cS, 20);
  if (o.top === 'kardigan') for (let z = 27; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 27 ? 'kardiSS' : 'kardiS', 3);   // kardigan panjang menutup pinggul
  if (o.top === 'batik') for (let z = 28; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'batikSi', 3);
  return o.top === 'batik' ? batik(v) : v;
}
const sleeveC = o => topC(o);
function arm(o) { const v = new Vox(), c = sleeveC(o); v.rbox(-2, 6, 40, 2, 10, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2); return o.top === 'batik' ? batik(v) : v; }
function fore(o, side) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-2, 6, 31, 2, 10, 39, c, 2);
  v.paint(-2, 6, 31, 2, 10, 32, o.top === 'kardigan' ? 'kardiSS' : o.top === 'gamis' ? 'gamisSiS' : 'batikSiS');
  if (o.top === 'batik') batik(v);
  v.rbox(-2, 6, 27, 3, 10, 30, 'siSkin', 2); v.rrect(26, -1, 7, 2, 9, 'siSkin', 1);
  if (side < 0) {   // novel hijau dipeluk/dijepit di tangan kiri, halaman krem kelihatan di sisi
    v.rbox(-4, 4, 21, 4, 6, 31, 'novel', 0); v.paint(-4, 5, 22, 3, 5, 30, 'novelK'); v.paint(-4, 4, 21, 4, 4, 31, 'novel');
  }
  return v;
}
function foot() {   // flat shoes cokelat dengan pita kecil
  const v = new Vox();
  v.rbox(-4, 1, 0, 6, 6, 0, 'sole', 2); v.rbox(-4, 1, 1, 6, 6, 2, 'flatSi', 2); v.rbox(-3, 2, 3, 1, 5, 3, 'flatSi', 2);
  v.set(5, 3, 3, 'brosSi'); v.set(5, 4, 3, 'brosSi');
  return v;
}

export const OUTFITS = {
  kardigan: { name: 'Mengajar: hijab persik + kardigan rajut krem + rok cokelat + novel', top: 'kardigan' },
  gamis: { name: 'Gamis ungu lembut + hijab ungu', top: 'gamis' },
  batik: { name: 'Jumat: batik biru motif kawung + hijab hijau mint', top: 'batik' },
};
export function build(opt = {}) {
  // game memanggil 'seragam': Bu Sinta memakai kardigan
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.kardigan), expr: opt.expr || 'biasa', face: opt.face };
  const [c, cS] = skirtC(o), A = arm(o), Th = skirtThigh(c), Sn = skirtShin(c, cS), Ft = foot(o), sl = sleeveC(o);
  const panel = s => skirtPanel(c, cS, s, 5);
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: hijabC(o), shoulder: sl, elbow: sl, hip: c, knee: c }, SKEL, TAIL);
  P.skirt = skirtInfo(P, c, cS);
  return P;
}
