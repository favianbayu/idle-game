// Gerobak jajanan keliling (bakso, siomay, es cendol, gorengan, martabak, cilok, sate) yang mangkal di pinggir jalan dekat
// tempat ramai, masing-masing dengan pedagangnya, dagangan yang kelihatan di etalase, dan menu belanja. Plus gerobak Warkop
// Simpang Om Darto: bantu jualan = dapat uang jajan.
import * as THREE from 'three';
import { Merger, col, shade, mix } from './geom.js';
import { MAT, hash, pick } from './common.js';
import { L } from './buildings.js';
import { CATALOG } from './shop.js';

const C = c => col(c);
const KINDS = [
  { id: 'bakso', title: 'Bakso Mas Bejo', sign: ['BAKSO', 'Mas Bejo'], body: '#2a6ac0', roof: '#d8302a', sid: 'tukangBakso', name: 'Mas Bejo', lines: ['Bakso, baksoo! Tok tok tok!', 'Pakai mi kuning apa bihun?', 'Sambalnya ambil sendiri, Mas.'] },
  { id: 'siomay', title: 'Siomay Kang Dadang', sign: ['SIOMAY', 'BATAGOR'], body: '#3a8a4a', roof: '#f2c230', sid: 'pemuda', name: 'Kang Dadang', lines: ['Siomay komplit, pakai pare?', 'Bumbu kacangnya dibanyakin ya.'] },
  { id: 'cendol', title: 'Es Cendol Bu Tini', sign: ['ES CENDOL', 'ES DOGER'], body: '#e8e4d0', roof: '#3a9a5a', sid: 'ibuHijab', name: 'Bu Tini', lines: ['Es cendol seger, Nak!', 'Gula arennya asli lho.'] },
  { id: 'gorengan', title: 'Gorengan Pak Udin', sign: ['GORENGAN', 'seribuan'], body: '#c8843a', roof: '#2a6ac0', sid: 'kakek', name: 'Pak Udin', lines: ['Masih anget, baru diangkat!', 'Cabe rawitnya gratis.'] },
  { id: 'martabak', title: 'Martabak Bang Ucup', sign: ['MARTABAK', 'manis • telor'], body: '#d8302a', roof: '#f2c230', sid: 'pemuda', name: 'Bang Ucup', lines: ['Martabak manis, toppingnya bebas!', 'Telornya dua apa tiga?'] },
  { id: 'cilok', title: 'Cilok Teh Euis', sign: ['CILOK', 'CIMOL'], body: '#f2c230', roof: '#d8302a', sid: 'mbak', name: 'Teh Euis', lines: ['Cilok, cilok! Lima ribuan!', 'Pedes apa sedeng?'] },
  { id: 'sate', title: 'Sate Pak Kumis', sign: ['SATE AYAM', 'Madura'], body: '#6a4428', roof: '#e8e4d0', sid: 'bapakPeci', name: 'Pak Kumis', lines: ['Sate, sateee!', 'Bumbunya kacang apa kecap?'] },
];
// gerobak putaran kedua (jenis sama) dijaga pedagang lain, supaya tidak ada dua Kang Dadang
const ALT = { bakso: { title: 'Bakso Cak Anwar', sign: ['BAKSO', 'Cak Anwar'], name: 'Cak Anwar' }, siomay: { title: 'Siomay Kang Ujang', name: 'Kang Ujang' },
  cendol: { title: 'Es Cendol Mang Oleh', name: 'Mang Oleh', sid: 'bapakPeci' }, gorengan: { title: 'Gorengan Bu Painem', name: 'Bu Painem', sid: 'ibuDaster' },
  martabak: { title: 'Martabak Bang Toyib', name: 'Bang Toyib' }, cilok: { title: 'Cilok Teh Neneng', name: 'Teh Neneng' }, sate: { title: 'Sate Cak Rokib', name: 'Cak Rokib' } };
// tempat mangkal: dekat keramaian (pasar, gerbang SMA, stasiun, terminal, GOR, plaza, masjid, lapangan bola, taman)
const ANCHORS = [[98, 92], [133, 62], [19, 58], [246, 98], [168, 44], [178, 98], [146, 64], [88, 104], [127, 46], [150, 82], [60, 86], [200, 120]];

function signTex(lines, bg, fg) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 96;
  const g = cv.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 256, 96); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 44px Trebuchet MS, sans-serif'; g.fillText(lines[0], 128, 36); g.font = 'bold 22px Trebuchet MS, sans-serif'; g.fillText(lines[1] || '', 128, 76);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t;
}

export function makeJajan({ scene, kota, collision, player, Character, npcs, shop, acts, toast }) {
  const M = kota.M, mg = new Merger(), carts = [];
  const free = (x, z, r) => { const p = collision.resolve({ x, z }, r); return Math.hypot(p.x - x, p.z - z) < 0.02 && !collision.blockedMask(x, z) && !M.waterAt(x, z) && !acts.poolAt(x, z); };
  const inSpecial = (x, z) => Object.values(kota.specials || {}).some(b => { const c = Math.cos(-b.a), sn = Math.sin(-b.a), dx = x - b.x, dz = z - b.y; const m = b === kota.specials.sma ? 8 : 1.2; return Math.abs(dx * c - dz * sn) < b.w / 2 + m && Math.abs(dx * sn + dz * c) < b.h / 2 + m; });   // sekolah: jangan mangkal persis di depan gerbang/pagar
  const nearHouse = (x, z) => (kota.houses || []).some(h => { if (Math.abs(h.xf.x - x) > 12 || Math.abs(h.xf.z - z) > 12) return false; const c = Math.cos(-h.xf.a), sn = Math.sin(-h.xf.a), dx = x - h.xf.x, dz = z - h.xf.z; return Math.abs(dx * c - dz * sn) < h.w / 2 + 1.3 && Math.abs(dx * sn + dz * c) < h.d / 2 + (h.setback || 0) + 1.3; });   // jangan menempel papan/parkiran/teras
  const doorNear = (x, z) => (kota.places?.doors || []).some(d => Math.hypot(d.x - x, d.z - z) < 3);
  function spotNear(ax, az) {
    for (let r = 2; r < 12; r += 0.7) for (let k = 0; k < 16; k++) {
      const a = k / 16 * Math.PI * 2 + r, x = ax + Math.cos(a) * r, z = az + Math.sin(a) * r, rd = M.roadDist(x, z);
      if (rd < 0.95 || rd > 1.7 || !free(x, z, 0.9) || doorNear(x, z) || inSpecial(x, z) || nearHouse(x, z) || (kota.standSigns || []).some(t => Math.hypot(t.x - x, t.z - z) < 3.5) || (kota.trees || []).some(t => Math.hypot(t.x - x, t.z - z) < 2.6) || carts.some(c => Math.hypot(c.x - x, c.z - z) < 8)) continue;
      const e = 0.3, gx = M.roadDist(x + e, z) - M.roadDist(x - e, z), gz = M.roadDist(x, z + e) - M.roadDist(x, z - e);
      if (Math.hypot(gx, gz) < 1e-3) continue;
      const fa = Math.atan2(-gz, -gx);   // arah ke jalan
      const bx = x - Math.cos(fa) * 0.9, bz = z - Math.sin(fa) * 0.9;   // tempat pedagang berdiri (di belakang gerobak)
      if (!free(bx, bz, 0.3)) continue;
      return { x, z, fa, bx, bz };
    }
    return null;
  }
  // gerobak: lokal depan (+z) menghadap jalan
  function cart(K, s) {
    const xf = { x: s.x, z: s.z, a: s.fa - Math.PI / 2 }, b = C(K.body), wood = C('#7a5030'), glass = mix(C('#c8e0f0'), C('#ffffff'), 0.45), steel = C('#b8bcc0');
    mg.box(xf, 0, 0.35, 0, 1.4, 0.55, 0.62, b); mg.box(xf, 0, 0.9, 0, 1.44, 0.04, 0.66, shade(b, 0.8));
    mg.box(xf, 0.15, 0.94, 0.02, 1.0, 0.46, 0.5, glass, { top: mix(glass, C('#ffffff'), 0.3) });
    for (const sx of [-1, 1]) { mg.box(xf, sx * 0.55, 0, 0.36, 0.06, 0.62, 0.06, C('#2a2a2a')); mg.box(xf, sx * 0.55, 0.08, 0.36, 0.5, 0.5, 0.04, C('#1a1a1a')); mg.box(xf, sx * 0.55, 0.28, 0.38, 0.1, 0.1, 0.03, steel); }   // roda sepeda
    mg.box(xf, -0.8, 0.5, 0, 0.3, 0.05, 0.05, wood); mg.box(xf, -0.95, 0.5, 0, 0.05, 0.05, 0.5, wood);   // pegangan dorong
    mg.box(xf, 0.62, 0, -0.2, 0.05, 0.35, 0.05, C('#2a2a2a'));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) mg.box(xf, sx * 0.66, 0.9, sz * 0.3, 0.04, 1.0, 0.04, steel);   // tiang atap
    const r = C(K.roof); for (let i = 0; i < 6; i++) mg.box(xf, -0.75 + i * 0.25 + 0.125, 1.9, 0, 0.25, 0.05, 0.86, i % 2 ? r : C('#f4f4f0'));   // atap terpal belang
    mg.box(xf, 0, 1.8, 0.43, 1.5, 0.12, 0.02, r);
    // dagangan khas
    const g = (lx, y, lz, sx, sy, sz, c) => mg.box(xf, lx, y, lz, sx, sy, sz, C(c));
    if (K.id === 'bakso') { g(-0.35, 0.94, 0, 0.36, 0.42, 0.36, '#c8ccd0'); g(-0.35, 1.36, 0, 0.3, 0.04, 0.3, '#a8acb0'); g(-0.35, 1.4, 0, 0.08, 0.05, 0.08, '#2a2a2a'); for (let i = 0; i < 6; i++) g(0.0 + (i % 3) * 0.14, 0.95, -0.1 + Math.floor(i / 3) * 0.14, 0.1, 0.1, 0.1, '#9a7a5a'); for (let i = 0; i < 4; i++) g(0.5, 0.95 + i * 0.05, 0.1, 0.18, 0.04, 0.18, '#f4f4f0'); for (const c of ['#d8302a', '#5a2a1a', '#f2c230']) g(0.45 + Math.random() * 0, 0.95, -0.15, 0.06, 0.16, 0.06, c); }
    else if (K.id === 'siomay') { for (let i = 0; i < 3; i++) g(-0.35, 0.94 + i * 0.13, 0, 0.42, 0.12, 0.42, i % 2 ? '#c8a060' : '#b08850'); for (let i = 0; i < 6; i++) g(0.1 + (i % 3) * 0.13, 0.95, -0.08 + Math.floor(i / 3) * 0.14, 0.1, 0.07, 0.1, i % 2 ? '#e8d8b0' : '#d8a040'); }
    else if (K.id === 'cendol') { for (let i = 0; i < 3; i++) { g(-0.35 + i * 0.32, 0.94, 0, 0.26, 0.4, 0.26, '#d8ecf4'); g(-0.35 + i * 0.32, 0.96, 0, 0.22, 0.3, 0.22, ['#5ab85a', '#f28ab0', '#8a4a2a'][i]); } g(0.45, 0.94, 0.15, 0.22, 0.2, 0.22, '#e8e8f0'); }
    else if (K.id === 'gorengan') { g(-0.4, 0.94, 0, 0.42, 0.14, 0.42, '#3a3a3a'); for (let i = 0; i < 14; i++) g(0.0 + (i % 5) * 0.11, 0.95 + Math.floor(i / 5) * 0.05, -0.12 + (i % 3) * 0.1, 0.1, 0.05, 0.08, pick(['#d8a040', '#c88a30', '#e8c070', '#b87a28'], hash(i, 5))); }
    else if (K.id === 'martabak') { g(-0.3, 0.94, 0, 0.5, 0.06, 0.5, '#2a2a2a'); g(-0.3, 1.0, 0, 0.42, 0.04, 0.42, '#e8b040'); for (let i = 0; i < 3; i++) g(0.4, 0.94 + i * 0.08, 0, 0.32, 0.07, 0.32, '#f4f0e8'); for (const c of ['#5a2a1a', '#f2e2b0', '#e8302a']) g(0.05 + Math.random() * 0, 0.94, -0.15 + ['#5a2a1a', '#f2e2b0', '#e8302a'].indexOf(c) * 0.12, 0.1, 0.12, 0.1, c); }
    else if (K.id === 'cilok') { g(-0.3, 0.94, 0, 0.38, 0.36, 0.38, '#c8ccd0'); for (let i = 0; i < 8; i++) g(0.1 + (i % 4) * 0.1, 0.95, -0.06 + Math.floor(i / 4) * 0.12, 0.08, 0.08, 0.08, '#f2f0e8'); }
    else if (K.id === 'sate') { g(-0.2, 0.94, 0.05, 0.8, 0.16, 0.24, '#5a5a5a'); g(-0.2, 1.1, 0.05, 0.74, 0.03, 0.2, '#f26a1a'); for (let i = 0; i < 10; i++) g(-0.55 + i * 0.075, 1.13, 0.05, 0.03, 0.03, 0.32, '#a8582a'); g(0.5, 0.94, 0, 0.2, 0.2, 0.2, '#8a4a2a'); }
    // bangku plastik & meja kecil untuk pembeli
    const side = hash(Math.round(s.x * 3), Math.round(s.z * 3)) < 0.5 ? -1 : 1;
    for (let i = 0; i < 2; i++) { const lx = side * (1.1 + i * 0.45), c2 = pick(['#d8302a', '#2a6ac0', '#3a9a5a'], hash(i, Math.round(s.x))); mg.box(xf, lx, 0, 0.35, 0.3, 0.38, 0.3, shade(C(c2), 0.75)); mg.box(xf, lx, 0.38, 0.35, 0.34, 0.04, 0.34, C(c2)); }
    collision.box(s.x, s.z, 0.75, 0.38, xf.a);
    // papan nama di depan etalase
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.36), new THREE.MeshBasicMaterial({ map: signTex(K.sign, K.body === '#e8e4d0' ? '#3a9a5a' : K.body, '#ffffff') }));
    const [px, pz] = L(xf, 0.15, 0.36); sg.position.set(px, 1.17 + kota.heightAt(px, pz), pz); sg.rotation.y = -xf.a; scene.add(sg);
    const sg2 = sg.clone(); const [qx, qz] = L(xf, 0, 0.445); sg2.position.set(qx, 1.86 + kota.heightAt(qx, qz), qz); sg2.scale.set(1.5, 0.33, 1); scene.add(sg2);
  }
  const used = [];
  ANCHORS.forEach(([ax, az], i) => {
    const K0 = KINDS[carts.length % KINDS.length], K = carts.length >= KINDS.length ? { ...K0, ...ALT[K0.id] } : K0, s = spotNear(ax, az); if (!s) return;
    carts.push({ ...s, K }); used.push(K.id); cart(K, s);
    const c = new Character(K.sid); scene.add(c.group);
    npcs.push({ sid: K.sid, name: K.name, filler: true, lines: K.lines, c, home: { x: s.bx, z: s.bz }, x: s.bx, z: s.bz, tx: s.bx, tz: s.bz, wait: 3, heading: s.fa, say: null, greetT: Math.random() * 10, roam: 0.2, key: 'jj' + i, vendor: true });
  });
  const mesh = new THREE.Mesh(mg.build(), MAT.world); kota.lift(mesh); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);

  // Warkop Simpang (gerobak Om Darto): ngopi gratis & bantu jualan
  const D = kota.darto, wk = D && D.cart ? (([x, z]) => ({ x, z }))(L(D.xf, D.cart.lx, D.cart.lz + 0.9)) : null;
  let workT = -999, clock = 0;
  return {
    carts,
    update(dt) { clock += dt; },
    target() {
      if (player.riding || player.area !== 'kota') return null;
      for (const c of carts) if (Math.hypot(c.x + Math.cos(c.fa) * 0.7 - player.x, c.z + Math.sin(c.fa) * 0.7 - player.z) < 1.1)
        return { kind: 'act', label: 'Jajan: ' + c.K.title, fn: () => shop.open({ title: c.K.title, sub: 'Gerobak pinggir jalan', items: CATALOG[c.K.id], thanks: 'Makasih, Mas!' }) };
      if (wk && Math.hypot(wk.x - player.x, wk.z - player.z) < 1.4) {
        if (clock - workT > 60) return { kind: 'act', label: 'Bantu Om Darto jualan kopi (+Rp5.000)', fn: () => { workT = clock; acts.doAct('carry', 5, () => shop.earn(5000, 'Om Darto: "Nih, uang jajan."')); } };
        return { kind: 'act', label: 'Ngopi di Warkop Simpang', fn: () => shop.open({ title: 'Warkop Simpang', sub: 'Gratis buat keponakan sendiri', items: CATALOG.kopi, thanks: 'Diminum, jangan dibuang.' }) };
      }
      return null;
    },
  };
}
