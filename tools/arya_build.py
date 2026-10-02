#!/usr/bin/env python3
"""Build Arya's walk (6 x 8) and idle (1 x 8): his head as drawn, his body drawn
anew in every frame.

  * head: one master per direction (hair, face, glasses, ears) in
    assets/sprites/arya/src/arya_heads_8dir.png, cleaned pixel art taken from
    his AI reference; it rides on the body and bobs with it, whole pixels only;
  * body: chunky chibi shapes (shirt, short sleeves with rolled cuffs,
    forearms and fists, chinos, white sneakers, the satchel with books) are
    sampled on their surfaces, projected to the 96 x 128 frame and kept per
    pixel by depth, so arms and legs grow out of the body: one silhouette,
    one outline, drawn again for every frame;
  * shading: light from the top left on 4-tone ramps (the head's palette),
    then a 1 px dark outline round the silhouette and wherever a nearer part
    overlaps a farther one (an arm in front of the shirt), never at a joint;
  * details: placket and buttons, the chest pocket with its blue pen, the
    strap over his right shoulder to the satchel on his left hip;
  * walk: the Prompt Sprite phase table (contact A, down A, passing A,
    contact B, down B, passing B): heel strike and toe-off, knees bending,
    the swing foot lifted, body bob 0/+1/-1, arms swinging against the legs
    with the elbows bending as they come forward.

Usage:
  python3 tools/arya_build.py --out-dir assets/sprites/arya/90
"""
import argparse
import json
import math
import os

import numpy as np
from PIL import Image

from spritebody import (DIRS, FH, FW, PIVOT, YAW, Pose, Style, ellipsoid, leg_joints, loft, outline, paste,
                        render as draw, rot_x, rot_y, rot_z, shade, superbox, tube)

OUTLINE = "#1E0C05"
# 4-tone ramps, dark to light: the heads' own palette, so head and body match
RAMP = {
    "skin": ["#8D4F26", "#C37031", "#F09C50", "#F7B676"],
    "shirt": ["#A08268", "#CDAB90", "#EAD9C2", "#FAF1E2"],
    "chinos": ["#8A6844", "#B38A5E", "#D3AC7E", "#E7C899"],
    "shoe": ["#CDAB90", "#EAD9C2", "#FAF1E2", "#FFFFFF"],       # white sneakers: the shirt's lights
    "sole": ["#B59A82", "#B59A82", "#B59A82", "#B59A82"],
    "leather": ["#3B1A09", "#5C2C11", "#85471C", "#A95F2E"],
    "pen": ["#34508A", "#34508A", "#34508A", "#34508A"],
    "gold": ["#B98238", "#B98238", "#E7B864", "#E7B864"],
    "book1": ["#8E3B2E", "#8E3B2E", "#8E3B2E", "#8E3B2E"],
    "book2": ["#3E5A7A", "#3E5A7A", "#3E5A7A", "#3E5A7A"],
}
PARTS = ["torso", "arm_r", "arm_l", "leg_r", "leg_l", "bag"]
STYLE = Style(OUTLINE, RAMP, PARTS)
code = STYLE.code


# ---------------------------------------------------------------- the figure
# heights in px above the ground, at the final scale (soles on row 115)
HIP_Y = 23.4            # hip joints, standing
HIP_X = 5.0
THIGH, SHIN = 10.6, 10.0
ANKLE_Y = 2.9           # ankle above the sole
HEM = 21.8              # shirt hem
SHOULDER = np.array([11.4, 39.6, -0.2])
UPPER, FORE = 6.8, 5.4


def torso_half(y):
    """Half width and half depth of the shirt at height y (hem to the base of the neck)."""
    if y < HEM:
        return 0, 0
    if y < 27.0:
        t = (y - HEM) / (27.0 - HEM)
        return 10.2 - 0.3 * t, 9.4 - 0.2 * t
    if y < 37.0:
        t = (y - 27.0) / 10.0
        return 9.9 + 0.2 * t, 9.2 + 0.3 * t
    if y < 45.6:                                           # the shoulders slope round into the neck
        t = (y - 37.0) / 8.6
        k = math.sqrt(max(0.0, 1 - t * t))
        return 4.2 + 5.9 * k, 4.2 + 5.3 * k
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


HEEL, TOE = 2.2, 5.2    # heel behind and toe ahead of the ankle


def leg_shapes(pose, side):
    hip = np.array([side * HIP_X, HIP_Y + pose.lift, 0.0])
    ankle, knee, pr = leg_joints(pose.legs[side], hip, side * (HIP_X - 0.3), THIGH, SHIN, ANKLE_Y, HEEL, TOE)
    part = "leg_l" if side > 0 else "leg_r"
    shapes = []
    shapes += tube(hip, knee, 5.2, 4.8, part, "chinos")
    shapes += tube(knee, ankle + np.array([0, 1.0, 0]), 4.8, 4.7, part, "chinos")
    # sneaker in the foot's own frame: x across, y up, z toward the toe
    R = rot_x(-pr)

    def shoe_paint(local):
        m = np.full(len(local), code("shoe"))
        m[local[:, 1] < -1.1] = code("sole")
        return m
    centre = ankle + R @ np.array([0.0, -0.6, (TOE - HEEL) / 2])
    shapes.append(superbox(centre, (4.6, 3.1, (TOE + HEEL) / 2 + 0.9), R, part, "shoe", power=2.6,
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
    shapes += tube(sh + np.array([0, 0.4, 0]), end, 4.0, 4.6, part, "shirt", caps=(True, False))
    cuff_a = sh + R_up @ np.array([0, -UPPER * 0.62, 0])
    shapes += tube(cuff_a, end, 4.85, 4.85, part, "shirt", caps=(False, False),
                   paint=lambda t, ang: np.where(t < 0.3, code("shirt", 1), code("shirt", 2)))
    shapes += tube(end, wrist, 3.5, 3.3, part, "skin", caps=(False, True))
    shapes.append(ellipsoid(fist, (3.9, 4.1, 3.9), part, "skin", R=R_fore))
    return shapes


def torso_shapes(pose):
    lift = pose.lift
    shapes = [loft(HEM + lift, 45.6 + lift, lambda y: torso_half(y - lift), "torso", "shirt",
                   paint=lambda P, N: shirt_paint(P - np.array([0, lift, 0]), N))]
    shapes.append(ellipsoid(np.array([0, 45.2 + lift, -0.6]), (4.4, 3.2, 4.0), "torso", "skin"))   # neck
    # hips under the shirt, joining the legs
    shapes.append(ellipsoid(np.array([0, HIP_Y + 0.8 + lift, 0]), (8.0, 3.0, 5.6), "torso", "chinos"))
    # satchel on his left hip, its flap toward the front left, books inside
    R = rot_y(math.radians(30))
    c = np.array([15.2, 20.2 + lift, -4.0])
    shapes.append(superbox(c, (3.2, 7.0, 7.4), R, "bag", "leather", power=3.0, paint=bag_paint))
    for dz, mat in ((-1.8, "book1"), (0.9, "book2")):
        shapes.append(superbox(c + R @ np.array([-0.2, 6.4, dz]), (1.9, 2.0, 1.5), R, "bag", mat, power=6.0))
    return shapes


# ---------------------------------------------------------------- drawing
def render(direction, k):
    yaw = math.radians(YAW[direction])
    pose = Pose(k)
    shapes = []
    shapes += torso_shapes(pose)
    for side in (+1, -1):
        shapes += leg_shapes(pose, side)
        shapes += arm_shapes(pose, side)
    return draw(shapes, yaw, STYLE), pose, yaw


HEADS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "sprites", "arya", "src",
                     "arya_heads_8dir.png")
_heads = None


def head(direction):
    """The head master for a direction: a full 96 x 128 frame, pivot at 48,116."""
    global _heads
    if _heads is None:
        _heads = np.array(Image.open(HEADS).convert("RGBA"))
    r = DIRS.index(direction)
    return _heads[r * FH:(r + 1) * FH]


# the head masters come from different reference frames: these sit a little
# high on the shoulders and are seated lower, so his height holds as he turns
HEAD_DY = {"NW": 4, "N": 1, "NE": 1}


def frame(direction, k):
    buf, pose, yaw = render(direction, k)
    img = outline(shade(buf, STYLE), buf, STYLE)
    # the head over the body, moved with it by whole pixels
    return paste(img, head(direction), -int(round(pose.lift)) + HEAD_DY.get(direction, 0))


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
        "head_masters": "assets/sprites/arya/src/arya_heads_8dir.png (one per direction, cleaned from his AI reference)",
        "reference": "assets/sprites/arya/reference/arya_ai_*.webp",
    }
    with open(os.path.join(a.out_dir, "arya_sprite.json"), "w") as fh:
        json.dump(meta, fh, indent=2)
    print(f"arya: walk + idle -> {a.out_dir} ({len(used)} colours, {crown} px crown to soles)")


if __name__ == "__main__":
    main()
