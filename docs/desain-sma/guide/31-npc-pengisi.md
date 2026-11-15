# 31. NPC Pengisi Dunia

48 NPC latar membuat kota terasa hidup. **Tanpa portrait**, interaksi hanya **bubble chat** di atas kepala (1-2 baris).
Masing-masing punya jadwal sederhana (2-3 lokasi), satu baris sapaan acak dari 3 variasi, dan reaksi singkat terhadap
aksi pemain. Beberapa memberi misi kecil satu langkah.

## Aturan bubble

- Bubble muncul saat pemain lewat dalam jarak 3 petak, sekali per 30 detik per NPC.
- Ada 4 jenis bubble: **sapaan** (putih), **reaksi** (kuning), **gosip** (ungu, menyebar info), **misi** (hijau dengan "!").
- Warna nama NPC mengikuti reputasi pemain di wilayah itu (hijau ramah, abu netral, merah takut/benci).

## Daftar per wilayah

### Perkampungan Kenanga (10)

| NPC | Sosok | Jadwal | Bubble contoh |
|---|---|---|---|
| Mbah Karto | Kakek bersarung, tongkat | Teras rumah, pos ronda | "Le, jaman Mbah dulu sekolah jalan kaki 5 kilo." |
| Bu Sum | Penjual sayur gerobak | Keliling 06.00-09.00 | "Sayur, sayur! Kangkung dua ribu!" |
| Pak Darmin | Tukang ojek pangkalan | Pangkalan ujung gang | "Ojek, Dek? Eh, kamu kan punya sepeda." |
| Dodi & Didi | Anak SD kembar | Gang, lapangan kecil | "Kak, main layangan yuk!" (misi: layangan nyangkut) |
| Mbak Rini | Ibu muda menggendong bayi | Warung, posyandu | "Ssst, bayinya baru tidur." |
| Pak Joko | Tukang las | Bengkel las | "Awas matanya, jangan lihat apinya!" |
| Teh Euis | Penjual pecel | Lapak pecel 06.00-10.00 | "Pecel pedas atau sedang, Kasep?" |
| Koh Ahong | Pemilik toko kelontong | Toko | "Ada uang ada barang, hehe." |
| Uda Rizki | Penjual nasi Padang | Rumah makan | "Rendang baru matang!" |
| Ustaz Hasan | Imam musala | Musala | "Jangan lupa salat, Nak." |

### Perumahan Bukit Asri (8)

| NPC | Sosok | Jadwal | Bubble contoh |
|---|---|---|---|
| Pak Satpam Bambang | Satpam kompleks | Pos gerbang | "Mau ke rumah siapa, Dek? Tulis di buku tamu." |
| Bu Veronika | Ibu senam pagi | Jalan kompleks 06.00 | "Satu, dua, tiga... eh, permisi ya." |
| Mbak Yuni | ART menyapu halaman | Halaman rumah | "Majikan saya galak, jangan berisik ya." |
| Kak Raffi | Mahasiswa pulang kampung | Kafe, jogging | "Lagi skripsi, jangan tanya kapan lulus." |
| Opa Willem | Pensiunan pecinta anggrek | Taman rumah | "Anggrek ini umurnya lebih tua dari kamu." |
| Nyonya Lita | Sosialita teman ibu Sasha | Mobil, kafe | "Kamu anak siapa? Oh... anak warkop." |
| Kurir Bayu | Kurir paket | Keliling | "Paket! Paket!" (misi: antar paket salah alamat) |
| Kevin kecil | Bocah dengan drone | Taman kompleks | "Drone-ku nyangkut! Tolong!" |

### Pusat Kota (12)

| NPC | Sosok | Jadwal | Bubble contoh |
|---|---|---|---|
| Pak Polisi Sugeng | Polantas | Simpang lampu merah | "Helmnya dipakai, Mas!" |
| Mas Barista Kevin | Barista kafe modern | Kafe | "Single origin, mau coba?" (saingan warkop) |
| Bu Lastri | Penjual jamu gendong | Keliling alun-alun | "Jamu, Nak? Kunyit asam biar seger." |
| Pak Tarno | Tukang parkir | Depan ruko | "Priiit! Kiri, kiri, terus!" |
| Mbak SPG Dewi | SPG pulsa | Depan mal | "Paket data murah, Kak!" |
| Pengamen Dul | Pengamen ukulele | Angkot, alun-alun | "Satu lagu buat yang lagi kasmaran..." |
| Om Hendrik | Penjual koran | Kios koran | "Berita hari ini: proyek superblok!" (gosip cerita) |
| Bu Wati | Pegawai bank | Bank | "Mau buka tabungan pelajar?" (tutorial tabungan) |
| Mas Ilham | Ojek online | Keliling | "Orderan sepi, Bro." |
| Kak Nana | Kasir minimarket | Minimarket | "Ada tambahan pulsa? Poinnya?" |
| Pak Darsono | Tukang sol sepatu | Trotoar | "Sepatumu jebol. Sini, sepuluh ribu." |
| Gerombolan Turis | 3 turis bule | Alun-alun (Sabtu) | "Excuse me, where is... warkop?" (misi kecil Bahasa Inggris) |

### Kampung Bantaran (8)

| NPC | Sosok | Jadwal | Bubble contoh |
|---|---|---|---|
| Wak Udin | Nelayan sungai | Tepi Kali Cendana | "Ikannya lagi malas." |
| Bu Inah | Buruh cuci | Tepi kali, jemuran | "Jangan lewat jemuran!" |
| Bang Ucok | Tukang becak | Pangkalan becak | "Becak, Dek? Murah, sambil curhat." |
| Anak-anak layangan (4) | Anak kampung | Tanggul | "Putus! Putus! Kejar!" |
| Mak Ijah | Penjual kue subuh | Pasar subuh | "Kue lupis, kue lapis!" |
| Pak Roni | Pemulung | Keliling | "Ada botol bekas, Dek?" (misi: kumpulkan botol) |
| Teh Lilis | Penjahit pasar (ibunya Nadia bekerja dengan dia) | Kios jahit | "Celanamu robek, mau dijahit?" |
| Mas Tejo | Penjaga pintu air | Pintu air | "Kalau hujan deras, jangan ke sini!" |

### Kawasan Sekolah & selatan (10)

| NPC | Sosok | Jadwal | Bubble contoh |
|---|---|---|---|
| Pak Satpam Udin | Satpam sekolah | Gerbang | "Tiga, dua, satu... tutup!" |
| Bu Kantin Ningsih | Penjual soto kantin | Kantin | "Soto lagi? Pakai nasi atau lontong?" |
| Mas Cilok | Penjual cilok gerobak | Gerbang 14.00 | "Cilok! Cilok bumbu kacang!" |
| Siswa X-1 Andi | Kutu buku | Perpustakaan | "Ssst." |
| Siswi X-3 Fitri & Rina | Duo gosip kelas | Koridor | "Eh, tahu nggak sih..." (gosip) |
| Siswa XI Bayu "Si Telat" | Selalu telat | Lompat pagar | "Bantuin naik pagar, cepet!" |
| Anak Paskibra Maya | Disiplin | Lapangan | "Kiri, kanan, kiri!" |
| Anak STM Bejo | Anggota Serigala Besi kecil | Jembatan selatan | "Ngapain anak SMA ke sini?" |
| Mandor Proyek Sutris | Mandor proyek PT Graha | Pagar proyek | "Dilarang masuk! Proyek!" |
| Penjual Bakso Pak Pras | Ayah Bimo, gerobak bakso | Depan sekolah sore | "Bakso! Temennya Bimo gratis kuahnya." |

## Reaksi umum NPC pengisi

| Aksi pemain | Bubble reaksi (acak) |
|---|---|
| Berlari menabrak | "Aduh! Lihat jalan!" / "Hati-hati, Dek!" |
| Berantem di dekatnya | "Woy! Jangan berantem!" / "Panggil satpam!" (NPC lari menjauh) |
| Naik motor kencang | "Pelan-pelan! Ada anak kecil!" |
| Membantu NPC lain | "Anak baik..." / "Siapa namanya itu?" |
| Pakai seragam sekolah saat jam pelajaran | "Lho, bolos ya?" (Pak Wawan mendapat info gosip) |
| Membawa gerobak kopi | "Kopi, Mas/Mbak! Satu!" (pembeli) |
| Reputasi pemain tinggi (pahlawan kampung) | "Itu dia anak yang nolongin pasar!" |
| Reputasi preman tinggi | "Ssst, jangan cari masalah sama dia." |
| Hujan | "Neduh, neduh!" (NPC lari ke teras) |
| Malam | "Kok belum pulang, Nak?" |
