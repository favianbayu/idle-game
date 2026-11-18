// Alur cerita (guide 04) + NPC wilayah (guide 33): kerangka bab 1-15, garis waktu buka wilayah, misi sampingan 3 per wilayah,
// meter hati 0-8 (guide 03: 100 poin per hati) dengan event 2/4/6/8, pekerjaan di wilayah luar, dan jurnal (tombol Jurnal / B).
// Tujuan bab yang belum ada permainannya ditandai "segera" dan tidak menahan bab. Semua tersimpan di player.flags.story.
// Mode "Bebas" (default): semua wilayah terbuka. Mode "Cerita": wilayah luar terbuka sesuai bab.

/* ---------------- tujuan bab: talk (nama NPC), zone, area, ko, cnt [kunci, n], fn (cek), soon (belum ada di game) */
const T = (id, t, name) => ({ id, t, talk: name });
const Z = (id, t, zone) => ({ id, t, zone });
const A = (id, t, area) => ({ id, t, area });
const K = (id, t, name) => ({ id, t, ko: name });
const N = (id, t, key, n) => ({ id, t, cnt: [key, n] });
const F = (id, t, fn) => ({ id, t, fn });
const S = t => ({ t, soon: true });

export const BAB = [
  { n: 1, kelas: 'X', judul: 'MPLS', tujuan: [T('b1om', 'Ngobrol sama Om Darto', 'Om Darto'), A('b1sma', 'Masuk SMA Negeri 3', 'sekolah'), T('b1ujang', 'Kenalan sama Pak Ujang (cerita lonceng)', 'Pak Ujang'), K('b1ko', 'Menang berantem pertama', '*'), T('b1uti', 'Ketemu Uti (yang nolong sepeda bocor)', 'Uti'), S('Pembuka kereta dari terowongan Sangkala, MPLS, dihukum menyapu')] },
  { n: 2, kelas: 'X', judul: 'Warkop Simpang', tujuan: [T('b2gilang', 'Ikut rute galon Gilang', 'Gilang'), Z('b2pantai', 'Antar galon ke Pandansari & Pantai Lintang', 'pantai'), T('b2romlah', 'Bu Romlah jadi pelanggan kopi dingin warkop', 'Bu Romlah'), Z('b2tegal', 'Beli gula aren di pasar hewan Tegalsari (angkot barat)', 'tegalsari'), T('b2laras', 'Ketemu Laras', 'Laras'), S('Tutorial ekonomi: kopi keliling & jaga warung, utang Rp 5.000.000')] },
  { n: 3, kelas: 'X', judul: 'Malam Pertama', tujuan: [Z('b3ind', 'Ujian setia kawan: jalan Kawasan Industri Pradana', 'timur'), Z('b3suka', 'Antar pesanan kopi ke pabrik teh Sukamekar (bus)', 'sukamekar'), T('b3karta', 'Wulan ngajak ke pendopo Kembang Teh: ketemu Abah Karta', 'Abah Karta'), F('b3drag', 'Drag pertama di Jl. Lingkar Selatan', p => (p.flags?.dragN || 0) >= 1), S('Dicegat Serigala Besi, ujian masuk Lampu Kota tiga malam, kemah Pramuka')] },
  { n: 4, kelas: 'X', judul: 'Agustusan', tujuan: [Z('b4waduk', 'Ke Waduk Sirnagalih (lomba perahu hias)', 'waduk'), T('b4sudar', 'Kenalan sama Pak Sudarmaji, petugas pintu air', 'Pak Sudarmaji'), N('b4shift', 'Umur 16: kerja shift pertama di Kawasan Industri', 'shift', 1), F('b4kirana', 'Kirana nantang drag (kalahkan 2 lawan drag)', p => (p.flags?.drag || 0) >= 2), S('Lomba 17-an, mini game dayung, pasar malam, rapor pertama')] },
  { n: 5, kelas: 'X', judul: 'Jatuh Tempo', tujuan: [F('b5kerja', 'Kerja musiman: panen teh / nelayan subuh / lembur shift (3x total)', (p, s) => (s.cnt.teh || 0) + (s.cnt.nelayan || 0) + (s.cnt.shift || 0) >= 3), T('b5hadi', 'HUT Asrama Batalyon 3: ketemu Serma Hadi', 'Serma Hadi'), N('b5track', 'Track day sirkuit pertama', 'track', 1), S('Arc Uti, Pak Gito menagih utang, naik kelas XI')] },
  { n: 6, kelas: 'XI', judul: 'Pemilihan OSIS', tujuan: [T('b6nadia', 'Kampanye bareng Nadia', 'Nadia'), Z('b6tegal', 'Debat di pos ronda Gg. Melati, Tegalsari', 'tegalsari'), T('b6andra', 'Andra di rumah neneknya, tepi sawah Pandansari', 'Andra'), T('b6sumi', 'Ketemu Nek Sumi', 'Nek Sumi'), S('Suara siswa desa, final basket antar-SMA, lampu jalan kampung')] },
  { n: 7, kelas: 'XI', judul: 'Adu Domba', tujuan: [T('b7sri', 'Mbak Sri bantu nyelinap ke gudang kontraktor', 'Mbak Sri'), T('b7rusdi', 'Lihat daftar "tenaga harian" Pak Rusdi', 'Pak Rusdi'), K('b7sarip', 'Hadapi Bang Sarip', 'Bang Sarip'), S('Warkop dirusak, mode detektif, damai atau perang dengan Kobar')] },
  { n: 8, kelas: 'XI', judul: 'Karyawisata Sangkala', tujuan: [Z('b8suka', 'Hari 1: tur pabrik teh Sukamekar', 'sukamekar'), T('b8sabar', 'Mandor Sabar nunjukin pabrik teh tua', 'Mandor Sabar'), Z('b8gunung', 'Hari 2: daftar di basecamp Sangkala', 'gunung'), T('b8ujo', 'Lapor ke Kang Ujo sebelum naik', 'Kang Ujo'), S('Balap turunan Tikungan Seribu, foto Pak Ujang muda dari Arga, air panas')] },
  { n: 9, kelas: 'XI', judul: 'Balapan yang Salah', tujuan: [Z('b9sirkuit', 'Liga resmi pindah ke Sirkuit Tanjung Pradana', 'sirkuit'), T('b9yusuf', 'Daftar liga ke Pak Yusuf', 'Pak Yusuf'), N('b9track', 'Latihan track day (3x total)', 'track', 3), S('Bimo kecelakaan, razia geng, tim Bengkel Wijaya Motor')] },
  { n: 10, kelas: 'XI', judul: 'Surat Relokasi', tujuan: [Z('b10ind', 'Survei lahan rawa di belakang Kawasan Industri', 'timur'), T('b10sudar', 'Tanya Pak Sudarmaji soal pintu air', 'Pak Sudarmaji'), T('b10darmo', 'Mbah Darmo di mercusuar', 'Mbah Darmo'), S('Banjir Kali Cendana & evakuasi perahu, final balap liar Jalur Pesisir')] },
  { n: 11, kelas: 'XII', judul: 'Tahun Terakhir', tujuan: [T('b11lukman', 'Patok proyek: hadapi Ir. Lukman', 'Ir. Lukman'), T('b11sumi', 'Sawah Nek Sumi dipatok', 'Nek Sumi'), T('b11sabar', 'Mandor Sabar saksi patok di tepi kebun teh', 'Mandor Sabar'), S('Try out, pilih jalur, Tegar kabur, Fajar paket C')] },
  { n: 12, kelas: 'XII', judul: 'Rahasia Gedung Lama', tujuan: [Z('b12kemah', 'Kemah puncak angkatan di Alun-alun Edelweis', 'gunung'), T('b12karta', 'Abah Karta cerita sumpah Batu Tulis', 'Abah Karta'), T('b12kyai', 'Ambil buku saksi hibah dari Kyai Mahfud', 'Kyai Mahfud'), K('b12sarip', 'Lolos dari orang bayaran Bang Sarip', 'Bang Sarip'), S('Teka-teki prasasti, Gedung Lama, akta hibah Ki Sastro Wiryo')] },
  { n: 13, kelas: 'XII', judul: 'Satu Daerah', tujuan: [F('b13sekutu', 'Kumpulkan minimal 4 sekutu (lihat daftar)', (p, s, st) => st.allies().filter(a => a.ok).length >= 4), S('Balapan pengantaran akta: Tikungan Seribu / Jalur Pesisir / perahu nelayan, sidang')] },
  { n: 14, kelas: 'XII', judul: 'Ujian Akhir', tujuan: [T('b14kyai', 'Belajar malam di perpustakaan pesantren Tegalsari', 'Kyai Mahfud'), S('Maraton ujian satu minggu')] },
  { n: 15, kelas: 'XII', judul: 'Perpisahan', tujuan: [Z('b15pantai', 'Perjalanan terakhir: mercusuar Tanjung Karang', 'pantai'), T('b15darmo', 'Senja bareng Mbah Darmo', 'Mbah Darmo'), S('Malam perpisahan, wisuda, lonceng, kereta pulang lewat terowongan')] },
];
// wilayah luar (id zona luar.js) terbuka mulai bab berapa (mode Cerita)
// kapan bab terjadi di kalender (guide 04)
const KAPAN = ['', 'Kelas X · Kemarau Awal, tgl 15 (MPLS)', 'Kelas X · Kemarau Awal minggu 4 - Kemarau minggu 1', 'Kelas X · Kemarau minggu 2', 'Kelas X · Kemarau, 17 Agustus', 'Kelas X · semester 2 (Hujan - Kemarau Muda)', 'Kelas XI · Kemarau Awal - Kemarau', 'Kelas XI · Pancaroba', 'Kelas XI · Pancaroba (akhir)', 'Kelas XI · Hujan', 'Kelas XI · Hujan Akhir - Kemarau Muda', 'Kelas XII · Kemarau Awal - Kemarau', 'Kelas XII · Pancaroba', 'Kelas XII · Hujan', 'Kelas XII · Hujan Akhir', 'Kelas XII · Kemarau Muda + Libur Panjang'];
export const ZONE_BAB = { pesisir: 2, pantai: 2, tegalsari: 2, sukamekar: 2, muara: 2, timur: 3, waduk: 4, sirkuit: 5, gunung: 8 };

/* ---------------- pekerjaan & misi kecil di wilayah: ditawarkan NPC setelah ngobrol hari itu.
   need(c) = syarat rantai misi, once = sekali saja, max = batas hitungan, bab = mulai bab (mode Cerita) */
const JOBS = [
  { npc: 'Kang Ujo', id: 'porter', t: 'Jadi porter basecamp (Rp25.000)', anim: 'carry', dur: 5, pay: 25000, bab: 8, stat: 'kekuatan' },
  { npc: 'Kang Ujo', id: 'sampah', t: 'Bersihkan sampah jalur pendakian', anim: 'squat', dur: 6, need: c => c.porter >= 3, once: true, hati: 100 },
  { npc: 'Kang Ujo', id: 'tersesat', t: 'Antar pendaki tersesat turun malam (bareng Arga)', anim: 'run', dur: 7, need: c => c.sampah >= 1, once: true, hati: 120, stat: 'nyali' },
  { npc: 'Mandor Sabar', id: 'teh', t: 'Panen teh: petik pucuk (Rp30.000)', anim: 'squat', dur: 5, pay: 30000, bab: 2 },
  { npc: 'Mandor Sabar', id: 'mesin', t: 'Perbaiki mesin pabrik teh tua (bareng Uti)', anim: 'squat', dur: 6, need: c => c.teh >= 5, once: true, hati: 100 },
  { npc: 'Abah Karta', id: 'silat', t: 'Bantu Abah buka kelas silat anak desa', anim: 'raiseHand', dur: 6, need: c => c.mesin >= 1, once: true, hati: 120, stat: 'kelincahan' },
  { npc: 'Ki Sarpan', id: 'foto', t: 'Foto batu bertulis', anim: 'phone', dur: 2.5, daily: false, max: 5, bab: 4, done: c => `Foto batu ke-${c.foto}/5` },
  { npc: 'Ki Sarpan', id: 'rizal', t: 'Ajak Rizal baca aksaranya', anim: 'read', dur: 5, need: c => c.foto >= 5, once: true },
  { npc: 'Ki Sarpan', id: 'batu6', t: 'Cari batu ke-6 yang ketutup lumut', anim: 'squat', dur: 6, need: c => c.rizal >= 1, once: true, msg: 'Batu ke-6 ketemu! Ada nama-nama kecil terpahat... salah satunya "Ujang".' },
  { npc: 'Bu Atun', id: 'antarIkan', t: 'Antar 3 ikan ke warung ikan bakar', anim: 'carry', dur: 3, need: c => c.ikan >= 10, once: true, fish: 3, pay: 45000 },
  { npc: 'Pak Sudarmaji', id: 'papan', t: 'Pasang papan peringatan banjir (bareng Gilang)', anim: 'squat', dur: 6, need: c => c.antarIkan >= 1, once: true, hati: 120 },
  { npc: 'Pak Lurah Darsa', id: 'ronda', t: 'Ronda malam di gang', anim: 'look', dur: 5, max: 3, bab: 2, stat: 'nyali' },
  { npc: 'Pak Lurah Darsa', id: 'kurban', t: 'Bantu pasar hewan saat Iduladha', anim: 'carry', dur: 6, need: c => c.ronda >= 3, once: true, stat: 'kekuatan' },
  { npc: 'Kyai Mahfud', id: 'ngaji', t: 'Ajar ngaji anak-anak bareng santri', anim: 'read', dur: 6, need: c => c.kurban >= 1, once: true, hati: 120 },
  { npc: 'Serma Hadi', id: 'lari', t: 'Lari subuh bareng regu (Dimas ikut)', anim: 'run', dur: 6, max: 5, bab: 3, stat: 'kelincahan' },
  { npc: 'Tito', id: 'bola', t: 'Latih bola anak asrama', anim: 'cheer', dur: 6, need: c => c.lari >= 5, once: true, stat: 'kelincahan' },
  { npc: 'Serma Hadi', id: 'lintas', t: 'Lomba lintas alam HUT batalyon', anim: 'run', dur: 8, need: c => c.bola >= 1, once: true, hati: 120, stat: 'kelincahan' },
  { npc: 'Mbak Sri', id: 'shift', t: 'Kerja shift pabrik (Rp60.000, capek)', anim: 'carry', dur: 7, pay: 60000, bab: 4, hp: 0.6 },
  { npc: 'Mbak Sri', id: 'damai', t: 'Damaikan buruh & Serigala Besi di warung pabrik', anim: 'talk', dur: 5, need: c => c.shift >= 5, once: true, stat: 'nyali' },
  { npc: 'Mbak Sri', id: 'jadwal', t: 'Bocorkan jadwal truk proyek', anim: 'phone', dur: 4, need: c => c.damai >= 1, once: true, bab: 13 },
  { npc: 'Pak Yusuf', id: 'track', t: 'Ikut track day (Rp50.000)', anim: 'cheer', dur: 5, cost: 50000, bab: 5, stat: 'kelincahan' },
  { npc: 'Mekanik Bayu', id: 'pit', t: 'Jadi kru pit di seri liga (Rp40.000)', anim: 'squat', dur: 6, need: c => c.track >= 3, once: true, pay: 40000 },
  { npc: 'Pak Yusuf', id: 'seri', t: 'Balapan seri liga', anim: 'cheer', dur: 6, need: c => c.pit >= 1, race: true },
  { npc: 'Nek Sumi', id: 'galon', t: 'Antar galon ke warga (bareng Gilang, Rp15.000)', anim: 'carry', dur: 5, pay: 15000, bab: 2 },
  { npc: 'Andra', id: 'layangan', t: 'Main layangan sore di pematang', anim: 'look', dur: 6, need: c => c.galon >= 5, once: true, zone: true },
  { npc: 'Andra', id: 'mural', t: 'Bantu Andra melukis mural di dinding lumbung', anim: 'raiseHand', dur: 7, need: c => c.layangan >= 1, once: true, hati: 150, zone: true },
  { npc: 'Wak Kodir', id: 'nelayan', t: 'Ikut nelayan subuh: tebar jaring (Rp40.000)', anim: 'carry', dur: 6, pay: 40000, bab: 2 },
  { npc: 'Bu Romlah', id: 'warung', t: 'Jaga warung seafood saat libur (Rp50.000)', anim: 'carry', dur: 6, need: c => c.nelayan >= 3, once: true, pay: 50000 },
  { npc: 'Mbah Darmo', id: 'mercu', t: 'Nyalakan lagi lampu mercusuar', anim: 'raiseHand', dur: 6, need: c => c.warung >= 1, once: true, hati: 150, msg: 'Lampu mercusuar menyala lagi! Mbah Darmo senyum: "Akhirnya ada yang pulang."' },
];
// misi sampingan per wilayah (guide 04): 3 berantai, semua selesai = epilog baik
const MISI = [
  ['Gunung Sangkala', [['Jadi porter basecamp 3x', 'porter', 3], ['Bersihkan sampah jalur pendakian', 'sampah', 1], ['Antar pendaki tersesat turun malam', 'tersesat', 1]], 'Kang Ujo di basecamp', ['Jalur pendakian bersih, basecamp jadi percontohan', '']],
  ['Sukamekar', [['Panen teh 5x', 'teh', 5], ['Perbaiki mesin pabrik teh tua', 'mesin', 1], ['Bantu Abah Karta buka kelas silat', 'silat', 1]], 'Mandor Sabar di kebun teh', ['Kebun teh jadi agrowisata desa, Wulan kepala pemandu', 'Villa tahap 2 dibangun, setengah kebun hilang']],
  ['Batu Tulis', [['Foto 5 batu bertulis', 'foto', 5], ['Bawa Rizal membaca aksara', 'rizal', 1], ['Temukan batu ke-6 berlumut', 'batu6', 1]], 'Ki Sarpan dekat Batu Tulis (Waduk)', ['Prasasti dilindungi jadi cagar budaya', '']],
  ['Waduk', [['Tangkap 10 ikan', 'ikan', 10], ['Antar ikan ke warung ikan bakar', 'antarIkan', 1], ['Pasang papan peringatan banjir', 'papan', 1]], 'Bu Atun & Pak Sudarmaji', ['Peringatan banjir jadi sistem resmi', 'Banjir terulang tiap tahun']],
  ['Tegalsari', [['Ronda malam di gang 3x', 'ronda', 3], ['Bantu pasar hewan saat Iduladha', 'kurban', 1], ['Ajar ngaji anak-anak bareng santri', 'ngaji', 1]], 'Pak Lurah Darsa & Kyai Mahfud', ['Angkot malam tetap jalan, siswa desa ramai di ekskul', 'Pasar hewan pindah, desa makin sepi']],
  ['Batalyon', [['Lari subuh bareng Dimas 5x', 'lari', 5], ['Latih bola anak asrama', 'bola', 1], ['Lomba lintas alam HUT', 'lintas', 1]], 'Serma Hadi & Tito di asrama', ['Dimas lolos seleksi akademi', 'Dimas ikut ayahnya pindah tugas']],
  ['Industri', [['Kerja shift 5x', 'shift', 5], ['Damaikan buruh & Serigala Besi', 'damai', 1], ['Bocorkan jadwal truk (Bab 13)', 'jadwal', 1]], 'Mbak Sri di gerbang pabrik', ['Lahan rawa jadi taman kota', 'Lahan rawa jadi kompleks sekolah baru yang bising']],
  ['Sirkuit', [['Track day 3x', 'track', 3], ['Jadi kru pit di seri liga', 'pit', 1], ['Menang satu seri liga', 'seriMenang', 1]], 'Pak Yusuf & Mekanik Bayu', ['Liga resmi jalan terus, balap liar kota hilang', 'Liga bubar, balap liar kembali ke Jl. Lingkar']],
  ['Pandansari', [['Antar galon bareng Gilang 5x', 'galon', 5], ['Main layangan sore di pematang', 'layangan', 1], ['Bantu Andra melukis mural lumbung', 'mural', 1]], 'Nek Sumi & Andra', ['Sawah Nek Sumi jadi galeri mural terbuka', 'Sawah jadi gudang proyek']],
  ['Pantai', [['Ikut nelayan subuh 3x', 'nelayan', 3], ['Jaga warung seafood saat libur', 'warung', 1], ['Nyalakan lampu mercusuar bareng Mbah Darmo', 'mercu', 1]], 'Wak Kodir (TPI), Bu Romlah, Mbah Darmo', ['Cabang warkop Pantai Lintang ramai, nelayan punya koperasi', 'Pantai Lintang dipagari hotel']],
];

/* ---------------- event hati NPC wilayah (guide 33). [judul, teks, efek?] di hati 2/4/6/8 */
const EVENTS = {
  'Kyai Mahfud': { 2: ['Gula Aren', 'Kembalian di pasar kelebihan, kamu kembalikan. Kyai Mahfud memperhatikan, lalu mengajak minum teh di serambi pesantren.'], 4: ['Rak Paling Atas', 'Kamu bantu menyusun perpustakaan pesantren. Di rak paling atas ada buku tua bersegel. "Yang itu jangan dibuka dulu, Nak."'], 6: ['Cerita Kakek', 'Kyai bercerita tentang Ki Sastro Wiryo, kakeknya, yang menyerahkan sawah terbaiknya untuk sekolah. "Tanah itu titipan. Yang menitipkan masih melihat."'], 8: ['Amanah', 'Kyai menyerahkan buku saksi hibah lebih awal. "Jaga baik-baik." Belajar di perpustakaan pesantren selalu kasih fokus.', 'bukuSaksi'] },
  'Abah Karta': { 2: ['Murid Kota', 'Abah menyuruh kamu memikul air dari pancuran sepuluh kali sebelum boleh latihan. Kamu nggak ngeluh. Abah mendengus, tapi mengangguk.'], 4: ['Kecapi', 'Malam di teras, Abah memainkan kecapi. "Lagu ini dulu Abah mainkan bareng Ujang. Pak Ujang sekolahmu itu."'], 6: ['Batu Tulis', 'Abah mengajakmu ke Bukit Batu Tulis dan menunjukkan namanya yang terpahat kecil di batu. "Dulu kami bersumpah di sini."'], 8: ['Pewaris', 'Abah memberimu sabuk hijau kehormatan dan mengajarkan jurus kuncian terakhir. "Jurus itu bukan buat pamer. Buat pulang dengan selamat."', 'sabukHijau'] },
  'Serma Hadi': { 2: ['Lari Subuh', 'Kamu ikut lari pagi regu asrama dan tertinggal jauh, tapi nggak berhenti. Serma Hadi cuma bilang: "Besok lagi."'], 4: ['Mi Instan', 'Di dapur asrama, ternyata Serma Hadi yang mengajari Dimas resep mi racikannya. Rahasia: telur dikocok di bungkus bumbu.'], 6: ['Tribun', '"Saya terlalu keras sama anak itu," katanya pelan. "Jangan bilang Dimas saya ngomong begini."'], 8: ['Hormat', 'Serma Hadi memberimu baret lamanya. Gerbang asrama terbuka buatmu kapan saja.', 'baret'] },
  'Pak Sudarmaji': { 2: ['Kopi Malam', 'Kamu antar kopi waktu dia jaga pintu air di tengah hujan. "Air itu nggak bisa disuruh, Dek. Orang yang bisa."'], 4: ['Catatan Debit', 'Dia memperlihatkan buku catatan air yang basah: debit tiap jam, ditulis tangan sejak bertahun-tahun.'], 6: ['Telepon Itu', 'Dengan suara gemetar dia bercerita siapa yang menelepon menyuruhnya membuka pintu air lebih cepat.', 'saksiAir'], 8: ['Sirene', 'Kamu, dia, dan Gilang memasang sirene peringatan banjir. Untuk pertama kalinya warga hilir bakal tahu sebelum air datang.'] },
  'Wak Kodir': { 2: ['Jaring Kusut', 'Subuh-subuh kamu bantu mengurai jaring yang kusut. Wak Kodir ketawa: "Tangan anak kota halus amat!"'], 4: ['Badai Kecil', 'Pulang melawan ombak, Wak Kodir menyerahkan kemudi sebentar. Kamu berhasil menjaga haluan.'], 6: ['Anak Saya di Kota', 'Anaknya kerja di pabrik dan jarang pulang. "Kalau ketemu, bilang bapaknya sehat."'], 8: ['Perahu Sendiri', '"Pakai saja perahu itu kapan kamu mau, Le." Rute laut sekarang terbuka buatmu.', 'perahu'] },
  'Bu Romlah': { 2: ['Pesanan Telat', 'Kopi dingin telat datang, Bu Romlah ngomel. Tapi kamu tetap dikasih cumi bakar gratis.'], 4: ['Hari Libur Panjang', 'Warung penuh sesak waktu libur panjang, kamu bantu jaga sampai tutup.'], 6: ['Lahan Belakang', 'Bu Romlah menawarkan sepetak lahan di belakang warung buat cabang warkop.'], 8: ['Kongsi', 'Cabang warkop Pantai Lintang: bagi hasil 60:40 untukmu. "Jangan kecewain Ibu."', 'kongsi'] },
  'Kang Ujo': { 2: ['Porter Baru', 'Kang Ujo mengajarimu cara memikul beban biar punggung nggak cedera.'], 4: ['Kabut', 'Kabut turun tebal. Kalian berdua menuntun rombongan turun pelan-pelan, saling panggil nama.'], 6: ['Jalur Lama', 'Dia menunjukkan jalan rahasia dari punggung gunung ke Batu Tulis. "Jangan bilang siapa-siapa."'], 8: ['Pemandu Kehormatan', 'Kamu boleh mendaki kapan saja, termasuk malam.', 'pemandu'] },
};
// NPC pendukung wilayah (punya meter hati walau dibuat sebagai NPC pengisi)
const REGION = new Set(['Kyai Mahfud', 'Abah Karta', 'Serma Hadi', 'Pak Sudarmaji', 'Wak Kodir', 'Bu Romlah', 'Kang Ujo', 'Mandor Sabar', 'Pak Yusuf', 'Mbak Sri', 'Mbah Darmo', 'Nek Sumi', 'Tito', 'Neng Ayu']);
// sekutu Bab 13 (guide 04): syarat dari hati, hitungan kerja, dan tujuan bab
function allyList(h, c, done) {
  return [
    ['Lampu Kota', 'Bang Jaka 4+', h('Bang Jaka') >= 4],
    ['Pedagang pasar (Laras)', 'Laras 6+', h('Laras') >= 6],
    ['OSIS & siswa desa', 'Nadia 6+ (pemilu OSIS belum ada)', h('Nadia') >= 6],
    ['Anak asrama Batalyon', 'Dimas 6+ atau ketemu Serma Hadi di Bab 5', h('Dimas') >= 6 || !!done.b5hadi],
    ['Perguruan Kembang Teh', 'Wulan 6+', h('Wulan') >= 6],
    ['Warga & pesantren Tegalsari', 'Buku saksi (Bab 12 / Kyai 8 hati)', !!done.b12kyai],
    ['Nelayan TPI (Wak Kodir)', 'Ikut nelayan subuh 3x', (c.nelayan || 0) >= 3],
    ['Buruh industri (Mbak Sri)', 'Kerja shift 5x', (c.shift || 0) >= 5],
    ['STM (Kirana, Andra)', 'Kirana atau Andra 6+', h('Kirana') >= 6 || h('Andra') >= 6],
    ['Bram', 'Bram 6+', h('Bram') >= 6],
  ].map(([name, need, ok]) => ({ name, need, ok }));
}

export function makeStory({ player, toast, shop, fight, acts }) {
  const fl = () => player.flags || (player.flags = {});
  const st = () => { const f = fl(); return f.story || (f.story = { bab: 1, done: {}, cnt: {}, pts: {}, ev: {}, talk: {}, job: {}, mode: 'bebas' }); };
  const day = () => fl().day || 0;
  const keyOf = name => (name || '').split(' (')[0].trim();
  const hati = name => Math.min(8, Math.floor((st().pts[keyOf(name)] || 0) / 100));
  const self = { allies: () => allyList(hati, st().cnt, st().done) };

  /* ---------------- UI: jurnal + kartu event */
  const css = document.createElement('style');
  css.textContent = `#jurnal{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(94vw,560px);max-height:86vh;overflow:auto;display:none;z-index:30;background:#fffbe8;color:#1a1a1a;border:3px solid #000;border-radius:12px;padding:10px 14px;font:13px 'Trebuchet MS',system-ui,sans-serif;box-shadow:0 6px 0 rgba(0,0,0,.35)}
  #jurnal h3{margin:4px 0 6px;font-size:17px}#jurnal h4{margin:10px 0 4px;font-size:14px;border-bottom:2px solid #000}
  #jurnal .x{position:sticky;top:0;float:right;border:2px solid #000;border-radius:6px;background:#ffd84a;font-weight:bold;width:30px;height:30px}
  #jurnal .tabs{display:flex;gap:6px;margin:4px 0 6px}#jurnal .tabs button,#jurnal .mode{border:2px solid #000;border-radius:7px;background:#fff;font:bold 13px 'Trebuchet MS',system-ui,sans-serif;padding:5px 10px}
  #jurnal .tabs button.on{background:#ffd84a}#jurnal ul{margin:2px 0;padding-left:20px}#jurnal li{margin:2px 0}#jurnal .ok{color:#2a8a3a}#jurnal .soon{color:#888}
  #jurnal .bar{display:inline-block;width:120px;height:9px;border:2px solid #000;border-radius:3px;vertical-align:middle;background:#eee;position:relative;overflow:hidden}#jurnal .bar i{position:absolute;left:0;top:0;bottom:0;background:#e85a8a}
  #jurnal table{border-collapse:collapse;width:100%}#jurnal td{padding:2px 4px;border-bottom:1px solid #ddd;vertical-align:top}
  #hatiEv{position:fixed;left:50%;bottom:calc(max(18px,env(safe-area-inset-bottom)) + 90px);transform:translateX(-50%);width:min(92vw,460px);display:none;z-index:31;background:#fff1f5;border:3px solid #000;border-radius:12px;padding:10px 14px;font:14px 'Trebuchet MS',system-ui,sans-serif;color:#1a1a1a;box-shadow:0 6px 0 rgba(0,0,0,.35)}
  #hatiEv b{color:#c8326a}#hatiEv button{margin-top:8px;float:right;border:2px solid #000;border-radius:8px;background:#ffd84a;font:bold 14px 'Trebuchet MS',system-ui,sans-serif;padding:6px 14px}`;
  document.head.appendChild(css);
  const J = document.createElement('div'); J.id = 'jurnal'; document.body.appendChild(J);
  const E = document.createElement('div'); E.id = 'hatiEv'; document.body.appendChild(E);
  for (const el of [J, E]) el.addEventListener('pointerdown', e => e.stopPropagation());
  let tab = 'bab', W = null;
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function render() {
    const s = st(), b = BAB[Math.min(s.bab, 15) - 1];
    let h = `<button class="x">✕</button><h3>Jurnal Raka</h3><div class="tabs">${[['bab', 'Cerita'], ['misi', 'Misi wilayah'], ['hati', 'Hati']].map(([k, l]) => `<button data-t="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    if (tab === 'bab') {
      if (W) { const c = W.cal(), up = W.upcoming(4); h += `<div><b>Hari ini:</b> ${c.hari}, ${c.tanggal} ${c.namaBulan} <span style="opacity:.7">(${c.asli})</span> · Kelas ${c.kelas} · jam ${W.hhmm(W.jam * 60)}</div>${up.length ? `<div style="font-size:12px;margin-top:2px"><b>Kalender:</b> ${up.map(e => `${esc(e.label)}: ${esc(e.name)}${e.inDays ? '' : ' (hari ini)'}`).join(' · ')}</div>` : ''}`; }
      h += s.bab > 15 ? '<h4>Tamat! Semua bab selesai.</h4>' : `<h4>Kelas ${b.kelas} · Bab ${b.n}: ${esc(b.judul)}</h4><div style="font-size:11px;opacity:.75">${KAPAN[b.n]}</div><ul>${b.tujuan.map(o => o.soon ? `<li class="soon">○ ${esc(o.t)} <i>(segera)</i></li>` : `<li class="${s.done[o.id] ? 'ok' : ''}">${s.done[o.id] ? '✓' : '○'} ${esc(o.t)}${o.cnt ? ` (${Math.min(o.cnt[1], s.cnt[o.cnt[0]] || 0)}/${o.cnt[1]})` : ''}</li>`).join('')}</ul>`;
      if (s.bab === 13) h += `<h4>Sekutu Bab 13</h4><table>${self.allies().map(a => `<tr><td class="${a.ok ? 'ok' : ''}">${a.ok ? '✓' : '○'} ${esc(a.name)}</td><td>${esc(a.need)}</td></tr>`).join('')}</table>`;
      h += `<h4>Wilayah</h4><table>${Object.entries(ZONE_BAB).map(([z, n]) => `<tr><td>${esc(ZNAME[z] || z)}</td><td class="${zoneOk(z) ? 'ok' : ''}">${zoneOk(z) ? 'terbuka' : 'Bab ' + n}</td></tr>`).join('')}</table>`;
      h += `<p><button class="mode">Mode: ${s.mode === 'cerita' ? 'Cerita (wilayah dibuka per bab)' : 'Bebas (semua wilayah terbuka)'}</button></p><p style="font-size:11px;opacity:.75">Tujuan "segera" belum ada permainannya dan tidak menahan bab. Bab lanjut otomatis begitu semua tujuan lain selesai.</p>`;
    } else if (tab === 'misi') {
      for (const [reg, list, who, [good]] of MISI) {
        const c = s.cnt, all = list.every(([, k, n]) => (c[k] || 0) >= n);
        h += `<h4>${esc(reg)} <span style="font-weight:normal;font-size:11px">· ${esc(who)}</span></h4><ul>${list.map(([t, k, n], i) => { const v = Math.min(n, c[k] || 0), ok = v >= n, open = i === 0 || (c[list[i - 1][1]] || 0) >= list[i - 1][2]; return `<li class="${ok ? 'ok' : open ? '' : 'soon'}">${ok ? '✓' : '○'} ${esc(t)}${n > 1 ? ` (${v}/${n})` : ''}</li>`; }).join('')}</ul>${all ? `<div class="ok">Epilog baik: ${esc(good)}</div>` : ''}`;
      }
    } else {
      const rows = Object.entries(st().pts).filter(([, p]) => p > 0).sort((a, b) => b[1] - a[1]);
      h += rows.length ? `<table>${rows.map(([k, p]) => { const hv = Math.min(8, Math.floor(p / 100)), E2 = EVENTS[k]; return `<tr><td><b>${esc(k)}</b></td><td>${'♥'.repeat(hv)}${'♡'.repeat(8 - hv)}<br><span class="bar"><i style="width:${hv >= 8 ? 100 : p % 100}%"></i></span></td><td style="font-size:11px">${E2 ? [2, 4, 6, 8].map(n => `${s.ev[k + n] ? '✓' : n <= hv ? '!' : '·'} ${n}: ${esc(E2[n][0])}`).join('<br>') : ''}</td></tr>`; }).join('')}</table>` : '<p>Belum kenal siapa-siapa. Ngobrol tiap hari (+10), bantu kerjaan (+60 sampai +150). 100 poin = 1 hati, event di hati 2/4/6/8.</p>';
    }
    J.innerHTML = h;
    J.querySelector('.x').onclick = () => toggle(false);
    for (const b2 of J.querySelectorAll('.tabs button')) b2.onclick = () => { tab = b2.dataset.t; render(); };
    const m = J.querySelector('.mode'); if (m) m.onclick = () => { s.mode = s.mode === 'cerita' ? 'bebas' : 'cerita'; toast(s.mode === 'cerita' ? 'Mode cerita: wilayah luar dibuka sesuai bab.' : 'Mode bebas: semua wilayah terbuka.'); render(); };
  }
  function toggle(on = J.style.display !== 'block') { J.style.display = on ? 'block' : 'none'; if (on) render(); }
  let evQ = [];
  function showEvent(name, n, [judul, teks]) { E.innerHTML = `<b>♥ ${n} hati · ${esc(name)}</b><div style="font-size:16px;font-weight:bold;margin:3px 0">${esc(judul)}</div><div>${esc(teks)}</div><button>Lanjut</button>`; E.style.display = 'block'; E.querySelector('button').onclick = () => { E.style.display = 'none'; if (evQ.length) showEvent(...evQ.shift()); }; }

  /* ---------------- poin hati & tujuan */
  const ZNAME = { pesisir: 'Pesisir Lintang (kereta)', pantai: 'Pantai Lintang & Pandansari', tegalsari: 'Desa Tegalsari', sukamekar: 'Desa Sukamekar & kebun teh', muara: 'Muara & TPI', timur: 'Batalyon 3 & Kawasan Industri', waduk: 'Waduk Sirnagalih & Batu Tulis', sirkuit: 'Sirkuit Tanjung Pradana', gunung: 'Gunung Sangkala' };
  const zoneOk = z => st().mode !== 'cerita' || !ZONE_BAB[z] || st().bab >= ZONE_BAB[z];
  function addPts(name, p) {
    const k = keyOf(name), s = st(), before = hati(k); s.pts[k] = Math.max(0, (s.pts[k] || 0) + p); const after = hati(k);
    if (after > before) toast(`♥ ${k}: ${after} hati${after % 2 === 0 && EVENTS[k] ? ' (ada event, ngobrol lagi!)' : ''}`);
  }
  function mark(id, t) {
    const s = st(); if (s.done[id]) return; s.done[id] = true; toast('✓ ' + t); checkBab();
  }
  function checkBab() {
    const s = st(); if (s.bab > 15) return;
    const b = BAB[s.bab - 1]; if (b.tujuan.some(o => !o.soon && !s.done[o.id])) return;
    s.bab++; const nb = BAB[s.bab - 1];
    setTimeout(() => toast(nb ? `Bab ${b.n} selesai! Lanjut Bab ${nb.n}: ${nb.judul}${Object.entries(ZONE_BAB).some(([, n]) => n === nb.n) ? ' (wilayah baru terbuka)' : ''}` : 'Bab 15 selesai. Tamat! Makasih udah main.'), 2300);
    checkBab();
  }
  function ev(type, val) {
    const s = st(), b = BAB[s.bab - 1]; if (!b) return;
    for (const o of b.tujuan) if (!o.soon && !s.done[o.id]) {
      if ((type === 'talk' && o.talk && keyOf(val).startsWith(o.talk)) || (type === 'zone' && o.zone === val) || (type === 'area' && o.area === val) || (type === 'ko' && o.ko && (o.ko === '*' || keyOf(val).startsWith(o.ko)))) mark(o.id, o.t);
    }
  }
  function poll() {
    const s = st(), b = BAB[s.bab - 1]; if (!b) return;
    for (const o of b.tujuan) if (!o.soon && !s.done[o.id] && ((o.cnt && (s.cnt[o.cnt[0]] || 0) >= o.cnt[1]) || (o.fn && o.fn(player, s, self)))) mark(o.id, o.t);
  }
  addEventListener('ko', e => ev('ko', e.detail || ''));
  addEventListener('ikan', () => { const c = st().cnt; c.ikan = (c.ikan || 0) + 1; if (c.ikan === 10) toast('✓ Misi Waduk: 10 ikan tertangkap. Antar ke Bu Atun!'); });

  /* ---------------- pekerjaan */
  function jobFor(n) {
    const s = st(), c = new Proxy(s.cnt, { get: (o, k) => o[k] || 0 }), k = keyOf(n.name);
    if (s.talk[k] !== day()) return null;   // ngobrol dulu hari ini
    for (const j of JOBS) {
      if (j.npc !== k || (j.zone && player.area !== 'luar')) continue;
      if (j.once && c[j.id] >= 1) continue;
      if (j.max && c[j.id] >= j.max) continue;
      if (j.need && !j.need(c)) continue;
      if (s.mode === 'cerita' && j.bab && s.bab < j.bab) continue;
      if (j.daily !== false && s.job[j.id] === day()) continue;
      return j;
    }
    return null;
  }
  function doJob(n, j) {
    const s = st(), c = s.cnt;
    if (j.cost && (player.uang || 0) < j.cost) { toast(`Biayanya ${rp(j.cost)}. Uangnya kurang...`); return; }
    if (j.fish) { const inv = player.inv || {}, have = Object.entries(inv).filter(([, v]) => v > 0).reduce((a, [, v]) => a + v, 0); if (have < j.fish) { toast(`Bawa ${j.fish} ikan dulu (sekarang ${have}).`); return; } let need = j.fish; for (const k of Object.keys(inv)) while (need > 0 && inv[k] > 0) { inv[k]--; need--; } }
    if (j.cost) { player.uang -= j.cost; shop.showMoney(); }
    n.wait = j.dur + 1.5; n.heading = Math.atan2(player.z - n.z, player.x - n.x);
    acts.doAct(j.anim, j.dur, () => {
      c[j.id] = (c[j.id] || 0) + 1; if (j.daily !== false) s.job[j.id] = day();
      if (j.pay) { player.uang = (player.uang || 0) + j.pay; shop.showMoney(); }
      if (j.stat) fight.gain(j.stat, 3);
      if (j.hp) player.fx.hp = Math.max(1, Math.round(player.fx.hp * j.hp));
      if (!n.filler || REGION.has(keyOf(n.name))) addPts(n.name, j.hati || 60);
      let msg = j.msg || (j.done ? j.done(c) : `${j.t.split(' (')[0]} selesai${j.max ? ` (${c[j.id]}/${j.max})` : ''}.`);
      if (j.race) { const w = Math.random() < 0.25 + Math.min(10, player.stats?.kelincahan || 1) * 0.05; if (w) { c.seriMenang = (c.seriMenang || 0) + 1; player.uang += 150000; shop.showMoney(); msg = 'Juara seri liga! Hadiah Rp150.000.'; } else msg = 'Finis di belakang. Latihan lagi, coba seri berikutnya.'; }
      toast(msg + (j.pay ? ` +${rp(j.pay)}` : ''));
      for (const [reg, list] of MISI) if (list.some(([, k]) => k === j.id || (j.race && k === 'seriMenang')) && list.every(([, k, nn]) => (c[k] || 0) >= nn) && !s.done['misi_' + reg]) { s.done['misi_' + reg] = true; setTimeout(() => toast(`Misi wilayah ${reg} tuntas! Epilog baik terbuka.`), 2400); }
      poll();
    });
  }
  const rp = v => 'Rp' + v.toLocaleString('id-ID');

  let pollT = 0;
  return {
    BAB, ZONE_BAB, toggle, hati, ev, addPts, setWaktu(w) { W = w; },
    get bab() { return st().bab; },
    // target Aksi untuk NPC: tawaran kerja/misi (kalau sudah ngobrol hari ini)
    npcTarget(n) { const j = n && !n.mood && jobFor(n); return j ? { kind: 'act', label: `${j.t} · ${keyOf(n.name)}`, fn: () => doJob(n, j) } : null; },
    // dipanggil saat ngobrol: poin harian, tujuan bab, event hati. Kembalikan teks bubble pengganti (atau null)
    talk(n) {
      const s = st(), k = keyOf(n.name); if (!k) return null;
      if (s.talk[k] !== day()) { s.talk[k] = day(); if (!n.filler || REGION.has(k)) addPts(k, 10); }
      ev('talk', k);
      const E2 = EVENTS[k]; if (!E2) return null;
      for (const nn of [2, 4, 6, 8]) if (hati(k) >= nn && !s.ev[k + nn]) {
        s.ev[k + nn] = true; addPts(k, 50); const fx = E2[nn][2]; if (fx) { fl()[fx] = true; if (fx === 'bukuSaksi' && s.bab === 12) mark('b12kyai', 'Buku saksi hibah dari Kyai Mahfud'); }
        if (E.style.display === 'block') evQ.push([k, nn, E2[nn]]); else showEvent(k, nn, E2[nn]);
        return '♥ ' + E2[nn][0];
      }
      return null;
    },
    zoneOpen(z) { return { ok: zoneOk(z), bab: ZONE_BAB[z] }; },
    update(dt) {
      pollT -= dt; if (pollT > 0) return; pollT = 1;
      ev('area', player.area); poll();
      if (J.style.display === 'block' && tab !== 'hati') render();
    },
  };
}
