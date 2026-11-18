// Mbah Darmo: 81, penjaga mercusuar Tanjung Karang (segmen 33). Sangat tua, punggung bungkuk, sarung dan jaket tentara
// usang, kacamata tebal, membawa lampu minyak. Pelupa soal hari ini, ingat jelas masa lalu. Dibangun di atas spawn_base, voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  jaga: { name: 'Jaga mercusuar: jaket tentara usang + sarung kotak + sandal jepit, kacamata tebal, lampu minyak' },
  pagi: { name: 'Pagi di pantai: kupluk + kaus putih + sarung + tongkat' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'jaga';
  const d = gen(0, { sex: 'L', age: 'lansia', skin: 3, build: 'kurus', hairCol: 'putih', hair: ['botakTengah'], salt: 421 });
  d.face = { skull: 'oval', eyes: 'lelah', brow: 'tipis', mouth: 'kecil', kumis: 'tipis', jenggot: true, kacamata: 'tebal', blush: false, hidung: 'lebar' };
  d.top = o === 'pagi' ? { kind: 'kaus', c: 'putih', pat: 'kotor' } : { kind: 'jaket', c: 'olive', c2: 'putih', sleeve: 'panjang', pat: 'kotor' };
  d.bot = { kind: 'sarung', c: 'marun', pat: 'kotak', pc: 'hitam' }; d.feet = { kind: 'jepit', c: 'hitam' };
  if (o === 'pagi') { d.head = 'kupluk'; d.headCol = 'abu'; d.handR = 'tongkat'; } else d.handR = 'lampu';
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'hitam'; }
  return orang(d, opt.expr || 'biasa');
}
