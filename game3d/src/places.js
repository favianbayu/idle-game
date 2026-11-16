// Tempat baru guide 85 (nomor 19-32): GOR Kota + kolam renang umum, TPU, rumah pohon, pondok penebang, bumi perkemahan,
// curug, gua kapur, pasar loak, pabrik es, terminal bus, kolam pemancingan, Jembatan Timur, rakit, kandang sapi.
// Mengembalikan titik interaksi (kolam renang, titik mancing, rakit, api unggun, pintu) untuk main.js.
import * as THREE from 'three';
import { Merger, col, shade } from './geom.js';
import { FLOOR, hash, inPoly, colLocal } from './common.js';
import { L } from './buildings.js';
import { parkedMotors } from './toko.js';

const C_ = c => col(c);
const WOOD = C_('#8a6034'), WOOD2 = C_('#6e4a28'), BAMBU = C_('#c8b060'), TIN = C_('#9a9a96'), RUST = C_('#9a5a32'), WHITE = C_('#f4f2ea');
const at = (xf, lx, lz, da = 0) => { const [x, z] = L(xf, lx, lz); return { x, z, a: xf.a + da, y: xf.y }; };

export function buildPlaces({ ch, thin, K, M, C, veg, SB, S, occ, waterMat, BED, SURF }) {
  const out = { pools: [], fish: [], swim: [], raft: null, fire: null, doors: [], pois: [], cows: [], courts: [] };
  const wet = new Merger();   // permukaan air tambahan (kolam renang, air terjun) pakai bahan air beranimasi
  const cl = (xf, lx, lz, sx, sz) => colLocal(C, xf, lx, lz, sx, sz);
  const mark = (xf, w, d) => { const c = Math.cos(xf.a), s = Math.sin(xf.a); for (let u = -w / 2; u <= w / 2; u += 0.4) for (let v = -d / 2; v <= d / 2; v += 0.4) occ.set(xf.x + u * c - v * s, xf.z + u * s + v * c); };
  const P = (xf, lx, ly, lz) => { const [x, z] = L(xf, lx, lz); return [x, ly, z]; };
  const V = (k, x, z, e = {}) => veg.push({ k, x, z, a: hash(Math.round(x * 13), Math.round(z * 7)) * 6, ...e });
  const bboxA = a => { const xs = a.pts.map(p => p[0]), zs = a.pts.map(p => p[1]); return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...zs) - Math.min(...zs)); };
  const area = (cx, cz) => K.areas.filter((a, i) => i > 6 && inPoly(cx, cz, a.pts)).sort((a, b) => bboxA(a) - bboxA(b))[0];   // bidang terkecil yang memuat titik

  /* ---------------- GOR Kota (19): aula olahraga atap lengkung biru, pintu kaca, parkir motor */
  if (S.gor) {
    const b = S.gor, xf = { x: b.x, z: b.y, a: b.a }, w = b.w, d = b.h, H = 4.2, m = ch.at(b.x, b.y);
    m.box(xf, 0, 0, 0, w + 0.6, 0.22, d + 0.6, C_('#b8b4a8'));
    m.box(xf, 0, 0.22, 0, w, H, d, C_('#ece6d4'));
    m.box(xf, 0, 0.22, 0, w + 0.03, 1.0, d + 0.03, C_('#2f5a8a'));
    for (const sd of [1, -1]) {
      for (let u = -w / 2 + 0.25; u <= w / 2; u += 1.5) m.box(xf, u, 0.22, sd * (d / 2 + 0.06), 0.32, H, 0.14, C_('#f8f4ea'));
      m.box(xf, 0, 2.6, sd * (d / 2 + 0.03), w - 0.8, 1.0, 0.05, C_('#9ab8cc'));   // jendela pita (roster kaca)
      for (let u = -w / 2 + 1; u < w / 2 - 0.5; u += 0.5) m.box(xf, u, 2.6, sd * (d / 2 + 0.06), 0.05, 1.0, 0.05, C_('#e8e4d8'));
    }
    for (const sd of [1, -1]) { m.box(xf, sd * (w / 2 + 0.03), 2.6, 0, 0.05, 1.0, d - 1.2, C_('#9ab8cc')); }
    // atap lengkung: busur sepanjang z, bubungan sepanjang x
    const N = 10, R0 = d / 2 + 0.35, rise = 1.7, th0 = 1.15, Y0 = 0.22 + H;
    const arc = th => [Math.sin(th) * R0, Y0 + (Math.cos(th) - Math.cos(th0)) / (1 - Math.cos(th0)) * rise];
    for (let i = 0; i < N; i++) {
      const t0 = -th0 + 2 * th0 * i / N, t1 = -th0 + 2 * th0 * (i + 1) / N, [z0, y0] = arc(t0), [z1, y1] = arc(t1), c = i % 2 ? C_('#3a6ab4') : C_('#4a7cc4');
      m.poly2([P(xf, -w / 2 - 0.35, y0, z0), P(xf, w / 2 + 0.35, y0, z0), P(xf, w / 2 + 0.35, y1, z1), P(xf, -w / 2 - 0.35, y1, z1)], c);
    }
    for (const sd of [1, -1]) {   // dinding ujung atap (setengah lingkaran)
      const pts = []; for (let i = 0; i <= N; i++) { const [z, y] = arc(-th0 + 2 * th0 * i / N); pts.push(P(xf, sd * w / 2, y, z)); }
      m.poly2(sd > 0 ? pts.reverse() : pts, C_('#e2dccb'));
    }
    // pintu masuk: kanopi, 4 tiang, pintu kaca, tangga
    m.box(xf, 0, 0, d / 2 + 0.9, 5.4, 0.16, 1.9, C_('#c8c4b8'));
    for (const u of [-2.4, -0.8, 0.8, 2.4]) m.box(xf, u, 0.16, d / 2 + 1.6, 0.26, 2.6, 0.26, WHITE);
    m.box(xf, 0, 2.76, d / 2 + 0.95, 5.8, 0.22, 2.2, C_('#2f5a8a'));
    for (const u of [-1.2, 0, 1.2]) { m.box(xf, u, 0.22, d / 2 + 0.04, 1.0, 2.0, 0.05, C_('#4a6a88')); m.box(xf, u, 1.15, d / 2 + 0.07, 0.04, 0.3, 0.04, C_('#d8d8d8')); }
    SB.sign(xf, 0, 3.15, d / 2 + 0.1, 5.2, 0.95, SB.kinds.txt.gor);
    // tiang bendera, rak sepeda, papan jadwal
    const fp = at(xf, w / 2 - 0.6, d / 2 + 2.6); thin.at(fp.x, fp.z).box(fp, 0, 0, 0, 0.08, 4.6, 0.08, C_('#d8d8dc'));
    thin.at(fp.x, fp.z).box(fp, 0.35, 4.05, 0, 0.62, 0.22, 0.02, C_('#d82a2a')); thin.at(fp.x, fp.z).box(fp, 0.35, 3.83, 0, 0.62, 0.22, 0.02, WHITE); C.circle(fp.x, fp.z, 0.1);
    m.box(xf, -w / 2 + 1.2, 0, d / 2 + 2.2, 1.2, 1.4, 0.1, C_('#2a2a2e')); m.box(xf, -w / 2 + 1.2, 0.5, d / 2 + 2.26, 1.0, 0.8, 0.02, C_('#e8e4d0'));
    cl(xf, -w / 2 + 1.2, d / 2 + 2.2, 1.2, 0.2);
    parkedMotors(m, xf, -3.6, d / 2 + 2.7, 5, 0.55, Math.PI); parkedMotors(m, xf, 3.4, d / 2 + 2.7, 3, 0.55, Math.PI);
    cl(xf, 0, 0, w, d); for (const u of [-2.4, -0.8, 0.8, 2.4]) cl(xf, u, d / 2 + 1.6, 0.26, 0.26);
    out.doors.push({ id: 'gor', name: 'GOR Kota', ...pt(xf, 0, d / 2 + 0.6), h: xf.a + Math.PI / 2 });
    out.pois.push({ name: 'GOR Kota', ...pt(xf, 0, d / 2 + 2) });
  }

  /* ---------------- kolam renang umum: di samping GOR, pagar kawat, loket, menara penjaga, papan loncat */
  if (S.kolam) {
    const b = S.kolam, xf = { x: b.x, z: b.y, a: b.a }, w = b.w, d = b.h, m = ch.at(b.x, b.y);
    const pw = w - 2.2, pd = d - 2.6, pz = -0.3;
    m.box(xf, 0, 0, 0, w, 0.04, d, C_('#d8d4ca'));
    for (let u = -w / 2 + 0.5; u < w / 2; u += 1) m.box(xf, u, 0.04, 0, 0.03, 0.005, d, C_('#c4c0b4'));
    m.box(xf, 0, 0, pz, pw, 0.03, pd, C_('#2a8ac8'));                                     // dasar kolam (biru)
    for (let k = 1; k < 4; k++) m.box(xf, 0, 0.031, pz - pd / 2 + k * pd / 4, pw - 0.8, 0.004, 0.08, C_('#1a5a9a'));
    for (const sd of [1, -1]) { m.box(xf, 0, 0, pz + sd * (pd / 2 + 0.09), pw + 0.36, 0.1, 0.18, WHITE); m.box(xf, sd * (pw / 2 + 0.09), 0, pz, 0.18, 0.1, pd, WHITE); }
    { const q = [P(xf, -pw / 2, 0.07, pz - pd / 2), P(xf, pw / 2, 0.07, pz - pd / 2), P(xf, pw / 2, 0.07, pz + pd / 2), P(xf, -pw / 2, 0.07, pz + pd / 2)]; wet.poly(q.slice().reverse(), C_('#5ac8f0')); }
    for (let k = 1; k < 4; k++) for (let u = -pw / 2 + 0.15; u < pw / 2 - 0.1; u += 0.3) m.box(xf, u, 0.06, pz - pd / 2 + k * pd / 4, 0.2, 0.06, 0.06, Math.round(u * 3.3) % 2 ? C_('#e83a3a') : WHITE);   // tali lintasan
    for (const sd of [1, -1]) for (const s2 of [-0.18, 0.18]) { const lx = sd * (pw / 2 - 0.5) + s2, lz = pz + pd / 2 + 0.1; m.box(xf, lx, 0, lz, 0.05, 0.7, 0.05, C_('#d8d8dc')); m.box(xf, lx, 0.65, lz - 0.12, 0.05, 0.05, 0.28, C_('#d8d8dc')); }   // tangga besi
    m.box(xf, -pw / 2 - 0.5, 0, pz, 0.5, 0.35, 0.5, C_('#3a6ab4')); m.box(xf, -pw / 2 + 0.15, 0.35, pz, 1.5, 0.06, 0.4, WHITE);   // papan loncat
    { const t = at(xf, pw / 2 + 0.55, pz - 0.6); for (const [u, v] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) m.box(t, u, 0, v, 0.06, 1.5, 0.06, WHITE);   // kursi penjaga
      m.box(t, 0, 1.45, 0, 0.5, 0.08, 0.5, WHITE); m.box(t, 0.22, 1.5, 0, 0.06, 0.45, 0.5, WHITE); for (let k = 0; k < 4; k++) m.box(t, -0.26, 0.3 + k * 0.32, 0, 0.04, 0.04, 0.44, WHITE);
      m.box(t, 0, 1.53, 0, 0.04, 1.0, 0.04, C_('#d8d8dc')); m.box(t, 0, 2.45, 0, 1.1, 0.06, 1.1, C_('#e85a2a')); cl(t, 0, 0, 0.5, 0.5); }
    for (let i = 0; i < 3; i++) { const t = at(xf, -w / 2 + 0.7 + i * 1.2, d / 2 - 0.55, Math.PI / 2); m.box(t, 0, 0.15, 0, 1.0, 0.06, 0.42, i % 2 ? C_('#f6f6f2') : C_('#3a8ac8')); m.box(t, -0.42, 0.15, 0, 0.18, 0.3, 0.42, i % 2 ? C_('#f6f6f2') : C_('#3a8ac8')); for (const u of [-0.4, 0.4]) m.box(t, u, 0, 0, 0.05, 0.15, 0.4, C_('#8a8a8a')); }   // kursi santai
    { const t = at(xf, w / 2 - 1.1, d / 2 - 0.75); m.box(t, 0, 0, 0, 0.06, 1.8, 0.06, WHITE); m.box(t, 0, 1.8, 0, 1.4, 0.05, 1.4, C_('#f6c81a')); m.box(t, 0, 1.75, 0, 1.0, 0.05, 1.0, C_('#e84a3a')); m.box(t, 0, 0, 0, 0.7, 0.5, 0.7, WHITE); cl(t, 0, 0, 0.7, 0.7); }
    // ruang bilas & ganti (pojok belakang), shower
    { const t = at(xf, -w / 2 + 1.05, -d / 2 + 0.75); m.box(t, 0, 0, 0, 1.9, 2.0, 1.3, C_('#f2eee2')); m.box(t, 0, 0, 0.66, 0.6, 1.5, 0.04, C_('#3a6ab4')); m.box(t, 0, 2.0, 0, 2.1, 0.12, 1.5, C_('#3a6ab4')); cl(t, 0, 0, 1.9, 1.3); }
    { const t = at(xf, w / 2 - 0.5, -d / 2 + 0.5); m.box(t, 0, 0, 0, 0.06, 2.0, 0.06, C_('#c8c8cc')); m.box(t, 0, 1.95, 0.15, 0.06, 0.06, 0.35, C_('#c8c8cc')); m.box(t, 0, 1.85, 0.3, 0.16, 0.08, 0.16, C_('#c8c8cc')); }
    // pagar kawat keliling, bukaan di depan (loket di samping bukaan)
    const fence = (x0, z0, x1, z1) => { const l = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(l / 0.28)), a = Math.atan2(z1 - z0, x1 - x0);
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, t = at(xf, mx, mz, 0), tt = { ...t, a: xf.a + a }, mm = thin.at(t.x, t.z);
      mm.box(tt, 0, 1.3, 0, l, 0.05, 0.05, C_('#6a7a6a')); mm.box(tt, 0, 0.05, 0, l, 0.05, 0.05, C_('#6a7a6a'));
      for (let k = 0; k <= n; k++) mm.box(tt, -l / 2 + k * l / n, 0, 0, k % 4 ? 0.02 : 0.06, 1.35, k % 4 ? 0.02 : 0.06, C_('#7a8a7a'));
      cl(tt, 0, 0, l, 0.12); };
    const fx = w / 2 + 0.05, fz = d / 2 + 0.05, gap = 0.8;
    fence(-fx, -fz, fx, -fz); fence(-fx, -fz, -fx, fz); fence(fx, -fz, fx, fz); fence(-fx, fz, -gap, fz); fence(gap + 1.0, fz, fx, fz);
    { const t = at(xf, gap + 0.5, fz + 0.45); m.box(t, 0, 0, 0, 1.0, 1.0, 0.8, C_('#2a8ac8')); m.box(t, 0, 1.0, 0.2, 1.0, 0.5, 0.04, C_('#9ac8e0')); m.box(t, 0, 1.5, 0, 1.2, 0.08, 1.0, C_('#f6c81a')); cl(t, 0, 0, 1.0, 0.8); }
    SB.sign(xf, -0.6, 1.45, fz + 0.03, 2.6, 0.55, SB.kinds.txt.kolam); SB.sign({ ...xf, a: xf.a + Math.PI }, 0.6, 1.45, -fz + 0.03, 2.6, 0.55, SB.kinds.txt.kolam);
    const pc = pt(xf, 0, pz);
    out.pools.push({ x: pc.x, z: pc.z, a: xf.a, w: pw, d: pd, y: 0.07, name: 'Kolam renang umum' });
    out.pois.push({ name: 'Kolam renang umum', ...pt(xf, 0, fz + 1) });
  }

  /* ---------------- TPU Bhakti (20): makam berjajar, kamboja, tembok rendah, gapura, cungkup */
  { const A = area(193, 113);
    if (A) {
      const pts = A.pts, cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cz = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      // gerbang: titik keliling yang paling dekat jalan
      let gate = null, gd = 1e9;
      for (let i = 1; i < pts.length; i++) for (let t = 0.1; t < 0.95; t += 0.1) { const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, z = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t, rd = M.roadDist(x, z); if (rd < gd) { gd = rd; gate = { x, z, a: Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) }; } }
      for (let i = 1; i < pts.length; i++) {
        const [x0, z0] = pts[i - 1], [x1, z1] = pts[i], l = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(z1 - z0, x1 - x0);
        for (let s = 0; s < l; s += 1) {
          const x = x0 + Math.cos(a) * (s + 0.5), z = z0 + Math.sin(a) * (s + 0.5); if (gate && Math.hypot(x - gate.x, z - gate.z) < 1.4) continue; if (M.roadDist(x, z) < 0.3) continue;
          const t = { x, z, a }, mm = ch.at(x, z); mm.box(t, 0, 0, 0, Math.min(1, l - s) + 0.02, 0.55, 0.18, C_('#e8e4d8')); mm.box(t, 0, 0.55, 0, Math.min(1, l - s) + 0.04, 0.06, 0.24, C_('#b8b4a8')); cl(t, 0, 0, 1, 0.2);
        }
      }
      if (gate) { const t = { x: gate.x, z: gate.z, a: gate.a }, mm = ch.at(gate.x, gate.z);
        for (const sd of [-1, 1]) { mm.box(t, sd * 1.25, 0, 0, 0.4, 2.2, 0.4, C_('#e8e4d8')); mm.box(t, sd * 1.25, 2.2, 0, 0.5, 0.25, 0.5, C_('#3a5a3a')); cl(t, sd * 1.25, 0, 0.4, 0.4); }
        mm.box(t, 0, 2.15, 0, 2.9, 0.3, 0.3, C_('#e8e4d8')); SB.sign(t, 0, 2.5, 0.0, 2.6, 0.55, SB.kinds.txt.tpu, { back: true });
        out.pois.push({ name: 'TPU Bhakti', x: gate.x, z: gate.z }); }
      // makam: grid di dalam poligon, jalur tengah dibiarkan kosong
      let n = 0;
      for (let z = Math.min(...pts.map(p => p[1])) + 1.4; z < Math.max(...pts.map(p => p[1])) - 1; z += 1.55) for (let x = Math.min(...pts.map(p => p[0])) + 1.3; x < Math.max(...pts.map(p => p[0])) - 1; x += 1.15) {
        if (Math.abs(x - cx) < 0.9) continue;
        if (![[-0.8, -0.9], [0.8, -0.9], [-0.8, 0.9], [0.8, 0.9]].every(([u, v]) => inPoly(x + u, z + v, pts))) continue;
        if (gate && Math.hypot(x - gate.x, z - gate.z) < 2.2) continue;
        const r = hash(Math.round(x * 5), Math.round(z * 5)), t = { x: x + (r - 0.5) * 0.15, z, a: Math.PI / 2 + (r - 0.5) * 0.08 }, mm = ch.at(x, z);
        if (r < 0.35) { mm.box(t, 0, 0, 0, 1.15, 0.2, 0.62, C_('#ecebe4')); mm.box(t, 0, 0.2, 0, 0.95, 0.04, 0.44, C_('#8a6a44')); }        // kijing keramik putih
        else if (r < 0.55) { mm.box(t, 0, 0, 0, 1.1, 0.12, 0.55, C_('#5a8a5a')); mm.box(t, 0, 0.12, 0, 0.9, 0.08, 0.4, C_('#7a5a3a')); }    // pagar kecil hijau
        else mm.box(t, 0, 0, 0, 1.0, 0.14, 0.45, C_('#8a6a44'));                                                                             // gundukan tanah
        const nc = r < 0.5 ? C_('#f2f0ea') : r < 0.8 ? C_('#b8b4aa') : C_('#e8e0c8');
        mm.box(t, -0.52, 0, 0, 0.08, 0.55 + r * 0.2, 0.32, nc); mm.box(t, -0.52, 0.55 + r * 0.2, 0, 0.1, 0.08, 0.2, nc);                   // nisan
        mm.box(t, 0.5, 0, 0, 0.06, 0.32, 0.22, nc);
        if (r > 0.6) V('bunga:' + ['#f6f6f6', '#f0a0c0', '#f6d84a'][n % 3], ...L(t, 0.1, 0), { s: 0.8 });
        cl(t, 0, 0, 1.15, 0.6); n++;
      }
      // kamboja di pinggir, cungkup (pondok peneduh) di dekat gerbang
      for (let i = 1; i < pts.length; i += 2) { const [x, z] = pts[i], ix = x + (cx - x) * 0.12, iz = z + (cz - z) * 0.12; V('kamboja', ix, iz, { s: 1.1 }); C.circle(ix, iz, 0.25); }
      for (const [x, z] of [[cx, cz - 3], [cx, cz + 3]]) if (inPoly(x, z, pts)) { V('kamboja', x, z, { s: 1.25 }); C.circle(x, z, 0.25); }
      if (gate) { const t = at({ x: gate.x, z: gate.z, a: gate.a }, 2.6, (cz - gate.z) * Math.cos(gate.a) - (cx - gate.x) * Math.sin(gate.a) > 0 ? 2.2 : -2.2), mm = ch.at(t.x, t.z);
        for (const [u, v] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) mm.box(t, u, 0, v, 0.14, 1.9, 0.14, WOOD2);
        mm.box(t, 0, 0, 0, 2.1, 0.15, 2.1, C_('#c8c4b8')); mm.hip(t, 0, 1.9, 0, 2.4, 2.4, 0.9, C_('#3a5a3a')); mm.box(t, 0, 0.15, -0.6, 1.6, 0.35, 0.4, WOOD); cl(t, 0, 0, 2, 2); }
    } }

  /* ---------------- rumah pohon tua (21) di Hutan Jati */
  { const t = { x: 236.6, z: 113.4, a: 0.3 }, m = ch.at(t.x, t.z), H = 2.4;
    m.box(t, 0, 0, 0, 0.75, 5.2, 0.75, C_('#6a4a2c')); m.box(t, 0, 0, 0, 1.1, 0.5, 1.1, C_('#5a3e24'));
    for (const [a, l, y] of [[0.4, 1.6, 3.4], [2.3, 1.4, 3.8], [4.1, 1.5, 4.3], [5.4, 1.2, 4.7]]) { const b = { ...t, a: t.a + a }; m.box(b, l / 2, y, 0, l, 0.22, 0.22, C_('#6a4a2c')); }
    V('bulat', t.x, t.z, { s: 2.3, y: 1.9 }); V('bulat', t.x + 1.2, t.z - 0.8, { s: 1.5, y: 2.6 });
    m.box(t, 0, H, 0, 3.2, 0.14, 3.0, WOOD);                                                                       // lantai papan
    for (let u = -1.5; u <= 1.5; u += 0.3) m.box(t, u, H + 0.14, 0, 0.02, 0.005, 3.0, WOOD2);
    for (const [u, v] of [[-1.5, -1.4], [1.5, -1.4], [-1.5, 1.4], [1.5, 1.4]]) m.box(t, u, 0, v, 0.16, H, 0.16, WOOD2);    // kaki penyangga
    // gubuk kecil di atas: dinding papan, jendela, atap seng miring
    m.box(t, -0.5, H + 0.14, -0.4, 1.9, 1.3, 1.8, C_('#9a6a3c')); for (let u = -1.4; u < 0.5; u += 0.32) m.box(t, u, H + 0.14, 0.51, 0.03, 1.3, 0.02, WOOD2);
    m.box(t, -0.9, H + 0.75, 0.52, 0.5, 0.4, 0.03, C_('#2a2018')); m.box(t, 0.2, H + 0.14, 0.52, 0.5, 1.0, 0.03, C_('#3a2818'));
    m.poly2([P(t, -1.6, H + 1.75, -1.45), P(t, 0.6, H + 1.75, -1.45), P(t, 0.6, H + 1.35, 0.7), P(t, -1.6, H + 1.35, 0.7)], RUST);
    for (const sd of [-1, 1]) m.box(t, sd * 1.55, H + 0.14, 0.8, 0.05, 0.6, 1.3, WOOD2);                                // pagar teras
    m.box(t, 1.0, H + 0.14, -0.9, 0.6, 0.4, 0.4, C_('#7a4a24'));                                                         // peti
    // tangga kayu dari tanah
    for (const sd of [-0.25, 0.25]) m.box(t, 0.9, 0, 1.75 + 0.1, 0.06, H + 0.4, 0.06, WOOD2);
    for (let y = 0.3; y < H; y += 0.35) m.box(t, 0.9, y, 1.85, 0.56, 0.05, 0.05, WOOD);
    for (const sd of [-0.25, 0.25]) { const q = at(t, 0.9 + sd, 1.82); thin.at(q.x, q.z).box(q, 0, 0, 0, 0.05, H + 0.4, 0.05, WOOD2); }
    // ayunan tali dari dahan
    { const q = at({ ...t, a: t.a + 0.4 }, 1.3, 0); for (const sd of [-0.2, 0.2]) thin.at(q.x, q.z).box(q, 0, 0.5, sd, 0.02, 2.9, 0.02, C_('#c8b88a')); thin.at(q.x, q.z).box(q, 0, 0.45, 0, 0.25, 0.05, 0.5, WOOD); }
    C.circle(t.x, t.z, 0.6); for (const [u, v] of [[-1.5, -1.4], [1.5, -1.4], [-1.5, 1.4], [1.5, 1.4]]) { const q = at(t, u, v); C.circle(q.x, q.z, 0.12); }
    mark(t, 4, 4); out.pois.push({ name: 'Rumah pohon tua', ...pt(t, 0.9, 2.5) });
    out.doors.push({ id: 'rumahPohon', name: 'Naik ke rumah pohon', ...pt(t, 0.9, 2.2), h: 0 }); }

  /* ---------------- pondok penebang terbengkalai (22) */
  { const t = { x: 249.6, z: 127.2, a: -0.2 }, m = ch.at(t.x, t.z), w = 3.2, d = 2.6, wc = C_('#7a6a58');
    m.box(t, 0, 0, 0, w + 0.3, 0.3, d + 0.3, C_('#6a6a62'));
    m.box(t, 0, 0.3, 0, w, 1.7, d, wc); for (let u = -w / 2; u < w / 2; u += 0.35) m.box(t, u, 0.3, d / 2 + 0.01, 0.03, 1.7, 0.02, C_('#5a4a3a'));
    m.box(t, -0.5, 0.3, d / 2 + 0.03, 0.75, 1.35, 0.03, C_('#3a2a1e')); m.box(t, 0.9, 0.95, d / 2 + 0.03, 0.6, 0.45, 0.03, C_('#1a1612'));
    m.box(t, -0.1, 0.32, d / 2 + 0.3, 0.6, 1.3, 0.05, C_('#5a4430'), {});   // daun pintu lepas bersandar
    m.gable(t, 0, 2.0, 0, w, d, 1.0, C_('#6a5a48'), 0.3);
    m.box(t, 0.8, 2.25, 0.4, 0.9, 0.12, 0.8, C_('#3a2a1e'));                                                             // atap bolong (gelap)
    SB.sign(t, -1.0, 1.4, d / 2 + 0.06, 0.9, 0.36, SB.kinds.txt.pondok);
    for (let i = 0; i < 5; i++) m.box(t, -w / 2 - 0.6, 0.18 + (i % 3) * 0.28, -0.8 + Math.floor(i / 3) * 0.3 + (i % 3) * 0.05, 0.28, 0.28, 1.6, i % 2 ? C_('#8a6a44') : C_('#7a5a3a'));   // tumpukan kayu
    m.box(t, w / 2 + 0.9, 0, 1.2, 0.6, 0.45, 0.6, C_('#8a6a44')); m.box(t, w / 2 + 0.9, 0.45, 1.2, 0.05, 0.05, 0.7, C_('#8a8a90')); m.box(t, w / 2 + 0.9, 0.42, 1.55, 0.18, 0.12, 0.04, C_('#5a5a60'));   // tunggul + kapak
    { const q = at(t, w / 2 + 0.6, -0.6, 0.6); m.box(q, 0, 0.25, 0, 0.6, 0.3, 0.9, C_('#6a7a6a')); m.box(q, 0, 0, 0.5, 0.1, 0.3, 0.3, C_('#2a2a2a')); for (const sd of [-0.25, 0.25]) m.box(q, sd, 0.25, -0.7, 0.05, 0.05, 0.6, WOOD2); }   // gerobak dorong
    cl(t, 0, 0, w + 0.3, d + 0.3); cl(t, -w / 2 - 0.6, -0.5, 0.9, 1.8); mark(t, w + 3, d + 3);
    out.pois.push({ name: 'Pondok penebang', ...pt(t, 0, d / 2 + 1) });
    out.doors.push({ id: 'pondok', name: 'Masuk pondok', ...pt(t, -0.5, d / 2 + 0.5), h: t.a + Math.PI / 2 }); }

  /* ---------------- bumi perkemahan (23): tenda, api unggun, tiang bendera, gapura bambu */
  { const A = area(30, 28);
    // pusat kemah: cari lahan terdekat ke titik peta yang seluruh lingkaran tendanya bebas dari jalan & air
    const clear = (x, z) => { for (let a = 0; a < 6.28; a += 0.3) for (const k of [0, 0.5, 1]) { const px = x + Math.cos(a) * 6.8 * k, pz = z + Math.sin(a) * 5.4 * k; if (M.roadDist(px, pz) < 0.8 || M.waterAt(px, pz) || M.railAt(px, pz)) return false; } return true; };
    let cx = 30, cz = 28.5;
    if (!clear(cx, cz)) { let done = false; for (let r = 1; r <= 16 && !done; r += 1) for (let k = 0; k < 24; k++) { const t = k / 24 * 6.28, x = 30 + Math.cos(t) * r, z = 28.5 + Math.sin(t) * r; if (clear(x, z)) { cx = x; cz = z; done = true; break; } } }
    if (globalThis.__TRACEON) console.log('kemah at', cx.toFixed(1), cz.toFixed(1));
    const tent = (x, z, a, c) => { const t = { x, z, a }, mm = ch.at(x, z), w = 1.6, l = 2.0, h = 1.15;
      mm.poly2([P(t, -w / 2, 0, -l / 2), P(t, -w / 2, 0, l / 2), P(t, 0, h, l / 2), P(t, 0, h, -l / 2)], c);
      mm.poly2([P(t, w / 2, 0, l / 2), P(t, w / 2, 0, -l / 2), P(t, 0, h, -l / 2), P(t, 0, h, l / 2)], shade(c, 0.85));
      mm.poly2([P(t, -w / 2, 0, -l / 2), P(t, 0, h, -l / 2), P(t, w / 2, 0, -l / 2)], shade(c, 0.92));
      mm.poly([P(t, -w / 2, 0, l / 2 - 0.01), P(t, w / 2, 0, l / 2 - 0.01), P(t, 0, h, l / 2 - 0.01)], C_('#2a2018'));          // pintu tenda terbuka
      mm.poly2([P(t, -w / 2 * 0.7, 0, l / 2), P(t, -0.15, h * 0.85, l / 2 + 0.25), P(t, -0.05, 0, l / 2 + 0.35)], shade(c, 1.1));
      for (const sd of [-1, 1]) mm.box(t, 0, 0, sd * (l / 2 + 0.05), 0.04, h + 0.15, 0.04, C_('#5a5a5a'));
      cl(t, 0, 0, w, l); };
    const cols = ['#e8782a', '#3a8a4a', '#3a6ab4', '#d8c040', '#c83a3a', '#7a4a9a'];
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3, x = cx + Math.cos(a) * 4.2, z = cz + Math.sin(a) * 3.0; tent(x, z, Math.atan2(cz - z, cx - x) - Math.PI / 2, C_(cols[i])); }
    { const t = { x: cx, z: cz, a: 0 }, mm = ch.at(cx, cz);   // api unggun
      for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28; mm.box({ x: cx + Math.cos(a) * 0.45, z: cz + Math.sin(a) * 0.45, a }, 0, 0, 0, 0.22, 0.16, 0.2, C_('#8a8680')); }
      for (let i = 0; i < 4; i++) mm.box({ ...t, a: i * 0.8 }, 0, 0.08, 0, 0.7, 0.1, 0.1, C_('#5a3a22'));
      mm.box(t, 0, 0.15, 0, 0.3, 0.35, 0.3, C_('#f6a01a')); mm.box(t, 0.05, 0.3, 0, 0.18, 0.35, 0.18, C_('#f6d84a')); mm.box(t, -0.08, 0.2, 0.06, 0.14, 0.25, 0.14, C_('#e8501a'));
      for (let i = 0; i < 3; i++) { const a = i / 3 * 6.28 + 0.5, q = { x: cx + Math.cos(a) * 1.5, z: cz + Math.sin(a) * 1.5, a: a + Math.PI / 2 }; mm.box(q, 0, 0, 0, 1.3, 0.32, 0.32, C_('#7a5434')); cl(q, 0, 0, 1.3, 0.3); }
      C.circle(cx, cz, 0.5); out.fire = { x: cx, z: cz }; }
    { const fx = cx + 5.5, fz = cz - 1, t = { x: fx, z: fz, a: 0 }, mm = thin.at(fx, fz);   // tiang bendera bambu
      mm.box(t, 0, 0, 0, 0.1, 4.4, 0.1, BAMBU); mm.box(t, 0.4, 3.9, 0, 0.7, 0.24, 0.02, C_('#d82a2a')); mm.box(t, 0.4, 3.66, 0, 0.7, 0.24, 0.02, WHITE);
      for (const [u, v] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) ch.at(fx, fz).box(t, u, 0, v, 0.25, 0.2, 0.25, C_('#a8a49a')); C.circle(fx, fz, 0.12); }
    { let best = null; for (let a = 0; a < 6.28; a += 0.2) { const x = cx + Math.cos(a) * 6.5, z = cz + Math.sin(a) * 5, d = M.roadDist(x, z); if (d > 0.4 && (!best || d < best.d)) best = { x, z, d, a }; }   // gapura bambu ke arah jalan
      if (best) { const t = { x: best.x, z: best.z, a: best.a + Math.PI / 2 }, mm = ch.at(t.x, t.z);
        for (const sd of [-1, 1]) { mm.box(t, sd * 1.2, 0, 0, 0.16, 2.5, 0.16, BAMBU); cl(t, sd * 1.2, 0, 0.16, 0.16); }
        mm.box(t, 0, 2.3, 0, 2.8, 0.14, 0.14, BAMBU); mm.box(t, 0, 2.45, 0, 2.8, 0.1, 0.1, C_('#b09a50'));
        SB.sign(t, 0, 1.75, 0.08, 2.2, 0.5, SB.kinds.txt.kemah, { back: true }); out.pois.push({ name: 'Bumi perkemahan', x: t.x, z: t.z }); } }
    { const t = { x: cx - 5.2, z: cz + 2.8, a: 0.4 }, mm = ch.at(t.x, t.z);   // tumpukan kayu bakar & jemuran
      for (let i = 0; i < 6; i++) mm.box({ ...t, a: t.a + (i % 2) * 0.1 }, 0, (i % 3) * 0.16, -0.3 + Math.floor(i / 3) * 0.3, 1.0, 0.16, 0.16, C_('#7a5434'));
      cl(t, 0, 0, 1.1, 0.7); }
    { const t = { x: cx + 3, z: cz + 4.5, a: 0 }, mm = thin.at(t.x, t.z);
      for (const sd of [-1.3, 1.3]) mm.box(t, sd, 0, 0, 0.06, 1.4, 0.06, BAMBU); mm.box(t, 0, 1.35, 0, 2.6, 0.02, 0.02, C_('#d8d8d0'));
      for (const [u, c] of [[-0.8, '#d82a2a'], [-0.2, '#3a6ab4'], [0.5, '#e8e0c8']]) mm.box(t, u, 0.95, 0, 0.4, 0.4, 0.02, C_(c)); }
    mark({ x: cx, z: cz, a: 0 }, 12, 9);
  }

  /* ---------------- curug Cemara (24): tebing batu berlumut + air terjun ke kolam kecil */
  { const A = area(52, 30);
    if (A) {
      const zs = A.pts.map(p => p[1]), top = Math.min(...zs), xs = A.pts.filter(p => p[1] < top + 2.2).map(p => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs), mx = (x0 + x1) / 2;   // tebing hanya selebar ujung danau di kaki curug
      for (let x = x0 - 2.5; x <= x1 + 2.5; x += 0.9) {
        const r = hash(Math.round(x * 7), 31), h = 3.0 + r * 1.6 - Math.abs(x - mx) * 0.18, z = top - 1.6 - r * 0.6;
        const t = { x, z, a: (r - 0.5) * 0.3 }, mm = ch.at(x, z);
        mm.box(t, 0, BED, 0.4, 1.1, h - BED, 1.8, C_(r < 0.5 ? '#8a8478' : '#7a7468')); mm.box(t, 0, h, 0.4, 1.15, 0.22, 1.85, C_('#5a7a44'));
        mm.box(t, 0.1, BED, 1.2, 0.9, h * 0.55 - BED, 0.6, C_('#9a9488')); cl(t, 0, 0.6, 1.1, 2.4);
      }
      // air terjun: lembar air jatuh + buih di bawah
      const fz = top - 0.35;
      for (let k = 0; k < 3; k++) { const u = mx - 0.6 + k * 0.6, h0 = 3.4; wet.poly2([[u - 0.3, h0, fz - 0.15], [u + 0.3, h0, fz - 0.15], [u + 0.3, SURF + 0.02, fz + 0.15], [u - 0.3, SURF + 0.02, fz + 0.15]], C_(k % 2 ? '#d8f0ff' : '#b8e0f8')); }
      { const mm = ch.at(mx, fz + 0.4); for (let i = 0; i < 6; i++) mm.box({ x: mx - 0.9 + i * 0.36, z: fz + 0.35 + (i % 2) * 0.2, a: 0 }, 0, SURF - 0.05, 0, 0.32, 0.12, 0.32, C_('#f4fbff')); }
      for (const [dx, dz, s] of [[-3.2, 1.8, 0.9], [3.1, 1.2, 1.1], [-2.0, 3.6, 0.7], [2.6, 3.8, 0.8]]) { const x = mx + dx, z = top + dz; if (!M.waterAt(x, z)) { V('batu', x, z, { s: s * 2.2 }); C.circle(x, z, 0.4 * s); } }
      { const t = { x: x1 + 1.3, z: top + 1.4, a: -0.3 }, mm = ch.at(t.x, t.z); mm.box(t, 0, 0, 0, 1.4, 0.45, 1.0, C_('#9a9488')); mm.box(t, 0, 0.45, 0, 1.3, 0.05, 0.9, C_('#a8a296')); cl(t, 0, 0, 1.4, 1.0); }   // batu datar tempat Sekar menulis lagu
      { let best = null; for (let a = 0; a < 6.28; a += 0.25) { const x = mx + Math.cos(a) * 5.5, z = top + 2 + Math.sin(a) * 4; if (z < top) continue; const d = M.roadDist(x, z); if (d > 0.4 && !M.waterAt(x, z) && (!best || d < best.d)) best = { x, z, d }; }
        if (best) { const t = { x: best.x, z: best.z, a: 0 }, mm = ch.at(t.x, t.z); mm.box(t, 0, 0, 0, 0.12, 1.1, 0.12, WOOD2); mm.box(t, 0, 1.0, 0, 1.6, 0.5, 0.08, WOOD); SB.sign(t, 0, 1.03, 0.05, 1.5, 0.42, SB.kinds.txt.curug, { back: true }); C.circle(t.x, t.z, 0.1); } }
      out.swim.push({ name: 'Curug Cemara', x: mx, z: top + 2 }); out.pois.push({ name: 'Curug Cemara', x: mx, z: top + 3 });
      mark({ x: mx, z: top - 1.5, a: 0 }, x1 - x0 + 6, 3.5);
    } }

  /* ---------------- gua kapur (25): bukit batu kapur dengan mulut gua */
  { const cx = 102, cz = 1.8, t0 = { x: cx, z: cz, a: 0 }, m = ch.at(cx, cz), LC = C_('#d8d2c0'), LC2 = C_('#c8c0aa');
    for (let i = 0; i < 26; i++) {
      const r1 = hash(i, 91), r2 = hash(i, 92), r3 = hash(i, 93), u = -4.6 + r1 * 9.2, v = -1.8 + r2 * 2.6, h = 1.6 + (1 - Math.abs(u) / 5) * 2.4 * (0.6 + r3 * 0.6);
      if (Math.abs(u) < 2.0 && v > -0.9) continue;   // sisakan mulut gua
      m.box({ ...t0, a: (r3 - 0.5) * 0.5 }, u, 0, v, 1.3 + r3 * 0.8, h, 1.3 + r1 * 0.7, i % 3 ? LC : LC2);
      if (r2 > 0.55) m.box({ ...t0, a: (r3 - 0.5) * 0.5 }, u, h, v, 1.0, 0.15, 1.0, C_('#7a9a5a'));
    }
    m.box(t0, 0, 0, -0.9, 2.6, 2.3, 1.6, LC); m.box(t0, 0, 2.3, -0.4, 3.0, 1.3, 2.4, LC2);
    m.box(t0, 0, 0, 0.1, 1.5, 1.75, 0.05, C_('#14120f')); m.box(t0, 0, 0.005, 0.5, 1.5, 0.01, 0.8, C_('#3a3630'));   // mulut gua gelap
    for (const sd of [-1, 1]) m.box(t0, sd * 1.15, 0, 0, 0.8, 2.3, 1.0, LC2); m.box(t0, 0, 1.75, 0, 3.1, 0.75, 1.0, LC);   // bingkai batu di sekeliling mulut
    for (const u of [-0.55, -0.15, 0.3, 0.6]) m.box(t0, u, 1.6 + hash(u * 10, 3) * 0.15, 0.1, 0.1, 0.25, 0.1, LC2);   // stalaktit
    for (const [u, v] of [[-1.5, 1.2], [1.7, 1.0], [2.6, 1.6]]) { V('batu', cx + u, cz + v, { s: 1.6 }); C.circle(cx + u, cz + v, 0.35); }
    { const t = { x: cx + 1.9, z: cz + 2.6, a: 0 }; m.box(t, 0, 0, 0, 0.1, 1.0, 0.1, WOOD2); m.box(t, 0, 0.9, 0, 1.4, 0.45, 0.06, WOOD); SB.sign(t, 0, 0.92, 0.04, 1.3, 0.4, SB.kinds.txt.gua, { back: true }); C.circle(t.x, t.z, 0.08); }
    for (const [u, w] of [[-3.0, 3.4], [3.0, 3.4]]) cl(t0, u, -0.6, w, 3.2); cl(t0, 0, -1.0, 2.6, 2.0);
    mark(t0, 11, 6); out.doors.push({ id: 'gua', name: 'Masuk Gua Kapur', x: cx, z: cz + 0.7, h: Math.PI / 2 }); out.pois.push({ name: 'Gua Kapur', x: cx, z: cz + 2.5 });
  }

  /* ---------------- pasar loak (26): lapak terpal di lahan tanah */
  { const A = area(138, 117);
    if (A) {
      const xs = A.pts.map(p => p[0]), zs = A.pts.map(p => p[1]), tarp = ['#2a6ab4', '#e8782a', '#3a8a4a', '#c83a3a', '#2a8ac8', '#d8b030'];
      let i = 0;
      for (let z = Math.min(...zs) + 2; z < Math.max(...zs) - 1.5; z += 3.4) for (let x = Math.min(...xs) + 2; x < Math.max(...xs) - 1.5; x += 3.2) {
        if (![[-1.3, -1.2], [1.3, -1.2], [-1.3, 1.2], [1.3, 1.2]].every(([u, v]) => inPoly(x + u, z + v, A.pts) && M.roadDist(x + u, z + v) > 0.8)) continue;
        if (Math.abs(z - (Math.min(...zs) + Math.max(...zs)) / 2) < 1.2) continue;   // lorong tengah
        const r = hash(i, 71), t = { x, z, a: 0 }, mm = ch.at(x, z), tc = C_(tarp[i % tarp.length]);
        for (const [u, v, h] of [[-1.2, -1.0, 2.1], [1.2, -1.0, 2.1], [-1.2, 1.0, 1.7], [1.2, 1.0, 1.7]]) { mm.box(t, u, 0, v, 0.07, h, 0.07, BAMBU); }
        mm.poly2([P(t, -1.35, 2.1, -1.15), P(t, 1.35, 2.1, -1.15), P(t, 1.35, 1.7, 1.2), P(t, -1.35, 1.7, 1.2)], tc);
        if (r < 0.5) { mm.box(t, 0, 0, 0, 2.2, 0.6, 0.9, C_('#8a6a44')); } else mm.box(t, 0, 0, 0.1, 2.3, 0.03, 1.6, C_(['#6a4a8a', '#3a7a6a', '#8a3a3a'][i % 3]));   // meja / alas terpal
        const y0 = r < 0.5 ? 0.6 : 0.03;
        for (let k = 0; k < 7; k++) { const q = hash(i * 9 + k, 72), u = -0.9 + k * 0.3, c = ['#3a3a3e', '#8a8a8e', '#a83a2a', '#d8c8a0', '#4a6a8a', '#2a2a2a', '#c8a040'][Math.floor(q * 7)];
          const kind = Math.floor(hash(i * 9 + k, 73) * 5);
          if (kind === 0) { mm.box(t, u, y0, -0.1, 0.26, 0.22, 0.2, C_('#2a2a2e')); mm.box(t, u, y0 + 0.04, 0.0, 0.2, 0.14, 0.01, C_('#4a6a7a')); }   // TV / radio
          else if (kind === 1) { mm.box(t, u, y0, 0.1, 0.24, 0.24, 0.07, C_('#1e1e1e')); }                                                       // ban bekas
          else if (kind === 2) for (let j = 0; j < 3; j++) mm.box(t, u, y0 + j * 0.05, -0.2 + j * 0.02, 0.2, 0.05, 0.14, C_(['#d84a3a', '#3a8ad8', '#e8c040'][j]));   // kaset & buku
          else if (kind === 3) mm.box(t, u, y0, 0.15, 0.12, 0.32, 0.12, C_(c));                                                                 // botol / setrika
          else { mm.box(t, u, y0, -0.1, 0.22, 0.12, 0.22, C_(c)); mm.box(t, u, y0 + 0.12, -0.1, 0.08, 0.1, 0.08, C_('#8a8a8a')); }              // panci, karburator
        }
        if (r > 0.7) { mm.box(t, 1.6, 0, -0.6, 0.7, 0.5, 0.7, C_('#7a6a5a')); mm.box(t, 1.55, 0.5, -0.6, 0.5, 0.3, 0.4, RUST); cl(t, 1.6, -0.6, 0.7, 0.7); }   // tumpukan rongsok
        cl(t, 0, r < 0.5 ? 0 : 0.1, 2.3, r < 0.5 ? 0.9 : 0.2); i++;
      }
      { let best = null; for (let k = 1; k < A.pts.length; k++) { const [x, z] = A.pts[k]; const d = M.roadDist(x, z); if (!best || d < best.d) best = { x, z, d }; }
        if (best) { const ccx = xs.reduce((a, b) => a + b, 0) / xs.length, ccz = zs.reduce((a, b) => a + b, 0) / zs.length, x = best.x + (ccx - best.x) * 0.1, z = best.z + (ccz - best.z) * 0.1, t = { x, z, a: Math.atan2(ccz - z, ccx - x) + Math.PI / 2 }, mm = ch.at(x, z);
          for (const sd of [-1, 1]) mm.box(t, sd * 1.1, 0, 0, 0.1, 2.0, 0.1, WOOD2); SB.sign(t, 0, 1.6, 0.04, 2.4, 0.52, SB.kinds.txt.loak, { back: true }); cl(t, -1.1, 0, 0.12, 0.12); cl(t, 1.1, 0, 0.12, 0.12);
          out.pois.push({ name: 'Pasar loak', x, z }); } }
    } }

  /* ---------------- pabrik es tua (27): beton kusam, atap gergaji berkarat, cerobong, mural Andra */
  if (S.pabrik) {
    const b = S.pabrik, xf = { x: b.x, z: b.y, a: b.a }, w = b.w, d = b.h, H = 3.6, m = ch.at(b.x, b.y), wall = C_('#b8b2a2');
    m.box(xf, 0, 0, 0, w, H, d, wall);
    for (let i = 0; i < 9; i++) { const r = hash(i, 41); m.box(xf, -w / 2 + r * w, 0.2 + hash(i, 42) * 2, d / 2 + 0.01, 0.4 + r, 0.5 + hash(i, 43), 0.02, shade(wall, 0.82)); }   // noda lembap
    for (let u = -w / 2 + 1; u < w / 2 - 0.5; u += 1.6) { m.box(xf, u, 1.6, d / 2 + 0.02, 0.8, 0.9, 0.02, C_('#1e2226')); m.box(xf, u - 0.2, 1.6, d / 2 + 0.03, 0.3, 0.9, 0.02, C_('#4a5a62')); }   // jendela pecah
    for (let k = 0; k < 4; k++) { const z0 = -d / 2 + k * d / 4, z1 = z0 + d / 4;   // atap gergaji
      m.poly2([P(xf, -w / 2 - 0.2, H, z1), P(xf, w / 2 + 0.2, H, z1), P(xf, w / 2 + 0.2, H + 0.9, z0), P(xf, -w / 2 - 0.2, H + 0.9, z0)], k % 2 ? RUST : C_('#8a5a3a'));
      m.poly2([P(xf, -w / 2, H, z0), P(xf, w / 2, H, z0), P(xf, w / 2, H + 0.9, z0), P(xf, -w / 2, H + 0.9, z0)], C_('#2a3238')); }
    { const t = at(xf, -w / 2 + 0.8, -d / 2 + 0.8); m.box(t, 0, 0, 0, 1.0, 7.5, 1.0, C_('#9a5a3a')); m.box(t, 0, 7.5, 0, 1.15, 0.3, 1.15, C_('#7a4a32')); for (let y = 0.5; y < 7.5; y += 1.2) m.box(t, 0, y, 0, 1.02, 0.08, 1.02, C_('#8a4a30')); }   // cerobong
    m.box(xf, 1.8, 0, d / 2 + 0.03, 2.6, 2.4, 0.06, RUST); for (let y = 0.15; y < 2.4; y += 0.2) m.box(xf, 1.8, y, d / 2 + 0.07, 2.6, 0.04, 0.02, C_('#7a4a2a'));   // rolling door
    m.box(xf, 1.8, 0, d / 2 + 0.9, 3.2, 0.45, 1.6, C_('#9a968c'));   // dok bongkar muat
    SB.sign(xf, -2.2, 2.75, d / 2 + 0.05, 3.2, 0.7, SB.kinds.txt.es);
    // mural Andra di dinding samping: bidang warna-warni (matahari, gunung, wajah)
    { const sd = 1, x = sd * (w / 2 + 0.02), mc = ['#e8782a', '#f6d84a', '#3a8ad8', '#d83a6a', '#3aa86a', '#7a4ab4'];
      m.box(xf, x, 0.3, 0, 0.02, 2.8, d - 0.8, C_('#2a3a5a'));
      for (let i = 0; i < 14; i++) { const r = hash(i, 47); m.box(xf, x + 0.01, 0.4 + hash(i, 48) * 2.3, -d / 2 + 0.6 + r * (d - 1.6), 0.02, 0.3 + hash(i, 49) * 0.6, 0.3 + r * 0.9, C_(mc[i % mc.length])); }
      m.box(xf, x + 0.02, 2.1, 0.8, 0.02, 0.6, 0.6, C_('#f6d84a')); }
    for (const [u, c] of [[-3.8, '#2a5a8a'], [-3.3, '#8a2a2a'], [4.4, '#3a6a3a']]) { const q = at(xf, u, d / 2 + 0.7); m.box(q, 0, 0, 0, 0.5, 0.8, 0.5, C_(c)); m.box(q, 0, 0.8, 0, 0.52, 0.04, 0.52, shade(C_(c), 0.8)); cl(q, 0, 0, 0.5, 0.5); }
    for (let i = 0; i < 8; i++) V('rumput', ...L(xf, -w / 2 + hash(i, 44) * w, d / 2 + 0.3 + hash(i, 45) * 0.5), { s: 1.4 });
    cl(xf, 0, 0, w, d); cl(xf, 1.8, d / 2 + 0.9, 3.2, 1.6);
    out.doors.push({ id: 'pabrik', name: 'Masuk pabrik es', ...pt(xf, -1, d / 2 + 0.5), h: xf.a + Math.PI / 2 }); out.pois.push({ name: 'Pabrik es tua', ...pt(xf, 0, d / 2 + 1.5) });
  }

  /* ---------------- terminal bus antarkota (28): kanopi panjang, loket, papan jadwal, bus parkir */
  if (S.terminal) {
    const b = S.terminal, xf = { x: b.x, z: b.y, a: b.a }, w = b.w, d = b.h, m = ch.at(b.x, b.y);
    m.box(xf, 0, 0, 0, w + 1, 0.2, d, C_('#b8b4a8')); m.box(xf, 0, 0.2, d / 2 - 0.1, w + 1, 0.02, 0.2, C_('#f6c81a'));
    m.box(xf, 0, 0.2, -d / 2 + 0.75, w, 2.4, 1.5, C_('#e8e2d0'));   // deretan loket
    const PO = ['#c83a3a', '#2a6ab4', '#3a8a4a', '#e8782a', '#7a4a9a'];
    for (let i = 0; i < 5; i++) { const u = -w / 2 + 1 + i * (w - 2) / 4; m.box(xf, u, 1.0, -d / 2 + 1.52, 1.4, 0.7, 0.04, C_('#2a3238')); m.box(xf, u, 1.85, -d / 2 + 1.53, 1.6, 0.4, 0.04, C_(PO[i])); m.box(xf, u, 0.2, -d / 2 + 1.55, 1.5, 0.8, 0.1, C_('#c8c0a8')); }
    for (let u = -w / 2; u <= w / 2 + 0.01; u += w / 4) m.box(xf, u, 0.2, d / 2 - 0.5, 0.22, 3.0, 0.22, C_('#d8d4ca'));
    m.box(xf, 0, 3.2, 0, w + 1.2, 0.2, d + 0.4, C_('#2a5a3a')); m.box(xf, 0, 3.1, 0, w + 1.0, 0.1, d + 0.2, C_('#e8e4d8'));
    SB.sign(xf, 0, 3.4, d / 2 + 0.21, 4.4, 0.85, SB.kinds.txt.terminal);
    for (const u of [-2.8, -0.4, 2.0]) { m.box(xf, u, 0.2, 0.4, 1.6, 0.4, 0.4, C_('#3a6ab4')); m.box(xf, u, 0.6, 0.25, 1.6, 0.35, 0.08, C_('#3a6ab4')); cl(xf, u, 0.4, 1.6, 0.4); }   // bangku tunggu
    { m.box(xf, w / 2 - 0.4, 1.6, -d / 2 + 1.53, 1.6, 0.9, 0.05, C_('#141414')); for (let k = 0; k < 4; k++) m.box(xf, w / 2 - 0.4, 1.7 + k * 0.18, -d / 2 + 1.56, 1.4, 0.06, 0.01, C_(k % 2 ? '#f6c81a' : '#e8782a')); }   // papan jadwal
    cl(xf, 0, -d / 2 + 0.75, w, 1.5); for (let u = -w / 2; u <= w / 2 + 0.01; u += w / 4) cl(xf, u, d / 2 - 0.5, 0.22, 0.22);
    // bus parkir di depan peron (miring sejajar)
    const BUS = ['#e8e8e4', '#2a6ab4', '#c83a3a'];
    for (let i = 0; i < 3; i++) { const q = at(xf, -w / 2 + 1.6 + i * 3.4, d / 2 + 2.6, -Math.PI / 2 + 0.35); if (M.roadDist(q.x, q.z) < 0.6) continue; bus(m, q, BUS[i], PO[i]); cl(q, 0, 0, 1.3, 4.3); }
    out.pois.push({ name: 'Terminal bus antarkota', ...pt(xf, 0, d / 2 + 0.6) });
  }

  /* ---------------- kolam pemancingan Pak Haji (29): dermaga kayu, saung, papan nama */
  { const A = area(70, 49);
    if (A) {
      const pts = A.pts, cx = 67, cz = 45;   // bagian danau yang lebar (ujung hilir); ujung hulu = kolam curug
      for (let i = 0; i < 7; i++) {   // dermaga di 7 arah: cari tepi kolam dengan menyusuri sinar dari tengah
        const ang = i / 7 * Math.PI * 2 + 0.25; let r = 0.5; while (r < 9 && inPoly(cx + Math.cos(ang) * r, cz + Math.sin(ang) * r, pts)) r += 0.1;
        if (r >= 9) continue;   // sinar ke arah sungai kecil menuju curug: tidak ada tepi dekat
        const nx = -Math.cos(ang), nz = -Math.sin(ang);
        {
          const ex = cx - nx * r, ez = cz - nz * r, t = { x: ex + nx * 0.3, z: ez + nz * 0.3, a: Math.atan2(nz, nx) }, mm = ch.at(t.x, t.z);
          mm.box(t, 0.3, -0.05, 0, 1.9, 0.1, 1.0, WOOD); for (let u = -0.6; u < 1.2; u += 0.25) mm.box(t, u, 0.05, 0, 0.02, 0.005, 1.0, WOOD2);
          for (const [u, v] of [[1.1, -0.45], [1.1, 0.45]]) mm.box(t, u, SURF - 0.3, v, 0.1, 0.4 - SURF, 0.1, WOOD2);
          mm.box(t, 0.4, 0.05, 0.38, 0.32, 0.3, 0.3, C_(i % 2 ? '#3a8ad8' : '#e84a3a'));   // kursi plastik
          mm.box(t, -0.2, 0.05, -0.35, 0.25, 0.22, 0.25, C_('#e8e4d8'));                     // ember
          const sx = ex + nx * 1.0, sz = ez + nz * 1.0;
          out.fish.push({ x: sx, z: sz, h: Math.atan2(nz, nx), name: 'Kolam Pak Haji', pond: true });
        }
      }
      // saung lesehan + papan nama + larangan berenang, diletakkan di sisi yang dekat jalan
      let best = null; for (let k = 0; k < pts.length; k++) { const [x, z] = pts[k], vx = x - cx, vz = z - cz, l = Math.hypot(vx, vz), qx = x + vx / l * 2.6, qz = z + vz / l * 2.6, d = M.roadDist(qx, qz); if (d > 1.6 && !M.waterAt(qx, qz) && (!best || d < best.d)) best = { x: qx, z: qz, d, a: Math.atan2(vz, vx) }; }
      if (best) { const t = { x: best.x, z: best.z, a: best.a + Math.PI / 2 }, mm = ch.at(t.x, t.z);
        mm.box(t, 0, 0, 0, 2.4, 0.45, 2.0, WOOD); for (const [u, v] of [[-1.1, -0.9], [1.1, -0.9], [-1.1, 0.9], [1.1, 0.9]]) mm.box(t, u, 0, v, 0.12, 2.2, 0.12, WOOD2);
        mm.gable(t, 0, 2.2, 0, 2.8, 2.4, 0.9, C_('#8a7a4a'), 0.2); mm.box(t, 0.4, 0.45, 0.2, 0.7, 0.04, 0.5, C_('#c8b88a'));
        cl(t, 0, 0, 2.4, 2.0); const s2 = at(t, 2.0, -1.0); mm.box(s2, 0, 0, 0, 0.1, 1.2, 0.1, WOOD2); SB.sign(s2, 0, 1.1, 0.06, 1.6, 0.42, SB.kinds.txt.pancing, { back: true }); C.circle(s2.x, s2.z, 0.08);
        out.pois.push({ name: 'Kolam pemancingan Pak Haji', x: t.x, z: t.z }); }
    } }

  /* ---------------- Jembatan Timur (30): rangka baja melengkung + papan peresmian di kedua ujung jembatan */
  { let road = null, idx = [];
    for (const r of K.roads) { if (r.kind !== 'jalan' && r.kind !== 'raya') continue; const near = r.pts.some(p => Math.hypot(p[0] - 182, p[1] - 136) < 9); if (near) { road = r; break; } }
    if (road) {
      const Pp = []; for (let i = 1; i < road.pts.length; i++) { const [x0, z0] = road.pts[i - 1], [x1, z1] = road.pts[i], l = Math.hypot(x1 - x0, z1 - z0); for (let s = 0; s < l; s += 0.25) Pp.push({ x: x0 + (x1 - x0) * s / l, z: z0 + (z1 - z0) * s / l, a: Math.atan2(z1 - z0, x1 - x0) }); }
      idx = Pp.map((p, i) => M.waterAt(p.x, p.z) && Math.hypot(p.x - 182, p.z - 136) < 10 ? i : -1).filter(i => i >= 0);
      if (idx.length > 2) {
        const i0 = Math.max(0, idx[0] - 3), i1 = Math.min(Pp.length - 1, idx.at(-1) + 3), A = Pp[i0], B = Pp[i1], span = Math.hypot(B.x - A.x, B.z - A.z), mid = { x: (A.x + B.x) / 2, z: (A.z + B.z) / 2, a: Math.atan2(B.z - A.z, B.x - A.x) };
        const mm = thin.at(mid.x, mid.z), hw = road.w / 2 + 0.25, N = 12;
        for (const sd of [-1, 1]) {
          let prev = null;
          for (let k = 0; k <= N; k++) { const u = -span / 2 + span * k / N, y = 0.8 + Math.sin(k / N * Math.PI) * 2.6, p = P(mid, u, y, sd * hw); if (prev) { const lx = (u + prev[0]) / 2, ly = (y + prev[1]) / 2, l = Math.hypot(u - prev[0], y - prev[1]); mm.box({ ...mid }, lx, ly - 0.08, sd * hw, l + 0.05, 0.16, 0.16, C_('#d84a2a')); } prev = [u, y];
            if (k % 2 === 0) mm.box(mid, u, 0.5, sd * hw, 0.08, y - 0.5, 0.08, C_('#c83a2a')); }
        }
        for (let k = 2; k <= N - 2; k += 2) { const u = -span / 2 + span * k / N, y = 0.8 + Math.sin(k / N * Math.PI) * 2.6; if (y > 2.6) mm.box(mid, u, y, 0, 0.12, 0.12, hw * 2, C_('#c83a2a')); }
        for (const [E, f] of [[A, -1], [B, 1]]) { const q = at({ ...mid, x: E.x, z: E.z }, f * 0.6, hw + 0.7), mq = ch.at(q.x, q.z); mq.box(q, 0, 0, 0, 0.5, 1.5, 0.4, C_('#8a8680')); SB.sign({ ...q, a: q.a - f * Math.PI / 2 }, 0, 0.9, 0.26, 1.4, 0.4, SB.kinds.txt.jembatan, { back: true }); C.circle(q.x, q.z, 0.3); }
        out.pois.push({ name: 'Jembatan Timur', x: mid.x, z: mid.z });
      }
    } }

  /* ---------------- rakit penyeberangan (31): rakit bambu di kali, tali penyeberangan, dermaga */
  { let best = null;
    for (const r of K.rivers) for (let i = 1; i < r.pts.length; i++) { const [x0, z0] = r.pts[i - 1], [x1, z1] = r.pts[i], dx = x1 - x0, dz = z1 - z0, l2 = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((21 - x0) * dx + (128 - z0) * dz) / l2)), x = x0 + dx * t, z = z0 + dz * t, d = Math.hypot(x - 21, z - 128); if (!best || d < best.d) best = { d, x, z, a: Math.atan2(dz, dx), w: r.w }; }
    if (best) {
      const xf = { x: best.x, z: best.z, a: best.a }, hw = best.w / 2, m = ch.at(xf.x, xf.z);
      // rakit: lantai bambu + pagar + galah, mengambang di tengah
      const rf = at(xf, 0, -0.6);
      for (let k = 0; k < 9; k++) m.box(rf, -1.1 + k * 0.275, SURF - 0.05, 0, 0.26, 0.14, 1.5, k % 2 ? BAMBU : C_('#b8a050'));
      for (const sd of [-1, 1]) { m.box(rf, 0, SURF + 0.09, sd * 0.7, 2.4, 0.05, 0.05, BAMBU); for (const u of [-1.1, 0, 1.1]) m.box(rf, u, SURF + 0.09, sd * 0.7, 0.05, 0.55, 0.05, BAMBU); m.box(rf, 0, SURF + 0.6, sd * 0.7, 2.4, 0.04, 0.04, BAMBU); }
      m.box({ ...rf, a: rf.a + 0.3 }, 0.6, SURF + 0.09, 0.2, 0.04, 2.2, 0.04, C_('#a89048'));
      // tali melintang kali + tiang di kedua tepi
      const A = at(xf, 0.9, -(hw + 0.9)), B = at(xf, 0.9, hw + 0.9), mm = thin.at(xf.x, xf.z);
      for (const E of [A, B]) { ch.at(E.x, E.z).box(E, 0, 0, 0, 0.18, 1.6, 0.18, WOOD2); C.circle(E.x, E.z, 0.12); }
      { const mid = { x: (A.x + B.x) / 2, z: (A.z + B.z) / 2, a: xf.a + Math.PI / 2 }; mm.box(mid, 0, 1.25, 0, Math.hypot(B.x - A.x, B.z - A.z), 0.03, 0.03, C_('#c8b88a')); }
      // dermaga kecil di sisi tanah lapang (area 22) + papan tarif
      const side = (() => { const p1 = at(xf, 0, -(hw + 1.5)), p2 = at(xf, 0, hw + 1.5); return Math.hypot(p1.x - 21, p1.z - 122) < Math.hypot(p2.x - 21, p2.z - 122) ? -1 : 1; })();
      for (const sd of [-1, 1]) { const q = at(xf, -0.6, sd * (hw + 0.2)); ch.at(q.x, q.z).box(q, 0, -0.1, 0, 1.4, 0.12, 1.2, WOOD); for (const u of [-0.6, 0.6]) ch.at(q.x, q.z).box(q, u, BED, -sd * 0.5, 0.1, -BED, 0.1, WOOD2); }
      { const q = at(xf, 1.6, side * (hw + 1.5)); m.box(q, 0, 0, 0, 0.1, 1.2, 0.1, WOOD2); SB.sign({ ...q, a: q.a + (side > 0 ? Math.PI : 0) }, 0, 1.1, 0.06, 1.4, 0.4, SB.kinds.txt.rakit, { back: true }); C.circle(q.x, q.z, 0.08); }
      const e1 = pt(xf, -0.6, -(hw + 1.2)), e2 = pt(xf, -0.6, hw + 1.2);
      out.raft = { a: e1, b: e2, name: 'Naik rakit (2rb)' }; out.pois.push({ name: 'Rakit penyeberangan', ...e1 });
    } }

  /* ---------------- kandang sapi nenek Andra (32): kandang kayu beratap seng, palungan, jerami, gubuk sawah, orang-orangan */
  if (S.kandang) {
    const b = S.kandang, xf = { x: b.x, z: b.y, a: b.a }, w = b.w, d = b.h, m = ch.at(b.x, b.y);
    m.box(xf, 0, 0, 0, w, 0.12, d, C_('#8a7a5a'));
    for (const u of [-w / 2, -w / 6, w / 6, w / 2]) for (const v of [-d / 2, d / 2]) m.box(xf, u, 0, v, 0.16, 2.2, 0.16, WOOD2);
    m.poly2([P(xf, -w / 2 - 0.3, 2.6, -d / 2 - 0.4), P(xf, w / 2 + 0.3, 2.6, -d / 2 - 0.4), P(xf, w / 2 + 0.3, 2.0, d / 2 + 0.5), P(xf, -w / 2 - 0.3, 2.0, d / 2 + 0.5)], TIN);
    m.box(xf, 0, 0, -d / 2 + 0.05, w, 1.4, 0.08, WOOD);   // dinding belakang
    for (const v of [0.4, 0.9]) m.box(xf, 0, v, d / 2, w, 0.1, 0.08, WOOD);   // palang depan
    for (const sd of [-1, 1]) for (const v of [0.4, 0.9]) m.box(xf, sd * w / 2, v, 0, 0.08, 0.1, d, WOOD);
    m.box(xf, 0, 0.12, -d / 2 + 0.45, w - 0.4, 0.35, 0.5, C_('#7a6a5a')); m.box(xf, 0, 0.47, -d / 2 + 0.45, w - 0.5, 0.03, 0.4, C_('#8aa040'));   // palungan + rumput
    for (let i = 0; i < 3; i++) { const q = at(xf, w / 2 + 0.9, -0.9 + i * 0.85); m.box(q, 0, 0, 0, 0.8, 0.5, 0.6, C_('#d8b860')); m.box(q, 0, 0.5, 0, 0.8, 0.02, 0.62, C_('#c8a850')); cl(q, 0, 0, 0.8, 0.6); }   // jerami
    cl(xf, 0, -d / 2 + 0.05, w, 0.2); for (const sd of [-1, 1]) cl(xf, sd * w / 2, 0, 0.2, d); cl(xf, -w / 4 - 0.4, d / 2, w / 2 - 0.8, 0.2); cl(xf, w / 4 + 0.4, d / 2, w / 2 - 0.8, 0.2);
    for (let i = 0; i < 3; i++) out.cows.push({ ...pt(xf, -w / 2 + 1 + i * (w - 2) / 2, 0.2), h: xf.a + Math.PI / 2 * (i % 2 ? 1 : -1), pen: { xf, w: w - 0.6, d: d - 0.6 } });
    // gubuk sawah (panggung bambu beratap ilalang) + orang-orangan sawah
    { const q = at(xf, -w / 2 - 4, 3.5, 0.3), mm = ch.at(q.x, q.z);
      for (const [u, v] of [[-0.9, -0.8], [0.9, -0.8], [-0.9, 0.8], [0.9, 0.8]]) mm.box(q, u, 0, v, 0.12, 2.3, 0.12, BAMBU);
      mm.box(q, 0, 0.7, 0, 2.0, 0.1, 1.8, C_('#b8a050')); mm.gable(q, 0, 2.3, 0, 2.4, 2.2, 1.0, C_('#b89a5a'), 0.3); mm.box(q, 0, 0.8, -0.85, 2.0, 0.4, 0.05, BAMBU);
      for (const [u, v] of [[-0.9, -0.8], [0.9, -0.8], [-0.9, 0.8], [0.9, 0.8]]) cl(q, u, v, 0.14, 0.14);
      out.pois.push({ name: 'Gubuk sawah', x: q.x, z: q.z }); }
    { const q = at(xf, w / 2 + 5, 4.5), mm = thin.at(q.x, q.z);
      mm.box(q, 0, 0, 0, 0.08, 1.7, 0.08, WOOD2); mm.box(q, 0, 1.2, 0, 1.2, 0.08, 0.08, WOOD2); mm.box(q, 0, 0.8, 0, 0.5, 0.6, 0.25, C_('#3a6ab4'));
      mm.box(q, 0, 1.45, 0, 0.3, 0.3, 0.3, C_('#d8c8a0')); mm.box(q, 0, 1.72, 0, 0.6, 0.06, 0.6, C_('#c8a850')); mm.box(q, 0, 1.78, 0, 0.3, 0.18, 0.3, C_('#c8a850'));
      for (const sd of [-0.55, 0.55]) mm.box(q, sd, 1.05, 0, 0.12, 0.25, 0.04, C_('#e84a3a')); C.circle(q.x, q.z, 0.08); }
    { const q = at(xf, 0, d / 2 + 1.6); m.box(q, 0, 0, 0, 0.1, 1.2, 0.1, WOOD2); SB.sign(q, 0, 1.1, 0.06, 1.6, 0.42, SB.kinds.txt.kandang, { back: true }); C.circle(q.x, q.z, 0.08); }
    out.pois.push({ name: 'Kandang sapi', ...pt(xf, 0, d / 2 + 1) });
  }

  // lapangan olahraga yang bisa dimainkan (dipakai sports.js): lapangan bola kampung & lapangan basket umum
  out.courts.push({ kind: 'bola', x: 88, z: 104, a: 0, w: 11.2, d: 6.4, goal: 2.4 });
  out.courts.push({ kind: 'basket', x: 127, z: 46, a: 0, w: 7.4, d: 6, hoops: [[123.55, 46], [130.45, 46]] });

  if (wet.n) { const mesh = new THREE.Mesh(wet.build(), waterMat()); mesh.renderOrder = 2; out.wetMesh = mesh; }
  return out;

  function pt(xf, lx, lz) { const [x, z] = L(xf, lx, lz); return { x, z }; }
}

// bus antarkota: badan panjang, kaca gelap, garis warna PO, papan tujuan
export function bus(m, xf, c, stripe) {
  const B = col(c), S2 = col(stripe), W = 1.3, Lg = 4.2;
  for (const [u, v] of [[-0.55, 1.4], [0.55, 1.4], [-0.55, -1.3], [0.55, -1.3], [-0.55, -0.85], [0.55, -0.85]]) m.box(xf, u, 0, v, 0.18, 0.36, 0.38, col('#1e1e1e'));
  m.box(xf, 0, 0.2, 0, W, 1.4, Lg, B, { top: col('#d8d8d4') });
  m.box(xf, 0, 0.85, 0, W + 0.02, 0.5, Lg - 0.9, col('#2a3a4a'));
  m.box(xf, 0, 0.7, Lg / 2 - 0.02, W - 0.1, 0.65, 0.04, col('#3a4a5a'));
  m.box(xf, 0, 0.45, 0, W + 0.03, 0.14, Lg - 0.2, S2); m.box(xf, 0, 1.4, Lg / 2 + 0.01, 0.9, 0.16, 0.02, col('#f6a81a'));
  for (const sd of [-0.45, 0.45]) m.box(xf, sd, 0.32, Lg / 2 + 0.01, 0.22, 0.1, 0.02, col('#fff6c0'));
  m.box(xf, 0, 1.6, -0.6, 0.8, 0.12, 1.2, col('#b8b8b4'));   // AC atap
}
