// Template spawn: warga wanita berhijab (semua wilayah). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'wargaHijab', name: 'Warga berhijab', seragam: 'harian', varian: 64 };
export const OUTFITS = {
  harian: { name: 'Harian: jilbab + tunik/blus lengan panjang + rok panjang atau celana + sandal, tas, kresek, payung' },
  pengajian: { name: 'Pengajian: jilbab lebar + gamis polos + sandal, Al-Quran/map di tangan' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'P', age: ['dewasa', 'dewasa', 'dewasa', 'muda'], salt: 37 }), r = d.r;
  d.hijab = r.pick(['hitam', 'navy', 'mocca', 'pink', 'krem', 'hijauTua', 'lilac', 'marun', 'abuMuda', 'tosca', 'coklat']); d.hijabPin = r.p(0.3);
  if (o === 'pengajian') {
    const c = r.pick(['hitam', 'navy', 'coklat', 'hijauTua', 'marun', 'abu', 'ungu', 'mocca']);
    d.hijab = r.pick(['putih', 'krem', c, 'hitam']);
    d.top = { kind: 'gamis', c, sleeve: 'panjang' }; d.bot = { kind: 'rok', c, hem: 4 };
    d.feet = { kind: 'sandal', c: r.pick(['hitam', 'coklat']) }; d.handR = r.pick(['buku', 'tasTangan']); d.propCol = r.pick(['hijau', 'hitam', 'coklat']); return d;
  }
  d.top = { kind: r.pick(['blus', 'blus', 'gamis']), c: r.pick(['krem', 'pink', 'salem', 'mint', 'biruMuda', 'lilac', 'putih', 'coklatMuda', 'kuning', 'mocca']), pat: r.pick(['polos', 'polos', 'bunga']), sleeve: 'panjang' };
  if (d.top.pat === 'bunga') d.top.pc = r.pick(['putih', 'merah', 'navy']);
  d.bot = r.p(0.75) ? { kind: 'rok', c: d.top.kind === 'gamis' ? d.top.c : r.pick(['hitam', 'navy', 'mocca', 'coklat', 'abu', 'jins']), pat: d.top.kind === 'gamis' ? d.top.pat : r.p(0.2) ? 'batik' : 'polos', pc: d.top.kind === 'gamis' ? d.top.pc : 'krem' }
    : { kind: 'celana', c: r.pick(['hitam', 'jins', 'krem', 'navy']) };
  d.feet = { kind: r.pick(['sandal', 'sepatu', 'jepit', 'sneaker']), c: r.pick(['coklat', 'hitam', 'krem', 'putih']) };
  d.handR = r.pick(['tasTangan', 'kresek', 'kresekM', 'payung', 'hp', null]); d.propCol = r.pick(['coklat', 'hitam', 'marun', 'krem', 'ungu', 'biru']);
  if (r.p(0.25)) { d.acc.push('selempang'); d.accCol = r.pick(['coklat', 'hitam', 'krem']); }
  return d;
});
