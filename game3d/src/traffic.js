// Lalu lintas kota: lampu merah otomatis di tiap simpang jalan raya (tiang di kiri jalur, lampu menghadap kendaraan yang datang)
// dan mobil/motor yang berjalan di lajur kiri (Indonesia), berhenti di lampu merah, menjaga jarak, dan berhenti untuk pemain.
import * as THREE from 'three';
import { Merger, col } from './geom.js';
import { MAT } from './common.js';
import { makeRide } from './rides.js';
import { Character } from './chars.js';

const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };

// polyline -> titik setiap ~0.5 petak dengan jarak kumulatif s & arah
function path(r) {
  const pts = r.closed ? [...r.pts, r.pts[0]] : r.pts, P = [];
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    if (i) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    P.push({ x: pts[i][0], z: pts[i][1], s });
  }
  return { P, L: s };
}
function at(rd, s) {   // posisi & arah pada jarak s
  const P = rd.P; s = Math.max(0, Math.min(rd.L, s));
  let lo = 0, hi = P.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (P[m].s <= s) lo = m; else hi = m; }
  const a = P[lo], b = P[hi], l = (b.s - a.s) || 1, t = (s - a.s) / l;
  return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, tx: (b.x - a.x) / l, tz: (b.z - a.z) / l };
}
function nearest(rd, x, z) {
  let best = { d: 1e9, s: 0 };
  for (let i = 1; i < rd.P.length; i++) {
    const a = rd.P[i - 1], b = rd.P[i], dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2)), px = a.x + dx * t, pz = a.z + dz * t, d = Math.hypot(x - px, z - pz);
    if (d < best.d) best = { d, s: a.s + (b.s - a.s) * t, x: px, z: pz };
  }
  return best;
}

export function buildTraffic(scene, K, C, M) {
  const roads = K.roads.map((r, i) => ({ ...r, i })).filter(r => r.kind === 'raya' || r.kind === 'jalan').map(r => ({ ...r, ...path(r) }));
  // ---------- simpang: ujung jalan menempel jalan lain, atau dua ruas berpotongan
  const J = [];
  const addJ = (x, z, a, sa, b, sb) => {
    let j = J.find(j => Math.hypot(j.x - x, j.z - z) < 3.5);
    if (!j) J.push(j = { x, z, on: [] });
    for (const [r, s] of [[a, sa], [b, sb]]) if (!j.on.some(o => o.r === r && Math.abs(o.s - s) < 4)) j.on.push({ r, s });
  };
  for (const A of roads) for (const B of roads) {
    if (A === B) continue;
    if (!A.closed) for (const [e, se] of [[A.P[0], 0], [A.P.at(-1), A.L]]) { const n = nearest(B, e.x, e.z); if (n.d < B.w / 2 + 1.5) addJ(n.x, n.z, A, se, B, n.s); }
    if (A.i < B.i) for (let i = 1; i < A.P.length; i++) for (let j = 1; j < B.P.length; j++) {
      const p0 = A.P[i - 1], p1 = A.P[i], q0 = B.P[j - 1], q1 = B.P[j];
      const d1x = p1.x - p0.x, d1z = p1.z - p0.z, d2x = q1.x - q0.x, d2z = q1.z - q0.z, den = d1x * d2z - d1z * d2x; if (Math.abs(den) < 1e-6) continue;
      const t = ((q0.x - p0.x) * d2z - (q0.z - p0.z) * d2x) / den, u = ((q0.x - p0.x) * d1z - (q0.z - p0.z) * d1x) / den;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) addJ(p0.x + d1x * t, p0.z + d1z * t, A, p0.s + (p1.s - p0.s) * t, B, q0.s + (q1.s - q0.s) * t);
    }
  }
  // ---------- lampu merah: di simpang yang melibatkan jalan raya utama (bukan jalan lingkar tertutup)
  const poles = new Merger(), lamp = {};
  for (const g of ['A', 'B']) for (const c of ['r', 'y', 'g']) lamp[g + c] = new Merger();
  const signals = [];
  J.forEach((j, ji) => {
    const raya = j.on.some(o => o.r.kind === 'raya' && !o.r.closed);
    if (!raya || j.on.length < 2) return;
    j.signal = true; signals.push(j);
    for (const o of j.on) {
      const other = Math.max(...j.on.filter(q => q !== o).map(q => q.r.w)), back = other / 2 + 1.1, grp = o.r.kind === 'raya' ? 'A' : 'B';
      o.stops = [];
      for (const dir of [1, -1]) {
        // kendaraan datang dari arah -dir menuju simpang (bergerak +dir); butuh ruas jalan di sisi itu
        const sFrom = o.s - dir * (back + 2);
        if (sFrom < 0 || sFrom > o.r.L) continue;
        o.stops.push({ s: o.s - dir * back, dir, grp, j });
        const p = at(o.r, o.s - dir * back), dx = p.tx * dir, dz = p.tz * dir, lx = dz, lz = -dx;   // arah datang & kiri
        const px = p.x + lx * (o.r.w / 2 + 0.55), pz = p.z + lz * (o.r.w / 2 + 0.55);
        if (M && M.roadDist(px, pz) < 0.1) continue;   // sudut jatuh di jalan lain: lewati tiang
        const xf = { x: px, z: pz, a: Math.atan2(dx, -dz) };   // lokal +x = ke tengah jalan, +z = menghadap kendaraan datang
        const arm = Math.min(o.r.w / 2 + 0.2, 2.4);
        poles.box(xf, 0, 0, 0, 0.18, 0.25, 0.18, col('#8a8a86'));
        poles.box(xf, 0, 0.25, 0, 0.13, 3.3, 0.13, col('#3a3a40'));
        poles.box(xf, arm / 2, 3.25, 0, arm + 0.1, 0.1, 0.1, col('#3a3a40'));
        poles.box(xf, arm, 2.35, 0, 0.32, 0.86, 0.26, col('#24242a'));                                     // kotak lampu di atas lajur
        poles.box(xf, 0, 1.5, 0, 0.22, 0.6, 0.2, col('#24242a'));                                           // lampu pejalan kaki di tiang
        for (const [k, y] of [['r', 2.94], ['y', 2.69], ['g', 2.44]]) {
          lamp[grp + k].box(xf, arm, y, 0.13, 0.18, 0.17, 0.03, col('#ffffff'));
          poles.box(xf, arm, y + 0.17, 0.16, 0.22, 0.03, 0.08, col('#24242a'));                              // pelindung (visor)
        }
        C && C.circle(px, pz, 0.14);
      }
    }
  });
  const sigMat = {}, sigMeshes = [];
  for (const k in lamp) { sigMat[k] = new THREE.MeshBasicMaterial({ vertexColors: false, color: 0x222222 }); const me = new THREE.Mesh(lamp[k].build(), sigMat[k]); scene.add(me); sigMeshes.push(me); }
  const pm = new THREE.Mesh(poles.build(), MAT.world); pm.castShadow = true; scene.add(pm);
  const ON = { r: new THREE.Color('#ff3a2a'), y: new THREE.Color('#ffc020'), g: new THREE.Color('#3aff6a') }, OFF = { r: new THREE.Color('#3a1a1a'), y: new THREE.Color('#3a301a'), g: new THREE.Color('#1a3a22') };
  const CYCLE = 22, light = (grp, t) => {   // A (jalan raya) hijau dulu, lalu B
    const u = t % CYCLE, a = u < 9 ? 'g' : u < 11 ? 'y' : 'r', b = u < 11 ? 'r' : u < 20 ? 'g' : 'y';
    return grp === 'A' ? a : b;
  };

  // ---------- kendaraan
  const RIDERS = ['ojol', 'pemuda', 'mbak', 'anakPunk', 'tukangBakso', 'pakRT', 'ibuHijab2', 'siswaB', 'satpam', 'mandor', 'kirana', 'fajar'];
  const CARC = ['#e8e8e8', '#2a2a2e', '#a8a8b0', '#c83a3a', '#2a5aa0', '#3a6a4a', '#e0c890', '#5a3a2a'], MOTC = ['#c83a3a', '#2a2a2e', '#2a6ac0', '#e8e8e8', '#3a9a5a', '#e07a2a'];
  const cars = [];
  let seed = 1;
  const pick = (arr, h) => arr[Math.floor(h * arr.length) % arr.length];
  for (const r of roads) {
    const n = Math.floor(r.L / (r.kind === 'raya' ? 18 : 30));
    for (let i = 0; i < n; i++) {
      const h = hash(r.i * 31 + i, seed++), h2 = hash(i, r.i + 5), h3 = hash(i * 7, r.i + 9);
      // raya: mobil & motor; jalan: kebanyakan motor + sepeda
      const type = r.kind === 'raya' ? (h < 0.45 ? 'car' : h < 0.93 ? 'motor' : 'sepeda') : (h < 0.25 ? 'car' : h < 0.78 ? 'motor' : 'sepeda');
      let kind, color, rd;
      if (type === 'car') { kind = pick(['mpv', 'mpv', 'sedan', 'hatch', 'suv', 'angkot', 'pikap', 'taksi', 'truk'], h2); color = kind === 'angkot' ? '#8ac8e0' : kind === 'taksi' ? '#2a6ac0' : pick(CARC, h3); rd = makeRide('car', kind, color, { cargo: '#c8a060', stripe: kind === 'angkot' ? '#f0c020' : null, box: pick(['#e8e4d8', '#f2c230', '#3a6ab0'], h3) }); }
      else if (type === 'motor') { kind = pick(['bebek', 'bebek', 'matic', 'matic', 'matic', 'sport', 'trail', 'vespa'], h2); color = pick(MOTC, h3); rd = makeRide('motor', kind, color); }
      else { kind = pick(['kota', 'mtb', 'onthel', 'bmx'], h2); color = pick(['#2a8ae0', '#d23a3a', '#3a9a5a', '#f2c230', '#e8e8e8'], h3); rd = makeRide('sepeda', kind, color); }
      scene.add(rd.group);
      const riders = [];
      if (type !== 'car') {
        const sid = kind === 'bmx' ? pick(['bocah', 'anakSD'], h3) : pick(RIDERS, hash(i * 3, r.i)), ch = new Character(sid); rd.mount(ch); riders.push(ch);
        if (type === 'motor' && kind !== 'sport' && hash(i, 99 + r.i) < 0.3) { const p2 = new Character(pick(['ibuHijab', 'mbak', 'siswiA', 'bocah', 'ibuDaster'], h)); rd.mount(p2, true); riders.push(p2); }
      }
      const s = (i + hash(i, 11)) / n * r.L, dir = hash(i, 13) < 0.5 ? 1 : -1;
      const base = type === 'sepeda' ? 2.6 : (r.kind === 'raya' ? 6.5 : 4.2) * (type === 'motor' ? 1.1 : 1);
      cars.push({ id: cars.length, r, s, dir, type, motor: type !== 'car', rd, riders, grp: rd.group, len: type === 'car' ? (kind === 'hatch' ? 1.5 : 1.8) : 1.0, wid: type === 'car' ? 1.0 : 0.45, vmax: base * (0.85 + 0.3 * hash(i, 17)), v: 0, x: 0, z: 0, h: 0, init: false });
    }
  }
  const lane = v => v.motor ? Math.min(v.r.w / 2 - (v.type === 'sepeda' ? 0.35 : 0.45), v.r.w / 4 + 0.45) : v.r.w / 4 + 0.05;
  function target(v) {
    const p = at(v.r, v.s), dx = p.tx * v.dir, dz = p.tz * v.dir, lx = dz, lz = -dx, o = lane(v);
    return { x: p.x + lx * o, z: p.z + lz * o, h: Math.atan2(dx, dz), fx: dx, fz: dz };
  }
  // ujung jalan: lanjut ke jalan yang tersambung di simpang itu (kalau ada), kalau tidak putar balik
  function endOfRoad(v) {
    const atEnd = v.dir > 0 ? v.r.L : 0;
    const j = J.find(j => j.on.some(o => o.r === v.r && Math.abs(o.s - atEnd) < 4));
    const opts = j ? j.on.filter(o => o.r !== v.r) : [];
    if (!opts.length) { v.dir = -v.dir; return; }
    const o = opts[Math.floor(Math.random() * opts.length)];
    v.r = o.r; v.s = o.s;
    v.dir = o.s < 3 ? 1 : o.s > o.r.L - 3 ? -1 : (Math.random() < 0.5 ? 1 : -1);
    v.s += v.dir * 2.5;
  }
  // ujung jalan di tepi peta: kendaraan yang keluar menghilang, lalu muncul lagi (acak) dari ujung tepi peta lain
  const [MW, MH] = K.size, EDGE = 3;
  const onEdge = p => p.x < EDGE || p.z < EDGE || p.x > MW - EDGE || p.z > MH - EDGE;
  const gates = [];
  for (const r of roads) if (!r.closed) { if (onEdge(r.P[0])) gates.push({ r, s: 0, dir: 1 }); if (onEdge(r.P.at(-1))) gates.push({ r, s: r.L, dir: -1 }); }
  const isGate = (r, s) => gates.some(g => g.r === r && Math.abs(g.s - s) < 1);
  function respawn(v) {
    v.grp.visible = false; for (const ch of v.riders) ch.group.visible = false;
    v.wait = 1 + Math.random() * 5; v.v = 0;
  }
  function enter(v) {
    const opts = gates.filter(g => !(g.r.kind === 'raya') === !(v.r.kind === 'raya') || Math.random() < 0.3);
    const g = (opts.length ? opts : gates)[Math.floor(Math.random() * (opts.length || gates.length))];
    v.r = g.r; v.dir = g.dir; v.s = g.dir > 0 ? 0.5 : g.r.L - 0.5;
    const t = target(v);
    if (cars.some(u => u !== v && !u.wait && (u.x - t.x) ** 2 + (u.z - t.z) ** 2 < 9)) { v.wait = 1; return; }   // gerbang masih terisi: tunggu
    v.wait = 0; v.init = false; v.v = v.vmax * 0.6;
  }
  let T = 0;
  function update(dt, player) {
    T += dt;
    for (const g of ['A', 'B']) { const st = light(g, T); for (const k of ['r', 'y', 'g']) sigMat[g + k].color.copy(st === k ? ON[k] : OFF[k]); }
    for (const v of cars) {
      if (v.wait) { v.wait = Math.max(0, v.wait - dt) || 1e-6; if (v.wait <= 1e-6) enter(v); if (v.wait) continue; }
      const tg = target(v);
      let want = v.vmax;
      // lampu merah / kuning di depan
      for (const j of signals) for (const o of j.on) if (o.r === v.r && o.stops) for (const st of o.stops) {
        if (st.dir !== v.dir) continue;
        const ds = (st.s - v.s) * v.dir;
        if (ds > -0.2 && ds < 9 && light(st.grp, T) !== 'g') want = Math.min(want, Math.max(0, (ds - 0.3) * 1.3));
      }
      // jaga jarak dengan kendaraan di depan & pemain
      // kendaraan lain: ikuti yang di depan selajur; di simpang/silang, yang datang dari samping diberi jalan (prioritas id supaya tidak saling tunggu)
      const fx0 = Math.sin(v.h), fz0 = Math.cos(v.h);
      for (const u of cars) {
        if (u === v || u.wait) continue;
        const rx = u.x - v.x, rz = u.z - v.z; if (rx * rx + rz * rz > 64) continue;
        const ahead = rx * fx0 + rz * fz0, lat = Math.abs(rx * fz0 - rz * fx0), same = Math.sin(u.h) * fx0 + Math.cos(u.h) * fz0;
        const gap = ahead - (v.len + u.len) / 2;
        if (ahead > 0 && lat < (v.wid + u.wid) / 2 + 0.25) { if (same > 0.3 || v.id > u.id || gap < 0.6) want = Math.min(want, Math.max(0, (gap - 0.7) * 1.6)); }
        else if (ahead > 0 && same < 0.5 && same > -0.7 && gap < 2.2 && lat < 2.4 && v.id > u.id) want = Math.min(want, Math.max(0, (gap - 0.9) * 1.2));
      }
      if (player) {
        const rx = player.x - v.x, rz = player.z - v.z, ahead = rx * fx0 + rz * fz0, lat = Math.abs(rx * fz0 - rz * fx0);
        if (ahead > 0 && ahead < 7 && lat < v.wid / 2 + 0.9) want = Math.min(want, Math.max(0, (ahead - v.len / 2 - 0.9) * 1.5));
      }
      v.v += (want - v.v) * Math.min(1, dt * (want < v.v ? 6 : 1.5));
      v.s += v.v * v.dir * dt;
      if (v.r.closed) v.s = (v.s + v.r.L) % v.r.L;
      else if (v.s > v.r.L || v.s < 0) { v.s = Math.max(0, Math.min(v.r.L, v.s)); if (isGate(v.r, v.s)) { respawn(v); continue; } endOfRoad(v); }
      const t2 = target(v);
      if (!v.init) { v.x = t2.x; v.z = t2.z; v.h = t2.h; v.init = true; }
      const k = 1 - Math.exp(-dt * 5);
      v.x += (t2.x - v.x) * k; v.z += (t2.z - v.z) * k;
      let dh = t2.h - v.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); v.h += dh * k;
      const far = !player || (v.x - player.x) ** 2 + (v.z - player.z) ** 2 > 85 * 85;
      v.grp.visible = !far;
      if (far) continue;
      v.grp.position.set(v.x, 0, v.z); v.grp.rotation.y = v.h;
      v.grp.rotation.z = v.motor ? -dh * 0.6 : 0;   // motor miring saat menikung
      v.rd.spin(v.v * dt);
      const near = (v.x - player.x) ** 2 + (v.z - player.z) ** 2 < 45 * 45;
      for (const ch of v.riders) { ch.group.visible = near; if (near) ch.update(v.type === 'sepeda' ? dt * Math.min(1.6, v.v / 2.2) : dt); }
      if (near && v.type === 'sepeda') v.rd.syncCrank(v.riders[0]);
    }
  }
  // dorong lingkaran (pemain / NPC) keluar dari badan kendaraan (kotak berorientasi)
  function push(p, r) {
    for (const v of cars) {
      if (v.wait || !v.init) continue;
      const dx = p.x - v.x, dz = p.z - v.z; if (dx * dx + dz * dz > 9) continue;
      const fx = Math.sin(v.h), fz = Math.cos(v.h), a = dx * fx + dz * fz, b = dx * fz - dz * fx, hl = v.len / 2 + r, hw = v.wid / 2 + r;
      if (Math.abs(a) >= hl || Math.abs(b) >= hw) continue;
      if (hl - Math.abs(a) < hw - Math.abs(b)) { const d = (hl - Math.abs(a)) * Math.sign(a || 1); p.x += fx * d; p.z += fz * d; }
      else { const d = (hw - Math.abs(b)) * Math.sign(b || 1); p.x += fz * d; p.z -= fx * d; }
    }
    return p;
  }
  return { update, push, junctions: J, signals, cars };
}
