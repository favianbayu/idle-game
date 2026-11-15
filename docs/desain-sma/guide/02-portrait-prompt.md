# 02. Gaya Portrait & Prompt

Semua portrait dialog memakai satu gaya, mengikuti lembar ekspresi Indah dan Arya (proyek Rimbasari):
**pixel art anime, bust-up, menghadap 3/4 ke kanan, cel shading hangat, garis tepi cokelat gelap, mata besar berkilau,
rambut per helai**. Ukuran akhir **480 x 480** per ekspresi, satu lembar = 12 ekspresi dalam grid 4 x 3.

## 12 ekspresi standar (urutan di grid)

| No | Kode | Ekspresi | Dipakai saat |
|---|---|---|---|
| 1 | `biasa` | Senyum tipis, mata terbuka | Dialog netral |
| 2 | `senyum` | Mata tertutup melengkung, senyum lembut | Senang, terima kasih |
| 3 | `tertawa` | Mata tertutup, mulut terbuka lebar | Lucu, sangat senang |
| 4 | `sedih` | Alis turun, mata berkaca-kaca | Kabar buruk, ditolak |
| 5 | `marah` | Alis menukik, bibir rapat | Tersinggung, kado dibenci |
| 6 | `kaget` | Mata membulat, mulut "o" | Kejutan |
| 7 | `malu` | Pipi merah, melirik ke samping, senyum kecil | Digoda, dipuji, romance |
| 8 | `bingung` | Satu alis naik, melirik ke atas | Pertanyaan aneh |
| 9 | `jatuhcinta` | Mata berbentuk hati, pipi merah | Event 6 & 8 hati, kado favorit |
| 10 | `cemas` | Alis naik, mulut bergelombang, setetes keringat | Takut, gugup |
| 11 | `sinis` | Mata setengah tertutup, senyum miring | Mengejek, curiga, cemburu |
| 12 | `lelah` | Mata terpejam, mulut menguap | Ngantuk, capek, malam |

## Prompt dasar (dipakai untuk semua tokoh)

Tempel prompt dasar ini, lalu tambahkan bagian **"Tokoh"** dari halaman tiap NPC.

```
Pixel art character portrait sheet, 12 expressions in a 4x3 grid, each cell a bust-up portrait of the SAME character,
3/4 view facing slightly right, shoulders visible. Style: detailed modern pixel art like a cozy life-sim RPG,
warm cel shading with 3-4 tones per color, dark brown pixel outlines, large expressive anime eyes with two white
highlights, hair drawn in clumps of strands with highlight streaks, soft blush. Plain dark charcoal background.
Indonesian high school setting. Consistent face, hair, clothes and colors in all 12 cells.
Expressions in order: 1 neutral slight smile, 2 eyes-closed gentle smile, 3 laughing open mouth, 4 sad teary,
5 angry furrowed brows, 6 surprised round mouth, 7 shy blushing looking away, 8 confused one brow raised,
9 heart eyes blushing, 10 anxious wavy mouth with sweat drop, 11 smug half-lidded smirk, 12 sleepy yawning.
Tokoh: <deskripsi tokoh>
```

## Aturan pakai

- Tiap tokoh punya **warna kunci** (2-3 warna) yang sama dengan sprite voxel-nya, supaya portrait dan sprite terasa satu orang.
- Seragam SMA 3: kemeja putih krem (di portrait dibuat krem hangat, bukan putih abu-abu), badge OSIS kecil di saku kiri
  kecuali disebut lain.
- Setelah generate: potong per sel, skala ke 480 x 480 tanpa anti-alias (nearest neighbour), simpan sebagai
  `portrait/<id>_<kode>.png`, contoh `portrait/nadia_malu.png`.
- Tokoh pendukung dewasa cukup 6 ekspresi (`biasa`, `senyum`, `tertawa`, `sedih`, `marah`, `kaget`).
