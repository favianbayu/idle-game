"""Rare easter-egg customers.

These are ORIGINAL characters built on well-known archetypes (shonen warrior,
magical girl, mecha pilot, wandering samurai, detective, food vlogger, dangdut
star, badminton legend). They wink at anime and pop culture without copying any
specific copyrighted character or real person's likeness.
"""

import json

from . import face
from .character import BODY_DASTER, BODY_JACKET, BODY_KAOS, BODY_ROBE, HATS, compose, full_palette
from .core import ASSETS, E6, contact_sheet, mid, render, row, save_set
from .draw import Canvas
from .npc_anim import customer_frames

OUT = ASSETS / "npc" / "easter_egg"


def _layer_from_canvas(cv):
    return {y: "".join(r) for y, r in enumerate(cv.g) if any(ch != "." for ch in r)}


# ------------------------------------------------------------ new hair
def _jabrik():
    cv = Canvas(32, 40)
    for y, line in face.HAIR["pendek"]["front"].items():
        for x, ch in enumerate(line):
            if ch not in ".O":
                cv.px(x, y, ch)
    spikes = [0, 3, 6, 4, 1, 5, 8, 5, 2, 7, 7, 2, 5, 8, 5, 1, 4, 6, 3, 0]
    for i, h in enumerate(spikes):
        x = 6 + i
        for y in range(10 - h, 11):
            cv.px(x, y, "H" if (i % 4 == 1 and y < 8) else "h")
    for x, y in ((5, 12), (4, 13), (26, 12), (27, 13)):             # jambang lancip
        cv.px(x, y, "h")
    cv.outline("O")
    return _layer_from_canvas(cv)


def _kuncir_dua():
    cv = Canvas(32, 40)
    for side in (-1, 1):
        cx = 16 + side * 12
        for y in range(11, 28):
            w = 2 if y < 24 else 1
            for dx in range(-w, w + 1):
                cv.px(cx + dx + (side if y > 18 else 0), y, "h")
        cv.rect(cx - 2, 12, 5, 2, "b")                                # ikat rambut
    cv.outline("O")
    return _layer_from_canvas(cv)


face.HAIR["jabrik"] = {"name": "Jabrik", "front": _jabrik()}
face.HAIR["kuncir_dua"] = {"name": "Kuncir dua", "front": face.HAIR["pendek"]["front"],
                           "back": _kuncir_dua()}

# ------------------------------------------------------------ new hats
HATS["caping"] = {"clip": 11, "layer": {
    3: mid(".........OO........."),
    4: mid("........OccO........"),
    5: mid(".......OcCccO......."),
    6: mid("......OccCcccO......"),
    7: mid(".....OcccCccccO....."),
    8: mid("...OOccccCcccccOO..."),
    9: mid(".OOccccccCccccccccO."[:20]),
    10: row("....OO", "cccccccCcccccccccccc", "OO...."),
    11: row("..OOOO", "O" * 20, "OOOO.."),
}}
HATS["deerstalker"] = {"clip": 11, "layer": {
    6: mid("......OOOOOOOO......"),
    7: mid(".....OcCcCcCcCO....."),
    8: mid("....OcCcCcCcCcCO...."),
    9: mid("...OcCcCcCcCcCcCO..."),
    10: mid("..OcCcCcCcCcCcCcCO.."),
    11: mid(".OOOOOOOOOOOOOOOOOO."),
    12: mid("OcO..............OcO"),
    13: mid("OcO..............OcO"),
    14: mid(".O................O."),
}}
HATS["headset"] = {"clip": None, "layer": {
    12: mid("OO................OO"),
    13: mid("Oc................cO"),
    14: mid("Oc................cO"),
    15: mid("OO................OO"),
}}


def _item(rows):
    return {y: (("." * 26 + seg) + "." * 6)[:32] for y, seg in rows.items()}


FIST = {30: row(E6, "." * 19 + "s", "O....."), 31: row(E6, "." * 19 + "S", "O....."),
        32: row(E6, "." * 19 + "O", E6)}

ITEMS = {
    "tongkat_bintang": {**_item({12: "..O...", 13: ".OyO..", 14: "OyYyO.", 15: ".OyO..", 16: "O.O.O.",
                                 17: "..d...", 18: "..d...", 19: "..d...", 20: "..d...", 21: ".d....",
                                 22: ".d....", 23: ".d....", 24: ".d....", 25: "d.....", 26: "d.....",
                                 27: "d.....", 28: "d.....", 29: "d....."}), **FIST},
    "kaca_pembesar": {**_item({20: ".OOO..", 21: "OgGgO.", 22: "OgggO.", 23: ".OOO..", 24: "..d...",
                               25: ".d....", 26: ".d....", 27: "d.....", 28: "d.....", 29: "d....."}),
                      **FIST},
    "kamera": {**_item({24: "OOOOO.", 25: "OnnGO.", 26: "OngnO.", 27: "OnnnO.", 28: "OOOOO."}), **FIST},
    "raket": {**_item({12: ".OOO..", 13: "OxgxO.", 14: "OgxgO.", 15: "OxgxO.", 16: "OgxgO.",
                       17: ".OOO..", 18: "..d...", 19: "..d...", 20: ".d....", 21: ".d....",
                       22: ".d....", 23: "d.....", 24: "d.....", 25: "d.....", 26: "d.....",
                       27: "d.....", 28: "d.....", 29: "d....."}), **FIST},
}
GITAR = {y: line for y, line in {
    20: mid("..................OO"),
    21: mid(".................Od."),
    22: mid("................Od.."),
    23: mid("...............Od..."),
    24: mid("..............Od...."),
    25: mid(".............Od....."),
    26: mid("......OOOO..Od......"),
    27: mid(".....OyyyyOOd......."),
    28: mid("....OyyyyyydO......."),
    29: mid("....OyyOOyyyO......."),
    30: mid("....OyyOOyyyO......."),
    31: mid("....OyyyyyyyO......."),
    32: mid(".....OyyyyyO........"),
    33: mid("......OOOOO........."),
}.items()}
KATANA = {y: row(seg, "." * 20, E6) for y, seg in {
    25: "....Oy", 26: "....Oy", 27: "...On.", 28: "...On.", 29: "..On..", 30: "..On..",
    31: ".On...", 32: ".On...", 33: "On....", 34: "On....", 35: "O.....",
}.items()}

EASTER = [
    {"id": "pendekar_jabrik", "name": "Pendekar Jabrik",
     "homage": "petarung shonen berambut jabrik dengan aura emas",
     "look": dict(hair="jabrik", eyes="tajam", brows="galak", mouth="nyengir", skin="kuning_langsat"),
     "body": BODY_KAOS, "hat": None, "items": [], "extras": [], "aura": "A",
     "palette": {"h": "#f2c94c", "H": "#fff2a8", "g": "#f3efe6", "G": "#c9c1b3", "L": "#ffffff",
                 "q": "#3f5aa8", "p": "#f3efe6", "P": "#c9c1b3", "f": "#3f5aa8", "F": "#2a3a70",
                 "A": "#fff2a8"},
     "chance": 0.002, "reward": 10, "quote": "Kekuatan... NASI GORENG ini... melebihi 9000 rasa!"},
    {"id": "gadis_penyihir", "name": "Gadis Penyihir Rasa",
     "homage": "magical girl dengan tongkat bintang",
     "look": dict(hair="kuncir_dua", eyes="berbinar", mouth="ketawa", skin="pucat"),
     "body": BODY_DASTER, "hat": None, "items": [ITEMS["tongkat_bintang"]], "extras": [], "aura": None,
     "palette": {"h": "#ff6fb0", "H": "#ffb0d8", "p": "#7cf5e8", "g": "#ff8fdc", "G": "#c9509a",
                 "L": "#ffc0e8", "k": "#fbf6ec", "f": "#fbf6ec", "d": "#ff8fdc", "y": "#f2c94c",
                 "Y": "#fff2a8"},
     "chance": 0.003, "reward": 8, "quote": "Atas nama bulan, aku pesan seporsi lagi!"},
    {"id": "pilot_mecha", "name": "Pilot Robot Raksasa",
     "homage": "pilot mecha dengan setelan tempur",
     "look": dict(hair="pendek", hair_color="cokelat_tua", eyes="sayu", mouth="datar", skin="pucat"),
     "body": BODY_KAOS, "hat": "headset", "items": [], "extras": [], "aura": None,
     "palette": {"c": "#d8432a", "g": "#f3efe6", "G": "#c9c1b3", "L": "#ffffff", "q": "#d8432a",
                 "p": "#f3efe6", "P": "#c9c1b3", "f": "#d8432a", "F": "#8a1f12"},
     "chance": 0.003, "reward": 8, "quote": "Aku tidak boleh lari... dari antrean ini."},
    {"id": "samurai_pengembara", "name": "Samurai Pengembara",
     "homage": "ronin bertopi caping",
     "look": dict(hair="gondrong", eyes="tajam", mouth="datar", skin="sawo_matang"),
     "body": BODY_ROBE, "hat": "caping", "items": [], "extras": [KATANA], "aura": None,
     "palette": {"c": "#d8b860", "C": "#a8883a", "g": "#4a5a7a", "G": "#2e3a52", "L": "#6a7a9a",
                 "k": "#f3e9d8", "K": "#c9c1b3", "J": "#c9432a", "n": "#2b2530", "y": "#f2c94c"},
     "chance": 0.002, "reward": 10, "quote": "Pedangku sudah pensiun. Sekarang aku berburu sambal."},
    {"id": "detektif_bertopi", "name": "Detektif Bertopi",
     "homage": "detektif klasik dengan kaca pembesar",
     "look": dict(hair="belah_tengah", eyes="tajam", brows="tebal", mouth="nyengir", skin="kuning_langsat"),
     "body": BODY_JACKET, "hat": "deerstalker", "items": [ITEMS["kaca_pembesar"]], "extras": [],
     "aura": None,
     "palette": {"c": "#8a6a4a", "C": "#6b4a32", "g": "#8a6a4a", "G": "#5e4632", "L": "#a88a6a",
                 "k": "#3a2a22", "y": "#3a2a22", "p": "#3a3446", "P": "#28232f", "f": "#2a2430",
                 "F": "#16121a", "d": "#6b4a32", "g2": "#bfe6ea"},
     "chance": 0.004, "reward": 6, "quote": "Hmm... ada rahasia di balik kuah ini. Elementer!"},
    {"id": "food_vlogger", "name": "Food Vlogger Viral",
     "homage": "kreator kuliner yang selalu merekam",
     "look": dict(hair="cepak", eyes="berbinar", mouth="ketawa", skin="cokelat"),
     "body": BODY_KAOS, "hat": "topi_pet", "items": [ITEMS["kamera"]], "extras": [], "aura": None,
     "palette": {"c": "#2b2530", "C": "#1e1420", "k": "#f2c94c", "g": "#3fb0a0", "G": "#2a7a70",
                 "L": "#6fd0c0", "q": "#fbf6ec", "p": "#2b2530", "P": "#1e1420", "f": "#fbf6ec",
                 "F": "#c9c1b3", "n": "#2b2530", "G2": "#7cf5e8"},
     "chance": 0.006, "reward": 5, "quote": "Guys, ini enak banget sih, jujur! Jangan lupa subscribe."},
    {"id": "raja_dangdut", "name": "Raja Panggung Dangdut",
     "homage": "bintang dangdut berkumis dengan gitar",
     "look": dict(hair="keriting", eyes="bulat", mouth="ketawa", facial_hair="kumis_baplang",
                  accessory="kacamata_hitam", skin="sawo_matang"),
     "body": BODY_JACKET, "hat": None, "items": [], "extras": [GITAR], "aura": None,
     "palette": {"g": "#d8322a", "G": "#8a1f12", "L": "#f06a5a", "k": "#f2c94c", "y": "#f2c94c",
                 "p": "#fbf6ec", "P": "#c9c1b3", "f": "#fbf6ec", "F": "#c9c1b3", "d": "#6b3a22"},
     "chance": 0.003, "reward": 8, "quote": "Terlalu! Masakan ini terlalu enak!"},
    {"id": "legenda_bulutangkis", "name": "Legenda Bulutangkis",
     "homage": "atlet bulutangkis juara dunia",
     "look": dict(hair="pendek", eyes="tajam", mouth="senyum", skin="sawo_matang"),
     "body": BODY_KAOS, "hat": "ikat_kepala", "items": [ITEMS["raket"]], "extras": [], "aura": None,
     "palette": {"r": "#d8322a", "W": "#fbf6ec", "g": "#d8322a", "G": "#8a1f12", "L": "#f06a5a",
                 "q": "#fbf6ec", "p": "#fbf6ec", "P": "#c9c1b3", "f": "#fbf6ec", "F": "#c9c1b3",
                 "d": "#2b2530", "x": "#fbf6ec"},
     "chance": 0.004, "reward": 6, "quote": "Smash! Satu porsi lagi buat tenaga final!"},
]


def _aura(grid, key):
    add = []
    for y in range(len(grid)):
        for x in range(len(grid[0])):
            if grid[y][x] == "." and any(0 <= y + dy < len(grid) and 0 <= x + dx < len(grid[0])
                                         and grid[y + dy][x + dx] == "O"
                                         for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                add.append((x, y))
    for x, y in add:
        grid[y][x] = key
    return grid


def build_frames(e):
    lk = face.look(**e["look"])
    pal = full_palette(lk, e["palette"])
    pal.update({"n": "#2b2530", "g": e["palette"]["g"], "G": e["palette"]["G"],
                "Y": pal.get("Y", "#fff2a8"), "x": pal.get("x", "#3a2a30"), "d": pal.get("d", "#6b4a32")})
    if e["id"] == "detektif_bertopi":
        pal["g"] = e["palette"]["g"]
    pal.setdefault("y", "#f2c94c")
    pal.setdefault("c", "#fbf6ec")
    pal.setdefault("C", "#cfc6b6")

    def build(expr):
        g = compose(lk, e["body"], hat=e["hat"], items=e["items"], extras=e["extras"], expression=expr)
        return _aura(g, e["aura"]) if e["aura"] else g

    squash_row = 34 if e["body"] is BODY_DASTER else 27
    return customer_frames(build, pal, squash_row)


def generate():
    rows, labels, meta = [], [], []
    for e in EASTER:
        frames = build_frames(e)
        save_set(OUT / e["id"], frames, gif_order=[0, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8],
                 durations=[140] * 4 + [500] * 4 + [160, 160, 300])
        rows.append(frames[4][1])
        labels.append(e["name"][:16])
        meta.append({k: e[k] for k in ("id", "name", "homage", "chance", "reward", "quote")})
    contact_sheet([rows[:4], rows[4:]], k=5, labels=[labels[:4], labels[4:]], pad=12).save(
        OUT / "easter_egg_preview.png")
    (OUT / "easter_egg.json").write_text(json.dumps({
        "catatan": "chance = peluang muncul per pelanggan baru; reward = pengali bayaran. "
                   "Semua karakter original (homage arketipe), bukan tiruan karakter/tokoh tertentu.",
        "npc": meta}, indent=2, ensure_ascii=False) + "\n")


_ = render
