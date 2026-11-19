# 33. NPC Wilayah Luar Kota

NPC baru untuk wilayah di peta daerah (segmen 86) dan alur cerita baru (segmen 04). Bagian pertama adalah **NPC pendukung
cerita**: punya portrait dewasa 6 ekspresi (atau remaja 12), jadwal, dan meter persahabatan 0-8 dengan aturan segmen 30.
Bagian kedua adalah **NPC pengisi** dengan bubble chat, memakai aturan bubble segmen 31.

Nama sudah dicek supaya tidak bentrok dengan tokoh di segmen 10-31.

## Ringkasan NPC pendukung

| Tokoh | Umur | Peran | Tinggal | Bab penting | Ekspresi |
|---|---|---|---|---|---|
| Kyai Mahfud Sastrowiryo | 63 | Pengasuh Pesantren Darul Falah, cucu Ki Sastro Wiryo (pemberi hibah tanah sekolah) | Desa Tegalsari, pesantren | 2, 11, 12, 13 | 6 |
| Abah Karta | 71 | Kakek Wulan, guru perguruan silat Kembang Teh, sahabat lama Pak Ujang | Desa Sukamekar, pendopo | 3, 8, 12, 13 | 6 |
| Serma Hadi Aditya | 46 | Ayah Dimas, bintara Batalyon 3 | Asrama Batalyon 3 | 5, 9, 13 | 6 |
| Pak Sudarmaji | 54 | Petugas pintu air Bendungan Sirnagalih | Rumah dinas di bendungan | 4, 10, 13 | 6 |
| Wak Kodir | 59 | Juragan perahu, ketua nelayan muara | Kampung nelayan TPI | 5, 13 | 6 |
| Bu Romlah | 47 | Pemilik warung seafood terbesar Pantai Lintang | Pantai Lintang | 2, 11 | 6 |
| Kang Ujo | 36 | Kepala basecamp pendakian Sangkala, mantan porter | Basecamp | 8, 11, 12 | 6 |
| Mandor Sabar | 52 | Mandor pabrik teh tua dan kebun teh Sukamekar | Desa Sukamekar | 3, 5, 8 | 6 |
| Pak Yusuf Tanjung | 50 | Kepala race control Sirkuit Tanjung Pradana, mantan pembalap | Mes sirkuit | 5, 9, 11 | 6 |
| Mbak Sri Wahyuni | 31 | Koordinator buruh shift Kawasan Industri | Kos buruh Jl. Industri | 4, 7, 13 | 6 |
| Mbah Darmo | 81 | Penjaga mercusuar Tanjung Karang | Rumah jaga mercusuar | 10, 15 | 6 |
| Nek Sumi | 72 | Nenek Andra, penjual jamu gendong (nama untuk tokoh yang sudah ada di segmen 26) | Desa Pandansari, tepi sawah | 6, 11 | 6 |
| Tito | 12 | Anak asrama, murid bola Dimas | Asrama Batalyon 3 | 5, 13 | 12 |
| Neng Ayu | 14 | Adik pertama Wulan, ingin jadi pembalap seperti Kirana | Desa Sukamekar | 8, 11 | 12 |

Antagonis kecil (tidak punya meter persahabatan, punya portrait 6 ekspresi):

| Tokoh | Umur | Peran | Muncul |
|---|---|---|---|
| Bang Sarip | 38 | Kepala orang bayaran PT Graha Megantara. Bos kecil di Bab 7, 12, dan 13 | Gudang kontraktor, gerbang sekolah |
| Pak Rusdi | 49 | Mandor gudang subkontraktor PT Graha di Kawasan Industri, pemegang daftar "tenaga harian" | Gudang kontraktor (Bab 7) |
| Ir. Lukman | 44 | Manajer proyek villa tahap 2, memasang patok di Sukamekar dan Pandansari | Kantor proyek Bukit Bintang (Bab 11) |

Ki Sastro Wiryo (almarhum, pemberi hibah tanah 1950-an) hanya muncul di foto, prasasti, dan buku saksi.

---

## Kyai Mahfud Sastrowiryo

- **Penampilan**: kurus tinggi, janggut putih pendek, kacamata bulat berbingkai emas, peci hitam, baju koko putih,
  sarung kotak hijau. Membawa tasbih kayu dan selalu ada pena di saku.
- **Watak**: tenang, cerdas, suka humor halus. Tidak mau ikut politik, tapi keras kalau soal amanah.
- **Cara bicara**: pelan, banyak perumpamaan. "Tanah itu titipan, Nak. Yang menitipkan masih melihat."
- **Jadwal**: subuh mengajar santri, siang di perpustakaan pesantren, sore jalan ke pasar hewan menyapa warga.
- **Peran**: pemegang buku saksi hibah (Bab 12). Saksi kunci di sidang (Bab 13). Perpustakaannya jadi tempat belajar jalur
  kuliah (Bab 11).
- **Portrait prompt**: `63-year-old Indonesian Muslim scholar, tall and thin, short white beard, round gold-rimmed
  glasses, black peci cap, white koko shirt, green checked sarong, wooden prayer beads.
  Badan: tall and thin, slight stoop, sarong down past the thigh; signature pose prayer beads in the right hand, left hand
  behind the back; small, calm movements.`
- **Event persahabatan**:
  - 2: "Gula Aren". Pemain kembaliannya kelebihan di pasar dan mengembalikannya. Kyai memperhatikan, lalu mengajak minum teh.
  - 4: "Rak Paling Atas". Membantu menyusun perpustakaan, dan pemain melihat buku tua bersegel yang tidak boleh dibuka.
  - 6: "Cerita Kakek". Kyai bercerita tentang Ki Sastro yang menyerahkan sawah terbaiknya untuk sekolah.
  - 8: "Amanah". Kyai menyerahkan buku saksi lebih awal kepada pemain. Bonus: di Bab 13 sidang tidak bisa gagal karena
    saksi, dan belajar di perpustakaan pesantren selalu memberi fokus +.

## Abah Karta

- **Penampilan**: pendek, punggung masih tegak, kulit gelap terbakar, rambut putih disisir ke belakang, ikat kepala batik
  cokelat, baju pangsi hitam pudar. Telapak tangan tebal.
- **Watak**: keras, kolot, tapi diam-diam sentimental. Tidak suka orang kota yang "cuma mau foto".
- **Cara bicara**: logat Sunda pegunungan, kalimat pendek. "Jurus itu bukan buat pamer. Buat pulang dengan selamat."
- **Jadwal**: subuh latihan di pendopo, siang di kebun, malam main kecapi di teras.
- **Peran**: guru silat pemain (membuka jurus lanjutan di segmen 70). Saksi sumpah Batu Tulis. Memimpin perguruan menjaga
  sekolah (Bab 13).
- **Portrait prompt**: `71-year-old Indonesian martial arts master from a mountain village, short and upright,
  sun-darkened skin, white hair combed back, brown batik headband, faded black pangsi outfit, thick calloused hands.
  Badan: short and upright, batik sash belt, loose pangsi trousers; signature pose hands clasped behind the back, chest
  out; small movements, angry is a single raised palm.`
- **Event persahabatan**:
  - 2: "Murid Kota". Abah menyuruh pemain memikul air dari pancuran 10 kali sebelum boleh latihan.
  - 4: "Kecapi". Malam di teras, Abah memainkan lagu yang dulu dia mainkan bersama Pak Ujang.
  - 6: "Batu Tulis". Abah mengajak pemain ke Bukit Batu Tulis dan menunjukkan namanya yang terpahat kecil di batu.
  - 8: "Pewaris". Abah mengizinkan Wulan menerima beasiswa (kalau pemain dekat dengan Wulan) dan memberi pemain sabuk hijau
    kehormatan. Bonus: jurus kuncian terakhir.

## Serma Hadi Aditya

- **Penampilan**: tegap, rambut cepak, kumis tipis rapi, wajah keras. Seragam loreng atau kaus olahraga hijau. Jam tangan
  besar.
- **Watak**: disiplin, kaku, sebenarnya sangat bangga pada Dimas tapi tidak bisa mengatakannya.
- **Cara bicara**: pendek, perintah. "Ulangi. Yang benar."
- **Peran**: penjaga gerbang hubungan Dimas. Mengingat pemain di HUT batalyon (Bab 5), hadir di tribun final basket (Bab 9),
  dan mengizinkan anak asrama membantu aksi damai (Bab 13) kalau persahabatannya 4+.
- **Portrait prompt**: `46-year-old Indonesian army sergeant major, upright and broad, crew cut, neat thin moustache,
  stern face, green camouflage uniform, large wristwatch.
  Badan: upright and broad, camouflage shirt tucked into trousers with a web belt; signature pose at ease with hands
  behind the back; small, stiff movements.`
- **Event persahabatan**:
  - 2: "Lari Subuh". Pemain ikut lari pagi dan tidak berhenti walau tertinggal.
  - 4: "Mi Instan". Di dapur asrama, Serma Hadi ternyata yang mengajari Dimas resep mi racikan.
  - 6: "Tribun". Sesudah final Bab 9, dia mengakui di depan pemain bahwa dia terlalu keras.
  - 8: "Hormat". Dia memberi pemain baret lama sebagai tanda percaya. Bonus: gerbang asrama terbuka kapan saja.

## Pak Sudarmaji

- **Penampilan**: gemuk pendek, kemeja dinas PU kusam, helm proyek kuning, sepatu bot karet, buku catatan basah.
- **Watak**: jujur tapi penakut, punya anak tiga dan cicilan rumah.
- **Peran**: dipaksa membuka pintu air lebih cepat (Bab 10). Dengan persahabatan 4+ atau bukti dari Gilang, dia bersaksi
  (Bab 13). Kalau tidak, dia pindah tugas dan epilog waduk jadi buruk.
- **Bubble khas**: "Air itu nggak bisa disuruh, Dek. Orang yang bisa."
- **Event persahabatan**: 2 "Kopi Malam" (antar kopi saat jaga hujan), 4 "Catatan Debit" (dia memperlihatkan buku
  catatan air), 6 "Telepon Itu" (dia bercerita siapa yang menelepon menyuruh membuka pintu air), 8 "Sirene" (memasang
  sirene peringatan banjir bersama pemain dan Gilang).

## Wak Kodir

- **Penampilan**: kurus liat, kulit hitam legam, kaus partai lama, celana pendek, caping, rokok kretek di telinga (tidak
  dinyalakan di dekat anak-anak).
- **Watak**: keras, lucu, suka bertaruh kecil-kecilan, sangat setia kawan.
- **Peran**: membuka pekerjaan nelayan subuh (Bab 5). Rute laut pengantaran akta (Bab 13).
- **Bubble khas**: "Laut nggak kenal hari Minggu, Le."
- **Event persahabatan**: 2 "Jaring Kusut", 4 "Badai Kecil" (pulang melawan ombak, mini game kemudi), 6 "Anak Saya di
  Kota" (anaknya kerja di pabrik dan jarang pulang), 8 "Perahu Sendiri" (pemain boleh meminjam perahu kapan saja).

## Bu Romlah

- **Penampilan**: gemuk, celemek bunga-bunga, rambut dicepol dan diikat kain, gelang emas banyak, suara keras.
- **Watak**: pedagang ulung, galak ke pelayan, baik ke anak sekolah.
- **Peran**: pelanggan luar kota pertama warkop (Bab 2). Mitra cabang warkop Pantai Lintang di jalur usaha (Bab 11).
- **Bubble khas**: "Kopinya yang dingin ya, yang kemarin laris!"
- **Event persahabatan**: 2 "Pesanan Telat", 4 "Hari Libur Panjang" (jaga warung saat ramai), 6 "Lahan Belakang"
  (dia menawarkan sepetak lahan untuk cabang), 8 "Kongsi" (cabang warkop dapat bagi hasil 60:40 untuk pemain).

## Kang Ujo

- **Penampilan**: jaket gunung oranye pudar, celana kargo, sandal gunung, kumis tipis, kulit wajah merah kena angin.
- **Watak**: santai, tahu semua jalur, galak soal sampah dan aturan jam naik.
- **Peran**: pendaftaran pendakian, misi porter. Kalau hati Tegar kurang dari 4, Kang Ujo yang menelepon pemain bahwa ada
  anak SMA mau naik sendirian sore hari (Bab 11). Pemandu kemah puncak angkatan (Bab 12).
- **Bubble khas**: "Naik boleh, sampahnya turun lagi ya."
- **Event persahabatan**: 2 "Porter Baru", 4 "Kabut" (menuntun rombongan turun), 6 "Jalur Lama" (menunjukkan jalan
  rahasia ke Batu Tulis dari punggung gunung), 8 "Pemandu Kehormatan" (pemain boleh mendaki kapan saja, termasuk malam).

## Mandor Sabar

- **Penampilan**: topi koboi anyaman, kemeja lengan panjang lusuh, sepatu bot, peluit di leher.
- **Watak**: sesuai namanya: sabar, lambat bicara, hafal semua pemetik teh.
- **Peran**: pekerjaan panen teh (Bab 5), tur pabrik teh (Bab 8), saksi patok villa di tepi kebun (Bab 11).
- **Bubble khas**: "Pucuk dua daun, jangan lebih. Teh itu soal sabar."

## Pak Yusuf Tanjung

- **Penampilan**: kurus, rambut abu disisir rapi, kemeja race control oranye, radio di dada, bekas luka bakar di tangan kiri.
- **Watak**: tegas, suka mengajar, benci balap liar karena pengalamannya sendiri.
- **Peran**: pengurus track day dan liga (Bab 5, 9). Dulu satu geng dengan Om Darto, dan dia yang membawa sahabat Om Darto
  ke rumah sakit malam kecelakaan itu. Kalau pemain mempertemukan mereka berdua (Om Darto 6+ dan Pak Yusuf 4+), ada event
  bersama: "Satu Putaran untuk Teman".
- **Bubble khas**: "Di sini cepat itu boleh. Di jalan, cepat itu bodoh."

## Mbak Sri Wahyuni

- **Penampilan**: seragam pabrik biru, kerudung abu, masker kain di dagu, kartu ID tergantung, sepatu kets.
- **Watak**: lugas, pemberani, sering berselisih dengan mandor.
- **Peran**: penanggung jawab shift pemain (Bab 4). Membantu menyelinap ke gudang (Bab 7). Membocorkan jadwal truk proyek
  (Bab 13).
- **Bubble khas**: "Absen dulu, baru ngeluh."

## Mbah Darmo

- **Penampilan**: sangat tua, punggung bungkuk, sarung dan jaket tentara usang, kacamata tebal, membawa lampu minyak.
- **Watak**: pelupa soal hari ini, ingat jelas soal masa lalu. Suka bercerita tentang kapal-kapal tua.
- **Peran**: misi penutup pantai (menyalakan lagi lampu mercusuar). Di Bab 15, kalau misinya selesai, lampu mercusuar
  menyala tepat saat adegan penutup.
- **Bubble khas**: "Lampu ini dulu menuntun kapal pulang. Sekarang menuntun siapa, ya?"

## Nek Sumi

- **Penampilan**: kebaya lurik, kain jarik, selendang gendong berisi botol jamu, rambut putih disanggul.
- **Peran**: nenek Andra. Sawahnya dipatok proyek (Bab 11). Dengan Andra 6+, dinding lumbungnya jadi kanvas mural.
- **Bubble khas**: "Kunyit asam, Nak? Biar nggak gampang marah kayak cucu Nenek."

## Tito dan Neng Ayu (remaja/anak, 12 ekspresi)

- **Tito** (12): anak asrama, kaus bola kebesaran, lutut selalu luka. Mengikuti Dimas ke mana-mana. Bubble: "Kak Dimas
  bilang kakak jago, beneran?" Di Bab 13 dia yang lari mengabari anak asrama.
- **Neng Ayu** (14): adik Wulan, rambut pendek, jaket balap kebesaran, mengidolakan Kirana. Bubble: "Kak, boncengin
  sampai kelokan doang!" Kalau pemain dekat dengan Kirana, Ayu bisa diajak ke track day (misi sampingan "Pembalap Desa").

## Bang Sarip (bos kecil)

- **Penampilan**: besar, kepala plontos, bekas luka di pipi, kemeja motif batik terbuka di atas kaus hitam, kalung rantai,
  tongkat rotan.
- **Gaya bertarung**: lambat tapi kuat. Tongkat rotan bisa direbut (senjata improvisasi segmen 70). Selalu datang dengan
  2-4 anak buah.
- **Bab 7**: pertarungan pertama di gudang (dia kabur). **Bab 12**: mengejar dari Gedung Lama. **Bab 13**: bos di gerbang
  sekolah. Kalau sekutu Batalyon atau Kembang Teh hadir, dia mundur tanpa bertarung.
- **Bubble khas**: "Bocah. Pulang sana, belajar."

---

## NPC pengisi per wilayah luar kota

### Desa Tegalsari

| NPC | Sosok | Jadwal | Bubble contoh |
|---|---|---|---|
| Haji Mansur | Juragan sapi pasar hewan, sorban, perut besar | Pasar hewan 06.00-12.00 | "Sapi ini gemuk, lihat giginya!" (misi Iduladha) |
| Kang Asep | Sopir angkot barat, handuk di bahu | Pangkalan angkot | "Terakhir jam lima, Neng, ketinggalan ya jalan kaki!" |
| Santri Fikri & Zaki | Dua santri bersarung | Gang, pesantren | "Kak, minta tanda tangan buat tugas!" |
| Mak Odah | Penjual lontong sayur | Ujung Gg. Melati 06.00-09.00 | "Lontong, lontong, masih anget!" |
| Pak Ronda Waluyo | Peronda malam, kentongan | Pos ronda 21.00-03.00 | "Siapa itu? Oh, anak kota." |

### Desa Sukamekar & kebun teh

| NPC | Sosok | Jadwal | Bubble contoh |
|---|---|---|---|
| Ibu-ibu pemetik teh (4) | Caping, keranjang di punggung | Kebun 06.00-11.00 | "Awas injak pucuknya!" |
| Mang Dadang | Penjual jagung bakar Bukit Bintang | Warung 17.00-24.00 | "Jagung manis, pedas, apa keju?" |
| Teh Nining | Penjaga villa | Villa | "Sewa semalam? Ada yang kosong dua." |
| Murid silat cilik (3) | Pangsi kebesaran | Pendopo sore | "Hiaaat! Kakak murid baru ya?" |

### Gunung Sangkala

| NPC | Sosok | Jadwal | Bubble contoh |
|---|---|---|---|
| Pendaki rombongan kampus (3) | Carrier besar, jaket warna-warni | Setapak pendakian | "Pos dua masih jauh nggak, Dek?" |
| Porter Udin | Pikulan, sandal jepit | Basecamp ke pos 3 | "Saya naik sambil bawa gas, kamu bawa diri aja capek." |
| Ibu warung air panas | Handuk di leher | Pemandian air panas | "Lima ribu, berendam sepuasnya." |

### Waduk Sirnagalih & Batu Tulis

| NPC | Sosok | Jadwal | Bubble contoh |
|---|---|---|---|
| Pemancing Om Leo | Topi mancing, kursi lipat | Tepi waduk pagi-sore | "Sssst, ikannya lagi mikir." |
| Tukang perahu Jaja | Kaus basah, dayung | Dermaga waduk | "Keliling waduk dua puluh ribu, bonus lihat bendungan." |
| Mahasiswa arkeologi Rara | Topi lapangan, buku sketsa | Batu Tulis (Sabtu) | "Aksaranya Kawi akhir, mungkin. Kamu bisa baca?" |

### Asrama Batalyon 3

| NPC | Sosok | Jadwal | Bubble contoh |
|---|---|---|---|
| Prajurit jaga Dedi | Seragam, senapan latihan | Gerbang 24 jam | "Ada perlu apa? Kartu pelajar." |
| Ibu-ibu Persit (3) | Seragam pink | Lapangan, pagi | "Dimas temannya ya? Sini, makan dulu." |
| Regu lari subuh | 8 prajurit lari berbaris | Jalan asrama 05.00 | "Satu! Dua! Tiga! Empat!" |

### Kawasan Industri Pradana

| NPC | Sosok | Jadwal | Bubble contoh |
|---|---|---|---|
| Buruh shift (6) | Seragam biru, helm | Gerbang pabrik saat ganti shift | "Akhirnya pulang..." |
| Sopir truk Pak Bonar | Kaus singlet, handuk | Parkiran truk | "Minggir, Dek, rem truk ini sudah tua." |
| Penjual nasi kucing malam | Gerobak, lampu petromaks | Pinggir Jl. Industri 21.00-03.00 | "Tiga ribu, ambil sendiri." |
| Satpam pabrik Herman | Seragam satpam, senter | Pos pabrik | "Bukan karyawan dilarang masuk!" |

### Sirkuit Tanjung Pradana

| NPC | Sosok | Jadwal | Bubble contoh |
|---|---|---|---|
| Marshal bendera | Rompi oranye, bendera | Pinggir lintasan saat event | "Bendera kuning! Pelan!" |
| Mekanik tim lain | Wearpack, kunci | Pit | "Motormu boleh juga. Siapa yang setting?" |
| Penonton fanatik | Kaus tim, terompet | Tribun | "Gaaas teruuus!" |

### Desa Pandansari

| NPC | Sosok | Jadwal | Bubble contoh |
|---|---|---|---|
| Pak Tani Karyo | Caping, cangkul | Sawah 06.00-11.00 | "Jangan lewat pematang yang baru dibetulkan!" |
| Anak layangan Pandansari (3) | Kaus lusuh | Pematang sore | "Benangnya gelasan, hati-hati!" |
| Bu Bidan Tari | Motor matic, tas medis | Keliling desa | "Ada yang sakit? Posyandu besok ya." |

### Pantai selatan

| NPC | Sosok | Jadwal | Bubble contoh |
|---|---|---|---|
| Pedagang kelapa muda | Golok, gerobak | Pantai Lintang | "Kelapa muda, langsung dari pohon!" |
| Petugas SAR Bayu Laut | Kaus merah, peluit | Pos SAR | "Lewat tanda merah, saya tarik pakai tali!" |
| Penjual ikan TPI (4) | Ember, timbangan | TPI 04.00-08.00 | "Tongkol segar! Kakap! Murah!" |
| Pelukis pasir Gede | Rambut gimbal | Pantai Watu Sepi | "Pantai ini cuma buat yang tahu." |
| Penjaga jalur bakau | Topi rimba | Jalur kayu bakau | "Jangan buang sampah, kepiting juga punya rumah." |
