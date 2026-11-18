// Nek Sumi: 72, nenek Andra, penjual jamu gendong di Desa Pandansari (segmen 33, sosoknya dari segmen 26). Kebaya lurik,
// kain jarik, selendang gendong berisi botol jamu, rambut putih disanggul. Dibangun di atas spawn_base, voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  jamu: { name: 'Jualan jamu: sanggul putih + kebaya lurik cokelat + jarik batik + selendang gendong botol jamu + sandal jepit' },
  sawah: { name: 'Di sawah: caping + kebaya lurik + jarik + nyeker' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'jamu';
  const d = gen(0, { sex: 'P', age: 'lansia', skin: 3, build: 'kurus', hairCol: 'putih', hair: ['sanggul'], salt: 431 });
  d.face = { skull: 'oval', eyes: 'ramah', brow: 'tipis', mouth: 'senyum', kumis: null, jenggot: false, kacamata: null, blush: false, hidung: 'lebar' };
  d.top = { kind: 'blus', c: 'coklat', sleeve: 'panjang', pat: 'lurik', pc: 'krem' };
  d.bot = { kind: 'rok', c: 'coklat', pat: 'batik', pc: 'kremS' };
  if (o === 'sawah') { d.head = 'caping'; d.feet = { kind: 'nyeker' }; }
  else { d.acc.push('gendong'); d.gendongCol = 'merah'; d.feet = { kind: 'jepit', c: 'hitam' }; d.handR = 'botol'; }
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'hitam'; }
  return orang(d, opt.expr || 'biasa');
}
