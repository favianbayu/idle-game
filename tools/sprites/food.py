"""Food & drink icons (24x24) built from a handful of templates.

Each menu item gives (template, a, b, c): a = main colour, b = second, c =
accent/topping (may be None). Specials get a gold frame, legendary items a
pink flame aura; every item also gets a "locked" version (dark silhouette +
padlock) for the shop.
"""

import json

from PIL import Image, ImageOps

from .cities import CITIES, CITY_ORDER
from .core import ASSETS, contact_sheet, render, scale
from .draw import Canvas
from .menu import COMBOS, MENU, economy

OUT = ASSETS.parent / "food"
N = 24

BASE = {
    "O": "#2a1c24", "w": "#fbf6ec", "W": "#cfc6b6", "g": "#bfe6ea", "G": "#effcfc",
    "v": "#5f9a3e", "V": "#3f6a2a", "k": "#b0823e", "K": "#7a5a2a", "x": "#f3e9d8bb",
    "n": "#fbf6ec", "s": "#ffffff", "y": "#f2c94c", "Y": "#fff2a8", "p": "#ff8fdc",
    "P": "#ff8fdc88", "L": "#2a2438", "l": "#4a4058", "m": "#d9b04a", "M": "#8a6a2a",
}


def _shade(hexcol, f):
    h = hexcol.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return "#%02x%02x%02x" % tuple(max(0, min(255, round(v * f))) for v in (r, g, b))


def _plate(cv):
    cv.ellipse(12, 18, 11, 4, "w")
    cv.ellipse(12, 19, 9, 2, "W")
    cv.ellipse(12, 18, 8, 2, "w")


def _leaf(cv):
    cv.poly([(1, 18), (6, 13), (18, 13), (23, 18), (18, 22), (6, 22)], "v")
    cv.line(2, 18, 22, 18, "V")


def _steam(cv):
    for x, y in ((9, 3), (13, 1), (16, 4)):
        cv.px(x, y, "x"), cv.px(x - 1, y + 2, "x")


TEMPLATES = {}


def template(fn):
    TEMPLATES[fn.__name__.lstrip("_")] = fn
    return fn


@template
def _bowl(cv, has_c):
    cv.ellipse(12, 10, 10, 3, "B")                     # isi mangkuk
    cv.ellipse(12, 10, 8, 2, "a")
    cv.px(8, 10, "b"), cv.px(9, 9, "b"), cv.px(15, 10, "b"), cv.px(12, 9, "b")
    if has_c:
        cv.px(11, 10, "c"), cv.px(16, 9, "c"), cv.px(7, 9, "c")
    cv.poly([(2, 11), (22, 11), (18, 20), (6, 20)], "w")
    cv.hline(3, 13, 18, "r")
    cv.hline(5, 17, 14, "W")
    cv.rect(9, 20, 6, 2, "W")
    _steam(cv)


@template
def _rice(cv, has_c):
    _plate(cv)
    cv.ellipse(9, 13, 5, 4, "a")                        # nasi
    cv.px(7, 11, "s")
    cv.ellipse(16, 15, 3, 2, "b")
    if has_c:
        cv.rect(15, 10, 4, 3, "c")
        cv.px(6, 16, "c")
    cv.px(12, 16, "v"), cv.px(13, 15, "v")


@template
def _leafrice(cv, has_c):
    _leaf(cv)
    cv.ellipse(10, 14, 5, 4, "a")
    cv.px(8, 12, "s")
    cv.ellipse(16, 16, 3, 2, "b")
    if has_c:
        cv.rect(14, 12, 3, 2, "c")


@template
def _salad(cv, has_c):
    _plate(cv)
    for x, y, col in ((7, 14, "a"), (11, 12, "a"), (15, 14, "a"), (9, 15, "b"), (14, 11, "b"),
                      (17, 16, "a"), (12, 15, "b")):
        cv.ellipse(x, y, 2, 1, col)
    if has_c:
        for x, y in ((10, 13), (16, 13), (8, 16)):
            cv.px(x, y, "c")
    cv.hline(7, 17, 10, "B")                           # bumbu kacang


@template
def _pancake(cv, has_c):
    _plate(cv)
    cv.ellipse(12, 14, 8, 4, "A")
    cv.ellipse(12, 13, 8, 4, "a")
    for x, y in ((9, 12), (14, 13), (11, 15), (15, 11)):
        cv.px(x, y, "b")
    if has_c:
        cv.hline(8, 11, 4, "c"), cv.hline(13, 14, 3, "c")


@template
def _pieces(cv, has_c):
    _plate(cv)
    for x, y in ((6, 13), (11, 11), (14, 14), (9, 15)):
        cv.rect(x, y, 5, 4, "a")
        cv.hline(x, y + 3, 5, "A")
    cv.hline(6, 17, 13, "b")                           # saus
    cv.px(10, 13, "b"), cv.px(16, 15, "b")
    if has_c:
        cv.px(8, 14, "c"), cv.px(13, 12, "c"), cv.px(17, 16, "c")


@template
def _sate(cv, has_c):
    _leaf(cv)
    for i, y in enumerate((6, 9, 12)):
        cv.line(3, y + 8, 21, y - 2, "k")
        for t in range(3):
            x = 7 + t * 4
            yy = y + 5 - t * 2
            cv.rect(x, yy, 3, 3, "a")
            cv.px(x, yy + 2, "A")
    cv.hline(6, 19, 12, "b")
    if has_c:
        cv.px(10, 18, "c"), cv.px(15, 19, "c")


@template
def _skewer(cv, has_c):
    _plate(cv)
    cv.line(4, 20, 20, 4, "k")
    for t in range(4):
        cv.disc(7 + t * 3, 16 - t * 3, 2, "a")
        cv.px(7 + t * 3, 15 - t * 3, "s")
    cv.hline(7, 18, 10, "b")
    if has_c:
        cv.px(13, 11, "c"), cv.px(10, 14, "c")


@template
def _chicken(cv, has_c):
    _leaf(cv)
    cv.ellipse(12, 13, 7, 5, "a")
    cv.ellipse(10, 11, 4, 2, "b")
    cv.line(18, 14, 21, 11, "A"), cv.line(18, 15, 21, 16, "A")
    cv.hline(7, 17, 11, "A")
    if has_c:
        cv.px(6, 17, "c"), cv.px(18, 18, "c"), cv.px(4, 16, "c")
    _steam(cv)


@template
def _cake(cv, has_c):
    _plate(cv)
    for i in range(6):
        cv.hline(6, 8 + i * 2, 12, "a" if i % 2 == 0 else "b")
        cv.hline(6, 9 + i * 2, 12, "a" if i % 2 == 0 else "b")
    cv.rect(6, 8, 12, 1, "c" if has_c else "a")
    cv.vline(17, 8, 12, "A")


@template
def _smallcakes(cv, has_c):
    _leaf(cv)
    for x, y in ((7, 14), (16, 14), (12, 11)):
        cv.ellipse(x, y, 4, 2, "a")
        cv.hline(x - 3, y + 2, 7, "A")
        cv.px(x, y, "b")
        if has_c:
            cv.px(x - 1, y - 1, "c")


@template
def _glass(cv, has_c):
    cv.rect(7, 4, 10, 18, "g")
    cv.rect(8, 7, 8, 14, "a")
    cv.rect(8, 16, 8, 5, "b")
    if has_c:
        cv.rect(9, 12, 2, 2, "c"), cv.rect(13, 14, 2, 2, "c")
    cv.rect(9, 7, 3, 3, "G"), cv.rect(13, 8, 2, 2, "G")    # es batu
    cv.vline(8, 5, 16, "G")
    cv.line(14, 1, 16, 8, "p")                              # sedotan
    cv.hline(7, 21, 10, "W")


@template
def _mug(cv, has_c):
    cv.rect(5, 9, 12, 12, "w")
    cv.ellipse(11, 9, 6, 1, "a")
    cv.hline(6, 10, 10, "b")
    cv.ring(18, 14, 3, "w")
    cv.hline(5, 17, 12, "W")
    cv.ellipse(11, 21, 9, 1, "W")
    _steam(cv)


@template
def _coconut(cv, has_c):
    cv.disc(12, 14, 9, "a")
    cv.ellipse(9, 11, 3, 4, "A")
    cv.ellipse(12, 7, 5, 2, "b")                           # potongan atas
    cv.ellipse(12, 7, 3, 1, "B")
    cv.line(13, 7, 17, 0, "p")
    cv.px(16, 12, "s")


def icon(it):
    tpl, a, b, c = it["icon"]
    cv = Canvas(N, N)
    TEMPLATES[tpl](cv, c is not None)
    pal = {**BASE, "a": a, "A": _shade(a, 0.72), "b": b, "B": _shade(b, 0.72),
           "c": c or a, "r": _shade(b, 0.9)}
    cv.outline("O", skip=(".", "x", "p", "P"))
    tier = it["tier"]
    if tier == "spesial":                                      # bingkai emas + bintang
        for x in range(N):
            for y in (0, N - 1):
                if cv.get(x, y) == "." and (x + y) % 2 == 0:
                    cv.px(x, y, "m")
        for y in range(N):
            for x in (0, N - 1):
                if cv.get(x, y) == "." and (x + y) % 2 == 0:
                    cv.px(x, y, "m")
        for dx, dy in ((0, 0), (-1, 0), (1, 0), (0, -1), (0, 1)):
            cv.px(20 + dx, 3 + dy, "y" if (dx, dy) != (0, 0) else "Y")
    elif tier == "legendaris":                                 # aura api merah muda
        ring = []
        for y in range(N):
            for x in range(N):
                if cv.get(x, y) == "." and any(cv.get(x + dx, y + dy) == "O"
                                               for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    ring.append((x, y))
        for x, y in ring:
            cv.px(x, y, "P")
        for x, y in ((3, 4), (20, 3), (2, 12), (21, 10), (19, 20)):
            cv.px(x, y, "Y")
    return render(cv.g, pal)


PADLOCK = [
    "..OOOO..",
    ".O....O.",
    ".O....O.",
    "OOOOOOOO",
    "OmmmmmmO",
    "OmmMMmmO",
    "OmmMMmmO",
    "OmmmmmmO",
    "OOOOOOOO",
]


def locked(img):
    grey = ImageOps.grayscale(img.convert("RGB"))
    tinted = ImageOps.colorize(grey, black="#1e1828", white="#7a7094").convert("RGBA")
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.paste(tinted, (0, 0), img.getchannel("A"))
    cv = Canvas(8, 9)
    for y, line in enumerate(PADLOCK):
        for x, ch in enumerate(line):
            if ch != ".":
                cv.px(x, y, ch)
    out.alpha_composite(render(cv.g, BASE), (N - 9, N - 10))
    return out


def generate():
    data = {"stage_rules": {
        "1": "1 makanan + 1 minuman terbuka; 1 minuman terkunci (koin)",
        "2": "+1 makanan; 1 makanan terkunci",
        "3": "+2 makanan + 1 menu spesial; 1 minuman terkunci",
        "4": "+2 makanan + 1 minuman + 1 menu spesial; 1 dessert terkunci",
        "5": "+2 makanan + 1 menu legendaris; 1 menu legendaris terkunci",
    }, "cities": {}}
    rows, labels = [], []
    for ci, city in enumerate(CITY_ORDER):
        items = []
        row, lab = [], []
        for it in MENU[city]:
            img = icon(it)
            d = OUT / city
            d.mkdir(parents=True, exist_ok=True)
            img.save(d / f"{it['id']}.png")
            scale(img, 4).save(d / f"{it['id']}@4x.png")
            lk = locked(img)
            lk.save(d / f"{it['id']}_locked.png")
            scale(lk, 4).save(d / f"{it['id']}_locked@4x.png")
            entry = {k: v for k, v in it.items() if k != "icon"}
            entry.update(economy(it, ci))
            entry["icon"] = f"food/{city}/{it['id']}.png"
            entry["icon_locked"] = f"food/{city}/{it['id']}_locked.png"
            items.append(entry)
            row.append(img)
            lab.append(it["name"][:14])
            if it["unlock"] == "coins":
                row.append(lk)
                lab.append("(terkunci)")
        data["cities"][city] = {
            "name": CITIES[city]["name"],
            "menu": items,
            "combos": [{"name": n, "items": ids, "bonus": b} for n, ids, b in COMBOS[city]],
        }
        rows.append(row)
        labels.append(lab)
    (OUT / "menu.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    # overview: one row per city (split in two to stay readable)
    split_rows, split_labels = [], []
    for r, lab in zip(rows, labels):
        h = (len(r) + 1) // 2
        split_rows += [r[:h], r[h:]]
        split_labels += [lab[:h], lab[h:]]
    contact_sheet(split_rows, k=4, labels=split_labels, pad=10).save(OUT / "menu_overview.png")


def validate():
    for city in CITY_ORDER:
        ids = [i["id"] for i in MENU[city]]
        assert len(ids) == len(set(ids)), city
        for _, combo, _ in COMBOS[city]:
            assert set(combo) <= set(ids), (city, combo)
        for s in range(1, 6):
            got = [i for i in MENU[city] if i["stage"] == s]
            assert any(i["unlock"] == "coins" for i in got), (city, s)
