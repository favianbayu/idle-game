"""UI icons (24x24): currencies, tabs, buttons, status and feature icons.

Exports each icon (1x + @4x), one sprite sheet and an atlas JSON
(name -> x, y, w, h on the sheet).
"""

import json
import math

from PIL import Image

from .cities import CITIES, CITY_ORDER
from .core import ASSETS, contact_sheet, render, scale
from .draw import Canvas

OUT = ASSETS.parent / "ui"
N = 24

PAL = {
    "O": "#2a1c24",
    "y": "#f2c94c", "Y": "#fff2a8", "G": "#b8892a",          # emas
    "w": "#fbf6ec", "W": "#cfc6b6", "s": "#9aa3a8", "S": "#5d666b",
    "r": "#d8432a", "R": "#8a1f12", "v": "#5fae4a", "V": "#2f7a3a",
    "b": "#4f86a6", "B": "#2e5570", "c": "#7cf5e8",
    "p": "#ff8fdc", "P": "#b04aa0", "u": "#8e62c4", "U": "#5a3a8a",
    "k": "#a0643a", "K": "#6b4a32", "o": "#e0862a", "e": "#1e1420",
    "n": "#3a3440", "x": "#f3e9d8cc", "h": "#d99a6c",
}

ICONS = {}


def icon(fn):
    ICONS[fn.__name__] = fn
    return fn


def _coin(cv, cx, cy, r):
    cv.disc(cx, cy, r, "y")
    cv.ring(cx, cy, r - 2, "G")
    cv.disc(cx - r // 3, cy - r // 3, max(1, r // 4), "Y")


# ------------------------------------------------------------- mata uang
@icon
def koin(cv):
    _coin(cv, 12, 12, 10)
    cv.rect(11, 7, 2, 10, "G")                       # simbol sutil
    cv.rect(9, 7, 6, 3, "G")


@icon
def koin_tumpuk(cv):
    for i, y in enumerate((19, 15, 11)):
        cv.ellipse(10, y, 8, 3, "y")
        cv.hline(2, y + 1, 17, "G")
    cv.ellipse(10, 11, 8, 3, "y")
    cv.ellipse(10, 11, 5, 1, "G")
    _coin(cv, 18, 7, 5)


@icon
def bintang_rasa(cv):
    pts = []
    for i in range(10):
        a = math.radians(-90 + i * 36)
        r = 11 if i % 2 == 0 else 5
        pts.append((12 + round(r * math.cos(a)), 13 + round(r * math.sin(a))))
    cv.poly(pts, "p")
    cv.poly([(12, 3), (15, 11), (12, 13), (9, 11)], "w")
    cv.disc(12, 13, 2, "P")


@icon
def pendapatan(cv):
    _coin(cv, 10, 13, 8)
    cv.poly([(15, 9), (23, 9), (19, 2)], "v")
    cv.rect(18, 9, 3, 6, "v")


# ------------------------------------------------------------------ tab
@icon
def tab_racikan(cv):
    cv.poly([(2, 12), (22, 12), (18, 19), (6, 19)], "S")   # wajan
    cv.hline(2, 12, 21, "s")
    cv.ellipse(12, 11, 7, 1, "o")
    cv.px(9, 10, "v"), cv.px(14, 10, "r")
    cv.line(16, 9, 22, 2, "k")                              # sutil
    cv.rect(14, 8, 4, 3, "s")
    cv.rect(10, 19, 4, 3, "n")
    for x, y in ((6, 6), (9, 3), (11, 7)):
        cv.px(x, y, "x")


@icon
def tab_karyawan(cv):
    for cx, col, cap in ((7, "b", "r"), (17, "o", "y")):
        cv.rect(cx - 5, 15, 11, 9, col)                      # badan
        cv.rect(cx - 1, 15, 3, 3, "w")
        cv.disc(cx, 10, 4, "h")                              # kepala
        cv.px(cx - 2, 10, "e"), cv.px(cx + 2, 10, "e")
        cv.hline(cx - 1, 12, 3, "R")
        cv.ellipse(cx, 6, 4, 2, cap)                         # topi
        cv.hline(cx - 4, 7, 9, cap)


@icon
def tab_naik_kelas(cv):
    for i in range(4):                                      # tangga
        cv.rect(2 + i * 5, 18 - i * 4, 6, 4 + i * 4, "u")
        cv.hline(2 + i * 5, 18 - i * 4, 6, "p")
    cv.poly([(17, 7), (23, 7), (20, 1)], "y")
    cv.rect(19, 7, 3, 3, "y")


@icon
def tab_misi(cv):
    cv.rect(5, 4, 14, 17, "w")
    cv.ellipse(12, 4, 7, 2, "W")
    cv.ellipse(12, 21, 7, 2, "W")
    for y in (8, 11, 14):
        cv.hline(8, y, 8, "S")
    cv.px(7, 8, "v"), cv.px(7, 11, "v")
    cv.disc(17, 18, 3, "r")                                  # segel


# -------------------------------------------------------------- tombol
@icon
def upgrade(cv):
    cv.disc(12, 12, 10, "v")
    cv.poly([(5, 13), (19, 13), (12, 5)], "w")
    cv.rect(9, 13, 6, 6, "w")


@icon
def gembok(cv):
    cv.ring(12, 9, 5, "s", thick=2)
    cv.rect(4, 10, 16, 12, "y")
    cv.hline(4, 10, 16, "Y")
    cv.disc(12, 15, 2, "G")
    cv.rect(11, 16, 2, 3, "G")


@icon
def gembok_terbuka(cv):
    cv.ring(17, 7, 5, "s", thick=2)
    cv.rect(18, 7, 6, 4, ".")
    cv.rect(2, 10, 16, 12, "y")
    cv.hline(2, 10, 16, "Y")
    cv.disc(10, 15, 2, "G")
    cv.rect(9, 16, 2, 3, "G")


@icon
def pengaturan(cv):
    for i in range(8):
        a = math.radians(i * 45)
        cv.disc(12 + round(8 * math.cos(a)), 12 + round(8 * math.sin(a)), 2, "s")
    cv.disc(12, 12, 7, "s")
    cv.disc(12, 12, 3, "S")
    cv.disc(10, 10, 1, "w")


def _speaker(cv):
    cv.rect(3, 9, 5, 6, "s")
    cv.poly([(7, 9), (13, 3), (13, 21), (7, 15)], "s")


@icon
def suara_on(cv):
    _speaker(cv)
    for r in (4, 7):
        for a in range(-50, 51, 10):
            t = math.radians(a)
            cv.px(13 + round(r * math.cos(t)), 12 + round(r * math.sin(t)), "w")


@icon
def suara_off(cv):
    _speaker(cv)
    cv.line(15, 8, 22, 15, "r"), cv.line(15, 15, 22, 8, "r")
    cv.line(16, 8, 22, 14, "r"), cv.line(16, 15, 22, 9, "r")


@icon
def tutup(cv):
    cv.disc(12, 12, 10, "r")
    for d in (0, 1):
        cv.line(7 + d, 7, 16 + d, 16, "w")
        cv.line(16 + d, 7, 7 + d, 16, "w")


@icon
def kembali(cv):
    cv.disc(12, 12, 10, "b")
    cv.poly([(5, 12), (12, 5), (12, 19)], "w")
    cv.rect(12, 10, 7, 5, "w")


@icon
def centang(cv):
    cv.disc(12, 12, 10, "v")
    for d in (0, 1):
        cv.line(6, 12 + d, 10, 16 + d, "w")
        cv.line(10, 16 + d, 18, 7 + d, "w")


@icon
def tambah(cv):
    cv.disc(12, 12, 10, "v")
    cv.rect(10, 6, 4, 12, "w")
    cv.rect(6, 10, 12, 4, "w")


@icon
def info(cv):
    cv.disc(12, 12, 10, "b")
    cv.rect(11, 10, 3, 8, "w")
    cv.rect(11, 6, 3, 2, "w")


@icon
def notifikasi(cv):
    cv.disc(12, 12, 9, "r")
    cv.rect(11, 6, 3, 8, "w")
    cv.rect(11, 16, 3, 2, "w")


# --------------------------------------------------------------- status
@icon
def waktu_masak(cv):
    cv.disc(12, 13, 9, "w")
    cv.ring(12, 13, 9, "s", thick=2)
    cv.rect(10, 2, 5, 2, "s")
    cv.vline(12, 7, 7, "e")
    cv.line(12, 13, 16, 16, "r")


@icon
def pelanggan(cv):
    cv.disc(12, 8, 5, "o")
    cv.ellipse(12, 20, 8, 5, "b")
    cv.rect(4, 20, 17, 4, ".")
    cv.rect(4, 20, 17, 2, "b")


@icon
def rating(cv):
    pts = []
    for i in range(10):
        a = math.radians(-90 + i * 36)
        r = 11 if i % 2 == 0 else 5
        pts.append((12 + round(r * math.cos(a)), 13 + round(r * math.sin(a))))
    cv.poly(pts, "y")
    cv.px(10, 9, "Y"), cv.px(9, 10, "Y")


@icon
def rating_kosong(cv):
    pts = []
    for i in range(10):
        a = math.radians(-90 + i * 36)
        r = 11 if i % 2 == 0 else 5
        pts.append((12 + round(r * math.cos(a)), 13 + round(r * math.sin(a))))
    cv.poly(pts, "S")


@icon
def offline(cv):
    cv.disc(10, 13, 8, "y")
    cv.disc(14, 10, 7, ".")
    for x, y in ((15, 14), (19, 9)):                       # Zz
        cv.hline(x, y, 4, "w"), cv.line(x + 3, y, x, y + 3, "w"), cv.hline(x, y + 3, 4, "w")


@icon
def boost(cv):
    cv.poly([(14, 1), (5, 13), (11, 13), (9, 23), (19, 9), (13, 9)], "y")
    cv.line(13, 3, 7, 12, "Y")


@icon
def boost_rempi(cv):
    cv.poly([(7, 6), (17, 6), (15, 16), (9, 22), (8, 16)], "r")
    cv.line(9, 7, 9, 15, "o")
    cv.rect(10, 3, 4, 3, "v")
    cv.px(10, 10, "e"), cv.px(14, 10, "e")
    cv.hline(11, 13, 3, "e")
    for x, y in ((3, 4), (20, 3), (21, 16)):
        cv.px(x, y, "p")


@icon
def kombo(cv):
    for cx in (7, 17):
        cv.ellipse(cx, 14, 6, 3, "w")
        cv.ellipse(cx, 13, 3, 2, "o" if cx == 7 else "v")
    cv.ring(12, 8, 3, "y")
    cv.poly([(10, 2), (14, 2), (12, 5)], "y")


@icon
def menu_spesial(cv):
    cv.frame(1, 1, 22, 22, "G")
    cv.frame(2, 2, 20, 20, "y")
    pts = []
    for i in range(10):
        a = math.radians(-90 + i * 36)
        r = 8 if i % 2 == 0 else 4
        pts.append((12 + round(r * math.cos(a)), 12 + round(r * math.sin(a))))
    cv.poly(pts, "y")


@icon
def menu_legendaris(cv):
    cv.ellipse(12, 16, 7, 6, "p")
    cv.poly([(5, 16), (19, 16), (12, 1)], "p")
    cv.ellipse(12, 17, 4, 4, "Y")
    cv.poly([(8, 17), (16, 17), (12, 7)], "Y")
    cv.disc(12, 18, 2, "w")


# ------------------------------------------------------------- fitur
@icon
def toko(cv):
    cv.rect(3, 11, 18, 11, "w")
    cv.rect(9, 14, 6, 8, "k")
    for x in range(2, 22):
        cv.vline(x, 5, 5 + (1 if x % 4 < 2 else 0), "r" if (x // 4) % 2 else "w")
    cv.hline(2, 4, 20, "R")


@icon
def peta(cv):
    cv.poly([(2, 6), (8, 3), (16, 6), (22, 3), (22, 19), (16, 22), (8, 19), (2, 22)], "y")
    cv.line(8, 3, 8, 19, "G"), cv.line(16, 6, 16, 22, "G")
    cv.line(4, 16, 11, 11, "r"), cv.line(11, 11, 18, 14, "r")
    cv.disc(18, 10, 3, "r")
    cv.px(18, 10, "w")


@icon
def misi_harian(cv):
    cv.rect(3, 5, 18, 17, "w")
    cv.rect(3, 5, 18, 5, "r")
    cv.vline(7, 2, 5, "S"), cv.vline(16, 2, 5, "S")
    for i in range(6):
        cv.rect(5 + (i % 3) * 5, 12 + (i // 3) * 4, 3, 2, "W")
    cv.rect(15, 16, 3, 2, "v")


@icon
def hadiah(cv):
    cv.rect(3, 10, 18, 12, "r")
    cv.rect(2, 7, 20, 4, "r")
    cv.rect(10, 7, 4, 15, "y")
    cv.ellipse(8, 5, 3, 2, "y"), cv.ellipse(16, 5, 3, 2, "y")


@icon
def trofi(cv):
    cv.poly([(5, 3), (19, 3), (17, 12), (7, 12)], "y")
    cv.ellipse(12, 11, 5, 3, "y")
    cv.ring(4, 7, 3, "y"), cv.ring(20, 7, 3, "y")
    cv.rect(11, 14, 3, 4, "G")
    cv.rect(7, 18, 11, 4, "k")
    cv.vline(9, 4, 6, "Y")


@icon
def iklan_bonus(cv):
    cv.rect(1, 3, 20, 14, "n")
    cv.rect(3, 5, 16, 10, "B")
    cv.poly([(8, 7), (8, 13), (14, 10)], "w")
    cv.rect(8, 17, 6, 2, "S")
    _coin(cv, 17, 17, 6)


# ---------------------------------------------------------- badge stage
@icon
def stage1_gerobak(cv):
    cv.rect(2, 4, 20, 2, "o")
    cv.vline(4, 6, 8, "S"), cv.vline(19, 6, 8, "S")
    cv.rect(5, 8, 10, 5, "c")
    cv.rect(2, 13, 20, 5, "k")
    cv.ring(16, 19, 3, "n")
    cv.vline(5, 18, 5, "K")


@icon
def stage2_warung(cv):
    cv.poly([(5, 3), (19, 3), (23, 9), (1, 9)], "b")
    for x in range(1, 23, 4):
        cv.rect(x, 9, 2, 2, "w")
    cv.vline(2, 9, 14, "S"), cv.vline(21, 9, 14, "S")
    cv.rect(4, 12, 16, 5, "w")
    cv.hline(4, 17, 16, "r")
    cv.rect(4, 18, 16, 2, "k")


@icon
def stage3_kedai(cv):
    cv.rect(3, 3, 18, 20, "y")
    cv.rect(5, 5, 5, 4, "b"), cv.rect(14, 5, 5, 4, "b")
    cv.rect(3, 11, 18, 3, "w")
    cv.hline(5, 12, 14, "r")
    for x in range(3, 21):
        cv.vline(x, 14, 2, "o" if (x // 3) % 2 else "w")
    cv.rect(5, 16, 14, 7, "K")


@icon
def stage4_resto(cv):
    cv.rect(3, 1, 18, 22, "B")
    for y in (3, 7):
        for x in (5, 10, 15):
            cv.rect(x, y, 3, 3, "y" if (x + y) % 3 else "c")
    cv.rect(3, 12, 18, 3, "n")
    cv.hline(6, 13, 12, "c")
    cv.rect(4, 16, 16, 7, "y")
    cv.vline(12, 16, 7, "S")


@icon
def stage5_istana(cv):
    cv.ellipse(12, 20, 11, 2, "v")
    cv.poly([(3, 21), (21, 21), (12, 23)], "n")
    cv.rect(6, 13, 12, 7, "u")
    cv.poly([(3, 14), (21, 14), (16, 9), (8, 9)], "y")
    cv.poly([(7, 9), (17, 9), (12, 4)], "y")
    cv.rect(11, 16, 3, 4, "Y")
    cv.poly([(10, 4), (14, 4), (12, 0)], "p")


def _pin(color, dark):
    def draw(cv):
        cv.disc(12, 9, 8, "q")
        cv.poly([(5, 12), (19, 12), (12, 23)], "q")
        cv.disc(12, 9, 4, "w")
        cv.disc(12, 9, 2, "Q")
    return draw, {"q": color, "Q": dark}


PIN_EXTRA = {}
for _cid in CITY_ORDER:
    _fn, _pal = _pin(*CITIES[_cid]["accent"])
    ICONS[f"kota_{_cid}"] = _fn
    PIN_EXTRA[f"kota_{_cid}"] = _pal


def build(name):
    cv = Canvas(N, N)
    ICONS[name](cv)
    cv.outline("O", skip=(".", "x"))
    return render(cv.g, {**PAL, **PIN_EXTRA.get(name, {})})


def generate():
    OUT.mkdir(parents=True, exist_ok=True)
    names = list(ICONS)
    imgs = {}
    for n in names:
        im = build(n)
        imgs[n] = im
        im.save(OUT / f"{n}.png")
        scale(im, 4).save(OUT / f"{n}@4x.png")
    cols = 8
    rows = (len(names) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * N, rows * N), (0, 0, 0, 0))
    atlas = {}
    for i, n in enumerate(names):
        x, y = (i % cols) * N, (i // cols) * N
        sheet.alpha_composite(imgs[n], (x, y))
        atlas[n] = {"x": x, "y": y, "w": N, "h": N}
    sheet.save(OUT / "ui_icons_sheet.png")
    (OUT / "ui_icons_atlas.json").write_text(json.dumps(
        {"image": "ui_icons_sheet.png", "size": N, "icons": atlas}, indent=2) + "\n")
    grid = [names[i:i + cols] for i in range(0, len(names), cols)]
    contact_sheet([[imgs[n] for n in r] for r in grid], k=4, labels=grid, pad=14).save(
        OUT / "ui_icons_preview.png")
