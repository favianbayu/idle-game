// Teh Lilis: penjahit di kios jahit pasar Bantaran, 30-an, orang Sunda, ceriwis dan teliti, ibunya Nadia ikut bekerja
// dengan dia ("Celanamu robek, mau dijahit?"). Kulit kuning langsat, rambut dicepol tinggi berjepit, kacamata baca ditaruh
// di kepala, tahi lalat di pipi. Menjahit: blus kuning bunga lengan tiga perempat + pita ukur kuning di leher + bantalan
// jarum merah di pergelangan + gunting besar + kulot cokelat + sandal. Kondangan: kebaya modern hijau tosca + rok batik
// panjang + selendang tipis + clutch emas. Rangka keluarga Nadia, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  llSkin: ['#cc9670', '#d8a67e', '#e4b48c', '#eec29a'], llSkinS: ['#c8906a'], llBlush: ['#e8908a'], llLip: ['#b04050'], llMole: ['#5a3a2a'],
  llHair: ['#1a120e', '#221814', '#2c201a', '#382a22'], llHairT: ['#4a3628'], llJepit: ['#c83a6a'], llKaca: ['#8a5a3a'],
  llBlus: ['#e8c040', '#f0cc4c', '#f6d65a', '#fae068'], llBlusS: ['#c8a02a'], llBunga: ['#e85a7a'], llDaun: ['#5aa85a'],
  llMeteran: ['#f2d020'], llMeteranS: ['#2a2a2a'], llBantal: ['#d83030'], llJarum: ['#c8ccd4'],
  llKulot: ['#7a5638', '#866042', '#926a4c', '#9e7656'], llKulotS: ['#5e4028'], llSandal: ['#a86a3a', '#b4764a', '#c08254', '#cc8e60'],
  llGunting: ['#9aa0a8', '#a8aeb6', '#b6bcc4', '#c4cad2'], llGagang: ['#2a2a30'], llKain: ['#4a6ac8', '#5476d2', '#5e82dc', '#6a8ee6'],
  llKebaya: ['#1a9a8a', '#22a696', '#2cb2a2', '#3abeae'], llKebayaS: ['#127a6c'], llRenda: ['#d8f0ea'],
  llRok: ['#5a3418', '#683e1e', '#764824', '#84522c'], llRokS: ['#3e220c'], llRokK: ['#e0b860'], llClutch: ['#d8b040', '#e4bc4a', '#eec856', '#f6d464'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'llLip', T: 'teeth', t: 'tongue', r: 'llBlush', s: 'llSkinS', o: 'llMole' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, '..........o...', ...mouth, F0, F0];   // alis z 11, tahi lalat z 5, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['.KKKK....KKKK.', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['.....mmmm.....', F0, F0]),
  kedip: F(BROW, [F0, '..KKK....KKK..'], ['.....mmmm.....', F0, F0]),
  marah: F('...BB....BB...', EYE, ['....mmmmmm....', F0, F0]),   // jahitan ditagih belum jadi
  teriak: F('..BBB....BBB..', ['.KKKK....KKKK.', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['....mTTTTm....', '.....mmmm.....', 'rr..........rr']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['....mTTTTm....', '.....mttm.....', 'rr..........rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),   // ketusuk jarum
};
export const EXPRS = Object.keys(FACES);

const J = o => o.top === 'jahit';
const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'llSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'llSkin'); v.set(7, -1, 5, 'llSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'llSkin'); v.box(-1, y, 6, -1, y, 7, 'llSkinS'); v.set(-1, y + (y > 0 ? 1 : -1), 5, J(o) ? 'llJepit' : 'llClutch'); }
  // rambut ditarik ke atas, cepol tinggi di ubun-ubun belakang
  const hair = new Vox();
  for (let z = 5; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'llHair', z <= 11 ? 4 : 5);
  hair.rrect(16, -6, -6, 5, 5, 'llHair', 4);
  const zmin = (x, y) => x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 5;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  const cx = J(o) ? -5 : -8, cz = J(o) ? 19 : 12;   // jahit: cepol tinggi; kondangan: sanggul rendah
  for (let x = cx - 5; x <= cx + 5; x++) for (let y = -6; y <= 5; y++) for (let z = cz - 5; z <= cz + 5; z++) { const d = ((x - cx) / 4) ** 2 + ((y + 0.5) / 4.6) ** 2 + ((z - cz) / 3.8) ** 2; if (d <= 1 && !v.has(x, y, z)) v.set(x, y, z, (x + y + z) % 5 === 0 ? 'llHairT' : 'llHair'); }
  if (J(o)) {
    for (let y = -4; y <= 3; y++) { const x = cx + 3; v.set(x, y, cz - 3, 'llJepit'); }   // jepit cepol
    // kacamata baca ditaruh di atas kepala (bingkai cokelat)
    ['.GGGG..GGGG.', 'G....GG....G', '.GGGG..GGGG.'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'G') { const y = c - 6, z = 17 - r; const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'llKaca'); } }));
  } else for (let y = -3; y <= 2; y++) v.set(cx - 4, y, cz + 2, 'llClutch');   // tusuk sanggul emas
  return v;
}

/* ---------- badan */
const bunga = v => { v.each((x, y, z, k) => { if (k !== 'llBlus') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u * 2 + z * 3) % 9 + 9) % 9; if (a === 0) v.set(x, y, z, 'llBunga'); else if (a === 4 && (u + z) % 2) v.set(x, y, z, 'llDaun'); }); return v; };
function chest(o) {
  const v = new Vox(), c = J(o) ? 'llBlus' : 'llKebaya';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -5, -7 + t + w, 4 - t, 6 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'llSkin', 1);
  for (let y = -3; y <= 2; y++) v.pf(y, 51, 'llSkin');
  if (J(o)) {
    bunga(v);
    // pita ukur kuning melingkar leher, dua ujung menjuntai di dada
    for (let z = 51; z <= 52; z++) v.shell(z, -4, -5, 3, 4, 'llMeteran', 2);
    for (const y of [-4, 3]) for (let z = 36; z <= 51; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z % 3 === 0 ? 'llMeteranS' : 'llMeteran'); }
  } else {   // kebaya modern: kerah V renda, lis renda di bawah dada
    for (let z = 42; z <= 51; z++) { const hw = Math.round((z - 42) * 0.35); for (let y = -1 - hw; y <= hw; y++) v.pf(y, z, 'llSkin'); v.pf(-2 - hw, z, 'llRenda'); v.pf(hw + 1, z, 'llRenda'); }
    for (let y = -7; y <= 6; y++) { const x = v.front(y, 40); if (x !== null) v.set(x, y, 40, 'llRenda'); }
    for (let z = 33; z <= 39; z++) v.pf(-1, z, 'llKebayaS');
    // selendang tipis tersampir di bahu kiri
    for (let z = 34; z <= 51; z++) for (let y = -7; y <= -5; y++) { const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf + 1, y, z, 'llRenda'); if (xb !== null) v.set(xb - 1, y, z, 'llRenda'); }
  }
  return v;
}
const rokBatik = v => { v.each((x, y, z, k) => { if (k !== 'llRok') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + z) % 5 + 5) % 5, b = ((u - z) % 5 + 5) % 5; if (a === 0 && b === 0) v.set(x, y, z, 'llRokK'); else if ((a === 0 || b === 0) && (u + z) % 2 === 0) v.set(x, y, z, 'llRokS'); }); return v; };
function pelvis(o) {
  if (!J(o)) { const v = rokBatik(skirtPelvis('llRok', 'llRokS', 20)); for (let z = 28; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 28 ? 'llRenda' : 'llKebaya', 3); return v; }
  const v = new Vox(); v.rbox(-4, -6, 26, 4, 5, 33, 'llKulot', 3); v.box(-3, -2, 24, 2, 1, 25, 'llKulot');
  for (let z = 29; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 29 ? 'llBlusS' : 'llBlus', 3);
  return bunga(v);
}
function arm(o) { const v = new Vox(), c = J(o) ? 'llBlus' : 'llKebaya'; v.rbox(-2, 6, 40, 2, 10, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2); return J(o) ? bunga(v) : v; }
function fore(o, side) {
  const v = new Vox(), J_ = J(o);
  v.rbox(-2, 6, 31, 2, 10, 39, J_ ? 'llSkin' : 'llKebaya', 2);
  if (J_) { v.paint(-2, 6, 36, 2, 10, 39, 'llBlus'); v.shell(36, -3, 5, 3, 11, 'llBlusS', 2); } else v.paint(-2, 6, 31, 2, 10, 32, 'llRenda');
  v.rbox(-2, 6, 27, 3, 10, 30, 'llSkin', 2); v.rrect(26, -1, 7, 2, 9, 'llSkin', 1);
  if (J_ && side < 0) {   // bantalan jarum merah di pergelangan kiri + kain biru disampirkan di lengan
    v.rbox(-3, 5, 31, 3, 11, 33, 'llBantal', 2); for (const [x, y] of [[0, 4], [2, 6], [-2, 8], [1, 10]]) v.set(x, y, 34, 'llJarum');
    for (let z = 14; z <= 30; z++) for (let x = -3; x <= 3; x++) v.set(x, 11, z, z <= 16 && (x + 40) % 2 ? null : 'llKain');
  }
  if (J_ && side > 0) {   // gunting besar
    for (let k = 0; k <= 9; k++) { v.set(2 + Math.round(k * 0.4), 8, 23 - k, 'llGunting'); v.set(2 + Math.round(k * 0.4), 10, 23 - k, 'llGunting'); }
    v.rbox(0, 7, 24, 3, 11, 26, 'llGagang', 1); v.box(1, 9, 25, 2, 9, 25, null);
  }
  if (!J_ && side < 0) v.rbox(-4, 8, 21, 4, 11, 26, 'llClutch', 1);   // clutch emas
  return v;
}
function legs(o) {
  if (!J(o)) return [rokBatik(skirtThigh('llRok')), rokBatik(skirtShin('llRok', 'llRokS'))];
  const th = new Vox(); th.rbox(-4, 0, 17, 3, 8, 31, 'llKulot', 3);
  const sn = new Vox(); for (let z = 5; z <= 17; z++) { const f = z <= 9 ? 1 : 0; sn.rrect(z, -4 - f, 0 - f, 3 + f, 8 + f, 'llKulot', 3); }
  for (let z = 6; z <= 16; z++) sn.set(sn.front(4, z) ?? 3, 4, z, 'llKulotS');
  return [th, sn];
}
function foot(o) {
  const v = new Vox();
  if (!J(o)) { v.rbox(-4, 1, 0, 6, 6, 1, 'llClutch', 2); v.rbox(-3, 2, 2, 5, 5, 2, 'llSkin', 2); v.rbox(-3, 2, 3, 1, 5, 4, 'llSkin', 2); v.paint(2, 1, 2, 3, 6, 2, 'llClutch'); return v; }
  v.rbox(-4, 1, 0, 6, 6, 0, 'llSandal', 2); v.rbox(-3, 2, 1, 5, 5, 2, 'llSkin', 2); v.rbox(-3, 2, 3, 1, 5, 4, 'llSkin', 2);
  v.paint(2, 1, 1, 3, 6, 2, 'llSandal');
  return v;
}

export const OUTFITS = {
  jahit: { name: 'Menjahit: blus kuning bunga + pita ukur di leher + bantalan jarum + gunting + kain + kulot cokelat + sandal', top: 'jahit' },
  kondangan: { name: 'Kondangan: sanggul + kebaya modern tosca berenda + selendang tipis + rok batik + clutch emas', top: 'kondangan' },
};
export function build(opt = {}) {
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.jahit), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), [Th, Sn] = legs(o), Ft = foot(o), sl = J(o) ? 'llBlus' : 'llKebaya', leg = J(o) ? 'llKulot' : 'llRok';
  const panel = s => rokBatik(skirtPanel('llRok', 'llRokS', s, 5));
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', !J(o) && panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', !J(o) && panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'llSkin', shoulder: sl, elbow: J(o) ? 'llSkin' : sl, hip: leg, knee: leg }, SKEL, TAIL);
  if (!J(o)) P.skirt = skirtInfo(P, 'llRok', 'llRokS');
  return P;
}
