// Template spawn: warga wanita tanpa hijab (trotoar, pasar, warung, kantor). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'wargaWanita', name: 'Warga wanita', seragam: 'harian', varian: 64 };
export const OUTFITS = {
  harian: { name: 'Harian: blus pastel/bunga + rok panjang atau celana + sandal/flat, tas tangan, kresek, HP' },
  daster: { name: 'Di rumah/warung: daster batik atau bunga + sandal jepit, kresek sayur atau sapu' },
  kantor: { name: 'Kantor: kemeja + rok/celana bahan gelap + sepatu, tas tangan, ID card' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'P', age: ['dewasa', 'dewasa', 'muda'], salt: 23 }), r = d.r;
  if (o === 'daster') {
    const c = r.pick(['merah', 'ungu', 'biru', 'hijau', 'oranye', 'tosca', 'pink', 'coklat']), pat = r.pick(['batik', 'bunga']), pc = r.pick(['kuning', 'krem', 'putih', 'pink']);
    d.top = { kind: 'daster', c, pat, pc, sleeve: 'pendek' }; d.bot = { kind: 'daster', c, pat, pc, hem: 6 };
    d.hairStyle = r.pick(['sanggul', 'kuncir', 'sanggul']); d.feet = { kind: 'jepit', c: r.pick(['pink', 'biru', 'hijau', 'hitam']) };
    d.handR = r.pick(['kresek', 'kresekM', 'sapu', null]); return d;
  }
  if (o === 'kantor') {
    d.top = { kind: 'kemeja', c: r.pick(['putih', 'biruMuda', 'pink', 'krem', 'lilac']), sleeve: r.p(0.5) ? 'panjang' : 'pendek', tuck: true };
    d.bot = r.p(0.5) ? { kind: 'rok', c: r.pick(['hitam', 'navy', 'abu', 'coklat']) } : { kind: 'celana', c: r.pick(['hitam', 'navy', 'abu', 'krem']) };
    d.feet = { kind: 'sepatu', c: r.pick(['hitam', 'coklat', 'marun']) }; d.handR = 'tasTangan'; d.propCol = r.pick(['coklat', 'hitam', 'marun', 'krem']);
    if (r.p(0.5)) d.acc.push('idcard'); d.idCol = r.pick(['biru', 'merah']); d.hairStyle = r.pick(['sanggul', 'kuncir', 'bob', 'sebahu']); return d;
  }
  d.top = { kind: 'blus', c: r.pick(['pink', 'salem', 'kuning', 'mint', 'putih', 'lilac', 'biruMuda', 'krem', 'marun', 'tosca']), pat: r.pick(['polos', 'polos', 'bunga', 'garis']), sleeve: 'pendek', tuck: false };
  if (d.top.pat !== 'polos') d.top.pc = r.pick(['putih', 'navy', 'merah', 'kuning']);
  d.bot = r.p(0.55) ? { kind: 'rok', c: r.pick(['mocca', 'hitam', 'jins', 'coklat', 'navy', 'krem', 'hijauTua']), pat: r.p(0.2) ? 'batik' : 'polos', pc: 'krem' } : { kind: 'celana', c: r.pick(['jins', 'hitam', 'krem', 'jinsMuda', 'putih']) };
  d.feet = { kind: r.pick(['sandal', 'sepatu', 'sneaker', 'jepit']), c: r.pick(['coklat', 'hitam', 'putih', 'pink', 'krem']) };
  d.handR = r.pick(['tasTangan', 'kresek', 'hp', null, 'payung']); d.propCol = r.pick(['coklat', 'hitam', 'marun', 'krem', 'merah', 'biru']);
  if (r.p(0.3)) { d.acc.push('selempang'); d.accCol = r.pick(['coklat', 'hitam', 'krem', 'pink']); }
  return d;
});
