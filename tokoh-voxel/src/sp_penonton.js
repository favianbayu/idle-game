// Template spawn: penonton sirkuit, futsal, pensi (tribun & pinggir lapangan). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'penonton', name: 'Penonton', seragam: 'suporter', varian: 64 };
export const OUTFITS = {
  suporter: { name: 'Suporter: kaus tim bernomor + ikat kepala + syal, terompet atau bendera kecil' },
};
export const EXPRS = EX;
const TIM = [['biru', 'putih'], ['merah', 'putih'], ['hijau', 'putih'], ['oranye', 'hitam'], ['kuning', 'hijau'], ['biruMuda', 'navy'], ['ungu', 'kuning'], ['hitam', 'kuning'], ['marun', 'kuning']];
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', pP: 0.3, age: ['muda', 'muda', 'dewasa', 'dewasa', 'anak'], salt: 227 }), r = d.r, L = d.sex === 'L', kid = d.age === 'anak';
  const [a, b] = r.pick(TIM);
  if (!L && r.p(0.4)) d.hijab = r.p(0.5) ? a : 'hitam';
  d.top = { kind: 'kaus', c: a, lis: b, logo: b, nomor: kid ? null : r.pick([7, 10, 9, 23, 17, 4, 11, 99, 8, 1]) };
  if (d.hijab) d.top.sleeve = 'panjang';
  d.bot = { kind: r.pick(['celana', 'pendek', 'celana']), c: r.pick(['hitam', 'jins', 'jinsMuda', 'abu', 'navy']) };
  if (kid && d.bot.kind === 'celana') d.bot.kind = 'panjang';
  d.feet = { kind: r.pick(['sneaker', 'sandal', 'jepit', 'sneaker']), c: r.pick(['hitam', 'putih', a, 'abu']) };
  if (!d.hijab && r.p(0.6)) { d.head = 'ikatKepala'; d.headCol = r.pick([b, a, 'putih']); d.headTulis = d.headCol === a ? b : a; }
  if (!kid && (v * 7 + 3) % 5 < 3) { d.acc.push('syal'); d.syalCol = a; d.syalCol2 = b; }
  d.handR = ['terompet', 'bendera', null, 'bendera', 'terompet'][(v * 3 + 1) % 5]; d.propCol = a; d.propCol2 = b;
  if (r.p(0.2)) d.handL = r.pick(['botol', 'hp']);
  return d;
});
