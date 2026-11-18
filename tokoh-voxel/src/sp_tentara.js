// Template spawn: prajurit Batalyon 3 (apel, regu lari subuh, jaga gerbang). Seragam tidak divariasikan; yang berubah
// hanya orangnya (kulit, wajah, kumis, tubuh tegap). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'tentara', name: 'Prajurit', seragam: 'pdl', varian: 64 };
export const OUTFITS = {
  pdl: { name: 'PDL: loreng lengan digulung + baret hijau atau helm + sabuk + sepatu PDL' },
  olahraga: { name: 'Olahraga / lari subuh: kaus hijau + celana pendek hijau + sepatu lari' },
  jaga: { name: 'Jaga gerbang: loreng + rompi + helm loreng + senapan latihan' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'L', age: 'dewasa', build: ['sedang', 'sedang', 'kurus'], hair: ['cepakTipis'], kumisP: 0.3, jenggotP: 0, kacamataP: 0, salt: 79 }), r = d.r;
  if (o === 'olahraga') {
    d.top = { kind: 'kaus', c: 'hijauTua' }; d.bot = { kind: 'pendek', c: 'hijauTua', stripe: 'kuning' };
    d.feet = { kind: 'sneaker', c: 'hitam', kaus: true }; return d;
  }
  d.top = { kind: 'loreng', c: 'lorDasar', pat: 'loreng', sleeve: o === 'jaga' ? 'panjang' : 'pendek', tuck: true, badgeArm: 'merah' };
  d.bot = { kind: 'celana', c: 'lorDasar', pat: 'loreng', belt: true }; d.feet = { kind: 'pdl' };
  if (o === 'jaga') { d.head = 'helmTentara'; d.top.rompi = 'lorTua'; d.handR = 'senapan'; }
  else if (r.p(0.75)) { d.head = 'baret'; d.headCol = 'hijauTua'; } else d.head = 'helmTentara';
  return d;
});
