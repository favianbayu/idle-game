// Template spawn: polisi tanpa nama (Pak Sugeng tetap file sendiri). Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'polisi', name: 'Polisi', seragam: 'polantas', varian: 64 };
export const OUTFITS = {
  polantas: { name: 'Polantas: seragam cokelat + rompi hijau stabilo + helm putih + sabuk putih + sepatu, tongkat lalu lintas & peluit' },
  sabhara: { name: 'Sabhara: seragam cokelat + topi pet + sabuk + sepatu PDH, HT' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', pP: 0.2, age: 'dewasa', build: ['sedang', 'sedang', 'gempal'], hair: ['cepakTipis', 'cepak'], kumisP: 0.4, jenggotP: 0, kacamataP: 0.05, salt: 149 }), r = d.r, L = d.sex === 'L';
  if (!L) { d.hairStyle = 'sanggul'; if (r.p(0.5)) d.hijab = 'coklat'; }
  d.top = { kind: 'kemeja', c: 'coklatPol', sleeve: L ? 'pendek' : 'panjang', tuck: true, badge: true, badgeArm: 'kuning' };
  d.bot = L ? { kind: 'celana', c: 'coklatPol', belt: true } : { kind: 'rok', c: 'coklatPol' }; d.feet = { kind: 'sepatu', c: 'hitam' };
  if (o === 'polantas') { d.top.rompi = 'stabilo'; d.top.stripe = 'putih'; if (!d.hijab) { d.head = 'helmMotor'; d.headCol = 'putih'; } d.acc.push('peluit'); d.handR = 'tongkatLL'; }
  else { if (!d.hijab) { d.head = 'topi'; d.headCol = 'coklatPol'; } d.acc.push('ht'); }
  return d;
});
