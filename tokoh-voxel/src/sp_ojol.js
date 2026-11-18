// Template spawn: ojek online / kurir makanan yang lewat (lebih sering naik motor). Jaket warna aplikasi fiktif. Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'ojolLewat', name: 'Ojol', seragam: 'jaket', varian: 64 };
export const OUTFITS = {
  jaket: { name: 'Narik: jaket hijau/oranye + helm half-face + masker + celana jins + sepatu, HP di tangan' },
  antar: { name: 'Antar makanan: jaket + helm + boks makanan di punggung' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', pP: 0.15, age: ['dewasa', 'muda'], salt: 131 }), r = d.r, L = d.sex === 'L';
  const app = r.pick(['hijauOjol', 'hijauOjol', 'oranyeRompi', 'hitam']);
  if (!L) d.hijab = r.pick(['hitam', 'navy', 'abu']);
  d.top = { kind: 'jaket', c: app, c2: r.pick(['hitam', 'abu', 'putih']), logo: 'putih' };
  d.bot = { kind: 'celana', c: r.pick(['jins', 'hitam', 'jinsMuda']) }; d.feet = { kind: r.pick(['sepatu', 'sneaker', 'sandal']), c: r.pick(['hitam', 'abu']) };
  d.head = 'helmMotor'; d.headCol = app === 'hitam' ? 'hijauOjol' : app;
  if (r.p(0.5)) d.masker = r.pick(['hitam', 'biruMuda']);
  if (o === 'antar') { d.acc.push('boks'); d.accCol = app === 'hitam' ? 'merah' : app; d.handR = r.pick(['kresek', null]); }
  else d.handR = r.pick(['hp', 'hp', null]);
  return d;
});
