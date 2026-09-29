"""UI kit (panels, buttons, bars, cards) + layout mockups of the main screens.

Native phone resolution 224x400 (portrait). The top 256 px is the stage scene,
the bottom holds the tab panel. Mockups are composed from the real assets.
"""

import json

from PIL import Image

from . import food, main_character, npcs, scenes, ui_icons
from .cities import CITIES, CITY_ORDER
from .core import ASSETS, hexc, render, scale
from .draw import Canvas
from .menu import MENU, economy

OUT = ASSETS.parent / "ui"
SW, SH = 224, 400
SCENE_H = 256

UI = {
    "O": "#100b13",                                   # garis luar panel
    "p": "#241a29", "P": "#2f2233", "q": "#3a2b40",   # panel, panel terang, garis dalam
    "t": "#f3e9d8", "T": "#b9a9a0",                   # teks, teks redup
    "y": "#f2c94c", "Y": "#fff2a8", "G": "#b8892a",   # emas
    "g": "#5fae4a", "h": "#8fd06a", "H": "#2f7a3a",   # tombol hijau
    "r": "#d8432a", "s": "#f07a5a", "S": "#8a1f12",   # tombol merah
    "b": "#4f86a6", "c": "#7fb0cc", "B": "#2e5570",   # tombol biru
    "u": "#8e62c4", "v": "#b18ae0", "U": "#4d2d78",   # tombol ungu
    "k": "#6d777d", "l": "#9aa3a8", "K": "#3e4448",   # tombol nonaktif
    "d": "#00000088",                                 # peredup layar
    "w": "#fbf6ec",
}
BUTTON = {"hijau": ("g", "h", "H"), "merah": ("r", "s", "S"), "biru": ("b", "c", "B"),
          "ungu": ("u", "v", "U"), "emas": ("y", "Y", "G"), "abu": ("k", "l", "K")}


# ------------------------------------------------------------------- kit
def draw_panel(cv, x, y, w, h, light=False):
    cv.rect(x, y, w, h, "P" if light else "p")
    cv.frame(x, y, w, h, "O")
    cv.frame(x + 1, y + 1, w - 2, h - 2, "q")
    for cx, cy in ((x, y), (x + w - 1, y), (x, y + h - 1), (x + w - 1, y + h - 1)):
        cv.px(cx, cy, ".")                            # sudut membulat


def draw_button(cv, x, y, w, h, color="hijau"):
    base, light, dark = BUTTON[color]
    cv.rect(x, y, w, h, base)
    cv.hline(x + 1, y + 1, w - 2, light)
    cv.hline(x + 1, y + h - 2, w - 2, dark)
    cv.frame(x, y, w, h, "O")
    for cx, cy in ((x, y), (x + w - 1, y), (x, y + h - 1), (x + w - 1, y + h - 1)):
        cv.px(cx, cy, ".")


def draw_bar(cv, x, y, w, h, frac, color="y"):
    cv.rect(x, y, w, h, "O")
    cv.rect(x + 1, y + 1, w - 2, h - 2, "K")
    fw = max(0, round((w - 2) * frac))
    cv.rect(x + 1, y + 1, fw, h - 2, color)
    if fw > 1:
        cv.hline(x + 1, y + 1, fw, "Y" if color == "y" else "h" if color == "g" else color)


def draw_pill(cv, x, y, w):
    cv.rect(x, y, w, 12, "p")
    cv.frame(x, y, w, 12, "O")
    cv.px(x, y, "."), cv.px(x + w - 1, y, "."), cv.px(x, y + 11, "."), cv.px(x + w - 1, y + 11, ".")


class Screen:
    def __init__(self, bg=None):
        self.img = Image.new("RGBA", (SW, SH), hexc("#1b1420"))
        if bg is not None:
            self.img.alpha_composite(bg, (0, 0))

    def ui(self, fn, *a, **kw):
        cv = Canvas(SW, SH)
        fn(cv, *a, **kw)
        self.img.alpha_composite(render(cv.g, UI))

    def dim(self):
        self.img.alpha_composite(Image.new("RGBA", (SW, SH), (10, 6, 14, 170)))

    def text(self, x, y, s, color="t", center=False, scale_=1, shadow=True):
        cv = Canvas(SW, SH)
        if center:
            x -= Canvas.text_width(s, scale_) // 2
        cv.text(x, y, s, color, scale=scale_, shadow="O" if shadow else None)
        self.img.alpha_composite(render(cv.g, UI))

    def paste(self, im, x, y, k=1):
        self.img.alpha_composite(scale(im, k) if k != 1 else im, (x, y))

    def icon(self, name, x, y):
        self.paste(ui_icons.build(name), x, y)

    def small_icon(self, name, x, y):
        self.paste(ui_icons.build(name).resize((12, 12), Image.NEAREST), x, y)


def fmt(n):
    for div, suf in ((1e12, "T"), (1e9, "M"), (1e6, "JT"), (1e3, "RB")):
        if n >= div:
            v = n / div
            return (f"{v:.1f}".rstrip("0").rstrip(".")) + suf
    return str(int(n))


# ------------------------------------------------------------- shared parts
def hud(sc, coins, gems, city, stage):
    def f(cv):
        draw_pill(cv, 4, 4, 70)
        draw_pill(cv, 78, 4, 44)
        draw_panel(cv, 60, 22, 104, 13)
    sc.ui(f)
    sc.small_icon("koin", 5, 4)
    sc.text(19, 8, fmt(coins), "Y")
    sc.small_icon("bintang_rasa", 79, 4)
    sc.text(93, 8, str(gems), "t")
    sc.icon("pengaturan", 198, 2)
    sc.icon("peta", 174, 2)
    sc.text(112, 26, f"{CITIES[city]['name'].upper()} - STAGE {stage}", "t", center=True)


TABS = [("tab_racikan", "RACIKAN"), ("tab_karyawan", "KARYAWAN"),
        ("tab_naik_kelas", "NAIK KELAS"), ("tab_misi", "MISI")]


def tabbar(sc, active):
    y = SH - 34

    def f(cv):
        cv.rect(0, y, SW, 34, "O")
        for i in range(4):
            x = i * 56
            draw_panel(cv, x + 1, y + 1, 54, 32, light=(i == active))
            if i == active:
                cv.hline(x + 4, y + 2, 48, "y")
    sc.ui(f)
    for i, (ic, label) in enumerate(TABS):
        x = i * 56
        sc.icon(ic, x + 16, y + 2)
        sc.text(x + 28, y + 26, label, "y" if i == active else "T", center=True)
    sc.icon("notifikasi", 3 * 56 + 38, y - 2)


def content_panel(sc, title, top=SCENE_H - 4):
    h = SH - 34 - top

    def f(cv):
        draw_panel(cv, 0, top, SW, h)
        cv.rect(1, top + 1, SW - 2, 12, "P")
        cv.hline(1, top + 13, SW - 2, "q")
    sc.ui(f)
    sc.text(6, top + 4, title, "y")
    return top + 16


def menu_card(sc, x, y, w, it, city_i, state, level=1):
    """state: 'aktif' | 'terkunci' | 'baru'"""
    eco = economy(it, city_i)

    def f(cv):
        draw_panel(cv, x, y, w, 30, light=True)
        cv.rect(x + 3, y + 3, 24, 24, "p")
        if state == "aktif":
            draw_bar(cv, x + 30, y + 17, 70, 5, 0.35 + (level % 3) * 0.2, "g")
            draw_button(cv, x + w - 56, y + 6, 52, 18, "hijau")
        else:
            draw_button(cv, x + w - 56, y + 6, 52, 18, "emas" if it["tier"] == "biasa" else "ungu")
    sc.ui(f)
    img = food.icon(it) if state == "aktif" else food.locked(food.icon(it))
    sc.paste(img, x + 3, y + 3)
    name = it["name"].upper()
    if len(name) > 16:
        name = name[:15] + "."
    tier_col = {"biasa": "t", "spesial": "y", "legendaris": "v"}[it["tier"]]
    sc.text(x + 30, y + 5, name, tier_col if state == "aktif" else "T")
    bx = x + w - 56
    if state == "aktif":
        sc.text(x + 30, y + 24, f"LV {level}  +{fmt(eco['price'] * level)}/{eco['cook_seconds']:g}S", "T",
                shadow=False)
        sc.small_icon("upgrade", bx + 3, y + 9)
        sc.text(bx + 17, y + 12, fmt(eco["price"] * 12 * level), "t")
    else:
        sc.text(x + 30, y + 15, "TERKUNCI" if it["unlock"] == "coins" else "STAGE %d" % it["stage"], "T")
        sc.small_icon("gembok", bx + 3, y + 9)
        sc.small_icon("koin", bx + 15, y + 9)
        sc.text(bx + 28, y + 12, fmt(eco["unlock_cost"]), "t")


# ------------------------------------------------------------------ screens
def screen_utama(city="jakarta", stage=3):
    ci = CITY_ORDER.index(city)
    sc = Screen(scenes.scene(city, stage))
    hud(sc, 128400, 86, city, stage)

    def f(cv):
        draw_pill(cv, 4, 40, 78)
        draw_panel(cv, 176, 200, 44, 26)
    sc.ui(f)
    sc.small_icon("pendapatan", 5, 40)
    sc.text(19, 44, "1.2RB/DETIK", "h")
    sc.icon("boost_rempi", 178, 201)
    sc.text(201, 206, "X2", "y")
    sc.text(201, 214, "4:59", "T", shadow=False)
    sc.small_icon("koin", 146, 176)                     # koin melayang saat tap
    sc.text(160, 180, "+48", "Y")

    def tap(cv):
        draw_pill(cv, 62, 238, 100)
    sc.ui(tap)
    sc.text(112, 242, "TAP UNTUK MASAK!", "Y", center=True)

    y = content_panel(sc, "RACIKAN - MENU AKTIF")
    items = MENU[city]
    shown = [(items[0], "aktif", 7), (items[1], "aktif", 4), (items[3], "aktif", 2)]
    for i, (it, st, lv) in enumerate(shown):
        menu_card(sc, 3, y + i * 31, SW - 6, it, ci, st, lv)
    tabbar(sc, 0)
    return sc.img


def screen_racikan(city="jakarta"):
    ci = CITY_ORDER.index(city)
    sc = Screen()
    sc.paste(scenes.scene(city, 3).crop((0, 0, SW, 60)), 0, 0)
    hud(sc, 128400, 86, city, 3)
    y = content_panel(sc, "RACIKAN", top=44)

    def f(cv):
        for i, lab in enumerate(("SEMUA", "MAKANAN", "MINUMAN", "SPESIAL")):
            draw_button(cv, 4 + i * 55, y, 52, 14, "biru" if i == 0 else "abu")
    sc.ui(f)
    for i, lab in enumerate(("SEMUA", "MAKANAN", "MINUMAN", "SPESIAL")):
        sc.text(30 + i * 55, y + 5, lab, "t", center=True)
    y += 18
    items = MENU[city]
    rows = [(items[0], "aktif", 7), (items[1], "aktif", 4), (items[2], "terkunci", 0),
            (items[3], "aktif", 2), (items[4], "terkunci", 0), (items[5], "aktif", 1),
            (items[6], "aktif", 1), (items[7], "terkunci", 0), (items[8], "terkunci", 0)]
    for i, (it, st, lv) in enumerate(rows):
        menu_card(sc, 3, y + i * 31, SW - 6, it, ci, st, lv)
    sc.text(112, SH - 44, "STAGE 4: +2 MAKANAN, +1 MINUMAN", "T", center=True)
    tabbar(sc, 0)
    return sc.img


def screen_karyawan(city="jakarta"):
    sc = Screen()
    sc.paste(scenes.scene(city, 3).crop((0, 0, SW, 60)), 0, 0)
    hud(sc, 128400, 86, city, 3)
    y = content_panel(sc, "KARYAWAN", top=44)
    staff = [("stage3_kedai", "a", "UJANG - JURU MASAK", "MASAK +25%", 3, "hijau"),
             ("stage3_kedai", "b", "SITI - KASIR", "PELANGGAN +15%", 2, "hijau"),
             ("stage4_resto_modern", "a", "BUDI - PELAYAN", "OTOMATIS 1/DETIK", 1, "hijau"),
             ("stage4_resto_modern", "b", "SLOT KOSONG", "BUKA DI STAGE 4", 0, "abu"),
             ("stage5_empire", "a", "SLOT KOSONG", "BUKA DI STAGE 5", 0, "abu")]
    for i, (kind, var, name, perk, lv, col) in enumerate(staff):
        yy = y + i * 50

        def f(cv, yy=yy, lv=lv, col=col):
            draw_panel(cv, 3, yy, SW - 6, 48, light=True)
            cv.rect(6, yy + 3, 34, 42, "p")
            if lv:
                draw_bar(cv, 44, yy + 30, 90, 6, lv / 5, "y")
            draw_button(cv, SW - 62, yy + 14, 56, 20, col)
        sc.ui(f)
        spr = npcs.karyawan_frames(kind, var)[0][1]
        if lv == 0:
            spr = food.locked(spr.crop((0, 0, 32, 40)).resize((32, 40)))
        sc.paste(spr, 7, yy + 4)
        sc.text(44, yy + 6, name, "t" if lv else "T")
        sc.text(44, yy + 16, perk, "h" if lv else "T")
        if lv:
            sc.text(44, yy + 39, f"LV {lv}/5", "T", shadow=False)
            sc.small_icon("koin", SW - 58, yy + 18)
            sc.text(SW - 44, yy + 21, fmt(3000 * 4 ** lv), "t")
        else:
            sc.small_icon("gembok", SW - 40, yy + 18)
    tabbar(sc, 1)
    return sc.img


def screen_naik_kelas(city="jakarta"):
    sc = Screen()
    sc.paste(scenes.scene(city, 3).crop((0, 0, SW, 60)), 0, 0)
    hud(sc, 128400, 86, city, 3)
    y = content_panel(sc, "NAIK KELAS", top=44)
    badges = ["stage1_gerobak", "stage2_warung", "stage3_kedai", "stage4_resto", "stage5_istana"]

    def f(cv):
        cv.hline(24, y + 26, 176, "q")
        cv.hline(24, y + 27, 88, "y")
        for i in range(5):
            cv.disc(24 + i * 44, y + 26, 15, "y" if i <= 2 else "K")
            cv.disc(24 + i * 44, y + 26, 13, "P")
    sc.ui(f)
    for i, b in enumerate(badges):
        im = ui_icons.build(b)
        sc.paste(im if i <= 3 else food.locked(im), 12 + i * 44, y + 14)
    for i, lab in enumerate(("GEROBAK", "WARUNG", "KEDAI", "RESTO", "ISTANA")):
        sc.text(24 + i * 44, y + 46, lab, "y" if i == 2 else "T", center=True)
    yy = y + 58
    b4 = [b for b in CITIES[city]["signs"].values()]
    del b4

    def g(cv):
        draw_panel(cv, 3, yy, SW - 6, 150, light=True)
        draw_bar(cv, 12, yy + 44, 200, 8, 0.72, "y")
        draw_bar(cv, 12, yy + 70, 200, 8, 1.0, "g")
        draw_bar(cv, 12, yy + 96, 200, 8, 0.4, "y")
        draw_button(cv, 30, yy + 118, 164, 24, "ungu")
    sc.ui(g)
    sc.text(112, yy + 6, "NAIK KE STAGE 4: RESTO MODERN", "y", center=True)
    sc.paste(ui_icons.build("stage4_resto"), 100, yy + 13)
    sc.text(12, yy + 38, "KUMPULKAN 1JT KOIN   720RB/1JT", "t", shadow=False)
    sc.text(12, yy + 64, "PUNYA 6 MENU AKTIF   6/6", "t", shadow=False)
    sc.text(12, yy + 90, "LAYANI 500 PELANGGAN   200/500", "t", shadow=False)
    sc.text(12, yy + 108, "HADIAH:", "T")
    sc.small_icon("bintang_rasa", 44, yy + 104)
    sc.text(58, yy + 108, "+12 BINTANG RASA", "v")
    sc.text(112, yy + 127, "NAIK KELAS!", "t", center=True, scale_=2)
    tabbar(sc, 2)
    return sc.img


def screen_misi(city="jakarta"):
    sc = Screen()
    sc.paste(scenes.scene(city, 3).crop((0, 0, SW, 60)), 0, 0)
    hud(sc, 128400, 86, city, 3)
    y = content_panel(sc, "MISI HARIAN  - RESET 08:12:40", top=44)
    misi = [("JUAL 50 KERAK TELOR", 1.0, "koin", "5RB", True),
            ("BUKA 1 MENU TERKUNCI", 0.0, "bintang_rasa", "3", False),
            ("LAYANI 100 PELANGGAN", 0.64, "koin", "12RB", False),
            ("AKTIFKAN KOMBO SARAPAN JAKARTE", 0.5, "hadiah", "1", False),
            ("UPGRADE KARYAWAN 3X", 0.33, "koin", "8RB", False)]
    for i, (name, frac, ic, rew, done) in enumerate(misi):
        yy = y + i * 40

        def f(cv, yy=yy, frac=frac, done=done):
            draw_panel(cv, 3, yy, SW - 6, 38, light=True)
            draw_bar(cv, 10, yy + 20, 140, 7, frac, "g" if done else "y")
            draw_button(cv, SW - 58, yy + 9, 52, 20, "hijau" if done else "abu")
        sc.ui(f)
        sc.text(10, yy + 7, name, "t")
        sc.text(10, yy + 30, f"{round(frac * 100)}%", "T", shadow=False)
        sc.small_icon(ic, SW - 55, yy + 13)
        sc.text(SW - 41, yy + 16, "AMBIL" if done else rew, "t")
    y2 = y + 5 * 40 + 2
    sc.icon("trofi", 8, y2)
    sc.text(36, y2 + 8, "PENCAPAIAN: 14/60", "y")
    tabbar(sc, 3)
    return sc.img


def screen_peta():
    sc = Screen()
    sky = scenes.environments.build("bali", 5)[0]
    sc.paste(sky, 0, 0)
    sc.dim()

    def f(cv):
        draw_panel(cv, 6, 30, SW - 12, 250)
        # pulau: Jawa + Bali (stilisasi)
        cv.poly([(16, 150), (40, 140), (80, 138), (120, 142), (160, 146), (176, 152), (160, 162),
                 (120, 164), (80, 162), (40, 160), (18, 158)], "g")
        cv.poly([(184, 150), (198, 148), (206, 154), (196, 160), (184, 158)], "g")
        cv.hline(18, 158, 160, "H")
        for x in range(12, 212, 6):
            for y in range(56, 270, 6):
                if cv.get(x, y) == "p":
                    cv.px(x, y, "B")
        draw_button(cv, 30, 244, 164, 26, "abu")
    sc.ui(f)
    sc.text(112, 36, "EKSPANSI KOTA", "y", center=True, scale_=2)
    pins = [("jakarta", 22, 120, "TERBUKA", 0), ("bandung", 62, 124, "10JT", 22),
            ("surabaya", 146, 124, "1M", 0), ("bali", 182, 126, "100M", 22)]
    for cid, x, y, st, drop in pins:
        im = ui_icons.build(f"kota_{cid}")
        sc.paste(im if st == "TERBUKA" else food.locked(im), x, y)
        ly = 168 + drop
        sc.text(x + 12, ly, CITIES[cid]["name"].upper(), "y" if st == "TERBUKA" else "t", center=True)
        sc.text(x + 12, ly + 8, st, "h" if st == "TERBUKA" else "T", center=True, shadow=False)
    sc.small_icon("koin", 44, 208)
    sc.text(58, 212, "BUKA BANDUNG: 10JT KOIN", "t")
    sc.text(112, 226, "SPESIAL: BATAGOR, SEBLAK, SURABI", "T", center=True)
    sc.text(112, 252, "PINDAH KOTA", "t", center=True, scale_=2)
    sc.icon("tutup", 196, 26)
    return sc.img


def screen_popup_offline(city="jakarta"):
    sc = Screen(screen_utama(city, 3))
    sc.dim()

    def f(cv):
        draw_panel(cv, 20, 110, 184, 160)
        cv.rect(21, 111, 182, 16, "P")
        draw_button(cv, 30, 226, 76, 30, "hijau")
        draw_button(cv, 118, 226, 76, 30, "ungu")
    sc.ui(f)
    sc.icon("offline", 26, 107)
    sc.text(112, 116, "SELAMAT DATANG LAGI!", "y", center=True)
    sc.text(112, 136, "SELAMA KAMU PERGI (6 JAM 12 MENIT)", "T", center=True)
    sc.text(112, 146, "GEROBAKMU TETAP JUALAN:", "T", center=True)
    sc.paste(ui_icons.build("koin_tumpuk"), 60, 162, 2)
    sc.text(112, 176, "+482RB", "Y", scale_=2)
    rempi = npcs.rempi_frames()[2][1]
    sc.paste(rempi, 176, 196)
    sc.text(68, 238, "AMBIL", "t", center=True)
    sc.small_icon("iklan_bonus", 124, 235)
    sc.text(162, 238, "AMBIL X2", "t", center=True)
    return sc.img


def screen_popup_buka_menu(city="jakarta"):
    ci = CITY_ORDER.index(city)
    it = next(i for i in MENU[city] if i["tier"] == "spesial")
    eco = economy(it, ci)
    sc = Screen(screen_racikan(city))
    sc.dim()

    def f(cv):
        draw_panel(cv, 20, 90, 184, 200)
        cv.rect(21, 91, 182, 16, "P")
        cv.rect(80, 116, 64, 64, "p")
        draw_button(cv, 30, 246, 164, 32, "emas")
    sc.ui(f)
    sc.text(112, 96, "MENU SPESIAL TERKUNCI", "y", center=True)
    sc.paste(food.icon(it), 88, 124, 2)
    sc.icon("menu_spesial", 142, 110)
    sc.text(112, 188, it["name"].upper(), "y", center=True)
    sc.text(112, 200, f"HARGA JUAL {fmt(eco['price'])}  (X2.5 MENU BIASA)", "T", center=True)
    sc.text(112, 210, "BONUS KOMBO: SARAPAN JAKARTE", "h", center=True)
    sc.text(112, 222, "BISA DIJUAL MULAI STAGE 3", "T", center=True)
    label = f"BUKA  {fmt(eco['unlock_cost'])}"
    lw = Canvas.text_width(label, 2)
    sc.small_icon("koin", 112 - lw // 2 - 8, 256)
    sc.text(112 + 8, 257, label, "O", center=True, scale_=2, shadow=False)
    sc.icon("tutup", 190, 84)
    return sc.img


SCREENS = [
    ("01_layar_utama", screen_utama),
    ("02_racikan", screen_racikan),
    ("03_karyawan", screen_karyawan),
    ("04_naik_kelas", screen_naik_kelas),
    ("05_misi", screen_misi),
    ("06_peta_ekspansi", screen_peta),
    ("07_popup_offline", screen_popup_offline),
    ("08_popup_buka_menu", screen_popup_buka_menu),
]


def export_kit():
    kit = OUT / "kit"
    kit.mkdir(parents=True, exist_ok=True)
    parts = {
        "panel": (lambda cv: draw_panel(cv, 0, 0, 24, 24), 24, 24, 6),
        "panel_terang": (lambda cv: draw_panel(cv, 0, 0, 24, 24, light=True), 24, 24, 6),
        "pill": (lambda cv: draw_pill(cv, 0, 0, 24), 24, 12, 4),
    }
    for col in BUTTON:
        parts[f"tombol_{col}"] = ((lambda c: lambda cv: draw_button(cv, 0, 0, 24, 18, c))(col), 24, 18, 4)
    parts["bar_bingkai"] = (lambda cv: draw_bar(cv, 0, 0, 24, 8, 0.0), 24, 8, 2)
    parts["bar_isi_emas"] = (lambda cv: draw_bar(cv, 0, 0, 24, 8, 1.0, "y"), 24, 8, 2)
    parts["bar_isi_hijau"] = (lambda cv: draw_bar(cv, 0, 0, 24, 8, 1.0, "g"), 24, 8, 2)
    meta = {}
    for name, (fn, w, h, slice_) in parts.items():
        cv = Canvas(w, h)
        fn(cv)
        im = render(cv.g, UI)
        im.save(kit / f"{name}.png")
        scale(im, 4).save(kit / f"{name}@4x.png")
        meta[name] = {"size": [w, h], "nine_slice_border": slice_}
    (kit / "kit.json").write_text(json.dumps({"palette": UI, "parts": meta}, indent=2) + "\n")


def generate():
    export_kit()
    d = OUT / "layouts"
    d.mkdir(parents=True, exist_ok=True)
    shots = []
    for name, fn in SCREENS:
        im = fn()
        im.save(d / f"{name}.png")
        scale(im, 3).save(d / f"{name}@3x.png")
        shots.append(im)
    gap = 12
    sheet = Image.new("RGBA", (4 * (SW * 2 + gap) + gap, 2 * (SH * 2 + gap) + gap), hexc("#0d0b10"))
    for i, im in enumerate(shots):
        x = gap + (i % 4) * (SW * 2 + gap)
        y = gap + (i // 4) * (SH * 2 + gap)
        sheet.alpha_composite(scale(im, 2), (x, y))
    sheet.save(d / "layouts_overview.png")


_ = main_character
