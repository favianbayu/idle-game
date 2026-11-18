// Kang Ujo: 36, kepala basecamp pendakian Sangkala, mantan porter (segmen 33). Jaket gunung oranye pudar, celana kargo,
// sandal gunung, kumis tipis, wajah merah kena angin. Galak soal sampah. Dibangun di atas spawn_base, voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  basecamp: { name: 'Basecamp: jaket gunung oranye pudar + kaus abu + celana kargo + sandal gunung, papan daftar pendaki' },
  naik: { name: 'Memandu: kupluk + jaket oranye + carrier + celana kargo + sepatu gunung, tongkat trekking' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'basecamp';
  const d = gen(0, { sex: 'L', age: 'dewasa', skin: 2, build: 'kurus', hairCol: 'hitam', hair: ['ikal'], salt: 381 });
  d.face = { skull: 'oval', eyes: 'sipit', brow: 'tebal', mouth: 'senyum', kumis: 'tipis', jenggot: false, kacamata: null, blush: false, hidung: 'kecil' };
  d.fx = { head: v => { for (const [y, z] of [[-6, 4], [-5, 4], [-6, 5], [4, 4], [5, 4], [5, 5], [-1, 6], [0, 6]]) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'spMerahPipi'); } } };   // pipi & hidung merah kena angin
  d.top = { kind: 'jaket', c: 'oranyePudar', c2: 'abu', sleeve: 'panjang', pat: 'kotor' };
  d.bot = { kind: 'celana', c: 'khaki' };
  if (o === 'naik') { d.head = 'kupluk'; d.headCol = 'hijauTua'; d.acc.push('carrier'); d.accCol = 'hijauTua'; d.feet = { kind: 'bot', c: 'coklat' }; d.handR = 'trekking'; }
  else { d.feet = { kind: 'sandal', c: 'hitam' }; d.handR = 'papan'; }
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'hitam'; }
  return orang(d, opt.expr || 'biasa');
}
