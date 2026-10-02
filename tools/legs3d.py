#!/usr/bin/env python3
"""3D-rendered legs and sandals for sprites whose upper body comes from a master frame.

walkfix.py keeps the AI master above the skirt hem; below it this module
renders real legs the same way tools/arya_sprite.py does: a small signed
distance model (thigh, knee, shin, sandal) posed with the walk phase table,
raymarched with the isometric camera, toon shaded in the character's palette
and mode-filtered to pixels. The knee bends, the swing foot lifts and the
sandals are rounded instead of flat stamps.
"""
import math

import numpy as np

from arya_sprite import length, rot_y, sd_capsule, sd_ellipsoid
from pixelfit import FH, FW, PALETTES, PIVOT, hex2rgb

ELEV = math.radians(24)
SS = 2
LIGHT = np.array([-0.55, 0.72, 0.42])
LIGHT /= np.linalg.norm(LIGHT)
SKIN, SANDAL, STRAP, SOLE = 1, 2, 3, 4


class Legs:
    """Two legs in sandals, facing +z, feet on y = 0, units = screen pixels."""

    def __init__(self, k=None, hip_x=3.2, stride=5.5, lift=2.8):
        self.legs = {}
        ph = 2 * math.pi * (k or 0) / 6
        s = math.cos(ph) if k is not None else 0.0          # +1 = left leg forward
        for sgn, (fwd, up) in ((+1, (s, max(0.0, -math.sin(ph)))), (-1, (-s, max(0.0, math.sin(ph))))):
            if k is None:
                up = 0.0
            za = stride * fwd
            base = lift * up
            ankle = np.array([sgn * hip_x, 2.4 + base, za])
            knee = np.array([sgn * (hip_x + 0.1), 10.0 + 0.6 * base, 0.5 * za + 0.8 * base])
            hip = np.array([sgn * hip_x, 24.0, 0.0])
            self.legs[sgn] = (hip, knee, ankle, base)

    def parts(self, p):
        skin = np.full(len(p), 1e9)
        sandal = np.full(len(p), 1e9)
        for hip, knee, ankle, base in self.legs.values():
            skin = np.minimum(skin, sd_capsule(p, hip, knee, 2.7, 2.4))
            skin = np.minimum(skin, sd_capsule(p, knee, ankle, 2.3, 1.95))
            f = sd_ellipsoid(p, (ankle[0], base + 2.0, ankle[2] + 1.5), (3.4, 2.5, 4.8))
            sandal = np.minimum(sandal, np.maximum(f, base - p[:, 1]))
        return skin, sandal

    def dist(self, p):
        a, b = self.parts(p)
        return np.minimum(a, b)

    def materials(self, p):
        skin, sandal = self.parts(p)
        m = np.where(skin < sandal - 0.15, SKIN, SANDAL)
        for hip, knee, ankle, base in self.legs.values():
            near = (np.abs(p[:, 0] - ankle[0]) < 4.0) & (m == SANDAL)
            dz = p[:, 2] - ankle[2]
            m = np.where(near & (p[:, 1] < base + 0.6), SOLE, m)
            m = np.where(near & (dz > 4.6) & (p[:, 1] > base + 1.2), SKIN, m)           # toes
            m = np.where(near & (np.abs(dz - 2.0) < 1.1) & (p[:, 1] > base + 0.7), STRAP, m)
            # strap around the ankle
            ank = (m == SKIN) & (np.abs(p[:, 0] - ankle[0]) < 3.0) & (np.abs(p[:, 1] - (base + 3.6)) < 0.6)
            m = np.where(ank, STRAP, m)
        return m


def render_legs(yaw, k, palette):
    """RGBA layer (FH x FW) of the legs for facing yaw (degrees) and walk frame k (None = standing)."""
    model = Legs(k)
    e = ELEV
    right = np.array([1.0, 0.0, 0.0])
    up = np.array([0.0, math.cos(e), -math.sin(e)])
    view = np.array([0.0, -math.sin(e), -math.cos(e)])
    y0 = 70                                              # the legs never reach above this row
    W, H = FW * SS, (FH - y0) * SS
    ys, xs = np.mgrid[0:H, 0:W]
    sx = (xs + 0.5) / SS - PIVOT[0]
    sy = PIVOT[1] - (y0 + (ys + 0.5) / SS)
    o = (sx[..., None] * right + sy[..., None] * up - 120.0 * view).reshape(-1, 3)
    o_m = rot_y(o, -yaw)
    d_m = rot_y(np.broadcast_to(view, o.shape).copy(), -yaw)
    n = len(o_m)
    t = np.full(n, 80.0)
    hit = np.zeros(n, bool)
    alive = np.ones(n, bool)
    for _ in range(120):
        idx = np.nonzero(alive)[0]
        if len(idx) == 0:
            break
        dd = model.dist(o_m[idx] + d_m[idx] * t[idx, None])
        done = dd < 0.02
        hit[idx[done]] = True
        t[idx] += np.where(done, 0.0, dd * 0.8)
        alive[idx[done]] = False
        alive[idx[t[idx] > 170.0]] = False
    idx = np.nonzero(hit)[0]
    p = o_m[idx] + d_m[idx] * t[idx, None]
    m = model.materials(p)
    nrm = np.zeros_like(p)
    for i in range(3):
        dv = np.zeros(3)
        dv[i] = 0.1
        nrm[:, i] = model.dist(p + dv) - model.dist(p - dv)
    nrm /= np.maximum(length(nrm)[:, None], 1e-6)
    inten = rot_y(nrm, yaw) @ LIGHT
    tone = np.where(inten > 0.55, 3, np.where(inten > -0.1, 2, 1))
    M = np.zeros(n, np.int32)
    M[idx] = m
    T = np.zeros(n, np.int32)
    T[idx] = tone
    D = np.full(n, 1e6)
    D[idx] = t[idx]

    def blocks(a):
        return a.reshape(FH - y0, SS, FW, SS).swapaxes(1, 2).reshape(FH - y0, FW, SS * SS)
    mb, tb, db = blocks(M.reshape(H, W)), blocks(T.reshape(H, W)), blocks(D.reshape(H, W))
    cnt = np.stack([(mb == i).sum(-1) for i in range(5)], -1)
    cnt[..., 0] = np.where(cnt[..., 0] > SS * SS // 2, 99, 0)
    mat = cnt.argmax(-1)
    same = mb == mat[..., None]
    tn = np.stack([((tb == i) & same).sum(-1) for i in range(4)], -1).argmax(-1)
    depth = np.where(same, db, 1e6).min(-1)
    pal = PALETTES[palette]
    skin, leather = pal["skin"], pal["leather"]
    ramp = {SKIN: [skin[1], skin[1], skin[2], skin[3]],
            SANDAL: [leather[1], leather[1], leather[2], leather[3]],
            STRAP: [leather[2], leather[2], leather[3], leather[3]],
            SOLE: [leather[0]] * 4}
    layer = np.zeros((FH, FW, 4), np.uint8)
    sub = layer[y0:]
    for mi, cols in ramp.items():
        for ti in range(1, 4):
            sel = (mat == mi) & (tn == ti)
            sub[sel, :3] = hex2rgb(cols[ti])
            sub[sel, 3] = 255
    # a dark line where the near leg passes in front of the far one
    line = np.zeros(mat.shape, bool)
    for s, ax in ((1, 0), (-1, 0), (1, 1), (-1, 1)):
        line |= (mat > 0) & (np.roll(mat, s, ax) > 0) & (np.roll(depth, s, ax) - depth > 2.0)
    sub[line, :3] = hex2rgb(pal["outline"][0])
    return layer
