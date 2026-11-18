// Template spawn: turis asing jalan-jalan (pantai, alun-alun, candi; gerombolan turis segmen 31). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'turis', name: 'Turis', seragam: 'jalan', varian: 64 };
export const OUTFITS = {
  jalan: { name: 'Jalan: kaus atau tank top + celana pendek + topi + sandal, kamera/peta/ransel, kulit bule & wajah merah kepanasan' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', age: ['dewasa', 'muda', 'dewasa', 'lansia'], skin: 5, hairCol: 'x', jenggotP: 0.25, kumisP: 0.15, kacamataP: 0.1, salt: 223 }), r = d.r, L = d.sex === 'L';
  d.hairCol = d.age === 'lansia' ? r.pick(['putih', 'abu', 'pirang']) : r.pick(['pirang', 'pirang', 'coklat', 'merah', 'coklatTua']);
  if (L) d.hairStyle = r.pick(['cepak', 'belah', 'ikal', 'gondrong', d.age === 'lansia' ? 'botakTengah' : 'cepak']);
  else d.hairStyle = r.pick(['kuncir', 'sebahu', 'bob', 'kepang', 'sebahu']);
  d.face.blush = true; d.face.kacamata = (v * 5 + 2) % 8 < 3 ? 'hitam' : null;
  d.top = { kind: r.pick(L ? ['kaus', 'kaus', 'singlet', 'kemeja'] : ['kaus', 'singlet', 'singlet', 'blus']), c: r.pick(['putih', 'biruMuda', 'kuning', 'salem', 'mint', 'krem', 'abuMuda', 'tosca', 'merah', 'navy']) };
  if (d.top.kind === 'singlet') d.top.sleeve = 'tanpa';
  if (d.top.kind === 'kemeja') { d.top.pat = r.pick(['bunga', 'kotak']); d.top.pc = r.pick(['putih', 'kuning', 'merah']); d.top.c = r.pick(['biru', 'tosca', 'merah', 'hijau']); }
  d.bot = { kind: 'pendek', c: r.pick(['khaki', 'krem', 'jinsMuda', 'olive', 'putih', 'navy', 'abu']) };
  d.feet = { kind: r.pick(['sandal', 'sandal', 'sneaker', 'jepit']), c: r.pick(['coklat', 'hitam', 'putih', 'abu']) };
  if (r.p(0.65)) { d.head = r.pick(['topi', 'topiRimba', 'topiRimba']); d.headCol = r.pick(['krem', 'putih', 'khaki', 'navy', 'merah']); }
  const bawa = r.pick(['ransel', 'kamera', 'kamera', 'keduanya']);
  if (bawa !== 'kamera') { d.acc.push('ransel'); d.accCol = r.pick(['hitam', 'abu', 'merah', 'navy', 'oranye']); }
  if (bawa !== 'ransel') d.acc.push('kamera');
  d.handR = r.pick(['peta', 'botol', 'hp', null]);
  return d;
});
