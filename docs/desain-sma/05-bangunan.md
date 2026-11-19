# Detail Bangunan

Panduan bentuk, gaya, dan warna setiap bangunan di Wirabumi, supaya bisa langsung dimodelkan sebagai voxel.

**Skala** (sama dengan renderer): 1 petak = 32 unit voxel. Tinggi 1 lantai = 52 unit dinding + 4 unit lantai/plat.
Pintu 44 unit, jendela standar 20 x 24 unit dengan ambang 18 unit dari lantai. Atap ±24 unit untuk rumah satu lantai.

**Aturan umum supaya kota tidak monoton**
- Tiap rumah kampung diambil dari **tipe dasar + 3 variasi acak**: warna dinding, warna atap, dan satu tambahan
  (teras, pagar, jemuran, pot, tandon air, parabola, kandang ayam). Dengan 6 tipe x 8 warna x 7 tambahan, jarang ada dua yang sama.
- Dinding diberi **weathering** (sudah ada di renderer `weatherColor`): kotoran dekat tanah, noda rembesan, lumut di sisi utara.
  Kampung lebih kotor, perumahan elite paling bersih.
- **Malam hari** setiap bangunan punya titik lampu sendiri (jendela kuning hangat, lampu neon putih untuk toko, lampu sorot
  untuk proyek), memakai sistem lampu toko malam yang sudah ada.
- Atap memakai **potongan dua lapis** (`splitModel`) supaya tokoh bisa masuk ke bawah teras/kanopi.

## Palet wilayah

| Wilayah | Dinding | Atap | Aksen | Kesan |
|---|---|---|---|---|
| Perkampungan | Krem `#e8d8b8`, hijau mint `#b8d8b0`, biru muda `#a8c8d8`, merah muda `#e8b8b0`, kuning `#f0d890`, bata telanjang `#b06a4a` | Genteng tanah `#b4583e`, seng karat `#8a6a5a`, asbes `#a8a8a0` | Pintu & kusen cat hijau tua `#2f6a4a`, biru `#2a5a8a` | Ramai, cerah tapi pudar |
| Perumahan Bukit Asri | Putih tulang `#f2eee6`, abu hangat `#c8c2b8`, krem `#e6dcc8` | Genteng beton abu tua `#4a5058`, hitam `#2a2c30`, biru batu `#5a6a80` | Kayu jati `#8a5a34`, batu alam `#8a8478` | Rapi, mahal, sepi |
| Pusat kota (ruko) | Putih kusam `#e0dcd2`, abu `#bcbab4`, kuning gading `#ece2c4` | Plat beton datar + kanopi seng warna-warni | Papan nama merah `#c83a3a`, biru `#2a6ac0`, kuning `#f2c230` | Padat, papan nama di mana-mana |
| Bantaran kali | Papan kayu `#9a7a56`, triplek `#c8b088`, seng `#8a9098` | Seng karat `#8a5a44`, terpal biru `#2a6ac0` | Tiang kayu panggung `#6a4a30` | Tambal-sulam, rawan banjir |
| Selatan (STM & proyek) | Beton abu `#a8a8a4`, seng pagar biru `#3a6aa8` | Atap pabrik seng `#9aa0a6` | Garis kuning-hitam `#f2c230/#2a2a2a` | Keras, industrial |
| Sekolah | Krem `#ecdcb4` dengan list putih `#f6f4ec` | Genteng merah bata `#a84a32` | Pintu kayu cokelat `#7a4a2a`, papan nama hijau `#2f6a4a` | Bangunan negeri era lama yang dirawat |

---

## Rumah tinggal

### Rumah kampung: 6 tipe dasar

| Tipe | Ukuran (petak) | Bentuk | Detail khas | Variasi tambahan |
|---|---|---|---|---|
| **K1 Rumah petak** | 3 x 4, 1 lantai | Kotak sederhana, atap pelana menghadap gang | Satu pintu, satu jendela, teras semen 1 petak | Jemuran tali, sandal berserakan |
| **K2 Rumah teras** | 4 x 5, 1 lantai | Atap pelana + teras beratap di depan dengan dua tiang | Kursi plastik di teras, pot tanaman di tangga | Sangkar burung, motor di teras |
| **K3 Rumah tumbuh** | 4 x 4, 1.5 lantai | Lantai 1 bata, lantai 2 setengah jadi (bata telanjang, besi cor mencuat) | Tangga besi di luar | Tandon air oranye di atap |
| **K4 Rumah L** | 5 x 5, 1 lantai | Bentuk L mengapit halaman kecil | Pohon mangga di halaman, bale-bale bambu | Kandang ayam, gerobak parkir |
| **K5 Rumah warung** | 4 x 4, 1 lantai | Bagian depan terbuka jadi warung dengan rolling door/papan | Etalase kaca, renceng jajanan sachet di depan | Termos es, spanduk kecil |
| **K6 Rumah gang sempit** | 2.5 x 5, 2 lantai | Tinggi dan ramping, balkon besi kecil di lantai 2 | Kabel listrik semrawut menempel | Parabola, pot gantung |

### Rumah perumahan elite: 4 tipe

| Tipe | Ukuran | Bentuk | Detail khas |
|---|---|---|---|
| **P1 Minimalis** | 6 x 7, 2 lantai | Kotak-kotak bertumpuk, atap datar + sebagian atap miring | Pagar besi hitam horizontal, carport, kaca besar |
| **P2 Klasik** | 7 x 7, 2 lantai | Pilar putih di depan, atap limas | Air mancur kecil, lampu taman bulat |
| **P3 Tropis** | 7 x 6, 2 lantai | Atap limas lebar menjorok, banyak kayu | Teras kayu, kolam ikan kecil, pohon kamboja |
| **P4 Rumah sudut** | 8 x 8, 2 lantai | Bentuk L di pojok cul-de-sac | Taman luas, dua mobil |

### Ruko: 3 tipe (pusat kota)

| Tipe | Ukuran | Bentuk | Detail khas |
|---|---|---|---|
| **R1 Ruko lama** | 3 x 5, 2 lantai | Rolling door di bawah, jendela nako di atas | Papan nama luntur, AC outdoor berkarat, tralis |
| **R2 Ruko baru** | 3.5 x 6, 3 lantai | Fasad kaca dan panel abu | Neon box menyala, kanopi kaca |
| **R3 Ruko gandeng** | 6 x 5, 2 lantai | Dua unit jadi satu toko besar | Papan nama panjang, tangga samping |

---

## Bangunan penting

### Rumah Om Darto (Perkampungan)
- **Bentuk**: tipe K2 versi lebih tua, 4 x 5 petak, 1 lantai. Atap genteng tanah merah kecokelatan `#a8523a` dengan beberapa
  genteng yang beda warna (bekas tambalan).
- **Dinding**: cat hijau mint pudar `#b8d0a8`, kusen kayu cokelat tua, jendela kaca nako.
- **Detail**: teras sempit dengan bangku kayu panjang, motor bebek tua `#3a6a8a` parkir di depan, pot lidah mertua, keset sabut.
- **Interior** (atap dilepas): ruang tamu kecil merangkap ruang TV, 2 kamar (kamar pemain di belakang), dapur, kamar mandi.
- **Kamar pemain** berubah sesuai upgrade (lihat properti).

### Warkop Simpang (5 level)

| Lv | Bentuk & ukuran | Warna & material | Detail |
|---|---|---|---|
| 1 Gerobak | Gerobak kayu 1.2 x 0.8 petak di depan rumah | Kayu kuning cerah `#e8c060`, tulisan "KOPI" merah | Termos, toples kerupuk, dua bangku plastik merah |
| 2 Warung tenda | Rangka besi + terpal oranye `#e0782a`, 4 x 3 petak | Meja panjang kayu, terpal sisi | Lampu bohlam gantung, TV tabung kecil di rak, spanduk kain |
| 3 Warkop permanen | Bangunan bata 6 x 4 petak, atap seng miring ke depan + teras | Dinding hijau tua `#2f6a4a` setengah, setengah atas papan kayu; kursi panjang | Papan nama kayu "WARKOP SIMPANG" berhuruf kuning, rak gelas, papan menu kapur, wifi |
| 4 Kafe (Ruko Pelita) | Ruko R3, 6 x 5 petak, 2 lantai | Bata ekspos `#b06a4a` + kayu, kaca lebar, lampu gantung kuning | Mesin kopi besar, panggung kecil untuk Sekar, lantai 2 tempat nongkrong |
| 5 Simpang & Co | Kafe utama + 2 cabang (pasar & dekat sekolah) | Logo bohlam kuning di atas cangkir (warna brand hijau tua + kuning) | Seragam pegawai, neon box logo, antrean ojek online |

Upgrade kecil yang terlihat: kursi plastik jadi kursi kayu, lampu bohlam jadi lampu gantung rotan, kucing warkop tidur di etalase.

### Kos-kosan Bu Narti
- **Bentuk**: bangunan L 2 lantai, 8 x 3.5 + 3.5 x 6 petak. Selasar terbuka di depan kamar dengan pagar besi hijau.
- **Warna**: dinding kuning gading `#f0e0a8`, atap seng biru `#5a7aa8`, pintu kamar cokelat bernomor putih (1-10).
- **Detail**: jemuran di lantai 2, tangga besi di ujung, sepeda anak kos berderet, papan "TERIMA KOS PUTRA".
- **Upgrade (kelas XII)**: cat ulang putih-hijau, kanopi baru, wifi, kamar ber-AC (jendela berubah).

### Pos ronda
- Bale-bale kayu 2 x 2 petak, atap seng satu sisi, tiang bambu. Kentongan bambu tergantung, papan jadwal ronda, papan catur,
  termos. Lampu neon tunggal di malam hari. Warna kayu `#9a7440`, seng `#8a8a8a`.

### Musala kampung
- 5 x 5 petak, kubah kecil hijau `#3a8a6a` di atap limas, dinding putih `#f2f0e8` dengan keramik hijau setinggi lutut.
  Beduk kecil di serambi, rak sandal, keran wudu di samping. Speaker corong di tiang.

### Gapura Gang Kenanga
- Dua tiang bata 1 x 1 petak tinggi 70 unit, balok di atas bertuliskan "GANG KENANGA RT 03" (cat merah-putih).
  Diganti hiasan bambu dan bendera saat Agustus.

---

### SMA Negeri 3 Wirabumi

**Gaya umum**: bangunan sekolah negeri era lama yang dirawat. Dinding krem `#ecdcb4`, list putih, pilar persegi,
atap genteng merah bata `#a84a32`, koridor beratap dengan lantai tegel abu-kuning. Kusen jendela kayu cat cokelat `#7a4a2a`
dengan kaca bening, sebagian jendela berventilasi roster. Talang seng di setiap ujung atap.

| Bangunan | Ukuran & bentuk | Detail khas |
|---|---|---|
| **Gerbang & pos satpam** | Gerbang besi dorong hijau tua 10 petak + dua pilar bata dengan papan nama hijau "SMA NEGERI 3 WIRABUMI" berhuruf emas. Pos satpam 2 x 2 kaca. | Palang besi, tulisan "TERTIB BERSERAGAM", CCTV di pilar |
| **Gedung A** (kantor, 2 lt) | 20 x 9 petak, tangga di ujung barat, balkon lantai 2 | Lambang Tut Wuri di atas pintu utama, papan struktur organisasi, piala di lemari kaca |
| **Gedung B** (kelas, 3 lt) | 26 x 9 petak, tangga di dua ujung, balkon semua lantai | Papan nama kelas kayu di tiap pintu, tempat sampah tiga warna, jemuran lap pel, coretan meja |
| **Gedung C** (lab & seni, 2 lt) | 6 x 20 petak, memanjang utara-selatan | Lab: jendela lebar, wastafel, lemari kaca alat; ruang seni: lukisan siswa di dinding luar; studio musik: pintu berlapis karpet |
| **Aula / GOR** | 9 x 12 petak, atap pelana tinggi seng hijau `#3a6a4a`, dinding atas roster | Panggung di sisi utara, lapangan basket bergaris di lantai, tribun kayu dua tingkat |
| **Musala sekolah** | 9 x 7 petak, kubah kecil hijau | Tempat wudu keramik biru, rak sandal panjang |
| **Kantin** | Deretan 6 lapak 3 x 4 petak, atap seng menyambung, meja panjang di depan | Tiap lapak beda warna & papan nama: Bakso Mas Teguh, Nasi Uduk, Gorengan, Mi Ayam, Es Teh & Jus, Koperasi |
| **Toilet & gudang** | Bangunan rendah 20 x 4 petak | Pintu biru, keramik putih, gudang penuh matras & bola, ruang piket dengan sapu berderet |
| **Kebun & greenhouse** | Rangka besi + plastik UV, bedeng sayur | Papan tanaman berlabel nama latin |
| **Gedung Lama** | 9 x 7 petak, 1 lantai + loteng, gaya kolonial: dinding tebal putih kusam berlumut, atap genteng hitam berlumut, jendela tinggi berdaun kayu tertutup papan | Menara lonceng kecil di atap (kosong, lonceng ada di loteng), pintu jati besar digembok, rumput liar setinggi lutut |
| **Pohon beringin** | Pohon besar radius 4 petak dengan bangku melingkar | Akar gantung, coretan nama di bangku |

**Ruang kelas** (6 x 5 petak): papan tulis hijau, meja guru kayu di pojok, 16 meja siswa kayu cokelat, kipas angin
langit-langit, foto presiden & wakil, jam dinding, jadwal piket, sapu di pojok belakang. Variasi tiap kelas: poster, warna
gorden, coretan, tanaman.

---

### Pusat kota

| Bangunan | Bentuk & ukuran | Warna & material | Detail khas |
|---|---|---|---|
| **Alun-alun** | Lapangan rumput lonjong 17 x 11 petak dikelilingi jalan melingkar | Rumput, pagar besi rendah hijau, conblock abu | Dua beringin kembar di tengah, panggung kecil, lampu taman bulat; Sabtu malam: komidi putar, bianglala, tenda-tenda pasar malam |
| **Masjid Agung** | 7 x 6 petak + menara, kubah besar | Putih `#f2f0e8`, kubah hijau tosca `#3a9a8a` dengan puncak emas | Menara tinggi (landmark terlihat dari jauh), pelataran keramik, beduk besar |
| **Pasar Wirabumi** | Bangunan los besar 12 x 7 + los terbuka 9 x 5 | Atap seng tinggi berundak `#9aa0a6`, tiang beton, lantai becek | Lapak sayur, ikan, daging, kain; terpal warna-warni; gerobak dorong; spanduk "PASAR TERTIB" |
| **Terminal angkot** | Pelataran beton 14 x 8 petak, halte panjang beratap | Abu, garis kuning pembatas | Angkot biru muda `#3a8ac0` berjajar, papan jurusan, pedagang asongan |
| **Ruko Pelita** | Deretan ruko R1/R2/R3 sepanjang jalan raya | Lihat tipe ruko | Warnet "Nebula Net" (neon ungu), kafe, toko buku "Pena" (rak terlihat dari kaca), karaoke "Suara Emas" (lampu disko di jendela) |
| **Bengkel Mas Fajar** | 6 x 4 petak, setengah terbuka dengan rolling door | Abu kusam, lantai hitam oli | Ban bekas bertumpuk, kompresor, papan "TAMBAL BAN 24 JAM", lift motor (setelah upgrade) |
| **Plaza Wirabumi** | Kotak besar 10 x 7 petak, 3 lantai | Panel ungu muda `#c8b8e0` & kaca biru | Logo besar, pintu kaca putar, parkiran motor penuh, poster bioskop |
| **Puskesmas** | 6 x 5 petak, 1 lantai | Putih + list hijau `#3a8a6a` | Papan nama, ambulans kecil, bangku tunggu biru |
| **Kantor polisi** | 5 x 4 petak, 1 lantai | Krem + list cokelat, papan nama biru | Mobil patroli, tiang bendera, pos jaga |
| **Lapak kaki lima** | Gerobak 1.6 x 1.2 petak berderet | Warna-warni (cilok oranye, sate merah, es biru) | Asap sate, lampu petromaks malam |

### Perumahan Bukit Asri

| Bangunan | Bentuk | Detail |
|---|---|---|
| **Portal & pos satpam** | Pos kaca 2 x 1.5 petak, palang otomatis merah-putih | Papan "BUKIT ASRI: TAMU WAJIB LAPOR" |
| **Rumah Bram** | Rumah P2 diperbesar 9 x 6 petak, 2 lantai + atap limas tinggi hitam `#2a2c30`, dinding putih, pilar besar | Kolam renang biru di samping, gerbang besi otomatis tinggi, tiga mobil, CCTV, lampu taman |
| **Clubhouse** | 7 x 5 petak, dinding kaca, atap datar | Kolam renang besar, kursi santai, lampu warna-warni saat pesta |
| **Masjid kompleks** | 5 x 4 petak, modern minimalis | Dinding putih, kubah datar abu |
| **Taman & kolam** | Kolam bentuk bebas | Jalan setapak batu, bangku, lampu taman |

### Bantaran kali & selatan

| Bangunan | Bentuk | Detail |
|---|---|---|
| **Rumah panggung bantaran** | 2.4 x 2.2 petak, lantai naik 20 unit di atas tiang kayu | Papan kayu & triplek, atap seng karat, tangga kayu ke kali, jemuran di atas air |
| **Gudang markas Lampu Kota** | 7 x 5 petak, gudang beratap pelengkung seng | Dinding bata cat hitam dengan mural bohlam kuning besar, pintu geser besar, lampu bohlam berderet di luar; dalam: sofa bekas, samsak, papan tulis rencana, motor-motor |
| **Jembatan utama** | Jembatan beton 6 petak lebar 4, pagar besi biru | Coretan geng di pagar (berubah sesuai siapa yang menguasai), lampu jalan |
| **Jembatan bambu** | Lebar 1 petak, bambu diikat | Bergoyang saat dilewati |
| **STM Karya Bangsa** | Dua gedung L 10 x 4 & 4 x 6 petak, gaya pabrik | Beton abu, atap seng, bengkel praktik terbuka, papan nama merah, coretan "SERIGALA BESI" di tembok belakang |
| **Lahan proyek** | Area berpagar seng biru `#3a6aa8` 14 x 6 petak | Spanduk "SEGERA DIBANGUN: GRAHA MEGANTARA SUPERBLOK", ekskavator kuning, tumpukan pipa, kontainer kantor, lampu sorot |
| **Sirkuit Jalan Lingkar** | Jalan aspal melingkar | Garis start kotak-kotak, tribun bambu sementara saat balap resmi, ban pembatas cat merah-putih |

### Perbukitan utara

| Bangunan | Bentuk | Detail |
|---|---|---|
| **Menara pemancar** | Rangka besi segitiga tinggi ±10 petak, lampu merah berkedip di puncak | Rumah genset kecil, pagar kawat bolong, tangga ke platform pertama (tempat duduk melihat lampu kota) |
| **Pondok kebun teh** | Gubuk kayu 3 x 3 petak | Teras menghadap danau, perahu kecil |
| **Warung puncak** | Warung bambu 4 x 3 | Jagung bakar & wedang jahe, bangku menghadap kota |

---

## Daftar periksa untuk tiap model bangunan baru

1. Ukuran dalam petak dan jumlah lantai.
2. Dua lapis (`splitModel`): badan (dinding) dan atap/kanopi.
3. Warna dinding, atap, kusen, aksen dari palet wilayah, plus satu warna "pembeda".
4. Minimal tiga detail kecil (benda di teras, papan nama, tanaman, kabel, tandon).
5. Versi malam (titik lampu) dan, kalau perlu, versi event (bendera 17-an, lampu Ramadan, hiasan Tahun Baru).
6. Untuk properti pemain: model per level upgrade.
