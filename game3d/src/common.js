// Bagian bersama: tabrakan, bahan dengan tekstur voxel, jendela/pintu, pola tekstur tanah.
import * as THREE from 'three';
import { col, shade } from './geom.js';

export const FLOOR = 56 / 32;          // tinggi 1 lantai (52 dinding + 4 plat)
export const hash = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
export const pick = (arr, r) => arr[Math.floor(r * arr.length) % arr.length];
export const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
export const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
export function inPoly(x, y, pts) {
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}

/* ------------------------------------------------------------------ tabrakan */
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
  // gerak dengan meluncur: tabrak dinding = menyusur dinding, tabrak air = coba sumbu x / z saja
  move(from, tx, tz, r) {
    const p = this.resolve({ x: tx, z: tz }, r);
    if (!this.blockedMask(p.x, p.z)) return p;
    const a = this.resolve({ x: tx, z: from.z }, r);
    if (!this.blockedMask(a.x, a.z)) return a;
    const b = this.resolve({ x: from.x, z: tz }, r);
    if (!this.blockedMask(b.x, b.z)) return b;
    return { x: from.x, z: from.z };
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


// kotak tabrakan dari koordinat lokal sebuah bangunan (xf = { x, z, a })
export function colLocal(C, xf, lx, lz, sx, sz) {
  const c = Math.cos(xf.a || 0), s = Math.sin(xf.a || 0);
  C.box(xf.x + lx * c - lz * s, xf.z + lx * s + lz * c, sx / 2, sz / 2, xf.a || 0);
}

/* ------------------------------------------------------------------ bahan */
// Tekstur "voxel": tiap kubus 1/8 petak (4 voxel) di permukaan diberi sedikit variasi terang-gelap,
// dihitung di shader dari posisi dunia, jadi tanpa tekstur gambar dan tanpa biaya memori.
export function voxelize(mat, amount = 0.09, cells = 8) {
  mat.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
        vec4 wp4 = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
          wp4 = instanceMatrix * wp4;
        #endif
        wp4 = modelMatrix * wp4; vWP = wp4.xyz;
        vWN = normalize(mat3(modelMatrix) * objectNormal);`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        varying vec3 vWP; varying vec3 vWN;
        float vh(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec3 cell = floor(vWP * ${cells.toFixed(1)} - vWN * 0.5);
        float n = vh(cell);
        diffuseColor.rgb *= ${(1 - amount).toFixed(3)} + ${(amount * 2).toFixed(3)} * n;`);
  };
  mat.customProgramCacheKey = () => 'vox' + amount + cells;
  return mat;
}
export const MAT = { world: voxelize(new THREE.MeshLambertMaterial({ vertexColors: true })) };

/* ------------------------------------------------------------------ jendela & pintu */
export const GLASS = col('#3a4a5a'), GLASS2 = col('#6a8aa8'), FRAME = col('#f2eee6'), PLINTH = col('#8a8478');
export function facade(m, xf, w, d, side, floors, o) {
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
      const y = f * (o.fh || FLOOR) + (o.wy || 0.56);
      // jendela berkedalaman: kaca menempel dinding, kusen menonjol di sekelilingnya, ambang bawah & atas lebih menjorok
      const ww = o.ww || 0.62, wh = 0.74;
      put(u, y, ww, wh, o.glass || GLASS, 0.03);
      put(u, y - 0.06, ww + 0.12, 0.07, FRAME, 0.12); put(u, y + wh - 0.01, ww + 0.12, 0.07, FRAME, 0.12);
      for (const sd of [-1, 1]) put(u + sd * (ww / 2 + 0.03), y - 0.06, 0.06, wh + 0.12, FRAME, 0.12);
      put(u, y, 0.04, wh, FRAME, 0.07); put(u, y + wh * 0.55, ww, 0.035, FRAME, 0.07);
      put(u, y - 0.12, ww + 0.26, 0.06, PLINTH, 0.2); put(u, y + wh + 0.06, ww + 0.22, 0.07, shade(FRAME, 0.88), 0.15);
    }
  }
}


/* ------------------------------------------------------------------ pola tekstur tanah */
function patternCanvas(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; }
function noise(g, w, h, base, cols, n, sz = 1) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(hash(i, 11) * w | 0, hash(i, 12) * h | 0, sz + (hash(i, 13) * 2 | 0), sz); }
}
export const PAT = {};
// k = piksel per petak / 10. Pola digambar ulang pada resolusi aslinya (bukan diperbesar), supaya butir tekstur tanah
// sekecil voxel bangunan & tokoh (1 piksel ~ 2 voxel pada k = 1.6)
export function makePatterns(g, k = 1) {
  const P = (key, c) => (PAT[key] = g.createPattern(c, 'repeat'));
  const Z = v => Math.max(1, Math.round(v * k)), N = (n, sz) => Math.round(n * k * k);
  const nz = (w, h, base, cols, n, sz = 1) => patternCanvas(Z(w), Z(h), (g, W, H) => noise(g, W, H, base, cols, N(n), sz));
  P('grass', patternCanvas(Z(64), Z(64), (g, w, h) => {
    noise(g, w, h, '#a4c07c', ['#96b670', '#b2ce88', '#8eae68', '#a9c682'], N(420), 1);
    for (let i = 0; i < N(14); i++) { g.fillStyle = '#7aa05a'; g.fillRect(hash(i, 21) * w | 0, hash(i, 22) * h | 0, 1, 2); }
  }));
  P('grassDark', nz(64, 64, '#84a664', ['#78985a', '#8eb06c', '#6e9052'], 420));
  P('asphalt', nz(48, 48, '#5c5e64', ['#54565c', '#66686e', '#4e5056', '#6a6c70'], 700));
  P('asphaltLight', nz(48, 48, '#7a7a7c', ['#727274', '#848486', '#6c6c70'], 600));
  P('conblock', patternCanvas(Z(20), Z(20), (g, w, h) => {   // paving gang: bata 1/2 x 1/4 petak (pinggir bata digambar 1 piksel)
    const bh = Z(5), bw = Z(10);
    g.fillStyle = '#b4a68c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < N(60); i++) { g.fillStyle = hash(i, 3) < 0.5 ? '#c0b298' : '#a89a80'; g.fillRect(hash(i, 1) * w | 0, hash(i, 2) * h | 0, 2, 1); }
    g.fillStyle = '#9a8c74';
    for (let r = 0, y = 0; y < h; y += bh, r++) { g.fillRect(0, y, w, 1); for (let x = (r % 2) * (bw >> 1); x < w; x += bw) g.fillRect(x, y, 1, bh); }
  }));
  P('dirt', nz(40, 40, '#c4ac80', ['#b49c70', '#d0b88c', '#a88e64', '#bca476'], 380));
  P('tile', patternCanvas(Z(20), Z(20), (g, w, h) => { const t = Z(10); g.fillStyle = '#d8d0bc'; g.fillRect(0, 0, w, h); for (let i = 0; i < N(20); i++) { g.fillStyle = '#e0d8c4'; g.fillRect(hash(i, 5) * w | 0, hash(i, 6) * h | 0, 1, 1); } g.fillStyle = '#bcb4a0'; for (let y = 0; y < h; y += t) g.fillRect(0, y, w, 1); for (let x = 0; x < w; x += t) g.fillRect(x, 0, 1, h); }));
  P('semen', nz(32, 32, '#c4beb2', ['#b8b2a6', '#cec8bc', '#aea89c'], 260));
  P('paving', patternCanvas(Z(20), Z(20), (g, w, h) => { const bh = Z(5); g.fillStyle = '#b8b4ac'; g.fillRect(0, 0, w, h); for (let i = 0; i < N(30); i++) { g.fillStyle = '#c2beb6'; g.fillRect(hash(i, 7) * w | 0, hash(i, 8) * h | 0, 1, 1); } g.fillStyle = '#a09c94'; for (let r = 0, y = 0; y < h; y += bh, r++) { g.fillRect(0, y, w, 1); for (let x = (r % 2) * (bh >> 1); x < w; x += bh) g.fillRect(x, y, 1, bh); } }));
  P('lawn', patternCanvas(Z(32), Z(32), (g, w, h) => { noise(g, w, h, '#8cbc6c', ['#82b264', '#96c676', '#7aa85c'], N(300)); for (let y = 0; y < h; y += Z(8)) { g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, y, w, Z(4)); } }));
  P('sawah', nz(32, 32, '#86ae5a', ['#7aa04e', '#94bc66', '#6e9a5a', '#80a8a0'], 300));
  P('water', patternCanvas(Z(48), Z(48), (g, w, h) => { noise(g, w, h, '#5f98c4', ['#6aa2cc', '#5890bc', '#74aad2'], N(200), 2); for (let i = 0; i < N(10); i++) { g.fillStyle = 'rgba(210,235,250,0.55)'; g.fillRect(hash(i, 31) * w | 0, hash(i, 32) * h | 0, Z(3 + (hash(i, 33) * 4 | 0)), 1); } }));
  P('field', nz(32, 32, '#a6cc7a', ['#9ac06e', '#b2d888'], 260));
  P('mud', nz(32, 32, '#9a8a6c', ['#8a7a5c', '#a89878', '#7e6e52'], 300));
  return PAT;
}
// detail halus tanah di shader: bintik 1/32 petak (seukuran voxel) menumpang di atas tekstur tanah
export function groundDetail(mat, amount = 0.07) {
  mat.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vGP;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vGP = (modelMatrix * vec4(transformed, 1.0)).xz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vGP; float gh(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }')
      .replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= ' + (1 - amount).toFixed(3) + ' + ' + (2 * amount).toFixed(3) + ' * gh(floor(vGP * 32.0));');
  };
  mat.customProgramCacheKey = () => 'gdet' + amount;
  return mat;
}
