// Pak Ujang: penjaga sekolah SMA 3, 67 tahun, kakek Arga. Kurus, kulit sawo matang gelap berkerut, rambut putih pendek,
// kumis & janggut tipis putih, topi pet abu, kaus abu, celana kain, sandal kulit, sapu lidi, serenceng kunci di pinggang.
// Rangka keluarga Arga (skala 1.24 lama, dibulatkan ke rangka cowok sedang supaya geraknya sama), voxel 1/64 petak.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, paintFace } from './model.js';

export const SKEL = { ank: 4.5, shin: 13.5, thigh: 14, up: 4, neck: 24, shY: 9.5, shZ: 17, upper: 10.5, fore: 12, hipY: 4.5, flap: 6, ballR: 1 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  ujSkin: ['#7e5232', '#94623e', '#a8724c', '#ba845c'], ujSkinS: ['#8a5a38'], ujUban: ['#b8b4ac', '#cecac2', '#e0ddd6', '#eeece6'], ujKumis: ['#8e8a82'],
  petU: ['#4a4a46', '#585854', '#666660', '#76766e'], petUS: ['#383834'],
  kausU: ['#8a8a86', '#9a9a96', '#aaaaa6', '#bcbcb8'], kausUS: ['#727270'],
  celanaU: ['#3a3226', '#463c2e', '#524636', '#625440'], sandalU: ['#3a2618', '#4a3220', '#5a3e28', '#6e4e34'],
  lidi: ['#b89a5a', '#c8aa68', '#d8bc7a', '#e6cc8c'], lidiT: ['#7a5a2a'], kunciU: ['#9a9aa2', '#b0b0b8', '#c4c4cc', '#d8d8de'], kunciUG: ['#c8a040'],
  dinasU: ['#4e5e3e', '#5a6c48', '#687c52', '#788c60'], dinasUS: ['#3a4630'], dinasUK: ['#d8c060'],
  pecU: ['#0e0e12', '#16161a', '#1e1e24', '#2c2c34'], sarungU: ['#4a2a2a', '#5a3232', '#6c3c3c', '#7e4848'], sarungUS: ['#2e1818'], sarungUK: ['#c8b080'],
  oblongU: ['#d8d4c8', '#e4e0d4', '#eeeae0', '#f6f4ec'], selopU: ['#2a1c12', '#36241a', '#443022', '#56402e'], gembor: ['#3a7a4a', '#448a54', '#4e9a5e', '#5cac6c'],
});

/* ---------- wajah: alis putih tebal turun di ujung, mata kecil ramah dengan garis kerut, kumis putih tipis, senyum ompong */
const FCH = { B: 'ujUban', K: 'eyeK', W: 'eyeW', m: 'mouth', T: 'teeth', t: 'tongue', s: 'ujSkinS', k: 'ujKumis' };
const F0 = '..............';
const KUMIS = '...kkk..kkk...';
const JANGGUT = '.....kkkk.....';
const F = (brow, eyes, mouth) => [F0, F0, F0, F0, brow, F0, ...eyes, '..s........s..', KUMIS, ...mouth, JANGGUT, F0, F0];   // alis z 10 (di bawah lidah pet), mata z 8..7, kumis z 5, mulut z 4..2, janggut z 1
const BROW = '.BBBB....BBBB.';
const EYE = ['s..KK....KK..s', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....mmmmmm....', F0]),
  kedip: F(BROW, [F0, 's.KKK....KKK.s'], ['....mmmmmm....', F0]),
  marah: F('...BBB..BBB...', ['..KKK....KKK..', '..WKK....KKW..'], ['....mmmmmm....', '....m....m....']),   // "Siapa yang loncat pagar?!"
  teriak: F('..BBB....BBB..', ['..KKK....KKK..', '..KWK....KWK..'], ['....mT.TTm....', '....mttttm....']),
  nyengir: F(BROW, EYE, ['...mT.TT.Tm...', '....mmmmmm....']),   // gigi tinggal beberapa
  ketawa: F(BROW, ['s.KK......KK.s', '.K..K....K..K.'], ['...mT.TT.Tm...', '....mttttm....']),
  sakit: F('.BB........BB.', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....T.TT.T....']),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -5, 5, 4, 2] : z === 1 ? [-5, -6, 6, 5, 2] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'ujSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 7, 'ujSkin'); v.box(8, -1, 5, 8, 0, 5, 'ujSkin'); v.set(7, -1, 5, 'ujSkinS');   // hidung besar
  for (const y of [-8, 7]) { v.box(-2, y, 4, 0, y, 8, 'ujSkin'); v.box(-1, y, 5, -1, y, 7, 'ujSkinS'); }   // telinga besar
  for (const y of [-6, -5, 4, 5]) v.set(v.front(y, 12), y, 12, 'ujSkinS');   // kerut dahi
  // rambut putih cepak tipis
  const hair = new Vox();
  for (let z = 6; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'ujUban', 4);
  hair.rrect(16, -6, -6, 5, 5, 'ujUban', 4);
  hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 14 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 6)) v.set(x, y, z, c); });
  if (o.hat === 'pet') {   // topi pet abu: kubah pipih sedikit lebih lebar dari kepala, lidah pendek ke depan, kancing di puncak
    for (let z = 12; z <= 17; z++) { const r = z <= 15 ? 0 : z - 15; for (let x = -10 + r; x <= 9 - r; x++) for (let y = -9 + r; y <= 8 - r; y++) { const d = ((x + 0.5) / (9.6 - r)) ** 2 + ((y + 0.5) / (8.8 - r)) ** 2; if (d <= 1 && (d > 0.6 || z >= 16)) v.set(x, y, z, z === 12 ? 'petUS' : 'petU'); } }
    v.each((x, y, z, c) => { if (c === 'ujUban' && z >= 12) v.set(x, y, z, null); });
    for (let x = 9; x <= 11; x++) for (let y = -6; y <= 5; y++) if (Math.abs(y + 0.5) <= 6 - (x - 9) * 1.5) v.set(x, y, 12, x === 11 ? 'petUS' : 'petU');
    v.set(-1, -1, 18, 'petUS'); v.set(-1, 0, 18, 'petUS');
    for (let x = -9; x <= 8; x += 3) for (const y of [-9, 8]) if (v.has(x, y, 14)) v.set(x, y, 14, 'petUS');   // jahitan samping
  }
  if (o.hat === 'peci') {   // peci hitam sore hari
    for (let z = 13; z <= 19; z++) for (let x = -9; x <= 8; x++) for (let y = -9; y <= 8; y++) { const d = ((x + 0.5) / 8.6) ** 2 + ((y + 0.5) / 8.3) ** 2; if (d <= 1 && (d > 0.62 || z >= 18)) v.set(x, y, z, 'pecU'); }
    for (let x = -8; x <= 7; x++) for (let y = -8; y <= 7; y++) if (((x + 0.5) / 8.6) ** 2 + ((y + 0.5) / 8.3) ** 2 <= 1) for (let z = 15; z <= 17; z++) if (!v.has(x, y, z)) v.set(x, y, z, 'pecU');
    v.each((x, y, z, c) => { if (c === 'ujUban' && z >= 13) v.set(x, y, z, null); });
  }
  return v;
}

/* ---------- badan kurus agak bungkuk (sisi +y; sisi -y = cermin) */
const bodyC = o => ({ kerja: 'kausU', dinas: 'dinasU', rumah: 'oblongU' }[o.top]);
function chest(o) {
  const v = new Vox(), T = o.top, c = bodyC(o);
  for (let z = 34; z <= 56; z++) { const t = z === 56 ? 1 : 0, hump = z >= 49 ? 1 : 0; v.rrect(z, -5 - hump, -8 + t, 3 - t, 7 - t, c, z >= 55 ? 4 : 3); }   // punggung sedikit membungkuk
  v.rbox(-3, -3, 57, 2, 2, 60, 'ujSkin', 2);
  if (T === 'kerja') {   // kaus abu belel, leher bulat, satu lubang kecil
    for (let y = -3; y <= 2; y++) v.pf(y, 56, 'ujSkin'); v.pf(-2, 55, 'ujSkin'); v.pf(1, 55, 'ujSkin');
    v.pf(4, 41, 'kausUS'); v.pf(5, 41, 'kausUS');
    return v;
  }
  if (T === 'dinas') {   // seragam penjaga sekolah hijau zaitun: kancing, dua saku, papan nama, kerah
    for (let z = 35; z <= 55; z++) v.pf(-1, z, 'dinasUS');
    for (let z = 37; z <= 53; z += 4) v.pf(-1, z, 'dinasUK');
    for (const s of [-1, 1]) for (let yy = 2; yy <= 5; yy++) for (let z = 47; z <= 51; z++) { const y = s > 0 ? yy : -1 - yy; v.pf(y, z, z === 51 ? 'dinasUS' : 'dinasU'); }
    for (let y = -6; y <= -3; y++) v.pf(y, 52, 'oblongU');   // papan nama
    v.pf(3, 53, 'dinasUK'); v.pf(4, 53, 'dinasUK');
    for (let z = 56; z <= 58; z++) v.shell(z, -4, -5, 3, 4, 'dinasU', 2);
    for (let y = -1; y <= 0; y++) for (let z = 55; z <= 56; z++) v.pf(y, z, 'ujSkin');
    return v;
  }
  for (let y = -2; y <= 1; y++) v.pf(y, 56, 'ujSkin');   // rumah: kaus oblong putih tipis
  return v;
}
const legC = o => o.top === 'rumah' ? 'sarungU' : o.top === 'dinas' ? 'dinasU' : 'celanaU';
const kotak = (v, c, cS, cK) => { v.each((x, y, z, k) => { if (k !== c) return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x; if ((u + 40) % 5 === 0 || z % 5 === 0) v.set(x, y, z, (z % 10 === 0 && (u + 40) % 5 === 0) ? cK : cS); }); return v; };
function keys(v) {   // serenceng kunci di pinggang kanan: cincin besar + 5 kunci menjuntai
  for (let k = 0; k <= 7; k++) { const a = k / 8 * Math.PI * 2; v.set(Math.round(Math.cos(a) * 2), 9, 29 + Math.round(Math.sin(a) * 2), 'kunciU'); }
  for (const [x, dz, g] of [[-2, 4, 0], [-1, 5, 1], [0, 6, 0], [1, 5, 1], [2, 4, 0]]) for (let z = 27 - dz; z <= 27; z++) v.set(x, 10, z, g && z === 27 - dz ? 'kunciUG' : 'kunciU');
}
function pelvis(o) {
  const c = legC(o), v = new Vox();
  v.rbox(-5, -7, 28, 4, 6, 33, c, 3); v.box(-4, -2, 26, 3, 1, 27, c);
  if (o.top === 'kerja') { for (let z = 31; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'kausU', 3); v.rbox(-5, -7, 30, 4, 6, 30, 'sandalU', 3); keys(v); }   // kaus dikeluarkan, ikat pinggang
  if (o.top === 'dinas') { v.rbox(-5, -7, 32, 4, 6, 33, 'sandalU', 3); v.pfBox(-1, 32, 0, 33, 'kunciU'); keys(v); }
  if (o.top === 'rumah') { for (let z = 26; z <= 33; z++) v.shell(z, -6, -8, 5, 7, 'sarungU', 3); v.rbox(-6, -8, 32, 5, 7, 33, 'sarungUS', 3); kotak(v, 'sarungU', 'sarungUS', 'sarungUK'); }
  return v;
}
function arm(o) { const v = new Vox(), c = bodyC(o); v.rbox(-3, 7, 43, 2, 11, 55, o.top === 'dinas' ? c : 'ujSkin', 2); v.rrect(56, -3, 7, 2, 11, c, 3); if (o.top !== 'dinas') { v.paint(-3, 7, 49, 2, 11, 56, c); v.shell(49, -4, 6, 3, 12, c, 2); } return v; }
function fore(o, side) {
  const v = new Vox(), D = o.top === 'dinas';
  v.rbox(-3, 7, 31, 2, 11, 42, D ? 'dinasU' : 'ujSkin', 2);
  if (D) v.paint(-3, 7, 31, 2, 11, 31, 'dinasUS');
  v.rbox(-3, 7, 27, 3, 11, 30, 'ujSkin', 2); v.rrect(26, -2, 8, 2, 10, 'ujSkin', 2);
  v.set(3, 8, 35, 'ujSkinS'); v.set(3, 10, 38, 'ujSkinS');   // urat tangan
  if (side > 0 && o.top === 'kerja') {   // sapu lidi: gagang di genggaman, ikatan lidi mengembang ke bawah depan
    for (let z = 22; z <= 33; z++) v.set(1, 9, z, 'lidiT');
    v.rbox(0, 8, 19, 2, 10, 21, 'lidiT', 0);
    for (let z = 4; z <= 18; z++) { const w = Math.round((19 - z) * 0.35); for (let x = 1 - w; x <= 1 + w; x++) for (let y = 9 - Math.ceil(w / 2); y <= 9 + Math.ceil(w / 2); y++) if ((x + y + z) % 2 === 0 || z === 18) v.set(x, y, z, 'lidi'); }
  }
  if (side > 0 && o.top === 'rumah') {   // gembor siram tanaman (bunga almarhumah menantunya)
    v.rbox(-3, 7, 15, 3, 12, 24, 'gembor', 2); for (let x = 4; x <= 8; x++) v.set(x, 9, 20 + (x - 4), 'gembor'); v.box(-1, 9, 25, 1, 10, 26, 'gembor');
  }
  return v;
}
function thigh(o) { const c = legC(o), v = new Vox(); v.rbox(-4, 2, 18, 3, 7, 31, c, 3); v.rrect(32, -3, 2, 2, 7, c, 3); if (o.top === 'rumah') kotak(v, c, 'sarungUS', 'sarungUK'); return v; }
function shin(o) {
  const c = legC(o), v = new Vox();
  if (o.top === 'rumah') { v.rbox(-4, 1, 8, 4, 8, 18, c, 3); v.rrect(19, -4, 1, 3, 8, c, 3); kotak(v, c, 'sarungUS', 'sarungUK'); v.rbox(-2, 3, 5, 2, 6, 7, 'ujSkin', 2); return v; }   // sarung sampai bawah betis
  v.rbox(-4, 2, 6, 3, 7, 18, c, 3); v.rrect(19, -3, 2, 2, 7, c, 3);
  if (o.top === 'kerja') { v.shell(8, -5, 1, 4, 8, c, 3); v.rbox(-3, 3, 5, 2, 6, 7, 'ujSkin', 2); }   // celana digulung
  return v;
}
function foot(o) {
  const v = new Vox();
  if (o.top === 'dinas') { v.rbox(-4, 1, 0, 7, 8, 1, 'sole', 3); v.rbox(-4, 1, 2, 7, 8, 4, 'pecU', 3); v.rbox(-4, 1, 5, 2, 8, 5, 'pecU', 3); return v; }   // sepatu hitam
  v.rbox(-4, 1, 0, 7, 8, 1, 'sandalU', 3); v.rbox(-3, 2, 2, 6, 7, 3, 'ujSkin', 2); v.rbox(-3, 2, 4, 2, 7, 4, 'ujSkin', 2);   // sandal kulit, jari kelihatan
  for (let y = 1; y <= 8; y++) v.set(2, y, 3, 'sandalU');
  return v;
}

export const OUTFITS = {
  kerja: { name: 'Kerja: topi pet + kaus abu + celana kain digulung + sapu lidi + serenceng kunci', top: 'kerja', hat: 'pet' },
  dinas: { name: 'Dinas: seragam penjaga sekolah hijau zaitun + papan nama + kunci', top: 'dinas', hat: 'pet' },
  rumah: { name: 'Sore di rumah: peci + kaus oblong + sarung kotak + gembor', top: 'rumah', hat: 'peci' },
};
export function build(opt = {}) {
  // game memanggil 'seragam': Pak Ujang memakai baju kerja
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.kerja), expr: opt.expr || 'biasa', face: opt.face };
  const A = arm(o), Th = thigh(o), Sn = shin(o), Ft = foot(o), sl = bodyC(o), leg = legC(o);
  return assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['chest', chest(o), PV.chest], ['pelvis', pelvis(o), PV.pelvis],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'ujSkin', shoulder: sl, elbow: o.top === 'dinas' ? sl : 'ujSkin', hip: leg, knee: leg }, SKEL, TAIL);
}
