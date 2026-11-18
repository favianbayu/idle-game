// Pak Sudarmaji: 54, petugas pintu air Bendungan Sirnagalih (segmen 33). Gemuk pendek, kemeja dinas PU kusam, helm proyek
// kuning, sepatu bot karet, buku catatan basah. Jujur tapi penakut. Dibangun di atas spawn_base, voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  dinas: { name: 'Jaga pintu air: helm proyek kuning + kemeja dinas khaki kusam + celana gelap + bot karet, buku catatan' },
  hujan: { name: 'Jaga hujan: helm kuning + jas hujan biru + bot karet, senter' },
  rumah: { name: 'Rumah dinas: kaus oblong putih + sarung kotak + sandal, mug kopi' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'dinas';
  const d = gen(0, { sex: 'L', age: 'dewasa', skin: 2, build: 'gempal', hairCol: 'hitam', hair: ['belah'], salt: 351 });
  d.face = { skull: 'bulat', eyes: 'lelah', brow: 'tipis', mouth: 'kecil', kumis: 'tebal', jenggot: false, kacamata: null, blush: false, hidung: 'lebar' };
  d.fx = { head: v => { for (const y of [-6, -5, 4, 5]) { const x = v.front(y, 13); if (x !== null && (v.get(x, y, 13) || '').startsWith('spRmb_')) v.set(x, y, 13, 'spRmb_abu'); } } };   // uban di pelipis
  if (o === 'rumah') { d.top = { kind: 'kaus', c: 'putih' }; d.bot = { kind: 'sarung', c: 'coklat', pat: 'kotak', pc: 'krem' }; d.feet = { kind: 'sandal', c: 'hitam' }; d.handR = 'mug'; }
  else {
    d.head = 'helmProyek'; d.headCol = 'kuning';
    d.top = o === 'hujan' ? { kind: 'jaket', c: 'biru', c2: 'biru', sleeve: 'panjang' } : { kind: 'pns', c: 'khakiPNS', sleeve: 'pendek', tuck: true };
    d.bot = { kind: 'celana', c: o === 'hujan' ? 'biru' : 'coklatPol', belt: o !== 'hujan' }; d.feet = { kind: 'bot', c: 'karet' };
    d.handR = o === 'hujan' ? 'senter' : 'buku'; d.propCol = 'biru';
  }
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'hitam'; }
  return orang(d, opt.expr || 'biasa');
}
