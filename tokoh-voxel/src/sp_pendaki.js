// Template spawn: pendaki gunung & berkemah (jalur bukit, camping ground). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'pendaki', name: 'Pendaki', seragam: 'naik', varian: 64 };
export const OUTFITS = {
  naik: { name: 'Naik: jaket warna-warni + carrier besar & matras + kupluk + celana kargo + sepatu gunung, trekking pole' },
  camp: { name: 'Camp: fleece/hoodie + celana pendek atau panjang + sandal gunung, mug atau trekking pole' },
};
export const EXPRS = EX;
const JAKET = ['merah', 'oranye', 'kuning', 'biru', 'tosca', 'hijau', 'ungu', 'biruMuda', 'stabilo'];
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', pP: 0.35, age: ['muda', 'muda', 'dewasa'], skinW: { 1: 3, 2: 4, 3: 3, 0: 1 }, kumisP: 0.15, kacamataP: 0.12, salt: 211 }), r = d.r, L = d.sex === 'L';
  if (!L && r.p(0.3)) d.hijab = r.pick(['hitam', 'navy', 'abu', 'marun', 'hijauTua']);
  if (!L && !d.hijab && ['sebahu', 'bob'].includes(d.hairStyle)) d.hairStyle = 'kuncir';
  const kaus = r.pick(['hitam', 'abu', 'navy', 'putih']);
  if (o === 'camp') {
    d.top = { kind: r.pick(['jaket', 'hoodie']), c: r.pick(['abu', 'navy', 'hijauTua', 'marun', 'coklatMuda', 'olive', 'oranye']), c2: kaus, sleeve: 'panjang', tali: r.p(0.4) };
    d.bot = { kind: r.pick(['celana', 'pendek']), c: r.pick(['hitam', 'abu', 'khaki', 'olive', 'navy']) };
    d.feet = { kind: 'sandal', c: r.pick(['hitam', 'hijauTua', 'merah', 'biru']) };
    if (!d.hijab && r.p(0.5)) { d.head = 'kupluk'; d.headCol = r.pick(['merah', 'kuning', 'abu', 'hitam', 'oranye']); }
    d.handR = r.pick(['mug', 'mug', 'trekking', null]); d.propCol = r.pick(['putih', 'hijau', 'biru']);
    return d;
  }
  d.top = { kind: 'jaket', c: r.pick(JAKET), c2: kaus, sleeve: 'panjang' };
  d.bot = { kind: 'celana', c: r.pick(['hitam', 'abu', 'khaki', 'olive', 'navy']), stripe: r.p(0.3) ? 'abuMuda' : null };
  d.feet = { kind: 'bot', c: r.pick(['coklat', 'abu', 'hitam', 'coklatMuda']) };
  d.acc.push('carrier'); d.accCol = r.pick(['merah', 'oranye', 'biru', 'hijauTua', 'abu', 'hitam', 'kuning', 'tosca']);
  if (!d.hijab) { d.head = r.pick(['kupluk', 'kupluk', 'topiRimba', 'topi']); d.headCol = r.pick(['merah', 'kuning', 'abu', 'hitam', 'oranye', 'biru', 'khaki']); }
  d.handR = 'trekking'; if (r.p(0.5)) d.handL = 'trekking';
  return d;
});
