"""City environments (background) for every stage.

A background is 224x256 and built from layers, each exported separately so
the game can parallax them:

  sky    - dithered gradient for the stage's time of day (+ stars / sea / mist)
  far    - the city's landmark silhouettes (Monas, Gedung Sate, Gunung Agung...)
  mid    - neighbourhood in the city's architectural style, tinted to the light
  near   - ground + city street props, tinted, with their own lights

Stage moods: 1 senja (kampung), 2 malam (trotoar), 3 sore emas (jalan ruko),
4 malam neon (pusat kota), 5 fantasi (langit melayang).
"""

import math

from PIL import Image, ImageChops

from . import props
from .cities import CITIES, CITY_ORDER
from .core import ASSETS, hexc, render, scale
from .draw import Canvas

OUT = ASSETS.parent / "environments"
W, H = 224, 256
GROUND = 238
HORIZON = 206

BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]

# Where each stage building sits in the scene (x0, x1, top) -> keep props in the gaps.
BUILDING_SPAN = {1: (72, 152, 175), 2: (32, 192, 127), 3: (40, 184, 63), 4: (24, 200, 47),
                 5: (8, 216, 24)}

STAGE_LIGHT = {
    1: {"sky": ["#3b2a4a", "#6b3f5a", "#c9784a", "#f4d9a0"], "far": ("#6a3f5e", "#553250", "#c9785a"),
        "tint": (235, 175, 165), "haze": ("#c9784a", 0.25), "ground": ("#5a4a4a", "#7a6660", "#463a3c"),
        "stars": False, "lights": True},
    2: {"sky": ["#141a2e", "#1f2a44", "#2e3f5e", "#4f6f96"], "far": ("#26304a", "#1c2438", "#4f6f96"),
        "tint": (110, 120, 175), "haze": ("#2e3f5e", 0.2), "ground": ("#3a3a48", "#55556a", "#2c2c38"),
        "stars": True, "lights": True},
    3: {"sky": ["#6a78a8", "#d9a36a", "#f2c94c", "#fff2c8"], "far": ("#c99a6a", "#b0845a", "#fff2c8"),
        "tint": (255, 228, 180), "haze": ("#f2c94c", 0.2), "ground": ("#8a7a6a", "#a8977a", "#6e6254"),
        "stars": False, "lights": False},
    4: {"sky": ["#0d0b1a", "#1b1436", "#2a2350", "#3a4a6e"], "far": ("#1b1636", "#141028", "#3a4a6e"),
        "tint": (95, 95, 150), "haze": ("#2a2350", 0.25), "ground": ("#2a2830", "#3e3c48", "#1e1c24"),
        "stars": True, "lights": True},
    5: {"sky": ["#2a1a4a", "#6b3fa0", "#b36ad0", "#ff8fdc"], "far": ("#8a5ab8", "#6b3fa0", "#ffd0f0"),
        "tint": (225, 195, 255), "haze": ("#b36ad0", 0.2), "ground": None,
        "stars": True, "lights": True},
}

LIGHT_PALETTE = {"L": "#ffd88a", "l": "#f2b45a", "C": "#7cf5e8", "P": "#ff8fdc", "R": "#ff5a4a",
                 "Y": "#ffe28a66", "y": "#fff2a8", "W": "#fbf6ec", "g": "#f2c94c"}

# City daylight colours for the mid layer (tinted per stage afterwards).
CITY_MID = {
    "jakarta": {"w": "#efe4c8", "W": "#c9bb98", "r": "#b5553c", "R": "#843826", "t": "#3f8a4a",
                "T": "#285e32", "k": "#8a5a36", "K": "#5e3b22", "d": "#3a3040", "n": "#e0662a",
                "N": "#a8401a", "s": "#9aa3a8", "S": "#6d777d", "v": "#4f8a3a", "V": "#2f5a24",
                "m": "#50585c", "b": "#d8c29a", "B": "#b09a70", "u": "#c9b89a", "O": "#2a1c24"},
    "bandung": {"w": "#f3efe6", "W": "#c9c1b3", "r": "#3a3036", "R": "#26202a", "t": "#3f8a6a",
                "T": "#285e48", "k": "#8a6a4a", "K": "#5e4632", "d": "#34303a", "n": "#e2c678",
                "N": "#b0923e", "s": "#b8bcc0", "S": "#8a8f94", "v": "#3f7a52", "V": "#285e3c",
                "m": "#50585c", "b": "#e2c678", "B": "#b0923e", "u": "#9a8a6a", "O": "#2a1c24"},
    "bali": {"w": "#d8d0c0", "W": "#a89e8a", "r": "#c9a86a", "R": "#9a7a44", "t": "#b5553c",
             "T": "#843826", "k": "#8a5a36", "K": "#5e3b22", "d": "#3a3030", "n": "#e0b04a",
             "N": "#a8801e", "s": "#a8a090", "S": "#7a7466", "v": "#4f8a3a", "V": "#2f5a24",
             "m": "#50585c", "b": "#b5553c", "B": "#843826", "u": "#e8d8b0", "O": "#2a1c24"},
    "surabaya": {"w": "#f6f2ea", "W": "#cfc6b6", "r": "#b5553c", "R": "#843826", "t": "#2e4a7a",
                 "T": "#1c2f52", "k": "#7a5a3a", "K": "#523a24", "d": "#34303a", "n": "#c9432a",
                 "N": "#8a1f12", "s": "#9aa3a8", "S": "#6d777d", "v": "#4f8a3a", "V": "#2f5a24",
                 "m": "#50585c", "b": "#fbf6ec", "B": "#c9432a", "u": "#b8a888", "O": "#2a1c24"},
}


# ================================================================== helpers
def _gradient(colors, height=GROUND):
    img = Image.new("RGBA", (W, H))
    px = img.load()
    cols = [hexc(c) for c in colors]
    n = len(cols) - 1
    for y in range(H):
        t = min(y / height, 1) * n
        i = min(int(t), n - 1)
        frac = t - i
        for x in range(W):
            px[x, y] = cols[i + 1] if frac * 16 > BAYER[y % 4][x % 4] + 0.5 else cols[i]
    return img


def _tint(img, rgb, haze=None):
    solid = Image.new("RGBA", img.size, rgb + (255,))
    out = ImageChops.multiply(img, solid)
    if haze:
        col, amt = haze
        hz = Image.new("RGBA", img.size, hexc(col))
        mixed = Image.blend(out, hz, amt)
        mixed.putalpha(img.getchannel("A"))
        out = mixed
    out.putalpha(img.getchannel("A"))
    return out


def _paste_prop(img, name, x, base, tint, flip=False, **kw):
    p = props.image(name, **kw)
    if flip:
        p = p.transpose(Image.FLIP_LEFT_RIGHT)
    p = _tint(p, tint)
    img.alpha_composite(p, (x, base - p.height + 1))
    return p


def _glow(cv, x, y, r, key="Y"):
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dx * dx + dy * dy <= r * r and cv.get(x + dx, y + dy) == ".":
                cv.px(x + dx, y + dy, key)


# ================================================================ landmarks
def monas(cv, x, base, h, gold="g"):
    """Monumen Nasional: cup-shaped plinth, tapering obelisk, golden flame."""
    cup_h = max(6, h // 12)
    cv.poly([(x - h // 6, base), (x + h // 6 + 1, base), (x + h // 8, base - cup_h),
             (x - h // 8, base - cup_h)], "a")
    cv.rect(x - h // 5, base - cup_h - 2, 2 * (h // 5) + 1, 2, "b")
    top = base - h + h // 10
    for y in range(top, base - cup_h - 2):
        t = (y - top) / (base - cup_h - 2 - top)
        half = round(1 + t * max(2, h // 30))
        cv.hline(x - half, y, 2 * half + 1, "a")
        cv.px(x - half, y, "c")
    cv.rect(x - 3, top - 2, 7, 2, "b")
    for i in range(h // 10):
        half = max(0, 2 - i // 3)
        cv.hline(x - half, top - 3 - i, 2 * half + 1, gold)


def gedung_sate(cv, x, base, w=70):
    """Gedung Sate: long white hall, central tiered tower with the 'tusuk sate' spire."""
    cv.rect(x - w // 2, base - 14, w, 14, "a")
    cv.poly([(x - w // 2 - 2, base - 14), (x + w // 2 + 2, base - 14), (x + w // 2 - 4, base - 20),
             (x - w // 2 + 4, base - 20)], "b")
    for wx in range(x - w // 2 + 3, x + w // 2 - 2, 5):
        cv.rect(wx, base - 11, 2, 5, "b")
    cv.rect(x - 7, base - 30, 15, 16, "a")
    cv.poly([(x - 9, base - 30), (x + 10, base - 30), (x + 5, base - 38), (x - 4, base - 38)], "b")
    cv.poly([(x - 5, base - 38), (x + 6, base - 38), (x + 2, base - 44), (x - 1, base - 44)], "b")
    cv.vline(x, base - 58, 14, "g")
    for i in range(6):                                              # 6 tusuk jambu air
        cv.px(x, base - 46 - i * 2, "h")


def mountain(cv, x0, x1, base, peak_y, flat=0, snow=False, curve=1.0):
    """Mountain with concave slopes (curve > 1 = steeper summit)."""
    cx = (x0 + x1) // 2
    half = max(1, (x1 - x0) // 2 - flat)
    for x in range(x0, x1 + 1):
        d = max(0, abs(x - cx) - flat) / half
        y = round(base - (base - peak_y) * (1 - min(d, 1)) ** curve)
        cv.vline(x, y, base - y + 1, "b" if x > cx else "a")
        if x <= cx and x % 2 == 0:
            cv.px(x, y, "c")
    if snow:
        cv.hline(cx - flat - 2, peak_y + 1, 2 * flat + 5, "c")


def suramadu(cv, x0, x1, deck_y, pylons):
    cv.rect(x0, deck_y, x1 - x0, 3, "a")
    cv.hline(x0, deck_y, x1 - x0, "c")
    for px_, ph in pylons:
        for dx in (-3, 3):
            cv.line(px_ + dx, deck_y + 10, px_ + dx // 3, deck_y - ph, "a")
        cv.hline(px_ - 2, deck_y - ph // 2, 5, "a")
        for k in range(1, 7):                                       # kabel
            cv.line(px_, deck_y - ph + 3, px_ - k * 7, deck_y, "b")
            cv.line(px_, deck_y - ph + 3, px_ + k * 7, deck_y, "b")
    for x in range(x0, x1, 18):
        cv.rect(x, deck_y + 3, 2, 10, "a")


def tugu_pahlawan(cv, x, base, h):
    """Tugu Pahlawan: 'paku terbalik', a ribbed spire widening to a flared foot."""
    cv.rect(x - 8, base - 3, 17, 3, "b")
    cv.poly([(x - 6, base - 3), (x + 7, base - 3), (x + 3, base - 10), (x - 2, base - 10)], "a")
    for y in range(base - h, base - 10):
        t = (y - (base - h)) / (h - 10)
        half = round(0.5 + t * 2.5)
        cv.hline(x - half, y, 2 * half + 1, "a")
        cv.px(x - half, y, "c")


def crane(cv, x, base, h, a="a", b="b"):
    """Harbour gantry crane."""
    cv.line(x - 8, base, x - 3, base - h, a)
    cv.line(x + 8, base, x + 3, base - h, a)
    cv.hline(x - 6, base - h // 2, 13, a)
    cv.rect(x - 16, base - h - 3, 36, 3, a)
    cv.line(x + 3, base - h, x + 18, base - h - 2, b)


def skyline(cv, x0, x1, base, seed, tall=90):
    x = x0
    i = 0
    while x < x1:
        w = 10 + (seed * 7 + i * 13) % 14
        h = tall // 3 + (seed * 11 + i * 17) % tall
        cv.rect(x, base - h, w, h, "a" if i % 2 else "b")
        if (i + seed) % 3 == 0:
            cv.vline(x + w // 2, base - h - 8, 8, "a")
        x += w + 1
        i += 1


def candi_bentar(cv, x, base, h, gap=10):
    """Balinese split gate (two mirrored stepped towers)."""
    for side in (-1, 1):
        cx = x + side * (gap // 2 + 7)
        for t in range(6):
            w = 14 - t * 2
            y = base - (t + 1) * (h // 6)
            cv.rect(cx - w // 2, y, w, h // 6, "a" if t % 2 else "b")
        cv.px(cx, base - h - 2, "g")


# ================================================================ mid houses
def house(cv, city, x, base, w, storeys=1, shop=False):
    """One building in the city's vernacular style (daylight colours)."""
    fh = 22
    h = fh * storeys
    top = base - h
    if city == "bandung" and storeys == 1:                          # rumah panggung
        for px_ in range(x + 2, x + w - 1, 8):
            cv.rect(px_, base - 6, 2, 6, "K")
        base -= 6
        top = base - h + 6
    if city == "bali" and storeys == 1:                             # tembok bata + bale
        cv.poly([(x + 2, top - 2), (x + w - 2, top - 2), (x + w - 8, top - 14), (x + 8, top - 14)], "r")
        for yy in range(top - 12, top - 2, 3):
            cv.hline(x + 6, yy, w - 12, "R")
        cv.fill_fn(x, top + 4, w, base - top - 4,
                   lambda i, j: "B" if j % 3 == 0 or (i + (j // 3) * 3) % 6 == 0 else "b")
        cv.rect(x - 1, top + 2, w + 2, 3, "s")
        gx = x + w // 2                                             # angkul-angkul
        cv.rect(gx - 5, top - 2, 11, base - top + 2, "s")
        cv.rect(gx - 3, top + 6, 7, base - top - 6, "d")
        cv.poly([(gx - 8, top - 2), (gx + 9, top - 2), (gx, top - 10)], "r")
        return
    cv.rect(x, top, w, base - top, "w")
    cv.rect(x + w - 3, top, 3, base - top, "W")
    if city == "bandung" and storeys == 1:
        cv.fill_fn(x, top, w - 3, base - top, lambda i, j: "b" if (i + j) % 4 < 2 else "B")
    if city == "surabaya" and storeys > 1:                          # kolonial: pilaster + lengkung
        for px_ in range(x + 3, x + w - 3, 10):
            cv.rect(px_, top, 2, base - top, "W")
    # windows / shop front
    for s in range(storeys):
        wy = top + s * fh + 6
        if shop and s == storeys - 1:
            cv.rect(x + 3, base - 16, w - 6, 16, "d")
            cv.rect(x + 2, base - 18, w - 4, 3, "n")
            continue
        for wx in range(x + 4, x + w - 8, 12):
            if city == "surabaya" and storeys > 1:
                cv.rect(wx, wy + 2, 7, 9, "d")
                cv.ellipse(wx + 3, wy + 2, 3, 2, "d")
            elif city == "bandung" and storeys > 1:                  # art deco: jendela horizontal
                cv.rect(wx, wy + 3, 9, 6, "d")
                cv.hline(wx - 1, wy + 10, 11, "t")
            else:
                cv.rect(wx, wy, 7, 9, "d")
                cv.frame(wx - 1, wy - 1, 9, 11, "t")
    # roof
    if city == "jakarta":
        cv.poly([(x - 4, top), (x + w + 4, top), (x + w - 6, top - 12), (x + 6, top - 12)], "r")
        for yy in range(top - 10, top, 3):
            cv.hline(x + 2, yy, w - 4, "R")
        for gx in range(x - 4, x + w + 3, 4):                      # gigi balang
            cv.poly([(gx, top), (gx + 4, top), (gx + 2, top + 4)], "t")
    elif city == "bandung":
        if storeys == 1:                                            # julang ngapak
            cv.poly([(x - 10, top + 3), (x + w + 10, top + 3), (x + w, top - 2), (x + w // 2, top - 14),
                     (x, top - 2)], "r")
            cv.line(x + w // 2, top - 14, x - 10, top + 3, "R")
        else:                                                       # art deco: tangga di atap
            cv.rect(x - 1, top - 3, w + 2, 3, "t")
            cv.rect(x + w // 2 - 6, top - 9, 12, 6, "w")
            cv.rect(x + w // 2 - 3, top - 13, 6, 4, "w")
            for k in range(3):
                cv.hline(x, top + 2 + k * 2, w, "W")
    elif city == "bali":
        cv.poly([(x - 3, top), (x + w + 3, top), (x + w - 6, top - 12), (x + 6, top - 12)], "r")
        for yy in range(top - 10, top, 3):
            cv.hline(x + 1, yy, w - 2, "R")
        cv.rect(x - 1, top, w + 2, 3, "s")
        for sx in range(x, x + w, 6):                               # ukiran paras
            cv.px(sx + 2, top + 1, "S")
    else:                                                           # surabaya: limasan genteng
        cv.poly([(x - 3, top), (x + w + 3, top), (x + w // 2 + 6, top - 12), (x + w // 2 - 6, top - 12)], "r")
        for yy in range(top - 10, top, 3):
            cv.hline(x, yy, w, "R")
        cv.hline(x + w // 2 - 6, top - 12, 13, "R")


def house_lights(lcv, city, x, base, w, storeys, seed, shop=False):
    fh = 22
    if city == "bandung" and storeys == 1:
        base -= 6
    top = base - fh * storeys
    if city == "bali" and storeys == 1:
        return
    for s in range(storeys):
        wy = top + s * fh + 6
        if shop and s == storeys - 1:
            continue
        for k, wx in enumerate(range(x + 4, x + w - 8, 12)):
            if (seed + k + s * 2) % 3 != 0:
                if city == "surabaya" and storeys > 1:
                    lcv.rect(wx, wy + 2, 7, 9, "L")
                elif city == "bandung" and storeys > 1:
                    lcv.rect(wx, wy + 3, 9, 6, "L")
                else:
                    lcv.rect(wx, wy, 7, 9, "L")


# ================================================================== layers
def far_layer(city, stage):
    cv = Canvas(W, H)
    lt = STAGE_LIGHT[stage]
    a, b, c = lt["far"]
    pal = {"a": a, "b": b, "c": c, "g": "#f2c94c", "h": "#fff2a8", "s": "#3f7aa0", "S": "#6aa0c8",
           "m": "#e8f0ff88"}
    if stage == 5:                                                   # floating landmark, fantasy
        pal.update({"a": "#b98ae0", "b": "#8a5ab8", "c": "#ffe0f8"})
        cv.ellipse(36, 150, 34, 6, "b")
        cv.poly([(4, 151), (68, 151), (50, 170), (36, 180), (22, 168)], "a")
        if city == "jakarta":
            monas(cv, 36, 148, 130)
        elif city == "bandung":
            gedung_sate(cv, 36, 148, 60)
        elif city == "bali":
            candi_bentar(cv, 36, 148, 56)
        else:
            tugu_pahlawan(cv, 36, 148, 100)
        for cx, cy, r in ((196, 96, 22), (170, 24, 9)):              # pulau kecil
            cv.ellipse(cx, cy, r, 3, "b")
            cv.poly([(cx - r, cy + 1), (cx + r, cy + 1), (cx, cy + r)], "a")
        return render(cv.g, pal)

    if city == "jakarta":
        skyline(cv, 0, W, HORIZON, seed=3, tall=40 if stage < 4 else 110)
        mx = {1: 188, 2: 210, 3: 208, 4: 212}[stage]
        monas(cv, mx, HORIZON + 4, {1: 120, 2: 130, 3: 150, 4: 170}[stage])
    elif city == "bandung":
        mountain(cv, -40, 150, HORIZON, 150, flat=34, curve=0.8)     # Tangkuban Perahu
        mountain(cv, 110, 280, HORIZON, 160, flat=4, curve=1.4)
        gedung_sate(cv, 40 if stage != 3 else 20, HORIZON + 2, 64)
        if stage == 4:
            for i in range(60):                                      # lampu kota di bukit
                pal["L"] = "#ffd88a"
                cv.px((i * 37) % W, 170 + (i * 13) % 34, "h")
    elif city == "bali":
        mountain(cv, 10, 310, HORIZON - 6, 104, flat=4, curve=3.2)   # Gunung Agung
        if stage in (1, 2, 4):
            cv.rect(0, HORIZON - 6, W, GROUND - HORIZON + 6, "s")    # laut
            for y in range(HORIZON - 4, GROUND, 4):
                for x in range((y * 7) % 11, W, 13):
                    cv.hline(x, y, 4, "S")
        candi_bentar(cv, 30, HORIZON - 4, 34)
    else:
        suramadu(cv, -10, W + 10, HORIZON - 16, [(60, 60), (170, 60)])
        tugu_pahlawan(cv, {1: 20, 2: 14, 3: 12, 4: 14}[stage], HORIZON + 4, 90)
        crane(cv, 206, HORIZON, 40)
    return render(cv.g, pal)


def far_lights(city, stage):
    lcv = Canvas(W, H)
    if stage in (2, 4):
        if city == "jakarta":
            for i in range(80):
                x, y = (i * 29) % W, HORIZON - 4 - (i * 17) % (100 if stage == 4 else 36)
                lcv.px(x, y, "L" if i % 4 else "C")
            mx = {2: 210, 4: 212}[stage]
            _glow(lcv, mx, HORIZON + 4 - {2: 130, 4: 170}[stage] + 6, 4)
        if city == "surabaya":
            for x in range(0, W, 7):                                 # lampu jembatan
                lcv.px(x, HORIZON - 17, "L")
            for px_ in (60, 170):
                lcv.px(px_, HORIZON - 76, "R")
            lcv.px(206, HORIZON - 43, "R")
        if city == "bali":
            for x in range(0, W, 9):
                lcv.px(x, HORIZON - 2 + (x % 3), "y")                # pantulan bulan
        if city == "bandung":
            for i in range(50):
                lcv.px((i * 41) % W, 176 + (i * 7) % 28, "L")
    return render(lcv.g, LIGHT_PALETTE)


def mid_layer(city, stage):
    """Neighbourhood around the shop (drawn in daylight colours, tinted later)."""
    cv, lcv = Canvas(W, H), Canvas(W, H)
    x0, x1, top = BUILDING_SPAN[stage]
    if stage == 5:
        return None, None
    if city == "bali" and stage in (2, 4):                          # pantai: tanpa rumah
        return None, None
    if stage == 4 and city != "jakarta":
        _mid_stage4(cv, lcv, city)
        return render(cv.g, CITY_MID[city]), render(lcv.g, LIGHT_PALETTE)
    storeys = {1: 1, 2: 1, 3: 2, 4: 3}[stage]
    shop = stage >= 3
    widths = {1: 34, 2: 36, 3: 40, 4: 44}[stage]
    base = GROUND - 2
    spots = []
    x = -8
    while x < W:
        spots.append(x)
        x += widths + 4
    for i, hx in enumerate(spots):
        house(cv, city, hx, base, widths, storeys, shop)
        house_lights(lcv, city, hx, base, widths, storeys, seed=i + stage, shop=shop)
    # power lines for kampung / night street
    if stage == 4 and city == "jakarta":                            # gedung tinggi di belakang ruko
        for i, (tx, tw, th) in enumerate(((0, 26, 150), (180, 30, 170), (206, 22, 130))):
            cv.rect(tx, GROUND - th, tw, th - 60, "s")
            cv.rect(tx + tw - 3, GROUND - th, 3, th - 60, "S")
            for wy in range(GROUND - th + 4, GROUND - 64, 6):
                for wx in range(tx + 2, tx + tw - 4, 5):
                    if (wx + wy + i) % 3:
                        lcv.rect(wx, wy, 3, 3, "L" if (wx * wy) % 5 else "C")
    if stage in (1, 2):
        for px_ in (4, 218):
            cv.rect(px_, GROUND - 90, 2, 90, "m")
            cv.hline(px_ - 4, GROUND - 86, 10, "m")
        for x in range(W):
            sag = round(6 * (1 - ((x - W / 2) / (W / 2)) ** 2))
            cv.px(x, GROUND - 86 + sag, "m")
            cv.px(x, GROUND - 82 + sag, "m")
    if city == "surabaya" and stage in (1, 2):                      # umbul-umbul merah putih
        for x in range(0, W):
            sag = round(10 * (1 - ((x - W / 2) / (W / 2)) ** 2))
            cv.px(x, GROUND - 100 + sag, "m")
            if x % 8 < 4:
                cv.poly([(x - x % 8, GROUND - 99 + sag), (x - x % 8 + 4, GROUND - 99 + sag),
                         (x - x % 8 + 2, GROUND - 94 + sag)], "n" if (x // 8) % 2 else "b")
    return render(cv.g, CITY_MID[city]), render(lcv.g, LIGHT_PALETTE)


def _mid_stage4(cv, lcv, city):
    """Night city backdrop that is not a row of houses."""
    if city == "bandung":                                           # bukit kafe + pinus
        for x in range(W):
            y = round(GROUND - 70 + 18 * math.sin(x / 30) + 8 * math.sin(x / 11))
            cv.vline(x, y, GROUND - y, "V")
        for i in range(14):
            px_ = (i * 37) % W
            base = round(GROUND - 70 + 18 * math.sin(px_ / 30)) + 6
            cv.poly([(px_ - 5, base), (px_ + 6, base), (px_, base - 18)], "v")
        for x in range(0, W):                                       # lampu gantung kafe
            y = GROUND - 44 + round(5 * math.sin(x / 9))
            if x % 6 == 0:
                lcv.px(x, y, "L" if x % 12 else "P")
    elif city == "surabaya":                                        # peti kemas pelabuhan
        colors = "nbtrs"
        for i, x in enumerate(range(-4, W, 30)):
            for lvl in range(1 + (i % 3)):
                y = GROUND - 14 - lvl * 14
                c = colors[(i + lvl) % len(colors)]
                cv.rect(x, y, 28, 13, c)
                for rx in range(x + 2, x + 27, 3):
                    cv.vline(rx, y + 1, 11, "S" if c == "s" else "N" if c == "n" else "T")
        crane(cv, 110, GROUND - 40, 60, a="n", b="N")
        for x in (0, 60, 150, 212):
            lcv.px(x, GROUND - 58, "R")


GROUND_STYLE = {
    ("bandung", 1): ("#6a5a42", "#7a8a4a", "#4a3e2e"),        # tanah + rumput
    ("bali", 1): ("#b8a88a", "#d8c8a8", "#8a7a64"),           # jalan paras
    ("bali", 2): ("#e0cc9a", "#f0e0b8", "#b8a070"),           # pasir pantai
    ("bali", 4): ("#8a7a5a", "#a89a70", "#6a5a42"),
}

PROP_PLAN = {
    # (city, stage): [(prop, x, flip, kwargs)] placed on the ground line
    ("jakarta", 1): [("ondel_ondel", 20, False, {}), ("ondel_ondel_perempuan", 44, False, {}),
                     ("bajaj", 168, False, {})],
    ("jakarta", 2): [("ondel_ondel", 2, False, {}), ("bajaj", 184, True, {})],
    ("jakarta", 3): [("ondel_ondel_perempuan", 8, False, {}), ("ondel_ondel", 190, False, {})],
    ("jakarta", 4): [("lampu_jalan", 2, False, {}), ("lampu_jalan", 202, True, {})],
    ("bandung", 1): [("pinus", 2, False, {}), ("pinus", 30, False, {"h": 48}),
                     ("angklung", 58, False, {}), ("pinus", 170, False, {}), ("pinus", 196, False, {})],
    ("bandung", 2): [("pinus", 4, False, {}), ("lampu_jalan", 196, True, {})],
    ("bandung", 3): [("pinus", 10, False, {}), ("angklung", 190, False, {}), ("pinus", 196, False, {})],
    ("bandung", 4): [("pinus", -4, False, {}), ("pinus", 198, False, {})],
    ("bali", 1): [("kamboja", 8, False, {}), ("canang", 58, False, {}), ("penjor", 196, True, {})],
    ("bali", 2): [("kelapa", -10, False, {}), ("jukung", 170, False, {}), ("penjor", 196, True, {})],
    ("bali", 3): [("penjor", 14, False, {}), ("kamboja", 184, False, {})],
    ("bali", 4): [("kelapa", -12, False, {}), ("jukung", 2, False, {}),
                  ("kelapa", 190, False, {"lean": -1})],
    ("surabaya", 1): [("becak", 14, False, {}), ("bendera", 58, False, {}), ("becak", 166, True, {})],
    ("surabaya", 2): [("becak", -6, False, {}), ("bendera", 200, False, {})],
    ("surabaya", 3): [("bendera", 16, False, {}), ("becak", 186, True, {})],
    ("surabaya", 4): [("lampu_jalan", 2, False, {}), ("bendera", 202, False, {})],
}


def near_layer(city, stage):
    lt = STAGE_LIGHT[stage]
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    lcv = Canvas(W, H)
    if stage == 5:                                                   # cloud floor
        cv = Canvas(W, H)
        for cx, cy, r in ((20, 246, 22), (70, 252, 26), (130, 250, 24), (190, 246, 26),
                          (230, 252, 20)):
            cv.ellipse(cx, cy, r * 2, r // 2 + 4, "c")
            cv.ellipse(cx - 4, cy - 3, r * 2 - 10, r // 2, "C")
        img.alpha_composite(render(cv.g, {"c": "#e9bef0", "C": "#f8def8"}))
        return img, render(lcv.g, LIGHT_PALETTE)

    g0, g1, g2 = GROUND_STYLE.get((city, stage), lt["ground"])
    cv = Canvas(W, H)
    cv.rect(0, GROUND, W, H - GROUND, "g")
    cv.hline(0, GROUND, W, "h")
    if stage == 1:
        cv.rect(0, GROUND + 12, W, 2, "d")                           # selokan
    else:
        for x in range(0, W, 16):
            cv.vline(x, GROUND + 1, H - GROUND, "d")
    if stage in (3, 4):
        cv.hline(0, GROUND + 8, W, "d")
        for x in range(4, W, 22):
            cv.hline(x, GROUND + 13, 10, "h")                        # marka jalan
    img.alpha_composite(_tint(render(cv.g, {"g": g0, "h": g1, "d": g2}), (255, 255, 255)))

    for name, x, flip, kw in PROP_PLAN.get((city, stage), []):
        p = _paste_prop(img, name, x, GROUND, lt["tint"], flip=flip, **kw)
        if name == "lampu_jalan" and lt["lights"]:
            lx = x + (4 if flip else 15)
            if flip:
                lx = x + p.width - 16
            _glow(lcv, lx, GROUND - p.height + 7, 5)
            lcv.rect(lx - 3, GROUND - p.height + 6, 6, 1, "y")
    if city == "bali" and stage in (2, 4) and lt["lights"]:          # obor
        for tx in (40, 184):
            lcv.vline(tx, GROUND - 30, 30, "l")
            lcv.rect(tx - 1, GROUND - 35, 3, 5, "g")
            _glow(lcv, tx, GROUND - 34, 4)
    return img, render(lcv.g, LIGHT_PALETTE)


def sky_layer(city, stage):
    lt = STAGE_LIGHT[stage]
    img = _gradient(lt["sky"], GROUND if stage != 5 else H)
    px = img.load()
    if lt["stars"]:
        for i in range(46):
            x, y = (i * 53 + stage * 7) % W, (i * 29) % 120
            px[x, y] = (243, 233, 216, 255 if i % 3 else 150)
    if city == "bandung" and stage != 5:                             # kabut pegunungan
        for y in range(HORIZON - 30, HORIZON, 2):
            for x in range(W):
                if (x + y) % 5 == 0:
                    r, g, b, _ = px[x, y]
                    px[x, y] = (min(255, r + 30), min(255, g + 30), min(255, b + 34), 255)
    if stage == 5:
        cv = Canvas(W, H)
        for cx, cy, r in ((40, 60, 10), (180, 110, 14), (110, 30, 8), (30, 190, 16)):
            cv.ellipse(cx, cy, r * 2, r // 2 + 2, "c")
        img.alpha_composite(render(cv.g, {"c": "#e9bef0aa"}))
    return img


# ================================================================== compose
def build(city, stage):
    lt = STAGE_LIGHT[stage]
    layers = {"sky": sky_layer(city, stage)}
    far = far_layer(city, stage)
    far.alpha_composite(far_lights(city, stage))
    layers["far"] = far
    mid, mid_l = mid_layer(city, stage)
    if mid is not None:
        mid = _tint(mid, lt["tint"], lt["haze"])
        if lt["lights"]:
            mid.alpha_composite(mid_l)
        layers["mid"] = mid
    if stage == 5:                                                   # properti kota di pulau kecil
        name = {"jakarta": "ondel_ondel", "bandung": "pinus", "bali": "kamboja",
                "surabaya": "becak"}[city]
        _paste_prop(far, name, 196 - props.image(name).width // 2, 95, (235, 215, 255))
    near, near_l = near_layer(city, stage)
    near.alpha_composite(near_l)
    layers["near"] = near
    full = Image.new("RGBA", (W, H))
    for name in ("sky", "far", "mid", "near"):
        if name in layers:
            full.alpha_composite(layers[name])
    return full, layers


def generate():
    for city in CITY_ORDER:
        for stage in range(1, 6):
            full, layers = build(city, stage)
            d = OUT / city / f"stage{stage}"
            d.mkdir(parents=True, exist_ok=True)
            full.save(d / "bg.png")
            scale(full, 2).save(d / "bg@2x.png")
            for name, im in layers.items():
                im.save(d / f"layer_{name}.png")


def preview_sheet():
    rows = []
    for city in CITY_ORDER:
        rows.append([build(city, s)[0] for s in range(1, 6)])
    sheet = Image.new("RGBA", (5 * (W + 4), 4 * (H + 4)), (27, 20, 32, 255))
    for r, row in enumerate(rows):
        for c, im in enumerate(row):
            sheet.alpha_composite(im, (c * (W + 4), r * (H + 4)))
    return sheet


__all__ = ["build", "generate", "preview_sheet", "CITIES"]
_ = math
