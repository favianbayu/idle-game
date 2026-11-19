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
  tool: 0, tl: 0,   // barang kegiatan (lihat ACT_ANIMS di voxlib.js) + parameter geraknya
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

// Rangka per tokoh (voxel halus). Raka = rangka tokoh lama skala 1.3, dikali 2.
//   ank: tinggi pergelangan kaki, shin/thigh: panjang ruas kaki, up: pinggul->dada, neck: dada->dasar kepala,
//   shY/shZ: bahu (samping, tinggi dari dada), upper: bahu->siku, hipY: lebar pinggul, ballR: skala bola sendi
export const SKEL_RAKA = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 23, shY: 9, shZ: 16, upper: 10.5, fore: 11, hipY: 4.5, flap: 6, ballR: 1 };
export function pivots(K) {
  const pz = K.ank + K.shin + K.thigh, cz = pz + K.up, az = cz + K.shZ;
  return {
    pelvis: [0, 0, pz], chest: [0, 0, cz], head: [0, 0, cz + K.neck],
    armL: [0, -K.shY, az], armR: [0, K.shY, az], foreL: [0, -K.shY, az - K.upper], foreR: [0, K.shY, az - K.upper],
    thighL: [0, -K.hipY, pz], thighR: [0, K.hipY, pz], shinL: [0, -K.hipY, pz - K.thigh], shinR: [0, K.hipY, pz - K.thigh],
    footL: [0, -K.hipY, K.ank], footR: [0, K.hipY, K.ank], flapB: [-K.flap, 0, pz + 1], flapF: [K.flap, 0, pz + 1],
  };
}
export const PIV = pivots(SKEL_RAKA);
export const TAIL_PIV = [-5, 0, 1];   // di koordinat lokal kepala
const S = 2.6;   // satuan pose lama (px, sy, jump) -> voxel halus
const GROUND = ['footL', 'footR', 'shinL', 'shinR', 'thighL', 'thighR', 'pelvis', 'chest', 'head', 'armL', 'armR', 'foreL', 'foreR'];

/* rigPose(P, boxes) -> { mats, balls, lift, buttZ, buttX }
   boxes: kotak batas tiap bagian (relatif pivot) untuk menapakkan titik terendah ke tanah.
   balls: bola pengisi sendi [{ c, r, k }] (k = 'elbow' | 'knee' | 'shoulder' | 'hip' | 'neck'). */
export function rigPose(P0, boxes, K = SKEL_RAKA, tailPiv = TAIL_PIV) {
  const P = Object.assign({}, POSE0, P0), m = {}, balls = [], br = K.ballR || 1;
  const T = chain(tr(P.px * S, P.sy * S, 0), rotY(-P.lean));
  m.pelvis = T;
  const C = chain(T, tr(0, 0, K.up), rotZ(P.tw));
  m.chest = C;
  const ha = P.lean + P.hp, neck = apply(C, [0, 0, K.neck]);
  const still = Math.abs(ha) < 0.1 && Math.abs(P.hy) < 0.1 && Math.abs(P.hr) < 0.1;   // kepala hampir tegak: jangan diputar, supaya piksel wajah tetap utuh
  const H = still ? tr(...neck) : chain(tr(...neck), rotY(-ha), rotZ(P.hy), rotX(P.hr));
  m.head = H;
  balls.push({ c: apply(C, [0, 0, K.neck - 1.5]), r: 3.2 * br, k: 'neck' });
  for (const [k, s] of [['L', -1], ['R', 1]]) {
    const sh = apply(C, [0, s * K.shY, K.shZ]);
    const U = chain(tr(...sh), rotY(P['ar' + k]), rotX(s * P['sp' + k]));
    m['arm' + k] = U;
    const el = apply(U, [0, 0, -K.upper]);
    m['fore' + k] = chain(tr(...el), rotY(P['ar' + k] + P['el' + k]), rotX(s * P['sp' + k] * 0.5));
    balls.push({ c: apply(C, [0, s * (K.shY - 0.4), K.shZ - 0.4]), r: 3.0 * br, k: 'shoulder' }, { c: el, r: 2.9 * br, k: 'elbow' });
    const hip = apply(T, [0, s * K.hipY, 0]);
    const th = P['th' + k], kn = P['kn' + k], lg = s * P['lg' + k];
    const Th = chain(tr(...hip), rotX(lg), rotY(th));
    m['thigh' + k] = Th;
    const kp = apply(Th, [0, 0, -K.thigh]);
    const Sh = chain(tr(...kp), rotX(lg), rotY(th - kn));
    m['shin' + k] = Sh;
    const an = apply(Sh, [0, 0, -K.shin]);
    m['foot' + k] = chain(tr(...an), rotX(lg * 0.4), rotY(th - kn + P['ft' + k]));
    balls.push({ c: apply(T, [0, s * K.hipY, -1]), r: 3.9 * br, k: 'hip' }, { c: kp, r: 3.5 * br, k: 'knee' });
  }
  // kain di pinggang (jaket diikat) tetap menggantung tegak walau badan condong; terdorong kalau paha berayun
  const back = Math.max(0, -P.thL, -P.thR), front = Math.max(0, P.thL, P.thR);
  m.flapB = chain(T, tr(-K.flap, 0, 1), rotY(Math.max(-1.6, Math.min(0.5, P.lean * (P.lean < 0 ? 0.45 : 1) - back * 0.9))));
  m.flapF = chain(T, tr(K.flap, 0, 1), rotY(Math.max(-0.4, Math.min(1.7, P.lean + front * 0.95))));
  // properti di tangan (format pose sama dengan humanShape: sword/swa, broom/bsw, rod/rpa, phone, box, book, orb)
  const prims = props(P, m, C, K);
  const all = M => { for (const k in m) m[k] = mul(M, m[k]); for (const b of balls) b.c = apply(M, b.c); for (const q of prims) q.p = q.p.map(v => apply(M, v)); };
  if (P.roll) all(chain(tr(0, 0, 14), rotY(-P.roll), tr(0, 0, -14)));
  // menapak: titik terendah badan menyentuh tanah
  let lo = 1e9;
  for (const k of GROUND) {
    const b = boxes[k]; if (!b) continue;
    for (let i = 0; i < 8; i++) { const p = apply(m[k], [b[i & 1 ? 3 : 0], b[i & 2 ? 4 : 1], b[i & 4 ? 5 : 2]]); if (p[2] < lo) lo = p[2]; }
  }
  all(chain(rotZ(P.yaw || 0), tr(0, 0, -lo + P.bob * 2)));
  groundProps(P, m, prims);
  if (still) for (let i = 9; i < 12; i++) m.head[i] = Math.round(m.head[i]);
  // ekor mullet: ikut kepala, cenderung menggantung tegak, terbang ke belakang saat bergerak
  const ta = Math.max(-0.15, Math.min(1.2, ha * 0.8)) - P.tail;
  m.tail = chain(m.head, tr(...tailPiv), rotY(Math.abs(ta) < 0.05 ? 0 : ta));
  const butt = apply(m.pelvis, [-2, 0, -4]);
  return { mats: m, balls, prims, bob: P.bob * 2, lift: P.jump * S, buttZ: butt[2], buttX: butt[0],
    hands: ['foreL', 'foreR'].map(k => apply(m[k], [0, 0, -K.fore])), feet: ['footL', 'footR'].map(k => apply(m[k], [2, 0, -4.5])) };
}

// ---- properti: primitif di koordinat model (p = titik yang ikut diputar/digeser bersama badan)
//   cap: p = [a, b], r = [r0, r1]  ·  sph: p = [c], r  ·  box: p = [c, c+maju, c+samping, c+atas], h = [setengah ukuran]
const U = S;   // 1 satuan pose lama = 2.6 voxel halus
const nrm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const addv = (a, d, k) => [a[0] + d[0] * k, a[1] + d[1] * k, a[2] + d[2] * k];
const rotYo = (v, t) => [v[0] * Math.cos(t) - v[2] * Math.sin(t), v[1], v[2] * Math.cos(t) + v[0] * Math.sin(t)];   // sama dengan voxlib
function props(P, m, C, K) {
  const out = [];
  if (!(P.sword > 0.5 || P.broom > 0.5 || P.rod > 0.5 || P.phone > 0.5 || P.box > 0.5 || P.book > 0.5 || P.orb > 0 || P.galon > 0.5 || P.tool >= 0.5)) return out;
  const hand = k => apply(m['fore' + k], [0.5, 0, -K.fore - 1.5]), elbow = k => apply(m['fore' + k], [0, 0, 0]);
  const hR = hand('R'), hL = hand('L'), fw = [Math.cos(P.lean), 0, -Math.sin(P.lean)], up = [Math.sin(P.lean), 0, Math.cos(P.lean)];
  const cap = (a, b, r0, r1, mat) => out.push({ t: 'cap', p: [a, b], r: [r0, r1], mat });
  if (P.orb > 0) out.push({ t: 'sph', p: [addv([(hR[0] + hL[0]) / 2, (hR[1] + hL[1]) / 2, (hR[2] + hL[2]) / 2], fw, 2.2 * U)], r: P.orb * U, mat: 'orb' });
  if (P.sword > 0.5) {
    const bd = rotYo(nrm([hR[0] - elbow('R')[0], hR[1] - elbow('R')[1], hR[2] - elbow('R')[2]]), P.swa);
    cap(addv(hR, bd, -1.2 * U), addv(hR, bd, 1.0 * U), 0.65 * U, 0.65 * U, 'hilt');
    cap(addv(hR, bd, 1.2 * U), addv(hR, bd, 1.45 * U), 1.9 * U, 1.9 * U, 'hilt');
    cap(addv(hR, bd, 1.6 * U), addv(hR, bd, 11 * U), 1.0 * U, 0.5 * U, 'blade');
  }
  if (P.phone > 0.5) { const d = nrm([hR[0] - elbow('R')[0], hR[1] - elbow('R')[1], hR[2] - elbow('R')[2]]), a = addv(hR, d, 1.0 * U); out.push({ t: 'box', p: [a, addv(a, fw, 1), addv(a, [0, 1, 0], 1), addv(a, up, 1)], h: [0.7, 1.4, 2.4], mat: 'phone' }); }
  if (P.box > 0.5 || P.book > 0.5) {
    const c = addv(addv([(hR[0] + hL[0]) / 2, (hR[1] + hL[1]) / 2, (hR[2] + hL[2]) / 2], fw, (P.box ? 1.4 : 0.5) * U), up, (P.box ? 0.4 : 0.6) * U);
    if (P.box > 0.5) {
      const ax = [c, addv(c, fw, 1), addv(c, [0, 1, 0], 1), addv(c, up, 1)];
      out.push({ t: 'box', p: ax.map(v => addv(v, up, 1.75 * U)), h: [2.0 * U, 0.4, 0.5], mat: 'seam' });
      out.push({ t: 'box', p: ax, h: [2.0 * U, 3.0 * U, 1.9 * U], mat: 'box' });
    } else {   // buku terbuka miring menghadap wajah
      const a = 0.65, f2 = addv([0, 0, 0], fw, Math.cos(a)), u2 = addv(addv([0, 0, 0], fw, -Math.sin(a)), up, Math.cos(a));
      const ax = [c, addv(c, f2, 1), addv(c, [0, 1, 0], 1), addv(c, u2, 1)];
      out.push({ t: 'box', p: ax.map(v => addv(v, f2, 0.4)), h: [0.6, 1.9 * U, 1.3 * U], mat: 'page' });
      out.push({ t: 'box', p: ax, h: [0.9, 2.1 * U, 1.5 * U], mat: 'book' });
    }
  }
  if (P.rod > 0.5) {
    const rd = nrm([Math.cos(P.rpa), 0, Math.sin(P.rpa)]), r0 = addv(hR, rd, -2.5 * U), r1 = addv(hR, rd, 24 * U);
    cap(r0, addv(hR, rd, 3 * U), 0.75 * U, 0.6 * U, 'hilt');
    cap(r0, r1, 0.5, 0.5, 'stick');
    if (P.rod > 1.5) cap(r1, addv(r1, [0, 0, 1], -9 * U), 0.5, 0.5, 'line');
  }
  if (P.galon > 0.5) {   // galon 19 L rebah di pundak kanan, menempel ke sisi kepala; leher galon menghadap belakang (ikut dada)
    const C0 = apply(m.chest, [0, 0, 0]), ax = nrm(apply(m.chest, [1, 0, 0]).map((v, i) => v - C0[i]));
    const c = apply(m.chest, [0, K.shY + 5, K.shZ + 8.5]), at = k => addv(c, ax, k);
    cap(at(-5), at(5), 7, 7, 'galon');
    for (const k of [-3, 0, 3]) cap(at(k - 0.3), at(k + 0.3), 7.5, 7.5, 'galonS');
    cap(at(-12), at(-13.5), 2.4, 2.4, 'galonT'); cap(at(-11), at(-12), 1.8, 1.8, 'galon');
  }
  if (P.broom > 0.5) {
    const brd = nrm([0.5, P.bsw, -1]);
    cap(addv(hR, brd, -3 * U), addv(hR, brd, 10 * U), 0.55 * U, 0.55 * U, 'stick');
    cap(addv(hR, brd, 9.5 * U), addv(hR, brd, 14 * U), 0.7 * U, 2.6 * U, 'bristle');
  }
  if (P.tool >= 0.5) tools(Math.round(P.tool), P, out, hR, hL, elbow('R'), elbow('L'), m, K);
  return out;
}

// ---- barang kegiatan (pose.tool). Arah: X = maju, Y = samping (kanan +), Z = naik, dalam koordinat model sebelum yaw.
const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// kotak berorientasi: c = pusat, a/b/n = sumbu (dinormalkan), h = setengah ukuran di tiap sumbu
const obox = (out, c, a, b, n, h, mat) => { a = nrm(a); b = nrm(b); n = nrm(n); out.push({ t: 'box', p: [c, addv(c, a, 1), addv(c, b, 1), addv(c, n, 1)], h, mat }); };
const capT = (out, a, b, r0, r1, mat) => out.push({ t: 'cap', p: [a, b], r: [r0, r1], mat });
const sphT = (out, c, r, mat) => out.push({ t: 'sph', p: [c], r, mat });
// silinder ujung datar (frame.js 't: cyl'): base, sumbu, panjang, jari-jari (r1 = jari-jari ujung atas, untuk wajan/ember)
const cyl = (out, base, axis, len, r, mat, r1 = r) => out.push({ t: 'cyl', p: [base, addv(base, axis, len)], r: [r, r1], mat });
function tools(id, P, out, hR, hL, eR, eL, m, K) {
  const dR = nrm(sub3(hR, eR)), dL = nrm(sub3(hL, eL));   // arah lengan bawah (siku -> kepalan)
  if (id === 1) {   // penggaris papan tulis di tangan kanan + buku di tangan kiri
    capT(out, addv(hR, dR, -1.5), addv(hR, dR, 30), 0.7, 0.6, 'tRuler');
    const c = addv(addv(hL, X, 2.5), Z, 1.5);
    obox(out, c, X, Y, Z, [0.6, 4.5, 5.5], 'tPaper'); obox(out, addv(c, X, -0.4), X, Y, Z, [0.9, 5, 6], 'book');
  } else if (id === 2) {   // wajan di tangan kiri, sutil di tangan kanan mengaduk
    const pc = addv(addv(hL, X, 7.5), Z, -1);
    cyl(out, addv(pc, Z, 1.2), Z, 0.8, 4.2, 'tFood');
    cyl(out, pc, Z, 2.4, 4.2, 'tIron', 6.2);
    capT(out, addv(hL, X, -1), addv(pc, nrm(sub3(hL, pc)), 7), 0.8, 0.8, 'stick');
    const tip = addv(addv(pc, Z, 2.6), [Math.cos(P.tl * 6.28), Math.sin(P.tl * 6.28), 0], 2);
    capT(out, addv(hR, nrm(sub3(hR, tip)), 2), tip, 0.6, 0.6, 'stick'); sphT(out, tip, 1.6, 'tMetal');
  } else if (id === 3) {   // piring di tangan kiri, sendok di tangan kanan
    const pc = addv(addv(hL, X, 4), Y, 3);
    cyl(out, addv(pc, Z, 0.9), Z, 1.6, 3.2, 'tRice', 1.6);
    cyl(out, pc, Z, 0.9, 4.2, 'tPlate', 5.2);
    capT(out, addv(hR, dR, -0.5), addv(hR, dR, 5), 0.45, 0.45, 'tMetal'); sphT(out, addv(hR, dR, 5.8), 1.2, 'tMetal');
  } else if (id === 4) {   // gelas kopi di tangan kanan
    const b = addv(addv(hR, X, 1.5), Z, -2);
    cyl(out, addv(b, Z, 4.3), Z, 0.6, 2.0, 'tCoffee'); cyl(out, b, Z, 5, 2.4, 'tPlate');
  } else if (id === 5) {   // kunci pas
    const w = nrm(addv(dR, Y, -0.6));
    capT(out, addv(hR, w, -1.5), addv(hR, w, 7), 0.6, 0.6, 'tMetal'); sphT(out, addv(hR, w, 8), 1.5, 'tMetal');
  } else if (id === 6) {   // gitar: badan di paha kanan / perut, leher ke tangan kiri
    const c = addv(addv(hR, Y, -1.5), Z, -2.5), a = nrm(sub3(hL, c)), n0 = X, b = nrm(cross(a, n0)), n = nrm(cross(b, a));
    obox(out, addv(c, n, 1.7), a, b, n, [1.6, 1.6, 0.4], 'tIron');
    obox(out, c, a, b, n, [5.5, 6.5, 1.6], 'tGuitar'); obox(out, addv(c, a, 6), a, b, n, [3, 4.8, 1.6], 'tGuitar');
    capT(out, addv(c, a, 8), addv(hL, a, 4), 0.9, 0.9, 'stick'); obox(out, addv(hL, a, 5), a, b, n, [1.5, 1.2, 0.8], 'stick');
  } else if (id === 7) {   // kamera di depan mata, dua tangan
    const c = addv(mid(hR, hL), X, 1.2);
    obox(out, addv(c, X, 2.6), X, Y, Z, [1.2, 1.5, 1.5], 'tMetal'); obox(out, c, X, Y, Z, [1.6, 3.8, 2.2], 'tIron');
  } else if (id === 8) {   // buku sketsa (kiri) + pensil (kanan)
    const c = addv(addv(hL, X, 2), Y, 3), a = 0.8, f2 = [Math.cos(a), 0, -Math.sin(a)], u2 = [Math.sin(a), 0, Math.cos(a)];
    obox(out, addv(c, f2, 0.5), f2, Y, u2, [0.4, 5, 4], 'tPaper'); obox(out, c, f2, Y, u2, [0.6, 5.4, 4.4], 'tBoard');
    capT(out, addv(hR, dR, -0.5), addv(hR, dR, 4.5), 0.45, 0.3, 'tPencil');
  } else if (id === 9) {   // kuas (kanan) + kaleng cat (kiri)
    capT(out, addv(hR, dR, -1), addv(hR, dR, 6), 0.5, 0.5, 'stick'); capT(out, addv(hR, dR, 6), addv(hR, dR, 8.5), 1.1, 0.9, 'tPaint');
    const b = addv(hL, Z, -5.5); cyl(out, addv(b, Z, 4.6), Z, 0.5, 2.5, 'tPaint'); cyl(out, b, Z, 5, 3.0, 'tMetal');
    capT(out, addv(b, Z, 5), hL, 0.3, 0.3, 'tMetal');
  } else if (id === 10) {   // dumbel di kedua tangan
    for (const h of [hR, hL]) { capT(out, addv(h, Y, -3.5), addv(h, Y, 3.5), 0.7, 0.7, 'tMetal'); for (const k of [-3.5, 3.5]) capT(out, addv(h, Y, k - 0.8), addv(h, Y, k + 0.8), 2.4, 2.4, 'tIron'); }
  } else if (id === 11) {   // raket badminton
    const hc = addv(hR, dR, 11), b = nrm(cross(dR, X)).some(isNaN) ? Y : nrm(cross(dR, X)), n = nrm(cross(dR, b));
    capT(out, addv(hR, dR, -1.5), addv(hR, dR, 6.5), 0.7, 0.45, 'tIron');
    obox(out, hc, dR, b, n, [3.6, 2.8, 0.25], 'tString'); obox(out, hc, dR, b, n, [4.4, 3.4, 0.6], 'tPaint');
  } else if (id === 12) {   // cangkul: gagang lewat dua tangan, mata cangkul di ujung menghadap badan
    const d = nrm(addv(dR, dL, 1)), h0 = mid(hR, hL), e = addv(h0, d, 22), n = nrm(cross(d, Y));
    capT(out, addv(h0, d, -4), e, 0.8, 0.8, 'stick');
    obox(out, addv(addv(e, n, -3), d, 0.8), d, Y, n, [0.5, 2.6, 3.2], 'tMetal');
  } else if (id === 15) {   // bola basket memantul di bawah tangan kanan
    const g = addv(hR, X, 1.5), z = g[2] - 3 - (1 - P.tl) * Math.max(0, g[2] - 9);
    sphT(out, [g[0], g[1], z], 3.6, 'tBasket');
  } else if (id === 17) {   // pulpen
    capT(out, addv(hR, dR, -0.5), addv(hR, dR, 4), 0.4, 0.3, 'tIron');
  } else if (id === 18) {   // kalkulator di tangan kiri
    const c = addv(addv(hL, X, 1.5), Y, 2.5), a = 0.5, f2 = [Math.cos(a), 0, -Math.sin(a)], u2 = [Math.sin(a), 0, Math.cos(a)];
    obox(out, addv(addv(c, f2, 0.5), u2, 1.6), f2, Y, u2, [0.2, 1.8, 0.8], 'tScreen'); obox(out, c, f2, Y, u2, [0.6, 2.4, 3.4], 'tCalc');
  } else if (id === 19) {   // kipas bambu
    const b = nrm(cross(dR, Z)).some(isNaN) ? Y : nrm(cross(dR, Z)), n = nrm(cross(dR, b));
    capT(out, addv(hR, dR, -1), addv(hR, dR, 3), 0.45, 0.45, 'stick');
    obox(out, addv(hR, dR, 6.5), dR, b, n, [3.5, 3.2, 0.3], 'tWeave');
  } else if (id === 20) {   // gembor
    const b = addv(hR, Z, -6), t = P.tl || 0.6, sp = nrm([Math.cos(t), 0, -Math.sin(t)]);
    cyl(out, b, Z, 6, 3.0, 'tCan'); capT(out, addv(b, Z, 6.3), hR, 0.4, 0.4, 'tCan');
    capT(out, addv(addv(b, Z, 2), X, 2), addv(addv(addv(b, Z, 2), X, 2), sp, 8), 0.6, 0.6, 'tCan'); sphT(out, addv(addv(addv(b, Z, 2), X, 2), sp, 8.5), 1.2, 'tCan');
  } else if (id === 21) {   // nampan + dua gelas kopi
    const c = addv(addv(mid(hR, hL), X, 3.5), Z, 1.2);
    obox(out, c, X, Y, Z, [5, 7.5, 0.4], 'tMetal');
    for (const k of [-3.2, 3.2]) { const g = addv(c, Y, k); cyl(out, addv(g, Z, 5.4), Z, 0.6, 1.9, 'tCoffee'); cyl(out, addv(g, Z, 0.4), Z, 5.6, 2.3, 'tPlate'); }
  }
}
// barang di tanah (sesudah badan menapak): sajadah, papan skate, bola sepak
function groundProps(P, m, out) {
  const id = Math.round(P.tool || 0); if (id !== 13 && id !== 14 && id !== 16) return;
  const yaw = P.yaw || 0, f = [Math.cos(yaw), Math.sin(yaw), 0], s = [-Math.sin(yaw), Math.cos(yaw), 0];
  const fL = apply(m.footL, [2, 0, -4.5]), fR = apply(m.footR, [2, 0, -4.5]), c = mid(fL, fR);
  if (id === 13) {   // sajadah: hijau, pinggir kuning, mihrab di ujung depan
    const g = [c[0], c[1], 0.4], k = addv(g, f, 12);
    obox(out, addv(addv(k, f, 9), Z, 0.05), f, s, Z, [2.2, 3.5, 0.5], 'tMat2');
    obox(out, k, f, s, Z, [16, 7.2, 0.4], 'tMat'); obox(out, addv(k, Z, -0.05), f, s, Z, [17, 8.2, 0.4], 'tMat2');
  } else if (id === 14) {   // papan skate di bawah kaki
    const g = [c[0], c[1], 2.0];
    obox(out, g, f, s, Z, [13, 4.2, 0.6], 'tIron');
    for (const a of [-8.5, 8.5]) for (const b of [-3, 3]) sphT(out, addv(addv([g[0], g[1], 1.1], f, a), s, b), 1.1, 'tBasket');
  } else {   // bola sepak di depan kaki kanan, menggelinding saat ditendang
    const g = addv(addv([fR[0], fR[1], 3.4], f, 5 + 14 * (P.tl || 0)), s, -1);
    sphT(out, g, 3.4, 'tBallW'); for (const [a, b, z] of [[1, 0, 1], [-1, 1.5, -0.5], [0, -2, 0.5]]) sphT(out, addv(addv(addv(g, f, a * 2.2), s, b), Z, z * 2), 1.2, 'tBallK');
  }
}
