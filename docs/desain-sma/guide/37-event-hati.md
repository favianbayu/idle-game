# 37. Event Hati: Pemicu

Daftar pemicu semua event hati dalam satu tabel. Adegan, pilihan, dan hasil tetap di segmen tokohnya (kolom *Segmen*).
Game mengecek event saat pemain ngobrol dengan NPC: hati sudah cukup, event sebelumnya selesai, NPC & pemain di **tempat**
pemicu, jam di dalam rentang **jam**, hari cocok, dan bab sudah sampai. Data mesin: `guide/data/npc.json` (`event`).

## Aturan

| Aturan | Isi |
|---|---|
| Urutan | Event 2 → 4 → 6 → 8. Hati tidak bisa naik melewati event yang belum selesai (poin ditahan di 99 dari hati berikutnya) |
| Ikon | Ikon hati merah muda muncul di peta HP di tempat pemicu saat syarat terpenuhi |
| Kelewatan | Kalau pemain tidak datang, event menunggu kesempatan berikutnya (tidak hilang), kecuali event bertanggal (pensi, final, banjir): yang bertanggal jadi versi 'telat' di kesempatan berikutnya dengan poin setengah |
| Event 8 | Tokoh utama: Gelang Benang di inventori + pilih jalur romance → pacaran. Tanpa gelang / pilih sahabat → sahabat sejati. Tokoh pendukung & wilayah selalu jalur sahabat |
| Jadwal | Tempat & jam pemicu dipilih dari rutinitas segmen 35, jadi NPC memang ada di sana pada jam itu |

## Daftar pemicu

| NPC | Hati | Judul | Tempat (x, y) | Hari | Jam | Bab min | Syarat lain | Segmen |
|---|---|---|---|---|---|---|---|---|
| Nadia Kusuma | 2 | Rapat yang Kacau | Ruang OSIS (110, 62) | Sen, Rab, Kam | 14.30-16.00 | - |  | 10 |
| Nadia Kusuma | 4 | Buku Catatan Fisika | Perpustakaan (pojok jendela) (110, 62) | Sen, Sel, Rab, Kam, Jum | 09.30-10.00 | - |  | 10 |
| Nadia Kusuma | 6 | Pemilihan Ketua OSIS | Aula (110, 62) | semua | 13.00-15.00 | 6 | Hari debat calon (Bab 6, kelas XI 5 Kemarau) | 10 |
| Nadia Kusuma | 8 | Langit di Atap Masjid / Dua Kursi di Ruang OSIS | Masjid Agung (146, 60) | Kam | 20.00-21.00 | - | Malam Jumat setelah ngaji | 10 |
| Sekar Ayuningtyas | 2 | Lagu di Tangga Belakang | Tangga belakang Gedung B (110, 62) | Sen, Sel, Rab, Kam, Jum | 09.30-10.00 | - |  | 11 |
| Sekar Ayuningtyas | 4 | Atap Gedung B | Atap Gedung B (110, 62) | Sen, Rab, Jum | 15.00-17.00 | - | Kunci dari Pak Ujang atau lewat jendela gudang | 11 |
| Sekar Ayuningtyas | 6 | Lagu Ke-48 | Studio musik (110, 62) | semua | 19.00-21.00 | 8 | Menjelang pensi kelas XI | 11 |
| Sekar Ayuningtyas | 8 | Panggung Pensi / Duet | Atap Gedung B (110, 62) | semua | 20.00-22.00 | 10 | Malam pensi akhir tahun kelas XI (10 Kemarau Muda) | 11 |
| Laras Wibisana | 2 | Termos Tumpah | Pasar Wirabumi & terminal angkot (114, 98) | semua | 05.00-06.20 | - | Pemain bangun sebelum 05.00 (alarm HP) | 12 |
| Laras Wibisana | 4 | Buku Kas | Kelas X-2 (110, 62) | Sen, Sel, Rab, Kam, Jum | 09.30-10.00 | - |  | 12 |
| Laras Wibisana | 6 | Penggusuran Lapak | Pasar Wirabumi & terminal angkot (114, 98) | semua | 04.00-06.00 | 10 |  | 12 |
| Laras Wibisana | 8 | Jembatan Kali Cendana / Rumah Makan Bareng | Jembatan Kali Cendana (Bantaran) (72, 125~) | Sab | 18.00-19.00 | - |  | 12 |
| Uti (Putri Maharani) | 2 | Motor Mas Danu | Rumah & garasi seng Uti (3 rumah dari warkop) (52, 88~) | semua | 19.00-22.00 | - |  | 13 |
| Uti (Putri Maharani) | 4 | Hujan di Garasi | Rumah & garasi seng Uti (3 rumah dari warkop) (52, 88~) | semua | 19.00-22.00 | - | Hujan, sudah 3 komponen | 13 |
| Uti (Putri Maharani) | 6 | Surat yang Belum Dibuka | TPU Bhakti (makam) (193, 113) | semua | 18.00-23.00 | - | Motor selesai dirakit (perjalanan motor ke makam) | 13 |
| Uti (Putri Maharani) | 8 | Garis Finis / Partner Pit | Jl. Lingkar Selatan, garis start drag (214, 166) | semua | 23.00-00.30 | 9 | Setelah seri liga pertama | 13 |
| Sasha Aurelia | 2 | Kucing di Alun-alun | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | semua | 20.00-21.30 | - |  | 14 |
| Sasha Aurelia | 4 | Buku Sketsa | Ruang jahit Teh Lilis di pasar (116, 100~) | Min | 07.00-10.00 | - |  | 14 |
| Sasha Aurelia | 6 | Keluar dari Meja Pojok | Kantin (110, 62) | Sen, Sel, Rab, Kam, Jum | 12.00-12.30 | 6 | Bab 6-7 | 14 |
| Sasha Aurelia | 8 | Peragaan di Pasar Malam / Desainer & Model | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Sab | 19.00-21.00 | - |  | 14 |
| Kirana Wijaya | 2 | Rantai Putus | Jl. Lingkar Selatan, garis start drag (214, 166) | Sel, Jum | 23.00-00.30 | 3 | Setelah balap liar | 15 |
| Kirana Wijaya | 4 | Dinding Kamar | Bengkel Wijaya Motor (rumah Kirana & Kobar) (190, 165~) | semua | 15.00-18.00 | - | Ayahnya keluar kota (acak, 1x per 2 minggu) | 15 |
| Kirana Wijaya | 6 | Ayah dan Garis Start | Sirkuit: pit & paddock (368, 226) | Min | 06.00-08.00 | 9 | Sebelum seri liga pertama | 15 |
| Kirana Wijaya | 8 | Jembatan Layang Selatan / Tim Balap | Bawah jembatan layang selatan (tembok mural) (160, 166~) | semua | 23.30-00.30 | 11 | Malam setelah final liga | 15 |
| Mei Lestari | 2 | Rak Tujuh | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | semua | 14.00-18.00 | - |  | 16 |
| Mei Lestari | 4 | Komik Kota Wirabumi | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | semua | 20.00-22.00 | - | Izin Ama (kado bakpao atau Pesona 4) | 16 |
| Mei Lestari | 6 | Lomba Ilustrasi Kota | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Sab | 13.00-17.00 | 8 |  | 16 |
| Mei Lestari | 8 | Halaman Terakhir / Dua Nama di Sampul | Toko Buku Pena & studio lantai 2 (rumah Mei) (124, 74~) | Sab | 20.00-22.00 | - |  | 16 |
| Wulan Sari | 2 | Bus Terakhir | Terminal bus antarkota (246, 104) | Sen, Rab, Jum | 16.30-17.00 | - |  | 17 |
| Wulan Sari | 4 | Kabut Kebun Teh | Kebun teh Sukamekar (blok petik) (300, -30~) | Min | 06.00-09.00 | 2 | Naik bus pertama ke Sukamekar | 17 |
| Wulan Sari | 6 | Turnamen Provinsi | GOR Kota & kolam renang (168, 40) | Min | 11.00-16.00 | 9 |  | 17 |
| Wulan Sari | 8 | Pendopo di Bawah Bulan / Saudara Seperguruan | Pendopo perguruan Kembang Teh (258, -34~) | semua | 19.00-22.00 | - | Malam purnama (tanggal 14 tiap bulan game) | 17 |
| Dimas Aditya | 2 | Bola Nyasar | Lapangan basket sekolah (110, 62) | Sen, Sel, Rab, Kam, Jum | 09.30-10.00 | - |  | 20 |
| Dimas Aditya | 4 | Lutut Kiri | UKS (110, 62) | Sen, Sel, Kam | 17.00-17.30 | - | Setelah latihan basket | 20 |
| Dimas Aditya | 6 | Final yang Hilang | GOR Kota & kolam renang (168, 40) | semua | 15.00-18.00 | 9 | Final basket kelas XI | 20 |
| Dimas Aditya | 8 | Lapangan Asrama Subuh / Pelatih & Asisten | Lapangan apel asrama (346, 44) | Min | 05.00-06.00 | 5 | Pemain menginap atau datang subuh (gerbang terbuka dengan Dimas 4+) | 20 |
| Arga | 2 | Helm Cadangan | Pos satpam & gerbang (110, 62) | semua | 14.00-15.00 | - | Hujan sore | 21 |
| Arga | 4 | Taman di Belakang Gedung Lama | Belakang Gedung Lama (taman rahasia Arga) (110, 62) | Sen, Sel, Rab, Kam, Jum | 09.30-10.00 | - |  | 21 |
| Arga | 6 | Dijebak | Gudang markas Lampu Kota (50, 131) | semua | 20.00-23.00 | 7 |  | 21 |
| Arga | 8 | Puncak Menara / Saudara Jalanan | Menara pemancar (84, 22) | semua | 22.00-00.30 | - | Malam 17 Agustus (17 Kemarau) atau malam tahun baru | 21 |
| Rizal Pratama | 2 | Halaman yang Basah | Taman kota: lapangan basket umum, skatepark, air mancur (126, 46) | semua | 11.00-17.00 | - | Hujan | 22 |
| Rizal Pratama | 4 | Diplagiat | Ruang mading (110, 62) | Sel, Jum | 14.00-16.30 | 5 |  | 22 |
| Rizal Pratama | 6 | Surat untuk Ayah | Kontrakan Rizal, gang belakang Ruko Pelita (168, 89~) | semua | 19.00-22.00 | - | Ibunya kerja malam | 22 |
| Rizal Pratama | 8 | Cerpen Terakhir / Dua Penulis | Taman kota: lapangan basket umum, skatepark, air mancur (126, 46) | Min | 15.00-17.00 | - |  | 22 |
| Tegar Hutomo | 2 | Warnet Rahasia | Warnet Pusat Kota (138, 96~) | Sel, Jum | 17.00-18.00 | - |  | 23 |
| Tegar Hutomo | 4 | Denah Rumah | Perpustakaan (pojok jendela) (110, 62) | Sen, Sel, Rab, Kam, Jum | 09.30-10.00 | - |  | 23 |
| Tegar Hutomo | 6 | Rumah Sakit | RSUD Wirabumi (186, 90~) | semua | 19.00-23.00 | 12 |  | 23 |
| Tegar Hutomo | 8 | Maket Kecil / Arsitek & Klien Pertama | Rumah Tegar, Blok B-3 (232, 52~) | semua | 19.00-22.00 | - |  | 23 |
| Jojo (Yohanes) | 2 | Foto yang Salah | Kantin (110, 62) | Sen, Sel, Rab, Kam, Jum | 09.30-10.00 | - |  | 24 |
| Jojo (Yohanes) | 4 | Jam Sembilan Malam | Studio Foto Kilat (rumah Jojo di lantai 2) (132, 82~) | semua | 20.50-21.20 | - | Atap studio | 24 |
| Jojo (Yohanes) | 6 | Klise Terbakar | Studio Foto Kilat (rumah Jojo di lantai 2) (132, 82~) | semua | 17.00-21.00 | 11 |  | 24 |
| Jojo (Yohanes) | 8 | Album Tiga Tahun / Liputan Bareng | Ruang mading (110, 62) | Sen, Sel, Rab, Kam, Jum | 14.00-17.00 | - |  | 24 |
| Bram Megantara | 2 | Lapangan Basket Jam 10 Malam | Lapangan basket sekolah (110, 62) | Rab, Jum | 22.00-23.00 | 4 |  | 25 |
| Bram Megantara | 4 | Tinggal Kelas | Rooftop parkiran mal (180, 100~) | Sab | 18.00-20.00 | 5 | Akhir Bab 5 | 25 |
| Bram Megantara | 6 | Dokumen di Laci Papa | Rumah kaca Bram, puncak bukit (224, 56) | semua | 20.00-22.00 | 12 |  | 25 |
| Bram Megantara | 8 | Piano di Rumah Kaca / Kakak Kelas yang Pulang | Rumah kaca Bram, puncak bukit (224, 56) | semua | 19.00-22.00 | 13 | Setelah Bram bersaksi (pindah ke kontrakan kecil) | 25 |
| Andra Pamungkas | 2 | Tembok Kosong | Bawah jembatan layang selatan (tembok mural) (160, 166~) | Sen, Sel, Rab, Kam, Jum | 14.00-18.00 | - |  | 26 |
| Andra Pamungkas | 4 | Wajah Kecil di Sudut | Bawah jembatan layang selatan (tembok mural) (160, 166~) | semua | 19.00-22.00 | - | Mural selesai | 26 |
| Andra Pamungkas | 6 | Dua Geng, Satu Tembok | Pabrik es tua (162, 129) | semua | 17.00-21.00 | 7 |  | 26 |
| Andra Pamungkas | 8 | Mural Kita / Studio Berdua | Bawah jembatan layang selatan (tembok mural) (160, 166~) | semua | 05.00-06.30 | - | Subuh | 26 |
| Gilang Ramadhan | 2 | Galon Menggelinding | Gapura Gang Kenanga (35, 74) | Sen, Sel, Rab, Kam, Jum | 06.00-09.00 | - |  | 27 |
| Gilang Ramadhan | 4 | Kelas Malam | PKBM (kelas paket C) (100, 114~) | Sen, Rab, Jum | 20.30-21.00 | - |  | 27 |
| Gilang Ramadhan | 6 | Buku Tabungan dalam Galon | Rumah panggung hijau Gilang (86, 127~) | semua | kapan saja | 10 | Saat banjir Kali Cendana (kelas XI 20 Hujan Akhir) | 27 |
| Gilang Ramadhan | 8 | Ijazah / Pantun Persahabatan | Tepi Kali Cendana, tempat mancing (92, 130~) | semua | 16.00-18.00 | 11 | Hari pengumuman paket C | 27 |
| Om Darto | 2 | Utang Pertama | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | semua | 22.00-23.00 | 2 |  | 30 |
| Om Darto | 4 | Foto di Laci | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | semua | 13.00-17.00 | - |  | 30 |
| Om Darto | 6 | Kopi Racikan Rahasia | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | Min | 05.30-07.00 | 7 | Setelah rahasia Lampu Kota terbuka | 30 |
| Om Darto | 8 | Anak Sendiri | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | semua | 21.00-23.00 | - |  | 30 |
| Cici | 2 | PR Gambar Keluarga | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | semua | 19.00-20.30 | - |  | 30 |
| Cici | 4 | Hilang di Pasar Malam | Alun-alun (pasar malam Sabtu, bangku beringin) (146, 76) | Sab | 19.00-21.00 | - | Mengajak Cici ke pasar malam | 30 |
| Cici | 6 | Sakit Demam | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | semua | 20.00-23.00 | - | Musim hujan | 30 |
| Cici | 8 | Pentas SD | SD Kenanga (sekolah Cici) (58, 96~) | Sab | 08.00-10.00 | - |  | 30 |
| Bimo Prasetyo | 2 | Bakso Gratis | SMA Negeri 3 Wirabumi, gerbang (110, 62) | Sen, Sel, Rab, Kam, Jum | 14.00-17.00 | - |  | 30 |
| Bimo Prasetyo | 4 | Takut Gelap | Halaman depan & plaza (110, 62) | semua | 20.00-22.00 | - | Piket malam / jurit malam | 30 |
| Bimo Prasetyo | 6 | Balap Liar | Jl. Lingkar Selatan, garis start drag (214, 166) | semua | 22.00-00.00 | 9 | Menentukan kecelakaan Bab 9 | 30 |
| Bimo Prasetyo | 8 | Koki Warkop | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | semua | 17.00-21.00 | 9 |  | 30 |
| Mas Fajar | 2 | Servis Gratis | Ruko Pelita & bengkel Mas Fajar (170, 84) | semua | 13.00-18.00 | - |  | 30 |
| Mas Fajar | 4 | Buku Paket C | Ruko Pelita & bengkel Mas Fajar (170, 84) | semua | 18.00-19.00 | - |  | 30 |
| Mas Fajar | 6 | Ujian | PKBM (kelas paket C) (100, 114~) | semua | 07.00-12.00 | 11 | Hari ujian paket C | 30 |
| Mas Fajar | 8 | Partner Bengkel | Ruko Pelita & bengkel Mas Fajar (170, 84) | semua | kapan saja | 11 |  | 30 |
| Bang Jaka | 2 | Ujian Masuk | Gudang markas Lampu Kota (50, 131) | semua | 20.00-23.00 | 3 |  | 30 |
| Bang Jaka | 4 | Empat Aturan | Gudang markas Lampu Kota (50, 131) | semua | 20.00-23.00 | - |  | 30 |
| Bang Jaka | 6 | Ditangkap | Gudang markas Lampu Kota (50, 131) | semua | 20.00-02.00 | 9 |  | 30 |
| Bang Jaka | 8 | Klub Resmi | Gudang markas Lampu Kota (50, 131) | semua | 20.00-23.00 | 10 |  | 30 |
| Kobar | 2 | Tantangan Jembatan | Jembatan Timur (182, 136) | semua | 22.00-00.00 | 7 |  | 30 |
| Kobar | 4 | Adu Domba | Warung nasi goreng Jl. Lingkar (200, 167~) | semua | 19.00-22.00 | 7 | Bukti dari Andra | 30 |
| Kobar | 6 | Kirana Hilang | Jl. Lingkar Selatan, garis start drag (214, 166) | semua | 22.00-01.00 | 9 |  | 30 |
| Kobar | 8 | Sumpah Dua Geng | Pabrik es tua (162, 129) | semua | 19.00-22.00 | 10 |  | 30 |
| Bu Narti | 2 | Kos yang Bocor | Kos Bu Narti (44, 80~) | semua | 09.00-15.00 | - | Hujan | 30 |
| Bu Narti | 4 | Gosip Salah | Warkop Simpang & rumah Om Darto (kamar pemain) (46, 86) | semua | 15.00-18.00 | - |  | 30 |
| Bu Narti | 6 | Arisan | Kos Bu Narti (44, 80~) | Kam | 18.00-21.00 | - |  | 30 |
| Bu Narti | 8 | Telinga Kampung | Kos Bu Narti (44, 80~) | semua | kapan saja | - |  | 30 |
| Pak RT Slamet | 2 | Kerja Bakti | Gapura Gang Kenanga (35, 74) | Sab | 07.00-10.00 | - |  | 30 |
| Pak RT Slamet | 4 | Ronda Pertama | Pos ronda Gang Kenanga (36, 88~) | semua | 21.00-23.00 | - |  | 30 |
| Pak RT Slamet | 6 | Lomba 17 Agustus | Gapura Gang Kenanga (35, 74) | semua | 07.00-17.00 | 4 | 17 Kemarau | 30 |
| Pak RT Slamet | 8 | Suara Warga | Rumah Pak RT Slamet (38, 90~) | semua | 18.00-21.00 | 13 |  | 30 |
| Kyai Mahfud Sastrowiryo | 2 | Gula Aren | Pasar hewan Tegalsari (-92, 108) | semua | 15.00-17.00 | 2 |  | 33 |
| Kyai Mahfud Sastrowiryo | 4 | Rak Paling Atas | Pesantren Darul Falah (-116, 94) | semua | 06.30-11.30 | - |  | 33 |
| Kyai Mahfud Sastrowiryo | 6 | Cerita Kakek | Pesantren Darul Falah (-116, 94) | semua | 17.00-21.00 | - |  | 33 |
| Kyai Mahfud Sastrowiryo | 8 | Amanah | Pesantren Darul Falah (-116, 94) | semua | 06.30-11.30 | 11 |  | 33 |
| Abah Karta | 2 | Murid Kota | Pendopo perguruan Kembang Teh (258, -34~) | semua | 14.00-17.00 | 3 |  | 33 |
| Abah Karta | 4 | Kecapi | Rumah panggung Wulan & Abah Karta, tepi kebun teh (266, -27~) | semua | 19.00-21.00 | - |  | 33 |
| Abah Karta | 6 | Batu Tulis | Batu Tulis (-92, -72) | Min | 07.00-12.00 | 4 |  | 33 |
| Abah Karta | 8 | Pewaris | Pendopo perguruan Kembang Teh (258, -34~) | semua | 04.30-06.00 | - |  | 33 |
| Serma Hadi Aditya | 2 | Lari Subuh | Lapangan apel asrama (346, 44) | semua | 05.00-06.00 | 5 |  | 33 |
| Serma Hadi Aditya | 4 | Mi Instan | Rumah dinas keluarga Aditya (354, 64~) | semua | 18.00-21.00 | - |  | 33 |
| Serma Hadi Aditya | 6 | Tribun | GOR Kota & kolam renang (168, 40) | semua | 15.00-18.00 | 9 | Sesudah final basket | 33 |
| Serma Hadi Aditya | 8 | Hormat | Gerbang jaga Asrama Batalyon 3 (336, 72) | semua | 16.00-18.00 | - |  | 33 |
| Pak Sudarmaji | 2 | Kopi Malam | Bendungan & pintu air Sirnagalih (-74, 34) | semua | 22.00-23.00 | 4 | Hujan | 33 |
| Pak Sudarmaji | 4 | Catatan Debit | Bendungan & pintu air Sirnagalih (-74, 34) | semua | 07.00-12.00 | - |  | 33 |
| Pak Sudarmaji | 6 | Telepon Itu | Rumah dinas petugas pintu air (-62, 42~) | semua | 16.00-22.00 | 10 | Sesudah banjir | 33 |
| Pak Sudarmaji | 8 | Sirene | Bendungan & pintu air Sirnagalih (-74, 34) | semua | 13.00-16.00 | 10 |  | 33 |
| Wak Kodir | 2 | Jaring Kusut | TPI & dermaga nelayan (314, 264) | semua | 15.00-18.00 | 2 |  | 33 |
| Wak Kodir | 4 | Badai Kecil | Laut lepas (melaut) (330, 292~) | semua | 03.00-08.00 | - | Ikut melaut saat angin kencang | 33 |
| Wak Kodir | 6 | Anak Saya di Kota | Kampung nelayan muara (304, 256~) | semua | 18.00-21.00 | - |  | 33 |
| Wak Kodir | 8 | Perahu Sendiri | TPI & dermaga nelayan (314, 264) | semua | 08.00-10.00 | - |  | 33 |
| Bu Romlah | 2 | Pesanan Telat | Warung seafood Bu Romlah (130, 258~) | semua | 10.00-14.00 | 2 |  | 33 |
| Bu Romlah | 4 | Hari Libur Panjang | Warung seafood Bu Romlah (130, 258~) | semua | 10.00-21.00 | - | Libur Panjang | 33 |
| Bu Romlah | 6 | Lahan Belakang | Warung seafood Bu Romlah (130, 258~) | semua | 17.00-21.00 | - |  | 33 |
| Bu Romlah | 8 | Kongsi | Warung seafood Bu Romlah (130, 258~) | semua | kapan saja | 11 | Jalur usaha | 33 |
| Kang Ujo | 2 | Porter Baru | Basecamp pendakian Sangkala (119, -56) | semua | 05.00-15.00 | 8 |  | 33 |
| Kang Ujo | 4 | Kabut | Kawah & danau kawah (110, -94) | Sab | 05.00-12.00 | - |  | 33 |
| Kang Ujo | 6 | Jalur Lama | Basecamp pendakian Sangkala (119, -56) | semua | 18.00-22.00 | - |  | 33 |
| Kang Ujo | 8 | Pemandu Kehormatan | Basecamp pendakian Sangkala (119, -56) | semua | kapan saja | 12 |  | 33 |

## NPC dengan pola event umum

NPC berikut memakai pola 4 event dari segmen 30. Pemicunya: tempat & jam slot kerja utamanya di segmen 35, hari apa saja.

| Hati | Pola |
|---|---|
| 2 | Kenalan & konflik kecil |
| 4 | Rahasia / urusan pribadi |
| 6 | Membela dari masalah |
| 8 | Ikatan & bonus permanen |

Berlaku untuk: Rio, Kevin, Pak Ujang, Mak Iyah, Ama, Bu Hartini, Bu Ratna, Pak Hendro, Pak Wawan, Bu Sinta, Mr. Anton, Pak Gunadi, Bu Melati, Mandor Sabar, Pak Yusuf Tanjung, Mbak Sri Wahyuni, Mbah Darmo, Nek Sumi, Tito, Neng Ayu. Event 8 memberi bonus permanen di segmen 30 / 33.
