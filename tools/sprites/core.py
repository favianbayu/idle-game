"""Shared helpers: grids, layers, rendering and export.

A *grid* is a list of rows, each a list of single-char palette keys ('.' is
transparent). A *layer* is a dict {row_index: string}; painting a layer copies
every non-'.' char onto the grid, so layers stack like transparent sheets.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 32, 40
ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "assets" / "characters"
E6 = "......"

# Keys every humanoid sprite can use.
BASE_PALETTE = {
    "O": "#2a1c24",  # outline (dark warm, never pure black)
    "e": "#1e1420",  # eye
    "w": "#ffffff",  # eye shine
    "m": "#7a2e2a",  # mouth
    "b": "#e3806a",  # blush / tongue
    "Z": "#f2c94c",  # sparkle
    "z": "#fff4c2",  # sparkle core
}


def row(left, mid, right):
    """A 32-px row written as left (cols 0-5) | mid (cols 6-25) | right (cols 26-31)."""
    assert len(left) == 6, (left, len(left))
    assert len(mid) == 20, (mid, len(mid))
    assert len(right) == 6, (right, len(right))
    return left + mid + right


def mid(s):
    return row(E6, s, E6)


def hexc(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


def blank(w=W, h=H):
    return [["."] * w for _ in range(h)]


def paint(grid, layer, clip_above=None):
    """Stack a layer onto the grid. Rows above `clip_above` are skipped."""
    for y, line in layer.items():
        if clip_above is not None and y < clip_above:
            continue
        assert len(line) == len(grid[0]), (y, line, len(line))
        for x, ch in enumerate(line):
            if ch != ".":
                grid[y][x] = ch


def put(grid, x, y, ch):
    if 0 <= y < len(grid) and 0 <= x < len(grid[0]):
        grid[y][x] = ch


def put_all(grid, points):
    for x, y, ch in points:
        put(grid, x, y, ch)


def shift(grid, dy):
    """Move everything vertically (negative = up)."""
    w = len(grid[0])
    empty = [["."] * w for _ in range(abs(dy))]
    if dy < 0:
        return [r[:] for r in grid[-dy:]] + empty
    return empty + [r[:] for r in grid[:len(grid) - dy]]


def squash(grid, at_row):
    """Drop one row so everything above it dips 1px (idle breathing bounce)."""
    g = [r[:] for r in grid]
    del g[at_row]
    g.insert(0, ["."] * len(grid[0]))
    return g


def sparkle(grid, x, y):
    put(grid, x, y, "z")
    for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        put(grid, x + dx, y + dy, "Z")


def render(grid, palette):
    pal = {k: hexc(v) for k, v in palette.items()}
    img = Image.new("RGBA", (len(grid[0]), len(grid)), (0, 0, 0, 0))
    px = img.load()
    for y, line in enumerate(grid):
        for x, ch in enumerate(line):
            if ch == ".":
                continue
            if ch not in pal:
                raise KeyError(f"no colour for key {ch!r} at {x},{y}")
            px[x, y] = pal[ch]
    return img


def scale(img, k):
    return img.resize((img.width * k, img.height * k), Image.NEAREST)


def checker(w, h, cell=8):
    bg = Image.new("RGBA", (w, h))
    px = bg.load()
    for y in range(h):
        for x in range(w):
            c = 58 if ((x // cell) + (y // cell)) % 2 else 46
            px[x, y] = (c, c - 8, c + 4, 255)
    return bg


def save_set(out_dir, frames, gif_order=None, durations=None):
    """Save frames as 1x + @4x PNGs plus an animated preview.gif.

    frames: list of (name, Image). gif_order: indices into frames.
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, img in frames:
        img.save(out_dir / f"{name}.png")
        scale(img, 4).save(out_dir / f"{name}@4x.png")
    order = gif_order or list(range(len(frames)))
    durations = durations or [400] * len(order)
    w, h = frames[0][1].size
    bg = checker(w * 8, h * 8, 32)
    seq = [Image.alpha_composite(bg, scale(frames[i][1], 8)).convert("P", palette=Image.ADAPTIVE)
           for i in order]
    seq[0].save(out_dir / "preview.gif", save_all=True, append_images=seq[1:],
                duration=durations, loop=0, disposal=2)


def contact_sheet(rows, k=8, labels=None, cell=None, pad=0):
    """Lay out rows of images (each row a list) on a checker background.

    labels: optional list (per row) of lists of strings drawn under each image.
    """
    cw = cell[0] if cell else max(im.width for r in rows for im in r)
    ch = cell[1] if cell else max(im.height for r in rows for im in r)
    label_h = 14 if labels else 0
    cols = max(len(r) for r in rows)
    cell_w, cell_h = cw * k + pad, ch * k + label_h + pad
    sheet = checker(cols * cell_w, len(rows) * cell_h, 32)
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for ry, r in enumerate(rows):
        for cx, im in enumerate(r):
            big = scale(im, k)
            ox = cx * cell_w + (cw * k - big.width) // 2
            oy = ry * cell_h + (ch * k - big.height)
            sheet.alpha_composite(big, (ox, oy))
            if labels:
                text = labels[ry][cx]
                tw = draw.textlength(text, font=font)
                tx = cx * cell_w + (cell_w - tw) / 2
                draw.text((tx, ry * cell_h + ch * k + 1), text, fill=(243, 233, 216, 255), font=font)
    return sheet
