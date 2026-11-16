// Tokoh voxel: mesh tiap frame animasi dibangun di Web Worker lalu disimpan di cache.
// Ganti frame = ganti geometri (tanpa membangun ulang apa pun) -> murah saat kamera berputar.
import * as THREE from 'three';

const CACHE = new Map(), PENDING = new Set(), QUEUE = [];
let worker = null, ready = false, busy = 0, META = null;
const listeners = [];
export const onCharsReady = fn => ready ? fn(META) : listeners.push(fn);

export function initChars(src) {
  worker = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
  worker.onmessage = e => {
    const d = e.data;
    if (d.ready) { ready = true; META = d; listeners.forEach(f => f(d)); pump(); return; }
    busy--;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(d.pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(d.nor, 3, true));
    g.setAttribute('color', new THREE.BufferAttribute(d.col, 3));
    g.setIndex(new THREE.BufferAttribute(d.idx, 1));
    g.computeBoundingSphere();
    g.userData.lift = d.lift; g.userData.butt = d.butt; g.userData.buttX = d.buttX;
    CACHE.set(d.key, g); PENDING.delete(d.key);
    pump();
  };
}
function pump() {
  while (ready && busy < 2 && QUEUE.length) {
    // prioritas: frame pemain dulu
    QUEUE.sort((a, b) => b.p - a.p);
    const j = QUEUE.shift(); busy++; worker.postMessage(j);
  }
}
export function frame(sid, anim, i, prio = 0) {
  const key = sid + '|' + anim + '|' + i;
  const g = CACHE.get(key);
  if (g) return g;
  if (!PENDING.has(key)) { PENDING.add(key); QUEUE.push({ key, sid, anim, i, p: prio }); pump(); }
  return null;
}
export const animInfo = name => META && META.anims[name];
export const styleName = sid => (META && META.names[sid]) || sid;
export function preload(sid, anims, prio = 0) { if (!META) return; for (const a of anims) for (let i = 0; i < META.anims[a].n; i++) frame(sid, a, i, prio); }

// warna voxel tokoh sudah membawa cahaya (organicColor), jadi pakai bahan tanpa lampu: sama persis dengan sprite lama
export const CHAR_MAT = new THREE.MeshBasicMaterial({ vertexColors: true });
// pemain digambar SETELAH siluetnya, supaya siluet hanya muncul di bagian yang tertutup bangunan (bukan menimpa badannya sendiri)
const CHAR_MAT_TOP = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 1 });
// siluet tokoh saat tertutup bangunan (digambar hanya di bagian yang terhalang)
export const XRAY_MAT = new THREE.MeshBasicMaterial({ color: 0x2a3a6a, transparent: true, opacity: 0.45, depthFunc: THREE.GreaterDepth, depthWrite: false });

export class Character {
  constructor(sid, o = {}) {
    this.sid = sid; this.anim = 'idle'; this.t = 0; this.prio = o.prio || 0;
    this.group = new THREE.Group();
    this.mesh = new THREE.Mesh(undefined, CHAR_MAT); this.mesh.castShadow = true; this.mesh.visible = false;
    this.group.add(this.mesh);
    if (o.xray) { this.xray = new THREE.Mesh(undefined, XRAY_MAT); this.xray.renderOrder = 10; this.xray.visible = false; this.group.add(this.xray); this.mesh.material = CHAR_MAT_TOP; this.mesh.renderOrder = 11; }
    // bayangan bulat (murah, selalu ada walau bayangan matahari dimatikan)
    this.blob = new THREE.Mesh(BLOB_G, BLOB_M); this.blob.rotation.x = -Math.PI / 2; this.blob.position.y = 0.02; this.blob.renderOrder = 1;
    this.group.add(this.blob);
    this.heading = 0;
  }
  play(anim) { if (anim !== this.anim) { this.anim = anim; this.t = 0; } }
  update(dt) {
    this.t += dt;
    const info = animInfo(this.anim); if (!info) return;
    let i = Math.floor(this.t * info.fps);
    i = info.loop ? i % info.n : Math.min(info.n - 1, i);
    let g = frame(this.sid, this.anim, i, this.prio);
    if (!g) g = frame(this.sid, 'idle', 0, this.prio + 1);   // fallback saat frame belum jadi
    if (g) {
      this.mesh.geometry = g; this.mesh.visible = true; // duduk di kendaraan: pantat tokoh ditaruh tepat di titik jok (seat.y tinggi, seat.x maju), dihitung per frame dari bentuk voxel
      if (this.seat) { this.mesh.position.y = this.seat.y - (g.userData.butt || 0); this.mesh.position.x = this.seat.x - (g.userData.buttX || 0); }
      else { this.mesh.position.y = g.userData.lift || 0; this.mesh.position.x = 0; }
      if (this.xray) { this.xray.geometry = g; this.xray.visible = true; this.xray.position.copy(this.mesh.position); }
    }
    // model menghadap +x lokal; heading = sudut di bidang XZ (atan2(z, x))
    this.group.rotation.y = -this.heading;
  }
}
const BLOB_G = new THREE.CircleGeometry(0.42, 12);
const BLOB_M = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16, depthWrite: false });
