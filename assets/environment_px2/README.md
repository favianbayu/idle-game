# Aset environment Rimbasari

Pixel art environment untuk prototype dan game: pohon, tanaman ladang (5 tahap tumbuh),
batu dan bijih, puing (sisa Kebun Warisan yang rusak), semak dan bunga, ubin tanah, dan
rumah karakter utama. Gaya mengacu ke Stardew Valley (outline berwarna, bayangan kebiruan,
highlight hangat, cahaya dari kiri atas) tapi semua digambar orisinal lewat kode, tidak ada
sprite Stardew yang dipakai.

Semua file dibuat ulang dengan:

    python3 tools/envart/build.py --out assets/environment [--char frame_karakter.png]

`--char` hanya untuk menaruh karakter di `preview.png` sebagai pembanding skala.

## Versi piksel 2 x 2

`assets/environment_px2/` berisi aset yang sama dengan ukuran sprite yang sama, tapi tiap
piksel art digambar 2 x 2 piksel layar (lebih "chunky"). Dibuat dengan:

    python3 tools/envart/build.py --out assets/environment_px2 --pixel 2

Ini bukan hasil resize: bentuknya digambar ulang langsung di grid 2 x 2, jadi outline, bayangan
dan tekstur tetap rapi satu blok. Struktur folder dan `environment.json` sama (ada field
`"pixel": 2`); ukuran hasil trim bisa beda beberapa piksel dari versi 1 x 1.

## Skala dan grid

- Ubin isometrik 2:1, **96 x 48 px** (sama dengan `Iso.TILE_W` / `TILE_H` di prototype).
- Karakter sekitar 80 px tinggi; pintu rumah 84 px, pohon besar 150 - 200 px.
- Cahaya dari kiri atas: sisi SW bangunan terang, sisi SE teduh.

## environment.json

Setiap aset punya `file`, `size`, `pivot` dan `footprint` (jumlah ubin, [x, y]).

- `pivot`: piksel yang diletakkan di titik tanah tempat benda berdiri. Untuk benda satu
  ubin, letakkan pivot di tengah ubin: `Iso.grid_to_screen(Vector2(gx + 0.5, gy + 0.5))`.
  Di Godot: `Sprite2D.centered = false`, `offset = -pivot`.
- Tanaman (`tanaman/*.png`) berupa strip 5 frame 64 x 80: benih, tunas, muda, dewasa, panen.
  Pivot berlaku per frame. Pakai `hframes = 5` dan ganti `frame` sesuai tahap.
- Rumah: `rumah_utama_sw` (pintu di sisi SW) dan `rumah_utama_se` (pintu di sisi SE),
  footprint 5 x 4 / 4 x 5 ubin. `grid_origin` adalah sudut utara footprint, jadi
  posisi sprite = `Iso.grid_to_screen(rect.position) - grid_origin`. `door_cell` adalah ubin
  di depan anak tangga, tempat karakter masuk dan keluar.

Bayangan kontak (semi transparan) sudah termasuk di tiap sprite.

## Daftar

| Folder | Isi |
| --- | --- |
| `bangunan/` | rumah_utama_sw, rumah_utama_se |
| `pohon/` | mangga, mangga_berbuah, pohon_hutan, jati, pohon_kemarau, kelapa, pisang, bibit_0-2, tunggul, tunggul_besar |
| `tanaman/` | padi, jagung, cabai, tomat, terong, semangka |
| `batu/` | batu_kecil, batu_kecil_2, batu_lumut, batu_besar, bijih_tembaga, bijih_besi, bijih_emas, bijih_permata, kerikil |
| `puing/` | ranting, daun_kering, kayu_tumbang, peti, peti_rusak, papan_patah, pagar_bambu, pagar_bambu_rusak, reruntuhan_bata, tembok_runtuh, tiang_lapuk |
| `vegetasi/` | rumput_liar, rumput_daun, pakis, alang_alang, semak, semak_buah, semak_kembang_sepatu, semak_melati, bunga_liar_kuning, bunga_liar_merah_muda |
| `tanah/` | rumput_0-2, tanah_olah, tanah_olah_basah, jalan_tanah, jalan_batu |

`catalog.png` menampilkan semuanya dalam satu lembar, `preview.png` menampilkan contoh
pojok kebun.

## Kode

`tools/envart/`: `pix.py` (kanvas, palet, outline), `iso.py` (renderer isometrik untuk
bangunan dan benda kotak), `trees.py`, `plants.py`, `rocks.py`, `debris.py`, `tiles.py`,
`house.py`, `build.py`. Butuh Python 3, Pillow dan NumPy.
