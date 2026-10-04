"""Stardew-Valley-like rendering kit (style only: every sprite is drawn here).

The look: dense foliage built from many small leaf stamps over a dark
interior, saturated colour ramps that run from a near-black, cool shadow to a
bright warm highlight, warm golden-brown wood with vertical streaks, and a
dark outline around everything.

Everything here is drawn at art resolution (one Canvas pixel = one art pixel)
inside `artres()`, then blown up to screen pixels with `up()`, so with
pix.PIXEL = 2 each art pixel becomes a clean 2 x 2 block.
"""
import contextlib
import math
import random

import numpy as np

import pix
from pix import Canvas, R

# 8-tone ramps, darkest first: 0 is the interior / outline shade, 7 the shine.
PAL = {
    "leaf": R("#02190f", "#063420", "#0a4d1a", "#106c16", "#1c9214", "#3fba16", "#7fde20", "#c2f55a"),
    "leaf_dark": R("#021614", "#05302a", "#0a4734", "#11633a", "#1d8240", "#36a34a", "#68c45a", "#a8e27e"),
    "leaf_olive": R("#14190a", "#283112", "#3d4c16", "#566a1a", "#728a1e", "#93aa2a", "#b9c846", "#e0e57c"),
    "leaf_autumn": R("#2a0c06", "#4e170a", "#7a260c", "#a83a0e", "#d25812", "#ee8420", "#f8b23c", "#ffe07a"),
    "palm": R("#03201a", "#073a26", "#0d5628", "#167628", "#279628", "#4cb52c", "#86d43c", "#c4ee70"),
    "banana": R("#05261a", "#0a4024", "#105e26", "#1a8028", "#2ea42c", "#56c434", "#8ee050", "#ccf58a"),
    "grass": R("#04200f", "#083a1a", "#0e561c", "#17761c", "#26981c", "#46b820", "#7ad62c", "#b8f05e"),
    "turf": R("#12360f", "#1c4e15", "#2a681b", "#3a8222", "#4f9a2a", "#66b034", "#86c646", "#b2de6c"),
    "grass_dry": R("#241405", "#3e2509", "#5e3a0c", "#80520f", "#a66e16", "#c88e22", "#e4b23a", "#f6da74"),
    "bark": R("#1e0e02", "#3e1f05", "#5e2f06", "#82440a", "#a65c0e", "#c47816", "#de9a2c", "#f2c060"),
    "bark_grey": R("#16120f", "#2c2520", "#463b33", "#625347", "#7f6d5c", "#9d8a74", "#bba78e", "#dccab0"),
    "palm_bark": R("#1e1206", "#3b240c", "#5a3812", "#7a4e1a", "#9c6826", "#bc8636", "#d6a650", "#ecc87c"),
    "wood_cut": R("#3a1c06", "#5e300c", "#8a4c14", "#b46e22", "#d69238", "#ecb256", "#f8d07e", "#fff0b4"),
    "plank": R("#200e05", "#40200b", "#633312", "#87481a", "#a86224", "#c47e34", "#dca04e", "#f0c27a"),
    "plank_old": R("#1c1712", "#352b22", "#4f4233", "#6b5944", "#887257", "#a48c6c", "#bfa886", "#dcc8a8"),
    "stone": R("#0e0e18", "#24243a", "#3c3c54", "#575a70", "#75788c", "#9599a8", "#babdc6", "#e2e4ea"),
    "stone_warm": R("#16110e", "#2e2620", "#4a3e34", "#66574a", "#837262", "#a2907c", "#c2b09a", "#e2d4be"),
    "moss": R("#0c1a08", "#1a3410", "#275016", "#376c1a", "#4a8a1e", "#64a828", "#86c43a", "#b0de62"),
    "soil": R("#160a04", "#2c1608", "#43220c", "#5c3112", "#764318", "#90561f", "#aa6c2a", "#c48a42"),
    "soil_wet": R("#0c0503", "#1a0c06", "#2a1309", "#3a1c0d", "#4c2712", "#5e3218", "#723f20", "#88502a"),
    "sand": R("#3a2a14", "#5e4622", "#866634", "#a88648", "#c6a65e", "#dcc078", "#ecd698", "#f8ecc4"),
    "dirt": R("#2a1a0c", "#4a3016", "#6a4620", "#8a5e2c", "#a6783a", "#be924c", "#d4ac64", "#e8c886"),
    "clay": R("#2a0806", "#4c120a", "#741e0e", "#9c2e12", "#c24418", "#de6224", "#f08a3c", "#fcb466"),
    "brick": R("#24080a", "#44120e", "#681e14", "#8c2c1a", "#ae4022", "#c85a2e", "#de7a40", "#f0a05e"),
    "plaster": R("#3e3630", "#5e544a", "#7e7266", "#a09484", "#c0b4a2", "#dad0be", "#ece6d6", "#faf6ec"),
    "paint_green": R("#021a16", "#063028", "#0c4a38", "#14644a", "#20805c", "#349e70", "#58bc8a", "#90daac"),
    "cloth_white": R("#3c3a44", "#5e5c68", "#82808c", "#a6a4ae", "#c8c6ce", "#e2e0e6", "#f2f0f4", "#ffffff"),
    "glass": R("#0a1a2a", "#123048", "#1c4a68", "#2a6a8a", "#3e8eac", "#62b2c8", "#96d4e0", "#d0f0f4"),
    "red": R("#2a0408", "#500a10", "#7c1216", "#a81c1c", "#d22e22", "#ee5232", "#fa8a52", "#ffc08a"),
    "orange": R("#3a1004", "#661e06", "#94300a", "#c04a0e", "#e46a16", "#f8922a", "#ffbc4c", "#ffe08a"),
    "mango": R("#3a1a04", "#6a3208", "#9c500c", "#cc7412", "#ec9a1c", "#fac034", "#ffde66", "#fff4b0"),
    "yellow": R("#3a2804", "#664806", "#94700a", "#c09c10", "#e2c21c", "#f6de3c", "#fff07a", "#fffcc4"),
    "purple": R("#140620", "#2a0c40", "#42165e", "#5c247c", "#7a3698", "#9a52b4", "#bc7ed0", "#e0b2ea"),
    "pink": R("#2e0618", "#560c2e", "#801846", "#aa2a62", "#d0447e", "#ec6c9e", "#fa9cc0", "#ffcce0"),
    "white": R("#3a3a4a", "#5a5a6c", "#7e7e90", "#a2a2b2", "#c4c4d0", "#dedee6", "#f2f2f6", "#ffffff"),
    "tomato": R("#2e0404", "#560a08", "#86120c", "#b41e10", "#dc3216", "#f45424", "#fe8a46", "#ffc084"),
    "melon": R("#06200c", "#0c3814", "#14521c", "#1e6c22", "#2c8a2a", "#46a834", "#70c648", "#a8e270"),
    "melon_light": R("#183410", "#2c5418", "#467a22", "#649c2e", "#86ba40", "#a6d256", "#c6e47a", "#e4f4a6"),
    "corn": R("#3e2a04", "#6c4a06", "#9a700a", "#c49812", "#e6be22", "#f8da40", "#fff07c", "#fffcc4"),
    "husk": R("#1a2408", "#2e3e0e", "#465a14", "#62781a", "#809624", "#a2b434", "#c4d050", "#e4ea84"),
    "straw": R("#2e1e08", "#4e3410", "#725018", "#966e22", "#b88c30", "#d4aa44", "#eac862", "#f8e494"),
    "bamboo": R("#1a1a08", "#32320e", "#4e4c14", "#6c6a1c", "#8c8828", "#aca63a", "#c8c256", "#e2dc86"),
    "iron": R("#0c0c10", "#1c1c24", "#2e2e3a", "#444452", "#5c5c6c", "#787888", "#9898a6", "#bcbcc8"),
    "copper": R("#2a0c04", "#4e1a08", "#78300e", "#a24a16", "#c86a22", "#e48e36", "#f6b45a", "#ffd890"),
    "ironore": R("#1e0c08", "#3a1a12", "#5a2c1e", "#7c402c", "#9c5a40", "#ba7858", "#d49a7a", "#ecc0a4"),
    "gold": R("#2e1c02", "#5a3a04", "#8a5e06", "#ba8a0a", "#e0b414", "#f6d634", "#fff07a", "#fffcd0"),
    "gem": R("#040c2a", "#08184c", "#0e2c78", "#1846a4", "#2a68cc", "#4892e8", "#7cbcf6", "#c4e6ff"),
    "water": R("#04122a", "#0a2244", "#123660", "#1c4c7e", "#28669c", "#3c84b8", "#5ea6d0", "#94cce6"),
    "teak": R("#1a0a04", "#341408", "#52220e", "#723414", "#94481c", "#b06226", "#ca8036", "#e2a252"),
}


def pal(name):
    return PAL[name]


@contextlib.contextmanager
def artres():
    """Draw at art resolution: inside, pix.PIXEL is 1. Yields the real pixel size."""
    P = pix.PIXEL
    pix.PIXEL = 1
    try:
        yield P
    finally:
        pix.PIXEL = P


def up(small, P):
    """An art-resolution canvas blown up to screen pixels."""
    big = Canvas(small.w * P, small.h * P)
    if P == 1:
        big.rgb, big.a, big.noline = small.rgb.copy(), small.a.copy(), small.noline.copy()
        return big
    big.take_upscaled(small, P)
    return big


def asset(fn):
    """Decorator: fn(*args) draws at art resolution and returns (canvas, pivot);
    the wrapper returns the screen-size canvas and pivot."""
    def wrap(*a, **k):
        with artres() as P:
            cv, (px, py) = fn(*a, **k)
        return up(cv, P), (int(px * P + P // 2), int(py * P + P - 1))
    wrap.__name__ = fn.__name__
    wrap.__doc__ = fn.__doc__
    return wrap


LIGHT = np.array([-0.55, -0.65, 0.52])
LIGHT = LIGHT / np.linalg.norm(LIGHT)


def _n(v):
    v = np.asarray(v, float)
    return v / np.linalg.norm(v)


def clamp(t, lo=0, hi=7):
    return int(max(lo, min(hi, t)))


# ------------------------------------------------------------ leaf stamps
# codes: 'h' highlight (+1), 'm' the leaf's tone, 'd' one darker, 'D' two darker
STAMPS = {
    "oak": [[".hh.", "hmmd", "mmdd", ".dd."],
            ["hh..", "hmmd", ".mdd", "..d."],
            [".hm", "hmd", "mdd", ".d."],
            ["hhm.", "mmmd", ".mdd"]],
    "maple": [["h...h", "hmmmd", ".mmd.", "..d.."],
              [".h.", "hmm", "mmd", ".d."],
              ["h.h.", "hmmd", "mmdd", ".d.."],
              [".hh..", "hmmmd", "dmmd.", "..d.."]],
    "round": [[".hm.", "hmmm", "mmmd", ".dd."],
              ["hm.", "mmd", "mdd"],
              [".hm", "hmd", "md."]],
    "needle": [["h..", "mm.", ".md", "..d"],
               ["..h", ".mm", "dm.", "d.."],
               [".h.", "hmd", ".d."]],
    "big": [[".hh...", "hmmm..", "hmmmmd", ".mmmdd", "..mdd.", "...d.."],
            ["...hh.", "..hmmd", ".hmmmd", "mmmdd.", ".dd..."],
            [".hhm.", "hmmmd", "mmmmd", ".mdd.", "..d.."]],
}


def stamp(cv, x, y, shape, pal_, t, depth=None):
    for j, row in enumerate(shape):
        for i, ch in enumerate(row):
            if ch == ".":
                continue
            k = {"h": 1, "m": 0, "d": -1, "D": -2}[ch]
            cv.put(x + i, y + j, pal_[clamp(t + k, 1, 7)], depth)


# ------------------------------------------------------------ foliage
def crown(cv, blobs, pal_, seed, *, leaf="oak", spacing=(3, 2), bias=0.0, depth=0.0,
          inner=None, before_leaves=None, fruit=None, gap_tone=(0, 1), light_range=(1.0, 6.4),
          jitter=0.6, tone_jitter=0.4, edge=1, sparse=None):
    """A leafy mass: the union of ellipses `blobs` [(cx, cy, rx, ry)], filled
    with a dark interior, then covered with leaf stamps top to bottom, each
    shaded by where it sits on the whole crown (lit top left, dark lower right).

    before_leaves(cv, mask) can draw branches that peek between the leaves.
    Returns the mask {(x, y): light}.
    """
    rnd = random.Random(seed)
    x0 = int(min(b[0] - b[2] for b in blobs)) - 2
    x1 = int(max(b[0] + b[2] for b in blobs)) + 2
    y0 = int(min(b[1] - b[3] for b in blobs)) - 2
    y1 = int(max(b[1] + b[3] for b in blobs)) + 2
    gcx, gcy = (x0 + x1) / 2, (y0 + y1) / 2
    grx, gry = (x1 - x0) / 2, (y1 - y0) / 2
    mask = {}
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            best = None
            for (cx, cy, rx, ry) in blobs:
                dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
                r2 = dx * dx + dy * dy
                if r2 <= 1:
                    z = math.sqrt(1 - r2) * min(rx, ry) + (cy - gcy) * 0.3
                    if best is None or z > best[0]:
                        best = (z, dx, dy, r2)
            if best is None:
                continue
            _, dx, dy, r2 = best
            gx, gy = (x + 0.5 - gcx) / grx, (y + 0.5 - gcy) / gry
            gz = math.sqrt(max(0.0, 1 - min(1.0, gx * gx + gy * gy)))
            n = _n(_n([gx, gy, gz + 0.3]) * 0.7 + _n([dx, dy, math.sqrt(1 - r2) + 0.2]) * 0.3)
            mask[(x, y)] = float(n @ LIGHT) + bias
    # dark interior: what shows between the leaves
    for (x, y), l in mask.items():
        cv.put(x, y, pal_[gap_tone[1] if l > 0.1 else gap_tone[0]], depth)
    if before_leaves is not None:
        before_leaves(cv, mask)
    # leaves on a jittered grid, drawn top to bottom so each row overlaps the one above
    sx, sy = spacing
    leaves = []
    row = 0
    y = y0 - 1
    while y <= y1:
        off = (sx / 2) if row % 2 else 0
        x = x0 - 1 + off
        while x <= x1:
            jx, jy = x + rnd.uniform(-jitter, jitter), y + rnd.uniform(-jitter * 0.7, jitter * 0.7)
            c = (int(round(jx)) + 1, int(round(jy)) + 1)
            if c in mask and not (sparse is not None and rnd.random() < sparse(*c)):
                leaves.append((jy, jx, mask[c]))
            x += sx
        y += sy
        row += 1
    leaves.sort()
    lo, hi = light_range
    shapes = STAMPS[leaf]
    for (ly, lx, l) in leaves:
        k = max(0.0, min(1.0, (l + 0.35) / 1.3))
        t = lo + k * (hi - lo) + rnd.uniform(-tone_jitter, tone_jitter)
        stamp(cv, int(round(lx)), int(round(ly)), rnd.choice(shapes), pal_, clamp(round(t), 1, 6),
              None if depth is None else depth + 1)
    return mask


def shade_below(cv, mask, pal_trunk, rows=3):
    """The crown shades the trunk/branches right under its lower edge."""
    idx = {c: i for i, c in enumerate(pal_trunk)}
    cols = {}
    for (x, y) in mask:
        cols[x] = max(cols.get(x, -1), y)
    for x, yb in cols.items():
        for k in range(1, rows + 1):
            c = cv.get(x, yb + k)
            if c in idx:
                cv.put(x, yb + k, pal_trunk[max(0, idx[c] - (2 if k < rows else 1))])


# ------------------------------------------------------------ wood
def trunk(cv, cx, y_bot, y_top, w_bot, w_top, pal_, seed, *, flare=3, roots=True, lean=0.0,
          bend=None, depth=None, streaks=True):
    """A round trunk in warm wood tones: lit left, shaded right, a dark right
    edge, vertical light and dark streaks, a flared foot with root toes."""
    rnd = random.Random(seed)
    H = y_bot - y_top
    cols = {}
    for k in range(int(w_bot + flare * 2 + 4)):
        cols[k] = None
    # streak pattern across the width (as a fraction -1..1) with lengths
    st = []
    if streaks:
        for _ in range(int(H / 4) + 3):
            s = rnd.uniform(-0.75, 0.7)
            a = rnd.uniform(0, H)
            st.append((s, a, a + rnd.uniform(3, 9), rnd.choice((1, 1, -1, -2))))
    for i in range(H + 1):
        y = y_bot - i
        t = i / max(1, H)
        w = w_bot + (w_top - w_bot) * t + flare * max(0.0, 1 - i / 4.0) ** 1.5
        c = cx + lean * i + (bend(i) if bend else 0)
        xl, xr = int(round(c - w / 2)), int(round(c + w / 2))
        for x in range(xl, xr + 1):
            s = (x + 0.5 - c) / (w / 2 + 0.01)
            b = 5 if s < -0.45 else (4 if s < 0.05 else (3 if s < 0.55 else 2))
            for (ss, a, e, k) in st:
                if a <= i <= e and abs(s - ss) < 1.1 / (w / 2 + 0.01):
                    b += k
                    break
            if x == xr:
                b = 1
            elif x == xl and b > 4:
                b = 6 if i % 7 else 5
            cv.put(x, y, pal_[clamp(b, 1, 7)], depth)
    if roots:
        # a root toe on each side of the foot
        wb = w_bot + flare
        for side in (-1, 1):
            ex = int(round(cx + side * (wb / 2 + 1)))
            for j, (ox, oy) in enumerate(((0, 0), (side, 0), (0, -1))):
                cv.put(ex + ox, y_bot + oy, pal_[(4 if side < 0 else 2) - (j == 1)], depth)


def branch(cv, pts, w0, w1, pal_, depth=None, clip=None):
    """A branch along points: lit upper side, dark lower side. `clip` is an
    optional set of the only pixels it may cover (e.g. the crown)."""
    L = len(pts)
    for i in range(L - 1):
        (xa, ya), (xb, yb) = pts[i], pts[i + 1]
        n = int(max(abs(xb - xa), abs(yb - ya))) + 1
        for k in range(n + 1):
            t = (i + k / n) / (L - 1)
            x = xa + (xb - xa) * k / n
            y = ya + (yb - ya) * k / n
            w = w0 + (w1 - w0) * t
            for j in range(int(-w / 2), int(math.ceil(w / 2))):
                q = (int(round(x + j)), int(round(y)))
                if clip is None or q in clip:
                    cv.put(q[0], q[1], pal_[4 if j < 0 else 2], depth)


def ball(cv, cx, cy, rx, ry, pal_, *, lo=1, hi=6, spot=True, depth=None, rim=True):
    """A shaded round thing (fruit, berry, pebble)."""
    pts = []
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - rx - 1), int(cx + rx + 2)):
            dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
            r2 = dx * dx + dy * dy
            if r2 <= 1.0:
                pts.append((x, y, dx, dy, r2))
    pset = {(p[0], p[1]) for p in pts}
    for (x, y, dx, dy, r2) in pts:
        l = float(_n([dx, dy, math.sqrt(1 - r2) + 0.1]) @ LIGHT)
        t = lo + (l + 0.6) / 1.6 * (hi - lo)
        if rim and ((x + 1, y) not in pset or (x, y + 1) not in pset) and dx + dy > 0:
            t = lo
        cv.put(x, y, pal_[clamp(round(t), lo, hi)], depth)
    if spot:
        cv.put(int(cx - rx * 0.4), int(cy - ry * 0.45), pal_[7], None if depth is None else depth + 1)
    return pset


# ------------------------------------------------------------ layers
def outlined(cv, draw):
    """Draw something on its own layer and set it on `cv` with an outline where
    it overlaps what is already there (the sprite's outer outline comes later),
    so a leaf or a fruit in front reads apart from what is behind it."""
    tmp = Canvas(cv.w, cv.h)
    draw(tmp)
    ring = Canvas(cv.w, cv.h)
    ring.rgb, ring.a = tmp.rgb.copy(), tmp.a.copy()
    ring.outline()
    edge = ring.a & ~tmp.a & cv.a
    cv.rgb[edge] = ring.rgb[edge]
    cv.rgb[tmp.a] = tmp.rgb[tmp.a]
    cv.a |= tmp.a


def overlay(cv, draw):
    """Draw at art resolution on a layer the size of the screen canvas `cv`
    (draw(small, P) gets the art canvas and the pixel size) and lay it over cv."""
    with artres() as P:
        small = Canvas(cv.w // P, cv.h // P)
        draw(small, P)
    big = up(small, P)
    m = big.a
    cv.rgb[m] = big.rgb[m]
    cv.a |= m
