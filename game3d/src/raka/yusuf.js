// Pak Yusuf Tanjung: 50, kepala race control Sirkuit Tanjung Pradana, mantan pembalap (segmen 33). Kurus, rambut abu
// disisir rapi, kemeja race control oranye, radio di dada, bekas luka bakar di tangan kiri. Dibangun di atas spawn_base, voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  raceControl: { name: 'Race control: kemeja oranye lengan panjang + radio di dada + celana hitam + sepatu, HT di tangan' },
  kerja: { name: 'Kerja: kemeja race control oranye lengan panjang + radio di dada + celana hitam + sepatu' },
  santai: { name: 'Mes sirkuit: polo abu + celana khaki + sepatu, mug kopi' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'raceControl';
  const d = gen(0, { sex: 'L', age: 'dewasa', skin: 1, build: 'kurus', hairCol: 'abu', hair: ['klimis'], salt: 401 });
  d.face = { skull: 'oval', eyes: 'tajam', brow: 'lurus', mouth: 'datar', kumis: null, jenggot: false, kacamata: null, blush: false, hidung: 'kecil' };
  d.tegak = true;
  d.fx = { fore: (v, dd, G, side) => { if (side > 0) return; v.each((x, y, z, k) => { if (k === 'spKulit1' && z <= G.hz[1] + 2 && (x + y * 2 + z) % 3 !== 0) v.set(x, y, z, 'spLuka'); }); } };   // bekas luka bakar tangan kiri
  if (o === 'santai') { d.top = { kind: 'polo', c: 'abu', tuck: true }; d.bot = { kind: 'celana', c: 'khaki', belt: true }; d.feet = { kind: 'sepatu', c: 'coklat' }; d.handR = 'mug'; }
  else { d.top = { kind: 'kerja', c: 'oranye', sleeve: 'panjang', gulung: true, tuck: true, logo: 'putih' }; d.acc.push('radio'); d.bot = { kind: 'celana', c: 'hitam', belt: true }; d.feet = { kind: 'sepatu', c: 'hitam' }; if (o === 'kerja') d.top.gulung = false; else d.handR = 'ht'; }
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'putih'; }
  return orang(d, opt.expr || 'biasa');
}
