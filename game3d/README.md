# Lonceng Pulang 3D (base game, Three.js)

Base game untuk game SMA "Lonceng Pulang": jalan-jalan dengan Raka di Kota Wirabumi dan SMA Negeri 3,
dibangun ulang di Three.js (GPU) supaya kamera berputar tidak lag lagi.

**Main:** buka `index.html` langsung (double-click), tidak perlu server. Jalan di PC dan HP.

| | PC | HP |
|---|---|---|
| Jalan | WASD / panah | joystick (sentuh layar kiri) |
| Lari | Shift | tombol Lari / dorong joystick jauh |
| Aksi (ngobrol, masuk bangunan, naik/turun & parkir kendaraan, mancing, belanja, elus kucing) | Spasi / Enter | tombol Aksi |
| Pukul / Tendang | J atau F / K (Shift+J = jurus saat Nyali penuh) | Pukul (jadi JURUS saat Nyali penuh) / Tendang |
| Hindar (tekan = guling/mundur, tahan = tangkis, tepat waktu = parry) | L | Hindar |
| Pegang (banting / kunci lengan) · Provokasi | I · T | Pegang |
| Status diri (Kekuatan, Kelincahan, Nyali, daftar lawan) | U | Menu → Status diri |
| Reset posisi (kalau nyangkut) | R | Menu → Reset posisi |
| Putar kamera | Q / E, seret mouse | tombol ⟲ ⟳, geser dua jari |
| Zoom | roda mouse, + / − | cubit dua jari |
| Kamera ikut karakter | C | Menu → Kamera ikut |
| Sudut kamera (Rendah / Sedang / Tinggi) | V, seret mouse naik-turun | tombol Sudut, geser dua jari naik-turun |
| Peta besar (seluruh kota, posisi & arah pemain, kendaraan parkir) | M (Esc tutup) | tombol Peta / ketuk minimap |
| Peta mini | N | Menu → Minimap |
| Gaya (melambai, duduk, jongkok, HP, joget, hormat, angkat tangan, baca, berbaring, tepuk tangan, tertawa, berpikir, bawa kardus, salam, peregangan) | 1-9, 0 | tombol Gaya (berganti tiap tekan) |

Menu juga punya **Grafik** (Rendah: tanpa bayangan matahari dan rumput kecil, Sedang, Tinggi) dan **Pixel** (besar piksel; auto menyesuaikan layar).
Posisi pemain dan pengaturan tersimpan otomatis (localStorage).

## Kenapa sekarang ringan

- Renderer lama (canvas 2D) menggambar ulang semua irisan sprite di CPU tiap kamera berputar. Sekarang semua bangunan
  dalam satu potongan 32 x 32 petak digabung jadi **satu mesh** (±25-40 draw call untuk seluruh layar), pohon pakai
  `InstancedMesh`, jadi memutar kamera hanya mengubah satu matriks.
- Gambar dirender di **resolusi rendah** (±330 px tinggi di PC, ±260 di HP) lalu diperbesar dengan `image-rendering: pixelated`,
  jadi tetap terasa pixel/voxel dan GPU HP kelas menengah tidak berat.
- Tokoh voxel dibangun dari kode bentuk & animasi yang sama dengan renderer lama (`humanShape`, `ANIMS`, `STYLES`),
  di **Web Worker**, satu mesh per frame animasi lalu di-cache. Ganti frame = ganti geometri, tanpa membangun ulang.
- Bayangan matahari mengikuti pemain dengan area kecil; bayangan bulat murah di bawah tiap tokoh.

## Isi dunia (dari dokumen desain `docs/desain-sma`)

- **Kota 260 x 180 petak** persis dari `peta/peta_organik.py`: `tools/export_kota.py` menjalankan fungsi `peta_kota()`
  (seed tetap) dan mencatat semua jalan, sungai, rel, sawah, 184 bangunan, dan 520 pohon ke `src/data/kota.json`.
  Rumah memakai palet wilayah dari `05-bangunan.md` (kampung, ruko, perumahan berpagar, rumah panggung bantaran)
  dan pintunya menghadap jalan terdekat. Bangunan kunci punya model sendiri: SMA 3, stasiun, Masjid Agung (kubah + menara),
  Pasar, Plaza, rumah Bram (kolam renang), gudang markas Lampu Kota, STM, menara pemancar, lahan proyek berpagar seng,
  Warkop Simpang (gerobak kopi level 1) dan rumah Om Darto.
- **Rumah & jalan**: rumah kampung (K1-K6), perumahan berpagar (P1-P4), ruko (R1-R3) dan rumah panggung ditata ulang
  di sepanjang jalan dengan halaman, jalur masuk, dan jarak antar-rumah, semua menghadap jalan. Jalan punya aspal/paving,
  marka, kanstin, zebra cross, selokan gang, tiang listrik dan lampu jalan. Tanaman: pohon per wilayah, bambu, kelapa,
  pisang, padi, kebun teh, semak, bunga, rumput.
- **Kendaraan** (`src/vehicles.js`, `src/rides.js`): motor bebek, matic, sport, trail, vespa; sepeda kota (keranjang),
  MTB, onthel, BMX; mobil sedan, hatchback, SUV, MPV, angkot, pikap, taksi, truk boks. Tiap motor/sepeda punya titik jok
  dan pose pengendara sendiri (`MOTOR_FIT`, `BIKE_FIT`); tokoh didudukkan tepat di jok dari posisi pantat voxel per frame.
  Roda berputar sesuai kecepatan, engkol sepeda ikut kayuhan, motor miring saat menikung.
- **Lalu lintas** (`src/traffic.js`): mobil, motor (kadang berboncengan), dan sepeda berjalan di lajur kiri jalan raya &
  jalan, pindah ke jalan lain di simpang, menjaga jarak, berhenti untuk pemain. Lampu merah dibuat otomatis di tiap simpang
  jalan raya: tiang di kiri jalur, kotak lampu di atas lajur menghadap kendaraan yang datang, nyala bergantian
  (jalan raya hijau 9 dtk, lalu jalan masuk), kendaraan berhenti di garis.
- **Sungai & danau** punya kedalaman: tanah dilubangi, dinding talud batu (basah di bawah), dasar gelap, permukaan air
  di bawah tanah; jembatan dengan balok samping & pilar di sungai.
- **Tokoh**: kepala dengan rahang/dagu & telinga (bentuk wajah oval/bulat/kotak/V), mata (normal/besar/kecil/sayu/tajam,
  bulu mata), alis (tebal/tipis/naik/marah, bekas luka), mulut (senyum/datar/nyengir/miring), kumis/janggut, kacamata
  bulat/kotak; 10 gaya rambut baru sesuai guide (messy, cepak, klimis, bergelombang, ikat rendah, kepang, kuncir tinggi,
  kuncir dua rendah, bob + jepit, setengah ikat, topi terbalik). Seragam SMA: kerah, kancing, saku + badge OSIS,
  papan nama, ikat pinggang + gesper, rok lipit; jaket di atas seragam memperlihatkan kemeja. NPC punya variasi diam
  (main HP, baca buku, jongkok, tertawa, bawa kardus, menyapu, hormat, dll.).
- **Pusat kota padat** (`src/toko.js`, `src/signs.js`): ruko 2-3 lantai berbalkon, hotel melati/kos dengan papan vertikal,
  kantor bank kaca + ATM, warung kelontong bertenda garis, minimarket parodi **Indomurah** dengan parkiran, lahan parkir,
  dan baris gedung di belakang ruko supaya blok tidak kosong. Papan nama, spanduk vinyl, X-banner, dan LED berjalan
  bertulisan khas pertokoan Indonesia (fotokopi, service HP, apotek, RM Padang, laundry kiloan, dll.).
- **Parkir liar & tukang parkir**: motor berjajar di depan ruko; tukang parkir berompi oranye mondar-mandir, memberi
  aba-aba ("Priiit! Kiri, kiri...") dan menyapa pemain yang lewat naik motor.
- Warga biasa yang dipukul lari panik atau meringkuk (reputasi turun); saksi ikut bereaksi, satpam/polisi datang melerai.
- **Berantem versi guide 70** (`src/fight.js`): combo dari urutan Pukul/Tendang (A-A-A-B "Bel Pulang", A-B "Sapu Pasar", dll.),
  tangkis & parry, guling, banting bahu, kunci lengan saat lawan pusing, meter Nyali + jurus, tanda "!" merah sebelum lawan
  memukul, maksimal 2 lawan menyerang bersamaan. Tiap tokoh punya level kekuatan sesuai cerita (Tegar lv1 ... Bang Jaka lv9),
  terlihat di nama & panel Status. Statistik pemain naik lewat samsak, main bola/basket, lari di GOR, menang berantem.
- **Interior** (`src/interior.js`): rumah Om Darto, Indomurah, warung kelontong, markas Lampu Kota, Bengkel Mas Fajar, GOR, STM,
  pabrik es, Gua Kapur, rumah pohon, pondok. Dinding yang menghalangi kamera otomatis disembunyikan. Tidur, makan, belajar,
  latihan, peti tua, upgrade sepeda/motor.
  Ditambah 21 interior dari guide 92 (`src/data/interiors.json`, diekspor `tools/export_interiors.py` dari
  `peta/interior_data.py`): warnet, kafe, karaoke, pasar, Plaza (3 lantai), masjid agung, bank, puskesmas, polsek, studio foto,
  stasiun, kos Bu Narti, Bengkel Wijaya Motor, rumah Bram (2 lantai), rumah Laras, Gilang, Uti, Bimo, Sekar, Nadia, kontainer
  proyek. Pintu ada di bangunan yang bertanda papan nama di kota; tangga = pindah lantai.
- **GOR Kota Wirabumi** (guide 89, interior besar): arena 32 x 16 (garis basket/futsal/voli/bulu tangkis, ring & gawang),
  tribun utara-selatan 5 baris, panggung lipat, papan skor; gym & ruang beladiri (treadmill, sepeda statis, rak dumbel, bench,
  squat rack, lat pulldown, leg press, ring tinju, 4 samsak, matras silat). Latihan gym: tiket harian Rp15.000 atau member
  bulanan Rp150.000, maksimal 2 sesi sehari (sesi ketiga = cedera ringan, tidur = ganti hari), tiap sesi stat +1 level
  (kardio & silat = Kelincahan, beban & mesin = Kekuatan, ring = Kekuatan + Nyali). Badminton sewa Rp20.000. Lobi (loket,
  lemari piala, papan jadwal event), kantin, ganti & bilas, ruang medis, panitia, gudang alat, musala. Coach Herman.
- **STM Karya Bangsa** (guide 88): tampak luar krem kusam dengan plint & balkon marun, atap seng biru, bengkel abu dengan
  atap gergaji, pintu rolling merah & crane kuning; Pak Bonar (satpam) jaga di depan. Interior Bengkel Otomotif: 4 bay mobil
  dengan lift, 6 stand motor praktik, ruang tune-up & dyno (ukur tenaga motor), gudang oli & part = koperasi suku cadang
  (20% lebih murah dari bengkel kota), kelas teori, R. guru produktif. Servis motor praktik = upah Rp15.000. Gudang lama =
  markas Serigala Besi (sofa bekas, drum api, papan dart, Codet & Bogel).
- **Uang jajan & belanja** (`src/shop.js`, `src/jajan.js`): dompet, belanja di kasir/warung/gerobak (bakso, siomay, cendol,
  gorengan, martabak, cilok, sate, nasi goreng) yang memulihkan nyawa/nyali, jual ikan, bantu Om Darto jualan kopi.
- **Balap liar drag** (`src/race.js`, guide 87): titik kumpul di trotoar Jl. Lingkar Selatan (joki Bang Ocid, penonton,
  gerobak Nasi Goreng Bang Jali). Datang naik motor, Aksi di dekat joki = pasang taruhan. Hitung mundur senter joki, Aksi pas
  "GAS!" (kecepetan = mesin brebet), lalu Aksi untuk ganti gigi saat jarum rpm di bar hijau. Lurus 70 petak, 1 lawan 1.
  Lawan naik level tiap menang: Doni Knalpot (Rp50.000), Kirana (Rp100.000), Kobar (Rp200.000), Joki Serigala Besi
  (Rp500.000). Menang = uang + Nyali, kalah = taruhan hilang. Upgrade motor di bengkel bikin lebih kencang.
  Habis balap ada peluang razia 25%: polisi bermotor mengejar, kabur lewat gang/jalan tikus atau masuk bangunan. Kena =
  denda Rp100.000, motor ditahan di depan Polsek, Om Darto marah. Belum ada siang/malam, jadi balapan bisa kapan saja.
- **Aktivitas** (`src/activities.js`): sepak bola (gawang berjaring, Dodi & Didi ikut main), basket 3x3, mancing (tarik-ulur),
  berenang di kolam umum & kali, rakit penyeberangan, api unggun. Sepeda & motor diparkir di dunia (awal di rumah Om Darto).
- **Binatang & tanaman** (`src/animals.js`, `src/veg.js`): kucing, anjing, ayam & anak ayam, merpati, burung terbang, bebek,
  ikan, sapi, kambing; pot mawar, kembang sepatu di kaleng cat, lidah mertua, aglonema, kaktus, anggrek, pot gantung,
  rak pot, bugenvil, melati, bunga matahari.
- **Lalu lintas**: kendaraan yang keluar di tepi peta menghilang, lalu masuk lagi dari ujung jalan di tepi peta lain.
  Kendaraan saling jaga jarak & memberi jalan di simpang; pemain/NPC tidak bisa menembus badan kendaraan.
- **Gerbang Perumahan Bukit Asri**: gapura papan nama, pos satpam, portal yang naik saat ada kendaraan mendekat.
- **Bangunan** lebih berkedalaman: kusen jendela & pintu menonjol, ambang bawah/atas, luifel beton di atas pintu,
  lis lantai, atap teras genteng sampai depan pilar. Tekstur tanah 16 piksel/petak + bintik seukuran voxel.
- Tidak ada bangunan, pohon, atau benda yang menumpuk di permukaan jalan: rumah dicek terhadap jarak ke tepi jalan,
  bangunan kunci digeser otomatis kalau tapaknya menyentuh jalan, marka jalan diputus di setiap simpang.
- Tanaman bergoyang pelan tertiup angin (shader); pohon, semak, bunga, rumput punya gumpalan daun & warna bertingkat.
- **SMA Negeri 3** mengikuti `guide/83-sekolah-luar.md` (lahan 76 x 53.5 di dalam pagar + trotoar + Jl. Merdeka):
  Gedung A bentuk U dengan portiko pelana, tiang putih, papan nama hijau-emas; Gedung B 3 lantai dengan menara tangga,
  3 gevel, jam, pagar balkon biru/hijau/merah per angkatan; Gedung C atap gergaji + mural; aula atap lengkung;
  musala kubah tosca + menara + tempat wudu; kantin 6 lapak warna-warni + pelataran meja panjang; toilet/gudang;
  Gedung Lama berlumut + menara lonceng; greenhouse & bedeng; lapangan upacara (mimbar, tiang bendera, titik barisan),
  basket & futsal; beringin dengan akar gantung + bangku melingkar; selasar beratap; plaza + kolam air mancur;
  gapura + pos satpam bulat; parkiran motor berkanopi, parkir guru, taman mading + rak sepeda; pagar bata+besi
  dengan lampu; titik loncat ke warung Mak Iyah. Masuk lewat gerbang SMA 3 di kota (Aksi).
- Tokoh dari `karakter/npc_styles.js` (Om Darto, Cici, Bimo, Laras, Mas Fajar, Bram, Kobar, Tegar, Nadia, Sekar, Pak Ujang, dll.)
  berkeliaran di tempatnya masing-masing dan bisa diajak ngobrol.
- **Wilayah luar kota** (`src/luar.js`, data `src/data/dunia.json` dari peta dunia): 9 wilayah terpisah yang dimuat satu per
  satu, yaitu Gunung Sangkala, Waduk Sirnagalih (bendungan & PLTA), Desa Sukamekar & kebun teh, Desa Tegalsari (sawah),
  Batalyon 3 & kawasan industri, Sirkuit, Muara & kampung nelayan (TPI panggung), Pantai (mercusuar, hotel, warung),
  Pesisir Lintang (stasiun ujung rel). Cara pindah:
  - jalan kaki / naik motor sampai batas kota di ujung jalan, lalu Aksi ("Ke …"); kendaraan ikut terbawa;
  - **Terminal** kota: bus/angkot/ojek ke tiap wilayah (Rp4.000 sampai Rp15.000); **Stasiun**: kereta ke Pesisir Lintang;
  - **Halte** kuning di tiap wilayah: naik angkutan pulang ke kota.
  Tiap wilayah punya warga yang bisa diajak ngobrol. Posisi di luar kota ikut tersimpan.
- **Kendaraan parkir** punya tabrakan, dan jumlahnya ganti tiap hari (sepi / jarang / sedang / penuh). Hari berganti saat tidur.
- **Lapangan basket** umum di samping SMA punya garis lengkap; lapangan basket di dalam SMA 3 bisa dipakai main.

## Kembangkan

```
npm install
npm run build        # -> index.html (satu file)
npm run peta         # ekspor ulang peta kota kalau peta_organik.py berubah (butuh Python + shapely + Pillow)
```

Kode: `src/main.js` (loop, kamera, input, UI), `src/kota.js` (kota, jalan, tanah), `src/buildings.js` (tipe rumah), `src/world.js` (sekolah), `src/common.js` (tabrakan, bahan, pola tanah), `src/veg.js` (tanaman), `src/geom.js` (penggabung mesh),
`src/chars.js` + `src/voxworker.js` (tokoh), `src/voxlib.js` (diekstrak dari `sprite-stacking/index.html`), `src/npcs.js`.
Raka (pemain) memakai model sendiri di `src/raka/` (desain dari `raka-voxel-v3/`): bagian badan digambar tangan dengan
voxel 2x lebih rapat (1/64 petak) dan proporsi tokoh lama, di-voxel ulang ke satu kisi lurus tiap frame (`frame.js`).
Pose = `ANIMS` game yang sama; ekspresi wajah & helm motor otomatis dari nama gerakan (`expr.js`); properti tangan
(HP, kardus, buku, sapu, pancing, pedang, orb) dibuat di `rig.js`.
Tokoh utama lain juga memakai model halus ini: Rani (pilihan tokoh pemain lewat tombol **Tokoh** di menu), Bimo, Bram,
Nadia, Dimas, Sekar, Arga, Laras, Rizal, Uti, Tegar, Sasha, Kirana, Jojo, dan Andra (`src/raka/<nama>.js`, desain dari `tokoh-voxel/`). Worker memilih model halus untuk sid
yang ada di `FINE` (`voxworker.js`). Tiap tokoh membawa kerangkanya sendiri (`SKEL`), dan rok dibuat tidak terbelah oleh
`rok.js` + `P.skirt` di `frame.js`. Cara membuat tokoh baru ada di `tokoh-voxel/PANDUAN-TOKOH.md`.
Kisi `vox.js`/`frame.js` memakai `Uint16Array` karena jumlah bahan sudah lewat 255. Urutan import di worker
mengikuti urutan `tokoh-voxel/build.mjs`, karena beberapa tokoh memakai bahan milik tokoh sebelumnya.
