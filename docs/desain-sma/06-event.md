# Event di Dunia Game

Event membuat Wirabumi terasa hidup: sebagian terjadi tiap hari pada jam yang sama, sebagian mengikuti kalender,
sebagian acak, dan sebagian bagian dari cerita. Pemain diberi tahu lewat **HP** (grup kelas, Kabarin, chat), **papan mading**,
**obrolan NPC**, atau langsung melihatnya di jalan.

## Cara kerja (untuk programmer)

- **Penjadwal event** dicek tiap jam game. Tiap event punya: `id`, `jenis`, `syarat` (tanggal, jam, cuaca, bab cerita, reputasi,
  hubungan), `lokasi`, `durasi`, `peluang`, `prioritas`, dan `hadiah/akibat`.
- **Prioritas**: cerita > kalender > mingguan > sosial > acak. Kalau dua event bentrok di jam yang sama, yang prioritasnya
  rendah digeser ke hari lain atau batal.
- **Event yang terlewat**: event kalender & cerita tetap berjalan tanpa pemain (dengan akibatnya, misal tidak ikut upacara =
  poin pelanggaran). Event acak hilang begitu saja, tapi gosipnya tetap terdengar.
- **Ikon peta**: event aktif muncul sebagai ikon kecil di peta HP (tanda seru kuning = bisa ikut, merah = bahaya, hati = romance).
- **Kalender hari libur nasional** bisa memakai sistem hari libur berdasarkan tanggal yang sudah ada di cabang idle game.

---

## 1. Event harian (rutinitas)

| Jam game | Event | Lokasi | Yang terjadi | Akibat/kesempatan |
|---|---|---|---|---|
| 05.00 | Azan subuh & pasar buka | Masjid, pasar | Pedagang menurunkan barang, lampu pasar menyala | Kerja bantu pasar, bertemu Laras |
| 06.00-06.50 | Berangkat sekolah | Seluruh kota | Jalan dipenuhi siswa berseragam, angkot penuh, motor | Nebeng teman, balapan kecil ke sekolah |
| 06.55 | Gerbang hampir tutup | Gerbang sekolah | Satpam menghitung mundur, Pak Wawan berjaga | Lari sprint, memohon, loncat pagar |
| 09.30 & 12.00 | Bel istirahat | Kantin, lapangan | Kantin ramai, antrean, lapangan dipakai main bola | Gosip, traktir, misi kecil, romance |
| 10.00 | Patroli Pak Wawan | Koridor lt 2 | Pak Wawan berkeliling | Kalau bolos di kelas lain, harus sembunyi |
| 14.00 | Bel pulang & macet | Gerbang, simpang lampu merah | Penjemput, ojek, pedagang cilok menyerbu | Kopi keliling paling laku, tantangan balap "start lampu" |
| 15.00-17.00 | Ekskul | Sekolah | Latihan futsal, band, silat, basket | Perk ekskul, romance |
| 17.30 | Senja & azan magrib | Kota | Lampu jalan menyala, anak-anak pulang ngaji | Ganti suasana jadi malam |
| 19.00-22.00 | Jam ramai warkop | Warkop Simpang | Pelanggan berdatangan bergelombang | Penghasilan terbesar, cerita pelanggan |
| 22.00 | Ronda dimulai | Pos ronda | Bapak-bapak & anggota geng ronda | Misi ronda, catur |
| 23.30 | Jalanan sepi | Jalan Lingkar | Anak motor berkumpul | Balap liar, razia polisi |

## 2. Event mingguan

| Hari | Event | Detail |
|---|---|---|
| **Senin** | **Upacara bendera** | Seluruh siswa di lapangan 07.00-07.45. Mini game baris (ritme). Terlambat = berdiri di depan. Kadang ada siswa pingsan (bantu bawa ke UKS = reputasi guru). Kadang pemain ditunjuk jadi petugas (pembawa bendera, pemimpin barisan, pembaca UUD). |
| **Rabu** | **Pramuka** | Seragam cokelat. Mini game simpul tali, semaphore, tebak sandi. Sesekali **perkemahan Sabtu-Minggu** (event kelas X). |
| **Jumat** | **Jumat bersih & batik** | Pagi semua siswa memakai batik dan membersihkan sekolah (mini game sapu & angkut sampah, sistem animasi sapu). Siang Jumatan; sekolah pulang lebih awal. |
| **Sabtu** | **Pasar malam alun-alun** | 18.00-23.00. Bianglala, komidi putar, tembak kaleng, lempar gelang, jajanan. Tempat kencan utama dan ngamen. |
| **Minggu pagi** | **Hari bebas kendaraan** | Jl. Raya Wirabumi ditutup 06.00-10.00: senam, sepeda santai, jajanan. Lomba sepeda kota kecil. |
| **Minggu** | **Liga Minggu** | Futsal kampung (lapangan bola), balap motor resmi (Jalan Lingkar, setelah Bab 9), basket 3x3. |
| **Minggu malam** | **Nonton bareng bola** | Warkop ramai kalau ada pertandingan besar, penghasilan x2, sorakan dan taruhan kecil (pemain bisa menolak). |

## 3. Event sekolah (bulanan & semester)

| Kapan | Event | Detail |
|---|---|---|
| Minggu 2 tiap bulan | **Ulangan harian** | Mini game pelajaran versi lebih sulit; nilai lebih besar bobotnya. Info bocoran ulangan bisa didapat dari grup kelas. |
| Awal semester | **Razia rambut & atribut** | Pak Wawan & guru membawa gunting. Rambut gondrong/cat = dipotong asal kalau tertangkap. Mini game kabur atau rapikan dulu di tukang cukur. |
| Acak 1x per bulan | **Razia HP & tas** | HP disita sampai pulang kalau ketahuan (tidak bisa terima pesanan kopi hari itu). |
| Tengah semester | **UTS** | 3 hari ujian, sekolah setengah hari. |
| Akhir semester | **UAS** | 5 hari ujian. Malam-malam belajar bareng di warkop. |
| Setelah UAS | **Class meeting** | Seminggu lomba antar kelas: futsal, voli, tarik tambang, cerdas cermat, menghias kelas. Juara = hadiah kas kelas & reputasi. |
| Akhir semester | **Pembagian rapor** | Om Darto datang memakai batik terbaiknya. Cutscene berbeda tergantung nilai (bangga, kecewa, lucu). |
| Sekali per tahun | **Kunjungan pengawas dinas** | Sekolah mendadak super rapi. Siswa nakal disembunyikan. Pemain bisa membantu atau mengacau. |
| Kelas XII tiap bulan | **Try out** | Simulasi ujian akhir, peringkat diumumkan di mading. |
| Kelas X | **Perkemahan pramuka** | Malam api unggun, jurit malam (horor-komedi), event romance. |
| Kelas XI | **Karyawisata Sangkala** (pengganti study tour) | Lihat Bab 8 di `guide/04-alur-cerita.md`. |
| Akhir tahun ajaran | **Pensi (pentas seni)** | Panggung di aula, band, tari, drama kelas. Pemain bisa ikut tampil, jadi kru, atau jualan. |

## 4. Kalender tahunan (musiman)

| Bulan (dalam game) | Event | Detail & aktivitas |
|---|---|---|
| **Juli** | **MPLS & tahun ajaran baru** | Anak baru berseragam SMP masih, kakak kelas OSIS memandu. Tiap tahun pemain naik peran: dipandu (X), menonton (XI), jadi kakak kelas yang dihormati/ditakuti (XII). |
| **Agustus** | **Agustusan** | Seminggu sebelum 17: gapura dicat, bendera & umbul-umbul di kampung, lampu hias. 17 Agustus: upacara, lomba (panjat pinang, balap karung, makan kerupuk, tarik tambang, bakiak, kelereng di sendok). Malam tirakatan di pos ronda. Karnaval sepeda hias di jalan raya. |
| **Agustus-September** | **Musim layangan** | Langit penuh layangan, penjual layangan musiman muncul. Layangan aduan di lapangan & atap. |
| **Oktober** | **Hari Batik (2 Okt)** | Semua NPC memakai batik, lomba desain batik di kelas Seni. |
| **Oktober** | **Sumpah Pemuda (28 Okt)** | Lomba pidato & puisi (mini game Bahasa Indonesia), drama sejarah. |
| **November** | **Hari Guru (25 Nov)** | Siswa memberi kejutan ke guru. Hadiah yang pas = hubungan dengan guru itu naik besar. |
| **November-Maret** | **Musim hujan** | Hujan sore hampir tiap hari: NPC berpayung (sudah ada), genangan, motor mogok di banjir. **Banjir Kampung Bantaran** 2-3 kali per musim: misi evakuasi, bagi-bagi nasi bungkus dari warkop (reputasi warga naik besar). Penjual jas hujan & ojek payung muncul. |
| **Desember** | **Libur semester ganjil** | 2 minggu tanpa sekolah: kerja penuh, liburan ke kebun teh, event romance khusus. |
| **31 Desember** | **Malam Tahun Baru** | Alun-alun penuh, kembang api tengah malam, konvoi motor (Lampu Kota bertugas menjaga ketertiban), ajak tokoh romance melihat kembang api dari menara pemancar. |
| **Januari-Februari** | **Musim durian & rambutan** | Pedagang buah di pinggir jalan, misi antar buah, menu warkop musiman. |
| **Imlek** | **Barongsai** | Pertunjukan barongsai di depan Ruko Pelita, lampion merah. |
| **April** | **Hari Kartini (21 Apr)** | Siswi memakai kebaya, siswa memakai beskap; lomba fashion show kelas. |
| **Mei** | **Ujian akhir & perpisahan** | (kelas XII) lihat Bab 14-15. Kelas X & XI: kenaikan kelas, corat-coret seragam dilarang tapi tetap terjadi (dikejar Pak Wawan). |
| **Juni-Juli** | **Libur kenaikan kelas** | Liburan panjang: kerja, misi kota, persiapan tahun berikutnya. |
| **Ramadan** (tanggal bergeser tiap tahun) | **Bulan puasa** | Jam sekolah lebih pendek, kantin tutup siang. Sore: **ngabuburit** di jalan raya (pasar takjil, balap liar menjelang buka = razia), **buka bersama** di warkop & sekolah, tarawih di musala. Dini hari: **sahur keliling** (anak-anak membangunkan warga dengan bedug & kentongan), warkop buka sampai sahur (penghasilan besar). |
| **Lebaran** | **Mudik & halal bihalal** | Kota mendadak sepi (banyak NPC mudik), petasan, ketupat. Pemain bisa pulang ke desa (cutscene dengan ibu) atau tetap di kota menjaga warkop. Salam tempel dari Om Darto. |
| **Idul Adha** | **Kurban** | Sapi & kambing di halaman musala, bagi-bagi daging, sate bersama satu kampung. |

## 5. Event acak di kota

Peluang per hari (bisa diatur). Kebanyakan bisa diabaikan, tapi ikut campur memberi reputasi, uang, atau teman baru.

| Event | Peluang | Lokasi | Pilihan pemain |
|---|---|---|---|
| **Copet di pasar** | 8% | Pasar | Kejar & tangkap (berantem singkat) / biarkan |
| **Maling helm** | 6% malam | Parkiran, warkop | Kejar dengan sepeda/motor |
| **Kucing nyangkut di pohon** | 5% | Kampung | Panjat (mini game keseimbangan); pemilik memberi hadiah |
| **Motor warga mogok** | 10% | Jalan mana saja | Dorong ke bengkel Fajar (uang kecil), atau perbaiki sendiri (Prakarya) |
| **Turis tersesat** | 5% | Pusat kota | Antar (perlu Bahasa Inggris), bonus tip besar |
| **Anjing galak lepas** | 3% | Perumahan | Kabur atau tenangkan dengan makanan |
| **Kebakaran kecil** | 1% | Kampung/bantaran | Bantu padamkan dengan ember berantai (mini game), reputasi warga besar |
| **Kecelakaan kecil** | 2% | Simpang lampu merah | Tolong korban ke puskesmas |
| **Mati listrik** | 4% malam | Seluruh wilayah | Kota gelap, warkop pakai lilin (suasana horor-komedi), maling beraksi |
| **Razia polisi** | 7% malam | Jalan raya, Jalan Lingkar | Motor tanpa surat/helm = ditilang (denda) atau kabur (berisiko) |
| **Tawuran pelajar** | 2% (lebih sering saat Serigala Besi bermusuhan) | Jembatan, STM | Cegah/lerai (reputasi warga & guru) atau ikut (pelanggaran besar) |
| **Kawinan kampung** | 4% akhir pekan | Kampung | Tenda biru, dangdut, prasmanan gratis, joget (animasi joget yang ada) |
| **Syuting FTV** | 1% | Alun-alun, sekolah | Jadi figuran (uang + foto langka buku tahunan) |
| **Pedagang aneh** | 3% | Acak | Penjual barang koleksi langka (stiker, kaset, layangan khusus) |
| **Badut pengamen** | 6% | Simpang | Beri uang = keberuntungan kecil hari itu |
| **Hujan es / angin kencang** | 1% musim hujan | Kota | Atap seng beterbangan, misi bantu warga memperbaiki |
| **Kerja bakti** | Minggu, 10% | Kampung | Bersihkan selokan bareng warga, sarapan bersama |
| **Arisan ibu-ibu** | 8% | Kos Bu Narti | Gosip besar menyebar ke seluruh kampung |
| **Pengajian/tahlilan** | 4% malam | Musala, rumah warga | Bantu jamuan dari warkop (pesanan besar) |

## 6. Event sosial & hubungan

| Event | Pemicu | Detail |
|---|---|---|
| **Ajakan nongkrong** | Meter persahabatan >= 3 | Sahabat mengajak lewat chat; menolak terlalu sering = meter turun |
| **Kencan khusus** | Meter hati 3, 5, 7, 9 | Lokasi & skenario unik per tokoh (lihat 02-karakter) |
| **Cemburu** | Terlihat berdua dengan tokoh romance lain | Chat dingin, adegan konfrontasi di kantin |
| **Putus** | Selingkuh ketahuan 2x atau meter < 2 | Tokoh menjauh seminggu, bisa rujuk lewat misi |
| **Gosip menyebar** | Tindakan dilihat NPC | Muncul di grup kelas setelah beberapa jam, dengan versi yang dilebih-lebihkan |
| **Minta tolong** | Acak, sesuai arc tokoh | Bimo minta antar ke dokter gigi, Tegar minta dibantu bohong ke ortu, dst. |
| **Ulang tahun** | Tanggal tetap | Kado yang disukai menaikkan meter besar; lupa = meter turun |

**Tanggal ulang tahun tokoh**

| Tokoh | Tanggal | Kado favorit |
|---|---|---|
| Om Darto | 3 Maret | Biji kopi langka |
| Cici | 14 Juni | Boneka kucing (pasar malam) |
| Bimo | 9 September | Makanan apa saja (porsi besar) |
| Tegar | 22 Januari | Buku teka-teki, bukan buku pelajaran |
| Jojo | 30 Oktober | Rol film, foto langka |
| Uti | 5 Mei | Suku cadang motor |
| Mas Fajar | 17 Desember | Kunci torsi, buku latihan paket C |
| Nadia | 12 Februari | Komik (rahasia), pulpen bagus |
| Sekar | 8 November | Senar gitar, kaset lama |
| Laras | 27 Juli | Celemek baru, jepit rambut |
| Dimas | 19 April | Bola basket bertanda tangan |
| Arga | 1 Agustus | Sarung tangan motor |
| Rizal | 2 Mei (Hari Pendidikan) | Buku cerpen, buku tulis kulit |
| Bram | 10 Desember | Hal yang tidak bisa dibeli: diajak makan di warkop (setelah arc) |

## 7. Event geng motor

| Event | Pemicu | Detail |
|---|---|---|
| **Tantangan balap** | Pangkat Anggota+, acak malam | Anggota geng lain menantang di Jalan Lingkar; taruhan uang atau wilayah |
| **Rebut wilayah** | Titik wilayah dipegang rival | Pos ronda/warung berganti bendera; rebut kembali lewat balap atau duel |
| **Konvoi** | Event kota (17-an, Tahun Baru) | Mini game menjaga formasi; disambut warga kalau tertib |
| **Anggota ditangkap** | Setelah razia | Jemput di kantor polisi, bayar denda, atau cari bukti dia tidak bersalah |
| **Pengkhianat** | Bab 7 | Salah satu anggota ternyata disuap; cari tahu siapa |
| **Ulang tahun Lampu Kota** | Tanggal tetap (20 Oktober) | Pesta di markas, cerita masa lalu Om Darto |

## 8. Event usaha (warkop & properti)

| Event | Pemicu | Detail |
|---|---|---|
| **Rombongan pelanggan** | Acak, malam | Rombongan ojek/anak futsal datang sekaligus; layani cepat untuk bonus |
| **Pesanan besar** | Acara sekolah/kampung | Katering kopi & gorengan untuk rapat OSIS, tahlilan, kerja bakti |
| **Pelanggan kritikus** | Warkop lv3+ | Food vlogger datang; layanan sempurna = pelanggan naik 20% seminggu |
| **Saingan buka** | Warkop lv2+, sekali per tahun | Kedai kopi kekinian buka di dekat situ; balas dengan menu baru atau promo |
| **Harga naik** | Acak | Harga kopi/gula naik seminggu; pilih menaikkan harga atau menanggung rugi |
| **Inspeksi kebersihan** | Warkop lv4+ | Petugas datang; kebersihan rendah = denda |
| **Pegawai sakit/cuti** | Acak | Pemain harus jaga sendiri malam itu |
| **Kucing warkop melahirkan** | Sekali, kalau punya kucing | Anak kucing bisa diberikan ke tokoh lain (hadiah hubungan) |

## 9. Event spesial & rahasia

| Event | Pemicu | Detail |
|---|---|---|
| **Malam Jumat di Gedung Lama** | Kamis malam, setelah Bab 3 | Suara lonceng samar terdengar dari Gedung Lama (ternyata angin di menara). Petunjuk awal misteri. |
| **Purnama di menara** | Bulan purnama (tiap ~30 hari) | Pemandangan terbaik dari menara pemancar; kencan purnama memberi meter hati ekstra |
| **Hantu kantin** | Acak saat pemain di sekolah setelah 18.00 | "Hantu" ternyata Pak Ujang memakai sarung di kepala; foto langka |
| **Hujan meteor** | Sekali per game, kelas XII Agustus | Semua tokoh dekat bisa diajak ke kebun teh; adegan khusus |
| **Alumni pulang** | Sekali, kelas XII | Teman lama Om Darto & Bang Jaka datang; cerita masa muda Lampu Kota |

## 10. Event cerita

Semua bab di [01-cerita.md](01-cerita.md) juga dijadwalkan sebagai event: terkunci ke tanggal tertentu dan diberi ikon bintang
di kalender HP. Contoh: Bab 4 selalu minggu 17 Agustus kelas X, Bab 8 (study tour) Februari kelas XI, Bab 14 minggu kedua April
kelas XII, Bab 15 akhir Mei kelas XII.

## Contoh satu minggu di kelas X (bulan Agustus)

| Hari | Pagi | Sore | Malam |
|---|---|---|---|
| Senin | Upacara, Matematika & Sejarah | Futsal ekskul | Warkop ramai, chat Nadia |
| Selasa | Fisika & Seni Budaya; razia HP acak | Kopi keliling; kucing nyangkut | Ronda, catur dengan Pak RT |
| Rabu | Pramuka: latihan simpul | Persiapan lomba 17-an kelas | Gapura dicat bareng warga |
| Kamis | Ulangan harian Biologi | Latihan baris petugas upacara | Malam Jumat: suara lonceng dari Gedung Lama |
| Jumat | Jumat bersih & batik | Pulang awal, layangan | Tirakatan di pos ronda |
| Sabtu (17 Agustus) | Upacara besar, pemain jadi petugas | Lomba panjat pinang & makan kerupuk | Pasar malam spesial, kencan pertama (Bab 4) |
| Minggu | Hari bebas kendaraan, karnaval sepeda hias | Futsal kampung final | Nonton bareng bola di warkop |
