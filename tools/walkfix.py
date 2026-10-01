#!/usr/bin/env python3
"""Rebuild a walk atlas so it steps instead of gliding, and stops flickering.

AI walk atlases redraw the whole character in every frame, so hair, face and
accessories shift from frame to frame, and the feet barely move. This tool
keeps ONE master frame per direction for everything above the skirt hem and
redraws only what a walk cycle needs:

  * the feet and shins, placed with the Prompt Sprite phase table
    (contact A, down A, passing A, contact B, down B, passing B): the feet
    swap sides, the swing foot lifts, front views put the forward foot lower
    on screen and side views spread the stride horizontally;
  * a 1 px body bob (lowest on the "down" frames, highest on "passing");
  * three hair masters per direction (neutral, swung left, swung right) that
    swing more toward the tips, so the long hair sways instead of hanging stiff;
  * arms that swing against the legs: the master's hands are lifted out,
    moved along the swing arc and reconnected to the sleeve with a forearm.

The sandals are drawn pixel by pixel in the reference's leather and skin
tones, with a pattern per view (front, back, side, front and back 3/4).

Usage:
  python3 tools/walkfix.py IN_ATLAS.png --out OUT_ATLAS.png [--masters 5,2,4,1,4,2,3,5]
"""
import argparse
import math

import numpy as np
from PIL import Image

from pixelfit import DIRS, FH, FW, PALETTES, PIVOT, components, hex2rgb

ELEV = math.radians(24)
YAW = {"S": 0, "SE": 45, "E": 90, "NE": 135, "N": 180, "NW": -135, "W": -90, "SW": -45}
BOB = [0, 1, -1, 0, 1, -1]            # screen px, + is down: lowest on "down", highest on "passing"
HAIR_SEQ = [-1, 0, 1, 1, 0, -1]       # which of the 3 hair masters each walk frame uses (a slow pendulum)
HAIR_AMP = {"S": 1.5, "N": 1.5, "SE": 2.0, "SW": 2.0, "NE": 2.0, "NW": 2.0, "E": 2.5, "W": 2.5}
ARM_SWING = 22                        # degrees each way
ARM_LEN = 12.0                        # shoulder to fist, art px


def colour_set(palette, *keys):
    return {tuple(hex2rgb(c)) for k in keys for c in PALETTES[palette][k]}


def mask_of(img, cols):
    rgb = img[..., :3]
    m = np.zeros(img.shape[:2], bool)
    for c in cols:
        m |= np.all(rgb == c, axis=-1)
    return m & (img[..., 3] > 0)


def split_master(img, palette):
    """Cut the master frame at the skirt hem; returns (upper body, hem row per column)."""
    light = {tuple(hex2rgb(c)) for c in PALETTES[palette]["skirt"][2:]}
    skirt = mask_of(img, light)
    alpha = img[..., 3] > 0
    ys = np.nonzero(alpha.any(1))[0]
    lower = np.zeros_like(alpha)
    lower[(ys.min() + ys.max()) // 2:] = True
    skirt &= lower
    hem = np.full(FW, -1)
    for x in range(FW):
        col = np.nonzero(skirt[:, x])[0]
        if len(col):
            hem[x] = col.max()
    cols = np.nonzero(hem >= 0)[0]
    # smooth the hem so a foot that covered it in the master leaves no notch
    smooth = hem.copy()
    for x in cols:
        left = hem[max(0, x - 3):x]
        right = hem[x + 1:x + 4]
        if (left >= 0).any() and (right >= 0).any():
            smooth[x] = max(hem[x], min(left.max(), right.max()))
    upper = img.copy()
    fill = np.array(hex2rgb(PALETTES[palette]["skirt"][3]))
    out = np.array(hex2rgb(PALETTES[palette]["outline"][0]))
    hem_top = int(smooth[cols].min())
    for x in range(FW):
        if smooth[x] >= 0:
            for y in range(hem[x] + 1, smooth[x] + 1):
                upper[y, x, :3] = fill
                upper[y, x, 3] = 255
            upper[smooth[x] + 1, x, :3] = out
            upper[smooth[x] + 1, x, 3] = 255
            upper[smooth[x] + 2:, x] = 0
        else:
            upper[hem_top + 1:, x] = 0
    return upper, smooth, hem_top


# Sandals drawn pixel by pixel in the reference's leather tones.
# K outline, D dark leather, L leather, H light leather, s skin, z skin shadow
SANDALS = {
    "front": ["..KKKKK..",
              ".KDHHHDK.",
              "KsHHDHHsK",
              "KssHHHssK",
              "KszsssszK",
              "KDDDDDDDK",
              ".KKKKKKK."],
    "back": ["..KKKKK..",
             ".KzsssszK",
             "KDHHHHHDK",
             "KsszzzssK",
             "KLHHHHHLK",
             "KDDDDDDDK",
             ".KKKKKKK."],
    "side": ["..KKKK....",
             ".KDHHDKK..",
             "KsHHDHssK.",
             "KsHHHHsszK",
             "KDDDDDDDDK",
             ".KKKKKKKK."],
    "front34": ["..KKKKK...",
                ".KDHHHDKK.",
                "KsHHDHHssK",
                "KssHHHsszK",
                "KszssssszK",
                "KDDDDDDDDK",
                ".KKKKKKKK."],
    "back34": ["..KKKKK..",
               ".KDHHHDK.",
               "KzsHHHHsK",
               "KssLHHHHK",
               "KLLLLLLLK",
               "KDDDDDDDK",
               ".KKKKKKK."],
}
SANDAL_KEYS = {"K": ("outline", 0), "D": ("leather", 1), "L": ("leather", 2), "H": ("leather", 3),
               "s": ("skin", 2), "z": ("skin", 1)}


def sandal_for(direction):
    """Sandal pattern for a facing direction (toes point the way she walks)."""
    if direction == "S":
        return SANDALS["front"]
    if direction == "N":
        return SANDALS["back"]
    if direction in ("E", "W"):
        p = SANDALS["side"]
        return p if direction == "E" else [r[::-1] for r in p]
    if direction in ("SE", "SW"):
        p = SANDALS["front34"]
        return [r[::-1] for r in p] if direction == "SE" else p
    p = SANDALS["back34"]
    return [r[::-1] for r in p] if direction == "NW" else p


def draw_pattern(canvas, pat, x0, y0, palette, keys):
    for j, row in enumerate(pat):
        for i, ch in enumerate(row):
            Y, X = y0 + j, x0 + i
            if ch == "." or not (0 <= Y < FH and 0 <= X < FW):
                continue
            key, r = keys[ch]
            canvas[Y, X, :3] = hex2rgb(PALETTES[palette][key][r])
            canvas[Y, X, 3] = 255


def foot_positions(direction, k, hip=3.8, stride=6.0, lift=3.0):
    """Screen offsets (dx, dy, depth) of the left and right foot for frame k."""
    ph = 2 * math.pi * k / 6
    s = math.cos(ph)
    feet = []
    for sgn, z, up in ((+1, stride * s, lift * max(0.0, -math.sin(ph))),
                       (-1, -stride * s, lift * max(0.0, math.sin(ph)))):
        a = math.radians(YAW[direction])
        x0 = sgn * hip
        wx = x0 * math.cos(a) + z * math.sin(a)
        wz = -x0 * math.sin(a) + z * math.cos(a)
        dy = -(up * math.cos(ELEV) - wz * math.sin(ELEV))
        feet.append((wx, dy, wz, up))
    return feet


def shin(canvas, x, y_top, y_bot, palette):
    out = hex2rgb(PALETTES[palette]["outline"][0])
    skin = PALETTES[palette]["skin"]
    cols = [out, hex2rgb(skin[3]), hex2rgb(skin[2]), hex2rgb(skin[1]), out]
    for y in range(max(0, y_top), min(FH, y_bot)):
        for i, c in enumerate(cols):
            xx = x - 2 + i
            if 0 <= xx < FW and canvas[y, xx, 3] == 0:
                canvas[y, xx, :3] = c
                canvas[y, xx, 3] = 255


def outline(img, palette):
    a = img[..., 3] > 0
    edge = np.zeros_like(a)
    for s, ax in ((1, 0), (-1, 0), (1, 1), (-1, 1)):
        edge |= ~np.roll(a, s, ax)
    img[a & edge, :3] = hex2rgb(PALETTES[palette]["outline"][0])
    return img


def erase_clip(img, palette):
    """Paint the wooden hair clip over with hair (where the clip side faces away)."""
    ys = np.nonzero((img[..., 3] > 0).any(1))[0]
    head = np.zeros(img.shape[:2], bool)
    head[: ys.min() + 30] = True
    region = mask_of(img, colour_set(palette, "wood")) & head
    warm = mask_of(img, colour_set(palette, "wood", "skin", "leather", "eye", "skirt", "lips", "cord")) & head
    for _ in range(3):                      # grow into the clip's warm edge pixels
        grown = region.copy()
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                grown |= np.roll(np.roll(region, dy, 0), dx, 1)
        region = grown & warm
    img = img.copy()
    img[region, :3] = hex2rgb(PALETTES[palette]["hair"][1])
    return img


def standing(frames, direction, master, palette, hide_clip=False):
    """Idle pose for the anchor: feet side by side, no bob."""
    m = frames[master]
    if hide_clip:
        m = erase_clip(m, palette)
    upper, hem, hem_top = split_master(m, palette)
    pat = sandal_for(direction)
    ph, pw = len(pat), len(pat[0])
    canvas = np.zeros((FH, FW, 4), np.uint8)
    a = math.radians(YAW[direction])
    feet = sorted(((sgn * 3.8 * math.cos(a), -sgn * 3.8 * math.sin(a)) for sgn in (1, -1)),
                  key=lambda f: f[1])
    for wx, wz in feet:
        fx = PIVOT[0] + wx
        sole = int(round(PIVOT[1] - 1 + wz * math.sin(ELEV)))
        sx = int(round(fx))
        top = hem[sx] if 0 <= sx < FW and hem[sx] >= 0 else sole - ph + 2
        shin(canvas, sx, top, sole - ph + 2, palette)
        draw_pattern(canvas, pat, int(round(fx - pw / 2)), sole - ph + 1, palette, SANDAL_KEYS)
    mask = upper[..., 3] > 0
    canvas[mask] = upper[mask]
    return outline(despike(canvas), palette)


def grow(m, r=1):
    """Dilate a mask by r pixels (4-neighbourhood)."""
    out = m.copy()
    for _ in range(r):
        p = np.pad(out, 1)
        out = p[1:-1, 1:-1] | p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]
    return out


def fill_holes(img, hole):
    """Fill vacated pixels from the surrounding colours (or clear them outside the body)."""
    out = img.copy()
    known = ~hole
    todo = hole.copy()
    while todo.any():
        newly = []
        for y, x in zip(*np.nonzero(todo)):
            votes = {}
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if (dy or dx) and 0 <= yy < FH and 0 <= xx < FW and known[yy, xx]:
                        key = tuple(int(v) for v in out[yy, xx]) if out[yy, xx, 3] else None
                        votes[key] = votes.get(key, 0) + 1
            if not votes:
                continue
            clear = votes.pop(None, 0)
            if not votes or clear > sum(votes.values()):
                newly.append((y, x, None))
                continue
            # prefer real surface colours over outline pixels, so lines do not spread
            surface = {c: v for c, v in votes.items() if sum(c[:3]) > 90} or votes
            newly.append((y, x, max(surface, key=surface.get)))
        if not newly:
            break
        for y, x, c in newly:
            out[y, x] = 0 if c is None else c
            known[y, x] = True
            todo[y, x] = False
    out[todo] = 0
    return out


def head_rows(img, palette):
    """(top row, chin row or None when the face is turned away)."""
    ys = np.nonzero((img[..., 3] > 0).any(1))[0]
    top, bot = ys.min(), ys.max()
    head = np.zeros(img.shape[:2], bool)
    head[top:top + int(0.4 * (bot - top))] = True
    lab, n = components(mask_of(img, colour_set(palette, "skin")) & head, conn8=False)
    if n == 0:
        return top, None
    sizes = np.bincount(lab.ravel())[1:]
    if sizes.max() < 60:
        return top, None
    return top, int(np.nonzero((lab == sizes.argmax() + 1).any(1))[0].max())


def hair_variants(body, direction, palette):
    """Three hair masters: -1, 0, +1 = swung one way, neutral, swung the other way."""
    hair = mask_of(body, colour_set(palette, "hair"))
    line = mask_of(body, colour_set(palette, "outline"))
    other = (body[..., 3] > 0) & ~hair & ~line
    touches_other = np.zeros_like(other)
    for s, ax in ((1, 0), (-1, 0), (1, 1), (-1, 1)):
        touches_other |= np.roll(other, s, ax)
    top, chin = head_rows(body, palette)
    ys = np.nonzero((body[..., 3] > 0).any(1))[0]
    y0 = chin - 6 if chin is not None else top + int(0.3 * (ys.max() - top))
    movable = (hair | (line & ~touches_other))
    movable[:y0] = False
    tip = int(np.nonzero(hair.any(1))[0].max())
    variants = {0: body}
    for state in (-1, 1):
        out = fill_holes(body, movable)
        for y in range(y0, FH):
            w = min(1.0, max(0.0, (y - y0) / max(1, tip - y0))) ** 1.2
            dx = int(round(state * HAIR_AMP[direction] * w))
            for x in np.nonzero(movable[y])[0]:
                if 0 <= x + dx < FW:
                    out[y, x + dx] = body[y, x]
        variants[state] = out
    return variants


def split_hands(body, palette, hem_top):
    """Lift the forearms and fists out of the master; returns (body, hands)."""
    skin = mask_of(body, colour_set(palette, "skin"))
    line = mask_of(body, colour_set(palette, "outline"))
    # dark shading pixels the resampling left around the fists
    dark = mask_of(body, colour_set(palette, "eye", "lips", "leather", "cord")) | \
        mask_of(body, {tuple(hex2rgb(PALETTES[palette]["skirt"][0]))})
    top = int(np.nonzero((body[..., 3] > 0).any(1))[0].min())
    lab, n = components(skin)
    hands, hole = [], np.zeros(skin.shape, bool)
    for i in range(1, n + 1):
        comp = lab == i
        yy, xx = np.nonzero(comp)
        if len(yy) < 12 or yy.min() - top < 0.62 * (hem_top - top):
            continue
        t = yy.min()
        low = yy >= yy.max() - 4
        hands.append(dict(cx=float(xx.mean()),
                          attach=(float(xx[yy <= t + 1].mean()), float(t)),
                          fist=(float(xx[low].mean()), float(yy[low].mean()))))
        hole |= comp | (grow(comp, 2) & (line | dark))
    return fill_holes(body, hole), hands


def hand_offsets(direction, k):
    """Per hand (+1 her left, -1 her right): (rest screen x, depth, dx, dy) for walk frame k."""
    s = math.cos(2 * math.pi * k / 6)          # +1 = left leg forward, so the right arm swings forward
    a = math.radians(YAW[direction])
    res = {}
    for sgn in (+1, -1):
        t = math.radians(ARM_SWING * (-s if sgn == +1 else s))
        dz = ARM_LEN * math.sin(t)
        up = ARM_LEN * (1 - math.cos(t))
        hx = sgn * 7.0
        res[sgn] = (hx * math.cos(a), -hx * math.sin(a) + dz * math.cos(a),
                    dz * math.sin(a), -(up * math.cos(ELEV) - dz * math.cos(a) * math.sin(ELEV)))
    return res


def assign_hands(hands, offs):
    """Match the hands found in the master to her left / right hand."""
    if not hands:
        return []
    order = sorted(offs, key=lambda sgn: offs[sgn][0])            # screen left to right
    if len(hands) >= 2:
        hs = sorted(hands, key=lambda h: h["cx"])[:2]
        return list(zip(hs, order))
    h = hands[0]
    near = max(offs, key=lambda sgn: offs[sgn][1])
    best = min(offs, key=lambda sgn: abs(offs[sgn][0] - (h["cx"] - PIVOT[0])))
    return [(h, best if abs(offs[best][0] - offs[near][0]) > 3 else near)]


def draw_hand(canvas, hand, dx, dy, palette):
    """Forearm from the sleeve to the fist, the fist moved by (dx, dy) along the swing."""
    ax, ay = hand["attach"]
    fx, fy = hand["fist"][0] + dx, hand["fist"][1] + dy
    yy, xx = np.mgrid[0:FH, 0:FW]
    # distance to the forearm segment, and to the fist
    vx, vy = fx - ax, fy - ay
    t = np.clip(((xx - ax) * vx + (yy - ay) * vy) / max(vx * vx + vy * vy, 1e-6), 0, 1)
    d_arm = np.hypot(xx - (ax + t * vx), yy - (ay + t * vy))
    d_fist = np.hypot(xx - fx, yy - fy)
    limb = (d_arm <= 1.25) | (d_fist <= 2.6)
    ring = grow(limb, 1) & ~limb
    skin = PALETTES[palette]["skin"]
    canvas[ring, :3] = hex2rgb(PALETTES[palette]["outline"][0])
    canvas[ring, 3] = 255
    canvas[limb, :3] = hex2rgb(skin[2])
    canvas[limb & (xx - fx + yy - fy > 1.5) & (d_fist <= 2.6), :3] = hex2rgb(skin[1])
    canvas[limb & (xx - fx + yy - fy < -2.0) & (d_fist <= 2.6), :3] = hex2rgb(skin[3])
    canvas[limb, 3] = 255


def build_row(frames, direction, master, palette, hide_clip=False):
    m = frames[master]
    if hide_clip:
        m = erase_clip(m, palette)
    upper, hem, hem_top = split_master(m, palette)
    body, hands = split_hands(upper, palette, hem_top)
    hair = hair_variants(body, direction, palette)
    pat = sandal_for(direction)
    ph, pw = len(pat), len(pat[0])
    out = []
    for k in range(6):
        canvas = np.zeros((FH, FW, 4), np.uint8)
        feet = foot_positions(direction, k)
        near = max(range(2), key=lambda i: feet[i][2])
        body_k = np.roll(hair[HAIR_SEQ[k]], BOB[k], axis=0)
        layers = []
        for i in (1 - near, near):                                   # far foot first
            wx, dy, wz, up = feet[i]
            fx = PIVOT[0] + wx
            sole = int(round(PIVOT[1] - 1 + dy))                      # bottom row of the sole
            sx = int(round(fx))
            top = hem[sx] + BOB[k] if 0 <= sx < FW and hem[sx] >= 0 else sole - ph + 2
            layers.append((sx, top, sole, int(round(fx - pw / 2))))
        offs = hand_offsets(direction, k)
        placed = []
        for h, sgn in assign_hands(hands, offs):
            rest_x, depth, dx, dy = offs[sgn]
            moved = dict(h, attach=(h["attach"][0], h["attach"][1] + BOB[k]),
                         fist=(h["fist"][0], h["fist"][1] + BOB[k]))
            placed.append((depth, moved, int(round(dx)), int(round(dy))))
        placed.sort(key=lambda p: p[0])
        # far foot, shins and the hand swinging back go under the body
        for sx, top, sole, x0 in layers:
            shin(canvas, sx, top, sole - ph + 2, palette)
        sx, top, sole, x0 = layers[0]
        draw_pattern(canvas, pat, x0, sole - ph + 1, palette, SANDAL_KEYS)
        for depth, h, dx, dy in placed:
            if depth < 0:
                draw_hand(canvas, h, dx, dy, palette)
        mask = body_k[..., 3] > 0
        canvas[mask] = body_k[mask]
        for depth, h, dx, dy in placed:
            if depth >= 0:
                draw_hand(canvas, h, dx, dy, palette)
        sx, top, sole, x0 = layers[1]
        draw_pattern(canvas, pat, x0, sole - ph + 1, palette, SANDAL_KEYS)
        out.append(outline(despike(canvas), palette))
    return out


def despike(img):
    """Drop 1 px wide vertical slivers left under the hem."""
    a = img[..., 3] > 0
    for _ in range(3):
        lone = a & ~np.roll(a, 1, 1) & ~np.roll(a, -1, 1)
        lone[: FH // 2] = False
        if not lone.any():
            break
        img[lone] = 0
        a = img[..., 3] > 0
    return img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("atlas")
    ap.add_argument("--out", required=True)
    ap.add_argument("--palette", default="indah")
    ap.add_argument("--masters", default="5,2,4,1,4,2,3,5",
                    help="master frame per row, in row order SE,S,SW,W,NW,N,NE,E")
    ap.add_argument("--hide-clip", default="NE,E", help="rows where the hair clip is on the hidden side")
    ap.add_argument("--idle", help="also write a standing (idle) atlas, one frame per direction")
    a = ap.parse_args()
    src = np.array(Image.open(a.atlas).convert("RGBA"))
    masters = [int(v) for v in a.masters.split(",")]
    hide = set(a.hide_clip.split(",")) if a.hide_clip else set()
    rows = []
    for r, d in enumerate(DIRS):
        frames = [src[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW] for c in range(6)]
        rows.append(np.concatenate(build_row(frames, d, masters[r], a.palette, d in hide), 1))
    Image.fromarray(np.concatenate(rows, 0)).save(a.out, optimize=True)
    print("walk atlas ->", a.out)
    if a.idle:
        tiles = []
        for r, d in enumerate(DIRS):
            frames = [src[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW] for c in range(6)]
            tiles.append(standing(frames, d, masters[r], a.palette, d in hide))
        Image.fromarray(np.concatenate(tiles, 0)).save(a.idle, optimize=True)
        print("idle atlas ->", a.idle)


if __name__ == "__main__":
    main()
