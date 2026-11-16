# Lonceng Pulang: Guide Desain

Guide ini adalah sumber utama untuk membangun game SMA "Lonceng Pulang" (judul kerja). Tiap segmen berdiri sendiri
sebagai file `.md` supaya gampang dibuka lagi dan diubah satu per satu.

## Isi guide

| No | Segmen | Isi |
|---|---|---|
| 00 | Ringkasan | Halaman ini: premis, pilar, daftar segmen, ringkasan tokoh |
| 01 | Tokoh utama (pemain) | Raka / Rani: penampilan, baju, statistik, gaya |
| 02 | Gaya portrait & prompt | Aturan gaya portrait 480x480, prompt dasar, 12 ekspresi |
| 03 | Sistem hati | Aturan 8 hati, kado, kencan, pacaran, cemburu |
| 10-17 | NPC utama cewek (8) | Nadia, Sekar, Laras, Uti, Sasha, Kirana, Mei, Wulan |
| 20-27 | NPC utama cowok (8) | Dimas, Arga, Rizal, Tegar, Jojo, Bram, Andra, Gilang |
| 30 | NPC pendukung cerita | Keluarga, sahabat, guru, geng, antagonis: detail + 4 event hati persahabatan |
| 31 | NPC pengisi dunia | 48 NPC latar dengan bubble chat |
| 32 | Tempat tinggal | Semua tokoh dan wilayahnya, di dalam atau di luar peta |
| 40 | Obrolan & reaksi | Sistem dialog, obrolan antar tokoh, reaksi NPC terhadap aksi pemain |
| 41 | Feedback & konsekuensi | Akibat setiap tindakan pemain |
| 50 | Pelajaran & mini game | Jadwal pelajaran, 12 mini game kelas, ujian, mini game luar sekolah |
| 60 | Upgrade | Sepeda, motor, HP, kamar, warkop, bengkel, outfit |
| 61 | Keuangan | Mata uang, pemasukan, pengeluaran, tabungan, utang, harga |
| 70 | Animasi berantem | Kontrol, combo, kuncian, senjata improvisasi, keroyokan, bos |
| 71 | Animasi game | Semua gerakan: jalan, kerja, sekolah, sosial, kendaraan, emosi |
| 80 | Peta & denah | Peta kota, 4 denah wilayah, denah sekolah |
| 81 | Interior sekolah | Denah dalam semua gedung sekolah, ukuran untuk gameplay |
| 82 | Interior kota | Rumah, warkop, markas, toko, dan bangunan lain yang bisa dimasuki |
| 83 | Sekolah dari luar | Denah tapak baru, tampak tiap gedung, halaman, lapangan, parkiran |
| 84 | Habit NPC sekolah | Jadwal per jam, kelompok, kebiasaan siswa & guru, reaksi kerumunan |
| 85 | Jalan tembus & area baru | Aturan jalan tanpa buntu, hutan, 14 tempat baru dan kait ceritanya |
| 86 | Peta daerah (besar) | Kota + gunung, pantai, waduk, desa, industri, batalyon; akses & transport |
| 87 | Sirkuit & balap liar | Sirkuit resmi (tribun, pit, paddock), 4 rute balap liar, razia, akses |
| 88 | STM Karya Bangsa | Denah tapak, tampak, bengkel otomotif, akses & jadwal |
| 89 | GOR Kota | Arena event, kolam renang lomba, gym upgrade diri |
| 90 | Katalog tipe bangunan | Rumah kampung, perumahan, ruko, panggung, desa, pesisir: bentuk, warna, plus-minus, aturan posisi |
| 91 | Detail tiap bangunan | 61 bangunan bernama: papan nama, objek pendukung + posisi, plus-minus, jam |
| 92 | Interior detail | 29 denah dalam dengan posisi objek & titik interaksi |

Dokumen yang sudah ada sebelumnya (`01-cerita.md` sampai `06-event.md`, peta, bangunan, sprite) tetap berlaku. Guide ini
memperdalam dan, kalau ada yang beda, **guide ini yang dipakai**.

## Premis singkat

Pemain (Raka atau Rani, 15 tahun) pindah dari desa ke kota fiktif **Wirabumi** untuk tinggal bersama **Om Darto**, pemilik
Warkop Simpang yang terlilit utang. Tiga tahun di **SMA Negeri 3 Wirabumi**: belajar lewat mini game, cari uang, membesarkan
warkop, masuk klub motor **Lampu Kota**, jatuh cinta, dan akhirnya ikut menyelamatkan sekolah dari rencana relokasi oleh
**PT Graha Megantara**. Di loteng Gedung Lama tersimpan lonceng sekolah pertama dan akta tanah yang jadi kunci cerita.

## Perubahan dari versi sebelumnya

- NPC utama jadi **16 tokoh romanceable**: 8 cewek dan 8 cowok. Pemain cowok bisa memacari 8 tokoh cewek, pemain cewek bisa
  memacari 8 tokoh cowok. Semua 16 tetap bisa jadi sahabat untuk pemain mana pun (sistem hati yang sama, event ke-8 berubah
  jadi "sahabat sejati"). Satu flag `romanceTerbuka` bisa membuka semua opsi untuk semua pemain.
- **Uti, Tegar, Jojo, dan Bram** sekarang termasuk tokoh romance. **Sasha** (geng Bram) punya jalur penebusan.
- Tokoh baru dari luar sekolah: **Kirana** (STM, adik Kobar), **Mei** (toko buku), **Wulan** (pesilat dari desa di luar peta),
  **Andra** (pelukis mural STM), **Gilang** (pengantar galon & skater).
- Semua tokoh romance seumuran pemain (15-18 tahun). Tokoh dewasa hanya jadi pendukung, tidak pernah romance.

## Ringkasan 16 NPC utama

| Tokoh | Umur | Sekolah / kerja | Peran singkat | Tinggal |
|---|---|---|---|---|
| Nadia Kusuma | 15 | SMA 3, X-2 | Calon ketua OSIS, perfeksionis | Pusat Kota (belakang Masjid Agung) |
| Sekar Ayuningtyas | 15 | SMA 3, X-3 | Gitaris pendiam, penulis lagu | Perumahan Bukit Asri |
| Laras Wibisana | 16 | SMA 3, X-2 | Penjual nasi uduk subuh | Kampung Bantaran |
| Uti (Putri Maharani) | 15 | SMA 3, X-1 | Tomboi, montir, pemain futsal | Perkampungan Kenanga |
| Sasha Aurelia | 16 | SMA 3, X-1 | Anak elite geng Bram, ingin bebas | Perumahan Bukit Asri |
| Kirana Wijaya | 16 | STM Karya Bangsa, Otomotif | Adik Kobar, pembalap jalanan | Selatan (rumah di belakang bengkel ayahnya) |
| Mei Lestari | 15 | SMA Bina Bangsa (swasta) | Anak toko buku, ilustrator | Pusat Kota (lantai 2 Toko Buku Pena) |
| Wulan Sari | 16 | SMK Pariwisata | Pesilat juara, pemandu wisata kebun teh | **Peta daerah**: Desa Sukamekar (utara) |
| Dimas Aditya | 16 | SMA 3, X-3 | Kapten basket, pemalu | **Peta daerah**: Asrama Batalyon (timur kota) |
| Arga | 16 | SMA 3, X-1 | Anggota muda Lampu Kota, pendiam | Kawasan Sekolah (rumah Pak Ujang) |
| Rizal Pratama | 15 | SMA 3, X-2 | Penulis cerpen, sekretaris OSIS | Pusat Kota (kontrakan belakang Ruko Pelita) |
| Tegar Hutomo | 15 | SMA 3, X-2 | Ketua kelas, juara umum, tertekan | Perumahan Bukit Asri |
| Jojo (Yohanes) | 15 | SMA 3, X-2 | Fotografer mading, tukang gosip | Pusat Kota (atas studio Foto Kilat) |
| Bram Megantara | 17 | SMA 3, XI-1 lalu seangkatan | Rival, anak developer, jalur penebusan | Perumahan Bukit Asri |
| Andra Pamungkas | 16 | STM Karya Bangsa, Bangunan | Pelukis mural, anggota Serigala Besi | Selatan (rumah nenek dekat sawah) |
| Gilang Ramadhan | 17 | Putus sekolah, ikut paket C | Pengantar galon, skater, jenaka | Kampung Bantaran (rumah panggung) |
