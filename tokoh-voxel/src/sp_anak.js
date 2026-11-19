// Template spawn: anak SD (gang, lapangan, tanggul, musala). Rangka anak sama dengan Dodi/Cici. Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'wargaAnak', name: 'Anak kampung', seragam: 'sd', varian: 64 };
export const OUTFITS = {
  sd: { name: 'Seragam SD: kemeja putih + celana/rok merah + kaus kaki putih + sepatu hitam + ransel' },
  main: { name: 'Main: kaus cerah + celana pendek + sandal jepit atau nyeker, layangan/bola' },
  ngaji: { name: 'Ngaji: koko + celana kotak + peci (cowok), jilbab putih + baju & celana putih (cewek)' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', age: 'anak', salt: 67 }), r = d.r, L = d.sex === 'L';
  d.jepit = r.pick(['pink', 'kuning', 'biruMuda', 'merah']);
  if (o === 'sd') {
    d.top = { kind: 'kemeja', c: 'putih', tuck: true, badge: true }; d.bot = { kind: L ? 'pendek' : 'rok', c: 'merah' };
    d.feet = { kind: 'sepatu', c: 'hitam', kaus: true };
    if (r.p(0.6)) { d.acc.push('ransel'); d.accCol = r.pick(['merah', 'biru', 'pink', 'kuning', 'hijau', 'ungu']); }
    if (!L && r.p(0.4)) d.hijab = 'putih';
    return d;
  }
  if (o === 'ngaji') {
    if (L) { d.top = { kind: 'koko', c: r.pick(['putih', 'krem', 'biruMuda']) }; d.bot = { kind: 'panjang', c: r.pick(['hijauTua', 'marun', 'navy']), pat: 'kotak', pc: 'kuning' }; d.head = 'peci'; }
    else { d.hijab = 'putih'; d.top = { kind: 'gamis', c: 'putih', sleeve: 'panjang' }; d.bot = { kind: 'panjang', c: 'putih' }; }
    d.feet = { kind: 'sandal', c: r.pick(['hitam', 'biru', 'pink']) }; d.handR = r.p(0.5) ? 'buku' : null; d.propCol = 'hijau';
    return d;
  }
  d.top = { kind: 'kaus', c: r.pick(['merah', 'biru', 'kuning', 'hijau', 'oranye', 'putih', 'pink', 'tosca', 'ungu']), pat: r.pick(['polos', 'garis', 'polos']), pc: r.pick(['putih', 'kuning', 'navy']) };
  d.bot = { kind: 'pendek', c: r.pick(['hitam', 'abu', 'navy', 'khaki', 'jins', 'merah']) };
  d.feet = { kind: r.pick(['jepit', 'jepit', 'nyeker', 'sandal']), c: r.pick(['biru', 'merah', 'hijau', 'kuning', 'pink']) };
  d.handR = r.pick(['layangan', 'bola', null, null]); d.propCol = r.pick(['merah', 'biru', 'hijau']); d.propCol2 = r.pick(['kuning', 'putih']);
  if (L && r.p(0.25)) { d.head = 'topi'; d.headCol = r.pick(['merah', 'biru', 'hitam']); }
  return d;
});
