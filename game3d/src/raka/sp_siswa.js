// Template spawn: siswa SMA tanpa nama (halaman, kelas, kantin). Rambut selalu rapi pendek (aturan sekolah). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'siswaAcak', name: 'Siswa', seragam: 'seragam', varian: 64 };
export const OUTFITS = {
  seragam: { name: 'Seragam: kemeja putih + badge OSIS + celana abu + ikat pinggang + sepatu hitam + ransel' },
  olahraga: { name: 'Olahraga: kaus olahraga biru lis putih + celana training + sneakers putih' },
  pramuka: { name: 'Pramuka (Rabu-Kamis): kemeja cokelat muda + kacu merah putih + celana cokelat + sepatu hitam' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'L', age: 'muda', build: ['kurus', 'sedang', 'sedang', 'gempal'], hair: ['cepak', 'belah', 'poni', 'belah'], kumisP: 0, salt: 101, kacamataP: 0.2 }), r = d.r;
  if (o === 'olahraga') { d.top = { kind: 'olahraga', c: 'biru', lis: 'putih' }; d.bot = { kind: 'celana', c: 'biru', stripe: 'putih' }; d.feet = { kind: 'sneaker', c: 'putih' }; return d; }
  if (o === 'pramuka') { d.top = { kind: 'kemeja', c: 'coklatMuda', tuck: true, sleeve: 'pendek' }; d.acc.push('kacu'); d.bot = { kind: 'celana', c: 'coklat', belt: true }; d.feet = { kind: 'sepatu', c: 'hitam' }; return d; }
  d.top = { kind: 'seragam', c: 'putih', tuck: r.p(0.75), badge: true, sleeve: 'pendek' };
  d.bot = { kind: 'celana', c: 'abu', belt: true }; d.feet = { kind: 'sepatu', c: 'hitam' };
  if (r.p(0.7)) { d.acc.push('ransel'); d.accCol = r.pick(['hitam', 'navy', 'abu', 'merah', 'hijauTua', 'biru']); }
  d.handR = r.pick([null, null, 'hp', 'buku']); d.propCol = r.pick(['biru', 'kuning', 'merah']);
  return d;
});
