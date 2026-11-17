// Nadia Kusuma: NPC utama cewek, calon ketua OSIS, perfeksionis. Hijab segi empat abu-biru dilipat rapi dengan peniti
// mutiara di bawah dagu, kemeja krem lengan panjang dimasukkan, rok abu panjang, badge OSIS, pulpen di saku, jam tangan
// kecil tali kulit, pantofel hitam mengilap. Rangka skala 1.24 (sama dengan Rani), voxel halus 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  nSkin: ['#bd8c68', '#d9a885', '#eec09c', '#f8d4b4'], nSkinS: ['#d9a885'], nBlush: ['#ec9c8c'],
  hijab: ['#71849c', '#90a3ba', '#b0c1d4', '#cbd8e6'], hijabS: ['#8396ad'], pearl: ['#fbf7ee'],
  cream: ['#b1a891', '#d3c9b1', '#efe3c8', '#fbf3e0'], creamS: ['#d3c9b1'],
  nSkirt: ['#4c505c', '#626773', '#7b808c', '#959aa6'], nSkirtS: ['#555a66'],
  pantofel: ['#09080b', '#121116', '#1f1e25', '#4a4a56'], strap: ['#5a3420'], pen: ['#2a4fa0'],
  almamater: ['#14203f', '#1c2b52', '#263a6a', '#36508a'], almaS: ['#c7a24a'], map: ['#d9ecf2'],
  mint: ['#5f9c80', '#7ab89a', '#9fd3b5', '#bfe6cf'], mintS: ['#7ab89a'],
  kulot: ['#8a6d50', '#a88865', '#c4a47f', '#dbbf9b'], bag: ['#6f5a3f', '#8a7354', '#a68f6c', '#c2ad8a'],
});

/* ---------- wajah: mata cokelat tajam yang lembut, alis rapi tipis, senyum kecil, pipi gampang merah */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'nBlush', s: 'nSkinS' };
const F0 = '..............';
const F = (brow, eyes, mid, mouth) => [F0, F0, F0, ...brow, ...eyes, mid[0], ...mouth, F0, F0];   // mulut naik 1 baris (tepat di bawah hidung)
const MID = ['..............', '..............'];
const BL = ['.rr........rr.', '..............'];
export const FACES = {
  biasa: F(['..............', '..BBB....BBB..', '..............'], ['..KKK....KKK..', '..WKK....KKW..', '..............'], MID, ['..............', '....m....m....', '.....mmmm.....']),
  kedip: F(['..............', '..BBB....BBB..', '..............'], ['..............', '..............', '..KKK....KKK..'], MID, ['..............', '....m....m....', '.....mmmm.....']),
  marah: F(['..............', '...BB....BB...', '.....B..B.....'], ['..KKK....KKK..', '..WKK....KKW..', '..............'], MID, ['..............', '....mmmmmm....', '..............']),
  teriak: F(['..............', '...BB....BB...', '.....B..B.....'], ['..KKK....KKK..', '..WKK....KKW..', '..............'], MID, ['.....mmmm.....', '.....mTTm.....', '......mm......']),
  nyengir: F(['..............', '..BBB....BBB..', '..............'], ['..KKK....KKK..', '..WKK....KKW..', '..............'], BL, ['....m....m....', '.....mmmm.....', '..............']),
  ketawa: F(['..BBB....BBB..', '..............', '..............'], ['..............', '..KK......KK..', '.K..K....K..K.'], BL, ['....mTTTTm....', '.....mttm.....', '......mm......']),
  sakit: F(['...BB....BB...', '.BB........BB.', '..............'], ['.KK........KK.', '...KK....KK...', '.KK........KK.'], MID, ['.....mmmm.....', '.....TTTT.....', '.....mmmm.....']),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
// bukaan wajah (oval) di depan: hijab membingkai dari dahi sampai bawah dagu
const open = (y, z) => { const dy = (y + 0.5) / 6.4, dz = (z - 5.5) / 6.4; return dy * dy + dz * dz <= 1; };
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'nSkin', r); }
  for (const y of [-5, 4]) { v.set(5, y, 1, null); v.set(5, y, 2, null); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'nSkin'); v.set(7, -1, 4, 'nSkinS');                        // hidung kecil
  // hijab: lapisan kain 1-2 voxel di luar kepala, kubah sedikit tinggi, membungkus leher di bawah dagu
  const h = new Vox();
  for (let z = 2; z <= 14; z++) h.rrect(z, -8, -8, 7, 7, 'hijab', z <= 11 ? 4 : 5);
  h.rrect(15, -7, -7, 6, 6, 'hijab', 4); h.rrect(16, -4, -4, 3, 3, 'hijab', 2);
  for (let z = -4; z <= 1; z++) h.rrect(z, -6, -7, 6, 6, 'hijab', 4);                    // bawah dagu & leher
  h.each((x, y, z, c) => { if (v.has(x, y, z)) return; if (x >= 3 && z >= 0 && open(y, z)) return; v.set(x, y, z, c); });
  for (let z = 0; z <= 14; z++) for (let y = -9; y <= 8; y++) { const x = v.front(y, z); if (x !== null && x >= 7 && v.get(x, y, z) === 'hijab' && !open(y, z) && open(y + (y < 0 ? 1 : -1), z)) v.set(x, y, z, 'hijabS'); }
  // lipatan dahi rapi (garis tegas) + peniti mutiara di bawah dagu
  for (let y = -5; y <= 4; y++) { const x = v.front(y, 13); if (x !== null && v.get(x, y, 13) === 'hijab') v.set(x, y, 13, 'hijabS'); }
  v.set(v.front(-1, -1) ?? 6, -1, -1, 'pearl'); v.set(v.front(0, -1) ?? 6, 0, -1, 'pearl');
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
function drape(v, c, cS) {   // kain hijab jatuh menutup bahu & dada, ujung depan meruncing
  for (let z = 44; z <= 55; z++) {
    const k = Math.min(3, Math.floor((56 - z) / 2.2)), x0 = -5 - (k > 1 ? 1 : 0), x1 = 4 + k, y0 = -6 - k, y1 = 5 + k;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const inner = x > x0 && x < x1 && y > y0 && y < y1;
      if (inner && v.has(x, y, z)) continue;
      if (z <= 47 && x < 2 && Math.abs(y + 0.5) < 6) continue;   // belakang: berhenti di tulang belikat
      if (z <= 46 && Math.abs(y + 0.5) > 4.5 - (46 - z)) continue;   // depan meruncing
      if (!inner || !v.has(x, y, z)) v.set(x, y, z, c);
    }
  }
  for (let z = 44; z <= 52; z++) { const x = v.front(-1, z); if (x !== null && v.get(x, -1, z) === c) v.set(x, -1, z, cS); }
}
function chest(o) {
  const v = new Vox(), A = o.top === 'alma', G = o.top === 'gamis', J = o.top === 'tunik';
  const body = A ? 'almamater' : G ? 'mint' : 'cream';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 37 && z <= 41 ? 1 : 0; v.rrect(z, -4, -6 + t + w, 4 - t, 5 - t - w, body, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'hijab', 1);
  if (A) {   // jas almamater biru tua, kerah, kemeja krem di tengah, lambang sekolah emas
    for (let z = 34; z <= 50; z++) for (let y = -1; y <= 0; y++) v.pf(y, z, 'cream');
    for (let z = 38; z <= 49; z++) { v.pf(-2, z, 'almaS'); }
    v.pfBox(-5, 44, -4, 45, 'almaS');
    for (let z = 34; z <= 44; z += 5) v.pf(1, z, 'almaS');
  } else if (G) {
    for (let z = 36; z <= 43; z++) v.pf(0, z, 'mintS');
  } else {
    for (let z = 32; z <= 43; z++) v.pf(0, z, 'creamS');                                    // garis kancing
    if (!J) {
      v.pfBox(3, 40, 4, 41, 'osis'); v.pfBox(-5, 41, -3, 41, 'tag');                        // badge OSIS + papan nama
      v.pf(-4, 43, 'pen'); v.pf(-4, 42, 'pen');                                              // pulpen di saku
      for (let y = -6; y <= -3; y++) v.pf(y, 39, 'creamS');
    } else for (let z = 36; z <= 43; z++) for (const y of [-3, 2]) v.pf(y, z, 'creamS');      // tunik: dua lipit
  }
  drape(v, 'hijab', 'hijabS');
  if (J) { for (let z = 32; z <= 49; z++) { const t = Math.round(-5 + (49 - z) * 0.65); const y = Math.max(-7, Math.min(6, t)); const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'bag'); } }   // tali tas selempang
  return v;
}
function pelvis(o) {
  const v = new Vox(), K = o.bottom === 'kulot', c = o.top === 'gamis' ? 'mint' : K ? 'kulot' : 'nSkirt';
  v.rbox(-4, -6, 26, 4, 5, 33, c, 3); v.box(-3, -2, 24, 2, 1, 25, c);
  for (let z = 22; z <= 33; z++) { const f = z <= 27 ? 1 : 0; v.shell(z, -5 - f, -7 - f, 4 + f, 6 + f, c, 3); }
  if (o.top === 'tunik') for (let z = 24; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'cream', 3);   // tunik menutup pinggul
  else if (o.top !== 'gamis') for (let z = 32; z <= 33; z++) v.shell(z, -5, -7, 4, 6, 'nSkirtS', 3);   // ban pinggang rok
  if (o.top === 'alma') for (let z = 30; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'almamater', 3);
  return v;
}
// panel rok depan & belakang (ikut ayunan paha) menutup celah antar kaki
function panel(o, s) {
  if (o.bottom === 'kulot') return null;
  const v = new Vox(), c = o.top === 'gamis' ? 'mint' : 'nSkirt', cS = o.top === 'gamis' ? 'mintS' : 'nSkirtS';
  for (let z = 6; z <= 31; z++) { const f = z <= 12 ? 2 : z <= 22 ? 1 : 0; s > 0 ? v.box(3, -6 - f, z, 6 + f, 5 + f, z, c) : v.box(-7 - f, -6 - f, z, -4, 5 + f, z, c); }
  for (const y of [-4, 3]) for (let z = 7; z <= 28; z++) { const x = s > 0 ? v.front(y, z) : v.back(y, z); if (x !== null) v.set(x, y, z, cS); }
  return v;
}
function arm(o) {
  const v = new Vox(), c = o.top === 'alma' ? 'almamater' : o.top === 'gamis' ? 'mint' : 'cream';
  v.rbox(-2, 6, 40, 2, 10, 50, c, 2); v.rrect(51, -2, 6, 2, 10, c, 2);
  return v;
}
function fore(o, side) {   // lengan panjang sampai pergelangan; jam kecil tali kulit di kiri
  const v = new Vox(), c = o.top === 'alma' ? 'almamater' : o.top === 'gamis' ? 'mint' : 'cream';
  v.rbox(-2, 6, 31, 2, 10, 39, c, 2);
  v.rbox(-2, 6, 27, 3, 10, 30, 'nSkin', 2); v.rrect(26, -1, 7, 2, 9, 'nSkin', 1);
  v.paint(-2, 6, 31, 2, 10, 31, o.top === 'alma' ? 'cream' : c === 'cream' ? 'creamS' : 'mintS');
  if (side < 0) { v.paint(-2, 6, 30, 2, 10, 30, 'strap'); v.pf(8, 30, 'pearl'); }
  return v;
}
function thigh(o) {   // kaki dibungkus kain rok (tabung lebar), atau kulot
  const K = o.bottom === 'kulot', c = o.top === 'gamis' ? 'mint' : K ? 'kulot' : 'nSkirt', v = new Vox();
  v.rbox(-4, 0, 17, 3, 8, 31, c, 3);
  return v;
}
function shin(o) {
  const K = o.bottom === 'kulot', c = o.top === 'gamis' ? 'mint' : K ? 'kulot' : 'nSkirt', v = new Vox();
  for (let z = 5; z <= 17; z++) { const f = z <= 9 ? 1 : 0; v.rrect(z, -4 - f, 0 - f, 3 + f, 8 + f, c, 3); }
  if (!K) for (let z = 6; z <= 16; z++) v.set(v.front(4, z) ?? 3, 4, z, o.top === 'gamis' ? 'mintS' : 'nSkirtS');
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.shoe === 'kets') {
    v.rbox(-4, 1, 0, 6, 6, 1, 'sole', 2); v.rbox(-4, 1, 2, 6, 6, 3, 'kick', 2); v.rbox(-3, 2, 4, 2, 5, 5, 'kick', 2);
    for (const x of [1, 3]) v.paint(x, 2, 3, x, 5, 3, 'lace');
    return v;
  }
  if (o.shoe === 'kaus') { v.rbox(-4, 1, 0, 6, 6, 3, 'cream', 2); return v; }   // kaus kaki di rumah
  // pantofel hitam mengilap, ujung membulat
  v.rbox(-4, 1, 0, 6, 6, 0, 'pantofel', 2); v.rbox(-4, 1, 1, 6, 6, 3, 'pantofel', 2); v.rbox(-3, 2, 4, 1, 5, 4, 'pantofel', 2);
  v.set(6, 3, 3, 'pearl');
  return v;
}

export const OUTFITS = {
  seragam: { name: 'Seragam rapi + hijab', top: 'kemeja', bottom: 'rok' },
  osis: { name: 'Jas almamater (rapat OSIS)', top: 'alma', bottom: 'rok' },
  jalan: { name: 'Tunik + kulot', top: 'tunik', bottom: 'kulot', shoe: 'kets' },
  rumah: { name: 'Gamis rumahan', top: 'gamis', bottom: 'rok', shoe: 'kaus' },
};
export function build(opt = {}) {
  const o = { ...OUTFITS[opt.outfit || 'seragam'], expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o);
  const top = o.top === 'alma' ? 'almamater' : o.top === 'gamis' ? 'mint' : 'cream';
  const leg = o.top === 'gamis' ? 'mint' : o.bottom === 'kulot' ? 'kulot' : 'nSkirt';
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', panel(o, 1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(o, -1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'hijab', shoulder: top, elbow: top, hip: leg, knee: leg }, SKEL, TAIL);
  if (o.bottom !== 'kulot') { const c = o.top === 'gamis' ? 'mint' : 'nSkirt'; P.skirt = { mats: [P.mat(c), P.mat(c + 'S')], fill: P.mat(c), parts: ['pelvis', 'flapF', 'flapB', 'thighL', 'thighR', 'shinL', 'shinR'] }; }
  return P;
}
