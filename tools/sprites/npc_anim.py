"""Customer animations + speech bubbles.

Frames (32x40, same anchor as the other characters):
  jalan1-4  : walking in place (legs alternate, body bobs) - the game moves the sprite
  tunggu1-2 : waiting (idle breathing, looks around)
  senang1-3 : happy after being served (hop + hearts)
Bubbles are separate sprites; the game draws the ordered food icon inside `gelembung_pesan`.
"""

from PIL import Image

from . import food, npcs
from .character import BODY_DASTER, TAS_BELANJA, compose, full_palette
from .core import ASSETS, contact_sheet, render, save_set, shift, squash
from .draw import Canvas
from .menu import MENU

OUT = ASSETS / "npc" / "animasi"

LEFT_LEG = range(8, 16)
RIGHT_LEG = range(16, 24)


def _lift(grid, cols, rows=range(33, 40)):
    g = [r[:] for r in grid]
    for x in cols:
        for y in rows:
            g[y - 1][x] = grid[y][x] if grid[y][x] != "." else g[y - 1][x]
        g[rows[-1]][x] = "."
    return g


def _hearts(grid, pts):
    for x, y in pts:
        for dx, dy in ((0, 0), (2, 0), (-1, 1), (0, 1), (1, 1), (2, 1), (3, 1), (0, 2), (1, 2), (2, 2),
                       (1, 3)):
            if 0 <= y + dy < len(grid) and 0 <= x + dx < len(grid[0]):
                grid[y + dy][x + dx] = "@"
        if 0 <= y < len(grid):
            grid[y][x + 1] = "."


def customer_frames(build, pal, squash_row=27):
    pal = {**pal, "@": "#ff5a7a"}
    base = build(None)
    out = []
    walk = [_lift(base, LEFT_LEG), squash(base, squash_row), _lift(base, RIGHT_LEG),
            squash(base, squash_row)]
    for i, g in enumerate(walk):
        out.append((f"jalan{i + 1}", render(g, pal)))
    look = build(None)
    for row in look[16:20]:                                  # melirik: geser mata 1px
        for x in range(len(row) - 1, 0, -1):
            if row[x - 1] in "ew" and row[x] not in "ew" and x < 26:
                row[x], row[x - 1] = row[x - 1], "s"
    out += [("tunggu1", render(base, pal)), ("tunggu2", render(look, pal))]
    happy = build("senang")
    h1 = shift(happy, -2)
    _hearts(h1, [(2, 6), (25, 3)])
    h2 = shift(happy, -4)
    _hearts(h2, [(3, 2), (26, 0), (0, 14)])
    h3 = squash(happy, squash_row)
    _hearts(h3, [(4, 0), (24, 6)])
    out += [("senang1", render(h1, pal)), ("senang2", render(h2, pal)), ("senang3", render(h3, pal))]
    return out


# ---------------------------------------------------------------- bubbles
BUBBLE_PAL = {"O": "#2a1c24", "w": "#fbf6ec", "W": "#cfc6b6", "r": "#d8432a", "H": "#ff5a7a",
              "e": "#1e1420", "y": "#f2c94c"}


def bubble(kind):
    cv = Canvas(22, 20)
    cv.rect(1, 1, 20, 14, "w")
    cv.hline(2, 14, 18, "W")
    cv.poly([(6, 15), (11, 15), (6, 19)], "w")
    if kind == "tunggu":
        for x in (6, 10, 14):
            cv.rect(x, 7, 2, 2, "e")
    elif kind == "senang":
        for dx, dy in ((0, 0), (2, 0), (4, 0), (6, 0), (-1, 1), (7, 1)):
            pass
        cv.disc(8, 7, 2, "H"), cv.disc(13, 7, 2, "H")
        cv.poly([(6, 8), (16, 8), (11, 13)], "H")
    elif kind == "kesal":
        cv.rect(6, 4, 3, 3, "r"), cv.rect(12, 4, 3, 3, "r")
        cv.line(6, 11, 15, 9, "e")
    cv.outline("O")
    for y, x in ((0, 0), (0, 21), (15, 0), (15, 21)):
        cv.px(x, y, ".")
    return render(cv.g, BUBBLE_PAL)


def with_order(frame, icon):
    """Example: customer + order bubble with a half-size food icon (preview only)."""
    canvas = Image.new("RGBA", (32, 62), (0, 0, 0, 0))
    canvas.alpha_composite(frame, (0, 22))
    canvas.alpha_composite(bubble("pesan"), (12, 0))
    canvas.alpha_composite(icon.resize((14, 14), Image.NEAREST), (16, 0))
    return canvas


def generate():
    for kind in ("pesan", "tunggu", "senang", "kesal"):
        OUT.mkdir(parents=True, exist_ok=True)
        bubble(kind).save(OUT / f"gelembung_{kind}.png")
    rows, labels = [], []
    cast = [(n, lk, body, outfit) for n, lk, body, outfit in npcs.roll_customers()[:4]]
    for name, lk, body, outfit in cast:
        pal = full_palette(lk, outfit)
        frames = customer_frames(lambda e, lk=lk, body=body: compose(lk, body, expression=e), pal,
                                 34 if body is BODY_DASTER else 27)
        save_set(OUT / name, frames, gif_order=[0, 1, 2, 3, 0, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8],
                 durations=[140] * 8 + [500] * 4 + [160, 160, 300])
        rows.append([im for _, im in frames])
        labels.append([n for n, _ in frames])
    # Bu Yanti
    pal = full_palette(npcs.BU_YANTI_LOOK, npcs.BU_YANTI_STAGES[1]["palette"])
    pal.setdefault("x", "#3a2a30")
    frames = customer_frames(lambda e: compose(npcs.BU_YANTI_LOOK, BODY_DASTER, items=[TAS_BELANJA],
                                               expression=e), pal, 34)
    save_set(OUT / "bu_yanti", frames, gif_order=[0, 1, 2, 3, 0, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8],
             durations=[140] * 8 + [500] * 4 + [160, 160, 300])
    rows.append([im for _, im in frames])
    labels.append([n for n, _ in frames])
    contact_sheet(rows, k=4, labels=labels, pad=8).save(OUT / "animasi_pelanggan_preview.png")
    icon = food.icon(MENU["jakarta"][0])
    ex = [with_order(rows[i][4], icon) for i in range(len(rows))]
    ex += [bubble(k) for k in ("pesan", "tunggu", "senang", "kesal")]
    contact_sheet([ex], k=4, pad=8).save(OUT / "gelembung_preview.png")
