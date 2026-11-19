# 02. Gaya Portrait & Prompt

Semua portrait dialog memakai satu gaya, mengikuti lembar ekspresi Indah dan Arya (proyek Rimbasari):
**pixel art anime, menghadap 3/4 ke kanan, cel shading hangat, garis tepi cokelat gelap, mata besar berkilau,
rambut per helai**.

**Framing baru: kepala sampai paha.** Tiap sel memperlihatkan tokoh dari ujung rambut sampai pertengahan paha
(potongan "three-quarter shot"). Ekspresi tidak lagi cuma di muka: bahu, tangan, condong badan, dan berat tumpuan ikut
berubah per ekspresi. Ukuran akhir **480 x 720** per ekspresi (rasio 2:3), satu lembar = 12 ekspresi dalam grid 4 x 3
(1920 x 2160).

## Aturan framing

| Bagian | Aturan |
|---|---|
| Atas | Ujung rambut (atau hijab, topi, kacamata di kepala) menyisakan ruang kosong 4-6% tinggi sel. Rambut yang mengembang saat `kaget` atau `marah` tidak boleh terpotong |
| Bawah | Dipotong di **pertengahan paha**. Rok, celana, ujung jaket, celemek, dan tas yang tergantung sampai paha harus kelihatan |
| Kepala | Tinggi kepala sekitar 1/4 tinggi tubuh yang terlihat (proporsi anime remaja, bukan chibi). Mata di sekitar 18-20% dari atas sel |
| Arah | Badan 3/4 ke kanan, kepala boleh menoleh sedikit lebih jauh dari badan. Jangan menghadap lurus ke depan |
| Tangan | Kedua tangan **harus ada di dalam frame** di semua sel. Tangan di saku, di belakang badan, atau di pinggang tetap dihitung, asal bentuk lengan terbaca |
| Kaki | Kuda-kuda dan berat tumpuan terbaca dari pinggul dan paha (pinggul miring, satu paha maju), walau lutut tidak terlihat |
| Konsistensi | Tinggi badan, lebar bahu, panjang rambut, dan pakaian sama persis di 12 sel. Yang berubah hanya ekspresi dan pose |

Potongan **atas 480 x 480** dari tiap sel (kepala sampai pinggang) masih bisa dipakai sebagai bust dialog lama, jadi
UI dialog yang sudah ada tidak perlu diubah dulu.

## 12 ekspresi standar (urutan di grid)

| No | Kode | Muka | Gaya badan | Dipakai saat |
|---|---|---|---|---|
| 1 | `biasa` | Senyum tipis, mata terbuka | Berdiri santai, berat di satu kaki, bahu turun rileks. Pakai **pose khas** tokoh (lihat "Badan" di halaman NPC) | Dialog netral |
| 2 | `senyum` | Mata tertutup melengkung, senyum lembut | Kepala sedikit miring, bahu naik sedikit, kedua tangan bertaut di depan perut atau memegang properti dekat dada | Senang, terima kasih |
| 3 | `tertawa` | Mata tertutup, mulut terbuka lebar | Badan condong ke belakang, satu tangan menutup mulut atau memegang perut, bahu terangkat, pinggul ikut miring | Lucu, sangat senang |
| 4 | `sedih` | Alis turun, mata berkaca-kaca | Bahu turun dan membungkuk sedikit, kepala menunduk, kedua tangan memegang lengan sendiri atau meremas ujung baju | Kabar buruk, ditolak |
| 5 | `marah` | Alis menukik, bibir rapat | Bahu tegang dan terangkat, tangan mengepal di samping badan atau satu tangan di pinggang, badan maju sedikit ke depan | Tersinggung, kado dibenci |
| 6 | `kaget` | Mata membulat, mulut "o" | Badan tersentak ke belakang, kedua tangan terangkat setinggi dada dengan telapak terbuka, rambut dan ujung baju sedikit terangkat | Kejutan |
| 7 | `malu` | Pipi merah, melirik ke samping, senyum kecil | Badan sedikit memutar menjauh, satu tangan menggaruk pipi atau memainkan rambut, tangan lain di belakang badan, lutut agak merapat | Digoda, dipuji, romance |
| 8 | `bingung` | Satu alis naik, melirik ke atas | Kepala miring, satu jari di dagu atau menggaruk kepala, tangan lain memegang siku, berat pindah ke satu kaki | Pertanyaan aneh |
| 9 | `jatuhcinta` | Mata berbentuk hati, pipi merah | Kedua tangan menggenggam di dada (atau memeluk properti), badan condong ke depan, bahu naik, berjinjit sedikit sehingga pinggul terangkat | Event 6 & 8 hati, kado favorit |
| 10 | `cemas` | Alis naik, mulut bergelombang, setetes keringat | Bahu mengecil dan merapat, kedua tangan saling meremas di depan perut, badan sedikit mundur, lutut merapat | Takut, gugup |
| 11 | `sinis` | Mata setengah tertutup, senyum miring | Tangan bersedekap, dagu terangkat, berat di satu kaki dengan pinggul menonjol, badan agak menyamping | Mengejek, curiga, cemburu |
| 12 | `lelah` | Mata terpejam, mulut menguap | Badan melorot, satu tangan menutup mulut yang menguap, tangan lain menggantung lemas atau menyeret tas, kepala miring | Ngantuk, capek, malam |

### Skala gerak per watak

Pose di atas adalah versi **sedang**. Tiap tokoh punya skala gerak di baris "Badan" pada prompt-nya:

- **Kecil** (Nadia, Sekar, Wulan, Arga, Rizal, Bram): gerakan ditahan. `tertawa` cukup menutup mulut tanpa condong,
  `kaget` cukup satu tangan terangkat, `marah` tanpa kepalan besar.
- **Sedang** (Sasha, Kirana, Dimas, Tegar): ikut tabel.
- **Besar** (Laras, Uti, Mei, Jojo, Andra, Gilang, Bimo): gerakan dilebihkan. `tertawa` sampai membungkuk, `kaget`
  kedua tangan tinggi dan satu kaki terangkat, `marah` menunjuk ke depan.

Kalau ada gerakan khas tokoh yang lebih kuat dari tabel (misal Tegar membetulkan kacamata saat `bingung`), pakai yang
ditulis di baris "Badan" tokoh itu.

## Prompt dasar (dipakai untuk semua tokoh)

Tempel prompt dasar ini, lalu tambahkan bagian **"Tokoh"** dan **"Badan"** dari halaman tiap NPC.

```
Pixel art character expression sheet, 12 cells in a 4x3 grid, each cell 2:3 portrait ratio showing the SAME character
in a three-quarter shot framed from the top of the head down to mid-thigh, body turned 3/4 facing slightly right,
both hands always inside the frame, small empty margin above the hair. Style: detailed modern pixel art like a cozy
life-sim RPG, warm cel shading with 3-4 tones per color, dark brown pixel outlines, large expressive anime eyes with two
white highlights, hair drawn in clumps of strands with highlight streaks, soft blush, teen anime proportions (head about
one quarter of the visible body, not chibi). Plain dark charcoal background, no floor, no props except the character's
own. Indonesian high school setting. Identical face, hair, height, body shape, clothes and colors in all 12 cells;
only facial expression and body pose change.
Cells in order, face + body:
1 neutral slight smile, relaxed stance with weight on one leg (use the character's signature pose);
2 eyes-closed gentle smile, head tilted, hands clasped in front of the stomach;
3 laughing with open mouth, leaning back, one hand covering the mouth or holding the stomach;
4 sad and teary, shoulders drooping, head down, hands gripping own arm or the hem of the shirt;
5 angry furrowed brows, tense raised shoulders, fists clenched at the sides, leaning forward;
6 surprised round mouth, jolting backward, both open palms raised to chest height, hair and clothes lifted;
7 shy blushing looking away, body turned away, one hand scratching the cheek or twirling hair, other hand behind the back;
8 confused with one brow raised, head tilted, finger on the chin, other hand holding the elbow;
9 heart eyes blushing, both hands clasped at the chest, leaning forward on tiptoe;
10 anxious wavy mouth with sweat drop, shrinking shoulders, hands wringing in front of the stomach, knees together;
11 smug half-lidded smirk, arms crossed, chin up, hip jutting out to one side;
12 sleepy yawning, slumped posture, one hand covering the yawn, other arm hanging limp.
Tokoh: <deskripsi tokoh>
Badan: <tubuh, pakaian sampai paha, pose khas, skala gerak>
```

Untuk tokoh pendukung dewasa yang cuma 6 ekspresi, ganti dua baris pertama jadi `6 cells in a 3x2 grid` dan pakai
pose 1-6 saja.

## Aturan pakai

- Tiap tokoh punya **warna kunci** (2-3 warna) yang sama dengan sprite voxel-nya, supaya portrait dan sprite terasa satu orang.
- Seragam SMA 3: kemeja putih krem (di portrait dibuat krem hangat, bukan putih abu-abu), badge OSIS kecil di saku kiri
  kecuali disebut lain. Karena sekarang terlihat sampai paha, **bawahan wajib disebut**: rok abu panjang (putri) atau
  celana panjang abu dengan ikat pinggang hitam (putra), dan apakah kemeja dimasukkan atau dikeluarkan.
- **Baju portrait = outfit voxel.** Di atas tiap prompt NPC tertulis nama outfit voxel yang dipakai (misal Kirana
  `balap`, Bram `geng`). Detail kecil yang sudah diputuskan waktu bikin sprite (Wulan kepang di punggung + sabuk hijau,
  Bimo berkacamata, topi Gilang biru-kuning, jam di tangan kiri, dll) wajib sama, supaya portrait dan sprite satu orang.
  Kalau sprite berubah, ubah juga prompt-nya. Acuan: `tokoh-voxel/src/<tokoh>.js` dan `tokoh-voxel/PANDUAN-TOKOH.md`.
- Kacamata hitam atau masker yang di sprite menutup mata/mulut tidak dipakai di muka saat portrait (dipegang atau
  diturunkan ke leher), karena ekspresi harus terbaca.
- Properti yang dipegang (map, buku, kamera, bola) harus sama di semua sel. Di pose yang butuh dua tangan (`senyum`,
  `jatuhcinta`, `cemas`) properti dipeluk ke dada atau dijepit di ketiak, jangan hilang.
- Setelah generate: potong per sel, skala ke 480 x 720 tanpa anti-alias (nearest neighbour), simpan sebagai
  `portrait/<id>_<kode>.png`, contoh `portrait/nadia_malu.png`. Bust lama (480 x 480) diambil dari potongan atas.
- Tokoh pendukung dewasa cukup 6 ekspresi (`biasa`, `senyum`, `tertawa`, `sedih`, `marah`, `kaget`).
- Kalau model gambar sering mengubah baju atau tinggi badan antar sel, generate dua lembar 3 x 2 (sel 1-6, lalu 7-12)
  dan pakai lembar pertama sebagai referensi gambar untuk lembar kedua.
