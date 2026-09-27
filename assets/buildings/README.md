# Bangunan per stage — pixel art

Hasil generate dari `tools/sprites/buildings.py` (jalankan `python3 tools/gen_sprites.py`).
Skala pixel-nya sama dengan karakter (tokoh utama 32×40), jadi karakter bisa langsung berdiri di depan bangunan.

| Stage | Folder | Ukuran | Isi | Animasi (frame1 ↔ frame2) |
|---|---|---|---|---|
| 1 | `stage1_gerobak` | 80×64 | Gerobak kayu, etalase kaca berisi lauk, wajan nasi goreng, atap seng karatan, bohlam, kerupuk gantung, roda jari-jari | asap wajan naik, bohlam berpendar |
| 2 | `stage2_warung_tenda` | 160×112 | Tenda terpal biru, spanduk "WARUNG", lampu tumblr, meja taplak kotak-kotak, kaleng kerupuk, es teh, bangku, gerobak stage 1 di dalam | lampu tumblr kedip bergantian, asap + kelip Rempi |
| 3 | `stage3_ruko` | 144×176 | Ruko 2 lantai, papan "KEDAI", kanopi garis emas, jendela nako, AC, toren air, etalase, kursi plastik merah | asap cerobong dapur, lampu gantung nyala/redup |
| 4 | `stage4_resto_modern` | 176×192 | Gedung dengan grid jendela, neon "RESTO", dinding kaca + pengunjung, pintu kaca, pot tanaman | huruf neon kedip, lampu jendela ganti-ganti |
| 5 | `stage5_istana_rasa` | 208×224 | Istana beratap tumpang emas di pulau melayang, paviliun, penjor, kristal, akar gantung, Bara Api Legenda di puncak | pulau mengambang naik-turun 1px, api & kilau bergerak |

Tiap folder: `frame1.png`, `frame2.png` (1x, transparan), versi `@4x`, dan `preview.gif` (loop 500ms).

`buildings.json` berisi ukuran, `ground_y` (baris tanah), dan `vendor_spot` (titik kaki tokoh utama,
relatif ke kiri-atas gambar bangunan; boleh di luar gambar, misalnya di samping gerobak).

`scene_preview.png` = gambaran tiap stage lengkap dengan langit, tokoh utama, Rempi & NPC.
Langit/tanah di preview itu cuma placeholder, background final belum dibuat.

Teks papan nama (`NASI GORENG`, `WARUNG`, `KEDAI`, `RESTO`) digambar pakai font pixel di
`tools/sprites/draw.py`, jadi gampang diganti kalau nama usahanya sudah ditentukan.
