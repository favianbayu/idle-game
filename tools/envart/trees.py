"""Trees in a Stardew-Valley-like style: mangga, hutan, jati, kemarau, kelapa,
pisang, saplings and stumps.

A broadleaf tree is a warm golden-brown trunk with streaks and root toes,
branches that fork up into the crown, and a dense crown of small leaf stamps
over a dark interior (see sv.crown). Drawn at art resolution, see sv.asset.
"""
import math
import random

from pix import Canvas
import sv
from sv import PAL, asset, clamp


def _branches(bx, top_y, spread, rnd, pal_, n=4, length=(14, 22)):
    """A callback for sv.crown that draws forking branches into the crown."""
    def draw(cv, mask):
        for k in range(n):
            side = -1 if k % 2 == 0 else 1
            a = -math.pi / 2 + side * rnd.uniform(0.35, 0.9) * (0.5 + k / n)
            L = rnd.uniform(*length)
            x0, y0 = bx + side * 1, top_y
            pts = [(x0, y0)]
            x, y = x0, y0
            for s in range(3):
                x += math.cos(a) * L / 3
                y += math.sin(a) * L / 3
                a += side * rnd.uniform(0.0, 0.25)
                pts.append((x, y))
            sv.branch(cv, pts, 3, 1, pal_, clip=mask)
            # a twig off each branch
            mx, my = pts[2]
            sv.branch(cv, [(mx, my), (mx + side * 5, my - 4)], 1, 1, pal_, clip=mask)
    return draw


KINDS = {
    #          leaf palette   bark        stamp    crown (rx, ry)  trunk h, w0, w1
    "mangga": ("leaf", "bark", "oak", (26, 29), 22, 9, 7),
    "hutan": ("leaf_dark", "bark", "maple", (29, 32), 24, 10, 7),
    "jati": ("leaf_olive", "bark_grey", "big", (23, 34), 28, 8, 6),
    "kemarau": ("leaf_autumn", "bark", "maple", (26, 28), 22, 9, 7),
}


@asset
def broadleaf(seed, *, kind="mangga", fruit=False):
    leaf, bark, stamp_kind, (rx, ry), th, w0, w1 = KINDS[kind]
    W, H = 2 * rx + 16, 2 * ry + th + 14
    cv = Canvas(W, H)
    rnd = random.Random(seed)
    lp, bp = PAL[leaf], PAL[bark]
    bx, by = W // 2, H - 4
    ccx, ccy = bx, by - th - ry + 6
    sv.trunk(cv, bx, by, ccy + 6, w0, w1, bp, seed, flare=2)
    # the crown: an egg-shaped core with leafy bulges all round its edge
    blobs = [(ccx, ccy, rx * 0.86, ry * 0.88)]
    nb = 9
    for k in range(nb):
        a = 2 * math.pi * k / nb + rnd.uniform(-0.2, 0.2)
        r = rnd.uniform(0.32, 0.42)
        blobs.append((ccx + math.cos(a) * rx * (0.98 - r), ccy + math.sin(a) * ry * (0.98 - r),
                      rx * r, ry * r * 0.95))
    spacing = {"oak": (4, 3), "maple": (5, 3), "big": (5, 3)}[stamp_kind]
    jit = {"oak": 0.6, "maple": 1.2, "big": 1.4}[stamp_kind]
    def sparse(x, y):
        # fewer leaves low in the middle, so the branches show through
        if y > ccy + ry * 0.3 and abs(x - bx) < rx * 0.45:
            return 0.3
        return 0.0
    mask = sv.crown(cv, blobs, lp, seed, leaf=stamp_kind, spacing=spacing, sparse=sparse, jitter=jit,
                    before_leaves=_branches(bx, ccy + ry * 0.95, rx, rnd, bp, n=5, length=(18, 26)))
    sv.shade_below(cv, mask, bp)
    if fruit:
        mp = PAL["mango"]
        spots = []
        keys = sorted(mask)
        for _ in range(400):
            x, y = rnd.choice(keys)
            if mask[(x, y)] < -0.25 or y < ccy - ry * 0.5:
                continue
            if any(abs(x - a) < 6 and abs(y - b) < 6 for a, b in spots):
                continue
            spots.append((x, y))
            if len(spots) >= 8:
                break
        for (x, y) in sorted(spots, key=lambda p: p[1]):
            mango(cv, x, y, mp)
    return cv, (bx, by)


def mango(cv, x, y, mp):
    """A small hanging mango: a stalk, an oval body, a warm shine."""
    cv.put(x, y - 3, PAL["bark"][2])
    pts = [(0, -2), (1, -2), (-1, -1), (0, -1), (1, -1), (2, -1), (-1, 0), (0, 0), (1, 0), (2, 0),
           (-1, 1), (0, 1), (1, 1), (2, 1), (0, 2), (1, 2)]
    for dx, dy in pts:
        t = 5 - (dx + dy > 1) - (dx + dy > 2) + (dx + dy < 0)
        cv.put(x + dx, y + dy, mp[clamp(t, 2, 6)])
    cv.put(x, y - 1, mp[7])
    for dx, dy in ((-2, 0), (-2, 1), (-1, 2), (0, 3), (1, 3), (2, 2), (3, 1), (3, 0), (2, -2), (-1, -2), (0, -3), (1, -3), (3, -1), (-2, -1)):
        if cv.get(x + dx, y + dy) is not None and cv.get(x + dx, y + dy) not in mp:
            cv.put(x + dx, y + dy, mp[0] if dx + dy > 0 else mp[1])


@asset
def palm(seed, coconuts=True):
    """Pohon kelapa: a bulging ringed trunk that leans and curves, a crown of
    long arching fronds made of leaflets."""
    W, H = 84, 112
    cv = Canvas(W, H)
    rnd = random.Random(seed)
    bp, lp = PAL["palm_bark"], PAL["palm"]
    bx, by = W // 2 - 6, H - 4
    TH = 64

    def bend(i):
        return 12 * (i / TH) ** 1.7

    # trunk as stacked rounded segments
    for i in range(TH + 1):
        y = by - i
        seg = i % 5
        w = 8 - 2 * (i / TH) + (1 if seg in (1, 2) else 0) + 3 * max(0, 1 - i / 4) ** 1.5
        c = bx + bend(i)
        xl, xr = int(round(c - w / 2)), int(round(c + w / 2))
        for x in range(xl, xr + 1):
            s = (x + 0.5 - c) / (w / 2 + 0.01)
            b = 5 if s < -0.4 else (4 if s < 0.15 else 3)
            if seg == 0:
                b -= 2
            elif seg == 1 and s < 0.3:
                b += 1
            if x == xr:
                b = 1
            cv.put(x, y, bp[clamp(b, 1, 7)])
    tx, ty = bx + bend(TH), by - TH
    angles = [200, 235, 270, 305, 340, 160, 20, 125, 55]
    fr = []
    for a in angles:
        ang = math.radians(a + rnd.uniform(-8, 8))
        back = math.sin(ang) < -0.35
        fr.append((0 if back else (1 if math.sin(ang) < 0.3 else 2), ang, rnd.uniform(30, 36)))
    fr.sort(key=lambda f: f[0])
    for layer, ang, L in fr:
        frond(cv, tx, ty, ang, L, lp, rnd, layer)
    if coconuts:
        cp = PAL["palm_bark"]
        for dx, dy in ((-3, 3), (2, 3), (0, 5)):
            sv.ball(cv, tx + dx, ty + dy, 2.4, 2.4, cp, lo=1, hi=5)
    return cv, (bx, by)


def frond(cv, x0, y0, ang, L, lp, rnd, layer):
    """A palm frond: an arching midrib with leaflets hanging off both sides."""
    dx, dy = math.cos(ang), math.sin(ang) * 0.6
    spine = []
    for i in range(int(L)):
        t = i / L
        spine.append((x0 + dx * i, y0 + dy * i - 5 * math.sin(t * math.pi * 0.8) + 14 * t ** 3, t))
    dim = [-1, 0, 1][layer]
    for j in range(1, len(spine) - 1):
        x, y, t = spine[j]
        nx, ny = spine[j + 1][0] - x, spine[j + 1][1] - y
        d = math.hypot(nx, ny) or 1
        nx, ny = nx / d, ny / d
        ln = 6 * math.sin(min(1.0, t * 1.15 + 0.1) * math.pi) + 1
        for side in (-1, 1):
            px, py = -ny * side, nx * side
            hang = py > 0
            l2 = ln * (1.0 if hang else 0.6)
            lx, ly = x, y
            for k in range(int(l2)):
                f = k / max(1.0, l2)
                lx += px * 0.75 + nx * 0.55
                ly += py * 0.75 + ny * 0.55 + 0.35 + f * 0.5
                b = (5 if not hang else 4) - (1 if f > 0.55 else 0) - (1 if f > 0.85 else 0) + dim
                if (j + k) % 3 == 0 and f > 0.2:
                    b -= 1                       # gaps between leaflets
                cv.put(int(round(lx)), int(round(ly)), lp[clamp(b, 1, 7)])
    for (x, y, t) in spine:
        cv.put(int(round(x)), int(round(y)), lp[clamp(5 + dim + (t < 0.5), 1, 7)])


@asset
def banana(seed):
    """Pohon pisang: a soft green stem, big paddle leaves with ribs and tears,
    a hanging bunch with its purple heart."""
    W, H = 70, 86
    cv = Canvas(W, H)
    rnd = random.Random(seed)
    sp = PAL["banana"]
    bx, by = W // 2, H - 4
    SH = 32
    sv.trunk(cv, bx, by, by - SH, 8, 6, sp, seed, flare=2, roots=False)
    top = (bx, by - SH)
    leaves = [(-104, 28, 0), (-74, 28, 0), (-134, 30, 1), (-44, 30, 1), (-166, 26, 2), (-12, 27, 2)]
    for a, L, layer in leaves:
        paddle(cv, top[0], top[1] + 1, math.radians(a + rnd.uniform(-5, 5)), L, sp, rnd, layer)
    # bunch
    fp = PAL["husk"]
    hx, hy = top[0] + 6, top[1] + 6
    for i in range(6):
        cv.put(hx - 1 + i // 3, hy - 4 + i, sp[2])
    for row in range(3):
        n = 3 - (row == 2)
        for c in range(n):
            fx = hx - n + c * 2 + (row % 2)
            fy = hy + row * 3
            for k in range(3):
                cv.put(fx, fy + k, fp[5 - k])
                cv.put(fx + 1, fy + k, fp[3 - (k > 1)])
    sv.ball(cv, hx + 1, hy + 12, 2, 3, PAL["purple"], lo=1, hi=5)
    return cv, (bx, by)


def paddle(cv, x0, y0, ang, L, pal_, rnd, layer):
    """A banana leaf: a long blade that rises then droops, light upper half,
    darker lower half, a pale midrib, slanted veins and one tear."""
    spine = []
    x, y = x0, y0
    down = math.pi / 2 if math.cos(ang) >= 0 else -1.5 * math.pi
    for i in range(int(L)):
        t = i / L
        a = ang + (down - ang) * (t ** 1.8) * (0.22 + 0.6 * abs(math.cos(ang)))
        spine.append((x, y, t))
        x += math.cos(a)
        y += math.sin(a) * 0.9
    dim = [-1, 0, 0][layer]
    tear = int(rnd.uniform(0.45, 0.7) * len(spine))
    for j in range(len(spine) - 1):
        x, y, t = spine[j]
        nx, ny = spine[j + 1][0] - x, spine[j + 1][1] - y
        d = math.hypot(nx, ny) or 1
        nx, ny = nx / d, ny / d
        px, py = -ny, nx
        wid = 4.4 * math.sin(min(1.0, t * 0.95 + 0.06) * math.pi) ** 0.5 + 0.3
        s = -wid
        while s <= wid:
            upper = (py * s) < 0 or (abs(py) < 0.1 and s < 0)
            if abs(j - tear) <= 0 and not upper and abs(s) > 1.5:
                s += 0.5
                continue
            b = 5 if upper else 4
            if (j + int(abs(s) * 1.4)) % 4 == 0 and abs(s) > 1:
                b -= 1                                  # slanted veins
            if abs(s) > wid - 1:
                b = 3 if upper else 1
            cv.put(int(round(x + px * s)), int(round(y + py * s)), pal_[clamp(b + dim, 1, 7)])
            s += 0.5
        if t < 0.88:
            cv.put(int(round(x)), int(round(y)), pal_[clamp(6 + dim, 1, 7)])


@asset
def sapling(seed, stage):
    """Young tree stages: 0 seedling, 1 sapling, 2 young tree."""
    sizes = [(16, 16), (26, 34), (46, 60)]
    W, H = sizes[stage]
    cv = Canvas(W, H)
    rnd = random.Random(seed)
    bp, lp = PAL["bark"], PAL["leaf"]
    bx, by = W // 2, H - 3
    if stage == 0:
        for i in range(5):
            cv.put(bx, by - i, lp[4 if i < 3 else 5])
        sv.stamp(cv, bx - 4, by - 7, ["hm..", "mmmd", ".dd."], lp, 5)
        sv.stamp(cv, bx + 1, by - 8, [".hm.", "mmmd", ".dd."], lp, 4)
        cv.put(bx, by - 6, lp[6])
    elif stage == 1:
        sv.trunk(cv, bx, by, by - 16, 3, 2, bp, seed, flare=1, roots=False, streaks=False)
        sv.crown(cv, [(bx, by - 21, 8, 7), (bx - 4, by - 18, 5, 4), (bx + 4, by - 18, 5, 4)], lp, seed,
                 leaf="oak", spacing=(3, 2))
    else:
        sv.trunk(cv, bx, by, by - 30, 6, 4, bp, seed, flare=2)
        mask = sv.crown(cv, [(bx, by - 38, 16, 15), (bx - 9, by - 32, 9, 8), (bx + 9, by - 33, 9, 8),
                             (bx, by - 48, 10, 7)], lp, seed, leaf="oak", spacing=(3, 2),
                        before_leaves=_branches(bx, by - 28, 14, rnd, bp, n=3, length=(8, 12)))
        sv.shade_below(cv, mask, bp)
    return cv, (bx, by)


@asset
def stump(seed, big=False, huge=False):
    """Tunggul: a cut stump with growth rings on top and root toes.
    huge is an old stump wide enough for a 2 x 2 tile footprint."""
    W, H = (66, 46) if huge else ((44, 32) if big else (28, 22))
    cv = Canvas(W, H)
    bp, wp = PAL["bark"], PAL["wood_cut"]
    bx, by = W // 2, H - (4 if huge else 3)
    rw = 30 if huge else (18 if big else 11)
    th = 13 if huge else (9 if big else 6)
    big = big or huge
    sv.trunk(cv, bx, by, by - th, rw, rw, bp, seed, flare=5 if huge else (3 if big else 2))
    cx, cy = bx, by - th
    rx, ry = rw / 2 + 0.5, rw / 4 + 0.5
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - rx - 1), int(cx + rx + 2)):
            dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
            r = math.hypot(dx, dy)
            if r <= 1:
                ring = int(r * (6 if huge else (4 if big else 3))) % 2
                t = 5 - ring + (1 if dx + dy < -0.5 else 0)
                if r > 0.82:
                    t = 6 if dy < 0 else 3
                cv.put(x, y, wp[clamp(t, 1, 7)])
    cv.put(cx, cy, wp[3])
    cv.line(cx, cy, cx + rx * 0.6, cy + ry * 0.5, wp[3])
    return cv, (bx, by)
