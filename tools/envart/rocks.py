"""Stones, boulders, ore nodes and pebbles."""
import math
import random

import pix
from pix import Canvas, Noise, ramp, LIGHT3
import numpy as np


def facet_rock(cv, cx, cy, rx, ry, rmp, seed, *, facets=5, height=1.0, lo=1, hi=None, tex_amt=0.10,
               cracks=2, moss=None, speck=True):
    """A chunky stone: a wobbly ellipse dome cut into flat facets.

    The dome's normals are snapped to a few facet directions (Voronoi cells on
    the surface), so the light falls in hard planes like a chipped stone.
    """
    rnd = random.Random(seed)
    nz = Noise(seed)
    hi = len(rmp) - 1 if hi is None else hi
    # facet centres on the top-ish surface
    cells = [(rnd.uniform(-0.8, 0.8), rnd.uniform(-0.9, 0.6)) for _ in range(facets)]
    cells.append((0.0, -0.35))
    pts = {}
    for y in range(int(cy - ry - 3), int(cy + ry + 3)):
        for x in range(int(cx - rx - 3), int(cx + rx + 3)):
            dx = (x + 0.5 - cx) / rx
            dy = (y + 0.5 - cy) / ry
            ang = math.atan2(dy, dx)
            lim = 1 + 0.22 * (nz(math.cos(ang) * 1.7 + 3, math.sin(ang) * 1.7 + 3) - 0.5) * 2
            # flatter bottom: stones sit on the ground
            if dy > 0.55:
                lim *= 1 - (dy - 0.55) * 0.25
            r = math.hypot(dx, dy)
            if r <= lim:
                pts[(x, y)] = (dx / lim, dy / lim)
    def dome(u, v):
        r2 = min(0.97, u * u + v * v)
        return np.array([u * 1.1, v * 1.0 - 0.15, math.sqrt(1 - r2) * height + 0.15])
    fnorm = []
    for (fx, fy) in cells:
        n = dome(fx, fy) + np.array([rnd.uniform(-0.35, 0.35), rnd.uniform(-0.35, 0.35), 0])
        fnorm.append(n / np.linalg.norm(n))
    cellof = {}
    for (x, y), (dx, dy) in pts.items():
        best, bi = 9, 0
        for i, (fx, fy) in enumerate(cells):
            d = (dx - fx) ** 2 + (dy - fy) ** 2 * 1.3
            if d < best:
                best, bi = d, i
        cellof[(x, y)] = bi
    tone = {}
    for (x, y), (dx, dy) in pts.items():
        n = fnorm[cellof[(x, y)]] * 0.75 + dome(dx, dy) / np.linalg.norm(dome(dx, dy)) * 0.25
        n /= np.linalg.norm(n)
        l = float(n @ LIGHT3)
        v = 0.26 + 0.66 * l
        v += (nz.fbm(x * 0.3, y * 0.3) - 0.5) * tex_amt * 2
        # front face (lower part) is in shade, darker toward the ground
        if dy > 0.3:
            v -= (dy - 0.3) * 0.9
        t = int(max(lo, min(hi, math.floor(lo + v * (hi - lo + 0.999)))))
        tone[(x, y)] = t
    P = pix.PIXEL
    for (x, y), t in list(tone.items()):
        c = cellof[(x, y)]
        # facet borders: lit lip on the upper-left side of a facet, shadow line on the lower-right
        if cellof.get((x - P, y), c) != c or cellof.get((x, y - P), c) != c:
            t = min(hi, t + 1)
        dx, dy = pts[(x, y)]
        if ((x + P, y) not in pts or (x, y + P) not in pts) and dx + dy > 0:
            t = lo
        elif ((x - P, y) not in pts or (x, y - P) not in pts) and dx + dy < -0.3:
            t = min(hi, t + 1)
        tone[(x, y)] = t
        cv.put(x, y, rmp[t])
    # cracks
    for k in range(cracks):
        sx = cx + rnd.uniform(-rx * 0.5, rx * 0.5)
        sy = cy + rnd.uniform(-ry * 0.3, ry * 0.4)
        ang = rnd.uniform(0.6, 2.4)
        L = rnd.randint(int(min(rx, ry) * 0.4), int(min(rx, ry) * 0.8))
        px, py = sx, sy
        for i in range(L):
            ix, iy = int(px), int(py)
            if (ix, iy) in pts and (ix + 1, iy) in pts and (ix, iy + 1) in pts:
                cv.put(ix, iy, rmp[max(0, lo)])
                # light lip below-left of the crack
                if (ix - 1, iy + 1) in pts and rnd.random() < 0.5:
                    cv.put(ix - 1, iy + 1, rmp[min(hi, tone.get((ix, iy), lo) + 1)])
            ang += rnd.uniform(-0.5, 0.5)
            px += math.cos(ang) * 0.9
            py += math.sin(ang) * 0.7
    if speck:
        for (x, y), t in tone.items():
            if rnd.random() < 0.025 and lo < t < hi:
                cv.put(x, y, rmp[t - 1] if rnd.random() < 0.6 else rmp[t + 1])
    if moss is not None:
        mr = ramp(moss)
        for (x, y), (dx, dy) in pts.items():
            m = nz.fbm(x * 0.12 + 40, y * 0.12 + 40)
            if dy < 0.15 and m > 0.56 and (dy < -0.2 or m > 0.62):
                lt = tone[(x, y)]
                mt = max(1, min(len(mr) - 1, lt - 2 + (1 if m > 0.66 else 0)))
                if (x, y - 1) in pts and nz.fbm((x) * 0.12 + 40, (y - 1) * 0.12 + 40) <= 0.56:
                    mt = min(len(mr) - 1, mt + 1)
                cv.put(x, y, mr[mt])
    return pts


def rock(name, seed, w, h, rx, ry, *, stone="stone", **kw):
    cv = Canvas(w, h)
    cx, cy = w / 2, h - ry - 4
    facet_rock(cv, cx, cy, rx, ry, ramp(stone), seed, **kw)
    return cv, (w // 2, h - 4)


def ore_rock(seed, ore, w=56, h=48):
    cv = Canvas(w, h)
    cx, cy = w / 2, h - 18
    pts = facet_rock(cv, cx, cy, 22, 16, ramp("stone"), seed, cracks=1)
    rnd = random.Random(seed + 9)
    orr = ramp(ore)
    # embedded nuggets: small bevelled gems/clusters
    spots = []
    tries = 0
    while len(spots) < 6 and tries < 200:
        tries += 1
        x = int(cx + rnd.uniform(-15, 15))
        y = int(cy + rnd.uniform(-11, 6))
        if all(abs(x - a) + abs(y - b) > 7 for a, b in spots) and all((x + dx, y + dy) in pts for dx in (-3, 3) for dy in (-3, 3)):
            spots.append((x, y))
    for (x, y) in spots:
        r = rnd.choice([2, 2, 3])
        for yy in range(-r, r + 1):
            for xx in range(-r, r + 1):
                if abs(xx) + abs(yy) <= r:
                    t = 3 + (1 if xx + yy < 0 else 0) + (1 if xx + yy < -r + 1 else 0) - (1 if xx + yy > r - 1 else 0)
                    cv.put(x + xx, y + yy, orr[max(0, min(len(orr) - 1, t))])
        cv.put(x - 1, y - 1, orr[-1])
        cv.put(x + r, y + 1, ramp("stone")[1])
        cv.put(x + 1, y + r, ramp("stone")[1])
    return cv, (w // 2, h - 4)


def pebbles(seed, w=40, h=24):
    cv = Canvas(w, h)
    rnd = random.Random(seed)
    for i in range(5):
        rx = rnd.uniform(2.5, 5)
        ry = rx * 0.7
        cx = rnd.uniform(rx + 3, w - rx - 3)
        cy = rnd.uniform(ry + 6, h - ry - 4)
        facet_rock(cv, cx, cy, rx, ry, ramp(rnd.choice(["stone", "stone_warm"])), seed + i, facets=3, cracks=0, speck=False)
    return cv, (w // 2, h - 6)
