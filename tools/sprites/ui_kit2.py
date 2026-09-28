"""UI kit v2: detailed, warm pixel-art 9-slice pieces (wood frames, parchment,
cards, chunky buttons, tabs, ribbons, bars, tooltips).

Each piece is exported at native size to assets/ui/kit_v2/<name>.png and listed in
kit_v2.json with its 9-slice border, so CSS `border-image` or an engine can stretch
it. Scale by whole numbers with nearest-neighbour.
"""

import json

from PIL import Image

from .core import ASSETS, contact_sheet, render, scale
from .draw import Canvas

OUT = ASSETS.parent / "ui" / "kit_v2"

P = {
    "O": "#2a1418",                                         # garis luar
    "w": "#8a4a2b", "W": "#5a3222", "l": "#b0683a", "L": "#d08a4a", "g": "#6e3b24",  # kayu
    "c": "#f4e4bf", "C": "#e0c898", "e": "#c9a86a", "E": "#fbf0d8",  # kertas / krem
    "y": "#f2c94c", "Y": "#fff2a8", "G": "#b8892a",          # emas
    "r": "#d8432a", "R": "#8a1f12", "s": "#f07a5a",          # merah
    "h": "#4fae5a", "H": "#2a7a3a", "j": "#8fe07a",          # hijau
    "b": "#3f8ac6", "B": "#1f4a7a", "k": "#7ab8e8",          # biru
    "u": "#8e4ab0", "U": "#4d2468", "v": "#c080e0",          # ungu
    "a": "#8a8f94", "A": "#50565a", "q": "#b8bcc0",          # abu
    "o": "#f0902a", "Q": "#a8581a", "z": "#ffc070",          # oranye
    "t": "#3a2230", "T": "#24141e",                          # track bar / strip gelap
    "n": "#2e4a52", "N": "#1c2e34", "m": "#4a7280",          # strip bawah teal
    "d": "#d8b890", "D": "#c9a070",                          # pola potret
}

PIECES = {}


def piece(name, w, h, border, fn):
    PIECES[name] = (w, h, border, fn)


def _rounded(cv, w, h, key="."):
    for x, y in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        cv.px(x, y, key)


def _rivet(cv, x, y):
    cv.px(x, y, "Y"), cv.px(x + 1, y, "y"), cv.px(x, y + 1, "y"), cv.px(x + 1, y + 1, "G")


# ------------------------------------------------------------ panels
def frame_kayu(cv):
    w = h = 32
    cv.rect(0, 0, w, h, "w")
    for y in range(2, h - 2, 3):                                  # serat kayu
        for x in range(2, w - 2):
            if (x * 7 + y * 3) % 11 == 0:
                cv.px(x, y, "g")
    cv.hline(1, 1, w - 2, "L"), cv.vline(1, 1, h - 2, "l")
    cv.hline(1, h - 2, w - 2, "W"), cv.vline(w - 2, 1, h - 2, "W")
    cv.rect(6, 6, w - 12, h - 12, "c")                           # isi kertas
    cv.frame(5, 5, w - 10, h - 10, "O")
    cv.hline(6, 6, w - 12, "C")
    cv.frame(0, 0, w, h, "O")
    _rounded(cv, w, h)
    for x, y in ((2, 2), (w - 4, 2), (2, h - 4), (w - 4, h - 4)):
        _rivet(cv, x, y)


def kertas(cv):
    w = h = 24
    cv.rect(0, 0, w, h, "c")
    for i in range(w):                                            # tepi bergelombang
        if i % 5 in (1, 2):
            cv.px(i, 0, "."), cv.px(i, h - 1, ".")
            cv.px(0, i, "."), cv.px(w - 1, i, ".")
    for i in range(1, w - 1):
        cv.px(i, h - 2, "C"), cv.px(w - 2, i, "C")
    for x, y in ((5, 7), (15, 4), (9, 16), (18, 13)):
        cv.px(x, y, "C")


def kartu(cv):
    w = h = 24
    cv.rect(0, 0, w, h - 2, "E")
    cv.frame(0, 0, w, h - 2, "O")
    cv.frame(1, 1, w - 2, h - 4, "e")
    cv.frame(2, 2, w - 4, h - 6, "E")
    cv.hline(1, h - 2, w - 2, "W"), cv.hline(2, h - 1, w - 4, "W")   # bayangan
    _rounded(cv, w, h - 2)


def plat_nama(cv):
    w = h = 20
    cv.rect(0, 0, w, h, "E")
    cv.frame(0, 0, w, h, "e")
    cv.frame(1, 1, w - 2, h - 2, "E")
    for x, y in ((2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)):
        cv.px(x, y, "D")
    _rounded(cv, w, h)


def potret(cv):
    w = h = 32
    cv.rect(0, 0, w, h, "c")
    for y in range(h):
        for x in range(w):
            if (x + y) % 16 == 0 or (x - y) % 16 == 0:
                cv.px(x, y, "d")
    cv.frame(0, 0, w, h, "O")
    cv.frame(1, 1, w - 2, h - 2, "D")


def latar_pola(cv):
    w = h = 16
    cv.rect(0, 0, w, h, "T")
    for y in range(h):
        for x in range(w):
            if abs(x - 7.5) + abs(y - 7.5) < 8 and (x + y) % 2 == 0:
                cv.px(x, y, "t")


def tooltip(cv):
    w = h = 24
    cv.rect(0, 0, w, h, "E")
    cv.frame(0, 0, w, h, "e")
    for (x, y, dx, dy) in ((0, 0, 1, 1), (w - 1, 0, -1, 1), (0, h - 1, 1, -1), (w - 1, h - 1, -1, -1)):
        for i in range(6):                                        # siku emas
            cv.px(x + dx * i, y, "G"), cv.px(x, y + dy * i, "G")
            cv.px(x + dx * i, y + dy, "y"), cv.px(x + dx, y + dy * i, "y")
        cv.px(x + dx * 2, y + dy * 2, "Y")


def strip(cv):
    w, h = 24, 24
    cv.rect(0, 0, w, h, "n")
    cv.hline(0, 0, w, "O"), cv.hline(0, 1, w, "m"), cv.hline(0, h - 1, w, "N")
    for x in range(0, w, 6):
        cv.px(x + 2, 4, "N")


def slot_ikon(cv):
    w = h = 16
    cv.rect(0, 0, w, h, "E")
    cv.frame(0, 0, w, h, "e")
    cv.hline(1, h - 2, w - 2, "C")
    _rounded(cv, w, h)


def jendela(cv):
    """Window with title bar (like a retro OS dialog)."""
    w, h = 32, 32
    cv.rect(0, 0, w, h, "E")
    cv.rect(0, 0, w, 9, "c")
    for y in range(2, 8, 2):
        cv.hline(2, y, w - 4, "e")
    cv.hline(0, 9, w, "O")
    cv.frame(0, 0, w, h, "O")
    cv.frame(1, 10, w - 2, h - 11, "E")
    cv.hline(1, h - 2, w - 2, "C")


def _button(color, pressed=False):
    base, hi, lo = {"hijau": "hjH", "emas": "yYG", "merah": "rsR", "biru": "bkB", "ungu": "uvU",
                    "abu": "aqA", "oranye": "ozQ"}[color]

    def fn(cv):
        w, h = 24, 24
        cv.rect(0, 0, w, h, base)
        if pressed:
            cv.hline(1, 1, w - 2, lo), cv.hline(1, 2, w - 2, lo)
            cv.hline(1, h - 2, w - 2, hi)
        else:
            cv.hline(1, 1, w - 2, hi), cv.vline(1, 1, h - 4, hi)
            cv.hline(2, 2, 3, "E" if color != "emas" else "Y")
            cv.rect(1, h - 4, w - 2, 3, lo)
            cv.vline(w - 2, 2, h - 5, lo)
        cv.frame(0, 0, w, h, "O")
        _rounded(cv, w, h)
        for x, y in ((3, 4), (w - 4, 4), (3, h - 6), (w - 4, h - 6)):   # paku kecil
            cv.px(x, y, hi if not pressed else lo)
    return fn


def _tab(active):
    def fn(cv):
        w, h = 24, 20
        face, hi, lo = ("l", "L", "w") if active else ("w", "l", "W")
        cv.rect(0, 0, w, h, face)
        cv.hline(1, 1, w - 2, hi), cv.vline(1, 1, h - 2, hi)
        cv.vline(w - 2, 1, h - 2, lo)
        cv.frame(0, 0, w, h, "O")
        cv.hline(0, h - 1, w, face if active else "O")
        cv.px(0, 0, "."), cv.px(w - 1, 0, ".")
        if active:
            _rivet(cv, 2, 2), _rivet(cv, w - 4, 2)
            cv.hline(3, h - 2, w - 6, "y")
    return fn


def pita(cv):
    """Ribbon title banner with folded tails (3-slice horizontally)."""
    w = 48
    cv.poly([(0, 5), (10, 5), (10, 17), (0, 17), (4, 11)], "R")        # ekor kiri
    cv.poly([(47, 5), (37, 5), (37, 17), (47, 17), (43, 11)], "R")
    cv.rect(6, 1, w - 12, 13, "r")
    cv.hline(7, 2, w - 14, "s")
    cv.hline(6, 12, w - 12, "R")
    cv.poly([(6, 14), (10, 14), (10, 17)], "O")                      # lipatan
    cv.poly([(41, 14), (37, 14), (37, 17)], "O")
    cv.hline(6, 3, w - 12, "y"), cv.hline(6, 11, w - 12, "G")
    cv.outline("O")


def pill_harga(cv):
    w, h = 24, 14
    cv.rect(1, 0, w - 2, h, "r")
    cv.rect(0, 1, w, h - 2, "r")
    cv.hline(2, 1, w - 4, "s")
    cv.hline(2, h - 2, w - 4, "R")
    cv.frame(0, 0, w, h, "G")
    cv.frame(1, 1, w - 2, h - 2, "y")
    cv.rect(2, 2, w - 4, h - 4, "r")
    cv.hline(3, 2, w - 6, "s")
    _rounded(cv, w, h)


def _bar(fill):
    def fn(cv):
        w, h = 12, 8
        cv.rect(0, 0, w, h, "t")
        cv.frame(0, 0, w, h, "O")
        if fill:
            base, hi, lo = {"biru": "bkB", "hijau": "hjH", "oranye": "ozQ", "ungu": "uvU",
                            "emas": "yYG", "merah": "rsR"}[fill]
            cv.rect(1, 1, w - 2, h - 2, base)
            cv.hline(1, 1, w - 2, hi)
            cv.hline(1, h - 2, w - 2, lo)
            cv.frame(0, 0, w, h, "O")
        else:
            cv.hline(1, 1, w - 2, "T")
    return fn


def tutup(cv):
    w = h = 18
    cv.rect(0, 0, w, h, "r")
    cv.hline(1, 1, w - 2, "s"), cv.rect(1, h - 3, w - 2, 2, "R")
    for d in (0, 1):
        cv.line(5 + d, 4, 12 + d, 11, "E"), cv.line(12 + d, 4, 5 + d, 11, "E")
    cv.frame(0, 0, w, h, "O")
    _rounded(cv, w, h)


piece("frame_kayu", 32, 32, 9, frame_kayu)
piece("kertas", 24, 24, 6, kertas)
piece("kartu", 24, 24, 6, kartu)
piece("plat_nama", 20, 20, 4, plat_nama)
piece("potret", 32, 32, 3, potret)
piece("latar_pola", 16, 16, 0, latar_pola)
piece("tooltip", 24, 24, 7, tooltip)
piece("strip", 24, 24, 4, strip)
piece("slot_ikon", 16, 16, 3, slot_ikon)
piece("jendela", 32, 32, 11, jendela)
for _c in ("hijau", "emas", "merah", "biru", "ungu", "abu", "oranye"):
    piece(f"tombol_{_c}", 24, 24, 6, _button(_c))
    piece(f"tombol_{_c}_tekan", 24, 24, 6, _button(_c, True))
piece("tab_aktif", 24, 20, 6, _tab(True))
piece("tab_pasif", 24, 20, 6, _tab(False))
piece("pita", 48, 18, 12, pita)
piece("pill_harga", 24, 14, 5, pill_harga)
piece("bar_track", 12, 8, 3, _bar(None))
for _f in ("biru", "hijau", "oranye", "ungu", "emas", "merah"):
    piece(f"bar_{_f}", 12, 8, 3, _bar(_f))
piece("tutup", 18, 18, 0, tutup)


def build(name):
    w, h, _, fn = PIECES[name]
    cv = Canvas(w, h)
    fn(cv)
    return render(cv.g, P)


def generate():
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {}
    imgs = []
    for name, (w, h, border, _) in PIECES.items():
        im = build(name)
        im.save(OUT / f"{name}.png")
        meta[name] = {"size": [w, h], "nine_slice_border": border}
        imgs.append(im)
    (OUT / "kit_v2.json").write_text(json.dumps({"palette": P, "pieces": meta}, indent=2) + "\n")
    names = list(PIECES)
    rows = [names[i:i + 8] for i in range(0, len(names), 8)]
    contact_sheet([[build(n) for n in r] for r in rows], k=4, labels=rows, pad=12).save(
        OUT / "kit_v2_preview.png")
    _ = Image, scale
