// Dunia: Kota Wirabumi (dari peta_kota) + kompleks SMA Negeri 3 (dari peta_sekolah).
// Satuan dunia = 1 petak (32 voxel). Peta: x ke timur, y ke selatan -> dunia X = x, Z = y.
import * as THREE from 'three';
import KOTA from './data/kota.json';
import { Merger, Chunks, col, shade, mix } from './geom.js';

export const FLOOR = 56 / 32;          // tinggi 1 lantai (52 dinding + 4 plat)
export const SCHOOL_OX = 400;           // kompleks sekolah ditaruh di sini (scene terpisah, satu dunia)
const PX = 8;                           // piksel tekstur tanah per petak

const hash = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const pick = (arr, r) => arr[Math.floor(r * arr.length) % arr.length];
const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

function inPoly(x, y, pts) {
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}

/* ------------------------------------------------------------------ tabrakan */
export class Collision {
  constructor() { this.cell = 8; this.grid = new Map(); this.masks = []; }
  _add(o, x0, z0, x1, z1) {
    const c = this.cell;
    for (let gx = Math.floor(x0 / c); gx <= Math.floor(x1 / c); gx++)
      for (let gz = Math.floor(z0 / c); gz <= Math.floor(z1 / c); gz++) {
        const k = gx * 4096 + gz; let a = this.grid.get(k); if (!a) this.grid.set(k, a = []); a.push(o);
      }
  }
  box(x, z, hw, hd, a = 0) {   // kotak berputar (OBB)
    const o = { t: 0, x, z, hw, hd, c: Math.cos(a), s: Math.sin(a) };
    const r = Math.hypot(hw, hd); this._add(o, x - r, z - r, x + r, z + r);
  }
  circle(x, z, r) { const o = { t: 1, x, z, r }; this._add(o, x - r, z - r, x + r, z + r); }
  // mask: { ox, oz, res, w, h, data(Uint8: 1 = tidak bisa dilewati) }
  mask(m) { this.masks.push(m); }
  blockedMask(x, z) {
    for (const m of this.masks) {
      const i = Math.floor((x - m.ox) * m.res), j = Math.floor((z - m.oz) * m.res);
      if (i < 0 || j < 0 || i >= m.w || j >= m.h) continue;
      if (m.data[j * m.w + i]) return true;
    }
    return false;
  }
  // dorong lingkaran (x,z,r) keluar dari semua penghalang; mengembalikan posisi baru
  resolve(p, r) {
    const c = this.cell, gx = Math.floor(p.x / c), gz = Math.floor(p.z / c);
    for (let it = 0; it < 2; it++)
      for (let ix = gx - 1; ix <= gx + 1; ix++) for (let iz = gz - 1; iz <= gz + 1; iz++) {
        const a = this.grid.get(ix * 4096 + iz); if (!a) continue;
        for (const o of a) {
          if (o.t === 1) {
            const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz), m = o.r + r;
            if (d < m && d > 1e-6) { p.x = o.x + dx / d * m; p.z = o.z + dz / d * m; }
          } else {
            const dx = p.x - o.x, dz = p.z - o.z;
            const lx = dx * o.c + dz * o.s, lz = -dx * o.s + dz * o.c;   // ke ruang lokal kotak
            const qx = Math.max(-o.hw, Math.min(o.hw, lx)), qz = Math.max(-o.hd, Math.min(o.hd, lz));
            let ex = lx - qx, ez = lz - qz, d = Math.hypot(ex, ez);
            if (d >= r) continue;
            let nx, nz, push;
            if (d > 1e-6) { nx = ex / d; nz = ez / d; push = r - d; }
            else {   // pusat di dalam kotak: keluar lewat sisi terdekat
              const px = o.hw - Math.abs(lx), pz = o.hd - Math.abs(lz);
              if (px < pz) { nx = Math.sign(lx) || 1; nz = 0; push = px + r; } else { nx = 0; nz = Math.sign(lz) || 1; push = pz + r; }
            }
            p.x += (nx * o.c - nz * o.s) * push; p.z += (nx * o.s + nz * o.c) * push;
          }
        }
      }
    return p;
  }
}

/* ------------------------------------------------------------------ bahan */
export const MAT = {
  world: new THREE.MeshLambertMaterial({ vertexColors: true }),
};

/* ------------------------------------------------------------------ tanah kota */
const GC = {
  grass: [164, 192, 124], grass2: [150, 182, 112], water: [104, 160, 204], waterE: [80, 130, 170],
  raya: [98, 100, 106], rayaE: [70, 70, 74], jalan: [128, 126, 122], gang: [176, 166, 146], gangE: [140, 130, 110],
  tanah: [196, 172, 128], sawahLine: [120, 160, 80], rail: [84, 72, 62], ballast: [150, 140, 120],
};
function strokePath(g, pts, s) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x * s, y * s) : g.moveTo(x * s, y * s)); }

function paintKota(K) {
  const [W, H] = K.size, cv = document.createElement('canvas'); cv.width = W * PX; cv.height = H * PX;
  const g = cv.getContext('2d'), s = PX;
  g.fillStyle = rgb(GC.grass); g.fillRect(0, 0, cv.width, cv.height);
  // tekstur rumput: bintik-bintik (seed tetap)
  for (let i = 0; i < W * H * 1.2; i++) {
    const x = hash(i, 1) * cv.width, y = hash(i, 2) * cv.height, r = hash(i, 3);
    g.fillStyle = r < 0.5 ? rgba(GC.grass2, 0.55) : rgba([178, 204, 134], 0.45);
    g.fillRect(x | 0, y | 0, 1 + (r * 3 | 0), 1 + (hash(i, 4) * 2 | 0));
  }
  K.areas.forEach((a, i) => {
    if (i <= 6 && i > 0) return;   // tint wilayah: tidak digambar di dunia 3D (hanya untuk peta)
    g.fillStyle = rgba(a.color, a.alpha / 255);
    strokePath(g, a.pts, s); g.closePath(); g.fill();
    if (a.kind === 'sawah') {      // garis pematang
      g.save(); strokePath(g, a.pts, s); g.closePath(); g.clip();
      g.strokeStyle = rgb(GC.sawahLine); g.lineWidth = 2;
      const an = a.angle * Math.PI / 180, cx = a.pts[0][0] * s, cy = a.pts[0][1] * s;
      for (let k = -120; k < 120; k += 3) {
        g.beginPath();
        g.moveTo(cx - 800 * Math.cos(an) - k * s * Math.sin(an), cy - 800 * Math.sin(an) + k * s * Math.cos(an));
        g.lineTo(cx + 800 * Math.cos(an) - k * s * Math.sin(an), cy + 800 * Math.sin(an) + k * s * Math.cos(an)); g.stroke();
      }
      g.restore();
    }
    if (i === 7) { g.strokeStyle = rgb(GC.waterE); g.lineWidth = 3; g.stroke(); }   // danau
  });
  g.lineCap = g.lineJoin = 'round';
  for (const r of K.rivers) {
    strokePath(g, r.pts, s); g.strokeStyle = rgb(GC.waterE); g.lineWidth = (r.w + 1) * s; g.stroke();
    g.strokeStyle = rgb(GC.water); g.lineWidth = r.w * s; g.stroke();
    // riak air
    g.strokeStyle = 'rgba(180,215,240,0.35)'; g.lineWidth = 2; g.setLineDash([6, 22]); g.stroke(); g.setLineDash([]);
  }
  for (const r of K.rails) {
    strokePath(g, r.pts, s); g.strokeStyle = rgb(GC.ballast); g.lineWidth = 2.2 * s; g.stroke();
    g.strokeStyle = rgb(GC.rail); g.lineWidth = 1.6 * s; g.setLineDash([3, 7]); g.stroke(); g.setLineDash([]);
  }
  const fill = { raya: GC.raya, jalan: GC.jalan, gang: GC.gang, setapak: GC.tanah };
  const edge = { raya: GC.rayaE, jalan: GC.jalan.map(v => v * .75 | 0), gang: GC.gangE, setapak: GC.tanah.map(v => v * .8 | 0) };
  for (const r of K.roads) { strokePath(g, r.pts, s); g.strokeStyle = rgb(edge[r.kind]); g.lineWidth = (r.w + 0.6) * s; g.stroke(); }
  for (const r of K.roads) { strokePath(g, r.pts, s); g.strokeStyle = rgb(fill[r.kind]); g.lineWidth = r.w * s; g.stroke(); }
  for (const r of K.roads) if (r.kind === 'raya') {
    strokePath(g, r.pts, s); g.strokeStyle = 'rgb(236,232,200)'; g.lineWidth = 2; g.setLineDash([1.2 * s, 1.4 * s]); g.stroke(); g.setLineDash([]);
  }
  // lapangan basket umum (taman kota, no. 18)
  court(g, s, 123, 42.5, 8, 6);
  return cv;
}
function court(g, s, x, y, w, h, color = 'rgb(196,120,84)') {
  g.fillStyle = color; g.fillRect(x * s, y * s, w * s, h * s);
  g.strokeStyle = 'rgba(250,250,240,0.9)'; g.lineWidth = 1.5; g.strokeRect(x * s + 2, y * s + 2, w * s - 4, h * s - 4);
  g.beginPath(); g.moveTo((x + w / 2) * s, y * s + 2); g.lineTo((x + w / 2) * s, (y + h) * s - 2); g.stroke();
  g.beginPath(); g.arc((x + w / 2) * s, (y + h / 2) * s, 0.9 * s, 0, Math.PI * 2); g.stroke();
}

// mask jalan & air (4 sel per petak) untuk tabrakan dan arah pintu rumah
function maskKota(K) {
  const res = 4, [W, H] = K.size, cv = document.createElement('canvas'); cv.width = W * res; cv.height = H * res;
  const g = cv.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height); g.lineCap = g.lineJoin = 'round';
  g.fillStyle = '#00f'; strokePath(g, K.areas[7].pts, res); g.closePath(); g.fill();
  for (const r of K.rivers) { strokePath(g, r.pts, res); g.strokeStyle = '#00f'; g.lineWidth = r.w * res; g.stroke(); }
  const waterOnly = g.getImageData(0, 0, cv.width, cv.height).data;
  for (const r of K.roads) { strokePath(g, r.pts, res); g.strokeStyle = '#f00'; g.lineWidth = r.w * res; g.stroke(); }
  const d = g.getImageData(0, 0, cv.width, cv.height).data;
  const n = cv.width * cv.height, block = new Uint8Array(n), road = new Uint8Array(n), water = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    road[i] = d[i * 4] > 128 ? 1 : 0;
    water[i] = waterOnly[i * 4 + 2] > 128 ? 1 : 0;
    block[i] = d[i * 4 + 2] > 128 && !road[i] ? 1 : 0;
  }
  const at = (arr, x, z) => { const i = Math.floor(x * res), j = Math.floor(z * res); return i >= 0 && j >= 0 && i < cv.width && j < cv.height ? arr[j * cv.width + i] : 0; };
  return { block: { ox: 0, oz: 0, res, w: cv.width, h: cv.height, data: block }, roadAt: (x, z) => at(road, x, z), waterAt: (x, z) => at(water, x, z) };
}

/* ------------------------------------------------------------------ bangunan */
const PAL = {
  kampung: { wall: ['#e8d8b8', '#b8d8b0', '#a8c8d8', '#e8b8b0', '#f0d890', '#b06a4a', '#e8d8b8'], accent: ['#2f6a4a', '#2a5a8a'] },
  bantaran: { wall: ['#9a7a56', '#c8b088', '#8a9098'], accent: ['#6a4a30'] },
  perum: { wall: ['#f2eee6', '#c8c2b8', '#e6dcc8'], accent: ['#8a5a34'] },
  ruko: { wall: ['#e0dcd2', '#bcbab4', '#ece2c4'], accent: ['#c83a3a', '#2a6ac0', '#f2c230', '#2f8a5a', '#8a3ab0'] },
  selatan: { wall: ['#a8a8a4', '#c8c0b0'], accent: ['#3a6aa8'] },
};
const ROOF_PERUM = ['92,104,128', '120,80,72', '70,90,80', '140,120,100'], ROOF_RUKO = ['210,200,186', '190,186,180', '220,210,190'];
const GLASS = col('#3a4a5a'), GLASS2 = col('#6a8aa8'), FRAME = col('#f2eee6'), PLINTH = col('#8a8478');

// jendela + pintu di satu sisi bangunan. side: 0 = +z, 1 = -z, 2 = +x, 3 = -x (lokal)
function facade(m, xf, w, d, side, floors, o) {
  const along = side < 2 ? w : d, half = side < 2 ? d / 2 : w / 2;
  const put = (u, y, sw, sh, c, dep = 0.06) => {
    const off = half + dep / 2 - 0.02;
    if (side === 0) m.box(xf, u, y, off, sw, sh, dep, c);
    else if (side === 1) m.box(xf, -u, y, -off, sw, sh, dep, c);
    else if (side === 2) m.box(xf, off, y, -u, dep, sh, sw, c);
    else m.box(xf, -off, y, u, dep, sh, sw, c);
  };
  const n = Math.max(1, Math.floor(along / (o.spacing || 1.5)));
  for (let f = 0; f < floors; f++) {
    for (let i = 0; i < n; i++) {
      const u = -along / 2 + (i + 0.5) * along / n;
      if (f === 0 && o.door && i === Math.floor(n / 2)) {
        if (o.rolling) { put(u, 0, Math.min(along / n - 0.2, 2.4), 1.4, col('#9aa0a6')); put(u, 1.42, Math.min(along / n - 0.1, 2.6), 0.08, shade(col('#9aa0a6'), 0.7), 0.1); }
        else { put(u, 0, 0.5, 1.38, o.doorC); put(u, 1.38, 0.62, 0.08, FRAME); }
        continue;
      }
      const y = f * FLOOR + 0.56;
      put(u, y - 0.05, (o.ww || 0.62) + 0.1, 0.84, FRAME, 0.05);
      put(u, y, o.ww || 0.62, 0.74, o.glass || GLASS, 0.07);
    }
  }
}

function house(ch, b, kind, region, ctx) {
  const r = hash(Math.round(b.x * 10), Math.round(b.y * 10));
  const m = ch.at(b.x, b.y), xf = { x: b.x, z: b.y, a: b.a };
  let w = b.w, d = b.h;
  const pal = PAL[kind === 'kampung' && (region === 'bantaran' || region === 'selatan') ? region : kind] || PAL.kampung;
  let wall = col(pick(pal.wall, r)), accent = col(pick(pal.accent, hash(r * 999)));
  const roofC = col(b.color);
  let floors = kind === 'ruko' ? 2 + (r > 0.6 ? 1 : 0) : kind === 'perum' ? 2 : (r > 0.86 && Math.min(w, d) > 2.4 ? 2 : 1);
  if (region === 'bantaran') floors = 1;
  const stilt = region === 'bantaran' && hash(r * 31) < 0.5 ? 0.6 : 0;
  const Hh = floors * FLOOR;
  // sisi yang menghadap jalan = pintu
  let side = 0, best = 99;
  const sides = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  sides.forEach(([sx, sz], i) => {
    for (let k = 0.6; k < 3.5; k += 0.5) {
      const lx = sx * (w / 2 + k), lz = sz * (d / 2 + k);
      const X = b.x + lx * Math.cos(b.a) - lz * Math.sin(b.a), Z = b.y + lx * Math.sin(b.a) + lz * Math.cos(b.a);
      if (ctx.roadAt(X, Z)) { if (k < best) { best = k; side = i; } break; }
    }
  });
  if (stilt) { // rumah panggung bantaran
    for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) m.box(xf, px * (w / 2 - 0.15), 0, pz * (d / 2 - 0.15), 0.18, stilt, 0.18, col('#6a4a30'));
  }
  const y0 = stilt;
  const xfw = { ...xf, y: y0 };
  m.box(xfw, 0, 0, 0, w, 0.15, d, kind === 'perum' ? col('#8a8478') : shade(wall, 0.7));
  m.box(xfw, 0, 0.15, 0, w, Hh - 0.15, d, wall);
  facade(m, xfw, w, d, side, floors, { door: true, doorC: accent, rolling: kind === 'ruko', glass: kind === 'perum' ? GLASS2 : GLASS, ww: kind === 'perum' ? 0.9 : 0.62, spacing: kind === 'perum' ? 1.8 : 1.5 });
  facade(m, xfw, w, d, side ^ 1, floors, { spacing: 1.7 });
  if (kind === 'ruko') {
    m.box(xfw, 0, Hh, 0, w, 0.12, d, shade(wall, 1.05));                          // plat atap
    for (const [lx, lz, sx, sz] of [[0, d / 2 - 0.06, w, 0.12], [0, -d / 2 + 0.06, w, 0.12], [w / 2 - 0.06, 0, 0.12, d], [-w / 2 + 0.06, 0, 0.12, d]])
      m.box(xfw, lx, Hh + 0.12, lz, sx, 0.3, sz, shade(wall, 0.9));               // dinding pembatas atap
    // papan nama + kanopi seng di sisi jalan
    const sign = col(pick(PAL.ruko.accent, hash(r * 77))), canopy = col(pick(['#c8503a', '#3a7ac0', '#3a9a6a', '#d8a83a'], hash(r * 55)));
    const [sx, sz] = sides[side], along = side < 2 ? w : d, half = side < 2 ? d / 2 : w / 2;
    const P = (k, y, sw, sh, dep, c) => side < 2 ? m.box(xfw, 0, y, sz * (half + k), sw, sh, dep, c) : m.box(xfw, sx * (half + k), y, 0, dep, sh, sw, c);
    P(0.08, FLOOR - 0.15, along * 0.9, 0.42, 0.12, sign);
    P(0.5, 1.5, along, 0.06, 0.9, canopy);
  } else if (kind === 'perum') {
    m.hip(xfw, 0, Hh, 0, w, d, Math.min(1.6, Math.min(w, d) * 0.4), roofC);
  } else {
    // pelana: bubungan sejajar sisi terpanjang
    const rh = Math.min(1.3, Math.min(w, d) * 0.36);
    if (w >= d) m.gable(xfw, 0, Hh, 0, w, d, rh, roofC, 0.22, wall);
    else m.gable({ ...xfw, a: b.a + Math.PI / 2, c: undefined, s: undefined }, 0, Hh, 0, d, w, rh, roofC, 0.22, wall);
    if (r < 0.12 && region !== 'bantaran') m.box(xfw, w / 4, Hh + rh * 0.4, 0, 0.5, 0.6, 0.5, col('#e8823a'));   // tandon air oranye
  }
  if (kind === 'perum') {   // pagar halaman
    const yd = 0.8, fw = w + yd * 2, fd = d + yd * 2, fc = col('#2a2a2e');
    const seg = (lx, lz, sx, sz) => m.box(xf, lx, 0, lz, sx, 0.55, sz, fc);
    const gap = 1.6;
    const [sx, sz] = sides[side];
    if (sz !== 1) seg(0, fd / 2, fw, 0.08); else { seg(-(fw + gap) / 4, fd / 2, (fw - gap) / 2, 0.08); seg((fw + gap) / 4, fd / 2, (fw - gap) / 2, 0.08); }
    if (sz !== -1) seg(0, -fd / 2, fw, 0.08); else { seg(-(fw + gap) / 4, -fd / 2, (fw - gap) / 2, 0.08); seg((fw + gap) / 4, -fd / 2, (fw - gap) / 2, 0.08); }
    if (sx !== 1) seg(fw / 2, 0, 0.08, fd); else { seg(fw / 2, -(fd + gap) / 4, 0.08, (fd - gap) / 2); seg(fw / 2, (fd + gap) / 4, 0.08, (fd - gap) / 2); }
    if (sx !== -1) seg(-fw / 2, 0, 0.08, fd); else { seg(-fw / 2, -(fd + gap) / 4, 0.08, (fd - gap) / 2); seg(-fw / 2, (fd + gap) / 4, 0.08, (fd - gap) / 2); }
  }
  ctx.col.box(b.x, b.y, w / 2, d / 2, b.a);
  return { side, Hh };
}

/* ------------------------------------------------------------------ pohon (instanced) */
function makeTrees(list) {
  const n = list.length;
  const trunkG = new THREE.BoxGeometry(1, 1, 1); trunkG.translate(0, 0.5, 0);
  const leafG = new THREE.BoxGeometry(1, 1, 1); leafG.translate(0, 0.5, 0);
  const mat = new THREE.MeshLambertMaterial();
  const trunk = new THREE.InstancedMesh(trunkG, mat, n), leaf = new THREE.InstancedMesh(leafG, mat, n * 3);
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), C = new THREE.Color();
  const greens = ['#4e8046', '#60924f', '#3f7040', '#6aa055'];
  let k = 0;
  list.forEach(([x, z, rr, kind], i) => {
    const r = hash(i, 9), big = kind === 'beringin';
    const th = big ? 1.6 : 0.9 + rr * 0.5, tw = big ? 0.7 : 0.22 + rr * 0.06;
    e.set(0, r * Math.PI, 0); q.setFromEuler(e);
    M.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(tw, th, tw)); trunk.setMatrixAt(i, M);
    trunk.setColorAt(i, C.set(big ? '#6a5a44' : '#7a5a3a'));
    const g = pick(greens, r);
    const tiers = [[1.0, 0.75], [0.72, 0.6], [0.4, 0.45]];
    let y = th * 0.8;
    tiers.forEach(([s, h], t) => {
      const sz = rr * 1.7 * s, hh = rr * h * (big ? 1.1 : 1);
      M.compose(new THREE.Vector3(x + (hash(i, t) - 0.5) * 0.3, y, z + (hash(i, t + 5) - 0.5) * 0.3), q, new THREE.Vector3(sz, hh, sz));
      leaf.setMatrixAt(k, M); leaf.setColorAt(k, C.set(g).multiplyScalar(0.85 + t * 0.14)); k++;
      y += hh * 0.85;
    });
  });
  for (const im of [trunk, leaf]) { im.castShadow = true; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); }
  return [trunk, leaf];
}

/* ------------------------------------------------------------------ KOTA */
export const REGIONS = ['Perbukitan Utara', 'Perkampungan Kenanga', 'Pusat Kota', 'Kawasan Sekolah', 'Perumahan Bukit Asri', 'Bantaran Kali', 'Selatan'];
const REGION_KEY = ['bukit', 'kampung', 'pusat', 'sekolah', 'perum', 'bantaran', 'selatan'];
const SPECIAL = { '110,54': 'sma', '19,58': 'stasiun', '146,64': 'masjid', '114,98': 'pasar', '178,98': 'plaza', '50,131': 'gudang', '150,158': 'stm', '224,56': 'bram', '84,18': 'menara' };

export function buildKota(scene, col_) {
  const K = KOTA, ctx = maskKota(K);
  ctx.col = col_;
  col_.mask(ctx.block);
  const regionAt = (x, z) => { for (let i = 1; i <= 6; i++) if (inPoly(x, z, K.areas[i].pts)) return REGION_KEY[i]; return z < 34 ? 'bukit' : null; };
  // tanah
  const tex = new THREE.CanvasTexture(paintKota(K));
  tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = 4;
  const [W, H] = K.size;
  const groundM = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshLambertMaterial({ map: tex }));
  groundM.rotation.x = -Math.PI / 2; groundM.position.set(W / 2, 0, H / 2); groundM.receiveShadow = true; groundM.matrixAutoUpdate = true;
  scene.add(groundM);
  // batas kota (tidak bisa keluar peta)
  col_.box(W / 2, -1, W / 2 + 2, 1); col_.box(W / 2, H + 1, W / 2 + 2, 1); col_.box(-1, H / 2, 1, H / 2 + 2); col_.box(W + 1, H / 2, 1, H / 2 + 2);

  const ch = new Chunks(32), specials = {};
  const roofKind = c => { const k = c.join(','); return ROOF_PERUM.includes(k) ? 'perum' : ROOF_RUKO.includes(k) ? 'ruko' : 'kampung'; };
  const kampungHouses = [];
  for (const b of K.bldgs) {
    const sp = SPECIAL[Math.round(b.x) + ',' + Math.round(b.y)];
    if (sp) { specials[sp] = b; continue; }
    const kind = roofKind(b.color);
    if (kind === 'kampung' && regionAt(b.x, b.y) === 'kampung') kampungHouses.push(b);
  }
  // Warkop Simpang & rumah Om Darto: dua rumah kampung terdekat ke penanda no. 3
  kampungHouses.sort((a, b) => Math.hypot(a.x - 46, a.y - 86) - Math.hypot(b.x - 46, b.y - 86));
  const warkop = kampungHouses[0], darto = kampungHouses[1];
  if (darto) darto.color = [168, 82, 58];
  for (const b of K.bldgs) {
    if (Object.values(specials).includes(b)) continue;
    const info = house(ch, b, roofKind(b.color), regionAt(b.x, b.y), ctx);
    if (b === warkop) warkopDeco(ch, b, info);
  }
  specialBuildings(ch, specials, col_);
  extras(ch, K, ctx, col_);
  for (const m of ch.meshes(MAT.world)) scene.add(m);
  // pohon: dari peta + beringin kembar alun-alun
  const trees = K.trees.map(t => [t[0], t[1], t[2]]);
  trees.push([143, 76, 1.7, 'beringin'], [149, 76, 1.7, 'beringin'], [125, 52, 1.6], [131, 41, 1.4]);
  for (const t of trees) col_.circle(t[0], t[1], t[3] === 'beringin' ? 0.6 : 0.3);
  for (const m of makeTrees(trees)) scene.add(m);
  // laut di luar peta
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(900, 700), new THREE.MeshLambertMaterial({ color: new THREE.Color().setRGB(...col(GC.grass)) }));
  outer.rotation.x = -Math.PI / 2; outer.position.set(W / 2, -0.02, H / 2); outer.receiveShadow = true; scene.add(outer);
  return {
    regionAt: (x, z) => { const r = regionAt(x, z); return r ? REGIONS[REGION_KEY.indexOf(r)] : 'Wirabumi'; },
    marks: K.marks.map(m => ({ ...m, name: m.desc.replace(/\s*\(.*$/, '') })),
    warkop, darto, ctx, groundTex: tex.image,
  };
}

function warkopDeco(ch, b, info) {
  const m = ch.at(b.x, b.y), xf = { x: b.x, z: b.y, a: b.a };
  const sides = [[0, 1], [0, -1], [1, 0], [-1, 0]], [sx, sz] = sides[info.side];
  const along = info.side < 2 ? b.w : b.h, half = info.side < 2 ? b.h / 2 : b.w / 2;
  const P = (k, u, y, sw, sh, dep, c) => info.side < 2 ? m.box(xf, u, y, sz * (half + k), sw, sh, dep, c) : m.box(xf, sx * (half + k), y, u, dep, sh, sw, c);
  P(0.08, 0, FLOOR - 0.1, along * 0.8, 0.4, 0.1, col('#2f5a3a'));        // papan "WARKOP SIMPANG"
  P(0.1, 0, FLOOR + 0.02, along * 0.5, 0.12, 0.12, col('#f2c230'));
  P(0.9, 0, 1.45, along + 0.4, 0.06, 1.6, col('#c8503a'));               // terpal teras
  P(1.2, -along / 4, 0, 1.1, 0.75, 0.5, col('#e6d27a'));                // gerobak kopi (level 1)
  P(1.2, -along / 4, 0.75, 1.1, 0.06, 0.5, col('#a8523a'));
  P(1.4, along / 4, 0, 1.5, 0.45, 0.45, col('#8a6a4a'));                 // bangku panjang
}

function specialBuildings(ch, S, C) {
  const add = (b, fn) => { if (!b) return; const m = ch.at(b.x, b.y); fn(m, { x: b.x, z: b.y, a: b.a }, b); C.box(b.x, b.y, b.w / 2, b.h / 2, b.a); };
  const cream = col('#ecdcb4'), redRoof = col('#a84a32'), white = col('#f2f0e8');
  add(S.sma, (m, xf, b) => {   // SMA 3: blok 2 lantai, atap genteng merah, gerbang di sisi selatan
    m.box(xf, 0, 0, 0, b.w, 2 * FLOOR, b.h, cream);
    facade(m, xf, b.w, b.h, 0, 2, { door: true, doorC: col('#7a4a2a'), spacing: 1.4 });
    facade(m, xf, b.w, b.h, 1, 2, { spacing: 1.4 });
    facade(m, xf, b.w, b.h, 2, 2, { spacing: 1.4 }); facade(m, xf, b.w, b.h, 3, 2, { spacing: 1.4 });
    m.gable(xf, 0, 2 * FLOOR, 0, b.w, b.h, 2.4, redRoof, 0.35, cream);
    m.box(xf, 0, 2 * FLOOR - 0.6, b.h / 2 + 0.1, 5, 0.5, 0.1, col('#2f6a4a'));   // papan nama hijau
    m.box(xf, 0, 2 * FLOOR - 0.5, b.h / 2 + 0.16, 4.2, 0.18, 0.05, col('#e0b84a'));
    for (const s of [-1, 1]) m.box(xf, s * 4, 0, b.h / 2 + 2.2, 0.6, 1.8, 0.6, col('#b06a4a'));   // pilar gerbang
    m.box(xf, 0, 0, b.h / 2 + 2.2, 7.4, 0.9, 0.12, col('#2f5a3a'));                               // gerbang besi
  });
  add(S.stasiun, (m, xf, b) => {
    m.box(xf, 0, 0, 0, b.w, 1.5 * FLOOR, b.h, col('#e8e4da'));
    facade(m, xf, b.w, b.h, 0, 1, { door: true, doorC: col('#2a5a8a'), ww: 0.8 });
    facade(m, xf, b.w, b.h, 1, 1, { ww: 0.8 });
    m.gable(xf, 0, 1.5 * FLOOR, 0, b.w, b.h, 1.6, col('#5a7aa8'), 0.5, col('#e8e4da'));
    m.box(xf, -b.w / 2 - 4, 0, 0, 8, 0.35, 3, col('#b8b0a0'));     // peron
    for (let i = 0; i < 4; i++) m.box(xf, -b.w / 2 - 1 - i * 2, 0.35, 0, 0.15, 1.8, 0.15, col('#4a4a50'));
    m.box(xf, -b.w / 2 - 4, 2.15, 0, 8, 0.1, 3.2, col('#5a7aa8'));
  });
  add(S.masjid, (m, xf, b) => {
    m.box(xf, 0, 0, 0, b.w, 1.4 * FLOOR, b.h, white);
    facade(m, xf, b.w, b.h, 0, 1, { door: true, doorC: col('#3a9a8a'), ww: 0.5, spacing: 1.2 });
    facade(m, xf, b.w, b.h, 2, 1, { ww: 0.5, spacing: 1.2 }); facade(m, xf, b.w, b.h, 3, 1, { ww: 0.5, spacing: 1.2 });
    m.box(xf, 0, 1.4 * FLOOR, 0, b.w, 0.2, b.h, shade(white, 0.92));
    m.dome(xf, 0, 1.4 * FLOOR + 0.2, 0, 2.2, col('#3a9a8a'), 6);
    m.box(xf, 0, 1.4 * FLOOR + 2.4, 0, 0.15, 0.6, 0.15, col('#e0b84a'));
    m.box(xf, b.w / 2 + 0.8, 0, -b.h / 2 + 0.8, 1, 9, 1, white);              // menara
    m.box(xf, b.w / 2 + 0.8, 7.2, -b.h / 2 + 0.8, 1.3, 0.25, 1.3, shade(white, 0.85));
    m.dome(xf, b.w / 2 + 0.8, 9, -b.h / 2 + 0.8, 0.6, col('#3a9a8a'), 3);
  });
  add(S.pasar, (m, xf, b) => {
    const tin = col('#9aa0a6');
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) m.box(xf, -b.w / 2 + 0.3 + i * (b.w - 0.6) / 5, 0, s * (b.h / 2 - 0.3), 0.3, 2.6, 0.3, col('#c8c2b8'));
    m.box(xf, 0, 0, 0, b.w - 2, 1.2, b.h - 2, col('#d8c8a8'));
    for (let i = 0; i < 8; i++) m.box(xf, -b.w / 2 + 1 + i * (b.w - 2) / 7, 0, b.h / 2 - 1.2, 1, 0.8, 0.8, col(pick(['#c8503a', '#3a7ac0', '#3a9a6a', '#e8c040'], hash(i, 3))));
    m.gable(xf, 0, 2.6, 0, b.w, b.h, 1.2, tin, 0.4, tin);
    m.gable(xf, 0, 3.6, 0, b.w * 0.6, b.h * 0.4, 0.8, shade(tin, 1.1), 0.2, tin);
  });
  add(S.plaza, (m, xf, b) => {
    m.box(xf, 0, 0, 0, b.w, 3 * FLOOR, b.h, col('#c8b8e0'));
    for (let f = 0; f < 3; f++) m.box(xf, 0, f * FLOOR + 0.5, b.h / 2 + 0.02, b.w - 0.6, 0.9, 0.06, col('#5a8ac8'));
    m.box(xf, 0, 0, b.h / 2 + 0.03, 2, 1.4, 0.06, col('#a8d0f0'));
    m.box(xf, 0, 3 * FLOOR, 0, b.w + 0.1, 0.2, b.h + 0.1, col('#a898c8'));
    m.box(xf, 0, 3 * FLOOR + 0.2, b.h / 2 - 0.2, 4, 0.9, 0.2, col('#8a3ab0'));   // logo
  });
  add(S.gudang, (m, xf, b) => {
    m.box(xf, 0, 0, 0, b.w, 1.3 * FLOOR, b.h, col('#9a7a56'));
    facade(m, xf, b.w, b.h, 0, 1, { door: true, rolling: true });
    m.gable(xf, 0, 1.3 * FLOOR, 0, b.w, b.h, 1, col('#8a5a44'), 0.3, col('#9a7a56'));
  });
  add(S.stm, (m, xf, b) => {
    m.box(xf, 0, 0, 0, b.w, 2 * FLOOR, b.h, col('#a8a8a4'));
    facade(m, xf, b.w, b.h, 0, 2, { door: true, doorC: col('#3a6aa8') }); facade(m, xf, b.w, b.h, 1, 2, {});
    m.gable(xf, 0, 2 * FLOOR, 0, b.w, b.h, 1.4, col('#9aa0a6'), 0.3, col('#a8a8a4'));
    m.box(xf, 0, 2 * FLOOR - 0.5, b.h / 2 + 0.06, 4, 0.4, 0.08, col('#d23a3a'));
  });
  add(S.bram, (m, xf, b) => {
    const w = b.w, d = b.h;
    m.box(xf, 0, 0, 0, w, 2 * FLOOR, d, col('#f6f4ee'));
    facade(m, xf, w, d, 0, 2, { door: true, doorC: col('#8a5a34'), ww: 1, glass: GLASS2 }); facade(m, xf, w, d, 1, 2, { ww: 1, glass: GLASS2 });
    for (const s of [-1, 0.33, -0.33, 1]) m.box(xf, s * (w / 2 - 0.4), 0, d / 2 + 0.4, 0.35, 2 * FLOOR, 0.35, col('#ffffff'));
    m.hip(xf, 0, 2 * FLOOR, 0, w, d, 2.2, col('#2a2c30'));
    m.box(xf, w / 2 + 2, 0, 0, 3, 0.1, d, col('#4aa8d8'));    // kolam renang
  });
  add(S.menara, (m, xf) => {
    const red = col('#c83a3a'), wh = col('#e8e8e8');
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) m.box(xf, sx * 0.9, 0, sz * 0.9, 0.16, 14, 0.16, col('#8a8a90'));
    for (let i = 0; i < 7; i++) m.box(xf, 0, i * 2 + 1.5, 0, 2, 0.14, 2, i % 2 ? red : wh);
    m.box(xf, 0, 14, 0, 0.3, 3, 0.3, red);
    m.box(xf, 0, 17, 0, 0.35, 0.35, 0.35, col('#ff5040'));
  });
}

function extras(ch, K, ctx, C) {
  // pagar seng lahan proyek PT Graha Megantara (area terakhir) + tumpukan material
  const P = K.areas[12].pts;
  for (let i = 0; i < P.length - 1; i++) {
    const [x0, z0] = P[i], [x1, z1] = P[i + 1], L = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(z1 - z0, x1 - x0);
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    if (i === 0) {   // gerbang di sisi utara
      for (const s of [-1, 1]) { const off = s * (L / 4 + 1); ch.at(mx, mz).box({ x: mx + Math.cos(a) * off, z: mz + Math.sin(a) * off, a }, 0, 0, 0, L / 2 - 2, 2, 0.1, col('#3a6aa8')); C.box(mx + Math.cos(a) * off, mz + Math.sin(a) * off, L / 4 - 1, 0.1, a); }
    } else { ch.at(mx, mz).box({ x: mx, z: mz, a }, 0, 0, 0, L, 2, 0.1, col('#3a6aa8')); C.box(mx, mz, L / 2, 0.1, a); }
  }
  const pm = ch.at(212, 153);
  pm.box({ x: 205, z: 152, a: 0.2 }, 0, 0, 0, 3, 1, 2, col('#c8a878')); C.box(205, 152, 1.5, 1, 0.2);
  pm.box({ x: 218, z: 155, a: 0 }, 0, 0, 0, 1, 12, 1, col('#f2c230'));                 // menara crane
  pm.box({ x: 218, z: 155, a: 0 }, 3, 12, 0, 10, 0.5, 0.5, col('#f2c230')); C.box(218, 155, 0.6, 0.6);
  // gawang lapangan bola kampung
  for (const s of [-1, 1]) { const g = ch.at(88, 104), xf = { x: 88 + s * 6.4, z: 104, a: 0 }; g.box(xf, 0, 0, -1.2, 0.12, 1.2, 0.12, col('#f4f4f0')); g.box(xf, 0, 0, 1.2, 0.12, 1.2, 0.12, col('#f4f4f0')); g.box(xf, 0, 1.2, 0, 0.12, 0.12, 2.5, col('#f4f4f0')); }
  // ring basket taman kota
  for (const [x, z] of [[123.6, 45.5], [130.4, 45.5]]) { const g = ch.at(x, z); g.box({ x, z, a: 0 }, 0, 0, 0, 0.15, 2.4, 0.15, col('#4a4a50')); g.box({ x, z, a: 0 }, 0, 2.2, 0, 0.1, 0.8, 1, col('#f4f4f0')); C.circle(x, z, 0.2); }
  // panggung alun-alun
  ch.at(146, 70).box({ x: 146, z: 70.8, a: 0 }, 0, 0, 0, 4, 0.6, 2, col('#8a5a34')); C.box(146, 70.8, 2, 1);
  // lampu jalan sepanjang jalan raya + pagar jembatan
  for (const r of K.roads) {
    const pts = r.pts; let acc = 0, next = 6;
    for (let i = 1; i < pts.length; i++) {
      const [x0, z0] = pts[i - 1], [x1, z1] = pts[i], L = Math.hypot(x1 - x0, z1 - z0); if (!L) continue;
      const nx = -(z1 - z0) / L, nz = (x1 - x0) / L, a = Math.atan2(z1 - z0, x1 - x0);
      for (let t = 0; t < L; t += 0.5) {
        const x = x0 + (x1 - x0) * t / L, z = z0 + (z1 - z0) * t / L;
        if (ctx.waterAt(x, z)) for (const s of [-1, 1]) { const px = x + nx * s * (r.w / 2 + 0.1), pz = z + nz * s * (r.w / 2 + 0.1); ch.at(px, pz).box({ x: px, z: pz, a }, 0, 0, 0, 0.56, 0.5, 0.12, col('#d8d4c8')); C.box(px, pz, 0.28, 0.08, a); }
        if (r.kind === 'raya' && acc + t >= next) {
          next += 12;
          const s = (Math.floor(next / 12) % 2) ? 1 : -1, px = x + nx * s * (r.w / 2 + 0.6), pz = z + nz * s * (r.w / 2 + 0.6);
          if (!ctx.waterAt(px, pz) && !ctx.roadAt(px, pz)) {
            const g = ch.at(px, pz), xf = { x: px, z: pz, a: Math.atan2(-nz * s, -nx * s) };
            g.box(xf, 0, 0, 0, 0.12, 3.2, 0.12, col('#5a5a60')); g.box(xf, 0.45, 3.1, 0, 0.9, 0.08, 0.1, col('#5a5a60')); g.box(xf, 0.85, 2.98, 0, 0.3, 0.12, 0.22, col('#fff2b0'));
            C.circle(px, pz, 0.12);
          }
        }
      }
      acc += L;
    }
  }
}

/* ------------------------------------------------------------------ SEKOLAH */
// Dari docs/desain-sma/peta/buat_peta.py (peta_sekolah): x, y, w, h dalam petak.
export const SCHOOL_ZONES = [
  [32, 47, 10, 3, 'gerbang', 'Gerbang & pos satpam'], [4, 38, 26, 10, 'parkir', 'Parkiran motor siswa'], [44, 38, 14, 10, 'parkirGuru', 'Parkiran guru'],
  [60, 38, 13, 10, 'taman', 'Taman depan & mading'], [24, 14, 26, 16, 'upacara', 'Lapangan upacara'], [13, 4, 20, 9, 'gedungA', 'Gedung A (kantor, perpus)'],
  [35, 4, 26, 9, 'gedungB', 'Gedung B (ruang kelas)'], [4, 10, 6, 20, 'gedungC', 'Gedung C (lab & seni)'], [65, 10, 9, 12, 'aula', 'Aula / GOR'],
  [65, 23, 9, 7, 'musala', 'Musala'], [52, 14, 9, 16, 'basket', 'Lapangan basket & futsal'], [13, 33, 19, 4, 'kantin', 'Kantin & koperasi'],
  [42, 33, 20, 4, 'toilet', 'Toilet, gudang olahraga, ruang piket'], [62, 4, 12, 5, 'kebun', 'Kebun & greenhouse'], [2, 2, 9, 7, 'lama', 'Gedung Lama (terkunci)'],
  [13, 14, 9, 15, 'beringin', 'Pohon beringin & bangku'],
];

function paintSekolah() {
  const W = 76, H = 52, s = PX, cv = document.createElement('canvas'); cv.width = W * s; cv.height = H * s;
  const g = cv.getContext('2d');
  g.fillStyle = 'rgb(168,196,128)'; g.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < W * H; i++) { g.fillStyle = hash(i, 5) < 0.5 ? 'rgba(150,182,112,0.6)' : 'rgba(182,208,138,0.5)'; g.fillRect(hash(i, 6) * cv.width | 0, hash(i, 7) * cv.height | 0, 2, 1 + (hash(i, 8) * 2 | 0)); }
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x * s, y * s, w * s, h * s); };
  R(0, 50, 76, 2, 'rgb(110,112,118)');
  g.strokeStyle = 'rgb(235,235,200)'; g.lineWidth = 2; g.setLineDash([12, 12]); g.beginPath(); g.moveTo(0, 51 * s); g.lineTo(W * s, 51 * s); g.stroke(); g.setLineDash([]);
  const tile = 'rgb(200,192,170)';
  R(33, 36, 8, 14, tile); R(10, 30, 54, 2, tile); R(10, 10, 2, 22, tile); R(62, 10, 2, 22, tile);
  R(12, 12.5, 50, 1.5, tile);   // selasar depan gedung A & B
  for (const [x, y, w, h, k] of SCHOOL_ZONES) {
    if (k === 'parkir' || k === 'parkirGuru') { R(x, y, w, h, 'rgb(176,176,172)'); g.strokeStyle = 'rgba(250,250,240,0.7)'; g.lineWidth = 1; for (let i = x + 1; i < x + w; i += 1.2) { g.beginPath(); g.moveTo(i * s, (y + 0.5) * s); g.lineTo(i * s, (y + 2.5) * s); g.stroke(); } }
    if (k === 'upacara') { R(x, y, w, h, 'rgb(204,198,182)'); g.strokeStyle = 'rgba(250,250,240,0.8)'; g.lineWidth = 2; g.strokeRect((x + 1) * s, (y + 1) * s, (w - 2) * s, (h - 2) * s); }
    if (k === 'basket') { court(g, s, x, y, w, h / 2 - 0.3, 'rgb(64,120,170)'); court(g, s, x, y + h / 2 + 0.3, w, h / 2 - 0.3, 'rgb(70,140,96)'); }
    if (k === 'kebun') { R(x, y, w, h, 'rgb(130,100,70)'); for (let i = 0; i < 5; i++) R(x + 6.5, y + 0.4 + i, 5, 0.5, 'rgb(90,150,70)'); }
    if (k === 'taman' || k === 'beringin') R(x, y, w, h, 'rgb(130,186,110)');
    if (k === 'gerbang') R(x + 1, y, w - 2, h, tile);
  }
  R(24, 0, 10, 2, 'rgb(160,140,110)');
  g.strokeStyle = 'rgb(200,40,40)'; g.lineWidth = 3; g.beginPath(); g.moveTo(30 * s, 1.6 * s); g.lineTo(30 * s, 2.5 * s); g.stroke();
  return cv;
}

export function buildSekolah(scene, C) {
  const OX = SCHOOL_OX, ch = new Chunks(32);
  const tex = new THREE.CanvasTexture(paintSekolah());
  tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipmapLinearFilter;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(76, 52), new THREE.MeshLambertMaterial({ map: tex }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(OX + 38, 0.01, 26); ground.receiveShadow = true; scene.add(ground);
  const cream = col('#ecdcb4'), roof = col('#a84a32'), list = col('#f6f4ec'), wood = col('#7a4a2a');
  const B = (x, y, w, h) => ({ x: OX + x + w / 2, z: y + h / 2, w, h });
  // gedung bertingkat dengan selasar/balkon di sisi depan
  const gedung = (zx, zy, w, h, floors, front, o = {}) => {
    const b = B(zx, zy, w, h), m = ch.at(b.x, b.z);
    let xf = { x: b.x, z: b.z, a: 0 }, W = w, D = h;
    if (front === 2) { xf = { x: b.x, z: b.z, a: -Math.PI / 2 }; W = h; D = w; }   // menghadap timur
    const depth = D - 2.2, cz = -1.1;   // 2.2 petak untuk selasar di depan
    m.box(xf, 0, 0, cz + 0.0, W, 0.15, D - 0.0, col('#c8c0a8'));
    m.box(xf, 0, 0.15, cz, W, floors * FLOOR - 0.15, depth, o.wall || cream);
    for (let f = 0; f < floors; f++) {
      const y = f * FLOOR;
      facade(m, { ...xf, y }, W, depth, 0, 1, { door: true, doorC: wood, spacing: o.spacing || 2, ww: 0.8 });
      // tiap kelas punya pintu (6 petak)
      if (o.doors) for (let u = -W / 2 + 5.4; u < W / 2 - 1; u += 6) m.box({ ...xf, y }, u, 0, cz + depth / 2 + 0.03, 0.5, 1.38, 0.06, wood);
      m.box(xf, 0, y + FLOOR - 0.12, D / 2 - 1.1, W, 0.14, 2.2, col('#d8d0b8'));   // plat selasar
      if (f > 0) { m.box(xf, 0, y, D / 2 - 0.05, W, 0.55, 0.08, list); }            // pagar balkon
      for (let u = -W / 2 + 0.2; u <= W / 2; u += 3) m.box(xf, u, y, D / 2 - 0.15, 0.22, FLOOR - 0.12, 0.22, list);   // pilar
    }
    facade(m, xf, W, depth, 1, floors, { spacing: o.spacing || 2, ww: 0.8 });
    const shiftXf = { ...xf, x: xf.x + (front === 2 ? 0 : 0), z: xf.z };
    m.gable(shiftXf, 0, floors * FLOOR, 0, W, D, Math.min(2.6, D * 0.3), o.roof || roof, 0.3, o.wall || cream);
    C.box(b.x, b.z, w / 2, h / 2);
    return { m, xf, b };
  };
  gedung(13, 4, 20, 9, 2, 0);
  const gb = gedung(35, 4, 26, 9, 3, 0, { doors: true });
  gedung(4, 10, 6, 20, 2, 2);
  // aula / GOR
  { const b = B(65, 10, 9, 12), m = ch.at(b.x, b.z), xf = { x: b.x, z: b.z, a: Math.PI / 2 };
    m.box(xf, 0, 0, 0, 12, 4.2, 9, cream); m.box(xf, 0, 3, 0, 12.05, 0.8, 9.05, col('#c8b890'));
    facade(m, xf, 12, 9, 1, 1, { spacing: 2.4, ww: 1 }); facade(m, xf, 12, 9, 0, 1, { spacing: 2.4, ww: 1 });
    m.box({ x: b.x, z: b.z, a: 0 }, -4.5 - 0.03, 0, 2, 0.06, 1.6, 1.6, wood);
    m.gable(xf, 0, 4.2, 0, 12, 9, 2.6, col('#3a6a4a'), 0.3, cream); C.box(b.x, b.z, 4.5, 6); }
  // musala
  { const b = B(65, 23, 9, 7), m = ch.at(b.x, b.z), xf = { x: b.x, z: b.z, a: 0 };
    m.box(xf, 0, 0, 0, 9, FLOOR, 7, col('#f2f0e8')); facade(m, xf, 9, 7, 3, 1, { door: true, doorC: col('#3a8a6a') }); facade(m, xf, 9, 7, 1, 1, {});
    m.box(xf, 0, FLOOR, 0, 9.2, 0.2, 7.2, col('#e0ded4')); m.dome(xf, 0, FLOOR + 0.2, 0, 2, col('#3a8a6a'), 5); C.box(b.x, b.z, 4.5, 3.5); }
  // kantin: 6 lapak beda warna, atap seng menyambung, meja panjang di depan (utara)
  { const b = B(13, 33, 19, 4), m = ch.at(b.x, b.z), xf = { x: b.x, z: b.z, a: 0 };
    const cols = ['#c8503a', '#e8c040', '#d88a3a', '#e8e0c8', '#3a9a6a', '#3a7ac0'];
    for (let i = 0; i < 6; i++) { const u = -9.5 + (i + 0.5) * 19 / 6; m.box(xf, u, 0, 0.5, 19 / 6 - 0.1, 1.5, 3, col(cols[i])); m.box(xf, u, 0, -1.05, 2.4, 0.75, 0.15, col('#e8e4da')); m.box(xf, u, 1.2, -1.0, 2.4, 0.3, 0.08, shade(col(cols[i]), 0.7)); }
    m.box(xf, 0, 1.8, 0, 19.4, 0.08, 4.4, col('#9aa0a6'), { bottom: true }); for (const u of [-9.4, 0, 9.4]) m.box(xf, u, 0, -2, 0.15, 1.8, 0.15, col('#6a6a70'));
    m.box(xf, 0, 1.5, 0.5, 19, 0.3, 3, col('#d8d0b8'));
    for (let i = 0; i < 5; i++) { const u = -8 + i * 4; m.box(xf, u, 0, -3.2, 2.6, 0.62, 0.7, col('#8a5a34')); for (const s of [-1, 1]) m.box(xf, u, 0, -3.2 + s * 0.65, 2.6, 0.38, 0.25, col('#6a4a30')); }
    C.box(b.x, b.z + 0.5, 9.5, 1.5); }
  // toilet - gudang - piket
  { const b = B(42, 33, 20, 4), m = ch.at(b.x, b.z), xf = { x: b.x, z: b.z, a: 0 };
    m.box(xf, 0, 0, 0, 20, 1.9, 4, cream); facade(m, xf, 20, 4, 1, 1, { door: true, doorC: col('#2a6ac0'), spacing: 2.5, ww: 0.5 });
    for (let u = -8; u <= 8; u += 4) m.box(xf, u, 0, -2.03, 0.5, 1.38, 0.06, col('#2a6ac0'));
    m.gable(xf, 0, 1.9, 0, 20, 4, 1, roof, 0.25, cream); C.box(b.x, b.z, 10, 2); }
  // gedung lama (kolonial, lumut, menara lonceng)
  { const b = B(2, 2, 9, 7), m = ch.at(b.x, b.z), xf = { x: b.x, z: b.z, a: 0 }, w = col('#d8d4c4');
    m.box(xf, 0, 0, 0, 9, 1.4 * FLOOR, 7, w); m.box(xf, 0, 0, 0, 9.02, 0.6, 7.02, mix(w, col('#54623a'), 0.5));
    facade(m, xf, 9, 7, 0, 1, { door: true, doorC: col('#5a3a20'), glass: col('#6a4a30'), ww: 0.5, spacing: 1.3 });
    m.hip(xf, 0, 1.4 * FLOOR, 0, 9, 7, 2.4, col('#2e3430'));
    m.box(xf, 0, 1.4 * FLOOR + 1.6, 0, 1.4, 1.6, 1.4, w); m.hip(xf, 0, 1.4 * FLOOR + 3.2, 0, 1.4, 1.4, 1, col('#2e3430'), 0.15);
    C.box(b.x, b.z, 4.5, 3.5); }
  // greenhouse
  { const b = B(62, 4, 12, 5), m = ch.at(b.x, b.z), xf = { x: b.x - 3, z: b.z, a: 0 };
    m.box(xf, 0, 0, 0, 5.6, 1.9, 4.6, col('#cfe6e8')); m.gable(xf, 0, 1.9, 0, 5.6, 4.6, 1, col('#e6f2f2'), 0.05, col('#cfe6e8')); C.box(b.x - 3, b.z, 2.8, 2.3); }
  // pos satpam + pilar gerbang + gerbang dorong
  { const m = ch.at(OX + 37, 49), xf = { x: OX + 43.5, z: 48.5, a: 0 };
    m.box(xf, 0, 0, 0, 2, 1.9, 2, col('#f2eee6')); m.box(xf, 0, 0.7, 1.02, 1.6, 0.8, 0.05, GLASS2); m.box(xf, 0, 1.9, 0, 2.4, 0.15, 2.4, roof); C.box(OX + 43.5, 48.5, 1, 1);
    for (const x of [32.5, 41.5]) { m.box({ x: OX + x, z: 50, a: 0 }, 0, 0, 0, 0.9, 2.2, 0.9, col('#b06a4a')); C.box(OX + x, 50, 0.45, 0.45); }
    m.box({ x: OX + 37, z: 50, a: 0 }, 0, 2, 0, 9.5, 0.6, 0.2, col('#2f6a4a')); m.box({ x: OX + 37, z: 50.12, a: 0 }, 0, 2.15, 0, 7, 0.25, 0.05, col('#e0b84a'));
    m.box({ x: OX + 30, z: 50, a: 0 }, 0, 0, 0, 4.5, 1.2, 0.12, col('#2f5a3a')); }   // gerbang dorong (terbuka, digeser ke barat)
  // pagar keliling (2,2)-(74,50) dengan bukaan gerbang 33-41 di selatan
  { const fc = col('#7a7a80'), fh = 1.5;
    const seg = (x0, z0, x1, z1) => { const cx = OX + (x0 + x1) / 2, cz = (z0 + z1) / 2, w = Math.abs(x1 - x0) + 0.15, d = Math.abs(z1 - z0) + 0.15; ch.at(cx, cz).box({ x: cx, z: cz, a: 0 }, 0, 0, 0, w, fh, d, fc); C.box(cx, cz, w / 2, d / 2); };
    seg(2, 2, 74, 2); seg(2, 2, 2, 50); seg(74, 2, 74, 50); seg(2, 50, 32, 50); seg(42, 50, 74, 50); }
  // warung belakang Mak Iyah (di luar pagar utara)
  { const m = ch.at(OX + 29, 1), xf = { x: OX + 29, z: 0.6, a: 0 };
    m.box(xf, 0, 0, 0, 6, 1.6, 1.2, col('#c8a878')); m.box(xf, 0, 1.6, 0.2, 6.6, 0.08, 1.9, col('#8a5a44')); C.box(OX + 29, 0.6, 3, 0.6); }
  // tiang bendera lapangan upacara + mading + parkiran
  { const m = ch.at(OX + 37, 15), xf = { x: OX + 37, z: 15.5, a: 0 };
    m.box(xf, 0, 0, 0, 1.4, 0.3, 1.4, col('#d8d0b8')); m.box(xf, 0, 0.3, 0, 0.1, 6, 0.1, col('#e8e8e8'));
    m.box(xf, 0.5, 5.6, 0, 0.9, 0.3, 0.04, col('#d8282e')); m.box(xf, 0.5, 5.3, 0, 0.9, 0.3, 0.04, col('#f8f8f8')); C.circle(OX + 37, 15.5, 0.7);
    const md = ch.at(OX + 66, 41); md.box({ x: OX + 66, z: 41, a: 0 }, 0, 0, 0, 3, 1.8, 0.2, col('#7a4a2a')); md.box({ x: OX + 66, z: 41.12, a: 0 }, 0, 0.5, 0, 2.6, 1.1, 0.04, col('#f4f0e0')); C.box(OX + 66, 41, 1.5, 0.15);
    for (let i = 0; i < 14; i++) for (let r = 0; r < 2; r++) {   // motor siswa berderet
      const x = OX + 5.2 + i * 1.8, z = 39.5 + r * 4.6, mm = ch.at(x, z), c = col(pick(['#2a2a2e', '#c83a3a', '#2a6ac0', '#e8e8e8', '#3a9a6a'], hash(i, r)));
      if (hash(i, r + 7) < 0.25) continue;
      mm.box({ x, z, a: Math.PI / 2 }, 0, 0.12, 0, 1.6, 0.45, 0.35, c); mm.box({ x, z, a: Math.PI / 2 }, -0.3, 0.55, 0, 0.6, 0.12, 0.3, col('#1e1e22'));
      for (const s of [-1, 1]) mm.box({ x, z, a: Math.PI / 2 }, s * 0.6, 0, 0, 0.4, 0.4, 0.12, col('#2a2a2a')); C.box(x, z, 0.2, 0.8);
    }
    for (let i = 0; i < 3; i++) { const x = OX + 47 + i * 4, z = 43, mm = ch.at(x, z); mm.box({ x, z, a: Math.PI / 2 }, 0, 0.2, 0, 3.4, 0.8, 1.6, col(pick(['#e8e8e8', '#4a4a50', '#a83a3a'], hash(i, 2)))); mm.box({ x, z, a: Math.PI / 2 }, -0.2, 1, 0, 1.8, 0.55, 1.5, GLASS2); C.box(x, z, 0.8, 1.7); }
    // ring basket
    for (const [x, z] of [[56.5, 14.6], [56.5, 21.1]]) { const mm = ch.at(OX + x, z); mm.box({ x: OX + x, z, a: 0 }, 0, 0, 0, 0.15, 2.4, 0.15, col('#4a4a50')); mm.box({ x: OX + x, z: z + 0.1, a: 0 }, 0, 2.2, 0, 1, 0.8, 0.1, col('#f4f4f0')); C.circle(OX + x, z, 0.2); }
    // bangku beringin
    for (const [x, z] of [[15, 25], [20, 26], [17, 16]]) { const mm = ch.at(OX + x, z); mm.box({ x: OX + x, z, a: 0.3 }, 0, 0, 0, 2, 0.45, 0.5, col('#8a5a34')); C.box(OX + x, z, 1, 0.25, 0.3); }
  }
  for (const m of ch.meshes(MAT.world)) scene.add(m);
  const trees = [[OX + 17.5, 21, 2.2, 'beringin'], [OX + 61, 42, 1.3], [OX + 65, 45, 1.2], [OX + 70, 42, 1.4], [OX + 71, 46.5, 1.1], [OX + 3.5, 34, 1.2], [OX + 7, 33.5, 1.0],
    [OX + 68, 32, 1.1], [OX + 72, 32.5, 1.0], [OX + 5, 45, 1.2], [OX + 12, 8.5, 1.0], [OX + 34, 9.5, 0.9], [OX + 62, 9.5, 0.9]];
  for (let i = 0; i < 26; i++) trees.push([OX - 6 + hash(i, 1) * 88, -8 + hash(i, 2) * 7, 1 + hash(i, 3)]);       // hutan kecil di belakang
  for (let i = 0; i < 20; i++) { const s = i % 2 ? -1 : 1; trees.push([OX + (s < 0 ? -2 - hash(i, 4) * 6 : 78 + hash(i, 4) * 6), hash(i, 5) * 50, 1 + hash(i, 6)]); }
  for (const t of trees) C.circle(t[0], t[1], t[3] === 'beringin' ? 0.8 : 0.3);
  for (const m of makeTrees(trees)) scene.add(m);
  // batas luar area sekolah (jalan depan bisa dilalui, tapi tidak bisa jauh-jauh)
  C.box(OX + 38, 53.5, 50, 0.5); C.box(OX - 12, 26, 0.5, 40); C.box(OX + 88, 26, 0.5, 40); C.box(OX + 38, -9, 50, 0.5);
  return {
    zones: SCHOOL_ZONES.map(([x, y, w, h, k, name]) => ({ x: OX + x, z: y, w, h, k, name })),
    zoneAt(x, z) { for (const q of this.zones) if (x >= q.x && x <= q.x + q.w && z >= q.z && z <= q.z + q.h) return q.name; return z > 50 ? 'Jl. Merdeka (depan sekolah)' : 'SMA Negeri 3 Wirabumi'; },
    groundTex: tex.image,
  };
}
