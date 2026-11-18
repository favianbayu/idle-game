// Pak Pras (Prasetyo): ayah Bimo, penjual bakso gerobak di depan SMA 3 sore hari (segmen 31). 40-an, gempal seperti Bimo,
// rambut ikal tebal mulai beruban, kumis tebal, mata ramah, senyum lebar. "Bakso! Temennya Bimo gratis kuahnya."
// Dibangun di atas spawn_base (gaya & rangka sama), voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  jualan: { name: 'Jualan: topi pet + kaus oblong krem + handuk di leher + celana kain + sandal jepit, mangkok bakso' },
  rumah: { name: 'Rumah: singlet putih + sarung kotak + peci, HP di tangan' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'jualan';
  const d = gen(0, { sex: 'L', age: 'dewasa', skin: 2, build: 'gempal', hairCol: 'coklatTua', hair: ['ikal'], salt: 307 });
  d.face = { skull: 'bulat', eyes: 'ramah', brow: 'tebal', mouth: 'senyum', kumis: 'tebal', jenggot: false, kacamata: null, blush: false, hidung: 'lebar' };
  d.fx = { head: v => v.each((x, y, z, k) => { const h = ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0; if (k === 'spRmb_coklatTua' && (Math.abs(y + 0.5) > 6 || z < 12) && h % 3 === 0) v.set(x, y, z, 'spRmb_abu'); }) };   // uban di pelipis & samping
  if (o === 'rumah') {
    d.head = 'peci'; d.top = { kind: 'singlet', c: 'putih', sleeve: 'tanpa' };
    d.bot = { kind: 'sarung', c: 'hijauTua', pat: 'kotak', pc: 'kuning' }; d.feet = { kind: 'jepit', c: 'hitam' }; d.handR = 'hp';
  } else {
    d.head = 'topi'; d.headCol = 'merah';
    d.top = { kind: 'kaus', c: 'krem', logo: 'merah' }; d.acc.push('handuk');
    d.bot = { kind: 'celana', c: 'coklat' }; d.feet = { kind: 'jepit', c: 'biru' }; d.handR = 'mangkok';
  }
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'merah'; }
  return orang(d, opt.expr || 'biasa');
}
