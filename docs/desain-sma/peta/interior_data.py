"""Data interior detail bangunan yang bisa dimasuki (guide 92).

Koordinat petak dari pojok kiri atas denah. Pintu masuk utama hampir selalu di sisi BAWAH denah (= sisi jalan).
R = ruang, F = perabot/objek (x, y, lebar, dalam, jenis warna, label, fungsi), D = pintu, M = titik interaksi bernomor.
"""

def R(x, y, w, h, kind, label=""): return ("R", x, y, w, h, kind, label)
def F(x, y, w, h, kind, label="", fungsi=""): return ("F", x, y, w, h, kind, label, fungsi)
def D(x, y, n=1.5, v=False, t=""): return ("D", x, y, n, v, t)
def M(x, y, n, desc): return ("M", x, y, n, desc)
def ST(x, y, w, h, t="Tangga", v=True): return ("S", x, y, w, h, t, v)

I = []
def interior(id, nama, w, h, isi, plus, minus, suasana):
    I.append(dict(id=id, nama=nama, w=w, h=h, isi=isi, plus=plus, minus=minus, suasana=suasana))


interior("indomurah", "Indomurah (minimarket parodi)", 14, 11, [
    R(0, 0, 14, 11, "toko", ""), R(10, 0, 4, 3.5, "gudang", "Gudang"),
    F(1, 2, 0.8, 7, "rak", "rak minuman", "Kulkas kaca: minuman dingin"),
    F(3, 3, 1, 5, "rak", "rak", "Mi instan, snack"), F(5.2, 3, 1, 5, "rak", "rak", "Sabun, sampo, alat tulis"), F(7.4, 3, 1, 5, "rak", "rak", "Roti, susu, kopi sachet"),
    F(1, 0.3, 8.5, 1, "putih", "kulkas es krim & frozen", "Es krim (cooldown panas)"),
    F(10, 6.5, 3.5, 1.2, "meja", "kasir", "Bayar; kasir NPC Mbak Rina"), F(12.6, 5, 0.9, 1.4, "kuning", "rokok", "Rak rokok di belakang kasir (dijual 18+)"),
    F(9.5, 9.6, 1.4, 1, "logam", "ATM", "Tarik/setor tabungan"), F(11.2, 9.6, 1, 1, "air", "galon", "Isi ulang galon"),
    F(0.5, 9.8, 2.4, 0.8, "merah", "keranjang", "Ambil keranjang"),
    D(4, 11, 3, t="pintu kaca otomatis"), D(10, 3.5, 1.2),
    M(10.4, 8.2, "1", "Kasir: belanja, isi pulsa, bayar listrik"), M(1.5, 5.5, "2", "Ambil minuman dingin"), M(10.2, 10.6, "3", "ATM")],
    ["Buka 24 jam, AC (pulih panas)", "Harga tetap, ada ATM"], ["10% lebih mahal dari warung", "Tidak bisa ngutang"],
    "Lampu neon putih terang, jingle pintu 'selamat datang', AC dingin")

interior("warung_kelontong", "Warung kelontong (tipe K5, mis. Warung Bu Sum)", 8, 7, [
    R(0, 0, 8, 4.5, "warung", "Warung"), R(0, 4.5, 8, 2.5, "luar", "Teras"),
    F(0.5, 3.6, 7, 0.8, "meja", "etalase kaca", "Gorengan, rokok ketengan, permen"), F(0.3, 0.3, 7.4, 0.8, "rak", "rak sembako", "Beras, minyak, gula"),
    F(6.4, 1.4, 1.2, 1.4, "putih", "freezer", "Es batu, es mambo"), F(0.4, 1.4, 1.6, 1.2, "kasur", "tikar", "Tempat bu warung duduk"),
    F(1, 5.2, 3, 0.7, "meja", "bangku panjang", "Duduk ngopi, gosip"), F(5, 5, 1.6, 1.6, "merah", "termos es", "Es teh"),
    F(0.2, 4.6, 7.6, 0.2, "kuning", "renceng sachet", "Renceng kopi & sampo digantung"),
    D(3, 7, 2.5),
    M(4, 3.2, "1", "Beli/utang (bisa ngutang sampai Rp 20.000)"), M(2.5, 5.6, "2", "Duduk: dengar gosip kampung")],
    ["Paling murah, bisa ngutang", "Gosip: info misi"], ["Barang terbatas", "Tutup 21.00"], "Radio dangdut, kucing tidur di karung beras")

interior("warnet", "Warnet Nebula Net", 12, 8, [
    R(0, 0, 12, 8, "toko", ""),
    *[F(0.4 + k * 1.9, 0.4, 1.6, 1.4, "hitam", f"PC{k + 1}", "Bilik PC") for k in range(6)],
    *[F(0.4 + k * 1.9, 3.2, 1.6, 1.4, "hitam", f"PC{k + 7}", "Bilik PC") for k in range(4)],
    F(8.2, 3.2, 3.4, 1.4, "kain", "VIP", "Bilik VIP sofa (game balap Tegar)"),
    F(8.5, 6.2, 3, 1.2, "meja", "operator", "Bayar per jam, beli mi"), F(0.4, 6.8, 2, 0.8, "putih", "printer", "Print tugas"),
    F(4, 6.8, 2, 0.8, "rak", "rak snack", ""),
    D(3, 8, 2),
    M(9.8, 5.6, "1", "Operator: sewa PC Rp 4.000/jam"), M(9.8, 2.6, "2", "VIP: event Tegar"), M(1.4, 6.2, "3", "Print tugas (nilai +)")],
    ["Mini game online, print tugas", "Buka sampai 02.00"], ["Pengap, asap rokok", "Razia jam sekolah"], "Lampu neon ungu, suara klik mouse, teriakan 'woy!'")

interior("kafe", "Kafe Senja (saingan warkop)", 12, 10, [
    R(0, 0, 12, 10, "warung", ""), R(8, 0, 4, 3, "gudang", "Dapur"),
    F(5, 2.5, 3, 1, "meja", "bar kopi", "Barista Kak Dion"), F(5.2, 0.3, 2.6, 0.8, "logam", "mesin espresso", ""),
    *[F(0.6 + (k % 2) * 3.2, 4 + (k // 2) * 2.4, 1.4, 1.4, "meja", "", "Meja 2 orang") for k in range(4)],
    F(7.6, 5, 4, 1.4, "sofa", "sofa panjang", "Duduk rame-rame"), F(0.3, 0.3, 4, 1, "hijau", "tanaman & rak buku", ""),
    F(8, 8.6, 3.6, 1, "kuning", "panggung akustik", "Live akustik Jumat (Sekar)"),
    D(4, 10, 2.5), D(8, 1.5, 1.2, True),
    M(6.5, 4, "1", "Pesan kopi Rp 25.000"), M(2, 6, "2", "Meja kencan"), M(9.8, 8.2, "3", "Panggung: Sekar main Jumat")],
    ["Kencan rapi, wifi, AC"], ["Mahal 3x warkop", "Pemain berbaju lusuh dilirik (karisma -)"], "Lampu gantung kuning hangat, musik lo-fi")

interior("karaoke", "Karaoke Suara Emas", 14, 10, [
    R(0, 0, 14, 10, "koridor", ""),
    *[R(0.3 + k * 3.4, 0.3, 3.2, 4.6, "seni", f"Bilik {k + 1}") for k in range(4)],
    *[F(0.6 + k * 3.4, 2.6, 2.6, 0.8, "sofa", "sofa", "") for k in range(4)], *[F(1 + k * 3.4, 0.8, 1.6, 0.5, "hitam", "TV", "") for k in range(4)],
    F(9, 7, 4.5, 1.2, "meja", "resepsionis", "Sewa bilik per jam"), F(0.5, 7.5, 3, 2, "sofa", "ruang tunggu", ""),
    D(5, 10, 2),
    M(1.8, 1.8, "1", "Mini game ritme (nyanyi)"), M(11, 6.4, "2", "Sewa bilik Rp 40.000/jam")],
    ["Kencan rame-rame, karisma +"], ["Mahal, malam ramai preman"], "Lampu disko di koridor, suara fals dari bilik sebelah")

interior("pasar", "Pasar Wirabumi (los dalam)", 30, 18, [
    R(0, 0, 30, 18, "warung", ""), R(0, 0, 30, 4, "luar", "Los ikan & daging (lantai basah)"),
    *[F(0.6 + k * 3.6, 0.6, 3, 2.4, "air" if k < 4 else "merah", "ikan" if k < 4 else "daging", "") for k in range(8)],
    *[F(0.6 + k * 3.6, 5.5, 3, 2, "hijau", "sayur", "") for k in range(8)],
    *[F(0.6 + k * 3.6, 9.5, 3, 2, "kuning" if k % 2 else "putih", "bumbu" if k % 2 else "beras", "") for k in range(8)],
    *[F(0.6 + k * 3.6, 13.5, 3, 2, "kain", "kain", "") for k in range(4)],
    F(15, 13.5, 3, 2, "meja", "lapak Laras", "Nasi uduk pagi (event Laras)"), F(18.6, 13.5, 3, 2, "kain", "jahit Teh Lilis", "Permak baju"),
    F(22.2, 13.5, 3, 2, "logam", "timbangan umum", ""), F(26, 13.5, 3.6, 4, "rak", "gudang kardus", ""),
    D(13, 18, 4, t="pintu utama (ke terminal)"), D(0, 7, 2, True), D(30, 7, 2, True),
    M(16.5, 12.8, "1", "Lapak Laras"), M(4, 4.6, "2", "Belanja bahan warkop (murah)"), M(20, 12.8, "3", "Permak baju (penampilan +)")],
    ["Bahan paling murah", "Banyak NPC & gosip"], ["Becek, copet pagi", "Tutup sore"], "Teriakan pedagang, lalat, ember air, terpal oranye")

interior("plaza", "Plaza Wirabumi (3 lantai, berdampingan)", 66, 20, [
    R(0, 0, 21, 20, "toko", "LT 1"), R(22.5, 0, 21, 20, "kantin", "LT 2"), R(45, 0, 21, 20, "kelas", "LT 3"),
    F(1, 2, 5, 4, "kain", "butik", "Baju (outfit)"), F(7, 2, 5, 4, "kain", "sepatu", ""), F(13, 2, 7, 4, "putih", "toko HP", "Upgrade HP"),
    F(1, 10, 6, 4, "kuning", "toko emas", ""), F(14, 10, 6, 4, "rak", "toko buku besar", ""), F(8.5, 8, 4, 4, "air", "air mancur", "Titik ketemu"),
    ST(9, 16, 3, 3.5, "eskalator"),
    *[F(23 + k * 4, 1, 3.4, 2.4, "kuning" if k % 2 else "merah", "kios", "Food court") for k in range(5)],
    *[F(24 + (k % 4) * 4.2, 6 + (k // 4) * 3, 2, 1.6, "meja", "", "") for k in range(8)],
    F(23, 13, 9, 6, "hitam", "arkade", "Mini game arkade, dance machine"), F(33.5, 13, 9, 6, "kain", "photobox & capit boneka", "Kencan"),
    F(46, 1, 19, 7, "hitam", "Studio 1 & 2", "Nonton film (kencan)"), F(46, 10, 8, 3, "meja", "loket tiket", ""), F(55, 10, 9, 3, "kuning", "popcorn", ""),
    F(46, 15, 8, 4, "sofa", "lobi tunggu", ""), ST(56, 15, 3, 4, "eskalator"),
    D(8, 20, 5, t="pintu kaca putar"),
    M(10.5, 10, "1", "Air mancur: titik janjian"), M(16, 6.6, "2", "Upgrade HP"), M(27.5, 16, "3", "Arkade"), M(55, 4.5, "4", "Bioskop")],
    ["AC, kencan terlengkap, belanja outfit"], ["Mahal 30%", "Seragam jam sekolah diusir satpam"], "Musik mal, lantai mengkilap, wangi popcorn di LT 3")

interior("masjid_agung", "Masjid Agung Al-Ikhlas", 22, 18, [
    R(0, 0, 22, 12, "ibadah", "Ruang salat"), R(0, 12, 22, 6, "luar", "Serambi"),
    F(9.5, 0.2, 3, 1.4, "kuning", "mihrab", ""), F(13, 0.4, 1.4, 1.4, "meja", "mimbar", "Khotbah Jumat"),
    *[F(1, 2.5 + r * 1.8, 20, 0.15, "hijau", "", "") for r in range(5)],
    F(0.3, 12.4, 3, 1.2, "merah", "beduk", "Pukul beduk (Ramadan)"), F(19, 12.4, 2.6, 4.5, "air", "wudu", ""), F(5, 16.6, 12, 1, "rak", "rak sandal", ""),
    F(0.3, 3, 1.2, 4, "rak", "Al-Qur'an", "Ngaji (karma +)"), ST(21, 5, 1, 3, "ke atap"),
    D(9, 12, 4), D(9, 18, 4),
    M(11, 6, "1", "Salat: karma +, stres -"), M(21.5, 6.5, "2", "Tangga atap (event Nadia 8 hati, butuh izin marbot)"), M(1.8, 13, "3", "Beduk")],
    ["Tenang: stres turun", "Event Ramadan, buka puasa gratis"], ["Jangan lari/berisik"], "Karpet hijau bergaris, kipas angin besar, cahaya dari jendela tinggi")

interior("bank", "Bank Wira", 10, 8, [
    R(0, 0, 10, 8, "kantor", ""), F(0.5, 0.5, 9, 1.2, "meja", "teller (3)", "Setor/tarik"), F(0.5, 3.5, 3, 1.2, "meja", "CS", "Buka tabungan pelajar"),
    *[F(4.5 + k * 1.6, 4, 1.2, 1, "logam", "kursi", "Antre") for k in range(3)], F(8.6, 5.5, 1, 1.6, "putih", "mesin antre", "Ambil nomor"),
    F(0.5, 6.5, 1.6, 1, "logam", "ATM", ""), D(4, 8, 2),
    M(5, 2.4, "1", "Teller: tabungan (bunga 1%/bulan game)"), M(9.1, 5.2, "2", "Nomor antre (tunggu 30 dtk)")],
    ["Uang aman dari copet & razia", "Bunga tabungan"], ["Antre, tutup 15.00"], "Dingin AC, satpam membukakan pintu")

interior("puskesmas", "Puskesmas Wirabumi", 14, 10, [
    R(0, 0, 14, 10, "koridor", ""), R(0, 0, 5, 5, "kantor", "Periksa"), R(5, 0, 4, 5, "toilet", "Tindakan"), R(9, 0, 5, 5, "rumah", "Rawat (2 kasur)"),
    F(0.5, 0.5, 2, 1, "meja", "dokter", ""), F(5.5, 0.5, 3, 1.4, "putih", "ranjang", "Jahit luka"), F(9.5, 0.5, 2, 3, "kasur", "", ""), F(12, 0.5, 1.6, 3, "kasur", "", ""),
    F(0.5, 6.5, 3, 1.2, "meja", "pendaftaran", ""), F(4.5, 6.5, 5, 1, "logam", "bangku tunggu biru", ""), F(10.5, 6, 3, 1.6, "rak", "apotek", "Beli obat"),
    D(1.5, 5, 1.2), D(6, 5, 1.2), D(10, 5, 1.2), D(6, 10, 2),
    M(2, 7.6, "1", "Daftar (Rp 10.000)"), M(10.5, 2, "2", "Bangun di sini setelah pingsan"), M(12, 7.8, "3", "Obat: pulihkan luka")],
    ["Murah, pulihkan luka"], ["Antre lama"], "Bau obat, TV di ruang tunggu")

interior("polsek", "Polsek Wirabumi", 14, 10, [
    R(0, 0, 14, 10, "kantor", ""), R(9, 0, 5, 5, "rahasia", "Sel"), R(0, 0, 4, 4, "kantor", "Kanit"),
    F(4.5, 1, 4, 1.2, "meja", "meja piket", "Lapor, ambil motor"), F(0.5, 0.5, 2, 1, "meja", "", ""), F(9.5, 0.5, 4, 0.6, "logam", "jeruji", ""),
    F(0.5, 6, 4, 1, "logam", "bangku", ""), F(6, 6, 3, 3, "rak", "lemari arsip", "Arsip (misi Arga)"), F(10, 7, 3.6, 2.6, "hitam", "motor sitaan", ""),
    D(5, 10, 2), D(10.5, 5, 1.2),
    M(6.5, 2.6, "1", "Tebus motor sitaan (Rp 100.000)"), M(11.5, 2.5, "2", "Sel: event Arga dijebak"), M(7.5, 7.5, "3", "Arsip: bukti (Bab 11)")],
    ["Ambil motor, lapor kejahatan"], ["Datang dengan reputasi buruk = ditanyai"], "Kipas angin, mesin ketik tua, radio HT")

interior("studio_foto", "Studio Foto Kilat + kamar Jojo", 12, 10, [
    R(0, 0, 12, 6, "seni", "Studio"), R(0, 6, 12, 4, "toko", "Toko & cetak"),
    F(0.5, 0.3, 6, 0.5, "kain", "latar kain (biru/merah)", "Foto ijazah, foto pacaran"), F(3, 2.5, 1, 1, "logam", "kamera", ""),
    F(7.5, 0.5, 4, 2, "hitam", "lampu & payung", ""), F(0.5, 6.5, 4, 1, "meja", "kasir", ""), F(6, 6.5, 3, 1, "logam", "printer foto", ""),
    ST(10.5, 6.2, 1.4, 3.4, "ke kamar Jojo", True), D(4, 10, 2),
    M(3.5, 3.6, "1", "Foto bersama (kenang-kenangan, hati +)"), M(11.2, 8, "2", "Naik ke kamar Jojo & atap")],
    ["Foto kenangan event", "Akses atap"], ["Bayar Rp 30.000"], "Kilat lampu, album contoh di etalase")

interior("rumah_laras", "Rumah Laras (bantaran)", 8, 8, [
    R(0, 0, 8, 5, "rumah", "Ruang & dapur"), R(0, 5, 4, 3, "rumah", "Kamar ibu"), R(4, 5, 4, 3, "rumah", "Kamar Laras"),
    F(0.3, 0.3, 3, 1, "logam", "kompor & dandang", "Masak nasi uduk subuh"), F(3.5, 0.3, 2, 1, "rak", "rak piring", ""), F(5.8, 0.3, 2, 1.6, "kuning", "bakul uduk", ""),
    F(2, 2.4, 3, 1.4, "meja", "meja lipat", "Buku kas"), F(0.3, 5.3, 2, 2.4, "kasur", "kasur ibu", ""), F(4.3, 5.3, 1.6, 2.4, "kasur", "", ""), F(6.3, 5.3, 1.4, 1.2, "meja", "meja belajar", ""),
    D(3, 0, 1.5, t="pintu ke gang"), D(1.5, 5, 1), D(5, 5, 1),
    M(1.8, 1.8, "1", "Bantu masak subuh (event Laras)"), M(3.5, 3.2, "2", "Buku kas: lihat utang keluarga")],
    ["Kehangatan keluarga, event"], ["Sempit, bocor saat hujan"], "Kipas kecil, panci penyok, foto ayah di dinding")

interior("rumah_gilang", "Rumah panggung Gilang", 8, 6, [
    R(0, 0, 8, 4, "rumah", "Ruang"), R(0, 4, 8, 2, "balkon", "Teras di atas kali"),
    F(0.3, 0.3, 2, 1.6, "kasur", "kasur", ""), F(2.6, 0.3, 1.6, 1, "air", "galon tabungan", "Tabungan (event)"), F(5, 0.3, 2.6, 1, "rak", "rak papan skate", ""),
    F(5, 2.2, 1, 1, "kuning", "gitar kentrung", "Main musik"), F(0.4, 4.3, 7, 0.3, "kain", "jemuran", ""),
    D(3.5, 0, 1.2, t="tangga dari gang"),
    M(3.4, 1.8, "1", "Galon tabungan"), M(5.5, 3.2, "2", "Gitar: nyanyi bareng"), M(4, 5.3, "3", "Banjir event 6 hati")],
    ["Santai, pemandangan kali"], ["Banjir"], "Lantai papan berderit, angin kali")

interior("rumah_uti", "Rumah Uti + garasi", 22, 10, [
    R(0, 0, 14, 10, "rumah", "Rumah"), R(14, 2, 8, 8, "bengkel", "Garasi"),
    F(0.5, 0.5, 4, 3, "kasur", "kamar Uti", ""), F(5, 0.5, 4, 3, "kasur", "kamar ortu", ""), F(9.5, 0.5, 4, 2, "logam", "dapur", ""),
    F(1, 5, 4, 2, "sofa", "ruang TV", ""), F(6, 5.5, 3, 1.5, "meja", "", ""), F(10, 5, 3, 3, "hijau", "poster futsal", ""),
    F(15, 3, 4, 2, "merah", "motor Mas Danu", "Rakit motor (event)"), F(19.6, 2.4, 2, 5, "rak", "rak kunci", ""), F(15, 7.5, 5, 2, "meja", "meja kerja", ""),
    F(20, 8, 1.6, 1.6, "kuning", "kandang ayam Rossi", ""),
    D(5, 10, 2), D(14, 6, 2, True), D(16, 10, 4, t="rolling garasi"),
    M(17, 4, "1", "Rakit motor bareng (Mekanik +)")],
    ["Belajar mesin dari Uti"], ["Berisik, oli"], "Radio MotoGP, bau oli")

interior("rumah_bimo", "Rumah Bimo", 12, 10, [
    R(0, 0, 12, 6, "rumah", "Dapur besar"), R(0, 6, 6, 4, "rumah", "Kamar Bimo"), R(6, 6, 6, 4, "rumah", "Ruang tamu"),
    F(0.3, 0.3, 5, 1, "logam", "kompor & panci kuah", ""), F(6, 0.3, 3, 2, "merah", "gerobak bakso", ""), F(9.5, 0.3, 2.2, 3, "putih", "kulkas & bakso beku", ""),
    F(2, 3, 4, 1.4, "meja", "meja adonan", "Mini game bikin bakso"), F(0.3, 6.3, 2, 3, "kasur", "", ""), F(3, 6.3, 2.6, 0.5, "kain", "poster masak", ""),
    F(7, 7, 4, 1.6, "sofa", "", ""), D(8, 10, 2), D(2, 6, 1),
    M(4, 4.6, "1", "Bikin bakso bareng (masak +)")],
    ["Makan gratis"], ["Bau kaldu menempel"], "Uap kuah, suara blender")

interior("kos_narti", "Kos Bu Narti", 18, 10, [
    R(0, 0, 18, 10, "koridor", ""), *[R(0.2 + k * 3, 0.2, 2.8, 4, "rumah", f"K{k + 1}") for k in range(6)],
    *[F(0.4 + k * 3, 0.5, 1.2, 2.4, "kasur", "", "") for k in range(6)],
    F(0.4, 5.5, 4, 1.2, "logam", "dapur bersama", ""), F(5, 5.5, 3, 1.2, "air", "kamar mandi", ""), F(9, 5.5, 4, 1.6, "sofa", "TV bersama", ""),
    F(14, 5.5, 3.6, 4, "kain", "jemuran", ""), F(1, 8.4, 6, 1.2, "meja", "teras gosip", "Bu Narti & anak kos"),
    D(8, 10, 2),
    M(4.5, 2, "1", "Kamar bocor (event)"), M(3, 9, "2", "Teras: gosip")],
    ["Murah (bisa jadi tempat tinggal alternatif)"], ["Bocor, antre kamar mandi"], "Dangdut dari kamar 3, sandal berjajar")

interior("rumah_sekar", "Rumah Sekar + loteng", 28, 12, [
    R(0, 0, 16, 12, "rumah", "Lantai 1"), R(18, 2, 10, 8, "seni", "Loteng (kamar Sekar)"),
    F(0.5, 0.5, 6, 2, "sofa", "ruang keluarga", ""), F(7, 0.5, 4, 3, "hitam", "piano tua", ""), F(11.5, 0.5, 4, 2, "logam", "dapur", ""),
    F(0.5, 5, 5, 3, "kasur", "kamar ortu", ""), F(6, 7, 4, 2, "meja", "meja makan", ""), ST(14, 8, 1.8, 3.6, "ke loteng"),
    F(18.5, 2.5, 3, 2, "kasur", "", ""), F(22, 2.5, 1.2, 2.5, "kuning", "gitar", "Tulis lagu"), F(24, 2.5, 3.6, 1.2, "air", "jendela atap", "Event 6 hati: lihat bintang"),
    F(18.5, 7, 4, 2.6, "rak", "rak buku lagu", ""), D(7, 12, 2),
    M(22.6, 5.5, "1", "Gitar: bikin lagu bareng"), M(25.8, 3, "2", "Jendela atap (6 hati)")],
    ["Event musik"], ["Ortu Sekar tegas: pulang 21.00"], "Rapi, wangi kayu, lampu kuning")

interior("rumah_nadia", "Rumah Nadia (2 lantai)", 30, 10, [
    R(0, 0, 14, 10, "rumah", "Lantai 1"), R(16, 0, 14, 10, "rumah", "Lantai 2"),
    F(0.5, 0.5, 4, 2, "kain", "mesin jahit ibu", "Bantu jahit (uang)"), F(5, 0.5, 4, 2, "logam", "dapur", ""), F(0.5, 4, 5, 2.6, "sofa", "ruang tamu", ""),
    F(9.6, 4, 4, 2, "meja", "meja makan", ""), ST(12, 7, 1.8, 2.8),
    F(16.5, 0.5, 5, 3, "kasur", "kamar Nadia", "Meja belajar penuh catatan OSIS"), F(22, 0.5, 4, 3, "kasur", "kamar adik kembar", ""),
    F(16.5, 5, 4, 1.4, "meja", "meja belajar", "Belajar bareng (nilai +)"), F(27, 5, 2.6, 4.6, "hijau", "tangga samping ke atap masjid", ""),
    D(6, 10, 2),
    M(2.5, 3, "1", "Mesin jahit"), M(18.5, 7, "2", "Belajar bareng"), M(28.3, 7, "3", "Akses atap masjid (8 hati)")],
    ["Belajar bareng: nilai naik"], ["Ibu Nadia ketat"], "Kain perca di mana-mana, suara mesin jahit")

interior("rumah_bram", "Rumah Bram (lantai 1 & 2)", 52, 16, [
    R(0, 0, 24, 16, "rumah", "Lantai 1"), R(26, 0, 24, 16, "rumah", "Lantai 2"),
    F(0.5, 0.5, 8, 5, "sofa", "ruang tamu mewah", ""), F(9, 0.5, 5, 4, "hitam", "ruang piano", "Event Bram"), F(15, 0.5, 8.5, 4, "logam", "dapur & bar", ""),
    F(0.5, 7, 8, 5, "logam", "gym rumah", "Latihan (lebih mahal efek)"), F(9, 7, 7, 4, "meja", "ruang makan 10 kursi", ""), ST(17, 10, 2.4, 5.4),
    F(20, 7, 3.6, 8, "air", "pintu kaca ke kolam", ""),
    F(26.5, 0.5, 8, 6, "kasur", "kamar Bram", "Trofi, poster balap"), F(35, 0.5, 6, 6, "meja", "ruang kerja Pak Haris", "Laci dokumen (Bab 12)"),
    F(41.5, 0.5, 8, 6, "kasur", "kamar utama", ""), F(26.5, 9, 10, 6, "kain", "home theater", ""), F(43, 9, 6.5, 6, "rak", "lemari brankas", "Kode dari Sasha"),
    D(10, 16, 3),
    M(11, 2.5, "1", "Piano"), M(37, 4.5, "2", "Laci dokumen Pak Haris"), M(45, 12, "3", "Brankas")],
    ["Event Bram, misi dokumen"], ["CCTV: ketahuan = gagal misi"], "Marmer dingin, lampu kristal, sepi")

interior("bengkel_wijaya", "Bengkel Wijaya Motor + rumah Kirana", 28, 10, [
    R(0, 0, 18, 10, "bengkel", "Bengkel"), R(18, 0, 10, 10, "rumah", "Rumah Kirana"),
    *[F(0.6 + k * 4.2, 1, 3, 2.2, "merah" if k % 2 else "hitam", f"motor {k + 1}", "Servis") for k in range(4)],
    F(0.6, 5, 5, 1.2, "rak", "rak part racing", "Beli part (balap)"), F(7, 5, 3, 2, "logam", "dyno kecil", ""), F(12, 5, 5.4, 1.2, "meja", "meja ayah Kirana", "Daftar tim balap"),
    F(18.5, 0.5, 4, 3, "kasur", "kamar Kirana", ""), F(23, 0.5, 4.6, 0.6, "kain", "dinding puisi setelan mesin", ""), F(23, 2, 1.4, 1, "air", "akuarium cupang", ""),
    F(18.5, 6, 5, 2, "sofa", "ruang keluarga", ""), D(6, 10, 6, t="rolling"), D(18, 6, 1.5, True),
    M(14, 6.8, "1", "Gabung tim (Bab 9)"), M(3, 6.8, "2", "Part racing"), M(23.7, 3.4, "3", "Akuarium (kado cupang)")],
    ["Part racing, tim resmi"], ["Kobar sering ada: tegang"], "Bau bensin, poster pembalap, radio")

interior("warung_mak_iyah", "Warung Mak Iyah (belakang sekolah)", 8, 6, [
    R(0, 0, 8, 6, "warung", ""), F(0.3, 0.3, 5, 1, "meja", "etalase gorengan", ""), F(5.6, 0.3, 2, 1.4, "logam", "kompor", ""),
    F(0.5, 2.5, 4, 1, "meja", "bangku", ""), F(5, 3, 2.6, 2.6, "rak", "dapur belakang (sembunyi)", "Sembunyi saat razia guru"),
    D(2.5, 6, 2), D(8, 2, 1.2, True, "pintu ke pagar sekolah"),
    M(2.5, 2, "1", "Utang dulu (max Rp 15.000)"), M(6.3, 4.3, "2", "Sembunyi bolos")],
    ["Persembunyian bolos, utang"], ["Ketahuan guru = BK"], "Asap gorengan, TV tabung")

interior("stasiun", "Stasiun (Wirabumi / Lintang)", 20, 8, [
    R(0, 0, 20, 5, "koridor", "Hall"), R(0, 5, 20, 3, "luar", "Peron"),
    F(0.5, 0.5, 4, 1.4, "meja", "loket", "Beli tiket"), F(5, 0.5, 2, 1, "rak", "jadwal", ""), F(8, 2, 8, 1, "logam", "bangku tunggu", ""),
    F(16.5, 0.5, 3, 2, "kuning", "kios roti", ""), F(0.5, 5.5, 19, 0.3, "kuning", "garis kuning", ""),
    D(9, 0, 2, t="pintu dari jalan"), M(2.5, 2.2, "1", "Tiket kereta (Rp 5.000)"), M(10, 6.6, "2", "Naik kereta (fast travel)")],
    ["Fast travel murah"], ["Jadwal tiap 2 jam"], "Pengumuman stasiun, kipas besar")

interior("basecamp", "Basecamp pendakian Sangkala", 10, 6, [
    R(0, 0, 10, 6, "rumah", ""), F(0.5, 0.5, 3, 1.2, "meja", "registrasi", ""), F(4, 0.5, 4, 0.5, "hijau", "peta jalur", ""),
    F(0.5, 3, 4, 2.4, "rak", "sewa alat", "Tenda, sleeping bag, senter"), F(5.5, 3, 4, 2.4, "kasur", "tempat istirahat", ""),
    D(4, 6, 2), M(2, 2, "1", "Daftar naik"), M(2.5, 4, "2", "Sewa alat")],
    ["Persiapan naik"], ["Tutup 15.00"], "Dingin, teh panas di termos")

interior("warung_seafood", "Warung Seafood Bu Tinah (Pantai Lintang)", 12, 8, [
    R(0, 0, 12, 4, "warung", "Dapur & etalase"), R(0, 4, 12, 4, "luar", "Lesehan pasir"),
    F(0.5, 0.5, 4, 1.4, "air", "etalase es: ikan, cumi, kerang", "Pilih ikan"), F(5, 0.5, 3, 1.4, "merah", "pembakaran", ""), F(8.5, 0.5, 3, 1.4, "meja", "kasir", ""),
    *[F(0.6 + k * 2.9, 4.8, 2.2, 1.6, "kain", "tikar", "Makan lesehan") for k in range(4)],
    D(0, 2, 1.5, True), M(2.5, 2.2, "1", "Pilih seafood (hari ini: acak)"), M(6, 6.6, "2", "Makan sambil lihat laut (kencan)")],
    ["Kencan pantai"], ["Harga per kilo mahal"], "Asap ikan bakar, suara ombak")

interior("rumah_pohon", "Rumah pohon & pondok penebang", 16, 8, [
    R(0, 0, 6, 5, "rahasia", "Rumah pohon"), R(8, 0, 8, 7, "gudang", "Pondok penebang"),
    F(0.3, 0.3, 2.4, 1.4, "kain", "karpet bekas", ""), F(3.2, 0.3, 2.4, 1.2, "rak", "peti harta", "Foto Bram & Arga kecil"),
    F(0.3, 2.5, 1.4, 1.4, "kuning", "lampu senter", ""), F(8.5, 0.5, 3, 1.4, "meja", "meja kayu", "Peta proyek palsu (Bab 12)"),
    F(12, 0.5, 3.6, 2, "kasur", "dipan", ""), F(8.5, 4, 7, 2.4, "rak", "tumpukan kayu & alat", ""),
    D(2, 5, 1.2, t="tangga"), D(11, 7, 1.5),
    M(4.4, 1, "1", "Peti harta (rahasia Bram-Arga)"), M(10, 2.3, "2", "Bukti proyek")],
    ["Rahasia cerita"], ["Lapuk, gelap"], "Cahaya dari celah papan, laba-laba")

interior("kontainer_proyek", "Kontainer kantor proyek", 8, 3, [
    R(0, 0, 8, 3, "kantor", ""), F(0.3, 0.3, 2.6, 1, "meja", "meja + laptop", "Foto dokumen (Bab 13)"), F(3.2, 0.3, 1.6, 2.4, "rak", "lemari arsip", ""),
    F(5.2, 0.3, 2.5, 1, "putih", "denah superblok", ""), F(5.2, 1.6, 1.4, 1, "hitam", "CCTV monitor", "Matikan CCTV"),
    D(3.5, 3, 1.2), M(1.6, 1.8, "1", "Laptop: foto dokumen"), M(5.9, 2.4, "2", "Monitor CCTV")],
    ["Bukti utama Bab 13"], ["Satpam & anjing patroli tiap 40 dtk"], "Lampu neon berkedip, AC berisik")

interior("rumah_wulan", "Rumah panggung Wulan (Desa Sukamekar)", 12, 8, [
    R(0, 0, 12, 6, "rumah", ""), R(0, 6, 12, 2, "balkon", "Teras menghadap kebun teh"),
    F(0.3, 0.3, 3, 2, "kasur", "kamar Wulan", ""), F(3.6, 0.3, 4, 2, "hijau", "matras latihan", "Latihan silat"),
    F(8, 0.3, 3.6, 1.6, "logam", "tungku kayu", ""), F(1, 3, 4, 2, "meja", "meja pendek (lesehan)", ""), F(8, 3, 3.6, 0.6, "kuning", "piala silat", ""),
    D(5, 8, 2, t="tangga"), M(5.6, 1.3, "1", "Latihan silat (kelincahan +)"), M(6, 7, "2", "Teras: event 4 hati")],
    ["Event Wulan, latihan silat"], ["Jauh (bus)"], "Kabut pagi, aroma teh")

interior("rumah_dimas", "Rumah dinas Dimas (Asrama Batalyon)", 12, 8, [
    R(0, 0, 12, 8, "rumah", ""), F(0.3, 0.3, 3, 2, "kasur", "kamar Dimas", "Rapi ala tentara"), F(3.6, 0.3, 3, 2, "kasur", "kamar ortu", ""),
    F(7, 0.3, 4.6, 1.4, "logam", "dapur", ""), F(0.3, 4, 3, 1.2, "rak", "rak sepatu basket", ""), F(4, 4, 4, 2, "sofa", "ruang tamu", ""),
    F(9, 4, 2.6, 2, "meja", "foto ayah berseragam", ""), D(5, 8, 2), M(1.8, 1.5, "1", "Kamar: event 6 hati"), M(10.3, 5, "2", "Foto ayah: obrolan")],
    ["Event Dimas"], ["Harus diajak, jam malam 21.00"], "Bersih, sunyi, jam dinding")
