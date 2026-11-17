# Tokoh voxel · Rani, Bimo, Bram (gaya Raka v3)

Pratinjau mandiri untuk tokoh utama cewek dan dua NPC utama, digambar dengan gaya yang sama dengan Raka v3
(yang sudah dipasang di game lewat PR #6). **Belum dimasukkan ke game** (`game3d/`), menunggu persetujuan.

| Tokoh | Peran | Skala lama | Tinggi kisi (voxel halus, termasuk rambut) | Ciri |
|---|---|---|---|---|
| Raka | tokoh utama cowok | 1.3 | 86 | mullet modern, seragam berandal (pembanding) |
| Rani | tokoh utama cewek | 1.24 | 81 | kuncir kuda + ikat merah, seragam berandal: kemeja keluar, dasi longgar, jaket jeans, rok abu + legging hitam, sneakers putih, plester di hidung |
| Bimo | sahabat sebangku | 1.3 | 88 | badan gempal, perut menonjol, rambut keriting tebal, pipi merah, kemeja sesak, HP di saku |
| Bram | rival utama (anak elite) | 1.38 | 90 | tinggi tegap, muka V, rambut klimis belah samping, mata tajam, seragam permak dimasukkan, ikat pinggang kulit, jam perak, sepatu kulit |

Ukuran tiap tokoh diturunkan dari `NPC_STYLES` lama (skala dan warna kulit/rambut sama), lalu dikali 2 kerapatannya
(1 voxel = 1/64 petak), persis seperti Raka v3. Semua voxel tetap di satu kisi lurus dan diwarnai 4 tingkat per bahan.

## Baju

- **Rani**: seragam + jaket jeans, seragam berandal (tanpa jaket), jaket Lampu Kota (+ helm), rumah (kaus marun + training + sandal).
- **Bimo**: seragam, kaus "Bakso Pak Pras" + celana pendek + sandal, celemek koki warkop.
- **Bram**: seragam permak, bomber hitam geng + kacamata hitam, rumah (kaus hitam + training + sneakers).

Tiap tokoh punya 7 ekspresi yang sama dengan Raka (biasa, kedip, marah, teriak, nyengir, ketawa, sakit), dan memakai
semua gerakan game (`ANIMS`) tanpa perubahan.

## Isi

- `raka_voxel.html`: buka langsung. Pilih **Tokoh**, baju, gerakan, ekspresi; seret = putar, roda = zoom;
  **Ukuran pixel game** dan **Banding versi lama** tersedia seperti di pratinjau Raka.
- `shots/`: lembar gambar. `barisan.png` = keempat tokoh berjajar (tinggi bisa dibandingkan langsung), lalu per tokoh:
  `<tokoh>.png` (putar 4 arah), `Kepala`, `Wajah`, `Baju`, `Pose`, `Game` (lama vs baru di ukuran game).
- `src/`
  - `rig.js`: rig Raka yang kini memakai konfigurasi kerangka `K` (panjang ruas, lebar bahu, jarak pinggul) per tokoh.
  - `model.js`: Raka + registri bahan bersama (`addRamps`), `assemble`, `paintFace`.
  - `rani.js`, `bimo.js`, `bram.js`: kerangka (`SKEL`), bahan, peta wajah 14x15, rambut, dan baju tiap tokoh.
  - `chars.js`: daftar tokoh untuk penampil.
  - `frame.js`, `expr.js`, `vox.js`, `voxlib.js`, `npc_styles.js`, `anims.js`: sama dengan versi game.

## Membangun ulang

```
node build.mjs          # -> raka_voxel.html
node shot.mjs shots     # -> shots/*.png dari sheets.json
```

## Memasang ke game nanti

Sama dengan Raka: salin `rani.js`/`bimo.js`/`bram.js` ke `game3d/src/raka/`, dan rig/frame versi berkerangka ini,
lalu di `voxworker.js` tambahkan cabang per `sid` yang memanggil `voxelFrame(build({ outfit, expr }), pose)`.
`frame.js` sudah membaca `skel` dan `tailPiv` dari hasil `build`, jadi tiap tokoh membawa kerangkanya sendiri.
