// Pak Rusdi: 49, mandor gudang subkontraktor PT Graha di Kawasan Industri, pemegang daftar "tenaga harian" (segmen 33,
// antagonis kecil). Gempal, kumis tebal, kemeja kerja abu, topi, papan jepit daftar. Dibangun di atas spawn_base, voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  gudang: { name: 'Gudang: topi hitam + kemeja kerja abu lengan pendek + celana kargo + sepatu safety, papan jepit daftar' },
  rapi: { name: 'Ketemu atasan: kemeja batik + celana bahan hitam + sepatu' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'gudang';
  const d = gen(0, { sex: 'L', age: 'dewasa', skin: 2, build: 'gempal', hairCol: 'hitam', hair: ['belah'], salt: 461 });
  d.face = { skull: 'kotak', eyes: 'kecil', brow: 'tebal', mouth: 'datar', kumis: 'tebal', jenggot: false, kacamata: null, blush: false, hidung: 'lebar' };
  if (o === 'rapi') { d.top = { kind: 'kemeja', c: 'marun', pat: 'batik', pc: 'kuning', sleeve: 'pendek' }; d.bot = { kind: 'celana', c: 'hitam', belt: true }; d.feet = { kind: 'sepatu', c: 'hitam' }; }
  else { d.head = 'topi'; d.headCol = 'hitam'; d.top = { kind: 'kerja', c: 'abu', sleeve: 'pendek', tuck: true, logo: 'kuning' }; d.bot = { kind: 'celana', c: 'olive', belt: true }; d.feet = { kind: 'safety', c: 'hitam' }; d.handR = 'papan'; d.acc.push('ht'); }
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'hitam'; }
  return orang(d, opt.expr || 'biasa');
}
