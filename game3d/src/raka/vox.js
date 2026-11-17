// Kisi voxel jarang untuk menggambar bagian badan + pengubah ke kisi padat (cepat dibaca saat voxel ulang per frame).
export class Vox {
  constructor() { this.m = new Map(); }
  static k(x, y, z) { return (x + 128) + (y + 128) * 256 + (z + 128) * 65536; }
  set(x, y, z, c) { const k = Vox.k(x, y, z); if (c) this.m.set(k, c); else this.m.delete(k); return this; }
  get(x, y, z) { return this.m.get(Vox.k(x, y, z)); }
  has(x, y, z) { return this.m.has(Vox.k(x, y, z)); }
  box(x0, y0, z0, x1, y1, z1, c) {   // kotak inklusif
    for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
      for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) this.set(x, y, z, c);
    return this;
  }
  // satu lapis persegi bersudut bulat (radius r) di ketinggian z
  rrect(z, x0, y0, x1, y1, c, r = 0) {
    const mx = (x0 + x1 + 1) / 2, my = (y0 + y1 + 1) / 2, hx = (x1 - x0 + 1) / 2, hy = (y1 - y0 + 1) / 2; r = Math.min(r, hx, hy);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = Math.max(0, Math.abs(x + 0.5 - mx) - (hx - r)), dy = Math.max(0, Math.abs(y + 0.5 - my) - (hy - r));
      if (dx * dx + dy * dy <= r * r + 0.3) this.set(x, y, z, c);
    }
    return this;
  }
  rbox(x0, y0, z0, x1, y1, z1, c, r = 0) { for (let z = z0; z <= z1; z++) this.rrect(z, x0, y0, x1, y1, c, r); return this; }
  // isi hanya sel yang masih kosong (untuk lapisan luar: rambut, kain, helm)
  fillE(x0, y0, z0, x1, y1, z1, c) { for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!this.has(x, y, z)) this.set(x, y, z, c); return this; }
  shell(z, x0, y0, x1, y1, c, r = 0) {
    const mx = (x0 + x1 + 1) / 2, my = (y0 + y1 + 1) / 2, hx = (x1 - x0 + 1) / 2, hy = (y1 - y0 + 1) / 2; r = Math.min(r, hx, hy);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = Math.max(0, Math.abs(x + 0.5 - mx) - (hx - r)), dy = Math.max(0, Math.abs(y + 0.5 - my) - (hy - r));
      if (dx * dx + dy * dy <= r * r + 0.3 && !this.has(x, y, z)) this.set(x, y, z, c);
    }
    return this;
  }
  // warnai ulang voxel yang sudah ada (tidak menambah)
  paint(x0, y0, z0, x1, y1, z1, c) {
    for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
      for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) if (this.has(x, y, z)) this.set(x, y, z, c);
    return this;
  }
  // voxel terluar di arah tertentu (untuk menggambar di permukaan yang melengkung)
  front(y, z, lo = -40) { for (let x = 40; x >= lo; x--) if (this.has(x, y, z)) return x; return null; }
  back(y, z, hi = 40) { for (let x = -40; x <= hi; x++) if (this.has(x, y, z)) return x; return null; }
  sideP(x, z) { for (let y = 40; y >= -40; y--) if (this.has(x, y, z)) return y; return null; }
  sideN(x, z) { for (let y = -40; y <= 40; y++) if (this.has(x, y, z)) return y; return null; }
  pf(y, z, c, d = 1) { const x = this.front(y, z); if (x !== null) for (let i = 0; i < d; i++) if (this.has(x - i, y, z)) this.set(x - i, y, z, c); return this; }
  pb(y, z, c) { const x = this.back(y, z); if (x !== null) this.set(x, y, z, c); return this; }
  pfBox(y0, z0, y1, z1, c) { for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) this.pf(y, z, c); return this; }
  pbBox(y0, z0, y1, z1, c) { for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) this.pb(y, z, c); return this; }
  psBox(sgn, x0, z0, x1, z1, c) { for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) { const y = sgn > 0 ? this.sideP(x, z) : this.sideN(x, z); if (y !== null) this.set(x, y, z, c); } return this; }
  each(fn) { for (const [k, c] of this.m) fn((k & 255) - 128, ((k >> 8) & 255) - 128, (k >> 16) - 128, c); }
  mirrorY() { const o = new Vox(); this.each((x, y, z, c) => o.set(x, -1 - y, z, c)); return o; }
  add(o) { o.each((x, y, z, c) => this.set(x, y, z, c)); return this; }
}
// kisi padat: { o:[x0,y0,z0], n:[nx,ny,nz], d: Uint16Array (0 = kosong, i = indeks bahan + 1) }
export function dense(v, matIndex) {
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  v.each((x, y, z) => { lo[0] = Math.min(lo[0], x); lo[1] = Math.min(lo[1], y); lo[2] = Math.min(lo[2], z); hi[0] = Math.max(hi[0], x); hi[1] = Math.max(hi[1], y); hi[2] = Math.max(hi[2], z); });
  const n = [hi[0] - lo[0] + 1, hi[1] - lo[1] + 1, hi[2] - lo[2] + 1], d = new Uint16Array(n[0] * n[1] * n[2]);
  v.each((x, y, z, c) => { d[((z - lo[2]) * n[1] + (y - lo[1])) * n[0] + (x - lo[0])] = matIndex(c); });
  return { o: lo, n, d };
}
// ---- mesh kotak dengan cahaya per sisi (hanya untuk properti: motor)
const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
const LIGHT = (() => { const v = [0.62, -0.38, 0.72], l = Math.hypot(...v); return v.map(c => c / l); })();
export function propMesh(v, pal, scale = 1, off = [0, 0, 0]) {
  const pos = [], col = [];
  v.each((x, y, z, c) => {
    const rgb = hex(pal[c] || '#ff00ff');
    for (const d of DIRS) {
      if (v.has(x + d[0], y + d[1], z + d[2])) continue;
      const a = d[0] ? 0 : d[1] ? 1 : 2, u = (a + 1) % 3, w = (a + 2) % 3, base = [x, y, z]; if (d[a] > 0) base[a] += 1;
      const f = 0.62 + 0.42 * (0.5 + 0.5 * (d[0] * LIGHT[0] + d[1] * LIGHT[1] + d[2] * LIGHT[2]));
      for (const [cu, cw] of [[0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]]) { const p = base.slice(); p[u] += cu; p[w] += cw; pos.push(p[0] * scale + off[0], p[1] * scale + off[1], p[2] * scale + off[2]); col.push(rgb[0] * f, rgb[1] * f, rgb[2] * f); }
    }
  });
  return { pos: new Float32Array(pos), col: new Float32Array(col), n: pos.length / 3 };
}
