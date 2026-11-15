# Sprite Stacking: Gang Perumahan

Demo sprite stacking (pixel art yang bisa diputar ke sudut mana pun) dengan latar
perumahan dan gang di Indonesia. Buka `index.html` di browser, tanpa build.

## Kontrol (gaya game mobile)
- **Joystick analog di kiri**: sentuh di mana saja di separuh kiri layar. Dorong sedikit = jalan pelan, penuh = lari.
- **Tombol kanan**: Pukul (besar), Tendang, Pedang, Lompat, Lari, Guling, Jongkok, dan ⋯ (Sihir, Rangkak, Joget, Hormat, Lambai, Duduk, Jatuh).
  Tekan tombol serangan berulang = combo.
- **Naik/Turun**: tombol hijau muncul saat dekat motor, sepeda, atau mobil. Saat berkendara, joystick menunjuk arah tujuan.
- Keyboard: WASD/panah, Shift lari, J/K/L serang, Spasi lompat, R guling, F naik/turun, G joget, T hormat, Y lambai, B duduk, C kamera.

## Cara kerja sprite stacking
1. Buat model voxel L×W×H: dari 4 gambar tampak (mobil, robot) atau dari bentuk prosedural
   (manusia, rumah, pohon).
2. Tiap lapisan tinggi z = satu **slice** (gambar tampak atas lapisan itu). Lihat `buildVox`.
3. Gambar slice dari bawah ke atas, tiap slice naik 1 px dan diputar dengan sudut yang sama (`drawStack`).
   Objek diurutkan berdasarkan posisi y di layar, bayangan = gabungan semua slice.

## Urutan gambar & tumpang tindih
- Bangunan, pohon, dan gapura dipotong jadi dua lapis (`splitModel`): bawah (dinding/batang/tiang) dan atas
  (atap/kanopi/balok). Lapis atas digambar setelah tokoh yang berdiri di bawahnya.
- Kunci urutan bangunan = titik paling depan tapak dindingnya (`body`), bukan pusatnya.
- NPC yang duduk di bale pos ronda "menempel" ke objeknya (digambar setelah bale, sebelum atap).
- Penumpang kendaraan digambar di jok (`model.seat`), dinaikkan setinggi jok.
- Bangunan/atap/kanopi yang menutupi pemain otomatis dibuat tembus pandang.

## Warna, bayangan, weathering
- Palet kalem/natural; dinding diberi kotoran dekat tanah, noda rembesan vertikal, lumut, dan variasi warna (`weatherColor`).
- Bayangan matahari bangunan & pohon dipanggang ke tanah: tiap kolom voxel diproyeksikan searah `SUN`, lalu dihaluskan
  dan diberi warna kebiruan (`bakeShadows`). Ada juga ambient occlusion di kaki bangunan.
- Tanah: aspal dengan tambalan, retak, bekas ban; conblock berlumut; keramik halaman & lantai teras; selokan.
- Tokoh & kendaraan punya bayangan memanjang searah matahari.

## Skala
Tokoh dewasa ±36 voxel. Pintu 44, dinding 52, atap ±24, pagar 27, motor (jok ±21), sepeda (jok ±24), mobil 84×42×33.

## Manusia (±36 voxel)
- `STYLES`: tiap tokoh punya warna kulit, rambut (`spiky` jabrik, `short`, `sidepart` belah samping, `curly` keriting,
  `buzz` cepak, `mohawk`, `bob`, `long`, `ponytail`, `twintail` kuncir dua, `bun` sanggul, `bald`, `hijab`, `peci`, `cap`, `helmet`),
  atasan (pola `stripe`, `batik`, `koko`), bawahan (`pants`, `shorts`, `sarung`, `skirt`), sandal/sepatu,
  kacamata, perut buncit, dan skala (anak-anak lebih kecil).
- `humanShape(pose, style, part)`: rangka -> kepala/rambut/badan/lengan/kaki dari elipsoid & kapsul.
  Wajah: alis, mata (dengan highlight), hidung, mulut, pipi.
- Cahaya per voxel dari normal permukaan, 4 tingkat warna per material.

- Rambut punya poni (`BANGS`), helai gelap (`hair2`), dan bentuk khusus per gaya (`hairAt`). Rambut pemain bisa diganti di menu opsi.
- Ukuran grid tiap frame menyesuaikan isinya (pedang, sapu, guling, terbaring) dengan poros tetap di tengah,
  jadi tidak ada animasi yang terpotong. `composite()` menempel badan atas & bawah di tengah walau ukurannya beda.
- Grounding memakai bola kepala kasar, jadi rambut/topi/helm bisa tenggelam ke tanah saat guling terbalik.
  `humanShape` mencari voxel tubuh terendah (sapu/pedang boleh menapak) dan mengangkat frame (`sink`) supaya tidak terpotong.
- Kepala bisa menoleh (`hy`), pinggul bergoyang (`sy`), telapak kaki menapak/jinjit (`ftL/ftR`).
- Fase animasi jalan/lari maju sesuai jarak tempuh (`stride`), jadi kaki tidak meluncur. Gerak punya akselerasi & pengereman halus.

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
| Guling | R | seluruh badan, bergerak maju |
| Joget, Duduk | G, B (toggle) | seluruh badan |
| Hormat, Lambai | T, Y | badan atas |
| Naik motor, Mengayuh sepeda | F di dekat kendaraan | pose berkendara |
| NPC: menoleh, main HP, garuk kepala, peregangan, menyapu, ngobrol | - | variasi saat diam |

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
Pak RT (batik, kacamata), Dimas & Putri (seragam SD), Bayu, Mbak Rina, Sari (bob), Joni (mohawk), Mas Bakso,
Bang Ojol (helm hijau, keliling naik motor), Ucup (bersepeda di lapangan), plus kucing kampung.
Mereka berjalan di gang, duduk di pos ronda, menyapa saat didekati, dan bereaksi saat dipukul.

## Menambah tokoh / gerakan
- Tokoh baru: tambah entri di `STYLES`, lalu panggil `mk('idTokoh', x, y, 'wander', { seg: [...] })` di `spawnNPCs`.
- Gerakan baru: `keyed([[t, {sendi yang berubah}], ...])` di `ANIMS`. `kind: 'upper'` = bisa sambil jalan.
