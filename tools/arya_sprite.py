#!/usr/bin/env python3
"""Arya Prasetya (Desa Rimbasari) - chibi isometric sprite generator.

Arya has no AI reference atlas yet, so he is built as a small signed-distance
model and rendered straight into pixel art in the v3 house style set by the
approved Indah sprite: about 2.5 heads tall, 46 relative units = 90 px in the
96 x 128 frame (pivot 48,116), hand-drawn 7 x 7 px eyes, 1 px outline #120B0D,
light from the top-left, at most 32 colours.

  rows   SE, S, SW, W, NW, N, NE, E
  walk   6 frames: contact A, down A, passing A, contact B, down B, passing B
         (legs alternate, arms swing against them, 1 px body bob)
  idle   1 standing frame per direction

Usage:  python3 tools/arya_sprite.py [out_dir]
"""
import json
import math
import os
import sys

import numpy as np
from PIL import Image

FW, FH = 96, 128
PIVOT = (48, 116)
SS = 2                            # rays per pixel side, mode-filtered down
ELEV = math.radians(24)
SCALE = 1.4                       # model units -> screen pixels
DIRS = ["SE", "S", "SW", "W", "NW", "N", "NE", "E"]
YAW = {"S": 0, "SE": 45, "E": 90, "NE": 135, "N": 180, "NW": -135, "W": -90, "SW": -45}
LIGHT = np.array([-0.55, 0.72, 0.42])
LIGHT /= np.linalg.norm(LIGHT)

HEX = {
    "outline": "#120B0D",
    "skin_line": "#94522E", "skin_sh": "#CD864F", "skin": "#E79E61", "skin_hi": "#F0B47E",
    "hair_sh": "#1A1215", "hair": "#241B1F", "hair_mid": "#2F2528", "hair_hi": "#43353A",
    "shirt_line": "#B9B2A0", "shirt_sh": "#D8D2C2", "shirt": "#F3EEE3", "shirt_hi": "#FFFDF7",
    "pants_line": "#9A8763", "pants_sh": "#B8A47E", "pants": "#D9C8A6", "pants_hi": "#E9DCC0",
    "shoe_line": "#9A9A96", "shoe_sh": "#CFCFCB", "shoe": "#F0EEE8", "sole": "#8C8478",
    "bag_line": "#5C452C", "bag_sh": "#735737", "bag": "#8A6A45", "bag_hi": "#A88660",
    "book_red": "#A8443A", "book_blue": "#4A6A9A", "glasses": "#9A7830",
    "iris": "#593120", "iris_lt": "#8A5230", "white": "#FFFFFF", "mouth": "#B8604A",
}
RGB = {k: tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) for k, v in HEX.items()}

(NONE, SKIN, HAIR, SHIRT, PANTS, SHOE, SOLE, BAG, BOOK_R, BOOK_B, PEN) = range(11)
RAMP = {
    SKIN: ["skin_line", "skin_sh", "skin", "skin_hi"],
    HAIR: ["outline", "hair_sh", "hair", "hair_mid", "hair_hi"],
    SHIRT: ["shirt_line", "shirt_sh", "shirt", "shirt_hi"],
    PANTS: ["pants_line", "pants_sh", "pants", "pants_hi"],
    SHOE: ["shoe_line", "shoe_sh", "shoe", "white"],
    SOLE: ["outline", "sole", "sole", "sole"],
    BAG: ["bag_line", "bag_sh", "bag", "bag_hi"],
    BOOK_R: ["bag_line", "book_red", "book_red", "book_red"],
    BOOK_B: ["bag_line", "book_blue", "book_blue", "book_blue"],
    PEN: ["book_blue", "book_blue", "book_blue", "book_blue"],
}

# Face pixels. Eyes have the outer corner on the LEFT and are mirrored for the
# other side; G = glasses frame.
STAMP = {"K": "outline", "D": "hair_sh", "M": "iris", "L": "iris_lt", "W": "white", "S": "shirt_hi",
         "B": "hair", "R": "mouth", "G": "glasses", "O": "skin_line"}
EYE = [".KKKKK.",
       "KKKKKKK",
       "SDWWDDS",
       "SDWWDDS",
       "SDDDMDS",
       ".DDMLD.",
       "..KLLK."]
EYE_NARROW = [".KKK.",
              "KKKKK",
              "DWWDS",
              "DWDDS",
              "DDMDS",
              ".DML.",
              ".KLK."]
EYE_CLOSED = [".......",
              ".......",
              ".......",
              "K.....K",
              ".KKKKK.",
              ".......",
              "......."]
RING = ["..GGGGG..",
        ".G.....G.",
        "G.......G",
        "G.......G",
        "G.......G",
        "G.......G",
        "G.......G",
        ".G.....G.",
        "..GGGGG.."]
RING_NARROW = [".GGG..",
               "G...G.",
               "G....G",
               "G....G",
               "G....G",
               "G....G",
               "G....G",
               "G...G.",
               ".GGG.."]
BROW = ["..BBB",
        "BB..."]
FACE = {"eye_r": (-4.6, -2.8), "eye_l": (4.6, -2.8), "brow_r": (-4.8, 2.6), "brow_l": (4.8, 2.6),
        "mouth": (0.0, -8.0), "mole": (6.4, 4.4)}


# ------------------------------------------------------------ SDF helpers ----
def length(v):
    return np.sqrt((v * v).sum(-1))


def sd_ellipsoid(p, c, r):
    r = np.asarray(r, float)
    q = (p - np.asarray(c, float)) / r
    k0 = length(q)
    k1 = length(q / r)
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-6)


def sd_capsule(p, a, b, r1, r2=None):
    a = np.asarray(a, float)
    b = np.asarray(b, float)
    r2 = r1 if r2 is None else r2
    pa, ba = p - a, b - a
    h = np.clip((pa @ ba) / (ba @ ba), 0.0, 1.0)
    return length(pa - h[:, None] * ba) - (r1 + (r2 - r1) * h)


def sd_box(p, c, half, rad=0.0):
    q = np.abs(p - np.asarray(c, float)) - (np.asarray(half, float) - rad)
    return length(np.maximum(q, 0.0)) + np.minimum(q.max(-1), 0.0) - rad


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b + (a - b) * h - k * h * (1.0 - h)


def tri(x):
    return np.abs((x % 1.0) - 0.5) * 2.0


def rot_y(v, deg):
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    out = v.copy()
    out[..., 0] = v[..., 0] * c + v[..., 2] * s
    out[..., 2] = -v[..., 0] * s + v[..., 2] * c
    return out


# ------------------------------------------------------------------ poses ----
def walk_pose(k):
    ph = 2 * math.pi * k / 6
    sL = math.cos(ph)                     # +1 = left leg forward
    return dict(bob=[0.0, -1.0, 1.0, 0.0, -1.0, 1.0][k],
                legs={+1: (sL, max(0.0, -math.sin(ph))), -1: (-sL, max(0.0, math.sin(ph)))},
                arms={-1: 24 * sL, +1: -24 * sL}, hair=math.sin(ph), blink=False)


def idle_pose():
    return dict(bob=0.0, legs={+1: (0.0, 0.0), -1: (0.0, 0.0)}, arms={-1: 3.0, +1: -3.0},
                hair=0.0, blink=False)


# ------------------------------------------------------------------ model ----
class Arya:
    """Slim young teacher, facing +z, feet on y = 0 (units ~ pixels)."""

    def __init__(self, pose):
        self.pose = pose
        b = self.b = pose["bob"]
        self.head_c = np.array([0.0, 50.0 + b, 0.5])
        self.legs = {}
        for sgn, (s, lift) in pose["legs"].items():
            za = 5.0 * s
            ankle = np.array([sgn * 3.0, 3.6 + 2.4 * lift, za])
            knee = np.array([sgn * 3.1, 10.6 + 0.5 * b + 1.4 * lift, 0.5 * za + 2.0 * lift])
            hip = np.array([sgn * 3.0, 19.5 + b, 0.0])
            self.legs[sgn] = (hip, knee, ankle, lift)
        self.arms = {}
        for sgn, ang in pose["arms"].items():
            a = math.radians(ang)
            sh = np.array([sgn * 8.0, 32.4 + b, -0.3])
            d1 = np.array([sgn * 0.22, -math.cos(a), math.sin(a)])
            d1 /= np.linalg.norm(d1)
            a2 = a + math.radians(14 if ang > 0 else 4)
            d2 = np.array([sgn * 0.08, -math.cos(a2), math.sin(a2)])
            d2 /= np.linalg.norm(d2)
            elbow = sh + d1 * 5.4
            wrist = elbow + d2 * 4.4
            self.arms[sgn] = (sh, elbow, wrist, wrist + d2 * 1.6)

    def head(self, p):
        c = self.head_c
        d = sd_ellipsoid(p, c, (10.6, 11.0, 9.8))
        d = smin(d, sd_ellipsoid(p, c + (0, -5.4, 1.8), (6.8, 5.6, 6.9)), 2.4)
        d = smin(d, sd_ellipsoid(p, c + (0, -2.8, 9.4), (0.9, 1.2, 1.0)), 0.8)       # nose
        return smin(d, sd_capsule(p, (0, 31.5 + self.b, 0), c + (0, -9.0, -0.6), 2.4), 1.0)

    def ears(self, p):
        c = self.head_c
        return np.minimum(sd_ellipsoid(p, c + (-10.1, -2.2, -1.0), (1.1, 1.8, 1.1)),
                          sd_ellipsoid(p, c + (10.1, -2.2, -1.0), (1.1, 1.8, 1.1)))

    def hair(self, p):
        c = self.head_c
        x, yl, z = p[:, 0] - c[0], p[:, 1] - c[1], p[:, 2] - c[2]
        cap = sd_ellipsoid(p, c + (0, 1.8, -0.8), (11.8, 12.0, 11.0))
        # messy, wavy clumps on the surface
        cap = cap - 0.45 * np.sin(2.3 * x + 0.7) * np.sin(2.1 * z + 1.9) * np.clip((yl + 2) / 8, 0, 1)
        # bangs swept toward his right, ending in points; short at the sides, ears free
        edge = 6.4 + 0.18 * x - 0.04 * x * x - 1.7 * tri((x + 1.6) / 2.9)
        back = 1.6 - 3.6 * np.clip((1.5 - yl) / 4.0, 0.0, 1.0)
        d = np.maximum(cap, -np.maximum(back - z, yl - edge))
        d = np.maximum(d, -(yl + 7.6 + 0.02 * x * x))                # nape line
        sway = 0.4 * self.pose["hair"]
        cowlick = sd_capsule(p, c + (1.2, 11.2, -3.0), c + (2.6 + sway, 15.0, -4.4), 1.6, 0.4)
        d = smin(d, cowlick, 0.8)
        # a few messy tufts sticking out of the silhouette
        for a, b_, r in (((-9.4, 8.4, 1.0), (-11.6, 9.2, 0.4), 1.5), ((9.8, 8.0, -1.6), (11.9, 7.4, -2.3), 1.4),
                         ((-6.0, 11.0, -6.0), (-7.4, 12.6, -8.2), 1.4), ((5.4, 9.4, -8.0), (6.8, 9.8, -10.4), 1.4),
                         ((0.0, 4.0, -10.6), (0.4, 1.6, -12.6), 1.6)):
            d = smin(d, sd_capsule(p, c + a, c + b_ + (sway, 0, 0), r, 0.4), 0.6)
        return d

    def torso(self, p):
        b = self.b
        d = sd_ellipsoid(p, (0, 26.4 + b, 0), (7.4, 7.6, 5.0))
        d = smin(d, sd_ellipsoid(p, (0, 31.8 + b, -0.3), (8.8, 2.9, 4.6)), 2.4)
        for sh, el, wr, ha in self.arms.values():
            d = smin(d, sd_capsule(p, sh, el, 2.6, 2.4), 0.8)
            d = np.minimum(d, sd_ellipsoid(p, el, (2.7, 1.3, 2.7)))      # rolled cuff
        return d

    def skin_limbs(self, p):
        d = np.full(len(p), 1e9)
        for sh, el, wr, ha in self.arms.values():
            d = np.minimum(d, sd_capsule(p, el, wr, 1.9, 1.7))
            d = np.minimum(d, sd_ellipsoid(p, ha, (2.4, 2.6, 2.4)))
        return d

    def pants(self, p):
        d = sd_ellipsoid(p, (0, 19.6 + self.b, 0), (7.0, 4.0, 5.0))
        for hip, knee, ankle, lift in self.legs.values():
            d = smin(d, sd_capsule(p, hip, knee, 3.5, 3.1), 1.2)
            d = np.minimum(d, sd_capsule(p, knee, ankle + (0, 1.0, 0), 3.1, 2.8))
        return d

    def shoes(self, p):
        d = np.full(len(p), 1e9)
        for hip, knee, ankle, lift in self.legs.values():
            base = 2.4 * lift
            f = sd_ellipsoid(p, (ankle[0], base + 2.0, ankle[2] + 1.3), (2.7, 2.2, 3.9))
            d = np.minimum(d, np.maximum(f, base - p[:, 1]))
        return d

    def bag(self, p):
        b = self.b
        bag = sd_box(p, (9.4, 19.0 + b, 0.8), (2.0, 3.6, 3.5), 1.0)
        red = sd_box(p, (9.6, 23.1 + b, 1.8), (1.1, 1.3, 1.0), 0.25)
        blue = sd_box(p, (9.4, 22.6 + b, -0.5), (1.1, 1.1, 1.1), 0.25)
        return bag, red, blue

    def sdf(self, p):
        bag, red, blue = self.bag(p)
        parts = [(self.head(p), SKIN), (self.ears(p), SKIN), (self.hair(p), HAIR),
                 (self.torso(p), SHIRT), (self.skin_limbs(p), SKIN), (self.pants(p), PANTS),
                 (self.shoes(p), SHOE), (bag, BAG), (red, BOOK_R), (blue, BOOK_B)]
        d = np.full(len(p), 1e9)
        m = np.zeros(len(p), np.int32)
        for di, mi in parts:
            sel = di < d
            d = np.where(sel, di, d)
            m = np.where(sel, mi, m)
        return d, m

    def dist(self, p):
        return self.sdf(p)[0]

    def decal(self, p, m):
        b = self.b
        x, y, z = p[:, 0], p[:, 1] - b, p[:, 2]
        m = m.copy()
        for hip, knee, ankle, lift in self.legs.values():
            m = np.where((m == SHOE) & (p[:, 1] < 2.4 * lift + 0.9), SOLE, m)
        # open collar: a small V of skin under the neck
        m = np.where((m == SHIRT) & (z > 2.0) & (y > 31.0 + 1.1 * np.abs(x)) & (np.abs(x) < 2.2), SKIN, m)
        # satchel strap from his right shoulder to his left hip, front and back
        a = np.array([-6.4, 33.2])
        bb = np.array([9.0, 21.0])
        ab = bb - a
        h = np.clip(((x - a[0]) * ab[0] + (y - a[1]) * ab[1]) / (ab @ ab), 0, 1)
        dist = np.hypot(x - (a[0] + ab[0] * h), y - (a[1] + ab[1] * h))
        m = np.where((m == SHIRT) & (dist < 1.0), BAG, m)
        # chest pocket with a pen, on his left
        pen = (m == SHIRT) & (z > 1.5) & (np.abs(x - 3.8) < 0.5) & (y > 26.6) & (y < 29.6)
        m = np.where(pen, PEN, m)
        return m


# ------------------------------------------------------------- rendering -----
def camera():
    e = ELEV
    return (np.array([1.0, 0.0, 0.0]), np.array([0.0, math.cos(e), -math.sin(e)]),
            np.array([0.0, -math.sin(e), -math.cos(e)]))


def project(pw):
    right, up, _ = camera()
    return PIVOT[0] + (pw @ right) * SCALE, PIVOT[1] - (pw @ up) * SCALE


def render(model, yaw):
    right, up, view = camera()
    W, H = FW * SS, FH * SS
    ys, xs = np.mgrid[0:H, 0:W]
    sx = ((xs + 0.5) / SS - PIVOT[0]) / SCALE
    sy = (PIVOT[1] - (ys + 0.5) / SS) / SCALE
    o = (sx[..., None] * right + sy[..., None] * up - 150.0 * view).reshape(-1, 3)
    o_m = rot_y(o, -yaw)
    d_m = rot_y(np.broadcast_to(view, o.shape).copy(), -yaw)
    n = len(o_m)
    t = np.full(n, 100.0)
    hit = np.zeros(n, bool)
    alive = np.ones(n, bool)
    for _ in range(150):
        idx = np.nonzero(alive)[0]
        if len(idx) == 0:
            break
        dd = model.dist(o_m[idx] + d_m[idx] * t[idx, None])
        done = dd < 0.03
        hit[idx[done]] = True
        t[idx] += np.where(done, 0.0, dd * 0.7)
        alive[idx[done]] = False
        alive[idx[t[idx] > 210.0]] = False
    idx = np.nonzero(hit)[0]
    p = o_m[idx] + d_m[idx] * t[idx, None]
    _, m = model.sdf(p)
    m = model.decal(p, m)
    nrm = np.zeros_like(p)
    for i in range(3):
        e = np.zeros(3)
        e[i] = 0.2
        nrm[:, i] = model.dist(p + e) - model.dist(p - e)
    nrm /= np.maximum(length(nrm)[:, None], 1e-6)
    inten = rot_y(nrm, yaw) @ LIGHT
    tn = np.where(inten > 0.62, 3, np.where(inten > -0.08, 2, 1))
    # face: flat skin, shadow only on the far side
    face = (m == SKIN) & (model.head(p) < 0.3) & (p[:, 1] > model.head_c[1] - 10.4)
    tn = np.where(face, np.where(inten > -0.35, 2, 1), tn)
    hairm = m == HAIR
    tn = np.where(hairm, np.where(inten > 0.82, 4, np.where(inten > 0.5, 3,
                  np.where(inten > -0.2, 2, 1))), tn)
    M = np.zeros(n, np.int32)
    M[idx] = m
    T = np.zeros(n, np.int32)
    T[idx] = tn
    D = np.full(n, 1e6)
    D[idx] = t[idx]
    P = np.zeros((n, 3))
    P[idx] = p
    return downsample(M.reshape(H, W), T.reshape(H, W), D.reshape(H, W), P.reshape(H, W, 3))


def downsample(M, T, D, P):
    def blocks(a):
        return a.reshape(FH, SS, FW, SS, *a.shape[2:]).swapaxes(1, 2).reshape(FH, FW, SS * SS, *a.shape[2:])
    mb, tb, db, pb = blocks(M), blocks(T), blocks(D), blocks(P)
    cnt = np.stack([(mb == i).sum(-1) for i in range(int(M.max()) + 1)], -1)
    cnt[..., 0] = np.where(cnt[..., 0] > SS * SS // 2, 99, 0)
    mat = cnt.argmax(-1)
    same = mb == mat[..., None]
    tone = np.stack([((tb == i) & same).sum(-1) for i in range(5)], -1).argmax(-1)
    depth = np.where(same, db, 1e6).min(-1)
    w = same[..., None]
    pos = (pb * w).sum(2) / np.maximum(w.sum(2), 1)
    return dict(mat=mat, tone=tone, depth=depth, pos=pos)


def colorize(r):
    mat, tone, depth = r["mat"], r["tone"].copy(), r["depth"]
    # lonely pixels take the majority tone around them
    nbt = np.stack([np.roll(tone, s, a) for s, a in ((1, 0), (-1, 0), (1, 1), (-1, 1))])
    same = np.stack([np.roll(mat, s, a) == mat for s, a in ((1, 0), (-1, 0), (1, 1), (-1, 1))])
    lonely = np.all((nbt != tone) | ~same, axis=0) & (mat > 0)
    for cand in range(1, 5):
        c = np.sum((nbt == cand) & same, axis=0)
        tone = np.where(lonely & (c >= 3), cand, tone)
    img = np.zeros((FH, FW, 4), np.uint8)
    for mi, ramp in RAMP.items():
        for ti in range(1, 5):
            sel = (mat == mi) & (tone == ti)
            img[sel, :3] = RGB[ramp[min(ti, len(ramp) - 1)]]
            img[sel, 3] = 255
    line = np.zeros((FH, FW), bool)
    for s, a in ((1, 0), (-1, 0), (1, 1), (-1, 1)):
        nm = np.roll(mat, s, a)
        line |= (mat > 0) & (nm > 0) & (nm != mat) & (np.roll(depth, s, a) - depth > 2.5)
    for mi, ramp in RAMP.items():
        img[line & (mat == mi), :3] = RGB[ramp[0]]
    return img


def face_point(model, ox, oy):
    c = model.head_c
    p = np.array([[c[0] + ox, c[1] + oy, c[2] + 30.0]])
    t = 0.0
    for _ in range(100):
        d = model.head(p + (0, 0, -t))[0]
        if d < 0.005:
            break
        t += d * 0.8
    q = p + (0, 0, -t)
    n = np.array([model.head(q + e)[0] - model.head(q - e)[0] for e in np.eye(3) * 0.2])
    return q[0], n / np.linalg.norm(n)


def paint_face(img, r, model, yaw):
    mat, pos = r["mat"], r["pos"]
    to_cam = -camera()[2]

    def anchor(key):
        a, n = face_point(model, *FACE[key])
        return a, rot_y(n[None, :], yaw)[0] @ to_cam

    def put(pattern, key, outer=None, on=(SKIN,), max_dist=6.0):
        a, _ = anchor(key)
        fx, fy = project(rot_y(a[None, :], yaw)[0])
        flip = False
        if outer is not None:
            flip = project(rot_y((a + (outer, 0, 0))[None, :], yaw)[0])[0] > fx
        h, w = len(pattern), len(pattern[0])
        ox, oy = int(math.floor(fx - (w - 1) / 2)), int(math.floor(fy - (h - 1) / 2))
        for j, row in enumerate(pattern):
            row = row[::-1] if flip else row
            for i, ch in enumerate(row):
                X, Y = ox + i, oy + j
                if ch == "." or not (0 <= X < FW and 0 <= Y < FH):
                    continue
                if mat[Y, X] not in on or np.linalg.norm(pos[Y, X] - a) > max_dist:
                    continue
                img[Y, X, :3] = RGB[STAMP[ch]]

    for side, sgn in (("r", -1), ("l", +1)):
        _, f = anchor("eye_" + side)
        if f > 0.6:
            put(RING, "eye_" + side, outer=sgn, on=(SKIN, HAIR), max_dist=7.5)
            put(EYE_CLOSED if model.pose["blink"] else EYE, "eye_" + side, outer=sgn)
            put(BROW, "brow_" + side, outer=sgn)
        elif f > 0.2:
            put(RING_NARROW, "eye_" + side, outer=sgn, on=(SKIN, HAIR), max_dist=7.5)
            put(EYE_NARROW, "eye_" + side, outer=sgn)
            put(["BB."], "brow_" + side, outer=sgn)
    _, fm = anchor("mouth")
    if fm > 0.55:
        put(["R...R", ".RRR."], "mouth")
    elif fm > 0.0:
        put(["RR"], "mouth")
    _, fo = anchor("mole")
    if fo > 0.4:
        put(["O"], "mole", max_dist=3.0)


def outline(img):
    a = img[..., 3] > 0
    nb = np.zeros_like(a)
    for s, ax in ((1, 0), (-1, 0), (1, 1), (-1, 1)):
        nb |= np.roll(a, s, ax)
    edge = nb & ~a
    img[edge, :3] = RGB["outline"]
    img[edge, 3] = 255
    return img


def frame(pose, yaw):
    model = Arya(pose)
    r = render(model, yaw)
    img = colorize(r)
    paint_face(img, r, model, yaw)
    return outline(img)


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "assets/sprites/arya/90"
    os.makedirs(out, exist_ok=True)
    walk = np.concatenate([np.concatenate([frame(walk_pose(k), YAW[d]) for k in range(6)], 1)
                           for d in DIRS], 0)
    idle = np.concatenate([frame(idle_pose(), YAW[d]) for d in DIRS], 0)
    Image.fromarray(walk).save(os.path.join(out, "arya_sprite_8dir.png"), optimize=True)
    Image.fromarray(idle).save(os.path.join(out, "arya_idle_8dir.png"), optimize=True)
    Image.fromarray(idle[FH:2 * FH]).save(os.path.join(out, "arya_anchor.png"), optimize=True)
    px = np.concatenate([walk.reshape(-1, 4), idle.reshape(-1, 4)])
    colors = {tuple(c[:3]) for c in px[px[:, 3] > 0]}
    ys = np.nonzero((idle[FH:2 * FH, :, 3] > 0).any(1))[0]
    meta = {
        "character": "Arya Prasetya", "frame": {"w": FW, "h": FH}, "pivot": {"x": PIVOT[0], "y": PIVOT[1]},
        "height_px": int(ys.max() - ys.min() + 1), "rows": DIRS,
        "animations": {
            "walk": {"file": "arya_sprite_8dir.png", "frames": 6, "fps": 9, "loop": True,
                     "phases": ["contact A", "down A", "passing A", "contact B", "down B", "passing B"]},
            "idle": {"file": "arya_idle_8dir.png", "frames": 1, "layout": "1 column x 8 rows (same row order)"},
        },
        "palette_size": len(colors), "source": "tools/arya_sprite.py (procedural, no AI reference yet)",
    }
    with open(os.path.join(out, "arya_sprite.json"), "w") as fh:
        json.dump(meta, fh, indent=2)
    print(f"Arya: {meta['height_px']} px tall, {len(colors)} colours -> {out}")


if __name__ == "__main__":
    main()
