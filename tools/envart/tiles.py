"""Ground tiles, 96 x 48 diamonds (the prototype's Iso.TILE_W x TILE_H).

Each tile is drawn so its edges match any neighbour of the same kind: texture
is a function of world position wrapped on the tile (no seams), and the
diamond's border pixels carry no outline.
"""
import math
import random

from pix import Canvas, Noise, ramp, bayer

TW, TH = 96, 48


def diamond(x, y):
    """Inside test for the tile diamond, pixel centres."""
    dx = abs(x + 0.5 - TW / 2) / (TW / 2)
    dy = abs(y + 0.5 - TH / 2) / (TH / 2)
    return dx + dy <= 1.0


def tile_uv(x, y):
    """Screen pixel -> (u, v) along the grid axes, 0..48 each."""
    sx, sy = x + 0.5 - TW / 2, y + 0.5
    u = sy + sx / 2         # along +X (screen down-right)
    v = sy - sx / 2         # along +Y (screen down-left)
    return u % 48, v % 48


def _pval(g, n, u, v):
    x0, y0 = int(math.floor(u)), int(math.floor(v))
    fx, fy = u - x0, v - y0
    fx = fx * fx * (3 - 2 * fx)
    fy = fy * fy * (3 - 2 * fy)
    a, b = g[y0 % n][x0 % n], g[y0 % n][(x0 + 1) % n]
    c, d = g[(y0 + 1) % n][x0 % n], g[(y0 + 1) % n][(x0 + 1) % n]
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy


def tiled_noise(nz, u, v, scale):
    """Value noise that repeats every 48 units both ways (lattice of 6 and 12 cells)."""
    g = nz.g
    c1 = 4 if scale < 1.5 else 6
    a = _pval(g, c1, u / 48 * c1, v / 48 * c1)
    b = _pval(g[7:], 2 * c1, u / 48 * 2 * c1, v / 48 * 2 * c1)
    return a * 0.65 + b * 0.35


def grass(seed, variant=0):
    cv = Canvas(TW, TH)
    g = ramp("grass")
    nz = Noise(seed)
    rnd = random.Random(seed + variant * 7)
    for y in range(TH):
        for x in range(TW):
            if not diamond(x, y):
                continue
            u, v = tile_uv(x, y)
            n = tiled_noise(nz, u, v, 1.3)
            t = 3 + (1 if n > 0.66 else 0) - (1 if n < 0.3 else 0)
            cv.put(x, y, g[t])
    # grass blade marks: little v/ticks, lighter on top
    for k in range(26 + variant * 8):
        x, y = rnd.randint(6, TW - 7), rnd.randint(4, TH - 5)
        if diamond(x, y) and diamond(x, y - 2):
            cv.put(x, y - 1, g[5])
            cv.put(x - 1, y, g[4])
            cv.put(x + 1, y, g[2])
    if variant == 2:   # a few tiny flowers
        for k in range(5):
            x, y = rnd.randint(16, TW - 17), rnd.randint(10, TH - 11)
            if diamond(x, y):
                c = ramp(rnd.choice(["white", "yellow", "pink"]))
                cv.put(x, y, c[-2])
                cv.put(x + 1, y, c[-3])
    return cv


def soil(seed, wet=False, tilled=True):
    cv = Canvas(TW, TH)
    s = ramp("soil_wet" if wet else "soil")
    nz = Noise(seed)
    for y in range(TH):
        for x in range(TW):
            if not diamond(x, y):
                continue
            u, v = tile_uv(x, y)
            n = tiled_noise(nz, u, v, 2.0)
            base = 3 if not wet else 3
            t = base + (1 if n > 0.6 else 0) - (1 if n < 0.36 else 0)
            if tilled:
                # furrows along the grid's X axis: ridges lit on their upper side
                k = v % 12
                if k < 2:
                    t = base - 2
                elif k < 4:
                    t = base - 1
                elif k > 9:
                    t = base + 1
            cv.put(x, y, s[max(0, min(len(s) - 1, t))])
            # little clods
            if (int(u * 7) * 31 + int(v * 7) * 17) % 97 == 0:
                cv.put(x, y, s[min(len(s) - 1, t + 2)])
    # a soft dark border so tilled plots read as dug in
    for y in range(TH):
        for x in range(TW):
            if diamond(x, y) and not (diamond(x - 2, y) and diamond(x + 2, y) and diamond(x, y - 1) and diamond(x, y + 1)):
                cv.put(x, y, s[max(0, 1)])
    return cv


def path(seed, kind="tanah"):
    """'tanah' packed dirt, 'batu' stepping-stone path."""
    cv = Canvas(TW, TH)
    nz = Noise(seed)
    d = ramp("dirt")
    for y in range(TH):
        for x in range(TW):
            if not diamond(x, y):
                continue
            u, v = tile_uv(x, y)
            n = tiled_noise(nz, u, v, 1.6)
            t = 4 + (1 if n > 0.6 else 0) - (1 if n < 0.35 else 0)
            cv.put(x, y, d[t])
    if kind == "batu":
        st = ramp("stone_warm")
        rnd = random.Random(seed)
        centres = [(12, 14), (36, 34)]
        for (cu, cvv) in centres:
            ru, rv = rnd.uniform(9, 10.5), rnd.uniform(8, 9.5)
            for y in range(TH):
                for x in range(TW):
                    if not diamond(x, y):
                        continue
                    u, v = tile_uv(x, y)
                    du = (u - cu + 24) % 48 - 24
                    dv = (v - cvv + 24) % 48 - 24
                    r = (du / ru) ** 2 + (dv / rv) ** 2
                    if r <= 1:
                        t = 5 if du + dv < -3 else (3 if du + dv > 3 else 4)
                        if r > 0.75:
                            t = 2 if du + dv > 0 else 6
                        cv.put(x, y, st[t])
    else:
        rnd = random.Random(seed)
        for k in range(18):
            x, y = rnd.randint(8, TW - 9), rnd.randint(6, TH - 7)
            if diamond(x, y):
                cv.put(x, y, ramp("stone_warm")[5])
                cv.put(x + 1, y + 1, ramp("stone_warm")[2])
    return cv
