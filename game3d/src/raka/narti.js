// Bu Narti: ibu kos di Kenanga, 50-an, tukang gosip yang baik hati. Hijab bergo bunga-bunga dengan pet di dahi, daster
// batik panjang, sandal jepit, kipas tangan anyaman, kacamata baca melorot di ujung hidung. Badan pendek gempal.
// Rangka keluarga Nadia (skala 1.24) dengan bahu lebih lebar, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 12, thigh: 12.5, up: 4, neck: 21, shY: 8.5, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.95 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  nrSkin: ['#a8724c', '#c48a62', '#d9a07a', '#e8b490'], nrSkinS: ['#c08660'], nrBlush: ['#d88a76'],
  bergo: ['#5e2448', '#74305a', '#8a3a6a', '#a24e80'], bergoS: ['#4a1c38'], nrBunga: ['#e87aa8'], bungaC: ['#f6d27a'],
  bergoP: ['#5a1e2a', '#6e2634', '#82303e', '#9a4050'], bergoPS: ['#46161e'], bergoK: ['#b8a888', '#ccbc9c', '#e0d2b4', '#ece2ca'], bergoKS: ['#a89878'],
  nrDaster: ['#b04a38', '#c85c44', '#e0705a', '#ec8a72'], nrDasterS: ['#8a3424'], dasterK: ['#f6d27a'],
  brokat: ['#c8b48a', '#dac8a0', '#ecdcb8', '#f6ecd0'], brokatS: ['#b8a47a'], rokB: ['#4a2a18', '#5a3420', '#6e4228', '#865436'], rokBS: ['#2e1a0e'], rokBK: ['#c89a4a'],
  gamis: ['#1e4a3a', '#265a46', '#2e6a52', '#3a8064'], gamisS: ['#163a2c'],
  jepitN: ['#2a5a3a', '#326a44', '#3a7a4a', '#4a8c5a'], nrSelop: ['#3a2418', '#4a2e1e', '#5a3a26', '#6e4a32'],
  kipas: ['#b89a5a', '#ccae6a', '#dcc07c', '#ead292'], kipasS: ['#8a6a3a'], kacaN: ['#a88a4a'], lensN: ['#d8e8ee'],
  tasN: ['#6a1a1a', '#7e2222', '#942a2a', '#aa3a3a'], tasNG: ['#d8b860'],
});

/* ---------- wajah: alis tipis melengkung (suka terangkat kalau gosip), mata ramah dengan garis tawa, pipi merah, mulut
   lebar (cerewet). Kacamata baca di ujung hidung di baris z 5..7 (di bawah mata), jadi mata tetap kelihatan. */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', r: 'nrBlush', s: 'nrSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // 15 baris: alis z 11 (di bawah pet), mulut z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['s.KKK....KKK.s', '..WKK....KKW..'];
const CHEEK = 'rr..........rr';
export const FACES = {
  biasa: F(BROW, EYE, ['....m....m....', '.....mmmm.....', CHEEK]),
  kedip: F(BROW, [F0, '.sKKK....KKKs.'], ['....m....m....', '.....mmmm.....', CHEEK]),
  marah: F('..BBB....BBB..', ['.sKKK....KKKs.', '..WKK....KKW..'], ['....mmmmmm....', F0, F0]),
  teriak: F('.BBB......BBB.', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),   // kaget: "Masya Allah!"
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', CHEEK]),   // "eh, tahu nggak..."
  ketawa: F(BROW, ['s.KK......KK.s', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', 'rr...mmmm...rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

// kepala bulat, pipi tembam
const skull = z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z === 2 ? [-6, -7, 6, 6, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const open = (y, z) => { const dy = (y + 0.5) / 6.4, dz = (z - 5.5) / 6.9; return dy * dy + dz * dz <= 1; };
// motif bunga kecil (plus 5 voxel) di permukaan bergo: kisi 5x5 per sisi, baris selang-seling bergeser
function flowers(v, c, petal, mid) {
  const out = [];
  v.each((x, y, z, k) => {
    if (k !== c) return;
    const fb = v.front(y, z) === x || v.back(y, z) === x, u = fb ? y : x;
    const su = (u + 40 + (Math.floor((z + 40) / 5) % 2) * 2) % 5, sz = (z + 40) % 5;
    if (su === 2 && sz === 2) out.push([x, y, z, mid]); else if (Math.abs(su - 2) + Math.abs(sz - 2) === 1) out.push([x, y, z, petal]);
  });
  for (const [x, y, z, k] of out) v.set(x, y, z, k);
}
function head(o) {
  const v = new Vox(), c = o.hijab, cS = c + 'S';
  for (let z = 0; z <= 14; z++) { const [a, b, cc, d, r] = skull(z); v.rrect(z, a, b, cc, d, 'nrSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 4, 7, 0, 6, 'nrSkin'); v.box(8, -1, 4, 8, 0, 4, 'nrSkin'); v.set(7, -1, 4, 'nrSkinS');   // hidung bulat
  // bergo: kubah kain 1-2 voxel di luar kepala, pet kaku di dahi, kain jatuh membulat sampai dada (lihat drape)
  const h = new Vox();
  for (let z = 1; z <= 14; z++) h.rrect(z, -8, -8, 7, 7, c, z <= 11 ? 4 : 5);
  h.rrect(15, -7, -7, 6, 6, c, 4); h.rrect(16, -5, -5, 4, 4, c, 3);
  for (let z = -6; z <= 0; z++) h.rrect(z, -7, -8, 7, 7, c, 4);   // bawah dagu & leher (bergo tanpa peniti)
  h.each((x, y, z, k) => { if (v.has(x, y, z)) return; if (x >= 3 && z >= 0 && open(y, z)) return; v.set(x, y, z, k); });
  for (let y = -6; y <= 5; y++) for (const z of [13, 14]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === 13 ? cS : c); }   // pet di dahi
  if (o.flower) flowers(v, c, 'nrBunga', 'bungaC');
  for (let z = 0; z <= 12; z++) for (let y = -9; y <= 8; y++) { const x = v.front(y, z); if (x !== null && x >= 6 && v.get(x, y, z) !== 'nrSkin' && !open(y, z) && open(y + (y < 0 ? 1 : -1), z) && !FCH_SKIN(v.get(x, y, z))) v.set(x, y, z, cS); }
  // kacamata baca kecil di ujung hidung: bingkai cokelat tipis setengah lingkar, gagang ke telinga (masuk ke bergo)
  const fx = 8;
  for (const y0 of [-6, 1]) for (let y = y0; y <= y0 + 4; y++) { v.set(fx, y, 7, y === y0 || y === y0 + 4 ? 'kacaN' : 'lensN'); if (y > y0 && y < y0 + 4) v.set(fx, y, 6, 'kacaN'); }
  v.set(fx, -1, 7, 'kacaN'); v.set(fx, 0, 7, 'kacaN');
  for (const y of [-7, 6]) for (let x = 7; x >= 3; x--) if (!v.has(x, y, 7)) v.set(x, y, 7, 'kacaN');
  for (const y of [-7, 6]) v.set(fx, y, 7, 'kacaN');
  return v;
}
const FCH_SKIN = k => k === 'nrBunga' || k === 'bungaC';

/* ---------- badan gempal (sisi +y; sisi -y = cermin) */
function drape(v, c, cS) {   // kain bergo jatuh membulat menutup bahu, dada, punggung atas
  for (let z = 43; z <= 55; z++) {
    const k = Math.min(3, Math.floor((56 - z) / 2.2)), x0 = -6 - (k > 1 ? 1 : 0), x1 = 6 + k, y0 = -8 - k, y1 = 7 + k;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const inner = x > x0 && x < x1 && y > y0 && y < y1;
      if (inner && v.has(x, y, z)) continue;
      if (z <= 46 && x < 2 && Math.abs(y + 0.5) < 7) continue;
      if (z <= 45 && Math.abs(y + 0.5) > 6.5 - (45 - z) * 1.5) continue;   // depan membulat
      if (!inner || !v.has(x, y, z)) v.set(x, y, z, c);
    }
  }
  for (let y = -9; y <= 8; y++) { const x = v.front(y, 43); if (x !== null && v.get(x, y, 43) === c) v.set(x, y, 43, cS); }
}
const batik = (v, c, cS, cK) => {   // daster batik: kisi belah ketupat + titik kuning di tengahnya
  v.each((x, y, z, k) => {
    if (k !== c) return;
    const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + z) % 6 + 6) % 6, b = ((u - z) % 6 + 6) % 6;
    if (a === 0 || b === 0) v.set(x, y, z, cS); else if (a === 3 && b === 3) v.set(x, y, z, cK);
  });
  return v;
};
const dress = o => ({ daster: ['nrDaster', 'nrDasterS', 'dasterK'], arisan: ['rokB', 'rokBS', 'rokBK'], pengajian: ['gamis', 'gamisS', null] }[o.top]);
const pat = (o, v) => { const [c, cS, cK] = dress(o); return cK ? batik(v, c, cS, cK) : v; };
const topC = o => o.top === 'arisan' ? 'brokat' : dress(o)[0];
function chest(o) {
  const v = new Vox(), c = topC(o);
  for (let z = 32; z <= 51; z++) {   // dada & perut membulat ke depan
    const t = z === 51 ? 1 : 0, bel = z >= 33 && z <= 46 ? Math.round(2 * Math.sin((z - 32) / 14 * Math.PI)) : 0;
    v.rrect(z, -5, -8 + t, 5 + bel - t, 7 - t, c, 4);
  }
  v.rbox(-2, -2, 52, 2, 1, 55, o.hijab, 1);
  if (o.top === 'daster') { for (let z = 40; z <= 50; z++) v.pf(0, z, 'nrDasterS'); v.pf(-1, 50, 'dasterK'); v.pf(-1, 46, 'dasterK'); }   // kancing daster
  if (o.top === 'arisan') { v.each((x, y, z, k) => { if (k === 'brokat' && ((x * 3 + y * 5 + z * 7) % 9 === 0 || (x + y + z) % 7 === 0)) v.set(x, y, z, 'brokatS'); }); }   // renda brokat
  if (o.top === 'pengajian') for (let z = 34; z <= 50; z++) v.pf(0, z, 'gamisS');
  pat(o, v);
  drape(v, o.hijab, o.hijab + 'S');
  if (o.flower) flowers(v, o.hijab, 'nrBunga', 'bungaC');
  return v;
}
function pelvis(o) {
  const [c, cS] = dress(o), v = skirtPelvis(c, cS, 20);
  for (let z = 26; z <= 33; z++) v.shell(z, -6, -8, 6, 7, z === 33 ? cS : c, 4);   // pinggul lebar
  if (o.top === 'arisan') for (let z = 24; z <= 33; z++) v.shell(z, -7, -9, 7, 8, z === 24 ? 'brokatS' : 'brokat', 4);   // tunik brokat menutup pinggul
  return pat(o, v);
}
const sleeveC = o => o.top === 'arisan' ? 'brokat' : dress(o)[0];
function arm(o) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-3, 5, 40, 3, 11, 50, c, 3); v.rrect(51, -3, 5, 3, 11, c, 3);
  if (o.top === 'daster') v.shell(40, -4, 4, 4, 12, 'nrDasterS', 3);
  return pat(o, v);
}
function fore(o, side) {
  const v = new Vox(), L = o.top !== 'daster';   // daster: lengan pendek sampai siku; arisan & pengajian lengan panjang
  v.rbox(-3, 5, 31, 3, 11, 39, L ? sleeveC(o) : 'nrSkin', 3);
  v.rbox(-3, 5, 27, 3, 11, 30, 'nrSkin', 3); v.rrect(26, -2, 6, 2, 10, 'nrSkin', 2);
  if (L) pat(o, v);
  if (side > 0 && o.top === 'daster') {   // kipas anyaman bambu terbuka di tangan kanan, gagang di genggaman
    for (let x = 3; x <= 5; x++) v.set(x, 8, 28, 'kipasS');
    for (let r = 2; r <= 8; r++) for (let a = -6; a <= 6; a++) {
      const t = a / 6 * 1.0, x = 5 + Math.round(r * Math.cos(t)), z = 28 + Math.round(r * Math.sin(t));
      v.set(x, 8, z, r === 8 || (a + 6) % 3 === 0 ? 'kipasS' : 'kipas'); v.set(x, 9, z, 'kipas');
    }
  }
  if (side < 0) { v.paint(-3, 5, 30, 3, 11, 30, 'tasNG'); }   // gelang emas
  if (side < 0 && o.top === 'arisan') {   // tas tangan merah dijinjing di kiri
    for (let z = 26; z <= 30; z++) v.set(0, 8, z, 'tasNG');
    v.rbox(-3, 6, 17, 3, 10, 24, 'tasN', 2); v.paint(-3, 6, 24, 3, 10, 24, 'tasNG'); v.set(4, 8, 22, 'tasNG');
  }
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'daster') {   // sandal jepit hijau, jari kelihatan
    v.rbox(-4, 1, 0, 6, 7, 0, 'jepitN', 2); v.rbox(-3, 2, 1, 5, 6, 2, 'nrSkin', 2); v.rbox(-3, 2, 3, 2, 6, 4, 'nrSkin', 2);
    for (const [x, y] of [[4, 4], [3, 3], [3, 5], [2, 2], [2, 6]]) v.set(x, y, 2, 'jepitN');
    return v;
  }
  v.rbox(-4, 1, 0, 6, 7, 0, 'sole', 2); v.rbox(-4, 1, 1, 6, 7, 2, 'nrSelop', 2); v.rbox(-3, 2, 3, 2, 6, 4, 'nrSkin', 2);   // selop
  for (let y = 2; y <= 6; y++) v.set(5, y, 3, 'nrSelop');
  return v;
}

export const OUTFITS = {
  daster: { name: 'Sehari-hari: bergo bunga + daster batik + sandal jepit + kipas', top: 'daster', hijab: 'bergo', flower: true },
  arisan: { name: 'Arisan: bergo marun + tunik brokat + rok batik + selop + tas tangan', top: 'arisan', hijab: 'bergoP', propOn: 'all' },
  pengajian: { name: 'Pengajian: gamis hijau tua + bergo krem + selop', top: 'pengajian', hijab: 'bergoK' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  // game memanggil 'seragam': Bu Narti memakai daster
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.daster), expr: opt.expr || 'biasa', face: opt.face };
  const [c, cS] = dress(o), A = arm(o), Th = pat(o, skirtThigh(c)), Sn = pat(o, skirtShin(c, cS)), Ft = foot(o), sl = sleeveC(o);
  const panel = s => pat(o, skirtPanel(c, cS, s, 5));
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: o.hijab, shoulder: sl, elbow: o.top === 'daster' ? 'nrSkin' : sl, hip: c, knee: c }, SKEL, TAIL);
  P.skirt = skirtInfo(P, c, cS);
  return P;
}
