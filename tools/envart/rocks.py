"""Stones, boulders, ore nodes and pebbles in a Stardew-Valley-like style.

Drawn at art resolution (sv.asset). A stone is a rounded lump cut into a few
flat facets: each facet takes one tone from its own tilted normal (lit from
the top left), with a dark crease where a facet meets a darker one, a lit lip
on the top left edge, a dark rim on the lower right, a few specks and a crack.
Moss sits on top as a leafy cap. Ore shows as shiny nuggets or crystals set
into the stone.
"""
import math
import random

from pix import Canvas
import sv
from sv import PAL, clamp


def lump(cx, cy, rx, ry, seed, lumps=2, amp=0.07, p=2.4):
    """{(x, y): (dx, dy, r)} for the art pixels inside a rounded lump that sits flat."""
    rnd = random.Random(seed)
    ph = [rnd.uniform(0, 6.3) for _ in range(lumps)]
    out = {}
    for y in range(int(cy - ry * 1.2) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx * 1.2) - 1, int(cx + rx * 1.2) + 2):
            dx = (x + 0.5 - cx) / rx
            dy = (y + 0.5 - cy) / ry
            a = math.atan2(dy, dx)
            lim = 1 + sum(amp * math.sin(a * (2 + k) + ph[k]) for k in range(lumps))
            if dy > 0.45:
                lim *= 1 - (dy - 0.45) * 0.35        # flat underside on the ground
            r = (abs(dx) ** p + abs(dy) ** p) ** (1 / p)
            if r <= lim:
                out[(x, y)] = (dx / lim, dy / lim, r / lim)
    return out


def stone(cv, cx, cy, rx, ry, pal_, seed, *, facets=None, crack=1, moss=None, depth=None, specks=True,
          lo=1, hi=6):
    rnd = random.Random(seed)
    cells = lump(cx, cy, rx, ry, seed)
    # facet seeds spread over the lump, each with a tilted normal
    n_f = facets or max(4, int(rx * ry / 14))
    seeds = []
    while len(seeds) < n_f:
        u, v = rnd.uniform(-0.95, 0.95), rnd.uniform(-0.95, 0.8)
        if u * u + v * v < 0.9:
            nz = math.sqrt(max(0.05, 1 - u * u - v * v))
            n = sv._n([u * 1.5 + rnd.uniform(-0.35, 0.35), v * 1.4 + 0.1 + rnd.uniform(-0.35, 0.35), nz])
            seeds.append((u, v, float(n @ sv.LIGHT)))
    owner, tone = {}, {}
    for (x, y), (dx, dy, r) in cells.items():
        k = min(range(len(seeds)), key=lambda i: (dx - seeds[i][0]) ** 2 + (dy - seeds[i][1]) ** 2 * 1.3)
        owner[(x, y)] = k
        l = seeds[k][2]
        t = lo + 0.4 + (l + 0.5) / 1.45 * (hi - lo)
        if dy > 0.6:
            t -= 1                                     # the underside toward the ground
        tone[(x, y)] = clamp(round(t), lo, hi)
    for (x, y) in cells:
        t = tone[(x, y)]
        # a crease where this facet meets a lighter one above / to the left
        for q in ((x - 1, y), (x, y - 1)):
            if q in owner and owner[q] != owner[(x, y)] and tone[q] > t:
                t -= 1
                break
        lr = (x + 1, y) not in cells or (x, y + 1) not in cells
        tl = (x - 1, y) not in cells or (x, y - 1) not in cells
        dx, dy, _ = cells[(x, y)]
        if lr and dx + dy > -0.2:
            t = lo
        elif tl and dx + dy < -0.3:
            t += 1                                     # lit lip on the top left
        cv.put(x, y, pal_[clamp(t, lo, hi + 1)], depth)
    if specks:
        for _ in range(int(rx * ry / 10)):
            q = (int(cx + rnd.uniform(-0.75, 0.75) * rx), int(cy + rnd.uniform(-0.6, 0.6) * ry))
            if q in cells and not ((q[0] + 1, q[1]) not in cells or (q[0], q[1] + 1) not in cells):
                d = -1 if rnd.random() < 0.65 else 1
                cv.put(q[0], q[1], pal_[clamp(tone[q] + d, lo, hi + 1)], depth)
    for _ in range(crack):
        # a crack: a short zigzag with a lit lip under it
        x, y = int(cx + rnd.uniform(0.0, 0.45) * rx), int(cy - rnd.uniform(-0.1, 0.4) * ry)
        for (sx, sy) in [(0, 0), (1, 1), (0, 1), (1, 1)][: 3 if rx < 10 else 4]:
            x += sx
            y += sy
            if (x, y) in cells and (x + 1, y) in cells and (x, y + 1) in cells:
                cv.put(x, y, pal_[lo], depth)
                if (x - 1, y) in cells:
                    cv.put(x - 1, y, pal_[min(hi + 1, tone[(x - 1, y)] + 1)], depth)
    if moss is not None:
        mp = PAL[moss]
        for (x, y), (dx, dy, r) in cells.items():
            edge = -0.38 + 0.12 * math.sin(dx * 7 + seed) + 0.3 * max(0, math.cos(dx * 3.3 + seed * 2)) ** 8
            if dy < edge:
                t = 5 if tone[(x, y)] >= 4 else 4
                if dx + dy < -0.7:
                    t = 6
                h = (x * 7 + y * 13) % 9
                t += 1 if h == 0 else (-1 if h in (4, 7) else 0)    # leafy speckle
                below = (x, y + 1)
                if below in cells and cells[below][1] >= edge - 0.001:
                    t = 2                              # the cap's lower lip
                if ((x + 1, y) not in cells or (x, y + 1) not in cells) and dx + dy > -0.2:
                    t = 1
                cv.put(x, y, mp[t], depth)
        for _ in range(int(rx / 2)):
            q = (int(cx + rnd.uniform(-0.6, 0.3) * rx), int(cy - rnd.uniform(0.5, 0.85) * ry))
            if q in cells:
                cv.put(q[0], q[1], mp[7], depth)
    return cells


@sv.asset
def rock(name, seed, w, h, rx, ry, *, stone_pal="stone", moss=None, cracks=1, big=False):
    cv = Canvas(w, h)
    cx, cy = w / 2, h - ry - 2
    pal_ = PAL[stone_pal]
    if big:
        # a boulder with a smaller lump leaning on its right side
        stone(cv, cx + rx * 0.66, cy + ry * 0.36, rx * 0.42, ry * 0.52, pal_, seed + 1, crack=0, depth=0)
        stone(cv, cx - rx * 0.1, cy, rx * 0.86, ry * 0.95, pal_, seed, crack=cracks, moss=moss, depth=-50)
    else:
        stone(cv, cx, cy, rx, ry, pal_, seed, crack=cracks, moss=moss)
    return cv, (w // 2, h - 2)


ORE_SPOTS = [(-5, -3), (4, -5), (5, 2), (-2, 3), (-6, 1), (1, -1)]


@sv.asset
def ore_rock(seed, ore, w=28, h=27):
    cv = Canvas(w, h)
    cx, cy = w / 2, h - 11
    cells = stone(cv, cx, cy, 11, 9, PAL["stone"], seed, crack=0, specks=True)
    rnd = random.Random(seed + 9)
    op = PAL[ore]
    spots = ORE_SPOTS[:]
    rnd.shuffle(spots)
    for i, (ox, oy) in enumerate(spots[:3 if ore == "gem" else 5]):
        x, y = int(cx + ox), int(cy + oy)
        if ore == "gem":
            sv.outlined(cv, lambda c, x=x, y=y, i=i: crystal(c, x, y, op, tall=4 + (i == 0)))
        else:
            sv.outlined(cv, lambda c, x=x, y=y, i=i: nugget(c, x, y, op, big=i < 2, cells=cells))
    return cv, (w // 2, h - 2)


def nugget(cv, x, y, pal_, big=False, cells=None):
    """An ore lump set into the stone: a little faceted blob with a shine."""
    shape = ([".hm.", "hhmd", "mmdd", ".dd."] if big else ["hm", "md"])
    for j, row in enumerate(shape):
        for i, ch in enumerate(row):
            if ch == ".":
                continue
            if cells is not None and (x + i, y + j) not in cells:
                continue
            t = {"h": 6, "m": 4, "d": 2}[ch]
            cv.put(x + i, y + j, pal_[t])
    cv.put(x + (1 if big else 0), y + (1 if big else 0), pal_[7])


def crystal(cv, x, y, pal_, tall=5):
    """A gem crystal: a pointed prism, lit left face, shaded right."""
    wd = 1
    for j in range(-tall, 1):
        half = min(wd, j + tall)
        for i in range(-half, half + 1):
            t = 6 if i < 0 else (4 if i == 0 else 2)
            if j <= -tall + 1:
                t += 1
            cv.put(x + i, y + j, pal_[clamp(t, 1, 7)])
    cv.put(x - 1, y - tall + 2, pal_[7])


@sv.asset
def pebbles(seed, w=24, h=15):
    cv = Canvas(w, h)
    rnd = random.Random(seed)
    pts = []
    while len(pts) < 5:
        rx = rnd.uniform(2.0, 3.6)
        cx = rnd.uniform(rx + 2, w - rx - 2)
        cy = rnd.uniform(rx * 0.75 + 3, h - rx * 0.75 - 2)
        if all(math.hypot(cx - a, cy - b) > rx + r + 1 for a, b, r in pts):
            pts.append((cx, cy, rx))
    for k, (cx, cy, rx) in enumerate(sorted(pts, key=lambda p: p[1])):
        stone(cv, cx, cy, rx, rx * 0.75, PAL[rnd.choice(["stone", "stone_warm"])], seed + k, facets=3, crack=0,
              specks=False, depth=k)
    return cv, (w // 2, h - 3)
