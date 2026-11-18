// Ir. Lukman: 44, manajer proyek villa tahap 2 PT Graha Megantara, memasang patok di Sukamekar dan Pandansari (segmen 33,
// antagonis kecil). Rapi, kacamata, helm proyek putih, kemeja biru muda, membawa gambar proyek. Dibangun di atas spawn_base, voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  proyek: { name: 'Lapangan: helm proyek putih + kemeja biru muda lengan panjang + rompi oranye + celana khaki + sepatu, gambar proyek' },
  kantor: { name: 'Kantor proyek: kemeja biru muda + celana bahan abu + sepatu kulit, HP' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'proyek';
  const d = gen(0, { sex: 'L', age: 'dewasa', skin: 0, build: 'sedang', hairCol: 'hitam', hair: ['belah'], salt: 471 });
  d.face = { skull: 'oval', eyes: 'sipit', brow: 'lurus', mouth: 'kecil', kumis: null, jenggot: false, kacamata: 'tipis', blush: false, hidung: 'kecil' };
  d.top = { kind: 'kemeja', c: 'biruMuda', sleeve: 'panjang', tuck: true, rompi: o === 'proyek' ? 'oranyeRompi' : null, stripe: o === 'proyek' ? 'stabilo' : null };
  d.bot = { kind: 'celana', c: o === 'proyek' ? 'khaki' : 'abu', belt: true }; d.feet = { kind: 'sepatu', c: 'coklat' };
  if (o === 'proyek') { d.head = 'helmProyek'; d.headCol = 'putih'; d.handR = 'peta'; } else d.handR = 'hp';
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'hitam'; }
  return orang(d, opt.expr || 'biasa');
}
