# Outfits still missing from the character sprites

Generated 2026-11-19 from guide 35 (`guide/data/npc.json`) against the `OUTFITS` of each model in `game3d/src/raka/`.
Each row is an outfit the schedule asks for that the model does not have yet. Until it exists, the game uses the stand-in shown.
After adding an outfit to a model, rerun `python3 tools/export_rutin.py <guide folder> src/data/rutin.json` and drop the matching entry from `OVR` in that script.

54 outfits across 39 characters.
41 of them are worn in the schedule now (listed first). The rest are only listed in the guide, mostly rain outfits.


| Character | Guide key | Description (guide) | Used in schedule | Stand-in now | Model has |
|---|---|---|---|---|---|
| Nadia Kusuma | `olahraga` | Kaus lengan panjang, celana training, hijab sport, raket | yes | `jalan` | seragam, osis, jalan, rumah |
| Laras Wibisana | `malam` | Jaket parasut oranye, tas pinggang uang receh | yes | `jalan` | seragam, jualan, jalan, rumah |
| Sasha Aurelia | `rumah` | Piama satin putih, sandal bulu | yes | `jalan` | seragam, geng, jalan, malam |
| Sasha Aurelia | `rahasia` | Hoodie hitam polos, celana training, masker, kets lusuh (penyamaran) | yes | `malam` | seragam, geng, jalan, malam |
| Arga | `rumah` | Sarung kotak, kaus oblong putih | yes | `kerja` | seragam, lampu, jalan, kerja |
| Jojo (Yohanes) | `kerja` | Kemeja & celana hitam, kartu kru | yes | `liputan` | seragam, liputan, rumah, jalan |
| Bram Megantara | `basket` | Jersey hitam pribadi, sepatu limited edition | yes | `rumah` | seragam, geng, rumah |
| Bram Megantara | `resmi` | Jas hitam setelan | yes | `seragam` | seragam, geng, rumah |
| Om Darto | `malam` | Jaket jeans tua, sarung melilit leher | yes | `santai` | kerja, santai, rumah |
| Bimo Prasetyo | `rumah` | Kaus kebesaran bergambar mi, celana pendek | yes | `kaus` | seragam, kaus, koki |
| Bimo Prasetyo | `masak` | Celemek bakso ayahnya, handuk di bahu | yes | `koki` | seragam, kaus, koki |
| Bang Jaka | `kerja` | Kaus hitam, celana kargo, sarung tangan kerja (kuli angkut pasar) | yes | `santai` | lampu, latihan, santai |
| Pak RT Slamet | `rumah` | Kopiah hitam, kemeja batik lengan pendek, buku catatan warga | yes | `batik` | batik, ronda, kerja |
| Ama | `rumah` | Rambut putih disanggul, kacamata tebal, kebaya encim, kipas | yes | `dapur` | toko, dapur, imlek |
| Rio | `geng` | Kaus hitam ketat, jaket kulit imitasi | yes | `jalan` | seragam, tinju, jalan |
| Bu Hartini | `kerja` | Kebaya kerja, kacamata rantai, sanggul | yes | `kebaya` | kebaya, korpri, rapat |
| Bu Hartini | `rumah` | Pakaian rumah sederhana | yes | `kebaya` | kebaya, korpri, rapat |
| Bu Ratna | `kerja` | Blazer hitam, rambut dikonde, penggaris kayu | yes | `blazer` | blazer, batik, santai |
| Pak Hendro | `kerja` | Kaus olahraga, peluit, topi | yes | `olahraga` | olahraga, wasit, batik |
| Pak Hendro | `rumah` | Pakaian rumah sederhana | yes | `batik` | olahraga, wasit, batik |
| Pak Wawan | `kerja` | Seragam PNS, kumis, buku pelanggaran | yes | `pns` | pns, senam, batik |
| Pak Wawan | `rumah` | Pakaian rumah sederhana | yes | `batik` | pns, senam, batik |
| Bu Sinta | `kerja` | Hijab pastel, kardigan, buku | yes | `kardigan` | kardigan, gamis, batik |
| Bu Sinta | `rumah` | Pakaian rumah sederhana | yes | `gamis` | kardigan, gamis, batik |
| Mr. Anton | `kerja` | Kemeja slim, sneakers | yes | `kemeja` | kemeja, debat, denim |
| Mr. Anton | `rumah` | Pakaian rumah sederhana | yes | `denim` | kemeja, debat, denim |
| Pak Gunadi | `kerja` | Jas lab bernoda, rambut putih berdiri | yes | `rompi` | lab, rompi, kardigan |
| Pak Gunadi | `rumah` | Pakaian rumah sederhana | yes | `kardigan` | lab, rompi, kardigan |
| Bu Melati | `kerja` | Gaun etnik, gelang kayu | yes | `etnik` | etnik, pensi, santai |
| Kyai Mahfud Sastrowiryo | `rumah` | Peci hitam, baju koko putih, sarung kotak hijau, tasbih kayu, kacamata bulat emas | yes | `koko` | koko, mengajar, pasar |
| Abah Karta | `silat` | Baju pangsi hitam pudar, ikat kepala batik cokelat | yes | `pangsi` | pangsi, kebun, teras |
| Pak Sudarmaji | `kerja` | Kemeja dinas PU kusam, helm proyek kuning, sepatu bot karet, buku catatan | yes | `dinas` | dinas, hujan, rumah |
| Kang Ujo | `kerja` | Jaket gunung oranye pudar, kargo, sandal gunung | yes | `basecamp` | basecamp, naik |
| Mandor Sabar | `kerja` | Topi koboi anyaman, kemeja lengan panjang lusuh, sepatu bot, peluit di leher | yes | `kebun` | kebun, pabrik |
| Pak Yusuf Tanjung | `kerja` | Kemeja race control oranye, radio di dada | yes | `raceControl` | raceControl, santai |
| Mbak Sri Wahyuni | `kerja` | Seragam pabrik biru, kerudung abu, masker kain, kartu ID | yes | `shift` | shift, kos |
| Mbak Sri Wahyuni | `rumah` | Kaus panjang, rok batik | yes | `kos` | shift, kos |
| Mbah Darmo | `rumah` | Sarung, jaket tentara usang, kacamata tebal, lampu minyak | yes | `pagi` | jaga, pagi |
| Nek Sumi | `rumah` | Kebaya lurik, kain jarik, selendang gendong botol jamu, sanggul | yes | `jamu` | jamu, sawah |
| Tito | `rumah` | Kaus bola kebesaran, celana pendek, lutut luka | yes | `bola` | bola, sekolah |
| Neng Ayu | `rumah` | Jaket balap kebesaran, rambut pendek | yes | `jaket` | jaket, silat, sekolah |
| Nadia Kusuma | `hujan` | Ponco kuning, payung lipat biru | no (listed only) | model default | seragam, osis, jalan, rumah |
| Sekar Ayuningtyas | `pentas` | Gaun hitam sederhana, jaket jeans penuh pin, boots | no (listed only) | model default | seragam, band, jalan, rumah |
| Sekar Ayuningtyas | `hujan` | Hoodie bertudung, gitar dibungkus plastik besar | no (listed only) | model default | seragam, band, jalan, rumah |
| Laras Wibisana | `hujan` | Plastik sewa payung (jadi ojek payung) | no (listed only) | model default | seragam, jualan, jalan, rumah |
| Kirana Wijaya | `hujan` | Jas hujan setelan motor | no (listed only) | model default | seragam, bengkel, balap, jalan |
| Mei Lestari | `hujan` | Jas hujan kuning mustard bentuk bebek | no (listed only) | model default | seragam, toko, rumah, jalan |
| Wulan Sari | `hujan` | Caping dan jas hujan plastik | no (listed only) | model default | seragam, silat, pemandu, desa, kota |
| Dimas Aditya | `resmi` | Kemeja batik ayahnya yang terlalu besar | no (listed only) | model default | seragam, basket, jalan, rumah |
| Dimas Aditya | `hujan` | Jaket parasut, bola di kantong plastik | no (listed only) | model default | seragam, basket, jalan, rumah |
| Arga | `hujan` | Ponco hitam | no (listed only) | model default | seragam, lampu, jalan, kerja |
| Rizal Pratama | `hujan` | Payung hitam besar | no (listed only) | model default | seragam, osis, rumah, jalan |
| Tegar Hutomo | `hujan` | Jas hujan atas-bawah, tas dibungkus plastik | no (listed only) | model default | seragam, les, rumah, jalan |
| Mas Fajar | `paket_c` | Kemeja kotak dipinjam dari Om Darto | no (listed only) | model default | bengkel, lampu, santai |
