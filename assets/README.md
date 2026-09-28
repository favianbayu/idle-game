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
| `ui/layouts/` | Mockup 8 layar (224×400 + `@3x`) dan `layouts_overview.png` |
| `ui/kit/` | UI kit 9-slice: panel, tombol 6 warna, pill, progress bar + `kit.json` |
| `ui/` | Ikon UI 24×24 (+ `@4x`), `ui_icons_sheet.png` + `ui_icons_atlas.json`, preview |
| `events/<event>/` | Hari besar: untaian dekorasi, tiang (bendera/penjor/pohon natal), ikon, selempang tokoh utama, pelanggan berkostum + `events.json` |
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

## Layout UI

Resolusi dasar layar **224×400** (portrait, di-scale nearest-neighbor ke layar HP). Mockup ada di
`ui/layouts/` (versi 1x dan `@3x`), dibuat dari aset asli (`tools/sprites/ui_layout.py`).

```
┌──────────────────────────┐  y=0
│ 🪙 koin   ⭐ bintang   🗺 ⚙ │  HUD atas (pill mata uang, peta, pengaturan)
│    [ JAKARTA - STAGE 3 ]  │  label kota & stage
│ 🪙 1.2RB/DETIK            │  pendapatan per detik
│                          │
│    ADEGAN 224×256        │  environment + toko + karakter (area tap)
│    koin melayang, boost  │  tombol boost Rempi di kanan
├──────────────────────────┤  y≈252
│ PANEL KONTEN TAB         │  isi tab aktif (list kartu, scroll)
├──────────────────────────┤  y=366
│ RACIKAN KARYAWAN NAIK MISI│ tab bar 4 tombol (56 px), badge notifikasi
└──────────────────────────┘  y=400
```

| Layar | Isi |
|---|---|
| `01_layar_utama` | HUD, adegan, pendapatan/detik, boost Rempi (x2 + timer), koin melayang saat tap, 3 menu aktif |
| `02_racikan` | Filter (semua/makanan/minuman/spesial), kartu menu: level + progress masak + tombol upgrade; menu terkunci dengan harga koin (emas = biasa, ungu = spesial/legendaris) |
| `03_karyawan` | Karyawan dengan perk (masak +25%, pelanggan +15%, otomatis), level 1–5, tombol upgrade; slot terkunci per stage |
| `04_naik_kelas` | Jalur 5 stage, syarat naik (koin, jumlah menu aktif, pelanggan), hadiah Bintang Rasa, tombol NAIK KELAS |
| `05_misi` | Misi harian + progress + hadiah, tombol AMBIL, jumlah pencapaian |
| `06_peta_ekspansi` | Peta Jawa-Bali, pin kota terbuka/terkunci + harga buka, makanan spesial kota, tombol pindah kota |
| `07_popup_offline` | Hasil jualan selama offline, tombol AMBIL / AMBIL X2 (iklan) |
| `08_popup_buka_menu` | Detail menu spesial terkunci: harga jual, bonus kombo, tombol BUKA dengan harga koin |

**UI kit** (`ui/kit/`): semua potongan dibuat untuk 9-slice (`nine_slice_border` di `kit.json`),
jadi bisa direntang ke ukuran apa pun tanpa sudut yang melar. Warna tombol: hijau (aksi utama/upgrade),
emas (beli pakai koin), ungu (premium/spesial/naik kelas), biru (navigasi/filter aktif),
merah (tutup/bahaya), abu (nonaktif).

Angka di mockup (koin, harga, syarat) cuma contoh untuk layout.

## Kostum kota (tokoh utama)

`characters/main/kota/<kota>/stageN/`: frame `idle1`, `idle2`, `tap`, dan animasi masak `masak1`–`masak4`
(ayunan wajan: api di bawah, nasi terlempar lalu jatuh). Preview: `characters/main/kostum_kota_preview.png`,
`characters/main/animasi_masak_preview.png`.

| Kota | Stage 1–2 | Semua stage |
|---|---|---|
| Jakarta | Peci hitam + baju sadariah putih | Sarung kotak di leher |
| Bandung | Iket batik (simpul lancip) + pangsi hitam | Selendang batik |
| Bali | Udeng putih + baju putih, kamen cokelat | Selendang poleng |
| Surabaya | Odheng bertanduk + kaos loreng merah-putih ala Sakera | Selendang merah-putih |

Stage 3–5 tetap pakai toque/seragam stage masing-masing, ditambah selendang kota.

## Animasi pelanggan

`characters/npc/animasi/<nama>/`: `jalan1`–`jalan4` (jalan di tempat, game yang menggeser posisi),
`tunggu1`–`tunggu2`, `senang1`–`senang3` (lompat + hati). Gelembung dialog terpisah:
`gelembung_pesan` (game menggambar ikon menu pesanan di dalamnya), `gelembung_tunggu`, `gelembung_senang`,
`gelembung_kesal`.

Alur yang disarankan: jalan masuk → tunggu + gelembung pesan → (dilayani) senang + ikon makanan → jalan keluar.
Kalau terlalu lama nunggu: gelembung kesal lalu pergi.

## NPC easter egg

`characters/npc/easter_egg/`: 8 pelanggan langka dengan animasi yang sama seperti pelanggan biasa.
`easter_egg.json` berisi peluang muncul (`chance`, per pelanggan baru), pengali bayaran (`reward`) dan kutipan.

| NPC | Homage | Peluang | Bayaran |
|---|---|---|---|
| Pendekar Jabrik | petarung shonen rambut jabrik ber-aura | 0,2% | ×10 |
| Gadis Penyihir Rasa | magical girl + tongkat bintang | 0,3% | ×8 |
| Pilot Robot Raksasa | pilot mecha | 0,3% | ×8 |
| Samurai Pengembara | ronin bertopi caping | 0,2% | ×10 |
| Detektif Bertopi | detektif klasik + kaca pembesar | 0,4% | ×6 |
| Food Vlogger Viral | kreator kuliner + kamera | 0,6% | ×5 |
| Raja Panggung Dangdut | bintang dangdut berkumis + gitar | 0,3% | ×8 |
| Legenda Bulutangkis | atlet juara + raket | 0,4% | ×6 |

Semua karakter ini **original** (mengambil arketipe/trope), bukan tiruan karakter anime atau tokoh nyata
tertentu, supaya aman dari masalah hak cipta dan hak atas citra diri. Rambut baru `jabrik` dan
`kuncir_dua` juga otomatis masuk ke kit kustomisasi muka.

## Animasi environment

- `environments/<kota>/stageN/waktu/{pagi,siang,sore,malam}.png`: background stage 1–4 di 4 waktu.
  `environments/waktu.json`: urutan siklus, saran durasi, tint untuk toko & karakter per waktu,
  kapan lampu menyala.
- `environments/efek/`: `awan_{besar,sedang,kecil}` (digeser pelan ke samping), `burung1-3`,
  `hujan1-4` (overlay layar penuh), `kunang1-2` (malam), `asap1-6` (cerobong / wajan).
- Preview: `preview_siklus_hari.gif` (Jakarta, pagi→malam dengan awan, burung, kunang-kunang),
  `preview_hujan.gif` (Bandung malam hujan), `preview_waktu_bali.png`.

## Efek tap

`ui/efek_tap/`: `ledakan1-4`, `koin_putar1-4`, `lingkar_makanan` (latar putih di belakang ikon menu).
Saat layar di-tap: ledakan kecil, koin berputar naik, dan ikon menu yang barusan terjual muncul dalam
lingkaran lalu melayang dan memudar. Timing di `tap_fx.json`, contoh di `preview_tap.gif`.

## UI kit v2 (gaya detail)

`ui/kit_v2/`: potongan 9-slice bergaya pixel hangat (bingkai kayu berpaku emas, kertas bertepi sobek,
kartu, plat nama, kotak potret motif wajik, tooltip bersiku emas, jendela dengan title bar, tombol tebal
7 warna + versi ditekan, tab kayu aktif/pasif, pita judul, pill harga, bar statistik 6 warna, tombol tutup,
pola latar). `kit_v2.json` berisi ukuran & lebar border 9-slice tiap potongan; preview di
`kit_v2_preview.png`. Prototipe (`prototype/`) sudah memakai kit ini lewat CSS `border-image`.

## Lampu malam, payung & yang lewat

- `buildings/<kota>/stageN_*/frame{1,2}_lampu.png`: hanya piksel yang menyala (jendela, interior,
  etalase, spanduk, papan nama, neon, lampu tumblr, obor, kolam). Saat malam game menggelapkan gedung,
  lalu menggambar layer ini tanpa digelapkan + efek pendar (sore setengah terang).
- `characters/lewat/`: yang lewat di jalan depan toko (sprite menghadap kanan, dibalik untuk arah kiri):
  `kucing` (jalan 1-4, duduk 1-2), `ayam` (jalan, matuk), `motor_ojek` (NPC berhelm + jaket hijau),
  `motor_keluarga` (ibu berkerudung + anak dibonceng) (+ versi `_hujan` jas hujan), `tukang_sayur`
  (NPC bercaping dorong gerobak, + `_hujan` terpal plastik). Pengendara & tukang sayur dirakit dari kit NPC
  yang sama dengan pelanggan (helm = topi baru `helm`), dan `payung_{merah,biru,kuning,hijau}`
  untuk pelanggan saat hujan. Preview: `lewat_preview.png`.

## Yang lewat khas kota

`characters/lewat/` (dari `tools/sprites/lewat_kota.py`, preview `lewat_kota_preview.png`), semua dirakit
dari kit NPC + elemen tambahan, frame `jalan1-n`:
`ondel_ngamen` (ondel-ondel + pengamen kecrek, Jakarta), `bajaj` (sopir + asap knalpot, Jakarta),
`delman` (kuda berjambul + kusir ber-iket, Bandung), `angklung_ngamen` (Bandung), `gebogan` (dua ibu
berkebaya menjunjung gebogan, Bali), `monyet` (bawa kacamata curian, Bali), `becak` (tukang becak bercaping
+ penumpang, Surabaya), `kerupuk` (sepeda onthel + plastik kerupuk raksasa, Surabaya), `bakso` (semua kota).
Tidak ada teks di sprite supaya aman dibalik untuk arah kiri.

## Hari besar (event)

`events/` dari `tools/sprites/events.py`, preview `events_preview.png`. Per event:
`untai1-2.png` (224×44, untaian selebar layar, 2 frame goyang/kedip), `tiang*.png` (bendera berkibar 4 frame,
penjor, atau pohon natal), `ikon.png` (24×24), `selempang.png` (overlay 32×40 untuk tokoh utama),
`pelanggan/<nama>/` (9 frame animasi pelanggan dengan kostum event). Event: kemerdekaan (dipakai juga
Hari Pahlawan), batik, lebaran, imlek, natal, tahun_baru, kartini, galungan (khusus Bali).
Topi baru di kit: `ikat_mp` (ikat kepala merah putih), `santa`, `pesta`; plus bunga rambut (Kartini).
Pejalan khusus event: `characters/lewat/balap_karung` (17-an) dan `barongsai` (Imlek).
Tanggal dicek di game; Lebaran, Imlek dan Galungan memakai tabel karena bergeser tiap tahun.
