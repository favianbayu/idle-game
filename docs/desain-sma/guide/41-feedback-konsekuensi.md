# 41. Feedback & Konsekuensi

Setiap tindakan memberi **feedback langsung** (angka melayang, suara, ekspresi NPC, getar layar ringan) dan
**konsekuensi jangka panjang** (reputasi, hubungan, cerita, ending).

## Feedback visual & suara

| Jenis | Tampilan |
|---|---|
| Hati naik | Ikon hati merah muda melayang + angka "+20", suara "ting" lembut, partikel kelopak |
| Hati turun | Hati retak abu-abu, angka merah "-40", suara "dung" rendah |
| Uang masuk/keluar | Koin kuning "+Rp 8.000" / merah "-Rp 15.000", suara gemerincing |
| Statistik naik | Panah hijau + nama stat ("Kelincahan +1"), jingle singkat |
| Reputasi berubah | Ikon wilayah dengan bar warna (hijau/merah) di pojok kanan atas 2 detik |
| Pelanggaran sekolah | Stempel merah "PELANGGARAN +10" ala buku BK |
| Gosip menyebar | Ikon telinga ungu di peta HP, notifikasi "Ada gosip baru tentang kamu" |
| Energi rendah | Layar sedikit desaturasi, langkah pemain melambat, animasi menguap |
| Mood rendah | Awan kecil di atas kepala, bonus mini game -10% |

## Reputasi

Lima reputasi terpisah, masing-masing -100 sampai +100:

| Reputasi | Naik dari | Turun dari | Efek |
|---|---|---|---|
| **Sekolah** (guru) | Nilai, tepat waktu, OSIS, sopan | Bolos, berantem di sekolah, telat, menyontek | Remedial lebih mudah, guru membantu Bab 13 |
| **Siswa** (teman) | Membela teman, menang berantem adil, traktir, ramah | Menyontek ketahuan, pengadu, pelit | Teman ikut misi, gosip positif |
| **Jalanan** (geng) | Menang balap, misi geng, setia | Kabur saat teman dikeroyok, melanggar aturan | Akses balap, bantuan keroyokan, harga motor |
| **Warga** (kampung/kota) | Membantu warga, kerja bakti, ronda, warkop jujur | Ugal-ugalan, berantem di kampung, mencuri | Diskon, info, dukungan aksi Bab 13 |
| **Usaha** | Kualitas kopi, ketepatan, pelanggan puas | Basi, telat buka, kasar ke pelanggan | Pelanggan lebih banyak, harga jual naik |

## Tabel tindakan dan akibat

| Tindakan | Akibat langsung | Akibat jangka panjang |
|---|---|---|
| **Bolos 1 pelajaran** | Waktu luang 1 slot, Mood +5 | Nilai pelajaran itu -5, risiko ketahuan Pak Wawan 30% (pelanggaran +10) |
| **Bolos sehari** | Waktu luang penuh | Surat panggilan orang tua (Om Darto) setelah 3x, Nadia/Tegar -20 |
| **Telat** | Berdiri di depan kelas atau push-up 10x (mini game) | 5x telat = hukuman menyapu (animasi sapu, 1 slot sore hilang) |
| **Menyontek** | Nilai ulangan +15 | Ketahuan 40%: nilai 0, pelanggaran +25, reputasi Sekolah -15 |
| **Berantem di sekolah** | Statistik Nyali +, uang palakan kembali | Pelanggaran +20, skors 3 hari kalau poin > 100 |
| **Berantem membela orang** | Reputasi Siswa +10, hati yang dibela +40 | Pelaku dendam (misi balasan) |
| **Mengeroyok / memukul yang jatuh** | Menang cepat | Reputasi Siswa & Warga -15, Wulan/Nadia -40 |
| **Kabur dari berantem** | Aman | Reputasi Jalanan -10, kalau meninggalkan teman: -25 dan teman itu -60 |
| **Balap liar** | Uang taruhan, Nyali + | Razia 25%: motor ditahan 3 hari, denda Rp 100.000, Om marah |
| **Kecelakaan balap** | Pingsan, bangun di klinik | Biaya Rp 150.000, kehilangan 2 hari, Bimo bisa celaka (Bab 9) |
| **Ngebut di kampung** | Cepat sampai | Reputasi Warga -5 per kejadian, Pak RT menegur |
| **Tidak bayar Pak Gito** | Uang aman minggu itu | Bunga +10%, 3x = warkop dirusak (level turun 1) |
| **Menolak masuk Lampu Kota** | Jalur "anak lurus" | Misi OSIS & warga lebih banyak, sekutu Bab 13 lebih sedikit |
| **Pacaran ganda ketahuan** | Event konfrontasi kantin | Semua pacar -2 hati, gosip seminggu |
| **Lupa janji kencan** | - | -150 hati, NPC tidak mau diajak 7 hari |
| **Lupa ulang tahun Cici / NPC 6+ hati** | - | -30, ekspresi `sedih` saat bertemu |
| **Tidur larut (lewat 00.00)** | Waktu ekstra | Energi besok maks 70, ngantuk di kelas (mini game lebih sulit) |
| **Tidak makan seharian** | Hemat uang | Kenyang 0: pingsan di sekolah, dibawa ke UKS, Mood -20 |
| **Mandi & ganti baju** | Kebersihan penuh | Pesona +1 sementara untuk hari itu |
| **Membantu warga (misi kecil)** | Uang kecil atau item | Reputasi Warga +5, gosip positif |
| **Kerja bakti / ronda** | Uang Rp 0, tapi Pak RT senang | Reputasi Warga +10, event warga |
| **Menjawab telepon Ibu dengan jujur** | Kadang Ibu sedih soal nilai | Mood stabil; berbohong 3x = event Ibu datang ke kota mendadak |

## Konsekuensi cerita dan ending

| Akumulasi | Pengaruh |
|---|---|
| Rata-rata nilai < 60 di semester | Tidak naik kelas: ulang setahun (konten tambahan, Bram ikut seangkatan lagi) |
| Poin pelanggaran > 200 | Dikeluarkan sekolah: ending "Anak Jalanan" (kecuali Bu Hartini 6+) |
| Reputasi Jalanan > 70 dan Sekolah < 0 | Ending "Raja Jalanan" |
| Warkop level 5 & utang lunas | Ending "Juragan Kopi" |
| Nilai rata-rata > 90 & Bu Hartini 8 | Ending "Beasiswa" |
| Sekolah terselamatkan (Bab 13) dengan semua sekutu | Ending "Lonceng Pulang" (ending terbaik) |
| Pacaran di event 8 hati | Epilog romance khusus tokoh tersebut ditambahkan ke ending apa pun |
