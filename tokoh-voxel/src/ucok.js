// Bang Ucok: tukang becak di pangkalan becak Bantaran, 40-an, orang Batak, suara keras, suka curhat ke penumpang
// ("Becak, Dek? Murah, sambil curhat."). Kulit sawo matang, rahang kotak, kumis tebal, rambut ikal pendek.
// Narik: topi pet merah pudar + kaus singlet hitam di bawah kemeja kotak terbuka lengan digulung + handuk di leher +
// celana pendek jins + sandal + klakson becak tetot. Pesta adat: kemeja putih + ulos merah-hitam diselempang + celana hitam +
// sepatu pantofel. Rangka keluarga Arga, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  ucSkin: ['#8a5634', '#9a623c', '#aa7046', '#b87e52'], ucSkinS: ['#8e5a36'], ucHair: ['#0e0c0a', '#161210', '#201a16', '#2c241e'], ucKumis: ['#0e0c0a'],
  ucTopi: ['#a8403a', '#b44a42', '#c0544a', '#ca6054'], ucTopiS: ['#84302a'],
  ucKotak: ['#2a6a8a', '#347696', '#3e82a2', '#4a8eae'], ucKotakS: ['#1a4a62'], ucKotakK: ['#d8d0b0'], ucSinglet: ['#1e1e22', '#26262a', '#303034', '#3a3a40'],
  ucHanduk: ['#e8e6e0', '#f0eee8', '#f6f4f0', '#fcfbf8'], ucHandukS: ['#3a6ac0'], ucJins: ['#3a4e6e', '#44587a', '#4e6286', '#5a6e92'], ucJinsS: ['#2a3a54'],
  ucSandal: ['#2a2a2c', '#323234', '#3c3c3e', '#464648'], ucKaret: ['#1a1a1c'], ucCorong: ['#d8b040', '#e4bc4a', '#eec856', '#f6d464'],
  ucPutih: ['#e8e8ea', '#f2f2f4', '#f8f8fa', '#ffffff'], ucPutihS: ['#c8c8cc'], ucHitam: ['#16161a', '#1e1e22', '#28282e', '#34343a'],
  ucUlos: ['#8a1a1a', '#9a2222', '#aa2a2a', '#ba3434'], ucUlosH: ['#1a1414'], ucUlosP: ['#e8e0c8'], ucUlosE: ['#e8c040'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'ucSkinS', k: 'ucKumis' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, '....kk..kk....', '...kkkkkkkk...', ...mouth, F0, F0];   // alis z 11, kumis tebal z 5, mulut z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['..KKK....KKK..', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....mmmmmm....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['....mmmmmm....', F0, F0]),
  marah: F('...BBB..BBB...', EYE, ['....mmmmmm....', '...m......m...', F0]),
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['...mTTTTTTm...', '...mttttttm...', '....mmmmmm....']),   // "Becaaak!"
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', F0]),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const N = o => o.top === 'narik';
const skull = z => z <= 0 ? [-4, -6, 5, 5, 2] : z === 1 ? [-6, -7, 6, 6, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];   // rahang kotak
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'ucSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 7, 'ucSkin'); v.box(8, -1, 5, 8, 0, 5, 'ucSkin'); v.set(7, -1, 5, 'ucSkinS');   // hidung mancung besar
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'ucSkin'); v.box(-1, y, 6, -1, y, 7, 'ucSkinS'); }
  const hair = new Vox();   // ikal pendek
  for (let z = 7; z <= 16; z++) hair.rrect(z, -8, -8, 7, 7, 'ucHair', 4);
  hair.rrect(17, -6, -6, 5, 5, 'ucHair', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 10 : 7)) v.set(x, y, z, c); });
  if (!N(o)) for (let x = -7; x <= 6; x += 2) for (let y = -7; y <= 6; y += 3) v.set(x, y + (x % 4 === 0 ? 1 : 0), 18, 'ucHair');
  if (N(o)) {   // topi pet merah pudar
    for (let z = 14; z <= 19; z++) for (let x = -9; x <= 8; x++) for (let y = -9; y <= 8; y++) {
      const d = ((x + 0.5) / 8.7) ** 2 + ((y + 0.5) / 8.6) ** 2 + (Math.max(0, z - 15) / 5) ** 2;
      if (d <= 1 && (d > 0.6 || z >= 18)) v.set(x, y, z, z === 14 || (x * 2 + y + z) % 9 === 0 ? 'ucTopiS' : 'ucTopi');
    }
    for (let x = 8; x <= 13; x++) for (let y = -6; y <= 5; y++) if (Math.abs(y + 0.5) <= 6 - Math.max(0, x - 11) * 2) v.set(x, y, 14, 'ucTopiS');
  }
  return v;
}

const ulosPat = (z, u) => { const b = ((z % 8) + 8) % 8; return b === 0 ? 'ucUlosE' : b === 1 || b === 7 ? 'ucUlosH' : (b === 3 || b === 5) && (u % 2 === 0) ? 'ucUlosP' : 'ucUlos'; };
function chest(o) {
  const v = new Vox(), c = N(o) ? 'ucKotak' : 'ucPutih';
  for (let z = 34; z <= 56; z++) { const w = z <= 40 ? 1 : z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5, -9 + w + t, 4 - t, 8 - w - t, c, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'ucSkin', 2);
  if (N(o)) {
    v.each((x, y, z, k) => { if (k !== 'ucKotak') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x; const a = ((u % 5) + 5) % 5 === 0, b = ((z % 5) + 5) % 5 === 0; if (a && b) v.set(x, y, z, 'ucKotakK'); else if (a || b) v.set(x, y, z, 'ucKotakS'); });
    for (let z = 35; z <= 56; z++) for (let y = -3; y <= 2; y++) { const x = v.front(y, z); if (x !== null) { v.set(x, y, z, null); v.set(x - 1, y, z, z >= 54 ? 'ucSkin' : 'ucSinglet'); } }   // kemeja terbuka, singlet hitam
    for (let z = 35; z <= 55; z++) for (const y of [-4, 3]) v.pf(y, z, 'ucKotakS');
    // handuk putih bergaris biru melingkar leher, ujung menjuntai di dada kanan
    for (let z = 55; z <= 58; z++) v.shell(z, -5, -6, 4, 5, z === 56 ? 'ucHandukS' : 'ucHanduk', 3);
    for (let z = 44; z <= 55; z++) for (let y = 3; y <= 6; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === 46 ? 'ucHandukS' : 'ucHanduk'); }
  } else {
    for (let z = 55; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'ucPutih', 2);
    for (let y = -2; y <= 1; y++) for (let z = 55; z <= 58; z++) v.pf(y, z, 'ucSkin');
    for (let z = 35; z <= 54; z++) v.pf(-1, z, 'ucPutihS');
    // ulos diselempang dari bahu kanan ke pinggang kiri, depan & belakang, rumbai di ujung
    for (let z = 33; z <= 57; z++) { const yc = Math.round(6 - (57 - z) * 0.6); for (let y = yc - 2; y <= yc + 2; y++) { if (y < -9 || y > 8) continue; const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf + 1, y, z, ulosPat(z, y)); if (xb !== null) v.set(xb - 1, y, z, ulosPat(z, y)); } }
    for (let y = -9; y <= -5; y++) for (let z = 29; z <= 32; z++) if ((y + z) % 2 === 0) { const x = 5; v.set(x, y, z, 'ucUlosP'); }
  }
  return v;
}
function pelvis(o) {
  const v = new Vox(), c = N(o) ? 'ucJins' : 'ucHitam';
  v.rbox(-5, -8, 28, 4, 7, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  v.shell(33, -6, -9, 5, 8, 'ucHitam', 3);
  if (N(o)) for (let z = 29; z <= 34; z++) v.shell(z, -6, -10, 5, 9, z === 29 ? 'ucKotakS' : 'ucKotak', 3);
  return v;
}
function arm(o) { const v = new Vox(), c = N(o) ? 'ucKotak' : 'ucPutih'; v.rbox(-3, 8, 43, 2, 13, 55, c, 2); v.rrect(56, -3, 8, 2, 13, c, 3); if (N(o)) { v.paint(-3, 8, 43, 2, 13, 47, 'ucSkin'); v.shell(47, -4, 7, 3, 14, 'ucKotakS', 2); v.shell(48, -4, 7, 3, 14, 'ucKotak', 2); } return v; }
function fore(o, side) {
  const v = new Vox(), c = N(o) ? 'ucSkin' : 'ucPutih';
  v.rbox(-3, 8, 31, 2, 13, 42, c, 2);
  if (!N(o)) v.paint(-3, 8, 31, 2, 13, 32, 'ucPutihS');
  v.rbox(-3, 8, 27, 3, 13, 30, 'ucSkin', 2); v.rrect(26, -2, 9, 2, 12, 'ucSkin', 2);
  if (N(o) && side > 0) {   // klakson becak: bola karet hitam + corong kuningan
    v.rbox(-1, 9, 20, 3, 12, 25, 'ucKaret', 2);
    for (let k = 0; k <= 8; k++) { const r = 1 + Math.floor(k / 3); v.rrect(19 - k, 1 - r, 10 - r + 1, 1 + r, 11 + r - 1, 'ucCorong', 0); }
  }
  return v;
}
function thigh(o) { const v = new Vox(), c = N(o) ? 'ucJins' : 'ucHitam'; v.rbox(-4, 2, 18, 3, 8, 31, c, 3); v.rrect(32, -3, 2, 2, 8, c, 3); if (N(o)) { v.paint(-4, 2, 18, 3, 8, 21, 'ucSkin'); v.shell(22, -5, 1, 4, 9, 'ucJinsS', 3); } return v; }
function shin(o) { const v = new Vox(), c = N(o) ? 'ucSkin' : 'ucHitam'; v.rbox(-4, 2, 6, 3, 8, 18, c, 3); v.rrect(19, -3, 2, 2, 8, c, 3); return v; }
function foot(o) {
  const v = new Vox();
  if (!N(o)) { v.rbox(-4, 1, 0, 7, 8, 1, 'ucHitam', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'ucHitam', 3); v.rbox(-4, 1, 5, 3, 8, 6, 'ucHitam', 3); v.set(6, 4, 4, 'ucPutih'); return v; }
  v.rbox(-4, 1, 0, 7, 8, 1, 'ucSandal', 3); v.rbox(-3, 2, 2, 6, 7, 3, 'ucSkin', 3); v.rbox(-3, 2, 4, 2, 7, 5, 'ucSkin', 3);
  v.paint(2, 1, 2, 3, 8, 3, 'ucSandal');
  return v;
}

export const OUTFITS = {
  narik: { name: 'Narik becak: topi pet merah + kemeja kotak terbuka + singlet hitam + handuk di leher + celana pendek jins + sandal + klakson tetot', top: 'narik' },
  pesta: { name: 'Pesta adat: kemeja putih + ulos merah-hitam diselempang + celana hitam + pantofel', top: 'pesta' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.narik), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), c = N(o) ? 'ucKotak' : 'ucPutih', cl = N(o) ? 'ucJins' : 'ucHitam';
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'ucSkin', shoulder: c, elbow: N(o) ? 'ucSkin' : c, hip: cl, knee: N(o) ? 'ucSkin' : cl }, SKEL, TAIL);
}
