// Diekstrak otomatis dari sprite-stacking/index.html (cabang claude/relaxed-ride-1e8tfb): bentuk tokoh voxel,
// gaya, dan animasi. Bagian canvas diganti: buildVox di sini mengembalikan daftar voxel berwarna, bukan irisan canvas.
const TAU = Math.PI * 2;
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function hash(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function rng(seed) { let s = (seed >>> 0) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }
const hexRGB = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const clamp255 = v => Math.max(0, Math.min(255, Math.round(v)));
const mixc = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
// 4 tingkat warna (gelap -> terang) dari satu warna dasar
function ramp(hex) {
  const c = hexRGB(hex);
  return [mixc(c.map(v => v * 0.55), [40, 24, 64], 0.18), c.map(v => v * 0.8), c, mixc(c, [255, 248, 228], 0.3)].map(a => a.map(clamp255));
}
const RAMP_CACHE = {};
const R = hex => RAMP_CACHE[hex] || (RAMP_CACHE[hex] = ramp(hex));

/* buildVox: fill(x,y,z) -> material (atau null); color(x,y,z,m,exp,at) -> [r,g,b].
   exp = sisi mana yang terbuka (top, xp, xn, yp, yn). */
function buildVox(L, W, H, fill, color, o = {}) {
  const bb = o.bbox || [0, 0, 0, L - 1, W - 1, H - 1];
  const grid = new Array(L * W * H);
  const I = (x, y, z) => (z * W + y) * L + x;
  for (let z = bb[2]; z <= bb[5]; z++) for (let y = bb[1]; y <= bb[4]; y++) for (let x = bb[0]; x <= bb[3]; x++) {
    const m = fill(x, y, z);
    if (m) grid[I(x, y, z)] = m;
  }
  const at = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= L || y >= W || z >= H) ? null : grid[I(x, y, z)];
  const vox = [];   // x, y, z, r, g, b, mask sisi terbuka (bit: +x -x +y -y +z -z)
  for (let z = bb[2]; z <= bb[5]; z++) for (let y = bb[1]; y <= bb[4]; y++) for (let x = bb[0]; x <= bb[3]; x++) {
    const m = grid[I(x, y, z)];
    if (!m) continue;
    const e = { top: !at(x, y, z + 1), xp: !at(x + 1, y, z), xn: !at(x - 1, y, z), yp: !at(x, y + 1, z), yn: !at(x, y - 1, z) };
    const mask = (e.xp ? 1 : 0) | (e.xn ? 2 : 0) | (e.yp ? 4 : 0) | (e.yn ? 8 : 0) | (e.top ? 16 : 0) | (!at(x, y, z - 1) ? 32 : 0);
    if (!mask) continue;
    const c = color(x, y, z, m, e, at);
    vox.push(x, y, z, c[0], c[1], c[2], mask);
  }
  return { L, W, H, vox };
}
function vnoise(x, y, s, seed = 5) {
  const gx = Math.floor(x / s), gy = Math.floor(y / s), fx = x / s - gx, fy = y / s - gy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(gx, gy, seed), b = hash(gx + 1, gy, seed), c = hash(gx, gy + 1, seed), d = hash(gx + 1, gy + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
/* Pewarnaan bangunan dengan "weathering": kotor di bagian bawah dinding, noda rembesan
   vertikal, lumut, dan variasi warna. Material diawali '!' = bersih (kaca, tulisan). */
const DIRT = [62, 52, 40], MOSS = [84, 98, 56];
function weatherColor(x, y, z, m, e, at) {
  const clean = m[0] === '!';
  const r = R(clean ? m.slice(1) : m);
  if (!(e.top || e.xp || e.xn || e.yp || e.yn)) return r[1];
  let i = e.top ? 3 : (e.xp || e.yp) ? 2 : 1;
  if (z === 0 && !e.top) i = Math.max(0, i - 1);
  if (clean) return r[i];
  const u = e.top ? x : (e.xp || e.xn) ? y : x, v = e.top ? y : z;
  const n = vnoise(u + 31 * (e.top ? 0 : 1), v, 7, 11), n2 = vnoise(u, v + 17, 13, 23);
  let c = r[i].map(k => k * (0.92 + 0.12 * n));
  if (!e.top && z < 12) c = mixc(c, DIRT, (1 - z / 12) * (0.25 + 0.25 * n2));               // kotor dekat tanah
  if (!e.top && hash(u, 0, 77) < 0.16) c = mixc(c, DIRT, 0.12 + 0.1 * n);                    // noda rembesan
  if (n2 > 0.68 && (z < 16 || e.top)) c = mixc(c, MOSS, Math.min(0.45, (n2 - 0.68) * 1.8)); // lumut
  return c.map(clamp255);
}
// Potong model jadi 2 lapis: bawah (dinding/batang) & atas (atap/kanopi) supaya urutan gambar pas
function splitModel(m, zs) {
  const base = Object.assign({}, m, { slices: m.slices.slice(0, zs), H: Math.min(zs, m.H) });
  const top = { L: m.L, W: m.W, H: Math.max(0, m.H - zs), slices: m.slices.slice(zs), lift: zs, shadow: m.shadow };
  return [base, top];
}
// Pewarnaan "kotak": atas paling terang, sisi depan/kanan sedang, sisi lain gelap
function boxColor(look) {
  return (x, y, z, m, e) => {
    const r = look(m);
    let i = e.top ? 3 : (e.xp || e.yp) ? 2 : 1;
    if (z === 0 && !e.top) i = Math.max(0, i - 1);
    return r[i];
  };
}
// Pewarnaan "organik": normal permukaan dari tetangga kosong -> cahaya -> 4 tingkat warna
const LIGHT = (() => { const v = [0.35, -0.45, 0.82], l = Math.hypot(...v); return v.map(c => c / l); })();
const NOFF = [];
for (let k = -2; k <= 2; k++) for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) {
  const d = i * i + j * j + k * k;
  if (d && d <= 6) NOFF.push([i, j, k, 1 / d]);
}
function organicColor(look) {
  return (x, y, z, m, e, at) => {
    const r = look(m);
    if (r.length === 1) return r[0];
    if (!(e.top || e.xp || e.xn || e.yp || e.yn)) return r[1];
    let nx = 0, ny = 0, nz = 0;
    for (const [i, j, k, w] of NOFF) if (!at(x + i, y + j, z + k)) { nx += i * w; ny += j * w; nz += k * w; }
    const l = Math.hypot(nx, ny, nz) || 1;
    const v = 0.38 + 0.62 * Math.max(0, (nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]) / l);
    return r[v < 0.5 ? 0 : v < 0.72 ? 1 : v < 0.9 ? 2 : 3];
  };
}
const boxHex = boxColor(R), organicHex = organicColor(R);

/* =====================================================================
   2. MANUSIA ORGANIK (tinggi ±36 voxel)
   Rangka -> bentuk bulat (elipsoid/kapsul) -> cahaya per voxel.
   Tiap tokoh = STYLE (warna, rambut, pakaian, skala).
   ===================================================================== */
const STYLES = {
  player:     { name: 'Kamu', scale: 1.33, skin: '#f0c09a', hair: '#3a2416', hairStyle: 'spiky', top: '#d64545', sleeves: 'short', bottom: '#3a5bb0', bottomStyle: 'pants', shoe: '#3b2a22', shoeStyle: 'shoe' },
  ibuHijab:   { name: 'Bu Siti', scale: 1.25, skin: '#e8b48c', hijab: '#c2477a', hairStyle: 'hijab', top: '#efe3cc', sleeves: 'long', bottom: '#5a3d7a', bottom2: '#d8b860', bottomStyle: 'skirt', bottomPattern: 'batik', shoe: '#5a3a2a', shoeStyle: 'sandal' },
  ibuHijab2:  { name: 'Bu Ani', scale: 1.25, skin: '#d9a37c', hijab: '#2f7a8a', hairStyle: 'hijab', top: '#f0cfa0', sleeves: 'long', bottom: '#3a4a6a', bottom2: '#9ab0d0', bottomStyle: 'skirt', bottomPattern: 'batik', shoe: '#2a2a2a', shoeStyle: 'sandal' },
  ibuDaster:  { name: 'Bu Narti', scale: 1.24, skin: '#d9a07a', hair: '#2a1a12', hairStyle: 'bun', top: '#e0705a', top2: '#f6d27a', topPattern: 'batik', sleeves: 'short', bottom: '#e0705a', bottom2: '#f6d27a', bottomStyle: 'skirt', bottomPattern: 'batik', shoe: '#3a7a4a', shoeStyle: 'sandal' },
  bapakPeci:  { name: 'Pak Haji', scale: 1.3, skin: '#c98e66', hair: '#1e1a18', hairStyle: 'peci', top: '#f2f0ea', top2: '#b8b0a0', topPattern: 'koko', sleeves: 'long', bottom: '#2f6b52', bottom2: '#c9b26a', bottomStyle: 'sarung', bottomPattern: 'plaid', shoe: '#2a2a2a', shoeStyle: 'sandal', belly: 0.7 },
  kakek:      { name: 'Mbah Darmo', scale: 1.22, skin: '#c08a64', hair: '#dcd8d0', hairStyle: 'bald', top: '#ece8dc', sleeves: 'short', bottom: '#7a4a2a', bottom2: '#3a2a1a', bottomStyle: 'sarung', bottomPattern: 'plaid', shoe: '#3a3a3a', shoeStyle: 'sandal', glasses: true },
  pakRT:      { name: 'Pak RT', scale: 1.3, skin: '#d29a72', hair: '#7a7a78', hairStyle: 'sidepart', glasses: true, top: '#7a4a24', top2: '#e8c070', topPattern: 'batik', sleeves: 'short', bottom: '#2a2a30', bottomStyle: 'pants', shoe: '#1a1a1a', shoeStyle: 'shoe', belly: 0.5 },
  anakSD:     { name: 'Dimas', scale: 0.98, skin: '#e6b088', hair: '#1e1612', hairStyle: 'buzz', top: '#f6f6f2', sleeves: 'short', bottom: '#c22a2a', bottomStyle: 'shorts', shoe: '#1a1a1a', shoeStyle: 'shoe' },
  anakSDcw:   { name: 'Putri', scale: 0.98, skin: '#f0c09a', hair: '#2a1a12', hairStyle: 'twintail', tie: '#e83a5a', top: '#f6f6f2', sleeves: 'short', bottom: '#c22a2a', bottomStyle: 'skirt', skirtShort: true, shoe: '#1a1a1a', shoeStyle: 'shoe' },
  pemuda:     { name: 'Bayu', scale: 1.3, skin: '#c98e66', hair: '#1a1410', hairStyle: 'curly', top: '#26365a', top2: '#e8e8e8', topPattern: 'stripe', sleeves: 'short', bottom: '#b8a070', bottomStyle: 'shorts', shoe: '#2a6ac0', shoeStyle: 'sandal' },
  mbak:       { name: 'Mbak Rina', scale: 1.25, skin: '#f0c4a0', hair: '#2a1810', hairStyle: 'long', top: '#f2c94c', sleeves: 'short', bottom: '#4466aa', bottomStyle: 'pants', shoe: '#f2f2f2', shoeStyle: 'shoe' },
  remaja:     { name: 'Sari', scale: 1.2, skin: '#eec09c', hair: '#3a2014', hairStyle: 'bob', top: '#8fc4e8', sleeves: 'short', bottom: '#2a2a3a', bottomStyle: 'skirt', skirtShort: true, shoe: '#f2f2f2', shoeStyle: 'shoe' },
  anakPunk:   { name: 'Joni', scale: 1.28, skin: '#d8a27a', hair: '#2a2a2a', hairStyle: 'mohawk', top: '#2a2a2e', top2: '#d23a3a', topPattern: 'stripe', sleeves: 'short', bottom: '#3a4a6a', bottomStyle: 'pants', shoe: '#1a1a1a', shoeStyle: 'shoe' },
  ojol:       { name: 'Bang Ojol', scale: 1.3, skin: '#c48a60', hair: '#1a1410', hairStyle: 'helmet', helmet: '#2fa04a', top: '#2fa04a', top2: '#1c6a30', topPattern: 'stripe', sleeves: 'long', bottom: '#2a2a30', bottomStyle: 'pants', shoe: '#1a1a1a', shoeStyle: 'shoe' },
  bocah:      { name: 'Ucup', scale: 0.95, skin: '#d29a6c', hair: '#1a1410', hairStyle: 'short', top: '#f2c94c', sleeves: 'short', bottom: '#2a6ac0', bottomStyle: 'shorts', shoe: '#c23a3a', shoeStyle: 'sandal' },
  tukangBakso:{ name: 'Mas Bakso', scale: 1.28, skin: '#b8805a', hair: '#1a1410', hairStyle: 'cap', cap: '#d23a3a', top: '#3a7ac0', sleeves: 'long', bottom: '#3a3a40', bottomStyle: 'pants', shoe: '#2a2a2a', shoeStyle: 'sandal' },
};
const fixedRamp = c => [hexRGB(c)];
// gaya wajah otomatis dari nama (kalau tidak ditulis di style), supaya tiap tokoh beda: bentuk wajah, mata, alis, mulut
const strHash = str => { let h = 7; for (const ch of str || '') h = Math.imul(h ^ ch.charCodeAt(0), 2654435761) >>> 0; return h / 4294967295; };
const isFem = st => st.hairStyle === 'hijab' || st.bottomStyle === 'skirt' || ['long', 'bob', 'twintail', 'ponytail', 'bun', 'wavy', 'lowtie', 'braid', 'hightail', 'bobclip', 'twinlow'].includes(st.hairStyle);
function faceCfg(st) {
  const h = k => strHash((st.name || '') + k), fem = isFem(st), pk = (k, arr) => st[k] || arr[Math.floor(h(k) * arr.length)];
  return {
    fem, shape: pk('face', fem ? ['oval', 'v', 'round', 'oval'] : ['oval', 'square', 'round', 'square']),
    eyes: pk('eyes', fem ? ['big', 'normal', 'big', 'sharp'] : ['normal', 'small', 'sharp', 'normal']),
    brow: pk('brow', fem ? ['thin', 'arch', 'thin'] : ['thick', 'normal', 'thick', 'angry']),
    mouth: pk('mouth', fem ? ['small', 'smile', 'small'] : ['flat', 'smile', 'flat', 'smirk']),
    lash: st.lash ?? fem, blush: st.blush ?? fem, beard: st.beard || null, glasses: st.glasses || null,
  };
}
function makeRamps(st) {
  const r = {};
  r.skin = R(st.skin); r.nose = [r.skin[0], r.skin[0], r.skin[1], r.skin[1]];
  r.hair = R(st.hair || '#222222'); r.hair2 = r.hair.map(c => c.map(v => Math.round(v * 0.72))); r.brow = [r.hair[0], r.hair[0], r.hair[0], r.hair[1]];
  r.tie = R(st.tie || '#e83a5a'); r.helmet = R(st.helmet || '#2fa04a'); r.visor = R('#2a3440'); r.phone = fixedRamp('#1e2230');
  r.stubble = R(st.skin).map((c, i) => mixc(c, r.hair[1], 0.35).map(clamp255));
  if (st.hairStyle === 'hijab') r.brow = [R('#3a2418')[0], R('#3a2418')[0], R('#3a2418')[1], R('#3a2418')[1]];
  r.top = R(st.top); r.top2 = R(st.top2 || st.top); r.bottom = R(st.bottom); r.bottom2 = R(st.bottom2 || st.bottom);
  r.shoe = R(st.shoe); r.sole = R('#2a2420'); r.hijab = R(st.hijab || '#888888'); r.peci = R('#1e1e24'); r.cap = R(st.cap || '#cc3333');
  r.eye = fixedRamp('#16121e'); r.eyeW = fixedRamp('#ffffff'); r.mouth = fixedRamp('#9a3f38'); r.lip = fixedRamp('#c0605a'); r.teeth = fixedRamp('#f4f0e8');
  r.blush = fixedRamp('#ec8f82'); r.glasses = fixedRamp('#26262c');
  r.blade = R('#c4ced8'); r.hilt = R('#b07a26'); r.orb = R('#8fe0ff'); r.stick = R('#9a7440'); r.bristle = R('#d4b36a');
  // seragam & aksesori
  r.collar = R('#ffffff'); r.shirt = R('#f4f4f0'); r.seam = R('#bcbcb6'); r.placket = R('#e6e6e0'); r.button = fixedRamp('#8a8a86'); r.reflect = fixedRamp('#e4e8ea');
  r.badge = fixedRamp('#d8a830'); r.nametag = fixedRamp('#1e2430'); r.belt = R('#1c1c20'); r.buckle = fixedRamp('#d0d4dc');
  r.clip = R(st.clip || '#f2c230'); r.book = R(st.book || '#3a6ab0'); r.page = R('#f4f0e2'); r.box = R('#b8905a'); r.bag = R(st.bag || '#2a3a5a');
  return r;
}
for (const id in STYLES) { const st = STYLES[id]; st.ramps = makeRamps(st); st.color = organicColor(m => st.ramps[m]); st.fc = faceCfg(st); }

/* ---------- Rangka ----------
   Sudut tungkai: 0 = lurus ke bawah, +π/2 = ke depan, π = ke atas, negatif = ke belakang.
   L = kiri, R = kanan. Satuan panjang = "unit", dikali style.scale jadi voxel. */
const POSE0 = {
  lean: 0.03, hp: 0, thL: 0, thR: 0, knL: 0.1, knR: 0.1,
  arL: 0.08, arR: 0.08, elL: 0.25, elR: 0.25, spL: 0.12, spR: 0.12,
  tw: 0, px: 0, jump: 0, yaw: 0, sword: 0, swa: 0, orb: 0, broom: 0, bsw: 0, rod: 0, rpa: 0.6,
  hy: 0,          // kepala menoleh kiri/kanan
  sy: 0,          // pinggul bergeser ke samping (goyang saat jalan/joget)
  ftL: 0, ftR: 0, // sudut telapak kaki (tumit/jinjit)
  phone: 0,       // memegang HP di tangan kanan
  box: 0, book: 0, // membawa kardus / membaca buku (dua tangan)
  tool: 0, tl: 0, // barang kegiatan (nomor, lihat ACT_ANIMS) + parameter geraknya; digambar oleh raka/rig.js
};
const limb = a => [Math.sin(a), 0, -Math.cos(a)];
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const rotY = (v, t) => [v[0] * Math.cos(t) - v[2] * Math.sin(t), v[1], v[2] * Math.cos(t) + v[0] * Math.sin(t)];
// kapsul (ruas a-b, jari-jari r0 -> r1): return posisi t (0..1) jika titik p di dalam, -1 jika di luar.
// Ditulis tanpa membuat array baru supaya cepat (dipanggil ribuan kali per frame).
function capsule(p, a, b, r0, r1) {
  const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
  const apx = p[0] - a[0], apy = p[1] - a[1], apz = p[2] - a[2];
  const rm = r0 > r1 ? r0 : r1;
  const L2 = abx * abx + aby * aby + abz * abz;
  let t = L2 ? (apx * abx + apy * aby + apz * abz) / L2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const dx = apx - abx * t, dy = apy - aby * t, dz = apz - abz * t, r = r0 + (r1 - r0) * t;
  return dx * dx + dy * dy + dz * dz <= r * r && rm > 0 ? t : -1;
}
const sph = (p, c, r) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2 <= r * r;

/* ---------- Gaya rambut ----------
   Semua dalam koordinat lokal kepala (satuan unit): dx = ke depan, dy = ke samping, dz = ke atas.
   Kepala = elipsoid 3.9 × 3.7 × 4.0. Return 1 = rambut, string = material lain, 0 = kosong. */
const BANGS = {   // garis poni: rambut menutupi dahi di atas garis ini
  short: dy => 1.0 + 0.35 * (Math.floor((dy + 5) * 1.4) % 2),
  sidepart: dy => 0.55 + 0.28 * dy,
  bob: dy => 0.6,
  long: dy => 0.9 + 0.3 * Math.cos(dy * 1.3),
  twintail: dy => 0.8 + 0.3 * (Math.floor((dy + 5) * 1.2) % 2),
  ponytail: dy => 1.1,
  spiky: dy => 0.7 + 0.5 * Math.abs(((dy + 5) * 0.9) % 2 - 1),
  curly: dy => 0.9,
  messy: dy => 0.55 + 0.75 * hash(Math.floor(dy * 1.4 + 9), 3, 7),
  wavy: dy => 0.8 + 0.3 * Math.cos(dy * 1.3),
  lowtie: dy => 1.0 + 0.2 * Math.abs(dy),
  braid: dy => 1.2,
  hightail: dy => 0.75 + 0.35 * (Math.floor((dy + 5) * 1.6) % 2),
  bobclip: dy => 0.55,
  twinlow: dy => 0.35,                         // poni menutupi alis
  halfup: dy => 0.85,
  slick: dy => (dy > 0.3 && dy < 1.2 ? 0.55 : 9),   // disisir ke belakang, sehelai jatuh di dahi
  crew: dy => 1.35,
};
const SPIKES = [[0.2, 0, 1], [-0.5, 0, 0.85], [-0.9, 0, 0.3], [0.1, 0.7, 0.7], [0.1, -0.7, 0.7], [-0.5, 0.7, 0.5], [-0.5, -0.7, 0.5], [0.75, 0.3, 0.55], [0.75, -0.3, 0.55], [-0.95, 0.4, -0.1], [-0.95, -0.4, -0.1]].map(norm);
// rambut belakang bawah (tengkuk) hanya di belakang telinga, supaya rahang & pipi tidak tertutup
const nape = (dx, dz, lo = -4.4) => dz > lo && (dz > -1.3 || dx < -0.6);
const shellIn = (dx, dy, dz, k = 1) => ((dx + 0.4) / (4.5 * k)) ** 2 + (dy / (4.3 * k)) ** 2 + ((dz - 0.2) / (4.4 * k)) ** 2 <= 1;
function hairAt(hs, dx, dy, dz, face) {
  switch (hs) {
    case 'hijab': return !face && ((dx + 0.3) / 4.6) ** 2 + (dy / 4.4) ** 2 + ((dz - 0.1) / 4.6) ** 2 <= 1 ? 'hijab' : 0;
    case 'helmet':
      if (dz > -1.6 && ((dx + 0.2) / 4.9) ** 2 + (dy / 4.7) ** 2 + ((dz - 0.4) / 4.9) ** 2 <= 1) return dx > 3.0 && dz < 1.6 ? 'visor' : 'helmet';
      return 0;
    case 'peci': if (dz > 2.0 && dz < 4.7 && ((dx + 0.1) / 4.1) ** 2 + (dy / 3.9) ** 2 <= 1) return 'peci'; return !face && dz < 2.0 && shellIn(dx, dy, dz) ? 1 : 0;
    case 'caping': {   // topi caping petani/nelayan: kerucut lebar dari anyaman bambu
      const r = Math.hypot(dx + 0.2, dy), top = 2.7 + (8.4 - r) * 0.42;
      if (r < 8.4 && dz > 2.3 && dz < top && dz > top - 1.2) return 'cap';
      return !face && dz < 2.3 && shellIn(dx, dy, dz) ? 1 : 0; }
    case 'cap':
      if (dz > 1.6 && ((dx + 0.2) / 4.3) ** 2 + (dy / 4.1) ** 2 + ((dz - 0.8) / 4.2) ** 2 <= 1) return 'cap';
      if (dx > 2.5 && dx < 6.4 && dz > 1.5 && dz < 2.5 && Math.abs(dy) < 3.0) return 'cap';
      return !face && dz < 1.6 && shellIn(dx, dy, dz) ? 1 : 0;
    case 'bald': return !face && dz < 0.9 && dx < 1.0 && shellIn(dx, dy, dz) ? 1 : 0;
    case 'buzz': return !face && shellIn(dx, dy, dz, 0.93) && dz > -2.4 && nape(dx, dz) ? 1 : 0;            // cepak
    case 'mohawk': return Math.abs(dy) < 1.1 && dz > -1 && ((dx + 0.4) / 5.0) ** 2 + ((dz - 0.4) / 5.6) ** 2 <= 1 ? 1 : 0;
    case 'spiky': {                                                                          // jabrik
      if (!face && shellIn(dx, dy, dz, 0.97) && dz > -2.4 && nape(dx, dz)) return 1;
      const vx = dx + 0.3, vz = dz - 0.3;
      for (const d of SPIKES) {
        const t = vx * d[0] + dy * d[1] + vz * d[2];
        if (t > 3.0 && t < 6.8 && Math.hypot(vx - d[0] * t, dy - d[1] * t, vz - d[2] * t) < (6.8 - t) * 0.42) return 1;
      }
      return 0;
    }
    case 'curly': {                                                                          // keriting mengembang
      const b = hash(Math.round(dx * 1.3), Math.round(dy * 1.3), Math.round(dz * 1.3));
      return !face && dz > -2.8 && ((dx + 0.5) / (5.0 + b * 0.7)) ** 2 + (dy / (4.9 + b * 0.7)) ** 2 + ((dz - 0.7) / (5.0 + b * 0.7)) ** 2 <= 1 ? 1 : 0;
    }
    case 'sidepart':                                                                         // belah samping
      if (!face && shellIn(dx, dy, dz) && dz > -2.4 && nape(dx, dz)) return 1;
      return dz > 0.3 && ((dx + 0.1) / 4.6) ** 2 + ((dy - 0.7) / 4.4) ** 2 + ((dz - 0.8) / 4.4) ** 2 <= 1 && !(dx > 0.6 && dz < 0.55 + 0.28 * dy) ? 1 : 0;
    case 'bob':                                                                              // rambut bob sebahu
      return !face && dz > -3.5 && ((dx + 0.5) / 4.7) ** 2 + (dy / 4.6) ** 2 + ((dz - 0.1) / 4.8) ** 2 <= 1 ? 1 : 0;
    case 'long':
      if (!face && shellIn(dx, dy, dz)) return 1;
      if (dx < 0.6 && ((dx + 1.3) / 3.6) ** 2 + (dy / 4.5) ** 2 <= 1 && dz > -10 && dz < 2) return 1;
      return Math.abs(dy) > 3.0 && Math.abs(dy) < 4.3 && dx > -1.5 && dx < 2.2 && dz > -6.5 && dz < 1 ? 1 : 0;
    case 'twintail': {                                                                       // kuncir dua
      if (!face && shellIn(dx, dy, dz)) return 1;
      for (const sg of [-1, 1]) {
        if ((dx + 0.6) ** 2 + (dy - sg * 4.0) ** 2 + (dz - 0.8) ** 2 < 1.2) return 'tie';
        if (((dx + 0.9) / 1.6) ** 2 + ((dy - sg * 4.7) / 1.4) ** 2 + ((dz + 2.0) / 3.4) ** 2 <= 1) return 1;
      }
      return 0;
    }
    case 'ponytail':
      if (!face && shellIn(dx, dy, dz)) return 1;
      return ((dx + 5.0) / 1.7) ** 2 + (dy / 1.5) ** 2 + ((dz + 1.0) / 3.2) ** 2 <= 1 ? 1 : 0;
    case 'bun':
      if (!face && shellIn(dx, dy, dz)) return 1;
      return (dx + 3.8) ** 2 + dy ** 2 + (dz - 2.6) ** 2 < 2.4 ** 2 ? 1 : 0;
    case 'messy': {                                                                          // pendek berantakan: jumput tak rata
      const b = hash(Math.round(dx * 0.9 + 9), Math.round(dy * 0.9 + 9), Math.round(dz * 0.9 + 9));
      return !face && dz > -2.2 && nape(dx, dz) && shellIn(dx, dy, dz, 0.98 + b * 0.16) ? 1 : 0;
    }
    case 'crew': return !face && dz > -2.0 && nape(dx, dz) && shellIn(dx, dy, dz, 0.96) && dz < 4.15 ? 1 : 0;   // cepak rapi, atas rata
    case 'slick': return !face && dz > -2.2 && nape(dx, dz) && ((dx + 0.7) / 4.6) ** 2 + (dy / 4.2) ** 2 + ((dz - 0.4) / 4.3) ** 2 <= 1 ? 1 : 0;
    case 'wavy': {                                                                           // panjang bergelombang
      if (!face && shellIn(dx, dy, dz)) return 1;
      const wv = 0.45 * Math.sin(dz * 1.5);
      if (dx < 0.6 && ((dx + 1.3) / (3.7 + wv)) ** 2 + (dy / (4.7 + wv)) ** 2 <= 1 && dz > -10.5 && dz < 2) return 1;
      return Math.abs(dy) > 3.0 && Math.abs(dy) < 4.4 + wv && dx > -1.5 && dx < 2.2 && dz > -8 && dz < 1 ? 1 : 0;
    }
    case 'lowtie': {                                                                         // panjang diikat rendah
      if (!face && shellIn(dx, dy, dz) && nape(dx, dz, -3.4)) return 1;
      if (((dx + 4.1) / 1.3) ** 2 + (dy / 1.3) ** 2 <= 1 && dz < -2.8 && dz > -3.6) return 'tie';
      return ((dx + 4.3 + (dz + 3) * 0.08) / 1.15) ** 2 + (dy / 1.15) ** 2 <= 1 && dz <= -2.8 && dz > -10 ? 1 : 0;
    }
    case 'braid': {                                                                          // kuncir dikepang
      if (!face && shellIn(dx, dy, dz)) return 1;
      if (dz < -1.2 && dz > -10.5) { const k = Math.floor((dz + 20) / 1.3), o = (k % 2 ? 0.35 : -0.35); if (((dx + 4.7) / 1.2) ** 2 + ((dy - o) / 1.2) ** 2 <= 1) return k % 2 ? 1 : 'hair2'; }
      return (dx + 4.6) ** 2 + dy ** 2 + (dz + 11) ** 2 < 1.1 ? 'tie' : 0;
    }
    case 'hightail': {                                                                       // kuncir kuda tinggi
      if (!face && shellIn(dx, dy, dz)) return 1;
      if ((dx + 3.6) ** 2 + dy ** 2 + (dz - 2.9) ** 2 < 1.2) return 'tie';
      const zz = dz - 2.6, cx = -4.6 - Math.max(0, -zz) * 0.18;
      return zz < 0.6 && zz > -7 && ((dx - cx) / (1.5 - zz * 0.04)) ** 2 + (dy / 1.4) ** 2 <= 1 ? 1 : 0;
    }
    case 'twinlow': {                                                                        // kuncir dua rendah
      if (!face && shellIn(dx, dy, dz)) return 1;
      for (const sg of [-1, 1]) {
        if ((dx + 1.0) ** 2 + (dy - sg * 3.9) ** 2 + (dz + 2.0) ** 2 < 1.1) return 'tie';
        if (((dx + 1.2) / 1.3) ** 2 + ((dy - sg * 4.1) / 1.2) ** 2 <= 1 && dz < -2.2 && dz > -8) return 1;
      }
      return 0;
    }
    case 'bobclip':
      if (dx > 1.8 && dz > 1.6 && dz < 2.3 && dy > 1.2 && dy < 3.0 && ((dx + 0.5) / 5.0) ** 2 + (dy / 4.9) ** 2 + ((dz - 0.1) / 5.1) ** 2 <= 1) return 'clip';   // jepit hanya di permukaan rambut
      return !face && dz > -3.5 && ((dx + 0.5) / 4.7) ** 2 + (dy / 4.6) ** 2 + ((dz - 0.1) / 4.8) ** 2 <= 1 ? 1 : 0;
    case 'halfup': {                                                                         // ikal sebahu, setengah diikat ke atas
      const b = hash(Math.round(dx * 1.3), Math.round(dy * 1.3), Math.round(dz * 1.3));
      if ((dx + 3.2) ** 2 + dy ** 2 + (dz - 3.4) ** 2 < 2.0 ** 2) return 1;
      return !face && dz > -6 && ((dx + 0.6) / (4.8 + b * 0.6)) ** 2 + (dy / (4.7 + b * 0.6)) ** 2 + ((dz - 0.2) / (5.0 + b * 0.6)) ** 2 <= 1 && (dz > -2.5 || dx < 0.4) ? 1 : 0;
    }
    case 'capback': {                                                                        // topi dibalik: lidah topi ke belakang
      if (dz > 1.6 && ((dx + 0.2) / 4.3) ** 2 + (dy / 4.1) ** 2 + ((dz - 0.8) / 4.2) ** 2 <= 1) return 'cap';
      if (dx < -2.5 && dx > -6.6 && dz > 1.2 && dz < 2.2 && Math.abs(dy) < 3.0) return 'cap';
      const b = hash(Math.round(dx), Math.round(dy), Math.round(dz));
      return !face && dz < 1.6 && dz > -2.4 && nape(dx, dz) && shellIn(dx, dy, dz, 1 + b * 0.12) ? 1 : 0;
    }
    default: return !face && nape(dx, dz) && shellIn(dx, dy, dz) ? 1 : 0;                       // pendek
  }
}

// part: 'all' | 'upper' (badan atas + kepala + tangan + properti) | 'lower' (pinggul + kaki)
const PROPS = new Set(['orb', 'hilt', 'blade', 'phone', 'stick', 'bristle', 'rod', 'line']);   // boleh menyentuh/menembus tanah
function humanShape(P0, st, part = 'all') {
  const P = Object.assign({}, POSE0, P0), S = st.scale;
  const L = Math.ceil(27 * S), W = Math.ceil(19 * S), H = Math.ceil(40 * S);
  const cy = W / 2;
  const up = [Math.sin(P.lean), 0, Math.cos(P.lean)], fwd = [Math.cos(P.lean), 0, -Math.sin(P.lean)];
  const pelvis = [L / 2 - S + P.px * S, cy + P.sy * S, 0];
  // proporsi lebih natural (±6 kepala): kepala lebih kecil, badan & kaki lebih panjang, anggota badan lebih ramping
  const HS = 0.84, TL = 1.16, LL = 1.26, AL = 1.2;
  const neck = add(pelvis, up, 7.8 * TL * S);
  const ha = P.lean + P.hp, hu = [Math.sin(ha), 0, Math.cos(ha)];
  const hf = [Math.cos(ha) * Math.cos(P.hy), Math.sin(P.hy), -Math.sin(ha) * Math.cos(P.hy)], hsd = [-Math.sin(P.hy), Math.cos(P.hy), 0];
  const head = add(neck, hu, (4.6 * HS + 0.5) * S);
  const arms = [-1, 1].map(s => {
    const k = s < 0 ? 'L' : 'R', a = P['ar' + k], el = P['el' + k], sp = P['sp' + k];
    const sh = add(add(pelvis, up, 6.6 * TL * S), [-s * 3.25 * S * Math.sin(P.tw), s * 3.25 * S * Math.cos(P.tw), 0]);
    const dir = (ang, b) => [Math.sin(ang) * Math.cos(b), s * Math.sin(b), -Math.cos(ang) * Math.cos(b)];
    const elbow = add(sh, dir(a, sp), 3.3 * AL * S);
    const hand = add(elbow, dir(a + el, sp * 0.5), 3.1 * AL * S);
    return { sh, elbow, hand };
  });
  const legs = [-1, 1].map(s => {
    const k = s < 0 ? 'L' : 'R', th = P['th' + k], kn = P['kn' + k];
    const hip = add(add(pelvis, up, -0.3 * S), [0, s * 1.7 * S, 0]);
    const knee = add(hip, limb(th), 4.4 * LL * S);
    const ankle = add(knee, limb(th - kn), 4.3 * LL * S);
    const toe = add(ankle, limb(th - kn + Math.PI / 2 + P['ft' + k]), 1.7 * S);
    return { hip, knee, ankle, toe };
  });
  // Grounding: geser badan supaya titik terendah menyentuh tanah
  const butt = add(pelvis, up, -1.0 * S), chest = add(pelvis, up, 3.0 * TL * S);
  const gp = [[butt, 0.5], [chest, 2.1], [neck, 2.0], [head, 4.0 * HS]];
  for (const a of arms) gp.push([a.elbow, 1.2], [a.hand, 1.25]);
  for (const l of legs) gp.push([l.knee, 1.5], [l.ankle, 1.25], [l.toe, 1.15]);
  const shift = -Math.min(...gp.map(([p, r]) => p[2] - r * S));
  const buttZ = butt[2] + shift - 0.6 * S;
  const pts = [pelvis, neck, head, butt, chest];
  for (const a of arms) pts.push(a.sh, a.elbow, a.hand);
  for (const l of legs) pts.push(l.hip, l.knee, l.ankle, l.toe);
  for (const p of pts) p[2] += shift;

  const Rr = arms[1];
  const bd = rotY(norm(sub(Rr.hand, Rr.elbow)), P.swa);            // arah pedang
  const orbPos = add(add(arms[0].hand, arms[1].hand).map(v => v / 2), fwd, 2.2 * S);
  const brd = norm([0.5, P.bsw, -1]);                               // arah sapu
  const hs = st.hairStyle, bs = st.bottomStyle;
  // titik-titik properti dihitung sekali (bukan per voxel)
  const hilt0 = add(Rr.hand, bd, -1.2 * S), hilt1 = add(Rr.hand, bd, 1.0 * S), guardC = add(Rr.hand, bd, 1.3 * S);
  const blade0 = add(Rr.hand, bd, 1.6 * S), blade1 = add(Rr.hand, bd, 11 * S);
  const stick0 = add(Rr.hand, brd, -3 * S), stick1 = add(Rr.hand, brd, 10 * S), br0 = add(Rr.hand, brd, 9.5 * S), br1 = add(Rr.hand, brd, 14 * S);
  // joran pancing: dari genggaman tangan kanan ke depan-atas (rpa = sudut angkat), senar menjuntai dari ujung
  const rdir = norm([Math.cos(P.rpa), 0, Math.sin(P.rpa)]), rod0 = add(Rr.hand, rdir, -2.5 * S), rod1 = add(Rr.hand, rdir, 24 * S), line1 = add(rod1, [0, 0, 1], -9 * S);
  const neck0 = add(neck, up, -0.6 * S), neck1 = add(neck, hu, 1.4 * S);
  const phone0 = add(Rr.hand, norm(sub(Rr.hand, Rr.elbow)), 0.4 * S), phone1 = add(phone0, hu, 1.8 * S);
  const propC = add(add(add(arms[0].hand, arms[1].hand).map(v => v / 2), fwd, (P.box ? 1.4 : 0.5) * S), up, (P.box ? 0.4 : 0.6) * S);

  const topMat = (x, y, z, f, wy, rx, t) => {
    if (UNI && t !== undefined) { const u = uniMat(f, wy, rx, t); if (u) return u; }
    if (st.topPattern === 'vest' && t !== undefined) {   // rompi tukang parkir: terbuka di depan, pita reflektor melintang
      if (f > 0 && Math.abs(wy) < 0.9 && t < 0.86) return 'top';
      return t > 0.42 && t < 0.52 ? 'reflect' : 'top2';
    }
    if (st.topPattern === 'stripe' && Math.floor(z / 3) % 2) return 'top2';
    if (st.topPattern === 'batik' && (((x + z) % 5 === 0 && (y + z) % 5 === 0) || hash(x >> 1, y >> 1, z >> 1) < 0.1)) return 'top2';
    if (st.topPattern === 'koko' && Math.abs(wy) < 0.5 && f > rx * 0.7 && z % 3 === 0) return 'top2';
    return 'top';
  };
  const bottomMat = (x, y, z) => {
    if (st.bottomPattern === 'plaid' && (Math.floor(x / 2) % 3 === 0 || Math.floor(z / 2) % 3 === 0)) return 'bottom2';
    if (st.bottomPattern === 'batik' && (((x + z) % 5 === 0 && (y + z) % 5 === 0) || hash(x >> 1, y >> 1, z >> 1) < 0.1)) return 'bottom2';
    return 'bottom';
  };
  // ----- wajah: tiap tokoh punya kombinasi bentuk mata, alis, mulut, kumis/janggut, kacamata
  const FC = st.fc || faceCfg(st);
  const EYE = { normal: [0.5, 0.62, 0.62, 0], big: [0.6, 0.85, 0.8, 0], small: [0.42, 0.5, 0.5, 0], sleepy: [0.55, 0.6, 0.15, 0], sharp: [0.62, 0.45, 0.45, 0.3] }[FC.eyes] || [0.5, 0.62, 0.62, 0];
  const faceMat = (dx, dy, dz) => {
    const ay = Math.abs(dy), ex = ay - 1.5, side = dy > 0;
    const G = FC.glasses;
    if (G) {
      const round = G === 'round', rim = round ? Math.hypot(ex / 1.05, dz / 0.95) : Math.max(Math.abs(ex) / 1.05, Math.abs(dz) / 0.85);
      if (dx > 1.6 && rim < 1.08 && rim > 0.8) return 'glasses';
      if (dx > 2.6 && Math.abs(dz) < 0.3 && ay < 0.5) return 'glasses';
    }
    if (dx > 2.0) {
      const [ew, eh, lid, tilt] = EYE, ez = dz - tilt * ex;
      if (Math.abs(ex) < ew && ez > -eh && ez < lid) return (ez > lid - 0.45 && ex > 0 && ex < ew * 0.9 && eh > 0.6) ? 'eyeW' : 'eye';
      if (FC.lash && ex > ew * 0.3 && ex < ew + 0.5 && ez >= lid && ez < lid + 0.45) return 'eye';                    // bulu mata
      if (FC.eyes === 'sleepy' && Math.abs(ex) < ew + 0.1 && ez >= lid && ez < lid + 0.35) return 'nose';             // kelopak berat
    }
    if (dx > 1.8) {
      const bw = FC.brow === 'thick' ? 0.85 : 0.72, b0 = FC.brow === 'thin' ? 1.3 : 1.15, b1 = FC.brow === 'thick' ? 1.8 : FC.brow === 'thin' ? 1.6 : 1.65;
      const bz = dz - (FC.brow === 'angry' ? 0.45 * ex : FC.brow === 'arch' ? -0.3 * (1 - Math.abs(ex)) : 0.1 * ex);
      const scar = st.scar && side && ex > -0.05 && ex < 0.3;
      if (Math.abs(ex) < bw && bz > b0 && bz < b1 && !scar) return 'brow';
    }
    if (dx > 1.8) {   // mulut
      const mz = dz + 1.75, M = FC.mouth;
      if (M === 'smile' && ay < 0.95 && Math.abs(mz + 0.0 - 0.35 * (ay / 0.95) ** 2) < 0.3) return 'mouth';
      if (M === 'grin' && ay < 0.95 && mz > -0.45 && mz < 0.35 - 0.2 * (ay / 0.95) ** 2) return mz > -0.05 && ay < 0.7 ? 'teeth' : 'mouth';
      if (M === 'smirk' && dy > -0.4 && dy < 0.95 && Math.abs(mz - 0.3 * Math.max(0, dy)) < 0.3) return 'mouth';
      if (M === 'small' && ay < 0.5 && Math.abs(mz) < 0.3) return 'lip';
      if (M === 'flat' && ay < 0.75 && Math.abs(mz) < 0.28) return 'mouth';
    }
    if (FC.beard) {
      if (FC.beard === 'mustache' && dx > 1.8 && dz > -1.5 && dz < -1.05 && ay < 1.1) return 'hair';
      if ((FC.beard === 'beard' || FC.beard === 'goatee') && dx > 1.0 && dz < -2.15 && ay < (FC.beard === 'goatee' ? 0.8 : 2.9)) return 'hair';
      if (FC.beard === 'stubble' && dx > 1.0 && dz < -1.3 && ay < 2.9 && !(ay < 0.9 && dz > -2.1)) return 'stubble';
    }
    if (FC.blush && dx > 1.8 && dz > -1.35 && dz < -0.7 && Math.abs(ay - 2.3) < 0.45) return 'blush';
    if (dx > 2.6 && dz > -1.15 && dz < -0.25 && ay < 0.4) return 'nose';
    if (dx > 2.2 && dz > -1.25 && dz < -1.0 && ay > 0.3 && ay < 0.75) return 'nose';                                // cuping hidung
    return 'skin';
  };
  // ----- bentuk kepala: tempurung bulat + rahang yang menyempit ke dagu (beda per bentuk wajah)
  const HSH = { oval: [0.42, 0.4, 0.55], round: [0.24, 0.2, 0.72], square: [0.16, 0.3, 0.88], v: [0.56, 0.5, 0.38] }[FC.shape] || [0.42, 0.4, 0.55];
  const headIn = (dx, dy, dz) => {
    if (dz >= 0.2) return (dx / 3.9) ** 2 + (dy / 3.7) ** 2 + ((dz - 0.2) / 3.95) ** 2 <= 1;
    const t = (0.2 - dz) / 4.25; if (t >= 1) return false;
    let ry = 3.7 * (1 - HSH[0] * t ** 1.7), rx = 3.9 * (1 - 0.3 * t ** 1.5);
    const cx = HSH[1] * t * t;
    if (t > 0.78) { const k = Math.sqrt(Math.max(0, 1 - ((t - 0.78) / 0.22) ** 2)); ry *= HSH[2] + (1 - HSH[2]) * k; rx *= 0.7 + 0.3 * k; }
    return ((dx - cx) / rx) ** 2 + (dy / ry) ** 2 <= 1;
  };
  const earAt = (dx, dy, dz) => Math.abs(Math.abs(dy) - 3.7) < 0.6 && Math.abs(dx + 0.25) < 0.75 && dz > -1.4 && dz < 0.6;
  const SHORT = new Set(['caping', 'short', 'buzz', 'spiky', 'sidepart', 'messy', 'crew', 'slick', 'mohawk', 'bald', 'peci', 'cap', 'capback', 'curly', 'helmet']);
  const UNI = st.uniform === 'sma';
  const uniMat = (f, wy, rx, t) => {   // detail seragam SMA di badan atas (t = 0 pinggul .. 1 leher)
    const front = f > rx * 0.62;
    if (st.belt && t < 0.255) return front && Math.abs(wy) < 0.6 ? 'buckle' : 'belt';
    if (st.top !== '#f4f4f0') {         // jaket/rompi dipakai di atas seragam: kemeja putih terlihat di tengah
      if (front && Math.abs(wy) < 0.55 + Math.max(0, t - 0.7) * 2.2) return t > 0.86 ? 'collar' : 'shirt';
      return null;
    }
    if (t > 0.84 && f > rx * 0.15) { if (Math.abs(wy) < 0.32 + (t - 0.84) * 4) return t > 0.9 ? 'skin' : 'placket'; return Math.abs(wy) < 2.0 ? 'collar' : null; }
    if (t > 0.8 && t <= 0.84 && f > rx * 0.15 && Math.abs(wy) < 2.0) return 'seam';
    if (!front) return null;
    if (Math.abs(wy) < 0.42) return Math.floor(t * 15) % 3 === 0 ? 'button' : 'placket';
    if (wy < -0.75 && wy > -2.15 && t > 0.53 && t < 0.74) {                    // saku kiri + badge OSIS
      if (t > 0.65 && t < 0.72 && wy < -1.05 && wy > -1.75) return 'badge';
      return t < 0.56 || wy > -0.9 || wy < -2.0 ? 'seam' : null;
    }
    if (wy > 0.8 && wy < 2.1 && t > 0.63 && t < 0.7) return 'nametag';      // papan nama kanan
    return null;
  };
  const shortHair = (dx, dy, dz) => ((dx + 0.4) / 4.5) ** 2 + (dy / 4.3) ** 2 + ((dz - 0.2) / 4.4) ** 2 <= 1 && dz > -3.2;

  const upperFn = (p, x, y, z) => {
    // properti
    if (P.orb > 0 && sph(p, orbPos, P.orb * S)) return 'orb';
    if (P.sword > 0.5) {
      if (capsule(p, hilt0, hilt1, 0.65 * S, 0.65 * S) >= 0) return 'hilt';
      const qx = p[0] - guardC[0], qy = p[1] - guardC[1], qz = p[2] - guardC[2], al = qx * bd[0] + qy * bd[1] + qz * bd[2];
      if (Math.abs(al) < 0.45 * S && Math.hypot(qx - bd[0] * al, qy - bd[1] * al, qz - bd[2] * al) < 1.9 * S) return 'hilt';
      if (capsule(p, blade0, blade1, 1.15 * S, 0.55 * S) >= 0) return 'blade';
    }
    if (P.phone > 0.5 && capsule(p, phone0, phone1, 0.8 * S, 0.8 * S) >= 0) return 'phone';
    if (P.box > 0.5 || P.book > 0.5) {   // kardus / buku di depan dada, sejajar badan
      const q0 = p[0] - propC[0], q1 = p[1] - propC[1], q2 = p[2] - propC[2];
      const a = (q0 * fwd[0] + q2 * fwd[2]) / S, b = q1 / S, c = (q0 * up[0] + q2 * up[2]) / S;
      if (P.box > 0.5 && Math.abs(a) < 2.0 && Math.abs(b) < 3.0 && Math.abs(c) < 1.9) return Math.abs(b) < 0.3 && c > 1.4 ? 'seam' : 'box';
      if (P.book > 0.5) { const a2 = a * 0.8 - c * 0.6, c2 = a * 0.6 + c * 0.8; if (Math.abs(a2) < 0.45 && Math.abs(b) < 2.1 && Math.abs(c2) < 1.5) return a2 > 0.1 && Math.abs(b) < 1.9 && Math.abs(c2) < 1.3 ? 'page' : 'book'; }
    }
    if (P.rod > 0.5) {
      if (capsule(p, rod0, add(Rr.hand, rdir, 3 * S), 0.75 * S, 0.6 * S) >= 0) return 'hilt';
      if (capsule(p, rod0, rod1, 0.42 * S, 0.3 * S) >= 0) return 'stick';
      if (P.rod > 1.5 && capsule(p, rod1, line1, 0.22 * S, 0.22 * S) >= 0) return 'blade';
    }
    if (P.broom > 0.5) {
      if (capsule(p, stick0, stick1, 0.45 * S, 0.45 * S) >= 0) return 'stick';
      if (capsule(p, br0, br1, 0.7 * S, 2.6 * S) >= 0) return 'bristle';
    }
    // kepala (koordinat lokal kepala, satuan unit)
    const vx = p[0] - head[0], vy = p[1] - head[1], vz = p[2] - head[2];
    const dx = (vx * hf[0] + vy * hf[1] + vz * hf[2]) / S / HS, dy = (vx * hsd[0] + vy * hsd[1]) / S / HS, dz = (vx * hu[0] + vz * hu[2]) / S / HS;
    const inHead = headIn(dx, dy, dz);
    const face = hs === 'hijab'
      ? dx > 0.6 && (dy / 2.7) ** 2 + ((dz + 0.8) / 2.6) ** 2 <= 1
      : hs === 'helmet' ? dx > 0.6 && dz < 0.9 && dz > -3.6 && Math.abs(dy) < 3.0
      : dx > 0.6 && dz < 1.4 && dz > -3.6 && Math.abs(dy) < (hs === 'bob' ? 2.6 : 3.0);
    const strand = () => ((Math.floor(dy * 2.2 + 9) + Math.floor(dz * 0.7 + 9)) % 3 === 0) ? 'hair2' : 'hair';
    if (inHead) {
      if (face && !(BANGS[hs] && dz > BANGS[hs](dy))) return faceMat(dx, dy, dz);
      if (face) return strand();                                    // poni
      if (hs === 'hijab') return 'hijab';
      if (hs === 'helmet') return dz > -1.5 ? 'helmet' : 'hair';
      if (hs === 'peci' && dz > 2.2) return 'peci';
      if (hs === 'cap' && dz > 1.9) return 'cap';
      if (hs === 'caping' && dz > 2.3) return 'cap';
      if (hs === 'bald' && dz > 0.9) return 'skin';
      if (hs === 'mohawk' && Math.abs(dy) > 1.1 && dz > -1.5) return 'stubble';
      return strand();
    }
    const ear = hs !== 'hijab' && hs !== 'helmet' && earAt(dx, dy, dz);
    if (ear && SHORT.has(hs)) return 'nose';                       // telinga terlihat pada rambut pendek
    const hm = hairAt(hs, dx, dy, dz, face);
    if (hm) return hm === 1 ? strand() : hm;
    if (ear) return 'nose';
    // lengan
    for (const a of arms) {
      if (sph(p, a.hand, 1.05 * S)) return 'skin';
      const t1 = capsule(p, a.sh, a.elbow, 1.2 * S, 1.0 * S);
      if (t1 >= 0) return (st.sleeves === 'long' || t1 < 0.7) ? topMat(x, y, z, 0, 9, 1) : 'skin';
      const t2 = capsule(p, a.elbow, a.hand, 1.0 * S, 0.85 * S);
      if (t2 >= 0) return (st.sleeves === 'long' && t2 < 0.8) ? topMat(x, y, z, 0, 9, 1) : 'skin';
    }
    // badan atas
    const wx = p[0] - pelvis[0], wy0 = p[1] - pelvis[1], wz = p[2] - pelvis[2];
    const t = ((wx * up[0] + wz * up[2]) / S + 1.0) / (9 * TL);
    if (t >= 0.2 && t <= 1) {
      let ry = 2.6 + 0.9 * t, rx = 1.9 + 0.35 * t;
      if (t > 0.72) { const k = Math.sqrt(Math.max(0, 1 - ((t - 0.72) / 0.3) ** 2)); ry *= 0.55 + 0.45 * k; rx *= 0.6 + 0.4 * k; }
      const bump = st.belly ? st.belly * Math.exp(-(((t - 0.38) / 0.2) ** 2)) : 0;
      const f = (wx * fwd[0] + wz * fwd[2]) / S - bump * 0.9, rxx = rx + bump * 0.9, wy = wy0 / S;
      if (hs === 'hijab' && t > 0.58 && (f / (rxx + 0.7)) ** 2 + (wy / (ry + 0.6)) ** 2 <= 1) return 'hijab';
      if ((f / rxx) ** 2 + (wy / ry) ** 2 <= 1) return topMat(x, y, z, f, wy, rxx, t);
    }
    if (capsule(p, neck0, neck1, 1.1 * S, 1.1 * S) >= 0) return hs === 'hijab' ? 'hijab' : 'skin';
    return null;
  };

  const zTopSk = pelvis[2] + 1.6 * S;
  const zBotSk = st.skirtShort ? Math.min(legs[0].knee[2], legs[1].knee[2]) - 0.3 * S
    : Math.min(legs[0].ankle[2], legs[1].ankle[2]) + (bs === 'sarung' ? 1.6 : 0.9) * S;
  // duduk (naik motor/sepeda, dibonceng, duduk, jongkok): kedua paha maju. Rok tidak lagi dibuat per irisan datar
  // (irisan itu tidak menutup paha yang mendatar sehingga kulit kaki tembus), tapi membungkus paha seperti kain di pangkuan
  // lalu menjuntai dari lutut (rok panjang).
  const seated = (bs === 'sarung' || bs === 'skirt') && P.thL > 0.55 && P.thR > 0.55;
  const lap = seated && (() => {
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    const hipM = mid(legs[0].hip, legs[1].hip), kneeM = mid(legs[0].knee, legs[1].knee), long = !st.skirtShort;
    const drop = l => add(l.knee, sub(l.ankle, l.knee), bs === 'sarung' ? 0.8 : 0.62), D = legs.map(drop), Dm = mid(D[0], D[1]);
    return p => {
      if (capsule(p, hipM, kneeM, 2.9 * S, long ? 2.5 * S : 2.3 * S) >= 0) return true;              // pangkuan (menutup celah antar paha)
      for (let i = 0; i < 2; i++) {
        const l = legs[i];
        if (capsule(p, l.hip, l.knee, 2.35 * S, long ? 2.05 * S : 1.75 * S) >= 0) return true;        // kain di atas paha
        if (long && capsule(p, l.knee, D[i], 2.0 * S, 1.75 * S) >= 0) return true;                   // juntai dari lutut
      }
      if (long && capsule(p, kneeM, Dm, 2.6 * S, 2.2 * S) >= 0) return true;
      return false;
    };
  })();
  const legX = (l, z) => {
    const xs = [];
    for (const [a, b] of [[l.hip, l.knee], [l.knee, l.ankle]]) {
      const lo = Math.min(a[2], b[2]), hi = Math.max(a[2], b[2]);
      if (z >= lo && z <= hi && hi > lo) xs.push(a[0] + (b[0] - a[0]) * (z - a[2]) / (b[2] - a[2]));
    }
    return xs;
  };
  const lowerFn = (p, x, y, z) => {
    for (const l of legs) {
      if (st.shoeStyle === 'sandal') {
        if (capsule(p, l.ankle, l.toe, 1.15 * S, 1.05 * S) >= 0) return p[2] < Math.min(l.ankle[2], l.toe[2]) - 0.5 * S ? 'sole' : 'skin';
      } else if (capsule(p, l.ankle, l.toe, 1.3 * S, 1.15 * S) >= 0) return 'shoe';
    }
    const wx = p[0] - pelvis[0], wy = p[1] - pelvis[1], wz = p[2] - pelvis[2];
    const t = ((wx * up[0] + wz * up[2]) / S + 1.0) / (9 * TL);
    if (t >= 0 && t < 0.2) {
      const ry = 2.6 + 0.9 * t, rx = 1.9 + 0.35 * t, ff = (wx * fwd[0] + wz * fwd[2]) / S;
      if ((ff / rx) ** 2 + (wy / S / ry) ** 2 <= 1) return st.belt && t > 0.16 ? (ff > rx * 0.62 && Math.abs(wy / S) < 0.6 ? 'buckle' : 'belt') : bottomMat(x, y, z);
    }
    if (lap) { if (lap(p)) return bottomMat(x, y, z); }
    else if ((bs === 'sarung' || bs === 'skirt') && p[2] <= zTopSk && p[2] >= zBotSk) {
      const xs = [pelvis[0], ...legX(legs[0], p[2]), ...legX(legs[1], p[2])];
      const xmin = Math.min(...xs), xmax = Math.max(...xs), fl = (zTopSk - p[2]) / (zTopSk - zBotSk || 1);
      const pad = (1.9 + 0.5 * fl) * S, hy = (2.8 + 0.5 * fl) * S, hx = (xmax - xmin) / 2 + pad, xc = (xmin + xmax) / 2;
      if (((p[0] - xc) / hx) ** 2 + ((p[1] - cy) / hy) ** 2 <= 1) {
        if (st.pleats && fl > 0.08) { const an = Math.atan2(p[1] - cy, (p[0] - xc) * hy / hx); if ((((an / Math.PI) * 7 + 20) % 1) < 0.22) return 'bottom2'; }   // lipit rok
        return bottomMat(x, y, z);
      }
    }
    for (const l of legs) {
      if (capsule(p, l.hip, l.knee, 1.55 * S, 1.2 * S) >= 0) return (bs === 'pants' || bs === 'shorts') ? 'bottom' : 'skin';
      const t2 = capsule(p, l.knee, l.ankle, 1.2 * S, 1.0 * S);
      if (t2 >= 0) return bs === 'pants' || (bs === 'shorts' && t2 < 0.12) ? 'bottom' : 'skin';
    }
    return null;
  };
  const p = [0, 0, 0];
  const mat = (x, y, z) => {
    p[0] = x + 0.5; p[1] = y + 0.5; p[2] = z + 0.5;
    let m = null;
    if (part !== 'lower') m = upperFn(p, x, y, z);
    if (!m && part !== 'upper') m = lowerFn(p, x, y, z);
    return m;
  };
  // kotak batas supaya hanya area tubuh yang dihitung
  const sp = [[pelvis, 4.6], [neck, 4.2], [head, 6.8 * HS], [add(head, hu, -7 * HS * S), 5.2 * HS]];
  if (hs === 'caping') sp.push([head, 9.6 * HS]);
  for (const a of arms) sp.push([a.sh, 2], [a.elbow, 2], [a.hand, 2]);
  const lr = bs === 'sarung' || bs === 'skirt' ? 3.8 : 2.4;
  for (const l of legs) sp.push([l.hip, lr], [l.knee, lr], [l.ankle, lr], [l.toe, 2.2]);
  if (P.sword > 0.5) sp.push([add(Rr.hand, bd, 11 * S), 1.4], [add(Rr.hand, bd, -1.2 * S), 1.2], [add(Rr.hand, bd, 1.3 * S), 2]);
  if (P.broom > 0.5) sp.push([add(Rr.hand, brd, 14 * S), 3], [add(Rr.hand, brd, -3 * S), 1]);
  if (P.rod > 0.5) sp.push([rod1, 1.2], [rod0, 1.2], [add(Rr.hand, rdir, 12 * S), 1], [line1, 1]);
  if (P.orb > 0) sp.push([orbPos, P.orb + 0.5]);
  if (P.phone > 0.5) sp.push([phone1, 1.5]);
  if (P.box > 0.5 || P.book > 0.5) sp.push([propC, 3.8]);
  const lo = [0, 1, 2].map(i => Math.min(...sp.map(([c, r]) => c[i] - r * S)) - 1);
  const hi = [0, 1, 2].map(i => Math.max(...sp.map(([c, r]) => c[i] + r * S)) + 1);
  // Grounding di atas memakai bola kepala kasar; rambut/topi/helm bisa lebih besar dan tenggelam
  // ke tanah saat guling terbalik. Cari voxel tubuh terendah (properti seperti sapu boleh menapak)
  // lalu angkat seluruh frame supaya tidak terpotong tanah. Dicek dgn seluruh tubuh, jadi sama untuk badan atas/bawah.
  let sink = 0;
  for (let z = Math.floor(lo[2]); z < 0 && !sink; z++)
    for (let y = Math.floor(lo[1]); y <= Math.ceil(hi[1]) && !sink; y++) for (let x = Math.floor(lo[0]); x <= Math.ceil(hi[0]); x++) {
      p[0] = x + 0.5; p[1] = y + 0.5; p[2] = z + 0.5;
      const m = upperFn(p, x, y, z) || lowerFn(p, x, y, z);
      if (m && !PROPS.has(m)) { sink = -z; break; }
    }
  lo[2] += sink; hi[2] += sink;
  // Grid menyesuaikan isi frame (pedang, sapu, guling, terbaring) tanpa terpotong.
  // Titik tengah tetap di (L/2, W/2) supaya semua frame berputar di poros yang sama.
  const hx = Math.ceil(Math.max(L / 2 - lo[0], hi[0] - L / 2)), hy = Math.ceil(Math.max(W / 2 - lo[1], hi[1] - W / 2));
  const ox = Math.max(0, hx - Math.floor(L / 2)), oy = Math.max(0, hy - Math.floor(W / 2));
  const L2 = L + ox * 2, W2 = W + oy * 2, H2 = Math.max(H, Math.ceil(hi[2]) + 1);
  const bbox = [Math.max(0, Math.floor(lo[0] + ox)), Math.max(0, Math.floor(lo[1] + oy)), Math.max(0, Math.floor(lo[2])),
                Math.min(L2 - 1, Math.ceil(hi[0] + ox)), Math.min(W2 - 1, Math.ceil(hi[1] + oy)), H2 - 1];
  const mat2 = ox || oy || sink ? (x, y, z) => mat(x - ox, y - oy, z - sink) : mat;
  return { mat: mat2, L: L2, W: W2, H: H2, bbox, lift: P.jump * S, pelvisZ: pelvis[2] + sink, yaw: P.yaw, buttZ: buttZ + sink, buttX: butt[0] - L / 2,
    // titik tangan & pergelangan kaki relatif terhadap pantat [maju, naik] (voxel): untuk mencocokkan setang/pijakan kendaraan
    joints: { hands: arms.map(a => [a.hand[0] - butt[0], a.hand[2] - butt[2] + 0.6 * S]), ankles: legs.map(l => [l.ankle[0] - butt[0], l.ankle[2] - butt[2] + 0.6 * S]) } };
}

/* ---------- Gerakan ----------
   kind: 'loco' (jalan dll), 'upper' (badan atas saja -> bisa sambil jalan), 'full' (seluruh badan).
   hit: { t: saat kena (0..1), r: jangkauan, arc: lebar sudut }. move: kecepatan gerak saat aksi. */
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
const GUARD = { arL: 0.9, elL: 1.9, arR: 0.9, elR: 1.9, spL: 0.25, spR: 0.25, thL: 0.3, thR: -0.3, knL: 0.25, knR: 0.25, lean: 0.1, tw: 0 };
const SW = { sword: 1, arR: 0.6, elR: 0.8, swa: 1.2, spR: 0.12, arL: 0.5, elL: 1.2, spL: 0.2, thL: 0.3, thR: -0.3, knL: 0.2, knR: 0.2, tw: 0, lean: 0.05, yaw: 0 };
const sinT = t => Math.sin(t * TAU), cosT = t => Math.cos(t * TAU);
const ANIMS = {
  // --- gerak dasar (lebih natural: pinggul bergoyang, bahu berputar berlawanan, tumit-jinjit) ---
  idle:   { name: 'Diam', kind: 'loco', n: 8, fps: 4, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: 0.03 + 0.015 * s, sy: 0.25 * c, thL: 0.04 * c, thR: -0.04 * c, knL: 0.12 + 0.05 * Math.max(0, -c), knR: 0.12 + 0.05 * Math.max(0, c),
             elL: 0.28 + 0.05 * s, elR: 0.28 + 0.05 * s, spL: 0.12 + 0.03 * s, spR: 0.12 + 0.03 * s, hp: 0.02 * s, hy: 0.06 * c }; } },
  walk:   { name: 'Jalan', kind: 'loco', n: 8, fps: 9, stride: 34, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: 0.07, hp: -0.04 + 0.03 * Math.abs(c), sy: 0.3 * c, tw: 0.12 * s,
             thL: 0.42 * s, thR: -0.42 * s, knL: 0.1 + 0.75 * Math.max(0, c) ** 1.5, knR: 0.1 + 0.75 * Math.max(0, -c) ** 1.5,
             ftL: -0.25 * Math.max(0, s) + 0.35 * Math.max(0, -s), ftR: -0.25 * Math.max(0, -s) + 0.35 * Math.max(0, s),
             arL: 0.05 - 0.38 * s, arR: 0.05 + 0.38 * s, elL: 0.22 + 0.35 * Math.max(0, -s), elR: 0.22 + 0.35 * Math.max(0, s), spL: 0.14, spR: 0.14 }; } },
  run:    { name: 'Lari', kind: 'loco', n: 8, fps: 13, stride: 62, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: 0.32, hp: -0.24, tw: 0.22 * s, sy: 0.2 * c,
             thL: 0.2 + 0.9 * s, thR: 0.2 - 0.9 * s, knL: 0.3 + 1.6 * Math.max(0, c), knR: 0.3 + 1.6 * Math.max(0, -c),
             ftL: 0.5 * Math.max(0, -s), ftR: 0.5 * Math.max(0, s),
             arL: 0.25 - 0.95 * s, arR: 0.25 + 0.95 * s, elL: 1.55 + 0.25 * s, elR: 1.55 - 0.25 * s, spL: 0.2, spR: 0.2, jump: 1.0 * Math.abs(s) ** 1.5 }; } },
  crouch: { name: 'Jongkok jalan', kind: 'loco', n: 8, fps: 8, stride: 22, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: 0.5, hp: -0.45, sy: 0.2 * c, thL: 1.0 + 0.35 * s, thR: 1.0 - 0.35 * s, knL: 1.9 + 0.3 * Math.max(0, c), knR: 1.9 + 0.3 * Math.max(0, -c), arL: 0.7 - 0.3 * s, arR: 0.7 + 0.3 * s, elL: 0.9, elR: 0.9, spL: 0.2, spR: 0.2 }; } },
  crawl:  { name: 'Merangkak', kind: 'loco', n: 8, fps: 6, stride: 20, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: 1.3, hp: -0.75, px: -4, thL: 0.25 * s, thR: -0.25 * s, knL: 1.57 + 0.2 * Math.max(0, c), knR: 1.57 + 0.2 * Math.max(0, -c), arL: -0.28 * s, arR: 0.28 * s, elL: 0, elR: 0 }; } },
  sit:    { name: 'Duduk', kind: 'full', n: 4, fps: 3, loop: true, pose: t => ({ lean: -0.12 + 0.02 * sinT(t), thL: 1.75, thR: 1.7, knL: 0.45, knR: 0.5, arL: 0.6, arR: 0.55, elL: 1.0, elR: 1.0, spL: 0.15, spR: 0.15, hy: 0.15 * sinT(t) }) },
  sweep:  { name: 'Menyapu', kind: 'full', n: 8, fps: 8, loop: true, pose: t => { const s = sinT(t);
    return { broom: 1, lean: 0.35, hp: -0.1, sy: 0.2 * s, thL: 0.25, thR: -0.15, knL: 0.35, knR: 0.3, arR: 0.85, elR: 0.5, arL: 0.95, elL: 0.9, spL: 0.05, spR: 0.05, tw: 0.3 * s, bsw: 0.55 * s }; } },
  wave:   { name: 'Melambai', kind: 'upper', n: 6, fps: 8, loop: true, pose: t => ({ arR: 2.7, elR: 0.5 + 0.5 * sinT(t), spR: 0.35 + 0.15 * sinT(t), hy: 0.1 }) },
  talk:   { name: 'Ngobrol', kind: 'upper', n: 8, fps: 6, loop: true, pose: t => { const s = sinT(t);
    return { arR: 0.7 + 0.35 * Math.max(0, s), elR: 1.3, arL: 0.4 + 0.25 * Math.max(0, -s), elL: 1.1, hp: 0.06 * s, hy: 0.15 * s, lean: 0.05 }; } },
  // --- variasi diam (NPC & pemain) ---
  look:   { name: 'Menoleh', kind: 'full', n: 10, fps: 5, loop: true, pose: t => ({ hy: 0.85 * sinT(t), hp: 0.05, sy: 0.15 * sinT(t), elL: 0.3, elR: 0.3 }) },
  phone:  { name: 'Main HP', kind: 'upper', n: 4, fps: 3, loop: true, pose: t => ({ phone: 1, arR: 0.75, elR: 1.55, spR: 0.05, arL: 0.6, elL: 1.4, spL: 0.0, hp: -0.35 + 0.03 * sinT(t), lean: 0.05 }) },
  scratch:{ name: 'Garuk kepala', kind: 'upper', n: 6, fps: 8, loop: true, pose: t => ({ arR: 2.2, elR: 2.1 + 0.15 * sinT(t), spR: 0.75, hp: -0.1, hy: -0.15 }) },
  stretch:{ name: 'Peregangan', kind: 'full', n: 10, fps: 6, pose: keyed([[0, {}], [0.4, { arL: 3.0, arR: 3.0, elL: 0.1, elR: 0.1, spL: 0.25, spR: 0.25, lean: -0.15, hp: 0.25 }], [0.7, { lean: -0.2 }], [1, {}]]) },
  // --- naik kendaraan ---
  rideMotor: { name: 'Naik motor', kind: 'full', n: 2, fps: 2, loop: true, pose: t => ({ lean: 0.4, hp: -0.3 + 0.02 * sinT(t), thL: 1.3, thR: 1.3, knL: 1.3, knR: 1.3, ftL: -0.2, ftR: -0.2, arL: 0.85, arR: 0.85, elL: 0.3, elR: 0.3, spL: 0.18, spR: 0.18 }) },
  rideScooter: { name: 'Naik skuter', kind: 'full', n: 2, fps: 2, loop: true, pose: t => ({ lean: 0.3, hp: -0.22 + 0.02 * sinT(t), thL: 1.45, thR: 1.45, knL: 1.45, knR: 1.45, ftL: -0.1, ftR: -0.1, arL: 0.8, arR: 0.8, elL: 0.45, elR: 0.45, spL: 0.2, spR: 0.2 }) },
  rideSport: { name: 'Naik motor sport', kind: 'full', n: 2, fps: 2, loop: true, pose: t => ({ lean: 0.62, hp: -0.55 + 0.02 * sinT(t), thL: 1.7, thR: 1.7, knL: 2.3, knR: 2.3, ftL: 0.2, ftR: 0.2, arL: 0.9, arR: 0.9, elL: 0.3, elR: 0.3, spL: 0.22, spR: 0.22 }) },
  rideTrail: { name: 'Naik trail', kind: 'full', n: 2, fps: 2, loop: true, pose: t => ({ lean: 0.4, hp: -0.25 + 0.02 * sinT(t), thL: 1.2, thR: 1.2, knL: 1.5, knR: 1.5, ftL: -0.1, ftR: -0.1, arL: 0.95, arR: 0.95, elL: 0.5, elR: 0.5, spL: 0.4, spR: 0.4 }) },
  pedalUp: { name: 'Mengayuh santai', kind: 'full', n: 8, fps: 7, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: 0.3, hp: -0.15, thL: 1.05 + 0.42 * s, thR: 1.05 - 0.42 * s, knL: 1.35 + 0.55 * c, knR: 1.35 - 0.55 * c, ftL: -0.1, ftR: -0.1, arL: 0.8, arR: 0.8, elL: 0.4, elR: 0.4, spL: 0.18, spR: 0.18, sy: 0.08 * s }; } },
  passenger: { name: 'Dibonceng', kind: 'full', n: 2, fps: 2, loop: true, pose: t => ({ lean: 0.12, hp: 0.02 * sinT(t), thL: 1.4, thR: 1.4, knL: 1.5, knR: 1.5, ftL: -0.3, ftR: -0.3, arL: 0.75, arR: 0.75, elL: 0.6, elR: 0.6, spL: 0.3, spR: 0.3, hy: 0.25 }) },
  motoLean: { name: 'Motor menikung', kind: 'full', n: 2, fps: 2, loop: true, pose: t => ({ lean: 0.5, hp: -0.35, sy: -0.8, thL: 1.3, thR: 1.2, knL: 1.3, knR: 1.4, ftL: -0.2, ftR: -0.2, arL: 1.2, arR: 1.25, elL: 0.15, elR: 0.25, spL: 0.25, spR: 0.12, hy: -0.2 }) },
  pedal:  { name: 'Mengayuh', kind: 'full', n: 8, fps: 8, stride: 30, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: 0.55, hp: -0.4, thL: 0.95 + 0.4 * s, thR: 0.95 - 0.4 * s, knL: 1.3 + 0.5 * c, knR: 1.3 - 0.5 * c, arL: 0.92, arR: 0.92, elL: 0.05, elR: 0.05, spL: 0.15, spR: 0.15, sy: 0.15 * s }; } },
  // --- gerak utama tambahan (guide 71): sprint, jongkok, berbaring, bawa barang, dorong, panjat, sekolah & sosial ---
  sprint: { name: 'Sprint', kind: 'loco', n: 8, fps: 16, stride: 80, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: 0.45, hp: -0.3, tw: 0.25 * s, sy: 0.15 * c, thL: 0.3 + 1.05 * s, thR: 0.3 - 1.05 * s, knL: 0.35 + 1.9 * Math.max(0, c), knR: 0.35 + 1.9 * Math.max(0, -c),
             ftL: 0.6 * Math.max(0, -s), ftR: 0.6 * Math.max(0, s), arL: 0.3 - 1.2 * s, arR: 0.3 + 1.2 * s, elL: 1.6, elR: 1.6, spL: 0.15, spR: 0.15, jump: 1.4 * Math.abs(s) ** 1.5 }; } },
  squat:  { name: 'Jongkok', kind: 'full', move: 0, n: 4, fps: 3, loop: true, pose: t => ({ lean: 0.42 + 0.02 * sinT(t), hp: -0.3, thL: 1.95, thR: 1.85, knL: 2.65, knR: 2.6, ftL: 0.2, ftR: 0.2, arL: 0.95, arR: 0.9, elL: 0.8, elR: 0.9, spL: 0.3, spR: 0.3 }) },
  lie:    { name: 'Berbaring', kind: 'full', move: 0, n: 4, fps: 2, loop: true, pose: t => ({ lean: -1.5, hp: 0.12, thL: 1.5, thR: 1.35, knL: 0.05, knR: 0.6, arL: -1.5, arR: -1.35, elL: 1.2, elR: 1.0, spL: 0.55, spR: 0.5, px: 4, sy: 0.05 * sinT(t) }) },
  carry:  { name: 'Bawa kardus', kind: 'upper', n: 2, fps: 2, loop: true, pose: t => ({ box: 1, arL: 0.75, arR: 0.75, elL: 1.05, elR: 1.05, spL: 0.42, spR: 0.42, lean: -0.04, hp: 0.02 * sinT(t) }) },
  galon:  { name: 'Pikul galon', kind: 'upper', n: 2, fps: 2, loop: true, pose: t => ({ galon: 1, arR: 1.2, elR: 2.1, spR: 1.35, hy: -0.12, lean: -0.03 + 0.01 * sinT(t) }) },
  galonWalk: { name: 'Jalan pikul galon', kind: 'loco', n: 8, fps: 9, stride: 34, loop: true, pose: t => ({ ...ANIMS.walk.pose(t), galon: 1, arR: 1.2, elR: 2.1, spR: 1.35, hy: -0.12 }) },
  push:   { name: 'Dorong', kind: 'loco', n: 8, fps: 7, stride: 18, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: 0.55, hp: -0.25, thL: 0.55 + 0.35 * s, thR: 0.55 - 0.35 * s, knL: 0.35 + 0.6 * Math.max(0, c), knR: 0.35 + 0.6 * Math.max(0, -c), ftL: -0.3, ftR: -0.3, arL: 1.45, arR: 1.45, elL: 0.35, elR: 0.35, spL: 0.25, spR: 0.25 }; } },
  climb:  { name: 'Memanjat', kind: 'full', move: 0, n: 8, fps: 6, loop: true, pose: t => { const s = sinT(t);
    return { lean: -0.05, arL: 2.6 + 0.35 * s, arR: 2.6 - 0.35 * s, elL: 0.5 - 0.3 * s, elR: 0.5 + 0.3 * s, spL: 0.25, spR: 0.25, thL: 0.7 + 0.6 * s, thR: 0.7 - 0.6 * s, knL: 1.2 + 0.4 * s, knR: 1.2 - 0.4 * s, hp: 0.3 }; } },
  raiseHand: { name: 'Angkat tangan', kind: 'upper', n: 4, fps: 4, loop: true, pose: t => ({ arR: 2.95 + 0.06 * sinT(t), elR: 0.15, spR: 0.12, hp: 0.12, hy: 0.05 * sinT(t) }) },
  read:   { name: 'Baca buku', kind: 'upper', n: 4, fps: 2, loop: true, pose: t => ({ book: 1, arL: 0.55, arR: 0.55, elL: 1.75, elR: 1.75, spL: 0.32, spR: 0.32, hp: -0.4 + 0.03 * sinT(t), lean: 0.03 }) },
  clap:   { name: 'Tepuk tangan', kind: 'upper', n: 4, fps: 10, loop: true, pose: t => { const s = Math.max(0, sinT(t)); return { arL: 1.1, arR: 1.1, elL: 1.2, elR: 1.2, spL: -0.1 + 0.45 * s, spR: -0.1 + 0.45 * s, hp: 0.08 }; } },
  laugh:  { name: 'Tertawa', kind: 'upper', n: 6, fps: 10, loop: true, pose: t => { const s = sinT(t); return { hp: 0.3 + 0.08 * s, lean: -0.08 + 0.04 * s, arL: 0.2, elL: 2.0, spL: 0.1, arR: 0.35, elR: 1.6, spR: 0.3 }; } },
  think:  { name: 'Berpikir', kind: 'upper', n: 4, fps: 2, loop: true, pose: t => ({ arR: 0.45, elR: 2.45, spR: 0.32, arL: 0.35, elL: 1.75, spL: 0.35, hp: -0.12, hy: 0.15 + 0.04 * sinT(t) }) },
  bow:    { name: 'Salam', kind: 'full', move: 0, n: 8, fps: 8, pose: keyed([[0, {}], [0.35, { lean: 0.55, hp: -0.15, arL: 0.25, arR: 0.25, elL: 0.6, elR: 0.6, spL: -0.05, spR: -0.05 }], [0.65, { lean: 0.55 }], [1, POSE0]]) },
  sitDesk:{ name: 'Duduk menulis', kind: 'full', move: 0, n: 4, fps: 3, loop: true, pose: t => ({ lean: 0.18, hp: -0.35, thL: 1.6, thR: 1.6, knL: 1.6, knR: 1.6, arL: 1.0, arR: 1.1 + 0.05 * sinT(t), elL: 1.3, elR: 1.25, spL: 0.25, spR: 0.2 }) },
  // --- emote pemain ---
  dance:  { name: 'Joget', kind: 'full', move: 0, n: 8, fps: 8, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { sy: 0.55 * s, tw: 0.3 * s, hy: 0.3 * s, lean: 0.05, knL: 0.3 + 0.35 * Math.max(0, s), knR: 0.3 + 0.35 * Math.max(0, -s), thL: 0.15 * Math.max(0, s), thR: 0.15 * Math.max(0, -s),
             arL: 1.6 + 0.8 * Math.max(0, s), arR: 1.6 + 0.8 * Math.max(0, -s), elL: 1.4 - 0.6 * s, elR: 1.4 + 0.6 * s, spL: 0.6, spR: 0.6 }; } },
  salute: { name: 'Hormat', kind: 'upper', n: 10, fps: 8, pose: keyed([[0, {}], [0.25, { arR: 1.55, spR: 1.0, elR: 2.35, hp: 0.05, lean: -0.03 }], [0.8, {}], [1, Object.assign({}, POSE0)]]) },
  sitDown:{ name: 'Duduk santai', kind: 'full', move: 0, n: 4, fps: 3, loop: true, pose: t => ({ lean: -0.1 + 0.02 * sinT(t), thL: 1.75, thR: 1.6, knL: 0.45, knR: 1.6, arL: -0.4, arR: 0.55, elL: 0.1, elR: 1.0, spL: 0.25, spR: 0.15, hy: 0.25 * sinT(t) }) },
  roll:   { name: 'Guling', kind: 'full', move: 1.7, n: 10, fps: 16, pose: keyed([[0, {}], [0.12, { thL: 1.6, thR: 1.6, knL: 2.3, knR: 2.3, arL: 1.4, arR: 1.4, elL: 1.6, elR: 1.6, lean: 0.8, hp: -0.6 }],
    [0.8, { lean: 0.8 + TAU }], [1, Object.assign({}, POSE0, { lean: TAU + 0.03 })]]) },
  jump:   { name: 'Lompat', kind: 'full', move: 1, n: 10, fps: 12, pose: keyed([
    [0, {}], [0.15, { thL: 0.7, thR: 0.7, knL: 1.4, knR: 1.4, lean: 0.35, arL: -0.6, arR: -0.6, elL: 0.2, elR: 0.2 }],
    [0.3, { thL: -0.1, thR: -0.1, knL: 0.1, knR: 0.1, lean: 0.05, arL: 2.6, arR: 2.6, jump: 3 }],
    [0.5, { thL: 1.0, thR: 0.8, knL: 1.6, knR: 1.5, arL: 1.8, arR: 1.8, jump: 7 }],
    [0.7, { thL: 0.3, thR: 0.2, knL: 0.4, knR: 0.4, arL: 1.0, arR: 1.0, jump: 3 }],
    [0.85, { thL: 0.7, thR: 0.7, knL: 1.4, knR: 1.4, lean: 0.35, arL: 0.6, arR: 0.6, jump: 0 }], [1, POSE0]]) },
  // --- pukulan (bisa sambil jalan) ---
  jab:      { name: 'Jab kiri', kind: 'upper', n: 6, fps: 16, hit: { t: 0.45, r: 30, arc: 1.2 }, pose: keyed([
    [0, GUARD], [0.4, { arL: 1.57, elL: 0, spL: 0.05, tw: 0.35, lean: 0.15 }], [0.6, {}], [1, GUARD]]) },
  straight: { name: 'Pukulan lurus', kind: 'upper', n: 8, fps: 15, hit: { t: 0.5, r: 32, arc: 1.2 }, pose: keyed([
    [0, GUARD], [0.25, { tw: 0.3, arR: 0.6, elR: 2.1 }], [0.5, { tw: -0.55, arR: 1.57, elR: 0, spR: 0.02, lean: 0.22 }], [0.7, {}], [1, GUARD]]) },
  hook:     { name: 'Hook', kind: 'upper', n: 8, fps: 15, hit: { t: 0.55, r: 30, arc: 1.8 }, pose: keyed([
    [0, GUARD], [0.3, { tw: 0.6, arR: 1.4, elR: 1.5, spR: 1.1, lean: 0.05 }], [0.55, { tw: -0.8, arR: 1.5, elR: 1.6, spR: 0.3, lean: 0.15 }], [0.7, {}], [1, GUARD]]) },
  uppercut: { name: 'Uppercut', kind: 'upper', n: 8, fps: 14, hit: { t: 0.55, r: 28, arc: 1.2 }, pose: keyed([
    [0, GUARD], [0.3, { arR: 0.1, elR: 2.3, thL: 0.5, thR: 0.1, knL: 1.0, knR: 1.0, lean: 0.25, tw: 0.2 }],
    [0.55, { arR: 1.6, elR: 1.9, thL: 0.3, thR: -0.3, knL: 0.2, knR: 0.2, lean: -0.15, tw: -0.4 }], [0.75, {}], [1, GUARD]]) },
  // --- tendangan (seluruh badan) ---
  kickFront:{ name: 'Tendangan depan', kind: 'full', move: 0.3, n: 8, fps: 12, hit: { t: 0.5, r: 36, arc: 1.2 }, pose: keyed([
    [0, GUARD], [0.3, { thR: 1.3, knR: 2.0, thL: 0, knL: 0.15, lean: -0.1 }],
    [0.5, { thR: 1.55, knR: 0.05, lean: -0.3, arL: 0.6, elL: 1.2, arR: -0.4, elR: 0.6 }], [0.7, { thR: 1.3, knR: 2.0, lean: -0.1 }], [1, GUARD]]) },
  kickHigh: { name: 'Tendangan tinggi', kind: 'full', move: 0.3, n: 8, fps: 12, hit: { t: 0.5, r: 38, arc: 1.2 }, pose: keyed([
    [0, GUARD], [0.3, { thR: 1.6, knR: 2.2, thL: 0, knL: 0.1, lean: -0.2 }],
    [0.5, { thR: 2.3, knR: 0.1, lean: -0.5, arL: 0.4, elL: 1.0, arR: -0.5, elR: 0.5 }], [0.7, { thR: 1.6, knR: 2.2, lean: -0.2 }], [1, GUARD]]) },
  // --- pedang ---
  slashV:   { name: 'Tebas atas-bawah', kind: 'upper', n: 10, fps: 15, hit: { t: 0.6, r: 46, arc: 1.4 }, pose: keyed([
    [0, SW], [0.35, { arR: 2.9, elR: 0.4, swa: 0.6, lean: -0.1, tw: 0.3 }],
    [0.6, { arR: 1.3, elR: 0, swa: 0.3, lean: 0.25, tw: -0.4, thL: 0.5, knL: 0.4 }], [0.8, { arR: 0.6, swa: 0.3 }], [1, SW]]) },
  slashH:   { name: 'Tebas menyamping', kind: 'upper', n: 10, fps: 15, hit: { t: 0.55, r: 46, arc: 2.6 }, pose: keyed([
    [0, SW], [0.3, { tw: 0.9, arR: 1.45, elR: 0.3, spR: 0.9, swa: 0, lean: 0 }],
    [0.55, { tw: -1.0, arR: 1.45, elR: 0.1, spR: 0.2, lean: 0.15 }], [0.75, { tw: -1.1 }], [1, SW]]) },
  thrust:   { name: 'Tusukan', kind: 'upper', n: 8, fps: 14, hit: { t: 0.55, r: 52, arc: 0.8 }, pose: keyed([
    [0, SW], [0.35, { arR: -0.4, elR: 1.97, swa: 0, tw: 0.4, spR: 0.1 }],
    [0.55, { arR: 1.4, elR: 0.15, tw: -0.6, lean: 0.3, thL: 0.6, knL: 0.5 }], [0.75, {}], [1, SW]]) },
  spin:     { name: 'Tebasan putar', kind: 'full', move: 0.6, n: 10, fps: 16, hit: { t: 0.5, r: 48, arc: TAU }, pose: keyed([
    [0, SW], [0.15, { arR: 1.5, elR: 0.1, spR: 1.35, swa: 0, arL: 1.3, spL: 1.2, elL: 0.2 }], [0.85, { yaw: TAU }], [1, Object.assign({}, SW, { yaw: TAU })]]) },
  cast:     { name: 'Sihir', kind: 'upper', n: 10, fps: 10, hit: { t: 0.8, r: 60, arc: 0.9 }, pose: keyed([
    [0, {}], [0.3, { arL: 1.9, arR: 1.9, elL: 0.3, elR: 0.3, spL: 0.35, spR: 0.35, orb: 1.2 }],
    [0.6, { arL: 2.1, arR: 2.1, orb: 2.4, lean: -0.08 }], [0.8, { arL: 1.57, arR: 1.57, elL: 0, elR: 0, spL: 0.15, spR: 0.15, orb: 2.8, lean: 0.15 }], [1, Object.assign({}, POSE0)]]) },
  fall:     { name: 'Jatuh', kind: 'full', move: 0, n: 8, fps: 10, hold: true, pose: keyed([
    [0, {}], [0.3, { lean: -0.4, thL: 0.4, knL: 0.6, arL: 1.2, arR: 1.0, elL: 0.4, elR: 0.4 }],
    [0.6, { lean: -0.8, thL: 1.4, thR: 1.4, knL: 0.4, knR: 0.4, arL: -0.6, arR: -0.6, px: 2 }],
    [1, { lean: -1.45, hp: 0.15, thL: 1.4, thR: 1.3, knL: 0.15, knR: 0.35, arL: -1.6, arR: -1.3, elL: 0.2, elR: 0.2, spL: 0.5, spR: 0.6, px: 4 }]]) },
  // --- berantem: kuda-kuda, kena pukul, bangun, panik, meringkuk ---
  guard:    { name: 'Kuda-kuda', kind: 'full', n: 6, fps: 7, loop: true, pose: t => { const s = sinT(t); return Object.assign({}, GUARD, { knL: 0.3 + 0.08 * s, knR: 0.3 + 0.08 * s, thL: 0.32 + 0.04 * s, thR: -0.28 + 0.04 * s, hp: -0.05 + 0.025 * s, tw: 0.25, hy: 0.04 * s }); } },
  hurt:     { name: 'Kena pukul', kind: 'full', n: 6, fps: 13, pose: keyed([
    [0, GUARD], [0.25, { lean: -0.4, hp: 0.06, tw: 0.35, arL: 0.4, elL: 1.2, arR: 0.3, elR: 0.9, spL: 0.5, spR: 0.5, thL: -0.25, knL: 0.35, hy: 0.4 }], [0.6, { lean: -0.2, tw: 0.15, hy: 0.2 }], [1, GUARD]]) },
  getUp:    { name: 'Bangun', kind: 'full', n: 8, fps: 8, pose: keyed([
    [0, { lean: -1.45, hp: 0.15, thL: 1.4, thR: 1.3, knL: 0.15, knR: 0.35, arL: -1.6, arR: -1.3, elL: 0.2, elR: 0.2, spL: 0.5, spR: 0.6, px: 4 }],
    [0.45, { lean: 0.5, hp: -0.3, thL: 1.9, thR: 1.6, knL: 2.4, knR: 2.0, arL: 0.9, arR: 0.6, elL: 0.6, elR: 0.6, spL: 0.3, spR: 0.3, px: 0 }], [1, {}]]) },
  panic:    { name: 'Lari panik', kind: 'loco', n: 8, fps: 13, stride: 58, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: 0.22, hp: -0.18, tw: 0.15 * s, sy: 0.2 * c, thL: 0.15 + 0.85 * s, thR: 0.15 - 0.85 * s, knL: 0.3 + 1.5 * Math.max(0, c), knR: 0.3 + 1.5 * Math.max(0, -c),
             arL: 2.5 + 0.35 * s, arR: 2.5 - 0.35 * s, elL: 0.5 + 0.3 * c, elR: 0.5 - 0.3 * c, spL: 0.45, spR: 0.45, jump: 0.8 * Math.abs(s) ** 1.5 }; } },
  cower:    { name: 'Meringkuk takut', kind: 'full', n: 4, fps: 6, loop: true, pose: t => ({ lean: 0.45, hp: -0.25, thL: 1.2, thR: 1.1, knL: 1.9, knR: 1.8, arL: 2.3 + 0.08 * sinT(t), arR: 2.3 - 0.08 * sinT(t), elL: 2.1, elR: 2.1, spL: 0.7, spR: 0.7, hy: 0.15 * sinT(t) }) },
  // --- berantem lanjutan (guide 70): tangkis, sapuan, tendangan putar, banting bahu, kunci lengan, provokasi, pusing ---
  block:    { name: 'Tangkis', kind: 'full', n: 4, fps: 6, loop: true, pose: t => ({ arL: 1.95, elL: 2.35, arR: 1.95, elR: 2.35, spL: -0.12, spR: -0.12, lean: 0.12, hp: -0.18, thL: 0.35, thR: -0.25, knL: 0.4 + 0.03 * sinT(t), knR: 0.4 + 0.03 * sinT(t), tw: 0.15 }) },
  sweepKick:{ name: 'Sapuan kaki', kind: 'full', n: 10, fps: 14, pose: keyed([
    [0, GUARD], [0.18, { thL: 1.9, knL: 2.5, thR: 1.4, knR: 0.1, lean: 0.55, hp: -0.35, arL: 1.0, arR: 1.0, elL: 0.6, elR: 0.6, spL: 0.6, spR: 0.6, yaw: 0 }],
    [0.8, { yaw: TAU }], [1, Object.assign({}, GUARD, { yaw: TAU })]]) },
  spinKick: { name: 'Tendangan putar', kind: 'full', n: 10, fps: 13, pose: keyed([
    [0, GUARD], [0.2, { thR: 0.5, knR: 1.1, yaw: 0.4, lean: 0.05 }], [0.55, { thR: 1.65, knR: 0.1, thL: 0.1, knL: 0.2, lean: -0.35, yaw: TAU * 0.7, jump: 4, arL: 1.5, spL: 1.0, arR: 1.3, spR: 1.0 }],
    [0.85, { yaw: TAU, jump: 0, thR: 0.6, knR: 0.6 }], [1, Object.assign({}, GUARD, { yaw: TAU })]]) },
  throwShoulder: { name: 'Banting bahu', kind: 'full', n: 10, fps: 12, pose: keyed([
    [0, GUARD], [0.3, { arL: 1.55, arR: 1.55, elL: 0.3, elR: 0.3, spL: 0.1, spR: 0.1, lean: 0.12, tw: 0 }],
    [0.65, { arL: 2.7, arR: 2.5, elL: 1.1, elR: 1.0, lean: 0.95, hp: -0.3, thL: 0.7, thR: 0.6, knL: 0.8, knR: 0.7, tw: 0.7 }], [1, GUARD]]) },
  armlock:  { name: 'Kunci lengan', kind: 'full', n: 6, fps: 6, loop: true, pose: t => ({ arL: 1.0, elL: 0.9, spL: 0.3, arR: 1.2, elR: 1.6 + 0.08 * sinT(t), spR: -0.2, lean: 0.3, hp: -0.2, thL: 0.4, knL: 0.5, thR: -0.2, knR: 0.3 }) },
  grabbed:  { name: 'Dikunci', kind: 'full', n: 6, fps: 8, loop: true, pose: t => ({ lean: 0.6, hp: 0.2, arL: -0.6, elL: 0.3, arR: 0.3 + 0.2 * sinT(t), elR: 0.4, spR: 0.6, thL: 0.3, knL: 0.6, thR: 0.1, knR: 0.5, hy: 0.3 * sinT(t) }) },
  taunt:    { name: 'Provokasi', kind: 'upper', n: 10, fps: 10, pose: keyed([[0, {}], [0.25, { arR: 1.1, elR: 2.4, spR: -0.35, hp: 0.15 }], [0.4, { arR: 1.2, elR: 2.2 }], [0.55, { arR: 1.1, elR: 2.4 }],
    [0.75, { arR: 0.3, elR: 0.3, arL: 1.6, elL: 1.4, spL: 0.3, hp: 0.25, hy: -0.2 }], [1, Object.assign({}, POSE0)]]) },
  dizzy:    { name: 'Pusing', kind: 'full', n: 8, fps: 6, loop: true, pose: t => { const s = sinT(t), c = cosT(t); return { hy: 0.4 * s, hp: 0.2 + 0.1 * c, sy: 0.35 * s, lean: 0.1 + 0.1 * c, arL: 0.3, arR: 0.3, spL: 0.45, spR: 0.45, elL: 0.5, elR: 0.5, knL: 0.35 + 0.1 * s, knR: 0.35 - 0.1 * s }; } },
  backstep: { name: 'Mundur cepat', kind: 'full', n: 6, fps: 12, pose: keyed([[0, GUARD], [0.35, { thL: 0.6, thR: 0.6, knL: 1.0, knR: 1.0, lean: -0.15, jump: 3 }], [0.7, { jump: 1 }], [1, GUARD]]) },
  bagPunch: { name: 'Latihan samsak', kind: 'upper', n: 12, fps: 12, loop: true, pose: keyed([[0, GUARD], [0.15, { arL: 1.57, elL: 0, spL: 0.05, tw: 0.35 }], [0.3, GUARD],
    [0.5, { tw: -0.55, arR: 1.57, elR: 0, spR: 0.02, lean: 0.22 }], [0.65, GUARD], [0.82, { tw: 0.6, arR: 1.4, elR: 1.5, spR: 1.1 }], [1, GUARD]]) },
  // --- aktivitas (guide 71): berenang, memancing, bola basket & sepak bola ---
  swim:     { name: 'Berenang', kind: 'loco', n: 8, fps: 8, stride: 24, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: 1.38, hp: -0.85, hy: 0.25 * s, sy: 0.25 * s, arL: 1.9 + 1.25 * s, arR: 1.9 - 1.25 * s, elL: 0.35 + 0.35 * Math.max(0, c), elR: 0.35 + 0.35 * Math.max(0, -c), spL: 0.2, spR: 0.2,
             thL: 0.25 * sinT(t * 2), thR: -0.25 * sinT(t * 2), knL: 0.2, knR: 0.2, ftL: 0.6, ftR: 0.6 }; } },
  tread:    { name: 'Mengapung', kind: 'full', n: 8, fps: 6, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: 0.15, hp: 0.05, arL: 1.25 + 0.15 * c, arR: 1.25 - 0.15 * c, spL: 0.75 + 0.35 * s, spR: 0.75 + 0.35 * s, elL: 0.4, elR: 0.4,
             thL: 0.6 + 0.35 * s, thR: 0.6 - 0.35 * s, knL: 0.9 + 0.3 * c, knR: 0.9 - 0.3 * c, jump: 0.6 * s }; } },
  fishCast: { name: 'Lempar pancing', kind: 'full', move: 0, n: 10, fps: 10, pose: keyed([
    [0, { rod: 1, rpa: 0.6, arR: 0.9, elR: 0.6, arL: 0.8, elL: 0.9, spL: -0.1 }],
    [0.4, { rod: 1, rpa: 2.3, arR: 2.6, elR: 0.9, spR: 0.3, arL: 1.2, elL: 1.4, lean: -0.15, tw: 0.35, thL: 0.25, knL: 0.2 }],
    [0.65, { rod: 2, rpa: 0.35, arR: 1.3, elR: 0.2, arL: 0.9, elL: 0.8, lean: 0.25, tw: -0.25, thL: 0.35, knL: 0.35 }],
    [1, { rod: 2, rpa: 0.55, arR: 1.0, elR: 0.5, arL: 0.85, elL: 0.9, lean: 0.08, tw: 0, thL: 0.1, knL: 0.15 }]]) },
  fishWait: { name: 'Menunggu umpan', kind: 'full', move: 0, n: 6, fps: 4, loop: true, pose: t => ({ rod: 2, rpa: 0.55 + 0.04 * sinT(t), arR: 1.0, elR: 0.5, arL: 0.85, elL: 0.9, spL: -0.05, lean: 0.06, hp: -0.15, hy: 0.15 * sinT(t), knL: 0.12, knR: 0.12 }) },
  fishPull: { name: 'Tarik pancing', kind: 'full', move: 0, n: 6, fps: 10, loop: true, pose: t => { const s = sinT(t);
    return { rod: 2, rpa: 1.15 + 0.2 * s, arR: 1.5 + 0.2 * s, elR: 0.9, arL: 1.4 + 0.2 * s, elL: 1.2, spL: -0.1, lean: -0.3 + 0.08 * s, thL: 0.45, thR: -0.2, knL: 0.55, knR: 0.25, hp: 0.15 }; } },
  fishShow: { name: 'Pamer ikan', kind: 'upper', n: 6, fps: 6, loop: true, pose: t => ({ arL: 2.3, elL: 0.6, spL: 0.3, arR: 1.0 + 0.1 * sinT(t), elR: 1.2, hp: 0.15, hy: 0.2 * sinT(t) }) },
  dribble:  { name: 'Dribel', kind: 'upper', n: 6, fps: 9, loop: true, pose: t => { const s = sinT(t); return { arR: 0.55 + 0.25 * s, elR: 0.55 - 0.25 * s, spR: 0.25, arL: 0.6, elL: 1.2, spL: 0.25, lean: 0.12, hp: -0.15 }; } },
  shoot:    { name: 'Tembakan', kind: 'full', move: 0, n: 10, fps: 12, pose: keyed([
    [0, { arR: 0.9, elR: 1.6, arL: 0.9, elL: 1.6, lean: 0.1 }], [0.3, { arR: 1.8, elR: 2.3, arL: 1.6, elL: 2.0, spL: 0.3, thL: 0.7, thR: 0.7, knL: 1.3, knR: 1.3, lean: 0.25 }],
    [0.55, { arR: 3.0, elR: 0.2, arL: 2.6, elL: 0.5, thL: 0.1, thR: 0.1, knL: 0.15, knR: 0.15, lean: -0.05, jump: 5 }], [0.75, { arR: 2.8, elR: 0.9, jump: 3 }], [1, POSE0]]) },
  kickBall: { name: 'Tendang bola', kind: 'full', move: 0.2, n: 8, fps: 13, pose: keyed([
    [0, {}], [0.35, { thR: -0.7, knR: 1.3, thL: 0.15, knL: 0.3, lean: 0.1, arL: 0.9, spL: 0.5, arR: -0.3, tw: 0.2 }],
    [0.55, { thR: 1.35, knR: 0.1, thL: 0.1, knL: 0.25, lean: -0.2, arL: 0.4, arR: 0.6, spR: 0.4, tw: -0.25 }], [0.75, { thR: 0.9, knR: 0.4 }], [1, POSE0]]) },
  cheer:    { name: 'Selebrasi', kind: 'full', n: 8, fps: 9, loop: true, pose: t => { const s = Math.abs(sinT(t)); return { arL: 2.9, arR: 2.9, elL: 0.3, elR: 0.3, spL: 0.45, spR: 0.45, jump: 3 * s, knL: 0.4 * (1 - s), knR: 0.4 * (1 - s), hp: 0.25 }; } },
  catch:    { name: 'Tangkap bola', kind: 'upper', n: 4, fps: 6, loop: true, pose: t => ({ arL: 1.35, arR: 1.35, elL: 0.6, elR: 0.6, spL: 0.25, spR: 0.25, lean: 0.1 + 0.03 * sinT(t) }) },
};
// --- anim kegiatan (jadwal NPC & aksi pemain) dengan barang di tangan. Barang digambar raka/rig.js dari pose.tool:
//  1 penggaris + buku  2 wajan + sutil  3 piring + sendok  4 gelas kopi  5 kunci pas  6 gitar  7 kamera  8 buku sketsa + pensil
//  9 kuas + kaleng cat  10 dumbel  11 raket  12 cangkul  13 sajadah  14 papan skate  15 bola basket  16 bola sepak  17 pulpen
//  18 kalkulator  19 kipas bambu  20 gembor  21 nampan + 2 gelas
const SITB = { lean: -0.05, thL: 1.7, thR: 1.7, knL: 1.5, knR: 1.5, spL: 0.2, spR: 0.2 };   // duduk di kursi/bangku, kaki menapak
const ACT_ANIMS = {
  teach:   { name: 'Mengajar (penggaris)', kind: 'upper', n: 8, fps: 5, loop: true, pose: t => { const s = sinT(t);
    return { tool: 1, arR: 1.45 + 0.2 * s, elR: 0.25, spR: 0.35, arL: 0.45, elL: 1.5, spL: 0.25, hy: 0.35 + 0.15 * s, hp: 0.05, lean: 0.02, tw: -0.15 }; } },
  cook:    { name: 'Memasak (wajan)', kind: 'full', move: 0, n: 8, fps: 7, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { tool: 2, tl: t, lean: 0.14, hp: -0.4, arL: 0.75, elL: 0.75, spL: 0.05, arR: 0.85 + 0.12 * s, elR: 0.95 + 0.15 * c, spR: 0.0, tw: 0.08 * s, sy: 0.1 * c, knL: 0.12, knR: 0.12 }; } },
  eat:     { name: 'Makan (piring)', kind: 'full', move: 0, n: 10, fps: 5, loop: true, pose: keyed([
    [0, { ...SITB, tool: 3, arL: 0.55, elL: 1.15, arR: 0.6, elR: 1.0, hp: -0.4 }], [0.35, { arR: 0.55, elR: 1.05 }],
    [0.6, { arR: 0.85, elR: 2.0, spR: 0.0, hp: -0.1 }], [0.75, { arR: 0.85, elR: 2.0 }], [1, { arR: 0.6, elR: 1.0, spR: 0.2, hp: -0.4 }]]) },
  drink:   { name: 'Ngopi (gelas)', kind: 'full', move: 0, n: 10, fps: 4, loop: true, pose: keyed([
    [0, { ...SITB, tool: 4, arR: 0.45, elR: 1.2, arL: 0.2, elL: 0.6, hy: 0.2 }], [0.45, { hy: -0.15 }],
    [0.65, { arR: 0.75, elR: 2.05, spR: 0.0, hp: 0.12, hy: 0 }], [0.8, { arR: 0.75, elR: 2.05, hp: 0.12 }], [1, { arR: 0.45, elR: 1.2, spR: 0.2, hp: 0, hy: 0.2 }]]) },
  wrench:  { name: 'Servis (kunci pas)', kind: 'full', move: 0, n: 6, fps: 7, loop: true, pose: t => { const s = sinT(t);
    return { tool: 5, lean: 0.5, hp: -0.35, thL: 1.95, thR: 1.85, knL: 2.65, knR: 2.6, ftL: 0.2, ftR: 0.2, arR: 1.2 + 0.15 * s, elR: 0.45 - 0.25 * s, spR: 0.15 + 0.15 * s, arL: 1.0, elL: 0.6, spL: 0.25 }; } },
  guitar:  { name: 'Main gitar (duduk)', kind: 'full', move: 0, n: 8, fps: 8, loop: true, pose: t => { const s = sinT(t * 2);
    return { ...SITB, tool: 6, lean: 0.06, hp: -0.25, hr: 0.1, arR: 0.35, elR: 1.25 + 0.18 * s, spR: 0.1, arL: 0.95, elL: 1.25, spL: 0.75, hy: -0.2, tw: 0.15 }; } },
  busk:    { name: 'Ngamen (gitar berdiri)', kind: 'full', move: 0, n: 8, fps: 8, loop: true, pose: t => { const s = sinT(t * 2), c = cosT(t);
    return { tool: 6, lean: 0.02, hp: 0.05 + 0.05 * c, arR: 0.35, elR: 1.35 + 0.18 * s, spR: 0.1, arL: 0.95, elL: 1.25, spL: 0.75, hy: -0.15, tw: 0.15, sy: 0.3 * c, knL: 0.15 + 0.1 * Math.max(0, c), knR: 0.15 }; } },
  photo:   { name: 'Memotret (kamera)', kind: 'upper', n: 10, fps: 6, loop: true, pose: keyed([
    [0, { tool: 7, arR: 1.0, elR: 1.9, spR: 0.15, arL: 1.0, elL: 1.9, spL: 0.15, hp: 0.0 }], [0.4, { hy: 0.25 }], [0.55, { hy: 0.25, elR: 2.0 }], [0.65, { elR: 1.9 }], [1, { hy: 0 }]]) },
  sketch:  { name: 'Menggambar (buku sketsa)', kind: 'full', move: 0, n: 8, fps: 5, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { ...SITB, tool: 8, arL: 0.5, elL: 1.55, spL: 0.2, arR: 0.55 + 0.05 * s, elR: 1.45 + 0.08 * c, spR: 0.05, hp: -0.45, hy: 0.05 * s }; } },
  paint:   { name: 'Mengecat (kuas)', kind: 'full', move: 0, n: 8, fps: 6, loop: true, pose: t => { const s = sinT(t);
    return { tool: 9, arR: 2.0 + 0.35 * s, elR: 0.25, spR: 0.25, arL: 0.2, elL: 0.9, spL: 0.15, hp: 0.15 + 0.15 * s, lean: -0.05, thL: 0.2, thR: -0.15 }; } },
  lift:    { name: 'Angkat dumbel', kind: 'full', move: 0, n: 8, fps: 6, loop: true, pose: t => { const s = sinT(t);
    return { tool: 10, arL: 0.15, arR: 0.15, elL: 1.3 - 1.05 * s, elR: 1.3 + 1.05 * s, spL: 0.2, spR: 0.2, lean: -0.03, thL: 0.1, thR: -0.05, hp: 0.05 }; } },
  racket:  { name: 'Main badminton (raket)', kind: 'full', move: 0, n: 12, fps: 10, loop: true, pose: keyed([
    [0, { tool: 11, arR: 0.9, elR: 1.2, spR: 0.35, arL: 0.8, elL: 0.6, thL: 0.3, thR: -0.25, knL: 0.35, knR: 0.35, lean: 0.12 }],
    [0.35, { arR: 2.6, elR: 1.6, spR: 0.5, arL: 2.0, elL: 0.3, lean: -0.15, tw: 0.45, hy: 0.1 }],
    [0.55, { arR: 2.4, elR: 0.1, spR: 0.2, arL: 0.6, elL: 0.8, lean: 0.25, tw: -0.4, jump: 1.5 }],
    [0.75, { arR: 0.9, elR: 0.6, jump: 0, tw: -0.1 }], [1, { arR: 0.9, elR: 1.2, spR: 0.35, lean: 0.12, tw: 0 }]]) },
  hoe:     { name: 'Mencangkul', kind: 'full', move: 0, n: 10, fps: 7, loop: true, pose: keyed([
    [0, { tool: 12, arR: 0.55, elR: 0.35, spR: -0.15, arL: 0.75, elL: 0.3, spL: -0.15, lean: 0.6, hp: -0.3, thL: 0.45, thR: -0.25, knL: 0.55, knR: 0.35 }],
    [0.45, { arR: 2.5, elR: 0.6, arL: 2.6, elL: 0.6, lean: -0.05, hp: 0.05 }],
    [0.65, { arR: 0.6, elR: 0.3, arL: 0.8, elL: 0.25, lean: 0.62, hp: -0.3 }], [1, { arR: 0.55, elR: 0.35, arL: 0.75, elL: 0.3 }]]) },
  pray:    { name: 'Salat (sajadah)', kind: 'full', move: 0, n: 24, fps: 4, loop: true, pose: keyed([
    [0, { tool: 13, arL: 0.55, elL: 1.75, spL: -0.35, arR: 0.6, elR: 1.75, spR: -0.35, hp: -0.25 }], [0.2, {}],
    [0.3, { lean: 1.45, hp: -0.1, arL: 0.95, elL: 0.0, spL: 0.0, arR: 0.95, elR: 0.0, spR: 0.0, knL: 0.05, knR: 0.05 }], [0.4, {}],
    [0.5, { lean: 0.03, arL: 0.08, elL: 0.25, arR: 0.08, elR: 0.25, spL: 0.12, spR: 0.12, hp: -0.25 }],
    [0.62, { lean: 2.0, hp: 0.25, thL: 0.45, thR: 0.45, knL: 2.05, knR: 2.05, ftL: 0.9, ftR: 0.9, arL: 0.75, elL: 0.35, arR: 0.75, elR: 0.35, spL: 0.35, spR: 0.35 }],
    [0.76, {}], [0.84, { lean: 0.15, hp: -0.3, thL: 1.7, thR: 1.7, knL: 2.9, knR: 2.9, ftL: 0.9, ftR: 0.9, arL: 0.5, elL: 0.9, arR: 0.5, elR: 0.9, spL: 0.1, spR: 0.1 }],
    [0.92, {}], [1, { lean: 0.03, hp: -0.25, thL: 0, thR: 0, knL: 0.1, knR: 0.1, ftL: 0, ftR: 0, arL: 0.55, elL: 1.75, spL: -0.35, arR: 0.6, elR: 1.75, spR: -0.35 }]]) },
  skate:   { name: 'Main skateboard', kind: 'loco', n: 8, fps: 6, stride: 50, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { tool: 14, bob: 1.6, lean: 0.12, thL: 0.35, thR: -0.3, knL: 0.45 + 0.1 * s, knR: 0.35 + 0.1 * s, arL: 0.45 + 0.1 * c, arR: 0.3, elL: 0.4, elR: 0.5, spL: 0.7, spR: 0.6, tw: 0.35, hy: -0.3, sy: 0.15 * c }; } },
  bball:   { name: 'Dribel bola basket', kind: 'full', move: 0, n: 8, fps: 9, loop: true, pose: t => { const s = sinT(t);
    return { tool: 15, tl: Math.abs(cosT(t / 1)), arR: 0.55 + 0.25 * s, elR: 0.55 - 0.25 * s, spR: 0.3, arL: 0.6, elL: 1.2, spL: 0.25, lean: 0.2, hp: -0.15, thL: 0.35, thR: -0.2, knL: 0.5, knR: 0.45 }; } },
  kickAbout:{ name: 'Main bola (sepak)', kind: 'full', move: 0, n: 10, fps: 10, loop: true, pose: keyed([
    [0, { tool: 16, tl: 0 }], [0.35, { thR: -0.7, knR: 1.3, thL: 0.15, knL: 0.3, lean: 0.1, arL: 0.9, spL: 0.5, arR: -0.3, tw: 0.2 }],
    [0.55, { thR: 1.0, knR: 0.2, lean: -0.15, arL: 0.4, arR: 0.6, spR: 0.4, tw: -0.25, tl: 1 }], [0.75, { thR: 0.3, knR: 0.3, tl: 0.4 }], [1, { thR: 0, knR: 0.1, thL: 0, knL: 0.1, lean: 0.03, arL: 0.08, arR: 0.08, spL: 0.12, spR: 0.12, tw: 0, tl: 0 }]]) },
  write:   { name: 'Menulis (pulpen)', kind: 'full', move: 0, n: 6, fps: 4, loop: true, pose: t => { const s = sinT(t);
    return { tool: 17, lean: 0.18, hp: -0.4, thL: 1.6, thR: 1.6, knL: 1.6, knR: 1.6, arL: 1.0, arR: 1.1 + 0.04 * s, elL: 1.3, elR: 1.25 + 0.06 * cosT(t), spL: 0.25, spR: 0.15 }; } },
  cashier: { name: 'Jaga kasir (kalkulator)', kind: 'upper', n: 8, fps: 6, loop: true, pose: t => { const s = sinT(t * 2);
    return { tool: 18, arL: 0.65, elL: 1.25, spL: 0.1, arR: 0.75, elR: 1.15 + 0.1 * Math.max(0, s), spR: -0.1, hp: -0.35, lean: 0.06 }; } },
  sell:    { name: 'Jualan (kipas)', kind: 'upper', n: 6, fps: 8, loop: true, pose: t => { const s = sinT(t);
    return { tool: 19, arR: 0.85, elR: 0.75 + 0.45 * s, spR: 0.2, arL: 0.3, elL: 1.4, spL: 0.1, hp: -0.25, hy: 0.2 * cosT(t / 2), lean: 0.08 }; } },
  water:   { name: 'Menyiram tanaman (gembor)', kind: 'full', move: 0, n: 8, fps: 4, loop: true, pose: t => { const s = sinT(t);
    return { tool: 20, tl: 0.6 + 0.15 * s, arR: 0.75, elR: 0.35, spR: 0.25, arL: 0.25, elL: 0.6, lean: 0.2, hp: -0.4, thL: 0.25, thR: -0.15, knL: 0.3, knR: 0.25, hy: 0.25 * s }; } },
  serve:   { name: 'Bawa nampan', kind: 'upper', n: 4, fps: 3, loop: true, pose: t => ({ tool: 21, arL: 0.45, elL: 1.15, spL: 0.25, arR: 0.45, elR: 1.15, spR: 0.25, lean: -0.03, hp: -0.1 + 0.02 * sinT(t) }) },
};
Object.assign(ANIMS, ACT_ANIMS);
ANIMS.getup = { name: 'Bangun', kind: 'full', move: 0, n: 8, fps: 9, pose: t => ANIMS.fall.pose(1 - t) };
const COMBOS = { punch: ['jab', 'straight', 'hook', 'uppercut'], kick: ['kickFront', 'kickHigh'], slash: ['slashH', 'slashV', 'thrust', 'spin'] };
const FAMILY = {}; for (const f in COMBOS) for (const a of COMBOS[f]) FAMILY[a] = f;
const animDur = n => ANIMS[n].n / ANIMS[n].fps;
export { STYLES, ANIMS, humanShape, buildVox, R, fixedRamp, organicColor, hexRGB, makeRamps, faceCfg };
