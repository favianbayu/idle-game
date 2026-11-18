// Template spawn: siswa STM Karya Bangsa tanpa nama (segmen 88): gerbang, bengkel praktik, parkiran, gudang lama.
// Lebih kasar dari anak SMA 3: kemeja putih berlogo STM sering tidak dimasukkan, lengan digulung, celana abu kena oli,
// sepatu safety atau boots. Putri boleh bercelana. Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'siswaSTM', name: 'Siswa STM', seragam: 'seragam', varian: 64 };
export const OUTFITS = {
  seragam: { name: 'Seragam: kemeja putih logo STM (sering dikeluarkan, lengan digulung) + celana abu + sepatu safety/boots + tas selempang' },
  praktek: { name: 'Praktik bengkel: wearpack biru dongker bernoda oli + sepatu safety, kunci atau lap' },
  nongkrong: { name: 'Pulang/nongkrong: kemeja seragam dikeluarkan + jaket atau hoodie gelap + celana abu, HP' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', pP: 0.15, age: 'muda', build: ['kurus', 'sedang', 'sedang', 'gempal'], kumisP: 0, kacamataP: 0.08, salt: 487 }), r = d.r, L = d.sex === 'L';
  if (L) d.hairStyle = r.pick(['cepak', 'jabrik', 'belah', 'cepakTipis', 'jabrik', 'poni']);
  else if (r.p(0.45)) d.hijab = r.pick(['putih', 'putih', 'abu']);
  else d.hairStyle = r.pick(['kuncir', 'bob', 'kuncir']);
  d.face.eyes = r.pick(['tajam', 'sipit', 'normal', 'kecil', 'tajam']);
  const shoes = () => ({ kind: r.pick(['safety', 'safety', 'bot', 'sepatu']), c: r.pick(['hitam', 'hitam', 'coklat']) });
  if (o === 'praktek') {
    const c = r.pick(['navy', 'navy', 'biru', 'abu']), dirty = r.p(0.35) ? 'kotor' : 'polos';
    d.top = { kind: 'kerja', c, sleeve: r.p(0.6) ? 'panjang' : 'pendek', gulung: r.p(0.4), tuck: true, logo: 'kuning', pat: dirty };
    d.bot = { kind: 'celana', c, pat: dirty }; d.feet = { kind: 'safety', c: 'hitam' };
    d.handR = r.pick(['kunci', 'lap', 'kunci', null]); d.propCol = 'merah';
    if (r.p(0.25) && !d.hijab) { d.head = 'topi'; d.headCol = r.pick(['hitam', 'merah']); }
    return d;
  }
  d.top = { kind: 'seragam', c: 'putih', tuck: o === 'seragam' ? r.p(0.3) : false, sleeve: 'pendek', logo: 'marun', gulung: r.p(0.5) };
  d.bot = { kind: 'celana', c: 'abu', belt: r.p(0.6), pat: r.p(0.35) ? 'kotor' : 'polos' };
  d.feet = shoes();
  if (o === 'nongkrong') {
    d.top = { kind: r.pick(['jaket', 'hoodie', 'jaket']), c: r.pick(['hitam', 'hitam', 'navy', 'marun', 'abu', 'jins']), c2: 'putih', sleeve: 'panjang' };
    d.handR = r.pick(['hp', 'hp', null]);
  } else if (r.p(0.6)) { d.acc.push(r.p(0.5) ? 'selempang' : 'ransel'); d.accCol = r.pick(['hitam', 'hitam', 'abu', 'navy']); }
  return d;
});
