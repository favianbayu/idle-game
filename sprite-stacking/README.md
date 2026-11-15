# Sprite Stacking: Gang Perumahan

Demo sprite stacking (pixel art yang bisa diputar ke sudut mana pun) dengan latar
perumahan dan gang di Indonesia. Buka `index.html` di browser, tanpa build.

## Cara kerja sprite stacking
1. Buat model voxel L×W×H: dari 4 gambar tampak (mobil, robot) atau dari bentuk prosedural
   (manusia, rumah, pohon).
2. Tiap lapisan tinggi z = satu **slice** (gambar tampak atas lapisan itu). Lihat `buildVox`.
3. Gambar slice dari bawah ke atas, tiap slice naik 1 px dan diputar dengan sudut yang sama (`drawStack`).
   Objek diurutkan berdasarkan posisi y di layar, bayangan = gabungan semua slice.

## Manusia (±36 voxel)
- `STYLES`: tiap tokoh punya warna kulit, rambut (`short`, `long`, `ponytail`, `bun`, `bald`, `hijab`, `peci`, `cap`),
  atasan (pola `stripe`, `batik`, `koko`), bawahan (`pants`, `shorts`, `sarung`, `skirt`), sandal/sepatu,
  kacamata, perut buncit, dan skala (anak-anak lebih kecil).
- `humanShape(pose, style, part)`: rangka -> kepala/rambut/badan/lengan/kaki dari elipsoid & kapsul.
  Wajah: alis, mata (dengan highlight), hidung, mulut, pipi.
- Cahaya per voxel dari normal permukaan, 4 tingkat warna per material.

### Gerakan (`ANIMS`)
| Gerakan | Tombol | Jenis |
|---|---|---|
| Jalan / Lari | WASD / tahan Shift | siklus |
| Jongkok jalan / Merangkak | Q / E | siklus |
| Lompat | Spasi | seluruh badan |
| Pukul: jab → lurus → hook → uppercut | J berulang | **badan atas** |
| Tendang: depan → tinggi | K berulang | seluruh badan |
| Pedang: menyamping → atas-bawah → tusuk → putar | L berulang | badan atas (putar: seluruh badan) |
| Sihir | U | badan atas |
| Jatuh / bangun | H | seluruh badan |

- **Bergerak sambil menyerang**: gerakan "badan atas" dibangun hanya badan atas (`part: 'upper'`),
  kaki diambil dari frame jalan/lari/jongkok (`part: 'lower'`), lalu `composite()` menggabungkan
  slice per slice (tinggi pinggul disamakan dengan menggeser indeks slice).
- **Combo**: tekan tombol serangan lagi saat jurus sedang berjalan -> jurus berikutnya diantre.
- Serangan punya `hit` (waktu kena, jangkauan, sudut). NPC yang kena jatuh, mengeluh, lalu bangun.
- Frame dibangun saat pertama dipakai dan disimpan. Frame NPC dibangun bertahap lewat antrian.

## Dunia
- Jalan aspal + selokan (hanya bisa diseberangi lewat jembatan mulut gang), 4 gang conblock
  bergapura (MELATI, MAWAR, KAMBOJA, ANGGREK, DAHLIA, KENANGA, TERATAI, SEROJA).
- Rumah berjajar menghadap gang: dinding warna-warni, teras, pintu, jendela berteralis, roster,
  atap genteng limasan/pelana, toren air. Pagar besi dengan gerbang, pot tanaman, motor parkir, tong sampah.
- Warung (papan nama, terpal, renceng jajanan), mushola beratap tumpang, pos ronda, gerobak bakso,
  lapangan, bendera merah putih, jemuran, pohon mangga & pisang, tiang listrik dengan kabel.

## NPC
Bu Siti & Bu Ani (hijab), Bu Narti (daster, menyapu), Pak Haji (peci, koko, sarung), Mbah Darmo,
Pak RT (batik, kacamata), Dimas & Putri (seragam SD), Bayu, Mbak Rina, Mas Bakso, plus kucing kampung.
Mereka berjalan di gang, duduk di pos ronda, menyapa saat didekati, dan bereaksi saat dipukul.

## Menambah tokoh / gerakan
- Tokoh baru: tambah entri di `STYLES`, lalu panggil `mk('idTokoh', x, y, 'wander', { seg: [...] })` di `spawnNPCs`.
- Gerakan baru: `keyed([[t, {sendi yang berubah}], ...])` di `ANIMS`. `kind: 'upper'` = bisa sambil jalan.
