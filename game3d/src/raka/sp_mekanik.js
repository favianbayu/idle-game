// Template spawn: mekanik pit sirkuit & bengkel kota (bukan Mas Fajar). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'mekanik', name: 'Mekanik', seragam: 'wearpack', varian: 64 };
export const OUTFITS = {
  wearpack: { name: 'Pit: wearpack tim (satu warna atas-bawah) + topi tim + sepatu safety, kunci & lap' },
  bengkel: { name: 'Bengkel: kaus belel bernoda oli + celana jins + sandal, kunci di tangan' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'L', age: ['dewasa', 'muda', 'muda'], kumisP: 0.3, salt: 163 }), r = d.r;
  if (o === 'bengkel') {
    d.top = { kind: r.pick(['kaus', 'singlet']), c: r.pick(['abu', 'putih', 'hitam', 'biru', 'krem']), pat: 'kotor' }; if (d.top.kind === 'singlet') d.top.sleeve = 'tanpa';
    d.bot = { kind: 'celana', c: r.pick(['jins', 'hitam']), pat: 'kotor' }; d.feet = { kind: r.pick(['sandal', 'jepit']), c: 'hitam' };
    d.handR = r.pick(['kunci', 'lap']); d.propCol = 'merah'; return d;
  }
  const team = r.pick(['merah', 'biru', 'kuning', 'hitam', 'oranye', 'hijau']);
  d.top = { kind: 'kerja', c: team, sleeve: r.p(0.5) ? 'panjang' : 'pendek', gulung: r.p(0.3), tuck: true, logo: team === 'putih' ? 'hitam' : 'putih', pat: r.p(0.4) ? 'kotor' : 'polos' };
  d.bot = { kind: 'celana', c: team, pat: d.top.pat }; d.feet = { kind: 'safety', c: 'hitam' };
  d.head = r.p(0.7) ? 'topi' : null; d.headCol = team === 'hitam' ? 'merah' : 'hitam';
  d.handR = r.pick(['kunci', 'lap', 'kunci']); d.propCol = 'merah';
  return d;
});
