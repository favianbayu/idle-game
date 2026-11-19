// Template spawn: guru tanpa nama (12 guru di segmen 84). Seragam ikut hari: PNS Senin-Selasa, batik Kamis-Jumat. Guide segmen 34.
import { gen, template, EXPRS as EX } from './spawn_base.js';
export const SPAWN = { sid: 'guruAcak', name: 'Guru', seragam: 'pns', varian: 64 };
export const OUTFITS = {
  pns: { name: 'PNS (Senin-Selasa): seragam khaki + lencana + celana/rok cokelat tua + sepatu, map atau buku' },
  batik: { name: 'Batik (Kamis-Jumat): kemeja/blus batik lengan panjang + celana/rok gelap' },
  bebas: { name: 'Bebas (Rabu): kemeja/blus polos + celana/rok bahan + kardigan atau tas' },
};
export const EXPRS = EX;
export const build = template(SPAWN, OUTFITS, (v, o) => {
  const d = gen(v, { sex: 'LP', age: ['dewasa', 'dewasa', 'dewasa', 'lansia'], build: ['kurus', 'sedang', 'sedang', 'gempal'], kacamataP: 0.4, salt: 127 }), r = d.r, L = d.sex === 'L';
  if (!L && r.p(0.6)) d.hijab = o === 'pns' ? r.pick(['coklat', 'krem', 'coklatMuda']) : r.pick(['hitam', 'navy', 'mocca', 'marun', 'krem', 'hijauTua']);
  if (L && d.hairStyle === 'gondrong') d.hairStyle = 'belah';
  const bot = c => L ? { kind: 'celana', c, belt: true } : r.p(0.7) ? { kind: 'rok', c } : { kind: 'celana', c };
  if (o === 'pns') { d.top = { kind: 'pns', c: 'khakiPNS', sleeve: L ? r.pick(['pendek', 'panjang']) : 'panjang', tuck: L, badge: true, badgeArm: 'kuning' }; d.bot = bot('coklat'); }
  else if (o === 'batik') { d.top = { kind: L ? 'kemeja' : 'blus', c: r.pick(['coklat', 'navy', 'marun', 'hijauTua', 'kopi', 'ungu']), pat: 'batik', pc: r.pick(['kuning', 'krem', 'coklatMuda']), sleeve: 'panjang' }; d.bot = bot(r.pick(['hitam', 'navy', 'coklat'])); }
  else { d.top = { kind: L ? 'kemeja' : 'blus', c: r.pick(['putih', 'biruMuda', 'krem', 'abuMuda', 'mint', 'salem', 'lilac']), sleeve: 'panjang', tuck: L && r.p(0.6) }; d.bot = bot(r.pick(['hitam', 'abu', 'navy', 'coklat'])); }
  d.feet = { kind: 'sepatu', c: r.pick(['hitam', 'coklat']) };
  d.handR = r.pick(['map', 'buku', 'tasTangan', null]); d.propCol = r.pick(['biru', 'merah', 'hijau', 'kuning', 'coklat']);
  if (!L && d.handR === null) { d.handR = 'tasTangan'; d.propCol = r.pick(['coklat', 'hitam']); }
  if (r.p(0.3)) d.acc.push('idcard'); d.idCol = 'biru';
  return d;
});
