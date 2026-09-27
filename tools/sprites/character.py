"""Compose humanoid sprites from a face look + body + hat + held item.

Draw order: back hair -> body -> head/face parts -> front hair -> hat -> item
-> extras. Hats clip hair rows above `hat["clip"]` so tall hairstyles don't
poke through.
"""

from . import face
from .core import BASE_PALETTE, E6, blank, mid, paint, render, row, shift, sparkle, squash

# ---------------------------------------------------------------------- bodies
# Palette keys: shirt g/G/L, apron a/A/q, pants p/P, shoes f/F, accent k/y.
LEGS_SANDAL = {
    35: mid("....OppppOOpppPO...."),
    36: mid("....OpppPOOppPPO...."),
    37: mid("....OppPPOOpPPPO...."),
    38: mid("...OlssssOOssssSO..."),
    39: mid("...OfffffOOfffffO..."),
}

LEGS_SHOES = {
    33: mid("....OpppppppppPO...."),
    34: mid("....OppppOOpppPO...."),
    35: mid("....OppppOOpppPO...."),
    36: mid("....OpppPOOppPPO...."),
    37: mid("....OppPPOOpPPPO...."),
    38: mid("...OfffffOOfffffO..."),
    39: mid("...OFFFFFOOFFFFFO..."),
}

_SHOULDERS = {
    24: mid("..OLggggSSSSggggGO.."),
    25: mid(".OLgggggLSSLgggggGO."),
}

BODY_APRON = {  # kaos + celemek
    **_SHOULDERS,
    26: mid("OLggOggaaaaaagGOgGGO"),
    27: mid("OGGGOggaaaaaagGOGGGO"),
    28: mid("OlsSOggaaaaaagGOsSSO"),
    29: mid("OlsSOAAAAAAAAAAOsSSO"),
    30: mid("OsssOaaaaaaaaaAOsssO"),
    31: mid("OsSSOaaaqaaaaaAOsSSO"),
    32: mid(".OOOOaaaaaaaaaAOOOO."),
    33: mid("....OaaaaaaaaAAO...."),
    34: mid("....OAAAAAAAAAAO...."),
    **LEGS_SANDAL,
}

BODY_KAOS = {  # kaos oblong + celana, untuk pelanggan / karyawan
    **_SHOULDERS,
    26: mid("OLggOggggggggggOgGGO"),
    27: mid("OGGGOggggqqggggOGGGO"),
    28: mid("OlsSOgggqqqqgggOsSSO"),
    29: mid("OlsSOggggqqggggOsSSO"),
    30: mid("OsssOggggggggggOsssO"),
    31: mid("OsSSOGGGGGGGGGGOsSSO"),
    32: mid(".OOOOppppppppppOOOO."),
    **LEGS_SHOES,
}

BODY_JACKET = {  # seragam koki double-breasted
    **_SHOULDERS,
    26: mid("OLggOgkgggyykgGOgGGO"),
    27: mid("OLggOgggggggggGOgGGO"),
    28: mid("OLggOgkgggggkgGOgGGO"),
    29: mid("OGkGOgggggggggGOGGGO"),
    30: mid("OsssOgkgggggkgGOsssO"),
    31: mid("OsSSOgggggggggGOsSSO"),
    32: mid(".OOOOGGGGGGGGGGOOOO."),
    **LEGS_SHOES,
}

BODY_ROBE = {  # jubah + sabuk salib
    24: mid("..OLggggSSSSggggGO.."),
    25: mid(".OLgkgggLSSLgggkgGO."),
    26: mid("OLggOgkggggggkGOgGGO"),
    27: mid("OLggOggkggggkgGOgGGO"),
    28: mid("OLggOgggkggkggGOgGGO"),
    29: mid("OkkkOkkkkJJkkkkOkkkO"),
    30: mid("OsssOgggkggkggGOsssO"),
    31: mid("OsSSOggkggggkgGOsSSO"),
    32: mid(".OOOOgkggggggkGOOOO."),
    33: mid("...OLgggggggggGGO..."),
    34: mid("...OLggggggggGGGO..."),
    35: mid("..OLggggggggggGGGO.."),
    36: mid("..OkkkkkkkkkkkkkkO.."),
    37: mid("..OOOOOOOOOOOOOOOO.."),
    38: mid("....OkkkkOOkkkKO...."),
    39: mid("....OKKKKOOKKKKO...."),
}

BODY_DASTER = {  # daster batik
    **_SHOULDERS,
    26: mid("OLggOgggkgggkggOgGGO"),
    27: mid("OLggOgkgggkgggkOgGGO"),
    28: mid("OGGGOgggkgggkggOGGGO"),
    29: mid("OlsSOgkgggkgggkOsSSO"),
    30: mid("OsssOgggkgggkggOsssO"),
    31: mid("OsSSOgkgggkgggkOsSSO"),
    32: mid(".OOOOgggkgggkggOOOO."),
    33: mid("...OLgkgggkgggkGO..."),
    34: mid("...OLgggkgggkggGO..."),
    35: mid("..OLgkgggkgggkggGO.."),
    36: mid("..OGGGGGGGGGGGGGGO.."),
    37: mid("..OOOOOOOOOOOOOOOO.."),
    38: mid("....OlsssOOsssSO...."),
    39: mid("....OffffOOffffO...."),
}

# ------------------------------------------------------------------------ hats
# Each hat: layer + clip (hair rows above this are hidden). Keys c/C/B/T/k/K/J.
HATS = {
    "ikat_kepala": {"clip": None, "layer": {
        13: row(E6, "OrrrrrrrrrrrrrrrrrrO", "rO...."),
        14: row(E6, "OWWWWWWWWWWWWWWWWWWO", "rrO..."),
        15: row(E6, "." * 20, "rrO..."),
        16: row(E6, "." * 20, ".rO..."),
        17: row(E6, "." * 20, ".O...."),
    }},
    "topi_kain": {"clip": 12, "layer": {
        7: mid("......OOOOOOOO......"),
        8: mid("....OOccccccccOO...."),
        9: mid("...OcccccccccccCO..."),
        10: mid("..OccccccccccccCCO.."),
        11: mid(".OccccccccccccccCCO."),
        12: mid("OBBBBBBBBBBBBBBBBBBO"),
    }},
    "toque_pendek": {"clip": 11, "layer": {
        4: mid("......OOOOOOOO......"),
        5: mid("....OOccccccccOO...."),
        6: mid("...OcccccccccccCO..."),
        7: mid("...OccccccccccCCO..."),
        8: mid("...OccccccccccCCO..."),
        9: mid("...OcCcCcCcCcCcCO..."),
        10: mid("..OOkkkkkkkkkkkkOO.."),
        11: mid("...OCCCCCCCCCCCCO..."),
        12: mid("...OOOOOOOOOOOOOO..."),
    }},
    "toque_modern": {"clip": 11, "layer": {
        3: mid("......OOOOOOOO......"),
        4: mid("....OOccccccccOO...."),
        5: mid("...OcccccccccccCO..."),
        6: mid("...OccccccccccCCO..."),
        7: mid("...OccccccccccCCO..."),
        8: mid("...OccccccccccCCO..."),
        9: mid("...OcccccccccCCCO..."),
        10: mid("..OOBBBBBBBBBBBBOO.."),
        11: mid("...OkkkkkkkkkkkkO..."),
        12: mid("...OOOOOOOOOOOOOO..."),
    }},
    "toque_empu": {"clip": 11, "layer": {
        2: mid("....OOOOOOOOOOOO...."),
        3: mid("..OOccccccccccccOO.."),
        4: mid(".OccccccccccccccCCO."),
        5: mid(".OccccccccccccccCCO."),
        6: mid(".OcccccccccccccCCCO."),
        7: mid("..OOcccccccccCCCOO.."),
        8: mid("...OccccccccccCCO..."),
        9: mid("...OkkkkkkkkkkkkO..."),
        10: mid("..OOKkkkkJJkkkkKOO.."),
        11: mid("...OKKKKKKKKKKKKO..."),
        12: mid("...OOOOOOOOOOOOOO..."),
    }},
    "topi_pet": {"clip": 12, "layer": {
        7: mid("......OOOOOOOO......"),
        8: mid("....OOccccccccOO...."),
        9: mid("...OccccccccccCCO..."),
        10: mid("..OcccccckkcccccCO.."),
        11: mid(".OcccccccccccccccCO."),
        12: mid("OCCCCCCCCCCCCCCCCCCO"),
        13: mid(".OOOOOOOOOOOOOOOOOO."),
    }},
}

# ----------------------------------------------------------------------- items
# Held in the viewer-right hand; includes the fist reaching out to the item.
_FIST_R = {
    30: row(E6, "." * 19 + "s", "O....."),
    31: row(E6, "." * 19 + "S", "O....."),
    32: row(E6, "." * 19 + "O", E6),
}

ITEMS = {
    "sutil": {"palette": {"M": "#b9c2c7", "N": "#6d777d", "d": "#8b5a36"}, "layer": {
        19: row(E6, "." * 20, ".OOOO."),
        20: row(E6, "." * 20, ".OMMO."),
        21: row(E6, "." * 20, ".OMNO."),
        22: row(E6, "." * 20, ".ONNO."),
        23: row(E6, "." * 20, "..OO.."),
        24: row(E6, "." * 20, "..d..."),
        25: row(E6, "." * 20, "..d..."),
        26: row(E6, "." * 20, ".d...."),
        27: row(E6, "." * 20, ".d...."),
        28: row(E6, "." * 20, "d....."),
        29: row(E6, "." * 20, "d....."),
        **_FIST_R,
    }},
    "hp": {"palette": {"Y": "#7cf5e8", "V": "#d6fffa", "x": "#1b1420"}, "layer": {
        24: row(E6, "." * 20, "OOOO.."),
        25: row(E6, "." * 20, "OVYO.."),
        26: row(E6, "." * 20, "OYYO.."),
        27: row(E6, "." * 20, "OYYO.."),
        28: row(E6, "." * 20, "OxxO.."),
        29: row(E6, "." * 20, "OOOO.."),
        **_FIST_R,
    }},
    "nampan": {"palette": {"M": "#b9c2c7", "N": "#6d777d", "t": "#f3e9d8", "T": "#c9432a"},
               "layer": {  # nampan dengan segelas es teh
        23: row(E6, "." * 20, ".OO..."),
        24: row(E6, "." * 20, "OtTO.."),
        25: row(E6, "." * 20, "OTTO.."),
        26: row(E6, "." * 20, "OTTO.."),
        27: row(E6, "." * 19 + "O", "OOOOO."),
        28: row(E6, "." * 19 + "O", "MMMMNO"),
        29: row(E6, "." * 19 + ".", "OOOOO."),
        **_FIST_R,
    }},
}

# Tas belanja hanging from the viewer-left fist.
TAS_BELANJA = {
    32: row(".....O", "." * 20, E6),
    33: row("...OOO", "OOOO" + "." * 16, E6),
    34: row("...Ott", "ttTO" + "." * 16, E6),
    35: row("...Otk", "ktTO" + "." * 16, E6),
    36: row("...Ott", "ttTO" + "." * 16, E6),
    37: row("...OTT", "TTTO" + "." * 16, E6),
    38: row("...OOO", "OOOO" + "." * 16, E6),
}

# Buku resep kecil (stage 2 main character).
BUKU_RESEP = {
    29: row("..OOOO", "O" + "." * 19, E6),
    30: row("..Onyn", "O" + "." * 19, E6),
    31: row("..Onnn", "O" + "." * 19, E6),
    32: row("..Onnn", "O" + "." * 19, E6),
    33: row("..OOOO", "O" + "." * 19, E6),
}


def compose(lk, body, hat=None, items=(), extras=(), expression=None):
    """Build one frame grid for a humanoid."""
    g = blank()
    back, front = face.layers(lk, expression)
    clip = HATS[hat]["clip"] if hat else None
    for layer, is_hair in back:
        paint(g, layer, clip if is_hair else None)
    paint(g, body)
    for layer, is_hair in front:
        paint(g, layer, clip if is_hair else None)
    if hat:
        paint(g, HATS[hat]["layer"])
    for it in items:
        paint(g, ITEMS[it]["layer"] if isinstance(it, str) else it)
    for layer in extras:
        paint(g, layer)
    return g


def full_palette(lk, outfit, items=()):
    pal = {**BASE_PALETTE, **face.palette(lk)}
    for it in items:
        if isinstance(it, str):
            pal.update(ITEMS[it]["palette"])
    pal.update(outfit)
    return pal


TAP_SPARKLES = [(3, 8), (28, 5), (1, 26)]


def standard_frames(build, pal, squash_row=27, tap_expression="senang", tap_name="tap",
                    extra_points=None):
    """idle1 / idle2 (1px breathing dip) / reaction (2px hop + sparkles).

    build(expression) -> grid. extra_points(frame_name) -> [(x, y, key)] drawn last.
    """
    def finish(g, name):
        if extra_points:
            for x, y, ch in extra_points(name):
                if 0 <= y < len(g) and 0 <= x < len(g[0]):
                    g[y][x] = ch
        return render(g, pal)

    idle1 = build(None)
    idle2 = squash(build(None), squash_row)
    tap = shift(build(tap_expression), -2)
    for x, y in TAP_SPARKLES:
        sparkle(tap, x, y)
    return [("idle1", finish(idle1, "idle1")), ("idle2", finish(idle2, "idle2")),
            (tap_name, finish(tap, tap_name))]
