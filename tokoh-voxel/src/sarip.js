// Bang Sarip: 38, kepala orang bayaran PT Graha Megantara, bos kecil Bab 7, 12, 13 (segmen 33). Besar, kepala plontos,
// bekas luka di pipi kiri, kemeja batik terbuka di atas kaus hitam, kalung rantai, tongkat rotan. "Bocah. Pulang sana, belajar."
// Dibangun di atas spawn_base (gaya & rangka sama), voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  preman: { name: 'Preman: kemeja batik terbuka + kaus hitam + kalung rantai + jins + sepatu bot hitam, tongkat rotan' },
  gudang: { name: 'Gudang: kaus hitam + kalung rantai + celana kargo + sepatu bot, HT di pinggang' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'preman';
  const d = gen(0, { sex: 'L', age: 'dewasa', skin: 3, build: 'gempal', hairCol: 'hitam', hair: ['plontos'], salt: 311 });
  d.face = { skull: 'kotak', eyes: 'kecil', brow: 'tebal', mouth: 'datar', kumis: null, jenggot: true, kacamata: null, blush: false, hidung: 'lebar' };
  d.fx = {
    head: v => { for (const [x, y, z] of [[7, -6, 9], [7, -6, 8], [7, -5, 7], [7, -5, 6], [7, -4, 5], [7, -4, 4], [7, -3, 3]]) { const xx = v.front(y, z); if (xx !== null) v.set(xx, y, z, 'spLuka'); } },   // bekas luka pipi kiri
    chest: (v, dd, G) => { const nz = G.cz[1]; for (let k = 0; k <= 10; k++) { const y = Math.round(-5 + k), z = nz - Math.round(6 - Math.abs(k - 5) * 1.1); const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, k % 2 ? 'spRantai' : 'spPerak'); } },
  };
  d.top = o === 'gudang' ? { kind: 'kaus', c: 'hitam' } : { kind: 'jaket', c: 'coklat', c2: 'hitam', pat: 'batik', pc: 'krem', gulung: true };
  d.bot = { kind: 'celana', c: o === 'gudang' ? 'olive' : 'jins', belt: true }; d.feet = { kind: 'bot', c: 'hitam' };
  if (o === 'gudang') d.acc.push('ht'); else d.handR = 'rotan';
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'hitam'; }
  return orang(d, opt.expr || 'biasa');
}
