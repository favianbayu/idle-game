// Template spawn: santri pesantren (Fikri & Zaki dan santri lain): halaman pondok, masjid, jalan ke sekolah. Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'santri', name: 'Santri', seragam: 'santri', varian: 64 };
export const OUTFITS = {
  santri: { name: 'Santri: koko + sarung + peci (putra), gamis + kerudung lebar (putri), kitab atau tasbih' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', pP: 0.45, age: ['muda', 'muda', 'muda', 'anak'], kumisP: 0, jenggotP: 0, salt: 229 }), r = d.r, L = d.sex === 'L', kid = d.age === 'anak';
  if (L) {
    if (!['cepak', 'plontos', 'belah'].includes(d.hairStyle)) d.hairStyle = r.pick(['cepak', 'belah', 'cepak']);
    d.top = { kind: 'koko', c: r.pick(['putih', 'putih', 'krem', 'biruMuda', 'abuMuda', 'mint', 'hijauTua', 'coklatMuda']), sleeve: r.p(0.5) ? 'panjang' : 'pendek' };
    d.bot = kid ? { kind: 'panjang', c: r.pick(['hitam', 'navy', 'abu']) }
      : { kind: 'sarung', c: r.pick(['hijauTua', 'marun', 'navy', 'coklat', 'hitam', 'biru', 'ungu']), pat: r.pick(['kotak', 'kotak', 'batik', 'garis']), pc: r.pick(['kuning', 'putih', 'krem', 'merah']) };
    d.head = 'peci'; if (r.p(0.15)) { d.acc.push('handuk'); }
  } else {
    d.hijab = r.pick(['putih', 'putih', 'hitam', 'krem', 'navy', 'hijauTua', 'coklat']);
    const c = r.pick(['hitam', 'navy', 'hijauTua', 'coklat', 'abu', 'marun', 'putih', 'mocca']);
    d.top = { kind: 'gamis', c, sleeve: 'panjang' }; d.bot = kid ? { kind: 'panjang', c } : { kind: 'rok', c, hem: 4 };
    if (d.hijab === c) d.hijab = c === 'putih' ? 'hitam' : 'putih';
  }
  d.feet = { kind: r.pick(['jepit', 'sandal', 'sandal']), c: r.pick(['hitam', 'coklat', 'biru', 'hijau']) };
  d.handR = r.pick(['buku', 'buku', 'tasbih', null]); d.propCol = r.pick(['hijau', 'coklat', 'kuning', 'marun']);
  return d;
});
