#!/usr/bin/env python3
"""Build Arya's walk and idle atlases from his AI reference (converted by pixelfit.py).

The AI walk atlas redraws Arya in every frame, so his face, glasses and bag
shift around, his legs barely step and his arms hang still. Like walkfix.py
does for Indah, this keeps ONE master frame per direction for the head, the
torso and the satchel and redraws what a walk cycle needs:

  * legs in 3D (tools/legs3d.py, style "sneakers"): straight chinos from the
    pelvis, white sneakers, the knee bends and the swing foot lifts with the
    Prompt Sprite phase table (contact A, down A, passing A, contact B, down B,
    passing B); the hips drop on the "down" frames;
  * arms that swing from the shoulder, against the legs: the master's sleeve,
    forearm and fist are lifted out and redrawn as a rolled-sleeve upper arm,
    a forearm and a fist, rotated about the shoulder in 3D and projected with
    the isometric camera, so they swing sideways in the side views and toward
    or away from the camera in the front and back views; the arm on the far
    side passes behind the body;
  * a 1 px body bob (lowest on "down", highest on "passing");
  * crisp 7 x 6 eyes behind round gold glasses, painted at fixed positions on
    the masters (the converted eyes are brown smudges and the thin AI rims
    vanish when resampled).

Usage:
  python3 tools/pixelfit.py assets/sprites/arya/reference/arya_ai_walk_atlas.webp \\
      --height 90 --palette arya --name arya --out <tmp>
  python3 tools/arya_walk.py <tmp>/arya_sprite_8dir.png --out-dir assets/sprites/arya/90
"""
import argparse
import json
import math
import os

import numpy as np
from PIL import Image

from legs3d import render_legs
from pixelfit import DIRS, EYE_KEYS, FH, FW, PALETTES, PIVOT, components, hex2rgb
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
# eye centres on each master: (x, y, near) - the near eye is drawn full, the
# far one (or the only one, in profile) narrow
EYES = {
    "SE": [(47, 58, True), (64, 58, False)],
    "S": [(38, 58, True), (55, 58, True)],
    "SW": [(31, 56, False), (48, 56, True)],
    "W": [(34, 59, False)],
    "E": [(61, 57, False)],
}
CUT = 100               # the master is kept down to the crotch; the legs below are 3D
HIP_Y = 20.0            # hip joints above the ground (model units)
SHOULDER_X = 14.0       # shoulder joints, half the shoulder width
SHOULDER_Y = 40.5
UPPER, FORE = 8.8, 8.8  # shoulder to elbow, elbow to the middle of the fist
R_SLEEVE, R_FORE, R_FIST = 3.8, 2.6, 3.4
SWING = 22              # degrees each way, against the legs
BEND = 8                # elbow bend, degrees (a little more on the forward swing)
LIGHT2 = np.array([-0.6, -0.8])


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


def project(p, yaw, dx, bob):
    """Model point (x right, y up, z forward) -> (screen x, screen y, depth toward the camera)."""
    a = math.radians(yaw)
    X = p[0] * math.cos(a) + p[2] * math.sin(a)
    Z = -p[0] * math.sin(a) + p[2] * math.cos(a)
    return PIVOT[0] + dx + X, PIVOT[1] - p[1] * math.cos(ELEV) + Z * math.sin(ELEV) + bob, Z


def arm_joints(sgn, swing):
    """Shoulder, elbow and fist (model space) of the arm on side sgn (+1 = his left)."""
    t = math.radians(swing)
    t2 = t + math.radians(BEND + max(0.0, swing) * 0.3)
    abd = math.radians(5)
    sh = np.array([sgn * SHOULDER_X, SHOULDER_Y, 0.0])
    el = sh + UPPER * np.array([sgn * math.sin(abd), -math.cos(t) * math.cos(abd), math.sin(t) * math.cos(abd)])
    fi = el + FORE * np.array([sgn * math.sin(abd), -math.cos(t2) * math.cos(abd), math.sin(t2) * math.cos(abd)])
    return sh, el, fi


def swing_of(sgn, k):
    """Arm swing (degrees, + = forward) for walk frame k; None = standing."""
    if k is None:
        return 0.0
    s = math.cos(2 * math.pi * k / 6)                   # +1 = left leg forward, so the right arm leads
    return SWING * (-s if sgn > 0 else s)


def segment(gx, gy, a, b):
    vx, vy = b[0] - a[0], b[1] - a[1]
    t = np.clip(((gx - a[0]) * vx + (gy - a[1]) * vy) / max(vx * vx + vy * vy, 1e-6), 0, 1)
    px, py = a[0] + t * vx, a[1] + t * vy
    return np.hypot(gx - px, gy - py), t, gx - px, gy - py


def draw_arm(canvas, joints):
    """Rolled-sleeve upper arm, forearm and fist between projected joints, toon shaded."""
    (sx, sy), (ex, ey), (fx, fy) = joints
    gy, gx = np.mgrid[0:FH, 0:FW] + 0.5                 # pixel centres
    d_s, t_s, ox_s, oy_s = segment(gx, gy, (sx, sy), (ex, ey))
    d_f, _, ox_f, oy_f = segment(gx, gy, (ex, ey), (fx, fy))
    d_h = np.hypot(gx - fx, gy - fy)
    sleeve = d_s <= R_SLEEVE
    fore = (d_f <= R_FORE) & ~sleeve
    fist = (d_h <= R_FIST) & ~sleeve
    limb = sleeve | fore | fist

    def tone(ox, oy, d):
        n = (ox * LIGHT2[0] + oy * LIGHT2[1]) / np.maximum(d, 1e-6)
        return np.where(d < 0.8, 2, np.where(n > 0.45, 3, np.where(n < -0.35, 1, 2)))
    # outline where the arm stands against the background; over the body a
    # shading line in the arm's own colour, so it does not cut the shirt in two
    ring = grow(limb, 1) & ~limb
    behind = canvas[..., 3] > 0
    canvas[ring & ~behind, :3] = rgb("outline", 0)
    canvas[ring & behind & grow(sleeve, 1), :3] = rgb("shirt", 0)
    canvas[ring & behind & ~grow(sleeve, 1), :3] = rgb("skin", 0)
    canvas[ring, 3] = 255
    t_skin = np.where(fist, tone(gx - fx, gy - fy, d_h), tone(ox_f, oy_f, d_f))
    for i in (1, 2, 3):
        sel = (fore | fist) & (t_skin == i)
        canvas[sel, :3] = rgb("skin", i)
    t_sh = tone(ox_s, oy_s, d_s)
    for i in (1, 2, 3):
        canvas[sleeve & (t_sh == i), :3] = rgb("shirt", i)
    cuff = sleeve & (t_s > 0.7)
    canvas[cuff, :3] = rgb("shirt", 3)
    canvas[sleeve & (t_s > 0.6) & (t_s <= 0.7), :3] = rgb("shirt", 0)  # the fold of the rolled sleeve
    canvas[limb, 3] = 255


def torso_dx(img):
    """Horizontal offset of the torso from the pivot, from the shirt between the shoulders and the hem."""
    shirt = mask_of(img, colour_set(PAL, "shirt"))
    shirt[: CUT - 28] = False
    shirt[CUT - 12:] = False
    xs = np.nonzero(shirt)[1]
    return int(round(np.median(xs) + 0.5 - PIVOT[0])) if len(xs) else 0


def find_hands(img):
    """Forearm-and-fist skin blobs of the master: list of (mask, elbow (x, y))."""
    lab, n = components(mask_of(img, colour_set(PAL, "skin")))
    hands = []
    for i in range(1, n + 1):
        comp = lab == i
        yy, xx = np.nonzero(comp)
        if len(yy) >= 25 and yy.min() > CUT - 22:
            top = yy <= yy.min() + 1
            hands.append((comp, (float(xx[top].mean()) + 0.5, float(yy.min()))))
    return sorted(hands, key=lambda h: h[1][0])


def shoulders(hands, yaw, dx):
    """Screen shoulder of each arm: at the model's shoulder height, and right
    above the master's elbow where that arm shows.
    Returns {sgn: ((x, y), depth, shows in the master)}."""
    out = {}
    for sgn in (+1, -1):
        sh, el, _ = arm_joints(sgn, 0.0)
        sx, sy, z = project(sh, yaw, dx, 0)
        ex, ey, _ = project(el, yaw, dx, 0)
        out[sgn] = [(sx, sy), z, (ex, ey)]
    order = sorted(out, key=lambda sgn: out[sgn][2][0])           # screen left to right
    if len(hands) >= 2:
        pairs = zip(order, (hands[0], hands[-1]))
    elif hands:
        best = min(out, key=lambda sgn: abs(out[sgn][2][0] - hands[0][1][0]))
        pairs = [(best, hands[0])]
    else:
        pairs = []
    seen = set()
    for sgn, (_, (ex, ey)) in pairs:
        (sx, sy), z, (mx, my) = out[sgn]
        out[sgn][0] = (ex + (sx - mx), sy)          # the master decides how far out the arm hangs
        seen.add(sgn)
    return {sgn: (tuple(v[0]), v[1], sgn in seen) for sgn, v in out.items()}


def prepare(master, direction):
    """Master -> (body layer without arms or legs, torso offset, shoulders)."""
    img = drop_islands(master)
    if direction in EYES:
        img = paint_eyes(img, EYES[direction])
    dx = torso_dx(img)
    yaw = YAW[direction]
    hands = find_hands(img)
    sh = shoulders(hands, yaw, dx)
    # lift out the forearms and fists, with the outline and the dark shading
    # the resampling left around them ...
    dark = mask_of(img, colour_set(PAL, "outline", "lips")) | mask_of(img, {tuple(rgb("hair", 0))})
    lab, n = components(mask_of(img, colour_set(PAL, "leather")))
    sizes = np.bincount(lab.ravel())
    dark |= (lab > 0) & (sizes[lab] < 30)           # dark leather specks, but not the satchel
    hole = np.zeros(img.shape[:2], bool)
    for comp, _ in hands:
        hole |= comp | (grow(comp, 2) & dark)
    # ... and the sleeves: of the near arms, and of any arm whose hand shows
    gy, gx = np.mgrid[0:FH, 0:FW] + 0.5
    cloth = mask_of(img, colour_set(PAL, "shirt", "outline", "skin"))
    for sgn, ((sx, sy), z, seen) in sh.items():
        if z < -2 and not seen:
            continue
        ex, ey = joints_at((sx, sy), sgn, yaw, 0.0)[1]
        d, t, _, _ = segment(gx, gy, (sx, sy), (ex, ey))
        hole |= (d <= R_SLEEVE + 0.5) & (t > 0.25) & cloth
    # what was arm outside the body becomes background; only pixels with body
    # on both sides of them in their row are filled in from their neighbours
    body = img.copy()
    body[hole] = 0
    solid = body[..., 3] > 0
    left = np.maximum.accumulate(solid, axis=1)
    right = np.maximum.accumulate(solid[:, ::-1], axis=1)[:, ::-1]
    inside = hole & left & right
    body = fill_holes(body, inside)
    # shirt filled in where a sleeve was gets the shirt's plain tone, not the
    # copied folds of its neighbours
    plain = mask_of(img, colour_set(PAL, "shirt")) & ~hole
    tones = [mask_of(img, {tuple(rgb("shirt", i))}) & plain for i in range(4)]
    flat = int(np.argmax([t.sum() for t in tones]))
    body[inside & mask_of(body, colour_set(PAL, "shirt")), :3] = rgb("shirt", flat)
    # the trousers are all 3D: drop the master's, with the outline that only
    # bordered them (the shirt hem keeps its line)
    lab, n = components(mask_of(body, colour_set(PAL, "chinos")), conn8=False)
    for i in range(1, n + 1):
        comp = lab == i
        yy = np.nonzero(comp)[0]
        if len(yy) >= 25 and yy.max() >= CUT - 6:        # not the beige shading inside the shirt
            body[comp] = 0
    line = mask_of(body, colour_set(PAL, "outline"))
    kept = (body[..., 3] > 0) & ~line
    body[line & ~grow(kept, 1)] = 0
    # below the crotch only the satchel stays: the leather (with its highlights)
    # that hangs down from above the cut, and its outline
    low = np.zeros(hole.shape, bool)
    low[CUT + 1:] = True
    near_cut = np.zeros(hole.shape, bool)
    near_cut[CUT - 4:CUT + 1] = True
    leather = mask_of(body, colour_set(PAL, "leather", "skin", "hair"))
    leather[: CUT - 14] = False
    lab, n = components(leather)
    bag = np.zeros(hole.shape, bool)
    for i in range(1, n + 1):
        comp = lab == i
        if comp.sum() >= 15 and (comp & near_cut).any():
            bag |= comp
    bag &= low
    bag |= grow(bag, 1) & mask_of(body, colour_set(PAL, "outline")) & low
    body[low & ~bag] = 0
    return drop_islands(body), dx, sh


def joints_at(shoulder, sgn, yaw, swing, bob=0):
    """Screen shoulder, elbow and fist for a swing, hung from a screen shoulder."""
    pts = [project(p, yaw, 0, 0) for p in arm_joints(sgn, swing)]
    ox, oy = shoulder[0] - pts[0][0], shoulder[1] - pts[0][1] + bob
    return [(x + ox, y + oy) for x, y, _ in pts]


def frame(body, dx, sh, direction, k):
    """One frame: k = walk frame 0-5, or None for the standing (idle) pose."""
    bob = BOB[k] if k is not None else 0
    yaw = YAW[direction]
    legs = render_legs(yaw, k, PAL, style="sneakers", hip_y=HIP_Y - bob / math.cos(ELEV))
    canvas = np.roll(legs, dx, axis=1)
    arms = [(z, joints_at(s, sgn, yaw, swing_of(sgn, k), bob)) for sgn, (s, z, _) in sh.items()]
    for z, joints in arms:
        if z < -2:
            draw_arm(canvas, joints)                     # the far arm passes behind the body
    layer = np.roll(body, bob, axis=0)
    m = layer[..., 3] > 0
    canvas[m] = layer[m]
    for z, joints in arms:
        if z >= -2:
            draw_arm(canvas, joints)
    return outline(despike(canvas), PAL)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("atlas", help="pixelfit.py output (6 x 8 frames)")
    ap.add_argument("--out-dir", required=True)
    a = ap.parse_args()
    src = np.array(Image.open(a.atlas).convert("RGBA"))
    rows, idle, heights = [], [], {}
    for r, d in enumerate(DIRS):
        c = MASTERS[d]
        body, dx, sh = prepare(src[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW], d)
        rows.append(np.concatenate([frame(body, dx, sh, d, k) for k in range(6)], 1))
        still = frame(body, dx, sh, d, None)
        idle.append(still)
        ys = np.nonzero((still[..., 3] > 0).any(1))[0]
        heights[d] = int(ys.max() - ys.min() + 1)
    walk = np.concatenate(rows, 0)
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
        "height_px": 90,
        "height_note": "crown to soles; the cowlick sticks out above it",
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
            "--height 90 --palette arya --name arya --out <tmp>",
            "python3 tools/arya_walk.py <tmp>/arya_sprite_8dir.png --out-dir assets/sprites/arya/90",
        ],
    }
    with open(os.path.join(a.out_dir, "arya_sprite.json"), "w") as fh:
        json.dump(meta, fh, indent=2)
    print(f"arya: walk + idle -> {a.out_dir} ({len(used)} colours)")


if __name__ == "__main__":
    main()
