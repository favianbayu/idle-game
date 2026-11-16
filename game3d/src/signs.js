// Papan nama toko, spanduk, dan LED berjalan ala pertokoan Indonesia.
// Semua tulisan digambar sekali ke satu atlas kanvas (NearestFilter, supaya tetap bergaya piksel),
// lalu tiap papan = satu quad bertekstur. LED berjalan memakai atlas kedua yang digeser di shader.
import * as THREE from 'three';
import { hash, pick } from './common.js';

/* ------------------------------------------------------------------ isi papan */
// [judul, keterangan, warna latar, warna huruf, aksen]
export const SHOPS = [
  ['FOTOKOPI', 'JILID • LAMINASI • PRINT WARNA', '#1f5fb8', '#ffffff', '#f2c230'],
  ['SERVICE HP', 'KONTER PULSA • AKSESORIS', '#e8e8e4', '#d0282e', '#1a1a1a'],
  ['APOTEK', 'SEHAT SENTOSA', '#ffffff', '#1f8a4a', '#1f8a4a'],
  ['BENGKEL MOTOR', 'TAMBAL BAN • GANTI OLI', '#f2c230', '#1a1a1a', '#d0282e'],
  ['LAUNDRY KILOAN', 'CUCI • SETRIKA • 1 HARI JADI', '#3ab0d8', '#ffffff', '#ffffff'],
  ['RM PADANG', 'SALERO BUNDO', '#d0282e', '#f2d23a', '#f2d23a'],
  ['BAKSO & MIE AYAM', 'PAK KUMIS', '#f6f2e6', '#c82a2a', '#2a7a3a'],
  ['TOKO EMAS', 'CAHAYA MULIA', '#b8141e', '#f6d24a', '#f6d24a'],
  ['TOKO BANGUNAN', 'SUMBER REJEKI', '#2a7a3a', '#ffffff', '#f2c230'],
  ['WARUNG KOPI', 'KOPI SUSU • MIE REBUS • GORENGAN', '#3a2418', '#f2d29a', '#e8823a'],
  ['AYAM GEPREK', 'SAMBEL BAWANG • LEVEL 1-10', '#f28a1a', '#ffffff', '#7a1a0a'],
  ['KLINIK GIGI', 'drg. WULAN SARI', '#ffffff', '#2a6ac0', '#2a6ac0'],
  ['BIMBEL PINTAR', 'SD • SMP • SMA • UTBK', '#2a3a8a', '#f2c230', '#ffffff'],
  ['BARBERSHOP', 'CUKUR RAPI • 25RB', '#1a1a1e', '#ffffff', '#d0282e'],
  ['OPTIK', 'MATA JERNIH', '#f2f2ee', '#1a3a7a', '#d0282e'],
  ['TOKO KELONTONG', 'BERKAH JAYA', '#e85a2a', '#ffffff', '#f2d23a'],
  ['ELEKTRONIK', 'TV • KULKAS • KIPAS • SERVIS', '#1a2a5a', '#7ad8ff', '#ffffff'],
  ['SALON MUSLIMAH', 'RIAS • CREAMBATH', '#e88ab8', '#ffffff', '#7a1a4a'],
  ['PERCETAKAN', 'UNDANGAN • SPANDUK • STIKER', '#7a2a9a', '#ffffff', '#f2c230'],
  ['ES TEH JUMBO', 'CUMA 5RB!', '#f2d23a', '#2a5a1a', '#d0282e'],
  ['MARTABAK', 'MANIS & TELOR • BANGKA', '#f6e6c0', '#8a2a0a', '#d0282e'],
  ['SEMBAKO', 'BERAS • MINYAK • GULA • TELUR', '#2a5aa8', '#ffffff', '#f2c230'],
  ['GAS & GALON', 'ANTAR GRATIS', '#3a9a5a', '#ffffff', '#ffffff'],
  ['ATK', 'ALAT TULIS • FOTOKOPI', '#f6f6f2', '#e85a2a', '#2a6ac0'],
  ['DISTRO', 'KAOS • HOODIE • TOPI', '#1a1a1e', '#f2f2f2', '#3ab0d8'],
  ['PET SHOP', 'MAKANAN KUCING • GROOMING', '#f2a8c0', '#4a2a6a', '#ffffff'],
  ['KOPI KEKINIAN', 'KOPI SUSU GULA AREN', '#e8dcc8', '#4a2a1a', '#2a6a3a'],
  ['TOKO SEPATU', 'SEPATU SEKOLAH • SANDAL', '#c83a3a', '#ffffff', '#1a1a1a'],
  ['PECEL LELE', 'LAMONGAN • BUKA SORE', '#f6f2e6', '#2a6a2a', '#d0282e'],
  ['MATERIAL', 'PASIR • SEMEN • BATA', '#8a6a3a', '#ffffff', '#f2c230'],
  ['HOTEL MELATI', 'KAMAR AC • HARIAN', '#2a3a5a', '#f2d23a', '#ffffff'],
  ['KOS PUTRI', 'MASIH ADA KAMAR', '#f6f2e6', '#c83a6a', '#2a2a2a'],
];
export const BANNERS = [
  ['PROMO MERDEKA!', 'DISKON 17% SEMUA ITEM', '#d0282e', '#ffffff'],
  ['TERIMA SERVIS', 'SEGALA MERK • BERGARANSI', '#ffffff', '#1f5fb8'],
  ['SEDIA PULSA', 'TOKEN LISTRIK • PAKET DATA', '#f2d23a', '#c8141e'],
  ['DIJUAL CEPAT', 'TANPA PERANTARA • HUB 0812-xxxx', '#ffffff', '#d0282e'],
  ['DIKONTRAKKAN', 'HUB PEMILIK 0857-xxxx', '#ffffff', '#1a1a1a'],
  ['BUKA 24 JAM', 'MELAYANI DENGAN SENYUM', '#1f8a4a', '#ffffff'],
  ['TERIMA PESANAN', 'NASI KOTAK • TUMPENG • SNACK', '#f6e6c0', '#8a2a0a'],
  ['GRAND OPENING', 'BELI 1 GRATIS 1', '#d0282e', '#f2d23a'],
  ['LOWONGAN KERJA', 'DIBUTUHKAN SEGERA • PRIA/WANITA', '#f2d23a', '#1a1a1a'],
  ['PENERIMAAN SISWA BARU', 'BIMBEL PINTAR • DAFTAR SEKARANG', '#2a3a8a', '#ffffff'],
  ['CUCI MOTOR', 'SALJU • 15RB', '#3ab0d8', '#ffffff'],
  ['MENERIMA', 'JAHIT • PERMAK • VERMAK JEANS', '#ffffff', '#7a2a9a'],
];
export const LEDS = [
  ['SELAMAT DATANG • BUKA 24 JAM • ', '#ff3a2a'], ['SERVICE HP • GANTI LCD • FLASHING • ', '#ff3a2a'],
  ['FOTOKOPI WARNA • JILID • LAMINASI • ', '#ffb21a'], ['PROMO HARI INI DISKON 50% • ', '#3aff5a'],
  ['PULSA • KUOTA • TOKEN PLN • ', '#ff3a2a'], ['OPEN • OPEN • ', '#ff3a2a'], ['APOTEK BUKA 24 JAM • ', '#3aff5a'],
  ['TERIMA KASIH ATAS KUNJUNGAN ANDA • ', '#ffb21a'], ['BELI 2 GRATIS 1 • HEMAT • ', '#3aff5a'],
];
// minimarket parodi
export const MM = { name: 'Indomurah', tag: 'MUDAH • MURAH • DEKAT', blue: '#1f4fb0', red: '#d8202a', yellow: '#f6c81a' };

/* ------------------------------------------------------------------ atlas kanvas */
const CW = 256, CH = 48, COLS = 8;
let ATLAS = null, LEDA = null;
function fitText(g, text, maxW, size, weight = 'bold') {
  let s = size; do { g.font = `${weight} ${s}px "Arial Black", Impact, "Arial Narrow", sans-serif`; s -= 1; } while (g.measureText(text).width > maxW && s > 7);
}
function cellXY(i) { return [(i % COLS) * CW, Math.floor(i / COLS) * CH]; }
function buildAtlas() {
  const cells = [];
  const add = fn => { cells.push(fn); return cells.length - 1; };
  const idx = { shop: [], banner: [], vert: [], mm: {}, parkir: 0 };
  for (const [t, sub, bg, fg, ac] of SHOPS) idx.shop.push(add((g, x, y) => {
    g.fillStyle = bg; g.fillRect(x, y, CW, CH);
    g.fillStyle = ac; g.fillRect(x, y + CH - 4, CW, 2); g.fillRect(x, y + 2, CW, 2);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitText(g, t, CW - 16, 26); g.fillText(t, x + CW / 2, y + 18);
    g.fillStyle = ac === bg ? fg : ac; fitText(g, sub, CW - 20, 10, 'bold'); g.fillText(sub, x + CW / 2, y + 37);
    if (t === 'APOTEK' || t === 'KLINIK GIGI') { g.fillStyle = '#1f8a4a'; g.fillRect(x + 12, y + 16, 18, 6); g.fillRect(x + 18, y + 10, 6, 18); }
  }));
  for (const [t, sub, bg, fg] of BANNERS) idx.banner.push(add((g, x, y) => {
    g.fillStyle = bg; g.fillRect(x, y, CW, CH);
    g.fillStyle = fg; g.fillRect(x, y, 6, CH); g.fillRect(x + CW - 6, y, 6, CH);
    g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, t, CW - 24, 24); g.fillText(t, x + CW / 2, y + 17);
    g.fillStyle = bg === '#ffffff' ? '#d0282e' : fg; fitText(g, sub, CW - 24, 10); g.fillText(sub, x + CW / 2, y + 37);
    g.fillStyle = '#d8d8d8'; for (const [cx, cy] of [[3, 3], [CW - 3, 3], [3, CH - 3], [CW - 3, CH - 3]]) g.fillRect(x + cx - 2, y + cy - 2, 4, 4);   // mata ayam
  }));
  // papan vertikal (hotel/kos): huruf disusun ke bawah, digambar miring 90° (quad memutar uv-nya)
  for (const i of [30, 31, 1, 2]) { const [t, , bg, fg] = SHOPS[i]; idx.vert.push(add((g, x, y) => {
    g.fillStyle = bg; g.fillRect(x, y, CW, CH); g.fillStyle = fg; g.textBaseline = 'middle'; g.textAlign = 'center';
    g.font = 'bold 30px "Arial Black", Impact, sans-serif'; const ch = t.replace(/ /g, ''); const step = (CW - 16) / ch.length;
    for (let k = 0; k < ch.length; k++) { g.save(); g.translate(x + 8 + step * (k + 0.5), y + CH / 2); g.rotate(Math.PI / 2); g.fillText(ch[k], 0, 0); g.restore(); }
  })); }
  // minimarket: papan utama (logo), pita garis, papan "parkir"
  idx.mm.logo = add((g, x, y) => {
    g.fillStyle = '#ffffff'; g.fillRect(x, y, CW, CH);
    g.fillStyle = MM.red; g.fillRect(x, y, CW, 6); g.fillStyle = MM.yellow; g.fillRect(x, y + 6, CW, 4);
    g.fillStyle = MM.blue; g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, MM.name, CW - 30, 30); g.fillText(MM.name, x + CW / 2, y + 26);
    g.fillStyle = MM.red; g.font = 'bold 8px sans-serif'; g.fillText(MM.tag, x + CW / 2, y + 42);
  });
  idx.mm.stripe = add((g, x, y) => { const c = [MM.blue, MM.yellow, MM.red]; for (let i = 0; i < 3; i++) { g.fillStyle = c[i]; g.fillRect(x, y + i * CH / 3, CW, CH / 3 + 1); } });
  idx.mm.promo = add((g, x, y) => {
    g.fillStyle = MM.yellow; g.fillRect(x, y, CW, CH); g.fillStyle = MM.red; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitText(g, 'HEMAT MINGGU INI!', CW - 20, 22); g.fillText('HEMAT MINGGU INI!', x + CW / 2, y + 16);
    g.fillStyle = MM.blue; fitText(g, 'MINYAK 2L • BERAS 5KG • SUSU', CW - 20, 10); g.fillText('MINYAK 2L • BERAS 5KG • SUSU', x + CW / 2, y + 36);
  });
  idx.parkir = add((g, x, y) => {
    g.fillStyle = '#1f4fb0'; g.fillRect(x, y, CW, CH); g.fillStyle = '#ffffff'; g.fillRect(x + 6, y + 6, 36, 36);
    g.fillStyle = '#1f4fb0'; g.font = 'bold 30px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('P', x + 24, y + 25);
    g.fillStyle = '#ffffff'; fitText(g, 'PARKIR MOTOR & MOBIL', CW - 60, 18); g.fillText('PARKIR MOTOR & MOBIL', x + 48 + (CW - 48) / 2, y + 17);
    g.font = 'bold 10px sans-serif'; g.fillText('MOTOR 2RB • MOBIL 5RB', x + 48 + (CW - 48) / 2, y + 36);
  });
  idx.bank = add((g, x, y) => { g.fillStyle = '#f6f6f2'; g.fillRect(x, y, CW, CH); g.fillStyle = '#0a5a9a'; g.fillRect(x + 6, y + 8, 32, 32); g.fillStyle = '#f6a81a'; g.fillRect(x + 14, y + 16, 16, 16);
    g.fillStyle = '#0a5a9a'; g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, 'BANK BINA RAKYAT', CW - 60, 24); g.fillText('BANK BINA RAKYAT', x + 44 + (CW - 44) / 2, y + 24); });
  idx.atm = add((g, x, y) => { g.fillStyle = '#1a3a8a'; g.fillRect(x, y, CW, CH); g.fillStyle = '#f6c81a'; g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, 'ATM 24 JAM', CW - 20, 28); g.fillText('ATM 24 JAM', x + CW / 2, y + 24); });
  idx.open = add((g, x, y) => { g.fillStyle = '#ffffff'; g.fillRect(x, y, CW, CH); g.fillStyle = '#d0282e'; g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, 'BUKA', CW - 20, 30); g.fillText('BUKA', x + CW / 2, y + 24); });
  const rows = Math.ceil(cells.length / COLS), cv = document.createElement('canvas');
  cv.width = CW * COLS; cv.height = THREE.MathUtils.ceilPowerOfTwo(rows * CH);
  const g = cv.getContext('2d');
  cells.forEach((fn, i) => { const [x, y] = cellXY(i); g.save(); g.beginPath(); g.rect(x, y, CW, CH); g.clip(); fn(g, x, y); g.restore(); });
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = 4;
  return { tex, idx, W: cv.width, H: cv.height };
}
// LED dot-matrix: tiap baris satu teks, diulang selebar atlas supaya geser (repeat) mulus
const LW = 512, LH = 16;
function buildLed() {
  const cv = document.createElement('canvas'); cv.width = LW; cv.height = LH * LEDS.length;
  const g = cv.getContext('2d'); g.fillStyle = '#120806'; g.fillRect(0, 0, cv.width, cv.height);
  const tmp = document.createElement('canvas'); tmp.width = LW / 2; tmp.height = LH / 2; const tg = tmp.getContext('2d', { willReadFrequently: true });
  LEDS.forEach(([t, c], r) => {
    tg.clearRect(0, 0, tmp.width, tmp.height); tg.fillStyle = '#fff'; tg.font = 'bold 7px monospace'; tg.textBaseline = 'middle';
    const w = tg.measureText(t).width; for (let x = 0; x < tmp.width; x += w) tg.fillText(t, x, tmp.height / 2 + 0.5);
    const d = tg.getImageData(0, 0, tmp.width, tmp.height).data;
    for (let y = 0; y < tmp.height; y++) for (let x = 0; x < tmp.width; x++) {
      const on = d[(y * tmp.width + x) * 4 + 3] > 90;
      g.fillStyle = on ? c : '#2a1410'; g.fillRect(x * 2, r * LH + y * 2, 1.6, 1.6);
    }
  });
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearFilter; tex.wrapS = THREE.RepeatWrapping; tex.generateMipmaps = false;
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
