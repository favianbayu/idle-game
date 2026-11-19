// Wak Kodir: 59, juragan perahu dan ketua nelayan muara (segmen 33). Kurus liat, kulit hitam legam, kaus partai lama
// (tanpa nama partai asli), celana pendek, caping, rokok kretek terselip di telinga. Dibangun di atas spawn_base, voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  melaut: { name: 'Melaut: caping + kaus kuning pudar bergambar + celana pendek + nyeker, jaring' },
  darat: { name: 'Di darat: kaus kuning pudar + sarung diselempangkan + celana pendek + sandal jepit, kretek di telinga' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'melaut';
  const d = gen(0, { sex: 'L', age: 'dewasa', skin: 4, build: 'kurus', hairCol: 'abu', hair: ['cepak'], salt: 361 });
  d.face = { skull: 'kotak', eyes: 'sipit', brow: 'tebal', mouth: 'lebar', kumis: 'tipis', jenggot: false, kacamata: null, blush: false, hidung: 'lebar' };
  d.fx = { head: v => { if (o === 'darat') { for (let x = -3; x <= 2; x++) v.set(x, 8, 9, x === 2 ? 'spC_coklat' : 'spPutihP'); } } };   // kretek di telinga kiri, tidak dinyalakan
  d.top = { kind: 'kaus', c: 'kuning', logo: 'merah', pat: 'kotor' };
  d.bot = { kind: 'pendek', c: 'hitamPudar' };
  if (o === 'melaut') { d.head = 'caping'; d.feet = { kind: 'nyeker' }; d.handR = 'jaring'; }
  else { d.acc.push('selempang'); d.accCol = 'hijauTua'; d.feet = { kind: 'jepit', c: 'biru' }; }
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'hitam'; }
  return orang(d, opt.expr || 'biasa');
}
