"""Membuat denah peta (kota & sekolah) untuk dokumen desain game SMA.

Jalankan:  python buat_peta.py   (butuh Pillow)
Hasil: peta_kota.png, peta_sekolah.png, peta_sekolah_lantai.png

Semua koordinat dalam PETAK (1 petak = 32 unit voxel, kira-kira 1 meter di dunia game).
Ubah daftar ZONA di bawah lalu jalankan ulang untuk menggambar ulang peta.
"""
from PIL import Image, ImageDraw, ImageFont
import os

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONTB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
if not os.path.exists(FONT):  # Windows / lainnya
    FONT, FONTB = "arial.ttf", "arialbd.ttf"

def font(size, bold=False):
    try:
        return ImageFont.truetype(FONTB if bold else FONT, size)
    except OSError:
        return ImageFont.load_default()

COL = {
    "rumput": (168, 196, 128), "jalan": (110, 112, 118), "jalan_kecil": (150, 148, 140),
    "air": (112, 168, 206), "rel": (90, 80, 70), "bukit": (138, 170, 104),
    "sekolah": (236, 214, 150), "rumah": (224, 176, 140), "pasar": (240, 190, 110),
    "toko": (200, 178, 222), "olahraga": (150, 210, 150), "geng": (196, 120, 110),
    "rival": (220, 140, 140), "proyek": (190, 190, 180), "ibadah": (176, 220, 214),
    "taman": (130, 186, 110), "fasilitas": (182, 204, 230), "bangunan": (230, 222, 206),
    "lapangan": (186, 214, 140), "rahasia": (160, 150, 170), "parkir": (196, 196, 196),
}

def label(d, box, text, size, bold=False, fill=(30, 30, 30)):
    x0, y0, x1, y1 = box
    f = font(size, bold)
    lines = text.split("\n")
    hs = [d.textbbox((0, 0), ln, font=f) for ln in lines]
    th = sum(b[3] - b[1] + 3 for b in hs)
    y = (y0 + y1) / 2 - th / 2
    for ln, b in zip(lines, hs):
        w = b[2] - b[0]
        d.text(((x0 + x1) / 2 - w / 2, y), ln, font=f, fill=fill)
        y += b[3] - b[1] + 3

def zone(d, s, x, y, w, h, kind, text, size=13, num=None, outline=(60, 60, 60)):
    box = (x * s, y * s, (x + w) * s, (y + h) * s)
    d.rectangle(box, fill=COL[kind], outline=outline, width=2)
    if num is not None:
        r = 11
        cx, cy = box[0] + 14, box[1] + 14
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(40, 40, 40))
        label(d, (cx - r, cy - r, cx + r, cy + r), str(num), 12, True, (255, 255, 255))
    label(d, box, text, size)

def road(d, s, x, y, w, h, kind="jalan", dash=True):
    d.rectangle((x * s, y * s, (x + w) * s, (y + h) * s), fill=COL[kind])
    if dash and kind == "jalan":
        if w > h:
            cy = (y + h / 2) * s
            for xx in range(int(x * s), int((x + w) * s), 24):
                d.line((xx, cy, xx + 12, cy), fill=(235, 235, 200), width=2)
        else:
            cx = (x + w / 2) * s
            for yy in range(int(y * s), int((y + h) * s), 24):
                d.line((cx, yy, cx, yy + 12), fill=(235, 235, 200), width=2)

def compass_and_scale(d, W, H, s, petak):
    d.polygon([(W - 50, 30), (W - 60, 60), (W - 40, 60)], fill=(30, 30, 30))
    d.text((W - 56, 62), "U", font=font(16, True), fill=(30, 30, 30))
    x0, y0 = W - 40 - petak * s, H - 40
    d.rectangle((x0, y0, x0 + petak * s, y0 + 8), fill=(30, 30, 30))
    d.text((x0, y0 + 12), f"{petak} petak", font=font(13), fill=(30, 30, 30))

def legend(d, x, y, items, title="Legenda"):
    d.rectangle((x, y, x + 230, y + 30 + 22 * len(items)), fill=(250, 250, 245), outline=(60, 60, 60), width=2)
    d.text((x + 10, y + 6), title, font=font(14, True), fill=(30, 30, 30))
    for i, (k, t) in enumerate(items):
        yy = y + 30 + 22 * i
        d.rectangle((x + 10, yy, x + 28, yy + 16), fill=COL[k], outline=(60, 60, 60))
        d.text((x + 36, yy), t, font=font(13), fill=(30, 30, 30))

# ------------------------------------------------------------------ KOTA
def peta_kota():
    s, GW, GH = 7, 220, 150   # 220 x 150 petak
    W, H = GW * s, GH * s + 60
    im = Image.new("RGB", (W, H), COL["rumput"])
    d = ImageDraw.Draw(im)
    # bukit utara
    d.rectangle((0, 0, W, 22 * s), fill=COL["bukit"])
    for i in range(0, W, 60):
        d.arc((i, 4 * s, i + 120, 30 * s), 180, 360, fill=(110, 140, 80), width=3)
    # sungai selatan (berkelok sederhana)
    pts = [(0, 128), (40, 124), (80, 130), (120, 126), (160, 132), (220, 128)]
    for (a, b), (c, e) in zip(pts, pts[1:]):
        d.line((a * s, b * s, c * s, e * s), fill=COL["air"], width=7 * s)
    # rel kereta barat
    d.rectangle((14 * s, 22 * s, 16 * s, 150 * s), fill=COL["rel"])
    for yy in range(22 * s, 150 * s, 10):
        d.line((12 * s, yy, 18 * s, yy), fill=(120, 105, 90), width=2)
    # jalan utama
    road(d, s, 0, 70, 220, 5)          # Jl. Raya Wirabumi (barat-timur)
    road(d, s, 104, 22, 5, 106)        # Jl. Merdeka (utara-selatan)
    road(d, s, 20, 40, 84, 3, "jalan_kecil", False)
    road(d, s, 109, 40, 100, 3, "jalan_kecil", False)
    road(d, s, 20, 100, 84, 3, "jalan_kecil", False)
    road(d, s, 109, 100, 100, 3, "jalan_kecil", False)
    road(d, s, 60, 22, 3, 106, "jalan_kecil", False)
    road(d, s, 160, 22, 3, 106, "jalan_kecil", False)
    # jalan lingkar balap (selatan, seberang sungai)
    d.rounded_rectangle((120 * s, 134 * s, 212 * s, 148 * s), radius=40, outline=COL["jalan"], width=3 * s)
    road(d, s, 104, 128, 5, 8)  # jembatan
    d.rectangle((103 * s, 125 * s, 110 * s, 135 * s), outline=(80, 60, 40), width=3)

    Z = [  # (x,y,w,h,jenis,teks,nomor)
        (64, 44, 38, 24, "sekolah", "SMA Negeri 3\nWirabumi\n(lihat peta sekolah)", 1),
        (22, 44, 36, 24, "rumah", "Perumahan\nGang Kenanga\n(rumah Om Darto)", 2),
        (22, 76, 20, 22, "rumah", "Warkop Simpang\n(properti utama)", 3),
        (44, 76, 14, 22, "rumah", "Kos-kosan\nBu Narti", 4),
        (64, 76, 38, 22, "pasar", "Pasar Wirabumi\n& terminal angkot", 5),
        (111, 44, 46, 24, "taman", "Alun-alun\n(pasar malam tiap\nSabtu malam)", 6),
        (111, 76, 22, 22, "ibadah", "Masjid Agung", 7),
        (135, 76, 22, 22, "fasilitas", "Puskesmas\n& kantor polisi", 8),
        (165, 44, 44, 24, "toko", "Ruko Pelita:\nwarnet, kafe, toko\nbuku, karaoke", 9),
        (165, 76, 20, 22, "toko", "Bengkel\nMas Fajar", 10),
        (187, 76, 22, 22, "toko", "Plaza Wirabumi\n(mall kecil,\nbioskop)", 11),
        (111, 104, 46, 20, "olahraga", "Lapangan bola\nkampung &\nGOR kota", 12),
        (165, 104, 22, 20, "rival", "STM Karya\nBangsa\n(sekolah rival)", 13),
        (189, 104, 26, 20, "proyek", "Lahan proyek\nPT Graha Megantara\n(konflik)", 14),
        (22, 104, 36, 20, "geng", "Gudang tua\nmarkas\n'Lampu Kota'", 15),
        (64, 104, 38, 20, "rumah", "Kampung\nBantaran\n(ojek pangkalan)", 16),
        (0, 30, 14, 26, "fasilitas", "Stasiun\nWirabumi", 17),
        (64, 4, 40, 16, "bukit", "Bukit Cemara:\njalur sepeda\nturunan", 18),
        (111, 4, 46, 16, "bukit", "Menara pemancar\n(tempat nongkrong\nmalam, rahasia)", 19),
        (165, 4, 44, 16, "bukit", "Kebun teh &\ndanau kecil\n(mancing, kencan)", 20),
        (22, 4, 36, 16, "bukit", "Perumahan elite\nBukit Asri\n(rumah Bram)", 21),
        (22, 26, 36, 12, "taman", "Taman kota\n& skatepark", 22),
        (165, 26, 44, 12, "olahraga", "Lapangan\nbasket umum", 23),
    ]
    for x, y, w, h, k, t, n in Z:
        zone(d, s, x, y, w, h, k, t, 12, n)
    label(d, (120 * s, 134 * s, 212 * s, 148 * s), "Jalan Lingkar Selatan: balap motor resmi (Minggu) / liar (malam)", 13, True)
    d.text((2 * s, 71 * s), "Jl. Raya Wirabumi", font=font(13, True), fill=(250, 250, 250))
    d.text((110 * s, 23 * s), "Jl. Merdeka", font=font(12, True), fill=(250, 250, 250))
    d.text((40 * s, 129 * s), "Kali Cendana", font=font(14, True), fill=(30, 70, 120))
    d.rectangle((0, GH * s, W, H), fill=(250, 250, 245))
    d.text((12, GH * s + 10), "PETA KOTA WIRABUMI (fiktif)  -  220 x 150 petak, 1 petak = 32 unit voxel. "
           "Angka di pojok = nomor lokasi di dokumen peta.md", font=font(15, True), fill=(30, 30, 30))
    d.text((12, GH * s + 34), "Abu tua bergaris putus = jalan raya. Abu muda = gang/jalan kampung (cukup untuk motor & sepeda).",
           font=font(13), fill=(60, 60, 60))
    compass_and_scale(d, W, GH * s, s, 20)
    im.save(os.path.join(HERE, "peta_kota.png"))

# ------------------------------------------------------------------ SEKOLAH
def peta_sekolah():
    s, GW, GH = 20, 76, 52      # 76 x 52 petak
    W, H = GW * s, GH * s + 70
    im = Image.new("RGB", (W, H), COL["rumput"])
    d = ImageDraw.Draw(im)
    # pagar keliling
    d.rectangle((2 * s, 2 * s, 74 * s, 50 * s), outline=(80, 80, 80), width=6)
    # jalan depan
    road(d, s, 0, 50, 76, 2)
    d.text((4 * s, 50 * s + 1), "Jl. Merdeka (depan sekolah, warung & penjual cilok)", font=font(13, True), fill=(250, 250, 250))
    # paving / koridor
    d.rectangle((33 * s, 36 * s, 41 * s, 50 * s), fill=COL["jalan_kecil"])   # jalan masuk
    d.rectangle((10 * s, 30 * s, 64 * s, 32 * s), fill=COL["jalan_kecil"])   # koridor tengah
    d.rectangle((10 * s, 10 * s, 12 * s, 32 * s), fill=COL["jalan_kecil"])
    d.rectangle((62 * s, 10 * s, 64 * s, 32 * s), fill=COL["jalan_kecil"])
    Z = [
        (32, 47, 10, 3, "fasilitas", "   Gerbang & pos satpam", 1),
        (4, 38, 26, 10, "parkir", "Parkiran motor siswa\n(modif, cuci motor, \nkumpul geng sebelum pulang)", 2),
        (44, 38, 14, 10, "parkir", "Parkiran guru", 3),
        (60, 38, 13, 10, "taman", "Taman depan\n& mading", 4),
        (24, 14, 26, 16, "lapangan", "Lapangan upacara\n(tiang bendera, upacara Senin,\nlomba 17-an, class meeting)", 5),
        (13, 4, 20, 9, "bangunan", "GEDUNG A (2 lt)\nkantor, guru, BK, UKS\nlt2: perpus, lab komputer", 6),
        (35, 4, 26, 9, "bangunan", "GEDUNG B (3 lt): ruang kelas\nlt1 kelas X, lt2 XI, lt3 XII\natap = spot rahasia", 7),
        (4, 10, 6, 20, "bangunan", "GED. C\n2 lt\n\nlab IPA\nseni\nmusik\nOSIS", 8),
        (65, 10, 9, 12, "bangunan", "Aula / GOR\n(pentas seni,\nbasket indoor,\nwisuda)", 9),
        (65, 23, 9, 7, "ibadah", "Musala", 10),
        (52, 14, 9, 16, "olahraga", "Lapangan\nbasket &\nfutsal", 11),
        (13, 33, 19, 4, "pasar", "Deretan kantin (6 lapak) & koperasi", 12),
        (42, 33, 20, 4, "bangunan", "Toilet - gudang olahraga - ruang piket", 13),
        (62, 4, 12, 5, "taman", "Kebun & greenhouse", 14),
        (2, 2, 9, 7, "rahasia", "Gedung lama\n(terkunci,\nmisteri)", 15),
        (13, 14, 9, 15, "taman", "Pohon beringin\n& bangku\n(tempat\nnembak /\nnongkrong)", 16),
    ]
    for x, y, w, h, k, t, n in Z:
        zone(d, s, x, y, w, h, k, t, 13, n)
    # jalur bolos & warung belakang
    d.rectangle((24 * s, 0, 34 * s, 2 * s), fill=COL["geng"], outline=(60, 60, 60))
    label(d, (24 * s, 0, 34 * s, 2 * s), "Warung belakang Mak Iyah", 12)
    d.line((30 * s, 2 * s, 30 * s, 4 * s), fill=(200, 40, 40), width=4)
    d.text((22.5 * s, 2.2 * s), "loncat pagar\n(bolos)", font=font(11, True), fill=(160, 20, 20))
    d.rectangle((0, GH * s, W, H), fill=(250, 250, 245))
    d.text((12, GH * s + 12), "DENAH SMA NEGERI 3 WIRABUMI (fiktif)  -  76 x 52 petak, 1 petak = 32 unit voxel", font=font(17, True), fill=(30, 30, 30))
    d.text((12, GH * s + 40), "Abu muda = koridor/paving. Ungu = area tersembunyi. Garis merah = jalur bolos. Interior tiap gedung: peta_sekolah_lantai.png",
           font=font(14), fill=(60, 60, 60))
    compass_and_scale(d, W, GH * s - 50, s, 5)
    im.save(os.path.join(HERE, "peta_sekolah.png"))

# ------------------------------------------------------------------ LANTAI
def peta_lantai():
    s = 18
    K = "jalan_kecil"
    floors = [
        ("Gedung A - Lantai 1", [
            (0, 0, 4, 5, "fasilitas", "Kepsek"), (4, 0, 4, 5, "fasilitas", "TU"),
            (8, 0, 6, 5, "fasilitas", "Ruang\nguru"), (14, 0, 3, 5, "fasilitas", "BK"),
            (17, 0, 3, 5, "olahraga", "UKS"), (0, 5, 20, 3, K, "koridor (tangga di ujung barat)")]),
        ("Gedung A - Lantai 2", [
            (0, 0, 10, 5, "sekolah", "Perpustakaan\n(belajar = +nilai)"), (10, 0, 6, 5, "toko", "Lab\nkomputer"),
            (16, 0, 4, 5, "rahasia", "Arsip\n(kunci)"), (0, 5, 20, 3, K, "koridor")]),
        ("Gedung B - Lt1 kelas X, Lt2 XI, Lt3 XII", [
            (0, 0, 6, 5, "sekolah", "Kelas\n1"), (6, 0, 6, 5, "sekolah", "Kelas\n2"),
            (12, 0, 6, 5, "sekolah", "Kelas\n3"), (18, 0, 4, 5, "fasilitas", "WC"),
            (0, 5, 22, 3, K, "koridor/balkon, tangga di dua ujung")]),
        ("Gedung C - Lantai 1 (lab)", [
            (0, 0, 7, 5, "olahraga", "Lab\nfisika"), (7, 0, 7, 5, "olahraga", "Lab\nkimia"),
            (14, 0, 6, 5, "olahraga", "Lab\nbiologi"), (0, 5, 20, 3, K, "koridor")]),
        ("Gedung C - Lantai 2", [
            (0, 0, 7, 5, "toko", "Ruang\nseni"), (7, 0, 7, 5, "toko", "Studio\nmusik"),
            (14, 0, 6, 5, "pasar", "Ruang\nOSIS"), (0, 5, 20, 3, K, "koridor")]),
        ("Isi satu ruang kelas (6 x 5 petak)", "KELAS"),
    ]
    PW, PH = 23 * s, 9 * s
    W = 3 * (PW + 30) + 20
    H = 2 * (PH + 50) + 90
    im = Image.new("RGB", (W, H), (250, 250, 245))
    d = ImageDraw.Draw(im)
    for i, (title, rooms) in enumerate(floors):
        ox = 20 + (i % 3) * (PW + 30)
        oy = 44 + (i // 3) * (PH + 50)
        d.text((ox, oy - 28), title, font=font(15, True), fill=(30, 30, 30))
        if rooms == "KELAS":
            c = s * 1.6   # diperbesar supaya terbaca
            d.rectangle((ox, oy, ox + 6 * c, oy + 5 * c), fill=COL["sekolah"], outline=(60, 60, 60), width=2)
            d.rectangle((ox + 0.3 * c, oy + 0.1 * c, ox + 3.5 * c, oy + 0.35 * c), fill=(40, 70, 50))  # papan tulis
            d.rectangle((ox + 4.2 * c, oy + 0.6 * c, ox + 5.4 * c, oy + 1.1 * c), fill=(150, 100, 60))  # meja guru
            for r in range(4):
                for k in range(4):
                    x = ox + (0.4 + k * 1.3) * c
                    y = oy + (1.5 + r * 0.85) * c
                    d.rectangle((x, y, x + 0.9 * c, y + 0.45 * c), fill=(170, 120, 75), outline=(90, 60, 40))
            d.rectangle((ox + 5.6 * c, oy + 4.2 * c, ox + 6 * c, oy + 4.9 * c), fill=(110, 80, 50))  # pintu
            d.text((ox + 6 * c + 10, oy), "papan tulis (hijau)\nmeja guru (cokelat tua)\n16 meja siswa\npintu ke koridor\n(kanan bawah)\n\nmini game pelajaran\ndimulai saat pemain\nduduk di mejanya",
                   font=font(12), fill=(40, 40, 40))
            continue
        for x, y, w, h, k, t in rooms:
            box = (ox + x * s, oy + y * s, ox + (x + w) * s, oy + (y + h) * s)
            d.rectangle(box, fill=COL[k], outline=(60, 60, 60), width=2)
            label(d, box, t, 12)
    d.text((20, H - 52), "Ruang kelas di Gedung B layout-nya sama di tiap lantai: buat sekali, pakai ulang. Koridor lantai atas = balkon menghadap lapangan upacara.",
           font=font(13), fill=(60, 60, 60))
    d.text((20, H - 30), "Skala: 1 petak = 32 unit voxel. Pintu 44, dinding 52 unit (sama dengan skala bangunan di demo sprite-stacking).",
           font=font(13), fill=(60, 60, 60))
    im.save(os.path.join(HERE, "peta_sekolah_lantai.png"))

if __name__ == "__main__":
    peta_kota(); peta_sekolah(); peta_lantai()
    print("selesai")
