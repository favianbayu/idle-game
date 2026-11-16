// Rangka Raka: bagian badan kaku (voxel tetap tajam) digerakkan oleh sendi.
// Parameter pose SAMA dengan humanShape di game3d/src/voxlib.js (lean, thL, knL, arL, elL, spL, tw, hy, hp, sy, ...),
// jadi semua ANIMS game langsung jalan. 'L' = sisi y negatif (sama dengan kode lama).
// Koordinat model: x maju, y samping, z naik; satuan voxel (1 voxel = 1/32 petak).
export const POSE0 = {
  lean: 0.03, hp: 0, thL: 0, thR: 0, knL: 0.1, knR: 0.1,
  arL: 0.08, arR: 0.08, elL: 0.25, elR: 0.25, spL: 0.12, spR: 0.12,
  tw: 0, px: 0, jump: 0, yaw: 0, hy: 0, sy: 0, ftL: 0, ftR: 0,
  // tambahan rangka baru
  hr: 0,            // kepala miring ke samping
  lgL: 0, lgR: 0,   // kaki membuka ke samping
  tail: 0,          // ekor mullet terbang ke belakang
  roll: 0,          // seluruh badan berputar ke depan (guling)
  bob: 0,           // badan naik-turun tanpa lepas dari tanah
};
// matriks: [r00..r22 (baris), tx, ty, tz]
const ID = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
export function mul(A, B) {
  const o = new Array(12);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) o[r * 3 + c] = A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c];
    o[9 + r] = A[r * 3] * B[9] + A[r * 3 + 1] * B[10] + A[r * 3 + 2] * B[11] + A[9 + r];
  }
  return o;
}
export const tr = (x, y, z) => [1, 0, 0, 0, 1, 0, 0, 0, 1, x, y, z];
// rotY(a): arah "bawah" (0,0,-1) berayun ke depan (+x) sebesar a
export const rotY = a => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 1, 0, s, 0, c, 0, 0, 0]; };
// rotX(b): arah "bawah" berayun ke +y
export const rotX = b => { const c = Math.cos(b), s = Math.sin(b); return [1, 0, 0, 0, c, -s, 0, s, c, 0, 0, 0]; };
export const rotZ = g => { const c = Math.cos(g), s = Math.sin(g); return [c, -s, 0, s, c, 0, 0, 0, 1, 0, 0, 0]; };
export const apply = (M, p) => [M[0] * p[0] + M[1] * p[1] + M[2] * p[2] + M[9], M[3] * p[0] + M[4] * p[1] + M[5] * p[2] + M[10], M[6] * p[0] + M[7] * p[1] + M[8] * p[2] + M[11]];
const chain = (...ms) => ms.reduce(mul);

// titik sendi di pose diam (koordinat model)
export const PIV = {
  pelvis: [0, 0, 14.5], chest: [0, 0, 16], head: [0, 0, 27], tail: [-4, 0, 28],
  armL: [0, -7, 23.5], armR: [0, 7, 23.5], foreL: [0, -7, 18.5], foreR: [0, 7, 18.5],
  thighL: [0, -3, 14.5], thighR: [0, 3, 14.5], shinL: [0, -3, 7.5], shinR: [0, 3, 7.5], footL: [0, -3, 3.5], footR: [0, 3, 3.5],
  flapB: [-3.5, 0, 14.5], flapF: [3.5, 0, 14.5],
};
const S = 1.3;   // faktor satuan pose lama (px, sy, jump dalam "unit")
const GROUND = ['footL', 'footR', 'shinL', 'shinR', 'thighL', 'thighR', 'pelvis', 'chest', 'head', 'armL', 'armR', 'foreL', 'foreR'];

/* rigPose(P, boxes) -> { mats: {bagian: matriks}, lift, buttZ }
   boxes: kotak batas tiap bagian (relatif pivot) untuk menapakkan titik terendah ke tanah. */
export function rigPose(P0, boxes) {
  const P = Object.assign({}, POSE0, P0), m = {};
  const T = chain(tr(P.px * S, P.sy * S, 0), rotY(-P.lean));
  m.pelvis = T;
  const C = chain(T, tr(0, 0, 1.5), rotZ(P.tw));
  m.chest = C;
  const ha = P.lean + P.hp;
  const neck = apply(C, [0, 0, 11]);
  const H = chain(tr(...neck), rotY(-ha), rotZ(P.hy), rotX(P.hr));
  m.head = H;
  // ekor mullet: ikut kepala, tapi cenderung menggantung tegak & terbang ke belakang saat bergerak
  m.tail = chain(H, tr(-4, 0, 1), rotY(Math.max(-0.15, Math.min(1.2, ha * 0.8)) - P.tail));
  for (const [k, s] of [['L', -1], ['R', 1]]) {
    const sh = apply(C, [0, s * 7, 7.5]);
    const U = chain(tr(...sh), rotY(P['ar' + k]), rotX(s * P['sp' + k]));
    m['arm' + k] = U;
    const el = apply(U, [0, 0, -5]);
    m['fore' + k] = chain(tr(...el), rotY(P['ar' + k] + P['el' + k]), rotX(s * P['sp' + k] * 0.5));
    const hip = apply(T, [0, s * 3, 0]);
    const th = P['th' + k], kn = P['kn' + k], lg = s * P['lg' + k];
    const Th = chain(tr(...hip), rotX(lg), rotY(th));
    m['thigh' + k] = Th;
    const kp = apply(Th, [0, 0, -7]);
    const Sh = chain(tr(...kp), rotX(lg), rotY(th - kn));
    m['shin' + k] = Sh;
    const an = apply(Sh, [0, 0, -4]);
    m['foot' + k] = chain(tr(...an), rotX(lg * 0.4), rotY(th - kn + P['ft' + k]));
  }
  // kain di pinggang (lengan jaket / ujung kemeja) ikut terdorong paha
  const back = Math.max(0, -P.thL, -P.thR, 0), front = Math.max(0, P.thL, P.thR);
  // (tetap menggantung tegak walau badan condong; terdorong kalau paha berayun)
  m.flapB = chain(T, tr(-3.5, 0, 0), rotY(Math.max(-1.6, Math.min(0.5, P.lean - back * 0.9))));
  m.flapF = chain(T, tr(3.5, 0, 0), rotY(Math.max(-0.4, Math.min(1.7, P.lean + front * 0.95))));
  // guling: putar semua terhadap pusat badan
  if (P.roll) { const R = chain(tr(0, 0, 6), rotY(-P.roll), tr(0, 0, -6)); for (const k in m) m[k] = mul(R, m[k]); }
  // menapak: titik terendah badan menyentuh tanah
  let lo = 1e9;
  for (const k of GROUND) {
    const b = boxes[k]; if (!b) continue;
    for (let i = 0; i < 8; i++) {
      const p = apply(m[k], [b[i & 1 ? 3 : 0], b[i & 2 ? 4 : 1], b[i & 4 ? 5 : 2]]);
      if (p[2] < lo) lo = p[2];
    }
  }
  const lift = P.jump * S, G = chain(rotZ(P.yaw || 0), tr(0, 0, -lo + lift + P.bob));
  for (const k in m) m[k] = mul(G, m[k]);
  return { mats: m, lift, buttZ: apply(m.pelvis, [-1, 0, -2])[2], buttX: apply(m.pelvis, [-1, 0, -2])[0] };
}

// cahaya (ruang model, ikut tokoh: sama seperti di game) -> faktor terang per sisi
const LIGHT = (() => { const v = [0.62, -0.38, 0.72], l = Math.hypot(...v); return v.map(c => c / l); })();
const AO = [0.6, 0.76, 0.9, 1];
/* bake(parts, mats) -> { pos, col, n }: segitiga siap gambar (6 titik per sisi voxel), warna sudah membawa cahaya.
   Format ini bisa langsung dijadikan BufferGeometry di game (posisi dalam voxel; kali 1/32 untuk petak). */
export function bake(parts, mats, out) {
  let n = 0; for (const p of parts) n += p.mesh.n;
  const pos = out && out.pos.length >= n * 18 ? out.pos : new Float32Array(n * 18), col = out && out.col.length >= n * 18 ? out.col : new Float32Array(n * 18);
  let o = 0;
  const q = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], sh = [0, 0, 0, 0];
  for (const part of parts) {
    const M = mats[part.name], g = part.mesh;
    for (let i = 0; i < g.n; i++) {
      const nx = g.nrm[i * 3], ny = g.nrm[i * 3 + 1], nz = g.nrm[i * 3 + 2];
      const wx = M[0] * nx + M[1] * ny + M[2] * nz, wy = M[3] * nx + M[4] * ny + M[5] * nz, wz = M[6] * nx + M[7] * ny + M[8] * nz;
      const d = wx * LIGHT[0] + wy * LIGHT[1] + wz * LIGHT[2];
      const f = (part.flat ? 0.9 : 0.6) + (part.flat ? 0.12 : 0.44) * (0.5 + 0.5 * d);
      for (let c = 0; c < 4; c++) {
        const x = g.pos[i * 12 + c * 3], y = g.pos[i * 12 + c * 3 + 1], z = g.pos[i * 12 + c * 3 + 2];
        q[c * 3] = M[0] * x + M[1] * y + M[2] * z + M[9]; q[c * 3 + 1] = M[3] * x + M[4] * y + M[5] * z + M[10]; q[c * 3 + 2] = M[6] * x + M[7] * y + M[8] * z + M[11];
        sh[c] = f * AO[g.ao[i * 4 + c]];
      }
      const flip = g.ao[i * 4] + g.ao[i * 4 + 2] < g.ao[i * 4 + 1] + g.ao[i * 4 + 3];
      const order = flip ? [1, 2, 3, 1, 3, 0] : [0, 1, 2, 0, 2, 3];
      const r = g.col[i * 3], gg = g.col[i * 3 + 1], b = g.col[i * 3 + 2];
      for (const c of order) {
        pos[o] = q[c * 3]; pos[o + 1] = q[c * 3 + 1]; pos[o + 2] = q[c * 3 + 2];
        col[o] = r * sh[c]; col[o + 1] = gg * sh[c]; col[o + 2] = b * sh[c];
        o += 3;
      }
    }
  }
  return { pos, col, n: n * 6 };
}
