// Mbak Sri Wahyuni: 31, koordinator buruh shift Kawasan Industri (segmen 33). Seragam pabrik biru, kerudung abu, masker
// kain di dagu, kartu ID tergantung, sepatu kets. "Absen dulu, baru ngeluh." Dibangun di atas spawn_base, voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  shift: { name: 'Shift: kerudung abu + seragam pabrik biru lengan panjang + masker di dagu + kartu ID + celana biru + kets, papan absen' },
  kerja: { name: 'Kerja: kerudung abu + seragam pabrik biru + masker kain dipakai + kartu ID + celana biru + kets' },
  rumah: { name: 'Rumah: kerudung abu + kaus panjang krem + rok batik + sandal' },
  kos: { name: 'Kos buruh: kerudung abu + kaus panjang krem + rok jins + sandal' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'shift';
  const d = gen(0, { sex: 'P', age: 'dewasa', skin: 1, build: 'kurus', hairCol: 'hitam', hair: ['kuncir'], salt: 411 });
  d.face = { skull: 'oval', eyes: 'tajam', brow: 'lurus', mouth: 'datar', kumis: null, jenggot: false, kacamata: null, blush: false, hidung: 'kecil' };
  d.hijab = 'abu';
  if (o === 'rumah') { d.top = { kind: 'kaus', c: 'krem', sleeve: 'panjang' }; d.bot = { kind: 'rok', c: 'coklat', pat: 'batik', pc: 'krem' }; d.feet = { kind: 'sandal', c: 'hitam' }; }
  else if (o === 'kos') { d.top = { kind: 'kaus', c: 'krem', sleeve: 'panjang' }; d.bot = { kind: 'rok', c: 'jins' }; d.feet = { kind: 'sandal', c: 'hitam' }; }
  else { d.maskerDagu = 'navy'; d.top = { kind: 'kerja', c: 'biru', sleeve: 'panjang', tuck: false, logo: 'putih' }; d.acc.push('idcard'); d.idCol = 'merah'; d.bot = { kind: 'celana', c: 'biru' }; d.feet = { kind: 'sneaker', c: 'putih' }; if (o === 'kerja') { d.maskerDagu = null; d.masker = 'navy'; } else d.handR = 'papan'; }
  if (opt.helm) { d.hijab = null; d.head = 'helmMotor'; d.headCol = 'biru'; }
  return orang(d, opt.expr || 'biasa');
}
