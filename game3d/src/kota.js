// Kota Wirabumi. Jalan, sungai, rel, sawah & lokasi penting dari peta_kota (kota.json);
// rumah DITATA ULANG di sepanjang jalan: menghadap jalan, punya halaman & akses, rapat tapi tidak acak.
import * as THREE from 'three';
import KOTA from './data/kota.json';
import { Chunks, Merger, col, shade, mix } from './geom.js';
import { FLOOR, hash, pick, inPoly, rgb, MAT, PAT, makePatterns, facade, colLocal, GLASS, GLASS2, FRAME, voxelize } from './common.js';
import { PAL, L, kampung, panggung, perum, ruko, motor, car } from './buildings.js';
import { plant } from './veg.js';

const PX = 10;   // piksel tekstur tanah per petak
// indeks area dicari dari warnanya (urutan di peta_organik.py bisa berubah)
const eqc = (a, c) => a.color[0] === c[0] && a.color[1] === c[1] && a.color[2] === c[2];
const AREA = (() => {
  const A = KOTA.areas, idx = c => A.map((a, i) => eqc(a, c) ? i : -1).filter(i => i >= 0);
  const green = idx([178, 208, 132]);
  return { water: idx([104, 160, 204]), sawah: A.map((a, i) => a.kind === 'sawah' ? i : -1).filter(i => i >= 0), forest: A.map((a, i) => a.alpha === 120 && i > 6 ? i : -1).filter(i => i >= 0),
    alun: green[0], lapangan: green[1], proyek: idx([190, 186, 176])[0], dirt: [...idx([200, 180, 150]), ...idx([180, 140, 90]), ...idx([196, 170, 120])], semen: idx([150, 150, 160]), tpu: idx([176, 186, 150]) };
})();
export const REGIONS = ['Perbukitan Utara', 'Perkampungan Kenanga', 'Pusat Kota', 'Kawasan Sekolah', 'Perumahan Bukit Asri', 'Bantaran Kali', 'Selatan'];
const REGION_KEY = ['bukit', 'kampung', 'pusat', 'sekolah', 'perum', 'bantaran', 'selatan'];
const SPECIAL = { '110,54': 'sma', '19,58': 'stasiun', '146,64': 'masjid', '114,98': 'pasar', '178,98': 'plaza', '50,131': 'gudang', '150,158': 'stm', '224,56': 'bram', '84,18': 'menara' };

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
};
function chooseType(region, road, r) {
  if (region === 'kampung') return road.kind === 'raya' ? pick(['K5', 'K2', 'K3', 'K6'], r) : pick(['K1', 'K1', 'K2', 'K2', 'K3', 'K4', 'K5', 'K6', 'K6'], r);
  if (region === 'bantaran') return 'B';
  if (region === 'perum') return road.kind === 'raya' ? null : pick(['P1', 'P2', 'P3', 'P4', 'P1', 'P3'], r);
  if (region === 'pusat') return road.kind === 'gang' ? pick(['K1', 'K2', 'K6', 'K5'], r) : pick(['R1', 'R1', 'R2', 'R3', 'R1', 'R2'], r);
  if (region === 'selatan') return road.kind !== 'raya' && r < 0.45 ? pick(['K1', 'K2', 'K4'], r * 7 % 1) : null;
  return null;
}
function plan(K, M, regionAt, occ, reserve) {
  const houses = [];
  const roads = K.roads.map((r, i) => ({ ...r, i })).filter(r => r.kind !== 'setapak' && !r.closed);
  for (const road of roads) {
    const P = resample(road.pts, 0.25), Lr = P.at(-1)?.s || 0;
    for (const side of [-1, 1]) {
      let s = 1.5 + hash(road.i, side) * 2;
      while (s < Lr - 1.5) {
        const p = P[Math.min(P.length - 1, Math.round(s / 0.25))];
        const nx = -p.tz, nz = p.tx;     // normal kiri
        const probe = [p.x + nx * side * (road.w / 2 + 3), p.z + nz * side * (road.w / 2 + 3)];
        const region = regionAt(...probe), r = hash(road.i * 131 + side, Math.round(s * 4));
        const type = chooseType(region, road, r);
        if (!type) { s += 2; continue; }
        const T = TYPES[type];
        const jitter = region === 'kampung' || region === 'bantaran' ? (hash(r * 977) - 0.5) * 0.12 : 0;
        const a = Math.atan2(-side * p.tz, -side * p.tx) + jitter;   // depan (+z lokal) menghadap jalan
        const dist = road.w / 2 + 0.35 + T.setback + T.d / 2;
        const xf = { x: p.x + nx * side * dist, z: p.z + nz * side * dist, a };
        const yb = T.yard ? 1.0 : 0.25, side_ = T.yard ? 1.0 : 0;   // halaman belakang & samping
        const fw = T.w + side_ * 2 + 0.2, fz0 = -T.d / 2 - yb, fz1 = T.d / 2 + T.setback;
        let ok = regionAt(xf.x, xf.z) === region;
        ok = ok && occ.rect(xf, 0, (fz0 + fz1) / 2, fw, fz1 - fz0 - 0.4, (x, z) => !(occ.get(x, z) || M.roadAt(x, z) || M.waterAt(x, z) || M.railAt(x, z) || reserve(x, z)));
        // jemuran/motor/pagar di samping & belakang rumah juga tidak boleh menyentuh jalan lain
        ok = ok && occ.rect(xf, 0, (fz0 + fz1) / 2 - 0.3, fw + 1.8, fz1 - fz0 - 0.6, (x, z) => M.roadDist(x, z) > 0.1);
        // akses: jalur dari pintu ke jalan harus bebas air
        ok = ok && occ.rect(xf, 0, T.d / 2 + T.setback / 2 + 0.3, 1, T.setback + 0.6, (x, z) => !M.waterAt(x, z));
        if (!ok) { s += 0.75; continue; }
        occ.rect(xf, 0, (fz0 + fz1) / 2, fw + T.gap, fz1 - fz0, (x, z) => occ.set(x, z));
        houses.push({ type, region, xf, w: T.w, d: T.d, setback: T.setback, yard: T.yard ? { w: fw, front: T.setback - 0.4, back: yb } : null, road, seed: Math.floor(r * 1e6) });
        s += T.w + T.gap + side_ * 2 + (region === 'selatan' ? 4 : 0);
      }
    }
  }
  return houses;
}

/* ------------------------------------------------------------------ cat tanah */
function paintGround(K, houses, M, specials) {
  const [W, H] = K.size, s = PX, cv = document.createElement('canvas'); cv.width = W * s; cv.height = H * s;
  const g = cv.getContext('2d'); makePatterns(g);
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
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 2; g.strokeRect(82.5 * s, 100.5 * s, 11 * s, 7 * s); g.beginPath(); g.moveTo(88 * s, 100.5 * s); g.lineTo(88 * s, 107.5 * s); g.stroke(); g.beginPath(); g.arc(88 * s, 104 * s, 1.2 * s, 0, 7); g.stroke();
  // sungai: tepi lumpur -> air bertekstur
  for (const r of K.rivers) {
    strokePath(g, r.pts, s); g.strokeStyle = '#8a8466'; g.lineWidth = (r.w + 1.6) * s; g.stroke();
    g.strokeStyle = '#6e7a68'; g.lineWidth = (r.w + 0.7) * s; g.stroke();
    g.strokeStyle = PAT.water; g.lineWidth = r.w * s; g.stroke();
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
    if (h.yard) { quad(h.xf, 0, (d / 2 + setback - 0.4 - d / 2 - h.yard.back) / 2, h.yard.w, d + setback - 0.4 + h.yard.back, PAT.lawn); quad(xf, type === 'P1' ? w / 2 + 0.6 : 0, d / 2 + setback / 2, 2.2, setback + 0.8, PAT.paving); }
    else if (type[0] === 'R') quad(xf, 0, d / 2 + setback / 2 + 0.2, w + 0.02, setback + 0.8, PAT.tile);
    else { quad(xf, 0, 0, w + 0.4, d + 0.4, PAT.semen); quad(xf, 0, d / 2 + setback / 2 + 0.2, Math.min(1.4, w * 0.4), setback + 0.8, type === 'B' ? PAT.dirt : PAT.semen); }
  }
  for (const b of Object.values(specials)) { const xf = { x: b.x, z: b.y, a: b.a }; quad(xf, 0, 0, b.w + 3, b.h + 3, b.pave || PAT.paving); }
  // JALAN: selokan (kampung) -> bahu -> permukaan bertekstur -> marka
  for (const r of K.roads) if (r.kind === 'gang' || r.kind === 'jalan') { strokePath(g, r.pts, s); g.strokeStyle = '#4e5a5a'; g.lineWidth = (r.w + 1.0) * s; g.stroke(); g.strokeStyle = '#a8a49a'; g.lineWidth = (r.w + 0.55) * s; g.stroke(); }
  for (const r of K.roads) if (r.kind === 'raya') { strokePath(g, r.pts, s); g.strokeStyle = '#8a8a86'; g.lineWidth = (r.w + 0.7) * s; g.stroke(); }
  for (const r of K.roads) if (r.kind === 'setapak') { strokePath(g, r.pts, s); g.strokeStyle = '#a89068'; g.lineWidth = (r.w + 0.3) * s; g.stroke(); }
  const surf = { raya: PAT.asphalt, jalan: PAT.asphaltLight, gang: PAT.conblock, setapak: PAT.dirt };
  for (const kind of ['setapak', 'gang', 'jalan', 'raya']) for (const r of K.roads) if (r.kind === kind) { strokePath(g, r.pts, s); g.strokeStyle = surf[kind]; g.lineWidth = r.w * s; g.stroke(); }
  // marka di lapisan sendiri, lalu dihapus di setiap simpang/perpotongan supaya tidak menembus jalan lain
  const mk = document.createElement('canvas'); mk.width = cv.width; mk.height = cv.height;
  const gm = mk.getContext('2d'); gm.lineCap = 'butt'; gm.lineJoin = 'round';
  for (const r of K.roads) {
    if (r.kind === 'raya') {
      gm.strokeStyle = '#ecebe2'; gm.lineWidth = 2; for (const o of [-1, 1]) { strokeOffset(gm, r.pts, o * (r.w / 2 - 0.3), s); gm.stroke(); }
      strokePath(gm, r.pts, s); gm.lineWidth = 2; gm.setLineDash([1.5 * s, 1.5 * s]); gm.stroke(); gm.setLineDash([]);
    } else if (r.kind === 'jalan') { strokePath(gm, r.pts, s); gm.strokeStyle = 'rgba(240,236,220,0.8)'; gm.lineWidth = 1.5; gm.setLineDash([1 * s, 1.4 * s]); gm.stroke(); gm.setLineDash([]); }
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
  for (const b of K.bldgs) { const sp = SPECIAL[Math.round(b.x) + ',' + Math.round(b.y)]; if (sp) specials[sp] = { ...b }; }
  // geser bangunan kunci sedikit kalau tapaknya (plus pelataran 1 petak) menyentuh permukaan jalan
  const clearOf = (b, x, y) => { const c = Math.cos(b.a), sn = Math.sin(b.a); for (let u = -b.w / 2 - 1; u <= b.w / 2 + 1; u += 0.5) for (let v = -b.h / 2 - 1; v <= b.h / 2 + 1; v += 0.5) if (M.roadDist(x + u * c - v * sn, y + u * sn + v * c) < 0.15) return false; return true; };
  for (const [name, b] of Object.entries(specials)) {
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
  const houses = plan(K, M, regionAt, occ, reserve);
  // rumah kunci: Om Darto + gerobak Warkop Simpang (lv1) = rumah kampung terdekat ke penanda no. 3, musala kampung
  const kh = houses.filter(h => h.region === 'kampung');
  const near = (x, z) => kh.slice().sort((a, b) => Math.hypot(a.xf.x - x, a.xf.z - z) - Math.hypot(b.xf.x - x, b.xf.z - z));
  const darto = near(46, 86).find(h => h.w >= 4 && h.road.kind !== 'raya') || near(46, 86).find(h => h.w >= 4); if (darto) { darto.type = 'K2'; darto.special = 'darto'; }
  const musala = near(30, 100).find(h => h !== darto && h.w >= 4); if (musala) musala.special = 'musala';

  // tanah
  const tex = new THREE.CanvasTexture(paintGround(K, houses, M, specials));
  tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = 4;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshLambertMaterial({ map: tex }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(W / 2, 0, H / 2); ground.receiveShadow = true; scene.add(ground);
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(900, 700), new THREE.MeshLambertMaterial({ color: new THREE.Color('#9cbc78') }));
  outer.rotation.x = -Math.PI / 2; outer.position.set(W / 2, -0.03, H / 2); scene.add(outer);
  C.box(W / 2, -1, W / 2 + 2, 1); C.box(W / 2, H + 1, W / 2 + 2, 1); C.box(-1, H / 2, 1, H / 2 + 2); C.box(W + 1, H / 2, 1, H / 2 + 2);

  const ch = new Chunks(32), veg = [];
  // rumah
  globalThis.__TRACE = globalThis.__TRACEON ? [] : null;
  for (const h of houses) {
    const m = ch.at(h.xf.x, h.xf.z), r = k => hash(h.seed, k);
    const o = { seed: h.seed, veg, C, w: h.w, d: h.d, yard: h.yard };
    if (h.special === 'darto') { kampung(m, h.xf, 'K2', { ...o, wall: '#b8d0a8', roof: '#a8523a', accent: '#7a4a2a', darto: true }); gerobak(m, h.xf, C); continue; }
    if (h.special === 'musala') { musalaKampung(m, h.xf, C); continue; }
    if (h.region === 'bantaran') panggung(m, h.xf, { ...o, wall: pick(PAL.bantaran.wall, r(1)), roof: pick(PAL.bantaran.roof, r(2)) });
    else if (h.type[0] === 'K') kampung(m, h.xf, h.type, { ...o, wall: pick(PAL.kampung.wall, r(1)), roof: pick(PAL.kampung.roof, r(2)), accent: pick(PAL.kampung.accent, r(3)) });
    else if (h.type[0] === 'P') perum(m, h.xf, h.type, { ...o, wall: pick(PAL.perum.wall, r(1)), roof: pick(PAL.perum.roof, r(2)) });
    else ruko(m, h.xf, h.type, { ...o, wall: pick(PAL.ruko.wall, r(1)), sign: pick(PAL.ruko.sign, r(2)), canopy: pick(PAL.ruko.canopy, r(3)) });
  }
  specialBuildings(ch, specials, C, veg, M);
  streetStuff(ch, K, M, C, veg, regionAt, occ, houses);
  if (globalThis.__TRACE) { globalThis.__ROAD = globalThis.__TRACE.filter(t => t.p.some(([x, , z]) => M.roadDist(x, z) < -0.12 && !M.waterAt(x, z) && x > 0 && z > 0 && x < W && z < H)); globalThis.__TRACE = null; }
  for (const m of ch.meshes(MAT.world)) scene.add(m);
  const water = riverMesh(K); scene.add(water);
  // tanaman
  vegetation(K, M, occ, regionAt, veg, reserve, C);
  if (globalThis.__TRACEON) globalThis.__VEGROAD = veg.filter(v => M.roadDist(v.x, v.z) < 0.1).map(v => v.k);
  plant(scene, veg);
  return {
    regionAt: (x, z) => { const r = regionAt(x, z); return r ? REGIONS[REGION_KEY.indexOf(r)] : 'Wirabumi'; },
    regionKey: regionAt,
    marks: K.marks.map(m => ({ ...m, name: m.desc.replace(/\s*\(.*$/, '') })),
    houses, darto, groundTex: tex.image, water, smaShift: { x: specials.sma?.dx || 0, z: specials.sma?.dy || 0 },
  };
}

/* ------------------------------------------------------------------ bangunan kunci */
function gerobak(m, hxf, C) {   // Warkop Simpang lv1: gerobak kayu kuning "KOPI" di depan rumah Om Darto
  const [x, z] = L(hxf, 0.75, 1.85), xf = { x, z, a: hxf.a };   // di teras, tidak makan jalan
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
    // peron beratap di samping: dipendekkan kalau ujungnya menyentuh jalan
    let Lp = 8; const okAt = u => [-1.6, 0, 1.6].every(v => { const [x, z] = L(xf, -b.w / 2 - u, v); return M.roadDist(x, z) > 0.1; });
    while (Lp > 2 && !okAt(Lp)) Lp -= 1;
    const np = Math.max(1, Math.floor(Lp / 2));
    m.box(xf, -b.w / 2 - Lp / 2, 0, 0, Lp, 0.4, 3, col('#b8b0a0'));
    for (let i = 0; i < np; i++) m.box(xf, -b.w / 2 - 1 - i * 2, 0.4, 0, 0.15, 1.8, 0.15, col('#4a4a50'));
    m.box(xf, -b.w / 2 - Lp / 2, 2.2, 0, Lp, 0.1, 3.2, col('#5a7aa8'));
    cl(xf, 0, 0, b.w, b.h); for (let i = 0; i < np; i++) cl(xf, -b.w / 2 - 1 - i * 2, 0, 0.2, 0.2);
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
    motor(m, { ...xf, ...Object.fromEntries([['x', L(xf, -2.5, b.h / 2 + 1)[0]], ['z', L(xf, -2.5, b.h / 2 + 1)[1]]]), a: xf.a + 0.3 }, '#2a2a2e');
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
    m.box(xf, w / 2 + 2.2, 0, 0, 3.2, 0.12, d, col('#e8e4dc')); m.box(xf, w / 2 + 2.2, 0.12, 0, 2.6, 0.02, d - 0.6, col('#4aa8d8'));   // kolam renang
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

/* ------------------------------------------------------------------ jalanan: kanstin, trotoar, jembatan, tiang listrik, lampu */
function streetStuff(ch, K, M, C, veg, regionAt, occ, houses) {
  const curb = col('#d8d6ce'), curb2 = col('#c83a3a');
  for (const road of K.roads) {
    if (road.kind === 'setapak') continue;
    const P = resample(road.pts, 0.5);
    const bridgeC = road.kind === 'gang' ? col('#b89a5a') : col('#3a6aa8');
    let poleNext = 4 + hash(road.pts.length) * 4, lampNext = 6, lastPole = null;
    for (let i = 0; i < P.length; i++) {
      const p = P[i], nx = -p.tz, nz = p.tx, a = Math.atan2(p.tz, p.tx), reg = regionAt(p.x, p.z);
      const water = M.waterAt(p.x, p.z);
      if (water) {   // jembatan: lantai beton + pagar (besi biru / bambu)
        const m = ch.at(p.x, p.z), xf = { x: p.x, z: p.z, a };
        m.box(xf, 0, -0.05, 0, 0.55, 0.12, road.w + 0.5, col('#a8a49a'));
        for (const s of [-1, 1]) { const [qx, qz] = [p.x + nx * s * (road.w / 2 + 0.15), p.z + nz * s * (road.w / 2 + 0.15)]; if (M.roadDist(qx, qz) < 0) continue; m.box(xf, 0, 0.07, s * (road.w / 2 + 0.15), 0.52, 0.12, 0.2, col('#9a968c')); m.box(xf, 0, 0.19, s * (road.w / 2 + 0.15), 0.08, 0.6, 0.08, bridgeC); m.box(xf, 0, 0.75, s * (road.w / 2 + 0.15), 0.55, 0.06, 0.08, bridgeC); colLocal(C, xf, 0, s * (road.w / 2 + 0.2), 0.55, 0.15); }
        continue;
      }
      // kanstin putih / merah-putih di jalan raya & jalan, trotoar di pusat kota
      if ((road.kind === 'raya' || road.kind === 'jalan') && i % 1 === 0) for (const s of [-1, 1]) {
        const off = road.w / 2 + 0.05, x = p.x + nx * s * off, z = p.z + nz * s * off;
        if (M.roadAt(x + nx * s * 0.6, z + nz * s * 0.6) || M.waterAt(x, z) || M.roadDist(x, z) < -0.01 || M.roadDist(x + p.tx * 0.3, z + p.tz * 0.3) < -0.01 || M.roadDist(x - p.tx * 0.3, z - p.tz * 0.3) < -0.01 || M.roadDist(x + nx * s * 0.8, z + nz * s * 0.8) < 0.05) continue;   // simpang: tanpa kanstin
        const m = ch.at(x, z), xf = { x, z, a };
        const walk = reg === 'pusat' && road.kind === 'raya';
        if (walk) { m.box({ x: x + nx * s * 0.8, z: z + nz * s * 0.8, a }, 0, 0, 0, 0.52, 0.1, 1.5, col(i % 2 ? '#bcb8ae' : '#c4c0b6')); }
        m.box(xf, 0, 0, 0, 0.52, walk ? 0.14 : 0.1, 0.16, (i % 5 === 0 ? shade(curb, 0.92) : curb));
      }
      // selokan beton di tepi gang kampung/bantaran
      if (road.kind === 'gang' && (reg === 'kampung' || reg === 'bantaran' || reg === 'pusat') && i % 1 === 0) for (const s of [-1, 1]) {
        const off = road.w / 2 + 0.5, x = p.x + nx * s * off, z = p.z + nz * s * off;
        if (M.roadAt(x, z) || M.waterAt(x, z) || M.roadDist(x, z) < 0.05) continue;
        ch.at(x, z).box({ x: x + nx * s * 0.2, z: z + nz * s * 0.2, a }, 0, 0, 0, 0.52, 0.08, 0.08, col('#9a968c'));
        if (i % 8 === 0) ch.at(x, z).box({ x, z, a }, 0, 0, 0, 0.5, 0.05, 0.45, col('#a8a49a'));   // tutup selokan
      }
      // tiang listrik + kabel (kampung, bantaran, pusat)
      if (p.s >= poleNext && road.kind !== 'raya' && (reg === 'kampung' || reg === 'bantaran' || reg === 'pusat' || reg === 'selatan')) {
        const off = road.w / 2 + 0.75, x = p.x + nx * off, z = p.z + nz * off;
        if (!M.roadAt(x, z) && !M.waterAt(x, z) && !occ.get(x, z) && M.roadDist(x, z) > 0.3) {
          const m = ch.at(x, z), xf = { x, z, a };
          m.box(xf, 0, 0, 0, 0.16, 4.2, 0.16, col('#7a7a80')); m.box(xf, 0, 3.9, 0, 0.1, 0.08, 0.9, col('#5a5a60'));
          m.box(xf, 0, 3.6, 0.3, 0.28, 0.36, 0.22, col('#5a6a5a'));
          C.circle(x, z, 0.14);
          if (lastPole && Math.hypot(lastPole.x - x, lastPole.z - z) < 14) for (const o of [-0.4, 0.4]) {
            const ax = lastPole.x + Math.cos(lastPole.a + Math.PI / 2) * o, az = lastPole.z + Math.sin(lastPole.a + Math.PI / 2) * o;
            const bx = x + Math.cos(a + Math.PI / 2) * o, bz = z + Math.sin(a + Math.PI / 2) * o, l = Math.hypot(bx - ax, bz - az);
            const mm = ch.at((ax + bx) / 2, (az + bz) / 2), ca = Math.atan2(bz - az, bx - ax);
            for (let k = 0; k < 4; k++) { const t = (k + 0.5) / 4, sag = Math.sin(t * Math.PI) * 0.35; mm.box({ x: ax + (bx - ax) * t, z: az + (bz - az) * t, a: ca }, 0, 3.93 - sag, 0, l / 4 + 0.05, 0.03, 0.03, col('#1e1e22')); }
          }
          lastPole = { x, z, a };
        }
        poleNext += 9;
      }
      // lampu jalan raya (selang-seling)
      if (road.kind === 'raya' && !road.closed && p.s >= lampNext) {
        lampNext += 11;
        const s = Math.floor(lampNext / 11) % 2 ? 1 : -1, off = road.w / 2 + (reg === 'pusat' ? 1.3 : 0.6), x = p.x + nx * s * off, z = p.z + nz * s * off;
        if (!M.waterAt(x, z) && !M.roadAt(x, z) && !occ.get(x, z) && M.roadDist(x, z) > 0.3) {
          const m = ch.at(x, z), xf = { x, z, a: Math.atan2(-nz * s, -nx * s) };
          m.box(xf, 0, 0, 0, 0.14, 3.4, 0.14, col('#5a5a60')); m.box(xf, 0.5, 3.3, 0, 1.0, 0.08, 0.1, col('#5a5a60')); m.box(xf, 0.95, 3.18, 0, 0.34, 0.12, 0.24, col('#fff2b0'));
          C.circle(x, z, 0.12);
          if (reg === 'pusat') veg.push({ k: 'bulat', x: x + p.tx * 5, z: z + p.tz * 5, a: 0, s: 0.6 });   // pohon peneduh trotoar
        }
      }
    }
  }
  // lampu merah di simpang Jl. Raya - Jl. Merdeka & Jl. Raya - jalan selatan
  for (const [x, z, a] of [[131.5, 87.5, 0], [104.5, 91, Math.PI]]) {
    const m = ch.at(x, z), xf = { x, z, a };
    m.box(xf, 0, 0, 0, 0.16, 3.2, 0.16, col('#3a3a40')); m.box(xf, -0.8, 3.0, 0, 1.6, 0.1, 0.1, col('#3a3a40'));
    m.box(xf, -1.5, 2.4, 0, 0.3, 0.8, 0.3, col('#2a2a2e')); for (const [y, c] of [[2.95, '#e23a2a'], [2.72, '#3a3a2a'], [2.49, '#2a3a2a']]) m.box(xf, -1.5, y, 0.16, 0.18, 0.16, 0.02, col(c));
    C.circle(x, z, 0.14);
  }
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
function riverMesh(K) {
  const m = new Merger(), c = col('#4f8ab8');
  for (const r of K.rivers) {
    const P = resample(r.pts, 1);
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], b = P[i], w = r.w / 2 + 0.1;
      m.poly([[a.x + a.tz * w, 0.04, a.z - a.tx * w], [b.x + b.tz * w, 0.04, b.z - b.tx * w], [b.x - b.tz * w, 0.04, b.z + b.tx * w], [a.x - a.tz * w, 0.04, a.z + a.tx * w]], c);
    }
  }
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false });
  mat.onBeforeCompile = sh => {
    sh.uniforms.uT = WATER_T;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed,1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vW; uniform float uT;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 q = floor(vW.xz * 6.0);
        float w = sin(q.x * 0.9 + uT * 1.7) + sin(q.y * 1.3 - uT * 1.3 + q.x * 0.4);
        diffuseColor.rgb += step(1.75, w) * vec3(0.35, 0.4, 0.42);
        diffuseColor.a = 0.5 + step(1.75, w) * 0.3;`);
  };
  const mesh = new THREE.Mesh(m.build(), mat); mesh.renderOrder = 2;
  return mesh;
}
export const WATER_T = { value: 0 };

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
