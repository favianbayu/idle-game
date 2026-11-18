# Panduan membuat tokoh voxel halus (gaya Raka v3)

Panduan ini merangkum aturan yang sudah disetujui favian untuk tokoh voxel halus. Contoh kodenya ada di `src/`
(Raka, Rani, Bimo, Bram, Nadia, Dimas, Sekar, Arga, Laras, Rizal, Uti, Tegar, Sasha, Kirana, Jojo, Andra, Mei, Gilang, Wulan, Om Darto, Cici, Mas Fajar, Kobar, Bang Jaka, Bu Narti, Pak RT Slamet, Pak Haris, Pak Gito, Rio, Kevin, Bu Hartini, Bu Ratna, Pak Hendro, Pak Wawan, Bu Sinta, Mr. Anton, Pak Gunadi, Bu Melati, Pak Ujang, Mak Iyah, Ama, Mbah Karto, Bu Sum, Pak Darmin, Mbak Rini, Pak Joko, Teh Euis, Koh Ahong, Dodi, Didi, Uda Rizki, Ustaz Hasan, Pak Satpam Bambang, Bu Veronika, Mbak Yuni, Kak Raffi,
Opa Willem, Nyonya Lita). Ikuti urutan bagian di bawah saat membuat tokoh baru.

## 1. Ukuran dan kisi

- 1 voxel = **1/64 petak** (2x lebih rapat dari tokoh lama). Semua voxel ada di **satu kisi lurus**. Tiap frame
  `frame.js` mem-voxel ulang bagian badan yang sudah dipose, jadi tidak pernah ada kubus miring.
- **Skala tinggi** diambil dari `NPC_STYLES` lama (`npc_styles.js`), bersama warna kulit dan rambut. Pakai salah satu
  kerangka (`SKEL`) di bawah, karena koordinat gambar tiap bagian harus cocok dengan titik sendinya.

| Templat | Skala lama | `SKEL` | Pinggul `pz` | Dada `cz` | Kepala | Contoh |
|---|---|---|---|---|---|---|
| Cewek | 1.22-1.24 | ank 4.5, shin 12.5, thigh 13, up 4, neck 21, shY 8, shZ 15, upper 10, fore 9, hipY 4 | 30 | 34 | 55 | Rani, Nadia, Sekar |
| Cowok sedang | 1.3-1.34 | ank 4.5, shin 13.5, thigh 14, up 4, neck 24, shY 9.5-10, shZ 17, upper 10.5, fore 12-12.5, hipY 4.5-5 | 32 | 36 | 60 | Bimo, Arga, Rizal (shY 9, lebih ramping; Raka memakai `SKEL_RAKA`) |
| Cowok tinggi | 1.36-1.38 | ank 4.5, shin 15, thigh 15.5, up 4, neck 24, shY 10, shZ 17, upper 11, fore 11.5, hipY 4.5 | 35 | 39 | 63 | Bram, Dimas |

- Titik sendi dihitung oleh `pivots(SKEL)` di `rig.js`. Bagian badan digambar dengan **koordinat tokoh mutlak**
  (x maju, y samping, z naik), sisi kanan = +y. Paha dimulai tepat di `pz`, dada di sekitar `cz`, leher berakhir tepat di bawah titik kepala.
  Kepala digambar dengan koordinat lokal: z 0 = dagu, z 14 = ubun-ubun.
- Kalau ruas diubah, geser juga gambar bagiannya. Pergelangan ada di `bahu - upper - fore`, dan kepalan tangan
  berpusat ±1.5 di bawahnya.

## 2. Wajah

- Tengkorak: lapis `rrect` z 0..14, lebar y -7..6 (lihat `skullLayer` di `model.js`). Bentuk rahang (V, kotak, bulat)
  diatur dari lapis z 0-2.
- **Peta wajah 14 x 15** (`paintFace(v, map, chars, 14, -7)`): baris 0 = z 14, kolom 0 = y -7. Urutan dari atas: dahi,
  alis, mata, (pipi), mulut, dagu.
- **Hidung** menonjol 1 voxel di x 7, y -1..0, setinggi 2-3 baris. **Mulut harus tepat di bawah hidung.** Jangan ada
  baris kosong di antara hidung dan baris mulut paling atas. Kalau ada, mulut terlihat terlalu turun ke dagu
  (kasus Nadia, sudah diperbaiki).
- **Alis dan mata harus berjarak 1 baris kosong** (wajah biasa/kedip/nyengir/ketawa). Alis yang menempel langsung di
  atas mata terbaca sebagai alis super tebal (kasus Laras, sudah diperbaiki). Poni harus cukup tinggi supaya baris alis
  tidak tertutup; alis tebal 2 baris (Uti) juga perlu 1 baris kulit di atasnya supaya tidak menyatu dengan poni.
- Mata 2-3 baris. Baris putih (`W`) di sisi luar membuat mata terbaca dari jauh. Pipi merah memakai bahan satu warna.
- Semua tokoh wajib punya 7 ekspresi: `biasa, kedip, marah, teriak, nyengir, ketawa, sakit`. `expr.js` memilihnya otomatis dari gerakan.
- Ciri khusus dilukis di peta wajah, misalnya bekas luka memotong alis (Arga), plester (Rani), atau lesung pipit.

## 3. Rambut

- Rambut dibuat sebagai cangkang (`rrect` sedikit lebih besar dari tengkorak), lalu **hanya mengisi sel kosong** di
  atas `zmin(x, y)`:
  - depan (x ≥ 5): garis poni (`FR[]` per kolom, atau satu angka);
  - samping dekat telinga: batas bawah jambang;
  - belakang: batas bawah tengkuk;
  - **tengah atas kepala: 0**. Jangan pernah memberi nilai besar (misalnya 99) di sini, karena kulit kepala akan
    terlihat dari atas dan tokoh terlihat botak (kasus Rani dan Bimo, sudah diperbaiki).
- **Selalu cek tampak atas** (pitch 0.9-1.4), bukan hanya tampak depan.
- Telinga yang tertutup rambut panjang tidak perlu digambar. Kalau digambar, kulitnya menembus rambut.
- **Fade** (Dimas): rambut samping dan belakang bawah dibagi beberapa tingkat menurut z, dari warna rambut ke warna
  kulit (`dHair → dFadeA → dFadeB → dFadeC → kosong`). Batas tiap tingkat diberi dither `t = z + ((x+y+z)&1)*0.9`
  supaya gradasinya halus. Bagian atas (z ≥ 12) dan poni tetap tebal.
- Buzz cut (Arga): satu lapis tipis dengan bintik pangkal rambut. Pakai hash acak `(x*73856093 ^ y*19349663 ^ z*83492791)`,
  bukan pola `x*a + y*b`, karena pola itu membentuk garis diagonal.
- Kuncir panjang yang perlu berayun memakai bagian `tail` (Rani). Kuncir dua rendah yang menggantung diam boleh
  digambar di dalam kepala (Sekar).
- Kuncir kuda yang digambar di kepala minimal 3 voxel tebal (x) dan 5 lebar (y) di pangkal; kalau 2x3 terlihat seperti
  tongkat dari samping (Mbak Dewi). Ikat rambut diletakkan di pangkal, ekornya menjuntai dari situ.
- Sanggul harus cukup besar (radius ±5, menonjol sampai x = -14) supaya kelihatan dari tampak serong (Bu Lastri).
- Uban di pelipis digambar sebagai petak polos (misalnya `z ≤ 12, x ≥ -2`), bukan pola papan catur, yang terlihat
  seperti kain kotak-kotak (Pak Tarno).

## 4. Badan dan baju

- Bagian: `foreR/L, head, (tail), armR/L, chest, (flapF), pelvis, (flapB), footR/L, shinR/L, thighR/L`. **Urutan di
  `assemble` = prioritas**: yang lebih dulu menang kalau dua bagian menempati sel yang sama. Tangan diletakkan paling
  depan supaya bisa menutup wajah atau rambut.
- Sisi kiri = `mirrorY()` dari sisi kanan. Benda yang tidak simetris digambar dengan fungsi bersisi (`fore(o, side)`,
  `shin(o, left)`), misalnya jam di tangan kiri atau deker lutut kiri.
- `ballMat` mengisi bola sendi (leher, bahu, siku, pinggul, lutut). Warnanya harus sama dengan kain atau kulit di
  sendi itu, kalau tidak terlihat bintik warna lain saat ditekuk.
- Lapisan baju menimpa bentuk dasar dengan `paint`, `pf/pb` (permukaan depan/belakang), dan `shell` (lapis luar).
  Jaket terbuka dibuat dengan menggeser bagian tengah depan 1 voxel ke dalam dan mengisinya dengan baju dalam.
- Detail kecil (badge OSIS, papan nama, kancing, logo) memakai bahan satu warna supaya tidak ikut diarsir.
- Benda di punggung (bakul jamu, ukulele disandang) digambar di bagian `chest` supaya ikut badan. Talinya digambar di
  permukaan depan dan belakang dada dengan `front`/`back` + 1.
- Tulisan di punggung muat sekitar 17 voxel (y -8..8) dengan huruf 5 baris dan jarak 1. Kata yang terlalu panjang
  (PARKIR) diganti simbol, misalnya rambu P putih di kotak biru.
- Warna jilbab dan baju luar harus kontras. Jilbab marun di atas blazer marun menyatu dan terlihat seperti hoodie (Bu Wati).
- Garis senyum (`s` di samping mulut) pada wajah dewasa kecil terlihat seperti jerawat atau jenggot. Lebih baik tidak dipakai.

## 5. Rok (wajib nyambung)

Rok **tidak boleh terbelah** jadi dua kaki saat jalan atau lari. Pakai `src/rok.js`:

1. `skirtPelvis(c, cS)`: pinggang dan sisi rok di pelvis.
2. `skirtPanel(c, cS, ±1, zHem)` sebagai `flapF` dan `flapB`. Panel ini ikut ayunan paha.
3. Rok panjang: `skirtThigh(c)` dan `skirtShin(c, cS)` membungkus kaki dengan kain rok.
4. Setelah `assemble`, isi `P.skirt = skirtInfo(P, c, cS, panjang)`.

Dengan `P.skirt`, `frame.js` mengisi **lambung cembung** semua voxel kain rok per lapis z. Celah di antara kaki
tertutup kain di setiap pose. Rok selutut (Rani) cukup memakai pelvis dan panel (`panjang = false`). Celana kulot
tidak memakai `P.skirt`. Sarung cowok (Rizal) juga rok panjang: pakai `rok.js` yang sama, motif kotak cukup dicat
ulang dengan dua bahan `c`/`cS` (bahan ketiga tidak ikut diisi lambung). Cek lembar `rok` (jalan, lari, tampak samping & depan) setiap kali mengubah rok.

## 6. Bahan dan warna

- Tiap bahan didaftarkan dengan `addRamps({ nama: [4 warna gelap → terang] })`. Satu warna saja = tidak diarsir.
  **Jangan 2 atau 3 warna**: `voxelFrame` gagal (`reading '0'`). Pilih 1 atau 4.
- Jumlah bahan global sudah lewat 255: kisi `Vox.dense` dan `voxelFrame` memakai `Uint16Array`. Kalau menyalin
  `vox.js`/`frame.js` ke game, salin versi 16 bit ini juga, kalau tidak warna tokoh terakhir jadi kacau.
- Tulisan/nomor di punggung (`pb`) harus dicerminkan: kolom `c` peta jadi `y = tengah - c`, bukan `c - tengah`, kalau
  tidak angkanya terbalik dari belakang (kasus nomor 7 Uti). Di dada (`pf`) pakai `y = c - tengah`.
- Topi di atas rambut: warnai ulang voxel rambut di atas garis topi (Uti: z >= 13) jadi bahan topi + lis 1 voxel,
  jangan buat kubah kecil terpisah; ukurannya otomatis pas dengan rambut.
- Helm full-face / tudung hoodie: bentuk elips (cek jarak tiap sel ke pusat), bukan `rrect` besar, kalau tidak jadi kubus.
- Tokoh yang tidak ada di `NPC_STYLES` lama (Kirana, Andra, Mei, Gilang, Pak RT Slamet): lembar `Game` tanpa kolom "Lama".
- Tokoh yang tidak bersekolah tetap harus bisa dibangun dengan outfit `seragam`, karena game selalu memanggil `seragam`:
  `build()` jatuh ke baju harian (Gilang: baju antar galon tanpa galon).
- Topi terbalik memakai lis di z 12..14, jadi alis tokoh bertopi turun ke z 11..10 (baris peta 3..4) supaya tidak tertutup lis.
- Barang yang dibawa sesekali (galon Gilang) jangan ditempel di baju: buat properti di `rig.js` `props()` yang
  dinyalakan oleh nilai pose (`galon: 1`) dan gerakan sendiri (`galon`, `galonWalk`). Gerakan lain (berantem) otomatis
  tanpa barang itu.
- Tokoh anak (Cici): rangka anak sendiri (pinggul z 20, dada z 23..35, bahu z 34, kepala z 39), kepala tetap ukuran
  normal (chibi). Rok anak cukup dibuat di pelvis saja karena pendek.
- Kepang/rambut panjang di punggung harus menempel ke punggung (x kepala sekitar -6), bukan melayang di x -9.
- Pola acak `rnd(x, y, z) % n` dengan n pangkat dua (8, 16) membuat garis miring; pakai n ganjil (7, 9, 13).
- Garis belahan rambut diwarnai lebih gelap dari rambut, bukan warna kulit: dari atas, garis kulit terbaca botak.
- Kamera sedikit dari atas, jadi apa pun yang menonjol di depan dahi (rambut di x 7, pet bergo, kopiah) menutupi satu
  baris di bawahnya. Sisakan satu baris kosong antara alis dan rambut/topi (Pak Haris: rambut depan mulai z 14, alis z 11;
  Pak RT: kopiah mulai z 13, alis z 11; Bu Narti: pet z 13..14, alis z 11).
- Kacamata yang duduk rendah (kacamata baca Bu Narti) tidak boleh menutupi baris mulut (z 4): taruh lensa di z 7 dan tepi
  bawah di z 6, di antara mata dan mulut.
- Kacamata tanpa bingkai (Pak Haris): cukup tepi atas + sisi luar warna abu kebiruan dan satu titik kilau; kotak penuh
  berwarna terang terbaca seperti kacamata renang dan menutupi mata.
- Bukaan wajah hijab/bergo: elips harus sampai ke baris alis (z 11), kalau tidak alisnya hilang dan wajah terlihat kosong.
- Motif kain berulang (bunga bergo, batik daster, parang, kotak flanel) dihitung di permukaan: depan/belakang pakai y,
  samping pakai x (`u = v.front(y, z) === x || v.back(y, z) === x ? y : x`), supaya motif tidak memanjang di sisi.
- Kuncir rendah pria (Bang Jaka): ikat di tengkuk z 4..5, ekor pendek sampai z -7 dan menempel ke punggung (x -9 → -7).
- Benda kecil di telinga (rokok Pak Gito, pulpen Rizal) harus menempel di y 8 (tepat di luar rambut), bukan y 9 yang melayang.
- Topi berlidah (Pak Hendro): hapus rambut yang menembus topi (rambut di luar elips topi pada z ≥ 12), dan turunkan alis
  ke z 10 supaya tidak tertutup lidah topi.
- Rok pensil (Bu Ratna): panel lurus tanpa melebar ke bawah, hem tinggi (z 15); jangan pakai panel rok A-line.
- Pola gelombang rambut panjang (Bu Melati) hanya di voxel permukaan belakang; di samping jadi garis mendatar yang aneh.
  Rambut yang menjuntai di samping wajah harus di luar |y| > 6.5 supaya mata tidak tertutup.
- Rambut putih/beruban (Pak Gunadi) jangan diberi bintik acak; bentuk acak-acakan cukup dari jambul runcing.
- Kacamata bulat tebal harus berpusat di baris mata; jangan sampai menutupi alis. Kalau alis tetap tertutup (hijab +
  kacamata, Bu Sinta), buang kacamatanya.
- Benda di tangan (HP Kevin, penggaris Bu Ratna, buku Pak Wawan) dibuat kecil dan menempel ke kepalan, bukan melayang.
- **Nama bahan harus unik di semua tokoh.** Daftar bahan bersifat global, jadi nama yang sama di file lain (mis. `rSkin`
  di Rani dan Rizal) menimpa warna tokoh yang dimuat lebih dulu. `addRamps` sekarang memberi peringatan
  "bahan dobel dengan warna beda" di konsol; pastikan peringatan itu tidak muncul saat `node build.mjs` / tes.
- Hidung yang turun sampai baris mulut (z 4) menutupi mulut. Hidung cukup z 5..6 kalau mulut dimulai di z 4 (Mak Iyah).
- Kain ikat kepala jangan diberi warna cokelat seperti rambut: dari jauh terbaca rambut keriting. Pakai warna kain yang
  jelas berbeda (Mak Iyah: biru batik).
- Kacamata tebal (Ama): gambar bingkainya saja, mata di dalamnya `W K W` supaya tidak terbaca kacamata hitam.
- Topeng las yang diangkat (Pak Joko) dibuat sebagai pelat miring berdiri di atas dahi dengan kaca hijau; pelat datar
  di atas kepala terbaca topi.
- Barang panjang di tangan (tongkat, sapu lidi) cukup sampai z 1 (tanah saat diam). `lift` dihitung dari pose, bukan dari voxel.
- Beri awalan unik per tokoh (`nSkin`, `dHair`, `aBuzz`) supaya tidak bertabrakan. Daftar bahan bersifat global. Bahan dari file
  tokoh lain (misalnya `denim`, `kick` dari `rani.js`) hanya boleh dipakai kalau file itu dimuat lebih dulu di `build.mjs`.
- Kacamata tipis (Kak Raffi): gambar bingkainya sebagai peta piksel 4 baris di lapisan depan (`x = front + 1`), lubang lensa
  dibiarkan kosong supaya mata kelihatan. Bingkai elips dengan pita jarak tebal selalu terbaca sebagai kacamata hitam.
- Highlight rambut panjang: hanya di permukaan belakang dan bawah (z <= 8). Pola di seluruh rambut terbaca sebagai garis-garis.
- Gamis atau sarung di rangka cowok (Ustaz Hasan): `rok.js` diukur untuk rangka cewek, jadi buat tabung kain sendiri di pelvis,
  paha, dan betis, lalu isi `P.skirt = { mats, fill, parts: ['pelvis', 'thighL', 'thighR', 'shinL', 'shinR'] }` tanpa panel.
- Kulit dan rambut mengikuti warna `NPC_STYLES` lama, atau warna kunci di guide desain tokoh (`docs/desain-sma/guide`).
- Peta wajah wajib tepat 15 baris (alis z 11, mulut z 4). Kalau menambah baris kumis atau jenggot, hitung ulang barisnya;
  14 baris menggeser seluruh wajah satu voxel.
- Kumis putih di kulit gelap terbaca sebagai gigi. Pakai abu-abu (Pak Darsono, Wak Udin). Tali atau ujung putih di dagu juga
  terbaca sebagai gigi (tali serut tudung Mas Tejo dibuang).
- Rambut bergelombang atau keriting di bawah topi/helm: buat tonjolan rambut hanya saat kepala tidak tertutup, kalau tidak
  menembus topi (Bang Ucok). Sanggul juga dilewati saat selendang dipakai di kepala (Mak Ijah).
- Benda pegangan berbentuk L terbaca sebagai pistol. Pemindai kasir dibuat badan kuning tebal dengan gagang pendek gelap.
- Pikulan, karung, dan bakul di punggung masuk ke bagian `chest`, supaya ikut badan saat berantem (pikulan Pak Darsono
  membentang x -26..25 dan tetap aman).
- Benda kecil yang menggantung di tengah dada (HT di saku) terbaca sebagai dasi. Jepit di pinggang samping saja.
- Motif bunga rapat di daster atau blus membuat baju terlihat berbintik; beri jarak kisi antarbunga.
- Celemek di atas rok panjang: cat juga panel depan rok (`flapF`), bukan hanya pelvis, karena panel itu menutupi pelvis
  dari depan. Batasi ke 10 lapis teratas panel supaya celemek tidak sampai mata kaki (Bu Ningsih).
- Undercut: warnai permukaan kulit kepala di sisi dan belakang dengan warna rambut tipis. Kalau dibuat sebagai lapisan baru
  di luar tengkorak, terbaca sebagai pinggiran topi (Bejo).
- Helm proyek atau helm cangkang berongga: buang voxel rambut di z >= 12 dulu, kalau tidak rambut tembus lewat celah cangkang
  dan terlihat sebagai kotak hitam di pinggir helm (Mandor Sutris).
- Logo kecil 5x5: pola silang penuh terbaca sebagai tanda plus atau tagar. Roda gigi dibuat dari gigi di pojok + lingkar
  bolong (`L.L.L / .LLL. / LLYLL`).
- Rambut jabrik: buat gumpalan 3x3 yang menyempit ke atas. Helai 1-2 voxel terbaca sebagai antena.
- Siswi berambut licin tanpa poni terlihat seperti cowok dari depan: tambah bulu mata di sudut luar, warna bibir, rona pipi,
  dan anting kecil (Maya).
- Kilau rambut panjang lurus: dua garis putus-putus saja. Banyak garis rapat terbaca sebagai kisi-kisi.

## 7. Mendaftarkan tokoh

1. `src/<tokoh>.js` mengekspor `SKEL, FACES, EXPRS, OUTFITS, build(opt)`.
2. Tambahkan ke `src/chars.js` (import bernama dengan alias; bundler tidak mendukung `import * as`).
3. Tambahkan nama modul ke daftar di `build.mjs`, **sebelum** `chars` dan sesudah modul yang bahannya dipakai.
4. Tambahkan lembar di `sheets.json`: `<tokoh>`, `Kepala`, `Wajah`, `Baju`, `Pose`, `Game`, plus `barisan`.
5. `node build.mjs && node shot.mjs shots`.
6. `build.mjs` hanya mengenali satu nama per baris `export const`. Tulis `export const A = ...;` dan `export const B = ...;`
   di baris terpisah, jangan `export const A = ..., B = ...` (nama kedua hilang dan halaman error). Dua tokoh bisa berbagi
   satu file (Dodi & Didi: `didi.js` hanya memanggil `kembar('didi')` dari `dodi.js`).
7. Tokoh anak (rangka Cici): lembar `Kepala`/`Wajah` perlu `cy` lebih kecil (520 dan 395), kalau tidak kepalanya terpotong.


## 8. Daftar periksa sebelum dikirim

- [ ] Tinggi di `barisan.png` masuk akal dibanding tokoh lain.
- [ ] Tampak atas: tidak ada kulit kepala tembus atau lubang.
- [ ] Mulut tepat di bawah hidung, wajah terbaca di ukuran game (`Wajah`, baris "· game").
- [ ] Rok tetap satu potong saat jalan dan lari (`rok`).
- [ ] Pose berantem (`Pose`): tangan, siku, dan lutut tidak berlubang. Properti tidak menembus wajah.
- [ ] Semua baju di `Baju` memakai bola sendi dengan warna yang benar.
- [ ] Tidak ada error di konsol saat `raka_voxel.html` dibuka.

## 9. NPC spawn (warga generik, guide segmen 34)

Orang tanpa nama (pejalan kaki, buruh, tentara, petani, siswa acak) **tidak** dibuat satu file per orang.

- `src/spawn_base.js` berisi `gen(v, aturan)` (orang dari seed: kulit, tubuh, wajah, rambut, kumis, kacamata) dan
  `orang(d)` (merakit kepala, badan, baju, dan bawaan dari deskripsi). Ramp dibuat otomatis dari satu warna dasar
  (`CLOTH`, `SKIN`, `HAIR`). Kain spawn sedikit lebih kusam (saturasi 86%) daripada tokoh bernama.
- Satu template = satu peran: `src/sp_<peran>.js` mengekspor `SPAWN, OUTFITS, EXPRS, build` dan hanya mengisi
  deskripsi (`d.top`, `d.bot`, `d.feet`, `d.head`, `d.hijab`, `d.acc`, `d.handR/handL`). `build({ outfit, expr, v })`.
- Rangka: tiga set geometri yang sudah teruji (`GEO.L` dari Pak Roni/Om Darto, `GEO.P` dari Fitri/Maya/Bu Inah,
  `GEO.A` dari Dodi). Tubuh `kurus/sedang/gempal` mengubah SKEL dan lebar dada; jangan ubah panjang kaki tanpa
  mengubah geometri.
- Pola kain: `polos, garis, garisTipis, kotak, batik (parang miring), bunga, loreng`. Batik model kotak-titik terbaca
  sebagai konfeti; pakai pita miring.
- Rambut perempuan: gaya ikat (`kuncir, kepang, sanggul`) memakai cangkang tipis dengan telinga kelihatan dan belahan
  tengah. Kalau semua memakai cangkang tebal, semuanya terlihat berhelm dari depan.
- Rona pipi hanya untuk anak dan sebagian perempuan, dengan warna lembut. Merah tua terbaca sebagai jerawat.
- Tali ransel cukup sampai ketiak (10 lapis). Tali panjang terbaca sebagai bretel.
- Helm motor menutup semua rambut: hapus seluruh voxel `spRmb_*`, bukan hanya di atas dahi, kalau tidak rambut mencuat
  di samping helm.
- Noda kotor (`kotor`): gumpalan 2x2x3 yang jarang. Titik acak per voxel terbaca sebagai loreng atau taburan meses.
- Bahan & properti baru gelombang 2: `helmMotor`, `celemek` (+ saku), `boks` ojol, `rompi` + `stripe` pantul, `ht` di
  pinggang, properti tangan `ht, senter, tongkatLL, sekop, ember, jaring, dayung, kunci, lap, sutil, ikan`.
- Bahan & properti baru gelombang 3: `ikatKepala` (pita di z12-13 dibangun di luar rambut, rambut tidak dihapus;
  `headPat` untuk motif iket, `headTulis` untuk tulisan suporter), baju `pangsi` (kerah V dangkal, lipatan silang),
  `nomor` punggung kaus tim (font 3x5, dua lapis per baris), `syal` suporter, `sabuk` silat (simpul di kiri depan),
  properti tangan `trekking, mug, peta, terompet, bendera, tasbih`.
- Nomor punggung: kamera dari belakang membalik sumbu y. Digit pertama ditaruh di y positif dan kolom glyph dibalik
  (`yo + 2 - q`), kalau tidak "23" terbaca "32" atau terbalik cermin. Selalu cek lembar `Cek` tampak belakang.
- Properti yang menghadap depan (terompet) dibuat miring ke atas, kalau lurus ke depan dari sudut pratinjau hanya
  terlihat ujungnya sebagai bola. Bendera dipasang di depan tiang (x positif), bukan di belakang lengan.
- Pilihan yang harus merata antar seed (syal, terompet/bendera) boleh memakai rumus dari `v` langsung. Beberapa `r.p()`
  setelah banyak `r.pick()` bisa berkorelasi sehingga 8 seed pratinjau semuanya jatuh ke sisi yang sama.
- `chars.js` mendaftarkan tiap template 8 kali (`<sid>_0..7`) untuk pratinjau. Lembar `sp_<sid>` (8 seed x semua
  baju), `sp_<sid>Cek` (atas & belakang), dan `sp_semua` (10 template x 8 seed).
