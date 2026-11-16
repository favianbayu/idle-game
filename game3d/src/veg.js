// Tanaman & benda kecil berulang: satu template (Merger, warna per-vertex) -> InstancedMesh.
// Satu jenis = satu draw call, berapa pun jumlahnya.
import * as THREE from 'three';
import { Merger, col, shade } from './geom.js';

const O = { x: 0, z: 0, a: 0 };
const T = {};
const R = (i, k = 0) => { let h = (i * 374761393 + k * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
// bentuk dasar (dibuat sekali)
const ICO1 = new THREE.IcosahedronGeometry(1, 1), ICO0 = new THREE.IcosahedronGeometry(1, 0);
const CYL6 = (rt, rb) => new THREE.CylinderGeometry(rt, rb, 1, 6, 1).translate(0, 0.5, 0);
const CONE7 = new THREE.ConeGeometry(1, 1, 7, 1).translate(0, 0.5, 0);
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
// warna daun: gelap di bawah/dalam, terang di atas yang kena matahari, sedikit acak per segitiga
const leafCol = (lo, hi, y0, y1, seed = 1) => (x, y, z, nx, ny) => {
  const t = Math.max(0, Math.min(1, (y - y0) / (y1 - y0) * 0.7 + ny * 0.35)), r = R(Math.round(x * 97 + seed), Math.round(z * 89 + y * 53));
  return shade(mixc(lo, hi, t), 0.9 + r * 0.2);
};
// batang melengkung dari ruas silinder
function trunk(m, pts, r0, r1, c) {
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay, az] = pts[i - 1], [bx, by, bz] = pts[i], dx = bx - ax, dy = by - ay, dz = bz - az, l = Math.hypot(dx, dy, dz);
    const t0 = (i - 1) / (pts.length - 1), t1 = i / (pts.length - 1), rb = r0 + (r1 - r0) * t0, rt = r0 + (r1 - r0) * t1;
    const geo = CYL6(rt / rb, 1);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx / l, dy / l, dz / l)), e = new THREE.Euler().setFromQuaternion(q, 'YXZ');
    m.addGeo(geo, { x: ax, y: ay, z: az, rx: e.x, ry: e.y, rz: e.z, sx: rb, sy: l * 1.04, sz: rb }, (x, y, z, nx, ny, nz) => shade(c, 0.82 + 0.18 * Math.max(0, nx * 0.6 + nz * 0.4) + R(Math.round(y * 40), i) * 0.08));
  }
}
// daun panjang melengkung (pelepah kelapa, pisang, helai rumput): pita yang menekuk ke bawah, dua sisi
function frond(m, base, ang, len, w, droop, c, segs = 4, o = {}) {
  const ca = Math.cos(ang), sa = Math.sin(ang), rise = o.rise ?? 0.35;
  const P = t => { const d = len * t; return [base[0] + ca * d, base[1] + rise * len * t - droop * t * t * len, base[2] + sa * d]; };
  for (let i = 0; i < segs; i++) {
    const t0 = i / segs, t1 = (i + 1) / segs, a = P(t0), b = P(t1), w0 = w * (o.taper ? 1 - t0 * 0.8 : Math.sin(Math.PI * (0.15 + t0 * 0.7))), w1 = w * (o.taper ? 1 - t1 * 0.8 : Math.sin(Math.PI * (0.15 + t1 * 0.7)));
    const px = -sa, pz = ca, fold = o.fold ?? 0.25;   // lebar tegak lurus arah daun, sedikit melipat (bentuk V)
    const L0 = [a[0] + px * w0, a[1] - fold * w0, a[2] + pz * w0], R0 = [a[0] - px * w0, a[1] - fold * w0, a[2] - pz * w0];
    const L1 = [b[0] + px * w1, b[1] - fold * w1, b[2] + pz * w1], R1 = [b[0] - px * w1, b[1] - fold * w1, b[2] - pz * w1];
    const cc = shade(c, 0.85 + 0.25 * t0);
    m.poly2([L0, a, b, L1], shade(cc, 1.05)); m.poly2([a, R0, R1, b], cc);
  }
}
// gumpalan daun: bola low-poly bergelombang
const blob = (m, x, y, z, rx, ry, rz, lo, hi, seed, fine = true) => m.addGeo(fine ? ICO1 : ICO0, { x, y, z, sx: rx, sy: ry, sz: rz, ry: seed }, leafCol(lo, hi, y - ry, y + ry, seed), { noise: 0.22, seed });
const BARK = col('#6e5034'), BARK2 = col('#5a4028');

// pohon bulat (mangga/angsana): batang melengkung bercabang + tajuk dari 5 gumpalan
T.bulat = m => {
  const lo = col('#2f6a32'), hi = col('#7ab85e');
  trunk(m, [[0, 0, 0], [0.05, 0.7, 0], [-0.05, 1.3, 0.05]], 0.2, 0.12, BARK);
  trunk(m, [[0, 0.9, 0], [0.45, 1.45, 0.15]], 0.08, 0.04, BARK); trunk(m, [[0, 1.0, 0], [-0.4, 1.5, -0.25]], 0.08, 0.04, BARK);
  blob(m, 0, 1.95, 0, 1.15, 0.75, 1.1, lo, hi, 1);
  blob(m, 0.6, 1.8, 0.35, 0.65, 0.5, 0.6, lo, hi, 2); blob(m, -0.6, 1.85, -0.3, 0.7, 0.5, 0.65, lo, hi, 3);
  blob(m, -0.2, 2.45, 0.35, 0.6, 0.45, 0.6, lo, hi, 4); blob(m, 0.25, 2.5, -0.3, 0.55, 0.42, 0.55, lo, hi, 5, false);
};
// ketapang: tajuk bertingkat mendatar
T.ketapang = m => {
  const lo = col('#2c6630'), hi = col('#78b45a');
  trunk(m, [[0, 0, 0], [0, 1.5, 0], [0.04, 3.0, 0]], 0.17, 0.08, BARK);
  [[1.3, 1.35], [1.95, 1.05], [2.55, 0.75], [3.05, 0.45]].forEach(([y, r], i) => {
    for (let k = 0; k < 3; k++) { const a = k * 2.1 + i; trunk(m, [[0, y - 0.1, 0], [Math.cos(a) * r * 0.75, y, Math.sin(a) * r * 0.75]], 0.05, 0.03, BARK); }
    blob(m, 0, y + 0.08, 0, r, 0.2, r, lo, hi, 10 + i, r > 0.7);
  });
};
// pinus / cemara: kerucut bertumpuk yang sedikit miring
T.cemara = m => {
  const lo = col('#1f4a2c'), hi = col('#4a8650');
  trunk(m, [[0, 0, 0], [0, 1.2, 0]], 0.13, 0.09, col('#5a4230'));
  [[0.6, 0.95, 1.1], [1.25, 0.78, 1.0], [1.85, 0.6, 0.9], [2.4, 0.42, 0.8], [2.9, 0.25, 0.7]].forEach(([y, r, h], i) =>
    m.addGeo(CONE7, { y, sx: r, sy: h, sz: r, ry: i * 0.7, rz: (R(i, 3) - 0.5) * 0.08 }, leafCol(lo, hi, y, y + h, i), { noise: 0.06, seed: i }));
};
// pisang: batang semu + daun lebar melengkung
T.pisang = m => {
  trunk(m, [[0, 0, 0], [0, 0.8, 0], [0.03, 1.45, 0]], 0.14, 0.1, col('#7a8a4a'));
  for (let i = 0; i < 6; i++) frond(m, [0, 1.35 + (i % 2) * 0.12, 0], i * 1.05 + 0.3, 1.25, 0.24, 0.9, i % 3 ? col('#5aa040') : col('#6ab448'), 5, { rise: 0.55 });
  frond(m, [0, 1.5, 0], 2.0, 0.6, 0.12, 0.2, col('#8ac858'), 3, { rise: 1.4 });   // daun muda menggulung ke atas
};
// kelapa: batang melengkung + 8 pelepah menjuntai + buah
T.kelapa = m => {
  const tp = [[0, 0, 0], [0.12, 1.2, 0], [0.35, 2.3, 0], [0.62, 3.3, 0]];
  trunk(m, tp, 0.15, 0.1, col('#8a7454'));
  const top = [0.62, 3.35, 0];
  for (let i = 0; i < 8; i++) frond(m, top, i * Math.PI / 4 + 0.2, 1.5, 0.2, 1.2, i % 2 ? col('#4f9040') : col('#5aa048'), 5, { taper: true, fold: 0.15 });
  for (let i = 0; i < 3; i++) m.addGeo(ICO0, { x: top[0] + Math.cos(i * 2.1) * 0.15, y: top[1] - 0.2, z: Math.sin(i * 2.1) * 0.15, s: 0.11 }, col('#6a7a2a'));
};
// bambu: rumpun batang melengkung keluar + semburan daun tipis
T.bambu = m => {
  for (let i = 0; i < 7; i++) {
    const a = i * 0.9, lean = 0.25 + (i % 3) * 0.12, h = 2.6 + (i % 3) * 0.5, x0 = Math.cos(a) * 0.18, z0 = Math.sin(a) * 0.18;
    const pts = [[x0, 0, z0], [x0 + Math.cos(a) * lean * 0.3, h * 0.45, z0 + Math.sin(a) * lean * 0.3], [x0 + Math.cos(a) * lean * 1.1, h * 0.85, z0 + Math.sin(a) * lean * 1.1], [x0 + Math.cos(a) * lean * 2.0, h, z0 + Math.sin(a) * lean * 2.0]];
    trunk(m, pts, 0.05, 0.035, col(i % 2 ? '#8aa848' : '#7a9a40'));
    for (let k = 1; k < 4; k++) { const p = pts[k]; for (let j = 0; j < 3; j++) frond(m, p, a + (j - 1) * 0.9, 0.45, 0.05, 0.25, col(j % 2 ? '#6aa046' : '#7ab456'), 2, { taper: true, rise: 0.1 }); }
  }
};
T.semak = m => {
  const lo = col('#2f6a34'), hi = col('#78b464');
  blob(m, 0, 0.3, 0, 0.5, 0.33, 0.45, lo, hi, 31); blob(m, 0.28, 0.42, 0.12, 0.3, 0.25, 0.3, lo, hi, 32, false); blob(m, -0.25, 0.38, -0.1, 0.3, 0.22, 0.3, lo, hi, 33, false);
};
T.pagarHidup = m => {   // skala x = panjang: badan membulat dari 3 gumpalan
  const lo = col('#2f6a34'), hi = col('#64a456');
  for (let i = 0; i < 3; i++) blob(m, -0.33 + i * 0.33, 0.32, 0, 0.26, 0.32, 0.25, lo, hi, 40 + i, false);
  m.box(O, 0, 0, 0, 0.95, 0.5, 0.36, lo, { top: hi });
};
// kamboja (pohon makam): batang abu-abu bercabang menggarpu, rumpun daun di ujung, bunga putih-kuning
T.kamboja = m => {
  const bark = col('#8a8478'), lo = col('#3a7a3a'), hi = col('#6aa84e');
  trunk(m, [[0, 0, 0], [0.05, 0.7, 0], [0, 1.0, 0]], 0.13, 0.1, bark);
  for (let i = 0; i < 4; i++) { const a = i * 1.6 + 0.3, x = Math.cos(a) * 0.6, z = Math.sin(a) * 0.6, y = 1.6 + (i % 2) * 0.25;
    trunk(m, [[0, 0.95, 0], [x * 0.5, 1.3, z * 0.5], [x, y, z]], 0.08, 0.05, bark);
    blob(m, x, y + 0.12, z, 0.42, 0.22, 0.42, lo, hi, 70 + i, false);
    for (let k = 0; k < 4; k++) { const b = k * 1.57 + i, r = 0.28; m.addGeo(ICO0, { x: x + Math.cos(b) * r, y: y + 0.28, z: z + Math.sin(b) * r, s: 0.06 }, col('#f8f6ee')); m.addGeo(ICO0, { x: x + Math.cos(b) * r, y: y + 0.32, z: z + Math.sin(b) * r, s: 0.025 }, col('#f6d040')); } }
};
// bunga: helai daun + kuntum low-poly; 'bunga:#warna' memberi warna kuntum
const flower = (m, pc) => {
  for (let i = 0; i < 6; i++) frond(m, [0, 0.02, 0], i * 1.05, 0.22, 0.05, 0.1, i % 2 ? col('#4a8a44') : col('#5c9e50'), 2, { rise: 0.9, taper: true });
  for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4, r = 0.08 + (i % 2) * 0.05, x = Math.cos(a) * r, z = Math.sin(a) * r, y = 0.18 + (i % 3) * 0.06;
    trunk(m, [[x * 0.4, 0, z * 0.4], [x, y, z]], 0.012, 0.01, col('#4a8a3a'));
    m.addGeo(ICO0, { x, y: y + 0.02, z, sx: 0.07, sy: 0.04, sz: 0.07, ry: i }, pc); m.addGeo(ICO0, { x, y: y + 0.05, z, s: 0.025 }, col('#f8e060')); }
};
T.bunga = m => flower(m, col('#f06080'));
T.pot = m => {
  const tc = col('#b0603a');
  m.addGeo(CYL6(1.25, 1), { sx: 0.13, sy: 0.25, sz: 0.13 }, tc); m.addGeo(CYL6(1, 1), { y: 0.23, sx: 0.17, sy: 0.05, sz: 0.17 }, shade(tc, 1.12));
  for (let i = 0; i < 6; i++) frond(m, [0, 0.27, 0], i * 1.05, 0.28, 0.06, 0.18, i % 2 ? col('#4f9a48') : col('#62ac56'), 2, { rise: 0.9 });
  m.addGeo(ICO0, { y: 0.5, s: 0.07 }, col('#f05a6a'));
};
T.rumput = m => {   // rumpun helai tipis melengkung (dua sisi)
  for (let i = 0; i < 7; i++) frond(m, [(R(51, i) - 0.5) * 0.08, 0, (R(52, i) - 0.5) * 0.08], i * 0.9, 0.16 + R(53, i) * 0.12, 0.022, 0.12, i % 2 ? col('#6a9a4a') : col('#86b65a'), 2, { rise: 1.6, taper: true, fold: 0 });
};
T.padi = m => {
  for (let i = 0; i < 6; i++) frond(m, [0, 0, 0], i * 1.05, 0.3, 0.025, 0.12, i % 2 ? col('#7ab83a') : col('#8ac84a'), 2, { rise: 1.5, taper: true, fold: 0 });
  frond(m, [0, 0.35, 0], 0.5, 0.18, 0.03, 0.15, col('#d8c860'), 2, { rise: 0.3, taper: true });
};
T.teh = m => { const lo = col('#2f6a34'), hi = col('#58a84e'); for (let i = 0; i < 3; i++) blob(m, -0.33 + i * 0.33, 0.3, 0, 0.26, 0.28, 0.38, lo, hi, 60 + i, false); };
T.batu = m => { m.addGeo(ICO0, { y: 0.1, sx: 0.28, sy: 0.15, sz: 0.22 }, (x, y, z, nx, ny) => shade(col('#a8a498'), 0.8 + ny * 0.25), { noise: 0.08 }); m.addGeo(ICO0, { x: 0.2, y: 0.05, z: 0.12, s: 0.08 }, col('#8a867c')); };

const GEO = {};
function geo(kind) {
  if (!GEO[kind]) { const m = new Merger(); if (kind.startsWith('bunga:')) flower(m, col(kind.slice(6))); else T[kind](m); GEO[kind] = m.build(); }
  return GEO[kind];
}
export const SMALL = [];
export const WIND = { value: 0 };
// angin: puncak tanaman bergoyang pelan, fase dari posisi instance (tanpa biaya CPU)
const MAT = new THREE.MeshLambertMaterial({ vertexColors: true });
MAT.onBeforeCompile = sh => {
  sh.uniforms.uWind = WIND;
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uWind;').replace('#include <begin_vertex>', `#include <begin_vertex>
    #ifdef USE_INSTANCING
      vec3 ip = instanceMatrix[3].xyz;
      float sw = max(0.0, position.y - 0.25);
      float ph = uWind * 1.7 + ip.x * 0.37 + ip.z * 0.23;
      transformed.x += sin(ph) * 0.035 * sw + sin(ph * 2.3 + position.y * 3.0) * 0.012 * sw;
      transformed.z += cos(ph * 0.8) * 0.025 * sw;
    #endif`);
};
MAT.customProgramCacheKey = () => 'vegwind';

// list: [{ k: jenis, x, z, s (skala), a (sudut), sx (skala panjang), c ('#warna' tint) }]
export function plant(scene, list) {
  // dikelompokkan per jenis DAN per potongan 48 petak, supaya frustum culling membuang yang di luar layar
  const by = {}, CH = 48;
  for (const p of list) { if (p.k === 'bunga' && p.c) { p.k = 'bunga:' + p.c; p.c = null; } if (p.k === 'pot') p.c = null; const key = p.k + '|' + Math.floor(p.x / CH) + ',' + Math.floor(p.z / CH); (by[key] || (by[key] = [])).push(p); }
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), C = new THREE.Color(), V = new THREE.Vector3(), S = new THREE.Vector3();
  const out = [];
  for (const k in by) {
    const arr = by[k], kind = k.split('|')[0], im = new THREE.InstancedMesh(geo(kind), MAT, arr.length);
    arr.forEach((p, i) => {
      e.set(0, -(p.a || 0), 0); q.setFromEuler(e);
      const s = p.s || 1; S.set(s * (p.sx || 1), s * (p.sy || 1), s);
      M.compose(V.set(p.x, p.y || 0, p.z), q, S); im.setMatrixAt(i, M);
      im.setColorAt(i, p.c ? C.set(p.c) : C.setRGB(1, 1, 1));
    });
    const base = kind.split(':')[0], small = ['rumput', 'padi', 'bunga', 'batu', 'pot'].includes(base);
    im.userData.small = ['rumput', 'padi', 'bunga'].includes(base);   // disembunyikan pada kualitas Rendah
    im.castShadow = !small; im.receiveShadow = true;
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.computeBoundingSphere();
    scene.add(im); out.push(im); if (im.userData.small) SMALL.push(im);
  }
  return out;
}
