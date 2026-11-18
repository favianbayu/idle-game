// Kesibukan warga luar kota: tiap wilayah punya orang yang sedang bekerja, bermain, atau bersantai di tempat yang masuk akal
// (petani di sawah, pemetik teh, pemancing di tepi waduk, lelang ikan di TPI, voli pantai, tentara lari pagi, mekanik di pit, ...).
// Semua NPC di sini memakai ext (perilaku sendiri) dan dibongkar bersama wilayahnya.
import * as THREE from 'three';
import { hash } from './common.js';
import { Merger, col } from './geom.js';
import { MAT } from './common.js';
import { makeRide } from './rides.js';

const rpick = a => a[Math.floor(Math.random() * a.length)];

export function spawnWarga(A) {
  const { id, Z, LZ, K, Y, free, inA, isW, wl, Character, scene, group, npcs, player, roads, C } = A;
  const list = [], ticks = [];
  let seed = 1;
  const R = () => hash(seed++ * 7 + 3, id.length * 37 + 11);
  const inZ = (x, z) => x >= Z.x0 && x < Z.x1 && z >= Z.z0 && z < Z.z1;

  /* ---------------- pembuat NPC */
  function mk(sid, name, x, z, lines, ext, o = {}) {
    const c = new Character(sid, { name }); scene.add(c.group);
    const n = { sid, name, lines, filler: !!lines, area: 'luar', key: 'W' + id + list.length, c, home: { x, z: z + LZ }, x, z: z + LZ, tx: x, tz: z + LZ, wait: 0,
      heading: R() * 6.28, say: null, greetT: 4 + R() * 20, ext, anim: 'idle', ...o };
    npcs.push(n); list.push(n); return n;
  }
  // rencana langkah: [{x, z, a, t, h, y, sink, say, p, run, mv, wy}] -> jalan ke titik, mainkan animasi selama t detik, lanjut
  const planExt = (n, dt) => {
    const s = n.steps[n.si];
    const dx = s.x - n.x, dz = s.z - n.z, d = Math.hypot(dx, dz);
    if (d > 0.04) {
      const pdx = player.x - n.x, pdz = player.z - n.z;
      if (pdx * pdx + pdz * pdz < 0.45 && !s.run) { n.anim = 'idle'; return; }   // jangan tembus pemain
      const sp = (s.run ? 2.4 : n.spd || 1) * dt;
      if (d <= sp) { n.x = s.x; n.z = s.z; } else { n.x += dx / d * sp; n.z += dz / d * sp; }
      n.heading = Math.atan2(dz, dx); n.anim = s.mv || (s.run ? 'run' : 'walk'); n.yAbs = s.wy; n.sink = s.wsink || 0; return;
    }
    if (n.st == null) {
      n.st = (s.t || 3) * (0.7 + Math.random() * 0.6);
      if (s.say && !n.say && Math.random() < (s.p ?? 0.35)) n.say = { text: rpick(s.say), t: 2.8 };
    }
    if (s.h != null) n.heading = s.h;
    n.anim = s.a || 'idle'; n.yAbs = s.y; n.sink = s.sink || 0;
    n.st -= dt;
    if (n.st <= 0) { n.st = null; n.si = n.shuffle ? Math.floor(Math.random() * n.steps.length) : (n.si + 1) % n.steps.length; }
  };
  const plan = (sid, name, lines, steps, o = {}) => {
    const S = steps.map(s => ({ ...s, z: s.z + LZ })), si = o.si ?? Math.floor(R() * S.length);
    return mk(sid, name, S[si].x, S[si].z - LZ, lines, planExt, { steps: S, si, st: null, ...o });
  };
  // jalan bolak-balik menyusuri garis (jalan setapak, gang), sesekali berhenti
  const pathExt = (n, dt) => {
    const pdx = player.x - n.x, pdz = player.z - n.z;
    if (n.stopT > 0 || pdx * pdx + pdz * pdz < 0.45) { n.stopT -= dt; n.anim = n.stopT > 0 ? n.idleA : 'idle'; return; }
    const tgt = n.path[n.k + n.dir];
    if (!tgt) { n.dir *= -1; n.stopT = 2 + Math.random() * 4; n.idleA = rpick(n.idles); return; }
    const dx = tgt.x - n.x, dz = tgt.z - n.z, d = Math.hypot(dx, dz), st = n.spd * dt;
    if (d <= st) { n.x = tgt.x; n.z = tgt.z; n.k += n.dir; if (Math.random() < 0.02) { n.stopT = 2 + Math.random() * 3; n.idleA = rpick(n.idles); if (n.chat && !n.say && Math.random() < 0.5) n.say = { text: rpick(n.chat), t: 2.6 }; } }
    else { n.x += dx / d * st; n.z += dz / d * st; n.heading = Math.atan2(dz, dx); }
    n.anim = n.mv || 'walk';
  };
  // titik-titik garis (lokal) tiap ~1 petak, digeser ke samping (lat) supaya di bahu jalan
  function line(pts, lat = 0, step = 1) {
    const P = [];
    for (let i = 1; i < pts.length; i++) {
      const [ax, az] = pts[i - 1], [bx, bz] = pts[i], L = Math.hypot(bx - ax, bz - az) || 1, tx = (bx - ax) / L, tz = (bz - az) / L;
      for (let u = i > 1 ? step : 0; u <= L; u += step) P.push({ x: ax + tx * u - tz * lat, z: az + tz * u + tx * lat });
    }
    return P;
  }
  function walker(sid, name, lines, pts, o = {}) {
    const P = pts.filter(p => inZ(p.x, p.z)).map(p => ({ x: p.x, z: p.z + LZ })); if (P.length < 4) return null;
    const k = Math.floor(R() * (P.length - 1));
    return mk(sid, name, P[k].x, P[k].z - LZ, lines, pathExt, { path: P, k, dir: R() < 0.5 ? 1 : -1, spd: 0.9 + R() * 0.3, stopT: R() * 2, idleA: 'idle', idles: ['look', 'stretch', 'idle', 'phone'], ...o });
  }
  // anak main kejar-kejaran: lari memutari satu titik, sesekali berhenti tertawa
  const chaseExt = (n, dt) => {
    if (n.stopT > 0) { n.stopT -= dt; n.anim = n.idleA; return; }
    n.ang += n.w * dt; const g = n.ring;
    const r = g.r * (0.75 + 0.25 * Math.sin(n.ang * 1.7 + n.ph));
    const nx = g.x + Math.cos(n.ang) * r, nz = g.z + LZ + Math.sin(n.ang) * r;
    n.heading = Math.atan2(nz - n.z, nx - n.x); n.x = nx; n.z = nz; n.anim = 'run';
    if (Math.random() < dt * 0.06) { n.stopT = 1.5 + Math.random() * 2; n.idleA = rpick(['laugh', 'cheer', 'idle', 'jump']); }
  };
  function kids(x, z, cnt, r = 2.4, lines) {
    const ring = { x, z, r }, sids = ['bocah', 'anakSD', 'anakSDcw', 'bocah'];
    for (let i = 0; i < cnt; i++) mk(sids[i % 4], ['Ucup', 'Dede', 'Iyan', 'Neng Ai', 'Asep'][i % 5], x, z, lines || ['Kejar aku!', 'Hore!', 'Mainan yuk, Kak!'], chaseExt, { ring, ang: i * 6.28 / cnt, ph: i, w: (1.1 + R() * 0.2) * (i % 2 ? 1 : 1), stopT: 0, idleA: 'laugh' });
  }

  /* ---------------- pencari tempat */
  function bboxOf(ids) { let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const i of ids) for (const [x, z] of K.areas[i].pts) { x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); }
    return [Math.max(x0, Z.x0), Math.max(z0, Z.z0), Math.min(x1, Z.x1), Math.min(z1, Z.z1)]; }
  function spots(test, cnt, box, gap = 1.6, tries = 5000) {
    const out = [], [x0, z0, x1, z1] = box;
    for (let i = 0; i < tries && out.length < cnt; i++) {
      const x = x0 + R() * (x1 - x0), z = z0 + R() * (z1 - z0);
      if (!inZ(x, z) || !test(x, z) || out.some(p => Math.hypot(p[0] - x, p[1] - z) < gap)) continue;
      out.push([x, z]);
    }
    return out;
  }
  const near = (x, z, r) => [x - r, z - r, x + r, z + r];
  const okLand = (x, z) => free(x, z) && free(x + 0.4, z) && free(x - 0.4, z) && free(x, z + 0.4) && free(x, z - 0.4);
  // arah ke air terdekat dari tepi (null kalau bukan tepi air)
  function shoreDir(x, z) {
    let sx = 0, sz = 0, n = 0;
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; if (isW(x + Math.cos(a) * 1.5, z + Math.sin(a) * 1.5)) { sx += Math.cos(a); sz += Math.sin(a); n++; } }
    return n >= 3 && n <= 9 ? Math.atan2(sz, sx) : null;
  }
  const nearB = (x, z, r = 2.2) => { for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; if (A.isB(x + Math.cos(a) * r, z + Math.sin(a) * r)) return true; } return false; };
  // titik di air (renang): air di sekeliling, dekat tepi
  const okWater = (x, z) => isW(x, z) && isW(x + 1, z) && isW(x - 1, z) && isW(x, z + 1) && isW(x, z - 1);
  // titik darat terdekat dari (x, z) dalam radius r (spiral), dipakai untuk menaruh tokoh di tempat yang ada di peta
  const clear = (x, z) => { if (!okLand(x, z) || A.isB(x, z)) return false; for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; for (const r of [0.7, 1.4]) if (A.isB(x + Math.cos(a) * r, z + Math.sin(a) * r)) return false; } return true; };   // tidak di bawah/menempel atap
  const flat = (x, z, r = 1.5) => { const y = Y(x, z); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; for (const q of [r / 2, r]) if (Math.abs(Y(x + Math.cos(a) * q, z + Math.sin(a) * q) - y) > 0.45 * q) return false; } return true; };   // tanah datar (bukan tebing/lereng curam)
  const yard = r => (x, z) => clear(x, z) && flat(x, z, r);
  const spot = (x, z, r = 4, test = yard(1.5)) => spot0(x, z, r, test) || spot0(x, z, r, clear) || spot0(x, z, r, okLand);
  const spot0 = (x, z, r, test) => { for (let rr = 0; rr <= r; rr += 0.5) for (let k = 0; k < (rr ? 16 : 1); k++) { const a = k / 16 * 6.283, px = x + Math.cos(a) * rr, pz = z + Math.sin(a) * rr; if (inZ(px, pz) && test(px, pz)) return [px, pz]; } return null; };
  const face = (p, tx, tz) => Math.atan2(tz - p[1], tx - p[0]);
  const at = (p, a, t, o = {}) => ({ x: p[0], z: p[1], a, t, ...o });

  /* ---------------- aktivitas umum */
  const FISH_SAY = ['Dapet!', 'Lumayan, buat lauk.', 'Yah, kecil...', 'Mujair!', 'Sabar, sabar...'];
  function fisher(sid, name, x, z, h, lines, y) {
    return plan(sid, name, lines || ['Sst, jangan berisik, ikannya kabur.', 'Dari subuh baru dapet tiga.', 'Umpannya lumut, Dek.'], [
      { x, z, a: 'fishCast', t: 1.1, h, y }, { x, z, a: 'fishWait', t: 9, h, y }, { x, z, a: 'fishPull', t: 1.8, h, y },
      { x, z, a: 'fishShow', t: 2.4, h, y, say: FISH_SAY, p: 0.5 }, { x, z, a: 'idle', t: 2, h, y }], { si: 0 });
  }
  function fishersAt(box, cnt, sids, names) {
    const S = spots((x, z) => okLand(x, z) && shoreDir(x, z) != null, cnt, box, 5);
    S.forEach(([x, z], i) => fisher(sids[i % sids.length], names[i % names.length], x, z, shoreDir(x, z)));
    return S.length;
  }
  // petani: jongkok menanam/menyiangi bergeser sepanjang baris, sesekali berdiri meregang
  function farmers(areaIds, cnt, lines) {
    const box = bboxOf(areaIds), S = spots((x, z) => okLand(x, z) && inA(x, z, areaIds), cnt, box, 4);
    S.forEach(([x, z], i) => {
      const an = (K.areas[areaIds[0]].angle || 0) * Math.PI / 180, ux = Math.cos(an), uz = Math.sin(an), st = [];
      for (let k = 0; k < 4; k++) { const px = x + ux * k * 1.1, pz = z + uz * k * 1.1; if (!okLand(px, pz) || !inA(px, pz, areaIds)) break; st.push({ x: px, z: pz, a: 'squat', t: 5, h: an + Math.PI / 2 }); }
      if (!st.length) return;
      st.push({ ...st.at(-1), a: rpick(['stretch', 'look', 'idle']), t: 2.5, say: ['Panas, istirahat dulu.', 'Padinya bagus tahun ini.', 'Hus, hus! Burung!'], p: 0.3 });
      for (let k = st.length - 2; k > 0; k--) st.push({ ...st[k] });
      plan(i % 3 === 2 ? 'petaniW' : 'petani', i % 3 === 2 ? 'Bu Tani' : 'Pak Tani', lines || ['Lagi tandur, Dek.', 'Nanam padi harus sabar.', 'Sawahnya warisan Bapak.'], st, { spd: 0.7 });
    });
  }
  // orang menyapu halaman / jongkok di depan rumah / ngobrol duduk di teras
  function yards(box, cnt, test = () => true) {
    const S = spots((x, z) => okLand(x, z) && nearB(x, z) && test(x, z), cnt, box, 6);
    S.forEach(([x, z], i) => {
      const k = i % 3, h = R() * 6.28;
      if (k === 0) plan('ibuDaster', 'Bu Warsih', ['Halamannya kotor terus, daunnya rontok.', 'Mampir, Nak?'], [{ x, z, a: 'sweep', t: 6, h }, { x: x + Math.cos(h) * 1.4, z: z + Math.sin(h) * 1.4, a: 'sweep', t: 6, h }, { x: x + Math.cos(h) * 1.4, z: z + Math.sin(h) * 1.4, a: 'stretch', t: 2, h }], { spd: 0.6 });
      else if (k === 1) plan('kakek', 'Mbah Saleh', ['Dulu di sini masih hutan semua.', 'Pelan-pelan aja, Nak, hidup jangan buru-buru.'], [{ x, z, a: 'sitDown', t: 10, h }, { x, z, a: 'think', t: 4, h }, { x, z, a: 'laugh', t: 2, h }]);
      else plan('ibuHijab', 'Bu Iyah', ['Lagi jemur gabah, Dek.', 'Anak-anak pada main di lapangan.'], [{ x, z, a: 'squat', t: 6, h }, { x, z, a: 'idle', t: 2, h }, { x, z, a: 'talk', t: 4, h }]);
    });
  }
  // dua-tiga orang ngobrol berdiri/duduk saling berhadapan
  function chat(x, z, sids, names, lines, sit) {
    const n = sids.length;
    sids.forEach((sid, i) => { const a = i / n * 6.283 + R(), px = x + Math.cos(a) * 0.75, pz = z + Math.sin(a) * 0.75, h = a + Math.PI;
      plan(sid, names[i], lines, [{ x: px, z: pz, a: sit ? 'sitDown' : 'talk', t: 5, h }, { x: px, z: pz, a: sit ? 'sitDown' : 'laugh', t: 2.5, h }, { x: px, z: pz, a: sit ? 'sitDown' : 'idle', t: 4, h }], { shuffle: true }); });
  }
  // properti sederhana (meja, tenda, jemuran ikan): satu Merger per wilayah
  const pm = new Merger();
  const prop = (x, z, a, fn) => fn({ x, z: z + LZ, a, y: Y(x, z) });
  function tent(x, z, a, c) { prop(x, z, a, xf => { pm.gable(xf, 0, 0, 0, 2.2, 1.8, 1.2, col(c), 0.05); pm.box(xf, 1.12, 0, 0, 0.04, 0.9, 0.7, col('#3a3a3a')); }); C.box(x, z + LZ, 1.1, 0.9, a); }
  function fire(x, z) { prop(x, z, 0, xf => { for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; pm.box(xf, Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4, 0.22, 0.14, 0.22, col('#7a7a7a')); } pm.box(xf, 0, 0.02, 0, 0.5, 0.1, 0.12, col('#6a4a2a')); pm.box(xf, 0, 0.06, 0, 0.12, 0.1, 0.5, col('#6a4a2a')); pm.box(xf, 0, 0.12, 0, 0.18, 0.18, 0.18, col('#f2a020')); }); }
  function rack(x, z, a) {   // para-para jemur ikan asin
    prop(x, z, a, xf => { for (const u of [-0.9, 0.9]) for (const v of [-0.4, 0.4]) pm.box(xf, u, 0, v, 0.08, 0.6, 0.08, col('#6a4a2c'));
      pm.box(xf, 0, 0.6, 0, 2.0, 0.05, 1.0, col('#b89a6a')); for (let k = 0; k < 12; k++) pm.box(xf, -0.75 + (k % 6) * 0.3, 0.66, -0.25 + Math.floor(k / 6) * 0.5, 0.22, 0.04, 0.09, col(k % 3 ? '#c8c0b0' : '#a8a090')); });
    C.box(x, z + LZ, 1.0, 0.5, a);
  }
  function parkedRide(type, kind, color, x, z, a, o) { const rd = makeRide(type, kind, color, o); rd.group.position.set(x, Y(x, z), z + LZ); rd.group.rotation.y = a; group.add(rd.group); if (type === 'car') C.box(x, z + LZ, 0.8, 1.8, -a); else C.circle(x, z + LZ, 0.45); return rd; }

  /* ================================================================ per wilayah */
  if (id === 'tegalsari') {
    farmers([17], 9);
    yards([-134, 75, -43, 133], 7, (x, z) => inA(x, z, [27]));
    // pasar hewan: pedagang & pembeli tawar-menawar di depan los
    const PH = spots(okLand, 7, near(-92, 116.5, 3.5), 1.1);
    PH.forEach(([x, z], i) => { const h = Math.atan2(112 - z, -92 - x) + (i % 2 ? Math.PI : 0);
      plan(['bapakPeci', 'pakRT', 'kakek', 'pemuda', 'bapakPeci', 'ibuDaster', 'mandor'][i], ['Pak Dulah', 'Pak Karta', 'Mbah Sastro', 'Kang Odih', 'Haji Mamat', 'Bu Enah', 'Bang Jalu'][i],
        ['Kambingnya sehat, giginya udah poel dua.', 'Tiga juta, nggak bisa kurang!', 'Buat kurban nanti, Dek.', 'Sapinya montok, lihat aja.'],
        [{ x, z, a: 'talk', t: 4, h, say: ['Dua juta setengah, deal?', 'Waduh, mahal amat!', 'Lihat dulu giginya.', 'Udah, salaman!'], p: 0.4 }, { x, z, a: rpick(['think', 'raiseHand', 'laugh']), t: 3, h }, { x, z, a: 'idle', t: 3, h }], { shuffle: true }); });
    // santri berjalan dari pondok lewat Gg. Melati
    const gg = roads.find(r => r.name === 'Gg. Melati');
    if (gg) for (let i = 0; i < 3; i++) walker(i === 2 ? 'bapakPeci' : 'santri', i === 2 ? 'Ustadz Rohim' : ['Santri Hamid', 'Santri Ilham'][i], ['Assalamualaikum.', 'Mau ngaji, Kang.', 'Kitab kuning tebel banget.'], line(gg.pts, i % 2 ? 0.55 : -0.55), { spd: 0.8 });
    kids(-79, 96, 4); kids(-60, 112, 3);
    // penyadap karet di kebun karet selatan
    const KR = spots((x, z) => okLand(x, z) && inA(x, z, [20]), 3, bboxOf([20]), 8);
    KR.forEach(([x, z]) => { const h = R() * 6.28; plan('petani', 'Pak Sadap', ['Nyadap karet harus pagi, getahnya banyak.', 'Harga karet lagi turun.'], [{ x, z, a: 'squat', t: 6, h }, { x: x + 2, z: z + 1.5, a: 'squat', t: 6, h }, { x: x + 2, z: z + 1.5, a: 'carry', t: 2, h }]); });
    // Kyai Mahfud (segmen 33): mengajar santri di halaman pondok -> perpustakaan -> jalan ke pasar hewan menyapa warga -> kembali
    const KP = spot(-116, 90, 8, yard(3)), KL = spot(-110, 92, 8), KM = spot(-94, 113.5, 6);
    if (KP && KL && KM) {
      const SN = spots(okLand, 3, near(KP[0], KP[1] + 1.9, 1.4), 0.9), cx = SN.length ? SN.reduce((a, q) => a + q[0], 0) / SN.length : KP[0], cz = SN.length ? SN.reduce((a, q) => a + q[1], 0) / SN.length : KP[1] + 2, hk = face(KP, cx, cz);
      SN.forEach((q, i) => plan('santri', ['Santri Zaki', 'Santri Hamdan', 'Santri Ulfa'][i], ['Lagi ngaji sama Pak Kyai, Kang.', 'Hafalan saya baru juz satu.'], [at(q, 'sitDown', 9, { h: face(q, ...KP) }), at(q, 'sitDown', 4, { h: face(q, ...KP) + 0.3 })], { shuffle: true }));
      plan('kyaiMahfud', 'Kyai Mahfud', ['Tanah itu titipan, Nak. Yang menitipkan masih melihat.', 'Mampir ke perpustakaan pondok, bukunya banyak.', 'Belajar itu seperti menanam padi, Nak. Sabar.'], [
        at(KP, 'talk', 6, { h: hk, say: ['Ulangi bacaannya, pelan-pelan.', 'Ilmu itu cahaya, Nak.'], p: 0.5 }), at(KP, 'raiseHand', 2, { h: hk }), at(KP, 'read', 6, { h: hk }),
        at(KL, 'read', 9, { h: R() * 6.28 }), at(KL, 'think', 3),
        at(KM, 'wave', 2.5, { h: face(KM, -92, 116.5), say: ['Assalamualaikum, Pak Dulah.', 'Sehat, Bu Enah?'], p: 0.6 }), at(KM, 'talk', 5, { h: face(KM, -92, 116.5) }), at(KM, 'laugh', 2)], { si: 0, spd: 0.7 });
    }
  }

  if (id === 'sukamekar') {
    // pemetik teh di sela barisan kebun teh
    const T = K.areas[15], an = (T.angle || 0) * Math.PI / 180, ca = Math.cos(an), sa = Math.sin(an);
    const snap = (x, z) => { const u = (x - 240) * ca + (z + 28) * sa, v = -(x - 240) * sa + (z + 28) * ca, v2 = Math.round((v - 0.8) / 1.6) * 1.6 + 0.8; return [240 + u * ca - v2 * sa, -28 + u * sa + v2 * ca]; };
    const TP = spots((x, z) => { const [sx, sz] = snap(x, z); return inA(sx, sz, [15]) && free(sx, sz); }, 10, bboxOf([15]), 5);
    TP.forEach(([x0, z0], i) => { const [x, z] = snap(x0, z0), h = an + Math.PI / 2, st = [];
      for (let k = 0; k < 3; k++) { const px = x + ca * k * 1.2, pz = z + sa * k * 1.2; if (!inA(px, pz, [15])) break; st.push({ x: px, z: pz, a: 'catch', t: 5, h }); }
      st.push({ ...st.at(-1), a: rpick(['stretch', 'carry']), t: 2.5, say: ['Pucuknya dua daun satu kuncup.', 'Keranjang udah setengah.', 'Kabutnya turun, dingin.'], p: 0.3 });
      plan(i % 4 === 3 ? 'petani' : 'petaniW', i % 4 === 3 ? 'Mang Ading' : ['Teh Imas', 'Ceu Euis', 'Teh Lilis'][i % 3], ['Metik teh dari subuh, Dek.', 'Sekilo pucuk dibayar sedikit, tapi lumayan.', 'Mau coba metik?'], st, { spd: 0.6 }); });
    // siswa SMK pariwisata pulang lewat gang desa
    for (const r of roads.filter(r => r.kind === 'gang')) { walker('anakSMK', 'Siswi SMK', ['Praktek tata boga hari ini.', 'Kak, mau ke villa ya?'], line(r.pts, 0.5)); walker('anakSMK', 'Siswa SMK', ['Besok praktek di hotel.', 'Sukamekar dingin banget pagi-pagi.'], line(r.pts, -0.5)); }
    // pabrik teh: buruh angkut karung ke truk
    const PT = spots((x, z) => okLand(x, z) && nearB(x, z, 2.4), 2, near(282, -32, 7), 3);
    PT.forEach(([x, z], i) => { const ex = x + 2.5 * (i ? -1 : 1);
      if (okLand(ex, z + 2)) plan('buruh', 'Buruh Pabrik Teh', ['Karung daun teh berat, Dek.', 'Shift pagi sampai jam dua.'], [{ x, z, a: 'squat', t: 1.5 }, { x, z, a: 'carry', t: 1.5 }, { x: ex, z: z + 2, a: 'carry', t: 1.5 }, { x: ex, z: z + 2, a: 'squat', t: 1.5 }], { spd: 0.8 }); });
    yards([234, -49, 284, -16], 4, (x, z) => inA(x, z, [26]));
    kids(258, -30, 3);
    // perguruan silat Kembang Teh (segmen 33): Abah Karta melatih murid di pendopo, lalu ke kebun, malam duduk di teras
    const PD = spot(274, -49, 12, yard(3));
    if (PD) {
      const MS = spots(okLand, 3, near(PD[0] + 2.2, PD[1], 1.2), 1.1), DR = q => [at(q, 'guard', 2, { h: face(q, ...PD) }), at(q, 'jab', 0.9, { h: face(q, ...PD) }), at(q, 'straight', 0.9, { h: face(q, ...PD) }), at(q, 'kickFront', 1.3, { h: face(q, ...PD) }), at(q, 'guard', 1.5, { h: face(q, ...PD) }), at(q, 'hook', 0.9, { h: face(q, ...PD) }), at(q, 'kickHigh', 1.4, { h: face(q, ...PD) }), at(q, 'idle', 2.5, { h: face(q, ...PD), say: ['Hiaaat!', 'Kaki pegel, tapi seru!', 'Kuda-kuda dulu, kata Abah.'], p: 0.25 })];
      MS.forEach((q, i) => plan('muridSilat', ['Ujang (murid silat)', 'Murid Asep', 'Murid Euis'][i], ['Hiaaat! Kakak murid baru ya?', 'Sabukku masih kuning, Kak.'], DR(q), { si: 0 }));
      const GK = spot(281, -44, 6) || PD, TR = spot(270.5, -45.5, 4) || PD, hm = MS.length ? face(PD, MS[0][0], MS[0][1]) : 0;
      plan('abahKarta', 'Abah Karta', ['Jurus itu bukan buat pamer. Buat pulang dengan selamat.', 'Mau latihan? Pikul air dari pancuran dulu, sepuluh kali.', 'Orang kota datang cuma mau foto.'], [
        at(PD, 'raiseHand', 3, { h: hm, say: ['Kuda-kuda! Tahan!', 'Ulangi! Tangan jangan turun!', 'Napas! Jangan buru-buru.'], p: 0.6 }), at(PD, 'talk', 4, { h: hm }), at(PD, 'look', 4, { h: hm }), at(PD, 'jab', 1, { h: hm }), at(PD, 'kickFront', 1.4, { h: hm }), at(PD, 'raiseHand', 3, { h: hm }),
        at(GK, 'squat', 7), at(GK, 'carry', 2), at(TR, 'sitDown', 10, { h: face(TR, ...PD), say: ['Dulu Abah main kecapi di sini sama Pak Ujang.'], p: 0.3 })], { si: 0, spd: 0.75 });
      // Neng Ayu (14): nonton latihan, lalu nongkrong di pinggir jalan dekat halte lihat motor lewat
      const AH = spot(263.5, -40, 3) || PD, AW = spot(PD[0] - 1.8, PD[1] + 1.6, 2) || PD;
      plan('nengAyu', 'Neng Ayu', ['Kak, boncengin sampai kelokan doang!', 'Aku mau jadi pembalap kayak Teh Kirana.', 'Teh Wulan lagi di sekolah.'], [
        at(AH, 'look', 6, { h: face(AH, 262, -36) }), at(AH, 'wave', 2, { say: ['Wih, motornya keren!', 'Kak, boncengin sampai kelokan doang!'], p: 0.6 }), at(AH, 'phone', 4),
        at(AW, 'clap', 3, { h: face(AW, ...PD) }), at(AW, 'cheer', 2, { h: face(AW, ...PD) }), at(AW, 'idle', 4, { h: face(AW, ...PD) })], { spd: 1.1 });
    }
    // Mandor Sabar: keliling di antara pemetik teh, tiup peluit, lalu ke pabrik teh mencatat timbangan
    if (TP.length >= 3) { const sp3 = TP.slice(0, 3).map(([x, z]) => snap(x, z)), PF = spot(280, -31, 5) || sp3[0];
      plan('mandorSabar', 'Mandor Sabar', ['Pucuk dua daun, jangan lebih. Teh itu soal sabar.', 'Mau kerja metik? Datang subuh.', 'Pabrik ini lebih tua dari kakek saya.'], [
        at(sp3[0], 'look', 4), at(sp3[0], 'raiseHand', 2, { say: ['Priiit! Kumpul, timbang dulu!', 'Pucuk dua daun, jangan lebih.'], p: 0.5 }), at(sp3[1], 'talk', 4), at(sp3[2], 'think', 3), at(sp3[2], 'look', 3),
        at(PF, 'read', 6), at(PF, 'talk', 3)], { spd: 0.6 }); }
    // Ir. Lukman: proyek villa tahap 2, baca gambar, telepon, pasang patok di tepi kebun
    const VL = spot(205, -57, 5), PK = spot(214, -51, 6);
    if (VL && PK) {
      for (const [dx, dz] of [[0.5, 0], [-0.6, 0.4]]) prop(PK[0] + dx, PK[1] + dz, 0, xf => { pm.box(xf, 0, 0, 0, 0.07, 0.6, 0.07, col('#e8e4d8')); pm.box(xf, 0, 0.6, 0, 0.08, 0.12, 0.08, col('#d8342c')); });
      plan('irLukman', 'Ir. Lukman', ['Ini lahan proyek. Ada urusan apa, Dek?', 'Semua sudah ada izinnya. Katanya.', 'Patoknya jangan dicabut ya.'], [
        at(VL, 'read', 6), at(VL, 'phone', 4, { say: ['Patoknya geser dua meter. Catat.', 'Tahap dua mulai bulan depan, Pak.'], p: 0.6 }), at(PK, 'squat', 4), at(PK, 'think', 3), at(PK, 'look', 3)], { spd: 0.9 });
    }
    // anak SMK Pariwisata: ngobrol di gerbang, praktik tata boga & pemandu wisata
    const SG = spot(252, -47.5, 6, yard(2.5));
    if (SG) { chat(SG[0], SG[1], ['anakSMK', 'anakSMK', 'anakSMKhotel'], ['Siswa SMK', 'Siswi SMK', 'Siswa SMK'], ['Praktek hotel besok, rompinya belum disetrika.', 'Kak, mau ke villa ya?', 'Ujian bahasa Inggris pariwisata susah.']);
      const SB = spot(255.5, -45, 4);
      if (SB) for (let k = 0; k < 2; k++) plan('anakSMKboga', 'Siswa Tata Boga', ['Hari ini masak pepes ikan.', 'Cobain kuenya, Kak!'], [at([SB[0] + k * 0.9, SB[1]], 'carry', 2), at([SB[0] + k * 0.9 + 1.6, SB[1] + 1], 'carry', 1.5), at([SB[0] + k * 0.9 + 1.6, SB[1] + 1], 'talk', 3), at([SB[0] + k * 0.9, SB[1]], 'squat', 2)], { si: k * 2, spd: 0.8 });
      const SPm = spot(264, -35, 4);
      if (SPm) { const T2 = spots(okLand, 2, near(SPm[0], SPm[1] + 1.6, 1.2), 0.9);
        plan('anakSMKpemandu', 'Pemandu SMK', ['Selamat datang di Sukamekar!', 'Kebun teh ini sudah ada sejak 1920-an.'], [at(SPm, 'talk', 5, { h: face(SPm, SPm[0], SPm[1] + 1.6), say: ['Di sebelah kanan, pabrik teh tua.', 'Ayo, kita jalan ke kebun!'], p: 0.5 }), at(SPm, 'raiseHand', 2, { h: face(SPm, SPm[0], SPm[1] + 1.6) }), at(SPm, 'read', 3)]);
        T2.forEach((q, i) => plan('turis', 'Wisatawan', ['Dingin ya di sini.', 'Teh hijaunya enak!'], [at(q, 'look', 5, { h: face(q, ...SPm) }), at(q, 'phone', 3, { h: face(q, ...SPm) + 1 })], { shuffle: true })); } }
  }

  if (id === 'gunung') {
    // pendaki di jalur setapak (naik-turun), berhenti foto & minum
    for (const r of roads.filter(r => r.kind === 'setapak')) for (let i = 0; i < 3; i++)
      walker(i % 2 ? 'pendaki' : rpick(['pemuda', 'mbak', 'remaja']), ['Pendaki Bandung', 'Mbak Ayu (pendaki)', 'Rombongan Mapala'][i], ['Masih jauh, Mas, puncaknya?', 'Semangat! Dikit lagi!', 'Pemandangannya cakep banget.'], line(r.pts, i % 2 ? 0.4 : -0.4, 1),
        { spd: 0.7 + R() * 0.2, idles: ['stretch', 'phone', 'look', 'idle'], chat: ['Istirahat dulu, napas...', 'Foto dulu, foto!', 'Airnya tinggal dikit.'] });
    // basecamp: pendaki berkumpul, duduk, cek perlengkapan
    chat(121, -48.5, ['pendaki', 'mbak', 'pemuda'], ['Rizky', 'Nadia', 'Farhan'], ['Tenda udah, logistik udah, senter?', 'Besok subuh summit attack!', 'Lapor dulu di pos.'], true);
    // pemandian air panas: berendam
    const AP = spots((x, z) => okWater(x, z) || isW(x, z), 3, bboxOf([25]), 1.2);
    AP.forEach(([x, z], i) => plan(['kakek', 'bapakPeci', 'pemuda'][i], ['Mbah Saman', 'Pak Haji Udin', 'Kang Asep'][i], ['Ahh... anget.', 'Pegel-pegel langsung ilang.'],
      [{ x, z, a: 'tread', t: 8, y: wl(x, z), sink: 0.6, h: R() * 6.28 }, { x, z, a: 'tread', t: 6, y: wl(x, z), sink: 0.6, h: R() * 6.28, say: ['Airnya belerang, bagus buat kulit.', 'Ahh...'], p: 0.3 }]));
    // Bukit Bintang: pengunjung duduk menatap kota, foto
    const BB = spots(okLand, 4, near(172, -48, 4), 1.2), hT = Math.atan2(90 + 48, 130 - 172);
    BB.forEach(([x, z], i) => plan(['remaja', 'mbak', 'pemuda', 'siswiB'][i], ['Dina', 'Sari', 'Bagas', 'Lia'][i], ['Lampu kotanya kayak bintang.', 'Jagung bakarnya Teh Neneng juara.'],
      i % 2 ? [{ x, z, a: 'sitDown', t: 8, h: hT }, { x, z, a: 'laugh', t: 2, h: hT + 1 }] : [{ x, z, a: 'phone', t: 5, h: hT }, { x, z, a: 'idle', t: 3, h: hT }, { x, z, a: 'wave', t: 2, h: hT + 3 }]));
    // kemah di alun-alun edelweis
    const EK = spots(okLand, 1, near(90, -98, 6), 1);
    if (EK.length) { const [x, z] = EK[0]; tent(x + 2.5, z, 0.4, '#e86a1a'); tent(x - 2.6, z + 0.5, -0.3, '#2a6ac0'); fire(x, z);
      chat(x, z, ['pendaki', 'pemuda', 'mbak'], ['Dion', 'Yoga', 'Tari'], ['Dingin! Apinya gedein.', 'Bintangnya kelihatan semua.', 'Edelweis jangan dipetik ya.'], true); }
    // Kang Ujo: kepala basecamp, daftar pendaki, briefing rombongan, pungut sampah sekitar pos
    const UB = spot(119, -52, 4), U1 = spot(114, -49, 5), U2 = spot(124, -55, 5);
    if (UB && U1 && U2) plan('kangUjo', 'Kang Ujo', ['Naik boleh, sampahnya turun lagi ya.', 'Jam naik terakhir jam tiga sore. Lewat itu, besok.', 'Lapor dulu, tulis nama sama nomor HP.'], [
      at(UB, 'read', 5), at(UB, 'raiseHand', 3, { h: face(UB, 121, -48.5), say: ['Naik boleh, sampahnya turun lagi ya!', 'Kabut turun, jangan pisah rombongan!'], p: 0.6 }), at(UB, 'talk', 3, { h: face(UB, 121, -48.5) }),
      at(U1, 'squat', 2.5), at(U1, 'carry', 1.5), at(U2, 'squat', 2.5), at(U2, 'carry', 1.5), at(UB, 'stretch', 2)], { si: 0, spd: 0.9 });
  }

  if (id === 'waduk') {
    fishersAt(bboxOf([16]), 6, ['bapakPeci', 'kakek', 'pemuda', 'petani', 'pakRT'], ['Pak Oman', 'Mbah Kardi', 'Kang Dadan', 'Mang Uci', 'Pak Ade', 'Kang Endang']);
    // ibu mencuci di tepi waduk
    const NC = spots((x, z) => okLand(x, z) && shoreDir(x, z) != null, 2, bboxOf([16]), 6);
    NC.forEach(([x, z]) => { const h = shoreDir(x, z); plan('ibuDaster', 'Bu Cicih', ['Nyuci di sini airnya banyak.', 'Hati-hati, licin.'], [{ x, z, a: 'squat', t: 7, h }, { x, z, a: 'stretch', t: 2, h }]); });
    // petugas PLTA patroli di atas bendungan
    const bd = K.bldgs.find(b => Math.abs(b.x + 74) < 0.6 && Math.abs(b.y - 34) < 0.6);
    if (bd) { const c = Math.cos(bd.a), s = Math.sin(bd.a), yT = Y(bd.x, bd.y) - 0.4 + 2.2, P = [];
      for (let u = -6.5; u <= 6.5; u += 1) P.push({ x: bd.x + u * c, z: bd.y + u * s });
      walker('mandor', 'Petugas PLTA', ['Debit air normal hari ini.', 'Pintu air dibuka jam tiga.'], P, { yAbs: yT, idles: ['look', 'phone', 'think'] }); }
    kids(-58, -21, 3, 2, ['Ikan bakarnya Bu Atun enak!', 'Kak, mancing yuk!']);
    // Pak Sudarmaji: petugas pintu air, cek debit, catat di buku, telepon yang menyuruh buka pintu air
    const DA = spot(-74, 40, 6), DB = spot(-69.5, 41, 6);
    if (DA && DB) plan('pakSudarmaji', 'Pak Sudarmaji', ['Air itu nggak bisa disuruh, Dek. Orang yang bisa.', 'Jangan main dekat pintu air.', 'Debit naik terus kalau hujan di gunung.'], [
      at(DA, 'look', 5, { h: face(DA, -74, 34) }), at(DA, 'read', 6, { h: face(DA, -74, 34) }), at(DA, 'phone', 4, { say: ['Iya, Pak... tapi debitnya belum aman.', 'Saya nggak berani, Pak.'], p: 0.5 }),
      at(DB, 'think', 3), at(DB, 'scratch', 2), at(DB, 'look', 3, { h: face(DB, -74, 34) })], { si: 0, spd: 0.7 });
  }

  if (id === 'timur') {
    // peleton lari pagi memutari kompleks asrama, berbanjar dua, sambil bernyanyi
    const LOOP = [[296, 32.5], [359, 32.5], [359, 69], [296, 69], [296, 32.5]], P = line(LOOP, 0, 0.5), L = P.length * 0.5;
    const squad = { s: 0 };
    const runExt = (n, dt) => {
      if (n.lead) { squad.s = (squad.s + 2.3 * dt) % L; if (!n.say && Math.random() < dt * 0.25) n.say = { text: rpick(['Satu! Dua! Tiga! Empat!', 'Kiri! Kiri! Kiri kanan kiri!', 'Siapa kita?! TNI!', 'Tetap semangaaat!']), t: 2.4 }; }
      const s = ((squad.s - n.row * 1.1) % L + L) % L, i = Math.floor(s / 0.5), a = P[i % P.length], b = P[(i + 1) % P.length], t = (s % 0.5) / 0.5;
      const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t, tl = Math.hypot(b.x - a.x, b.z - a.z) || 1, ox = -(b.z - a.z) / tl * n.col * 0.55, oz = (b.x - a.x) / tl * n.col * 0.55;
      n.x = x + ox; n.z = z + oz + LZ; n.heading = Math.atan2(b.z - a.z, b.x - a.x); n.anim = 'run';
    };
    for (let k = 0; k < 10; k++) { const lead = k === 0; mk('tentara', lead ? 'Danton Lettu Arif' : 'Prajurit ' + ['Budi', 'Eko', 'Slamet', 'Yudi', 'Rahmat', 'Agus', 'Teguh', 'Wahyu', 'Joko'][k - 1], 296, 32.5,
      lead ? ['Minggir, Dek! Lari pagi!'] : ['Siap, Dek!', 'Lari lima kilo tiap pagi.'], runExt, { lead, row: lead ? -1 : Math.floor((k - 1) / 2), col: lead ? 0 : (k % 2 ? -1 : 1) }); }
    // apel di lapangan: barisan hormat / siap mengikuti aba-aba komandan
    const drill = { t: 0 }, CMD = [[0, 'Siaaap... GRAK!', 'idle'], [4, 'Hormaaat... GRAK!', 'salute'], [8, 'Tegaaak... GRAK!', 'idle'], [12, 'Istirahat di tempat... GRAK!', 'idle']];
    const drillExt = (n, dt) => {
      if (n.cmd) { const p0 = drill.t % 16; drill.t += dt; const p1 = drill.t % 16; for (const [t, txt] of CMD) if (p0 < t + 1e-6 && p1 >= t || (t === 0 && p1 < p0)) n.say = { text: txt, t: 2 }; n.anim = 'raiseHand'; return; }
      const p = drill.t % 16; n.anim = p >= 4.6 && p < 8.6 ? 'salute' : p > 12.6 ? 'stretch' : 'idle';
    };
    mk('tentaraJaga', 'Sertu Bambang', 346, 39, ['Jangan ganggu apel, Dek.'], drillExt, { cmd: true, heading: Math.PI / 2 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) mk('tentara', 'Prajurit', 341.5 + c * 1.6, 43 + r * 1.4, null, drillExt, { heading: -Math.PI / 2 });
    // kawasan industri: buruh angkut barang ke truk, satpam di gerbang
    const IND = spots((x, z) => okLand(x, z) && nearB(x, z, 2) && inA(x, z, [22]), 4, bboxOf([22]), 12);
    IND.forEach(([x, z], i) => { const dz = z < 120 ? 3.2 : -3.2, tx = x, tz = z + dz; if (!okLand(tx, tz)) return;
      if (i % 2 === 0 && okLand(tx + 2.4, tz)) parkedRide('car', 'truk', '#e8e8e8', tx + 2.4, tz, 0, { box: rpick(['#3a6ab0', '#e8e4d8', '#f2c230']) });
      for (let k = 0; k < 2; k++) plan('buruh', 'Buruh ' + ['Tono', 'Gilang', 'Dedi', 'Udin'][(i + k) % 4], ['Target hari ini dua ribu kardus.', 'Gajian tanggal 25, sabar.', 'Shift malam lebih santai.'],
        [{ x: x + k * 0.9, z, a: 'squat', t: 1.4 }, { x: x + k * 0.9, z, a: 'carry', t: 1 }, { x: tx + k * 0.9, z: tz, a: 'carry', t: 1 }, { x: tx + k * 0.9, z: tz, a: 'squat', t: 1.4 }], { si: k * 2, spd: 0.9 }); });
    // Serma Hadi: mengawasi apel, hormat, lalu ke gerbang asrama
    const HA = spot(349.5, 40.5, 3), HG = spot(318, 63, 4);
    if (HA && HG) plan('sermaHadi', 'Serma Hadi', ['Ulangi. Yang benar.', 'Teman Dimas? Jam sembilan sudah di rumah.', 'Lari subuh besok, ikut kalau berani.'], [
      at(HA, 'idle', 5, { h: face(HA, 343.5, 44.5) }), at(HA, 'salute', 3, { h: face(HA, 343.5, 44.5) }), at(HA, 'raiseHand', 2, { h: face(HA, 343.5, 44.5), say: ['Ulangi. Yang benar.', 'Barisan lurus!'], p: 0.6 }), at(HA, 'look', 3, { h: face(HA, 343.5, 44.5) }),
      at(HG, 'look', 4), at(HG, 'talk', 3)], { si: 0 });
    // Tito: anak asrama main bola sendiri di lapangan kecil, sesekali ditemani bocah lain
    const TB = spot(306, 52, 8, yard(4));
    if (TB) { const TB2 = spot(TB[0] + 3.2, TB[1] + 0.6, 2) || TB;
      plan('tito', 'Tito', ['Kak Dimas bilang kakak jago, beneran?', 'Aku mau jadi kapten kayak Kak Dimas!', 'Lututku luka lagi, nggak apa-apa.'], [
        at(TB, 'kickBall', 1.2, { h: face(TB, ...TB2) }), { ...at(TB2, 'kickBall', 1.2, { h: face(TB2, ...TB) }), run: true }, at(TB2, 'cheer', 2, { say: ['Goool!', 'Kak Dimas bilang kakak jago, beneran?'], p: 0.4 }), { ...at(TB, 'jump', 1), run: true }, at(TB, 'laugh', 1.5)], { si: 0 });
      kids(TB[0] + 1.6, TB[1] - 3, 2, 2, ['Tito curang!', 'Oper, To!']); }
    // Mbak Sri: absen buruh shift di gerbang kawasan industri
    const SR = spot(346, 110, 6, yard(3));
    if (SR) { const BL = spots(okLand, 4, near(SR[0], SR[1] + 2.2, 1.6), 1);
      BL.forEach((q, i) => plan('buruh', 'Buruh ' + ['Yanto', 'Iwan', 'Sutini', 'Rohim'][i], ['Akhirnya pulang...', 'Lembur lagi minggu ini.'], [at(q, 'idle', 4, { h: face(q, ...SR) }), at(q, 'talk', 3, { h: face(q, ...SR) + 1 }), at(q, 'raiseHand', 1.5, { h: face(q, ...SR), say: ['Hadir!', 'Ada, Mbak!'], p: 0.5 }), at(q, 'scratch', 2, { h: face(q, ...SR) })], { shuffle: true }));
      plan('mbakSri', 'Mbak Sri', ['Absen dulu, baru ngeluh.', 'Shift dua masuk jam dua, jangan telat.', 'Mandor gudang itu bukan orang pabrik.'], [
        at(SR, 'raiseHand', 3, { h: face(SR, SR[0], SR[1] + 2.2), say: ['Absen dulu, baru ngeluh!', 'Shift dua, baris sini!'], p: 0.6 }), at(SR, 'read', 5, { h: face(SR, SR[0], SR[1] + 2.2) }), at(SR, 'talk', 3, { h: face(SR, SR[0], SR[1] + 2.2) }), at(SR, 'look', 3)], { si: 0 }); }
    // Pak Rusdi: mandor gudang subkontraktor, pegang daftar tenaga harian
    const RD = spot(360, 118, 6, (x, z) => okLand(x, z) && nearB(x, z, 2.5));
    if (RD) plan('pakRusdi', 'Pak Rusdi', ['Cari kerja harian? Nama masuk daftar dulu.', 'Gudang ini bukan tempat main, Dek.', 'Jangan banyak tanya.'], [
      at(RD, 'read', 6), at(RD, 'raiseHand', 2, { say: ['Yang namanya nggak ada di daftar, pulang!', 'Tenaga harian, kumpul sini!'], p: 0.5 }), at(RD, 'phone', 4, { say: ['Iya, Bang Sarip. Besok truknya masuk.'], p: 0.4 }), at(RD, 'think', 3)], { si: 0 });
  }

  if (id === 'sirkuit') {
    // pit: mekanik menyetel motor balap di depan garasi
    [3, 8, 13, 17].forEach((g, i) => { const gx = 346.1 + g * 2.1, mz = 216.2, c = ['#d8342c', '#2a6ac0', '#f2c230', '#2a2a2e'][i];
      parkedRide('motor', 'sport', c, gx, mz, -Math.PI / 2);
      plan('mekanik', 'Mekanik ' + ['Dodi', 'Ferry', 'Gugun', 'Hari'][i], ['Rantainya kendor, setel dulu.', 'Ban depan tekanannya kurang.', 'Mesin ini 150 cc, tapi larinya kenceng.'],
        [{ x: gx - 0.75, z: mz, a: 'squat', t: 7, h: 0 }, { x: gx - 0.75, z: mz, a: 'think', t: 2.5, h: 0 }, { x: gx, z: 215, a: 'look', t: 2, h: -Math.PI / 2 }, { x: gx + 0.75, z: mz, a: 'squat', t: 6, h: Math.PI }]);
      if (i % 2 === 0) plan('pemuda', 'Pembalap ' + ['Reza', 'Andre'][i / 2], ['Lap tadi 1 menit 12 detik!', 'Tikungan 4 rem telat, hampir keluar.'], [{ x: gx + 1.2, z: mz + 0.9, a: 'talk', t: 4, h: Math.PI }, { x: gx + 1.2, z: mz + 0.9, a: 'phone', t: 3, h: Math.PI }]); });
    // marshal mengibas bendera di tepi lintasan
    plan('satpam', 'Marshal', ['Jangan masuk lintasan!'], [{ x: 349, z: 225.2, a: 'wave', t: 4, h: -Math.PI / 2 }, { x: 349, z: 225.2, a: 'raiseHand', t: 2, h: -Math.PI / 2 }, { x: 349, z: 225.2, a: 'idle', t: 4, h: -Math.PI / 2 }]);
    // penonton di tribun: duduk, sesekali berdiri bersorak
    const tb = K.bldgs.find(b => Math.abs(b.x - 368) < 0.6 && Math.abs(b.y - 228.4) < 0.6);
    if (tb) { const y0 = Y(tb.x, tb.y);
      for (let i = 0; i < 14; i++) { const k = Math.floor(R() * 5), x = tb.x - tb.w / 2 + 1 + R() * (tb.w - 2), z = tb.y - tb.h / 2 + 0.32 + k * 0.64, y = y0 + 0.4 + k * 0.4, h = -Math.PI / 2;
        plan(rpick(['pemuda', 'remaja', 'anakPunk', 'mbak', 'siswaB', 'ibuHijab2', 'bocah', 'ojol']), 'Penonton', ['Gaspol!', 'Ayo nomor 46!', 'Seru banget!'],
          [{ x, z, a: 'sitDown', t: 8, h, y }, { x, z, a: 'cheer', t: 2.5, h, y, say: ['Gaspoool!', 'Wuuuu!', 'Ayo! Ayo!', 'Salip! Salip!'], p: 0.35 }, { x, z, a: 'clap', t: 2, h, y }, { x, z, a: 'sitDown', t: 5, h, y }], { si: Math.floor(R() * 4) }); } }
    // Pak Yusuf Tanjung: kepala race control, bicara di radio, menyusuri pit memeriksa motor
    const YA = spot(368, 214.6, 3), YB = spot(352.5, 214.8, 3);
    if (YA && YB) plan('pakYusuf', 'Pak Yusuf', ['Di sini cepat itu boleh. Di jalan, cepat itu bodoh.', 'Track day akhir bulan. Daftar di sekretariat.', 'Helm full face, jaket, sarung tangan. Wajib.'], [
      at(YA, 'phone', 4, { say: ['Race control ke marshal: tikungan empat bersih.', 'Bendera kuning, sektor dua.'], p: 0.5 }), at(YA, 'raiseHand', 2), at(YA, 'look', 3, { h: Math.PI / 2 }),
      at(YB, 'look', 3), at(YB, 'talk', 3, { say: ['Rantai dicek lagi sebelum turun!', 'Tekanan ban berapa?'], p: 0.5 }), at(YB, 'think', 2)], { si: 0, spd: 0.85 });
  }

  if (id === 'muara') {
    // lelang ikan di los TPI: juru lelang & pembeli di atas panggung
    const tpi = K.bldgs.find(b => Math.abs(b.x - 314) < 0.6 && Math.abs(b.y - 264) < 0.6);
    if (tpi) { const y = Y(tpi.x, tpi.y) + 0.75, h = -Math.PI / 2;
      plan('bapakPeci', 'Juru Lelang', ['Lelang subuh, Dek, ikan masih seger.'], [{ x: 312.4, z: 265.2, a: 'raiseHand', t: 3, h, y, say: ['Tongkol sekeranjang, seratus lima puluh!', 'Siapa lagi? Dua ratus!', 'Dua ratus... dua ratus... LAKU!', 'Kakap merah! Buka tiga ratus!'], p: 0.7 }, { x: 312.4, z: 265.2, a: 'talk', t: 3, h, y }]);
      [[314, 265.3], [315.2, 265.2], [316.4, 263.0], [313.8, 262.9]].forEach(([x, z], i) => plan(['ibuHijab', 'ibuDaster', 'pemuda', 'bapakPeci'][i], ['Bu Juragan', 'Bu Tini', 'Mas Bakul', 'Pak Bos Pindang'][i], ['Saya ambil yang tongkol.', 'Mahal amat, Pak!'],
        [{ x, z, a: 'think', t: 3, h: Math.atan2(265.2 - z, 312.4 - x), y }, { x, z, a: 'raiseHand', t: 1.6, h: Math.atan2(265.2 - z, 312.4 - x), y, say: ['Saya!', 'Dua ratus sepuluh!', 'Ambil!'], p: 0.5 }, { x, z, a: 'idle', t: 3, h: Math.atan2(265.2 - z, 312.4 - x), y }], { shuffle: true })); }
    // nelayan angkut keranjang ikan dari dermaga ke TPI
    const pier = K.bldgs.find(b => Math.abs(b.x - 318) < 0.6 && Math.abs(b.y - 270) < 0.6);
    if (pier) { const py = Math.max(Y(pier.x, pier.y), -0.3) + 0.6;
      for (let k = 0; k < 2; k++) plan('nelayan', 'Nelayan ' + ['Darsim', 'Waryo'][k], ['Melaut semalaman, dapet lumayan.', 'Ombak lagi gede, Dek.'],
        [{ x: 318 + (k ? 0.4 : -0.4), z: 272.2, a: 'squat', t: 2, h: Math.PI / 2, y: py }, { x: 318 + (k ? 0.4 : -0.4), z: 272.2, a: 'carry', t: 1, y: py, wy: py }, { x: 318 + (k ? 0.4 : -0.4), z: 267.6, a: 'carry', t: 0.3, y: py, wy: py }, { x: 316.4 + k * 0.6, z: 266.4, a: 'carry', t: 0.5 }, { x: 316.4 + k * 0.6, z: 266.4, a: 'squat', t: 1.6, h: -Math.PI / 2 }, { x: 318 + (k ? 0.4 : -0.4), z: 267.6, a: 'idle', t: 0.3, y: py }], { si: k * 3, spd: 0.85 });
      fisher('kakek', 'Mbah Tarjo', 318.3, 272.7, Math.PI / 2, ['Mancing di dermaga, nunggu perahu pulang.'], py); }
    // ibu-ibu menjemur ikan asin di kampung nelayan
    const IA = spots((x, z) => okLand(x, z) && okLand(x + 1, z) && okLand(x - 1, z) && nearB(x, z, 3), 2, [292, 246, 312, 262], 5);
    IA.forEach(([x, z], i) => { rack(x, z, 0); plan(i ? 'ibuHijab2' : 'ibuDaster', i ? 'Bu Sanah' : 'Mak Ijah', ['Ikan asin jemur tiga hari.', 'Beli, Dek? Sekilo murah.'],
      [{ x, z: z + 0.9, a: 'catch', t: 4, h: -Math.PI / 2 }, { x: x + 0.7, z: z + 0.9, a: 'catch', t: 4, h: -Math.PI / 2 }, { x: x + 0.7, z: z + 0.9, a: 'stretch', t: 2, h: Math.PI / 2 }]); });
    kids(300, 266, 3, 2, ['Kak, lihat perahu bapakku!', 'Main pasir yuk!']);
    fishersAt([326, 245, 393, 265], 2, ['nelayan', 'pemuda'], ['Mang Karta', 'Kang Ayi']);
    // Wak Kodir: juragan perahu, membetulkan jaring di kampung nelayan lalu ke dekat dermaga memanggil anak buah
    const KA = spot(309, 262.5, 5, (x, z) => okLand(x, z) && nearB(x, z, 3)), KB = spot(316.8, 266.8, 2);
    if (KA && KB) plan('wakKodir', 'Wak Kodir', ['Laut nggak kenal hari Minggu, Le.', 'Taruhan? Goceng, perahu siapa pulang duluan.', 'Anak saya kerja di pabrik, jarang pulang.'], [
      at(KA, 'squat', 8, { h: Math.PI / 2 }), at(KA, 'look', 4, { h: Math.PI / 2 }), at(KA, 'laugh', 2, { say: ['Laut nggak kenal hari Minggu, Le.', 'Jaring kusut lagi, haduh.'], p: 0.4 }),
      at(KB, 'raiseHand', 2, { h: Math.PI / 2, say: ['Woy, perahunya tarik ke pinggir!', 'Subuh besok kita berangkat!'], p: 0.6 }), at(KB, 'look', 4, { h: Math.PI / 2 })], { si: 0, spd: 0.85 });
  }

  if (id === 'pantai') {
    // voli pantai: empat pemain, bola melambung bergantian, net di tengah
    const VC = bboxOf([31]), cx = (VC[0] + VC[2]) / 2, cz = (VC[1] + VC[3]) / 2, yv = Y(cx, cz);
    prop(cx, cz, 0, xf => { for (const v of [-2.6, 2.6]) pm.box(xf, 0, 0, v, 0.1, 2.4, 0.1, col('#e8e8e8')); pm.box(xf, 0, 1.6, 0, 0.04, 0.7, 5.2, col('#2a2a30')); pm.box(xf, 0, 2.3, 0, 0.05, 0.08, 5.2, col('#f4f4f0')); });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshLambertMaterial({ color: '#f6e070' })); ball.castShadow = true; group.add(ball);
    const POS = [[-2.6, -1.2], [-2.4, 1.3], [2.5, -1.1], [2.6, 1.2]], game = { from: 0, to: 2, t: 0, T: 1.4 };
    const volExt = (n, dt) => {
      if (n.vi === 0) { game.t += dt;
        if (game.t >= game.T) { const f = game.to, side = f < 2 ? 0 : 2, mate = side + 1 - (f - side), other = side === 0 ? 2 + Math.floor(Math.random() * 2) : Math.floor(Math.random() * 2);
          game.to = game.from !== mate && Math.random() < 0.4 ? mate : other; game.from = f; game.t = 0; game.T = game.to === mate ? 0.9 : 1.4; }
        const a = vp[game.from], b = vp[game.to], t = game.t / game.T, hy = game.T > 1 ? 3.6 : 2.2;
        ball.position.set(a.x + (b.x - a.x) * t, yv + 1.7 + hy * 4 * t * (1 - t), a.z + (b.z - a.z) * t); }
      const me = vp[n.vi], tgt = game.to === n.vi && game.t > game.T - 0.45;
      n.x += (me.x - n.x) * Math.min(1, dt * 3); n.z += (me.z - n.z) * Math.min(1, dt * 3);
      n.heading = n.vi < 2 ? 0 : Math.PI;
      n.anim = tgt ? (game.T > 1 ? 'jump' : 'catch') : game.from === n.vi && game.t < 0.35 ? 'catch' : 'guard';
      if (Math.random() < dt * 0.5) { me.x = cx + POS[n.vi][0] + (Math.random() - 0.5) * 1.2; me.z = cz + LZ + POS[n.vi][1] + (Math.random() - 0.5) * 1.2; }
    };
    const vp = POS.map(([u, v]) => ({ x: cx + u, z: cz + LZ + v }));
    vp.forEach((p, i) => mk(['pemuda', 'remaja', 'anakPunk', 'siswaB'][i], ['Bagas', 'Dewa', 'Tio', 'Rafi'][i], p.x, p.z - LZ, ['Ikut main, Bro?', 'Skornya 14-12!', 'Smash!'], volExt, { vi: i }));
    plan('mbak', 'Penonton Voli', ['Ayo Bagas!'], [{ x: cx, z: cz - 4, a: 'sitDown', t: 6, h: Math.PI / 2 }, { x: cx, z: cz - 4, a: 'clap', t: 2, h: Math.PI / 2 }]);
    // perenang & anak main air di laut dangkal
    const SW = spots((x, z) => okWater(x, z) && !isW(x, z - 3.5), 4, [100, 255, 230, 285], 6);
    SW.forEach(([x, z], i) => { const h = R() * 6.28, x2 = x + Math.cos(h) * 4, z2 = z + Math.sin(h) * 4; if (!okWater(x2, z2)) return; const y = wl(x, z), y2 = wl(x2, z2);
      plan(['remaja', 'pemuda', 'bocah', 'anakSD'][i], ['Dimas kecil', 'Kang Yusuf', 'Ipin', 'Upin'][i], ['Airnya seger!', 'Jangan jauh-jauh, ombaknya kenceng.'],
        [{ x, z, a: 'tread', t: 4, y, sink: 0.55 }, { x: x2, z: z2, a: 'tread', t: 4, y: y2, sink: 0.55, mv: 'swim', wy: y2, wsink: 0.35 }, { x, z, a: 'tread', t: 2, y, sink: 0.55, mv: 'swim', wy: y, wsink: 0.35 }], { spd: 0.9 }); });
    // pedagang es kelapa keliling pantai
    walker('bapakPeci', 'Mang Es Kelapa', ['Es kelapa muda, Dek! Lima ribu!', 'Segerrr!'], line([[110, 259.5], [200, 260]], 0, 1), { spd: 0.6, idles: ['wave', 'idle'], chat: ['Es kelapaaa! Es kelapa mudaaa!', 'Seger, seger!'] });
    // pengunjung duduk di pasir menghadap laut, berjemur, foto
    const DS = spots((x, z) => okLand(x, z) && z > 258.5 && isW(x, z + 5), 6, [125, 255, 225, 270], 3);
    DS.forEach(([x, z], i) => plan(['turis', 'ibuHijab2', 'remaja', 'turis', 'siswiB', 'turis'][i], ['Wisatawan', 'Bu Wisatawan', 'Dewi kecil', 'Mas Turis', 'Lia', 'Opa Hans'][i], ['Sunsetnya bentar lagi.', 'Pantainya bersih ya.'],
      i % 3 === 2 ? [{ x, z, a: 'phone', t: 5, h: Math.PI / 2 }, { x, z, a: 'wave', t: 2, h: Math.PI / 2 }] : [{ x, z, a: 'sitDown', t: 9, h: Math.PI / 2 }, { x, z, a: 'laugh', t: 2, h: Math.PI / 2 + 1.2 }]));
    // pengunjung warung seafood ngobrol di depan deret warung
    chat(131, 261, ['pakRT', 'ibuHijab', 'ojol'], ['Pak Wisnu', 'Bu Wisnu', 'Bang Jek'], ['Cumi bakarnya mantap.', 'Pesen kelapa muda dua!', 'Ini enak banget, sumpah.']);
    farmers([19], 4);
    yards([177, 183, 258, 231], 4, (x, z) => inA(x, z, [30]));
    kids(196, 208, 3);
    // Bu Romlah: pemilik warung seafood, bakar ikan, teriak ke pelayan, antar pesanan
    const RW = spot(134, 258, 4), RX = spot(129.5, 258.5, 4);
    if (RW && RX) plan('buRomlah', 'Bu Romlah', ['Kopinya yang dingin ya, yang kemarin laris!', 'Anak sekolah? Sini, Ibu kasih harga pelajar.', 'Cumi bakar, kerang, udang. Segar dari TPI!'], [
      at(RW, 'squat', 4), at(RW, 'raiseHand', 2.5, { say: ['Neng! Meja tiga belum dibersihin!', 'Ikan bakarnya dua lagi!', 'Kopinya yang dingin ya, yang kemarin laris!'], p: 0.6 }), at(RX, 'carry', 2), at(RX, 'talk', 3), at(RW, 'laugh', 2)], { si: 0, spd: 0.8 });
    // Mbah Darmo: penjaga mercusuar, jalan pelan dengan lampu minyak, menatap laut
    const MA = spot(236, 284, 5), MB = spot(232.5, 285, 5), MC = spot(239, 283, 5);
    if (MA && MB && MC) plan('mbahDarmo', 'Mbah Darmo', ['Lampu ini dulu menuntun kapal pulang. Sekarang menuntun siapa, ya?', 'Tahun berapa sekarang, Le?', 'Kapal Gajah Mina dulu karam di karang itu.'], [
      at(MA, 'look', 6, { h: Math.PI / 2, say: ['Lampu ini dulu menuntun kapal pulang. Sekarang menuntun siapa, ya?'], p: 0.4 }), at(MB, 'sitDown', 10, { h: Math.PI / 2 }), at(MB, 'think', 3, { h: Math.PI / 2 }), at(MC, 'look', 5, { h: Math.PI / 2 })], { si: 0, spd: 0.35 });
    // Nek Sumi: jamu gendong keliling Desa Pandansari
    { let best = null, bd = 1e9; for (const r of roads) { if (r.kind === 'raya') continue; for (const [x, z] of r.pts) { const d = Math.hypot(x - 210, z - 195); if (d < bd) { bd = d; best = r; } } }
      const P = best && bd < 20 ? line(best.pts, 0.6).filter(q => Math.hypot(q.x - 210, q.z - 195) < 26) : [];
      if (P.length >= 4) walker('nekSumi', 'Nek Sumi', ['Kunyit asam, Nak? Biar nggak gampang marah kayak cucu Nenek.', 'Beras kencur, sepuluh ribu.', 'Andra itu cucu Nenek. Bandel, tapi baik.'], P, { spd: 0.5, idles: ['talk', 'wave', 'idle', 'look'], chat: ['Jamuuu! Jamu gendooong!', 'Kunyit asam, beras kencur!'] });
      else { const NS = spot(210, 192, 6); if (NS) plan('nekSumi', 'Nek Sumi', ['Kunyit asam, Nak? Biar nggak gampang marah kayak cucu Nenek.'], [at(NS, 'idle', 5), at(NS, 'talk', 3), at(NS, 'wave', 2)]); } }
  }

  if (id === 'pesisir') {
    // penumpang menunggu kereta di peron Stasiun Lintang
    const stn = K.bldgs.find(b => Math.abs(b.x - 34) < 0.6 && Math.abs(b.y - 240) < 0.6);
    if (stn) { const y = Y(stn.x, stn.y) + 0.45;
      [[36.3, 236.8, 'ibuHijab', 'phone'], [36.6, 238.6, 'siswaA', 'read'], [36.0, 240.4, 'kakek', 'idle'], [36.5, 242.3, 'mbak', 'phone'], [36.2, 243.4, 'bocah', 'look']].forEach(([x, z, sid, a], i) =>
        plan(sid, 'Penumpang', ['Keretanya telat lagi...', 'Mau ke kota, belanja.', 'Pulang kampung, Dek.'], [{ x, z, a, t: 6, h: Math.PI, y }, { x, z, a: 'look', t: 2, h: -Math.PI / 2, y }, { x, z, a: 'idle', t: 3, h: Math.PI, y }])); }
    // pemancing pantai Watu Sepi
    fishersAt([-40, 255, 20, 275], 3, ['nelayan', 'pemuda', 'kakek'], ['Mang Sarta', 'Kang Wawan', 'Aki Dirja']);
    // kemah di Watu Sepi
    const WS = spots((x, z) => okLand(x, z) && okLand(x + 3, z) && okLand(x - 3, z), 1, [-25, 256, 0, 266], 1);
    if (WS.length) { const [x, z] = WS[0]; tent(x - 2.5, z - 0.6, 0.2, '#3a9a5a'); fire(x, z); chat(x, z, ['pemuda', 'remaja'], ['Arya', 'Bima'], ['Sepi banget di sini, enak.', 'Nanti malem bakar ikan.'], true); }
    farmers([18], 4);
    const KR = spots((x, z) => okLand(x, z) && inA(x, z, [20]), 2, bboxOf([20]), 8);
    KR.forEach(([x, z]) => plan('petani', 'Pak Sadap', ['Getah karet nampung di batok.'], [{ x, z, a: 'squat', t: 6 }, { x: x + 2, z: z + 1.4, a: 'squat', t: 6 }]));
  }

  if (pm.n) { const me = new THREE.Mesh(pm.build(), MAT.world); me.castShadow = me.receiveShadow = true; group.add(me); }
  return { list };
}
