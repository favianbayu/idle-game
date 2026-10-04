"""Isometric renderer for built things (house, crates, logs, fences).

World units: 48 units = one grid tile side, so a tile is 96 x 48 px on screen
(the prototype's Iso.TILE_W / TILE_H). +X runs to the screen's lower right
(the SE face looks along +X), +Y to the lower left (the SW face looks along
+Y), +Z is up; 1 unit of Z is 1 px.

  screen x = X - Y,  screen y = (X + Y) / 2 - Z,  depth = X + Y + Z

Surfaces are flat quads, rasterised per screen pixel (each pixel is projected
back onto the quad to get its (u, v) in world units), so texture functions
see exact surface coordinates: tex(u, v) -> (ramp, tone) | (ramp, tone, True)
for a fixed tone that ignores light | None for a hole. The face's light sets
a tone offset: tops are brightest, SW faces are lit, SE faces are in shade.
"""
import math

import numpy as np

import pix
from pix import Canvas, darker, ramp

LIGHT_W = np.array([-0.5, 0.45, 1.0])
LIGHT_W = LIGHT_W / np.linalg.norm(LIGHT_W)
VIEW = np.array([1.0, 1.0, 1.0]) / math.sqrt(3)


def LW(w=1.0):
    """A line width in world units that stays at least one art pixel wide."""
    return w if pix.PIXEL == 1 else max(w, float(pix.PIXEL))


def EV(n):
    """A repeat length rounded up to whole art pixels (unchanged at PIXEL 1)."""
    p = pix.PIXEL
    return n if p == 1 else int(math.ceil(n / p) * p)


def FS():
    """How much bigger repeating texture features get per art pixel size."""
    return 1 + 0.5 * (pix.PIXEL - 1)


def S(p):
    return np.array([p[0] - p[1], (p[0] + p[1]) / 2.0 - p[2]])


def light_offset(n):
    l = float(n @ LIGHT_W)
    # top (l~0.85) -> +1, SW wall (0.38) -> 0, SE wall (-0.42) -> -2
    if l > 0.7:
        return 1
    if l > 0.25:
        return 0
    if l > -0.1:
        return -1
    return -2


class IsoScene:
    def __init__(self, w, h, ox, oy):
        self.w, self.h = w, h
        self.ox, self.oy = ox, oy           # screen position of world origin
        self.depth = np.full((h, w), -1e9)
        self.ramp = np.full((h, w), None, object)
        self.tone = np.zeros((h, w), int)
        self.qid = np.full((h, w), -1, int)
        self.fixed = np.zeros((h, w), bool)
        self.edge_ok = np.ones((h, w), bool)
        self.nq = 0

    def to_screen(self, p):
        s = S(p)
        return s[0] + self.ox, s[1] + self.oy

    def quad(self, P0, U, V, tex, *, bias=0.0, offset=None, edges=True, two_sided=False):
        P0, U, V = np.asarray(P0, float), np.asarray(U, float), np.asarray(V, float)
        n = np.cross(U, V)
        nn = np.linalg.norm(n)
        if nn == 0:
            return
        n = n / nn
        if n @ VIEW < 0:
            n = -n
        off = light_offset(n) if offset is None else offset
        s0 = S(P0) + np.array([self.ox, self.oy])
        su, sv = S(P0 + U) - S(P0), S(P0 + V) - S(P0)
        M = np.array([[su[0], sv[0]], [su[1], sv[1]]])
        if abs(np.linalg.det(M)) < 1e-6:
            return
        inv = np.linalg.inv(M)
        corners = [s0, s0 + su, s0 + sv, s0 + su + sv]
        x0 = int(math.floor(min(c[0] for c in corners))) - 1
        x1 = int(math.ceil(max(c[0] for c in corners))) + 1
        y0 = int(math.floor(min(c[1] for c in corners))) - 1
        y1 = int(math.ceil(max(c[1] for c in corners))) + 1
        Lu, Lv = np.linalg.norm(U), np.linalg.norm(V)
        qid = self.nq
        self.nq += 1
        st = pix.PIXEL                  # one sample per art pixel, at its centre
        y0, x0 = max(0, y0), max(0, x0)
        y0, x0 = y0 - y0 % st, x0 - x0 % st
        for py in range(y0, min(self.h, y1), st):
            for px in range(x0, min(self.w, x1), st):
                d = np.array([px + st / 2 - s0[0], py + st / 2 - s0[1]])
                a, b = inv @ d
                if a < -1e-6 or a > 1 + 1e-6 or b < -1e-6 or b > 1 + 1e-6:
                    continue
                P = P0 + U * a + V * b
                dep = P[0] + P[1] + P[2] + bias
                if dep < self.depth[py, px]:
                    continue
                r = tex(a * Lu, b * Lv)
                if r is None:
                    continue
                fixed = len(r) > 2 and r[2]
                blk = (slice(py, py + st), slice(px, px + st))
                self.depth[blk] = dep
                self.ramp[blk] = r[0]
                self.tone[blk] = r[1] + (0 if fixed else off)
                self.fixed[blk] = fixed
                self.qid[blk] = qid
                self.edge_ok[blk] = edges
        return qid

    def box(self, x0, y0, z0, x1, y1, z1, top=None, sw=None, se=None, **kw):
        """Axis box; only the three faces the camera sees are drawn.

        top(u, v): u along X, v along Y.  sw(u, v): the +Y face, u along X,
        v up.  se(u, v): the +X face, u along Y (back to front), v up.
        """
        if top:
            self.quad((x0, y0, z1), (x1 - x0, 0, 0), (0, y1 - y0, 0), top, **kw)
        if sw:
            self.quad((x0, y1, z0), (x1 - x0, 0, 0), (0, 0, z1 - z0), sw, **kw)
        if se:
            self.quad((x1, y0, z0), (0, y1 - y0, 0), (0, 0, z1 - z0), se, **kw)

    def render(self, edge_thr=7.0, outline=True):
        cv = Canvas(self.w, self.h)
        for y in range(self.h):
            for x in range(self.w):
                r = self.ramp[y, x]
                if r is None:
                    continue
                rm = ramp(r)
                t = max(0, min(len(rm) - 1, int(self.tone[y, x])))
                cv.put(x, y, rm[t])
        # occlusion edges: a nearer surface gets a dark border where it lies
        # over something well behind it
        rgb = cv.rgb.copy()
        P = pix.PIXEL
        for y in range(P, self.h - P):
            for x in range(P, self.w - P):
                if self.ramp[y, x] is None or not self.edge_ok[y, x]:
                    continue
                d = self.depth[y, x]
                for dx, dy in ((P, 0), (-P, 0), (0, P), (0, -P)):
                    q = self.qid[y + dy, x + dx]
                    if q == -1:
                        continue
                    if q != self.qid[y, x] and self.depth[y + dy, x + dx] < d - edge_thr:
                        rgb[y, x] = darker(tuple(int(v) for v in cv.rgb[y, x]), 0.62)
                        break
        cv.rgb = rgb
        if outline:
            cv.outline()
        return cv


# ------------------------------------------------------------ textures
def solid(rmp, tone):
    return lambda u, v: (rmp, tone)


def planks_h(rmp, base=4, gap=8, seed=0, knots=True):
    """Horizontal boards: a dark seam under each board, lit top lip, grain."""
    gap, lw = EV(gap), LW()
    def f(u, v):
        row = int(v // gap)
        k = v - row * gap
        h = (row * 92821 + seed * 31) % 7
        t = base + (h % 3 == 0) - (h % 5 == 0)
        if k < lw:
            return (rmp, base - 2)
        if k >= gap - lw:
            return (rmp, t + 1)
        # board ends (butt joints) staggered per row
        if ((u + h * 13) % 70) < lw:
            return (rmp, base - 2)
        g = math.sin(u * 0.35 + row * 2.1 + math.sin(u * 0.07 + row) * 2)
        if g > 0.93:
            return (rmp, t - 1)
        if knots and (int(u * 7 + row * 131) % 997) == 3:
            return (rmp, base - 2)
        return (rmp, t)
    return f


def planks_v(rmp, base=4, gap=7, seed=0):
    gap, lw = EV(gap), LW()
    def f(u, v):
        col = int(u // gap)
        k = u - col * gap
        h = (col * 7919 + seed) % 5
        t = base + (h == 0) - (h == 3)
        if k < lw:
            return (rmp, base - 2)
        if k >= gap - lw:
            return (rmp, t + 1)
        return (rmp, t)
    return f


def bricks(rmp, base=4, bw=14, bh=6, mortar="plaster", mt=3):
    bw, bh, lw = EV(bw), EV(bh), LW()
    def f(u, v):
        row = int(v // bh)
        uu = u + (bw / 2 if row % 2 else 0)
        if v - row * bh < lw or (uu % bw) < lw:
            return (mortar, mt)
        h = (int(uu // bw) * 31 + row * 17) % 5
        t = base + (h == 0) - (h == 4)
        if v - row * bh >= bh - lw:
            t += 1
        return (rmp, t)
    return f


def stones(rmp, base=4, size=10, seed=3, mortar="soil", mt=2):
    """Irregular stone blocks (Voronoi-ish) for plinths and paths."""
    rs = np.random.RandomState(seed)
    pts = rs.rand(400, 2)

    def f(u, v):
        cu, cv_ = u / size, v / (size * 0.8)
        iu, iv = int(cu), int(cv_)
        best, second, bid = 9, 9, 0
        for du in (-1, 0, 1):
            for dv in (-1, 0, 1):
                gu, gv = iu + du, iv + dv
                k = (gu * 37 + gv * 101) % 400
                px, py = gu + pts[k, 0], gv + pts[k, 1]
                d = (px - cu) ** 2 + (py - cv_) ** 2
                if d < best:
                    second, best, bid = best, d, k
                elif d < second:
                    second = d
        if math.sqrt(second) - math.sqrt(best) < 0.12:
            return (mortar, mt)
        t = base + (bid % 3 == 0) - (bid % 4 == 0)
        # lit upper edge of each stone
        if math.sqrt(second) - math.sqrt(best) < 0.25 and (bid % 2 == 0):
            t += 1
        return (rmp, t)
    return f
