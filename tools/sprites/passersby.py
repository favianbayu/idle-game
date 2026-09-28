"""Ambient passers-by (side view, walking right; flip for leftward) + umbrellas.

- kucing oren (jalan 4 frame, duduk 2 frame)
- ayam kampung (jalan 2, matuk 2)
- motor: ojek (jaket hijau) & keluarga boncengan, 2 frame, + versi jas hujan
- tukang sayur dorong gerobak, 4 frame, + versi terpal hujan
- payung 4 warna untuk pelanggan saat hujan
"""

from .core import ASSETS, contact_sheet, render, save_set
from .draw import Canvas

OUT = ASSETS / "lewat"
O = "#2a1c24"


def _fin(cv, pal, skip=(".",)):
    cv.outline("O", skip=skip)
    return render(cv.g, {**pal, "O": O})


# ------------------------------------------------------------------ kucing
KUCING = {"o": "#f0902a", "q": "#b8601a", "w": "#fbf6ec", "e": "#1e1420", "p": "#ff8f9c"}


def kucing(frame):
    cv = Canvas(22, 16)
    legs = [(5, 7, 13, 15), (6, 6, 12, 14), (7, 5, 14, 13), (6, 6, 13, 14)][frame % 4]
    for i, x in enumerate(legs):
        cv.vline(x, 10, 4 if i % 2 == 0 else 3, "o")
        cv.px(x, 13 if i % 2 == 0 else 12, "w")
    cv.ellipse(10, 8, 6, 3, "o")
    for x in (7, 10, 13):
        cv.vline(x, 5, 2, "q")
    cv.ellipse(10, 10, 4, 1, "w")
    for i, (x, y) in enumerate(((4, 7), (3, 6), (2, 5), (2, 4), (3, 3), (3, 2))):
        cv.px(x - (frame % 2) * (i // 4), y, "o")
    cv.disc(17, 6, 3, "o")
    cv.px(15, 2, "o"), cv.px(15, 3, "o"), cv.px(18, 2, "o"), cv.px(18, 3, "o")
    cv.px(18, 6, "e"), cv.px(20, 7, "p"), cv.px(18, 8, "w"), cv.px(19, 8, "w")
    return _fin(cv, KUCING)


def kucing_duduk(frame):
    cv = Canvas(22, 16)
    cv.ellipse(10, 10, 4, 4, "o")
    cv.ellipse(10, 12, 3, 2, "w")
    cv.vline(8, 5, 2, "q"), cv.vline(12, 7, 2, "q")
    cv.line(14, 13, 18, 11, "o"), cv.px(19, 10, "o")               # ekor
    cv.disc(10, 5, 3, "o")
    cv.px(8, 1, "o"), cv.px(8, 2, "o"), cv.px(12, 1, "o"), cv.px(12, 2, "o")
    if frame == 0:
        cv.px(9, 5, "e"), cv.px(11, 5, "e")
    else:                                                            # merem, jilat kaki
        cv.hline(8, 5, 2, "e"), cv.hline(11, 5, 2, "e")
        cv.rect(6, 6, 2, 3, "w"), cv.px(10, 7, "p")
    cv.px(10, 6, "p")
    return _fin(cv, KUCING)


# -------------------------------------------------------------------- ayam
AYAM = {"b": "#a8502a", "B": "#6b2e1a", "t": "#2b2530", "r": "#d8322a", "y": "#f2c94c", "e": "#1e1420"}


def ayam(frame):
    cv = Canvas(16, 16)
    peck = frame >= 2
    cv.ellipse(7, 9, 5, 3, "b")
    cv.poly([(1, 5), (4, 8), (2, 10)], "t")                          # ekor
    cv.line(6, 9, 9, 10, "B")
    hx, hy = (12, 10) if peck else (11, 5)
    cv.vline(10, hy, 9 - hy if not peck else 1, "b")
    cv.disc(hx, hy, 2, "b")
    cv.px(hx, hy - 3, "r"), cv.px(hx + 1, hy - 3, "r"), cv.px(hx + 1, hy + 2, "r")
    cv.px(hx + 3, hy, "y"), cv.px(hx + 1, hy - 1, "e")
    lx = [(6, 8), (5, 9), (6, 8), (6, 8)][frame]
    for x in lx:
        cv.vline(x, 12, 3, "y")
    return _fin(cv, AYAM)


# ------------------------------------------------------------------- motor
MOTOR = {"T": "#2b2530", "M": "#9aa3a8", "m": "#5d666b", "k": "#c9322a", "K": "#8a1f12",
         "s": "#d99a6c", "e": "#1e1420", "l": "#fff2a8", "p": "#3e3a4a"}
RIDERS = {
    "ojek": {"j": "#3fae5a", "J": "#2a7a3a", "h": "#3fae5a", "H": "#2a7a3a", "v": "#1e1420"},
    "keluarga": {"j": "#8e62c4", "J": "#5a3a8a", "h": "#fbf6ec", "H": "#c9c1b3", "v": "#4f86a6",
                 "c": "#f2c94c", "C": "#b8892a"},
}
JAS_HUJAN = {"j": "#4fa8e0", "J": "#2e6aa0", "c": "#f2d24c", "C": "#c9a020"}


def motor(kind, frame, rain=False):
    cv = Canvas(52, 40)
    bob = frame % 2
    for cx in (11, 41):                                               # roda
        cv.disc(cx, 33, 6, "T")
        cv.disc(cx, 33, 3, "M")
        for a in ((0, -2), (2, 0), (0, 2), (-2, 0)) if frame % 2 == 0 else ((1, -1), (1, 1), (-1, 1), (-1, -1)):
            cv.px(cx + a[0], 33 + a[1], "m")
    y0 = bob
    cv.poly([(8, 26 + y0), (30, 24 + y0), (40, 22 + y0), (44, 26 + y0), (40, 30 + y0), (12, 30 + y0)], "k")
    cv.poly([(36, 14 + y0), (42, 14 + y0), (45, 26 + y0), (39, 26 + y0)], "k")   # tameng depan
    cv.hline(10, 29 + y0, 30, "K")
    cv.rect(14, 22 + y0, 16, 3, "p")                                  # jok
    cv.rect(44, 18 + y0, 3, 3, "l")                                   # lampu
    cv.line(37, 12 + y0, 42, 10 + y0, "m")                            # setang
    cv.line(40, 30 + y0, 44, 33 + y0, "m")
    # pengendara
    r = dict(RIDERS[kind])
    if rain:
        r.update(JAS_HUJAN)
    cv.rect(22, 12 + y0, 9, 11, "j")                                  # badan
    cv.vline(30, 12 + y0, 11, "J")
    cv.line(29, 15 + y0, 38, 12 + y0, "j")                            # lengan
    cv.rect(24, 22 + y0, 12, 3, "p")                                  # paha
    cv.vline(35, 22 + y0, 7, "p")                                     # kaki
    cv.disc(27, 7 + y0, 4, "h")                                       # helm
    cv.rect(28, 6 + y0, 4, 3, "v")                                    # kaca helm
    cv.hline(23, 9 + y0, 3, "H")
    if kind == "keluarga":                                            # anak dibonceng
        cv.rect(15, 15 + y0, 7, 8, "c")
        cv.vline(15, 15 + y0, 8, "C")
        cv.disc(18, 11 + y0, 3, "h" if not rain else "c")
        cv.px(20, 11 + y0, "e")
        cv.rect(16, 23 + y0, 6, 2, "p")
    if rain:                                                          # ujung jas hujan berkibar
        cv.poly([(22, 22 + y0), (14 if kind == "ojek" else 12, 26 + y0 + frame % 2), (22, 26 + y0)], "j")
    return _fin(cv, {**MOTOR, **r})


# ------------------------------------------------------------- tukang sayur
SAYUR = {"w": "#a0643a", "W": "#6b4a32", "M": "#50585c", "g": "#5fae4a", "G": "#2f7a3a",
         "r": "#d8322a", "o": "#f0902a", "y": "#f2c94c", "s": "#b0714b", "S": "#8a5433",
         "b": "#4f86a6", "B": "#2e5570", "c": "#d8b860", "C": "#a8883a", "e": "#1e1420",
         "p": "#3e3a4a", "t": "#bfe6f0aa"}


def tukang_sayur(frame, rain=False):
    cv = Canvas(64, 42)
    # gerobak sayur di depan (kanan)
    cv.rect(28, 20, 32, 12, "w")
    cv.hline(28, 24, 32, "W"), cv.hline(28, 28, 32, "W")
    for x, col in ((31, "g"), (37, "r"), (43, "o"), (49, "g"), (55, "y")):
        cv.ellipse(x, 18, 3, 3, col)
    cv.px(37, 15, "G"), cv.px(49, 15, "G")
    cv.rect(29, 16, 2, 3, "g"), cv.rect(41, 15, 2, 4, "G")
    cv.line(28, 22, 20, 18, "M")                                      # pegangan
    for cx in (34, 54):
        cv.disc(cx, 36, 4, "p")
        cv.disc(cx, 36, 1, "M")
    cv.vline(46, 32, 4, "M")
    if rain:
        cv.poly([(27, 8), (61, 8), (62, 21), (26, 21)], "t")          # terpal plastik
    # orangnya (menghadap kanan, mendorong)
    step = frame % 4
    legs = [(12, 16), (13, 15), (14, 14), (13, 15)][step]
    cv.vline(legs[0], 32, 8, "p"), cv.vline(legs[1], 32, 8, "p")
    cv.px(legs[0] + 1, 39, "e"), cv.px(legs[1] + 1, 39, "e")
    cv.rect(9, 20, 10, 13, "b")
    cv.vline(18, 20, 13, "B")
    cv.line(17, 23, 21, 19, "s")                                      # tangan
    cv.disc(14, 14, 4, "s")
    cv.px(17, 14, "e")
    cv.rect(12, 16, 3, 1, "S")
    cv.poly([(5, 12), (23, 12), (14, 5)], "c")                        # caping
    cv.hline(5, 12, 19, "C")
    return _fin(cv, SAYUR, skip=(".", "t"))


# ------------------------------------------------------------------- payung
PAYUNG = {"merah": ("#d8432a", "#8a1f12"), "biru": ("#3f8ac6", "#1f4a7a"),
          "kuning": ("#f2c94c", "#b8892a"), "hijau": ("#5fae4a", "#2f7a3a")}


def payung(color):
    a, b = PAYUNG[color]
    cv = Canvas(28, 38)
    cv.ellipse(14, 9, 13, 8, "a")
    cv.rect(0, 9, 28, 9, ".")
    for x in range(1, 28):                                            # tepi bergelombang
        if x % 6 in (2, 3):
            cv.px(x, 9, "a")
    for x in (7, 14, 21):
        cv.line(14, 1, x, 9, "b")
    cv.hline(3, 5, 4, "w")
    cv.vline(14, 0, 2, "k")
    cv.vline(14, 10, 26, "k")
    cv.px(13, 36, "k"), cv.px(12, 35, "k")                            # gagang J
    return _fin(cv, {"a": a, "b": b, "w": "#ffffffaa", "k": "#3a2a22"}, skip=(".", "w"))


def generate():
    OUT.mkdir(parents=True, exist_ok=True)
    save_set(OUT / "kucing", [(f"jalan{i + 1}", kucing(i)) for i in range(4)] +
             [(f"duduk{i + 1}", kucing_duduk(i)) for i in range(2)],
             gif_order=[0, 1, 2, 3, 0, 1, 2, 3, 4, 5, 4, 5], durations=[150] * 8 + [500] * 4)
    save_set(OUT / "ayam", [("jalan1", ayam(0)), ("jalan2", ayam(1)), ("matuk1", ayam(2)),
                            ("matuk2", ayam(3))], durations=[250, 250, 200, 200])
    for kind in RIDERS:
        for rain in (False, True):
            name = f"motor_{kind}" + ("_hujan" if rain else "")
            save_set(OUT / name, [(f"jalan{i + 1}", motor(kind, i, rain)) for i in range(2)],
                     durations=[90, 90])
    for rain in (False, True):
        save_set(OUT / ("tukang_sayur" + ("_hujan" if rain else "")),
                 [(f"jalan{i + 1}", tukang_sayur(i, rain)) for i in range(4)], durations=[180] * 4)
    for c in PAYUNG:
        payung(c).save(OUT / f"payung_{c}.png")
    rows = [[kucing(i) for i in range(4)] + [kucing_duduk(0), kucing_duduk(1)] + [ayam(i) for i in range(4)],
            [motor("ojek", 0), motor("ojek", 0, True), motor("keluarga", 0), motor("keluarga", 1, True)],
            [tukang_sayur(0), tukang_sayur(2, True)] + [payung(c) for c in PAYUNG]]
    contact_sheet(rows, k=4, pad=10).save(OUT / "lewat_preview.png")
