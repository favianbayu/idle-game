"""Chibi shading kit: big soft volumes drawn in a few flat colour bands.

Shapes are sampled once per art pixel (pix.PIXEL screen pixels square) at the
block centre, lit from the top left, and the light is cut into hard bands
(no dithering, no noise): a small highlight, a lit side, a mid tone, a shadow
crescent, and a deep rim on the lower right of each volume. Palettes are the
5-colour toon palettes from pix.toon(): [deep, shadow, mid, light, highlight].
"""
import math
import random

import numpy as np

import pix
from pix import LIGHT3

DEEP, SHADOW, MID, LIGHT, HI = range(5)


def _n(v):
    v = np.asarray(v, float)
    return v / np.linalg.norm(v)


def band(l, hi=0.93, light=0.5, mid=0.06):
    """Lambert value -> palette index (1 shadow .. 4 highlight)."""
    if l >= hi:
        return HI
    if l >= light:
        return LIGHT
    if l >= mid:
        return MID
    return SHADOW


def blocks(a, b):
    """Block origins (screen px) covering [a, b)."""
    P = pix.PIXEL
    a = int(math.floor(a))
    a -= a % P
    return range(a, int(math.ceil(b)) + P, P)


def ellipse_cells(cx, cy, rx, ry, edge=None):
    """{(x, y): (dx, dy)} for the art pixels inside an ellipse.

    edge(angle) may return a radius factor to make the outline lumpy."""
    P = pix.PIXEL
    out = {}
    for y in blocks(cy - ry - P, cy + ry + P):
        for x in blocks(cx - rx * 1.3 - P, cx + rx * 1.3 + P):
            dx = (x + P / 2 - cx) / rx
            dy = (y + P / 2 - cy) / ry
            lim = 1.0 if edge is None else edge(math.atan2(dy, dx))
            if dx * dx + dy * dy <= lim * lim:
                out[(x, y)] = (dx / lim, dy / lim)
    return out


def lower_right_edge(cells, x, y):
    P = pix.PIXEL
    return (x + P, y) not in cells or (x, y + P) not in cells


def ball(cv, cx, cy, rx, ry, pal, *, depth=None, bias=0.0, rim=True, spot=True, flat=0.0,
         edge=None, th=None, cells=None):
    """A shaded round volume: fruit, pebble, berry, bush puff..."""
    cells = ellipse_cells(cx, cy, rx, ry, edge) if cells is None else cells
    for (x, y), (dx, dy) in cells.items():
        r2 = min(1.0, dx * dx + dy * dy)
        nz = math.sqrt(1 - r2) * (1 - flat) + flat
        l = float(_n([dx, dy, nz + 0.05]) @ LIGHT3) + bias
        b = band(l, **(th or {}))
        if rim and lower_right_edge(cells, x, y) and dx + dy > 0.0:
            b = DEEP if b <= SHADOW else SHADOW
        cv.put(x, y, pal[b], depth)
    if spot:
        # a tiny round shine on the lit side
        P = pix.PIXEL
        sx, sy = cx - rx * 0.42, cy - ry * 0.45
        cv.put(sx, sy, pal[HI], None if depth is None else depth + 50)
        if min(rx, ry) >= 5 * P:
            cv.put(sx + P, sy, pal[HI], None if depth is None else depth + 50)
    return cells


def puffs(cv, items, pal, *, center, radii, gmix=0.62, seed=0, depth=0.0, ticks=True,
          back_dark=0.12, scallop=0.0, rim=True, th=None):
    """A crown / bush made of round puffs.

    items: (cx, cy, r, z) per puff, z = how far toward the viewer it sits
    (higher is in front). Each puff is lit by a blend of its own sphere normal
    and the whole crown's ellipsoid normal (one light side for the crown, but
    every puff still reads round). A deep rim runs along each puff's lower
    right edge, so overlapping puffs separate; puffs further back are a touch
    darker. A few leaf ticks are drawn on the lit side of each front puff.
    """
    P = pix.PIXEL
    rnd = random.Random(seed)
    gcx, gcy = center
    grx, gry = radii
    zs = [it[3] for it in items]
    zmin, zmax = min(zs), max(zs)
    order = sorted(range(len(items)), key=lambda i: (items[i][3], items[i][1]))
    drawn = []
    for i in order:
        cx, cy, r, z = items[i]
        zf = 0 if zmax == zmin else (z - zmin) / (zmax - zmin)
        ph = rnd.uniform(0, 6.3)
        edge = None
        if scallop:
            k = max(5, int(r / (3 * P)))
            edge = (lambda a, k=k, ph=ph: 1 + scallop * (abs(math.sin(a * k / 2 + ph)) - 0.6))
        cells = ellipse_cells(cx, cy, r, r * 0.9, edge)
        for (x, y), (dx, dy) in cells.items():
            r2 = min(1.0, dx * dx + dy * dy)
            ln = np.array([dx, dy, math.sqrt(1 - r2) + 0.1])
            gx = (x + P / 2 - gcx) / grx
            gy = (y + P / 2 - gcy) / gry
            gz = math.sqrt(max(0.0, 1 - gx * gx - gy * gy))
            gn = np.array([gx, gy, gz + 0.2])
            n = _n(_n(gn) * gmix + _n(ln) * (1 - gmix))
            l = float(n @ LIGHT3) - back_dark * (1 - zf)
            b = band(l, **(th or PUFF_TH))
            if rim and lower_right_edge(cells, x, y) and dx + dy > -0.35:
                b = DEEP if b <= MID else SHADOW
            cv.put(x, y, pal[b], depth + z)
        drawn.append((cx, cy, r, z, cells))
        if ticks and zf > 0.3:
            leaf_ticks(cv, cx, cy, r, pal, rnd, depth + z + 0.5, cells)
    return drawn


PUFF_TH = dict(hi=0.95, light=0.58, mid=0.16)

TICK = [(0, 0), (1, 1), (2, 0)]         # a little "v": a leaf notch
TICK_C = [(0, 1), (1, 0), (2, 0)]       # a little arc


def leaf_ticks(cv, cx, cy, r, pal, rnd, depth, cells, n=None):
    """Small leaf marks: light ones on the lit upper left, dark ones low right."""
    P = pix.PIXEL
    n = n if n is not None else max(1, int(r / (7 * P)))
    for k in range(n):
        for lit in (True, False):
            for _ in range(12):
                a = rnd.uniform(-2.6, -0.9) if lit else rnd.uniform(0.3, 1.6)
                d = rnd.uniform(0.35, 0.7)
                x = cx + math.cos(a) * r * d
                y = cy + math.sin(a) * r * 0.9 * d
                shape = TICK if rnd.random() < 0.6 else TICK_C
                pts = [(int(x) + sx * P, int(y) + sy * P) for sx, sy in shape]
                pts = [(px - px % P, py - py % P) for px, py in pts]
                if all(p in cells for p in pts):
                    c = pal[HI] if lit else pal[SHADOW]
                    for px, py in pts:
                        cv.put(px, py, c, depth)
                    break


def cylinder(cv, cx, y_bot, y_top, w_bot, w_top, pal, *, depth=0.0, flare=0.0, flare_h=10,
             lean=0.0, bend=None, marks=None, bands=(-0.3, 0.38)):
    """An upright round post / trunk in three bands: lit left, mid, shaded right,
    with a deep 1-art-pixel edge on the right. `marks(x, y, s, i)` may return a
    palette index to draw instead (bark lines, rings...)."""
    P = pix.PIXEL
    H = y_bot - y_top
    for y in blocks(y_top, y_bot):
        if y >= y_bot:
            break
        i = y_bot - y           # height above the ground
        t = i / max(1, H)
        w = w_bot + (w_top - w_bot) * t + flare * max(0.0, 1 - i / flare_h) ** 2
        c = cx + lean * i + (bend(i) if bend else 0.0)
        x0, x1 = c - w / 2, c + w / 2
        xs = [x for x in blocks(x0, x1) if x0 - P / 2 <= x + P / 2 <= x1 + P / 2]
        for x in xs:
            s = (x + P / 2 - c) / (w / 2 + 0.01)
            b = LIGHT if s < bands[0] else (MID if s < bands[1] else SHADOW)
            if x == xs[-1]:
                b = DEEP
            if marks is not None:
                m = marks(x, y, s, i)
                if m is not None:
                    b = m
            cv.put(x, y, pal[b], depth)


def ellipse_top(cv, cx, cy, rx, ry, pal, *, rings=0, depth=None, inner=(HI, LIGHT), rim_lit=LIGHT,
                rim_dark=SHADOW):
    """A flat round top (cut log end, stump top): rings, lit rim on the far edge."""
    P = pix.PIXEL
    cells = ellipse_cells(cx, cy, rx, ry)
    for (x, y), (dx, dy) in cells.items():
        r = math.hypot(dx, dy)
        b = inner[0]
        if rings:
            b = inner[(int(r * rings * 1.4) % 2)]
        edge = (x + P, y) not in cells or (x - P, y) not in cells or (x, y + P) not in cells or (x, y - P) not in cells
        if edge or r > 0.8:
            b = rim_lit if dy < 0 else rim_dark
        cv.put(x, y, pal[b], depth)
    return cells


def outlined(cv, draw):
    """Draw something on its own layer and set it on `cv` with an outline where
    it overlaps what is already there (the sprite's outer outline comes later),
    so a fruit or a leaf in front reads apart from the leaves behind it."""
    from pix import Canvas
    tmp = Canvas(cv.w, cv.h)
    draw(tmp)
    ring = Canvas(cv.w, cv.h)
    ring.rgb, ring.a = tmp.rgb.copy(), tmp.a.copy()
    ring.outline()
    edge = ring.a & ~tmp.a & cv.a
    cv.rgb[edge] = ring.rgb[edge]
    cv.rgb[tmp.a] = tmp.rgb[tmp.a]
    cv.a |= tmp.a
