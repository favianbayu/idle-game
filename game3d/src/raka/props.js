// Properti kecil untuk varian baju (dipakai lewat fx di OUTFITS, lihat dressing() di model.js).
// Semua fungsi menerima Vox bagian badan dan menggambar relatif terhadap bentuk yang sudah ada,
// jadi bisa dipakai di tokoh mana pun tanpa tahu angka rangkanya.
import { addRamps } from './model.js';

addRamps({
  prRaket: ['#1d3f8a', '#2a56b4', '#3b70d6', '#5a8cec'], prSenar: ['#e9eef4'], prGrip: ['#f4f4f0'],
  prPayung: ['#1f3e86', '#2a52a8', '#3a68c8', '#5584dc'], prPayungH: ['#151517', '#1f1f23', '#2b2b31', '#3a3a42'], prGagang: ['#6a4a2c'],
  prKayu: ['#a77a45', '#c49359', '#dcab6e', '#ecc387'], prKertas: ['#f3efe2'], prSampul: ['#2c3e6a'],
  prPeluit: ['#c9ccd4'], prTali: ['#c43a2e'], prKartu: ['#f6f6f2'], prKartuT: ['#1f8ad0'],
  prPlastik: ['#b9c8cf', '#d2dde2', '#e6eef1', '#f5f9fa'], prBola: ['#d96a1f'], prKipas: ['#b8322b', '#d4473a', '#e86352', '#f2846f'],
  prTas: ['#2b2b2b', '#3a3a3a', '#4b4b4b', '#5e5e5e'], prKoin: ['#d8b54a'], prRadio: ['#1c1d22'], prAntena: ['#3a3b42'],
  prTasbih: ['#7a4e2a'], prLampu: ['#f2c14a'], prKaca: ['#ffe9a0'],
  prKresek: ['#7fa6bc', '#98bccf', '#b3d0de', '#cfe3ec'], prKresekS: ['#7fa6bc'],
  prHanduk: ['#c8c4b8', '#dcd8cc', '#ecE8dc', '#f8f6ee'], prHandukS: ['#c0584a'], prGlove: ['#6a5a3a', '#7e6c48', '#92805a', '#a8966e'],
  prPonco: ['#c99a14', '#e2b522', '#f2cb3a', '#fadf6e'], prPoncoS: ['#c99a14'], prPoncoH: ['#141518', '#1d1f24', '#292c33', '#3a3e48'], prPoncoHS: ['#1d1f24'],
});

// titik genggam: tengah voxel paling bawah (ujung kepalan)
export function hand(v) {
  let z0 = 1e9; v.each((x, y, z) => { if (z < z0) z0 = z; });
  let sx = 0, sy = 0, n = 0; v.each((x, y, z) => { if (z <= z0 + 1) { sx += x; sy += y; n++; } });
  return [Math.round(sx / n), Math.round(sy / n), z0];
}
// batas kotak sebuah Vox
export function bounds(v) {
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  v.each((x, y, z) => { const p = [x, y, z]; for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], p[i]); hi[i] = Math.max(hi[i], p[i]); } });
  return [lo, hi];
}
// hapus semua voxel berbahan tertentu
export function strip(v, ...mats) { const k = []; v.each((x, y, z, c) => { if (mats.includes(c)) k.push([x, y, z]); }); for (const p of k) v.set(...p, null); return v; }

// raket badminton digenggam, kepala raket menggantung ke bawah di samping kaki
export function raket(v) {
  const [x, y, z] = hand(v);
  for (let k = 1; k <= 7; k++) v.set(x, y, z - k, k <= 4 ? 'prGrip' : 'prRaket');
  const cz = z - 15;
  for (let a = -5; a <= 5; a++) for (let b = -7; b <= 7; b++) {
    const r = (a / 4.6) ** 2 + (b / 6.6) ** 2;
    if (r <= 1.05 && r >= 0.62) v.set(x + a, y, cz + b, 'prRaket'); else if (r < 0.62 && (a + b) % 2 === 0) v.set(x + a, y, cz + b, 'prSenar');
  }
  return v;
}
// payung lipat tergulung digenggam
export function payungLipat(v, c = 'prPayung', panjang = 12) {
  const [x, y, z] = hand(v);
  for (let k = 1; k <= panjang; k++) { v.set(x, y, z - k, k <= 3 ? 'prGagang' : c); if (k > 3 && k < panjang - 1) v.set(x + 1, y, z - k, c); }
  v.set(x, y, z - panjang - 1, 'prAntena');
  return v;
}
// penggaris kayu panjang
export function penggaris(v) { const [x, y, z] = hand(v); for (let k = -6; k <= 16; k++) { v.set(x + 1, y, z + 1 - k, 'prKayu'); v.set(x + 2, y, z + 1 - k, k % 4 === 0 ? 'prSampul' : 'prKayu'); } return v; }
// buku / buku catatan di tangan
export function buku(v, c = 'prSampul') { const [x, y, z] = hand(v); v.box(x - 3, y - 1, z - 7, x + 3, y + 1, z, c); v.box(x - 2, y - 1, z - 6, x + 2, y + 1, z - 1, 'prKertas'); v.box(x - 3, y - 1, z - 7, x + 3, y - 1, z, c); return v; }
// kipas lipat terbuka
export function kipas(v) {
  const [x, y, z] = hand(v);
  for (let a = -6; a <= 6; a++) for (let b = 0; b <= 8; b++) { const d = Math.hypot(a, b); if (d <= 8 && d >= 2 && b >= Math.abs(a) * 0.4) v.set(x + a, y, z - 1 - b, (a + 8) % 3 ? 'prKipas' : 'prKayu'); }
  return v;
}
// kantong plastik berisi bola
export function kantongBola(v) {
  const [x, y, z] = hand(v);
  for (let k = 1; k <= 3; k++) v.set(x, y, z - k, 'prPlastik');
  for (let a = -5; a <= 5; a++) for (let b = -5; b <= 5; b++) for (let c = -5; c <= 5; c++) { const d = Math.hypot(a, b, c); if (d <= 5.3) v.set(x + a, y + b, z - 9 + c, d > 4.3 ? (a + c) % 3 ? 'prPlastik' : 'prBola' : 'prBola'); }
  return v;
}
// peluit di leher: tali merah dari kerah turun ke dada, peluit perak
export function peluit(v, zTop, zEnd) {
  for (let z = zEnd; z <= zTop; z++) { const t = (zTop - z) / Math.max(1, zTop - zEnd), dy = Math.round(4 * (1 - t)); for (const y of [-1 - dy, dy]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'prTali'); } }
  const x = v.front(0, zEnd - 1) ?? v.front(0, zEnd); if (x !== null) { v.box(x + 1, -1, zEnd - 3, x + 2, 0, zEnd - 1, 'prPeluit'); }
  return v;
}
// kartu ID tergantung tali di dada
export function kartu(v, zTop, zEnd, tali = 'prKartuT') {
  for (let z = zEnd; z <= zTop; z++) { const t = (zTop - z) / Math.max(1, zTop - zEnd), dy = Math.round(4 * (1 - t)); for (const y of [-1 - dy, dy]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, tali); } }
  for (let z = zEnd - 5; z <= zEnd - 1; z++) for (let y = -2; y <= 1; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === zEnd - 1 ? tali : 'prKartu'); }
  return v;
}
// tas pinggang di depan perut
export function tasPinggang(v, zMid) {
  for (let z = zMid - 2; z <= zMid + 2; z++) for (let y = -4; y <= 3; y++) { const x = v.front(y, z); if (x !== null) { v.set(x + 1, y, z, 'prTas'); if (Math.abs(z - zMid) <= 1 && Math.abs(y + 0.5) < 3) v.set(x + 2, y, z, z === zMid + 1 && y === 0 ? 'prKoin' : 'prTas'); } }
  for (let y = -12; y <= 11; y++) { const x = v.front(y, zMid + 1); if (x !== null && v.get(x, y, zMid + 1) !== 'prTas') v.set(x, y, zMid + 1, 'prTas'); }
  return v;
}
// tudung jas hujan / hoodie: selapis kain di luar kepala, wajah tetap terbuka
export function tudung(v, c, cS = c) {
  const [lo, hi] = bounds(v), add = [], fx = hi[0] - 4, zFace = hi[2] - 4;
  v.each((x, y, z) => {
    for (const [dx, dy, dz] of [[-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [1, 0, 0]]) {
      const X = x + dx, Y = y + dy, Z = z + dz;
      if (v.has(X, Y, Z)) continue;
      if (dx === 1 && (x < fx || z <= zFace) && z <= zFace + 1) continue;   // jangan menutup muka
      if (x >= fx - 1 && z <= zFace && Math.abs(y + 0.5) < (hi[1] - lo[1]) / 2 - 1) continue;
      if (z < lo[2] + 2) continue;
      add.push([X, Y, Z]);
    }
  });
  for (const p of add) v.set(...p, c);
  for (let y = lo[1]; y <= hi[1]; y++) { const x = v.front(y, zFace + 2); if (x !== null && v.get(x, y, zFace + 2) === c) v.set(x, y, zFace + 2, cS); }
  return v;
}
// bungkus plastik di atas punggung (gitar / tas)
export function bungkusPunggung(v, z0, z1, w = 5, tebal = 4) {
  const [lo] = bounds(v);
  for (let z = z0; z <= z1; z++) for (let y = -w; y <= w - 1; y++) for (let k = 1; k <= tebal; k++) v.set(lo[0] - k, y, z, (y + z) % 5 === 0 && k === tebal ? 'prPlastik' : k === tebal || Math.abs(y + 0.5) > w - 1.5 ? 'prPlastik' : 'prPlastik');
  return v;
}
// lampu minyak (teplok) digenggam
export function lampuMinyak(v) { const [x, y, z] = hand(v); v.set(x, y, z - 1, 'prAntena'); v.box(x - 2, y - 2, z - 7, x + 2, y + 2, z - 6, 'prAntena'); v.box(x - 1, y - 1, z - 5, x + 1, y + 1, z - 2, 'prKaca'); v.set(x, y, z - 4, 'prLampu'); return v; }
// tasbih tergantung dari genggaman
export function tasbih(v) { const [x, y, z] = hand(v); for (let k = 1; k <= 7; k++) v.set(x + (k > 4 ? 1 : 0), y, z - k, 'prTasbih'); return v; }
// selapis kain luar (ponco, jas) di atas bagian badan yang ada, dari zLo sampai zHi
export function lapis(v, c, zLo = -1e9, zHi = 1e9, sisi = [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  const add = [];
  v.each((x, y, z) => { if (z < zLo || z > zHi) return; for (const [dx, dy] of sisi) if (!v.has(x + dx, y + dy, z)) add.push([x + dx, y + dy, z]); });
  for (const p of add) v.set(...p, c);
  return v;
}
// lengan panjang: cat ulang lengan bawah dari z0 ke atas (tangan di bawah z0 tetap kulit)
export function lengan(v, c, z0, cuff) { v.each((x, y, z) => { if (z >= z0) v.set(x, y, z, z === z0 && cuff ? cuff : c); }); return v; }
// cat ulang semua voxel dalam rentang z (celana panjang di betis, kaus kaki, dsb.)
export function catZ(v, c, z0, z1, kecuali = []) { v.each((x, y, z, m) => { if (z >= z0 && z <= z1 && !kecuali.includes(m)) v.set(x, y, z, c); }); return v; }
// motif kotak-kotak (sarung, kemeja kotak): cat ulang semua voxel bahan tertentu
export function motifKotak(v, a, b, n = 3, hanya = null) { v.each((x, y, z, c) => { if (hanya && !hanya.includes(c)) return; v.set(x, y, z, (Math.floor((x + 64) / n) + Math.floor((y + 64) / n) + Math.floor((z + 64) / n)) % 2 ? a : b); }); return v; }
// jas / blazer: selapis di luar badan z0..z1, dengan bukaan V di depan (isi di dalam tetap terlihat)
export function jas(v, c, z0, z1, vLo, cS = c) {
  lapis(v, c, z0, z1);
  for (let z = vLo; z <= z1; z++) { const w = Math.floor((z - vLo) / 2.2); for (let y = -1 - w; y <= w; y++) { const x = v.front(y, z); if (x !== null && v.get(x, y, z) === c) { v.set(x, y, z, null); const x2 = v.front(y, z); if (x2 !== null && x2 < x - 1) v.set(x - 1, y, z, cS); } } for (const y of [-2 - w, w + 1]) { const x = v.front(y, z); if (x !== null && v.get(x, y, z) === c) v.set(x, y, z, cS); } }
  return v;
}
// ganti semua voxel (kecuali bahan tertentu) jadi satu bahan
export function semua(v, c, kecuali = []) { v.each((x, y, z, m) => { if (!kecuali.includes(m)) v.set(x, y, z, c); }); return v; }
// handuk kecil tersampir di bahu (sisi s = 1 kanan / -1 kiri), menjuntai di depan & belakang
export function handukBahu(v, c = 'prHanduk', s = 1, cS = 'prHandukS') {
  const [lo, hi] = bounds(v), y0 = s > 0 ? hi[1] - 4 : lo[1] + 1, y1 = y0 + 3;
  for (let y = y0; y <= y1; y++) {
    let top = -1e9; v.each((x, yy, z) => { if (yy === y && z > top) top = z; });
    if (top < -1e8) continue;
    for (let x = lo[0] - 1; x <= hi[0] + 1; x++) v.set(x, y, top + 1, c);
    for (let z = top - 9; z <= top; z++) { const m = z === top - 9 || z === top - 7 ? cS : c, xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf + 1, y, z, m); if (xb !== null) v.set(xb - 1, y, z, m); }
  }
  return v;
}
