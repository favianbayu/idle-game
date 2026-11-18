"""Rutinitas NPC pendukung (segmen 30) dan NPC wilayah (segmen 33). Format sama dengan npc_utama.py.
Untuk NPC ini: S = hari kerja (Senin-Jumat), B = Sabtu, M = Minggu & libur. Kalau B tidak ada, Sabtu pakai S.
"""
from npc_utama import N, npc

# ======================================================================== keluarga & kampung
npc("om_darto", "Om Darto", "warkop", "motor", {
    "kerja": "Kaus oblong belel, celemek hijau Warkop Simpang, sarung di pundak, sandal jepit",
    "rumah": "Kaus singlet, sarung",
    "jalan": "Kemeja batik lengan pendek, celana bahan, helm bogo",
    "malam": "Jaket jeans tua, sarung melilit leher"},
    S=[("04.30", "06.00", "warkop", "Menyalakan kompor, merebus air, menyusun gelas", "masak", "kerja"),
       ("06.00", "11.00", "warkop", "Melayani sarapan & kopi pagi (ramai 06.00-08.00)", "masak", "kerja"),
       ("11.00", "13.00", "warkop", "Tidur siang di kursi warkop", "tidur_kursi", "kerja"),
       ("13.00", "17.00", "warkop", "Warung sepi: menghitung uang sambil mengernyit, burung perkutut", "duduk", "kerja"),
       ("17.00", "18.00", "pasar", "Belanja kopi, gula, roti ke pasar (motor bebek)", "naik_motor", "jalan", {"m": "motor", "via": "Jl. Raya Wirabumi"}),
       ("18.00", "23.00", "warkop", "Ramai malam: kopi, catur, dangdut lama", "masak", "kerja"),
       ("23.00", "00.30", "pos_ronda", "Main catur di pos ronda", "duduk", "malam"),
       ("00.30", "04.30", "warkop", "Tidur", "tidur", "rumah")],
    M=[("05.30", "11.00", "warkop", "Warkop buka setengah hari", "masak", "kerja"),
       ("11.00", "15.00", "warkop", "Merawat perkutut, tidur siang", "tidur_kursi", "rumah"),
       ("15.00", "17.00", "sd_kenanga", "Mengajak Cici jalan sore", "jalan", "jalan"),
       ("17.00", "23.00", "warkop", "Ramai malam", "masak", "kerja"),
       ("23.00", "05.30", "warkop", "Tidur", "tidur", "rumah")])

npc("cici", "Cici", "warkop", "jalan", {
    "sekolah": "Seragam SD merah-putih, ikat rambut stroberi, tas kartun",
    "rumah": "Kaus kartun, rok rempel",
    "tidur": "Piama bergambar kelinci"},
    S=[("06.00", "06.30", "warkop", "Sarapan, merengek minta uang jajan", "makan", "sekolah"),
       ("06.30", "11.30", "sd_kenanga", "Sekolah SD", "duduk_tulis", "sekolah"),
       ("11.30", "14.00", "warkop", "Pulang, makan, nonton kartun", "duduk", "rumah"),
       ("14.00", "17.00", "gapura_kenanga", "Main masak-masakan & layangan di gang", "jongkok", "rumah"),
       ("17.00", "19.00", "musala_kenanga", "Mengaji", "baca", "rumah"),
       ("19.00", "20.30", "warkop", "Minta diajari PR (mini game Les PR)", "duduk_tulis", "rumah"),
       ("20.30", "06.00", "warkop", "Tidur", "tidur", "tidur")],
    M=[("06.00", "09.00", "warkop", "Kartun Minggu pagi", "duduk", "rumah"),
       ("09.00", "12.00", "lap_bola", "Menonton liga futsal kampung (fans Uti)", "berdiri", "rumah"),
       ("12.00", "17.00", "gapura_kenanga", "Main di gang", "jongkok", "rumah"),
       ("17.00", "20.30", "warkop", "Di rumah", "duduk", "rumah"),
       ("20.30", "06.00", "warkop", "Tidur", "tidur", "tidur")])

npc("bimo", "Bimo Prasetyo", "rumah_bimo", "sepeda", {
    "sekolah": "Seragam sesak di perut, kancing hampir lepas",
    "rumah": "Kaus kebesaran bergambar mi, celana pendek",
    "masak": "Celemek bakso ayahnya, handuk di bahu"},
    S=[("06.00", "06.30", "rumah_bimo", "Sarapan tiga kali", "makan", "sekolah"),
       ("06.30", "06.50", "sma", "Bersepeda dengan pemain (kalau diajak) atau sendiri", "sepeda", "sekolah", {"via": "Gang Kenanga, Jl. Raya Wirabumi"}),
       ("06.50", "09.30", "sma.x2", "Sebangku pemain", "duduk", "sekolah"),
       ("09.30", "10.00", "sma.kantin", "Mencicipi semua lapak", "makan", "sekolah"),
       ("10.00", "12.00", "sma.x2", "Pelajaran", "duduk", "sekolah"),
       ("12.00", "12.30", "sma.kantin", "Makan siang", "makan", "sekolah"),
       ("12.30", "14.00", "sma.x2", "Pelajaran, tidur di meja", "tidur_meja", "sekolah"),
       ("14.00", "17.00", "sma", "Membantu ayah jualan bakso di depan sekolah", "jualan", "masak"),
       ("17.00", "21.00", "rumah_bimo", "Menonton acara masak, main game HP", "hp", "rumah"),
       ("21.00", "06.00", "rumah_bimo", "Tidur", "tidur", "rumah")],
    M=[("07.00", "11.00", "lap_bola", "Liga futsal kampung (cadangan abadi)", "berdiri", "rumah"),
       ("11.00", "17.00", "rumah_bimo", "Bereksperimen resep", "masak", "masak"),
       ("17.00", "21.00", "warkop", "Nongkrong di warkop", "duduk", "rumah"),
       ("21.00", "07.00", "rumah_bimo", "Tidur", "tidur", "rumah")],
    L=[("07.00", "15.00", "warkop", "Setelah Bab 9: koki warkop (Libur Panjang kerja penuh)", "masak", "masak")])

npc("fajar", "Mas Fajar", "ruko_pelita", "motor", {
    "kerja": "Kaus kerja penuh oli, jeans robek, handuk di leher, gelang karet",
    "geng": "Jaket hitam lis kuning Lampu Kota",
    "paket_c": "Kemeja kotak dipinjam dari Om Darto"},
    S=[("07.00", "12.00", "ruko_pelita", "Membuka bengkel, servis motor", "servis", "kerja"),
       ("12.00", "13.00", "warkop", "Makan siang & kopi", "makan", "kerja", {"via": "Jl. Raya Wirabumi"}),
       ("13.00", "18.00", "ruko_pelita", "Bengkel (Uti & Arga membantu)", "servis", "kerja"),
       ("18.00", "19.00", "ruko_pelita", "Belajar buku paket C diam-diam", "baca", "kerja"),
       ("19.00", "23.00", "markas_lk", "Markas Lampu Kota", "duduk", "geng"),
       ("23.00", "07.00", "ruko_pelita", "Tidur di kamar belakang bengkel", "tidur", "kerja")],
    M=[("09.00", "15.00", "ruko_pelita", "Bengkel setengah hari", "servis", "kerja"),
       ("15.00", "23.00", "markas_lk", "Konvoi & markas", "naik_motor", "geng"),
       ("23.00", "09.00", "ruko_pelita", "Tidur", "tidur", "kerja")])

npc("jaka", "Bang Jaka", "markas_lk", "motor", {
    "geng": "Jaket hitam lis kuning Lampu Kota, rambut gondrong diikat, boots",
    "kerja": "Kaus hitam, celana kargo, sarung tangan kerja (kuli angkut pasar)"},
    S=[("04.00", "10.00", "pasar", "Kuli angkut di pasar subuh", "angkut", "kerja", {"via": "Jl. Bantaran, Jl. Selatan"}),
       ("10.00", "15.00", "markas_lk", "Tidur siang di kamar atas gudang", "tidur", "kerja"),
       ("15.00", "18.00", "markas_lk", "Melatih anggota baru berantem", "silat", "geng"),
       ("18.00", "20.00", "warkop", "Ngopi dengan Om Darto (sebelum rahasia terbuka: menghindar)", "duduk", "geng"),
       ("20.00", "02.00", "markas_lk", "Rapat & patroli malam Kenanga-Bantaran", "naik_motor", "geng"),
       ("02.00", "04.00", "markas_lk", "Tidur", "tidur", "geng")])

npc("kobar", "Kobar", "bengkel_wijaya", "motor", {
    "geng": "Mohawk hitam-merah, rompi jeans patch serigala, rantai dompet",
    "kerja": "Wearpack hitam terbuka sampai pinggang"},
    S=[("08.00", "17.00", "bengkel_wijaya", "Bengkel Wijaya Motor", "servis", "kerja"),
       ("17.00", "19.00", "pabrik_es", "Latihan berantem di pabrik es tua", "silat", "geng", {"via": "Jl. Selatan"}),
       ("19.00", "22.00", "nasgor_lingkar", "Serigala Besi kumpul", "duduk", "geng"),
       ("22.00", "01.00", "lingkar", "Balap liar & taruhan (Selasa, Jumat); hari lain jalan Kawasan Industri", "naik_motor", "geng"),
       ("01.00", "08.00", "bengkel_wijaya", "Tidur", "tidur", "kerja")])

npc("narti", "Bu Narti", "rumah_narti", "jalan", {
    "rumah": "Bergo bunga-bunga, daster batik, sandal jepit, kipas tangan, kacamata baca di ujung hidung"},
    S=[("05.00", "07.00", "rumah_narti", "Menyapu halaman kos sambil memantau gang", "sapu", "rumah"),
       ("07.00", "09.00", "gapura_kenanga", "Belanja sayur di gerobak Bu Sum, bergosip", "ngobrol", "rumah"),
       ("09.00", "15.00", "rumah_narti", "Mengurus kos, menonton sinetron", "duduk", "rumah"),
       ("15.00", "18.00", "warkop", "Duduk di bangku depan warkop, gosip sore", "ngobrol", "rumah"),
       ("18.00", "21.00", "rumah_narti", "Arisan (Kamis) atau sinetron", "duduk", "rumah"),
       ("21.00", "05.00", "rumah_narti", "Tidur", "tidur", "rumah")])

npc("pak_rt", "Pak RT Slamet", "rumah_rt", "motor", {
    "rumah": "Kopiah hitam, kemeja batik lengan pendek, buku catatan warga",
    "kerja": "Seragam PNS kelurahan"},
    S=[("07.00", "14.00", "pasar", "Kantor kelurahan di Pusat Kota", "duduk_tulis", "kerja", {"m": "motor"}),
       ("14.00", "18.00", "rumah_rt", "Melayani surat warga di teras", "duduk_tulis", "rumah"),
       ("18.00", "19.30", "musala_kenanga", "Magrib & isya", "salat", "rumah"),
       ("21.00", "23.00", "pos_ronda", "Ronda (Sabtu: kerja bakti pagi 07.00 di gang)", "duduk", "rumah"),
       ("23.00", "07.00", "rumah_rt", "Tidur", "tidur", "rumah")])

npc("ujang", "Pak Ujang", "rumah_ujang", "jalan", {
    "kerja": "Kaus abu, topi pet, sapu lidi, kunci banyak di pinggang",
    "rumah": "Sarung, kaus oblong, peci"},
    S=[("05.30", "06.30", "sma.halaman", "Membuka gerbang, menyapu halaman", "sapu", "kerja"),
       ("06.30", "09.30", "sma.pos", "Duduk di pos, menyapa siswa", "duduk", "kerja"),
       ("09.30", "12.00", "sma.halaman", "Merawat taman, membetulkan bangku", "jongkok", "kerja"),
       ("12.00", "13.00", "sma.musala", "Zuhur", "salat", "kerja"),
       ("13.00", "17.30", "sma.halaman", "Membersihkan kelas setelah pulang", "sapu", "kerja"),
       ("17.30", "21.00", "rumah_ujang", "Makan, radio tua", "duduk", "rumah"),
       ("21.00", "21.30", "sma.gedung_lama", "Keliling sekolah dengan senter (21.00)", "jalan", "kerja"),
       ("21.30", "01.00", "rumah_ujang", "Tidur", "tidur", "rumah"),
       ("01.00", "01.30", "sma.gedung_lama", "Keliling kedua (01.00)", "jalan", "kerja"),
       ("01.30", "05.30", "rumah_ujang", "Tidur", "tidur", "rumah")])

npc("iyah", "Mak Iyah", "warung_iyah", "jalan", {
    "kerja": "Daster, celemek, kain di kepala"},
    S=[("05.00", "17.00", "warung_iyah", "Warung gorengan belakang sekolah (ramai istirahat & jam bolos)", "jualan", "kerja"),
       ("17.00", "05.00", "warung_iyah", "Rumah di belakang warung", "tidur", "kerja")])

npc("ama", "Ama", "toko_pena", "jalan", {
    "rumah": "Rambut putih disanggul, kacamata tebal, kebaya encim, kipas"},
    S=[("06.00", "14.00", "toko_pena", "Jaga toko, mengukus bakpao", "kasir", "rumah"),
       ("14.00", "17.00", "toko_pena", "Tidur siang di kursi rotan", "tidur_kursi", "rumah"),
       ("17.00", "21.00", "toko_pena", "Menonton TV, memanggil Mei turun makan", "duduk", "rumah"),
       ("21.00", "06.00", "toko_pena", "Tidur", "tidur", "rumah")])

npc("rio", "Rio", "rumah_rio", "motor", {
    "sekolah": "Seragam dikeluarkan, undercut, kalung rantai",
    "geng": "Kaus hitam ketat, jaket kulit imitasi"},
    S=[("06.50", "14.00", "sma.xi1", "Sekolah, mengikuti Bram", "duduk", "sekolah"),
       ("14.00", "17.00", "sma.parkir_guru", "Nongkrong geng, iseng menendang tas anak kelas X", "berdiri", "geng"),
       ("17.00", "20.00", "gor", "Angkat beban di gym GOR", "olahraga", "geng"),
       ("20.00", "23.00", "plaza", "Nongkrong", "ngobrol", "geng"),
       ("23.00", "06.50", "rumah_rio", "Tidur", "tidur", "geng")])

npc("kevin", "Kevin", "apartemen", "motor", {
    "sekolah": "Seragam rapi, kacamata bulat tipis, rambut belah tengah, HP di tangan",
    "jalan": "Kemeja polos rapi, sneakers mahal"},
    S=[("06.50", "14.00", "sma.xi1", "Sekolah, main HP", "hp", "sekolah"),
       ("14.00", "16.00", "sma.kantin_pojok", "Menyusun gosip & akun palsu", "hp", "sekolah"),
       ("16.00", "22.00", "kafe", "Kafe, laptop", "duduk", "jalan"),
       ("22.00", "06.50", "apartemen", "Tidur", "tidur", "jalan")])

# ======================================================================== guru (satu pola, beda tempat)
GURU = {
    "hartini": ("Bu Hartini", "rumah_hartini", "sma.kepsek", "Kebaya kerja, kacamata rantai, sanggul"),
    "ratna": ("Bu Ratna", "rumah_guru_asri", "sma.ruang_guru", "Blazer hitam, rambut dikonde, penggaris kayu"),
    "hendro": ("Pak Hendro", "mes_guru", "sma.lapangan", "Kaus olahraga, peluit, topi"),
    "wawan": ("Pak Wawan", "rumah_guru_kenanga", "sma.halaman", "Seragam PNS, kumis, buku pelanggaran"),
    "sinta": ("Bu Sinta", "rumah_guru_pusat", "sma.mading", "Hijab pastel, kardigan, buku"),
    "anton": ("Mr. Anton", "rumah_guru_pusat", "sma.ruang_guru", "Kemeja slim, sneakers"),
    "gunadi": ("Pak Gunadi", "rumah_guru_bantaran", "sma.ruang_guru", "Jas lab bernoda, rambut putih berdiri"),
    "melati": ("Bu Melati", "rumah_guru_asri", "sma.studio", "Gaun etnik, gelang kayu"),
}
for gid, (nama, rumah, tempat, baju) in GURU.items():
    npc(gid, nama, rumah, "motor", {"kerja": baju, "rumah": "Pakaian rumah sederhana"},
        S=[("06.30", "07.00", "sma.parkir_guru", "Datang, parkir motor/mobil", "jalan", "kerja"),
           ("07.00", "14.00", tempat, "Mengajar sesuai jadwal pelajaran, sisanya di tempat ini", "mengajar", "kerja"),
           ("14.00", "16.00", tempat, "Ekskul / rapat / koreksi", "duduk_tulis", "kerja"),
           ("16.00", "21.00", rumah, "Pulang", "duduk", "rumah"),
           ("21.00", "06.30", rumah, "Tidur", "tidur", "rumah")])
N["wawan"]["hari"]["S"].insert(2, ("07.00", "14.00", "sma.halaman", "Patroli koridor tiap 30 menit, menangkap yang bolos", "jalan", "kerja"))
N["wawan"]["hari"]["S"].pop(1)
N["hendro"]["hari"]["S"][2] = ("14.00", "16.00", "sma.lapangan", "Melatih futsal; Minggu pagi jadi marshal liga sirkuit (Bab 9+)", "mengajar", "kerja")

# ======================================================================== wilayah luar kota (segmen 33)
npc("kyai_mahfud", "Kyai Mahfud Sastrowiryo", "pesantren", "jalan", {
    "rumah": "Peci hitam, baju koko putih, sarung kotak hijau, tasbih kayu, kacamata bulat emas"},
    S=[("04.00", "06.30", "pesantren", "Subuh berjamaah, mengajar santri", "mengajar", "rumah"),
       ("06.30", "11.30", "pesantren", "Perpustakaan pesantren, menulis", "duduk_tulis", "rumah"),
       ("11.30", "13.00", "pesantren", "Zuhur, makan bersama santri", "salat", "rumah"),
       ("13.00", "15.00", "pesantren", "Menerima tamu warga", "ngobrol", "rumah"),
       ("15.00", "17.00", "pasar_hewan", "Jalan ke pasar hewan menyapa warga (lewat Jl. Tegalsari)", "jalan", "rumah", {"via": "Jl. Tegalsari"}),
       ("17.00", "21.00", "pesantren", "Magrib, mengaji kitab dengan santri senior", "mengajar", "rumah"),
       ("21.00", "04.00", "pesantren", "Tidur", "tidur", "rumah")])

npc("abah_karta", "Abah Karta", "rumah_wulan", "jalan", {
    "silat": "Baju pangsi hitam pudar, ikat kepala batik cokelat",
    "kebun": "Kaus lengan panjang, caping, sarung diikat",
    "rumah": "Sarung, kaus oblong, kecapi di pangkuan"},
    S=[("04.30", "06.00", "pendopo", "Melatih silat subuh", "silat", "silat"),
       ("06.00", "12.00", "kebun_teh", "Merawat kebun keluarga", "petik", "kebun"),
       ("12.00", "14.00", "rumah_wulan", "Makan, tidur siang", "tidur", "rumah"),
       ("14.00", "17.00", "pendopo", "Melatih murid silat cilik", "silat", "silat"),
       ("17.00", "19.00", "rumah_wulan", "Makan malam", "makan", "rumah"),
       ("19.00", "21.00", "rumah_wulan", "Main kecapi di teras", "gitar", "rumah"),
       ("21.00", "04.30", "rumah_wulan", "Tidur", "tidur", "rumah")])

npc("serma_hadi", "Serma Hadi Aditya", "rumah_dimas", "motor", {
    "dinas": "Seragam loreng, baret, jam tangan besar",
    "olahraga": "Kaus olahraga hijau, celana training",
    "rumah": "Kaus putih, sarung"},
    S=[("05.00", "06.00", "asrama_lapangan", "Memimpin lari subuh", "lari", "olahraga"),
       ("06.00", "07.00", "rumah_dimas", "Sarapan, menanyai nilai Dimas", "makan", "dinas"),
       ("07.00", "16.00", "asrama_lapangan", "Dinas: apel, latihan, administrasi", "berdiri", "dinas"),
       ("16.00", "18.00", "asrama_gerbang", "Mengecek pos jaga", "berdiri", "dinas"),
       ("18.00", "22.00", "rumah_dimas", "Di rumah, berita TV", "duduk", "rumah"),
       ("22.00", "05.00", "rumah_dimas", "Tidur", "tidur", "rumah")])

npc("sudarmaji", "Pak Sudarmaji", "rumah_bendungan", "motor", {
    "kerja": "Kemeja dinas PU kusam, helm proyek kuning, sepatu bot karet, buku catatan",
    "rumah": "Kaus partai, sarung"},
    S=[("06.00", "07.00", "rumah_bendungan", "Sarapan", "makan", "rumah"),
       ("07.00", "12.00", "bendungan", "Mencatat debit air, memeriksa pintu air", "duduk_tulis", "kerja"),
       ("12.00", "13.00", "dermaga_waduk", "Makan siang di warung ikan bakar", "makan", "kerja", {"via": "jalan keliling waduk"}),
       ("13.00", "16.00", "bendungan", "Jaga pintu air", "berdiri", "kerja"),
       ("16.00", "22.00", "rumah_bendungan", "Di rumah, anak tiga", "duduk", "rumah"),
       ("22.00", "23.00", "bendungan", "Cek malam saat musim hujan (bulan Hujan & Hujan Akhir)", "berdiri", "kerja"),
       ("23.00", "06.00", "rumah_bendungan", "Tidur", "tidur", "rumah")])

npc("wak_kodir", "Wak Kodir", "kampung_nelayan", "perahu", {
    "melaut": "Kaus partai lama, celana pendek, caping, sepatu bot",
    "rumah": "Sarung, kaus singlet"},
    S=[("03.00", "08.00", "laut", "Melaut (pemain bisa ikut, berangkat 03.00 dari TPI)", "jala", "melaut", {"m": "perahu"}),
       ("08.00", "10.00", "tpi", "Lelang ikan di TPI", "jualan", "melaut"),
       ("10.00", "15.00", "kampung_nelayan", "Tidur siang", "tidur", "rumah"),
       ("15.00", "18.00", "tpi", "Memperbaiki jaring di dermaga", "jongkok", "rumah"),
       ("18.00", "21.00", "kampung_nelayan", "Main kartu dengan nelayan lain", "duduk", "rumah"),
       ("21.00", "03.00", "kampung_nelayan", "Tidur", "tidur", "rumah")],
    M=[("06.00", "12.00", "tpi", "Tidak melaut (Jumat & badai juga); memperbaiki perahu", "jongkok", "rumah"),
       ("12.00", "21.00", "kampung_nelayan", "Di rumah", "duduk", "rumah"),
       ("21.00", "06.00", "kampung_nelayan", "Tidur", "tidur", "rumah")])

npc("romlah", "Bu Romlah", "warung_romlah", "jalan", {
    "kerja": "Celemek bunga-bunga, rambut dicepol diikat kain, gelang emas banyak"},
    S=[("05.00", "07.00", "tpi", "Belanja ikan di TPI", "jalan", "kerja", {"m": "motor", "via": "Jl. Pesisir Selatan"}),
       ("07.00", "10.00", "warung_romlah", "Menyiapkan warung", "masak", "kerja"),
       ("10.00", "21.00", "warung_romlah", "Buka warung seafood (ramai 12.00-14.00 & 17.00-20.00)", "masak", "kerja"),
       ("21.00", "05.00", "warung_romlah", "Tidur di rumah belakang warung", "tidur", "kerja")])

npc("kang_ujo", "Kang Ujo", "basecamp", "motor", {
    "kerja": "Jaket gunung oranye pudar, kargo, sandal gunung",
    "naik": "Carrier besar, jaket, headlamp"},
    S=[("05.00", "15.00", "basecamp", "Pendaftaran pendakian (tutup naik 15.00)", "duduk_tulis", "kerja"),
       ("15.00", "18.00", "basecamp", "Menyapu sampah, menghitung pendaki turun", "sapu", "kerja"),
       ("18.00", "22.00", "basecamp", "Api unggun dengan porter", "duduk", "kerja"),
       ("22.00", "05.00", "basecamp", "Tidur di basecamp", "tidur", "kerja")],
    B=[("05.00", "12.00", "kawah", "Memandu rombongan ke puncak (Sabtu)", "jalan", "naik", {"m": "jalan", "via": "setapak pendakian"}),
       ("12.00", "22.00", "basecamp", "Basecamp ramai", "duduk_tulis", "kerja"),
       ("22.00", "05.00", "basecamp", "Tidur", "tidur", "kerja")])

npc("mandor_sabar", "Mandor Sabar", "pabrik_teh", "motor", {
    "kerja": "Topi koboi anyaman, kemeja lengan panjang lusuh, sepatu bot, peluit di leher"},
    S=[("05.30", "11.00", "kebun_teh", "Mengawasi pemetik teh, menimbang pucuk", "berdiri", "kerja"),
       ("11.00", "16.00", "pabrik_teh", "Pabrik teh: pelayuan, menggiling", "kerja_mesin", "kerja"),
       ("16.00", "21.00", "halte_sukamekar", "Warung kopi dekat halte", "duduk", "kerja"),
       ("21.00", "05.30", "pabrik_teh", "Tidur di rumah mandor", "tidur", "kerja")])

npc("pak_yusuf", "Pak Yusuf Tanjung", "mes_sirkuit", "motor", {
    "kerja": "Kemeja race control oranye, radio di dada",
    "rumah": "Kaus polo pudar"},
    S=[("07.00", "12.00", "race_control", "Jadwal, perawatan trek", "duduk_tulis", "kerja"),
       ("12.00", "17.00", "sirkuit_pit", "Mengecek pit & paddock", "berdiri", "kerja"),
       ("17.00", "21.00", "mes_sirkuit", "Menonton balap di TV", "duduk", "rumah"),
       ("21.00", "07.00", "mes_sirkuit", "Tidur", "tidur", "rumah")],
    B=[("06.30", "11.30", "race_control", "Track day 07.00-11.00", "berdiri", "kerja"),
       ("11.30", "21.00", "mes_sirkuit", "Istirahat", "duduk", "rumah"),
       ("21.00", "06.30", "mes_sirkuit", "Tidur", "tidur", "rumah")],
    M=[("06.00", "14.00", "race_control", "Seri liga (Bab 9+, tiap 2 minggu)", "berdiri", "kerja"),
       ("14.00", "06.00", "mes_sirkuit", "Istirahat, tidur", "duduk", "rumah")])

npc("mbak_sri", "Mbak Sri Wahyuni", "kos_buruh", "motor", {
    "kerja": "Seragam pabrik biru, kerudung abu, masker kain, kartu ID",
    "rumah": "Kaus panjang, rok batik"},
    S=[("06.00", "06.45", "kos_buruh", "Bersiap", "berdiri", "kerja"),
       ("06.45", "07.00", "industri_gerbang", "Absen di gerbang", "jalan", "kerja"),
       ("07.00", "15.00", "pabrik", "Shift pagi (minggu ganjil); minggu genap shift 15.00-23.00", "kerja_mesin", "kerja"),
       ("15.00", "16.00", "warung_pabrik", "Ngopi dengan buruh, rapat kecil", "ngobrol", "kerja"),
       ("16.00", "22.00", "kos_buruh", "Di kos, menelepon anak di kampung", "hp", "rumah"),
       ("22.00", "06.00", "kos_buruh", "Tidur", "tidur", "rumah")])

npc("mbah_darmo", "Mbah Darmo", "mercusuar", "jalan", {
    "rumah": "Sarung, jaket tentara usang, kacamata tebal, lampu minyak"},
    S=[("05.00", "08.00", "mercusuar", "Menyapu tangga mercusuar", "sapu", "rumah"),
       ("08.00", "16.00", "mercusuar", "Duduk di bangku menghadap laut, bercerita ke siapa pun", "duduk", "rumah"),
       ("16.00", "18.00", "pantai_lintang", "Jalan sore pelan di pantai", "jalan", "rumah"),
       ("18.00", "21.00", "mercusuar", "Menyalakan lampu minyak (lampu besar mati sampai misi selesai)", "berdiri", "rumah"),
       ("21.00", "05.00", "mercusuar", "Tidur", "tidur", "rumah")])

npc("nek_sumi", "Nek Sumi", "rumah_sumi", "jalan", {
    "rumah": "Kebaya lurik, kain jarik, selendang gendong botol jamu, sanggul"},
    S=[("04.00", "06.00", "rumah_sumi", "Meracik jamu", "masak", "rumah"),
       ("06.00", "11.00", "sawah_pd", "Keliling jamu gendong: Pandansari lalu Jl. Lingkar", "jalan", "rumah", {"via": "Jl. Lingkar Selatan"}),
       ("11.00", "15.00", "rumah_sumi", "Istirahat, menumbuk kunyit", "duduk", "rumah"),
       ("15.00", "17.00", "sawah_pd", "Duduk di pematang", "duduk", "rumah"),
       ("17.00", "04.00", "rumah_sumi", "Di rumah, tidur", "tidur", "rumah")])

npc("tito", "Tito", "rumah_dimas", "jalan", {
    "rumah": "Kaus bola kebesaran, celana pendek, lutut luka",
    "sekolah": "Seragam SD"},
    S=[("06.30", "12.00", "asrama_gerbang", "SD asrama", "duduk_tulis", "sekolah"),
       ("12.00", "17.30", "asrama_lapangan", "Main bola, menunggu Dimas pulang", "futsal", "rumah"),
       ("17.30", "06.30", "rumah_dimas", "Pulang (rumah tetangga Dimas)", "tidur", "rumah")])

npc("neng_ayu", "Neng Ayu", "rumah_wulan", "jalan", {
    "sekolah": "Seragam SMP",
    "rumah": "Jaket balap kebesaran, rambut pendek"},
    S=[("06.30", "13.00", "smk", "SMP desa (sebelah SMK)", "duduk_tulis", "sekolah"),
       ("13.00", "17.00", "halte_sukamekar", "Menonton motor lewat di Jl. Raya Puncak", "duduk", "rumah"),
       ("17.00", "06.30", "rumah_wulan", "Di rumah", "tidur", "rumah")])
