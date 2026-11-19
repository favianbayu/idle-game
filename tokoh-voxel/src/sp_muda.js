// Template spawn: remaja & mahasiswa (kafe, alun-alun, kampus, angkot). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'wargaMuda', name: 'Anak muda', seragam: 'kampus', varian: 64 };
export const OUTFITS = {
  kampus: { name: 'Kampus: jaket/kemeja flanel terbuka di atas kaus + jins + sneakers + ransel (cewek: kaus/kemeja + rok/jins, sebagian berhijab)' },
  nongkrong: { name: 'Nongkrong: hoodie atau kaus + celana pendek + sandal/sneakers, HP di tangan, earphone' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', age: 'muda', build: ['kurus', 'sedang', 'sedang'], salt: 53, kacamataP: 0.22 }), r = d.r, L = d.sex === 'L';
  if (!L && r.p(0.4)) d.hijab = r.pick(['hitam', 'mocca', 'pink', 'krem', 'lilac', 'abuMuda', 'navy']);
  if (o === 'nongkrong') {
    const hood = r.p(0.55);
    d.top = { kind: hood ? 'hoodie' : 'kaus', c: r.pick(hood ? ['hitam', 'abu', 'navy', 'marun', 'olive', 'krem', 'lilac'] : ['putih', 'hitam', 'kuning', 'tosca', 'merah', 'abuMuda']), c2: r.pick(['putih', 'hitam', 'abu']), tali: hood, sleeve: hood ? 'panjang' : 'pendek' };
    d.bot = d.hijab ? { kind: 'celana', c: r.pick(['hitam', 'jins', 'krem']) } : { kind: 'pendek', c: r.pick(['hitam', 'khaki', 'jins', 'abu', 'navy']) };
    d.feet = { kind: r.pick(['sandal', 'sneaker', 'jepit']), c: r.pick(['hitam', 'putih', 'navy', 'merah']) };
    d.handR = r.pick(['hp', 'hp', 'botol', null]); if (r.p(0.15) && L && !d.hijab) { d.head = 'topi'; d.headCol = r.pick(['hitam', 'putih', 'navy']); }
    return d;
  }
  if (L || r.p(0.5)) {
    const flanel = r.p(0.45);
    d.top = { kind: 'jaket', c: flanel ? r.pick(['merah', 'navy', 'hijauTua', 'coklat']) : r.pick(['hitam', 'navy', 'hijauTua', 'abu', 'krem', 'jins', 'coklat']), c2: r.pick(['putih', 'hitam', 'abuMuda', 'krem']), pat: flanel ? 'kotak' : 'polos', pc: 'hitam', gulung: flanel && r.p(0.5) };
  } else d.top = { kind: 'kaus', c: r.pick(['putih', 'pink', 'lilac', 'mint', 'krem', 'kuning']), pat: r.pick(['polos', 'garis']), pc: 'navy', sleeve: d.hijab ? 'panjang' : 'pendek' };
  d.bot = L ? { kind: 'celana', c: r.pick(['jins', 'jinsMuda', 'hitam', 'khaki']) } : r.p(0.5) ? { kind: 'rok', c: r.pick(['jins', 'mocca', 'hitam', 'krem']) } : { kind: 'celana', c: r.pick(['jins', 'hitam', 'krem', 'jinsMuda']) };
  d.feet = { kind: 'sneaker', c: r.pick(['putih', 'hitam', 'abuMuda', 'navy', 'krem']) };
  if (L || r.p(0.6)) { d.acc.push('ransel'); d.accCol = r.pick(['hitam', 'navy', 'abu', 'hijauTua', 'merah', 'krem']); } else { d.acc.push('selempang'); d.accCol = r.pick(['coklat', 'hitam', 'krem']); }
  d.handR = r.pick(['hp', null, 'buku', 'botol']); d.propCol = r.pick(['biru', 'merah', 'kuning']);
  return d;
});
