// Serma Hadi Aditya: 46, ayah Dimas, bintara Batalyon 3 (segmen 33). Tegap, rambut cepak, kumis tipis rapi, wajah keras,
// seragam loreng atau kaus olahraga hijau, jam tangan besar. "Ulangi. Yang benar." Dibangun di atas spawn_base, voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  dinas: { name: 'Dinas: baret hijau + loreng lengan panjang dimasukkan + sabuk + sepatu PDL, jam tangan besar' },
  olahraga: { name: 'Lari subuh: kaus olahraga hijau + celana training hijau + sepatu lari, jam tangan besar' },
  rumah: { name: 'Di asrama: kaus loreng + celana pendek hijau + sandal jepit' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'dinas';
  const d = gen(0, { sex: 'L', age: 'dewasa', skin: 2, build: 'gempal', hairCol: 'hitam', hair: ['cepakTipis'], salt: 341 });
  d.face = { skull: 'kotak', eyes: 'tajam', brow: 'tebal', mouth: 'datar', kumis: 'tipis', jenggot: false, kacamata: null, blush: false, hidung: 'lebar' };
  d.tegak = true;
  if (o === 'olahraga') { d.top = { kind: 'olahraga', c: 'hijauTua', lis: 'kuning', jam: true }; d.bot = { kind: 'celana', c: 'hijauTua', stripe: 'kuning' }; d.feet = { kind: 'sneaker', c: 'hitam' }; }
  else if (o === 'rumah') { d.top = { kind: 'kaus', c: 'lorDasar', pat: 'loreng', jam: true }; d.bot = { kind: 'pendek', c: 'hijauTua' }; d.feet = { kind: 'jepit', c: 'hitam' }; }
  else { d.head = 'baret'; d.headCol = 'hijauTua'; d.top = { kind: 'loreng', c: 'lorDasar', pat: 'loreng', sleeve: 'panjang', tuck: true, jam: true }; d.bot = { kind: 'celana', c: 'lorDasar', pat: 'loreng', belt: true }; d.feet = { kind: 'pdl' }; }
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'hitam'; }
  return orang(d, opt.expr || 'biasa');
}
