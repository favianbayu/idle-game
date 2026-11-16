# Lonceng Pulang 3D (base game, Three.js)

Base game untuk game SMA "Lonceng Pulang": jalan-jalan dengan Raka di Kota Wirabumi dan SMA Negeri 3,
dibangun ulang di Three.js (GPU) supaya kamera berputar tidak lag lagi.

**Main:** buka `index.html` langsung (double-click), tidak perlu server. Jalan di PC dan HP.

| | PC | HP |
|---|---|---|
| Jalan | WASD / panah | joystick (sentuh layar kiri) |
| Lari | Shift | tombol Lari / dorong joystick jauh |
| Aksi (ngobrol, masuk sekolah) | Spasi / F / Enter | tombol Aksi |
| Putar kamera | Q / E, seret mouse | tombol ⟲ ⟳, geser dua jari |
| Zoom | roda mouse, + / − | cubit dua jari |
| Kamera ikut karakter | C | Menu → Kamera ikut |
| Sudut kamera (Rendah / Sedang / Tinggi) | V, seret mouse naik-turun | tombol Sudut, geser dua jari naik-turun |
| Peta mini | M | Menu → Peta |
| Naik sepeda / motor / turun | R | tombol Naik |
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
- **Berantem** (`src/fight.js`): tombol F / "Pukul" (combo jab, straight, hook, tendangan). NPC "jagoan" (preman, punk,
  ojol, satpam, pemuda, tukang parkir, dll.) ngelawan dengan kuda-kuda & pukulan; yang lain lari panik atau meringkuk.
  Saksi ikut bereaksi (satpam/polisi datang melerai). NPC yang KO jatuh lalu bangun lagi; nyawa pemain pulih pelan.
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

## Kembangkan

```
npm install
npm run build        # -> index.html (satu file)
npm run peta         # ekspor ulang peta kota kalau peta_organik.py berubah (butuh Python + shapely + Pillow)
```

Kode: `src/main.js` (loop, kamera, input, UI), `src/kota.js` (kota, jalan, tanah), `src/buildings.js` (tipe rumah), `src/world.js` (sekolah), `src/common.js` (tabrakan, bahan, pola tanah), `src/veg.js` (tanaman), `src/geom.js` (penggabung mesh),
`src/chars.js` + `src/voxworker.js` (tokoh), `src/voxlib.js` (diekstrak dari `sprite-stacking/index.html`), `src/npcs.js`.
