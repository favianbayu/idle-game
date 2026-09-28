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
- **Naik Kelas:** syarat pendapatan di kota itu + jumlah menu aktif → gedung, kostum dan menu berubah,
  dapat Bintang Rasa (+2% pendapatan per bintang).
- **Misi:** 3 misi bergilir dengan hadiah koin/Bintang Rasa + album pelanggan langka.
- **Peta:** buka dan pindah ke Bandung, Bali, Surabaya (tiap kota mulai dari gerobak dengan menu khasnya).
- **Boost Rempi** (mulai stage 2): pendapatan ×2 selama 30 detik.
- **Siklus waktu** pagi → siang → sore → malam (2 menit per siklus), awan, burung, kunang-kunang,
  kadang hujan di malam hari.
- **Malam hari**: gedung gelap tapi jendela, interior, papan nama dan neon menyala (dengan pendar).
- **Hujan**: pelanggan datang pakai payung, motor pakai jas hujan, gerobak sayur ditutup terpal.
- **Yang lewat**: kucing oren (tap untuk elus, dapat bonus), ayam kampung, motor ojek & keluarga
  ("TIN TIN!", lampu depan menyala saat malam), tukang sayur ("SAYUUUR!").
- **Penghasilan offline** saat kembali membuka game (maks 8 jam, 50%).
- **Pengaturan:** mode tes pelanggan langka (peluang ×25), paksa waktu (pagi/siang/sore/malam), paksa hujan, dan reset progres.

Progres disimpan di `localStorage` browser. Semua angka ekonomi masih angka awal untuk dicoba.
