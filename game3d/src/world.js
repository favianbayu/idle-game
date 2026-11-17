// Kompleks SMA Negeri 3 Wirabumi, mengikuti docs/desain-sma/guide/83-sekolah-luar.md
// (denah tapak dari peta/buat_sekolah_luar.py). Koordinat tapak dalam petak, origin = pojok barat laut gambar;
// di dunia digeser X + SCHOOL_OX. Pagar (2,2)-(78,55.5), trotoar z 56-57, Jl. Merdeka z 57-60.
import * as THREE from 'three';
import { Chunks, col, shade, mix } from './geom.js';
import { hash, pick, MAT, GLASS, GLASS2, FRAME, makePatterns, PAT, groundDetail } from './common.js';
import { plant } from './veg.js';
import * as V from './vehicles.js';
import { parked } from './parked.js';
export { Collision } from './common.js';
export { buildKota } from './kota.js';

export const SCHOOL_OX = 400;
const PX = 16;
const FS = 2.2;                       // tinggi 1 lantai sekolah (guide 83: 2.2 petak)
const GX = -12, GZ = -10, GW = 104, GH = 76;   // bidang tanah (lebih luas dari tapak, supaya tepi tidak kosong)

// warna dari guide 83 / buat_sekolah_luar.py
const K = {
  krem: col('#ecdcb4'), putih: col('#f6f2e8'), genteng: col('#a84a32'), kusen: col('#7a4a2a'), hijau: col('#2f6b4a'),
  sengHijau: col('#3a6a4a'), paving: col('#c9c2b2'), kaca: col('#9cc4d8'), roster: col('#d8c8a0'), lama: col('#d9d4c4'),
  lamaAtap: col('#3c3a36'), lumut: col('#6a7a4a'), biru: col('#3f6fa8'), merah: col('#b84a3a'), kuning: col('#e2b84a'),
  ungu: col('#8a6aa8'), oranye: col('#d9774a'), kanopi: col('#5a8a9a'), kubah: col('#3a9a8a'), emas: col('#d4a640'),
  bata: col('#a8583a'), abu: col('#9aa0a6'), besi: col('#2f5a3a'), hijauBalkon: col('#3a8a4a'), plint: col('#8a8478'),
};

/* ------------------------------------------------------------------ zona (untuk nama tempat & minimap) */
// [x0, z0, x1, z1, kunci, nama]
export const SCHOOL_ZONES = [
  [36.5, 44, 41.5, 57, 'masuk', 'Gerbang & jalan masuk'], [33.5, 44, 44.5, 55, 'plaza', 'Plaza depan & kolam'],
  [44.8, 50.4, 48.3, 54, 'pos', 'Pos satpam'], [4, 44, 30, 53.6, 'parkir', 'Parkiran motor siswa'], [50, 46, 64, 53.6, 'parkirGuru', 'Parkir guru'],
  [66, 44, 77, 53.6, 'mading', 'Taman mading & rak sepeda'], [22, 31.5, 56, 46.5, 'gedungA', 'Gedung A (kantor & perpustakaan)'],
  [17, 4, 63, 15.5, 'gedungB', 'Gedung B (kelas X / XI / XII)'], [5, 15, 13, 38.6, 'gedungC', 'Gedung C (lab, seni, OSIS)'],
  [64, 3, 77, 16, 'aula', 'Aula / GOR'], [70.5, 17, 77.5, 29.5, 'musala', 'Musala & tempat wudu'], [58, 34, 76, 42.5, 'kantin', 'Kantin'],
  [14, 33.5, 21, 42.5, 'toilet', 'Toilet & gudang'], [3.5, 3, 13.5, 11, 'lama', 'Gedung Lama (terkunci)'], [3.5, 38.6, 12.5, 43.4, 'kebun', 'Kebun & greenhouse'],
  [28, 16, 50, 30, 'upacara', 'Lapangan upacara'], [54, 16, 69, 31.2, 'basket', 'Lapangan basket & futsal'], [13.5, 17.5, 24, 28, 'beringin', 'Pohon beringin'],
  [24, 15.5, 54, 33.5, 'selasar', 'Selasar'], [29, -1, 38, 2, 'warung', 'Warung Mak Iyah (belakang pagar)'],
];

/* ------------------------------------------------------------------ tanah */
function paintSekolah() {
  const s = PX, cv = document.createElement('canvas'); cv.width = GW * s; cv.height = GH * s;
  const g = cv.getContext('2d'); makePatterns(g, s / 10);
  g.translate(-GX * s, -GZ * s);
  g.fillStyle = PAT.grassDark; g.fillRect(GX * s, GZ * s, GW * s, GH * s);
  g.fillStyle = PAT.grass; g.fillRect(2 * s, 2 * s, 76 * s, 53.5 * s);
  const R = (x0, z0, x1, z1, c) => { g.fillStyle = c; g.fillRect(x0 * s, z0 * s, (x1 - x0) * s, (z1 - z0) * s); };
  const O = (x, z, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x * s, z * s, r * s, 0, Math.PI * 2); g.fill(); };
  const line = (pts, c, w, dash) => { g.strokeStyle = c; g.lineWidth = w; g.setLineDash(dash || []); g.beginPath(); pts.forEach(([x, z], i) => i ? g.lineTo(x * s, z * s) : g.moveTo(x * s, z * s)); g.stroke(); g.setLineDash([]); };
  // jalan depan, trotoar, kanstin
  R(GX, 57, GX + GW, 60.6, PAT.asphalt); line([[GX, 58.8], [GX + GW, 58.8]], 'rgb(235,235,200)', 2, [12, 12]);
  R(GX, 55.6, GX + GW, 57, PAT.paving); line([[GX, 57], [GX + GW, 57]], 'rgb(150,146,136)', 2);
  R(GX, 60.6, GX + GW, 62, PAT.paving);
  // paving halaman
  const pav = PAT.paving, tile = PAT.tile;
  O(39, 49.5, 5.5, pav); R(36.5, 44, 41.5, 57, pav);
  O(39, 49.5, 5.5, pav); g.strokeStyle = 'rgba(120,112,100,0.6)'; g.lineWidth = 0.1 * s; for (const r of [3, 4.2, 5.4]) { g.beginPath(); g.arc(39 * s, 49.5 * s, r * s, 0, Math.PI * 2); g.stroke(); }
  // selasar beratap & jalur
  R(27, 31.5, 51, 33.5, tile); R(24, 15.5, 26, 33.5, tile); R(52, 15.5, 54, 33.5, tile); R(13, 15.5, 24, 17.5, tile);
  R(22, 12, 58, 15.5, pav); R(62, 14.5, 66, 16.5, pav); R(56, 31.2, 58, 34, pav); R(13, 31.5, 22, 33.5, pav); R(21, 31.5, 27, 33.5, pav);
  R(54, 31.2, 70.5, 33.2, pav); R(66, 16, 70.5, 18, pav); R(69, 16, 70.5, 29.5, pav);
  R(56, 33.5, 58, 46, pav); R(41.5, 46, 50, 47.5, pav); R(30, 44, 36.5, 45.5, pav);   // jalur parkiran-kantin
  R(13, 12, 17, 15.5, pav); R(13, 37, 14, 44, pav);
  // lapangan upacara: paving abu dengan garis sambungan + titik barisan 9 x 6
  R(28, 16, 50, 30, PAT.semen);
  for (let i = 1; i < 11; i++) line([[28 + i * 2, 16.2], [28 + i * 2, 29.8]], 'rgba(120,116,108,0.45)', 1);
  for (let i = 1; i < 7; i++) line([[28.2, 16 + i * 2], [49.8, 16 + i * 2]], 'rgba(120,116,108,0.3)', 1);
  g.strokeStyle = 'rgba(250,250,240,0.85)'; g.lineWidth = 0.2 * s; g.strokeRect(28.6 * s, 16.6 * s, 20.8 * s, 12.8 * s);
  for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) O(30.5 + c * 2.2, 21 + r * 1.4, 0.16, 'rgb(110,110,110)');
  // lapangan basket & futsal (semen cat bata)
  R(54, 16, 69, 30, 'rgb(201,119,74)');
  g.strokeStyle = 'rgba(250,250,250,0.95)'; g.lineWidth = 0.2 * s; g.strokeRect(55 * s, 17 * s, 13 * s, 12 * s);
  line([[55, 23], [68, 23]], 'rgba(250,250,250,0.95)', 2);
  g.beginPath(); g.arc(61.5 * s, 23 * s, 1.6 * s, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(61.5 * s, 17 * s, 3 * s, 0, Math.PI); g.stroke();
  g.beginPath(); g.arc(61.5 * s, 29 * s, 3 * s, Math.PI, Math.PI * 2); g.stroke();
  R(60, 17, 63, 19.2, 'rgba(160,80,50,0.6)'); R(60, 26.8, 63, 29, 'rgba(160,80,50,0.6)');
  // parkiran
  R(4, 44, 30, 53.6, PAT.semen); R(26.5, 44.4, 29.5, 46.8, tile);
  for (let r = 0; r < 3; r++) for (let i = 0; i <= 16; i++) line([[5 + i * 1.45, 45 + r * 3], [5 + i * 1.45, 47 + r * 3]], 'rgba(250,250,240,0.55)', 1);
  R(50, 46, 64, 53.6, PAT.asphalt);
  for (let i = 0; i <= 6; i++) line([[50 + i * 2.3, 46.2], [50 + i * 2.3, 49.4]], 'rgb(240,240,240)', 2);
  R(30, 50.5, 36.5, 53.6, PAT.asphalt); R(41.5, 50.5, 50, 53.6, PAT.asphalt);   // akses kendaraan dari gerbang
  // taman mading
  R(66, 44, 77, 53.6, PAT.lawn); R(66, 47.5, 77, 48.8, pav); R(67, 49.6, 75, 51.4, PAT.semen);
  // beringin
  O(18.7, 22.7, 5, PAT.lawn); O(18.7, 22.7, 3.7, PAT.dirt); O(18.7, 22.7, 2.8, PAT.grassDark);
  // kantin, musala, wudu, toilet, kebun
  R(58, 37.5, 76, 42.5, pav); R(57.6, 33.6, 76.4, 37.8, tile);
  R(70.5, 26.5, 77.5, 29.5, tile);
  R(3.5, 38.6, 13, 44, PAT.dirt);
  for (const z of [38.9, 40.0]) { R(3.8, z, 12.4, z + 0.8, 'rgb(120,90,60)'); for (let x = 4; x < 12.4; x += 0.6) R(x, z + 0.15, x + 0.35, z + 0.65, 'rgb(90,150,70)'); }
  // gedung lama: rumput liar & lumut
  R(2.2, 2.2, 15, 12.5, PAT.grassDark);
  // tepi luar: tanah di belakang pagar utara (jalur bolos ke warung)
  R(28, -1.5, 39, 2, PAT.dirt);
  line([[33.5, 1.8], [33.5, 3.6]], 'rgba(150,110,80,0.8)', 4);
  return cv;
}

/* ------------------------------------------------------------------ bangun */
export function buildSekolah(scene, C) {
  const OX = SCHOOL_OX, ch = new Chunks(32);
  parked.begin();
  const tex = new THREE.CanvasTexture(paintSekolah());
  tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = 4;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(GW, GH), groundDetail(new THREE.MeshLambertMaterial({ map: tex })));
  ground.rotation.x = -Math.PI / 2; ground.position.set(OX + GX + GW / 2, 0.01, GZ + GH / 2); ground.receiveShadow = true; scene.add(ground);

  const at = (x, z) => ch.at(OX + x, z);
  const XF = (x, z, a = 0, y = 0) => ({ x: OX + x, z, a, y });
  // kotak sumbu-sejajar dalam koordinat tapak: x0..x1, z0..z1, tinggi y0..y0+h
  const bx = (x0, z0, x1, z1, y0, h, c, o) => at((x0 + x1) / 2, (z0 + z1) / 2).box(XF((x0 + x1) / 2, (z0 + z1) / 2), 0, y0, 0, x1 - x0, h, z1 - z0, c, o);
  const solid = (x0, z0, x1, z1) => C.box(OX + (x0 + x1) / 2, (z0 + z1) / 2, (x1 - x0) / 2, (z1 - z0) / 2);
  const post = (x, z, h, c = K.besi, w = 0.14, coll = true) => { bx(x - w / 2, z - w / 2, x + w / 2, z + w / 2, 0, h, c); if (coll) C.circle(OX + x, z, w / 2 + 0.02); };
  // jendela berkusen di satu sisi dinding: side 'n' | 's' | 'e' | 'w'; u0..u1 rentang di sepanjang dinding
  const winRow = (side, plane, u0, u1, floors, o = {}) => {
    const sp = o.sp || 1.6, ww = o.ww || 0.8, wh = o.wh || 1.0, y0 = o.y0 ?? 0.75, skip = o.skip || [];
    const n = Math.max(1, Math.floor((u1 - u0) / sp));
    for (let f = o.f0 || 0; f < floors; f++) for (let i = 0; i < n; i++) {
      const u = u0 + (i + 0.5) * (u1 - u0) / n;
      if (skip.some(([a, b, ff]) => u > a && u < b && (ff === undefined || ff === f))) continue;
      const y = f * FS + y0, fr = o.frame || K.kusen, gl = o.glass || GLASS2;
      const put = (w, h, d, yy, c) => {
        if (side === 's') bx(u - w / 2, plane - 0.02, u + w / 2, plane + d, yy, h, c);
        else if (side === 'n') bx(u - w / 2, plane - d, u + w / 2, plane + 0.02, yy, h, c);
        else if (side === 'e') bx(plane - 0.02, u - w / 2, plane + d, u + w / 2, yy, h, c);
        else bx(plane - d, u - w / 2, plane + 0.02, u + w / 2, yy, h, c);
      };
      put(ww + 0.12, wh + 0.12, 0.05, y - 0.06, fr); put(ww, wh, 0.07, y, gl);
      put(ww + 0.2, 0.06, 0.12, y - 0.1, K.putih);                       // ambang
      if (o.roster) put(ww + 0.12, 0.22, 0.06, y + wh + 0.14, K.roster);  // roster di atas jendela
    }
  };
  const door = (side, plane, u, y, w = 0.7, h = 1.5, c = K.kusen) => {
    if (side === 's') bx(u - w / 2, plane - 0.02, u + w / 2, plane + 0.07, y, h, c);
    else if (side === 'n') bx(u - w / 2, plane - 0.07, u + w / 2, plane + 0.02, y, h, c);
    else if (side === 'e') bx(plane - 0.02, u - w / 2, plane + 0.07, u + w / 2, y, h, c);
    else bx(plane - 0.07, u - w / 2, plane + 0.02, u + w / 2, y, h, c);
  };
  // badan gedung: dinding + plint + list putih tiap lantai
  const body = (x0, z0, x1, z1, floors, wall, o = {}) => {
    const h = floors * FS + (o.extra || 0);
    bx(x0, z0, x1, z1, 0, h, wall);
    bx(x0 - 0.04, z0 - 0.04, x1 + 0.04, z1 + 0.04, 0, 0.3, o.plint || K.plint);
    for (let f = 1; f <= floors; f++) bx(x0 - 0.06, z0 - 0.06, x1 + 0.06, z1 + 0.06, f * FS - 0.12, 0.18, K.putih);
    if (o.coll !== false) solid(x0, z0, x1, z1);
    return h;
  };
  // tabung (pos satpam, tandon, menara) dan kerucut
  const cyl = (cx, cz, r, y0, h, c, n = 12, top = true) => {
    const m = at(cx, cz), P = (a, y) => [OX + cx + Math.cos(a) * r, y, cz + Math.sin(a) * r];
    for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2; m.poly([P(a0, y0), P(a0, y0 + h), P(a1, y0 + h), P(a1, y0)], shade(c, 0.86 + 0.14 * Math.cos(a0 - 0.6))); }
    if (top) { const pts = []; for (let i = n - 1; i >= 0; i--) pts.push(P(i / n * Math.PI * 2, y0 + h)); m.poly(pts, c); }
  };
  const cone = (cx, cz, r, y0, h, c, n = 12) => {
    const m = at(cx, cz), T = [OX + cx, y0 + h, cz], P = a => [OX + cx + Math.cos(a) * r, y0, cz + Math.sin(a) * r];
    for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2; m.tri([P(a0), T, P(a1)], [0, 1, 0], shade(c, 0.8 + 0.2 * Math.cos(a0 - 0.6))); }
  };
  // tulisan papan: blok kecil berirama (dibaca sebagai huruf dari jauh)
  const letters = (x0, x1, z, y, h, c, side = 1) => { for (let x = x0; x < x1 - 0.1; x += 0.32) if (hash(Math.round(x * 10), 77) < 0.8) bx(x, z, x + 0.2, z + 0.03 * side, y, h, c); };

  /* ======================= GEDUNG B (kelas, 3 lantai) x 18..62, z 4..12 ======================= */
  {
    const x0 = 18, x1 = 62, zb = 4, zw = 10, zf = 12, fl = 3, top = fl * FS;
    body(x0, zb, x1, zw, fl, K.krem);
    // selasar/balkon depan: plat lantai, kolom, pagar balkon warna per angkatan
    const rail = [K.biru, K.hijauBalkon, K.merah];
    bx(x0, zw, x1, zf, 0, 0.12, col('#c8c0a8'));
    for (let f = 1; f <= fl; f++) bx(x0, zw, x1, zf + 0.1, f * FS - 0.16, 0.2, f === fl ? K.putih : col('#e6e0d0'));
    for (let f = 0; f < fl; f++) {
      const y = f * FS;
      if (f > 0) { bx(x0, zf - 0.08, x1, zf + 0.02, y + 0.04, 0.62, rail[f]); bx(x0, zf - 0.12, x1, zf + 0.06, y + 0.66, 0.08, shade(rail[f], 1.15)); }
      else for (let x = x0; x < x1; x += 7.33) bx(x + 1.2, zf - 0.08, x + 6.1, zf + 0.02, 0.12, 0.42, rail[0]);   // pagar rendah lt1, ada celah tiap kelas
      // 6 kelas per lantai: pintu + papan nama + 2 jendela
      for (let k = 0; k < 6; k++) {
        const cx = x0 + 3.67 + k * 7.33;
        door('s', zw, cx - 2, y + 0.12, 0.75, 1.55);
        bx(cx - 2.3, zw, cx - 1.7, zw + 0.06, y + 1.8, 0.22, K.putih);   // papan nama kelas
        if (f === 1 && hash(k, 5) < 0.5) bx(cx + 0.5, zf - 0.4, cx + 2.2, zf - 0.38, y + 0.95, 0.5, pick([K.biru, K.kuning, K.putih], hash(k, 6)));   // jemuran lap pel
      }
    }
    winRow('s', zw, x0, x1, fl, { sp: 1.83, ww: 1.0, wh: 1.0, skip: [...Array(6)].map((_, k) => [x0 + 1.67 + k * 7.33 - 0.75, x0 + 1.67 + k * 7.33 + 0.75]), roster: true });
    winRow('n', zb, x0, x1, fl, { sp: 2.2, ww: 1.1, wh: 0.9 });
    winRow('w', x0, zb, zw, fl, { sp: 2, ww: 0.7 }); winRow('e', x1, zb, zw, fl, { sp: 2, ww: 0.7 });
    for (let x = x0 + 0.1; x <= x1; x += 3.67) post(x, zf - 0.15, top, K.putih, 0.24);
    // atap: limas panjang + 3 gevel kecil menghadap lapangan
    at(40, 8).hip(XF(40, 8), 0, top, 0, x1 - x0, zf - zb, 2.4, K.genteng, 0.45);
    for (let i = 0; i < 3; i++) {
      const cx = 26 + i * 12.5, m = at(cx, 10.6);
      m.gable(XF(cx, 10.6, Math.PI / 2), 0, top, 0, 3.4, 6, 1.9, shade(K.genteng, 0.95), 0.3, K.krem);
      bx(cx - 3, 12.2, cx + 3, 12.36, top - 0.1, 0.2, K.putih);
      if (i === 1) { cyl(cx, 12.33, 0.55, top + 0.35, 0.06, K.putih, 14, false); bx(cx - 0.55, 12.32, cx + 0.55, 12.4, top + 0.1, 1.1, K.putih); bx(cx - 0.04, 12.4, cx + 0.04, 12.44, top + 0.62, 0.36, col('#222')); bx(cx - 0.04, 12.4, cx + 0.3, 12.44, top + 0.6, 0.06, col('#222')); }
      else { bx(cx - 0.6, 12.3, cx + 0.6, 12.38, top + 0.4, 0.5, K.roster); }
    }
    // menara tangga di kedua ujung (lebih tinggi, atap limas sendiri)
    for (const [tx0, tx1] of [[17, 22], [58, 63]]) {
      const th = body(tx0, 11, tx1, 15.5, 3, K.krem, { extra: 1.2 });
      winRow('s', 15.5, tx0, tx1, 3, { sp: 2.5, ww: 0.5, wh: 1.3, glass: K.kaca, y0: 0.6 });
      winRow(tx0 < 30 ? 'w' : 'e', tx0 < 30 ? tx0 : tx1, 11, 15.5, 3, { sp: 2.2, ww: 0.5 });
      door(tx0 < 30 ? 'e' : 'w', tx0 < 30 ? tx1 : tx0, 13.3, 0.12, 1.1, 1.7);
      at((tx0 + tx1) / 2, 13.25).hip(XF((tx0 + tx1) / 2, 13.25), 0, th, 0, 5, 4.5, 1.7, shade(K.genteng, 0.9), 0.35);
      for (let x = tx0 + 0.4; x < tx1; x += 0.9) bx(x, 15.5, x + 0.55, 15.56, 3 * FS + 0.25, 0.65, K.roster);
    }
    // coretan "X-2 JUARA" di dinding tangga barat
    bx(17.6, 15.5, 21.2, 15.57, 0.6, 0.5, col('#3a4ac0')); letters(17.8, 21, 15.57, 0.7, 0.28, K.putih);
    // teras tengah
    bx(37.5, 12, 42.5, 14.5, 0, 0.18, col('#d0c8b0'));
    for (const x of [37.7, 42.3]) post(x, 14.3, FS, K.putih, 0.22);
    at(40, 13.25).hip(XF(40, 13.25), 0, FS, 0, 5, 2.6, 0.8, shade(K.genteng, 0.9), 0.3);
    // tandon biru + antena di atap
    cyl(48, 6.2, 0.75, top + 1.2, 1.3, col('#2a6ac0'), 12); bx(47.2, 5.4, 48.8, 7.0, top + 1.0, 0.2, K.abu);
    post(54, 6, top + 4.2, col('#6a6a70'), 0.06, false); bx(53.4, 5.98, 54.6, 6.02, top + 3.6, 0.05, col('#6a6a70')); bx(53.6, 5.98, 54.4, 6.02, top + 3.95, 0.05, col('#6a6a70'));
    // tempat sampah 3 warna di depan
    for (let i = 0; i < 3; i++) { const x = 30 + i * 0.55; bx(x, 12.4, x + 0.45, 12.85, 0, 0.6, [col('#2a8a4a'), col('#e8c040'), col('#c83a3a')][i]); }
    solid(29.9, 12.4, 31.6, 12.85);
  }

  /* ======================= GEDUNG A (kantor, U + portiko) ======================= */
  {
    const fl = 2, top = fl * FS;
    body(22, 35, 56, 43, fl, K.krem);
    for (const [wx0, wx1] of [[22, 27], [51, 56]]) {
      body(wx0, 31.5, wx1, 35.2, fl, K.krem);
      winRow('n', 31.5, wx0, wx1, fl, { sp: 1.7, ww: 0.8, roster: true });
      winRow(wx0 < 30 ? 'e' : 'w', wx0 < 30 ? wx1 : wx0, 31.5, 35, fl, { sp: 1.75, ww: 0.8, roster: true });
      winRow(wx0 < 30 ? 'w' : 'e', wx0 < 30 ? wx0 : wx1, 31.5, 43, fl, { sp: 2.2, ww: 0.8 });
      for (const x of [wx0, wx1]) for (const z of [31.5]) bx(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 0, top, K.putih);   // pilaster sayap
      at((wx0 + wx1) / 2, 33.6).hip(XF((wx0 + wx1) / 2, 33.6, Math.PI / 2), 0, top, 0, 5.2, 5, 1.9, K.genteng, 0.4);
    }
    winRow('n', 35, 27, 51, fl, { sp: 2, ww: 1.0, roster: true, skip: [[37.8, 40.2, 0]] });
    door('n', 35, 39, 0.1, 1.4, 1.7);
    winRow('s', 43, 22, 56, fl, { sp: 2, ww: 1.0, roster: true, skip: [[35.3, 42.7]] });
    at(39, 39).hip(XF(39, 39), 0, top, 0, 34, 8, 2.6, K.genteng, 0.45);
    // ventilasi kecil di atap kiri-kanan
    for (const x of [28, 50]) { bx(x - 0.5, 38.4, x + 0.5, 39.6, top + 1.4, 0.7, K.putih); at(x, 39).gable(XF(x, 39), 0, top + 2.1, 0, 1, 1.2, 0.4, K.genteng, 0.1); }
    // portiko 2 lantai: lantai, 4 tiang putih, balkon hijau, pelana dengan bidang segitiga putih + lambang emas
    bx(35.5, 43, 42.5, 46.5, 0, 0.22, col('#e2dccb'));
    bx(37, 46.5, 41, 47.3, 0, 0.11, col('#e2dccb'));   // anak tangga
    door('s', 43, 39, 0.22, 1.6, 1.8, col('#6a4024'));
    winRow('s', 43, 36, 42, fl, { f0: 1, sp: 2, ww: 1.0, wh: 1.2, y0: 0.5 });
    for (const x of [35.9, 37.6, 40.4, 42.1]) { post(x, 46.1, top, K.putih, 0.4); bx(x - 0.28, 45.82, x + 0.28, 46.38, 0, 0.3, K.putih); }
    bx(35.5, 43, 42.5, 46.5, FS - 0.1, 0.22, K.putih);                         // plat lt2
    bx(35.5, 46.3, 42.5, 46.45, FS + 0.12, 0.6, K.hijau);                      // balkon kecil hijau
    bx(35.3, 46.4, 42.7, 46.62, FS - 0.75, 0.6, K.hijau);                      // papan nama hijau-emas
    bx(35.6, 46.62, 42.4, 46.66, FS - 0.62, 0.08, K.emas); letters(35.9, 42.2, 46.62, FS - 0.48, 0.2, K.emas);
    at(39, 44.7).gable(XF(39, 44.7, Math.PI / 2), 0, top, 0, 4.3, 7, 2.0, shade(K.genteng, 0.95), 0.3, K.putih);
    cyl(39, 47.0, 0.45, top + 0.55, 0.06, K.emas, 10, false); bx(38.6, 46.98, 39.4, 47.02, top + 0.4, 0.8, K.emas);   // lambang
    // lampu teras & lampu sorot papan nama
    bx(38.8, 45.6, 39.2, 46, top - 0.2, 0.15, col('#fff3c0'));
    // pot bunga di samping portiko
    solid(35.5, 46, 35.9, 46.4); solid(42.1, 46, 42.5, 46.4);
  }

  /* ======================= GEDUNG C (lab & seni, atap gergaji) x 5..13, z 15..37 ======================= */
  {
    const fl = 2, top = fl * FS, z0 = 15, z1 = 37;
    body(5, z0, 13, z1, fl, K.krem);
    winRow('e', 13, z0, z1, fl, { sp: 2.2, ww: 1.6, wh: 1.1, skip: [[17.6, 19.6, 0], [30.6, 32.6, 0]] });
    winRow('w', 5, z0, z1, fl, { sp: 2.2, ww: 1.6, wh: 1.1 });
    winRow('n', z0, 5, 13, fl, { sp: 2.6, ww: 1 });
    door('e', 13, 18.6, 0.1, 1.2, 1.6); door('e', 13, 31.6, 0.1, 1.2, 1.6);
    // atap gergaji: 6 gigi, sisi miring seng abu, sisi tegak kaca miring menghadap utara
    const n = 6, L = (z1 - z0) / n, hh = 1.1, m = at(9, 26), xa = OX + 4.7, xb = OX + 13.3, seng = col('#8a8f94');
    bx(4.7, z0 - 0.3, 13.3, z1 + 0.3, top, 0.15, shade(seng, 0.8));
    for (let i = 0; i < n; i++) {
      const za = z0 + i * L, zc = za + L, y0 = top + 0.15, y1 = y0 + hh;
      m.poly([[xa, y0, zc], [xb, y0, zc], [xb, y1, za], [xa, y1, za]], i % 2 ? seng : shade(seng, 1.06));
      m.poly([[xb, y0, za], [xa, y0, za], [xa, y1, za], [xb, y1, za]], col('#7ab0d0'));
      m.poly([[xa, y0, za], [xa, y0, zc], [xa, y1, za]], K.krem); m.poly([[xb, y0, zc], [xb, y0, za], [xb, y1, za]], K.krem);
      for (let x = 5.2; x < 13; x += 1) bx(x, za - 0.02, x + 0.08, za + 0.02, y0, hh, shade(seng, 0.7));
    }
    // ujung tangga (atap limas genteng) + mural siswa di dinding selatan
    body(5, 37, 13, 38.6, fl, K.krem, { extra: 0.4 });
    at(9, 37.8).hip(XF(9, 37.8), 0, top + 0.4, 0, 8, 1.6, 1.2, K.genteng, 0.35);
    const mur = ['#e8c040', '#3a9ae0', '#e05a5a', '#4ac07a', '#f08ab0', '#7a5ad0', '#ffffff'];
    for (let i = 0; i < 26; i++) { const x = 5.3 + hash(i, 41) * 6.8, y = 0.4 + hash(i, 42) * 3.6, w = 0.4 + hash(i, 43) * 1.1, h = 0.3 + hash(i, 44) * 0.8; bx(x, 38.6, Math.min(12.8, x + w), 38.66 + hash(i, 45) * 0.02, y, Math.min(h, top - y), col(pick(mur, hash(i, 46)))); }
    door('e', 13, 37.8, 0.1, 0.9, 1.6);
  }

  /* ======================= AULA / GOR x 64..77, z 3..14.5, atap lengkung ======================= */
  {
    const x0 = 64, x1 = 77, z0 = 3, z1 = 14.5, h = 4.6;
    body(x0, z0, x1, z1, 2, K.krem, { extra: h - 2 * FS });
    for (const z of [z0, z1]) for (let x = x0 + 0.4; x < x1 - 0.3; x += 0.7) bx(x, z - 0.05, x + 0.45, z + 0.05, h - 1.0, 0.55, K.roster);
    for (const x of [x0, x1]) for (let z = z0 + 0.4; z < z1 - 0.3; z += 0.7) bx(x - 0.05, z, x + 0.05, z + 0.45, h - 1.0, 0.55, K.roster);
    winRow('w', x0, z0, z1, 1, { sp: 2.3, ww: 1.2, wh: 1.4, y0: 0.9 }); winRow('e', x1, z0, z1, 1, { sp: 2.3, ww: 1.2, wh: 1.4, y0: 0.9 });
    door('s', z1, 70.5, 0.1, 2.4, 2.2, col('#5a3a20'));
    // atap lengkung seng hijau: penampang setengah lingkaran melintang x, memanjang z
    const m = at(70.5, 8.75), R = (x1 - x0) / 2 + 0.4, cx = OX + 70.5, n = 10, rise = 2.6, za = z0 - 0.4, zb = z1 + 0.4;
    const P = (i, z) => { const a = Math.PI - i / n * Math.PI; return [cx + Math.cos(a) * R, h + Math.sin(a) * rise, z]; };
    for (let i = 0; i < n; i++) {
      const c = shade(K.sengHijau, 0.8 + 0.3 * Math.sin(i / n * Math.PI) * (i < n / 2 ? 1.1 : 0.9));
      m.poly([P(i, zb), P(i + 1, zb), P(i + 1, za), P(i, za)], c);
      m.poly([P(i, za), P(i + 1, za), P(i + 1, zb), P(i, zb)], shade(K.sengHijau, 0.5));
    }
    const endWall = z => { const pts = []; for (let i = 0; i <= n; i++) { const p = P(i, z); p[0] = cx + (p[0] - cx) * (R - 0.4) / R; p[1] = h + (p[1] - h) * (rise - 0.1) / rise; pts.push(p); } m.poly(z < 8 ? pts : pts.reverse(), K.krem); };
    endWall(z0 - 0.01); endWall(z1 + 0.01);
    for (let x = x0 + 1; x < x1 - 0.5; x += 1) bx(x, z1, x + 0.5, z1 + 0.06, h + 0.3, 0.9 * Math.sin(Math.PI * (x - x0 + 0.25) / (x1 - x0)), K.roster);
    // kanopi pintu hijau + papan "AULA SMA 3"
    bx(66, 14.5, 75, 16, 2.6, 0.14, K.sengHijau, { bottom: true });
    for (const x of [66.2, 74.8]) post(x, 15.85, 2.6, K.besi, 0.14);
    bx(67.5, 14.52, 73.5, 14.6, 2.9, 0.7, K.hijau); letters(67.8, 73.2, 14.6, 3.1, 0.3, K.putih);
    // umbul-umbul (tiang) di kanopi
    for (const x of [65.5, 75.5]) { post(x, 16.3, 3.6, col('#cfcfcf'), 0.08); bx(x, 16.28, x + 0.35, 16.32, 2.2, 1.3, x < 70 ? K.merah : K.kuning); }
  }

  /* ======================= MUSALA 70.5..77.5 x 17..26 + wudu ======================= */
  {
    const x0 = 70.5, x1 = 77.5, z0 = 17, z1 = 26, h = 2.8, wh = col('#f6f4ec');
    bx(x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3, 0, 0.3, col('#d8d4c8'));
    body(x0, z0, x1, z1, 1, wh, { extra: h - FS });
    for (const [side, pl, a, b] of [['w', x0, z0, z1], ['e', x1, z0, z1], ['n', z0, x0, x1]]) winRow(side, pl, a, b, 1, { sp: 1.5, ww: 0.6, wh: 1.3, frame: col('#3a8a7a'), glass: col('#8ac0c8'), skip: side === 'w' ? [[20.5, 22.5]] : [] });
    // pintu lengkung di barat (menghadap lapangan basket)
    door('w', x0, 21.5, 0.3, 1.4, 1.9, col('#3a8a6a')); bx(x0 - 0.1, 20.6, x0, 22.4, 2.2, 0.3, K.emas);
    at(74, 21.5).hip(XF(74, 21.5, Math.PI / 2), 0, h, 0, 9, 7, 1.0, col('#4a8a7a'), 0.4);
    // kubah tosca di atas leher bersegi + puncak emas
    bx(72.4, 19.9, 75.6, 23.1, h + 0.4, 1.0, wh);
    for (let i = 0; i < 6; i++) { const t = i / 6, r = 2.0 * Math.cos(t * Math.PI / 2), y = h + 1.4 + 2.0 * Math.sin(t * Math.PI / 2); cyl(74, 21.5, r, y, 2.0 / 6 * 1.05, shade(K.kubah, 0.9 + 0.15 * t), 14); }
    post(74, 21.5, h + 4.0, K.emas, 0.12, false); bx(73.85, 21.35, 74.15, 21.65, h + 3.4, 0.35, K.emas);
    // menara kecil
    body(76.6, 17.1, 77.4, 17.9, 2, wh, { extra: 1.4 });
    bx(76.5, 17.0, 77.5, 18.0, 2 * FS + 1.0, 0.12, K.kubah); cyl(77, 17.5, 0.42, 2 * FS + 1.4, 0.3, K.kubah, 8); post(77, 17.5, 2 * FS + 2.3, K.emas, 0.06, false);
    // tempat wudu 7 x 3: atap datar di tiang, dinding keran
    bx(x0, 26.5, x1, 26.9, 0, 1.0, col('#d8e4e6')); for (let x = x0 + 0.6; x < x1; x += 0.8) bx(x, 26.9, x + 0.08, 27.05, 0.75, 0.08, col('#c0c0c8'));
    bx(x0, 26.5, x1, 29.5, 2.2, 0.12, col('#cfe4ea'), { bottom: true });
    for (const x of [x0 + 0.1, x1 - 0.1]) for (const z of [26.6, 29.4]) post(x, z, 2.2, K.putih, 0.14);
    solid(x0, 26.5, x1, 26.9);
  }

  /* ======================= KANTIN: 6 lapak warna-warni + pelataran ======================= */
  {
    const cols = [K.merah, K.kuning, K.oranye, K.biru, K.hijauBalkon, K.ungu];
    for (let i = 0; i < 6; i++) {
      const xa = 58 + i * 3, xb = xa + 3, c = cols[i];
      bx(xa + 0.05, 34, xb - 0.05, 34.3, 0, 2.4, mix(c, K.krem, 0.55));                  // dinding belakang
      bx(xa + 0.05, 34.3, xa + 0.2, 37.2, 0, 2.2, mix(c, K.krem, 0.4)); bx(xb - 0.2, 34.3, xb - 0.05, 37.2, 0, 2.2, mix(c, K.krem, 0.4));
      bx(xa + 0.2, 36.7, xb - 0.2, 37.2, 0, 0.95, c, { top: col('#e8e4da') });          // meja saji
      bx(xa + 0.4, 34.3, xb - 0.4, 34.9, 0, 1.3, col('#d0ccc4'));                       // rak/kompor
      bx(xa + 0.6, 36.75, xa + 1.1, 37.1, 0.95, 0.35, col('#f0f0f0')); bx(xa + 1.6, 36.8, xa + 2.2, 37.1, 0.95, 0.25, pick([K.kuning, K.merah, K.putih], hash(i, 9)));
      // atap miring (tinggi di belakang)
      const m = at(xa + 1.5, 36);
      m.poly([[OX + xa, 2.25, 37.5], [OX + xb, 2.25, 37.5], [OX + xb, 2.75, 33.8], [OX + xa, 2.75, 33.8]], c);
      m.poly([[OX + xa, 2.75, 33.8], [OX + xb, 2.75, 33.8], [OX + xb, 2.25, 37.5], [OX + xa, 2.25, 37.5]], shade(c, 0.6));
      // tenda bergaris putih
      for (let k = 0; k < 6; k++) bx(xa + k * 0.5, 37.5, xa + k * 0.5 + 0.5, 38.3, 2.0, 0.08, k % 2 ? K.putih : c, { bottom: true });
      bx(xa + 0.6, 37.5, xb - 0.6, 37.56, 1.7, 0.3, K.putih);                         // papan nama kecil
      solid(xa, 34, xb, 37.2);
    }
    for (const x of [58.1, 64.1, 70.1, 75.9]) post(x, 38.2, 2.0, col('#6a6a70'), 0.1);
    // meja panjang + bangku
    for (let i = 0; i < 3; i++) for (const z of [38.7, 41.0]) {
      const x = 59 + i * 6;
      bx(x, z, x + 4.4, z + 0.8, 0.62, 0.08, col('#9a6a40')); for (const xx of [x + 0.3, x + 4.0]) bx(xx, z + 0.2, xx + 0.12, z + 0.6, 0, 0.62, col('#6a4a30'));
      for (const s of [-0.45, 1.05]) bx(x, z + s, x + 4.4, z + s + 0.2, 0.36, 0.06, col('#7a5434'));
      solid(x, z, x + 4.4, z + 0.8);
    }
    // tempat sampah
    for (let i = 0; i < 3; i++) bx(75.2, 38.6 + i * 0.5, 75.6, 39.0 + i * 0.5, 0, 0.55, [col('#2a8a4a'), col('#e8c040'), col('#c83a3a')][i]);
  }

  /* ======================= TOILET & GUDANG 14..21 x 33.5..42.5 ======================= */
  {
    body(14, 33.5, 21, 42.5, 1, col('#e6dcc0'));
    for (let z = 34.4; z < 42; z += 1.6) { door('e', 21, z + 0.5, 0.1, 0.75, 1.55, col('#2a6ac0')); bx(21, z, 21.05, z + 0.3, 1.7, 0.25, K.roster); }
    winRow('w', 14, 33.5, 42.5, 1, { sp: 1.5, ww: 0.5, wh: 0.35, y0: 1.5 });
    at(17.5, 38).gable(XF(17.5, 38, Math.PI / 2), 0, FS, 0, 9, 7, 1.3, col('#8a8f94'), 0.3, col('#e6dcc0'));
    bx(14, 42.5, 15.2, 42.9, 0, 0.9, col('#c0c0c8'));   // bak air
  }

  /* ======================= GEDUNG LAMA 3.5..13.5 x 3..11 + menara lonceng ======================= */
  {
    const h = 3.2, w = K.lama, moss = K.lumut;
    body(3.5, 3, 13.5, 11, 1, w, { extra: h - FS, plint: shade(moss, 0.8) });
    bx(3.46, 2.96, 13.54, 11.04, 0, 0.8, mix(w, moss, 0.55));
    for (let i = 0; i < 9; i++) { const x = 3.5 + hash(i, 61) * 9, y = 0.8 + hash(i, 62) * 2; bx(x, 11, x + 0.5 + hash(i, 63), 11.05, y, 0.3 + hash(i, 64) * 0.6, mix(w, moss, 0.7)); }
    // jendela tinggi ditutup papan
    for (const [side, pl, a, b] of [['s', 11, 3.5, 13.5], ['n', 3, 3.5, 13.5], ['w', 3.5, 3, 11], ['e', 13.5, 3, 11]])
      winRow(side, pl, a, b, 1, { sp: 1.6, ww: 0.6, wh: 1.7, y0: 0.6, glass: col('#6a4a30'), frame: col('#4a3a2a'), skip: side === 's' ? [[7.5, 9.5]] : [] });
    door('s', 11, 8.5, 0, 1.2, 2.1, col('#5a3a20')); bx(8.45, 11.05, 8.65, 11.12, 1.0, 0.25, col('#b0a060'));   // pintu jati + gembok
    at(8.5, 7).hip(XF(8.5, 7), 0, h, 0, 10, 8, 2.4, K.lamaAtap, 0.4);
    // menara lonceng kosong
    const t0 = h + 1.0;
    bx(7.2, 5.5, 10.2, 8.5, h, 1.8, w);
    for (const x of [7.3, 10.1]) for (const z of [5.6, 8.4]) bx(x - 0.15, z - 0.15, x + 0.15, z + 0.15, t0 + 0.8, 1.4, w);
    bx(7.1, 5.4, 10.3, 8.6, t0 + 2.2, 0.2, shade(w, 0.85));
    at(8.7, 7).hip(XF(8.7, 7), 0, t0 + 2.4, 0, 3, 3, 1.6, col('#2a2826'), 0.25);
    // jalur ke pintu terkunci
    bx(8, 11, 9, 12.2, 0, 0.04, col('#a09a8a'));
  }

  /* ======================= KEBUN & GREENHOUSE ======================= */
  {
    bx(3.5, 41, 12.5, 43.4, 0, 1.8, col('#dceaee'));
    at(8, 42.2).gable(XF(8, 42.2), 0, 1.8, 0, 9, 2.4, 0.8, col('#eef6f6'), 0.05, col('#dceaee'));
    for (let x = 3.5; x <= 12.6; x += 1) bx(x - 0.04, 43.38, x + 0.04, 43.46, 0, 1.8, col('#8a9aa0'));
    door('s', 43.4, 8, 0, 0.9, 1.6, col('#b0c8cc'));
    solid(3.5, 41, 12.5, 43.4);
    for (const z of [38.9, 40.0]) { bx(3.8, z, 12.4, z + 0.8, 0, 0.15, col('#7a5a3a')); bx(3.6, z + 0.2, 3.7, z + 0.6, 0, 0.5, K.putih); }
  }

  /* ======================= LAPANGAN: mimbar, tiang bendera, basket ======================= */
  {
    bx(36.5, 16.4, 41.5, 18.4, 0, 0.55, K.krem, { top: col('#e0d8c0') });
    bx(37.5, 18.4, 40.5, 19.0, 0, 0.27, K.krem);
    bx(36.4, 16.3, 41.6, 16.45, 0.55, 0.5, K.putih);   // pagar mimbar belakang
    solid(36.5, 16.4, 41.5, 18.4);
    post(39, 17.0, 7.5, col('#e8e8e8'), 0.12, false);
    bx(39.06, 16.98, 40.2, 17.02, 6.95, 0.38, col('#d8282e')); bx(39.06, 16.98, 40.2, 17.02, 6.57, 0.38, col('#f8f8f8'));
    // basket: ring di kedua ujung, gawang futsal lipat di sisi, bangku kayu di selatan
    // ring basket (tiang, papan, ring berjaring) + bola: activities.js, supaya bisa dimainkan
    for (const z of [19, 27]) { bx(54.2, z - 1.4, 54.4, z + 1.4, 0, 1.2, col('#f0f0f0')); bx(54.2, z - 1.4, 54.9, z - 1.3, 0, 1.2, col('#f0f0f0')); bx(54.2, z + 1.3, 54.9, z + 1.4, 0, 1.2, col('#f0f0f0')); solid(54.2, z - 1.4, 54.9, z + 1.4); }
    bx(54.3, 30.2, 68.7, 30.9, 0.4, 0.08, col('#9a6a40'));
    for (let x = 54.6; x < 68.7; x += 2.8) bx(x, 30.4, x + 0.12, 30.7, 0, 0.4, col('#6a4a30'));
    solid(54.3, 30.2, 68.7, 30.9);
  }

  /* ======================= BERINGIN + bangku melingkar ======================= */
  const bcx = 18.7, bcz = 22.7;
  {
    const m = at(bcx, bcz), xf = XF(bcx, bcz), tr = col('#6a5a44'), lf = [col('#3f7a36'), col('#4a8a40'), col('#56964a')];
    m.box(xf, 0, 0, 0, 1.3, 3.2, 1.3, tr); m.box(xf, 0.9, 0, 0.3, 0.6, 0.5, 0.5, tr); m.box(xf, -0.7, 0, -0.6, 0.5, 0.4, 0.6, tr);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; m.box(XF(bcx, bcz, a), 1.3, 2.6, 0, 1.6, 0.35, 0.35, tr); }
    m.box(xf, 0, 3.0, 0, 8.4, 1.5, 8.4, lf[0], { top: lf[1], bottom: true });
    m.box(xf, -1.2, 4.2, 0.8, 5.2, 1.3, 5.0, lf[1], { top: lf[2] }); m.box(xf, 1.4, 4.0, -1.2, 4.6, 1.4, 4.6, lf[1], { top: lf[2] });
    m.box(xf, 0, 5.2, 0, 4, 1.1, 4, lf[2], { top: col('#68a856') });
    for (let i = 0; i < 30; i++) { const a = hash(i, 81) * 6.28, r = 1.2 + hash(i, 82) * 2.8; m.box(xf, Math.cos(a) * r, 1.6 + hash(i, 83) * 1.2, Math.sin(a) * r, 0.06, 3.0 - (1.6 + hash(i, 83) * 1.2) + 0.02, 0.06, col('#7a6a4a')); }   // akar gantung
    C.circle(OX + bcx, bcz, 0.9);
    for (let i = 0; i < 12; i++) {
      if (i === 2 || i === 8) continue;   // celah masuk
      const a = (i + 0.5) / 12 * Math.PI * 2, r = 3.3, x = bcx + Math.cos(a) * r, z = bcz + Math.sin(a) * r, bxf = XF(x, z, a + Math.PI / 2);
      const mm = at(x, z); mm.box(bxf, 0, 0.4, 0, 1.7, 0.08, 0.5, col('#8a5a34')); mm.box(bxf, 0, 0, 0, 1.2, 0.4, 0.12, col('#6a4a30'));
      C.box(OX + x, z, 0.85, 0.25, a + Math.PI / 2);
    }
  }

  /* ======================= SELASAR BERATAP (lebar 2, tiang besi hijau) ======================= */
  {
    const roofC = col('#b4b8bc'), H = 2.4;
    const sel = (x0, z0, x1, z1) => {
      bx(x0, z0, x1, z1, H, 0.08, roofC, { bottom: true });
      const along = x1 - x0 > z1 - z0, len = along ? x1 - x0 : z1 - z0, n = Math.max(1, Math.round(len / 3));
      for (let i = 0; i <= n; i++) {
        const u = (along ? x0 : z0) + 0.1 + i * (len - 0.2) / n;
        for (const v of along ? [z0 + 0.1, z1 - 0.1] : [x0 + 0.1, x1 - 0.1]) post(along ? u : v, along ? v : u, H, K.besi, 0.12);
      }
      for (let u = along ? x0 : z0; u < (along ? x1 : z1) - 0.1; u += 1.5) along ? bx(u, z1 - 0.02, u + 0.75, z1 + 0.02, H - 0.1, 0.1, K.hijau) : bx(x1 - 0.02, u, x1 + 0.02, u + 0.75, H - 0.1, 0.1, K.hijau);
    };
    sel(27, 31.5, 51, 33.5); sel(24, 15.5, 26, 31.5); sel(52, 15.5, 54, 31.2); sel(13, 15.5, 24, 17.5);
    // papan pengumuman di tiang selasar
    bx(25.94, 22, 26.0, 23.6, 1.0, 1.0, col('#7a4a2a')); bx(26.0, 22.1, 26.04, 23.5, 1.1, 0.8, col('#f0ecd8'));
  }

  /* ======================= PLAZA, KOLAM, JALAN MASUK ======================= */
  {
    const n = 18, r = 2.2;
    for (let i = 0; i < n; i++) {
      const a = (i + 0.5) / n * Math.PI * 2, x = 39 + Math.cos(a) * r, z = 49.5 + Math.sin(a) * r;
      at(x, z).box(XF(x, z, a), 0, 0, 0, 0.3, 0.42, 0.82, col('#d8d2c4'), { top: col('#e8e2d4') });
    }
    const m = at(39, 49.5), wpts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; wpts.push([OX + 39 + Math.cos(a) * (r - 0.1), 0.3, 49.5 + Math.sin(a) * (r - 0.1)]); }
    m.poly(wpts.reverse(), col('#5f98c4'));
    cyl(39, 49.5, 0.6, 0, 0.55, K.putih, 10); cyl(39, 49.5, 0.32, 0.55, 0.5, K.putih, 10); cyl(39, 49.5, 0.18, 1.05, 0.35, col('#bfe0f4'), 8);
    C.circle(OX + 39, 49.5, 2.4);
    for (const [x, z, a] of [[34.4, 47.4, 0.4], [43.6, 47.4, -0.4], [34.4, 51.6, -0.4], [43.6, 51.6, 0.4]]) {
      const bxf = XF(x, z, a + Math.PI / 2), mm = at(x, z);
      mm.box(bxf, 0, 0, 0, 1.6, 0.4, 0.55, col('#b8b2a6'), { top: col('#ccc6b8') }); C.box(OX + x, z, 0.8, 0.28, a + Math.PI / 2);
    }
  }

  /* ======================= GERBANG, POS SATPAM, PAGAR ======================= */
  {
    // gapura: dua pilar bata + lengkung besi hijau tua + papan nama
    for (const [x0, x1] of [[33.2, 35], [43, 44.8]]) {
      bx(x0, 54, x1, 55.5, 0, 2.8, K.bata); bx(x0 - 0.1, 53.9, x1 + 0.1, 55.6, 2.8, 0.2, K.putih);
      for (let y = 0.4; y < 2.6; y += 0.4) bx(x0 - 0.02, 54, x1 + 0.02, 55.5, y, 0.04, shade(K.bata, 0.8));
      bx(x0 + 0.5, 54.3, x1 - 0.5, 55.2, 3.0, 0.3, col('#fff3c0'));   // lampu pilar
      solid(x0, 54, x1, 55.5);
    }
    const n = 16;
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = 35 + t * 8, y = 2.75 + Math.sin(t * Math.PI) * 0.9; bx(x - 0.27, 54.65, x + 0.27, 54.85, y, 0.16, K.besi); }
    for (let x = 35.5; x < 43; x += 0.7) { const t = (x - 35) / 8; bx(x - 0.03, 54.72, x + 0.03, 54.78, 2.75, Math.sin(t * Math.PI) * 0.9, K.besi); }
    bx(35.8, 54.6, 42.2, 54.9, 2.15, 0.55, K.hijau); bx(36, 54.9, 42, 54.94, 2.3, 0.26, K.emas); letters(36.2, 41.8, 54.94, 2.32, 0.2, K.hijau);
    // pintu besi dorong (terbuka, digeser ke balik pagar barat)
    for (let x = 29; x < 33.1; x += 0.3) bx(x, 54.95, x + 0.06, 55.05, 0.05, 1.5, K.besi);
    bx(29, 54.92, 33.1, 55.08, 1.45, 0.1, K.besi); bx(29, 54.92, 33.1, 55.08, 0.1, 0.1, K.besi);
    // pos satpam bulat, kaca keliling, atap limas kecil
    cyl(46.5, 52.2, 1.6, 0, 0.9, K.krem, 14); cyl(46.5, 52.2, 1.62, 0.9, 0.9, col('#8ab4cc'), 14, false); cyl(46.5, 52.2, 1.6, 1.8, 0.35, K.krem, 14);
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, x = 46.5 + Math.cos(a) * 1.63, z = 52.2 + Math.sin(a) * 1.63; at(x, z).box(XF(x, z, a), 0, 0.9, 0, 0.08, 0.9, 0.1, K.putih); }
    door('w', 44.92, 52.2, 0, 0.8, 1.7, K.kusen);
    cone(46.5, 52.2, 2.0, 2.15, 1.2, K.genteng, 14); bx(46.4, 52.1, 46.6, 52.3, 3.3, 0.3, K.putih);
    C.circle(OX + 46.5, 52.2, 1.6);
    bx(44.4, 50.4, 44.7, 50.7, 0, 1.2, col('#3a3a40')); bx(44.3, 50.3, 44.8, 50.8, 1.2, 0.4, K.merah);   // palang/lampu
    // pagar keliling: tembok bata setengah + besi hijau, tiang tiap 3 petak dengan lampu
    const fence = (x0, z0, x1, z1, o = {}) => {
      const along = Math.abs(x1 - x0) > Math.abs(z1 - z0), len = along ? x1 - x0 : z1 - z0;
      const B = (u0, u1, y, h, c, t) => along ? bx(u0, z0 - t, u1, z0 + t, y, h, c) : bx(x0 - t, u0, x0 + t, u1, y, h, c);
      const a0 = along ? x0 : z0, a1 = along ? x1 : z1;
      B(a0, a1, 0, 0.65, K.bata, 0.16); B(a0, a1, 0.65, 0.06, K.putih, 0.18);
      if (!o.low) {
        B(a0, a1, 1.55, 0.07, K.besi, 0.05); B(a0, a1, 1.0, 0.04, K.besi, 0.04);
        for (let u = a0 + 0.25; u < a1; u += 0.45) B(u, u + 0.05, 0.7, 0.88, K.besi, 0.03);
      }
      for (let u = Math.ceil(a0 / 3) * 3; u <= a1; u += 3) { B(u - 0.2, u + 0.2, 0, 1.75, K.bata, 0.22); B(u - 0.14, u + 0.14, 1.75, 0.2, col('#fff3c0'), 0.14); }
      if (o.coll !== false) along ? solid(x0, z0 - 0.18, x1, z0 + 0.18) : solid(x0 - 0.18, z0, x0 + 0.18, z1);
    };
    fence(2, 2, 32.6, 2); fence(32.6, 2, 34.4, 2, { low: true, coll: false }); fence(34.4, 2, 78, 2);   // titik loncat ke warung Mak Iyah
    fence(2, 2, 2, 55.5); fence(78, 2, 78, 55.5); fence(2, 55.5, 33.2, 55.5); fence(44.8, 55.5, 78, 55.5);
    bx(32.9, 2.4, 33.6, 3.0, 0, 0.6, col('#8a6a40')); solid(32.9, 2.4, 33.6, 3.0);   // peti kayu untuk pijakan
  }

  /* ======================= PARKIRAN MOTOR SISWA (kanopi bergelombang) ======================= */
  const motor = (x, z, a, c, i = 0) => V.motor(at(x, z), XF(x, z, a), c, hash(i, 77) < 0.5 ? 'matic' : 'bebek', { helmet: hash(i, 78) < 0.25 ? pick(['#e8e8e8', '#2a2a2e', '#c83a3a', '#f0c020'], hash(i, 79)) : null });
  {
    const mc = ['#2a2a2e', '#c83a3a', '#2a6ac0', '#e8e8e8', '#3a9a6a', '#1e1e22', '#8a8a90'];
    for (let r = 0; r < 3; r++) {
      const z0 = 45 + r * 3, xe = r === 0 ? 26 : 29;
      bx(5, z0 - 0.1, xe, z0 + 2.1, 2.2, 0.06, K.kanopi, { bottom: true });
      for (let x = 5; x < xe - 0.4; x += 1) bx(x, z0 - 0.12, x + 0.5, z0 + 2.12, 2.26, 0.06, shade(K.kanopi, 0.82));
      for (let x = 5.1; x <= xe; x += (xe - 5.2) / 4) post(x, z0 + 1.0, 2.2, col('#6a7078'), 0.12);
      for (let i = 0; i < 16; i++) {
        const x = 5.5 + i * 1.45; if (x > xe - 0.5 || hash(i, r + 30) < 0.18) continue;
        motor(x, z0 + 1.0, Math.PI + (hash(i, r) - 0.5) * 0.2, pick(mc, hash(i, r + 40)), i * 3 + r);
        C.box(OX + x, z0 + 1.0, 0.2, 0.78);
      }
    }
    // tempat cuci motor: keran & ember
    post(29.2, 44.6, 0.9, col('#8a8a90'), 0.1); bx(29.0, 44.75, 29.3, 44.85, 0.75, 0.06, col('#c0c0c8'));
    cyl(28.6, 45.1, 0.22, 0, 0.32, col('#2a8ae0'), 8); cyl(27.6, 46.0, 0.2, 0, 0.3, col('#e8c040'), 8);
    motor(27.8, 45.4, Math.PI / 2 + 0.1, '#c83a3a', 5); C.box(OX + 27.8, 45.4, 0.78, 0.2);
  }

  /* ======================= PARKIR GURU (6 mobil) ======================= */
  {
    const cc = ['#f2f2f0', '#9a9aa0', '#b83a3a', '#3f6fa8', '#2a2a2a', '#f2f2f0'];
    for (let i = 0; i < 6; i++) {
      const x = 50 + i * 2.3 + 1.15, z = 47.7;
      if (i === 4) continue;   // satu slot kosong
      V.car(at(x, z), XF(x, z, Math.PI), cc[i], ['mpv', 'sedan', 'sedan', 'mpv', '', 'pikap'][i], { cargo: '#c8a060' });
      C.box(OX + x, z, 0.8, 1.72);
    }
    for (let i = 0; i < 7; i++) bx(50 + i * 2.3 - 0.15, 49.4, 50 + i * 2.3 + 0.15, 49.7, 0, 0.12, col('#e8e0c0'));   // stopper
  }

  /* ======================= TAMAN MADING & RAK SEPEDA ======================= */
  {
    bx(67, 45, 76, 45.3, 0, 2.0, K.kusen); bx(67.2, 45.3, 75.8, 45.36, 0.5, 1.3, col('#f4f0e0')); bx(67, 44.9, 76, 45.45, 2.0, 0.12, K.genteng);
    for (let i = 0; i < 14; i++) { const x = 67.4 + hash(i, 91) * 7.8, y = 0.6 + hash(i, 92) * 0.9; bx(x, 45.36, x + 0.35 + hash(i, 93) * 0.3, 45.39, y, 0.3 + hash(i, 94) * 0.2, col(pick(['#ffffff', '#f6e08a', '#a8d8f0', '#f6b0c0'], hash(i, 95)))); }
    bx(67.2, 45.36, 75.8, 45.42, 0.5, 1.3, col('#cfe6f0'));   // kaca mading (agak tembus)
    solid(67, 45, 76, 45.45);
    // rak sepeda 8 slot + 2 sepeda
    bx(67, 50, 74.2, 50.12, 0.45, 0.06, col('#9aa0a6'));
    for (let i = 0; i < 8; i++) bx(67.3 + i * 0.9, 49.7, 67.38 + i * 0.9, 50.4, 0, 0.5, col('#9aa0a6'));
    for (const [i, c] of [[1, '#2a8ae0'], [4, '#e04a4a'], [6, '#3a9a5a']]) { const x = 67.34 + i * 0.9; V.sepeda(at(x, 50), XF(x, 50.05, Math.PI), c, { basket: i === 4 }); }
    solid(67, 49.7, 74.2, 50.4);
    for (const x of [68, 71.5, 75]) { bx(x - 0.6, 52.3, x + 0.6, 52.7, 0.4, 0.06, col('#8a5a34')); bx(x - 0.5, 52.4, x - 0.4, 52.6, 0, 0.4, col('#6a4a30')); bx(x + 0.4, 52.4, x + 0.5, 52.6, 0, 0.4, col('#6a4a30')); solid(x - 0.6, 52.3, x + 0.6, 52.7); }
  }

  /* ======================= LAMPU TAMAN & BENDA KECIL ======================= */
  {
    const lamp = (x, z) => { post(x, z, 2.6, col('#2a3a30'), 0.1); bx(x - 0.18, z - 0.18, x + 0.18, z + 0.18, 2.6, 0.3, col('#fff3c0')); bx(x - 0.24, z - 0.24, x + 0.24, z + 0.24, 2.9, 0.08, col('#2a3a30')); };
    for (const z of [47.5, 51, 54]) { lamp(36.2, z); lamp(41.8, z); }
    for (const [x, z] of [[24.4, 14.6], [53.6, 14.6], [56, 33], [13.5, 30], [66, 17], [60, 43.2]]) lamp(x, z);
    for (const [x, z] of [[26.4, 30.6], [51.6, 30.6], [36, 13.8], [44, 13.8]]) { bx(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 0, 0.6, col('#2a8a4a')); solid(x - 0.2, z - 0.2, x + 0.2, z + 0.2); }
  }

  /* ======================= WARUNG MAK IYAH (di luar pagar utara) ======================= */
  {
    bx(29, 0, 38, 1.8, 0, 0.12, col('#a89a7a'));
    bx(29.2, -0.6, 37.8, 0, 0, 2.0, col('#c4786e'));
    bx(29.4, 1.2, 37.6, 1.6, 0, 0.9, col('#9a6a40'), { top: col('#c8b090') });
    at(33.5, 0.6).box(XF(33.5, 0.6), 0, 2.1, 0, 9.4, 0.08, 2.8, col('#8a5a44'), { bottom: true });
    for (const x of [29.3, 37.7]) post(x, 1.9, 2.1, col('#6a4a30'), 0.12);
    for (let i = 0; i < 6; i++) bx(29.8 + i * 1.3, 1.25, 30.3 + i * 1.3, 1.55, 0.9, 0.3, col(pick(['#f0c040', '#e04a4a', '#ffffff', '#4ac07a'], hash(i, 17))));
    solid(29.2, -0.6, 37.8, 0); solid(29.4, 1.2, 37.6, 1.6);
    for (const x of [31, 35]) { bx(x - 0.6, 2.4, x + 0.6, 2.8, 0, 0.4, col('#7a5434')); }
  }

  for (const m of ch.meshes(MAT.world)) scene.add(m);

  /* ======================= TANAMAN ======================= */
  const veg = [];
  const shade16 = [[15, 47.5], [31, 43.6], [47, 43.6], [64.5, 44.5], [3.5, 14], [14.5, 9.5], [63, 31.5], [22.5, 29],
    [76, 31], [77, 36.2], [51, 15], [27, 15], [15.5, 30], [69.6, 30.4], [76, 41.5], [3.5, 31.5]];
  shade16.forEach(([x, z], i) => { veg.push({ k: i % 3 ? 'ketapang' : 'bulat', x: OX + x, z, s: 0.75 + hash(i, 3) * 0.25, a: hash(i, 4) * 6 }); C.circle(OX + x, z, 0.3); });
  // hutan kecil di belakang & kebun di samping (luar pagar)
  for (let i = 0; i < 34; i++) { const x = -10 + hash(i, 1) * 100, z = -9 + hash(i, 2) * 6.5; if (x > 27 && x < 40) continue; veg.push({ k: hash(i, 3) < 0.5 ? 'cemara' : 'bulat', x: OX + x, z, s: 0.7 + hash(i, 5) * 0.5, a: hash(i, 4) * 6 }); C.circle(OX + x, z, 0.3); }
  for (let i = 0; i < 26; i++) { const s = i % 2 ? -1 : 1, x = s < 0 ? -2 - hash(i, 4) * 8 : 80 + hash(i, 4) * 10, z = hash(i, 5) * 52; veg.push({ k: pick(['bulat', 'pisang', 'bulat', 'kelapa'], hash(i, 7)), x: OX + x, z, s: 0.7 + hash(i, 6) * 0.4, a: hash(i, 8) * 6 }); C.circle(OX + x, z, 0.3); }
  // pagar tanaman & bunga di sepanjang jalan masuk, taman, dan depan gedung
  for (let z = 52; z <= 55; z += 1.5) for (const x of [36.0, 42.0]) veg.push({ k: 'pot', x: OX + x, z, s: 1.2, a: 0 });
  for (let x = 23; x < 56; x += 1.1) if (x < 35 || x > 43) veg.push({ k: 'pagarHidup', x: OX + x, z: 43.6, sx: 1.1, a: 0 });
  for (let x = 18.5; x < 61.5; x += 3.67) veg.push({ k: 'pot', x: OX + x + 1.2, z: 12.6, a: 0 });
  for (let i = 0; i < 22; i++) veg.push({ k: i % 3 ? 'semak' : 'bunga', x: OX + 66.6 + (i % 11) * 0.95, z: 46.8 + Math.floor(i / 11) * 6, a: 0, c: pick(['#f06080', '#f0d040', '#ffffff'], hash(i, 8)) });
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; veg.push({ k: 'bunga', x: OX + 39 + Math.cos(a) * 4.9, z: 49.5 + Math.sin(a) * 4.9, a, c: pick(['#f06080', '#f0d040', '#ff9040'], hash(i, 18)) }); }
  for (let z = 15.5; z < 37; z += 1.2) veg.push({ k: 'semak', x: OX + 13.6, z, s: 0.7, a: 0 });
  for (let x = 4; x < 12.4; x += 0.6) for (const z of [39.3, 40.4]) veg.push({ k: 'semak', x: OX + x, z, s: 0.35, sy: 1.4, a: hash(x * 10, z) * 6 });
  // gedung lama: rumput liar setinggi lutut
  for (let i = 0; i < 140; i++) { const x = 2.4 + hash(i, 71) * 12.6, z = 2.4 + hash(i, 72) * 10; if (x > 3.3 && x < 13.7 && z > 2.8 && z < 11.2) continue; veg.push({ k: 'rumput', x: OX + x, z, s: 2.2 + hash(i, 73), a: hash(i, 74) * 6 }); }
  // rumput di sisa lahan hijau (tidak di paving/gedung)
  const busy = (x, z) => SCHOOL_ZONES.some(([x0, z0, x1, z1, k]) => k !== 'beringin' && k !== 'mading' && x > x0 - 0.5 && x < x1 + 0.5 && z > z0 - 0.5 && z < z1 + 0.5);
  for (let i = 0; i < 700; i++) {
    const x = -10 + hash(i, 301) * 100, z = -8 + hash(i, 302) * 64;
    if (z > 55 && z < 62.5) continue; if (busy(x, z)) continue; if (Math.hypot(x - bcx, z - bcz) < 3.8) continue;
    veg.push({ k: hash(i, 303) < 0.1 ? 'bunga' : 'rumput', x: OX + x, z, a: hash(i, 304) * 6, c: pick(['#f06080', '#f0d040', '#ffffff'], hash(i, 305)) });
  }
  // pohon di seberang jalan
  for (let i = 0; i < 10; i++) { const x = -8 + i * 10 + hash(i, 9) * 3; veg.push({ k: 'bulat', x: OX + x, z: 63.4, s: 0.8, a: i }); C.circle(OX + x, 63.4, 0.3); }
  plant(scene, veg);

  parked.end(C, null);
  // batas luar area sekolah (jalan depan bisa dilalui, tapi tidak bisa jauh-jauh)
  C.box(OX + 40, 62.6, 56, 0.5); C.box(OX - 12, 26, 0.5, 40); C.box(OX + 92, 26, 0.5, 40); C.box(OX + 40, -9.5, 56, 0.5);
  const zones = SCHOOL_ZONES.map(([x0, z0, x1, z1, k, name]) => ({ x0: OX + x0, z0, x1: OX + x1, z1, k, name }));
  return {
    zones,
    zoneAt(x, z) { for (const q of zones) if (x >= q.x0 && x <= q.x1 && z >= q.z0 && z <= q.z1) return q.name; return z > 55.6 ? 'Jl. Merdeka (depan sekolah)' : 'SMA Negeri 3 Wirabumi'; },
    groundTex: tex.image, gx0: GX, gz0: GZ, gw: GW,
  };
}
