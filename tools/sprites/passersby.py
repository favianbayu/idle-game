"""Ambient passers-by (side view, walking right; flip for leftward) + umbrellas.

- kucing oren (jalan 4 frame, duduk 2 frame)
- ayam kampung (jalan 2, matuk 2)
- motor: ojek (jaket hijau) & keluarga boncengan, 2 frame, + versi jas hujan
- tukang sayur dorong gerobak, 4 frame, + versi terpal hujan
- payung 4 warna untuk pelanggan saat hujan
"""

from PIL import Image

from . import easter
from . import face
from .character import BODY_KAOS, HATS, compose, full_palette
from .core import ASSETS, contact_sheet, render, save_set
from .draw import Canvas
from .npc_anim import customer_frames

_ = easter  # memastikan topi caping sudah terdaftar

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
# Riders and the vegetable seller are regular NPCs from the face kit + extra elements.
MOTOR = {"T": "#2b2530", "M": "#9aa3a8", "m": "#5d666b", "k": "#c9322a", "K": "#8a1f12",
         "l": "#fff2a8", "p": "#3e3a4a"}


def _helm():
    cv = Canvas(32, 40)
    cv.ellipse(16, 12, 11, 7, "c")
    cv.rect(4, 12, 24, 7, ".")
    cv.rect(5, 12, 3, 7, "c"), cv.rect(24, 12, 3, 7, "c")          # pelindung pipi
    cv.hline(6, 13, 20, "C"), cv.hline(6, 14, 20, "C")              # kaca helm terbuka
    cv.hline(9, 7, 6, "B")                                          # kilap
    cv.outline("O")
    return {y: "".join(r) for y, r in enumerate(cv.g) if any(ch != "." for ch in r)}


HATS["helm"] = {"clip": 14, "layer": _helm()}

RIDERS = {
    "ojek": [dict(look=dict(hair="cepak", skin="sawo_matang", brows="tebal", mouth="senyum"),
                  outfit={"g": "#3fae5a", "G": "#2a7a3a", "L": "#6fd07a", "q": "#fbf6ec",
                          "c": "#3fae5a", "C": "#1e1420", "B": "#9fe0a8"})],
    "keluarga": [dict(look=dict(hair="pendek", skin="kuning_langsat", eyes="berbinar", mouth="ketawa"),
                      outfit={"g": "#f2c94c", "G": "#b8892a", "L": "#ffe08a", "q": "#d8432a",
                              "c": "#fbf6ec", "C": "#1e1420", "B": "#ffffff"}, dx=-11),
                 dict(look=dict(hair="kerudung", hijab_color="ungu", skin="sawo_matang", mouth="senyum"),
                      outfit={"g": "#8e62c4", "G": "#5a3a8a", "L": "#b08ae0", "q": "#8e62c4",
                              "c": "#fbf6ec", "C": "#1e1420", "B": "#ffffff", "i": "#7b4fb0",
                              "I": "#4d2d78", "j": "#a07ad0"}, dx=0)],
}
JAS_HUJAN = {"g": "#4fa8e0", "G": "#2e6aa0", "L": "#8fd0f8", "q": "#4fa8e0", "i": "#4fa8e0",
             "I": "#2e6aa0", "j": "#8fd0f8"}


def _rider(r, rain):
    lk = face.look(**r["look"])
    outfit = dict(r["outfit"])
    if rain:
        outfit.update(JAS_HUJAN)
    pal = full_palette(lk, {**outfit, "p": "#3e3a4a", "P": "#2c2836", "f": "#2a2430", "F": "#16121a"})
    hat = None if lk["hair"] == "kerudung" else "helm"
    img = render(compose(lk, BODY_KAOS, hat=hat), pal)
    return img.crop((0, 0, 32, 31))


def motor(kind, frame, rain=False):
    cv = Canvas(56, 52)
    bob = frame % 2
    oy = 12
    for cx in (12, 44):                                               # roda
        cv.disc(cx, 33 + oy, 6, "T")
        cv.disc(cx, 33 + oy, 3, "M")
        spokes = ((0, -2), (2, 0), (0, 2), (-2, 0)) if frame % 2 == 0 else ((1, -1), (1, 1), (-1, 1), (-1, -1))
        for dx, dy in spokes:
            cv.px(cx + dx, 33 + oy + dy, "m")
    y0 = bob + oy
    cv.poly([(8, 26 + y0), (32, 24 + y0), (42, 22 + y0), (47, 26 + y0), (43, 30 + y0), (12, 30 + y0)], "k")
    cv.hline(10, 29 + y0, 32, "K")
    cv.rect(12, 22 + y0, 22, 3, "p")                                  # jok
    cv.line(43, 30 + y0, 47, 33 + y0, "m")
    body = _fin(cv, MOTOR)
    front = Canvas(56, 52)                                            # tameng + setang di depan rider
    front.poly([(38, 12 + y0), (44, 12 + y0), (48, 26 + y0), (41, 26 + y0)], "k")
    front.rect(46, 16 + y0, 3, 3, "l")
    front.line(33, 22 + y0, 42, 16 + y0, "m")
    front = _fin(front, MOTOR)
    img = body.copy()
    for r in RIDERS[kind]:
        rider = _rider(r, rain)
        img.alpha_composite(rider, (14 + r.get("dx", 0), y0 - 7))
    img.alpha_composite(front)
    return img


# ------------------------------------------------------------- tukang sayur
SAYUR = {"w": "#a0643a", "W": "#6b4a32", "M": "#50585c", "g": "#5fae4a", "G": "#2f7a3a",
         "r": "#d8322a", "o": "#f0902a", "y": "#f2c94c", "p": "#3e3a4a", "t": "#bfe6f0aa"}
SAYUR_LOOK = dict(hair="pendek", skin="cokelat", brows="tebal", mouth="ketawa", facial_hair="kumis_tipis")


def _gerobak_sayur(rain):
    cv = Canvas(40, 42)
    cv.rect(6, 22, 32, 11, "w")
    cv.hline(6, 26, 32, "W"), cv.hline(6, 30, 32, "W")
    for x, col in ((9, "g"), (15, "r"), (21, "o"), (27, "g"), (33, "y")):
        cv.ellipse(x, 20, 3, 3, col)
    cv.px(15, 17, "G"), cv.px(27, 17, "G")
    cv.rect(7, 18, 2, 3, "g"), cv.rect(19, 17, 2, 4, "G")
    cv.line(6, 24, 0, 30, "M")                                        # pegangan ke tangan
    for cx in (12, 32):
        cv.disc(cx, 37, 4, "p")
        cv.disc(cx, 37, 1, "M")
    if rain:
        cv.poly([(5, 10), (39, 10), (39, 23), (5, 23)], "t")
    return _fin(cv, SAYUR, skip=(".", "t"))


def tukang_sayur_frames(rain=False):
    lk = face.look(**SAYUR_LOOK)
    outfit = {"g": "#4f86a6", "G": "#2e5570", "L": "#7fb0cc", "q": "#4f86a6", "c": "#d8b860",
              "C": "#a8883a", "p": "#3e3a4a", "P": "#2c2836", "f": "#6b4a32", "F": "#4a3222"}
    pal = full_palette(lk, outfit)
    frames = customer_frames(lambda e: compose(lk, BODY_KAOS, hat="caping", expression=e), pal)
    cart = _gerobak_sayur(rain)
    out = []
    for name, im in frames[:4]:
        c = Image.new("RGBA", (72, 42), (0, 0, 0, 0))
        c.alpha_composite(im, (0, 2))
        c.alpha_composite(cart, (32, 0))
        out.append((name, c))
    return out


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
        save_set(OUT / ("tukang_sayur" + ("_hujan" if rain else "")), tukang_sayur_frames(rain),
                 durations=[180] * 4)
    for c in PAYUNG:
        payung(c).save(OUT / f"payung_{c}.png")
    rows = [[kucing(i) for i in range(4)] + [kucing_duduk(0), kucing_duduk(1)] + [ayam(i) for i in range(4)],
            [motor("ojek", 0), motor("ojek", 0, True), motor("keluarga", 0), motor("keluarga", 1, True)],
            [tukang_sayur_frames()[0][1], tukang_sayur_frames(True)[2][1]] + [payung(c) for c in PAYUNG]]
    contact_sheet(rows, k=4, pad=10).save(OUT / "lewat_preview.png")
