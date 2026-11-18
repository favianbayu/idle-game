// Template spawn: warga pria dewasa/muda yang lewat (trotoar, pasar, gang, masjid). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'wargaPria', name: 'Warga pria', seragam: 'harian', varian: 64 };
export const OUTFITS = {
  harian: { name: 'Harian: kaus/kemeja/polo + celana panjang atau pendek + sandal/sepatu, kadang tas selempang, HP, kresek' },
  jumatan: { name: 'Jumatan: baju koko + sarung kotak + peci + sandal' },
  kantor: { name: 'Kantor: kemeja lengan panjang dimasukkan + celana bahan + ikat pinggang + sepatu, ID card, map' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'L', age: ['dewasa', 'dewasa', 'muda'], salt: 11 }), r = d.r;
  if (o === 'jumatan') {
    d.top = { kind: 'koko', c: r.pick(['putih', 'krem', 'abuMuda', 'biruMuda', 'mint', 'coklatMuda']), sleeve: r.p(0.5) ? 'panjang' : 'pendek' };
    d.bot = { kind: 'sarung', c: r.pick(['hijauTua', 'marun', 'navy', 'coklat', 'ungu', 'biru']), pat: 'kotak', pc: r.pick(['kuning', 'krem', 'putih']) };
    d.head = 'peci'; d.feet = { kind: 'sandal', c: r.pick(['coklat', 'hitam']) };
    return d;
  }
  if (o === 'kantor') {
    d.top = { kind: 'kemeja', c: r.pick(['putih', 'biruMuda', 'abuMuda', 'krem', 'putih']), sleeve: 'panjang', tuck: true, pat: r.pick(['polos', 'polos', 'garisTipis']), jam: true };
    d.bot = { kind: 'celana', c: r.pick(['hitam', 'abu', 'navy', 'coklat']), belt: true };
    d.feet = { kind: 'sepatu', c: r.pick(['hitam', 'coklat']) };
    if (r.p(0.5)) d.acc.push('idcard'); d.idCol = r.pick(['biru', 'merah', 'hijau']);
    d.handR = r.pick(['map', 'hp', null]); d.propCol = r.pick(['biru', 'hitam', 'merah']);
    return d;
  }
  const kind = r.pick(['kaus', 'kemeja', 'polo', 'kaus']);
  d.top = { kind, c: r.pick(['putih', 'abu', 'navy', 'biru', 'hijauTua', 'marun', 'krem', 'hitam', 'biruMuda', 'coklatMuda', 'olive', 'kuning', 'merah', 'tosca']),
    pat: kind === 'kemeja' ? r.pick(['polos', 'kotak', 'garisTipis', 'batik']) : kind === 'kaus' ? r.pick(['polos', 'polos', 'garis']) : 'polos', sleeve: 'pendek', tuck: kind === 'kemeja' && r.p(0.35) };
  if (d.top.pat === 'garis') d.top.pc = r.pick(['putih', 'navy', 'merah', 'kuning']);
  if (d.top.pat === 'batik') { d.top.c = r.pick(['coklat', 'marun', 'navy', 'hijauTua']); d.top.pc = r.pick(['krem', 'kuning']); }
  const pendek = r.p(0.25);
  d.bot = { kind: pendek ? 'pendek' : 'celana', c: pendek ? r.pick(['khaki', 'hitam', 'jins', 'abu']) : r.pick(['jins', 'hitam', 'khaki', 'abu', 'navy', 'coklat', 'jinsMuda']), belt: d.top.tuck };
  d.feet = { kind: r.pick(pendek ? ['jepit', 'sandal', 'sneaker'] : ['sandal', 'sepatu', 'sneaker', 'jepit']), c: r.pick(['hitam', 'coklat', 'navy', 'abu']) };
  if (d.feet.kind === 'sneaker') d.feet.c = r.pick(['putih', 'hitam', 'abuMuda', 'navy']);
  if (r.p(0.15)) { d.head = 'topi'; d.headCol = r.pick(['hitam', 'navy', 'merah', 'krem']); }
  if (r.p(0.3)) { d.acc.push('selempang'); d.accCol = r.pick(['hitam', 'coklat', 'abu']); }
  d.handR = r.pick([null, 'hp', 'kresek', null, 'kresekH']); d.handL = r.p(0.2) ? 'kresekM' : null;
  return d;
});
