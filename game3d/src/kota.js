// Kota Wirabumi. Jalan, sungai, rel, sawah & lokasi penting dari peta_kota (kota.json);
// rumah DITATA ULANG di sepanjang jalan: menghadap jalan, punya halaman & akses, rapat tapi tidak acak.
import * as THREE from 'three';
import KOTA from './data/kota.json';
import { Chunks, Merger, col, shade, mix } from './geom.js';
import { FLOOR, hash, pick, inPoly, rgb, MAT, PAT, makePatterns, groundDetail, facade, colLocal, GLASS, GLASS2, FRAME, voxelize } from './common.js';
import { PAL, L, kampung, panggung, perum, ruko, motor, car, P1CAR } from './buildings.js';
import { plant } from './veg.js';
import { buildTraffic } from './traffic.js';
import { SignBatch } from './signs.js';
import { buildPlaces } from './places.js';
import { rukoShop, hotelKos, kantor, warung, minimarket, lahanParkir, parkedMotors } from './toko.js';

const PX = 16;   // piksel tekstur tanah per petak (1 piksel = 2 voxel)
// indeks area dicari dari warnanya (urutan di peta_organik.py bisa berubah)
const eqc = (a, c) => a.color[0] === c[0] && a.color[1] === c[1] && a.color[2] === c[2];
// kolam renang umum lama (bidang air kecil) menabrak jalan: dihapus, diganti kolam renang buatan di samping GOR Kota (places.js)
{ const i = KOTA.areas.findIndex(a => a.pts.every(p => p[0] > 157 && p[0] < 165 && p[1] > 48 && p[1] < 55)); if (i > 6) KOTA.areas.splice(i, 1);
  const g = KOTA.bldgs.find(b => Math.round(b.x) === 168 && Math.round(b.y) === 44);
  if (g) { const c = Math.cos(g.a), sn = Math.sin(g.a), lx = 10.6, lz = 0.2; KOTA.bldgs.push({ x: g.x + lx * c - lz * sn, y: g.y + lx * sn + lz * c, w: 7.6, h: 6.4, a: g.a, kolam: true }); } }
const AREA = (() => {
  const A = KOTA.areas, idx = c => A.map((a, i) => eqc(a, c) ? i : -1).filter(i => i >= 0);
  const green = idx([178, 208, 132]);
  return { water: idx([104, 160, 204]), sawah: A.map((a, i) => a.kind === 'sawah' ? i : -1).filter(i => i >= 0), forest: A.map((a, i) => a.alpha === 120 && i > 6 ? i : -1).filter(i => i >= 0),
    alun: green[0], lapangan: green[1], proyek: idx([190, 186, 176])[0], dirt: [...idx([200, 180, 150]), ...idx([180, 140, 90]), ...idx([196, 170, 120])], semen: idx([150, 150, 160]), tpu: idx([176, 186, 150]) };
})();
// jalan ke SMA dulu buntu di depan pagar: belokkan ke timur menyusuri pagar sampai ketemu jalan utama
{ const r = KOTA.roads.find(r => Math.hypot(r.pts.at(-1)[0] - 104, r.pts.at(-1)[1] - 64) < 0.5);
  if (r) { const i = r.pts.findIndex(p => p[0] > 99.3 && p[1] < 67.6), zf = x => 66.36 - 0.1404 * (x - 97.3);   // sejajar pagar SMA (posisi dipatok di bawah)
    r.pts = [...r.pts.slice(0, i + 1), [100.1, 66.75], [101, 66.15], [102.2, 65.7], ...[104, 106.5, 109, 111.5, 114, 116.5, 119, 121].map(x => [x, +zf(x).toFixed(2)]), [122.6, 62.75]]; } }
roadTapers(KOTA);
export const REGIONS = ['Perbukitan Utara', 'Perkampungan Kenanga', 'Pusat Kota', 'Kawasan Sekolah', 'Perumahan Bukit Asri', 'Bantaran Kali', 'Selatan'];
const REGION_KEY = ['bukit', 'kampung', 'pusat', 'sekolah', 'perum', 'bantaran', 'selatan'];
const SPECIAL = { '110,54': 'sma', '19,58': 'stasiun', '146,64': 'masjid', '114,98': 'pasar', '178,98': 'plaza', '50,131': 'gudang', '150,158': 'stm', '224,56': 'bram', '84,18': 'menara', '168,44': 'gor', '162,124': 'pabrik', '246,98': 'terminal', '64,164': 'kandang' };

/* ------------------------------------------------------------------ geometri polyline */
function resample(pts, step = 0.25) {
  const out = [];
  for (let i = 1; i < pts.length; i++) {
    const [x0, z0] = pts[i - 1], [x1, z1] = pts[i], l = Math.hypot(x1 - x0, z1 - z0); if (!l) continue;
    const tx = (x1 - x0) / l, tz = (z1 - z0) / l;
    for (let t = out.length ? (out.at(-1).acc - out.at(-1).base) : 0; t < l; t += step) out.push({ x: x0 + tx * t, z: z0 + tz * t, tx, tz, base: 0, acc: 0 });
  }
  let acc = 0; out.forEach((p, i) => { if (i) acc += Math.hypot(p.x - out[i - 1].x, p.z - out[i - 1].z); p.s = acc; });
  return out;
}
function strokePath(g, pts, s) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x * s, y * s) : g.moveTo(x * s, y * s)); }
// sambungan ujung-ke-ujung dua jenis jalan beda lebar: ujung jalan yang lebih lebar menyempit pelan (tanpa ujung bulat)
const TAPER = 3;
function roadTapers(K) {
  for (const A of K.roads) for (const B of K.roads) {
    if (A === B || A.closed || B.closed || A.w <= B.w) continue;
    for (const [ei, e] of [[0, A.pts[0]], [1, A.pts.at(-1)]]) for (const f of [B.pts[0], B.pts.at(-1)]) if (Math.hypot(e[0] - f[0], e[1] - f[1]) < 0.6) (A.taper || (A.taper = {}))[ei] = B.w;
  }
}
function strokeRoad(g, r, s, extra) {
  const t = r.taper, w = r.w + extra;
  if (!t) { strokePath(g, r.pts, s); g.lineWidth = w * s; g.stroke(); return; }
  const P = resample(r.pts, 0.2); P.push({ x: r.pts.at(-1)[0], z: r.pts.at(-1)[1], s: P.at(-1).s + Math.hypot(r.pts.at(-1)[0] - P.at(-1).x, r.pts.at(-1)[1] - P.at(-1).z) });
  const L = P.at(-1).s, a = t[0] !== undefined ? TAPER : 0, b = t[1] !== undefined ? L - TAPER : L;
  const main = P.filter(p => p.s >= a && p.s <= b).map(p => [p.x, p.z]);
  if (main.length > 1) { strokePath(g, main, s); g.lineWidth = w * s; g.stroke(); }
  for (let i = 1; i < P.length; i++) {
    const p = P[i - 1], q = P[i]; let k, wn;
    if (t[0] !== undefined && p.s < a) { k = q.s / TAPER; wn = t[0]; } else if (t[1] !== undefined && q.s > b) { k = (L - p.s) / TAPER; wn = t[1]; } else continue;
    k = Math.min(1, k); k = k * k * (3 - 2 * k);
    g.lineCap = 'butt'; g.beginPath(); g.moveTo(p.x * s, p.z * s); g.lineTo(q.x * s, q.z * s); g.lineWidth = (wn + extra + (w - wn) * k) * s; g.stroke(); g.lineCap = 'round';
  }
}
const nearTaper = (r, sAlong, L) => r.taper && ((r.taper[0] !== undefined && sAlong < TAPER + 0.3) || (r.taper[1] !== undefined && sAlong > L - TAPER - 0.3));
function strokeOffset(g, pts, off, s) {   // garis sejajar polyline, bergeser off petak ke kiri
  g.beginPath();
  pts.forEach(([x, y], i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l;
    i ? g.lineTo((x + nx * off) * s, (y + ny * off) * s) : g.moveTo((x + nx * off) * s, (y + ny * off) * s);
  });
}

/* ------------------------------------------------------------------ mask jalan & air */
function masks(K) {
  const res = 4, [W, H] = K.size, cv = document.createElement('canvas'); cv.width = W * res; cv.height = H * res;
  const g = cv.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height); g.lineCap = g.lineJoin = 'round';
  g.fillStyle = '#00f'; for (const i of AREA.water) { strokePath(g, K.areas[i].pts, res); g.closePath(); g.fill(); }
  for (const r of K.rivers) { strokePath(g, r.pts, res); g.strokeStyle = '#00f'; g.lineWidth = r.w * res; g.stroke(); }
  const waterOnly = g.getImageData(0, 0, cv.width, cv.height).data;
  for (const r of K.roads) { strokePath(g, r.pts, res); g.strokeStyle = '#f00'; g.lineWidth = (r.w + 0.4) * res; g.stroke(); }
  for (const r of K.rails) { strokePath(g, r.pts, res); g.strokeStyle = '#0f0'; g.lineWidth = 2.6 * res; g.stroke(); }
  const d = g.getImageData(0, 0, cv.width, cv.height).data;
  const n = cv.width * cv.height, block = new Uint8Array(n), road = new Uint8Array(n), water = new Uint8Array(n), rail = new Uint8Array(n);
  for (let i = 0; i < n; i++) { road[i] = d[i * 4] > 128 ? 1 : 0; rail[i] = d[i * 4 + 1] > 128 ? 1 : 0; water[i] = waterOnly[i * 4 + 2] > 128 ? 1 : 0; block[i] = water[i] && !road[i] ? 1 : 0; }
  const at = (arr, x, z) => { const i = Math.floor(x * res), j = Math.floor(z * res); return i >= 0 && j >= 0 && i < cv.width && j < cv.height ? arr[j * cv.width + i] : 1; };
  // jarak ke tepi permukaan jalan (negatif = di atas aspal/paving jalan), lewat grid segmen 8 petak
  const SG = new Map(), cell = 8;
  for (const r of K.roads) for (let i = 1; i < r.pts.length; i++) {
    const [ax, az] = r.pts[i - 1], [bx, bz] = r.pts[i], hw = r.w / 2, seg = { ax, az, bx, bz, hw };
    for (let gx = Math.floor((Math.min(ax, bx) - hw - 2) / cell); gx <= Math.floor((Math.max(ax, bx) + hw + 2) / cell); gx++)
      for (let gz = Math.floor((Math.min(az, bz) - hw - 2) / cell); gz <= Math.floor((Math.max(az, bz) + hw + 2) / cell); gz++) { const k = gx * 4096 + gz; (SG.get(k) || SG.set(k, []).get(k)).push(seg); }
  }
  const roadDist = (x, z) => {
    let best = 9; const a = SG.get(Math.floor(x / cell) * 4096 + Math.floor(z / cell)); if (!a) return best;
    for (const q of a) { const dx = q.bx - q.ax, dz = q.bz - q.az, l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - q.ax) * dx + (z - q.az) * dz) / l2)); best = Math.min(best, Math.hypot(x - q.ax - dx * t, z - q.az - dz * t) - q.hw); }
    return best;
  };
  return { roadDist, block: { ox: 0, oz: 0, res, w: cv.width, h: cv.height, data: block }, roadAt: (x, z) => at(road, x, z), waterAt: (x, z) => at(water, x, z), railAt: (x, z) => at(rail, x, z) };
}

/* ------------------------------------------------------------------ penataan rumah */
class Occ {   // grid isi 0.5 petak
  constructor(W, H) { this.r = 2; this.w = W * 2; this.h = H * 2; this.a = new Uint8Array(this.w * this.h); }
  rect(xf, lx, lz, sx, sz, fn) {
    const c = Math.cos(xf.a), s = Math.sin(xf.a);
    for (let u = -sx / 2; u <= sx / 2 + 1e-6; u += 0.35) for (let v = -sz / 2; v <= sz / 2 + 1e-6; v += 0.35) {
      const x = xf.x + (lx + u) * c - (lz + v) * s, z = xf.z + (lx + u) * s + (lz + v) * c;
      if (fn(x, z) === false) return false;
    }
    return true;
  }
  get(x, z) { const i = Math.floor(x * 2), j = Math.floor(z * 2); return i < 0 || j < 0 || i >= this.w || j >= this.h ? 1 : this.a[j * this.w + i]; }
  set(x, z) { const i = Math.floor(x * 2), j = Math.floor(z * 2); if (i >= 0 && j >= 0 && i < this.w && j < this.h) this.a[j * this.w + i] = 1; }
}
// ukuran tapak per tipe (w = lebar menghadap jalan, d = dalam), setback = halaman depan, gap = jarak ke tetangga
const TYPES = {
  K1: { w: 3, d: 4, setback: 0.6, gap: 0.3 }, K2: { w: 4, d: 5, setback: 0.3, gap: 0.4 }, K3: { w: 4.9, d: 4, setback: 0.7, gap: 0.3 },
  K4: { w: 5, d: 5, setback: 0.4, gap: 0.4 }, K5: { w: 4, d: 4.4, setback: 0.4, gap: 0.3 }, K6: { w: 2.6, d: 5, setback: 0.5, gap: 0.2 },
  B: { w: 2.9, d: 3, setback: 0.4, gap: 0.6 },
  P1: { w: 6, d: 7, setback: 3.2, gap: 1.0, yard: true }, P2: { w: 7, d: 7, setback: 3.6, gap: 1.0, yard: true }, P3: { w: 7, d: 6, setback: 3.4, gap: 1.0, yard: true }, P4: { w: 8, d: 8, setback: 3.0, gap: 1.0, yard: true },
  R1: { w: 3, d: 5, setback: 1.6, gap: 0 }, R2: { w: 3.5, d: 6, setback: 1.6, gap: 0 }, R3: { w: 6, d: 5, setback: 1.6, gap: 0 },
  R4: { w: 4, d: 6, setback: 1.6, gap: 0 }, R5: { w: 3.2, d: 6, setback: 1.4, gap: 0 }, R6: { w: 7, d: 7, setback: 2.6, gap: 0.3 }, R7: { w: 3, d: 3.5, setback: 1.4, gap: 0.1 },
  MM: { w: 6.5, d: 6, setback: 5, gap: 0.3 }, PK: { w: 8, d: 7, setback: 0.4, gap: 0.3 },
};
// kuota bangunan khusus (minimarket & lahan parkir) supaya tersebar, tidak menumpuk
const QUOTA = { MM: { pusat: 4, kampung: 2 }, PK: { pusat: 4 } }, used = {};
const take = (t, region) => (used[t + region] || 0) < (QUOTA[t][region] || 0) ? t : null;   // dihitung saat benar-benar terpasang (plan)
function chooseType(region, road, r) {
  const big = road.kind === 'raya' || road.kind === 'jalan';
  if (region === 'kampung') {
    if (big && r > 0.9) return take('MM', region) || 'R7';
    if (big && r < 0.12) return 'R7';
    return road.kind === 'raya' ? pick(['K5', 'K2', 'K3', 'K6'], r) : pick(['K1', 'K1', 'K2', 'K2', 'K3', 'K4', 'K5', 'K6', 'K6'], r);
  }
  if (region === 'bantaran') return 'B';
  if (region === 'perum') return road.kind === 'raya' ? null : pick(['P1', 'P2', 'P3', 'P4', 'P1', 'P3'], r);
  if (region === 'pusat') {
    if (road.kind === 'gang') return pick(['K1', 'K2', 'K6', 'K5', 'R7', 'R7', 'R5'], r);
    if (r > 0.84) return take('MM', region) || 'R4';
    if (r > 0.7) return take('PK', region) || 'R1';
    return pick(['R1', 'R1', 'R2', 'R3', 'R4', 'R4', 'R5', 'R7', 'R1', 'R2', 'R6', 'R3'], r / 0.7);
  }
  if (region === 'selatan') return road.kind !== 'raya' && r < 0.45 ? pick(['K1', 'K2', 'K4'], r * 7 % 1) : null;
  return null;
}
// baris belakang pusat kota: di balik ruko yang menghadap jalan dibangun gedung lebih tinggi (hotel, kantor, ruko 3 lantai),
// supaya lahan kosong di tengah blok terisi dan siluet kota lebih padat
function backRows(houses, M, regionAt, occ, reserve) {
  const out = [];
  for (const h of houses) {
    if (h.region !== 'pusat' || h.type[0] !== 'R' || h.back) continue;
    let base = h, depth = h.d;
    for (let row = 0; row < 2; row++) {
      const r = hash(h.seed, 50 + row), type = pick(row ? ['R6', 'R5', 'R2'] : ['R5', 'R4', 'R2', 'R6', 'R4', 'R1'], r), T = TYPES[type];
      const off = depth / 2 + 1.0 + T.d / 2, c = Math.cos(base.xf.a), sn = Math.sin(base.xf.a);
      const xf = { x: base.xf.x + off * sn, z: base.xf.z - off * c, a: base.xf.a };
      const w = Math.min(T.w, base.w + (type === 'R6' ? 3 : 0.5));
      const free = (x, z) => !(occ.get(x, z) || M.roadAt(x, z) || M.waterAt(x, z) || M.railAt(x, z) || reserve(x, z)) && M.roadDist(x, z) > 0.4 && regionAt(x, z) === 'pusat';
      if (!occ.rect(xf, 0, 0, w + 0.2, T.d + 0.2, free)) break;
      occ.rect(xf, 0, 0, w + 0.3, T.d + 0.4, (x, z) => occ.set(x, z));
      const nh = { type, region: 'pusat', xf, w, d: T.d, setback: 0.3, yard: null, road: h.road, seed: Math.floor(r * 1e6), back: true, noHome: true };
      out.push(nh); base = nh; depth = T.d;
    }
  }
  return out;
}
// isi lahan kosong di tengah blok pusat kota: gedung menghadap jalan terdekat (arah turunnya jarak ke jalan),
// tanpa halaman. Membuat kota rapat: kos-kosan, kantor, ruko 3 lantai, rumah petak di gang belakang.
function infill(K, M, regionAt, occ, reserve) {
  const out = [], [W, H] = K.size, cand = [];
  for (let z = 2; z < H - 2; z += 1.5) for (let x = 2; x < W - 2; x += 1.5) {
    if (regionAt(x, z) !== 'pusat' || occ.get(x, z)) continue;
    const rd = M.roadDist(x, z); if (rd < 2.5 || rd > 26) continue;
    cand.push([rd + hash(Math.round(x), Math.round(z)) * 0.5, x, z]);
  }
  cand.sort((a, b) => a[0] - b[0]);
  for (const [, x, z] of cand) {
    if (occ.get(x, z)) continue;
    const e = 0.5, gx = M.roadDist(x + e, z) - M.roadDist(x - e, z), gz = M.roadDist(x, z + e) - M.roadDist(x, z - e), gl = Math.hypot(gx, gz);
    if (gl < 1e-3) continue;
    const a = Math.atan2(gx / gl, -gz / gl);   // depan (+z lokal) menghadap jalan terdekat
    const r = hash(Math.round(x * 3), Math.round(z * 3));
    for (const type of [pick(['R5', 'R6', 'R4', 'R2', 'K6', 'R5', 'K2', 'R1'], r), 'R1', 'K6']) {
      const T = TYPES[type], xf = { x, z, a };
      const free = (px, pz) => !(occ.get(px, pz) || M.roadAt(px, pz) || M.waterAt(px, pz) || M.railAt(px, pz)) && M.roadDist(px, pz) > 0.6 && regionAt(px, pz) === 'pusat';
      if (!occ.rect(xf, 0, 0.3, T.w + 0.6, T.d + 1.2, free) || !occ.rect(xf, 0, 0.3, T.w + 0.6, T.d + 1.2, (px, pz) => !reserve(px, pz))) continue;
      occ.rect(xf, 0, 0.3, T.w + 0.8, T.d + 1.4, (px, pz) => occ.set(px, pz));
      out.push({ type, region: 'pusat', xf, w: T.w, d: T.d, setback: 0.5, yard: null, road: { kind: 'gang' }, seed: Math.floor(r * 1e6), back: true, noHome: true });
      break;
    }
  }
  return out;
}
function plan(K, M, regionAt, occ, reserve) {
  const houses = [];
  const roads = K.roads.map((r, i) => ({ ...r, i })).filter(r => r.kind !== 'setapak' && !r.closed);
  // dua putaran: dulu minimarket & lahan parkir (butuh tapak lebar + parkiran dalam) di jalan besar, baru rumah/ruko biasa
  for (const special of [true, false])
  for (const road of roads) {
    if (special && road.kind !== 'raya' && road.kind !== 'jalan') continue;
    const P = resample(road.pts, 0.25), Lr = P.at(-1)?.s || 0;
    for (const side of [-1, 1]) {
      let s = 1.5 + hash(road.i, side) * 2;
      while (s < Lr - 1.5) {
        const p = P[Math.min(P.length - 1, Math.round(s / 0.25))];
        const nx = -p.tz, nz = p.tx;     // normal kiri
        const probe = [p.x + nx * side * (road.w / 2 + 3), p.z + nz * side * (road.w / 2 + 3)];
        const region = regionAt(...probe), r = hash(road.i * 131 + side, Math.round(s * 4));
        const type0 = special ? (region === 'pusat' || region === 'kampung' ? take('MM', region) || (region === 'pusat' && take('PK', region)) || null : null) : chooseType(region, road, r);
        if (!type0) { s += 2; continue; }
        // pusat kota: bila tipe pilihan tidak muat, coba tipe yang lebih kecil di titik yang sama (deretan ruko rapat)
        const tries = special ? [type0] : region === 'pusat' && road.kind !== 'gang' ? [type0, ...['R4', 'R2', 'R1', 'R7'].filter(t => t !== type0)] : [type0];
        let type, T, xf, fw, fz0, fz1, yb, side_, ok = false;
        for (type of tries) {
          T = TYPES[type];
          // pusat: s = tepi kiri tapak + 1.5, jadi gedung lebar (minimarket, bank) bergeser maju, tidak menimpa tetangga
          const q = region === 'pusat' ? P[Math.min(P.length - 1, Math.max(0, Math.round((s + T.w / 2 - 1.5) / 0.25)))] : p, qx = -q.tz, qz = q.tx;
          const a = Math.atan2(-side * q.tz, -side * q.tx);   // depan (+z lokal) menghadap jalan; rumah lurus sejajar jalan
          const dist = road.w / 2 + 0.35 + T.setback + T.d / 2;
          xf = { x: q.x + qx * side * dist, z: q.z + qz * side * dist, a };
          yb = T.yard ? 1.0 : 0.25; side_ = T.yard ? 1.0 : 0;   // halaman belakang & samping
          fw = T.w + side_ * 2 + 0.2; fz0 = -T.d / 2 - yb; fz1 = T.d / 2 + T.setback;
          ok = regionAt(xf.x, xf.z) === region;
          ok = ok && occ.rect(xf, 0, (fz0 + fz1) / 2, fw, fz1 - fz0 - 0.4, (x, z) => !(occ.get(x, z) || M.roadAt(x, z) || M.waterAt(x, z) || M.railAt(x, z) || reserve(x, z)));
          // jemuran/motor/pagar di samping & belakang rumah juga tidak boleh menyentuh jalan lain
          ok = ok && occ.rect(xf, 0, (fz0 + fz1) / 2 - 0.3, fw + 1.8, fz1 - fz0 - 0.6, (x, z) => M.roadDist(x, z) > 0.1);
          // akses: jalur dari pintu ke jalan harus bebas air
          ok = ok && occ.rect(xf, 0, T.d / 2 + T.setback / 2 + 0.3, 1, T.setback + 0.6, (x, z) => !M.waterAt(x, z));
          if (ok) break;
        }
        if (!ok) { s += special ? 1.5 : 0.75; continue; }
        occ.rect(xf, 0, (fz0 + fz1) / 2, fw + T.gap, fz1 - fz0, (x, z) => occ.set(x, z));
        if (QUOTA[type]) used[type + region] = (used[type + region] || 0) + 1;
        houses.push({ type, region, xf, w: T.w, d: T.d, setback: T.setback, yard: T.yard ? { w: fw, front: T.setback - 0.4, back: yb } : null, road, seed: Math.floor(r * 1e6) });
        s += T.w + T.gap + side_ * 2 + (region === 'selatan' ? 4 : 0) + (special ? 25 : 0);
      }
    }
  }
  return houses;
}

// setiap bangunan harus menghadap ruang terbuka yang tersambung ke jalan: pintu tidak boleh langsung menghadap dinding
// bangunan lain, dan dari depan pintu harus ada jalur bebas bangunan ke jalan. Kalau gagal, bangunan diputar
// (180 derajat dulu, lalu 90 derajat bila tapaknya muat); kalau tetap buntu, bangunan dihapus (lahan jadi kebun).
function fixAccess(houses, specials, M, occ, reserve, W, H) {
  const R = 2, gw = W * R, gh = H * R, B = new Int32Array(gw * gh).fill(-1);
  const cell = (x, z) => { const i = Math.floor(x * R), j = Math.floor(z * R); return i < 0 || j < 0 || i >= gw || j >= gh ? -1 : j * gw + i; };
  const foot = (xf, w, d, fn) => { const c = Math.cos(xf.a), sn = Math.sin(xf.a); for (let u = -w / 2; u <= w / 2 + 1e-6; u += 0.3) for (let v = -d / 2; v <= d / 2 + 1e-6; v += 0.3) fn(xf.x + u * c - v * sn, xf.z + u * sn + v * c); };
  const stamp = (h, id) => foot(h.xf, h.w + 0.1, h.d + 0.1, (x, z) => { const k = cell(x, z); if (k >= 0) B[k] = id; });
  houses.forEach((h, i) => stamp(h, i));
  for (const b of Object.values(specials)) foot({ x: b.x, z: b.y, a: b.a }, b.w, b.h, (x, z) => { const k = cell(x, z); if (k >= 0) B[k] = 1e6; });
  const solid = (x, z, self) => { const k = cell(x, z); return k < 0 || (B[k] >= 0 && B[k] !== self) || M.waterAt(x, z) || M.railAt(x, z); };
  // panjang jalur (petak) dari depan pintu ke jalan, Infinity bila buntu
  const access = (h, id, a) => {
    const xf = { ...h.xf, a }, c = Math.cos(a), sn = Math.sin(a), at = (lx, lz) => [xf.x + lx * c - lz * sn, xf.z + lx * sn + lz * c];
    for (const lz of [0.35, 0.8, 1.3]) for (const lx of [-0.4, 0, 0.4]) { const [x, z] = at(lx, h.d / 2 + lz); if (solid(x, z, id)) return Infinity; }
    const [sx, sz] = at(0, h.d / 2 + 0.6), k0 = cell(sx, sz); if (k0 < 0) return Infinity;
    const seen = new Set([k0]); let q = [k0], depth = 0;
    while (q.length && depth < 70 && seen.size < 6000) {
      const nq = [];
      for (const k of q) {
        const i = k % gw, j = (k - i) / gw, x = (i + 0.5) / R, z = (j + 0.5) / R;
        if (M.roadDist(x, z) < 0.15) return depth / R;
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ni = i + di, nj = j + dj, nk = nj * gw + ni; if (ni < 0 || nj < 0 || ni >= gw || nj >= gh || seen.has(nk)) continue;
          seen.add(nk); if (!solid((ni + 0.5) / R, (nj + 0.5) / R, id)) nq.push(nk);
        }
      }
      q = nq; depth++;
    }
    return Infinity;
  };
  const fits = (h, id, a) => { let ok = true; foot({ ...h.xf, a }, h.w + 0.1, h.d + 0.1, (x, z) => { if (ok && (solid(x, z, id) || M.roadDist(x, z) < 0.1 || reserve(x, z))) ok = false; }); return ok; };
  let turned = 0, removed = 0;
  for (let id = houses.length - 1; id >= 0; id--) {
    const h = houses[id]; if (h.special) continue;
    const a0 = h.xf.a, cur = access(h, id, a0);
    if (cur < 14) continue;
    let best = null;
    for (const da of [Math.PI, Math.PI / 2, -Math.PI / 2]) {
      const a = a0 + da; if (da !== Math.PI && !fits(h, id, a)) continue;
      const l = access(h, id, a); if (l < 14 && (!best || l < best.l)) best = { a, l };
    }
    if (best) { foot(h.xf, h.w + 0.1, h.d + 0.1, (x, z) => { const k = cell(x, z); if (k >= 0 && B[k] === id) B[k] = -1; }); h.xf.a = best.a; h.yard = null; stamp(h, id); occ.rect(h.xf, 0, 0, h.w + 0.3, h.d + 0.3, (x, z) => occ.set(x, z)); turned++; }
    else { foot(h.xf, h.w + 0.1, h.d + 0.1, (x, z) => { const k = cell(x, z); if (k >= 0 && B[k] === id) B[k] = -2; }); h.dead = true; removed++; }
  }
  for (let i = houses.length - 1; i >= 0; i--) if (houses[i].dead) houses.splice(i, 1);
  if (globalThis.__TRACEON) console.log('fixAccess turned', turned, 'removed', removed, 'of', houses.length + removed);
}

/* ------------------------------------------------------------------ cat tanah */
function paintGround(K, houses, M, specials) {
  const [W, H] = K.size, s = PX, cv = document.createElement('canvas'); cv.width = W * s; cv.height = H * s;
  const g = cv.getContext('2d'); makePatterns(g, s / 10);
  g.fillStyle = PAT.grass; g.fillRect(0, 0, cv.width, cv.height);
  g.lineCap = g.lineJoin = 'round';
  // perbukitan (lebih gelap), danau, sawah, alun-alun, lapangan, lahan proyek
  const fillPoly = (pts, style) => { g.fillStyle = style; strokePath(g, pts, s); g.closePath(); g.fill(); };
  fillPoly(K.areas[0].pts, PAT.grassDark);
  K.areas.forEach((a, i) => {
    if (i < 7) return;
    if (a.kind === 'sawah') {
      fillPoly(a.pts, PAT.sawah);
      g.save(); strokePath(g, a.pts, s); g.closePath(); g.clip();
      g.strokeStyle = '#8a7a50'; g.lineWidth = 0.35 * s; const an = a.angle * Math.PI / 180, cx = a.pts[0][0] * s, cy = a.pts[0][1] * s;
      for (let k = -120; k < 120; k += 6) { g.beginPath(); g.moveTo(cx - 900 * Math.cos(an) - k * s * Math.sin(an), cy - 900 * Math.sin(an) + k * s * Math.cos(an)); g.lineTo(cx + 900 * Math.cos(an) - k * s * Math.sin(an), cy + 900 * Math.sin(an) + k * s * Math.cos(an)); g.stroke(); }
      g.restore(); return;
    }
    if (AREA.water.includes(i)) { fillPoly(a.pts, PAT.water); g.strokeStyle = '#7a8a6a'; g.lineWidth = 0.4 * s; g.stroke(); return; }
    if (i === AREA.proyek) { fillPoly(a.pts, PAT.mud); return; }
    if (AREA.forest.includes(i)) { fillPoly(a.pts, PAT.grassDark); return; }
    if (AREA.dirt.includes(i)) { fillPoly(a.pts, PAT.dirt); return; }
    if (AREA.semen.includes(i)) { fillPoly(a.pts, PAT.semen); return; }
    if (AREA.tpu.includes(i)) { fillPoly(a.pts, PAT.grassDark); return; }
    fillPoly(a.pts, PAT.field);
  });
  // alun-alun: jalan melingkar conblock + lapangan; lapangan bola: garis putih
  g.strokeStyle = PAT.paving; g.lineWidth = 1.6 * s; g.beginPath(); g.ellipse(146 * s, 76 * s, 11 * s, 7 * s, 0, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 0.2 * s; g.strokeRect(82.5 * s, 100.5 * s, 11 * s, 7 * s); g.beginPath(); g.moveTo(88 * s, 100.5 * s); g.lineTo(88 * s, 107.5 * s); g.stroke(); g.beginPath(); g.arc(88 * s, 104 * s, 1.2 * s, 0, 7); g.stroke();
  // sungai: tepi lumpur -> air bertekstur
  for (const r of K.rivers) {
    strokePath(g, r.pts, s); g.strokeStyle = '#8a8466'; g.lineWidth = (r.w + 1.6) * s; g.stroke();
    g.strokeStyle = '#6e7a68'; g.lineWidth = (r.w + 0.7) * s; g.stroke();
    g.strokeStyle = '#8a8478'; g.lineWidth = (r.w + 0.05) * s; g.stroke();          // bibir talud batu
    g.strokeStyle = PAT.water; g.lineWidth = (r.w - 0.4) * s; g.stroke();
  }
  // rel: kerikil
  for (const r of K.rails) { strokePath(g, r.pts, s); g.strokeStyle = '#8c8478'; g.lineWidth = 2.4 * s; g.stroke(); g.strokeStyle = 'rgba(60,50,40,0.25)'; g.lineWidth = 1.6 * s; g.stroke(); }
  // halaman & akses tiap rumah
  const quad = (xf, lx, lz, sx, sz, style) => {
    const c = Math.cos(xf.a), sn = Math.sin(xf.a);
    g.save(); g.translate(xf.x * s, xf.z * s); g.rotate(xf.a); g.fillStyle = style;
    g.fillRect((lx - sx / 2) * s, (lz - sz / 2) * s, sx * s, sz * s); g.restore();
  };
  for (const h of houses) {
    const { xf, w, d, setback, type } = h;
    if (h.yard) { quad(h.xf, 0, (d / 2 + setback - 0.4 - d / 2 - h.yard.back) / 2, h.yard.w, d + setback - 0.4 + h.yard.back, PAT.lawn); quad(xf, type === 'P1' ? P1CAR(w, h.yard) : 0, d / 2 + setback / 2, type === 'P1' ? 1.9 : 2.2, setback + 0.8, PAT.paving); }
    else if (type === 'MM' || type === 'PK') {
      // parkiran beraspal + garis putih petak parkir
      const z0 = type === 'PK' ? 0 : d / 2 + setback / 2 + 0.2, L = type === 'PK' ? d + setback + 0.4 : setback + 0.8, W2 = w + 0.4;
      quad(xf, 0, z0, W2, L, PAT.asphaltLight); if (type === 'MM') quad(xf, 0, 0, w + 0.4, d + 0.4, PAT.semen);
      const lines = type === 'PK' ? [[-d / 2 + 1.5, 1.5, 2.4], [d / 2 - 1.6, 0.5, 1.3]] : [[z0 + 0.3, 0.5, 1.3]];
      for (const [lz, step, len] of lines) for (let x = -W2 / 2 + 0.4; x < W2 / 2 - 0.3; x += step) quad(xf, x, lz, 0.05, len, '#e8e8e2');
    }
    else if (type[0] === 'R') quad(xf, 0, d / 2 + setback / 2 + 0.2, w + 0.02, setback + 0.8, h.back ? PAT.semen : PAT.tile);
    else { quad(xf, 0, 0, w + 0.4, d + 0.4, PAT.semen); quad(xf, 0, d / 2 + setback / 2 + 0.2, Math.min(1.4, w * 0.4), setback + 0.8, type === 'B' ? PAT.dirt : PAT.semen); }
  }
  for (const b of Object.values(specials)) { const xf = { x: b.x, z: b.y, a: b.a }; quad(xf, 0, 0, b.w + 3, b.h + 3, typeof b.pave === 'string' ? PAT[b.pave] : b.pave || PAT.paving); }
  // JALAN: selokan (kampung) -> bahu -> permukaan bertekstur -> marka
  for (const r of K.roads) if (r.kind === 'gang' || r.kind === 'jalan') { g.strokeStyle = '#4e5a5a'; strokeRoad(g, r, s, 1.0); g.strokeStyle = '#a8a49a'; strokeRoad(g, r, s, 0.55); }
  for (const r of K.roads) if (r.kind === 'raya') { g.strokeStyle = '#8a8a86'; strokeRoad(g, r, s, 0.7); }
  for (const r of K.roads) if (r.kind === 'setapak') { g.strokeStyle = '#a89068'; strokeRoad(g, r, s, 0.3); }
  const surf = { raya: PAT.asphalt, jalan: PAT.asphaltLight, gang: PAT.conblock, setapak: PAT.dirt };
  for (const kind of ['setapak', 'gang', 'jalan', 'raya']) for (const r of K.roads) if (r.kind === kind) { g.strokeStyle = surf[kind]; strokeRoad(g, r, s, 0); }
  // marka di lapisan sendiri, lalu dihapus di setiap simpang/perpotongan supaya tidak menembus jalan lain
  const mk = document.createElement('canvas'); mk.width = cv.width; mk.height = cv.height;
  const gm = mk.getContext('2d'); gm.lineCap = 'butt'; gm.lineJoin = 'round';
  for (const r of K.roads) {
    if (r.kind === 'raya') {
      gm.strokeStyle = '#ecebe2'; gm.lineWidth = 0.2 * s; for (const o of [-1, 1]) { strokeOffset(gm, r.pts, o * (r.w / 2 - 0.3), s); gm.stroke(); }
      strokePath(gm, r.pts, s); gm.lineWidth = 0.2 * s; gm.setLineDash([1.5 * s, 1.5 * s]); gm.stroke(); gm.setLineDash([]);
    } else if (r.kind === 'jalan') { strokePath(gm, r.pts, s); gm.strokeStyle = 'rgba(240,236,220,0.8)'; gm.lineWidth = 0.15 * s; gm.setLineDash([1 * s, 1.4 * s]); gm.stroke(); gm.setLineDash([]); }
  }
  gm.globalCompositeOperation = 'destination-out'; gm.fillStyle = '#000';
  const hole = (x, z, r) => { gm.beginPath(); gm.arc(x * s, z * s, r * s, 0, Math.PI * 2); gm.fill(); };
  const RD = K.roads.filter(r => r.kind !== 'setapak');
  const nearOn = (B, x, z) => { let best = null; for (let i = 1; i < B.pts.length; i++) { const [ax, az] = B.pts[i - 1], [bx, bz] = B.pts[i], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)), px = ax + dx * t, pz = az + dz * t, d = Math.hypot(x - px, z - pz); if (!best || d < best.d) best = { d, x: px, z: pz }; } return best; };
  for (const A of RD) for (const B of RD) {
    if (A === B) continue;
    for (const e of [A.pts[0], A.pts.at(-1)]) { const n = nearOn(B, e[0], e[1]); if (n.d < B.w / 2 + 1.2) hole(n.x, n.z, Math.max(A.w / 2 + 0.5, B.w / 2 + 0.4)); }
    for (let i = 1; i < A.pts.length; i++) for (let j = 1; j < B.pts.length; j++) {   // perpotongan di tengah ruas
      const [p0, p1] = [A.pts[i - 1], A.pts[i]], [q0, q1] = [B.pts[j - 1], B.pts[j]];
      const d1x = p1[0] - p0[0], d1z = p1[1] - p0[1], d2x = q1[0] - q0[0], d2z = q1[1] - q0[1], den = d1x * d2z - d1z * d2x; if (Math.abs(den) < 1e-6) continue;
      const t = ((q0[0] - p0[0]) * d2z - (q0[1] - p0[1]) * d2x) / den, u = ((q0[0] - p0[0]) * d1z - (q0[1] - p0[1]) * d1x) / den;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) hole(p0[0] + d1x * t, p0[1] + d1z * t, Math.max(A.w, B.w) / 2 + 0.5);
    }
  }
  // jangan ada marka di atas jembatan/air
  for (const r of K.rivers) { strokePath(gm, r.pts, s); gm.lineWidth = (r.w + 0.6) * s; gm.strokeStyle = '#000'; gm.stroke(); }
  g.drawImage(mk, 0, 0);
  // zebra cross di pertigaan dengan jalan raya
  const raya = K.roads.filter(r => r.kind === 'raya' && !r.closed);
  for (const r of K.roads) if (r.kind === 'jalan' || r.kind === 'gang') for (const end of [r.pts[0], r.pts.at(-1)]) {
    let best = null;
    for (const R of raya) for (let i = 1; i < R.pts.length; i++) { const p = R.pts[i], d = Math.hypot(p[0] - end[0], p[1] - end[1]); if (d < 3.2 && (!best || d < best.d)) best = { d, p, q: R.pts[i - 1], w: R.w }; }
    if (!best) continue;
    const tx = best.p[0] - best.q[0], tz = best.p[1] - best.q[1], l = Math.hypot(tx, tz), ux = tx / l, uz = tz / l;
    const off = r.w / 2 + 1.3, cx = best.p[0] + ux * off, cz = best.p[1] + uz * off;
    g.save(); g.translate(cx * s, cz * s); g.rotate(Math.atan2(uz, ux)); g.fillStyle = 'rgba(245,245,238,0.92)';
    for (let k = -best.w / 2 + 0.3; k < best.w / 2 - 0.3; k += 0.6) g.fillRect(-0.6 * s, k * s, 1.2 * s, 0.32 * s);
    g.restore();
  }
  return cv;
}

/* ------------------------------------------------------------------ bangun kota */
export function buildKota(scene, C) {
  const K = KOTA, M = masks(K), [W, H] = K.size;
  C.mask(M.block);
  const regionAt = (x, z) => { for (let i = 1; i <= 6; i++) if (inPoly(x, z, K.areas[i].pts)) return REGION_KEY[i]; return z < 34 ? 'bukit' : null; };
  const specials = {};
  for (const b of K.bldgs) { const sp = b.kolam ? 'kolam' : SPECIAL[Math.round(b.x) + ',' + Math.round(b.y)]; if (sp) specials[sp] = { ...b }; }
  if (specials.kandang) specials.kandang.pave = 'dirt';
  // geser bangunan kunci sedikit kalau tapaknya (plus pelataran 1 petak) menyentuh permukaan jalan
  const clearOf = (b, x, y) => { const c = Math.cos(b.a), sn = Math.sin(b.a); for (let u = -b.w / 2 - 1; u <= b.w / 2 + 1; u += 0.5) for (let v = -b.h / 2 - 1; v <= b.h / 2 + 1; v += 0.5) if (M.roadDist(x + u * c - v * sn, y + u * sn + v * c) < 0.15) return false; return true; };
  const PIN = { sma: [-5, 0] };   // SMA dipatok: jalan depan sekolah dirutekan menyusuri pagarnya
  for (const [name, b] of Object.entries(specials)) {
    if (PIN[name]) { [b.dx, b.dy] = PIN[name]; b.x += b.dx; b.y += b.dy; continue; }
    if (clearOf(b, b.x, b.y)) continue;
    let best = null;
    for (let r = 0.5; r <= 8 && !best; r += 0.5) for (let k = 0; k < 16; k++) { const t = k / 16 * Math.PI * 2, x = b.x + Math.cos(t) * r, y = b.y + Math.sin(t) * r; if (clearOf(b, x, y)) { best = [x, y]; break; } }
    if (best) { b.dx = best[0] - b.x; b.dy = best[1] - b.y; b.x = best[0]; b.y = best[1]; }
    if (globalThis.__TRACEON) console.log('special', name, best ? 'moved ' + b.dx.toFixed(2) + ',' + b.dy.toFixed(2) : 'STUCK');
  }
  // area cadangan (tidak boleh ada rumah): bangunan penting + pelatarannya, alun-alun, lapangan, taman basket, lahan proyek
  const resv = [];
  for (const b of Object.values(specials)) resv.push(p => { const c = Math.cos(-b.a), sn = Math.sin(-b.a), dx = p[0] - b.x, dz = p[1] - b.y; return Math.abs(dx * c - dz * sn) < b.w / 2 + 2.5 && Math.abs(dx * sn + dz * c) < b.h / 2 + 2.5; });
  resv.push(p => ((p[0] - 146) / 12.5) ** 2 + ((p[1] - 76) / 8.5) ** 2 < 1, p => ((p[0] - 88) / 8) ** 2 + ((p[1] - 104) / 5.5) ** 2 < 1);
  resv.push(p => p[0] > 121.5 && p[0] < 133 && p[1] > 40.5 && p[1] < 51.5, p => [AREA.proyek, ...AREA.sawah, ...AREA.water.slice(1), ...AREA.dirt, ...AREA.semen, ...AREA.tpu].some(i => inPoly(p[0], p[1], K.areas[i].pts)));
  resv.push(p => p[0] > 104 + (specials.pasar?.dx || 0) && p[0] < 124 + (specials.pasar?.dx || 0) && p[1] > 102 && p[1] < 110);   // terminal angkot
  const reserve = (x, z) => resv.some(f => f([x, z]));
  const occ = new Occ(W, H);
  // wilayah bangun: lahan tak bertuan di sekitar pusat kota (poligon pusat diperbesar 1.9x) ikut dihitung pusat,
  // supaya pinggiran kota terisi ruko/gedung, bukan lapangan rumput kosong
  const PC = K.areas[2].pts, pcx = PC.reduce((a, p) => a + p[0], 0) / PC.length, pcz = PC.reduce((a, p) => a + p[1], 0) / PC.length;
  const regionB = (x, z) => { const r = regionAt(x, z); return r || !inPoly(pcx + (x - pcx) / 1.9, pcz + (z - pcz) / 1.9, PC) ? r : 'pusat'; };
  const houses = plan(K, M, regionB, occ, reserve);
  for (const h of houses) if (h.type === 'MM' || h.type === 'PK') h.noHome = true;
  houses.push(...backRows(houses, M, regionB, occ, reserve));
  houses.push(...infill(K, M, regionB, occ, reserve));
  // rumah kunci: Om Darto + gerobak Warkop Simpang (lv1) = rumah kampung terdekat ke penanda no. 3, musala kampung
  const kh = houses.filter(h => h.region === 'kampung');
  const near = (x, z) => kh.slice().sort((a, b) => Math.hypot(a.xf.x - x, a.xf.z - z) - Math.hypot(b.xf.x - x, b.xf.z - z));
  const darto = near(46, 86).find(h => h.w >= 4 && h.road.kind !== 'raya') || near(46, 86).find(h => h.w >= 4); if (darto) {
    darto.type = 'K2'; darto.special = 'darto';
    // gerobak warkop berdiri sendiri di samping rumah (bukan di teras): pilih sisi yang paling sedikit menggusur tetangga
    const inH = (h, x, z, pad) => { const c = Math.cos(-h.xf.a), sn = Math.sin(-h.xf.a), dx = x - h.xf.x, dz = z - h.xf.z; return Math.abs(dx * c - dz * sn) < h.w / 2 + pad && Math.abs(dx * sn + dz * c) < h.d / 2 + pad; };
    const spot = sd => { const lx = sd > 0 ? 3.75 : -3.25, lz = 1.6; const pts = [-0.9, 0, 0.9].flatMap(u => [-0.7, 0, 0.7].map(v => L(darto.xf, lx + u, lz + v))); return { lx, lz, pts, hit: houses.filter(h => h !== darto && pts.some(([x, z]) => inH(h, x, z, 0.2))), road: pts.some(([x, z]) => M.roadDist(x, z) < 0.1) }; };
    const best = [spot(-1), spot(1)].filter(o => !o.road).sort((a, b) => a.hit.length - b.hit.length)[0] || spot(1);
    for (const h of best.hit) houses.splice(houses.indexOf(h), 1);
    darto.cart = { lx: best.lx, lz: best.lz };
    for (const [x, z] of best.pts) occ.set(x, z);
  }
  const musala = near(30, 100).find(h => h !== darto && h.w >= 4); if (musala) musala.special = 'musala';
  fixAccess(houses, specials, M, occ, reserve, W, H);

  // tanah
  // tanah dipotong jadi beberapa tekstur <= 2048 px (batas aman GPU HP), tiap potong satu bidang
  const gcv = paintGround(K, houses, M, specials), TS = 2048 / PX;
  for (let tx = 0; tx < W; tx += TS) for (let tz = 0; tz < H; tz += TS) {
    const tw = Math.min(TS, W - tx), th = Math.min(TS, H - tz), c = document.createElement('canvas');
    c.width = tw * PX; c.height = th * PX; const cg = c.getContext('2d'); cg.drawImage(gcv, -tx * PX, -tz * PX);
    waterHoles(cg, K, tx, tz, c.width, c.height);   // sungai & danau dilubangi: airnya ada di bawah permukaan tanah
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = 4;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(tw, th), groundDetail(new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5 })));
    ground.rotation.x = -Math.PI / 2; ground.position.set(tx + tw / 2, 0, tz + th / 2); ground.receiveShadow = true; scene.add(ground);
  }
  const tex = { image: gcv };
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(900, 700), new THREE.MeshLambertMaterial({ color: new THREE.Color('#9cbc78') }));
  outer.rotation.x = -Math.PI / 2; outer.position.set(W / 2, -2.0, H / 2); scene.add(outer);
  C.box(W / 2, -1, W / 2 + 2, 1); C.box(W / 2, H + 1, W / 2 + 2, 1); C.box(-1, H / 2, 1, H / 2 + 2); C.box(W + 1, H / 2, 1, H / 2 + 2);

  const ch = new Chunks(32), veg = [], SB = new SignBatch(), parkir = [];
  // rumah
  globalThis.__TRACE = globalThis.__TRACEON ? [] : null;
  for (const h of houses) {
    const m = ch.at(h.xf.x, h.xf.z), r = k => hash(h.seed, k);
    const o = { seed: h.seed, veg, C, w: h.w, d: h.d, yard: h.yard };
    if (h.special === 'darto') { kampung(m, h.xf, 'K2', { ...o, wall: '#b8d0a8', roof: '#a8523a', accent: '#7a4a2a', darto: true }); gerobak(m, h.xf, C, h.cart); continue; }
    if (h.special === 'musala') { musalaKampung(m, h.xf, C); continue; }
    if (h.region === 'bantaran') panggung(m, h.xf, { ...o, wall: pick(PAL.bantaran.wall, r(1)), roof: pick(PAL.bantaran.roof, r(2)) });
    else if (h.type[0] === 'K') kampung(m, h.xf, h.type, { ...o, wall: pick(PAL.kampung.wall, r(1)), roof: pick(PAL.kampung.roof, r(2)), accent: pick(PAL.kampung.accent, r(3)) });
    else if (/^P\d/.test(h.type)) perum(m, h.xf, h.type, { ...o, wall: pick(PAL.perum.wall, r(1)), roof: pick(PAL.perum.roof, r(2)) });
    else {
      const liar = !h.back && h.region === 'pusat' && /^R[1-4]$/.test(h.type) && r(60) < 0.55;
      const ro = { ...o, wall: pick(PAL.ruko.wall, r(1)), canopy: pick(PAL.ruko.canopy, r(3)), setback: h.setback, liar };
      if (h.type === 'MM') parkir.push(minimarket(m, SB, h.xf, ro));
      else if (h.type === 'PK') parkir.push(lahanParkir(m, SB, h.xf, ro));
      else if (h.type === 'R5') hotelKos(m, SB, h.xf, ro);
      else if (h.type === 'R6') kantor(m, SB, h.xf, ro);
      else if (h.type === 'R7') warung(m, SB, h.xf, ro);
      else rukoShop(m, SB, h.xf, h.type, ro);
      // parkir liar di depan ruko pinggir jalan: motor berjajar di teras/trotoar, dijaga tukang parkir
      if (liar) {
        const n = Math.max(2, Math.floor((h.w - 0.4) / 0.5) - Math.floor(r(61) * 2));
        parkedMotors(m, h.xf, 0, h.d / 2 + 0.85, n, 0.5, Math.PI);
        if (r(62) < 0.7) { const c = Math.cos(h.xf.a), sn = Math.sin(h.xf.a), lz = h.d / 2 + h.setback - 0.05; parkir.push({ x: h.xf.x - lz * sn, z: h.xf.z + lz * c, a: h.xf.a, len: Math.max(1, h.w - 0.6), liar: true }); }
      }
    }
  }
  const thin = new Chunks(32);   // tiang & kabel: bayangannya jadi garis pecah-pecah di tanah, jadi tidak membuat bayangan
  specialBuildings(ch, specials, C, veg, M);
  const places = buildPlaces({ ch, thin, K, M, C, veg, SB, S: specials, occ, waterMat, BED, SURF });
  if (places.wetMesh) scene.add(places.wetMesh);
  streetStuff(ch, K, M, C, veg, regionAt, occ, houses, thin);
  const portal = perumGate(ch, K, M, C, occ, SB, scene);
  if (globalThis.__TRACE) { globalThis.__BOXES = globalThis.__TRACE; globalThis.__ROAD = globalThis.__TRACE.filter(t => t.p.some(([x, , z]) => M.roadDist(x, z) < -0.12 && !M.waterAt(x, z) && x > 0 && z > 0 && x < W && z < H)); globalThis.__TRACE = null; }
  for (const m of ch.meshes(MAT.world)) scene.add(m);
  for (const m of thin.meshes(MAT.world, { cast: false })) { m.userData.thin = true; scene.add(m); }
  const signs = SB.build(scene);
  const water = riverMesh(K); scene.add(water); scene.add(waterBanks(K, M));
  // tanaman
  vegetation(K, M, occ, regionAt, veg, reserve, C);
  { // pohon besar: batang & tajuk tidak boleh menjorok ke badan jalan (kendaraan lewat di bawahnya)
    const R = { bulat: 0.95, ketapang: 1.1, cemara: 0.7, kelapa: 0.5, pisang: 0.55, bambu: 0.45 };
    for (let i = veg.length - 1; i >= 0; i--) { const v = veg[i], r = R[v.k]; if (r && M.roadDist(v.x, v.z) < r * (v.s || 1) * 0.8) veg.splice(i, 1); } }
  if (globalThis.__TRACEON) globalThis.__VEGROAD = veg.filter(v => M.roadDist(v.x, v.z) < 0.1).map(v => v.k);
  plant(scene, veg);
  const traffic = buildTraffic(scene, K, C, M);
  return {
    traffic, signs, parkir, portal, posSatpam: portal?.pos, M, places, specials,
    regionAt: (x, z) => { const r = regionAt(x, z); return r ? REGIONS[REGION_KEY.indexOf(r)] : 'Wirabumi'; },
    regionKey: regionAt, labels: K.labels,
    marks: K.marks.map(m => ({ ...m, name: m.desc.replace(/\s*\(.*$/, '') })),
    houses, darto, groundTex: tex.image, water, smaShift: { x: specials.sma?.dx || 0, z: specials.sma?.dy || 0 },
  };
}

/* ------------------------------------------------------------------ bangunan kunci */
function gerobak(m, hxf, C, at) {   // Warkop Simpang lv1: gerobak kayu kuning "KOPI" di samping rumah Om Darto
  const [x, z] = L(hxf, at.lx, at.lz), xf = { x, z, a: hxf.a };
  m.box(xf, 0, 0.3, 0, 1.3, 0.75, 0.8, col('#e8c060')); m.box(xf, 0, 1.05, 0, 1.4, 0.06, 0.9, col('#c8a040'));
  for (const s of [-1, 1]) m.box(xf, s * 0.55, 0, 0.2, 0.1, 0.4, 0.4, col('#3a3a3e'));
  m.box(xf, 0, 0.55, 0.41, 0.8, 0.22, 0.02, col('#d23a3a'));
  for (const s of [-0.62, 0.62]) m.box(xf, s, 1.05, -0.35, 0.06, 0.9, 0.06, col('#8a6a3a'));
  m.box(xf, 0, 1.95, -0.1, 1.5, 0.05, 1.0, col('#e0782a'));
  m.box(xf, -0.35, 1.11, 0, 0.18, 0.35, 0.18, col('#c83a3a')); m.box(xf, 0.3, 1.11, 0, 0.25, 0.3, 0.25, col('#e8e4d0'));   // termos & toples
  for (const s of [-1, 1]) { const [sx, sz] = L(xf, s * 0.9, 0.9); m.box({ x: sx, z: sz, a: 0 }, 0, 0, 0, 0.36, 0.4, 0.36, col('#d23a3a')); }
  colLocal(C, xf, 0, 0, 1.4, 0.9);
}
function musalaKampung(m, xf, C) {
  const w = 5, d = 5, wall = col('#f2f0e8');
  m.box(xf, 0, 0, -0.3, w + 0.4, 0.2, d + 0.4, col('#c8c4b8'));
  m.box(xf, 0, 0.2, -0.3, w, FLOOR, d, wall); m.box(xf, 0, 0.2, -0.3, w + 0.02, 0.45, d + 0.02, col('#3a8a6a'));
  facade(m, { ...xf, y: 0.2 }, w, d, 0, 1, { door: true, doorC: col('#3a8a6a'), ww: 0.5, spacing: 1.2 });
  m.hip({ ...xf, y: 0.2 }, 0, FLOOR, -0.3, w, d, 1.4, col('#3a7a5a'));
  m.dome({ ...xf, y: 0.2 }, 0, FLOOR + 1.3, -0.3, 0.7, col('#3a8a6a'), 4);
  m.box(xf, w / 2 + 0.5, 0, 1, 0.12, 3.4, 0.12, col('#7a7a80')); m.box(xf, w / 2 + 0.5, 3.2, 1, 0.3, 0.3, 0.3, col('#d8d8d8'));   // speaker corong
  m.box(xf, -1.6, 0.2, d / 2 + 0.1, 0.7, 0.7, 0.7, col('#8a5a34'));   // beduk
  colLocal(C, xf, 0, -0.3, w + 0.4, d + 0.4);
}

function specialBuildings(ch, S, C, veg, M) {
  const clear = (x, z, r) => M.roadDist(x, z) > r;
  const add = (b, fn) => { if (!b) return; const m = ch.at(b.x, b.y); fn(m, { x: b.x, z: b.y, a: b.a }, b); };
  const cl = (xf, lx, lz, sx, sz) => colLocal(C, xf, lx, lz, sx, sz);
  const V = (xf, k, lx, lz, e = {}) => { const [x, z] = L(xf, lx, lz); veg.push({ k, x, z, a: xf.a, ...e }); };
  const cream = col('#ecdcb4'), redRoof = col('#a84a32'), white = col('#f2f0e8');
  add(S.sma, (m, xf, b) => {   // SMA 3 dari luar: gedung 2 lantai, pagar & gerbang hijau di sisi selatan
    m.box(xf, 0, 0, -1, b.w, 2 * FLOOR, b.h - 2, cream);
    facade(m, { ...xf, z: xf.z }, b.w, b.h - 2, 0, 2, { door: true, doorC: col('#7a4a2a'), spacing: 1.4 });
    m.box(xf, 0, 0, b.h / 2 - 1.1, b.w, 0.15, 2.2, col('#c8c0a8'));
    for (let u = -b.w / 2 + 0.2; u <= b.w / 2; u += 3) m.box(xf, u, 0.15, b.h / 2 - 0.15, 0.22, 2 * FLOOR - 0.15, 0.22, FRAME);
    m.box(xf, 0, FLOOR - 0.12, b.h / 2 - 1.1, b.w, 0.14, 2.2, col('#d8d0b8')); m.box(xf, 0, FLOOR, b.h / 2 - 0.05, b.w, 0.55, 0.08, FRAME);
    m.gable(xf, 0, 2 * FLOOR, 0, b.w, b.h, 2.4, redRoof, 0.35, cream);
    m.box(xf, 0, 2 * FLOOR - 0.65, b.h / 2 + 0.36, 5, 0.5, 0.1, col('#2f6a4a')); m.box(xf, 0, 2 * FLOOR - 0.55, b.h / 2 + 0.42, 4.2, 0.18, 0.05, col('#e0b84a'));
    const gz = b.h / 2 + 2.6;
    for (const s of [-1, 1]) { m.box(xf, s * 4.5, 0, gz, 0.8, 2.0, 0.8, col('#b06a4a')); cl(xf, s * 4.5, gz, 0.8, 0.8); m.box(xf, s * (4.9 + (b.w / 2 - 4.9) / 2), 0, gz, b.w / 2 - 4.9, 1.1, 0.12, col('#2f5a3a')); cl(xf, s * (4.9 + (b.w / 2 - 4.9) / 2), gz, b.w / 2 - 4.9, 0.15); }
    m.box(xf, 0, 2.0, gz, 9.8, 0.5, 0.2, col('#2f6a4a'));
    for (const s of [-1, 1]) { m.box(xf, s * b.w / 2, 0, gz / 2 - 1, 0.12, 1.1, gz + 0.5, col('#2f5a3a')); cl(xf, s * b.w / 2, gz / 2 - 1, 0.15, gz + 0.5); }
    cl(xf, 0, -1, b.w, b.h - 2);
    for (const s of [-1, 1]) V(xf, 'bulat', s * 6.5, b.h / 2 + 1.2, { s: 0.7 });
  });
  add(S.stasiun, (m, xf, b) => {
    m.box(xf, 0, 0, 0, b.w, 1.5 * FLOOR, b.h, col('#e8e4da')); m.box(xf, 0, 0, 0, b.w + 0.02, 0.5, b.h + 0.02, col('#8a8478'));
    facade(m, xf, b.w, b.h, 0, 1, { door: true, doorC: col('#2a5a8a'), ww: 0.8 }); facade(m, xf, b.w, b.h, 1, 1, { ww: 0.8 });
    m.gable(xf, 0, 1.5 * FLOOR, 0, b.w, b.h, 1.6, col('#5a7aa8'), 0.5, col('#e8e4da'));
    m.box(xf, 0, 1.5 * FLOOR + 1.2, b.h / 2 + 0.2, 0.9, 0.9, 0.1, FRAME);   // jam
    // peron sejajar rel di seberang rel (sisi timur rapat dengan gang), dihubungkan jalur penyeberangan dari pintu samping
    const c = Math.cos(xf.a), sn = Math.sin(xf.a), loc = ([x, z]) => [(x - xf.x) * c + (z - xf.z) * sn, -(x - xf.x) * sn + (z - xf.z) * c];
    let rl = null; for (const r of KOTA.rails) for (const q of r.pts) { const [u, v] = loc(q); if (Math.abs(v) < 8 && u < 0 && (!rl || Math.abs(v) < Math.abs(rl[1]))) rl = [u, v]; }
    const ru = rl ? rl[0] : -b.w / 2 - 5, pw = 2.4, pu = ru - 1.45 - pw / 2;   // tepi peron 0.25 dari bantalan
    let z0 = -6, z1 = 6; const ok = v => [pu - pw / 2, pu, pu + pw / 2].every(u => { const [x, z] = L(xf, u, v); return M.roadDist(x, z) > 0.2 && !M.waterAt(x, z); });
    while (z0 < -1 && !ok(z0)) z0 += 0.5; while (z1 > 1 && !ok(z1)) z1 -= 0.5;
    const Lp = z1 - z0, zc = (z0 + z1) / 2, np = Math.max(2, Math.floor(Lp / 2.4));
    m.box(xf, pu, 0, zc, pw, 0.35, Lp, col('#b8b0a0')); m.box(xf, pu + pw / 2 - 0.12, 0.35, zc, 0.22, 0.01, Lp, col('#e8d040'));   // garis kuning tepi peron
    for (let i = 0; i < np; i++) { const v = z0 + 1 + i * (Lp - 2) / (np - 1); m.box(xf, pu - 0.5, 0.35, v, 0.15, 1.85, 0.15, col('#4a4a50')); cl(xf, pu - 0.5, v, 0.2, 0.2); }
    m.box(xf, pu - 0.1, 2.2, zc, pw + 0.4, 0.1, Lp, col('#5a7aa8'));
    m.box(xf, pu - 0.3, 0.35, zc, 1.4, 0.4, 0.4, col('#7a5a3a')); m.box(xf, pu - 0.3, 0.75, zc - 0.18, 1.4, 0.4, 0.06, col('#7a5a3a'));   // bangku
    cl(xf, pu, zc, pw, Lp);
    // jalur penyeberangan: lantai paving tipis dari pintu samping sampai peron (rel tetap di atasnya)
    const wu0 = pu + pw / 2, wu1 = -b.w / 2; m.box(xf, (wu0 + wu1) / 2, 0, 0, wu1 - wu0, 0.03, 1.4, col('#a8a090'));
    cl(xf, 0, 0, b.w, b.h);
  });
  add(S.masjid, (m, xf, b) => {
    m.box(xf, 0, 0, 0, b.w + 3, 0.12, b.h + 3, col('#e6e2d8'));   // pelataran keramik
    m.box(xf, 0, 0.12, 0, b.w, 1.4 * FLOOR, b.h, white); m.box(xf, 0, 0.12, 0, b.w + 0.02, 0.4, b.h + 0.02, col('#3a9a8a'));
    for (const sd of [0, 2, 3]) facade(m, { ...xf, y: 0.12 }, b.w, b.h, sd, 1, sd ? { ww: 0.5, spacing: 1.2 } : { door: true, doorC: col('#3a9a8a'), ww: 0.5, spacing: 1.2 });
    m.box(xf, 0, 1.4 * FLOOR + 0.12, 0, b.w, 0.2, b.h, shade(white, 0.92));
    m.dome(xf, 0, 1.4 * FLOOR + 0.32, 0, 2.2, col('#3a9a8a'), 6); m.box(xf, 0, 1.4 * FLOOR + 2.5, 0, 0.15, 0.6, 0.15, col('#e0b84a'));
    m.box(xf, b.w / 2 + 0.9, 0, -b.h / 2 + 0.8, 1, 9, 1, white); m.box(xf, b.w / 2 + 0.9, 7.2, -b.h / 2 + 0.8, 1.3, 0.25, 1.3, shade(white, 0.85));
    m.dome(xf, b.w / 2 + 0.9, 9, -b.h / 2 + 0.8, 0.6, col('#3a9a8a'), 3);
    m.box(xf, -b.w / 2 + 1, 0.12, b.h / 2 + 0.8, 0.9, 0.9, 0.9, col('#8a5a34'));   // beduk
    cl(xf, 0, 0, b.w, b.h); cl(xf, b.w / 2 + 0.9, -b.h / 2 + 0.8, 1, 1);
  });
  add(S.pasar, (m, xf, b) => {
    const tin = col('#9aa0a6');
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { m.box(xf, -b.w / 2 + 0.3 + i * (b.w - 0.6) / 5, 0, s * (b.h / 2 - 0.3), 0.3, 2.6, 0.3, col('#c8c2b8')); cl(xf, -b.w / 2 + 0.3 + i * (b.w - 0.6) / 5, s * (b.h / 2 - 0.3), 0.3, 0.3); }
    m.box(xf, 0, 0, 0, b.w - 0.6, 0.1, b.h - 0.6, col('#7a7670'));
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) { const x = -b.w / 2 + 1.6 + i * (b.w - 3.2) / 3, z = r ? 1.4 : -1.4, cc = col(pick(['#c8503a', '#3a7ac0', '#3a9a6a', '#e8c040'], hash(i, r + 3)));
      m.box(xf, x, 0, z, 2, 0.8, 1.2, col('#a8885a')); m.box(xf, x, 0.8, z, 1.8, 0.25, 1, col(pick(['#6ab84a', '#e85a3a', '#f0d040', '#c86aa8'], hash(i, r + 7)))); m.box(xf, x, 1.8, z, 2.2, 0.05, 1.5, cc); cl(xf, x, z, 2, 1.2); }
    m.gable(xf, 0, 2.6, 0, b.w, b.h, 1.2, tin, 0.4, tin); m.gable(xf, 0, 3.7, 0, b.w * 0.6, b.h * 0.4, 0.8, shade(tin, 1.1), 0.2, tin);
    m.box(xf, 0, 2.2, b.h / 2 + 0.1, 5, 0.45, 0.06, col('#2a6ac0'));   // spanduk PASAR TERTIB
    // terminal angkot di depan pasar: halte + angkot biru muda berjajar
    const t = { x: 114 + (b.dx || 0), z: 106 + (b.dy || 0), a: 0 };
    m.box(t, 0, 0, -0.6, 10, 0.12, 2, col('#a8a8a4')); m.box(t, 0, 2.2, -0.6, 10, 0.1, 2.2, col('#5a7aa8'));
    for (const x of [-4.8, 0, 4.8]) { m.box(t, x, 0.12, -1.4, 0.15, 2.1, 0.15, col('#5a5a60')); cl(t, x, -1.4, 0.2, 0.2); }
    m.box(t, 0, 0.12, -1.2, 8, 0.4, 0.5, col('#8a5a34'));
    for (let i = 0; i < 4; i++) { const a = { x: 109 + (b.dx || 0) + i * 3.4, z: 108.4 + (b.dy || 0), a: Math.PI / 2 }; if (!clear(a.x, a.z, 2)) continue; car(m, a, '#8ac8e0', 'angkot'); cl(a, 0, 0, 1.5, 3.2); }
  });
  add(S.plaza, (m, xf, b) => {
    m.box(xf, 0, 0, 0, b.w, 3 * FLOOR, b.h, col('#c8b8e0'));
    for (let f = 0; f < 3; f++) m.box(xf, 0, f * FLOOR + 0.5, b.h / 2 + 0.02, b.w - 0.6, 0.9, 0.06, col('#5a8ac8'));
    m.box(xf, 0, 0, b.h / 2 + 0.03, 2.2, 1.5, 0.06, col('#a8d0f0')); m.box(xf, 0, 1.6, b.h / 2 + 0.6, 3.4, 0.08, 1.2, col('#a898c8'));
    m.box(xf, 0, 3 * FLOOR, 0, b.w + 0.1, 0.2, b.h + 0.1, col('#a898c8')); m.box(xf, 0, 3 * FLOOR + 0.2, b.h / 2 - 0.2, 4, 1.0, 0.2, col('#8a3ab0'));
    for (const s of [-1, 1]) m.box(xf, s * 3, 0.4, b.h / 2 + 0.04, 1.0, 1.4, 0.04, col(s > 0 ? '#e85a3a' : '#2a6ac0'));   // poster bioskop
    for (let i = 0; i < 10; i++) motor(m, { ...L(xf, -b.w / 2 + 0.6 + i * 0.85, b.h / 2 + 2.4).reduce((o, v, k) => (o[k ? 'z' : 'x'] = v, o), {}), a: xf.a }, pick(['#2a2a2e', '#c83a3a', '#2a6ac0', '#e8e8e8'], hash(i, 41)));
    cl(xf, 0, 0, b.w, b.h); cl(xf, 0, b.h / 2 + 2.4, b.w, 1.4);
  });
  add(S.gudang, (m, xf, b) => {   // gudang markas Lampu Kota: bata hitam, mural bohlam, atap pelengkung seng
    const black = col('#2e2e32');
    m.box(xf, 0, 0, 0, b.w, 1.4 * FLOOR, b.h, black);
    for (let i = 0; i < 5; i++) { const t = i / 4, y = 1.4 * FLOOR + Math.sin(t * Math.PI) * 1.1; m.box(xf, 0, 1.4 * FLOOR, -b.h / 2 + t * b.h, b.w + 0.3, y - 1.4 * FLOOR + 0.1, b.h / 4 + 0.05, col('#8a9098')); }
    m.box(xf, -0.6, 0, b.h / 2 + 0.02, 2.6, 1.9, 0.06, col('#5a5a5e'));
    m.box(xf, 1.9, 0.9, b.h / 2 + 0.03, 0.9, 1.1, 0.04, col('#f2c230')); m.box(xf, 1.9, 0.6, b.h / 2 + 0.03, 0.4, 0.3, 0.04, col('#a8a8a8'));
    for (let i = 0; i < 6; i++) m.box(xf, -b.w / 2 + 0.5 + i * (b.w - 1) / 5, 2.3, b.h / 2 + 0.15, 0.14, 0.14, 0.14, col('#fff2a0'));
    { const [x, z] = L(xf, -2.5, b.h / 2 + 0.75); motor(m, { x, z, a: xf.a + Math.PI / 2 }, '#2a2a2e'); }
    cl(xf, 0, 0, b.w, b.h);
  });
  add(S.stm, (m, xf, b) => {   // STM: dua gedung L gaya pabrik
    const g = col('#a8a8a4'), tin = col('#9aa0a6');
    m.box(xf, 0, 0, -b.h / 2 + 1.6, b.w, 2 * FLOOR, 3.2, g); facade(m, { ...xf, z: xf.z }, b.w, b.h, 1, 2, {});
    for (let i = 0; i < 4; i++) win(m, xf, -b.w / 2 + 1.2 + i * 2.4, i, -b.h / 2 + 3.2);
    m.gable(at0(xf, 0, -b.h / 2 + 1.6), 0, 2 * FLOOR, 0, b.w, 3.2, 1, tin, 0.3, g);
    m.box(xf, b.w / 2 - 1.6, 0, 0.8, 3.2, FLOOR * 1.3, b.h - 3.2, g); m.box(xf, b.w / 2 - 1.6, FLOOR * 1.3, 0.8, 3.4, 0.12, b.h - 3, tin);
    m.box(xf, 0, 2 * FLOOR - 0.5, -b.h / 2 + 3.25, 4, 0.4, 0.08, col('#d23a3a'));
    m.box(xf, -1.5, 0, 1.5, 2.4, 0.9, 1.2, col('#6a6a70'));   // meja praktik bengkel terbuka
    cl(xf, 0, -b.h / 2 + 1.6, b.w, 3.2); cl(xf, b.w / 2 - 1.6, 0.8, 3.2, b.h - 3.2); cl(xf, -1.5, 1.5, 2.4, 1.2);
  });
  add(S.bram, (m, xf, b) => {
    const w = b.w, d = b.h;
    m.box(xf, 0, 0, 0, w, 2 * FLOOR, d, col('#f6f4ee'));
    facade(m, xf, w, d, 0, 2, { door: true, doorC: col('#8a5a34'), ww: 1, glass: GLASS2 }); facade(m, xf, w, d, 1, 2, { ww: 1, glass: GLASS2 });
    for (const s of [-1, -0.33, 0.33, 1]) m.box(xf, s * (w / 2 - 0.4), 0, d / 2 + 0.4, 0.4, 2 * FLOOR, 0.4, col('#ffffff'));
    m.hip(xf, 0, 2 * FLOOR, 0, w, d, 2.4, col('#2a2c30'));
    // kolam renang pribadi di samping rumah: pilih sisi yang tidak menyentuh jalan, kalau dua-duanya kena taruh di belakang
    const poolOK = (lx, lz, sx, sz) => [-1, 0, 1].every(u => [-1, 0, 1].every(v => M.roadDist(...L(xf, lx + u * sx / 2, lz + v * sz / 2)) > 0.4));
    const pool = [[w / 2 + 2.2, 0, 3.2, d], [-w / 2 - 2.2, 0, 3.2, d], [0, -d / 2 - 2.2, w, 3.2]].find(q => poolOK(...q));
    if (pool) { const [px, pz, sx, sz] = pool; m.box(xf, px, 0, pz, sx, 0.12, sz, col('#e8e4dc')); m.box(xf, px, 0.12, pz, sx - 0.6, 0.02, sz - 0.6, col('#4aa8d8')); }
    for (let i = 0; i < 3; i++) car(m, { x: L(xf, -w / 2 + 1.2 + i * 2, d / 2 + 2.6)[0], z: L(xf, -w / 2 + 1.2 + i * 2, d / 2 + 2.6)[1], a: xf.a }, ['#2a2a2e', '#e8e8e8', '#a83a3a'][i]);
    cl(xf, 0, 0, w, d); for (let i = 0; i < 3; i++) cl(xf, -w / 2 + 1.2 + i * 2, d / 2 + 2.6, 1.5, 3.2);
  });
  add(S.menara, (m, xf) => {
    const red = col('#c83a3a'), wh = col('#e8e8e8');
    for (const [sx, sz] of [[-1, -1], [1, -1], [0, 1.1]]) m.box(xf, sx * 0.9, 0, sz * 0.9, 0.16, 12, 0.16, col('#8a8a90'));
    for (let i = 0; i < 6; i++) m.box(xf, 0, i * 2 + 1.5, 0, 2 - i * 0.12, 0.14, 2 - i * 0.12, i % 2 ? red : wh);
    m.box(xf, 0, 3.5, 0, 2.6, 0.12, 2.6, col('#6a6a70'));   // platform tempat duduk
    m.box(xf, 0, 12, 0, 0.3, 2.4, 0.3, red); m.box(xf, 0, 14.4, 0, 0.35, 0.35, 0.35, col('#ff5040'));
    m.box(xf, 2.4, 0, 0, 1.6, 1.4, 1.4, col('#c8c4b8')); cl(xf, 0, 0, 2.2, 2.2); cl(xf, 2.4, 0, 1.6, 1.4);
  });
}
const at0 = (xf, lx, lz) => { const [x, z] = L(xf, lx, lz); return { x, z, a: xf.a }; };
function win(m, xf, lx, _, lz) { m.box(xf, lx, 0.5, lz + 0.03, 1.4, 0.9, 0.05, GLASS); }

// kabel menjuntai (parabola) dari a ke b: pita silang tipis yang menyambung tanpa celah
function wire(m, a, b, sag, t = 0.035, c = col('#1e1e22')) {
  const n = 12, P = []; for (let i = 0; i <= n; i++) { const u = i / n; P.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - 4 * sag * u * (1 - u), a[2] + (b[2] - a[2]) * u]); }
  const dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz) || 1, nx = -dz / l * t / 2, nz = dx / l * t / 2;
  for (let i = 1; i <= n; i++) { const p = P[i - 1], q = P[i];
    m.poly2([[p[0] + nx, p[1], p[2] + nz], [q[0] + nx, q[1], q[2] + nz], [q[0] - nx, q[1], q[2] - nz], [p[0] - nx, p[1], p[2] - nz]], c);
    m.poly2([[p[0], p[1] + t / 2, p[2]], [q[0], q[1] + t / 2, q[2]], [q[0], q[1] - t / 2, q[2]], [p[0], p[1] - t / 2, p[2]]], c); }
}
/* ------------------------------------------------------------------ gerbang Perumahan Bukit Asri: gapura, pos satpam & portal */
function perumGate(ch, K, M, C, occ, SB, scene) {
  const road = K.roads.find(r => r.kind === 'jalan' && Math.hypot(r.pts[0][0] - 196, r.pts[0][1] - 88) < 1.5); if (!road) return null;
  const P = resample(road.pts, 0.25), at = s => P[Math.min(P.length - 1, Math.round(s / 0.25))], hw = road.w / 2;
  const frame = (p, side = 0, off = 0) => ({ x: p.x - p.tz * side * off, z: p.z + p.tx * side * off, a: Math.atan2(p.tz, p.tx) + Math.PI / 2 });
  // gapura: dua pilar bata + balok papan nama di atas jalan
  { const p = at(6.5), xf = frame(p), m = ch.at(p.x, p.z);
    for (const sd of [-1, 1]) { m.box(xf, sd * (hw + 0.75), 0, 0, 0.8, 3.1, 0.8, col('#c8b89a')); m.box(xf, sd * (hw + 0.75), 3.1, 0, 0.95, 0.18, 0.95, col('#5a4a3a')); colLocal(C, xf, sd * (hw + 0.75), 0, 0.8, 0.8); }
    m.box(xf, 0, 3.15, 0, road.w + 2.3, 0.55, 0.4, col('#3a2e24'));
    SB.sign(xf, 0, 3.17, 0.21, 4.2, 0.78, SB.kinds.perum); SB.sign({ ...xf, a: xf.a + Math.PI }, 0, 3.17, 0.21, 4.2, 0.78, SB.kinds.perum); }
  // pos satpam di sisi yang kosong
  const sp = at(9.6); let side = 1;
  const freeAt = sd => { const f = frame(sp, sd, hw + 1.75); return [-0.9, 0, 0.9].every(u => [-0.9, 0, 0.9].every(v => { const [x, z] = L(f, u, v); return !occ.get(x, z) && M.roadDist(x, z) > 0.2 && !M.waterAt(x, z); })); };
  if (!freeAt(1) && freeAt(-1)) side = -1;
  const bx = frame(sp, side, hw + 1.75); bx.a += side > 0 ? Math.PI / 2 : -Math.PI / 2;   // pintu & jendela depan menghadap jalan
  { const m = ch.at(bx.x, bx.z), wall = col('#ece8dc'), glass = col('#3a5a78'), blue = col('#1f3f7a');
    m.box(bx, 0, 0, 0, 1.8, 0.12, 1.8, col('#b8b4aa'));
    m.box(bx, 0, 0.12, 0, 1.6, 0.7, 1.6, wall); m.box(bx, 0, 0.12, 0, 1.62, 0.16, 1.62, blue);
    for (const [u, v, w, d] of [[0, -0.75, 1.6, 0.1], [-0.75, 0, 0.1, 1.6], [0.75, 0, 0.1, 1.6]]) m.box(bx, u, 0.82, v, w, 0.85, d, glass);
    m.box(bx, -0.4, 0.82, 0.75, 0.8, 0.85, 0.1, glass); m.box(bx, 0.42, 0.12, 0.78, 0.6, 1.55, 0.06, col('#5a3a24'));   // jendela depan + pintu
    for (const [u, v] of [[-0.78, -0.78], [0.78, -0.78], [0.78, 0.78], [-0.78, 0.78], [0, 0.78]]) m.box(bx, u, 0.82, v, 0.1, 0.85, 0.1, wall);
    m.box(bx, 0, 1.67, 0, 1.62, 0.08, 1.62, wall); m.box(bx, 0, 1.75, 0, 2.3, 0.12, 2.3, col('#5a5a60')); m.box(bx, 0, 1.87, 0, 1.4, 0.1, 1.4, col('#6a6a70'));
    m.box(bx, 0.25, 1.95, 0.25, 0.08, 0.5, 0.08, col('#3a3a3e')); m.box(bx, 0.25, 2.4, 0.25, 0.25, 0.12, 0.12, col('#e8e4d0'));   // lampu sorot
    SB.sign(bx, 0, 1.4, 0.92, 1.4, 0.26, SB.kinds.pos);
    m.box(bx, -0.55, 0.12, 1.15, 0.38, 0.42, 0.38, col('#c83a3a')); m.box(bx, -0.55, 0.54, 0.98, 0.38, 0.4, 0.05, col('#c83a3a'));   // kursi plastik
    colLocal(C, bx, 0, 0, 1.8, 1.8); }
  // papan "tamu wajib lapor" di sisi seberang
  { const p = at(8.2), xf = frame(p, -side, hw + 0.9), m = ch.at(xf.x, xf.z); for (const u of [-0.45, 0.45]) m.box(xf, u, 0, 0, 0.08, 1.2, 0.08, col('#5a5a60'));
    SB.sign(xf, 0, 1.1, 0.05, 1.2, 0.48, SB.kinds.lapor); SB.sign({ ...xf, a: xf.a + Math.PI }, 0, 1.1, 0.05, 1.2, 0.48, SB.kinds.lapor); C.circle(xf.x, xf.z, 0.2); }
  // portal: tiang di sisi pos, palang merah-putih melintang jalan, naik kalau ada kendaraan mendekat
  const pp = at(8.6), post = frame(pp, side, hw + 0.3), m = ch.at(post.x, post.z);
  m.box(post, 0, 0, 0, 0.28, 0.9, 0.28, col('#e8e4d0')); m.box(post, 0, 0.55, 0, 0.3, 0.12, 0.3, col('#d0282e')); m.box(post, 0, 0.82, -0.25, 0.22, 0.22, 0.3, col('#3a3a3e')); C.circle(post.x, post.z, 0.2);
  const len = road.w + 0.1, arm = new Merger();
  for (let i = 0; i < 8; i++) arm.box({ x: 0, z: 0, a: 0 }, (i + 0.5) * len / 8, -0.05, 0, len / 8 + 0.002, 0.1, 0.08, col(i % 2 ? '#f4f4f0' : '#d0282e'));
  const mesh = new THREE.Mesh(arm.build(), MAT.world); mesh.castShadow = true;
  const pivot = new THREE.Group(), yaw = new THREE.Group(); yaw.add(pivot); pivot.add(mesh);
  const dx = pp.tz * side, dz = -pp.tx * side;   // dari tiang menyeberang ke sisi lain
  yaw.position.set(post.x, 0.95, post.z); yaw.rotation.y = Math.atan2(-dz, dx); scene.add(yaw);
  let lift = 0;
  return {
    pos: (() => { const [x, z] = L(bx, -0.1, 1.35); return { x, z }; })(),
    update(dt, player, cars, riding) {
      let near = player && riding && (player.x - pp.x) ** 2 + (player.z - pp.z) ** 2 < 36;
      if (!near && cars) for (const v of cars) if (!v.wait && (v.x - pp.x) ** 2 + (v.z - pp.z) ** 2 < 49) { near = true; break; }
      lift += ((near ? 1.35 : 0) - lift) * Math.min(1, dt * 3); pivot.rotation.z = lift;
    }
  };
}

/* ------------------------------------------------------------------ jalanan: kanstin, trotoar, jembatan, tiang listrik, lampu */
function streetStuff(ch, K, M, C, veg, regionAt, occ, houses, thin) {
  const curb = col('#d8d6ce'), curb2 = col('#c83a3a');
  // jarak ke tepi jalan LAIN (bukan jalan ini), lewat grid ruas 8 petak
  const OG = new Map(), cell = 8;
  for (const r of K.roads) if (r.kind !== 'setapak') for (let i = 1; i < r.pts.length; i++) {
    const [ax, az] = r.pts[i - 1], [bx, bz] = r.pts[i], q = { r, ax, az, bx, bz, hw: r.w / 2 };
    for (let gx = Math.floor((Math.min(ax, bx) - 4) / cell); gx <= Math.floor((Math.max(ax, bx) + 4) / cell); gx++)
      for (let gz = Math.floor((Math.min(az, bz) - 4) / cell); gz <= Math.floor((Math.max(az, bz) + 4) / cell); gz++) { const k = gx * 4096 + gz; (OG.get(k) || OG.set(k, []).get(k)).push(q); }
  }
  const otherDist = (road, x, z) => {
    let best = 9; for (const q of OG.get(Math.floor(x / cell) * 4096 + Math.floor(z / cell)) || []) { if (q.r === road) continue;
      const dx = q.bx - q.ax, dz = q.bz - q.az, l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - q.ax) * dx + (z - q.az) * dz) / l2)); best = Math.min(best, Math.hypot(x - q.ax - dx * t, z - q.az - dz * t) - q.hw); }
    return best;
  };
  const poles = [];
  for (const road of K.roads) {
    if (road.kind === 'setapak') continue;
    const P = resample(road.pts, 0.5);
    const bridgeC = road.kind === 'gang' ? col('#b89a5a') : col('#3a6aa8');
    let poleNext = 4 + hash(road.pts.length) * 4, lampNext = 6;
    for (let i = 0; i < P.length; i++) {
      const p = P[i], nx = -p.tz, nz = p.tx, a = Math.atan2(p.tz, p.tx), reg = regionAt(p.x, p.z);
      const water = M.waterAt(p.x, p.z);
      if (water) {   // jembatan: lantai beton + pagar (besi biru / bambu)
        const m = ch.at(p.x, p.z), xf = { x: p.x, z: p.z, a };
        m.box(xf, 0, -0.12, 0, 0.55, 0.1, road.w + 0.5, col('#a8a49a'));
        for (const sd of [-1, 1]) m.box(xf, 0, -0.5, sd * (road.w / 2 + 0.05), 0.55, 0.44, 0.3, col('#8e8a80'));          // balok samping jembatan
        if (i % 6 === 0) for (const sd of [-0.5, 0.5]) m.box(xf, 0, BED, sd * road.w * 0.6, 0.34, -BED - 0.48, 0.34, col('#7a766c'));   // pilar di sungai
        for (const s of [-1, 1]) { const [qx, qz] = [p.x + nx * s * (road.w / 2 + 0.15), p.z + nz * s * (road.w / 2 + 0.15)]; if (M.roadDist(qx, qz) < 0) continue; m.box(xf, 0, 0.07, s * (road.w / 2 + 0.15), 0.52, 0.12, 0.2, col('#9a968c')); m.box(xf, 0, 0.19, s * (road.w / 2 + 0.15), 0.08, 0.6, 0.08, bridgeC); m.box(xf, 0, 0.75, s * (road.w / 2 + 0.15), 0.55, 0.06, 0.08, bridgeC); colLocal(C, xf, 0, s * (road.w / 2 + 0.2), 0.55, 0.15); }
        continue;
      }
      // kanstin putih / merah-putih di jalan raya & jalan, trotoar di pusat kota
      if ((road.kind === 'raya' || road.kind === 'jalan') && !nearTaper(road, p.s, P.at(-1).s)) for (const s of [-1, 1]) {
        const off = road.w / 2 + 0.05, x = p.x + nx * s * off, z = p.z + nz * s * off;
        if (M.roadAt(x + nx * s * 0.6, z + nz * s * 0.6) || M.waterAt(x, z) || M.roadDist(x, z) < -0.01 || M.roadDist(x + p.tx * 0.3, z + p.tz * 0.3) < -0.01 || M.roadDist(x - p.tx * 0.3, z - p.tz * 0.3) < -0.01 || M.roadDist(x + nx * s * 0.8, z + nz * s * 0.8) < 0.05) continue;   // simpang: tanpa kanstin
        const m = ch.at(x, z), xf = { x, z, a };
        // trotoar: berhenti sebelum masuk wilayah trotoar jalan lain (simpang/tikungan), supaya tidak bersilangan
        const walk = reg === 'pusat' && road.kind === 'raya' && [0.15, 0.8, 1.5].every(u => { const qx = x + nx * s * u, qz = z + nz * s * u; return otherDist(road, qx, qz) > 1.75 && M.roadDist(qx, qz) > 0.02; });
        if (walk) { m.box({ x: x + nx * s * 0.8, z: z + nz * s * 0.8, a }, 0, 0, 0, 0.52, 0.1, 1.5, col(i % 2 ? '#bcb8ae' : '#c4c0b6')); }
        m.box(xf, 0, 0, 0, 0.52, walk ? 0.14 : 0.1, 0.16, (i % 5 === 0 ? shade(curb, 0.92) : curb));
      }
      // selokan beton di tepi gang kampung/bantaran
      if (road.kind === 'gang' && (reg === 'kampung' || reg === 'bantaran' || reg === 'pusat') && i % 1 === 0) for (const s of [-1, 1]) {
        const off = road.w / 2 + 0.5, x = p.x + nx * s * off, z = p.z + nz * s * off;
        if (M.roadAt(x, z) || M.waterAt(x, z) || M.roadDist(x, z) < 0.05) continue;
        // dekat simpang / percabangan lancip: selokan berhenti sebelum masuk wilayah jalan lain (tidak bersilangan di paving)
        if ([0.2, 0.45].some(u => otherDist(road, x + nx * s * u, z + nz * s * u) < 1.4) || otherDist(road, x + p.tx * 0.3, z + p.tz * 0.3) < 1.4 || otherDist(road, x - p.tx * 0.3, z - p.tz * 0.3) < 1.4) continue;
        ch.at(x, z).box({ x: x + nx * s * 0.2, z: z + nz * s * 0.2, a }, 0, 0, 0, 0.52, 0.08, 0.08, col('#9a968c'));
        if (i % 8 === 0) ch.at(x, z).box({ x, z, a }, 0, 0, 0, 0.5, 0.05, 0.45, col('#a8a49a'));   // tutup selokan
      }
      // tiang listrik (kampung, bantaran, pusat, selatan): kalau titiknya terhalang, geser sedikit (bukan dilewati) supaya jarak antartiang tetap rapat
      if (p.s >= poleNext && road.kind !== 'raya' && (reg === 'kampung' || reg === 'bantaran' || reg === 'pusat' || reg === 'selatan')) {
        const off = road.w / 2 + 0.75, x = p.x + nx * off, z = p.z + nz * off;
        if (!M.roadAt(x, z) && !M.waterAt(x, z) && !occ.get(x, z) && M.roadDist(x, z) > 0.3) { poles.push({ x, z, a, road, s: p.s, n: [] }); poleNext = p.s + 9; }
        else poleNext = p.s + 0.5;
      }
      // lampu jalan raya (selang-seling)
      if (road.kind === 'raya' && !road.closed && p.s >= lampNext) {
        lampNext += 11;
        const s = Math.floor(lampNext / 11) % 2 ? 1 : -1, off = road.w / 2 + (reg === 'pusat' ? 1.3 : 0.6), x = p.x + nx * s * off, z = p.z + nz * s * off;
        if (!M.waterAt(x, z) && !M.roadAt(x, z) && !occ.get(x, z) && M.roadDist(x, z) > 0.3) {
          const m = thin.at(x, z), xf = { x, z, a: Math.atan2(-nz * s, -nx * s) };
          m.box(xf, 0, 0, 0, 0.14, 3.4, 0.14, col('#5a5a60')); m.box(xf, 0.5, 3.3, 0, 1.0, 0.08, 0.1, col('#5a5a60')); m.box(xf, 0.95, 3.18, 0, 0.34, 0.12, 0.24, col('#fff2b0'));
          C.circle(x, z, 0.12);
          if (reg === 'pusat') { const tx = x + p.tx * 5, tz = z + p.tz * 5; if (M.roadDist(tx, tz) > 0.9 && !occ.get(tx, tz) && !M.waterAt(tx, tz)) { veg.push({ k: 'bulat', x: tx, z: tz, a: 0, s: 0.6 }); C.circle(tx, tz, 0.2); } }   // pohon peneduh trotoar
        }
      }
    }
  }
  // kabel: tiang berurutan di jalan yang sama tersambung; ujung jaringan disambung ke tiang jalan lain terdekat (simpang),
  // tiang yang tetap sendirian tidak dipasang (tiang tanpa kabel kelihatan aneh)
  const link = (A, B) => { if (A === B || A.n.includes(B)) return; A.n.push(B); B.n.push(A); };
  for (let i = 1; i < poles.length; i++) { const A = poles[i - 1], B = poles[i]; if (A.road === B.road && Math.hypot(A.x - B.x, A.z - B.z) < 15) link(A, B); }
  for (const A of poles) if (A.n.length < 2) {
    let best = null, bd = A.n.length ? 9 : 13;
    for (const B of poles) { if (B === A || B.road === A.road || A.n.includes(B)) continue; const d = Math.hypot(A.x - B.x, A.z - B.z); if (d < bd) { bd = d; best = B; } }
    if (best) link(A, best);
  }
  const wired = new Set();
  for (const A of poles) {
    if (!A.n.length) continue;
    const m = thin.at(A.x, A.z), xf = { x: A.x, z: A.z, a: A.a };
    m.box(xf, 0, 0, 0, 0.16, 4.2, 0.16, col('#7a7a80')); m.box(xf, 0, 3.9, 0, 0.1, 0.08, 0.9, col('#5a5a60'));
    m.box(xf, 0, 3.6, 0.3, 0.28, 0.36, 0.22, col('#5a6a5a'));
    C.circle(A.x, A.z, 0.14);
    for (const B of A.n) {
      if (wired.has(B)) continue;
      // ujung palang dipasangkan supaya dua kabel tidak bersilangan
      const end = (P, o) => [P.x + Math.cos(P.a + Math.PI / 2) * o, P.z + Math.sin(P.a + Math.PI / 2) * o];
      const flip = Math.cos(A.a - B.a) < 0 ? -1 : 1;
      for (const o of [-0.4, 0.4]) {
        const [ax, az] = end(A, o), [bx, bz] = end(B, o * flip), l = Math.hypot(bx - ax, bz - az);
        wire(thin.at((ax + bx) / 2, (az + bz) / 2), [ax, 3.93, az], [bx, 3.93, bz], 0.25 + l * 0.025);
      }
    }
    wired.add(A);
  }
  // lampu merah: dibuat otomatis di tiap simpang jalan raya oleh traffic.js
  // rel kereta: bantalan + 2 batang rel
  for (const r of K.rails) {
    const P = resample(r.pts, 0.7);
    for (const p of P) { const xf = { x: p.x, z: p.z, a: Math.atan2(p.tz, p.tx) }, m = ch.at(p.x, p.z), onRoad = M.roadDist(p.x, p.z) < 1.0; if (!onRoad) m.box(xf, 0, 0, 0, 0.22, 0.08, 1.6, col('#5a4434')); for (const s of [-0.55, 0.55]) m.box(xf, 0, onRoad ? 0.005 : 0.08, s, 0.72, onRoad ? 0.02 : 0.07, 0.07, col('#8a8a90')); }   // perlintasan: rel rata dengan jalan
  }
  // alun-alun: pagar besi hijau rendah melingkar dengan 4 bukaan, lampu taman, panggung
  for (let i = 0; i < 64; i++) {
    const t = i / 64 * Math.PI * 2; if (Math.abs(Math.sin(t * 2)) < 0.12) continue;
    const x = 146 + Math.cos(t) * 10.2, z = 76 + Math.sin(t) * 6.3, m = ch.at(x, z), a = Math.atan2(Math.cos(t) * 6.3, -Math.sin(t) * 10.2);
    m.box({ x, z, a }, 0, 0, 0, 0.92, 0.5, 0.06, col('#2f6a4a'));
    if (i % 8 === 4) { m.box({ x, z, a }, 0, 0, 0.4, 0.08, 1.4, 0.08, col('#2a2a2e')); m.box({ x, z, a }, 0, 1.4, 0.4, 0.26, 0.26, 0.26, col('#fff6d0')); }
  }
  { const m = ch.at(146, 71), xf = { x: 146, z: 70.6, a: 0 }; m.box(xf, 0, 0, 0, 4.4, 0.6, 2.2, col('#8a5a34')); m.box(xf, 0, 0.6, -0.9, 4.4, 1.8, 0.1, col('#c83a3a')); colLocal(C, xf, 0, 0, 4.4, 2.2); }
  for (const t of [[143.5, 77], [148.5, 77]]) { veg.push({ k: 'bulat', x: t[0], z: t[1], s: 1.6 }); C.circle(t[0], t[1], 0.5); }
  // lapangan bola kampung: gawang
  for (const s of [-1, 1]) { const m = ch.at(88, 104), xf = { x: 88 + s * 5.6, z: 104, a: 0 }; m.box(xf, 0, 0, -1.2, 0.12, 1.2, 0.12, col('#f4f4f0')); m.box(xf, 0, 0, 1.2, 0.12, 1.2, 0.12, col('#f4f4f0')); m.box(xf, 0, 1.2, 0, 0.12, 0.12, 2.5, col('#f4f4f0')); C.circle(xf.x, 102.8, 0.1); C.circle(xf.x, 105.2, 0.1); }
  // taman kota & lapangan basket umum (no. 18)
  { const m = ch.at(127, 46);
    m.box({ x: 127, z: 46, a: 0 }, 0, 0, 0, 8, 0.04, 6, col('#c4784c')); for (const x of [123.3, 130.7]) m.box({ x, z: 46, a: 0 }, 0, 0.04, 0, 0.06, 0.01, 6, col('#f4f4f0'));
    for (const [x, z] of [[123.4, 46], [130.6, 46]]) { m.box({ x, z, a: 0 }, 0, 0, 0, 0.15, 2.4, 0.15, col('#4a4a50')); m.box({ x, z, a: 0 }, 0, 2.2, 0, 0.1, 0.8, 1, col('#f4f4f0')); C.circle(x, z, 0.2); }
    for (const [x, z] of [[125, 50.5], [129, 50.5]]) { m.box({ x, z, a: 0 }, 0, 0, 0, 1.6, 0.45, 0.45, col('#3a7ac0')); colLocal(C, { x, z, a: 0 }, 0, 0, 1.6, 0.45); } }
  // gapura Gang Kenanga: di mulut gang utama dari jalan raya
  { const g1 = K.roads.find(r => r.kind === 'gang' && Math.hypot(r.pts[0][0] - 34, r.pts[0][1] - 77) < 1.5);
    if (g1) { const P = resample(g1.pts, 0.25), p = P[Math.round(5.5 / 0.25)], a = Math.atan2(p.tz, p.tx), xf = { x: p.x, z: p.z, a: a + Math.PI / 2 }, m = ch.at(p.x, p.z);
      for (const s of [-1, 1]) { m.box(xf, s * (g1.w / 2 + 0.85), 0, 0, 0.9, 2.2, 0.9, col('#b06a4a')); colLocal(C, xf, s * (g1.w / 2 + 0.85), 0, 0.9, 0.9); }
      m.box(xf, 0, 2.2, 0, g1.w + 2.7, 0.6, 0.5, col('#d23a3a')); m.box(xf, 0, 2.35, 0.26, g1.w, 0.3, 0.02, col('#f4f4f0')); } }
  // pos ronda dekat simpang gang
  { const xf = { x: 38.5, z: 86, a: 0.3 }, m = ch.at(38.5, 86);
    if (!M.roadAt(38.5, 86) && !occ.get(38.5, 86)) {
      m.box(xf, 0, 0.3, 0, 2, 0.12, 2, col('#9a7440')); for (const [x, z] of [[-0.9, -0.9], [0.9, -0.9], [0.9, 0.9], [-0.9, 0.9]]) m.box(xf, x, 0, z, 0.12, 2, 0.12, col('#8a7a4a'));
      m.poly([[-1.1, 2.1, -1.1], [1.1, 2.1, -1.1], [1.1, 1.8, 1.1], [-1.1, 1.8, 1.1]].map(([x, y, z]) => { const [X, Z] = L(xf, x, z); return [X, y, Z]; }), col('#8a8a8a'));
      m.box(xf, 0.9, 1.2, 0.95, 0.1, 0.5, 0.1, col('#c8a868')); colLocal(C, xf, 0, 0, 2, 2);
    } }
  // lahan proyek: pagar seng biru, spanduk, ekskavator, pipa, kontainer
  const PP = K.areas[AREA.proyek].pts;
  for (let i = 0; i < PP.length - 1; i++) {
    const [x0, z0] = PP[i], [x1, z1] = PP[i + 1], l = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(z1 - z0, x1 - x0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, m = ch.at(mx, mz);
    if (i === 0) for (const s of [-1, 1]) { const off = s * (l / 4 + 1), xf = { x: mx + Math.cos(a) * off, z: mz + Math.sin(a) * off, a }; m.box(xf, 0, 0, 0, l / 2 - 2, 2, 0.1, col('#3a6aa8')); colLocal(C, xf, 0, 0, l / 2 - 2, 0.15); }
    else { const xf = { x: mx, z: mz, a }; m.box(xf, 0, 0, 0, l, 2, 0.1, col('#3a6aa8')); colLocal(C, xf, 0, 0, l, 0.15); if (i === 2) m.box(xf, 0, 0.6, -0.08, 8, 1.1, 0.04, col('#f2f2ee')); }
  }
  { const m = ch.at(212, 153);
    const ex = { x: 204, z: 152, a: 0.3 }; m.box(ex, 0, 0, 0, 2.4, 0.5, 1.6, col('#2a2a2e')); m.box(ex, 0, 0.5, 0, 2, 1.2, 1.4, col('#f2c230')); m.box(ex, 1.8, 1.4, 0, 2.2, 0.3, 0.3, col('#f2c230')); m.box(ex, 2.8, 0.4, 0, 0.6, 0.8, 0.8, col('#d8a020')); colLocal(C, ex, 0, 0, 2.4, 1.6);
    const ct = { x: 220, z: 156, a: 0 }; m.box(ct, 0, 0, 0, 4, 1.8, 1.8, col('#c8503a')); m.box(ct, 0, 0.6, 0.92, 0.8, 0.5, 0.02, GLASS); colLocal(C, ct, 0, 0, 4, 1.8);
    for (let i = 0; i < 4; i++) m.box({ x: 212, z: 151 + i * 0.5, a: 0 }, 0, (i % 2) * 0.4, 0, 4, 0.4, 0.4, col('#8a8a90')); colLocal(C, { x: 212, z: 151.8, a: 0 }, 0, 0, 4, 2);
    m.box({ x: 214, z: 157, a: 0 }, 0, 0, 0, 0.6, 10, 0.6, col('#f2c230')); m.box({ x: 214, z: 157, a: 0 }, 3, 10, 0, 9, 0.4, 0.4, col('#f2c230')); C.circle(214, 157, 0.4); }
  // sirkuit: ban pembatas merah-putih + garis start
  { const loop = K.roads.find(r => r.closed);
    if (loop) { const P = resample(loop.pts, 1.2); P.forEach((p, i) => { if (i % 2) return; for (const s of [-1, 1]) { const x = p.x - p.tz * s * (loop.w / 2 + 0.5), z = p.z + p.tx * s * (loop.w / 2 + 0.5); if (M.roadAt(x, z)) continue; ch.at(x, z).box({ x, z, a: 0 }, 0, 0, 0, 0.45, 0.4, 0.45, col(i % 4 ? '#e8e8e8' : '#d23a3a')); } }); } }
}

/* ------------------------------------------------------------------ air sungai (beriak) */
// lubang air di tekstur tanah: sungai (minus jembatan/jalan yang melintas) & danau, dengan bibir batu di tepi danau
let HOLE = null;
function waterHoles(g, K, tx, tz, w, h) {
  if (!HOLE) HOLE = document.createElement('canvas');
  HOLE.width = w; HOLE.height = h;
  const m = HOLE.getContext('2d'); m.setTransform(PX, 0, 0, PX, -tx * PX, -tz * PX); m.lineCap = m.lineJoin = 'round';
  m.fillStyle = m.strokeStyle = '#000';
  for (const r of K.rivers) { strokePath(m, r.pts, 1); m.lineWidth = r.w - 0.3; m.stroke(); }
  for (const i of AREA.water) { strokePath(m, K.areas[i].pts, 1); m.closePath(); m.fill(); }
  m.globalCompositeOperation = 'destination-out';
  for (const r of K.roads) if (r.kind !== 'setapak') { strokePath(m, r.pts, 1); m.lineWidth = r.w + 0.9; m.stroke(); }
  g.save(); g.globalCompositeOperation = 'destination-out'; g.drawImage(HOLE, 0, 0); g.restore();
  g.save(); g.setTransform(PX, 0, 0, PX, -tx * PX, -tz * PX); g.lineJoin = 'round'; g.strokeStyle = '#8a8478'; g.lineWidth = 0.3;
  for (const i of AREA.water) { strokePath(g, K.areas[i].pts, 1); g.closePath(); g.stroke(); }
  g.restore();
}
// dasar & dinding talud: sungai/danau punya kedalaman (dasar -0.9, permukaan air -0.32)
const BED = -1.15, SURF = -0.48;
function waterBanks(K, M) {
  const m = new Merger(), bed = col('#3e5048'), stone = col('#8a8478'), wet = col('#56584c');
  const wall = (ax, az, bx, bz, i) => {
    if (M.roadDist((ax + bx) / 2, (az + bz) / 2) < 0.35) return;   // di bawah jembatan: tertutup dek, jangan menembus aspal
    const c1 = shade(stone, 0.9 + 0.2 * hash(i, 5)), c2 = shade(wet, 0.9 + 0.15 * hash(i, 6));
    m.poly2([[ax, SURF + 0.06, az], [bx, SURF + 0.06, bz], [bx, 0.01, bz], [ax, 0.01, az]], c1);
    m.poly2([[ax, BED, az], [bx, BED, bz], [bx, SURF + 0.06, bz], [ax, SURF + 0.06, az]], c2);
  };
  for (const r of K.rivers) {
    const P = resample(r.pts, 0.5), w = r.w / 2 - 0.15;
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], b = P[i];
      for (const sd of [-1, 1]) wall(a.x + a.tz * w * sd, a.z - a.tx * w * sd, b.x + b.tz * w * sd, b.z - b.tx * w * sd, i * 2 + (sd > 0));
      m.poly2([[a.x + a.tz * w, BED, a.z - a.tx * w], [b.x + b.tz * w, BED, b.z - b.tx * w], [b.x - b.tz * w, BED, b.z + b.tx * w], [a.x - a.tz * w, BED, a.z + a.tx * w]], shade(bed, 0.9 + 0.2 * hash(i, 9)));
    }
  }
  for (const k of AREA.water) {
    const pts = K.areas[k].pts;
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 0.6));
      for (let j = 0; j < n; j++) wall(a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n, a[0] + (b[0] - a[0]) * (j + 1) / n, a[1] + (b[1] - a[1]) * (j + 1) / n, k * 1000 + i * 50 + j); }
    const tris = THREE.ShapeUtils.triangulateShape(pts.map(p => new THREE.Vector2(p[0], p[1])), []);
    for (const [i0, i1, i2] of tris) m.poly2([[pts[i0][0], BED, pts[i0][1]], [pts[i1][0], BED, pts[i1][1]], [pts[i2][0], BED, pts[i2][1]]], bed);
  }
  const me = new THREE.Mesh(m.build(), MAT.world); me.receiveShadow = true; return me;
}
function riverMesh(K) {
  const m = new Merger(), c = col('#4f8ab8');
  for (const r of K.rivers) {
    const P = resample(r.pts, 1);
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], b = P[i], w = r.w / 2;
      m.poly([[a.x + a.tz * w, SURF, a.z - a.tx * w], [b.x + b.tz * w, SURF, b.z - b.tx * w], [b.x - b.tz * w, SURF, b.z + b.tx * w], [a.x - a.tz * w, SURF, a.z + a.tx * w]], c);
    }
  }
  for (const k of AREA.water) {
    const pts = K.areas[k].pts, tris = THREE.ShapeUtils.triangulateShape(pts.map(p => new THREE.Vector2(p[0], p[1])), []);
    for (const [i0, i1, i2] of tris) m.poly2([[pts[i0][0], SURF, pts[i0][1]], [pts[i1][0], SURF, pts[i1][1]], [pts[i2][0], SURF, pts[i2][1]]], c);
  }
  const mat = waterMat();
  const mesh = new THREE.Mesh(m.build(), mat); mesh.renderOrder = 2;
  return mesh;
}
export const WATER_T = { value: 0 };
export function waterMat() {
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide });
  mat.onBeforeCompile = sh => {
    sh.uniforms.uT = WATER_T;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed,1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vW; uniform float uT;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 q = floor(vW.xz * 6.0);
        float w = sin(q.x * 0.9 + uT * 1.7) + sin(q.y * 1.3 - uT * 1.3 + q.x * 0.4);
        diffuseColor.rgb += step(1.75, w) * vec3(0.35, 0.4, 0.42);
        diffuseColor.a = 0.62 + step(1.75, w) * 0.3;`);
  };
  return mat;
}


/* ------------------------------------------------------------------ tanaman */
function vegetation(K, M, occ, regionAt, veg, reserve, C) {
  const free = (x, z, r = 0.5) => M.roadDist(x, z) > r * 0.6 + 0.15 && !M.roadAt(x, z) && !M.waterAt(x, z) && !M.railAt(x, z) && !occ.get(x, z) && !occ.get(x + r, z) && !occ.get(x - r, z) && !occ.get(x, z + r) && !occ.get(x, z - r);
  // pohon dari peta (posisi tetap) -> jenis menurut wilayah
  K.trees.forEach(([x, z, rr], i) => {
    if (!free(x, z, 1) || reserve(x, z)) return;
    const reg = regionAt(x, z), r = hash(i, 77);
    let k = 'bulat', s = 0.55 + rr * 0.3;
    if (reg === 'bukit' || (!reg && z < 40)) k = r < 0.6 ? 'cemara' : 'bulat';
    else if (reg === 'kampung') k = r < 0.45 ? 'pisang' : 'bulat';
    else if (reg === 'bantaran') k = r < 0.4 ? 'bambu' : r < 0.7 ? 'kelapa' : 'pisang';
    else if (reg === 'selatan' || (!reg && z > 110)) k = r < 0.5 ? 'kelapa' : 'bulat';
    const fi = AREA.forest.find(i => inPoly(x, z, K.areas[i].pts));
    if (fi !== undefined) { const west = K.areas[fi].pts[0][0] < 130; k = west ? (r < 0.8 ? 'cemara' : 'bulat') : (r < 0.7 ? 'ketapang' : 'bulat'); }   // hutan pinus barat, hutan jati timur
    if (k !== 'bulat') s = 0.8 + rr * 0.15;
    veg.push({ k, x, z, s, a: r * 6 }); C.circle(x, z, k === 'bambu' ? 0.45 : 0.22 * s + 0.1);
    for (let j = 0; j < 3; j++) { const a = hash(i, j) * 6.28, d = 1 + hash(i, j + 5) * 1.5, X = x + Math.cos(a) * d, Z = z + Math.sin(a) * d; if (free(X, Z, 0.2)) veg.push({ k: j ? 'rumput' : 'semak', x: X, z: Z, a, s: 0.8 + hash(i, j + 9) * 0.6 }); }
  });
  // rumpun bambu & kelapa di tepi kali
  for (const r of K.rivers) resample(r.pts, 6).forEach((p, i) => {
    for (const s of [-1, 1]) { const x = p.x - p.tz * s * (r.w / 2 + 1.8), z = p.z + p.tx * s * (r.w / 2 + 1.8); if (hash(i, s + 3) < 0.45 && free(x, z, 0.8)) { const k = hash(i, s) < 0.5 ? 'bambu' : 'kelapa'; veg.push({ k, x, z, a: i, s: 0.9 }); C.circle(x, z, 0.4); } }
  });
  // sawah: rumpun padi berbaris
  for (const ai of AREA.sawah) {
    const A = K.areas[ai], an = A.angle * Math.PI / 180, ca = Math.cos(an), sa = Math.sin(an);
    let minx = 1e9, maxx = -1e9, minz = 1e9, maxz = -1e9; for (const [x, z] of A.pts) { minx = Math.min(minx, x); maxx = Math.max(maxx, x); minz = Math.min(minz, z); maxz = Math.max(maxz, z); }
    for (let x = minx; x < maxx; x += 0.8) for (let z = minz; z < maxz; z += 0.8) {
      const u = x * ca + z * sa; if (((u % 6) + 6) % 6 < 0.6) continue;   // pematang
      if (inPoly(x, z, A.pts) && free(x, z, 0)) veg.push({ k: 'padi', x: x + (hash(x * 10, z) - 0.5) * 0.2, z, a: hash(z * 10, x) * 6, s: 0.9 + hash(x, z) * 0.3 });
    }
  }
  // kebun teh di sekitar danau (barisan)
  for (let z = 3; z < 26; z += 1.3) for (let x = 192; x < 240; x += 3.4) {
    if (Math.hypot((x - 214) / 11, (z - 12) / 7) < 1 || !free(x, z, 1.6)) continue;
    veg.push({ k: 'teh', x, z, sx: 3, a: 0 });
  }
  // rumput & bunga liar di lahan kosong (tidak di jalan/rumah)
  for (let i = 0; i < 2600; i++) {
    const x = hash(i, 201) * 260, z = hash(i, 202) * 180;
    if (!free(x, z, 0.3) || reserve(x, z)) continue;
    const r = hash(i, 203);
    veg.push(r < 0.08 ? { k: 'bunga', x, z, a: r * 50, c: pick(['#f06080', '#f0d040', '#ffffff', '#c080f0'], hash(i, 204)) } : r < 0.12 ? { k: 'batu', x, z, a: r * 70, s: 0.6 + r * 4 } : r < 0.16 ? { k: 'semak', x, z, a: r * 30 } : { k: 'rumput', x, z, a: r * 90, s: 0.8 + r });
  }
}
