# 36. Kado

Katalog item kado (harga & toko) dan selera tiap NPC. Aturan poin tetap segmen 03: **favorit +80, suka +45, biasa +20,
benci -40**, kado di hari ulang tahun x4, maksimal 2 kado per minggu per tokoh. Item yang tidak ada di daftar tokoh = biasa,
kecuali sampah (-40 untuk semua). Data mesin: `guide/data/npc.json` (`item` dan `npc.*.kado`).

## Aturan tambahan

| Aturan | Isi |
|---|---|
| Bungkus kado | Kertas kado di toko buku Rp 2.000: +5 poin (kecuali Jojo, yang benci kado dibungkus rapi) |
| Kado yang sama | Item sama ke tokoh sama dalam 7 hari: poin setengah |
| Di depan orang | Beberapa tokoh berubah reaksi kalau diberi di tempat ramai (lihat catatan Sasha, Bram, Serma Hadi) |
| Kado buatan sendiri | Es kopi susu buatan pemain di warkop & Gelang Benang buatan sendiri dihitung +10 poin dari nilai biasanya |
| Kiriman ibu | Paket bulanan dari ibu (kerupuk, sambal, beras) jadi item `kerupuk_desa`, gratis, disukai banyak NPC dewasa |
| Rokok | Tidak bisa dibeli pemain (pelajar). Item ini hanya muncul dari event; semua NPC dewasa membencinya kalau datang dari pemain |

## Katalog item

| Id | Item | Harga | Beli di | Kategori |
|---|---|---|---|---|
| `es_kopi_susu` | Es kopi susu Warkop Simpang | Rp 8.000 | Warkop Simpang & rumah Om Darto (kamar pemain) | minuman |
| `kopi_hitam` | Kopi hitam tubruk | Rp 5.000 | Warkop Simpang & rumah Om Darto (kamar pemain) | minuman |
| `teh_sukamekar` | Teh pucuk Sukamekar (bungkus) | Rp 15.000 | Pabrik teh tua | minuman |
| `es_teh` | Es teh manis | Rp 3.000 | Warkop Simpang & rumah Om Darto (kamar pemain) | minuman |
| `susu_stroberi` | Susu stroberi kotak | Rp 6.000 | Ruko Pelita & bengkel Mas Fajar | minuman |
| `susu_cokelat` | Susu cokelat kotak | Rp 6.000 | Ruko Pelita & bengkel Mas Fajar | minuman |
| `es_cendol` | Es cendol / dawet | Rp 7.000 | Pasar Wirabumi & terminal angkot | minuman |
| `es_jeruk` | Es jeruk | Rp 5.000 | Kantin | minuman |
| `gorengan` | Gorengan sebungkus | Rp 5.000 | Warung Mak Iyah, belakang sekolah | makanan |
| `pisang_goreng` | Pisang goreng | Rp 5.000 | Warung Mak Iyah, belakang sekolah | makanan |
| `cokelat` | Cokelat batang | Rp 12.000 | Ruko Pelita & bengkel Mas Fajar | makanan |
| `martabak` | Martabak manis keju-cokelat | Rp 30.000 | Alun-alun (pasar malam Sabtu, bangku beringin) | makanan |
| `bakso` | Bakso Pak Pras (bungkus) | Rp 15.000 | SMA Negeri 3 Wirabumi, gerbang | makanan |
| `nasi_goreng` | Nasi goreng Jl. Lingkar | Rp 15.000 | Warung nasi goreng Jl. Lingkar | makanan |
| `nasi_pecel` | Nasi pecel | Rp 10.000 | Pasar Wirabumi & terminal angkot | makanan |
| `nasi_telur` | Nasi telur dadar | Rp 8.000 | Warkop Simpang & rumah Om Darto (kamar pemain) | makanan |
| `roti_sobek` | Roti sobek | Rp 10.000 | Ruko Pelita & bengkel Mas Fajar | makanan |
| `roti_bakar` | Roti bakar | Rp 12.000 | Alun-alun (pasar malam Sabtu, bangku beringin) | makanan |
| `cilok` | Cilok bumbu kacang | Rp 5.000 | SMA Negeri 3 Wirabumi, gerbang | makanan |
| `bakpao` | Bakpao Ama | Rp 6.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | makanan |
| `kacang_rebus` | Kacang rebus | Rp 5.000 | Alun-alun (pasar malam Sabtu, bangku beringin) | makanan |
| `jagung_bakar` | Jagung bakar Bukit Bintang | Rp 10.000 | Bukit Bintang, warung jagung bakar | makanan |
| `ikan_bakar` | Ikan bakar waduk (bungkus) | Rp 25.000 | Dermaga perahu & warung ikan bakar | makanan |
| `kerupuk_desa` | Kerupuk & sambal kiriman ibu | gratis / tidak dijual | Warkop Simpang & rumah Om Darto (kamar pemain) | makanan |
| `es_krim` | Es krim cone | Rp 10.000 | Plaza Wirabumi (mal, bioskop, butik) | makanan |
| `burger` | Burger mal | Rp 25.000 | Plaza Wirabumi (mal, bioskop, butik) | makanan |
| `kue_ultah` | Kue ulang tahun kecil | Rp 45.000 | Plaza Wirabumi (mal, bioskop, butik) | makanan |
| `gula_aren` | Gula aren Tegalsari | Rp 18.000 | Pasar hewan Tegalsari | bahan |
| `kelapa` | Kelapa parut (bahan uduk) | Rp 10.000 | Pasar Wirabumi & terminal angkot | bahan |
| `telur_sekilo` | Telur sekilo | Rp 28.000 | Pasar Wirabumi & terminal angkot | bahan |
| `makanan_kucing` | Makanan kucing | Rp 15.000 | Ruko Pelita & bengkel Mas Fajar | lain |
| `rokok_kretek` | Rokok kretek (tidak dijual ke pelajar) | gratis / tidak dijual | - | terlarang |
| `komik_khusus` | Komik edisi khusus | Rp 45.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | buku |
| `buku_novel` | Novel | Rp 35.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | buku |
| `buku_puisi` | Buku puisi | Rp 35.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | buku |
| `buku_resep` | Buku resep tata boga | Rp 40.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | buku |
| `buku_seni` | Buku seni ilustrasi | Rp 55.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | buku |
| `buku_arsitektur` | Buku arsitektur | Rp 60.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | buku |
| `atlas` | Buku atlas dunia | Rp 40.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | buku |
| `buku_pelajaran` | Buku latihan soal | Rp 30.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | buku |
| `partitur` | Partitur piano lama | Rp 30.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | buku |
| `buku_catatan` | Buku catatan bagus | Rp 15.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | alat_tulis |
| `pulpen_kaligrafi` | Set pulpen kaligrafi | Rp 40.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | alat_tulis |
| `pulpen_tinta` | Pulpen tinta bagus | Rp 25.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | alat_tulis |
| `pensil_mekanik` | Pensil mekanik | Rp 12.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | alat_tulis |
| `pembatas_buku` | Pembatas buku unik | Rp 8.000 | Pasar loak & lapak rongsok | alat_tulis |
| `cat_air` | Set cat air | Rp 65.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | seni |
| `cat_semprot` | Set cat semprot | Rp 60.000 | Pasar loak & lapak rongsok | seni |
| `buku_sketsa` | Buku sketsa besar | Rp 30.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | seni |
| `buku_sketsa_fashion` | Buku sketsa fashion | Rp 35.000 | Toko Buku Pena & studio lantai 2 (rumah Mei) | seni |
| `kain_batik` | Kain batik tulis | Rp 50.000 | Pasar Wirabumi & terminal angkot | seni |
| `senar_gitar` | Senar gitar baru | Rp 25.000 | Pasar Wirabumi & terminal angkot | musik |
| `senar_bass` | Senar bass | Rp 35.000 | Pasar Wirabumi & terminal angkot | musik |
| `pick_gitar` | Pick gitar | Rp 5.000 | Pasar Wirabumi & terminal angkot | musik |
| `kaset_langka` | Kaset / piringan bekas langka | Rp 40.000 | Pasar loak & lapak rongsok | musik |
| `kunci_set` | Kunci set lengkap | Rp 60.000 | Ruko Pelita & bengkel Mas Fajar | bengkel |
| `suku_cadang` | Suku cadang langka (motor Mas Danu) | Rp 80.000 | Pasar loak & lapak rongsok | bengkel |
| `sarung_tangan_bengkel` | Sarung tangan bengkel | Rp 12.000 | Ruko Pelita & bengkel Mas Fajar | bengkel |
| `sarung_tangan_balap` | Sarung tangan balap | Rp 55.000 | Ruko Pelita & bengkel Mas Fajar | bengkel |
| `knalpot_kecil` | Knalpot custom kecil | Rp 90.000 | Bengkel Wijaya Motor (rumah Kirana & Kobar) | bengkel |
| `stiker_motor` | Stiker motor | Rp 7.000 | Ruko Pelita & bengkel Mas Fajar | bengkel |
| `bola_basket` | Bola basket kulit | Rp 70.000 | Plaza Wirabumi (mal, bioskop, butik) | olahraga |
| `headband` | Headband | Rp 10.000 | Plaza Wirabumi (mal, bioskop, butik) | olahraga |
| `kaos_kaki_futsal` | Kaos kaki futsal | Rp 12.000 | Plaza Wirabumi (mal, bioskop, butik) | olahraga |
| `sepatu_lari` | Sepatu lari | Rp 120.000 | Plaza Wirabumi (mal, bioskop, butik) | olahraga |
| `roda_skate` | Roda skateboard baru | Rp 45.000 | Pasar loak & lapak rongsok | olahraga |
| `joran` | Joran pancing | Rp 35.000 | Pasar Wirabumi & terminal angkot | olahraga |
| `kartu_memori` | Roll film / kartu memori | Rp 50.000 | Studio Foto Kilat (rumah Jojo di lantai 2) | foto |
| `lensa_bekas` | Lensa bekas | Rp 120.000 | Pasar loak & lapak rongsok | foto |
| `kamera_saku` | Kamera saku bekas | Rp 80.000 | Pasar loak & lapak rongsok | foto |
| `lego_arsitektur` | Set lego arsitektur | Rp 75.000 | Plaza Wirabumi (mal, bioskop, butik) | mainan |
| `voucher_warnet` | Voucher warnet 5 jam | Rp 15.000 | Warnet Pusat Kota | lain |
| `bunga` | Bunga dari pasar | Rp 10.000 | Pasar Wirabumi & terminal angkot | bunga |
| `bibit_melati` | Bibit bunga melati | Rp 15.000 | Pasar Wirabumi & terminal angkot | bunga |
| `ikan_cupang` | Ikan cupang | Rp 15.000 | Pasar Wirabumi & terminal angkot | lain |
| `gelang_benang` | Gelang Benang (untuk nembak) | Rp 15.000 | Alun-alun (pasar malam Sabtu, bangku beringin) | spesial |
| `boneka` | Boneka | Rp 30.000 | Plaza Wirabumi (mal, bioskop, butik) | mainan |
| `make_up` | Set make-up | Rp 50.000 | Plaza Wirabumi (mal, bioskop, butik) | kosmetik |
| `barang_mewah` | Barang bermerek mahal | Rp 250.000 | Plaza Wirabumi (mal, bioskop, butik) | mewah |
| `barang_palsu` | Barang bermerek palsu | Rp 40.000 | Pasar loak & lapak rongsok | mewah |
| `terompet` | Terompet mainan | Rp 5.000 | Alun-alun (pasar malam Sabtu, bangku beringin) | mainan |
| `mainan_senjata` | Pistol / borgol mainan | Rp 15.000 | Alun-alun (pasar malam Sabtu, bangku beringin) | mainan |
| `pisau_dapur` | Pisau dapur bagus | Rp 40.000 | Pasar Wirabumi & terminal angkot | dapur |
| `celemek` | Celemek baru | Rp 20.000 | Pasar Wirabumi & terminal angkot | dapur |
| `tasbih` | Tasbih kayu kokka | Rp 25.000 | Pasar Wirabumi & terminal angkot | religi |
| `kitab_tua` | Kitab tua dari pasar loak | Rp 45.000 | Pasar loak & lapak rongsok | buku |
| `minyak_urut` | Minyak urut | Rp 15.000 | Pasar Wirabumi & terminal angkot | kesehatan |
| `jaket_gunung` | Jaket gunung bekas | Rp 90.000 | Pasar loak & lapak rongsok | pakaian |
| `radio_tua` | Radio transistor tua | Rp 50.000 | Pasar loak & lapak rongsok | lain |
| `kopi_bubuk` | Kopi bubuk Simpang Tengah Malam | Rp 25.000 | Warkop Simpang & rumah Om Darto (kamar pemain) | minuman |
| `jaring` | Benang jaring nilon | Rp 30.000 | TPI & dermaga nelayan | kerja |
| `kembang_api` | Kembang api | Rp 10.000 | Alun-alun (pasar malam Sabtu, bangku beringin) | mainan |
| `sampah` | Sampah / barang rusak | gratis / tidak dijual | - | sampah |

## Selera tiap NPC

| NPC | Favorit (+80) | Suka (+45) | Biasa (+20) | Benci (-40) | Catatan |
|---|---|---|---|---|---|
| **NPC utama cewek** | | | | | |
| Nadia Kusuma | Komik edisi khusus, Set pulpen kaligrafi | Martabak manis keju-cokelat, Bunga dari pasar, Buku catatan bagus, Cokelat batang | Es teh manis, Roti sobek | Stiker motor, Rokok kretek (tidak dijual ke pelajar), Gorengan sebungkus |  |
| Sekar Ayuningtyas | Senar gitar baru, Kaset / piringan bekas langka | Susu stroberi kotak, Buku catatan bagus, Pick gitar, Bunga dari pasar | Es kopi susu Warkop Simpang | Terompet mainan, Barang bermerek mahal |  |
| Laras Wibisana | Pisau dapur bagus, Buku resep tata boga | Kelapa parut (bahan uduk), Telur sekilo, Es cendol / dawet, Celemek baru, Gorengan sebungkus | Es kopi susu Warkop Simpang, Bunga dari pasar | Cokelat batang, Barang bermerek mahal | Uang tunai langsung = -40 (merasa dikasihani) |
| Uti (Putri Maharani) | Kunci set lengkap, Suku cadang langka (motor Mas Danu) | Stiker motor, Bakso Pak Pras (bungkus), Sarung tangan bengkel, Kaos kaki futsal | Es kopi susu Warkop Simpang, Gorengan sebungkus | Bunga dari pasar, Boneka, Set make-up |  |
| Sasha Aurelia | Buku sketsa fashion, Kain batik tulis | Makanan kucing, Cokelat batang, Bunga dari pasar, Cilok bumbu kacang | Es kopi susu Warkop Simpang | Gorengan sebungkus, Barang bermerek palsu | Cilok hanya 'suka' kalau diberikan saat sepi; di depan geng jadi benci |
| Kirana Wijaya | Sarung tangan balap, Knalpot custom kecil | Stiker motor, Kopi hitam tubruk, Nasi goreng Jl. Lingkar, Ikan cupang | Es kopi susu Warkop Simpang, Gorengan sebungkus | Bunga dari pasar, Cokelat batang, Boneka | Apa pun berwarna merah muda = benci |
| Mei Lestari | Set cat air, Buku seni ilustrasi | Novel, Bunga dari pasar, Pembatas buku unik, Cokelat batang, Roti bakar | Es kopi susu Warkop Simpang | Gorengan sebungkus | Buku sobek atau dilipat = benci |
| Wulan Sari | Buku atlas dunia, Sepatu lari | Bunga dari pasar, Teh pucuk Sukamekar (bungkus), Kain batik tulis, Es krim cone, Burger mal | Es kopi susu Warkop Simpang, Cokelat batang | Pistol / borgol mainan, Barang bermerek mahal |  |
| **NPC utama cowok** | | | | | |
| Dimas Aditya | Bola basket kulit | Susu cokelat kotak, Cokelat batang, Headband, Pisang goreng | Es kopi susu Warkop Simpang | Buku latihan soal, Barang bermerek mahal | Sepatu basket bekas bagus (pasar loak, acak) = favorit |
| Arga | Bibit bunga melati, Kamera saku bekas | Gorengan sebungkus, Stiker motor, Kopi hitam tubruk, Kacang rebus | Es kopi susu Warkop Simpang | Barang bermerek mahal, Cokelat batang, Pistol / borgol mainan |  |
| Rizal Pratama | Buku puisi, Pulpen tinta bagus | Novel, Roti sobek, Teh pucuk Sukamekar (bungkus), Bunga dari pasar, Buku catatan bagus | Es kopi susu Warkop Simpang, Cokelat batang | Gorengan sebungkus, Stiker motor |  |
| Tegar Hutomo | Set lego arsitektur, Buku arsitektur | Novel, Cilok bumbu kacang, Teh pucuk Sukamekar (bungkus), Pensil mekanik, Voucher warnet 5 jam | Cokelat batang, Roti sobek | Es kopi susu Warkop Simpang, Kopi hitam tubruk, Kopi bubuk Simpang Tengah Malam, Gorengan sebungkus |  |
| Jojo (Yohanes) | Roll film / kartu memori, Lensa bekas | Bakso Pak Pras (bungkus), Es jeruk, Gorengan sebungkus | Es kopi susu Warkop Simpang, Cokelat batang | Buku latihan soal | Info gosip baru = suka (pilihan dialog). Kado dibungkus terlalu rapi = benci |
| Bram Megantara | Partitur piano lama | Nasi goreng Jl. Lingkar, Bola basket kulit, Cokelat batang | Es kopi susu Warkop Simpang | Gorengan sebungkus, Barang bermerek palsu | Sebelum 2 hati semua kado dibuang (0). Barang murah di depan geng = benci. Foto dia & ibunya (event Jojo) = favorit |
| Andra Pamungkas | Set cat semprot, Buku sketsa besar | Stiker motor, Es cendol / dawet, Nasi pecel, Senar bass | Es kopi susu Warkop Simpang, Gorengan sebungkus | Barang bermerek mahal, Buku latihan soal, Pistol / borgol mainan |  |
| Gilang Ramadhan | Roda skateboard baru | Gorengan sebungkus, Nasi telur dadar, Es teh manis, Stiker motor, Joran pancing | Es kopi susu Warkop Simpang, Cokelat batang | Novel, Buku latihan soal, Buku puisi | Kado yang diberikan dengan nada kasihan (pilihan dialog) = benci |
| **Keluarga, kampung & geng** | | | | | |
| Om Darto | Kopi bubuk Simpang Tengah Malam, Radio transistor tua | Kerupuk & sambal kiriman ibu, Gula aren Tegalsari, Kacang rebus | Gorengan sebungkus | Rokok kretek (tidak dijual ke pelajar) | Rokok dari pemain = benci (dia sudah berhenti dan marah pemain merokok) |
| Cici | Boneka, Kembang api | Es krim cone, Cokelat batang, Stiker motor, Susu stroberi kotak | Roti sobek | Buku latihan soal |  |
| Bimo Prasetyo | Buku resep tata boga | Martabak manis keju-cokelat, Bakso Pak Pras (bungkus), Cokelat batang, Gorengan sebungkus, Burger mal | Es kopi susu Warkop Simpang | Sampah / barang rusak |  |
| Mas Fajar | Kunci set lengkap, Buku latihan soal | Kopi hitam tubruk, Gorengan sebungkus, Sarung tangan bengkel | Es kopi susu Warkop Simpang | Barang bermerek mahal | Buku latihan soal = favorit (persiapan paket C) |
| Bang Jaka | Jaket gunung bekas | Kopi hitam tubruk, Nasi goreng Jl. Lingkar, Stiker motor | Gorengan sebungkus | Pistol / borgol mainan |  |
| Kobar | Knalpot custom kecil | Nasi goreng Jl. Lingkar, Kopi hitam tubruk, Stiker motor | Gorengan sebungkus | Bunga dari pasar, Novel |  |
| Bu Narti | Martabak manis keju-cokelat | Bunga dari pasar, Kue ulang tahun kecil, Gula aren Tegalsari | Gorengan sebungkus | Terompet mainan | Gosip baru (pilihan dialog) = suka |
| Pak RT Slamet | Kopi bubuk Simpang Tengah Malam | Gorengan sebungkus, Kacang rebus, Tasbih kayu kokka | Es teh manis | Kembang api |  |
| Rio | Headband | Burger mal, Nasi goreng Jl. Lingkar, Susu cokelat kotak | Gorengan sebungkus | Buku puisi |  |
| Kevin | Roll film / kartu memori | Es kopi susu Warkop Simpang, Burger mal | Cokelat batang | Gorengan sebungkus |  |
| **Staf & guru sekolah** | | | | | |
| Pak Ujang | Radio transistor tua, Bibit bunga melati | Kopi hitam tubruk, Kacang rebus, Minyak urut | Gorengan sebungkus | Barang bermerek mahal |  |
| Mak Iyah | Celemek baru | Gula aren Tegalsari, Kelapa parut (bahan uduk), Minyak urut | Es teh manis | Sampah / barang rusak |  |
| Ama | Teh pucuk Sukamekar (bungkus) | Bunga dari pasar, Roti bakar, Minyak urut | Cokelat batang | Terompet mainan |  |
| Bu Hartini | Kitab tua dari pasar loak | Bunga dari pasar, Teh pucuk Sukamekar (bungkus) | Roti sobek | Rokok kretek (tidak dijual ke pelajar) |  |
| Bu Ratna | Pensil mekanik | Teh pucuk Sukamekar (bungkus), Bunga dari pasar | Cokelat batang | Gorengan sebungkus |  |
| Pak Hendro | Bola basket kulit | Kopi hitam tubruk, Pisang goreng, Headband | Es teh manis | Rokok kretek (tidak dijual ke pelajar) |  |
| Pak Wawan | Buku catatan bagus | Kopi hitam tubruk, Gorengan sebungkus | Es teh manis | Stiker motor |  |
| Bu Sinta | Buku puisi | Bunga dari pasar, Novel, Roti bakar | Cokelat batang | Gorengan sebungkus |  |
| Mr. Anton | Kaset / piringan bekas langka | Es kopi susu Warkop Simpang, Burger mal | Cokelat batang | Terompet mainan |  |
| Pak Gunadi | Kitab tua dari pasar loak | Kopi hitam tubruk, Radio transistor tua | Gorengan sebungkus | Kembang api |  |
| Bu Melati | Kain batik tulis | Bunga dari pasar, Senar gitar baru | Cokelat batang | Terompet mainan |  |
| **NPC wilayah luar kota** | | | | | |
| Kyai Mahfud Sastrowiryo | Kitab tua dari pasar loak, Tasbih kayu kokka | Gula aren Tegalsari, Teh pucuk Sukamekar (bungkus), Buku catatan bagus | Roti sobek | Rokok kretek (tidak dijual ke pelajar) | Uang (sedekah) tidak diterima sebagai kado; arahkan ke kotak amal |
| Abah Karta | Teh pucuk Sukamekar (bungkus), Minyak urut | Kopi hitam tubruk, Kain batik tulis, Jagung bakar Bukit Bintang | Gorengan sebungkus | Pistol / borgol mainan, Barang bermerek mahal |  |
| Serma Hadi Aditya | Kopi bubuk Simpang Tengah Malam | Kopi hitam tubruk, Pisang goreng | Roti sobek | Pistol / borgol mainan | Kado di depan Dimas: poin x0,5 (gengsi) |
| Pak Sudarmaji | Ikan bakar waduk (bungkus) | Kopi hitam tubruk, Gorengan sebungkus, Es teh manis | Roti sobek | Kembang api |  |
| Wak Kodir | Benang jaring nilon | Kopi hitam tubruk, Kacang rebus | Gorengan sebungkus | Rokok kretek (tidak dijual ke pelajar) | Rokok dari pelajar = benci ('Kamu masih kecil!') |
| Bu Romlah | Kopi bubuk Simpang Tengah Malam | Gula aren Tegalsari, Bunga dari pasar, Martabak manis keju-cokelat | Es teh manis | Ikan bakar waduk (bungkus) | Ikan bakar saingan = benci |
| Kang Ujo | Jaket gunung bekas | Kopi hitam tubruk, Jagung bakar Bukit Bintang, Gorengan sebungkus | Es teh manis | Sampah / barang rusak |  |
| Mandor Sabar | Radio transistor tua | Kopi hitam tubruk, Kacang rebus | Gorengan sebungkus | Teh pucuk Sukamekar (bungkus) | Teh dari kebunnya sendiri = benci ('Ini kan teh saya') |
| Pak Yusuf Tanjung | Sarung tangan balap | Kopi hitam tubruk, Nasi goreng Jl. Lingkar | Es teh manis | Stiker motor | Stiker balap liar = benci |
| Mbak Sri Wahyuni | Minyak urut | Es kopi susu Warkop Simpang, Martabak manis keju-cokelat, Bunga dari pasar | Gorengan sebungkus | Barang bermerek mahal |  |
| Mbah Darmo | Radio transistor tua | Kopi hitam tubruk, Kacang rebus, Minyak urut | Roti sobek | Kembang api |  |
| Nek Sumi | Kain batik tulis | Gula aren Tegalsari, Kelapa parut (bahan uduk), Minyak urut | Es teh manis | Pistol / borgol mainan |  |
| Tito | Bola basket kulit | Es krim cone, Cokelat batang, Stiker motor | Roti sobek | Buku latihan soal |  |
| Neng Ayu | Sarung tangan balap | Stiker motor, Es krim cone, Cokelat batang | Roti sobek | Boneka |  |
