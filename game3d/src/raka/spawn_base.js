// Dasar NPC spawn (warga generik, guide segmen 34): satu generator orang dari seed v, dipakai semua template sp_*.js.
// Template hanya menulis "deskripsi" (jenis kelamin, umur, tubuh, rambut, baju, bawaan) lalu memanggil orang(d).
// Gaya sama dengan tokoh bernama: voxel 1/64 petak, ramp 4 tingkat, wajah 14x15 (alis z11, mulut di bawah hidung),
// rok & sarung memakai rok.js + P.skirt supaya tidak terbelah. Semua bahan berprefiks 'sp'.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace, skullLayer, HELD_KIND } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

/* ================= warna: ramp dibuat otomatis dari satu warna dasar */
const hx = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const toh = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const sat = (c, s) => { const g = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11; return c.map(v => g + (v - g) * s); };
const tones = (h, ks, s = 1) => ks.map(k => toh(sat(hx(h), s).map(v => v * k)));
const R4 = [0.76, 0.87, 0.97, 1.06];

export const SKIN = ['#e6b48c', '#d6a078', '#c48a60', '#a66e46', '#86542f', '#f2cbb2'];   // langsat, sawo terang, sawo matang, sawo gelap, cokelat tua, bule
export const HAIR = { hitam: '#1c1714', coklatTua: '#30221a', coklat: '#523624', abu: '#7e7a74', putih: '#cdc9c1', pirang: '#c9a464', merah: '#8e4c2c' };
export const CLOTH = {
  putih: '#eeede6', krem: '#e0d4ba', abu: '#8c8e93', abuMuda: '#b9bbc1', hitam: '#2c2c32', navy: '#28344f', biru: '#3c66aa', biruMuda: '#80aad8',
  tosca: '#2c8c8a', hijau: '#3c8c4c', hijauTua: '#2c5c3c', olive: '#6c6c3c', kuning: '#dcbc40', oranye: '#dc7a32', merah: '#c03c34', marun: '#7c2c34',
  pink: '#de8caa', ungu: '#6c4c8c', lilac: '#b29ad0', coklat: '#6c4c32', coklatMuda: '#a27c52', mocca: '#9c7c64', khaki: '#b2a272', jins: '#36486c',
  jinsMuda: '#5c7aa2', salem: '#e0a088', mint: '#9ccab2', kopi: '#4a3628', oranyePudar: '#c87a46',
  hitamPudar: '#45433f', pinkTua: '#b8607e', pinkPersit: '#e8a4ba', coklatPol: '#6a5236', khakiPNS: '#a8946a', oranyeRompi: '#e86a1c', hijauOjol: '#2ca04c', karet: '#3a2c22',
  lorDasar: '#5c6a44', lorTua: '#3a4630', lorCoklat: '#6e5c3e', lorHitam: '#22261e', stabilo: '#c8e030', safety: '#e8e8e0',
};
const R = {};
SKIN.forEach((h, i) => { R['spKulit' + i] = tones(h, [0.75, 0.87, 1, 1.08]); R['spKulit' + i + 'S'] = tones(h, [0.82]); R['spPipi' + i] = [toh(hx(h).map((v, k) => v * [1.0, 0.85, 0.8][k]))]; });
for (const [k, h] of Object.entries(HAIR)) { R['spRmb_' + k] = tones(h, [0.8, 0.92, 1.04, 1.22]); R['spRmb_' + k + 'T'] = tones(h, [1.5]).map(c => k === 'hitam' ? '#3a322c' : c); R['spAlis_' + k] = tones(h, [0.9]); }
for (const [k, h] of Object.entries(CLOTH)) { const s = k.startsWith('lor') || k === 'stabilo' || k === 'oranyeRompi' || k === 'hijauOjol' ? 1 : 0.86; R['spC_' + k] = tones(h, R4, s); R['spC_' + k + 'S'] = tones(h, [0.7], s); }
Object.assign(R, {
  spSol: ['#cfccc4', '#dedbd2', '#ecebe4', '#f8f7f2'], spSolG: ['#2a2a2e'], spKancing: ['#e8e6de'], spEmas: ['#d8b048'], spPerak: ['#c8ccd4'],
  spKaca: ['#18161c'], spKacaL: ['#cfe3f0'], spHP: ['#24262e'], spLayar: ['#4a6a9a'], spKayu: ['#6e4a2a', '#7e5632', '#8e623a', '#a07244'], spBesi: ['#6a6e76', '#7c8088', '#8e929a', '#a2a6ae'],
  spAnyam: ['#a8884e', '#bc9a5c', '#ceac6a', '#dcbc7c'], spAnyamS: ['#8a6c3a'], spKaret: ['#1e1e22', '#28282e', '#323238', '#3e3e46'],
  spKresekP: ['#e4e4e2', '#eeeeec', '#f6f6f4', '#fcfcfa'], spKresekH: ['#26262a', '#303034', '#3a3a3e', '#46464a'], spKresekM: ['#b8302c', '#c83a34', '#d6443c', '#e05048'],
  spIsi: ['#7ab84a'], spOli: ['#2a2622'], spKopi: ['#3a2418'], spKuah: ['#c89a5a'], spBakso: ['#9a7a5e', '#a8886a', '#b69676', '#c4a482'], spLuka: ['#e2aa98'], spRantai: ['#a8a29a', '#bcb6ac', '#d0cabe', '#e4ded2'], spIkan: ['#9aa8b4', '#aab8c4', '#bcc8d2', '#ccd6de'], spSemen: ['#8a8a86', '#9a9a96', '#aaaaa6', '#bababa'], spJaring: ['#3a6a7a'], spMerahLL: ['#e8342c'], spTali: ['#2a2a30'], spLogo: ['#e8e4d8'], spMerahP: ['#c83a34'], spPutihP: ['#f4f4f0'],
  spApi: ['#f0b030', '#f8c848', '#fcd860', '#fee880'], spJamu: ['#d89a2a', '#e6aa3a', '#f0bc4c', '#f8cc5c'], spMerahPipi: ['#c8705a'],
});
addRamps(R);

/* ================= seed */
export function rng(v, salt = 0) {
  let a = (v * 2654435761 + salt * 40503 + 0x9e3779b9) >>> 0;
  const f = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  f.pick = a2 => a2[Math.floor(f() * a2.length)];
  f.w = obj => { const e = Object.entries(obj), s = e.reduce((t, [, w]) => t + w, 0); let r = f() * s; for (const [k, w] of e) { r -= w; if (r <= 0) return k; } return e[0][0]; };
  f.p = q => f() < q;
  return f;
}
// orang dasar dari seed: template menimpa yang perlu (rambut, baju, dll.)
export function gen(v, o = {}) {
  const r = rng(v, o.salt || 0);
  const sex = o.sex === 'LP' ? (r.p(o.pP ?? 0.5) ? 'P' : 'L') : (o.sex || 'L');
  const age = o.age ? (Array.isArray(o.age) ? r.pick(o.age) : o.age) : 'dewasa';
  const skin = o.skin != null ? o.skin : +r.w(o.skinW || { 0: 2, 1: 4, 2: 5, 3: 3, 4: 1 });
  const build = o.build ? (Array.isArray(o.build) ? r.pick(o.build) : o.build) : r.w(age === 'anak' ? { kurus: 1, sedang: 3 } : { kurus: 2, sedang: 5, gempal: 2 });
  const hairCol = o.hairCol || (age === 'lansia' ? r.pick(['abu', 'putih', 'putih']) : r.w({ hitam: 7, coklatTua: 3 }));
  const L = sex === 'L';
  const hairStyle = o.hair ? r.pick(o.hair) : L ? (age === 'lansia' ? r.pick(['botakTengah', 'cepak', 'belah', 'plontos']) : age === 'anak' ? r.pick(['poni', 'cepak', 'jabrik']) : r.pick(['cepak', 'belah', 'ikal', 'poni', age === 'muda' ? 'jabrik' : 'plontos', age === 'muda' ? 'belah' : 'gondrong']))
    : (age === 'anak' ? r.pick(['kuncir', 'bob', 'kepang']) : age === 'lansia' ? 'sanggul' : r.pick(['kuncir', 'sanggul', 'sebahu', 'bob', 'kepang']));
  const face = {
    skull: r.pick(['oval', 'oval', 'bulat', 'kotak']), eyes: r.pick(age === 'anak' ? ['besar', 'bulat', 'normal'] : ['normal', 'bulat', 'sipit', 'sayu', 'tajam', 'kecil', 'ramah', 'lelah']),
    brow: r.pick(L ? ['tipis', 'tebal', 'lurus', 'tebal'] : ['tipis', 'lurus', 'tipis']), mouth: r.pick(['datar', 'senyum', 'kecil', 'lebar']),
    kumis: L && (age === 'dewasa' || age === 'lansia') && r.p(o.kumisP ?? 0.35) ? r.pick(['tipis', 'tebal']) : null,
    jenggot: L && age !== 'anak' && age !== 'muda' && r.p(o.jenggotP ?? 0.12),
    kacamata: age !== 'anak' && r.p(o.kacamataP ?? 0.18) ? r.pick(['hitam', 'tipis']) : null,
    blush: age === 'anak' || (!L && r.p(0.35)), hidung: r.pick(['kecil', 'kecil', 'lebar']),
  };
  return { v, r, sex, age, skin, build, hairCol, hairStyle, face, hijab: null, head: null, acc: [], top: {}, bot: {}, feet: {} };
}

/* ================= wajah */
const F0 = '..............';
const EYES = {
  normal: ['..KKK....KKK..', '..WKK....KKW..'], bulat: ['..KKK....KKK..', '..KWK....KWK..'], sipit: [F0, '..KKK....KKK..'],
  sayu: ['...KK....KK...', '..KKK....KKK..'], tajam: ['.KKKK....KKKK.', '...WK....KW...'], kecil: [F0, '...KK....KK...'],
  besar: ['.KKKK....KKKK.', '.KWKK....KKWK.'], ramah: ['..KKK....KKK..', '.sWKK....KKWs.'], lelah: ['..sss....sss..', '..WKK....KKW..'],
};
const BROWS = { tipis: '..BBB....BBB..', tebal: '.BBBB....BBBB.', lurus: '.BBB......BBB.' };
const MOUTH = { datar: ['.....mmmm.....'], senyum: ['....m....m....', '.....mmmm.....'], kecil: ['......mm......'], lebar: ['....mmmmmm....'] };
export const EXPRS = ['biasa', 'kedip', 'marah', 'teriak', 'nyengir', 'ketawa', 'sakit'];
function faceMap(f, expr) {
  let brow = BROWS[f.brow] || BROWS.tipis, eyes = EYES[f.eyes] || EYES.normal, mouth = MOUTH[f.mouth] || MOUTH.datar;
  if (expr === 'kedip') eyes = [F0, '..KKK....KKK..'];
  if (expr === 'marah') { brow = '...BB....BB...'; mouth = ['....mmmmmm....', '...m......m...']; }
  if (expr === 'teriak') { eyes = ['..KKK....KKK..', '..KWK....KWK..']; mouth = ['....mTTTTm....', '....mttttm....', '.....mmmm.....']; }
  if (expr === 'nyengir') mouth = ['....mTTTTm....', '.....mmmm.....'];
  if (expr === 'ketawa') { eyes = ['..KK......KK..', '.K..K....K..K.']; mouth = ['....mTTTTm....', '.....mttm.....']; }
  if (expr === 'sakit') { brow = '..BB......BB..'; eyes = ['.KK........KK.', '...KK....KK...']; mouth = ['....mmmmmm....', '....TTTTTT....']; }
  const low = [];   // z5..z0 (6 baris): kumis tepat di bawah hidung, mulut di bawah kumis
  low.push(F0);
  if (f.kumis === 'tebal') low.push('....kkkkkk....', '...kkkkkkkk...');
  else if (f.kumis === 'tipis') low.push('.....kkkk.....');
  low.push(...mouth);
  while (low.length < 6) low.push(F0);
  if (f.jenggot) { low[4] = low[4] === F0 ? '....jjjjjj....' : low[4]; low[5] = '.....jjjj.....'; }
  if (f.blush) low[0] = '.r..........r.';
  return [F0, F0, F0, brow, F0, ...eyes, F0, F0, ...low.slice(0, 6)];
}

/* ================= kepala */
const SKULL = {
  oval: skullLayer,
  bulat: z => z <= 0 ? [-3, -5, 5, 4, 3] : z === 1 ? [-5, -6, 6, 5, 3] : z === 2 ? [-6, -7, 6, 6, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4],
  kotak: z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-5, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4],
};
const hairMat = d => 'spRmb_' + d.hairCol;
const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
function shellHair(v, h, c, zmin) { h.each((x, y, z) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); }); }
function hairOf(v, d) {
  const c = hairMat(d), st = d.hairStyle, h = new Vox();
  const capped = !!d.head && !['peci', 'baret', 'kupluk'].includes(d.head);
  if (st === 'plontos') { v.rrect(15, -6, -6, 5, 5, 'spKulit' + d.skin, 4); v.rrect(16, -4, -4, 3, 3, 'spKulit' + d.skin, 2); return; }
  if (st === 'botakTengah') {   // tapal kuda di samping & belakang
    v.rrect(15, -6, -6, 5, 5, 'spKulit' + d.skin, 4); v.rrect(16, -4, -4, 3, 3, 'spKulit' + d.skin, 2);
    for (let z = 5; z <= 12; z++) for (let x = -9; x <= 3; x++) for (let y = -9; y <= 8; y++) { if (v.has(x, y, z)) continue; const q = ((x + 0.5) / 8.6) ** 2 + ((y + 0.5) / 8.4) ** 2; if (q <= 1 && q > 0.7 && !(Math.abs(y + 0.5) > 6.5 && x >= -2 && z <= 8)) v.set(x, y, z, c); }
    return;
  }
  const L = d.sex === 'L', kid = d.age === 'anak';
  if (L || st === 'pendek') {
    const thick = st === 'ikal' ? 2 : st === 'belah' || st === 'poni' || st === 'gondrong' || st === 'jabrik' ? 1 : 0;
    for (let z = 6; z <= 15; z++) h.rrect(z, -8 - thick, -8 - thick, 7 + (thick > 1 ? 1 : 0), 7 + thick, c, z <= 11 ? 4 : 5);
    h.rrect(16, -6 - thick, -6 - thick, 5 + thick, 5 + thick, c, 4);
    if (thick) h.rrect(17, -5 - thick, -5 - thick, 3 + thick, 3 + thick, c, 3);
    if (st === 'ikal') h.rrect(18, -5, -5, 3, 4, c, 3);
    const side = st === 'cepakTipis' ? 11 : 9, back = st === 'cepakTipis' ? 9 : st === 'gondrong' ? 5 : 6;
    shellHair(v, h, c, (x, y) => x >= 5 ? (st === 'ikal' ? 12 : 14) : Math.abs(y + 0.5) > 6.5 && x >= -1 ? side : back);
    if (st === 'poni') for (let y = -6; y <= 5; y++) { const x = v.front(y, 13); if (x !== null && v.get(x, y, 13) === c) v.set(x + 1, y, 13, c); }
    if (st === 'belah') {   // belah samping: poni disapu ke kanan, garis belahan di kiri atas
      for (let y = -4; y <= 6; y++) for (const z of [13, 14]) { const x = v.front(y, z); if (x !== null && x < 9) v.set(x + 1, y, z, c); }
      for (let x = -3; x <= 6; x++) { const z = topZ(v, x, -4); if (z !== null && v.get(x, -4, z) === c) v.set(x, -4, z, c + 'T'); }
    }
    if (st === 'klimis') for (let y = -6; y <= 5; y += 3) for (let x = -8; x <= 7; x++) { const z = topZ(v, x, y); if (z !== null && z >= 12 && v.get(x, y, z) === c) v.set(x, y, z, d.hairCol === 'putih' ? 'spRmb_abu' : c + 'T'); }   // disisir ke belakang: garis sisir
    if (st === 'ikal') { const add = []; v.each((x, y, z, k) => { if (k === c && rnd(x, y, z) % 9 === 0) add.push([x, y, z]); }); for (const [x, y, z] of add) for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1]]) if (!v.has(x + dx, y + dy, z + dz) && z + dz >= 9) { v.set(x + dx, y + dy, z + dz, c); break; } }
    if (st === 'jabrik' && !capped) for (let x = -6; x <= 5; x += 3) for (let y = -6; y <= 5; y += 3) { const k = rnd(x, y, 3) % 3, zt = topZ(v, x, y); if (zt === null) continue; for (let z = zt + 1; z <= zt + 1 + k; z++) v.set(x, y, z, c); v.set(x + 1, y, zt + 1, c); }
    if (st === 'gondrong') for (let z = -2; z <= 7; z++) for (let y = -2 + (z < 2 ? 1 : 0); y <= 1 - (z < 2 ? 1 : 0); y++) for (const x of [-9, -10]) v.set(x, y, z, z === 6 ? 'spTali' : c);   // kuncir pendek di tengkuk
  } else {
    const tight = st === 'kuncir' || st === 'kepang' || st === 'sanggul', longSide = st === 'sebahu' || st === 'bob';
    if (tight) {   // rambut ditarik ke belakang: cangkang tipis, telinga kelihatan, belahan tengah
      for (let z = 4; z <= 15; z++) h.rrect(z, -8, -8, 7, 7, c, z <= 11 ? 4 : 5);
      h.rrect(16, -6, -6, 5, 5, c, 4); h.rrect(17, -4, -4, 3, 3, c, 3);
      shellHair(v, h, c, (x, y) => x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 4);
      for (let x = -2; x <= 7; x++) { const z = topZ(v, x, -1); if (z !== null && v.get(x, -1, z) === c) v.set(x, -1, z, c + 'T'); }
    } else {   // tergerai: cangkang tebal turun membingkai wajah
      for (let z = 2; z <= 15; z++) h.rrect(z, -9, -9, 7, 8, c, z <= 11 ? 4 : 5);
      h.rrect(16, -8, -8, 6, 7, c, 5); h.rrect(17, -6, -6, 4, 5, c, 4);
      shellHair(v, h, c, (x, y) => x >= 5 ? (Math.abs(y + 0.5) > 5.5 ? 2 : 13) : x >= 2 ? (Math.abs(y + 0.5) > 6.5 ? -3 : 0) : st === 'sebahu' ? -8 : 0);
    }
    if (st === 'bob' || (kid && !tight)) for (let y = -6; y <= 5; y++) for (const z of [12, 13]) { const x = v.front(y, z); if (x !== null && x <= 7) v.set(x + 1, y, z, c); }   // poni
    if (st === 'sebahu') for (let z = -8; z <= 2; z++) { const hw = 7; for (let y = -hw - 1; y <= hw; y++) for (let x = -9; x <= -5; x++) if (!v.has(x, y, z)) v.set(x, y, z, c); if (z >= -6) for (const ys of [-9, 8]) for (let x = -5; x <= 1; x++) if (!v.has(x, ys, z)) v.set(x, ys, z, c); }
    if (st === 'kuncir' || st === 'kepang') {   // ikat di belakang atas, ekor menjuntai ke punggung
      for (let y = -2; y <= 1; y++) for (let z = 11; z <= 13; z++) v.set(-10, y, z, 'spTali');
      const n = kid ? 12 : 16;
      for (let k = 0; k <= n; k++) { const z = 12 - k, x = -11 - Math.min(2, Math.floor(k / 4)), w = st === 'kepang' ? 1 : k < 4 ? 2 : 1; for (let y = -w - 1; y <= w; y++) for (let dx = 0; dx <= 2; dx++) v.set(x + dx, y, z, st === 'kepang' && (z % 3 === 0) ? c + 'T' : c); }
    }
    if (st === 'sanggul') for (let x = -14; x <= -7; x++) for (let y = -5; y <= 4; y++) for (let z = 8; z <= 16; z++) { const q = ((x + 10.5) / 3.6) ** 2 + ((y + 0.5) / 4.4) ** 2 + ((z - 12) / 3.6) ** 2; if (q <= 1 && !v.has(x, y, z)) v.set(x, y, z, q > 0.55 && (x + z) % 3 === 0 ? c + 'T' : c); }
    for (const [x, y, z] of [[6, -8, 11], [6, 7, 10]]) if (!v.has(x, y, z)) v.set(x, y, z, c);
    v.each((x, y, z, k) => { if (k === c && x <= -6 && (y === -3 || y === 2) && (z + 40) % 7 < 3) v.set(x, y, z, c + 'T'); });   // kilau
  }
}
export const cmat = n => 'spC_' + n;
export function topZ(v, x, y, hi = 40) { for (let z = hi; z >= -30; z--) if (v.has(x, y, z)) return z; return null; }
function hijabOf(v, d) {   // jilbab menutup rambut & leher, wajah terbuka (oval), ujung jatuh ke dada (bagian dada di chest)
  const c = 'spC_' + d.hijab, h = new Vox();
  const open = (y, z) => { const dy = (y + 0.5) / 6.4, dz = (z - 5.5) / 6.9; return dy * dy + dz * dz <= 1; };
  for (let z = 1; z <= 14; z++) h.rrect(z, -8, -8, 7, 7, c, z <= 11 ? 4 : 5);
  h.rrect(15, -7, -7, 6, 6, c, 4); h.rrect(16, -5, -5, 4, 4, c, 3);
  for (let z = -6; z <= 0; z++) h.rrect(z, -7, -8, 7, 7, c, 4);
  h.each((x, y, z, k) => { if (v.has(x, y, z)) return; if (x >= 3 && z >= 0 && open(y, z)) return; v.set(x, y, z, k); });
  for (let z = 0; z <= 13; z++) for (let y = -9; y <= 8; y++) { const x = v.front(y, z); if (x !== null && x >= 6 && v.get(x, y, z) === c && open(y + (y < 0 ? 1 : -1), z)) v.set(x, y, z, c + 'S'); }
  if (d.hijabPin) v.set(v.front(-6, 2) ?? 6, -6, 2, 'spEmas');
}
function capOf(v, d) {   // penutup kepala; rambut di bawahnya dibuang
  const t = d.head, c = 'spC_' + (d.headCol || 'hitam'), clear = z0 => v.each((x, y, z, k) => { if (k && k.startsWith('spRmb_') && z >= z0 && Math.hypot(x + 0.5, y + 0.5) < 9.5) v.set(x, y, z, null); });
  const dome = (z0, z1, rx, ry, mat, hollow = 0.6) => { for (let z = z0; z <= z1; z++) for (let x = -12; x <= 11; x++) for (let y = -12; y <= 11; y++) { const q = ((x + 0.5) / rx) ** 2 + ((y + 0.5) / ry) ** 2 + (Math.max(0, z - z0 - 2) / (z1 - z0 - 1)) ** 2; if (q <= 1 && (q > hollow || z >= z1 - 1)) v.set(x, y, z, typeof mat === 'function' ? mat(x, y, z) : mat); } };
  if (t === 'peci') { clear(12); for (let z = 12; z <= 17; z++) v.shell(z, -8, -8, 7, 7, 'spC_hitam', 3); v.rrect(17, -8, -8, 7, 7, 'spC_hitam', 3); return; }
  if (t === 'kupluk') { clear(11); dome(11, 20, 9, 8.8, (x, y, z) => z <= 12 ? c + 'S' : (x + y + 40) % 3 === 0 ? c + 'S' : c); return; }
  if (t === 'baret') {   // baret miring ke kiri, lencana di depan kanan
    clear(14); for (let z = 13; z <= 17; z++) for (let x = -10; x <= 9; x++) for (let y = -13; y <= 9; y++) { const q = ((x + 0.5) / 9.4) ** 2 + ((y + 2) / (z <= 14 ? 9 : 10.6)) ** 2; if (q <= 1 && (z >= 16 || q > 0.62 || z === 13)) v.set(x, y, z + (y < -6 ? -1 : 0), z === 13 ? c + 'S' : c); }
    v.box(8, 2, 14, 9, 3, 15, 'spEmas'); return;
  }
  if (t === 'topi') {   // topi pet menghadap depan
    clear(13); dome(13, 19, 8.8, 8.6, (x, y, z) => z === 13 ? c + 'S' : c);
    for (let x = 8; x <= 14; x++) for (let y = -7; y <= 6; y++) if (Math.abs(y + 0.5) <= 7 - Math.max(0, x - 11) * 1.4) v.set(x, y, 14, c + 'S');
    v.set(0, -1, 20, c + 'S'); return;
  }
  if (t === 'caping') {   // caping bambu kerucut lebar
    clear(13);
    for (let z = 13; z <= 22; z++) { const rr = 14.5 - (z - 13) * 1.55; if (rr < 1) break; for (let x = -15; x <= 14; x++) for (let y = -15; y <= 14; y++) { const q = Math.hypot(x + 0.5, y + 0.5); if (q <= rr && q > rr - 2.4) v.set(x, y, z, (Math.floor(Math.atan2(y + 0.5, x + 0.5) * 6) + z) % 2 ? 'spAnyam' : 'spAnyamS'); } }
    for (let z = 3; z <= 13; z++) for (const y of [-8, 7]) if (!v.has(1, y, z)) v.set(1, y, z, 'spTali');   // tali dagu
    return;
  }
  if (t === 'helmProyek' || t === 'helmTentara') {
    clear(12); const P = t === 'helmProyek';
    dome(12, 21, 9.6, 9.4, (x, y, z) => P ? (z === 12 ? c + 'S' : Math.abs(y + 0.5) < 1 && z >= 18 ? c + 'S' : c) : lorengAt(x, y, z));
    for (let x = -11; x <= (P ? 13 : 10); x++) for (let y = -11; y <= 10; y++) { const q = ((x + 0.5) / (P ? (x > 0 ? 13.4 : 10.8) : 10.6)) ** 2 + ((y + 0.5) / 10.6) ** 2; if (q <= 1 && !v.has(x, y, 12)) v.set(x, y, 12, P ? c + 'S' : 'spC_lorTua'); }
    if (!P) for (let z = 4; z <= 11; z++) for (const y of [-9, 8]) if (!v.has(0, y, z)) v.set(0, y, z, 'spTali');
    return;
  }
  if (t === 'helmMotor') {   // helm half-face, kaca dinaikkan di dahi, wajah tetap terlihat
    v.each((x, y, z, k) => { if (k && k.startsWith('spRmb_')) v.set(x, y, z, null); });
    const open = (y, z) => { const dy = (y + 0.5) / 6.6, dz = (z - 6) / 7.2; return dy * dy + dz * dz <= 1; };
    for (let z = 2; z <= 21; z++) for (let x = -11; x <= 10; x++) for (let y = -11; y <= 10; y++) {
      const q = ((x + 0.5) / 9.9) ** 2 + ((y + 0.5) / 9.7) ** 2 + (Math.max(0, z - 13) / 8.4) ** 2;
      if (q > 1 || (q < 0.62 && z < 20)) continue; if (x >= 2 && open(y, z) && z <= 12) continue; if (z <= 6 && x >= -3) continue;
      if (!v.has(x, y, z) || (v.get(x, y, z) || '').startsWith('spRmb_')) v.set(x, y, z, z === 2 || z === 7 && x < -3 ? c + 'S' : c);
    }
    for (let y = -6; y <= 5; y++) for (const z of [13, 14]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'spLayar'); }
    for (let z = 2; z <= 7; z++) for (const y of [-9, 8]) if (!v.has(2, y, z)) v.set(2, y, z, 'spTali');
    return;
  }
  if (t === 'ikatKepala') {   // ikat kepala/iket: pita melingkar di atas alis, simpul & dua ekor di belakang; rambut tetap
    const band = []; for (const z of [12, 13]) v.each((x, y, zz) => { if (zz !== z) return; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!v.has(x + dx, y + dy, z)) band.push([x + dx, y + dy, z]); });
    for (const [x, y, z] of band) v.set(x, y, z, d.headPat && (x + y + 40) % 3 === 0 ? 'spC_' + d.headPat : z === 12 ? c + 'S' : c);
    const xb = Math.min(...band.map(b => b[0])) - 1;
    v.box(xb, -2, 11, xb, 1, 14, c); for (let z = 5; z <= 11; z++) { v.set(xb - (z < 8 ? 1 : 0), -3 + (z < 8 ? 0 : 1), z, c + 'S'); v.set(xb, 1 + (z < 9 ? 1 : 0), z - 1, c); }
    if (d.headTulis) for (let y = -3; y <= 2; y++) if (y % 2 === 0) { const x = v.front(y, 13); if (x !== null) v.set(x, y, 13, 'spC_' + d.headTulis); }
    return;
  }
  if (t === 'koboi') {   // topi koboi anyaman: mahkota berlekuk, pita cokelat, pinggiran lebar melengkung naik di kiri-kanan
    clear(13);
    for (let z = 13; z <= 20; z++) for (let x = -14; x <= 13; x++) for (let y = -14; y <= 13; y++) {
      const brim = z === 13 || (z === 14 && Math.abs(y + 0.5) > 10.5), ay = Math.abs(y + 0.5), rr = brim ? 13.6 : 8.4 - Math.max(0, z - 18) * 1.4;
      const q = ((x + 0.5) / (brim ? 12.6 : rr)) ** 2 + ((y + 0.5) / rr) ** 2;
      if (q > 1) continue; if (!brim && q < 0.6 && z < 20) continue; if (brim && z === 13 && ay > 10.5) continue;
      if (z === 20 && ay < 1.5 && x > -5) continue;   // lekuk atas
      v.set(x, y, z, z === 14 && !brim ? 'spC_coklat' : (x + y + z + 60) % 3 === 0 ? 'spAnyamS' : 'spAnyam');
    }
    for (let x = -8; x <= 8; x++) for (let y = -8; y <= 8; y++) if (Math.hypot(x + 0.5, y + 0.5) < 7.6) v.set(x, y, 13, null);
    return;
  }
  if (t === 'topiKoki') {   // topi koki putih: pita tegak + puncak mengembang
    clear(12);
    for (let z = 12; z <= 24; z++) { const r = z <= 16 ? 8.6 : 8.6 + Math.min(1.6, (z - 16) * 0.6) - Math.max(0, z - 22) * 1.8; for (let x = -11; x <= 10; x++) for (let y = -11; y <= 10; y++) { const q = Math.hypot(x + 0.5, y + 0.5); if (q <= r && (q > r - 2 || z >= 23)) v.set(x, y, z, z <= 16 ? (z === 12 ? 'spC_putihS' : 'spC_putih') : (Math.floor(Math.atan2(y + 0.5, x + 0.5) * 2.6) + 9) % 2 ? 'spPutihP' : 'spC_putih'); } }
    return;
  }
  if (t === 'topiRimba') {
    clear(13);
    for (let z = 13; z <= 19; z++) for (let x = -12; x <= 11; x++) for (let y = -12; y <= 11; y++) { const brim = z === 13, rr = brim ? 11.6 : 8.8, q = ((x + 0.5) / rr) ** 2 + ((y + 0.5) / rr) ** 2 + (brim ? 0 : (Math.max(0, z - 16) / 3.4) ** 2); if (q <= 1 && (q > 0.6 || z >= 19 || brim)) v.set(x, y, z, z === 14 ? c + 'S' : c); }
    for (let x = -8; x <= 8; x++) for (let y = -8; y <= 8; y++) if (Math.hypot(x + 0.5, y + 0.5) < 8 && v.get(x, y, 13) === c) v.set(x, y, 13, null);
  }
}
const LOR = ['spC_lorDasar', 'spC_lorTua', 'spC_lorCoklat', 'spC_lorHitam'];
export function lorengAt(x, y, z) {   // loreng: bercak besar tidak beraturan (4 warna)
  const n = (a, b, c2) => Math.sin(a * 0.71 + b * 0.37 + c2 * 0.93) + Math.sin(a * 0.29 - c2 * 0.53 + b * 0.61) + Math.sin(b * 0.83 + c2 * 0.31 - a * 0.17);
  const q = n(x, y, z);
  return LOR[q > 1.2 ? 3 : q > 0.3 ? 2 : q < -0.9 ? 1 : 0];
}
function glassesOf(v, d) {
  const g = d.face.kacamata, k = g === 'emas' ? 'spEmas' : 'spKaca', fx = v.front(-1, 7) + 1;   // emas: bingkai emas bulat; tebal: lensa tebal tampak kebiruan
  for (const y0 of [-7, 1]) for (let y = y0; y <= y0 + 5; y++) for (let z = 6; z <= 9; z++) { const ey = y === y0 || y === y0 + 5, ez = z === 6 || z === 9; if ((ey && ez) || !(ey || ez)) { if (g === 'tebal' && !(ey && ez)) v.set(fx, y, z, 'spKacaL'); continue; } if (g === 'tipis' && ez && !ey && z === 6) continue; v.set(fx, y, z, k); }
  for (const y0 of [-7, 1]) v.set(fx, y0 + 4, 8, 'spKacaL');
  if (g === 'tebal') for (const y0 of [-7, 1]) { v.set(fx, y0 + 2, 7, 'spKaca'); v.set(fx, y0 + 3, 7, 'spKaca'); }
  v.set(fx, -1, 8, k); v.set(fx, 0, 8, k);
  for (const y of [-8, 7]) for (let x = fx; x >= -1; x--) if (!v.has(x, y, 8)) v.set(x, y, 8, k);
}
function head(d, expr) {
  const v = new Vox(), K = 'spKulit' + d.skin, sk = SKULL[d.face.skull] || skullLayer;
  for (let z = 0; z <= 14; z++) { const [a, b, c, e, r] = sk(z); v.rrect(z, a, b, c, e, K, r); }
  const FCH = { B: 'spAlis_' + d.hairCol, K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: K + 'S', r: 'spPipi' + d.skin, k: hairMat(d), j: hairMat(d) };
  if (d.hairCol === 'putih' || d.hairCol === 'abu') FCH.B = 'spAlis_abu';
  paintFace(v, faceMap(d.face, expr), FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, K); v.set(7, -1, 5, K + 'S');
  if (d.face.hidung === 'lebar') { v.box(7, -2, 5, 7, 1, 5, K); v.set(7, 1, 5, K + 'S'); }
  if (!d.hijab) for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, K); v.box(-1, y, 6, -1, y, 7, K + 'S'); }
  if (d.hijab) hijabOf(v, d); else hairOf(v, d);
  if (d.face.kacamata) glassesOf(v, d);
  if (d.masker) { for (let z = 1; z <= 5; z++) for (let y = -6; y <= 5; y++) { const x = v.front(y, z); if (x !== null && x >= 4) v.set(x + (z <= 4 && Math.abs(y + 0.5) < 3 ? 1 : 0), y, z, 'spC_' + d.masker); } for (const y of [-8, 7]) v.set(0, y, 6, 'spC_' + d.masker); }
  if (d.maskerDagu) { const c = 'spC_' + d.maskerDagu; for (let z = -1; z <= 1; z++) for (let y = -5; y <= 4; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === -1 ? c + 'S' : c); } for (const y of [-8, 7]) for (let z = 2; z <= 5; z++) if (!v.has(-1, y, z)) v.set(-1, y, z, c); }   // masker kain diturunkan ke dagu
  if (d.head) capOf(v, d);
  if (d.fx && d.fx.head) d.fx.head(v, d);
  if (d.age === 'anak' && d.sex === 'P' && !d.hijab && !d.head) for (const y of [-6, 5]) v.set(v.front(y, 13) + 1 || 6, y, 13, 'spC_' + (d.jepit || 'pink'));   // jepit rambut
  return v;
}

/* ================= pola kain */
const face1 = (v, x, y, z) => (v.front(y, z) === x || v.back(y, z) === x) ? y : x;
export function pattern(v, mat, pat, alt) {
  if (!pat || pat === 'polos') return v;
  const S = mat + 'S', A = alt ? 'spC_' + alt : S;
  v.each((x, y, z, k) => {
    if (k !== mat) return;
    const u = face1(v, x, y, z) + 40;
    if (pat === 'garis') { if (z % 4 < 2) v.set(x, y, z, A); }
    else if (pat === 'garisTipis') { if (z % 5 === 0) v.set(x, y, z, A); }
    else if (pat === 'kotak') { const a = u % 6 < 2, b = (z + 40) % 6 < 2; if (a && b) v.set(x, y, z, A); else if (a || b) v.set(x, y, z, S); }
    else if (pat === 'batik') { const q = ((u + z + 400) % 7); if (q === 0) v.set(x, y, z, A); else if (q === 1 || q === 6) v.set(x, y, z, S); else if (q === 3 && (u + 40) % 2 === 0) v.set(x, y, z, A); }   // parang: pita miring + titik
    else if (pat === 'bunga') { const gy = Math.floor(u / 4), gz = Math.floor((z + (gy % 2) * 3) / 6), cy = u % 4, cz = ((z + (gy % 2) * 3) % 6 + 6) % 6; if ((gy + gz) % 2 === 0 && cy >= 1 && cy <= 2 && cz >= 2 && cz <= 3) v.set(x, y, z, A); }
    else if (pat === 'loreng') v.set(x, y, z, lorengAt(x, y, z));
    else if (pat === 'lurik') { const q = (u + 400) % 5; if (q === 0) v.set(x, y, z, A); else if (q === 2) v.set(x, y, z, S); }   // lurik: garis tegak rapat
    else if (pat === 'kotor') { const h = rnd(Math.floor(x / 2), Math.floor(y / 2), Math.floor(z / 3)); if (h % 37 === 0) v.set(x, y, z, 'spOli'); else if (h % 13 === 0) v.set(x, y, z, S); }   // noda oli & kusam bergumpal, jarang
  });
  return v;
}

/* ================= geometri per rangka (angka dari tokoh bernama yang sudah lolos uji) */
const SK = {
  L: { kurus: { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 0.9 },
       sedang: { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 },
       gempal: { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 7, ballR: 1.05 } },
  P: { kurus: { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.88 },
       sedang: { ank: 4.5, shin: 12.5, thigh: 13, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 },
       gempal: { ank: 4.5, shin: 12, thigh: 12.5, up: 4, neck: 21, shY: 8.5, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.95 } },
  A: { ank: 3.5, shin: 8, thigh: 8.5, up: 3, neck: 16, shY: 6.5, shZ: 11, upper: 7, fore: 6.5, hipY: 3, flap: 4.5, ballR: 0.7 },
};
const TAIL = [-5, 0, 1];
// tubuh: z dada, lebar dada (x0,y0,x1,y1), lengan (y0,y1, z), tangan, pinggul, kaki
const GEO = {
  L: b => ({ cz: [34, 56], nk: [57, 60], ch: { kurus: [-4, -7, 3, 6], sedang: [-5, -8, 4, 7], gempal: [-6, -9, 4, 8] }[b], belly: b === 'gempal' ? 5 : 0,
    ay: { kurus: [8, 11], sedang: [8, 12], gempal: [8, 14] }[b], ax: [-3, b === 'gempal' ? 3 : 2], az: [43, 55], atop: 56, ss: 49, fz: [31, 42], hz: [27, 30], fist: 26,
    pel: [28, 33], pw: { kurus: [-5, -7, 4, 6], sedang: [-5, -8, 4, 7], gempal: [-6, -8, 5, 7] }[b], th: [18, 31], thTop: 32, ty: [2, 8], tx: [-4, 3], sn: [6, 18], snTop: 19, knee: 21 }),
  P: b => ({ cz: [32, 51], nk: [52, 55], ch: { kurus: [-4, -6, 4, 5], sedang: [-5, -7, 4, 6], gempal: [-6, -7, 5, 6] }[b], belly: b === 'gempal' ? 2 : 0,
    ay: { kurus: [6, 10], sedang: [6, 10], gempal: [6, 11] }[b], ax: [-2, b === 'gempal' ? 3 : 2], az: [40, 50], atop: 51, ss: 45, fz: [31, 39], hz: [27, 30], fist: 26,
    pel: [26, 33], pw: [-4, -6, 4, 5], th: [17, 31], thTop: 31, ty: [1, 7], tx: [-4, 3], sn: [5, 17], snTop: 17, knee: 19 }),
  A: () => ({ cz: [21, 35], nk: [36, 38], ch: [-3, -5, 3, 4], belly: 0, ay: [5, 8], ax: [-2, 1], az: [28, 34], atop: 35, ss: 31, fz: [21, 27], hz: [18, 20], fist: 17,
    pel: [15, 22], pw: [-3, -4, 3, 3], th: [12, 20], thTop: 20, ty: [1, 4], tx: [-2, 2], sn: [4, 12], snTop: 12, knee: 14 }),
};

/* ================= badan */
const cm = n => 'spC_' + n;
function chest(d, G) {
  const v = new Vox(), T = d.top, c = cm(T.c || 'putih'), K = 'spKulit' + d.skin, [z0, z1] = G.cz, [x0, y0, x1, y1] = G.ch;
  const kid = d.age === 'anak', fem = d.sex === 'P' && !kid, hunch = d.age === 'lansia' && d.sex === 'L' && !d.tegak;
  for (let z = z0; z <= z1; z++) {
    const t = z === z1 ? 1 : 0, bel = G.belly ? Math.max(0, Math.round(G.belly * Math.sin((z - z0 + 3) / (z1 - z0 - 2) * Math.PI))) * (z < z1 - 6 ? 1 : 0) : 0;
    const w = fem && z >= z0 + 5 && z <= z0 + 9 ? 1 : 0, hp = hunch && z >= z1 - 10 ? Math.min(2, Math.floor((z - z1 + 12) / 4)) : 0;
    v.rrect(z, x0 - hp, y0 + t + w, x1 + bel - t, y1 - t - w, c, kid ? 3 : z >= z1 - 1 ? 4 : 3);
  }
  const [n0, n1] = G.nk; v.rbox(kid ? -2 : -3 + (fem ? 1 : 0), kid ? -2 : -3 + (fem ? 1 : 0), n0, kid ? 1 : 2, kid ? 1 : 2 - (fem ? 1 : 0), n1, K, kid ? 1 : 2);
  const k = T.kind || 'kaus', cS = c + 'S', a2 = T.c2 ? cm(T.c2) : cS, nz = z1, mid = (y0 + y1) / 2;
  const collar = (w, h = 2, col = c) => { for (let z = nz + 1; z <= nz + h; z++) v.shell(z, -w, -w, w - 1, w - 1, col, 2); };
  if (k === 'kaus' || k === 'olahraga' || k === 'kausKaki') { for (let y = -2; y <= 1; y++) v.pf(y, nz, K); collar(kid ? 3 : 4, 1, T.lis ? cm(T.lis) : c); }
  if (k === 'singlet') {
    for (let z = nz - 7; z <= nz; z++) for (let y = y0; y <= y1; y++) { const ay = Math.abs(y + 0.5); if (ay < 2.5 || ay > 5.5) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, K); const xb = v.back(y, z); if (xb !== null && ay > 5.5) v.set(xb, y, z, K); } }
    v.each((x, y, z, kk) => { if (kk === c && z >= nz - 6 && Math.abs(y + 0.5) > 6.5) v.set(x, y, z, K); });
  }
  if (k === 'kemeja' || k === 'seragam' || k === 'loreng' || k === 'kerja' || k === 'polo' || k === 'pns') {
    collar(kid ? 3 : 4, 2); for (let y = -1; y <= 0; y++) for (const z of [nz, nz - 1]) v.pf(y, z, K);
    if (k !== 'polo') for (let z = z0 + 1; z <= nz - 2; z++) v.pf(-1, z, cS); else for (let z = nz - 5; z <= nz - 1; z++) v.pf(-1, z, cS);
    for (let z = k === 'polo' ? nz - 5 : z0 + 3; z <= nz - 3; z += k === 'polo' ? 2 : 4) v.pf(0, z, k === 'loreng' ? 'spC_lorHitam' : 'spKancing');
    if (k !== 'polo' && !kid) { const pz = nz - 9; v.pfBox(y1 - 5, pz - 3, y1 - 2, pz, cS); v.pfBox(y1 - 5, pz, y1 - 2, pz, c); if (k === 'loreng' || k === 'kerja' || k === 'pns') { v.pfBox(y0 + 2, pz - 3, y0 + 5, pz, cS); v.pfBox(y0 + 2, pz, y0 + 5, pz, c); } }
  }
  if (k === 'koko') { collar(kid ? 3 : 4, 2); for (let z = nz - 10; z <= nz; z++) v.pf(-1, z, cS); for (const z of [nz - 8, nz - 5, nz - 2]) v.pf(0, z, cS); for (let z = nz - 10; z <= nz - 2; z++) for (const y of [-4, 3]) if (z % 2 === 0) v.pf(y, z, cS); }
  if (k === 'jaket' || k === 'hoodie') {   // jaket/hoodie terbuka di atas kaus c2
    for (let z = z0 + 1; z <= nz; z++) for (let y = -2; y <= 1; y++) v.pf(y, z, a2);
    for (let z = z0 + 1; z <= nz; z++) { v.pf(-3, z, cS); v.pf(2, z, cS); }
    if (k === 'hoodie') for (let z = nz - 3; z <= nz + 3; z++) for (let y = -6; y <= 5; y++) { const xb = v.back(y, Math.min(z, nz)); if (xb !== null && Math.abs(y + 0.5) < 6.5 - Math.max(0, z - nz)) v.set(xb - 1 - (z > nz ? 1 : 0), y, z, c); }
    else collar(4, 2);
    if (T.tali) for (const y of [-2, 1]) for (let z = nz - 6; z <= nz - 1; z++) v.pf(y, z, 'spPutihP');
  }
  if (k === 'blus' || k === 'daster' || k === 'gamis') { for (let y = -2; y <= 1; y++) { v.pf(y, nz, K); if (k !== 'gamis') v.pf(y, nz - 1, K); } for (let y = -3; y <= 2; y++) v.pf(y, nz - (k === 'gamis' ? 1 : 2), cS); }
  if (k === 'pangsi') {   // pangsi: kerah V tanpa kancing, lipatan silang ke kiri
    for (let z = nz - 3; z <= nz; z++) { const w = Math.floor((z - nz + 4) / 2); for (let y = -w - 1; y <= w; y++) v.pf(y, z, K); }
    for (let z = z0 + 1; z <= nz - 4; z++) v.pf(-1 - Math.floor((nz - 4 - z) / 3), z, cS);
  }
  if (T.nomor != null) { const DG = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001001001001', '111101111101111', '111101111001111'];
    const ds = String(T.nomor).split('').map(Number), zt = nz - 6; ds.forEach((dg, i) => { const yo = ds.length === 1 ? -2 : i === 0 ? 0 : -4; for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) if (DG[dg][r * 3 + q] === '1') v.pb(yo + 2 - q, zt - r * 2, cm(T.lis || 'putih')), v.pb(yo + 2 - q, zt - r * 2 - 1, cm(T.lis || 'putih')); }); }
  if (T.logo) for (let z = nz - 8; z <= nz - 6; z++) for (let y = y1 - 5; y <= y1 - 3; y++) v.pf(y, z, cm(T.logo));
  if (T.badge) v.pfBox(y1 - 4, nz - 9, y1 - 2, nz - 8, 'spEmas');
  if (T.rompi) { for (let z = z0; z <= nz - 1; z++) for (let y = y0; y <= y1; y++) { const ay = Math.abs(y + 0.5); if (ay < 2.5 && z > nz - 7) continue; const x = v.front(y, z), xb = v.back(y, z); if (x !== null) v.set(x + 1, y, z, cm(T.rompi)); if (xb !== null) v.set(xb - 1, y, z, cm(T.rompi)); } }
  if (T.stripe) for (const z of [z0 + 8, z0 + 10]) for (let y = y0; y <= y1; y++) { v.pf(y, z, cm(T.stripe)); v.pb(y, z, cm(T.stripe)); }   // garis pantul (rompi)
  pattern(v, c, T.pat, T.pc);
  // jilbab menjuntai menutup bahu & dada atas
  if (d.hijab) { const j = cm(d.hijab), jz = fem ? [46, 54] : kid ? [30, 36] : [50, 58]; for (let z = jz[0]; z <= jz[1]; z++) { const kk = Math.min(1, Math.floor((jz[1] + 1 - z) / 4)); for (let y = y0 - 1 - kk; y <= y1 + 1 + kk; y++) for (let x = x0 - 1 - kk; x <= x1 + 1 + kk; x++) { if (z <= jz[0] + 3 && x < 1 && Math.abs(y + 0.5) < (y1 - y0) / 2) continue; if (!v.has(x, y, z) || (z >= jz[0] + 2 && Math.abs(y + 0.5) < (y1 - y0) / 2 + 1.5 && (x === v.front(y, z) || x === v.back(y, z)))) v.set(x, y, z, j); } } for (let y = y0 - 1; y <= y1 + 1; y++) { const x = v.front(y, jz[0]); if (x !== null && v.get(x, y, jz[0]) === j) v.set(x, y, jz[0], j + 'S'); } }
  accChest(v, d, G);
  if (d.fx && d.fx.chest) d.fx.chest(v, d, G);
  return v;
}
function accChest(v, d, G) {
  const [z0, z1] = G.cz, [x0, y0, x1, y1] = G.ch, A = d.acc;
  if (A.includes('ransel') || A.includes('carrier')) {   // ransel di punggung + tali bahu
    const big = A.includes('carrier'), c = cm(d.accCol || 'hitam'), h = big ? 26 : 14, zt = z1 - 2 + (big ? 6 : 0), xb = x0 - 1;
    for (let z = zt - h; z <= zt; z++) for (let x = xb - (big ? 8 : 5); x <= xb; x++) for (let y = y0 + 1; y <= y1 - 1; y++) { const e = (x === xb - (big ? 8 : 5) || y === y0 + 1 || y === y1 - 1) && (z === zt || z === zt - h); if (!e) v.set(x, y, z, (z === zt - Math.floor(h / 2) || (big && z === zt - 4)) ? c + 'S' : c); }
    for (const y of d.age === 'anak' ? [y0, y1] : [y0 + 2, y1 - 3]) for (let z = z1 - 9; z <= z1; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'spTali'); }
    if (big) for (let x = xb - 7; x <= xb - 1; x++) for (let y = y0 - 2; y <= y1 + 2; y++) for (const z of [zt - h - 1, zt - h - 2]) v.set(x, y, z, cm('biru'));   // matras
  }
  if (A.includes('celemek')) {   // celemek: panel depan + tali leher
    const c = cm(d.apronCol || 'putih');
    for (let z = z0; z <= z1 - 7; z++) for (let y = y0 + 1; y <= y1 - 1; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === z1 - 7 ? c + 'S' : c); }
    for (const y of [y0 + 2, y1 - 2]) for (let z = z1 - 6; z <= z1 + 1; z++) { const x = v.front(y, Math.min(z, z1)); if (x !== null) v.set(x + 1, y, z, c + 'S'); }
    if (d.apronPocket) v.pfBox(-3, z0 + 3, 2, z0 + 5, c + 'S');
    if (d.apronPat) pattern(v, c, d.apronPat, d.apronPc);
  }
  if (A.includes('boks')) {   // boks makanan ojol di punggung
    const c = cm(d.accCol || 'hijauOjol'), xb = x0 - 1;
    for (let z = z0 + 2; z <= z1 + 4; z++) for (let x = xb - 12; x <= xb; x++) for (let y = y0 - 1; y <= y1 + 1; y++) v.set(x, y, z, (z === z1 + 4 || x === xb - 12) && (y + z) % 5 === 0 ? c + 'S' : c);
    v.box(xb - 13, -3, z0 + 10, xb - 13, 2, z0 + 13, 'spPutihP');
    for (const y of [y0 + 2, y1 - 3]) for (let z = z1 - 9; z <= z1; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'spTali'); }
  }
  if (A.includes('keranjangPunggung')) {
    for (let z = z0 - 2; z <= z1 + 2; z++) { const rr = 5 + (z - z0) * 0.12; for (let x = x0 - 13; x <= x0 - 1; x++) for (let y = y0; y <= y1; y++) { const q = ((x - x0 + 7) / rr) ** 2 + ((y + 0.5) / (rr + 2)) ** 2; if (q <= 1 && (q > 0.55 || z === z0 - 2)) v.set(x, y, z, (x + y + z) % 3 === 0 ? 'spAnyamS' : 'spAnyam'); } }
    for (let x = x0 - 11; x <= x0 - 3; x++) for (let y = y0 + 2; y <= y1 - 2; y++) if (!v.has(x, y, z1 + 2)) v.set(x, y, z1 + 1, 'spIsi');   // pucuk teh
    for (const y of [y0 + 2, y1 - 3]) for (let z = z0 + 6; z <= z1; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'spAnyamS'); }
  }
  if (A.includes('selempang')) for (let z = z0; z <= z1; z++) { const yc = Math.round(y1 - 1 - (z1 - z) * (y1 - y0 - 2) / (z1 - z0)); for (const y of [yc, yc + 1]) { if (y < y0 || y > y1) continue; const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'spTali'); const xb = v.back(y, z); if (xb !== null) v.set(xb - 1, y, z, 'spTali'); } }
  if (A.includes('handuk')) for (let z = z0 + 6; z <= z1 + 1; z++) for (const y of [-4, -3, 2, 3]) { const x = v.front(y, Math.min(z, z1)); if (x !== null) v.set(x + 1, y, z, z % 4 === 0 ? 'spMerahP' : 'spPutihP'); }
  if (A.includes('idcard')) { for (let z = z1 - 10; z <= z1; z++) { const yy = Math.round((z1 - z) * 0.3); for (const y of [-2 - yy, 1 + yy]) if (z > z1 - 8) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, cm(d.idCol || 'biru')); } } v.pfBox(-2, z1 - 13, 1, z1 - 9, 'spPutihP'); v.pfBox(-1, z1 - 11, 0, z1 - 10, 'spLayar'); }
  if (A.includes('kamera')) { for (let z = z1 - 9; z <= z1; z++) for (const y of [y0 + 2, y1 - 3]) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'spTali'); } const x = v.front(0, z1 - 11); v.box(x + 1, -3, z1 - 13, x + 3, 2, z1 - 9, 'spHP'); v.box(x + 4, -1, z1 - 12, x + 5, 0, z1 - 10, 'spBesi'); }
  if (A.includes('kacu')) { const nz = z1; for (let z = nz - 1; z <= nz + 1; z++) v.shell(z, x0 + 1, -4, x1, 3, z === nz ? 'spPutihP' : 'spMerahP', 2); for (let z = nz - 6; z <= nz - 2; z++) for (const y of [-1, 0]) v.pf(y, z, z === nz - 4 ? 'spC_coklat' : z % 2 ? 'spMerahP' : 'spPutihP'); for (let z = nz - 8; z <= nz - 1; z++) { const w = Math.floor((z - nz + 9) / 2); for (let y = -w; y <= w - 1; y++) v.pb(y, z, z % 2 ? 'spMerahP' : 'spPutihP'); } }
  if (A.includes('syal')) {   // syal suporter: lingkar leher + dua ujung menjuntai di dada, belang warna tim, rumbai putih
    const a = cm(d.syalCol || 'biru'), b = cm(d.syalCol2 || 'putih'), nz = z1;
    for (let z = nz - 1; z <= nz + 2; z++) v.shell(z, x0, -5, x1 + 1, 4, z % 2 ? a : b, 2);
    for (const [ya, yb, len] of [[-4, -2, 14], [1, 3, 11]]) for (let z = nz - len; z <= nz; z++) for (let y = ya; y <= yb; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === nz - len ? 'spPutihP' : Math.floor((z + 40) / 3) % 2 ? a : b); }
  }
  if (A.includes('gendong')) {   // selendang gendong: kain miring bahu kanan -> pinggang kiri, buntelan di punggung berisi botol jamu
    const c = cm(d.gendongCol || 'merah');
    for (let z = z0; z <= z1; z++) { const yc = Math.round(y0 + 1 + (z1 - z) * (y1 - y0 - 2) / (z1 - z0)); for (let y = yc - 1; y <= yc + 1; y++) { if (y < y0 || y > y1) continue; const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, (z + y) % 4 ? c : c + 'S'); const xb = v.back(y, z); if (xb !== null) v.set(xb - 1, y, z, c); } }
    const xb = x0 - 1, yb0 = y0 + 1, yb1 = y1 - 1, zb0 = z0 - 4, zb1 = z0 + 13;
    for (let z = zb0; z <= zb1; z++) for (let x = xb - 8; x <= xb; x++) for (let y = yb0; y <= yb1; y++) { const q = ((x - xb + 4) / 4.6) ** 2 + ((y - (yb0 + yb1) / 2) / ((yb1 - yb0) / 2 + 0.6)) ** 2; if (q <= 1 && (q > 0.5 || z === zb0)) v.set(x, y, z, z === zb0 + 3 || z === zb1 - 1 ? c + 'S' : c); }
    const BT = ['spJamu', 'spC_hijau', 'spJamu', 'spC_coklatMuda', 'spC_kuning', 'spJamu'];
    let i = 0; for (let x = xb - 6; x <= xb - 2; x += 2) for (let y = yb0 + 1; y <= yb1 - 1; y += 3) { const m = BT[i++ % BT.length]; for (let z = zb1 - 2; z <= zb1 + 5; z++) { v.set(x, y, z, m); v.set(x, y + 1, z, m); } v.set(x, y, zb1 + 6, 'spKayu'); }
  }
  if (A.includes('radio')) {   // radio genggam dijepit di dada kiri, antena ke atas
    const yr = y1 - 5, zr = z1 - 13, x = Math.max(...[yr, yr + 3].map(y => v.front(y, zr + 3) ?? x1)) + 1;
    v.box(x, yr, zr, x + 1, yr + 3, zr + 7, 'spHP'); v.box(x + 2, yr + 1, zr + 4, x + 2, yr + 2, zr + 6, 'spLayar'); v.set(x + 2, yr + 1, zr + 2, 'spMerahP');
    for (let z = zr + 8; z <= zr + 12; z++) v.set(x, yr + 3, z, 'spHP');
  }
  if (A.includes('peluit')) { for (let z = z1 - 9; z <= z1; z++) { const yy = Math.round((z1 - z) * 0.3); for (const y of [-2 - yy, 1 + yy]) if (z > z1 - 8) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'spMerahP'); } } v.pfBox(-1, z1 - 11, 0, z1 - 10, 'spPerak'); }
}
function pelvis(d, G) {
  const B = d.bot, c = cm(B.c || 'hitam'), k = B.kind || 'celana', T = d.top, tc = cm(T.c || 'putih'), [p0, p1] = G.pel, kid = d.age === 'anak';
  if (k === 'rok' || k === 'sarung' || k === 'daster') {
    let v;
    if (kid) { v = new Vox(); v.rbox(-3, -4, 16, 3, 3, 22, c, 2); for (let z = 13; z <= 22; z++) { const f = z <= 16 ? 1 : 0; v.shell(z, -4 - f, -5 - f, 4 + f, 4 + f, c, 3); } }
    else if (d.sex === 'L') { v = skirtPelvis(c, c + 'S', 22); for (let z = 31; z <= 33; z++) v.shell(z, -6, -9, 5, 8, c, 3); v.rbox(2, -3, 30, 6, 2, 33, c, 2); }
    else v = skirtPelvis(c, c + 'S', 20);
    pattern(v, c, B.pat, B.pc);
    if (!T.tuck && d.sex === 'L' && !kid) for (let z = 31; z <= 34; z++) v.shell(z, -6, -9, 5, 8, z === 31 ? tc + 'S' : tc, 3);
    accPelvis(v, d, G); return v;
  }
  const v = new Vox(), [x0, y0, x1, y1] = G.pw;
  if (kid) { v.rbox(-3, -4, 16, 3, 3, 22, c, 2); for (let z = 15; z <= 22; z++) v.shell(z, -4, -5, 4, 4, c, 3); }
  else { v.rbox(x0, y0, p0, x1, y1, p1, c, 3); v.box(-3, -2, p0 - 2, 2, 1, p0 - 1, c); }
  if (B.belt && !kid) for (let z = p1 - 1; z <= p1; z++) v.shell(z, x0 - 1, y0 - 1, x1 + 1, y1 + 1, 'belt', 3);
  if (!T.tuck) { const zz = kid ? [21, 24] : [p1 - 2, p1 + 1], g = d.build === 'gempal' && d.sex === 'L' ? 1 : 0; for (let z = zz[0]; z <= zz[1]; z++) v.shell(z, x0 - 1, y0 - 1, x1 + 1 + g * (z - zz[0]), y1 + 1, z === zz[0] ? tc + 'S' : tc, 3); pattern(v, tc, T.pat, T.pc); }
  pattern(v, c, B.pat, B.pc);
  accPelvis(v, d, G); return v;
}
function accPelvis(v, d, G) {
  if (d.acc.includes('celemek')) { const c = cm(d.apronCol || 'putih'), [p0, p1] = G.pel; for (let z = p0 - 2; z <= p1; z++) for (let y = G.pw[1] + 1; y <= G.pw[3] - 1; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === p0 - 2 ? c + 'S' : c); } if (d.apronPat) pattern(v, c, d.apronPat, d.apronPc); }
  if (d.acc.includes('ht')) { const [p0] = G.pel, y = G.pw[3] + 1; v.rbox(-1, y, p0 + 1, 2, y + 1, p0 + 6, 'spHP', 0); for (let z = p0 + 7; z <= p0 + 10; z++) v.set(1, y + 1, z, 'spHP'); }
  if (d.acc.includes('selempang')) { const [p0, p1] = G.pel, y = G.pw[1] - 2; v.rbox(-3, y - 2, p0, 3, y, p0 + 6, cm(d.accCol || 'coklat'), 1); v.set(3, y - 1, p0 + 4, 'spEmas'); }
  if (d.acc.includes('sabuk')) {   // sabuk silat: lilitan + simpul di kiri depan, dua ujung menjuntai
    const [, p1] = G.pel, c = cm(d.sabukCol || 'putih'), [x0, y0, x1, y1] = G.pw, kid = d.age === 'anak';
    for (let z = p1 - 2; z <= p1; z++) v.shell(z, x0 - 1, y0 - 1, x1 + 1, y1 + 1, z === p1 - 2 ? c + 'S' : c, 3);
    const yk = y0 + 1, xk = x1 + 2; v.box(xk, yk, p1 - 2, xk, yk + 1, p1, c);
    for (let z = p1 - (kid ? 7 : 10); z <= p1 - 3; z++) { v.set(xk, yk - 1 + (z % 4 === 0 ? 0 : 0), z, c); v.set(xk, yk + 2, z + 1, c + 'S'); }
  }
  if (d.acc.includes('pinggang')) { const [, p1] = G.pel; for (let z = p1 - 3; z <= p1 - 1; z++) v.shell(z, G.pw[0] - 2, G.pw[1] - 2, G.pw[2] + 2, G.pw[3] + 2, cm(d.accCol || 'hitam'), 3); }
}
function sleeveCol(d) { return d.top.kind === 'singlet' ? null : cm(d.top.c || 'putih'); }
function arm(d, G) {
  const v = new Vox(), K = 'spKulit' + d.skin, c = sleeveCol(d), [a0, a1] = G.ay, [x0, x1] = G.ax, sl = d.top.sleeve || 'pendek';
  v.rbox(x0, a0, G.az[0], x1, a1, G.az[1], c && sl === 'panjang' ? c : K, 2); v.rrect(G.atop, x0, a0, x1, a1, c || K, 3);
  if (c && sl === 'pendek') { v.paint(x0, a0, G.ss, x1, a1, G.atop, c); v.shell(G.ss, x0 - 1, a0 - 1, x1 + 1, a1 + 1, d.top.lis ? cm(d.top.lis) : c, 2); }
  if (c && sl !== 'tanpa') pattern(v, c, d.top.pat, d.top.pc);
  if (d.top.kind === 'jaket' || d.top.kind === 'hoodie') v.paint(x0, a0, G.az[0], x1, a1, G.atop, c);
  if (d.top.badgeArm) v.psBox(1, -1, G.atop - 6, 1, G.atop - 4, cm(d.top.badgeArm));
  if (d.top.rompi) v.paint(x0, a0, G.atop, x1, a1, G.atop, c);
  return v;
}
function fore(d, G, side) {
  const v = new Vox(), K = 'spKulit' + d.skin, c = sleeveCol(d), [a0, a1] = G.ay, [x0, x1] = G.ax, sl = d.top.sleeve || 'pendek';
  const long = c && (sl === 'panjang' || d.top.kind === 'jaket' || d.top.kind === 'hoodie') && !d.top.gulung;
  v.rbox(x0, a0, G.fz[0], x1, a1, G.fz[1], long ? c : K, 2);
  if (long) { v.shell(G.fz[0], x0 - 1, a0 - 1, x1 + 1, a1 + 1, c + 'S', 2); pattern(v, c, d.top.pat, d.top.pc); }
  v.rbox(x0, a0, G.hz[0], x1 + 1, a1 - (d.age === 'anak' ? 0 : a1 - a0 > 4 ? 1 : 0), G.hz[1], K, 2); v.rrect(G.fist, x0 + 1, a0 + 1, x1, a1 - 1, K, 1);
  if (d.top.jam && side < 0) v.paint(x0, a0, G.fz[0] + 1, x1, a1, G.fz[0] + 2, 'spHP');
  const p = side > 0 ? d.handR : d.handL;
  if (p) {   // barang pegangan digambar di salinan, selisihnya jadi bagian terpisah (propR / propL)
    const w = new Vox().add(v); prop(w, d, G, p);
    const held = new Vox(); w.each((x, y, z, c) => { if (v.get(x, y, z) !== c) held.set(x, y, z, c); });
    if (held.m.size) v.held = held;
  }
  if (d.fx && d.fx.fore) d.fx.fore(v, d, G, side);
  return v;
}
function prop(v, d, G, p) {
  const hy = Math.round((G.ay[0] + G.ay[1]) / 2), hz = G.fist, kid = d.age === 'anak', s = kid ? 0.6 : 1;
  const col = cm(d.propCol || 'merah');
  if (p === 'hp') { v.box(2, hy - 1, hz + 1, 4, hy, hz + 5, 'spHP'); v.box(4, hy - 1, hz + 2, 4, hy, hz + 4, 'spLayar'); }
  if (p === 'kresek' || p === 'kresekH' || p === 'kresekM') {
    const m = p === 'kresek' ? 'spKresekP' : p === 'kresekH' ? 'spKresekH' : 'spKresekM';
    for (const y of [hy - 1, hy + 1]) v.set(1, y, hz - 1, m);
    for (let z = hz - Math.round(12 * s); z <= hz - 2; z++) { const w = z <= hz - 9 * s ? 3 : 2; for (let x = -w; x <= w; x++) for (let y = hy - 2; y <= hy + 2; y++) if (Math.abs(x) === w || y === hy - 2 || y === hy + 2 || z === hz - Math.round(12 * s)) v.set(x, y, z, m); }
    v.set(0, hy, hz - 2, 'spIsi');
  }
  if (p === 'tasTangan') { for (let x = -1; x <= 2; x++) v.set(x, hy, hz - 1, cm(d.propCol || 'coklat') + 'S'); v.rbox(-3, hy - 1, hz - 9, 4, hy + 1, hz - 3, cm(d.propCol || 'coklat'), 1); v.set(4, hy, hz - 4, 'spEmas'); }
  if (p === 'payung') { for (let z = hz - 18; z <= hz + 3; z++) v.set(1, hy, z, z > hz ? 'spKayu' : 'spBesi'); for (let z = hz - 15; z <= hz - 4; z++) { const w = z < hz - 12 ? 0 : 1; for (let x = 1 - w; x <= 1 + w; x++) for (let y = hy - w; y <= hy + w; y++) v.set(x, y, z, col); } }
  if (p === 'tongkat') { for (let z = 1; z <= hz + 2; z++) v.set(3, hy, z, 'spKayu'); v.set(2, hy, hz + 2, 'spKayu'); v.set(1, hy, hz + 2, 'spKayu'); }
  if (p === 'cangkul') { for (let z = 6; z <= hz + 16; z++) v.set(1, hy, z, 'spKayu'); for (let z = 0; z <= 6; z++) for (let x = 1; x <= 6; x++) for (let y = hy - 2; y <= hy + 2; y++) if (x === 1 + Math.floor((6 - z) / 2) || (z === 6 && x <= 3)) v.set(x, y, z, 'spBesi'); }
  if (p === 'arit') { for (let z = hz - 5; z <= hz; z++) v.set(1, hy, z, 'spKayu'); for (const [x, z] of [[2, hz - 6], [3, hz - 7], [4, hz - 7], [5, hz - 6], [6, hz - 5], [6, hz - 4]]) v.set(x, hy, z, 'spBesi'); }
  if (p === 'map' || p === 'buku') { v.box(-4, hy + (a1(G) - hy) + 1, hz - 2, 4, hy + (a1(G) - hy) + 2, hz + 9, cm(d.propCol || 'biru')); }
  if (p === 'rantang') { for (let z = hz - 14; z <= hz - 2; z++) { const lvl = Math.floor((hz - 2 - z) / 4); v.shell(z, -3, hy - 3, 2, hy + 2, z % 4 === 0 ? 'spPerak' : cm(['merah', 'hijau', 'kuning'][lvl % 3]), 2); } for (let z = hz - 2; z <= hz; z++) v.set(0, hy, z, 'spPerak'); }
  if (p === 'senapan') { for (let z = hz - 14; z <= hz + 24; z++) v.set(2, hy, z, z < hz - 4 ? 'spKayu' : 'spKaret'); for (let z = hz - 14; z <= hz - 6; z++) v.set(3, hy, z, 'spKayu'); v.set(3, hy, hz + 8, 'spKaret'); v.set(3, hy, hz + 9, 'spKaret'); }
  if (p === 'bola') { for (let x = -4; x <= 4; x++) for (let y = hy - 4; y <= hy + 4; y++) for (let z = hz - 9; z <= hz - 1; z++) { const q = Math.hypot(x, y - hy, z - hz + 5); if (q <= 4.2) v.set(x + 1, y + 1, z, (x + y + z) % 5 === 0 ? 'spC_hitam' : 'spPutihP'); } }
  if (p === 'layangan') { const y = hy + 4; for (let x = -7; x <= 7; x++) for (let z = 6; z <= 22; z++) { const q = Math.abs(x) / 7.5 + Math.abs(z - 14) / 8.5; if (q <= 1) v.set(x, y, z, x === 0 || z === 16 ? 'spKayu' : (z >= 14) === (x > 0) ? col : cm(d.propCol2 || 'kuning')); } for (let z = 1; z <= 5; z++) v.set(Math.round(Math.sin(z * 0.9)), y, z, col); }
  if (p === 'botol') { v.rbox(-1, hy - 1, hz - 8, 1, hy + 1, hz, 'spLayar', 1); v.box(0, hy, hz + 1, 0, hy, hz + 1, 'spPutihP'); }
  if (p === 'kardus') { v.rbox(1, hy - 3, hz - 10, 7, hy + 3, hz - 1, 'spAnyam', 0); for (let y = hy - 3; y <= hy + 3; y++) v.set(7, y, hz - 5, 'spAnyamS'); }
  if (p === 'sapu') { for (let z = 6; z <= hz + 14; z++) v.set(1, hy, z, 'spKayu'); for (let z = 0; z <= 6; z++) for (let x = -1; x <= 3; x++) for (let y = hy - 2; y <= hy + 2; y++) if ((x + y + z) % 2 === 0 || z >= 5) v.set(x, y, z, 'spAnyam'); }
  if (p === 'ht') { v.box(2, hy - 1, hz + 1, 3, hy, hz + 6, 'spHP'); for (let z = hz + 7; z <= hz + 11; z++) v.set(2, hy, z, 'spHP'); v.set(4, hy, hz + 4, 'spLayar'); }
  if (p === 'senter') { v.rbox(0, hy - 1, hz + 1, 6, hy, hz + 2, 'spHP', 0); v.box(7, hy - 1, hz + 1, 7, hy, hz + 2, 'spKresekP'); }
  if (p === 'tongkatLL') { for (let x = 1; x <= 14; x++) v.box(x, hy, hz + 1, x, hy, hz + 2, x < 3 ? 'spHP' : (x >> 1) % 2 ? 'spMerahLL' : 'spPutihP'); }
  if (p === 'sekop') { for (let z = 7; z <= hz + 12; z++) v.set(1, hy, z, 'spKayu'); v.box(0, hy - 1, hz + 12, 2, hy + 1, hz + 13, 'spKayu'); for (let z = 0; z <= 7; z++) for (let y = hy - 2; y <= hy + 2; y++) if (!(z === 0 && Math.abs(y - hy) === 2)) v.set(1 + (z < 3 ? 1 : 0), y, z, 'spBesi'); }
  if (p === 'ember') { for (let z = hz - 11; z <= hz - 3; z++) { const r = z < hz - 8 ? 3 : 4; v.shell(z, -r, hy - r, r, hy + r, d.emberCol || 'spKaret', 2); } v.rrect(hz - 4, -3, hy - 3, 3, hy + 3, d.emberIsi || 'spSemen', 2); for (let x = -3; x <= 3; x++) v.set(x, hy, hz - 1 - (Math.abs(x) > 2 ? 1 : 0), 'spBesi'); }
  if (p === 'jaring') { for (let z = hz - 12; z <= hz; z++) { const w = z < hz - 3 ? 3 : 1; for (let x = -w; x <= w; x++) for (let y = hy - w; y <= hy + w; y++) if ((x + y + z) % 2 === 0 || Math.abs(x) === w) v.set(x, y, z, 'spJaring'); } v.set(0, hy, hz - 6, 'spPutihP'); v.set(1, hy + 1, hz - 9, 'spPutihP'); }
  if (p === 'dayung') { for (let z = 6; z <= hz + 18; z++) v.set(2, hy, z, 'spKayu'); for (let z = 0; z <= 7; z++) for (let x = 0; x <= 4; x++) if (Math.abs(x - 2) <= 1 + (z > 1 && z < 7 ? 1 : 0)) v.set(x, hy, z, 'spKayu'); }
  if (p === 'kunci') { for (let z = hz - 7; z <= hz; z++) v.set(2, hy, z, 'spBesi'); for (const [x, z] of [[1, hz - 8], [3, hz - 8], [1, hz - 9], [3, hz - 9]]) v.set(x, hy, z, 'spBesi'); }
  if (p === 'lap') { for (let z = hz - 7; z <= hz - 1; z++) for (let y = hy - 1; y <= hy + 1; y++) v.set(1 + ((z + y) % 2), y, z, (z + y) % 3 ? cm(d.propCol || 'merah') : 'spOli'); }
  if (p === 'sutil') { for (let z = hz - 3; z <= hz + 6; z++) v.set(2, hy, z, z < hz + 1 ? 'spKayu' : 'spBesi'); v.box(1, hy - 1, hz + 7, 3, hy + 1, hz + 9, 'spBesi'); }
  if (p === 'ikan') { for (let z = hz - 9; z <= hz - 1; z++) for (let x = -1; x <= 1; x++) if (Math.abs(x) <= (z > hz - 3 || z < hz - 7 ? 0 : 1)) v.set(x + 1, hy, z, 'spIkan'); v.set(1, hy, hz - 10, 'spIkan'); v.set(0, hy, hz - 10, 'spIkan'); v.set(2, hy, hz - 10, 'spIkan'); v.set(1, hy, hz, 'spTali'); }
  if (p === 'trekking') { for (let z = 1; z <= hz + 4; z++) v.set(3, hy, z, z > hz - 2 ? 'spKaret' : z < 3 ? 'spKaret' : 'spBesi'); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) v.set(3 + dx, hy + dy, 4, 'spKaret'); v.set(2, hy, hz + 3, 'spTali'); }
  if (p === 'mug') { for (let z = hz - 1; z <= hz + 3; z++) v.shell(z, 1, hy - 2, 4, hy + 1, cm(d.propCol || 'putih'), 1); v.rrect(hz + 2, 2, hy - 1, 3, hy, 'spKopi', 0); v.set(1, hy + 2, hz + 1, cm(d.propCol || 'putih')); v.set(1, hy + 2, hz + 2, cm(d.propCol || 'putih')); }
  if (p === 'peta') { for (let x = 1; x <= 9; x++) for (let z = hz - 3; z <= hz + 7; z++) { const riv = Math.abs(z - hz - 2 - Math.round(Math.sin(x * 0.8) * 2)) < 1, hut = (x - 7) ** 2 + (z - hz - 5) ** 2 < 4; v.set(x, hy, z, x === 5 || x === 1 || x === 9 || z === hz - 3 || z === hz + 7 ? 'spC_kremS' : riv ? 'spC_biruMuda' : hut ? 'spC_hijau' : 'spC_krem'); } v.set(3, hy, hz + 4, 'spMerahP'); v.set(7, hy, hz, 'spMerahP'); }
  if (p === 'terompet') { for (let k = 0; k <= 15; k++) { const rr = 0.6 + Math.max(0, k - 5) * 0.3, cx = 1 + k * 0.55, cz = hz + 1 + k * 0.85; for (let y = -4; y <= 4; y++) for (let dx = -4; dx <= 4; dx++) { const q = Math.hypot(y, dx); if (q <= rr) v.set(Math.round(cx + dx * 0.85), hy + y, Math.round(cz - dx * 0.55), k >= 14 ? 'spPutihP' : k % 5 === 4 ? cm(d.propCol || 'merah') + 'S' : cm(d.propCol || 'merah')); } } }
  if (p === 'bendera') { const top = hz + Math.round(30 * s); for (let z = hz - 3; z <= top; z++) v.set(2, hy, z, 'spKayu'); for (let x = 3; x <= 3 + Math.round(13 * s); x++) for (let z = top - Math.round(10 * s); z <= top; z++) v.set(x, hy, z, z > top - Math.round(5 * s) ? cm(d.propCol || 'merah') : cm(d.propCol2 || 'putih')); }
  if (p === 'tasbih') { const cz = hz - Math.round(5 * s), rr = Math.round(4 * s); for (let a = 0; a < 24; a++) { const t = a / 24 * Math.PI * 2, x = Math.round(1 + Math.sin(t) * rr * 0.6), z = Math.round(cz + Math.cos(t) * rr); v.set(x, hy, z, a % 6 === 0 ? 'spEmas' : 'spKayu'); } for (let z = cz - rr - 3; z < cz - rr; z++) v.set(1, hy, z, 'spEmas'); }
  if (p === 'rotan') { for (let z = hz - 12; z <= hz + 16; z++) v.set(3, hy, z, z % 6 === 0 ? 'spAnyamS' : 'spAnyam'); v.set(3, hy + 1, hz + 16, 'spAnyamS'); }
  if (p === 'mangkok') { for (let z = hz - 1; z <= hz + 2; z++) { const r = z === hz - 1 ? 2 : 3 + (z > hz ? 1 : 0); v.shell(z, 3 - r, hy - r, 3 + r, hy + r, z === hz + 2 ? 'spC_hijau' : 'spPutihP', 2); } v.rrect(hz + 1, 1, hy - 2, 5, hy + 2, 'spKuah', 2); for (const [x, y] of [[2, -1], [4, 1], [3, 0], [2, 1], [4, -1]]) v.set(x, hy + y, hz + 2, 'spBakso'); v.set(3, hy + 2, hz + 3, 'spIsi'); }
  if (p === 'lampu') {   // lampu minyak (teplok gantung) dijinjing: tangkai, tabung kaca, api
    for (let z = hz - 3; z <= hz; z++) v.set(1, hy, z, 'spBesi');
    v.rrect(hz - 4, -1, hy - 2, 3, hy + 2, 'spBesi', 1);
    for (let z = hz - 11; z <= hz - 5; z++) v.shell(z, -1, hy - 2, 3, hy + 2, z >= hz - 9 && z <= hz - 7 ? 'spApi' : 'spKacaL', 1);   // kaca semprong, bagian tengah menyala
    v.rbox(-2, hy - 3, hz - 14, 4, hy + 3, hz - 12, 'spBesi', 1); v.rrect(hz - 13, -1, hy - 2, 3, hy + 2, 'spKuah', 1);
  }
  if (p === 'papan') {   // papan jepit (clipboard): papan kayu, kertas, penjepit
    const yb = a1(G) + 1; v.box(-4, yb, hz - 3, 5, yb, hz + 10, 'spKayu'); v.box(-3, yb + 1, hz - 2, 4, yb + 1, hz + 8, 'spPutihP');
    for (let z = hz; z <= hz + 7; z += 2) v.box(-2, yb + 1, z, 3, yb + 1, z, 'spC_abu'); v.box(-1, yb + 1, hz + 9, 2, yb + 2, hz + 10, 'spPerak');
  }
  if (p === 'keranjang') { for (let z = hz - 12; z <= hz - 3; z++) v.shell(z, -4, hy - 4, 4, hy + 4, (z + hy) % 3 ? 'spAnyam' : 'spAnyamS', 2); v.rrect(hz - 12, -3, hy - 3, 3, hy + 3, 'spAnyam', 2); for (let x = -3; x <= 3; x++) v.set(x, hy, hz - 1 - (Math.abs(x) > 1 ? 1 : 0), 'spAnyamS'); v.set(-2, hy - 2, hz - 3, 'spIsi'); v.set(1, hy + 1, hz - 3, cm('merah')); }
}
const a1 = G => G.ay[1];
function thigh(d, G) {
  const B = d.bot, c = cm(B.c || 'hitam'), k = B.kind || 'celana', K = 'spKulit' + d.skin, kid = d.age === 'anak';
  if ((k === 'rok' || k === 'sarung' || k === 'daster') && !kid) return pattern(skirtThigh(c), c, B.pat, B.pc);
  const v = new Vox(), [t0, t1] = G.th, [ty0, ty1] = G.ty, [tx0, tx1] = G.tx;
  if (kid) { v.rbox(-2, 1, 12, 2, 4, 20, K, 2); if (k !== 'rok') for (let z = 16; z <= 20; z++) v.shell(z, -3, 0, 3, 5, c, 2); if (k === 'panjang') v.paint(-2, 1, 12, 2, 4, 20, c); return pattern(v, c, B.pat, B.pc); }
  v.rbox(tx0, ty0, t0, tx1, ty1, t1, c, 3); v.rrect(G.thTop, tx0 + 1, ty0, tx1 - 1, ty1, c, 3);
  if (k === 'pendek') v.paint(tx0, ty0, t0, tx1, ty1, G.knee + 1, K);
  if (B.stripe) for (let z = t0; z <= t1; z++) v.set(0, ty1, z, cm(B.stripe));
  return pattern(v, c, B.pat, B.pc);
}
function shin(d, G) { const v = shin0(d, G); if (d.fx && d.fx.shin) d.fx.shin(v, d, G); return v; }
function shin0(d, G) {
  const B = d.bot, c = cm(B.c || 'hitam'), k = B.kind || 'celana', K = 'spKulit' + d.skin, kid = d.age === 'anak', F = d.feet.kind || 'sepatu';
  if ((k === 'rok' || k === 'sarung' || k === 'daster') && !kid) return pattern(skirtShin(c, c + 'S'), c, B.pat, B.pc);
  const v = new Vox(), [s0, s1] = G.sn, [ty0, ty1] = G.ty, [tx0, tx1] = G.tx;
  if (kid) { v.rbox(-2, 1, 4, 1, 4, 12, k === 'panjang' ? c : K, 2); if (d.feet.kaus) v.paint(-2, 1, 4, 1, 4, 7, 'spPutihP'); return v; }
  const leg = k === 'pendek' ? K : c;
  v.rbox(tx0, ty0, s0, tx1, ty1, s1, leg, 3); v.rrect(G.snTop, tx0 + 1, ty0, tx1 - 1, ty1, leg, 3);
  if (k === 'gulung') { v.paint(tx0, ty0, s0, tx1, ty1, s0 + 4, K); for (const z of [s0 + 5, s0 + 6]) v.shell(z, tx0 - 1, ty0 - 1, tx1 + 1, ty1 + 1, c + 'S', 3); }
  if (k === 'training' || B.stripe) for (let z = s0; z <= s1; z++) v.set(0, ty1, z, cm(B.stripe || 'putih'));
  if (F === 'bot' || F === 'pdl') for (let z = s0; z <= s0 + (F === 'pdl' ? 5 : 7); z++) v.shell(z, tx0 - 1, ty0 - 1, tx1 + 1, ty1 + 1, F === 'pdl' ? 'spKaret' : cm(d.feet.c || 'hitam'), 3);
  if (d.feet.kaus && k === 'pendek') v.paint(tx0, ty0, s0, tx1, ty1, s0 + 3, 'spPutihP');
  return pattern(v, c, B.pat, B.pc);
}
function foot(d, G) {
  const v = new Vox(), K = 'spKulit' + d.skin, F = d.feet.kind || 'sepatu', c = cm(d.feet.c || 'hitam'), kid = d.age === 'anak', fem = d.sex === 'P' && !kid;
  if (kid) {
    if (F === 'sandal' || F === 'jepit' || F === 'nyeker') { if (F !== 'nyeker') v.rbox(-3, 0, 0, 4, 5, 0, c, 2); v.rbox(-2, 1, F === 'nyeker' ? 0 : 1, 4, 4, 2, K, 2); v.rbox(-2, 1, 3, 1, 4, 4, K, 1); if (F !== 'nyeker') for (const [x, y] of [[3, 2], [2, 1], [2, 3]]) v.set(x, y, 2, c); return v; }
    v.rbox(-3, 0, 0, 4, 5, 0, F === 'sneaker' ? 'spSol' : 'belt', 2); v.rbox(-3, 0, 1, 4, 5, 3, c, 2); return v;
  }
  const [y0, y1] = fem ? [1, 6] : [1, 8], xf = fem ? 6 : 7;
  if (F === 'sandal' || F === 'jepit' || F === 'nyeker') {
    if (F !== 'nyeker') v.rbox(-4, y0, 0, xf, y1, fem ? 0 : 1, c, 2 + (fem ? 0 : 1));
    const zb = F === 'nyeker' ? 0 : fem ? 1 : 2; v.rbox(-3, y0 + 1, zb, xf - 1, y1 - 1, zb + 1, K, 2); v.rbox(-3, y0 + 1, zb + 2, 2, y1 - 1, zb + 3, K, 2);
    if (F === 'jepit') for (const [x, y] of [[xf - 2, (y0 + y1) >> 1], [xf - 3, y0 + 1], [xf - 3, y1 - 1]]) v.set(x, y, zb + 1, c);
    if (F === 'sandal') v.paint(1, y0, zb + 1, 3, y1, zb + 1, c);
    return v;
  }
  if (F === 'bot' || F === 'pdl') { v.rbox(-4, y0, 0, xf, y1, 1, 'spKaret', 3); v.rbox(-4, y0, 2, xf, y1, 4, F === 'pdl' ? 'spKaret' : c, 3); v.rbox(-4, y0, 5, 3, y1, 6, F === 'pdl' ? 'spKaret' : c, 3); if (F === 'pdl') for (let z = 2; z <= 6; z++) v.set(3, (y0 + y1) >> 1, z, 'spC_hitamS'); return v; }
  v.rbox(-4, y0, 0, xf, y1, fem ? 0 : 1, F === 'sneaker' ? 'spSol' : 'spSolG', 3); v.rbox(-4, y0, fem ? 1 : 2, xf, y1, fem ? 3 : 4, c, 3); v.rbox(-3, y0, fem ? 4 : 5, fem ? 1 : 3, y1, fem ? 5 : 6, c, 3);
  if (F === 'sneaker') { v.set(xf, (y0 + y1) >> 1, fem ? 2 : 3, 'spSol'); for (let x = 0; x <= 3; x++) v.set(x, y1, fem ? 2 : 3, 'spSol'); }
  if (F === 'safety') v.paint(3, y0, 1, xf, y1, 3, 'spC_kuning');
  return v;
}

/* ================= rakit */
export function orang(d, expr = 'biasa') {
  const kid = d.age === 'anak', key = kid ? 'A' : d.sex, G = GEO[key](d.build), skel = kid ? SK.A : SK[key][d.build];
  const PV = pivots(skel), K = 'spKulit' + d.skin;
  const A = arm(d, G), Th = thigh(d, G), Sn = shin(d, G), Ft = foot(d, G), B = d.bot, bc = cm(B.c || 'hitam');
  const skirt = ['rok', 'sarung', 'daster'].includes(B.kind), skirtLong = skirt && !kid;
  const hem = B.hem ?? (d.sex === 'L' ? 5 : 7), panel = s => skirtLong ? pattern(skirtPanel(bc, bc + 'S', s, hem), bc, B.pat, B.pc) : null;
  const sl = sleeveCol(d) || K, long = d.top.sleeve === 'panjang' || d.top.kind === 'jaket' || d.top.kind === 'hoodie';
  const legM = B.kind === 'pendek' && !kid ? K : bc;
  const fR = fore(d, G, 1), fL = fore(d, G, -1);
  const P = assemble([
    ['foreR', fR, PV.foreR], ['propR', fR.held || null, PV.foreR], ['foreL', fL.mirrorY(), PV.foreL], ['propL', fL.held ? fL.held.mirrorY() : null, PV.foreL],
    ['head', head(d, EXPRS.includes(expr) ? expr : 'biasa'), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(d, G), PV.chest],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(d, G), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: K, shoulder: sl, elbow: long && !d.top.gulung ? sl : K, hip: kid && skirt ? K : bc, knee: skirtLong ? bc : kid ? (B.kind === 'panjang' ? bc : K) : legM }, skel, TAIL);
  P.propOn = { propR: d.propOn || HELD_KIND[d.handR] || 'aktif', propL: d.propOn || HELD_KIND[d.handL] || 'aktif' };
  if (skirtLong) P.skirt = skirtInfo(P, bc, bc + 'S');
  else if (skirt && kid) P.skirt = { mats: [P.mat(bc), P.mat(bc + 'S')], fill: P.mat(bc), parts: ['pelvis'] };
  return P;
}
// pembungkus template: SPAWN.outfits -> fungsi (d, r) yang mengisi deskripsi
export function template(SPAWN, OUTFITS, desc) {
  return function build(opt = {}) {
    const ok = OUTFITS[opt.outfit] ? opt.outfit : SPAWN.seragam || Object.keys(OUTFITS)[0];
    const d = desc(opt.v || 0, ok);
    if (opt.helm) { d.head = 'helmMotor'; d.headCol = d.helmCol || 'hitam'; }
    return orang(d, opt.expr || 'biasa');
  };
}
