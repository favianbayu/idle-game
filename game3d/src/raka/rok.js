// Rok panjang/selutut untuk tokoh voxel halus. Rok dibangun dari 3 jenis bagian:
//  - pinggang + sisi rok di pelvis (ikut badan),
//  - panel depan (flapF) & belakang (flapB) yang ikut ayunan paha,
//  - tabung kain di paha/betis (rok panjang) supaya sisi rok ikut kaki.
// Saat frame dibuat, frame.js mengisi lambung cembung semua voxel kain rok per lapis z (P.skirt), jadi rok tidak pernah
// terbelah jadi dua "celana" saat jalan atau lari.
import { Vox } from './vox.js';

// pelvis: rbox celana dalam + cangkang rok dari pinggang ke bawah, sedikit mengembang
export function skirtPelvis(c, cS, z0 = 22) {
  const v = new Vox();
  v.rbox(-4, -6, 26, 4, 5, 33, c, 3); v.box(-3, -2, 24, 2, 1, 25, c);
  for (let z = z0; z <= 33; z++) { const f = z <= 27 ? 1 : 0; v.shell(z, -5 - f, -7 - f, 4 + f, 6 + f, c, 3); }
  for (let z = 32; z <= 33; z++) v.shell(z, -5, -7, 4, 6, cS, 3);   // ban pinggang
  return v;
}
// panel depan (s = 1) / belakang (s = -1) dari pinggang sampai keliman zHem, makin bawah makin lebar; dua garis lipit
export function skirtPanel(c, cS, s, zHem = 6) {
  const v = new Vox();
  for (let z = zHem; z <= 31; z++) { const f = z <= zHem + 6 ? 2 : z <= 22 ? 1 : 0; s > 0 ? v.box(3, -6 - f, z, 6 + f, 5 + f, z, c) : v.box(-7 - f, -6 - f, z, -4, 5 + f, z, c); }
  for (const y of [-4, 3]) for (let z = zHem + 1; z <= 28; z++) { const x = s > 0 ? v.front(y, z) : v.back(y, z); if (x !== null) v.set(x, y, z, cS); }
  return v;
}
// tabung kain rok panjang di paha & betis (koordinat kaki kanan, kiri = mirrorY)
export function skirtThigh(c) { const v = new Vox(); v.rbox(-4, 0, 17, 3, 8, 31, c, 3); return v; }
export function skirtShin(c, cS) {
  const v = new Vox();
  for (let z = 5; z <= 17; z++) { const f = z <= 9 ? 1 : 0; v.rrect(z, -4 - f, 0 - f, 3 + f, 8 + f, c, 3); }
  for (let z = 6; z <= 16; z++) v.set(v.front(4, z) ?? 3, 4, z, cS);
  return v;
}
// data rok untuk frame.js: bahan kain (indeks), bahan isi, dan bagian yang boleh menyumbang voxel rok
export function skirtInfo(P, c, cS, long = true) {
  return { mats: [P.mat(c), P.mat(cS)], fill: P.mat(c), parts: long ? ['pelvis', 'flapF', 'flapB', 'thighL', 'thighR', 'shinL', 'shinR'] : ['pelvis', 'flapF', 'flapB'] };
}
