// Template spawn: tukang parkir (depan ruko, pasar). Rompi oranye bergaris pantul + peluit. Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'tukangParkir', name: 'Tukang parkir', seragam: 'rompi', varian: 64 };
export const OUTFITS = { rompi: { name: 'Jaga parkir: rompi oranye bergaris pantul + kaus + topi + peluit + celana + sandal, kain lap' } };
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v) => {
  const d = gen(v, { sex: 'L', age: ['dewasa', 'dewasa', 'muda', 'lansia'], skinW: { 2: 3, 3: 5, 4: 3 }, kumisP: 0.45, salt: 139 }), r = d.r;
  d.top = { kind: 'kaus', c: r.pick(['putih', 'hitam', 'abu', 'biru', 'merah', 'navy']), sleeve: r.p(0.3) ? 'panjang' : 'pendek', rompi: 'oranyeRompi', stripe: 'stabilo' };
  d.bot = { kind: r.pick(['celana', 'celana', 'gulung']), c: r.pick(['hitam', 'jins', 'abu', 'khaki']) }; d.feet = { kind: r.pick(['sandal', 'jepit', 'sepatu']), c: 'hitam' };
  d.acc.push('peluit'); if (r.p(0.7)) { d.head = 'topi'; d.headCol = r.pick(['hitam', 'navy', 'merah', 'krem']); }
  d.handR = r.pick(['lap', null]); d.propCol = 'merah';
  return d;
});
