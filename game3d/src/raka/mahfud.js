// Kyai Mahfud Sastrowiryo: 63, pengasuh Pesantren Darul Falah di Desa Tegalsari, cucu Ki Sastro Wiryo (segmen 33).
// Kurus tinggi, janggut putih pendek, kacamata bulat berbingkai emas, peci hitam, koko putih, sarung kotak hijau,
// tasbih kayu, pena selalu di saku. Dibangun di atas spawn_base (gaya & rangka sama), voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  koko: { name: 'Harian: peci hitam + koko putih + sarung kotak hijau + sandal, tasbih kayu, pena di saku' },
  mengajar: { name: 'Mengajar: peci + koko krem + sarung hijau tua + kitab di tangan' },
  pasar: { name: 'Ke pasar hewan: peci + koko putih + payung hitam + tasbih' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'koko';
  const d = gen(0, { sex: 'L', age: 'lansia', skin: 1, build: 'kurus', hairCol: 'putih', hair: ['cepak'], salt: 331 });
  d.face = { skull: 'oval', eyes: 'ramah', brow: 'tipis', mouth: 'senyum', kumis: 'tipis', jenggot: true, kacamata: 'emas', blush: false, hidung: 'kecil' };
  d.tegak = true; d.head = 'peci';
  d.fx = { chest: (v, dd, G) => { const nz = G.cz[1], y = G.ch[3] - 3; for (let z = nz - 12; z <= nz - 7; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, z === nz - 7 ? 'spEmas' : 'spHP'); } } };   // pena di saku kiri
  d.top = { kind: 'koko', c: o === 'mengajar' ? 'krem' : 'putih', sleeve: 'panjang' };
  d.bot = { kind: 'sarung', c: o === 'mengajar' ? 'hijauTua' : 'hijau', pat: 'kotak', pc: o === 'mengajar' ? 'hijau' : 'hijauTua' };
  d.feet = { kind: 'sandal', c: 'coklat' };
  if (o === 'mengajar') { d.handR = 'buku'; d.propCol = 'hijauTua'; }
  else if (o === 'pasar') { d.handR = 'payung'; d.propCol = 'hitam'; d.handL = 'tasbih'; }
  else d.handR = 'tasbih';
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'hitam'; }
  return orang(d, opt.expr || 'biasa');
}
