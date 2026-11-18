// Bu Romlah: 47, pemilik warung seafood terbesar Pantai Lintang (segmen 33). Gemuk, celemek bunga-bunga, rambut dicepol
// dan diikat kain, gelang emas banyak, suara keras. Galak ke pelayan, baik ke anak sekolah. Dibangun di atas spawn_base, voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  warung: { name: 'Warung: cepol diikat kain merah + daster ungu + celemek bunga + sandal, gelang emas, sutil' },
  pasar: { name: 'Belanja ke TPI: cepol + blus batik + rok panjang + sandal, keranjang ikan' },
};
export const EXPRS = EX;
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'warung';
  const d = gen(0, { sex: 'P', age: 'dewasa', skin: 2, build: 'gempal', hairCol: 'hitam', hair: ['sanggul'], salt: 371 });
  d.face = { skull: 'bulat', eyes: 'tajam', brow: 'tebal', mouth: 'lebar', kumis: null, jenggot: false, kacamata: null, blush: true, hidung: 'lebar' };
  d.fx = {
    head: v => v.each((x, y, z, k) => { if (k && k.startsWith('spRmb_') && x <= -8 && x >= -10 && z >= 9 && z <= 15) v.set(x, y, z, (z + y) % 3 ? 'spC_merah' : 'spC_merahS'); }),   // kain pengikat cepol
    fore: (v, dd, G) => { for (const z of [G.hz[1] + 1, G.hz[1] + 3]) v.shell(z, G.ax[0] - 1, G.ay[0] - 1, G.ax[1] + 1, G.ay[1] + 1, 'spEmas', 2); },   // gelang emas
  };
  if (o === 'pasar') { d.top = { kind: 'blus', c: 'coklat', pat: 'batik', pc: 'kuning', sleeve: 'pendek' }; d.bot = { kind: 'rok', c: 'coklat', pat: 'batik', pc: 'kuning' }; d.handR = 'keranjang'; }
  else { d.top = { kind: 'daster', c: 'ungu', sleeve: 'pendek' }; d.bot = { kind: 'rok', c: 'ungu' }; d.acc.push('celemek'); d.apronCol = 'pinkPersit'; d.apronPat = 'bunga'; d.apronPc = 'merah'; d.apronPocket = true; d.handR = 'sutil'; }
  d.feet = { kind: 'sandal', c: 'coklat' };
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'pink'; }
  return orang(d, opt.expr || 'biasa');
}
