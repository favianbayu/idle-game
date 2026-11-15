// Worker: membangun mesh voxel tokoh (per gaya, per animasi, per frame) di luar thread utama,
// supaya game tidak tersendat saat tokoh baru muncul.
import { STYLES, ANIMS, humanShape, buildVox, R, fixedRamp, organicColor } from './voxlib.js';
import { NPC_STYLES } from './npc_styles.js';
import { EXTRA_STYLES } from './npc_extra.js';

// Gaya tokoh SMA: ramp warna dibuat sama seperti loop STYLES di renderer lama.
const ALL = { ...NPC_STYLES, ...EXTRA_STYLES };
for (const id in ALL) {
  const st = { ...ALL[id] }, r = {};
  r.skin = R(st.skin); r.nose = [r.skin[0], r.skin[0], r.skin[1], r.skin[1]];
  r.hair = R(st.hair || '#222222'); r.hair2 = r.hair.map(c => c.map(v => Math.round(v * 0.72))); r.brow = [r.hair[0], r.hair[0], r.hair[0], r.hair[1]];
  r.tie = R(st.tie || '#e83a5a'); r.helmet = R(st.helmet || '#2fa04a'); r.visor = R('#2a3440'); r.phone = fixedRamp('#1e2230'); r.stubble = [r.skin[0], r.skin[1], r.skin[1], r.skin[2]];
  if (st.hairStyle === 'hijab') r.brow = [R('#3a2418')[0], R('#3a2418')[0], R('#3a2418')[1], R('#3a2418')[1]];
  r.top = R(st.top); r.top2 = R(st.top2 || st.top); r.bottom = R(st.bottom); r.bottom2 = R(st.bottom2 || st.bottom);
  r.shoe = R(st.shoe); r.sole = R('#2a2420'); r.hijab = R(st.hijab || '#888888'); r.peci = R('#1e1e24'); r.cap = R(st.cap || '#cc3333');
  r.eye = fixedRamp('#16121e'); r.eyeW = fixedRamp('#ffffff'); r.mouth = fixedRamp('#9a3f38'); r.blush = fixedRamp('#ec8f82'); r.glasses = fixedRamp('#26262c');
  r.blade = R('#c4ced8'); r.hilt = R('#b07a26'); r.orb = R('#8fe0ff'); r.stick = R('#9a7440'); r.bristle = R('#d4b36a');
  st.ramps = r; st.color = organicColor(m => r[m]);
  STYLES[id] = st;
}

const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const LIN = new Float32Array(256).map((_, i) => lin(i));
const S = 1 / 32;   // 1 voxel = 1/32 petak

// sisi: [bit mask, normal (dunia), 4 sudut (offset voxel x,y,z)]
// dunia: X = x, Y = z, Z = -y  (rotasi murni, tidak tercermin)
const FACES = [
  [1, [1, 0, 0], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]],     // +x
  [2, [-1, 0, 0], [[0, 1, 0], [0, 0, 0], [0, 0, 1], [0, 1, 1]]],    // -x
  [4, [0, 0, -1], [[1, 1, 0], [0, 1, 0], [0, 1, 1], [1, 1, 1]]],    // +y  -> -Z
  [8, [0, 0, 1], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]],     // -y  -> +Z
  [16, [0, 1, 0], [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]],    // +z  -> +Y
  [32, [0, -1, 0], [[0, 1, 0], [1, 1, 0], [1, 0, 0], [0, 0, 0]]],   // -z  -> -Y
];

function mesh(m) {
  const { L, W, vox } = m;
  let nq = 0;
  for (let i = 0; i < vox.length; i += 7) { let k = vox[i + 6]; while (k) { nq += k & 1; k >>= 1; } }
  const pos = new Float32Array(nq * 12), nor = new Int8Array(nq * 12), col = new Float32Array(nq * 12);
  const idx = new Uint32Array(nq * 6);
  let q = 0;
  const cx = L / 2, cy = W / 2;
  for (let i = 0; i < vox.length; i += 7) {
    const x = vox[i], y = vox[i + 1], z = vox[i + 2], r = LIN[vox[i + 3]], g = LIN[vox[i + 4]], b = LIN[vox[i + 5]], mask = vox[i + 6];
    for (const [bit, n, corners] of FACES) {
      if (!(mask & bit)) continue;
      for (let c = 0; c < 4; c++) {
        const o = (q * 4 + c) * 3, [dx, dy, dz] = corners[c];
        pos[o] = (x + dx - cx) * S; pos[o + 1] = (z + dz) * S; pos[o + 2] = -(y + dy - cy) * S;
        nor[o] = n[0] * 127; nor[o + 1] = n[1] * 127; nor[o + 2] = n[2] * 127;
        col[o] = r; col[o + 1] = g; col[o + 2] = b;
      }
      const v = q * 4, j = q * 6;
      idx[j] = v; idx[j + 1] = v + 1; idx[j + 2] = v + 2; idx[j + 3] = v; idx[j + 4] = v + 2; idx[j + 5] = v + 3;
      q++;
    }
  }
  return { pos, nor, col, idx };
}

self.onmessage = e => {
  const { key, sid, anim, i } = e.data;
  const A = ANIMS[anim], st = STYLES[sid];
  const t = A.loop ? i / A.n : i / Math.max(1, A.n - 1);
  const sh = humanShape(A.pose(t), st, 'all');
  const m = buildVox(sh.L, sh.W, sh.H, sh.mat, st.color, { bbox: sh.bbox });
  const g = mesh(m);
  g.lift = (sh.lift || 0) * S;
  self.postMessage({ key, ...g }, [g.pos.buffer, g.nor.buffer, g.col.buffer, g.idx.buffer]);
};
self.postMessage({ ready: true, anims: Object.fromEntries(Object.entries(ANIMS).map(([k, a]) => [k, { n: a.n, fps: a.fps, loop: !!a.loop }])),
  names: Object.fromEntries(Object.entries(STYLES).map(([k, s]) => [k, s.name])) });
