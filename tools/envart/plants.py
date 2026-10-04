"""Field crops (5 growth stages each), in a Stardew-Valley-like style.

Drawn at art resolution (see sv.asset): frames are CROP_W x CROP_H screen
pixels with the plant's foot at CROP_PIVOT. Leaves are small lens shapes with a
lit upper half, a darker lower half and a pale rib; leafy bodies use the leaf
stamps of sv.crown; fruit is round and shiny.
"""
import math
import random

from pix import Canvas
import sv
from sv import PAL, clamp

CROP_W, CROP_H = 64, 80
CROP_PIVOT = (32, 72)


# ------------------------------------------------------------ primitives (art px)
def spine_path(x, y, ang, L, bend=0.0, droop=0.0, step=0.5):
    pts = []
    for i in range(int(L / step) + 1):
        t = i / max(1, L / step)
        pts.append((x, y, t))
        a = ang + bend * t
        x += math.cos(a) * step
        y += math.sin(a) * step + droop * t * 2 * step
    return pts


def blade(cv, pts, W, pal_, *, base=4, rib=True, round_tip=0.6, depth=None):
    """A leaf along a rib: lit upper half, darker lower half, dark rim, pale rib."""
    for j in range(len(pts) - 1):
        x, y, t = pts[j]
        nx, ny = pts[j + 1][0] - x, pts[j + 1][1] - y
        d = math.hypot(nx, ny) or 1
        nx, ny = nx / d, ny / d
        px, py = -ny, nx
        w = W * math.sin(min(1.0, t * 0.97 + 0.03) * math.pi) ** round_tip + 0.3
        s = -w
        while s <= w + 0.01:
            upper = (py * s) < 0 or (abs(py) < 0.12 and px * s < 0)
            b = base + 1 if upper else base
            if abs(s) > w - 0.9:
                b = base - 1 if upper else base - 2
            cv.put(int(round(x + px * s)), int(round(y + py * s)), pal_[clamp(b, 1, 7)], depth)
            s += 0.5
    if rib:
        for (x, y, t) in pts[2:int(len(pts) * 0.8)]:
            cv.put(int(round(x)), int(round(y)), pal_[clamp(base + 2, 1, 7)], depth)


def leaf(cv, x, y, ang, L, W, pal_, *, bend=0.0, droop=0.0, base=4, rib=True, depth=None):
    pts = spine_path(x, y, ang, L, bend, droop)
    blade(cv, pts, W, pal_, base=base, rib=rib, depth=depth)
    return pts


def strap(cv, x, y, ang, L, W, pal_, *, bend=0.0, droop=0.0, base=4, depth=None):
    """A long strap leaf (corn, rice): even width, pointed tip, lit top edge."""
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
            b = base + 1 if upper else base - 1
            if t > 0.7:
                b += 1
            cv.put(int(round(px_ + qx * s)), int(round(py_ + qy * s)), pal_[clamp(b, 1, 7)], depth)
            s += 0.5
    return pts


def stem(cv, x, y0, y1, pal_, base=4):
    for y in range(int(y1), int(y0) + 1):
        cv.put(x, y, pal_[base])


def mound(cv, cx, cy, seed_pal=None):
    """A little raised soil hill with seeds peeking out."""
    sp = PAL["soil"]
    for y in range(-3, 2):
        for x in range(-6, 7):
            dx, dy = x / 6.5, (y + 0.5) / 2.6
            if dx * dx + dy * dy <= 1:
                t = 5 if dx + dy < -0.5 else (4 if dx + dy < 0.3 else 3)
                if dy > 0.5:
                    t = 2
                cv.put(cx + x, cy + y, sp[t])
    if seed_pal is not None:
        for dx, dy in ((-3, -2), (0, -3), (3, -2)):
            cv.put(cx + dx, cy + dy, seed_pal[6])


def sprout(cv, bx, by, pal_, h=4):
    stem(cv, bx, by, by - h, pal_)
    leaf(cv, bx, by - h, -2.6, 5, 1.8, pal_, droop=0.1, base=4, rib=False)
    leaf(cv, bx, by - h, -0.55, 5, 1.8, pal_, droop=0.1, base=3, rib=False)


def flower(cv, x, y, pal_, eye=None, depth=200):
    """A small 4-petal flower around a yellow eye."""
    eye = eye or PAL["yellow"]
    for dx, dy, t in ((0, -1, 7), (-1, 0, 6), (1, 0, 5), (0, 1, 4)):
        cv.put(x + dx, y + dy, pal_[t], depth)
    cv.put(x, y, eye[5] if pal_ is not eye else PAL["orange"][4], depth)


def bush(cv, cx, cy, rx, ry, pal_, seed, leaf_kind="oak"):
    """A small leafy body for a crop: a few blobs covered in leaf stamps."""
    blobs = [(cx, cy, rx, ry), (cx - rx * 0.55, cy + ry * 0.2, rx * 0.6, ry * 0.65),
             (cx + rx * 0.55, cy + ry * 0.15, rx * 0.6, ry * 0.65), (cx, cy - ry * 0.45, rx * 0.6, ry * 0.6)]
    return sv.crown(cv, blobs, pal_, seed, leaf=leaf_kind, spacing=(3, 2), jitter=0.5)


def crop(fn):
    """A crop stage drawn at art resolution, returned at screen size."""
    def wrap(stage, seed=None):
        with sv.artres() as P:
            cv = crop_canvas_P(P)
            bx, by = CROP_PIVOT[0] // P, CROP_PIVOT[1] // P
            fn(cv, stage, bx, by, random.Random(sum(map(ord, fn.__name__)) * 7 + stage))
        return sv.up(cv, P)
    wrap.__name__ = fn.__name__
    return wrap


def crop_canvas_P(P):
    return Canvas(CROP_W // P, CROP_H // P)


# ------------------------------------------------------------ crops
@crop
def crop_padi(cv, stage, bx, by, rnd):
    gp, st = PAL["grass"], PAL["straw"]
    if stage == 0:
        mound(cv, bx, by - 1, st)
        return
    gold = stage == 4
    pal_ = st if gold else gp
    n = [0, 3, 5, 7, 7][stage]
    H = [0, 7, 13, 19, 18][stage]
    blades = []
    for i in range(n):
        side = (i - (n - 1) / 2) / max(1, (n - 1) / 2)
        a = -math.pi / 2 + side * 0.5 + rnd.uniform(-0.06, 0.06)
        blades.append((abs(side), a, H * (1 - 0.25 * abs(side)) * rnd.uniform(0.9, 1.05), side))
    blades.sort(key=lambda b: -b[0])
    for _, a, L, side in blades:
        strap(cv, bx + side * 2, by, a, L, 0.9, pal_, bend=side * 0.7, base=4 if abs(side) < 0.6 else 3)
    if stage >= 3:
        hp = st if gold else PAL["husk"]
        for side in (-1, 0.2, 1):
            pts = spine_path(bx + side * 2, by - H * 0.75, -math.pi / 2 + side * 0.4, 9 if gold else 7,
                             bend=(2.6 if gold else 1.6) * (1 if side >= 0 else -1), step=1.0)
            for j, (px, py, t) in enumerate(pts):
                if t > 0.2:
                    cv.put(int(round(px)), int(round(py)), hp[5 if j % 2 else 4], 100 + j)
                    cv.put(int(round(px)) + 1, int(round(py)), hp[3], 100 + j)
                    if j % 2 == 0:
                        cv.put(int(round(px)) - 1, int(round(py)), hp[6], 100 + j)


@crop
def crop_jagung(cv, stage, bx, by, rnd):
    g = PAL["leaf"]
    if stage == 0:
        mound(cv, bx, by - 1, PAL["corn"])
        return
    if stage == 1:
        strap(cv, bx, by, -2.1, 7, 1.3, g, bend=-0.6)
        strap(cv, bx, by, -1.0, 7, 1.3, g, bend=0.6, base=3)
        return
    H = [0, 0, 12, 27, 28][stage]
    for y in range(by - H, by + 1):
        cv.put(bx, y, g[5])
        cv.put(bx + 1, y, g[3])
    k_n = [0, 0, 3, 5, 5][stage]
    for k in range(k_n):
        yy = by - 2 - k * (H - 5) / k_n
        side = -1 if k % 2 == 0 else 1
        strap(cv, bx + (1 if side > 0 else 0), yy, -math.pi / 2 + side * 1.0, 10 + rnd.randint(-1, 2), 1.4, g,
              bend=side * 1.5, base=4 if side < 0 else 3)
    if stage >= 3:
        tp = PAL["straw"]
        for k in (-2, -1, 0, 1, 2):
            for (x, y, t) in spine_path(bx, by - H, -math.pi / 2 + k * 0.42, 5, bend=k * 0.5, step=1.0):
                cv.put(int(round(x)), int(round(y)), tp[6 if k <= 0 else 4])
        hp, cp = PAL["husk"], PAL["corn"]
        cx, cy = bx + 3, by - H // 2
        for j in range(-4, 5):
            w = 2.2 * math.sqrt(max(0, 1 - (j / 4.6) ** 2))
            for i in range(int(-w), int(w) + 1):
                b = 5 if i < 0 else (4 if i == 0 else 3)
                col = hp[b]
                if stage == 4 and -1 <= i <= 0 and j < 2:
                    col = cp[6 if (i + j) % 2 else 5]
                cv.put(cx + i, cy + j, col, 100)
        silk = PAL["orange"] if stage == 4 else tp
        cv.put(cx, cy - 5, silk[5], 100)
        cv.put(cx + 1, cy - 6, silk[4], 100)


def chili(cv, x, y, rp, gp):
    cv.put(x, y - 1, gp[4], 300)
    for i in range(4):
        cv.put(x + (i == 3), y + i, rp[5 if i < 2 else 4], 300)
        cv.put(x + 1 + (i == 3), y + i, rp[3], 300) if i < 3 else None
    cv.put(x, y, rp[7], 301)


@crop
def crop_cabai(cv, stage, bx, by, rnd):
    g = PAL["leaf"]
    if stage == 0:
        mound(cv, bx, by - 1, PAL["straw"])
        return
    if stage == 1:
        sprout(cv, bx, by, g)
        return
    rx, ry = [0, 0, (6, 5), (9, 7), (9, 8)][stage]
    stem(cv, bx, by, by - 3, g)
    bush(cv, bx, by - ry - 1, rx, ry, g, 3 + stage)
    if stage == 3:
        for (dx, dy) in ((-5, -7), (3, -11), (5, -5), (-1, -14)):
            flower(cv, bx + dx, by + dy, PAL["white"])
    if stage == 4:
        for (dx, dy) in ((-6, -9), (-1, -13), (4, -10), (6, -5), (-3, -4)):
            chili(cv, bx + dx, by + dy, PAL["red"], g)


@crop
def crop_tomat(cv, stage, bx, by, rnd):
    g = PAL["leaf"]
    if stage == 0:
        mound(cv, bx, by - 1, PAL["yellow"])
        return
    if stage == 1:
        sprout(cv, bx, by, g, h=5)
        return
    # a vine tied up a bamboo stake: leaf clusters stacked along it
    bam = PAL["bamboo"]
    H = [0, 0, 17, 27, 27][stage]
    for y in range(by - H - 3, by + 1):
        cv.put(bx + 1, y, bam[6 if (by - y) % 7 else 3], -50)
        cv.put(bx + 2, y, bam[4 if (by - y) % 7 else 2], -50)
    cv.put(bx + 1, by - H - 3, bam[7], -50)
    if stage == 2:
        blobs = [(bx, by - 5, 5, 4), (bx + 1, by - 10, 4.5, 4), (bx, by - 14, 3.5, 3)]
    else:
        blobs = [(bx - 1, by - 6, 6.5, 5), (bx + 2, by - 12, 6, 5), (bx - 1, by - 18, 5.5, 4.5),
                 (bx + 1, by - 23, 4, 3.5)]
    sv.crown(cv, blobs, g, 4 + stage, leaf="oak", spacing=(3, 2), jitter=0.5)
    for y in (by - 9, by - 16):  # twine
        cv.put(bx, y, PAL["straw"][6], 200)
        cv.put(bx + 3, y, PAL["straw"][4], 200)
    if stage == 3:
        for (dx, dy) in ((-5, -8), (5, -13), (3, -6), (-3, -19), (2, -24)):
            flower(cv, bx + dx, by + dy, PAL["yellow"])
    if stage == 4:
        for k, (dx, dy) in enumerate(((-5, -6), (5, -11), (-3, -16), (4, -4), (2, -20), (-1, -9))):
            pal_ = PAL["tomato"] if k not in (2, 4) else PAL["orange"]
            sv.ball(cv, bx + dx, by + dy, 2.6, 2.4, pal_, lo=1, hi=6, depth=300 + k)
            cv.put(bx + dx, by + dy - 3, PAL["leaf"][5], 310)
            cv.put(bx + dx - 1, by + dy - 2, PAL["leaf"][4], 310)
            cv.put(bx + dx + 1, by + dy - 2, PAL["leaf"][3], 310)


@crop
def crop_terong(cv, stage, bx, by, rnd):
    g = PAL["leaf_dark"]
    if stage == 0:
        mound(cv, bx, by - 1, PAL["straw"])
        return
    if stage == 1:
        sprout(cv, bx, by, g, h=4)
        return
    stem(cv, bx, by, by - 4, PAL["leaf"])
    L = [0, 0, 7, 9, 9][stage]
    for a, base in ((-2.75, 3), (-0.4, 3), (-2.15, 4), (-1.0, 4)):
        leaf(cv, bx, by - 4, a, L, 2.6, g, droop=0.25, base=base)
    if stage >= 3:
        bush(cv, bx, by - 9, 7, 5, g, 7)
    if stage == 3:
        for (dx, dy) in ((-4, -10), (4, -12), (1, -6)):
            flower(cv, bx + dx, by + dy, PAL["purple"])
    if stage == 4:
        pp, lp = PAL["purple"], PAL["leaf"]
        for k, (dx, dy) in enumerate(((-5, -7), (5, -9), (0, -3))):
            x, y = bx + dx, by + dy
            sv.ball(cv, x, y + 3, 2.4, 4, pp, lo=1, hi=6, depth=300 + k)
            for ox, t in ((-1, 4), (0, 5), (1, 3)):
                cv.put(x + ox, y - 1, lp[t], 310 + k)
            cv.put(x, y - 2, lp[4], 310 + k)


@crop
def crop_semangka(cv, stage, bx, by, rnd):
    g = PAL["leaf"]
    if stage == 0:
        mound(cv, bx, by - 1, PAL["iron"])
        return
    if stage == 1:
        sprout(cv, bx, by, g, h=3)
        return
    vines = [(-1, 11, 0.0), (1, 11, 1.0), (-1, 7, 2.0), (1, 7, 3.0)][: (2 if stage == 2 else 4)]
    spots = []
    for side, L, ph in vines:
        x, y = float(bx), float(by - 1)
        for i in range(L):
            x += side
            y += math.sin(i * 0.7 + ph) * 0.5 - (0.4 if L < 8 else 0)
            cv.put(int(round(x)), int(round(y)), g[3])
            if i in (4, 9) or (L < 8 and i == 6):
                spots.append((x, y - 2))
    if stage == 2:
        spots.append((bx, by - 6))
    for (x, y) in sorted(spots, key=lambda p: p[1]):
        lobed(cv, int(round(x)), int(round(y)), 3.6 if stage > 2 else 3.0, g)
    if stage == 3:
        flower(cv, bx + 4, by - 8, PAL["yellow"])
        flower(cv, bx - 5, by - 6, PAL["yellow"])
    if stage == 4:
        melon(cv, bx + 1, by - 5, 7.5, 5.5)


def lobed(cv, x, y, r, pal_):
    """A round lobed leaf seen from above, with pale veins."""
    pts = {}
    for yy in range(int(-r) - 1, int(r) + 2):
        for xx in range(int(-r) - 1, int(r) + 2):
            a = math.atan2(yy, xx)
            lim = r * (0.86 + 0.14 * math.cos(a * 5))
            if xx * xx + (yy * 1.15) ** 2 <= lim * lim:
                pts[(xx, yy)] = a
    for (xx, yy) in pts:
        t = 5 if xx + yy < -1 else (4 if xx + yy < 2 else 3)
        if (xx + 1, yy) not in pts or (xx, yy + 1) not in pts:
            t = 2 if xx + yy > -1 else 3
        cv.put(x + xx, y + yy, pal_[t])
    for ang in (-2.4, -1.57, -0.7):
        for k in range(1, int(r * 0.75)):
            cv.put(int(round(x + math.cos(ang) * k)), int(round(y + math.sin(ang) * k * 0.85)), pal_[6])


def melon(cv, cx, cy, rx, ry):
    mp, lp = PAL["melon"], PAL["melon_light"]
    pts = set()
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - rx - 1), int(cx + rx + 2)):
            dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
            if dx * dx + dy * dy <= 1:
                pts.add((x, y))
    for (x, y) in pts:
        dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
        l = float(sv._n([dx, dy, math.sqrt(max(0, 1 - dx * dx - dy * dy)) + 0.1]) @ sv.LIGHT)
        t = clamp(round(2 + (l + 0.6) / 1.6 * 4.5), 1, 6)
        stripe = math.sin((dx * 2.4 + math.sin(dy * 2.6) * 0.3) * math.pi) > 0.3
        col = mp[clamp(t - 2, 1, 5)] if stripe else lp[t]
        if ((x + 1, y) not in pts or (x, y + 1) not in pts) and dx + dy > 0:
            col = mp[1]
        cv.put(x, y, col, 300)
    cv.put(int(cx - rx * 0.45), int(cy - ry * 0.5), lp[7], 301)


CROPS = {
    "padi": crop_padi,
    "jagung": crop_jagung,
    "cabai": crop_cabai,
    "tomat": crop_tomat,
    "terong": crop_terong,
    "semangka": crop_semangka,
}
STAGES = ["benih", "tunas", "muda", "dewasa", "panen"]
