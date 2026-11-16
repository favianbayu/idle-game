// Raka (tokoh utama) versi voxel baru: anak SMA bandel, rambut mullet, suka berantem & balapan.
// Rangka & pose SAMA dengan humanShape di voxlib.js (semua ANIMS lama tetap jalan), tapi:
// - kepala kotak bertepi (bukan elipsoid) 10x10x10 voxel, dipaskan ke grid -> tiap piksel wajah = tepat 1 voxel
// - wajah digambar dari peta piksel (ekspresi: biasa, kedip, berantem, nyengir, kesakitan)
// - rambut mullet: atas jabrik berantakan, samping tipis + garis cukur, belakang panjang sampai punggung
// - badan lebih kotak (bahu lebar), seragam dikeluarkan, kancing atas terbuka (kaus hitam), kerah berdiri,
//   lengan digulung, tangan dililit lakban, rantai dompet, sneakers hitam-merah
// Satuan: 1 voxel = 1/32 petak (sama dengan voxworker.js).
import { ANIMS, organicColor, R, fixedRamp, hexRGB } from './voxlib.js';

const TAU = Math.PI * 2;
function hash(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const POSE0 = {
  lean: 0.03, hp: 0, thL: 0, thR: 0, knL: 0.1, knR: 0.1,
  arL: 0.08, arR: 0.08, elL: 0.25, elR: 0.25, spL: 0.12, spR: 0.12,
  tw: 0, px: 0, jump: 0, yaw: 0, sword: 0, swa: 0, orb: 0, broom: 0, bsw: 0,
  hy: 0, sy: 0, ftL: 0, ftR: 0, phone: 0, box: 0, book: 0,
};
const limb = a => [Math.sin(a), 0, -Math.cos(a)];
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
function capsule(p, a, b, r0, r1) {
  const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
  const apx = p[0] - a[0], apy = p[1] - a[1], apz = p[2] - a[2];
  const L2 = abx * abx + aby * aby + abz * abz;
  let t = L2 ? (apx * abx + apy * aby + apz * abz) / L2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const dx = apx - abx * t, dy = apy - aby * t, dz = apz - abz * t, r = r0 + (r1 - r0) * t;
  return dx * dx + dy * dy + dz * dz <= r * r ? t : -1;
}
const sph = (p, c, r) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2 <= r * r;

/* ---------------- Wajah: peta piksel 10 kolom (kiri layar -> kanan layar), baris dari dz=+1 (dahi) ke dz=-5 (dagu)
   .  kulit      b alis       e mata gelap   w putih mata   n bayangan hidung   m mulut   t gigi
   p  plester    c bekas luka k belang matahari (pipi)       l bayangan bibir bawah
   Baris 7 (dagu) hanya kolom 2..7 yang ada di kepala. */
export const FACES = {
  biasa: [
    '.bbb..bbb.',
    '..........',
    '..ew..ew..',
    '..ee..ee..',
    'pp......k.',
    '...mmmm...',
    '......l...',
  ],
  kedip: [
    '.bbb..bbb.',
    '..........',
    '..........',
    '..ee..ee..',
    'pp......k.',
    '...mmmm...',
    '......l...',
  ],
  berantem: [
    'bb......bb',
    '..bb..bb..',
    '..ew..ew..',
    '..ee..ee..',
    'pp......k.',
    '..mttttm..',
    '...mmmm...',
  ],
  nyengir: [
    '.bbb..bbb.',
    '..........',
    '..ew..ew..',
    '..ee..ee..',
    'pp......k.',
    '..mttttm..',
    '...mmmm...',
  ],
  sakit: [
    '...bb.bb..',
    '.bb.....b.',
    '..........',
    '.eee..eee.',
    'pp......k.',
    '...mmmm...',
    '....mm....',
  ],
};
// ujung senyum miring (smirk): piksel mulut naik satu baris di ujung kanan
const SMIRK = { biasa: [[5, 7], [4, 7]], kedip: [[5, 7], [4, 7]] };
const FACE_MAT = { b: 'brow', e: 'eye', w: 'eyeW', n: 'noseSh', m: 'mouth', t: 'teeth', p: 'plester', c: 'scar', k: 'sun', l: 'lipSh' };

/* ---------------- Pakaian */
export const RAKA_OUTFITS = {
  seragam: { name: 'Seragam bandel (dikeluarkan)', kind: 'seragam', top: '#f2f2ec', tee: '#1d1d22', bottom: '#7a7f88', shoe: '#1b1b20', sole: '#ecebe4', accent: '#d2382f' },
  balap:   { name: 'Jaket balap Lampu Kota', kind: 'jaket', top: '#1c1c21', trim: '#f2c230', tee: '#2e2e34', bottom: '#2b3a58', shoe: '#1b1b20', sole: '#ecebe4', accent: '#f2c230' },
  rumah:   { name: 'Kaus rumah + celana pendek', kind: 'kaus', top: '#d9c25a', tee: '#d9c25a', bottom: '#3d4450', shoe: '#2a6ac0', sole: '#2a6ac0', accent: '#2a6ac0', shorts: true, sandal: true },
};
export const RAKA_LOOK = { skin: '#d9a27a', hair: '#17110d', hairHi: '#4a3222', tip: '#7a4a28' };

function shade(hex, k) { return hexRGB(hex).map(v => Math.max(0, Math.min(255, Math.round(v * k)))); }
export function rakaRamps(o, look = RAKA_LOOK) {
  const r = {};
  const fx = c => [c];
  r.skin = R(look.skin); r.ear = [r.skin[0], r.skin[0], r.skin[1], r.skin[2]]; r.noseTip = R(look.skin);
  r.fade = R(look.skin).map(c => c.map((v, i) => Math.round(v * 0.62 + hexRGB(look.hair)[i] * 0.38)));
  r.shave = R(look.skin).map(c => c.map(v => Math.round(v * 0.92)));
  r.hair = R(look.hair); r.hair2 = r.hair.map(c => c.map(v => Math.round(v * 0.7)));
  r.hairHi = R(look.hairHi); r.tip = R(look.tip);
  // piksel wajah: warna tetap (tidak ikut bayangan) supaya tajam dari sudut mana pun
  r.brow = fx(hexRGB(look.hair)); r.eye = fx(hexRGB('#110d12')); r.eyeW = fx(hexRGB('#f6f2ea'));
  r.noseSh = fx(shade(look.skin, 0.8)); r.mouth = fx(hexRGB('#5e2420')); r.teeth = fx(hexRGB('#f6f2e8'));
  r.plester = fx(hexRGB('#ecd2a8')); r.scar = fx(shade(look.skin, 1.16)); r.sun = fx(shade(look.skin, 0.88)); r.lipSh = fx(shade(look.skin, 0.84));
  r.stud = fx(hexRGB('#e6e8ee'));
  r.top = R(o.top); r.tee = R(o.tee); r.bottom = R(o.bottom); r.cuffP = R(o.bottom).map(c => c.map(v => Math.round(v * 0.8)));
  r.shoe = R(o.shoe); r.sole = R(o.sole); r.accent = R(o.accent);
  r.trim = R(o.trim || '#f2c230');
  r.collar = R('#ffffff'); r.placket = R('#dcdcd4'); r.hem = R('#d0d0c8'); r.button = fx(hexRGB('#8a8a86'));
  r.cuff = R(o.top).map(c => c.map(v => Math.round(v * 0.9)));
  r.badge = fx(hexRGB('#d8a830')); r.nametag = fx(hexRGB('#1e2430')); r.seam = R('#bcbcb6');
  r.tape = R('#f0eee6'); r.band = R('#202024'); r.chain = R('#c8ccd4');
  r.print = R('#f2c230');
  return r;
}

/* ---------------- Ekspresi otomatis per gerakan */
const FIGHT = new Set(['jab', 'straight', 'hook', 'uppercut', 'kickFront', 'kickHigh', 'guard', 'rideSport', 'motoLean', 'sprint']);
const GRIN = new Set(['laugh', 'dance', 'wave', 'taunt', 'clap']);
const HURT = new Set(['fall', 'getup']);
export function exprFor(anim, i) {
  if (FIGHT.has(anim)) return 'berantem';
  if (GRIN.has(anim)) return 'nyengir';
  if (HURT.has(anim)) return 'sakit';
  if (anim === 'idle' && i === 5) return 'kedip';
  return 'biasa';
}

/* ---------------- Gerakan khas Raka (format sama dgn ANIMS di voxlib) */
const GUARD = { arL: 0.9, elL: 1.9, arR: 0.9, elR: 1.9, spL: 0.25, spR: 0.25, thL: 0.3, thR: -0.3, knL: 0.25, knR: 0.25, lean: 0.1, tw: 0 };
function keyed(keys) {
  let acc = Object.assign({}, POSE0);
  const full = keys.map(([t, p]) => [t, acc = Object.assign({}, acc, p)]);
  return t => {
    let i = 0;
    while (i < full.length - 2 && t > full[i + 1][0]) i++;
    const [t0, a] = full[i], [t1, b] = full[i + 1];
    let u = Math.max(0, Math.min(1, (t - t0) / (t1 - t0 || 1)));
    u = u * u * (3 - 2 * u);
    const o = {};
    for (const k in a) o[k] = a[k] + (b[k] - a[k]) * u;
    return o;
  };
}
const sinT = t => Math.sin(t * TAU), cosT = t => Math.cos(t * TAU);
export const RAKA_ANIMS = {
  // kuda-kuda: badan memantul pelan, kepalan di depan dagu
  guard: { name: 'Kuda-kuda', kind: 'full', n: 6, fps: 8, loop: true, pose: t => { const s = sinT(t);
    return { ...GUARD, tw: 0.35, lean: 0.14 + 0.02 * s, hp: -0.12, knL: 0.35 + 0.12 * s, knR: 0.35 + 0.12 * s, thL: 0.38, thR: -0.25, sy: 0.15 * s, elL: 1.95 + 0.08 * s, elR: 2.0 - 0.08 * s, jump: 0.35 * Math.max(0, s) }; } },
  // provokasi "Sini!": dagu naik, tangan kanan melambai ke arah badan
  taunt: { name: 'Provokasi "Sini!"', kind: 'full', n: 10, fps: 10, loop: true, pose: t => { const s = sinT(t * 2);
    return { lean: -0.08, hp: 0.22, hy: -0.1, thL: 0.25, thR: -0.2, knL: 0.15, knR: 0.15, arR: 1.45, spR: 0.2, elR: 0.9 + 0.75 * Math.max(0, s), arL: 0.15, elL: 0.6, spL: 0.35 }; } },
  // rapikan rambut ke belakang dengan satu tangan (gerak khas idle)
  hairFix: { name: 'Sisir rambut pakai jari', kind: 'upper', n: 10, fps: 8, pose: keyed([[0, {}], [0.3, { arR: 2.6, elR: 1.6, spR: 0.9, hp: 0.12, hy: -0.15 }],
    [0.65, { arR: 2.9, elR: 2.3, spR: 0.75, hp: 0.18 }], [1, {}]]) },
};
export const ALL_ANIMS = { ...ANIMS, ...RAKA_ANIMS };

/* ---------------- Kepala (koordinat sel kepala: ix maju, iy samping, iz naik; sel -5..4) */
const HW_ROW = { 4: 3, 3: 4, 2: 4, 1: 4, 0: 4, '-1': 4, '-2': 4, '-3': 4, '-4': 3, '-5': 2 };
const FR = [2, 3, 2, 2, 3, 2, 2, 3, 2, 2];          // bawah poni per kolom (choppy), selalu di atas alis (iz=1)
const BOT = [-7, -8, -9, -10, -9, -10, -9, -10, -8, -7];  // ujung mullet per kolom (bentuk V tak rata)
const ai = i => (i < 0 ? -i - 1 : i);               // jarak sel dari tengah (0..)
function skull(ix, iy, iz) {
  if (iz > 4 || iz < -5) return false;
  const hw = HW_ROW[iz], ay = ai(iy), ax = ai(ix);
  if (ay > hw) return false;
  if (ix > 4) return false;
  if (iz === 4 && (ix < -4 || ix > 3)) return false;
  if (iz >= -2 && ix < -5) return false;
  if (iz <= -3 && ix < -3 + (iz === -5 ? 1 : 0)) return false;   // rahang: hanya bagian depan
  if (iz >= -2 && iz <= 3 && ax === 4 && ay === 4) return false;  // sudut vertikal dipotong (tidak kotak tajam)
  if (iz <= -3 && ix === 4 && ay === hw) return false;            // sudut rahang depan membulat
  return true;
}
function hairCell(ix, iy, iz) {
  const ay = ai(iy), col = iy + 5;
  // helai: garis gelap tipis miring, jarang (supaya tidak belang)
  const strand = (((iy + 9) + (iz + 9) * 2 + (ix + 9)) % 7 === 0) ? 'hair2' : 'hair';
  // poni depan: menempel dahi (ix=4) + jumput menonjol 1 voxel (ix=5), selalu di atas alis
  if (col >= 0 && col <= 9) {
    if (ix === 4 && iz >= FR[col] && iz <= 4 && skull(ix, iy, Math.min(iz, 3))) return strand;
    if (ix === 5 && iz >= FR[col] + 1 && iz <= 3 && ay <= 3 && hash(col, 2, 9) < 0.7) return 'hair';
  }
  // atas: jabrik berantakan, tinggi 5..6 (tidak lebih lebar dari kepala), depan lebih rendah
  if (iz >= 3 && ix >= -6 && ix <= 4 && ay <= 4) {
    let top = 5 + (hash(Math.floor((ix + 8) / 2), Math.floor((iy + 8) / 2), 3) < 0.45 ? 1 : 0);
    if (ix >= 3 || ix <= -6 || ay === 4) top = Math.min(top, 5);
    if (ix >= 4 && ay >= 3) top = 4;
    if (ix <= -6 && ay >= 3) top = 4;
    if (iz <= top) return iz === top && hash(ix, iy, 5) < 0.4 ? 'hairHi' : strand;
  }
  // samping kepala (di permukaan tengkorak): rambut tipis + garis cukur di sisi kanan tokoh
  if (ay === 4 && iz >= 1 && iz <= 4 && ix >= -5 && ix <= 2 && skull(ix, iy, iz)) {
    if (iy < 0 && ((iz === 1 && ix >= -4 && ix <= 0) || (iz === 2 && ix >= -2 && ix <= 1))) return 'shave';
    return strand;
  }
  // belakang kepala: separuh belakang tengkorak + satu lapis di luar
  if (iz >= -2 && iz <= 4 && ((ix <= -3 && ix >= -5 && ay <= 4) || (ix === -6 && ay <= 3))) return strand;
  // mullet: ekor panjang menempel tengkuk, ujung mengembang keluar & sedikit pirang
  if (iz <= -3 && iz >= -11 && col >= 0 && col <= 9) {
    const bot = BOT[col], hw = iz >= -5 ? 3 : 2;
    if (ay <= hw && iz >= bot) {
      const x0 = iz >= -5 ? -6 : -5, x1 = iz >= -5 ? -4 : -3;
      const flip = iz <= bot + 1 ? -1 : 0;
      if (ix >= x0 + flip && ix <= x1) return iz <= bot + 1 ? 'tip' : strand;
    }
  }
  return null;
}
function headCell(ix, iy, iz, face, smirk) {
  const ay = ai(iy);
  const h = hairCell(ix, iy, iz);
  if (h) return h;
  // hidung menonjol 1 voxel (terbaca dari samping)
  if (ix === 5 && (iy === -1 || iy === 0) && iz === -2) return 'noseTip';
  // telinga + anting di telinga kiri tokoh
  if (ay === 5 && (ix === -1 || ix === 0) && iz >= -3 && iz <= -1) return iy > 0 && iz === -3 && ix === 0 ? 'stud' : 'ear';
  if (!skull(ix, iy, iz)) return null;
  // wajah depan
  if (ix === 4 && iz <= 1 && iz >= -5) {
    const row = 1 - iz, col = iy + 5;
    if (smirk && smirk.some(([r, c]) => r === row && c === col)) return 'mouth';
    const ch = face[row][col];
    return ch === '.' ? 'skin' : FACE_MAT[ch];
  }
  // profil samping: mata & alis terlihat dari samping (kolom paling luar)
  if (ay === 4 && ix === 3) {
    const row = 1 - iz, col = iy + 5, ch = face[row] && face[row][col];
    if (ch === 'e' || ch === 'w') return 'eye';
    if (ch === 'b') return 'brow';
  }
  // cambang di depan telinga, undercut (tipis) di bawah rambut samping
  if (ay === 4 && (ix === 1 || ix === 2) && iz >= -2 && iz <= 0) return 'hair';
  if (ay === 4 && ix <= 0 && iz >= -3 && iz <= -1) return 'fade';
  return 'skin';
}

/* ---------------- Badan */
export function rakaShape(P0, outfit = RAKA_OUTFITS.seragam, expr = 'biasa') {
  const P = Object.assign({}, POSE0, P0), S = 1.3;
  const O = outfit, JK = O.kind === 'jaket', KS = O.kind === 'kaus';
  const L = Math.ceil(27 * S), W = Math.ceil(19 * S), H = Math.ceil(42 * S);
  const cy = W / 2;
  const up = [Math.sin(P.lean), 0, Math.cos(P.lean)], fwd = [Math.cos(P.lean), 0, -Math.sin(P.lean)];
  const pelvis = [L / 2 - S + P.px * S, cy + P.sy * S, 0];
  const TL = 1.16, LL = 1.26, AL = 1.2, SHW = 3.55;
  const neck = add(pelvis, up, 7.8 * TL * S);
  const ha = P.lean + P.hp, hu = [Math.sin(ha), 0, Math.cos(ha)];
  const hf = [Math.cos(ha) * Math.cos(P.hy), Math.sin(P.hy), -Math.sin(ha) * Math.cos(P.hy)], hsd = [-Math.sin(P.hy), Math.cos(P.hy), 0];
  const head = add(neck, hu, 6.2);
  const arms = [-1, 1].map(s => {
    const k = s < 0 ? 'L' : 'R', a = P['ar' + k], el = P['el' + k], sp = P['sp' + k];
    const sh = add(add(pelvis, up, 6.5 * TL * S), [-s * SHW * S * Math.sin(P.tw), s * SHW * S * Math.cos(P.tw), 0]);
    const dir = (ang, b) => [Math.sin(ang) * Math.cos(b), s * Math.sin(b), -Math.cos(ang) * Math.cos(b)];
    const elbow = add(sh, dir(a, sp), 3.3 * AL * S);
    const hand = add(elbow, dir(a + el, sp * 0.5), 3.1 * AL * S);
    return { s, sh, elbow, hand };
  });
  const legs = [-1, 1].map(s => {
    const k = s < 0 ? 'L' : 'R', th = P['th' + k], kn = P['kn' + k];
    const hip = add(add(pelvis, up, -0.3 * S), [0, s * 1.75 * S, 0]);
    const knee = add(hip, limb(th), 4.4 * LL * S);
    const ankle = add(knee, limb(th - kn), 4.3 * LL * S);
    const toe = add(ankle, limb(th - kn + Math.PI / 2 + P['ft' + k]), 1.8 * S);
    return { s, hip, knee, ankle, toe };
  });
  const butt = add(pelvis, up, -1.0 * S), chest = add(pelvis, up, 3.0 * TL * S);
  const gp = [[butt, 0.5], [chest, 2.1], [neck, 2.0], [head, 5.2 / S]];
  for (const a of arms) gp.push([a.elbow, 1.2], [a.hand, 1.25]);
  for (const l of legs) gp.push([l.knee, 1.5], [l.ankle, 1.3], [l.toe, 1.2]);
  const shift = -Math.min(...gp.map(([p, r]) => p[2] - r * S));
  const buttZ = butt[2] + shift - 0.6 * S;
  const pts = [pelvis, neck, head, butt, chest];
  for (const a of arms) pts.push(a.sh, a.elbow, a.hand);
  for (const l of legs) pts.push(l.hip, l.knee, l.ankle, l.toe);
  for (const p of pts) p[2] += shift;
  // kepala dipaskan ke grid voxel -> peta piksel wajah jatuh tepat 1 piksel = 1 voxel
  for (let i = 0; i < 3; i++) head[i] = Math.round(head[i]);

  const face = FACES[expr] || FACES.biasa, smirk = SMIRK[expr];
  const neck0 = add(neck, up, -0.8 * S), neck1 = add(neck, hu, 2.2);
  const side = [0, 1, 0];
  // rantai dompet: dari saku depan kanan melengkung turun ke saku belakang
  const chainPts = [];
  for (let i = 0; i <= 10; i++) {
    const u = i / 10, a = 1.2 - 2.9 * u, d = -0.4 - 2.8 * Math.sin(u * Math.PI);
    chainPts.push(add(add(add(pelvis, side, 2.95 * S), fwd, a * S), up, d * S));
  }

  const torsoMat = (f, wy, rx, t) => {
    const front = f > rx * 0.45;
    if (KS) { if (t > 0.9 && front && Math.abs(wy) < 1.0) return 'skin'; return t > 0.86 && front && Math.abs(wy) < 1.5 ? 'cuff' : 'top'; }
    if (JK) {
      if (t < 0.07) return 'trim';
      if (f > 0 && Math.abs(wy) < 0.75) { if (t > 0.9) return 'skin'; return t > 0.42 && t < 0.62 && Math.abs(wy) < 0.6 && f > rx * 0.7 ? 'print' : 'tee'; }
      if (f > 0 && Math.abs(wy) < 1.15) return 'trim';                       // lis kuning sepanjang ritsleting
      if (f < -rx * 0.55) {                                                  // emblem bohlam di punggung
        const bx = wy / 1.25, bz = (t - 0.66) / 0.11;
        if (bx * bx + bz * bz < 1 || (Math.abs(wy) < 0.55 && t > 0.47 && t < 0.57)) return 'trim';
      }
      if (Math.abs(Math.abs(wy) - 2.6) < 0.35 && t > 0.6) return 'trim';    // garis bahu
      return 'top';
    }
    // seragam: 2 kancing atas terbuka -> kaus hitam terlihat (V), sisanya kancing; dikeluarkan (ujung di bawah ikat pinggang)
    if (front) {
      const v = t > 0.58 ? 0.35 + (t - 0.58) * 3.4 : -1;
      if (Math.abs(wy) < v) return t > 0.93 ? 'skin' : 'tee';
      if (Math.abs(wy) < v + 0.55) return 'placket';
      if (t <= 0.58 && Math.abs(wy) < 0.42) return Math.floor(t * 16) % 3 === 0 ? 'button' : 'placket';
      if (wy < -0.85 && wy > -2.25 && t > 0.5 && t < 0.72) {                // saku + badge OSIS
        if (t > 0.63 && t < 0.7 && wy < -1.15 && wy > -1.9) return 'badge';
        return t < 0.535 || wy > -1.0 || wy < -2.1 ? 'seam' : 'top';
      }
      if (wy > 1.0 && wy < 2.2 && t > 0.62 && t < 0.69) return 'nametag';
    }
    if (t < 0.035) return 'hem';
    return 'top';
  };

  const upperFn = (p) => {
    // kepala (sel kepala)
    const vx = p[0] - head[0], vy = p[1] - head[1], vz = p[2] - head[2];
    const dx = vx * hf[0] + vy * hf[1] + vz * hf[2], dy = vx * hsd[0] + vy * hsd[1], dz = vx * hu[0] + vz * hu[2];
    if (dx > -8.5 && dx < 7 && Math.abs(dy) < 7 && dz > -12 && dz < 8) {
      const m = headCell(Math.floor(dx), Math.floor(dy), Math.floor(dz), face, smirk);
      if (m) return m;
    }
    // lengan
    for (const a of arms) {
      const fd = norm(sub(a.hand, a.elbow));
      if (sph(p, a.hand, 1.2 * S)) {                                       // kepalan + lakban di buku jari
        const q = sub(p, a.hand), along = q[0] * fd[0] + q[1] * fd[1] + q[2] * fd[2];
        return along > 0.15 * S || (!JK && !KS && along > -0.5 * S && a.s > 0) ? 'tape' : 'skin';
      }
      if (!KS) {
        const c0 = lerp(a.sh, a.elbow, JK ? 1.25 : 0.5), c1 = lerp(a.sh, a.elbow, JK ? 1.5 : 0.7);
        if (JK) { const e0 = lerp(a.elbow, a.hand, 0.35), e1 = lerp(a.elbow, a.hand, 0.52); if (capsule(p, e0, e1, 1.2 * S, 1.15 * S) >= 0) return 'trim'; }
        else if (capsule(p, c0, c1, 1.42 * S, 1.36 * S) >= 0) return 'cuff';   // lengan kemeja digulung
      }
      const t1 = capsule(p, a.sh, a.elbow, 1.3 * S, 1.08 * S);
      if (t1 >= 0) return JK || t1 < (KS ? 0.45 : 0.5) ? 'top' : 'skin';
      const t2 = capsule(p, a.elbow, a.hand, 1.08 * S, 0.92 * S);
      if (t2 >= 0) {
        if (JK && t2 < 0.4) return 'top';
        if (a.s < 0 && t2 > 0.72 && t2 < 0.88) return 'band';             // gelang karet hitam di tangan kiri
        return 'skin';
      }
    }
    // badan atas: penampang kotak membulat (superelips) -> bahu tegas, tidak bulat
    const wx = p[0] - pelvis[0], wy0 = p[1] - pelvis[1], wz = p[2] - pelvis[2];
    const t = ((wx * up[0] + wz * up[2]) / S + 1.0) / (9 * TL);
    const f0 = (wx * fwd[0] + wz * fwd[2]) / S, wy = wy0 / S;
    // kerah berdiri (seragam & jaket), terbuka di depan
    if (!KS && t > 0.84 && t < 1.06) {
      const nf = f0 - 0.15, rr = Math.hypot(nf / 1.25, wy / 1.5);
      if (rr > 0.85 && rr < 1.55 && !(nf > 0.3 && Math.abs(wy) < 1.0)) return JK ? 'trim' : 'collar';
    }
    if (t >= -0.06 && t <= 1) {
      const tc = Math.max(0, t);
      let ry = 2.75 + 1.05 * tc, rx = 1.95 + 0.4 * tc;
      if (t < 0.22) { ry = Math.max(ry, 3.05); rx = Math.max(rx, 2.25); }  // ujung kemeja menggantung di luar celana
      if (JK) { ry += 0.25; rx += 0.25; }
      if (t > 0.74) { const k = Math.sqrt(Math.max(0, 1 - ((t - 0.74) / 0.28) ** 2)); ry *= 0.5 + 0.5 * k; rx *= 0.62 + 0.38 * k; }
      if ((Math.abs(f0) / rx) ** 3 + (Math.abs(wy) / ry) ** 3 <= 1) return torsoMat(f0, wy, rx, t);
    }
    if (capsule(p, neck0, neck1, 1.25 * S, 1.2 * S) >= 0) return 'skin';
    return null;
  };

  const lowerFn = (p) => {
    for (const l of legs) {
      const t = capsule(p, l.ankle, l.toe, 1.45 * S, 1.25 * S);
      if (t >= 0) {
        if (O.sandal) return p[2] < Math.min(l.ankle[2], l.toe[2]) - 0.5 * S ? 'sole' : 'skin';
        const low = p[2] < Math.min(l.ankle[2], l.toe[2]) - 0.55 * S;
        if (low) return 'sole';
        if (Math.abs(p[1] - l.ankle[1]) > 1.0 * S && t > 0.25 && t < 0.75 && p[2] < Math.max(l.ankle[2], l.toe[2])) return 'accent';
        return 'shoe';
      }
    }
    for (const c of chainPts) if (!KS && sph(p, c, 0.62)) return 'chain';
    const wx = p[0] - pelvis[0], wy = p[1] - pelvis[1], wz = p[2] - pelvis[2];
    const t = ((wx * up[0] + wz * up[2]) / S + 1.0) / (9 * TL);
    if (t >= 0 && t < 0.2) {
      const ry = 2.75, rx = 1.95, ff = (wx * fwd[0] + wz * fwd[2]) / S;
      if ((Math.abs(ff) / rx) ** 3 + (Math.abs(wy / S) / ry) ** 3 <= 1) return 'bottom';
    }
    for (const l of legs) {
      const t1 = capsule(p, l.hip, l.knee, 1.7 * S, 1.35 * S);
      if (t1 >= 0) return O.shorts && t1 > 0.75 ? 'skin' : 'bottom';
      const t2 = capsule(p, l.knee, l.ankle, 1.35 * S, 1.25 * S);
      if (t2 >= 0) return O.shorts ? 'skin' : t2 > 0.86 ? 'cuffP' : 'bottom';
    }
    return null;
  };
  const p = [0, 0, 0];
  const mat = (x, y, z) => {
    p[0] = x + 0.5; p[1] = y + 0.5; p[2] = z + 0.5;
    return upperFn(p) || lowerFn(p);
  };
  // kotak batas
  const sp = [[pelvis, 4.8], [neck, 4.4], [head, 8.5 / S], [add(add(head, hu, -8), hf, -4.5), 6 / S]];
  for (const a of arms) sp.push([a.sh, 2.2], [a.elbow, 2.2], [a.hand, 2.2]);
  for (const l of legs) sp.push([l.hip, 2.6], [l.knee, 2.6], [l.ankle, 2.6], [l.toe, 2.4]);
  const lo = [0, 1, 2].map(i => Math.min(...sp.map(([c, r]) => c[i] - r * S)) - 1);
  const hi = [0, 1, 2].map(i => Math.max(...sp.map(([c, r]) => c[i] + r * S)) + 1);
  let sink = 0;
  for (let z = Math.floor(lo[2]); z < 0 && !sink; z++)
    for (let y = Math.floor(lo[1]); y <= Math.ceil(hi[1]) && !sink; y++) for (let x = Math.floor(lo[0]); x <= Math.ceil(hi[0]); x++) {
      p[0] = x + 0.5; p[1] = y + 0.5; p[2] = z + 0.5;
      if (upperFn(p) || lowerFn(p)) { sink = -z; break; }
    }
  lo[2] += sink; hi[2] += sink;
  const hx = Math.ceil(Math.max(L / 2 - lo[0], hi[0] - L / 2)), hy = Math.ceil(Math.max(W / 2 - lo[1], hi[1] - W / 2));
  const ox = Math.max(0, hx - Math.floor(L / 2)), oy = Math.max(0, hy - Math.floor(W / 2));
  const L2 = L + ox * 2, W2 = W + oy * 2, H2 = Math.max(H, Math.ceil(hi[2]) + 1);
  const bbox = [Math.max(0, Math.floor(lo[0] + ox)), Math.max(0, Math.floor(lo[1] + oy)), Math.max(0, Math.floor(lo[2])),
                Math.min(L2 - 1, Math.ceil(hi[0] + ox)), Math.min(W2 - 1, Math.ceil(hi[1] + oy)), H2 - 1];
  const mat2 = ox || oy || sink ? (x, y, z) => mat(x - ox, y - oy, z - sink) : mat;
  return { mat: mat2, L: L2, W: W2, H: H2, bbox, lift: P.jump * S, buttZ: buttZ + sink, buttX: butt[0] - L / 2,
    joints: { hands: arms.map(a => [a.hand[0] - butt[0], a.hand[2] - butt[2] + 0.6 * S]), ankles: legs.map(l => [l.ankle[0] - butt[0], l.ankle[2] - butt[2] + 0.6 * S]) } };
}
export const rakaColor = (outfit, look) => { const r = rakaRamps(outfit, look); return organicColor(m => r[m]); };
