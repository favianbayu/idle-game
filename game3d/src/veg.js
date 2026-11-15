// Tanaman & benda kecil berulang: satu template (Merger, warna per-vertex) -> InstancedMesh.
// Satu jenis = satu draw call, berapa pun jumlahnya.
import * as THREE from 'three';
import { Merger, col, shade } from './geom.js';

const O = { x: 0, z: 0, a: 0 };
const T = {};
// pohon bulat (mangga/angsana): batang + gumpalan kubus yang saling tumpang
T.bulat = m => {
  const lf = col('#4f8a46'), lf2 = col('#5f9c52'), lf3 = col('#6aa85a');
  m.box(O, 0, 0, 0, 0.32, 1.3, 0.32, col('#6e5034'));
  m.box(O, 0.25, 0.9, 0, 0.5, 0.12, 0.12, col('#6e5034'));
  m.box(O, 0, 1.1, 0, 2.1, 1.0, 2.1, lf, { top: lf2 });
  m.box(O, -0.5, 1.5, 0.4, 1.3, 0.9, 1.3, lf2, { top: lf3 });
  m.box(O, 0.5, 1.6, -0.3, 1.3, 1.0, 1.2, lf2, { top: lf3 });
  m.box(O, 0, 2.0, 0, 1.3, 0.7, 1.3, lf3, { top: col('#7ab866') });
};
// cemara (perbukitan)
T.cemara = m => {
  m.box(O, 0, 0, 0, 0.28, 1.0, 0.28, col('#5a4230'));
  const g = [col('#2f5e3a'), col('#36693f'), col('#3d7446'), col('#46804e')];
  [[1.8, 0.8], [1.45, 1.5], [1.05, 2.15], [0.65, 2.75]].forEach(([s, y], i) => m.box(O, 0, y, 0, s, 0.75, s, g[i], { top: shade(g[i], 1.2) }));
  m.box(O, 0, 3.4, 0, 0.3, 0.4, 0.3, g[3]);
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
T.semak = m => { m.box(O, 0, 0, 0, 0.9, 0.5, 0.8, col('#4f8c48'), { top: col('#62a256') }); m.box(O, 0.2, 0.3, 0.1, 0.5, 0.3, 0.5, col('#5a9a50')); };
T.pagarHidup = m => m.box(O, 0, 0, 0, 1, 0.6, 0.45, col('#3f7a40'), { top: col('#56964e') });   // pagar tanaman (perumahan), skala x = panjang
T.bunga = m => { m.box(O, 0, 0, 0, 0.42, 0.22, 0.42, col('#4f8c48')); m.box(O, 0, 0.22, 0, 0.3, 0.07, 0.3, col('#ffffff')); };
T.pot = m => { m.box(O, 0, 0, 0, 0.3, 0.28, 0.3, col('#b0603a')); m.box(O, 0, 0.28, 0, 0.36, 0.25, 0.36, col('#5a9a50')); m.box(O, 0.05, 0.4, 0, 0.12, 0.08, 0.12, col('#ffffff')); };
T.rumput = m => { m.box(O, 0, 0, 0, 0.16, 0.2, 0.05, col('#6a9a4a'), { top: col('#7aaa52') }); m.box(O, 0.03, 0, 0, 0.05, 0.14, 0.16, col('#5e9044')); };
T.padi = m => { m.box(O, 0, 0, 0, 0.22, 0.4, 0.06, col('#7ab83a'), { top: col('#c8c050') }); m.box(O, 0, 0, 0, 0.06, 0.34, 0.2, col('#6aa832')); };
T.teh = m => m.box(O, 0, 0, 0, 1, 0.55, 0.8, col('#3f8a3e'), { top: col('#58a84e') });   // baris kebun teh, skala x = panjang
T.batu = m => { m.box(O, 0, 0, 0, 0.5, 0.25, 0.4, col('#9a968c'), { top: col('#b0aca0') }); };

const GEO = {};
function geo(kind) { if (!GEO[kind]) { const m = new Merger(); T[kind](m); GEO[kind] = m.build(); } return GEO[kind]; }
export const SMALL = [];
const MAT = new THREE.MeshLambertMaterial({ vertexColors: true });

// list: [{ k: jenis, x, z, s (skala), a (sudut), sx (skala panjang), c ('#warna' tint) }]
export function plant(scene, list) {
  // dikelompokkan per jenis DAN per potongan 48 petak, supaya frustum culling membuang yang di luar layar
  const by = {}, CH = 48;
  for (const p of list) { const key = p.k + '|' + Math.floor(p.x / CH) + ',' + Math.floor(p.z / CH); (by[key] || (by[key] = [])).push(p); }
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
    const small = ['rumput', 'padi', 'bunga', 'batu', 'pot'].includes(kind);
    im.userData.small = ['rumput', 'padi', 'bunga'].includes(kind);   // disembunyikan pada kualitas Rendah
    im.castShadow = !small; im.receiveShadow = true;
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.computeBoundingSphere();
    scene.add(im); out.push(im); if (im.userData.small) SMALL.push(im);
  }
  return out;
}
