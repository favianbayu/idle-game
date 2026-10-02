#!/usr/bin/env python3
"""Turn an AI-generated 6 x 8 sprite atlas into clean pixel art.

Image generators draw "pixel art" without a real pixel grid: soft edges, tens of
thousands of colours and a light fringe left by background removal. This tool:

  1. cuts the atlas into its 48 sprites (connected components, so sprites that
     overlap a neighbour's cell are kept whole; sprites that touch, like a
     cowlick against the shoes above it, are split where they touch),
  2. maps every source pixel to a fixed palette (sampled from the reference),
  3. scales all sprites with ONE factor so the front-facing row is exactly
     --height art pixels tall, and resamples with a mode filter (majority colour
     per block) so outlines and small details survive,
  4. aligns every frame on the feet (pivot 48,116 in a 96 x 128 frame),
  5. redraws a clean 1 px outline and removes lonely stray pixels.

  6. (--eyes) finds the eyes inside the face and redraws them as crisp,
     hand-drawn pixel eyes, since resampling turns them into dark blobs.

Usage:
  python3 tools/pixelfit.py ATLAS.png --height 64 --eyes --out assets/sprites/indah/64
"""
import argparse
import json
import os

import numpy as np
from PIL import Image

FW, FH = 96, 128
PIVOT = (48, 116)
DIRS = ["SE", "S", "SW", "W", "NW", "N", "NE", "E"]

# Palettes sampled from the approved reference atlases. Each entry is a ramp,
# darkest first; "outline" must exist.
PALETTES = {
    "indah": {
        "outline": ["#120B0D"],
        "hair": ["#1A1215", "#241B1F", "#2F2528", "#43353A"],
        "skin": ["#94522E", "#CD864F", "#E79E61", "#F0B47E"],
        "lips": ["#B8604A", "#E88A68"],
        "eye": ["#593120", "#8A5230", "#FFFFFF"],
        "blouse": ["#C9C4AA", "#DED7C2", "#F1E8D6", "#FAF6EA"],
        "jasmine": ["#6E9E6A", "#9CC69A"],
        "skirt": ["#613E26", "#A8784A", "#CB925F", "#D7AE7B", "#E2C394"],
        "leather": ["#2C1B10", "#5B331C", "#8D4F27", "#B86E3A"],
        "wood": ["#B77741", "#E6A452"],
        "cord": ["#7A3424"],
    },
    "arya": {
        "outline": ["#1E0C05"],
        "hair": ["#2D1910", "#39241A", "#4A2C1D", "#62402F"],
        "skin": ["#8D4F26", "#C37031", "#F09C50", "#F7B676"],
        "lips": ["#A84A26"],
        "eye": ["#4E220C", "#86461C", "#FFFFFF"],
        "glasses": ["#B98238", "#E7B864"],
        "shirt": ["#A08268", "#CDAB90", "#EAD9C2", "#FAF1E2"],
        "chinos": ["#8A6844", "#B38A5E", "#D3AC7E", "#E7C899"],
        "leather": ["#3B1A09", "#5C2C11", "#85471C", "#A95F2E"],
        "sole": ["#B59A82"],
        "pen": ["#34508A"],
    },
}

# Per-character conversion rules. "paint_only" ramps are never matched from
# the source: the AI paints Arya's satchel in the same browns as his eyes and
# his glasses in skin tones, so those are left to be painted afterwards.
# "height_from": "head" measures --height from the crown, not from a cowlick.
STYLE = {
    "arya": {"paint_only": ("eye", "glasses", "pen"), "height_from": "head"},
}


def hex2rgb(h):
    return [int(h[i:i + 2], 16) for i in (1, 3, 5)]


def to_lab(rgb):
    """sRGB (0-255) -> CIE Lab, vectorised."""
    c = np.asarray(rgb, float) / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    m = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ m.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def build_palette(name):
    cols, mappable = [], []
    skip = STYLE.get(name, {}).get("paint_only", ())
    for key, ramp in PALETTES[name].items():
        cols += ramp
        mappable += [key not in skip] * len(ramp)
    rgb = np.array([hex2rgb(c) for c in cols])
    return cols, rgb, to_lab(rgb), np.array(mappable)


def cut_sprites(alpha, cols=6, rows=8, solid=None, rgb=None):
    """Assign every opaque pixel to one of the cols x rows sprites."""
    h, w = alpha.shape
    lab, n = components(alpha, conn8=False)
    owner = np.full((h, w), -1, np.int32)
    cw, ch = w / cols, h / rows
    idx = np.arange(n + 1)
    ys, xs = np.nonzero(lab)
    ids = lab[ys, xs]
    cnt = np.bincount(ids, minlength=n + 1)
    cy = np.bincount(ids, ys, n + 1) / np.maximum(cnt, 1)
    cx = np.bincount(ids, xs, n + 1) / np.maximum(cnt, 1)
    ymin = np.full(n + 1, h)
    ymax = np.zeros(n + 1, int)
    np.minimum.at(ymin, ids, ys)
    np.maximum.at(ymax, ids, ys)
    for i in idx[1:]:
        sel = lab == i
        c = min(cols - 1, int(cx[i] / cw))
        if ymax[i] - ymin[i] > ch * 1.15:
            # two sprites that touch (a cowlick against the shoes above it):
            # split them where they touch, so neither one loses its tip
            yy, xx = np.nonzero(sel)
            r_each = split_touching(sel, ch, rows, alpha if solid is None else solid,
                                    np.zeros(alpha.shape + (3,)) if rgb is None else rgb)
            owner[yy, xx] = r_each * cols + c
        else:
            r = min(rows - 1, int(cy[i] / ch))
            owner[sel] = r * cols + c
    return owner


def split_touching(sel, ch, rows, solid, rgb):
    """Row of every pixel of a component that spans several sprites.

    The fully opaque pixels (solid), shrunk by 2 px so narrow contacts break,
    fall apart into cores; each core belongs to the row its centre is in, and
    every other pixel joins a neighbouring core, small colour steps first. If
    a core still spans two sprites, the mask is eroded further; failing that,
    the row lines split that core.
    """
    yy, xx = np.nonzero(sel)
    y0, x0 = yy.min(), xx.min()
    m = sel[y0:yy.max() + 1, x0:xx.max() + 1]
    row_of_y = np.clip((np.arange(m.shape[0]) + y0) / ch, 0, rows - 1).astype(int)

    def shrink(a):
        p = np.pad(a, 1)
        return a & p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:]
    # two px of erosion break the narrow necks where shoes rest on a cowlick;
    # cores that still span two sprites are eroded further, the others are kept
    label = np.full(m.shape, -1)
    core = shrink(shrink(m & solid[y0:yy.max() + 1, x0:xx.max() + 1]))
    for _ in range(16):
        lab, n = components(core, conn8=False)
        still = np.zeros(m.shape, bool)
        for b in range(1, n + 1):
            sel_b = lab == b
            ys = np.nonzero(sel_b.any(1))[0]
            if sel_b.sum() < 30:
                continue
            if ys.max() - ys.min() > 1.15 * ch:
                still |= sel_b
            else:
                label[sel_b] = row_of_y[int(np.nonzero(sel_b)[0].mean())]
        if not still.any():
            break
        core = shrink(still)
    else:
        label[still] = np.broadcast_to(row_of_y[:, None], m.shape)[still]   # the row lines split it
    # grow in waves; a pixel joins the labelled neighbour closest in colour,
    # so the pale sole edge goes with its shoe, not with the dark cowlick it touches
    col = to_lab(rgb[y0:yy.max() + 1, x0:xx.max() + 1])
    h, w = m.shape
    col_p = np.pad(col, ((1, 1), (1, 1), (0, 0)))
    for limit in (100.0, 400.0, 1600.0, np.inf):          # small colour steps first
        while (label[m] < 0).any():
            best = np.full(m.shape, limit)
            grown = label.copy()
            lab_p = np.pad(label, 1, constant_values=-1)
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nb = lab_p[1 + dy:h + 1 + dy, 1 + dx:w + 1 + dx]
                dist = ((col - col_p[1 + dy:h + 1 + dy, 1 + dx:w + 1 + dx]) ** 2).sum(-1)
                take = (label < 0) & (nb >= 0) & m & (dist < best)
                grown[take] = nb[take]
                best[take] = dist[take]
            if (grown == label).all():
                break
            label = grown
    out = label[yy - y0, xx - x0]
    fallback = np.clip((yy / ch).astype(int), 0, rows - 1)
    return np.where(out >= 0, out, fallback)


def fit_atlas(path, height, palette, alpha_cut=150):
    src = np.array(Image.open(path).convert("RGBA"))
    names, prgb, plab, mappable = build_palette(palette)
    alpha = src[..., 3] >= alpha_cut
    owner = cut_sprites(alpha, solid=src[..., 3] >= 250, rgb=src[..., :3])
    # palette index per source pixel (0 = transparent)
    lab = to_lab(src[..., :3])
    d = ((lab[..., None, :] - plab[None, None]) ** 2).sum(-1)
    d[..., ~mappable] = np.inf
    pidx = d.argmin(-1) + 1
    pidx[~alpha] = 0
    # one global scale: the front-facing row (S) sets the height
    heights = []
    boxes = {}
    for k in range(48):
        yy, xx = np.nonzero(owner == k)
        boxes[k] = (yy, xx)
        if k // 6 == 1 and len(yy):
            top = yy.min()
            if STYLE.get(palette, {}).get("height_from") == "head":
                # measure from the crown, not from a thin cowlick sticking out of it
                width = np.bincount(yy - top)
                top += int(np.argmax(width >= 0.3 * width.max()))
            heights.append(yy.max() - top + 1)
    s = height / float(np.median(heights))
    frames = []
    for k in range(48):
        yy, xx = boxes[k]
        frame = np.zeros((FH, FW), np.int32)
        if len(yy) == 0:
            frames.append(frame)
            continue
        bottom = yy.max() + 1
        top = yy.min()
        # horizontal centre from the waist band, which barely moves while walking
        band = (yy > top + 0.55 * (bottom - top)) & (yy < top + 0.68 * (bottom - top))
        cx = np.median(xx[band]) + 0.5 if band.any() else np.median(xx) + 0.5
        mine = owner == k
        y0, y1 = yy.min(), yy.max() + 1
        x0, x1 = xx.min(), xx.max() + 1
        sub = np.where(mine[y0:y1, x0:x1], pidx[y0:y1, x0:x1], 0)
        for Y in range(FH):
            sy0 = bottom - (PIVOT[1] - Y) / s
            sy1 = bottom - (PIVOT[1] - Y - 1) / s
            if sy1 <= y0 or sy0 >= y1:
                continue
            for X in range(FW):
                sx0 = cx + (X - PIVOT[0]) / s
                sx1 = cx + (X + 1 - PIVOT[0]) / s
                if sx1 <= x0 or sx0 >= x1:
                    continue
                a0, a1 = int(max(sy0, y0)) - y0, int(np.ceil(min(sy1, y1))) - y0
                b0, b1 = int(max(sx0, x0)) - x0, int(np.ceil(min(sx1, x1))) - x0
                blk = sub[a0:max(a1, a0 + 1), b0:max(b1, b0 + 1)].ravel()
                cnt = np.bincount(blk, minlength=len(names) + 1)
                if cnt[0] * 2 > blk.size:
                    continue
                cnt[0] = 0
                frame[Y, X] = cnt.argmax()
        frames.append(frame)
    return frames, names, prgb, s


def clean(frame, names, outline):
    """Lonely-pixel cleanup and a crisp outline."""
    f = frame.copy()
    keep = {i + 1 for i, n in enumerate(names) if n in ("#FFFFFF",)}
    h, w = f.shape
    pad = np.pad(f, 1)
    nb = np.stack([pad[1 + dy:h + 1 + dy, 1 + dx:w + 1 + dx]
                   for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx])
    lonely = (f > 0) & np.all(nb != f, axis=0)
    best = np.zeros_like(f)
    best_n = np.zeros_like(f)
    for c in np.unique(nb):
        if c == 0:
            continue
        n = (nb == c).sum(0)
        upd = n > best_n
        best = np.where(upd, c, best)
        best_n = np.where(upd, n, best_n)
    f = np.where(lonely & (best_n >= 4) & ~np.isin(f, list(keep)), best, f)
    # outline: every opaque pixel that touches transparency becomes the outline colour
    o = names.index(outline) + 1
    a = f > 0
    edge = np.zeros_like(a)
    for s_, ax in ((1, 0), (-1, 0), (1, 1), (-1, 1)):
        edge |= ~np.roll(a, s_, ax)
    f = np.where(a & edge, o, f)
    return f


# Hand-drawn eyes that replace the mushy eyes left by resampling. "l" eyes have
# the outer corner (lash flick) on the left, "r" eyes on the right; the
# highlight stays on the upper left in both, like the light.
# K lash/outline, D dark iris, M iris, L warm iris, W highlight, S white of the eye
EYES = {
    64: {"full_l": ["KKKK.",
                    "KKKKK",
                    "SDWDS",
                    "SDDMS",
                    ".DML."],
         "full_r": [".KKKK",
                    "KKKKK",
                    "SDWDS",
                    "SMDDS",
                    ".LMD."],
         "narrow_l": ["KKK.",
                      "KKKK",
                      "DWDS",
                      "DMMS",
                      ".L.."],
         "narrow_r": [".KKK",
                      "KKKK",
                      "SDWD",
                      "SMMD",
                      "..L."]},
    84: {"full_l": ["K.KKKK.",
                    "KKKKKKK",
                    "SDWWDDS",
                    "SDWWDDS",
                    "SDDDMDS",
                    ".DDMLD.",
                    "..KLLK."],
         "full_r": [".KKKK.K",
                    "KKKKKKK",
                    "SDWWDDS",
                    "SDWWDDS",
                    "SDMDDDS",
                    ".DLMDD.",
                    ".KLLK.."],
         "narrow_l": ["K.KK.",
                      "KKKKK",
                      "DWWDS",
                      "DWDDS",
                      "DDMDS",
                      ".DML.",
                      ".KLK."],
         "narrow_r": [".KK.K",
                      "KKKKK",
                      "SDWWD",
                      "SDWDD",
                      "SDMDD",
                      ".LMD.",
                      ".KLK."]},
}
EYE_KEYS = {"K": ("outline", 0), "D": ("hair", 0), "M": ("eye", 0), "L": ("eye", 1),
            "W": ("eye", 2), "S": ("blouse", 3)}


def components(mask, conn8=True):
    lab, n = np.zeros(mask.shape, np.int32), 0
    h, w = mask.shape
    steps = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    if conn8:
        steps += [(1, 1), (1, -1), (-1, 1), (-1, -1)]
    for y0, x0 in zip(*np.nonzero(mask)):
        if lab[y0, x0]:
            continue
        n += 1
        lab[y0, x0] = n
        st = [(y0, x0)]
        while st:
            y, x = st.pop()
            for dy, dx in steps:
                yy, xx = y + dy, x + dx
                if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not lab[yy, xx]:
                    lab[yy, xx] = n
                    st.append((yy, xx))
    return lab, n


def hull_mask(mask):
    """Filled convex hull of a pixel mask."""
    ys, xs = np.nonzero(mask)
    pts = sorted(set(zip(xs.tolist(), ys.tolist())))
    if len(pts) < 3:
        return mask.copy()

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    poly = lower[:-1] + upper[:-1]
    h, w = mask.shape
    gy, gx = np.mgrid[0:h, 0:w]
    inside = np.ones((h, w), bool)
    for i in range(len(poly)):
        (x0, y0), (x1, y1) = poly[i], poly[(i + 1) % len(poly)]
        inside &= (x1 - x0) * (gy - y0) - (y1 - y0) * (gx - x0) >= -0.5 * np.hypot(x1 - x0, y1 - y0)
    return inside


def repaint_eyes(f, palette, names, size_class, front_facing):
    """Find the eyes inside the face and redraw them as crisp pixel eyes."""
    ids = lambda key: [names.index(c) + 1 for c in PALETTES[palette][key]]  # noqa: E731
    skin = ids("skin") + ids("lips")
    dark = ids("outline") + ids("hair") + ids("eye")[:2]
    ys = np.nonzero((f > 0).any(1))[0]
    if not len(ys):
        return f
    top, bot = ys.min(), ys.max()
    head = np.zeros_like(f, bool)
    head[top:top + int(0.45 * (bot - top)), :] = True
    lab, n = components(np.isin(f, skin) & head, conn8=False)
    if n == 0:
        return f
    sizes = np.bincount(lab.ravel())[1:]
    face = lab == (sizes.argmax() + 1)
    if face.sum() < (40 if size_class == 64 else 70):
        return f
    hull = hull_mask(face)
    fy = np.nonzero(face.any(1))[0]
    fy0, fy1 = fy.min(), fy.max()
    band = np.zeros_like(face)
    band[int(fy0 + 0.3 * (fy1 - fy0)):int(fy0 + 0.72 * (fy1 - fy0)) + 1] = True
    cand, m = components(hull & band & np.isin(f, dark) & ~face)
    eyes = []
    for i in range(1, m + 1):
        yy, xx = np.nonzero(cand == i)
        if len(yy) < (4 if size_class == 64 else 7) or yy.max() - yy.min() < 1:
            continue
        eyes.append((len(yy), yy, xx))
    eyes = sorted(eyes, key=lambda e: -e[0])[:2]
    if not eyes:
        return f
    eyes.sort(key=lambda e: e[2].mean())
    face_cx = np.nonzero(face)[1].mean()
    out = f.copy()
    base = ids("skin")[2]
    for _, yy, xx in eyes:
        out[yy, xx] = base
    widths = [e[2].max() - e[2].min() + 1 for e in eyes]
    for k, (_, yy, xx) in enumerate(eyes):
        if len(eyes) == 2:
            side = "l" if k == 0 else "r"
            narrow = widths[k] < 0.72 * max(widths)
        else:
            side = "r" if xx.mean() > face_cx else "l"
            narrow = not front_facing
        pat = EYES[size_class][("narrow_" if narrow else "full_") + side]
        ph, pw = len(pat), len(pat[0])
        ox = int(round(xx.mean() - (pw - 1) / 2))
        oy = int(yy.max()) - ph + 1
        for j, row in enumerate(pat):
            for i, ch in enumerate(row):
                Y, X = oy + j, ox + i
                if ch == "." or not (0 <= Y < f.shape[0] and 0 <= X < f.shape[1]) or f[Y, X] == 0:
                    continue
                if not hull[Y, X] and ch != "K":
                    continue
                key, r = EYE_KEYS[ch]
                out[Y, X] = names.index(PALETTES[palette][key][r]) + 1
    return out


def render(frames, prgb, names, outline, palette=None, size_class=None):
    tiles = []
    for k, f in enumerate(frames):
        f = clean(f, names, outline)
        if palette and size_class and k // 6 in (0, 1, 2, 3, 7):
            f = repaint_eyes(f, palette, names, size_class, front_facing=k // 6 in (0, 1, 2))
        img = np.zeros((FH, FW, 4), np.uint8)
        m = f > 0
        img[m, :3] = prgb[f[m] - 1]
        img[m, 3] = 255
        tiles.append(img)
    rows = [np.concatenate(tiles[r * 6:(r + 1) * 6], 1) for r in range(8)]
    return np.concatenate(rows, 0), tiles


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("atlas")
    ap.add_argument("--height", type=int, default=64)
    ap.add_argument("--palette", default="indah")
    ap.add_argument("--name", default="indah")
    ap.add_argument("--out", required=True)
    ap.add_argument("--eyes", action="store_true", help="redraw the eyes as crisp pixel eyes")
    a = ap.parse_args()
    frames, names, prgb, s = fit_atlas(a.atlas, a.height, a.palette)
    size_class = 64 if a.height <= 72 else 84
    atlas, tiles = render(frames, prgb, names, PALETTES[a.palette]["outline"][0],
                          a.palette if a.eyes else None, size_class)
    os.makedirs(a.out, exist_ok=True)
    Image.fromarray(atlas).save(os.path.join(a.out, f"{a.name}_sprite_8dir.png"), optimize=True)
    Image.fromarray(tiles[6]).save(os.path.join(a.out, f"{a.name}_anchor.png"), optimize=True)
    used = {tuple(c[:3]) for c in atlas.reshape(-1, 4) if c[3]}
    hs = []
    for t in tiles[6:12]:
        ys = np.nonzero((t[..., 3] > 0).any(1))[0]
        hs.append(int(ys.max() - ys.min() + 1))
    meta = {
        "character": a.name, "source": os.path.basename(a.atlas),
        "frame": {"w": FW, "h": FH}, "pivot": {"x": PIVOT[0], "y": PIVOT[1]},
        "rows": DIRS, "target_height_px": a.height, "front_row_heights_px": hs,
        "animations": {"walk": {"file": f"{a.name}_sprite_8dir.png", "frames": 6, "fps": 9, "loop": True}},
        "palette_size": len(used), "scale_from_source": round(s, 4),
    }
    with open(os.path.join(a.out, f"{a.name}_sprite.json"), "w") as fh:
        json.dump(meta, fh, indent=2)
    print(f"{a.name} {a.height}px: scale {s:.4f}, front row heights {hs}, {len(used)} colours -> {a.out}")


if __name__ == "__main__":
    main()
