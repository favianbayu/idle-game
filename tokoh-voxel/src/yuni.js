// Mbak Yuni: ART di salah satu rumah Perumahan Bukit Asri, 20-an, dari desa di Jawa Tengah, polos dan suka curhat
// ("Majikan saya galak, jangan berisik ya."). Kulit sawo matang, rambut panjang dikuncir kuda rendah + poni samping,
// jepit kupu-kupu. Nyapu: kaus abu + celemek kotak biru + rok batik panjang + sapu lidi + sandal jepit.
// Ke pasar: kardigan cokelat + keranjang belanja anyaman. Rangka keluarga Nadia, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  yuSkin: ['#9a6640', '#ae764c', '#c08658', '#d09866'], yuSkinS: ['#a87048'], yuBlush: ['#d0806a'],
  yuHair: ['#100c0a', '#18120e', '#221a14', '#2e241c'], yuHairT: ['#3a2c20'], yuJepit: ['#e86a9a'], yuIkat: ['#2a6ac0'],
  kausYu: ['#8a8a90', '#9a9aa0', '#aaaab0', '#bcbcc2'], kausYuS: ['#6a6a70'],
  celYu: ['#3a6aa8', '#4a7ab8', '#5a8ac6', '#6e9cd4'], celYuS: ['#e8eef6'],
  rokYu: ['#4a3018', '#5a3a1e', '#6c4624', '#80542c'], rokYuS: ['#2e1c0c'], rokYuK: ['#d8b070'],
  kardiYu: ['#7a5a3a', '#8a6844', '#9a764e', '#ac865a'], kardiYuS: ['#5a402a'], kausYu2: ['#e8e6e0', '#f2f0ea', '#f8f6f2', '#fdfcfa'],
  yuLidi: ['#a88a4a', '#b89a58', '#c8aa68', '#d8ba7a'], yuLidiT: ['#c83a2a'], jepitYu: ['#3a8a5a', '#469a66', '#52aa72', '#62bc82'],
  yuAnyam: ['#a8783a', '#b88844', '#c89850', '#d8a85e'], yuAnyamS: ['#7a5424'], sayurYu: ['#3a8a2a', '#469a34', '#52aa40', '#62bc4e'], cabaiYu: ['#d8281a'], tomatYu: ['#e8482a'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'yuBlush', s: 'yuSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0, F0]),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', F0, F0]),
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....', 'rr..........rr']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', 'rr..........rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),   // dimarahi majikan
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'yuSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'yuSkin'); v.set(7, -1, 5, 'yuSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'yuSkin'); v.box(-1, y, 6, -1, y, 7, 'yuSkinS'); }
  // rambut ditarik ke belakang, poni samping menyapu ke kanan, kuncir kuda rendah di tengkuk sampai punggung
  const hair = new Vox();
  for (let z = 4; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'yuHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -6, -6, 5, 5, 'yuHair', 4);
  const zmin = (x, y) => x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 8 : 4;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (let y = -7; y <= 0; y++) { const x = v.front(y, 13); if (x !== null) v.set(x + 1, y, 13, 'yuHair'); }   // poni samping
  for (const y of [-8, -7]) v.set(7, y, 12, 'yuHair');
  for (let y = -2; y <= 1; y++) for (const z of [5, 6]) v.set(-9, y, z, 'yuIkat');
  for (let z = 4; z >= -16; z--) { const w = z >= -6 ? 2 : z >= -12 ? 1 : 0; for (let y = -1 - w; y <= w; y++) for (let x = -10; x <= -9; x++) v.set(x - (z < 0 ? 0 : 0), y, z, (y + z) % 5 === 0 ? 'yuHairT' : 'yuHair'); }   // ekor kuda
  for (const [dx, dz] of [[0, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]) { const y = v.sideP(2 + dx, 13 + dz) ?? 7; v.set(2 + dx, y + 1, 13 + dz, dx === 0 ? 'yuIkat' : 'yuJepit'); }   // jepit kupu-kupu menempel di rambut
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
const topC = o => o.top === 'nyapu' ? 'kausYu' : 'kardiYu';
const batik = v => { v.each((x, y, z, k) => { if (k !== 'rokYu') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + z) % 5 + 5) % 5, b = ((u - z) % 5 + 5) % 5; if (a === 0 && b === 0) v.set(x, y, z, 'rokYuK'); else if (a === 0 || b === 0) v.set(x, y, z, 'rokYuS'); }); return v; };
const apron = (v, z0, z1, y0, y1) => { for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, ((y + 40) % 3 === 0) !== (z % 3 === 0) ? 'celYu' : 'celYuS'); } };
function chest(o) {
  const v = new Vox(), c = topC(o);
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -5, -7 + t + w, 4 - t, 6 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'yuSkin', 1);
  for (let y = -3; y <= 2; y++) v.pf(y, 51, 'yuSkin');
  if (o.top === 'nyapu') { apron(v, 32, 45, -5, 4); for (let z = 45; z <= 52; z++) for (const y of [-4, 3]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'celYu'); } }
  else {   // kardigan terbuka di atas kaus putih
    for (let z = 32; z <= 50; z++) for (let y = -3; y <= 2; y++) v.pf(y, z, 'kausYu2');
    for (let z = 32; z <= 50; z++) for (const y of [-4, 3]) v.pf(y, z, 'kardiYuS');
  }
  return v;
}
function pelvis(o) {
  const v = batik(skirtPelvis('rokYu', 'rokYuS', 20));
  if (o.top === 'nyapu') apron(v, 22, 33, -5, 4);
  else for (let z = 27; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 27 ? 'kardiYuS' : 'kardiYu', 3);
  return v;
}
function arm(o) { const v = new Vox(), c = topC(o); v.rbox(-2, 6, 40, 2, 10, 50, o.top === 'nyapu' ? 'yuSkin' : c, 2); v.rrect(51, -2, 6, 2, 10, c, 2); if (o.top === 'nyapu') { v.paint(-2, 6, 45, 2, 10, 51, c); v.shell(45, -3, 5, 3, 11, c, 2); } return v; }
function fore(o, side) {
  const v = new Vox(), N = o.top === 'nyapu';
  v.rbox(-2, 6, 31, 2, 10, 39, N ? 'yuSkin' : 'kardiYu', 2);
  if (!N) v.paint(-2, 6, 31, 2, 10, 31, 'kardiYuS');
  v.rbox(-2, 6, 27, 3, 10, 30, 'yuSkin', 2); v.rrect(26, -1, 7, 2, 9, 'yuSkin', 1);
  if (side > 0 && N) {   // sapu lidi: ikatan lidi dari kepalan sampai tanah, mekar di bawah, diikat tali merah
    for (let z = 1; z <= 40; z++) { const f = z <= 12 ? Math.round((12 - z) / 2.4) : 0; for (let x = -f; x <= f; x++) for (const y of [8, 9]) if (z > 12 || (x + z + y) % 2 === 0 || Math.abs(x) <= 1) v.set(x + 1, y, z, 'yuLidi'); }
    for (let x = 0; x <= 2; x++) for (const y of [7, 10]) v.set(x, y, 33, 'yuLidiT');
    v.set(1, 7, 34, 'yuLidiT'); v.set(1, 10, 34, 'yuLidiT');
  }
  if (side < 0 && !N) {   // keranjang belanja anyaman berisi sayur, cabai, tomat
    for (let z = 10; z <= 21; z++) v.shell(z, -5, 5, 5, 13, (z + 40) % 3 === 0 ? 'yuAnyamS' : 'yuAnyam', 2);
    v.rbox(-5, 5, 10, 5, 13, 10, 'yuAnyamS', 2);
    for (let x = -4; x <= 4; x++) for (let y = 6; y <= 12; y++) v.set(x, y, 21, (x + y) % 5 === 0 ? 'cabaiYu' : (x + 2 * y) % 7 === 0 ? 'tomatYu' : 'sayurYu');
    for (let x = -3; x <= 3; x += 2) for (let z = 22; z <= 24; z++) v.set(x, 9, z, 'sayurYu');
    for (let x = -4; x <= 4; x++) v.set(x, 9, 22 + Math.round(4 * Math.sin((x + 4) / 8 * Math.PI)), 'yuAnyamS');   // gagang
  }
  return v;
}
function foot() {
  const v = new Vox();
  v.rbox(-4, 1, 0, 6, 6, 0, 'jepitYu', 2); v.rbox(-3, 2, 1, 5, 5, 2, 'yuSkin', 2); v.rbox(-3, 2, 3, 1, 5, 4, 'yuSkin', 2);
  for (const [x, y] of [[4, 4], [3, 3], [3, 5], [2, 2], [2, 6]]) v.set(x, y, 2, 'jepitYu');
  return v;
}

export const OUTFITS = {
  nyapu: { name: 'Nyapu halaman: kaus abu + celemek kotak biru + rok batik panjang + sapu lidi + sandal jepit', top: 'nyapu' },
  pasar: { name: 'Ke pasar: kardigan cokelat + kaus putih + rok batik + keranjang belanja', top: 'pasar' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.nyapu), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = batik(skirtThigh('rokYu')), Sn = batik(skirtShin('rokYu', 'rokYuS')), Ft = foot(o), sl = topC(o);
  const panel = s => { const p = batik(skirtPanel('rokYu', 'rokYuS', s, 5)); if (s > 0 && o.top === 'nyapu') { for (let z = 21; z <= 31; z++) for (let y = -5; y <= 4; y++) { const x = p.front(y, z); if (x !== null) p.set(x + 1, y, z, ((y + 40) % 3 === 0) !== (z % 3 === 0) ? 'celYu' : 'celYuS'); } } return p; };
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'yuSkin', shoulder: sl, elbow: o.top === 'nyapu' ? 'yuSkin' : sl, hip: 'rokYu', knee: 'rokYu' }, SKEL, TAIL);
  P.skirt = skirtInfo(P, 'rokYu', 'rokYuS');
  return P;
}
