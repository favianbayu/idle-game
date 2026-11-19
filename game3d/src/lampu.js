// Lampu malam: titik lampu (lampu jalan raya, PJU di tiang listrik kampung, lampu taman alun-alun, teras rumah, toko,
// lampu taman & koridor sekolah, teras rumah di wilayah luar) menyala dari senja sampai subuh.
// Murah untuk HP: genangan cahaya di tanah (1 InstancedMesh, aditif), cahaya bohlam (1 Points), beberapa PointLight
// sungguhan di lampu terdekat pemain (jumlah ikut setelan grafik), dan warna tokoh ikut gelap / hangat dekat lampu.
import * as THREE from 'three';
import { SCHOOL_OX } from './world.js';
import { ALL_CHARS } from './chars.js';

// sekolah (koordinat lokal, + SCHOOL_OX). glow = bohlamnya kelihatan
function schoolLamps() {
  const L = [], O = SCHOOL_OX, P = (x, z, y, r, k, gx = x, gz = z, glow = true) => L.push({ x: O + x, z, y, r, k, gx: O + gx, gz, abs: true, glow });
  for (const z of [47.5, 51, 54]) { P(36.2, z, 2.75, 4, 'taman'); P(41.8, z, 2.75, 4, 'taman'); }
  for (const [x, z] of [[24.4, 14.6], [53.6, 14.6], [56, 33], [13.5, 30], [66, 17], [60, 43.2]]) P(x, z, 2.75, 4.5, 'taman');
  for (let i = 0; i < 6; i++) { const x = 18 + 7.33 * (i + 0.5); P(x, 11, 2.0, 3.2, 'koridor', x, 12.2); }   // selasar Gedung B lantai 1
  for (const x of [30, 36, 42, 48]) { P(x, 32.5, 2.2, 3, 'koridor'); P(x, 35.15, 2.0, 2.6, 'teras', x, 35.9); }   // selasar & muka Gedung A
  for (const z of [18.6, 31.6]) P(13.15, z, 1.9, 2.6, 'teras', 14.1, z);   // pintu Gedung C
  for (const x of [61, 66, 71]) P(x, 38, 2.3, 3.4, 'toko');   // kantin
  P(46.5, 52, 2.0, 2.6, 'teras'); P(70.3, 23, 2.0, 2.6, 'teras', 71.2, 23);   // pos satpam, musala
  return L;
}
const COL = { jalan: '#ffd9a0', tiang: '#ffe2b0', taman: '#fff0c8', teras: '#ffc880', toko: '#f4f6ff', koridor: '#fff4dc' };
// ukuran bohlam yang menyala (kotak terang tanpa bayangan, menempel di kepala lampu)
const BULB = { jalan: [0.38, 0.15, 0.3], tiang: [0.2, 0.12, 0.26], taman: [0.36, 0.34, 0.36], teras: [0.16, 0.16, 0.12], toko: [0.6, 0.08, 0.24], koridor: [0.42, 0.06, 0.42] };
const POWER = { jalan: 1, tiang: 0.8, taman: 0.75, teras: 0.65, toko: 0.9, koridor: 0.7 };

function radial(inner, outer) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(255,255,255,${inner})`); gr.addColorStop(0.45, `rgba(255,255,255,${outer})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function makeLampu({ scene, kota, luar, player, waktu, quality }) {
  const poolTex = radial(1, 0.45), glowTex = radial(1, 0.25);
  const poolMat = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, toneMapped: false });
  const bulbMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const glowMat = new THREE.PointsMaterial({ map: glowTex, size: 1.9, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, vertexColors: true, toneMapped: false });
  const plane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const tmpM = new THREE.Matrix4(), tmpC = new THREE.Color(), WHITE0 = new THREE.Color(1, 1, 1);

  // satu set lampu = pool + glow + grid untuk cari lampu terdekat
  function makeSet(list, groundY) {
    const n = list.length, pools = new THREE.InstancedMesh(plane, poolMat, Math.max(1, n)), bulbs = new THREE.InstancedMesh(cube, bulbMat, Math.max(1, n));
    const pos = new Float32Array(n * 3), colA = new Float32Array(n * 3), grid = new Map();
    list.forEach((l, i) => {
      const gy = groundY(l.gx, l.gz), base = l.abs ? 0 : groundY(l.x, l.z), hy = l.abs ? l.y : base + l.y;
      l.hy = hy; l.py = gy;
      tmpM.makeScale(l.r * 2, 1, l.r * 2).setPosition(l.gx, gy + 0.05, l.gz); pools.setMatrixAt(i, tmpM);
      tmpC.set(COL[l.k] || '#ffd9a0').multiplyScalar(POWER[l.k] || 0.7); pools.setColorAt(i, tmpC);
      { const [sx, sy, sz] = BULB[l.k] || BULB.teras; tmpM.makeScale(sx * 1.06, sy * 1.06, sz * 1.06).setPosition(l.x, hy, l.z); bulbs.setMatrixAt(i, tmpM); tmpC.set(COL[l.k] || '#ffd9a0').lerp(WHITE0, 0.35); bulbs.setColorAt(i, tmpC); }
      pos.set([l.x, hy - 0.08, l.z], i * 3); tmpC.set(COL[l.k] || '#ffd9a0'); colA.set(l.glow === false ? [0, 0, 0] : [tmpC.r, tmpC.g, tmpC.b], i * 3);
      const key = Math.floor(l.gx / 8) * 4096 + Math.floor(l.gz / 8); (grid.get(key) || grid.set(key, []).get(key)).push(l);
    });
    pools.count = n; pools.frustumCulled = false; pools.renderOrder = 2; pools.visible = false;
    bulbs.count = n; bulbs.frustumCulled = false; bulbs.visible = false;
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(colA, 3));
    const glow = new THREE.Points(g, glowMat); glow.frustumCulled = false; glow.visible = false; glow.renderOrder = 3;
    scene.add(pools, glow, bulbs);
    return { list, pools, glow, bulbs, grid, dispose() { scene.remove(pools, glow, bulbs); pools.dispose(); bulbs.dispose(); g.dispose(); } };
  }
  const town = makeSet([...(kota.lamps || []), ...schoolLamps()], (x, z) => x > SCHOOL_OX - 10 ? 0.14 : kota.groundY(x, z));
  let outSet = null, outZone = null;

  // PointLight sungguhan di lampu terdekat (jumlah tetap selama malam supaya shader tidak dikompilasi ulang)
  const lights = [0, 1, 2, 3].map(() => { const L = new THREE.PointLight('#ffd9a0', 0, 9, 1.6); L.visible = false; scene.add(L); return L; });

  const near = (set, x, z, out) => {
    const cx = Math.floor(x / 8), cz = Math.floor(z / 8);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const a = set.grid.get((cx + i) * 4096 + cz + j); if (a) for (const l of a) out.push(l); }
    return out;
  };
  const nightOf = h => h >= 19 || h < 5 ? 1 : h >= 17.5 ? (h - 17.5) / 1.5 : h < 6.5 ? 1 - (h - 5) / 1.5 : 0;
  const WHITE = new THREE.Color(1, 1, 1), NT = new THREE.Color(0.4, 0.45, 0.68), WARM = new THREE.Color(1.05, 0.93, 0.78), cc = new THREE.Color(), wp = new THREE.Vector3();
  let tT = 0, lT = 0, night = 0, tinted = false;

  function curSet() { return player.area === 'luar' ? outSet : player.area === 'dalam' ? null : town; }
  function litAt(set, x, z) {
    let best = 0; for (const l of near(set, x, z, [])) { const d = Math.hypot(l.gx - x, l.gz - z) / (l.r * 0.95); if (d < 1) { const v = (1 - d) * (1 - d) * (3 - 2 * (1 - d)) * (POWER[l.k] || 0.7) * 1.4; if (v > best) best = v; } }
    return Math.min(1, best);
  }

  return {
    get night() { return night; },
    update(dt) {
      // set lampu wilayah luar ikut zona yang dimuat
      const z = player.area === 'luar' ? luar.cur : null;
      if (z !== outZone) { outSet?.dispose(); outSet = null; outZone = z; if (z && luar.lamps.length) outSet = makeSet(luar.lamps, (x, zz) => luar.groundY(x, zz)); }
      const set = curSet(), inDalam = player.area === 'dalam';
      night = inDalam ? 0 : nightOf(waktu.jam);
      const on = night > 0.02;
      for (const s of [town, outSet]) if (s) { const v = on && s === set; s.pools.visible = v; s.glow.visible = v; s.bulbs.visible = s === set; }   // bohlam = kap lampu: siang kelihatan redup, malam menyala
      bulbMat.color.setScalar(0.5 + 0.5 * Math.min(1, night * 1.5));
      poolMat.opacity = 0.42 * night; glowMat.opacity = Math.min(1, night * 1.2);
      // lampu sungguhan
      const nL = on && set ? [0, 2, 4][quality()] ?? 2 : 0;
      lT -= dt;
      if (lT <= 0) {
        lT = 0.3;
        const cand = set && nL ? near(set, player.x, player.z, []).filter(l => l.k !== 'teras' || l.glow !== false).sort((a, b) => Math.hypot(a.gx - player.x, a.gz - player.z) - Math.hypot(b.gx - player.x, b.gz - player.z)) : [];
        lights.forEach((L, i) => {   // jumlah yang menyala tetap nL; tanpa lampu dekat = intensitas 0 (bukan disembunyikan)
          const l = i < nL ? cand[i] : null; L.visible = i < nL; L.userData.p = 0;
          if (l) { L.position.set(l.x, l.hy - 0.25, l.z); L.color.set(COL[l.k]); L.distance = l.r * 1.5; L.userData.p = (POWER[l.k] || 0.7) * (l.abs && l.x > SCHOOL_OX - 10 ? 1.6 : 5); }
        });
      }
      for (const L of lights) if (L.visible) L.intensity = night * (L.userData.p || 0);
      // warna tokoh: gelap kebiruan di malam hari, hangat di bawah lampu
      tT -= dt; if (tT > 0) return; tT = 0.15;
      if (!on || !set) { if (tinted) { for (const c of ALL_CHARS) c.tint(WHITE); tinted = false; } return; }
      tinted = true;
      for (const c of ALL_CHARS) {
        const g = c.group; if (!g.visible || !g.parent) continue;
        let x = g.position.x, zz = g.position.z; if (g.parent !== scene) { g.getWorldPosition(wp); x = wp.x; zz = wp.z; }
        if (Math.abs(x - player.x) > 60 || Math.abs(zz - player.z) > 60) continue;
        const lit = litAt(set, x, zz);
        cc.copy(WHITE).lerp(NT, night).lerp(WARM, lit * night); c.tint(cc);
      }
    },
  };
}
