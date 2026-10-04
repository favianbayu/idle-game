"""Ground tiles, 96 x 48 diamonds (the prototype's Iso.TILE_W x TILE_H).

Each tile is drawn so its edges match any neighbour of the same kind: texture
is a function of world position wrapped on the tile (no seams), and the
diamond's border pixels carry no outline.
"""
import math
import random

import pix
from pix import Canvas, toon
from toon import SHADOW, MID, LIGHT, HI

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


def patches(cv, col, rnd, n):
    """A few soft round patches kept inside the diamond, so neighbouring tiles
    of any variant meet on the plain base colour (no seams)."""
    for k in range(n):
        for _ in range(40):
            cx, cy = rnd.uniform(26, TW - 26), rnd.uniform(14, TH - 14)
            rx, ry = rnd.uniform(9, 14), rnd.uniform(4.5, 6.5)
            if all(diamond(int(cx + ex * rx * 1.25), int(cy + ey * ry * 1.25)) for ex, ey in ((-1, 0), (1, 0), (0, -1), (0, 1))):
                break
        else:
            continue
        ph = rnd.uniform(0, 6.3)
        for y in range(int(cy - ry - 2), int(cy + ry + 2)):
            for x in range(int(cx - rx - 2), int(cx + rx + 2)):
                dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
                a = math.atan2(dy, dx)
                if dx * dx + dy * dy <= (0.85 + 0.15 * math.sin(a * 3 + ph)) ** 2 and diamond(x, y):
                    cv.put(x, y, col)


def grass(seed, variant=0):
    """Soft grass: a flat base with a few big lighter patches and little
    'v' tufts (and tiny flowers on variant 2)."""
    P = pix.PIXEL
    cv = Canvas(TW, TH)
    g = toon("grass")
    rnd = random.Random(seed + variant * 7)
    for y in range(TH):
        for x in range(TW):
            if diamond(x, y):
                cv.put(x, y, g[MID])
    patches(cv, g[LIGHT], rnd, 2 if variant != 1 else 1)
    spots = []
    for k in range(80):
        if len(spots) >= 5 + variant:
            break
        x, y = rnd.randint(10, TW - 11), rnd.randint(6, TH - 7)
        if not (diamond(x - 6, y) and diamond(x + 6, y) and diamond(x, y - 4)):
            continue
        if any(abs(x - a) < 14 and abs(y - b) < 8 for a, b in spots):
            continue
        spots.append((x, y))
        lit = cv.get(x, y) == g[LIGHT]
        tip, base = (g[HI], g[MID]) if lit else (g[LIGHT], g[SHADOW])
        cv.put(x - P, y - P, tip)
        cv.put(x + P, y - P, tip)
        cv.put(x, y, base)
    if variant == 2:   # a few tiny flowers
        for k in range(3):
            x, y = rnd.randint(18, TW - 19), rnd.randint(12, TH - 13)
            if diamond(x - 4, y) and diamond(x + 4, y):
                c = toon(rnd.choice(["white", "yellow", "pink"]))
                for dx, dy, b in ((0, -P, HI), (-P, 0, LIGHT), (P, 0, MID), (0, P, MID)):
                    cv.put(x + dx, y + dy, c[b])
                cv.put(x, y, toon("yellow")[LIGHT] if c is not toon("yellow") else toon("orange")[MID])
    return cv


def soil(seed, wet=False, tilled=True):
    """Tilled soil: three round furrows per tile, lit on their upper slope."""
    cv = Canvas(TW, TH)
    s = toon("soil_wet" if wet else "soil")
    for y in range(TH):
        for x in range(TW):
            if not diamond(x, y):
                continue
            u, v = tile_uv(x, y)
            b = MID
            if tilled:
                k = v % 16
                b = SHADOW if k < 3 else (MID if k < 9 else (LIGHT if k < 14 else MID))
            cv.put(x, y, s[b])
    # a soft dark border so tilled plots read as dug in
    for y in range(TH):
        for x in range(TW):
            if diamond(x, y) and not (diamond(x - 2, y) and diamond(x + 2, y) and diamond(x, y - 1) and diamond(x, y + 1)):
                cv.put(x, y, s[SHADOW])
    return cv


def path(seed, kind="tanah"):
    """'tanah' packed dirt, 'batu' stepping-stone path."""
    P = pix.PIXEL
    cv = Canvas(TW, TH)
    d = toon("dirt")
    for y in range(TH):
        for x in range(TW):
            if diamond(x, y):
                cv.put(x, y, d[MID])
    st = toon("stone_warm")
    patches(cv, d[LIGHT], random.Random(seed + 3), 1 if kind == "batu" else 2)
    if kind == "batu":
        rnd = random.Random(seed)
        centres = [(12, 14), (36, 34)]
        for (cu, cvv) in centres:
            ru, rv = rnd.uniform(9.5, 10.5), rnd.uniform(8.5, 9.5)
            for y in range(TH):
                for x in range(TW):
                    if not diamond(x, y):
                        continue
                    u, v = tile_uv(x, y)
                    du = (u - cu + 24) % 48 - 24
                    dv = (v - cvv + 24) % 48 - 24
                    r = (du / ru) ** 2 + (dv / rv) ** 2
                    if r <= 1:
                        b = LIGHT if du + dv < -2 else MID
                        if r > 0.72:
                            b = SHADOW if du + dv > 0 else HI
                        cv.put(x, y, st[b])
    else:
        rnd = random.Random(seed)
        n = 0
        for k in range(40):
            if n >= 5:
                break
            x, y = rnd.randint(10, TW - 11), rnd.randint(8, TH - 9)
            if diamond(x - 4, y) and diamond(x + 4, y):
                cv.put(x, y, st[LIGHT])
                cv.put(x + P, y, st[SHADOW])
                n += 1
    return cv
