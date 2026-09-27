# Tokoh Utama — sprite pixel art

Dibuat dari `tools/gen_main_character.py` (jalankan `python3 tools/gen_main_character.py`, butuh Pillow).
Kalau mau edit desainnya, ubah grid di script itu lalu generate ulang, jangan edit PNG-nya langsung.

- Kanvas asli **32×40 px**, transparan. Scale pakai nearest-neighbor (`image-rendering: pixelated`).
- Arah cahaya dari kiri-atas, outline pakai warna gelap hangat `#2a1c24` (bukan hitam pekat).
- Tiap stage punya 3 frame:
  - `idle1.png`, `idle2.png`: loop idle bounce (kepala turun 1px), ~400ms per frame
  - `tap.png`: reaksi pas di-tap (lompat 2px, muka senang, sparkle)
- `*@4x.png` = versi 128×160 buat preview/UI. `preview.gif` = contoh animasi.
- `main_character_sheet.png` = sprite sheet 96×200 (kolom: idle1, idle2, tap; baris: stage 1–5).

| Stage | Folder | Kostum |
|---|---|---|
| 1 | `stage1_kaki_lima` | Ikat kepala merah-putih, kaos hijau lumut, celemek krem belel, sutil besi |
| 2 | `stage2_warung_tenda` | Topi koki kain, kaos teal, celemek rapi berlogo, buku resep kecil |
| 3 | `stage3_kedai` | Toque pendek pita emas, seragam koki putih double-breasted, name tag |
| 4 | `stage4_resto_modern` | Toque dengan band neon cyan, jaket koki premium teal, earpiece |
| 5 | `stage5_empire` | Toque tinggi putih-emas + permata, jubah ungu dengan sabuk salib emas, sutil emas berapi, partikel pink-emas |
