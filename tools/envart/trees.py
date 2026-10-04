"""Trees, chibi style: broadleaf (mangga, hutan, jati, kemarau), kelapa, pisang,
saplings and stumps.

A broadleaf tree is a short chunky trunk under a big round crown made of a
handful of large puffs (see toon.puffs): one light side for the whole crown,
a deep rim under each puff so they separate, and a few leaf ticks instead of
noise. Fruit is big and round with a shine.
"""
import math
import random

import pix
from pix import Canvas, toon
import toon as T
from toon import DEEP, SHADOW, MID, LIGHT, HI


# crown layouts: (u, v, radius fraction, z) in crown units; z higher = in front
CROWN = {
    "round": [(0.0, -0.52, 0.50, 0), (-0.56, -0.24, 0.44, 1), (0.56, -0.28, 0.44, 1),
              (-0.64, 0.26, 0.40, 2), (0.62, 0.22, 0.42, 2), (0.0, 0.02, 0.56, 3),
              (-0.32, 0.50, 0.40, 4), (0.34, 0.48, 0.40, 4)],
    "wide": [(-0.25, -0.55, 0.44, 0), (0.3, -0.55, 0.42, 0), (-0.68, -0.15, 0.40, 1), (0.7, -0.18, 0.40, 1),
             (-0.75, 0.32, 0.34, 2), (0.76, 0.3, 0.34, 2), (0.0, -0.05, 0.54, 3),
             (-0.4, 0.45, 0.40, 4), (0.42, 0.46, 0.38, 4)],
    "tall": [(0.0, -0.66, 0.42, 0), (-0.42, -0.32, 0.42, 1), (0.44, -0.36, 0.40, 1),
             (-0.5, 0.2, 0.42, 2), (0.5, 0.18, 0.42, 2), (0.0, -0.08, 0.50, 3), (0.0, 0.48, 0.44, 4)],
    "small": [(0.0, -0.45, 0.55, 0), (-0.5, 0.05, 0.5, 1), (0.52, 0.02, 0.5, 1), (0.0, 0.3, 0.58, 2)],
}


def crown(cv, ccx, ccy, rx, ry, pal, seed, layout="round", depth=0.0, jitter=0.06, **kw):
    rnd = random.Random(seed)
    s = (rx + ry) / 2
    items = []
    for (u, v, f, z) in CROWN[layout]:
        u += rnd.uniform(-jitter, jitter)
        v += rnd.uniform(-jitter, jitter)
        f *= 1 + rnd.uniform(-jitter, jitter)
        items.append((ccx + u * rx, ccy + v * ry, f * s, z))
    return T.puffs(cv, items, pal, center=(ccx, ccy + ry * 0.05), radii=(rx * 1.05, ry * 1.05),
                   seed=seed, depth=depth, **kw)


def bark_marks(seed, x_c, h, w):
    """A few short vertical bark lines and one knot, as a marks() callback."""
    rnd = random.Random(seed)
    P = pix.PIXEL
    lines = []
    for _ in range(max(2, int(h / 14))):
        s = rnd.uniform(-0.15, 0.45)
        y0 = rnd.uniform(0.15, 0.8) * h
        lines.append((s, y0, y0 + rnd.uniform(3, 5) * P))

    def f(x, y, s, i):
        for (ls, a, b) in lines:
            if a <= i <= b and abs(s - ls) < P / (w / 2 + 0.01) * 0.6:
                return SHADOW if s < 0.38 else DEEP
        return None
    return f


def roots(cv, bx, by, w, pal, depth=0.0):
    """Two stubby root nubs at the base of a trunk."""
    P = pix.PIXEL
    for side in (-1, 1):
        cx = bx + side * (w / 2 + P)
        cells = T.ellipse_cells(cx, by - P, 3.2 * P, 1.8 * P)
        for (x, y), (dx, dy) in cells.items():
            b = (LIGHT if side < 0 else MID) if dy < 0 else (MID if side < 0 else SHADOW)
            if T.lower_right_edge(cells, x, y) and dy > 0:
                b = DEEP if side > 0 else SHADOW
            cv.put(x, y, pal[b], depth)


def shade_below(cv, x0, x1, y_from, crown_cols, pal, k):
    """The crown darkens the trunk just under it by one band."""
    P = pix.PIXEL
    idx = {c: i for i, c in enumerate(pal)}
    for x in T.blocks(x0, x1):
        seen = None
        for y in range(int(y_from) - int(y_from) % P, cv.h, P):
            c = cv.get(x, y)
            if c is None:
                continue
            if c in crown_cols:
                seen = y
            elif c in idx and seen is not None and y - seen <= k * P:
                cv.put(x, y, pal[max(DEEP, idx[c] - 1)])


def fruit(cv, x, y, pal, stalk, rx=None, ry=None, depth=100.0):
    P = pix.PIXEL
    rx = rx or 3 * P
    ry = ry or 3.5 * P
    cv.put(x, y - ry - P / 2, stalk, depth)
    T.ball(cv, x, y, rx, ry, pal, depth=depth)


def place_fruit(cv, drawn, n, pal, stalk, seed, rx=None, ry=None):
    rnd = random.Random(seed)
    front = sorted(drawn, key=lambda d: -d[3])[:5]
    spots = []
    tries = 0
    while len(spots) < n and tries < 400:
        tries += 1
        cx, cy, r, z, cells = rnd.choice(front)
        a = rnd.uniform(-0.2, math.pi + 0.2)
        d = rnd.uniform(0.25, 0.75)
        x, y = cx + math.cos(a) * r * d, cy + math.sin(a) * r * 0.85 * d
        if any(math.hypot(x - sx, y - sy) < 6 * pix.PIXEL for sx, sy in spots):
            continue
        spots.append((x, y))
    for x, y in sorted(spots, key=lambda p: p[1]):
        fruit(cv, x, y, pal, stalk, rx, ry)


# ----------------------------------------------------------------- trees
KINDS = {
    #          leaf          bark         layout   trunk h, w0, w1   crown rx, ry
    "mangga": ("leaf", "bark", "round", 38, 22, 16, 60, 50),
    "hutan": ("leaf_dark", "bark", "wide", 44, 24, 18, 66, 52),
    "jati": ("leaf_olive", "bark_grey", "tall", 56, 18, 13, 50, 60),
    "kemarau": ("leaf_yellow", "bark", "round", 40, 22, 16, 58, 48),
}


def broadleaf(seed, *, kind="mangga", w=152, h=184, fruit=False):
    cv = Canvas(w, h)
    leaf, bark, layout, th, w0, w1, rx, ry = KINDS[kind]
    lp, bp = toon(leaf), toon(bark)
    bx, by = w // 2, h - 8
    ccx, ccy = bx, by - th - ry * 0.78
    T.cylinder(cv, bx, by, ccy + ry * 0.2, w0, w1, bp, flare=7, flare_h=9,
               marks=bark_marks(seed, bx, th, w0))
    roots(cv, bx, by, w0, bp)
    drawn = crown(cv, ccx, ccy, rx, ry, lp, seed, layout, depth=10)
    shade_below(cv, bx - w0, bx + w0, ccy, set(lp), bp, 3)
    if fruit:
        place_fruit(cv, drawn, 7, toon("orange"), bp[SHADOW], seed + 5)
    return cv, (bx, by)


def palm(seed, w=160, h=212, coconuts=True):
    """Pohon kelapa: a short curved ringed trunk and a crown of fat fronds."""
    P = pix.PIXEL
    cv = Canvas(w, h)
    rnd = random.Random(seed)
    bp, lp = toon("palm_bark"), toon("palm")
    bx, by = w // 2 - 12, h - 8
    H = 112

    def bend(i):
        return 24 * (i / H) ** 1.7

    def rings(x, y, s, i):
        k = (i // P) % 5
        if k == 0:
            return SHADOW if s < 0.38 else DEEP
        if k == 1 and s < 0.0:
            return HI
        return None
    T.cylinder(cv, bx, by, by - H, 18, 13, bp, flare=6, flare_h=8, bend=bend, marks=rings)
    tx, ty = bx + bend(H), by - H
    angles = [205, 250, 290, 335, 160, 25, 125, 60]
    fr = []
    for a in angles:
        ang = math.radians(a + rnd.uniform(-7, 7))
        layer = 0 if math.sin(ang) < -0.3 else (1 if math.sin(ang) < 0.35 else 2)
        fr.append((layer, ang, rnd.uniform(64, 72)))
    fr.sort(key=lambda f: f[0])
    for layer, ang, L in fr:
        frond(cv, tx, ty, ang, L, lp, layer)
    if coconuts:
        cp = toon("coconut")
        for dx, dy in ((-8, 6), (7, 5), (-1, 11)):
            T.ball(cv, tx + dx, ty + dy, 7.5, 7.5, cp)
    return cv, (bx, by)


def frond(cv, x0, y0, ang, L, pal, layer):
    """A palm frond: a fat arching blade with a zig-zag (leaflet) lower edge."""
    dx, dy = math.cos(ang), math.sin(ang) * 0.55
    spine = []
    for i in range(int(L)):
        t = i / L
        spine.append((x0 + dx * i, y0 + dy * i - 10 * math.sin(t * math.pi * 0.8) + 26 * t ** 3, t))
    dim = [-1, 0, 0][layer]
    for j in range(1, len(spine) - 1):
        x, y, t = spine[j]
        nx, ny = spine[j + 1][0] - x, spine[j + 1][1] - y
        d = math.hypot(nx, ny) or 1
        nx, ny = nx / d, ny / d
        wid = 11 * math.sin(min(1.0, t * 1.1 + 0.1) * math.pi) ** 0.7 + 1.5
        tooth = ((j // 3) % 2)                  # leaflet notches along the edge
        for side in (-1, 1):
            px, py = -ny * side, nx * side
            hang = py > 0 or (abs(py) < 0.15 and side > 0)
            ln = wid * (1.0 if hang else 0.55) * (0.72 + 0.28 * tooth if hang else 1.0)
            s = 0.0
            while s <= ln:
                X, Y = x + px * s, y + py * s + s * 0.25
                if hang:
                    b = MID if s < ln * 0.55 else SHADOW
                else:
                    b = LIGHT
                if s > ln - 1.2 and hang:
                    b = DEEP if b == SHADOW else SHADOW
                cv.put(X, Y, pal[max(DEEP, b + dim)])
                s += 0.7
        if 0.04 < t < 0.9:
            cv.put(x, y, pal[min(HI, LIGHT + 1 + dim)])


def banana(seed, w=128, h=172):
    """Pohon pisang: a soft chubby stem, big paddle leaves, one green bunch."""
    P = pix.PIXEL
    cv = Canvas(w, h)
    rnd = random.Random(seed)
    sp = toon("banana")
    bx, by = w // 2, h - 8
    SH = 58

    def sheath(x, y, s, i):
        if (i // P) % 8 == 0 and s < 0.3:
            return MID
        return None
    T.cylinder(cv, bx, by, by - SH, 16, 12, sp, flare=4, flare_h=6, marks=sheath)
    top = (bx, by - SH)
    # back leaves first (darker), then the front ones
    leaves = [(-100, 50, 0), (-76, 50, 0), (-128, 52, 1), (-50, 54, 1), (-162, 46, 2), (-16, 48, 2)]
    for a, L, layer in leaves:
        paddle(cv, top[0], top[1] + 2, math.radians(a + rnd.uniform(-5, 5)), L, sp, rnd, layer)
    # the bunch hangs on the right with the purple heart under it
    fp = toon("banana_fruit")
    hx, hy = top[0] + 11, top[1] + 16
    cv.line(top[0] + 2, top[1] + 2, hx, hy, sp[SHADOW])
    bunch(cv, hx, hy, fp)
    T.ball(cv, hx + 1, hy + 18, 4, 6, toon("purple"))
    return cv, (bx, by)


def bunch(cv, cx, cy, pal):
    """A hanging bunch of green bananas: rows of upturned fingers."""
    P = pix.PIXEL
    rx, ry = 8, 10
    cells = T.ellipse_cells(cx, cy, rx, ry)
    for (x, y), (dx, dy) in cells.items():
        l = float(T._n([dx, dy, math.sqrt(max(0, 1 - dx * dx - dy * dy)) + 0.1]) @ T.LIGHT3)
        b = T.band(l)
        ry_ = int(y + P / 2 - (cy - ry)) // (3 * P)          # row of fingers
        k = int(x + P / 2 - (cx - rx) + (ry_ % 2) * P) // (2 * P)
        row_end = (int(y + P / 2 - (cy - ry)) % (3 * P)) >= 2 * P
        if row_end:
            b = DEEP if k % 2 else SHADOW
        elif (int(x + P / 2 - (cx - rx) + (ry_ % 2) * P) % (2 * P)) >= P and b > SHADOW:
            b -= 1
        cv.put(x, y, pal[b], 200)


def paddle(cv, x0, y0, ang, L, pal, rnd, layer):
    """A banana leaf: a long rounded blade that rises, then droops at the tip."""
    spine = []
    x, y = x0, y0
    down = math.pi / 2 if math.cos(ang) >= 0 else -1.5 * math.pi   # bend the short way round
    for i in range(int(L)):
        t = i / L
        a = ang + (down - ang) * (t ** 1.8) * (0.22 + 0.6 * abs(math.cos(ang)))
        spine.append((x, y, t))
        x += math.cos(a)
        y += math.sin(a) * 0.9
    dim = [-1, 0, 0][layer]
    tear = int(rnd.uniform(0.5, 0.75) * len(spine))
    for j in range(len(spine) - 1):
        x, y, t = spine[j]
        nx, ny = spine[j + 1][0] - x, spine[j + 1][1] - y
        d = math.hypot(nx, ny) or 1
        nx, ny = nx / d, ny / d
        px, py = -ny, nx
        wid = 8.5 * math.sin(min(1.0, t * 0.95 + 0.06) * math.pi) ** 0.5 + 0.5
        s = -wid
        while s <= wid:
            upper = (py * s) < 0 or (abs(py) < 0.1 and s < 0)
            if abs(j - tear) <= 1 and not upper and abs(s) > 3:
                s += 0.5
                continue
            X, Y = x + px * s, y + py * s
            b = LIGHT if upper else MID
            if abs(s) > wid - 1.6:
                b = SHADOW if upper else DEEP
            cv.put(X, Y, pal[max(DEEP, b + dim)])
            s += 0.5
        if t < 0.9:
            cv.put(x, y, pal[min(HI, HI + dim)])


def sapling(seed, stage):
    """Young tree stages: 0 seedling, 1 sapling, 2 young tree."""
    P = pix.PIXEL
    sizes = [(32, 32), (52, 64), (92, 116)]
    w, h = sizes[stage]
    cv = Canvas(w, h)
    bx, by = w // 2, h - 6
    bp, lp = toon("bark"), toon("leaf")
    if stage == 0:
        for i in range(0, 6 * P, P):
            cv.put(bx, by - i, lp[MID])
        for side in (-1, 1):
            T.ball(cv, bx + side * 3.2 * P, by - 6 * P, 3 * P, 1.9 * P, lp, spot=False)
        cv.put(bx, by - 7 * P, lp[LIGHT])
    elif stage == 1:
        T.cylinder(cv, bx, by, by - 30, 6, 5, bp)
        T.puffs(cv, [(bx - 7, by - 34, 9, 0), (bx + 7, by - 36, 9, 0), (bx, by - 44, 10, 1)], lp,
                center=(bx, by - 38), radii=(16, 14), seed=seed, depth=10, ticks=False)
    else:
        T.cylinder(cv, bx, by, by - 52, 12, 9, bp, flare=3, marks=bark_marks(seed, bx, 40, 12))
        roots(cv, bx, by, 10, bp)
        crown(cv, bx, by - 70, 30, 27, lp, seed, "small", depth=10)
        shade_below(cv, bx - 8, bx + 8, by - 70, set(lp), bp, 2)
    return cv, (bx, by)


def stump(seed, w=52, h=44, big=False):
    """Tunggul: a cut stump with growth rings on top (the big one has a sprout)."""
    if big:
        w, h = 84, 64
    cv = Canvas(w, h)
    bp, wp = toon("bark"), toon("wood_cut")
    bx, by = w // 2, h - 8
    rw = 34 if big else 20
    th = 18 if big else 12
    T.cylinder(cv, bx, by, by - th, rw, rw, bp, flare=7 if big else 4, flare_h=7,
               marks=bark_marks(seed, bx, th + 6, rw))
    roots(cv, bx, by, rw + 2, bp)
    cx, cy = bx, by - th
    rx, ry = rw / 2 + 0.5, rw / 4 + 1
    T.ellipse_top(cv, cx, cy, rx, ry, wp, rings=2 if big else 1, inner=(LIGHT, MID),
                  rim_lit=HI, rim_dark=SHADOW)
    # one little crack
    cv.line(cx, cy, cx + rx * 0.5, cy + ry * 0.4, wp[SHADOW])
    if big:
        lp = toon("leaf")
        sx, sy = bx - rw / 2 + 4, by - th + 6
        cv.put(sx, sy - 2, lp[MID])
        cv.put(sx, sy - 4, lp[MID])
        T.ball(cv, sx - 3, sy - 6, 2.8, 2, lp, spot=False)
        T.ball(cv, sx + 3, sy - 7, 2.8, 2, lp, spot=False)
    return cv, (bx, by)
