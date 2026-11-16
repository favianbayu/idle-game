// Binatang kota: kucing kampung, anjing, ayam & anak ayam, merpati di pelataran, burung terbang berkelompok, bebek di kali,
// ikan di kolam & sungai, sapi & kambing di kandang. Model voxel kecil dari beberapa bagian (badan, kepala, pasangan kaki, ekor)
// yang digerakkan prosedural: jalan, duduk, rebahan, mematuk, merumput, mengibas ekor, terbang, berenang.
// Aksi di dekat kucing/anjing = elus. Yang penakut kabur kalau pemain lari mendekat.
import * as THREE from 'three';
import { Merger, col, shade } from './geom.js';
import { MAT, hash } from './common.js';
import { L } from './buildings.js';

const O = { x: 0, z: 0, a: 0 };
const C = c => col(c);
const mesh = (fn, shadow = false) => { const m = new Merger(); fn(m); const me = new THREE.Mesh(m.build(), MAT.world); me.castShadow = shadow; return me; };
const piv = (x, y, z, child) => { const g = new THREE.Group(); g.position.set(x, y, z); if (child) g.add(child); return g; };
const SURF = -0.48;

/* ---------------- model (menghadap +x) */
function cat(c1, c2, stripes) {
  const a = C(c1), b = C(c2), root = new THREE.Group();
  root.add(mesh(m => { m.box(O, 0, 0.12, 0, 0.34, 0.15, 0.17, a); m.box(O, 0, 0.115, 0, 0.3, 0.02, 0.15, b); if (stripes) for (let i = 0; i < 4; i++) m.box(O, -0.12 + i * 0.08, 0.2, 0, 0.03, 0.075, 0.175, shade(a, 0.7)); }));
  const head = piv(0.17, 0.24, 0, mesh(m => { m.box(O, 0.05, -0.05, 0, 0.15, 0.13, 0.16, a); m.box(O, 0.12, -0.05, 0, 0.04, 0.06, 0.09, b); for (const s of [-1, 1]) { m.box(O, 0.03, 0.08, s * 0.05, 0.04, 0.06, 0.04, a); m.box(O, 0.035, 0.085, s * 0.05, 0.02, 0.04, 0.02, C('#f2a0a8')); m.box(O, 0.125, 0.0, s * 0.04, 0.01, 0.025, 0.025, C('#9ad83a')); } m.box(O, 0.142, -0.03, 0, 0.01, 0.02, 0.02, C('#e88aa0')); }));
  const legA = piv(0, 0.13, 0, mesh(m => { m.box(O, 0.12, -0.13, 0.06, 0.05, 0.13, 0.05, a); m.box(O, -0.12, -0.13, -0.06, 0.05, 0.13, 0.05, a); }));
  const legB = piv(0, 0.13, 0, mesh(m => { m.box(O, 0.12, -0.13, -0.06, 0.05, 0.13, 0.05, a); m.box(O, -0.12, -0.13, 0.06, 0.05, 0.13, 0.05, a); }));
  const tail = piv(-0.17, 0.22, 0, mesh(m => { m.box(O, -0.04, 0, 0, 0.08, 0.035, 0.035, a); m.box(O, -0.09, 0.02, 0, 0.04, 0.12, 0.035, a); m.box(O, -0.09, 0.13, 0, 0.04, 0.04, 0.035, stripes ? shade(a, 0.7) : a); }));
  root.add(head, legA, legB, tail); return { root, head, legA, legB, tail, h: 0.28 };
}
function dog(c1, c2) {
  const a = C(c1), b = C(c2), root = new THREE.Group();
  root.add(mesh(m => { m.box(O, 0, 0.22, 0, 0.5, 0.22, 0.22, a); m.box(O, 0.05, 0.215, 0, 0.36, 0.03, 0.2, b); m.box(O, 0.2, 0.4, 0, 0.1, 0.06, 0.2, C('#c83a2a')); }));
  const head = piv(0.27, 0.42, 0, mesh(m => { m.box(O, 0.05, -0.06, 0, 0.18, 0.17, 0.18, a); m.box(O, 0.16, -0.06, 0, 0.1, 0.08, 0.11, b); m.box(O, 0.215, -0.02, 0, 0.02, 0.035, 0.04, C('#1a1a1a')); for (const s of [-1, 1]) { m.box(O, 0.0, 0.05, s * 0.09, 0.07, 0.09, 0.03, shade(a, 0.75)); m.box(O, 0.14, 0.03, s * 0.05, 0.01, 0.03, 0.03, C('#1a1a1a')); } m.box(O, 0.18, -0.07, 0, 0.06, 0.015, 0.05, C('#e86a7a')); }));
  const legA = piv(0, 0.22, 0, mesh(m => { m.box(O, 0.18, -0.22, 0.07, 0.07, 0.22, 0.07, a); m.box(O, -0.18, -0.22, -0.07, 0.07, 0.22, 0.07, a); }));
  const legB = piv(0, 0.22, 0, mesh(m => { m.box(O, 0.18, -0.22, -0.07, 0.07, 0.22, 0.07, a); m.box(O, -0.18, -0.22, 0.07, 0.07, 0.22, 0.07, a); }));
  const tail = piv(-0.25, 0.4, 0, mesh(m => { m.box(O, -0.05, 0, 0, 0.1, 0.05, 0.05, a); m.box(O, -0.1, 0.03, 0, 0.05, 0.14, 0.05, a); }));
  root.add(head, legA, legB, tail); return { root, head, legA, legB, tail, h: 0.5 };
}
function chicken(c1, rooster, chick) {
  const a = C(c1), root = new THREE.Group(), k = chick ? 0.5 : 1;
  if (chick) { root.add(mesh(m => { m.box(O, 0, 0.035, 0, 0.1, 0.07, 0.08, a); m.box(O, 0.05, 0.08, 0, 0.05, 0.05, 0.05, a); m.box(O, 0.08, 0.09, 0, 0.02, 0.01, 0.015, C('#f2a030')); m.box(O, 0, 0, 0, 0.02, 0.035, 0.04, C('#e8a030')); })); return { root, h: 0.15 }; }
  root.add(mesh(m => { m.box(O, 0, 0.12 * k, 0, 0.2 * k, 0.15 * k, 0.15 * k, a); m.box(O, -0.06 * k, 0.17 * k, 0, 0.06 * k, 0.04 * k, 0.16 * k, shade(a, 0.85)); if (!chick) { m.box(O, -0.11, 0.22, 0, 0.06, 0.14 + (rooster ? 0.1 : 0), 0.05, rooster ? C('#2a4a3a') : shade(a, 0.8)); if (rooster) m.box(O, -0.14, 0.3, 0, 0.05, 0.14, 0.04, C('#c84a1a')); } }));
  const head = piv(0.09 * k, 0.24 * k, 0, mesh(m => { m.box(O, 0.02 * k, 0, 0, 0.08 * k, 0.09 * k, 0.08 * k, rooster ? C('#d86a2a') : a); m.box(O, 0.075 * k, 0.03 * k, 0, 0.04 * k, 0.02 * k, 0.03 * k, C('#f2b030')); if (!chick) { m.box(O, 0.02, 0.09, 0, 0.06, 0.04 + (rooster ? 0.03 : 0), 0.02, C('#d8202a')); m.box(O, 0.06, -0.02, 0, 0.02, 0.04, 0.02, C('#d8202a')); } for (const s of [-1, 1]) m.box(O, 0.05 * k, 0.03 * k, s * 0.041 * k, 0.015, 0.015, 0.005, C('#1a1a1a')); }));
  const legA = piv(0, 0.07 * k, 0, mesh(m => m.box(O, 0, -0.07 * k, 0.04 * k, 0.02, 0.07 * k, 0.02, C('#e8a030'))));
  const legB = piv(0, 0.07 * k, 0, mesh(m => m.box(O, 0, -0.07 * k, -0.04 * k, 0.02, 0.07 * k, 0.02, C('#e8a030'))));
  root.add(head, legA, legB); return { root, head, legA, legB, h: 0.3 * k };
}
function bird(c1, c2, s = 1) {
  const a = C(c1), b = C(c2), root = new THREE.Group();
  root.add(mesh(m => { m.box(O, 0, 0.05 * s, 0, 0.14 * s, 0.08 * s, 0.08 * s, a); m.box(O, -0.09 * s, 0.07 * s, 0, 0.07 * s, 0.02 * s, 0.06 * s, shade(a, 0.7)); m.box(O, 0.08 * s, 0.1 * s, 0, 0.07 * s, 0.07 * s, 0.065 * s, b); m.box(O, 0.12 * s, 0.11 * s, 0, 0.03 * s, 0.015 * s, 0.02 * s, C('#3a3a3a')); m.box(O, 0.065 * s, 0.075 * s, 0, 0.04 * s, 0.03 * s, 0.07 * s, C('#6aa8a0')); }));
  const wingL = piv(0, 0.09 * s, 0.04 * s, mesh(m => m.box(O, -0.01 * s, -0.01 * s, 0.07 * s, 0.1 * s, 0.015 * s, 0.14 * s, shade(a, 0.85))));
  const wingR = piv(0, 0.09 * s, -0.04 * s, mesh(m => m.box(O, -0.01 * s, -0.01 * s, -0.07 * s, 0.1 * s, 0.015 * s, 0.14 * s, shade(a, 0.85))));
  root.add(wingL, wingR); return { root, wingL, wingR, h: 0.15 };
}
function duck(c1) {
  const a = C(c1), root = new THREE.Group();
  root.add(mesh(m => { m.box(O, 0, 0, 0, 0.26, 0.12, 0.15, a); m.box(O, -0.12, 0.05, 0, 0.06, 0.06, 0.1, shade(a, 0.9)); }));
  const head = piv(0.1, 0.1, 0, mesh(m => { m.box(O, 0.02, 0, 0, 0.07, 0.1, 0.07, c1 === '#f4f4f0' ? a : C('#2a6a3a')); m.box(O, 0.075, 0.03, 0, 0.06, 0.02, 0.04, C('#f2a02a')); for (const s of [-1, 1]) m.box(O, 0.045, 0.065, s * 0.036, 0.015, 0.015, 0.005, C('#1a1a1a')); }));
  root.add(head); return { root, head, h: 0.2 };
}
function fish(c1, c2, s = 1) {
  const root = new THREE.Group(), a = C(c1), b = C(c2);
  const body = mesh(m => { m.box(O, 0, -0.04 * s, 0, 0.22 * s, 0.08 * s, 0.06 * s, a); m.box(O, 0.05 * s, -0.035 * s, 0, 0.08 * s, 0.06 * s, 0.062 * s, b); m.box(O, 0, 0.04 * s, 0, 0.08 * s, 0.03 * s, 0.01 * s, a); });
  const tail = piv(-0.11 * s, 0, 0, mesh(m => m.box(O, -0.04 * s, -0.05 * s, 0, 0.08 * s, 0.1 * s, 0.01 * s, b)));
  body.castShadow = false; tail.children[0].castShadow = false;
  root.add(body, tail); return { root, tail, h: 0.1 };
}
function cow(goat) {
  const k = goat ? 0.55 : 1, a = C(goat ? '#8a6a4a' : '#f2f0e8'), sp = C(goat ? '#f2f0e8' : '#2a2a2a'), root = new THREE.Group();
  root.add(mesh(m => { m.box(O, 0, 0.55 * k, 0, 1.0 * k, 0.45 * k, 0.45 * k, a); for (let i = 0; i < 4; i++) m.box(O, -0.3 * k + i * 0.22 * k + (i % 2) * 0.05, 0.65 * k + (i % 2) * 0.12 * k, (i % 2 ? 1 : -1) * 0.2 * k, 0.2 * k, 0.16 * k, 0.07 * k, sp); if (!goat) m.box(O, -0.3, 0.48, 0, 0.16, 0.08, 0.16, C('#f2a0a8')); }));
  const head = piv(0.5 * k, 0.85 * k, 0, mesh(m => { m.box(O, 0.12 * k, -0.18 * k, 0, 0.26 * k, 0.28 * k, 0.26 * k, a); m.box(O, 0.27 * k, -0.18 * k, 0, 0.08 * k, 0.12 * k, 0.22 * k, goat ? shade(a, 0.8) : C('#e8a0a0')); for (const s of [-1, 1]) { m.box(O, 0.06 * k, 0.1 * k, s * 0.1 * k, 0.04 * k, 0.1 * k, 0.04 * k, C('#e8e0c8')); m.box(O, 0.04 * k, 0.0, s * 0.17 * k, 0.06 * k, 0.05 * k, 0.1 * k, a); m.box(O, 0.2 * k, -0.02 * k, s * 0.131 * k, 0.04 * k, 0.04 * k, 0.005, C('#1a1a1a')); } if (goat) m.box(O, 0.24 * k, -0.3 * k, 0, 0.04 * k, 0.12 * k, 0.04 * k, C('#e8e0c8')); }));
  const legA = piv(0, 0.4 * k, 0, mesh(m => { m.box(O, 0.38 * k, -0.4 * k, 0.15 * k, 0.12 * k, 0.4 * k, 0.12 * k, a); m.box(O, -0.38 * k, -0.4 * k, -0.15 * k, 0.12 * k, 0.4 * k, 0.12 * k, a); m.box(O, 0.38 * k, -0.4 * k, 0.15 * k, 0.13 * k, 0.06 * k, 0.13 * k, C('#3a2a1a')); m.box(O, -0.38 * k, -0.4 * k, -0.15 * k, 0.13 * k, 0.06 * k, 0.13 * k, C('#3a2a1a')); }));
  const legB = piv(0, 0.4 * k, 0, mesh(m => { m.box(O, 0.38 * k, -0.4 * k, -0.15 * k, 0.12 * k, 0.4 * k, 0.12 * k, a); m.box(O, -0.38 * k, -0.4 * k, 0.15 * k, 0.12 * k, 0.4 * k, 0.12 * k, a); m.box(O, 0.38 * k, -0.4 * k, -0.15 * k, 0.13 * k, 0.06 * k, 0.13 * k, C('#3a2a1a')); m.box(O, -0.38 * k, -0.4 * k, 0.15 * k, 0.13 * k, 0.06 * k, 0.13 * k, C('#3a2a1a')); }));
  const tail = piv(-0.5 * k, 0.9 * k, 0, mesh(m => { m.box(O, -0.02 * k, -0.45 * k, 0, 0.04 * k, 0.45 * k, 0.04 * k, a); m.box(O, -0.02 * k, -0.52 * k, 0, 0.07 * k, 0.1 * k, 0.07 * k, C('#2a2a2a')); }));
  root.add(head, legA, legB, tail); return { root, head, legA, legB, tail, h: 1.2 * k };
}

// burung terbang: satu mesh, dua bentuk sayap (atas/bawah) ditukar bergantian -> 1 draw call per burung
const FLY = [0.7, -0.5].map(wa => { const m = new Merger(), a = C('#3a2a20'), s = 1.4; m.box(O, 0, 0, 0, 0.16 * s, 0.07 * s, 0.07 * s, a); m.box(O, 0.09 * s, 0.02 * s, 0, 0.06 * s, 0.06 * s, 0.06 * s, shade(a, 1.2)); m.box(O, -0.1 * s, 0.02 * s, 0, 0.08 * s, 0.015 * s, 0.08 * s, shade(a, 0.8));
  for (const sd of [-1, 1]) m.box({ x: 0, z: sd * 0.035 * s, a: 0 }, 0, 0.04 * s + Math.sin(wa) * 0.07 * s, sd * 0.08 * s, 0.09 * s, 0.015 * s, 0.16 * s, shade(a, 0.9));
  return m.build(); });
const LINES = {
  kucing: ['Meong~', 'Mrrr...', 'Meooong!', 'Prrr prrr'], anjing: ['Guk! Guk!', 'Hehehe (ngos-ngosan)', 'Auuu~', 'Guk!'],
  ayam: ['Petok petok!', 'Kok kok...'], jago: ['Kukuruyuuuk!'], sapi: ['Mooo...', 'Mbooo~'], kambing: ['Mbeeek!', 'Embek...'], bebek: ['Kwek kwek!'],
};

export function makeAnimals({ scene, kota, collision, player, toast }) {
  const M = kota.M, list = [], flocks = [];
  const okGround = (x, z, r = 0.25) => { const p = collision.resolve({ x, z }, r); return Math.hypot(p.x - x, p.z - z) < 0.02 && !collision.blockedMask(x, z) && !M.waterAt(x, z); };
  const near = (x, z, r0, r1, test, seed) => { for (let i = 0; i < 40; i++) { const a = hash(seed, i) * 6.283, r = r0 + hash(seed, i + 99) * (r1 - r0), px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (test(px, pz)) return { x: px, z: pz }; } return null; };
  function add(kind, model, x, z, o = {}) {
    const A = { kind, ...model, x, z, hx: x, hz: z, heading: hash(Math.round(x * 13), Math.round(z * 7)) * 6.28, st: 'idle', t: Math.random() * 3, ph: Math.random() * 6, tx: x, tz: z, speed: o.speed || 0.6, roam: o.roam ?? 3, shy: o.shy, say: null, sayT: 0, name: o.name, ...o };
    if (!o.water) model.root.children[0].castShadow = true;
    model.root.position.set(x, o.y || 0, z); scene.add(model.root); list.push(A); return A;
  }

  /* --- penempatan */
  const houses = kota.houses.filter(h => !h.special && (h.type[0] === 'K' || h.type[0] === 'P' || h.region === 'bantaran')), byReg = r => houses.filter(h => h.region === r);
  const front = (h, off = 0.9) => { const [x, z] = L(h.xf, (hash(h.seed, 3) - 0.5) * h.w * 0.6, h.d / 2 + off); return { x, z }; };
  const CATS = [['#e8902a', '#f6e2c0', true], ['#3a3a3a', '#f2f2f2', false], ['#f2f0e8', '#f2f0e8', false], ['#8a8a8a', '#d8d8d8', true], ['#e8902a', '#f2f2f2', false], ['#5a4030', '#d8b890', true]];
  // si Oyen, kucing oren di teras Om Darto
  if (kota.darto) { const [x, z] = L(kota.darto.xf, 1.0, kota.darto.d / 2 + 1.2); add('kucing', cat('#e8902a', '#f6e2c0', true), x, z, { name: 'Si Oyen', roam: 1.5, shy: 2 }); }
  [...byReg('kampung').filter((h, i) => i % 5 === 1), ...byReg('bantaran').filter((h, i) => i % 6 === 2), ...byReg('pusat').filter((h, i) => i % 9 === 4)].slice(0, 11).forEach((h, i) => {
    const p = front(h, 1.7); if (!okGround(p.x, p.z)) return; const c = CATS[i % CATS.length]; add('kucing', cat(...c), p.x, p.z, { roam: 3, shy: 3 });
  });
  const DOGS = [['#c8a070', '#f2e8d0'], ['#2a2a2a', '#c8a070'], ['#f2f0e8', '#f2f0e8'], ['#8a5a3a', '#e8d0b0']];
  [...byReg('kampung').filter((h, i) => i % 7 === 3), ...byReg('perum').filter((h, i) => i % 5 === 2), ...byReg('bantaran').filter((h, i) => i % 7 === 4)].slice(0, 8).forEach((h, i) => {
    const p = front(h, 1.4); if (!okGround(p.x, p.z, 0.3)) return; add('anjing', dog(...DOGS[i % DOGS.length]), p.x, p.z, { roam: 4, speed: 0.9 });
  });
  // ayam kampung: induk, jago, anak-anak ayam di halaman rumah kampung
  byReg('kampung').filter((h, i) => i % 6 === 0).slice(0, 6).forEach((h, i) => {
    const c = front(h, 1.6); if (!okGround(c.x, c.z)) return;
    const hen = add('ayam', chicken(['#c88a4a', '#f2f0e8', '#8a4a2a'][i % 3]), c.x, c.z, { roam: 2.5, shy: 2, speed: 0.5 });
    if (i % 2 === 0) { const p = near(c.x, c.z, 0.6, 1.4, (x, z) => okGround(x, z), i + 5); if (p) add('jago', chicken('#e8e0d0', true), p.x, p.z, { roam: 2.5, shy: 2, speed: 0.5 }); }
    for (let k = 0; k < 2; k++) { const p = near(c.x, c.z, 0.3, 0.8, (x, z) => okGround(x, z, 0.1), i * 7 + k); if (p) add('anakAyam', chicken('#f2d84a', false, true), p.x, p.z, { roam: 0.6, follow: hen, shy: 2, speed: 0.55 }); }
  });
  // merpati di pelataran masjid, stasiun, depan pasar, alun-alun
  for (const [ax, az] of [[146, 66], [19, 61], [110, 96], [127, 40], [178, 101]]) for (let k = 0; k < 6; k++) {
    const p = near(ax, az, 0.5, 4, (x, z) => okGround(x, z, 0.1) && M.roadDist(x, z) > 0.3, ax * 13 + k); if (!p) continue;
    const b = bird(['#8a8e98', '#a8acb4', '#f2f2f0', '#6a6e78'][k % 4], '#6a6e78'); add('merpati', b, p.x, p.z, { roam: 2, shy: 4, speed: 0.4, hop: true });
  }
  // burung terbang berkelompok di langit (pipit / walet)
  for (let f = 0; f < 4; f++) { const cx = 40 + f * 55, cz = 50 + (f % 2) * 70, F = { cx, cz, r: 14 + f * 3, y: 9 + f, sp: 0.18 + f * 0.03, birds: [] };
    for (let k = 0; k < 6; k++) { const me = new THREE.Mesh(FLY[0], MAT.world); scene.add(me); F.birds.push({ root: me, off: k * 0.12, dy: (k % 3) * 0.5, dr: (k % 2) * 1.2 }); }
    flocks.push(F); }
  // bebek di kali dekat bantaran
  const waterPts = [];
  for (const f of kota.places?.fish || []) waterPts.push(f);
  for (const h of byReg('bantaran').filter((h, i) => i % 8 === 1).slice(0, 3)) { const p = near(h.xf.x, h.xf.z, 3, 10, (x, z) => M.waterAt(x, z) && M.waterAt(x + 0.6, z) && M.waterAt(x - 0.6, z) && M.waterAt(x, z + 0.6) && M.waterAt(x, z - 0.6), h.seed); if (p) for (let k = 0; k < 4; k++) add('bebek', duck(k % 3 ? '#f4f4f0' : '#8a6a4a'), p.x + k * 0.4, p.z + (k % 2) * 0.3, { y: SURF + 0.02, water: true, roam: 2.5, speed: 0.35 }); }
  // ikan di kolam pancing & sungai (kelihatan di bawah permukaan, sesekali loncat)
  const FISHC = [['#e8702a', '#f4f4f0'], ['#f4f4f0', '#e83a2a'], ['#8a8e88', '#c8ccc0'], ['#f2c230', '#e8702a'], ['#5a6a5a', '#a8b0a0']];
  const fishSpots = [...(kota.places?.fish || []).map(f => ({ x: f.x + Math.cos(f.h) * 1.4, z: f.z + Math.sin(f.h) * 1.4 })), ...(kota.places?.raft ? [kota.places.raft.a, kota.places.raft.b] : [])];
  fishSpots.forEach((s, i) => { const p = near(s.x, s.z, 0, 2, (x, z) => M.waterAt(x, z) && M.waterAt(x + 0.4, z + 0.4) && M.waterAt(x - 0.4, z - 0.4), i * 31 + 7); if (!p) return; for (let k = 0; k < 3; k++) add('ikan', fish(...FISHC[(i + k) % FISHC.length], 1.2 + (k % 2) * 0.4), p.x, p.z, { y: SURF - 0.12, water: true, roam: 1.6, speed: 0.4 + k * 0.1 }); });
  // sapi & kambing di kandang
  for (const c of kota.places?.cows || []) add('sapi', cow(false), c.x, c.z, { heading: c.h, roam: 0.6, speed: 0.25, pen: c.pen });
  if (kota.places?.cows?.length) { const c = kota.places.cows[1] || kota.places.cows[0], q = L(c.pen.xf, 0.5, c.pen.d / 2 + 2.6), p = near(q[0], q[1], 0, 2, (x, z) => okGround(x, z, 0.5), 17); if (p) add('sapi', cow(false), p.x, p.z, { roam: 2, speed: 0.25 }); }
  if (kota.places?.cows?.length) { const c = kota.places.cows[0], q = L(c.pen.xf, c.pen.w / 2 + 2.2, 1.6); for (let k = 0; k < 3; k++) { const p = near(q[0], q[1], 0, 1.5, (x, z) => okGround(x, z, 0.25), k + 3); if (p) add('kambing', cow(true), p.x, p.z, { roam: 1.5, speed: 0.4, shy: 1.5 }); } }

  /* --- perilaku */
  const say = (A, t) => { A.say = t; A.sayT = 2.2; };
  function step(A, dt) {
    const dx = player.x - A.x, dz = player.z - A.z, dp = Math.hypot(dx, dz), run = Math.hypot(player.vx || 0, player.vz || 0) > 3.2;
    A.t -= dt; A.ph += dt; if (A.sayT > 0 && (A.sayT -= dt) <= 0) A.say = null;
    // takut: pemain lari mendekat = kabur
    if (A.shy && dp < A.shy && (run || A.kind === 'merpati' && dp < 1.6) && player.area === 'kota' && A.st !== 'flee' && A.st !== 'fly') {
      if (A.hop) { A.st = 'fly'; A.t = 3 + Math.random() * 3; A.vy = 2.2; A.fh = Math.atan2(-dz, -dx) + (Math.random() - 0.5); }
      else { A.st = 'flee'; A.t = 1.5; A.fh = Math.atan2(-dz, -dx); if (A.kind === 'kucing') say(A, 'Hssss!'); else if (A.kind.includes('ayam') || A.kind === 'jago') say(A, 'Petok petok petooook!'); }
    }
    if (A.kind === 'anjing' && run && dp < 4 && !A.say && Math.random() < dt) say(A, 'Guk! Guk! Guk!');
    let move = 0, mx = 0, mz = 0;
    if (A.st === 'flee') { mx = Math.cos(A.fh); mz = Math.sin(A.fh); move = A.speed * 4; if (A.t <= 0) { A.st = 'idle'; A.t = 2; } }
    else if (A.st === 'fly') {   // merpati terbang menjauh lalu turun lagi
      A.y = (A.y || 0) + A.vy * dt; A.vy = A.t > 1.2 ? Math.min(2.2, A.vy + dt) : -1.6;
      if (A.y < 0) { A.y = 0; A.st = 'idle'; A.t = 2; }
      mx = Math.cos(A.fh); mz = Math.sin(A.fh); move = 2.4;
      const nx = A.x + mx * move * dt, nz = A.z + mz * move * dt; if (A.y > 0.5 || okGround(nx, nz, 0.08)) { A.x = nx; A.z = nz; } A.heading = A.fh;
      A.root.position.set(A.x, A.y, A.z); A.root.rotation.y = -A.heading;
      const f = Math.sin(A.ph * 22) * 0.9; A.wingL.rotation.x = -f; A.wingR.rotation.x = f; return;
    } else if (A.st === 'walk') {
      const tx = A.tx - A.x, tz = A.tz - A.z, d = Math.hypot(tx, tz);
      if (d < 0.08 || A.t <= 0) { A.st = 'idle'; A.t = 1.5 + Math.random() * 5; A.pose = pickPose(A); }
      else { mx = tx / d; mz = tz / d; move = A.speed; }
    } else if (A.t <= 0) {   // idle selesai -> jalan ke titik acak sekitar rumah (anak ayam ikut induk)
      const hx = A.follow ? A.follow.x : A.hx, hz = A.follow ? A.follow.z : A.hz, a = Math.random() * 6.283, r = Math.random() * A.roam;
      A.tx = hx + Math.cos(a) * r; A.tz = hz + Math.sin(a) * r; A.st = 'walk'; A.t = 6; A.pose = null;
      if (A.pen) { const q = A.pen, c = Math.cos(-q.xf.a), s = Math.sin(-q.xf.a), lx = (A.tx - q.xf.x) * c - (A.tz - q.xf.z) * s, lz = (A.tx - q.xf.x) * s + (A.tz - q.xf.z) * c; if (Math.abs(lx) > q.w / 2 - 0.6 || Math.abs(lz) > q.d / 2 - 0.5) { A.tx = A.hx; A.tz = A.hz; } }
      if (Math.random() < 0.15 && dp < 10) say(A, (LINES[A.kind] || [''])[Math.floor(Math.random() * (LINES[A.kind] || ['']).length)]);
    }
    if (move) {
      let nx = A.x + mx * move * dt, nz = A.z + mz * move * dt;
      if (A.water) { if (!M.waterAt(nx, nz) || !M.waterAt(nx + mx * 0.3, nz + mz * 0.3)) { A.st = 'idle'; A.t = 1; nx = A.x; nz = A.z; } }
      else { const p = collision.move(A, nx, nz, A.kind === 'sapi' ? 0.35 : 0.14); nx = p.x; nz = p.z; if (M.waterAt(nx, nz)) { nx = A.x; nz = A.z; A.st = 'idle'; A.t = 1; } }
      const want = Math.atan2(mz, mx); let dd = want - A.heading; dd = Math.atan2(Math.sin(dd), Math.cos(dd)); A.heading += dd * Math.min(1, dt * 8);
      A.x = nx; A.z = nz;
    }
    // pose & animasi bagian tubuh
    const w = move ? Math.sin(A.ph * (A.kind === 'sapi' || A.kind === 'kambing' ? 5 : 12) * Math.min(2, move / A.speed)) : 0, by = A.water ? Math.sin(A.ph * 2) * 0.01 : 0;
    let ry = 0, rz = 0, y = A.y || 0, headX = 0, headZ = 0;
    if (A.legA) { A.legA.rotation.z = w * 0.6; A.legB.rotation.z = -w * 0.6; }
    const P = !move && A.pose;
    if (A.kind === 'kucing') { if (P === 'sit') { rz = 0.45; A.legB.rotation.z = -0.9; y -= 0.03; } else if (P === 'lie') { y -= 0.1; A.legA.rotation.z = 1.4; A.legB.rotation.z = -1.4; } else if (P === 'groom') headZ = -0.4 + Math.sin(A.ph * 6) * 0.15; if (A.tail) A.tail.rotation.x = Math.sin(A.ph * 1.5) * 0.4; }
    if (A.kind === 'anjing') { if (P === 'sit') { rz = 0.4; A.legB.rotation.z = -1.0; y -= 0.06; } else if (P === 'lie') { y -= 0.17; A.legA.rotation.z = 1.4; A.legB.rotation.z = -1.4; } A.tail.rotation.x = Math.sin(A.ph * (dp < 3 ? 18 : 4)) * 0.6; if (dp < 3 && !move) A.heading += Math.atan2(Math.sin(Math.atan2(dz, dx) - A.heading), Math.cos(Math.atan2(dz, dx) - A.heading)) * Math.min(1, dt * 3); }
    if (A.kind === 'ayam' || A.kind === 'jago' || A.kind === 'anakAyam') { if (P === 'peck') headZ = -Math.max(0, Math.sin(A.ph * 7)) * 1.1; if (move) y += Math.abs(w) * 0.01; }
    if (A.kind === 'merpati') { if (!move && Math.sin(A.ph * 3) > 0.6) rz = -0.4; A.wingL.rotation.x = 0; A.wingR.rotation.x = 0; if (move) y += Math.abs(Math.sin(A.ph * 14)) * 0.04; }
    if (A.kind === 'sapi' || A.kind === 'kambing') { if (P === 'graze' || A.pose === 'graze') headZ = -0.7 + Math.sin(A.ph * 2) * 0.05; A.tail.rotation.x = Math.sin(A.ph * 2.2) * 0.35; }
    if (A.kind === 'bebek') { headZ = Math.sin(A.ph * 1.3) > 0.85 ? -1.2 : 0; }
    if (A.kind === 'ikan') { A.tail.rotation.y = Math.sin(A.ph * 10) * 0.5; ry = Math.sin(A.ph * 5) * 0.15; if (A.jump > 0) { A.jump -= dt; y = SURF - 0.12 + Math.sin((1 - A.jump / 0.6) * Math.PI) * 0.45; rz = Math.cos((1 - A.jump / 0.6) * Math.PI) * 0.8; } else if (Math.random() < dt * 0.02) A.jump = 0.6; }
    if (A.head) { A.head.rotation.z = headZ; A.head.rotation.y = headX; }
    A.root.position.set(A.x, y + by, A.z); A.root.rotation.set(0, -A.heading + ry, rz, 'YXZ');
  }
  function pickPose(A) {
    const r = Math.random();
    if (A.kind === 'kucing') return r < 0.35 ? 'sit' : r < 0.6 ? 'lie' : r < 0.8 ? 'groom' : null;
    if (A.kind === 'anjing') return r < 0.4 ? 'sit' : r < 0.65 ? 'lie' : null;
    if (A.kind.includes('yam') || A.kind === 'jago') return r < 0.7 ? 'peck' : null;
    if (A.kind === 'sapi' || A.kind === 'kambing') return r < 0.7 ? 'graze' : null;
    return null;
  }
  for (const A of list) A.pose = pickPose(A);

  return {
    list,
    update(dt) {
      const out = player.area !== 'kota';
      for (const A of list) { const R = A.kind === 'sapi' ? 32 : 22, far = out || Math.abs(A.x - player.x) > R || Math.abs(A.z - player.z) > R; A.root.visible = !far; if (!far) step(A, dt); }
      for (const F of flocks) { const vis = !out && Math.hypot(F.cx - player.x, F.cz - player.z) < 70; for (const b of F.birds) { b.root.visible = vis; if (!vis) continue; F.t = (F.t || 0) + dt / F.birds.length; const a = F.t * F.sp + b.off, r = F.r + b.dr; b.root.position.set(F.cx + Math.cos(a) * r, F.y + b.dy + Math.sin(a * 3 + b.off) * 0.6, F.cz + Math.sin(a) * r); b.root.rotation.y = -(a + Math.PI / 2); b.root.geometry = FLY[Math.sin(F.t * 30 + b.off * 40) > 0 ? 0 : 1]; } }
    },
    // Aksi: elus kucing / anjing, kasih makan ayam
    target() {
      if (player.riding || player.area !== 'kota') return null;
      let best = null, bd = 1.0;
      for (const A of list) { if (!['kucing', 'anjing', 'sapi', 'kambing'].includes(A.kind) || A.st === 'flee') continue; const d = Math.hypot(A.x - player.x, A.z - player.z); if (d < bd) { bd = d; best = A; } }
      if (!best) return null;
      const nm = best.name || { kucing: 'kucing', anjing: 'anjing', sapi: 'sapi', kambing: 'kambing' }[best.kind];
      return { kind: 'act', label: 'Elus ' + nm, fn: () => { best.st = 'idle'; best.t = 4; best.pose = best.kind === 'kucing' ? 'sit' : best.pose; best.heading = Math.atan2(player.z - best.z, player.x - best.x); say(best, { kucing: 'Prrr... prrr...', anjing: 'Guk! (ekor goyang)', sapi: 'Mooo~', kambing: 'Mbeeek!' }[best.kind]); player.emote = 'squat'; player.heading = Math.atan2(best.z - player.z, best.x - player.x); } };
    },
    bubbles() { return list.filter(A => A.say && A.root.visible).map(A => ({ key: 'an' + list.indexOf(A), x: A.x, y: (A.y || 0) + A.h + 0.35, z: A.z, text: A.say })); },
  };
}
