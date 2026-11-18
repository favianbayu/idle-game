// Tito: 12, anak asrama Batalyon 3, murid bola Dimas (segmen 33). Kaus bola kebesaran, lutut selalu luka, selalu membuntuti
// Dimas. "Kak Dimas bilang kakak jago, beneran?" Dibangun di atas spawn_base (rangka anak), voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  bola: { name: 'Main bola: kaus bola merah nomor 10 kebesaran + celana pendek + kaus kaki + sepatu bola, lutut luka, bola' },
  sekolah: { name: 'Sekolah SD: kemeja putih + celana merah + sepatu hitam + ransel' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'bola';
  const d = gen(0, { sex: 'L', age: 'anak', skin: 3, build: 'kurus', hairCol: 'hitam', hair: ['jabrik'], salt: 441 });
  d.face = { skull: 'bulat', eyes: 'besar', brow: 'tebal', mouth: 'lebar', kumis: null, jenggot: false, kacamata: null, blush: true, hidung: 'kecil' };
  d.fx = { shin: (v, dd, G) => { for (const [x, y, z] of [[2, 2, 11], [2, 3, 11], [2, 2, 10], [1, 3, 12]]) { const xx = v.front(y, z); if (xx !== null) v.set(xx, y, z, (x + z) % 2 ? 'spLuka' : 'spMerahP'); } } };   // lutut lecet
  if (o === 'sekolah') { d.top = { kind: 'seragam', c: 'putih', tuck: true }; d.bot = { kind: 'pendek', c: 'merah' }; d.feet = { kind: 'sepatu', c: 'hitam' }; d.acc.push('ransel'); d.accCol = 'biru'; }
  else { d.top = { kind: 'kaus', c: 'merah', lis: 'putih', nomor: 10, sleeve: 'pendek' }; d.bot = { kind: 'pendek', c: 'putih' }; d.feet = { kind: 'sneaker', c: 'hitam', kaus: true }; d.handR = 'bola'; }
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'merah'; }
  return orang(d, opt.expr || 'biasa');
}
