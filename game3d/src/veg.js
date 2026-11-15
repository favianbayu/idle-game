// Tanaman & benda kecil berulang: satu template (Merger, warna per-vertex) -> InstancedMesh.
// Satu jenis = satu draw call, berapa pun jumlahnya.
import * as THREE from 'three';
import { Merger, col, shade } from './geom.js';

const O = { x: 0, z: 0, a: 0 };
const T = {};
// pseudo-acak tetap untuk template
const R = (i, k = 0) => { let h = (i * 374761393 + k * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
// gumpalan daun: inti + kubus kecil menonjol di permukaan, warna bervariasi (gelap di bawah, terang di atas)
function leafBlob(m, cx, cy, cz, rx, ry, rz, pal, seed, n = 9) {
  m.box(O, cx, cy - ry, cz, rx * 2, ry * 2, rz * 2, pal[0], { top: pal[1], bottom: true });
  m.box(O, cx, cy - ry * 0.6, cz, rx * 2.15, ry * 1.2, rz * 1.7, pal[1], { top: pal[2] });
  for (let i = 0; i < n; i++) {
    const a = R(seed, i) * Math.PI * 2, e = R(seed, i + 40) * 1.2 - 0.3, sz = 0.18 + R(seed, i + 80) * 0.22;
    const x = cx + Math.cos(a) * rx * Math.cos(e), z = cz + Math.sin(a) * rz * Math.cos(e), y = cy + Math.sin(e) * ry;
    m.box(O, x, y - sz / 2, z, sz, sz, sz, pal[1 + (i % 3 === 0 ? 1 : 0) + (e > 0.5 ? 1 : 0)] || pal[3], { top: pal[3] || pal[2] });
  }
}
const BARK = col('#6e5034'), BARK2 = col('#5a4028');
// pohon bulat (mangga/angsana): batang bercabang + 4 gumpalan daun
T.bulat = m => {
  const pal = [col('#3f7a3a'), col('#4f8a46'), col('#5f9c52'), col('#72b05e')];
  m.box(O, 0, 0, 0, 0.36, 1.2, 0.36, BARK, { top: BARK2 }); m.box(O, 0, 0, 0, 0.5, 0.12, 0.5, BARK2);   // akar
  m.box(O, 0.28, 0.85, 0.05, 0.6, 0.12, 0.13, BARK); m.box(O, -0.22, 1.0, -0.12, 0.5, 0.12, 0.12, BARK); m.box(O, 0, 1.15, 0, 0.24, 0.5, 0.24, BARK);
  leafBlob(m, 0, 1.75, 0, 1.0, 0.5, 1.0, pal, 1, 10);
  leafBlob(m, -0.55, 2.05, 0.4, 0.62, 0.42, 0.6, pal, 2, 6);
  leafBlob(m, 0.6, 2.15, -0.35, 0.6, 0.45, 0.62, pal, 3, 6);
  leafBlob(m, 0.05, 2.5, 0.05, 0.55, 0.35, 0.55, pal, 4, 6);
  for (let i = 0; i < 5; i++) m.box(O, (R(9, i) - 0.5) * 1.6, 1.25 + R(9, i + 5) * 0.2, (R(9, i + 9) - 0.5) * 1.6, 0.1, 0.12, 0.1, col('#d0a040'));   // buah/bunga kecil
};
// ketapang: daun bertingkat mendatar (khas halaman sekolah)
T.ketapang = m => {
  const pal = [col('#3a7036'), col('#4a8640'), col('#5a984c'), col('#6eac5a')];
  m.box(O, 0, 0, 0, 0.3, 2.6, 0.3, BARK, { top: BARK2 }); m.box(O, 0, 0, 0, 0.46, 0.12, 0.46, BARK2);
  [[1.3, 1.25, 0.25], [1.9, 1.0, 0.25], [2.5, 0.72, 0.22], [2.95, 0.45, 0.2]].forEach(([y, r, h], i) => {
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + i * 0.6; m.box({ x: 0, z: 0, a }, r * 0.45, y - 0.05, 0, r * 0.9, 0.08, 0.12, BARK); }
    leafBlob(m, 0, y + h / 2, 0, r, h / 2, r, pal, 20 + i, 8);
  });
};
// cemara (perbukitan)
T.cemara = m => {
  m.box(O, 0, 0, 0, 0.28, 1.0, 0.28, col('#5a4230'));
  const g = [col('#2a5634'), col('#2f5e3a'), col('#36693f'), col('#3d7446'), col('#46804e')];
  [[1.8, 0.8], [1.45, 1.45], [1.1, 2.05], [0.72, 2.6], [0.4, 3.1]].forEach(([s, y], i) => {
    m.box(O, 0, y, 0, s, 0.62, s, g[i], { top: shade(g[i], 1.25), bottom: true });
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + i * 0.4; m.box({ x: 0, z: 0, a }, s * 0.5, y - 0.08, 0, 0.22, 0.2, 0.3, shade(g[i], 0.85)); }   // ujung ranting menjuntai
  });
  m.box(O, 0, 3.7, 0, 0.18, 0.35, 0.18, g[4]);
};
// pisang: batang hijau + daun lebar menjuntai ke 4 arah
T.pisang = m => {
  m.box(O, 0, 0, 0, 0.26, 1.5, 0.26, col('#7a8a4a'));
  const lf = col('#6aa848');
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + 0.4, xf = { x: 0, z: 0, a };
    m.box(xf, 0.55, 1.45, 0, 1.0, 0.1, 0.42, lf, { top: col('#82c058') });
    m.box(xf, 1.1, 1.25, 0, 0.35, 0.1, 0.36, shade(lf, 0.85));
  }
  m.box(O, 0, 1.5, 0, 0.3, 0.5, 0.3, col('#5a9a40'));
};
// kelapa (pinggir sawah & kali)
T.kelapa = m => {
  for (let i = 0; i < 6; i++) m.box(O, i * 0.06, i * 0.6, 0, 0.24, 0.62, 0.24, col(i % 2 ? '#8a7454' : '#7a6448'));
  const lf = col('#5a9a48');
  for (let i = 0; i < 6; i++) { const xf = { x: 0.3, z: 0, a: i * Math.PI / 3 }; m.box(xf, 0.6, 3.5, 0, 1.2, 0.08, 0.3, lf); m.box(xf, 1.25, 3.3, 0, 0.4, 0.08, 0.25, shade(lf, 0.85)); }
  m.box(O, 0.3, 3.35, 0, 0.36, 0.3, 0.36, col('#6a8a3a'));
};
// bambu (rumpun di bantaran)
T.bambu = m => {
  for (let i = 0; i < 7; i++) { const a = i * 2.4, r = 0.25 + (i % 3) * 0.12; m.box(O, Math.cos(a) * r, 0, Math.sin(a) * r, 0.1, 2.4 + (i % 3) * 0.5, 0.1, col(i % 2 ? '#8aa848' : '#7a9a40')); }
  // daun: lempeng tipis berlapis yang menjuntai keluar, bukan satu kubus besar
  const lf = [col('#5f9a40'), col('#6aa846'), col('#78b450')];
  for (let i = 0; i < 6; i++) { const xf = { x: 0, z: 0, a: i * 1.05 + 0.3 }, y = 1.9 + (i % 3) * 0.45; m.box(xf, 0.45, y, 0, 0.95, 0.08, 0.32, lf[i % 3]); m.box(xf, 0.95, y - 0.2, 0, 0.4, 0.08, 0.26, shade(lf[i % 3], 0.88)); }
  m.box(O, 0, 3.0, 0, 0.5, 0.3, 0.5, lf[2]);
};
T.semak = m => {
  const pal = [col('#3f7a3e'), col('#4f8c48'), col('#62a256'), col('#76b464')];
  leafBlob(m, 0, 0.32, 0, 0.45, 0.3, 0.4, pal, 31, 7); leafBlob(m, 0.25, 0.5, 0.1, 0.25, 0.18, 0.25, pal, 32, 3);
};
T.pagarHidup = m => {   // pagar tanaman, skala x = panjang: badan + tonjolan daun di atas & samping
  const a = col('#3a7a3c'), b = col('#4c8e48'), c = col('#62a456');
  m.box(O, 0, 0, 0, 1, 0.62, 0.45, a, { top: b });
  for (let i = 0; i < 4; i++) m.box(O, -0.38 + i * 0.25, 0.58, (R(41, i) - 0.5) * 0.2, 0.2, 0.1, 0.22, i % 2 ? c : b);
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) m.box(O, -0.33 + i * 0.33, 0.15 + R(42, i + sd) * 0.3, sd * 0.24, 0.18, 0.16, 0.06, b);
};
// bunga: rumpun daun + beberapa kuntum; 'bunga:#warna' memberi warna kuntum (daun tetap hijau)
const flower = (m, pc) => {
  const lf = col('#4a8a44'), lf2 = col('#5c9e50');
  for (let i = 0; i < 5; i++) { const a = i * 1.26; m.box({ x: 0, z: 0, a }, 0.1, 0, 0, 0.24, 0.12, 0.08, i % 2 ? lf : lf2); }
  for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4, r = 0.09 + (i % 2) * 0.05, x = Math.cos(a) * r, z = Math.sin(a) * r, y = 0.16 + (i % 3) * 0.06;
    m.box(O, x, 0.05, z, 0.025, y, 0.025, lf2); m.box(O, x, y, z, 0.1, 0.06, 0.1, pc); m.box(O, x, y + 0.035, z, 0.04, 0.04, 0.04, col('#f8e060')); }
};
T.bunga = m => flower(m, col('#f06080'));
T.pot = m => {
  const tc = col('#b0603a');
  m.box(O, 0, 0, 0, 0.26, 0.24, 0.26, tc); m.box(O, 0, 0.22, 0, 0.34, 0.07, 0.34, shade(tc, 1.1)); m.box(O, 0, 0.27, 0, 0.28, 0.02, 0.28, col('#5a4028'));
  for (let i = 0; i < 6; i++) { const a = i * 1.05; m.box({ x: 0, z: 0, a }, 0.1, 0.27 + (i % 2) * 0.06, 0, 0.22, 0.07, 0.09, i % 2 ? col('#4f9a48') : col('#62ac56')); }
  m.box(O, 0, 0.3, 0, 0.06, 0.22, 0.06, col('#4f9a48')); m.box(O, 0, 0.5, 0, 0.12, 0.07, 0.12, col('#f05a6a'));
};
T.rumput = m => {   // rumpun 6 helai, tinggi & warna beda
  const g = [col('#5e9044'), col('#6a9a4a'), col('#7aaa52'), col('#88b85a')];
  for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3, r = 0.05 + (i % 2) * 0.04, h = 0.12 + R(51, i) * 0.16; m.box(O, Math.cos(a) * r, 0, Math.sin(a) * r, 0.035, h, 0.035, g[i % 4], { top: g[3] }); }
};
T.padi = m => { m.box(O, 0, 0, 0, 0.22, 0.4, 0.06, col('#7ab83a'), { top: col('#c8c050') }); m.box(O, 0, 0, 0, 0.06, 0.34, 0.2, col('#6aa832')); };
T.teh = m => m.box(O, 0, 0, 0, 1, 0.55, 0.8, col('#3f8a3e'), { top: col('#58a84e') });   // baris kebun teh, skala x = panjang
T.batu = m => { m.box(O, 0, 0, 0, 0.5, 0.22, 0.4, col('#9a968c'), { top: col('#b0aca0') }); m.box(O, 0.12, 0.18, -0.04, 0.28, 0.14, 0.24, col('#a8a498'), { top: col('#bcb8ac') }); m.box(O, -0.2, 0, 0.16, 0.16, 0.1, 0.14, col('#8a867c')); m.box(O, 0.05, 0.22, 0.05, 0.1, 0.02, 0.1, col('#6a8a4a')); };

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
