// Template spawn: kakek & nenek (teras, pos ronda, pasar). Jalan lebih lambat. Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'wargaLansia', name: 'Kakek/nenek', seragam: 'harian', varian: 64 };
export const OUTFITS = {
  harian: { name: 'Harian: kakek kemeja/kaus + celana bahan atau sarung + peci/topi; nenek kebaya/blus + kain batik + sanggul atau kerudung; tongkat, kipas, kresek' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v) => {
  const d = gen(v, { sex: 'LP', age: 'lansia', build: ['kurus', 'kurus', 'sedang'], salt: 41, kumisP: 0.45, kacamataP: 0.35, skinW: { 1: 3, 2: 5, 3: 4, 4: 2 } }), r = d.r;
  if (d.sex === 'L') {
    const kemeja = r.p(0.6);
    d.top = { kind: kemeja ? 'kemeja' : 'kaus', c: r.pick(kemeja ? ['krem', 'abu', 'coklatMuda', 'putih', 'biruMuda', 'coklat'] : ['putih', 'krem', 'abuMuda']), pat: kemeja ? r.pick(['polos', 'kotak', 'batik', 'garisTipis']) : 'polos', pc: 'krem' };
    if (d.top.pat === 'batik') { d.top.c = r.pick(['coklat', 'navy', 'hijauTua']); d.top.pc = 'kuning'; }
    d.bot = r.p(0.35) ? { kind: 'sarung', c: r.pick(['hijauTua', 'coklat', 'marun', 'navy']), pat: 'kotak', pc: 'krem' } : { kind: 'celana', c: r.pick(['abu', 'coklat', 'hitam', 'khaki']) };
    d.head = r.w({ peci: 3, topi: 1, none: 3 }); if (d.head === 'none') d.head = null; d.headCol = r.pick(['abu', 'krem', 'coklat']);
  } else {
    d.top = { kind: 'blus', c: r.pick(['krem', 'coklatMuda', 'putih', 'hijauTua', 'ungu', 'marun', 'biruMuda']), pat: r.pick(['polos', 'bunga']), pc: 'krem', sleeve: 'panjang' };
    d.bot = { kind: 'rok', c: r.pick(['coklat', 'kopi', 'hitam', 'navy']), pat: 'batik', pc: r.pick(['krem', 'kuning']), hem: 3 };
    if (r.p(0.5)) { d.hijab = r.pick(['putih', 'krem', 'hitam', 'coklat', 'hijauTua']); } else d.hairStyle = 'sanggul';
  }
  d.feet = { kind: r.pick(['sandal', 'jepit']), c: r.pick(['hitam', 'coklat']) };
  d.handR = r.pick(['tongkat', 'tongkat', 'kresek', null]); d.handL = r.p(0.2) ? 'kresekH' : null;
  return d;
});
