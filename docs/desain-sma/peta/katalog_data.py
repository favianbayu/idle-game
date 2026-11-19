"""Data katalog bangunan Wirabumi: tiap bangunan bernama di peta (nomor = penanda peta kota 1-36 & peta daerah 40-66).

Dipakai buat_katalog.py untuk menggambar lembar papan nama, denah interior, dan menulis guide 91 & 92.
Posisi lokal objek (x, z) dalam petak dari TENGAH FASAD DEPAN bangunan: x ke kanan (dilihat dari jalan),
z positif = maju ke arah jalan, z negatif = ke dalam / belakang. Sama dengan bingkai lokal game3d (depan = +z).
"""

# ------------------------------------------------------------------ papan nama
# (teks, warna latar, warna huruf, gaya, ukuran petak lebar x tinggi, posisi)
def papan(teks, bg, fg, gaya, ukuran, posisi):
    return dict(teks=teks, bg=bg, fg=fg, gaya=gaya, ukuran=ukuran, posisi=posisi)


B = []   # daftar bangunan


def bangunan(no, nama, wilayah, bentuk, warna, papan_, props, plus, minus, jam="", interior=None, catatan=""):
    B.append(dict(no=no, nama=nama, wilayah=wilayah, bentuk=bentuk, warna=warna, papan=papan_, props=props,
                  plus=plus, minus=minus, jam=jam, interior=interior, catatan=catatan))


# ============================================================ KOTA
bangunan(1, "SMA Negeri 3 Wirabumi", "Kawasan Sekolah",
         "Kompleks 76 x 53.5 (segmen 83): Gedung A bentuk U, Gedung B 3 lantai, Gedung C atap gergaji, aula lengkung",
         ["krem #ecdcb4", "list putih #f6f4ec", "genteng #a84a32", "papan hijau #2f6a4a"],
         [papan("SMA NEGERI 3 WIRABUMI", "#2f6a4a", "#f0d27a", "huruf timbul emas di balok gapura", "8 x 0.7", "gapura gerbang, tinggi 2.4"),
          papan("TERAKREDITASI A", "#f6f4ec", "#2f6a4a", "plat kecil", "2 x 0.4", "pilar kiri gapura")],
         [("Pos satpam bulat", (6.5, -2)), ("Tiang bendera", (0, -9)), ("Rak sepeda", (24, -4)), ("Gerobak cilok (14.00)", (-6, 1.5))],
         ["Pusat cerita: hampir semua NPC lewat sini", "Banyak tempat sembunyi (gedung lama, atap, belakang kantin)"],
         ["Telat > 07.00 = dihukum", "Guru BK patroli, susah bolos siang"], "06.00-17.30", "segmen 81")
bangunan(2, "Stasiun Wirabumi", "Barat (rel)",
         "Bangunan kolonial memanjang 8 x 5, atap limas tinggi, peron beratap 20 petak, jam bulat di fasad",
         ["krem tua #e6d6b0", "list hijau #3a6a4a", "atap seng merah #a8523a", "peron abu #9a9a96"],
         [papan("WIRABUMI  +312 m", "#f6f4ec", "#1e1e1e", "papan stasiun klasik, huruf hitam tegak", "4 x 0.6", "atas pintu tengah"),
          papan("PERON 1 - 2", "#2a5a8a", "#ffffff", "papan gantung biru", "1.6 x 0.4", "tergantung di kanopi peron")],
         [("Loket kaca", (-2, -1)), ("Bangku besi hijau (3)", (2, 0.6)), ("Jam bulat", (0, 0.1)), ("Pangkalan ojek", (5, 3)), ("Penjual asongan", (-4, 2))],
         ["Pembuka game; fast travel kereta ke pantai & luar daerah"], ["Ramai: copet acak 5%", "Kereta hanya tiap 2 jam"], "04.30-22.00", "92: stasiun")
bangunan(3, "Warkop Simpang & rumah Om Darto", "Perkampungan Kenanga",
         "Rumah K2 + gerobak kopi (level 1) yang tumbuh jadi warkop beratap (level 5)",
         ["dinding hijau mint #b8d8b0", "genteng #b4583e", "gerobak kuning #e2b84a", "kusen hijau tua #2f6a4a"],
         [papan("KOPI", "#e2b84a", "#7a3a1a", "tulisan cat tangan di gerobak", "1 x 0.4", "sisi depan gerobak"),
          papan("WARKOP SIMPANG  -  kopi, mi, gorengan", "#7a3a1a", "#f2e2b0", "spanduk vinyl (level 2+)", "4 x 0.6", "tiang depan warkop")],
         [("Gerobak kopi", (2.8, 0.8)), ("Bangku panjang kayu", (1.5, 2)), ("Termos & renceng kopi sachet", (2.8, 0.6)), ("Jemuran", (-2, -2.5)), ("Motor Om Darto", (-1.6, 1))],
         ["Rumah pemain: tidur, simpan barang, kerja warkop", "Gratis makan sekali sehari"], ["Kecil, kamar sempit sampai upgrade", "Om marah kalau pulang > 23.00"],
         "Warkop 16.00-24.00", "segmen 82")
bangunan(4, "Alun-alun", "Pusat Kota",
         "Lapangan rumput lonjong 17 x 11, jalan melingkar, dua beringin kembar, panggung kecil",
         ["rumput #b2d084", "pagar besi rendah hijau #3a6a4a", "conblock #bcb6a8"],
         [papan("ALUN-ALUN WIRABUMI", "#3a6a4a", "#ffffff", "huruf beton putih berdiri di taman", "6 x 0.8", "sisi selatan menghadap Jl. Raya")],
         [("Beringin kembar", (-3, -5)), ("Panggung kecil", (0, -9)), ("Lampu taman bulat (12)", (0, 0)), ("Bianglala (Sabtu malam)", (6, -6)), ("Tenda pasar malam", (-6, -2))],
         ["Pasar malam Sabtu: mini game & kencan", "Gratis, ramai sepanjang hari"], ["Sabtu malam penuh, sulit parkir", "Preman parkir minta jatah"], "24 jam")
bangunan(5, "Masjid Agung Al-Ikhlas", "Pusat Kota",
         "Masjid 7 x 6 + serambi, kubah besar + 4 kubah kecil, menara 12 petak (landmark)",
         ["putih #f2f0e8", "kubah tosca #3a9a8a", "puncak emas #d4a640", "keramik pelataran #e2dcd0"],
         [papan("MASJID AGUNG AL-IKHLAS", "#3a9a8a", "#ffffff", "kaligrafi + huruf latin di batu marmer", "5 x 0.7", "pagar depan, di samping gerbang")],
         [("Beduk besar", (3, -1)), ("Tempat wudu", (-4.5, -2)), ("Rak sandal", (0, 0.8)), ("Kotak amal", (1.2, 0.5)), ("Pedagang kurma (Ramadan)", (-5, 3))],
         ["Karma +, event Ramadan", "Atap: event Nadia 8 hati"], ["Tidak boleh lari/berantem di pelataran (karma -)"], "04.00-21.30", "92: masjid_agung")
bangunan(6, "Pasar Wirabumi & terminal angkot", "Pusat Kota",
         "Los besar 12 x 7 atap seng berundak + los terbuka 9 x 5, pelataran terminal 14 x 8",
         ["seng #9aa0a6", "tiang beton #bcbab4", "terpal biru #2a6ac0 / oranye #e07a3a", "angkot biru muda #3a8ac0"],
         [papan("PASAR WIRABUMI", "#c83a3a", "#ffffff", "huruf besi di atas gerbang los", "6 x 0.8", "gerbang utama"),
          papan("PASAR TERTIB, PEMBELI NYAMAN", "#ffffff", "#c83a3a", "spanduk vinyl kusam", "4 x 0.5", "tiang los terbuka"),
          papan("TERMINAL ANGKOT  -  JURUSAN 01 02 05", "#2a5a8a", "#ffffff", "papan jurusan bertiang", "3 x 0.6", "ujung halte")],
         [("Halte panjang", (0, 6)), ("Angkot berjajar (4)", (0, 8)), ("Gerobak dorong sayur", (-4, 1)), ("Lapak ikan (basah)", (3, -3)), ("Timbangan & keranjang", (-2, -1))],
         ["Harga bahan paling murah (-20%)", "Lapak Laras, pemasok warkop"], ["Becek, kotor (penampilan -1 kalau lama)", "Ramai copet pagi"], "03.00-17.00", "92: pasar")
bangunan(7, "Ruko Pelita & Bengkel Mas Fajar", "Pusat Kota",
         "Deretan ruko R1-R3; bengkel 6 x 4 setengah terbuka, rolling door",
         ["abu kusam #a8a8a4", "lantai hitam oli #3a3a3a", "rolling door abu #8a9098", "papan merah #c83a3a"],
         [papan("BENGKEL FAJAR MOTOR  -  TAMBAL BAN 24 JAM", "#c83a3a", "#ffffff", "papan seng dicat, huruf kotak", "4 x 0.6", "atas rolling door"),
          papan("SERVIS  OLI  PRESS BAN", "#f2c230", "#1e1e1e", "papan kaki A (sandwich board)", "0.8 x 1", "trotoar depan, kiri pintu")],
         [("Ban bekas bertumpuk", (-2.4, 0.4)), ("Kompresor", (2.4, -0.5)), ("Bak tambal ban", (1.6, 0.6)), ("Motor antre (3)", (0, 2))],
         ["Kerja paruh waktu, upgrade motor, servis murah"], ["Antre lama sore hari"], "07.00-22.00 (tambal ban 24 jam)", "segmen 82")
bangunan(8, "Plaza Wirabumi", "Pusat Kota",
         "Kotak besar 10 x 7, 3 lantai, fasad panel + kaca biru, atrium kaca di depan",
         ["panel ungu muda #c8b8e0", "kaca biru #7ab0d8", "rangka aluminium #d8d8dc"],
         [papan("PLAZA WIRABUMI", "#8a3ab0", "#ffffff", "huruf timbul menyala (neon putih malam)", "8 x 1", "atas atrium, lantai 3"),
          papan("BIOSKOP  LT 3", "#1e1e1e", "#f2c230", "neon box", "2 x 0.6", "pojok kanan fasad"),
          papan("SALE 50%", "#c83a3a", "#ffffff", "spanduk gantung vertikal", "0.8 x 3", "kiri atrium")],
         [("Pintu kaca putar", (0, 0.2)), ("Parkir motor penuh", (-6, 3)), ("Poster film (3)", (3, 0.1)), ("Satpam", (1.5, 1)), ("Tukang parkir", (-4, 4))],
         ["AC, bioskop, arkade, food court: kencan terbaik", "Buka sampai malam"], ["Mahal (+30%)", "Satpam usir kalau pakai seragam saat jam sekolah"], "10.00-22.00", "92: plaza")
bangunan(9, "Rumah Bram (Bukit Asri)", "Perumahan Bukit Asri",
         "P2 diperbesar 9 x 6, 2 lantai, pilar besar, atap limas tinggi hitam, kolam renang samping",
         ["putih #f2eee6", "atap hitam #2a2c30", "pilar putih #faf8f2", "kolam #78b0d6"],
         [papan("No. 1  KELUARGA MEGANTARA", "#2a2c30", "#d4a640", "huruf kuningan di dinding batu alam", "2 x 0.4", "pilar gerbang kanan")],
         [("Gerbang besi otomatis", (0, 4)), ("CCTV (2)", (4, 0.2)), ("3 mobil", (-4, 2.5)), ("Kolam renang", (6.5, -2)), ("Lampu taman", (2, 3))],
         ["Event Bram & Sasha, misi dokumen Bab 12"], ["Satpam pribadi: masuk tanpa diundang = ditangkap"], "", "92: rumah_bram")
bangunan(10, "Gudang markas Lampu Kota", "Bantaran Kali",
         "Gudang 7 x 5, atap pelengkung seng, pintu geser besar",
         ["bata cat hitam #2a2a2a", "mural bohlam kuning #f2c230", "seng #9aa0a6"],
         [papan("LAMPU KOTA", "#2a2a2a", "#f2c230", "mural bohlam raksasa + huruf cat semprot", "5 x 2", "dinding depan di atas pintu geser")],
         [("Lampu bohlam berderet", (0, 0.3)), ("Motor anggota (4)", (-3, 2)), ("Drum api (malam)", (3, 2)), ("Sofa bekas di luar", (2.5, 0.8))],
         ["Markas pemain: misi geng, simpan motor, latihan samsak"], ["Target serangan geng rival"], "24 jam", "segmen 82")
bangunan(11, "Lapangan bola kampung", "Bantaran Kali",
         "Lapangan tanah-rumput 11 x 6.4, gawang berjaring, bendera sudut",
         ["rumput botak #b8c088", "tanah #c8a878", "gawang putih #f2f2f2"],
         [papan("LAPANGAN RT 05 - DILARANG PARKIR", "#ffffff", "#2a2a2a", "papan seng dicat tangan, miring", "2 x 0.5", "pohon di sudut barat")],
         [("Gawang (2)", (0, 0)), ("Bangku bambu penonton", (0, 4)), ("Warung es di pinggir", (6.5, 3)), ("Pohon peneduh", (-6.5, 2.5))],
         ["Main bola gratis sore (Dodi & Didi)", "Stat kelincahan +"], ["Kalau hujan becek: licin, jatuh"], "06.00-18.00")
bangunan(12, "STM Karya Bangsa", "Selatan", "Lihat segmen 88", ["krem kusam", "marun #7a2a2a", "seng biru #3f6fa8"],
         [papan("STM KARYA BANGSA", "#7a2a2a", "#fae6a0", "papan marun di atap Gedung Teori", "7 x 1", "atas balkon lantai 2")],
         [("Lihat denah tapak STM", (0, 0))], ["Part murah, trek uji"], ["Wilayah Serigala Besi"], "06.30-16.00", "segmen 88")
bangunan(13, "Lahan proyek PT Graha Megantara", "Selatan",
         "Area 30 x 13 berpagar seng biru, ekskavator, pipa, kontainer kantor, lampu sorot",
         ["seng biru #3a6aa8", "ekskavator kuning #f2c230", "kontainer merah #c8503a"],
         [papan("SEGERA DIBANGUN: GRAHA MEGANTARA SUPERBLOK", "#1e3a6a", "#ffffff", "baliho besar bergambar gedung kaca", "8 x 2.5", "pojok depan, tiang besi"),
          papan("DILARANG MASUK - AREA PROYEK", "#f2c230", "#1e1e1e", "plat kuning-hitam", "1.5 x 0.6", "tiap 10 petak di pagar")],
         [("Ekskavator", (-8, -2)), ("Kontainer kantor", (8, -4)), ("Tumpukan pipa", (0, -3)), ("Lampu sorot (2)", (12, -1))],
         ["Set piece Bab 12-13: infiltrasi & bukti"], ["Satpam proyek + anjing malam"], "Satpam 24 jam", "92: kontainer_proyek")
bangunan(14, "Jl. Lingkar Selatan", "Selatan", "Jalan raya lurus 70 petak (balap liar, segmen 87)", ["aspal #55575c", "marka putih"],
         [papan("HATI-HATI  BALAP LIAR = PIDANA", "#ffffff", "#c83a3a", "spanduk polisi, kusam & robek", "4 x 0.6", "tiang lampu dekat warung nasi goreng")],
         [("Warung nasi goreng (titik kumpul)", (-14, 3)), ("Tiang lampu (tiap 8 petak)", (0, 3))], ["Balap liar Selasa & Jumat"], ["Razia 25%"], "Malam")
bangunan(15, "Menara pemancar", "Perbukitan Utara",
         "Rangka besi segitiga 10 petak, platform pertama 4 petak di atas tanah, rumah genset",
         ["besi merah-putih #c83a3a/#f2f2f2", "genset abu #8a9098"],
         [papan("BAHAYA TEGANGAN TINGGI", "#f2c230", "#c83a3a", "plat seng berkarat + petir", "0.8 x 0.6", "pagar kawat")],
         [("Pagar kawat bolong", (1.5, 1.5)), ("Rumah genset", (-2.5, -1)), ("Tangga ke platform", (0, 0))],
         ["Spot rahasia lihat lampu kota (event kencan)"], ["Jatuh dari tangga = pingsan"], "24 jam")
bangunan(16, "Jalur sepeda turunan Bukit Cemara", "Perbukitan Utara", "Setapak tanah turunan + gundukan lompat", ["tanah #c4a87a"],
         [papan("JALUR SEPEDA - PAKAI HELM", "#3a6a4a", "#ffffff", "papan kayu taman nasional", "1.6 x 0.5", "awal jalur")],
         [("Gundukan lompat (3)", (0, 0)), ("Pagar bambu di tikungan", (0, 0))], ["Mini game sepeda turunan"], ["Jatuh = sepeda rusak"], "Siang")
bangunan(17, "Kebun teh & danau", "Perbukitan Utara", "Kebun berundak + danau 18 x 10 + pondok kayu 3 x 3", ["teh #78aa5a", "danau #68a0cc", "pondok kayu #8a6a48"],
         [papan("WISATA DANAU TEH - SEWA PERAHU 5RB", "#8a6a48", "#ffffff", "papan kayu ukir", "2.4 x 0.6", "dermaga pondok")],
         [("Perahu kecil (2)", (2, 3)), ("Pondok teras danau", (0, 0)), ("Bangku kayu", (-3, 1.5))], ["Mancing & kencan sepi"], ["Jauh dari kota"], "06.00-18.00")
bangunan(18, "Taman kota & lapangan basket umum", "Kawasan Sekolah", "Taman + lapangan basket 7.4 x 6, ring besi", ["lapangan hijau #4a8a5a", "garis putih"],
         [papan("TAMAN KOTA - JAGA KEBERSIHAN", "#3a6a4a", "#ffffff", "papan hijau dinas", "2 x 0.5", "pintu masuk taman")],
         [("Ring basket (2)", (0, 0)), ("Bangku taman", (-5, 3)), ("Penjual es", (5, 3))], ["Basket 3x3 gratis, Liga Minggu"], ["Sore penuh anak SMP"], "05.00-22.00")
bangunan(19, "GOR Kota & kolam renang", "Kawasan Sekolah", "Lihat segmen 89", ["seng biru #4a7ab0", "putih"],
         [papan("GELANGGANG OLAHRAGA KOTA WIRABUMI", "#2a5a8a", "#ffffff", "huruf besi biru di kanopi", "10 x 0.8", "atas pintu masuk")],
         [("Lihat denah tapak GOR", (0, 0))], ["Gym, event, renang"], ["Bayar tiap masuk"], "06.00-21.00", "segmen 89")
bangunan(20, "TPU Bhakti", "Pusat Kota timur", "Makam berjajar, tembok rendah, gapura, cungkup", ["tembok putih kusam #e6e2d6", "kamboja"],
         [papan("TPU BHAKTI", "#ffffff", "#2a2a2a", "huruf cat hitam di gapura", "3 x 0.5", "gapura")],
         [("Cungkup peneduh", (3, -2)), ("Kamboja (6)", (0, 0)), ("Keran air & ember", (-2, -1))], ["Ziarah: karma +"], ["Malam: takut"], "24 jam")
bangunan(21, "Rumah pohon tua", "Hutan Jati Timur", "Gubuk papan di dahan, tinggi 2.4, tangga kayu, ayunan", ["kayu #8a6a48", "seng #8a9098"],
         [papan("MARKAS RAHASIA B & A - DILARANG MASUK", "#c8b088", "#5a3a1a", "tulisan anak kecil, crayon pudar", "1 x 0.4", "pintu gubuk")],
         [("Tangga kayu", (0, 1.5)), ("Ayunan tali", (2, 1)), ("Peti harta", (0, -0.5))], ["Rahasia Bram-Arga"], ["Lapuk: lantai bisa jebol"], "", "92: rumah_pohon")
bangunan(22, "Pondok penebang terbengkalai", "Hutan Jati Timur", "Gubuk 3.2 x 2.6 papan, atap seng miring", ["kayu lapuk #7a6a58"],
         [papan("JANGAN MASUK", "#7a6a58", "#c83a3a", "coretan cat semprot, tanpa papan resmi", "1 x 0.4", "dinding depan")],
         [("Tumpukan kayu", (-2, 0.5)), ("Kapak tertancap", (1.5, 1))], ["Bukti proyek Bab 12"], ["Gelap, ular acak"], "", "92: rumah_pohon")
for no, nama, wil, bentuk, warna, pp, pr, plus, minus, jam in [
    (23, "Bumi perkemahan Hutan Pinus", "Hutan Pinus", "Lapangan kemah, tenda, api unggun, gapura bambu", ["rumput #c4d696", "tenda oranye #d6784a"],
     [papan("BUMI PERKEMAHAN CEMARA", "#6a4a30", "#f2e2b0", "gapura bambu, huruf ukir di papan", "4 x 0.6", "gapura masuk")],
     [("Api unggun", (0, -4)), ("Tenda (3)", (0, -6)), ("Tiang bendera", (-4, -2))], ["Kemah Pramuka, kencan api unggun"], ["Dingin malam: stamina -"], "24 jam"),
    (24, "Curug Cemara", "Hutan Pinus", "Tebing batu berlumut + air terjun + kolam kecil", ["batu #8a8478", "lumut #6a7a4a"],
     [papan("CURUG CEMARA - DILARANG MANDI SAAT HUJAN", "#3a6a4a", "#ffffff", "papan kayu", "2 x 0.5", "awal setapak")],
     [("Batu besar (duduk)", (-3, 2)), ("Kolam", (0, 0))], ["Spot kencan, lagu Sekar"], ["Licin"], "Siang"),
    (25, "Gua Kapur", "Perbukitan Utara", "Bukit batu kapur + mulut gua", ["kapur #d8d4c4"],
     [papan("BAHAYA - GUA TIDAK DIJAGA", "#c83a3a", "#ffffff", "plat seng", "1 x 0.4", "mulut gua")],
     [("Mulut gua", (0, 0)), ("Batu (3)", (2, 1.5))], ["Kristal (dijual)", "Lukisan dinding (Andra)"], ["Butuh senter, kelelawar"], "24 jam"),
    (26, "Pasar loak & lapak rongsok", "Pusat Kota selatan", "Lapak terpal di lahan tanah, 5 lapak", ["terpal warna-warni"],
     [papan("PASAR LOAK - BARANG ANTIK, ONDERDIL, KASET", "#e2b84a", "#2a2a2a", "kardus & triplek cat tangan", "3 x 0.5", "tiang lapak pertama")],
     [("Lapak (5)", (0, 0)), ("Tumpukan rongsok", (5, -2))], ["Barang langka murah", "Jual barang temuan"], ["Barang bisa palsu (10%)"], "08.00-15.00"),
    (27, "Pabrik es tua (kosong)", "Selatan", "Beton kusam 10 x 6, atap gergaji berkarat, cerobong", ["beton #a8a8a4", "karat #8a5a44", "mural Andra"],
     [papan("PABRIK ES SARI MURNI (huruf hilang sebagian)", "#a8a8a4", "#4a4a4a", "huruf semen timbul, retak", "6 x 0.7", "dinding depan atas")],
     [("Cerobong", (3, -3)), ("Mural Andra", (-5, 0)), ("Drum & ban bekas", (0, 1.5))], ["Arena tanding gelap, markas cadangan"], ["Tidak ada lampu"], "24 jam"),
    (28, "Terminal bus antarkota", "Timur", "Kanopi panjang 10 x 5, loket, peron, bus parkir", ["kanopi hijau #3a8a6a", "lantai abu"],
     [papan("TERMINAL TIPE B WIRABUMI TIMUR", "#3a8a6a", "#ffffff", "huruf besi di kanopi", "8 x 0.7", "atas peron"),
      papan("JURUSAN: SUKAMEKAR  KALISARI  PRADANA", "#1e1e1e", "#f2c230", "papan LED berjalan", "3 x 0.5", "dinding loket")],
     [("Loket (3)", (-3, -1)), ("Bus parkir", (0, 4)), ("Warung kopi terminal", (5, -1))], ["Ke desa & kota lain"], ["Calo & copet"], "04.00-21.00"),
    (29, "Kolam pemancingan Pak Haji", "Perkampungan utara", "Kolam + dermaga kayu + saung lesehan", ["air hijau #6a9a7a", "saung bambu"],
     [papan("PEMANCINGAN PAK HAJI - HARIAN 15RB", "#2f6b4a", "#ffffff", "papan kayu cat hijau", "2.4 x 0.5", "pintu masuk")],
     [("Dermaga (4 titik mancing)", (0, 0)), ("Saung lesehan", (3, -2))], ["Mini game mancing, cerita ayah"], ["Bayar per hari"], "06.00-17.00"),
    (30, "Jembatan Timur", "Selatan", "Jembatan rangka baja melengkung", ["baja biru #3a5a8a"],
     [papan("JEMBATAN TIMUR - DIRESMIKAN PT GRAHA MEGANTARA", "#d4a640", "#2a2a2a", "plakat kuningan", "1 x 0.6", "kedua ujung")],
     [("Plakat peresmian", (0, 0))], ["Jalan pintas Bab 7+"], ["Retak Bab 12"], "Bab 7+"),
    (31, "Rakit penyeberangan & pematang", "Bantaran", "Rakit bambu + tali + dermaga kecil", ["bambu #c8b070"],
     [papan("RAKIT 2RB - PELAMPUNG WAJIB (tidak ada)", "#ffffff", "#2a2a2a", "triplek cat tangan", "1 x 0.4", "dermaga")],
     [("Rakit", (0, 0)), ("Tali", (0, 0))], ["Jalan pintas & kabur"], ["Bisa jatuh ke kali"], "05.00-18.00"),
    (32, "Kandang sapi & gubuk sawah", "Selatan", "Kandang kayu beratap seng + gubuk panggung bambu", ["kayu #8a6a48", "seng"],
     [papan("(tanpa papan) orang-orangan sawah", "#c8b070", "#2a2a2a", "-", "-", "-")],
     [("Kandang (3 sapi)", (0, 0)), ("Gubuk", (6, 2)), ("Orang-orangan", (8, 4))], ["Kerja angon sapi"], ["Bau: penampilan -"], "Siang"),
    (33, "Gerbang Perumahan Bukit Asri", "Perumahan", "Gapura 2 pilar bata + balok papan, pos satpam kaca, portal", ["bata #a8583a", "putih"],
     [papan("PERUMAHAN BUKIT ASRI", "#2a2c30", "#d4a640", "huruf kuningan di balok gapura", "6 x 0.7", "atas jalan"),
      papan("TAMU WAJIB LAPOR", "#ffffff", "#c83a3a", "plat kecil", "1.2 x 0.4", "pos satpam")],
     [("Pos satpam", (-3.5, 0)), ("Portal", (0, 1))], ["Aman"], ["Pejalan kaki ditanya satpam malam"], "24 jam"),
    (34, "Gapura Gang Kenanga", "Perkampungan", "Gapura beton cat warna, atap genteng mini", ["merah-putih", "hijau"],
     [papan("SELAMAT DATANG DI GANG KENANGA RW 07", "#c83a3a", "#ffffff", "cat tembok, bendera kecil", "3 x 0.5", "balok gapura")],
     [("Pos ronda di samping", (2.5, -1))], ["Penanda masuk kampung"], ["-"], "24 jam"),
    (35, "Musala kampung Al-Hidayah", "Perkampungan", "Bangunan 4 x 4, kubah kecil seng hijau", ["putih", "kubah hijau #3a8a5a"],
     [papan("MUSALA AL-HIDAYAH", "#3a8a5a", "#ffffff", "papan seng", "2 x 0.4", "atas pintu")],
     [("Tempat wudu", (2, -1)), ("Kentongan", (-2, 0.5))], ["Ngaji sore: karma +"], ["-"], "04.00-20.00", ),
    (36, "Ruko, Indomurah, bank, hotel melati", "Pusat Kota", "Lihat katalog tipe R1-R7, MM, PK (segmen 90)", ["lihat palet ruko"],
     [papan("INDOMURAH", "#2a5ab0", "#f2c230", "pita biru-kuning-merah, logo bulat", "4 x 0.7", "atas kaca depan"),
      papan("BANK WIRA  -  ATM 24 JAM", "#1e4a8a", "#ffffff", "huruf timbul + logo di atap", "3 x 0.6", "atas lobi"),
      papan("HOTEL MELATI SRI REJEKI", "#c83a3a", "#ffffff", "papan vertikal menonjol, neon", "0.6 x 3", "sudut depan")],
     [("Parkiran Indomurah", (0, 3)), ("ATM", (2.5, 0.2)), ("Galon & es krim box", (-2, 0.5))], ["Indomurah 24 jam"], ["Mahal 10%"], "24 jam / 08.00-15.00 bank"),
]:
    bangunan(no, nama, wil, bentuk, warna, pp, pr, plus, minus, jam, interior="92: indomurah" if no == 36 else None)

# ============================================================ DAERAH LUAR KOTA (40-66)
for no, nama, wil, bentuk, warna, pp, pr, plus, minus, jam, intr in [
    (40, "Kawah Sangkala", "Gunung", "Danau kawah tosca, tebing belerang", ["tosca #6abeaa", "belerang #e2d26a"],
     [papan("ZONA BAHAYA GAS - MAKS 15 MENIT", "#c83a3a", "#ffffff", "plat besi", "1.4 x 0.6", "bibir kawah")], [("Pagar kayu", (0, 0))], ["Pemandangan, ending tertentu"], ["Gas: stamina turun"], "06.00-15.00", None),
    (41, "Basecamp pendakian & pos 1", "Gunung", "Rumah kayu 5 x 3 + warung, papan peta jalur", ["kayu #96704a"],
     [papan("BASECAMP SANGKALA VIA WIRABUMI", "#3a6a4a", "#ffffff", "papan kayu besar", "4 x 0.7", "atap teras")], [("Papan peta jalur", (-2, 1)), ("Timbangan carrier", (2, 0.5))], ["Daftar naik, sewa tenda"], ["Wajib bayar 15rb"], "05.00-15.00", "basecamp"),
    (42, "Alun-alun Edelweis", "Gunung", "Padang edelweis datar", ["putih krem", "rumput kering"], [], [("Tenda (event)", (0, 0))], ["Kemah puncak"], ["Dingin ekstrem"], "Event", None),
    (43, "Pemandian air panas Sangkala", "Gunung", "Kolam batu 2 + bangunan bilas 6 x 4", ["batu #8a8478", "air hijau susu"],
     [papan("PEMANDIAN AIR PANAS SANGKALA - 10RB", "#7a3a1a", "#f2e2b0", "papan kayu ukir", "3 x 0.6", "gerbang")], [("Kolam (2)", (0, 2)), ("Loket", (-3, 0))], ["Pulihkan stamina penuh"], ["Bayar"], "07.00-21.00", None),
    (44, "Bukit Bintang (warung jagung bakar)", "Lereng", "Warung bambu berderet di tepi jurang", ["bambu", "lampu kuning"],
     [papan("JAGUNG BAKAR BU EUIS - VIEW KOTA", "#e2b84a", "#5a2a1a", "spanduk vinyl + lampu bohlam", "2.4 x 0.5", "atap warung")], [("Bangku tepi jurang", (0, 2)), ("Pagar bambu", (0, 3))], ["Kencan malam terbaik"], ["Start balap liar: berisik"], "16.00-01.00", None),
    (45, "Kawasan villa Puncak", "Lereng", "5 villa P1/P3, kolam pribadi", ["putih", "kayu"],
     [papan("VILLA DISEWAKAN - HUB 08xx", "#ffffff", "#1e4a8a", "spanduk kecil", "1.2 x 0.4", "pagar")], [], ["Sewa villa (study tour, pesta)"], ["Mahal"], "", None),
    (46, "Jl. Tikungan Seribu", "Lereng", "Jalan serpentin", ["aspal"],
     [papan("TURUNAN TAJAM - GUNAKAN GIGI RENDAH", "#f2c230", "#1e1e1e", "rambu kuning", "1 x 1", "tiap tikungan")], [("Pagar pengaman", (0, 0))], ["Balap liar Bab 8"], ["Kabut, jurang"], "", None),
    (47, "SMK Pariwisata & Desa Sukamekar", "Desa", "Sekolah 8 x 4 + rumah panggung kayu + masjid desa", ["kayu", "hijau teh"],
     [papan("SMK PARIWISATA SUKAMEKAR", "#2a6a8a", "#ffffff", "papan biru di pagar", "4 x 0.6", "gerbang")], [("Pendopo perguruan silat", (6, -2))], ["Rumah Wulan, tur kebun teh"], ["Bus jarang"], "", "rumah_wulan"),
    (48, "Pabrik teh tua", "Desa", "Pabrik kayu-bata 4 lantai, jendela banyak", ["bata #a8583a", "kayu"],
     [papan("PABRIK TEH SUKAMEKAR 1928", "#5a3a1a", "#f2e2b0", "huruf besi berkarat", "5 x 0.6", "fasad atas")], [("Truk teh", (3, 3))], ["Tur & kerja paruh waktu"], ["Kerja berat"], "07.00-16.00", None),
    (49, "Bendungan & PLTA Sirnagalih", "Waduk", "Bendungan beton 16 petak + gedung PLTA", ["beton #b8b8b4"],
     [papan("BENDUNGAN SIRNAGALIH", "#1e4a8a", "#ffffff", "huruf beton", "6 x 0.7", "tubuh bendungan")], [("Pintu air", (0, 0))], ["Jalan pintas, pemandangan"], ["Dilarang turun ke pintu air"], "", None),
    (50, "Warung ikan bakar & dermaga perahu", "Waduk", "Saung panggung di atas air", ["bambu", "terpal"],
     [papan("IKAN BAKAR MANG ODING", "#c83a3a", "#ffffff", "spanduk vinyl", "2.4 x 0.5", "atap saung")], [("Perahu sewa (3)", (2, 3))], ["Makan murah, sewa perahu"], ["Jauh"], "10.00-21.00", None),
    (51, "Batu Tulis", "Bukit", "Batu besar berprasasti + cungkup kecil", ["batu #8a8478"], [], [("Cungkup", (2, 0))], ["Rahasia cerita (legenda kota)"], ["Sulit ditemukan"], "", None),
    (52, "Pasar hewan Tegalsari", "Desa", "Los kayu terbuka, kandang kambing/sapi", ["kayu", "seng"],
     [papan("PASAR HEWAN TEGALSARI - RABU & SABTU", "#3a6a4a", "#ffffff", "papan seng", "3 x 0.5", "gerbang")], [("Kandang (8)", (0, 0))], ["Beli ayam/kambing (Idul Adha)"], ["Bau"], "Rabu & Sabtu 05.00-12.00", None),
    (53, "Pondok pesantren Darul Falah", "Desa", "Asrama 2 lantai + masjid", ["putih", "hijau"],
     [papan("PONDOK PESANTREN DARUL FALAH", "#2f6b4a", "#ffffff", "papan hijau kaligrafi", "5 x 0.6", "gerbang")], [], ["Event Ramadan"], ["Aturan ketat"], "", None),
    (54, "Asrama Batalyon 3", "Timur", "Barak berderet, lapangan apel, gerbang jaga", ["hijau tentara #7a8a5a", "putih"],
     [papan("BATALYON 3 - DISIPLIN, SETIA, SIAGA", "#4a5a3a", "#f2e2b0", "huruf timbul di tembok gerbang", "6 x 0.7", "gerbang")], [("Pos jaga", (3, 1)), ("Portal", (0, 2))], ["Rumah Dimas"], ["Masuk harus diajak"], "", "rumah_dimas"),
    (55, "Kawasan Industri Pradana", "Timur", "8 pabrik panel seng, cerobong", ["abu #c8c8cc", "biru"],
     [papan("KAWASAN INDUSTRI PRADANA", "#2a5a8a", "#ffffff", "gapura beton modern", "8 x 0.8", "pintu masuk")], [("Truk kontainer", (0, 3))], ["Kerja shift (gaji tinggi)"], ["Capek: energi -30"], "24 jam", None),
    (56, "Sirkuit Tanjung Pradana", "Timur", "Lihat segmen 87", ["merah-putih kerb"],
     [papan("SIRKUIT TANJUNG PRADANA", "#c83a3a", "#ffffff", "huruf besar di atap tribun utama", "20 x 1.5", "atap tribun utama")], [], ["Balap resmi"], ["Tiket/biaya"], "Event", None),
    (57, "Gerbang peserta / paddock", "Timur", "Gerbang besi + pos", ["abu"], [papan("PESERTA & PANITIA", "#1e1e1e", "#f2c230", "plat", "2 x 0.4", "gerbang")], [], [], [], "", None),
    (58, "Stasiun Lintang", "Pantai", "Stasiun kecil 8 x 4, atap pelana", ["putih biru"], [papan("LINTANG +4 m", "#f6f4ec", "#1e1e1e", "papan stasiun", "3 x 0.5", "atas pintu")], [], ["Kereta ke kota"], ["Kecil"], "05.00-21.00", "stasiun"),
    (59, "Pantai Lintang & warung seafood", "Pantai", "7 warung berderet + voli pantai", ["warna-warni", "pasir #e8d6a0"],
     [papan("SEAFOOD BU TINAH - KERANG, CUMI, IKAN BAKAR", "#3a8ac0", "#ffffff", "spanduk vinyl gambar ikan", "3 x 0.6", "atap warung 1")], [("Gazebo (4)", (0, 3)), ("Net voli", (-8, 2))], ["Kencan, voli, renang"], ["Bendera merah: ombak"], "08.00-22.00", "warung_seafood"),
    (60, "Hotel Samudra", "Pantai", "Hotel 4 lantai menghadap laut", ["putih", "kaca biru"],
     [papan("HOTEL SAMUDRA ***", "#1e4a8a", "#ffffff", "huruf timbul di atap", "6 x 0.8", "atap")], [("Kolam", (0, -3))], ["Pesta perpisahan"], ["Mahal"], "24 jam", None),
    (61, "Tanjung Karang & mercusuar", "Pantai", "Mercusuar putih-merah di batu karang", ["putih", "merah"], [], [("Tangga spiral", (0, 0))], ["Spot ending"], ["Angin kencang"], "24 jam", None),
    (62, "TPI & Kampung Nelayan Muara", "Pantai", "Gedung lelang + dermaga + perahu warna-warni", ["biru", "perahu merah/kuning"],
     [papan("TEMPAT PELELANGAN IKAN MUARA", "#2a5a8a", "#ffffff", "papan biru", "5 x 0.6", "atap TPI")], [("Perahu (5)", (0, 4))], ["Ikan segar, ikut melaut"], ["Bau amis"], "03.00-10.00", None),
    (63, "Jalur kayu hutan bakau", "Pantai", "Jembatan kayu berliku di atas bakau", ["kayu"], [], [], ["Foto, tenang"], ["Nyamuk"], "Siang", None),
    (64, "Pantai Watu Sepi", "Pantai", "Pantai kecil berbatu + gubuk", ["batu hitam", "pasir"], [], [("Gubuk", (0, -2))], ["Rahasia, kemah"], ["Sepi, rawan"], "24 jam", None),
]:
    bangunan(no, nama, wil, bentuk, warna, pp, pr, plus, minus, jam, intr)
