"""City street props (same pixel scale as the characters).

Each prop is drawn in neutral daylight colours; environments tint them to the
stage's lighting when compositing.
"""

import math

from .core import render
from .draw import Canvas

OUTLINE = "#2a1c24"


def _finish(cv, skip=(".",)):
    cv.outline("O", skip=skip)
    return cv


# ------------------------------------------------------------------ Jakarta
def ondel_ondel(female=False):
    """Giant Betawi doll: kembang kelapa crown, red (male) / white (female) mask."""
    cv = Canvas(26, 58)
    # body: long cloth, wide at the bottom
    cv.poly([(6, 24), (20, 24), (24, 56), (2, 56)], "b")
    cv.fill_fn(3, 34, 21, 22, lambda i, j: "B" if (i + j) % 6 == 0 else None)
    cv.rect(4, 44, 19, 3, "y")                                   # selendang
    cv.poly([(6, 24), (20, 24), (18, 32), (8, 32)], "s")         # kerah
    cv.rect(2, 26, 3, 12, "b")                                   # lengan
    cv.rect(21, 26, 3, 12, "b")
    # mask
    face = "w" if female else "r"
    cv.ellipse(13, 17, 6, 7, face)
    cv.px(10, 15, "e"), cv.px(16, 15, "e")
    cv.hline(10, 14, 2, "e"), cv.hline(15, 14, 2, "e")
    cv.hline(11, 20, 5, "m")
    if not female:
        cv.hline(9, 19, 3, "e"), cv.hline(15, 19, 3, "e")       # kumis
    # kembang kelapa crown
    cv.ellipse(13, 9, 7, 3, "y")
    for i, x in enumerate(range(5, 22, 2)):
        top = 1 + (i % 3)
        cv.vline(x, top, 7 - top, "gpyc"[i % 4])
        cv.px(x, top - 1, "pgcy"[i % 4])
    return _finish(cv), {
        "b": "#c9432a" if not female else "#3f8a4a", "B": "#8a1f12" if not female else "#285e32",
        "s": "#f2c94c", "y": "#f2c94c", "r": "#d8432a", "w": "#f6ecdc", "e": "#1e1420",
        "m": "#7a2e2a", "g": "#6fa044", "p": "#ff8fdc", "c": "#7cf5e8", "O": OUTLINE,
    }


def bajaj():
    """Orange Jakarta bajaj, side view (nose to the right)."""
    cv = Canvas(46, 34)
    cv.ellipse(20, 17, 17, 13, "o")                                        # kabin bulat
    cv.rect(0, 17, 46, 17, ".")
    cv.rect(3, 17, 34, 9, "o")
    cv.poly([(33, 12), (40, 16), (43, 26), (33, 26)], "o")                 # hidung depan
    cv.poly([(8, 9), (24, 7), (24, 20), (8, 20)], "d")                     # sisi terbuka
    cv.rect(10, 15, 6, 5, "k")                                             # jok penumpang
    cv.poly([(27, 7), (33, 12), (34, 20), (27, 20)], "g")                  # kaca depan
    cv.line(28, 18, 31, 10, "G")
    cv.hline(6, 5, 26, "K")                                                # atap kanvas
    cv.hline(4, 6, 30, "K")
    cv.rect(40, 19, 3, 3, "y")                                             # lampu
    cv.hline(3, 23, 38, "K")
    for cx in (10, 36):
        cv.disc(cx, 28, 5, "t")
        cv.disc(cx, 28, 2, "M")
    return _finish(cv), {"o": "#e0662a", "K": "#a8401a", "d": "#3a2a30", "k": "#2b2530",
                         "g": "#a9d8d8", "G": "#effcfc", "y": "#fff2a8", "t": "#2b2530",
                         "M": "#9aa3a8", "O": OUTLINE}


# ------------------------------------------------------------------ Bandung
def pinus(h=60):
    cv = Canvas(28, h)
    cv.rect(13, h - 12, 3, 12, "t")
    tiers = 5
    for i in range(tiers):
        top = 2 + i * (h - 14) // tiers
        bot = top + (h - 14) // tiers + 6
        half = 3 + i * 2 + 2
        cv.poly([(14 - half, bot), (15 + half, bot), (14, top)], "g")
        cv.line(14, top + 1, 14 - half + 1, bot - 1, "G")
        cv.hline(14 - half + 1, bot - 1, half * 2, "d")
    return _finish(cv), {"g": "#3f7a52", "G": "#5fa06a", "d": "#285e3c", "t": "#6b4a32",
                         "O": OUTLINE}


def angklung():
    cv = Canvas(16, 24)
    cv.rect(1, 20, 14, 3, "b")
    for x, top in ((3, 4), (7, 2), (11, 6)):
        cv.box(x - 1, top, 3, 18 - top, "B")
        cv.px(x, top + 3, "d"), cv.px(x, top + 8, "d")
    cv.hline(1, 3, 14, "b")
    cv.vline(1, 3, 18, "b")
    cv.vline(14, 3, 18, "b")
    return _finish(cv), {"b": "#b0923e", "B": "#e2c678", "d": "#8a6f2e", "O": OUTLINE}


# --------------------------------------------------------------------- Bali
def penjor(h=96, flip=False):
    cv = Canvas(22, h)
    d = -1 if flip else 1
    x0 = 3 if not flip else 18
    for y in range(18, h):
        cv.px(x0, y, "k")
        cv.px(x0 + d, y, "K")
    for i in range(22):
        cv.px(x0 + d * round(i * 0.7), 18 - round(12 * math.sin(i / 14)), "k")
    tip = x0 + d * 15
    cv.rect(tip - 1, 8, 3, 10, "y")                                         # sampian
    for j, col in enumerate("rwy" * 8):
        cv.rect(x0 + (2 if not flip else -4), 26 + j * 3, 3, 3, col)
    for yy in range(30, h - 20, 14):                                         # hiasan janur
        cv.line(x0 + d, yy, x0 + d * 6, yy + 5, "y")
    return _finish(cv), {"k": "#e2c678", "K": "#b0923e", "y": "#f2e08a", "r": "#c9432a",
                         "w": "#f3e9d8", "O": OUTLINE}


def kamboja():
    """Frangipani tree with white-yellow flowers."""
    cv = Canvas(44, 52)
    for (x0, y0, x1, y1) in ((22, 51, 22, 30), (22, 34, 12, 20), (22, 32, 32, 18),
                             (22, 40, 34, 30), (21, 36, 8, 30)):
        for dx in (0, 1, 2):
            cv.line(x0 + dx - 1, y0, x1 + dx - 1, y1, "t")
    for cx, cy, rx, ry in ((12, 16, 9, 6), (32, 14, 10, 6), (35, 27, 7, 4), (7, 27, 7, 4),
                           (22, 10, 8, 5)):
        cv.ellipse(cx, cy, rx, ry, "g")
        cv.ellipse(cx - 2, cy - 2, rx - 4, ry - 3, "G")
    for fx, fy in ((9, 13), (15, 18), (28, 11), (35, 15), (21, 8), (36, 26), (6, 26), (24, 12)):
        cv.px(fx, fy, "y")
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            cv.px(fx + dx, fy + dy, "w")
    return _finish(cv), {"t": "#8a6a5a", "g": "#4f8a3a", "G": "#6fa84e", "w": "#fbf6ec",
                         "y": "#f2c94c", "O": OUTLINE}


def canang():
    cv = Canvas(12, 8)
    cv.rect(1, 4, 10, 3, "g")
    for i, c in enumerate("rwyp"):
        cv.px(2 + i * 2, 3, c), cv.px(3 + i * 2, 3, c)
    cv.px(6, 1, "k"), cv.px(6, 2, "k")                                      # dupa
    return _finish(cv), {"g": "#8ab050", "r": "#c9432a", "w": "#fbf6ec", "y": "#f2c94c",
                         "p": "#ff8fdc", "k": "#6b4a32", "O": OUTLINE}


def kelapa(h=76, lean=1):
    cv = Canvas(48, h)
    top_x = 24 + lean * 8
    for y in range(18, h):
        t = (y - 18) / (h - 18)
        x = round(top_x - lean * 8 * t)
        cv.rect(x - 1, y, 3, 1, "t" if (y // 3) % 2 else "T")
    for ang in (-160, -120, -60, -20, 200, 90 + 180):
        r = math.radians(ang)
        for i in range(20):
            px_ = top_x + round(i * math.cos(r))
            py_ = 18 + round(i * math.sin(r) * 0.6 + (i * i) / 40)
            cv.rect(px_, py_, 2, 2, "g")
            cv.px(px_, py_ + 2, "G")
    cv.disc(top_x - 1, 20, 2, "c"), cv.disc(top_x + 2, 21, 2, "c")
    return _finish(cv), {"t": "#8a6a4a", "T": "#6b4a32", "g": "#4f8a3a", "G": "#2f5a24",
                         "c": "#6b4a32", "O": OUTLINE}


def jukung():
    """Balinese outrigger fishing boat on the sand."""
    cv = Canvas(56, 22)
    cv.poly([(4, 10), (52, 10), (46, 17), (10, 17)], "w")                  # lambung
    cv.hline(6, 12, 44, "r")
    cv.hline(8, 14, 40, "y")
    cv.poly([(0, 5), (8, 10), (4, 10)], "w")                                # moncong
    cv.poly([(56, 5), (48, 10), (52, 10)], "w")
    cv.px(6, 9, "e"), cv.px(49, 9, "e")                                     # mata perahu
    for x in (14, 42):                                                      # cadik
        cv.line(x, 10, x - 4, 19, "k")
    cv.hline(2, 19, 52, "k")
    cv.vline(28, 0, 10, "k")                                                # tiang layar
    return _finish(cv), {"w": "#fbf6ec", "r": "#c9432a", "y": "#3f7fb0", "e": "#1e1420",
                         "k": "#b0923e", "O": OUTLINE}


# ----------------------------------------------------------------- Surabaya
def becak():
    cv = Canvas(48, 38)
    # passenger seat + canopy (front)
    cv.poly([(3, 10), (22, 8), (24, 24), (3, 24)], "r")
    cv.poly([(2, 6), (20, 3), (24, 9), (4, 12)], "c")                     # kap
    for x in range(4, 22, 4):
        cv.line(x, 6, x + 1, 11, "C")
    cv.rect(5, 18, 18, 6, "b")                                             # jok
    cv.hline(5, 18, 18, "B")
    # frame to rider
    cv.line(22, 24, 38, 18, "M")
    cv.line(22, 25, 38, 19, "M")
    cv.vline(38, 12, 14, "M")
    cv.rect(35, 11, 6, 2, "k")                                             # sadel
    cv.line(38, 26, 42, 30, "M")
    # wheels
    for cx, r in ((8, 6), (20, 6), (41, 6)):
        cv.ring(cx, 30, r, "t", thick=2)
        cv.disc(cx, 30, 1, "M")
    cv.hline(3, 24, 21, "R")
    return _finish(cv), {"r": "#c9432a", "R": "#8a1f12", "c": "#2e4a7a", "C": "#1c2f52",
                         "b": "#f2c94c", "B": "#b0923e", "M": "#6d777d", "k": "#2b2530",
                         "t": "#2b2530", "O": OUTLINE}


def bendera(h=50, wave=0):
    cv = Canvas(22, h)
    cv.rect(2, 2, 2, h - 2, "M")
    cv.disc(3, 1, 1, "y")
    for x in range(4, 20):
        dy = round(math.sin((x + wave * 3) / 3))
        cv.vline(x, 4 + dy, 5, "r")
        cv.vline(x, 9 + dy, 5, "w")
    return _finish(cv), {"M": "#9aa3a8", "y": "#f2c94c", "r": "#d8322a", "w": "#fbf6ec",
                         "O": OUTLINE}


# ------------------------------------------------------------------ generic
def lampu_jalan(h=70, lit=True):
    cv = Canvas(22, h)
    cv.rect(4, 8, 2, h - 8, "M")
    cv.rect(2, h - 4, 6, 4, "M")
    cv.line(5, 8, 12, 4, "M")
    cv.hline(12, 4, 6, "M")
    cv.rect(12, 5, 6, 2, "b" if lit else "d")
    return _finish(cv), {"M": "#50585c", "b": "#fff2a8", "d": "#8a8f8a", "O": OUTLINE}


PROPS = {
    "ondel_ondel": lambda: ondel_ondel(False),
    "ondel_ondel_perempuan": lambda: ondel_ondel(True),
    "bajaj": bajaj,
    "pinus": pinus,
    "angklung": angklung,
    "penjor": penjor,
    "kamboja": kamboja,
    "canang": canang,
    "jukung": jukung,
    "kelapa": kelapa,
    "becak": becak,
    "bendera": bendera,
    "lampu_jalan": lampu_jalan,
}


def image(name, **kw):
    fn = PROPS[name] if not kw else {
        "penjor": penjor, "kelapa": kelapa, "pinus": pinus, "bendera": bendera,
        "lampu_jalan": lampu_jalan}[name]
    cv, pal = fn(**kw) if kw else fn()
    return render(cv.g, pal)
