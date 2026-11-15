"""Peta kota Wirabumi versi organik: jalan berkelok, pembagian wilayah, dan denah detail per wilayah.

Jalankan:  python peta_organik.py   (butuh Pillow, numpy, shapely)
Hasil:
  peta_kota.png                 peta seluruh kota, dibagi wilayah
  wilayah_1_perkampungan.png    Perkampungan Kenanga (rumah pemain, Warkop Simpang)
  wilayah_2_perumahan.png       Perumahan Bukit Asri (kompleks elite)
  wilayah_3_pusat_kota.png      Pusat kota & jalan raya (alun-alun, pasar, ruko)
  wilayah_4_bantaran.png        Bantaran kali & selatan (markas geng, STM, proyek, sirkuit)

Koordinat dalam PETAK (1 petak = 32 unit voxel). Rumah di sepanjang gang ditempatkan otomatis
(acak tapi tetap: seed tetap), jadi tiap kali dijalankan hasilnya sama.
"""
import math, os, random
from PIL import Image, ImageDraw, ImageFont
from shapely.geometry import LineString, Polygon, Point, box
from shapely.affinity import rotate, translate
from shapely.ops import unary_union

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONTB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
if not os.path.exists(FONT):
    FONT, FONTB = "arial.ttf", "arialbd.ttf"

def font(size, bold=False):
    try:
        return ImageFont.truetype(FONTB if bold else FONT, size)
    except OSError:
        return ImageFont.load_default()

C = dict(
    grass=(164, 192, 124), grass2=(150, 182, 112), hill=(132, 166, 100), water=(104, 160, 204), water_edge=(80, 130, 170),
    raya=(98, 100, 106), raya_edge=(70, 70, 74), jalan=(128, 126, 122), gang=(176, 166, 146), gang_edge=(140, 130, 110),
    tanah=(196, 172, 128), sawah=(150, 190, 96), sawah_line=(120, 160, 80), rail=(84, 72, 62),
    roof_kampung=[(186, 92, 70), (170, 104, 76), (198, 120, 84), (150, 84, 64), (176, 132, 96)],
    roof_perum=[(92, 104, 128), (120, 80, 72), (70, 90, 80), (140, 120, 100)],
    roof_ruko=[(210, 200, 186), (190, 186, 180), (220, 210, 190)],
    tree=(78, 128, 70), tree2=(96, 146, 80), plaza=(214, 206, 188), field=(178, 208, 132),
)
DIST = {  # warna tint wilayah
    "kampung": (226, 190, 150), "pusat": (226, 206, 226), "sekolah": (240, 222, 150), "perum": (186, 206, 230),
    "bantaran": (206, 176, 160), "selatan": (214, 214, 196), "bukit": (150, 180, 110),
}

def catmull(pts, n=10, closed=False):
    if len(pts) < 3:
        return list(pts)
    P = list(pts)
    if closed:
        P = [P[-1]] + P + [P[0], P[1]]
    else:
        P = [P[0]] + P + [P[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y))
    if not closed:
        out.append(pts[-1])
    return out

def shade(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c)


class Map:
    def __init__(self, w, h, s, title, sub, legend_w=360, seed=1):
        self.w, self.h, self.s = w, h, s
        self.W, self.H = int(w * s) + legend_w, int(h * s) + 70
        self.im = Image.new("RGB", (self.W, self.H), C["grass"])
        self.d = ImageDraw.Draw(self.im, "RGBA")
        self.blocked = []
        self.roads = []
        self.forests = []
        self.legend = []
        self.title, self.sub = title, sub
        self.rng = random.Random(seed)
        self.mapbox = box(0, 0, w, h)
        # tekstur rumput halus
        for _ in range(int(w * h / 6)):
            x, y = self.rng.uniform(0, w), self.rng.uniform(0, h)
            r = self.rng.uniform(0.3, 1.2) * s
            self.d.ellipse((x * s - r, y * s - r, x * s + r, y * s + r), fill=C["grass2"] + (90,))

    def P(self, pts):
        return [(x * self.s, y * self.s) for x, y in pts]

    # ---------- area
    def area(self, pts, color, smooth=True, alpha=255, outline=None, block=False, width=2):
        poly = catmull(pts, 8, closed=True) if smooth else pts
        self.d.polygon(self.P(poly), fill=color + (alpha,), outline=outline, width=width if outline else 0)
        if block:
            self.blocked.append(Polygon(poly))
        return Polygon(poly)

    def ellipse_area(self, cx, cy, rx, ry, color, outline=None, block=True):
        pts = [(cx + rx * math.cos(a), cy + ry * math.sin(a)) for a in [i * math.pi / 24 for i in range(48)]]
        return self.area(pts, color, smooth=False, outline=outline, block=block)

    def sawah(self, pts, angle=20):
        poly = self.area(pts, C["sawah"], block=True)
        minx, miny, maxx, maxy = poly.bounds
        for k in range(-80, 80, 3):
            a = math.radians(angle)
            cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
            line = LineString([(cx - 100 * math.cos(a) - k * math.sin(a), cy - 100 * math.sin(a) + k * math.cos(a)),
                               (cx + 100 * math.cos(a) - k * math.sin(a), cy + 100 * math.sin(a) + k * math.cos(a))])
            seg = line.intersection(poly)
            for g in getattr(seg, "geoms", [seg]):
                if not g.is_empty and g.geom_type == "LineString":
                    self.d.line(self.P(list(g.coords)), fill=C["sawah_line"], width=2)

    # ---------- garis
    def river(self, pts, width):
        sm = catmull(pts, 12)
        self.d.line(self.P(sm), fill=C["water_edge"], width=int((width + 1) * self.s), joint="curve")
        self.d.line(self.P(sm), fill=C["water"], width=int(width * self.s), joint="curve")
        self.blocked.append(LineString(sm).buffer(width / 2 + 0.5))
        return sm

    def rail(self, pts):
        sm = catmull(pts, 12)
        self.d.line(self.P(sm), fill=(150, 140, 120), width=int(2.2 * self.s))
        ls = LineString(sm)
        L = ls.length
        k = 0.0
        while k < L:
            p = ls.interpolate(k); q = ls.interpolate(min(L, k + 0.5))
            ang = math.atan2(q.y - p.y, q.x - p.x) + math.pi / 2
            dx, dy = math.cos(ang) * 1.2, math.sin(ang) * 1.2
            self.d.line(self.P([(p.x - dx, p.y - dy), (p.x + dx, p.y + dy)]), fill=C["rail"], width=2)
            k += 1.2
        self.d.line(self.P(sm), fill=C["rail"], width=max(2, int(0.25 * self.s)))
        self.blocked.append(ls.buffer(1.6))
        return sm

    def road(self, pts, kind="jalan", width=None, closed=False, name=None):
        wd = width or {"raya": 5, "jalan": 3.5, "gang": 2, "setapak": 1.2}[kind]
        sm = catmull(pts, 12, closed=closed)
        if closed:
            sm = sm + [sm[0]]
        fill = {"raya": C["raya"], "jalan": C["jalan"], "gang": C["gang"], "setapak": C["tanah"]}[kind]
        edge = {"raya": C["raya_edge"], "jalan": shade(C["jalan"], .75), "gang": C["gang_edge"], "setapak": shade(C["tanah"], .8)}[kind]
        self.roads.append((sm, wd, fill, edge, kind, name))
        self.blocked.append(LineString(sm).buffer(wd / 2 + 0.3))
        return sm

    def draw_roads(self):
        for sm, wd, fill, edge, kind, name in self.roads:
            self.d.line(self.P(sm), fill=edge, width=int((wd + 0.6) * self.s), joint=None if sm[0] == sm[-1] else "curve")
            for p in (sm[0], sm[-1]):
                r = (wd + 0.6) / 2 * self.s
                self.d.ellipse((p[0] * self.s - r, p[1] * self.s - r, p[0] * self.s + r, p[1] * self.s + r), fill=edge)
        for sm, wd, fill, edge, kind, name in self.roads:
            self.d.line(self.P(sm), fill=fill, width=int(wd * self.s), joint=None if sm[0] == sm[-1] else "curve")
            if sm[0] == sm[-1]:
                for p in sm[::3]:
                    r = wd / 2 * self.s
                    self.d.ellipse((p[0] * self.s - r, p[1] * self.s - r, p[0] * self.s + r, p[1] * self.s + r), fill=fill)
            for p in (sm[0], sm[-1]):
                r = wd / 2 * self.s
                self.d.ellipse((p[0] * self.s - r, p[1] * self.s - r, p[0] * self.s + r, p[1] * self.s + r), fill=fill)
        for sm, wd, fill, edge, kind, name in self.roads:
            if kind == "raya":
                ls = LineString(sm); L = ls.length; k = 0.0
                while k < L - 1:
                    a, b = ls.interpolate(k), ls.interpolate(k + 1.2)
                    self.d.line(self.P([(a.x, a.y), (b.x, b.y)]), fill=(236, 232, 200), width=2)
                    k += 2.6
        for sm, wd, fill, edge, kind, name in self.roads:
            if name:
                ls = LineString(sm)
                p = ls.interpolate(0.5, normalized=True)
                f = font(13 if kind == "raya" else 11, True)
                tb = self.d.textbbox((0, 0), name, font=f)
                x, y = p.x * self.s - (tb[2] - tb[0]) / 2, p.y * self.s - (tb[3] - tb[1]) / 2 - 1
                self.d.rectangle((x - 3, y - 1, x + tb[2] - tb[0] + 3, y + tb[3] - tb[1] + 4), fill=(40, 40, 44, 170))
                self.d.text((x, y), name, font=f, fill=(250, 250, 240))

    # ---------- bangunan
    def bldg(self, cx, cy, w, h, ang=0, color=(200, 180, 160), roof=True, block=True, outline=(60, 50, 44)):
        g = rotate(box(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), ang, origin=(cx, cy))
        pts = list(g.exterior.coords)
        self.d.polygon(self.P(pts), fill=color, outline=outline, width=2)
        if roof and min(w, h) >= 1.5:  # garis bubungan
            a = math.radians(ang)
            if w >= h:
                dx, dy = math.cos(a) * (w / 2 - h / 3), math.sin(a) * (w / 2 - h / 3)
            else:
                dx, dy = -math.sin(a) * (h / 2 - w / 3), math.cos(a) * (h / 2 - w / 3)
            self.d.line(self.P([(cx - dx, cy - dy), (cx + dx, cy + dy)]), fill=shade(color, .72), width=2)
            # sisi gelap atap
            half = g.exterior.coords
            self.d.polygon(self.P([half[0], half[1], (cx + dx, cy + dy), (cx - dx, cy - dy)] if w >= h else
                                  [half[1], half[2], (cx + dx, cy + dy), (cx - dx, cy - dy)]), fill=shade(color, .86))
        if block:
            self.blocked.append(g.buffer(0.4))
        return g

    def free(self, geom):
        if not self.mapbox.buffer(-0.5).contains(geom):
            return False
        return not any(geom.intersects(b) for b in self.blocked)

    def houses_along(self, sm, region=None, spacing=(2.6, 4.0), depth=(2.5, 4.0), width=(2.2, 3.4), gap=(0.4, 1.4),
                     roofs="roof_kampung", sides=(-1, 1), jitter=10, skip=0.12, yard=None):
        ls = LineString(sm)
        L = ls.length
        wd = 3
        for sm2, w2, *_ in self.roads:
            if sm2 is sm:
                wd = w2
        for side in sides:
            k = self.rng.uniform(0.5, 2)
            while k < L - 1:
                w = self.rng.uniform(*width)
                p = ls.interpolate(k); q = ls.interpolate(min(L, k + 0.4))
                ang = math.atan2(q.y - p.y, q.x - p.x)
                dep = self.rng.uniform(*depth)
                off = wd / 2 + self.rng.uniform(*gap) + dep / 2
                cx = p.x + side * -math.sin(ang) * off
                cy = p.y + side * math.cos(ang) * off
                a = math.degrees(ang) + self.rng.uniform(-jitter, jitter)
                g = rotate(box(cx - w / 2, cy - dep / 2, cx + w / 2, cy + dep / 2), a, origin=(cx, cy))
                if self.rng.random() > skip and (region is None or region.contains(g)) and self.free(g.buffer(0.2)):
                    if yard:
                        yg = g.buffer(yard, join_style=2)
                        self.d.polygon(self.P(list(yg.exterior.coords)), fill=(196, 214, 160), outline=(150, 170, 120))
                    self.bldg(cx, cy, w, dep, a, self.rng.choice(C[roofs]))
                    if yard:
                        self.blocked.append(g.buffer(yard))
                k += w + self.rng.uniform(*spacing) - 2.0

    def fill_houses(self, region, n, size=(2.2, 3.4), roofs="roof_kampung"):
        """Rumah acak di dalam wilayah (kampung padat di antara gang)."""
        minx, miny, maxx, maxy = region.bounds
        tries = 0
        placed = 0
        while placed < n and tries < n * 40:
            tries += 1
            cx, cy = self.rng.uniform(minx, maxx), self.rng.uniform(miny, maxy)
            w, h = self.rng.uniform(*size), self.rng.uniform(*size)
            a = self.rng.uniform(-35, 35)
            g = rotate(box(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), a, origin=(cx, cy))
            if region.contains(g) and self.free(g.buffer(0.3)):
                self.bldg(cx, cy, w, h, a, self.rng.choice(C[roofs]))
                placed += 1

    def forest(self, pts, n, tint=(78, 120, 64), r=(1.0, 2.0)):
        poly = self.area(pts, tint, alpha=120)
        self.forests.append((poly, n, r))
        return poly

    def trees(self, region, n, r=(0.8, 1.6), block=False):
        minx, miny, maxx, maxy = region.bounds
        tries = 0; placed = 0
        while placed < n and tries < n * 30:
            tries += 1
            x, y = self.rng.uniform(minx, maxx), self.rng.uniform(miny, maxy)
            rr = self.rng.uniform(*r)
            g = Point(x, y).buffer(rr * 0.8)
            if region.contains(g) and self.free(g):
                s = self.s
                self.d.ellipse(((x + .3) * s - rr * s, (y + .4) * s - rr * s, (x + .3) * s + rr * s, (y + .4) * s + rr * s), fill=(60, 80, 50, 110))
                self.d.ellipse((x * s - rr * s, y * s - rr * s, x * s + rr * s, y * s + rr * s), fill=self.rng.choice([C["tree"], C["tree2"]]), outline=(56, 96, 52))
                self.d.ellipse(((x - rr * .35) * s - rr * .35 * s, (y - rr * .35) * s - rr * .35 * s, (x - rr * .35) * s + rr * .35 * s, (y - rr * .35) * s + rr * .35 * s), fill=(130, 176, 104))
                placed += 1
                if block:
                    self.blocked.append(g)

    # ---------- label
    def text(self, x, y, t, size=13, bold=True, fill=(30, 30, 30), bg=None, center=True):
        f = font(size, bold)
        lines = t.split("\n")
        hgt = sum(self.d.textbbox((0, 0), l, font=f)[3] + 2 for l in lines)
        yy = y * self.s - hgt / 2 if center else y * self.s
        for l in lines:
            tb = self.d.textbbox((0, 0), l, font=f)
            xx = x * self.s - (tb[2] - tb[0]) / 2 if center else x * self.s
            if bg:
                self.d.rectangle((xx - 3, yy - 1, xx + tb[2] - tb[0] + 3, yy + tb[3] + 2), fill=bg)
            self.d.text((xx, yy), l, font=f, fill=fill)
            yy += tb[3] + 2

    def district(self, x, y, t):
        self.text(x, y, t, 20, True, (255, 255, 255, 235), bg=(40, 40, 40, 120))

    def mark(self, x, y, num, desc, color=(196, 40, 40)):
        s = self.s; r = 12
        self.d.ellipse((x * s - r, y * s - r, x * s + r, y * s + r), fill=color, outline=(255, 255, 255), width=2)
        f = font(12, True)
        tb = self.d.textbbox((0, 0), str(num), font=f)
        self.d.text((x * s - (tb[2] - tb[0]) / 2, y * s - (tb[3] - tb[1]) / 2 - 2), str(num), font=f, fill=(255, 255, 255))
        self.legend.append((num, desc, color))

    def finish(self, path, notes=()):
        d = self.d
        x0 = int(self.w * self.s)
        d.rectangle((x0, 0, self.W, self.H), fill=(250, 248, 240))
        d.line((x0, 0, x0, self.H), fill=(60, 60, 60), width=3)
        y = 16
        d.text((x0 + 16, y), "Keterangan", font=font(17, True), fill=(30, 30, 30)); y += 32
        for num, desc, color in self.legend:
            d.ellipse((x0 + 16, y, x0 + 38, y + 22), fill=color)
            f = font(12, True); tb = d.textbbox((0, 0), str(num), font=f)
            d.text((x0 + 27 - (tb[2] - tb[0]) / 2, y + 4), str(num), font=f, fill=(255, 255, 255))
            lines = wrap(desc, 36)
            for i, l in enumerate(lines):
                d.text((x0 + 46, y + 3 + i * 16), l, font=font(12, i == 0), fill=(30, 30, 30))
            y += max(26, 16 * len(lines) + 8)
        y += 8
        for n in notes:
            for l in wrap(n, 44):
                d.text((x0 + 16, y), l, font=font(12), fill=(70, 70, 70)); y += 16
            y += 6
        # bar bawah
        top = int(self.h * self.s)
        d.rectangle((0, top, x0, self.H), fill=(250, 248, 240))
        d.line((0, top, x0, top), fill=(60, 60, 60), width=3)
        d.text((14, top + 10), self.title, font=font(17, True), fill=(30, 30, 30))
        d.text((14, top + 38), self.sub, font=font(13), fill=(70, 70, 70))
        # skala & arah utara
        L = 10 * self.s
        d.rectangle((x0 - 30 - L, top - 30, x0 - 30, top - 24), fill=(30, 30, 30))
        d.text((x0 - 30 - L, top - 48), "10 petak", font=font(12, True), fill=(30, 30, 30))
        d.polygon([(x0 - 40, 14), (x0 - 50, 44), (x0 - 30, 44)], fill=(30, 30, 30))
        d.text((x0 - 45, 46), "U", font=font(15, True), fill=(30, 30, 30))
        self.im.save(os.path.join(HERE, path))


def wrap(t, n):
    out = []
    for para in t.split("\n"):
        line = ""
        for wd in para.split(" "):
            if len(line) + len(wd) + 1 > n and line:
                out.append(line); line = wd
            else:
                line = (line + " " + wd).strip()
        out.append(line)
    return out


# =====================================================================
#  PETA KOTA (overview)
# =====================================================================
def peta_kota():
    m = Map(260, 180, 6, "PETA KOTA WIRABUMI (fiktif)  -  260 x 180 petak, 1 petak = 32 unit voxel",
            "Tujuh wilayah dengan suasana berbeda. Denah detail: wilayah_1 s/d wilayah_4. Angka merah = lokasi penting.", seed=7)
    # wilayah (tint)
    bukit = m.area([(0, 0), (260, 0), (260, 22), (200, 30), (150, 34), (120, 36), (70, 40), (30, 38), (0, 32)], C["hill"], smooth=False)
    m.area([(22, 60), (60, 58), (84, 66), (92, 80), (86, 100), (66, 110), (34, 110), (22, 92)], DIST["kampung"], alpha=150)
    m.area([(94, 70), (128, 66), (172, 70), (178, 96), (148, 108), (104, 108), (90, 96)], DIST["pusat"], alpha=150)
    m.area([(78, 42), (110, 38), (134, 42), (134, 64), (96, 68), (78, 60)], DIST["sekolah"], alpha=150)
    m.area([(182, 32), (232, 24), (256, 34), (256, 82), (214, 86), (184, 72)], DIST["perum"], alpha=150)
    m.area([(26, 112), (70, 112), (104, 118), (116, 134), (84, 140), (36, 134)], DIST["bantaran"], alpha=150)
    m.area([(124, 140), (200, 140), (256, 150), (256, 178), (126, 178)], DIST["selatan"], alpha=130)
    # danau kebun teh
    m.ellipse_area(214, 12, 9, 5, C["water"], outline=C["water_edge"])
    m.sawah([(2, 120), (22, 118), (28, 150), (40, 176), (2, 176)], 15)
    m.sawah([(40, 146), (100, 150), (118, 176), (48, 176)], -10)
    m.river([(0, 116), (24, 124), (52, 120), (80, 132), (110, 140), (140, 136), (170, 140), (210, 141), (260, 136)], 6)
    hutan_jati = m.forest([(202, 98), (226, 96), (258, 100), (258, 134), (232, 134), (204, 128)], 0)
    hutan_pinus = m.forest([(2, 14), (36, 14), (58, 22), (60, 40), (36, 40), (20, 44), (4, 40)], 0, tint=(70, 112, 70))
    # TPU (makam)
    makam = m.area([(184, 104), (200, 102), (202, 122), (186, 124)], (176, 186, 150), smooth=False, outline=(120, 120, 100), block=True)
    for i in range(6):
        for j in range(8):
            x, y = 187 + i * 2.4, 105 + j * 2.2
            m.d.rectangle((x * m.s, y * m.s, (x + 1) * m.s, (y + 0.5) * m.s), fill=(236, 236, 228), outline=(130, 130, 120))
    m.rail([(9, 0), (11, 50), (15, 100), (19, 140), (23, 180)])
    raya = m.road([(0, 80), (30, 76), (62, 84), (96, 88), (128, 84), (160, 92), (196, 88), (230, 94), (260, 92)], "raya", name="Jl. Raya Wirabumi")
    merdeka = m.road([(128, 84), (125, 68), (118, 52), (121, 36), (132, 22), (138, 0)], "jalan", 4, name="Jl. Merdeka")
    selatan = m.road([(108, 88), (111, 106), (116, 124), (120, 140), (130, 160), (150, 178)], "jalan", 4)
    m.road([(121, 36), (150, 30), (180, 26), (205, 20), (228, 12), (244, 8), (260, 6)], "jalan", 3)   # ke kebun teh, terus ke luar kota
    m.road([(118, 46), (98, 36), (84, 24), (76, 13), (72, 12.4)], "gang", 2.2)            # ke menara, tembus ke jalur sepeda
    m.road([(132, 22), (110, 16), (86, 10), (60, 14), (40, 8), (20, 13), (0, 11)], "setapak", 1.6)  # jalur sepeda bukit, tembus ke barat
    m.road([(110, 16), (106, 9), (102, 5)], "setapak", 1.2)                                # ke gua kapur
    m.road([(15, 60), (13, 46), (18, 34), (28, 26), (40, 8)], "gang", 2)                   # stasiun ke bumi perkemahan
    perum = m.road([(196, 88), (204, 72), (214, 60), (226, 50), (238, 40), (250, 32), (260, 30)], "jalan", 3.5)
    m.road([(214, 60), (200, 50), (192, 40), (186, 32), (182, 27)], "jalan", 3)          # tembus ke jalan kebun teh
    m.road([(226, 50), (240, 62), (248, 72), (254, 77), (260, 80)], "jalan", 3)
    m.road([(150, 30), (154, 42), (164, 51), (180, 55), (200, 50)], "jalan", 3)           # jalan GOR, sekolah ke perumahan
    g1 = m.road([(34, 77), (36, 88), (30, 98), (38, 108), (38, 113)], "gang")
    g2 = m.road([(60, 83), (56, 94), (62, 102), (74, 108), (76, 116.5)], "gang")
    g3 = m.road([(36, 88), (46, 92), (56, 94)], "gang"); g4 = m.road([(30, 98), (44, 104), (62, 102)], "gang")
    g5 = m.road([(46, 79), (44, 66), (52, 60), (66, 54), (84, 58), (97, 69)], "gang")    # tembus ke belakang sekolah
    g6 = m.road([(72, 86), (80, 96), (78, 106), (84, 110), (96, 112), (110, 108)], "gang")
    ban = m.road([(0, 104), (14, 108), (30, 112), (50, 114), (74, 118), (98, 126), (113, 124)], "gang")
    m.road([(14, 108), (20, 121), (26, 136), (30, 156), (34, 180)], "setapak", 1.4)       # pematang + rakit penyeberangan
    stm = m.road([(120, 142), (146, 150), (170, 154), (192, 152), (195, 162)], "jalan", 3)
    m.road([(170, 166), (200, 163), (236, 166), (247, 172), (226, 177.5), (190, 177.5), (168, 173)], "raya", 3.5, closed=True)
    m.road([(247, 172), (254, 170), (260, 169)], "jalan", 3)                              # sirkuit ke luar kota
    m.road([(130, 160), (140, 168), (155, 170), (169, 170)], "jalan", 3)                  # jalan selatan ke sirkuit
    m.road([(15, 60), (24, 66), (34, 77)], "jalan", 3)  # stasiun ke kampung
    m.road([(96, 88), (98, 70), (104, 64)], "jalan", 3)   # pintu belakang sekolah
    m.road([(160, 92), (166, 104), (172, 114), (176, 126), (180, 140), (184, 152), (194, 157)], "jalan", 3)  # jembatan timur
    m.road([(230, 94), (232, 104), (226, 116), (234, 128), (248, 124), (260, 120)], "jalan", 3)  # jalan hutan jati
    m.road([(226, 116), (212, 112), (206, 102), (214, 98), (232, 104)], "setapak", 1.3, closed=False)  # setapak hutan
    m.road([(234, 128), (244, 132), (252, 130)], "setapak", 1.3)
    m.road([(30, 156), (44, 162), (57, 164)], "setapak", 1.3)                              # ke kandang sapi
    m.road([(115, 118), (122, 117), (128, 117)], "jalan", 2.6)                             # ke pasar loak
    m.road([(176, 126), (171, 125), (167, 125)], "jalan", 2.6)                             # ke pabrik es
    m.road([(174, 118), (180, 115), (184, 114)], "gang", 2)                                # ke TPU
    m.road([(28, 26), (40, 29), (48, 30)], "setapak", 1.2)                                 # ke curug
    m.road([(232, 104), (235, 108), (236, 110.5)], "setapak", 1.1)                          # ke rumah pohon
    m.draw_roads()
    # bangunan kunci (besar)
    m.bldg(110, 54, 18, 12, -8, (238, 226, 200))     # sekolah (blok)
    m.text(110, 54, "SMA 3", 12, True)
    m.bldg(19, 58, 8, 5, 4, (190, 206, 228))          # stasiun
    m.ellipse_area(146, 76, 10, 6, C["field"], outline=(110, 150, 90))  # alun-alun
    m.bldg(146, 64, 7, 5, 0, (176, 220, 214))         # masjid
    m.bldg(114, 98, 11, 8, 6, (240, 190, 110))        # pasar
    m.bldg(178, 98, 9, 6, -6, (200, 178, 222))        # plaza
    m.bldg(50, 131, 6, 4, 8, (150, 90, 80))           # gudang markas
    m.ellipse_area(88, 104, 7, 4.5, C["field"], outline=(110, 150, 90))   # lapangan bola
    m.bldg(150, 158, 10, 6, 10, (220, 140, 140))      # STM
    m.area([(196, 147), (226, 147), (228, 159), (198, 160)], (190, 186, 176), smooth=False, outline=(110, 100, 90), block=True)
    m.bldg(224, 56, 6, 5, 25, (120, 80, 72))          # rumah Bram
    m.bldg(84, 18, 3, 3, 0, (170, 170, 180))          # menara
    m.bldg(168, 44, 12, 7, -6, (150, 200, 150))       # GOR kota
    m.area([(158, 50), (164, 49), (164.5, 54), (158.5, 54.5)], C["water"], smooth=False, block=True, outline=(255, 255, 255))  # kolam renang
    m.ellipse_area(30, 28, 7, 5, (196, 214, 150), outline=(120, 150, 90))      # bumi perkemahan
    for x, y in ((27, 27), (31, 30), (34, 26)):
        m.d.polygon(m.P([(x - 1, y + 0.8), (x + 1, y + 0.8), (x, y - 0.8)]), fill=(214, 120, 70), outline=(90, 50, 30))
    m.ellipse_area(52, 30, 3, 2.2, C["water"], outline=C["water_edge"])          # curug & kolam
    m.bldg(102, 5, 4, 2.5, 0, (90, 84, 78))           # gua kapur (mulut gua)
    m.area([(128, 112), (146, 110), (148, 122), (130, 124)], (200, 180, 150), smooth=False, outline=(120, 100, 80), block=True)  # pasar loak
    for i in range(5):
        m.bldg(131 + i * 3.2, 115, 2.4, 2, 0, [(200, 90, 80), (90, 140, 200), (220, 180, 80), (120, 170, 110), (170, 120, 180)][i])
    m.bldg(162, 124, 10, 6, 4, (170, 176, 184))       # pabrik es tua
    m.bldg(246, 98, 10, 5, 0, (200, 200, 210))        # terminal bus antarkota
    m.ellipse_area(70, 49, 4, 2.6, C["water"], outline=C["water_edge"])          # kolam pemancingan
    m.bldg(236, 112, 2.5, 2.5, 30, (150, 110, 70))    # rumah pohon
    m.bldg(250, 128, 4, 3, -10, (130, 110, 90))       # pondok penebang
    m.area([(178, 137), (186, 137), (186, 143), (178, 143)], (150, 150, 160), smooth=False, outline=(80, 80, 90))  # jembatan timur
    m.area([(19, 120), (23, 120), (23, 125), (19, 125)], (180, 140, 90), smooth=False, outline=(90, 60, 30))     # rakit
    m.area([(56, 160), (72, 158), (74, 168), (58, 170)], (196, 170, 120), smooth=False, outline=(120, 90, 60), block=True)  # kandang
    m.bldg(64, 164, 6, 3.5, 4, (170, 110, 80))
    # rumah otomatis
    reg_k = Polygon([(22, 60), (60, 58), (84, 66), (92, 80), (86, 100), (66, 110), (34, 110), (22, 92)])
    for g in (g1, g2, g3, g4, g5, g6):
        m.houses_along(g, reg_k, spacing=(2.2, 3.2), depth=(2.4, 3.2), width=(2.2, 3.0))
    m.houses_along(raya, reg_k, spacing=(2.2, 3.0))
    m.fill_houses(reg_k, 40)
    reg_p = Polygon([(94, 70), (128, 66), (172, 70), (178, 96), (148, 108), (104, 108), (90, 96)])
    m.houses_along(raya, reg_p, spacing=(2.7, 2.9), depth=(3.5, 4), width=(3, 3.6), gap=(0.7, 0.9), roofs="roof_ruko", jitter=0)
    m.houses_along(merdeka, reg_p, spacing=(2.7, 2.9), depth=(3.5, 4), width=(3, 3.6), gap=(0.7, 0.9), roofs="roof_ruko", jitter=0)
    m.houses_along(selatan, reg_p, spacing=(2, 2.4), gap=(0.7, 0.9), roofs="roof_ruko", jitter=0)
    m.fill_houses(reg_p, 18, (2.6, 4), "roof_ruko")
    reg_pr = Polygon([(182, 32), (232, 24), (256, 34), (256, 82), (214, 86), (184, 72)])
    for sm, *_ in [r for r in m.roads if r[0] is perum] + [r for r in m.roads[-12:]]:
        pass
    for sm, wd, *_ in m.roads:
        m.houses_along(sm, reg_pr, spacing=(4, 5), depth=(3.5, 4.5), width=(3.5, 4.5), gap=(1, 1.5), roofs="roof_perum", jitter=0, yard=0.8)
    reg_b = Polygon([(26, 108), (70, 110), (104, 116), (112, 128), (84, 132), (36, 128)])
    m.houses_along(ban, reg_b, spacing=(1.8, 2.6), depth=(2, 2.8), width=(2, 2.6), jitter=18)
    m.fill_houses(reg_b, 16, (1.8, 2.6))
    reg_s = Polygon([(124, 140), (200, 140), (256, 150), (256, 178), (126, 178)])
    m.houses_along(stm, reg_s, spacing=(3, 6), skip=0.4)
    m.trees(bukit, 260, (1.2, 2.4))
    m.trees(hutan_jati, 170, (1.1, 2.0))
    m.trees(hutan_pinus, 90, (1.0, 1.8))
    m.trees(Polygon([(0, 30), (260, 30), (260, 180), (0, 180)]), 260, (0.9, 1.8))
    # nama wilayah
    m.district(52, 70, "PERKAMPUNGAN\nKENANGA (W1)")
    m.district(156, 102, "PUSAT KOTA &\nJALAN RAYA (W3)")
    m.district(222, 40, "PERUMAHAN\nBUKIT ASRI (W2)")
    m.district(66, 126, "BANTARAN KALI (W4)")
    m.district(214, 132, "SELATAN: STM, PROYEK,\nSIRKUIT (W4)")
    m.district(104, 44, "KAWASAN SEKOLAH")
    m.district(150, 10, "PERBUKITAN UTARA")
    m.district(232, 118, "HUTAN JATI\nTIMUR")
    m.text(30, 20, "Hutan Pinus Cemara", 12, True, (240, 250, 230))
    m.text(193, 100, "TPU Bhakti", 11, True, (40, 50, 30))
    m.text(60, 146, "sawah", 13, True, (60, 90, 40))
    m.text(42, 117, "Kali Cendana", 12, True, (20, 60, 110))
    # penanda
    pts = [
        (110, 62, "SMA Negeri 3 Wirabumi (denah: sekolah_luar/)"), (19, 64, "Stasiun Wirabumi (pembuka game)"),
        (46, 86, "Warkop Simpang & rumah Om Darto"), (146, 76, "Alun-alun (pasar malam Sabtu)"),
        (146, 60, "Masjid Agung"), (114, 98, "Pasar Wirabumi & terminal angkot"),
        (170, 84, "Ruko Pelita, bengkel Mas Fajar"), (178, 98, "Plaza Wirabumi (mal & bioskop)"),
        (224, 56, "Rumah Bram (Perumahan Bukit Asri)"), (50, 131, "Gudang markas Lampu Kota"),
        (88, 104, "Lapangan bola kampung"), (150, 158, "STM Karya Bangsa (rival)"),
        (212, 153, "Lahan proyek PT Graha Megantara"), (207, 171, "Jalan Lingkar: sirkuit balap"),
        (84, 22, "Menara pemancar (spot rahasia)"), (60, 14, "Jalur sepeda turunan Bukit Cemara"),
        (214, 12, "Kebun teh & danau (mancing, kencan)"), (126, 46, "Taman kota & lapangan basket umum"),
        (168, 40, "GOR Kota & kolam renang umum"), (193, 113, "TPU Bhakti (pemakaman)"),
        (236, 112, "Rumah pohon tua (Hutan Jati)"), (250, 128, "Pondok penebang terbengkalai"),
        (30, 32, "Bumi perkemahan Hutan Pinus"), (52, 27, "Curug Cemara (air terjun kecil)"),
        (102, 5, "Gua Kapur (rahasia)"), (138, 108, "Pasar loak & lapak rongsok"),
        (162, 129, "Pabrik es tua (kosong)"), (246, 104, "Terminal bus antarkota"),
        (70, 49, "Kolam pemancingan Pak Haji"), (182, 136, "Jembatan Timur (Bab 7+)"),
        (21, 128, "Rakit penyeberangan & pematang"), (66, 158, "Kandang sapi & gubuk sawah"),
    ]
    for i, (x, y, t) in enumerate(pts, 1):
        m.mark(x, y, i, t)
    m.finish("peta_kota.png", [
        "Jalan abu tua bergaris = jalan raya (mobil, angkot, motor). Abu muda = jalan biasa. Krem = gang kampung (motor & sepeda). Cokelat = jalan tanah/setapak.",
        "Tidak ada blok kotak: jalan mengikuti sungai, bukit, dan rel. Tiap wilayah punya pola rumah sendiri: kampung padat & miring-miring, perumahan berhalaman dan rapi, ruko berderet di jalan raya.",
        "Hampir tidak ada jalan buntu: gang tembus ke gang lain, jalan utama terus sampai tepi peta (keluar kota).",
    ])


# =====================================================================
#  WILAYAH 1: PERKAMPUNGAN KENANGA
# =====================================================================
def wilayah_kampung():
    m = Map(84, 60, 14, "WILAYAH 1: PERKAMPUNGAN KENANGA  -  84 x 60 petak",
            "Gang sempit berkelok, rumah rapat, warung, pos ronda. Rumah pemain & Warkop Simpang ada di simpang tengah.", seed=11)
    m.area([(56, 6), (82, 4), (82, 22), (64, 22)], (120, 168, 90), block=True)  # kebun pisang
    m.ellipse_area(74, 14, 4, 2.6, C["water"], outline=C["water_edge"])          # kolam ikan
    m.river([(0, 4), (14, 8), (26, 4), (40, 6), (54, 2)], 1.8)                   # selokan/kali kecil utara
    raya = m.road([(0, 55), (24, 52), (48, 56), (84, 53)], "raya", name="Jl. Raya Wirabumi")
    main = m.road([(32, 53), (30, 44), (35, 33), (31, 22), (37, 12), (35, 0)], "gang", 3, name="Gang Kenanga")
    a = m.road([(30, 44), (18, 41), (6, 45), (0, 44)], "gang", 2.2)
    b = m.road([(35, 33), (46, 30), (58, 34), (70, 30), (84, 32)], "gang", 2.4)
    c = m.road([(31, 22), (20, 19), (8, 22), (0, 20)], "gang", 2.2)
    dd = m.road([(46, 30), (49, 40), (57, 46), (66, 47)], "gang", 2)
    e = m.road([(58, 34), (61, 24), (56, 14), (44, 10)], "gang", 1.8)
    m.road([(20, 19), (22, 10), (16, 6)], "setapak"); m.road([(49, 40), (40, 43)], "setapak")
    m.road([(8, 22), (4, 30), (10, 36), (18, 41)], "setapak")
    m.draw_roads()
    # bangunan kunci
    m.area([(36.5, 36), (44, 35), (44.5, 40), (37, 40.5)], (214, 200, 170), smooth=False, block=True)   # teras warkop
    m.bldg(40.5, 38, 6, 3.6, -4, (150, 84, 64)); m.bldg(37.5, 35.6, 1.4, 1.0, 0, (230, 210, 120))        # warkop + gerobak
    m.bldg(41, 25.5, 5, 4, 8, (186, 92, 70))      # rumah Om Darto
    m.bldg(51, 24, 8, 3.5, -10, (176, 132, 96)); m.bldg(54.5, 20, 3.5, 6, -10, (176, 132, 96))   # kos L
    m.bldg(27.6, 45.5, 2, 2, 10, (160, 120, 80))  # pos ronda
    m.bldg(13, 46.5, 5, 4.5, 0, (176, 220, 214))  # musala
    m.area([(56, 38), (64, 37), (64.5, 43), (56.5, 43.5)], C["tanah"], smooth=False, block=True, outline=(150, 120, 80))  # lap voli
    m.d.line(m.P([(60.2, 37.2), (60.4, 43.3)]), fill=(250, 250, 250), width=2)
    m.bldg(27.5, 50, 3, 2.4, 4, (220, 180, 90))   # warung kelontong
    m.bldg(8, 14, 2, 2, 0, (120, 110, 100))       # makam/keramat
    m.ellipse_area(10, 28, 2.5, 2.5, (110, 150, 90), block=True)  # pohon besar
    m.bldg(20, 30, 3, 3, 20, (198, 120, 84))      # rumah Cici teman? (rumah Bu RT)
    reg = Polygon([(0, 0), (84, 0), (84, 60), (0, 60)])
    for g in (main, a, b, c, dd, e):
        m.houses_along(g, reg, spacing=(2.2, 3.0), depth=(2.6, 3.6), width=(2.4, 3.4), gap=(0.3, 1.0), jitter=14)
    m.houses_along(raya, reg, spacing=(2.2, 3), depth=(3, 4), width=(3, 4), roofs="roof_ruko", jitter=0, sides=(-1,))
    m.fill_houses(reg, 70, (2.2, 3.4))
    m.trees(reg, 90, (0.7, 1.3))
    m.d.line(m.P([(29.5, 49.5), (34.6, 49.0)]), fill=(200, 60, 60), width=5)  # gapura
    pts = [
        (40.5, 38, "Warkop Simpang (properti utama). Gerobak di depannya = level 1; naik level, bangunannya membesar ke teras."),
        (41, 25.5, "Rumah Om Darto (kamar pemain, Cici)"),
        (52, 22, "Kos-kosan Bu Narti (bisa dibeli kelas XII)"),
        (27.6, 45.5, "Pos ronda: catur, karambol, misi warga, titik wilayah geng"),
        (13, 46.5, "Musala kampung"), (60, 40, "Lapangan voli / tempat 17-an kampung"),
        (27.5, 50, "Warung kelontong Bu Darmi"), (32, 49.3, "Gapura Gang Kenanga (masuk dari jalan raya)"),
        (10, 28, "Pohon besar 'angker' (misi hantu-hantuan)"), (8, 14, "Makam kampung (event malam Jumat)"),
        (68, 12, "Kebun pisang & kolam ikan (mancing kecil)"), (20, 30, "Rumah Pak RT (misi warga, ronda)"),
        (24, 3, "Selokan besar: banjir saat musim hujan"),
    ]
    for i, (x, y, t) in enumerate(pts, 1):
        m.mark(x, y, i, t)
    m.finish("wilayah_1_perkampungan.png", [
        "Gang utama 3 petak (motor bisa lewat, papasan pelan). Gang cabang 2 petak. Setapak 1 petak: hanya jalan kaki/sepeda, jalan pintas kabur.",
        "Rumah sengaja miring dan rapat, ada yang mepet gang, ada yang bersembunyi di belakang. Bisa memakai ulang model rumah & pagar dari demo gang perumahan.",
    ])


# =====================================================================
#  WILAYAH 2: PERUMAHAN BUKIT ASRI
# =====================================================================
def wilayah_perumahan():
    m = Map(84, 60, 14, "WILAYAH 2: PERUMAHAN BUKIT ASRI  -  84 x 60 petak",
            "Kompleks elite di lereng bukit: jalan melengkung, cul-de-sac, rumah besar berhalaman, portal satpam.", seed=21)
    m.area([(0, 0), (84, 0), (84, 14), (60, 10), (30, 8), (0, 12)], C["hill"])
    masuk = m.road([(0, 56), (12, 50), (22, 46)], "jalan", 4.5, name="dari Jl. Raya")
    blv = m.road([(22, 46), (34, 40), (46, 38), (58, 32), (68, 22), (76, 12)], "jalan", 4.5, name="Boulevard Asri")
    c1 = m.road([(34, 40), (31, 30), (24, 22)], "jalan", 3.2)
    c2 = m.road([(46, 38), (50, 47), (60, 52)], "jalan", 3.2)
    c3 = m.road([(58, 32), (50, 24), (45, 15)], "jalan", 3.2)
    c4 = m.road([(68, 22), (76, 30), (79, 40)], "jalan", 3.2)
    m.road([(24, 22), (14, 20), (8, 26)], "jalan", 3)
    m.draw_roads()
    for (x, y) in [(24, 22), (60, 52), (45, 15), (79, 40), (8, 26)]:   # bundaran cul-de-sac
        m.ellipse_area(x, y, 3.2, 3.2, C["jalan"], outline=shade(C["jalan"], .75), block=True)
        m.ellipse_area(x, y, 1.0, 1.0, (120, 170, 100), block=True)
    m.bldg(22, 46, 2.2, 1.6, -25, (190, 206, 228)); m.d.line(m.P([(20, 43.5), (24.5, 48.5)]), fill=(200, 40, 40), width=4)
    # rumah Bram
    m.area([(36, 4), (52, 3), (53, 12), (37, 13)], (196, 214, 160), smooth=False, block=True, outline=(150, 170, 120))
    m.bldg(42, 8, 9, 6, 0, (120, 80, 72)); m.area([(48, 5), (52, 5), (52, 9), (48, 9)], C["water"], smooth=False, block=True, outline=(255, 255, 255))
    # taman & kolam tengah
    m.area([(36, 46), (44, 44), (44, 52), (36, 54)], (130, 186, 110), block=True)
    m.ellipse_area(40, 49, 2.4, 1.8, C["water"], outline=C["water_edge"])
    # clubhouse & lapangan tenis
    m.bldg(66, 40, 7, 5, -20, (220, 210, 190))
    m.area([(56, 56), (66, 56), (66, 59), (56, 59)], (120, 160, 130), smooth=False, block=True, outline=(250, 250, 250))
    m.bldg(14, 36, 5, 4, 10, (176, 220, 214))  # masjid kompleks
    reg = Polygon([(0, 0), (84, 0), (84, 60), (0, 60)])
    for g in (blv, c1, c2, c3, c4, masuk):
        m.houses_along(g, reg, spacing=(4.5, 6), depth=(4, 5), width=(4, 5), gap=(1.2, 1.8), roofs="roof_perum", jitter=0, yard=0.9, skip=0.05)
    m.trees(reg, 120, (0.8, 1.6))
    pts = [
        (22, 46, "Portal & pos satpam (perlu izin/menyelinap)"), (42, 8, "Rumah Bram: rumah terbesar, kolam renang. Misi menyelinap Bab 13."),
        (40, 49, "Taman & kolam kompleks (kencan sore)"), (66, 40, "Clubhouse & kolam renang (pesta anak elite)"),
        (61, 57.5, "Lapangan tenis"), (14, 36, "Masjid kompleks"), (76, 12, "Jalan tembus ke kebun teh (bukit)"),
        (8, 26, "Cul-de-sac sepi: balapan liar 'anak kompleks'"),
    ]
    for i, (x, y, t) in enumerate(pts, 1):
        m.mark(x, y, i, t, (40, 90, 170))
    m.finish("wilayah_2_perumahan.png", [
        "Kontras dengan kampung: jalan lebar dan mulus, rumah besar dengan halaman dan pagar, lebih sepi dan dijaga satpam yang berpatroli.",
        "Jalan berbelok mengikuti kontur bukit, bundaran di ujung cul-de-sac. Bagus untuk balapan sepeda turunan dan kejar-kejaran.",
    ])


# =====================================================================
#  WILAYAH 3: PUSAT KOTA & JALAN RAYA
# =====================================================================
def wilayah_pusat():
    m = Map(84, 60, 14, "WILAYAH 3: PUSAT KOTA & JALAN RAYA  -  84 x 60 petak",
            "Simpang lampu merah, ruko berderet, alun-alun bundar, pasar, terminal angkot. Paling ramai lalu lintasnya.", seed=31)
    raya = m.road([(0, 32), (20, 29), (40, 33), (62, 31), (84, 36)], "raya", 6, name="Jl. Raya Wirabumi")
    mn = m.road([(40, 33), (37, 20), (42, 8), (40, 0)], "raya", 5, name="Jl. Merdeka")
    ms = m.road([(40, 33), (35, 45), (38, 60)], "jalan", 4)
    ring = m.road([(58 + 11 * math.cos(a), 16 + 8 * math.sin(a)) for a in [i * math.pi / 8 for i in range(16)]], "jalan", 3, closed=True)
    m.road([(47, 16), (40, 18)], "jalan", 3)
    m.road([(58, 24), (60, 31)], "jalan", 3)
    pas = m.road([(35, 45), (22, 46), (8, 50), (0, 49)], "jalan", 3)
    m.road([(62, 31), (66, 42), (76, 50), (84, 52)], "jalan", 3.5)
    m.road([(20, 29), (18, 18), (10, 10)], "gang", 2)
    m.draw_roads()
    m.ellipse_area(58, 16, 8.5, 5.6, C["field"], outline=(110, 150, 90))   # alun-alun
    m.ellipse_area(55, 16, 1.6, 1.6, C["tree"]); m.ellipse_area(61, 16, 1.6, 1.6, C["tree"])  # beringin kembar
    m.bldg(73, 7, 7, 6, 0, (176, 220, 214)); m.ellipse_area(73, 7, 1.6, 1.6, (120, 190, 180))  # masjid agung
    m.bldg(20, 40, 12, 7, -4, (240, 190, 110)); m.bldg(26, 52, 9, 5, 8, (240, 200, 130))        # pasar
    m.area([(2, 52), (14, 50), (16, 58), (2, 59)], (200, 200, 200), smooth=False, outline=(120, 120, 120), block=True)  # terminal
    for i in range(4):
        m.bldg(5 + i * 2.8, 55, 1.8, 3.2, 0, (60, 140, 200), roof=False)   # angkot
    m.bldg(76, 46, 10, 7, -14, (200, 178, 222))   # plaza
    m.bldg(51, 41, 6, 4, 6, (150, 150, 160))      # bengkel Fajar
    m.bldg(28, 12, 6, 5, 0, (182, 204, 230)); m.bldg(20, 6, 5, 4, -10, (182, 204, 230))  # puskesmas, polisi
    for x in range(48, 68, 3):                                                  # lapak PKL
        m.bldg(x, 26.2, 1.6, 1.2, 0, (230, 120, 90), roof=False)
    reg = Polygon([(0, 0), (84, 0), (84, 60), (0, 60)])
    m.houses_along(raya, reg, spacing=(2.7, 2.8), depth=(4, 4.6), width=(3, 3.4), gap=(0.7, 0.8), roofs="roof_ruko", jitter=0, skip=0.05)
    m.houses_along(mn, reg, spacing=(2.7, 2.8), depth=(4, 4.6), width=(3, 3.4), gap=(0.7, 0.8), roofs="roof_ruko", jitter=0, skip=0.05)
    m.houses_along(ms, reg, spacing=(2, 2.5), depth=(3.4, 4), width=(3, 3.6), roofs="roof_ruko", jitter=0)
    m.houses_along(pas, reg, spacing=(2, 2.5), roofs="roof_kampung", jitter=6)
    m.fill_houses(reg, 20, (2.6, 3.6), "roof_ruko")
    m.trees(reg, 40, (0.7, 1.1))
    for (x, y) in [(36.5, 30), (43.5, 36)]:   # lampu merah
        m.d.ellipse((x * 14 - 5, y * 14 - 5, x * 14 + 5, y * 14 + 5), fill=(220, 40, 40), outline=(30, 30, 30))
    pts = [
        (45, 37.5, "Simpang lampu merah (macet jam pulang, razia polisi, balap 'start lampu')"),
        (58, 16, "Alun-alun: beringin kembar, pasar malam Sabtu, ngamen, kencan"),
        (73, 7, "Masjid Agung (event Ramadan)"), (20, 40, "Pasar Wirabumi (kerja subuh, Laras, bahan warkop)"),
        (8, 55, "Terminal angkot: pindah cepat antar wilayah"), (10, 26, "Ruko Pelita: warnet, kafe, toko buku, karaoke; calon Warkop lv4"),
        (76, 46, "Plaza Wirabumi (mal & bioskop)"), (51, 41, "Bengkel Mas Fajar"),
        (28, 12, "Puskesmas"), (20, 6, "Kantor polisi"), (57, 26.2, "Lapak kaki lima (cilok, sate, es)"),
    ]
    for i, (x, y, t) in enumerate(pts, 1):
        m.mark(x, y, i, t, (150, 60, 160))
    m.finish("wilayah_3_pusat_kota.png", [
        "Ruko berderet rapat menghadap jalan raya, mengikuti lengkungnya. Belakang ruko = gang servis untuk kabur dan jalan pintas.",
        "Lalu lintas padat: mobil, angkot, motor. Siang ramai, malam lampu toko menyala (sudah ada di renderer).",
    ])


# =====================================================================
#  WILAYAH 4: BANTARAN KALI & SELATAN
# =====================================================================
def wilayah_bantaran():
    m = Map(84, 60, 14, "WILAYAH 4: BANTARAN KALI & SELATAN  -  84 x 60 petak",
            "Kampung di pinggir kali, markas geng, lapangan bola, lalu seberang jembatan: STM rival, lahan proyek, sirkuit.", seed=41)
    m.sawah([(0, 34), (20, 32), (26, 50), (0, 58)], 10)
    river = m.river([(0, 22), (16, 26), (32, 22), (46, 28), (62, 26), (84, 32)], 6)
    br = m.road([(30, 0), (32, 14), (35, 30), (38, 44), (42, 60)], "jalan", 4, name="Jembatan")
    ban = m.road([(0, 13), (14, 16), (24, 12), (31, 13)], "gang", 2.2)
    m.road([(32, 14), (44, 15), (56, 16), (70, 14), (84, 18)], "gang", 2.2)
    stm = m.road([(36, 38), (50, 40), (62, 44), (84, 44)], "jalan", 3.5)
    m.road([(14, 16), (10, 30)], "setapak")
    loop = m.road([(44, 50), (60, 52), (78, 54), (82, 58), (60, 59.5), (44, 58)], "raya", 3.5, closed=True)
    m.draw_roads()
    m.bldg(31.5, 24, 6, 5.5, 8, (150, 120, 90), roof=False)   # jembatan (deck)
    m.d.line(m.P([(28.5, 21), (29.5, 27)]), fill=(80, 60, 40), width=3); m.d.line(m.P([(34.5, 21.5), (35.5, 27.5)]), fill=(80, 60, 40), width=3)
    m.bldg(10, 36, 7, 5, 6, (150, 90, 80))       # gudang markas
    m.area([(5, 33), (16, 32), (17, 41), (5, 42)], C["tanah"], alpha=120)
    m.ellipse_area(56, 6, 8, 4.5, C["field"], outline=(250, 250, 250))  # lapangan bola
    m.bldg(56, 48, 10, 4, 4, (220, 140, 140)); m.bldg(66, 49, 4, 6, 4, (220, 140, 140))   # STM
    m.area([(70, 36), (84, 36), (84, 42), (71, 42)], (190, 186, 176), smooth=False, outline=(110, 100, 90), block=True)  # proyek
    m.bldg(76, 38.5, 3, 2, 30, (230, 180, 40), roof=False); m.bldg(80, 40, 2, 1.4, -20, (230, 180, 40), roof=False)
    m.bldg(46, 56, 1.5, 3.2, 0, (250, 250, 250), roof=False)  # garis start
    reg_n = Polygon([(0, 0), (84, 0), (84, 26), (0, 18)])
    m.houses_along(ban, reg_n, spacing=(1.7, 2.4), depth=(2, 2.8), width=(2, 2.8), jitter=20)
    m.fill_houses(reg_n, 45, (1.8, 2.8))
    for sm, *_ in m.roads:
        pass
    reg_s = Polygon([(26, 30), (84, 30), (84, 60), (26, 60)])
    m.houses_along(stm, reg_s, spacing=(3, 5), skip=0.35)
    m.trees(Polygon([(0, 0), (84, 0), (84, 60), (0, 60)]), 70, (0.7, 1.4))
    # rumah panggung di tepi air
    for x in range(2, 28, 4):
        m.bldg(x + 1, 19.5 + (x % 3) * 0.4, 2.4, 2.2, -8, (176, 132, 96))
    pts = [
        (10, 36, "Gudang tua: markas Lampu Kota (latihan, garasi)"), (12, 19, "Kampung Bantaran: rumah panggung di tepi kali, banjir musim hujan"),
        (56, 6, "Lapangan bola kampung (liga Minggu)"), (31.5, 24, "Jembatan: titik kejar-kejaran & wilayah rebutan geng"),
        (58, 48, "STM Karya Bangsa: markas Serigala Besi"), (77, 39, "Lahan proyek PT Graha Megantara (set piece Bab 13)"),
        (46, 56, "Garis start Jalan Lingkar: balap resmi Minggu / liar malam"), (14, 46, "Sawah: jalan pintas tanah saat kabur"),
        (22, 13, "Pangkalan ojek (kerja ojek)"), (11, 24, "Jembatan bambu (jalan pintas, motor tidak bisa lewat)"),
    ]
    for i, (x, y, t) in enumerate(pts, 1):
        m.mark(x, y, i, t, (170, 90, 40))
    m.finish("wilayah_4_bantaran.png", [
        "Sungai memotong wilayah jadi dua. Jembatan utama cuma satu, jadi jadi titik penting saat kejar-kejaran dan perebutan wilayah geng. Di barat ada jembatan bambu kecil (jalan kaki & sepeda saja) untuk kabur.",
        "Utara kali: kampung paling padat dan miring-miring. Selatan: lebih terbuka (sawah, sekolah rival, proyek, sirkuit).",
    ])


if __name__ == "__main__":
    peta_kota(); wilayah_kampung(); wilayah_perumahan(); wilayah_pusat(); wilayah_bantaran()
    print("selesai")
