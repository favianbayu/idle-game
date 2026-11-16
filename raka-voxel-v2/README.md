# Raka voxel v2 · desain tokoh utama (dari nol)

Raka sebagai anak SMA bandel yang suka berantem dan balapan, rambut **mullet modern**. **Belum dimasukkan ke game**
(`game3d/`): ini pratinjau mandiri untuk ditinjau dulu. Versi pertama (`raka-voxel/`) dibuang.

- `raka_voxel.html` : buka langsung (double-click). Pilih baju, gerakan, ekspresi, helm; seret = putar, roda = zoom.
  **Ukuran pixel game** = lihat seperti di game, **Banding Raka lama** = sandingkan dengan tokoh lama.
- `shots/` : turnaround, kepala, wajah (7 ekspresi), baju, pose, motor, sudut atas, banding ukuran game.

## Cara dibuat (beda total dari tokoh lama)

Tokoh lama dibentuk dari kapsul/elipsoid yang di-voxel-kan ulang tiap frame, hasilnya bulat dan warnanya belang.
Raka v2 **digambar voxel demi voxel per bagian badan** (kepala, dada, pinggul, lengan atas/bawah, paha, betis, sepatu,
ekor rambut, kain jaket). Tiap bagian kaku, jadi wajah dan detail tetap tajam di pose apa pun; rangka memutar bagian
di sendi.

| Bagian | Isi |
|---|---|
| Kepala | kotak 9 x 10 x 10 voxel, wajah peta piksel 10 x 10 (1 piksel = 1 voxel), hidung menonjol, telinga + anting |
| Wajah | alis tebal (satu terbelah bekas luka), mata putih + pupil, plester di pipi, mulut miring |
| Ekspresi | biasa, kedip, marah, teriak, nyengir, ketawa, sakit; otomatis ikut gerakan (`exprFor`) |
| Rambut | mullet modern: atas dua lapis choppy, poni jatuh sampai alis, samping burst fade, belakang menyempit dan berhenti di kerah, ujung mengibas |
| Seragam | kemeja putih terbuka, kaus hitam sablon petir, kerah berdiri, badge OSIS + papan nama, celana abu digulung, sneakers high-top merah, gelang hitam |
| Jaket balap | Lampu Kota hitam berlis kuning, emblem bohlam di punggung; bisa diikat di pinggang (lengan & badan jaket ikut berayun) atau dipakai + sarung tangan + helm half-face |
| Motor | motor balap voxel untuk pose naik motor (jok, setang, pijakan pas dengan badan) |

Ukuran: tinggi ±39 voxel, 1 voxel = 1/32 petak (±1.2 petak), sama dengan tokoh game skala 1.3.

## Kode

- `src/vox.js` : kisi voxel + mesh (buang sisi tertutup, ambient occlusion per sudut).
- `src/model.js` : semua bagian badan, palet `PAL`, wajah `FACES`, baju `OUTFITS`, motor.
- `src/rig.js` : rangka. Parameter pose **sama dengan `humanShape`** di `game3d/src/voxlib.js` (lean, thL, knL, arL,
  elL, spL, tw, hy, hp, sy, ...), jadi semua `ANIMS` game langsung jalan. Tambahan: `hr` (kepala miring), `lgL/lgR`
  (kaki membuka), `tail` (ekor rambut), `roll`, `bob`. `bake()` menghasilkan segitiga + warna vertex siap jadi
  `BufferGeometry`.
- `src/anims.js` : gerakan khusus Raka (diam, jalan petantang-petenteng, lari, kuda-kuda, jab, pukulan lurus, hook,
  uppercut, tendangan, kena pukul, provokasi, sisir rambut, nongkrong jongkok, naik motor) + gerakan lama dari voxlib.
- `src/viewer.js` : pratinjau WebGL tanpa library. `build.mjs` menggabung jadi satu HTML, `shot.mjs` + `sheets.json`
  merender lembar di `shots/`.

## Memasang ke game nanti

Di `game3d/src/voxworker.js`, untuk `sid === 'raka'`: `rigPose(A.pose(t), boxes)` lalu `bake(parts, mats)`; kalikan
posisi dengan 1/32 dan tukar sumbu (dunia X = x, Y = z, Z = -y). Kunci cache frame perlu memuat ekspresi dan baju.
