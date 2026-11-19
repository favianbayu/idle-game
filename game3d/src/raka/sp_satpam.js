// Template spawn: satpam tanpa nama (pabrik, bank, mal, kompleks). Satpam Udin & Bambang tetap file sendiri. Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'satpamAcak', name: 'Satpam', seragam: 'jaga', varian: 64 };
export const OUTFITS = {
  jaga: { name: 'Jaga: kemeja putih + celana biru dongker + topi pet + sabuk + sepatu PDH + HT, senter' },
  malam: { name: 'Jaga malam: seragam hitam + jaket + topi, senter' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', pP: 0.15, age: ['dewasa', 'dewasa', 'muda'], hair: ['cepakTipis', 'cepak'], kumisP: 0.4, jenggotP: 0, salt: 151 }), r = d.r, L = d.sex === 'L';
  if (!L) { d.hairStyle = 'sanggul'; if (r.p(0.5)) d.hijab = 'navy'; }
  if (o === 'malam') { d.top = { kind: 'jaket', c: 'hitam', c2: 'hitam', logo: 'kuning' }; d.bot = { kind: 'celana', c: 'hitam' }; d.handR = 'senter'; }
  else { d.top = { kind: 'kemeja', c: 'putih', sleeve: 'pendek', tuck: true, badge: true, badgeArm: 'navy' }; d.bot = L ? { kind: 'celana', c: 'navy', belt: true } : { kind: 'rok', c: 'navy' }; d.handR = r.pick(['ht', null, 'senter']); }
  d.feet = { kind: 'sepatu', c: 'hitam' }; if (!d.hijab) { d.head = 'topi'; d.headCol = o === 'malam' ? 'hitam' : 'navy'; }
  d.acc.push('ht');
  return d;
});
