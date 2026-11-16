// Papan nama toko, spanduk, dan LED berjalan ala pertokoan Indonesia.
// Semua tulisan digambar sekali ke satu atlas kanvas (NearestFilter, supaya tetap bergaya piksel),
// lalu tiap papan = satu quad bertekstur. LED berjalan memakai atlas kedua yang digeser di shader.
import * as THREE from 'three';
import { hash, pick } from './common.js';

/* ------------------------------------------------------------------ isi papan */
// [judul, keterangan, warna latar, warna huruf, aksen]
export const SHOPS = [
  ['FOTOKOPI', 'JILID • LAMINASI', '#1f5fb8', '#ffffff', '#f2c230'],
  ['SERVICE HP', 'PULSA • AKSESORIS', '#e8e8e4', '#d0282e', '#1a1a1a'],
  ['APOTEK', 'SEHAT SENTOSA', '#ffffff', '#1f8a4a', '#1f8a4a'],
  ['BENGKEL MOTOR', 'TAMBAL BAN • OLI', '#f2c230', '#1a1a1a', '#d0282e'],
  ['LAUNDRY KILOAN', 'CUCI SETRIKA 1 HARI', '#3ab0d8', '#ffffff', '#ffffff'],
  ['RM PADANG', 'SALERO BUNDO', '#d0282e', '#f2d23a', '#f2d23a'],
  ['BAKSO MIE AYAM', 'PAK KUMIS', '#f6f2e6', '#c82a2a', '#2a7a3a'],
  ['TOKO EMAS', 'CAHAYA MULIA', '#b8141e', '#f6d24a', '#f6d24a'],
  ['TOKO BANGUNAN', 'SUMBER REJEKI', '#2a7a3a', '#ffffff', '#f2c230'],
  ['WARUNG KOPI', 'KOPI SUSU • GORENGAN', '#3a2418', '#f2d29a', '#e8823a'],
  ['AYAM GEPREK', 'SAMBEL LEVEL 1-10', '#f28a1a', '#ffffff', '#7a1a0a'],
  ['KLINIK GIGI', 'DRG. WULAN SARI', '#ffffff', '#2a6ac0', '#2a6ac0'],
  ['BIMBEL PINTAR', 'SD SMP SMA UTBK', '#2a3a8a', '#f2c230', '#ffffff'],
  ['BARBERSHOP', 'CUKUR RAPI • 25RB', '#1a1a1e', '#ffffff', '#d0282e'],
  ['OPTIK', 'MATA JERNIH', '#f2f2ee', '#1a3a7a', '#d0282e'],
  ['TOKO KELONTONG', 'BERKAH JAYA', '#e85a2a', '#ffffff', '#f2d23a'],
  ['ELEKTRONIK', 'TV • KULKAS • SERVIS', '#1a2a5a', '#7ad8ff', '#ffffff'],
  ['SALON MUSLIMAH', 'RIAS • CREAMBATH', '#e88ab8', '#ffffff', '#7a1a4a'],
  ['PERCETAKAN', 'UNDANGAN • SPANDUK', '#7a2a9a', '#ffffff', '#f2c230'],
  ['ES TEH JUMBO', 'CUMA 5RB!', '#f2d23a', '#2a5a1a', '#d0282e'],
  ['MARTABAK', 'MANIS & TELOR', '#f6e6c0', '#8a2a0a', '#d0282e'],
  ['SEMBAKO', 'BERAS • MINYAK • GULA', '#2a5aa8', '#ffffff', '#f2c230'],
  ['GAS & GALON', 'ANTAR GRATIS', '#3a9a5a', '#ffffff', '#ffffff'],
  ['ATK', 'ALAT TULIS', '#f6f6f2', '#e85a2a', '#2a6ac0'],
  ['DISTRO', 'KAOS • HOODIE', '#1a1a1e', '#f2f2f2', '#3ab0d8'],
  ['PET SHOP', 'MAKANAN KUCING', '#f2a8c0', '#4a2a6a', '#ffffff'],
  ['KOPI KEKINIAN', 'KOPI GULA AREN', '#e8dcc8', '#4a2a1a', '#2a6a3a'],
  ['TOKO SEPATU', 'SEPATU SEKOLAH', '#c83a3a', '#ffffff', '#1a1a1a'],
  ['PECEL LELE', 'LAMONGAN', '#f6f2e6', '#2a6a2a', '#d0282e'],
  ['MATERIAL', 'PASIR SEMEN BATA', '#8a6a3a', '#ffffff', '#f2c230'],
  ['HOTEL MELATI', 'KAMAR AC • HARIAN', '#2a3a5a', '#f2d23a', '#ffffff'],
  ['KOS PUTRI', 'MASIH ADA KAMAR', '#f6f2e6', '#c83a6a', '#2a2a2a'],
];
export const BANNERS = [
  ['PROMO MERDEKA!', 'DISKON 17% SEMUA', '#d0282e', '#ffffff'],
  ['TERIMA SERVIS', 'SEGALA MERK', '#ffffff', '#1f5fb8'],
  ['SEDIA PULSA', 'TOKEN • PAKET DATA', '#f2d23a', '#c8141e'],
  ['DIJUAL CEPAT', 'HUB 0812-3456-789', '#ffffff', '#d0282e'],
  ['DIKONTRAKKAN', 'HUB 0857-1122-334', '#ffffff', '#1a1a1a'],
  ['BUKA 24 JAM', 'MELAYANI SEPENUH HATI', '#1f8a4a', '#ffffff'],
  ['TERIMA PESANAN', 'NASI KOTAK • TUMPENG', '#f6e6c0', '#8a2a0a'],
  ['GRAND OPENING', 'BELI 1 GRATIS 1', '#d0282e', '#f2d23a'],
  ['LOWONGAN KERJA', 'DIBUTUHKAN SEGERA', '#f2d23a', '#1a1a1a'],
  ['PENERIMAAN SISWA BARU', 'DAFTAR SEKARANG!', '#2a3a8a', '#ffffff'],
  ['CUCI MOTOR', 'SALJU • 15RB', '#3ab0d8', '#ffffff'],
  ['MENERIMA', 'JAHIT • PERMAK JEANS', '#ffffff', '#7a2a9a'],
];
export const LEDS = [
  ['SELAMAT DATANG • BUKA 24 JAM • ', '#ff3a2a'], ['SERVICE HP • GANTI LCD • FLASHING • ', '#ff3a2a'],
  ['FOTOKOPI WARNA • JILID • LAMINASI • ', '#ffb21a'], ['PROMO HARI INI DISKON 50% • ', '#3aff5a'],
  ['PULSA • KUOTA • TOKEN PLN • ', '#ff3a2a'], ['OPEN • OPEN • ', '#ff3a2a'], ['APOTEK BUKA 24 JAM • ', '#3aff5a'],
  ['TERIMA KASIH ATAS KUNJUNGAN ANDA • ', '#ffb21a'], ['BELI 2 GRATIS 1 • HEMAT • ', '#3aff5a'],
];
// minimarket parodi
export const PLACE_SIGNS = [
  ['gor', 'GOR KOTA', 'WIRABUMI', '#1f4f8a', '#ffffff', '#f6c81a'], ['kolam', 'KOLAM RENANG', 'UMUM • 5RB', '#2a8ac8', '#ffffff', '#ffffff'],
  ['tpu', 'TPU BHAKTI', 'PEMAKAMAN UMUM', '#2a3a2a', '#f2eee0', '#c8c0a0'], ['loak', 'PASAR LOAK', 'BARANG BEKAS', '#8a3a1a', '#f6e0a0', '#f6c81a'],
  ['es', 'PABRIK ES', 'SALJU ABADI', '#6a6a62', '#c8c4b4', '#8a5a3a'], ['terminal', 'TERMINAL BUS', 'ANTARKOTA', '#1a5a3a', '#ffffff', '#f6c81a'],
  ['pancing', 'PEMANCINGAN', 'PAK HAJI', '#2a6a8a', '#ffffff', '#f6c81a'], ['kemah', 'BUMI PERKEMAHAN', 'HUTAN PINUS', '#5a3a1a', '#f6e8c0', '#c8a060'],
  ['curug', 'CURUG CEMARA', 'HATI-HATI LICIN', '#4a3a24', '#f6e8c0', '#e0b050'], ['gua', 'GUA KAPUR', 'AWAS BATU LICIN', '#4a3a24', '#f6e8c0', '#e04a3a'],
  ['jembatan', 'JEMBATAN TIMUR', 'PT GRAHA MEGANTARA', '#3a3a40', '#f2f2ee', '#e0b84a'], ['rakit', 'RAKIT', 'SEKALI NYEBRANG 2RB', '#6a4a24', '#ffffff', '#f6c81a'],
  ['kandang', 'KANDANG SAPI', 'NENEK SARI', '#6a4a24', '#f6e8c0', '#c8a060'], ['pondok', 'DILARANG MASUK', '', '#c8c0a8', '#b82a2a', '#b82a2a'],
  ['bengkel', 'BENGKEL', 'MAS FAJAR', '#1a1a1a', '#f6c81a', '#f6c81a'], ['markas', 'LAMPU KOTA', '', '#1a1a1a', '#f6c81a', '#f6c81a'],
  ['warkop', 'WARKOP SIMPANG', 'KOPI • GORENGAN', '#2f6a3a', '#ffffff', '#f6c81a'],
];
// warung kelontong (R7): tiap warung punya pemilik sendiri. [papan, keterangan, latar, huruf, aksen, sid NPC, nama pemilik]
// indeks 0 = Warung Bu Ijah (yang paling dekat rumah Om Darto), sisanya dibagi ke warung lain
export const WARUNGS = [
  ['WARUNG BU IJAH', 'GAS • GALON • PULSA', '#e85a2a', '#ffffff', '#f2d23a', 'ibuDaster', 'Bu Ijah'],
  ['WARUNG PAK SLAMET', 'SEMBAKO • ES BATU', '#2a6a3a', '#ffffff', '#f2d23a', 'bapakPeci', 'Pak Slamet'],
  ['WARUNG MADURA', 'CAK MAMAT • BUKA 24 JAM', '#1a5a2a', '#ffffff', '#e8302a', 'pemuda', 'Cak Mamat'],
  ['WARUNG MBAK WULAN', 'JAJANAN • ES DINGIN', '#e88ab8', '#ffffff', '#7a1a4a', 'mbak', 'Mbak Wulan'],
  ['TOKO SINAR JAYA', 'KOH LIEM • SEMBAKO', '#b8141e', '#f6d24a', '#f6d24a', 'kakek', 'Koh Liem'],
  ['WARUNG BU ROMLAH', 'BERAS • MINYAK • GULA', '#2a5aa8', '#ffffff', '#f2c230', 'ibuHijab', 'Bu Romlah'],
  ['WARUNG PAK KARDI', 'KOPI • GORENGAN', '#3a2418', '#f2d29a', '#e8823a', 'pakRT', 'Pak Kardi'],
  ['WARUNG BU DARSIH', 'NASI UDUK PAGI', '#f6f2e6', '#2a6a2a', '#d0282e', 'ibuHijab2', 'Bu Darsih'],
  ['WARUNG MAK ONAH', 'TERIMA TITIP KUE', '#f2c230', '#5a2a0a', '#d0282e', 'ibuDaster', 'Mak Onah'],
  ['WARUNG MAS JOKO', 'PULSA • KUOTA', '#1a2a5a', '#7ad8ff', '#ffffff', 'pemuda', 'Mas Joko'],
  ['WARUNG BU YATI', 'ES TEH • MIE REBUS', '#c8782a', '#ffffff', '#3a2418', 'ibuHijab', 'Bu Yati'],
  ['WARUNG PAK DARNO', 'GAS & GALON ANTAR', '#3a9a5a', '#ffffff', '#ffffff', 'bapakPeci', 'Pak Darno'],
  ['WARUNG MBAK TINI', 'JAJANAN ANAK', '#f28a1a', '#ffffff', '#7a1a0a', 'remaja', 'Mbak Tini'],
  ['WARUNG BU SRI', 'SAYUR • BUMBU DAPUR', '#5a8a3a', '#ffffff', '#f2d23a', 'ibuHijab2', 'Bu Sri'],
  ['WARUNG MBAH MIN', 'SEDIA SEGALA', '#8a6a3a', '#ffffff', '#f2c230', 'kakek', 'Mbah Min'],
  ['WARUNG BU TUTI', 'ES BUAH • KOLAK', '#d0282e', '#f2d23a', '#f2d23a', 'ibuDaster', 'Bu Tuti'],
  ['WARUNG MADURA', 'CAK SHOLEH • 24 JAM', '#1a5a2a', '#ffffff', '#f2d23a', 'pemuda', 'Cak Sholeh'],
  ['WARUNG BU NINING', 'ATK • FOTOKOPI', '#f6f6f2', '#e85a2a', '#2a6ac0', 'ibuHijab', 'Bu Nining'],
  ['WARUNG PAK KARTO', 'ROKOK • KOPI • ES', '#4a3a24', '#f6e8c0', '#e0b050', 'bapakPeci', 'Pak Karto'],
  ['WARUNG MBAK YUNI', 'SEBLAK • CIMOL', '#c83a6a', '#ffffff', '#f2d23a', 'mbak', 'Mbak Yuni'],
  ['WARUNG BU WARSIH', 'BERAS • TELUR', '#2a3a8a', '#f2c230', '#ffffff', 'ibuHijab2', 'Bu Warsih'],
  ['WARUNG PAK HARJO', 'TAMBAL BAN • BENSIN', '#f2c230', '#1a1a1a', '#d0282e', 'pakRT', 'Pak Harjo'],
  ['WARUNG BU ENDANG', 'LOTEK • GADO-GADO', '#6a8a3a', '#ffffff', '#f2d23a', 'ibuDaster', 'Bu Endang'],
  ['WARUNG MAS AGUS', 'ES KOPI SUSU', '#e8dcc8', '#4a2a1a', '#2a6a3a', 'pemuda', 'Mas Agus'],
  ['WARUNG BU MARNI', 'GORENGAN ANGET', '#e8a040', '#3a2418', '#d0282e', 'ibuHijab', 'Bu Marni'],
  ['WARUNG BU KOKOM', 'SEMBAKO MURAH', '#3ab0d8', '#ffffff', '#ffffff', 'ibuHijab2', 'Bu Kokom'],
  ['WARUNG MBAK LINA', 'MINUMAN DINGIN', '#7a2a9a', '#ffffff', '#f2c230', 'mbak', 'Mbak Lina'],
  ['WARUNG MBAH WAGI', 'KOPI TUBRUK', '#5a3a22', '#f2d29a', '#f2d29a', 'kakek', 'Mbah Wagi'],
];
export const MM = { name: 'Indomurah', tag: 'MUDAH • MURAH • DEKAT', blue: '#1f4fb0', red: '#d8202a', yellow: '#f6c81a' };

/* ------------------------------------------------------------------ atlas kanvas */
// Huruf piksel 5x7 (tiap baris 5 bit) digambar kotak-kotak tanpa antialias, jadi tetap tajam di layar beresolusi rendah.
// Atlas punya mipmap buatan sendiri: tiap level digambar ulang dengan huruf piksel separuh ukuran (bukan diperkecil
// dengan filter), sehingga tulisan tetap tajam dari dekat maupun jauh; teks yang terlalu kecil di level itu dilewati.
const FONT = {'A':15621670449,'B':32801506878,'C':15620129326,'D':32801080894,'E':33840644639,'F':33840644624,'G':15620359727,'H':18842895921,'I':15170932878,'J':7585466956,'K':18879369809,'L':17734058527,'M':19182306865,'N':18850958897,'O':15621211694,'P':32801505808,'Q':15621215821,'R':32801509969,'S':16660235326,'T':33424543876,'U':18842437166,'V':18842436932,'W':18842572458,'X':18834663985,'Y':18834657412,'Z':33321787935,'0':15623448110,'1':4701950094,'2':15603929375,'3':32247317566,'4':2359917634,'5':33854359086,'6':6728664622,'7':33321787656,'8':15621113390,'9':15621129292,' ':0,'.':396,',':12424,'!':4433514500,'?':15603929092,'%':27718197619,'&':13510137421,'-':1015808,'+':139432064,':':415248768,'/':1143087376,'\'':4437573632,'(':2290360450,')':8726317192,'•':15153152};
const CW = 256, CH = 48, COLS = 8, LEVELS = 4;
let ATLAS = null, LEDA = null;
function cellXY(i) { return [(i % COLS) * CW, Math.floor(i / COLS) * CH]; }
// teks piksel: (cx, top) di satuan level 0, sMax = skala huruf maksimum (texel per piksel huruf), k = skala level mipmap
function scaleFor(text, maxW, sMax) { let s = sMax; while (s > 1 && text.length * 6 * s - s > maxW) s--; return s; }
function ptext(g, ox, oy, k, text, cx, top, maxW, sMax, color, o = {}) {
  text = text.toUpperCase(); const s0 = o.s || scaleFor(text, maxW, sMax); let S = Math.floor(s0 * k);
  g.fillStyle = color;
  if (S < 1) {
    if (text.length * 6 - 1 <= CW * k - 2 && s0 * k >= 0.5) S = 1;   // masih muat dengan huruf 1 piksel
    else { if (s0 * k >= 0.5) { const W = (text.length * 6 * s0 - s0) * k; g.fillRect(Math.round(ox + cx * k - (o.left ? 0 : W / 2)), Math.round(oy + (top + 2.5 * s0) * k), Math.max(1, Math.round(W)), Math.max(1, Math.round(2 * s0 * k))); } return s0; }   // terlalu kecil: garis tulisan
  }
  const W = text.length * 6 * S - S, x0 = Math.round(ox + cx * k - (o.left ? 0 : W / 2)), y0 = Math.round(oy + top * k + (7 * s0 * k - 7 * S) / 2);
  for (let c = 0; c < text.length; c++) { const n = FONT[text[c]] ?? FONT['?'];
    for (let r = 0; r < 7; r++) for (let b = 0; b < 5; b++) if ((n >> ((6 - r) * 5 + (4 - b))) & 1) g.fillRect(x0 + (c * 6 + b) * S, y0 + r * S, S, S); }
  return s0;
}
// teks tegak (papan vertikal): huruf berderet ke kanan di kanvas, tiap huruf diputar (atas huruf = kiri kanvas)
function vtext(g, ox, oy, k, text, color) {
  const s0 = Math.min(8, Math.floor((CW - 8) / (text.length * 8))), S = Math.floor(s0 * k); if (S < 1) return; g.fillStyle = color;
  const adv = 8 * S, x0 = Math.round(ox + (CW * k - text.length * adv + S) / 2), yb = Math.round(oy + (CH * k + 5 * S) / 2);
  for (let c = 0; c < text.length; c++) { const n = FONT[text[c]] ?? 0;
    for (let r = 0; r < 7; r++) for (let b = 0; b < 5; b++) if ((n >> ((6 - r) * 5 + (4 - b))) & 1) g.fillRect(x0 + c * adv + r * S, yb - (b + 1) * S, S, S); }
}
function buildAtlas() {
  const cells = [], add = fn => { cells.push(fn); return cells.length - 1; };
  const idx = { shop: [], banner: [], vert: [], mm: {}, parkir: 0 };
  // R(g, ox, oy, k, x, y, w, h, color): kotak di satuan level 0, dibulatkan ke piksel level k
  const R = (g, ox, oy, k, x, y, w, h, c) => { g.fillStyle = c; const X = Math.round(ox + x * k), Y = Math.round(oy + y * k); g.fillRect(X, Y, Math.max(1, Math.round(ox + (x + w) * k) - X), Math.max(1, Math.round(oy + (y + h) * k) - Y)); };
  for (const [t, sub, bg, fg, ac] of SHOPS) idx.shop.push(add((g, ox, oy, k) => {
    R(g, ox, oy, k, 0, 0, CW, CH, bg); R(g, ox, oy, k, 0, 0, CW, 2, ac);
    const icon = t === 'APOTEK' || t === 'KLINIK GIGI';
    if (icon) { R(g, ox, oy, k, 8, 12, 20, 8, '#1f8a4a'); R(g, ox, oy, k, 14, 6, 8, 20, '#1f8a4a'); }
    const s = scaleFor(t, CW - (icon ? 40 : 8), 4);
    ptext(g, ox, oy, k, t, icon ? CW / 2 + 16 : CW / 2, 4 + (28 - 7 * s) / 2, 0, 4, fg, { s });
    ptext(g, ox, oy, k, sub, CW / 2, 34, CW - 6, 2, ac === bg ? fg : ac);
  }));
  for (const [t, sub, bg, fg] of BANNERS) idx.banner.push(add((g, ox, oy, k) => {
    R(g, ox, oy, k, 0, 0, CW, CH, bg); R(g, ox, oy, k, 0, 0, 4, CH, fg); R(g, ox, oy, k, CW - 4, 0, 4, CH, fg);
    const s = scaleFor(t, CW - 14, 4); ptext(g, ox, oy, k, t, CW / 2, 3 + (28 - 7 * s) / 2, 0, 4, fg, { s });
    ptext(g, ox, oy, k, sub, CW / 2, 34, CW - 12, 2, bg === '#ffffff' ? '#d0282e' : fg);
  }));
  for (const [t, bg, fg] of [['HOTEL', '#2a3a5a', '#f2d23a'], ['KOS', '#f6f2e6', '#c83a6a'], ['PULSA', '#e8e8e4', '#d0282e'], ['APOTEK', '#ffffff', '#1f8a4a']])
    idx.vert.push(add((g, ox, oy, k) => { R(g, ox, oy, k, 0, 0, CW, CH, bg); vtext(g, ox, oy, k, t, fg); }));
  idx.mm.logo = add((g, ox, oy, k) => {
    R(g, ox, oy, k, 0, 0, CW, CH, '#ffffff'); R(g, ox, oy, k, 0, 0, CW, 4, MM.red); R(g, ox, oy, k, 0, 4, CW, 2, MM.yellow);
    ptext(g, ox, oy, k, MM.name, CW / 2, 9, CW - 8, 4, MM.blue); ptext(g, ox, oy, k, MM.tag, CW / 2, 38, CW - 8, 1, MM.red, { s: 1 });
  });
  idx.mm.stripe = add((g, ox, oy, k) => { R(g, ox, oy, k, 0, 0, CW, 16, MM.blue); R(g, ox, oy, k, 0, 16, CW, 16, MM.yellow); R(g, ox, oy, k, 0, 32, CW, 16, MM.red); });
  idx.mm.promo = add((g, ox, oy, k) => {
    R(g, ox, oy, k, 0, 0, CW, CH, MM.yellow); ptext(g, ox, oy, k, 'HEMAT MINGGU INI!', CW / 2, 6, CW - 8, 4, MM.red);
    ptext(g, ox, oy, k, 'MINYAK • BERAS • SUSU', CW / 2, 34, CW - 8, 2, MM.blue);
  });
  idx.parkir = add((g, ox, oy, k) => {
    R(g, ox, oy, k, 0, 0, CW, CH, '#1f4fb0'); R(g, ox, oy, k, 4, 4, 40, 40, '#ffffff'); ptext(g, ox, oy, k, 'P', 24, 10, 40, 4, '#1f4fb0');
    ptext(g, ox, oy, k, 'PARKIR', 48 + (CW - 48) / 2, 4, CW - 54, 4, '#ffffff'); ptext(g, ox, oy, k, 'MOTOR 2RB MOBIL 5RB', 48 + (CW - 48) / 2, 34, CW - 54, 2, '#ffffff');
  });
  idx.bank = add((g, ox, oy, k) => {
    R(g, ox, oy, k, 0, 0, CW, CH, '#f6f6f2'); R(g, ox, oy, k, 6, 8, 32, 32, '#0a5a9a'); R(g, ox, oy, k, 14, 16, 16, 16, '#f6a81a');
    ptext(g, ox, oy, k, 'BANK BINA', 44 + (CW - 44) / 2, 4, CW - 50, 4, '#0a5a9a'); ptext(g, ox, oy, k, 'RAKYAT', 44 + (CW - 44) / 2, 34, CW - 50, 2, '#f6a81a');
  });
  idx.atm = add((g, ox, oy, k) => { R(g, ox, oy, k, 0, 0, CW, CH, '#1a3a8a'); ptext(g, ox, oy, k, 'ATM 24 JAM', CW / 2, 10, CW - 8, 4, '#f6c81a'); });
  idx.open = add((g, ox, oy, k) => { R(g, ox, oy, k, 0, 0, CW, CH, '#ffffff'); ptext(g, ox, oy, k, 'BUKA', CW / 2, 10, CW - 8, 4, '#d0282e'); });
  idx.perum = add((g, ox, oy, k) => { R(g, ox, oy, k, 0, 0, CW, CH, '#2a3a2a'); R(g, ox, oy, k, 0, 0, CW, 3, '#e0c060'); R(g, ox, oy, k, 0, CH - 3, CW, 3, '#e0c060');
    ptext(g, ox, oy, k, 'BUKIT ASRI', CW / 2, 7, CW - 8, 4, '#f0e0a8'); ptext(g, ox, oy, k, 'SELAMAT DATANG', CW / 2, 36, CW - 8, 1, '#e0c060', { s: 1 }); });
  idx.pos = add((g, ox, oy, k) => { R(g, ox, oy, k, 0, 0, CW, CH, '#1f3f7a'); ptext(g, ox, oy, k, 'POS SATPAM', CW / 2, 10, CW - 8, 4, '#ffffff'); });
  idx.lapor = add((g, ox, oy, k) => { R(g, ox, oy, k, 0, 0, CW, CH, '#f2f2ee'); R(g, ox, oy, k, 0, 0, CW, 4, '#d0282e');
    ptext(g, ox, oy, k, 'TAMU WAJIB', CW / 2, 8, CW - 8, 3, '#d0282e'); ptext(g, ox, oy, k, 'LAPOR 1X24 JAM', CW / 2, 32, CW - 8, 2, '#1a1a1a'); });
  // papan nama tempat baru (guide 85): [kunci, judul, sub, latar, huruf, aksen]
  idx.txt = {};
  for (const [key, t, sub, bg, fg, ac] of PLACE_SIGNS) idx.txt[key] = add((g, ox, oy, k) => {
    R(g, ox, oy, k, 0, 0, CW, CH, bg); R(g, ox, oy, k, 0, 0, CW, 3, ac); R(g, ox, oy, k, 0, CH - 3, CW, 3, ac);
    if (sub) { ptext(g, ox, oy, k, t, CW / 2, 6, CW - 8, 4, fg, { s: scaleFor(t, CW - 8, 4) }); ptext(g, ox, oy, k, sub, CW / 2, 35, CW - 8, 1, ac === bg ? fg : ac, { s: 1 }); }
    else ptext(g, ox, oy, k, t, CW / 2, 4 + (40 - 7 * scaleFor(t, CW - 8, 4)) / 2, CW - 8, 4, fg, { s: scaleFor(t, CW - 8, 4) });
  });
  idx.warung = WARUNGS.map(([t, sub, bg, fg, ac]) => add((g, ox, oy, k) => {
    R(g, ox, oy, k, 0, 0, CW, CH, bg); R(g, ox, oy, k, 0, 0, CW, 3, ac); R(g, ox, oy, k, 0, CH - 3, CW, 3, ac);
    ptext(g, ox, oy, k, t, CW / 2, 6, CW - 8, 4, fg, { s: scaleFor(t, CW - 8, 4) }); ptext(g, ox, oy, k, sub, CW / 2, 35, CW - 8, 1, ac === bg ? fg : ac, { s: 1 });
  }));
  const rows = Math.ceil(cells.length / COLS), W0 = CW * COLS, H0 = THREE.MathUtils.ceilPowerOfTwo(rows * CH);
  const mips = [];
  for (let l = 0, w = W0, h = H0; w >= 1 || h >= 1; l++, w >>= 1, h >>= 1) {
    const cv = document.createElement('canvas'); cv.width = Math.max(1, w); cv.height = Math.max(1, h); const g = cv.getContext('2d');
    if (l < LEVELS) { const k = 1 / (1 << l); g.imageSmoothingEnabled = false; cells.forEach((fn, i) => { const [x, y] = cellXY(i); fn(g, x * k, y * k, k); }); }
    else { g.imageSmoothingEnabled = true; g.drawImage(mips[l - 1], 0, 0, cv.width, cv.height); }
    mips.push(cv); if (w <= 1 && h <= 1) break;
  }
  const tex = new THREE.CanvasTexture(mips[0]); tex.mipmaps = mips; tex.generateMipmaps = false; tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestMipmapNearestFilter;
  return { tex, idx, W: W0, H: H0 };
}
// LED dot-matrix: tiap baris satu teks (huruf piksel, 1 titik = 2 texel), diulang selebar atlas supaya geser (repeat) mulus
const LW = 512, LH = 16;
function buildLed() {
  const cv = document.createElement('canvas'); cv.width = LW; cv.height = LH * LEDS.length;
  const g = cv.getContext('2d'); g.fillStyle = '#120806'; g.fillRect(0, 0, cv.width, cv.height);
  LEDS.forEach(([t, c], r) => {
    const on = new Set(), w = t.length * 6, cols = LW / 2;
    for (let x0 = 0; x0 < cols; x0 += w) for (let ci = 0; ci < t.length; ci++) { const n = FONT[t[ci]] ?? 0;
      for (let rr = 0; rr < 7; rr++) for (let b = 0; b < 5; b++) if ((n >> ((6 - rr) * 5 + (4 - b))) & 1) { const x = x0 + ci * 6 + b; if (x < cols) on.add(x + ',' + rr); } }
    for (let y = 0; y < 8; y++) for (let x = 0; x < cols; x++) { g.fillStyle = on.has(x + ',' + (y - 0)) ? c : '#2a1410'; g.fillRect(x * 2, r * LH + y * 2, 2, 2); }
  });
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.wrapS = THREE.RepeatWrapping; tex.generateMipmaps = false;
  return tex;
}

/* ------------------------------------------------------------------ kumpulan quad */
// xf = { x, z, a, y }: bingkai lokal bangunan (depan = +z). Quad tegak menghadap +z lokal (atau dua sisi).
export class SignBatch {
  constructor() { this.p = []; this.n = []; this.uv = []; this.idx = []; this.lp = []; this.ln = []; this.luv = []; this.lidx = []; if (!ATLAS) ATLAS = buildAtlas(); this.A = ATLAS; }
  get kinds() { return this.A.idx; }
  _quad(P, N, UV, I, xf, lx, ly, lz, w, h, u, face = 0) {
    const c = Math.cos(xf.a || 0), s = Math.sin(xf.a || 0), b = P.length / 3, y0 = (xf.y || 0) + ly;
    // face: 0 = menghadap +z lokal, 1 = menghadap +x lokal (papan nempel di samping), -1 = -x
    const pts = face === 0 ? [[lx - w / 2, lz], [lx + w / 2, lz]] : face > 0 ? [[lx, lz + w / 2], [lx, lz - w / 2]] : [[lx, lz - w / 2], [lx, lz + w / 2]];
    const nl = face === 0 ? [0, 1] : [face, 0], nw = [nl[0] * c - nl[1] * s, nl[0] * s + nl[1] * c];
    const W = ([x, z]) => [xf.x + x * c - z * s, xf.z + x * s + z * c];
    const [a, bb] = pts.map(W);
    P.push(a[0], y0, a[1], bb[0], y0, bb[1], bb[0], y0 + h, bb[1], a[0], y0 + h, a[1]);
    for (let k = 0; k < 4; k++) N.push(nw[0], 0, nw[1]);
    UV.push(...u);
    I.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  // papan dari atlas: cell = indeks; vert = huruf disusun ke bawah (cell digambar miring)
  sign(xf, lx, ly, lz, w, h, cell, o = {}) {
    const [x, y] = cellXY(cell), { W, H } = this.A, u0 = (x + 0.5) / W, u1 = (x + CW - 0.5) / W, v1 = 1 - (y + 0.5) / H, v0 = 1 - (y + CH - 0.5) / H;
    const uv = o.vert ? [u1, v0, u1, v1, u0, v1, u0, v0] : [u0, v0, u1, v0, u1, v1, u0, v1];
    this._quad(this.p, this.n, this.uv, this.idx, xf, lx, ly, lz, w, h, uv, o.face || 0);
    if (o.back) this._quad(this.p, this.n, this.uv, this.idx, { ...xf, a: (xf.a || 0) + Math.PI }, -lx, ly, -lz + 0.001, w, h, uv, o.face ? -o.face : 0);
  }
  // LED berjalan: row = baris teks LED; panjang tampilan dihitung dari ukuran (huruf tidak gepeng)
  led(xf, lx, ly, lz, w, h, row, o = {}) {
    const v1 = 1 - row / LEDS.length, v0 = 1 - (row + 1) / LEDS.length, span = (w / h) * (LH / LW), u0 = hash(row, Math.round(lx * 9)) % 1;
    this._quad(this.lp, this.ln, this.luv, this.lidx, xf, lx, ly, lz, w, h, [u0, v0, u0 + span, v0, u0 + span, v1, u0, v1], o.face || 0);
  }
  build(scene) {
    const mk = (P, N, UV, I) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(I); g.computeBoundingSphere(); return g; };
    const out = { update() {} };
    if (this.idx.length) { const m = new THREE.Mesh(mk(this.p, this.n, this.uv, this.idx), new THREE.MeshLambertMaterial({ map: this.A.tex, emissive: '#ffffff', emissiveMap: this.A.tex, emissiveIntensity: 0.25 })); m.receiveShadow = true; scene.add(m); }
    if (this.lidx.length) {
      if (!LEDA) LEDA = buildLed();
      const mat = new THREE.MeshBasicMaterial({ map: LEDA }), U = { value: 0 };
      mat.onBeforeCompile = sh => { sh.uniforms.uT = U; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT;').replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv.x += uT;\n#endif'); };
      scene.add(new THREE.Mesh(mk(this.lp, this.ln, this.luv, this.lidx), mat));
      out.update = t => { U.value = (t * 0.06) % 1; };
    }
    return out;
  }
}
export const shopFor = r => Math.floor(r * (SHOPS.length - 2)) % (SHOPS.length - 2);   // tanpa hotel/kos (khusus papan vertikal)
export const bannerFor = r => Math.floor(r * BANNERS.length) % BANNERS.length;
export const ledFor = r => Math.floor(r * LEDS.length) % LEDS.length;
export { pick };
