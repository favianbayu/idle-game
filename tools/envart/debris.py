"""Debris and ground clutter (twigs, logs, weeds, rubble, broken fences, crates)
plus bushes and flowers, in a Stardew-Valley-like style. Ruined pieces lean
toward the farm's broken barn, greenhouse and granary (Kebun Warisan starts in
ruins).

The flat (2D) pieces are drawn at art resolution with sv.asset; the iso pieces
are built in world space with IsoScene like the house.
"""
import math
import random

import pix
from pix import Canvas, Noise, ramp
from iso import IsoScene, bricks, solid, LW, EV, FS, LIGHT_W
import sv
from sv import PAL, clamp
from plants import leaf, spine_path, flower


# ------------------------------------------------------------ 2D clutter (art px)
def stick(cv, x0, y0, x1, y1, pal_, rnd, fork=True, w=2, depth=None):
    """A twig: lit top edge, shaded underside, a pale cut end, maybe a fork."""
    L = max(1, int(math.hypot(x1 - x0, y1 - y0)))
    dx, dy = (x1 - x0) / L, (y1 - y0) / L
    for i in range(L + 1):
        x, y = int(round(x0 + dx * i)), int(round(y0 + dy * i))
        tones = (6 if i % 6 == 2 else 5, 3, 2)[:w] if w > 1 else (4,)
        for k, t in enumerate(tones):
            cv.put(x, y - (w - 1) + k, pal_[t], depth)
    if fork:
        i = int(L * rnd.uniform(0.35, 0.6))
        fx, fy = x0 + dx * i, y0 + dy * i - (w - 1)
        a = math.atan2(dy, dx) + rnd.choice([-0.75, 0.75]) + (math.pi if rnd.random() < 0.5 else 0)
        for k in range(1, int(L * 0.3)):
            cv.put(int(round(fx + math.cos(a) * k)), int(round(fy + math.sin(a) * k * 0.7)) - 1, pal_[4], depth)
    wc = PAL["wood_cut"]
    for k in range(w):
        cv.put(int(round(x1)), int(round(y1)) - (w - 1) + k, wc[6 - 2 * k], depth)


def dry_leaf(cv, x, y, rnd, L=5):
    pal_ = PAL[rnd.choice(["leaf_autumn", "orange", "straw", "mango", "leaf_autumn"])]
    a = rnd.uniform(0, math.pi * 2)
    sv.outlined(cv, lambda c: leaf(c, x, y, a, L, 1.5, pal_, base=4))


@sv.asset
def ranting(seed):
    cv = Canvas(32, 20)
    rnd = random.Random(seed)
    bp = PAL["bark"]
    for k, a0 in enumerate((0.4, -0.5, 0.05)):
        a = a0 + rnd.uniform(-0.08, 0.08)
        cx, cy = 16 + rnd.uniform(-2, 2), 11 + (k - 1) * 2
        L = rnd.uniform(19, 24) - k * 3
        stick(cv, cx - math.cos(a) * L / 2, cy - math.sin(a) * L / 2 * 0.6,
              cx + math.cos(a) * L / 2, cy + math.sin(a) * L / 2 * 0.6, bp, rnd, w=3 if k == 0 else 2, depth=k)
    for k in range(1):
        dry_leaf(cv, 16 + rnd.randint(-9, 9), 13 + rnd.randint(-2, 3), rnd)
    return cv, (16, 16)


@sv.asset
def daun_kering(seed):
    cv = Canvas(40, 22)
    rnd = random.Random(seed)
    for k in range(12):
        dry_leaf(cv, rnd.randint(7, 33), rnd.randint(6, 16), rnd, L=rnd.randint(5, 6))
    return cv, (20, 15)


@sv.asset
def kayu_tumbang(seed):
    """A fallen log lying along the grid's X axis (screen down-right), cut end toward us.

    Swept as round cross-sections from the far end to the near end, each shaded
    from its world normal, with long bark streaks, a moss patch on top and a
    ringed cut face."""
    cv = Canvas(62, 40)
    rnd = random.Random(seed)
    bp, wp, mp = PAL["bark"], PAL["wood_cut"], PAL["moss"]
    rw, L = 5.6, 32
    ox, oy = 13, 15

    def scr(X, Y, Z):
        return ox + X - Y, oy + (X + Y) / 2 - Z

    streaks = [(rnd.uniform(0.2, 3.0), rnd.uniform(0, L * 0.6), rnd.uniform(6, 16), rnd.choice((1, -1, -2)))
               for _ in range(9)]
    for X in [i * 0.25 for i in range(int(L / 0.25))]:
        for k in range(160):
            ang = k / 160 * 2 * math.pi
            ny, nz = math.cos(ang), math.sin(ang)
            x, y = scr(X, ny * rw, nz * rw + rw)
            l = float(LIGHT_W @ [0.0, ny, nz])
            t = 1 + (l + 0.55) / 1.45 * 5.2
            for (sa, s0, sl, d) in streaks:
                if abs(ang - sa) < 0.12 and s0 <= X <= s0 + sl:
                    t += d
                    break
            col = bp[clamp(round(t), 1, 6)]
            if l > 0.55 and (X - 15) ** 2 / 30 + (ang - 1.9) ** 2 / 0.35 < 1:
                col = mp[clamp(round(t), 3, 6)]        # a moss patch on top
            cv.put(int(x), int(y), col, X + ny * rw)
    # the near cut end: a disc in the YZ plane at X = L
    cx, cy = scr(L, 0, rw)
    for yy in range(int(cy - rw * 1.7), int(cy + rw * 1.7) + 1):
        for xx in range(int(cx - rw * 1.4), int(cx + rw * 1.4) + 1):
            dx, dy = xx + 0.5 - cx, yy + 0.5 - cy
            a = -dx / rw
            b_ = (0.5 * a * rw - dy) / rw
            r = math.hypot(a, b_)
            if r <= 1.0:
                col = wp[(6, 5)[int(r * 3.4) % 2]]
                if r < 0.18:
                    col = wp[3]
                if r > 0.8:
                    col = bp[4 if b_ > 0 else 2]
                cv.put(xx, yy, col, 1e6)
    # a branch stub on top and mushrooms at its foot
    sx, sy = scr(11, -1, rw * 2)
    for k in range(3):
        cv.put(int(sx) + k, int(sy) - k, bp[5], 1e6)
        cv.put(int(sx) + k + 1, int(sy) - k, bp[2], 1e6)
    cv.put(int(sx) + 3, int(sy) - 3, wp[6], 1e6)
    mx, my = scr(22, rw + 2, 0)
    mush(cv, int(mx), int(my))
    mush(cv, int(mx) + 4, int(my) + 2, small=True)
    ax, ay = scr(L / 2, 0, 0)
    return cv, (int(ax), int(ay + 2))


def mush(cv, x, y, small=False, depth=1e7):
    """A little red-capped mushroom with white spots."""
    rp, wp = PAL["red"], PAL["white"]
    h = 1 if small else 2
    for k in range(h):
        cv.put(x, y - k, wp[5], depth)
        cv.put(x + 1, y - k, wp[3], depth)
    r = 2.0 if small else 3.2
    cx, top = x + 0.5, y - h
    rows = 2 if small else 3
    for j in range(rows):
        w = r * math.sqrt(1 - ((rows - 1 - j) / rows) ** 2) if j < rows - 1 else r
        for xx in range(int(math.floor(cx - w)), int(math.ceil(cx + w))):
            s = (xx + 0.5 - cx) / w
            t = 6 if s < -0.3 else (5 if s < 0.35 else 3)
            if j == rows - 1:
                t = 2 if s > 0 else 3
            cv.put(xx, top - rows + j + 1, rp[t], depth)
    if not small:
        cv.put(x - 1, top - 1, wp[7], depth + 1)
        cv.put(x + 1, top - 2, wp[6], depth + 1)


def tuft(cv, bx, by, w, H, pal_, rnd, *, lean=0.25, density=0.8, tips=0.55, depth=None):
    """A grass clump: 1-px blades, dark at the root and bright at the tips; back
    blades darker and taller, front blades shorter and lighter, some tips bent."""
    for layer, (dark, hf, wf) in enumerate(((-1, 1.0, 1.0), (0, 0.82, 0.85), (1, 0.55, 0.65))):
        ww = w * wf
        for x in range(-int(ww), int(ww) + 1):
            if rnd.random() > density:
                continue
            env = math.sqrt(max(0.0, 1 - (x / (ww + 1)) ** 2))
            h = H * hf * env * rnd.uniform(0.7, 1.05)
            if h < 2:
                continue
            n = int(h)
            sl = lean * x / max(1, w) + rnd.uniform(-0.08, 0.08)
            par = -1 if (x + layer) % 2 else 0
            last = None
            for i in range(n):
                t = i / max(1, n - 1)
                xx = int(round(bx + x + sl * i))
                tone = 1 + t * 5.2 + dark + par
                last = (xx, by - i, tone)
                cv.put(xx, by - i, pal_[clamp(round(tone), 1, 7)], depth)
            if last and h > H * 0.45 and rnd.random() < tips:
                d = 1 if (x > 0 or (x == 0 and rnd.random() < 0.5)) else -1
                cv.put(last[0] + d, last[1], pal_[clamp(round(last[2]), 1, 7)], depth)


def fern_frond(cv, x0, y0, a, L, pal_, dim=0):
    """A fern frond: a tapering strap with a notched (leaflet) edge and a pale rib."""
    side = 1 if math.cos(a) > 0 else -1
    pts = spine_path(x0, y0, a, L, bend=side * 0.5 * min(1, abs(math.cos(a)) * 2.5), droop=0.05)
    for j in range(len(pts) - 1):
        x, y, t = pts[j]
        nx, ny = pts[j + 1][0] - x, pts[j + 1][1] - y
        d = math.hypot(nx, ny) or 1
        nx, ny = nx / d, ny / d
        px, py = -ny, nx
        w = 2.7 * math.sin(min(1.0, t * 1.02 + 0.06) * math.pi) ** 0.7 * (0.5 if (j // 3) % 2 else 1.0) + 0.3
        s = -w
        while s <= w + 0.01:
            upper = (py * s) < 0
            b = 5 if upper else 3
            if abs(s) > w - 0.7:
                b = 4 if upper else 2
            cv.put(int(round(x + px * s)), int(round(y + py * s)), pal_[clamp(b + dim, 1, 7)])
            s += 0.5
        if 0.1 < t < 0.85:
            cv.put(int(round(x)), int(round(y)), pal_[clamp(6 + dim, 1, 7)])


@sv.asset
def rumput(seed, kind="tuft"):
    """Weeds: 'tuft' grass clump, 'leafy' broad weed, 'pakis' fern, 'alang' tall grass."""
    rnd = random.Random(seed)
    if kind in ("alang", "pakis"):
        cv = Canvas(36, 42)
        bx, by = 18, 39
    else:
        cv = Canvas(32, 26)
        bx, by = 16, 23
    g = PAL["grass"]
    if kind == "tuft":
        tuft(cv, bx, by, 10, 17, g, rnd, density=0.9)
        for (dx, dy) in ((-4, -12), (3, -10)):
            flower(cv, bx + dx, by + dy, PAL["pink"])
    elif kind == "alang":
        wp = PAL["white"]
        heads = [(-6, -33), (1, -37), (7, -31)]
        for (hx, hy) in heads:     # thin stalks up to fluffy white plumes
            x0, y0 = bx + hx * 0.3, by - 10
            n = y0 - (by + hy)
            for i in range(int(n)):
                cv.put(int(round(x0 + (bx + hx - x0) * i / n)), int(y0 - i), g[3 if i % 3 else 4])
        tuft(cv, bx, by, 9, 22, g, rnd, lean=0.35)
        for k, (hx, hy) in enumerate(heads):
            cx, cy = bx + hx, by + hy
            for yy in range(-4, 5):
                ww = 1.8 * math.sqrt(max(0, 1 - (yy / 4.6) ** 2))
                for xx in range(int(math.floor(-ww)), int(math.ceil(ww))):
                    t = 6 if xx < 0 and yy < 1 else (5 if xx <= 0 else 3)
                    if yy > 2:
                        t -= 1
                    cv.put(cx + xx, cy + yy, wp[t], 100 + k)
            cv.put(cx - 1, cy - 2, wp[7], 101 + k)
    elif kind == "leafy":
        for k, a in enumerate((-2.55, -0.6, -2.1, -1.05, -1.85, -1.3)):
            sv.outlined(cv, lambda c, k=k, a=a + rnd.uniform(-0.06, 0.06), L=12 + rnd.randint(0, 2):
                        leaf(c, bx + (k % 2) * 2 - 1, by, a, L, 2.5, g, droop=0.08, base=3 if k < 2 else 4))
        tuft(cv, bx, by, 4, 6, g, rnd, density=0.6, tips=0.2)
        flower(cv, bx - 1, by - 11, PAL["yellow"])
    elif kind == "pakis":
        fp = PAL["leaf_dark"]
        for k, a in enumerate((-2.65, -0.5, -2.3, -0.85, -2.0, -1.15, -1.75, -1.4)):
            sv.outlined(cv, lambda c, k=k, a=a + rnd.uniform(-0.05, 0.05), L=(14 if k < 2 else 21) + rnd.randint(-1, 2):
                        fern_frond(c, bx, by, a, L, fp, dim=-1 if k < 2 else (0 if k < 6 else 1)))
    return cv, (bx, by)


def berry(cv, x, y, pal_, depth=100):
    for (dx, dy, t) in ((0, 0, 6), (1, 0, 4), (0, 1, 4), (1, 1, 2), (-1, 0, 4), (0, -1, 5)):
        cv.put(x + dx, y + dy, pal_[t], depth)
    cv.put(x, y, pal_[7], depth + 1)


def hibiscus(cv, x, y):
    """Kembang sepatu: a round red five-petal flower with a dark heart and a yellow stamen."""
    rp = PAL["red"]
    for yy in range(-3, 4):
        for xx in range(-3, 4):
            a = math.atan2(yy, xx)
            lim = 2.6 + 0.9 * abs(math.cos(a * 2.5 + 0.4))
            if xx * xx + yy * yy <= lim * lim * 0.85:
                t = 6 if xx + yy < -2 else (5 if xx + yy < 1 else 3)
                cv.put(x + xx, y + yy, rp[t], 200)
    cv.put(x, y, rp[1], 201)
    cv.put(x + 1, y - 1, PAL["yellow"][6], 202)
    cv.put(x + 2, y - 2, PAL["yellow"][7], 202)


@sv.asset
def semak(seed, kind="hijau"):
    """Bushes: 'hijau' plain, 'buah' berry bush, 'sepatu' hibiscus, 'melati' jasmine."""
    cv = Canvas(38, 32)
    rnd = random.Random(seed)
    lp = PAL["leaf_dark" if kind in ("sepatu", "melati") else "leaf"]
    bx, by = 19, 29
    blobs = [(bx, by - 11, 14, 10), (bx - 8, by - 7, 7, 6.5), (bx + 8, by - 7, 7.5, 6.5),
             (bx - 5, by - 18, 7, 5.5), (bx + 5, by - 19, 7.5, 5.5), (bx, by - 21, 6, 4)]
    bp = PAL["bark"]

    def twigs(c, mask):
        for (ex, ey) in ((bx - 9, by - 15), (bx + 8, by - 16), (bx - 2, by - 20), (bx + 3, by - 9)):
            sv.branch(c, [(bx, by - 1), ((bx + ex) / 2, (by + ey) / 2 + 2), (ex, ey)], 1.6, 1, bp, clip=mask)

    mask = sv.crown(cv, blobs, lp, seed, leaf="oak", spacing=(4, 3), jitter=1.0, before_leaves=twigs)
    spots = []
    for _ in range(400):
        x, y = bx + rnd.randint(-12, 12), by - rnd.randint(4, 24)
        if (x, y) not in mask or mask[(x, y)] < -0.2:
            continue
        if any(abs(x - a) + abs(y - b) < (5 if kind != "melati" else 4) for a, b in spots):
            continue
        spots.append((x, y))
    if kind == "buah":
        for x, y in spots[:11]:
            berry(cv, x, y, PAL["red"])
    elif kind == "sepatu":
        for x, y in spots[:5]:
            hibiscus(cv, x, y)
    elif kind == "melati":
        for x, y in spots[:12]:
            flower(cv, x, y, PAL["white"])
    return cv, (bx, by)


def big_flower(cv, x, y, pal_):
    """A round five-petal wild flower with a yellow (or orange) eye."""
    for yy in range(-2, 3):
        for xx in range(-2, 3):
            if abs(xx) == 2 and abs(yy) == 2:
                continue
            t = 6 if xx + yy < -1 else (5 if xx + yy < 2 else 3)
            cv.put(x + xx, y + yy, pal_[t], 200)
    eye = PAL["orange"] if pal_ is PAL["yellow"] else PAL["yellow"]
    cv.put(x, y, eye[5], 201)
    cv.put(x - 1, y - 1, pal_[7], 201)


@sv.asset
def bunga_liar(seed, color="yellow"):
    cv = Canvas(32, 26)
    rnd = random.Random(seed)
    g = PAL["grass"]
    tuft(cv, 16, 23, 7, 7, g, rnd, density=0.7, tips=0.3)
    spots = sorted([(16 + dx + rnd.randint(-1, 1), 22 + dy) for dx, dy in ((-8, -1), (0, -2), (7, 0), (-3, 1), (4, 1))],
                   key=lambda p: p[1])
    for (x, y) in spots:
        h = rnd.randint(7, 10)
        for i in range(h):
            cv.put(x, y - i, g[4 if i % 3 else 3])
        leaf(cv, x, y - 2, -2.6, 4, 1.3, g, rib=False, base=4)
        leaf(cv, x + 1, y - 3, -0.55, 4, 1.3, g, rib=False, base=3)
        big_flower(cv, x, y - h - 1, PAL[color])
    return cv, (16, 22)


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

        def boards(c, P):   # two loose boards on the ground beside it
            stick(c, 14 // P, 58 // P, 30 // P, 54 // P, PAL["plank"], rnd, fork=False)
            stick(c, 40 // P, 64 // P, 56 // P, 58 // P, PAL["plank"], rnd, fork=False)
        sv.overlay(cv, boards)
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
    rnd = random.Random(seed)

    def vine(c, P):
        g = PAL["leaf"]
        x, y = 26 / P, 92 / P
        for i in range(30):
            x += math.sin(i * 0.4) * 0.4
            y -= 0.95
            c.put(int(round(x)), int(round(y)), g[3])
            if i % 6 == 2:
                sv.outlined(c, lambda cc, x=x, y=y: leaf(cc, x, y, rnd.choice([-2.6, -0.5]), 4, 1.5, g, base=4))
    sv.overlay(cv, vine)
    cv.outline()
    return cv, (24, 96)
