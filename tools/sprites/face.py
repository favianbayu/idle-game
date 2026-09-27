"""Face customization kit.

Every humanoid (main character, NPCs, customers) shares one head geometry, so
any option below fits any character. A *look* picks one option per category;
colours are palette ramps swapped by key (skin: s/S/l, hair: h/H, hijab: i/I/j).

Layout on the 32x40 canvas: head rows 9-23, eyes rows 17-19 at cols 11-12 and
19-20, mouth rows 20-22 at cols 14-17. Rows are written as `mid(...)` = cols 6-25.
"""

from .core import E6, mid, row

# ---------------------------------------------------------------- colour ramps
SKIN_TONES = {
    "kuning_langsat": {"name": "Kuning langsat", "s": "#f1c79e", "S": "#cf9a72", "l": "#fbdcbc"},
    "sawo_matang": {"name": "Sawo matang", "s": "#d99a6c", "S": "#b0714b", "l": "#f0bb8e"},
    "cokelat": {"name": "Cokelat", "s": "#b5774a", "S": "#8c5433", "l": "#cf915f"},
    "gelap": {"name": "Cokelat gelap", "s": "#8a5433", "S": "#653a22", "l": "#a5683f"},
    "pucat": {"name": "Terang", "s": "#f7dcc6", "S": "#dcb294", "l": "#fff0e2"},
}

HAIR_COLORS = {
    "hitam": {"name": "Hitam", "h": "#33242b", "H": "#56404a"},
    "cokelat_tua": {"name": "Cokelat tua", "h": "#5a3a28", "H": "#80583c"},
    "uban": {"name": "Uban", "h": "#8f8c96", "H": "#c4c2cc"},
    "pirang": {"name": "Pirang (cat)", "h": "#c98b3a", "H": "#ecc06a"},
    "merah": {"name": "Merah (cat)", "h": "#9c3b2e", "H": "#c9604a"},
}

HIJAB_COLORS = {
    "hijau": {"name": "Hijau", "i": "#5f8a5a", "I": "#3f6040", "j": "#86ad78"},
    "merah_bata": {"name": "Merah bata", "i": "#b5553c", "I": "#843826", "j": "#d27a5c"},
    "biru": {"name": "Biru", "i": "#4f86a6", "I": "#2e5570", "j": "#7fb0cc"},
    "krem": {"name": "Krem", "i": "#e3d3b0", "I": "#b8a57f", "j": "#f6ecd4"},
    "ungu": {"name": "Ungu", "i": "#7b4fb0", "I": "#4d2d78", "j": "#a07ad0"},
}

# ------------------------------------------------------------------ head base
HEAD_BASE = {
    9: mid("....OOOOOOOOOOOO...."),
    10: mid("..OOllllssssssssOO.."),
    11: mid(".Olll" + "s" * 12 + "SO."),
    12: mid("Oll" + "s" * 15 + "SO"),
    13: mid("O" + "s" * 17 + "SO"),
    14: mid("O" + "s" * 17 + "SO"),
    15: mid("O" + "s" * 17 + "SO"),
    16: mid("O" + "s" * 17 + "SO"),
    17: mid("O" + "s" * 17 + "SO"),
    18: mid("O" + "s" * 17 + "SO"),
    19: mid("O" + "s" * 17 + "SO"),
    20: mid("OS" + "s" * 16 + "SO"),
    21: mid(".OS" + "s" * 13 + "SSO."),
    22: mid("..OS" + "s" * 10 + "SSSO.."),
    23: mid("...OOOOOOOOOOOOOO..."),
}

BLUSH = {20: mid("...bb..........bb...")}

# ------------------------------------------------------------------------ hair
# "front" is drawn over the face, "back" behind the body (long hair).
_PENDEK_TOP = {
    9: mid("....OOOOOOOOOOOO...."),
    10: mid("..OOhhhhhhhhhhhhOO.."),
    11: mid(".OhhhHHHhhhhhhhhhhO."),
    12: mid("OhhHHHhhhhhhhhhhhhhO"),
    13: mid("OhhHhhhhhhhhhhhhhhhO"),
    14: mid("OhhhhhhhhhhhhhhhhhhO"),
}
_SIDEBURNS = {y: mid("Oh" + "." * 16 + "hO") for y in range(16, 20)}

_BELAH_TENGAH = {
    9: mid("....OOOOOOOOOOOO...."),
    10: mid("..OOHHhhh..hhhhhOO.."),
    11: mid(".OhHHhhhh..hhhhhhhO."),
    12: mid("OhHHhhhhh..hhhhhhhhO"),
    13: mid("Ohhhhhhh....hhhhhhhO"),
    14: mid("Ohhhhhh......hhhhhhO"),
    15: mid("Ohhhhh........hhhhhO"),
    16: mid("Ohhh............hhhO"),
    17: mid("Ohh..............hhO"),
    18: mid("Oh................hO"),
    19: mid("Oh................hO"),
}

HAIR = {
    "pendek": {
        "name": "Pendek",
        "front": {**_PENDEK_TOP, 15: mid("Ohhh.hhhh..hhhh.hhhO"), **_SIDEBURNS},
    },
    "cepak": {
        "name": "Cepak",
        "front": {
            9: mid("....OOOOOOOOOOOO...."),
            10: mid("..OOHHhhhhhhhhhhOO.."),
            11: mid(".OhHhhhhhhhhhhhhhhO."),
            12: mid("OhhhhhhhhhhhhhhhhhhO"),
            13: mid("Ohh..............hhO"),
            14: mid("Oh................hO"),
            15: mid("Oh................hO"),
            16: mid("Oh................hO"),
        },
    },
    "belah_tengah": {"name": "Belah tengah", "front": _BELAH_TENGAH},
    "jambul": {
        "name": "Jambul",
        "front": {
            5: mid(".....OOOOOOOO......."),
            6: mid("...OOHHHhhhhhOO....."),
            7: mid("..OHHHhhhhhhhhhO...."),
            8: mid("..OhHhhhhhhhhhhhO..."),
            9: mid("..OhhhhhhhhhhhhhhO.."),
            10: mid("..OhhhhhhhhhhhhhhOO."),
            11: mid(".OhhhhhhhhhhhhhhhhO."),
            12: mid("OhhhhhhhhhhhhhhhhhhO"),
            13: mid("Ohhh............hhhO"),
            14: mid("Oh................hO"),
            15: mid("Oh................hO"),
            16: mid("Oh................hO"),
        },
    },
    "gondrong": {
        "name": "Gondrong",
        "front": {
            **_PENDEK_TOP,
            15: mid("Ohhhhhhhh.hhh.hh.hhO"),
            16: mid("Ohh..............hhO"),
            17: mid("Ohh..............hhO"),
            18: mid("Ohh..............hhO"),
            19: mid("Ohh..............hhO"),
            20: mid("Oh................hO"),
            21: mid(".Oh..............hO."),
        },
        "back": {
            11: row(".....O", "." * 20, "O....."),
            12: row("....Oh", "." * 20, "hO...."),
            **{y: row("...Ohh", "." * 20, "hhO...") for y in range(13, 27)},
            27: row("...OOO", "." * 20, "OOO..."),
        },
    },
    "cepol": {
        "name": "Cepol",
        "front": {
            5: mid("........OOOO........"),
            6: mid(".......OhHHhO......."),
            7: mid(".......OhhhhO......."),
            8: mid("........OOOO........"),
            **_BELAH_TENGAH,
        },
    },
    "keriting": {
        "name": "Keriting",
        "front": {
            4: mid("......OO.OO.OO......"),
            5: mid("....OOhhOhhOhhOO...."),
            6: mid("...OhhHHhhhhhhhhO..."),
            7: mid("..OhhHHhhhhhhhhhhO.."),
            8: mid(".OhhHhhhhhhhhhhhhhO."),
            **{y: row(".....O", "h" * 20, "O.....") for y in range(9, 15)},
            15: row(".....O", "hhhh.hhhh..hhhh.hhhh", "O....."),
            16: row(".....O", "hh" + "." * 16 + "hh", "O....."),
            17: row(".....O", "hh" + "." * 16 + "hh", "O....."),
            18: row(".....O", "hh" + "." * 16 + "hh", "O....."),
            19: mid("Oh................hO"),
        },
    },
    "botak": {"name": "Botak", "front": {}},
    "kerudung": {
        "name": "Kerudung",
        "front": {
            7: mid(".....OOOOOOOOOO....."),
            8: mid("...OOjjjiiiiiiiOO..."),
            9: mid("..OjjjiiiiiiiiiiIO.."),
            10: mid(".OjjiiiiiiiiiiiiiIO."),
            11: row(".....O", "jj" + "i" * 15 + "III", "O....."),
            12: row("....Oj", "i" * 17 + "III", "IO...."),
            13: row("...Oji", "i" * 17 + "III", "IIO..."),
            14: row("...Oii", "O" * 20, "IIO..."),
            **{y: row("...Oii", "." * 20, "IIO...") for y in range(15, 21)},
            21: row("...Oii", "i" + "." * 18 + "I", "IIO..."),
            22: row("...Oii", "ii" + "." * 16 + "II", "IIO..."),
            23: row("...Oii", "iii" + "." * 14 + "III", "IIO..."),
            24: row("...Oii", "i" * 17 + "III", "IIO..."),
            25: row("....OO", "O" + "i" * 16 + "II" + "O", "OO...."),
            26: mid("..OO" + "i" * 11 + "IOO.."),
            27: mid("....O" + "i" * 9 + "IO...."),
            28: mid("......OiiiiiIO......"),
            29: mid("........OOOO........"),
        },
    },
}

# ------------------------------------------------------------------------ eyes
EYES = {
    "bulat": {"name": "Bulat", "layer": {
        17: mid(".....we......we....."),
        18: mid(".....ee......ee....."),
        19: mid(".....ee......ee....."),
    }},
    "berbinar": {"name": "Berbinar", "layer": {
        16: mid(".....ee......ee....."),
        17: mid(".....we......we....."),
        18: mid(".....ee......ee....."),
        19: mid(".....ew......ew....."),
    }},
    "sipit": {"name": "Sipit", "layer": {
        18: mid("....eee......eee...."),
        19: mid(".....we......we....."),
    }},
    "sayu": {"name": "Sayu", "layer": {
        17: mid(".....SS......SS....."),
        18: mid(".....ee......ee....."),
        19: mid(".....ee......ee....."),
    }},
    "tajam": {"name": "Tajam", "layer": {
        17: mid("....eee......eee...."),
        18: mid(".....we......we....."),
        19: mid(".....ee......ee....."),
    }},
}

# Expression-only eyes (not offered in the customizer).
EXPRESSION_EYES = {
    "senang": {
        18: mid(".....ee......ee....."),
        19: mid("....e..e....e..e...."),
    },
    "kedip": {  # left eye closed, right eye open
        17: mid(".............we....."),
        18: mid(".....ee......ee....."),
        19: mid("....e..e.....ee....."),
    },
}

# ----------------------------------------------------------------------- brows
BROWS = {
    "none": {"name": "Tanpa alis", "layer": {}},
    "tebal": {"name": "Tebal", "layer": {16: mid("....hhh......hhh....")}},
    "galak": {"name": "Galak", "layer": {
        15: mid("....h..........h...."),
        16: mid(".....hh......hh....."),
    }},
    "ramah": {"name": "Ramah", "layer": {
        15: mid("......h......h......"),
        16: mid("....hh........hh...."),
    }},
}

# ---------------------------------------------------------------------- mouths
MOUTHS = {
    "senyum": {"name": "Senyum", "layer": {
        20: mid("........m..m........"),
        21: mid(".........mm........."),
    }},
    "datar": {"name": "Datar", "layer": {21: mid("........mmmm........")}},
    "nyengir": {"name": "Nyengir", "layer": {
        20: mid("...........m........"),
        21: mid("........mmm........."),
    }},
    "ketawa": {"name": "Ketawa", "layer": {
        20: mid("........mmmm........"),
        21: mid("........mbbm........"),
        22: mid(".........mm........."),
    }},
    "kaget": {"name": "Kaget", "layer": {
        20: mid(".........mm........."),
        21: mid("........mbbm........"),
        22: mid(".........mm........."),
    }},
    "cemberut": {"name": "Cemberut", "layer": {
        20: mid(".........mm........."),
        21: mid("........m..m........"),
    }},
}

# ----------------------------------------------------------------- facial hair
_BREWOK = {
    20: mid(".hh..............hh."),
    21: mid("..hhhhhh....hhhhhh.."),
    22: mid("...hhhhhhhhhhhhhh..."),
}

FACIAL_HAIR = {
    "none": {"name": "Tanpa", "layer": {}},
    "kumis_tipis": {"name": "Kumis tipis", "layer": {20: mid("........hhhh........")}},
    "kumis_baplang": {"name": "Kumis baplang", "layer": {
        20: mid("......hhHHhhhh......"),
        21: mid("......h......h......"),
    }},
    "janggut_kambing": {"name": "Janggut kambing", "layer": {
        22: mid(".........hh........."),
        23: mid(".........hh........."),
        24: mid(".........OO........."),
    }},
    "brewok": {"name": "Brewok", "layer": _BREWOK},
    "jenggot_panjang": {"name": "Jenggot panjang", "layer": {
        **_BREWOK,
        23: mid("....hhhhhhhhhhhh...."),
        24: mid(".....OhhhhhhhhO....."),
        25: mid("......OhhhhhhO......"),
        26: mid(".......OOOOOO......."),
    }},
}

# ----------------------------------------------------------------- accessories
ACCESSORIES = {
    "none": {"name": "Tanpa", "layer": {}},
    "kacamata": {"name": "Kacamata", "palette": {"x": "#3a2a30"}, "layer": {
        16: mid("....xxxx....xxxx...."),
        17: mid("....x..xxxxxx..x...."),
        18: mid("....x..x....x..x...."),
        19: mid("....x..x....x..x...."),
        20: mid("....xxxx....xxxx...."),
    }},
    "kacamata_hitam": {"name": "Kacamata hitam", "palette": {"x": "#1b1420", "X": "#5a6a7a"},
                       "layer": {
        17: mid("...xxxxxxxxxxxxxx..."),
        18: mid("....xXxx....xXxx...."),
        19: mid(".....xx......xx....."),
    }},
    "tahi_lalat": {"name": "Tahi lalat", "layer": {21: mid(".............e......")}},
}

CATEGORIES = [
    ("skin", "Warna kulit", SKIN_TONES),
    ("hair", "Rambut", HAIR),
    ("hair_color", "Warna rambut", HAIR_COLORS),
    ("hijab_color", "Warna kerudung", HIJAB_COLORS),
    ("eyes", "Mata", EYES),
    ("brows", "Alis", BROWS),
    ("mouth", "Mulut", MOUTHS),
    ("facial_hair", "Kumis & jenggot", FACIAL_HAIR),
    ("accessory", "Aksesoris", ACCESSORIES),
]

DEFAULT_LOOK = {
    "skin": "sawo_matang",
    "hair": "pendek",
    "hair_color": "hitam",
    "hijab_color": "hijau",
    "eyes": "bulat",
    "brows": "none",
    "mouth": "senyum",
    "facial_hair": "none",
    "accessory": "none",
    "blush": True,
}

# Expressions override eyes/mouth for reaction frames.
EXPRESSIONS = {
    "senang": {"eyes": "senang", "mouth": "ketawa"},
    "pamer": {"eyes": "kedip", "mouth": "nyengir"},
    "kaget": {"mouth": "kaget"},
}


def look(**overrides):
    unknown = set(overrides) - set(DEFAULT_LOOK)
    assert not unknown, unknown
    return {**DEFAULT_LOOK, **overrides}


def palette(lk):
    pal = {}
    for key in ("skin", "hair_color", "hijab_color"):
        ramp = {"skin": SKIN_TONES, "hair_color": HAIR_COLORS, "hijab_color": HIJAB_COLORS}[key]
        pal.update({k: v for k, v in ramp[lk[key]].items() if k != "name"})
    pal.update(ACCESSORIES[lk["accessory"]].get("palette", {}))
    return pal


def layers(lk, expression=None):
    """Return (back, front) layer lists for a look.

    Each entry is (layer, is_hair); hair layers get clipped under hats.
    """
    expr = EXPRESSIONS.get(expression, {})
    eyes_id = expr.get("eyes", lk["eyes"])
    eyes = EXPRESSION_EYES[eyes_id] if eyes_id in EXPRESSION_EYES else EYES[eyes_id]["layer"]
    mouth = MOUTHS[expr.get("mouth", lk["mouth"])]["layer"]
    hair = HAIR[lk["hair"]]

    back = []
    if "back" in hair:
        back.append((hair["back"], True))
    front = [(HEAD_BASE, False), (eyes, False), (mouth, False)]
    if lk["blush"]:
        front.append((BLUSH, False))
    front += [
        (FACIAL_HAIR[lk["facial_hair"]]["layer"], False),
        (hair["front"], True),
        (BROWS[lk["brows"]]["layer"], False),
        (ACCESSORIES[lk["accessory"]]["layer"], False),
    ]
    return back, front
