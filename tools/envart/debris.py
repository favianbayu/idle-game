"""Debris and ground clutter (twigs, logs, weeds, rubble, broken fences, crates)
plus bushes and flowers. Ruined pieces lean toward the farm's broken barn,
greenhouse and granary (Kebun Warisan starts in ruins)."""
import math
import random

import numpy as np

import pix
from pix import Canvas, Noise, ramp, LIGHT3, bayer, darker
from iso import IsoScene, planks_h, bricks, solid, stones, LW, EV, FS
from plants import leaf, flower, ball
from trees import canopy


# ------------------------------------------------------------ 2D clutter
def stick(cv, x0, y0, x1, y1, w, rmp, rnd, fork=True):
    L = max(1, int(math.hypot(x1 - x0, y1 - y0)))
    dx, dy = (x1 - x0) / L, (y1 - y0) / L
    px, py = -dy, dx
    for i in range(L + 1):
        x, y = x0 + dx * i, y0 + dy * i
        ww = w * (1 - 0.35 * i / L)
        for s in range(-int(ww), int(ww) + 1):
            up = (py * s) < 0
            t = 5 if up else 3
            if s == int(ww) and not up:
                t = 2
            cv.put(int(round(x + px * s)), int(round(y + py * s)), rmp[t])
    if fork:
        i = int(L * rnd.uniform(0.3, 0.7))
        fx, fy = x0 + dx * i, y0 + dy * i
        a = math.atan2(dy, dx) + rnd.choice([-0.7, 0.7])
        l2 = L * 0.35
        cv.line(fx, fy, fx + math.cos(a) * l2, fy + math.sin(a) * l2, rmp[3])
    # cut end
    cv.put(int(x1), int(y1), ramp("wood_cut")[3])


def ranting(seed):
    cv = Canvas(64, 40)
    rnd = random.Random(seed)
    br = ramp("bark")
    for k in range(4):
        a = rnd.uniform(-0.5, 0.5) + (0 if k % 2 else math.pi * 0.85)
        cx, cy = 32 + rnd.uniform(-6, 6), 24 + rnd.uniform(-3, 3)
        L = rnd.uniform(20, 28)
        stick(cv, cx - math.cos(a) * L / 2, cy - math.sin(a) * L / 2 * 0.6,
              cx + math.cos(a) * L / 2, cy + math.sin(a) * L / 2 * 0.6, 1.7, br, rnd)
    for k in range(4):     # a few dry leaves
        dry_leaf(cv, 32 + rnd.randint(-18, 18), 27 + rnd.randint(-5, 5), rnd)
    return cv, (32, 32)


def dry_leaf(cv, x, y, rnd):
    rm = ramp(rnd.choice(["orange", "straw", "dirt"]))
    a = rnd.uniform(0, math.pi)
    leaf(cv, x, y, a, 7, 2.2, rm, lo=2, rib=False)


def daun_kering(seed):
    cv = Canvas(80, 40)
    rnd = random.Random(seed)
    for k in range(18):
        dry_leaf(cv, rnd.randint(10, 70), rnd.randint(10, 32), rnd)
    return cv, (40, 28)


def kayu_tumbang(seed, w=120, h=76):
    """A fallen log lying along the grid's X axis (screen down-right), cut end toward us."""
    cv = Canvas(w, h)
    rnd = random.Random(seed)
    br, wc, moss = ramp("bark"), ramp("wood_cut"), ramp("mossy")
    nz = Noise(seed)
    R = 13.0
    ax, ay = 2.0, 1.0
    n = math.hypot(ax, ay)
    ax, ay = ax / n, ay / n
    x0, y0 = 18, 18
    L = 80
    px, py = -ay, ax          # across the log (screen)
    for i in range(L):
        cx, cy = x0 + ax * i, y0 + ay * i
        for s10 in range(int(-R * 10), int(R * 10) + 1, 4):
            s = s10 / 10
            # cross-section: s<0 is the top/back side
            nrm = np.array([px * s / R, py * s / R - 0.3, math.sqrt(max(0, 1 - (s / R) ** 2))])
            nrm /= np.linalg.norm(nrm)
            v = 0.36 + 0.55 * float(nrm @ LIGHT3)
            g = nz(i * 0.12, s * 0.9)
            if g < 0.3:
                v -= 0.2                       # bark furrows along the log
            t = int(max(0, min(len(br) - 1, math.floor(v * len(br)))))
            X, Y = cx + px * s, cy + py * s - 4
            if s > R - 1.2:
                t = 0
            if nz.fbm(i * 0.06 + 9, s * 0.15 + 9) > 0.62 and s < -2:
                cv.put(int(X), int(Y), moss[min(len(moss) - 1, t)])
            else:
                cv.put(int(X), int(Y), br[t])
    # cut end facing the viewer (an ellipse across the log at its far end)
    ex, ey = x0 + ax * L, y0 + ay * L - 4
    for yy in range(-17, 18):
        for xx in range(-17, 18):
            # ellipse in the plane perpendicular to the log
            a = (xx * ay - yy * ax * 0.0)
            u = (xx * ax + yy * ay)          # along the log
            vv = (-xx * ay + yy * ax)        # across
            if abs(u) <= 3.2 * (1 - (vv / R) ** 2) ** 0.5 if abs(vv) <= R else False:
                r = abs(vv) / R
                ring = int(math.hypot(vv / R, u / 3.2) * 4) % 2
                t = 3 - ring
                if math.hypot(vv / R, u / 3.2) > 0.85:
                    t = 1
                cv.put(int(ex + xx), int(ey + yy), wc[t])
    # a broken branch stub and a mushroom
    stick(cv, x0 + 30, y0 + 6, x0 + 26, y0 - 8, 1.6, br, rnd, fork=False)
    mush(cv, int(x0 + 50 + px * 9), int(y0 + 25 + py * 9 - 4))
    return cv, (int(x0 + ax * L / 2 + 0), int(y0 + ay * L / 2 + R))


def mush(cv, x, y):
    r, w = ramp("red"), ramp("white")
    for xx in range(-3, 4):
        for yy in range(-2, 1):
            if abs(xx) + abs(yy) * 1.5 <= 3.5:
                cv.put(x + xx, y + yy, r[5 if xx < 0 else 3])
    cv.put(x - 1, y - 1, w[5])
    cv.put(x + 1, y, w[4])
    cv.put(x, y + 1, w[3])
    cv.put(x, y + 2, w[2])


def rumput(seed, kind="tuft"):
    """Weeds: 'tuft' grass clump, 'leafy' broad weed, 'pakis' fern, 'alang' tall grass."""
    rnd = random.Random(seed)
    if kind == "alang":
        cv = Canvas(72, 80)
        bx, by = 36, 74
    else:
        cv = Canvas(64, 52)
        bx, by = 32, 46
    g = ramp("grass")
    if kind in ("tuft", "alang"):
        n = 18 if kind == "tuft" else 24
        H = 36 if kind == "tuft" else 56
        blades = []
        for i in range(n):
            side = (i - (n - 1) / 2) / ((n - 1) / 2)
            a = -math.pi / 2 + side * 0.75 + rnd.uniform(-0.1, 0.1)
            blades.append((abs(side), a, H * rnd.uniform(0.6, 1.0) * (1 - 0.3 * abs(side)), side * rnd.uniform(0.4, 1.2)))
        blades.sort(key=lambda b: -b[0])
        for _, a, L, bend in blades:
            x, y = bx + rnd.uniform(-3, 3), by
            for k in range(int(L)):
                t = k / L
                aa = a + bend * t * t
                x += math.cos(aa)
                y += math.sin(aa)
                cv.put(int(x), int(y), g[min(len(g) - 1, 1 + int(t * 5) + (bend < 0))])
                if t < 0.5:
                    cv.put(int(x) + 1, int(y), g[1 + int(t * 3)])
        if kind == "alang":
            for k in range(4):     # fluffy white seed heads on thin stalks
                x, y = bx + (k - 1.5) * 8, by - 54 - rnd.randint(0, 8)
                cv.line(bx + (k - 1.5) * 2, by - 4, x, y + 9, g[4])
                for j in range(10):
                    cv.put(int(x + j * 0.3), y + j, ramp("white")[5 if j % 2 else 4])
                    cv.put(int(x + j * 0.3) + 1, y + j, ramp("white")[3])
    elif kind == "leafy":
        for k, a in enumerate((-2.8, -2.2, -1.6, -1.0, -0.4, -1.9, -1.25)):
            leaf(cv, bx, by, a + rnd.uniform(-0.1, 0.1), 19 + rnd.randint(0, 5), 5.0, g,
                 droop=0.4, bias=0.08 if a < -1.57 else -0.06)
        flower(cv, bx - 3, by - 26, ramp("yellow"))
    elif kind == "pakis":
        for k, a in enumerate((-2.7, -2.2, -1.65, -1.1, -0.5)):
            fern_frond(cv, bx, by, a, 30 + rnd.randint(-2, 4), g, rnd)
    return cv, (bx, by)


def fern_frond(cv, x0, y0, a, L, rmp, rnd):
    x, y = x0, y0
    for i in range(int(L)):
        t = i / L
        aa = a + (0.9 if math.cos(a) > 0 else -0.9) * t * t
        x += math.cos(aa)
        y += math.sin(aa) + t * 0.3
        cv.put(int(x), int(y), rmp[3] if pix.PIXEL == 1 else rmp[2])
        ln = 6 * math.sin(min(1, t * 1.2 + 0.1) * math.pi)
        if i % (2 * pix.PIXEL) == 0:
            for side in (-1, 1):
                for k in range(int(ln)):
                    lx = x + (-math.sin(aa)) * side * k + math.cos(aa) * k * 0.4
                    ly = y + math.cos(aa) * side * k * 0.6 + k * 0.4
                    cv.put(int(lx), int(ly), rmp[5 if side < 0 else 3])


def semak(seed, kind="hijau"):
    """Bushes: 'hijau' plain, 'buah' berry bush, 'sepatu' hibiscus, 'melati' jasmine."""
    cv = Canvas(72, 60)
    rnd = random.Random(seed)
    lr = ramp("leaf_dark" if kind in ("sepatu", "melati") else "leaf")
    canopy(cv, 24, 40, 17, 14, lr, seed, clump=(4, 6), bias=-0.06)
    canopy(cv, 48, 40, 17, 14, lr, seed + 1, clump=(4, 6), bias=-0.1)
    canopy(cv, 36, 32, 22, 18, lr, seed + 2, clump=(4, 7))
    if kind == "buah":
        for k in range(10):
            x, y = 36 + rnd.randint(-24, 24), 36 + rnd.randint(-14, 12)
            if cv.a[y, x]:
                for dx, dy in ((0, 0), (1, 0), (0, 1), (1, 1)):
                    cv.put(x + dx, y + dy, ramp("red")[4 if dx + dy == 0 else 2])
                cv.put(x, y, ramp("red")[6])
    elif kind == "sepatu":
        for k in range(7):
            x, y = 36 + rnd.randint(-22, 22), 34 + rnd.randint(-14, 10)
            if cv.a[y, x]:
                hibiscus(cv, x, y, rnd)
    elif kind == "melati":
        for k in range(16):
            x, y = 36 + rnd.randint(-24, 24), 34 + rnd.randint(-14, 12)
            if cv.a[y, x]:
                flower(cv, x, y, ramp("white"), small=True)
    return cv, (36, 54)


def hibiscus(cv, x, y, rnd):
    r = ramp("red")
    for dx, dy, t in ((-2, -1, 5), (-1, -2, 5), (0, -2, 5), (1, -2, 4), (2, -1, 4), (-2, 0, 5), (2, 0, 3),
                      (-1, 1, 4), (0, 1, 3), (1, 1, 3), (-1, -1, 6), (0, -1, 5), (1, -1, 4), (-1, 0, 5), (1, 0, 3)):
        cv.put(x + dx, y + dy, r[t])
    cv.put(x, y, ramp("yellow")[5])
    cv.put(x + 1, y - 3, ramp("yellow")[4])


def bunga_liar(seed, color="yellow"):
    cv = Canvas(64, 48)
    rnd = random.Random(seed)
    g = ramp("grass")
    spots = sorted([(32 + rnd.randint(-22, 22), 40 + rnd.randint(-5, 3)) for k in range(7)], key=lambda p: p[1])
    for (x, y) in spots:
        h = rnd.randint(12, 20)
        tx = x + rnd.choice([-1, 0, 1])
        cv.line(x, y, tx, y - h, g[3])
        leaf(cv, x, y - 1, -2.5, 8, 2.4, g, bias=0.1)
        leaf(cv, x, y - 3, -0.6, 8, 2.4, g)
        flower(cv, tx, y - h - 2, ramp(color))
    return cv, (32, 42)


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
        br = ramp("plank")
        stick(cv, 14, 66 - 8, 30, 62 - 8, 1.6, br, rnd, fork=False)
        stick(cv, 40, 64, 56, 58, 1.4, br, rnd, fork=False)
    cv.outline()
    return cv, (36, 44 + int(s))


def papan_patah(seed):
    """A pile of broken planks with nails, leftovers of the old barn."""
    sc = IsoScene(96, 64, 48, 24)
    rnd = random.Random(seed)
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
    rnd = random.Random(seed)
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
    for k in range(48):
        r = (rnd.random() ** 0.7)
        a = rnd.uniform(0, math.pi * 2)
        x = math.cos(a) * r * 30
        y = math.sin(a) * r * 22
        z = (1 - r) * 22 + rnd.uniform(0, 3)
        kind = rnd.random()
        if kind < 0.55:
            lx, ly, lz = (12, 6, 5) if rnd.random() < 0.5 else (6, 12, 5)
            mat = "clay"
        elif kind < 0.85:
            lx, ly, lz = rnd.randint(6, 10), rnd.randint(6, 10), rnd.randint(4, 7)
            mat = "plaster"
        else:
            lx, ly, lz = 10, 8, 2
            mat = "clay"
        b = rnd.randint(-2, 0)
        sc.box(x, y, z, x + lx, y + ly, z + lz, top=solid(mat, 5 + b), sw=solid(mat, 4 + b), se=solid(mat, 3 + b),
               bias=rnd.random() * 0.1)
    cv = sc.render(outline=False)
    # dust and grit around the base
    gr = ramp("stone_warm")
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
        if nz.fbm(u * 0.05 + 7, v * 0.05 + 7) > 0.58:
            return ("plaster", 5)
        r = bricks("clay", base=4, bw=12, bh=6, mortar="plaster", mt=3)(u, v)
        return r
    def side(u, v):
        if v > top_h(L) or v > H * 0.8:
            return None
        return bricks("clay", base=3, bw=12, bh=6, mortar="plaster", mt=2)(u, v)
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
    g = ramp("leaf")
    x, y = 26, 92
    rnd = random.Random(seed)
    for i in range(40):
        x += math.sin(i * 0.4) * 0.8
        y -= 1.4
        cv.put(int(x), int(y), g[2])
        if i % 5 == 0:
            leaf(cv, x, y, rnd.choice([-2.6, -0.5]), 4, 1.6, g, bias=0.05)
    cv.outline()
    return cv, (24, 96)
