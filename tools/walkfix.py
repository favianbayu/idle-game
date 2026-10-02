#!/usr/bin/env python3
"""Rebuild a walk atlas so it steps instead of gliding, and stops flickering.

AI walk atlases redraw the whole character in every frame, so hair, face and
accessories shift from frame to frame, and the feet barely move. This tool
keeps ONE master frame per direction for everything above the skirt hem and
redraws only what a walk cycle needs:

  * real legs below the hem, rendered in 3D like Arya's (tools/legs3d.py):
    the knee bends, the swing foot lifts, feet swap sides with the Prompt
    Sprite phase table (contact A, down A, passing A, contact B, down B,
    passing B) and the sandals are rounded with straps and toes;
  * a skirt that moves: its lower part swings with the steps and the hem
    rides up on one side and drops on the other;
  * a 1 px body bob (lowest on the "down" frames, highest on "passing");
  * three hair masters per direction (neutral, swung left, swung right) that
    swing more toward the tips, so the long hair sways instead of hanging stiff;
  * arms that swing against the legs: the master's hands are lifted out,
    moved along the swing arc and reconnected to the sleeve with a forearm.

Usage:
  python3 tools/walkfix.py IN_ATLAS.png --out OUT_ATLAS.png [--masters 5,2,4,1,4,2,3,5]
"""
import argparse
import math

import numpy as np
from PIL import Image

from legs3d import render_legs
from pixelfit import DIRS, FH, FW, PALETTES, PIVOT, components, hex2rgb

ELEV = math.radians(24)
YAW = {"S": 0, "SE": 45, "E": 90, "NE": 135, "N": 180, "NW": -135, "W": -90, "SW": -45}
BOB = [0, 1, -1, 0, 1, -1]            # screen px, + is down: lowest on "down", highest on "passing"
HAIR_SEQ = [-1, 0, 1, 1, 0, -1]       # which of the 3 hair masters each walk frame uses (a slow pendulum)
HAIR_AMP = {"S": 1.5, "N": 1.5, "SE": 2.0, "SW": 2.0, "NE": 2.0, "NW": 2.0, "E": 2.5, "W": 2.5}
SKIRT_AMP = {"S": 1.5, "N": 1.5, "SE": 2.0, "SW": 2.0, "NE": 2.0, "NW": 2.0, "E": 2.5, "W": 2.5}
SKIRT_TILT = 1.5                      # px the hem rides up on one side and drops on the other
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
    canvas = render_legs(YAW[direction], None, palette)
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


def split_skirt(body, palette):
    """Separate the skirt (with its outline) from the rest of the body."""
    sk = mask_of(body, colour_set(palette, "skirt"))
    ys = np.nonzero((body[..., 3] > 0).any(1))[0]
    lower = np.zeros(sk.shape, bool)
    lower[(ys.min() + ys.max()) // 2:] = True
    sk &= lower
    layer = sk | (grow(sk, 1) & mask_of(body, colour_set(palette, "outline")) & lower)
    hem = np.array([np.nonzero(layer[:, x])[0].max() if layer[:, x].any() else -1 for x in range(FW)])
    y_top = int(np.nonzero(sk.any(1))[0].min())
    skirt = np.where(layer[..., None], body, 0).astype(np.uint8)
    rest = np.where(layer[..., None], 0, body).astype(np.uint8)
    return rest, skirt, y_top, hem


def warp_skirt(skirt, y_top, hem, direction, k):
    """Swing the lower skirt with the steps and tilt the hem (front and rear views)."""
    ph = 2 * math.pi * k / 6
    swing = math.sin(ph + math.pi / 6)
    tilt = 0.0 if direction in ("E", "W") else -math.cos(ph)
    cols = np.nonzero(hem >= 0)[0]
    cx, hw = cols.mean(), max(1.0, (cols.max() - cols.min()) / 2)
    bottom = hem[cols].max()
    yo, xo = np.mgrid[0:FH, 0:FW]
    w = np.clip((yo - y_top) / max(1, bottom - y_top), 0, 1) ** 1.6
    xs = xo - np.rint(SKIRT_AMP[direction] * swing * w).astype(int)
    ok = (xs >= 0) & (xs < FW)
    xs = np.clip(xs, 0, FW - 1)
    h = hem[xs]
    ok &= h >= 0
    new_h = h + np.rint(SKIRT_TILT * tilt * (xs - cx) / hw)
    mid = y_top + 0.55 * (h - y_top)
    ys = np.where(yo <= mid, yo, mid + (yo - mid) * (h - mid) / np.maximum(new_h - mid, 1))
    ys = np.rint(ys).astype(int)
    ok &= (ys >= 0) & (ys <= h) & (yo <= new_h)
    out = np.zeros_like(skirt)
    out[ok] = skirt[ys[ok], xs[ok]]
    return out


def build_row(frames, direction, master, palette, hide_clip=False):
    m = frames[master]
    if hide_clip:
        m = erase_clip(m, palette)
    upper, hem, hem_top = split_master(m, palette)
    body, hands = split_hands(upper, palette, hem_top)
    rest, skirt, skirt_top, skirt_hem = split_skirt(body, palette)
    hair = hair_variants(rest, direction, palette)
    out = []
    for k in range(6):
        canvas = render_legs(YAW[direction], k, palette)
        offs = hand_offsets(direction, k)
        placed = []
        for h, sgn in assign_hands(hands, offs):
            rest_x, depth, dx, dy = offs[sgn]
            moved = dict(h, attach=(h["attach"][0], h["attach"][1] + BOB[k]),
                         fist=(h["fist"][0], h["fist"][1] + BOB[k]))
            placed.append((depth, moved, int(round(dx)), int(round(dy))))
        placed.sort(key=lambda p: p[0])
        # bottom to top: legs, the hand swinging back, skirt, upper body, the hand in front
        for depth, h, dx, dy in placed:
            if depth < 0:
                draw_hand(canvas, h, dx, dy, palette)
        for layer in (warp_skirt(skirt, skirt_top, skirt_hem, direction, k), hair[HAIR_SEQ[k]]):
            layer = np.roll(layer, BOB[k], axis=0)
            mask = layer[..., 3] > 0
            canvas[mask] = layer[mask]
        for depth, h, dx, dy in placed:
            if depth >= 0:
                draw_hand(canvas, h, dx, dy, palette)
        out.append(outline(despike(canvas), palette))
    return out


def despike(img):
    """Drop 1 px wide vertical slivers under the hem and pixels left floating on their own."""
    a = img[..., 3] > 0
    for _ in range(3):
        lone = a & ~np.roll(a, 1, 1) & ~np.roll(a, -1, 1)
        lone[: FH // 2] = False
        if not lone.any():
            break
        img[lone] = 0
        a = img[..., 3] > 0
    p = np.pad(a, 1)
    neighbours = sum(p[1 + dy:FH + 1 + dy, 1 + dx:FW + 1 + dx]
                     for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
    img[a & (neighbours == 0)] = 0
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
