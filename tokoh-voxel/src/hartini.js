// Bu Hartini: guru senior PKn yang memegang jalur legal Bab 13, 50-an, tegas tapi keibuan. Rambut disanggul rendah
// dengan tusuk konde, uban di pelipis, kebaya kerja krem-cokelat dengan bros, kain batik panjang, kacamata dengan rantai
// emas, selop. Rangka keluarga Nadia (skala 1.26), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8.5, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.95 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  htSkin: ['#ae7a54', '#c8906a', '#d9a07a', '#e6b28e'], htSkinS: ['#c08862'], htBlush: ['#d8907a'],
  htHair: ['#140e0c', '#1c1410', '#261c16', '#34281e'], htUban: ['#a8a29a'], htTusuk: ['#c89a3a'],
  kebaya: ['#b8925a', '#cca46a', '#dcb87c', '#e8cc94'], kebayaS: ['#9a7644'], bros: ['#e8c050'], kutubaru: ['#6a3a1a', '#7a4422', '#8c522c', '#a06438'],
  kainH: ['#3a2210', '#4a2c16', '#5a361c', '#6e4424'], kainHS: ['#1e1208'], kainHK: ['#d8b060'],
  korpri: ['#2a4a8a', '#32569c', '#3a64ae', '#4a76c0'], korpriS: ['#1a2e5a'], korpriK: ['#f0e0a0'], rokH: ['#16161a', '#1e1e24', '#28282e', '#36363e'], rokHS: ['#0c0c10'],
  blazerH: ['#1a2440', '#222e50', '#2a3a62', '#384a78'], blazerHS: ['#121a30'], blusH: ['#e6e0d4', '#f0ece2', '#f8f6ee', '#ffffff'],
  selopH: ['#1a1210', '#241814', '#30201a', '#422e24'], kacaHt: ['#4a3a2a'], rantaiHt: ['#d8b048'],
});

/* ---------- wajah: alis rapi melengkung, mata teduh berkerut di ujung, senyum tipis tepat di bawah hidung, garis senyum */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'htSkinS', r: 'htBlush' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, ...brow, ...eyes, F0, F0, '..s........s..', ...mouth, F0, F0];   // alis z 11..10, mata z 9..8, mulut z 4
const BROW = ['..BBB....BBB..', '.B..........B.'];
const EYE = ['s.KKK....KKK.s', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0, F0]),
  kedip: F(BROW, [F0, '.sKKK....KKKs.'], ['.....mmmm.....', F0, F0]),
  marah: F(['...BBB..BBB...', F0], ['..KKK....KKK..', '..WKK....KKW..'], ['....mmmmmm....', F0, F0]),   // "Nak, duduk."
  teriak: F(['...BBB..BBB...', F0], ['..KKK....KKK..', '..WKK....KKW..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['....m....m....', '.....mmmm.....', F0]),
  ketawa: F(BROW, ['s.KK......KK.s', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', F0]),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'htSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'htSkin'); v.set(7, -1, 4, 'htSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'htSkin'); v.box(-1, y, 6, -1, y, 7, 'htSkinS'); }
  v.set(-1, 8, 5, 'bros'); v.set(-1, -9, 5, 'bros');   // anting emas kecil
  // rambut disisir rapi ke belakang (belah tengah tipis), telinga separuh tertutup, uban di pelipis
  const hair = new Vox();
  for (let z = 5; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'htHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -6, -6, 5, 5, 'htHair', 4);
  const zmin = (x, y) => x >= 5 ? (Math.abs(y + 0.5) > 4.5 ? 12 : 14) : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 8 : 5;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  v.each((x, y, z, c) => { if (c === 'htHair' && (z === 10 || z === 12) && Math.abs(y + 0.5) > 6.5 && x >= -2) v.set(x, y, z, 'htUban'); });   // dua garis uban di pelipis
  // sanggul rendah bulat di belakang kepala + tusuk konde emas menyilang
  for (let x = -14; x <= -7; x++) for (let y = -5; y <= 4; y++) for (let z = 2; z <= 10; z++) { const d = ((x + 10.5) / 3.6) ** 2 + ((y + 0.5) / 4.6) ** 2 + ((z - 6) / 4.2) ** 2; if (d <= 1 && !v.has(x, y, z)) v.set(x, y, z, 'htHair'); }
  for (let k = -3; k <= 4; k++) v.set(-11, k, 8 - Math.round(k * 0.5), 'htTusuk');
  // kacamata bingkai tipis cokelat + rantai emas dari gagang menjuntai ke belakang leher
  const fx = v.front(-1, 8) + 1;
  for (const y0 of [-6, 1]) for (let y = y0; y <= y0 + 4; y++) for (let z = 7; z <= 10; z++) if (y === y0 || y === y0 + 4 || z === 7 || z === 10) v.set(fx, y, z, 'kacaHt');
  for (const y of [-1, 0]) v.set(fx, y, 9, 'kacaHt');
  for (const y of [-7, 6]) v.set(fx, y, 10, 'kacaHt');
  for (const y of [-8, 7]) for (let x = fx - 1; x >= 0; x--) if (!v.has(x, y, 10)) v.set(x, y, 10, 'kacaHt');
  for (const s of [-1, 1]) for (let k = 0; k <= 9; k++) { const y = s > 0 ? 8 : -9, x = -Math.round(k * 0.7), z = 9 - k; if (!v.has(x, y, z)) v.set(x, y, z, 'rantaiHt'); }
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
const pat = (v, c, cS, cK) => {   // motif kain: kisi miring (parang) + titik
  v.each((x, y, z, k) => {
    if (k !== c) return;
    const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + z) % 6 + 6) % 6;
    if (a === 0) v.set(x, y, z, cS); else if (a === 3 && ((u - z) % 2 + 2) % 2 === 0) v.set(x, y, z, cK);
  });
  return v;
};
const skirt = o => ({ kebaya: ['kainH', 'kainHS', 'kainHK'], korpri: ['rokH', 'rokHS', null], rapat: ['rokH', 'rokHS', null] }[o.top]);
const sk = (o, v) => { const [c, cS, cK] = skirt(o); return cK ? pat(v, c, cS, cK) : v; };
const topC = o => ({ kebaya: 'kebaya', korpri: 'korpri', rapat: 'blazerH' }[o.top]);
function chest(o) {
  const v = new Vox(), T = o.top, c = topC(o);
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -5, -7 + t + w, 4 + (z >= 40 && z <= 47 ? 1 : 0) - t, 6 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'htSkin', 1);
  if (T === 'kebaya') {   // kebaya kutubaru: panel cokelat di tengah dada, tiga bros emas, leher V, garis renda di tepi
    for (let z = 33; z <= 50; z++) for (let y = -2; y <= 1; y++) v.pf(y, z, 'kutubaru');
    for (let z = 47; z <= 51; z++) for (let y = -3; y <= 2; y++) if (Math.abs(y + 0.5) <= (z - 46) * 0.6) v.pf(y, z, 'htSkin');
    for (const z of [45, 41, 37]) { v.pf(-1, z, 'bros'); v.pf(0, z, 'bros'); }
    for (let z = 33; z <= 50; z++) for (const y of [-3, 2]) v.pf(y, z, 'kebayaS');
    return v;
  }
  if (T === 'korpri') {   // batik Korpri biru: motif pohon & gedung disederhanakan jadi kisi titik krem, kerah
    v.each((x, y, z, k) => { if (k !== 'korpri') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x; if ((u + 40) % 4 === 0 && z % 4 === 0) v.set(x, y, z, 'korpriK'); else if ((u + z + 40) % 8 === 0) v.set(x, y, z, 'korpriS'); });
    for (let z = 33; z <= 50; z++) v.pf(0, z, 'korpriS');
    for (let z = 52; z <= 53; z++) v.shell(z, -3, -4, 3, 3, 'korpri', 2);
    v.pfBox(-5, 46, -4, 47, 'bros');   // pin Korpri
    return v;
  }
  // rapat: blazer biru tua di atas blus putih, kerah blus, bros
  for (let z = 40; z <= 51; z++) { const hw = Math.round((z - 40) * 0.3); for (let y = -1 - hw; y <= hw; y++) v.pf(y, z, 'blusH'); }
  for (let z = 32; z <= 39; z++) v.pf(-1, z, 'blazerHS');
  for (const z of [38, 35]) v.pf(0, z, 'bros');
  v.pf(-5, 46, 'bros'); v.pf(-4, 47, 'bros');
  for (let z = 52; z <= 53; z++) v.shell(z, -3, -4, 3, 3, 'blusH', 2);
  return v;
}
function pelvis(o) {
  const [c, cS] = skirt(o), v = sk(o, skirtPelvis(c, cS, 20));
  if (o.top === 'kebaya') for (let z = 27; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 27 ? 'kebayaS' : 'kebaya', 3);   // ujung kebaya menutup pinggul
  if (o.top === 'rapat') for (let z = 29; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 29 ? 'blazerHS' : 'blazerH', 3);
  return v;
}
const sleeveC = o => topC(o);
function arm(o) { const v = new Vox(), c = sleeveC(o); v.rbox(-2, 6, 40, 2, 10, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2); return v; }
function fore(o, side) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-2, 6, 31, 2, 10, 39, c, 2);
  if (o.top === 'kebaya') v.paint(-2, 6, 31, 2, 10, 31, 'kebayaS');
  v.rbox(-2, 6, 27, 3, 10, 30, 'htSkin', 2); v.rrect(26, -1, 7, 2, 9, 'htSkin', 1);
  if (side < 0) v.paint(-2, 6, 30, 2, 10, 30, 'rantaiHt');   // jam emas kecil
  if (side > 0 && o.top === 'rapat') {   // map dokumen hijau dijepit di tangan kanan
    v.rbox(-4, 5, 18, 4, 6, 30, 'korpriS', 0); v.paint(4, 5, 19, 4, 6, 29, 'blusH');
  }
  return v;
}
function foot() {   // selop hitam tertutup, tumit rendah
  const v = new Vox();
  v.rbox(-4, 1, 0, 6, 6, 0, 'sole', 2); v.rbox(-4, 1, 1, 6, 6, 3, 'selopH', 2); v.rbox(-3, 2, 4, 1, 5, 4, 'selopH', 2);
  return v;
}

export const OUTFITS = {
  kebaya: { name: 'Mengajar: kebaya kutubaru krem + kain batik + kacamata rantai', top: 'kebaya' },
  korpri: { name: 'Senin: batik Korpri biru + rok hitam panjang', top: 'korpri' },
  rapat: { name: 'Rapat & sidang Bab 13: blazer biru tua + blus putih + map', top: 'rapat' },
};
export function build(opt = {}) {
  // game memanggil 'seragam': Bu Hartini memakai kebaya
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.kebaya), expr: opt.expr || 'biasa', face: opt.face };
  const [c, cS] = skirt(o), A = arm(o), Th = sk(o, skirtThigh(c)), Sn = sk(o, skirtShin(c, cS)), Ft = foot(o), sl = sleeveC(o);
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
  ], { neck: 'htSkin', shoulder: sl, elbow: sl, hip: c, knee: c }, SKEL, TAIL);
  P.skirt = skirtInfo(P, c, cS);
  return P;
}
