# Prototipe Gerobak Empire

Prototipe web yang bisa dimainkan, dibangun dari aset di `assets/`.

**Jalankan lokal:** `cd prototype && python3 -m http.server 8000`, lalu buka http://localhost:8000
(harus lewat server, bukan dibuka langsung sebagai file, karena game memuat `data.json`).

Isi folder:
- `index.html` + `game.js`: game (HTML/CSS untuk panel, canvas 224×256 untuk adegan).
- `atlas0.png`, `atlas1.png`, `data.json`: aset yang dipak oleh `tools/sprites/prototype_pack.py`
  (ikut dibuat ulang saat menjalankan `python3 tools/gen_sprites.py`).

## Yang bisa dicoba

- **Tap adegan** untuk mempercepat masak: muncul koin + ikon makanan yang sedang dimasak.
- **Pelanggan** datang, memesan (gelembung + ikon menu + batas sabar), dilayani otomatis saat masakan
  selesai, senang lalu bayar. Kalau kelamaan menunggu, mereka kesal dan pergi tanpa bayar.
- **Racikan:** upgrade level menu, buka menu terkunci pakai koin (spesial/legendaris ungu), lihat kombo aktif.
- **Karyawan:** Juru Masak (masak lebih cepat), Kasir (pelanggan lebih sering), Pelayan (tap otomatis).
- **Naik Kelas:** 4 syarat: pendapatan di kota itu, jumlah menu aktif, total level menu aktif
  (6 / 14 / 26 / 44), dan biaya renovasi yang dibayar pakai koin. Syarat naik x10 tiap stage dan
  x10 tiap kota (+50% per kota). Estimasi (simulasi): satu kota ±70 menit kalau aktif nge-tap,
  ±2 jam kalau dibiarkan. Hadiah: gedung, kostum dan menu berubah + Bintang Rasa (+2% pendapatan per bintang).
- **Misi:** 3 misi bergilir dengan hadiah koin/Bintang Rasa + album pelanggan langka.
- **Peta:** buka dan pindah ke Bandung, Bali, Surabaya (tiap kota mulai dari gerobak dengan menu khasnya).
- **Boost Rempi** (mulai stage 2): pendapatan ×2 selama 30 detik.
- **Siklus waktu** pagi → siang → sore → malam (2 menit per siklus), awan, burung, kunang-kunang,
  kadang hujan di malam hari.
- **Malam hari**: gedung gelap tapi jendela, interior, papan nama dan neon menyala (dengan pendar).
- **Hujan**: pelanggan datang pakai payung, motor pakai jas hujan, gerobak sayur ditutup terpal.
- **Yang lewat** (sesekali, tiap ±25-50 detik): kucing oren & ayam kampung (tap = keluar hati + bonus
  kecil), motor ojek & keluarga ("TIN TIN!", lampu depan menyala saat malam), tukang sayur ("SAYUUUR!").
- **Yang lewat khas kota** (tap = sapaan balik + bonus sekali): Jakarta ondel-ondel ngamen & bajaj,
  Bandung delman & pengamen angklung, Bali iring-iringan gebogan & monyet pencuri kacamata (tap = love),
  Surabaya becak & sepeda kerupuk, plus tukang bakso "TING TING" di semua kota (juga malam).
- **Hari besar sesuai tanggal** (pendapatan +20% selama event, ikon event di HUD):
  17-an (1-31 Agustus: umbul-umbul merah putih, bendera berkibar, pelanggan berkaos merah/putih +
  ikat kepala, karakter utama pakai selempang & bendera kecil, lomba balap karung lewat, kembang api malam),
  Hari Batik (1-4 Okt), Hari Pahlawan (8-12 Nov), Natal (20-27 Des: lampu kelap-kelip, pohon natal,
  topi santa), Tahun Baru (28 Des-2 Jan: topi pesta, kembang api tiap malam), Hari Kartini (19-23 Apr:
  kebaya + bunga di rambut), Lebaran (H-7 s/d H+7, tabel 2025-2030: ketupat, baju koko + peci),
  Imlek (H-3 s/d Cap Go Meh, tabel 2025-2030: lampion, baju merah, barongsai lewat),
  Galungan-Kuningan (siklus 210 hari, hanya di Bali: penjor, udeng & baju putih).
- **Suara**: efek chiptune WebAudio (tanpa file audio) untuk tap, koin, beli/buka menu, upgrade,
  naik kelas, tab & tombol, boost, pelanggan langka, suara hewan, klakson, "ting ting" bakso,
  angklung, gamelan, tambur barongsai, kembang api. Tombol speaker di HUD untuk bisu/nyala.
- **Penghasilan offline** saat kembali membuka game (maks 8 jam, 50%).
- **Pengaturan:** mode tes pelanggan langka (peluang ×25), paksa waktu (pagi/siang/sore/malam), paksa hujan,
  efek suara, pilih hari besar untuk preview (atau "ikut tanggal"/"matikan"), dan reset progres.

Progres disimpan di `localStorage` browser. Semua angka ekonomi masih angka awal untuk dicoba.
