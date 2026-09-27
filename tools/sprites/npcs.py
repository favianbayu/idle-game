"""NPC sprites: cast from the concept doc plus background employees & customers.

Humanoid NPCs are built from the same face kit as the main character (so they
double as presets for the customizer). Rempi and Sang Pencicip are hand-drawn.
"""

import random

from . import face
from .character import (BODY_APRON, BODY_DASTER, BODY_JACKET, BODY_KAOS, TAS_BELANJA, compose,
                        full_palette, standard_frames)
from .core import (ASSETS, BASE_PALETTE, blank, contact_sheet, mid, paint, put_all, render, row,
                   save_set, shift, sparkle)

OUT = ASSETS / "npc"
IDLE_GIF = dict(gif_order=[0, 1, 0, 1, 2], durations=[400, 400, 400, 400, 300])

# ------------------------------------------------------------------- Bu Yanti
# Pelanggan setia; her outfit "naik kelas" a little every stage.
BU_YANTI_LOOK = face.look(hair="kerudung", skin="sawo_matang", brows="ramah",
                          accessory="kacamata", mouth="senyum")

BU_YANTI_STAGES = {
    1: {"slug": "kaki_lima", "palette": {  # daster pudar, kerudung instan, kresek
        "g": "#c98a7a", "G": "#9c6258", "L": "#e0aa9a", "k": "#f3e9d8",
        "i": "#e3d3b0", "I": "#b8a57f", "j": "#f6ecd4",
        "t": "#f3f0ea", "T": "#c9c1b8", "f": "#6b4a32"}},
    2: {"slug": "warung_tenda", "palette": {  # daster batik teal
        "g": "#4f86a6", "G": "#2e5570", "L": "#7fb0cc", "k": "#f2e6c9",
        "i": "#5f8a5a", "I": "#3f6040", "j": "#86ad78",
        "t": "#c98a4a", "T": "#8b5a36", "f": "#6b4a32"}},
    3: {"slug": "kedai", "palette": {  # kebaya-ish mustard
        "g": "#c7a34b", "G": "#8c6f2e", "L": "#e2c678", "k": "#fff7e0",
        "i": "#8b4a2b", "I": "#5e3120", "j": "#b06a45",
        "t": "#4f86a6", "T": "#2e5570", "f": "#3a2a30"}},
    4: {"slug": "resto_modern", "palette": {  # tunik modern
        "g": "#4b7a8c", "G": "#2a4b57", "L": "#6fa3b5", "k": "#7cf5e8",
        "i": "#e8e2f0", "I": "#b7aec6", "j": "#ffffff",
        "t": "#c9432a", "T": "#8a1f12", "f": "#1a1620"}},
    5: {"slug": "empire", "palette": {  # gamis ungu motif emas
        "g": "#6b3fa0", "G": "#3e2263", "L": "#8e62c4", "k": "#f2c94c",
        "i": "#f2c94c", "I": "#b8892a", "j": "#fff2a8",
        "t": "#fff2a8", "T": "#f2c94c", "f": "#b8892a"}},
}


def bu_yanti_frames(stage):
    pal = full_palette(BU_YANTI_LOOK, BU_YANTI_STAGES[stage]["palette"])
    pal.setdefault("x", "#3a2a30")

    def build(expression):
        return compose(BU_YANTI_LOOK, BODY_DASTER, items=[TAS_BELANJA], expression=expression)

    return standard_frames(build, pal, squash_row=34)


# ------------------------------------------------------------ Chef Bramantyo
# Rival: jambul klimis, kumis tipis, senyum licik, selalu pegang HP buat konten.
BRAMANTYO_LOOK = face.look(hair="jambul", skin="kuning_langsat", eyes="tajam", brows="galak",
                           mouth="nyengir", facial_hair="kumis_tipis")
BRAMANTYO_PALETTE = {
    "g": "#c9432a", "G": "#8a1f12", "L": "#e8664a", "k": "#f2c94c", "y": "#f2c94c",
    "p": "#1f1b26", "P": "#141119", "f": "#f3efe6", "F": "#b9b2a6",
}


def bramantyo_frames():
    pal = full_palette(BRAMANTYO_LOOK, BRAMANTYO_PALETTE, ["hp"])

    def build(expression):
        return compose(BRAMANTYO_LOOK, BODY_JACKET, items=["hp"], expression=expression)

    return standard_frames(build, pal, tap_expression="pamer", tap_name="pamer")


# -------------------------------------------------------------- Sang Pencicip
# Kritikus misterius: hooded cloak, void face with glowing eyes, golden spoon.
PENCICIP_PALETTE = {
    **BASE_PALETTE,
    "u": "#3e2263", "U": "#26143d", "V": "#6b3fa0", "x": "#120a18",
    "y": "#fff2a8", "v": "#ff8fdc", "k": "#f2c94c", "K": "#b8892a",
}

_CLOAK = {
    4: mid(".........OO........."),
    5: mid("........OVUO........"),
    6: mid(".......OVuuUO......."),
    7: mid("......OVuuuuUO......"),
    8: mid(".....OVuuuuuuUO....."),
    9: mid("....OVuuuuuuuuUO...."),
    10: mid("...OVuuuuuuuuuuUO..."),
    11: mid("..OVuuuuuuuuuuuuUO.."),
    12: mid("..OVuuuxxxxxxuuuUO.."),
    13: mid(".OVuuxxxxxxxxxxuuUO."),
    14: mid(".OVuxxxxxxxxxxxxuUO."),
    15: mid(".OVuxxxxxxxxxxxxuUO."),
    16: mid(".OVuxxyyxxxxyyxxuUO."),
    17: mid(".OVuxxxxxxxxxxxxuUO."),
    18: mid(".OVuxxxxxxxxxxxxuUO."),
    19: mid(".OVuuxxxxxxxxxxuuUO."),
    20: mid(".OVuuuxxxxxxxxuuuUO."),
    21: mid(".OVuuuuxxxxxxuuuuUO."),
    22: mid("OVuuuuuuukkuuuuuuUUO"),
    **{y: row(".....O", "V" + "u" * 8 + "kK" + "u" * 7 + "UU", "O.....") for y in range(23, 27)},
    **{y: row("....OV", "u" * 9 + "kK" + "u" * 8 + "U", "UO....") for y in range(27, 31)},
    **{y: row("...OVu", "u" * 9 + "kK" + "u" * 8 + "U", "UUO...") for y in range(31, 35)},
    35: row("...OUU", "U" * 9 + "kK" + "U" * 9, "UUO..."),
    36: "..." + "".join("OUUO"[(x - 3) % 4] for x in range(3, 29)) + "...",
    37: "..." + "".join(".OO."[(x - 3) % 4] for x in range(3, 29)) + "...",
}


def _spoon(dy):
    """Golden spoon + hand at the viewer-right; dy moves it up (negative)."""
    rows = {
        17: "..OOO.", 18: ".OkyKO", 19: ".OkkKO", 20: ".OKKKO", 21: "..OOO.",
        22: "...K..", 23: "...K..", 24: "...K..", 25: "...K..", 26: "..OKO.",
        27: "UVxxO.", 28: "UUxxO.", 29: "UOOO..",
    }
    return {y + dy: "." * 26 + seg for y, seg in rows.items()}


PENCICIP_PARTICLES = {
    "float1": [(3, 9, "v"), (1, 20, "k"), (4, 31, "v"), (29, 33, "k"), (27, 6, "v")],
    "float2": [(2, 11, "k"), (4, 22, "v"), (2, 33, "k"), (30, 30, "v"), (28, 8, "k")],
    "menilai": [(3, 9, "v"), (1, 20, "k"), (4, 31, "v"), (29, 33, "k")],
}


def pencicip_frames():
    frames = []
    for name in ("float1", "float2", "menilai"):
        g = blank()
        paint(g, _CLOAK)
        if name == "menilai":
            # Eyes flare up, spoon raised to "taste".
            paint(g, {15: mid(".OVuxvyyvxxvyyvxuUO."),
                      16: mid(".OVuxyyyyxxyyyyxuUO."),
                      17: mid(".OVuxvyyvxxvyyvxuUO.")})
            paint(g, _spoon(-6))
            for x, y in ((28, 4), (3, 4), (30, 16)):
                sparkle(g, x, y)
        else:
            paint(g, _spoon(0))
        if name == "float2":
            g = shift(g, -1)
        put_all(g, PENCICIP_PARTICLES[name])
        frames.append((name, render(g, PENCICIP_PALETTE)))
    return frames


# ---------------------------------------------------------------------- Rempi
# Roh rempah: a little chili spirit companion (24x24).
REMPI_PALETTE = {
    "O": "#4a1418", "r": "#d8432a", "R": "#9a2616", "L": "#f07a5a", "W": "#ffd6c8",
    "g": "#6fa044", "G": "#3e6a2a", "e": "#2a0c10", "w": "#ffffff", "m": "#3a0f10",
    "b": "#ffb3a3", "v": "#ff8fdc", "k": "#f2c94c", "Z": "#f2c94c", "z": "#fff4c2",
}

_REMPI = {
    1: "............OO..........",
    2: "...........OgGO.........",
    3: "...........OgO..........",
    4: "........OO.OgO.OO.......",
    5: ".......OggOggGOggO......",
    6: "......OgggggggGGgO......",
    7: "......OrgGggggGGrO......",
    8: ".....OrLWrrrrrrrRO......",
    9: ".....OrLWrrrrrrrrRO.....",
    10: ".....OrLrrrrrrrrrRO.....",
    11: ".....OrLwerrrwerrRO.....",
    12: ".....OrLeerrreerrRO.....",
    13: ".....ObbrrmrrmrbbRO.....",
    14: ".....OrrrrrmmrrrrRO.....",
    15: ".....OrrrrrrrrrrRO......",
    16: ".....ORrrrrrrrrRO.......",
    17: ".....ORrrrrrrrRO........",
    18: ".....ORRrrrrrRO.........",
    19: "....ORRrrrrRO...........",
    20: "....ORRrrRO.............",
    21: "...ORRRRO...............",
    22: "..ORRRO.................",
    23: "..OOO...................",
}

_REMPI_ARMS_DOWN = [(4, 12, "O"), (3, 13, "O"), (4, 13, "r"), (3, 14, "O"), (4, 14, "R"),
                    (4, 15, "O"), (19, 12, "O"), (20, 13, "O"), (19, 13, "r"), (20, 14, "O"),
                    (19, 14, "R"), (19, 15, "O")]
_REMPI_ARMS_UP = [(4, 11, "O"), (3, 10, "O"), (4, 10, "r"), (3, 9, "O"), (4, 9, "r"),
                  (4, 8, "O"), (19, 11, "O"), (20, 10, "O"), (19, 10, "r"), (20, 9, "O"),
                  (19, 9, "r"), (19, 8, "O")]
_REMPI_HAPPY_FACE = [
    (8, 11, "e"), (9, 11, "e"), (13, 11, "e"), (14, 11, "e"),
    (7, 12, "e"), (8, 12, "r"), (9, 12, "r"), (10, 12, "e"),
    (12, 12, "e"), (13, 12, "r"), (14, 12, "r"), (15, 12, "e"),
    (10, 13, "m"), (11, 13, "m"), (12, 13, "m"), (13, 13, "m"),
    (10, 14, "m"), (11, 14, "b"), (12, 14, "b"), (13, 14, "m"),
    (11, 15, "m"), (12, 15, "m"),
]
REMPI_PARTICLES = {
    "float1": [(2, 3, "v"), (20, 2, "k"), (18, 20, "v"), (1, 17, "k")],
    "float2": [(3, 5, "k"), (21, 4, "v"), (19, 18, "k"), (0, 20, "v")],
    "senang": [(2, 3, "v"), (18, 20, "v"), (1, 17, "k")],
}


def rempi_frames():
    frames = []
    for name in ("float1", "float2", "senang"):
        g = blank(24, 24)
        paint(g, _REMPI)
        if name == "senang":
            put_all(g, _REMPI_ARMS_UP + _REMPI_HAPPY_FACE)
            sparkle(g, 20, 4)
        else:
            put_all(g, _REMPI_ARMS_DOWN)
        if name == "float2":
            g = shift(g, -1)
        put_all(g, REMPI_PARTICLES[name])
        frames.append((name, render(g, REMPI_PALETTE)))
    return frames


# ------------------------------------------------------------------- Karyawan
# Background employees per stage (unlocked via tab Karyawan from stage 3).
KARYAWAN = {
    "stage3_kedai": {
        "body": BODY_APRON, "hat": "topi_pet",
        "palette": {"c": "#c7a34b", "C": "#8c6f2e", "k": "#fff7e0",
                    "g": "#f3efe6", "G": "#c4bbab", "L": "#ffffff",
                    "a": "#c7a34b", "A": "#8c6f2e", "q": "#fff7e0",
                    "p": "#3a3446", "P": "#28232f", "f": "#6b4a32",
                    "i": "#c7a34b", "I": "#8c6f2e", "j": "#e2c678"},
    },
    "stage4_resto_modern": {
        "body": BODY_KAOS, "hat": "topi_pet",
        "palette": {"c": "#4b7a8c", "C": "#2a4b57", "k": "#7cf5e8",
                    "g": "#3d6272", "G": "#28434f", "L": "#5f97ab", "q": "#7cf5e8",
                    "p": "#1f1b26", "P": "#141119", "f": "#1a1620", "F": "#0d0b10",
                    "i": "#2a4b57", "I": "#1a3038", "j": "#4b7a8c"},
    },
    "stage5_empire": {
        "body": BODY_JACKET, "hat": "topi_kain",
        "palette": {"c": "#8e62c4", "C": "#6b3fa0", "B": "#f2c94c",
                    "g": "#6b3fa0", "G": "#3e2263", "L": "#8e62c4", "k": "#f2c94c",
                    "y": "#f2c94c", "p": "#1f1b26", "P": "#141119", "f": "#1a1620",
                    "F": "#0d0b10", "i": "#8e62c4", "I": "#6b3fa0", "j": "#b18ae0"},
    },
}

KARYAWAN_LOOKS = {
    "a": face.look(hair="cepak", skin="cokelat", brows="tebal"),
    "b": face.look(hair="kerudung", skin="kuning_langsat", eyes="berbinar"),
}


def karyawan_frames(kind, variant):
    k = KARYAWAN[kind]
    lk = KARYAWAN_LOOKS[variant]
    hat = None if lk["hair"] == "kerudung" else k["hat"]
    pal = full_palette(lk, k["palette"], ["nampan"])

    def build(expression):
        return compose(lk, k["body"], hat=hat, items=["nampan"], expression=expression)

    return standard_frames(build, pal, tap_name="senang")


# ------------------------------------------------------------------ Pelanggan
# Random customers rolled from the face kit (seeded so output is stable).
SHIRTS = [
    ("#c9432a", "#8a1f12", "#e8664a"), ("#4f86a6", "#2e5570", "#7fb0cc"),
    ("#6b7a3a", "#4a5528", "#8a9a4e"), ("#c7a34b", "#8c6f2e", "#e2c678"),
    ("#e3d3b0", "#b8a57f", "#f6ecd4"), ("#7b4fb0", "#4d2d78", "#a07ad0"),
    ("#3e3a4a", "#2c2836", "#5a5468"), ("#d27a5c", "#a3553c", "#eaa184"),
]
PANTS = [("#3e3a4a", "#2c2836"), ("#2e5570", "#1d3a4d"), ("#6b4a32", "#4a3222"),
         ("#1f1b26", "#141119")]
PRINTS = ["#f3e9d8", "#f2c94c", "#1f1b26", None]


def roll_customers(n=8, seed=17):
    rnd = random.Random(seed)
    out = []
    for i in range(n):
        hijab = rnd.random() < 0.3
        hair = "kerudung" if hijab else rnd.choice(
            ["pendek", "cepak", "belah_tengah", "jambul", "gondrong", "cepol", "keriting", "botak"])
        lk = face.look(
            skin=rnd.choice(list(face.SKIN_TONES)),
            hair=hair,
            hair_color=rnd.choice(["hitam", "hitam", "hitam", "cokelat_tua", "uban", "pirang",
                                   "merah"]),
            hijab_color=rnd.choice(list(face.HIJAB_COLORS)),
            eyes=rnd.choice(list(face.EYES)),
            brows=rnd.choice(list(face.BROWS)),
            mouth=rnd.choice(["senyum", "senyum", "datar", "nyengir"]),
            facial_hair="none" if hijab or rnd.random() < 0.5 else rnd.choice(
                [k for k in face.FACIAL_HAIR if k != "none"]),
            accessory=rnd.choice(["none", "none", "none", "kacamata", "kacamata_hitam",
                                  "tahi_lalat"]),
        )
        g, G, L = rnd.choice(SHIRTS)
        p, P = rnd.choice(PANTS)
        prt = rnd.choice(PRINTS) or g
        body = BODY_DASTER if hijab and rnd.random() < 0.6 else BODY_KAOS
        outfit = {"g": g, "G": G, "L": L, "q": prt, "k": "#f3e9d8", "p": p, "P": P,
                  "f": "#2a2430", "F": "#16121a"}
        out.append((f"pelanggan_{i + 1:02d}", lk, body, outfit))
    return out


def pelanggan_frames(lk, body, outfit):
    pal = full_palette(lk, outfit)

    def build(expression):
        return compose(lk, body, expression=expression)

    return standard_frames(build, pal, squash_row=34 if body is BODY_DASTER else 27,
                           tap_name="senang")


# ------------------------------------------------------------------- generate
def generate():
    overview, labels = [], []

    by = []
    for stage, st in BU_YANTI_STAGES.items():
        frames = bu_yanti_frames(stage)
        save_set(OUT / "bu_yanti" / f"stage{stage}_{st['slug']}", frames, **IDLE_GIF)
        by.append(frames[0][1])
    overview.append(by)
    labels.append([f"Bu Yanti s{s}" for s in BU_YANTI_STAGES])

    cast = []
    frames = bramantyo_frames()
    save_set(OUT / "chef_bramantyo", frames, **IDLE_GIF)
    cast += [(f"Bramantyo {n}", im) for n, im in frames]
    frames = pencicip_frames()
    save_set(OUT / "sang_pencicip", frames, gif_order=[0, 1, 0, 1, 2],
             durations=[500, 500, 500, 500, 600])
    cast += [(f"Pencicip {n}", im) for n, im in frames[:2]]
    overview.append([im for _, im in cast])
    labels.append([n for n, _ in cast])

    frames = rempi_frames()
    save_set(OUT / "rempi", frames, gif_order=[0, 1, 0, 1, 2], durations=[450, 450, 450, 450, 400])
    k_row, k_labels = [im for _, im in frames], [f"Rempi {n}" for n, _ in frames]
    k_row.append(pencicip_frames()[2][1])
    k_labels.append("Pencicip menilai")
    overview.append(k_row)
    labels.append(k_labels)

    kr, kl = [], []
    for kind in KARYAWAN:
        for variant in KARYAWAN_LOOKS:
            frames = karyawan_frames(kind, variant)
            save_set(OUT / "karyawan" / f"{kind}_{variant}", frames, **IDLE_GIF)
            kr.append(frames[0][1])
            kl.append(f"{kind.split('_')[0]} {variant}")
    overview.append(kr)
    labels.append(kl)

    cr, cl = [], []
    for name, lk, body, outfit in roll_customers():
        frames = pelanggan_frames(lk, body, outfit)
        save_set(OUT / "pelanggan" / name, frames, **IDLE_GIF)
        cr.append(frames[0][1])
        cl.append(name.replace("pelanggan_", "plg "))
    overview += [cr[:4], cr[4:]]
    labels += [cl[:4], cl[4:]]

    contact_sheet(overview, k=5, labels=labels, cell=(32, 40), pad=10).save(
        OUT / "npc_overview.png")
