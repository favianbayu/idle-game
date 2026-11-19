// Neng Ayu: 14, adik pertama Wulan di Desa Sukamekar, ingin jadi pembalap seperti Kirana (segmen 33). Rambut pendek,
// jaket balap kebesaran. "Kak, boncengin sampai kelokan doang!" Dibangun di atas spawn_base, voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  jaket: { name: 'Main: jaket balap merah-putih kebesaran + kaus hitam + celana jins + sneakers' },
  rumah: { name: 'Rumah: jaket balap merah-putih kebesaran + kaus hitam + celana pendek + sandal jepit, rambut pendek' },
  silat: { name: 'Latihan silat: pangsi hitam + sabuk putih + nyeker' },
  sekolah: { name: 'SMP: kemeja putih + rok biru panjang + sepatu hitam' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'jaket';
  const d = gen(0, { sex: 'P', age: 'muda', skin: 2, build: 'kurus', hairCol: 'hitam', hair: ['bob'], salt: 451 });
  d.face = { skull: 'oval', eyes: 'besar', brow: 'tebal', mouth: 'lebar', kumis: null, jenggot: false, kacamata: null, blush: true, hidung: 'kecil' };
  if (o === 'silat') { d.top = { kind: 'pangsi', c: 'hitamPudar', sleeve: 'panjang', tuck: true }; d.bot = { kind: 'celana', c: 'hitamPudar' }; d.feet = { kind: 'nyeker' }; d.acc.push('sabuk'); d.sabukCol = 'putih'; }
  else if (o === 'sekolah') { d.top = { kind: 'seragam', c: 'putih', tuck: true, sleeve: 'pendek' }; d.bot = { kind: 'rok', c: 'navy' }; d.feet = { kind: 'sepatu', c: 'hitam' }; }
  else { d.top = { kind: 'jaket', c: 'merah', c2: 'hitam', sleeve: 'panjang', stripe: 'putih', logo: 'putih' }; d.bot = o === 'rumah' ? { kind: 'pendek', c: 'hitam' } : { kind: 'celana', c: 'jins' }; d.feet = o === 'rumah' ? { kind: 'jepit', c: 'hitam' } : { kind: 'sneaker', c: 'putih' }; }
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'merah'; }
  return orang(d, opt.expr || 'biasa');
}
