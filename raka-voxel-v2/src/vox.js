// Kisi voxel jarang + pembuat mesh (sisi tertutup dibuang, ambient occlusion per sudut).
export class Vox {
  constructor() { this.m = new Map(); }
  static k(x, y, z) { return (x + 128) + (y + 128) * 256 + (z + 128) * 65536; }
  set(x, y, z, c) { const k = Vox.k(x, y, z); if (c) this.m.set(k, c); else this.m.delete(k); return this; }
  get(x, y, z) { return this.m.get(Vox.k(x, y, z)); }
  has(x, y, z) { return this.m.has(Vox.k(x, y, z)); }
  // kotak inklusif
  box(x0, y0, z0, x1, y1, z1, c) {
    for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
      for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) this.set(x, y, z, c);
    return this;
  }
  // warnai ulang voxel yang sudah ada (tidak menambah)
  paint(x0, y0, z0, x1, y1, z1, c) {
    for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
      for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) if (this.has(x, y, z)) this.set(x, y, z, c);
    return this;
  }
  each(fn) { for (const [k, c] of this.m) fn((k & 255) - 128, ((k >> 8) & 255) - 128, (k >> 16) - 128, c); }
  mirrorY() { const o = new Vox(); this.each((x, y, z, c) => o.set(x, -1 - y, z, c)); return o; }
  add(o) { o.each((x, y, z, c) => this.set(x, y, z, c)); return this; }
}
const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
/* mesh(v, pal, pivot) -> { n, pos[n*12], nrm[n*3], col[n*3], ao[n*4] }  (posisi relatif terhadap pivot) */
export function meshVox(v, pal, pivot = [0, 0, 0]) {
  const pos = [], nrm = [], col = [], ao = [];
  v.each((x, y, z, c) => {
    const rgb = hex(pal[c] || '#ff00ff');
    for (const d of DIRS) {
      if (v.has(x + d[0], y + d[1], z + d[2])) continue;
      const a = d[0] ? 0 : d[1] ? 1 : 2, u = (a + 1) % 3, w = (a + 2) % 3;
      const base = [x, y, z]; if (d[a] > 0) base[a] += 1;
      const nb = [x + d[0], y + d[1], z + d[2]];
      for (const [cu, cw] of [[0, 0], [1, 0], [1, 1], [0, 1]]) {
        const p = base.slice(); p[u] += cu; p[w] += cw;
        pos.push(p[0] - pivot[0], p[1] - pivot[1], p[2] - pivot[2]);
        const su = nb.slice(), sw = nb.slice(), sc = nb.slice();
        su[u] += cu * 2 - 1; sw[w] += cw * 2 - 1; sc[u] += cu * 2 - 1; sc[w] += cw * 2 - 1;
        const s1 = v.has(...su) ? 1 : 0, s2 = v.has(...sw) ? 1 : 0, s3 = v.has(...sc) ? 1 : 0;
        ao.push(s1 && s2 ? 0 : 3 - (s1 + s2 + s3));
      }
      nrm.push(d[0], d[1], d[2]); col.push(rgb[0], rgb[1], rgb[2]);
    }
  });
  return { n: nrm.length / 3, pos: new Float32Array(pos), nrm: new Float32Array(nrm), col: new Float32Array(col), ao: new Uint8Array(ao) };
}
