// Satu frame Raka: pose -> semua bagian badan di-voxel ulang ke SATU kisi lurus (tidak ada kubus miring),
// lalu diwarnai per voxel dengan 4 tingkat warna seperti tokoh game (normal dari tetangga kosong -> cahaya).
// Hasil { L, W, H, vox } formatnya sama dengan buildVox di game3d/src/voxlib.js, hanya 1 voxel = 1/64 petak.
import { rigPose, apply } from './rig.js';

const NOFF = [];
for (let k = -3; k <= 3; k++) for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) { const d = i * i + j * j + k * k; if (d && d <= 9) NOFF.push(i, j, k, 1 / d); }
const LIGHT = (() => { const v = [0.45, -0.3, 0.84], l = Math.hypot(...v); return v.map(c => c / l); })();
const PAD = 3;

/* voxelFrame(P, pose) -> { L, W, H, vox, org, lift, buttX, buttZ, hands, feet }
   P = hasil buildParts (model.js). vox = [x, y, z, r, g, b, mask] per voxel permukaan; org = posisi sel (0,0,0) di koordinat tokoh. */
export function voxelFrame(P, pose) {
  const r = rigPose(pose, P.boxes, P.skel, P.tailPiv), items = [];
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (const p of P.parts) {
    const M = r.mats[p.name]; if (!M) continue;
    const b = p.box, bb = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
    for (let i = 0; i < 8; i++) {
      const q = apply(M, [b[i & 1 ? 3 : 0], b[i & 2 ? 4 : 1], b[i & 4 ? 5 : 2]]);
      for (let k = 0; k < 3; k++) { if (q[k] < bb[k]) bb[k] = q[k]; if (q[k] > bb[k + 3]) bb[k + 3] = q[k]; }
    }
    for (let k = 0; k < 3; k++) { if (bb[k] < lo[k]) lo[k] = bb[k]; if (bb[k + 3] > hi[k]) hi[k] = bb[k + 3]; }
    items.push({ p, M, bb });
  }
  for (const q of r.prims) {   // properti
    const e = q.t === 'cap' ? Math.max(q.r[0], q.r[1]) : q.t === 'sph' ? q.r : Math.hypot(...q.h) + 1;
    const pts = q.t === 'box' ? [q.p[0]] : q.p;
    for (const c of pts) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], c[k] - e); hi[k] = Math.max(hi[k], c[k] + e); }
  }
  const balls = r.balls.filter(b => P.ballMat[b.k]);
  for (const b of balls) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], b.c[k] - b.r); hi[k] = Math.max(hi[k], b.c[k] + b.r); }
  const x0 = Math.floor(lo[0]) - PAD, y0 = Math.floor(lo[1]) - PAD, z0 = Math.floor(lo[2]) - PAD;
  const L = Math.ceil(hi[0]) - x0 + PAD, W = Math.ceil(hi[1]) - y0 + PAD, H = Math.ceil(hi[2]) - z0 + PAD;
  const G = new Uint8Array(L * W * H), LW = L * W;
  // properti dulu (menang atas tangan yang menggenggamnya); ditandai supaya boleh menembus tanah
  const PR = r.prims.length ? new Uint8Array(L * W * H) : null;
  for (const q of r.prims) {
    const m = P.mat(q.mat), e = q.t === 'cap' ? Math.max(q.r[0], q.r[1]) : q.t === 'sph' ? q.r : Math.hypot(...q.h) + 1;
    const pts = q.t === 'box' ? [q.p[0]] : q.p, a = [1e9, 1e9, 1e9], b = [-1e9, -1e9, -1e9];
    for (const c of pts) for (let k = 0; k < 3; k++) { a[k] = Math.min(a[k], c[k] - e); b[k] = Math.max(b[k], c[k] + e); }
    let test;
    if (q.t === 'sph') { const c = q.p[0], rr = q.r * q.r; test = (x, y, z) => (x - c[0]) ** 2 + (y - c[1]) ** 2 + (z - c[2]) ** 2 <= rr; }
    else if (q.t === 'cap') {
      const [A, B] = q.p, ab = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], L2 = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2 || 1;
      test = (x, y, z) => { const ax = x - A[0], ay = y - A[1], az = z - A[2]; let t = (ax * ab[0] + ay * ab[1] + az * ab[2]) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t; const r = q.r[0] + (q.r[1] - q.r[0]) * t; return (ax - ab[0] * t) ** 2 + (ay - ab[1] * t) ** 2 + (az - ab[2] * t) ** 2 <= r * r; };
    } else {
      const c = q.p[0], ax = [1, 2, 3].map(i => [q.p[i][0] - c[0], q.p[i][1] - c[1], q.p[i][2] - c[2]]);
      test = (x, y, z) => { const d = [x - c[0], y - c[1], z - c[2]]; for (let i = 0; i < 3; i++) if (Math.abs(d[0] * ax[i][0] + d[1] * ax[i][1] + d[2] * ax[i][2]) > q.h[i]) return false; return true; };
    }
    for (let z = Math.max(z0, Math.floor(a[2])); z <= Math.min(z0 + H - 1, Math.ceil(b[2])); z++) for (let y = Math.floor(a[1]); y <= Math.ceil(b[1]); y++) for (let x = Math.floor(a[0]); x <= Math.ceil(b[0]); x++) {
      const idx = (z - z0) * LW + (y - y0) * L + (x - x0);
      if (!G[idx] && test(x + 0.5, y + 0.5, z + 0.5)) { G[idx] = m; PR[idx] = 1; }
    }
  }
  // bagian badan: tiap sel kisi dipetakan balik ke kisi lokal bagian itu (urutan = prioritas, yang pertama menang)
  // rok: voxel kain rok dari pinggul, panel, dan kaki ditandai, lalu tiap lapis z diisi selimut cembungnya (lihat bawah)
  const SK = P.skirt ? new Uint8Array(L * W * H) : null, SKM = P.skirt ? new Set(P.skirt.mats) : null;
  let skP = false;
  for (const { p, M, bb } of items) {
    skP = !!SK && P.skirt.parts.includes(p.name);
    const g = p.g, nx = g.n[0], ny = g.n[1], nz = g.n[2], d = g.d;
    const ox = p.piv[0] - g.o[0], oy = p.piv[1] - g.o[1], oz = p.piv[2] - g.o[2];
    const a0 = Math.max(0, Math.floor(bb[0]) - x0), a1 = Math.min(L - 1, Math.ceil(bb[3]) - x0);
    const b0 = Math.max(0, Math.floor(bb[1]) - y0), b1 = Math.min(W - 1, Math.ceil(bb[4]) - y0);
    const c0 = Math.max(0, Math.floor(bb[2]) - z0, -z0), c1 = Math.min(H - 1, Math.ceil(bb[5]) - z0);
    for (let c = c0; c <= c1; c++) for (let b = b0; b <= b1; b++) {
      const wx = x0 + a0 + 0.5 - M[9], wy = y0 + b + 0.5 - M[10], wz = z0 + c + 0.5 - M[11];
      let lx = M[0] * wx + M[3] * wy + M[6] * wz + ox, ly = M[1] * wx + M[4] * wy + M[7] * wz + oy, lz = M[2] * wx + M[5] * wy + M[8] * wz + oz;
      let idx = c * LW + b * L + a0;
      for (let a = a0; a <= a1; a++, idx++, lx += M[0], ly += M[1], lz += M[2]) {
        if (G[idx] || lx < 0 || ly < 0 || lz < 0 || lx >= nx || ly >= ny || lz >= nz) continue;
        const m = d[((lz | 0) * ny + (ly | 0)) * nx + (lx | 0)];
        if (m) { G[idx] = m; if (SK && skP && SKM.has(m)) SK[idx] = 1; }
      }
    }
  }
  // bola pengisi sendi (siku, lutut, bahu, pinggul, leher) supaya tidak ada celah saat ruas ditekuk
  for (const bl of balls) {
    const m = P.ballMat[bl.k], rr = bl.r * bl.r, c = bl.c;
    for (let z = Math.floor(c[2] - bl.r); z <= Math.ceil(c[2] + bl.r); z++) for (let y = Math.floor(c[1] - bl.r); y <= Math.ceil(c[1] + bl.r); y++) for (let x = Math.floor(c[0] - bl.r); x <= Math.ceil(c[0] + bl.r); x++) {
      const dx = x + 0.5 - c[0], dy = y + 0.5 - c[1], dz = z + 0.5 - c[2];
      if (dx * dx + dy * dy + dz * dz > rr) continue;
      const idx = (z - z0) * LW + (y - y0) * L + (x - x0);
      if (!G[idx]) { G[idx] = m; if (SK && SKM.has(m) && (bl.k === 'hip' || bl.k === 'knee')) SK[idx] = 1; }
    }
  }
  // rok tidak boleh terbelah saat kaki melangkah: per lapis z, isi lambung cembung (convex hull) semua voxel kain rok
  if (SK) fillSkirt(G, SK, L, W, H, P.skirt.fill);
  // menapak per voxel: voxel badan terendah (bukan properti) tepat di tanah (+ goyang 'bob')
  let zl = -1;
  for (let z = 0; z < H && zl < 0; z++) { const o = z * LW; for (let i = 0; i < LW; i++) if (G[o + i] && !(PR && PR[o + i])) { zl = z; break; } }
  const dz = zl < 0 ? 0 : z0 + zl - Math.round(r.bob || 0);
  // warna per voxel permukaan: tingkat warna (0..3) dari normal, lalu bintik lepas dirapikan
  const vox = [], ramps = P.ramps, NO = NOFF.length, TN = new Int8Array(G.length).fill(-1), surf = [];
  for (let z = PAD; z < H - PAD; z++) for (let y = PAD; y < W - PAD; y++) {
    let idx = z * LW + y * L + PAD;
    for (let x = PAD; x < L - PAD; x++, idx++) {
      const m = G[idx]; if (!m) continue;
      const mask = (G[idx + 1] ? 0 : 1) | (G[idx - 1] ? 0 : 2) | (G[idx + L] ? 0 : 4) | (G[idx - L] ? 0 : 8) | (G[idx + LW] ? 0 : 16) | (G[idx - LW] ? 0 : 32);
      if (!mask) continue;
      surf.push(idx, x, y, z, mask);
      if (ramps[m - 1].length === 1) continue;
      let nxs = 0, nys = 0, nzs = 0;
      for (let q = 0; q < NO; q += 4) if (!G[idx + NOFF[q] + NOFF[q + 1] * L + NOFF[q + 2] * LW]) { const w = NOFF[q + 3]; nxs += NOFF[q] * w; nys += NOFF[q + 1] * w; nzs += NOFF[q + 2] * w; }
      const l = Math.hypot(nxs, nys, nzs) || 1, w = 0.5 + 0.5 * (nxs * LIGHT[0] + nys * LIGHT[1] + nzs * LIGHT[2]) / l;
      TN[idx] = w < 0.13 ? 0 : w < 0.5 ? 1 : w < 0.82 ? 2 : 3;
    }
  }
  // bintik: voxel yang tingkat warnanya hampir sendirian di antara tetangga sebahan -> ikut tingkat terbanyak
  const fix = [], cnt = [0, 0, 0, 0];
  for (let s = 0; s < surf.length; s += 5) {
    const idx = surf[s], t = TN[idx]; if (t < 0) continue;
    const m = G[idx]; cnt[0] = cnt[1] = cnt[2] = cnt[3] = 0;
    for (let k = -1; k <= 1; k++) for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      if (!i && !j && !k) continue;
      const q = idx + i + j * L + k * LW;
      if (G[q] === m && TN[q] >= 0) cnt[TN[q]]++;
    }
    if (cnt[t] >= 2) continue;
    let best = t, bc = cnt[t];
    for (let u = 0; u < 4; u++) if (cnt[u] > bc) { bc = cnt[u]; best = u; }
    if (best !== t && bc >= 3) fix.push(idx, best);
  }
  for (let s = 0; s < fix.length; s += 2) TN[fix[s]] = fix[s + 1];
  for (let s = 0; s < surf.length; s += 5) {
    const idx = surf[s], rp = ramps[G[idx] - 1], c = rp[TN[idx] < 0 ? 0 : TN[idx]];
    vox.push(surf[s + 1], surf[s + 2], surf[s + 3], c[0], c[1], c[2], surf[s + 4]);
  }
  return { L, W, H, vox, org: [x0, y0, z0 - dz], lift: r.lift, buttX: r.buttX, buttZ: r.buttZ - dz, hands: r.hands.map(h => [h[0], h[1], h[2] - dz]), feet: r.feet.map(h => [h[0], h[1], h[2] - dz]) };
}

function fillSkirt(G, SK, L, W, H, fill) {
  const LW = L * W;
  for (let z = 0; z < H; z++) {
    const pts = [], o = z * LW;
    for (let y = 0; y < W; y++) for (let x = 0; x < L; x++) if (SK[o + y * L + x]) pts.push([x, y]);
    if (pts.length < 3) continue;
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    const hull = lo.slice(0, -1).concat(up.slice(0, -1));
    if (hull.length < 3) continue;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const [x, y] of hull) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const idx = o + y * L + x; if (G[idx]) continue;
      let inside = true;
      for (let i = 0; i < hull.length && inside; i++) { const a = hull[i], b = hull[(i + 1) % hull.length], e = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; if (cr(a, b, [x, y]) / e < -0.5) inside = false; }
      if (inside) G[idx] = fill;
    }
  }
}

// segitiga untuk pratinjau: satu warna rata per voxel (seperti MeshBasicMaterial + warna vertex di game)
const FACES = [[1, [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]], [2, [[0, 1, 0], [0, 0, 0], [0, 0, 1], [0, 1, 1]]], [4, [[1, 1, 0], [0, 1, 0], [0, 1, 1], [1, 1, 1]]],
  [8, [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]], [16, [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]], [32, [[0, 1, 0], [1, 1, 0], [1, 0, 0], [0, 0, 0]]]];
export function voxMesh(f, s = 1, off = [0, 0, 0]) {
  const v = f.vox, pos = [], col = [], ox = f.org ? f.org[0] : -f.L / 2, oy = f.org ? f.org[1] : -f.W / 2, oz = (f.org ? f.org[2] : 0) + (f.lift || 0);
  for (let k = 0; k < v.length; k += 7) for (const [bit, cs] of FACES) if (v[k + 6] & bit) for (const c of [0, 1, 2, 0, 2, 3]) {
    pos.push((v[k] + cs[c][0] + ox) * s + off[0], (v[k + 1] + cs[c][1] + oy) * s + off[1], (v[k + 2] + cs[c][2] + oz) * s + off[2]);
    col.push(v[k + 3] / 255, v[k + 4] / 255, v[k + 5] / 255);
  }
  return { pos: new Float32Array(pos), col: new Float32Array(col), n: pos.length / 3 };
}
