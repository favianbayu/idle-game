// Template spawn: pedagang kaki lima generik (nasi kucing, kelapa muda, gorengan, buah). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'pedagang', name: 'Pedagang', seragam: 'jualan', varian: 64 };
export const OUTFITS = {
  jualan: { name: 'Jualan: kaus/kemeja + celemek + handuk di leher + topi/peci, sutil atau kresek' },
  pasar: { name: 'Pasar: kaus + celana + sandal, keranjang belanjaan dagangan atau kresek' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', pP: 0.4, age: ['dewasa', 'dewasa', 'lansia'], build: ['kurus', 'sedang', 'gempal', 'gempal'], kumisP: 0.4, salt: 167 }), r = d.r, L = d.sex === 'L';
  if (!L && r.p(0.65)) d.hijab = r.pick(['hitam', 'coklat', 'krem', 'marun', 'hijauTua']);
  d.top = { kind: L ? r.pick(['kaus', 'kaus', 'kemeja']) : 'blus', c: r.pick(['putih', 'krem', 'merah', 'biru', 'kuning', 'hijau', 'abu', 'marun']), pat: r.pick(['polos', 'polos', 'garis', 'kotak']), pc: r.pick(['putih', 'navy']), sleeve: !L && d.hijab ? 'panjang' : 'pendek' };
  d.bot = L ? { kind: r.pick(['celana', 'pendek', 'gulung']), c: r.pick(['hitam', 'abu', 'khaki', 'jins']) } : { kind: 'rok', c: r.pick(['coklat', 'hitam', 'navy']), pat: r.p(0.5) ? 'batik' : 'polos', pc: 'krem' };
  d.feet = { kind: r.pick(['jepit', 'sandal']), c: r.pick(['hitam', 'coklat', 'biru']) };
  if (o === 'jualan') {
    d.acc.push('celemek'); d.apronCol = r.pick(['putih', 'merah', 'hijau', 'biru', 'kuning']); d.apronPocket = true;
    if (L && r.p(0.4)) d.acc.push('handuk');
    if (L) { d.head = r.pick(['topi', 'peci', null]); d.headCol = r.pick(['hitam', 'merah', 'krem']); }
    d.handR = r.pick(['sutil', 'kresek', null]);
  } else d.handR = r.pick(['keranjang', 'kresek', 'kresekM']);
  return d;
});
