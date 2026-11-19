"""Peta seluruh daerah Wirabumi: kota (260 x 180, sama persis dengan peta_kota.png) + gunung, pantai,
desa, waduk, kawasan industri, asrama batalyon, dan Sirkuit Tanjung Pradana.

Jalankan:  python peta_dunia.py   (butuh Pillow, shapely; memakai peta_organik.py)
Hasil:
  peta_dunia.png   peta seluruh daerah
  peta_balap.png   peta yang sama + rute balap liar, sirkuit resmi, pos razia, dan akses

Koordinat SAMA dengan peta kota (petak, x ke timur, y ke selatan). Kota tetap di 0..260 x 0..180,
daerah baru memakai koordinat negatif (utara/barat) dan lebih dari 260/180 (timur/selatan).
Jadi game cukup memperluas dunia; posisi bangunan kota tidak bergeser.
"""
import math, random
from shapely.geometry import LineString, Polygon, Point, box
from shapely.ops import unary_union
import peta_organik as po
from peta_organik import Map, C, DIST, catmull, shade, font, wrap

X0, Y0, W, H = -150, -130, 560, 440      # batas dunia: x -150..410, y -130..310
SEA = (70, 132, 190)
SAND = (232, 214, 160)
TEA = (120, 170, 90)
GRAVEL = (214, 200, 168)


def blob(cx, cy, rx, ry, rng, n=28, k=0.12):
    """Poligon tidak beraturan (kontur gunung, danau)."""
    ph = [rng.uniform(0, 6.28) for _ in range(3)]
    pts = []
    for i in range(n):
        a = i / n * 2 * math.pi
        f = 1 + k * (math.sin(3 * a + ph[0]) * 0.6 + math.sin(5 * a + ph[1]) * 0.3 + math.sin(7 * a + ph[2]) * 0.2)
        pts.append((cx + rx * f * math.cos(a), cy + ry * f * math.sin(a)))
    return pts


def rows(m, pts, color, line, angle=0, step=2.2):
    """Area berbaris (kebun teh, kebun kelapa, sawah luar)."""
    poly = m.area(pts, color, block=True)
    minx, miny, maxx, maxy = poly.bounds
    cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
    a = math.radians(angle)
    R = max(maxx - minx, maxy - miny)
    k = -R
    while k < R:
        ln = LineString([(cx - R * math.cos(a) - k * math.sin(a), cy - R * math.sin(a) + k * math.cos(a)),
                         (cx + R * math.cos(a) - k * math.sin(a), cy + R * math.sin(a) + k * math.cos(a))])
        seg = ln.intersection(poly)
        for g in getattr(seg, "geoms", [seg]):
            if not g.is_empty and g.geom_type == "LineString":
                m.d.line(m.P(list(g.coords)), fill=line, width=3)
        k += step
    return poly


def poly_draw(m, g, fill, outline=None, hole=None, width=2):
    for p in getattr(g, "geoms", [g]):
        m.d.polygon(m.P(list(p.exterior.coords)), fill=fill, outline=outline, width=width if outline else 0)
        for it in p.interiors:
            m.d.polygon(m.P(list(it.coords)), fill=hole or C["grass"], outline=outline, width=width if outline else 0)


# ------------------------------------------------------------------ sirkuit
TRACK = [(344, 222), (368, 222), (392, 222), (401, 216), (400, 205), (390, 199), (378, 196), (372, 189), (375, 181),
         (386, 175), (396, 168), (398, 158), (390, 152), (378, 154), (368, 160), (358, 160), (349, 166), (352, 175),
         (346, 183), (336, 188), (328, 196), (327, 207), (332, 216)]
PIT = [(338, 219.5), (350, 217.4), (390, 217.4), (397, 213.5)]


def sirkuit(m):
    sm = catmull(TRACK, 14, closed=True); sm = sm + [sm[0]]
    track = LineString(sm)
    site = Polygon([(318, 146), (408, 146), (408, 240), (318, 240)])
    m.d.polygon(m.P(list(site.exterior.coords)), fill=(170, 200, 130), outline=(90, 90, 90), width=3)   # pagar keliling
    m.blocked.append(site)
    poly_draw(m, track.buffer(5.4), GRAVEL, hole=(170, 200, 130))                                     # gravel & run-off
    poly_draw(m, track.buffer(3.4), (150, 190, 110), hole=(170, 200, 130))                            # rumput run-off
    poly_draw(m, track.buffer(2.1), (84, 86, 92), hole=(170, 200, 130))                               # aspal
    # kerb merah-putih di tikungan (tempat sudut belok besar)
    L = track.length; d = 0.0; i = 0
    while d < L:
        p0, p1, p2 = track.interpolate(d - 2), track.interpolate(d), track.interpolate(d + 2)
        a1 = math.atan2(p1.y - p0.y, p1.x - p0.x); a2 = math.atan2(p2.y - p1.y, p2.x - p1.x)
        turn = abs((a2 - a1 + math.pi) % (2 * math.pi) - math.pi)
        if turn > 0.14:
            nx, ny = -math.sin(a1), math.cos(a1)
            for sd in (-1, 1):
                q = (p1.x + nx * sd * 2.3, p1.y + ny * sd * 2.3)
                r = 0.45 * m.s
                X, Y = m.P([q])[0]
                m.d.ellipse((X - r, Y - r, X + r, Y + r), fill=(210, 40, 40) if i % 2 else (250, 250, 250))
        d += 0.9; i += 1
    # pit lane + garasi + paddock + race control
    pl = catmull(PIT, 8)
    m.d.line(m.P(pl), fill=(110, 112, 118), width=int(1.6 * m.s))
    m.bldg(367, 213.2, 44, 2.6, 0, (226, 226, 232))                      # deret garasi pit (20 garasi)
    for k in range(20):
        X, Y = m.P([(346 + k * 2.2, 214.6)])[0]
        m.d.rectangle((X, Y - 3, X + 0.0 + 1.6 * m.s, Y), fill=(210, 60, 50) if k % 2 else (60, 90, 160))
    m.area([(342, 200), (386, 200), (386, 211), (342, 211)], (196, 196, 200), smooth=False, outline=(120, 120, 120))   # paddock
    for k in range(6):
        m.bldg(347 + k * 7, 204, 5, 3, 0, [(240, 240, 240), (200, 60, 50), (60, 90, 170), (240, 200, 60), (60, 140, 90), (230, 230, 230)][k])
    m.bldg(392, 207, 5, 4, 0, (60, 64, 72))                               # menara race control
    m.bldg(342, 207.5, 3, 3, 0, (240, 240, 240))                         # medical center
    m.d.ellipse((*m.P([(397, 198.5)])[0], *m.P([(400, 201.5)])[0]),
                fill=(90, 160, 90), outline=(250, 250, 250), width=2)     # helipad
    # tribun utama (beratap) di sisi luar lintasan lurus + tribun tikungan
    m.bldg(368, 228.4, 44, 3.2, 0, (70, 120, 180))
    for k in range(9):
        X, Y = m.P([(347 + k * 5, 227)])[0]
        m.d.line((X, Y, X, Y + 2.8 * m.s), fill=(230, 230, 240), width=2)
    m.bldg(406, 208, 2.2, 14, 0, (200, 90, 70))                          # tribun tikungan 1 (hairpin timur)
    m.bldg(321, 205, 2.2, 14, 0, (200, 90, 70))                          # tribun hairpin barat
    m.bldg(366, 149.4, 20, 2.0, 0, (200, 90, 70))                        # tribun tikungan utara
    m.bldg(342, 168, 2.0, 10, 0, (220, 160, 60))                          # tribun bukit (lesehan rumput)
    # start/finish kotak-kotak
    for k in range(6):
        X, Y = m.P([(368, 220 + k * 0.7)])[0]
        m.d.rectangle((X, Y, X + 0.7 * m.s, Y + 0.7 * m.s), fill=(20, 20, 20) if k % 2 else (250, 250, 250))
    # parkir penonton & gerbang
    m.area([(322, 233), (366, 233), (366, 239), (322, 239)], (150, 150, 156), smooth=False, outline=(100, 100, 100))
    for k in range(20):
        X, Y = m.P([(323.5 + k * 2.1, 233.4)])[0]
        m.d.line((X, Y, X, Y + 2.2 * m.s), fill=(235, 235, 235), width=1)
    m.bldg(374, 236, 6, 2, 0, (190, 60, 60))                              # gerbang tiket penonton (selatan)
    m.bldg(321.5, 190, 2, 5, 0, (90, 90, 96))                             # gerbang peserta/paddock (barat)
    # terowongan bawah lintasan ke infield (garis putus)
    for k in range(5):
        a, b = m.P([(334 + k * 1.2, 200), (334.6 + k * 1.2, 200)])
        m.d.line((a, b), fill=(40, 40, 40), width=3)
    return track


# ------------------------------------------------------------------ peta
def peta_dunia(path="peta_dunia.png"):
    m = Map(W, H, 4, "DAERAH WIRABUMI (fiktif)  -  560 x 440 petak, 1 petak = 32 unit voxel",
            "Kota Wirabumi (kotak tengah, sama dengan peta_kota.png) + gunung, pantai, desa, waduk, industri, sirkuit. Angka 1-36 di peta_kota.png.",
            legend_w=420, seed=11, x0=X0, y0=Y0)
    rng = random.Random(23)
    # ---------- dasar: lereng utara, laut, pantai
    m.area([(X0, Y0), (410, Y0), (410, 4), (330, 8), (300, 2), (260, 0), (0, 0), (-60, 8), (-150, 2)], C["hill"], smooth=False)
    coast = [(-150, 262), (-110, 266), (-70, 260), (-30, 266), (10, 270), (50, 266), (90, 270), (130, 266), (170, 268),
             (210, 266), (226, 270), (232, 282), (240, 286), (248, 276), (262, 268), (300, 270), (330, 268), (370, 272), (410, 268)]
    m.area(coast + [(410, 310), (-150, 310)], SEA, smooth=False)
    for k in range(60):      # riak
        x, y = rng.uniform(-150, 410), rng.uniform(274, 308)
        m.d.line(m.P([(x, y), (x + 3, y)]), fill=(150, 196, 230), width=2)
    beach = Polygon(coast + [(410, 262), (330, 262), (262, 262), (240, 258), (210, 260), (90, 263), (-150, 256)])
    poly_draw(m, beach.buffer(0), SAND)
    m.area([(226, 270), (232, 282), (240, 286), (248, 276), (246, 266), (232, 264)], (150, 140, 120), smooth=True, block=True)   # tanjung karang
    # ---------- gunung Sangkala (kontur)
    for (rx, ry, col) in ((150, 62, (124, 158, 94)), (112, 48, (112, 146, 86)), (80, 36, (104, 132, 80)), (54, 25, (130, 124, 90)),
                          (32, 15, (150, 136, 112)), (16, 8, (170, 160, 146))):
        m.area(blob(110, -82, rx, ry, rng, k=0.10), col)
    m.area(blob(110, -88, 6, 3.6, rng, k=0.15), (110, 190, 170), outline=(90, 90, 80), block=True)   # danau kawah
    m.area(blob(-92, -70, 40, 24, rng), (118, 150, 92)); m.area(blob(-92, -72, 18, 10, rng), (138, 132, 104))   # Bukit Batu Tulis
    hl_barat = m.forest(blob(10, -66, 46, 30, rng), 0, tint=(70, 112, 66))
    hl_timur = m.forest(blob(210, -78, 44, 26, rng), 0, tint=(70, 112, 66))
    m.area(blob(92, -100, 7, 4, rng), (214, 214, 196), outline=(150, 150, 130))     # alun-alun edelweis
    # ---------- kebun teh Sukamekar
    rows(m, [(150, -30), (200, -26), (228, -18), (230, -50), (262, -54), (286, -50), (288, -10), (300, 0), (330, -8), (330, -40), (300, -60), (262, -64), (226, -58), (190, -40)],   # kebun mengelilingi desa (U)
        
         TEA, (96, 146, 72), angle=-18)
    # ---------- waduk, sawah barat, karet, industri, batalyon, desa selatan
    waduk = m.area(blob(-88, 6, 36, 22, rng, k=0.14), C["water"], outline=C["water_edge"], block=True)
    m.sawah([(-150, 132), (-60, 130), (-8, 138), (-10, 176), (-60, 196), (-150, 200)], 25)
    m.sawah([(-6, 184), (40, 184), (90, 190), (120, 214), (100, 238), (30, 240), (-10, 228)], -12)
    m.sawah([(158, 184), (176, 186), (180, 230), (210, 236), (244, 232), (258, 238), (236, 247), (170, 247), (158, 228)], 8)   # sawah di barat & selatan desa
    karet = m.forest([(-150, 204), (-70, 200), (-30, 224), (-40, 246), (-150, 248)], 0, tint=(96, 130, 80))
    kelapa = m.forest([(-60, 252), (220, 252), (220, 260), (-60, 258)], 0, tint=(170, 190, 120))
    m.area([(282, 96), (400, 96), (404, 137), (300, 138), (282, 128)], (204, 204, 208), alpha=170)            # kawasan industri
    m.area([(292, 30), (360, 30), (362, 72), (292, 72)], (186, 196, 160), smooth=False, outline=(80, 90, 60), width=3)   # batalyon (pagar)
    m.area([(330, 248), (380, 246), (390, 262), (336, 264)], (90, 130, 90), alpha=200)                       # hutan bakau
    # ---------- sungai & rel luar kota
    sungai = [(m.river([(-73, 37), (-66, 50), (-50, 80), (-30, 104), (-12, 112), (0, 116)], 5), 5),          # dari bendungan ke Kali Cendana
              (m.river([(260, 136), (284, 146), (300, 168), (294, 198), (302, 228), (318, 248), (328, 260), (332, 272)], 7), 7)]   # Kali Cendana ke muara (lewat bakau)
    m.rail([(9, 0), (7, -30), (4, -60), (0, -100), (-4, -130)])
    m.rail([(23, 180), (27, 205), (31, 228), (34, 244)])
    for k in range(6):   # terowongan rel
        a, b = m.P([(5.6 - k * 0.4, -44 - k * 4), (5.2 - k * 0.4, -46 - k * 4)])
        m.d.line((a, b), fill=(40, 40, 40), width=6)
    # ---------- KOTA (sama persis dengan peta_kota: seed & batas sama)
    keep_box, keep_rng = m.mapbox, m.rng
    m.mapbox = box(0, 0, 260, 180); m.rng = random.Random(7)
    for _ in range(int(260 * 180 / 6)):
        m.rng.uniform(0, 1); m.rng.uniform(0, 1); m.rng.uniform(0, 1)
    isi_kota_pts = po.isi_kota(m)
    m.mapbox, m.rng = keep_box, keep_rng
    m.d.rectangle(m.P([(0, 0), (260, 180)])[0] + m.P([(260, 180)])[0], outline=(255, 255, 255), width=3)
    # ---------- jalan luar kota
    n0 = len(m.roads)
    R = m.road
    # barat
    R([(0, 80), (-30, 74), (-70, 78), (-110, 70), (-150, 72)], "raya", name="Jl. Raya Kalisari")
    R([(-70, 78), (-76, 62), (-84, 48), (-100, 42), (-118, 36), (-134, 20), (-138, -2), (-130, -24), (-112, -40), (-92, -52)], "jalan", 3.5)   # bendungan, keliling waduk (barat), ke Batu Tulis
    R([(-84, 48), (-80, 40)], "gang", 2)                                               # ke puncak bendungan
    R([(0, 11), (-24, 8), (-46, -12), (-70, -26), (-92, -34), (-112, -40)], "jalan", 3)   # stasiun/bukit ke waduk utara
    R([(0, 104), (-24, 100), (-60, 104), (-96, 100), (-130, 108), (-150, 112)], "jalan", 3, name="Jl. Tegalsari")
    R([(-60, 104), (-56, 140), (-46, 176), (-36, 210), (-24, 250)], "jalan", 3)       # Tegalsari ke pantai
    R([(-110, 70), (-104, 100)], "jalan", 3)
    # utara: Jl. Tikungan Seribu (serpentin) & Jl. Raya Puncak
    R([(138, 0), (144, -6), (128, -11), (148, -17), (128, -23), (150, -29), (130, -35), (152, -41), (152, -46), (140, -54), (128, -62)],
      "jalan", 3, name="Jl. Tikungan Seribu")
    R([(260, 6), (284, -2), (296, -9), (278, -14), (295, -20), (272, -24), (250, -28), (222, -36), (196, -42), (172, -45), (152, -46)], "jalan", 3.5, name="Jl. Raya Puncak")
    R([(40, 8), (36, -10), (44, -30), (48, -42), (54, -54), (72, -58), (98, -60), (128, -62)], "setapak", 1.6)   # perkemahan - air panas - basecamp
    R([(128, -62), (124, -70), (114, -76), (121, -82), (120, -91), (112, -96), (102, -99), (94, -101)], "setapak", 1.2)   # jalur pendakian (memutar danau kawah)
    R([(250, -28), (262, -42), (276, -56), (300, -60), (330, -48), (360, -40), (410, -42)], "jalan", 3)          # desa ke timur
    # timur
    R([(260, 92), (290, 94), (330, 90), (370, 96), (410, 94)], "raya", name="Jl. Raya Pradana")
    R([(260, 30), (290, 26), (330, 24), (370, 30), (410, 28)], "jalan", 3.5, name="Jl. Kesatrian")
    R([(260, 80), (300, 78), (326, 76), (340, 90)], "jalan", 3)
    R([(260, 120), (300, 118), (350, 116), (410, 120)], "jalan", 3.5, name="Jl. Industri")
    R([(310, 94), (314, 106), (312, 118)], "jalan", 3); R([(370, 96), (372, 108), (374, 118)], "jalan", 3)
    R([(284, -2), (300, 2), (320, 12), (330, 24)], "jalan", 3)
    # selatan
    R([(260, 169), (280, 170), (298, 176), (314, 184), (318, 200), (318, 214), (324, 232), (340, 241)], "jalan", 3.5, name="Jl. Sirkuit")
    R([(-150, 248), (-90, 246), (-24, 250), (40, 252), (100, 254), (160, 252), (210, 254), (240, 257), (270, 252), (300, 246),
       (340, 241), (380, 244), (410, 243)], "raya", name="Jl. Pesisir Selatan")
    R([(150, 178), (152, 200), (156, 226), (160, 252)], "jalan", 3.5, name="Jl. Pantai Lintang")
    jl_pd = R([(205, 180), (214, 204), (230, 230), (240, 257)], "jalan", 3)
    R([(34, 180), (36, 206), (40, 232), (40, 252)], "setapak", 1.4)
    R([(57, 164), (70, 190), (96, 214), (122, 222), (152, 214)], "gang", 2)            # kandang - desa - jalan pantai
    R([(410, 180), (390, 182)], "jalan", 3)                                             # jalan servis sirkuit timur (keluar daerah)
    R([(408, 192), (398, 191)], "jalan", 2.4)
    tpi = R([(300, 246), (304, 256), (308, 264)], "jalan", 2.6)                          # ke kampung nelayan, TPI & dermaga
    R([(240, 257), (238, 266), (236, 278)], "setapak", 1.2)                              # ke mercusuar
    # gang desa (kampung padat: rumah menghadap gang, guide 90)
    gang_tg = [R([(-120, 86), (-100, 85), (-84, 86), (-66, 87), (-52, 94)], "gang", 2, name="Gg. Melati"),
               R([(-84, 86), (-82, 101)], "gang", 2),
               R([(-66, 87), (-66, 103)], "gang", 2),
               R([(-118, 106), (-118, 121), (-100, 121), (-80, 120), (-60, 119), (-52, 116)], "gang", 2, name="Gg. Kenari"),
               R([(-104, 101), (-104, 121)], "gang", 2),
               R([(-80, 101), (-80, 120)], "gang", 2),
               R([(-68, 103), (-66, 119)], "gang", 2)]
    gang_sm = [R([(240, -26), (252, -34), (262, -42)], "gang", 2),
               R([(262, -42), (270, -38), (272, -24)], "gang", 2)]
    gang_pd = [R([(214, 204), (198, 210), (182, 210)], "gang", 2),
               R([(219, 212), (232, 212), (242, 212)], "gang", 2),
               R([(224, 219), (210, 224), (198, 224)], "gang", 2)]
    saved = m.roads; m.roads = saved[n0:]; m.draw_roads(); m.roads = saved
    for sm, wd, _f, _e, kind, name in saved[n0:]:
        rl = LineString(sm)
        for rs, rw in sungai:
            x = rl.intersection(LineString(rs))
            for p in getattr(x, "geoms", [x]):
                if p.is_empty:
                    continue
                d = rl.project(p)
                a, b = rl.interpolate(max(0, d - 0.6)), rl.interpolate(min(rl.length, d + 0.6))
                m.jembatan(p.x, p.y, math.degrees(math.atan2(b.y - a.y, b.x - a.x)), rw + 4, wd + 1.2, name)
    # ---------- bangunan & tempat luar kota
    B = m.bldg
    # utara
    B(119, -56, 5, 3, 0, (150, 110, 80)); B(113, -56, 3, 2, 0, (190, 150, 110))       # basecamp pendakian + warung
    B(62, -48, 6, 4, 10, (200, 180, 160)); m.ellipse_area(56, -44, 3, 2, (130, 200, 200), outline=(90, 150, 150))  # air panas
    B(172, -51, 4, 2.5, 0, (180, 120, 80)); B(178, -50.5, 3, 2, 0, (190, 130, 90))      # warung jagung bakar Bukit Bintang
    for k, (x, y) in enumerate([(196, -48), (204, -50), (212, -49), (190, -54), (200, -56)]):
        B(x, y, 4, 3, 8, C["roof_perum"][k % 4])                                        # villa
    reg_desa = Polygon([(236, -40), (262, -48), (280, -46), (282, -24), (262, -16), (238, -24)])
    m.area(list(reg_desa.exterior.coords), DIST["kampung"], alpha=140)
    B(252, -46, 8, 4, 0, (220, 190, 120)); B(246, -36, 4, 3, 0, (176, 220, 214))       # SMK Pariwisata, masjid desa
    B(276, -30, 4, 4, 0, (210, 200, 186))                                              # pabrik teh
    # barat
    B(-74, 34, 16, 2, -10, (170, 170, 176)); B(-62, 42, 5, 4, 0, (170, 176, 184))      # bendungan & PLTA
    B(-120, -4, 3, 2, 0, (150, 110, 80)); B(-60, -12, 4, 3, 0, (190, 150, 110))        # dermaga perahu, warung ikan bakar
    reg_tg = Polygon([(-128, 79), (-66, 79), (-45, 92), (-45, 106), (-50, 128), (-128, 128)])
    m.area(list(reg_tg.exterior.coords), DIST["kampung"], alpha=140)
    B(-92, 108, 8, 5, 0, (200, 170, 120))                                              # pasar hewan
    B(-116, 94, 10, 4, 0, (240, 240, 230)); B(-112, 99, 4, 3, 0, (176, 220, 214))     # pesantren
    # timur
    for k in range(4):
        B(304 + k * 7, 40, 5, 10, 0, (150, 160, 120))                                  # barak
    m.area([(336, 36), (356, 36), (356, 52), (336, 52)], (200, 190, 150), smooth=False, outline=(120, 110, 80))   # lapangan apel
    B(318, 64, 10, 4, 0, (170, 176, 140)); B(336, 72, 3, 2, 0, (120, 130, 100))        # markas & pos jaga
    m.area([(296, 56), (310, 56), (310, 70), (296, 70)], (190, 170, 130), smooth=False, outline=(110, 100, 80))   # lapangan tembak
    for k, (x, y, w, h) in enumerate([(296, 104, 12, 8), (330, 104, 14, 9), (352, 104, 10, 7), (388, 106, 12, 9),
                                      (300, 130, 16, 8), (334, 128, 12, 8), (360, 130, 14, 8), (390, 130, 10, 8)]):
        B(x, y, w, h, 0, [(176, 186, 200), (200, 200, 206), (186, 176, 170), (170, 190, 186)][k % 4])
    # selatan
    reg_pd = Polygon([(182, 186), (248, 186), (258, 206), (246, 228), (198, 230), (184, 222)])
    m.area(list(reg_pd.exterior.coords), DIST["kampung"], alpha=140)
    B(34, 240, 8, 4, 0, (190, 206, 228))                                               # Stasiun Lintang
    for k in range(7):
        B(120 + k * 6, 258, 4, 2.6, 0, [(220, 120, 80), (90, 150, 200), (230, 190, 80)][k % 3])   # warung seafood
    m.area([(110, 260), (118, 260), (118, 265), (110, 265)], SAND, smooth=False, outline=(150, 120, 80))   # voli pantai
    B(206, 259, 12, 4, 0, (240, 236, 226))                                             # Hotel Samudra
    B(236, 280, 2.4, 2.4, 0, (250, 250, 250)); B(236, 280, 1.2, 1.2, 0, (210, 50, 50), roof=False)   # mercusuar
    B(314, 264, 6, 3, 0, (120, 150, 190)); B(318, 270, 2, 6, 0, (150, 110, 80))         # TPI & dermaga
    for k in range(5):
        X, Y = m.P([(304 + k * 2.2, 271)])[0]
        m.d.polygon([(X, Y), (X + 1.6 * m.s, Y), (X + 0.8 * m.s, Y + 3 * m.s)], fill=[(210, 70, 50), (60, 120, 190), (240, 200, 60)][k % 3], outline=(40, 40, 40))
    for k in range(8):
        rng.uniform(-15, 15)                                                           # (seed tetap) kampung nelayan kini di sepanjang jalan TPI
    B(-12, 262, 3, 2, 0, (170, 130, 90))                                               # gubuk Pantai Watu Sepi
    sirkuit(m)
    # ---------- rumah desa & pohon
    # rumah: hanya di sepanjang jalan/gang, menghadap jalan, jarak dari tepi aspal >= 1 petak (guide 90)
    kampung = dict(spacing=(2.0, 2.5), depth=(2.4, 3.2), width=(2.2, 3.0), gap=(1.0, 1.3), jitter=4, skip=0.04)
    desa = dict(spacing=(2.6, 3.6), depth=(2.6, 3.4), width=(2.4, 3.2), gap=(1.4, 2.4), jitter=4, skip=0.08)
    by_name = {r[5]: r[0] for r in m.roads if r[5]}
    for g in gang_tg:
        m.houses_along(g, reg_tg, **kampung)
    m.houses_along(by_name["Jl. Tegalsari"], reg_tg, **desa)
    for g in gang_sm:
        m.houses_along(g, reg_desa, **kampung)
    m.houses_along(by_name["Jl. Raya Puncak"], reg_desa, **desa)
    for g in gang_pd:
        m.houses_along(g, reg_pd, **kampung)
    m.houses_along(jl_pd, reg_pd, **desa)
    reg_nl = Polygon([(294, 250), (316, 250), (316, 268), (294, 268)])
    m.houses_along(tpi, reg_nl, **kampung)                                             # kampung nelayan
    for g in (hl_barat, hl_timur):
        m.trees(g, 160, (1.2, 2.2))
    m.trees(karet, 140, (1.0, 1.6))
    m.trees(kelapa, 70, (0.7, 1.1))
    m.trees(Polygon([(-150, -120), (410, -120), (410, 2), (-150, 2)]), 260, (1.2, 2.2))
    m.trees(Polygon([(-150, 0), (0, 0), (0, 250), (-150, 250)]), 160, (0.9, 1.8))
    m.trees(Polygon([(260, 0), (410, 0), (410, 250), (260, 250)]), 150, (0.9, 1.8))
    m.trees(Polygon([(0, 180), (260, 180), (260, 250), (0, 250)]), 120, (0.9, 1.8))
    # ---------- nama wilayah
    m.district(110, -118, "GUNUNG SANGKALA (2.410 m)")
    m.district(262, -64, "DESA SUKAMEKAR &\nKEBUN TEH")
    m.district(-92, -96, "BUKIT BATU TULIS")
    m.district(-88, 6, "WADUK\nSIRNAGALIH")
    m.district(-90, 140, "DESA TEGALSARI")
    m.district(-100, 226, "KEBUN KARET")
    m.district(326, 18, "ASRAMA BATALYON 3")
    m.district(346, 84, "KAWASAN INDUSTRI\nPRADANA")
    m.district(363, 142, "SIRKUIT TANJUNG PRADANA")
    m.district(210, 190, "DESA PANDANSARI")
    m.district(150, 290, "SAMUDRA SELATAN")
    m.district(130, 90, "KOTA WIRABUMI")
    m.text(80, 268, "Pantai Lintang", 13, True, (90, 70, 30))
    m.text(-20, 274, "Pantai Watu Sepi", 12, True, (90, 70, 30))
    m.text(360, 258, "hutan bakau", 11, True, (230, 250, 230))
    m.text(282, 160, "Kali Cendana", 11, True, (20, 60, 110))
    # ---------- penanda (lanjutan nomor peta kota)
    pts = [
        (110, -96, "Kawah Sangkala & danau kawah (puncak, Bab 12 kemah)"),
        (119, -52, "Basecamp pendakian & pos 1"),
        (92, -104, "Alun-alun Edelweis (kemah puncak)"),
        (58, -52, "Pemandian air panas Sangkala"),
        (170, -52, "Bukit Bintang: warung jagung bakar, lampu kota malam"),
        (204, -60, "Kawasan villa Puncak"),
        (138, -24, "Jl. Tikungan Seribu: balap liar turunan (Bab 8+)"),
        (252, -50, "SMK Pariwisata (sekolah Wulan) & Desa Sukamekar"),
        (282, -32, "Pabrik teh tua (tur & kerja paruh waktu)"),
        (-74, 38, "Bendungan & PLTA Sirnagalih"),
        (-60, -16, "Warung ikan bakar & dermaga perahu waduk"),
        (-92, -76, "Batu Tulis (prasasti, rahasia)"),
        (-92, 112, "Pasar hewan Tegalsari"),
        (-116, 90, "Pondok pesantren Darul Falah"),
        (318, 60, "Asrama Batalyon 3 (rumah Dimas): gerbang jaga"),
        (346, 112, "Kawasan Industri Pradana (kerja shift)"),
        (368, 230, "Sirkuit Tanjung Pradana: tribun utama & pit"),
        (316, 186, "Gerbang peserta / paddock sirkuit"),
        (34, 246, "Stasiun Lintang (kereta ke pantai)"),
        (140, 262, "Pantai Lintang: warung seafood, voli pantai"),
        (206, 264, "Hotel Samudra"),
        (236, 288, "Tanjung Karang & mercusuar (spot ending)"),
        (318, 266, "TPI & Kampung Nelayan Muara"),
        (360, 252, "Jalur kayu hutan bakau"),
        (-12, 266, "Pantai Watu Sepi (sepi, kemah, rahasia)"),
        (300, 250, "Jl. Pesisir Selatan: balap liar pesisir (Bab 10+)"),
        (226, 166, "Jl. Lingkar Selatan: drag liar (kota no. 14)"),
    ]
    for i, (x, y, t) in enumerate(pts, 40):
        m.mark(x, y, i, t)
    m.finish(path, [
        "Kotak bergaris putih = Kota Wirabumi (detail di peta_kota.png, koordinat sama).",
        "Semua jalan tembus: tiap jalan berakhir di jalan lain, di tempat tujuan, atau di tepi peta (keluar daerah, fast travel).",
        "Kereta: Stasiun Wirabumi - utara (terowongan Sangkala) dan selatan (Stasiun Lintang, pantai).",
        "Hijau tua = hutan lindung (tidak bisa dibangun). Hijau bergaris = kebun teh. Krem = pantai.",
    ])
    return m


# ------------------------------------------------------------------ peta balap
RUTE = [
    ("Drag Lurus Lingkar", (230, 60, 50), [(184, 170.5), (200, 170), (220, 169.6), (240, 169.6), (254, 169.4)],
     "Bab 3+. Selasa & Jumat 22.00-00.30. Drag 1 lawan 1, lurus 70 petak."),
    ("Putaran Kota", (250, 150, 30), [(108, 88), (128, 84), (160, 92), (166, 104), (172, 114), (176, 126), (180, 140), (184, 152),
                                     (194, 157), (197, 166), (200, 170), (184, 170.5), (169, 170), (155, 170), (140, 168), (130, 160),
                                     (120, 140), (116, 124), (111, 106), (108, 88)],
     "Bab 6+. Sabtu 01.00, 3 lap. Jalan kota: Jl. Raya - Jembatan Timur - Lingkar - Jl. Selatan. Banyak polisi."),
    ("Tikungan Seribu", (160, 60, 200), [(152, -46), (152, -41), (130, -35), (150, -29), (128, -23), (148, -17), (128, -11), (144, -6), (138, 0)],
     "Bab 8+. Malam Minggu 23.00. Turunan serpentin dari Bukit Bintang. Kabut 30%. Jatuh = motor rusak."),
    ("Jalur Pesisir", (30, 120, 220), [(160, 252), (210, 254), (240, 257), (270, 252), (300, 246), (340, 241)],
     "Bab 10+. Kecepatan tinggi, angin samping, finish di gerbang sirkuit. Final balap liar."),
]
RAZIA = [(170, 92, "pos polisi Jl. Raya"), (210, 170, "razia acak lingkar"), (150, 252, "razia pantai (malam Minggu)")]


def peta_balap():
    m = peta_dunia("peta_dunia.png")
    d = m.d
    for nama, col, pts, _ in RUTE:
        sm = catmull(pts, 10)
        d.line(m.P(sm), fill=(30, 30, 30), width=11, joint="curve")
        d.line(m.P(sm), fill=col, width=7, joint="curve")
        for (x, y), lab in ((pts[0], "S"), (pts[-1], "F")):
            X, Y = m.P([(x, y)])[0]
            d.rectangle((X - 9, Y - 9, X + 9, Y + 9), fill=(250, 250, 250), outline=col, width=3)
            d.text((X - 5, Y - 8), lab, font=font(12, True), fill=(30, 30, 30))
    for x, y, t in RAZIA:
        X, Y = m.P([(x, y)])[0]
        d.polygon([(X, Y - 12), (X + 11, Y + 8), (X - 11, Y + 8)], fill=(30, 60, 160), outline=(250, 250, 250))
        d.text((X - 3, Y - 5), "P", font=font(11, True), fill=(250, 250, 250))
    # panel keterangan rute (menimpa legenda kanan)
    x0 = int(m.w * m.s); raw = m.raw
    raw.rectangle((x0 + 2, 0, m.W, m.H), fill=(250, 248, 240))
    y = 16
    raw.text((x0 + 16, y), "Rute balap liar & sirkuit", font=font(17, True), fill=(30, 30, 30)); y += 34
    for nama, col, pts, desc in RUTE:
        raw.rectangle((x0 + 16, y + 2, x0 + 44, y + 14), fill=col, outline=(30, 30, 30))
        raw.text((x0 + 52, y), nama, font=font(13, True), fill=(30, 30, 30)); y += 20
        for l in wrap(desc, 46):
            raw.text((x0 + 52, y), l, font=font(12), fill=(70, 70, 70)); y += 16
        y += 10
    raw.polygon([(x0 + 30, y), (x0 + 41, y + 20), (x0 + 19, y + 20)], fill=(30, 60, 160))
    raw.text((x0 + 52, y + 2), "Pos / titik razia polisi", font=font(13, True), fill=(30, 30, 30)); y += 34
    raw.text((x0 + 16, y), "S = start, F = finish", font=font(12, True), fill=(30, 30, 30)); y += 26
    for l in wrap("Sirkuit Tanjung Pradana (resmi) di timur, nomor 56-57. Masuk penonton lewat Jl. Pesisir (gerbang selatan), "
                  "peserta lewat Jl. Sirkuit (gerbang barat ke paddock). Detail: sirkuit/denah_sirkuit.png.", 48):
        raw.text((x0 + 16, y), l, font=font(12), fill=(70, 70, 70)); y += 16
    m.im.save(po.os.path.join(po.HERE, "peta_balap.png"))


if __name__ == "__main__":
    peta_balap()
    print("selesai")
