"""Stage buildings: gerobak -> warung tenda -> ruko -> resto modern -> istana rasa.

Same pixel scale as the characters (32x40), so the main character can stand
in front of any of them. Each building has 2 animation frames (steam, lights,
neon flicker, floating) and a meta entry with ground line + vendor spot.
"""

import json
import math

from .cities import CITIES, CITY_ORDER
from .core import ASSETS, render, save_set
from .draw import Canvas

OUT = ASSETS.parent / "buildings"

OUTLINE = "#2a1c24"


def _steam(cv, points, big=True):
    for x, y in points:
        cv.disc(x, y, 1 if big else 0, "x")
        for dx, dy in ((-2, 0), (2, 0), (0, -2), (1, 1)):
            if cv.get(x + dx, y + dy) == ".":
                cv.px(x + dx, y + dy, "X")


def _shadow(cv, cx, cy, rx, ry):
    for y in range(-ry, ry + 1):
        for x in range(-rx, rx + 1):
            if (x * x) / ((rx + 0.5) ** 2) + (y * y) / ((ry + 0.5) ** 2) <= 1:
                if cv.get(cx + x, cy + y) == ".":
                    cv.px(cx + x, cy + y, "q")


# =============================================================== stage 1
GEROBAK_PALETTE = {
    "O": OUTLINE,
    "w": "#a0643a", "W": "#74432a", "l": "#c98a55",          # kayu
    "c": "#f4e4bf", "C": "#d8c29a", "r": "#c9432a", "R": "#8a1f12",  # papan cat
    "f": "#e3e9ea", "F": "#9fb0b6",                          # rangka etalase
    "g": "#a9d8d8", "G": "#effcfc", "i": "#7fb3b8",          # kaca
    "n": "#fbf6ec", "y": "#f2c94c", "e": "#f2a93b", "v": "#6fa044", "o": "#d98a3a",
    "k": "#f0d9a0", "K": "#c9a86a",                          # kerupuk
    "M": "#9aa3a8", "N": "#5d666b", "D": "#3a3440",          # besi, kompor
    "T": "#2b2530", "t": "#4a4250",                          # ban
    "z": "#c9784a", "Z": "#8b4a2b", "s": "#e0a070",          # seng karatan
    "b": "#fff2a8", "h": "#fff2a866",                        # bohlam + glow
    "P": "#eef4f2cc",                                        # plastik
    "x": "#f3e9d8cc", "X": "#f3e9d866",                      # asap
    "q": "#1b142055",                                        # bayangan
}


GEROBAK_THEME = {
    "jakarta": {"roof": "seng", "hang": "kerupuk", "cook": "anglo",
                "palette": {"w": "#3f8a4a", "W": "#285e32", "l": "#6fb070",
                            "z": "#e0662a", "Z": "#a8401a", "s": "#f0905a"}},
    "bandung": {"roof": "bambu", "hang": "angklung", "cook": "batagor",
                "palette": {"w": "#c9a24e", "W": "#8a6a2e", "l": "#ecd28a",
                            "z": "#e2c678", "Z": "#a8883a", "s": "#f6e6a8"}},
    "bali": {"roof": "alang", "hang": "janur", "cook": "sate",
             "palette": {"w": "#6b4a32", "W": "#4a3222", "l": "#8a6a4a",
                         "z": "#c9a86a", "Z": "#9a7a44", "s": "#e0c890"}},
    "surabaya": {"roof": "terpal", "hang": "bendera", "cook": "panci",
                 "palette": {"w": "#3f6aa8", "W": "#2e4a7a", "l": "#6a92c8",
                             "z": "#d8322a", "Z": "#8a1f12", "s": "#fbf6ec"}},
}


def _gerobak_roof(cv, X, Y, style):
    top = [(X(3), Y(6)), (X(77), Y(2))]
    if style == "alang":                                       # atap alang-alang tebal
        cv.poly([(X(1), Y(6)), (X(79), Y(1)), (X(79), Y(10)), (X(1), Y(15))], "z")
        for x in range(1, 79):
            yb = 15 - (x - 1) * 5 // 78
            cv.vline(X(x), Y(yb - 2 - (x * 7) % 4), 2 + (x * 7) % 4, "Z")
            if x % 3 == 0:
                cv.px(X(x), Y(yb + 1), "Z")
        cv.line(X(1), Y(6), X(78), Y(1), "s")
        return
    cv.poly(top + [(X(77), Y(7)), (X(3), Y(11))], "z")
    if style == "seng":
        for x in range(3, 77):
            if x % 3 == 0:
                for y in range(0, 12):
                    if cv.get(X(x), Y(y)) == "z":
                        cv.px(X(x), Y(y), "Z")
        for x in range(4, 74, 4):                                # gigi balang
            yb = 11 - (x - 3) * 4 // 74
            cv.poly([(X(x), Y(yb)), (X(x + 4), Y(yb)), (X(x + 2), Y(yb + 3))], "W")
    elif style == "bambu":
        for off in (1, 3):
            cv.line(X(3), Y(6 + off), X(76), Y(2 + off), "Z")
        for x in range(5, 76, 7):
            cv.px(X(x), Y(8 - (x - 3) * 4 // 74), "W")
    elif style == "terpal":                                      # belang merah-putih
        for x in range(3, 77):
            if (x // 6) % 2:
                for y in range(0, 12):
                    if cv.get(X(x), Y(y)) == "z":
                        cv.px(X(x), Y(y), "s")
        for x in range(3, 77):
            yb = 11 - (x - 3) * 4 // 74
            if (x // 6) % 2 == 0 and x % 6 in (2, 3):
                cv.px(X(x), Y(yb + 1), "z")
    cv.line(X(3), Y(6), X(76), Y(2), "s")
    cv.line(X(3), Y(10), X(76), Y(6), "Z")


def _gerobak_hang(cv, X, Y, style):
    if style == "kerupuk":
        cv.vline(X(8), Y(10), 2, "D")
        cv.box(X(6), Y(12), 5, 7, "P")
        cv.box(X(6), Y(19), 5, 7, "P")
        for bx, by in ((7, 14), (9, 15), (8, 17), (7, 21), (9, 22), (8, 24)):
            cv.px(X(bx), Y(by), "k")
    elif style == "angklung":
        cv.vline(X(8), Y(10), 3, "D")
        cv.box(X(4), Y(13), 9, 12, "K")
        for tx, tt in ((6, 15), (8, 14), (10, 16)):
            cv.rect(X(tx), Y(tt), 1, 24 - tt, "k")
    elif style == "janur":
        cv.vline(X(8), Y(11), 2, "D")
        cv.poly([(X(5), Y(13)), (X(12), Y(13)), (X(8), Y(22))], "y")
        cv.vline(X(8), Y(22), 6, "y")
        cv.px(X(7), Y(16), "e")
    elif style == "bendera":
        cv.rect(X(3), Y(13), 9, 3, "r")
        cv.rect(X(3), Y(16), 9, 3, "n")


def _gerobak_cook(cv, X, Y, style):
    if style == "anglo":                                         # kerak telor: wajan terbalik
        cv.poly([(X(53), Y(32)), (X(66), Y(32)), (X(64), Y(25)), (X(55), Y(25))], "o")
        cv.hline(X(55), Y(25), 10, "e")
        cv.px(X(57), Y(24), "r"), cv.px(X(61), Y(24), "r")
        cv.poly([(X(51), Y(22)), (X(68), Y(22)), (X(64), Y(17)), (X(55), Y(17))], "N")
        cv.hline(X(51), Y(22), 18, "M")
        cv.ellipse(X(59), Y(23), 5, 0, "y")
        cv.hline(X(68), Y(20), 5, "W")
        return
    if style == "sate":                                          # panggangan sate lilit
        cv.box(X(50), Y(27), 20, 6, "D")
        cv.hline(X(51), Y(27), 18, "e")
        for x in range(51, 68, 3):
            cv.line(X(x), Y(27), X(x + 4), Y(22), "k")
            cv.rect(X(x + 1), Y(24), 2, 2, "o")
        return
    if style == "panci":                                         # rawon
        cv.box(X(52), Y(29), 14, 4, "D")
        cv.box(X(50), Y(17), 18, 13, "M", light="f", dark="N")
        cv.ellipse(X(59), Y(17), 8, 1, "D")
        cv.px(X(49), Y(21), "N"), cv.px(X(68), Y(21), "N")
        return
    cv.box(X(52), Y(28), 14, 5, "D")
    cv.px(X(56), Y(27), "e")
    cv.px(X(61), Y(27), "e")
    cv.poly([(X(49), Y(23)), (X(68), Y(23)), (X(64), Y(28)), (X(53), Y(28))], "N")
    cv.hline(X(49), Y(23), 19, "M")
    if style == "batagor":
        cv.ellipse(X(58), Y(22), 6, 1, "k")
        for bx in (54, 57, 60, 63):
            cv.rect(X(bx), Y(21), 2, 2, "K")
    else:
        cv.ellipse(X(58), Y(22), 6, 1, "o")
        cv.px(X(56), Y(21), "e")
        cv.px(X(60), Y(22), "v")
    cv.hline(X(68), Y(23), 5, "W")


def draw_gerobak(cv, ox=0, oy=0, roof=True, city="jakarta"):
    """Indonesian push cart in the city's style. Origin (ox, oy); 80x64 footprint."""
    X = lambda x: ox + x  # noqa: E731
    Y = lambda y: oy + y  # noqa: E731
    th = GEROBAK_THEME[city]
    text = CITIES[city]["signs"][1]

    if roof:
        cv.vline(X(12), Y(8), 26, "N")
        cv.vline(X(67), Y(8), 26, "N")
        _gerobak_roof(cv, X, Y, th["roof"])
        cv.vline(X(40), Y(8 if th["roof"] != "alang" else 10), 5, "D")
        cv.rect(X(39), Y(12), 3, 1, "D")
        cv.rect(X(39), Y(13), 3, 2, "b")
        _gerobak_hang(cv, X, Y, th["hang"])

    # glass display case
    cv.rect(X(14), Y(18), 34, 15, "g")
    cv.rect(X(15), Y(19), 32, 5, "i")
    cv.ellipse(X(20), Y(28), 3, 2, "n")                 # nasi
    cv.ellipse(X(27), Y(28), 3, 2, "y")                 # mie
    cv.px(X(26), Y(27), "e")
    cv.px(X(28), Y(29), "e")
    cv.disc(X(35), Y(28), 2, "n")                       # telur
    cv.px(X(35), Y(28), "e")
    cv.ellipse(X(42), Y(28), 3, 2, "v")                 # sayur
    cv.px(X(41), Y(27), "r")
    cv.rect(X(38), Y(20), 7, 3, "k")                    # toples kerupuk
    cv.hline(X(38), Y(22), 7, "K")
    cv.line(X(17), Y(30), X(23), Y(21), "G")
    cv.line(X(19), Y(30), X(25), Y(21), "G")
    cv.line(X(34), Y(30), X(40), Y(21), "G")
    cv.frame(X(15), Y(19), 32, 13, "f")
    cv.vline(X(31), Y(19), 13, "f")
    cv.hline(X(15), Y(31), 32, "F")
    cv.frame(X(14), Y(18), 34, 15, "O")

    _gerobak_cook(cv, X, Y, th["cook"])

    # counter + cabinet
    cv.box(X(8), Y(32), 64, 3, "l")
    cv.box(X(10), Y(34), 60, 15, "w")
    for y in (36, 47):
        cv.hline(X(11), Y(y), 58, "W")
    cv.box(X(14), Y(37), 52, 10, "c", edge="R", dark="C")
    cv.text_center(X(40), Y(39), text, "r")
    if city == "bali":                                         # kain poleng
        cv.fill_fn(X(11), Y(47), 58, 2, lambda i, j: "D" if (i // 2 + j) % 2 else "n")

    # handle + leg
    cv.rect(X(0), Y(38), 11, 2, "w")
    cv.hline(X(0), Y(38), 11, "l")
    cv.rect(X(18), Y(49), 2, 13, "W")
    cv.hline(X(16), Y(62), 6, "W")

    # spoked wheel
    cx, cy = X(56), Y(54)
    cv.ring(cx, cy, 8, "T", thick=2)
    cv.ring(cx, cy, 6, "M")
    for a in range(0, 360, 45):
        r = math.radians(a)
        cv.line(cx, cy, cx + round(5 * math.cos(r)), cy + round(5 * math.sin(r)), "N")
    cv.disc(cx, cy, 1, "D")
    for a in range(200, 260, 12):
        r = math.radians(a)
        cv.px(cx + round(7 * math.cos(r)), cy + round(7 * math.sin(r)), "t")


def gerobak_palette(city):
    return {**GEROBAK_PALETTE, **GEROBAK_THEME[city]["palette"]}


def gerobak_frames(city="jakarta"):
    frames = []
    for n in range(2):
        cv = Canvas(80, 64)
        draw_gerobak(cv, city=city)
        cv.outline("O", skip=(".", "P", "h", "x", "X", "q"))
        _shadow(cv, 38, 62, 32, 2)
        if n == 0:
            _steam(cv, [(57, 18), (55, 13), (58, 8)])
        else:
            _steam(cv, [(58, 16), (56, 10), (59, 5)])
            for dx, dy in ((-2, 0), (2, 0), (-1, 1), (1, 1), (0, 2), (-2, 1), (2, 1)):
                if cv.get(40 + dx, 13 + dy) == ".":
                    cv.px(40 + dx, 13 + dy, "h")
        frames.append(cv)
    return frames


# =============================================================== stage 2
TENDA_PALETTE = {
    **GEROBAK_PALETTE,
    "u": "#3f7fb0", "U": "#285a86", "j": "#6fa9d6",          # terpal biru
    "Y": "#ffe28a", "p": "#ff8fdc", "a": "#7cf5e8", "d": "#5a5060",  # lampu tumblr
    "E": "#b0662a", "H": "#e8dcc4",                          # es teh, spanduk shade
}


def _plate(cv, x, y, food):
    cv.ellipse(x, y + 2, 5, 1, "n")
    cv.ellipse(x, y, 3, 2, food)


TENDA_THEME = {
    "jakarta": {"roof": "terpal", "valance": "gigi", "poles": "metal",
                "palette": {"u": "#e0662a", "U": "#a8401a", "j": "#f0905a"}},
    "bandung": {"roof": "terpal", "valance": "scallop", "poles": "bambu",
                "palette": {"u": "#3f8a6a", "U": "#285e48", "j": "#6fb090"}},
    "bali": {"roof": "alang", "valance": None, "poles": "poleng",
             "palette": {"u": "#c9a86a", "U": "#9a7a44", "j": "#e0c890"}},
    "surabaya": {"roof": "belang", "valance": "scallop", "poles": "metal",
                 "palette": {"u": "#d8322a", "U": "#8a1f12", "j": "#f06a5a"}},
}


def draw_tenda(cv, bulbs_on, city="jakarta"):
    th = TENDA_THEME[city]
    # poles
    for x in (4, 154):
        if th["poles"] == "bambu":
            cv.rect(x, 26, 3, 85, "y")
            for yy in range(30, 111, 9):
                cv.hline(x, yy, 3, "K")
        elif th["poles"] == "poleng":
            cv.fill_fn(x, 26, 3, 85, lambda i, j: "D" if (i + j // 3) % 2 else "n")
        else:
            cv.rect(x, 26, 2, 85, "M")
            cv.vline(x + 1, 26, 85, "N")
    # back banner (spanduk)
    cv.box(8, 30, 144, 50, "c", dark="H")
    for x in range(12, 150, 16):
        cv.px(x, 32, "N")
    cv.text_center(80, 44, "WARUNG", "r", scale=2, shadow="R")
    cv.text_center(80, 57, CITIES[city]["signs"][2], "R")
    _plate(cv, 42, 68, "o")
    cv.px(42, 67, "e")
    cv.ellipse(58, 68, 5, 2, "y")                             # mangkuk
    cv.rect(53, 69, 11, 2, "r")
    for sx in (70, 74, 78):                                   # sate
        cv.line(sx, 74, sx + 6, 64, "W")
        for t in range(3):
            cv.rect(sx + 2 + t, 70 - t * 2, 2, 2, "o")
    # table with checkered cloth
    cv.rect(16, 88, 2, 17, "N")
    cv.rect(80, 88, 2, 17, "N")
    cloth = "D" if city == "bali" else "r"
    cv.fill_fn(12, 80, 73, 8, lambda i, j: cloth if (i // 3 + j // 3) % 2 else "n")
    cv.frame(12, 80, 73, 8, "O")
    # kaleng kerupuk
    cv.box(14, 63, 13, 17, "M", light="f", dark="N")
    cv.box(13, 61, 15, 3, "r")
    cv.box(16, 66, 9, 10, "g")
    for kx, ky in ((18, 68), (22, 69), (19, 72), (23, 73)):
        cv.disc(kx, ky, 1, "k")
    # kecap, sambal, es teh
    cv.box(31, 70, 4, 10, "D")
    cv.rect(32, 73, 2, 3, "y")
    cv.box(37, 73, 4, 7, "r")
    for gx in (46, 54, 62):
        cv.box(gx, 73, 5, 7, "E")
        cv.hline(gx + 1, 74, 3, "G")
    _plate(cv, 75, 77, "o")
    if city == "bali":                                        # canang di meja
        cv.rect(66, 77, 6, 2, "v")
        cv.px(67, 76, "r"), cv.px(69, 76, "y"), cv.px(70, 76, "n")
    # bench
    cv.rect(14, 97, 2, 14, "W")
    cv.rect(80, 97, 2, 14, "W")
    cv.box(10, 94, 76, 3, "l")
    # the stage-1 gerobak lives on inside the tent
    draw_gerobak(cv, ox=78, oy=48, roof=False, city=city)
    # roof
    if th["roof"] == "alang":                                 # bale beratap alang-alang
        cv.poly([(22, 2), (138, 2), (160, 30), (0, 30)], "u")
        for x in range(0, 160):
            for y in range(2, 31):
                if cv.get(x, y) == "u" and (x * 5 + y * 3) % 7 == 0:
                    cv.px(x, y, "U")
            cv.vline(x, 29, 2 + (x * 3) % 3, "U")
        cv.hline(22, 3, 116, "j")
        cv.rect(70, 0, 20, 3, "U")
    else:
        cv.poly([(18, 8), (142, 8), (159, 27), (0, 27)], "u")
        if th["roof"] == "belang":
            for y in range(8, 27):
                xl = 18 - (y - 8) * 18 / 19
                xr = 142 + (y - 8) * 17 / 19
                for x in range(round(xl), round(xr) + 1):
                    if int((x - xl) / (xr - xl) * 14) % 2 and cv.get(x, y) == "u":
                        cv.px(x, y, "n")
        for i in range(0, 8):
            xt, xb = 18 + i * 124 // 7, i * 159 // 7
            cv.line(xt, 8, xb, 26, "U")
        cv.hline(19, 9, 123, "j")
    if th["valance"] == "scallop":
        for x in range(0, 160):
            seg, local = x // 10, x % 10
            depth = 3 + round(2 * math.sin(math.pi * (local + 0.5) / 10))
            cv.vline(x, 26, depth, "c" if seg % 2 else "u")
    elif th["valance"] == "gigi":                             # gigi balang Betawi
        cv.hline(0, 26, 160, "v")
        for x in range(0, 160, 6):
            cv.poly([(x, 27), (x + 6, 27), (x + 3, 32)], "v" if (x // 6) % 2 else "c")
    if th["poles"] == "bambu":                                # angklung gantung
        for ax in (10, 140):
            cv.box(ax, 34, 9, 11, "K")
            for tx in (ax + 2, ax + 4, ax + 6):
                cv.vline(tx, 36, 8, "y")
    # string lights
    colours = "Ypa"
    for x in range(3, 157):
        y = 34 + round(5 * math.sin(math.pi * (x - 3) / 153))
        cv.px(x, y, "D")
        if (x - 3) % 8 == 4:
            n = (x - 3) // 8
            on = (n % 2 == 0) == bulbs_on
            cv.rect(x - 1, y + 1, 2, 2, colours[n % 3] if on else "d")


def tenda_palette(city):
    return {**TENDA_PALETTE, **GEROBAK_THEME[city]["palette"], **TENDA_THEME[city]["palette"]}


def tenda_frames(city="jakarta"):
    frames = []
    for n in range(2):
        cv = Canvas(160, 112)
        draw_tenda(cv, bulbs_on=(n == 0), city=city)
        cv.outline("O", skip=(".", "P", "h", "x", "X", "q"))
        _shadow(cv, 80, 110, 78, 2)
        if n == 0:
            _steam(cv, [(135, 64), (133, 58), (136, 52)])
        else:
            _steam(cv, [(136, 62), (134, 55), (137, 49)])
            cv.px(131, 53, "p")                               # kelip Rempi di asap
            cv.px(139, 58, "p")
            cv.px(134, 47, "Y")
        frames.append(cv)
    return frames


# =============================================================== stage 3
RUKO_PALETTE = {
    "O": OUTLINE,
    "w": "#efd59a", "W": "#c9a860", "l": "#fbe9bf",          # tembok
    "m": "#c7a34b", "n": "#8c6f2e",                          # list mustard
    "f": "#6b4a32", "F": "#4a3222",                          # kusen kayu
    "g": "#f6d88a", "G": "#fff5d6", "i": "#b8904a",          # kaca pantul senja
    "a": "#e0b04a", "c": "#fff7e0", "A": "#b88a2e",          # kanopi
    "b": "#fff7e0", "r": "#c9432a", "R": "#8a1f12",          # papan nama
    "s": "#9aa3a8", "S": "#6d777d",                          # rolling door
    "I": "#4a3428", "J": "#6b4a36", "y": "#fff2a8", "Y": "#ffe28a88",  # interior + lampu
    "k": "#a0643a", "K": "#74432a",                          # meja kayu
    "e": "#a9d8d8", "E": "#effcfc",                          # etalase
    "o": "#d98a3a", "v": "#6fa044", "u": "#fbf6ec",          # makanan
    "t": "#e07a2e", "T": "#a8521c", "h": "#f4a860",          # toren air
    "p": "#7d858a", "P": "#50585c",                          # pipa, besi
    "D": "#d9dcd6", "d": "#8a8f8a",                          # AC
    "L": "#c9b89a", "B": "#a8977a",                          # keramik teras
    "x": "#f3e9d8cc", "X": "#f3e9d866", "q": "#1b142055",
}


RUKO_THEME = {
    "jakarta": {"parapet": "gigi", "window": "nako", "awning": "stripe", "roof_clutter": True,
                "palette": {"m": "#3f8a4a", "n": "#285e32", "a": "#e0662a", "A": "#a8401a"}},
    "bandung": {"parapet": "deco", "window": "deco", "awning": "stripe", "roof_clutter": False,
                "palette": {"w": "#f3efe6", "W": "#c9c1b3", "l": "#ffffff", "m": "#3f8a6a",
                            "n": "#285e48", "a": "#3f8a6a", "A": "#285e48", "c": "#f3efe6"}},
    "bali": {"parapet": "bali", "window": "nako", "awning": "thatch", "roof_clutter": False,
             "palette": {"w": "#b5553c", "W": "#843826", "l": "#d27a5c", "m": "#a8a090",
                         "n": "#7a7466", "a": "#c9a86a", "A": "#9a7a44", "c": "#e0c890",
                         "f": "#4a3222", "F": "#2e1e14", "D": "#2b2530"}},
    "surabaya": {"parapet": "kolonial", "window": "arch", "awning": "stripe", "roof_clutter": True,
                 "palette": {"w": "#f6f2ea", "W": "#cfc6b6", "l": "#ffffff", "m": "#b5553c",
                             "n": "#843826", "a": "#d8322a", "A": "#8a1f12", "c": "#fbf6ec"}},
}


def _ruko_parapet(cv, style):
    if style == "gigi":                                          # lisplang gigi balang
        for x in range(4, 138, 5):
            cv.poly([(x, 32), (x + 5, 32), (x + 2, 37)], "m")
    elif style == "deco":                                        # art deco Braga
        cv.box(56, 10, 32, 20, "w", light="l", dark="W")
        cv.box(64, 2, 16, 10, "w", light="l", dark="W")
        for fx in (60, 66, 72, 78, 84):
            cv.vline(fx, 12, 16, "m")
        cv.rect(70, 0, 4, 3, "m")
        cv.hline(6, 34, 132, "m")
    elif style == "bali":                                        # mahkota batu paras
        for x in range(8, 136, 16):
            cv.box(x, 22, 9, 8, "m", dark="n")
            cv.box(x + 2, 16, 5, 7, "m", dark="n")
            cv.rect(x + 3, 13, 3, 3, "n")
        cv.fill_fn(8, 38, 128, 54, lambda i, j: "W" if j % 4 == 0 or (i + (j // 4) * 4) % 8 == 0 else None)
    elif style == "kolonial":                                    # fronton segitiga
        cv.poly([(40, 30), (104, 30), (72, 12)], "w")
        cv.line(40, 29, 72, 12, "m")
        cv.line(104, 29, 72, 12, "m")
        cv.disc(72, 23, 3, "m")
        cv.hline(6, 36, 132, "W")


def _ruko_window(cv, wx, style):
    if style == "deco":
        cv.box(wx, 48, 24, 20, "f", dark="F")
        cv.rect(wx + 2, 50, 20, 16, "g")
        for yy in (54, 58, 62):
            cv.hline(wx + 2, yy, 20, "f")
        cv.line(wx + 4, 65, wx + 8, 51, "G")
        cv.box(wx - 2, 68, 28, 3, "m", dark="n")
        return
    if style == "arch":
        cv.rect(wx, 50, 24, 23, "f")
        cv.ellipse(wx + 12, 50, 12, 8, "f")
        cv.rect(wx + 2, 50, 20, 21, "g")
        cv.ellipse(wx + 12, 50, 10, 6, "g")
        cv.vline(wx + 12, 44, 27, "f")
        cv.hline(wx + 2, 58, 20, "f")
        cv.line(wx + 4, 69, wx + 9, 54, "G")
        cv.box(wx - 2, 73, 28, 3, "m", dark="n")
        return
    cv.box(wx, 44, 24, 29, "f", dark="F")
    cv.rect(wx + 2, 46, 20, 25, "g")
    for yy in range(47, 53, 2):                                # jendela nako
        cv.hline(wx + 2, yy, 20, "i")
    cv.hline(wx + 2, 53, 20, "f")
    cv.vline(wx + 12, 54, 17, "f")
    cv.line(wx + 4, 69, wx + 9, 56, "G")
    cv.line(wx + 15, 69, wx + 20, 56, "G")
    cv.box(wx - 2, 73, 28, 3, "m", dark="n")


def draw_ruko(cv, lamps_on, city="jakarta"):
    th = RUKO_THEME[city]
    if th["roof_clutter"]:
        # roof clutter: water tank, antenna, kitchen exhaust
        for lx in (101, 114):
            cv.rect(lx, 22, 2, 8, "P")
        cv.hline(100, 25, 17, "P")
        cv.rect(98, 8, 21, 15, "t")
        cv.ellipse(108, 8, 10, 3, "t")
        cv.vline(101, 7, 15, "h")
        for by in (12, 18):
            cv.hline(98, by, 21, "T")
        cv.rect(106, 3, 5, 2, "T")
        cv.vline(30, 6, 24, "P")
        cv.hline(24, 9, 13, "P")
        cv.hline(26, 14, 9, "P")
    cv.box(50, 14, 7, 16, "p", dark="P")
    cv.box(48, 12, 11, 3, "P")

    # parapet + upper floor
    cv.box(6, 30, 132, 8, "w", light="l", dark="W")
    cv.box(4, 28, 136, 4, "m", dark="n")
    cv.rect(8, 38, 128, 56, "w")
    cv.rect(128, 38, 8, 56, "W")
    _ruko_parapet(cv, th["parapet"])
    if city in ("jakarta", "surabaya"):
        for cx, cy in ((24, 84), (90, 42), (131, 60)):        # retak tembok
            cv.line(cx, cy, cx + 3, cy + 4, "W")
    if city == "bandung":                                      # garis horizontal art deco
        for yy in (80, 83, 86):
            cv.hline(8, yy, 128, "W")
    for wx in (18, 60, 102):
        _ruko_window(cv, wx, th["window"])
    if city != "bali":
        cv.box(104, 78, 20, 12, "D")                          # AC outdoor
        cv.ring(117, 84, 4, "d")
        cv.vline(117, 80, 9, "d")
        cv.hline(113, 84, 9, "d")
        for gy in range(80, 88, 2):
            cv.hline(106, gy, 6, "d")
        cv.vline(124, 90, 4, "P")
    cv.box(6, 92, 132, 4, "m", dark="n")

    # signboard
    cv.box(10, 95, 124, 22, "b", light="c", dark="a")
    cv.frame(12, 96, 120, 20, "m")
    cv.text_center(72, 98, "KEDAI", "r", scale=2, shadow="R")
    cv.text_center(72, 110, CITIES[city]["signs"][3], "R")
    for bx in (26, 118):                                       # mangkuk ikon
        cv.poly([(bx - 6, 104), (bx + 7, 104), (bx + 4, 110), (bx - 3, 110)], "u")
        cv.hline(bx - 6, 104, 14, "r")
        cv.ellipse(bx, 103, 5, 1, "o")

    # ground floor
    pillar = "m" if city == "bali" else "w"
    cv.box(6, 117, 8, 52, pillar, dark="n" if city == "bali" else "W")
    cv.box(130, 117, 8, 52, pillar, dark="n" if city == "bali" else "W")
    if city == "bali":                                         # kain poleng di tiang
        for px_ in (7, 131):
            cv.fill_fn(px_, 140, 6, 12, lambda i, j: "D" if (i // 2 + j // 2) % 2 else "b")
    cv.rect(14, 117, 116, 51, "I")
    cv.rect(14, 128, 116, 16, "J")
    cv.box(56, 131, 32, 11, "F")                               # papan menu kapur
    for my in (133, 135, 137, 139):
        cv.hline(59, my, 10 + (my * 7) % 12, "b")
    for lx in (32, 72, 112):                                   # lampu gantung
        cv.vline(lx, 128, 3, "F")
        cv.poly([(lx - 3, 134), (lx + 4, 134), (lx + 2, 131), (lx - 1, 131)], "m")
        cv.rect(lx - 1, 134, 3, 1, "y")
    # etalase + counter
    cv.box(20, 150, 54, 18, "k", light="o", dark="K")
    cv.box(22, 140, 50, 11, "e")
    cv.rect(23, 141, 48, 3, "i")
    for fx, fc in ((30, "u"), (40, "o"), (50, "v"), (60, "o")):
        cv.ellipse(fx, 147, 4, 2, fc)
    cv.line(25, 149, 29, 142, "E")
    cv.line(55, 149, 59, 142, "E")
    # table + red plastic stools
    cv.box(90, 150, 32, 3, "k")
    cv.rect(93, 153, 2, 15, "K")
    cv.rect(117, 153, 2, 15, "K")
    for sx in (84, 120):
        cv.box(sx, 158, 9, 3, "r")
        cv.rect(sx + 1, 161, 2, 7, "R")
        cv.rect(sx + 6, 161, 2, 7, "R")
    # rolling door housing + awning
    cv.box(12, 117, 120, 5, "s", dark="S")
    if th["awning"] == "thatch":                               # emperan alang-alang
        cv.poly([(4, 119), (140, 119), (142, 131), (2, 131)], "a")
        for x in range(2, 142):
            cv.vline(x, 129, 2 + (x * 7) % 3, "A")
            if (x * 3) % 5 == 0:
                cv.vline(x, 121, 6, "A")
        cv.hline(4, 119, 136, "c")
    else:
        for x in range(8, 136):
            stripe = "a" if ((x - 8) // 8) % 2 == 0 else "c"
            local = (x - 8) % 8
            depth = 9 + round(2 * math.sin(math.pi * (local + 0.5) / 8))
            cv.vline(x, 121, depth, stripe)
        cv.hline(8, 121, 128, "A")
    # porch tiles
    cv.fill_fn(2, 168, 140, 8, lambda i, j: "B" if i % 12 == 0 or j == 0 else "L")
    if city == "bali":                                         # canang di teras
        cv.rect(66, 165, 8, 2, "v")
        cv.px(67, 164, "r"), cv.px(70, 164, "o"), cv.px(72, 164, "u")

    if lamps_on:
        for lx in (32, 72, 112):
            for dx in range(-3, 4):
                for dy in range(1, 4):
                    if abs(dx) <= dy + 1 and cv.get(lx + dx, 134 + dy) in "IJ":
                        cv.px(lx + dx, 134 + dy, "Y")


def ruko_palette(city):
    return {**RUKO_PALETTE, "D": "#d9dcd6", **RUKO_THEME[city]["palette"]}


def ruko_frames(city="jakarta"):
    frames = []
    for n in range(2):
        cv = Canvas(144, 176)
        draw_ruko(cv, lamps_on=(n == 0), city=city)
        cv.outline("O", skip=(".", "x", "X", "q"))
        _shadow(cv, 72, 175, 70, 1)
        _steam(cv, [(53, 8), (51, 3)] if n == 0 else [(54, 6), (52, 1)])
        frames.append(cv)
    return frames


# =============================================================== stage 4
RESTO_PALETTE = {
    "O": OUTLINE,
    "w": "#2f4a55", "W": "#1f323a", "l": "#4b7a8c",          # fasad
    "c": "#5a6a72", "C": "#3e4a52",                          # beton
    "g": "#1b2a33", "Y": "#f2c46a", "y": "#ffe6a8", "a": "#5fd3d0",  # jendela
    "n": "#7cf5e8", "N": "#2f6a70", "d": "#3a5a60", "b": "#141119",  # neon
    "I": "#f0c27a", "J": "#c98f4e", "K": "#7a4a2e", "L": "#fff2a8", "p": "#5a3a2e",
    "i": "#ffe2b0", "M": "#1f2a30",                          # interior + kusen
    "r": "#c9432a", "u": "#fbf6ec",                          # logo
    "v": "#4f8a3a", "V": "#2f5a24", "P": "#3e4a52",          # tanaman
    "s": "#6a7075", "S": "#50565a",                          # trotoar
    "x": "#f3e9d8cc", "X": "#f3e9d866", "q": "#0d0b1066",
}

_RESTO_WINDOWS = [[(r * 7 + c * 5 + (r * c) % 3) % 7 for c in range(9)] for r in range(4)]


def draw_resto(cv, frame):
    # rooftop: AC units + tank
    cv.box(20, 8, 16, 10, "c", dark="C")
    cv.box(40, 10, 12, 8, "c", dark="C")
    cv.box(132, 2, 14, 16, "c", light="l", dark="C")
    cv.vline(160, 0, 18, "M")
    cv.box(6, 16, 164, 6, "c", dark="C")
    # tower with window grid
    cv.rect(8, 22, 160, 98, "w")
    cv.rect(8, 22, 2, 98, "l")
    cv.rect(160, 22, 8, 98, "W")
    for r, wy in enumerate((26, 49, 72, 95)):
        for c in range(9):
            wx = 14 + c * 17
            v = _RESTO_WINDOWS[r][c]
            if frame == 1 and (r + c) % 5 == 2:
                v = (v + 3) % 7
            fill = "Y" if v in (0, 1, 2) else "a" if v == 3 else "g"
            cv.box(wx, wy, 12, 16, fill, edge="M")
            if fill == "Y":
                cv.hline(wx + 1, wy + 1, 10, "y")
            if fill == "g":
                cv.line(wx + 2, wy + 13, wx + 6, wy + 3, "d")
        cv.hline(8, wy + 18, 160, "C")
        cv.hline(8, wy + 19, 160, "c")
    # neon sign band
    cv.box(8, 120, 160, 21, "b")
    cv.text_center(94, 123, "RESTO", "n", scale=3)
    if frame == 1:
        cv.recolor(94 + 12 * 1 - 28, 123, 9, 15, {"n": "d"})   # huruf E kedip
    for y in range(121, 140):
        for x in range(9, 167):
            if cv.get(x, y) == "b" and any(cv.get(x + dx, y + dy) == "n"
                                           for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                cv.px(x, y, "N")
    cv.ring(32, 130, 7, "n")                                   # logo neon Monas
    cv.hline(28, 135, 9, "u")
    cv.poly([(30, 134), (35, 134), (33, 131), (32, 131)], "u")
    cv.vline(32, 125, 6, "u")
    cv.px(32, 124, "r")
    cv.ring(156, 130, 7, "n")
    cv.line(151, 125, 158, 134, "u")                           # sumpit
    cv.line(154, 124, 160, 134, "u")
    # ground floor glass front
    cv.rect(10, 141, 156, 45, "I")
    cv.rect(10, 141, 156, 8, "J")
    for lx in range(22, 160, 16):                              # lampu gantung
        cv.vline(lx, 141, 5, "M")
        cv.rect(lx - 1, 146, 3, 2, "L")
    for tx in (18, 42, 118, 142):                              # meja + pengunjung
        cv.disc(tx + 2, 166, 2, "p")
        cv.rect(tx, 169, 5, 6, "p")
        cv.disc(tx + 14, 166, 2, "p")
        cv.rect(tx + 12, 169, 5, 6, "p")
        cv.box(tx + 3, 172, 11, 3, "K")
        cv.rect(tx + 8, 175, 1, 8, "K")
    for mx in range(10, 168, 26):
        cv.rect(mx, 141, 2, 45, "M")
    for sx in range(16, 160, 26):
        cv.line(sx, 183, sx + 10, 150, "i")
    # entrance
    cv.box(76, 146, 25, 40, "i", edge="M")
    cv.vline(88, 146, 40, "M")
    cv.rect(85, 164, 2, 6, "M")
    cv.rect(90, 164, 2, 6, "M")
    cv.box(62, 139, 52, 4, "M")
    cv.hline(62, 143, 52, "n")
    # planters
    for px_ in (56, 106):
        cv.box(px_, 176, 14, 10, "P")
        cv.ellipse(px_ + 7, 171, 7, 6, "v")
        cv.ellipse(px_ + 9, 173, 4, 3, "V")
    cv.fill_fn(4, 186, 168, 6, lambda i, j: "S" if i % 16 == 0 or j == 0 else "s")


RESTO_BANDUNG_PALETTE = {
    "O": OUTLINE, "r": "#3a3036", "R": "#26202a", "h": "#5a4a52",
    "k": "#8a5a36", "K": "#5e3b22", "l": "#b07a4a",
    "I": "#f0c27a", "J": "#c98f4e", "M": "#2b2530", "i": "#ffe2b0", "p": "#5a3a2e",
    "L": "#fff2a8", "d": "#6a5a4a", "v": "#3f7a52", "V": "#285e3c", "t": "#6b4a32",
    "s": "#8a8f94", "S": "#6d777d", "x": "#f3e9d8cc", "X": "#f3e9d866", "q": "#0d0b1066",
}


def draw_resto_bandung(cv, frame):
    """Kafe A-frame kayu di antara pinus (Dago/Lembang)."""
    for px_, top in ((16, 70), (160, 64), (34, 100), (144, 96)):     # pinus
        cv.rect(px_ - 1, 150, 3, 12, "t")
        for t in range(4):
            y0 = top + t * 20
            half = 6 + t * 4
            cv.poly([(px_ - half, y0 + 26), (px_ + half + 1, y0 + 26), (px_, y0)], "v")
            cv.line(px_, y0 + 1, px_ + half, y0 + 25, "V")
    cv.poly([(8, 162), (88, 14), (168, 162)], "r")                  # atap A
    for y in range(20, 162, 4):
        for x in range(0, 176):
            if cv.get(x, y) == "r" and (x + (y // 4) * 3) % 6 == 0:
                cv.px(x, y, "R")
    cv.line(88, 14, 8, 162, "h")
    cv.line(88, 15, 9, 162, "h")
    cv.box(124, 44, 9, 26, "s", dark="S")                            # cerobong
    cv.poly([(30, 162), (88, 56), (146, 162)], "I")                  # dinding kaca
    cv.poly([(56, 110), (88, 56), (120, 110)], "J")
    for dx in (-28, -14, 0, 14, 28):
        for y in range(56, 162):
            x = 88 + dx
            if cv.get(x, y) in "IJ":
                cv.px(x, y, "M")
    for y in range(112, 115):
        for x in range(30, 147):
            if cv.get(x, y) in "IJM":
                cv.px(x, y, "k")
    for lx in (72, 88, 104):                                         # lampu gantung
        cv.vline(lx, 90, 6, "M")
        cv.rect(lx - 1, 96, 3, 2, "L")
    for tx in (62, 98, 50, 112):                                     # pengunjung
        ty = 106 if tx in (62, 98) else 150
        cv.disc(tx, ty - 6, 2, "p")
        cv.rect(tx - 2, ty - 3, 5, 6, "p")
    for sx in (44, 70, 110):
        cv.line(sx, 158, sx + 10, 120, "i")
    cv.box(80, 140, 17, 22, "k", dark="K")                           # pintu
    cv.px(93, 151, "L")
    cv.box(0, 160, 176, 6, "l", dark="k")                            # dek kayu
    for x in range(4, 176, 12):
        cv.rect(x, 166, 2, 10, "K")
    cv.hline(0, 168, 176, "K")
    cv.fill_fn(0, 176, 176, 16, lambda i, j: "S" if (i + (j // 4) * 6) % 12 == 0 or j % 4 == 0 else "s")
    cv.box(72, 162, 33, 30, "l", dark="k")                           # tangga
    for y in range(166, 192, 4):
        cv.hline(73, y, 31, "K")
    cv.box(14, 166, 48, 16, "K")                                     # papan lampu
    cv.text_center(38, 171, "RESTO", "L")
    if frame == 1:
        for y in range(170, 177):
            for x in range(16, 60):
                if cv.get(x, y) == "L" and (x + y) % 2:
                    cv.px(x, y, "d")


RESTO_BALI_PALETTE = {
    "O": OUTLINE, "a": "#c9a86a", "A": "#9a7a44", "c": "#e0c890",
    "k": "#8a5a36", "K": "#5e3b22", "l": "#b07a4a",
    "I": "#f0c27a", "J": "#c98f4e", "p": "#5a3a2e", "L": "#fff2a8",
    "P": "#ff8fdc", "C": "#7cf5e8", "N": "#5a4a6a", "D": "#2b2530", "n": "#fbf6ec",
    "w": "#3fb0c8", "W": "#7fd8e8", "s": "#a8a090", "S": "#7a7466",
    "f": "#f2a93b", "F": "#fff2a8", "u": "#e8d8b0", "U": "#c9b890",
    "g": "#4f8a3a", "y": "#f2c94c", "q": "#0d0b1066",
}


def draw_resto_bali(cv, frame):
    """Beach club beratap alang-alang dengan kolam."""
    cv.rect(0, 150, 176, 42, "u")                                    # pasir
    cv.box(8, 96, 160, 64, "s", dark="S")                            # dinding batu paras
    for x in range(14, 164, 20):
        cv.box(x, 102, 14, 20, "S")
        cv.frame(x + 2, 104, 10, 16, "s")
    cv.rect(16, 126, 144, 24, "I")
    cv.rect(16, 126, 144, 6, "J")
    for bx in range(24, 150, 8):                                     # botol di rak
        cv.rect(bx, 128, 2, 4, "gPyC"[(bx // 8) % 4])
    for tx in (30, 60, 116, 146):
        cv.disc(tx, 136, 2, "p")
        cv.rect(tx - 2, 139, 5, 6, "p")
    cv.box(34, 140, 108, 14, "k", light="l", dark="K")               # meja bar
    for px_ in (12, 56, 118, 162):                                   # tiang + poleng
        cv.rect(px_, 96, 4, 64, "k")
        cv.fill_fn(px_, 118, 4, 12, lambda i, j: "D" if (i // 2 + j // 2) % 2 else "n")
    cv.poly([(0, 100), (32, 30), (144, 30), (176, 100)], "a")        # atap alang-alang
    cv.poly([(46, 32), (66, 8), (110, 8), (130, 32)], "a")
    for x in range(0, 176):
        for y in range(8, 101):
            if cv.get(x, y) == "a" and (x * 5 + y * 3) % 9 == 0:
                cv.px(x, y, "A")
        yb = None
        for y in range(100, 26, -1):
            if cv.get(x, y) == "a":
                yb = y
                break
        if yb:
            cv.vline(x, yb, 2 + (x * 3) % 3, "A")
    cv.hline(46, 32, 84, "c")
    cv.rect(84, 2, 8, 7, "A")
    for lx in range(24, 160, 18):                                    # lampion
        cv.vline(lx, 100, 4, "K")
        cv.rect(lx - 1, 104, 3, 3, "L")
    cv.box(56, 100, 64, 14, "D")                                     # papan neon
    cv.text_center(88, 104, "RESTO", "P" if frame == 0 else "N")
    cv.px(60, 106, "C"), cv.px(116, 106, "C")
    cv.box(0, 158, 176, 6, "l", dark="k")                            # dek
    cv.box(18, 168, 140, 16, "w")                                    # kolam
    cv.frame(18, 168, 140, 16, "s")
    for y in (172, 177, 181):
        for x in range(22 + (y % 5) + frame * 3, 154, 12):
            cv.hline(x, y, 4, "W")
    for tx in (4, 168):                                              # obor tiki
        cv.rect(tx, 140, 3, 50, "K")
        cv.rect(tx - 1, 136, 5, 4, "k")
        fh = 5 if frame == 0 else 7
        cv.poly([(tx - 1, 136), (tx + 4, 136), (tx + 1 + frame, 136 - fh)], "f")
        cv.px(tx + 1, 134, "F")


RESTO_SBY_PALETTE = {
    "O": OUTLINE, "r": "#c9432a", "R": "#8a1f12", "b": "#2e6aa8", "B": "#1c4a7a",
    "o": "#e0862a", "Q": "#a85a1a", "t": "#2a8a8a", "T": "#1a5e5e",
    "M": "#2b2530", "m": "#6d777d", "I": "#f0c27a", "J": "#c98f4e", "p": "#5a3a2e",
    "i": "#ffe2b0", "n": "#7cf5e8", "N": "#2f6a70", "d": "#3a5a60", "D": "#141119",
    "L": "#fff2a8", "w": "#fbf6ec", "s": "#6a7075", "S": "#50565a", "q": "#0d0b1066",
}


def _container(cv, x, y, w, h, c, dark, window=True, door=False):
    cv.rect(x, y, w, h, c)
    for rx in range(x + 2, x + w - 1, 3):
        cv.vline(rx, y + 2, h - 4, dark)
    cv.frame(x, y, w, h, "M")
    cv.hline(x, y + 1, w, "m")
    if window:
        cv.rect(x + 6, y + 6, w - 12, h - 12, "I")
        cv.rect(x + 6, y + 6, w - 12, 3, "J")
        for mx in range(x + 6, x + w - 6, 14):
            cv.vline(mx, y + 6, h - 12, "M")
        cv.frame(x + 6, y + 6, w - 12, h - 12, "M")
        cv.line(x + 10, y + h - 8, x + 16, y + 9, "i")
    if door:
        cv.box(x + w // 2 - 7, y + 8, 14, h - 8, "i", edge="M")


def draw_resto_surabaya(cv, frame):
    """Resto peti kemas bertumpuk ala pelabuhan Tanjung Perak."""
    cv.box(40, 36, 108, 26, "D")                                     # papan neon atas
    for px_ in (56, 132):
        cv.rect(px_, 62, 3, 16, "M")
    cv.text_center(94, 42, "RESTO", "n", scale=3)
    if frame == 1:
        cv.recolor(58, 42, 16, 15, {"n": "d"})
    for y in range(37, 61):
        for x in range(41, 147):
            if cv.get(x, y) == "D" and any(cv.get(x + dx, y + dy) == "n"
                                           for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                cv.px(x, y, "N")
    _container(cv, 50, 78, 88, 34, "o", "Q")
    _container(cv, 16, 114, 104, 36, "b", "B")
    cv.box(120, 142, 54, 4, "m")                                     # teras
    for x in range(122, 174, 6):
        cv.vline(x, 132, 10, "m")
    cv.hline(120, 132, 54, "m")
    for i, x in enumerate(range(122, 172, 8)):                       # bendera merah putih
        cv.rect(x, 126, 4, 3, "r")
        cv.rect(x, 129, 4, 2, "w")
    for x in range(122, 174):                                        # lampu gantung teras
        y = 120 + round(3 * math.sin((x - 122) / 8))
        if x % 5 == 0:
            cv.px(x, y, "L" if (x // 5 + frame) % 2 else "m")
    _container(cv, 2, 150, 84, 36, "r", "R")
    _container(cv, 90, 150, 84, 36, "t", "T", window=False, door=True)
    cv.rect(94, 156, 20, 16, "I")
    cv.rect(142, 156, 26, 16, "I")
    for i in range(0, 72, 6):                                        # tangga besi zigzag
        cv.line(8 + (i % 12 == 0) * 0, 150 - i // 2, 14, 146 - i // 2, "m")
    cv.line(4, 186, 16, 114, "m")
    cv.line(8, 186, 20, 114, "m")
    cv.fill_fn(0, 186, 176, 6, lambda i, j: "S" if i % 16 == 0 or j == 0 else "s")


def resto_palette(city):
    return {"jakarta": RESTO_PALETTE, "bandung": RESTO_BANDUNG_PALETTE,
            "bali": RESTO_BALI_PALETTE, "surabaya": RESTO_SBY_PALETTE}[city]


def resto_frames(city="jakarta"):
    draw = {"jakarta": draw_resto, "bandung": draw_resto_bandung, "bali": draw_resto_bali,
            "surabaya": draw_resto_surabaya}[city]
    frames = []
    for n in range(2):
        cv = Canvas(176, 192)
        draw(cv, n)
        cv.outline("O", skip=(".", "x", "X", "q"))
        _shadow(cv, 88, 191, 86, 1)
        if city == "bandung":
            _steam(cv, [(128, 38), (126, 32)] if n == 0 else [(129, 36), (127, 29)])
        frames.append(cv)
    return frames


# =============================================================== stage 5
ISTANA_PALETTE = {
    "O": OUTLINE,
    "r": "#5a4a6e", "R": "#3a2d4a", "l": "#7a6a92",          # batu pulau
    "e": "#4fae8a", "E": "#2f7a5e",                          # rumput fantasi
    "f": "#ff8fdc", "F": "#f2c94c",                          # bunga
    "c": "#ff8fdc", "C": "#fff2a8",                          # kristal
    "v": "#3a6a4a",                                          # akar gantung
    "p": "#6b3fa0", "P": "#3e2263", "L": "#8e62c4",          # dinding
    "g": "#f2c94c", "G": "#b8892a", "h": "#fff2a8",          # emas
    "y": "#ffd8a8", "Y": "#ff8fdc",                          # cahaya pintu
    "s": "#d8c8e8", "S": "#a898c0",                          # tangga batu
    "u": "#c9432a", "U": "#f3e9d8", "k": "#e0b04a",          # umbul-umbul
    "a": "#ff8fdc", "A": "#fff2a8", "z": "#fff4c2", "Z": "#f2c94c",  # api + kilau
    "n": "#ffb86a", "N": "#c9432a",                          # lentera
    "q": "#1b142044",
}


def _tier(cv, cx, y_top, y_bot, w_top, w_bot):
    cv.poly([(cx - w_bot // 2, y_bot), (cx + w_bot // 2, y_bot),
             (cx + w_top // 2, y_top), (cx - w_top // 2, y_top)], "g")
    cv.hline(cx - w_bot // 2, y_bot - 1, w_bot, "G")
    cv.line(cx - w_top // 2, y_top, cx - w_bot // 2, y_bot - 1, "h")
    for i in range(1, 6):
        x = cx - w_bot // 2 + i * w_bot // 6
        xt = cx - w_top // 2 + i * w_top // 6
        cv.line(xt, y_top + 1, x, y_bot - 2, "G")


def _hall(cv, x, y, w, h, door=True):
    cv.box(x, y, w, h, "p", light="L", dark="P")
    for px_ in range(x + 4, x + w - 6, 16):
        cv.rect(px_, y + 1, 2, h - 1, "g")
    cv.rect(x + w - 6, y + 1, 2, h - 1, "g")
    cv.hline(x + 1, y + 3, w - 2, "G")
    if door:
        cx = x + w // 2
        dw = max(8, w // 4)
        cv.rect(cx - dw // 2, y + h - 22, dw, 22, "y")
        cv.ellipse(cx, y + h - 22, dw // 2, 4, "y")
        cv.rect(cx - dw // 2 + 2, y + h - 16, dw - 4, 16, "Y")


def _pavilion(cv, cx):
    _hall(cv, cx - 18, 132, 36, 26, door=False)
    cv.rect(cx - 3, 144, 6, 14, "y")
    cv.ellipse(cx, 144, 3, 2, "y")
    _tier(cv, cx, 118, 133, 30, 50)
    cv.rect(cx - 10, 112, 20, 6, "P")
    _tier(cv, cx, 102, 113, 14, 32)
    cv.rect(cx - 1, 94, 3, 8, "g")
    cv.disc(cx, 93, 2, "h")


def _penjor(cv, x, flip):
    d = -1 if flip else 1
    for y in range(70, 170):
        cv.px(x, y, "k")
    for i in range(18):                                        # ujung melengkung
        cv.px(x + d * (i // 2), 70 - round(8 * math.sin(i / 11)), "k")
    for j, col in enumerate("uUk" * 7):
        cv.rect(x + d * 1 if not flip else x - 3, 80 + j * 3, 3, 3, col)
    cv.disc(x + d * 9, 66, 2, "g")


def _island(cv):
    cv.poly([(10, 172), (198, 172), (176, 190), (150, 204), (122, 216), (100, 222),
             (78, 214), (52, 200), (30, 186)], "r")
    cv.poly([(40, 196), (170, 192), (150, 204), (122, 216), (100, 222), (78, 214)], "R")
    cv.hline(12, 173, 184, "l")
    for (x0, x1, y1) in ((30, 52, 200), (70, 84, 214), (120, 110, 218), (150, 132, 206),
                         (182, 160, 190), (96, 100, 222)):
        cv.line(x0, 174, x1, y1, "R")
        cv.line(x0 + 1, 175, x1 + 1, y1 - 2, "l")
    for (cx, cy) in ((60, 190), (132, 200), (104, 212), (160, 186)):
        cv.poly([(cx - 2, cy + 3), (cx + 2, cy + 3), (cx, cy - 4)], "c")
        cv.px(cx, cy - 2, "C")
    for vx, vl in ((34, 14), (58, 22), (90, 26), (142, 20), (170, 12)):
        for i in range(vl):
            cv.px(vx + round(math.sin(i / 3)), 186 + (vx % 7) + i, "v")
    cv.ellipse(104, 170, 94, 5, "e")
    cv.hline(12, 172, 184, "E")
    for fx in range(18, 192, 11):
        cv.px(fx, 167 + (fx % 3), "f" if fx % 2 else "F")
    cv.box(36, 162, 136, 7, "s", dark="S")
    cv.box(46, 156, 116, 7, "s", dark="S")
    cv.hline(46, 158, 116, "g")


def _palace_bali(cv):
    _pavilion(cv, 42)
    _pavilion(cv, 166)
    _penjor(cv, 6, flip=False)
    _penjor(cv, 201, flip=True)
    _hall(cv, 70, 112, 68, 45)
    _tier(cv, 104, 96, 113, 66, 96)
    cv.rect(82, 90, 44, 6, "P")
    _tier(cv, 104, 76, 91, 46, 72)
    cv.rect(90, 70, 28, 6, "P")
    _tier(cv, 104, 56, 71, 26, 48)
    cv.poly([(100, 56), (108, 56), (104, 44)], "g")            # mustaka
    cv.disc(104, 44, 3, "h")
    for lx, ly in ((64, 120), (144, 120)):
        cv.vline(lx, ly - 6, 6, "G")
        cv.box(lx - 2, ly, 5, 6, "n", dark="N")


def _gigi(cv, x0, x1, y, key="e"):
    for gx in range(x0, x1, 4):
        cv.poly([(gx, y), (gx + 4, y), (gx + 2, y + 3)], key)


def _betawi_house(cv, cx, y, w, h):
    _hall(cv, cx - w // 2, y, w, h, door=False)
    cv.rect(cx - 4, y + h - 16, 8, 16, "y")
    cv.poly([(cx - w // 2 - 6, y), (cx + w // 2 + 6, y), (cx + w // 2 - 4, y - 16),
             (cx - w // 2 + 4, y - 16)], "o")
    for yy in range(y - 14, y, 3):
        cv.hline(cx - w // 2, yy, w, "Q")
    _gigi(cv, cx - w // 2 - 6, cx + w // 2 + 6, y, "e")


def _palace_jakarta(cv):
    """Istana Betawi dengan menara emas ala Monas; api legenda di puncaknya."""
    _betawi_house(cv, 38, 130, 44, 28)
    _betawi_house(cv, 170, 130, 44, 28)
    _hall(cv, 64, 112, 80, 45)
    cv.poly([(56, 112), (152, 112), (140, 94), (68, 94)], "o")
    for yy in range(96, 112, 3):
        cv.hline(64, yy, 80, "Q")
    _gigi(cv, 56, 152, 112, "e")
    cv.poly([(84, 94), (124, 94), (116, 86), (92, 86)], "g")        # cawan Monas
    cv.hline(84, 94, 40, "G")
    for y in range(28, 86):                                           # obelisk
        t = (y - 28) / 58
        half = round(2 + t * 5)
        cv.hline(104 - half, y, 2 * half + 1, "U")
        cv.px(104 - half, y, "h")
        cv.px(104 + half, y, "S")
    cv.rect(99, 24, 11, 4, "g")
    for lx, ly in ((64, 120), (144, 120)):
        cv.vline(lx, ly - 6, 6, "G")
        cv.box(lx - 2, ly, 5, 6, "n", dark="N")


def _palace_bandung(cv):
    """Gedung Sate melayang: aula putih panjang + menara tusuk sate emas."""
    for tx in (18, 190):                                              # pinus
        for t in range(3):
            cv.poly([(tx - 5 - t * 3, 120 + t * 14), (tx + 6 + t * 3, 120 + t * 14), (tx, 104 + t * 14)], "E")
    cv.box(22, 118, 164, 40, "p", light="L", dark="P")
    for wx in range(28, 180, 10):                                     # jendela lengkung
        if 92 <= wx <= 116:
            continue
        cv.rect(wx, 128, 5, 12, "y")
        cv.ellipse(wx + 2, 128, 2, 2, "y")
    cv.poly([(14, 120), (80, 120), (74, 104), (24, 106)], "o")        # atap julang ngapak
    cv.poly([(128, 120), (194, 120), (184, 106), (134, 104)], "o")
    cv.hline(14, 120, 66, "G"), cv.hline(128, 120, 66, "G")
    cv.box(82, 76, 44, 82, "p", light="L", dark="P")                  # menara tengah
    cv.rect(96, 132, 16, 26, "y")
    cv.ellipse(104, 132, 8, 5, "y")
    cv.rect(99, 138, 10, 20, "Y")
    for wx in (88, 114):
        cv.rect(wx, 88, 5, 10, "y")
    cv.poly([(76, 78), (132, 78), (122, 64), (86, 64)], "o")
    cv.box(92, 50, 24, 14, "p", light="L", dark="P")
    cv.poly([(88, 52), (120, 52), (112, 42), (96, 42)], "o")
    cv.rect(103, 14, 3, 28, "g")                                      # tusuk sate
    for i in range(6):
        cv.disc(104, 18 + i * 4, 1, "h")


def _palace_surabaya(cv):
    """Istana kolonial putih + Tugu Pahlawan emas + patung Suro & Boyo."""
    cv.box(24, 116, 160, 42, "p", light="L", dark="P")
    for ax in range(32, 180, 16):                                     # lengkungan
        if 88 <= ax <= 120:
            continue
        cv.rect(ax, 130, 10, 18, "y")
        cv.ellipse(ax + 5, 130, 5, 4, "y")
    cv.poly([(18, 118), (190, 118), (176, 104), (32, 104)], "u")      # atap genteng
    for yy in range(106, 118, 3):
        cv.hline(28, yy, 152, "N")
    cv.poly([(72, 106), (136, 106), (104, 86)], "p")                  # fronton
    cv.line(72, 105, 104, 86, "u"), cv.line(136, 105, 104, 86, "u")
    cv.rect(94, 124, 20, 34, "y")
    cv.ellipse(104, 124, 10, 6, "y")
    cv.rect(98, 132, 12, 26, "Y")
    cv.rect(98, 84, 13, 4, "G")                                        # Tugu Pahlawan
    for y in range(24, 84):
        t = (y - 24) / 60
        half = round(1 + t * 4)
        cv.hline(104 - half, y, 2 * half + 1, "g")
        if y % 4 == 0:
            cv.px(104, y, "G")
    cv.poly([(97, 88), (112, 88), (108, 84), (101, 84)], "g")
    # Suro (hiu) & Boyo (buaya) di alas
    cv.box(8, 148, 30, 10, "s", dark="S")
    cv.poly([(10, 146), (22, 128), (26, 132), (18, 146)], "M")        # hiu melengkung
    cv.poly([(19, 131), (23, 124), (24, 131)], "M")
    cv.poly([(22, 146), (36, 140), (38, 146)], "e")                   # buaya
    for bx in (26, 30, 34):
        cv.px(bx, 141, "E")
    # mercusuar
    for y in range(96, 158):
        cv.hline(186, y, 8, "u" if (y // 8) % 2 else "U")
    cv.rect(185, 88, 10, 8, "N")
    cv.rect(187, 90, 6, 4, "y")
    for fx in (60, 148):                                              # bendera
        cv.vline(fx, 70, 46, "G")
        cv.rect(fx + 1, 70, 10, 4, "u")
        cv.rect(fx + 1, 74, 10, 4, "U")


PALACE = {"jakarta": (_palace_jakarta, 20), "bandung": (_palace_bandung, 10),
          "bali": (_palace_bali, 34), "surabaya": (_palace_surabaya, 20)}

ISTANA_CITY_PALETTE = {
    "jakarta": {"p": "#efe4c8", "P": "#c9bb98", "L": "#fff8e0", "o": "#e0662a", "Q": "#a8401a",
                "U": "#f6f2ea", "S": "#c9c1b3"},
    "bandung": {"p": "#f3efe6", "P": "#c9c1b3", "L": "#ffffff", "o": "#4a3e52", "Q": "#2e2638"},
    "bali": {},
    "surabaya": {"p": "#f6f2ea", "P": "#cfc6b6", "L": "#ffffff", "N": "#8a1f12", "M": "#6d8aa8"},
}


def istana_palette(city):
    return {**ISTANA_PALETTE, "o": "#e0662a", "Q": "#a8401a", "M": "#6d8aa8",
            **ISTANA_CITY_PALETTE[city]}


def istana_frames(city="bali"):
    palace, flame_base = PALACE[city]
    frames = []
    for n in range(2):
        cv = Canvas(208, 224)
        _island(cv)
        palace(cv)
        cv.outline("O", skip=(".", "q", "z", "Z", "a", "A"))
        # Bara Api Legenda at the top of each palace
        lean = 0 if n == 0 else 2
        for col, w, h, dy in (("a", 6, 22, 0), ("A", 4, 14, 1), ("z", 2, 7, 2)):
            base = flame_base - dy
            cv.ellipse(104, base, w, w, col)
            cv.poly([(104 - w, base), (105 + w, base), (104 + lean, base - h)], col)
        off = flame_base - 34
        embers = [(95, 22), (113, 26), (99, 12), (110, 16)] if n == 0 else \
            [(96, 18), (112, 22), (102, 8), (109, 11)]
        for fx, fy in embers:
            cv.px(fx, fy + off, "a")
        for (sx, sy) in ([(20, 40), (186, 60), (60, 24), (150, 30)] if n == 0
                         else [(24, 48), (182, 52), (66, 30), (144, 22)]):
            cv.px(sx, sy, "z")
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                cv.px(sx + dx, sy + dy, "Z")
        if n == 1:
            cv = cv.shifted(-1)
        frames.append(cv)
    return frames


# ================================================================= build
STAGES = {
    1: {"slug": "gerobak", "frames": gerobak_frames, "palette": gerobak_palette,
        "vendor_spot": [86, 63]},
    2: {"slug": "warung_tenda", "frames": tenda_frames, "palette": tenda_palette,
        "vendor_spot": [70, 111]},
    3: {"slug": "ruko", "frames": ruko_frames, "palette": ruko_palette,
        "vendor_spot": [104, 175]},
    4: {"slug": "resto_modern", "frames": resto_frames, "palette": resto_palette,
        "vendor_spot": [130, 191]},
    5: {"slug": "istana_rasa", "frames": istana_frames, "palette": istana_palette,
        "vendor_spot": [128, 162]},
}


# Night lights: which pixels glow. Each rule = (keys, rect or None); "*" = any non-outline pixel.
LIGHTS = {
    1: {"*": [("bh", None), ("*", (14, 18, 34, 15)), ("e", (48, 15, 24, 18))]},
    2: {"*": [("*", (8, 30, 144, 50)), ("Ypa", (0, 30, 160, 12)), ("*", (92, 66, 34, 15))]},
    3: {"*": [("gGi", (16, 42, 112, 34)), ("*", (14, 128, 116, 40)), ("*", (10, 95, 124, 22))]},
    4: {"jakarta": [("Yya", (8, 22, 160, 98)), ("nNur", (8, 120, 160, 21)), ("*", (10, 141, 156, 45))],
        "bandung": [("IJiLp", (30, 56, 116, 106)), ("L", (14, 166, 48, 16)), ("*", (80, 140, 17, 22))],
        "bali": [("*", (16, 126, 144, 24)), ("LPCfFwW", None)],
        "surabaya": [("IJinNL", None)]},
}


def _lit(rules, grid):
    h, w = len(grid), len(grid[0])
    out = [["."] * w for _ in range(h)]
    for keys, rect in rules:
        x0, y0, rw, rh = rect if rect else (0, 0, w, h)
        for y in range(max(0, y0), min(h, y0 + rh)):
            for x in range(max(0, x0), min(w, x0 + rw)):
                k = grid[y][x]
                if k in (".", "O", "q"):
                    continue
                if keys == "*" or k in keys:
                    out[y][x] = k
    return out


def light_frames(city, stage):
    """Only the glowing pixels of each frame (drawn untinted over the darkened building)."""
    spec = LIGHTS.get(stage)
    if not spec:
        return []
    rules = spec.get(city, spec.get("*"))
    st = STAGES[stage]
    pal = st["palette"](city)
    return [render(_lit(rules, cv.g), pal) for cv in st["frames"](city)]


def render_frames(city, stage):
    st = STAGES[stage]
    pal = st["palette"](city)
    return [render(cv.g, pal) for cv in st["frames"](city)]


def generate():
    meta = {}
    for city in CITY_ORDER:
        meta[city] = {}
        for stage, st in STAGES.items():
            imgs = render_frames(city, stage)
            frames = [(f"frame{i + 1}", im) for i, im in enumerate(imgs)]
            folder = f"{city}/stage{stage}_{st['slug']}"
            save_set(OUT / folder, frames, durations=[500, 500], gif_scale=4)
            for i, im in enumerate(light_frames(city, stage)):
                im.save(OUT / folder / f"frame{i + 1}_lampu.png")
            meta[city][f"stage{stage}"] = {
                "folder": folder,
                "size": list(imgs[0].size),
                "ground_y": imgs[0].height - 1,
                "vendor_spot": st["vendor_spot"],
                "frame_ms": 500,
            }
    (OUT / "buildings.json").write_text(json.dumps(meta, indent=2) + "\n")
