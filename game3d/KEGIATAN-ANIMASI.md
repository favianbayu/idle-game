# Kegiatan tokoh, animasi, dan barangnya

Daftar ini berisi semua kegiatan NPC (jadwal guide 35-37, kebiasaan warga, kerja sampingan) dan aksi pemain di game3d. Untuk tiap kegiatan tercatat animasi yang dipakai dan barang yang dipegang. Dibuat 2026-11-19 atas permintaan favian.

Sejak 2026-11-19, barang kegiatan hanya digambar oleh animasi. Barang sprite (`propR`/`propL`) tidak ditampilkan lagi.

- **Barang kegiatan:** pose anim punya `tool` (nomor barang) dan `tl` (parameter gerak). `raka/rig.js` (`tools()` dan `groundProps()`) menggambar barangnya dari posisi tangan atau kaki, jadi barang selalu ikut gerakan.
- **Barang yang selalu dibawa** (tongkat, tas, payung, senapan): tetap dari sprite, tapi disembunyikan saat anim kegiatan berjalan (`BUSY` di `raka/model.js`).
- **Definisi anim:** `src/voxlib.js` di `ACT_ANIMS`.
- **Pratinjau:** `tokoh-voxel/shots/kegiatan.png`.

## Barang kegiatan baru

| No | Barang | Anim |
|---|---|---|
| 1 | Penggaris papan tulis + buku | `teach` |
| 2 | Wajan + sutil | `cook` |
| 3 | Piring nasi + sendok | `eat` |
| 4 | Gelas kopi | `drink` |
| 5 | Kunci pas | `wrench` |
| 6 | Gitar | `guitar` (duduk), `busk` (berdiri) |
| 7 | Kamera | `photo` |
| 8 | Buku sketsa + pensil | `sketch` |
| 9 | Kuas + kaleng cat | `paint` |
| 10 | Dumbel | `lift` |
| 11 | Raket badminton | `racket` |
| 12 | Cangkul | `hoe` |
| 13 | Sajadah (di tanah) | `pray` (berdiri, rukuk, sujud, duduk) |
| 14 | Papan skate (di bawah kaki) | `skate` |
| 15 | Bola basket (memantul) | `bball` |
| 16 | Bola sepak (di kaki, menggelinding) | `kickAbout` |
| 17 | Pulpen | `write` |
| 18 | Kalkulator | `cashier` |
| 19 | Kipas bambu | `sell` |
| 20 | Gembor | `water` |
| 21 | Nampan + 2 gelas kopi | `serve` |

Barang yang sudah ada sebelumnya: sapu (`sweep`), HP (`phone`), buku (`read`), kardus (`carry`), galon (`galon`, `galonWalk`), pancing (`fishCast`, `fishWait`, `fishPull`, `fishShow`), pedang dan bola sihir (jurus).

## Jadwal NPC (rutin.json)

Angka di kolom Jumlah adalah banyaknya baris jadwal yang memakai kegiatan itu, di semua tokoh dan semua hari.

| Kegiatan | Jumlah | Contoh dari guide | Anim | Barang |
|---|---|---|---|---|
| duduk | 183 | Pelajaran, pulang naik angkot, nongkrong di markas | `sitDown`; teks kopi/warkop/kafe jadi `drink` | gelas kopi (kalau ngopi) |
| tidur | 148 | Tidur | disembunyikan | - |
| duduk_tulis | 105 | Pelajaran, PR, koreksi | `write` | pulpen |
| makan | 57 | Sarapan, makan malam, makan bakso | `eat` | piring + sendok |
| jalan | 50 | Berangkat, patroli koridor | `walk` | - |
| berdiri | 35 | Nongkrong geng, jaga pintu air | `idle` | - |
| baca | 30 | Perpustakaan, mengaji, latihan soal | `read` | buku |
| servis | 28 | Bengkel, garasi, merakit motor | `wrench` | kunci pas |
| masak | 27 | Masak, siapkan sarapan, katering | `cook` | wajan + sutil |
| mengajar | 25 | Mengajar kelas, ngaji, melatih | `teach` | penggaris + buku |
| salat | 19 | Subuh, zuhur, salat Jumat | `pray` | sajadah |
| ngobrol | 19 | Meja geng, rapat OSIS; teks kafe jadi `drink` | `talk` / `drink` | gelas kopi (di kafe) |
| angkut | 19 | Rute galon, kuli pasar | `carry`; teks galon jadi `galonWalk` | kardus / galon |
| jongkok | 18 | Kasih makan kucing; teks taman/kebun jadi `water` | `squat` / `water` | gembor (taman) |
| gitar | 17 | Gitar akustik, latihan band, menulis lagu | `guitar` | gitar |
| sapu | 15 | Menyapu halaman, bersihkan kelas | `sweep` | sapu |
| silat | 14 | Latihan dan melatih silat | `guard` | - |
| basket | 14 | Lapangan basket, liga 3x3 | `bball` | bola basket |
| jualan | 12 | Nasi uduk, bakso, es teh | `sell` | kipas bambu |
| naik_motor | 12 | Ke STM, konvoi | disembunyikan saat naik | - |
| hp | 12 | Telepon, main game HP | `phone` | HP |
| gambar | 9 | Studio komik, sketsa di taman | `sketch` | buku sketsa + pensil |
| foto | 9 | Memotret, liputan | `photo` | kamera |
| lari | 8 | Lari subuh | `run` | - |
| olahraga | 7 | Gym, angkat beban; teks bulu tangkis jadi `racket` | `lift` / `racket` | dumbel / raket |
| futsal | 7 | Futsal, main bola | `kickAbout` | bola sepak |
| kasir | 7 | Jaga toko, butik | `cashier` | kalkulator |
| sepeda | 6 | Bersepeda ke sekolah | disembunyikan saat naik | - |
| skate | 6 | Skatepark taman kota | `skate` (juga saat berpindah) | papan skate |
| mancing | 6 | Memancing di Kali Cendana | `fishWait` | pancing |
| piano | 4 | Piano | `sitDesk` | - (piano = perabot) |
| tidur_meja | 3 | Tidur di meja | `sitDesk` | - |
| lukis | 3 | Mural | `paint` | kuas + kaleng cat |
| tidur_kursi | 3 | Tidur siang di kursi | `sitDown` | - |
| petik | 2 | Merawat kebun | `water` | gembor |
| kerja_mesin | 2 | Pabrik teh, shift | `wrench` | kunci pas |
| nyanyi | 1 | Ngamen kentrung | `busk` | gitar |
| jala | 1 | Melaut | `fishCast` | pancing |

## Kebiasaan NPC lain (main.js, warga.js)

| Tokoh | Kegiatan | Anim | Barang |
|---|---|---|---|
| Pak Ujang | Menyapu | `sweep` | sapu |
| Fajar, anak STM bengkel | Servis motor | `wrench` | kunci pas |
| Mei, Rizal, Tegar, Bu Ratna | Membaca | `read` | buku |
| Jojo, anak STM gaul | Main HP | `phone` | HP |
| Laras | Bawa kardus | `carry` | kardus |
| Gilang | Antar galon | `galon` / `galonWalk` | galon |
| Petani sawah | Tanam padi dan mencangkul bergantian | `squat` / `hoe` | cangkul |
| Bu Warsih (warga) | Menyapu halaman | `sweep` | sapu |
| Pemancing | Memancing | `fishCast` / `fishWait` / `fishPull` / `fishShow` | pancing |
| Satpam, polisi, paskibra | Hormat | `salute` | - |

## Aksi pemain (Raka / Rani)

| Tempat | Aksi | Anim | Barang |
|---|---|---|---|
| Rumah Om Darto | Makan masakan Bu Narti | `eat` | piring + sendok |
| Rumah Om Darto | Belajar | `read` | buku |
| Warkop Om Darto | Bantu jualan kopi | `serve` | nampan + 2 gelas |
| GOR | Dumbel & bench press | `lift` | dumbel |
| GOR | Main badminton | `racket` | raket |
| GOR | Salat sebentar | `pray` | sajadah |
| GOR | Treadmill, sepeda statis, sparring, silat | `run` / `straight` / `kickHigh` | - |
| Bengkel STM | Ganti oli, setel karbu, kampas rem | `wrench` | kunci pas |
| Rumah pohon | Baca komik | `read` | buku |
| Main bola / basket | Mini game | `kickBall` / `dribble` / `shoot` | bola fisik dari activities.js (tidak dobel) |
| Memancing | Mini game | `fishCast` ... `fishShow` | pancing |

## Kerja sampingan (story.js)

| NPC | Pekerjaan | Anim | Barang |
|---|---|---|---|
| Mandor Sabar | Perbaiki mesin pabrik teh | `wrench` | kunci pas |
| Ki Sarpan | Foto batu bertulis | `photo` | kamera |
| Mekanik Bayu | Kru pit seri liga | `wrench` | kunci pas |
| Andra | Melukis mural lumbung | `paint` | kuas + kaleng cat |
| Wak Kodir | Tebar jaring nelayan | `fishCast` | pancing |
| Bu Romlah | Jaga warung seafood | `cook` | wajan + sutil |
| Nek Sumi | Antar galon | `galon` | galon |
| Tito | Latih bola anak asrama | `kickAbout` | bola sepak |
| Kang Ujo, Mbak Sri, Pak Lurah | Porter, shift pabrik, pasar hewan | `carry` | kardus |
| Kyai Mahfud | Ajar ngaji | `read` | buku |

## Belum ada barangnya

- **Jongkok** (kucing, peti, petik teh, pasang papan): tetap `squat` tanpa barang.
- **Piano:** pianonya perabot ruangan.
- **Silat, lari, hormat:** memang tanpa barang.
- **Layangan, mercusuar:** pakai `look` / `raiseHand`.

Kalau mau ditambah, buat anim baru di `ACT_ANIMS` dengan nomor `tool` berikutnya, gambar barangnya di `tools()` (`raka/rig.js`), lalu tambahkan anim itu ke `BUSY` di `raka/model.js`.
