# 40. Obrolan & Reaksi NPC

## Sistem dialog

- **Tiga tingkat bicara**:
  1. **Bubble** (NPC pengisi, sapaan cepat NPC utama saat lewat): 1 baris, tidak menghentikan permainan.
  2. **Dialog pendek** (tekan tombol bicara): kotak dialog di bawah, portrait 480px di kiri, 1-4 baris, 2-4 pilihan nada.
  3. **Adegan** (event hati, cerita): kamera mendekat, latar diblur, musik khusus, pilihan berbobot.
- **Nada jawaban pemain**: **Sopan**, **Santai**, **Lucu**, **Tegas**. Tiap NPC punya nada favorit (+5 bonus) dan nada
  yang dibenci (-5). Contoh: Nadia suka Sopan, benci Lucu saat serius; Gilang suka Lucu; Kirana suka Tegas; Sekar suka
  Santai.
- **Topik obrolan**: setiap hari tersedia 3 topik acak dari 10 kategori (sekolah, keluarga, hobi, makanan, gosip, cuaca,
  cita-cita, geng, cinta, kota). Topik yang disukai NPC diketahui dari obrolan sebelumnya dan ditandai bintang di HP.
- **Ingatan NPC**: NPC mengingat 5 hal terakhir yang pemain lakukan di dekatnya (menang berantem, kasih kado, bolos,
  kencan dengan orang lain) dan bisa membahasnya.

## Obrolan per tahap hubungan

| Tahap | Contoh pembuka (NPC) | Isi |
|---|---|---|
| Kenalan (0-1) | "Oh, kamu anak baru itu ya?" | Basa-basi, tanya asal, nama |
| Teman (2-3) | "Eh, kemarin kamu ke mana? Nggak kelihatan." | Hobi, cerita sekolah, gosip ringan |
| Teman dekat (4-5) | "Aku mau cerita sesuatu, tapi jangan ketawa." | Masalah keluarga, cita-cita, curhat |
| Spesial (6-7) | "Kok aku seneng ya tiap kamu dateng." | Godaan, cemburu, rencana bersama |
| Pacar / sahabat sejati (8) | "Kangen. Padahal baru ketemu tadi siang." | Rencana masa depan, panggilan sayang |

## Obrolan antar tokoh (yang bisa dilihat pemain)

NPC saling bicara saat bertemu sesuai jadwal. Pemain yang berdiri dekat bisa **menguping** (bubble ungu muncul di atas
keduanya), kadang mendapat petunjuk kado atau info event.

| Pasangan | Lokasi | Contoh obrolan |
|---|---|---|
| Nadia & Tegar | Kelas X-2 pagi | T: "Secara statistik aku datang 3 menit lebih awal." / N: "Aku sudah di sini dari tadi, kamu nggak lihat." |
| Uti & Jojo | Kantin | J: "Bah, oli di pipimu itu tren baru?" / U: "Mau gue tambahin di muka lu?" |
| Laras & Gilang | Kampung Bantaran sore | G: "Uduk sisa, Ras?" / L: "Bayar! Tetangga bukan berarti gratis!" |
| Sekar & Andra | Studio musik | A: "Bassnya selow aja ya." / S: "Hmm. Kurang pelan." |
| Bram & Sasha | Meja pojok kantin | B: "Lu belakangan sering ilang malem-malem." / S: "Bukan urusan lu." (petunjuk event Sasha) |
| Kirana & Kobar | Bengkel Wijaya | K: "Gue mau daftar balap resmi." / Kb: "Ayah bakal ngamuk." |
| Mei & Rizal | Toko Buku Pena | R: "Buku yang kemarin udah datang?" / M: "Aku simpenin! Eh, tapi aku baca duluan, maaf!" |
| Dimas & Tegar | Lapangan | D: "Main yuk sekali aja." / T: "Peluang aku kena bola di muka 87 persen." |
| Arga & Pak Ujang | Belakang Gedung Lama | PU: "Bunganya ibumu mekar, Ga." / A: "...Iya, Kek." |
| Wulan & Kirana | Terminal | W: "Kuda-kudamu di atas motor bagus." / K: "Hmph. Makasih." |
| Om Darto & Bang Jaka | Warkop malam | J: "Om, anak itu punya nyali." / D: "Jangan kamu tarik ke jalan, Jak." |
| Bimo & Laras | Pasar | B: "Resep sambelmu ditambah terasi bakar!" / L: "Ealah, sok koki!" |

## Reaksi NPC terhadap aksi pemain

Setiap NPC utama dan pendukung punya tabel reaksi. Pola umumnya:

| Aksi pemain | Reaksi umum | Pengecualian |
|---|---|---|
| Menyapa | Sapaan sesuai tahap hati | Bram sebelum 2 hati: mengabaikan |
| Memberi kado | Ekspresi sesuai kategori (favorit `jatuhcinta`/`tertawa`, suka `senyum`, biasa `biasa`, benci `marah`) | Sasha di depan geng: semua kado jadi "benci" kecuali saat sepi |
| Memberi kado kedua di hari yang sama | `bingung` "Kok kasih lagi?" (poin 0) | |
| Berantem di depannya | Nadia, Rizal, Mei `marah`/`cemas`; Uti, Kirana, Arga `senyum` kalau pemain membela orang | Wulan menilai teknik |
| Menang berantem membela orang | +20 untuk tokoh yang melihat, reputasi pahlawan + | |
| Memukul yang sudah jatuh / mengeroyok | -40 untuk semua yang melihat kecuali geng Bram | |
| Bolos | Nadia/Tegar `marah`, Bram/Gilang `tertawa`, Laras `marah` | Tegar 4+ hati menutupi |
| Telat sekolah | Pak Satpam Udin bubble, Nadia `sinis` | |
| Seragam dikeluarkan | Guru tegur, Bram/Uti suka (+gaya) | |
| Datang bau keringat/kotor (Kebersihan rendah) | Sasha `sinis`, Mei `bingung`, Uti tidak peduli | |
| Kencan dengan orang lain (terlihat) | Tokoh 6+ hati: `cemburu` (pakai `sinis` atau `sedih`), -20 | Uti menjauh 3 hari |
| Membantu orang tua menyeberang, memungut sampah | Bubble pujian, Pesona/reputasi warga + | |
| Menjual kopi di dekatnya | NPC suka kopi membeli; Tegar menolak | |
| Naik motor ugal-ugalan | Warga marah, polisi mengejar, Kirana `tertawa` | |
| Membuat Cici menangis (pilihan buruk) | Om Darto `marah`, satu hari tanpa uang saku | |
| Mendapat nilai bagus | Guru `senyum`, Nadia rival, Ibu bangga di telepon | |
| Ulang tahun NPC | NPC menunggu sapaan; kalau dilupakan dan hati 6+, `sedih` dan -30 | |

## Panggilan & chat HP

- HP punya aplikasi chat "Obrol". NPC dengan 4+ hati mengirim chat malam (19.00-22.00): sapaan, foto, ajakan.
- Pemain memilih balasan (3 pilihan). Membalas dalam 1 jam game: +5, mengabaikan 3x berturut: -10.
- Grup chat kelas X-2: info ulangan, bocoran gosip, ajakan kerja kelompok.
- Grup Lampu Kota (kalau masuk geng): misi malam, peringatan razia.
