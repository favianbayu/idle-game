// Wilayah luar kota (guide 86, peta_dunia.py -> data/dunia.json): gunung Sangkala, Sukamekar & kebun teh, waduk,
// Tegalsari, batalyon & industri, sirkuit, pantai Lintang, pesisir, muara. Dipilih favian: tiap wilayah = AREA TERPISAH,
// pindah lewat travel (jalan keluar kota, terminal/stasiun/halte). Koordinat dunia sama dengan peta dunia (kota di 0..260 x
// 0..180), tapi area luar digeser LZ ke selatan supaya tidak bertumpuk dengan kota. Hanya satu wilayah dibangun sekaligus.
import * as THREE from 'three';
import DUNIA from './data/dunia.json';
import { Merger, Chunks, col, shade } from './geom.js';
import { MAT, hash, pick, inPoly, makePatterns, PAT, groundDetail, FLOOR } from './common.js';
import { plant, SMALL } from './veg.js';
import { waterMat, grassVariety, roadWear, strokeOffset, strokePath, resample } from './kota.js';

export const LZ = 1000;
const PX = 16, TOWN = [0, 0, 260, 180], [BX0, BZ0, BX1, BZ1] = DUNIA.bounds, GW = BX1 - BX0 + 1, GH = BZ1 - BZ0 + 1;
const inR = (r, x, z) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
// urutan = prioritas (wilayah tidak bertumpuk). halte: titik naik-turun angkutan umum; mode & tarif dari kota.
export const ZONES = [
  { id: 'sirkuit', name: 'Sirkuit Tanjung Pradana', rects: [[260, 140, 410, 236]], halte: [316, 186], mode: 'Angkot', fare: 4000 },
  { id: 'muara', name: 'Muara & Kampung Nelayan', rects: [[290, 236, 410, 300]], halte: [318, 250], mode: 'Angkot', fare: 5000 },
  { id: 'timur', name: 'Batalyon 3 & Kawasan Industri', rects: [[260, 12, 410, 140]], halte: [300, 90], mode: 'Angkot', fare: 4000 },
  { id: 'sukamekar', name: 'Desa Sukamekar & Kebun Teh', rects: [[175, -130, 410, 0], [260, 0, 410, 12]], halte: [262, -38], mode: 'Bus', fare: 10000 },
  { id: 'gunung', name: 'Gunung Sangkala', rects: [[0, -130, 175, 0]], halte: [128, -56], mode: 'Ojek', fare: 15000 },
  { id: 'waduk', name: 'Waduk Sirnagalih', rects: [[-150, -130, 0, 60]], halte: [-62, -8], mode: 'Ojek', fare: 12000 },
  { id: 'tegalsari', name: 'Desa Tegalsari', rects: [[-150, 60, 0, 236]], halte: [-88, 112], mode: 'Bus', fare: 10000 },
  { id: 'pesisir', name: 'Pesisir Lintang', rects: [[-150, 236, 90, 300], [0, 180, 90, 236]], halte: [34, 248], mode: 'Kereta', fare: 5000 },
  { id: 'pantai', name: 'Pantai Lintang & Pandansari', rects: [[90, 180, 290, 300]], halte: [150, 246], mode: 'Angkot', fare: 4000 },
];
const ZB = Object.fromEntries(ZONES.map(Z => [Z.id, Z]));
for (const Z of ZONES) { Z.x0 = Math.min(...Z.rects.map(r => r[0])); Z.z0 = Math.min(...Z.rects.map(r => r[1])); Z.x1 = Math.max(...Z.rects.map(r => r[2])); Z.z1 = Math.max(...Z.rects.map(r => r[3])); }
export function zoneOf(x, z) { if (x >= TOWN[0] && x <= TOWN[2] && z >= TOWN[1] && z <= TOWN[3]) return 'kota';   // tepi kota termasuk kota: jalan keluar mulai tepat di tepi
  for (const Z of ZONES) if (Z.rects.some(r => inR(r, x, z))) return Z.id; return null; }

// tokoh penghuni tiap wilayah: [wilayah, gaya, nama, x, z, kalimat]
const FOLK = [
  ['gunung', 'pemuda', 'Kang Ujang (porter)', 131, -57, ['Mau muncak? Lapor dulu di pos 1, Dek.', 'Jalur ke kawah 3 jam kalau santai.', 'Bawa jaket, di atas dingin banget.']],
  ['gunung', 'ibuHijab', 'Teh Neneng', 168, -50, ['Jagung bakar, Dek! Malam di sini lampu kotanya cakep.', 'Bukit Bintang paling rame malam Minggu.']],
  ['gunung', 'kakek', 'Abah Oyo', 60, -45, ['Air panas Sangkala bikin pegel ilang.', 'Dulu Abah tiap subuh berendam di sini.']],
  ['sukamekar', 'mbak', 'Mbak Wulan', 268, -42, ['Aku sekolah di SMK Pariwisata sini.', 'Kebun teh paling bagus pas kabut turun.']],
  ['sukamekar', 'bapakPeci', 'Pak Mandor Teh', 280, -28, ['Pabrik teh ini udah dari zaman Belanda.', 'Butuh tenaga petik? Datang pagi-pagi.']],
  ['waduk', 'ibuDaster', 'Bu Atun', -58, -14, ['Ikan bakar nila, sambel dadak. Mau?', 'Perahu ke tengah waduk 10 ribu.']],
  ['waduk', 'kakek', 'Ki Sarpan', -92, -72, ['Batu Tulis itu jangan diinjak, Nak.', 'Tulisannya belum ada yang bisa baca.']],
  ['tegalsari', 'pakRT', 'Pak Lurah Darsa', -90, 110, ['Selamat datang di Tegalsari.', 'Pasar hewan rame tiap Rabu.']],
  ['tegalsari', 'siswaA', 'Santri Fikri', -108, 96, ['Assalamualaikum, Kang.', 'Pondok Darul Falah, ngaji tiap ba\'da magrib.']],
  ['timur', 'satpam', 'Prajurit Jaga', 318, 74, ['Area militer. Tamu lapor di pos jaga.', 'Rumah Dimas di blok C asrama.']],
  ['timur', 'ojol', 'Mas Andi (buruh)', 330, 116, ['Shift malam di pabrik, lumayan buat tambahan.', 'Bus karyawan lewat tiap jam enam.']],
  ['sirkuit', 'satpam', 'Marshal Rudi', 318, 188, ['Peserta lewat gerbang paddock.', 'Track day tiap akhir bulan, Dek.']],
  ['sirkuit', 'pemuda', 'Mekanik Bayu', 360, 206, ['Ban slick dipanasin dulu baru ngebut.', 'Sirkuit ini 2,1 kilo, 9 tikungan.']],
  ['pantai', 'ibuHijab2', 'Bu Romlah (seafood)', 138, 254, ['Cumi bakar, kerang, udang. Segar dari TPI!', 'Voli pantai sore-sore rame.']],
  ['pantai', 'remaja', 'Dewi', 206, 252, ['Hotel Samudra kolamnya ngadep laut.', 'Mercusuar di tanjung bagus buat lihat sunset.']],
  ['muara', 'bapakPeci', 'Pak Kasim (nelayan)', 318, 258, ['Lelang ikan subuh, jam empat udah rame.', 'Jalur kayu bakau ujungnya ke laut.']],
  ['pesisir', 'satpam', 'Pak Kepala Stasiun', 36, 245, ['Kereta ke kota tiap jam.', 'Watu Sepi? Lewat setapak ke barat, sepi banget.']],
];

// gaya tempat: warna area peta dunia -> pola tanah
const STYLE = { 0: 'base', 1: 'sea', 2: 'rock', 3: 'c1', 4: 'c2', 5: 'c3', 6: 'c4', 7: 'rockL', 8: 'rockH', 9: 'lake', 10: 'c1', 11: 'rockL', 12: 'forest', 13: 'forest', 14: 'edel', 15: 'teh', 16: 'lake', 17: 'sawah', 18: 'sawah', 19: 'sawah', 20: 'forest', 21: 'coastgrass',
  22: 'semen', 23: 'field', 24: 'mud', 25: 'lake', 26: 'village', 27: 'village', 28: 'dirt', 29: 'dirt', 30: 'village', 31: 'sand', 32: 'semen', 33: 'asphaltLight' };
// bangunan khusus (model sendiri, posisi tetap dari peta)
const SPECIAL_AT = [[236, 280], [-74, 34], [367, 213.2], [368, 228.4], [206, 259], [34, 240], [314, 264], [318, 270]];
const MOUNTZ = new Set(['gunung', 'sukamekar', 'waduk']);
const WATER = [1, 9, 16, 25], FLATA = [1, 16, 17, 18, 19, 22, 23, 24, 26, 27, 28, 29, 30, 31, 32, 33];

export function makeLuar({ scene, collision, player, Character, npcs }) {
  const K = { ...DUNIA };
  const roads = K.roads, rivers = K.rivers;
  const RS = roads.map(r => resample(r.pts, 1));
  // jarak ke tepi jalan (grid 1 petak) untuk penempatan
  function roadDist(x, z) {
    let best = 99;
    for (const r of roads) for (let i = 1; i < r.pts.length; i++) {
      const [ax, az] = r.pts[i - 1], [bx, bz] = r.pts[i];
      if (Math.min(ax, bx) - 6 > x || Math.max(ax, bx) + 6 < x || Math.min(az, bz) - 6 > z || Math.max(az, bz) + 6 < z) continue;
      const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
      best = Math.min(best, Math.hypot(x - ax - dx * t, z - az - dz * t) - r.w / 2);
    }
    return best;
  }
  const inWaterA = (x, z) => WATER.some(i => inPoly(x, z, K.areas[i].pts));
  function riverDist(x, z) {
    let best = 99;
    for (const r of rivers) for (let i = 1; i < r.pts.length; i++) {
      const [ax, az] = r.pts[i - 1], [bx, bz] = r.pts[i];
      if (Math.min(ax, bx) - 6 > x || Math.max(ax, bx) + 6 < x || Math.min(az, bz) - 6 > z || Math.max(az, bz) + 6 < z) continue;
      const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
      best = Math.min(best, Math.hypot(x - ax - dx * t, z - az - dz * t) - r.w / 2);
    }
    return best;
  }
  const waterAt = (x, z) => (inWaterA(x, z) || riverDist(x, z) < 0) && roadDist(x, z) > 0.2;

  /* ---------------- tata letak bangunan (guide 90: tidak clipping ke jalan/air, menghadap jalan, mundur sesuai wilayah) */
  const ROW = (b) => Math.abs(b.y - 258) < 0.5 && b.x >= 119 && b.x <= 157;   // deret warung pantai: sudah rapi di peta
  // tipe rumah per wilayah (guide 90 "Bantaran, desa, pesisir")
  function typeOf(x, z, r) {
    const zn = zoneOf(x, z);
    if (zn === 'muara' || (zn === 'pantai' && z > 244) || (zn === 'pesisir' && z > 244)) return 'N1';
    if (zn === 'sukamekar') return r < 0.45 ? 'D1' : r < 0.75 ? 'D3' : 'D2';
    if (zn === 'gunung' || zn === 'waduk') return r < 0.6 ? 'D3' : 'D2';
    if (zn === 'tegalsari' || zn === 'pantai' || zn === 'pesisir') return r < 0.7 ? 'D2' : 'D3';
    return 'K';
  }
  // jalan terdekat: titik, arah, jenis
  function nearestRoad(x, z, skipSetapak) {
    let best = null;
    roads.forEach((r, ri) => { if (skipSetapak && r.kind === 'setapak') return; const P = r.pts;
      for (let i = 1; i < P.length; i++) { const [ax, az] = P[i - 1], [bx, bz] = P[i];
        if (Math.min(ax, bx) - 30 > x || Math.max(ax, bx) + 30 < x || Math.min(az, bz) - 30 > z || Math.max(az, bz) + 30 < z) continue;
        const dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz) || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (l * l))), px = ax + dx * t, pz = az + dz * t, d = Math.hypot(x - px, z - pz) - r.w / 2;
        if (!best || d < best.d) best = { d, px, pz, tx: dx / l, tz: dz / l, r }; } });
    return best;
  }
  const corners = (b, e = 0) => { const c = Math.cos(b.a), s = Math.sin(b.a), hw = b.w / 2 + e, hd = b.h / 2 + e; return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([u, v]) => [b.x + u * c - v * s, b.y + u * s + v * c]); };
  // tapak (+ atap menjorok) aman dari semua jalan & air?
  function footOK(b, minD) {
    const c = Math.cos(b.a), s = Math.sin(b.a), hw = b.w / 2 + 0.35, hd = b.h / 2 + 0.35;   // +0.35 = atap menjorok
    for (let u = -hw; u <= hw + 1e-6; u += Math.max(0.5, hw / 4)) for (let v = -hd; v <= hd + 1e-6; v += Math.max(0.5, hd / 3)) {
      const x = b.x + u * c - v * s, z = b.y + u * s + v * c, roof = Math.abs(u) > b.w / 2 + 0.01 || Math.abs(v) > b.h / 2 + 0.01;
      if (roadDist(x, z) < (roof ? 0.25 : minD - 0.1) || inWaterA(x, z) || riverDist(x, z) < 0.8) return false;
      if (Math.abs(u) > hw - 0.01 || Math.abs(v) > hd - 0.01) { if (zoneOf(x, z) !== b.zone) return false; } }
    return true;
  }
  // dua persegi berputar bertumpuk? (sumbu pemisah)
  function overlap(A, B, gap) {
    const pa = corners(A, gap / 2), pb = corners(B, gap / 2);
    for (const P of [pa, pb]) for (let i = 0; i < 4; i++) { const [x0, z0] = P[i], [x1, z1] = P[(i + 1) % 4], nx = z0 - z1, nz = x1 - x0;
      const pr = Q => Q.map(([x, z]) => x * nx + z * nz), a = pr(pa), b = pr(pb);
      if (Math.max(...a) < Math.min(...b) || Math.max(...b) < Math.min(...a)) return false; }
    return true;
  }
  function layoutBldgs(src) {
    const out = [], fixed = [];
    // bangunan khusus & deret warung tetap; bangunan besar & rumah ditata ulang
    for (const b of src) { const sp = SPECIAL_AT.some(([x, z]) => Math.abs(x - b.x) < 0.6 && Math.abs(z - b.y) < 0.6); if (sp || ROW(b)) { const o = { ...b, zone: zoneOf(b.x, b.y), fixed: true }; out.push(o); fixed.push(o); } }
    const rest = src.filter(b => !out.some(o => o.x === b.x && o.y === b.y)).sort((a, b) => b.w * b.h - a.w * a.h);   // yang besar dulu
    let dropped = 0;
    rest.forEach((b0, n) => {
      const big = b0.w * b0.h > 30, zone = zoneOf(b0.x, b0.y), rr = hash(Math.round(b0.x * 7 + b0.y * 13), 77);
      const nr = nearestRoad(b0.x, b0.y, big);
      let w = b0.w, h = b0.h;
      // sisi panjang sejajar jalan
      const setback = big ? 2.2 : nr && nr.r.kind === 'gang' ? 1.2 : zone === 'muara' || zone === 'pesisir' ? 2.4 : 3;
      const minD = big ? 2 : 1;
      const cands = [];
      { const o = { ...b0, zone, type: big ? 'B' : typeOf(b0.x, b0.y, rr) };   // posisi dari peta sudah benar? pakai apa adanya
        if (footOK(o, minD) && !out.some(q => overlap(o, q, q.fixed || big ? 1 : 0.4))) { out.push(o); return; } }
      if (nr && nr.d < 18) {
        let nx = b0.x - nr.px, nz = b0.y - nr.pz; const l = Math.hypot(nx, nz) || 1; nx /= l; nz /= l;
        if (w < h) [w, h] = [h, w];
        const a = Math.atan2(nx, -nz);   // depan (+z lokal) menghadap jalan
        for (const row of [0, 1]) for (const sl of [0, 1.2, -1.2, 2.4, -2.4, 3.6, -3.6, 5, -5, 6.5, -6.5]) {
          const off = nr.r.w / 2 + setback + h / 2 + row * (h + 1.6);
          cands.push({ x: nr.px + nx * off + nr.tx * sl, y: nr.pz + nz * off + nr.tz * sl, a, row });
        }
      } else if (nr) {   // jauh dari jalan (pos, villa di bukit): tetap di tempat, diputar menghadap jalan
        const a = Math.atan2(b0.x - nr.px, -(b0.y - nr.pz)); cands.push({ x: b0.x, y: b0.y, a, row: 0 });
        for (const sl of [1.5, -1.5, 3, -3]) cands.push({ x: b0.x + sl, y: b0.y, a, row: 0 }, { x: b0.x, y: b0.y + sl, a, row: 0 });
      }
      for (const c of cands) {
        const o = { ...b0, x: c.x, y: c.y, w, h, a: c.a, zone, face: true, type: big ? 'B' : typeOf(c.x, c.y, rr), back: c.row };
        if (zoneOf(o.x, o.y) !== zone || !footOK(o, minD)) continue;
        if (out.some(q => overlap(o, q, q.fixed || big ? 1.2 : zone === 'tegalsari' ? 0.5 : 1))) continue;
        out.push(o); return;
      }
      dropped++;
    });
    if (dropped) console.info('[luar] bangunan dibatalkan (tidak muat tanpa menabrak jalan/air):', dropped);
    return out;
  }

  /* ---------------- titik pindah: jalan yang melintas batas kota / batas wilayah */
  const portals = [];
  roads.forEach((r, ri) => {
    const P = RS[ri]; let prev = null;
    P.forEach((p, i) => {
      const z = zoneOf(p.x, p.z);
      if (prev && z !== prev.z && z && prev.z) {
        const k = Math.max(0, i - 3), q = Math.min(P.length - 1, i + 2), a = P[k], b = P[q];
        portals.push({ from: prev.z, to: z, x: (p.x + prev.p.x) / 2, z: (p.z + prev.p.z) / 2, at: { x: b.x, z: b.z, h: Math.atan2(p.tz, p.tx) }, name: r.name, back: { x: a.x, z: a.z } });
        portals.push({ from: z, to: prev.z, x: (p.x + prev.p.x) / 2, z: (p.z + prev.p.z) / 2, at: { x: a.x, z: a.z, h: Math.atan2(-p.tz, -p.tx) }, name: r.name });
      }
      prev = { z, p };
    });
  });
  // rel kereta kota -> Stasiun Lintang: tidak bisa dilewati jalan kaki (pakai kereta)
  // halte tiap wilayah: titik jalan terdekat dari jangkar, digeser ke bahu jalan
  K.bldgs = layoutBldgs(DUNIA.bldgs);
  const clearB = (x, z, r) => !K.bldgs.some(b => Math.hypot(b.x - x, b.y - z) < Math.hypot(b.w, b.h) / 2 + r);
  for (const Z of ZONES) {
    const [ax, az] = Z.halte; let best = null;
    roads.forEach((r, ri) => { if (r.kind === 'setapak') return; for (const p of RS[ri]) for (const sd of [-1, 1]) {
      const x = p.x - p.tz * sd * (r.w / 2 + 1.2), z = p.z + p.tx * sd * (r.w / 2 + 1.2);
      if (zoneOf(x, z) !== Z.id || !clearB(x, z, 2) || roadDist(x, z) < 0.6 || inWaterA(x, z) || riverDist(x, z) < 1) continue;
      const d = Math.hypot(x - ax, z - az); if (!best || d < best.d) best = { d, x, z, h: Math.atan2(p.tz, p.tx) + (sd > 0 ? Math.PI : 0) }; } });
    Z.stop = best || { x: ax, z: az, h: 0 };
  }

  /* ---------------- kontur tanah seluruh peta dunia (1 sel = 1 petak), dihitung sekali saat pertama dibutuhkan */
  let HG = null;
  const LAKE = {}, ROADH = []; let RIVL = null;   // tinggi danau, profil jalan, tinggi air kali per sel
  const idx = (i, j) => j * GW + i;
  function buildHeights() {
    const cv = document.createElement('canvas'); cv.width = GW; cv.height = GH; const g = cv.getContext('2d', { willReadFrequently: true });
    g.translate(-BX0 + 0.5, -BZ0 + 0.5); g.globalCompositeOperation = 'lighter';
    const fillA = (i, style) => { g.fillStyle = style; g.beginPath(); K.areas[i].pts.forEach(([x, z], k) => k ? g.lineTo(x, z) : g.moveTo(x, z)); g.closePath(); g.fill(); };
    for (const i of [3, 4, 5, 6, 7, 8, 10, 11]) fillA(i, 'rgb(30,0,0)');
    for (const i of FLATA) fillA(i, 'rgb(0,255,0)');
    for (const i of WATER) fillA(i, 'rgb(0,0,255)');
    g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgb(0,255,0)'; g.fillRect(TOWN[0] - 1, TOWN[1] - 1, TOWN[2] - TOWN[0] + 2, TOWN[3] - TOWN[1] + 2);
    // lintasan sirkuit & pantai: rata
    g.globalCompositeOperation = 'lighter';
    for (const P of K.polys) { g.fillStyle = 'rgb(0,255,0)'; g.beginPath(); P.pts.forEach(([x, z], k) => k ? g.lineTo(x, z) : g.moveTo(x, z)); g.closePath(); g.fill(); }
    const px = g.getImageData(0, 0, GW, GH).data;
    const noise = (x, z) => 0.5 + 0.3 * Math.sin(x * 0.09 + Math.sin(z * 0.07) * 2) * Math.cos(z * 0.11 - x * 0.03) + 0.2 * Math.sin(x * 0.23 + z * 0.19);
    let H = new Float32Array(GW * GH); const flat = new Uint8Array(GW * GH);
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
      const k = idx(i, j), x = i + BX0, z = j + BZ0, lv = Math.round(px[k * 4] / 30);
      if (px[k * 4 + 1] > 128 || px[k * 4 + 2] > 128) flat[k] = px[k * 4 + 2] > 128 ? 2 : 1;
      H[k] = lv * 6.0 + 3.0 * Math.max(0, Math.min(1, -z / 30)) * (0.6 + 0.6 * noise(x, z)) + 0.5 * noise(x * 1.7, z * 1.7);
    }
    // halus: blur kotak 3x, lalu daerah rata kembali 0 (danau kawah & air panas: rata di ketinggiannya sendiri)
    const blur = (A, r) => { const B = new Float32Array(A.length);
      for (let j = 0; j < GH; j++) { let s = 0; for (let i = -r; i <= r; i++) s += A[idx(Math.max(0, Math.min(GW - 1, i)), j)]; for (let i = 0; i < GW; i++) { B[idx(i, j)] = s / (2 * r + 1); s += A[idx(Math.min(GW - 1, i + r + 1), j)] - A[idx(Math.max(0, i - r), j)]; } }
      for (let i = 0; i < GW; i++) { let s = 0; for (let j = -r; j <= r; j++) s += B[idx(i, Math.max(0, Math.min(GH - 1, j)))]; for (let j = 0; j < GH; j++) { A[idx(i, j)] = s / (2 * r + 1); s += B[idx(i, Math.min(GH - 1, j + r + 1))] - B[idx(i, Math.max(0, j - r))]; } } };
    for (let k = 0; k < 3; k++) blur(H, 3);
    // tinggi target guide 86 (tanjakan pegunungan): koreksi halus (gauss) supaya titik kunci pas, tepi kota tetap 0
    { const CP = [[138, 0, 0], [128, -23, 10], [152, -46, 22], [170, -52, 22], [119, -52, 25], [128, -62, 26], [250, -28, 20], [262, -45, 20], [282, -32, 19], [268, -60, 20], [110, -96, 40], [100, -110, 38], [118, -118, 32]];
      for (let x = 0; x <= 260; x += 26) CP.push([x, 2, 0]); for (let z = 0; z <= 180; z += 30) CP.push([-2, z, 0], [262, z, 0]);
      const at = (x, z) => H[idx(Math.max(0, Math.min(GW - 1, Math.round(x - BX0))), Math.max(0, Math.min(GH - 1, Math.round(z - BZ0))))];
      const res = CP.map(([x, z, t]) => t - at(x, z)), s2 = 2 * 22 * 22;
      for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const x = i + BX0, z = j + BZ0; let sw = 0, sr = 0;
        for (let c = 0; c < CP.length; c++) { const dx = x - CP[c][0], dz = z - CP[c][1], d2 = dx * dx + dz * dz; if (d2 > 9 * s2) continue; const w = Math.exp(-d2 / s2); sw += w; sr += w * res[c]; }
        if (sw > 0) H[idx(i, j)] += sr / (sw + 0.02); } }
    // area datar (desa, sawah, lapangan): rata di ketinggiannya sendiri (bukan selalu 0)
    const AL = new Float32Array(GW * GH).fill(NaN);
    for (const ai of FLATA) { if (WATER.includes(ai)) continue; const P = K.areas[ai].pts; let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const [x, z] of P) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
      const cells = []; let sum = 0;
      for (let z = Math.ceil(z0); z <= z1; z++) for (let x = Math.ceil(x0); x <= x1; x++) { const i = x - BX0, j = z - BZ0; if (i < 0 || j < 0 || i >= GW || j >= GH || !inPoly(x, z, P)) continue; const k = idx(i, j); cells.push(k); sum += H[k]; }
      const m = cells.length ? sum / cells.length : 0; for (const k of cells) if (!(AL[k] < m)) AL[k] = m; }
    const lakeLv = LAKE;
    for (const li of [9, 25]) { const pts = K.areas[li].pts; let m = 1e9; for (const [x, z] of pts) m = Math.min(m, H[idx(Math.round(x - BX0), Math.round(z - BZ0))]); lakeLv[li] = m - 0.3; }
    const pin = new Uint8Array(GW * GH);
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
      const k = idx(i, j), x = i + BX0, z = j + BZ0;
      if (flat[k] === 2) { const li = [9, 25].find(l => inPoly(x, z, K.areas[l].pts)); H[k] = li ? lakeLv[li] : -0.35; pin[k] = 2; }
      else if (flat[k] === 1) { const tw = inR(TOWN, x, z) || !(AL[k] === AL[k]); H[k] = tw ? 0 : AL[k]; pin[k] = tw ? 1 : 0; }   // desa/sawah di lereng: rata tapi tepinya boleh melandai ke jalan
    }
    // jalan: tinggi as jalan = tanah di sepanjangnya (dihaluskan), dibatasi kemiringan 10% (setapak 25%)
    RIVL = new Float32Array(GW * GH).fill(NaN);
    const RD = new Float32Array(GW * GH).fill(99), RH = new Float32Array(GW * GH), RK = new Uint8Array(GW * GH), WS = new Float32Array(GW * GH), WH = new Float32Array(GW * GH);
    const sample = (x, z) => H[idx(Math.max(0, Math.min(GW - 1, Math.round(x - BX0))), Math.max(0, Math.min(GH - 1, Math.round(z - BZ0))))];
    const sm = (a, w) => a.map((_, i) => { let s = 0, n = 0; for (let k = Math.max(0, i - w); k <= Math.min(a.length - 1, i + w); k++) { s += a[k]; n++; } return s / n; });
    // sungai dulu (tinggi airnya dipakai jalan yang menyeberang), lalu jalan
    const RP = rivers.map(r => { const P = resample(r.pts, 1); let h = P.map(p => sample(p.x, p.z)); for (let k = 0; k < 3; k++) h = sm(h, 6);
      for (let i = 1; i < h.length; i++) h[i] = Math.min(h[i], h[i - 1] + 0.1); for (let i = h.length - 2; i >= 0; i--) h[i] = Math.min(h[i], h[i + 1] + 0.1); return { r, P, h }; });
    const riverH = (x, z) => { let best = null, bd = 1e9; for (const { r, P, h } of RP) P.forEach((p, n) => { const d = Math.hypot(p.x - x, p.z - z) - r.w / 2; if (d < bd) { bd = d; best = h[n]; } }); return { d: bd, h: best }; };
    const MOUNT = new Set(['gunung', 'sukamekar', 'waduk']);
    [...RP.map(({ r, P, h }) => [{ ...r, kind: 'kali' }, P, h]), ...roads.map((r, ri) => [r, RS[ri], null])].forEach(([r, P, hr]) => {
      if (P.length < 2) return;
      let h = hr;
      if (!h) {
        h = P.map(p => sample(p.x, p.z)); for (let k = 0; k < 3; k++) h = sm(h, 6);
        // jalan gunung boleh lebih curam (tanjakan tinggi tapi tetap bertahap); setapak paling curam
        const S = P.map(p => r.kind === 'setapak' ? 0.3 : MOUNT.has(zoneOf(p.x, p.z)) ? 0.18 : 0.1);
        for (let i = 1; i < h.length; i++) h[i] = Math.min(h[i], h[i - 1] + S[i]); for (let i = h.length - 2; i >= 0; i--) h[i] = Math.min(h[i], h[i + 1] + S[i]);
        // tikungan tajam (serpentin): bagian datar +-1.5 petak supaya motor bisa belok
        for (let i = 3; i < P.length - 3; i++) { const a = P[i - 3], b = P[i + 3]; if (a.tx * b.tx + a.tz * b.tz > -0.2) continue;
          let s0 = 0, n0 = 0; for (let k = i - 2; k <= i + 2; k++) { s0 += h[k]; n0++; } const m0 = s0 / n0; for (let k = i - 1; k <= i + 1; k++) h[k] = m0; }
        // di atas air: jalan/jembatan selalu di atas permukaan air, naik-turunnya landai
        const fl = P.map(p => { const li = [9, 25].find(l => inPoly(p.x, p.z, K.areas[l].pts)); if (li) return lakeLv[li] + 0.7; if ([1, 16].some(l => inPoly(p.x, p.z, K.areas[l].pts))) return 0.4;
          const q = riverH(p.x, p.z); return q.d < 1.5 ? q.h + 0.9 : -99; });
        for (let i = 0; i < h.length; i++) h[i] = Math.max(h[i], fl[i]);
        for (let i = 1; i < h.length; i++) h[i] = Math.max(h[i], h[i - 1] - S[i] * 0.8); for (let i = h.length - 2; i >= 0; i--) h[i] = Math.max(h[i], h[i + 1] - S[i] * 0.8);
        ROADH[roads.indexOf(r)] = h;
      }
      const hw = r.w / 2, reach = hw + 3;
      P.forEach((p, n) => {
        for (let j = Math.floor(p.z - reach - BZ0); j <= Math.ceil(p.z + reach - BZ0); j++) for (let i = Math.floor(p.x - reach - BX0); i <= Math.ceil(p.x + reach - BX0); i++) {
          if (i < 0 || j < 0 || i >= GW || j >= GH) continue; const k = idx(i, j), d = Math.hypot(i + BX0 - p.x, j + BZ0 - p.z) - hw;
          if (r.kind === 'kali' && d < 1 && !(RIVL[k] < h[n])) RIVL[k] = h[n];
          if (r.kind !== 'kali') { const w = 1 / Math.pow(Math.max(0, d) + 0.5, 3); WS[k] += w; WH[k] += w * h[n]; }   // bahu jalan: rata-rata berbobot (serpentin tidak bergerigi)
          if (d < RD[k] || (r.kind !== 'kali' && RK[k] === 2 && d < 0.8)) { RD[k] = d; RH[k] = h[n]; RK[k] = r.kind === 'kali' ? 2 : 1; } }
      });
    });
    const ss = v => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
    for (let k = 0; k < H.length; k++) { if (RD[k] > 3 || (pin[k] && !(pin[k] === 2 && RK[k] === 1 && RD[k] < 0.8))) continue; if (pin[k] === 2) { H[k] = RH[k]; continue; } const rh = RK[k] === 1 && RD[k] > 0.3 && WS[k] > 0 ? WH[k] / WS[k] : RH[k], t = ss((RD[k] - 0.4) / 2.6); H[k] = rh * (1 - t) + H[k] * t; if (RD[k] < 0.5) pin[k] = 1; }
    // bahu & tebing jalan dihaluskan (jalan diagonal di grid 1 petak bikin gerigi)
    for (let p = 0; p < 2; p++) { const B = H.slice();
      for (let j = 1; j < GH - 1; j++) for (let i = 1; i < GW - 1; i++) { const k = idx(i, j); if (RD[k] < 0.6 || RD[k] > 4.5 || pin[k]) continue;
        let s = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) s += B[k + dj * GW + di]; H[k] = s / 9; } }
    // bangunan: tapak rata (rata-rata tanah di bawahnya)
    for (const b of K.bldgs) { const r = Math.max(b.w, b.h) / 2 + 1, i0 = Math.floor(b.x - r - BX0), i1 = Math.ceil(b.x + r - BX0), j0 = Math.floor(b.y - r - BZ0), j1 = Math.ceil(b.y + r - BZ0); let s = 0, n = 0;
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (i >= 0 && j >= 0 && i < GW && j < GH) { s += H[idx(i, j)]; n++; }
      const m = n ? s / n : 0; for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (i >= 0 && j >= 0 && i < GW && j < GH && !pin[idx(i, j)]) { H[idx(i, j)] = m; pin[idx(i, j)] = 1; } }
    // kemiringan tanah dibatasi 0.45 per petak (turun lalu naik), sel jalan/air/tapak tetap
    const lip = (dir) => { const nb = [[-1, 0, 1], [0, -1, 1], [-1, -1, 1.414], [1, -1, 1.414]], S = 0.45;
      for (let p = 0; p < 2; p++) {
        for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const k = idx(i, j); if (pin[k]) continue; for (const [di, dj, d] of nb) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= GW) continue; const v = H[idx(a, b)] + dir * S * d; if (dir > 0 ? v < H[k] : v > H[k]) H[k] = v; } }
        for (let j = GH - 1; j >= 0; j--) for (let i = GW - 1; i >= 0; i--) { const k = idx(i, j); if (pin[k]) continue; for (const [di, dj, d] of nb) { const a = i - di, b = j - dj; if (a < 0 || b >= GH || a >= GW) continue; const v = H[idx(a, b)] + dir * S * d; if (dir > 0 ? v < H[k] : v > H[k]) H[k] = v; } } } };
    lip(1); lip(-1);
    HG = H;
  }
  // tinggi tanah (koordinat peta dunia)
  function heightAt(x, z) {
    if (!HG) return 0;
    const fx = x - BX0, fz = z - BZ0, i = Math.floor(fx), j = Math.floor(fz); if (i < 0 || j < 0 || i >= GW - 1 || j >= GH - 1) return 0;
    const u = fx - i, v = fz - j, k = idx(i, j);
    return (HG[k] * (1 - u) + HG[k + 1] * u) * (1 - v) + (HG[k + GW] * (1 - u) + HG[k + GW + 1] * u) * v;
  }

  /* ---------------- gambar tanah satu wilayah */
  function paint(Z) {
    const W = Z.x1 - Z.x0, H = Z.z1 - Z.z0, s = PX, cv = document.createElement('canvas'); cv.width = W * s; cv.height = H * s;
    const g = cv.getContext('2d'); makePatterns(g, s / 10);
    g.fillStyle = PAT.grass; g.fillRect(0, 0, cv.width, cv.height);
    { const gv = document.createElement('canvas'); gv.width = cv.width; gv.height = cv.height; grassVariety(gv.getContext('2d'), W, H, s); g.drawImage(gv, 0, 0); }
    // helai rumput kecil di tekstur (gelap di pangkal, terang di ujung) supaya tanah tidak datar
    { const cols = ['rgba(60,96,40,0.55)', 'rgba(84,124,52,0.5)', 'rgba(150,186,92,0.55)', 'rgba(176,200,110,0.45)'], N = W * H * 3;
      for (let c = 0; c < 4; c++) { g.beginPath(); for (let i = c; i < N; i += 4) { const x = hash(i, 911 + Z.x0) * W * s, z = hash(i, 912 + Z.z0) * H * s, l = (0.6 + hash(i, 913)) * s * 0.14, dx = (hash(i, 914) - 0.5) * s * 0.08;
        g.moveTo(x, z); g.lineTo(x + dx, z - l); } g.strokeStyle = cols[c]; g.lineWidth = Math.max(1, s * 0.05); g.stroke(); } }
    g.save(); g.translate(-Z.x0 * s, -Z.z0 * s); g.lineCap = g.lineJoin = 'round';
    const path = pts => { g.beginPath(); pts.forEach(([x, z], k) => k ? g.lineTo(x * s, z * s) : g.moveTo(x * s, z * s)); g.closePath(); };
    const fill = (pts, st, a = 1) => { path(pts); g.globalAlpha = a; g.fillStyle = st; g.fill(); g.globalAlpha = 1; };
    const rgbA = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    const near = A => { let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const [x, z] of A.pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); } return x1 > Z.x0 - 2 && x0 < Z.x1 + 2 && z1 > Z.z0 - 2 && z0 < Z.z1 + 2; };
    K.areas.forEach((A, i) => {
      if (!near(A)) return;
      const st = STYLE[i] || 'grass';
      if (st === 'base') return;
      if (st === 'sea' || st === 'lake') { fill(A.pts, PAT.water); g.strokeStyle = st === 'sea' ? '#e2d2a0' : '#8a8478'; g.lineWidth = (st === 'sea' ? 1.2 : 0.35) * s; g.stroke(); return; }
      if (st[0] === 'c') { fill(A.pts, PAT.grassDark, 0.35 + 0.1 * (+st[1])); fill(A.pts, rgbA(A.color, 0.22)); return; }
      if (st === 'rockL' || st === 'rockH' || st === 'rock') { fill(A.pts, PAT.dirt, 0.6); fill(A.pts, rgbA(A.color, 0.5)); return; }
      if (st === 'forest') { fill(A.pts, PAT.grassDark); return; }
      if (st === 'edel') { fill(A.pts, PAT.field); fill(A.pts, 'rgba(240,240,220,0.35)'); return; }
      if (st === 'teh') { fill(A.pts, PAT.grassDark, 0.8); return; }
      if (st === 'sawah') {
        fill(A.pts, PAT.sawah); g.save(); path(A.pts); g.clip(); g.strokeStyle = '#8a7a50'; g.lineWidth = 0.35 * s;
        const an = (A.angle || 0) * Math.PI / 180, [cx, cz] = A.pts[0];
        for (let k = -200; k < 200; k += 6) { g.beginPath(); g.moveTo((cx - 400 * Math.cos(an) - k * Math.sin(an)) * s, (cz - 400 * Math.sin(an) + k * Math.cos(an)) * s); g.lineTo((cx + 400 * Math.cos(an) - k * Math.sin(an)) * s, (cz + 400 * Math.sin(an) + k * Math.cos(an)) * s); g.stroke(); }
        g.restore(); return;
      }
      if (st === 'mud') { fill(A.pts, PAT.mud); fill(A.pts, 'rgba(90,120,90,0.25)'); return; }
      if (st === 'village') { fill(A.pts, PAT.lawn, 0.6); return; }
      if (st === 'coastgrass') { fill(A.pts, PAT.field, 0.7); return; }
      fill(A.pts, PAT[st] || PAT.field);
    });
    for (const P of K.polys) {
      g.beginPath(); for (const ring of [P.pts, ...P.holes]) ring.forEach(([x, z], k) => k ? g.lineTo(x * s, z * s) : g.moveTo(x * s, z * s)), g.closePath();
      const c = P.color; g.fillStyle = c[0] === 232 ? PAT.dirt : c[0] === 214 ? PAT.dirt : c[0] === 150 ? PAT.lawn : PAT.asphalt; g.fill('evenodd');
      if (c[0] === 232) { g.fillStyle = 'rgba(240,226,180,0.75)'; g.fill('evenodd'); }
    }
    // sirkuit: kerb merah-putih & garis start
    if (Z.id === 'sirkuit') {
      const T = [...K.track, K.track[0]];
      for (const sd of [-1, 1]) { strokeOffset(g, T, sd * 2.1, s); g.lineWidth = 0.4 * s; g.strokeStyle = '#f2f2ee'; g.stroke(); g.setLineDash([0.8 * s, 0.8 * s]); g.strokeStyle = '#d8342c'; g.stroke(); g.setLineDash([]); }
      const [a, b] = [K.track[0], K.track[1]], an = Math.atan2(b[1] - a[1], b[0] - a[0]);
      g.save(); g.translate(a[0] * s, a[1] * s); g.rotate(an); for (let k = 0; k < 8; k++) for (let r = 0; r < 2; r++) { g.fillStyle = (k + r) % 2 ? '#111' : '#f4f4f0'; g.fillRect(r * 0.5 * s, (-2 + k * 0.5) * s, 0.5 * s, 0.5 * s); } g.restore();
      strokePath(g, K.pit, s); g.lineWidth = 3 * s; g.strokeStyle = PAT.asphaltLight; g.stroke();
    }
    // lereng curam: tanah & batu tebing kelihatan (bukan rumput)
    if (HG) { const mc = document.createElement('canvas'); mc.width = W * 2; mc.height = H * 2; const mg = mc.getContext('2d'), im = mg.createImageData(W * 2, H * 2), D = im.data;
      for (let j = 0; j < H * 2; j++) for (let i = 0; i < W * 2; i++) { const x = Z.x0 + i / 2 + 0.25, z = Z.z0 + j / 2 + 0.25, h = heightAt(x, z), sl = Math.hypot(heightAt(x + 0.5, z) - h, heightAt(x, z + 0.5) - h) * 2;
        if (sl < 0.4) continue; const n = hash(i, j * 7 + 3), o = (j * W * 2 + i) * 4, rock = sl > 0.75 ? Math.min(1, (sl - 0.75) * 2) : 0;
        D[o] = 138 - rock * 18 + n * 20; D[o + 1] = 118 - rock * 4 + n * 16; D[o + 2] = 88 + rock * 16 + n * 12; D[o + 3] = Math.min(235, (sl - 0.4) * 500); }
      mg.putImageData(im, 0, 0); g.imageSmoothingEnabled = true; g.drawImage(mc, Z.x0 * s, Z.z0 * s, W * s, H * s); g.imageSmoothingEnabled = false; }
    for (const r of rivers) { strokePath(g, r.pts, s); g.strokeStyle = '#8a8466'; g.lineWidth = (r.w + 1.4) * s; g.stroke(); g.strokeStyle = PAT.water; g.lineWidth = (r.w - 0.3) * s; g.stroke(); }
    for (const r of K.rails) {
      strokePath(g, r.pts, s); g.strokeStyle = '#8c8478'; g.lineWidth = 2.4 * s; g.stroke();
      const P = resample(r.pts, 0.6); g.fillStyle = '#6a5038'; for (const p of P) { g.save(); g.translate(p.x * s, p.z * s); g.rotate(Math.atan2(p.tz, p.tx)); g.fillRect(-0.12 * s, -0.9 * s, 0.24 * s, 1.8 * s); g.restore(); }
      for (const o of [-0.55, 0.55]) { strokeOffset(g, r.pts, o, s); g.strokeStyle = '#5a5a60'; g.lineWidth = 0.14 * s; g.stroke(); }
    }
    const surf = { raya: PAT.asphalt, jalan: PAT.asphaltLight, gang: PAT.conblock, setapak: PAT.dirt };
    for (const r of roads) if (r.kind !== 'setapak') { strokePath(g, r.pts, s); g.lineCap = 'round'; g.strokeStyle = '#8a8a7e'; g.lineWidth = (r.w + 0.6) * s; g.stroke(); }
    for (const kind of ['setapak', 'gang', 'jalan', 'raya']) for (const r of roads) if (r.kind === kind) { strokePath(g, r.pts, s); g.strokeStyle = surf[kind]; g.lineWidth = r.w * s; g.stroke(); }
    roadWear(g, { roads }, s);
    for (const r of roads) {
      if (r.kind === 'raya') { g.strokeStyle = '#ecebe2'; g.lineWidth = 0.2 * s; for (const o of [-1, 1]) { strokeOffset(g, r.pts, o * (r.w / 2 - 0.3), s); g.stroke(); } strokePath(g, r.pts, s); g.setLineDash([1.5 * s, 1.5 * s]); g.stroke(); g.setLineDash([]); }
      else if (r.kind === 'jalan') { strokePath(g, r.pts, s); g.strokeStyle = 'rgba(240,236,220,0.8)'; g.lineWidth = 0.15 * s; g.setLineDash([1 * s, 1.4 * s]); g.stroke(); g.setLineDash([]); }
    }
    // halte: kotak kuning di bahu jalan
    { const p = Z.stop; g.fillStyle = 'rgba(240,200,60,0.85)'; g.fillRect((p.x - 0.8) * s, (p.z - 0.8) * s, 1.6 * s, 1.6 * s); }
    g.restore();
    return cv;
  }

  /* ---------------- bangunan */
  const ROOFS = ['#b4583e', '#a8523a', '#8a6a5a', '#5a6a80', '#4a5058', '#b4583e'];
  // rumah: tipe dari tata letak (K kampung, D1 panggung desa, D2 limasan, D3 bilik bambu, N1 nelayan, B besar)
  const WALLS = { K: ['#e8dcc4', '#d8e4d0', '#f0e0b0', '#c8d8e8', '#e8c8b8', '#f2f0e8'], D2: ['#f0ead8', '#e8dcc0', '#d8c8a8', '#f2f0e8', '#c8b898'],
    N1: ['#4ab0c8', '#e8d040', '#5ac080', '#f08060', '#a0c8f0', '#f2a8c0'] };
  function house(m, b, y, C) {
    const seed = Math.round(b.x * 13 + b.y * 7), r1 = hash(seed, 3), r2 = hash(seed, 5), r3 = hash(seed, 9), t = b.type || 'K';
    let a = b.a, W2 = b.w, D2 = b.h;
    if (!b.face) {   // data lama: pintu ke jalan terdekat, putar per 90 derajat
      let best = 0, bd = 1e9; for (let k = 0; k < 4; k++) { const aa = b.a + k * Math.PI / 2, nx = -Math.sin(aa), nz = Math.cos(aa), half = k % 2 ? b.w / 2 : b.h / 2, rd = roadDist(b.x + nx * (half + 1.5), b.y + nz * (half + 1.5)); if (rd < bd - 0.3) { bd = rd; best = k; } }
      a = b.a + best * Math.PI / 2; W2 = best % 2 ? b.h : b.w; D2 = best % 2 ? b.w : b.h;
    }
    const xf = { x: b.x, z: b.y + LZ, a, y }, ar = W2 * D2, fz = D2 / 2 + 0.02, glass = col('#3a4a5a'), fr = col('#f2eee6');
    const wood = col(pick(['#8a5a3a', '#7a4e32', '#9a6a44'], r2)), bamboo = col(pick(['#c8a868', '#b8985a', '#d4b478'], r2));
    const win = (u, yy, side, cf = fr) => {   // side: 0 depan, 1 kanan, 2 belakang, 3 kiri
      if (side === 0 || side === 2) { const z = side ? -fz : fz, o = side ? -0.01 : 0.01; m.box(xf, u, yy, z, 0.7, 0.62, 0.05, cf); m.box(xf, u, yy + 0.06, z + o, 0.56, 0.5, 0.05, glass); }
      else { const x = side === 1 ? W2 / 2 + 0.02 : -W2 / 2 - 0.02, o = side === 1 ? 0.01 : -0.01; m.box(xf, x, yy, u, 0.05, 0.62, 0.7, cf); m.box(xf, x + o, yy + 0.06, u, 0.05, 0.5, 0.56, glass); } };
    const sideWins = (yy, cf) => { win(0, yy, 1, cf); win(0, yy, 3, cf); win(W2 * 0.2, yy, 2, cf); };
    const free = (lx, lz, rad) => { const c = Math.cos(a), s = Math.sin(a), x = b.x + lx * c - lz * s, z = b.y + lx * s + lz * c;
      return roadDist(x, z) > rad + 0.4 && !inWaterA(x, z) && riverDist(x, z) > 1 && zoneOf(x, z) === b.zone && !K.bldgs.some(q => q !== b && Math.hypot(q.x - x, q.y - z) < Math.hypot(q.w, q.h) / 2 + rad); };
    const at = (lx, lz) => { const c = Math.cos(a), s = Math.sin(a); return [b.x + lx * c - lz * s, b.y + lx * s + lz * c + LZ]; };
    if (t === 'B' || ar > 30) {   // bangunan besar: gudang/pabrik/pesantren/sekolah
      const c = col(b.color), tall = ar > 60 ? 2 : 1.3, Hh = FLOOR * tall;
      m.box(xf, 0, -0.6, 0, W2 + 0.2, 0.6, D2 + 0.2, col('#8a8478')); m.box(xf, 0, 0, 0, W2, Hh, D2, c);
      if (ar > 60) { m.box(xf, 0, Hh, 0, W2 + 0.3, 0.12, D2 + 0.3, shade(c, 0.8)); m.hip(xf, 0, Hh + 0.1, 0, W2 * 0.96, D2 * 0.96, 0.9, col('#7a8088'), 0.1); }
      else m.gable(xf, 0, Hh, 0, W2, D2, Math.min(1.4, D2 * 0.4), col(pick(ROOFS, r1)), 0.3, c);
      m.box(xf, -W2 * 0.18, 0, fz, 1.4, 1.6, 0.06, col('#5a4a3a'));
      for (let f = 0; f < tall - 0.2; f++) for (let u = -W2 / 2 + 0.9; u < W2 / 2 - 0.4; u += 1.4) if (Math.abs(u + W2 * 0.18) > 1.1 || f) m.box(xf, u, f * FLOOR + 0.7, fz, 0.8, 0.6, 0.05, glass);
      sideWins(0.7, fr);
      return { xf, w: W2, d: D2 };
    }
    if (t === 'D1') {   // panggung desa: tiang, lantai kayu, tangga, gevel ukir
      const P = 0.8, Hh = FLOOR * 0.95, gev = col('#e8d8b0');
      for (const u of [-W2 / 2 + 0.15, 0, W2 / 2 - 0.15]) for (const v of [-D2 / 2 + 0.15, D2 / 2 - 0.15]) m.box(xf, u, -0.5, v, 0.2, P + 0.5, 0.2, col('#5a4028'));
      m.box(xf, 0, P - 0.12, 0.35, W2 + 0.3, 0.14, D2 + 0.7, shade(wood, 0.85));
      m.box(xf, 0, P, 0, W2, Hh, D2, wood);
      for (let u = -W2 / 2; u <= W2 / 2; u += 0.5) m.box(xf, u, P, fz + 0.01, 0.04, Hh, 0.03, shade(wood, 0.7));
      m.gable(xf, 0, P + Hh, 0, W2, D2, 1.3, col(pick(['#6a3a2a', '#4a4a50', '#8a4a32'], r1)), 0.35, gev);
      for (const sd of [-1, 1]) { m.box(xf, sd * (W2 / 2 + 0.3), P + Hh + 1.25, 0, 0.08, 0.5, 0.08, col('#3a2a1a')); }   // tanduk nok
      m.box(xf, 0, P + 0.85, D2 / 2 + 0.68, W2 + 0.2, 0.06, 0.06, shade(wood, 1.1));   // pagar teras
      for (let k = 0; k < 4; k++) m.box(xf, -W2 * 0.18, P - 0.2 - k * 0.2, D2 / 2 + 0.85 + k * 0.28, 0.9, 0.06, 0.28, shade(wood, 1.05));   // tangga
      m.box(xf, -W2 * 0.18, P, fz, 0.8, 1.35, 0.06, col('#4a2e1c')); win(W2 * 0.22, P + 0.65, 0, gev); sideWins(P + 0.65, gev);
      if (free(W2 / 2 + 1.4, 0, 0.8)) { m.box(xf, W2 / 2 + 1.4, 0, 0, 1.4, 0.4, 0.8, col('#c8a060')); const [x, z] = at(W2 / 2 + 1.4, 0); C.box(x, z, 0.75, 0.45, a); }   // bale-bale
      return { xf, w: W2, d: D2 };
    }
    if (t === 'D3') {   // bilik bambu, atap ijuk
      const Hh = FLOOR * 0.85;
      m.box(xf, 0, -0.3, 0, W2 + 0.1, 0.3, D2 + 0.1, col('#8a7a62'));
      m.box(xf, 0, 0, 0, W2, Hh, D2, bamboo);
      for (let v = 0.2; v < Hh; v += 0.35) m.box(xf, 0, v, fz + 0.005, W2, 0.04, 0.02, shade(bamboo, 0.78));
      for (const u of [-W2 / 2, W2 / 2]) for (const v of [-D2 / 2, D2 / 2]) m.box(xf, u, 0, v, 0.14, Hh, 0.14, col('#7a5a30'));
      m.gable(xf, 0, Hh, 0, W2, D2, Math.min(1.5, D2 * 0.55), col(pick(['#4a3a2a', '#5a4632', '#3e3226'], r1)), 0.4, bamboo);
      m.box(xf, -W2 * 0.18, 0, fz, 0.75, 1.3, 0.06, col('#5a3e22')); win(W2 * 0.2, 0.65, 0, col('#7a5a30')); sideWins(0.65, col('#7a5a30'));
      if (free(-W2 / 2 - 0.9, -0.4, 0.6)) for (let k = 0; k < 5; k++) m.box(xf, -W2 / 2 - 0.9, 0.1 + (k % 3) * 0.14, -0.6 + Math.floor(k / 3) * 0.4 + (k % 2) * 0.1, 0.9, 0.12, 0.12, col('#7a5434'));   // kayu bakar
      return { xf, w: W2, d: D2 };
    }
    if (t === 'D2') {   // limasan sawah: atap limas tinggi, teras bertiang, bale-bale, lumbung
      const wall = col(pick(WALLS.D2, r2)), Hh = FLOOR * (r3 < 0.25 ? 1.25 : 1), roof = col(pick(['#a8523a', '#8a4a32', '#6a4a3a', '#b4583e'], r1));
      const [fx, fzz] = at(0, D2 / 2 + 1.2), teras = roadDist(fx, fzz - LZ) > 0.9, tp = teras ? 0.9 : 0;   // teras bertiang kalau halaman depan cukup
      m.box(xf, 0, -0.45, tp / 2 - 0.05, W2 + 0.3, 0.45, D2 + 0.2 + tp, col('#a49a88'));
      m.box(xf, 0, 0, 0, W2, Hh, D2, wall); m.box(xf, 0, 0, fz, W2, 0.35, 0.03, shade(wall, 0.7));
      m.hip(xf, 0, Hh, tp / 3, W2 + 0.2, D2 + tp * 0.9, Math.min(1.8, D2 * 0.6), roof, 0.25);
      if (teras) for (const u of [-W2 / 2 + 0.2, W2 / 2 - 0.2]) m.box(xf, u, 0, D2 / 2 + 0.6, 0.14, Hh, 0.14, wood);
      m.box(xf, -W2 * 0.18, 0, fz, 0.85, 1.4, 0.06, wood); win(W2 * 0.22, 0.7, 0, wood); if (W2 > 4) win(-W2 * 0.38, 0.7, 0, wood); sideWins(0.7, wood);
      if (free(W2 * 0.2, D2 / 2 + 1.7, 0.8)) { m.box(xf, W2 * 0.2, 0, D2 / 2 + 1.7, 1.5, 0.42, 0.85, col('#c8a060')); for (const u of [-0.65, 0.65]) m.box(xf, W2 * 0.2 + u, 0, D2 / 2 + 1.7, 0.08, 0.42, 0.85, col('#8a6a3a')); const [x, z] = at(W2 * 0.2, D2 / 2 + 1.7); C.box(x, z, 0.8, 0.45, a); }
      if (r3 > 0.45 && free(W2 / 2 + 1.3, -D2 / 4, 0.8)) {   // lumbung panggung
        const lx = W2 / 2 + 1.3, lz = -D2 / 4; for (const u of [-0.45, 0.45]) for (const v of [-0.45, 0.45]) m.box(xf, lx + u, 0, lz + v, 0.12, 0.7, 0.12, col('#5a4028'));
        m.box(xf, lx, 0.7, lz, 1.1, 0.9, 1.1, bamboo); m.gable(xf, lx, 1.6, lz, 1.1, 1.1, 1.0, col('#5a4632'), 0.25, bamboo); const [x, z] = at(lx, lz); C.box(x, z, 0.6, 0.6, a); }
      else if (r3 > 0.2 && free(-W2 / 2 - 1.1, 0, 0.7)) { m.box(xf, -W2 / 2 - 1.1, 0, 0, 1.0, 0.5, 1.0, col('#d8c070')); m.box(xf, -W2 / 2 - 1.1, 0.5, 0, 0.7, 0.3, 0.7, col('#e0cc80')); }   // tumpukan jerami
      return { xf, w: W2, d: D2 };
    }
    if (t === 'N1') {   // rumah nelayan: cat terang, kusen kuning, jaring dijemur, perahu
      const wall = col(pick(WALLS.N1, r2)), yel = col('#f2c230'), Hh = FLOOR, roof = col(pick(['#b4583e', '#8a8a92', '#5a6a80'], r1));
      m.box(xf, 0, -0.4, 0, W2 + 0.2, 0.4, D2 + 0.2, col('#a8a090'));
      m.box(xf, 0, 0, 0, W2, Hh, D2, wall); m.gable(xf, 0, Hh, 0, W2, D2, Math.min(1.1, D2 * 0.45), roof, 0.3, wall);
      m.box(xf, -W2 * 0.18, 0, fz, 0.95, 1.45, 0.05, yel); m.box(xf, -W2 * 0.18, 0, fz + 0.01, 0.75, 1.35, 0.05, col('#6a4a30'));
      win(W2 * 0.22, 0.7, 0, yel); sideWins(0.7, yel);
      m.box(xf, 0, 0, D2 / 2 + 0.5, W2, 0.08, 0.9, col('#c4beb2'));
      if (free(W2 / 2 + 1.0, 0, 0.7)) { const lx = W2 / 2 + 1.0; for (const v of [-1, 1]) m.box(xf, lx, 0, v * 0.9, 0.08, 1.5, 0.08, col('#7a5a3a')); m.box(xf, lx, 1.45, 0, 0.04, 0.04, 1.8, col('#7a5a3a')); m.box(xf, lx, 0.5, 0, 0.02, 0.95, 1.7, col(pick(['#2a6a5a', '#3a5a8a', '#c85a3a'], r3)), { twoSided: true }); }
      if (r3 > 0.4 && free(0, D2 / 2 + 2.0, 1.2)) { const lz = D2 / 2 + 1.9; m.box(xf, 0, 0, lz, 2.6, 0.35, 0.8, col(pick(['#2a6ac0', '#d83a32', '#f2f2ee', '#3aa060'], r1))); m.box(xf, 0, 0.35, lz, 2.7, 0.08, 0.86, col('#f2c230')); m.box(xf, 1.4, 0.1, lz, 0.5, 0.3, 0.4, col('#2a6ac0')); const [x, z] = at(0, lz); C.box(x, z, 1.35, 0.45, a); }
      return { xf, w: W2, d: D2 };
    }
    // K: rumah kampung
    const c = col(b.color || pick(WALLS.K, r2)), Hh = FLOOR * (ar > 18 ? 1.3 : 1), roof = col(pick(ROOFS, r1));
    m.box(xf, 0, -0.6, 0, W2 + 0.2, 0.6, D2 + 0.2, col('#8a8478'));
    m.box(xf, 0, 0, 0, W2, Hh, D2, c);
    if (W2 >= D2) m.gable(xf, 0, Hh, 0, W2, D2, Math.min(1.4, D2 * 0.4), roof, 0.3, c); else m.gable({ ...xf, a: a + Math.PI / 2 }, 0, Hh, 0, D2, W2, Math.min(1.4, W2 * 0.4), roof, 0.3, c);
    m.box(xf, -W2 * 0.18, 0, fz, 0.8, 1.35, 0.06, col('#6a4a30'));
    for (let u = W2 * 0.15; u < W2 / 2 - 0.4; u += 1.2) win(u, 0.7, 0);
    sideWins(0.7, fr);
    if (ar < 18) m.box(xf, 0, 0, D2 / 2 + 0.45, W2, 0.08, 0.9, col('#c4beb2'));   // teras
    return { xf, w: W2, d: D2 };
  }
  const SPECIAL = [
    [236, 280, (m, b, y, C) => {   // mercusuar: menara bulat belang merah-putih + rumah lampu
      const xf = { x: b.x, z: b.y + LZ, a: 0, y };
      for (let i = 0; i < 6; i++) m.cyl(xf, 0, i * 1.6, 0, 1.25 - i * 0.12, 1.6, col(i % 2 ? '#d83a32' : '#f4f4f0'), { r2: 1.13 - i * 0.12, seg: 12 });
      m.cyl(xf, 0, 9.6, 0, 1.05, 0.15, col('#3a3a40'), { seg: 12 }); m.cyl(xf, 0, 9.75, 0, 0.7, 0.9, col('#f6e8a0'), { seg: 10 }); m.cyl(xf, 0, 10.65, 0, 0.85, 0.6, col('#d83a32'), { r2: 0.1, seg: 10 });
      C.circle(b.x, b.y + LZ, 1.35); return true; }],
    [236, 280, () => true],
    [-74, 34, (m, b, y, C) => {   // bendungan: dinding beton + pagar + pintu air
      const xf = { x: b.x, z: b.y + LZ, a: b.a, y: y - 0.4 }, c = col('#a8a8ae');
      m.box(xf, 0, 0, 0, b.w, 2.2, b.h, c, { top: col('#8a8a90') });
      for (const sd of [-1, 1]) for (let u = -b.w / 2 + 0.3; u < b.w / 2; u += 1.2) m.box(xf, u, 2.2, sd * (b.h / 2 - 0.08), 0.1, 0.6, 0.1, col('#e8e8e8'));
      for (const sd of [-1, 1]) m.box(xf, 0, 2.7, sd * (b.h / 2 - 0.08), b.w, 0.06, 0.06, col('#e8e8e8'));
      for (const u of [-3, 0, 3]) { m.box(xf, u, 2.2, 0, 1.2, 1.6, 1.2, col('#8a8a90')); m.box(xf, u, 0.2, b.h / 2 + 0.01, 0.9, 1.4, 0.05, col('#3a4a5a')); }
      return false; }],
    [367, 213.2, (m, b, y, C) => {   // deret garasi pit
      const xf = { x: b.x, z: b.y + LZ, a: 0, y }; m.box(xf, 0, 0, 0, b.w, 2.6, b.h, col('#e2e2e8'), { top: col('#9a9aa2') });
      for (let i = 0; i < 20; i++) { const u = -b.w / 2 + 1.1 + i * 2.1; m.box(xf, u, 0, b.h / 2 + 0.01, 1.8, 2.0, 0.05, col(i % 2 ? '#3a3a42' : '#4a4a52')); m.box(xf, u, 2.1, b.h / 2 + 0.02, 1.8, 0.3, 0.04, col(['#d8342c', '#2a6ac0', '#f2c230'][i % 3])); }
      C.box(b.x, b.y + LZ, b.w / 2, b.h / 2, 0); return true; }],
    [368, 228.4, (m, b, y, C) => {   // tribun utama: undakan kursi + atap
      const xf = { x: b.x, z: b.y + LZ, a: 0, y };
      for (let k = 0; k < 5; k++) m.box(xf, 0, 0, -b.h / 2 + 0.32 + k * 0.64, b.w, 0.4 + k * 0.4, 0.64, col(k % 2 ? '#3a78b8' : '#4a88c8'), { top: col(k % 2 ? '#2a68a8' : '#3a78b8') });
      for (let u = -b.w / 2; u <= b.w / 2; u += 4.4) m.box(xf, u, 0, b.h / 2 - 0.1, 0.16, 3.6, 0.16, col('#5a5a62'));
      m.box(xf, 0, 3.6, 0.2, b.w + 0.4, 0.12, b.h + 1.2, col('#e8e8ee'));
      C.box(b.x, b.y + LZ, b.w / 2, b.h / 2, 0); return true; }],
    [206, 259, (m, b, y, C) => {   // Hotel Samudra: 3 lantai, balkon
      const xf = { x: b.x, z: b.y + LZ, a: 0, y }, c = col(b.color), H3 = FLOOR * 3;
      m.box(xf, 0, 0, 0, b.w, H3, b.h, c); m.box(xf, 0, H3, 0, b.w + 0.3, 0.2, b.h + 0.3, col('#2a8ab0'));
      for (let f = 0; f < 3; f++) for (let u = -b.w / 2 + 0.9; u < b.w / 2; u += 1.5) { m.box(xf, u, f * FLOOR + 0.5, b.h / 2 + 0.03, 1.0, 0.9, 0.05, col('#3a5a7a')); if (f) m.box(xf, u, f * FLOOR + 0.1, b.h / 2 + 0.3, 1.2, 0.08, 0.6, col('#f4f4f0')); }
      m.box(xf, 0, 0, b.h / 2 + 0.03, 1.6, 1.4, 0.05, col('#6a8aa8'));
      C.box(b.x, b.y + LZ, b.w / 2, b.h / 2, 0); return true; }],
    [34, 240, (m, b, y, C) => {   // Stasiun Lintang: ujung rel + peron beratap di timur rel, kantor di sebelahnya
      const xf = { x: b.x, z: b.y + LZ, a: 0, y }, wall = col(b.color), roof = col('#4a4e58');
      m.box(xf, 2.1, 0, 0, 2.2, 0.45, 9, col('#b8b2a4'), { top: col('#c8c2b4') }); m.box(xf, 1.05, 0.45, 0, 0.12, 0.02, 9, col('#f2c230'));
      for (const u of [-3.6, 0, 3.6]) m.box(xf, 2.6, 0.45, u, 0.14, 2.4, 0.14, col('#5a5a62'));
      m.gable({ ...xf, a: Math.PI / 2 }, 0, 2.85, -1.6, 9.6, 4.6, 0.6, roof, 0.2);
      m.box(xf, 4.35, 0, 0, 2.2, FLOOR, 5.4, wall); m.gable({ ...xf, a: Math.PI / 2 }, 0, FLOOR, -4.35, 5.4, 2.2, 0.9, col('#c05a3c'), 0.25, wall);
      m.box(xf, 5.46, 0, 0, 0.05, 1.35, 0.9, col('#6a4a30')); for (const u of [-1.6, 1.6]) m.box(xf, 5.46, 0.75, u, 0.05, 0.6, 0.8, col('#3a4a5a'));
      m.box(xf, 2.1, 2.3, 4.2, 1.8, 0.4, 0.06, col('#2a5aa0')); m.box(xf, 2.1, 2.36, 4.24, 1.5, 0.28, 0.04, col('#f4f4f0'));
      m.box(xf, -0.7, 0, 4.1, 1.6, 0.7, 0.3, col('#d8342c')); m.box(xf, -0.7, 0.7, 4.1, 1.6, 0.12, 0.32, col('#f4f4f0'));   // penahan ujung rel
      C.box(b.x + 4.35, b.y + LZ, 1.15, 2.75, 0); C.box(b.x - 0.7, b.y + LZ + 4.1, 0.85, 0.2, 0); return true; }],
    [314, 264, (m, b, y, C) => {   // TPI muara: los terbuka di atas panggung kayu di tepi sungai
      const xf = { x: b.x, z: b.y + LZ, a: b.a, y: y + 0.1 }, wood = col('#7a5a3a');
      for (let u = -b.w / 2 + 0.3; u <= b.w / 2; u += 1.8) for (const v of [-1, 1]) m.box(xf, u, -1.2, v * (b.h / 2 - 0.1), 0.18, 1.7, 0.18, col('#5a4028'));
      m.box(xf, 0, 0.5, 0, b.w + 0.4, 0.15, b.h + 0.4, col('#9a7650'), { top: col('#a8845c') });
      for (let u = -b.w / 2 + 0.2; u <= b.w / 2; u += 2.6) for (const v of [-1, 1]) m.box(xf, u, 0.65, v * (b.h / 2 - 0.1), 0.14, 2.2, 0.14, wood);
      m.gable(xf, 0, 2.85, 0, b.w + 0.6, b.h + 0.8, 0.9, col(b.color), 0.2);
      for (let k = 0; k < 6; k++) m.box(xf, -b.w / 2 + 1 + k * 1.2, 0.65, (k % 2 ? 0.4 : -0.5), 0.7, 0.35, 0.5, col(['#3a7ac0', '#d8342c', '#f2c230'][k % 3]));
      C.box(b.x, b.y + LZ, b.w / 2, b.h / 2, b.a); return true; }],
    [318, 270, (m, b, y, C) => {   // dermaga TPI: geladak kayu bertiang sampai ke air
      const xf = { x: b.x, z: b.y + LZ, a: b.a, y: Math.max(y, -0.3) }, dk = col('#9a7650');
      for (let v = -b.h / 2 + 0.2; v <= b.h / 2; v += 1.2) for (const u of [-1, 1]) m.box(xf, u * (b.w / 2 - 0.1), -1.5, v, 0.16, 2.1, 0.16, col('#5a4028'));
      for (let v = -b.h / 2; v < b.h / 2 - 0.01; v += 0.4) m.box(xf, 0, 0.5, v + 0.2, b.w, 0.1, 0.36, hash(v * 10, 3) < 0.5 ? dk : shade(dk, 0.9));
      for (const u of [-1, 1]) m.box(xf, u * (b.w / 2 - 0.05), 0.6, 0, 0.08, 0.6, b.h, col('#6a4a2c'));
      return true; }],
  ];
  // warung pantai berderet (atap warna-warni, terbuka) & barak batalyon (atap hijau)
  function warungPantai(m, b, y, C) {
    const xf = { x: b.x, z: b.y + LZ, a: 0, y }, c = col(b.color);
    for (const ux of [-1, 1]) for (const uz of [-1, 1]) m.box(xf, ux * (b.w / 2 - 0.15), 0, uz * (b.h / 2 - 0.15), 0.12, 1.9, 0.12, col('#7a5a3a'));
    m.box(xf, 0, 0, -b.h / 2 + 0.3, b.w, 1.0, 0.3, col('#c8a070')); m.box(xf, 0, 0, 0, b.w * 0.5, 0.75, 0.7, col('#a07a4a'));
    m.gable(xf, 0, 1.9, 0, b.w, b.h, 0.7, c, 0.25);
    for (let k = 0; k < 2; k++) m.box(xf, -b.w / 4 + k * b.w / 2, 0, b.h / 2 + 0.9, 0.9, 0.7, 0.9, col('#e8e2d0'));
    C.box(b.x, b.y + LZ - b.h / 2 + 0.3, b.w / 2, 0.2, 0);
  }

  /* ---------------- bangun & bongkar wilayah */
  // grid cepat per wilayah (2 sel/petak): air (kecuali jembatan), jalan (+0.6), tapak bangunan (+0.8)
  function zoneGrid(Z) {
    const R = 2, W = (Z.x1 - Z.x0) * R, H = (Z.z1 - Z.z0) * R, mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d', { willReadFrequently: true }); g.setTransform(R, 0, 0, R, -Z.x0 * R, -Z.z0 * R); g.lineCap = g.lineJoin = 'round'; g.fillStyle = g.strokeStyle = '#000'; return [c, g]; };
    const line = (g, pts, w) => { g.beginPath(); pts.forEach(([x, z], k) => k ? g.lineTo(x, z) : g.moveTo(x, z)); g.lineWidth = w; g.stroke(); };
    const [cw, gw] = mk(); for (const i of WATER) { gw.beginPath(); K.areas[i].pts.forEach(([x, z], k) => k ? gw.lineTo(x, z) : gw.moveTo(x, z)); gw.closePath(); gw.fill(); }
    for (const r of rivers) line(gw, r.pts, r.w); gw.globalCompositeOperation = 'destination-out'; for (const r of roads) if (r.kind !== 'setapak') line(gw, r.pts, r.w + 0.4);
    const [cr, gr] = mk(); for (const r of roads) line(gr, r.pts, r.w + 1.2);
    const [cb, gb] = mk(); for (const b of K.bldgs) { gb.save(); gb.translate(b.x, b.y); gb.rotate(b.a); gb.fillRect(-b.w / 2 - 0.8, -b.h / 2 - 0.8, b.w + 1.6, b.h + 1.6); gb.restore(); }
    gb.fillRect(Z.stop.x - 2, Z.stop.z - 2, 4, 4);
    const A = c => { const d = c.getContext('2d').getImageData(0, 0, W, H).data, o = new Uint8Array(W * H); for (let i = 0; i < o.length; i++) o[i] = d[i * 4 + 3] > 100 ? 1 : 0; return o; };
    const lake = i => { const [c, g] = mk(); g.beginPath(); K.areas[i].pts.forEach(([x, z], k) => k ? g.lineTo(x, z) : g.moveTo(x, z)); g.closePath(); g.fill(); return A(c); };
    const water = A(cw), road = A(cr), bld = A(cb), l9 = lake(9), l25 = lake(25);
    const at = (arr, x, z) => { const i = Math.floor((x - Z.x0) * R), j = Math.floor((z - Z.z0) * R); return i >= 0 && j >= 0 && i < W && j < H ? arr[j * W + i] : 1; };
    return { R, W, H, water, w: (x, z) => at(water, x, z), r: (x, z) => at(road, x, z), b: (x, z) => at(bld, x, z), l9: (x, z) => at(l9, x, z), l25: (x, z) => at(l25, x, z) };
  }
  let cur = null;
  const built = {};
  function load(id) {
    const Z = ZB[id]; if (!Z) return;
    if (cur?.Z === Z) return;
    unload();
    if (!HG) buildHeights();
    const group = new THREE.Group(); scene.add(group);
    const first = !built[id]; built[id] = true;
    const C = first ? collision : { box() {}, circle() {}, mask() {} };
    const G = zoneGrid(Z);
    // tanah: potongan <= 128 petak (tekstur <= 2048 px)
    const cv = paint(Z), TS = 2048 / PX, W = Z.x1 - Z.x0, H = Z.z1 - Z.z0, texs = [];
    for (let tx = 0; tx < W; tx += TS) for (let tz = 0; tz < H; tz += TS) {
      const tw = Math.min(TS, W - tx), th = Math.min(TS, H - tz), c = document.createElement('canvas'); c.width = tw * PX; c.height = th * PX;
      c.getContext('2d').drawImage(cv, -tx * PX, -tz * PX);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = 4; texs.push(tex);
      const SUB = MOUNTZ.has(id) ? 2 : 1, geo = new THREE.PlaneGeometry(tw, th, tw * SUB, th * SUB), ox = Z.x0 + tx + tw / 2, oz = Z.z0 + tz + th / 2, pa = geo.attributes.position;
      for (let i = 0; i < pa.count; i++) pa.setZ(i, heightAt(ox + pa.getX(i), oz - pa.getY(i)));
      geo.computeVertexNormals();
      const gm = new THREE.Mesh(geo, groundDetail(new THREE.MeshLambertMaterial({ map: tex })));
      gm.rotation.x = -Math.PI / 2; gm.position.set(ox, 0, oz + LZ); gm.receiveShadow = true; group.add(gm);
    }
    // laut/danau di luar batas wilayah tetap kelihatan sampai cakrawala: bidang biru/hijau besar di bawah
    { const far = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshLambertMaterial({ color: new THREE.Color(Z.z1 > 250 ? '#5f98c4' : '#9cbc78') })); far.rotation.x = -Math.PI / 2; far.position.set((Z.x0 + Z.x1) / 2, -0.8, (Z.z0 + Z.z1) / 2 + LZ); group.add(far); }
    // air: dari raster air wilayah (jalan & jembatan sudah dilubangi), tinggi per sel: danau / kali / laut
    { const m = new Merger(), cw = col('#4f8ab8'), R = G.R, cs = 1 / R;
      const lvl = (x, z) => { if (G.l9(x, z)) return LAKE[9] + 0.12; if (G.l25(x, z)) return LAKE[25] + 0.12;
        const v = RIVL[idx(Math.round(x - BX0), Math.round(z - BZ0))]; return v === v ? v + 0.1 : -0.23; };
      for (let j = 0; j < G.H; j++) { let i = 0;
        while (i < G.W) { if (!G.water[j * G.W + i]) { i++; continue; }
          const z0 = Z.z0 + j * cs, x0 = Z.x0 + i * cs, L = lvl(x0 + cs / 2, z0 + cs / 2); let i1 = i + 1;
          while (i1 < G.W && G.water[j * G.W + i1] && Math.abs(lvl(Z.x0 + i1 * cs + cs / 2, z0 + cs / 2) - L) < 0.03) i1++;
          const x1 = Z.x0 + i1 * cs, z1 = z0 + cs;
          m.poly([[x0, L, z0 + LZ], [x0, L, z1 + LZ], [x1, L, z1 + LZ], [x1, L, z0 + LZ]], cw); i = i1; } }
      if (m.n) { const wm = new THREE.Mesh(m.build(), waterMat()); wm.renderOrder = 2; group.add(wm); } }
    // jembatan (Map.jembatan di peta): balok samping beton sampai ke air, pagar putih, tiang lampu kecil
    { const m = new Merger(), conc = col('#b8b4aa'), wh = col('#f2f2ee'), dark = col('#5a5a60');
      for (const b of K.bridges || []) { if (zoneOf(b.x, b.y) !== id) continue;
        const Y = heightAt(b.x, b.y), wl = RIVL[idx(Math.round(b.x - BX0), Math.round(b.y - BZ0))], W = (wl === wl ? wl : Y - 1) - 0.2, xf = { x: b.x, z: b.y + LZ, a: b.a, y: Y }, hw = b.w / 2;
        for (const sd of [-1, 1]) {
          m.box(xf, 0, W - Y, sd * (hw - 0.2), b.len, Y - W + 0.12, 0.4, conc, { top: col('#a8a49a') });
          for (let u = -b.len / 2 + 0.1; u <= b.len / 2; u += 1) m.box(xf, u, 0.12, sd * (hw - 0.2), 0.14, 0.75, 0.14, wh);
          m.box(xf, 0, 0.85, sd * (hw - 0.2), b.len, 0.1, 0.16, wh); m.box(xf, 0, 0.45, sd * (hw - 0.2), b.len, 0.06, 0.08, dark);
          for (const e of [-1, 1]) m.box(xf, e * (b.len / 2 + 0.1), 0, sd * (hw - 0.2), 0.4, 1.1, 0.4, conc);   // kepala jembatan
        }
        for (let u = -b.len / 2 + 2; u < b.len / 2 - 1; u += 4) m.box(xf, u, W - Y - 0.1, 0, 0.8, Y - W - 0.3, b.w - 0.8, shade(conc, 0.8));   // pilar
      }
      if (m.n) { const me = new THREE.Mesh(m.build(), MAT.world); me.castShadow = me.receiveShadow = true; group.add(me); } }
    // jalan pegunungan: pagar pengaman di sisi jurang, batu di kaki tebing (guide 86)
    const edgeRocks = [];
    { const m = new Merger(), post = col('#f2f2ee'), rail = col('#c8ccd2'), stripe = col('#d8342c');
      roads.forEach((r, ri) => { if (r.kind === 'setapak') return; const P = resample(r.pts, 1.2);
        P.forEach((p, n) => { if (zoneOf(p.x, p.z) !== id || !MOUNTZ.has(id)) return; const hy = heightAt(p.x, p.z);
          for (const sd of [-1, 1]) { const o = r.w / 2 + 1.6, x = p.x - p.tz * sd * o, z = p.z + p.tx * sd * o, dh = heightAt(x, z) - hy, ex = p.x - p.tz * sd * (r.w / 2 + 0.35), ez = p.z + p.tx * sd * (r.w / 2 + 0.35);
            if (roadDist(x, z) < 0.5 || G.r(ex, ez) && roadDist(ex, ez) < 0.2) continue;
            if (dh < -0.7) { const xf = { x: ex, z: ez + LZ, a: Math.atan2(p.tz, p.tx), y: heightAt(ex, ez) };
              m.box(xf, 0, 0, 0, 0.12, 0.7, 0.12, post); m.box(xf, 0, 0.42, 0, 1.25, 0.2, 0.05, rail); if (n % 3 === 0) m.box(xf, 0, 0.62, 0.065, 0.12, 0.06, 0.02, stripe); }
            else if (dh > 1.0 && hash(n * 2 + (sd > 0), ri + 40) < 0.35) edgeRocks.push({ k: 'batu', x: p.x - p.tz * sd * (r.w / 2 + 1.1), z: p.z + p.tx * sd * (r.w / 2 + 1.1) + LZ, y: heightAt(p.x - p.tz * sd * (r.w / 2 + 1.1), p.z + p.tx * sd * (r.w / 2 + 1.1)), a: n, s: 1.4 + hash(n, ri) * 1.6 });
          } }); });
      if (m.n) { const me = new THREE.Mesh(m.build(), MAT.world); me.castShadow = me.receiveShadow = true; group.add(me); } }
    // air menghalangi (kecuali jembatan) — mask 2 sel/petak
    if (first) collision.mask({ ox: Z.x0, oz: Z.z0 + LZ, res: G.R, w: G.W, h: G.H, data: G.water });
    // bangunan
    const ch = new Chunks(32);
    for (const b of K.bldgs) {
      if (zoneOf(b.x, b.y) !== id) continue;
      const m = ch.at(b.x, b.y + LZ), y = heightAt(b.x, b.y), sp = SPECIAL.find(([x, z]) => Math.abs(x - b.x) < 0.6 && Math.abs(z - b.y) < 0.6);
      if (sp) { const solid = sp[2](m, b, y, C); if (solid === false) C.box(b.x, b.y + LZ, b.w / 2, b.h / 2, b.a); continue; }
      if (Math.abs(b.y - 258) < 0.5 && b.x >= 119 && b.x <= 157) { warungPantai(m, b, y, C); continue; }
      const r = house(m, b, y, C);
      if (b.x >= 303 && b.x <= 326 && Math.abs(b.y - 40) < 1) { /* barak: atap hijau tentara */ m.gable({ ...r.xf, a: r.xf.a + Math.PI / 2 }, 0, FLOOR * 1.3 + 0.02, 0, r.d, r.w, 1.0, col('#5a7a4a'), 0.32); }
      C.box(b.x, b.y + LZ, r.w / 2 + 0.05, r.d / 2 + 0.05, r.xf.a);
    }
    // halte: tiang + atap + bangku
    { const p = Z.stop, xf = { x: p.x, z: p.z + LZ, a: p.h, y: heightAt(p.x, p.z) }, m = ch.at(p.x, p.z + LZ);
      for (const u of [-1, 1]) m.box(xf, u * 1.1, 0, -0.5, 0.1, 2.2, 0.1, col('#4a4a52'));
      m.box(xf, 0, 2.2, -0.2, 2.6, 0.1, 1.3, col('#2a6ac0')); m.box(xf, 0, 0.42, -0.6, 2.0, 0.08, 0.4, col('#c8a060'));
      m.box(xf, 1.5, 0, 0.2, 0.08, 2.4, 0.08, col('#5a5a62')); m.box(xf, 1.5, 2.1, 0.2, 0.6, 0.6, 0.05, col('#f2c230'));
      C.box(p.x - Math.sin(p.h) * 0.6, p.z + LZ + Math.cos(p.h) * 0.6, 1.3, 0.25, p.h); }
    for (const me of ch.meshes(MAT.world)) group.add(me);
    // tumbuhan
    const veg = [...edgeRocks], free = (x, z) => !G.r(x, z) && !G.w(x, z) && !G.b(x, z) && zoneOf(x, z) === id;
    const Y = (x, z) => heightAt(x, z);
    const trees = K.trees.filter(([x, z]) => x >= Z.x0 && x < Z.x1 && z >= Z.z0 && z < Z.z1);
    trees.forEach(([x, z, rr], i) => {
      if (!free(x, z)) return;
      const r = hash(i, 91), lv = (HG[idx(Math.round(x - BX0), Math.round(z - BZ0))] || 0);
      let k = 'bulat', s = 0.55 + rr * 0.3;
      if (inPoly(x, z, K.areas[24].pts)) { k = 'bulat'; s = 0.45; }
      else if (z > 244 || (z > 236 && x < 0)) k = r < 0.75 ? 'kelapa' : 'ketapang';
      else if (lv > 5 || [12, 20].some(a => inPoly(x, z, K.areas[a].pts))) k = r < 0.8 ? 'cemara' : 'bulat';
      else if (inPoly(x, z, K.areas[13].pts)) k = r < 0.6 ? 'ketapang' : 'bulat';
      else if (id === 'tegalsari' && z > 180) k = 'bulat';   // kebun karet
      if (k !== 'bulat') s = 0.8 + rr * 0.15;
      veg.push({ k, x, z: z + LZ, y: Y(x, z), s, a: r * 6, c: inPoly(x, z, K.areas[24].pts) ? '#6a9a6a' : null }); if (first) collision.circle(x, z + LZ, 0.22 * s + 0.1);
    });
    const A = (Z.x1 - Z.x0) * (Z.z1 - Z.z0);
    // rumput bertingkat (guide 86 "Rumput dan tanah"): rumpun pendek rapat di tepi jalan & kaki bangunan, ilalang di lereng
    // & tepi kali, lebih rapat di gunung, menipis di halaman desa; sawah/kebun teh/pasir tanpa rumput liar
    const TINT = ['#ffffff', '#eef4dc', '#f4f0c8', '#dcebd0', '#e4ecc4'];
    const slope = (x, z) => Math.hypot(Y(x + 0.7, z) - Y(x - 0.7, z), Y(x, z + 0.7) - Y(x, z - 0.7)) / 1.4;
    const inA = (x, z, L) => L.some(a => inPoly(x, z, K.areas[a].pts));
    const bare = (x, z) => inA(x, z, [15, 17, 18, 19, 31]) || (K.polys[0] && inPoly(x, z, K.polys[0].pts));
    const grassAt = (x, z, k, s) => veg.push({ k, x, z: z + LZ, y: Y(x, z), a: hash(x * 7, z * 3) * 6.28, s, c: pick(TINT, hash(x * 3, z * 11)) });
    for (let i = 0; i < A / 1.6; i++) {
      const x = Z.x0 + hash(i, 301 + id.length) * (Z.x1 - Z.x0), z = Z.z0 + hash(i, 302 + id.length) * (Z.z1 - Z.z0); if (!free(x, z)) continue;
      const r = hash(i, 303), r2 = hash(i, 305), h = Y(x, z), sl = slope(x, z), vil = inA(x, z, [26, 27, 30]);
      if (bare(x, z)) { if (r < 0.03) veg.push({ k: 'batu', x, z: z + LZ, y: h, a: r * 70, s: 0.6 + r * 6 }); continue; }
      const keep = vil ? 0.15 : h > 2 || MOUNTZ.has(id) ? 0.9 : 0.45; if (r2 > keep) continue;
      if (r < 0.04) { veg.push({ k: 'bunga', x, z: z + LZ, y: h, a: r * 50, c: pick(['#f06080', '#f0d040', '#ffffff', '#c080f0', '#f09030'], hash(i, 304)) }); continue; }
      if (r < 0.07) { veg.push({ k: 'batu', x, z: z + LZ, y: h, a: r * 70, s: 0.6 + r * 4 }); continue; }
      if (r < 0.12) { veg.push({ k: 'semak', x, z: z + LZ, y: h, a: r * 30 }); continue; }
      if (!vil && (sl > 0.28 || riverDist(x, z) < 3.5 || r > 0.93)) {   // rumpun ilalang
        const n = 3 + Math.floor(hash(i, 306) * 5); for (let k = 0; k < n; k++) { const a = hash(i, 307 + k) * 6.28, d = hash(i, 317 + k) * 1.4, X = x + Math.cos(a) * d, Zz = z + Math.sin(a) * d; if (free(X, Zz)) grassAt(X, Zz, 'ilalang', 0.8 + hash(i, 327 + k) * 0.45); }
        continue; }
      grassAt(x, z, 'rumputPendek', 0.85 + r * 0.6);
    }
    // tepi jalan: rumpun pendek rapat (di setapak menipis)
    roads.forEach((r, ri) => { const P = resample(r.pts, 0.7);
      P.forEach((p, n) => { if (zoneOf(p.x, p.z) !== id) return; for (const sd of [-1, 1]) {
        if (hash(n * 2 + (sd > 0), ri + 500) > (r.kind === 'setapak' ? 0.4 : 0.8)) continue;
        const d = r.w / 2 + 0.45 + hash(n, ri + 600 + sd) * 0.7, x = p.x - p.tz * sd * d, z = p.z + p.tx * sd * d;
        if (G.w(x, z) || roadDist(x, z) < 0.3 || bare(x, z) || G.b(x, z) && K.bldgs.some(b => Math.hypot(b.x - x, b.y - z) < Math.min(b.w, b.h) / 2 + 0.3)) continue;
        grassAt(x, z, hash(n, ri + 700) < 0.12 && r.kind !== 'raya' ? 'ilalang' : 'rumputPendek', 0.8 + hash(n, ri + 800) * 0.5); } }); });
    // kaki bangunan
    for (const b of K.bldgs) { if (b.zone !== id || b.fixed) continue; const c = Math.cos(b.a), s = Math.sin(b.a), hw = b.w / 2 + 0.3, hd = b.h / 2 + 0.3;
      for (let u = -hw; u <= hw; u += 0.8) for (const v of [-hd, hd]) for (const [lu, lv] of [[u, v], [v * hw / hd, u * hd / hw]]) {
        if (hash(b.x * 3 + lu * 7, b.y + lv * 5) > 0.45) continue; const x = b.x + lu * c - lv * s, z = b.y + lu * s + lv * c;
        if (!G.w(x, z) && roadDist(x, z) > 0.4 && zoneOf(x, z) === id) grassAt(x, z, 'rumputPendek', 0.7 + hash(x, z) * 0.4); } }
    // sawah & kebun teh: barisan tanaman
    let pc = 0;
    for (const ai of [17, 18, 19]) { const S = K.areas[ai]; for (let x = Z.x0; x < Z.x1; x += 1.1) for (let z = Z.z0; z < Z.z1; z += 1.1) {
      if (pc > 14000) break; const an = (S.angle || 0) * Math.PI / 180, u = x * Math.cos(an) + z * Math.sin(an); if (((u % 6) + 6) % 6 < 0.7) continue;
      if (free(x, z) && inPoly(x, z, S.pts)) { veg.push({ k: 'padi', x: x + (hash(x * 10, z) - 0.5) * 0.3, z: z + LZ, y: Y(x, z), a: hash(z, x) * 6, s: 0.9 + hash(x, z) * 0.3 }); pc++; } } }
    { const T = K.areas[15], an = (T.angle || 0) * Math.PI / 180, ca = Math.cos(an), sa = Math.sin(an);
      for (let v = -400; v < 400; v += 1.6) for (let u = -400; u < 400; u += 3.2) { const x = 240 + u * ca - v * sa, z = -28 + u * sa + v * ca; if (x < Z.x0 || x >= Z.x1 || z < Z.z0 || z >= Z.z1) continue; if (!free(x, z) || !inPoly(x, z, T.pts)) continue; veg.push({ k: 'teh', x, z: z + LZ, y: Y(x, z), sx: 3, a: -an }); } }
    // kelapa di pinggir pantai (pasir)
    if (Z.z1 > 250) for (let i = 0; i < 160; i++) { const x = Z.x0 + hash(i, 411) * (Z.x1 - Z.x0), z = 246 + hash(i, 412) * 14; if (!free(x, z) || !inPoly(x, z, K.polys[0].pts) && z > 252) continue; veg.push({ k: 'kelapa', x, z: z + LZ, y: Y(x, z), s: 0.85 + hash(i, 413) * 0.2, a: i }); if (first) collision.circle(x, z + LZ, 0.25); }
    const ims = plant(group, veg);
    // tokoh
    const folk = [];
    for (const [zid, sid, name, x, z, lines] of FOLK) {
      if (zid !== id) continue;
      const c = new Character(sid); scene.add(c.group);
      const p = collision.resolve({ x, z: z + LZ }, 0.3);
      const n = { sid, name, lines, filler: true, area: 'luar', key: 'L' + name, c, home: { x: p.x, z: p.z }, x: p.x, z: p.z, tx: p.x, tz: p.z, wait: Math.random() * 3, heading: Math.random() * 6, say: null, greetT: 5, roam: 2 };
      npcs.push(n); folk.push(n);
    }
    cur = { Z, group, texs, ims, folk, canvas: cv };
  }
  const centroid = pts => { let x = 0, z = 0; for (const p of pts) { x += p[0]; z += p[1]; } return [x / pts.length, z / pts.length]; };
  function unload() {
    if (!cur) return;
    scene.remove(cur.group);
    cur.group.traverse(o => { if (o.isMesh && o.geometry && !o.isInstancedMesh) o.geometry.dispose(); if (o.material?.map) o.material.map.dispose(); });
    for (const im of cur.ims) { const i = SMALL.indexOf(im); if (i >= 0) SMALL.splice(i, 1); im.dispose?.(); }
    for (const n of cur.folk) { scene.remove(n.c.group); const i = npcs.indexOf(n); if (i >= 0) npcs.splice(i, 1); }
    cur = null;
  }

  /* ---------------- API */
  const marks = K.marks.map(m => ({ x: m.x, z: m.y, desc: m.desc, zone: zoneOf(m.x, m.y) }));
  return {
    ZONES, LZ, portals, marks, zoneOf, bldgs: K.bldgs,
    get cur() { return cur && cur.Z; },
    load, unload, heightAt,
    groundY: (x, z) => heightAt(x, z - LZ),
    // boleh berdiri di sini? (hanya di dalam wilayah yang sedang dimuat)
    allowed: (x, z) => !!cur && zoneOf(x, z - LZ) === cur.Z.id,
    waterAt: (x, z) => waterAt(x, z - LZ),
    // nama tempat: penanda/label terdekat, kalau tidak ada nama wilayah
    nameAt(x, z) {
      if (!cur) return ''; z -= LZ; let best = null, bd = 18;
      for (const l of K.labels) { const d = Math.hypot(l.x - x, l.y - z); if (d < bd + (l.big ? 12 : 0)) { bd = d; best = l.t.replace('\n', ' '); } }
      return best ? best.replace(/\b(\w)(\w*)/g, (_, a, b) => a + b.toLowerCase()) : cur.Z.name;
    },
    // jalan keluar (dari kota atau wilayah sekarang): { kind: 'travel', label, to }
    target(from, x, z) {
      if (from === 'luar') { if (!cur) return null; z -= LZ; from = cur.Z.id; }
      for (const p of portals) if (p.from === from && Math.hypot(p.x - x, p.z - z) < 4) {
        const dest = p.to === 'kota' ? 'Masuk kota Wirabumi' : 'Ke ' + ZB[p.to].name;
        return { kind: 'travel', label: dest + (p.name ? ' (' + p.name + ')' : ''), to: { zone: p.to, x: p.at.x, z: p.at.z, h: p.at.h }, keepRide: true };
      }
      if (from !== 'kota') {
        const Z = ZB[from], s = Z.stop; if (Math.hypot(s.x - x, s.z - z) < 2.2) return { kind: 'halte', label: 'Halte: naik angkutan pulang ke kota', zone: Z };
        for (const m of marks) if (m.zone === from && Math.hypot(m.x - x, m.z - z) < 3.5) return { kind: 'info', label: m.desc.split(':')[0].split('(')[0].trim(), desc: m.desc };
      }
      return null;
    },
    // minimap: kanvas tanah wilayah sekarang
    get map() { return cur && { img: cur.canvas, ox: cur.Z.x0, oz: cur.Z.z0 + LZ, k: PX }; },
  };
}
