"""Denah detail kawasan: Sirkuit Tanjung Pradana, STM Karya Bangsa, GOR Kota.

Jalankan:  python buat_kawasan.py   (butuh Pillow, shapely; memakai buat_sekolah_luar.py, buat_interior.py, peta_dunia.py)
Hasil:
  sirkuit/denah_sirkuit.png
  stm/denah_tapak_stm.png, stm/tampak_stm.png, stm/interior_bengkel_otomotif.png
  gor/denah_tapak_gor.png, gor/interior_gor.png
Koordinat dalam PETAK (1 petak = 32 unit voxel). Interior = scene terpisah, boleh lebih luas dari luarnya.
"""
import math, os
from PIL import Image, ImageDraw
from shapely.geometry import LineString
import buat_sekolah_luar as SL
from buat_sekolah_luar import Site, Elev, C, INK, hx, shade, font, FH
import buat_interior as BI
from buat_interior import Plan
from peta_organik import catmull
import peta_dunia as PD

HERE = os.path.dirname(os.path.abspath(__file__))


def out(sub):
    p = os.path.join(HERE, sub); os.makedirs(p, exist_ok=True); return p


def wraptxt(d, text, f, maxw):
    lines, cur = [], ""
    for wd in text.split():
        t = (cur + " " + wd).strip()
        if d.textbbox((0, 0), t, font=f)[2] > maxw:
            lines.append(cur); cur = wd
        else:
            cur = t
    lines.append(cur); return lines


def legend(S, path, title, sub, items, notes=()):
    """Tempel denah + panel keterangan bernomor di kanan, judul di bawah."""
    mapw, maph = S.w * S.s, S.h * S.s
    panel = 400
    tmp = Image.new("RGB", (10, 10)); td = ImageDraw.Draw(tmp)
    need = 60 + sum(18 * len(wraptxt(td, t, font(12, True), panel - 60)) + 8 for t in items) + sum(17 * len(wraptxt(td, n, font(12), panel - 30)) + 6 for n in notes)
    H = max(maph, need) + 70
    im = Image.new("RGB", (mapw + panel, H), (250, 248, 242))
    im.paste(S.im.crop((0, 0, mapw, maph)), (0, 0))
    d = ImageDraw.Draw(im)
    d.line((mapw, 0, mapw, H), fill=(60, 60, 60), width=3)
    x0 = mapw + 16; y = 16
    d.text((x0, y), "Keterangan", font=font(17, True), fill=INK); y += 34
    for i, t in enumerate(items, 1):
        d.ellipse((x0, y, x0 + 22, y + 22), fill=(40, 40, 40))
        b = d.textbbox((0, 0), str(i), font=font(11, True))
        d.text((x0 + 11 - (b[2] - b[0]) / 2, y + 4), str(i), font=font(11, True), fill=(255, 255, 255))
        for k, ln in enumerate(wraptxt(d, t, font(12, True), panel - 60)):
            d.text((x0 + 32, y + 3 + k * 17), ln, font=font(12, k == 0), fill=INK)
        y += max(26, 17 * len(wraptxt(d, t, font(12, True), panel - 60)) + 8)
    y += 6
    for n in notes:
        for ln in wraptxt(d, n, font(12), panel - 30):
            d.text((x0, y), ln, font=font(12), fill=(80, 80, 80)); y += 17
        y += 6
    d.rectangle((0, maph, mapw, H), fill=(250, 248, 242)); d.line((0, maph, mapw, maph), fill=(60, 60, 60), width=3)
    d.text((14, maph + 10), title, font=font(16, True), fill=INK)
    for k, ln in enumerate(wraptxt(d, sub, font(13), mapw - 30)[:2]):
        d.text((14, maph + 36 + k * 17), ln, font=font(13), fill=(70, 70, 70))
    L = 10 * S.s
    d.rectangle((mapw - 20 - L, maph + 22, mapw - 20, maph + 28), fill=INK)
    d.text((mapw - 20 - L, maph + 6), "10 petak", font=font(12, True), fill=INK)
    im.save(path)


def stripes(S, x, y, w, h, c1, c2, n, vertical=True):
    for i in range(n):
        if vertical:
            S.rect(x + i * w / n, y, w / n, h, c1 if i % 2 == 0 else c2, width=0)
        else:
            S.rect(x, y + i * h / n, w, h / n, c1 if i % 2 == 0 else c2, width=0)
    S.rect(x, y, w, h, None, width=2)


def cars(S, x, y, n, dx, dy, w=1.6, h=2.6):
    cols = [C["putih"], C["abu"], C["merah"], C["biru"], hx("2a2a2a"), C["kuning"]]
    for i in range(n):
        S.rect(x + i * dx, y + i * dy, w, h, cols[i % 6], width=1)


# ============================================================ SIRKUIT
def sirkuit():
    OX, OY = 318, 146
    S = Site(92, 96, 10)
    T = [(x - OX, y - OY) for x, y in PD.TRACK]
    sm = catmull(T, 16, closed=True); sm = sm + [sm[0]]
    tr = LineString(sm)
    S.rect(0, 0, 92, 96, (170, 200, 130), width=0)

    def gdraw(g, fill, hole):
        for p in getattr(g, "geoms", [g]):
            S.d.polygon(S.P(list(p.exterior.coords)), fill=fill)
            for it in p.interiors:
                S.d.polygon(S.P(list(it.coords)), fill=hole)
    INF = (170, 200, 130)
    gdraw(tr.buffer(6.2), (150, 140, 120), INF)       # jalur servis (tanah keras) di luar run-off
    gdraw(tr.buffer(5.4), C["tanah"], INF)            # gravel trap
    gdraw(tr.buffer(3.6), (150, 196, 110), INF)       # run-off rumput
    gdraw(tr.buffer(2.1), hx("55575c"), INF)          # aspal (lebar 4.2 petak)
    # kerb & pos marshal
    L = tr.length; dd = 0.0; i = 0; posts = []
    while dd < L:
        p0, p1, p2 = tr.interpolate(dd - 1.5), tr.interpolate(dd), tr.interpolate(dd + 1.5)
        a1 = math.atan2(p1.y - p0.y, p1.x - p0.x); a2 = math.atan2(p2.y - p1.y, p2.x - p1.x)
        turn = (a2 - a1 + math.pi) % (2 * math.pi) - math.pi
        nx, ny = -math.sin(a1), math.cos(a1)
        if abs(turn) > 0.1:
            for sd in (-1, 1):
                qx, qy = p1.x + nx * sd * 2.2, p1.y + ny * sd * 2.2
                S.circle(qx, qy, 0.35, (210, 40, 40) if i % 2 else (250, 250, 250), outline=None, width=0)
            if not posts or min(math.hypot(p1.x - a, p1.y - b) for a, b in posts) > 14:
                sd = -1 if turn > 0 else 1   # sisi luar tikungan
                posts.append((p1.x + nx * sd * 7.2, p1.y + ny * sd * 7.2))
        dd += 0.7; i += 1
    for k, (x, y) in enumerate(posts):
        if 1 < x < 91 and 1 < y < 95:
            S.rect(x - 0.7, y - 0.7, 1.4, 1.4, C["oranye"], width=1)
    # nomor tikungan
    turns = [(85, 70, "T1"), (80, 54, "T2"), (73, 31, "T5"), (64, 51, "T3"), (59, 37, "T4"), (80, 9, "T6"), (60, 12, "T7"), (32, 20, "T8"), (30, 36, "T9"), (10, 54, "T10"), (13, 70, "T11")]
    for x, y, t in turns:
        S.label(x, y, t, 11, True, bg=(255, 255, 220))
    # garis start/finish & grid
    for k in range(6):
        S.rect(50, 74 + k * 0.7, 0.7, 0.7, (20, 20, 20) if k % 2 else (250, 250, 250), width=0)
        S.rect(50.7, 74 + k * 0.7, 0.7, 0.7, (250, 250, 250) if k % 2 else (20, 20, 20), width=0)
    for k in range(6):
        for sd in (0, 1):
            S.line([(46 - k * 3 - sd * 1.5, 74.6 + sd * 2.2), (46 - k * 3 - sd * 1.5 - 1.2, 74.6 + sd * 2.2)], (250, 250, 250), 2)
    # pit lane & garasi
    pit = [(x - OX, y - OY) for x, y in PD.PIT]
    S.line(catmull(pit, 8), hx("6e7076"), 16)
    S.line([(22, 72.6), (76, 72.6)], (250, 250, 250), 2)
    for k in range(20):
        S.rect(27 + k * 2.2, 66.2, 2.2, 2.8, (226, 226, 232), width=1)
        S.rect(27.2 + k * 2.2, 68.6, 1.8, 0.4, (210, 60, 50) if k % 2 else (60, 90, 160), width=0)
    S.rect(27, 64.6, 44, 1.6, hx("4a4e56"), width=1)   # atap/teras atas garasi (hospitality)
    # paddock
    S.rect(24, 54, 44, 10, (196, 196, 200), width=2)
    for k in range(6):
        S.rect(26 + k * 7, 56, 5, 3, [(240, 240, 240), (200, 60, 50), (60, 90, 170), (240, 200, 60), (60, 140, 90), (230, 230, 230)][k])
        S.rect(26 + k * 7, 59.6, 5, 2.4, C["abu"], width=1)    # truk tim
    S.rect(72, 56, 5, 8, hx("3c4048"))               # menara race control
    S.rect(72.5, 54, 4, 2, C["kaca"], width=1)
    S.rect(64, 59, 4, 2, C["emas"], width=1)          # podium
    S.rect(21, 58, 3, 4, C["putih"]); S.d.text((21.2 * 10, 59 * 10), "+", font=font(18, True), fill=(200, 40, 40))   # medical
    S.circle(80, 52, 1.8, (90, 160, 90), outline=(250, 250, 250)); S.d.text((79.4 * 10, 51 * 10), "H", font=font(14, True), fill=(250, 250, 250))
    # tribun
    def tribun(x, y, w, h, col, rows_, vertical=False, roof=False):
        S.rect(x, y, w, h, shade(col, 0.9))
        for r in range(rows_):
            if vertical:
                S.line([(x + (r + 0.5) * w / rows_, y + 0.2), (x + (r + 0.5) * w / rows_, y + h - 0.2)], shade(col, 0.65), 2)
            else:
                S.line([(x + 0.2, y + (r + 0.5) * h / rows_), (x + w - 0.2, y + (r + 0.5) * h / rows_)], shade(col, 0.65), 2)
        if roof:
            S.rect(x, y, w, h * 0.35, (70, 120, 180), width=1)
    tribun(26, 81, 46, 4.6, (200, 200, 210), 6, roof=True)       # tribun utama
    tribun(87.4, 54, 3.2, 18, (200, 90, 70), 4, vertical=True)   # T1
    tribun(1, 52, 3.2, 18, (200, 90, 70), 4, vertical=True)      # hairpin barat
    tribun(38, 0.6, 24, 3, (200, 90, 70), 4)                     # tribun utara
    S.rect(16, 20, 4, 12, hx("b8cc8a"), width=1)                 # tribun bukit lesehan
    for k in range(4):
        S.line([(16.4, 21 + k * 3), (19.6, 21 + k * 3)], shade(hx("b8cc8a"), 0.7), 2)
    # terowongan, jalur servis, gerbang, parkir, food court
    for k in range(6):
        S.line([(14 + k * 1.4, 48), (14.8 + k * 1.4, 48)], (30, 30, 30), 4)
    S.rect(0, 87, 48, 9, C["aspal"], width=1)
    for k in range(23):
        S.line([(1 + k * 2.05, 87.2), (1 + k * 2.05, 90.2)], (235, 235, 235), 1)
    cars(S, 1.3, 87.6, 12, 4.1, 0)
    S.rect(52, 88, 12, 6, C["merah"]); S.label(58, 91, "Gerbang &\nloket", 10, True, bg=None)
    S.rect(66, 87.5, 24, 7, hx("e8d8b0"), width=1)               # food court & tenda sponsor
    for k in range(5):
        S.rect(67 + k * 4.6, 88.5, 3.6, 2.6, [C["merah"], C["biru"], C["kuning"], C["hijau"], C["oranye"]][k], width=1)
    S.rect(0, 36, 3, 10, hx("6a6a70")); S.label(1.5, 41, "G\nB", 10, True, bg=None)   # gerbang peserta barat
    # pagar keliling
    S.line([(0.3, 0.3), (91.7, 0.3), (91.7, 95.7), (0.3, 95.7), (0.3, 0.3)], hx("4a4a4a"), 4)
    nums = [(56, 73, 1), (46, 78, 2), (50, 70.8, 3), (30, 58, 4), (74.5, 60, 5), (49, 86, 6), (89, 63, 7), (2.6, 61, 8),
            (50, 2, 9), (18, 26, 10), (22, 60, 11), (58, 95, 12), (4, 41, 13), (17, 46, 14), (24, 93, 15), (40, 59.5, 16),
            (40, 37, 17), (70, 20, 18), (78, 91, 19), (6, 5, 20)]
    for x, y, n in nums:
        S.num(x, y, n)
    items = [
        "Lintasan 11 tikungan (T1-T11), lebar 4.2 petak, panjang 1 putaran ±280 petak (±25 dtk motor 250cc)",
        "Garis start/finish kotak-kotak", "Grid start: 12 posisi zig-zag",
        "Pit lane (batas kecepatan, garis putih) + 20 garasi pit; teras hospitality di atasnya",
        "Menara race control (lantai atas kaca) + podium juara di sampingnya",
        "Tribun utama beratap (sisi lurus): 6 baris, penonton paling ramai, layar besar",
        "Tribun T1 (hairpin timur): tempat paling seru untuk menonton salip",
        "Tribun hairpin barat (T10-T11)",
        "Tribun utara (T6-T7)", "Tribun bukit: lesehan rumput, gratis untuk pemegang tiket",
        "Medical center (+ helipad di infield timur)", "Gerbang penonton & loket tiket (selatan, dari Jl. Pesisir)",
        "Gerbang peserta (barat, dari Jl. Sirkuit) langsung ke paddock",
        "Terowongan bawah lintasan: dari luar ke infield/paddock",
        "Parkir penonton", "Paddock: tenda tim, truk, tempat servis motor peserta",
        "Gravel trap (cokelat) & run-off rumput: motor yang keluar lintasan melambat",
        "Pos marshal (kotak oranye) di tiap tikungan: bendera kuning/merah/biru",
        "Food court & tenda sponsor (Bengkel Wijaya Motor, dll.)", "Jalur servis keliling + pagar kawat (pemain tidak bisa menyusup kecuali misi)",
    ]
    legend(S, os.path.join(out("sirkuit"), "denah_sirkuit.png"), "SIRKUIT TANJUNG PRADANA: denah resmi (lahan 92 x 96 petak)",
           "Sirkuit beneran: lintasan berkelok (bukan lingkaran), pit, paddock, tribun, gravel trap. Balap resmi Bab 9+, track day tiap Sabtu.",
           items, ["Arah balap searah jarum jam. Start di sisi lurus selatan, T1 hairpin kanan.",
                   "Koordinat dunia: pojok kiri atas lahan = (318, 146) di peta_dunia.png."])


# ============================================================ STM
def stm_tapak():
    S = Site(84, 64, 12)
    S.rect(0, 61, 84, 3, C["aspal"], width=0)
    for xx in range(0, 84, 2):
        S.line([(xx, 62.5), (xx + 1, 62.5)], (235, 235, 200), 2)
    S.rect(0, 60, 84, 1, C["paving"], width=0)
    S.d.text((8, 61 * 12 + 4), "Jl. STM (trotoar 1 petak)", font=font(13, True), fill=(250, 250, 250))
    # pagar (tembok bata tinggi, cat marun) & gang belakang
    S.rect(0, 0, 84, 1.2, C["tanah"], width=0)
    S.line([(2, 59.5), (2, 1.6), (82, 1.6), (82, 59.5)], C["bata"], 5)
    S.line([(2, 59.5), (39, 59.5)], C["bata"], 5); S.line([(49, 59.5), (82, 59.5)], C["bata"], 5)
    S.rect(82, 30, 0.6, 2.4, C["rumput"], width=0)   # pagar jebol
    pav = C["paving"]
    S.rect(41, 46, 8, 13.5, pav, width=0)              # jalan masuk
    S.circle(45, 44, 4.2, pav, width=0); S.circle(45, 44, 0.5, C["putih"])   # tiang bendera
    S.rect(4, 33, 76, 2.2, pav, width=0)               # selasar tengah
    S.rect(13, 13, 2.4, 20, pav, width=0)
    # gedung teori (L), atap limas seng biru
    S.roof_hip(4, 3, 40, 9, C["biru"])
    S.roof_hip(4, 12, 8.6, 21, C["biru"])
    # lapangan upacara + basket
    S.rect(16, 15, 26, 16, pav)
    S.rect(26, 18, 14, 10, C["basket"]); S.rect(26, 18, 14, 10, None)
    S.line([(33, 18), (33, 28)], C["garis"], 2); S.circle(33, 23, 1.6, None, outline=C["garis"])
    S.rect(18, 15.4, 4, 1.8, C["krem"])                # mimbar
    for i in range(4):
        for j in range(5):
            S.circle(18.5 + i * 1.8, 20 + j * 2, 0.2, hx("8a8a8a"), outline=None, width=0)
    # bengkel otomotif (atap gergaji) + apron
    S.roof_saw(48, 3, 33, 15, hx("8a8f96"), 5)
    S.rect(48, 18, 33, 4.6, hx("b4b4b0"), width=1)
    for k in range(8):
        S.rect(49 + k * 4, 18, 3, 0.5, hx("c84a3a"), width=0)   # pintu rolling (merah)
    cars(S, 50, 19.2, 3, 4, 0, 1.6, 2.6)
    for k in range(4):
        S.rect(63 + k * 2.4, 19.6, 0.7, 1.8, [C["merah"], INK, C["biru"], C["kuning"]][k], width=0)   # motor praktik
    # bengkel listrik, las & pemesinan, bangunan
    S.roof_gable(48, 24, 14, 8, hx("6a7a8a"))
    S.roof_saw(66, 24, 15, 9, hx("8a8f96"), 3)
    S.roof_gable(48, 36.4, 14, 8, hx("a07a5a"), along="y")
    S.rect(66, 37, 15, 9, C["tanah"], width=1)         # area praktik cor & perancah
    for k in range(4):
        S.rect(67 + k * 3.5, 38, 2.4, 2.4, C["abu"], width=1)
    for k in range(3):
        S.line([(67, 42 + k * 1.2), (80, 42 + k * 1.2)], hx("c8a050"), 2)
    # trek uji kendaraan (oval aspal + cone)
    S.d.rounded_rectangle((4 * 12, 37 * 12, 30 * 12, 49 * 12), radius=6 * 12, fill=C["aspal"], outline=INK, width=2)
    S.d.rounded_rectangle((8 * 12, 41 * 12, 26 * 12, 45 * 12), radius=2 * 12, fill=C["rumput2"], outline=INK, width=2)
    for k in range(7):
        S.circle(9 + k * 2.6, 39, 0.3, C["oranye"], outline=None, width=0)
    # gudang lama + pojok tongkrongan
    S.roof_gable(32, 37, 8, 6, hx("5a5a56"))
    S.rect(32, 44, 7, 3, hx("8a6a4a"), width=1)        # bangku kayu & drum
    # parkiran motor siswa (kanopi seng)
    S.rect(4, 51, 34, 7.8, hx("b8b8b2"), width=2)
    for r in range(2):
        y0 = 52 + r * 3.4
        S.rect(5, y0, 32, 1.8, hx("8a9aa0"), width=1)
        for i in range(21):
            S.rect(5.3 + i * 1.5, y0 + 1.9, 0.5, 0.9, [C["merah"], INK, C["biru"], C["kuning"]][i % 4], width=0)
    # kantin & koperasi, musala, pos satpam, gerbang
    S.roof_gable(52, 49, 14, 7, C["genteng"])
    S.roof_hip(70, 49, 10, 8, C["kubah"])
    S.circle(51, 56.5, 1.3, C["krem"]); S.circle(51, 56.5, 0.8, C["merah"], width=1)
    S.rect(38.8, 58, 1.6, 1.6, hx("6a2a2a")); S.rect(47.6, 58, 1.6, 1.6, hx("6a2a2a")); S.rect(40.4, 58.4, 7.2, 0.6, hx("8a2a2a"))
    # mural belakang
    for k in range(10):
        S.rect(48 + k * 3.3, 1.2, 3.3, 0.5, [C["merah"], C["kuning"], C["biru"], C["hijau"], C["ungu"]][k % 5], width=0)
    for x, y in [(3.5, 59), (14, 59), (46, 2.4), (82, 46), (47, 33)]:
        S.tree(x + (1 if x < 10 else 0), y - (1.5 if y > 50 else -1), 1.2)
    nums = [(24, 7.5, 1), (8, 22, 2), (22, 24, 3), (64, 10, 4), (64, 20.3, 5), (55, 28, 6), (73.5, 28.5, 7), (55, 40, 8),
            (73.5, 41, 9), (17, 43, 10), (36, 40, 11), (21, 55, 12), (59, 52.5, 13), (75, 53, 14), (53, 57.5, 15), (45, 57, 16),
            (65, 2.6, 17), (80.5, 31, 18), (45, 44, 19)]
    for x, y, n in nums:
        S.num(x, y, n)
    items = [
        "Gedung Teori 2 lantai (bentuk L): 12 kelas, ruang guru, TU, lab komputer. Atap limas seng biru",
        "Sayap barat: ruang OSIS, BK, perpustakaan kecil, UKS", "Lapangan upacara + lapangan basket",
        "Bengkel Otomotif (TKR & TSM): atap gergaji, 8 bay, lift mobil, dyno motor. Kelas Kirana",
        "Apron praktik: mobil & motor praktik, pintu rolling merah",
        "Bengkel Listrik (instalasi, panel)", "Bengkel Las & Pemesinan (bubut, las, frais)",
        "Bengkel Bangunan (kayu, batu, gambar): kelas Andra", "Area praktik cor & perancah (luar ruang)",
        "Trek uji kendaraan: oval aspal + cone (ujian praktik, latihan Kirana sepulang sekolah)",
        "Gudang lama: markas tidak resmi Serigala Besi", "Parkiran motor siswa (motor modif, knalpot racing)",
        "Kantin + koperasi suku cadang (beli part murah)", "Musala", "Pos satpam", "Gerbang besi marun 'STM KARYA BANGSA'",
        "Tembok belakang: mural & coretan Serigala Besi (menghadap gang belakang)",
        "Pagar jebol: jalan tikus bolos ke jalan tanah timur", "Halaman depan & tiang bendera",
    ]
    legend(S, os.path.join(out("stm"), "denah_tapak_stm.png"), "STM KARYA BANGSA: denah tapak (lahan dalam pagar 80 x 58 petak)",
           "Sekolah rival di Selatan (peta kota no. 12). Tembok bata marun tinggi, bengkel besar beratap gergaji, trek uji motor.",
           items, ["Interior bengkel otomotif: stm/interior_bengkel_otomotif.png.",
                   "Masuk resmi lewat gerbang depan (hanya jam sekolah / undangan). Pemain SMA 3 yang masuk tanpa diajak = siswa STM curiga, bisa berantem."])


def stm_tampak():
    E = Elev("x", "STM Karya Bangsa: tampak depan Gedung Teori + samping Bengkel Otomotif", 66, 15)
    MAR = hx("7a2a2a")
    # gedung teori 2 lantai
    x0, w = 3, 30
    top = E.wall(x0, w, 2, hx("e4e0d4"))
    E.box(x0, E.gy - 0.9, w, 0.9, MAR, width=1)   # dinding bawah cat marun
    for f in range(2):
        E.windows(x0, w, f, 8, door_at=(3,) if f == 0 else ())
    E.balcony(x0, w, 1, MAR)
    E.hip(x0, w, top, 2.2, C["biru"], eave=0.7)
    E.sign(x0 + 8, top - 0.2 - 1.0 + 0.1, 14, 1.0, "STM KARYA BANGSA", col=MAR, fg=(250, 230, 160), size=13)
    # bengkel otomotif: dinding tinggi, atap gergaji, pintu rolling
    bx, bw = 37, 26
    H = 6.2
    E.box(bx, E.gy - H, bw, H, hx("c8c8c4"))
    for k in range(4):
        dx = bx + 0.8 + k * 6.3
        E.box(dx, E.gy - 3.6, 4.6, 3.6, hx("9a3a30"))
        for r in range(9):
            E.d.line((E.X(dx), E.Y(E.gy - 3.6 + r * 0.4), E.X(dx + 4.6), E.Y(E.gy - 3.6 + r * 0.4)), fill=hx("7a2a24"), width=1)
        E.box(dx + 0.6, E.gy - 5.6, 3.4, 1.2, C["kaca"], width=1)
    for k in range(5):  # gigi gergaji
        sx = bx + k * bw / 5
        E.poly([(sx, E.gy - H), (sx + bw / 5, E.gy - H), (sx + bw / 5, E.gy - H - 1.8)], hx("8a8f96"))
        E.box(sx + bw / 5 - 0.25, E.gy - H - 1.8, 0.25, 1.8, C["kaca"], width=1)
    E.sign(bx + 7, E.gy - H + 0.3, 12, 0.9, "BENGKEL OTOMOTIF", col=hx("2a2a2a"), fg=(240, 200, 80), size=11)
    E.box(bx + bw - 0.5, E.gy - H - 3.6, 0.4, 3.6, hx("e2b84a"), width=1)   # tiang crane
    E.box(bx + bw - 4, E.gy - H - 3.6, 4, 0.35, hx("e2b84a"), width=1)
    for xx in (34.5, 64.5):
        E.tree(xx, 1.3, 4.4)
    E.person(10); E.person(11.2, (60, 60, 70)); E.person(45, (60, 90, 160)); E.person(52, (60, 90, 160))
    E.note("Gedung Teori: dinding krem kusam, plint & balkon cat marun, atap limas seng biru, papan nama marun. "
           "Bengkel: dinding beton abu, pintu rolling merah berkarat, jendela atap gergaji, crane kuning, oli di lantai apron.")
    E.im.save(os.path.join(out("stm"), "tampak_stm.png"))


def stm_bengkel():
    p = Plan("x", 40, 24, 20, "STM: interior Bengkel Otomotif (bisa dimasuki)")
    p.room(0, 0, 40, 24, "bengkel")
    for k in range(4):                       # 4 bay mobil
        x = 1 + k * 6.5
        p.room(x, 14, 6, 9, "bengkel", f"Bay {k + 1}", 11, wall=1)
        p.f(x + 1.5, 15.5, 3, 5.5, "logam", "lift")
    for k in range(6):                       # 6 stand motor
        x = 1 + k * 4.2
        p.f(x, 9, 2.4, 1.2, "merah" if k % 2 else "hitam", "motor", 9)
        p.f(x, 7.6, 2.4, 0.8, "logam", "", 9)
    p.room(27.5, 1, 11.5, 8, "lab", "Ruang tune-up & dyno", 11, wall=2)
    p.f(29, 3.5, 5, 2.4, "hitam", "dyno", 10); p.f(35, 3.5, 3, 1.6, "putih", "PC", 9)
    p.room(27.5, 10, 11.5, 4, "gudang", "Gudang oli & part", 11, wall=2)
    p.room(1, 1, 12, 5.5, "kelas", "Kelas teori kecil", 11, wall=2)
    for k in range(3):
        p.f(2 + k * 3.6, 3.6, 2.6, 1, "meja")
    p.room(14, 1, 7, 5.5, "kantor", "R. guru produktif", 10, wall=2)
    p.room(22, 1, 5, 5.5, "toilet", "Toilet", 10, wall=2)
    p.f(28, 15, 10, 1.2, "rak", "rak kunci & alat", 9)
    p.f(28, 18, 4, 3, "air", "cuci", 9); p.f(33, 18, 5, 3, "logam", "kompresor", 9)
    for k in range(4):
        p.door(1.5 + k * 6.5, 24, 5)
    p.door(39.9, 16, 2, vertical=True)
    p.mark(3, 11, "1"); p.mark(16, 18, "2"); p.mark(33, 6.6, "3"); p.mark(33, 12, "4")
    p.note("1 = mini game servis motor (ganti oli, setel karbu, ganti kampas). 2 = kerja bengkel mobil (Bab 5+, diajak Kirana). "
           "3 = dyno: ukur tenaga motor pemain setelah upgrade. 4 = beli part murah dari koperasi (atau curi, risiko ketahuan).")
    p.im.save(os.path.join(out("stm"), "interior_bengkel_otomotif.png"))


# ============================================================ GOR
def gor_tapak():
    S = Site(76, 56, 12)
    S.rect(0, 53, 76, 3, C["aspal"], width=0)
    for xx in range(0, 76, 2):
        S.line([(xx, 54.5), (xx + 1, 54.5)], (235, 235, 200), 2)
    S.rect(0, 52, 76, 1, C["paving"], width=0)
    S.d.text((8, 53 * 12 + 4), "Jalan GOR (dari Jl. Merdeka ke Perumahan Bukit Asri)", font=font(13, True), fill=(250, 250, 250))
    S.line([(2, 51.5), (2, 1.6), (74, 1.6), (74, 51.5)], hx("4a4a4a"), 4)
    S.line([(2, 51.5), (54, 51.5)], hx("4a4a4a"), 4); S.line([(62, 51.5), (74, 51.5)], hx("4a4a4a"), 4)
    pav = C["paving"]
    # gedung GOR utama (atap lengkung biru) + gym
    S.roof_barrel(26, 4, 34, 24, hx("4a7ab0"))
    S.rect(36, 27.4, 14, 1.6, C["putih"])            # kanopi pintu masuk
    S.roof_hip(61, 4, 12, 17, hx("3a5a8a"))
    # kolam renang lomba 8 lintasan + kolam loncat + tribun
    S.rect(3, 4, 21, 39, pav, width=1)
    S.rect(5, 6, 12, 25, C["air"])
    for k in range(1, 8):
        S.line([(5 + k * 1.5, 6.3), (5 + k * 1.5, 30.7)], (230, 80, 70) if k % 2 else (250, 230, 90), 2)
    for k in range(8):
        S.rect(5.3 + k * 1.5, 5.2, 0.9, 0.8, C["putih"], width=1)   # balok start
    S.rect(18.5, 6, 4.6, 25, hx("c8c8d0"))
    for r in range(4):
        S.line([(18.9 + r * 1.1, 6.3), (18.9 + r * 1.1, 30.7)], hx("8a8a96"), 2)
    S.rect(18.5, 6, 4.6, 8, hx("3a5a8a"), width=1)   # atap tribun kolam
    S.rect(5, 33, 8, 8, hx("5a90c0"))                 # kolam loncat (dalam)
    S.rect(13.4, 35.5, 2, 3, C["putih"])              # menara loncat 1/3/5 m
    S.rect(15.8, 33, 7, 8, C["krem"]); S.label(19.3, 37, "bilas &\nganti", 10, True, bg=None)
    S.rect(5, 2.2, 6, 1.4, hx("2a2a2a")); S.d.text((5.4 * 12, 2.3 * 12), "SKOR", font=font(11, True), fill=(250, 200, 60))
    # lapangan luar: basket + futsal
    S.rect(61, 23, 12, 15, C["lapangan"])
    S.rect(62, 24, 10, 6, C["basket"]); S.rect(62, 31, 10, 6, hx("5a9a5a"))
    # plaza, parkir, bazar
    S.rect(26, 29.5, 34, 10, pav, width=1)
    S.circle(43, 34.5, 2.6, C["air"], outline=hx("4a7a9a")); S.circle(43, 34.5, 0.7, C["emas"])   # patung atlet & kolam
    for k in range(5):
        S.rect(28 + k * 2.6, 36, 2, 2, [C["merah"], C["kuning"], C["biru"], C["hijau"], C["oranye"]][k], width=1)   # tenda bazar
    S.rect(26, 41.5, 34, 9, C["aspal"], width=1)
    for k in range(15):
        S.line([(27 + k * 2.2, 41.5), (27 + k * 2.2, 44.5)], (240, 240, 240), 2)
    cars(S, 27.3, 41.8, 10, 2.2, 0)
    S.rect(46, 47, 9, 3, hx("e2b84a"), width=1)       # bus tim
    S.rect(3, 44.5, 21, 6, hx("b8b8b2"), width=1)
    for k in range(28):
        S.rect(3.4 + k * 0.72, 45.2, 0.45, 1, [C["merah"], INK, C["biru"]][k % 3], width=0)
        S.rect(3.4 + k * 0.72, 48.2, 0.45, 1, [C["biru"], C["merah"], INK][k % 3], width=0)
    S.rect(54.2, 50, 1.4, 1.4, hx("2f6b4a")); S.rect(60.4, 50, 1.4, 1.4, hx("2f6b4a"))   # gerbang
    S.rect(62, 46, 3, 3, C["krem"])                   # loket tiket event
    for x, y in [(24.5, 47), (62, 41), (72, 41), (72, 48), (25, 3)]:
        S.tree(x, y, 1.2)
    nums = [(43, 16, 1), (43, 28.2, 2), (67, 12, 3), (11, 18, 4), (20.8, 18, 5), (9, 37, 6), (14.4, 37, 7), (8, 2.9, 8),
            (67, 27, 9), (67, 34, 10), (36, 34, 11), (50, 34, 12), (43, 46, 13), (13.5, 47, 14), (50.5, 48.5, 15), (63.5, 47.5, 16), (58, 50.2, 17)]
    for x, y, n in nums:
        S.num(x, y, n)
    items = [
        "Gedung GOR: arena multifungsi + tribun (interior: gor/interior_gor.png). Atap lengkung seng biru",
        "Pintu masuk utama berkanopi, lobi & loket", "Gym & ruang beladiri (2 lantai, nyambung ke GOR)",
        "Kolam renang lomba: 8 lintasan, balok start, tali lintasan merah-kuning (lomba renang)",
        "Tribun kolam beratap (4 baris)", "Kolam loncat (dalam)", "Menara loncat 1 / 3 / 5 m",
        "Papan skor kolam", "Lapangan basket luar", "Lapangan futsal luar", "Plaza depan: tenda bazar saat event",
        "Patung atlet & kolam air mancur (titik kumpul)", "Parkir mobil + bus tim", "Parkir motor", "Bus tim tamu (saat turnamen)",
        "Loket tiket event (konser, turnamen, wisuda)", "Gerbang",
    ]
    legend(S, os.path.join(out("gor"), "denah_tapak_gor.png"), "GOR KOTA WIRABUMI: denah tapak (lahan 72 x 50 petak)",
           "Peta kota no. 19. Gedung olahraga + gym + kolam renang lomba. Buka 06.00-21.00, event malam sampai 23.00.", items,
           ["Kolam lomba dipakai untuk lomba renang antar-sekolah & mini game balap renang.",
            "Di peta kota GOR tampil sebagai blok 12 x 7 + kolam; tapak ini dipakai saat masuk area GOR."])


def gor_interior():
    p = Plan("x", 66, 44, 16, "GOR Kota: interior arena + gym (scene dalam)")
    p.room(0, 0, 46, 31, "olahraga", "Arena utama (multifungsi)", 13)
    # tribun teleskopik utara & selatan
    for (y0, lab) in ((1, "Tribun utara (teleskopik, 5 baris)"), (24.5, "Tribun selatan (5 baris)")):
        p.f(8, y0, 36, 5.2, "logam", "", 9)
        for r in range(5):
            Y = p.P(0, y0 + 0.5 + r)[1]
            p.d.line((p.P(8.3, 0)[0], Y, p.P(43.7, 0)[0], Y), fill=(110, 116, 124), width=2)
        p.label(8, y0, 36, 5.2, lab, 11)
    # lapangan multifungsi dengan garis
    x0, y0, w, h = 10, 7.5, 32, 16
    p.d.rectangle((*p.P(x0, y0), *p.P(x0 + w, y0 + h)), fill=(206, 150, 96), outline=(250, 250, 250), width=3)
    p.d.line((*p.P(x0 + w / 2, y0), *p.P(x0 + w / 2, y0 + h)), fill=(250, 250, 250), width=2)
    cx, cy = p.P(x0 + w / 2, y0 + h / 2); r = 2.2 * p.s
    p.d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(250, 250, 250), width=2)
    for sd in (0, 1):   # area kunci basket & gawang futsal
        ax = x0 if sd == 0 else x0 + w - 6
        p.d.rectangle((*p.P(ax, y0 + 5), *p.P(ax + 6, y0 + 11)), outline=(250, 250, 250), width=2)
    p.d.rectangle((*p.P(x0 + 2, y0 + 2), *p.P(x0 + w - 2, y0 + h - 2)), outline=(240, 200, 60), width=1)   # garis voli/bulu tangkis
    p.label(x0, y0 + 0.5, w, 3, "Lapangan 32 x 16: basket, futsal, voli, bulu tangkis", 11, fill=(250, 250, 250))
    p.f(1, 9, 6, 14, "merah", "Panggung\nevent\n(lipat)", 10)
    p.f(44.6, 12, 1, 7, "hitam", "", 9)
    p.label(42.5, 19.5, 4, 2, "skor", 9)
    # gym
    p.room(46, 0, 20, 27, "lab", "Gym & beladiri", 12)
    for k in range(4):
        p.f(48 + k * 2.2, 3, 1.6, 3, "hitam", "tm", 8)
    for k in range(3):
        p.f(48 + k * 2.2, 7, 1.6, 2, "logam", "spd", 8)
    p.f(57.5, 3, 7.5, 1.2, "rak", "rak dumbel", 9)
    for k in range(3):
        p.f(57.5 + k * 2.6, 5.4, 1.2, 3, "hitam", "", 8)
    p.f(57.5, 9.5, 3, 3, "logam", "squat", 8); p.f(61.6, 9.5, 3.4, 3, "logam", "lat\npull", 8)
    p.f(48, 10.5, 4, 2.6, "logam", "leg press", 8)
    p.f(48, 14.5, 7, 7, "merah", "Ring tinju", 10)
    for k in range(4):
        p.f(56.5 + k * 2.1, 14.8, 1.2, 1.2, "kain", "", 8)
    p.label(56, 16, 9, 1.6, "samsak", 9)
    p.f(56.5, 18, 8.5, 5.5, "hijau", "Matras silat\n& beladiri", 10)
    p.f(48, 23, 7, 1, "putih", "cermin", 8); p.f(56.5, 24.5, 4, 1.6, "meja", "instruktur", 8); p.f(61.5, 24.5, 3.5, 1.6, "lemari", "loker", 8)
    # bawah: ruang ganti, lobi, kantin, medis, panitia, gudang
    p.room(0, 31, 11, 13, "toilet", "Ganti & bilas\nputra / putri", 11)
    p.room(11, 31, 21, 13, "koridor", "Lobi: loket, lemari piala,\nmading jadwal event", 11)
    p.room(32, 31, 14, 13, "kantin", "Kantin GOR", 11)
    p.room(46, 27, 7, 8, "kantor", "R. medis", 10)
    p.room(46, 35, 7, 9, "kantor", "R. panitia\n& wasit", 10)
    p.room(53, 27, 13, 8, "gudang", "Gudang alat\n(jaring, bola, matras)", 10)
    p.room(53, 35, 13, 9, "ibadah", "Musala", 10)
    p.door(19, 44, 6, text="masuk dari plaza"); p.door(18, 31, 4); p.door(37, 31, 3); p.door(46, 13, 3, vertical=True)
    p.door(57, 27, 3); p.door(5, 31, 3); p.door(46, 37, 2, vertical=True); p.door(53, 39, 2, vertical=True)
    p.mark(26, 15.5, "1"); p.mark(2, 8.6, "2"); p.mark(51, 1.8, "3"); p.mark(47.4, 15.2, "4"); p.mark(55.6, 23.2, "5"); p.mark(22, 41, "6")
    p.note("1 = pertandingan & event (basket, futsal, voli, turnamen antar-sekolah, wisuda, konser pensi, bazar, debat calon ketua OSIS). "
           "2 = panggung lipat dipasang saat event. 3-5 = gym: latihan naikkan stat (kardio = stamina, beban = kekuatan, ring/samsak/silat = berantem). "
           "6 = papan jadwal event minggu ini.")
    p.im.save(os.path.join(out("gor"), "interior_gor.png"))


if __name__ == "__main__":
    sirkuit(); stm_tapak(); stm_tampak(); stm_bengkel(); gor_tapak(); gor_interior()
    print("selesai")
