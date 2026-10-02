#!/usr/bin/env python3
"""Build Arya's walk and idle atlases from his AI reference (converted by pixelfit.py).

The AI walk atlas redraws Arya in every frame, so his face, glasses and bag
shift around, and its six frames are nearly the same mid-stride pose: he
glides instead of stepping. So, like walkfix.py does for Indah, ONE master
frame per direction is kept, and here it is animated as a cut-out, entirely
in the reference's own pixels:

  * size: converted so his head matches Indah's (--height 74), with his own
    trouser legs stretched (rows repeated evenly) so he stands about as tall
    as her, the cowlick sticking out above;
  * legs: each leg below the crotch is cut out (and carried on up behind the
    satchel and under the shirt) and turned about its hip, so the feet step
    with the Prompt Sprite phase table (contact A, down A, passing A,
    contact B, down B, passing B) and the swing foot lifts; in the front and
    back views the feet move up and down instead;
  * idle: the AI drew no standing pose, so (except facing us or away, where
    its legs already stand) both legs are set straight under the hips with
    the flattest foot it drew, side by side on the ground, and the hips are
    narrowed to them;
  * seams: the dark line where a limb was cut off the body is painted over
    with the limb's own colours, and the notches a turned limb opens at the
    shoulder or hip are filled with the colours around them;
  * arms: each arm (sleeve, forearm and fist) is cut out and swung from the
    shoulder against the legs; in profile, where the AI drew the arm across
    the chest, the forearm swings from the elbow; the far arm passes behind
    the body and the torso is filled in where an arm was lifted off;
  * a 1 px body bob (lowest on "down", highest on "passing");
  * crisp 7 x 6 eyes behind round gold glasses, painted at fixed positions on
    the masters (the converted eyes are brown smudges and the thin AI rims
    vanish when resampled).

Limbs are turned like rotsprite: drawn 4x larger, turned without blending and
brought back with the most common colour per block, so no new colours appear.

Usage:
  python3 tools/pixelfit.py assets/sprites/arya/reference/arya_ai_walk_atlas.webp \\
      --height 74 --palette arya --name arya --out <tmp>
  python3 tools/arya_walk.py <tmp>/arya_sprite_8dir.png --out-dir assets/sprites/arya/90
"""
import argparse
import json
import math
import os

import numpy as np
from PIL import Image

from legs3d import stride_pose
from pixelfit import DIRS, EYE_KEYS, FH, FW, PALETTES, PIVOT, components, hex2rgb, hull_mask
from walkfix import BOB, ELEV, YAW, colour_set, despike, fill_holes, grow, mask_of, outline

PAL = "arya"
# 7 x 6 eyes without the lash flick of Indah's, keys as in pixelfit.EYE_KEYS
# (K line, D dark iris, M iris, L warm iris, W highlight, S white); "narrow"
# is the far eye of a 3/4 view and the eye in profile
EYES_PX = {"full_l": [".KKKKK.",
                      "KKKKKKK",
                      "SDWWDDS",
                      "SDWDDDS",
                      "SDDMMDS",
                      ".DMLLD."],
           "full_r": [".KKKKK.",
                      "KKKKKKK",
                      "SDWWDDS",
                      "SDWDDDS",
                      "SDMMDDS",
                      ".DLLMD."],
           "narrow_l": [".KKK.",
                        "KKKKK",
                        "DWWDS",
                        "DWDDS",
                        "DDMMS",
                        ".MLL."],
           "narrow_r": [".KKK.",
                        "KKKKK",
                        "SDWWD",
                        "SDWDD",
                        "SMMDD",
                        ".LLM."]}
MASTERS = {"SE": 0, "S": 2, "SW": 0, "W": 0, "NW": 5, "N": 0, "NE": 1, "E": 3}
# standing: the AI frame and leg (0 = screen left) whose foot is drawn flattest
STAND = {"SE": (1, 1), "SW": (0, 0), "W": (0, 0), "NW": (5, 1), "NE": (1, 0), "E": (1, 0)}
# Positions on the masters as converted at REF_SCALE (pixelfit --height 90);
# they are rescaled to the scale the atlas was actually converted at (read
# from pixelfit's json), around the pivot like pixelfit places the frames.
REF_SCALE = 0.5233
# eye centres: (x, y, near) - the near eye is drawn full, the far one (or the
# only one, in profile) narrow
EYES = {
    "SE": [(47, 58, True), (64, 58, False)],
    "S": [(38, 58, True), (55, 58, True)],
    "SW": [(31, 56, False), (48, 56, True)],
    "W": [(34, 59, False)],
    "E": [(61, 57, False)],
}
CROTCH = 100            # crotch row of the masters (at REF_SCALE)
EXTRA = 9               # rows his own trouser legs are stretched by, so he stands about as tall as Indah
CHEST = (9.0, 7.0)      # half width and half depth of the torso: arms are what hangs outside it
SHOULDER_X = 10.4       # shoulders and hips, half their width, to tell left from right and near from far
LEGS_X = 4.6
ARM_R = 3.5             # how far around the line from shoulder to elbow the sleeve is cut out
STRIDE, LIFT = 5.5, 3.0  # how far a foot travels forward or back, and how high the swing foot lifts
SWING = 18              # degrees each arm swings each way, against the legs
STANCE_X = 6.0          # standing: half the distance between the hips, facing us
TOE = 1.5               # standing in profile: how far the shoe sits ahead of the hip


class Geo:
    """Where things are on the masters, at the scale the atlas was converted at."""

    def __init__(self, scale):
        self.k = scale / REF_SCALE
        self.cut = self.y(CROTCH)

    def x(self, v):
        return int(round(PIVOT[0] + (v - PIVOT[0]) * self.k))

    def y(self, v):
        return int(round(PIVOT[1] - (PIVOT[1] - v) * self.k))

    def px(self, n):
        return int(round(n * self.k))

    def eyes(self, direction):
        return [(self.x(x), self.y(y), near) for x, y, near in EYES.get(direction, [])]


def rgb(key, i):
    return hex2rgb(PALETTES[PAL][key][i])


def drop_islands(img, keep_min=12):
    """Remove loose specks the resampling left around the sprite (bits of thin strokes)."""
    lab, n = components(img[..., 3] > 0)
    if n <= 1:
        return img
    sizes = np.bincount(lab.ravel())[1:]
    main = sizes.argmax() + 1
    out = img.copy()
    for i in range(1, n + 1):
        if i != main and sizes[i - 1] < keep_min:
            out[lab == i] = 0
    return out


def paint_eyes(img, eyes):
    """Clear the smudged eyes and paint crisp ones with round glasses around them."""
    out = img.copy()
    skin = mask_of(img, colour_set(PAL, "skin"))
    gy, gx = np.mgrid[0:FH, 0:FW]
    lenses = []
    for k, (cx, cy, near) in enumerate(sorted(eyes)):
        side = "lr"[k] if len(eyes) == 2 else ("l" if cx < PIVOT[0] else "r")
        pat = EYES_PX[("full_" if near else "narrow_") + side]
        ph, pw = len(pat), len(pat[0])
        ox, oy = cx - pw // 2, cy - ph // 2
        # the old eye: everything that is not skin or hair inside an ellipse around it
        old = (((gx - cx) / (pw / 2 + 1.5)) ** 2 + ((gy - cy) / (ph / 2 + 1.5)) ** 2 <= 1.0) & \
            (img[..., 3] > 0) & ~skin & ~mask_of(img, colour_set(PAL, "hair"))
        out[old, :3] = rgb("skin", 2)
        for j, row in enumerate(pat):
            for i, ch in enumerate(row):
                if ch == ".":
                    continue
                key, r = dict(EYE_KEYS, S=("shirt", 3))[ch]
                out[oy + j, ox + i, :3] = rgb(key, r)
                out[oy + j, ox + i, 3] = 255
        lenses.append((cx, cy, pw / 2 + (2.0 if near else 1.2), ph / 2 + 1.0))
    opaque = img[..., 3] > 0
    hair = mask_of(img, colour_set(PAL, "hair"))
    for cx, cy, rx, ry in lenses:
        outer = ((gx - cx) / rx) ** 2 + ((gy - cy) / ry) ** 2 <= 1.0
        inner = ((gx - cx) / (rx - 1)) ** 2 + ((gy - cy) / (ry - 1)) ** 2 <= 1.0
        ring = outer & ~inner & opaque
        out[ring, :3] = rgb("glasses", 1)
        out[ring & (gy > cy + 1), :3] = rgb("glasses", 0)
    # the bridge between the lenses, and the arms back to the ears
    y = lenses[0][1] - 1
    if len(lenses) == 2:
        (c0, _, r0, _), (c1, _, r1, _) = lenses
        for x in range(int(c0 + r0), int(math.ceil(c1 - r1)) + 1):
            out[y, x, :3] = rgb("glasses", 1)
        ends = [(int(c0 - r0), -1, 2), (int(math.ceil(c1 + r1)), +1, 2)]
    else:
        c0, _, r0, _ = lenses[0]
        back = +1 if c0 < PIVOT[0] else -1               # profile: the arm runs back to the ear
        ends = [(int(math.ceil(c0 + r0)) if back > 0 else int(c0 - r0), back, 9)]
    for x, step, n in ends:
        for _ in range(n):
            if not (0 <= x < FW) or not opaque[y, x] or hair[y, x]:
                break
            out[y, x, :3] = rgb("glasses", 1)
            x += step
    return out


def swing_of(sgn, k):
    """Arm swing (degrees, + = forward) for walk frame k; None = standing."""
    if k is None:
        return 0.0
    s = math.cos(2 * math.pi * k / 6)                   # +1 = left leg forward, so the right arm leads
    return SWING * (-s if sgn > 0 else s)


def torso_dx(img, geo):
    """Horizontal offset of the torso from the pivot, from the shirt between the shoulders and the hem."""
    shirt = mask_of(img, colour_set(PAL, "shirt"))
    shirt[: geo.cut - geo.px(28)] = False
    shirt[geo.cut - geo.px(12):] = False
    xs = np.nonzero(shirt)[1]
    return int(round(np.median(xs) + 0.5 - PIVOT[0])) if len(xs) else 0


def shoulder_row(img, geo):
    """Row of the shoulder joints on a master: a few rows under the top of the shirt."""
    shirt = mask_of(img, colour_set(PAL, "shirt"))
    top = geo.cut - geo.px(30)
    rows = np.nonzero(shirt[top:geo.cut].sum(1) >= 6)[0]
    return top + int(rows.min()) + 3 if len(rows) else geo.cut - geo.px(19)


def rotate(sprite, angle, pivot):
    """Turn a pixel-art layer by angle degrees (clockwise on screen) about pivot.

    Drawn 4x larger, turned without blending and brought back with the most
    common colour of every 4 x 4 block, so outlines stay 1 px and no new
    colours appear.
    """
    if abs(angle) < 0.5:
        return sprite
    k = 4
    big = np.repeat(np.repeat(sprite, k, 0), k, 1)
    big = np.array(Image.fromarray(big).rotate(-angle, resample=Image.NEAREST,
                                               center=(pivot[0] * k, pivot[1] * k)))
    blocks = big.reshape(FH, k, FW, k, 4).swapaxes(1, 2).reshape(FH, FW, k * k, 4)
    key = (blocks[..., 0].astype(np.int64) << 24) | (blocks[..., 1].astype(np.int64) << 16) | \
        (blocks[..., 2].astype(np.int64) << 8) | blocks[..., 3]
    opaque = blocks[..., 3] > 0
    votes = (key[..., :, None] == key[..., None, :]).sum(-1) * opaque
    best = votes.argmax(-1)
    out = np.take_along_axis(blocks, best[..., None, None], 2)[:, :, 0]
    out[opaque.sum(-1) * 2 < k * k] = 0
    return out


def paint_in(img, todo, rounds=6):
    """Give each pixel in todo the most common colour of its opaque neighbours, growing inward.

    Outline neighbours only count where nothing else is next to the pixel, so
    seams and gaps fill with cloth and skin rather than with more outline."""
    out = img.copy()
    todo = todo.copy()
    line = tuple(rgb("outline", 0)) + (255,)
    for _ in range(rounds):
        if not todo.any():
            break
        known = (out[..., 3] > 0) & ~todo
        votes = {}
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy or dx:
                    nb = np.roll(np.roll(out, dy, 0), dx, 1)
                    ok = np.roll(np.roll(known, dy, 0), dx, 1) & todo
                    for y, x in zip(*np.nonzero(ok)):
                        votes.setdefault((y, x), []).append(tuple(int(v) for v in nb[y, x]))
        for (y, x), cols in votes.items():
            fill = [c for c in cols if c != line] or cols
            out[y, x] = max(set(fill), key=fill.count)
            todo[y, x] = False
    return out


def heal(sprite, where):
    """Paint over the dark seam a cut-out limb carries where it was cut off the body."""
    dark = mask_of(sprite, colour_set(PAL, "outline", "hair")) | \
        mask_of(sprite, {tuple(rgb("leather", 0)), tuple(rgb("leather", 1))})
    return paint_in(sprite, dark & where)


def close_joints(canvas, joints, radius=6, region=None):
    """Fill the notches a turned limb opens at its joint (and in region) with the colours around them."""
    a = canvas[..., 3] > 0
    closed = ~grow(~grow(a, 2), 2)
    gy, gx = np.mgrid[0:FH, 0:FW] + 0.5
    near = np.zeros(a.shape, bool) if region is None else region.copy()
    for x, y in joints:
        near |= np.hypot(gx - x, gy - y) < radius
    return paint_in(canvas, closed & ~a & near)


def shift(sprite, dx, dy):
    out = np.zeros_like(sprite)
    h, w = sprite.shape[:2]
    ys, xs = slice(max(dy, 0), h + min(dy, 0)), slice(max(dx, 0), w + min(dx, 0))
    yd, xd = slice(max(-dy, 0), h + min(-dy, 0)), slice(max(-dx, 0), w + min(-dx, 0))
    out[ys, xs] = sprite[yd, xd]
    return out


def pose(sprite, joint, end, target):
    """Turn a limb about its joint so that its end lands on joint + target."""
    v = np.subtract(end, joint)
    turn = math.degrees(math.atan2(-target[0], target[1]) - math.atan2(-v[0], v[1]))
    out = rotate(sprite, turn, joint)
    a = math.radians(turn)
    landed = (joint[0] + v[0] * math.cos(a) - v[1] * math.sin(a), joint[1] + v[0] * math.sin(a) + v[1] * math.cos(a))
    return shift(out, int(round(joint[0] + target[0] - landed[0])), int(round(joint[1] + target[1] - landed[1])))


class Master:
    """One direction cut out of its master frame: body, two legs and the arms that show."""

    def __init__(self, master, direction, geo, stand_leg=None):
        yaw = math.radians(YAW[direction])
        img = drop_islands(master)
        if direction in EYES:
            img = paint_eyes(img, geo.eyes(direction))
        self.dx = torso_dx(img, geo)
        cx = PIVOT[0] + self.dx
        row = shoulder_row(img, geo)
        # longer legs in the AI's own pixels: trouser rows repeated evenly, feet kept on the ground
        top, bot = geo.cut - geo.px(8), PIVOT[1] - geo.px(6)
        rows = list(range(top)) + [int(v) for v in np.linspace(top, bot, bot - top + EXTRA, endpoint=False)]
        rows = np.array((rows + list(range(bot, FH)))[EXTRA:EXTRA + FH])
        img = img[rows]

        def moved(y):
            return y - EXTRA if y < top else top - EXTRA + (y - top) * (bot - top + EXTRA) / (bot - top)
        crotch = int(round(moved(geo.cut)))
        row = int(round(moved(row)))
        alpha = img[..., 3] > 0
        gy, gx = np.mgrid[0:FH, 0:FW] + 0.5
        # the satchel stays with the body
        leather = mask_of(img, colour_set(PAL, "leather"))
        leather[: row + 4] = False
        lab, n = components(leather)
        bag = np.zeros(alpha.shape, bool)
        for i in range(1, n + 1):
            if (lab == i).sum() >= 30:
                bag |= hull_mask(lab == i)
        bag &= alpha
        # arms: each forearm and fist, its sleeve up to the shoulder, and in
        # the front views whatever hangs outside the torso beside it
        skin = mask_of(img, colour_set(PAL, "skin"))
        cloth = mask_of(img, colour_set(PAL, "shirt", "skin", "outline", "chinos"))
        half = math.hypot(CHEST[0] * math.cos(yaw), CHEST[1] * math.sin(yaw))
        beside = (np.abs(gx - cx) > half) & (gy >= row) & (gy < crotch) & alpha & ~bag & \
            ~mask_of(img, colour_set(PAL, "hair"))
        lab, n = components(skin)
        found = []
        for i in range(1, n + 1):
            comp = lab == i
            yy, xx = np.nonzero(comp)
            if len(yy) < geo.px(25) or yy.min() <= row + 2 or yy.min() >= crotch:
                continue
            ex, ey = xx[yy <= yy.min() + 1].mean() + 0.5, float(yy.min())
            hand = (xx[yy >= yy.max() - 3].mean() + 0.5, yy.max() - 2.0)
            if abs(math.cos(yaw)) < 0.6:
                # in profile the AI drew the arm across the chest: only the
                # forearm and fist swing, from the elbow
                dark = mask_of(img, colour_set(PAL, "outline", "lips", "hair")) | \
                    (mask_of(img, colour_set(PAL, "leather")) & ~bag)
                found.append([comp | (grow(comp, 2) & dark & ~bag), (ex, ey), hand])
                continue
            sx = cx + (ex - cx) * abs(math.cos(yaw))
            vx, vy = ex - sx, ey - row
            t = np.clip(((gx - sx) * vx + (gy - row) * vy) / max(vx * vx + vy * vy, 1e-6), 0, 1)
            d = np.hypot(gx - (sx + t * vx), gy - (row + t * vy))
            mask = comp | ((d <= ARM_R) & (t > 0.15) & cloth & ~bag)
            mask |= beside & (np.sign(gx - cx) == np.sign(ex - cx))
            found.append([mask, (sx, float(row)), hand])
        # which arm is which: by where the 3D layout puts each shoulder on screen
        expect = {sgn: sgn * SHOULDER_X * math.cos(yaw) for sgn in (+1, -1)}
        self.arms = []
        found.sort(key=lambda f: f[1][0])
        if len(found) == 2:
            pairs = zip(sorted(expect, key=expect.get), found)
        else:
            pairs = [(min(expect, key=lambda sgn: abs(cx + expect[sgn] - f[1][0])), f) for f in found]
        taken = np.zeros(alpha.shape, bool)
        for sgn, (mask, shoulder, hand) in pairs:
            mask &= ~taken
            taken |= mask
            z = -sgn * SHOULDER_X * math.sin(yaw)
            sprite = np.where(mask[..., None], img, 0).astype(np.uint8)
            # the armhole line where the arm was cut from the body is a seam, not an outline
            sprite = heal(sprite, np.hypot(gx - shoulder[0], gy - shoulder[1]) < 5)
            self.arms.append(dict(sgn=sgn, sprite=sprite, joint=shoulder, end=hand, near=z >= -2))
        # legs: everything below the crotch except the satchel, one sprite per
        # leg, reaching a few rows up under the shirt so turning leaves no gap
        below = alpha & ~grow(bag, 1) & ~taken
        below[: crotch] = False
        lab, n = components(below)
        sizes = np.bincount(lab.ravel())[1:]
        big = [i + 1 for i in np.argsort(-sizes)[:2] if sizes[i] > 20]
        if len(big) == 2:
            parts = [lab == big[0], lab == big[1]]
        else:                                                # legs drawn together: split down the middle
            parts = [below & (gx < cx), below & (gx >= cx)]
        self.legs = []
        sides = sorted(parts, key=lambda m: np.nonzero(m)[1].mean())
        for j, part in enumerate(sides):
            yy, xx = np.nonzero(part)
            if abs(math.cos(yaw)) > 0.3:                       # screen left/right tells left/right
                sgn = (-1 if j == 0 else 1) * (1 if math.cos(yaw) > 0 else -1)
            else:                                            # profile: the bigger leg is the near one
                near_first = part.sum() >= sides[1 - j].sum()
                near_sgn = 1 if math.sin(yaw) < 0 else -1
                sgn = near_sgn if near_first else -near_sgn
            # the leg carries on up behind the satchel and under the shirt: each
            # column repeats its top trouser pixel up to a few rows above the crotch
            sprite = np.where(part[..., None], img, 0).astype(np.uint8)
            for x in np.unique(xx):
                ys = yy[xx == x]
                y_top = ys.min()
                for y in range(crotch - 4, y_top):
                    if alpha[y, x] or bag[y, x]:
                        sprite[y, x] = img[y_top, x] if not bag[y_top, x] else sprite[y_top, x]
            sprite = heal(sprite, gy < crotch + 3)           # the crotch line was a seam, not an outline
            yy, xx = np.nonzero(sprite[..., 3] > 0)
            joint = (xx[yy <= yy.min() + 1].mean() + 0.5, float(crotch))
            foot = (xx[yy >= yy.max() - 2].mean() + 0.5, float(yy.max()))
            z = -sgn * LEGS_X * math.sin(yaw)
            self.legs.append(dict(sgn=sgn, sprite=sprite, joint=joint, end=foot, near=z >= -0.5))
        # which leg the AI drew stepping forward: its foot is planted flat, the
        # other one pushes off on its toes
        ahead = np.array([math.sin(yaw), math.cos(yaw) * math.sin(ELEV)])
        reach = [np.dot(np.subtract(leg["end"], leg["joint"]), ahead) for leg in self.legs]
        self.planted = self.legs[int(np.argmax(reach))]
        self.pushing = self.legs[int(np.argmin(reach))]
        # ... worn by whichever leg is ahead or behind, unless the satchel hides
        # much of one of them (then each leg keeps its own)
        areas = [(leg["sprite"][..., 3] > 0).sum() for leg in self.legs]
        self.swap = min(areas) >= 0.85 * max(areas)
        self.front_view = abs(math.cos(yaw)) > 0.9
        # the body keeps the hips down to the crotch; the dark lines the AI drew
        # between the thighs there are painted over, so the legs join it cleanly
        self.crotch = crotch
        # the body: what is left, with the torso filled in behind the arms
        body = img.copy()
        gone = taken | below
        body[gone] = 0
        low = np.zeros(alpha.shape, bool)
        low[crotch:] = True                                  # below the crotch only the satchel stays
        satchel = bag | (grow(bag, 1) & mask_of(img, colour_set(PAL, "outline")))
        body[low & ~satchel] = 0
        solid = body[..., 3] > 0
        inside = taken & np.maximum.accumulate(solid, axis=1) & np.maximum.accumulate(solid[:, ::-1], axis=1)[:, ::-1]
        body = fill_holes(body, inside)
        plain = mask_of(img, colour_set(PAL, "shirt")) & ~taken
        tones = [(mask_of(img, {tuple(rgb("shirt", i))}) & plain).sum() for i in range(4)]
        body[inside & mask_of(body, colour_set(PAL, "shirt")), :3] = rgb("shirt", int(np.argmax(tones)))
        band = np.zeros(alpha.shape, bool)
        band[crotch - 4:crotch] = True
        inner = band & ~grow(~(body[..., 3] > 0), 1) & ~grow(bag, 1)   # inside the silhouette, not the satchel
        body = heal(body, inner)
        self.body = drop_islands(body)                   # specks of outline the arms left behind
        self.satchel = satchel
        self.yaw = yaw
        self.stand = None if self.front_view else self.standing(geo, stand_leg or self.planted)

    def standing(self, geo, src):
        """The idle pose for the views that are not straight on: the AI drew
        every frame mid-stride, so both legs are set straight under the hips,
        wearing the flattest foot the AI drew (src), feet side by side on the
        ground, and the hips are narrowed to them row by row from the hem down."""
        yaw, crotch = self.yaw, self.crotch
        hx = float(np.mean([leg["joint"][0] for leg in self.legs]))
        half = geo.k * STANCE_X * abs(math.cos(yaw))
        ground = max(leg["end"][1] for leg in self.legs)
        legs, tops = [], []
        for j, leg in enumerate(self.legs):              # screen left, then right
            depth = -leg["sgn"] * LEGS_X * geo.k * math.sin(yaw)           # + = toward us
            x = hx + (j * 2 - 1) * half
            dx = int(round(x - src["joint"][0]))
            joint = (src["joint"][0] + dx, src["joint"][1])
            end = (src["end"][0] + dx, src["end"][1])
            # straight down, the toe a little ahead, the sole on the ground
            target = (TOE * geo.k * math.sin(yaw), ground + depth * math.sin(ELEV) - joint[1])
            legs.append((leg["near"], drop_islands(pose(shift(src["sprite"], dx, 0), joint, end, target), 40)))
            tops.append(x - leg["joint"][0])             # how far this side's hip moves in
        body = self.body.copy()
        hips = (body[..., 3] > 0) & ~self.satchel
        band_top = crotch - geo.px(12)
        gx = np.arange(FW) + 0.5
        order = sorted((0, 1), key=lambda j: self.legs[j]["near"])        # the near side on top
        for y in range(band_top, crotch):
            t = (y - band_top + 1) / (crotch - band_top)
            row = np.where(hips[y][:, None], body[y], 0)
            body[y][hips[y]] = 0
            for j in order:
                side = (gx < hx) if j == 0 else (gx >= hx)
                part = np.where(side[:, None], row, 0)
                part = shift(part[None], int(round(t * tops[j])), 0)[0]
                sel = (part[:, 3] > 0) & ~self.satchel[y]
                body[y][sel] = part[sel]
        region = np.zeros(hips.shape, bool)
        region[band_top:crotch + 2] = True
        return legs, body, region


def frame(m, direction, k, geo):
    """One frame: k = walk frame 0-5, or None for the standing (idle) pose."""
    bob = BOB[k] if k is not None else 0
    a = m.yaw
    legs, joints = [], []
    body, region = m.body, None
    if k is None and m.stand:
        legs, body, region = m.stand
    for leg in (m.legs if not (k is None and m.stand) else []):
        fwd, up = stride_pose(k, leg["sgn"])
        z, lift = STRIDE * fwd, LIFT * up
        joints.append(leg["joint"])
        if m.front_view:
            # facing us or away: the AI's own standing legs; the feet only rise,
            # and come toward us or go away (down and up on screen)
            dy = int(round(-lift * math.cos(ELEV) + z * math.cos(a) * math.sin(ELEV)))
            legs.append((leg["near"], shift(leg["sprite"], 0, dy)))
            continue
        # the leg ahead wears the planted foot, the one pushing off behind wears
        # the foot on its toes (where both are drawn whole); it hangs from this leg's hip
        src = (m.pushing if (k is not None and fwd < 0 and up == 0) else m.planted) if m.swap else leg
        dx, dy = (int(round(v)) for v in np.subtract(leg["joint"], src["joint"]))
        sprite = shift(src["sprite"], dx, dy)
        joint = (src["joint"][0] + dx, src["joint"][1] + dy)
        end = (src["end"][0] + dx, src["end"][1] + dy)
        length = math.dist(joint, end)
        target = (z * math.sin(a), length - lift * math.cos(ELEV) + z * math.cos(a) * math.sin(ELEV))
        legs.append((leg["near"], drop_islands(pose(sprite, joint, end, target), 40)))
    arms = []
    for arm in m.arms:
        t = math.radians(swing_of(arm["sgn"], k))
        length = math.dist(arm["joint"], arm["end"]) / math.cos(ELEV)
        target = (length * math.sin(t) * math.sin(a),
                  length * math.cos(t) * math.cos(ELEV) + length * math.sin(t) * math.cos(a) * math.sin(ELEV))
        limb = drop_islands(pose(arm["sprite"], arm["joint"], arm["end"], target), 40)
        arms.append((arm["near"], shift(limb, 0, bob)))
        joints.append((arm["joint"][0], arm["joint"][1] + bob))
    canvas = np.zeros((FH, FW, 4), np.uint8)
    layers = [s for near, s in arms if not near] + [s for near, s in legs if not near] + \
        [s for near, s in legs if near] + [shift(body, 0, bob)] + [s for near, s in arms if near]
    for layer in layers:
        sel = layer[..., 3] > 0
        canvas[sel] = layer[sel]
    return outline(despike(close_joints(canvas, joints, region=region)), PAL)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("atlas", help="pixelfit.py output (6 x 8 frames)")
    ap.add_argument("--out-dir", required=True)
    a = ap.parse_args()
    src = np.array(Image.open(a.atlas).convert("RGBA"))
    with open(os.path.join(os.path.dirname(a.atlas), "arya_sprite.json")) as fh:
        geo = Geo(json.load(fh)["scale_from_source"])
    rows, idle, heights = [], [], {}
    for r, d in enumerate(DIRS):
        c = MASTERS[d]
        stand = None
        if d in STAND:
            f, j = STAND[d]
            stand = Master(src[r * FH:(r + 1) * FH, f * FW:(f + 1) * FW], d, geo).legs[j]
        m = Master(src[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW], d, geo, stand)
        rows.append(np.concatenate([frame(m, d, k, geo) for k in range(6)], 1))
        still = frame(m, d, None, geo)
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
        "height_note": "crown to soles (front view); the cowlick sticks out above it",
        "idle_heights_px": heights,
        "rows": DIRS,
        "animations": {
            "walk": {"file": "arya_sprite_8dir.png", "frames": 6, "fps": 9, "loop": True,
                     "phases": ["contact A", "down A", "passing A", "contact B", "down B", "passing B"]},
            "idle": {"file": "arya_idle_8dir.png", "frames": 1, "layout": "1 column x 8 rows (same row order)"},
        },
        "palette_size": len(used),
        "pipeline": [
            "python3 tools/pixelfit.py assets/sprites/arya/reference/arya_ai_walk_atlas.webp "
            "--height 74 --palette arya --name arya --out <tmp>",
            "python3 tools/arya_walk.py <tmp>/arya_sprite_8dir.png --out-dir assets/sprites/arya/90",
        ],
    }
    with open(os.path.join(a.out_dir, "arya_sprite.json"), "w") as fh:
        json.dump(meta, fh, indent=2)
    print(f"arya: walk + idle -> {a.out_dir} ({len(used)} colours)")


if __name__ == "__main__":
    main()
