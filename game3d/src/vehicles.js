// Kendaraan voxel detail: motor bebek, motor matic, sepeda, mobil (sedan, MPV, angkot, pikap).
// Semua memakai sumbu lokal: panjang di z (depan = +z), lebar di x, tinggi di y. xf = { x, z, a, y }.
// Bentuk miring (kaca depan, kap) dibuat dengan poligon; ban & rangka dengan kubus kecil berderet (gaya voxel).
import { col, shade, mix } from './geom.js';

const P = (xf, x, y, z) => { const c = Math.cos(xf.a || 0), s = Math.sin(xf.a || 0), k = xf.k || 1; x *= k; y *= k; z *= k; return [xf.x + x * c - z * s, (xf.y || 0) + y, xf.z + x * s + z * c]; };
// Skala tiap jenis kendaraan terhadap ukuran modelnya, supaya pas dengan tokoh (tinggi ±1.2 petak, pinggul ±0.5):
// jok motor/sepeda sedikit di bawah pinggul, kaki pengendara sampai pijakan/pedal, atap mobil setinggi bahu-kepala.
export const VK = { motor: 0.68, sepeda: 0.66, car: 0.8 };
const scaled = (xf, k) => ({ x: xf.x, y: xf.y, z: xf.z, a: xf.a, k: (xf.k || 1) * k });
const C = {
  tire: col('#1c1c20'), rim: col('#b8bcc4'), hub: col('#7a7e86'), chrome: col('#d0d4dc'), black: col('#202024'), seat: col('#18181c'),
  glass: col('#2e3e52'), glassHi: col('#5a7a9a'), head: col('#fff6d0'), tail: col('#d0282e'), amber: col('#f0a020'), plate: col('#1a1a1e'),
  plateTxt: col('#e8e8e8'), grille: col('#2a2a2e'), rubber: col('#2a2a2a'), steel: col('#8a8e96'),
};
// garis 3D dari kubus kecil (rangka sepeda, garpu, setang)
// pelacak tabrakan (hanya saat __TRACEON): jejak kendaraan untuk dicek terhadap kotak lain
let VID = 0;
// penjaga parkir (guide 90 aturan 4): selama kota dibangun, kendaraan statis yang badannya masuk aspal tidak dipasang
let GUARD = null;
export function setParkGuard(f) { GUARD = f; }
const P4 = (xf, hw, hl) => [P(xf, -hw, 0, -hl), P(xf, hw, 0, -hl), P(xf, hw, 0, hl), P(xf, -hw, 0, hl), P(xf, 0, 0, 0)];
function trk(xf, hw, hl) {
  if (!globalThis.__TRACE) return;
  globalThis.__VEHCUR = ++VID;
  (globalThis.__VEHS || (globalThis.__VEHS = [])).push({ id: VID, p: [P(xf, -hw, 0, -hl), P(xf, hw, 0, -hl), P(xf, hw, 0, hl), P(xf, -hw, 0, hl)], y: xf.y || 0, st: new Error().stack.split('\n').slice(3, 5).join(' ') });
}
// sisi poligon menghadap ke luar: urutan titik dibalik bila normalnya berlawanan dengan arah 'out' (lokal)
function face(m, xf, pts, out, c) {
  const [a, b, d] = pts, u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  if (n[0] * out[0] + n[1] * out[1] + n[2] * out[2] < 0) pts = pts.slice().reverse();
  m.poly(pts.map(p => P(xf, p[0], p[1], p[2])), c);
}
// batang lurus mulus (rangka, garpu, setang, jari-jari): prisma segi-6 dari a ke b, tebal t
let LO = false;   // kendaraan parkir (statis): batang segi-4 saja
function line(m, xf, a, b, t, c, sides = LO ? 4 : 6) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d) || 1, e = d.map(v => v / L);
  const ref = Math.abs(e[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  let u = [e[1] * ref[2] - e[2] * ref[1], e[2] * ref[0] - e[0] * ref[2], e[0] * ref[1] - e[1] * ref[0]]; const ul = Math.hypot(...u); u = u.map(v => v / ul);
  const w = [e[1] * u[2] - e[2] * u[1], e[2] * u[0] - e[0] * u[2], e[0] * u[1] - e[1] * u[0]], r = t / 2;
  const off = i => { const g = i / sides * Math.PI * 2; return [0, 1, 2].map(k => (u[k] * Math.cos(g) + w[k] * Math.sin(g)) * r); };
  for (let i = 0; i < sides; i++) {
    const o0 = off(i), o1 = off(i + 1), mid = off(i + 0.5);
    face(m, xf, [[a[0] + o0[0], a[1] + o0[1], a[2] + o0[2]], [a[0] + o1[0], a[1] + o1[1], a[2] + o1[2]], [b[0] + o1[0], b[1] + o1[1], b[2] + o1[2]], [b[0] + o0[0], b[1] + o0[1], b[2] + o0[2]]], mid, c);
  }
  const cap = (p, s) => face(m, xf, Array.from({ length: sides }, (_, i) => { const o = off(i); return [p[0] + o[0], p[1] + o[1], p[2] + o[2]]; }), e.map(v => v * s), c);
  cap(a, -1); cap(b, 1);
}
// cincin bulat di bidang yz (ban, pelek): jari-jari luar ro, dalam ri, lebar w, n segmen
function ring(m, xf, x, y, z, ro, ri, w, c, n = 28, cs) {
  const pt = (r, g, sx) => [x + sx, y + Math.sin(g) * r, z + Math.cos(g) * r];
  for (let i = 0; i < n; i++) {
    const g0 = i / n * Math.PI * 2, g1 = (i + 1) / n * Math.PI * 2, gm = (g0 + g1) / 2, h = w / 2;
    face(m, xf, [pt(ro, g0, -h), pt(ro, g1, -h), pt(ro, g1, h), pt(ro, g0, h)], [0, Math.sin(gm), Math.cos(gm)], c);
    if (ri > 0) face(m, xf, [pt(ri, g0, -h), pt(ri, g1, -h), pt(ri, g1, h), pt(ri, g0, h)], [0, -Math.sin(gm), -Math.cos(gm)], c);
    for (const s of [-1, 1]) {
      const q = ri > 0 ? [pt(ri, g0, s * h), pt(ro, g0, s * h), pt(ro, g1, s * h), pt(ri, g1, s * h)] : [[x + s * h, y, z], pt(ro, g0, s * h), pt(ro, g1, s * h)];
      face(m, xf, q, [s, 0, 0], cs || c);
    }
  }
}
// roda di bidang yz: ban bulat (tepi sisi sedikit gelap) + pelek (piringan 5 palang / jari-jari kawat) + as.
// o.knob: ban kembang tanah (trail/MTB) — tonjolan kecil di keliling ban
function wheel(m, xf, x, y, z, r, w, o = {}) {
  const t = o.t || r * 0.38, tire = o.tire || C.tire, rim = o.rim || C.rim, ri = r - t, lo = o.lo;   // lo: kendaraan parkir (statis) lebih hemat segitiga
  const N = lo ? 14 : 28;
  ring(m, xf, x, y, z, r, ri, w, tire, N, shade(tire, 0.85));
  if (o.knob && !lo) for (let i = 0; i < 16; i++) { const g = (i + 0.5) / 16 * Math.PI * 2; line(m, xf, [x - w * 0.42, y + Math.sin(g) * (r + 0.008), z + Math.cos(g) * (r + 0.008)], [x + w * 0.42, y + Math.sin(g) * (r + 0.008), z + Math.cos(g) * (r + 0.008)], 0.04, tire, 4); }
  if (o.spokes) {
    ring(m, xf, x, y, z, ri, ri - 0.025, w * 0.6, rim, N);
    for (let i = 0; i < (lo ? 6 : 12); i++) { const g = i / 12 * Math.PI * 2, s = i % 2 ? 1 : -1; line(m, xf, [x + s * w * 0.18, y, z], [x, y + Math.sin(g) * (ri - 0.02), z + Math.cos(g) * (ri - 0.02)], 0.012, rim, 4); }
  } else {
    ring(m, xf, x, y, z, ri, ri * 0.72, w * 0.82, rim, lo ? 12 : 24);              // bibir pelek
    ring(m, xf, x, y, z, ri * 0.72, 0, w * 0.5, shade(rim, 0.55), lo ? 10 : 20);   // piringan dalam (gelap)
    const nsp = o.rim5 ? 5 : 3;
    for (let i = 0; i < nsp; i++) { const g = i / nsp * Math.PI * 2 + 0.3; line(m, xf, [x, y, z], [x, y + Math.sin(g) * ri * 0.78, z + Math.cos(g) * ri * 0.78], ri * 0.26, rim, 4); }
  }
  ring(m, xf, x, y, z, r * 0.16, 0, w * 1.1, C.hub, lo ? 6 : 10);
}

/* ---------------------------------------------------------------- RODA TERPISAH (berputar) */
// o.wheels = [] : roda tidak digambar ke Merger tapi dicatat, supaya bisa jadi mesh sendiri yang berputar saat jalan
// posisi & ukuran roda dicatat sudah dikalikan skala xf.k, geometrinya dibangun dengan skala yang sama (k)
const WH = (m, xf, o, x, y, z, r, w, op = {}) => { const k = xf.k || 1; return o.wheels ? o.wheels.push({ x: x * k, y: y * k, z: z * k, r: r * k, w, op, k, r0: r }) : wheel(m, xf, x, y, z, r, w, { ...op, lo: true }); };
export function wheelGeo(Merger, r0, w, op = {}, k = 1) { const m = new Merger(); wheel(m, { x: 0, z: 0, a: 0, k }, 0, 0, 0, r0, w, op); return m.build(); }
export function crankGeo(Merger, k = 1) {   // engkol sepeda: dua lengan berlawanan + pedal
  const m = new Merger(), xf = { x: 0, z: 0, a: 0, k };
  ring(m, xf, 0.02, 0, 0, 0.07, 0, 0.025, C.steel, 16);                                  // gir depan
  for (const s of [-1, 1]) { line(m, xf, [s * 0.06, 0, 0], [s * 0.06, s * 0.14, 0], 0.03, C.steel); m.box(xf, s * 0.1, s * 0.14 - 0.015, 0, 0.09, 0.03, 0.06, C.black); }
  return m.build();
}

/* ---------------------------------------------------------------- MOTOR */
// jenis: 'bebek', 'matic' (skuter), 'sport' (fairing, nunduk), 'trail' (tinggi, setang lebar), 'vespa' (skuter klasik bulat)
// FIT: titik jok (y tinggi, z maju) & pose pengendara, supaya tokoh pas duduk di tiap model
// bar: titik setang [y, z]; dihitung dari posisi tangan pose naik (voxlib joints) supaya tangan pas memegang setang
export const MOTOR_FIT = {
  bebek: { seat: [0.68, -0.2], back: [0.7, -0.52], bar: [0.92, 0.37], anim: 'rideMotor' },
  matic: { seat: [0.69, -0.22], back: [0.7, -0.5], bar: [0.95, 0.31], anim: 'rideScooter' },
  sport: { seat: [0.78, -0.3], back: [0.86, -0.56], bar: [0.98, 0.39], anim: 'rideSport' },
  trail: { seat: [0.84, -0.18], back: [0.84, -0.48], bar: [1.14, 0.41], anim: 'rideTrail' },
  vespa: { seat: [0.7, -0.2], back: [0.72, -0.48], bar: [0.96, 0.33], anim: 'rideScooter' },
};
export const MOTOR_KINDS = Object.keys(MOTOR_FIT);
export function motor(m, xf, c = '#c83a3a', kind = 'bebek', o = {}) { xf = scaled(xf, VK.motor); if (!o.wheels && GUARD && !GUARD(P4(xf, 0.35, 1.0))) return null; LO = !o.wheels; trk(xf, 0.35, 1.0); try { return motor_(m, xf, c, kind, o); } finally { globalThis.__VEHCUR = 0; } }
function motor_(m, xf, c, kind, o) {
  const body = col(c), dark = shade(body, 0.7), hi = shade(body, 1.15);
  const R = kind === 'trail' ? 0.27 : kind === 'vespa' ? 0.17 : kind === 'sport' ? 0.23 : 0.21, Wt = kind === 'sport' ? 0.13 : kind === 'trail' ? 0.1 : 0.09;
  const zf = kind === 'sport' ? 0.66 : kind === 'trail' ? 0.66 : kind === 'vespa' ? 0.55 : 0.62, zr = kind === 'vespa' ? -0.55 : -0.6;
  const knob = kind === 'trail' ? { knob: true, t: R * 0.42 } : { t: R * 0.36 };
  WH(m, xf, o, 0, R, zf, R, Wt, knob); WH(m, xf, o, 0, R, zr, R, Wt, knob);
  const [hy, hz] = MOTOR_FIT[kind].bar, hw = kind === 'trail' ? 0.4 : kind === 'sport' ? 0.27 : 0.31;
  // garpu depan (upside-down gelap untuk sport/trail) + setang/grip + spion
  if (kind !== 'vespa') for (const s of [-0.07, 0.07]) line(m, xf, [s, R, zf], [s, hy - 0.04, hz + 0.04], 0.04, kind === 'sport' || kind === 'trail' ? C.black : C.chrome);
  m.box(xf, 0, hy, hz, hw * 2, 0.035, 0.04, C.black);
  for (const sd of [-1, 1]) {
    m.box(xf, sd * hw, hy - 0.02, hz, 0.06, 0.05, 0.08, C.rubber);
    if (kind !== 'sport') { line(m, xf, [sd * (hw - 0.1), hy + 0.03, hz], [sd * (hw - 0.04), hy + 0.18, hz - 0.02], 0.02, C.steel); m.box(xf, sd * (hw - 0.04), hy + 0.18, hz - 0.02, 0.09, 0.06, 0.02, C.chrome); }
  }
  // lampu belakang, plat, knalpot
  const tailY = kind === 'sport' ? 0.8 : kind === 'trail' ? 0.74 : 0.5;
  m.box(xf, 0, tailY, zr - 0.08, 0.16, 0.06, 0.06, C.tail);
  m.box(xf, 0, tailY - 0.14, zr - 0.18, 0.16, 0.08, 0.02, C.plate); m.box(xf, 0, tailY - 0.12, zr - 0.191, 0.12, 0.03, 0.005, C.plateTxt);
  for (const sd of [-1, 1]) m.box(xf, sd * 0.1, tailY - 0.02, zr - 0.1, 0.04, 0.03, 0.04, C.amber);
  if (kind === 'matic') {
    m.box(xf, 0, R * 2 + 0.01, zf, 0.13, 0.05, 0.36, body);
    m.box(xf, 0, 0.3, 0.35, 0.34, 0.5, 0.12, body); m.box(xf, 0, 0.55, 0.32, 0.3, 0.26, 0.12, body); m.box(xf, 0, 0.78, zf - 0.14, 0.28, 0.12, 0.16, body);
    m.box(xf, 0, 0.8, zf - 0.05, 0.2, 0.06, 0.02, C.head); m.box(xf, 0, 0.3, 0.42, 0.24, 0.03, 0.02, shade(body, 0.6));
    m.box(xf, 0, 0.2, 0.08, 0.3, 0.06, 0.48, C.black);
    m.box(xf, 0, 0.22, -0.38, 0.32, 0.36, 0.52, body); m.box(xf, 0, 0.5, -0.4, 0.3, 0.1, 0.5, hi);
    m.box(xf, 0, 0.6, -0.3, 0.26, 0.09, 0.56, C.seat); m.box(xf, 0, 0.62, -0.62, 0.26, 0.08, 0.06, C.steel);   // jok + behel
    m.box(xf, 0.13, 0.16, -0.48, 0.07, 0.12, 0.36, C.black); m.box(xf, -0.14, 0.12, -0.52, 0.06, 0.08, 0.3, C.chrome);
  } else if (kind === 'vespa') {
    // tameng depan tinggi melengkung, bodi belakang bulat menggembung (dua sisi), lampu di spakbor
    m.box(xf, 0, R * 2, zf, 0.18, 0.16, 0.32, body); m.box(xf, 0, R * 2 + 0.1, zf + 0.12, 0.1, 0.07, 0.03, C.head);
    line(m, xf, [0, R * 2 + 0.05, zf - 0.08], [0, hy - 0.05, hz], 0.09, body);
    m.box(xf, 0, 0.22, 0.32, 0.4, 0.62, 0.08, body); m.box(xf, 0, 0.84, 0.32, 0.3, 0.06, 0.06, body);
    m.box(xf, 0, 0.18, 0.02, 0.32, 0.05, 0.56, C.black);
    for (const sd of [-1, 1]) { m.box(xf, sd * 0.15, 0.2, -0.38, 0.14, 0.36, 0.44, body); m.box(xf, sd * 0.18, 0.26, -0.38, 0.1, 0.24, 0.36, hi); }
    m.box(xf, 0, 0.36, -0.3, 0.2, 0.24, 0.46, body); m.box(xf, 0, 0.6, -0.26, 0.22, 0.1, 0.5, C.seat);
    m.box(xf, 0, hy - 0.06, hz + 0.02, 0.24, 0.1, 0.14, body); m.box(xf, 0, hy - 0.04, hz + 0.09, 0.12, 0.08, 0.02, C.head);
    m.box(xf, 0, 0.28, zr - 0.06, 0.04, 0.4, 0.04, C.chrome);
  } else if (kind === 'sport') {
    // fairing depan + kaca, tangki besar, jok bertingkat, buntut lancip, knalpot naik
    m.box(xf, 0, R * 2 - 0.02, zf, 0.13, 0.05, 0.3, C.black);
    const Q = (pts, cc) => m.poly(pts.map(p => P(xf, ...p)), cc);
    for (const sd of [-1, 1]) Q((sd > 0 ? (a => a) : (a => a.slice().reverse()))([[sd * 0.17, 0.42, 0.62], [sd * 0.2, 0.42, 0.18], [sd * 0.17, 0.84, 0.3], [sd * 0.11, 0.9, 0.54]]), body);
    m.box(xf, 0, 0.42, 0.4, 0.34, 0.42, 0.44, body);
    Q([[-0.12, 0.9, 0.54], [0.12, 0.9, 0.54], [0.08, 1.04, 0.42], [-0.08, 1.04, 0.42]].reverse(), C.glass);
    for (const sd of [-1, 1]) m.box(xf, sd * 0.07, 0.72, 0.63, 0.1, 0.06, 0.02, C.head);
    m.box(xf, 0, 0.6, 0.1, 0.32, 0.17, 0.34, body); m.box(xf, 0, 0.77, 0.12, 0.22, 0.03, 0.22, hi);
    m.box(xf, 0, 0.26, -0.02, 0.26, 0.24, 0.34, C.steel); m.box(xf, 0, 0.3, 0.12, 0.3, 0.06, 0.2, dark);
    m.box(xf, 0, 0.68, -0.3, 0.24, 0.08, 0.3, C.seat); m.box(xf, 0, 0.58, -0.36, 0.22, 0.12, 0.4, body);
    m.box(xf, 0, 0.74, -0.5, 0.2, 0.08, 0.22, body); m.box(xf, 0, 0.8, -0.52, 0.16, 0.05, 0.18, C.seat);
    line(m, xf, [0.12, 0.2, -0.05], [0.14, 0.42, -0.62], 0.08, C.black); m.box(xf, 0.14, 0.38, -0.7, 0.1, 0.12, 0.14, C.steel);
    line(m, xf, [0, 0.28, -0.1], [0, 0.42, zr], 0.06, C.black);
    for (const sd of [-1, 1]) m.box(xf, sd * 0.16, 0.3, -0.2, 0.08, 0.02, 0.08, C.steel);
  } else if (kind === 'trail') {
    // spakbor depan tinggi, tangki ramping, jok rata panjang, plat nomor samping, rangka terbuka
    m.box(xf, 0, hy - 0.22, zf - 0.02, 0.14, 0.04, 0.5, body); m.box(xf, 0, hy - 0.12, zf - 0.16, 0.22, 0.2, 0.06, col('#f2f2ee'));
    m.box(xf, 0, hy - 0.08, zf - 0.13, 0.12, 0.08, 0.02, C.head);
    m.box(xf, 0, 0.62, 0.12, 0.26, 0.22, 0.34, body); m.box(xf, 0, 0.84, 0.12, 0.2, 0.03, 0.26, hi);
    m.box(xf, 0, 0.76, -0.24, 0.22, 0.08, 0.7, C.seat);
    for (const sd of [-1, 1]) m.box(xf, sd * 0.13, 0.56, -0.42, 0.04, 0.2, 0.34, col('#f2f2ee'));
    m.box(xf, 0, 0.3, -0.02, 0.22, 0.22, 0.26, C.steel); line(m, xf, [0, 0.62, 0.0], [0, 0.4, -0.05], 0.06, C.black);
    line(m, xf, [0, 0.5, -0.1], [0, R, zr], 0.05, C.black); line(m, xf, [0, 0.72, -0.4], [0, R, zr], 0.03, C.steel);
    line(m, xf, [0.13, 0.22, 0.0], [0.15, 0.6, -0.58], 0.06, C.steel);
    m.box(xf, 0, 0.66, zr - 0.08, 0.12, 0.04, 0.3, body);
    for (const sd of [-1, 1]) m.box(xf, sd * 0.16, 0.3, -0.08, 0.08, 0.02, 0.08, C.steel);
  } else {
    // bebek: pelindung kaki + rangka bebek + tangki di bawah jok
    m.box(xf, 0, R * 2 + 0.01, zf, 0.13, 0.05, 0.36, C.black);
    m.box(xf, 0, 0.76, zf - 0.12, 0.26, 0.15, 0.16, dark); m.box(xf, 0, 0.79, zf - 0.03, 0.17, 0.08, 0.02, C.head);
    for (const sd of [-1, 1]) m.box(xf, sd * 0.12, 0.74, zf - 0.03, 0.04, 0.03, 0.02, C.amber);
    m.box(xf, 0, 0.26, 0.28, 0.3, 0.4, 0.1, body); m.box(xf, 0, 0.62, 0.3, 0.12, 0.12, 0.2, dark);
    line(m, xf, [0, 0.66, 0.24], [0, 0.4, 0.0], 0.09, dark);
    m.box(xf, 0, 0.24, -0.02, 0.24, 0.18, 0.28, C.steel);
    m.box(xf, 0, 0.36, -0.36, 0.28, 0.24, 0.5, body); m.box(xf, 0, 0.36, -0.36, 0.3, 0.05, 0.5, hi);
    m.box(xf, 0, 0.6, -0.26, 0.24, 0.09, 0.62, C.seat);
    for (const sd of [-1, 1]) m.box(xf, sd * 0.16, 0.24, 0.02, 0.08, 0.02, 0.1, C.steel);
    m.box(xf, 0.15, 0.16, -0.38, 0.07, 0.08, 0.5, C.chrome); m.box(xf, 0.15, 0.17, -0.67, 0.06, 0.06, 0.08, C.black);
    m.box(xf, 0, 0.44, zr - 0.08, 0.14, 0.05, 0.28, C.black);
  }
  if (!o.wheels) m.box(xf, -0.1, 0, -0.05, 0.03, 0.22, 0.03, C.steel);                        // standar samping (diparkir)
  if (o.helmet) { m.box(xf, 0, 0.7, -0.32, 0.22, 0.17, 0.22, col(o.helmet)); m.box(xf, 0, 0.72, -0.2, 0.18, 0.08, 0.02, C.glass); }
}

/* ---------------------------------------------------------------- SEPEDA */
// jenis: 'kota' (keranjang, tegak), 'mtb' (gunung, ban tebal), 'onthel' (klasik tinggi hitam), 'bmx' (kecil)
export const BIKE_FIT = {
  kota: { seat: [0.68, -0.17], crank: [0.24, 0.03], bar: [0.95, 0.37], anim: 'pedalUp' },
  mtb: { seat: [0.71, -0.26], crank: [0.25, -0.06], bar: [0.89, 0.39], anim: 'pedal' },
  onthel: { seat: [0.74, -0.2], crank: [0.3, 0.0], bar: [1.01, 0.49], anim: 'pedalUp' },
  bmx: { seat: [0.56, -0.16], crank: [0.2, 0.0], bar: [0.71, 0.31], anim: 'pedal' },
};
export const BIKE_KINDS = Object.keys(BIKE_FIT);
export function sepeda(m, xf, c = '#2a8ae0', o = {}) { xf = scaled(xf, VK.sepeda); LO = !o.wheels; trk(xf, 0.3, 0.9); try { return sepeda_(m, xf, c, o); } finally { globalThis.__VEHCUR = 0; } }
function sepeda_(m, xf, c, o) {
  const kind = o.kind || 'kota', F = BIKE_FIT[kind], fr = col(kind === 'onthel' ? '#1e1e22' : c);
  const R = kind === 'onthel' ? 0.31 : kind === 'bmx' ? 0.21 : 0.27, zf = kind === 'onthel' ? 0.58 : kind === 'bmx' ? 0.42 : 0.52, zr = kind === 'onthel' ? -0.55 : kind === 'bmx' ? -0.4 : -0.48, y = R;
  const wo = { spokes: kind !== 'bmx', t: kind === 'mtb' ? 0.085 : 0.06, n: 18, tire: kind === 'onthel' ? col('#3a3a3a') : C.tire, rim: kind === 'bmx' ? col('#e8c020') : C.rim };
  WH(m, xf, o, 0, R, zf, R, kind === 'mtb' ? 0.08 : 0.05, wo); WH(m, xf, o, 0, R, zr, R, kind === 'mtb' ? 0.08 : 0.05, wo);
  const crank = [0, F.crank[0], F.crank[1]], seatTop = [0, F.seat[0] - 0.08, F.seat[1] + 0.02];
  const hd = kind === 'onthel' ? [0, 0.8, zf - 0.16] : kind === 'bmx' ? [0, 0.56, zf - 0.12] : [0, 0.68, zf - 0.14];
  const bar = [0, F.bar[0], F.bar[1]];
  line(m, xf, [0, y, zr], crank, 0.04, fr); line(m, xf, [0, y, zr], seatTop, 0.04, fr);
  line(m, xf, crank, seatTop, 0.045, fr); line(m, xf, crank, hd, kind === 'mtb' ? 0.07 : 0.05, fr);
  line(m, xf, kind === 'kota' ? [0, 0.38, -0.04] : seatTop, hd, 0.045, fr);
  line(m, xf, hd, [0, y, zf], kind === 'mtb' ? 0.05 : 0.035, kind === 'mtb' ? C.black : C.chrome);
  line(m, xf, hd, bar, 0.035, C.steel);
  const bw = kind === 'mtb' ? 0.3 : kind === 'onthel' ? 0.26 : 0.24;
  if (kind === 'onthel') { for (const sd of [-1, 1]) line(m, xf, [0, bar[1], bar[2]], [sd * bw, bar[1] + 0.02, bar[2] - 0.14], 0.03, C.chrome); }
  else m.box(xf, 0, bar[1], bar[2], bw * 2, 0.03, 0.04, C.steel);
  for (const sd of [-1, 1]) m.box(xf, sd * bw, bar[1] - 0.02, bar[2] - (kind === 'onthel' ? 0.14 : 0), 0.05, 0.05, 0.08, C.rubber);
  m.box(xf, 0, F.seat[0] - 0.05, F.seat[1], 0.11, 0.05, 0.22, kind === 'onthel' ? col('#5a3a24') : C.seat);
  line(m, xf, [0.035, F.crank[0], F.crank[1]], [0.035, y, zr], 0.015, C.black);
  if (kind === 'onthel') { m.box(xf, 0.05, F.crank[0] - 0.06, (zr + F.crank[1]) / 2, 0.02, 0.12, 0.5, fr); for (const z of [zf, zr]) m.box(xf, 0, R * 2 + 0.02, z, 0.08, 0.03, 0.4, fr); m.box(xf, 0, 0.82, zf - 0.08, 0.1, 0.1, 0.06, C.chrome); }
  if (kind === 'mtb') { m.box(xf, 0, 0.5, zf - 0.08, 0.1, 0.12, 0.06, C.steel); }
  if (kind === 'kota' || o.basket) { m.box(xf, 0, 0.62, zf + 0.0, 0.3, 0.2, 0.24, col('#8a6a40')); m.box(xf, 0, 0.64, zf + 0.0, 0.24, 0.18, 0.18, col('#6a4a2a')); }
  if (kind !== 'bmx') { m.box(xf, 0, F.seat[0] - 0.14, zr + 0.06, 0.1, 0.03, 0.26, C.black); m.box(xf, 0, F.seat[0] - 0.18, zr - 0.08, 0.06, 0.04, 0.02, C.tail); }
  if (!o.wheels) { m.box(xf, 0.04, F.crank[0] - 0.05, F.crank[1], 0.02, 0.12, 0.12, C.steel); m.box(xf, 0.06, F.crank[0] - 0.12, F.crank[1] + 0.08, 0.08, 0.03, 0.05, C.black); }
}

/* ---------------------------------------------------------------- MOBIL */
// kind: 'sedan' | 'mpv' | 'angkot' | 'pikap'; panjang ±3.4 (z), lebar ±1.45 (x)
export function car(m, xf, c = '#e8e8e8', kind = 'mpv', o = {}) { xf = scaled(xf, VK.car); if (!o.wheels && GUARD && !GUARD(P4(xf, 0.75, kind === 'sedan' ? 1.75 : 1.72))) return null; LO = !o.wheels; trk(xf, 0.75, kind === 'sedan' ? 1.75 : 1.72); try { return car_(m, xf, c, kind, o); } finally { globalThis.__VEHCUR = 0; } }
function car_(m, xf, c, kind, o) {
  const truk = kind === 'truk', taksi = kind === 'taksi';
  if (truk) kind = 'pikap'; if (taksi) kind = 'sedan';
  const body = col(c), lo = shade(body, 0.82), hw = kind === 'suv' ? 0.76 : kind === 'hatch' ? 0.68 : 0.72;
  const L2 = { sedan: 1.72, angkot: 1.6, hatch: 1.42, suv: 1.78 }[kind] || 1.7, sill = kind === 'suv' ? 0.34 : 0.24, belt = { mpv: 0.78, angkot: 0.78, suv: 0.9, hatch: 0.72 }[kind] || 0.72;
  const roof = { sedan: 1.22, angkot: 1.52, hatch: 1.3, suv: 1.62 }[kind] || 1.42;
  const R = kind === 'suv' ? 0.33 : kind === 'hatch' ? 0.25 : 0.27, zf = L2 - (kind === 'hatch' ? 0.55 : 0.68), zr = -L2 + (kind === 'hatch' ? 0.5 : 0.62);
  // roda (empat) + lengkung spakbor gelap
  for (const z of [zf, zr]) for (const s of [-1, 1]) { WH(m, xf, o, s * (hw - 0.09), R, z, R, 0.2, { rim5: true }); m.box(xf, s * (hw - 0.02), R * 2 - 0.08, z, 0.06, 0.14, R * 2 + 0.14, shade(body, 0.45)); }
  for (const s of [-1, 1]) m.box(xf, s * (hw + 0.004), sill - 0.02, 0, 0.02, 0.06, L2 * 2 - 1.5, shade(body, 0.55));   // list bawah pintu
  // badan bawah: sasis gelap, badan (lebar penuh) dengan bumper depan/belakang
  m.box(xf, 0, 0.14, 0, hw * 2 - 0.2, 0.12, L2 * 2 - 0.4, C.black);
  const front = kind === 'angkot' ? L2 - 0.15 : L2, hood = kind === 'angkot' ? belt + 0.05 : belt;
  m.box(xf, 0, sill, (zr - 0.62 + front) / 2 - 0.0, hw * 2, belt - sill, front - (zr - 0.62) - 0.0, body);
  m.box(xf, 0, sill, front - 0.04, hw * 2 + 0.04, 0.2, 0.12, kind === 'angkot' ? C.chrome : C.black);   // bumper depan
  m.box(xf, 0, sill, -L2 + 0.04, hw * 2 + 0.04, 0.2, 0.12, C.black);                                   // bumper belakang
  // kap & kaca depan miring, atap, kaca belakang (poligon)
  const zA = kind === 'angkot' ? L2 - 0.55 : kind === 'pikap' ? L2 - 1.1 : kind === 'hatch' ? L2 - 0.75 : kind === 'suv' ? L2 - 0.85 : L2 - 0.95;   // pangkal kaca depan
  const zB = zA - (kind === 'angkot' ? 0.18 : 0.62);                                     // ujung depan atap
  const zC = kind === 'pikap' ? zB - 0.9 : kind === 'sedan' ? -L2 + 1.0 : -L2 + 0.32;   // ujung belakang atap
  const zD = kind === 'pikap' ? zC - 0.05 : kind === 'sedan' ? -L2 + 0.42 : kind === 'hatch' ? -L2 + 0.08 : -L2 + 0.16; // pangkal kaca belakang
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
  if (kind === 'sedan' && !taksi) m.box(xf, 0, belt, -L2 + 0.18, hw * 1.6, 0.03, 0.12, shade(body, 0.9));   // spoiler kecil
  // detail umum: lis krom jendela, wiper, antena, knalpot, lampu kabut
  for (const s of [-1, 1]) m.box(xf, s * (hw - 0.01), belt - 0.01, (zA + zD) / 2, 0.02, 0.025, zA - zD - 0.1, C.chrome);
  for (const s of [-1, 1]) m.box(xf, s * 0.22, belt + 0.02, zA - 0.06, 0.34, 0.02, 0.03, C.black);
  m.box(xf, -hw + 0.2, roof, zC + 0.2, 0.02, 0.22, 0.02, C.black);
  m.box(xf, hw - 0.3, 0.14, -L2 - 0.02, 0.08, 0.07, 0.12, C.steel);
  for (const s of [-1, 1]) m.box(xf, s * (hw - 0.2), sill + 0.04, front + 0.01, 0.1, 0.06, 0.02, col('#e8e4c8'));
  if (kind === 'suv') { for (const s of [-1, 1]) m.box(xf, s * (hw - 0.18), roof + 0.02, (zB + zC) / 2, 0.04, 0.05, zB - zC - 0.2, C.steel); m.box(xf, 0, 0.5, -L2 - 0.1, 0.36, 0.36, 0.14, C.black); }   // rel atap & ban serep
  if (taksi) { m.box(xf, 0, roof, (zB + zC) / 2, 0.42, 0.14, 0.2, col('#f2f2ee')); m.box(xf, 0, roof + 0.03, (zB + zC) / 2 + 0.101, 0.32, 0.07, 0.005, col('#2a5ab0')); }
  if (truk) {   // bak boks tertutup
    const zb0 = zD - 0.04;
    m.box(xf, 0, belt, (zb0 - L2) / 2 - 0.05, hw * 2 + 0.06, 1.0, zb0 + L2 + 0.1, col(o.box || '#e8e4d8'));
    for (const s of [-1, 1]) m.box(xf, s * (hw + 0.035), belt + 0.4, (zb0 - L2) / 2, 0.01, 0.2, zb0 + L2 - 0.3, body);
  }
}

export const CAR_COLORS = ['#f2f2f0', '#c0c2c8', '#2a2a2e', '#b83a3a', '#3f6fa8', '#8a8a90', '#e8e2d0', '#4a6a4a'];
export const MOTOR_COLORS = ['#c83a3a', '#1e1e22', '#2a6ac0', '#e8e8e8', '#3a9a6a', '#d0d0d4', '#e88a2a'];
