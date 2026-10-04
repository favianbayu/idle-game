"""Rumah utama: the main characters' house, a Javanese-village limasan.

Footprint 5 x 4 tiles (240 x 192 world units). A stone plinth (batur), lower
walls of whitewashed brick, upper walls of horizontal teak-brown boards on
dark posts, a deep front porch (emper) under the main hip roof of terracotta
tiles (genteng), green-painted frames, louvred shutters (krepyak), a carved
vent over the double door (lubang angin) and stone steps.

The house is modelled with its door on the local +Y face. door="SW" draws it
as modelled (door on the SW face); door="SE" swaps X and Y, which puts the
same door on the SE face, so both variants are true renders with the right
light, not mirrored bitmaps.
"""
import math

import numpy as np

from iso import IsoScene, planks_h, bricks, stones, solid
from pix import ramp, Canvas

LX, LY = 240, 192          # footprint (5 x 4 tiles)
EAVE = 142                 # eave height (world px)
WALL_Y1 = 136              # front wall line; an open terrace runs from here to the plinth edge
PL = 12                    # plinth height


class Mirror:
    """Wraps an IsoScene; swap=True maps local (x, y, z) to (y, x, z)."""

    def __init__(self, scene, swap):
        self.s, self.swap = scene, swap

    def m(self, p):
        p = np.asarray(p, float)
        return np.array([p[1], p[0], p[2]]) if self.swap else p

    def quad(self, P0, U, V, tex, **kw):
        return self.s.quad(self.m(P0), self.m(U), self.m(V), tex, **kw)

    def box(self, x0, y0, z0, x1, y1, z1, top=None, sw=None, se=None, **kw):
        # local faces: top, +Y (front), +X (right side)
        if top:
            self.quad((x0, y0, z1), (x1 - x0, 0, 0), (0, y1 - y0, 0), top, **kw)
        if sw:
            self.quad((x0, y1, z0), (x1 - x0, 0, 0), (0, 0, z1 - z0), sw, **kw)
        if se:
            self.quad((x1, y0, z0), (0, y1 - y0, 0), (0, 0, z1 - z0), se, **kw)

    def scr(self, p):
        return self.s.to_screen(self.m(p))


# ------------------------------------------------------------ textures
def wall_tex(length, height, openings=(), porch_shade=0, side=False):
    """Lower brick plaster, a teak rail, boards above, posts at the ends.

    openings: list of (u0, u1, v0, v1, fn) drawn instead of the wall there.
    """
    boards = planks_h("plank", base=4, gap=7, seed=3 if side else 1)
    post_every = 72

    def f(u, v):
        for (u0, u1, v0, v1, fn) in openings:
            if u0 <= u < u1 and v0 <= v < v1:
                r = fn(u - u0, v - v0, u1 - u0, v1 - v0)
                if r is not None:
                    return r
        shade = porch_shade
        if v > height - 16:
            shade -= 1                        # shadow of the eaves
        if v > height - 6:
            shade -= 1
        # posts
        if u < 6 or u > length - 6 or abs((u % post_every) - post_every / 2) < 0 and False:
            t = 3 + (1 if u < 3 else 0)
            return ("teak", t + shade)
        if v < 3:
            return ("stone_warm", 2 + shade)     # sill on the plinth
        if v < 30:
            # whitewashed lower wall with a few patches where plaster fell off
            if v < 4.5:
                return ("plaster", 2 + shade)
            pat = math.sin(u * 0.21) + math.sin(v * 0.37 + u * 0.05)
            return ("plaster", 5 + shade - (1 if pat > 1.55 else 0))
        if v < 34:
            return ("teak", (4 if v > 32.5 else 2) + shade)   # rail
        r, t = boards(u, v - 34)
        return (r, t + shade)
    return f


def window_fn(shutters=True):
    """A window opening: green frame, 2 x 2 glass panes, lit sill."""
    def f(u, v, W, H):
        fr = 3
        sw = 14 if shutters else 0
        # shutters (krepyak), fixed open against the wall on both sides
        if u < sw or u >= W - sw:
            uu = u if u < sw else u - (W - sw)
            if v < 4 or v > H - 3:
                return None
            if uu < 1.5 or uu > sw - 1.5:
                return ("paint_green", 2)
            k = v % 4
            return ("paint_green", 4 if k < 1.4 else (2 if k > 3 else 3))
        u -= sw
        Wg = W - 2 * sw
        if v < 4:
            return ("plaster", 6) if v > 2.5 else ("plaster", 3)     # sill
        if u < fr or u >= Wg - fr or v >= H - fr or v < 4 + fr:
            t = 4 if (u < 1.5 or v >= H - 1.5) else 3
            if u >= Wg - 1.5 or v < 4 + 1.5:
                t = 2
            return ("paint_green", t)
        # mullions
        if abs(u - Wg / 2) < 1.2 or abs(v - (4 + fr + (H - 4 - 2 * fr) / 2)) < 1.0:
            return ("paint_green", 4)
        # glass: dark with a diagonal reflection and a curtain on top
        gx, gy = u, v
        if v > H - fr - 8:
            return ("cloth_white", 4 if int(u) % 4 else 3)       # gorden
        refl = (gx + (H - gy)) % 22
        if refl < 3:
            return ("glass", 5, True)
        if refl < 4.5:
            return ("glass", 4, True)
        return ("glass", 2 if gy < H * 0.45 else 1, True)
    return f


def door_fn():
    """Double wooden door with raised panels, a green frame and a lattice vent above."""
    def f(u, v, W, H):
        fr = 4
        door_h = H - 16
        # carved vent (lubang angin) above the door
        if v >= door_h + 2:
            if v < door_h + 4 or v >= H - 1.5 or u < 2 or u >= W - 2:
                return ("paint_green", 3)
            a = (u + v) % 6
            b = (u - v) % 6
            if a < 1.5 or b < 1.5:
                return ("teak", 4)
            return ("teak", 0)
        if v >= door_h - fr or u < fr or u >= W - fr:
            t = 4 if (u < 1.5 or v > door_h - 1.5) else 3
            if u >= W - 1.5:
                t = 2
            return ("paint_green", t)
        if v < 1.5:
            return ("teak", 1)
        # two leaves
        uu = u - fr
        Wi = W - 2 * fr
        leaf = 0 if uu < Wi / 2 else 1
        lu = uu - leaf * Wi / 2
        lw = Wi / 2
        if lu < 1 or lu >= lw - 0.8:
            return ("teak", 1)
        # raised panels: two per leaf
        pv = [(8, 36), (42, door_h - fr - 7)]
        for (a, b) in pv:
            if 3 <= lu < lw - 3 and a <= v < b:
                if lu < 4 or v >= b - 1:
                    return ("teak", 5)     # lit bevel
                if lu >= lw - 4 or v < a + 1:
                    return ("teak", 2)     # shadow bevel
                return ("teak", 4)
        # handles
        if 38 <= v < 41 and ((leaf == 0 and lw - 4 <= lu < lw - 2) or (leaf == 1 and 2 <= lu < 4)):
            return ("gold", 4)
        return ("teak", 3)
    return f


def roof_tiles(eave_len, slope_len, inset_per_v, *, ridge_cap=True, hip=True):
    """Genteng rows on a hip-roof plane (a trapezoid)."""
    row_h, tile_w = 8.0, 11.0

    def f(u, v):
        b = v / slope_len
        left = inset_per_v * v
        right = eave_len - inset_per_v * v
        if u < left or u > right:
            return None
        # hip caps along the slanted edges, ridge cap along the top
        de = min(u - left, right - u) / max(0.3, math.hypot(1, inset_per_v)) if hip else 99
        if hip and de < 4:
            k = (v % 6)
            return ("clay", (2 if k < 1.2 else 5) - (1 if de > 3 else 0))
        if ridge_cap and slope_len - v < 5:
            k = (u % 9)
            return ("clay", 2 if k < 1.2 else (5 if slope_len - v > 2.5 else 4))
        # eave edge
        if v < 3:
            return ("clay", 1 if v < 1.5 else 3)
        row = int((v - 3) // row_h)
        k = (v - 3) - row * row_h
        uu = u + (tile_w / 2 if row % 2 else 0)
        m = uu % tile_w
        ti = int(uu // tile_w) * 7 + row * 13
        t = 4
        if ti % 11 == 0:
            t -= 1                   # an older, darker tile
        if ti % 17 == 0:
            t += 1
        if k < 1.6:
            return ("clay", 1)       # shadow under the row above
        if k > row_h - 1.2:
            return ("clay", t + 2)   # lit lower lip of the row above... top of this row
        if m < 1.2:
            return ("clay", 2)
        if m < 4:
            return ("clay", t + 1)
        if m > 8.5:
            return ("clay", t - 1)
        return ("clay", t)
    return f


def build(door="SW"):
    W, H = 560, 470
    # world origin placed so the whole house fits
    sc = IsoScene(W, H, ox=W // 2 + (LX - LY) // 2 * -1 + 0, oy=210)
    swap = door == "SE"
    ms = Mirror(sc, swap)
    # centre: the footprint's middle at screen x = W/2
    cxw = (LX - LY) / 2
    sc.ox = W / 2 - (cxw if not swap else -cxw)
    sc.oy = H - 4 - (LX + LY) / 2 - 18

    stone = stones("stone_warm", base=4, size=10, seed=5, mortar="stone_warm", mt=1)
    # --- plinth (batur)
    ms.box(4, 4, 0, LX - 4, LY - 4, PL,
           top=lambda u, v: ("plaster", 3) if v < WALL_Y1 - 4 else porch_floor(u, v - (WALL_Y1 - 4)),
           sw=stone, se=stone)
    # steps to the door
    dx0, dx1 = 98, 142
    ms.box(dx0 - 4, LY - 4, 0, dx1 + 4, LY + 8, 7, top=solid("stone_warm", 5),
           sw=stones("stone_warm", base=4, size=8, seed=8, mortar="stone_warm", mt=1),
           se=solid("stone_warm", 2))
    # --- walls
    wall_h = EAVE - PL
    front_open = [
        (20, 72, 36, 92, window_fn()),
        (156, 208, 36, 92, window_fn()),
        (dx0 - 12 + 2, dx1 - 12 - 2, 0, 100, door_fn()),
    ]
    ms.quad((12, WALL_Y1, PL), (LX - 24, 0, 0), (0, 0, wall_h),
            wall_tex(LX - 24, wall_h, front_open, porch_shade=-1))
    side_open = [(36, 88, 36, 92, window_fn())]
    ms.quad((LX - 12, 12, PL), (0, WALL_Y1 - 12, 0), (0, 0, wall_h),
            wall_tex(WALL_Y1 - 12, wall_h, side_open, side=True))
    # --- door canopy (kanopi): a little gable roof on two posts
    canopy(ms, dx0 - 18, dx1 + 18, WALL_Y1, WALL_Y1 + 34)
    # doormat (keset) and a clay water jar (gentong) with its wooden lid
    ms.box(dx0 + 2, WALL_Y1 + 4, PL, dx1 - 2, WALL_Y1 + 20, PL + 1,
           top=lambda u, v: ("straw", 3 if (u < 2 or u > dx1 - dx0 - 6 or v < 2 or v > 14) else (5 if int(u + v) % 4 < 2 else 4)),
           sw=solid("straw", 2), se=solid("straw", 2))
    # --- bench (lincak bambu) on the porch, left of the door
    bench(ms, 26, WALL_Y1 + 6, 66, WALL_Y1 + 20)
    # flower boxes under the front windows
    for (u0, u1) in ((20 + 14, 72 - 14), (156 + 14, 208 - 14)):
        ms.box(12 + u0 - 2, WALL_Y1, PL + 30, 12 + u1 + 2, WALL_Y1 + 6, PL + 35,
               top=solid("soil", 3), sw=planks_h("plank", base=3, gap=3), se=solid("plank", 2))
    # firewood stack against the right side wall
    ms.box(LX - 12, 22, PL, LX - 2, 76, PL + 30,
           top=log_top(), sw=log_side(), se=log_ends(), bias=0.5)
    # --- roof (limasan)
    ov = 10
    x0, x1 = -ov, LX + ov
    y0, y1 = -ov, WALL_Y1 + ov
    half = (y1 - y0) / 2
    rise = half * 0.74
    ridge_z = EAVE + rise
    slope = math.hypot(half, rise)
    inset = half / slope            # horizontal inset per unit of slope distance
    # front (+Y) and back
    ms.quad((x0, y1, EAVE), (x1 - x0, 0, 0), (0, -half, rise), roof_tiles(x1 - x0, slope, inset), edges=True)
    ms.quad((x1, y0, EAVE), (-(x1 - x0), 0, 0), (0, half, rise), roof_tiles(x1 - x0, slope, inset))
    # hips (+X and -X)
    ms.quad((x1, y1, EAVE), (0, -(y1 - y0), 0), (-half, 0, rise), roof_tiles(y1 - y0, slope, inset))
    ms.quad((x0, y0, EAVE), (0, y1 - y0, 0), (half, 0, rise), roof_tiles(y1 - y0, slope, inset))
    # fascia boards (lisplang) under the eaves
    ms.quad((x0, y1, EAVE - 6), (x1 - x0, 0, 0), (0, 0, 6), fascia, bias=-0.5)
    ms.quad((x1, y0, EAVE - 6), (0, y1 - y0, 0), (0, 0, 6), fascia, bias=-0.5)
    # ridge ornaments (gendheng wuwung / mahkota) at both ridge ends
    rx0, rx1 = x0 + half, x1 - half
    ry = (y0 + y1) / 2
    for rxp in (rx0, rx1):
        ms.quad((rxp - 5, ry, ridge_z - 2), (10, 0, 0), (0, 0, 16), crown_tex, bias=2)
    cv = sc.render(outline=False)
    # 2D details placed by their world position
    layer = Canvas(cv.w, cv.h)
    details(layer, ms, dx0, dx1)
    layer.outline()
    cv.blit(layer, 0, 0)
    cv.outline()
    return cv, ms


def post_tex(shade=0):
    def f(u, v):
        if v < 4 or 40 < v < 43:
            return ("teak", 2 + shade)
        return ("teak", (4 if u < 2 else 3) + shade)
    return f


def beam_tex():
    def f(u, v):
        if v < 1.2:
            return ("teak", 1)
        if v > 6.5:
            return ("teak", 5)
        # simple carved notches every 24 units
        if (u % 24) < 1.5 and 2 < v < 6:
            return ("teak", 1)
        return ("teak", 3)
    return f


def fascia(u, v):
    if v > 4.8:
        return ("paint_green", 5)
    if v < 1.2:
        return ("paint_green", 1)
    # scalloped edge pattern
    return ("paint_green", 3 if (u % 8) > 1 else 2)


def crown_tex(u, v):
    # a small curled ridge ornament silhouette (10 x 16)
    cx = 5
    w = 5 - abs(v - 6) * 0.45 if v < 12 else 2.2 - (v - 12) * 0.4
    if abs(u - cx) > w:
        return None
    if v > 14:
        return None
    return ("clay", 5 if u < cx else 3)


def porch_floor(u, v):
    """Tegel kunci: patterned cement floor tiles, 12 x 12."""
    s = 12
    a, b = u % s, v % s
    if a < 1 or b < 1:
        return ("plaster", 2)
    ca, cb = abs(a - s / 2), abs(b - s / 2)
    if ca + cb < 1.6:
        return ("clay", 5)
    if abs(ca - cb) < 0.7 and 2 < ca < 4.5:
        return ("plaster", 4)
    return ("plaster", 5 if (int(u // s) + int(v // s)) % 2 == 0 else 4)


def bench(ms, x0, y0, x1, y1):
    bam = "straw"
    seat_z = PL + 16
    for (lx, ly) in ((x0 + 1, y0 + 1), (x1 - 3, y0 + 1), (x0 + 1, y1 - 3), (x1 - 3, y1 - 3)):
        ms.box(lx, ly, PL, lx + 2, ly + 2, seat_z, top=solid(bam, 4), sw=solid(bam, 4), se=solid(bam, 2))
    slat = lambda u, v: (bam, 5 if (v % 4) > 1 else 2)
    ms.box(x0, y0, seat_z, x1, y1, seat_z + 2, top=slat, sw=lambda u, v: (bam, 4 if int(u) % 6 else 2),
           se=solid(bam, 3))
    # back rest against the wall
    ms.box(x0, y0, seat_z + 2, x1, y0 + 2, seat_z + 14, top=solid(bam, 5),
           sw=lambda u, v: (bam, 4 if (v % 4) > 1.3 else 1), se=solid(bam, 3))


def log_ends():
    """Stacked firewood seen end-on: round cut ends with rings, bark in between."""
    def f(u, v):
        r = 4.2
        row = int(v // 7.5)
        uu = u + (4.5 if row % 2 else 0)
        cu = (uu // 9) * 9 + 4.5
        cvv = row * 7.5 + 3.75
        d = math.hypot(uu - cu, (v - cvv) * 1.1)
        if d < r:
            if d > r - 1.1:
                return ("bark", 3)
            return ("wood_cut", 3 if int(d * 1.6) % 2 else 2)
        return ("bark", 1)
    return f


def log_side():
    return lambda u, v: ("bark", 3 if (v % 7.5) > 1.5 else 1)


def log_top():
    return lambda u, v: ("bark", 4 if (u % 9) > 1.5 else 2)


def details(cv, ms, dx0, dx1):
    """Pixel-drawn props that are easier in 2D: lantern, pots, plants, jar."""
    from plants import leaf, ball, flower
    g = ramp("leaf")
    jx, jy = ms.scr((LX - 26, LY - 22, PL))
    draw_gentong(cv, int(jx), int(jy))
    # hanging lantern on the beam, right of the door
    lx, ly = ms.scr((dx1 + 16, WALL_Y1 + 2, PL + 104))
    lx, ly = int(lx), int(ly)
    iron, gold = ramp("iron"), ramp("yellow")
    for i in range(6):
        cv.put(lx, ly + i, iron[3])
    for yy in range(7):
        for xx in range(-3, 4):
            if yy in (0, 6) or abs(xx) == 3:
                cv.put(lx + xx, ly + 6 + yy, iron[2 if xx > 0 else 4])
            else:
                cv.put(lx + xx, ly + 6 + yy, gold[6 if (xx < 0 and yy < 4) else 5])
    cv.put(lx, ly + 13, iron[1])
    # potted plants beside the steps
    for (px, side) in ((dx0 - 10, -1), (dx1 + 10, 1)):
        sx, sy = ms.scr((px, LY + 2, 0))
        sx, sy = int(sx), int(sy)
        pot = ramp("clay")
        for yy in range(10):
            w = 6 - yy * 0.25
            for xx in range(-int(w), int(w) + 1):
                t = 5 if xx < -1 else (3 if xx < 2 else 2)
                if yy < 2:
                    t = 6 if yy == 0 else 4
                cv.put(sx + xx, sy - yy, pot[t])
        for k, a in enumerate((-2.3, -1.9, -1.5, -1.2, -0.85, -2.6, -0.5)):
            leaf(cv, sx, sy - 10, a, 10 + (k % 3) * 2, 2.2, g, droop=0.25, bias=0.08 if a < -1.57 else -0.06)
        flower(cv, sx - 3, sy - 19, ramp("red"))
        flower(cv, sx + 4, sy - 16, ramp("red"))
    # flowers in the window boxes
    for (u0, u1) in ((20 + 14, 72 - 14), (156 + 14, 208 - 14)):
        for k in range(4):
            u = 12 + u0 + (u1 - u0) * (k + 0.5) / 4
            sx, sy = ms.scr((u, WALL_Y1 + 3, PL + 35))
            sx, sy = int(sx), int(sy)
            for a in (-2.2, -1.0):
                leaf(cv, sx, sy, a, 5, 1.6, g, bias=0.05)
            flower(cv, sx, sy - 4, ramp("pink" if k % 2 else "yellow"), small=True)


def canopy(ms, x0, x1, y0, y1):
    """Gable canopy over the door: two roof planes, a carved gable board, posts."""
    zl = PL + 106             # eave height
    mid = (x0 + x1) / 2
    half = (x1 - x0) / 2 + 4
    rise = 22
    slope = math.hypot(half, rise)
    tiles = roof_tiles(y1 - y0 + 6, slope, 0.0, hip=False)
    # carved diagonal braces from the wall instead of posts, so the door stays in view
    for px in (x0 + 4, x1 - 4):
        ms.quad((px, y0, zl - 34), (0, y1 - y0 - 2, 32), (0, 0, 5),
                lambda u, v: ("teak", 4 if v > 3.5 else 2))
        ms.quad((px - 1.5, y0, zl - 34), (0, y1 - y0 - 2, 32), (3, 0, 0),
                lambda u, v: ("teak", 3))
    # roof planes: left (-X) and right (+X); u along Y, v up the slope
    ms.quad((mid - half, y1 + 6, zl), (0, -(y1 - y0 + 6), 0), (half, 0, rise),
            lambda u, v: tiles(u, v))
    ms.quad((mid + half, y0, zl), (0, y1 - y0 + 6, 0), (-half, 0, rise),
            lambda u, v: tiles(u, v))
    # gable board (front triangle)
    def gable(u, v):
        w = half * (1 - v / rise)
        if abs(u - half) > w:
            return None
        if abs(u - half) > w - 2.5:
            return ("paint_green", 4 if u < half else 2)
        # sunburst carving
        ang = math.atan2(v + 2, u - half)
        if int(ang * 8) % 2 == 0:
            return ("plank", 5)
        return ("plank", 3)
    ms.quad((mid - half, y1 + 6, zl), (2 * half, 0, 0), (0, 0, rise), gable, bias=0.4)
    ms.box(mid - half, y1 + 2, zl - 6, mid + half, y1 + 6, zl,
           top=solid("teak", 4), sw=beam_tex(), se=solid("teak", 2))


def draw_gentong(cv, x, y):
    """A round clay water jar (gentong) with a wooden lid and a coconut-shell dipper."""
    from pix import LIGHT3
    cl, pl = ramp("clay"), ramp("plank")
    H = 24
    for yy in range(H):
        t = yy / (H - 1)                    # 0 top .. 1 bottom
        r = 6 + 6.5 * math.sin(min(1.0, 0.25 + t * 0.95) * math.pi * 0.9)
        if yy < 3:
            r = 7.5                          # rim
        for xx in range(-int(r), int(r) + 1):
            s = xx / (r + 0.01)
            n = np.array([s, (t - 0.45) * 0.9, math.sqrt(max(0.05, 1 - s * s))])
            n = n / np.linalg.norm(n)
            v = 0.42 + 0.6 * float(n @ LIGHT3)
            k = int(max(1, min(len(cl) - 2, math.floor(v * len(cl)))))
            if yy < 3:
                k = 5 if yy == 0 else 3
            if yy == 9 or yy == 10:
                k = max(1, k - 1)            # a pressed band
            if abs(xx) == int(r) and xx > 0:
                k = 1
            cv.put(x + xx, y - H + yy, cl[k])
    # lid
    for xx in range(-8, 9):
        cv.put(x + xx, y - H - 1, pl[5 if xx < 3 else 3])
        cv.put(x + xx, y - H, pl[2])
    for xx in range(-1, 2):
        cv.put(x + xx, y - H - 2, pl[4])
    # dipper (gayung batok) resting on the lid
    for xx in range(2, 7):
        cv.put(x + xx, y - H - 3, ramp("bark")[4 if xx < 4 else 2])
        cv.put(x + xx, y - H - 2, ramp("bark")[2])
    cv.line(x + 6, y - H - 3, x + 12, y - H - 7, ramp("plank")[5])
