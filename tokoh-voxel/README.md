# Tokoh voxel · Rani, Bimo, Bram, Nadia, Dimas, Sekar, Arga, Laras, Rizal (gaya Raka v3)

Cara membuat tokoh baru: lihat [PANDUAN-TOKOH.md](PANDUAN-TOKOH.md).

Pratinjau mandiri untuk tokoh utama cewek dan NPC utama, digambar dengan gaya yang sama dengan Raka v3
(yang sudah dipasang di game lewat PR #6). **Belum dimasukkan ke game** (`game3d/`), menunggu persetujuan.

| Tokoh | Peran | Skala lama | Tinggi kisi (voxel halus, termasuk rambut) | Ciri |
|---|---|---|---|---|
| Raka | tokoh utama cowok | 1.3 | 86 | mullet modern, seragam berandal (pembanding) |
| Rani | tokoh utama cewek | 1.24 | 81 | kuncir kuda + ikat merah, seragam berandal: kemeja keluar, dasi longgar, jaket jeans, rok abu + legging hitam, sneakers putih, plester di hidung |
| Bimo | sahabat sebangku | 1.3 | 88 | badan gempal, perut menonjol, rambut keriting tebal, kacamata frame hitam tebal, pipi merah, kemeja sesak, HP di saku |
| Bram | rival utama (anak elite) | 1.38 | 90 | tinggi tegap, muka V, rambut klimis belah samping, mata tajam, seragam permak dimasukkan, ikat pinggang kulit, jam perak, sepatu kulit |
| Nadia | NPC romance cewek, calon ketua OSIS | 1.24 | 79 | hijab segi empat abu-biru + peniti mutiara, kemeja krem lengan panjang, rok abu panjang, badge OSIS, pulpen di saku, jam kulit kecil, pantofel |
| Dimas | NPC romance cowok, kapten basket | 1.38 | 89 | bahu lebar, rambut cepak anak tentara dengan samping & belakang bawah fade, telinga kemerahan, seragam rapi dimasukkan, jam digital, deker lutut kiri (saat celana pendek) |
| Sekar | NPC romance cewek, gitaris band | 1.22 | 80 | kurus, kulit pucat, rambut hitam panjang kuncir dua rendah ikat ungu, poni menutupi alis, mata sayu, jaket jeans kebesaran, rok abu panjang, gitar di punggung |
| Laras | NPC romance cewek, penjual nasi uduk | 1.24 | 81 | kulit sawo matang, kuncir tinggi tebal + karet merah, jepit kayu, poni berantakan, pipi merah, gigi gingsul, seragam agak kusut, sepatu sol ditambal |
| Rizal | NPC romance cowok, sekretaris OSIS | 1.32 | 86 | kurus, rambut belah samping poni jatuh, kacamata frame tipis kotak, bulu mata panjang, mata sayu, jari bernoda tinta, rompi rajut cokelat, tas selempang kanvas |
| Arga | NPC romance cowok, Lampu Kota | 1.34 | 84 | ramping berotot, kulit sawo matang gelap, buzz cut, bekas luka memotong alis kanan, seragam dikeluarkan + jaket kulit cokelat, boots |

Ukuran tiap tokoh diturunkan dari `NPC_STYLES` lama (skala dan warna kulit/rambut sama), lalu dikali 2 kerapatannya
(1 voxel = 1/64 petak), persis seperti Raka v3. Semua voxel tetap di satu kisi lurus dan diwarnai 4 tingkat per bahan.

## Baju

- **Rani**: seragam + jaket jeans, seragam berandal (tanpa jaket), jaket Lampu Kota (+ helm), rumah (kaus marun + training + sandal).
- **Bimo**: seragam, kaus "Bakso Pak Pras" + celana pendek + sandal, celemek koki warkop.
- **Bram**: seragam permak, bomber hitam geng + kacamata hitam, rumah (kaus hitam + training + sneakers).
- **Nadia**: seragam + hijab, jas almamater (rapat OSIS), tunik + kulot + tas selempang, gamis rumahan.
- **Sekar**: seragam + jaket jeans + gitar, latihan band (kaus band + kargo + gelang karet), flanel ungu + rok jeans, sweater lavender + piama.
- **Arga**: seragam + jaket kulit, jaket Lampu Kota + sarung tangan tanpa jari, flanel abu + jeans hitam, kaus abu + celana kerja (bantu kakek).
- **Laras**: seragam agak kusut + rok panjang, jualan subuh (kaus oranye + celemek kunyit + handuk + training + sandal), kemeja kotak hijau di pinggang + jeans + kets, daster batik.
- **Rizal**: seragam + rompi rajut + tas selempang, jas almamater + pulpen di telinga, kaus festival literasi + sarung (rok.js), kemeja kotak cokelat + slacks + sepatu kanvas.
- **Dimas**: seragam rapi, jersey basket #11 + headband, hoodie biru + chino, kaus loreng + celana pendek + sandal.

Tiap tokoh punya 7 ekspresi yang sama dengan Raka (biasa, kedip, marah, teriak, nyengir, ketawa, sakit), dan memakai
semua gerakan game (`ANIMS`) tanpa perubahan.

## Isi

- `raka_voxel.html`: buka langsung. Pilih **Tokoh**, baju, gerakan, ekspresi; seret = putar, roda = zoom;
  **Ukuran pixel game** dan **Banding versi lama** tersedia seperti di pratinjau Raka.
- `shots/`: lembar gambar. `barisan.png` = semua tokoh berjajar (tinggi bisa dibandingkan langsung), lalu per tokoh:
  `<tokoh>.png` (putar 4 arah), `Kepala`, `Wajah`, `Baju`, `Pose`, `Game` (lama vs baru di ukuran game).
- `src/`
  - `rig.js`: rig Raka yang kini memakai konfigurasi kerangka `K` (panjang ruas, lebar bahu, jarak pinggul) per tokoh.
  - `model.js`: Raka + registri bahan bersama (`addRamps`), `assemble`, `paintFace`.
  - `rani.js`, `bimo.js`, `bram.js`, `nadia.js`, `dimas.js`, `sekar.js`, `arga.js`, `laras.js`, `rizal.js`: kerangka (`SKEL`), bahan, peta wajah 14x15, rambut, dan baju tiap tokoh.
  - `rok.js`: pembuat rok (pinggang, panel depan/belakang, tabung kaki) + data `P.skirt`; `frame.js` mengisi lambung cembung kain rok per lapis supaya rok tidak terbelah saat jalan/lari.
  - `chars.js`: daftar tokoh untuk penampil.
  - `frame.js`, `expr.js`, `vox.js`, `voxlib.js`, `npc_styles.js`, `anims.js`: sama dengan versi game.

## Membangun ulang

```
node build.mjs          # -> raka_voxel.html
node shot.mjs shots     # -> shots/*.png dari sheets.json
```

## Memasang ke game nanti

Sama dengan Raka: salin file tokoh (`rani.js`, `bimo.js`, dst.) ke `game3d/src/raka/`, dan rig/frame versi berkerangka ini,
lalu di `voxworker.js` tambahkan cabang per `sid` yang memanggil `voxelFrame(build({ outfit, expr }), pose)`.
`frame.js` sudah membaca `skel` dan `tailPiv` dari hasil `build`, jadi tiap tokoh membawa kerangkanya sendiri.
