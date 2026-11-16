# 80. Peta & Denah

Semua ukuran dalam **petak**. **1 petak = 32 unit voxel** (kira-kira 1 meter di dunia game; tokoh tingginya ±36 unit).
Gambar dibuat oleh skrip di `peta/`: peta kota & wilayah oleh `peta_organik.py`, peta sekolah oleh `buat_peta.py`,
denah interior oleh `buat_interior.py`. Ubah koordinat di skrip lalu jalankan ulang kalau tata letaknya berubah.

Segmen ini memuat **denah luar** (kota, wilayah, halaman sekolah). Isi bangunan yang bisa dimasuki ada di
[81. Interior sekolah](#81-interior-sekolah) dan [82. Interior bangunan kota](#82-interior-kota).

## Peta kota (260 x 180 petak)

Kota ini bagian tengah dari peta daerah yang lebih besar (gunung, pantai, desa, sirkuit): lihat [86. Peta daerah](#86-peta-dunia).

![Peta kota Wirabumi](../peta/peta_kota.png)

Kota sengaja **tidak berbentuk kotak-kotak**. Jalan mengikuti sungai, bukit, dan rel; tiap wilayah punya pola rumah sendiri,
jadi pemain langsung tahu sedang di mana hanya dari bentuk jalannya. Gambar dibuat oleh `peta/peta_organik.py`
(rumah di sepanjang gang ditempatkan otomatis dengan seed tetap).

### Tujuh wilayah

| Wilayah | Suasana | Pola jalan & bangunan | Denah detail |
|---|---|---|---|
| **Perkampungan Kenanga** | Rumah pemain, warkop, akrab, ramai anak kecil & ibu-ibu | Gang sempit berkelok dan bercabang, rumah rapat dan miring-miring, setapak tembus | lihat gambar di bawah |
| **Perumahan Bukit Asri** | Elite, sepi, dijaga satpam | Jalan lebar melengkung mengikuti lereng, cul-de-sac berbundaran, rumah besar berhalaman | lihat gambar di bawah |
| **Pusat Kota & Jalan Raya** | Paling ramai, macet, lampu toko malam | Jalan raya melengkung, simpang lampu merah, ruko berderet, alun-alun bundar | lihat gambar di bawah |
| **Bantaran Kali** | Padat, sederhana, rawan banjir, wilayah geng | Gang menyusuri kali, rumah panggung, satu jembatan utama + jembatan bambu | lihat gambar di bawah |
| **Selatan** (seberang kali) | Terbuka, keras, wilayah rival | STM, lahan proyek berpagar seng, Jl. Lingkar Selatan (balap liar), sawah | lihat gambar di bawah |
| **Kawasan Sekolah** | Seragam di mana-mana pagi & siang | Satu kompleks besar di Jl. Merdeka, taman kota & lapangan basket di sampingnya | lihat gambar di bawah |
| **Perbukitan Utara** | Sejuk, sepi, romantis | Jalan tanah & setapak di antara hutan, menara pemancar, kebun teh & danau | (cukup dari peta kota) |

### Denah per wilayah

![Perkampungan Kenanga](../peta/wilayah_1_perkampungan.png)

![Perumahan Bukit Asri](../peta/wilayah_2_perumahan.png)

![Pusat kota & jalan raya](../peta/wilayah_3_pusat_kota.png)

![Bantaran kali & selatan](../peta/wilayah_4_bantaran.png)

### Lokasi penting (nomor di peta kota)

| No | Lokasi | Wilayah | Terbuka |
|---|---|---|---|
| 1 | SMA Negeri 3 Wirabumi | Kawasan Sekolah | Bab 1 |
| 2 | Stasiun Wirabumi | Barat, dekat rel | Bab 1 |
| 3 | Warkop Simpang & rumah Om Darto | Perkampungan | Bab 1-2 |
| 4 | Alun-alun (pasar malam Sabtu) | Pusat Kota | Bab 1 |
| 5 | Masjid Agung | Pusat Kota | Bab 1 |
| 6 | Pasar Wirabumi & terminal angkot | Pusat Kota | Bab 1 |
| 7 | Ruko Pelita & bengkel Mas Fajar | Pusat Kota | Bab 3 |
| 8 | Plaza Wirabumi (mal & bioskop) | Pusat Kota | Kelas X sem. 2 |
| 9 | Rumah Bram | Perumahan | Bab 6 |
| 10 | Gudang markas Lampu Kota | Bantaran | Bab 3 |
| 11 | Lapangan bola kampung | Perkampungan/Bantaran | Bab 4 |
| 12 | STM Karya Bangsa | Selatan | Bab 3 |
| 13 | Lahan proyek PT Graha Megantara | Selatan | Bab 10 |
| 14 | Jl. Lingkar Selatan (balap liar); sirkuit resmi pindah ke timur (segmen 87) | Selatan | Liar: Bab 3, resmi: Bab 9 |
| 15 | Menara pemancar | Perbukitan | Bab 3 |
| 16 | Jalur sepeda turunan Bukit Cemara | Perbukitan | Kelas X sem. 2 |
| 17 | Kebun teh & danau | Perbukitan | Kelas X sem. 2 |
| 18 | Taman kota & lapangan basket umum | Kawasan Sekolah | Bab 1 |

**Jarak kira-kira**: rumah ke sekolah ±70 petak (jalan kaki ±60 detik, sepeda ±20 detik, motor ±10 detik). Ujung ke ujung
kota ±260 petak (motor ±45 detik). Angkot dari terminal = pindah cepat antar wilayah.

## Peta sekolah (76 x 52 petak)

> Denah halaman di bawah adalah versi lama (gedung kotak). Versi baru dengan bentuk gedung dan atap ada di
> [83. Sekolah dari luar](#83-sekolah-luar). Fungsi tiap area tetap sama.

![Denah SMA Negeri 3 Wirabumi (versi lama)](../peta/peta_sekolah.png)

| No | Area | Isi & fungsi |
|---|---|---|
| 1 | **Gerbang & pos satpam** | Tutup jam 07.00. Dialog bujuk satpam kalau telat. |
| 2 | **Parkiran motor siswa** | Modif ringan, cuci motor, titik kumpul geng saat pulang. |
| 3 | **Parkiran guru** | Mobil guru, tempat menguping (misi gosip). |
| 4 | **Taman depan & mading** | Papan misi sampingan, pengumuman, hasil OSIS. |
| 5 | **Lapangan upacara** | Upacara Senin, lomba 17-an, class meeting, wisuda/lonceng di Bab 15. |
| 6 | **Gedung A** (2 lt) | Lt1: kepala sekolah, TU, ruang guru, BK, UKS. Lt2: perpustakaan, lab komputer, ruang arsip (terkunci, Bab 12). |
| 7 | **Gedung B** (3 lt) | Ruang kelas: lt1 kelas X, lt2 kelas XI, lt3 kelas XII. Atap = tempat rahasia (bolos, romance Sekar). |
| 8 | **Gedung C** (2 lt) | Lt1: lab fisika, kimia, biologi. Lt2: ruang seni, studio musik, ruang OSIS. |
| 9 | **Aula / GOR** | Pensi, basket indoor, malam perpisahan, wisuda kalau hujan. |
| 10 | **Musala** | Shalat Jumat, event Ramadan. |
| 11 | **Lapangan basket & futsal** | Ekskul, class meeting, basket 3x3. |
| 12 | **Kantin (6 lapak) & koperasi** | Makan, gosip, lapak milik pemain di kelas XI. |
| 13 | **Toilet, gudang olahraga, ruang piket** | Tempat sembunyi, ambil sapu untuk hukuman/senjata. |
| 14 | **Kebun & greenhouse** | Misi Biologi, bahan herbal. |
| 15 | **Gedung Lama** | Terkunci, misteri lonceng & akta (Bab 12). |
| 16 | **Pohon beringin & bangku** | Nongkrong, tempat nembak romance. |
| - | **Warung belakang Mak Iyah** | Di luar pagar utara. Jalur bolos lewat titik loncat pagar (garis merah). |

## Urutan pembangunan peta (saran)

1. **Prototipe 1 (inti)**: Perkampungan Kenanga + Warkop Simpang lv1-2 + jalan ke sekolah + halaman sekolah (gerbang, lapangan, kantin)
   + 1 ruang kelas. Cukup untuk loop: sekolah pagi, satu mini game pelajaran, kopi keliling sore, warkop malam.
2. **Prototipe 2**: Gedung B penuh, Gedung A lt1 (BK untuk hukuman), parkiran, pasar, alun-alun. Tambah berantem dan rapor.
3. **Prototipe 3**: Bengkel, gudang markas, Kampung Bantaran, Jalan Lingkar (balap). Tambah geng motor dan motor.
4. **Lengkap**: sisa kota (ruko, plaza, bukit, STM, lahan proyek), Gedung C, aula, Gedung Lama, peta study tour.
