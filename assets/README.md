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

## Makanan spesial per kota

| Jakarta | Bandung | Bali | Surabaya |
|---|---|---|---|
| Kerak Telor | Batagor | Sate Lilit | Rawon |
| Soto Betawi | Seblak | Ayam Betutu | Lontong Balap |
| Nasi Uduk | Surabi | Nasi Campur Bali | Rujak Cingur |
| Ketoprak | Mie Kocok | Lawar | Tahu Tek |
| Asinan Betawi | Cireng | Tipat Cantok | Sate Klopo |

Daftar ini ada di `tools/sprites/cities.py` (dan `cities.json`); tulisan di papan toko ikut dari situ.
Icon makanannya belum dibuat.

## Background & layer

`environments/<kota>/stageN/`:
- `bg.png` (224×256) dan `bg@2x.png`: background utuh.
- `layer_sky.png`, `layer_far.png`, `layer_mid.png` (stage 1–4, kecuali pantai Bali), `layer_near.png`:
  ditumpuk berurutan, bisa digeser beda kecepatan untuk efek parallax.

Toko diletakkan di tengah dengan kaki di garis tanah y=238 (stage 5 melayang, dasar di y=248).
`vendor_spot` di `buildings/buildings.json` = titik kaki tokoh utama relatif ke gambar toko.
