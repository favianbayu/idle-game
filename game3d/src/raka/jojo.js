// Jojo (Yohanes Sitompul): NPC romance cowok, fotografer mading & tukang gosip. Kurus jangkung, kulit sawo matang,
// mohawk kecil diberi gel, mata besar penuh rasa ingin tahu, senyum lebar, tahi lalat di bawah mata kanan, kamera DSLR tua
// tergantung di leher, rompi fotografer hijau army penuh saku. Skala lama 1.3, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 14, thigh: 14, up: 4, neck: 24, shY: 9, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  jSkin: ['#7e5236', '#94603f', '#a8724e', '#bc8660'], jSkinS: ['#946040'], tahi: ['#3a2418'],
  jHair: ['#120e0a', '#1a140e', '#2a2018', '#3a2e22'], jHairT: ['#6a5a48'], jSide: ['#2a2018', '#342820', '#403228', '#4e3e32'],
  army: ['#3e4828', '#4c5832', '#5c6b3c', '#71824c'], armyS: ['#46512c'], kamera: ['#121214', '#1a1a1d', '#242428', '#36363c'], lensa: ['#4a6a8a'], kameraT: ['#b8bcc4'],
  kupluk: ['#b85a20', '#d06a28', '#e8843a', '#f4a060'], kuplukS: ['#c46224'], ranselJ: ['#1e1e22', '#28282e', '#34343c', '#46464f'],
  kausJ: ['#3e4348', '#4c5258', '#5e646a', '#747a82'], horas: ['#8a1c1c', '#a42424', '#c02e2e', '#d84848'], ulos: ['#f0e6d0'],
  hawai: ['#c4581e', '#dc6a28', '#e8843a', '#f4a05c'], hawaiD: ['#3a7a4a'], hawaiB: ['#f4e6c8'], kargoJ: ['#4a4a3a', '#5a5a48', '#6c6c58', '#82826c'],
  gunung: ['#1e1e20', '#2a2a2e', '#38383e', '#4c4c54'], ketsJ: ['#8a8478', '#a29c90', '#b8b2a6', '#ccc6ba'],
});

/* ---------- wajah: alis melengkung, 1 baris jarak, mata besar 3 baris, tahi lalat di bawah mata kanan (kiri layar),
   senyum lebar dengan gigi rapi tepat di bawah hidung. */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', x: 'tahi', s: 'jSkinS' };
const F0 = '..............';
const F = (brow, eyes, mole, mouth) => [F0, F0, ...brow, F0, ...eyes, mole, F0, ...mouth, F0, F0];
const BROW = ['..BBB....BBB..', '.B..........B.'];
const EYE = ['.KKKK....KKKK.', '.WKKK....KKKW.', '..KK......KK..'];
const MOLE = '...x..........';
export const FACES = {
  biasa: F(BROW, EYE, MOLE, ['...mTTTTTTm...', '....mmmmmm....', F0]),
  kedip: F(BROW, [F0, F0, '.KKKK....KKKK.'], MOLE, ['...mTTTTTTm...', '....mmmmmm....', F0]),
  marah: F(['.BB........BB.', '...BB....BB...'], EYE, MOLE, ['....mmmmmm....', '....m....m....', F0]),
  teriak: F(['.BB........BB.', '...BB....BB...'], EYE, MOLE, ['....mmmmmm....', '....mTTTTm....', '.....mttm.....']),
  nyengir: F(BROW, EYE, MOLE, ['..mTTTTTTTTm..', '...mmmmmmmm...', F0]),
  ketawa: F(BROW, [F0, '..KK......KK..', '.K..K....K..K.'], MOLE, ['..mTTTTTTTTm..', '...mttttttm...', '....mmmmmm....']),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...', '.KK........KK.'], MOLE, ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
const topZ = (v, x, y) => { for (let z = 26; z >= 0; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-3, -3, 4, 2, 2] : z === 1 ? [-5, -5, 5, 4, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'jSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'jSkin'); v.set(7, -1, 5, 'jSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'jSkin'); v.box(-1, y, 6, -1, y, 7, 'jSkinS'); }
  const hair = new Vox();
  if (o.beanie) {   // kupluk oranye menutup kepala sampai atas telinga, lipatan rib di bawah
    for (let z = 9; z <= 16; z++) hair.rrect(z, -8, -8, 7, 7, 'kupluk', z <= 13 ? 4 : 5);
    hair.rrect(17, -6, -6, 5, 5, 'kupluk', 4); hair.rrect(18, -3, -3, 2, 2, 'kupluk', 2);
    hair.each((x, y, z, c) => { if (!v.has(x, y, z) && !(x >= 6 && z <= 11)) v.set(x, y, z, z <= 11 ? 'kuplukS' : c); });
    v.each((x, y, z, c) => { if (c === 'kupluk' && z >= 12 && (x + y + 40) % 3 === 0) v.set(x, y, z, 'kuplukS'); });
    for (let z = 4; z <= 8; z++) for (let y = -6; y <= 5; y++) if (!v.has(-8, y, z)) v.set(-8, y, z, 'jSide');
    return v;
  }
  // mohawk kecil: samping & belakang dicukur tipis (warna lebih terang = kulit kepala tembus), jambul tengah tegak bergel
  for (let z = 5; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'jSide', z <= 11 ? 4 : 5);
  hair.rrect(16, -6, -6, 5, 5, 'jSide', 4);
  const zmin = (x, y) => x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -2 ? 10 : 5;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  for (let x = -7; x <= 7; x++) {   // jambul: tinggi di depan-tengah, turun ke belakang, ujung runcing bergel
    const h = x >= 4 ? 21 - (x - 4) : x >= -2 ? 21 : 21 - Math.ceil((-2 - x) * 0.8);
    for (let y = -2; y <= 1; y++) { const z0 = topZ(v, x, y) ?? 15; const top = h - (Math.abs(y + 0.5) > 1 ? 1 : 0) - (rnd(x, y, 0) % 2); for (let z = z0 + 1; z <= top; z++) v.set(x, y, z, (z === top && (x + y) % 2) ? 'jHairT' : 'jHair'); }
  }
  for (let x = 4; x <= 8; x++) for (let y = -2; y <= 1; y++) { const z = 14 + Math.max(0, x - 6); if (!v.has(x, y, z)) v.set(x, y, z, 'jHair'); }   // ujung depan menjorok
  return v;
}

/* ---------- badan: kurus jangkung (sisi +y; sisi -y = cermin) */
function chest(o) {
  const T = o.top, v = new Vox(), R = T === 'rompi' || T === 'liputan', H = T === 'horas', W = T === 'hawai';
  const body = R ? 'army' : H ? 'horas' : W ? 'hawai' : 'white';
  for (let z = 34; z <= 56; z++) { const w = z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -4, -7 + w + t, 4 - t, 6 - w - t, body, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'jSkin', 2);
  if (H) {   // kaus merah "Horas!" dengan motif ulos (pita zigzag putih)
    for (let y = -2; y <= 1; y++) v.pf(y, 56, 'jSkin'); v.shell(57, -3, -4, 3, 3, 'horas', 2);
    for (let y = -6; y <= 5; y++) { const z = 45 + ((y + 20) % 2); v.pf(y, z, 'ulos'); v.pf(y, 42 - ((y + 20) % 2), 'ulos'); }
    const G = { H: ['X.X', 'XXX', 'X.X'], O: ['XXX', 'X.X', 'XXX'], R: ['XXX', 'XX.', 'X.X'], A: ['.X.', 'XXX', 'X.X'], S: ['.XX', '.X.', 'XX.'], '!': ['X', 'X', '.'] };
    const word = (w, z0) => { let y = -Math.floor((w.length * 4 - 1) / 2); for (const ch of w) { G[ch].forEach((row, r) => [...row].forEach((k, c) => { if (k === 'X') v.pf(y + c, z0 - r, 'ulos'); })); y += G[ch][0].length + 1; } };
    word('HOR', 54); word('AS!', 50);   // tulisan depan: y = kolom - tengah (tidak dicerminkan)
    return v;
  }
  if (W) {   // kemeja hawaii oranye: daun hijau & bunga krem, kancing, kerah terbuka
    v.each((x, y, z, c) => { if (c === 'hawai') { const k = rnd(x, y, z) % 11; if (k === 0) v.set(x, y, z, 'hawaiD'); else if (k === 1) v.set(x, y, z, 'hawaiB'); } });
    for (let z = 34; z <= 54; z++) v.pf(0, z, 'hawaiB');
    for (const [y, z] of [[-1, 55], [0, 55], [-1, 54], [0, 54], [0, 53]]) v.pf(y, z, 'jSkin');
    for (let z = 56; z <= 57; z++) v.shell(z, -3, -4, 3, 3, 'hawai', 2);
    return v;
  }
  if (R) {   // rompi fotografer hijau army terbuka: kemeja putih (seragam) / kaus abu (liputan) di tengah, saku-saku
    const inner = T === 'liputan' ? 'kausJ' : 'white';
    for (let z = 34; z <= 56; z++) for (let y = -2; y <= 1; y++) { const x = v.front(y, z); if (x === null) continue; v.set(x, y, z, null); v.set(x - 1, y, z, inner); }
    if (T === 'rompi') for (let z = 35; z <= 54; z++) v.pf(0, z, 'whiteS');
    for (const y0 of [-6, 2]) for (const z0 of [36, 43]) { for (let z = z0; z <= z0 + 4; z++) for (let y = y0; y <= y0 + 3; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === z0 + 4 ? 'armyS' : 'army'); } }
    for (let z = 34; z <= 56; z++) { v.pf(-3, z, 'armyS'); v.pf(2, z, 'armyS'); }
    for (let y = -6; y <= 5; y++) v.pb(y, 50, 'armyS');
    for (let z = 57; z <= 58; z++) v.shell(z, -3, -4, 3, 3, inner === 'white' ? 'white' : 'kausJ', 2);
    if (T === 'liputan') {   // ransel kamera di punggung, tali di bahu
      for (let z = 37; z <= 54; z++) for (let y = -5; y <= 4; y++) { const x = v.back(y, z); if (x !== null) for (let d = 1; d <= 3; d++) v.set(x - d, y, z, 'ranselJ'); }
      for (const y of [-5, 4]) for (let z = 44; z <= 56; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'ranselJ'); }
    }
  }
  if (o.cam) {   // tali kamera melingkar leher + kamera DSLR tua di dada, lensa menghadap depan
    for (let z = 47; z <= 56; z++) for (const y of [-4 + Math.floor((56 - z) / 4), 3 - Math.floor((56 - z) / 4)]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'kamera'); }
    const xf = v.front(-1, 44) + 1;
    for (let x = xf; x <= xf + 2; x++) for (let y = -4; y <= 3; y++) for (let z = 40; z <= 46; z++) v.set(x, y, z, z === 46 && x === xf + 1 ? 'kameraT' : 'kamera');
    for (let x = xf + 3; x <= xf + 5; x++) for (let y = -2; y <= 1; y++) for (let z = 41; z <= 44; z++) v.set(x, y, z, x === xf + 5 && Math.abs(y + 0.5) < 1 && z >= 42 && z <= 43 ? 'lensa' : 'kamera');
    v.set(xf + 1, 3, 47, 'kameraT'); v.set(xf + 1, -4, 47, 'kamera');
  }
  return v;
}
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-5, -6, 28, 4, 5, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'rompi') { for (let z = 29; z <= 33; z++) v.shell(z, -5, -7, 4, 6, 'white', 3); for (let z = 31; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'army', 3); }   // kemeja dikeluarkan sedikit
  else if (o.top === 'liputan') for (let z = 31; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'army', 3);
  else if (o.top === 'hawai') for (let z = 30; z <= 33; z++) v.shell(z, -5, -7, 4, 6, 'hawai', 3);
  else for (let z = 30; z <= 33; z++) v.shell(z, -5, -7, 4, 6, 'horas', 3);
  return v;
}
const legC = o => ({ liputan: 'kargoJ', horas: 'shorts', hawai: 'kargoJ' }[o.top] || 'pants');
const sleeveC = o => ({ horas: 'horas', hawai: 'hawai', liputan: 'kausJ' }[o.top] || 'white');
function arm(o) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-2, 7, 43, 2, 11, 54, 'jSkin', 2); v.rrect(55, -2, 7, 2, 11, c, 2);
  v.paint(-2, 7, 48, 2, 11, 54, c); v.shell(48, -3, 7, 3, 12, c, 2);   // lengan pendek
  if (o.top === 'hawai') v.each((x, y, z, cc) => { if (cc === 'hawai' && rnd(x, y, z) % 9 === 0) v.set(x, y, z, 'hawaiD'); });
  return v;
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-2, 7, 31, 2, 11, 42, 'jSkin', 2);
  v.rbox(-2, 7, 27, 3, 11, 30, 'jSkin', 2); v.rrect(26, -1, 8, 2, 10, 'jSkin', 1);
  if (side < 0) v.paint(-2, 7, 32, 2, 11, 33, 'kamera');   // jam digital murah
  return v;
}
function thigh(o) {
  const c = legC(o), v = new Vox(); v.rbox(-4, 2, 18, 3, 6, 31, c, 3); v.rrect(32, -3, 2, 2, 6, c, 3);
  if (c === 'shorts') v.paint(-4, 2, 18, 3, 6, 22, 'jSkin');
  if (c === 'kargoJ') v.rbox(-1, 6, 21, 2, 7, 26, 'kargoJ', 1);   // saku kargo
  return v;
}
function shin(o) {
  const c = legC(o), v = new Vox(); v.rbox(-4, 2, 6, 3, 6, 18, c === 'shorts' ? 'jSkin' : c, 3); v.rrect(19, -3, 2, 2, 6, c === 'shorts' ? 'jSkin' : c, 3);
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'hawai' || o.top === 'horas') {   // sandal gunung: sol tebal, tali silang
    v.rbox(-4, 1, 0, 7, 7, 1, 'gunung', 2); v.rbox(-3, 2, 2, 6, 6, 3, 'jSkin', 2); v.rbox(-3, 2, 4, 2, 6, 5, 'jSkin', 2);
    for (const x of [-2, 2, 5]) v.paint(x, 1, 2, x, 7, 3, 'gunung'); v.paint(-3, 1, 4, -3, 7, 5, 'gunung');
    return v;
  }
  v.rbox(-4, 1, 0, 7, 7, 1, 'sole', 2); v.rbox(-4, 1, 2, 7, 7, 3, 'ketsJ', 2); v.rbox(-3, 1, 4, 2, 7, 5, 'ketsJ', 2);   // kets lusuh
  for (const x of [1, 3, 5]) v.paint(x, 3, 4, x, 5, 4, 'lace'); v.set(6, 2, 2, 'oli'); v.set(-3, 6, 3, 'oli');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam + rompi fotografer army + kamera', top: 'rompi', cam: true },
  liputan: { name: 'Liputan: rompi + kupluk oranye + ransel kamera', top: 'liputan', cam: true, beanie: true },
  rumah: { name: 'Kaus "Horas!" + celana pendek', top: 'horas' },
  jalan: { name: 'Kemeja hawaii oranye + kargo + sandal gunung', top: 'hawai' },
};
export function build(opt = {}) {
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'jSkin', shoulder: sl, elbow: 'jSkin', hip: leg, knee: leg === 'shorts' ? 'jSkin' : leg }, SKEL, TAIL);
}
