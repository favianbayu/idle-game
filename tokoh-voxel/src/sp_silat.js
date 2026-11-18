// Template spawn: murid silat cilik (padepokan, halaman masjid, lapangan sore; segmen 33). Rangka anak. Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'muridSilat', name: 'Murid silat', seragam: 'pangsi', varian: 64 };
export const OUTFITS = {
  pangsi: { name: 'Pangsi: baju & celana pangsi hitam kebesaran + sabuk tingkatan + nyeker, kadang iket di kepala' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', pP: 0.35, age: 'anak', salt: 233 }), r = d.r, L = d.sex === 'L';
  if (!L && r.p(0.45)) d.hijab = r.pick(['hitam', 'putih']);
  d.top = { kind: 'pangsi', c: r.p(0.85) ? 'hitam' : 'putih', sleeve: 'panjang', tuck: true };
  d.bot = { kind: 'panjang', c: d.top.c };
  d.feet = { kind: 'nyeker' };
  d.acc.push('sabuk'); d.sabukCol = r.pick(['putih', 'putih', 'kuning', 'hijau', 'biru', 'merah', 'coklat']);
  if (d.top.c === 'putih' && d.sabukCol === 'putih') d.sabukCol = 'hitam';
  if (!d.hijab && r.p(L ? 0.5 : 0.2)) { d.head = 'ikatKepala'; d.headCol = r.pick(['coklat', 'hitam', 'marun']); d.headPat = r.pick(['kuning', 'krem', null]); }
  return d;
});
