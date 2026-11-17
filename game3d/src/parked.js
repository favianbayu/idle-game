// Kendaraan parkir (motor, mobil, sepeda statis) di kota & sekolah: tiap kendaraan digambar ke Merger sendiri saat dunia
// dibangun (lewat setParkSink di vehicles.js), lalu digabung per petak 48 x 48 hanya yang "ada" hari ini.
// Tiap hari tingkat keramaian diacak (sepi / jarang / sedang / penuh), ditambah variasi per tempat, dan kendaraan yang
// ada pun ikut diacak. Kendaraan yang ada punya kotak tabrakan; yang tidak ada, kotaknya dimatikan.
import * as THREE from 'three';
import { Merger } from './geom.js';
import { MAT, hash } from './common.js';
import { setParkSink } from './vehicles.js';

const CELL = 48;
export const LEVELS = [{ name: 'sepi', f: 0.15 }, { name: 'jarang', f: 0.4 }, { name: 'sedang', f: 0.65 }, { name: 'penuh', f: 0.95 }];
const WEIGHT = [0.22, 0.3, 0.23, 0.25];

export const parked = makeParked();
export function makeParked() {
  const list = [], groups = new Map();
  let scene = null, day = null;
  const api = {
    list,
    // mulai menampung kendaraan statis (dipanggil sebelum kota / sekolah dibangun)
    begin() { setParkSink((xf, hw, hd) => { const m = new Merger(); list.push({ m, x: xf.x, z: xf.z, a: xf.a || 0, hw, hd, done: false }); return m; }); },
    // selesai: pasang kotak tabrakan & tinggi tanah untuk kendaraan yang baru masuk
    end(C, HT) {
      setParkSink(null);
      for (const v of list) {
        if (v.done) continue;
        v.done = true; v.i = list.indexOf(v); v.y = HT ? HT(v.x, v.z) : 0;
        v.col = C.box(v.x, v.z, v.hw + 0.04, v.hd + 0.04, v.a);
        const key = Math.floor(v.x / CELL) + ',' + Math.floor(v.z / CELL);
        (groups.get(key) || groups.set(key, { vs: [], mesh: null }).get(key)).vs.push(v);
      }
    },
    attach(sc) { scene = sc; },
    level(d) { let r = hash(d * 7 + 3, 911), i = 0; while (i < WEIGHT.length - 1 && r >= WEIGHT[i]) r -= WEIGHT[i++]; return LEVELS[i]; },
    get day() { return day; },
    // tampilkan kendaraan hari ke-d (deterministik: hari sama = susunan sama)
    // avoid: titik yang harus kosong (kendaraan milik pemain yang diparkir, posisi pemain)
    setDay(d, avoid = []) {
      if (d === day) return;
      day = d;
      const base = api.level(d).f;
      for (const v of list) {
        const loc = hash(Math.floor(v.x / 14) * 131 + Math.floor(v.z / 14), d * 13 + 5);   // tiap tempat beda sedikit
        const f = Math.max(0.05, Math.min(1, base + (loc - 0.5) * 0.35));
        v.on = hash(v.i * 17 + 1, d * 29 + 7) < f && !avoid.some(p => Math.hypot(p.x - v.x, p.z - v.z) < v.hd + 0.8);
        v.col.off = !v.on;
      }
      for (const g of groups.values()) rebuild(g);
    },
    count() { return list.filter(v => v.on).length; },
  };
  function rebuild(g) {
    if (g.mesh) { scene.remove(g.mesh); g.mesh.geometry.dispose(); g.mesh = null; }
    const vs = g.vs.filter(v => v.on && v.m.n); if (!vs.length) return;
    let nv = 0, ni = 0; for (const v of vs) { nv += v.m.n; ni += v.m.idx.length; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new Uint32Array(ni);
    let ov = 0, oi = 0;
    for (const v of vs) {
      const m = v.m;
      for (let k = 0; k < m.n * 3; k++) { pos[ov * 3 + k] = m.pos[k] + (k % 3 === 1 ? v.y : 0); nor[ov * 3 + k] = m.nor[k]; col[ov * 3 + k] = m.col[k]; }
      for (let k = 0; k < m.idx.length; k++) idx[oi + k] = m.idx[k] + ov;
      ov += m.n; oi += m.idx.length;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeBoundingSphere();
    const me = new THREE.Mesh(geo, MAT.world); me.castShadow = true; me.receiveShadow = true; me.matrixAutoUpdate = false;
    g.mesh = me; scene.add(me);
  }
  return api;
}
