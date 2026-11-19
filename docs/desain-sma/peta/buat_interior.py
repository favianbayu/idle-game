"""Denah interior bangunan yang bisa dimasuki (sekolah & kota).

Jalankan:  python buat_interior.py   (butuh Pillow)
Hasil: peta/interior/*.png

Koordinat dalam PETAK (1 petak = 32 unit voxel). Interior adalah SCENE TERPISAH, jadi boleh lebih luas
dari ukuran luar bangunan. Grid tipis = 1 petak.
"""
from PIL import Image, ImageDraw, ImageFont
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "interior")
os.makedirs(OUT, exist_ok=True)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONTB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
if not os.path.exists(FONT):
    FONT, FONTB = "arial.ttf", "arialbd.ttf"

def font(size, bold=False):
    try:
        return ImageFont.truetype(FONTB if bold else FONT, size)
    except OSError:
        return ImageFont.load_default()

ROOM = {  # warna lantai per jenis ruang
    "kelas": (238, 226, 196), "koridor": (214, 210, 196), "tangga": (190, 184, 170), "kantor": (226, 214, 232),
    "lab": (204, 226, 236), "seni": (246, 214, 196), "olahraga": (196, 222, 176), "kantin": (248, 220, 168),
    "toilet": (206, 228, 240), "gudang": (200, 190, 176), "rahasia": (184, 172, 196), "ibadah": (200, 232, 222),
    "rumah": (236, 206, 170), "warung": (240, 200, 140), "bengkel": (178, 178, 182), "toko": (230, 216, 240),
    "luar": (186, 210, 150), "balkon": (222, 218, 206),
}
FURN = {
    "meja": (150, 104, 66), "kursi": (110, 80, 52), "papan": (52, 96, 70), "rak": (122, 86, 60), "kasur": (236, 236, 244),
    "lemari": (128, 96, 72), "logam": (150, 156, 164), "air": (120, 176, 214), "hijau": (96, 150, 90), "merah": (186, 72, 60),
    "kuning": (226, 186, 70), "hitam": (60, 58, 62), "kain": (170, 120, 170), "sofa": (150, 70, 60), "putih": (246, 246, 240),
}
WALL = (58, 48, 42)
DOOR = (196, 120, 60)

class Plan:
    def __init__(self, name, w, h, s=20, title=""):
        self.name, self.w, self.h, self.s = name, w, h, s
        self.m = 40
        self.top = 56
        self.im = Image.new("RGB", (max(int(w * s + 2 * self.m), 640), int(h * s + self.top + 76)), (250, 248, 242))
        self.d = ImageDraw.Draw(self.im)
        self.d.text((self.m, 14), title or name, font=font(20, True), fill=(30, 30, 30))
        self.d.text((self.m + 2, 38), f"{w} x {h} petak", font=font(13), fill=(90, 90, 90))
        self.doors = []

    def P(self, x, y):
        return (self.m + x * self.s, self.top + y * self.s)

    def room(self, x, y, w, h, kind, text="", size=13, wall=3):
        x0, y0 = self.P(x, y); x1, y1 = self.P(x + w, y + h)
        self.d.rectangle((x0, y0, x1, y1), fill=ROOM[kind])
        for gx in range(int(x) + 1, int(x + w)):
            X = self.P(gx, 0)[0]; self.d.line((X, y0, X, y1), fill=tuple(c - 14 for c in ROOM[kind]), width=1)
        for gy in range(int(y) + 1, int(y + h)):
            Y = self.P(0, gy)[1]; self.d.line((x0, Y, x1, Y), fill=tuple(c - 14 for c in ROOM[kind]), width=1)
        self.d.rectangle((x0, y0, x1, y1), outline=WALL, width=wall)
        if text:
            self.label(x, y, w, h, text, size, top=True)

    def label(self, x, y, w, h, text, size=13, top=False, bold=True, fill=(30, 30, 30)):
        f = font(size, bold)
        lines = text.split("\n")
        x0, y0 = self.P(x, y); x1, y1 = self.P(x + w, y + h)
        bbs = [self.d.textbbox((0, 0), ln, font=f) for ln in lines]
        th = sum(b[3] - b[1] + 2 for b in bbs)
        yy = y0 + 4 if top else (y0 + y1) / 2 - th / 2
        for ln, b in zip(lines, bbs):
            tw = b[2] - b[0]
            tx = (x0 + x1) / 2 - tw / 2
            if top:
                self.d.rectangle((tx - 3, yy - 1, tx + tw + 3, yy + b[3] - b[1] + 3), fill=(250, 248, 242))
            self.d.text((tx, yy), ln, font=f, fill=fill)
            yy += b[3] - b[1] + 2

    def f(self, x, y, w, h, kind="meja", text="", size=10):
        x0, y0 = self.P(x, y); x1, y1 = self.P(x + w, y + h)
        self.d.rectangle((x0, y0, x1, y1), fill=FURN[kind], outline=(40, 34, 30), width=1)
        if text:
            light = sum(FURN[kind]) < 380
            self.label(x, y, w, h, text, size, bold=False, fill=(250, 250, 250) if light else (30, 30, 30))

    def door(self, x, y, length=1.5, vertical=False, text=""):
        # celah pintu di dinding
        if vertical:
            x0, y0 = self.P(x - 0.15, y); x1, y1 = self.P(x + 0.15, y + length)
        else:
            x0, y0 = self.P(x, y - 0.15); x1, y1 = self.P(x + length, y + 0.15)
        self.d.rectangle((x0, y0, x1, y1), fill=DOOR)
        if text:
            self.d.text((x1 + 3, y0 - 4), text, font=font(10, True), fill=(140, 70, 30))

    def mark(self, x, y, text, col=(200, 50, 50)):
        cx, cy = self.P(x, y); r = 9
        self.d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=col)
        tb = self.d.textbbox((0, 0), text, font=font(10, True))
        self.d.text((cx - (tb[2] - tb[0]) / 2, cy - 7), text, font=font(10, True), fill=(255, 255, 255))

    def stairs(self, x, y, w, h, text="Tangga", dir_v=True):
        self.room(x, y, w, h, "tangga")
        n = int((h if dir_v else w) * 2)
        for i in range(1, n):
            if dir_v:
                Y = self.P(0, y + i * h / n)[1]; self.d.line((self.P(x, 0)[0] + 3, Y, self.P(x + w, 0)[0] - 3, Y), fill=(120, 112, 100), width=1)
            else:
                X = self.P(x + i * w / n, 0)[0]; self.d.line((X, self.P(0, y)[1] + 3, X, self.P(0, y + h)[1] - 3), fill=(120, 112, 100), width=1)
        self.label(x, y, w, h, text, 11)

    def note(self, text):
        f = font(12); maxw = self.im.width - 2 * self.m
        lines, cur = [], ""
        for w in text.split():
            t = (cur + " " + w).strip()
            if self.d.textbbox((0, 0), t, font=f)[2] > maxw:
                lines.append(cur); cur = w
            else:
                cur = t
        lines.append(cur)
        y = self.top + self.h * self.s + 12
        for ln in lines[:3]:
            self.d.text((self.m, y), ln, font=f, fill=(70, 70, 70)); y += 17
        X0 = self.im.width - self.m - 5 * self.s
        self.d.rectangle((X0, 22, X0 + 5 * self.s, 28), fill=(30, 30, 30))
        self.d.text((X0, 31), "5 petak", font=font(11), fill=(30, 30, 30))

    def save(self):
        self.im.save(os.path.join(OUT, self.name + ".png"))


def kelas_isi(p, x, y, nama, detail=False):
    """Ruang kelas 12 x 10: papan di utara, 2 pintu di selatan, 4 baris x 3 kolom meja ganda."""
    p.room(x, y, 12, 10, "kelas")
    if nama:
        p.label(x + 3, y + 1.0, 8.4, 1.4, nama, 12)
    p.f(x + 3, y + 0.15, 6, 0.35, "papan")
    p.f(x + 0.6, y + 1.3, 2, 1, "meja", "guru" if detail else "")
    for c, cx in enumerate((1.2, 5.0, 8.8)):
        for r in range(4):
            yy = y + 3.0 + r * 1.6
            p.f(x + cx, yy, 2, 0.8, "meja")
            p.f(x + cx + 0.2, yy + 0.85, 0.6, 0.45, "kursi"); p.f(x + cx + 1.2, yy + 0.85, 0.6, 0.45, "kursi")
    p.f(x + 11.2, y + 3, 0.6, 4, "lemari", "")
    p.f(x + 0.2, y + 8.8, 1.2, 0.8, "rak", "")
    p.door(x + 0.8, y + 10); p.door(x + 9.7, y + 10)


def gedung_b():
    p = Plan("sekolah_gedung_b", 48, 14, 20, "Gedung B: lantai kelas (Lt1 kelas X, Lt2 XI, Lt3 XII)")
    p.stairs(0, 0, 4, 10, "Tangga\nbarat")
    for i, n in enumerate(("X-1 / XI-1 / XII-1", "X-2 / XI-2 / XII-2", "X-3 / XI-3 / XII-3")):
        kelas_isi(p, 4 + 12 * i, 0, n)
    p.room(40, 0, 4, 10, "toilet", "Toilet\n(lt1: ruang\npiket)", 11)
    p.door(40.8, 10, 1.4)
    p.stairs(44, 0, 4, 10, "Tangga\ntimur\n(lt3: ke\natap)")
    p.room(0, 10, 48, 4, "balkon", "")
    p.label(0, 11.6, 48, 1.6, "Koridor 4 petak (lt2-3 = balkon berpagar ke lapangan upacara): cukup lebar untuk lari, kejar-kejaran & berantem", 12, bold=False)
    for xx in range(0, 48, 6):
        p.f(xx + 2.5, 13.55, 1, 0.3, "logam")
    p.door(22, 14, 4)
    p.mark(10, 10.9, "1"); p.mark(28, 10.9, "2"); p.mark(46, 10.9, "3")
    p.note("1 bangku koridor & mading kelas. 2 tempat sampah 3 warna. 3 tangga darurat ke atap (lt3, digembok). Celah oranye bawah = pintu utama lt1 ke lapangan (lt2-3: pagar balkon).")
    p.save()


def ruang_kelas():
    p = Plan("sekolah_ruang_kelas_x2", 12, 10, 52, "Ruang kelas X-2 (kelas pemain), satu model untuk 9 kelas")
    kelas_isi(p, 0, 0, "", detail=True)
    seats = {(1, 0): "Nadia", (1, 1): "Tegar", (2, 2): "Pemain", (3, 2): "Bimo", (0, 3): "Rizal", (1, 3): "Jojo",
             (4, 1): "Laras", (5, 1): "", (2, 3): "", }
    cols = (1.2, 5.0, 8.8)
    for (c2, r), name in seats.items():
        if not name:
            continue
        c, side = divmod(c2, 2)
        x = cols[c] + (0.2 if side == 0 else 1.2) + 0.3
        y = 3.0 + r * 1.6 + 1.1
        p.mark(x, y, name[0], (200, 60, 60) if name == "Pemain" else (70, 90, 160))
    p.label(3, 0.5, 6, 0.6, "papan tulis + jam + foto presiden", 11, bold=False)
    p.note("Merah = kursi pemain (baris 3, sebelah Bimo). Biru: N Nadia, T Tegar, R Rizal, J Jojo, L Laras. Lorong 1.8 petak = cukup untuk 2 tokoh berpapasan.")
    p.save()


def gedung_a():
    p = Plan("sekolah_gedung_a_lt1", 56, 14, 18, "Gedung A lantai 1: kantor")
    p.stairs(0, 0, 4, 10, "Tangga")
    p.room(4, 0, 7, 10, "kantor", "UKS", 13)
    for i in range(2):
        p.f(4.6 + i * 3.2, 1.6, 2.2, 1.1, "kasur", "kasur")
    p.f(9.4, 6, 1.2, 2, "lemari", "obat"); p.f(5, 7.5, 2, 1, "meja")
    p.door(6.5, 10)
    p.room(11, 0, 7, 10, "kantor", "BK (Pak Wawan)", 13)
    p.f(13, 2, 3, 1.2, "meja", "meja BK"); p.f(13.8, 3.4, 1.4, 0.6, "kursi", "")
    p.f(11.4, 6, 2, 3, "lemari", "berkas\npelang-\ngaran"); p.f(15, 7.8, 2.6, 0.8, "kursi", "bangku hukuman")
    p.door(14, 10)
    p.room(18, 0, 6, 10, "kantor", "Tata Usaha", 12)
    p.f(18.6, 2, 4.6, 1, "meja", "loket"); p.f(19, 6, 1.6, 2.6, "lemari"); p.f(21.4, 6, 1.6, 2.6, "lemari")
    p.door(20.2, 10)
    p.room(24, 0, 8, 14, "koridor", "Lobi", 14)
    p.f(25, 1.2, 6, 1, "lemari", "lemari piala"); p.f(25, 5, 1, 4, "papan", ""); p.f(30, 5, 1, 4, "kain", "")
    p.label(24, 5, 8, 4, "struktur\norganisasi\n& buku tamu", 10, bold=False)
    p.door(26.5, 14, 3, text="pintu utama")
    p.room(32, 0, 14, 10, "kantor", "Ruang guru", 14)
    for r in range(3):
        for c in range(4):
            p.f(33 + c * 3.2, 2 + r * 2.4, 2.4, 1.1, "meja")
    p.f(44.4, 2, 1.2, 6, "rak", "loker\nkunci")
    p.door(38, 10)
    p.room(46, 0, 6, 10, "kantor", "Kepala\nsekolah", 12)
    p.f(47, 2.2, 3.6, 1.2, "meja", "Bu Hartini"); p.f(47, 6, 4, 1.4, "sofa", "tamu")
    p.door(48.2, 10)
    p.stairs(52, 0, 4, 10, "Tangga")
    p.room(0, 10, 24, 4, "koridor"); p.room(32, 10, 24, 4, "koridor")
    p.label(0, 10, 24, 4, "Koridor (Pak Wawan patroli)", 11, bold=False)
    p.mark(44.9, 1.4, "K"); p.mark(13, 8.2, "H")
    p.note("K = loker kunci (misi curi kunci atap/Gedung Lama)   H = bangku hukuman BK (pemain duduk menunggu dipanggil)")
    p.save()

    p = Plan("sekolah_gedung_a_lt2", 56, 14, 18, "Gedung A lantai 2: perpustakaan & arsip")
    p.stairs(0, 0, 4, 10, "Tangga")
    p.room(4, 0, 20, 10, "kantor", "Perpustakaan", 14)
    for r in range(4):
        p.f(5, 1.4 + r * 2.1, 7, 0.7, "rak")
    for c in range(2):
        for r in range(2):
            p.f(14 + c * 4.6, 2.5 + r * 3.3, 3.2, 1.6, "meja", "baca")
    p.f(21.6, 7.2, 2, 2.2, "meja", "petugas"); p.f(4.3, 9.0, 3, 0.7, "hijau", "pojok jendela")
    p.door(10, 10); p.mark(5.6, 9.3, "N")
    p.room(24, 0, 12, 10, "lab", "Lab komputer", 13)
    for r in range(3):
        for c in range(3):
            p.f(25 + c * 3.7, 2 + r * 2.5, 3, 1, "logam", "PC")
    p.door(29, 10)
    p.room(36, 0, 8, 10, "kantor", "Ruang rapat", 12)
    p.f(37.4, 3, 5, 3, "meja", "meja\nrapat")
    p.door(39, 10)
    p.room(44, 0, 8, 10, "rahasia", "Arsip\n(terkunci)", 12)
    for r in range(3):
        p.f(44.6, 2.4 + r * 2.3, 6.6, 0.8, "lemari")
    p.door(46.5, 10, text="gembok"); p.mark(48, 9, "A")
    p.stairs(52, 0, 4, 10, "Tangga")
    p.room(0, 10, 56, 4, "balkon", "Balkon menghadap lapangan upacara", 11)
    p.note("N = kursi favorit Nadia   A = berkas sertifikat tanah palsu (Bab 12)")
    p.save()


def gedung_c():
    p = Plan("sekolah_gedung_c_lt1", 50, 14, 18, "Gedung C lantai 1: laboratorium")
    p.stairs(0, 0, 4, 10, "Tangga")
    for i, (nm, k) in enumerate((("Lab Fisika", "lab"), ("Lab Kimia", "lab"))):
        x = 4 + 12 * i
        p.room(x, 0, 12, 10, k, nm, 13)
        for r in range(3):
            p.f(x + 1.5, 2.2 + r * 2.4, 9, 1, "putih", "meja praktik")
        p.f(x + 0.3, 0.6, 0.8, 9, "lemari"); p.door(x + 5, 10)
    p.f(17.5, 0.5, 2, 0.8, "air", "wastafel"); p.f(25, 0.5, 2, 0.8, "air", "lemari asam")
    p.room(28, 0, 6, 10, "gudang", "Gudang alat\n& persiapan", 11)
    p.f(28.4, 3, 1, 6, "rak"); p.f(32.6, 3, 1, 6, "rak"); p.door(30, 10)
    p.room(34, 0, 12, 10, "lab", "Lab Biologi", 13)
    for r in range(2):
        for c in range(3):
            p.f(35.2 + c * 3.6, 2.4 + r * 3.5, 3, 1.6, "putih")
    p.f(44.6, 1.6, 1, 2, "putih", "rangka"); p.f(44.4, 5, 1.2, 3, "air", "akuarium")
    p.door(39, 10)
    p.stairs(46, 0, 4, 10, "Tangga")
    p.room(0, 10, 50, 4, "koridor", "Koridor (pintu samping ke kebun & greenhouse di ujung timur)", 11)
    p.mark(20, 5, "!")
    p.note("! = meja Pak Gunadi: tempat mini game racik (Kimia) & resep bom asap")
    p.save()

    p = Plan("sekolah_gedung_c_lt2", 50, 14, 18, "Gedung C lantai 2: seni, musik, OSIS")
    p.stairs(0, 0, 4, 10, "Tangga")
    p.room(4, 0, 12, 10, "seni", "Ruang seni rupa", 13)
    for r in range(2):
        for c in range(3):
            p.f(5.2 + c * 3.6, 2.4 + r * 3.6, 1.4, 1.4, "kain", "")
    p.f(4.4, 8.6, 11, 1, "rak", "rak karya")
    p.door(9, 10)
    p.room(16, 0, 10, 10, "seni", "Studio musik", 13)
    p.f(17, 1.8, 3, 2.4, "hitam", "drum"); p.f(21, 2, 2.2, 1, "hitam", "keyboard"); p.f(17, 6, 1.6, 0.8, "merah", "amp")
    p.room(22, 6, 4, 4, "rahasia", "rekam", 10)
    p.door(19, 10, text="pintu karpet"); p.mark(20, 5, "S")
    p.room(26, 0, 10, 10, "kantor", "Ruang OSIS", 13)
    p.f(28, 3, 6, 2.4, "meja", "meja rapat"); p.f(26.4, 7.5, 3, 2, "papan", "jadwal"); p.f(32, 7.6, 3.6, 2, "lemari", "arsip OSIS")
    p.door(30, 10)
    p.room(36, 0, 10, 10, "kantor", "Jurnalistik &\nmading", 12)
    p.f(37, 2.4, 3, 1.2, "meja", "PC edit"); p.f(41, 2.4, 3.6, 1.2, "meja"); p.f(37, 6.6, 8, 2.4, "kuning", "papan foto")
    p.door(40, 10); p.mark(43, 4, "J")
    p.stairs(46, 0, 4, 10, "Tangga")
    p.room(0, 10, 50, 4, "balkon", "Balkon", 11)
    p.note("S = tempat duduk Sekar   J = meja Jojo (peta gosip & misi foto)")
    p.save()


def aula():
    p = Plan("sekolah_aula_gor", 34, 26, 20, "Aula / GOR")
    p.room(0, 0, 34, 26, "kelas", "")
    p.room(8, 0.4, 18, 5, "seni", "Panggung (pensi, wisuda, band)", 12)
    p.f(9, 0.6, 1, 1, "hitam"); p.f(24, 0.6, 1, 1, "hitam")
    p.room(5, 6.5, 24, 14, "olahraga", "")
    X0, Y0 = p.P(5, 6.5); X1, Y1 = p.P(29, 20.5)
    p.d.line(((X0 + X1) / 2, Y0, (X0 + X1) / 2, Y1), fill=(250, 250, 250), width=2)
    r = 2 * p.s
    p.d.ellipse(((X0 + X1) / 2 - r, (Y0 + Y1) / 2 - r, (X0 + X1) / 2 + r, (Y0 + Y1) / 2 + r), outline=(250, 250, 250), width=2)
    p.f(5.3, 12.5, 0.4, 2, "merah"); p.f(28.3, 12.5, 0.4, 2, "merah")
    p.label(5, 6.5, 24, 14, "Lapangan basket/futsal 24 x 14\n(class meeting, latihan, kursi saat acara)", 13, bold=False)
    p.f(0.5, 6.5, 3.6, 14, "kursi", "tribun\nbarat"); p.f(29.9, 6.5, 3.6, 14, "kursi", "tribun\ntimur")
    p.room(0, 21.5, 6, 4.5, "toilet", "Ganti\nputra", 10); p.room(28, 21.5, 6, 4.5, "toilet", "Ganti\nputri", 10)
    p.room(6, 21.5, 7, 4.5, "gudang", "Gudang\nalat", 10)
    p.door(15, 26, 4, text="pintu utama"); p.door(0, 4, 2, vertical=True); p.door(34, 4, 2, vertical=True, text="samping")
    p.door(9, 21.5, 1.5)
    p.note("Saat pensi: lapangan diisi kursi, kamera fokus ke panggung. Lebar 34 petak = muat 60+ NPC.")
    p.save()


def kantin():
    p = Plan("sekolah_kantin", 30, 16, 20, "Kantin & koperasi")
    p.room(0, 0, 30, 16, "kantin", "")
    names = ["Bakso\nMas Teguh", "Nasi\nUduk", "Gorengan", "Mi Ayam", "Es Teh\n& Jus", "Koperasi"]
    for i, n in enumerate(names):
        p.room(0.5 + i * 4.8, 0.4, 4.4, 4, "warung" if i < 5 else "toko", n, 11)
        p.f(0.9 + i * 4.8, 3.4, 3.6, 0.8, "meja")
    for r in range(3):
        for c in range(3):
            p.f(1.5 + c * 9.5, 6.4 + r * 3, 7, 1, "meja")
            p.f(1.5 + c * 9.5, 5.8 + r * 3, 7, 0.4, "kursi"); p.f(1.5 + c * 9.5, 7.5 + r * 3, 7, 0.4, "kursi")
    p.f(20.5, 5.6, 8, 2.4, "logam", "meja pojok (geng Bram)")
    p.f(0.2, 14.6, 2, 1, "air", "cuci"); p.f(27, 14.6, 2.6, 1, "hijau", "sampah")
    p.door(12, 16, 6, text="terbuka ke lapangan")
    p.mark(24.5, 9.4, "B"); p.mark(5, 10, "P")
    p.note("B = meja pojok geng Bram (event Sasha 6 hati)  P = meja pemain & Bimo. Lapak 5 bisa dibeli pemain di kelas XI.")
    p.save()


def musala_toilet():
    p = Plan("sekolah_musala_toilet", 44, 16, 18, "Musala sekolah & blok toilet / gudang olahraga")
    p.room(0, 0, 14, 11, "ibadah", "Musala", 13)
    p.f(6, 0.3, 2, 1.2, "hijau", "mihrab"); p.f(0.6, 9.4, 12.8, 1, "rak", "rak sandal")
    p.room(0, 11, 14, 5, "toilet", "Tempat wudu", 11)
    for i in range(5):
        p.f(1 + i * 2.6, 14.6, 1, 0.8, "air")
    p.door(6, 11, 2)
    p.room(18, 0, 26, 8, "gudang", "", 12)
    p.room(18, 0, 5, 8, "toilet", "Toilet\nputra", 10)
    p.room(23, 0, 5, 8, "toilet", "Toilet\nputri", 10)
    p.room(28, 0, 9, 8, "gudang", "Gudang olahraga", 11)
    p.f(28.5, 2.5, 3, 2, "merah", "matras"); p.f(32.5, 2.5, 3, 1.2, "kuning", "bola"); p.f(28.5, 6, 8, 0.8, "rak")
    p.room(37, 0, 7, 8, "gudang", "Ruang piket", 11)
    for i in range(6):
        p.f(37.6 + i, 6, 0.3, 1.6, "kuning")
    p.label(37, 4, 7, 2, "sapu berderet", 10, bold=False)
    for x in (20, 25, 32, 40):
        p.door(x, 8)
    p.mark(30.5, 6.2, "S")
    p.note("S = celah di balik matras: tempat sembunyi saat bolos. Sapu di ruang piket = senjata improvisasi & alat hukuman.")
    p.save()


def gedung_lama():
    p = Plan("sekolah_gedung_lama", 44, 15, 18, "Gedung Lama: lantai 1 (kiri) & loteng (kanan)")
    p.room(0, 0, 20, 14, "rahasia", "", 12)
    p.room(0, 0, 11, 9, "rahasia", "Kelas tua\n(bangku kayu 1960-an)", 11)
    for r in range(3):
        for c in range(3):
            p.f(1 + c * 3.4, 3 + r * 1.9, 2.4, 0.8, "meja")
    p.room(11, 0, 9, 6, "rahasia", "Kantor kepala\nsekolah lama", 11)
    p.f(12, 3, 3, 1, "meja"); p.f(17.6, 1.6, 2, 3.6, "lemari", "lemari\n(geser)")
    p.room(11, 6, 9, 8, "koridor", "Lorong &\nruang tunggu", 11)
    p.room(0, 9, 11, 5, "gudang", "Gudang bangku rusak", 10)
    p.door(15, 14, 2.5, text="pintu jati (gembok)"); p.door(11, 3, 1.5, vertical=True); p.door(6, 9, 1.5); p.door(14, 6, 1.5)
    p.stairs(18.2, 1.4, 1.6, 3.4, "", dir_v=True)
    p.mark(19, 3.1, "T")
    p.room(24, 0, 20, 10, "rahasia", "Loteng", 13)
    p.f(31.5, 3, 5, 4, "kuning", "LONCENG\nPERTAMA"); p.f(25, 7.4, 3, 2, "lemari", "peti\nakta")
    p.f(39, 1.6, 4, 2, "meja", "bangku\ntumpuk"); p.f(39, 6.6, 4, 2.2, "kain", "bendera\nlama")
    p.stairs(24.4, 1, 2, 2, "")
    p.mark(26.5, 8.4, "A"); p.mark(34, 5, "L")
    p.note("T = tangga loteng tersembunyi di balik lemari kantor (geser = mini game dorong).  A = akta tanah.  L = lonceng: dibunyikan di ending.")
    p.save()


# ------------------------------- KOTA ---------------------------------
def rumah_warkop():
    p = Plan("kota_rumah_om_darto_warkop", 30, 16, 22, "Rumah Om Darto + Warkop Simpang (contoh level 3)")
    p.room(0, 0, 14, 16, "rumah", "")
    p.room(0, 0, 6, 6, "rumah", "Kamar Om", 11); p.f(0.5, 1.5, 3, 2, "kasur"); p.door(3, 6)
    p.room(6, 0, 5, 6, "rumah", "Kamar Cici", 10); p.f(6.5, 1.5, 2.4, 1.6, "kasur"); p.f(9, 4, 1.6, 1.4, "kain", "boneka"); p.door(8, 6)
    p.room(11, 0, 3, 6, "toilet", "KM", 10); p.door(12, 6, 1)
    p.room(0, 6, 10, 6, "rumah", "Ruang tengah", 11); p.f(1, 8, 3, 1.4, "sofa", "kursi"); p.f(6, 7, 2.4, 0.6, "hitam", "TV")
    p.room(10, 6, 4, 6, "rumah", "Dapur", 10); p.f(10.4, 6.4, 3.2, 0.9, "logam", "kompor")
    p.room(0, 12, 6, 4, "rumah", "Kamar\npemain", 10); p.f(0.4, 12.6, 2.4, 1.4, "kasur"); p.f(3.6, 14.5, 2, 1, "meja", "meja")
    p.mark(5, 13, "P"); p.door(6, 13, 1.4, vertical=True)
    p.room(6, 12, 8, 4, "luar", "Lorong samping\n& jemuran", 10)
    p.door(14, 8, 2, vertical=True, text="pintu ke warkop")
    p.room(14, 0, 16, 16, "warung", "Warkop Simpang", 13)
    p.f(15, 2, 8, 1.2, "meja", "meja bar & seduh"); p.f(23.4, 1.2, 2, 2, "logam", "mesin\nkopi")
    p.f(26, 1, 3.6, 0.8, "hitam", "TV nobar")
    for r in range(3):
        for c in range(2):
            p.f(15.5 + c * 7, 5 + r * 3.4, 4.6, 1.4, "meja")
    p.f(28.6, 4.5, 1, 9, "rak", "gorengan")
    p.door(19, 16, 6, text="depan (jalan gang)")
    p.mark(19, 2.6, "K")
    p.note("P = kasur pemain (simpan game). K = tempat mini game jaga warkop. Lv1 cuma gerobak di depan; lv2 tenda 10 x 8; lv4 tambah lantai atas 16 x 16 lesehan & panggung kecil; lv5 kafe 20 x 18.")
    p.save()


def markas():
    p = Plan("kota_markas_lampu_kota", 24, 16, 22, "Gudang markas Lampu Kota")
    p.room(0, 0, 24, 16, "bengkel", "")
    p.f(1, 1, 6, 2, "sofa", "sofa bekas"); p.f(1, 3.4, 4, 1.4, "meja", "meja kartu")
    p.f(9, 1, 6, 0.6, "papan", "papan rencana"); p.f(17, 1.2, 1.2, 1.2, "merah", "samsak")
    p.f(19.5, 1, 4, 4, "olahraga" if False else "logam", "angkat\nbeban")
    for i in range(4):
        p.f(2 + i * 5, 9, 1.4, 3.4, "hitam", "motor")
    p.f(0.3, 13.6, 8, 2, "rak", "kunci & ban"); p.room(18, 11, 6, 5, "rumah", "Kamar\nBang Jaka", 10); p.door(18, 12.5, 1.5, vertical=True)
    p.f(10, 5, 4, 2.6, "kuning", "ring latihan")
    p.door(8, 16, 7, text="pintu geser besar")
    p.mark(12, 6.3, "R"); p.mark(17.6, 1.8, "S")
    p.note("R = ring kecil untuk ujian masuk & sparring (berantem 1 lawan 1).  S = samsak (latihan Kekuatan).")
    p.save()


def toko_buku():
    p = Plan("kota_toko_buku_pena", 36, 13, 20, "Toko Buku Pena: lantai 1 (toko) & lantai 2 (rumah Mei)")
    p.room(0, 0, 16, 12, "toko", "Toko", 12)
    for r in range(4):
        p.f(1, 2 + r * 2.2, 8, 0.8, "rak", f"rak {r * 2 + 1}-{r * 2 + 2}")
    p.f(11, 2, 1, 7, "rak", ""); p.f(13, 9, 2.6, 1.4, "meja", "kasir")
    p.f(14.4, 0.6, 1.2, 3, "tangga" if False else "lemari", "tangga\nkayu")
    p.door(5, 12, 3, text="pintu kaca")
    p.mark(13.5, 4, "7")
    p.room(20, 0, 16, 12, "rumah", "Lantai 2", 12)
    p.room(20, 0, 8, 7, "seni", "Studio Mei", 11); p.f(21, 2, 3, 1.4, "meja", "meja gambar"); p.f(26, 1, 1.6, 4, "rak", "komik")
    p.room(28, 0, 8, 7, "rumah", "Kamar Ama", 10); p.f(29, 2, 3, 2, "kasur")
    p.room(20, 7, 16, 5, "rumah", "Ruang makan & dapur", 10); p.f(25, 8.5, 4, 1.6, "meja", "makan")
    p.mark(22.5, 4.2, "M")
    p.note("7 = rak 7 tempat event 2 hati Mei (tangga goyang).  M = komik 'Anak Warkop' (event 4 hati).")
    p.save()


def bengkel():
    p = Plan("kota_bengkel_mas_fajar", 16, 11, 26, "Bengkel Mas Fajar (sebelum & sesudah jadi properti)")
    p.room(0, 0, 16, 11, "bengkel", "")
    p.f(1, 1, 2.4, 6, "logam", "lift\nmotor"); p.f(5, 2, 1.4, 3.4, "hitam", "motor")
    p.f(8, 2, 1.4, 3.4, "hitam", "motor"); p.f(12, 0.4, 3.6, 1, "rak", "suku cadang")
    p.f(12, 3, 2, 2, "logam", "kompre-\nsor"); p.f(0.4, 8.4, 4, 2.2, "kain", "ban bekas")
    p.room(11, 6, 5, 5, "rumah", "Kamar\nFajar", 10); p.door(11, 7.5, 1.5, vertical=True)
    p.door(3, 11, 7, text="rolling door")
    p.mark(6.8, 4, "S")
    p.note("S = titik mini game servis (bongkar-pasang). Lift motor & kompresor baru ada setelah upgrade properti bengkel.")
    p.save()


if __name__ == "__main__":
    gedung_b(); ruang_kelas(); gedung_a(); gedung_c(); aula(); kantin(); musala_toilet(); gedung_lama()
    rumah_warkop(); markas(); toko_buku(); bengkel()
    print(sorted(os.listdir(OUT)))
