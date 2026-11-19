# Raka voxel v3 · desain tokoh utama

Raka (anak SMA bandel, suka berantem & balapan, rambut mullet modern) sebagai pratinjau mandiri.
**Belum dimasukkan ke game** (`game3d/`).

Beda dari v2: gaya pixel sekarang sama dengan tokoh game.

- **Proporsi tokoh lama**: tinggi 39 voxel lama (skala 1.3), lebar bahu, panjang ruas, dan tinggi sendi sama dengan
  `humanShape` di `game3d/src/voxlib.js`.
- **Kerapatan 2x**: 1 voxel = 1/64 petak (tokoh lama 1/32), jadi tinggi Raka ±78 voxel halus.
- **Semua voxel lurus di satu kisi.** Tiap frame, bagian badan yang sudah dipose di-voxel ulang ke kisi dunia
  (tidak ada kubus miring seperti v2).
- **Pewarnaan seperti tokoh game**: 4 tingkat warna per bahan, dipilih dari normal permukaan per voxel, lalu bintik
  lepas dirapikan. Detail wajah, logo, dan aksesori memakai warna tetap.
- Kepala tidak diputar selama hampir tegak, jadi piksel wajah tetap utuh saat jalan, diam, atau kuda-kuda.

## Isi

- `raka_voxel.html`: buka langsung (double-click). Pilih baju, gerakan, ekspresi, helm; seret = putar, roda = zoom;
  **Ukuran pixel game** untuk melihat ukuran seperti di game, **Banding Raka lama** untuk disandingkan.
- `src/model.js`: bagian badan digambar tangan (kepala 14x14x15 + rambut, 7 peta wajah 14x15, mullet, 4 baju, helm, motor).
- `src/rig.js`: rangka. Parameter pose sama dengan `humanShape`, jadi semua `ANIMS` game jalan.
- `src/frame.js`: `voxelFrame(parts, pose)` -> `{ L, W, H, vox, ... }`, format sama dengan `buildVox` di game.
- `src/anims.js`: gerakan khas Raka (kuda-kuda, jab, hook, uppercut, tendangan, provokasi, sisir rambut, jongkok,
  naik motor) + gerakan lama game; `exprFor()` memilih ekspresi otomatis.
- `build.mjs` (gabung jadi satu HTML), `shot.mjs` + `sheets.json` (lembar gambar di `shots/`).

## Memasukkan ke game nanti

Di `voxworker.js`, untuk `sid === 'raka'`: `voxelFrame(buildParts({ outfit, expr, helm }), A.pose(t))`, lalu bangun
mesh dengan `S = 1/64` (bukan 1/32). Sumbu sama dengan tokoh lain (dunia X = x, Y = z, Z = -y); pusatkan dengan
`org` yang dikembalikan. Kunci cache perlu memuat ekspresi + baju. Satu frame ±9 ms di browser.
