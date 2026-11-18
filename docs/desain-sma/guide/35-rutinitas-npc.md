# 35. Rutinitas Harian NPC

Jadwal per jam semua NPC bernama: **di mana** (tempat + koordinat petak), **sedang apa** (kegiatan + animasi), **pakai baju
apa** (outfit), dan **lewat mana** ke tempat itu (moda, jalan, perkiraan waktu tempuh). Segmen ini dibangkitkan dari
`guide/data/*.py` oleh `guide/data/buat_guide.py`. Versi mesin ada di `guide/data/npc.json` (semua hari Senin-Minggu dan
Libur Panjang sudah dijabarkan, termasuk rute). Kalau ada yang diubah, ubah file data lalu jalankan ulang skripnya.

## Aturan umum

| Aturan | Isi |
|---|---|
| Jam game | 1 jam = 40 detik nyata. Hari mulai 06.00, pemain ketiduran kalau belum tidur jam 02.00. Slot sebelum 06.00 menentukan posisi NPC saat hari dimulai |
| Jenis hari | **S** = Senin-Jumat, **B** = Sabtu, **M** = Minggu & tanggal merah, **Libur** = Libur Panjang (pakai M, ditambah slot khusus kalau ada). Kolom *hari* di slot membatasi slot ke hari tertentu |
| Jumat | Sekolah pulang 11.30. Cowok muslim salat Jumat 11.45-12.45 di Masjid Agung, lalu pulang sampai slot sore berikutnya. Sudah dijabarkan di JSON |
| Seragam | `sekolah` = putih abu Senin-Selasa & Kamis, Pramuka hari Rabu, batik hari Jumat (sesuai sekolah masing-masing) |
| Hujan | Kalau hujan, outfit diganti `hujan` (kalau NPC punya) dan slot luar ruang (taman, lapangan, alun-alun) pindah ke tempat beratap terdekat atau rumah |
| Bab | Slot yang menyebut bab (liga, track day, koki warkop) baru aktif setelah bab itu (segmen 04). Sebelumnya NPC tetap di slot sebelumnya |
| Event | Event cerita di kalender (segmen 04) menimpa jadwal hari itu. Event hati (segmen 37) hanya muncul saat NPC ada di tempat & jam pemicu |
| Rute | Kolom rute = cara NPC sampai ke tempat slot itu dari slot sebelumnya. NPC berangkat lebih awal sebesar waktu tempuh supaya tiba tepat jam mulai. Jarak < 10 petak selalu jalan kaki |
| Koordinat | Petak, sama dengan peta kota/daerah. Tanda `~` = perkiraan (rumah, toko kecil): pakai pintu bangunan terdekat. Ruang sekolah `sma.*` memakai denah segmen 81/83 |

### Moda perjalanan

| Moda | Kecepatan (petak/jam game) | Jalur |
|---|---|---|
| Jalan kaki | 180 | trotoar, gang, setapak |
| Sepeda | 420 | jalan & gang |
| Motor | 900 | jalan & gang (bukan setapak pendakian) |
| Angkot | 700 | naik/turun di pasar, terminal, halte; ikut trayek |
| Bus antarkota | 900 | Terminal bus antarkota - halte zona |
| Mobil diantar sopir | 900 | jalan besar saja |
| Perahu | 300 | air |

### Animasi

`duduk`, `duduk_tulis`, `baca`, `ngobrol`, `makan`, `masak`, `jualan`, `kasir`, `sapu`, `jongkok`, `berdiri`, `jalan`, `lari`,
`tidur`, `tidur_meja`, `tidur_kursi`, `salat`, `mengajar`, `gitar`, `piano`, `nyanyi`, `basket`, `futsal`, `olahraga`, `skate`,
`silat`, `mancing`, `servis`, `naik_motor`, `sepeda`, `foto`, `gambar`, `lukis`, `hp`, `angkut`, `petik`, `jala`, `kerja_mesin`,
`hilang` (NPC keluar peta, misal sekolah lain). Nama mengikuti segmen 71; animasi yang belum ada pakai yang paling mirip.

## NPC utama cewek

### Nadia Kusuma

Rumah: **Rumah Nadia, gang belakang Masjid Agung** (152, 55~). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `sekolah` | Kemeja putih krem lengan panjang, rok abu panjang, hijab abu-biru, badge OSIS, pantofel hitam (Rabu Pramuka, Jumat batik) |
| `osis` | Jas almamater biru tua di atas seragam, map plastik bening |
| `rumah` | Gamis rumahan hijau mint, hijab instan, kaus kaki |
| `jalan` | Tunik krem, kulot cokelat susu, tas selempang kanvas, kets putih |
| `olahraga` | Kaus lengan panjang, celana training, hijab sport, raket |
| `hujan` | Ponco kuning, payung lipat biru |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 04.30-06.15 | Rumah Nadia, gang belakang Masjid Agung (152, 55~) | Subuh berjamaah, menyiapkan adik kembar | `salat` | `rumah` |  |
| 06.15-06.30 | SMA Negeri 3 Wirabumi, gerbang (110, 62) | Berangkat jalan kaki lewat alun-alun | `jalan` | `sekolah` | Jalan kaki dari Rumah Nadia, Jl. Merdeka, ±14 mnt |
| 06.30-07.00 | Kelas X-2 (110, 62) | Datang paling awal, merapikan meja, membaca catatan | `duduk_tulis` | `sekolah` | di dalam sekolah |
| 07.00-09.30 | Kelas X-2 (110, 62) | Pelajaran, baris depan | `duduk_tulis` | `sekolah` |  |
| 09.30-10.00 | Perpustakaan (pojok jendela) (110, 62) | Istirahat 1 di perpustakaan pojok jendela | `baca` | `sekolah` | di dalam sekolah |
| 10.00-12.00 | Kelas X-2 (110, 62) | Pelajaran | `duduk_tulis` | `sekolah` | di dalam sekolah |
| 12.00-12.30 | Musala sekolah (110, 62) | Salat zuhur | `salat` | `sekolah` | di dalam sekolah |
| 12.30-14.00 | Kelas X-2 (110, 62) | Pelajaran | `duduk_tulis` | `sekolah` | di dalam sekolah |
| 14.00-16.30 (Sen, Rab, Kam) | Ruang OSIS (110, 62) | Rapat OSIS | `ngobrol` | `osis` | di dalam sekolah |
| 14.00-16.30 (Sel, Jum) | Perpustakaan (pojok jendela) (110, 62) | Mengerjakan tugas, menggambar komik di buku 'Catatan Fisika' | `duduk_tulis` | `sekolah` | di dalam sekolah |
| 16.30-18.00 | Masjid Agung (146, 60) | Mengajar ngaji adik-adik | `mengajar` | `rumah` | Jalan kaki dari Kelas X-2, Jl. Merdeka, ±12 mnt |
| 18.00-21.30 | Rumah Nadia, gang belakang Masjid Agung (152, 55~) | Makan malam, belajar di kamar, chat grup OSIS | `duduk_tulis` | `rumah` | Jalan kaki dari Masjid Agung, jalan terdekat (pathfinding), ±3 mnt |
| 21.30-04.30 | Rumah Nadia, gang belakang Masjid Agung (152, 55~) | Tidur | `tidur` | `rumah` |  |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-08.00 | Rumah Nadia, gang belakang Masjid Agung (152, 55~) | Membantu ibu menjahit pesanan | `duduk` | `rumah` |  |
| 08.00-11.00 | Pasar Wirabumi & terminal angkot (114, 98) | Belanja ke pasar bersama ibu | `jalan` | `jalan` | Jalan kaki dari Rumah Nadia, Jl. Merdeka, Jl. Raya Wirabumi, ±19 mnt |
| 11.00-14.00 | Rumah Nadia, gang belakang Masjid Agung (152, 55~) | Masak, tidur siang | `masak` | `rumah` | Jalan kaki dari Pasar Wirabumi & terminal angkot, jalan terdekat (pathfinding), ±19 mnt |
| 14.00-16.30 | Taman kota: lapangan basket umum, skatepark, air mancur (126, 46) | Membaca di bangku dekat air mancur | `baca` | `jalan` | Jalan kaki dari Rumah Nadia, jalan terdekat (pathfinding), ±9 mnt |
| 16.30-18.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Melihat komik baru (malu-malu) | `baca` | `jalan` | Jalan kaki dari Taman kota: lapangan basket umum, jalan terdekat (pathfinding), ±9 mnt |
| 18.00-22.00 | Rumah Nadia, gang belakang Masjid Agung (152, 55~) | Belajar, menggambar komik | `duduk_tulis` | `rumah` | Jalan kaki dari Toko Buku Pena & studio lantai 2, jalan terdekat (pathfinding), ±11 mnt |
| 22.00-04.30 | Rumah Nadia, gang belakang Masjid Agung (152, 55~) | Tidur | `tidur` | `rumah` |  |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.30-08.00 | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Bulu tangkis Minggu pagi | `olahraga` | `olahraga` | Jalan kaki dari Rumah Nadia, jalan terdekat (pathfinding), ±7 mnt |
| 08.00-12.00 | Rumah Nadia, gang belakang Masjid Agung (152, 55~) | Bersih-bersih rumah, menjaga adik | `sapu` | `rumah` | Jalan kaki dari Alun-alun, jalan terdekat (pathfinding), ±7 mnt |
| 12.00-15.00 | Rumah Nadia, gang belakang Masjid Agung (152, 55~) | Menulis rencana minggu depan | `duduk_tulis` | `rumah` |  |
| 15.00-17.30 | Taman kota: lapangan basket umum, skatepark, air mancur (126, 46) | Jalan sore, membaca | `baca` | `jalan` | Jalan kaki dari Rumah Nadia, jalan terdekat (pathfinding), ±9 mnt |
| 17.30-21.30 | Rumah Nadia, gang belakang Masjid Agung (152, 55~) | Ngaji, belajar | `baca` | `rumah` | Jalan kaki dari Taman kota: lapangan basket umum, jalan terdekat (pathfinding), ±9 mnt |
| 21.30-04.30 | Rumah Nadia, gang belakang Masjid Agung (152, 55~) | Tidur | `tidur` | `rumah` |  |

**Libur Panjang (tambahan, sisanya ikut Minggu)**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 07.00-12.00 | Perpustakaan daerah (136, 66~) | Persiapan program OSIS semester depan | `duduk_tulis` | `jalan` |  |

### Sekar Ayuningtyas

Rumah: **Rumah Sekar, Blok C-7** (220, 44~). Moda utama: angkot.

| Outfit | Isi |
|---|---|
| `sekolah` | Seragam, lengan digulung sekali, jaket jeans kebesaran, kets kanvas hitam |
| `band` | Kaus band indie pudar, kargo hitam, gelang karet warna-warni |
| `rumah` | Sweater lavender kebesaran, celana piama kotak, kaus kaki tebal |
| `jalan` | Flanel ungu terbuka di atas kaus putih, rok jeans, sling bag kecil |
| `pentas` | Gaun hitam sederhana, jaket jeans penuh pin, boots |
| `hujan` | Hoodie bertudung, gitar dibungkus plastik besar |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-06.20 | Rumah Sekar, Blok C-7 (220, 44~) | Bangun telat, sarapan roti sambil jalan | `makan` | `sekolah` |  |
| 06.20-06.50 | SMA Negeri 3 Wirabumi, gerbang (110, 62) | Angkot dari gerbang perumahan, earphone di telinga | `duduk` | `sekolah` | Angkot dari Rumah Sekar, Jl. Perumahan, Jl. GOR, ±10 mnt |
| 06.50-09.30 | Kelas X-3 (110, 62) | Pelajaran, mencoret lirik di pinggir buku | `duduk_tulis` | `sekolah` | di dalam sekolah |
| 09.30-10.00 | Tangga belakang Gedung B (110, 62) | Istirahat 1, gitar akustik pelan | `gitar` | `sekolah` | di dalam sekolah |
| 10.00-12.00 | Kelas X-3 (110, 62) | Pelajaran | `duduk_tulis` | `sekolah` | di dalam sekolah |
| 12.00-12.30 | Tangga belakang Gedung B (110, 62) | Makan bekal sendirian | `makan` | `sekolah` | di dalam sekolah |
| 12.30-14.00 | Kelas X-3 (110, 62) | Pelajaran, setengah melamun | `duduk` | `sekolah` | di dalam sekolah |
| 14.00-17.00 (Sel, Kam) | Studio musik (110, 62) | Latihan band | `gitar` | `band` | di dalam sekolah |
| 14.00-17.00 (Sen, Rab, Jum) | Atap Gedung B (110, 62) | Menulis lagu di atap (lewat jendela gudang) | `gitar` | `sekolah` | di dalam sekolah |
| 17.00-17.40 | Rumah Sekar, Blok C-7 (220, 44~) | Pulang naik angkot | `duduk` | `sekolah` | Angkot dari Kelas X-3, jalan terdekat (pathfinding), ±10 mnt |
| 17.40-19.00 | Rumah Sekar, Blok C-7 (220, 44~) | Makan malam dingin dengan mama | `makan` | `rumah` |  |
| 19.00-23.30 | Rumah Sekar, Blok C-7 (220, 44~) | Kamar loteng: menulis lagu, merekam cover anonim | `gitar` | `rumah` |  |
| 23.30-06.00 | Rumah Sekar, Blok C-7 (220, 44~) | Tidur | `tidur` | `rumah` |  |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-11.00 | Rumah Sekar, Blok C-7 (220, 44~) | Tidur sampai siang | `tidur` | `rumah` |  |
| 11.00-13.00 | Rumah Sekar, Blok C-7 (220, 44~) | Sarapan kesiangan, main gitar | `gitar` | `rumah` |  |
| 13.00-16.00 | Pasar loak & lapak rongsok (138, 108) | Berburu kaset & piringan bekas | `jalan` | `jalan` | Angkot dari Rumah Sekar, Jl. Raya Wirabumi, ±9 mnt |
| 16.00-18.00 | Studio musik (110, 62) | Latihan pensi (Sabtu) | `gitar` | `band` | Angkot dari Pasar loak & lapak rongsok, jalan terdekat (pathfinding), ±5 mnt |
| 18.00-22.00 | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Pasar malam, duduk dekat panggung dangdut | `duduk` | `jalan` | Angkot dari Studio musik, jalan terdekat (pathfinding), ±3 mnt |
| 22.00-00.30 | Rumah Sekar, Blok C-7 (220, 44~) | Menulis lagu | `gitar` | `rumah` | Angkot dari Alun-alun, jalan terdekat (pathfinding), ±7 mnt |
| 00.30-06.00 | Rumah Sekar, Blok C-7 (220, 44~) | Tidur | `tidur` | `rumah` |  |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-11.00 | Rumah Sekar, Blok C-7 (220, 44~) | Tidur | `tidur` | `rumah` |  |
| 11.00-15.00 | Rumah Sekar, Blok C-7 (220, 44~) | Main gitar, menonton video konser | `gitar` | `rumah` |  |
| 15.00-16.30 | Rumah Sekar, Blok C-7 (220, 44~) | Les piano yang dia benci (guru datang ke rumah) | `duduk` | `rumah` |  |
| 16.30-18.30 | Kebun teh & danau kota (214, 12) | Duduk di tepi danau, menulis lirik | `duduk_tulis` | `jalan` | Jalan kaki dari Rumah Sekar, jalan terdekat (pathfinding), ±11 mnt |
| 18.30-23.30 | Rumah Sekar, Blok C-7 (220, 44~) | Kamar loteng | `gitar` | `rumah` | Angkot dari Kebun teh & danau kota, jalan terdekat (pathfinding), ±3 mnt |
| 23.30-06.00 | Rumah Sekar, Blok C-7 (220, 44~) | Tidur | `tidur` | `rumah` |  |

### Laras Wibisana

Rumah: **Rumah papan biru Laras, dekat jembatan** (68, 122~). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `jualan` | Kaus oranye pudar, celemek kunyit bergambar daun, celana training, sandal karet, handuk kecil di bahu |
| `sekolah` | Seragam agak kusut, sepatu hitam bersol tambal |
| `rumah` | Daster batik peninggalan ibu dipotong pendek |
| `jalan` | Kemeja kotak hijau diikat di pinggang, jeans, kets putih bekas |
| `malam` | Jaket parasut oranye, tas pinggang uang receh |
| `hujan` | Plastik sewa payung (jadi ojek payung) |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 03.30-06.20 | Pasar Wirabumi & terminal angkot (114, 98) | Masak lalu jualan nasi uduk di lapak pasar | `jualan` | `jualan` | Jalan kaki dari Rumah papan biru Laras, Jl. Bantaran, Jl. Selatan, ±17 mnt |
| 06.20-06.40 | SMA Negeri 3 Wirabumi, gerbang (110, 62) | Lari ke sekolah, ganti seragam di toilet | `lari` | `sekolah` | Jalan kaki dari Pasar Wirabumi & terminal angkot, Jl. Selatan, Jl. Raya Wirabumi, ±12 mnt |
| 06.40-09.30 | Kelas X-2 (110, 62) | Pelajaran, berusaha tidak tidur | `duduk` | `sekolah` | di dalam sekolah |
| 09.30-10.00 | Kelas X-2 (110, 62) | Tidur di meja saat istirahat 1 | `tidur_meja` | `sekolah` |  |
| 10.00-12.00 | Kelas X-2 (110, 62) | Pelajaran | `duduk_tulis` | `sekolah` |  |
| 12.00-12.30 | Kantin (110, 62) | Menawarkan nasi uduk sisa ke anak kantin | `jualan` | `sekolah` | di dalam sekolah |
| 12.30-14.00 | Kelas X-2 (110, 62) | Pelajaran | `duduk_tulis` | `sekolah` | di dalam sekolah |
| 14.00-17.00 | Rumah papan biru Laras, dekat jembatan (68, 122~) | Mengurus ibu yang sakit dan adik Doni, belanja kecil | `masak` | `rumah` | Jalan kaki dari Kelas X-2, jalan terdekat (pathfinding), ±24 mnt |
| 17.00-21.00 | Rumah papan biru Laras, dekat jembatan (68, 122~) | Belajar sebentar, menghitung buku kas | `duduk_tulis` | `rumah` |  |
| 21.00-03.30 | Rumah papan biru Laras, dekat jembatan (68, 122~) | Tidur | `tidur` | `rumah` |  |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 03.30-09.00 | Pasar Wirabumi & terminal angkot (114, 98) | Jualan nasi uduk (Sabtu ramai) | `jualan` | `jualan` | Jalan kaki dari Rumah papan biru Laras, jalan terdekat (pathfinding), ±17 mnt |
| 09.00-12.00 | Pasar Wirabumi & terminal angkot (114, 98) | Belanja bahan minggu depan | `jalan` | `jualan` |  |
| 12.00-16.00 | Rumah papan biru Laras, dekat jembatan (68, 122~) | Tidur siang, mengurus rumah | `tidur` | `rumah` | Jalan kaki dari Pasar Wirabumi & terminal angkot, jalan terdekat (pathfinding), ±17 mnt |
| 16.00-22.00 | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Jualan es teh di pasar malam | `jualan` | `malam` | Jalan kaki dari Rumah papan biru Laras, jalan terdekat (pathfinding), ±30 mnt |
| 22.00-03.30 | Rumah papan biru Laras, dekat jembatan (68, 122~) | Tidur | `tidur` | `rumah` | Jalan kaki dari Alun-alun, jalan terdekat (pathfinding), ±30 mnt |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 03.30-09.00 | Pasar Wirabumi & terminal angkot (114, 98) | Jualan nasi uduk | `jualan` | `jualan` | Jalan kaki dari Rumah papan biru Laras, jalan terdekat (pathfinding), ±17 mnt |
| 09.00-14.00 | Rumah papan biru Laras, dekat jembatan (68, 122~) | Membantu katering hajatan tetangga | `masak` | `rumah` | Jalan kaki dari Pasar Wirabumi & terminal angkot, jalan terdekat (pathfinding), ±17 mnt |
| 14.00-16.00 | Jembatan Kali Cendana (Bantaran) (72, 125~) | Duduk di jembatan, satu-satunya waktu santai | `duduk` | `jalan` | Jalan kaki dari Rumah papan biru Laras, jalan terdekat (pathfinding), ±2 mnt |
| 16.00-21.00 | Rumah papan biru Laras, dekat jembatan (68, 122~) | Masak, belajar | `masak` | `rumah` | Jalan kaki dari Jembatan Kali Cendana, jalan terdekat (pathfinding), ±2 mnt |
| 21.00-03.30 | Rumah papan biru Laras, dekat jembatan (68, 122~) | Tidur | `tidur` | `rumah` |  |

**Libur Panjang (tambahan, sisanya ikut Minggu)**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 09.00-15.00 | Warung seafood Bu Romlah (130, 258~) | Kerja harian di warung seafood Bu Romlah (Libur Panjang) | `jualan` | `jualan` |  |

### Uti (Putri Maharani)

Rumah: **Rumah & garasi seng Uti (3 rumah dari warkop)** (52, 88~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `sekolah` | Seragam dengan celana panjang abu, lengan digulung, jaket marun almarhum kakak |
| `futsal` | Jersey putri SMA 3 nomor 7, decker, sepatu futsal merah |
| `bengkel` | Wearpack biru tua diikat di pinggang, kaus hitam, sarung tangan kain |
| `jalan` | Kaus band motor, jeans robek lutut, boots kerja, topi terbalik |
| `malam` | Jaket marun, helm half-face kuning bergambar petir |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-06.20 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Mampir ke warkop, mengajak pemain berangkat bareng | `berdiri` | `sekolah` | Jalan kaki dari Rumah & garasi seng Uti, jalan terdekat (pathfinding), ±2 mnt |
| 06.20-06.35 | Parkiran siswa (110, 62) | Bersepeda ke sekolah (motor Mas Danu belum jadi) | `sepeda` | `sekolah` | Sepeda dari Warkop Simpang & rumah Om Darto, Gang Kenanga, Jl. Raya Wirabumi, ±10 mnt |
| 06.35-09.30 | Kelas X-1 (110, 62) | Pelajaran, menggambar mesin di buku | `duduk` | `sekolah` | di dalam sekolah |
| 09.30-10.00 | Lapangan upacara / futsal (110, 62) | Futsal kecil saat istirahat | `futsal` | `sekolah` | di dalam sekolah |
| 10.00-12.00 | Kelas X-1 (110, 62) | Pelajaran | `duduk` | `sekolah` | di dalam sekolah |
| 12.00-12.30 | Kantin (110, 62) | Makan bakso | `makan` | `sekolah` | di dalam sekolah |
| 12.30-14.00 | Kelas X-1 (110, 62) | Pelajaran | `duduk` | `sekolah` | di dalam sekolah |
| 15.00-17.00 (Sen, Rab, Jum) | Lapangan upacara / futsal (110, 62) | Latihan futsal | `futsal` | `futsal` | di dalam sekolah |
| 14.30-17.30 (Sel, Kam) | Ruko Pelita & bengkel Mas Fajar (170, 84) | Kerja di bengkel Mas Fajar | `servis` | `bengkel` | Sepeda dari Kelas X-1, Jl. Raya Wirabumi, ±9 mnt |
| 17.30-19.00 | Rumah & garasi seng Uti (3 rumah dari warkop) (52, 88~) | Mandi, makan, membantu ibu | `makan` | `jalan` | Motor dari Kelas X-1, jalan terdekat (pathfinding), ±4 mnt |
| 19.00-22.30 | Rumah & garasi seng Uti (3 rumah dari warkop) (52, 88~) | Garasi: merakit motor Mas Danu | `servis` | `bengkel` |  |
| 22.30-06.00 | Rumah & garasi seng Uti (3 rumah dari warkop) (52, 88~) | Tidur | `tidur` | `jalan` |  |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-07.00 | Rumah & garasi seng Uti (3 rumah dari warkop) (52, 88~) | Memberi makan kucing Rossi | `jongkok` | `jalan` |  |
| 07.00-17.00 | Ruko Pelita & bengkel Mas Fajar (170, 84) | Bengkel seharian | `servis` | `bengkel` | Sepeda dari Rumah & garasi seng Uti, jalan terdekat (pathfinding), ±17 mnt |
| 17.00-20.00 | Rumah & garasi seng Uti (3 rumah dari warkop) (52, 88~) | Garasi | `servis` | `bengkel` | Motor dari Ruko Pelita & bengkel Mas Fajar, jalan terdekat (pathfinding), ±8 mnt |
| 21.00-00.00 | Jl. Lingkar Selatan, garis start drag (214, 166) | Nonton balap liar dari pinggir (jaket & helm) | `berdiri` | `malam` | Motor dari Rumah & garasi seng Uti, Jl. Selatan, Jl. Lingkar Selatan, ±12 mnt |
| 00.00-06.00 | Rumah & garasi seng Uti (3 rumah dari warkop) (52, 88~) | Tidur | `tidur` | `jalan` | Motor dari Jl. Lingkar Selatan, jalan terdekat (pathfinding), ±12 mnt |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-07.00 | Rumah & garasi seng Uti (3 rumah dari warkop) (52, 88~) | Memberi makan Rossi | `jongkok` | `jalan` |  |
| 07.00-11.00 | Lapangan bola kampung (88, 104) | Liga futsal kampung | `futsal` | `futsal` | Motor dari Rumah & garasi seng Uti, jalan terdekat (pathfinding), ±3 mnt |
| 11.00-17.00 | Rumah & garasi seng Uti (3 rumah dari warkop) (52, 88~) | Garasi, mencari suku cadang online | `servis` | `bengkel` | Motor dari Lapangan bola kampung, jalan terdekat (pathfinding), ±3 mnt |
| 17.00-20.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Nongkrong di warkop | `duduk` | `jalan` | Jalan kaki dari Rumah & garasi seng Uti, jalan terdekat (pathfinding), ±2 mnt |
| 20.00-22.30 | Rumah & garasi seng Uti (3 rumah dari warkop) (52, 88~) | Garasi | `servis` | `bengkel` | Jalan kaki dari Warkop Simpang & rumah Om Darto, jalan terdekat (pathfinding), ±2 mnt |
| 22.30-06.00 | Rumah & garasi seng Uti (3 rumah dari warkop) (52, 88~) | Tidur | `tidur` | `jalan` |  |

### Sasha Aurelia

Rumah: **Rumah Sasha, Blok A-1** (212, 62~). Moda utama: mobil diantar sopir.

| Outfit | Isi |
|---|---|
| `sekolah` | Seragam dipermak pas badan, cardigan rajut pink, jam tangan emas |
| `geng` | Kacamata hitam di kepala, tas tangan putih, loafers mengilap |
| `rumah` | Piama satin putih, sandal bulu |
| `jalan` | Dress bunga pastel, jaket denim putih, tas mini |
| `rahasia` | Hoodie hitam polos, celana training, masker, kets lusuh (penyamaran) |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-06.30 | Rumah Sasha, Blok A-1 (212, 62~) | Bersiap, sarapan sendirian di meja panjang | `makan` | `sekolah` |  |
| 06.30-06.45 | SMA Negeri 3 Wirabumi, gerbang (110, 62) | Diantar mobil hitam sampai depan gerbang | `duduk` | `sekolah` | Mobil diantar sopir dari Rumah Sasha, Jl. Perumahan, Jl. GOR, ±7 mnt |
| 06.45-09.30 | Kelas X-1 (110, 62) | Pelajaran, main HP di bawah meja | `duduk` | `sekolah` | di dalam sekolah |
| 09.30-10.00 | Kantin, meja pojok AC (meja geng Bram) (110, 62) | Meja geng Bram | `ngobrol` | `sekolah` | di dalam sekolah |
| 10.00-12.00 | Kelas X-1 (110, 62) | Pelajaran | `duduk` | `sekolah` | di dalam sekolah |
| 12.00-12.30 | Kantin, meja pojok AC (meja geng Bram) (110, 62) | Makan salad, menolak gorengan | `makan` | `sekolah` | di dalam sekolah |
| 12.30-14.00 | Kelas X-1 (110, 62) | Pelajaran | `duduk` | `sekolah` | di dalam sekolah |
| 14.00-15.30 | Parkiran guru (110, 62) | Nongkrong dengan geng Bram | `berdiri` | `geng` | di dalam sekolah |
| 15.30-17.30 (Sen, Rab) | Bimbel Cendekia (tempat les) (150, 100~) | Les bahasa Prancis | `duduk_tulis` | `geng` | Mobil diantar sopir dari Parkiran guru, jalan terdekat (pathfinding), ±4 mnt |
| 15.30-17.30 (Sel, Kam, Jum) | Plaza Wirabumi (mal, bioskop, butik) (178, 98) | Kafe & mal dengan geng | `ngobrol` | `geng` | Mobil diantar sopir dari Parkiran guru, jalan terdekat (pathfinding), ±5 mnt |
| 17.30-20.00 | Rumah Sasha, Blok A-1 (212, 62~) | Makan malam, dimarahi soal nilai | `makan` | `rumah` | Mobil diantar sopir dari Parkiran guru, jalan terdekat (pathfinding), ±7 mnt |
| 20.00-21.30 | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Kabur menyamar, memberi makan kucing di bangku beringin | `jongkok` | `rahasia` | Jalan kaki dari Rumah Sasha, Jl. Perumahan, Jl. Raya Wirabumi, ±22 mnt |
| 21.30-06.00 | Rumah Sasha, Blok A-1 (212, 62~) | Menggambar desain baju, tidur | `tidur` | `rumah` | Mobil diantar sopir dari Alun-alun, jalan terdekat (pathfinding), ±4 mnt |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-10.00 | Rumah Sasha, Blok A-1 (212, 62~) | Tidur, perawatan | `tidur` | `rumah` |  |
| 10.00-15.00 | Plaza Wirabumi (mal, bioskop, butik) (178, 98) | Mal dan kafe dengan geng | `ngobrol` | `geng` | Mobil diantar sopir dari Rumah Sasha, jalan terdekat (pathfinding), ±3 mnt |
| 15.00-19.00 | Plaza Wirabumi (mal, bioskop, butik) (178, 98) | Membantu di butik ibunya | `kasir` | `jalan` |  |
| 19.00-20.00 | Rumah Sasha, Blok A-1 (212, 62~) | Makan malam | `makan` | `rumah` | Mobil diantar sopir dari Plaza Wirabumi, jalan terdekat (pathfinding), ±3 mnt |
| 20.00-21.30 | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Penyamaran, kucing | `jongkok` | `rahasia` | Jalan kaki dari Rumah Sasha, jalan terdekat (pathfinding), ±22 mnt |
| 21.30-06.00 | Rumah Sasha, Blok A-1 (212, 62~) | Tidur | `tidur` | `rumah` | Mobil diantar sopir dari Alun-alun, jalan terdekat (pathfinding), ±4 mnt |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-07.00 | Rumah Sasha, Blok A-1 (212, 62~) | Bangun pagi diam-diam | `berdiri` | `rahasia` |  |
| 07.00-10.00 | Ruang jahit Teh Lilis di pasar (116, 100~) | Belajar menjahit di ruang jahit pasar (rahasia) | `duduk` | `rahasia` | Angkot dari Rumah Sasha, jalan terdekat (pathfinding), ±9 mnt |
| 10.00-16.00 | Plaza Wirabumi (mal, bioskop, butik) (178, 98) | Butik ibunya | `kasir` | `jalan` | Mobil diantar sopir dari Ruang jahit Teh Lilis di pasar, jalan terdekat (pathfinding), ±4 mnt |
| 16.00-20.00 | Rumah Sasha, Blok A-1 (212, 62~) | Menggambar desain | `gambar` | `rumah` | Mobil diantar sopir dari Plaza Wirabumi, jalan terdekat (pathfinding), ±3 mnt |
| 20.00-21.30 | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Penyamaran, kucing | `jongkok` | `rahasia` | Mobil diantar sopir dari Rumah Sasha, jalan terdekat (pathfinding), ±4 mnt |
| 21.30-06.00 | Rumah Sasha, Blok A-1 (212, 62~) | Tidur | `tidur` | `rumah` | Mobil diantar sopir dari Alun-alun, jalan terdekat (pathfinding), ±4 mnt |

### Kirana Wijaya

Rumah: **Bengkel Wijaya Motor (rumah Kirana & Kobar)** (190, 165~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `sekolah` | Kemeja putih logo STM, celana abu, sepatu safety |
| `bengkel` | Wearpack hitam lis oranye neon, handuk kecil di leher |
| `balap` | Jaket balap toska-hitam nomor 21, sarung tangan, helm full-face hitam bergambar ombak |
| `jalan` | Crop hoodie hitam, kargo, sneakers tinggi putih |
| `hujan` | Jas hujan setelan motor |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-06.45 | Bengkel Wijaya Motor (rumah Kirana & Kobar) (190, 165~) | Memanaskan motor, sarapan kopi hitam | `servis` | `sekolah` |  |
| 06.45-07.00 | STM Karya Bangsa (150, 158) | Motor ke STM | `naik_motor` | `sekolah` | Motor dari Bengkel Wijaya Motor, Jl. Lingkar Selatan, Jl. STM, ±3 mnt |
| 07.00-14.00 | STM Karya Bangsa (150, 158) | Sekolah STM, jurusan Otomotif (istirahat di trek uji) | `servis` | `sekolah` |  |
| 14.00-15.00 | STM Karya Bangsa (150, 158) | Latihan slalom di trek uji STM | `naik_motor` | `balap` |  |
| 15.00-18.00 | Bengkel Wijaya Motor (rumah Kirana & Kobar) (190, 165~) | Bengkel ayah | `servis` | `bengkel` | Motor dari STM Karya Bangsa, jalan terdekat (pathfinding), ±3 mnt |
| 18.00-21.00 | Warung nasi goreng Jl. Lingkar (200, 167~) | Makan & nongkrong di warung nasi goreng | `makan` | `jalan` | Motor dari Bengkel Wijaya Motor, jalan terdekat (pathfinding), ±2 mnt |
| 22.00-00.30 (Sel, Jum) | Jl. Lingkar Selatan, garis start drag (214, 166) | Balap liar drag (Selasa, Jumat) | `naik_motor` | `balap` | Motor dari Warung nasi goreng Jl. Lingkar, jalan terdekat (pathfinding), ±2 mnt |
| 21.00-23.00 (Sen, Rab, Kam) | Bengkel Wijaya Motor (rumah Kirana & Kobar) (190, 165~) | Menyetel motor di garasi | `servis` | `bengkel` | Motor dari Warung nasi goreng Jl. Lingkar, jalan terdekat (pathfinding), ±2 mnt |
| 00.30-06.00 | Bengkel Wijaya Motor (rumah Kirana & Kobar) (190, 165~) | Tidur (kamar penuh poster balap) | `tidur` | `jalan` | Motor dari Warung nasi goreng Jl. Lingkar, jalan terdekat (pathfinding), ±2 mnt |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 07.00-11.00 | Sirkuit: pit & paddock (368, 226) | Track day (Bab 5+) atau bengkel ayah | `naik_motor` | `balap` | Motor dari Bengkel Wijaya Motor, Jl. Lingkar Selatan, Jl. Sirkuit, ±13 mnt |
| 11.00-18.00 | Bengkel Wijaya Motor (rumah Kirana & Kobar) (190, 165~) | Bengkel ayah | `servis` | `bengkel` | Motor dari Sirkuit: pit & paddock, jalan terdekat (pathfinding), ±13 mnt |
| 18.00-21.00 | Warung nasi goreng Jl. Lingkar (200, 167~) | Nongkrong | `makan` | `jalan` | Motor dari Bengkel Wijaya Motor, jalan terdekat (pathfinding), ±2 mnt |
| 21.00-00.00 | Bawah jembatan layang selatan (tembok mural) (160, 166~) | Duduk di atas motor di bawah jembatan layang | `duduk` | `jalan` | Motor dari Warung nasi goreng Jl. Lingkar, jalan terdekat (pathfinding), ±3 mnt |
| 00.00-07.00 | Bengkel Wijaya Motor (rumah Kirana & Kobar) (190, 165~) | Tidur | `tidur` | `jalan` | Motor dari Bawah jembatan layang selatan, jalan terdekat (pathfinding), ±2 mnt |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 07.00-13.00 | Sirkuit: pit & paddock (368, 226) | Seri liga resmi (Bab 9+, tiap 2 minggu); sebelum Bab 9: bengkel | `naik_motor` | `balap` | Motor dari Bengkel Wijaya Motor, jalan terdekat (pathfinding), ±13 mnt |
| 13.00-18.00 | Bengkel Wijaya Motor (rumah Kirana & Kobar) (190, 165~) | Bengkel | `servis` | `bengkel` | Motor dari Sirkuit: pit & paddock, jalan terdekat (pathfinding), ±13 mnt |
| 18.00-22.00 | Warung nasi goreng Jl. Lingkar (200, 167~) | Nongkrong dengan Serigala Besi | `duduk` | `jalan` | Motor dari Bengkel Wijaya Motor, jalan terdekat (pathfinding), ±2 mnt |
| 22.00-07.00 | Bengkel Wijaya Motor (rumah Kirana & Kobar) (190, 165~) | Tidur | `tidur` | `jalan` | Motor dari Warung nasi goreng Jl. Lingkar, jalan terdekat (pathfinding), ±2 mnt |

### Mei Lestari

Rumah: **Toko Buku Pena & studio lantai 2 (rumah Mei)** (124, 74~). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `sekolah` | Kemeja putih, rompi kotak hijau tua, rok kotak, dasi pita, kaus kaki putih panjang, loafers (SMA Bina Bangsa) |
| `toko` | Kaus kuning mustard, apron hijau bertuliskan PENA, pensil di telinga |
| `rumah` | Piama bergambar kucing, kaus kaki tidak sepasang |
| `jalan` | Overall jeans di atas kaus garis, tote penuh pin, baret hijau |
| `hujan` | Jas hujan kuning mustard bentuk bebek |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-06.30 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Membuka rolling door toko bersama Ama | `berdiri` | `sekolah` |  |
| 06.30-13.30 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Sekolah di SMA Bina Bangsa (tidak terlihat di peta, keluar lewat Jl. Merdeka) | `hilang` | `sekolah` |  |
| 13.30-14.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Pulang, makan bakpao Ama | `makan` | `toko` |  |
| 14.00-18.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Jaga kasir, menggambar di balik meja | `kasir` | `toko` |  |
| 18.00-20.00 | Taman kota: lapangan basket umum, skatepark, air mancur (126, 46) | Menggambar orang lewat di taman kota | `gambar` | `jalan` | Jalan kaki dari Toko Buku Pena & studio lantai 2, Jl. Merdeka, ±9 mnt |
| 20.00-23.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Studio lantai 2: komik | `gambar` | `rumah` | Jalan kaki dari Taman kota: lapangan basket umum, jalan terdekat (pathfinding), ±9 mnt |
| 23.00-06.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Tidur | `tidur` | `rumah` |  |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 07.00-13.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Jaga toko pagi | `kasir` | `toko` |  |
| 13.00-17.00 | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Lomba gambar / bazar buku (kalau ada), selain itu studio | `gambar` | `jalan` | Jalan kaki dari Toko Buku Pena & studio lantai 2, jalan terdekat (pathfinding), ±7 mnt |
| 17.00-22.00 | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Pasar malam dengan buku sketsa | `gambar` | `jalan` |  |
| 22.00-07.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Studio lalu tidur | `tidur` | `rumah` | Jalan kaki dari Alun-alun, jalan terdekat (pathfinding), ±7 mnt |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 08.00-12.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Jaga toko | `kasir` | `toko` |  |
| 12.00-15.00 | Perpustakaan daerah (136, 66~) | Membaca buku seni | `baca` | `jalan` | Jalan kaki dari Toko Buku Pena & studio lantai 2, jalan terdekat (pathfinding), ±5 mnt |
| 15.00-23.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Studio lantai 2 | `gambar` | `rumah` | Jalan kaki dari Perpustakaan daerah, jalan terdekat (pathfinding), ±5 mnt |
| 23.00-08.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Tidur | `tidur` | `rumah` |  |

### Wulan Sari

Rumah: **Rumah panggung Wulan & Abah Karta, tepi kebun teh** (266, -27~). Moda utama: bus antarkota.

| Outfit | Isi |
|---|---|
| `sekolah` | Blazer biru tua jurusan pariwisata, kemeja putih, rok span, sepatu hak rendah |
| `silat` | Baju pangsi hitam, sabuk hijau, ikat kepala batik |
| `pemandu` | Kemeja hijau seragam kebun teh, caping, boots karet |
| `desa` | Kaus lengan panjang, sarung batik diikat di pinggang |
| `kota` | Kemeja kotak hijau, jeans, sepatu kanvas, tas punggung anyaman |
| `hujan` | Caping dan jas hujan plastik |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 04.30-06.00 | Pendopo perguruan Kembang Teh (258, -34~) | Latihan silat subuh bersama Abah | `silat` | `silat` | Jalan kaki dari Rumah panggung Wulan & Abah Karta, jalan terdekat (pathfinding), ±4 mnt |
| 06.00-06.40 | SMK Pariwisata (252, -46) | Jalan ke SMK lewat pematang kebun teh | `jalan` | `sekolah` | Jalan kaki dari Pendopo perguruan Kembang Teh, Jl. Raya Puncak, ±4 mnt |
| 06.40-13.00 | SMK Pariwisata (252, -46) | Sekolah SMK Pariwisata | `duduk_tulis` | `sekolah` |  |
| 13.00-13.40 | Terminal bus antarkota (246, 104) | Bus turun ke kota (praktik pemandu di kota) | `duduk` | `sekolah` | Bus antarkota dari SMK Pariwisata, Jl. Raya Puncak, Jl. Raya Wirabumi, ±10 mnt |
| 13.40-16.00 | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Praktik pemandu wisata di alun-alun & menunggu | `berdiri` | `kota` | Bus antarkota dari Terminal bus antarkota, jalan terdekat (pathfinding), ±7 mnt |
| 16.00-17.00 (Sel, Kam) | GOR Kota & kolam renang (168, 40) | Melatih silat anak-anak (Selasa, Kamis) | `silat` | `silat` | Angkot dari Alun-alun, jalan terdekat (pathfinding), ±4 mnt |
| 16.00-16.50 (Sen, Rab, Jum) | Terminal bus antarkota (246, 104) | Menunggu bus terakhir, membaca buku peta | `baca` | `kota` | Bus antarkota dari Alun-alun, jalan terdekat (pathfinding), ±7 mnt |
| 17.00-17.40 | Halte bus Sukamekar (Jl. Raya Puncak) (250, -28~) | Bus terakhir pulang ke desa | `duduk` | `kota` | Bus antarkota dari Alun-alun, jalan terdekat (pathfinding), ±10 mnt |
| 17.40-20.30 | Rumah panggung Wulan & Abah Karta, tepi kebun teh (266, -27~) | Membantu ibu, mengajari tiga adik | `masak` | `desa` | Jalan kaki dari Halte bus Sukamekar, jalan terdekat (pathfinding), ±5 mnt |
| 20.30-21.30 | Rumah panggung Wulan & Abah Karta, tepi kebun teh (266, -27~) | Duduk di teras, mendengar Abah main kecapi | `duduk` | `desa` |  |
| 21.30-04.30 | Rumah panggung Wulan & Abah Karta, tepi kebun teh (266, -27~) | Tidur | `tidur` | `desa` |  |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 04.30-06.00 | Pendopo perguruan Kembang Teh (258, -34~) | Latihan silat subuh | `silat` | `silat` | Jalan kaki dari Rumah panggung Wulan & Abah Karta, jalan terdekat (pathfinding), ±4 mnt |
| 06.00-12.00 | Kebun teh Sukamekar (blok petik) (300, -30~) | Memandu turis di kebun teh | `jalan` | `pemandu` | Jalan kaki dari Pendopo perguruan Kembang Teh, jalan terdekat (pathfinding), ±14 mnt |
| 12.00-13.00 | Pabrik teh tua (276, -30) | Tur pabrik teh tua | `jalan` | `pemandu` | Jalan kaki dari Kebun teh Sukamekar, jalan terdekat (pathfinding), ±8 mnt |
| 14.00-17.00 | Pendopo perguruan Kembang Teh (258, -34~) | Melatih murid silat cilik | `silat` | `silat` | Jalan kaki dari Pabrik teh tua, jalan terdekat (pathfinding), ±6 mnt |
| 17.00-21.30 | Rumah panggung Wulan & Abah Karta, tepi kebun teh (266, -27~) | Di rumah | `duduk` | `desa` | Jalan kaki dari Pendopo perguruan Kembang Teh, jalan terdekat (pathfinding), ±4 mnt |
| 21.30-04.30 | Rumah panggung Wulan & Abah Karta, tepi kebun teh (266, -27~) | Tidur | `tidur` | `desa` |  |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 04.30-06.00 | Pendopo perguruan Kembang Teh (258, -34~) | Latihan silat subuh | `silat` | `silat` | Jalan kaki dari Rumah panggung Wulan & Abah Karta, jalan terdekat (pathfinding), ±4 mnt |
| 06.00-11.00 | Kebun teh Sukamekar (blok petik) (300, -30~) | Memandu turis (Minggu paling ramai) | `jalan` | `pemandu` | Jalan kaki dari Pendopo perguruan Kembang Teh, jalan terdekat (pathfinding), ±14 mnt |
| 11.00-16.00 | GOR Kota & kolam renang (168, 40) | Turnamen silat (tiap 2 minggu); minggu lain: pendopo | `silat` | `silat` | Bus antarkota dari Kebun teh Sukamekar, jalan terdekat (pathfinding), ±10 mnt |
| 16.00-21.30 | Rumah panggung Wulan & Abah Karta, tepi kebun teh (266, -27~) | Di rumah | `duduk` | `desa` | Bus antarkota dari GOR Kota & kolam renang, jalan terdekat (pathfinding), ±8 mnt |
| 21.30-04.30 | Rumah panggung Wulan & Abah Karta, tepi kebun teh (266, -27~) | Tidur | `tidur` | `desa` |  |

## NPC utama cowok

### Dimas Aditya

Rumah: **Rumah dinas keluarga Aditya** (354, 64~). Moda utama: angkot.

| Outfit | Isi |
|---|---|
| `sekolah` | Seragam rapi dimasukkan, jam digital hitam, tas olahraga besar |
| `basket` | Jersey biru nomor 11, celana basket, sepatu putih-biru, headband putih |
| `rumah` | Kaus loreng hijau bekas ayahnya, celana pendek |
| `jalan` | Hoodie biru polos, chino, sneakers putih |
| `resmi` | Kemeja batik ayahnya yang terlalu besar |
| `hujan` | Jaket parasut, bola di kantong plastik |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-05.45 | Lapangan apel asrama (346, 44) | Lari subuh bersama regu asrama | `lari` | `rumah` | Jalan kaki dari Rumah dinas keluarga Aditya, jalan terdekat (pathfinding), ±7 mnt |
| 05.45-06.10 | Rumah dinas keluarga Aditya (354, 64~) | Mandi, mi instan racikan | `makan` | `sekolah` | Jalan kaki dari Lapangan apel asrama, jalan terdekat (pathfinding), ±7 mnt |
| 06.10-06.45 | SMA Negeri 3 Wirabumi, gerbang (110, 62) | Angkot dari gerbang asrama ke kota | `duduk` | `sekolah` | Angkot dari Rumah dinas keluarga Aditya, Jl. Kesatrian, Jl. Raya Wirabumi, ±21 mnt |
| 06.45-09.30 | Kelas X-3 (110, 62) | Pelajaran (sering mengantuk) | `duduk` | `sekolah` | di dalam sekolah |
| 09.30-10.00 | Lapangan basket sekolah (110, 62) | Istirahat di lapangan basket | `basket` | `sekolah` | di dalam sekolah |
| 10.00-12.00 | Kelas X-3 (110, 62) | Pelajaran | `duduk` | `sekolah` | di dalam sekolah |
| 12.00-12.30 | Kantin (110, 62) | Makan dua porsi | `makan` | `sekolah` | di dalam sekolah |
| 12.30-14.00 | Kelas X-3 (110, 62) | Pelajaran | `duduk` | `sekolah` | di dalam sekolah |
| 15.00-17.30 (Sen, Sel, Kam) | Lapangan basket sekolah (110, 62) | Latihan basket tim | `basket` | `basket` | di dalam sekolah |
| 14.30-16.30 (Rab, Jum) | Taman kota: lapangan basket umum, skatepark, air mancur (126, 46) | Main basket 3x3 di lapangan umum | `basket` | `basket` | Jalan kaki dari Kelas X-3, jalan terdekat (pathfinding), ±8 mnt |
| 17.30-18.15 | Rumah dinas keluarga Aditya (354, 64~) | Angkot ke timur | `duduk` | `sekolah` | Angkot dari Kelas X-3, jalan terdekat (pathfinding), ±21 mnt |
| 18.15-21.00 | Rumah dinas keluarga Aditya (354, 64~) | Makan malam, PR, ayah bertanya nilai | `duduk_tulis` | `rumah` |  |
| 21.00-05.00 | Rumah dinas keluarga Aditya (354, 64~) | Tidur | `tidur` | `rumah` |  |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-06.00 | Lapangan apel asrama (346, 44) | Lari subuh | `lari` | `rumah` | Jalan kaki dari Rumah dinas keluarga Aditya, jalan terdekat (pathfinding), ±7 mnt |
| 07.00-11.00 | Lapangan apel asrama (346, 44) | Melatih bola anak asrama (Tito dkk.) | `mengajar` | `rumah` |  |
| 13.00-17.00 | GOR Kota & kolam renang (168, 40) | Latihan bebas di GOR kota | `basket` | `basket` | Angkot dari Lapangan apel asrama, jalan terdekat (pathfinding), ±15 mnt |
| 17.00-21.00 | Rumah dinas keluarga Aditya (354, 64~) | Di rumah | `duduk` | `rumah` | Angkot dari GOR Kota & kolam renang, jalan terdekat (pathfinding), ±16 mnt |
| 21.00-05.00 | Rumah dinas keluarga Aditya (354, 64~) | Tidur | `tidur` | `rumah` |  |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-06.00 | Lapangan apel asrama (346, 44) | Lari subuh | `lari` | `rumah` | Jalan kaki dari Rumah dinas keluarga Aditya, jalan terdekat (pathfinding), ±7 mnt |
| 07.00-11.00 | Taman kota: lapangan basket umum, skatepark, air mancur (126, 46) | Liga basket 3x3 Minggu | `basket` | `basket` | Angkot dari Lapangan apel asrama, jalan terdekat (pathfinding), ±19 mnt |
| 11.00-14.00 | Plaza Wirabumi (mal, bioskop, butik) (178, 98) | Jajan, nonton film kalau ada uang | `jalan` | `jalan` | Angkot dari Taman kota: lapangan basket umum, jalan terdekat (pathfinding), ±6 mnt |
| 14.00-21.00 | Rumah dinas keluarga Aditya (354, 64~) | Di rumah | `duduk` | `rumah` | Angkot dari Plaza Wirabumi, jalan terdekat (pathfinding), ±15 mnt |
| 21.00-05.00 | Rumah dinas keluarga Aditya (354, 64~) | Tidur | `tidur` | `rumah` |  |

### Arga

Rumah: **Rumah dinas penjaga (Pak Ujang & Arga), belakang Gedung Lama** (106, 56~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `sekolah` | Seragam dikeluarkan, lengan digulung, jaket kulit cokelat warisan ayah, boots hitam |
| `geng` | Jaket hitam lis kuning Lampu Kota, sarung tangan tanpa jari, helm retro |
| `kerja` | Kaus abu, celana kerja, sapu dan kunci di pinggang |
| `rumah` | Sarung kotak, kaus oblong putih |
| `jalan` | Flanel abu, jeans hitam, boots |
| `hujan` | Ponco hitam |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-06.30 | Halaman depan & plaza (110, 62) | Membuka gerbang dan menyapu halaman bersama kakek | `sapu` | `kerja` | Jalan kaki dari Rumah dinas penjaga, jalan terdekat (pathfinding), ±2 mnt |
| 06.30-09.30 | Kelas X-1 (110, 62) | Pelajaran, duduk paling belakang dekat jendela | `duduk` | `sekolah` | di dalam sekolah |
| 09.30-10.00 | Belakang Gedung Lama (taman rahasia Arga) (110, 62) | Merawat taman rahasia di belakang Gedung Lama | `jongkok` | `sekolah` | di dalam sekolah |
| 10.00-12.00 | Kelas X-1 (110, 62) | Pelajaran | `duduk` | `sekolah` | di dalam sekolah |
| 12.00-12.30 | Warung Mak Iyah, belakang sekolah (102, 66~) | Gorengan di warung Mak Iyah (lompat pagar utara) | `makan` | `sekolah` | Jalan kaki dari Kelas X-1, jalan terdekat (pathfinding), ±3 mnt |
| 12.30-14.00 | Kelas X-1 (110, 62) | Pelajaran | `duduk` | `sekolah` | Jalan kaki dari Warung Mak Iyah, jalan terdekat (pathfinding), ±3 mnt |
| 14.00-15.30 | Halaman depan & plaza (110, 62) | Membantu kakek membersihkan kelas | `sapu` | `kerja` | di dalam sekolah |
| 15.30-18.00 | Ruko Pelita & bengkel Mas Fajar (170, 84) | Bengkel Mas Fajar | `servis` | `kerja` | Motor dari Halaman depan & plaza, Jl. Merdeka, Jl. Raya Wirabumi, ±4 mnt |
| 18.00-20.00 | Rumah dinas penjaga (Pak Ujang & Arga), belakang Gedung Lama (106, 56~) | Makan malam dengan kakek | `makan` | `rumah` | Motor dari Ruko Pelita & bengkel Mas Fajar, jalan terdekat (pathfinding), ±5 mnt |
| 20.00-22.30 | Gudang markas Lampu Kota (50, 131) | Markas Lampu Kota | `duduk` | `geng` | Motor dari Rumah dinas penjaga, Jl. Raya Wirabumi, Gang Kenanga, Jl. Bantaran, ±6 mnt |
| 22.30-23.30 (Rab) | Menara pemancar (84, 22) | Duduk sendirian di menara pemancar (Rabu) | `duduk` | `geng` | Motor dari Gudang markas Lampu Kota, jalan terdekat (pathfinding), ±8 mnt |
| 22.30-05.00 (Sen, Sel, Kam, Jum) | Rumah dinas penjaga (Pak Ujang & Arga), belakang Gedung Lama (106, 56~) | Tidur | `tidur` | `rumah` | Motor dari Gudang markas Lampu Kota, jalan terdekat (pathfinding), ±6 mnt |
| 23.30-05.00 (Rab) | Rumah dinas penjaga (Pak Ujang & Arga), belakang Gedung Lama (106, 56~) | Tidur | `tidur` | `rumah` | Motor dari Gudang markas Lampu Kota, jalan terdekat (pathfinding), ±6 mnt |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-08.00 | Belakang Gedung Lama (taman rahasia Arga) (110, 62) | Merawat taman rahasia | `jongkok` | `kerja` | Jalan kaki dari Rumah dinas penjaga, jalan terdekat (pathfinding), ±2 mnt |
| 08.00-17.00 | Ruko Pelita & bengkel Mas Fajar (170, 84) | Bengkel Mas Fajar | `servis` | `kerja` | Motor dari Belakang Gedung Lama, jalan terdekat (pathfinding), ±4 mnt |
| 19.00-01.00 | Gudang markas Lampu Kota (50, 131) | Konvoi & markas Lampu Kota | `naik_motor` | `geng` | Motor dari Ruko Pelita & bengkel Mas Fajar, jalan terdekat (pathfinding), ±9 mnt |
| 01.00-05.00 | Rumah dinas penjaga (Pak Ujang & Arga), belakang Gedung Lama (106, 56~) | Tidur | `tidur` | `rumah` | Motor dari Gudang markas Lampu Kota, jalan terdekat (pathfinding), ±6 mnt |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-10.00 | Rumah dinas penjaga (Pak Ujang & Arga), belakang Gedung Lama (106, 56~) | Tidur lagi | `tidur` | `rumah` |  |
| 10.00-16.00 | Gudang markas Lampu Kota (50, 131) | Markas Lampu Kota, servis motor anggota | `servis` | `geng` | Motor dari Rumah dinas penjaga, jalan terdekat (pathfinding), ±6 mnt |
| 19.00-23.00 | Pos ronda Gang Kenanga (36, 88~) | Ronda bersama warga Kenanga | `duduk` | `jalan` | Motor dari Gudang markas Lampu Kota, jalan terdekat (pathfinding), ±3 mnt |
| 23.00-06.00 | Rumah dinas penjaga (Pak Ujang & Arga), belakang Gedung Lama (106, 56~) | Tidur | `tidur` | `rumah` | Motor dari Pos ronda Gang Kenanga, jalan terdekat (pathfinding), ±5 mnt |

### Rizal Pratama

Rumah: **Kontrakan Rizal, gang belakang Ruko Pelita** (168, 89~). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `sekolah` | Seragam rapi, rompi rajut cokelat, tas selempang kanvas penuh buku |
| `osis` | Jas almamater, pulpen di saku dan telinga |
| `rumah` | Kaus festival literasi kebesaran, sarung |
| `jalan` | Kemeja kotak cokelat, celana bahan, sepatu kanvas cokelat |
| `hujan` | Payung hitam besar |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.30-06.15 | Kontrakan Rizal, gang belakang Ruko Pelita (168, 89~) | Menyiapkan sarapan untuk ibu yang pulang kerja malam | `masak` | `rumah` |  |
| 06.15-06.40 | SMA Negeri 3 Wirabumi, gerbang (110, 62) | Jalan kaki sambil membaca | `jalan` | `sekolah` | Jalan kaki dari Kontrakan Rizal, Jl. Raya Wirabumi, ±21 mnt |
| 06.40-09.30 | Kelas X-2 (110, 62) | Pelajaran | `duduk_tulis` | `sekolah` | di dalam sekolah |
| 09.30-10.00 | Perpustakaan (pojok jendela) (110, 62) | Istirahat di perpustakaan | `baca` | `sekolah` | di dalam sekolah |
| 10.00-12.00 | Kelas X-2 (110, 62) | Pelajaran | `duduk_tulis` | `sekolah` | di dalam sekolah |
| 12.00-12.30 | Musala sekolah (110, 62) | Salat zuhur | `salat` | `sekolah` | di dalam sekolah |
| 12.30-14.00 | Kelas X-2 (110, 62) | Pelajaran | `duduk_tulis` | `sekolah` | di dalam sekolah |
| 14.00-16.30 (Sen, Rab, Kam) | Ruang OSIS (110, 62) | Rapat OSIS (Senin, Rabu, Kamis) | `ngobrol` | `osis` | di dalam sekolah |
| 14.00-16.30 (Sel, Jum) | Ruang mading (110, 62) | Ruang mading, menempel cerpen | `duduk_tulis` | `sekolah` | di dalam sekolah |
| 16.30-19.00 | Kontrakan Rizal, gang belakang Ruko Pelita (168, 89~) | Menunggu ibu berangkat kerja, masak | `masak` | `rumah` | Jalan kaki dari Kelas X-2, jalan terdekat (pathfinding), ±21 mnt |
| 19.00-23.00 | Kontrakan Rizal, gang belakang Ruko Pelita (168, 89~) | Menulis cerpen | `duduk_tulis` | `rumah` |  |
| 23.00-05.30 | Kontrakan Rizal, gang belakang Ruko Pelita (168, 89~) | Tidur | `tidur` | `rumah` |  |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 07.00-12.00 | Perpustakaan daerah (136, 66~) | Perpustakaan daerah | `baca` | `jalan` | Jalan kaki dari Kontrakan Rizal, jalan terdekat (pathfinding), ±13 mnt |
| 12.00-16.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Toko Buku Pena, ngobrol dengan Mei soal buku | `baca` | `jalan` | Jalan kaki dari Perpustakaan daerah, jalan terdekat (pathfinding), ±5 mnt |
| 16.00-18.00 | Kontrakan Rizal, gang belakang Ruko Pelita (168, 89~) | Masak | `masak` | `rumah` | Jalan kaki dari Toko Buku Pena & studio lantai 2, jalan terdekat (pathfinding), ±15 mnt |
| 19.00-22.00 | Kafe Senja (klub sastra, barista Kevin) (156, 90~) | Klub sastra Sabtu malam | `ngobrol` | `jalan` | Jalan kaki dari Kontrakan Rizal, jalan terdekat (pathfinding), ±4 mnt |
| 22.00-07.00 | Kontrakan Rizal, gang belakang Ruko Pelita (168, 89~) | Tidur | `tidur` | `rumah` | Jalan kaki dari Kafe Senja, jalan terdekat (pathfinding), ±4 mnt |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 07.00-11.00 | Kontrakan Rizal, gang belakang Ruko Pelita (168, 89~) | Bersih-bersih kontrakan | `sapu` | `rumah` |  |
| 11.00-17.00 | Taman kota: lapangan basket umum, skatepark, air mancur (126, 46) | Menulis di bangku air mancur | `duduk_tulis` | `jalan` | Jalan kaki dari Kontrakan Rizal, jalan terdekat (pathfinding), ±20 mnt |
| 17.00-23.00 | Kontrakan Rizal, gang belakang Ruko Pelita (168, 89~) | Menulis | `duduk_tulis` | `rumah` | Jalan kaki dari Taman kota: lapangan basket umum, jalan terdekat (pathfinding), ±20 mnt |
| 23.00-07.00 | Kontrakan Rizal, gang belakang Ruko Pelita (168, 89~) | Tidur | `tidur` | `rumah` |  |

### Tegar Hutomo

Rumah: **Rumah Tegar, Blok B-3** (232, 52~). Moda utama: mobil diantar sopir.

| Outfit | Isi |
|---|---|
| `sekolah` | Seragam disetrika tajam, ikat pinggang kulit, dasi, pantofel |
| `les` | Kemeja biru langit, celana bahan, ransel buku latihan soal |
| `rumah` | Piama setelan biru tua |
| `jalan` | Polo abu, chino, kets putih bersih |
| `hujan` | Jas hujan atas-bawah, tas dibungkus plastik |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.30-06.00 | Rumah Tegar, Blok B-3 (232, 52~) | Sarapan sambil latihan soal | `baca` | `sekolah` |  |
| 06.00-06.20 | SMA Negeri 3 Wirabumi, gerbang (110, 62) | Diantar ayah sebelum ke kantor | `duduk` | `sekolah` | Mobil diantar sopir dari Rumah Tegar, Jl. Perumahan, Jl. GOR, ±8 mnt |
| 06.20-09.30 | Kelas X-2 (110, 62) | Datang paling awal (bersaing dengan Nadia), pelajaran | `duduk_tulis` | `sekolah` | di dalam sekolah |
| 09.30-10.00 | Perpustakaan (pojok jendela) (110, 62) | Istirahat di perpustakaan | `baca` | `sekolah` | di dalam sekolah |
| 10.00-12.00 | Kelas X-2 (110, 62) | Pelajaran | `duduk_tulis` | `sekolah` | di dalam sekolah |
| 12.00-12.30 | Halaman depan & plaza (110, 62) | Makan di bangku plaza sambil membaca | `baca` | `sekolah` | di dalam sekolah |
| 12.30-14.00 | Kelas X-2 (110, 62) | Pelajaran | `duduk_tulis` | `sekolah` | di dalam sekolah |
| 14.15-17.00 | Bimbel Cendekia (tempat les) (150, 100~) | Les di Pusat Kota | `duduk_tulis` | `les` | Angkot dari Kelas X-2, jalan terdekat (pathfinding), ±5 mnt |
| 17.00-18.00 (Sel, Jum) | Warnet Pusat Kota (138, 96~) | Main game diam-diam di warnet (Selasa, Jumat) | `duduk` | `les` | Jalan kaki dari Bimbel Cendekia, jalan terdekat (pathfinding), ±4 mnt |
| 18.00-19.00 | Rumah Tegar, Blok B-3 (232, 52~) | Dijemput sopir pulang | `duduk` | `les` | Mobil diantar sopir dari Bimbel Cendekia, jalan terdekat (pathfinding), ±6 mnt |
| 19.00-00.00 | Rumah Tegar, Blok B-3 (232, 52~) | Belajar di kamar | `duduk_tulis` | `rumah` |  |
| 00.00-05.30 | Rumah Tegar, Blok B-3 (232, 52~) | Tidur | `tidur` | `rumah` |  |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-08.00 | Rumah Tegar, Blok B-3 (232, 52~) | Latihan soal | `duduk_tulis` | `rumah` |  |
| 08.00-12.00 | Bimbel Cendekia (tempat les) (150, 100~) | Les intensif | `duduk_tulis` | `les` | Mobil diantar sopir dari Rumah Tegar, jalan terdekat (pathfinding), ±6 mnt |
| 13.00-17.00 | Rumah Tegar, Blok B-3 (232, 52~) | Olimpiade / latihan soal | `duduk_tulis` | `rumah` | Mobil diantar sopir dari Bimbel Cendekia, jalan terdekat (pathfinding), ±6 mnt |
| 17.00-22.00 | Rumah Tegar, Blok B-3 (232, 52~) | Merakit lego diam-diam | `duduk` | `rumah` |  |
| 22.00-05.30 | Rumah Tegar, Blok B-3 (232, 52~) | Tidur | `tidur` | `rumah` |  |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-09.00 | Rumah Tegar, Blok B-3 (232, 52~) | Jalan pagi dengan ayah (diam-diaman) | `jalan` | `jalan` |  |
| 09.00-15.00 | Rumah Tegar, Blok B-3 (232, 52~) | Latihan soal | `duduk_tulis` | `rumah` |  |
| 15.00-18.00 | Perpustakaan daerah (136, 66~) | Membaca buku arsitektur | `baca` | `jalan` | Angkot dari Rumah Tegar, jalan terdekat (pathfinding), ±8 mnt |
| 18.00-23.00 | Rumah Tegar, Blok B-3 (232, 52~) | Lego dan maket | `duduk` | `rumah` | Mobil diantar sopir dari Perpustakaan daerah, jalan terdekat (pathfinding), ±6 mnt |
| 23.00-05.30 | Rumah Tegar, Blok B-3 (232, 52~) | Tidur | `tidur` | `rumah` |  |

### Jojo (Yohanes)

Rumah: **Studio Foto Kilat (rumah Jojo di lantai 2)** (132, 82~). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `sekolah` | Seragam dikeluarkan sedikit, rompi fotografer hijau army, kamera di leher |
| `liputan` | Rompi, kupluk oranye, ransel kamera, kets lusuh |
| `rumah` | Kaus 'Horas!', celana pendek |
| `jalan` | Kemeja hawaii oranye, kargo, sandal gunung |
| `kerja` | Kemeja & celana hitam, kartu kru |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-06.30 | Studio Foto Kilat (rumah Jojo di lantai 2) (132, 82~) | Sarapan sambil memilih foto kemarin | `hp` | `sekolah` |  |
| 06.30-06.50 | SMA Negeri 3 Wirabumi, gerbang (110, 62) | Jalan ke sekolah sambil memotret | `foto` | `sekolah` | Jalan kaki dari Studio Foto Kilat, Jl. Merdeka, ±10 mnt |
| 06.50-09.30 | Kelas X-2 (110, 62) | Pelajaran | `duduk` | `sekolah` | di dalam sekolah |
| 09.30-10.00 | Kantin (110, 62) | Meja tengah kantin, mengumpulkan gosip | `ngobrol` | `sekolah` | di dalam sekolah |
| 10.00-12.00 | Kelas X-2 (110, 62) | Pelajaran | `duduk` | `sekolah` | di dalam sekolah |
| 12.00-12.30 | Kantin (110, 62) | Makan bakso | `makan` | `sekolah` | di dalam sekolah |
| 12.30-14.00 | Kelas X-2 (110, 62) | Pelajaran | `duduk` | `sekolah` | di dalam sekolah |
| 14.00-17.00 | Ruang mading (110, 62) | Ruang mading, lalu keliling memotret | `foto` | `liputan` | di dalam sekolah |
| 17.00-21.00 | Studio Foto Kilat (rumah Jojo di lantai 2) (132, 82~) | Studio Foto Kilat, edit foto | `duduk` | `rumah` | Jalan kaki dari Ruang mading, jalan terdekat (pathfinding), ±10 mnt |
| 21.00-21.30 | Studio Foto Kilat (rumah Jojo di lantai 2) (132, 82~) | Telepon ibu di Medan (tidak bisa diganggu) | `hp` | `rumah` |  |
| 21.30-00.00 | Studio Foto Kilat (rumah Jojo di lantai 2) (132, 82~) | Atap studio, memotret langit | `foto` | `rumah` |  |
| 00.00-06.00 | Studio Foto Kilat (rumah Jojo di lantai 2) (132, 82~) | Tidur | `tidur` | `rumah` |  |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 07.00-16.00 | Masjid Agung (146, 60) | Kerja foto nikahan dengan paman (gedung pesta dekat Masjid Agung) | `foto` | `kerja` | Jalan kaki dari Studio Foto Kilat, jalan terdekat (pathfinding), ±9 mnt |
| 16.00-22.00 | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Pasar malam, memotret | `foto` | `jalan` | Jalan kaki dari Masjid Agung, jalan terdekat (pathfinding), ±5 mnt |
| 22.00-07.00 | Studio Foto Kilat (rumah Jojo di lantai 2) (132, 82~) | Edit lalu tidur | `tidur` | `rumah` | Jalan kaki dari Alun-alun, jalan terdekat (pathfinding), ±5 mnt |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 08.00-17.00 | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Liputan bebas keliling kota (alun-alun jadi titik awal) | `foto` | `liputan` | Jalan kaki dari Studio Foto Kilat, jalan terdekat (pathfinding), ±5 mnt |
| 17.00-21.00 | Studio Foto Kilat (rumah Jojo di lantai 2) (132, 82~) | Edit foto | `duduk` | `rumah` | Jalan kaki dari Alun-alun, jalan terdekat (pathfinding), ±5 mnt |
| 21.00-21.30 | Studio Foto Kilat (rumah Jojo di lantai 2) (132, 82~) | Telepon ibu | `hp` | `rumah` |  |
| 21.30-08.00 | Studio Foto Kilat (rumah Jojo di lantai 2) (132, 82~) | Tidur | `tidur` | `rumah` |  |

### Bram Megantara

Rumah: **Rumah kaca Bram, puncak bukit** (224, 56). Moda utama: mobil diantar sopir.

| Outfit | Isi |
|---|---|
| `sekolah` | Seragam bahan mahal dipermak, kancing atas terbuka, jam perak, sepatu kulit |
| `geng` | Jaket bomber hitam bordir merah anggur, kacamata hitam |
| `basket` | Jersey hitam pribadi, sepatu limited edition |
| `rumah` | Kaus polos hitam, celana training |
| `resmi` | Jas hitam setelan |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-06.40 | Rumah kaca Bram, puncak bukit (224, 56) | Gym rumah | `olahraga` | `rumah` |  |
| 06.40-06.50 | SMA Negeri 3 Wirabumi, gerbang (110, 62) | Mobil sport, parkir di depan gerbang | `duduk` | `sekolah` | Mobil diantar sopir dari Rumah kaca Bram, Jl. Perumahan, Jl. GOR, ±8 mnt |
| 06.50-09.30 | Kelas XI-1 (110, 62) | Kelas XI-1 (tahun pertama); setelah tinggal kelas di Bab 5 seangkatan pemain. Sering keluar kelas | `duduk` | `sekolah` | di dalam sekolah |
| 09.30-10.00 | Kantin, meja pojok AC (meja geng Bram) (110, 62) | Meja pojok AC, menyerobot antrean | `duduk` | `sekolah` | di dalam sekolah |
| 10.00-12.00 | Kantin, meja pojok AC (meja geng Bram) (110, 62) | Bolos pelajaran di kantin pojok (50%), kalau tidak di kelas | `duduk` | `sekolah` |  |
| 12.00-14.00 | Kelas XI-1 (110, 62) | Kelas | `duduk` | `sekolah` | di dalam sekolah |
| 14.00-15.00 | Parkiran guru (110, 62) | Nongkrong dengan geng, bersandar di mobil guru | `berdiri` | `geng` | di dalam sekolah |
| 15.00-17.00 | Lapangan basket sekolah (110, 62) | Basket; memalak di belakang Gedung B saat jeda | `basket` | `basket` | di dalam sekolah |
| 17.00-20.00 | Rumah kaca Bram, puncak bukit (224, 56) | Makan malam sepi | `makan` | `rumah` | Mobil diantar sopir dari Lapangan basket sekolah, jalan terdekat (pathfinding), ±8 mnt |
| 20.00-22.00 | Rumah kaca Bram, puncak bukit (224, 56) | Piano (kalau ayah pergi) | `piano` | `rumah` |  |
| 22.00-23.00 (Rab, Jum) | Lapangan basket sekolah (110, 62) | Main basket sendirian (setelah Bab 4) | `basket` | `basket` | Mobil diantar sopir dari Rumah kaca Bram, jalan terdekat (pathfinding), ±8 mnt |
| 23.00-06.00 | Rumah kaca Bram, puncak bukit (224, 56) | Tidur | `tidur` | `rumah` |  |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 08.00-11.00 | Rumah kaca Bram, puncak bukit (224, 56) | Gym rumah | `olahraga` | `rumah` |  |
| 11.00-18.00 | Plaza Wirabumi (mal, bioskop, butik) (178, 98) | Mal bersama geng | `ngobrol` | `geng` | Mobil diantar sopir dari Rumah kaca Bram, jalan terdekat (pathfinding), ±4 mnt |
| 18.00-20.00 | Rooftop parkiran mal (180, 100~) | Merokok-rokokan di rooftop parkiran (hanya pegang, tidak dinyalakan di depan pemain) | `berdiri` | `geng` | Jalan kaki dari Plaza Wirabumi, jalan terdekat (pathfinding), ±2 mnt |
| 20.00-23.00 | Warung nasi goreng Jl. Lingkar (200, 167~) | Makan nasi goreng sendirian (rahasia) | `makan` | `rumah` | Mobil diantar sopir dari Rooftop parkiran mal, jalan terdekat (pathfinding), ±5 mnt |
| 23.00-08.00 | Rumah kaca Bram, puncak bukit (224, 56) | Tidur | `tidur` | `rumah` | Mobil diantar sopir dari Warung nasi goreng Jl. Lingkar, jalan terdekat (pathfinding), ±8 mnt |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 08.00-13.00 | Kantor PT Graha Megantara (172, 76~) | Ikut ayah ke kantor / acara kantor | `berdiri` | `resmi` | Mobil diantar sopir dari Rumah kaca Bram, jalan terdekat (pathfinding), ±4 mnt |
| 13.00-17.00 | Rumah kaca Bram, puncak bukit (224, 56) | Gym, piano | `piano` | `rumah` | Mobil diantar sopir dari Kantor PT Graha Megantara, jalan terdekat (pathfinding), ±4 mnt |
| 21.00-23.00 | Taman kota: lapangan basket umum, skatepark, air mancur (126, 46) | Basket malam sendirian di lapangan umum | `basket` | `basket` | Mobil diantar sopir dari Rumah kaca Bram, jalan terdekat (pathfinding), ±7 mnt |
| 23.00-08.00 | Rumah kaca Bram, puncak bukit (224, 56) | Tidur | `tidur` | `rumah` | Mobil diantar sopir dari Taman kota: lapangan basket umum, jalan terdekat (pathfinding), ±7 mnt |

### Andra Pamungkas

Rumah: **Rumah nenek Andra (Nek Sumi), tepi sawah** (196, 212~). Moda utama: sepeda.

| Outfit | Isi |
|---|---|
| `sekolah` | Kemeja putih logo STM digulung, celana abu kena cat, boots |
| `mural` | Kaus putih penuh cipratan cat, overall satu tali dilepas, masker setengah, topi terbalik |
| `geng` | Rompi jeans patch kepala serigala, kaus hitam |
| `rumah` | Sarung dan kaus partai bekas |
| `jalan` | Kemeja bunga oversize, kaus putih, kulot hitam, sandal gunung |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-06.30 | Rumah nenek Andra (Nek Sumi), tepi sawah (196, 212~) | Membantu Nek Sumi menyiapkan jamu | `masak` | `rumah` |  |
| 06.30-07.00 | STM Karya Bangsa (150, 158) | Bersepeda ke STM lewat pematang lalu Jl. Lingkar | `sepeda` | `sekolah` | Sepeda dari Rumah nenek Andra, Jl. Lingkar Selatan, Jl. STM, ±10 mnt |
| 07.00-14.00 | STM Karya Bangsa (150, 158) | Sekolah STM jurusan Bangunan | `duduk_tulis` | `sekolah` |  |
| 14.00-18.00 | Bawah jembatan layang selatan (tembok mural) (160, 166~) | Melukis mural di bawah jembatan layang | `lukis` | `mural` | Sepeda dari STM Karya Bangsa, jalan terdekat (pathfinding), ±2 mnt |
| 18.00-20.00 | Rumah nenek Andra (Nek Sumi), tepi sawah (196, 212~) | Makan malam, bass | `makan` | `rumah` | Sepeda dari Bawah jembatan layang selatan, jalan terdekat (pathfinding), ±8 mnt |
| 20.00-23.00 | Warung nasi goreng Jl. Lingkar (200, 167~) | Nongkrong Serigala Besi | `duduk` | `geng` | Sepeda dari Rumah nenek Andra, jalan terdekat (pathfinding), ±6 mnt |
| 23.00-05.00 | Rumah nenek Andra (Nek Sumi), tepi sawah (196, 212~) | Tidur | `tidur` | `rumah` | Sepeda dari Warung nasi goreng Jl. Lingkar, jalan terdekat (pathfinding), ±6 mnt |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-10.00 | Sawah & pematang Pandansari (190, 232~) | Menemani Nek Sumi keliling jamu | `jalan` | `rumah` | Sepeda dari Rumah nenek Andra, jalan terdekat (pathfinding), ±3 mnt |
| 10.00-14.00 | Kafe Senja (klub sastra, barista Kevin) (156, 90~) | Mural pesanan kafe/warung | `lukis` | `mural` | Sepeda dari Sawah & pematang Pandansari, jalan terdekat (pathfinding), ±21 mnt |
| 14.00-17.00 | Studio musik (110, 62) | Latihan bass bareng Sekar (Sabtu, setelah kenal) | `gitar` | `jalan` | Sepeda dari Kafe Senja, jalan terdekat (pathfinding), ±8 mnt |
| 18.00-22.00 | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Pasar malam: sketsa wajah berbayar | `gambar` | `jalan` | Sepeda dari Studio musik, jalan terdekat (pathfinding), ±6 mnt |
| 22.00-05.00 | Rumah nenek Andra (Nek Sumi), tepi sawah (196, 212~) | Tidur | `tidur` | `rumah` | Sepeda dari Alun-alun, jalan terdekat (pathfinding), ±21 mnt |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-10.00 | Sawah & pematang Pandansari (190, 232~) | Keliling jamu dengan nenek | `jalan` | `rumah` | Sepeda dari Rumah nenek Andra, jalan terdekat (pathfinding), ±3 mnt |
| 10.00-16.00 | Rumah nenek Andra (Nek Sumi), tepi sawah (196, 212~) | Mengecat dinding lumbung, sketsa | `lukis` | `mural` | Sepeda dari Sawah & pematang Pandansari, jalan terdekat (pathfinding), ±3 mnt |
| 16.00-18.00 | Sawah & pematang Pandansari (190, 232~) | Layangan di pematang | `berdiri` | `jalan` | Sepeda dari Rumah nenek Andra, jalan terdekat (pathfinding), ±3 mnt |
| 19.00-23.00 | Warung nasi goreng Jl. Lingkar (200, 167~) | Serigala Besi | `duduk` | `geng` | Sepeda dari Sawah & pematang Pandansari, jalan terdekat (pathfinding), ±9 mnt |
| 23.00-05.00 | Rumah nenek Andra (Nek Sumi), tepi sawah (196, 212~) | Tidur | `tidur` | `rumah` | Sepeda dari Warung nasi goreng Jl. Lingkar, jalan terdekat (pathfinding), ±6 mnt |

### Gilang Ramadhan

Rumah: **Rumah panggung hijau Gilang** (86, 127~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Kaus biru 'Depot Air Segar', celana pendek, sandal jepit, handuk di leher |
| `skate` | Kaus kebesaran bergambar kartun, kargo robek, sepatu skate diikat karet |
| `paket_c` | Kemeja kotak satu-satunya, dikancing sampai atas |
| `rumah` | Sarung, kaus robek |
| `jalan` | Windbreaker kuning-biru, topi terbalik |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.30-06.00 | Depot Air Segar (galon) (96, 118~) | Memuat galon ke motor roda tiga | `angkut` | `kerja` | Motor dari Rumah panggung hijau Gilang, jalan terdekat (pathfinding), ±2 mnt |
| 06.00-09.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Rute galon 1: Kenanga & Warkop Simpang | `angkut` | `kerja` | Motor dari Depot Air Segar, Jl. Bantaran, Gang Kenanga, ±4 mnt |
| 09.00-11.00 | Pasar Wirabumi & terminal angkot (114, 98) | Rute galon 2: pasar & Pusat Kota | `angkut` | `kerja` | Motor dari Warkop Simpang & rumah Om Darto, Jl. Raya Wirabumi, ±5 mnt |
| 11.00-13.00 (Sen, Kam) | Rumah nenek Andra (Nek Sumi), tepi sawah (196, 212~) | Rute galon 3: Pandansari & warung pantai (Senin, Kamis) | `angkut` | `kerja` | Motor dari Pasar Wirabumi & terminal angkot, Jl. Selatan, Jl. Lingkar Selatan, ±9 mnt |
| 11.00-13.00 (Sel, Rab, Jum) | Gudang subkontraktor PT Graha (390, 130~) | Rute galon 3: Kawasan Industri (Selasa, Rabu, Jumat) | `angkut` | `kerja` | Motor dari Pasar Wirabumi & terminal angkot, Jl. Raya Pradana, Jl. Industri, ±19 mnt |
| 13.00-17.00 | Taman kota: lapangan basket umum, skatepark, air mancur (126, 46) | Skatepark taman kota | `skate` | `skate` | Motor dari Pasar Wirabumi & terminal angkot, jalan terdekat (pathfinding), ±4 mnt |
| 17.00-19.00 | Tepi Kali Cendana, tempat mancing (92, 130~) | Memancing di Kali Cendana | `mancing` | `rumah` | Motor dari Taman kota: lapangan basket umum, jalan terdekat (pathfinding), ±6 mnt |
| 19.00-21.00 (Sen, Rab, Jum) | PKBM (kelas paket C) (100, 114~) | Kelas paket C (Senin, Rabu, Jumat) | `duduk_tulis` | `paket_c` | Motor dari Tepi Kali Cendana, jalan terdekat (pathfinding), ±2 mnt |
| 19.00-21.00 (Sel, Kam) | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Ngopi & pantun di warkop (Selasa, Kamis) | `duduk` | `jalan` | Motor dari Tepi Kali Cendana, jalan terdekat (pathfinding), ±4 mnt |
| 21.00-05.30 | Rumah panggung hijau Gilang (86, 127~) | Tidur | `tidur` | `rumah` | Jalan kaki dari Tepi Kali Cendana, jalan terdekat (pathfinding), ±2 mnt |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-11.00 | Depot Air Segar (galon) (96, 118~) | Antar galon pagi | `angkut` | `kerja` | Motor dari Rumah panggung hijau Gilang, jalan terdekat (pathfinding), ±2 mnt |
| 11.00-17.00 | Taman kota: lapangan basket umum, skatepark, air mancur (126, 46) | Lomba skate kecil / bikin video | `skate` | `skate` | Motor dari Depot Air Segar, jalan terdekat (pathfinding), ±5 mnt |
| 17.00-19.00 | Tepi Kali Cendana, tempat mancing (92, 130~) | Memancing | `mancing` | `rumah` | Motor dari Taman kota: lapangan basket umum, jalan terdekat (pathfinding), ±6 mnt |
| 19.00-23.00 | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Ngamen kentrung di pasar malam | `nyanyi` | `jalan` | Motor dari Tepi Kali Cendana, jalan terdekat (pathfinding), ±5 mnt |
| 23.00-06.00 | Rumah panggung hijau Gilang (86, 127~) | Tidur | `tidur` | `rumah` | Motor dari Alun-alun, jalan terdekat (pathfinding), ±5 mnt |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 07.00-10.00 | Pantai Lintang & voli pantai (140, 262) | Antar galon ke warung pantai | `angkut` | `kerja` | Motor dari Rumah panggung hijau Gilang, Jl. Pantai Lintang, ±10 mnt |
| 10.00-16.00 | Taman kota: lapangan basket umum, skatepark, air mancur (126, 46) | Skate | `skate` | `skate` | Motor dari Pantai Lintang & voli pantai, jalan terdekat (pathfinding), ±14 mnt |
| 16.00-19.00 | Tepi Kali Cendana, tempat mancing (92, 130~) | Memancing | `mancing` | `rumah` | Motor dari Taman kota: lapangan basket umum, jalan terdekat (pathfinding), ±6 mnt |
| 19.00-06.00 | Rumah panggung hijau Gilang (86, 127~) | Di rumah, tidur | `tidur` | `rumah` | Jalan kaki dari Tepi Kali Cendana, jalan terdekat (pathfinding), ±2 mnt |

## Keluarga, kampung & geng

### Om Darto

Rumah: **Warkop Simpang & rumah Om Darto (kamar pemain)** (46, 86). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Kaus oblong belel, celemek hijau Warkop Simpang, sarung di pundak, sandal jepit |
| `rumah` | Kaus singlet, sarung |
| `jalan` | Kemeja batik lengan pendek, celana bahan, helm bogo |
| `malam` | Jaket jeans tua, sarung melilit leher |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 04.30-06.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Menyalakan kompor, merebus air, menyusun gelas | `masak` | `kerja` |  |
| 06.00-11.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Melayani sarapan & kopi pagi (ramai 06.00-08.00) | `masak` | `kerja` |  |
| 11.00-13.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Tidur siang di kursi warkop | `tidur_kursi` | `kerja` |  |
| 13.00-17.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Warung sepi: menghitung uang sambil mengernyit, burung perkutut | `duduk` | `kerja` |  |
| 17.00-18.00 | Pasar Wirabumi & terminal angkot (114, 98) | Belanja kopi, gula, roti ke pasar (motor bebek) | `naik_motor` | `jalan` | Motor dari Warkop Simpang & rumah Om Darto, Jl. Raya Wirabumi, ±5 mnt |
| 18.00-23.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Ramai malam: kopi, catur, dangdut lama | `masak` | `kerja` | Motor dari Pasar Wirabumi & terminal angkot, jalan terdekat (pathfinding), ±5 mnt |
| 23.00-00.30 | Pos ronda Gang Kenanga (36, 88~) | Main catur di pos ronda | `duduk` | `malam` | Motor dari Warkop Simpang & rumah Om Darto, jalan terdekat (pathfinding), ±2 mnt |
| 00.30-04.30 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Tidur | `tidur` | `rumah` | Motor dari Pos ronda Gang Kenanga, jalan terdekat (pathfinding), ±2 mnt |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.30-11.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Warkop buka setengah hari | `masak` | `kerja` |  |
| 11.00-15.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Merawat perkutut, tidur siang | `tidur_kursi` | `rumah` |  |
| 15.00-17.00 | SD Kenanga (sekolah Cici) (58, 96~) | Mengajak Cici jalan sore | `jalan` | `jalan` | Motor dari Warkop Simpang & rumah Om Darto, jalan terdekat (pathfinding), ±2 mnt |
| 17.00-23.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Ramai malam | `masak` | `kerja` | Motor dari SD Kenanga, jalan terdekat (pathfinding), ±2 mnt |
| 23.00-05.30 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Cici

Rumah: **Warkop Simpang & rumah Om Darto (kamar pemain)** (46, 86). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `sekolah` | Seragam SD merah-putih, ikat rambut stroberi, tas kartun |
| `rumah` | Kaus kartun, rok rempel |
| `tidur` | Piama bergambar kelinci |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-06.30 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Sarapan, merengek minta uang jajan | `makan` | `sekolah` |  |
| 06.30-11.30 | SD Kenanga (sekolah Cici) (58, 96~) | Sekolah SD | `duduk_tulis` | `sekolah` | Jalan kaki dari Warkop Simpang & rumah Om Darto, jalan terdekat (pathfinding), ±5 mnt |
| 11.30-14.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Pulang, makan, nonton kartun | `duduk` | `rumah` | Jalan kaki dari SD Kenanga, jalan terdekat (pathfinding), ±5 mnt |
| 14.00-17.00 | Gapura Gang Kenanga (35, 74) | Main masak-masakan & layangan di gang | `jongkok` | `rumah` | Jalan kaki dari Warkop Simpang & rumah Om Darto, jalan terdekat (pathfinding), ±5 mnt |
| 17.00-19.00 | Musala kampung (30, 100) | Mengaji | `baca` | `rumah` | Jalan kaki dari Gapura Gang Kenanga, jalan terdekat (pathfinding), ±9 mnt |
| 19.00-20.30 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Minta diajari PR (mini game Les PR) | `duduk_tulis` | `rumah` | Jalan kaki dari Musala kampung, jalan terdekat (pathfinding), ±7 mnt |
| 20.30-06.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Tidur | `tidur` | `tidur` |  |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-09.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Kartun Minggu pagi | `duduk` | `rumah` |  |
| 09.00-12.00 | Lapangan bola kampung (88, 104) | Menonton liga futsal kampung (fans Uti) | `berdiri` | `rumah` | Jalan kaki dari Warkop Simpang & rumah Om Darto, jalan terdekat (pathfinding), ±15 mnt |
| 12.00-17.00 | Gapura Gang Kenanga (35, 74) | Main di gang | `jongkok` | `rumah` | Jalan kaki dari Lapangan bola kampung, jalan terdekat (pathfinding), ±20 mnt |
| 17.00-20.30 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Di rumah | `duduk` | `rumah` | Jalan kaki dari Gapura Gang Kenanga, jalan terdekat (pathfinding), ±5 mnt |
| 20.30-06.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Tidur | `tidur` | `tidur` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Bimo Prasetyo

Rumah: **Rumah Bimo + gerobak bakso** (40, 95~). Moda utama: sepeda.

| Outfit | Isi |
|---|---|
| `sekolah` | Seragam sesak di perut, kancing hampir lepas |
| `rumah` | Kaus kebesaran bergambar mi, celana pendek |
| `masak` | Celemek bakso ayahnya, handuk di bahu |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-06.30 | Rumah Bimo + gerobak bakso (40, 95~) | Sarapan tiga kali | `makan` | `sekolah` |  |
| 06.30-06.50 | SMA Negeri 3 Wirabumi, gerbang (110, 62) | Bersepeda dengan pemain (kalau diajak) atau sendiri | `sepeda` | `sekolah` | Sepeda dari Rumah Bimo + gerobak bakso, Gang Kenanga, Jl. Raya Wirabumi, ±11 mnt |
| 06.50-09.30 | Kelas X-2 (110, 62) | Sebangku pemain | `duduk` | `sekolah` | di dalam sekolah |
| 09.30-10.00 | Kantin (110, 62) | Mencicipi semua lapak | `makan` | `sekolah` | di dalam sekolah |
| 10.00-12.00 | Kelas X-2 (110, 62) | Pelajaran | `duduk` | `sekolah` | di dalam sekolah |
| 12.00-12.30 | Kantin (110, 62) | Makan siang | `makan` | `sekolah` | di dalam sekolah |
| 12.30-14.00 | Kelas X-2 (110, 62) | Pelajaran, tidur di meja | `tidur_meja` | `sekolah` | di dalam sekolah |
| 14.00-17.00 | SMA Negeri 3 Wirabumi, gerbang (110, 62) | Membantu ayah jualan bakso di depan sekolah | `jualan` | `masak` | di dalam sekolah |
| 17.00-21.00 | Rumah Bimo + gerobak bakso (40, 95~) | Menonton acara masak, main game HP | `hp` | `rumah` | Sepeda dari SMA Negeri 3 Wirabumi, jalan terdekat (pathfinding), ±11 mnt |
| 21.00-06.00 | Rumah Bimo + gerobak bakso (40, 95~) | Tidur | `tidur` | `rumah` |  |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 07.00-11.00 | Lapangan bola kampung (88, 104) | Liga futsal kampung (cadangan abadi) | `berdiri` | `rumah` | Sepeda dari Rumah Bimo + gerobak bakso, jalan terdekat (pathfinding), ±7 mnt |
| 11.00-17.00 | Rumah Bimo + gerobak bakso (40, 95~) | Bereksperimen resep | `masak` | `masak` | Sepeda dari Lapangan bola kampung, jalan terdekat (pathfinding), ±7 mnt |
| 17.00-21.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Nongkrong di warkop | `duduk` | `rumah` | Sepeda dari Rumah Bimo + gerobak bakso, jalan terdekat (pathfinding), ±2 mnt |
| 21.00-07.00 | Rumah Bimo + gerobak bakso (40, 95~) | Tidur | `tidur` | `rumah` | Sepeda dari Warkop Simpang & rumah Om Darto, jalan terdekat (pathfinding), ±2 mnt |

**Libur Panjang (tambahan, sisanya ikut Minggu)**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 07.00-15.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Setelah Bab 9: koki warkop (Libur Panjang kerja penuh) | `masak` | `masak` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Mas Fajar

Rumah: **Ruko Pelita & bengkel Mas Fajar** (170, 84). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Kaus kerja penuh oli, jeans robek, handuk di leher, gelang karet |
| `geng` | Jaket hitam lis kuning Lampu Kota |
| `paket_c` | Kemeja kotak dipinjam dari Om Darto |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 07.00-12.00 | Ruko Pelita & bengkel Mas Fajar (170, 84) | Membuka bengkel, servis motor | `servis` | `kerja` |  |
| 12.00-13.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Makan siang & kopi | `makan` | `kerja` | Motor dari Ruko Pelita & bengkel Mas Fajar, Jl. Raya Wirabumi, ±8 mnt |
| 13.00-18.00 | Ruko Pelita & bengkel Mas Fajar (170, 84) | Bengkel (Uti & Arga membantu) | `servis` | `kerja` | Motor dari Warkop Simpang & rumah Om Darto, jalan terdekat (pathfinding), ±8 mnt |
| 18.00-19.00 | Ruko Pelita & bengkel Mas Fajar (170, 84) | Belajar buku paket C diam-diam | `baca` | `kerja` |  |
| 19.00-23.00 | Gudang markas Lampu Kota (50, 131) | Markas Lampu Kota | `duduk` | `geng` | Motor dari Ruko Pelita & bengkel Mas Fajar, jalan terdekat (pathfinding), ±9 mnt |
| 23.00-07.00 | Ruko Pelita & bengkel Mas Fajar (170, 84) | Tidur di kamar belakang bengkel | `tidur` | `kerja` | Motor dari Gudang markas Lampu Kota, jalan terdekat (pathfinding), ±9 mnt |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 09.00-15.00 | Ruko Pelita & bengkel Mas Fajar (170, 84) | Bengkel setengah hari | `servis` | `kerja` |  |
| 15.00-23.00 | Gudang markas Lampu Kota (50, 131) | Konvoi & markas | `naik_motor` | `geng` | Motor dari Ruko Pelita & bengkel Mas Fajar, jalan terdekat (pathfinding), ±9 mnt |
| 23.00-09.00 | Ruko Pelita & bengkel Mas Fajar (170, 84) | Tidur | `tidur` | `kerja` | Motor dari Gudang markas Lampu Kota, jalan terdekat (pathfinding), ±9 mnt |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Bang Jaka

Rumah: **Gudang markas Lampu Kota** (50, 131). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `geng` | Jaket hitam lis kuning Lampu Kota, rambut gondrong diikat, boots |
| `kerja` | Kaus hitam, celana kargo, sarung tangan kerja (kuli angkut pasar) |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 04.00-10.00 | Pasar Wirabumi & terminal angkot (114, 98) | Kuli angkut di pasar subuh | `angkut` | `kerja` | Motor dari Gudang markas Lampu Kota, Jl. Bantaran, Jl. Selatan, ±5 mnt |
| 10.00-15.00 | Gudang markas Lampu Kota (50, 131) | Tidur siang di kamar atas gudang | `tidur` | `kerja` | Motor dari Pasar Wirabumi & terminal angkot, jalan terdekat (pathfinding), ±5 mnt |
| 15.00-18.00 | Gudang markas Lampu Kota (50, 131) | Melatih anggota baru berantem | `silat` | `geng` |  |
| 18.00-20.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Ngopi dengan Om Darto (sebelum rahasia terbuka: menghindar) | `duduk` | `geng` | Motor dari Gudang markas Lampu Kota, jalan terdekat (pathfinding), ±3 mnt |
| 20.00-02.00 | Gudang markas Lampu Kota (50, 131) | Rapat & patroli malam Kenanga-Bantaran | `naik_motor` | `geng` | Motor dari Warkop Simpang & rumah Om Darto, jalan terdekat (pathfinding), ±3 mnt |
| 02.00-04.00 | Gudang markas Lampu Kota (50, 131) | Tidur | `tidur` | `geng` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Kobar

Rumah: **Bengkel Wijaya Motor (rumah Kirana & Kobar)** (190, 165~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `geng` | Mohawk hitam-merah, rompi jeans patch serigala, rantai dompet |
| `kerja` | Wearpack hitam terbuka sampai pinggang |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 08.00-17.00 | Bengkel Wijaya Motor (rumah Kirana & Kobar) (190, 165~) | Bengkel Wijaya Motor | `servis` | `kerja` |  |
| 17.00-19.00 | Pabrik es tua (162, 129) | Latihan berantem di pabrik es tua | `silat` | `geng` | Motor dari Bengkel Wijaya Motor, Jl. Selatan, ±3 mnt |
| 19.00-22.00 | Warung nasi goreng Jl. Lingkar (200, 167~) | Serigala Besi kumpul | `duduk` | `geng` | Motor dari Pabrik es tua, jalan terdekat (pathfinding), ±4 mnt |
| 22.00-01.00 | Jl. Lingkar Selatan, garis start drag (214, 166) | Balap liar & taruhan (Selasa, Jumat); hari lain jalan Kawasan Industri | `naik_motor` | `geng` | Motor dari Warung nasi goreng Jl. Lingkar, jalan terdekat (pathfinding), ±2 mnt |
| 01.00-08.00 | Bengkel Wijaya Motor (rumah Kirana & Kobar) (190, 165~) | Tidur | `tidur` | `kerja` | Motor dari Jl. Lingkar Selatan, jalan terdekat (pathfinding), ±2 mnt |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Bu Narti

Rumah: **Kos Bu Narti** (44, 80~). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `rumah` | Bergo bunga-bunga, daster batik, sandal jepit, kipas tangan, kacamata baca di ujung hidung |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-07.00 | Kos Bu Narti (44, 80~) | Menyapu halaman kos sambil memantau gang | `sapu` | `rumah` |  |
| 07.00-09.00 | Gapura Gang Kenanga (35, 74) | Belanja sayur di gerobak Bu Sum, bergosip | `ngobrol` | `rumah` | Jalan kaki dari Kos Bu Narti, jalan terdekat (pathfinding), ±4 mnt |
| 09.00-15.00 | Kos Bu Narti (44, 80~) | Mengurus kos, menonton sinetron | `duduk` | `rumah` | Jalan kaki dari Gapura Gang Kenanga, jalan terdekat (pathfinding), ±4 mnt |
| 15.00-18.00 | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Duduk di bangku depan warkop, gosip sore | `ngobrol` | `rumah` | Jalan kaki dari Kos Bu Narti, jalan terdekat (pathfinding), ±2 mnt |
| 18.00-21.00 | Kos Bu Narti (44, 80~) | Arisan (Kamis) atau sinetron | `duduk` | `rumah` | Jalan kaki dari Warkop Simpang & rumah Om Darto, jalan terdekat (pathfinding), ±2 mnt |
| 21.00-05.00 | Kos Bu Narti (44, 80~) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Pak RT Slamet

Rumah: **Rumah Pak RT Slamet** (38, 90~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `rumah` | Kopiah hitam, kemeja batik lengan pendek, buku catatan warga |
| `kerja` | Seragam PNS kelurahan |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 07.00-14.00 | Pasar Wirabumi & terminal angkot (114, 98) | Kantor kelurahan di Pusat Kota | `duduk_tulis` | `kerja` | Motor dari Rumah Pak RT Slamet, jalan terdekat (pathfinding), ±5 mnt |
| 14.00-18.00 | Rumah Pak RT Slamet (38, 90~) | Melayani surat warga di teras | `duduk_tulis` | `rumah` | Motor dari Pasar Wirabumi & terminal angkot, jalan terdekat (pathfinding), ±5 mnt |
| 18.00-19.30 | Musala kampung (30, 100) | Magrib & isya | `salat` | `rumah` | Motor dari Rumah Pak RT Slamet, jalan terdekat (pathfinding), ±2 mnt |
| 21.00-23.00 | Pos ronda Gang Kenanga (36, 88~) | Ronda (Sabtu: kerja bakti pagi 07.00 di gang) | `duduk` | `rumah` | Motor dari Musala kampung, jalan terdekat (pathfinding), ±2 mnt |
| 23.00-07.00 | Rumah Pak RT Slamet (38, 90~) | Tidur | `tidur` | `rumah` | Jalan kaki dari Pos ronda Gang Kenanga, jalan terdekat (pathfinding), ±2 mnt |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Rio

Rumah: **Rumah Rio** (240, 62~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `sekolah` | Seragam dikeluarkan, undercut, kalung rantai |
| `geng` | Kaus hitam ketat, jaket kulit imitasi |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.50-14.00 | Kelas XI-1 (110, 62) | Sekolah, mengikuti Bram | `duduk` | `sekolah` | Motor dari Rumah Rio, jalan terdekat (pathfinding), ±9 mnt |
| 14.00-17.00 | Parkiran guru (110, 62) | Nongkrong geng, iseng menendang tas anak kelas X | `berdiri` | `geng` | di dalam sekolah |
| 17.00-20.00 | GOR Kota & kolam renang (168, 40) | Angkat beban di gym GOR | `olahraga` | `geng` | Motor dari Parkiran guru, jalan terdekat (pathfinding), ±4 mnt |
| 20.00-23.00 | Plaza Wirabumi (mal, bioskop, butik) (178, 98) | Nongkrong | `ngobrol` | `geng` | Motor dari GOR Kota & kolam renang, jalan terdekat (pathfinding), ±4 mnt |
| 23.00-06.50 | Rumah Rio (240, 62~) | Tidur | `tidur` | `geng` | Motor dari Plaza Wirabumi, jalan terdekat (pathfinding), ±5 mnt |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Kevin

Rumah: **Apartemen Kevin** (162, 102~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `sekolah` | Seragam rapi, kacamata bulat tipis, rambut belah tengah, HP di tangan |
| `jalan` | Kemeja polos rapi, sneakers mahal |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.50-14.00 | Kelas XI-1 (110, 62) | Sekolah, main HP | `hp` | `sekolah` | Motor dari Apartemen Kevin, jalan terdekat (pathfinding), ±4 mnt |
| 14.00-16.00 | Kantin, meja pojok AC (meja geng Bram) (110, 62) | Menyusun gosip & akun palsu | `hp` | `sekolah` | di dalam sekolah |
| 16.00-22.00 | Kafe Senja (klub sastra, barista Kevin) (156, 90~) | Kafe, laptop | `duduk` | `jalan` | Motor dari Kantin, jalan terdekat (pathfinding), ±4 mnt |
| 22.00-06.50 | Apartemen Kevin (162, 102~) | Tidur | `tidur` | `jalan` | Motor dari Kafe Senja, jalan terdekat (pathfinding), ±2 mnt |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

## Staf & guru sekolah

### Pak Ujang

Rumah: **Rumah dinas penjaga (Pak Ujang & Arga), belakang Gedung Lama** (106, 56~). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `kerja` | Kaus abu, topi pet, sapu lidi, kunci banyak di pinggang |
| `rumah` | Sarung, kaus oblong, peci |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.30-06.30 | Halaman depan & plaza (110, 62) | Membuka gerbang, menyapu halaman | `sapu` | `kerja` | Jalan kaki dari Rumah dinas penjaga, jalan terdekat (pathfinding), ±2 mnt |
| 06.30-09.30 | Pos satpam & gerbang (110, 62) | Duduk di pos, menyapa siswa | `duduk` | `kerja` | di dalam sekolah |
| 09.30-12.00 | Halaman depan & plaza (110, 62) | Merawat taman, membetulkan bangku | `jongkok` | `kerja` | di dalam sekolah |
| 12.00-13.00 | Musala sekolah (110, 62) | Zuhur | `salat` | `kerja` | di dalam sekolah |
| 13.00-17.30 | Halaman depan & plaza (110, 62) | Membersihkan kelas setelah pulang | `sapu` | `kerja` | di dalam sekolah |
| 17.30-21.00 | Rumah dinas penjaga (Pak Ujang & Arga), belakang Gedung Lama (106, 56~) | Makan, radio tua | `duduk` | `rumah` | Jalan kaki dari Halaman depan & plaza, jalan terdekat (pathfinding), ±2 mnt |
| 21.00-21.30 | Belakang Gedung Lama (taman rahasia Arga) (110, 62) | Keliling sekolah dengan senter (21.00) | `jalan` | `kerja` | Jalan kaki dari Rumah dinas penjaga, jalan terdekat (pathfinding), ±2 mnt |
| 21.30-01.00 | Rumah dinas penjaga (Pak Ujang & Arga), belakang Gedung Lama (106, 56~) | Tidur | `tidur` | `rumah` | Jalan kaki dari Belakang Gedung Lama, jalan terdekat (pathfinding), ±2 mnt |
| 01.00-01.30 | Belakang Gedung Lama (taman rahasia Arga) (110, 62) | Keliling kedua (01.00) | `jalan` | `kerja` | Jalan kaki dari Rumah dinas penjaga, jalan terdekat (pathfinding), ±2 mnt |
| 01.30-05.30 | Rumah dinas penjaga (Pak Ujang & Arga), belakang Gedung Lama (106, 56~) | Tidur | `tidur` | `rumah` | Jalan kaki dari Belakang Gedung Lama, jalan terdekat (pathfinding), ±2 mnt |

### Mak Iyah

Rumah: **Warung Mak Iyah, belakang sekolah** (102, 66~). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `kerja` | Daster, celemek, kain di kepala |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-17.00 | Warung Mak Iyah, belakang sekolah (102, 66~) | Warung gorengan belakang sekolah (ramai istirahat & jam bolos) | `jualan` | `kerja` |  |
| 17.00-05.00 | Warung Mak Iyah, belakang sekolah (102, 66~) | Rumah di belakang warung | `tidur` | `kerja` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Ama

Rumah: **Toko Buku Pena & studio lantai 2 (rumah Mei)** (124, 74~). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `rumah` | Rambut putih disanggul, kacamata tebal, kebaya encim, kipas |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-14.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Jaga toko, mengukus bakpao | `kasir` | `rumah` |  |
| 14.00-17.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Tidur siang di kursi rotan | `tidur_kursi` | `rumah` |  |
| 17.00-21.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Menonton TV, memanggil Mei turun makan | `duduk` | `rumah` |  |
| 21.00-06.00 | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Bu Hartini

Rumah: **Rumah tua Bu Hartini dekat alun-alun** (140, 70~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Kebaya kerja, kacamata rantai, sanggul |
| `rumah` | Pakaian rumah sederhana |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.30-07.00 | Parkiran guru (110, 62) | Datang, parkir motor/mobil | `jalan` | `kerja` | Motor dari Rumah tua Bu Hartini dekat alun-alun, jalan terdekat (pathfinding), ±2 mnt |
| 07.00-14.00 | Ruang kepala sekolah (110, 62) | Mengajar sesuai jadwal pelajaran, sisanya di tempat ini | `mengajar` | `kerja` | di dalam sekolah |
| 14.00-16.00 | Ruang kepala sekolah (110, 62) | Ekskul / rapat / koreksi | `duduk_tulis` | `kerja` |  |
| 16.00-21.00 | Rumah tua Bu Hartini dekat alun-alun (140, 70~) | Pulang | `duduk` | `rumah` | Motor dari Ruang kepala sekolah, jalan terdekat (pathfinding), ±2 mnt |
| 21.00-06.30 | Rumah tua Bu Hartini dekat alun-alun (140, 70~) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Bu Ratna

Rumah: **Rumah guru di pinggir Bukit Asri (Bu Ratna, Bu Melati)** (196, 70~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Blazer hitam, rambut dikonde, penggaris kayu |
| `rumah` | Pakaian rumah sederhana |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.30-07.00 | Parkiran guru (110, 62) | Datang, parkir motor/mobil | `jalan` | `kerja` | Motor dari Rumah guru di pinggir Bukit Asri, jalan terdekat (pathfinding), ±6 mnt |
| 07.00-14.00 | Ruang guru (110, 62) | Mengajar sesuai jadwal pelajaran, sisanya di tempat ini | `mengajar` | `kerja` | di dalam sekolah |
| 14.00-16.00 | Ruang guru (110, 62) | Ekskul / rapat / koreksi | `duduk_tulis` | `kerja` |  |
| 16.00-21.00 | Rumah guru di pinggir Bukit Asri (Bu Ratna, Bu Melati) (196, 70~) | Pulang | `duduk` | `rumah` | Motor dari Ruang guru, jalan terdekat (pathfinding), ±6 mnt |
| 21.00-06.30 | Rumah guru di pinggir Bukit Asri (Bu Ratna, Bu Melati) (196, 70~) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Pak Hendro

Rumah: **Mes guru** (98, 58~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Kaus olahraga, peluit, topi |
| `rumah` | Pakaian rumah sederhana |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.30-07.00 | Parkiran guru (110, 62) | Datang, parkir motor/mobil | `jalan` | `kerja` | Motor dari Mes guru, jalan terdekat (pathfinding), ±2 mnt |
| 07.00-14.00 | Lapangan upacara / futsal (110, 62) | Mengajar sesuai jadwal pelajaran, sisanya di tempat ini | `mengajar` | `kerja` | di dalam sekolah |
| 14.00-16.00 | Lapangan upacara / futsal (110, 62) | Melatih futsal; Minggu pagi jadi marshal liga sirkuit (Bab 9+) | `mengajar` | `kerja` |  |
| 16.00-21.00 | Mes guru (98, 58~) | Pulang | `duduk` | `rumah` | Motor dari Lapangan upacara / futsal, jalan terdekat (pathfinding), ±2 mnt |
| 21.00-06.30 | Mes guru (98, 58~) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Pak Wawan

Rumah: **Rumah Pak Wawan di Kenanga** (56, 78~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Seragam PNS, kumis, buku pelanggaran |
| `rumah` | Pakaian rumah sederhana |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.30-07.00 | Parkiran guru (110, 62) | Datang, parkir motor/mobil | `jalan` | `kerja` | Motor dari Rumah Pak Wawan di Kenanga, jalan terdekat (pathfinding), ±4 mnt |
| 07.00-14.00 | Halaman depan & plaza (110, 62) | Patroli koridor tiap 30 menit, menangkap yang bolos | `jalan` | `kerja` | di dalam sekolah |
| 14.00-16.00 | Halaman depan & plaza (110, 62) | Ekskul / rapat / koreksi | `duduk_tulis` | `kerja` |  |
| 16.00-21.00 | Rumah Pak Wawan di Kenanga (56, 78~) | Pulang | `duduk` | `rumah` | Motor dari Halaman depan & plaza, jalan terdekat (pathfinding), ±4 mnt |
| 21.00-06.30 | Rumah Pak Wawan di Kenanga (56, 78~) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Bu Sinta

Rumah: **Kos & rumah guru Pusat Kota (Bu Sinta, Mr. Anton)** (134, 92~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Hijab pastel, kardigan, buku |
| `rumah` | Pakaian rumah sederhana |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.30-07.00 | Parkiran guru (110, 62) | Datang, parkir motor/mobil | `jalan` | `kerja` | Motor dari Kos & rumah guru Pusat Kota, jalan terdekat (pathfinding), ±3 mnt |
| 07.00-14.00 | Ruang mading (110, 62) | Mengajar sesuai jadwal pelajaran, sisanya di tempat ini | `mengajar` | `kerja` | di dalam sekolah |
| 14.00-16.00 | Ruang mading (110, 62) | Ekskul / rapat / koreksi | `duduk_tulis` | `kerja` |  |
| 16.00-21.00 | Kos & rumah guru Pusat Kota (Bu Sinta, Mr. Anton) (134, 92~) | Pulang | `duduk` | `rumah` | Motor dari Ruang mading, jalan terdekat (pathfinding), ±3 mnt |
| 21.00-06.30 | Kos & rumah guru Pusat Kota (Bu Sinta, Mr. Anton) (134, 92~) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Mr. Anton

Rumah: **Kos & rumah guru Pusat Kota (Bu Sinta, Mr. Anton)** (134, 92~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Kemeja slim, sneakers |
| `rumah` | Pakaian rumah sederhana |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.30-07.00 | Parkiran guru (110, 62) | Datang, parkir motor/mobil | `jalan` | `kerja` | Motor dari Kos & rumah guru Pusat Kota, jalan terdekat (pathfinding), ±3 mnt |
| 07.00-14.00 | Ruang guru (110, 62) | Mengajar sesuai jadwal pelajaran, sisanya di tempat ini | `mengajar` | `kerja` | di dalam sekolah |
| 14.00-16.00 | Ruang guru (110, 62) | Ekskul / rapat / koreksi | `duduk_tulis` | `kerja` |  |
| 16.00-21.00 | Kos & rumah guru Pusat Kota (Bu Sinta, Mr. Anton) (134, 92~) | Pulang | `duduk` | `rumah` | Motor dari Ruang guru, jalan terdekat (pathfinding), ±3 mnt |
| 21.00-06.30 | Kos & rumah guru Pusat Kota (Bu Sinta, Mr. Anton) (134, 92~) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Pak Gunadi

Rumah: **Rumah penuh alat Pak Gunadi** (60, 116~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Jas lab bernoda, rambut putih berdiri |
| `rumah` | Pakaian rumah sederhana |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.30-07.00 | Parkiran guru (110, 62) | Datang, parkir motor/mobil | `jalan` | `kerja` | Motor dari Rumah penuh alat Pak Gunadi, jalan terdekat (pathfinding), ±5 mnt |
| 07.00-14.00 | Ruang guru (110, 62) | Mengajar sesuai jadwal pelajaran, sisanya di tempat ini | `mengajar` | `kerja` | di dalam sekolah |
| 14.00-16.00 | Ruang guru (110, 62) | Ekskul / rapat / koreksi | `duduk_tulis` | `kerja` |  |
| 16.00-21.00 | Rumah penuh alat Pak Gunadi (60, 116~) | Pulang | `duduk` | `rumah` | Motor dari Ruang guru, jalan terdekat (pathfinding), ±5 mnt |
| 21.00-06.30 | Rumah penuh alat Pak Gunadi (60, 116~) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Bu Melati

Rumah: **Rumah guru di pinggir Bukit Asri (Bu Ratna, Bu Melati)** (196, 70~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Gaun etnik, gelang kayu |
| `rumah` | Pakaian rumah sederhana |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.30-07.00 | Parkiran guru (110, 62) | Datang, parkir motor/mobil | `jalan` | `kerja` | Motor dari Rumah guru di pinggir Bukit Asri, jalan terdekat (pathfinding), ±6 mnt |
| 07.00-14.00 | Studio musik (110, 62) | Mengajar sesuai jadwal pelajaran, sisanya di tempat ini | `mengajar` | `kerja` | di dalam sekolah |
| 14.00-16.00 | Studio musik (110, 62) | Ekskul / rapat / koreksi | `duduk_tulis` | `kerja` |  |
| 16.00-21.00 | Rumah guru di pinggir Bukit Asri (Bu Ratna, Bu Melati) (196, 70~) | Pulang | `duduk` | `rumah` | Motor dari Studio musik, jalan terdekat (pathfinding), ±6 mnt |
| 21.00-06.30 | Rumah guru di pinggir Bukit Asri (Bu Ratna, Bu Melati) (196, 70~) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

## NPC wilayah luar kota

### Kyai Mahfud Sastrowiryo

Rumah: **Pesantren Darul Falah** (-116, 94). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `rumah` | Peci hitam, baju koko putih, sarung kotak hijau, tasbih kayu, kacamata bulat emas |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 04.00-06.30 | Pesantren Darul Falah (-116, 94) | Subuh berjamaah, mengajar santri | `mengajar` | `rumah` |  |
| 06.30-11.30 | Pesantren Darul Falah (-116, 94) | Perpustakaan pesantren, menulis | `duduk_tulis` | `rumah` |  |
| 11.30-13.00 | Pesantren Darul Falah (-116, 94) | Zuhur, makan bersama santri | `salat` | `rumah` |  |
| 13.00-15.00 | Pesantren Darul Falah (-116, 94) | Menerima tamu warga | `ngobrol` | `rumah` |  |
| 15.00-17.00 | Pasar hewan Tegalsari (-92, 108) | Jalan ke pasar hewan menyapa warga (lewat Jl. Tegalsari) | `jalan` | `rumah` | Jalan kaki dari Pesantren Darul Falah, Jl. Tegalsari, ±9 mnt |
| 17.00-21.00 | Pesantren Darul Falah (-116, 94) | Magrib, mengaji kitab dengan santri senior | `mengajar` | `rumah` | Jalan kaki dari Pasar hewan Tegalsari, jalan terdekat (pathfinding), ±9 mnt |
| 21.00-04.00 | Pesantren Darul Falah (-116, 94) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Abah Karta

Rumah: **Rumah panggung Wulan & Abah Karta, tepi kebun teh** (266, -27~). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `silat` | Baju pangsi hitam pudar, ikat kepala batik cokelat |
| `kebun` | Kaus lengan panjang, caping, sarung diikat |
| `rumah` | Sarung, kaus oblong, kecapi di pangkuan |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 04.30-06.00 | Pendopo perguruan Kembang Teh (258, -34~) | Melatih silat subuh | `silat` | `silat` | Jalan kaki dari Rumah panggung Wulan & Abah Karta, jalan terdekat (pathfinding), ±4 mnt |
| 06.00-12.00 | Kebun teh Sukamekar (blok petik) (300, -30~) | Merawat kebun keluarga | `petik` | `kebun` | Jalan kaki dari Pendopo perguruan Kembang Teh, jalan terdekat (pathfinding), ±14 mnt |
| 12.00-14.00 | Rumah panggung Wulan & Abah Karta, tepi kebun teh (266, -27~) | Makan, tidur siang | `tidur` | `rumah` | Jalan kaki dari Kebun teh Sukamekar, jalan terdekat (pathfinding), ±11 mnt |
| 14.00-17.00 | Pendopo perguruan Kembang Teh (258, -34~) | Melatih murid silat cilik | `silat` | `silat` | Jalan kaki dari Rumah panggung Wulan & Abah Karta, jalan terdekat (pathfinding), ±4 mnt |
| 17.00-19.00 | Rumah panggung Wulan & Abah Karta, tepi kebun teh (266, -27~) | Makan malam | `makan` | `rumah` | Jalan kaki dari Pendopo perguruan Kembang Teh, jalan terdekat (pathfinding), ±4 mnt |
| 19.00-21.00 | Rumah panggung Wulan & Abah Karta, tepi kebun teh (266, -27~) | Main kecapi di teras | `gitar` | `rumah` |  |
| 21.00-04.30 | Rumah panggung Wulan & Abah Karta, tepi kebun teh (266, -27~) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Serma Hadi Aditya

Rumah: **Rumah dinas keluarga Aditya** (354, 64~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `dinas` | Seragam loreng, baret, jam tangan besar |
| `olahraga` | Kaus olahraga hijau, celana training |
| `rumah` | Kaus putih, sarung |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-06.00 | Lapangan apel asrama (346, 44) | Memimpin lari subuh | `lari` | `olahraga` | Motor dari Rumah dinas keluarga Aditya, jalan terdekat (pathfinding), ±2 mnt |
| 06.00-07.00 | Rumah dinas keluarga Aditya (354, 64~) | Sarapan, menanyai nilai Dimas | `makan` | `dinas` | Motor dari Lapangan apel asrama, jalan terdekat (pathfinding), ±2 mnt |
| 07.00-16.00 | Lapangan apel asrama (346, 44) | Dinas: apel, latihan, administrasi | `berdiri` | `dinas` | Motor dari Rumah dinas keluarga Aditya, jalan terdekat (pathfinding), ±2 mnt |
| 16.00-18.00 | Gerbang jaga Asrama Batalyon 3 (336, 72) | Mengecek pos jaga | `berdiri` | `dinas` | Motor dari Lapangan apel asrama, jalan terdekat (pathfinding), ±2 mnt |
| 18.00-22.00 | Rumah dinas keluarga Aditya (354, 64~) | Di rumah, berita TV | `duduk` | `rumah` | Motor dari Gerbang jaga Asrama Batalyon 3, jalan terdekat (pathfinding), ±2 mnt |
| 22.00-05.00 | Rumah dinas keluarga Aditya (354, 64~) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Pak Sudarmaji

Rumah: **Rumah dinas petugas pintu air** (-62, 42~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Kemeja dinas PU kusam, helm proyek kuning, sepatu bot karet, buku catatan |
| `rumah` | Kaus partai, sarung |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-07.00 | Rumah dinas petugas pintu air (-62, 42~) | Sarapan | `makan` | `rumah` |  |
| 07.00-12.00 | Bendungan & pintu air Sirnagalih (-74, 34) | Mencatat debit air, memeriksa pintu air | `duduk_tulis` | `kerja` | Motor dari Rumah dinas petugas pintu air, jalan terdekat (pathfinding), ±2 mnt |
| 12.00-13.00 | Dermaga perahu & warung ikan bakar (-60, -14) | Makan siang di warung ikan bakar | `makan` | `kerja` | Motor dari Bendungan & pintu air Sirnagalih, jalan keliling waduk, ±3 mnt |
| 13.00-16.00 | Bendungan & pintu air Sirnagalih (-74, 34) | Jaga pintu air | `berdiri` | `kerja` | Motor dari Dermaga perahu & warung ikan bakar, jalan terdekat (pathfinding), ±3 mnt |
| 16.00-22.00 | Rumah dinas petugas pintu air (-62, 42~) | Di rumah, anak tiga | `duduk` | `rumah` | Motor dari Bendungan & pintu air Sirnagalih, jalan terdekat (pathfinding), ±2 mnt |
| 22.00-23.00 | Bendungan & pintu air Sirnagalih (-74, 34) | Cek malam saat musim hujan (bulan Hujan & Hujan Akhir) | `berdiri` | `kerja` | Motor dari Rumah dinas petugas pintu air, jalan terdekat (pathfinding), ±2 mnt |
| 23.00-06.00 | Rumah dinas petugas pintu air (-62, 42~) | Tidur | `tidur` | `rumah` | Motor dari Bendungan & pintu air Sirnagalih, jalan terdekat (pathfinding), ±2 mnt |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Wak Kodir

Rumah: **Kampung nelayan muara** (304, 256~). Moda utama: perahu.

| Outfit | Isi |
|---|---|
| `melaut` | Kaus partai lama, celana pendek, caping, sepatu bot |
| `rumah` | Sarung, kaus singlet |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 03.00-08.00 | Laut lepas (melaut) (330, 292~) | Melaut (pemain bisa ikut, berangkat 03.00 dari TPI) | `jala` | `melaut` | Perahu dari Kampung nelayan muara, jalan terdekat (pathfinding), ±9 mnt |
| 08.00-10.00 | TPI & dermaga nelayan (314, 264) | Lelang ikan di TPI | `jualan` | `melaut` | Perahu dari Laut lepas, jalan terdekat (pathfinding), ±6 mnt |
| 10.00-15.00 | Kampung nelayan muara (304, 256~) | Tidur siang | `tidur` | `rumah` | Perahu dari TPI & dermaga nelayan, jalan terdekat (pathfinding), ±3 mnt |
| 15.00-18.00 | TPI & dermaga nelayan (314, 264) | Memperbaiki jaring di dermaga | `jongkok` | `rumah` | Perahu dari Kampung nelayan muara, jalan terdekat (pathfinding), ±3 mnt |
| 18.00-21.00 | Kampung nelayan muara (304, 256~) | Main kartu dengan nelayan lain | `duduk` | `rumah` | Perahu dari TPI & dermaga nelayan, jalan terdekat (pathfinding), ±3 mnt |
| 21.00-03.00 | Kampung nelayan muara (304, 256~) | Tidur | `tidur` | `rumah` |  |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-12.00 | TPI & dermaga nelayan (314, 264) | Tidak melaut (Jumat & badai juga); memperbaiki perahu | `jongkok` | `rumah` | Perahu dari Kampung nelayan muara, jalan terdekat (pathfinding), ±3 mnt |
| 12.00-21.00 | Kampung nelayan muara (304, 256~) | Di rumah | `duduk` | `rumah` | Perahu dari TPI & dermaga nelayan, jalan terdekat (pathfinding), ±3 mnt |
| 21.00-06.00 | Kampung nelayan muara (304, 256~) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Bu Romlah

Rumah: **Warung seafood Bu Romlah** (130, 258~). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `kerja` | Celemek bunga-bunga, rambut dicepol diikat kain, gelang emas banyak |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-07.00 | TPI & dermaga nelayan (314, 264) | Belanja ikan di TPI | `jalan` | `kerja` | Motor dari Warung seafood Bu Romlah, Jl. Pesisir Selatan, ±12 mnt |
| 07.00-10.00 | Warung seafood Bu Romlah (130, 258~) | Menyiapkan warung | `masak` | `kerja` | Jalan kaki dari TPI & dermaga nelayan, jalan terdekat (pathfinding), ±61 mnt |
| 10.00-21.00 | Warung seafood Bu Romlah (130, 258~) | Buka warung seafood (ramai 12.00-14.00 & 17.00-20.00) | `masak` | `kerja` |  |
| 21.00-05.00 | Warung seafood Bu Romlah (130, 258~) | Tidur di rumah belakang warung | `tidur` | `kerja` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Kang Ujo

Rumah: **Basecamp pendakian Sangkala** (119, -56). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Jaket gunung oranye pudar, kargo, sandal gunung |
| `naik` | Carrier besar, jaket, headlamp |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-15.00 | Basecamp pendakian Sangkala (119, -56) | Pendaftaran pendakian (tutup naik 15.00) | `duduk_tulis` | `kerja` |  |
| 15.00-18.00 | Basecamp pendakian Sangkala (119, -56) | Menyapu sampah, menghitung pendaki turun | `sapu` | `kerja` |  |
| 18.00-22.00 | Basecamp pendakian Sangkala (119, -56) | Api unggun dengan porter | `duduk` | `kerja` |  |
| 22.00-05.00 | Basecamp pendakian Sangkala (119, -56) | Tidur di basecamp | `tidur` | `kerja` |  |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-12.00 | Kawah & danau kawah (110, -94) | Memandu rombongan ke puncak (Sabtu) | `jalan` | `naik` | Jalan kaki dari Basecamp pendakian Sangkala, setapak pendakian, ±13 mnt |
| 12.00-22.00 | Basecamp pendakian Sangkala (119, -56) | Basecamp ramai | `duduk_tulis` | `kerja` | Motor dari Kawah & danau kawah, jalan terdekat (pathfinding), ±3 mnt |
| 22.00-05.00 | Basecamp pendakian Sangkala (119, -56) | Tidur | `tidur` | `kerja` |  |

### Mandor Sabar

Rumah: **Pabrik teh tua** (276, -30). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Topi koboi anyaman, kemeja lengan panjang lusuh, sepatu bot, peluit di leher |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.30-11.00 | Kebun teh Sukamekar (blok petik) (300, -30~) | Mengawasi pemetik teh, menimbang pucuk | `berdiri` | `kerja` | Motor dari Pabrik teh tua, jalan terdekat (pathfinding), ±2 mnt |
| 11.00-16.00 | Pabrik teh tua (276, -30) | Pabrik teh: pelayuan, menggiling | `kerja_mesin` | `kerja` | Motor dari Kebun teh Sukamekar, jalan terdekat (pathfinding), ±2 mnt |
| 16.00-21.00 | Halte bus Sukamekar (Jl. Raya Puncak) (250, -28~) | Warung kopi dekat halte | `duduk` | `kerja` | Motor dari Pabrik teh tua, jalan terdekat (pathfinding), ±2 mnt |
| 21.00-05.30 | Pabrik teh tua (276, -30) | Tidur di rumah mandor | `tidur` | `kerja` | Motor dari Halte bus Sukamekar, jalan terdekat (pathfinding), ±2 mnt |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Pak Yusuf Tanjung

Rumah: **Mes sirkuit** (342, 204~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Kemeja race control oranye, radio di dada |
| `rumah` | Kaus polo pudar |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 07.00-12.00 | Sirkuit: menara race control (360, 206~) | Jadwal, perawatan trek | `duduk_tulis` | `kerja` | Motor dari Mes sirkuit, jalan terdekat (pathfinding), ±2 mnt |
| 12.00-17.00 | Sirkuit: pit & paddock (368, 226) | Mengecek pit & paddock | `berdiri` | `kerja` | Motor dari Sirkuit: menara race control, jalan terdekat (pathfinding), ±2 mnt |
| 17.00-21.00 | Mes sirkuit (342, 204~) | Menonton balap di TV | `duduk` | `rumah` | Motor dari Sirkuit: pit & paddock, jalan terdekat (pathfinding), ±2 mnt |
| 21.00-07.00 | Mes sirkuit (342, 204~) | Tidur | `tidur` | `rumah` |  |

**Sabtu**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.30-11.30 | Sirkuit: menara race control (360, 206~) | Track day 07.00-11.00 | `berdiri` | `kerja` | Motor dari Mes sirkuit, jalan terdekat (pathfinding), ±2 mnt |
| 11.30-21.00 | Mes sirkuit (342, 204~) | Istirahat | `duduk` | `rumah` | Motor dari Sirkuit: menara race control, jalan terdekat (pathfinding), ±2 mnt |
| 21.00-06.30 | Mes sirkuit (342, 204~) | Tidur | `tidur` | `rumah` |  |

**Minggu & tanggal merah**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-14.00 | Sirkuit: menara race control (360, 206~) | Seri liga (Bab 9+, tiap 2 minggu) | `berdiri` | `kerja` | Motor dari Mes sirkuit, jalan terdekat (pathfinding), ±2 mnt |
| 14.00-06.00 | Mes sirkuit (342, 204~) | Istirahat, tidur | `duduk` | `rumah` | Motor dari Sirkuit: menara race control, jalan terdekat (pathfinding), ±2 mnt |

### Mbak Sri Wahyuni

Rumah: **Kos buruh Jl. Industri** (304, 122~). Moda utama: motor.

| Outfit | Isi |
|---|---|
| `kerja` | Seragam pabrik biru, kerudung abu, masker kain, kartu ID |
| `rumah` | Kaus panjang, rok batik |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.00-06.45 | Kos buruh Jl. Industri (304, 122~) | Bersiap | `berdiri` | `kerja` |  |
| 06.45-07.00 | Gerbang Kawasan Industri Pradana (300, 96~) | Absen di gerbang | `jalan` | `kerja` | Motor dari Kos buruh Jl. Industri, jalan terdekat (pathfinding), ±2 mnt |
| 07.00-15.00 | Pabrik garmen (shift buruh) (336, 108~) | Shift pagi (minggu ganjil); minggu genap shift 15.00-23.00 | `kerja_mesin` | `kerja` | Motor dari Gerbang Kawasan Industri Pradana, jalan terdekat (pathfinding), ±3 mnt |
| 15.00-16.00 | Warung nasi kucing pabrik (320, 118~) | Ngopi dengan buruh, rapat kecil | `ngobrol` | `kerja` | Motor dari Pabrik garmen, jalan terdekat (pathfinding), ±2 mnt |
| 16.00-22.00 | Kos buruh Jl. Industri (304, 122~) | Di kos, menelepon anak di kampung | `hp` | `rumah` | Motor dari Warung nasi kucing pabrik, jalan terdekat (pathfinding), ±2 mnt |
| 22.00-06.00 | Kos buruh Jl. Industri (304, 122~) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Mbah Darmo

Rumah: **Mercusuar Tanjung Karang** (236, 280). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `rumah` | Sarung, jaket tentara usang, kacamata tebal, lampu minyak |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 05.00-08.00 | Mercusuar Tanjung Karang (236, 280) | Menyapu tangga mercusuar | `sapu` | `rumah` |  |
| 08.00-16.00 | Mercusuar Tanjung Karang (236, 280) | Duduk di bangku menghadap laut, bercerita ke siapa pun | `duduk` | `rumah` |  |
| 16.00-18.00 | Pantai Lintang & voli pantai (140, 262) | Jalan sore pelan di pantai | `jalan` | `rumah` | Jalan kaki dari Mercusuar Tanjung Karang, jalan terdekat (pathfinding), ±33 mnt |
| 18.00-21.00 | Mercusuar Tanjung Karang (236, 280) | Menyalakan lampu minyak (lampu besar mati sampai misi selesai) | `berdiri` | `rumah` | Jalan kaki dari Pantai Lintang & voli pantai, jalan terdekat (pathfinding), ±33 mnt |
| 21.00-05.00 | Mercusuar Tanjung Karang (236, 280) | Tidur | `tidur` | `rumah` |  |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Nek Sumi

Rumah: **Rumah nenek Andra (Nek Sumi), tepi sawah** (196, 212~). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `rumah` | Kebaya lurik, kain jarik, selendang gendong botol jamu, sanggul |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 04.00-06.00 | Rumah nenek Andra (Nek Sumi), tepi sawah (196, 212~) | Meracik jamu | `masak` | `rumah` |  |
| 06.00-11.00 | Sawah & pematang Pandansari (190, 232~) | Keliling jamu gendong: Pandansari lalu Jl. Lingkar | `jalan` | `rumah` | Jalan kaki dari Rumah nenek Andra, Jl. Lingkar Selatan, ±7 mnt |
| 11.00-15.00 | Rumah nenek Andra (Nek Sumi), tepi sawah (196, 212~) | Istirahat, menumbuk kunyit | `duduk` | `rumah` | Jalan kaki dari Sawah & pematang Pandansari, jalan terdekat (pathfinding), ±7 mnt |
| 15.00-17.00 | Sawah & pematang Pandansari (190, 232~) | Duduk di pematang | `duduk` | `rumah` | Jalan kaki dari Rumah nenek Andra, jalan terdekat (pathfinding), ±7 mnt |
| 17.00-04.00 | Rumah nenek Andra (Nek Sumi), tepi sawah (196, 212~) | Di rumah, tidur | `tidur` | `rumah` | Jalan kaki dari Sawah & pematang Pandansari, jalan terdekat (pathfinding), ±7 mnt |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Tito

Rumah: **Rumah dinas keluarga Aditya** (354, 64~). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `rumah` | Kaus bola kebesaran, celana pendek, lutut luka |
| `sekolah` | Seragam SD |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.30-12.00 | Gerbang jaga Asrama Batalyon 3 (336, 72) | SD asrama | `duduk_tulis` | `sekolah` | Jalan kaki dari Rumah dinas keluarga Aditya, jalan terdekat (pathfinding), ±7 mnt |
| 12.00-17.30 | Lapangan apel asrama (346, 44) | Main bola, menunggu Dimas pulang | `futsal` | `rumah` | Jalan kaki dari Gerbang jaga Asrama Batalyon 3, jalan terdekat (pathfinding), ±10 mnt |
| 17.30-06.30 | Rumah dinas keluarga Aditya (354, 64~) | Pulang (rumah tetangga Dimas) | `tidur` | `rumah` | Jalan kaki dari Lapangan apel asrama, jalan terdekat (pathfinding), ±7 mnt |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.

### Neng Ayu

Rumah: **Rumah panggung Wulan & Abah Karta, tepi kebun teh** (266, -27~). Moda utama: jalan kaki.

| Outfit | Isi |
|---|---|
| `sekolah` | Seragam SMP |
| `rumah` | Jaket balap kebesaran, rambut pendek |

**Senin-Jumat**

| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |
|---|---|---|---|---|---|
| 06.30-13.00 | SMK Pariwisata (252, -46) | SMP desa (sebelah SMK) | `duduk_tulis` | `sekolah` | Jalan kaki dari Rumah panggung Wulan & Abah Karta, jalan terdekat (pathfinding), ±8 mnt |
| 13.00-17.00 | Halte bus Sukamekar (Jl. Raya Puncak) (250, -28~) | Menonton motor lewat di Jl. Raya Puncak | `duduk` | `rumah` | Jalan kaki dari SMK Pariwisata, jalan terdekat (pathfinding), ±6 mnt |
| 17.00-06.30 | Rumah panggung Wulan & Abah Karta, tepi kebun teh (266, -27~) | Di rumah | `tidur` | `rumah` | Jalan kaki dari Halte bus Sukamekar, jalan terdekat (pathfinding), ±5 mnt |

Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas.
