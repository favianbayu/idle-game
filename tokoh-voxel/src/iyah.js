// Mak Iyah: pemilik warung belakang SMA 3, 60 tahun, galak soal utang gorengan tapi suka ngasih bonus. Pendek gempal,
// kain batik diikat di kepala (simpul di tengkuk), daster bunga, celemek bernoda minyak, sutil di tangan, sandal jepit.
// Rangka keluarga Nadia/Bu Narti (skala 1.2), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12, thigh: 12.5, up: 4, neck: 21, shY: 8.5, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.95 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  iySkin: ['#8e5c38', '#a46c46', '#b8805a', '#c8926a'], iySkinS: ['#9a6640'], iyBlush: ['#c47a62'], iyHair: ['#8a867e', '#a29e96', '#b6b2aa', '#c8c4bc'],
  iyIkat: ['#2a4a7a', '#32568c', '#3c649e', '#4a74b0'], ikatS: ['#1a2e50'], ikatK: ['#e8c870'],
  dasIy: ['#3a6a8a', '#447a9c', '#4e8aae', '#5e9cc0'], dasIyS: ['#2a5070'], dasIyK: ['#f2e2a0'],
  iyCelemek: ['#d8ccb0', '#e4d8bc', '#eee4ca', '#f6eed8'], celemekS: ['#c8b890'], noda: ['#b8945a'],
  sutil: ['#9a9aa2', '#b0b0b8', '#c4c4cc', '#d8d8de'], sutilG: ['#5a3a1e'], jepitI: ['#c83a3a', '#d84646', '#e85454', '#f06a6a'],
  kebIy: ['#7a2a3a', '#8a3446', '#9c3e52', '#ae4e62'], kebIyS: ['#5a1a28'], sarIy: ['#4a2a14', '#5a341a', '#6c4022', '#7e4e2c'], sarIyS: ['#2a1608'], sarIyK: ['#d8a84a'],
  tasIy: ['#b89a5a', '#ccae6a', '#dcc07c', '#ead292'], tasIyS: ['#8a6a3a'], sayur: ['#3a8a3a', '#469a46', '#52aa52', '#62bc62'],
  mukena: ['#d8d4cc', '#e6e2da', '#f0ece6', '#faf8f4'], mukenaS: ['#c4beb4'], gamIy: ['#3a2a4a', '#46345a', '#523e6a', '#62507c'], gamIyS: ['#2a1e36'],
  tasbih: ['#6a3a1a'],
});

/* ---------- wajah: alis tebal galak, mata tajam tapi ada garis tawa, pipi tembam, bibir tipis (suka ngomel) */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'iyBlush', s: 'iySkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mulut z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['s.KKK....KKK.s', '..WKK....KKW..'];
const CHEEK = 'rr..........rr';
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0, CHEEK]),
  kedip: F(BROW, [F0, '.sKKK....KKKs.'], ['.....mmmm.....', F0, CHEEK]),
  marah: F('..BBB....BBB..', ['..KKK....KKK..', '..WKK....KKW..'], ['....mmmmmm....', '....m....m....', F0]),   // "Utangmu udah dua puluh ribu!"
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', CHEEK]),
  ketawa: F(BROW, ['s.KK......KK.s', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', 'rr...mmmm...rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z === 2 ? [-6, -7, 6, 6, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const batik = (v, c, cS, cK) => {   // kawung sederhana: kisi lingkaran kecil, titik emas di tengah
  v.each((x, y, z, k) => {
    if (k !== c) return;
    const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + 40) % 6), b = ((z + 40) % 6);
    if ((a === 0 && b !== 3) || (b === 0 && a !== 3)) v.set(x, y, z, cS); else if (a === 3 && b === 3) v.set(x, y, z, cK);
  });
  return v;
};
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'iySkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'iySkin'); v.box(8, -1, 5, 8, 0, 5, 'iySkin'); v.set(7, -1, 5, 'iySkinS');   // hidung bulat
  if (o.head === 'iyIkat') {
    for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'iySkin'); v.box(-1, y, 6, -1, y, 7, 'iySkinS'); }
    // rambut beruban disisir ke belakang, kelihatan sedikit di pelipis & tengkuk
    const hair = new Vox();
    for (let z = 4; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'iyHair', 4);
    hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 13 : 9)) v.set(x, y, z, c); });
    // kain batik diikat menutup kepala dari dahi (z 13) ke belakang, simpul + dua ujung kain di tengkuk
    for (let z = 10; z <= 17; z++) { const r = z <= 15 ? 0 : z - 15; for (let x = -9 + r; x <= 8 - r; x++) for (let y = -9 + r; y <= 8 - r; y++) {
      const d = ((x + 0.5) / (8.9 - r)) ** 2 + ((y + 0.5) / (8.9 - r)) ** 2, zf = Math.abs(y + 0.5) > 6 ? 10 : x >= 3 ? 13 : x >= -2 ? 13 - Math.round((3 - x) * 0.6) : 10;
      if (d <= 1 && (d > 0.62 || z >= 16) && z >= zf) v.set(x, y, z, 'iyIkat');
    } }
    v.each((x, y, z, c) => { if (c === 'iyHair' && z >= 10 && ((x + 0.5) / 8.9) ** 2 + ((y + 0.5) / 8.9) ** 2 > 0.6) v.set(x, y, z, null); });
    v.rbox(-12, -2, 8, -10, 1, 11, 'ikatS', 1);
    for (const y of [-3, 2]) for (let z = 1; z <= 8; z++) for (let w = 0; w <= 1; w++) v.set(-11 + Math.round((8 - z) * 0.15), y + (y < 0 ? -w : w) * Math.round((8 - z) * 0.2), z, 'iyIkat');
    batik(v, 'iyIkat', 'ikatS', 'ikatK');
    for (let y = -6; y <= 5; y++) { const x = v.front(y, 13); if (x !== null && v.get(x, y, 13) === 'iyIkat') v.set(x, y, 13, 'ikatS'); }   // lipatan tepi dahi
    return v;
  }
  // mukena / kerudung putih membulat (pengajian & pasar), bukaan wajah sampai alis (z 11)
  const c = o.head, cS = c + 'S', open = (y, z) => { const dy = (y + 0.5) / 6.4, dz = (z - 5.5) / 6.9; return dy * dy + dz * dz <= 1; };
  const h = new Vox();
  for (let z = 1; z <= 14; z++) h.rrect(z, -8, -8, 7, 7, c, z <= 11 ? 4 : 5);
  h.rrect(15, -7, -7, 6, 6, c, 4); h.rrect(16, -5, -5, 4, 4, c, 3);
  for (let z = -6; z <= 0; z++) h.rrect(z, -7, -8, 7, 7, c, 4);
  h.each((x, y, z, k) => { if (v.has(x, y, z)) return; if (x >= 3 && z >= 0 && open(y, z)) return; v.set(x, y, z, k); });
  for (let z = 0; z <= 12; z++) for (let y = -9; y <= 8; y++) { const x = v.front(y, z); if (x !== null && x >= 6 && v.get(x, y, z) === c && open(y + (y < 0 ? 1 : -1), z)) v.set(x, y, z, cS); }
  return v;
}

/* ---------- badan pendek gempal (sisi +y; sisi -y = cermin) */
const dress = o => ({ warung: ['dasIy', 'dasIyS', 'dasIyK'], pasar: ['sarIy', 'sarIyS', 'sarIyK'], ngaji: ['gamIy', 'gamIyS', null] }[o.top]);
const topC = o => ({ warung: 'dasIy', pasar: 'kebIy', ngaji: 'gamIy' }[o.top]);
const flower = (v, c, cS, cK) => {   // daster: bunga kecil 5 voxel tersebar
  v.each((x, y, z, k) => {
    if (k !== c) return;
    const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, su = (u + 40 + (Math.floor((z + 40) / 6) % 2) * 3) % 6, sz = (z + 40) % 6;
    if (su === 2 && sz === 2) v.set(x, y, z, cK); else if (Math.abs(su - 2) + Math.abs(sz - 2) === 1) v.set(x, y, z, cS);
  });
  return v;
};
const pat = (o, v) => { const [c, cS, cK] = dress(o); if (o.top === 'warung') return flower(v, c, cS, cK); return cK ? batik(v, c, cS, cK) : v; };
function apron(v, z0, z1, w) {   // celemek putih-krem dengan noda minyak, tali di leher
  for (let z = z0; z <= z1; z++) for (let y = -w - 1; y <= w; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, (y === -w - 1 || y === w) ? 'celemekS' : 'iyCelemek'); }
  for (const [y, z] of [[-3, z0 + 3], [2, z0 + 6], [-1, z0 + 2], [3, z1 - 4]]) { const x = v.front(y, z); if (x !== null && z >= z0 && z <= z1) v.set(x, y, z, 'noda'); }
}
function chest(o) {
  const v = new Vox(), c = topC(o);
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, bel = z >= 33 && z <= 46 ? Math.round(2.5 * Math.sin((z - 32) / 14 * Math.PI)) : 0; v.rrect(z, -5, -8 + t, 5 + bel - t, 7 - t, c, 4); }
  v.rbox(-2, -2, 52, 2, 1, 55, o.head === 'iyIkat' ? 'iySkin' : o.head, 1);
  if (o.top === 'warung') {
    flower(v, 'dasIy', 'dasIyS', 'dasIyK');
    for (let y = -3; y <= 2; y++) v.pf(y, 51, 'iySkin');
    apron(v, 32, 44, 4);
    for (let z = 45; z <= 51; z++) for (const y of [-4, 3]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'celemekS'); }
    for (let z = 36; z <= 40; z++) for (let y = 0; y <= 3; y++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, z === 40 ? 'celemekS' : 'iyCelemek'); }   // saku celemek
    return v;
  }
  if (o.top === 'pasar') {   // kebaya encim marun berkancing peniti, selendang batik di bahu kiri
    for (let z = 34; z <= 50; z++) v.pf(-1, z, 'kebIyS');
    for (let z = 47; z <= 51; z++) for (let y = -3; y <= 2; y++) if (Math.abs(y + 0.5) <= (z - 46) * 0.6) v.pf(y, z, 'iySkin');
    for (const z of [44, 40, 36]) v.pf(-1, z, 'sutil');
    for (let z = 34; z <= 51; z++) { const y = Math.round(-8 + (z - 34) * 0.45); for (let dy = 0; dy <= 2; dy++) { const yy = y + dy; const xf = v.front(yy, z); if (xf !== null) v.set(xf + 1, yy, z, 'sarIy'); } }
    batik(v, 'sarIy', 'sarIyS', 'sarIyK');
    return v;
  }
  for (let z = 34; z <= 50; z++) v.pf(-1, z, 'gamIyS');   // ngaji: gamis ungu tua, kerudung putih menjuntai
  for (let z = 43; z <= 52; z++) { const k = Math.min(3, Math.floor((53 - z) / 2.5)); for (let y = -8 - k; y <= 7 + k; y++) for (let x = -6 - (k > 1 ? 1 : 0); x <= 6 + k; x++) { if (z <= 46 && x < 2 && Math.abs(y + 0.5) < 7) continue; if (!v.has(x, y, z) || x === 6 + k || Math.abs(y + 0.5) >= 7.5 + k - 0.5) if (Math.abs(y + 0.5) <= 7.5 + k) v.set(x, y, z, z === 43 ? 'mukenaS' : 'mukena'); } }
  return v;
}
function pelvis(o) {
  const [c, cS] = dress(o), v = skirtPelvis(c, cS, 20);
  for (let z = 26; z <= 33; z++) v.shell(z, -6, -8, 6, 7, z === 33 ? cS : c, 4);   // pinggul lebar
  if (o.top === 'pasar') for (let z = 26; z <= 33; z++) v.shell(z, -7, -9, 7, 8, z === 26 ? 'kebIyS' : 'kebIy', 4);   // ujung kebaya
  pat(o, v);
  if (o.top === 'warung') apron(v, 18, 33, 4);
  return v;
}
const sleeveC = o => topC(o);
function arm(o) { const v = new Vox(), c = sleeveC(o); v.rbox(-3, 5, 40, 3, 11, 50, c, 3); v.rrect(51, -3, 5, 3, 11, c, 3); if (o.top === 'warung') flower(v, 'dasIy', 'dasIyS', 'dasIyK'); return v; }
function fore(o, side) {
  const v = new Vox(), L = o.top !== 'warung';
  v.rbox(-3, 5, 31, 3, 11, 39, L ? sleeveC(o) : 'iySkin', 3);
  if (o.top === 'warung') v.rbox(-3, 5, 37, 3, 11, 39, 'dasIy', 3);   // lengan daster sampai bawah siku
  v.rbox(-3, 5, 27, 3, 11, 30, 'iySkin', 3); v.rrect(26, -2, 6, 2, 10, 'iySkin', 2);
  if (side > 0 && o.top === 'warung') {   // sutil penggorengan: gagang kayu di genggaman, daun besi lebar ke bawah depan
    for (let z = 24; z <= 32; z++) v.set(1, 8, z, 'sutilG');
    v.rbox(0, 7, 16, 3, 9, 23, 'sutil', 0); v.paint(0, 7, 16, 3, 9, 16, 'noda');
  }
  if (side < 0 && o.top === 'pasar') {   // tas belanja anyaman, daun bawang & kangkung menyembul
    for (let z = 25; z <= 30; z++) for (const x of [-2, 2]) v.set(x, 8, z, 'tasIyS');
    v.rbox(-4, 5, 13, 4, 11, 24, 'tasIy', 2);
    v.each((x, y, z, c) => { if (c === 'tasIy' && (x + z) % 3 === 0) v.set(x, y, z, 'tasIyS'); });
    for (const [x, y] of [[-2, 7], [0, 8], [2, 9], [1, 6]]) for (let z = 25; z <= 27 + (x & 1) * 2; z++) v.set(x, y, z, 'sayur');
  }
  if (side > 0 && o.top === 'ngaji') for (let k = 0; k <= 7; k++) v.set(2 + (k % 2), 8, 22 + k, 'tasbih');   // tasbih menjuntai
  if (L) pat(o, v);
  return v;
}
function foot(o) {
  const v = new Vox(), s = o.top === 'ngaji' ? 'gamIyS' : 'jepitI';   // sandal jepit merah (ngaji: selop ungu gelap)
  v.rbox(-4, 1, 0, 6, 7, 0, s, 2); v.rbox(-3, 2, 1, 5, 6, 2, 'iySkin', 2); v.rbox(-3, 2, 3, 2, 6, 4, 'iySkin', 2);
  for (const [x, y] of [[4, 4], [3, 3], [3, 5], [2, 2], [2, 6]]) v.set(x, y, 2, s);
  return v;
}

export const OUTFITS = {
  warung: { name: 'Warung: ikat kepala batik + daster bunga + celemek bernoda + sutil + sandal jepit', top: 'warung', head: 'iyIkat' },
  pasar: { name: 'Ke pasar subuh: kerudung putih + kebaya encim marun + selendang + sarung batik + tas anyaman', top: 'pasar', head: 'mukena' },
  ngaji: { name: 'Pengajian: kerudung putih panjang + gamis ungu tua + tasbih', top: 'ngaji', head: 'mukena' },
};
export function build(opt = {}) {
  // game memanggil 'seragam': Mak Iyah memakai baju warung
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.warung), expr: opt.expr || 'biasa', face: opt.face };
  const [c, cS] = dress(o), A = arm(o), Ft = foot(o), sl = sleeveC(o);
  const Th = pat(o, skirtThigh(c)), Sn = pat(o, skirtShin(c, cS));
  const panel = s => { const v = pat(o, skirtPanel(c, cS, s, 5)); if (o.top === 'warung' && s > 0) apron(v, 12, 30, 3); return v; };
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: o.head === 'iyIkat' ? 'iySkin' : o.head, shoulder: sl, elbow: o.top === 'warung' ? 'dasIy' : sl, hip: c, knee: c }, SKEL, TAIL);
  P.skirt = skirtInfo(P, c, cS);
  return P;
}
