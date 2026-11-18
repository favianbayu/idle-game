// Template spawn: kuli/tukang proyek PT Graha & gudang (bukan Mandor Sutris). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'kuli', name: 'Kuli proyek', seragam: 'proyek', varian: 64 };
export const OUTFITS = {
  proyek: { name: 'Proyek: helm kuning + kaus lusuh + celana kerja + sepatu bot, sekop atau ember semen' },
  istirahat: { name: 'Istirahat: kaus singlet + handuk di leher + celana digulung + sandal jepit' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'L', age: ['dewasa', 'dewasa', 'muda'], build: ['kurus', 'sedang', 'sedang', 'gempal'], skinW: { 2: 3, 3: 5, 4: 3 }, kumisP: 0.4, salt: 137 }), r = d.r;
  if (o === 'istirahat') {
    d.top = { kind: 'singlet', c: r.pick(['putih', 'krem', 'abuMuda', 'hitam']), pat: 'kotor', sleeve: 'tanpa' }; d.acc.push('handuk');
    d.bot = { kind: 'gulung', c: r.pick(['hitam', 'abu', 'coklat', 'khaki']) }; d.feet = { kind: 'jepit', c: 'hitam' };
    d.handR = r.pick([null, 'botol']); if (r.p(0.4)) { d.head = 'topi'; d.headCol = r.pick(['hitam', 'navy']); } return d;
  }
  d.top = { kind: 'kaus', c: r.pick(['abu', 'krem', 'biru', 'merah', 'hijauTua', 'oranye', 'hitam']), pat: 'kotor', sleeve: r.p(0.3) ? 'panjang' : 'pendek' };
  d.bot = { kind: 'celana', c: r.pick(['hitam', 'abu', 'khaki', 'jins']), pat: 'kotor' }; d.feet = { kind: 'bot', c: r.pick(['hitam', 'hijauTua']) };
  d.head = 'helmProyek'; d.headCol = r.pick(['kuning', 'kuning', 'oranye', 'putih']);
  d.handR = r.pick(['sekop', 'ember', null]); d.emberCol = 'spKaret'; d.emberIsi = 'spSemen';
  if (r.p(0.3)) d.acc.push('handuk');
  return d;
});
