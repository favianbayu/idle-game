"""Desain tampak luar SMA Negeri 3 Wirabumi: denah tapak (atap terlihat dari atas) + gambar tampak tiap gedung.

Jalankan:  python buat_sekolah_luar.py   (butuh Pillow)
Hasil: peta/sekolah_luar/*.png
Koordinat dalam PETAK (1 petak = 32 unit voxel). Tinggi 1 lantai = 2.2 petak (70 unit voxel).
"""
from PIL import Image, ImageDraw, ImageFont
import math, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "sekolah_luar")
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

def hx(h):
    h = h.lstrip("#"); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def shade(c, k):
    return tuple(max(0, min(255, int(v * k))) for v in c)

C = {
    "krem": hx("ecdcb4"), "putih": hx("f6f2e8"), "genteng": hx("a84a32"), "kusen": hx("7a4a2a"), "hijau": hx("2f6b4a"),
    "seng_hijau": hx("3a6a4a"), "rumput": hx("a8c480"), "rumput2": hx("94b56c"), "paving": hx("c9c2b2"), "aspal": hx("6e7076"),
    "lapangan": hx("bcd68e"), "tanah": hx("c8a878"), "air": hx("78b0d6"), "kaca": hx("9cc4d8"), "roster": hx("d8c8a0"),
    "lama": hx("d9d4c4"), "lama_atap": hx("3c3a36"), "lumut": hx("6a7a4a"), "biru": hx("3f6fa8"), "merah": hx("b84a3a"),
    "kuning": hx("e2b84a"), "ungu": hx("8a6aa8"), "oranye": hx("d9774a"), "basket": hx("c9774a"), "kanopi": hx("5a8a9a"),
    "kubah": hx("3a9a8a"), "emas": hx("d4a640"), "garis": (250, 250, 250), "bata": hx("a8583a"), "abu": hx("9aa0a6"),
}
INK = (48, 40, 36)

# ============================================================ DENAH TAPAK
class Site:
    def __init__(self, w, h, s):
        self.s, self.w, self.h = s, w, h
        self.im = Image.new("RGB", (w * s, h * s + 90), C["rumput"])
        self.d = ImageDraw.Draw(self.im)
        for i in range(0, w * s, 7):  # tekstur rumput
            for j in range(0, h * s, 9):
                if (i * 31 + j * 17) % 23 == 0:
                    self.d.point((i, j), fill=C["rumput2"])

    def P(self, pts):
        return [(x * self.s, y * self.s) for x, y in pts]

    def rect(self, x, y, w, h, col, outline=INK, width=2):
        self.d.rectangle((x * self.s, y * self.s, (x + w) * self.s, (y + h) * self.s), fill=col, outline=outline, width=width)

    def poly(self, pts, col, outline=INK, width=2):
        self.d.polygon(self.P(pts), fill=col, outline=outline)
        if width > 1:
            self.d.line(self.P(pts + [pts[0]]), fill=outline, width=width)

    def line(self, pts, col, width=2):
        self.d.line(self.P(pts), fill=col, width=width)

    def circle(self, x, y, r, col, outline=INK, width=2):
        s = self.s
        self.d.ellipse(((x - r) * s, (y - r) * s, (x + r) * s, (y + r) * s), fill=col, outline=outline, width=width)

    def tree(self, x, y, r=1.3):
        self.circle(x + 0.25, y + 0.3, r, shade(C["rumput2"], 0.7), outline=None, width=0)
        self.circle(x, y, r, hx("5f8f4a"), outline=hx("3f6a32"), width=2)
        self.circle(x - r * 0.3, y - r * 0.3, r * 0.45, hx("78a85a"), outline=None, width=0)

    def roof_gable(self, x, y, w, h, col, along="x"):
        """Atap pelana dilihat dari atas: dua bidang, bubungan di tengah."""
        s = self.s
        if along == "x":
            self.rect(x, y, w, h / 2, shade(col, 1.08), width=0, outline=col)
            self.rect(x, y + h / 2, w, h / 2, shade(col, 0.82), width=0, outline=col)
            self.line([(x, y + h / 2), (x + w, y + h / 2)], shade(col, 0.6), 3)
            for i in range(1, int(w)):
                self.line([(x + i, y + 0.15), (x + i, y + h - 0.15)], shade(col, 0.9), 1)
        else:
            self.rect(x, y, w / 2, h, shade(col, 1.08), width=0, outline=col)
            self.rect(x + w / 2, y, w / 2, h, shade(col, 0.82), width=0, outline=col)
            self.line([(x + w / 2, y), (x + w / 2, y + h)], shade(col, 0.6), 3)
            for i in range(1, int(h)):
                self.line([(x + 0.15, y + i), (x + w - 0.15, y + i)], shade(col, 0.9), 1)
        self.rect(x, y, w, h, None, width=2)

    def roof_hip(self, x, y, w, h, col):
        """Atap limas: empat bidang."""
        if w >= h:
            r = h / 2; a, b = (x + r, y + h / 2), (x + w - r, y + h / 2)
            self.poly([(x, y), (x + w, y), b, a], shade(col, 1.08), width=1)
            self.poly([(x, y + h), (x + w, y + h), b, a], shade(col, 0.8), width=1)
            self.poly([(x, y), a, (x, y + h)], shade(col, 0.95), width=1)
            self.poly([(x + w, y), b, (x + w, y + h)], shade(col, 0.9), width=1)
            self.line([a, b], shade(col, 0.55), 3)
        else:
            r = w / 2; a, b = (x + w / 2, y + r), (x + w / 2, y + h - r)
            self.poly([(x, y), (x, y + h), b, a], shade(col, 1.08), width=1)
            self.poly([(x + w, y), (x + w, y + h), b, a], shade(col, 0.8), width=1)
            self.poly([(x, y), a, (x + w, y)], shade(col, 0.95), width=1)
            self.poly([(x, y + h), b, (x + w, y + h)], shade(col, 0.9), width=1)
            self.line([a, b], shade(col, 0.55), 3)
        self.rect(x, y, w, h, None, width=2)

    def roof_saw(self, x, y, w, h, col, n):
        """Atap gergaji (lab): deretan bidang miring dengan jendela atap."""
        step = h / n
        for i in range(n):
            yy = y + i * step
            self.rect(x, yy, w, step * 0.7, shade(col, 1.05), width=0, outline=col)
            self.rect(x, yy + step * 0.7, w, step * 0.3, C["kaca"], width=0, outline=col)
            self.line([(x, yy + step * 0.7), (x + w, yy + step * 0.7)], shade(col, 0.55), 2)
        self.rect(x, y, w, h, None, width=2)

    def roof_barrel(self, x, y, w, h, col):
        """Atap lengkung (aula): garis-garis gelombang seng."""
        n = 12
        for i in range(n):
            k = 0.75 + 0.35 * math.sin(math.pi * (i + 0.5) / n)
            self.rect(x + i * w / n, y, w / n, h, shade(col, k), width=0, outline=shade(col, k))
        self.rect(x, y, w, h, None, width=2)

    def label(self, x, y, text, size=13, bold=True, bg=(250, 248, 240)):
        f = font(size, bold)
        lines = text.split("\n")
        bbs = [self.d.textbbox((0, 0), ln, font=f) for ln in lines]
        tw = max(b[2] - b[0] for b in bbs); th = sum(b[3] - b[1] + 3 for b in bbs)
        X, Y = x * self.s - tw / 2, y * self.s - th / 2
        if bg:
            self.d.rounded_rectangle((X - 5, Y - 3, X + tw + 5, Y + th + 2), 5, fill=bg, outline=INK)
        for ln, b in zip(lines, bbs):
            self.d.text((x * self.s - (b[2] - b[0]) / 2, Y), ln, font=f, fill=INK); Y += b[3] - b[1] + 3

    def num(self, x, y, n):
        s = self.s; r = 12
        self.d.ellipse((x * s - r, y * s - r, x * s + r, y * s + r), fill=(40, 40, 40), outline=(250, 250, 250), width=2)
        f = font(12, True); b = self.d.textbbox((0, 0), str(n), font=f)
        self.d.text((x * s - (b[2] - b[0]) / 2, y * s - 8), str(n), font=f, fill=(255, 255, 255))


def denah_tapak():
    S = Site(80, 60, 18)
    s = S.s
    # jalan depan & trotoar
    S.rect(0, 57, 80, 3, C["aspal"], width=0)
    for xx in range(0, 80, 2):
        S.line([(xx, 58.5), (xx + 1, 58.5)], (235, 235, 200), 2)
    S.rect(0, 56, 80, 1, C["paving"], width=0)
    S.line([(0, 56), (80, 56)], hx("9a9488"), 2)
    S.d.text((8, 57 * s + 6), "Jl. Merdeka (trotoar 1 petak, semua bangunan di dalam pagar)", font=font(14, True), fill=(250, 250, 250))
    # paving halaman: selasar & jalur
    pav = C["paving"]
    S.rect(36.5, 46, 5, 9.5, pav, width=0); S.rect(36.5, 55.5, 5, 0.5, pav, width=0)                    # jalan masuk
    S.circle(39, 49.5, 5.5, pav, width=0)                  # plaza depan
    S.circle(39, 49.5, 2.2, C["air"], outline=hx("4a7a9a"))  # kolam & air mancur
    S.circle(39, 49.5, 0.6, C["putih"])
    S.rect(27, 31.5, 24, 2, pav, width=0)                  # selasar depan lapangan (antara sayap Gedung A)
    S.rect(24, 15.5, 2, 16, pav, width=0); S.rect(52, 15.5, 2, 16, pav, width=0)  # selasar samping lapangan
    S.rect(13, 15.5, 11, 2, pav, width=0)                  # Gedung C ke Gedung B
    S.rect(62, 15.5, 4, 1, pav, width=0)                   # ke aula
    S.rect(56, 32, 2, 2, pav, width=0); S.rect(13, 31.5, 9, 2, pav, width=0)
    # pagar
    S.line([(2, 55.5), (2, 2), (78, 2), (78, 55.5)], hx("4a4a4a"), 4)
    S.line([(2, 55.5), (34, 55.5)], hx("4a4a4a"), 4); S.line([(44, 55.5), (78, 55.5)], hx("4a4a4a"), 4)
    for xx in range(3, 78, 3):
        S.circle(xx, 55.5, 0.25, hx("8a8a8a"), outline=None, width=0)
    # gapura gerbang (di dalam garis pagar)
    S.rect(33.2, 54, 1.8, 1.5, C["bata"]); S.rect(43, 54, 1.8, 1.5, C["bata"])
    S.rect(35, 54.4, 8, 0.7, C["hijau"])
    # pos satpam (bulat)
    S.circle(46.5, 52.2, 1.6, C["krem"]); S.circle(46.5, 52.2, 1.0, C["genteng"], width=1)
    # ------------- parkiran motor siswa (kanopi bergelombang)
    S.rect(4, 44, 26, 9.6, hx("b8b8b2"), width=2)
    for r in range(3):
        y0 = 45 + r * 3
        S.rect(5, y0, 24, 1.8, C["kanopi"], width=1)
        for i in range(12):
            S.line([(5 + i * 2, y0), (5 + i * 2, y0 + 1.8)], shade(C["kanopi"], 0.75), 1)
        for i in range(16):
            S.rect(5.3 + i * 1.45, y0 + 1.9, 0.5, 0.9, [C["merah"], C["hitam"] if "hitam" in C else INK, C["biru"]][i % 3], width=0)
    S.rect(26.5, 44.4, 3, 2.4, C["air"], width=1)
    # parkiran guru
    S.rect(50, 46, 14, 7.6, C["aspal"], width=2)
    for i in range(6):
        S.line([(50 + i * 2.3, 46), (50 + i * 2.3, 49)], (240, 240, 240), 2)
        S.rect(50.4 + i * 2.3, 46.4, 1.5, 2.4, [C["putih"], C["abu"], C["merah"], C["biru"], hx("2a2a2a"), C["putih"]][i], width=1)
    # taman mading & rak sepeda
    S.rect(66, 44, 11, 9.6, C["rumput2"], width=0)
    S.rect(67, 45, 9, 1.2, C["kusen"]); S.rect(67, 50, 7, 1, C["abu"])
    for i in range(8):
        S.line([(67.3 + i * 0.9, 50), (67.3 + i * 0.9, 51)], INK, 1)
    # ------------- lapangan upacara
    S.rect(28, 16, 22, 14, C["paving"], width=2)
    for i in range(1, 11):
        S.line([(28 + i * 2, 16.3), (28 + i * 2, 29.7)], shade(C["paving"], 0.9), 1)
    S.rect(36.5, 16.4, 5, 2, C["krem"])  # podium/mimbar
    S.circle(39, 17.4, 0.35, C["merah"])
    S.line([(39, 17.4), (39, 15.8)], INK, 2)
    for r in range(6):
        for c in range(9):
            S.circle(30.5 + c * 2.2, 21 + r * 1.4, 0.18, hx("7a7a7a"), outline=None, width=0)
    # ------------- lapangan basket & futsal
    S.rect(54, 16, 15, 14, C["basket"], width=2)
    S.d.rectangle((55 * s, 17 * s, 68 * s, 29 * s), outline=C["garis"], width=2)
    S.line([(55, 23), (68, 23)], C["garis"], 2); S.circle(61.5, 23, 1.6, None, outline=C["garis"])
    S.d.arc((58.5 * s, 15.5 * s, 64.5 * s, 20.5 * s), 0, 180, fill=C["garis"], width=2)
    S.d.arc((58.5 * s, 25.5 * s, 64.5 * s, 30.5 * s), 180, 360, fill=C["garis"], width=2)
    S.rect(54.3, 30, 14.4, 1.2, C["kusen"])  # bangku tribun kecil
    # ------------- beringin
    S.circle(19, 23, 5.2, shade(C["rumput2"], 0.7), outline=None, width=0)
    S.circle(18.7, 22.7, 5, hx("4f7f3e"), outline=hx("2f5a28"), width=3)
    for a in range(0, 360, 40):
        S.circle(18.7 + 2.7 * math.cos(math.radians(a)), 22.7 + 2.7 * math.sin(math.radians(a)), 1.4, hx("6a9a52"), outline=None, width=0)
    S.d.arc((15.5 * s, 19.5 * s, 22 * s, 26 * s), 0, 360, fill=C["kusen"], width=4)
    # ------------- BANGUNAN (atap)
    # Gedung B: 3 lt, pelana + gevel kecil per kelas menghadap lapangan, menara tangga menonjol
    S.roof_gable(18, 4, 44, 8, C["genteng"])
    for i in range(3):
        x0 = 23 + i * 12.5
        S.poly([(x0, 12), (x0 + 6, 12), (x0 + 3, 9.5)], shade(C["genteng"], 0.95), width=2)
    S.roof_hip(17, 11, 5, 4.5, shade(C["genteng"], 0.9)); S.roof_hip(58, 11, 5, 4.5, shade(C["genteng"], 0.9))
    S.roof_hip(37.5, 11.5, 5, 3, shade(C["genteng"], 0.9))
    # Gedung A: bentuk U + portiko pelana menonjol
    S.roof_hip(22, 35, 34, 8, C["genteng"])
    S.roof_hip(22, 31.5, 5, 5, C["genteng"]); S.roof_hip(51, 31.5, 5, 5, C["genteng"])
    S.roof_gable(35.5, 42, 7, 4.5, shade(C["genteng"], 0.95), along="y")
    S.rect(36, 46, 6, 0.4, C["hijau"], width=1)
    # Gedung C: atap gergaji + tangga
    S.roof_saw(5, 15, 8, 22, hx("8a8f94"), 6)
    S.roof_hip(5, 37, 8, 3, C["genteng"])
    # Aula: atap lengkung seng hijau
    S.roof_barrel(64, 3, 13, 11.5, C["seng_hijau"])
    S.rect(66, 14.5, 9, 1.5, C["krem"])  # kanopi pintu
    # Musala: kubah
    S.rect(70.5, 17, 7, 9, C["krem"]); S.roof_hip(70.5, 17, 7, 9, hx("4a8a7a"))
    S.circle(74, 21.5, 2.3, C["kubah"]); S.circle(74, 21.5, 0.5, C["emas"])
    S.rect(70.5, 26.5, 7, 3, hx("cfe4ea"))
    # kantin: deretan atap miring warna-warni + tenda
    cols = [C["merah"], C["kuning"], C["oranye"], C["biru"], C["hijau"], C["ungu"]]
    for i in range(6):
        S.rect(58 + i * 3, 34, 3, 3.5, shade(cols[i], 0.95), width=2)
        S.line([(58 + i * 3, 34.6), (61 + i * 3, 34.6)], shade(cols[i], 0.7), 2)
    S.rect(58, 37.5, 18, 5, C["paving"], width=2)
    for i in range(3):
        S.rect(59 + i * 6, 38.3, 4.4, 0.8, C["kusen"], width=1); S.rect(59 + i * 6, 40.6, 4.4, 0.8, C["kusen"], width=1)
    # toilet & gudang
    S.roof_gable(14, 33.5, 7, 9, hx("8a8f94"), along="y")
    # Gedung Lama + menara lonceng
    S.roof_hip(3.5, 3, 10, 8, C["lama_atap"])
    for (x, y) in ((5, 4), (11, 9), (8, 6.5)):
        S.circle(x, y, 0.8, C["lumut"], outline=None, width=0)
    S.rect(7.2, 5.5, 3, 3, C["lama"]); S.roof_hip(7.2, 5.5, 3, 3, hx("2a2826"))
    # kebun & greenhouse
    S.rect(3.5, 41, 9, 2.4, hx("e6eef0"), width=2)
    for i in range(1, 9):
        S.line([(3.5 + i, 41), (3.5 + i, 43.4)], hx("b0c0c4"), 1)
    for r in range(2):
        S.rect(3.5, 44 - 0 + r * 1.6 + 0 if False else 38.2 + r * 1.3, 9, 0.8, C["tanah"], width=1)
    # warung Mak Iyah & jalur bolos
    S.rect(29, 0, 9, 1.8, hx("c4786e"), width=2)
    S.line([(33.5, 1.8), (33.5, 4)], (200, 40, 40), 4)
    # pohon peneduh
    for (x, y) in ((15, 47), (31, 43.6), (47, 43.6), (64.5, 44.5), (3.5, 14), (14.5, 9.5), (63, 31.5), (22.5, 29),
                   (76, 31), (76, 36), (51, 15), (27, 15), (15.5, 30), (70, 29.5), (76, 41.5), (3.5, 31.5)):
        S.tree(x, y)
    # label bernomor
    L = [(40, 8, "Gedung B (3 lt)\nkelas X / XI / XII", 1), (39, 39.2, "Gedung A (2 lt)\nkantor & perpustakaan", 2),
         (9, 26, "Gedung C\n(2 lt)\nlab, seni,\nOSIS", 3), (70.5, 9, "Aula / GOR", 4), (74, 24.5, "Musala", 5),
         (67, 40, "Kantin", 6), (17.5, 38, "Toilet\n& gudang", 7), (8.5, 9.6, "Gedung Lama", 8),
         (39, 27.5, "Lapangan upacara", 9), (61.5, 26, "Basket & futsal", 10), (18.7, 27.5, "Beringin", 11),
         (17, 51.5, "Parkiran motor siswa", 12), (57, 51, "Parkir guru", 13), (71.5, 48, "Mading &\nrak sepeda", 14),
         (39, 52.2, "Plaza & kolam", 15), (8, 39.4, "Kebun", 16), (33.5, 0.9, "Warung Mak Iyah", 17)]
    for x, y, t, n in L:
        S.label(x, y, t, 12)
    S.d.text((34.2 * s, 2.4 * s), "loncat pagar", font=font(11, True), fill=(170, 30, 30))
    S.d.text((48.3 * s, 51.2 * s), "Pos\nsatpam", font=font(10, True), fill=INK)
    # legenda bawah
    y = 60 * s + 10
    S.d.rectangle((0, 60 * s, S.im.width, S.im.height), fill=(250, 248, 242))
    S.d.text((12, y), "SMA NEGERI 3 WIRABUMI: tapak & atap. Lahan dalam pagar 76 x 53.5 petak; gedung mengelilingi lapangan, disambung selasar.",
             font=font(15, True), fill=INK)
    S.d.text((12, y + 26), "Atap merah = genteng (pelana/limas)  abu bergaris biru = atap gergaji lab  hijau bergaris = seng lengkung aula  "
             "abu muda = paving/selasar  garis merah = jalur bolos", font=font(13), fill=(70, 70, 70))
    S.d.text((12, y + 48), "Kanopi biru = parkiran motor beratap. Titik abu di lapangan = posisi barisan upacara. Pohon peneduh di sepanjang halaman.",
             font=font(13), fill=(70, 70, 70))
    S.im.save(os.path.join(OUT, "denah_tapak_sekolah.png"))


# ============================================================ TAMPAK (ELEVASI)
FH = 2.2  # tinggi lantai (petak)

class Elev:
    def __init__(self, name, title, w, h, s=18, ground=1.2):
        self.name, self.s, self.w, self.h = name, s, w, h
        self.top = 50; self.m = 30
        self.im = Image.new("RGB", (int(w * s + 2 * self.m), int(h * s + self.top + 66)), (250, 248, 242))
        self.d = ImageDraw.Draw(self.im)
        # langit gradasi
        for i in range(int(h * s)):
            k = i / (h * s)
            self.d.line((self.m, self.top + i, self.m + w * s, self.top + i), fill=(int(196 + 40 * k), int(222 + 20 * k), int(240 + 5 * k)))
        self.gy = h - ground
        self.d.rectangle(self.R(0, self.gy, w, ground), fill=C["rumput"])
        self.d.text((self.m, 12), title, font=font(18, True), fill=INK)

    def X(self, x): return self.m + x * self.s
    def Y(self, y): return self.top + y * self.s
    def R(self, x, y, w, h): return (self.X(x), self.Y(y), self.X(x + w), self.Y(y + h))

    def box(self, x, y, w, h, col, outline=INK, width=2):
        self.d.rectangle(self.R(x, y, w, h), fill=col, outline=outline, width=width)

    def poly(self, pts, col, outline=INK, width=2):
        P = [(self.X(x), self.Y(y)) for x, y in pts]
        self.d.polygon(P, fill=col)
        if outline:
            self.d.line(P + [P[0]], fill=outline, width=width)

    def wall(self, x, w, floors, col, base=None):
        """Dinding berdiri di tanah, mengembalikan y atas."""
        y0 = self.gy - floors * FH
        self.box(x, y0, w, floors * FH, col)
        self.box(x, self.gy - 0.35, w, 0.35, shade(col, 0.75), width=1)  # plint
        for f in range(1, floors):
            self.box(x, self.gy - f * FH - 0.12, w, 0.24, C["putih"], width=1)  # list lantai
        return y0

    def windows(self, x, w, floor, n, col=None, wh=1.0, ww=1.1, roster=False, door_at=()):
        col = col or C["kaca"]
        yb = self.gy - floor * FH - FH * 0.25
        gap = w / n
        for i in range(n):
            cx = x + gap * (i + 0.5)
            if i in door_at:
                self.box(cx - 0.6, self.gy - floor * FH - 1.7 if floor else self.gy - 1.7, 1.2, 1.7, C["kusen"])
                continue
            self.box(cx - ww / 2, yb - wh, ww, wh, C["kusen"])
            self.box(cx - ww / 2 + 0.12, yb - wh + 0.12, ww - 0.24, wh - 0.24, col, width=1)
            self.d.line((self.X(cx), self.Y(yb - wh + 0.12), self.X(cx), self.Y(yb - 0.12)), fill=C["kusen"], width=2)
            if roster:
                self.box(cx - ww / 2, yb - wh - 0.45, ww, 0.35, C["roster"], width=1)
                for k in range(4):
                    xx = cx - ww / 2 + 0.15 + k * (ww - 0.3) / 3
                    self.d.ellipse((self.X(xx) - 2, self.Y(yb - wh - 0.28) - 2, self.X(xx) + 2, self.Y(yb - wh - 0.28) + 2), fill=shade(C["roster"], 0.6))

    def balcony(self, x, w, floor, col):
        y = self.gy - floor * FH
        self.box(x, y - 0.15, w, 0.25, C["putih"], width=1)
        self.box(x, y - 0.95, w, 0.12, col, width=1)
        for i in range(int(w * 2) + 1):
            xx = x + i * 0.5
            self.d.line((self.X(xx), self.Y(y - 0.95), self.X(xx), self.Y(y - 0.15)), fill=col, width=2)

    def columns(self, x, w, n, h_top, col=None):
        col = col or C["putih"]
        for i in range(n):
            xx = x + i * (w - 0.5) / max(1, n - 1)
            self.box(xx, h_top, 0.5, self.gy - h_top, col, width=1)

    def gable(self, x, w, y, h, col, eave=0.6, tymp=None):
        self.poly([(x - eave, y), (x + w + eave, y), (x + w / 2, y - h)], col)
        if tymp:
            self.poly([(x + 0.6, y - 0.1), (x + w - 0.6, y - 0.1), (x + w / 2, y - h + 0.6)], tymp, width=1)

    def hip(self, x, w, y, h, col, eave=0.6, inset=None):
        inset = inset if inset is not None else min(w * 0.35, h * 1.6)
        self.poly([(x - eave, y), (x + w + eave, y), (x + w - inset, y - h), (x + inset, y - h)], col)
        for i in range(1, 4):
            yy = y - h * i / 4
            self.d.line((self.X(x - eave + (inset + eave) * i / 4), self.Y(yy), self.X(x + w + eave - (inset + eave) * i / 4), self.Y(yy)), fill=shade(col, 0.82), width=1)

    def shed(self, x, w, yl, yr, col, eave=0.4):
        self.poly([(x - eave, yl + 0.3), (x + w + eave, yr + 0.3), (x + w + eave, yr), (x - eave, yl)], col)

    def barrel(self, x, w, y, h, col):
        P = []
        for i in range(41):
            t = i / 40
            P.append((x - 0.4 + (w + 0.8) * t, y - h * math.sin(math.pi * t)))
        self.poly(P + [(x + w + 0.4, y), (x - 0.4, y)], col)
        for k in range(1, 10):
            t = k / 10
            self.d.line((self.X(x - 0.4 + (w + 0.8) * t), self.Y(y - h * math.sin(math.pi * t)), self.X(x - 0.4 + (w + 0.8) * t), self.Y(y)), fill=shade(col, 0.8), width=1)

    def sign(self, x, y, w, h, text, col=None, fg=(240, 210, 120), size=12):
        col = col or C["hijau"]
        self.box(x, y, w, h, col)
        f = font(size, True); b = self.d.textbbox((0, 0), text, font=f)
        self.d.text((self.X(x + w / 2) - (b[2] - b[0]) / 2, self.Y(y + h / 2) - (b[3] - b[1]) / 2 - 2), text, font=f, fill=fg)

    def tree(self, x, r=1.6, hgt=4):
        self.box(x - 0.2, self.gy - hgt + r, 0.4, hgt - r, hx("6a4a30"), width=1)
        for dx, dy, rr in ((0, 0, r), (-r * 0.6, r * 0.3, r * 0.75), (r * 0.6, r * 0.3, r * 0.75)):
            cx, cy = self.X(x + dx), self.Y(self.gy - hgt + r * 0.6 + dy)
            self.d.ellipse((cx - rr * self.s, cy - rr * self.s, cx + rr * self.s, cy + rr * self.s), fill=hx("5f8f4a"), outline=hx("3f6a32"), width=2)

    def person(self, x, col=(220, 220, 230)):
        self.box(x - 0.18, self.gy - 1.1, 0.36, 0.7, col, width=1)
        self.box(x - 0.18, self.gy - 0.4, 0.36, 0.4, C["abu"], width=1)
        cx, cy = self.X(x), self.Y(self.gy - 1.3)
        self.d.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=hx("c89a70"), outline=INK)

    def note(self, text):
        f = font(12); maxw = self.im.width - 2 * self.m; lines, cur = [], ""
        for wd in text.split():
            t = (cur + " " + wd).strip()
            if self.d.textbbox((0, 0), t, font=f)[2] > maxw:
                lines.append(cur); cur = wd
            else:
                cur = t
        lines.append(cur)
        for i, ln in enumerate(lines[:3]):
            self.d.text((self.m, self.top + self.h * self.s + 8 + i * 17), ln, font=f, fill=(70, 70, 70))
        x0 = self.im.width - self.m - 5 * self.s
        self.d.rectangle((x0, 20, x0 + 5 * self.s, 26), fill=INK)
        self.d.text((x0, 29), "5 petak", font=font(11), fill=INK)

    def save(self):
        self.im.save(os.path.join(OUT, self.name + ".png"))


def tampak_gedung_a():
    E = Elev("tampak_gedung_a", "Gedung A & gerbang: tampak depan (dari Jl. Merdeka)", 46, 14)
    x0, w = 6, 34
    top = E.wall(x0, w, 2, C["krem"])
    E.hip(x0, w, top, 2.4, C["genteng"])
    for xx in (x0 + 4, x0 + w - 4):
        E.box(xx - 0.25, top - 3.2, 0.5, 1.4, C["krem"], width=1)  # cerobong ventilasi
    # sayap sedikit lebih rendah & maju (pilaster)
    for xx in (x0, x0 + w - 5):
        E.box(xx, top, 5, 2 * FH, shade(C["krem"], 0.95))
        E.box(xx + 0.2, top + 0.2, 0.3, 2 * FH - 0.4, C["putih"], width=1); E.box(xx + 4.5, top + 0.2, 0.3, 2 * FH - 0.4, C["putih"], width=1)
    E.windows(x0 + 5, 9.5, 0, 4, roster=True); E.windows(x0 + 19.5, 9.5, 0, 4, roster=True)
    E.windows(x0 + 5, 9.5, 1, 4, roster=True); E.windows(x0 + 19.5, 9.5, 1, 4, roster=True)
    E.windows(x0, 5, 0, 2); E.windows(x0, 5, 1, 2); E.windows(x0 + w - 5, 5, 0, 2); E.windows(x0 + w - 5, 5, 1, 2)
    # portiko tengah 2 lantai dengan pelana & lambang
    px, pw = x0 + 14, 6
    E.box(px - 0.4, top - 0.2, pw + 0.8, 2 * FH + 0.2, shade(C["krem"], 1.03))
    E.gable(px - 0.4, pw + 0.8, top - 0.2, 2.6, C["genteng"], eave=0.5, tymp=C["putih"])
    E.d.ellipse((E.X(px + pw / 2) - 11, E.Y(top - 1.1) - 11, E.X(px + pw / 2) + 11, E.Y(top - 1.1) + 11), fill=C["emas"], outline=INK)
    E.columns(px, pw, 4, top + 0.2, C["putih"])
    E.box(px + 1.6, E.gy - 2.1, 2.8, 2.1, C["kusen"])
    E.sign(px - 0.4, top + 0.25, pw + 0.8, 0.8, "SMA NEGERI 3 WIRABUMI", size=10)
    E.box(px - 1, E.gy - 0.3, pw + 2, 0.3, C["paving"], width=1)  # tangga
    E.balcony(px, pw, 1, C["hijau"])
    # gerbang gapura di depan (kiri)
    gx = 1.2
    for xx in (gx, gx + 3.6):
        E.box(xx, E.gy - 3.2, 0.9, 3.2, C["bata"])
        E.box(xx - 0.1, E.gy - 3.5, 1.1, 0.3, C["putih"], width=1)
    E.d.arc((E.X(gx + 0.45), E.Y(E.gy - 4.6), E.X(gx + 4.05), E.Y(E.gy - 2.6)), 180, 360, fill=C["hijau"], width=6)
    E.box(gx + 0.9, E.gy - 1.3, 2.7, 1.3, None)
    for i in range(7):
        E.d.line((E.X(gx + 0.9 + i * 0.45), E.Y(E.gy - 1.3), E.X(gx + 0.9 + i * 0.45), E.Y(E.gy)), fill=C["hijau"], width=2)
    # pos satpam bulat (kanan)
    sx = 42
    E.box(sx, E.gy - 2, 2.6, 2, C["krem"]); E.box(sx + 0.4, E.gy - 1.6, 1.8, 0.8, C["kaca"], width=1)
    E.hip(sx, 2.6, E.gy - 2, 1, C["genteng"], eave=0.3, inset=1.1)
    E.tree(4.4 + 38, 1.3, 4.2) if False else None
    for xx in (0.6, 44.8):
        E.tree(xx, 1.2, 4)
    for xx in (23, 25, 27.5):
        E.person(xx)
    E.note("Simetris & resmi: portiko pelana dengan lambang emas jadi landmark depan. Sayap ujung maju sedikit (pilaster putih), roster di atas jendela, papan nama hijau-emas.")
    E.save()


def tampak_gedung_b():
    E = Elev("tampak_gedung_b", "Gedung B (kelas): tampak dari lapangan upacara", 52, 15)
    x0, w = 4, 44
    top = E.wall(x0, w, 3, C["krem"])
    E.hip(x0, w, top, 2.2, C["genteng"])
    rail = [C["biru"], C["hijau"], C["merah"]]
    for f in range(3):
        E.windows(x0 + 4, 36, f, 15, roster=True, door_at=(1, 5, 6, 10, 11) if f < 3 else ())
    for f in (1, 2):
        E.balcony(x0 + 4, 36, f, rail[f])
    E.box(x0 + 4, E.gy - 0.95, 36, 0.12, rail[0], width=1)
    # gevel kecil per kelas (atap tambahan, memecah garis atap panjang)
    for i in range(3):
        gx = x0 + 6 + i * 12
        E.gable(gx, 7, top, 1.8, shade(C["genteng"], 0.95), eave=0.3, tymp=C["putih"])
    # menara tangga di dua ujung, lebih tinggi, dengan jendela vertikal & atap limas
    for tx in (x0, x0 + w - 4):
        E.box(tx - 0.3, top - 1.2, 4.6, 3 * FH + 1.2, shade(C["krem"], 0.93))
        for k in range(4):
            E.box(tx + 1.6, E.gy - 1.8 - k * 1.7, 1, 1.2, C["kaca"], width=1)
        E.hip(tx - 0.3, 4.6, top - 1.2, 1.6, shade(C["genteng"], 0.9), eave=0.4, inset=1.6)
    # jam dinding sekolah di gevel tengah
    E.d.ellipse((E.X(x0 + 21.5) - 9, E.Y(top - 0.55) - 9, E.X(x0 + 21.5) + 9, E.Y(top - 0.55) + 9), fill=C["putih"], outline=INK, width=2)
    E.d.line((E.X(x0 + 21.5), E.Y(top - 0.55), E.X(x0 + 21.5), E.Y(top - 0.55) - 6), fill=INK, width=2)
    # atap: tandon air & antena (tempat rahasia)
    E.box(x0 + 30, top - 3.4, 1.6, 1.2, C["biru"]); E.d.line((E.X(x0 + 33), E.Y(top - 2.2), E.X(x0 + 33), E.Y(top - 4.4)), fill=INK, width=2)
    for xx in (1.5, 50.5):
        E.tree(xx, 1.5, 5)
    for xx in (14, 15, 30, 31.4):
        E.person(xx)
    E.note("Pagar balkon beda warna per angkatan: biru lt1 (X), hijau lt2 (XI), merah lt3 (XII). Tiga gevel kecil memecah atap panjang; menara tangga menonjol & lebih tinggi; jam di gevel tengah.")
    E.save()


def tampak_c_aula():
    E = Elev("tampak_gedung_c_aula", "Gedung C (lab & seni) dan Aula / GOR", 56, 15)
    # Gedung C: atap gergaji, dinding samping mural
    x0, w = 2, 24
    top = E.wall(x0, w, 2, C["krem"])
    n = 6; step = w / n
    for i in range(n):
        xa = x0 + i * step
        E.poly([(xa, top), (xa + step, top), (xa + step, top - 1.8)], hx("8a8f94"))
        E.box(xa + step - 0.25, top - 1.8, 0.25, 1.8, C["kaca"], width=1)
    E.windows(x0, 16, 0, 6, ww=1.8, wh=1.1); E.windows(x0, 16, 1, 6, ww=1.8, wh=1.1)
    # mural siswa di ujung
    mx = x0 + 16.5
    E.box(mx, top + 0.3, 7, 2 * FH - 0.6, hx("f2e2c0"))
    for i, cc in enumerate((C["merah"], C["kuning"], C["biru"], C["hijau"], C["ungu"])):
        E.d.ellipse((E.X(mx + 0.8 + i * 1.25) - 9, E.Y(top + 1.6 + (i % 2)) - 9, E.X(mx + 0.8 + i * 1.25) + 9, E.Y(top + 1.6 + (i % 2)) + 9), fill=cc)
    E.sign(mx + 0.8, top + 3.3, 5.4, 0.5, "KARYA SENI X-3", col=INK, fg=C["kuning"], size=8)
    E.box(x0 + 7, E.gy - 2 * FH - 0.3, 6, 0.3, C["putih"], width=1)
    # Aula: atap lengkung seng hijau, dinding atas roster, kanopi pintu
    ax, aw = 30, 22
    atop = E.gy - 5
    E.box(ax, atop, aw, 5, C["krem"])
    E.box(ax, atop, aw, 1.4, C["roster"], width=1)
    for i in range(int(aw * 1.5)):
        E.d.rectangle((E.X(ax + 0.2 + i / 1.5), E.Y(atop + 0.35), E.X(ax + 0.45 + i / 1.5), E.Y(atop + 1.05)), fill=shade(C["roster"], 0.6))
    E.barrel(ax, aw, atop, 4.5, C["seng_hijau"])
    E.sign(ax + 7, atop + 1.6, 8, 0.8, "AULA SMA 3", size=11)
    E.box(ax + 8, E.gy - 2.4, 6, 2.4, C["kusen"])
    E.poly([(ax + 7, E.gy - 2.6), (ax + 15, E.gy - 2.6), (ax + 15.6, E.gy - 2.1), (ax + 6.4, E.gy - 2.1)], C["seng_hijau"])
    E.windows(ax, 7, 0, 2, wh=1.6, ww=1.2); E.windows(ax + 15, 7, 0, 2, wh=1.6, ww=1.2)
    for xx in (27.5, 54.5):
        E.tree(xx, 1.4, 4.6)
    E.person(40); E.person(41.3)
    E.note("Lab memakai atap gergaji (cahaya masuk dari kaca atap) & jendela lebar; ujung Gedung C diberi mural siswa yang berganti tiap tahun. Aula beratap lengkung seng hijau, roster di dinding atas.")
    E.save()


def tampak_kecil():
    E = Elev("tampak_kantin_musala_lama", "Kantin, musala, dan Gedung Lama", 60, 13)
    # kantin: 6 lapak beda warna, atap miring + tenda bergaris
    cols = [C["merah"], C["kuning"], C["oranye"], C["biru"], C["hijau"], C["ungu"]]
    names = ["BAKSO", "UDUK", "GORENG", "MI AYAM", "ES TEH", "KOPERASI"]
    for i in range(6):
        x = 1 + i * 3.4
        E.box(x, E.gy - 2.6, 3.4, 2.6, shade(cols[i], 1.25))
        E.box(x + 0.3, E.gy - 1.5, 2.8, 0.8, C["kusen"], width=1)
        E.shed(x, 3.4, E.gy - 3.4, E.gy - 2.6, shade(cols[i], 0.85), eave=0.1)
        for k in range(4):
            E.box(x + k * 0.85, E.gy - 2.7, 0.425, 0.5, C["putih"], width=0)
        E.sign(x + 0.2, E.gy - 2.1, 3, 0.45, names[i], col=C["putih"], fg=INK, size=8)
    # musala: kubah hijau tosca, menara kecil
    mx = 25
    E.box(mx, E.gy - 3.2, 9, 3.2, C["putih"])
    for i in range(4):
        E.d.arc((E.X(mx + 0.6 + i * 2.1), E.Y(E.gy - 2.8), E.X(mx + 2.1 + i * 2.1), E.Y(E.gy - 1.2)), 180, 360, fill=C["kubah"], width=4)
        E.box(mx + 0.6 + i * 2.1, E.gy - 2.0, 1.5, 2.0, C["kaca"] if i != 1 else C["kusen"], width=1)
    E.hip(mx, 9, E.gy - 3.2, 1, hx("4a8a7a"), eave=0.4, inset=2)
    cx = E.X(mx + 4.5); cy = E.Y(E.gy - 4.2); r = 2.3 * E.s
    E.d.pieslice((cx - r, cy - r, cx + r, cy + r), 180, 360, fill=C["kubah"], outline=INK, width=2)
    E.d.line((cx, cy - r, cx, cy - r - 14), fill=C["emas"], width=3)
    E.box(mx + 8.2, E.gy - 6, 0.8, 6, C["putih"])
    E.hip(mx + 8.2, 0.8, E.gy - 6, 0.8, C["kubah"], eave=0.2, inset=0.4)
    # Gedung Lama: kolonial, dinding tebal kusam, jendela tinggi dipapan, menara lonceng
    gx = 40
    top = E.gy - 4
    E.box(gx, top, 16, 4, C["lama"])
    for (xx, yy) in ((gx + 1, top + 3), (gx + 9, top + 2.6), (gx + 14, top + 3.2)):
        E.d.ellipse((E.X(xx) - 14, E.Y(yy) - 6, E.X(xx) + 14, E.Y(yy) + 6), fill=C["lumut"])
    for i in range(5):
        wx = gx + 1.2 + i * 3
        E.box(wx, top + 0.6, 1.4, 2.8, C["kusen"])
        for k in range(4):
            E.box(wx - 0.1, top + 0.9 + k * 0.6, 1.6, 0.25, hx("8a6a4a"), width=1)  # papan penutup
    E.box(gx + 7, E.gy - 2.8, 2, 2.8, hx("5a3a22")); E.box(gx + 7.8, E.gy - 1.6, 0.4, 0.4, C["abu"], width=1)
    E.hip(gx, 16, top, 2.2, C["lama_atap"], eave=0.6)
    tx = gx + 6.8
    E.box(tx, top - 5, 2.4, 3.2, C["lama"])
    E.d.arc((E.X(tx + 0.4), E.Y(top - 4.6), E.X(tx + 2.0), E.Y(top - 3)), 180, 360, fill=INK, width=3)
    E.box(tx + 0.4, top - 3.8, 1.6, 1.6, hx("2a2826"), width=1)
    E.poly([(tx - 0.3, top - 5), (tx + 2.7, top - 5), (tx + 1.2, top - 6.6)], C["lama_atap"])
    for xx in (gx + 0.5, gx + 3, gx + 12, gx + 15):
        E.box(xx, E.gy - 0.8, 0.8, 0.8, hx("7a8a4a"), width=0)  # rumput liar
    E.tree(23, 1.3, 4.2); E.tree(38.3, 1.6, 5.2); E.tree(58.5, 1.5, 5)
    E.person(6); E.person(7.3); E.person(13)
    E.note("Kantin: tiap lapak warna & tenda bergaris sendiri. Musala: kubah tosca, jendela lengkung, menara kecil. Gedung Lama: menara lonceng kosong, jendela tinggi dipapan, lumut & rumput liar.")
    E.save()


if __name__ == "__main__":
    denah_tapak(); tampak_gedung_a(); tampak_gedung_b(); tampak_c_aula(); tampak_kecil()
    print(sorted(os.listdir(OUT)))
