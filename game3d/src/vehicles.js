// Kendaraan voxel detail: motor bebek, motor matic, sepeda, mobil (sedan, MPV, angkot, pikap).
// Semua memakai sumbu lokal: panjang di z (depan = +z), lebar di x, tinggi di y. xf = { x, z, a, y }.
// Bentuk miring (kaca depan, kap) dibuat dengan poligon; ban & rangka dengan kubus kecil berderet (gaya voxel).
import { col, shade, mix } from './geom.js';

const P = (xf, x, y, z) => { const c = Math.cos(xf.a || 0), s = Math.sin(xf.a || 0); return [xf.x + x * c - z * s, (xf.y || 0) + y, xf.z + x * s + z * c]; };
const C = {
  tire: col('#1c1c20'), rim: col('#b8bcc4'), hub: col('#7a7e86'), chrome: col('#d0d4dc'), black: col('#202024'), seat: col('#18181c'),
  glass: col('#2e3e52'), glassHi: col('#5a7a9a'), head: col('#fff6d0'), tail: col('#d0282e'), amber: col('#f0a020'), plate: col('#1a1a1e'),
  plateTxt: col('#e8e8e8'), grille: col('#2a2a2e'), rubber: col('#2a2a2a'), steel: col('#8a8e96'),
};
// garis 3D dari kubus kecil (rangka sepeda, garpu, setang)
function line(m, xf, a, b, t, c) {
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / (t * 0.9)));
  for (let i = 0; i <= n; i++) { const k = i / n; m.box(xf, a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k - t / 2, a[2] + (b[2] - a[2]) * k, t, t, t, c); }
}
// roda di bidang yz: ban (cincin kubus) + pelek + as
function wheel(m, xf, x, y, z, r, w, o = {}) {
  const n = o.n || 14, t = o.t || r * 0.42;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; m.box(xf, x, y + Math.sin(a) * (r - t / 2) - t / 2, z + Math.cos(a) * (r - t / 2), w, t, t * 1.05, o.tire || C.tire); }
  // pelek: silang + bintang (jari-jari) atau piringan
  if (o.spokes) { for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI; line(m, xf, [x, y + Math.sin(a) * (r - t), z + Math.cos(a) * (r - t)], [x, y - Math.sin(a) * (r - t), z - Math.cos(a) * (r - t)], 0.025, o.rim || C.rim); } }
  else { const rr = (r - t) * 2; m.box(xf, x, y - rr / 2, z, w * 0.8, rr, rr * 0.42, o.rim || C.rim); m.box(xf, x, y - rr * 0.21, z, w * 0.8, rr * 0.42, rr, o.rim || C.rim); }
  m.box(xf, x, y - r * 0.12, z, w * 1.15, r * 0.24, r * 0.24, C.hub);
}

/* ---------------------------------------------------------------- MOTOR */
// jenis: 'bebek' (motor bebek), 'matic' (skuter); c = warna bodi; o.helmet = taruh helm di jok
export function motor(m, xf, c = '#c83a3a', kind = 'bebek', o = {}) {
  const body = col(c), dark = shade(body, 0.7), R = 0.21, W = 0.09, zf = 0.62, zr = -0.6;
  wheel(m, xf, 0, R, zf, R, W); wheel(m, xf, 0, R, zr, R, W);
  // spakbor depan & belakang
  m.box(xf, 0, R * 2 + 0.01, zf, 0.13, 0.05, 0.36, kind === 'matic' ? body : C.black);
  // garpu depan (dua batang miring) + setang + spion + lampu depan
  for (const s of [-0.07, 0.07]) line(m, xf, [s, R, zf], [s, 0.86, zf - 0.17], 0.035, C.chrome);
  m.box(xf, 0, 0.88, zf - 0.2, 0.62, 0.035, 0.04, C.black);                                    // setang
  for (const s of [-1, 1]) { m.box(xf, s * 0.3, 0.86, zf - 0.2, 0.06, 0.05, 0.08, C.rubber); line(m, xf, [s * 0.2, 0.9, zf - 0.2], [s * 0.25, 1.06, zf - 0.22], 0.02, C.steel); m.box(xf, s * 0.26, 1.06, zf - 0.22, 0.09, 0.06, 0.02, C.chrome); }   // grip & spion
  m.box(xf, 0, 0.76, zf - 0.12, 0.26, 0.15, 0.16, kind === 'matic' ? body : dark);              // kepala lampu
  m.box(xf, 0, 0.79, zf - 0.03, 0.17, 0.08, 0.02, C.head);
  for (const s of [-1, 1]) m.box(xf, s * 0.12, 0.74, zf - 0.03, 0.04, 0.03, 0.02, C.amber);    // sein
  if (kind === 'matic') {
    // apron depan besar + dek datar + bodi belakang membulat
    m.box(xf, 0, 0.3, 0.35, 0.34, 0.5, 0.12, body); m.box(xf, 0, 0.55, 0.32, 0.3, 0.2, 0.1, body);
    m.box(xf, 0, 0.22, 0.08, 0.3, 0.06, 0.48, C.black);                                         // dek kaki
    m.box(xf, 0, 0.22, -0.38, 0.32, 0.36, 0.52, body); m.box(xf, 0, 0.5, -0.4, 0.28, 0.08, 0.46, dark);
    m.box(xf, 0, 0.58, -0.3, 0.26, 0.1, 0.56, C.seat);                                          // jok
    m.box(xf, 0.13, 0.18, -0.48, 0.07, 0.12, 0.36, C.black);                                    // CVT
  } else {
    // pelindung kaki + rangka bebek + tangki di bawah jok
    m.box(xf, 0, 0.26, 0.28, 0.3, 0.4, 0.1, body); m.box(xf, 0, 0.62, 0.3, 0.12, 0.12, 0.2, dark);
    line(m, xf, [0, 0.66, 0.24], [0, 0.4, 0.0], 0.09, dark);
    m.box(xf, 0, 0.24, -0.02, 0.24, 0.18, 0.28, C.steel);                                       // mesin
    m.box(xf, 0, 0.36, -0.36, 0.28, 0.24, 0.5, body); m.box(xf, 0, 0.36, -0.36, 0.3, 0.05, 0.5, shade(body, 1.15));   // bodi samping + striping
    m.box(xf, 0, 0.6, -0.26, 0.24, 0.09, 0.62, C.seat);                                         // jok panjang
    for (const s of [-1, 1]) m.box(xf, s * 0.16, 0.24, 0.02, 0.08, 0.02, 0.1, C.steel);        // footstep
  }
  // knalpot di kanan, spakbor & lampu & plat belakang
  m.box(xf, 0.15, 0.16, -0.38, 0.07, 0.08, 0.5, C.chrome); m.box(xf, 0.15, 0.17, -0.67, 0.06, 0.06, 0.08, C.black);
  m.box(xf, 0, 0.44, zr - 0.08, 0.14, 0.05, 0.28, C.black); m.box(xf, 0, 0.5, -0.66, 0.16, 0.06, 0.06, C.tail);
  m.box(xf, 0, 0.36, zr - 0.2, 0.16, 0.08, 0.02, C.plate); m.box(xf, 0, 0.38, zr - 0.211, 0.12, 0.03, 0.005, C.plateTxt);
  m.box(xf, -0.1, 0, -0.05, 0.03, 0.22, 0.03, C.steel);                                           // standar samping
  if (o.helmet) { m.box(xf, 0, 0.66, -0.32, 0.22, 0.17, 0.22, col(o.helmet)); m.box(xf, 0, 0.68, -0.2, 0.18, 0.08, 0.02, C.glass); }
}

/* ---------------------------------------------------------------- SEPEDA */
export function sepeda(m, xf, c = '#2a8ae0', o = {}) {
  const fr = col(c), R = 0.26, zf = 0.5, zr = -0.48, y = R;
  wheel(m, xf, 0, R, zf, R, 0.05, { spokes: true, t: 0.06, n: 18 }); wheel(m, xf, 0, R, zr, R, 0.05, { spokes: true, t: 0.06, n: 18 });
  const crank = [0, 0.22, -0.02], seatTop = [0, 0.66, -0.16], head = [0, 0.66, 0.36];
  line(m, xf, [0, y, zr], crank, 0.04, fr);          // chainstay
  line(m, xf, [0, y, zr], seatTop, 0.04, fr);        // seatstay
  line(m, xf, crank, seatTop, 0.045, fr);            // seat tube
  line(m, xf, crank, head, 0.05, fr);                // down tube
  line(m, xf, seatTop, head, 0.045, fr);             // top tube
  line(m, xf, head, [0, y, zf], 0.035, C.chrome);    // garpu
  line(m, xf, head, [0, 0.82, 0.32], 0.035, C.steel);
  m.box(xf, 0, 0.82, 0.3, 0.48, 0.03, 0.04, C.steel); for (const s of [-1, 1]) m.box(xf, s * 0.22, 0.8, 0.3, 0.05, 0.05, 0.08, C.rubber);
  m.box(xf, 0, 0.7, -0.18, 0.1, 0.05, 0.22, C.seat);                               // sadel
  m.box(xf, 0.04, 0.17, -0.02, 0.02, 0.12, 0.12, C.steel); m.box(xf, 0.06, 0.1, 0.06, 0.08, 0.03, 0.05, C.black);   // gir & pedal
  line(m, xf, [0.035, 0.22, -0.02], [0.035, y, zr], 0.015, C.black);              // rantai
  if (o.basket) { m.box(xf, 0, 0.62, 0.5, 0.3, 0.2, 0.24, col('#8a6a40')); m.box(xf, 0, 0.62, 0.5, 0.24, 0.17, 0.18, col('#6a4a2a')); }
  m.box(xf, 0, 0.6, -0.42, 0.1, 0.03, 0.26, C.black);                              // boncengan
  m.box(xf, 0, 0.56, -0.56, 0.06, 0.04, 0.02, C.tail);
}

/* ---------------------------------------------------------------- MOBIL */
// kind: 'sedan' | 'mpv' | 'angkot' | 'pikap'; panjang ±3.4 (z), lebar ±1.45 (x)
export function car(m, xf, c = '#e8e8e8', kind = 'mpv', o = {}) {
  const body = col(c), lo = shade(body, 0.82), hw = 0.72;
  const L2 = kind === 'sedan' ? 1.72 : kind === 'angkot' ? 1.6 : 1.7, sill = 0.24, belt = kind === 'mpv' || kind === 'angkot' ? 0.78 : 0.72;
  const roof = kind === 'sedan' ? 1.22 : kind === 'angkot' ? 1.52 : 1.42;
  const R = 0.27, zf = L2 - 0.68, zr = -L2 + 0.62;
  // roda (empat) + lengkung spakbor gelap
  for (const z of [zf, zr]) for (const s of [-1, 1]) { wheel(m, xf, s * (hw - 0.09), R, z, R, 0.2); m.box(xf, s * (hw - 0.02), R * 2 - 0.08, z, 0.06, 0.14, R * 2 + 0.14, shade(body, 0.45)); }
  // badan bawah: sasis gelap, badan (lebar penuh) dengan bumper depan/belakang
  m.box(xf, 0, 0.14, 0, hw * 2 - 0.2, 0.12, L2 * 2 - 0.4, C.black);
  const front = kind === 'angkot' ? L2 - 0.15 : L2, hood = kind === 'angkot' ? belt + 0.05 : belt;
  m.box(xf, 0, sill, (zr - 0.62 + front) / 2 - 0.0, hw * 2, belt - sill, front - (zr - 0.62) - 0.0, body);
  m.box(xf, 0, sill, front - 0.04, hw * 2 + 0.04, 0.2, 0.12, kind === 'angkot' ? C.chrome : C.black);   // bumper depan
  m.box(xf, 0, sill, -L2 + 0.04, hw * 2 + 0.04, 0.2, 0.12, C.black);                                   // bumper belakang
  // kap & kaca depan miring, atap, kaca belakang (poligon)
  const zA = kind === 'angkot' ? L2 - 0.55 : kind === 'pikap' ? L2 - 1.1 : L2 - 0.95;   // pangkal kaca depan
  const zB = zA - (kind === 'angkot' ? 0.18 : 0.62);                                     // ujung depan atap
  const zC = kind === 'pikap' ? zB - 0.9 : kind === 'sedan' ? -L2 + 1.0 : -L2 + 0.32;   // ujung belakang atap
  const zD = kind === 'pikap' ? zC - 0.05 : kind === 'sedan' ? -L2 + 0.42 : -L2 + 0.16; // pangkal kaca belakang
  const xi = hw - 0.08, xr = hw - 0.14;
  const Q = (pts, cc) => m.poly(pts.map(p => P(xf, ...p)), cc);
  // kap mesin (sedikit miring ke depan)
  Q([[-hw, belt, zA], [hw, belt, zA], [hw, hood - 0.06, front], [-hw, hood - 0.06, front]].reverse(), shade(body, 1.08));
  Q([[-hw, belt, zA], [hw, belt, zA], [hw, hood - 0.06, front], [-hw, hood - 0.06, front]], lo);
  // kaca depan
  Q([[-xr, roof, zB], [xr, roof, zB], [xi, belt, zA], [-xi, belt, zA]].reverse(), C.glassHi);
  // atap
  Q([[-xr, roof, zC], [xr, roof, zC], [xr, roof, zB], [-xr, roof, zB]].reverse(), kind === 'angkot' ? col('#e8e8e8') : body);
  // kaca belakang
  Q([[xi, belt, zD], [xr, roof, zC], [-xr, roof, zC], [-xi, belt, zD]].reverse(), C.glass);
  // sisi kabin: kaca samping (trapesium) di kiri-kanan
  for (const s of [-1, 1]) {
    const x = s * (hw - 0.02), xx = s * xr, pts = [[x, belt, zA], [xx, roof, zB], [xx, roof, zC], [x, belt, zD]];
    Q(s > 0 ? pts.slice().reverse() : pts, C.glass);
    // pilar B & C (bodi) di atas kaca samping
    const pz = (zB + zC) / 2;
    m.box(xf, s * (hw - 0.06), belt, pz, 0.06, roof - belt - 0.02, 0.08, kind === 'angkot' ? body : C.black);
    if (kind !== 'pikap' && kind !== 'sedan') m.box(xf, s * (hw - 0.07), belt, zC + 0.5, 0.06, roof - belt - 0.04, 0.08, C.black);
  }
  // lampu depan, gril, lampu belakang, plat, spion, handel pintu, garis pintu
  for (const s of [-1, 1]) {
    m.box(xf, s * (hw - 0.22), belt - 0.2, front + 0.005, 0.3, 0.12, 0.03, C.head);
    m.box(xf, s * (hw - 0.05), belt - 0.2, front - 0.02, 0.06, 0.1, 0.05, C.amber);
    m.box(xf, s * (hw - 0.16), belt - 0.2, -L2 - 0.005, 0.22, 0.16, 0.03, C.tail);
    m.box(xf, s * (hw + 0.06), belt + 0.06, zA - 0.12, 0.1, 0.1, 0.06, kind === 'angkot' ? C.black : body);   // spion
    m.box(xf, s * (hw + 0.006), belt - 0.12, (zA + zB) / 2 - 0.5, 0.01, 0.03, 0.14, C.steel);
    m.box(xf, s * (hw + 0.006), sill + 0.08, (zA + zC) / 2 - 0.1, 0.01, belt - sill - 0.14, 0.02, shade(body, 0.6));
  }
  m.box(xf, 0, belt - 0.24, front + 0.005, hw * 0.9, 0.14, 0.02, C.grille);
  m.box(xf, 0, sill + 0.06, front + 0.06, 0.4, 0.1, 0.02, C.plate); m.box(xf, 0, sill + 0.08, front + 0.072, 0.32, 0.05, 0.005, C.plateTxt);
  m.box(xf, 0, sill + 0.22, -L2 - 0.012, 0.4, 0.1, 0.02, C.plate); m.box(xf, 0, sill + 0.24, -L2 - 0.024, 0.32, 0.05, 0.005, C.plateTxt);
  if (kind === 'pikap') {   // bak terbuka di belakang
    const zb0 = zD - 0.04;
    m.box(xf, 0, belt - 0.02, (zb0 - L2) / 2, hw * 2, 0.04, zb0 + L2, shade(body, 0.6));
    for (const s of [-1, 1]) m.box(xf, s * (hw - 0.03), belt, (zb0 - L2) / 2, 0.06, 0.26, zb0 + L2, body);
    m.box(xf, 0, belt, -L2 + 0.03, hw * 2, 0.26, 0.06, body);
    if (o.cargo) for (let i = 0; i < 3; i++) m.box(xf, -0.3 + i * 0.3, belt + 0.02, -L2 + 0.6, 0.26, 0.24, 0.3, col(o.cargo));
  }
  if (kind === 'angkot') {  // strip & papan trayek, pintu samping terbuka (lubang gelap), tangga
    for (const s of [-1, 1]) m.box(xf, s * (hw + 0.004), belt - 0.18, -0.2, 0.01, 0.07, L2 * 2 - 0.4, col(o.stripe || '#f0c020'));
    m.box(xf, -hw - 0.005, sill + 0.06, -0.15, 0.01, roof - sill - 0.2, 0.62, col('#1a1a1e'));
    m.box(xf, 0, roof, zB - 0.06, 0.8, 0.16, 0.06, col('#f2f2f2')); m.box(xf, 0, roof + 0.04, zB - 0.095, 0.6, 0.06, 0.01, col('#2a2a2e'));
    m.box(xf, 0, roof, -0.3, hw * 1.6, 0.04, 1.6, col('#9a9a9a'));
  }
  if (kind === 'sedan') m.box(xf, 0, belt, -L2 + 0.18, hw * 1.6, 0.03, 0.12, shade(body, 0.9));   // spoiler kecil
}

export const CAR_COLORS = ['#f2f2f0', '#c0c2c8', '#2a2a2e', '#b83a3a', '#3f6fa8', '#8a8a90', '#e8e2d0', '#4a6a4a'];
export const MOTOR_COLORS = ['#c83a3a', '#1e1e22', '#2a6ac0', '#e8e8e8', '#3a9a6a', '#d0d0d4', '#e88a2a'];
