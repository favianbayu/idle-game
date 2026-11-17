# Tokoh voxel · Rani, Bimo, Bram, Nadia, Dimas, Sekar, Arga, Laras, Rizal, Uti, Tegar, Sasha, Kirana, Jojo, Andra, Mei, Gilang (gaya Raka v3)

Cara membuat tokoh baru: lihat [PANDUAN-TOKOH.md](PANDUAN-TOKOH.md).

Pratinjau mandiri untuk tokoh utama cewek dan NPC utama, digambar dengan gaya yang sama dengan Raka v3
(yang sudah dipasang di game lewat PR #6). Semua tokoh di tabel ini sampai Andra sudah dipasang di game (`game3d/src/raka/`,
peta `FINE` di `voxworker.js`) dengan baju `seragam`. Mei dan Gilang masih pratinjau, menunggu persetujuan.

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
| Uti | NPC romance cewek, tomboi montir + kapten futsal | 1.24 | 82 | atletis, kulit sawo matang, bob pendek berantakan potong sendiri, alis tebal, coretan oli di pipi, bekas luka di dagu, seringai, jaket marun kebesaran milik almarhum kakak + kunci pas di saku, celana panjang abu |
| Tegar | NPC romance cowok, ketua kelas & juara umum | 1.32 | 86 | kulit pucat, rambut klimis belah samping mengilap, kacamata bingkai hitam tebal, kantong mata gelap, seragam disetrika tajam + dasi abu + badge ketua kelas, pantofel |
| Sasha | NPC romance cewek, anak elite geng Bram | 1.24 | 80 | kulit putih, rambut cokelat kemerahan panjang bergelombang tanpa poni, muka tirus, bulu mata lentik, lip tint pink, seragam dipermak + rok pendek + cardigan pink, jam emas, loafers |
| Kirana | NPC romance cewek, pembalap STM | 1.26 | 81 | kulit langsat gelap, rambut hitam lurus diikat rendah ujung toska, poni samping, mata tajam, satu tindik, plester di siku, seragam STM + sepatu safety |
| Jojo | NPC romance cowok, fotografer mading | 1.3 | 90 (termasuk mohawk) | kurus jangkung, mohawk kecil bergel, mata besar, senyum lebar, tahi lalat di bawah mata kanan, rompi fotografer army + kamera DSLR di leher |
| Andra | NPC romance cowok, pelukis mural STM | 1.32 | 85 | kulit cokelat, rambut ikal sebahu setengah diikat, alis tebal, senyum malas, tindik kiri, tangan & celana kena cat, tato spidol di lengan, boots |
| Mei | NPC romance cewek, anak Toko Buku Pena, ilustrator | 1.18 | 80 | bob sebahu lurus + jepit pensil, kacamata bulat besar, pipi tembam merah, mata sipit, noda tinta di jari |
| Gilang | NPC romance cowok, pengantar galon & skater, paket C | 1.34 | 86 | kulit cokelat gelap, rambut berantakan, topi terbalik biru-kuning, gigi depan renggang, alis jahil tak sejajar, plester di lutut & siku |
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
- **Uti**: seragam + jaket marun, jersey futsal #7 + decker + sepatu futsal merah, bengkel (kaus hitam + wearpack diikat di pinggang + sarung tangan kain), kaus band motor + jeans robek + boots + topi terbalik, malam (jaket marun tertutup + helm half-face kuning bergambar petir; juga dipakai saat naik motor).
- **Tegar**: seragam + dasi, les (kemeja biru langit + celana bahan + ransel penuh buku), piama biru tua + selop, polo abu + chino + kets putih bersih.
- **Sasha**: seragam + cardigan pink, bareng geng (kacamata hitam di kepala + tas tangan putih), dress bunga + jaket denim putih + tas mini, penyamaran malam (hoodie hitam + masker + training + kets lusuh).
- **Kirana**: seragam STM, wearpack hitam lis oranye + handuk, jaket balap toska-hitam #21 + helm full-face (juga dipakai saat naik motor), crop hoodie + kargo + sneakers tinggi.
- **Jojo**: seragam + rompi army + kamera, liputan (kupluk oranye + ransel kamera), kaus "HORAS!" + celana pendek, kemeja hawaii + kargo + sandal gunung.
- **Andra**: seragam STM kena cat + boots, melukis mural (kaus penuh cat + overall + masker + topi terbalik), Serigala Besi (rompi jeans patch serigala), kemeja bunga + kulot, sarung (rok.js) + kaus partai.
- **Mei**: seragam Bina Bangsa (rompi & rok kotak hijau + dasi pita, rok.js), jaga toko (kaus mustard + apron PENA + pensil di telinga), piama kucing + kaus kaki tidak sepasang, overall + kaus garis + baret + tas tote berpin.
- **Gilang**: antar galon (kaus Depot Air Segar + handuk + galon di pundak + sandal jepit), skate (kaus kartun kebesaran + kargo sobek + papan di punggung + sepatu diikat karet), paket C (kemeja kotak dikancing sampai atas), di rumah (telanjang dada + sarung rok.js), windbreaker kuning-biru. Di game (`seragam`) ia memakai baju antar galon tanpa galon.
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
  - `rani.js`, `bimo.js`, `bram.js`, `nadia.js`, `dimas.js`, `sekar.js`, `arga.js`, `laras.js`, `rizal.js`, `uti.js`, `tegar.js`, `sasha.js`, `kirana.js`, `jojo.js`, `andra.js`: kerangka (`SKEL`), bahan, peta wajah 14x15, rambut, dan baju tiap tokoh.
  - `rok.js`: pembuat rok (pinggang, panel depan/belakang, tabung kaki) + data `P.skirt`; `frame.js` mengisi lambung cembung kain rok per lapis supaya rok tidak terbelah saat jalan/lari.
  - `chars.js`: daftar tokoh untuk penampil.
  - `frame.js`, `expr.js`, `vox.js`, `voxlib.js`, `npc_styles.js`, `anims.js`: sama dengan versi game.

## Membangun ulang

```
node build.mjs          # -> raka_voxel.html
node shot.mjs shots     # -> shots/*.png dari sheets.json
```

## Memasang ke game

Salin file tokoh (`rani.js`, `bimo.js`, dst.) beserta `vox.js`, `rig.js`, `model.js`, `frame.js`, `rok.js` ke `game3d/src/raka/`,
lalu di `voxworker.js` import `build` tokoh itu (urutan sama dengan `build.mjs`) dan tambahkan ke peta `FINE`.
`frame.js` sudah membaca `skel` dan `tailPiv` dari hasil `build`, jadi tiap tokoh membawa kerangkanya sendiri.
