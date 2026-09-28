# Aset Gerobak Empire

Semua aset di folder ini hasil generate dari `tools/sprites/`.
Jalankan `python3 tools/gen_sprites.py` (butuh Pillow). Jangan edit PNG-nya langsung, ubah script-nya lalu generate ulang.

| Folder | Isi |
|---|---|
| `characters/` | Tokoh utama, NPC, kit kustomisasi muka (lihat `characters/README.md`) |
| `buildings/<kota>/stageN_*` | Toko per kota per stage, 2 frame animasi + `buildings.json` |
| `environments/<kota>/stageN/` | Background per kota per stage + layer terpisah untuk parallax |
| `props/` | Properti jalan khas kota (ondel-ondel, bajaj, pinus, angklung, penjor, kamboja, canang, jukung, kelapa, becak, bendera, lampu jalan) |
| `scenes/` | Preview gabungan environment + toko + karakter (`overview.png`, `<kota>_preview.png`) |
| `food/<kota>/` | Icon menu 24×24 (+ `@4x`, + versi `_locked`) |
| `food/menu.json` | Menu lengkap tiap kota: stage, jenis, cara buka, tier, harga, waktu masak, harga buka, kombo |
| `ui/` | Ikon UI 24×24 (+ `@4x`), `ui_icons_sheet.png` + `ui_icons_atlas.json`, preview |
| `cities.json` | Data kota: makanan spesial, tulisan papan toko, landmark, path aset tiap stage |

## Kota & stage

Tiap kota punya 5 stage dengan suasana waktu yang sama (1 senja, 2 malam, 3 sore emas, 4 malam neon,
5 fantasi melayang), tapi landmark, arsitektur, properti, dan tokonya beda-beda:

| | Jakarta (Betawi) | Bandung (Sunda) | Bali | Surabaya |
|---|---|---|---|---|
| Landmark | Monas, gedung tinggi | Gedung Sate, Tangkuban Perahu, kabut | Gunung Agung, laut, candi bentar | Jembatan Suramadu, Tugu Pahlawan, crane pelabuhan |
| Rumah | Atap genteng + gigi balang | Rumah panggung bilik bambu, julang ngapak / art deco | Tembok bata + angkul-angkul + paras | Limasan genteng / kolonial lengkung |
| Properti | Ondel-ondel, bajaj | Pinus, angklung | Penjor, kamboja, canang, jukung, kelapa, obor | Becak, bendera merah putih, umbul-umbul |
| S1 gerobak | Kerak telor (anglo, wajan terbalik), atap seng + gigi balang | Batagor, atap bambu, angklung | Sate lilit di panggangan, atap alang-alang, kain poleng | Rawon (panci besar), atap terpal merah putih |
| S2 warung | Terpal oranye, valance gigi balang | Terpal hijau, tiang bambu | Bale alang-alang, tiang poleng, canang | Terpal belang merah putih |
| S3 kedai | Ruko Betawi hijau-oranye | Art deco ala Braga | Bata merah + mahkota paras, emperan alang-alang | Kolonial ala Tunjungan, fronton + jendela lengkung |
| S4 resto | Gedung tinggi, neon + logo Monas | Kafe A-frame di antara pinus | Beach club alang-alang + kolam + obor | Resto peti kemas bertumpuk |
| S5 istana | Istana Betawi + menara emas ala Monas | Gedung Sate melayang, tusuk sate emas | Istana meru atap tumpang + penjor | Istana kolonial + Tugu Pahlawan emas + Suro & Boyo + mercusuar |

## Menu per kota

Aturan buka menu (sama untuk semua kota):

| Stage | Terbuka otomatis saat naik stage | Terkunci (dibuka pakai koin) |
|---|---|---|
| 1 Gerobak | 1 makanan + 1 minuman | 1 minuman |
| 2 Warung | +1 makanan | 1 makanan |
| 3 Kedai | +2 makanan | 1 menu **spesial** + 1 minuman |
| 4 Resto | +2 makanan + 1 minuman | 1 menu **spesial** + 1 dessert |
| 5 Istana | +2 makanan | 2 menu **legendaris** |

Semua menu spesial (⭐) dan legendaris (🔥) selalu terkunci dan harus dibuka pakai koin.

18 menu per kota (72 total). Icon: menu spesial punya bingkai emas + bintang, menu legendaris punya
aura api merah muda, versi `_locked` = siluet abu-abu + gembok untuk tampilan toko.

| Stage | Jakarta | Bandung | Bali | Surabaya |
|---|---|---|---|---|
| 1 | Kerak Telor, Es Teh Manis · 🔒 Bir Pletok | Batagor, Es Cendol · 🔒 Bajigur | Sate Lilit, Es Kelapa Muda · 🔒 Loloh Cemcem | Rawon, Es Degan · 🔒 Es Dawet |
| 2 | Ketoprak · 🔒 Gado-gado | Cireng · 🔒 Cilok | Tipat Cantok · 🔒 Nasi Jinggo | Tahu Tek · 🔒 Tahu Campur |
| 3 | Soto Betawi, Nasi Uduk, 🔒⭐ Nasi Uduk Komplit · 🔒 Es Selendang Mayang | Seblak, Mie Kocok, 🔒⭐ Seblak Komplit · 🔒 Bandrek | Ayam Betutu, Lawar, 🔒⭐ Nasi Campur Bali · 🔒 Es Daluman | Lontong Balap, Rujak Cingur, 🔒⭐ Rawon Setan · 🔒 Es Sinom |
| 4 | Asinan Betawi, Gabus Pucung, Es Kopi Susu, 🔒⭐ Soto Betawi Iga · 🔒 Kue Rangi | Surabi, Nasi Timbel, Es Goyobod, 🔒⭐ Nasi Timbel Komplit · 🔒 Colenak | Bebek Betutu, Serombotan, Es Kopi Kintamani, 🔒⭐ Ayam Betutu Utuh · 🔒 Jaje Laklak | Sate Klopo, Lontong Kupang, Es Kopi Tubruk, 🔒⭐ Rawon Iga Komplit · 🔒 Lapis Surabaya |
| 5 | Laksa Betawi, Sayur Babanci, 🔒🔥 Kerak Telor Api Legenda · 🔒🔥 Dodol Betawi Emas | Karedok, Mie Kocok Kikil, 🔒🔥 Batagor Kristal Tangkuban · 🔒🔥 Surabi Bulan Emas | Sate Plecing, Tum Ayam, 🔒🔥 Betutu Api Dewata · 🔒🔥 Bubuh Injin Pelangi | Nasi Cumi Hitam, Pecel Semanggi, 🔒🔥 Rawon Api Legenda · 🔒🔥 Rujak Cingur Mahkota |

⭐ = spesial, 🔥 = legendaris, 🔒 = dibuka pakai koin.

**Kombo**: 4 paket per kota (mis. *Sarapan Jakarte* = Nasi Uduk + Es Teh Manis, ×1.2 pendapatan;
*Botram Sunda* = Nasi Timbel Komplit + Karedok + Colenak, ×1.4). Bonus aktif kalau semua item paket ada di menu.

**Angka ekonomi** di `menu.json` (harga, waktu masak, harga buka) masih angka awal dari rumus di
`tools/sprites/menu.py` → `economy()`: tiap stage ×4, tiap kota ×10, spesial ×2.5, legendaris ×8,
harga buka menu terkunci = 60× harga jualnya. Silakan disetel saat balancing.

## Background & layer

`environments/<kota>/stageN/`:
- `bg.png` (224×256) dan `bg@2x.png`: background utuh.
- `layer_sky.png`, `layer_far.png`, `layer_mid.png` (stage 1–4, kecuali pantai Bali), `layer_near.png`:
  ditumpuk berurutan, bisa digeser beda kecepatan untuk efek parallax.

Toko diletakkan di tengah dengan kaki di garis tanah y=238 (stage 5 melayang, dasar di y=248).
`vendor_spot` di `buildings/buildings.json` = titik kaki tokoh utama relatif ke gambar toko.

## Ikon UI

`ui/` berisi 45 ikon 24×24 (versi `@4x`), satu sprite sheet `ui_icons_sheet.png` dan
`ui_icons_atlas.json` (nama → posisi di sheet). Lihat semuanya di `ui/ui_icons_preview.png`.

| Grup | Ikon |
|---|---|
| Mata uang | `koin`, `koin_tumpuk`, `bintang_rasa` (mata uang prestige), `pendapatan` |
| Tab bawah | `tab_racikan`, `tab_karyawan`, `tab_naik_kelas`, `tab_misi` |
| Tombol | `upgrade`, `gembok`, `gembok_terbuka`, `pengaturan`, `suara_on`, `suara_off`, `tutup`, `kembali`, `centang`, `tambah`, `info`, `notifikasi` |
| Status | `waktu_masak`, `pelanggan`, `rating`, `rating_kosong`, `offline`, `boost`, `boost_rempi`, `kombo`, `menu_spesial`, `menu_legendaris` |
| Fitur | `toko`, `peta`, `misi_harian`, `hadiah`, `trofi`, `iklan_bonus` |
| Badge stage | `stage1_gerobak` … `stage5_istana` |
| Pin kota | `kota_jakarta`, `kota_bandung`, `kota_bali`, `kota_surabaya` (warna aksen tiap kota) |
