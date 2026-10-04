"""Trees: broadleaf (mangga, hutan, jati), kelapa, pisang, saplings and stumps.

A broadleaf canopy is a big ellipsoid filled with many small leaf clumps. Each
clump is shaded by the big ellipsoid's normal where it sits (so the crown has
one light side and one shadow side) mixed with its own little sphere normal (so
every clump reads as a puff of leaves), drawn back to front.
"""
import math
import random

import numpy as np

import pix
from pix import Canvas, Noise, ramp, LIGHT3, bayer


def _norm(v):
    return v / np.linalg.norm(v)


def canopy(cv, cx, cy, rx, ry, rmp, seed, *, clump=(6, 10), density=1.0, lo=0, hi=None,
           depth_base=0.0, sparkle=0.02, flat_bottom=0.0, fruit=None, fruit_n=0, bias=0.0):
    rnd = random.Random(seed)
    hi = len(rmp) - 1 if hi is None else hi
    if pix.PIXEL > 1:
        # bigger leaf puffs so each still reads with chunkier pixels
        k = 1 + 0.6 * (pix.PIXEL - 1)
        clump = (clump[0] * k, clump[1] * k)
    n_clumps = int(density * (rx * ry) / (clump[0] * clump[1]) * 3.2)
    clumps = []
    for i in range(n_clumps):
        # points on/in an ellipsoid; favour the surface
        while True:
            u, v = rnd.uniform(-1, 1), rnd.uniform(-1, 1)
            if u * u + v * v <= 1:
                break
        r2 = u * u + v * v
        z = math.sqrt(max(0.0, 1 - r2))
        if flat_bottom and v > 1 - flat_bottom:
            continue
        rr = rnd.uniform(*clump)
        # clumps near the edge are a bit smaller
        rr *= 1 - 0.25 * r2
        clumps.append((cx + u * (rx - rr), cy + v * (ry - rr), rr, u, v, z))
    clumps.sort(key=lambda c: c[5])
    nz = Noise(seed + 3)
    for (x0, y0, rr, u, v, z) in clumps:
        gn = _norm(np.array([u, v, z + 0.25]))
        ry_ = rr * 0.85
        pts = []
        for y in range(int(y0 - ry_ - 2), int(y0 + ry_ + 2)):
            for x in range(int(x0 - rr - 2), int(x0 + rr + 2)):
                dx = (x + 0.5 - x0) / rr
                dy = (y + 0.5 - y0) / ry_
                ang = math.atan2(dy, dx)
                # scalloped clump edge: little leaf tips
                lim = 1 + 0.18 * math.sin(ang * 5 + i_hash(x0, y0)) + 0.1 * (nz(x * 0.4, y * 0.4) - 0.5)
                if dx * dx + dy * dy <= lim * lim:
                    pts.append((x, y, dx / lim, dy / lim))
        pset = {(p[0], p[1]) for p in pts}
        for (x, y, dx, dy) in pts:
            r2 = min(1.0, dx * dx + dy * dy)
            ln = _norm(np.array([dx, dy, math.sqrt(1 - r2) + 0.1]))
            n = _norm(gn * 0.62 + ln * 0.38)
            l = float(n @ LIGHT3)
            val = 0.36 + 0.62 * l + bias - 0.18 * (1 - z)
            val += (bayer(x, y) - 0.5) * 0.03
            t = int(max(lo, min(hi, math.floor(lo + val * (hi - lo + 0.999)))))
            # shadow rim on each clump's lower right: separates the puffs
            P = pix.PIXEL
            if ((x + P, y + P) not in pset or (x, y + P) not in pset) and dx + dy > 0.1:
                t = max(lo, t - 2)
            if rnd.random() < sparkle and t >= hi - 2 and dx + dy < -0.3:
                t = hi
            cv.put(x, y, rmp[t], depth_base + z * 10)
    if fruit and fruit_n:
        fr = ramp(fruit)
        placed = 0
        tries = 0
        while placed < fruit_n and tries < 500:
            tries += 1
            u, v = rnd.uniform(-0.85, 0.85), rnd.uniform(-0.3, 0.95)
            if u * u + v * v > 0.8:
                continue
            fx, fy = int(cx + u * rx), int(cy + v * ry)
            if not cv.a[fy, fx]:
                continue
            draw_fruit(cv, fx, fy, fr, kind=fruit)
            placed += 1
    return clumps


def i_hash(a, b):
    return (int(a * 7.13 + b * 3.71) % 13) * 0.5


def draw_fruit(cv, x, y, fr, kind="mango"):
    # a small hanging fruit: stalk, oval body, highlight
    cv.put(x, y - 3, ramp("bark")[3])
    pts = [(0, -2), (-1, -1), (0, -1), (1, -1), (-1, 0), (0, 0), (1, 0), (2, 0), (-1, 1), (0, 1), (1, 1), (2, 1), (0, 2), (1, 2)]
    for dx, dy in pts:
        t = 4 - (1 if dx + dy > 1 else 0) - (1 if dx + dy > 2 else 0) + (1 if dx + dy < 0 else 0)
        cv.put(x + dx, y + dy, fr[max(1, min(len(fr) - 1, t))])
    cv.put(x - 1, y - 1, fr[-1])
    cv.put(x + 1, y + 3, fr[1])
    cv.put(x + 2, y + 2, fr[1])


def trunk(cv, base_x, base_y, height, w_base, w_top, rmp, seed, *, lean=0.0, flare=6, roots=True,
          depth=0.0, lo=0, hi=None, curve=0.0):
    """Tapered round trunk with vertical bark grooves and root flare."""
    rnd = random.Random(seed)
    hi = len(rmp) - 1 if hi is None else hi
    nz = Noise(seed + 11)
    for i in range(int(height)):
        t = i / max(1, height - 1)       # 0 at the base
        y = base_y - i
        w = w_base + (w_top - w_base) * t
        if roots:
            w += flare * max(0.0, 1 - i / 7.0) ** 2
        cx = base_x + lean * i + curve * math.sin(t * math.pi) * 6
        x0, x1 = int(round(cx - w / 2)), int(round(cx + w / 2))
        for x in range(x0, x1 + 1):
            s = (x + 0.5 - cx) / (w / 2 + 0.01)      # -1 .. 1 across
            s = max(-1.0, min(1.0, s))
            n = np.array([s, 0.0, math.sqrt(max(0.0, 1 - s * s))])
            l = float(n @ LIGHT3)
            v = 0.45 + 0.55 * l
            # bark grooves: vertical streaks that wander a little
            g = nz(x * 0.55 / pix.PIXEL, y * 0.06 / pix.PIXEL)
            if g < 0.32:
                v -= 0.22
            elif g > 0.78:
                v += 0.10
            v += (bayer(x, y) - 0.5) * 0.08
            tt = int(max(lo, min(hi, math.floor(lo + v * (hi - lo + 0.999)))))
            if x > x1 - pix.PIXEL:
                tt = lo
            cv.put(x, y, rmp[tt], depth)
    return


def root_bumps(cv, bx, by, w, rmp, seed):
    rnd = random.Random(seed)
    for side in (-1, 1):
        for k in range(2):
            x0 = bx + side * (w / 2 + rnd.randint(0, 3))
            L = rnd.randint(4, 8)
            for i in range(L):
                x = int(x0 + side * i)
                y = int(by - max(0, (L - i) // 3))
                t = 3 if side < 0 else 1
                cv.put(x, y, rmp[t])
                cv.put(x, y + 1, rmp[1])


def branch(cv, x0, y0, x1, y1, w0, w1, rmp, depth=0.0):
    L = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    for i in range(L + 1):
        t = i / L
        x = x0 + (x1 - x0) * t
        y = y0 + (y1 - y0) * t
        w = w0 + (w1 - w0) * t
        for k in range(int(-w / 2), int(w / 2) + 1):
            tone = 4 if k < 0 else (2 if k > 0 else 3)
            if abs(y1 - y0) > abs(x1 - x0):
                cv.put(int(x + k), int(y), rmp[tone], depth)
            else:
                cv.put(int(x), int(y + k), rmp[tone], depth)


# ----------------------------------------------------------------- trees
def broadleaf(seed, *, kind="mangga", w=160, h=200, fruit=False):
    cv = Canvas(w, h)
    base_x, base_y = w // 2, h - 8
    leaf = {"mangga": "leaf", "hutan": "leaf", "jati": "leaf_dark", "kemarau": "leaf_yellow"}.get(kind, "leaf")
    bark = {"jati": "bark_grey"}.get(kind, "bark")
    br = ramp(bark)
    if kind == "jati":
        th, tw0, tw1 = 92, 15, 9
        crx, cry = 58, 46
    elif kind in ("hutan", "kemarau"):
        th, tw0, tw1 = 74, 18, 11
        crx, cry = 70, 56
    else:
        th, tw0, tw1 = 62, 18, 11
        crx, cry = 68, 58
    trunk(cv, base_x, base_y, th, tw0, tw1, br, seed, flare=7)
    root_bumps(cv, base_x, base_y, tw0, br, seed)
    top_y = base_y - th
    # branches reaching into the crown
    branch(cv, base_x - 2, top_y + 14, base_x - 26, top_y - 12, 7, 3, br)
    branch(cv, base_x + 3, top_y + 10, base_x + 30, top_y - 16, 6, 3, br)
    branch(cv, base_x, top_y + 4, base_x + 2, top_y - 30, 7, 3, br)
    ccx, ccy = base_x, top_y - cry * 0.55
    fr = None
    if fruit:
        fr = "orange" if kind == "mangga" else "red"
    lr = ramp(leaf)
    # main crown plus two side lobes for a less regular silhouette
    rnd = random.Random(seed)
    canopy(cv, ccx - crx * 0.45, ccy + cry * 0.22, crx * 0.58, cry * 0.62, lr, seed + 1, depth_base=-5, bias=-0.06)
    canopy(cv, ccx + crx * 0.47, ccy + cry * 0.18, crx * 0.56, cry * 0.6, lr, seed + 2, depth_base=-5, bias=-0.1)
    canopy(cv, ccx, ccy - cry * 0.08, crx * 0.78, cry * 0.82, lr, seed + 3, depth_base=0,
           fruit=fr, fruit_n=9 if fruit else 0)
    if fruit:
        # canopy() draws fruits with the ramp of `fruit` names; re-draw with real ramps
        pass
    shade_under_canopy(cv, br, base_x, tw0 + 10)
    return cv, (base_x, base_y)


def shade_under_canopy(cv, br, bx, half_w, depth=10):
    """The crown casts shade on the top of the trunk just under it."""
    idx = {c: i for i, c in enumerate(br)}
    for x in range(int(bx - half_w), int(bx + half_w) + 1):
        leaf_seen = None
        for y in range(cv.h):
            c = cv.get(x, y)
            if c is None:
                continue
            if c in idx:
                if leaf_seen is not None and y - leaf_seen <= depth:
                    k = 2 if y - leaf_seen <= depth * 0.6 else 1
                    cv.put(x, y, br[max(0, idx[c] - k)])
            else:
                leaf_seen = y


def palm(seed, w=190, h=240, coconuts=True):
    """Pohon kelapa: a tall curved ringed trunk and a crown of drooping fronds."""
    cv = Canvas(w, h)
    rnd = random.Random(seed)
    br = ramp("palm_bark")
    base_x, base_y = w // 2 - 14, h - 8
    H = 150
    # curved trunk: centre line bends right then up
    pts = []
    for i in range(H):
        t = i / (H - 1)
        x = base_x + 26 * (t ** 1.6)
        pts.append((x, base_y - i))
    for i, (x, y) in enumerate(pts):
        t = i / (H - 1)
        wdt = 12 - 4 * t + (5 * max(0, 1 - i / 8.0) ** 2)
        x0, x1 = int(round(x - wdt / 2)), int(round(x + wdt / 2))
        ring = (i % 7) in (0, 1)
        for xx in range(x0, x1 + 1):
            s = max(-1, min(1, (xx + 0.5 - x) / (wdt / 2)))
            l = float(np.array([s, 0, math.sqrt(max(0, 1 - s * s))]) @ LIGHT3)
            v = 0.42 + 0.55 * l + (-0.2 if ring else 0.0) + (bayer(xx, int(y)) - 0.5) * 0.08
            tt = int(max(0, min(len(br) - 1, math.floor(v * len(br)))))
            if xx > x1 - pix.PIXEL:
                tt = 0
            if ring and (i % 7) == 1 and s < 0.3:
                tt = min(len(br) - 1, tt + 2)   # lit lip under each ring
            cv.put(xx, int(y), br[tt])
    top_x, top_y = pts[-1]
    pr = ramp("palm")
    # fronds: back ones first (darker), front ones last
    angles = [200, 240, 300, 340, 160, 20, 130, 50, 95]
    fronds = []
    for k, a in enumerate(angles):
        ang = math.radians(a + rnd.uniform(-8, 8))
        L = rnd.uniform(70, 84)
        back = math.sin(ang) < -0.2  # pointing up the screen = behind
        fronds.append((0 if back else (1 if abs(math.sin(ang)) < 0.4 else 2), ang, L))
    fronds.sort(key=lambda f: f[0])
    for layer, ang, L in fronds:
        frond(cv, top_x, top_y, ang, L, pr, rnd, layer)
    if coconuts:
        cr = ramp("corn_husk")
        for dx, dy in ((-6, 6), (2, 8), (8, 5), (-1, 12)):
            cv_ball(cv, top_x + dx, top_y + dy, 4, cr)
    # crown heart
    for dx in range(-3, 4):
        cv.put(int(top_x + dx), int(top_y), br[2])
    return cv, (base_x, base_y)


def cv_ball(cv, x, y, r, rmp):
    for yy in range(-r, r + 1):
        for xx in range(-r, r + 1):
            if xx * xx + yy * yy <= r * r + 1:
                n = np.array([xx / r, yy / r, math.sqrt(max(0, 1 - (xx * xx + yy * yy) / (r * r + 1)))])
                l = float(_norm(n) @ LIGHT3)
                t = int(max(1, min(len(rmp) - 2, math.floor((0.45 + 0.6 * l) * len(rmp)))))
                if xx * xx + yy * yy >= r * r - 1 and xx + yy > 0:
                    t = 1
                cv.put(int(x + xx), int(y + yy), rmp[t])
    cv.put(int(x - r / 2), int(y - r / 2), rmp[-1])


def frond(cv, x0, y0, ang, L, rmp, rnd, layer):
    """One palm frond: an arching midrib with dense leaflets hanging off both sides."""
    dxu, dyu = math.cos(ang), math.sin(ang) * 0.5
    shade = [-0.22, -0.04, 0.1][layer]
    spine = []
    for i in range(int(L)):
        t = i / L
        x = x0 + dxu * i
        y = y0 + dyu * i - 12 * math.sin(t * math.pi * 0.7) + 30 * t * t * t
        spine.append((x, y, t))
    hi = len(rmp) - 1
    for j in range(2, len(spine) - 1):
        x, y, t = spine[j]
        nx, ny = spine[j + 1][0] - x, spine[j + 1][1] - y
        d = math.hypot(nx, ny) or 1
        nx, ny = nx / d, ny / d
        # serrated blade: leaflets come in groups, every 4th spine step starts
        # a new tooth, so the hanging edge reads as separate leaflets
        tooth = (j % 4) / 3.0
        base = 10 * math.sin(min(1.0, t * 1.1 + 0.12) * math.pi) + 2
        for side in (-1, 1):
            px, py = -ny * side, nx * side
            hang = py > 0          # the side that hangs below the rib
            ln = base * (0.45 + 0.55 * tooth) * (1.0 if hang else 0.45)
            lx, ly = x, y
            for k in range(int(ln)):
                f = k / max(1.0, ln)
                lx += px * 0.6 + nx * 0.6
                ly += py * 0.6 + ny * 0.6 + 0.3 + f * 0.5
                v = 0.6 + shade + (0.12 if not hang else 0.0) + 0.06 * (1 - t)
                v -= 0.0 if f < 0.45 else (0.13 if f < 0.8 else 0.26)
                tt = int(max(0, min(hi, math.floor(v * (hi + 1)))))
                cv.put(int(lx), int(ly), rmp[tt])
    for (x, y, t) in spine:
        cv.put(int(x), int(y), rmp[min(hi, 4 + layer)])
        cv.put(int(x), int(y) + 1, rmp[max(0, 2 + layer)])


def banana(seed, w=110, h=150):
    """Pohon pisang: soft pseudo-stem and wide paddle leaves, one fruit bunch."""
    cv = Canvas(w, h)
    rnd = random.Random(seed)
    base_x, base_y = w // 2, h - 8
    sr = ramp("banana")
    # pseudo-stem
    for i in range(70):
        wdt = 11 - i * 0.05
        for xx in range(int(-wdt / 2), int(wdt / 2) + 1):
            s = xx / (wdt / 2)
            l = float(np.array([s, 0, math.sqrt(max(0, 1 - s * s))]) @ LIGHT3)
            v = 0.35 + 0.5 * l + (0.08 if (xx + i // 9) % 5 == 0 else 0)
            t = int(max(0, min(len(sr) - 2, math.floor(v * len(sr)))))
            cv.put(base_x + xx, base_y - i, sr[t])
    top = (base_x, base_y - 70)
    leaves = [(-160, 60), (-20, 60), (-125, 64), (-55, 62), (-5, 52), (-178, 52), (-90, 50)]
    for k, (a, L) in enumerate(leaves):
        paddle(cv, top[0], top[1], math.radians(a + rnd.uniform(-6, 6)), L, sr, rnd, k)
    # fruit bunch hanging on the right
    yr = ramp("melon")
    bx, by = top[0] + 10, top[1] + 10
    cv.line(top[0] + 2, top[1] + 2, bx, by, sr[2])
    for row in range(4):
        for c in range(3 - row // 2):
            fx = bx - 4 + c * 4 + row % 2
            fy = by + row * 4
            for d in range(4):
                cv.put(fx + d // 2, fy + d, yr[4 - (d > 2)])
            cv.put(fx + 1, fy + 3, yr[2])
    # heart (jantung pisang)
    hx, hy = bx + 1, by + 18
    pr = ramp("purple")
    for yy in range(7):
        for xx in range(-2, 3):
            if abs(xx) <= 2 - yy // 4:
                cv.put(hx + xx, hy + yy, pr[3 + (xx < 0) - (yy > 4)])
    return cv, (base_x, base_y)


def paddle(cv, x0, y0, ang, L, rmp, rnd, k):
    """A banana leaf: a wide blade along an arching midrib with torn edges."""
    dx, dy = math.cos(ang), math.sin(ang)
    spine = []
    for i in range(int(L)):
        t = i / L
        x = x0 + dx * i * 0.95
        y = y0 + dy * i * 0.85 + 42 * t * t * (1 if abs(dx) > 0.3 else 0.5)
        spine.append((x, y, t))
    hi = len(rmp) - 1
    back = k in (0, 2, 5)
    tears = {int(rnd.uniform(0.35, 0.9) * len(spine)) for _ in range(4)}
    for j in range(len(spine) - 1):
        x, y, t = spine[j]
        nx, ny = spine[j + 1][0] - x, spine[j + 1][1] - y
        d = math.hypot(nx, ny) or 1
        nx, ny = nx / d, ny / d
        px, py = -ny, nx
        wdt = 7 * math.sin(min(1, t * 1.1 + 0.06) * math.pi) ** 0.7 + 1
        torn_side = 1 if j in tears else (-1 if (j - 1) in tears else 0)
        s_ = -wdt
        while s_ <= wdt:
            if torn_side and s_ * torn_side > 1.5:
                s_ += 0.5
                continue
            X = x + px * s_
            Y = y + py * s_ + abs(s_) * 0.18
            upper = (py * s_) < 0
            v = 0.56 + (0.16 if upper else -0.14) - 0.14 * abs(s_) / wdt - 0.1 * t
            if back:
                v -= 0.16
            # faint parallel veins
            if int(abs(s_) * 2) % 5 == 0 and abs(s_) > 1.5:
                v -= 0.06
            tt = int(max(1, min(hi, math.floor(v * (hi + 1)))))
            if abs(s_) > wdt - 1:
                tt = max(0, tt - 2)
            cv.put(int(X), int(Y), rmp[tt])
            s_ += 0.5
        cv.put(int(x), int(y), rmp[hi if t < 0.75 else hi - 1])


def sapling(seed, stage):
    """Young tree stages: 0 seedling, 1 sapling, 2 young tree."""
    sizes = [(32, 36), (48, 64), (88, 120)]
    w, h = sizes[stage]
    cv = Canvas(w, h)
    bx, by = w // 2, h - 6
    br, lr = ramp("bark"), ramp("leaf")
    if stage == 0:
        cv.line(bx, by, bx, by - 12, lr[3])
        for s in (-1, 1):
            for i in range(6):
                cv.put(bx + s * (1 + i), by - 10 - (i // 2) + (i == 5), lr[5 if s < 0 else 3])
                cv.put(bx + s * (1 + i), by - 9 - (i // 3), lr[4 if s < 0 else 2])
        cv.put(bx, by - 13, lr[6])
    elif stage == 1:
        trunk(cv, bx, by, 30, 4, 3, br, seed, flare=1, roots=False)
        canopy(cv, bx, by - 38, 14, 13, lr, seed, clump=(4, 6))
    else:
        trunk(cv, bx, by, 48, 9, 6, br, seed, flare=3)
        branch(cv, bx, by - 44, bx - 12, by - 58, 4, 2, br)
        branch(cv, bx + 1, by - 40, bx + 14, by - 60, 4, 2, br)
        canopy(cv, bx - 14, by - 62, 18, 18, lr, seed + 1, clump=(5, 7), bias=-0.08)
        canopy(cv, bx + 15, by - 64, 18, 18, lr, seed + 2, clump=(5, 7), bias=-0.1)
        canopy(cv, bx, by - 76, 26, 24, lr, seed + 3, clump=(5, 8))
    return cv, (bx, by)


def stump(seed, w=48, h=40, big=False):
    """Tunggul: a cut stump with growth rings on top."""
    if big:
        w, h = 80, 60
    cv = Canvas(w, h)
    br = ramp("bark")
    wc = ramp("wood_cut")
    bx, by = w // 2, h - 8
    rw = 26 if big else 15
    th = 18 if big else 11
    trunk(cv, bx, by, th, rw, rw - 2, br, seed, flare=8 if big else 5)
    root_bumps(cv, bx, by, rw, br, seed)
    # top face ellipse with rings
    cx, cy = bx - 1, by - th + 1
    rx, ry = (rw - 2) / 2 + 0.5, (rw - 2) / 4 + 0.5
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - rx - 1), int(cx + rx + 2)):
            dx = (x + 0.5 - cx) / rx
            dy = (y + 0.5 - cy) / ry
            r = math.hypot(dx, dy)
            if r <= 1:
                ring = int(r * (6 if big else 4)) % 2
                t = 3 - ring + (1 if dx + dy < -0.4 else 0)
                if r > 0.86:
                    t = 1 if dx + dy > 0 else 4
                cv.put(x, y, wc[max(0, min(len(wc) - 1, t))])
    # a crack
    cv.line(cx, cy, cx + rx * 0.6, cy + ry * 0.5, wc[1])
    if big:
        cv.line(cx, cy, cx - rx * 0.5, cy - ry * 0.6, wc[1])
    return cv, (bx, by)
