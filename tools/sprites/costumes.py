"""City costumes for the main character + cooking animation.

Stage 1-2 swap the headwear and shirt for the city's traditional look;
every stage gets the city's scarf (sarung kotak, batik, poleng, merah-putih).
"""

from . import face
from .character import HATS, compose, full_palette, standard_frames
from .cities import CITIES, CITY_ORDER
from .core import ASSETS, contact_sheet, mid, render, save_set, sparkle
from .main_character import PARTICLES, STAGES

OUT = ASSETS / "main" / "kota"

# ---------------------------------------------------------------- headwear
HATS["peci"] = {"clip": 11, "layer": {                       # peci hitam Betawi
    5: mid("......OOOOOOOO......"),
    6: mid(".....OCCCCCCCCO....."),
    7: mid("....OcccccccccccO..."[:20]),
    8: mid("....OccccccccccO...."),
    9: mid("....OccccccccccO...."),
    10: mid("...OOccccccccccOO..."),
    11: mid("...OOOOOOOOOOOOOO..."),
}}
HATS["iket"] = {"clip": 10, "layer": {                       # iket Sunda, simpul lancip
    5: mid("........OO.........."),
    6: mid(".......OccO........."),
    7: mid("......OcCccO........"),
    8: mid(".....OcccCccO......."),
    9: mid("....OccCccccccccO..."),
    10: mid("..OOccccccccccccOO.."),
    11: mid(".OcCccCccCccCccCccO."),
    12: mid("OccccccccccccccccccO"),
    13: mid("OCccCccCccCccCccCcCO"),
}}
HATS["udeng"] = {"clip": 10, "layer": {                      # udeng Bali putih
    5: mid(".........OO........."),
    6: mid("........OccO........"),
    7: mid("........OcCO........"),
    8: mid(".......OcccCO......."),
    9: mid("....OOOOcccCOOOO...."),
    10: mid("..OccccccccccccccO.."),
    11: mid(".OcccCccccccccCcccO."),
    12: mid("OccccCccccccccCccccO"),
    13: mid("OCCCCCCCCCCCCCCCCCCO"),
}}
HATS["odheng"] = {"clip": 10, "layer": {                     # odheng Madura-Suroboyo
    7: mid("...OO..........OO..."),
    8: mid("...OcO........OcO..."),
    9: mid("...OcCOOOOOOOOCcO..."),
    10: mid("..OccccccccccccccO.."),
    11: mid(".OcCccCccCccCccCccO."),
    12: mid("OccccccccccccccccccO"),
    13: mid("OCCCCCCCCCCCCCCCCCCO"),
}}

SCARF = {
    24: mid("....O1212121212O...."),
    25: mid("....O2121212121O...."),
    26: mid("............O12O...."),
    27: mid("............O21O...."),
    28: mid("............O12O...."),
    29: mid("............OOOO...."),
}

COSTUME = {
    "jakarta": {  # sadariah putih, peci, sarung kotak di leher
        "hat": "peci", "scarf": ("#c9432a", "#3f8a4a"),
        "hat_palette": {"c": "#1e1822", "C": "#6a5a78"},
        "shirt": {"g": "#f3efe6", "G": "#c9c1b3", "L": "#ffffff"}, "stripes": False},
    "bandung": {  # pangsi hitam, iket batik
        "hat": "iket", "scarf": ("#6b3a22", "#c9a060"),
        "hat_palette": {"c": "#6b3a22", "C": "#c9a060"},
        "shirt": {"g": "#2b2530", "G": "#1e1420", "L": "#4a4250", "p": "#2b2530", "P": "#1e1420"},
        "stripes": False},
    "bali": {  # baju putih, udeng, selendang poleng
        "hat": "udeng", "scarf": ("#1e1420", "#fbf6ec"),
        "hat_palette": {"c": "#f3efe6", "C": "#c9c1b3"},
        "shirt": {"g": "#f0e6d0", "G": "#c9bba0", "L": "#fffaf0", "p": "#6b3a22", "P": "#4a2a18"},
        "stripes": False},
    "surabaya": {  # kaos loreng merah-putih ala sakera, odheng
        "hat": "odheng", "scarf": ("#d8322a", "#fbf6ec"),
        "hat_palette": {"c": "#8a3a22", "C": "#e0b04a"},
        "shirt": {"g": "#d8322a", "G": "#8a1f12", "L": "#f06a5a", "p": "#2b2530", "P": "#1e1420"},
        "stripes": True},
}


def _stripes(grid):
    for y in range(24, 33, 2):
        for x in range(len(grid[0])):
            if grid[y][x] in "gL":
                grid[y][x] = "2"
            elif grid[y][x] == "G":
                grid[y][x] = "W" if False else "3"
    return grid


def costume_parts(city, stage, lk):
    cos = COSTUME[city]
    st = STAGES[stage]
    hat = cos["hat"] if stage <= 2 else st["hat"]
    pal = full_palette(lk, {}, ["sutil"])
    pal.update(st["palette"])
    if stage <= 2:
        pal.update(cos["shirt"])
        pal.update(cos["hat_palette"])
    pal.update({"1": cos["scarf"][0], "2": cos["scarf"][1], "3": "#cfc6b6"})
    extras = list(st["extras"]) + [SCARF]
    stripes = cos["stripes"] and stage <= 2
    return hat, pal, extras, stripes


def city_frames(city, stage, lk=None):
    lk = lk or face.look()
    hat, pal, extras, stripes = costume_parts(city, stage, lk)
    st = STAGES[stage]

    def build(expression):
        g = compose(lk, st["body"], hat=hat, items=["sutil"], extras=extras, expression=expression)
        return _stripes(g) if stripes else g

    particles = (lambda name: PARTICLES[name]) if stage == 5 else None
    return standard_frames(build, pal, extra_points=particles)


# ------------------------------------------------------------- memasak
# Tossing the wok: wok height, food height (None = in the wok), flame phase.
COOK_POSES = [(0, None, 0), (-2, -4, 1), (-1, -9, 0), (0, -3, 1)]


def _wok(dy, food_dy, flame):
    y0 = 29 + dy
    lay = {
        y0: "." * 23 + "dOMMMMMMO",
        y0 + 1: "." * 24 + ".ONNNNO.",
        y0 + 2: "." * 24 + "..OOOO..",
    }
    lay = {y: (row + "." * 32)[:32] for y, row in lay.items()}
    fl = {32: "." * 25 + ("o.f.o." if flame else ".f.o.f"), 33: "." * 25 + (".f.f.." if flame else "..f.f.")}
    for y, row in fl.items():
        lay[y] = (row + "." * 32)[:32]
    if food_dy is None:
        lay[y0 - 1] = ("." * 25 + "ovyo" + "." * 10)[:32]
    else:
        fy = y0 + food_dy
        lay[fy] = ("." * 25 + "o.v." + "." * 10)[:32]
        lay[fy - 1] = ("." * 26 + "y.o" + "." * 10)[:32]
    return lay


def cooking_frames(city=None, stage=1, lk=None):
    lk = lk or face.look()
    st = STAGES[stage]
    if city:
        hat, pal, extras, stripes = costume_parts(city, stage, lk)
    else:
        hat, extras, stripes = st["hat"], list(st["extras"]), False
        pal = full_palette(lk, {}, ["sutil"])
        pal.update(st["palette"])
    pal = {**pal, "M": "#b9c2c7", "N": "#4a4250", "d": "#8b5a36", "o": "#d98a3a",
           "y": "#f2c94c", "v": "#6fa044", "f": "#f2a93b", "Z": "#f2c94c", "z": "#fff4c2"}
    fist = {30: "." * 25 + "s" + "." * 6, 31: "." * 25 + "S" + "." * 6, 32: "." * 25 + "O" + "." * 6}
    frames = []
    for i, (dy, food_dy, flame) in enumerate(COOK_POSES):
        extras_i = [e for e in extras if not any("v" in r or "k" in r for r in e.values())] \
            if stage == 5 else extras
        g = compose(lk, st["body"], hat=hat, extras=extras_i + [fist, _wok(dy, food_dy, flame)],
                    expression="senang" if i == 2 else None)
        if stripes:
            g = _stripes(g)
        if i == 2:
            sparkle(g, 30, 14)
        frames.append((f"masak{i + 1}", render(g, pal)))
    return frames


def generate():
    rows, labels = [], []
    for city in CITY_ORDER:
        row = []
        for stage in range(1, 6):
            frames = city_frames(city, stage)
            cook = cooking_frames(city, stage)
            save_set(OUT / city / f"stage{stage}", frames + cook,
                     gif_order=[0, 1, 0, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6],
                     durations=[400, 400, 400, 400, 300] + [120] * 8)
            row.append(frames[0][1])
        rows.append(row)
        labels.append([f"{CITIES[city]['name']} s{s}" for s in range(1, 6)])
    contact_sheet(rows, k=5, labels=labels, pad=8).save(ASSETS / "main" / "kostum_kota_preview.png")
    cook_rows = [[im for _, im in cooking_frames(c, 1)] for c in CITY_ORDER]
    contact_sheet(cook_rows, k=5, labels=[[f"{c} masak{i + 1}" for i in range(4)] for c in CITY_ORDER],
                  pad=8).save(ASSETS / "main" / "animasi_masak_preview.png")
