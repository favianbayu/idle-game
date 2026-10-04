# Aset environment Rimbasari

Pixel art environment untuk prototype dan game: pohon, tanaman ladang (5 tahap tumbuh),
batu dan bijih, puing (sisa Kebun Warisan yang rusak), semak dan bunga, ubin tanah, dan
rumah karakter utama. Gayanya mengikuti tampilan Stardew Valley (hanya gaya: semua sprite
digambar orisinal lewat kode, tidak ada sprite Stardew yang dipakai, ditrace atau diwarnai ulang).

Semua file dibuat ulang dengan:

    python3 tools/envart/build.py --out assets/environment [--char frame_karakter.png]

`--char` hanya untuk menaruh karakter di `preview.png` sebagai pembanding skala.

## Piksel 2 x 2 dan gaya Stardew

Tiap piksel art digambar 2 x 2 piksel layar (ukuran sprite tetap, pikselnya lebih "chunky").
Sprite digambar di resolusi art lalu diperbesar 2x, jadi outline, bayangan dan tekstur rapi
satu blok. `environment.json` punya field `"pixel": 2`.

Ciri gaya yang dipakai (mengikuti referensi Stardew):

- Palet 8 nada per bahan, jenuh: bayangan gelap kebiruan, highlight hangat, cahaya dari kiri
  atas, outline gelap di semua sprite.
- Daun: mahkota pohon dan semak terdiri dari banyak "cap" daun kecil di atas isian gelap,
  diarsir per posisi (atas kiri terang, bawah kanan gelap), ranting kelihatan di sela daun.
- Kayu: batang cokelat keemasan dengan guratan vertikal, akar di kaki batang.
- Batu: bongkahan dengan beberapa bidang (facet), tepi atas kiri terang, retakan dan bintik;
  bijih berupa butiran mengkilap.
- Rumput liar: helai 1 piksel, gelap di pangkal dan terang di ujung.
- Ubin: rumput dengan petak dua nada dan tanda helai rumput, tanah olah bergumpal, jalan
  tanah berkerikil, jalan batu bulat, plus air, air dalam, sawah, lumpur, pasir, lantai batu,
  tanah kosong, batas peta, lantai dan dinding gua, dan jurang. Tekstur dihitung dari posisi
  dunia, jadi ubin sejenis bisa bersebelahan tanpa sambungan; ketiga ubin rumput berbagi pola
  dasar yang sama, jadi boleh dicampur ubin per ubin.
- Rumah: genteng persegi bertingkat dengan tepi atas terang dan bintik, dinding papan, umpak batu.

`compare_chibi_vs_stardew.png` membandingkan gaya chibi sebelumnya dengan yang sekarang.
Gaya chibi dan realistis yang lama ada di riwayat git (commit `fa71365` dan `cf74631`).

## Skala dan grid

- Ubin isometrik 2:1, **96 x 48 px** (sama dengan `Iso.TILE_W` / `TILE_H` di prototype).
- Karakter sekitar 80 px tinggi; pintu rumah 84 px, pohon besar 150 - 190 px.
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
| `pohon/` | mangga, mangga_berbuah, pohon_hutan, jati, pohon_kemarau, kelapa, pisang, bibit_0-2, tunggul, tunggul_besar, tunggul_tua (2 x 2) |
| `tanaman/` | padi, jagung, cabai, tomat, terong, semangka |
| `batu/` | batu_kecil, batu_kecil_2, batu_lumut, batu_besar, bijih_tembaga, bijih_besi, bijih_emas, bijih_permata, kerikil |
| `puing/` | ranting, daun_kering, kayu_tumbang, peti, peti_rusak, papan_patah, pagar_bambu, pagar_bambu_rusak, reruntuhan_bata, tembok_runtuh, tiang_lapuk |
| `vegetasi/` | rumput_liar, rumput_daun, pakis, alang_alang, semak, semak_buah, semak_kembang_sepatu, semak_melati, bunga_liar_kuning, bunga_liar_merah_muda |
| `tanah/` | rumput_0-2, tanah_olah, tanah_olah_basah, jalan_tanah, jalan_batu, tanah_kosong, batas, air, air_dalam, sawah, lumpur, pasir, lantai, lantai_gua, dinding_gua, jurang |

`catalog.png` menampilkan semuanya dalam satu lembar, `preview.png` menampilkan contoh
pojok kebun.

## Ke prototype Godot

`python3 tools/envart/export_rimbasari.py <folder Rimbasari>` mengemas aset ini ke lembar
sprite prototype 0.7 (tile tanah, 7 tanaman, puing, pohon liar, sebagian pohon desa dan
dekorasi, dan `props/rumah_utama.png`), dengan pivot tiap sprite tepat di titik jangkar
lembarnya. Pemetaannya ada di bagian atas skrip.

## Kode

`tools/envart/`: `pix.py` (kanvas, outline), `sv.py` (palet 8 nada dan kit gaya Stardew: cap
daun, mahkota, batang, menggambar di resolusi art), `iso.py` (renderer isometrik untuk
bangunan dan benda kotak),
`trees.py`, `plants.py`, `rocks.py`, `debris.py`, `tiles.py`,
`house.py`, `build.py`. Butuh Python 3, Pillow dan NumPy.
