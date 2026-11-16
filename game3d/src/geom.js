// Penggabung geometri statis: semua kotak/atap di satu potongan (chunk) dunia jadi SATU mesh,
// supaya draw call sedikit (penting untuk HP). Warna per-vertex, tanpa tekstur.
import * as THREE from 'three';

const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
export function col(c) {   // '#rrggbb' | [r,g,b] (0-255) -> warna linear [r,g,b]
  if (typeof c === 'string') { const n = parseInt(c.slice(1), 16); c = [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  return [lin(c[0]), lin(c[1]), lin(c[2])];
}
export const shade = (c, f) => [c[0] * f, c[1] * f, c[2] * f];
export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export class Merger {
  constructor() { this.pos = []; this.nor = []; this.col = []; this.idx = []; this.n = 0; }
  // xf: { x, z, a } -> titik lokal (lx, ly, lz) diputar a (radian, sama dengan putaran peta) lalu digeser
  quad(p, nrm, c) {
    const b = this.n;
    for (const v of p) { this.pos.push(v[0], v[1], v[2]); this.nor.push(nrm[0], nrm[1], nrm[2]); this.col.push(c[0], c[1], c[2]); }
    this.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    this.n += 4;
  }
  tri(p, nrm, c) {
    const b = this.n;
    for (const v of p) { this.pos.push(v[0], v[1], v[2]); this.nor.push(nrm[0], nrm[1], nrm[2]); this.col.push(c[0], c[1], c[2]); }
    this.idx.push(b, b + 1, b + 2);
    this.n += 3;
  }
  // poligon datar / miring sembarang (cembung) dengan normal dihitung otomatis
  poly(p, c) {
    const a = p[0], b = p[1], d = p[2];
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
    let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const l = Math.hypot(...n) || 1; n = n.map(k => k / l);
    const base = this.n;
    for (const q of p) { this.pos.push(q[0], q[1], q[2]); this.nor.push(n[0], n[1], n[2]); this.col.push(c[0], c[1], c[2]); }
    for (let i = 1; i < p.length - 1; i++) this.idx.push(base, base + i, base + i + 1);
    this.n += p.length;
  }
  // bidang dua sisi (atap teras/kanopi tipis): terlihat dari atas maupun bawah
  poly2(p, c) { this.poly(p, c); this.poly(p.slice().reverse(), shade(c, 0.7)); }
  // geometri bebas (bola daun, batang silinder, kerucut): tiap segitiga warna sendiri (low-poly), opsi dua sisi
  // t: { x, y, z, rx, ry, rz, sx, sy, sz }, c: [r,g,b] atau fn(cx, cy, cz, nx, ny, nz) -> [r,g,b]; o.noise: geser verteks acak
  addGeo(geo, t, c, o = {}) {
    const g = geo.index ? geo.toNonIndexed() : geo, P = g.attributes.position, M = new THREE.Matrix4(), q = new THREE.Quaternion();
    M.compose(new THREE.Vector3(t.x || 0, t.y || 0, t.z || 0), q.setFromEuler(new THREE.Euler(t.rx || 0, t.ry || 0, t.rz || 0, 'YXZ')), new THREE.Vector3(t.sx ?? t.s ?? 1, t.sy ?? t.s ?? 1, t.sz ?? t.s ?? 1));
    const v = new THREE.Vector3(), pts = [], nz = o.noise || 0, seed = o.seed || 1;
    const jit = (x, y, z) => { if (!nz) return [x, y, z]; const h = k => { let n = Math.sin(x * 12.9898 * k + y * 78.233 + z * 37.719 * k + seed * 1.37) * 43758.5453; return n - Math.floor(n) - 0.5; }; return [x + h(1) * nz, y + h(2) * nz, z + h(3) * nz]; };
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); pts.push(jit(v.x, v.y, v.z)); }
    for (let i = 0; i < pts.length; i += 3) {
      const tri = [pts[i], pts[i + 1], pts[i + 2]].map(p => { v.set(p[0], p[1], p[2]).applyMatrix4(M); return [v.x, v.y, v.z]; });
      const ux = tri[1][0] - tri[0][0], uy = tri[1][1] - tri[0][1], uz = tri[1][2] - tri[0][2], wx = tri[2][0] - tri[0][0], wy = tri[2][1] - tri[0][1], wz = tri[2][2] - tri[0][2];
      let n = [uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx]; const l = Math.hypot(...n) || 1; n = n.map(k => k / l);
      const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3, cz = (tri[0][2] + tri[1][2] + tri[2][2]) / 3;
      const cc = typeof c === 'function' ? c(cx, cy, cz, n[0], n[1], n[2]) : c;
      this.tri(tri, n, cc);
      if (o.twoSided) this.tri([tri[0], tri[2], tri[1]], [-n[0], -n[1], -n[2]], shade(cc, 0.8));
    }
  }
  // kotak: pusat dasar (lx, ly, lz) lokal, ukuran sx (lebar, sumbu x lokal), sy (tinggi), sz (dalam)
  box(xf, lx, ly, lz, sx, sy, sz, c, o = {}) {
    const T = (x, y, z) => tf(xf, x, y, z);
    const x0 = lx - sx / 2, x1 = lx + sx / 2, z0 = lz - sz / 2, z1 = lz + sz / 2, y0 = ly, y1 = ly + sy;
    const N = v => tn(xf, v);
    const top = o.top || c, side = c;
    if (globalThis.__TRACE && ly < 1.5) globalThis.__TRACE.push({ p: [T(x0, 0, z0), T(x1, 0, z0), T(x1, 0, z1), T(x0, 0, z1), T(lx, 0, lz)], y0: (xf.y || 0) + y0, y1: (xf.y || 0) + y1, veh: globalThis.__VEHCUR || 0, st: new Error().stack.split('\n').slice(2, 5).join(' ') });
    this.quad([T(x0, y1, z1), T(x1, y1, z1), T(x1, y1, z0), T(x0, y1, z0)], N([0, 1, 0]), top);
    this.quad([T(x0, y0, z1), T(x1, y0, z1), T(x1, y1, z1), T(x0, y1, z1)], N([0, 0, 1]), side);
    this.quad([T(x1, y0, z0), T(x0, y0, z0), T(x0, y1, z0), T(x1, y1, z0)], N([0, 0, -1]), side);
    this.quad([T(x1, y0, z1), T(x1, y0, z0), T(x1, y1, z0), T(x1, y1, z1)], N([1, 0, 0]), side);
    this.quad([T(x0, y0, z0), T(x0, y0, z1), T(x0, y1, z1), T(x0, y1, z0)], N([-1, 0, 0]), side);
    if (o.bottom) this.quad([T(x0, y0, z0), T(x1, y0, z0), T(x1, y0, z1), T(x0, y0, z1)], N([0, -1, 0]), side);
  }
  // atap pelana: bubungan sejajar sumbu x lokal (sx), sisi miring ke ±z
  gable(xf, lx, ly, lz, sx, sz, h, c, ov = 0.25, wallC = null) {
    const T = (x, y, z) => tf(xf, x, y, z);
    const x0 = lx - sx / 2 - ov, x1 = lx + sx / 2 + ov, z0 = lz - sz / 2 - ov, z1 = lz + sz / 2 + ov, y1 = ly + h;
    const dark = shade(c, 0.78);
    this.poly([T(x0, ly, z1), T(x1, ly, z1), T(x1, y1, lz), T(x0, y1, lz)], c);
    this.poly([T(x1, ly, z0), T(x0, ly, z0), T(x0, y1, lz), T(x1, y1, lz)], dark);
    const w = wallC || shade(c, 0.9);
    this.poly([T(x1 - ov, ly, z1 - ov), T(x1 - ov, ly, z0 + ov), T(x1 - ov, y1, lz)], w);
    this.poly([T(x0 + ov, ly, z0 + ov), T(x0 + ov, ly, z1 - ov), T(x0 + ov, y1, lz)], w);
    // baris genteng (garis gelap sejajar bubungan) + nok di bubungan + lisplang di tepi
    if (sx > 0.8 && h > 0.25) {
      const rows = Math.max(2, Math.round((sz / 2) / 0.32)), L = 0.012, ny = (sz / 2 + ov), lift = (t, zz, side) => { const k = Math.hypot(h, ny), nY = ny / k * L, nZ = h / k * L * side; return [zz, nY, nZ]; };
      for (const side of [1, -1]) {
        const zE = side > 0 ? z1 : z0, [, nY, nZ] = lift(0, 0, side), lc = shade(c, side > 0 ? 0.84 : 0.66);
        for (let i = 1; i < rows; i++) {
          const t0 = i / rows, t1 = t0 + 0.045, zA = zE + (lz - zE) * t0, zB = zE + (lz - zE) * t1, yA = ly + h * t0, yB = ly + h * t1;
          const q = [T(x0, yA + nY, zA + nZ), T(x1, yA + nY, zA + nZ), T(x1, yB + nY, zB + nZ), T(x0, yB + nY, zB + nZ)];
          this.poly(side > 0 ? q : [q[1], q[0], q[3], q[2]], lc);
        }
      }
      this.box(xf, lx, y1 - 0.06, lz, sx + ov * 2 + 0.04, 0.12, 0.16, shade(c, 0.62));
    }
    // sisi bawah atap (supaya tidak bolong saat dilihat dari bawah/samping)
    this.poly([T(x1, ly, z1), T(x0, ly, z1), T(x0, y1, lz), T(x1, y1, lz)], shade(c, 0.5));
    this.poly([T(x0, ly, z0), T(x1, ly, z0), T(x1, y1, lz), T(x0, y1, lz)], shade(c, 0.5));
  }
  // atap limas (4 sisi miring)
  hip(xf, lx, ly, lz, sx, sz, h, c, ov = 0.3) {
    const T = (x, y, z) => tf(xf, x, y, z);
    const x0 = lx - sx / 2 - ov, x1 = lx + sx / 2 + ov, z0 = lz - sz / 2 - ov, z1 = lz + sz / 2 + ov, y1 = ly + h;
    const r = Math.max(0, (sx - sz) / 2);
    const ra = [lx - r, y1, lz], rb = [lx + r, y1, lz];
    const A = T(...ra), B = T(...rb);
    this.poly([T(x0, ly, z1), T(x1, ly, z1), B, A], c);
    this.poly([T(x1, ly, z0), T(x0, ly, z0), A, B], shade(c, 0.75));
    this.poly([T(x1, ly, z1), T(x1, ly, z0), B], shade(c, 0.88));
    this.poly([T(x0, ly, z0), T(x0, ly, z1), A], shade(c, 0.82));
    if (r > 0.2) this.box(xf, lx, y1 - 0.06, lz, r * 2 + 0.1, 0.12, 0.14, shade(c, 0.62));   // nok
    this.box(xf, lx, ly - 0.08, lz, sx + ov * 2, 0.08, sz + ov * 2, shade(c, 0.5), { bottom: true });   // tepi/lisplang
  }
  // kubah berundak (gaya voxel)
  dome(xf, lx, ly, lz, r, c, steps = 5) {
    for (let i = 0; i < steps; i++) {
      const t = i / steps, rr = r * Math.cos(t * Math.PI / 2), hh = r / steps;
      this.box(xf, lx, ly + r * Math.sin(t * Math.PI / 2), lz, rr * 2, hh * 1.05, rr * 2, shade(c, 0.85 + 0.15 * t), { top: shade(c, 1.05) });
    }
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setIndex(this.n > 65535 ? new THREE.Uint32BufferAttribute(this.idx, 1) : new THREE.Uint16BufferAttribute(this.idx, 1));
    g.computeBoundingSphere(); g.computeBoundingBox();
    return g;
  }
}
function tf(xf, x, y, z) {
  const c = xf.c ?? (xf.c = Math.cos(xf.a || 0)), s = xf.s ?? (xf.s = Math.sin(xf.a || 0));
  return [xf.x + x * c - z * s, (xf.y || 0) + y, xf.z + x * s + z * c];
}
function tn(xf, v) {
  const c = xf.c ?? (xf.c = Math.cos(xf.a || 0)), s = xf.s ?? (xf.s = Math.sin(xf.a || 0));
  return [v[0] * c - v[2] * s, v[1], v[0] * s + v[2] * c];
}

// Kumpulan Merger per potongan dunia (chunk) -> frustum culling otomatis per chunk
export class Chunks {
  constructor(size = 32) { this.size = size; this.map = new Map(); }
  at(x, z) {
    const k = Math.floor(x / this.size) + ',' + Math.floor(z / this.size);
    let m = this.map.get(k); if (!m) this.map.set(k, m = new Merger());
    return m;
  }
  meshes(material, o = {}) {
    const out = [];
    for (const m of this.map.values()) {
      if (!m.n) continue;
      const mesh = new THREE.Mesh(m.build(), material);
      mesh.castShadow = o.cast ?? true; mesh.receiveShadow = true; mesh.matrixAutoUpdate = false;
      out.push(mesh);
    }
    return out;
  }
}
