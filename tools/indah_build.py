#!/usr/bin/env python3
"""Build Indah's walk (6 x 8) and idle (1 x 8): her head and hair as drawn, her
body drawn anew in every frame.

  * head and hair: one master per direction in three sways (left, still,
    right) in assets/sprites/indah/src/indah_heads_8dir.png. Facing us (S)
    is the master she was designed from; the seven other facings are drawn
    from her AI reference's own views of them (round head, wavy hair, the
    ears, the half-up twist at the back) in S's palette, with S's eyes,
    brows, blush, mouth and wooden clip; facing us the long hair falls behind
    her body, from behind it covers her back, from the side it lies on her
    back under the near arm; it rides on the body by whole pixels and sways
    on the walk;
  * body: chunky chibi shapes drawn for every frame (blouse with puffed
    sleeves, forearms and hands, the A-line skirt, legs and strap sandals),
    one silhouette and one outline, so arms and legs grow out of the body
    (tools/spritebody.py);
  * details: the V-neck edged with mint jasmine embroidery, embroidered sleeve
    cuffs, the round wooden pendant on its red-brown cord, the skirt's
    waistband and hem, sandal straps;
  * walk: the Prompt Sprite phase table shared with Arya (heel strike and
    toe-off, knees bending, the swing foot lifted, bob 0/+1/-1, arms swinging
    against the legs), the skirt swaying with the stride.

Usage:
  python3 tools/indah_build.py --out-dir assets/sprites/indah/84
"""
import argparse
import json
import math
import os

import numpy as np
from PIL import Image

from spritebody import (DIRS, FH, FW, PIVOT, YAW, Pose, Shape, Style, ellipsoid, leg_joints, loft, outline,
                        paste, render as draw, rot_x, rot_z, shade, superbox, tube)

OUTLINE = "#120B0D"
# 4-tone ramps, dark to light: the heads' own palette, so head and body match
RAMP = {
    "skin": ["#94522E", "#CD864F", "#E79E61", "#F0B47E"],
    "blouse": ["#C9C4AA", "#DED7C2", "#F1E8D6", "#FAF6EA"],
    "skirt": ["#A8784A", "#CB925F", "#D7AE7B", "#E2C394"],
    "seam": ["#613E26", "#613E26", "#613E26", "#613E26"],       # the skirt's waistband and hem
    "jasmine": ["#6E9E6A", "#6E9E6A", "#9CC69A", "#9CC69A"],
    "leather": ["#2C1B10", "#5B331C", "#8D4F27", "#B86E3A"],
    "wood": ["#B77741", "#B77741", "#E6A452", "#E6A452"],
    "cord": ["#7A3424", "#7A3424", "#7A3424", "#7A3424"],
}
PARTS = ["torso", "skirt", "arm_r", "arm_l", "leg_r", "leg_l"]
STYLE = Style(OUTLINE, RAMP, PARTS)
code = STYLE.code

# ---------------------------------------------------------------- the figure
# heights in px above the ground, at the final scale (soles on row 115); her
# shoulders sit at Arya's height, so she stands a little shorter than him
NECK = 45.6             # top of the blouse: Arya's shoulder line
WAIST = NECK - 13.0     # where the blouse goes into the skirt
HIP_Y = 26.0            # hip joints, standing (under the skirt)
HIP_X = 3.6
THIGH, SHIN = 12.4, 11.4
ANKLE_Y = 2.6           # ankle above the sole
HEEL, TOE = 1.8, 4.4    # heel behind and toe ahead of the ankle
HEM = 17.0              # skirt hem, standing
SHOULDER = np.array([9.0, NECK - 3.2, -0.2])
UPPER, FORE = 7.4, 6.6


def blouse_half(y):
    """Half width and half depth of the blouse at height y (waist to the neck)."""
    if y < WAIST - 1.5 or y > NECK:
        return 0, 0
    if y < NECK - 8.6:
        t = (y - WAIST + 1.5) / (NECK - 8.6 - WAIST + 1.5)
        return 7.6 + 1.0 * t, 6.0 + 0.6 * t
    if y < NECK - 4.6:
        t = (y - NECK + 8.6) / 4.0
        return 8.6 + 0.3 * t, 6.6 + 0.1 * t
    t = (y - NECK + 4.6) / 4.6                             # the shoulders round off into the neck
    k = math.sqrt(max(0.0, 1 - t * t))
    return 3.4 + 5.5 * k, 3.2 + 3.5 * k


def blouse_paint(P, N):
    """V-neck edged with jasmine embroidery, the pendant on its cord."""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    m = np.full(len(P), code("blouse"))
    front = z > 1.0
    v = 0.8 * (y - NECK + 6.0)
    neck = front & (y > NECK - 6.0) & (np.abs(x) < v)
    edge = front & (y > NECK - 6.6) & (np.abs(x) >= v) & (np.abs(x) < v + 1.0)
    dots = edge & (np.floor(y * 1.0) % 2 == 0)
    # the cord runs from the sides of the neck to the pendant
    cord = front & (y > NECK - 7.0) & (y < NECK) & (np.abs(np.abs(x) - 0.55 * (y - NECK + 7.0)) < 0.45)
    pendant = front & (np.hypot(x, y - NECK + 7.6) < 1.5)
    sprig = front & (y > NECK - 9.6) & (y < NECK) & (np.abs(x) >= v + 1.6) & (np.abs(x) < v + 3.4) & \
        ((np.floor(y) + np.floor(np.abs(x))) % 3 == 0)
    m[edge] = code("blouse", 1)
    m[dots] = code("jasmine", 0)
    m[sprig] = code("jasmine", 2)
    m[neck] = code("skin", 2)
    m[cord & neck] = code("cord")
    m[pendant] = code("wood")
    m[pendant & (x < 0.2) & (y > NECK - 7.4)] = code("wood", 3)
    return m


def skirt_shapes(pose, yaw):
    """The A-line skirt, swaying with the stride: the hem follows the forward foot."""
    lift = pose.lift
    if pose.k is None:
        sway_x = sway_z = 0.0
    else:
        ph = 2 * math.pi * pose.k / 6
        sway_z = 0.9 * math.cos(ph + math.pi / 6)            # forward and back with the legs
        sway_x = 0.7 * math.sin(ph + math.pi / 6)            # side to side with the hips
    top, hem = WAIST + 0.6 + lift, HEM + lift

    def frac(y):
        return min(max((top - y) / (top - hem), 0.0), 1.0)

    def half(y):
        t = frac(y) ** 1.35                                  # a bell: it flares most toward the hem
        return 8.0 + 7.0 * t, 6.4 + 5.0 * t

    def centre(y):
        t = frac(y) ** 2
        return sway_x * t, sway_z * t

    def paint(P, N):
        m = np.full(len(P), code("skirt"))
        m[P[:, 1] > top - 0.9] = code("seam")              # waistband
        m[P[:, 1] < hem + 0.7] = code("seam")              # hem
        return m
    return [loft(hem, top, half, "skirt", "skirt", paint=paint, centre=centre)]


def below(shapes, y):
    """Only the surface under height y: what the skirt does not cover."""
    out = []
    for sh in shapes:
        keep = sh.P[:, 1] < y
        mat = sh.mat if isinstance(sh.mat, str) else sh.mat[keep]
        out.append(Shape(sh.P[keep], sh.N[keep], mat, sh.part))
    return out


def leg_shapes(pose, side):
    hip = np.array([side * HIP_X, HIP_Y + pose.lift, 0.0])
    ankle, knee, pr = leg_joints(pose.legs[side], hip, side * (HIP_X - 0.4), THIGH, SHIN, ANKLE_Y, HEEL, TOE)
    part = "leg_l" if side > 0 else "leg_r"
    shapes = []
    shapes += below(tube(hip, knee, 3.4, 3.0, part, "skin") +
                    tube(knee, ankle + np.array([0, 0.4, 0]), 3.0, 2.6, part, "skin"), HEM + pose.lift + 0.4)
    # strap sandal in the foot's own frame: x across, y up, z toward the toe
    R = rot_x(-pr)

    def foot_paint(local):
        m = np.full(len(local), code("skin"))
        z = local[:, 2]
        m[np.abs(z - 1.4) < 0.75] = code("leather", 1)      # toe strap
        m[np.abs(z + 1.2) < 0.75] = code("leather", 1)      # ankle strap
        return m
    mid = (TOE - HEEL) / 2
    shapes.append(superbox(ankle + R @ np.array([0.0, -0.9, mid]), (2.8, 1.5, (TOE + HEEL) / 2 + 0.3), R, part,
                           "skin", power=2.6, paint=foot_paint))
    shapes.append(superbox(ankle + R @ np.array([0.0, -ANKLE_Y + 0.5, mid]), (3.1, 0.55, (TOE + HEEL) / 2 + 0.7),
                           R, part, "leather", power=4.0))
    return shapes


def arm_shapes(pose, side):
    swing = pose.arms[side]
    sh = SHOULDER * np.array([side, 1, 1]) + np.array([0, pose.lift, 0])
    a = math.radians(24 * swing)                           # + = forward
    out = math.radians(10)
    bend = math.radians(10 + 14 * max(swing, 0) + 4 * max(-swing, 0))
    R_up = rot_z(side * out) @ rot_x(-a)
    elbow = sh + R_up @ np.array([0, -UPPER, 0])
    R_fore = rot_z(side * out * 0.5) @ rot_x(-(a + bend))
    wrist = elbow + R_fore @ np.array([0, -FORE, 0])
    hand = wrist + R_fore @ np.array([0, -1.8, 0.3])
    part = "arm_l" if side > 0 else "arm_r"
    shapes = []
    # the puffed sleeve: round over the shoulder, gathered into an embroidered cuff above the elbow
    puff = sh + R_up @ np.array([0, -2.6, 0])

    def sleeve_paint(local):
        m = np.full(len(local), code("blouse"))
        cuff = local[:, 1] < -3.2
        ang = np.arctan2(local[:, 2], local[:, 0])
        m[cuff] = code("blouse", 1)
        m[cuff & (np.floor((ang + 3.2) * 3.0) % 2 == 0)] = code("jasmine", 0)
        # jasmine sprigs scattered over the puff
        sprig = ~cuff & (np.floor(local[:, 1] * 0.9 + 9) % 2 == 0) & (np.floor((ang + 3.2) * 2.2 + local[:, 1] * 0.5) % 3 == 0)
        m[sprig] = code("jasmine", 2)
        return m
    shapes.append(ellipsoid(puff, (4.7, 4.3, 4.7), part, "blouse", R=R_up, paint=sleeve_paint))
    start = sh + R_up @ np.array([0, -5.4, 0])
    shapes += tube(start, wrist, 2.5, 2.2, part, "skin", caps=(False, True))
    shapes.append(ellipsoid(hand, (2.5, 2.9, 2.4), part, "skin", R=R_fore))
    return shapes


def torso_shapes(pose):
    lift = pose.lift
    shapes = [loft(WAIST - 1.5 + lift, NECK + lift, lambda y: blouse_half(y - lift), "torso", "blouse",
                   paint=lambda P, N: blouse_paint(P - np.array([0, lift, 0]), N))]
    shapes.append(ellipsoid(np.array([0, NECK + 0.6 + lift, -0.4]), (3.0, 2.8, 2.8), "torso", "skin"))   # neck
    return shapes


# ---------------------------------------------------------------- drawing
def render(direction, k):
    yaw = math.radians(YAW[direction])
    pose = Pose(k)
    shapes = []
    shapes += torso_shapes(pose)
    shapes += skirt_shapes(pose, yaw)
    for side in (+1, -1):
        shapes += leg_shapes(pose, side)
        shapes += arm_shapes(pose, side)
    return draw(shapes, yaw, STYLE), pose, yaw


HEADS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "sprites", "indah", "src",
                     "indah_heads_8dir.png")
HAIR_SEQ = [0, 1, 2, 2, 1, 0]           # the hair master each walk frame wears: swung, still, swung back
_heads = None


def head(direction, variant):
    """Head and hair for a direction in one of three sways: a full 96 x 128 frame."""
    global _heads
    if _heads is None:
        _heads = np.array(Image.open(HEADS).convert("RGBA"))
    r = DIRS.index(direction)
    return _heads[r * FH:(r + 1) * FH, variant * FW:(variant + 1) * FW]


# the S master was drawn over shoulders 7 px higher: it comes down with them;
# every other head is drawn where it sits, and moved back over the body
# where the reference leans it forward (px toward her back)
HEAD_DROP = {"S": 7}
HEAD_BACK = {"W": 5, "E": 5, "NE": 2, "SE": 1}

# rows of the head masters below which the long hair hangs free of the head
NAPE = {"SE": 71, "S": 63, "SW": 70, "W": 68, "NW": 66, "N": 66, "NE": 68, "E": 70}
FRONT = ("SE", "S", "SW")               # the hair falls behind her
BACK = ("NW", "N", "NE")                # the hair covers her back


def frame(direction, k):
    buf, pose, yaw = render(direction, k)
    body = outline(shade(buf, STYLE), buf, STYLE)
    dy = -int(round(pose.lift)) + HEAD_DROP.get(direction, 0)
    h = head(direction, 1 if k is None else HAIR_SEQ[k])
    back = HEAD_BACK.get(direction, 0)
    if back:                                           # toward her back: against the facing on screen
        dx = -back if math.sin(math.radians(YAW[direction])) > 0 else back
        h = np.roll(h, dx, axis=1)
    # where the long hair may land: facing us only where there is no body,
    # from the side over the torso but under the near arm, from behind over all
    a = body[..., 3] > 0
    if direction in FRONT:
        free = ~a
    elif direction in BACK:
        free = np.ones_like(a)
    else:
        near_arm = STYLE.part["arm_r" if YAW[direction] > 0 else "arm_l"]
        free = buf["part"] != near_arm
    rows = np.arange(FH)[:, None] - dy
    long_hair = np.broadcast_to(rows > NAPE[direction], a.shape)
    img = paste(body, h, dy, where=long_hair & free)
    return paste(img, h, dy, where=~long_hair)


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
    ys = np.nonzero((idle[1][..., 3] > 0).any(1))[0]
    height = int(PIVOT[1] - ys.min())
    idle = np.concatenate(idle, 0)
    os.makedirs(a.out_dir, exist_ok=True)
    Image.fromarray(walk).save(os.path.join(a.out_dir, "indah_sprite_8dir.png"), optimize=True)
    Image.fromarray(idle).save(os.path.join(a.out_dir, "indah_idle_8dir.png"), optimize=True)
    Image.fromarray(idle[FH:2 * FH]).save(os.path.join(a.out_dir, "indah_anchor.png"), optimize=True)
    used = {tuple(c[:3]) for c in np.concatenate([walk.reshape(-1, 4), idle.reshape(-1, 4)]) if c[3]}
    meta = {
        "character": "Indah Wulandari",
        "frame": {"w": FW, "h": FH},
        "pivot": {"x": PIVOT[0], "y": PIVOT[1]},
        "height_px": height,
        "idle_heights_px": heights,
        "rows": DIRS,
        "animations": {
            "walk": {"file": "indah_sprite_8dir.png", "frames": 6, "fps": 9, "loop": True,
                     "phases": ["contact A", "down A", "passing A", "contact B", "down B", "passing B"]},
            "idle": {"file": "indah_idle_8dir.png", "frames": 1, "layout": "1 column x 8 rows (same row order)"},
        },
        "palette_size": len(used),
        "pipeline": ["python3 tools/indah_build.py --out-dir assets/sprites/indah/84"],
        "head_masters": "assets/sprites/indah/src/indah_heads_8dir.png (8 directions x 3 hair sways: S as "
                        "designed, the others drawn from her AI reference in S's style)",
        "reference": ["assets/sprites/indah/reference/indah_ai_walk_atlas.png (S)",
                      "assets/sprites/indah/reference/indah_ai_walk_atlas_v2.webp (the other facings)"],
    }
    with open(os.path.join(a.out_dir, "indah_sprite.json"), "w") as fh:
        json.dump(meta, fh, indent=2)
    print(f"indah: walk + idle -> {a.out_dir} ({len(used)} colours, {height} px tall)")


if __name__ == "__main__":
    main()
