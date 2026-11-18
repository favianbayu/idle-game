# 34. Template NPC Spawn (Warga Generik)

NPC bernama (segmen 10-33) dibuat satu per satu. Selain mereka, dunia butuh **ratusan orang tanpa nama tetap**: pejalan
kaki, siswa acak, buruh ganti shift, tentara lari pagi, petani, penonton balap. Segmen ini menetapkan **template** untuk
mereka: satu file voxel per peran, yang menghasilkan banyak variasi dari satu angka `v` (seed).

Gaya visual **sama persis** dengan tokoh utama (`tokoh-voxel/PANDUAN-TOKOH.md`):

- voxel halus 1/64 petak;
- ramp 4 tingkat per bahan;
- wajah peta 14x15, dengan mulut tepat di bawah hidung;
- rok dan sarung tidak pernah terbelah;
- dicek juga dari tampak atas.

Bedanya, NPC spawn **tidak punya ciri unik**: tanpa tato, tanpa luka, tanpa logo nama. Mereka juga **tidak boleh lebih
mencolok dari NPC bernama** di dekatnya.

## Aturan umum

| Aturan | Isi |
|---|---|
| Satu template = satu peran | Contoh `tentara`, `buruh`, `wargaPria`. Peran menentukan pakaian dan barang bawaan. Variasi hanya mengubah orangnya. |
| Seed `v` | Angka 0..63. Angka yang sama selalu menghasilkan orang yang sama (deterministik). Game menyimpan `v` di data spawn, jadi buruh yang sama besok tetap wajah yang sama. |
| Variasi per seed | Kulit, wajah, rambut, tubuh, tinggi, warna baju dalam palet peran, aksesori. Lihat tabel "Sumbu variasi". |
| Outfit | 1-3 outfit per peran, mengikuti jam atau kegiatan (contoh tentara: `pdl`, `olahraga`, `jaga`). Game memanggil `seragam` sebagai bawaan, jadi template memetakan `seragam` ke outfit kerjanya. |
| Ekspresi | Sama dengan tokoh: `biasa`, `kedip`, `marah`, `teriak`, `nyengir`, `ketawa`, `sakit`. |
| Nama | Diambil dari kolam nama per peran dan wilayah (Sunda di Sukamekar, Jawa di Kenanga, dan seterusnya). Bubble memakai kolam baris per peran (segmen 31 dan 33). |
| Batas mencolok | Warna baju NPC spawn sedikit lebih kusam (saturasi sekitar 80%) daripada NPC bernama. Aksesori paling banyak 2. |
| Prefiks bahan | Bahan global, jadi semua bahan spawn berprefiks `sp`: kulit `spKulit0..5`, rambut `spRmb_<warna>`, kain `spC_<warna>` (palet bersama di `spawn_base.js`). Template tidak membuat bahan sendiri kecuali benar-benar khas peran. |

## Sumbu variasi (dipakai semua template)

| Sumbu | Pilihan | Catatan |
|---|---|---|
| Kulit | 6 ramp: kuning langsat, sawo terang, sawo matang, sawo gelap, cokelat tua, bule (khusus turis) | Bobot: sawo matang paling sering. |
| Tubuh | kurus, sedang, gempal (perut buncit) | Mengubah SKEL (`shY`, `flap`, `ballR`) dan lebar dada atau perut. |
| Tinggi | -4% .. +4% | Diatur lewat skala di game (bukan di model), supaya geometri kaki tetap pas dengan rangka. Anak punya rangka sendiri. |
| Wajah | 8 set mata (bulat, sipit, sayu, tajam, besar, kecil, ramah, lelah) x 4 alis x 3 mulut dasar | Semua 15 baris. Alis z11, mulut z4 di bawah hidung. |
| Rambut pria | cepak, belah samping, ikal, plontos, poni, gondrong ikat, undercut (muda) | Uban otomatis sesuai umur. Topi atau helm menghapus rambut di bawahnya. |
| Rambut wanita | kuncir, sanggul, lurus sebahu, bob, kepang | Atau hijab (bergo, pashmina, segi empat) dalam 6 warna. Sekitar 55% wanita dewasa berhijab. |
| Rambut wajah (pria dewasa) | tidak ada, kumis tipis, kumis tebal, jenggot tipis | Kumis tepat di bawah hidung, mulut di bawahnya. |
| Kacamata | tidak ada (80%), bingkai hitam, bingkai tipis | |
| Warna baju | 4-6 warna dari palet peran | Seragam (tentara, buruh, polisi) tidak divariasikan warnanya. Yang berubah hanya orangnya dan aksesori kecil. |
| Aksesori | tas selempang, ransel, kantong kresek, HP di tangan, payung, topi, handuk di leher | Paling banyak 2. Daftar aksesori yang masuk akal ditentukan per peran. |

## Daftar template

### A. Warga lewat (pejalan kaki kota dan desa)

| Template | Menggantikan sid lama | Outfit | Palet dan aksesori | Muncul di |
|---|---|---|---|---|
| `wargaPria` | `bapakPeci`, `pemuda`, `pakRT` | `harian` (kaus atau kemeja + celana panjang), `jumatan` (koko + sarung + peci), `kantor` (kemeja + celana bahan) | Kaus polos, garis, kemeja kotak. Tas selempang, kresek, HP. | Trotoar, pasar, gang, masjid |
| `wargaWanita` | `mbak`, `ibuDaster` | `harian` (blus + celana atau rok panjang), `daster` (daster batik + sandal), `kantor` | Pastel dan batik. Tas tangan, kresek sayur, payung. | Trotoar, pasar, warung |
| `wargaHijab` | `ibuHijab`, `ibuHijab2` | `harian` (gamis atau tunik + rok), `pengajian` (gamis + kerudung lebar) | 6 warna hijab. Tas, kresek, menggandeng anak (opsional). | Semua wilayah |
| `wargaLansia` | `kakek` | `kakek` (kemeja lengan pendek + celana + peci atau topi), `nenek` (kebaya atau daster + kain + sanggul) | Tongkat, kipas. Jalan lebih lambat. | Teras, pos ronda, pasar |
| `wargaMuda` | `remaja`, `anakPunk` (generik) | `kampus` (kaus + kemeja luar + jins + ransel), `nongkrong` (hoodie + celana pendek), cewek: `jalan` (kaus + rok atau jins) | Earphone, HP, ransel. | Kafe, alun-alun, kampus |
| `wargaAnak` | `anakSD`, `anakSDcw`, `bocah` | `sd` (seragam merah putih), `main` (kaus + celana pendek + sandal), `ngaji` (koko atau mukena) | Layangan, bola, sepeda kecil. | Gang, lapangan, tanggul |
| `ojolLewat` | `ojol` | `jaket` (jaket hijau atau oranye + helm + masker) | Tas boks makanan. Lebih sering naik motor. | Jalan raya |

### B. Sekolah

| Template | Menggantikan | Outfit | Catatan |
|---|---|---|---|
| `siswaAcak` | `siswaA`, `siswaB`, siswa generik segmen 84 | `seragam` (putih abu), `olahraga` (kaus olahraga sekolah), `pramuka` (Rabu-Kamis) | Rambut cowok sekolah selalu rapi pendek (aturan sekolah). Tas punggung 6 warna. |
| `siswiAcak` | `siswiA`, `siswiB` | `seragam` (rok panjang abu), `olahraga`, `pramuka` | Sekitar 60% berhijab putih. Rok tidak boleh terbelah. |
| `guruAcak` | 12 guru tanpa nama | `pns` (seragam cokelat Senin-Selasa), `batik` (Kamis-Jumat), `bebas` | Map, buku, kacamata lebih sering (40%). |
| `siswaSTM` | anak STM Karya Bangsa (segmen 88), `anakSTM*` | `seragam` (kemeja putih logo STM, sering dikeluarkan, lengan digulung, celana abu kena oli, sepatu safety/boots), `praktek` (wearpack biru dongker), `nongkrong` (jaket/hoodie gelap) | Sekitar 15% putri, separuhnya berhijab. Rambut lebih bebas (jabrik boleh). |
| `siswaSMK` | siswa SMK Pariwisata Sukamekar, `anakSMK*` | `seragam` (putih + hitam), `hotel` (rompi hitam), `tataBoga` (topi koki + celemek), `pemandu` (polo hijau tua + papan jepit) | Sekitar 60% putri; rambut putri selalu diikat rapi atau berhijab. |

### C. Pekerja

| Template | Menggantikan | Outfit | Barang | Muncul di |
|---|---|---|---|---|
| `buruh` | `buruh` | `pabrik` (seragam biru dongker + topi atau helm putih + masker + sepatu safety), `pulang` (jaket + tas selempang) | Kotak bekal, ID card, kardus | Kawasan Industri saat ganti shift, pabrik teh |
| `kuli` | `mandor` (generik) | `proyek` (kaus lusuh + helm kuning + celana kerja + sepatu bot), `istirahat` (singlet + handuk) | Sekop, ember semen, gerobak dorong | Proyek PT Graha, gudang |
| `tukangParkir` | `tukangParkir`, `tukangParkir2` | `rompi` (rompi oranye + topi + peluit) | Peluit, kain lap | Depan ruko, pasar |
| `pedagang` | `tukangBakso` (generik), penjual nasi kucing, kelapa muda | `jualan` (kaus + celemek + handuk di leher) | Barang dagangan per jenis lapak | Kaki lima, pinggir jalan |
| `petani` | `petani`, `petaniW`, pemetik teh | `sawah` (caping + baju lengan panjang lusuh + celana digulung), `kebunTeh` (caping + kerudung + keranjang di punggung) | Cangkul, arit, keranjang | Sawah, kebun teh, kebun karet |
| `nelayan` | `nelayan` | `melaut` (kaus basah + celana pendek + topi), `TPI` (sepatu bot + celemek karet) | Jaring, ember ikan, dayung | Muara, TPI, waduk |
| `mekanik` | `mekanik` | `wearpack` (wearpack tim + topi), `bengkel` (kaus belel berminyak) | Kunci, lap | Pit sirkuit, bengkel |

### D. Aparat

| Template | Menggantikan | Outfit | Catatan |
|---|---|---|---|
| `tentara` | `tentara`, `tentaraJaga` | `pdl` (loreng hijau + baret atau helm + sepatu PDL), `olahraga` (kaus hijau + celana training, untuk regu lari subuh), `jaga` (loreng + rompi + senapan latihan) | Rambut selalu cepak tipis. Variasi hanya wajah, kulit, dan tubuh (selalu tegap, tidak gempal). |
| `polisi` | `polisi` | `polantas` (seragam cokelat + rompi hijau stabilo + helm putih), `sabhara` (cokelat + topi) | Peluit, tongkat lalu lintas. |
| `satpamAcak` | `satpam` (selain Satpam Udin dan Bambang) | `jaga` (putih-biru dongker atau hitam + topi) | Senter, HT. Logo bahu polos, tanpa nama. |
| `persit` | ibu-ibu Persit (segmen 33) | `seragam` (blus pink + rok) | Selalu berhijab. |

### E. Wisata dan acara

| Template | Menggantikan | Outfit | Catatan |
|---|---|---|---|
| `pendaki` | `pendaki` | `naik` (jaket warna-warni + carrier besar + kupluk), `camp` (fleece + sandal gunung) | Trekking pole, matras. |
| `turis` | gerombolan turis segmen 31 | `jalan` (kaus atau tank top + celana pendek + topi + sandal) | Kulit bule, rambut pirang, cokelat, atau merah. Kamera, peta, ransel. Wajah memerah kepanasan. |
| `penonton` | penonton sirkuit, futsal, pensi | `suporter` (kaus tim + ikat kepala) | Terompet, bendera kecil, syal. |
| `santri` | Fikri & Zaki dan santri lain | `santri` (koko + sarung + peci, atau gamis + kerudung) | Kitab, tasbih. |
| `muridSilat` | murid silat cilik (segmen 33) | `pangsi` (pangsi hitam kebesaran + sabuk) | Rangka anak. |

## Format file template

```js
// tokoh-voxel/src/sp_tentara.js
export const SPAWN = { sid: 'tentara', name: 'Prajurit', seragam: 'pdl', varian: 64 };
export const OUTFITS = { pdl: {...}, olahraga: {...}, jaga: {...} };
export const build = template(SPAWN, OUTFITS, (v, outfit) => {
  const d = gen(v, { sex: 'L', build: ['sedang', 'kurus'], hair: ['cepakTipis'], kumisP: 0.3 });   // orang dari seed
  d.top = { kind: 'loreng', c: 'lorDasar', pat: 'loreng', tuck: true };                         // baju peran
  d.bot = { kind: 'celana', c: 'lorDasar', pat: 'loreng', belt: true }; d.feet = { kind: 'pdl' }; d.head = 'baret';
  return d;
});
```

`tokoh-voxel/src/spawn_base.js` berisi:

- `gen(v, aturan)`: menentukan jenis kelamin, umur, kulit, tubuh, wajah (mata, alis, mulut, kumis, jenggot,
  kacamata), dan gaya rambut dari seed;
- `orang(d)`: merakit kepala, rambut atau jilbab, penutup kepala, badan, baju, pola kain, dan bawaan dari deskripsi `d`.

Template hanya mengisi pakaian dan barang bawaan.

## Cara game memakai template

1. **Spawn**: titik spawn menulis peran, wilayah, dan jadwal, contoh `{ role: 'buruh', at: 'gerbangPabrik', shift: '14:00' }`.
   Game memilih `v` dari kolam seed wilayah itu, supaya orang yang sama muncul lagi di tempat yang sama.
2. **Batas variasi di layar**: tiap peran memakai paling banyak **8 seed aktif** sekaligus, dengan cache bentuk voxel per
   `sid#v`. Barisan tentara 12 orang cukup 6 seed yang diulang dan diacak posisinya. Ini menjaga memori worker.
3. **Kunci worker**: `FINE[sid]` menerima `{ outfit, expr, helm, v }`. Cache memakai kunci `sid#v#outfit#expr`.
   Di game3d versi sekarang seed dan baju dibawa di nama sid tampilan: `FINE['tentara_3']`, baju lewat akhiran
   (`tentara_3~jaga`). Sid generik lama dipetakan di `SPAWN_OF` (`game3d/src/chars.js`), seed 0..7 dibagi bergiliran per peran.
4. **LOD**: NPC lebih jauh dari 40 petak memakai seed yang sama dengan tetangga terdekatnya, sehingga tidak ada build
   baru.
5. **Kolam nama dan baris**: `SPAWN_NAMES[role][wilayah]` dan `SPAWN_LINES[role]`. Baris diambil dari segmen 31 dan 33,
   ditambah reaksi umum segmen 31.
6. **Tidak menggantikan NPC bernama**: Satpam Udin, Satpam Bambang, Pak Polisi Sugeng, Mandor Sutris, dan lainnya tetap
   memakai file sendiri. Template hanya untuk orang tanpa nama.

## Urutan pembuatan

| Gelombang | Template | Alasan | Status |
|---|---|---|---|
| 1 | `spawn_base.js`, `wargaPria`, `wargaWanita`, `wargaHijab`, `wargaLansia`, `wargaMuda`, `wargaAnak`, `tentara`, `buruh`, `petani`, `siswaAcak` | Paling sering terlihat: pejalan kaki kota, asrama Batalyon, Kawasan Industri, sawah, sekolah. | Di game (`shots/sp_semua.png`) |
| 2 | `siswiAcak`, `guruAcak`, `ojolLewat`, `kuli`, `tukangParkir`, `polisi`, `satpamAcak`, `nelayan`, `mekanik`, `pedagang` | Melengkapi kota, sekolah, dan pantai. | Di game (`shots/sp_semua2.png`) |
| 3 | `pendaki`, `turis`, `penonton`, `santri`, `muridSilat`, `persit` | Wilayah luar dan acara. | Di game (`shots/sp_semua3.png`) |
| 4 | `siswaSTM`, `siswaSMK` | Sekolah lain: STM di kota, SMK di Sukamekar. | Di game (`shots/sp_stm.png`, `shots/sp_smk.png`) |

Tiap gelombang dipratinjau dulu sebagai lembar "satu template x 8 seed" sebelum masuk game. Aturan "jangan dicemplungin
dulu" tetap berlaku.

## Tokoh wilayah (segmen 33) di game: posisi dan kebiasaan

Ke-15 tokoh wilayah dibangun di atas `spawn_base.js` (satu file per tokoh di `tokoh-voxel/src`) dan ditempatkan oleh
`game3d/src/warga.js` dengan rencana langkah: jalan ke titik, mainkan animasi beberapa detik, lalu lanjut. Karena game
belum punya jam, jadwal harian segmen 33 dipadatkan menjadi satu putaran yang berulang. Titik dicari dekat koordinat peta
(petak) di tanah datar yang tidak menempel bangunan.

| Tokoh | Wilayah | Titik | Kebiasaan (urutan putaran) |
|---|---|---|---|
| Kyai Mahfud | Tegalsari | Halaman pesantren (-116, 90) | Mengajar 3 santri duduk, angkat tangan, baca kitab, ke perpustakaan, jalan ke pasar hewan (-94, 113) menyapa warga, kembali |
| Abah Karta | Sukamekar | Pendopo silat (274, -49) | Memberi aba-aba ke 3 murid (latihan jab, pukulan, tendangan serempak), contoh jurus, ke kebun (jongkok, angkat), duduk di teras |
| Neng Ayu | Sukamekar | Pinggir jalan dekat halte (263, -40) dan pendopo | Lihat motor lewat, melambai minta dibonceng, main HP, nonton latihan silat sambil tepuk tangan |
| Mandor Sabar | Sukamekar | Kebun teh, pabrik teh (280, -31) | Keliling di antara pemetik teh, tiup peluit, ngobrol, lalu catat timbangan di pabrik |
| Ir. Lukman | Sukamekar | Villa (205, -57), patok (214, -51) | Baca gambar proyek, telepon, jongkok pasang patok merah-putih, melihat lahan |
| Kang Ujo | Gunung Sangkala | Basecamp (119, -52) | Cek daftar pendaki, briefing rombongan, pungut sampah di sekitar pos |
| Pak Sudarmaji | Waduk | Dekat pintu air bendungan (-74, 40) | Lihat bendungan, catat debit, terima telepon, garuk kepala, cek lagi |
| Serma Hadi | Timur (Batalyon 3) | Lapangan apel (349.5, 40.5), gerbang asrama (318, 63) | Mengawasi apel, hormat, "Ulangi. Yang benar.", lalu ke gerbang |
| Tito | Timur (Batalyon 3) | Lapangan kecil asrama (306, 52) | Tendang bola, lari mengejar, sorak gol, ditemani 2 bocah |
| Mbak Sri | Timur (Kawasan Industri) | Gerbang pabrik (346, 110) | Absen 4 buruh yang berbaris ("Hadir!"), baca papan absen, ngobrol |
| Pak Rusdi | Timur (Kawasan Industri) | Depan gudang (360, 118) | Baca daftar tenaga harian, membentak, telepon Bang Sarip |
| Pak Yusuf | Sirkuit | Pit lane (368, 214.6) dan (352.5, 214.8) | Bicara di radio race control, angkat tangan, menyusuri pit, menegur mekanik |
| Wak Kodir | Muara | Kampung nelayan (309, 262.5), dekat dermaga | Jongkok membetulkan jaring, menatap laut, tertawa, memanggil anak buah di dermaga |
| Bu Romlah | Pantai Lintang | Deret warung seafood (134, 258) | Jongkok membakar ikan, teriak ke pelayan, antar pesanan, ngobrol |
| Mbah Darmo | Pantai Lintang | Mercusuar Tanjung Karang (236, 284) | Jalan sangat pelan membawa lampu minyak, menatap laut, duduk lama, melamun |
| Nek Sumi | Pandansari | Jalan desa dekat (210, 195) | Jamu gendong keliling bolak-balik, berhenti menawarkan jamu |

Anak sekolah lain:

- **STM Karya Bangsa (kota)**: 6 anak di depan STM (sekitar 141..157, 162..165): 2 ngobrol di gerbang (`anakSTM`),
  2 main HP dengan jaket (`anakSTMgaul`), 2 jongkok di apron bengkel dengan wearpack (`anakSTMbengkel`). Masuk daftar
  siswa (idle siswa) dan bisa diajak berantem (lv 2-3).
- **SMK Pariwisata (Sukamekar)**: pejalan di gang desa sekarang `anakSMK`, 3 anak ngobrol di gerbang SMK (252, -47.5),
  2 siswa tata boga mengangkat nampan di samping sekolah, 1 siswa pemandu menjelaskan kebun teh ke 2 wisatawan dekat halte.

Nama "Mbah Darmo" sebelumnya dipakai kakek pengisi di halaman desa. Kakek itu sekarang bernama Mbah Saleh.
