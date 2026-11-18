// Template spawn: ibu-ibu Persit (asrama tentara, acara kompleks; segmen 33). Selalu berhijab. Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'persit', name: 'Ibu Persit', seragam: 'seragam', varian: 64 };
export const OUTFITS = {
  seragam: { name: 'Seragam: blus pink berkerah + rok pink panjang + jilbab + pantofel hitam + lencana, tas tangan' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'P', age: ['dewasa', 'dewasa', 'dewasa', 'lansia'], build: ['sedang', 'sedang', 'gempal', 'kurus'], kacamataP: 0.2, salt: 239 }), r = d.r;
  d.hijab = r.pick(['pinkTua', 'pinkTua', 'pinkPersit', 'marun', 'putih']); d.hijabPin = r.p(0.6);
  d.top = { kind: 'seragam', c: 'pinkPersit', sleeve: 'panjang', badge: true, tuck: false };
  d.bot = { kind: 'rok', c: 'pinkPersit', hem: 4 };
  d.feet = { kind: 'sepatu', c: 'hitam' };
  d.handR = r.pick(['tasTangan', 'tasTangan', 'map', null]); d.propCol = r.pick(['hitam', 'coklat', 'marun']);
  return d;
});
