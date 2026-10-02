#!/usr/bin/env python3
"""Build Arya's walk and idle atlases from his AI reference (converted by pixelfit.py).

The AI walk atlas redraws Arya in every frame, so his face, glasses and bag
shift around, his legs barely step and his arms hang still; it also gives
him a big head on short legs and a torso that is only a sliver from the side.
So only the head (with the collar), the satchel and its strap come from ONE
master frame per direction; the body is a single small 3D model, raymarched
like the legs in tools/legs3d.py and toon shaded in Arya's palette:

  * Indah's proportions: the reference is converted small enough that his
    head matches Indah's (--height 74) and the head sits on a body with
    longer legs, putting his crown about level with the top of her hair
    (the cowlick sticks out above it);
  * a shirt torso with real depth, so he has a body from the side too; its
    hem covers the top of the trousers, so body and legs are one piece;
  * arms melted into the shoulders (a smooth union of sleeve and torso), so
    the line runs from the shoulder down the arm without a break: a rolled
    sleeve, a forearm and a fist that swing from the shoulder against the
    legs, sideways in the side views and toward or away from the camera in
    the front and back views; the far arm passes behind the body;
  * straight chinos and white sneakers (legs3d.PantsLegs): the knee bends
    and the swing foot lifts with the Prompt Sprite phase table (contact A,
    down A, passing A, contact B, down B, passing B);
  * a 1 px body bob (lowest on "down", highest on "passing"): the hips drop;
  * crisp 7 x 6 eyes behind round gold glasses, painted at fixed positions on
    the masters (the converted eyes are brown smudges and the thin AI rims
    vanish when resampled).

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

from legs3d import PANTS, SHOE, SOLE, PantsLegs, paint, raymarch, sd_box, sd_capsule, smin
from pixelfit import DIRS, EYE_KEYS, FH, FW, PALETTES, PIVOT, components, hex2rgb, hull_mask
from walkfix import BOB, ELEV, YAW, colour_set, despike, grow, mask_of, outline

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
CROTCH = 100            # crotch row of the masters
LEG = 25                # crotch to soles on the new body
LEGS = dict(hip_x=3.9, thigh=(4.4, 4.0), shin=(4.0, 3.7), shoe=(3.9, 2.8, 5.8), stride=6.5, lift=3.2)
TORSO = (7.6, 7.8)      # half width and half depth of the shirt torso at the chest (model units, ~px)
WAIST = 0.9             # the torso narrows to this at the hem
SHOULDER_X = 8.8        # shoulder joints, half the shoulder width
SLEEVE = 0.7            # the rolled sleeve ends this far down the upper arm
UPPER, FORE = 9.5, 10.5  # shoulder to elbow, elbow to the middle of the fist
R_SLEEVE, R_FORE, R_FIST = 3.1, 2.1, 2.6
MELT = 2.2              # how far sleeve and torso melt into each other at the shoulder
SWING = 18              # degrees each way, against the legs
BEND = 6                # elbow bend, degrees (a little more on the forward swing)
# materials beyond legs3d's, and the parts of the body
SHIRT, CUFF, FOLD, ARM = 7, 8, 9, 10
TORSO_PART, ARM_L, ARM_R, LEG_PART = 1, 2, 3, 4


class Geo:
    """Where things are on the masters, at the scale the atlas was converted at."""

    def __init__(self, scale):
        self.k = scale / REF_SCALE
        self.cut = self.y(CROTCH)
        self.lift = LEG - (PIVOT[1] - self.cut)
        self.hip_y = (PIVOT[1] - (self.cut - self.lift - 1)) / math.cos(ELEV)

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


def arm_joints(sgn, swing, shoulder_y):
    """Shoulder, elbow and fist (model space) of the arm on side sgn (+1 = his left)."""
    t = math.radians(swing)
    t2 = t + math.radians(BEND + max(0.0, swing) * 0.25)
    abd = math.radians(2.5)                            # arms hang close to the body
    sh = np.array([sgn * SHOULDER_X, shoulder_y, 0.0])
    el = sh + UPPER * np.array([sgn * math.sin(abd), -math.cos(t) * math.cos(abd), math.sin(t) * math.cos(abd)])
    fi = el + FORE * np.array([sgn * math.sin(abd), -math.cos(t2) * math.cos(abd), math.sin(t2) * math.cos(abd)])
    return sh, el, fi


def swing_of(sgn, k):
    """Arm swing (degrees, + = forward) for walk frame k; None = standing."""
    if k is None:
        return 0.0
    s = math.cos(2 * math.pi * k / 6)                   # +1 = left leg forward, so the right arm leads
    return SWING * (-s if sgn > 0 else s)


class Body:
    """Arya below the head, facing +z, feet on y = 0: torso, arms, trousers and sneakers."""

    def __init__(self, k, hip_y, shoulder_y):
        self.legs = PantsLegs(k, hip_y=hip_y, **LEGS)
        waist, top = hip_y - 1.0, shoulder_y + 1.6           # the shirt hangs over the top of the trousers
        self.waist, self.top = waist, top
        self.torso = ((0.0, (waist + top) / 2, 0.0), (TORSO[0], (top - waist) / 2, TORSO[1]))
        self.neck = ((0.0, top - 2.0, -0.3), (0.0, top + 4.0, -0.3))
        self.arms = {sgn: arm_joints(sgn, swing_of(sgn, k), shoulder_y) for sgn in (+1, -1)}

    def pieces(self, p):
        # a chest that narrows a little toward the hem
        f = np.clip((p[:, 1] - self.waist) / (self.top - self.waist), 0, 1)
        q = p / np.stack([WAIST + (1 - WAIST) * f, np.ones(len(p)), WAIST + (1 - WAIST) * f], -1)
        torso = sd_box(q, *self.torso, rad=3.5) * WAIST
        neck = sd_capsule(p, *self.neck, 2.4)
        arms = {}
        for sgn, (sh, el, fi) in self.arms.items():
            cuff = sh + SLEEVE * (el - sh)
            sleeve = sd_capsule(p, sh, cuff, R_SLEEVE + 0.3, R_SLEEVE)
            wrist = fi + 0.4 * (el - fi) / np.linalg.norm(el - fi) * R_FIST
            fore = np.minimum(sd_capsule(p, sh + 0.5 * (el - sh), el, R_FORE + 0.3, R_FORE),
                              sd_capsule(p, el, wrist, R_FORE, R_FORE - 0.2))
            fist = np.linalg.norm(p - fi, axis=-1) - R_FIST
            arms[sgn] = (sleeve, fore, fist)
        pants, shoe = self.legs.parts(p)
        return torso, neck, arms, pants, shoe

    def dist(self, p):
        torso, neck, arms, pants, shoe = self.pieces(p)
        upper = torso
        for sleeve, _, _ in arms.values():
            upper = smin(upper, sleeve, MELT)              # the shoulder flows into the arm
        d = np.minimum(np.minimum(upper, neck), np.minimum(pants, shoe))
        for _, fore, fist in arms.values():
            d = np.minimum(d, np.minimum(fore, fist))
        return d

    def _nearest(self, p):
        torso, neck, arms, pants, shoe = self.pieces(p)
        cands = [torso, neck, pants, shoe]
        for sgn in (+1, -1):
            cands += list(arms[sgn])
        return np.argmin(np.stack(cands, -1), -1)          # 0 torso, 1 neck, 2 pants, 3 shoe, 4.. arms

    def materials(self, p):
        near = self._nearest(p)
        m = np.select([near == 0, near == 1, near == 2, near == 3],
                      [SHIRT, ARM, PANTS, self.legs.materials(p)], ARM)
        for i, sgn in enumerate((+1, -1)):
            sh, el, _ = self.arms[sgn]
            ax = (el - sh) * SLEEVE
            t = ((p - sh) @ ax) / (ax @ ax)
            sleeve = near == 4 + 3 * i
            m = np.where(sleeve, np.where(t > 0.78, CUFF, np.where(t > 0.62, FOLD, SHIRT)), m)
        return m

    def part(self, p):
        near = self._nearest(p)
        return np.select([near <= 1, near <= 3, near <= 6], [TORSO_PART, LEG_PART, ARM_L], ARM_R)


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


class Master:
    """What one direction keeps from its master frame, already lifted onto the new body."""

    def __init__(self, master, direction, geo):
        img = drop_islands(master)
        if direction in EYES:
            img = paint_eyes(img, geo.eyes(direction))
        self.dx = torso_dx(img, geo)
        row = shoulder_row(img, geo)
        lift = geo.lift
        # the head, down to the collar; the master's shoulder line there would
        # cut across the new torso, so outline pixels that only border the
        # shirt go (the chin keeps its line)
        head = img.copy()
        head[row - 2:] = 0
        line = mask_of(head, colour_set(PAL, "outline"))
        face = grow(mask_of(head, colour_set(PAL, "skin", "hair")), 1)
        line[: row - 7] = False
        head[line & ~face] = 0
        # the satchel: the leather below the chest with everything inside its
        # outline (its highlights share the skin's colours) ...
        leather = mask_of(img, colour_set(PAL, "leather"))
        leather[: row - 2] = False
        low = leather.copy()
        low[: row + 4] = False
        lab, n = components(low)
        bag = np.zeros(leather.shape, bool)
        for i in range(1, n + 1):
            if (lab == i).sum() >= 30:
                bag |= hull_mask(lab == i)
        bag &= (img[..., 3] > 0) & ~mask_of(img, colour_set(PAL, "shirt", "chinos"))
        bag |= grow(bag, 1) & mask_of(img, colour_set(PAL, "outline"))
        # ... and the strap across the shirt
        strap = leather & ~bag
        strap |= grow(strap, 1) & mask_of(img, colour_set(PAL, "outline")) & ~bag
        strap[: row - 2] = False

        def up(a):
            a = np.roll(a, -lift, axis=0)
            a[FH - lift:] = 0
            return a
        self.head = up(head)
        self.bag = up(np.where(bag[..., None], img, 0).astype(np.uint8))
        self.strap = up(np.where(strap[..., None], img, 0).astype(np.uint8))
        self.shoulder_y = (PIVOT[1] - (row - lift)) / math.cos(ELEV)
        # the satchel hangs on his left hip: in front of the body unless that side is away from us
        z_left = -SHOULDER_X * math.sin(math.radians(YAW[direction]))
        self.bag_in_front = z_left >= -2


def frame(m, direction, k, geo):
    """One frame: k = walk frame 0-5, or None for the standing (idle) pose."""
    bob = BOB[k] if k is not None else 0
    yaw = YAW[direction]
    drop = bob / math.cos(ELEV)
    y0 = 40
    mat, tn, depth, part = raymarch(Body(k, geo.hip_y - drop, m.shoulder_y - drop), yaw, y0)
    pal = PALETTES[PAL]
    shirt, skin, pants, shoe = pal["shirt"], pal["skin"], pal["chinos"], pal["shirt"]
    ramp = {SHIRT: [shirt[1], shirt[1], shirt[2], shirt[3]],
            CUFF: [shirt[2], shirt[2], shirt[3], shirt[3]],
            FOLD: [shirt[1], shirt[0], shirt[1], shirt[1]],
            ARM: [skin[1], skin[1], skin[2], skin[3]],
            PANTS: [pants[1], pants[1], pants[2], pants[3]],
            SHOE: [shoe[1], shoe[1], shoe[2], shoe[3]],
            SOLE: [pal["sole"][0]] * 4}
    layer = paint(mat, tn, depth, ramp, pal["outline"][0], y0)
    # below the armpits an arm and the body are told apart by a fold line on
    # the nearer of the two; above them the sleeve flows into the shoulder
    arm = (part == ARM_L) | (part == ARM_R)
    armpit = int(round(PIVOT[1] - (m.shoulder_y - drop) * math.cos(ELEV))) + 3 - y0
    fold = np.zeros(part.shape, bool)
    for sh, ax in ((1, 0), (-1, 0), (1, 1), (-1, 1)):
        other = np.roll(part, sh, ax)
        nearer = np.roll(depth, sh, ax) - depth > 0.3
        fold |= (part > 0) & (other > 0) & (other != part) & nearer & \
            (arm | ((other == ARM_L) | (other == ARM_R))) & (part != LEG_PART) & (other != LEG_PART)
    fold[:max(armpit, 0)] = False
    sub = layer[y0:]
    sub[fold & ~arm, :3] = hex2rgb(shirt[1])
    sub[fold & arm & ((mat == SHIRT) | (mat == CUFF) | (mat == FOLD)), :3] = hex2rgb(shirt[1])
    sub[fold & arm & (mat == ARM), :3] = hex2rgb(skin[1])
    canvas = np.roll(layer, m.dx, axis=1)
    parts = np.zeros((FH, FW), np.int32)
    parts[y0:] = np.roll(part, m.dx, axis=1)
    # the near arms (both, seen from the front or back) pass in front of the satchel
    near = [arm for arm, sgn in ((ARM_L, +1), (ARM_R, -1))
            if -sgn * SHOULDER_X * math.sin(math.radians(yaw)) >= -2]
    strap = np.roll(m.strap, bob, axis=0)
    sel = (strap[..., 3] > 0) & (parts == TORSO_PART)
    canvas[sel] = strap[sel]
    bag = np.roll(m.bag, bob, axis=0)
    sel = (bag[..., 3] > 0) & ~np.isin(parts, near)
    if not m.bag_in_front:
        sel &= ~np.isin(parts, [TORSO_PART, ARM_L, ARM_R])    # behind the body: only where it shows
    canvas[sel] = bag[sel]
    head = np.roll(m.head, bob, axis=0)
    sel = head[..., 3] > 0
    canvas[sel] = head[sel]
    return outline(despike(canvas), PAL)


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
        m = Master(src[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW], d, geo)
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
        "height_note": "crown to soles (front view), about level with the top of Indah's hair; "
                       "the cowlick sticks out above it",
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
