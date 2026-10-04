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
def grass(cv, px, P, seed, variant=0, pal_="turf", shift=0):
    """Grass: two soft tones in big wavy patches and lots of little blade ticks.

    Every variant shares the same patches and ticks, so variants can be mixed
    tile by tile without a seam: 1 adds darker patches, 2 a few flowers.
    shift moves every tone (negative = darker), for the dense map border."""
    g = PAL[pal_]
    nz = Noise(seed)
    base = {}
    for (x, y, u, v) in px:
        n = tiled_noise(nz, u, v, 3)
        t = 4 if n < 0.55 else 5
        if variant == 1 and n < 0.32:
            t = 3
        t += shift
        base[(x, y)] = t
        cv.put(x, y, g[t])
    pts = marks(seed * 3, 30 if shift == 0 else 44, min_d=5.5 if shift == 0 else 4.5)
    names = ["blade", "v", "v", "tall", "blade", "v"]

    def pick(p):
        return names[int(p[2] * len(names))], None

    def draw(p, x, y, code):
        return g[clamp(base.get((x, y), 4 + shift) + code, 1, 7)]
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
        fl = marks(seed + 77, 2, min_d=20)
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


# ------------------------------------------------------------ more ground kinds
# The prototype's ground sheet also needs water, rice paddy, sand, mud, paving,
# bare soil, the cave floors and the chasm; they reuse the same tick stamps.
TICKS.update({
    "ripple": [(-1, 0, 2), (0, 0, 2), (1, 0, 2), (2, 0, 1)],
    "ripple_s": [(0, 0, 2), (1, 0, 1)],
    "sparkle": [(0, 0, 3)],
    "rice": [(0, -3, 2), (-1, -2, 1), (1, -2, 1), (0, -2, 0), (-1, -1, 0), (1, -1, -1), (0, -1, -1), (0, 0, -2)],
    "shell": [(0, 0, 3), (1, 0, 2), (0, 1, 1)],
    "crack": [(0, 0, -2), (1, 0, -2), (2, 1, -2), (-1, 1, -1)],
})


def base(cv, px, pal_, seed, tones=(4, 5), cut=0.55, cells=3):
    """Two tones in soft wavy patches; returns {(x, y): tone}."""
    nz = Noise(seed)
    out = {}
    for (x, y, u, v) in px:
        t = tones[0] if tiled_noise(nz, u, v, cells) < cut else tones[1]
        out[(x, y)] = t
        cv.put(x, y, pal_[t])
    return out


def sprinkle(cv, px, P, pts, pick, colour):
    """Stamp TICKS[pick(p)] at each wrapped point p; colour(p, x, y, code) -> rgb or None."""
    for (x, y, u, v) in px:
        for p in pts:
            du, dv = wrap(u - p[0]), wrap(v - p[1])
            ox, oy = (du - dv) / P, (du + dv) / 2 / P
            if abs(ox) > 3.5 or abs(oy) > 3.5:
                continue
            for (dx, dy, code) in TICKS[pick(p)]:
                if int(math.floor(ox + 0.5)) == dx and int(math.floor(oy + 0.5)) == dy:
                    c = colour(p, x, y, code)
                    if c is not None:
                        cv.put(x, y, c)


@tile
def water(cv, px, P, seed, deep=False):
    """Still water: two blues in slow patches with light ripple dashes."""
    w = PAL["water"]
    b = base(cv, px, w, seed, (2, 3) if deep else (4, 5), 0.5, 5 if deep else 2)
    pts = marks(seed + 2, 9, min_d=11)
    sprinkle(cv, px, P, pts, lambda p: "ripple" if p[2] < 0.45 else ("ripple_s" if p[2] < 0.85 else "sparkle"),
             lambda p, x, y, code: w[clamp(b[(x, y)] + code, 1, 7)])


@tile
def sawah(cv, px, P, seed):
    """Flooded rice paddy: muddy-blue water with rows of young rice clumps."""
    w, g = PAL["water"], PAL["grass"]
    b = base(cv, px, w, seed, (4, 3), 0.6, 2)
    sprinkle(cv, px, P, marks(seed + 4, 5, min_d=14), lambda p: "ripple_s",
             lambda p, x, y, code: w[clamp(b[(x, y)] + code, 1, 7)])
    # rice planted on a 4 x 4 grid in the tile's own (u, v) square, so rows run along the tile edges
    pts = [(6 + 12 * i, 6 + 12 * j, 0.5) for i in range(4) for j in range(4)]
    sprinkle(cv, px, P, pts, lambda p: "rice", lambda p, x, y, code: g[clamp(4 + code, 1, 7)])


@tile
def pasir(cv, px, P, seed):
    """Sand: warm pale tones, fine darker grains and the odd shell."""
    s = PAL["sand"]
    b = base(cv, px, s, seed, (5, 6), 0.55, 5)
    pts = marks(seed + 1, 26, min_d=5)
    sprinkle(cv, px, P, pts, lambda p: "shell" if p[2] < 0.08 else "dot",
             lambda p, x, y, code: (PAL["white"][clamp(4 + code, 1, 7)] if p[2] < 0.08
                                    else s[clamp(b[(x, y)] - 1, 1, 7)]))


@tile
def lumpur(cv, px, P, seed):
    """Mud: wet soil with shallow puddles that catch the light."""
    s, w = PAL["soil_wet"], PAL["water"]
    nz = Noise(seed + 5)
    b = base(cv, px, s, seed, (4, 5), 0.55, 5)
    for (x, y, u, v) in px:
        n = tiled_noise(nz, u, v, 6)
        if n < 0.27:
            cv.put(x, y, w[2 if n < 0.22 else 1])
            b[(x, y)] = -1
    pts = marks(seed + 3, 30, min_d=4.5)
    sprinkle(cv, px, P, pts, lambda p: "clod" if p[2] < 0.5 else ("sparkle" if p[2] > 0.9 else "dot"),
             lambda p, x, y, code: (w[4] if b[(x, y)] < 0 and code > 0 else
                                    (None if b[(x, y)] < 0 else s[clamp(b[(x, y)] + code, 1, 7)])))


@tile
def lantai(cv, px, P, seed):
    """Paving: square stone slabs laid along the tile edges, dark joints, each slab
    a slightly different tone and lit along its top left edges."""
    st = PAL["plaster"]
    rnd = random.Random(seed)
    tone = {(i, j): rnd.choice((4, 4, 5, 3)) for i in range(3) for j in range(3)}
    for (x, y, u, v) in px:
        i, j = int(u // 16) % 3, int(v // 16) % 3
        fu, fv = u % 16, v % 16
        if fu < 1.0 or fv < 1.0:
            cv.put(x, y, st[1])
            continue
        t = tone[(i, j)]
        if fu < 2.6 or fv < 2.6:
            t += 1
        elif fu > 14.4 or fv > 14.4:
            t -= 1
        if (x * 7 + y * 3 + i * 5) % 13 == 0:
            t -= 1
        cv.put(x, y, st[clamp(t, 1, 7)])


@tile
def tanah(cv, px, P, seed):
    """Bare packed earth (an empty lot): dirt tones, clods and a few sprigs of grass."""
    d, g = PAL["dirt"], PAL["turf"]
    b = base(cv, px, d, seed, (3, 4), 0.55, 5)
    pts = marks(seed + 2, 26, min_d=5.5)
    sprinkle(cv, px, P, pts, lambda p: "v" if p[2] < 0.25 else ("clod" if p[2] < 0.6 else "dot"),
             lambda p, x, y, code: (g[clamp(4 + code, 1, 7)] if p[2] < 0.25
                                    else d[clamp(b[(x, y)] + code, 1, 7)]))


@tile
def gua(cv, px, P, seed, wall=False):
    """Cave floor (grey stone, grit and hairline cracks) or the darker rock under the walls."""
    s = PAL["stone"]
    b = base(cv, px, s, seed, (1, 2) if wall else (3, 4), 0.55, 5)
    pts = marks(seed + 6, 22, min_d=6)
    sprinkle(cv, px, P, pts, lambda p: "crack" if p[2] < 0.3 else ("pebble" if p[2] < 0.55 else "dot"),
             lambda p, x, y, code: s[clamp(b[(x, y)] + code, 0, 7)])


@tile
def jurang(cv, px, P, seed):
    """A chasm: near-black with faint specks of rock far below."""
    s = PAL["stone"]
    base(cv, px, s, seed, (0, 1), 0.6, 2)
    sprinkle(cv, px, P, marks(seed + 1, 10, min_d=9), lambda p: "dot",
             lambda p, x, y, code: s[2])
