// Pak RT Slamet: ketua RT Kenanga, 50-an, ramah tapi tegas soal iuran dan ronda. Kopiah hitam, kemeja batik lengan
// pendek cokelat-emas motif parang, perut buncit, rambut pendek beruban di pelipis, tahi lalat di pipi, buku catatan
// warga + pulpen di saku. Rangka keluarga Arga (skala 1.32) dengan perut ala Om Darto, voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 7, ballR: 1.05 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  rtSkin: ['#9a6640', '#b47a50', '#c99068', '#d8a47c'], rtSkinS: ['#ae7650'], rtMole: ['#3a2418'],
  rtHair: ['#16120f', '#201a16', '#2c2420', '#3a302a'], rtUban: ['#9a968e', '#b2aea6', '#c8c4bc', '#dcd8d0'],
  kopiah: ['#0c0c10', '#141418', '#1c1c22', '#2c2c34'], kopiahG: ['#3a3a44'],
  batikR: ['#5a3a1c', '#6e4822', '#84582c', '#9a6a38'], batikRS: ['#2e1c0c'], batikRK: ['#e0b04a'],
  celanaR: ['#3e3e44', '#4a4a50', '#56565e', '#6a6a72'], selopR: ['#2a1c12', '#36241a', '#443022', '#56402e'],
  bukuR: ['#1e3a6a', '#24467e', '#2c5494', '#3a66aa'], bukuK: ['#f2ecd8'], penaR: ['#c8c8d0'],
  jaketR: ['#2a3a2a', '#324632', '#3a523a', '#4a6448'], sarungR: ['#2a3a6a', '#32447c', '#3c5090', '#4a60a4'], sarungRS: ['#1a2448'], sarungRK: ['#d8d0b0'],
  senter: ['#b8b8c0', '#cacad2', '#dadae2', '#ececf2'], senterL: ['#fff4b0'],
  merah: ['#a81c1c', '#c02424', '#d43030', '#e44848'], putihR: ['#d8d8d4', '#e6e6e2', '#f2f2ee', '#fafaf6'],
  trainR: ['#1a2a4a', '#22345a', '#2a406c', '#3a5282'], handuk: ['#d8d0c0', '#e6dece', '#f2eadc', '#faf4ea'], handukS: ['#c86a4a'],
});

/* ---------- wajah: alis tebal agak beruban, mata ramah, senyum lebar sopan tepat di bawah hidung, tahi lalat di pipi kanan */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'rtSkinS', o: 'rtMole' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, '.........o....', F0, ...mouth, F0, F0];   // 15 baris: alis z 11 (di bawah kopiah), mulut z 4
const BROW = '.BBBB....BBBB.';
const EYE = ['s.KKK....KKK.s', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....m....m....', '.....mmmm.....', F0]),
  kedip: F(BROW, [F0, '.sKKK....KKKs.'], ['....m....m....', '.....mmmm.....', F0]),
  marah: F('...BBB..BBB...', ['..KKK....KKK..', '..WKK....KKW..'], ['....mmmmmm....', F0, F0]),
  teriak: F('.BBBB....BBBB.', ['..KKK....KKK..', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, EYE, ['...mTTTTTTm...', '....mmmmmm....', F0]),
  ketawa: F(BROW, ['s.KK......KK.s', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', '.....mmmm.....']),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-4, -6, 5, 5, 3] : z === 1 ? [-6, -7, 6, 6, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'rtSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'rtSkin'); v.set(7, -1, 4, 'rtSkinS'); v.set(7, 0, 4, 'rtSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'rtSkin'); v.box(-1, y, 6, -1, y, 7, 'rtSkinS'); }
  // rambut pendek rapi, sisi & belakang tipis beruban (hanya kelihatan di bawah kopiah)
  const hair = new Vox();
  for (let z = 6; z <= 14; z++) hair.rrect(z, -8, -8, 7, 7, 'rtHair', 4);
  const zmin = (x, y) => x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 6;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  v.each((x, y, z, c) => { if (c === 'rtHair' && z <= 12 && Math.abs(y + 0.5) > 6.5 && x >= -3) v.set(x, y, z, 'rtUban'); });   // uban rapi di pelipis saja
  if (o.kopiah !== false) {   // kopiah hitam beludru: tabung lonjong tegak, atas rata, garis jahit tipis
    for (let z = 13; z <= 20; z++) for (let x = -9; x <= 8; x++) for (let y = -9; y <= 8; y++) {
      const d = ((x + 0.5) / 8.6) ** 2 + ((y + 0.5) / 8.3) ** 2;
      if (d <= 1 && (d > 0.62 || z >= 19)) v.set(x, y, z, z === 14 ? 'kopiahG' : 'kopiah');
    }
    for (let x = -8; x <= 7; x++) for (let y = -8; y <= 7; y++) if (((x + 0.5) / 8.6) ** 2 + ((y + 0.5) / 8.3) ** 2 <= 1) for (let z = 15; z <= 18; z++) if (!v.has(x, y, z)) v.set(x, y, z, 'kopiah');
    v.each((x, y, z, c) => { if ((c === 'rtHair' || c === 'rtUban') && z >= 13) v.set(x, y, z, null); });
  }
  return v;
}

/* ---------- badan gempal + perut buncit (sisi +y; sisi -y = cermin) */
const bodyC = o => ({ batik: 'batikR', ronda: 'jaketR', kerja: 'merah' }[o.top]);
const parang = (v, c, cS, cK) => {   // batik parang: pita miring berulang, garis tepi gelap, titik emas
  v.each((x, y, z, k) => {
    if (k !== c) return;
    const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + z) % 7 + 7) % 7;
    if (a === 0) v.set(x, y, z, cS); else if (a === 3 && z % 2) v.set(x, y, z, cK);
  });
  return v;
};
function chest(o) {
  const v = new Vox(), T = o.top, body = bodyC(o);
  for (let z = 34; z <= 56; z++) {
    const bel = z > 50 ? 0 : Math.round(5 * Math.sin((z - 31) / 20 * Math.PI)), t = z === 56 ? 1 : 0;
    v.rrect(z, -6, -9 + t, 4 + bel - t, 8 - t, body, 4);
  }
  v.rbox(-3, -3, 57, 2, 2, 60, 'rtSkin', 2);
  if (T === 'batik') {
    parang(v, 'batikR', 'batikRS', 'batikRK');
    for (let z = 35; z <= 55; z++) v.pf(-1, z, 'batikRS');   // kancing depan
    for (let z = 35; z <= 53; z += 4) v.pf(-1, z, 'batikRK');
    for (let y = 2; y <= 6; y++) for (let z = 47; z <= 51; z++) v.pf(y, z, z === 51 ? 'batikRS' : 'batikR');   // saku dada polos
    v.pf(3, 52, 'penaR'); v.pf(3, 53, 'penaR'); v.pf(4, 52, 'bukuR');   // pulpen di saku
    for (let z = 56; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'batikR', 2);   // kerah
    for (let y = -1; y <= 0; y++) for (let z = 55; z <= 56; z++) v.pf(y, z, 'rtSkin');
    return v;
  }
  if (T === 'ronda') {   // jaket parasut hijau tua, ritsleting, kerah tinggi; sarung kotak biru diselempangkan dari bahu kanan
    for (let z = 35; z <= 57; z++) v.pf(-1, z, 'senter');
    for (let z = 57; z <= 59; z++) v.shell(z, -5, -6, 3, 5, 'jaketR', 3);
    for (let z = 34; z <= 59; z++) {
      const t = (z - 34) / 25, y = Math.round(-7 + t * 15);
      for (let dy = -2; dy <= 2; dy++) { const yy = y + dy; if (yy < -10 || yy > 9) continue; const xf = v.front(yy, z), xb = v.back(yy, z); if (xf !== null) v.set(xf + 1, yy, z, 'sarungR'); if (xb !== null) v.set(xb - 1, -1 - yy, z, 'sarungR'); }
    }
    v.each((x, y, z, c) => { if (c === 'sarungR' && (z % 4 === 0 || (y + 40) % 4 === 0)) v.set(x, y, z, z % 8 === 0 ? 'sarungRK' : 'sarungRS'); });
    return v;
  }
  // kerja bakti: kaus merah polos, handuk kecil di leher
  for (let y = -2; y <= 1; y++) v.pf(y, 56, 'rtSkin');
  for (let z = 52; z <= 58; z++) for (let y = -9; y <= 8; y++) {
    if (z >= 57 && Math.abs(y + 0.5) < 3.5) continue;
    const near = Math.abs(y + 0.5) <= 7.5 && Math.abs(y + 0.5) >= 2.5;
    if (!near) continue;
    const xf = v.front(y, Math.min(z, 56)), xb = v.back(y, Math.min(z, 56));
    if (z <= 56 && Math.abs(y + 0.5) <= 4.5 && xf !== null) { v.set(xf + 1, y, z, 'handuk'); }
    if (z >= 57 && xf !== null) for (let x = xb - 1; x <= xf + 1; x++) v.set(x, y, z, 'handuk');
  }
  v.each((x, y, z, c) => { if (c === 'handuk' && (y + 40) % 5 === 0) v.set(x, y, z, 'handukS'); });
  return v;
}
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-6, -8, 28, 5, 7, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'batik') { for (let z = 30; z <= 33; z++) v.shell(z, -7, -10, 6 + (z - 30), 9, 'batikR', 4); parang(v, 'batikR', 'batikRS', 'batikRK'); }   // batik dikeluarkan
  else if (o.top === 'ronda') for (let z = 31; z <= 33; z++) v.shell(z, -7, -10, 7 + (z - 31), 9, z === 31 ? 'jaketR' : 'jaketR', 4);
  else { for (let z = 31; z <= 33; z++) v.shell(z, -7, -10, 6 + (z - 30), 9, 'merah', 4); }
  return v;
}
const legC = o => o.top === 'kerja' ? 'trainR' : 'celanaR';
const sleeveC = o => bodyC(o);
function arm(o) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-3, 8, 43, 3, 14, 55, o.top === 'ronda' ? c : 'rtSkin', 3); v.rrect(56, -3, 8, 3, 14, c, 3);
  if (o.top !== 'ronda') { v.paint(-3, 8, 48, 3, 14, 56, c); v.shell(48, -4, 7, 4, 15, c, 3); }
  if (o.top === 'batik') parang(v, 'batikR', 'batikRS', 'batikRK');
  return v;
}
function fore(o, side) {
  const v = new Vox(), R = o.top === 'ronda';
  v.rbox(-3, 8, 31, 3, 14, 42, R ? 'jaketR' : 'rtSkin', 3);
  v.rbox(-3, 8, 27, 4, 14, 30, 'rtSkin', 3); v.rrect(26, -2, 9, 3, 13, 'rtSkin', 2);
  if (R) v.paint(-3, 8, 31, 3, 14, 31, 'kopiahG');
  if (side < 0 && !R) v.paint(-3, 8, 31, 3, 14, 31, 'penaR');   // jam tangan perak
  if (side < 0 && o.top === 'batik') {   // buku catatan warga biru dijepit di tangan kiri
    v.rbox(-4, 7, 21, 4, 8, 31, 'bukuR', 0); v.paint(-4, 7, 22, 3, 7, 30, 'bukuR'); v.paint(4, 7, 22, 4, 8, 30, 'bukuK');
    for (let z = 23; z <= 29; z += 2) v.set(4, 8, z, 'bukuR');
  }
  if (side > 0 && R) {   // senter di tangan kanan, menyorot ke depan bawah
    v.rbox(2, 10, 27, 9, 12, 29, 'senter', 1); v.paint(9, 10, 27, 9, 12, 29, 'senterL');
  }
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-5, 2, 18, 4, 8, 31, c, 3); v.rrect(32, -4, 2, 3, 8, c, 3); if (o.top === 'kerja') for (let z = 18; z <= 31; z++) v.set(0, 8, z, 'putihR'); return v; }
function shin(o) { const c = legC(o), v = new Vox(); v.rbox(-4, 2, 6, 3, 7, 18, c, 3); v.rrect(19, -3, 2, 2, 7, c, 3); if (o.top === 'kerja') for (let z = 6; z <= 18; z++) v.set(0, 7, z, 'putihR'); return v; }
function foot(o) {
  const v = new Vox();
  if (o.top === 'kerja') {   // sepatu bot karet hitam untuk kerja bakti
    v.rbox(-4, 1, 0, 7, 8, 1, 'kopiah', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'kopiah', 3); v.rbox(-4, 1, 5, 3, 8, 9, 'kopiah', 3); v.paint(-4, 1, 9, 3, 8, 9, 'kopiahG');
    return v;
  }
  v.rbox(-4, 1, 0, 7, 8, 1, 'sole', 3); v.rbox(-4, 1, 2, 7, 8, 3, 'selopR', 3); v.rbox(-4, 2, 4, 2, 7, 5, 'selopR', 2);   // sandal kulit tertutup
  for (let y = 2; y <= 7; y++) v.set(6, y, 3, 'selopR');
  return v;
}

export const OUTFITS = {
  batik: { name: 'Pak RT: kopiah + batik parang lengan pendek + buku catatan warga', top: 'batik' },
  ronda: { name: 'Ronda malam: jaket parasut + sarung diselempang + senter', top: 'ronda' },
  kerja: { name: 'Kerja bakti: kaus merah + celana training + handuk leher + bot karet', top: 'kerja' },
};
export function build(opt = {}) {
  // game memanggil 'seragam': Pak RT memakai batik
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.batik), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'rtSkin', shoulder: sl, elbow: o.top === 'ronda' ? 'jaketR' : 'rtSkin', hip: leg, knee: leg }, SKEL, TAIL);
}
