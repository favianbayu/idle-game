// Template spawn: petani sawah & pemetik teh (Pandansari, Sukamekar, kebun karet). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'petani', name: 'Petani', seragam: 'sawah', varian: 64 };
export const OUTFITS = {
  sawah: { name: 'Sawah: caping + baju lengan panjang lusuh + celana digulung + nyeker/sepatu bot, cangkul atau arit' },
  kebunTeh: { name: 'Kebun teh: caping + kerudung/handuk + baju lengan panjang + keranjang di punggung' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const tea = o === 'kebunTeh';
  const d = gen(v, { sex: 'LP', pP: tea ? 0.75 : 0.35, age: ['dewasa', 'dewasa', 'lansia'], build: ['kurus', 'sedang', 'sedang'], skinW: { 2: 3, 3: 5, 4: 3 }, salt: 97 }), r = d.r, L = d.sex === 'L';
  if (!L && r.p(0.7)) d.hijab = r.pick(['coklat', 'krem', 'hitam', 'hijauTua', 'merah', 'biru']);
  d.head = 'caping';
  d.top = { kind: L ? r.pick(['kemeja', 'kaus']) : 'blus', c: r.pick(['coklatMuda', 'abu', 'krem', 'biru', 'hijau', 'khaki', 'marun', 'kopi']), pat: r.pick(['polos', 'polos', 'kotak']), sleeve: 'panjang', gulung: L && r.p(0.4) };
  d.bot = L ? { kind: r.pick(['gulung', 'gulung', 'pendek']), c: r.pick(['hitam', 'coklat', 'khaki', 'abu']) } : r.p(0.6) ? { kind: 'rok', c: r.pick(['coklat', 'kopi', 'hitam']), pat: 'batik', pc: 'krem' } : { kind: 'celana', c: r.pick(['hitam', 'coklat']) };
  d.feet = { kind: r.pick(['nyeker', 'bot', 'jepit']), c: r.pick(['hitam', 'hijauTua']) };
  if (tea) { d.acc.push('keranjangPunggung'); d.handR = null; if (L) d.acc.push('handuk'); }
  else d.handR = r.pick(['cangkul', 'arit', null]);
  return d;
});
