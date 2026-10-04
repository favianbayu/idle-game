"""Field crops (5 growth stages each), wild plants, bushes and flowers."""
import math
import random

import numpy as np

from pix import Canvas, Noise, ramp, LIGHT3, bayer

CROP_W, CROP_H = 64, 80
CROP_PIVOT = (32, 72)


# ------------------------------------------------------------ primitives
def leaf(cv, x, y, ang, L, W, rmp, *, curl=0.0, lo=1, hi=None, rib=True, bias=0.0, droop=0.0):
    """A pointed leaf (lens shape) from (x, y) along `ang` (radians, screen).

    Upper half lighter than the lower half; the midrib is a thin lighter line.
    `droop` bends the tip down (screen y), `curl` bends it sideways.
    """
    hi = len(rmp) - 1 if hi is None else hi
    dx, dy = math.cos(ang), math.sin(ang)
    prev = None
    spine = []
    for i in range(int(L) + 1):
        t = i / max(1, L)
        a = ang + curl * t
        if prev is None:
            px, py = x, y
        else:
            px, py = prev[0] + math.cos(a), prev[1] + math.sin(a) + droop * t * 2
        spine.append((px, py, t))
        prev = (px, py)
    for j in range(len(spine) - 1):
        sx, sy, t = spine[j]
        nx, ny = spine[j + 1][0] - sx, spine[j + 1][1] - sy
        d = math.hypot(nx, ny) or 1
        nx, ny = nx / d, ny / d
        px, py = -ny, nx
        w = W * math.sin(min(1.0, t) * math.pi) ** 0.8
        s = -w
        while s <= w + 0.01:
            X, Y = sx + px * s, sy + py * s
            upper = (py * s) < 0 or (abs(py) < 0.2 and px * s < 0)
            v = 0.55 + bias + (0.16 if upper else -0.14) - 0.12 * abs(s) / (w + 0.5)
            v += (bayer(int(X), int(Y)) - 0.5) * 0.06
            tt = int(max(lo, min(hi, math.floor(lo + v * (hi - lo + 0.999)))))
            if abs(s) > w - 0.8 and not upper:
                tt = max(0, tt - 1)
            cv.put(int(round(X)), int(round(Y)), rmp[tt])
            s += 0.5
        if rib and 0.1 < t < 0.85:
            cv.put(int(round(sx)), int(round(sy)), rmp[min(hi, hi - 1 + int(bias > 0))])
    return spine


def stem(cv, pts, rmp, w=1, lit=4, dark=2):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        cv.line(x0, y0, x1, y1, rmp[lit])
        if w > 1:
            cv.line(x0 + 1, y0, x1 + 1, y1, rmp[dark])


def ball(cv, x, y, rx, ry, rmp, lo=1, hi=None, spec=True):
    hi = len(rmp) - 1 if hi is None else hi
    for yy in range(int(-ry - 1), int(ry + 2)):
        for xx in range(int(-rx - 1), int(rx + 2)):
            dx = (xx + 0.5) / rx
            dy = (yy + 0.5) / ry
            r2 = dx * dx + dy * dy
            if r2 <= 1:
                n = np.array([dx, dy, math.sqrt(1 - r2)])
                l = float(n @ LIGHT3)
                v = 0.45 + 0.6 * l
                t = int(max(lo, min(hi - 1, math.floor(lo + v * (hi - lo)))))
                if r2 > 0.7 and dx + dy > 0.2:
                    t = lo
                cv.put(int(x + xx), int(y + yy), rmp[t])
    if spec:
        cv.put(int(x - rx * 0.4), int(y - ry * 0.45), rmp[hi])


def soil_mound(cv, cx, cy, seed_col=None, rnd=None, w=14):
    """The little raised soil hill a seed is planted in."""
    sr = ramp("soil")
    for y in range(-4, 3):
        for x in range(-w // 2, w // 2 + 1):
            dx = x / (w / 2)
            dy = (y + 1) / 3.5
            if dx * dx + dy * dy <= 1:
                t = 4 if dx + dy < -0.3 else (2 if dx + dy > 0.4 else 3)
                if dy > 0.6:
                    t = 1
                cv.put(cx + x, cy + y, sr[t])
    if seed_col is not None:
        rnd = rnd or random.Random(1)
        for k in range(3):
            sx, sy = cx + rnd.randint(-4, 4), cy - rnd.randint(1, 3)
            cv.put(sx, sy, seed_col[-2])
            cv.put(sx + 1, sy, seed_col[2])


def crop_canvas():
    return Canvas(CROP_W, CROP_H)


# ------------------------------------------------------------ crops
def crop_padi(stage, seed=1):
    cv = crop_canvas()
    rnd = random.Random(seed)
    bx, by = CROP_PIVOT
    g, st = ramp("rice_green"), ramp("straw")
    if stage == 0:
        soil_mound(cv, bx, by - 1, ramp("straw"), rnd)
        return cv
    # a clump of blades: each is a 2 px ribbon that rises and bends over
    n = [0, 6, 11, 16, 16][stage]
    H = [0, 12, 26, 40, 38][stage]
    gold = stage == 4
    rmp = st if gold else g
    blades = []
    for i in range(n):
        side = (i - (n - 1) / 2) / max(1, (n - 1) / 2)       # -1 .. 1
        a = -math.pi / 2 + side * (0.5 if stage > 1 else 0.7) + rnd.uniform(-0.08, 0.08)
        L = H * rnd.uniform(0.7, 1.05) * (1 - 0.25 * abs(side))
        bend = side * rnd.uniform(0.5, 1.1) + rnd.uniform(-0.3, 0.3)
        blades.append((abs(side), a, L, bend))
    blades.sort(key=lambda b: -b[0])          # outer blades behind, inner in front
    hi = len(rmp) - 1
    for _, a, L, bend in blades:
        x, y = bx + rnd.uniform(-2, 2), by
        px, py = x, y
        for k in range(int(L)):
            t = k / L
            aa = a + bend * t * t * 1.4
            px += math.cos(aa)
            py += math.sin(aa)
            tone = 1 + int(t * (hi - 2)) + (1 if bend < 0 else 0)
            cv.put(int(px), int(py), rmp[min(hi, tone)])
            if t < 0.7:
                cv.put(int(px) + 1, int(py), rmp[max(0, min(hi, tone) - 2)])
    if stage >= 3:
        # panicles: grain heads arching over and hanging, heavier when ripe
        gr = st if gold else ramp("corn_husk")
        heads = 7 if gold else 5
        for k in range(heads):
            side = (k - (heads - 1) / 2) / ((heads - 1) / 2)
            x, y = bx + side * 3, by - H * 0.55
            a = -math.pi / 2 + side * 0.35
            sag = 2.4 if gold else 1.3
            px, py = x, y
            L = 22 if gold else 18
            for i in range(L):
                t = i / L
                aa = a + (sag * t * t) * (1 if side >= 0 else -1) * (1.6 if abs(side) < 0.2 else 1)
                px += math.cos(aa)
                py += math.sin(aa)
                cv.put(int(px), int(py), gr[3])
                if t > 0.35 and i % 2 == 0:
                    # grains on both sides of the stalk
                    cv.put(int(px) - 1, int(py), gr[5 if gold else 4])
                    cv.put(int(px) + 1, int(py) + 1, gr[2])
                    if gold:
                        cv.put(int(px), int(py) + 1, gr[4])
    return cv


def crop_jagung(stage, seed=2):
    cv = crop_canvas()
    rnd = random.Random(seed)
    bx, by = CROP_PIVOT
    g, husk, corn = ramp("leaf"), ramp("corn_husk"), ramp("corn")
    if stage == 0:
        soil_mound(cv, bx, by - 1, ramp("corn"), rnd)
        return cv
    if stage == 1:
        leaf(cv, bx, by, -2.2, 10, 1.6, g, curl=-0.4)
        leaf(cv, bx, by, -0.9, 9, 1.5, g, curl=0.4, bias=-0.1)
        return cv
    H = [0, 0, 30, 60, 62][stage]
    # stalk
    for i in range(H):
        cv.put(bx, by - i, g[4])
        cv.put(bx + 1, by - i, g[2])
    # strap leaves alternating, arching out and down
    for k in range(3 + stage):
        yy = by - 6 - k * (H - 10) / (3 + stage)
        side = -1 if k % 2 == 0 else 1
        a = (-math.pi / 2 - 0.9) if side < 0 else (-math.pi / 2 + 0.9)
        leaf(cv, bx + (0 if side < 0 else 1), yy, a + side * rnd.uniform(-0.2, 0.3), 19 + rnd.randint(-3, 4), 2.4, g,
             curl=(-1.6 if side < 0 else 1.6) * rnd.uniform(0.7, 1.1), droop=0.35, bias=0.06 if side < 0 else -0.08)
    if stage >= 3:
        # tassel
        tx, ty = bx, by - H
        for k in range(5):
            a = -math.pi / 2 + (k - 2) * 0.35
            for i in range(7):
                cv.put(int(tx + math.cos(a) * i + (k - 2) * 0.2 * i * i / 7), int(ty + math.sin(a) * i + i * i * 0.08),
                       ramp("straw")[4 if k < 3 else 3])
    if stage >= 3:
        # cobs wrapped in husk, silk at the tip
        for (cx, cy, side) in ((bx + 3, by - H * 0.5, 1), (bx - 3, by - H * 0.36, -1)):
            for i in range(11):
                w = 2.6 * math.sin((i + 1) / 12 * math.pi)
                for s in range(-int(w), int(w) + 1):
                    x = cx + side * i * 0.3 + s
                    y = cy + 5 - i
                    t = 3 + (1 if s * side < 0 else -1)
                    if stage == 4 and i > 3 and s == 0:
                        cv.put(int(x), int(y), corn[5])     # kernels peek through
                    else:
                        cv.put(int(x), int(y), husk[t])
            silk = ramp("orange") if stage == 4 else ramp("straw")
            for i in range(4):
                cv.put(int(cx + side * (3.3 + i * 0.6)), int(cy - 6 - i), silk[3])
    return cv


def _bush(cv, bx, by, n, H, rnd, rmp, spread=12, leafL=(7, 10), leafW=2.6):
    """A small leafy plant: leaves from a few stems, back to front."""
    stems = []
    for k in range(n):
        a = -math.pi / 2 + (k - (n - 1) / 2) * (spread / max(1, n)) * 0.12
        L = H * rnd.uniform(0.7, 1.0)
        tip = (bx + math.cos(a) * L, by + math.sin(a) * L)
        stems.append((a, L, tip))
    for a, L, tip in stems:
        cv.line(bx, by, tip[0], tip[1], rmp[2])
    leaves = []
    for a, L, tip in stems:
        for j in range(3):
            t = 0.45 + j * 0.25
            x = bx + math.cos(a) * L * t
            y = by + math.sin(a) * L * t
            for side in (-1, 1):
                la = a + side * rnd.uniform(0.9, 1.4)
                leaves.append((y, x, la, rnd.uniform(*leafL)))
    leaves.sort(key=lambda l: l[0])
    for (y, x, la, L) in leaves:
        bias = 0.1 if math.cos(la) < 0 else -0.06
        leaf(cv, x, y, la, L, leafW, rmp, curl=rnd.uniform(-0.3, 0.3), droop=0.3, bias=bias)
    return stems


def crop_cabai(stage, seed=3):
    cv = crop_canvas()
    rnd = random.Random(seed)
    bx, by = CROP_PIVOT
    g = ramp("leaf")
    if stage == 0:
        soil_mound(cv, bx, by - 1, ramp("cloth_white"), rnd)
        return cv
    if stage == 1:
        cv.line(bx, by, bx, by - 6, g[3])
        leaf(cv, bx, by - 6, -2.5, 6, 1.8, g, bias=0.1)
        leaf(cv, bx, by - 6, -0.6, 6, 1.8, g, bias=-0.05)
        return cv
    H = [0, 0, 18, 30, 32][stage]
    n = [0, 0, 3, 5, 5][stage]
    stems = _bush(cv, bx, by, n, H, rnd, g, leafL=(6, 9), leafW=2.2)
    if stage == 3:
        for a, L, tip in stems:
            flower(cv, int(tip[0]), int(tip[1]) + 3, ramp("white"), small=True)
    if stage == 4:
        red = ramp("red")
        for k, (a, L, tip) in enumerate(stems):
            for j in range(2):
                x = int(bx + math.cos(a) * L * (0.55 + 0.25 * j)) + (2 if j else -2)
                y = int(by + math.sin(a) * L * (0.55 + 0.25 * j)) + 2
                # long hanging chili, slightly curved
                cv.put(x, y - 1, g[3])
                for i in range(7):
                    cv.put(x + (i > 4), y + i, red[5 if i < 3 else 4])
                    cv.put(x + 1 + (i > 4), y + i, red[3 if i < 5 else 2])
                cv.put(x, y + 1, red[6])
    return cv


def crop_tomat(stage, seed=4):
    cv = crop_canvas()
    rnd = random.Random(seed)
    bx, by = CROP_PIVOT
    g = ramp("leaf")
    if stage == 0:
        soil_mound(cv, bx, by - 1, ramp("yellow"), rnd)
        return cv
    if stage == 1:
        cv.line(bx, by, bx, by - 7, g[3])
        leaf(cv, bx, by - 6, -2.6, 6, 2, g, bias=0.1)
        leaf(cv, bx, by - 6, -0.5, 6, 2, g)
        leaf(cv, bx, by - 7, -1.6, 4, 1.4, g, bias=0.1)
        return cv
    # bamboo stake (ajir) and tie
    bam = ramp("straw")
    H = [0, 0, 26, 44, 46][stage]
    for i in range(H + 6):
        cv.put(bx + 3, by - i, bam[4])
        cv.put(bx + 4, by - i, bam[2])
        if i % 11 == 0:
            cv.put(bx + 3, by - i, bam[2])
    n = [0, 0, 3, 5, 5][stage]
    stems = _bush(cv, bx, by, n, H, rnd, ramp("leaf_dark"), leafL=(7, 10), leafW=2.4)
    if stage == 3:
        for a, L, tip in stems[1:4]:
            flower(cv, int(tip[0]) + 1, int(tip[1]) + 6, ramp("yellow"), small=True)
    if stage == 4:
        tr = ramp("tomato")
        spots = [(-7, -20), (5, -26), (-3, -32), (8, -14), (-9, -36), (2, -12)]
        for k, (dx, dy) in enumerate(spots):
            col = tr if k != 4 else ramp("orange")
            ball(cv, bx + dx, by + dy, 3.4, 3.2, col)
            cv.put(bx + dx, by + dy - 3, g[5])
            cv.put(bx + dx - 1, by + dy - 4, g[3])
    return cv


def crop_terong(stage, seed=5):
    cv = crop_canvas()
    rnd = random.Random(seed)
    bx, by = CROP_PIVOT
    g = ramp("leaf_dark")
    if stage == 0:
        soil_mound(cv, bx, by - 1, ramp("cloth_white"), rnd)
        return cv
    if stage == 1:
        cv.line(bx, by, bx, by - 5, g[3])
        leaf(cv, bx, by - 5, -2.4, 7, 2.6, g, bias=0.12)
        leaf(cv, bx, by - 5, -0.7, 7, 2.6, g, bias=0.02)
        return cv
    H = [0, 0, 18, 30, 32][stage]
    n = [0, 0, 3, 4, 4][stage]
    stems = _bush(cv, bx, by, n, H, rnd, g, leafL=(9, 12), leafW=3.6)
    if stage == 3:
        for a, L, tip in stems[:3]:
            flower(cv, int(tip[0]), int(tip[1]) + 5, ramp("purple"), small=True)
    if stage == 4:
        pr = ramp("purple")
        for (dx, dy, tilt) in ((-8, -16, -0.25), (6, -20, 0.2), (-1, -10, 0.05)):
            x0, y0 = bx + dx, by + dy
            # green calyx then a long glossy fruit
            cv.put(x0, y0 - 1, ramp("leaf")[4])
            cv.put(x0 - 1, y0, ramp("leaf")[3])
            cv.put(x0 + 1, y0, ramp("leaf")[3])
            for i in range(12):
                w = 1.2 + 1.8 * math.sin(min(1, (i + 1) / 10) * math.pi * 0.62)
                cx = x0 + tilt * i
                for s in range(-int(w), int(w) + 1):
                    t = 4 if s < 0 else (2 if s > 0 else 3)
                    if s == int(w):
                        t = 1
                    cv.put(int(cx + s), y0 + 1 + i, pr[t])
                if 2 < i < 9:
                    cv.put(int(cx - w + 1), y0 + 1 + i, pr[6] if i % 3 == 0 else pr[5])
    return cv


def crop_semangka(stage, seed=6):
    cv = crop_canvas()
    rnd = random.Random(seed)
    bx, by = CROP_PIVOT
    g = ramp("leaf")
    if stage == 0:
        soil_mound(cv, bx, by - 1, ramp("iron"), rnd)
        return cv
    if stage == 1:
        cv.line(bx, by, bx, by - 4, g[3])
        leaf(cv, bx, by - 4, -2.5, 6, 2.6, g, bias=0.12)
        leaf(cv, bx, by - 4, -0.6, 6, 2.6, g)
        return cv
    # a sprawling vine with lobed leaves along the ground
    vines = [(-1, 22), (1, 22), (-1, 12), (1, 14)][: (2 if stage == 2 else 4)]
    for side, L in vines:
        x, y = bx, by - 2
        pts = []
        for i in range(L):
            x += side * 0.9
            y += math.sin(i * 0.5) * 0.4 - (0.25 if L < 15 else 0)
            pts.append((x, y))
            cv.put(int(x), int(y), g[2])
        for k in range(2, len(pts), 5):
            px, py = pts[k]
            if stage > 2 and k + 2 < len(pts):
                lobed(cv, px + side * 2, py - 9, 5.0, g, rnd)
            lobed(cv, px, py - 4, 6.0 if stage > 2 else 4.6, g, rnd)
            if rnd.random() < 0.5:
                cv.put(int(px + side * 2), int(py - 1), g[5])   # tendril curl
    if stage == 3:
        flower(cv, bx + 6, by - 12, ramp("yellow"), small=True)
        flower(cv, bx - 9, by - 8, ramp("yellow"), small=True)
    if stage == 4:
        mel, stripe = ramp("melon"), ramp("melon_stripe")
        cx, cy, rx, ry = bx + 2, by - 7, 11, 8
        for yy in range(int(-ry) - 1, int(ry) + 2):
            for xx in range(int(-rx) - 1, int(rx) + 2):
                dx, dy = (xx + 0.5) / rx, (yy + 0.5) / ry
                r2 = dx * dx + dy * dy
                if r2 <= 1:
                    n = np.array([dx, dy, math.sqrt(1 - r2)])
                    v = 0.42 + 0.6 * float(n @ LIGHT3)
                    t = int(max(1, min(len(mel) - 1, math.floor(v * len(mel)))))
                    # wavy dark stripes around the melon
                    band = math.sin((dx * 5.2 + math.sin(dy * 4) * 0.5) * math.pi / 2 * 1.6)
                    if band > 0.55:
                        t = max(0, min(len(stripe) - 1, t // 2))
                        c = stripe[t]
                    else:
                        c = mel[t]
                    if r2 > 0.78 and dx + dy > 0.1:
                        c = stripe[0]
                    cv.put(int(cx + xx), int(cy + yy), c)
        cv.put(cx - 5, cy - 5, mel[-1])
        cv.put(cx - 4, cy - 5, mel[-1])
        cv.put(cx - 6, cy - 4, mel[-2])
        lobed(cv, bx - 9, by - 13, 4.2, g, rnd)
    return cv


def lobed(cv, x, y, r, rmp, rnd):
    """A round lobed leaf (melon / pumpkin type) seen from above."""
    for yy in range(int(-r) - 1, int(r) + 2):
        for xx in range(int(-r) - 1, int(r) + 2):
            ang = math.atan2(yy, xx)
            lim = r * (0.82 + 0.18 * math.cos(ang * 5))
            if xx * xx + (yy * 1.05) ** 2 <= lim * lim:
                t = 4 if xx + yy < -1 else (2 if xx + yy > 1 else 3)
                if xx * xx + (yy * 1.05) ** 2 > (lim - 1) ** 2 and xx + yy > 0:
                    t = 1
                cv.put(int(x + xx), int(y + yy), rmp[t])
    # veins from the stalk
    for ang in (-2.4, -1.57, -0.7):
        for k in range(1, int(r * 0.8)):
            cv.put(int(x + math.cos(ang) * k), int(y + math.sin(ang) * k * 0.8), rmp[5])
    cv.put(int(x), int(y), rmp[2])


def flower(cv, x, y, rmp, small=False):
    if small:
        for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)):
            cv.put(x + dx, y + dy, rmp[-2])
        cv.put(x - 1, y - 1, rmp[-1])
        cv.put(x + 1, y + 1, rmp[2])
        cv.put(x, y, ramp("yellow")[5] if rmp is not ramp("yellow") else ramp("orange")[4])
        return
    # 5-petal flower, r ~ 3
    for dx, dy in ((0, -2), (-2, -1), (2, -1), (-1, 2), (1, 2)):
        for ex, ey in ((0, 0), (1, 0), (0, 1), (1, 1)):
            cv.put(x + dx + ex - (dx > 0), y + dy + ey - (dy > 0), rmp[-2 if dx + dy <= 0 else -3])
    cv.put(x - 1, y - 2, rmp[-1])
    cv.put(x, y, ramp("yellow")[4])
    cv.put(x + 1, y, ramp("orange")[3])


CROPS = {
    "padi": crop_padi,
    "jagung": crop_jagung,
    "cabai": crop_cabai,
    "tomat": crop_tomat,
    "terong": crop_terong,
    "semangka": crop_semangka,
}
STAGES = ["benih", "tunas", "muda", "dewasa", "panen"]
