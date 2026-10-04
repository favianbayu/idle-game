"""Ground tiles, 96 x 48 diamonds (the prototype's Iso.TILE_W x TILE_H), in a
Stardew-Valley-like style.

Tiles are drawn at art resolution. Every texture is a function of the world
position (u, v) wrapped to one tile (48 world units each way), so any tile
meets any neighbour of the same kind without a seam.
"""
import math
import random

from pix import Canvas, Noise
import sv
from sv import PAL, clamp

TW, TH = 96, 48


def wrap(d):
    return (d + 24) % 48 - 24


def _pval(g, n, u, v):
    x0, y0 = int(math.floor(u)), int(math.floor(v))
    fx, fy = u - x0, v - y0
    fx = fx * fx * (3 - 2 * fx)
    fy = fy * fy * (3 - 2 * fy)
    a, b = g[y0 % n][x0 % n], g[y0 % n][(x0 + 1) % n]
    c, d = g[(y0 + 1) % n][x0 % n], g[(y0 + 1) % n][(x0 + 1) % n]
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy


def tiled_noise(nz, u, v, cells=4):
    """Value noise that repeats every 48 units both ways."""
    g = nz.g
    a = _pval(g, cells, u / 48 * cells, v / 48 * cells)
    b = _pval(g[7:], 2 * cells, u / 48 * 2 * cells, v / 48 * 2 * cells)
    return a * 0.65 + b * 0.35


def tile(fn):
    """fn(cv, px) draws on an art-resolution tile; px is a list of
    (x, y, u, v) for the art pixels inside the diamond. Returns the screen tile."""
    def wrap_(*a, **k):
        with sv.artres() as P:
            cv = Canvas(TW // P, TH // P)
            px = []
            for y in range(TH // P):
                for x in range(TW // P):
                    sx, sy = (x + 0.5) * P - TW / 2, (y + 0.5) * P
                    if abs(sx) / (TW / 2) + abs(sy - TH / 2) / (TH / 2) <= 1.0:
                        px.append((x, y, (sy + sx / 2) % 48, (sy - sx / 2) % 48))
            fn(cv, px, P, *a, **k)
        return sv.up(cv, P)
    wrap_.__name__ = fn.__name__
    return wrap_


def marks(seed, n, min_d=5.0):
    """n points spread over the wrapped 48 x 48 (u, v) square."""
    rnd = random.Random(seed)
    pts = []
    for _ in range(n * 30):
        if len(pts) >= n:
            break
        u, v = rnd.uniform(0, 48), rnd.uniform(0, 48)
        if all(math.hypot(wrap(u - a), wrap(v - b)) >= min_d for a, b, *_ in pts):
            pts.append((u, v, rnd.random()))
    return pts


TICKS = {
    "blade": [(0, -1, 1), (0, 0, -1)],                       # a light tip over a dark root
    "v": [(-1, -1, -1), (1, -1, -1), (0, 0, -1)],            # a little dark 'v' of two blades
    "tall": [(0, -2, 1), (0, -1, 0), (0, 0, -1), (1, -1, -1)],
    "dot": [(0, 0, -1)],
    "clod": [(0, -1, 2), (1, -1, 1), (0, 0, -1), (1, 0, -2)],
    "pebble": [(0, 0, 2), (1, 0, 0), (0, 1, -1), (1, 1, -2)],
}


@tile
def grass(cv, px, P, seed, variant=0):
    """Grass: two soft tones in big wavy patches and lots of little blade ticks."""
    g = PAL["turf"]
    nz = Noise(seed + 11 * variant)
    base = {}
    for (x, y, u, v) in px:
        n = tiled_noise(nz, u, v, 3)
        t = 4 if n < 0.55 else 5
        if variant == 1 and n < 0.32:
            t = 3
        base[(x, y)] = t
        cv.put(x, y, g[t])
    pts = marks(seed * 3 + variant, 30 if variant != 1 else 24, min_d=5.5)
    names = ["blade", "v", "v", "tall", "blade", "v"]

    def pick(p):
        return names[int(p[2] * len(names))], None

    def draw(p, x, y, code):
        return g[clamp(base.get((x, y), 4) + code, 1, 7)]
    for (x, y, u, v) in px:
        for p in pts:
            du, dv = wrap(u - p[0]), wrap(v - p[1])
            ox, oy = (du - dv) / P, (du + dv) / 2 / P
            if abs(ox) > 2.5 or abs(oy) > 2.5:
                continue
            for (dx, dy, code) in TICKS[pick(p)[0]]:
                if int(math.floor(ox + 0.5)) == dx and int(math.floor(oy + 0.5)) == dy:
                    cv.put(x, y, draw(p, x, y, code))
    if variant == 2:      # a few tiny flowers
        fl = marks(seed + 77, 4, min_d=14)
        cols = [PAL["white"], PAL["yellow"], PAL["pink"], PAL["white"]]
        for (x, y, u, v) in px:
            for k, p in enumerate(fl):
                du, dv = wrap(u - p[0]), wrap(v - p[1])
                ox, oy = round((du - dv) / P), round((du + dv) / 2 / P)
                c = cols[k]
                if (ox, oy) == (0, 0):
                    cv.put(x, y, (PAL["orange"] if c is PAL["yellow"] else PAL["yellow"])[5])
                elif abs(ox) + abs(oy) == 1:
                    cv.put(x, y, c[7 if (ox, oy) == (0, -1) else (6 if ox < 0 else 4)])


@tile
def soil(cv, px, P, seed, wet=False):
    """Tilled soil: furrows across the tile (lit on their upper slope), lumpy clods
    and a dark dug-in border."""
    s = PAL["soil_wet" if wet else "soil"]
    inside = {(x, y) for (x, y, u, v) in px}
    nz = Noise(seed + 9)
    for (x, y, u, v) in px:
        t = 3 if tiled_noise(nz, u, v, 4) < 0.58 else 4
        cv.put(x, y, s[t])
    pts = marks(seed + 5, 44, min_d=4.5)
    for (x, y, u, v) in px:
        for p in pts:
            du, dv = wrap(u - p[0]), wrap(v - p[1])
            ox, oy = (du - dv) / P, (du + dv) / 2 / P
            if abs(ox) > 2 or abs(oy) > 2:
                continue
            for (dx, dy, code) in TICKS["clod" if p[2] < 0.6 else "dot"]:
                if int(math.floor(ox + 0.5)) == dx and int(math.floor(oy + 0.5)) == dy:
                    cur = 4 if p[2] < 0.6 else 3
                    cv.put(x, y, s[clamp(cur + code, 1, 7)])
    # a dark lip round the plot (lit on the far, lower right edges where the ground rises)
    for (x, y) in inside:
        if not all(q in inside for q in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))):
            cv.put(x, y, s[1] if y < TH // P / 2 + 0.5 else s[5])


@tile
def path(cv, px, P, seed, kind="tanah"):
    """'tanah' packed dirt with pebbles, 'batu' a cobblestone path."""
    d = PAL["dirt"]
    nz = Noise(seed + 3)
    if kind == "tanah":
        for (x, y, u, v) in px:
            n = tiled_noise(nz, u, v, 3)
            cv.put(x, y, d[4 if n < 0.6 else 5])
        pts = marks(seed, 22, min_d=6.5)
        st = PAL["stone_warm"]
        for (x, y, u, v) in px:
            for p in pts:
                du, dv = wrap(u - p[0]), wrap(v - p[1])
                ox, oy = (du - dv) / P, (du + dv) / 2 / P
                if abs(ox) > 2 or abs(oy) > 2:
                    continue
                kind_ = "pebble" if p[2] < 0.2 else ("dot" if p[2] < 0.75 else "clod")
                for (dx, dy, code) in TICKS[kind_]:
                    if int(math.floor(ox + 0.5)) == dx and int(math.floor(oy + 0.5)) == dy:
                        cv.put(x, y, st[clamp(4 + code, 1, 7)] if kind_ == "pebble" else d[clamp(4 + code, 1, 7)])
        return
    # cobblestones: a wrapped Voronoi of rounded stones with dark gaps
    rnd = random.Random(seed)
    stones = marks(seed + 1, 11, min_d=12.5)
    tones = [rnd.choice((4, 4, 5, 3)) for _ in stones]
    st = PAL["stone_warm"]
    for (x, y, u, v) in px:
        ds = []
        for i, (a, b, _) in enumerate(stones):
            du, dv = wrap(u - a), wrap(v - b)
            ds.append((math.hypot(du, dv), i, du, dv))
        ds.sort()
        d1, i, du, dv = ds[0]
        d2 = ds[1][0]
        gap = d2 - d1
        if gap < 1.8:
            cv.put(x, y, d[1] if gap < 0.9 else d[2])
            continue
        # screen-space position inside the stone: lit toward the top left
        sx, sy = du - dv, (du + dv) / 2
        t = tones[i]
        if gap < 3.4:
            t += 1 if (sx + sy * 2) < 0 else -1
        elif (sx + sy * 2) < -3:
            t += 1
        if (x * 5 + y * 3 + i) % 11 == 0:
            t -= 1
        cv.put(x, y, st[clamp(t, 1, 7)])
