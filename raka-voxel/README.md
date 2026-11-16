# Raka voxel (mullet) · desain tokoh utama

Desain ulang Raka sebagai anak SMA bandel yang suka berantem dan balapan. **Belum dimasukkan ke game** (`game3d/`):
ini pratinjau mandiri untuk ditinjau dulu.

- `raka_voxel.html` : buka langsung (double-click). Pilih baju, gerakan, ekspresi; seret = putar, roda = zoom,
  centang **Rasa pixel game** untuk melihat ukuran seperti di game, **Banding Raka lama** untuk disandingkan.
- `raka.js` : bentuk voxel Raka (`rakaShape`, `rakaRamps`, `FACES`, `RAKA_ANIMS`). Rangka, pose, dan format
  voxel sama dengan `humanShape` di `game3d/src/voxlib.js` (1 voxel = 1/32 petak, skala 1.3), jadi semua
  animasi game yang ada (jalan, lari, pukul, tendang, naik motor, dsb.) langsung jalan.
- `preview.js`, `template.html`, `build.mjs` : pratinjau + penggabung satu file. `shot.mjs` : lembar screenshot.
- `shots/` : turnaround, wajah (5 ekspresi), pose, baju, perbandingan lama vs baru di ukuran game.

## Yang beda dari NPC

| Bagian | NPC lama | Raka baru |
|---|---|---|
| Kepala | elipsoid, wajah dihitung dari rumus | kotak bertepi 10x10 voxel, dipaskan ke grid: 1 piksel wajah = 1 voxel, tajam dari semua sudut |
| Wajah | mata/alis/mulut acak dari nama | peta piksel: alis tebal, mata tajam, senyum miring, belang matahari di pipi, plester di pipi kiri, bekas luka di alis kanan, anting kecil |
| Ekspresi | satu | **biasa, kedip, berantem, nyengir, kesakitan**, otomatis ikut gerakan (`exprFor`) |
| Rambut | `short` bulat | **mullet**: atas jabrik, samping tipis + garis cukur, belakang panjang sampai punggung, ujung agak pirang |
| Badan | bulat | penampang kotak membulat, bahu lebih lebar, kerah berdiri |
| Seragam | rapi, dimasukkan | dikeluarkan, 2 kancing atas terbuka (kaus hitam), lengan digulung, rantai dompet, lakban di buku jari, gelang karet, sneakers hitam-merah |
| Baju lain | - | jaket balap Lampu Kota (hitam, lis kuning, emblem bohlam di punggung), kaus rumah + celana pendek + sandal |
| Gerak khas | - | kuda-kuda memantul, provokasi "Sini!", sisir rambut pakai jari |

## Memasukkan ke game nanti

`rakaShape(pose, outfit, expr)` mengembalikan objek yang sama dengan `humanShape` (`mat, L, W, H, bbox, lift, buttZ,
buttX, joints`), jadi di `voxworker.js` cukup: kalau `sid === 'raka'`, panggil `rakaShape(A.pose(t), RAKA_OUTFITS[x],
exprFor(anim, i))` dan warnai dengan `rakaColor(outfit)`. Ekspresi menambah variasi cache per frame (kunci cache
perlu memuat ekspresi).
