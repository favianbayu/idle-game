// Template spawn: siswa SMK Pariwisata Sukamekar tanpa nama (peta dunia no. 47): gerbang sekolah, halte, villa & kebun teh
// tempat praktik pemandu. Jurusan perhotelan, tata boga, usaha perjalanan wisata. Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'siswaSMK', name: 'Siswa SMK', seragam: 'seragam', varian: 64 };
export const OUTFITS = {
  seragam: { name: 'Seragam: kemeja putih + celana/rok hitam + sepatu hitam, putri berkerudung putih atau rambut diikat rapi' },
  hotel: { name: 'Praktik perhotelan: kemeja putih + rompi hitam + celana/rok hitam + sepatu pantofel' },
  tataBoga: { name: 'Praktik tata boga: topi koki putih + baju koki putih + celemek + celana hitam' },
  pemandu: { name: 'Praktik pemandu wisata: polo hijau tua jurusan + celana khaki + sepatu, papan jepit' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', pP: 0.6, age: 'muda', build: ['kurus', 'sedang', 'sedang'], kumisP: 0, kacamataP: 0.12, salt: 491 }), r = d.r, L = d.sex === 'L';
  if (L) d.hairStyle = r.pick(['cepak', 'belah', 'belah', 'klimis']);
  else if (o !== 'tataBoga' && r.p(0.55)) d.hijab = r.pick(['putih', 'putih', 'hitam']);
  else d.hairStyle = r.pick(['sanggul', 'kuncir', 'sanggul']);   // rambut wajib rapi diikat
  const bottom = c => L ? { kind: 'celana', c, belt: true } : (r.p(0.75) ? { kind: 'rok', c, hem: 4 } : { kind: 'celana', c });
  if (o === 'tataBoga') {
    d.head = 'topiKoki'; d.hijab = null;
    d.top = { kind: 'koko', c: 'putih', sleeve: r.p(0.5) ? 'panjang' : 'pendek', gulung: r.p(0.3), tuck: true };
    d.bot = { kind: 'celana', c: 'hitam' }; d.acc.push('celemek'); d.apronCol = r.pick(['hitam', 'merah', 'coklat']);
    d.feet = { kind: 'sepatu', c: 'hitam' }; d.handR = r.pick(['sutil', null, 'mangkok']); return d;
  }
  if (o === 'pemandu') {
    d.top = { kind: 'polo', c: 'hijauTua', logo: 'kuning', tuck: true }; d.bot = L ? { kind: 'celana', c: 'khaki', belt: true } : { kind: 'celana', c: 'khaki' };
    d.feet = { kind: 'sneaker', c: r.pick(['hitam', 'putih']) }; d.handR = r.pick(['papan', 'peta', 'papan']); d.propCol = 'kuning'; d.propCol2 = 'hijauTua';
    if (r.p(0.4) && !d.hijab) { d.head = 'topi'; d.headCol = 'hijauTua'; }
    return d;
  }
  d.top = { kind: 'seragam', c: 'putih', tuck: true, sleeve: o === 'hotel' ? 'panjang' : r.p(0.3) ? 'panjang' : 'pendek', badge: o !== 'hotel', rompi: o === 'hotel' ? 'hitam' : null };
  d.bot = bottom('hitam'); d.feet = { kind: 'sepatu', c: 'hitam' };
  if (o === 'seragam' && r.p(0.6)) { d.acc.push('ransel'); d.accCol = r.pick(['hitam', 'navy', 'coklat', 'hijauTua']); }
  if (o === 'seragam') d.handR = r.pick([null, null, 'hp', 'buku']);
  return d;
});
