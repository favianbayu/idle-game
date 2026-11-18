# Tokoh voxel · Rani, Bimo, Bram, Nadia, Dimas, Sekar, Arga, Laras, Rizal, Uti, Tegar, Sasha, Kirana, Jojo, Andra, Mei, Gilang, Wulan, Om Darto, Cici, Mas Fajar, Kobar, Bang Jaka, Bu Narti, Pak RT Slamet, Pak Haris, Pak Gito, Rio, Kevin, Bu Hartini, Bu Ratna, Pak Hendro, Pak Wawan, Bu Sinta, Mr. Anton, Pak Gunadi, Bu Melati, Pak Ujang, Mak Iyah, Ama, Mbah Karto, Bu Sum, Pak Darmin, Mbak Rini, Pak Joko, Teh Euis, Koh Ahong, Dodi, Didi, Uda Rizki, Ustaz Hasan, Pak Satpam Bambang, Bu Veronika, Mbak Yuni, Kak Raffi, Opa Willem, Nyonya Lita, Kurir Bayu, Kevin kecil, Pak Polisi Sugeng, Mas Barista Kevin, Bu Lastri, Pak Tarno, Mbak SPG Dewi, Pengamen Dul, Om Hendrik, Bu Wati, Mas Ilham, Kak Nana, Pak Darsono, Wak Udin, Bu Inah, Bang Ucok, Mak Ijah, Pak Roni, Teh Lilis, Mas Tejo, Pak Satpam Udin, Bu Kantin Ningsih, Mas Cilok, Andi, Fitri, Rina, Bayu "Si Telat", Maya, Bejo, Mandor Sutris (gaya Raka v3)

Cara membuat tokoh baru: lihat [PANDUAN-TOKOH.md](PANDUAN-TOKOH.md).

Pratinjau mandiri untuk tokoh utama cewek dan NPC utama, digambar dengan gaya yang sama dengan Raka v3
(yang sudah dipasang di game lewat PR #6). Semua tokoh di tabel ini sampai Bu Melati sudah dipasang di game (`game3d/src/raka/`,
peta `FINE` di `voxworker.js`) dengan baju `seragam` (tokoh bukan siswa memakai baju hariannya). Wulan dan Pak RT Slamet
memakai sid baru `wulan` dan `rtSlamet`. Gilang memikul galon (gerakan `galon`/`galonWalk`) saat sedang mengantar,
dan galonnya ditaruh saat berantem. Pak Ujang, Mak Iyah, Ama, dan warga Kenanga (Mbah Karto, Bu Sum, Pak Darmin, Mbak Rini,
Pak Joko, Teh Euis, Koh Ahong) juga sudah di game (PR #8), begitu juga Dodi & Didi, Uda Rizki, Ustaz Hasan, dan warga
Bukit Asri (Pak Satpam Bambang, Bu Veronika, Mbak Yuni, Kak Raffi, Opa Willem, Nyonya Lita) lewat PR #9, dan Kurir Bayu,
Kevin kecil, Pak Polisi Sugeng, Mas Barista Kevin, Bu Lastri, Pak Tarno, Mbak SPG Dewi, Pengamen Dul, Om Hendrik, Bu Wati
lewat PR #10, dan Mas Ilham, Kak Nana, Pak Darsono, Wak Udin, Bu Inah, Bang Ucok, Mak Ijah, Pak Roni, Teh Lilis, Mas Tejo
lewat PR #11. Batch baru pengisi sekolah (Pak Satpam Udin, Bu Kantin Ningsih, Mas Cilok, Andi, Fitri, Rina, Bayu "Si Telat",
Maya, Bejo, Mandor Sutris) masih pratinjau, menunggu persetujuan (`shots/barisan10baru6.png`).

**NPC spawn (warga generik, guide segmen 34)**: template untuk orang tanpa nama, satu file per peran, banyak variasi dari
seed `v`. Gelombang 1 (pratinjau, belum di game): `wargaPria`, `wargaWanita`, `wargaHijab`, `wargaLansia`, `wargaMuda`,
`wargaAnak`, `tentara`, `buruh`, `petani`, `siswaAcak`. Ringkasan: `shots/sp_semua.png`; per template `shots/sp_<sid>.png`.
Kode: `src/spawn_base.js` + `src/sp_*.js`. Cara membuat template baru: PANDUAN bagian 9.

| Tokoh | Peran | Skala lama | Tinggi kisi (voxel halus, termasuk rambut) | Ciri |
|---|---|---|---|---|
| Raka | tokoh utama cowok | 1.3 | 86 | mullet modern, seragam berandal (pembanding) |
| Rani | tokoh utama cewek | 1.24 | 81 | kuncir kuda + ikat merah, seragam berandal: kemeja keluar, dasi longgar, jaket jeans, rok abu + legging hitam, sneakers putih, plester di hidung |
| Bimo | sahabat sebangku | 1.3 | 88 | badan gempal, perut menonjol, rambut keriting tebal, kacamata frame hitam tebal, pipi merah, kemeja sesak, HP di saku |
| Bram | rival utama (anak elite) | 1.38 | 90 | tinggi tegap, muka V, rambut klimis belah samping, mata tajam, seragam permak dimasukkan, ikat pinggang kulit, jam perak, sepatu kulit |
| Nadia | NPC romance cewek, calon ketua OSIS | 1.24 | 79 | hijab segi empat abu-biru + peniti mutiara, kemeja krem lengan panjang, rok abu panjang, badge OSIS, pulpen di saku, jam kulit kecil, pantofel |
| Dimas | NPC romance cowok, kapten basket | 1.38 | 89 | bahu lebar, rambut cepak anak tentara dengan samping & belakang bawah fade, telinga kemerahan, seragam rapi dimasukkan, jam digital, deker lutut kiri (saat celana pendek) |
| Sekar | NPC romance cewek, gitaris band | 1.22 | 80 | kurus, kulit pucat, rambut hitam panjang kuncir dua rendah ikat ungu, poni menutupi alis, mata sayu, jaket jeans kebesaran, rok abu panjang, gitar di punggung |
| Laras | NPC romance cewek, penjual nasi uduk | 1.24 | 81 | kulit sawo matang, kuncir tinggi tebal + karet merah, jepit kayu, poni berantakan, pipi merah, gigi gingsul, seragam agak kusut, sepatu sol ditambal |
| Rizal | NPC romance cowok, sekretaris OSIS | 1.32 | 86 | kurus, rambut belah samping poni jatuh, kacamata frame tipis kotak, bulu mata panjang, mata sayu, jari bernoda tinta, rompi rajut cokelat, tas selempang kanvas |
| Uti | NPC romance cewek, tomboi montir + kapten futsal | 1.24 | 82 | atletis, kulit sawo matang, bob pendek berantakan potong sendiri, alis tebal, coretan oli di pipi, bekas luka di dagu, seringai, jaket marun kebesaran milik almarhum kakak + kunci pas di saku, celana panjang abu |
| Tegar | NPC romance cowok, ketua kelas & juara umum | 1.32 | 86 | kulit pucat, rambut klimis belah samping mengilap, kacamata bingkai hitam tebal, kantong mata gelap, seragam disetrika tajam + dasi abu + badge ketua kelas, pantofel |
| Sasha | NPC romance cewek, anak elite geng Bram | 1.24 | 80 | kulit putih, rambut cokelat kemerahan panjang bergelombang tanpa poni, muka tirus, bulu mata lentik, lip tint pink, seragam dipermak + rok pendek + cardigan pink, jam emas, loafers |
| Kirana | NPC romance cewek, pembalap STM | 1.26 | 81 | kulit langsat gelap, rambut hitam lurus diikat rendah ujung toska, poni samping, mata tajam, satu tindik, plester di siku, seragam STM + sepatu safety |
| Jojo | NPC romance cowok, fotografer mading | 1.3 | 90 (termasuk mohawk) | kurus jangkung, mohawk kecil bergel, mata besar, senyum lebar, tahi lalat di bawah mata kanan, rompi fotografer army + kamera DSLR di leher |
| Andra | NPC romance cowok, pelukis mural STM | 1.32 | 85 | kulit cokelat, rambut ikal sebahu setengah diikat, alis tebal, senyum malas, tindik kiri, tangan & celana kena cat, tato spidol di lengan, boots |
| Mei | NPC romance cewek, anak Toko Buku Pena, ilustrator | 1.18 | 80 | bob sebahu lurus + jepit pensil, kacamata bulat besar, pipi tembam merah, mata sipit, noda tinta di jari |
| Gilang | NPC romance cowok, pengantar galon & skater, paket C | 1.34 | 86 | kulit cokelat gelap, rambut berantakan, topi terbalik biru-kuning, gigi depan renggang, alis jahil tak sejajar, plester di lutut & siku |
| Wulan | NPC romance cewek, pesilat SMK Pariwisata dari desa | 1.26 | 80 | kepang satu tebal sampai pinggang, alis lurus, mata besar teduh, memar di lengan |
| Om Darto | paman pemain, pemilik Warkop Simpang | 1.32 | 84 | gempal perut buncit, cepak beruban di samping, kumis tebal, tato bunga pudar |
| Cici | sepupu 8 tahun, anak Om Darto | 0.98 | 64 | rangka anak, kuncir dua ikat stroberi, gigi depan ompong, pipi merah |
| Mas Fajar | montir, anggota senior Lampu Kota | 1.34 | 89 | rambut jabrik, kaus kerja penuh oli, jeans robek, handuk, gelang karet |
| Kobar | ketua Serigala Besi, kakak Kirana | 1.36 | 95 | kekar, mohawk hitam-merah sisi dicukur, jahitan di dagu, rompi patch serigala, rantai dompet |
| Bang Jaka | ketua Lampu Kota, pemberi misi geng | 1.38 | 89 | tinggi besar, gondrong diikat rendah di tengkuk, jenggot tipis, jaket hitam lis kuning + lambang lampu di punggung, boots |
| Bu Narti | ibu kos Kenanga, tukang gosip | 1.24 | 78 | bergo bunga dengan pet, daster batik, kacamata baca di ujung hidung, kipas anyaman, sandal jepit |
| Pak RT Slamet | ketua RT Kenanga | 1.32 | 88 | kopiah hitam, batik parang lengan pendek, perut buncit, uban di pelipis, tahi lalat, buku catatan warga |
| Pak Haris | Pak Haris Megantara, pengembang properti, musuh utama | 1.34 | 85 | jas abu + dasi merah anggur, rambut semir hitam klimis, kacamata tanpa bingkai, cincin akik merah, senyum dingin |
| Pak Gito | rentenir yang menagih tiap Jumat | 1.3 | 84 | safari cokelat empat saku, tas pinggang kulit, gigi emas, rokok di telinga, kumis tipis, dahi lebar |
| Rio | geng Bram, tukang pukul | 1.36 | 91 | undercut, kalung rantai, jam tangan, seragam dikeluarkan lengan digulung |
| Kevin | geng Bram, otak licik | 1.32 | 86 | rambut belah tengah poni tirai, kacamata bulat tipis, HP selalu di tangan kanan |
| Bu Hartini | kepala sekolah | 1.24 | 79 | sanggul rendah + tusuk konde emas, uban, kacamata cokelat bertali emas |
| Bu Ratna | guru Matematika, wali kelas X | 1.24 | 83 | konde tinggi, kacamata kotak merah, lipstik merah, penggaris kayu |
| Pak Hendro | guru Penjaskes, pelatih futsal | 1.34 | 87 | topi merah, peluit, kumis, papan jepit |
| Pak Wawan | guru BK & kesiswaan | 1.32 | 85 | perut buncit, seragam PNS khaki + pin Korpri, buku pelanggaran merah, kumis melintir |
| Bu Sinta | guru Bahasa Indonesia, pembina mading | 1.24 | 79 | hijab peach + bros bunga, novel di tangan kiri |
| Mr. Anton | guru Bahasa Inggris, pembina debat | 1.34 | 89 | jambul + fade, jam pintar, kemeja lengan digulung |
| Pak Gunadi | guru Fisika & Kimia | 1.34 | 90 | rambut putih acak-acakan, janggut putih, kacamata bulat hitam tebal, jas lab bernoda + gelas kimia berasap |
| Bu Melati | guru Seni Budaya, pembina band | 1.24 | 80 | rambut panjang bergelombang + jepit kamboja, gelang kayu, kalung manik, sandal |
| Pak Ujang | penjaga sekolah, kakek Arga | 1.24 | 86 | kurus agak bungkuk, rambut & kumis putih, topi pet abu, kaus abu, sapu lidi, serenceng kunci |
| Mak Iyah | warung belakang sekolah | 1.2 | 79 | pendek gempal, kain batik diikat di kepala, daster bunga, celemek bernoda minyak, sutil |
| Ama | nenek Mei, penjaga Toko Buku Pena | 1.2 | 80 (termasuk sanggul) | rambut putih disanggul + tusuk giok, kacamata tebal, samfu bunga, kipas lipat merah, gelang giok |
| Mbah Karto | warga Kenanga (pengisi) | 1.22 | 84 | botak, rambut putih tapal kuda, kacamata bulat, kaus oblong + sarung kotak, tongkat |
| Bu Sum | penjual sayur gerobak (pengisi) | 1.22 | 85 (termasuk caping) | bergo hijau, caping, kaus oranye, kain batik, tas pinggang uang, seikat kangkung |
| Pak Darmin | tukang ojek pangkalan (pengisi) | 1.32 | 84 | kulit gelap, cepak, kumis, rompi oranye nomor 07 + jaket jeans, handuk leher, helm di tangan |
| Mbak Rini | ibu muda menggendong bayi (pengisi) | 1.24 | 83 (termasuk cepol) | cepol asal, kantung mata, kaus pink, kulot, gendongan jarik + bayi bertopi kuning |
| Pak Joko | tukang las (pengisi) | 1.36 | 97 (termasuk topeng las) | badan besar, cambang, topeng las diangkat, wearpack biru bolong, sarung tangan kulit |
| Teh Euis | penjual pecel (pengisi) | 1.22 | 79 | kerudung pink, blus toska, celemek batik merah, kain batik, pincuk pecel |
| Koh Ahong | pemilik toko kelontong (pengisi) | 1.32 | 84 | perut buncit, rambut sisir samping menutupi botak, mata sipit, singlet + kolor kotak, kalkulator |
| Dodi | anak SD kembar (pengisi) | 0.98 | 67 | rangka anak, poni rata, topi merah dibalik, kaus merah nomor 13, layangan |
| Didi | kembaran Dodi (pengisi) | 0.98 | 67 | rambut jabrik, gigi depan ompong, plester di pipi, kaus biru garis kuning, kaleng benang |
| Uda Rizki | penjual nasi Padang (pengisi) | 1.3 | 85 | rambut rapi belah samping, kumis tipis, kemeja putih digulung, celemek marun, tumpukan piring lauk |
| Ustaz Hasan | imam musala (pengisi) | 1.3 | 88 (termasuk peci) | janggut tipis beruban, peci haji rajut, gamis putih sampai mata kaki, sorban kotak merah-putih, tasbih |
| Pak Satpam Bambang | satpam kompleks (pengisi) | 1.32 | 87 (termasuk topi) | gempal, kumis tebal, topi pet dongker, kemeja putih berpangkat, kopel + pentungan + HT, sepatu PDL |
| Bu Veronika | ibu senam pagi (pengisi) | 1.22 | 81 | rambut pendek keriting cokelat kemerahan, bando ungu, lipstik merah, kaus senam + legging, botol minum |
| Mbak Yuni | ART (pengisi) | 1.2 | 79 | kuncir kuda rendah, poni samping, jepit kupu-kupu, celemek kotak biru, rok batik panjang, sapu lidi |
| Kak Raffi | mahasiswa pulang kampung (pengisi) | 1.3 | 85 | rambut agak gondrong belah tengah, kacamata bulat tipis, janggut tipis, hoodie navy, tote bag, es kopi |
| Opa Willem | pensiunan pecinta anggrek (pengisi) | 1.3 | 88 (termasuk topi) | jangkung agak bungkuk, rambut & kumis putih, hidung mancung, topi rimba, kemeja kotak, pot anggrek bulan |
| Nyonya Lita | sosialita (pengisi) | 1.24 | 82 | rambut blow-dry cokelat madu, kacamata hitam lebar, lipstik merah tua, terusan zamrud, tas monogram |
| Kurir Bayu | kurir paket (pengisi) | 1.3 | 88 (termasuk topi) | topi oranye, plester di dagu, jaket kurir oranye-hitam tulisan KILAT, tas selempang, kardus paket, celana kargo |
| Kevin kecil | anak orang kaya (pengisi) | 0.95 | 64 | rangka anak, rambut belah samping rapi, kacamata, polo biru muda, remote + drone putih |
| Pak Polisi Sugeng | polantas (pengisi) | 1.32 | 89 (termasuk helm) | rahang kotak, kumis rapi, helm putih, rompi stabilo POLISI bergaris reflektor, sarung tangan putih, peluit |
| Mas Barista Kevin | barista kafe (pengisi) | 1.3 | 88 | man bun + undercut, jenggot, tato lengan, kaus hitam + celemek kanvas bertali kulit, latte, boots |
| Bu Lastri | penjual jamu gendong (pengisi) | 1.2 | 79 | sanggul + tusuk konde, uban di pelipis, kebaya kutubaru kuning, jarik, selendang lurik, bakul botol jamu di punggung |
| Pak Tarno | tukang parkir (pengisi) | 1.3 | 88 (termasuk topi) | kurus legam, topi biru lusuh, rompi oranye rambu P di punggung, kaus garis, handuk di bahu, karcis parkir |
| Mbak SPG Dewi | SPG kartu perdana (pengisi) | 1.22 | 82 (termasuk topi) | kuncir kuda tinggi, topi merah SINYAL+, polo merah kerah putih, kartu nama bertali, brosur kuning + HP |
| Pengamen Dul | pengamen ukulele (pengisi) | 1.3 | 84 | gondrong sebahu, bandana merah, jenggot tipis, rompi jins tambalan, kaus matahari, ukulele, jins robek |
| Om Hendrik | penjual koran (pengisi) | 1.3 | 85 (termasuk topi) | botak tengah, rambut & kumis putih, kacamata baca, topi pet flat, kemeja kotak, pensil di telinga, tumpukan koran |
| Bu Wati | pegawai bank (pengisi) | 1.22 | 79 | jilbab marun bros emas, blazer dongker lis emas, kartu pegawai, rok span hitam panjang, buku tabungan + brosur |
| Pak Satpam Udin | satpam sekolah (pengisi) | 1.3 | 86 (termasuk baret) | kumis tebal, baret dongker berlencana, kemeja putih berpangkat bahu, emblem lengan, tali peluit, kopel & pentungan, PDH |
| Bu Kantin Ningsih | penjual soto kantin (pengisi) | 1.22 | 78 | montok, bergo hijau tosca, celemek kotak merah bernoda kuah, rok batik, sendok sayur & mangkuk soto |
| Mas Cilok | penjual cilok (pengisi) | 1.3 | 89 (termasuk topi) | topi kuning terbalik, kaus kuning sablon cilok, handuk di bahu, tas pinggang, panci cilok mengepul |
| Andi | siswa kutu buku (pengisi) | 1.3 | 85 | rambut klimis belah pinggir, kacamata bulat tebal, gigi kelinci, kemeja dikancing sampai atas, saku penuh pulpen, tumpukan buku |
| Fitri | siswi duo gosip (pengisi) | 1.22 | 79 | jilbab putih, alis tebal, kemeja lengan panjang, rok abu panjang, HP pink |
| Rina | siswi duo gosip (pengisi) | 1.22 | 81 | rambut lurus panjang berponi rata, bando merah, kemeja lengan pendek, rok abu panjang, keripik pedas |
| Bayu "Si Telat" | siswa langganan telat (pengisi) | 1.3 | 88 | rambut jabrik, plester di pipi, kemeja dikeluarkan + kaus hitam, dasi miring, ransel satu bahu, tali sepatu lepas, roti tawar |
| Maya | anggota Paskibra (pengisi) | 1.22 | 80 | rambut licin dicepol berjaring, alis tegas, lencana paskibra, emblem merah putih, rok abu panjang, PDH mengilap |
| Bejo | anak STM Serigala Besi (pengisi) | 1.3 | 87 | undercut + jambul, alis dicukur satu garis, kemeja STM logo roda gigi, celana pensil, sepatu safety, kunci inggris |
| Mandor Sutris | mandor proyek (pengisi) | 1.34 | 90 (termasuk helm) | perut buncit, kumis tebal beruban, helm proyek kuning, rompi oranye reflektor GRAHA, kemeja biru, papan jepit |
| Mas Ilham | ojek online (pengisi) | 1.3 | 89 (termasuk helm) | rambut ikal, kumis-jenggot tipis, helm hijau berkaca, jaket hijau OJEK KITA logo panah di punggung, jins, HP |
| Kak Nana | kasir minimarket (pengisi) | 1.22 | 80 | bob berponi rata + jepit kuning, kemeja biru muda, rompi merah SERBAMART huruf S di punggung, name tag, pemindai kuning |
| Pak Darsono | tukang sol sepatu keliling (pengisi) | 1.3 | 87 (termasuk topi) | topi kain, kumis abu, kemeja digulung, celana komprang, pikulan bambu dengan dua kotak kayu |
| Wak Udin | pemancing tua (pengisi) | 1.3 | 91 (termasuk caping) | caping, jenggot abu, singlet, sarung kotak diselempangkan, sepatu bot karet, joran bambu, ember ikan |
| Bu Inah | tukang cuci (pengisi) | 1.2 | 83 | rambut digelung, daster bunga ungu panjang, baskom merah berisi cucian di pinggang, sikat |
| Bang Ucok | tukang becak (pengisi) | 1.3 | 87 (termasuk topi) | rambut keriting, kumis tebal, topi merah, kemeja kotak terbuka di atas singlet, handuk di leher, klakson becak |
| Mak Ijah | penjual kue subuh (pengisi) | 1.2 | 86 (termasuk tampah) | selendang batik di kepala, kebaya lusuh, jarik, tampah berisi lupis, lapis, dan klepon di kepala |
| Pak Roni | pemulung (pengisi) | 1.3 | 87 (termasuk topi) | topi rimba lusuh, kaus pudar robek, karung putih penuh botol di punggung, gancu, sepatu bot tua |
| Teh Lilis | penjahit (pengisi) | 1.22 | 85 | sanggul tinggi, tahi lalat, kacamata baca di kepala, blus kuning bunga, pita ukur, bantalan jarum, gunting, kulot |
| Mas Tejo | penjaga pintu air (pengisi) | 1.3 | 87 (termasuk tudung) | jas hujan kuning bertudung bergaris reflektor, celana hujan, bot karet selutut, HT berantena, kunci putar besi |
| Arga | NPC romance cowok, Lampu Kota | 1.34 | 84 | ramping berotot, kulit sawo matang gelap, buzz cut, bekas luka memotong alis kanan, seragam dikeluarkan + jaket kulit cokelat, boots |

Ukuran tiap tokoh diturunkan dari `NPC_STYLES` lama (skala dan warna kulit/rambut sama), lalu dikali 2 kerapatannya
(1 voxel = 1/64 petak), persis seperti Raka v3. Semua voxel tetap di satu kisi lurus dan diwarnai 4 tingkat per bahan.

## Baju

- **Rani**: seragam + jaket jeans, seragam berandal (tanpa jaket), jaket Lampu Kota (+ helm), rumah (kaus marun + training + sandal).
- **Bimo**: seragam, kaus "Bakso Pak Pras" + celana pendek + sandal, celemek koki warkop.
- **Bram**: seragam permak, bomber hitam geng + kacamata hitam, rumah (kaus hitam + training + sneakers).
- **Nadia**: seragam + hijab, jas almamater (rapat OSIS), tunik + kulot + tas selempang, gamis rumahan.
- **Sekar**: seragam + jaket jeans + gitar, latihan band (kaus band + kargo + gelang karet), flanel ungu + rok jeans, sweater lavender + piama.
- **Arga**: seragam + jaket kulit, jaket Lampu Kota + sarung tangan tanpa jari, flanel abu + jeans hitam, kaus abu + celana kerja (bantu kakek).
- **Laras**: seragam agak kusut + rok panjang, jualan subuh (kaus oranye + celemek kunyit + handuk + training + sandal), kemeja kotak hijau di pinggang + jeans + kets, daster batik.
- **Rizal**: seragam + rompi rajut + tas selempang, jas almamater + pulpen di telinga, kaus festival literasi + sarung (rok.js), kemeja kotak cokelat + slacks + sepatu kanvas.
- **Uti**: seragam + jaket marun, jersey futsal #7 + decker + sepatu futsal merah, bengkel (kaus hitam + wearpack diikat di pinggang + sarung tangan kain), kaus band motor + jeans robek + boots + topi terbalik, malam (jaket marun tertutup + helm half-face kuning bergambar petir; juga dipakai saat naik motor).
- **Tegar**: seragam + dasi, les (kemeja biru langit + celana bahan + ransel penuh buku), piama biru tua + selop, polo abu + chino + kets putih bersih.
- **Sasha**: seragam + cardigan pink, bareng geng (kacamata hitam di kepala + tas tangan putih), dress bunga + jaket denim putih + tas mini, penyamaran malam (hoodie hitam + masker + training + kets lusuh).
- **Kirana**: seragam STM, wearpack hitam lis oranye + handuk, jaket balap toska-hitam #21 + helm full-face (juga dipakai saat naik motor), crop hoodie + kargo + sneakers tinggi.
- **Jojo**: seragam + rompi army + kamera, liputan (kupluk oranye + ransel kamera), kaus "HORAS!" + celana pendek, kemeja hawaii + kargo + sandal gunung.
- **Andra**: seragam STM kena cat + boots, melukis mural (kaus penuh cat + overall + masker + topi terbalik), Serigala Besi (rompi jeans patch serigala), kemeja bunga + kulot, sarung (rok.js) + kaus partai.
- **Mei**: seragam Bina Bangsa (rompi & rok kotak hijau + dasi pita, rok.js), jaga toko (kaus mustard + apron PENA + pensil di telinga), piama kucing + kaus kaki tidak sepasang, overall + kaus garis + baret + tas tote berpin.
- **Gilang**: antar galon (kaus Depot Air Segar + handuk + sandal jepit; galonnya properti gerakan `galon`/`galonWalk`, bukan bagian baju), skate (kaus kartun kebesaran + kargo sobek + papan di punggung + sepatu diikat karet), paket C (kemeja kotak dikancing sampai atas), di rumah (telanjang dada + sarung rok.js), windbreaker kuning-biru. Di game (`seragam`) ia memakai baju antar galon.
- **Wulan**: SMK Pariwisata (blazer biru tua + rok span + hak rendah), silat (pangsi hitam + sabuk hijau + ikat kepala batik, tanpa alas kaki), pemandu kebun teh (kemeja hijau + caping + boots karet), di desa (kaus lengan panjang + sarung batik rok.js), ke kota (kemeja kotak hijau + jeans + tas anyaman).
- **Om Darto**: jaga warkop (kaus oblong belel + celemek hijau KOPI), santai (sarung di pundak + celana pendek), di rumah (kaus kutang + sarung rok.js).
- **Cici**: seragam SD merah putih, kaus kucing + rok tutu, piama bintang.
- **Mas Fajar**: bengkel (kaus kerja penuh oli + jeans robek + handuk), jaket Lampu Kota, santai (kaus putih + sandal jepit).
- **Kobar**: Serigala Besi (rompi jeans patch serigala + kutang hitam + rantai dompet + boots), Wijaya Motor (coverall diikat di pinggang), jaket balap nomor 1.
- **Bang Jaka**: jaket Lampu Kota (hitam lis kuning, kaus abu, jeans dilipat, boots), latihan ujian masuk (kutang hitam + celana training + perban tangan), santai (flanel merah digulung + kargo).
- **Bu Narti**: daster batik + bergo bunga + kipas + sandal jepit, arisan (bergo marun + tunik brokat + rok batik + tas tangan + selop), pengajian (gamis hijau tua + bergo krem). Semua rok panjang memakai rok.js.
- **Pak RT Slamet**: batik parang + buku catatan warga, ronda (jaket parasut + sarung diselempang + senter), kerja bakti (kaus merah + celana training + handuk + bot karet).
- **Pak Haris**: jas abu tiga potong, golf (polo putih + rompi rajut + chino + sarung tangan), batik sutra hitam-emas.
- **Pak Gito**: safari cokelat + buku utang, kemeja bunga tropis + kalung emas + kacamata hitam, jaket kulit + kaus merah.
- **Rio**: seragam (kemeja keluar, lengan digulung), tinju (kaus kutang + sarung tinju merah + celana pendek), jalan (hoodie hitam + jeans).
- **Kevin**: seragam + HP, jalan (hoodie abu berkantong kanguru), rumah (kaus biru tua logo play + celana pendek).
- **Bu Hartini**: kebaya kutubaru + kain batik (rok.js), Korpri, rapat (blazer + map).
- **Bu Ratna**: blazer + rok pensil, batik kawung, santai (kardigan + kulot).
- **Pak Hendro**: olahraga (training + papan jepit), wasit, batik.
- **Pak Wawan**: PNS khaki (saku, papan nama, pin Korpri, epolet), senam, batik.
- **Bu Sinta**: kardigan + rok panjang, gamis lilac, batik biru + hijab mint.
- **Mr. Anton**: kemeja digulung, debat (blazer + kaus putih), denim.
- **Pak Gunadi**: jas lab bernoda + gelas kimia berasap, rompi, kardigan.
- **Bu Melati**: etnik (tenun ikat + selendang), pensi, santai (linen).
- **Pak Ujang**: kerja (topi pet + kaus abu + sapu lidi + kunci), dinas (seragam penjaga hijau zaitun + papan nama), rumah (peci + kaus oblong + sarung + gembor).
- **Mak Iyah**: warung (ikat kepala batik + daster bunga + celemek + sutil), ke pasar (kerudung putih + kebaya encim + selendang + sarung batik + tas anyaman), pengajian (kerudung putih + gamis ungu + tasbih).
- **Ama**: jaga toko (samfu biru bunga + celana hitam + kipas lipat), bikin bakpao (celemek + kukusan bambu), Imlek (blus merah bersulam emas + angpao).
- **Mbah Karto**: teras (kaus oblong + sarung + tongkat), pos ronda (peci + jaket lusuh + sarung di leher + kopi).
- **Bu Sum**: keliling jualan (caping + kaus oranye + kain batik + tas pinggang + kangkung), di rumah (daster batik).
- **Pak Darmin**: mangkal (rompi ojek + jaket jeans + helm), sepi orderan (kaus kuning + celana pendek + rokok di telinga).
- **Mbak Rini**: sehari-hari (cepol + kaus pink + gendongan), ke posyandu (kerudung biru + tunik + buku KIA).
- **Pak Joko**: ngelas (topeng las + wearpack + sarung tangan kulit), sore (kaus kutang + celana kerja + palu).
- **Teh Euis**: jualan pecel (kerudung pink + blus toska + celemek batik + pincuk), hari Minggu (kerudung krem + gamis kuning).
- **Koh Ahong**: jaga toko (singlet + kolor kotak + kalkulator + pensil di telinga), Imlek (kemeja merah motif koin + jeruk).
- **Dodi / Didi**: seragam SD merah putih, main (Dodi: kaus merah + topi dibalik + layangan; Didi: kaus biru + kaleng benang), ngaji (koko + sarung + peci).
- **Uda Rizki**: rumah makan (kemeja putih + celemek marun + handuk di bahu + piring lauk), Jumatan (koko hijau + kopiah).
- **Ustaz Hasan**: imam (gamis putih + peci haji + sorban + tasbih), harian (koko krem + sarung kotak cokelat + peci hitam + Al-Qur'an).
- **Pak Satpam Bambang**: jaga gerbang (topi pet + kemeja putih berpangkat + pentungan & HT), patroli malam (jaket SECURITY + senter).
- **Bu Veronika**: senam pagi (bando + kaus senam + jaket di pinggang + legging + botol minum), arisan (blus bunga + rok span + mutiara + tas emas).
- **Mbak Yuni**: nyapu (kaus abu + celemek kotak + rok batik + sapu lidi), ke pasar (kardigan + keranjang belanja).
- **Kak Raffi**: nugas di kafe (hoodie navy + chino + tote bag + es kopi), jogging (kaus lari oranye + headphone + jam pintar).
- **Opa Willem**: taman (topi rimba + kemeja kotak + celana pendek khaki + kaus kaki tinggi + pot anggrek), ke gereja (fedora + jas abu + dasi kupu-kupu + tongkat).
- **Nyonya Lita**: ngopi cantik (kacamata hitam + terusan zamrud + tas monogram), kondangan (sanggul + kebaya brokat marun + kain batik + clutch).
- **Kurir Bayu**: antar paket (topi oranye + jaket KILAT + tas selempang + kardus paket + celana kargo), istirahat (topi & kaus hitam + main HP).
- **Kevin kecil**: main (polo + remote + drone putih), sekolah (seragam SD swasta + dasi kotak + celana pendek + ransel oranye).
- **Pak Polisi Sugeng**: atur lalu lintas (helm putih + rompi stabilo POLISI + sarung tangan putih + peluit), dinas (topi pet cokelat + seragam berpangkat + kopel).
- **Mas Barista Kevin**: di bar (kaus hitam + celemek kanvas + latte + tato + boots), santai (flanel merah + jins + sneakers + tumbler).
- **Bu Lastri**: keliling (kebaya kuning + jarik + selendang lurik + bakul jamu + gelas kunyit asam), meracik (daster batik hijau + celemek + cobek & ulekan).
- **Pak Tarno**: jaga parkir (topi biru + rompi oranye rambu P + handuk + peluit + karcis + sandal), ngaso (kaus oblong putih + celana pendek + kopi hitam).
- **Mbak SPG Dewi**: jaga stan (topi & polo merah SINYAL+ + kartu nama + celana hitam + brosur & HP), pulang (jaket jins + kaus putih + jins + kets + tas kanvas).
- **Pengamen Dul**: ngamen (bandana + kaus matahari + rompi jins tambalan + ukulele + kantong permen), nongkrong (jaket parka hijau + ukulele di punggung).
- **Om Hendrik**: jaga kios (topi pet + kacamata baca + kemeja kotak + pensil di telinga + koran), antar pagi (jaket parasut dongker + tas kanvas penuh koran).
- **Bu Wati**: kantor bank (jilbab marun + blazer dongker + blus putih + kartu pegawai + rok span + buku tabungan & brosur), akhir pekan (jilbab peach + tunik mint + kulot krem + tas selempang).
- **Pak Satpam Udin**: jaga gerbang (baret + kemeja putih berpangkat + tali peluit + kopel & pentungan + celana dongker + PDH), ronda malam (kupluk + jaket dongker lis putih + senter).
- **Bu Kantin Ningsih**: kantin (bergo tosca + blus krem + celemek kotak merah + rok batik + sendok sayur & mangkuk soto), ke pasar (bergo cokelat + gamis biru bunga + keranjang belanja).
- **Mas Cilok**: jualan (topi kuning terbalik + kaus sablon cilok + handuk + tas pinggang + jins selutut + sandal + panci & plastik cilok), pulang (hoodie abu + jins + kets).
- **Andi**: seragam (kemeja dikancing sampai atas + dasi + saku penuh pulpen + celana abu + tumpukan buku), rumah (kaus planet + celana pendek + sandal + satu buku).
- **Fitri**: seragam (jilbab putih + kemeja lengan panjang + rok abu panjang + HP pink), jalan (pashmina lilac + kardigan krem + rok plisket mocca + tas mini + sneakers).
- **Rina**: seragam (bando merah + kemeja lengan pendek + rok abu panjang + kaus kaki putih + keripik pedas), jalan (jaket jins crop + kaus kuning + kulot hitam + sneakers + HP).
- **Bayu "Si Telat"**: seragam berantakan (kemeja dikeluarkan + kaus hitam + dasi miring + ransel satu bahu + tali sepatu lepas + roti tawar), futsal (jersey oranye #7 + celana pendek + kaus kaki panjang).
- **Maya**: seragam (cepol berjaring + kemeja licin + dasi + lencana paskibra + emblem merah putih + rok abu + PDH), latihan (topi putih + kaus lis merah + peluit + training dongker + kets).
- **Bejo**: seragam STM (kemeja logo roda gigi dikeluarkan + lengan digulung + celana pensil + sepatu safety + kunci inggris), nongkrong (jaket hitam patch serigala + kaus merah + jins robek + rantai dompet).
- **Mandor Sutris**: proyek (helm kuning + rompi oranye GRAHA + kemeja biru + celana kain + sepatu safety + papan jepit), santai (kemeja batik + celana bahan + pantofel + HP & kunci mobil).
- **Mas Ilham**: narik (helm hijau berkaca + jaket OJEK KITA + jins + kets + HP), ngetem (helm ditenteng + jaket dibuka di atas kaus hitam + es teh plastik).
- **Kak Nana**: kasir (rompi merah SERBAMART + kemeja biru muda + name tag + celana hitam + pemindai kuning), pulang (hoodie abu + jogger + kets + kantong belanja).
- **Pak Darsono**: keliling (topi kain + kemeja digulung + komprang + pikulan dua kotak kayu), menjahit sol (celemek kulit + sepatu yang disol + jarum).
- **Wak Udin**: mancing (caping + singlet + sarung diselempangkan + celana pendek + bot karet + joran + ember ikan), ronda (kupluk + jaket tentara + sarung di leher + senter).
- **Bu Inah**: nyuci (daster bunga ungu + baskom cucian + sikat), jemur (handuk dililit di kepala + daster + kemeja basah + jepitan baju).
- **Bang Ucok**: narik (topi merah + kemeja kotak terbuka + singlet + handuk + celana jins pendek + klakson becak), pesta (kemeja putih + ulos merah-hitam + celana hitam + pantofel).
- **Mak Ijah**: jualan subuh (selendang batik di kepala + kebaya lusuh + jarik + tampah kue), ngaso (rambut putih digelung + selendang di bahu + termos merah).
- **Pak Roni**: mulung (topi rimba + kaus robek + celana digulung + bot tua + karung botol + gancu), jumatan (peci hitam + koko putih + sarung kotak hijau).
- **Teh Lilis**: menjahit (blus kuning bunga + pita ukur + bantalan jarum + gunting + kain biru + kulot), kondangan (sanggul + kebaya modern tosca berenda + selendang tipis + rok batik + clutch emas).
- **Mas Tejo**: jaga pintu air (jas hujan kuning bertudung + garis reflektor + celana hujan + bot karet + HT + kunci putar besi), santai (kaus oblong biru pudar + celana pendek kargo + HT di pinggang + sandal jepit + kopi hitam).
- **Dimas**: seragam rapi, jersey basket #11 + headband, hoodie biru + chino, kaus loreng + celana pendek + sandal.

Tiap tokoh punya 7 ekspresi yang sama dengan Raka (biasa, kedip, marah, teriak, nyengir, ketawa, sakit), dan memakai
semua gerakan game (`ANIMS`) tanpa perubahan.

## Isi

- `raka_voxel.html`: buka langsung. Pilih **Tokoh**, baju, gerakan, ekspresi; seret = putar, roda = zoom;
  **Ukuran pixel game** dan **Banding versi lama** tersedia seperti di pratinjau Raka.
- `shots/`: lembar gambar. `barisan.png` = semua tokoh berjajar (tinggi bisa dibandingkan langsung), lalu per tokoh:
  `<tokoh>.png` (putar 4 arah), `Kepala`, `Wajah`, `Baju`, `Pose`, `Game` (lama vs baru di ukuran game).
- `src/`
  - `rig.js`: rig Raka yang kini memakai konfigurasi kerangka `K` (panjang ruas, lebar bahu, jarak pinggul) per tokoh.
  - `model.js`: Raka + registri bahan bersama (`addRamps`), `assemble`, `paintFace`.
  - `rani.js`, `bimo.js`, `bram.js`, `nadia.js`, `dimas.js`, `sekar.js`, `arga.js`, `laras.js`, `rizal.js`, `uti.js`, `tegar.js`, `sasha.js`, `kirana.js`, `jojo.js`, `andra.js`: kerangka (`SKEL`), bahan, peta wajah 14x15, rambut, dan baju tiap tokoh.
  - `rok.js`: pembuat rok (pinggang, panel depan/belakang, tabung kaki) + data `P.skirt`; `frame.js` mengisi lambung cembung kain rok per lapis supaya rok tidak terbelah saat jalan/lari.
  - `chars.js`: daftar tokoh untuk penampil.
  - `frame.js`, `expr.js`, `vox.js`, `voxlib.js`, `npc_styles.js`, `anims.js`: sama dengan versi game.

## Membangun ulang

```
node build.mjs          # -> raka_voxel.html
node shot.mjs shots     # -> shots/*.png dari sheets.json
```

## Memasang ke game

Salin file tokoh (`rani.js`, `bimo.js`, dst.) beserta `vox.js`, `rig.js`, `model.js`, `frame.js`, `rok.js` ke `game3d/src/raka/`,
lalu di `voxworker.js` import `build` tokoh itu (urutan sama dengan `build.mjs`) dan tambahkan ke peta `FINE`.
`frame.js` sudah membaca `skel` dan `tailPiv` dari hasil `build`, jadi tiap tokoh membawa kerangkanya sendiri.
