// Abah Karta: 71 tahun, kakek Wulan, guru perguruan silat Kembang Teh di Desa Sukamekar (segmen 33). Pendek, punggung
// masih tegak, kulit gelap terbakar matahari, rambut putih disisir ke belakang, kumis putih tipis, ikat kepala batik
// cokelat, pangsi hitam pudar, telapak tangan tebal. Dibangun di atas spawn_base (gaya & rangka sama), voxel 1/64 petak.
import { gen, orang, EXPRS as EX } from './spawn_base.js';
export const OUTFITS = {
  pangsi: { name: 'Latihan: iket batik cokelat + pangsi hitam pudar + sabuk hijau kehormatan + nyeker' },
  kebun: { name: 'Kebun: caping + kaus lusuh lengan panjang + celana pangsi digulung + sandal jepit + arit' },
  teras: { name: 'Malam di teras: peci + kemeja koko krem + sarung kotak + sandal' },
};
export const EXPRS = EX;
function desc(o) {
  const d = gen(0, { sex: 'L', age: 'lansia', skin: 4, build: 'kurus', hairCol: 'putih', hair: ['klimis'], kumisP: 1, jenggotP: 0, kacamataP: 0, salt: 301 });
  d.face = { skull: 'kotak', eyes: 'tajam', brow: 'tebal', mouth: 'datar', kumis: 'tipis', jenggot: false, kacamata: null, blush: false, hidung: 'lebar' };
  d.tegak = true;
  d.fx = {
    head: v => { for (const [x, y, z] of [[7, -6, 8], [7, 5, 8], [7, -6, 7], [7, 5, 7]]) if (v.get(x, y, z) === 'spKulit4') v.set(x, y, z, 'spKulit4S'); },   // kerut ujung mata
    fore: (v, dd, G) => { v.rrect(G.fist, G.ax[0] + 1, G.ay[0], G.ax[1] + 1, G.ay[1], 'spKulit4', 1); },   // telapak tebal
  };
  if (o === 'kebun') {
    d.head = 'caping'; d.top = { kind: 'kaus', c: 'abu', sleeve: 'panjang', pat: 'kotor' };
    d.bot = { kind: 'gulung', c: 'hitamPudar' }; d.feet = { kind: 'jepit', c: 'hitam' }; d.handR = 'arit'; return d;
  }
  if (o === 'teras') {
    d.head = 'peci'; d.top = { kind: 'koko', c: 'krem', sleeve: 'panjang' };
    d.bot = { kind: 'sarung', c: 'coklat', pat: 'kotak', pc: 'krem' }; d.feet = { kind: 'sandal', c: 'coklat' }; return d;
  }
  d.head = 'ikatKepala'; d.headCol = 'coklat'; d.headPat = 'krem';
  d.top = { kind: 'pangsi', c: 'hitamPudar', sleeve: 'panjang', tuck: true };
  d.bot = { kind: 'celana', c: 'hitamPudar' }; d.feet = { kind: 'nyeker' };
  d.acc.push('sabuk'); d.sabukCol = 'hijauTua';
  return d;
}
export function build(opt = {}) {
  const o = OUTFITS[opt.outfit] ? opt.outfit : 'pangsi', d = desc(o);
  if (opt.helm) { d.head = 'helmMotor'; d.headCol = 'hitam'; }
  return orang(d, opt.expr || 'biasa');
}
