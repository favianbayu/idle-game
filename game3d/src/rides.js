// Kendaraan yang bisa bergerak (pemain & lalu lintas): bodi + roda terpisah yang berputar + engkol sepeda,
// beserta titik jok & pose pengendara yang pas untuk tiap model (MOTOR_FIT / BIKE_FIT).
import * as THREE from 'three';
import { Merger } from './geom.js';
import { MAT } from './common.js';
import * as V from './vehicles.js';
import { animInfo } from './chars.js';

const WG = new Map();
const wheelGeo = (w) => { const k = [w.r0, w.k, w.w, w.op.spokes, w.op.rim5, w.op.knob, w.op.t, w.op.tire && w.op.tire.join(), w.op.rim && w.op.rim.join()].join('|'); if (!WG.has(k)) WG.set(k, V.wheelGeo(Merger, w.r0, w.w, w.op, w.k)); return WG.get(k); };
let CRANK = null;
const BODY = new Map();

// type: 'motor' | 'sepeda' | 'car'
export function makeRide(type, kind, color, o = {}) {
  const key = [type, kind, color, o.cargo, o.stripe, o.box].join('|');
  let entry = BODY.get(key);
  if (!entry) {
    const wheels = [], m = new Merger(), xf = { x: 0, z: 0, a: 0 };
    if (type === 'motor') V.motor(m, xf, color, kind, { wheels });
    else if (type === 'sepeda') V.sepeda(m, xf, color, { kind, wheels });
    else V.car(m, xf, color, kind, { wheels, cargo: o.cargo, stripe: o.stripe, box: o.box });
    entry = { geo: m.build(), wheels }; BODY.set(key, entry);
  }
  const group = new THREE.Group(), body = new THREE.Mesh(entry.geo, MAT.world); body.castShadow = true; group.add(body);
  const wm = entry.wheels.map(w => { const me = new THREE.Mesh(wheelGeo(w), MAT.world); me.position.set(w.x, w.y, w.z); me.castShadow = true; group.add(me); return { me, r: w.r }; });
  const fit = type === 'motor' ? V.MOTOR_FIT[kind] : type === 'sepeda' ? V.BIKE_FIT[kind] : null, K = V.VK[type] || 1;
  // titik jok/boncengan/engkol dalam satuan dunia (model kendaraan sudah dikecilkan K)
  const seat = fit && { y: fit.seat[0] * K, x: fit.seat[1] * K }, back = fit && fit.back && { y: fit.back[0] * K, x: fit.back[1] * K };
  let crank = null;
  if (type === 'sepeda') { crank = new THREE.Mesh(CRANK || (CRANK = V.crankGeo(Merger, K)), MAT.world); crank.position.set(0, fit.crank[0] * K, fit.crank[1] * K); group.add(crank); }
  return {
    type, kind, group, fit, seat, back, anim: fit && fit.anim, crank,
    spin(d) { for (const w of wm) w.me.rotation.x += d / w.r; },
    // tokoh duduk di jok: model tokoh menghadap +x, kendaraan menghadap +z
    mount(ch, rear = false) { ch.heading = Math.PI / 2; ch.seat = { ...(rear ? back : seat) }; ch.blob.visible = false; ch.play(rear ? 'passenger' : fit.anim); group.add(ch.group); },
    syncCrank(ch) { const a = crank && animInfo(ch.anim); if (a) crank.rotation.x = -((ch.t * a.fps / a.n) % 1) * Math.PI * 2 + 1.2; },
  };
}
