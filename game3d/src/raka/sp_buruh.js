// Template spawn: buruh pabrik Kawasan Industri & pabrik teh (ganti shift, gerbang pabrik). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'buruh', name: 'Buruh pabrik', seragam: 'pabrik', varian: 64 };
export const OUTFITS = {
  pabrik: { name: 'Shift: seragam kerja biru dongker + topi atau helm putih + masker + ID card + sepatu safety' },
  pulang: { name: 'Pulang shift: jaket + celana jins/hitam + sandal/sneakers, tas selempang/ransel, rantang' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', pP: 0.35, age: ['dewasa', 'dewasa', 'muda'], salt: 83 }), r = d.r, L = d.sex === 'L';
  if (!L && r.p(0.6)) d.hijab = r.pick(['navy', 'hitam', 'abu']);
  if (o === 'pulang') {
    d.top = { kind: 'jaket', c: r.pick(['hitam', 'abu', 'navy', 'hijauTua', 'marun', 'jins']), c2: r.pick(['navy', 'putih', 'abu']) };
    d.bot = { kind: 'celana', c: r.pick(['jins', 'hitam', 'navy']) }; d.feet = { kind: r.pick(['sandal', 'sneaker', 'jepit']), c: r.pick(['hitam', 'abu', 'putih']) };
    if (r.p(0.5)) { d.acc.push('selempang'); d.accCol = r.pick(['hitam', 'coklat']); } else { d.acc.push('ransel'); d.accCol = r.pick(['hitam', 'navy']); }
    d.handR = r.pick(['rantang', 'hp', null, 'kresek']); return d;
  }
  d.top = { kind: 'kerja', c: 'navy', sleeve: r.p(0.5) ? 'panjang' : 'pendek', tuck: r.p(0.3), logo: 'kuning' };
  d.bot = { kind: 'celana', c: 'navy', belt: d.top.tuck }; d.feet = { kind: 'safety', c: 'hitam' };
  d.acc.push('idcard'); d.idCol = 'biru';
  const hw = r.w({ helmProyek: 3, topi: 3, none: 2 }); if (hw !== 'none' && !(d.hijab && hw === 'topi')) { d.head = hw; d.headCol = hw === 'topi' ? 'navy' : 'safety'; }
  if (r.p(0.35)) d.masker = r.pick(['biruMuda', 'putih', 'hitam']);
  d.handR = r.p(0.25) ? 'kardus' : null;
  return d;
});
