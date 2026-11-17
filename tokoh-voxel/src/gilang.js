// Gilang Ramadhan: NPC romance cowok, putus sekolah kelas XI, ikut paket C malam, pengantar galon dan skater paling jenaka
// di kota. Ramping berotot (ngangkat galon), kulit cokelat gelap terbakar matahari, rambut hitam berantakan di bawah topi
// terbalik biru-kuning, senyum lebar dengan gigi depan renggang, plester di lutut dan siku, mata berbinar jahil.
// Rangka keluarga Arga (skala 1.34), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  glSkin: ['#5a341e', '#704328', '#875536', '#9a6644'], glSkinS: ['#6a3e24'],
  glHair: ['#09080a', '#121012', '#1c1818', '#2a2422'], glHairT: ['#3a322e'],
  glTopi: ['#2470b0', '#2f86c8', '#3d9be0', '#64b4ee'], glKuning: ['#c8a42a', '#dcb830', '#f5d13a', '#f8e070'],
  glKaus: ['#2470b0', '#2f86c8', '#3d9be0', '#64b4ee'], glPutih: ['#c4bfb0', '#d4cfc0', '#e4dfd0', '#f0ece0'],
  glCelana: ['#26303c', '#303c4a', '#3a4a5a', '#4e6072'], glHanduk: ['#cfcac0', '#ddd8ce', '#ebe6dc', '#f6f2ea'],
  glJepit: ['#2a2a30', '#34343a', '#3f3f46', '#55555e'],
  glKausS: ['#c4c0b4', '#d4d0c4', '#e4e0d4', '#f2eee2'], glKargo: ['#3c4230', '#4a5140', '#596150', '#6e7764'],
  glSepatu: ['#1a1a20', '#24242b', '#2e2e36', '#42424c'], glPapan: ['#8a2a22', '#a8342a', '#c4422e', '#d8603c'],
  glKotak: ['#6a1e22', '#82262a', '#9a3034', '#b4444a'], glKotakS: ['#1e2436'], glKancing: ['#e8e2d2'],
  glSarung: ['#1e3a5a', '#264a6e', '#2e5a82', '#406e98'], glSarungS: ['#16283e'], glSarungK: ['#c8a84a'], glKuningS: ['#b8962a'], glKargoS: ['#30362a'],
});

/* ---------- wajah: alis jahil tidak sejajar (kanan naik) + 1 baris jarak ke mata, mata berbinar, senyum lebar dengan
   gigi depan renggang (1 voxel gelap di tengah deret gigi) tepat di bawah hidung */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'glSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, ...brow, F0, ...eyes, F0, F0, ...mouth, F0, F0, F0];   // 15 baris: alis z 11..10 (di bawah lis topi), mulut mulai z 4
const BROW = ['.........BBBB.', '.BBBB.........'];
const EYE = ['.KKKK....KKKK.', '..WKK....KWK..'];
export const FACES = {
  biasa: F(BROW, EYE, ['...mTTTmTTm...', '....mmmmmm....']),
  kedip: F(BROW, [F0, '.KKKK....KKKK.'], ['...mTTTmTTm...', '....mmmmmm....']),
  marah: F(['.BB........BB.', '..BBBB..BBBB..'], EYE, ['....mmmmmm....', '....m....m....']),
  teriak: F(['.BB........BB.', '..BBBB..BBBB..'], EYE, ['....mTTmTm....', '.....mttm.....']),
  nyengir: F(BROW, ['.KKKK.........', '..WKK....KKKK.'], ['..mTTTTmTTTm..', '...mmmmmmmm...']),
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['..mTTTTmTTTm..', '...mttttttm...']),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTmTT....']),
};
export const EXPRS = Object.keys(FACES);

const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
const topZ = (v, x, y) => { for (let z = 26; z >= -20; z--) if (v.has(x, y, z)) return z; return null; };
const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-6, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
const FR = [10, 14, 14, 15, 14, 14, 15, 14, 14, 15, 14, 14, 14, 10];   // poni acak, alis (z 11..12) tetap kelihatan + 1 baris kulit
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'glSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'glSkin'); v.set(7, -1, 5, 'glSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'glSkin'); v.box(-1, y, 6, -1, y, 7, 'glSkinS'); }
  // rambut hitam berantakan: lapisan tebal, jambul mencuat ke segala arah, cambang tipis di atas telinga
  const hair = new Vox();
  for (let z = 3; z <= 15; z++) hair.rrect(z, -9, -9, 7, 8, 'glHair', z <= 12 ? 4 : 5);
  hair.rrect(16, -8, -8, 6, 7, 'glHair', 5); hair.rrect(17, -6, -6, 4, 5, 'glHair', 4);
  const zmin = (x, y) => x >= 5 ? FR[Math.max(0, Math.min(13, y + 7))] : Math.abs(y + 0.5) > 6.5 && x >= -3 ? 9 : 3 + (rnd(x, y, 1) % 3);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  if (!o.cap) for (const [x, y, h] of [[-2, 1, 2], [1, -5, 1], [-5, -3, 2], [3, 3, 1], [5, -2, 1], [-6, 5, 1], [0, -2, 1], [-3, 6, 1], [2, 6, 1]]) { const z = topZ(v, x, y); if (z !== null) for (let k = 1; k <= h; k++) v.set(x, y, z + k, 'glHair'); }
  for (const [y, z] of [[-4, 13], [-1, 13], [2, 13], [4, 13]]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'glHair'); }   // helai poni mencuat ke depan
  for (const [y, z] of [[-10, 10], [9, 11], [-10, 12], [9, 9]]) v.set(-1, y, z, 'glHair');   // ujung rambut mencuat di samping
  v.each((x, y, z, c) => { if (c === 'glHair' && rnd(x, y, z) % 9 === 0) v.set(x, y, z, 'glHairT'); });
  if (o.cap) {   // topi terbalik biru galon: membungkus rambut atas (z >= 13), lis kuning 3 voxel, pet di belakang
    v.each((x, y, z, c) => { if (z >= 13 && (c === 'glHair' || c === 'glHairT')) v.set(x, y, z, 'glTopi'); });
    const ring = []; v.each((x, y, z, c) => { if (z === 13 && c === 'glTopi') for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!v.has(x + dx, y + dy, z)) ring.push([x + dx, y + dy]); });
    for (const [x, y] of ring) for (let z = 12; z <= 14; z++) v.set(x, y, z, 'glKuning');
    for (let y = -6; y <= 5; y++) { const xb = v.back(y, 13), e = Math.abs(y + 0.5) > 4.5 ? 1 : 0; for (let x = xb - 1; x >= xb - 6 + e; x--) v.set(x, y, 13, y === -6 || y === 5 ? 'glKuning' : 'glTopi'); }
    for (let y = -2; y <= 1; y++) { const z = 14, x = v.front(y, z); if (x !== null) v.set(x, y, z, Math.abs(y + 0.5) < 1 ? 'glHair' : 'glKuning'); }   // bukaan pengatur, rambut nongol
    const tz = Math.max(...[-1, 0].map(y => topZ(v, -1, y))); v.set(-1, 0, tz + 1, 'glKuning');
    for (const [x, y] of [[-1, -5], [-1, 4], [2, -5], [2, 4]]) { const z = topZ(v, x, y); if (z !== null) v.set(x, y, z, 'glKuning'); }   // panel kuning di pucuk
  }
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
const TXT = { A: ['.X.', 'X.X', 'XXX', 'X.X'], I: ['X', 'X', 'X', 'X'], R: ['XX.', 'X.X', 'XX.', 'X.X'] };
function chest(o) {
  const v = new Vox(), T = o.top, B = T === 'telanjang';
  const body = { kerja: 'glKaus', skate: 'glKausS', paket: 'glKotak', telanjang: 'glSkin', jalan: 'glKuning' }[T];
  const big = T === 'skate' ? 1 : 0;   // kaus kebesaran
  for (let z = 34; z <= 56; z++) { const w = z <= 40 ? 1 : z <= 46 ? 0 : -1, t = z === 56 ? 1 : 0; v.rrect(z, -5 - big, -8 + w + t - big, 4 - t + big, 7 - w - t + big, body, z >= 55 ? 4 : 3); }
  v.rbox(-3, -3, 57, 2, 2, 60, 'glSkin', 2);
  if (B) {   // telanjang dada: garis dada & perut, pusar
    for (const y of [-5, -4, -3, -2, 1, 2, 3, 4]) v.pf(y, 47, 'glSkinS');
    for (let z = 37; z <= 45; z++) v.pf(0, z, 'glSkinS'); for (const y of [-3, 2]) v.pf(y, 41, 'glSkinS');
    v.pf(-1, 36, 'glSkinS');
    return v;
  }
  if (T === 'kerja') {   // kaus biru "Depot Air Segar": logo tetes air + tulisan AIR, handuk di leher
    for (let y = -2; y <= 1; y++) v.pf(y, 56, 'glSkin');
    v.shell(57, -4, -4, 3, 3, 'glKaus', 2);
    ['..X..', '.XXX.', 'XXYXX', 'XXXXX', '.XXX.'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pf(c - 3, 52 - r, ch === 'X' ? 'glPutih' : 'glKaus'); }));
    let y = -6; for (const ch of 'AIR') { TXT[ch].forEach((row, r) => [...row].forEach((k, c) => { if (k === 'X') v.pf(y + c, 45 - r, 'glPutih'); })); y += TXT[ch][0].length + 1; }
    for (let y = -7; y <= 6; y++) v.pb(y, 50, 'glPutih');   // garis putih di punggung
    // handuk melingkar di leher, kedua ujung menjuntai di dada
    for (let z = 56; z <= 58; z++) v.shell(z, -4, -5, 4, 4, 'glHanduk', 2);
    for (const y of [-5, -4, 3, 4]) for (let z = 46; z <= 55; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z <= 47 ? 'glKuning' : 'glHanduk'); }
    return v;
  }
  if (T === 'skate') {   // kaus kebesaran bergambar kartun muka nyengir, papan skate di punggung
    for (let y = -2; y <= 1; y++) v.pf(y, 56, 'glSkin');
    v.shell(57, -4, -4, 3, 3, 'glKausS', 2);
    ['.YYYYY.', 'YYYYYYY', 'YKYYYKY', 'YYYYYYY', 'YKYYYKY', 'YYKKKYY', '.YYYYY.'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.pf(c - 4, 51 - r, ch === 'Y' ? 'glKuning' : 'glSepatu'); }));
    if (o.board) {   // papan: sisi gambar menghadap luar, truk + roda kuning menonjol
      const xb = Math.min(...[-3, 0, 2].map(y => v.back(y, 45)));
      for (let z = 30; z <= 62; z++) { const e = z <= 31 || z >= 61 ? 1 : 0; for (let y = -4 + e; y <= 3 - e; y++) { v.set(xb - 1, y, z, 'glSepatu'); v.set(xb - 2, y, z, (y === -1 || y === 0) && z > 33 && z < 59 ? 'glKuning' : 'glPapan'); } }
      for (const z0 of [35, 56]) { for (let y = -3; y <= 2; y++) v.set(xb - 3, y, z0, 'zip'); for (const y of [-4, -3, 2, 3]) for (let z = z0 - 1; z <= z0 + 1; z++) v.set(xb - 4, y, z, 'glKuning'); }
    }
    return v;
  }
  if (T === 'paket') {   // kemeja kotak satu-satunya, dikancing sampai atas, kerah rapat
    v.each((x, y, z, c) => { if (c === 'glKotak' && ((y + 40) % 5 === 0 || z % 5 === 0)) v.set(x, y, z, 'glKotakS'); });
    for (let z = 35; z <= 56; z++) v.pf(0, z, 'glKotak');
    for (let z = 37; z <= 55; z += 4) v.pf(-1, z, 'glKancing');
    for (let z = 57; z <= 58; z++) v.shell(z, -4, -4, 3, 3, 'glKotak', 2);
    v.pf(-1, 57, 'glKancing');
    for (const y of [-6, 3]) for (let z = 47; z <= 50; z++) for (let k = 0; k < 3; k++) v.pf(y + k, z, z === 50 ? 'glKotakS' : 'glKotak');   // saku dada
    return v;
  }
  if (T === 'jalan') {   // windbreaker kuning-biru loakan: bahu biru, ritsleting, kerah berdiri
    v.each((x, y, z, c) => { if (c === 'glKuning' && z >= 49) v.set(x, y, z, 'glTopi'); });
    for (let y = -8; y <= 7; y++) { v.pf(y, 48, 'glPutih'); v.pb(y, 48, 'glPutih'); }
    for (let z = 34; z <= 56; z++) v.pf(-1, z, 'zip');
    for (let z = 57; z <= 59; z++) v.shell(z, -4, -5, 3, 4, z === 59 ? 'glKuning' : 'glTopi', 2);
    for (const y of [-7, 5]) for (let z = 37; z <= 40; z++) { v.pf(y, z, 'glKuningS'); v.pf(y + 1, z, 'glKuningS'); }
    return v;
  }
  return v;
}
function pelvis(o) {
  if (o.top === 'telanjang') {   // sarung kotak lewat rok.js, gulungan di pinggang
    const v = plaid(skirtPelvis('glSarung', 'glSarungS', 22));
    for (let z = 31; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 32 ? 'glSarungS' : 'glSarung', 3);
    v.rbox(1, -2, 30, 6, 2, 33, 'glSarung', 2);   // gulungan depan
    return v;
  }
  const c = legC(o), v = new Vox();
  v.rbox(-5, -7, 28, 4, 6, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'skate') for (let z = 26; z <= 33; z++) v.shell(z, -7, -9, 6, 8, z === 26 ? 'glPutih' : 'glKausS', 3);   // kaus kebesaran menjuntai
  else if (o.top === 'kerja') for (let z = 31; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'glKaus', 3);
  else if (o.top === 'jalan') for (let z = 30; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 30 ? 'glTopi' : 'glKuning', 3);
  else { v.rbox(-5, -7, 32, 4, 6, 33, 'belt', 3); v.pfBox(-1, 32, 0, 33, 'buckle'); }   // kemeja dimasukkan, ikat pinggang
  return v;
}
const plaid = v => { v.each((x, y, z, c) => { if (c === 'glSarung' && (z % 5 === 0 || (y + 40) % 4 === 0)) v.set(x, y, z, z % 10 === 0 && (y + 40) % 8 < 4 ? 'glSarungK' : 'glSarungS'); }); return v; };   // kotak biru tua, sesekali benang emas
const legC = o => ({ kerja: 'glCelana', skate: 'glKargo', paket: 'jeans', telanjang: 'glSarung', jalan: 'jeans' }[o.top]);
const sleeveC = o => ({ kerja: 'glKaus', skate: 'glKausS', paket: 'glKotak', jalan: 'glTopi' }[o.top] || 'glSkin');
function arm(o) {
  const v = new Vox(), c = sleeveC(o), L = o.top === 'paket' || o.top === 'jalan';
  v.rbox(-3, 7, 43, 2, 12, 55, L ? c : 'glSkin', 2); v.rrect(56, -3, 7, 2, 12, c, 2);
  if (o.top === 'kerja') { v.paint(-3, 7, 49, 2, 12, 56, c); v.shell(49, -4, 7, 3, 13, c, 2); }
  if (o.top === 'skate') { v.rbox(-4, 6, 44, 3, 13, 56, c, 2); }   // lengan kaus kebesaran sampai siku
  if (o.top === 'jalan') { v.paint(-3, 7, 43, 2, 12, 48, 'glKuning'); for (let z = 43; z <= 55; z++) v.set(0, 12, z, 'glPutih'); }
  if (o.top === 'paket') v.each((x, y, z, cc) => { if (cc === 'glKotak' && ((x + 40) % 5 === 0 || z % 5 === 0)) v.set(x, y, z, 'glKotakS'); });
  return v;
}
function fore(o, side) {
  const v = new Vox(), L = o.top === 'paket' || o.top === 'jalan', c = sleeveC(o);
  v.rbox(-3, 7, 31, 2, 12, 42, L ? c : 'glSkin', 2);
  v.rbox(-3, 7, 27, 3, 12, 30, 'glSkin', 2); v.rrect(26, -2, 8, 2, 11, 'glSkin', 2);
  if (o.top === 'jalan') { v.rbox(-4, 6, 31, 3, 13, 33, 'glKuning', 2); for (let z = 34; z <= 42; z++) v.set(0, 12, z, 'glPutih'); }
  if (o.top === 'paket') { v.paint(-3, 7, 31, 2, 12, 32, 'glKotakS'); v.each((x, y, z, cc) => { if (cc === 'glKotak' && ((x + 40) % 5 === 0 || z % 5 === 0)) v.set(x, y, z, 'glKotakS'); }); }
  if (!L) {   // plester di siku (sisi belakang lengan bawah), silang di kanan
    for (let z = 38; z <= 41; z++) for (let y = 8; y <= 11; y++) v.set(-3, y, z, z === 38 || z === 41 ? 'plasterS' : 'plaster');
    if (side > 0) for (const [y, z] of [[7, 37], [12, 42]]) v.set(-3, y, z, 'plaster');
  }
  return v;
}
function knee(v, side) {   // plester di lutut: kotak krem di depan betis atas
  for (let z = 14; z <= 17; z++) for (let y = 3; y <= 6; y++) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, z === 14 || z === 17 ? 'plasterS' : 'plaster'); }
  if (side > 0) for (const [y, z] of [[2, 13], [7, 18]]) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'plaster'); }
}
function thigh(o) {
  if (o.top === 'telanjang') return plaid(skirtThigh('glSarung'));
  const c = legC(o), v = new Vox();
  if (o.top === 'kerja') {   // celana pendek di atas lutut
    v.rbox(-4, 2, 18, 3, 7, 31, 'glSkin', 3); v.rbox(-5, 1, 23, 4, 8, 31, c, 3); v.rrect(32, -3, 2, 2, 7, c, 3);
    return v;
  }
  if (c === 'glKargo') {   // kargo lebar, saku samping, sobek di lutut
    v.rbox(-5, 1, 18, 4, 8, 31, c, 3); v.rrect(32, -3, 1, 2, 7, c, 3);
    for (let z = 21; z <= 26; z++) for (let x = -2; x <= 1; x++) v.set(x, 9, z, z === 26 ? 'glKausS' : c);
    v.each((x, y, z, cc) => { if (cc === c && rnd(x, y, z) % 17 === 0) v.set(x, y, z, 'glKargoS'); });
    for (const [y, z] of [[3, 19], [4, 19], [5, 18], [4, 20]]) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'glSkin'); }
    return v;
  }
  v.rbox(-4, 2, 18, 3, 7, 31, c, 3); v.rrect(32, -3, 2, 2, 7, c, 3);
  return v;
}
function shin(o, side) {
  if (o.top === 'telanjang') return plaid(skirtShin('glSarung', 'glSarungS'));
  const c = legC(o), v = new Vox();
  if (o.top === 'kerja') { v.rbox(-4, 2, 6, 3, 7, 18, 'glSkin', 3); v.rrect(19, -3, 2, 2, 7, 'glSkin', 3); knee(v, side); return v; }
  if (c === 'glKargo') {
    v.rbox(-5, 1, 8, 4, 8, 18, c, 3); v.rrect(19, -3, 1, 2, 7, c, 3);
    for (let z = 14; z <= 17; z++) for (let y = 3; y <= 6; y++) { const x = v.front(y, z); if (x !== null && (z > 14 || y > 3)) v.set(x, y, z, z === 16 && y >= 4 && y <= 5 ? 'plaster' : 'glSkin'); }   // sobekan lutut, plester kelihatan
    v.each((x, y, z, cc) => { if (cc === c && rnd(x, y, z) % 17 === 0) v.set(x, y, z, 'glKargoS'); });
    v.rbox(-4, 2, 5, 3, 7, 7, 'glSepatu', 3);
    return v;
  }
  v.rbox(-4, 2, 7, 3, 7, 18, c, 3); v.rrect(19, -3, 2, 2, 7, c, 3);
  v.rbox(-4, 2, 5, 3, 7, 6, 'glSepatu', 3);
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'kerja' || o.top === 'telanjang') {   // sandal jepit: sol tipis, tali V biru
    v.rbox(-4, 1, 0, 7, 8, 0, 'glJepit', 2); v.rbox(-3, 2, 1, 6, 7, 2, 'glSkin', 2); v.rbox(-3, 2, 3, 2, 7, 5, 'glSkin', 2);
    for (const [x, y] of [[5, 4], [4, 3], [4, 5], [3, 2], [3, 6], [2, 2], [2, 7]]) v.set(x, y, 2, 'glTopi');
    v.set(5, 4, 1, 'glTopi');
    return v;
  }
  // sepatu skate tua: sol putih menganga diikat karet merah
  v.rbox(-5, 1, 0, 7, 8, 1, 'white', 3); v.rbox(-5, 1, 2, 7, 8, 4, 'glSepatu', 3); v.rbox(-5, 1, 5, 2, 8, 6, 'glSepatu', 3);
  for (const x of [1, 3, 5]) v.paint(x, 3, 4, x, 6, 4, 'white');
  v.set(7, 3, 1, null); v.set(7, 4, 1, null); v.set(7, 5, 1, null); v.set(7, 6, 1, null);   // sol menganga di ujung
  v.paint(4, 1, 0, 4, 8, 4, 'karet'); v.paint(-2, 1, 0, -2, 8, 4, 'karet');   // dua lilitan karet
  return v;
}

export const OUTFITS = {
  kerja: { name: 'Antar galon: kaus Depot Air Segar + celana pendek + sandal jepit + handuk', top: 'kerja', cap: true },
  skate: { name: 'Skate: kaus kartun kebesaran + kargo sobek + sepatu diikat karet + papan', top: 'skate', cap: true, board: true },
  paket: { name: 'Paket C malam: kemeja kotak dikancing sampai atas', top: 'paket' },
  rumah: { name: 'Di rumah: telanjang dada + sarung', top: 'telanjang' },
  jalan: { name: 'Windbreaker kuning-biru loakan + jeans + topi terbalik', top: 'jalan', cap: true },
};
export function build(opt = {}) {
  // game memanggil outfit 'seragam': Gilang tidak sekolah, jadi pakai baju kerja. Galon bukan bagian badan: ia properti
  // gerakan 'galon' / 'galonWalk' (rig.js), jadi hilang sendiri saat Gilang berantem
  const base = OUTFITS[opt.outfit] || OUTFITS.kerja;
  const o = { ...base, expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o);
  const sar = o.top === 'telanjang', panel = sg => sar ? plaid(skirtPanel('glSarung', 'glSarungS', sg, 5)) : null;
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', shin(o, 1), PV.shinR], ['shinL', shin(o, -1).mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'glSkin', shoulder: sl, elbow: o.top === 'paket' || o.top === 'jalan' ? sl : 'glSkin', hip: leg, knee: o.top === 'kerja' ? 'glSkin' : leg }, SKEL, TAIL);
  if (sar) P.skirt = skirtInfo(P, 'glSarung', 'glSarungS');
  return P;
}
