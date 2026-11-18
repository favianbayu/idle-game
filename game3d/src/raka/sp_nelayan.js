// Template spawn: nelayan muara & TPI, pemancing waduk. Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'nelayan', name: 'Nelayan', seragam: 'melaut', varian: 64 };
export const OUTFITS = {
  melaut: { name: 'Melaut: topi rimba/caping + kaus pudar + celana pendek + nyeker, jaring atau dayung' },
  tpi: { name: 'TPI: sepatu bot + celemek karet + kaus lengan panjang, ember atau ikan di tangan' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', pP: o === 'tpi' ? 0.4 : 0.05, age: ['dewasa', 'dewasa', 'lansia', 'muda'], skinW: { 3: 4, 4: 4, 2: 2 }, kumisP: 0.4, salt: 157 }), r = d.r, L = d.sex === 'L';
  if (!L && r.p(0.6)) d.hijab = r.pick(['hitam', 'coklat', 'merah']);
  if (o === 'tpi') {
    d.top = { kind: L ? 'kaus' : 'blus', c: r.pick(['biru', 'abu', 'merah', 'hijau', 'kuning']), sleeve: 'panjang', pat: 'kotor' };
    d.acc.push('celemek'); d.apronCol = r.pick(['karet', 'oranye', 'kuning', 'biru']);
    d.bot = { kind: 'celana', c: r.pick(['hitam', 'abu', 'navy']) }; d.feet = { kind: 'bot', c: r.pick(['hitam', 'hijauTua', 'kuning']) };
    d.handR = r.pick(['ember', 'ikan', 'ikan']); d.emberCol = 'spC_biru'; d.emberIsi = 'spIkan'; return d;
  }
  d.top = { kind: r.pick(['kaus', 'kaus', 'singlet']), c: r.pick(['biru', 'abu', 'merah', 'kuning', 'putih', 'hijau', 'oranye']), pat: r.pick(['kotor', 'polos', 'garis']), pc: 'putih' };
  if (d.top.kind === 'singlet') d.top.sleeve = 'tanpa';
  d.bot = { kind: 'pendek', c: r.pick(['hitam', 'abu', 'navy', 'khaki']) }; d.feet = { kind: r.pick(['nyeker', 'jepit']), c: 'hitam' };
  d.head = r.pick(['topiRimba', 'caping', 'topi', null]); d.headCol = r.pick(['khaki', 'krem', 'biru', 'hijauTua']);
  d.handR = r.pick(['jaring', 'dayung', null]);
  return d;
});
