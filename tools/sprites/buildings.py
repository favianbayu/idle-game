"""Stage buildings: gerobak -> warung tenda -> ruko -> resto modern -> istana rasa.

Same pixel scale as the characters (32x40), so the main character can stand
in front of any of them. Each building has 2 animation frames (steam, lights,
neon flicker, floating) and a meta entry with ground line + vendor spot.
"""

import json
import math

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


def draw_gerobak(cv, ox=0, oy=0, roof=True, text="NASI GORENG"):
    """Classic Indonesian push cart. Canvas-space origin (ox, oy); 80x64 footprint."""
    X = lambda x: ox + x  # noqa: E731
    Y = lambda y: oy + y  # noqa: E731

    if roof:
        # poles
        cv.vline(X(12), Y(8), 26, "N")
        cv.vline(X(67), Y(8), 26, "N")
        # corrugated zinc roof
        cv.poly([(X(3), Y(6)), (X(77), Y(2)), (X(77), Y(7)), (X(3), Y(11))], "z")
        for x in range(3, 77):
            if x % 3 == 0:
                for y in range(0, 12):
                    if cv.get(X(x), Y(y)) == "z":
                        cv.px(X(x), Y(y), "Z")
        cv.line(X(3), Y(6), X(76), Y(2), "s")
        cv.line(X(3), Y(10), X(76), Y(6), "Z")
        # hanging bulb
        cv.vline(X(40), Y(8), 5, "D")
        cv.rect(X(39), Y(12), 3, 1, "D")
        cv.rect(X(39), Y(13), 3, 2, "b")
        # kerupuk bags on the left pole
        cv.vline(X(8), Y(10), 2, "D")
        cv.box(X(6), Y(12), 5, 7, "P")
        cv.box(X(6), Y(19), 5, 7, "P")
        for bx, by in ((7, 14), (9, 15), (8, 17), (7, 21), (9, 22), (8, 24)):
            cv.px(X(bx), Y(by), "k")

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

    # stove + wok with nasi goreng
    cv.box(X(52), Y(28), 14, 5, "D")
    cv.px(X(56), Y(27), "e")
    cv.px(X(61), Y(27), "e")
    cv.poly([(X(49), Y(23)), (X(68), Y(23)), (X(64), Y(28)), (X(53), Y(28))], "N")
    cv.hline(X(49), Y(23), 19, "M")
    cv.ellipse(X(58), Y(22), 6, 1, "o")
    cv.px(X(56), Y(21), "e")
    cv.px(X(60), Y(22), "v")
    cv.hline(X(68), Y(23), 5, "W")

    # counter + cabinet
    cv.box(X(8), Y(32), 64, 3, "l")
    cv.box(X(10), Y(34), 60, 15, "w")
    for y in (36, 47):
        cv.hline(X(11), Y(y), 58, "W")
    cv.box(X(14), Y(37), 52, 10, "c", edge="R", dark="C")
    cv.text_center(X(40), Y(39), text, "r")

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


def gerobak_frames():
    frames = []
    for n in range(2):
        cv = Canvas(80, 64)
        draw_gerobak(cv)
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


def draw_tenda(cv, bulbs_on):
    # poles
    for x in (4, 154):
        cv.rect(x, 26, 2, 85, "M")
        cv.vline(x + 1, 26, 85, "N")
    # back banner (spanduk)
    cv.box(8, 30, 144, 50, "c", dark="H")
    for x in range(12, 150, 16):
        cv.px(x, 32, "N")
    cv.text_center(80, 44, "WARUNG", "r", scale=2, shadow="R")
    cv.text_center(80, 57, "NASI GORENG * MIE * SATE", "R")
    _plate(cv, 42, 68, "o")
    cv.px(42, 67, "e")
    cv.ellipse(58, 68, 5, 2, "y")                             # mangkuk mie
    cv.rect(53, 69, 11, 2, "r")
    for sx in (70, 74, 78):                                   # sate
        cv.line(sx, 74, sx + 6, 64, "W")
        for t in range(3):
            cv.rect(sx + 2 + t, 70 - t * 2, 2, 2, "o")
    # table with checkered cloth
    cv.rect(16, 88, 2, 17, "N")
    cv.rect(80, 88, 2, 17, "N")
    cv.fill_fn(12, 80, 73, 8, lambda i, j: "r" if (i // 3 + j // 3) % 2 else "n")
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
    # bench
    cv.rect(14, 97, 2, 14, "W")
    cv.rect(80, 97, 2, 14, "W")
    cv.box(10, 94, 76, 3, "l")
    # the stage-1 gerobak lives on inside the tent
    draw_gerobak(cv, ox=78, oy=48, roof=False)
    # roof
    cv.poly([(18, 8), (142, 8), (159, 27), (0, 27)], "u")
    for i in range(0, 8):
        xt, xb = 18 + i * 124 // 7, i * 159 // 7
        cv.line(xt, 8, xb, 26, "U")
    cv.hline(19, 9, 123, "j")
    # scalloped valance
    for x in range(0, 160):
        seg, local = x // 10, x % 10
        depth = 3 + round(2 * math.sin(math.pi * (local + 0.5) / 10))
        cv.vline(x, 26, depth, "c" if seg % 2 else "u")
    # string lights
    colours = "Ypa"
    for x in range(3, 157):
        y = 34 + round(5 * math.sin(math.pi * (x - 3) / 153))
        cv.px(x, y, "D")
        if (x - 3) % 8 == 4:
            n = (x - 3) // 8
            on = (n % 2 == 0) == bulbs_on
            cv.rect(x - 1, y + 1, 2, 2, colours[n % 3] if on else "d")


def tenda_frames():
    frames = []
    for n in range(2):
        cv = Canvas(160, 112)
        draw_tenda(cv, bulbs_on=(n == 0))
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


def draw_ruko(cv, lamps_on):
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
    for cx, cy in ((24, 84), (90, 42), (131, 60)):            # retak tembok
        cv.line(cx, cy, cx + 3, cy + 4, "W")
    for wx in (18, 60, 102):
        cv.box(wx, 44, 24, 29, "f", dark="F")
        cv.rect(wx + 2, 46, 20, 25, "g")
        for yy in range(47, 53, 2):                            # jendela nako
            cv.hline(wx + 2, yy, 20, "i")
        cv.hline(wx + 2, 53, 20, "f")
        cv.vline(wx + 12, 54, 17, "f")
        cv.line(wx + 4, 69, wx + 9, 56, "G")
        cv.line(wx + 15, 69, wx + 20, 56, "G")
        cv.box(wx - 2, 73, 28, 3, "m", dark="n")
    cv.box(104, 78, 20, 12, "D")                              # AC outdoor
    cv.ring(117, 84, 4, "d")
    cv.vline(117, 80, 9, "d")
    cv.hline(113, 84, 9, "d")
    for gy in range(80, 88, 2):
        cv.hline(106, gy, 6, "d")
    cv.vline(124, 90, 4, "P")
    cv.box(6, 92, 132, 4, "m", dark="n")

    # signboard
    cv.box(10, 96, 124, 21, "b", light="c", dark="a")
    cv.frame(12, 98, 120, 17, "m")
    cv.text_center(72, 99, "KEDAI", "r", scale=3, shadow="R")
    for bx in (26, 118):                                       # mangkuk ikon
        cv.poly([(bx - 6, 104), (bx + 7, 104), (bx + 4, 110), (bx - 3, 110)], "u")
        cv.hline(bx - 6, 104, 14, "r")
        cv.ellipse(bx, 103, 5, 1, "o")

    # ground floor
    cv.box(6, 117, 8, 52, "w", dark="W")
    cv.box(130, 117, 8, 52, "w", dark="W")
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
    for x in range(8, 136):
        stripe = "a" if ((x - 8) // 8) % 2 == 0 else "c"
        local = (x - 8) % 8
        depth = 9 + round(2 * math.sin(math.pi * (local + 0.5) / 8))
        cv.vline(x, 121, depth, stripe)
    cv.hline(8, 121, 128, "A")
    # porch tiles
    cv.fill_fn(2, 168, 140, 8, lambda i, j: "B" if i % 12 == 0 or j == 0 else "L")

    if lamps_on:
        for lx in (32, 72, 112):
            for dx in range(-3, 4):
                for dy in range(1, 4):
                    if abs(dx) <= dy + 1 and cv.get(lx + dx, 134 + dy) in "IJ":
                        cv.px(lx + dx, 134 + dy, "Y")


def ruko_frames():
    frames = []
    for n in range(2):
        cv = Canvas(144, 176)
        draw_ruko(cv, lamps_on=(n == 0))
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
    cv.ring(32, 130, 7, "n")                                   # logo mangkuk
    cv.poly([(26, 129), (39, 129), (36, 134), (29, 134)], "u")
    cv.hline(26, 129, 14, "r")
    for sx in (30, 33, 36):
        cv.vline(sx, 125, 3, "n")
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


def resto_frames():
    frames = []
    for n in range(2):
        cv = Canvas(176, 192)
        draw_resto(cv, n)
        cv.outline("O", skip=(".", "x", "X", "q"))
        _shadow(cv, 88, 191, 86, 1)
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


def draw_istana(cv, frame):
    # floating island
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

    # platform steps
    cv.box(36, 162, 136, 7, "s", dark="S")
    cv.box(46, 156, 116, 7, "s", dark="S")
    cv.hline(46, 158, 116, "g")

    # side pavilions + penjor
    _pavilion(cv, 42)
    _pavilion(cv, 166)
    _penjor(cv, 6, flip=False)
    _penjor(cv, 201, flip=True)

    # main hall with 3-tier roof (atap tumpang)
    _hall(cv, 70, 112, 68, 45)
    _tier(cv, 104, 96, 113, 66, 96)
    cv.rect(82, 90, 44, 6, "P")
    _tier(cv, 104, 76, 91, 46, 72)
    cv.rect(90, 70, 28, 6, "P")
    _tier(cv, 104, 56, 71, 26, 48)
    cv.poly([(100, 56), (108, 56), (104, 44)], "g")            # mustaka
    cv.disc(104, 44, 3, "h")

    # lanterns
    for lx, ly in ((64, 120), (144, 120)):
        cv.vline(lx, ly - 6, 6, "G")
        cv.box(lx - 2, ly, 5, 6, "n", dark="N")


def istana_frames():
    frames = []
    for n in range(2):
        cv = Canvas(208, 224)
        draw_istana(cv, n)
        cv.outline("O", skip=(".", "q", "z", "Z", "a", "A"))
        # Bara Api Legenda floating above the roof
        lean = 0 if n == 0 else 2
        for col, w, h, dy in (("a", 6, 22, 0), ("A", 4, 14, 1), ("z", 2, 7, 2)):
            base = 34 - dy
            cv.ellipse(104, base, w, w, col)
            cv.poly([(104 - w, base), (105 + w, base), (104 + lean, base - h)], col)
        embers = [(95, 22), (113, 26), (99, 12), (110, 16)] if n == 0 else \
            [(96, 18), (112, 22), (102, 8), (109, 11)]
        for fx, fy in embers:
            cv.px(fx, fy, "a")
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
    1: {"slug": "gerobak", "frames": gerobak_frames, "palette": GEROBAK_PALETTE,
        "vendor_spot": [86, 63]},
    2: {"slug": "warung_tenda", "frames": tenda_frames, "palette": TENDA_PALETTE,
        "vendor_spot": [70, 111]},
    3: {"slug": "ruko", "frames": ruko_frames, "palette": RUKO_PALETTE,
        "vendor_spot": [104, 175]},
    4: {"slug": "resto_modern", "frames": resto_frames, "palette": RESTO_PALETTE,
        "vendor_spot": [130, 191]},
    5: {"slug": "istana_rasa", "frames": istana_frames, "palette": ISTANA_PALETTE,
        "vendor_spot": [128, 162]},
}


def generate():
    meta = {}
    for stage, st in STAGES.items():
        cvs = st["frames"]()
        frames = [(f"frame{i + 1}", render(cv.g, st["palette"])) for i, cv in enumerate(cvs)]
        save_set(OUT / f"stage{stage}_{st['slug']}", frames, durations=[500, 500], gif_scale=4)
        w, h = cvs[0].w, cvs[0].h
        meta[f"stage{stage}"] = {
            "folder": f"stage{stage}_{st['slug']}",
            "size": [w, h],
            "ground_y": h - 1,
            "vendor_spot": st["vendor_spot"],
            "frame_ms": 500,
        }
    (OUT / "buildings.json").write_text(json.dumps(meta, indent=2) + "\n")
