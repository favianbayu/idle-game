// Template spawn: siswi SMA tanpa nama. Sekitar 60% berjilbab putih; rok selalu panjang & tidak terbelah. Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'siswiAcak', name: 'Siswi', seragam: 'seragam', varian: 64 };
export const OUTFITS = {
  seragam: { name: 'Seragam: jilbab putih/rambut diikat + kemeja putih + badge OSIS + rok abu panjang + sepatu hitam + tas' },
  olahraga: { name: 'Olahraga: kaus olahraga biru lis putih + celana training + sneakers putih' },
  pramuka: { name: 'Pramuka: jilbab cokelat + kemeja cokelat muda + kacu merah putih + rok cokelat panjang' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'P', age: 'muda', build: ['kurus', 'sedang', 'sedang'], hair: ['kuncir', 'kuncir', 'kepang', 'sebahu', 'bob'], salt: 113, kacamataP: 0.2 }), r = d.r;
  const jil = r.p(0.6);
  if (o === 'olahraga') { if (jil) d.hijab = 'putih'; d.top = { kind: 'olahraga', c: 'biru', lis: 'putih', sleeve: jil ? 'panjang' : 'pendek' }; d.bot = { kind: 'celana', c: 'biru', stripe: 'putih' }; d.feet = { kind: 'sneaker', c: 'putih' }; return d; }
  if (o === 'pramuka') { if (jil) d.hijab = 'coklat'; d.top = { kind: 'kemeja', c: 'coklatMuda', sleeve: jil ? 'panjang' : 'pendek' }; d.acc.push('kacu'); d.bot = { kind: 'rok', c: 'coklat' }; d.feet = { kind: 'sepatu', c: 'hitam' }; return d; }
  if (jil) d.hijab = 'putih';
  d.top = { kind: 'seragam', c: 'putih', badge: true, sleeve: jil ? 'panjang' : 'pendek', jam: r.p(0.4) };
  d.bot = { kind: 'rok', c: 'abu' }; d.feet = { kind: 'sepatu', c: 'hitam' };
  if (r.p(0.6)) { d.acc.push('ransel'); d.accCol = r.pick(['pink', 'navy', 'lilac', 'hitam', 'mint', 'krem']); } else { d.acc.push('selempang'); d.accCol = r.pick(['coklat', 'hitam', 'pink']); }
  d.handR = r.pick([null, 'hp', 'buku', null]); d.propCol = r.pick(['pink', 'biru', 'kuning']);
  return d;
});
