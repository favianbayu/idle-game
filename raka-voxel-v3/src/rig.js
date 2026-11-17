// Rangka Raka. Parameter pose SAMA dengan humanShape di game3d/src/voxlib.js (lean, thL, knL, arL, elL, spL, tw, hy,
// hp, sy, ...), jadi semua ANIMS game langsung jalan. 'L' = sisi y negatif (sama dengan kode lama).
// Koordinat model: x maju, y samping, z naik; satuan = voxel halus (1/64 petak, 2x lebih rapat dari tokoh lama).
export const POSE0 = {
  lean: 0.03, hp: 0, thL: 0, thR: 0, knL: 0.1, knR: 0.1,
  arL: 0.08, arR: 0.08, elL: 0.25, elR: 0.25, spL: 0.12, spR: 0.12,
  tw: 0, px: 0, jump: 0, yaw: 0, hy: 0, sy: 0, ftL: 0, ftR: 0,
  hr: 0,            // kepala miring ke samping
  lgL: 0, lgR: 0,   // kaki membuka ke samping
  tail: 0,          // ekor mullet terbang ke belakang
  roll: 0,          // seluruh badan berputar ke depan (guling)
  bob: 0,           // badan naik-turun tanpa lepas dari tanah (satuan voxel lama)
};
// matriks: [r00..r22 (baris), tx, ty, tz]
export function mul(A, B) {
  const o = new Array(12);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) o[r * 3 + c] = A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c];
    o[9 + r] = A[r * 3] * B[9] + A[r * 3 + 1] * B[10] + A[r * 3 + 2] * B[11] + A[9 + r];
  }
  return o;
}
export const tr = (x, y, z) => [1, 0, 0, 0, 1, 0, 0, 0, 1, x, y, z];
export const rotY = a => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 1, 0, s, 0, c, 0, 0, 0]; };   // "bawah" berayun ke depan
export const rotX = b => { const c = Math.cos(b), s = Math.sin(b); return [1, 0, 0, 0, c, -s, 0, s, c, 0, 0, 0]; };   // "bawah" berayun ke +y
export const rotZ = g => { const c = Math.cos(g), s = Math.sin(g); return [c, -s, 0, s, c, 0, 0, 0, 1, 0, 0, 0]; };
export const apply = (M, p) => [M[0] * p[0] + M[1] * p[1] + M[2] * p[2] + M[9], M[3] * p[0] + M[4] * p[1] + M[5] * p[2] + M[10], M[6] * p[0] + M[7] * p[1] + M[8] * p[2] + M[11]];
const chain = (...ms) => ms.reduce(mul);

// titik sendi di pose diam (koordinat model, voxel halus). Tinggi & panjang ruas mengikuti rangka tokoh lama skala 1.3, dikali 2.
export const PIV = {
  pelvis: [0, 0, 32], chest: [0, 0, 36], head: [0, 0, 59],
  armL: [0, -9, 52], armR: [0, 9, 52], foreL: [0, -9, 41.5], foreR: [0, 9, 41.5],
  thighL: [0, -4.5, 32], thighR: [0, 4.5, 32], shinL: [0, -4.5, 18], shinR: [0, 4.5, 18], footL: [0, -4.5, 4.5], footR: [0, 4.5, 4.5],
  flapB: [-6, 0, 33], flapF: [6, 0, 33],
};
export const TAIL_PIV = [-5, 0, 1];   // di koordinat lokal kepala
const S = 2.6;   // satuan pose lama (px, sy, jump) -> voxel halus
const GROUND = ['footL', 'footR', 'shinL', 'shinR', 'thighL', 'thighR', 'pelvis', 'chest', 'head', 'armL', 'armR', 'foreL', 'foreR'];

/* rigPose(P, boxes) -> { mats, balls, lift, buttZ, buttX }
   boxes: kotak batas tiap bagian (relatif pivot) untuk menapakkan titik terendah ke tanah.
   balls: bola pengisi sendi [{ c, r, k }] (k = 'elbow' | 'knee' | 'shoulder' | 'hip' | 'neck'). */
export function rigPose(P0, boxes) {
  const P = Object.assign({}, POSE0, P0), m = {}, balls = [];
  const T = chain(tr(P.px * S, P.sy * S, 0), rotY(-P.lean));
  m.pelvis = T;
  const C = chain(T, tr(0, 0, 4), rotZ(P.tw));
  m.chest = C;
  const ha = P.lean + P.hp, neck = apply(C, [0, 0, 23]);
  const still = Math.abs(ha) < 0.1 && Math.abs(P.hy) < 0.1 && Math.abs(P.hr) < 0.1;   // kepala hampir tegak: jangan diputar, supaya piksel wajah tetap utuh
  const H = still ? tr(...neck) : chain(tr(...neck), rotY(-ha), rotZ(P.hy), rotX(P.hr));
  m.head = H;
  balls.push({ c: apply(C, [0, 0, 21.5]), r: 3.2, k: 'neck' });
  for (const [k, s] of [['L', -1], ['R', 1]]) {
    const sh = apply(C, [0, s * 9, 16]);
    const U = chain(tr(...sh), rotY(P['ar' + k]), rotX(s * P['sp' + k]));
    m['arm' + k] = U;
    const el = apply(U, [0, 0, -10.5]);
    m['fore' + k] = chain(tr(...el), rotY(P['ar' + k] + P['el' + k]), rotX(s * P['sp' + k] * 0.5));
    balls.push({ c: apply(C, [0, s * 8.6, 15.6]), r: 3.0, k: 'shoulder' }, { c: el, r: 2.9, k: 'elbow' });
    const hip = apply(T, [0, s * 4.5, 0]);
    const th = P['th' + k], kn = P['kn' + k], lg = s * P['lg' + k];
    const Th = chain(tr(...hip), rotX(lg), rotY(th));
    m['thigh' + k] = Th;
    const kp = apply(Th, [0, 0, -14]);
    const Sh = chain(tr(...kp), rotX(lg), rotY(th - kn));
    m['shin' + k] = Sh;
    const an = apply(Sh, [0, 0, -13.5]);
    m['foot' + k] = chain(tr(...an), rotX(lg * 0.4), rotY(th - kn + P['ft' + k]));
    balls.push({ c: apply(T, [0, s * 4.5, -1]), r: 3.9, k: 'hip' }, { c: kp, r: 3.5, k: 'knee' });
  }
  // kain di pinggang (jaket diikat) tetap menggantung tegak walau badan condong; terdorong kalau paha berayun
  const back = Math.max(0, -P.thL, -P.thR), front = Math.max(0, P.thL, P.thR);
  m.flapB = chain(T, tr(-6, 0, 1), rotY(Math.max(-1.6, Math.min(0.5, P.lean * (P.lean < 0 ? 0.45 : 1) - back * 0.9))));
  m.flapF = chain(T, tr(6, 0, 1), rotY(Math.max(-0.4, Math.min(1.7, P.lean + front * 0.95))));
  const all = M => { for (const k in m) m[k] = mul(M, m[k]); for (const b of balls) b.c = apply(M, b.c); };
  if (P.roll) all(chain(tr(0, 0, 14), rotY(-P.roll), tr(0, 0, -14)));
  // menapak: titik terendah badan menyentuh tanah
  let lo = 1e9;
  for (const k of GROUND) {
    const b = boxes[k]; if (!b) continue;
    for (let i = 0; i < 8; i++) { const p = apply(m[k], [b[i & 1 ? 3 : 0], b[i & 2 ? 4 : 1], b[i & 4 ? 5 : 2]]); if (p[2] < lo) lo = p[2]; }
  }
  all(chain(rotZ(P.yaw || 0), tr(0, 0, -lo + P.bob * 2)));
  if (still) for (let i = 9; i < 12; i++) m.head[i] = Math.round(m.head[i]);
  // ekor mullet: ikut kepala, cenderung menggantung tegak, terbang ke belakang saat bergerak
  const ta = Math.max(-0.15, Math.min(1.2, ha * 0.8)) - P.tail;
  m.tail = chain(m.head, tr(...TAIL_PIV), rotY(Math.abs(ta) < 0.05 ? 0 : ta));
  const butt = apply(m.pelvis, [-2, 0, -4]);
  return { mats: m, balls, lift: P.jump * S, buttZ: butt[2], buttX: butt[0],
    hands: ['foreL', 'foreR'].map(k => apply(m[k], [0, 0, -11])), feet: ['footL', 'footR'].map(k => apply(m[k], [2, 0, -4.5])) };
}
