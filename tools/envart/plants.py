"""Field crops (5 growth stages each), chibi style.

Plants are built from a few fat, simple parts: round leaf puffs (toon.puffs),
lens-shaped leaves with a light upper half, strap leaves, and big round fruit
with a shine. Every frame is CROP_W x CROP_H with the plant's foot at CROP_PIVOT.
"""
import math
import random

import pix
from pix import Canvas, toon
import toon as T
from toon import DEEP, SHADOW, MID, LIGHT, HI

CROP_W, CROP_H = 64, 80
CROP_PIVOT = (32, 72)


# ------------------------------------------------------------ primitives
def spine_path(x, y, ang, L, bend=0.0, droop=0.0, step=1.0):
    """Points along a curving rib: `bend` turns it (radians over its length),
    `droop` pulls the tip down."""
    pts = []
    for i in range(int(L / step) + 1):
        t = i / max(1, L / step)
        pts.append((x, y, t))
        a = ang + bend * t
        x += math.cos(a) * step
        y += math.sin(a) * step + droop * t * 2 * step
    return pts


def blade(cv, pts, W, pal, *, dim=0, round_tip=0.6, rib=True, depth=None, edge=True):
    """A leaf along a rib: lit upper half, mid lower half, darker rim, light rib.
    W is the half width at the widest point; the outline is a rounded lens."""
    for j in range(len(pts) - 1):
        x, y, t = pts[j]
        nx, ny = pts[j + 1][0] - x, pts[j + 1][1] - y
        d = math.hypot(nx, ny) or 1
        nx, ny = nx / d, ny / d
        px, py = -ny, nx
        w = W * math.sin(min(1.0, t * 0.97 + 0.03) * math.pi) ** round_tip + 0.4
        s = -w
        while s <= w + 0.01:
            upper = (py * s) < 0 or (abs(py) < 0.12 and px * s < 0)
            b = LIGHT if upper else MID
            if edge and abs(s) > w - 1.4:
                b = MID if upper else SHADOW
            cv.put(x + px * s, y + py * s, pal[max(DEEP, min(HI, b + dim))], depth)
            s += 0.5
    if rib:
        for (x, y, t) in pts[1:int(len(pts) * 0.8)]:
            cv.put(x, y, pal[max(DEEP, min(HI, HI + dim))], depth)


def leaf(cv, x, y, ang, L, W, pal, *, bend=0.0, droop=0.0, dim=0, rib=True, depth=None):
    pts = spine_path(x, y, ang, L, bend, droop)
    blade(cv, pts, W, pal, dim=dim, rib=rib, depth=depth)
    return pts


def strap(cv, x, y, ang, L, W, pal, *, bend=0.0, droop=0.0, dim=0, depth=None):
    """A long strap leaf (corn, rice): even width, pointed tip, light top edge."""
    pts = spine_path(x, y, ang, L, bend, droop)
    for j in range(len(pts) - 1):
        px_, py_, t = pts[j]
        nx, ny = pts[j + 1][0] - px_, pts[j + 1][1] - py_
        d = math.hypot(nx, ny) or 1
        nx, ny = nx / d, ny / d
        qx, qy = -ny, nx
        w = W * (1 - t ** 3)
        s = -w
        while s <= w + 0.01:
            upper = (qy * s) < 0 or (abs(qy) < 0.12 and qx * s < 0)
            b = LIGHT if upper else MID
            if abs(s) > w - 1.2 and not upper:
                b = SHADOW
            cv.put(px_ + qx * s, py_ + qy * s, pal[max(DEEP, min(HI, b + dim))], depth)
            s += 0.5
    return pts


def stalk(cv, x, y0, y1, pal, w=2):
    """A thin upright stem: 1 art pixel lit, 1 shaded."""
    P = pix.PIXEL
    for y in T.blocks(y1, y0):
        if y >= y0:
            break
        cv.put(x, y, pal[LIGHT])
        if w > 1:
            cv.put(x + P, y, pal[SHADOW])


def mound(cv, cx, cy, seed_pal=None, seed=1, w=24):
    """The little raised soil hill a seed is planted in, with seeds peeking out."""
    sp = toon("soil")
    T.ball(cv, cx, cy, w / 2, 5, sp, spot=False, flat=0.3, th=dict(hi=2, light=0.45, mid=0.05))
    if seed_pal is not None:
        for dx, dy in ((-7, -1), (-1, -3), (6, -1)):
            cv.put(cx + dx, cy + dy, seed_pal[MID])


def sprout(cv, bx, by, pal, h=8, L=9, W=3.4):
    """Two round baby leaves in a V on a short stem."""
    P = pix.PIXEL
    stalk(cv, bx, by, by - h, pal, w=1)
    leaf(cv, bx, by - h, -2.55, L, W, pal, droop=0.1, dim=0, rib=False)
    leaf(cv, bx + P, by - h, -0.6, L, W, pal, droop=0.1, dim=-1, rib=False)


def bush(cv, bx, by, w, h, pal, seed, n=4, depth=0.0, ticks=True):
    """A round leafy plant body made of a few puffs."""
    rnd = random.Random(seed)
    cx, cy = bx, by - h / 2
    items = []
    lay = {3: [(-0.45, 0.2, 0.55, 0), (0.45, 0.15, 0.55, 0), (0.0, -0.25, 0.62, 1)],
           4: [(-0.5, 0.15, 0.5, 0), (0.5, 0.1, 0.5, 0), (0.0, -0.35, 0.55, 1), (0.0, 0.25, 0.55, 2)],
           5: [(-0.55, 0.0, 0.48, 0), (0.55, -0.05, 0.48, 0), (-0.2, -0.45, 0.5, 1), (0.3, -0.4, 0.46, 1),
               (0.0, 0.25, 0.56, 2)]}[n]
    s = (w + h) / 4
    for (u, v, f, z) in lay:
        items.append((cx + u * w / 2 + rnd.uniform(-1, 1), cy + v * h / 2 + rnd.uniform(-1, 1),
                      f * s * (1 + rnd.uniform(-0.06, 0.06)), z))
    return T.puffs(cv, items, pal, center=(cx, cy), radii=(w / 2, h / 2), seed=seed, depth=depth,
                   ticks=ticks)


def flower(cv, x, y, pal, center=None, depth=200.0):
    """A small 4-petal flower (a plus of petals around a yellow eye)."""
    P = pix.PIXEL
    center = center or toon("yellow")
    for dx, dy, b in ((0, -1, HI), (-1, 0, LIGHT), (1, 0, MID), (0, 1, MID)):
        cv.put(x + dx * P, y + dy * P, pal[b], depth)
    cv.put(x, y, center[LIGHT] if pal is not center else toon("orange")[MID], depth)


def calyx(cv, x, y, pal, depth=300.0):
    """The little green star on top of a tomato / eggplant."""
    P = pix.PIXEL
    for dx, dy, b in ((0, -1, LIGHT), (-1, 0, MID), (1, 0, SHADOW), (0, 0, MID)):
        cv.put(x + dx * P, y + dy * P, pal[b], depth)


def crop_canvas():
    return Canvas(CROP_W, CROP_H)


# ------------------------------------------------------------ crops
def crop_padi(stage, seed=1):
    P = pix.PIXEL
    cv = crop_canvas()
    rnd = random.Random(seed)
    bx, by = CROP_PIVOT
    gp, st = toon("rice_green"), toon("straw")
    if stage == 0:
        mound(cv, bx, by - 3, st, seed)
        return cv
    gold = stage == 4
    pal = st if gold else gp
    n = [0, 3, 5, 7, 7][stage]
    H = [0, 14, 26, 38, 36][stage]
    blades = []
    for i in range(n):
        side = (i - (n - 1) / 2) / max(1, (n - 1) / 2)
        a = -math.pi / 2 + side * 0.55 + rnd.uniform(-0.06, 0.06)
        blades.append((abs(side), a, H * (1 - 0.25 * abs(side)) * rnd.uniform(0.9, 1.05), side))
    blades.sort(key=lambda b: -b[0])
    for _, a, L, side in blades:
        strap(cv, bx + side * 3, by, a, L, 2.4, pal, bend=side * 0.7, dim=-1 if abs(side) > 0.6 else 0)
    if stage >= 3:
        # grain heads: chains of round grains arching over and hanging
        hp = st if gold else toon("corn_husk")
        for k, side in enumerate((-1, 0.2, 1)):
            x, y = bx + side * 5, by - H * 0.75
            a = -math.pi / 2 + side * 0.4
            sag = 2.6 if gold else 1.6
            pts = spine_path(x, y, a, 18 if gold else 14, bend=sag * (1 if side >= 0 else -1))
            for j, (px, py, t) in enumerate(pts):
                if j % (2 * P) == 0 and t > 0.2:
                    T.ball(cv, px, py, 2.6, 2.6, hp, spot=False, depth=100 + j)
                else:
                    cv.put(px, py, hp[MID], 50)
    return cv


def crop_jagung(stage, seed=2):
    P = pix.PIXEL
    cv = crop_canvas()
    rnd = random.Random(seed)
    bx, by = CROP_PIVOT
    g = toon("leaf")
    if stage == 0:
        mound(cv, bx, by - 3, toon("corn"), seed)
        return cv
    if stage == 1:
        strap(cv, bx, by, -2.1, 14, 2.6, g, bend=-0.6)
        strap(cv, bx + P, by, -1.0, 13, 2.6, g, bend=0.6, dim=-1)
        return cv
    H = [0, 0, 24, 54, 56][stage]
    stalk(cv, bx, by, by - H, g, w=2)
    k_n = [0, 0, 3, 5, 5][stage]
    for k in range(k_n):
        yy = by - 4 - k * (H - 10) / k_n
        side = -1 if k % 2 == 0 else 1
        a = -math.pi / 2 + side * 1.0
        strap(cv, bx + (P if side > 0 else 0), yy, a, 20 + rnd.randint(-2, 3), 2.8, g,
              bend=side * 1.5, dim=0 if side < 0 else -1)
    if stage >= 3:
        # tassel on top
        tp = toon("straw")
        tx, ty = bx, by - H
        for k in (-2, -1, 0, 1, 2):
            pts = spine_path(tx, ty, -math.pi / 2 + k * 0.42, 9, bend=k * 0.5)
            for (x, y, t) in pts:
                cv.put(x, y, tp[LIGHT if k <= 0 else MID])
        # a fat cob in its husk on the stalk
        hp, cp = toon("corn_husk"), toon("corn")
        cx, cy = bx + 6, by - H * 0.5
        cells = T.ellipse_cells(cx, cy, 4.5, 9)
        for (x, y), (dx, dy) in cells.items():
            b = LIGHT if dx < -0.25 else (MID if dx < 0.4 else SHADOW)
            if T.lower_right_edge(cells, x, y) and dx > 0:
                b = DEEP
            col = hp[b]
            if stage == 4 and -0.45 < dx < 0.35 and dy < 0.3:
                col = cp[HI if (x // P + y // P) % 2 else LIGHT]      # kernels peek out
            cv.put(x, y, col, 100)
        silk = toon("orange") if stage == 4 else toon("straw")
        for i in range(3):
            cv.put(cx + P * (i > 0), cy - 10 - i * P, silk[MID], 100)
    return cv


def crop_cabai(stage, seed=3):
    cv = crop_canvas()
    bx, by = CROP_PIVOT
    g = toon("leaf")
    if stage == 0:
        mound(cv, bx, by - 3, toon("straw"), seed)
        return cv
    if stage == 1:
        sprout(cv, bx, by, g)
        return cv
    w, h = [0, 0, (26, 20), (36, 30), (38, 32)][stage]
    stalk(cv, bx, by, by - 6, toon("leaf"), w=2)
    bush(cv, bx, by - 4, w, h, g, seed, n=3 if stage == 2 else 5)
    if stage == 3:
        for (dx, dy) in ((-9, -14), (7, -22), (10, -10), (-3, -26)):
            flower(cv, bx + dx, by - 4 + dy, toon("white"))
    if stage == 4:
        red = toon("red")
        for (dx, dy, lean) in ((-11, -16, -0.2), (-2, -24, 0.1), (8, -18, 0.25), (12, -8, 0.3), (-6, -6, -0.1)):
            chili(cv, bx + dx, by - 4 + dy, red, g, lean)
    return cv


def chili(cv, x, y, pal, green, lean=0.0):
    """A fat curved chili hanging from a green cap."""
    P = pix.PIXEL
    cv.put(x, y - P, green[MID], 300)
    for i in range(5):
        xx = x + lean * i * P + (P if i == 4 else 0) * (1 if lean >= 0 else -1)
        yy = y + i * P
        cv.put(xx - P, yy, pal[LIGHT if i < 3 else MID], 300) if i < 3 else None
        cv.put(xx, yy, pal[MID if i < 3 else SHADOW], 300)
        if i < 4:
            cv.put(xx + P, yy, pal[SHADOW if i < 3 else DEEP], 300)
    cv.put(x - P, y, pal[HI], 300)
    cv.put(x, y - P, green[LIGHT], 300)


def crop_tomat(stage, seed=4):
    P = pix.PIXEL
    cv = crop_canvas()
    bx, by = CROP_PIVOT
    g = toon("leaf_dark")
    if stage == 0:
        mound(cv, bx, by - 3, toon("yellow"), seed)
        return cv
    if stage == 1:
        sprout(cv, bx, by, toon("leaf"), h=9)
        return cv
    # a bamboo stake (ajir) behind the plant
    bam = toon("bamboo")
    H = [0, 0, 30, 48, 50][stage]
    T.cylinder(cv, bx + 4, by, by - H - 4, 4, 4, bam, depth=-50,
               marks=lambda x, y, s, i: SHADOW if (i // P) % 6 == 0 else None)
    w, h = [0, 0, (24, 24), (36, 42), (38, 44)][stage]
    bush(cv, bx, by - 2, w, h, g, seed, n=3 if stage == 2 else 5)
    if stage == 3:
        for (dx, dy) in ((-9, -18), (8, -30), (9, -12), (-4, -34)):
            flower(cv, bx + dx, by - 2 + dy, toon("yellow"))
    if stage == 4:
        tp = toon("tomato")
        for k, (dx, dy) in enumerate(((-9, -14), (8, -24), (-3, -32), (10, -9), (-1, -20))):
            pal = tp if k != 2 else toon("orange")
            T.ball(cv, bx + dx, by - 2 + dy, 5, 4.6, pal, depth=300 + k)
            calyx(cv, bx + dx, by - 2 + dy - 4, toon("leaf"), depth=310 + k)
    return cv


def crop_terong(stage, seed=5):
    P = pix.PIXEL
    cv = crop_canvas()
    bx, by = CROP_PIVOT
    g = toon("leaf_dark")
    if stage == 0:
        mound(cv, bx, by - 3, toon("straw"), seed)
        return cv
    if stage == 1:
        sprout(cv, bx, by, g, L=10, W=4)
        return cv
    stalk(cv, bx, by, by - 8, toon("leaf"), w=2)
    # broad leaves fanned out, then the round body
    L = [0, 0, 12, 16, 16][stage]
    for a, dim in ((-2.7, -1), (-0.45, -1), (-2.1, 0), (-1.05, 0)):
        leaf(cv, bx, by - 8, a, L, 5, g, droop=0.25, dim=dim)
    if stage >= 3:
        bush(cv, bx, by - 6, 28, 22, g, seed, n=3)
    if stage == 3:
        for (dx, dy) in ((-8, -18), (7, -22), (2, -12)):
            flower(cv, bx + dx, by + dy, toon("purple"), toon("yellow"))
    if stage == 4:
        pp, lp = toon("purple"), toon("leaf")
        for k, (dx, dy) in enumerate(((-10, -12), (9, -16), (0, -6))):
            x, y = bx + dx, by + dy
            cells = T.ellipse_cells(x, y + 5, 4.5, 7.5)
            T.ball(cv, x, y + 5, 4.5, 7.5, pp, depth=300 + k, cells=cells)
            calyx(cv, x, y - 2, lp, depth=310 + k)
            cv.put(x - P, y - P, lp[MID], 310 + k)
    return cv


def crop_semangka(stage, seed=6):
    cv = crop_canvas()
    bx, by = CROP_PIVOT
    g = toon("leaf")
    if stage == 0:
        mound(cv, bx, by - 3, toon("stone"), seed)
        return cv
    if stage == 1:
        sprout(cv, bx, by, g, h=6, L=9, W=4)
        return cv
    # a vine along the ground with round lobed leaves
    vines = [(-1, 22, 0.0), (1, 22, 1.0), (-1, 14, 2.0), (1, 15, 3.0)][: (2 if stage == 2 else 4)]
    spots = []
    for side, L, ph in vines:
        x, y = bx, by - 3
        for i in range(L):
            x += side * 0.95
            y += math.sin(i * 0.35 + ph) * 0.5 - (0.45 if L < 16 else 0)
            cv.put(x, y, g[SHADOW])
            if i in (8, 19) or (L < 16 and i == 12):
                spots.append((x, y - 4 - (i % 3) * 2))
    if stage == 2:
        spots.append((bx, by - 12))
    for (x, y) in sorted(spots, key=lambda p: p[1]):
        T.outlined(cv, lambda c, x=x, y=y: lobed(c, x, y, 8 if stage > 2 else 6.5, g))
    if stage == 3:
        flower(cv, bx + 9, by - 16, toon("yellow"))
        flower(cv, bx - 11, by - 12, toon("yellow"))
    if stage == 4:
        T.outlined(cv, lambda c: melon(c, bx + 3, by - 9, 15, 11))
    return cv


def lobed(cv, x, y, r, pal):
    """A round lobed leaf (melon / pumpkin type) seen from above."""
    P = pix.PIXEL
    cells = T.ellipse_cells(x, y, r, r * 0.85, edge=lambda a: 0.88 + 0.12 * math.cos(a * 5))
    for (xx, yy), (dx, dy) in cells.items():
        b = LIGHT if dx + dy < -0.2 else MID
        if T.lower_right_edge(cells, xx, yy) and dx + dy > -0.2:
            b = SHADOW
        cv.put(xx, yy, pal[b])
    for ang in (-2.4, -1.57, -0.7):
        for k in range(1, int(r * 0.7), P):
            cv.put(x + math.cos(ang) * k, y + math.sin(ang) * k * 0.8, pal[HI])


def melon(cv, cx, cy, rx, ry):
    P = pix.PIXEL
    mp = toon("watermelon")
    dark = (mp[DEEP], mp[SHADOW])
    cells = T.ellipse_cells(cx, cy, rx, ry)
    for (x, y), (dx, dy) in cells.items():
        l = float(T._n([dx, dy, math.sqrt(max(0, 1 - dx * dx - dy * dy)) + 0.05]) @ T.LIGHT3)
        b = T.band(l)
        b = max(MID, b)                       # a light body so the stripes show
        stripe = math.sin((dx * 2.4 + math.sin(dy * 2.6) * 0.3) * math.pi) > 0.35
        col = mp[b]
        if stripe:
            col = dark[1] if b >= LIGHT else dark[0]
        if T.lower_right_edge(cells, x, y) and dx + dy > 0:
            col = mp[DEEP]
        cv.put(x, y, col, 300)
    cv.put(cx - rx * 0.45, cy - ry * 0.5, mp[HI], 310)
    cv.put(cx - rx * 0.45 + P, cy - ry * 0.5, mp[HI], 310)


CROPS = {
    "padi": crop_padi,
    "jagung": crop_jagung,
    "cabai": crop_cabai,
    "tomat": crop_tomat,
    "terong": crop_terong,
    "semangka": crop_semangka,
}
STAGES = ["benih", "tunas", "muda", "dewasa", "panen"]
