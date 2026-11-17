// Om Darto: paman pemain, pemilik Warkop Simpang, mantan anak Lampu Kota. 42 tahun, gempal, perut buncit, rambut cepak
// beruban di samping, kumis tebal, tato bunga kecil pudar di lengan bawah. Kaus oblong belel, sarung di pundak, sandal
// jepit; saat kerja celemek hijau Warkop Simpang. Rangka keluarga Arga (skala 1.32), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 10.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 7, ballR: 1.05 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  daSkin: ['#8e5a3a', '#a86e48', '#c48a60', '#d49c72'], daSkinS: ['#a87050'], tatoD: ['#4a6a7a'],
  daHair: ['#141010', '#1e1a18', '#2a2420', '#3a322c'], daUban: ['#8a8680', '#a29e98', '#bab6ae', '#cfcbc4'], kumis: ['#141010'],
  oblong: ['#b8b2a2', '#cac4b4', '#dad4c4', '#e6e0d2'], oblongS: ['#a8a090'], celemek: ['#2a5a34', '#326a3e', '#3c7a48', '#50905c'], celemekT: ['#e8dcb0'],
  sarungD: ['#6a2a2a', '#7e3434', '#943e3e', '#aa5050'], sarungDS: ['#3a1818'], sarungDK: ['#d8b860'],
  celanaD: ['#2e2e34', '#38383e', '#424248', '#56565e'], kutang: ['#d8d4cc', '#e6e2da', '#f2eee6', '#faf8f2'], jepitD: ['#3a2a20', '#4a3628', '#5a4434', '#6e5644'],
});

/* ---------- wajah: alis tebal 2 baris + 1 baris jarak, mata ramah agak sipit (garis tawa di ujung), kumis tebal tepat
   di bawah hidung, mulut di bawah kumis */
const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', k: 'kumis', m: 'mouth', T: 'teeth', t: 'tongue', s: 'daSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, ...brow, F0, ...eyes, F0, F0, F0, ...mouth, F0];   // 15 baris: kumis z 4..3 tepat di bawah hidung, mulut z 2
const BROW = ['.BBBB....BBBB.', '.BBBB....BBBB.'];
const EYE = ['s.KKK....KKK.s', '..WKK....KKW..'];
const KUMIS = ['....kkkkkk....', '...kkkkkkkk...'];
export const FACES = {
  biasa: F(BROW, EYE, [...KUMIS, '.....mmmm.....', F0]),
  kedip: F(BROW, [F0, '.KKKK....KKKK.'], [...KUMIS, '.....mmmm.....', F0]),
  marah: F(['..BBB....BBB..', '....BB..BB....'], EYE, [...KUMIS, '....mmmmmm....', F0]),
  teriak: F(['..BBB....BBB..', '....BB..BB....'], EYE, [...KUMIS, '....mTTTTm....', '.....mttm.....']),
  nyengir: F(BROW, EYE, [...KUMIS, '...mTTTTTTm...', '....mmmmmm....']),
  ketawa: F(BROW, ['s.KK......KK.s', '.K..K....K..K.'], [...KUMIS, '...mTTTTTTm...', '....mttttm....']),
  sakit: F(['...BB....BB...', '.BB........BB.'], ['.KK........KK.', '...KK....KK...'], [...KUMIS, '....mmmmmm....', F0]),
};
export const EXPRS = Object.keys(FACES);

const rnd = (x, y, z) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
// kepala bulat lebar dengan pipi tembam
const skull = z => z <= 0 ? [-4, -6, 5, 5, 3] : z === 1 ? [-6, -7, 6, 6, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'daSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'daSkin'); v.box(7, -2, 5, 7, 1, 5, 'daSkin'); v.set(7, -1, 4, 'daSkinS');   // hidung lebar
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'daSkin'); v.box(-1, y, 6, -1, y, 7, 'daSkinS'); }
  // cepak: lapis tipis rata, uban di samping & belakang bawah
  const hair = new Vox();
  for (let z = 6; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'daHair', 4);
  hair.rrect(16, -6, -6, 5, 5, 'daHair', 4);
  const zmin = (x, y) => x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 6;
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= zmin(x, y)) v.set(x, y, z, c); });
  v.each((x, y, z, c) => { if (c === 'daHair' && z <= 12 && (Math.abs(y + 0.5) > 6.5 || x <= -7)) v.set(x, y, z, rnd(x, y, z) % 7 ? 'daUban' : 'daHair'); });   // uban rata di samping & belakang
  v.each((x, y, z, c) => { if (c === 'daHair' && z === 13 && (Math.abs(y + 0.5) > 6.5 || x <= -7) && rnd(x, y, z) % 2) v.set(x, y, z, 'daUban'); });
  return v;
}

/* ---------- badan gempal + perut buncit (sisi +y; sisi -y = cermin) */
function chest(o) {
  const v = new Vox(), T = o.top, body = T === 'kutang' ? 'kutang' : 'oblong';
  for (let z = 34; z <= 56; z++) {   // lebar rata (gempal), perut membuncit ke depan di bawah
    const bel = z > 50 ? 0 : Math.round(5 * Math.sin((z - 31) / 20 * Math.PI)), t = z === 56 ? 1 : 0;
    v.rrect(z, -6, -9 + t, 4 + bel - t, 8 - t, body, z >= 55 ? 4 : 4);
  }
  v.rbox(-3, -3, 57, 2, 2, 60, 'daSkin', 2);
  if (T === 'kutang') {   // kaus kutang: lubang lengan lebar, kerah U dalam
    for (let z = 49; z <= 56; z++) for (let y = -9; y <= 8; y++) { if (Math.abs(y + 0.5) < 2.5 || Math.abs(y + 0.5) > 5.5) { const x = v.front(y, z); if (x !== null) v.set(x, y, z, 'daSkin'); const xb = v.back(y, z); if (xb !== null && Math.abs(y + 0.5) > 5.5) v.set(xb, y, z, 'daSkin'); } }
    v.each((x, y, z, c) => { if (c === 'kutang' && z >= 50 && Math.abs(y + 0.5) > 6.5) v.set(x, y, z, 'daSkin'); });
    return v;
  }
  for (let y = -2; y <= 1; y++) v.pf(y, 56, 'daSkin');
  v.shell(57, -4, -4, 3, 3, 'oblong', 2);
  v.each((x, y, z, c) => { if (c === 'oblong' && rnd(x, y, z) % 13 === 0) v.set(x, y, z, 'oblongS'); });   // belel
  v.pb(3, 44, 'daSkin'); v.pb(4, 44, 'daSkin');   // bolong kecil di punggung
  if (o.apron) {   // celemek hijau Warkop Simpang: tali leher, tulisan KOPI dua baris
    for (let z = 34; z <= 51; z++) for (let y = -5; y <= 4; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'celemek'); }
    for (const y of [-4, 3]) for (let z = 52; z <= 57; z++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'celemek'); }
    const G = { K: ['X.X', 'XX.', 'X.X'], O: ['XXX', 'X.X', 'XXX'], P: ['XX', 'XX', 'X.'], I: ['X', 'X', 'X'] };
    [['KO', 48, -4], ['PI', 44, -2]].forEach(([w, z0, y0]) => { let y = y0; for (const ch of w) { G[ch].forEach((row, r) => [...row].forEach((k, c) => { if (k === 'X') v.pf(y + c, z0 - r, 'celemekT'); })); y += G[ch][0].length + 1; } });
    for (let y = -2; y <= 1; y++) v.pf(y, 39, 'celemekT');   // gambar cangkir
    v.pf(-2, 38, 'celemekT'); v.pf(1, 38, 'celemekT'); v.pf(-1, 37, 'celemekT'); v.pf(0, 37, 'celemekT'); v.pf(2, 39, 'celemekT');
  }
  if (o.sarungBahu) {   // sarung terlipat disampirkan di pundak kiri (sisi -y), menjuntai di depan & belakang
    for (let z = 44; z <= 59; z++) for (let y = -10; y <= -5; y++) {
      const xf = v.front(y, Math.min(z, 56)), xb = v.back(y, Math.min(z, 56));
      if (z <= 56 && xf !== null) for (const k of [1, 2]) { v.set(xf + k, y, z, 'sarungD'); v.set(xb - k, y, z, 'sarungD'); }
      if (z >= 57 && z <= 59 && xf !== null) for (let x = xb - 2; x <= xf + 2; x++) v.set(x, y, z, 'sarungD');
    }
    v.each((x, y, z, c) => { if (c === 'sarungD' && (z % 4 === 0 || (y + 40) % 3 === 0)) v.set(x, y, z, z % 8 === 0 ? 'sarungDK' : 'sarungDS'); });
  }
  return v;
}
function pelvis(o) {
  if (o.bot === 'sarung') { const v = plaid(skirtPelvis('sarungD', 'sarungDS', 22)); for (let z = 31; z <= 33; z++) v.shell(z, -7, -9, 6, 8, 'sarungD', 3); v.rbox(2, -3, 30, 7, 2, 34, 'sarungD', 2); return plaid(v); }
  const c = legC(o), v = new Vox();
  v.rbox(-6, -8, 28, 5, 7, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  for (let z = 32; z <= 33; z++) v.shell(z, -6, -8, 6, 7, 'belt', 3);
  for (let z = 31; z <= 33; z++) v.shell(z, -7, -10, 6 + (z - 30), 9, 'oblong', 4);   // kaus menggantung di bawah perut
  if (o.apron) for (let z = 26; z <= 33; z++) for (let y = -5; y <= 4; y++) { const x = v.front(y, z); if (x !== null) v.set(x + 1, y, z, 'celemek'); }
  return v;
}
const plaid = v => { v.each((x, y, z, c) => { if (c === 'sarungD' && (z % 4 === 0 || (y + 40) % 4 === 0)) v.set(x, y, z, z % 8 === 0 && (y + 40) % 8 < 4 ? 'sarungDK' : 'sarungDS'); }); return v; };
const legC = o => ({ pendek: 'celanaD', panjang: 'celanaD', sarung: 'sarungD' }[o.bot]);
const sleeveC = o => o.top === 'kutang' ? 'daSkin' : 'oblong';
function arm(o) {
  const v = new Vox(), c = sleeveC(o);
  v.rbox(-3, 8, 43, 3, 14, 55, 'daSkin', 3); v.rrect(56, -3, 8, 3, 14, c, 3);   // lengan tebal
  if (o.top !== 'kutang') { v.paint(-3, 8, 49, 3, 14, 56, c); v.shell(49, -4, 8, 4, 15, c, 3); }
  return v;
}
function fore(o, side) {
  const v = new Vox();
  v.rbox(-3, 8, 31, 3, 14, 42, 'daSkin', 3);
  v.rbox(-3, 8, 27, 4, 14, 30, 'daSkin', 3); v.rrect(26, -2, 9, 3, 13, 'daSkin', 2);
  if (side > 0) for (const [x, y, z] of [[3, 11, 36], [3, 10, 37], [3, 12, 37], [3, 11, 38], [3, 11, 37], [3, 11, 35], [3, 12, 34]]) v.set(x, y, z, z === 37 && y === 11 ? 'daSkinS' : 'tatoD');   // tato bunga pudar
  return v;
}
function thigh(o) {
  if (o.bot === 'sarung') return plaid(skirtThigh('sarungD'));
  const c = legC(o), v = new Vox();
  v.rbox(-5, 2, 18, 4, 8, 31, c, 3); v.rrect(32, -4, 2, 3, 8, c, 3);
  if (o.bot === 'pendek') v.paint(-5, 2, 18, 4, 8, 21, 'daSkin');
  return v;
}
function shin(o) {
  if (o.bot === 'sarung') return plaid(skirtShin('sarungD', 'sarungDS'));
  const c = o.bot === 'pendek' ? 'daSkin' : legC(o), v = new Vox();
  v.rbox(-4, 2, 6, 3, 7, 18, c, 3); v.rrect(19, -3, 2, 2, 7, c, 3);
  return v;
}
function foot() {   // sandal jepit cokelat, jari kaki kelihatan
  const v = new Vox();
  v.rbox(-4, 1, 0, 7, 8, 0, 'jepitD', 2); v.rbox(-3, 2, 1, 6, 7, 2, 'daSkin', 2); v.rbox(-3, 2, 3, 2, 7, 5, 'daSkin', 2);
  for (const [x, y] of [[5, 4], [4, 3], [4, 5], [3, 2], [3, 6], [2, 2], [2, 7]]) v.set(x, y, 2, 'jepitD');
  return v;
}

export const OUTFITS = {
  kerja: { name: 'Jaga warkop: kaus oblong belel + celemek hijau + celana panjang + sandal jepit', top: 'oblong', bot: 'panjang', apron: true },
  santai: { name: 'Santai: kaus oblong + sarung di pundak + celana pendek', top: 'oblong', bot: 'pendek', sarungBahu: true },
  rumah: { name: 'Di rumah: kaus kutang + sarung', top: 'kutang', bot: 'sarung' },
};
export function build(opt = {}) {
  // game memanggil 'seragam': Om Darto memakai baju kerja warkop
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.kerja), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = sleeveC(o), leg = legC(o);
  const sar = o.bot === 'sarung', panel = s => sar ? plaid(skirtPanel('sarungD', 'sarungDS', s, 5)) : null;
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'daSkin', shoulder: sl, elbow: 'daSkin', hip: leg, knee: o.bot === 'pendek' ? 'daSkin' : leg }, SKEL, TAIL);
  if (sar) P.skirt = skirtInfo(P, 'sarungD', 'sarungDS');
  return P;
}
