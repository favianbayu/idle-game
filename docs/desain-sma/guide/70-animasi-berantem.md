# 70. Animasi Berantem

Prinsip: **mudah dimainkan, enak dilihat**. Dua tombol serang + satu tombol hindar + satu tombol pegang. Kombinasi dan
waktu yang membuat dalamnya. Tidak ada darah: lawan kalah = pingsan (bintang berputar) atau kabur.

## Kontrol

| Tombol | Aksi |
|---|---|
| **A** (pukul) | Pukulan ringan cepat |
| **B** (tendang) | Tendangan, lebih lambat tapi jangkauan panjang |
| **X** (hindar) | Guling/geser ke arah stik; tahan = tangkis (block) |
| **Y** (pegang) | Pegang/kunci lawan, ambil senjata improvisasi |
| **RT** (kunci target) | Kamera dan arah serangan mengunci ke satu lawan |
| **LT + tombol** | Jurus spesial (butuh meter **Nyali** penuh) |

Di keyboard: J pukul, K tendang, L hindar, I pegang, Tab kunci target, Shift + tombol = jurus.

## Meter

- **Darah/Stamina** pemain (bar hijau): habis = pingsan, bangun di rumah/UKS.
- **Meter Nyali** (bar oranye): terisi dari serangan yang kena, tangkis tepat, dan provokasi. Penuh = jurus spesial.
- **Pusing lawan** (bintang kecil di atas kepala): terisi dari combo. Penuh = lawan limbung, bisa dikunci atau dibanting.

## Gerakan dasar

| Gerakan | Input | Animasi voxel | Frame (12 fps) |
|---|---|---|---|
| Jab | A | Tangan depan maju, badan sedikit miring | 4 (1 antisipasi, 2 kena, 1 kembali) |
| Straight | A, A | Tangan belakang memutar pinggul | 5 |
| Hook | A, A, A | Lengan melengkung, badan memutar 45° | 6 |
| Tendangan depan | B | Lutut naik, kaki lurus ke depan | 6 |
| Tendangan samping | → + B | Badan miring, kaki menyamping (jangkauan 1.5 petak) | 7 |
| Sapuan kaki | ↓ + B | Jongkok, kaki menyapu lingkaran, lawan jatuh | 8 |
| Tangkis | Tahan X | Kedua lengan di depan wajah; tangkis tepat waktu (6 frame awal) = **parry**, lawan terdorong | 2 + tahan |
| Guling | X + arah | Guling ke arah stik, kebal 4 frame | 8 |
| Mundur cepat | X tanpa arah | Lompat kecil ke belakang | 5 |
| Provokasi | Tekan stik | Tepuk dada / "sini!" (Nyali +, tapi terbuka) | 10 |

## Combo

| Nama | Input | Hasil |
|---|---|---|
| **Tiga Kopi** | A, A, A | Jab, straight, hook. Pusing +30 |
| **Ojek Lewat** | A, A, B | Dua pukulan lalu tendangan samping, lawan terpental 1 petak |
| **Sapu Pasar** | A, ↓ + B | Pukulan lalu sapuan, lawan jatuh (bisa diinjak? **Tidak**: menyerang yang jatuh = reputasi -) |
| **Angkot Ngerem** | B, B | Dua tendangan depan, mendorong lawan ke dinding (wall bounce) |
| **Bel Pulang** | A, A, A, B | Combo akhir: tendangan berputar, kena semua lawan dalam 1 petak |
| **Balas Tangkis** | Parry lalu A | Counter cepat, kerusakan x1.5 |

## Pegangan & kuncian

| Kuncian | Input | Animasi |
|---|---|---|
| Kerah | Y dekat lawan | Pegang kerah, lawan meronta (tekan A berulang untuk pukul perut) |
| Dorong | Y lalu arah | Dorong lawan ke arah itu (ke dinding, tong sampah, kolam) |
| Banting bahu | Y lalu B | Angkat dan banting lewat bahu, lawan terbaring 2 detik |
| Kunci lengan | Y saat lawan pusing | Pelintir lengan ke belakang, lawan menyerah (pertarungan selesai lebih awal, reputasi +) |
| Headlock | Y dari belakang | Rangkul leher main-main, lawan pusing perlahan |
| Lepas pegangan | Tekan X berulang | Saat pemain dipegang lawan |

## Senjata improvisasi

Tidak ada senjata tajam (aturan Lampu Kota). Senjata improvisasi rusak setelah beberapa pukulan.

| Benda | Ditemukan | Efek | Tahan |
|---|---|---|---|
| Sapu | Kelas, halaman | Jangkauan panjang, sapuan lebar (memakai sistem animasi sapu) | 6 pukulan |
| Penggaris kayu | Kelas | Cepat, kerusakan kecil | 8 |
| Tas ransel | Pemain sendiri | Ayunan memutar, pukul mundur | Tak terbatas (kerusakan kecil) |
| Kursi plastik | Kantin, warkop | Kerusakan besar, sekali pakai (patah) | 1-2 |
| Tong sampah | Gang | Dilempar (kena Fisika: jarak), atau dipakai topi lawan (lawan buta 2 detik) | 1 |
| Ember | Kamar mandi, kampung | Pasang di kepala lawan | 1 |
| Helm | Motor | Pukulan berat lambat | 4 |
| Galon kosong | Rumah Gilang | Lempar, memantul | 1 |
| Bola futsal/basket | Lapangan | Tendang/lempar, memantul ke lawan lain | Tak terbatas |
| Bom asap (racikan Kimia) | Racikan | Kabur atau serangan kejutan | 1 |

## Jurus spesial (meter Nyali penuh)

| Jurus | Dari | Animasi |
|---|---|---|
| **Tendangan Senja** | Default | Lompat berputar, tendangan menyapu, efek garis oranye |
| **Sapuan Kabut** | Wulan 4 hati | Gerak rendah, menyapu 3 lawan sekaligus, debu putih |
| **Kunci Daun Teh** | Wulan 2 hati | Kuncian silat cepat, lawan langsung menyerah |
| **Bunga Teh Mekar** | Wulan 6 hati | Combo 7 serangan silat, kamera melambat, kelopak hijau |
| **Gas Pol** | Lampu Kota (Bang Jaka) | Lari menabrak dengan bahu, menembus barisan |
| **Ojek Ekspres** | Mas Fajar | Lempar kunci pas lalu tendang |
| **Upper Gorengan** | Bimo 6 hati (lucu) | Uppercut dengan efek gorengan terbang |
| **Lonceng** | Bab 13 | Pukulan ke tanah, gelombang suara lonceng, semua lawan pusing |

## Keroyokan

- Maksimal **5 lawan aktif**. Lawan menunggu giliran membentuk lingkaran (hanya 2 yang menyerang bersamaan) supaya
  tidak frustrasi.
- Indikator serangan: tanda "!" merah di atas lawan 0.5 detik sebelum memukul (waktu untuk tangkis/hindar).
- **Teman membantu**: Uti, Arga, Bimo (6+ hati), anggota Lampu Kota bisa dipanggil (tombol arah atas) sekali per
  pertarungan. Mereka mengambil satu atau dua lawan.
- Kabur: lari keluar layar 5 detik tanpa terkena = selesai, dengan konsekuensi reputasi.

## Tipe lawan

| Tipe | Contoh | Perilaku |
|---|---|---|
| Penggertak | Anak geng Bram | Lambat, sering provokasi, mudah dipukul |
| Petarung | Rio | Kuat, tangkis sering, harus dipegang |
| Licik | Kevin | Menghindar, lempar barang, memanggil teman |
| Pembalap | Anak Serigala Besi | Cepat, tendangan, rentan sapuan |
| Preman dewasa | Anak buah Pak Gito, preman terminal | Darah tebal, pukulan berat, lambat |
| Satpam bayaran | Proyek Pak Haris | Bertameng tongkat (tanpa senjata tajam), formasi |

## Bos

| Bos | Bab | Pola | Kelemahan |
|---|---|---|---|
| **Rio** | Bab 2 | Serudukan (tangkis lalu counter) | Lelah setelah 3 serudukan |
| **Bram** | Bab 5 | Combo cepat, provokasi, memanggil Rio & Kevin di 50% | Parry tepat; serangan saat dia provokasi |
| **Kobar** | Bab 6 | Rantai motor (diayun, bukan tajam), tendangan berat, di jembatan | Dorong ke pagar jembatan |
| **Bang Jaka** (ujian) | Bab 3 | Adil, satu lawan satu, mengajarkan tangkis | Tutorial tingkat lanjut |
| **Preman terminal** | Bab 3 | Tutorial keroyokan (Wulan masuk menolong) | |
| **Pak Bondan** | Bab 13 | Kepala keamanan proyek, 3 fase: tinju, bantingan, memanggil anak buah | Kunci lengan setelah pusing; jurus Lonceng |

## Kamera & efek

- Kamera sedikit mendekat saat combo ke-3, **hit-stop** 2 frame saat pukulan kena, guncangan layar ringan saat bantingan.
- Efek: garis gerak putih, bintang kecil (pusing), debu saat jatuh, angka kerusakan opsional (bisa dimatikan).
- Lawan kalah: animasi duduk pusing dengan bintang berputar atau lari terbirit-birit sambil memegang celana.
