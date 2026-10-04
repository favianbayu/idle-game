"""Stones, boulders, ore nodes and pebbles, chibi style.

A stone is a soft rounded lump (a squashed super-ellipse, flatter on top and
on the ground) shaded in a few bands: a lit top, a mid front, a shadow on the
lower right and a deep rim, a shine dot, one small crack. Moss sits on top as
a cap with round drips. Ore shows as big shiny nuggets or crystals.
"""
import math
import random

import pix
from pix import Canvas, Noise, toon
import toon as T
from toon import DEEP, SHADOW, MID, LIGHT, HI


def lump_cells(cx, cy, rx, ry, seed, lumps=2, amp=0.07, p=2.6):
    """Art pixels inside a rounded lump: a super-ellipse with a few soft bumps."""
    rnd = random.Random(seed)
    ph = [rnd.uniform(0, 6.3) for _ in range(lumps)]
    P = pix.PIXEL
    out = {}
    for y in T.blocks(cy - ry * 1.2 - P, cy + ry + P):
        for x in T.blocks(cx - rx * 1.2 - P, cx + rx * 1.2 + P):
            dx = (x + P / 2 - cx) / rx
            dy = (y + P / 2 - cy) / ry
            a = math.atan2(dy, dx)
            lim = 1 + sum(amp * math.sin(a * (2 + k) + ph[k]) for k in range(lumps))
            if dy > 0.5:
                lim *= 1 - (dy - 0.5) * 0.3        # sits flat on the ground
            r = (abs(dx) ** p + abs(dy) ** p) ** (1 / p)
            if r <= lim:
                out[(x, y)] = (dx / lim, dy / lim, r / lim)
    return out


def stone(cv, cx, cy, rx, ry, pal, seed, *, lumps=2, crack=1, moss=None, depth=None, dots=True):
    rnd = random.Random(seed)
    P = pix.PIXEL
    cells = lump_cells(cx, cy, rx, ry, seed, lumps)
    tone = {}
    for (x, y), (dx, dy, r) in cells.items():
        nz = max(0.0, 1 - min(1.0, r) ** 2.2) ** 0.5
        n = T._n([dx * 0.9, dy * 0.9 + 0.12, nz + 0.12])
        l = float(n @ T.LIGHT3)
        b = T.band(l, hi=0.97, light=0.62, mid=0.2)
        if dy > 0.55 and b > SHADOW:
            b -= 1                                   # the underside toward the ground
        if T.lower_right_edge(cells, x, y) and dx + dy > -0.1:
            b = DEEP if b <= MID else SHADOW
        elif ((x - P, y) not in cells or (x, y - P) not in cells) and dx + dy < -0.5:
            b = max(b, LIGHT)                        # a lit lip on the top left
        tone[(x, y)] = b
    for (x, y), b in tone.items():
        cv.put(x, y, pal[b], depth)
    # shine
    sx, sy = cx - rx * 0.45, cy - ry * 0.5
    for (ox, oy) in ((0, 0), (P, 0), (0, P)) if rx > 14 else ((0, 0),):
        q = (int(sx + ox) - int(sx + ox) % P, int(sy + oy) - int(sy + oy) % P)
        if q in cells:
            cv.put(q[0], q[1], pal[HI], depth)
    for k in range(crack):
        # a small crack: a short zigzag with a lit lip under it
        x = cx + rnd.uniform(0.0, 0.45) * rx
        y = cy - rnd.uniform(-0.1, 0.3) * ry
        steps = [(P, P), (0, P), (P, P)] if rx > 14 else [(P, P), (0, P)]
        for (sx_, sy_) in [(0, 0)] + steps:
            x += sx_
            y += sy_
            q = (int(x) - int(x) % P, int(y) - int(y) % P)
            if q in cells and (q[0] + P, q[1]) in cells:
                cv.put(q[0], q[1], pal[DEEP], depth)
                if (q[0] - P, q[1]) in cells:
                    cv.put(q[0] - P, q[1], pal[LIGHT], depth)
    if dots and rx > 14:
        for _ in range(2):
            for _try in range(20):
                x = cx + rnd.uniform(-0.6, 0.6) * rx
                y = cy + rnd.uniform(-0.2, 0.5) * ry
                q = (int(x) - int(x) % P, int(y) - int(y) % P)
                if q in tone and tone[q] == MID:
                    cv.put(q[0], q[1], pal[SHADOW], depth)
                    break
    if moss is not None:
        mp = toon(moss)
        nz = Noise(seed + 7)
        for (x, y), (dx, dy, r) in cells.items():
            # wavy lower edge of the cap, with a couple of round drips
            edge = -0.18 + 0.1 * math.sin(dx * 6.5 + seed) + 0.3 * max(0, math.cos(dx * 3.1 + seed * 2)) ** 8
            if dy < edge:
                b = LIGHT if tone[(x, y)] >= LIGHT else MID
                if (x, y + P) in cells and cells[(x, y + P)][1] >= edge - 0.001:
                    b = SHADOW
                if T.lower_right_edge(cells, x, y) and dx + dy > -0.1:
                    b = DEEP
                cv.put(x, y, mp[b], depth)
        sx, sy = cx - rx * 0.4, cy - ry * 0.62
        q = (int(sx) - int(sx) % P, int(sy) - int(sy) % P)
        if q in cells:
            cv.put(q[0], q[1], mp[HI], depth)
    return cells


def rock(name, seed, w, h, rx, ry, *, stone_pal="stone", moss=None, cracks=1, big=False, **kw):
    cv = Canvas(w, h)
    cx, cy = w / 2, h - ry - 4
    pal = toon(stone_pal)
    if big:
        # a boulder with a smaller lump leaning on its right side
        stone(cv, cx + rx * 0.62, cy + ry * 0.32, rx * 0.42, ry * 0.55, pal, seed + 1, crack=0, depth=0)
        stone(cv, cx - rx * 0.1, cy - ry * 0.02, rx * 0.86, ry * 0.95, pal, seed, crack=cracks, moss=moss, depth=-50)
    else:
        stone(cv, cx, cy, rx, ry, pal, seed, crack=cracks, moss=moss)
    return cv, (w // 2, h - 4)


def ore_rock(seed, ore, w=56, h=54):
    cv = Canvas(w, h)
    cx, cy = w / 2, h - 22
    stone(cv, cx, cy, 22, 18, toon("stone"), seed, crack=0, dots=False)
    rnd = random.Random(seed + 9)
    op = toon(ore)
    spots = [(-9, -5), (7, -8), (9, 4), (-4, 5)]
    rnd.shuffle(spots)
    for i, (ox, oy) in enumerate(spots[:3 if ore != "gem" else 3]):
        x, y = cx + ox + rnd.uniform(-1, 1), cy + oy + rnd.uniform(-1, 1)
        if ore == "gem":
            crystal(cv, x, y, op, tall=4 + (i == 0))
        else:
            r = 6 if i == 0 else 4.6
            T.ball(cv, x, y, r, r * 0.85, op, depth=None)
    return cv, (w // 2, h - 4)


def crystal(cv, x, y, pal, tall=6):
    """A chunky gem crystal: a pointed hexagonal prism, lit left face, shaded right."""
    P = pix.PIXEL
    x, y = int(x) - int(x) % P, int(y) - int(y) % P
    wd = 2      # half width in art pixels
    for j in range(-tall, 2):
        half = min(wd, j + tall)
        for i in range(-half, half + 1):
            b = LIGHT if i < 0 else (MID if i == 0 else SHADOW)
            if j <= -tall + 2:
                b = HI if i < 0 else (LIGHT if i == 0 else MID)
            if i == half and half > 0:
                b = DEEP if j > -tall + 2 else SHADOW
            if j == 1:
                b = DEEP if i >= 0 else SHADOW
            cv.put(x + i * P, y + j * P, pal[b])
    cv.put(x - P, y - (tall - 3) * P, pal[HI])


def pebbles(seed, w=48, h=30):
    cv = Canvas(w, h)
    rnd = random.Random(seed)
    pts = []
    while len(pts) < 5:
        rx = rnd.uniform(4, 7)
        cx = rnd.uniform(rx + 3, w - rx - 3)
        cy = rnd.uniform(rx * 0.75 + 6, h - rx * 0.75 - 4)
        if all(math.hypot(cx - a, cy - b) > rx + r + 1 for a, b, r in pts):
            pts.append((cx, cy, rx))
    for cx, cy, rx in sorted(pts, key=lambda p: p[1]):
        T.ball(cv, cx, cy, rx, rx * 0.8, toon(rnd.choice(["stone", "stone_warm"])), flat=0.15, spot=rx > 5)
    return cv, (w // 2, h - 6)
