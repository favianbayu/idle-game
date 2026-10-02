#!/usr/bin/env python3
"""Draw Arya from scratch, frame by frame: walk (6 x 8) and idle (1 x 8).

Nothing is cut out of the AI reference. Every frame is drawn anew from a small
3D skeleton posed for that frame, after the AI reference (arya_ai_*.webp) and
the Prompt Sprite script in the Character Bible:

  * body: rounded shapes (curls, face, torso, sleeves, forearms, fists,
    trouser legs, sneakers, satchel) are sampled densely on their surfaces,
    projected to the 96 x 128 frame and kept per pixel by depth, so arms and
    legs always grow out of the body: one silhouette, one outline;
  * shading: light from the top left, each material on its own 4-tone ramp,
    then a 1 px dark outline round the silhouette and wherever a nearer part
    overlaps a farther one (an arm in front of the shirt), never at a joint;
  * details drawn on the shapes: rolled sleeve cuffs, the chest pocket with
    its blue pen, placket and buttons, the strap over his right shoulder down
    to the satchel on his left hip, books in the satchel, sneaker soles;
  * face: round 6 x 6 px brown eyes behind round gold glasses, brows, the
    mole above his left brow, nose and a small smile, placed where the head
    turns them (in 3/4 a little less than the head, so both eyes show);
  * walk: the Prompt Sprite phase table (contact A, down A, passing A,
    contact B, down B, passing B): heel strike and toe-off, knees bending,
    the swing foot lifted, body bob 0/+1/-1, arms swinging against the legs
    with the elbows bending as they come forward; the cowlick lags the bob.

Usage:
  python3 tools/arya_build.py --out-dir assets/sprites/arya/90
"""
import argparse
import json
import math
import os

import numpy as np
from PIL import Image

FW, FH = 96, 128
PIVOT = (48, 116)
DIRS = ["SE", "S", "SW", "W", "NW", "N", "NE", "E"]
YAW = {"S": 0, "SE": 45, "E": 90, "NE": 135, "N": 180, "NW": -135, "W": -90, "SW": -45}
ELEV = math.radians(24)
BOB = [0, 1, -1, 0, 1, -1]              # screen px, + is down: lowest on "down", highest on "passing"
LIGHT = np.array([-0.55, 0.62, 0.56])   # screen right, up, toward us: light from the top left
LIGHT = LIGHT / np.linalg.norm(LIGHT)
STEP = 0.32                             # surface sampling, px: dense enough to leave no holes


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


OUTLINE = "#1E0C05"
# 4-tone ramps, dark to light, after the AI reference
RAMP = {
    "hair": ["#2E1A10", "#4A2C1B", "#6A4127", "#8E5E37"],
    "skin": ["#A55A2A", "#D27A3C", "#EE9A55", "#F8B677"],
    "shirt": ["#B59A80", "#DCC7AE", "#F0E5D3", "#FCF7EE"],
    "chinos": ["#8A6844", "#B38A5E", "#D0AA7C", "#E5C797"],
    "shoe": ["#DCC7AE", "#F0E5D3", "#FCF7EE", "#FFFFFF"],       # white sneakers: the shirt's lights
    "sole": ["#8F7663", "#8F7663", "#A88E78", "#A88E78"],
    "leather": ["#4A220C", "#6B3416", "#8E4D22", "#AE6830"],
    "pen": ["#34508A", "#34508A", "#4D6FB0", "#4D6FB0"],
    "gold": ["#B98238", "#B98238", "#E7B864", "#E7B864"],
    "book1": ["#8E3B2E", "#8E3B2E", "#B5503C", "#B5503C"],
    "book2": ["#3E5A7A", "#3E5A7A", "#557597", "#557597"],
}
LIPS = RAMP["book1"][2]
MAT = {m: i + 1 for i, m in enumerate(RAMP)}          # 0 = empty
# parts: what counts as one piece for internal lines (the joints inside a piece never get one)
PARTS = ["hair", "head", "torso", "arm_r", "arm_l", "leg_r", "leg_l", "bag"]
PART = {p: i + 1 for i, p in enumerate(PARTS)}


# ---------------------------------------------------------------- geometry
def rot_x(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def rot_y(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def rot_z(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def frame_of(axis):
    """An orthonormal frame whose y axis runs along axis."""
    y = axis / np.linalg.norm(axis)
    ref = np.array([0.0, 0.0, 1.0]) if abs(y[2]) < 0.9 else np.array([1.0, 0.0, 0.0])
    x = np.cross(y, ref)
    x /= np.linalg.norm(x)
    z = np.cross(x, y)
    return np.stack([x, y, z], 1)


def code(mat, tone=None):
    """Material code: the material, and optionally a fixed tone (0-3) for drawn lines."""
    return MAT[mat] * 10 + (0 if tone is None else tone + 1)


class Shape:
    """Surface samples of one primitive: points, normals, a material and a part per point."""

    def __init__(self, P, N, mat, part):
        self.P, self.N = P, N
        self.mat = np.full(len(P), code(mat)) if isinstance(mat, str) else mat
        self.part = PART[part]
        # the head is drawn nearly face-on, as chibi sprites are: depth moves it
        # down the screen less than the body
        self.tilt = HEAD_TILT if part in ("hair", "head") else math.sin(ELEV)


def ellipsoid(c, r, part, mat, R=np.eye(3), paint=None):
    r = np.asarray(r, float)
    n_t = max(8, int(math.pi * r.max() / STEP))
    n_p = max(12, int(2 * math.pi * r.max() / STEP))
    t, p = np.meshgrid(np.linspace(0, math.pi, n_t), np.linspace(0, 2 * math.pi, n_p, endpoint=False))
    u = np.stack([np.sin(t) * np.cos(p), np.cos(t), np.sin(t) * np.sin(p)], -1).reshape(-1, 3)
    local = u * r
    n = u / r
    n /= np.linalg.norm(n, axis=1, keepdims=True)
    P = local @ R.T + c
    N = n @ R.T
    m = paint(local) if paint else mat
    return Shape(P, N, m, part)


def tube(p0, p1, r0, r1, part, mat, paint=None, caps=(True, True)):
    """A tapered tube from p0 to p1 with round ends; paint(t, angle) may colour it."""
    p0, p1 = np.asarray(p0, float), np.asarray(p1, float)
    axis = p1 - p0
    length = np.linalg.norm(axis)
    F = frame_of(axis)
    rmax = max(r0, r1)
    n_l = max(2, int(length / STEP) + 1)
    n_a = max(12, int(2 * math.pi * rmax / STEP))
    t, a = np.meshgrid(np.linspace(0, 1, n_l), np.linspace(0, 2 * math.pi, n_a, endpoint=False))
    t, a = t.ravel(), a.ravel()
    r = r0 + (r1 - r0) * t
    local = np.stack([r * np.cos(a), t * length, r * np.sin(a)], 1)
    n = np.stack([np.cos(a), np.zeros_like(a), np.sin(a)], 1)
    P = local @ F.T + p0
    N = n @ F.T
    mats = paint(t, a) if paint else np.full(len(P), code(mat))
    shapes = [Shape(P, N, mats, part)]
    if caps[0]:
        shapes.append(ellipsoid(p0, (r0, r0, r0), part, mat))
    if caps[1]:
        shapes.append(ellipsoid(p1, (r1, r1, r1), part, mat))
    return shapes


def loft(y0, y1, half, part, mat, paint=None):
    """A body of horizontal elliptical slices: half(y) = (half width, half depth)."""
    ys = np.arange(y0, y1 + 1e-6, STEP * 0.8)
    pts, nrm = [], []
    for y in ys:
        a, b = half(y)
        if a <= 0 or b <= 0:
            continue
        n_a = max(16, int(2 * math.pi * max(a, b) / STEP))
        ang = np.linspace(0, 2 * math.pi, n_a, endpoint=False)
        x, z = a * np.cos(ang), b * np.sin(ang)
        a2, b2 = half(y + 0.5)
        da = (a2 - a) / 0.5
        n = np.stack([np.cos(ang) / a, -da * np.ones_like(ang) / max(a, 1e-3), np.sin(ang) / b], 1)
        pts.append(np.stack([x, np.full_like(x, y), z], 1))
        nrm.append(n / np.linalg.norm(n, axis=1, keepdims=True))
    # close the bottom and top with discs
    for y, sgn in ((ys[0], -1), (ys[-1], 1)):
        a, b = half(y)
        rr, ang = np.meshgrid(np.arange(0, 1, STEP / max(a, b, 1)), np.linspace(0, 2 * math.pi, 64))
        x, z = (rr * a * np.cos(ang)).ravel(), (rr * b * np.sin(ang)).ravel()
        pts.append(np.stack([x, np.full_like(x, y), z], 1))
        nrm.append(np.tile([0.0, sgn, 0.0], (len(x), 1)))
    P = np.concatenate(pts)
    N = np.concatenate(nrm)
    m = paint(P, N) if paint else mat
    return Shape(P, N, m, part)


def superbox(c, half, R, part, mat, power=4.0, paint=None):
    """A box with rounded edges (a superellipsoid), sampled on its surface."""
    half = np.asarray(half, float)
    step = STEP / half.max()
    g = np.arange(-1, 1 + 1e-6, step)
    faces = []
    for ax in range(3):
        for sgn in (-1, 1):
            u, v = np.meshgrid(g, g)
            f = np.zeros((u.size, 3))
            others = [i for i in range(3) if i != ax]
            f[:, ax] = sgn
            f[:, others[0]] = u.ravel()
            f[:, others[1]] = v.ravel()
            faces.append(f)
    q = np.concatenate(faces)
    q = q / (np.abs(q) ** power).sum(1, keepdims=True) ** (1 / power)
    local = q * half
    n = np.sign(q) * np.abs(q) ** (power - 1) / half
    n /= np.linalg.norm(n, axis=1, keepdims=True)
    P = local @ R.T + c
    N = n @ R.T
    m = paint(local) if paint else mat
    return Shape(P, N, m, part)


# ---------------------------------------------------------------- the figure
# heights in px above the ground, at the final scale (soles on row 115)
HIP_Y = 23.4            # hip joints, standing
HIP_X = 4.6
THIGH, SHIN = 10.6, 10.0
ANKLE_Y = 2.9           # ankle above the sole
HEM = 21.8              # shirt hem
SHOULDER = np.array([11.6, 41.0, -0.2])
UPPER, FORE = 6.8, 5.4
HEAD = np.array([0.0, 59.6, 0.6])
HAIR_SEED = 7
HEAD_TILT = 0.16        # screen px down per px toward us, for the head (the body uses sin 24 deg)


def torso_half(y):
    """Half width and half depth of the shirt at height y (hem to the base of the neck)."""
    if y < HEM:
        return 0, 0
    if y < 27.0:
        t = (y - HEM) / (27.0 - HEM)
        return 10.2 - 0.4 * t, 8.6 - 0.2 * t
    if y < 38.5:
        t = (y - 27.0) / 11.5
        return 9.8 + 0.8 * t, 8.4 + 0.6 * t
    if y < 45.6:                                           # the shoulders round off into the neck
        t = (y - 38.5) / 7.1
        k = math.sqrt(max(0.0, 1 - t * t))
        return 4.0 + 6.6 * k, 4.0 + 5.0 * k
    return 0, 0


def shirt_paint(P, N):
    """The shirt's own details: placket and buttons, pocket and pen, the strap, the neck."""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    m = np.full(len(P), code("shirt"))
    front = z > 1.0
    # placket down the front, a little to his right, with two buttons
    placket = front & (np.abs(x + 0.6) < 0.5) & (y > 22.0) & (y < 43.0)
    buttons = placket & ((np.abs(y - 39.0) < 0.6) | (np.abs(y - 32.0) < 0.6))
    # chest pocket on his left, outlined, the pen clipped over its edge
    px0, px1, py0, py1 = 2.6, 7.8, 30.6, 36.6
    inside = front & (x > px0) & (x < px1) & (y > py0) & (y < py1)
    edge = inside & ((x < px0 + 0.7) | (x > px1 - 0.7) | (y < py0 + 0.7) | (y > py1 - 0.9))
    hem = (y < HEM + 0.9)                                  # the hem's folded edge
    pen = front & (np.abs(x - 4.2) < 0.55) & (y > 35.2) & (y < 38.8)
    # strap: over the right shoulder (-x) down to the left hip (+x), front and back alike
    d = np.array([17.0, -24.0])
    n = np.array([-d[1], d[0]]) / np.linalg.norm(d)
    dist = (x - (-6.0)) * n[0] + (y - 44.5) * n[1]
    strap = (np.abs(dist) < 1.3) & (y > 19.5)
    strap_edge = strap & (np.abs(dist) > 0.75)
    # the open collar: a small V of skin under the chin, edged by the collar
    neck = front & (y > 42.0) & (np.abs(x) < (y - 42.0) * 0.9)
    collar = front & (y > 41.0) & (np.abs(x) < (y - 41.0) * 0.9 + 1.4) & ~neck
    m[placket] = code("shirt", 1)
    m[buttons] = code("shirt", 0)
    m[edge] = code("shirt", 0)
    m[hem] = code("shirt", 1)
    m[collar] = code("shirt", 1)
    m[neck] = code("skin", 1)
    m[pen] = code("pen")
    m[strap] = code("leather")
    m[strap_edge] = code("leather", 0)
    return m


def bag_paint(local):
    """The satchel: a flap over its top half with a darker edge and a brass clasp."""
    x, y, z = local[:, 0], local[:, 1], local[:, 2]
    m = np.full(len(local), code("leather"))
    flap_edge = (np.abs(y - 0.2) < 0.55) & (x < 0)
    clasp = (np.abs(y - 0.2) < 0.9) & (np.abs(z) < 0.8) & (x < 0)
    m[flap_edge] = code("leather", 0)
    m[clasp] = code("gold", 2)
    return m


class Pose:
    """What one frame asks of the body: the bob, each foot's step and each arm's swing."""

    def __init__(self, k):
        self.k = k
        walking = k is not None
        bob = BOB[k] if walking else 0
        self.lift = -bob - (WALK_DIP if walking else 0.0)  # whole body up (+) or down (-)
        self.legs = {}
        for side in (+1, -1):                              # +1 = his left (screen right facing us)
            if walking:
                ph = (k + (0 if side > 0 else 3)) % 6
                z, up, pitch = STEPS[ph]
            else:
                z, up, pitch = 0.0, 0.0, 0.0
            self.legs[side] = (z, up, pitch)
        # arms swing against the legs: an arm goes forward with the opposite foot
        self.arms = {}
        for side in (+1, -1):
            if walking:
                swing = STEPS[(k + (3 if side > 0 else 0)) % 6][0] / STEPS[0][0]
            else:
                swing = 0.0
            self.arms[side] = swing


# his left foot through the cycle: ankle forward (z), lifted off the ground, toe
# pitch in degrees (+ toe up: on the heel; - heel up: on the toe)
STEPS = [
    (7.0, 0.0, 18.0),       # contact A: ahead, heel down, toe up
    (3.6, 0.0, 0.0),        # down A: flat, taking the weight
    (0.0, 0.0, 0.0),        # passing A: straight under the body
    (-6.6, 0.0, -30.0),     # contact B: behind, pushing off its toes
    (-4.8, 2.4, -40.0),     # down B: lifting off
    (1.0, 3.2, -10.0),      # passing B: swinging through, lifted
]
WALK_DIP = 1.2          # the hips ride this much lower walking than standing
HEEL, TOE = 2.2, 5.2    # heel behind and toe ahead of the ankle


def leg_shapes(pose, side):
    z, up, pitch = pose.legs[side]
    hip = np.array([side * HIP_X, HIP_Y + pose.lift, 0.0])
    pr = math.radians(pitch)
    x = side * (HIP_X - 0.3)
    # the ankle's height follows from what touches the ground: the heel, the
    # toe, or the whole sole
    if pr > 0:
        y = ANKLE_Y * math.cos(pr) + HEEL * math.sin(pr)
    elif pr < 0:
        y = ANKLE_Y * math.cos(pr) + TOE * math.sin(-pr)
    else:
        y = ANKLE_Y
    ankle = np.array([x, y + up, z])
    # knee: two-bone solve, bending forward
    d = ankle - hip
    dist = np.linalg.norm(d)
    dist_c = min(dist, THIGH + SHIN - 1e-3)
    a = (THIGH ** 2 - SHIN ** 2 + dist_c ** 2) / (2 * dist_c)
    h = math.sqrt(max(THIGH ** 2 - a * a, 0.0))
    u = d / dist
    fwd = np.array([0.0, 0.0, 1.0]) - u * u[2]
    fwd = fwd / (np.linalg.norm(fwd) + 1e-9)
    knee = hip + u * a + fwd * h
    if dist > THIGH + SHIN:
        ankle = hip + u * (THIGH + SHIN)
    part = "leg_l" if side > 0 else "leg_r"
    shapes = []
    shapes += tube(hip, knee, 4.9, 4.4, part, "chinos")
    shapes += tube(knee, ankle + np.array([0, 0.9, 0]), 4.4, 4.3, part, "chinos")
    # sneaker in the foot's own frame: x across, y up, z toward the toe
    R = rot_x(-pr)

    def shoe_paint(local):
        m = np.full(len(local), code("shoe"))
        m[local[:, 1] < -1.1] = code("sole")
        return m
    centre = ankle + R @ np.array([0.0, -0.6, (TOE - HEEL) / 2])
    shapes.append(superbox(centre, (4.0, 2.7, (TOE + HEEL) / 2 + 0.5), R, part, "shoe", power=2.6,
                           paint=shoe_paint))
    return shapes


def arm_shapes(pose, side):
    swing = pose.arms[side]
    sh = SHOULDER * np.array([side, 1, 1]) + np.array([0, pose.lift, 0])
    a = math.radians(24 * swing)                           # + = forward
    out = math.radians(9)
    bend = math.radians(10 + 14 * max(swing, 0) + 4 * max(-swing, 0))
    R_up = rot_z(side * out) @ rot_x(-a)
    elbow = sh + R_up @ np.array([0, -UPPER, 0])
    R_fore = rot_z(side * out * 0.5) @ rot_x(-(a + bend))
    wrist = elbow + R_fore @ np.array([0, -FORE, 0])
    fist = wrist + R_fore @ np.array([0, -2.0, 0.3])
    part = "arm_l" if side > 0 else "arm_r"
    shapes = []
    # short sleeve, a little bell-shaped, ending in a rolled cuff
    end = sh + R_up @ np.array([0, -UPPER * 0.78, 0])
    shapes += tube(sh + np.array([0, 0.4, 0]), end, 3.9, 4.2, part, "shirt", caps=(True, False))
    cuff_a = sh + R_up @ np.array([0, -UPPER * 0.62, 0])
    shapes += tube(cuff_a, end, 4.35, 4.35, part, "shirt", caps=(False, False),
                   paint=lambda t, ang: np.where(t < 0.3, code("shirt", 1), code("shirt", 2)))
    shapes += tube(end, wrist, 3.0, 2.8, part, "skin", caps=(False, True))
    shapes.append(ellipsoid(fist, (3.3, 3.5, 3.3), part, "skin", R=R_fore))
    return shapes


def head_shapes(pose):
    H = HEAD + np.array([0, pose.lift, 0])
    shapes = [ellipsoid(H, (13.8, 13.8, 11.6), "head", "skin")]
    for side in (+1, -1):
        shapes.append(ellipsoid(H + np.array([side * 13.2, -1.6, -1.4]), (2.2, 3.2, 2.4), "head", "skin"))
    shapes.append(ellipsoid(H + np.array([0, -3.4, 10.6]), (1.3, 1.7, 2.0), "head", "skin"))   # nose
    shapes += hair_shapes(H, pose)
    shapes.append(ellipsoid(np.array([0, 45.2 + pose.lift, -0.6]), (4.2, 3.0, 3.8), "torso", "skin"))  # neck
    return shapes


def hair_shapes(H, pose):
    """Curly hair: a mass of round curls over the skull, the face left open, bangs to one side."""
    rng = np.random.default_rng(HAIR_SEED)
    centre = H + np.array([0, 3.0, -3.6])
    rad = np.array([19.4, 18.4, 16.4])
    n = 140
    i = np.arange(n) + 0.5
    phi = np.arccos(1 - 2 * i / n)
    theta = math.pi * (1 + 5 ** 0.5) * i
    u = np.stack([np.sin(phi) * np.cos(theta), np.cos(phi), np.sin(phi) * np.sin(theta)], 1)
    shapes = []
    for k in range(n):
        p = centre + u[k] * rad * 0.84 + rng.normal(0.0, 0.7, 3)
        x, y, z = p - H
        r = 4.4 + rng.uniform(-0.8, 0.8)
        if y < -11.5:
            continue                                        # no hair under the nape
        hairline = 5.4 - 0.022 * x * x                      # the forehead's top edge
        bangs = -9.5 < x < -2.5 and z > 7.0 and y > 2.0
        front = z > 3.0 and y - 0.8 * r < max(hairline, 4.4)       # forehead and temples
        side = -2.0 < z <= 3.0 and y - 0.8 * r < 2.0               # cheeks, in front of the ears
        ear = abs(x) > 10.0 and z > -4.5 and -6.5 < y < 1.5        # the ears themselves
        if bangs and front:
            r = min(r, 2.8)
            p = p + np.array([0.0, max(0.0, 4.4 - y), 0.0])  # bangs end above the brows
        elif front or side or ear:
            continue                                        # the face, ears and cheeks stay open
        shapes.append(ellipsoid(p, (r, r, r), "hair", "hair"))
    # the cowlick: a thick strand rising from the crown and arching over in a
    # loop, as in the reference; it lags the bob a frame
    lag = 0.0 if pose.k is None else 0.7 * BOB[(pose.k - 1) % 6]
    keys = np.array([[0.0, 0.0, 0.0], [-1.6, 5.0, 0.4], [0.4, 8.6, 0.8], [3.6, 8.4, 0.8],
                     [5.2, 5.6, 0.6], [4.8, 3.2, 0.4]])
    t = np.linspace(0, len(keys) - 1, 60)
    curve = np.stack([np.interp(t, np.arange(len(keys)), keys[:, j]) for j in range(3)], 1)
    # smooth the polyline a little
    for _ in range(4):
        curve[1:-1] = (curve[:-2] + 2 * curve[1:-1] + curve[2:]) / 4
    base = H + np.array([-0.5, 19.0, -2.5])
    for j, q in enumerate(curve):
        f = j / (len(curve) - 1)
        rr = 1.5 - 0.6 * f
        shapes.append(ellipsoid(base + q + np.array([0, lag * f, 0]), (rr, rr, rr), "hair", "hair"))
    return shapes


def torso_shapes(pose):
    lift = pose.lift
    shapes = [loft(HEM + lift, 45.6 + lift, lambda y: torso_half(y - lift), "torso", "shirt",
                   paint=lambda P, N: shirt_paint(P - np.array([0, lift, 0]), N))]
    # hips under the shirt, joining the legs
    shapes.append(ellipsoid(np.array([0, HIP_Y + 0.8 + lift, 0]), (8.0, 3.0, 5.6), "torso", "chinos"))
    # satchel on his left hip, its flap toward the front left, books inside
    R = rot_y(math.radians(24))
    c = np.array([12.4, 20.6 + lift, -1.8])
    shapes.append(superbox(c, (2.5, 5.4, 5.8), R, "bag", "leather", power=3.0, paint=bag_paint))
    for dz, mat in ((-1.8, "book1"), (0.9, "book2")):
        shapes.append(superbox(c + R @ np.array([-0.2, 5.0, dz]), (1.6, 1.8, 1.3), R, "bag", mat, power=6.0))
    return shapes


# ---------------------------------------------------------------- drawing
def render(direction, k):
    yaw = math.radians(YAW[direction])
    pose = Pose(k)
    shapes = []
    shapes += torso_shapes(pose)
    shapes += head_shapes(pose)
    for side in (+1, -1):
        shapes += leg_shapes(pose, side)
        shapes += arm_shapes(pose, side)
    P = np.concatenate([s.P for s in shapes])
    N = np.concatenate([s.N for s in shapes])
    M = np.concatenate([s.mat for s in shapes])
    Q = np.concatenate([np.full(len(s.P), s.part) for s in shapes])
    SID = np.concatenate([np.full(len(sh.P), i + 1) for i, sh in enumerate(shapes)])
    D = np.concatenate([np.full(len(s.P), s.tilt) for s in shapes])
    c, s = math.cos(yaw), math.sin(yaw)
    wx = P[:, 0] * c + P[:, 2] * s
    wz = -P[:, 0] * s + P[:, 2] * c
    nx = N[:, 0] * c + N[:, 2] * s
    nz = -N[:, 0] * s + N[:, 2] * c
    sx = PIVOT[0] + wx
    sy = PIVOT[1] - P[:, 1] + wz * D
    depth = wz * math.cos(ELEV) + P[:, 1] * math.sin(ELEV)
    # how much each point faces the camera, which looks down at 24 degrees
    vnz = nz * math.cos(ELEV) + N[:, 1] * math.sin(ELEV)
    light = nx * LIGHT[0] + N[:, 1] * LIGHT[1] + nz * LIGHT[2]
    # faces and hands stay readable on the shadow side too
    skin = (M // 10) == MAT["skin"]
    light = np.where(skin, 0.55 * light + 0.32, light)
    ix, iy = np.floor(sx).astype(int), np.floor(sy).astype(int)
    ok = (ix >= 0) & (ix < FW) & (iy >= 0) & (iy < FH) & (vnz > -0.2)
    order = np.argsort(depth[ok])
    sel = np.nonzero(ok)[0][order]
    buf = dict(depth=np.full((FH, FW), -1e9), mat=np.zeros((FH, FW), int),
               light=np.zeros((FH, FW)), part=np.zeros((FH, FW), int), sid=np.zeros((FH, FW), int),
               facing=np.zeros((FH, FW)))
    buf["depth"][iy[sel], ix[sel]] = depth[sel]
    buf["mat"][iy[sel], ix[sel]] = M[sel]
    buf["light"][iy[sel], ix[sel]] = light[sel]
    buf["part"][iy[sel], ix[sel]] = Q[sel]
    buf["sid"][iy[sel], ix[sel]] = SID[sel]
    buf["facing"][iy[sel], ix[sel]] = vnz[sel]
    return buf, pose, yaw


def despeckle(tone, mat, free):
    """A lone pixel of a tone none of its 4 neighbours of the same material share
    takes their most common tone: clean bands, no single-pixel noise."""
    out = tone.copy()
    nbs = [(np.roll(np.roll(tone, dy, 0), dx, 1), np.roll(np.roll(mat, dy, 0), dx, 1))
           for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0))]
    same = sum(((nm == mat) & (nt == tone)).astype(int) for nt, nm in nbs)
    lone = free & (same == 0) & (mat > 0)
    for y, x in zip(*np.nonzero(lone)):
        votes = [int(nt[y, x]) for nt, nm in nbs if nm[y, x] == mat[y, x]]
        if votes:
            out[y, x] = max(set(votes), key=votes.count)
    return out


def shade(buf):
    """Each material on its 4-tone ramp by how much the surface faces the light."""
    mat, light = buf["mat"], buf["light"]
    tone = np.digitize(light, [-0.05, 0.38, 0.78])
    img = np.zeros((FH, FW, 4), np.uint8)
    base, forced = mat // 10, mat % 10
    tone = despeckle(tone, mat, forced == 0)
    tone = np.where(forced > 0, forced - 1, tone)
    for name, i in MAT.items():
        sel = base == i
        if sel.any():
            img[sel, :3] = np.array([hexrgb(c) for c in RAMP[name]])[tone[sel]]
            img[sel, 3] = 255
    return img


def outline(img, buf):
    """1 px outline round the silhouette and where a nearer piece overlaps a farther one;
    between curls of hair a darker line where one curl sits in front of another."""
    a = img[..., 3] > 0
    depth, part, sid, facing = buf["depth"], buf["part"], buf["sid"], buf["facing"]
    hair = part == PART["hair"]
    line = np.zeros_like(a)
    curl = np.zeros_like(a)
    for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
        na = np.roll(np.roll(a, dy, 0), dx, 1)
        nd = np.roll(np.roll(depth, dy, 0), dx, 1)
        npart = np.roll(np.roll(part, dy, 0), dx, 1)
        nsid = np.roll(np.roll(sid, dy, 0), dx, 1)
        nface = np.roll(np.roll(facing, dy, 0), dx, 1)
        line |= a & ~na
        other = a & na & (npart != part)
        # a nearer piece in front of this pixel: this pixel takes the line
        line |= other & (nd > depth + 2.2)
        # two pieces side by side where one turns its edge to us (an arm by the
        # shirt, the hem over the trousers); where they grow into each other
        # (shoulder into sleeve) both face us and no line is drawn
        line |= other & (nd >= depth - 0.3) & (np.minimum(facing, nface) < 0.32)
        curl |= hair & na & (npart == part) & (nsid != sid) & (nd > depth + 1.0)
    img[curl & ~line, :3] = hexrgb(RAMP["hair"][0])
    img[line, :3] = hexrgb(OUTLINE)
    return img


# eyes, 6 x 6, round and brown as in the reference (K lid line, D dark iris,
# M iris, L warm lower iris, W highlight); "narrow" (4 x 6) is the far eye of a
# 3/4 view and the eye in profile
EYES_PX = {"full_l": [".KKKK.",
                      "KDDDDK",
                      "DWWDMD",
                      "DWDMMD",
                      "DDMLLD",
                      ".DLLD."],
           "full_r": [".KKKK.",
                      "KDDDDK",
                      "DMDWWD",
                      "DMMDWD",
                      "DLLMDD",
                      ".DLLD."],
           "narrow_l": [".KK.",
                        "KDDK",
                        "DWMD",
                        "DDMD",
                        "DMLD",
                        ".LL."],
           "narrow_r": [".KK.",
                        "KDDK",
                        "DMWD",
                        "DMDD",
                        "DLMD",
                        ".LL."]}
EYE_COL = {"K": OUTLINE, "D": RAMP["hair"][0], "M": RAMP["hair"][2], "L": RAMP["leather"][3],
           "W": "#FFFFFF"}


def head_point(rel, pose, yaw):
    """Screen position, depth and facing of a point on the face (rel to the head centre)."""
    H = HEAD + np.array([0, pose.lift, 0])
    r = np.array([13.8, 13.8, 11.6])
    x, y = rel
    zz = 1 - (x / r[0]) ** 2 - (y / r[1]) ** 2
    z = r[2] * math.sqrt(max(zz, 0.0))
    p = H + np.array([x, y, z])
    n = np.array([x / r[0] ** 2, y / r[1] ** 2, z / r[2] ** 2])
    n /= np.linalg.norm(n)
    c, s = math.cos(yaw), math.sin(yaw)
    wx, wz = p[0] * c + p[2] * s, -p[0] * s + p[2] * c
    nz = -n[0] * s + n[2] * c
    nx = n[0] * c + n[2] * s
    return (PIVOT[0] + wx, PIVOT[1] - p[1] + wz * HEAD_TILT,
            wz * math.cos(ELEV) + p[1] * math.sin(ELEV), nz, nx)


def paint_face(img, buf, pose, yaw):
    """Eyes, glasses, brows, mole and mouth, where the turned head shows them."""
    def visible(x, y, d):
        return 0 <= x < FW and 0 <= y < FH and buf["part"][y, x] == PART["head"] and buf["depth"][y, x] < d + 5.0

    def put(x, y, col, d):
        x, y = int(round(x)), int(round(y))
        if visible(x, y, d):
            img[y, x, :3] = hexrgb(col)
    profile = abs(math.sin(yaw)) > 0.95
    # in the 3/4 views the features turn a little less than the head, so the
    # far eye and its lens stay on the face, as chibi sprites draw them
    yaw = yaw if profile else yaw * 0.8
    eyes = []
    for side in (+1, -1):                                  # his left eye, his right eye
        sx, sy, d, face, nx = head_point((side * 5.2, -0.8), pose, yaw)
        if face < 0.3:
            continue
        if profile:                                        # in profile the eye sits back from the brow
            sx, sy, d, face, nx = head_point((side * 6.6, -0.8), pose, yaw)
        eyes.append((side, sx, sy, d, face, nx))
    for side, sx, sy, d, face, nx in eyes:
        full = face > 0.82
        key = ("full_" if full else "narrow_") + ("l" if side > 0 else "r")
        if not full:
            key = "narrow_" + ("l" if nx < 0 else "r")          # look the way the face turns
        pat = EYES_PX[key]
        w = len(pat[0])
        x0, y0 = int(round(sx - w / 2)), int(round(sy - 3))
        for j, row in enumerate(pat):
            for i, ch in enumerate(row):
                if ch != ".":
                    put(x0 + i, y0 + j, EYE_COL[ch], d)
        # brow: a short dark line, raised a little at its outer end
        bx, by, bd, _, _ = head_point((side * 5.0, 4.0), pose, yaw)
        for i in range(-2, 2 if full else 1):
            put(bx + i, by - (1 if i * side * (1 if nx >= 0 else -1) > 0 else 0), RAMP["hair"][1], bd)
        # glasses: a round gold rim around the eye, lit at its top left; in
        # profile the lens is seen edge on, a short upright line before the eye
        rx, ry = (4.6 if full else max(1.6, 4.6 * face)), 4.4
        cx, cy = x0 + w / 2 - 0.5, y0 + 2.6
        if profile:
            fwd = 1 if nx > 0 else -1
            lx = int(round(cx + fwd * (w / 2 + 0.5)))
            for yy in range(int(round(cy - 3)), int(round(cy + 3))):
                put(lx, yy, RAMP["gold"][3] if yy < cy - 1 else RAMP["gold"][1], d + 3)
        else:
            for yy in range(int(cy - ry - 1), int(cy + ry + 2)):
                for xx in range(int(cx - rx - 1), int(cx + rx + 2)):
                    e = math.hypot((xx - cx) / rx, (yy - cy) / ry)
                    if abs(e - 1) < 0.5 / min(rx, ry) + 0.06:
                        lit = (xx - cx) + (yy - cy) < -1.5
                        put(xx, yy, RAMP["gold"][3] if lit else RAMP["gold"][1], d)
        if not full:
            # the temple arm runs back to the ear
            ex, ey, ed, _, _ = head_point((side * 12.0, -0.6), pose, yaw)
            back = 1 if ex > cx else -1
            start = cx + back * (rx + 1)
            for xx in range(int(round(start)), int(round(ex)) + back, back):
                put(xx, cy - 1, RAMP["gold"][1], max(d, ed) + 6)
    if len(eyes) == 2:                                     # the bridge over the nose
        (_, ax, ay, ad, af, _), (_, bx2, by2, bd2, bf, _) = eyes
        lo, hi = sorted([ax, bx2])
        ra, rb = (4.6 if f > 0.82 else max(1.6, 4.6 * f) for f in (af, bf))
        rl, rr = (ra, rb) if ax < bx2 else (rb, ra)
        for xx in range(int(round(lo + rl)) + 1, int(round(hi - rr))):
            put(xx, round(min(ay, by2)) - 1, RAMP["gold"][1], max(ad, bd2))
    # the mole above his left brow
    mx, my, md, mf, _ = head_point((7.2, 6.0), pose, yaw)
    if mf > 0.25:
        put(mx, my, RAMP["hair"][0], md)
    # nose shade and a small smile
    nx_, ny_, nd, nf, _ = head_point((0.0, -4.6), pose, yaw)
    if nf > 0.2:
        put(nx_ + 1, ny_, RAMP["skin"][1], nd)
    qx, qy, qd, qf, _ = head_point((0.0, -8.2), pose, yaw)
    if qf > 0.2:
        width = 2 if qf > 0.7 else 1
        for i in range(-width, width + 1):
            put(qx + i, qy - (1 if abs(i) == width and width > 1 else 0), LIPS, qd)
    return img


def frame(direction, k):
    buf, pose, yaw = render(direction, k)
    img = shade(buf)
    img = outline(img, buf)
    img = paint_face(img, buf, pose, yaw)
    return img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out-dir", required=True)
    a = ap.parse_args()
    rows, idle, heights = [], [], {}
    for d in DIRS:
        rows.append(np.concatenate([frame(d, k) for k in range(6)], 1))
        still = frame(d, None)
        idle.append(still)
        ys = np.nonzero((still[..., 3] > 0).any(1))[0]
        heights[d] = int(ys.max() - ys.min() + 1)
    walk = np.concatenate(rows, 0)
    width = (idle[1][..., 3] > 0).sum(1)
    crown = int(PIVOT[1] - np.argmax(width >= 0.3 * width.max()))     # the dome, not the cowlick
    idle = np.concatenate(idle, 0)
    os.makedirs(a.out_dir, exist_ok=True)
    Image.fromarray(walk).save(os.path.join(a.out_dir, "arya_sprite_8dir.png"), optimize=True)
    Image.fromarray(idle).save(os.path.join(a.out_dir, "arya_idle_8dir.png"), optimize=True)
    Image.fromarray(idle[FH:2 * FH]).save(os.path.join(a.out_dir, "arya_anchor.png"), optimize=True)
    used = {tuple(c[:3]) for c in np.concatenate([walk.reshape(-1, 4), idle.reshape(-1, 4)]) if c[3]}
    meta = {
        "character": "Arya Prasetya",
        "frame": {"w": FW, "h": FH},
        "pivot": {"x": PIVOT[0], "y": PIVOT[1]},
        "height_px": crown,
        "height_note": "crown to soles (front view); the cowlick loop rises above it",
        "idle_heights_px": heights,
        "rows": DIRS,
        "animations": {
            "walk": {"file": "arya_sprite_8dir.png", "frames": 6, "fps": 9, "loop": True,
                     "phases": ["contact A", "down A", "passing A", "contact B", "down B", "passing B"]},
            "idle": {"file": "arya_idle_8dir.png", "frames": 1, "layout": "1 column x 8 rows (same row order)"},
        },
        "palette_size": len(used),
        "pipeline": ["python3 tools/arya_build.py --out-dir assets/sprites/arya/90"],
        "reference": "assets/sprites/arya/reference/arya_ai_*.webp (drawn after, nothing cut from it)",
    }
    with open(os.path.join(a.out_dir, "arya_sprite.json"), "w") as fh:
        json.dump(meta, fh, indent=2)
    print(f"arya: walk + idle -> {a.out_dir} ({len(used)} colours, {crown} px crown to soles)")


if __name__ == "__main__":
    main()
