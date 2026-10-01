#!/usr/bin/env python3
"""Indah Wulandari (Desa Rimbasari) - chibi isometric sprite generator.

Builds Indah as a small signed-distance-field model, renders it with an
orthographic isometric camera and toon shading, then post-processes the result
into pixel art that follows the Character Bible (Desain Karakter + Prompt Sprite):

  * 96 x 128 px frames, pivot 48,116, character about 93 px tall (43 units)
  * 8 directions, row order SE, S, SW, W, NW, N, NE, E
  * walk: 6 frames (contact A, down A, passing A, contact B, down B, passing B)
  * idle: 4 frames (rest, inhale, rest, blink)
  * 1 px outer outline #1B1410, top-left light, no anti-aliasing, <= 24 colors

Usage:  python3 tools/indah_sprite.py [out_dir]
"""
import json
import math
import os
import sys

import numpy as np
from PIL import Image

FW, FH = 96, 128
PIVOT = (48, 116)
ELEV = math.radians(24)          # camera elevation of the isometric view
SCALE = 1.07                     # model units -> screen pixels

DIRS = ["SE", "S", "SW", "W", "NW", "N", "NE", "E"]
# facing yaw relative to the camera: 0 = toward the viewer, +90 = screen right
YAW = {"S": 0, "SE": 45, "E": 90, "NE": 135, "N": 180, "NW": -135, "W": -90, "SW": -45}

# ---------------------------------------------------------------- palette ----
HEX = {
    "outline": "#1B1410",
    "skin_line": "#7E4E30", "skin_sh": "#A9744A", "skin": "#D29A66", "skin_hi": "#E8B98A",
    "blush": "#E0907C", "lips": "#B9645A",
    "hair_sh": "#14121A", "hair": "#1E1A22", "hair_hi": "#3A3446", "hair_shine": "#554C66",
    "blouse": "#F4EFE6", "blouse_sh": "#D2C8B6",
    "skirt_hi": "#EADCC0", "skirt": "#D9C8A6", "skirt_sh": "#B8A47E", "skirt_line": "#8E7A58",
    "leather_line": "#5A341C", "leather_sh": "#7A4A2A", "leather": "#A87444", "leather_hi": "#C8925A",
    "jasmine": "#8FBF8A",
    "iris": "#6B4434", "white": "#FFFFFF",
}
RGB = {k: tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) for k, v in HEX.items()}

NONE, SKIN, HAIR, BLOUSE, SKIRT, LEATHER, JASMINE = 0, 1, 2, 3, 4, 5, 6
# tone ramps per material: [line, shadow, base, light, (shine)]
RAMP = {
    SKIN: ["skin_line", "skin_sh", "skin", "skin_hi"],
    HAIR: ["outline", "hair_sh", "hair", "hair_hi", "hair_shine"],
    BLOUSE: ["skirt_sh", "blouse_sh", "blouse", "blouse"],
    SKIRT: ["skirt_line", "skirt_sh", "skirt", "skirt_hi"],
    LEATHER: ["leather_line", "leather_sh", "leather", "leather_hi"],
    JASMINE: ["jasmine", "jasmine", "jasmine", "jasmine"],
}

# ------------------------------------------------------------ face stamps ----
# Hand-placed pixel patterns. Outer corner of the eye is on the LEFT; they are
# mirrored for the other side. "." = keep the rendered skin.
STAMP_COL = {"K": "outline", "I": "iris", "W": "white", "B": "hair_hi",
             "L": "lips", "P": "blush", "D": "skin_sh"}
EYE_FULL = ["K....",
            "KKKKK",
            ".KWKK",
            ".KKKK",
            ".KIIK",
            "..II."]
EYE_NARROW = ["K...",
              "KKKK",
              ".KWK",
              ".KKK",
              ".KIK",
              "..I."]
EYE_CLOSED = [".....",
              ".....",
              ".....",
              "K....",
              ".KKKK",
              "....."]
EYE_CLOSED_NARROW = ["....",
                     "....",
                     "....",
                     "K...",
                     ".KKK",
                     "...."]
BROW = [".BBB",
        "B..."]
BROW_NARROW = [".BB",
               "B.."]
# head-local anchors (x, y) on the face; +x is her left
FACE = {
    "eye_r": (-5.0, -1.6), "eye_l": (5.0, -1.6),
    "brow_r": (-5.2, 3.0), "brow_l": (5.2, 3.0),
    "blush_r": (-7.6, -4.8), "blush_l": (7.6, -4.8),
    "mouth": (0.2, -7.0), "dimple": (3.6, -6.6),
}
# small jasmine flowers on the blouse (x, y, side): +1 front, -1 back
JASMINE_SPOTS = [(-4.6, 47.0, 1), (4.4, 45.4, -1)]

# light comes from the screen top-left, slightly toward the viewer
LIGHT = np.array([-0.55, 0.72, 0.42])
LIGHT /= np.linalg.norm(LIGHT)


# ------------------------------------------------------------ SDF helpers ----
def length(v):
    return np.sqrt((v * v).sum(-1))


def sd_ellipsoid(p, c, r):
    q = (p - np.asarray(c, float)) / np.asarray(r, float)
    k0 = length(q)
    k1 = length(q / np.asarray(r, float))
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-6)


def sd_capsule(p, a, b, r1, r2=None):
    """Capsule from a to b, radius tapering linearly from r1 to r2."""
    a = np.asarray(a, float)
    b = np.asarray(b, float)
    r2 = r1 if r2 is None else r2
    pa = p - a
    ba = b - a
    h = np.clip((pa @ ba) / (ba @ ba), 0.0, 1.0)
    return length(pa - h[:, None] * ba) - (r1 + (r2 - r1) * h)


def sd_box(p, c, half, rad=0.0):
    q = np.abs(p - np.asarray(c, float)) - (np.asarray(half, float) - rad)
    return length(np.maximum(q, 0.0)) + np.minimum(q.max(-1), 0.0) - rad


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b + (a - b) * h - k * h * (1.0 - h)


def tri(x):
    """Triangle wave in [0, 1] with period 1 (0 at integers)."""
    return np.abs((x % 1.0) - 0.5) * 2.0


# ------------------------------------------------------------------ pose -----
def walk_pose(k):
    """Pose for walk frame k (0..5) following the Prompt Sprite phase table."""
    ph = 2 * math.pi * k / 6
    sL = math.cos(ph)                      # +1 = left leg forward (frame 1)
    liftL = max(0.0, -math.sin(ph))        # left foot lifts while swinging (frames 5-6)
    liftR = max(0.0, math.sin(ph))         # right foot lifts in frames 2-3
    bob = [0.0, -1.0, 1.0, 0.0, -1.0, 1.0][k]
    return dict(
        bob=bob,
        legs={+1: (sL, liftL), -1: (-sL, liftR)},
        arms={-1: 28 * sL, +1: -28 * sL},   # right arm forward with the left leg
        hair_x=0.9 * math.sin(ph), hair_z=-1.2,
        skirt_x=-0.6 * math.sin(ph), blink=False,
    )


def idle_pose(k):
    bob = [0.0, 0.5, 0.0, 0.0][k]
    return dict(
        bob=bob, legs={+1: (0.0, 0.0), -1: (0.0, 0.0)},
        arms={-1: 3.0, +1: -2.0}, hair_x=0.0, hair_z=0.0, skirt_x=0.0,
        blink=(k == 3),
    )


# ------------------------------------------------------------------ model ----
class Indah:
    """Signed distance model of chibi Indah, facing +z, feet on y = 0."""

    def __init__(self, pose):
        self.pose = pose
        b = pose["bob"]
        self.b = b
        self.head_c = np.array([0.0, 75.0 + b, 0.6])
        # limbs
        self.legs = {}
        for sgn, (s, lift) in pose["legs"].items():
            za = 7.0 * s
            ankle = np.array([sgn * 3.3, 3.0 + 3.0 * lift, za])
            knee = np.array([sgn * 3.5, 17.0 + 0.5 * b + 1.6 * lift, 0.55 * za + 2.4 * lift])
            hip = np.array([sgn * 3.4, 33.0 + b, 0.0])
            self.legs[sgn] = (hip, knee, ankle, lift)
        self.arms = {}
        for sgn, ang in pose["arms"].items():
            a = math.radians(ang)
            sh = np.array([sgn * 8.2, 52.6 + b, -0.4])
            d1 = np.array([sgn * 0.2, -math.cos(a), math.sin(a)])
            d1 /= np.linalg.norm(d1)
            a2 = a + math.radians(12 if ang > 0 else 4)
            d2 = np.array([sgn * 0.12, -math.cos(a2), math.sin(a2)])
            d2 /= np.linalg.norm(d2)
            elbow = sh + d1 * 7.4
            mid = elbow + d2 * 2.6
            wrist = elbow + d2 * 6.2
            hand = wrist + d2 * 1.7
            self.arms[sgn] = (sh, elbow, mid, wrist, hand)

    # --- parts -------------------------------------------------------------
    def head(self, p):
        c = self.head_c
        d = sd_ellipsoid(p, c, (12.6, 12.2, 11.8))
        jaw = sd_ellipsoid(p, c + (0, -6.4, 2.0), (8.6, 6.4, 8.6))
        d = smin(d, jaw, 3.0)
        nose = sd_ellipsoid(p, c + (0, -3.4, 11.3), (0.9, 1.3, 1.1))
        d = smin(d, nose, 0.8)
        neck = sd_capsule(p, (0, 52.0 + self.b, 0.0), (0, 63.0 + self.b, 0.4), 2.7)
        return smin(d, neck, 1.5)

    def hair(self, p):
        c = self.head_c
        x, y, z = p[:, 0], p[:, 1] - c[1], p[:, 2] - c[2]   # head-local
        cap = sd_ellipsoid(p, c + (0, 1.6, -1.0), (13.9, 13.6, 13.3))
        # face opening; its top edge is the side-swept bangs line
        edge = 5.8 + 0.11 * x - 0.035 * x * x - 1.7 * tri((x + 1.6) / 4.3)
        back_edge = 1.0 - 3.5 * np.clip((1.0 - y) / 7.0, 0.0, 1.0)   # cheeks open further back
        opening = np.maximum(back_edge - z, y - edge)
        d = np.maximum(cap, -opening)
        # long back mass, waist length, wavy edges and pointed tips
        hx, hz = self.pose["hair_x"], self.pose["hair_z"]
        yy = p[:, 1] - self.b
        t = np.clip((78.0 - yy) / 40.0, 0.0, 1.0)            # 0 at head, 1 at tips
        cx = hx * t * t
        cz = -1.6 - 6.8 * np.clip((76.0 - yy) / 18.0, 0.0, 1.0) + hz * t
        w = 13.4 - 2.0 * np.sin(np.clip((76.0 - yy) / 16.0, 0, 1) * math.pi) * 0.6 \
            + 0.8 * np.sin(yy * 0.5 + np.sign(p[:, 0]) * 1.3) * t
        dz = 6.4 - 3.2 * t
        xr = (p[:, 0] - cx) / w
        zr = (p[:, 2] - cz + 0.55 * np.sin(p[:, 0] * 0.95) * t) / dz
        d_xz = (np.sqrt(xr * xr + zr * zr) - 1.0) * np.minimum(w, dz) * 0.9
        tips = 36.8 + 0.035 * (p[:, 0] - cx) ** 2 + 2.0 * tri((p[:, 0] - cx) / 4.6 + 0.5)
        back = np.maximum(d_xz, np.maximum(tips - yy, yy - 82.0))
        back = np.maximum(back, (p[:, 2] - (c[2] - 2.0)))   # stays behind the face
        d = smin(d, back, 2.0)
        # front lock on her right side, falling over the shoulder to the chest
        lw = 0.7 * np.sin(p[:, 1] * 0.55)
        q = p.copy()
        q[:, 0] = q[:, 0] - lw
        lock = smin(
            sd_capsule(q, c + (-11.8, 1.0, 2.2), c + (-12.6, -10.5, 3.4), 3.1, 2.6),
            sd_capsule(q, c + (-12.6, -10.5, 3.4), c + (-10.6, -24.0, 5.4), 2.6, 0.6), 1.5)
        d = smin(d, lock, 1.2)
        # her left side is tucked behind the ear
        tuck = sd_capsule(p, c + (11.8, 2.0, 1.0), c + (12.2, -7.0, -1.5), 2.6, 1.8)
        return smin(d, tuck, 1.5)

    def clip(self, p):
        c = self.head_c
        q = p - (c + (6.6, 6.9, 9.5))
        a = math.radians(-28)
        qx = q[:, 0] * math.cos(a) - q[:, 1] * math.sin(a)
        qy = q[:, 0] * math.sin(a) + q[:, 1] * math.cos(a)
        q = np.stack([qx, qy, q[:, 2]], 1)
        return sd_box(q, (0, 0, 0), (2.2, 0.95, 0.65), 0.4)

    def torso(self, p):
        b = self.b
        d = sd_ellipsoid(p, (0, 46.6 + b, 0), (7.8, 9.0, 5.4))
        sh = sd_ellipsoid(p, (0, 52.2 + b, -0.3), (9.2, 3.6, 4.8))
        d = smin(d, sh, 3.0)
        for sgn, (s, e, m, w, h) in self.arms.items():
            d = smin(d, sd_capsule(p, s, e, 3.0, 2.5), 1.0)
            d = np.minimum(d, sd_capsule(p, e, m, 2.4, 2.3))
        return d

    def arms_skin(self, p):
        d = np.full(len(p), 1e9)
        for sgn, (s, e, m, w, h) in self.arms.items():
            d = np.minimum(d, sd_capsule(p, m, w, 1.9, 1.8))
            d = np.minimum(d, sd_ellipsoid(p, h, (2.0, 2.4, 2.1)))
        return d

    def skirt(self, p):
        b = self.b
        top, hem = 40.0 + b, 12.2 + 0.5 * b
        y = p[:, 1]
        t = np.clip((top - y) / (top - hem), 0.0, 1.0)
        sx = self.pose["skirt_x"] * t
        rx = 8.0 + 4.6 * t
        rz = 6.0 + 3.6 * t
        xr = (p[:, 0] - sx) / rx
        zr = (p[:, 2] + 0.4 * t) / rz
        ang = np.arctan2(p[:, 2], p[:, 0])
        d = (np.sqrt(xr * xr + zr * zr) - 1.0) * np.minimum(rx, rz)
        d = d - 0.45 * t * t * np.sin(7.0 * ang + 0.6)
        for sgn, (hip, knee, ankle, lift) in self.legs.items():
            d = smin(d, sd_capsule(p, hip, knee, 4.4, 3.9), 3.0)
        hemline = hem + 0.6 * np.sin(3 * ang + 1.0)
        return np.maximum(d, np.maximum(y - top, hemline - y))

    def legs_skin(self, p):
        d = np.full(len(p), 1e9)
        for sgn, (hip, knee, ankle, lift) in self.legs.items():
            d = np.minimum(d, sd_capsule(p, knee, ankle, 2.4, 1.9))
        return d

    def feet(self, p):
        d = np.full(len(p), 1e9)
        for sgn, (hip, knee, ankle, lift) in self.legs.items():
            base = 3.0 * lift
            f = sd_ellipsoid(p, (ankle[0], base + 1.6, ankle[2] + 1.3), (2.3, 1.9, 3.4))
            d = np.minimum(d, np.maximum(f, base - p[:, 1]))
        return d

    def pendant(self, p):
        return sd_ellipsoid(p, (0, 53.0 + self.b, 4.5), (1.1, 1.4, 0.8))

    def face_point(self, ox, oy):
        """Surface point and normal of the face at head-local (ox, oy)."""
        c = self.head_c
        p = np.array([[c[0] + ox, c[1] + oy, c[2] + 30.0]])
        t = 0.0
        for _ in range(100):
            d = self.head(p + (0, 0, -t))[0]
            if d < 0.005:
                break
            t += d * 0.8
        q = p + (0, 0, -t)
        n = np.array([self.head(q + e)[0] - self.head(q - e)[0] for e in np.eye(3) * 0.2])
        return q[0], n / np.linalg.norm(n)

    # --- scene -------------------------------------------------------------
    def sdf(self, p):
        parts = [
            (self.head(p), SKIN),
            (self.hair(p), HAIR),
            (self.torso(p), BLOUSE),
            (self.arms_skin(p), SKIN),
            (self.skirt(p), SKIRT),
            (self.legs_skin(p), SKIN),
            (self.feet(p), SKIN),
            (self.clip(p), LEATHER),
            (self.pendant(p), LEATHER),
        ]
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
        """Surface details that are colour, not geometry."""
        m = m.copy()
        b = self.b
        x, y, z = p[:, 0], p[:, 1], p[:, 2]
        # sandals: sole and a strap over the foot
        for sgn, (hip, knee, ankle, lift) in self.legs.items():
            near = (np.abs(x - ankle[0]) < 3.2) & (y < 3.0 * lift + 4.0)
            sole = near & (y < 3.0 * lift + 1.1)
            strap = near & (np.abs(z - (ankle[2] + 2.0)) < 1.0)
            m = np.where((m == SKIN) & (sole | strap), LEATHER, m)
        # rounded neckline of the blouse
        neck = (m == BLOUSE) & (z > 1.0) & (y > 52.4 + b + 0.16 * x * x) & (np.abs(x) < 5.0)
        m = np.where(neck, SKIN, m)
        blouse = m == BLOUSE
        for jx, jy, side in JASMINE_SPOTS:
            spot = blouse & (np.hypot(x - jx, y - (jy + b)) < 1.25) & (z * side > 1.0)
            m = np.where(spot, JASMINE, m)
        stitch = tri(x / 3.0) > 0.35
        # embroidered trim just under the neckline
        curve = 52.4 + b + 0.16 * x * x
        trim = blouse & (z > 1.0) & (y > curve - 1.6) & (y <= curve + 0.01) & (np.abs(x) < 6.0)
        # trim along the blouse hem where it is tucked into the skirt
        hem = blouse & (y < 41.6 + b) & stitch
        m = np.where(trim | hem, JASMINE, m)
        # sleeve hems
        for sgn, (s, e, md, w, h) in self.arms.items():
            ba = md - e
            hh = ((p - e) @ ba) / (ba @ ba)
            cuff = (m == BLOUSE) & (hh > 0.45) & (hh < 1.3) & (np.linalg.norm(p - e, axis=1) < 4.5)
            m = np.where(cuff, JASMINE, m)
        return m


# ------------------------------------------------------------- rendering -----
def rot_y(v, deg):
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    x, z = v[..., 0], v[..., 2]
    out = v.copy()
    out[..., 0] = x * c + z * s
    out[..., 2] = -x * s + z * c
    return out


def camera():
    e = ELEV
    right = np.array([1.0, 0.0, 0.0])
    up = np.array([0.0, math.cos(e), -math.sin(e)])
    view = np.array([0.0, -math.sin(e), -math.cos(e)])
    return right, up, view


def project(pw):
    """World point(s) -> continuous screen pixel coordinates (x right, y down)."""
    right, up, _ = camera()
    sx = pw @ right * SCALE
    sy = pw @ up * SCALE
    return PIVOT[0] + sx, PIVOT[1] - sy


def render(model, yaw):
    right, up, view = camera()
    ys, xs = np.mgrid[0:FH, 0:FW]
    sx = (xs + 0.5 - PIVOT[0]) / SCALE
    sy = (PIVOT[1] - (ys + 0.5)) / SCALE
    o = sx[..., None] * right + sy[..., None] * up - 160.0 * view
    o = o.reshape(-1, 3)
    dvec = np.broadcast_to(view, o.shape).copy()
    # into model space
    o_m = rot_y(o, -yaw)
    d_m = rot_y(dvec, -yaw)
    n = len(o_m)
    t = np.full(n, 110.0)
    hit = np.zeros(n, bool)
    alive = np.ones(n, bool)
    for _ in range(140):
        idx = np.nonzero(alive)[0]
        if len(idx) == 0:
            break
        p = o_m[idx] + d_m[idx] * t[idx, None]
        dd = model.dist(p)
        done = dd < 0.03
        hit[idx[done]] = True
        t[idx] += np.where(done, 0.0, dd * 0.7)
        alive[idx[done]] = False
        alive[idx[t[idx] > 230.0]] = False
    mat = np.zeros(n, np.int32)
    tone = np.zeros(n, np.int32)
    pos = np.zeros((n, 3))
    idx = np.nonzero(hit)[0]
    p = o_m[idx] + d_m[idx] * t[idx, None]
    pos[idx] = p
    _, m = model.sdf(p)
    m = model.decal(p, m)
    mat[idx] = m
    # normals (model space -> world space)
    eps = 0.25
    nrm = np.zeros_like(p)
    for i in range(3):
        e = np.zeros(3)
        e[i] = eps
        nrm[:, i] = model.dist(p + e) - model.dist(p - e)
    nrm /= np.maximum(length(nrm)[:, None], 1e-6)
    nw = rot_y(nrm, yaw)
    inten = nw @ LIGHT
    # cast shadows (model space light)
    lm = rot_y(LIGHT[None, :], -yaw)[0]
    sp = p + nrm * 0.6
    st = np.full(len(sp), 0.8)
    shadow = np.zeros(len(sp), bool)
    salive = np.ones(len(sp), bool)
    for _ in range(40):
        si = np.nonzero(salive)[0]
        if len(si) == 0:
            break
        q = sp[si] + lm * st[si, None]
        dd = model.dist(q)
        blk = dd < 0.05
        shadow[si[blk]] = True
        salive[si[blk]] = False
        st[si] += np.maximum(dd * 0.8, 0.3)
        salive[si[st[si] > 18.0]] = False
    # toon tones: 1 shadow, 2 base, 3 light, 4 shine (hair)
    tn = np.where(inten > 0.62, 3, np.where(inten > -0.05, 2, 1))
    is_hair = m == HAIR
    hair_tn = np.where(inten > -0.2, 2, 1)
    hc = model.head_c
    yl = p[:, 1] - hc[1]
    on_cap = (yl > -1.0) & (np.abs(p[:, 0]) < 14.5)
    band = on_cap & (np.abs(yl - 7.4 + 0.012 * p[:, 0] ** 2) < 1.15) & (p[:, 2] > hc[2] - 6.0)
    hair_tn = np.where(band & (inten > 0.0), 3, hair_tn)
    hair_tn = np.where(band & (inten > 0.55), 4, hair_tn)
    # strand highlights on the long hair and the front lock
    hair_tn = np.where(~on_cap & (inten > 0.66), 3, hair_tn)
    tn = np.where(is_hair, hair_tn, tn)
    tn = np.where(shadow & (m == SKIN), np.minimum(tn, 1), tn)
    tn = np.where(shadow & is_hair, np.minimum(tn, 2), tn)
    tone[idx] = tn
    depth = np.full(n, 1e6)
    depth[idx] = t[idx]
    return dict(
        mat=mat.reshape(FH, FW), tone=tone.reshape(FH, FW),
        depth=depth.reshape(FH, FW), pos=pos.reshape(FH, FW, 3),
    )


def cleanup(mat, tone):
    """Replace lonely single pixels by the majority tone around them."""
    tone = tone.copy()
    for _ in range(2):
        nb = [np.roll(tone, s, a) for s, a in ((1, 0), (-1, 0), (1, 1), (-1, 1))]
        nm = [np.roll(mat, s, a) for s, a in ((1, 0), (-1, 0), (1, 1), (-1, 1))]
        same_mat = np.stack([x == mat for x in nm])
        nbt = np.stack(nb)
        differs = np.all((nbt != tone) | ~same_mat, axis=0) & (mat > 0)
        # majority among same-material neighbours
        best = tone.copy()
        best_n = np.zeros_like(tone)
        for cand in range(1, 5):
            cnt = np.sum((nbt == cand) & same_mat, axis=0)
            upd = cnt > best_n
            best = np.where(upd, cand, best)
            best_n = np.where(upd, cnt, best_n)
        tone = np.where(differs & (best_n >= 2), best, tone)
    return tone


def colorize(r):
    mat, depth = r["mat"], r["depth"]
    tone = cleanup(mat, r["tone"])
    img = np.zeros((FH, FW, 4), np.uint8)
    for mi, ramp in RAMP.items():
        for ti in range(1, len(ramp)):
            sel = (mat == mi) & (tone == ti)
            img[sel, :3] = RGB[ramp[ti]]
            img[sel, 3] = 255
        if len(ramp) == 4:   # materials without shine use the light tone
            sel = (mat == mi) & (tone == 4)
            img[sel, :3] = RGB[ramp[3]]
            img[sel, 3] = 255
    # inner lines: front edges over a much deeper neighbour
    line = np.zeros((FH, FW), bool)
    for s, a in ((1, 0), (-1, 0), (1, 1), (-1, 1)):
        nd = np.roll(depth, s, a)
        nmat = np.roll(mat, s, a)
        line |= (mat > 0) & (nmat > 0) & (nd - depth > 3.0)
    # bottom edges of the blouse and sleeves over skirt / skin
    below = np.roll(mat, -1, 0)
    line |= (mat == BLOUSE) & ((below == SKIRT) | (below == SKIN)) & (np.roll(depth, -1, 0) - depth > -0.5)
    for mi, ramp in RAMP.items():
        sel = line & (mat == mi)
        img[sel, :3] = RGB[ramp[0]]
    return img, tone


def paint_face(img, r, model, yaw, blink):
    mat, pos = r["mat"], r["pos"]
    _, _, view = camera()
    to_cam = -view

    def put(pattern, key, max_dist=4.5, outer=None):
        anchor, n = model.face_point(*FACE[key])
        aw = rot_y(anchor[None, :], yaw)[0]
        f = rot_y(n[None, :], yaw)[0] @ to_cam
        fx, fy = project(aw)
        flip = False
        if outer is not None:   # mirror so the outer corner points outward
            ow = rot_y((anchor + (outer, 0, 0))[None, :], yaw)[0]
            flip = project(ow)[0] > fx
        h, w = len(pattern), len(pattern[0])
        ox = int(round(fx - 0.5 - (w - 1) / 2))
        oy = int(round(fy - 0.5 - (h - 1) / 2))
        for j, row in enumerate(pattern):
            row = row[::-1] if flip else row
            for i, ch in enumerate(row):
                X, Y = ox + i, oy + j
                if ch == "." or not (0 <= X < FW and 0 <= Y < FH):
                    continue
                if mat[Y, X] != SKIN or np.linalg.norm(pos[Y, X] - anchor) > max_dist:
                    continue
                img[Y, X, :3] = RGB[STAMP_COL[ch]]
        return f

    def facing(key):
        anchor, n = model.face_point(*FACE[key])
        return rot_y(n[None, :], yaw)[0] @ to_cam

    for side, sgn in (("r", -1), ("l", +1)):
        f = facing("eye_" + side)
        if f > 0.6:
            put(EYE_CLOSED if blink else EYE_FULL, "eye_" + side, outer=sgn)
            put(BROW, "brow_" + side, outer=sgn)
        elif f > 0.18:
            put(EYE_CLOSED_NARROW if blink else EYE_NARROW, "eye_" + side, outer=sgn)
            put(BROW_NARROW, "brow_" + side, outer=sgn)
        if facing("blush_" + side) > 0.25:
            put(["PP"], "blush_" + side)
    fm = facing("mouth")
    if fm > 0.55:
        put(["LL"], "mouth")
    elif fm > -0.1:
        put(["L"], "mouth")
    if facing("dimple") > 0.5:
        put(["D"], "dimple", max_dist=3.0)


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
    model = Indah(pose)
    r = render(model, yaw)
    img, tone = colorize(r)
    paint_face(img, r, model, yaw, pose["blink"])
    return outline(img), r


def sheet(pose_fn, n_frames):
    rows = []
    for d in DIRS:
        rows.append(np.concatenate([frame(pose_fn(k), YAW[d])[0] for k in range(n_frames)], 1))
    return np.concatenate(rows, 0)


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "assets/sprites/indah"
    os.makedirs(out, exist_ok=True)
    walk = sheet(walk_pose, 6)
    idle = sheet(idle_pose, 4)
    Image.fromarray(walk).save(os.path.join(out, "indah_sprite_8dir.png"), optimize=True)
    Image.fromarray(idle).save(os.path.join(out, "indah_idle_8dir.png"), optimize=True)
    anchor = frame(idle_pose(0), YAW["S"])[0]
    Image.fromarray(anchor).save(os.path.join(out, "indah_anchor.png"), optimize=True)
    px = np.concatenate([walk.reshape(-1, 4), idle.reshape(-1, 4)])
    colors = {tuple(c[:3]) for c in px[px[:, 3] > 0]}
    meta = {
        "character": "Indah Wulandari",
        "frame": {"w": FW, "h": FH}, "pivot": {"x": PIVOT[0], "y": PIVOT[1]},
        "rows": DIRS,
        "animations": {
            "walk": {"file": "indah_sprite_8dir.png", "frames": 6, "fps": 9, "loop": True},
            "idle": {"file": "indah_idle_8dir.png", "frames": 4, "fps": 4, "loop": True,
                     "note": "frames 0-2 breathe (0,1,0,1...), frame 3 is a blink; play it now and then"},
        },
        "palette_size": len(colors),
    }
    with open(os.path.join(out, "indah_sprite.json"), "w") as fh:
        json.dump(meta, fh, indent=2)
    a = anchor[..., 3] > 0
    ys = np.nonzero(a.any(1))[0]
    print(f"walk {walk.shape[1]}x{walk.shape[0]}, idle {idle.shape[1]}x{idle.shape[0]}, "
          f"colors {len(colors)}, height {ys.max() - ys.min() + 1}px (rows {ys.min()}-{ys.max()})")


if __name__ == "__main__":
    main()
