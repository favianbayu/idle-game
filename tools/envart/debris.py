"""Debris and ground clutter (twigs, logs, weeds, rubble, broken fences, crates)
plus bushes and flowers. Ruined pieces lean toward the farm's broken barn,
greenhouse and granary (Kebun Warisan starts in ruins)."""
import math
import random

import numpy as np

import pix
from pix import Canvas, Noise, ramp, toon
from iso import IsoScene, bricks, solid, LW, EV, FS, LIGHT_W
from plants import leaf, strap, spine_path, flower, stalk
import toon as T
from toon import DEEP, SHADOW, MID, LIGHT, HI


# ------------------------------------------------------------ 2D clutter
def stick(cv, x0, y0, x1, y1, pal, rnd, fork=True, w=1):
    """A chunky twig: lit top edge, shaded underside, a light cut end."""
    P = pix.PIXEL
    L = max(1, int(math.hypot(x1 - x0, y1 - y0)))
    dx, dy = (x1 - x0) / L, (y1 - y0) / L
    for i in range(0, L + 1):
        x, y = x0 + dx * i, y0 + dy * i
        cv.put(x, y - P * w, pal[LIGHT])
        if w > 1:
            cv.put(x, y, pal[MID])
        cv.put(x, y + P * (w > 1), pal[SHADOW])
    if fork:
        i = int(L * rnd.uniform(0.35, 0.65))
        fx, fy = x0 + dx * i, y0 + dy * i
        a = math.atan2(dy, dx) + rnd.choice([-0.8, 0.8])
        l2 = L * 0.32
        for k in range(int(l2)):
            cv.put(fx + math.cos(a) * k, fy + math.sin(a) * k - P, pal[MID])
    cv.put(x1, y1 - P * (w > 1), toon("wood_cut")[LIGHT])


def ranting(seed):
    cv = Canvas(64, 40)
    rnd = random.Random(seed)
    bp = toon("bark")
    for k in range(3):
        a = rnd.uniform(-0.45, 0.45) + (0 if k % 2 else math.pi * 0.9)
        cx, cy = 32 + rnd.uniform(-6, 6), 24 + rnd.uniform(-3, 3)
        L = rnd.uniform(28, 36)
        stick(cv, cx - math.cos(a) * L / 2, cy - math.sin(a) * L / 2 * 0.6,
              cx + math.cos(a) * L / 2, cy + math.sin(a) * L / 2 * 0.6, bp, rnd, w=2)
    for k in range(3):     # a few dry leaves
        dry_leaf(cv, 32 + rnd.randint(-18, 18), 27 + rnd.randint(-5, 5), rnd)
    return cv, (32, 32)


def dry_leaf(cv, x, y, rnd, L=10):
    pal = toon(rnd.choice(["orange", "straw", "leaf_yellow", "dirt"]))
    a = rnd.uniform(0, math.pi * 2)
    T.outlined(cv, lambda c: leaf(c, x, y, a, L, 3.4, pal, rib=True))


def daun_kering(seed):
    cv = Canvas(80, 44)
    rnd = random.Random(seed)
    for k in range(11):
        dry_leaf(cv, rnd.randint(14, 66), rnd.randint(12, 32), rnd, L=rnd.randint(9, 12))
    return cv, (40, 30)


def kayu_tumbang(seed, w=124, h=80):
    """A fallen log lying along the grid's X axis (screen down-right), cut end toward us.

    The log is swept as round cross-sections from the far end to the near end,
    each shaded from its world normal, then capped with a ringed cut face."""
    P = pix.PIXEL
    cv = Canvas(w, h)
    rnd = random.Random(seed)
    bp, wp, mp = toon("bark"), toon("wood_cut"), toon("mossy")
    rw = 11.0                       # radius in world units
    L = 64
    ox, oy = 26, 30                 # screen point of the far end's axis
    def scr(X, Y, Z):
        return ox + X - Y, oy + (X + Y) / 2 - Z
    lines = [rnd.uniform(-2.4, 2.4) for _ in range(3)]
    for X in np.arange(0, L, 0.5):
        for ang in np.arange(0, 2 * math.pi, 0.05):
            ny, nz = math.cos(ang), math.sin(ang)
            n = np.array([0.0, ny, nz])
            x, y = scr(X, ny * rw, nz * rw + rw)
            l = float(n @ LIGHT_W)
            b = LIGHT if l > 0.55 else (MID if l > -0.05 else SHADOW)
            if any(abs(ang - la) < 0.09 and (X // 6) % 3 != 1 for la in lines) and b > SHADOW:
                b -= 1          # bark lines along the log
            col = bp[b]
            if l > 0.62 and (X - 29) ** 2 / 100 + (ang - 1.9) ** 2 / 0.5 < 1:
                col = mp[LIGHT if l > 0.8 else MID]     # a moss patch on top
            cv.put(x, y, col, X + ny * rw)
    # the near cut end: a disc in the YZ plane at X = L
    cx, cy = scr(L, 0, rw)
    for yy in T.blocks(cy - rw * 1.6, cy + rw * 1.6):
        for xx in T.blocks(cx - rw * 1.4, cx + rw * 1.4):
            dx, dy = xx + P / 2 - cx, yy + P / 2 - cy
            a = -dx / rw                      # Y component
            b_ = (0.5 * a * rw - dy) / rw     # Z component
            r = math.hypot(a, b_)
            if r <= 1.0:
                b = (HI, LIGHT)[int(r * 3.2) % 2]
                if r > 0.82:
                    b = MID if b_ > 0 else SHADOW
                cv.put(xx, yy, wp[b], 1e6)
    # a branch stub on top and a pair of mushrooms at its foot
    sx, sy = scr(22, -2, rw * 2)
    for k in range(4):
        cv.put(sx + k, sy - k * P, bp[MID], 1e6)
        cv.put(sx + k + P, sy - k * P, bp[SHADOW], 1e6)
    cv.put(sx + 4, sy - 4 * P, wp[LIGHT], 1e6)
    mx, my = scr(44, rw + 3, 0)
    mush(cv, mx, my)
    mush(cv, mx + 7, my + 3, small=True)
    ax, ay = scr(L / 2, 0, 0)
    return cv, (int(ax), int(ay + 4))


def mush(cv, x, y, small=False):
    """A little red-capped mushroom with white dots."""
    P = pix.PIXEL
    rp, wp = toon("red"), toon("white")
    r = 4 if small else 6
    for k in range(2 if small else 3):
        cv.put(x, y - k * P, wp[MID if k == 0 else LIGHT], 1e7)
    cells = T.ellipse_cells(x, y - (2 if small else 3) * P, r, r * 0.7)
    for (xx, yy), (dx, dy) in cells.items():
        if dy > 0.25:
            continue
        b = LIGHT if dx + dy < -0.3 else (MID if dx < 0.4 else SHADOW)
        cv.put(xx, yy, rp[b], 1e7)
    if not small:
        cv.put(x - 2, y - 4 * P, wp[HI], 1e7)
        cv.put(x + 2, y - 3 * P, wp[HI], 1e7)


def rumput(seed, kind="tuft"):
    """Weeds: 'tuft' grass clump, 'leafy' broad weed, 'pakis' fern, 'alang' tall grass."""
    rnd = random.Random(seed)
    if kind == "alang":
        cv = Canvas(72, 84)
        bx, by = 36, 78
    else:
        cv = Canvas(64, 52)
        bx, by = 32, 46
    g = toon("grass")
    if kind in ("tuft", "alang"):
        n = 7 if kind == "tuft" else 9
        H = 26 if kind == "tuft" else 50
        blades = []
        for i in range(n):
            side = (i - (n - 1) / 2) / ((n - 1) / 2)
            a = -math.pi / 2 + side * 0.7 + rnd.uniform(-0.08, 0.08)
            blades.append((abs(side), a, H * rnd.uniform(0.75, 1.0) * (1 - 0.3 * abs(side)), side))
        blades.sort(key=lambda b: -b[0])
        for _, a, L, side in blades:
            strap(cv, bx + side * 6, by, a, L, 2.6, g, bend=side * 0.8, dim=-1 if abs(side) > 0.7 else 0)
        if kind == "alang":
            wp = toon("white")
            for k in range(3):     # fluffy white seed heads on thin stalks
                x, y = bx + (k - 1) * 11, by - 58 - (k == 1) * 8
                for yy in T.blocks(y + 8, by - 10):
                    cv.put(bx + (k - 1) * 3 + (x - bx - (k - 1) * 3) * (by - 10 - yy) / max(1, by - 18 - y),
                           yy, g[MID], -1)
                T.ball(cv, x, y, 3.2, 7, wp, spot=False, depth=10)
    elif kind == "leafy":
        for k, a in enumerate((-2.65, -0.5, -2.15, -1.0, -1.57)):
            leaf(cv, bx, by, a + rnd.uniform(-0.06, 0.06), 17 + rnd.randint(0, 3), 5.5, g,
                 droop=0.12, dim=-1 if k < 2 else 0)
        flower(cv, bx - 2, by - 24, toon("yellow"))
    elif kind == "pakis":
        for k, a in enumerate((-2.55, -0.6, -2.05, -1.1, -1.6)):
            fern_frond(cv, bx, by, a, 28 + rnd.randint(-2, 3), g, dim=-1 if k < 2 else 0)
    return cv, (bx, by)


def fern_frond(cv, x0, y0, a, L, pal, dim=0):
    """A fern frond: a tapering blade with a notched (leaflet) edge."""
    pts = spine_path(x0, y0, a, L, bend=(0.9 if math.cos(a) > 0 else -0.9) * min(1, abs(math.cos(a)) * 2), droop=0.08)
    for j in range(len(pts) - 1):
        x, y, t = pts[j]
        nx, ny = pts[j + 1][0] - x, pts[j + 1][1] - y
        d = math.hypot(nx, ny) or 1
        nx, ny = nx / d, ny / d
        px, py = -ny, nx
        w = 6.5 * math.sin(min(1.0, t * 1.05 + 0.05) * math.pi) * (0.5 if (j // 4) % 2 else 1.0) + 0.5
        s = -w
        while s <= w:
            upper = (py * s) < 0
            b = LIGHT if upper else MID
            if abs(s) > w - 1.3:
                b = MID if upper else SHADOW
            cv.put(x + px * s, y + py * s, pal[max(DEEP, b + dim)])
            s += 0.5
        if t < 0.85:
            cv.put(x, y, pal[max(DEEP, SHADOW + dim)])


def semak(seed, kind="hijau"):
    """Bushes: 'hijau' plain, 'buah' berry bush, 'sepatu' hibiscus, 'melati' jasmine."""
    P = pix.PIXEL
    cv = Canvas(76, 64)
    rnd = random.Random(seed)
    lp = toon("leaf_dark" if kind in ("sepatu", "melati") else "leaf")
    bx, by = 38, 56
    items = [(bx - 16, by - 16, 15, 0), (bx + 16, by - 16, 15, 0), (bx, by - 28, 17, 1),
             (bx - 7, by - 12, 14, 2), (bx + 9, by - 11, 13, 2)]
    T.puffs(cv, items, lp, center=(bx, by - 20), radii=(32, 22), seed=seed, depth=0)
    spots = []
    for _ in range(300):
        x, y = bx + rnd.uniform(-26, 26), by - rnd.uniform(6, 40)
        q = (int(x) - int(x) % P, int(y) - int(y) % P)
        if not cv.a[q[1], q[0]]:
            continue
        if any(math.hypot(x - a, y - b) < (8 if kind != "melati" else 6) for a, b in spots):
            continue
        spots.append((x, y))
    if kind == "buah":
        for x, y in spots[:9]:
            T.ball(cv, x, y, 3.2, 3.2, toon("red"), depth=100)
    elif kind == "sepatu":
        for x, y in spots[:5]:
            hibiscus(cv, x, y)
    elif kind == "melati":
        for x, y in spots[:10]:
            flower(cv, x, y, toon("white"))
    return cv, (bx, by)


def hibiscus(cv, x, y):
    """Kembang sepatu: a big round red flower with a yellow stamen."""
    P = pix.PIXEL
    rp = toon("red")
    cells = T.ellipse_cells(x, y, 6, 5, edge=lambda a: 0.85 + 0.15 * abs(math.cos(a * 2.5)))
    for (xx, yy), (dx, dy) in cells.items():
        b = LIGHT if dx + dy < -0.2 else MID
        if T.lower_right_edge(cells, xx, yy) and dx + dy > 0:
            b = SHADOW
        cv.put(xx, yy, rp[b], 200)
    cv.put(x, y, rp[DEEP], 201)
    cv.put(x + P, y - P, toon("yellow")[HI], 201)


def big_flower(cv, x, y, pal):
    """A round 5-petal wild flower with a yellow eye."""
    cells = T.ellipse_cells(x, y, 5, 4.6, edge=lambda a: 0.82 + 0.18 * abs(math.cos(a * 2.5 + 0.3)))
    for (xx, yy), (dx, dy) in cells.items():
        b = HI if dx + dy < -0.6 else (LIGHT if dx + dy < 0.2 else MID)
        cv.put(xx, yy, pal[b], 200)
    yp = toon("yellow") if pal is not toon("yellow") else toon("orange")
    cv.put(x, y, yp[MID], 201)


def bunga_liar(seed, color="yellow"):
    P = pix.PIXEL
    cv = Canvas(64, 52)
    rnd = random.Random(seed)
    g = toon("grass")
    spots = sorted([(32 + dx + rnd.randint(-2, 2), 44 + dy) for dx, dy in ((-16, -2), (0, -4), (14, -1), (-6, 2), (8, 3))],
                   key=lambda p: p[1])
    for (x, y) in spots:
        h = rnd.randint(12, 18)
        stalk(cv, x, y, y - h, g, w=1)
        leaf(cv, x, y - 1, -2.6, 8, 2.6, g, rib=False)
        leaf(cv, x + P, y - 3, -0.55, 8, 2.6, g, rib=False, dim=-1)
        big_flower(cv, x, y - h - 2, toon(color))
    return cv, (32, 44)


# ------------------------------------------------------------ iso pieces
def iso_canvas(w, h, ox, oy):
    return IsoScene(w, h, ox, oy)


def peti(seed, broken=False):
    """Wooden crate, 28 units a side; broken: top boards gone, a side board kicked in."""
    sc = IsoScene(72, 72, 36, 44)
    s = 28
    fr, lw, bp, tp = (3 if pix.PIXEL == 1 else 4), LW(1), EV(6 * FS()), EV(7 * FS())
    def side(u, v, broken_side=False):
        if u < fr or u > s - fr or v < fr or v > s - fr:
            return ("plank", 3)
        if abs(u - v) < LW(2):
            return ("plank", 2)
        if broken_side and 8 < u < 20 and 6 < v < 20:
            return ("plank", 0)
        k = v % bp
        return ("plank", 4 if k > lw else 2)
    def top(u, v):
        if broken and 4 < u < s - 4 and 6 < v < s - 4:
            return ("plank", 0)
        k = u % tp
        return ("plank", 5 if k > lw else 3)
    sc.box(0, 0, 0, s, s, s, top=top, sw=lambda u, v: side(u, v, broken), se=side)
    cv = sc.render(outline=False)
    if broken:
        rnd = random.Random(seed)
        br = toon("plank")
        stick(cv, 14, 66 - 8, 30, 62 - 8, br, rnd, fork=False)
        stick(cv, 40, 64, 56, 58, br, rnd, fork=False)
    cv.outline()
    return cv, (36, 44 + int(s))


def papan_patah(seed):
    """A pile of broken planks with nails, leftovers of the old barn."""
    sc = IsoScene(96, 64, 48, 24)
    pl = "plank_old"
    pieces = [(-20, 4, 0, 40, 8, 3), (-6, -10, 3, 8, 34, 3), (4, -4, 6, 34, 7, 3), (-16, -14, 0, 7, 30, 3)]
    for (x, y, z, lx, ly, lz) in pieces:
        sc.box(x, y, z, x + lx, y + ly, z + lz, top=lambda u, v: (pl, 5 if (u % 13) >= LW(1) else 3),
               sw=solid(pl, 3), se=solid(pl, 2))
    # one board leaning up on the pile
    sc.quad((14, 10, 0), (-20, 0, 18), (0, 7, 0), lambda u, v: (pl, 5 if u % 11 > 1 else 3))
    cv = sc.render(outline=False)
    # nails and splinters
    for (x, y) in ((40, 30), (55, 34), (32, 38)):
        cv.put(x, y, ramp("iron")[4])
        cv.put(x, y - 1, ramp("iron")[5])
    cv.outline()
    return cv, (48, 46)


def pagar_bambu(seed, broken=False):
    """A two-tile bamboo fence segment along the grid's X axis."""
    sc = IsoScene(128, 120, 26, 66)
    L = 96
    bam = "bamboo"
    for i, px in enumerate((2, 32, 62, 92)):
        if broken and i == 2:
            continue
        h = 40 if not (broken and i == 3) else 26
        sc.box(px - 3, -3, 0, px + 3, 3, h, top=lambda u, v: ("wood_cut", 3),
               sw=lambda u, v: (bam, 4 if u < 3 else 3) if (v % 12) > 1 else (bam, 1),
               se=lambda u, v: (bam, 2) if (v % 12) > 1 else (bam, 0))
    for z in (12, 28):
        if broken and z == 28:
            # the top rail fell: it lies at the foot of the fence
            sc.box(20, 8, 0, 20 + 70, 12, 4, top=solid(bam, 5), sw=solid(bam, 4), se=solid(bam, 2))
            sc.box(0, -2, z, 30, 2, z + 4, top=solid(bam, 5),
                   sw=lambda u, v: (bam, 4 if v > 1.5 else 2), se=solid(bam, 2))
            continue
        x1 = L if not (broken and z == 12) else 58
        sc.box(0, -2, z, x1, 2, z + 4, top=solid(bam, 5),
               sw=lambda u, v: (bam, (4 if v > 1.5 else 2) - (1 if int(u) % 30 == 0 else 0)), se=solid(bam, 2))
    cv = sc.render(outline=False)
    # rope ties at the joints
    for px in (2, 32, 62, 92):
        if broken and px == 62:
            continue
        for z in (14, 30):
            x, y = sc.to_screen((px, 3, z))
            cv.put(int(x), int(y), ramp("dirt")[5])
            cv.put(int(x) + 1, int(y) + 1, ramp("dirt")[3])
    cv.outline()
    return cv, (26 + 48, 66 + 24)


def reruntuhan(seed, w=112, h=80):
    """A heap of broken bricks, plaster lumps and a roof tile or two (the old granary)."""
    sc = IsoScene(w, h, w // 2, 30)
    rnd = random.Random(seed)
    for k in range(22):
        r = (rnd.random() ** 0.8)
        a = rnd.uniform(0, math.pi * 2)
        x = math.cos(a) * r * 28
        y = math.sin(a) * r * 20
        z = (1 - r) * 20 + rnd.uniform(0, 2)
        kind = rnd.random()
        if kind < 0.6:
            lx, ly, lz = (16, 8, 7) if rnd.random() < 0.5 else (8, 16, 7)
            mat = "clay"
        else:
            lx, ly, lz = rnd.randint(9, 13), rnd.randint(9, 13), rnd.randint(6, 9)
            mat = "plaster"
        sc.box(x, y, z, x + lx, y + ly, z + lz, top=solid(mat, 6), sw=solid(mat, 4), se=solid(mat, 2),
               bias=rnd.random() * 0.1)
    cv = sc.render(outline=False)
    cv.outline()
    return cv, (w // 2, 30 + 26)


def tembok_runtuh(seed):
    """A broken brick wall segment (two tiles long) with a jagged top and fallen bricks."""
    sc = IsoScene(128, 120, 26, 70)
    rnd = random.Random(seed)
    nz = Noise(seed)
    L, T, H = 96, 10, 64
    def top_h(u):
        return H * (0.35 + 0.65 * nz.fbm(u * 0.04, 1.3)) - (18 if 40 < u < 62 else 0)
    def front(u, v):
        if v > top_h(u):
            return None
        if v > top_h(u) - 2:
            return ("clay", 5)
        # plaster still clinging to part of the wall
        if nz(u * 0.04 + 7, v * 0.04 + 7) > 0.6:
            return ("plaster", 5)
        r = bricks("clay", base=4, bw=16, bh=8, mortar="plaster", mt=3)(u, v)
        return r
    def side(u, v):
        if v > top_h(L) or v > H * 0.8:
            return None
        return bricks("clay", base=3, bw=16, bh=8, mortar="plaster", mt=2)(u, v)
    def top(u, v):
        return ("clay", 5)
    sc.quad((0, T, 0), (L, 0, 0), (0, 0, H), front)
    sc.quad((L, 0, 0), (0, T, 0), (0, 0, H), side)
    # the jagged top surface: approximate with thin steps
    for u in range(0, L, 4):
        hh = min(top_h(u + 2), top_h(u), top_h(min(L, u + 4)))
        sc.box(u, 0, 0, u + 4, T, hh, top=lambda a, b: ("clay", 5 if (a + b) % 6 > 1 else 3))
    # fallen bricks
    for k in range(7):
        x = rnd.uniform(30, 75)
        y = T + rnd.uniform(2, 18)
        sc.box(x, y, 0, x + 12, y + 6, 5, top=solid("clay", 5), sw=solid("clay", 4), se=solid("clay", 2))
    cv = sc.render()
    return cv, (26 + 48 - 5, 70 + 30)


def tiang_lapuk(seed):
    """A rotting leaning post (what's left of the barn), with a rusty nail and a vine."""
    sc = IsoScene(56, 110, 24, 96)
    nz = Noise(seed)
    def wood(u, v):
        if v > 78 + nz(u * 0.5, 0) * 10:
            return None
        k = int(u * 2 + nz(u, v * 0.1) * 3) % 4
        return ("plank_old", 3 + (k == 0) - (k == 3))
    sc.quad((-4, 4, 0), (8, 0, 0), (6, 0, 80), wood)
    sc.quad((4, -4, 0), (0, 8, 0), (6, 0, 80), lambda u, v: ("plank_old", 2) if v <= 78 + nz(u * 0.5, 0) * 10 else None)
    cv = sc.render(outline=False)
    # a vine creeping up
    g = toon("leaf")
    x, y = 26, 92
    rnd = random.Random(seed)
    for i in range(40):
        x += math.sin(i * 0.4) * 0.8
        y -= 1.4
        cv.put(int(x), int(y), g[SHADOW])
        if i % 7 == 0:
            leaf(cv, x, y, rnd.choice([-2.6, -0.5]), 7, 2.8, g, rib=False)
    cv.outline()
    return cv, (24, 96)
