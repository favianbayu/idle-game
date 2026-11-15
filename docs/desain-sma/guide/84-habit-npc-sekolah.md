# 84. Habit NPC di Sekolah

Sekolah harus terasa hidup tanpa pemain berbuat apa-apa. Setiap NPC (utama, pendukung, pengisi, dan siswa acak) mengikuti
**jadwal per jam**, punya **kelompok** tempat dia biasa berkumpul, dan punya **kebiasaan kecil** yang terlihat.

## Populasi

| Jenis | Jumlah di layar | Keterangan |
|---|---|---|
| Siswa acak (generik) | 60-90 di halaman, 20-24 per kelas | Dibuat dari kombinasi gaya voxel (rambut, hijab, tas, sepatu); nama acak dari daftar |
| NPC utama & pendukung | Sesuai jadwal masing-masing | Lihat segmen 10-30 |
| Guru | 12 | Mengajar sesuai jadwal pelajaran, sisanya di ruang guru |
| Staf | 6 | Satpam Udin, Pak Ujang, Bu Kantin Ningsih + 4 penjual kantin, petugas TU |

## Jadwal harian sekolah

| Jam | Di mana NPC berada | Yang terjadi |
|---|---|---|
| 05.30 | Pak Ujang membuka gerbang, menyapu halaman | Daun kering, lampu dimatikan |
| 06.15-06.55 | Gerbang, parkiran, plaza, kantin | Siswa berdatangan: jalan kaki bergerombol, motor antre masuk parkiran, ojek berhenti di trotoar. Kantin melayani sarapan. Nadia & Tegar sudah di kelas |
| 06.55 | Gerbang | Satpam berteriak hitung mundur; siswa berlari; telat = berbaris di samping pos |
| 07.00-07.45 (Senin) | Lapangan upacara | Barisan per kelas di titik barisan, guru di depan selasar, petugas upacara. Siswa belakang bisik-bisik, satu siswa acak bisa pingsan |
| 07.00-09.30 | Kelas | Pelajaran. Koridor kosong; Pak Wawan patroli tiap 30 menit; 1-2 siswa acak ke toilet |
| 09.30-10.00 | Kantin, lapangan, beringin, balkon | Istirahat 1: antre kantin, futsal kecil di lapangan basket, gosip di beringin, cowok duduk di pagar balkon |
| 10.00-12.00 | Kelas, lab, lapangan (Penjaskes) | Kelas Penjaskes lari keliling lapangan upacara |
| 12.00-12.30 | Musala, kantin | Salat zuhur bergiliran, sisanya makan siang |
| 12.30-14.00 | Kelas | Siswa mengantuk (animasi `sleep_desk` acak) |
| 14.00 | Gerbang, parkiran | Bel pulang: arus keluar, motor menyala bersamaan, geng Bram nongkrong di parkiran guru |
| 14.30-17.00 | Lapangan, aula, Gedung C, OSIS | Ekskul. Halaman separuh kosong |
| 17.00-17.30 | Gerbang | Siswa ekskul pulang, satpam mengunci gerbang samping |
| 17.30-05.30 | Pos satpam, keliling | Sekolah kosong. Pak Ujang keliling 21.00 & 01.00 dengan senter; satpam tidur di pos setelah 23.00 |

Jumat: pulang 11.30, siang sepi. Sabtu: ekskul dan latihan pensi saja. Minggu: tutup (kecuali event).

## Kelompok & tempat nongkrong

| Kelompok | Anggota | Tempat (istirahat) | Kebiasaan |
|---|---|---|---|
| Anak OSIS | Nadia, Rizal + 4 acak | Ruang OSIS, selasar depan Gedung A | Membawa map, menempel pengumuman, menegur siswa yang buang sampah |
| Geng Bram | Bram, Rio, Kevin, Sasha | Meja pojok kantin, parkiran guru saat pulang | Menyerobot antrean, menyandarkan diri di mobil guru, Kevin main HP, Rio iseng menendang tas siswa kelas X |
| Anak futsal | Uti + 6 acak | Lapangan basket & futsal | Main futsal pakai sepatu sekolah, bola sering keluar lapangan (pemain bisa menendang balik) |
| Anak basket | Dimas + 5 acak | Lapangan basket, tribun aula | Latihan menembak, adu three-point |
| Anak band | Sekar + 3 acak | Tangga belakang Gedung B, studio musik | Gitar akustik, bernyanyi pelan |
| Anak mading | Jojo + 2 acak | Kantin meja tengah, plaza | Memotret, mencatat gosip, memasang foto di mading |
| Kutu buku | Tegar + 4 acak | Perpustakaan, bangku plaza | Membaca berjalan, menabrak orang |
| Duo gosip | Fitri & Rina (X-3) | Koridor lt1, toilet | Bisik-bisik, menunjuk ke pemain kalau ada gosip tentangnya |
| Anak kantin | Bimo, Laras + acak | Kantin | Bimo mencicipi semua lapak, Laras menawarkan nasi uduk sisa |
| Anak belakang | Arga + 2 acak | Belakang Gedung Lama, pagar utara | Duduk jongkok, keluar-masuk lewat titik loncat pagar |
| Pasangan | 2-3 pasang acak | Beringin, tangga belakang | Duduk berdua, berpisah kalau guru lewat |

## Kebiasaan kecil siswa acak

Dipilih acak per NPC (1-2 kebiasaan) supaya kerumunan tidak seragam:

- Berjalan sambil main HP lalu hampir menabrak tiang.
- Menyeret tas di lantai.
- Berlari kecil saat bel berbunyi.
- Merapikan rambut di kaca jendela.
- Membeli es lalu membagi dengan teman.
- Duduk di pagar balkon (ditegur guru kalau terlihat).
- Main lempar-tangkap botol.
- Tidur di bangku selasar.
- Mengerjakan PR di kantin menyontek teman.
- Menyapu kelas saat jadwal piket.
- Ikut menonton kalau ada keributan (kerumunan melingkar).

## Guru & staf

| Tokoh | Habit di sekolah |
|---|---|
| Bu Hartini | Berdiri di portiko saat pagi menyalami siswa (salim), lalu di ruangannya; sore keliling sekali |
| Bu Ratna | Datang paling awal di antara guru, memeriksa PR di ruang guru, galak di koridor (bubble "Masuk kelas!") |
| Pak Hendro | Peluit di leher, di lapangan setiap jam Penjaskes dan sore, minum kopi di kantin |
| Pak Wawan | Patroli koridor tiap 30 menit dengan rute tetap (lt1 → lt2 → lt3 → kantin → belakang Gedung Lama); berhenti di titik loncat pagar pukul 10.00 |
| Bu Sinta | Di ruang mading saat istirahat, membaca draf Rizal & Jojo |
| Mr. Anton | Mengobrol santai dengan siswa di selasar, sering bercanda pakai bahasa Inggris |
| Pak Gunadi | Hampir tidak keluar lab; sesekali asap keluar dari jendela lab (lucu) |
| Bu Melati | Di studio musik atau ruang seni, menyiram tanaman di selasar Gedung C |
| Pak Ujang | Menyapu halaman pagi, membersihkan selokan siang, mengunci semua pintu sore, keliling malam |
| Satpam Udin | Di pos atau gerbang, menyapa siswa per nama, tidur di kursi saat siang |
| Penjual kantin | Berteriak menawarkan dagangan saat istirahat, menghitung uang setelahnya |

## Reaksi kerumunan terhadap pemain

| Kejadian | Reaksi NPC sekolah |
|---|---|
| Berantem di lapangan / koridor | Siswa membentuk lingkaran penonton dan bersorak; setelah 20 detik ada yang memanggil guru; Pak Wawan datang dalam 30-40 detik |
| Pemain telat & lari | Siswa di balkon menyoraki "Ayo, ayo!" |
| Pemain menang lomba / juara | Tepuk tangan di upacara, siswa acak menyapa pemain beberapa hari |
| Gosip tentang pemain | Duo gosip menunjuk, siswa acak berbisik saat pemain lewat |
| Pemain jalan bersama tokoh romance | Siswa acak berkomentar "Ciee...", gosip naik |
| Pemain membuang sampah sembarangan | Anak OSIS menegur, reputasi Sekolah -2 |
| Pemain menolong siswa yang dipalak | Siswa itu jadi "pengikut" yang menyapa dan memberi info kecil |
| Hujan tiba-tiba | Semua lari ke selasar, beberapa siswa sengaja hujan-hujanan di lapangan |

## Event kecil acak di sekolah (1-2 per hari)

| Event | Lokasi | Kesempatan |
|---|---|---|
| Bola futsal masuk ke kelas | Gedung B lt1 | Kembalikan bola: hati anak futsal + |
| Siswa pingsan saat upacara | Lapangan | Bantu bawa ke UKS: reputasi Sekolah + |
| Kucing masuk kantin | Kantin | Kejar kucing (mini game), Sasha tertawa |
| Kunci kelas hilang | Koridor | Cari kunci untuk Pak Ujang |
| Listrik padam | Satu gedung | Pelajaran dibatalkan, siswa keluar ke balkon |
| Penjual baru di gerbang | Trotoar | Jajanan baru untuk kado |
| Kakak kelas memalak | Toilet / belakang gedung | Bela atau abaikan |
| Pengumuman lomba di mading | Taman mading | Membuka lomba |
