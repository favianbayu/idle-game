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
| Peta mini | M | Menu → Peta |

Menu juga punya **Grafik** (Rendah: tanpa bayangan matahari, Sedang, Tinggi) dan **Pixel** (besar piksel; auto menyesuaikan layar).
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
- **SMA Negeri 3 (76 x 52 petak)** dari `peta/buat_peta.py`: Gedung A (2 lt), B (3 lt, pintu tiap kelas), C (2 lt),
  aula seng hijau, musala berkubah, kantin 6 lapak, toilet/gudang, Gedung Lama berlumut + menara lonceng, greenhouse,
  lapangan upacara + tiang bendera, lapangan basket & futsal, beringin + bangku, parkiran motor & guru, pagar keliling,
  gerbang + pos satpam, warung Mak Iyah di luar pagar utara. Masuk lewat gerbang SMA 3 di kota (Aksi).
- Tokoh dari `karakter/npc_styles.js` (Om Darto, Cici, Bimo, Laras, Mas Fajar, Bram, Kobar, Tegar, Nadia, Sekar, Pak Ujang, dll.)
  berkeliaran di tempatnya masing-masing dan bisa diajak ngobrol.

## Kembangkan

```
npm install
npm run build        # -> index.html (satu file)
npm run peta         # ekspor ulang peta kota kalau peta_organik.py berubah (butuh Python + shapely + Pillow)
```

Kode: `src/main.js` (loop, kamera, input, UI), `src/world.js` (kota & sekolah), `src/geom.js` (penggabung mesh),
`src/chars.js` + `src/voxworker.js` (tokoh), `src/voxlib.js` (diekstrak dari `sprite-stacking/index.html`), `src/npcs.js`.
