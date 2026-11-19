// Nyonya Lita: sosialita Perumahan Bukit Asri, teman arisan ibu Sasha, 40-an, sombong halus ("Kamu anak siapa? Oh... anak
// warkop."). Kulit cerah terawat, rambut panjang blow-dry cokelat madu bergelombang besar, alis rapi, bulu mata, lipstik
// merah tua, anting bulat emas besar. Kafe: kacamata hitam lebar + terusan panjang hijau zamrud + tas monogram cokelat +
// gelang emas + hak tinggi. Kondangan: sanggul + kebaya brokat marun + kain batik + clutch emas.
// Rangka keluarga Nadia (sedikit lebih tinggi), voxel 1/64 petak. Rok panjang memakai rok.js supaya tidak terbelah.
import { Vox } from './vox.js';
import { pivots } from './rig.js';
import { addRamps, assemble, dressing, paintFace } from './model.js';
import { skirtPelvis, skirtPanel, skirtThigh, skirtShin, skirtInfo } from './rok.js';

export const SKEL = { ank: 4.5, shin: 13, thigh: 13.5, up: 4, neck: 21, shY: 8, shZ: 15, upper: 10, fore: 9, hipY: 4, flap: 6, ballR: 0.9 };
const PV = pivots(SKEL);
const TAIL = [-5, 0, 1];

addRamps({
  ltSkin: ['#e0b096', '#ecc0a6', '#f4ceb6', '#fadac4'], ltSkinS: ['#e2b49a'], ltBlush: ['#f0a090'], ltBibir: ['#8a1a2a'],
  ltHair: ['#6a3a1a', '#7c4622', '#8e542c', '#a26436'], ltHairT: ['#c88a4a'], ltEmas: ['#c8a030', '#d8b03c', '#e8c24e', '#f4d466'],
  ltKaca: ['#121214', '#1a1a1e', '#26262c', '#34343c'], ltKacaK: ['#5a4a7a'],
  ltZamrud: ['#0e5a4a', '#126a56', '#187a64', '#228c74'], ltZamrudS: ['#083c30'],
  ltTas: ['#5a3a1e', '#6a4626', '#7a5230', '#8c603a'], ltTasK: ['#d8b070'], ltHak: ['#1a1214', '#24181c', '#2e2024', '#3a2a2e'],
  ltBrokat: ['#6a1420', '#7c1a28', '#8e2232', '#a02c3c'], ltBrokatS: ['#4a0c14'], ltBrokatK: ['#e8b8a0'],
  kainLt: ['#3a2410', '#4a2e16', '#5a3a1e', '#6c4626'], kainLtS: ['#24160a'], kainLtK: ['#d8b060'],
});

const FCH = { B: 'brow', K: 'eyeK', W: 'eyeW', m: 'ltBibir', T: 'teeth', t: 'tongue', r: 'ltBlush', s: 'ltSkinS' };
const F0 = '..............';
const F = (brow, eyes, mouth) => [F0, F0, F0, brow, F0, ...eyes, F0, F0, F0, ...mouth, F0, F0];   // alis z 11, mata z 9..8, mulut z 4
const BROW = '..BBB....BBB..';
const EYE = ['.KKKK....KKKK.', '..WKK....KKW..'];
export const FACES = {
  biasa: F(BROW, EYE, ['....mmmmmm....', '.....mmmm.....', 'r............r'.slice(0, 14)]),
  kedip: F(BROW, [F0, '.KKKK....KKKK.'], ['....mmmmmm....', '.....mmmm.....', F0]),
  marah: F('...BB....BB...', ['.KKKK....KKKK.', '..WKK....KKW..'], ['....mmmmmm....', F0, F0]),   // "Oh... anak warkop."
  teriak: F('..BBB....BBB..', ['.KKKK....KKKK.', '..KWK....KWK..'], ['....mTTTTm....', '....mttttm....', '.....mmmm.....']),
  nyengir: F(BROW, ['.KKKK....KKKK.', '..KKW....KKW..'], ['...mmmmmmm....', '....mmmmm.....', F0]),   // senyum miring meremehkan
  ketawa: F(BROW, ['..KK......KK..', '.K..K....K..K.'], ['...mTTTTTTm...', '....mttttm....', 'rr...mmmm...rr']),
  sakit: F('..BB......BB..', ['.KK........KK.', '...KK....KK...'], ['....mmmmmm....', '....TTTTTT....', F0]),
};
export const EXPRS = Object.keys(FACES);

const skull = z => z <= 0 ? [-3, -4, 5, 3, 3] : z === 1 ? [-5, -5, 6, 4, 3] : z === 2 ? [-6, -6, 6, 5, 3] : z <= 11 ? [-7, -7, 6, 6, 3] : z <= 13 ? [-7, -7, 6, 6, 4] : [-6, -6, 5, 5, 4];
function head(o) {
  const v = new Vox();
  for (let z = 0; z <= 14; z++) { const [a, b, c, d, r] = skull(z); v.rrect(z, a, b, c, d, 'ltSkin', r); }
  paintFace(v, o.face || FACES[o.expr] || FACES.biasa, FCH, 14, -7);
  v.box(7, -1, 5, 7, 0, 6, 'ltSkin'); v.set(7, -1, 5, 'ltSkinS');
  for (const y of [-8, 7]) { v.box(-2, y, 5, 0, y, 8, 'ltSkin'); v.box(-1, y, 6, -1, y, 7, 'ltSkinS'); }
  const hair = new Vox();
  if (o.sanggul) {   // disanggul rapi: rambut licin ke belakang, sanggul bulat besar di tengkuk + tusuk konde emas
    for (let z = 6; z <= 15; z++) hair.rrect(z, -8, -8, 7, 7, 'ltHair', z <= 11 ? 4 : 5);
    hair.rrect(16, -6, -6, 5, 5, 'ltHair', 4);
    hair.each((x, y, z, c) => { if (!v.has(x, y, z) && z >= (x >= 5 ? 13 : Math.abs(y + 0.5) > 6.5 && x >= -1 ? 9 : 6)) v.set(x, y, z, c); });
    for (let x = -15; x <= -6; x++) for (let y = -6; y <= 5; y++) for (let z = 3; z <= 13; z++) { const d = ((x + 10.5) / 4.5) ** 2 + ((y + 0.5) / 5.5) ** 2 + ((z - 8) / 4.8) ** 2; if (d <= 1 && !v.has(x, y, z)) v.set(x, y, z, (y + z) % 4 === 0 ? 'ltHairT' : 'ltHair'); }
    for (let y = -9; y <= -5; y++) v.set(-11, y, 12 + (y === -9 ? 1 : 0), 'ltEmas');
  } else {   // blow-dry panjang bergelombang besar sampai punggung, belah samping, volume di atas
    for (let z = -4; z <= 16; z++) hair.rrect(z, -10, -10, 8, 9, 'ltHair', z <= 12 ? 5 : 6);
    for (let z = 17; z <= 18; z++) hair.rrect(z, -8, -8, 6, 7, 'ltHair', 5);
    const zmin = (x, y) => x >= 5 ? (Math.abs(y + 0.5) > 6.5 ? -1 : y > 1 ? 13 : 14) : x >= 0 ? (Math.abs(y + 0.5) > 6.5 ? -4 : 99) : -4;
    hair.each((x, y, z, c) => { if (!v.has(x, y, z) && (z >= zmin(x, y) || z >= 13)) v.set(x, y, z, c); });
    for (let y = -7; y <= 1; y++) { const x = (v.front(y, 13) ?? 6) + 1; if (x <= 9) v.set(x, y, 13, 'ltHair'); }   // sapuan poni samping
    for (let z = -5; z >= -20; z--) { const w = z >= -12 ? 8 : 6, x0 = -9; for (let y = -w - 1; y <= w; y++) { if (z <= -17 && (y + 40) % 3 === 0) continue; for (let x = x0 - 1; x <= x0; x++) v.set(x, y, z, 'ltHair'); } }
    v.each((x, y, z, c) => { if (c === 'ltHair' && z <= 8 && v.back(y, z) === x && (Math.floor((z + 40) / 3) + y + 40) % 5 === 0) v.set(x, y, z, 'ltHairT'); });   // highlight madu bergelombang
  }
  for (const y of [-9, 8]) for (let z = 1; z <= 4; z++) for (const x of [-1, 0]) if ((z === 1 || z === 4 || x === -1) && !(z === 4 && x === -1)) v.set(x, y + (y > 0 ? 1 : -1), z, 'ltEmas');   // anting bulat emas
  if (o.kaca) {   // kacamata hitam lebar menutup mata (z 7..10), bingkai tebal, lensa ungu gelap
    const fx = v.front(-1, 8) + 1;
    ['.KKKKK..KKKKK.', 'KKLLLKKKKLLLKK', '.KLLLK..KLLLK.', '..KKK....KKK..'].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') v.set(fx, c - 7, 10 - r, ch === 'K' ? 'ltKaca' : 'ltKacaK'); }));
    for (const y of [-8, 7]) for (let x = fx; x >= -1; x--) if (!v.has(x, y, 9)) v.set(x, y, 9, 'ltKaca');
  }
  return v;
}

/* ---------- badan (sisi +y; sisi -y = cermin) */
const topC = o => o.top === 'kafe' ? 'ltZamrud' : 'ltBrokat';
const skirt = o => o.top === 'kafe' ? ['ltZamrud', 'ltZamrudS', null] : ['kainLt', 'kainLtS', 'kainLtK'];
const batik = v => { v.each((x, y, z, k) => { if (k !== 'kainLt') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x, a = ((u + z) % 6 + 6) % 6, b = ((u - z) % 6 + 6) % 6; if (a === 0 || b === 0) v.set(x, y, z, 'kainLtS'); else if (a === 3 && b === 3) v.set(x, y, z, 'kainLtK'); }); return v; };
const brokat = v => { v.each((x, y, z, k) => { if (k !== 'ltBrokat') return; const u = (v.front(y, z) === x || v.back(y, z) === x) ? y : x; if (((u + 40) % 4 === 0 && (z + 40) % 4 === 2) || ((u + 42) % 4 === 0 && (z + 40) % 4 === 0)) v.set(x, y, z, 'ltBrokatK'); }); return v; };
const sk = (o, v) => o.top === 'kafe' ? v : batik(v);
function chest(o) {
  const v = new Vox(), c = topC(o), K = o.top === 'kafe';
  for (let z = 32; z <= 51; z++) { const t = z === 51 ? 1 : 0, w = z >= 36 && z <= 41 ? 1 : 0; v.rrect(z, -4, -6 + t + w, 4 - t, 5 - t - w, c, 3); }
  v.rbox(-2, -2, 52, 2, 1, 55, 'ltSkin', 1);
  if (K) {   // terusan zamrud bertali tipis: bahu & dada atas terbuka, kalung emas tipis
    for (let z = 47; z <= 51; z++) for (let y = -6; y <= 5; y++) { if (Math.abs(y + 0.5) >= 4.5 && Math.abs(y + 0.5) <= 5.5 && z <= 50) continue; const xf = v.front(y, z), xb = v.back(y, z); if (xf !== null) v.set(xf, y, z, 'ltSkin'); if (xb !== null && z >= 49) v.set(xb, y, z, 'ltSkin'); }
    v.each((x, y, z, k) => { if (k === 'ltZamrud' && z >= 49 && Math.abs(y + 0.5) > 5.5) v.set(x, y, z, 'ltSkin'); });
    for (let y = -3; y <= 2; y++) { const z = 48 + Math.round(Math.abs(y + 0.5) * 0.8), x = v.front(y, z); if (x !== null) v.set(x, y, z, 'ltEmas'); }
    for (let z = 32; z <= 34; z++) v.shell(z, -5, -7, 5, 6, 'ltZamrudS', 3);   // sabuk kain
  } else {   // kebaya brokat: kerah V, kutubaru, bros emas
    for (let z = 44; z <= 51; z++) for (let y = -3; y <= 2; y++) if (Math.abs(y + 0.5) <= (z - 43) * 0.45) v.pf(y, z, 'ltSkin');
    for (let z = 33; z <= 44; z++) for (const y of [-2, 1]) v.pf(y, z, 'ltBrokatS');
    for (const [y, z] of [[-1, 42], [0, 42], [-1, 41], [0, 41], [-1, 38], [0, 38]]) v.pf(y, z, 'ltEmas');
    brokat(v);
  }
  return v;
}
function pelvis(o) {
  const [c, cS] = skirt(o), v = sk(o, skirtPelvis(c, cS, 20));
  if (o.top !== 'kafe') { for (let z = 26; z <= 33; z++) v.shell(z, -6, -8, 5, 7, z === 26 ? 'ltBrokatS' : 'ltBrokat', 3); brokat(v); }   // kebaya panjang menutup pinggul
  return v;
}
function arm(o) { const v = new Vox(), c = topC(o), K = o.top === 'kafe'; v.rbox(-2, 6, 40, 2, 10, 50, K ? 'ltSkin' : c, 2); v.rrect(51, -2, 6, 2, 10, K ? 'ltSkin' : c, 2); return K ? v : brokat(v); }
function fore(o, side) {
  const v = new Vox(), K = o.top === 'kafe';
  v.rbox(-2, 6, 31, 2, 10, 39, K ? 'ltSkin' : 'ltBrokat', 2);
  if (!K) brokat(v);
  v.rbox(-2, 6, 27, 3, 10, 30, 'ltSkin', 2); v.rrect(26, -1, 7, 2, 9, 'ltSkin', 1);
  if (side > 0) for (const z of [30, 32]) v.shell(z, -3, 5, 3, 11, 'ltEmas', 2);   // gelang emas
  if (side < 0 && K) {   // tas monogram cokelat dijinjing di siku: badan trapesium, pola huruf emas, gagang
    for (let z = 18; z <= 28; z++) { const w = 6 - Math.floor((z - 18) / 4); for (let x = -w; x <= w; x++) for (let y = 11; y <= 14; y++) v.set(x, y, z, (x + z) % 4 === 0 && y === 14 ? 'ltTasK' : 'ltTas'); }
    for (let x = -3; x <= 3; x++) v.set(x, 12, 29 + Math.round(3 * Math.sin((x + 3) / 6 * Math.PI)), 'ltTasK');
  }
  if (side < 0 && !K) { v.rbox(-1, 6, 21, 4, 9, 27, 'ltEmas', 1); v.paint(4, 6, 24, 4, 9, 24, 'ltBrokatS'); }   // clutch emas
  return v;
}
function foot() {   // sepatu hak tinggi: ujung lancip, hak di belakang
  const v = new Vox();
  v.rbox(-1, 2, 0, 6, 5, 1, 'ltHak', 2); v.rbox(-3, 2, 0, -3, 5, 4, 'ltHak', 1); v.rbox(-4, 2, 3, -1, 5, 4, 'ltHak', 1);
  v.rbox(-2, 2, 2, 5, 5, 3, 'ltSkin', 2); v.paint(3, 2, 2, 6, 5, 2, 'ltHak');
  return v;
}

export const OUTFITS = {
  kafe: { name: 'Ngopi cantik: kacamata hitam lebar + terusan panjang zamrud + tas monogram + gelang emas + hak tinggi', top: 'kafe', kaca: true, propOn: 'all' },
  kondangan: { name: 'Kondangan: sanggul + tusuk konde + kebaya brokat marun + kain batik + clutch emas', top: 'kondangan', sanggul: true, propOn: 'all' },
};
export function build(opt = {}) {
  dressing(OUTFITS[opt.outfit] || Object.values(OUTFITS)[0]);
  const o = { ...(OUTFITS[opt.outfit] || OUTFITS.kafe), expr: opt.expr || 'biasa', face: opt.face };
  const [c, cS] = skirt(o), A = arm(o), Th = sk(o, skirtThigh(c)), Sn = sk(o, skirtShin(c, cS)), Ft = foot(o), sl = topC(o);
  const panel = s => sk(o, skirtPanel(c, cS, s, 5));
  const P = assemble([
    ['foreR', fore(o, 1), PV.foreR], ['foreL', fore(o, -1).mirrorY(), PV.foreL],
    ['head', head(o), [0, 0, 0]],
    ['chest', chest(o), PV.chest],
    ['armR', A, PV.armR], ['armL', A.mirrorY(), PV.armL],
    ['flapF', panel(1), PV.flapF], ['pelvis', pelvis(o), PV.pelvis], ['flapB', panel(-1), PV.flapB],
    ['footR', Ft, PV.footR], ['footL', Ft.mirrorY(), PV.footL],
    ['shinR', Sn, PV.shinR], ['shinL', Sn.mirrorY(), PV.shinL],
    ['thighR', Th, PV.thighR], ['thighL', Th.mirrorY(), PV.thighL],
  ], { neck: 'ltSkin', shoulder: o.top === 'kafe' ? 'ltSkin' : sl, elbow: o.top === 'kafe' ? 'ltSkin' : sl, hip: c, knee: c }, SKEL, TAIL);
  P.skirt = skirtInfo(P, c, cS);
  return P;
}
