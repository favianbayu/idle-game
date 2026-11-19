// Mandor Sabar: 52, mandor pabrik teh tua dan kebun teh Sukamekar (segmen 33). Topi koboi anyaman, kemeja lengan panjang
// lusuh, sepatu bot, peluit di leher. Sabar, lambat bicara, hafal semua pemetik. Dibangun di atas spawn_base, voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  kebun: { name: 'Kebun: topi koboi anyaman + kemeja lengan panjang krem lusuh + celana cokelat + bot, peluit di leher' },
  kerja: { name: 'Kerja: topi koboi anyaman + kemeja lengan panjang lusuh (tidak digulung) + celana cokelat + sepatu bot, peluit di leher' },
  pabrik: { name: 'Pabrik teh: topi koboi + kemeja + rompi khaki + bot, papan catatan timbang' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'kebun';
  const d = gen(0, { sex: 'L', age: 'dewasa', skin: 3, build: 'sedang', hairCol: 'abu', hair: ['cepak'], salt: 391 });
  d.face = { skull: 'oval', eyes: 'sayu', brow: 'tipis', mouth: 'senyum', kumis: 'tebal', jenggot: false, kacamata: null, blush: false, hidung: 'lebar' };
  d.tegak = true; d.head = 'koboi';
  d.top = { kind: 'kerja', c: 'krem', sleeve: 'panjang', gulung: o !== 'kerja', pat: o === 'kerja' ? 'kotor' : 'kotak', pc: 'coklatMuda', rompi: o === 'pabrik' ? 'khaki' : null };
  d.bot = { kind: 'celana', c: 'coklat', belt: true }; d.feet = { kind: 'bot', c: 'hitam' };
  d.acc.push('peluit');
  if (o === 'pabrik') d.handR = 'papan';
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'hitam'; }
  return orang(d, opt.expr || 'biasa');
}
