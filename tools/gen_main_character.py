"""Generate pixel-art sprites for the main character of Gerobak Empire.

Spec (from the art-direction doc):
  - native canvas 32x40 px, scaled nearest-neighbour for production
  - 5 evolution stages: Kaki Lima -> Warung Tenda -> Kedai -> Resto Modern -> Empire
  - per stage: 2 idle-bounce frames + 1 tap-reaction frame
  - light from top-left, outlines are a dark warm tone (not pure black)

Every row below is written as three segments: left (cols 0-5), mid (cols 6-25,
the body/head) and right (cols 26-31, held item / extras). Each char is a
palette key; '.' is transparent.

Run:  python3 tools/gen_main_character.py
"""

from pathlib import Path

from PIL import Image

W, H = 32, 40
OUT = Path(__file__).resolve().parent.parent / "assets" / "characters" / "main"


def hexc(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


# Keys shared by every stage (face, skin, hair, outline, held spatula).
BASE_PALETTE = {
    "O": "#2a1c24",  # outline
    "s": "#d99a6c",  # skin
    "S": "#b0714b",  # skin shadow
    "l": "#f0bb8e",  # skin light
    "h": "#33242b",  # hair
    "H": "#56404a",  # hair highlight
    "e": "#1e1420",  # eye
    "w": "#ffffff",  # eye shine
    "m": "#7a2e2a",  # mouth
    "b": "#e3806a",  # blush
    "M": "#b9c2c7",  # spatula metal
    "N": "#6d777d",  # spatula metal shadow
    "d": "#8b5a36",  # spatula handle
    "Z": "#f2c94c",  # tap sparkle
    "z": "#fff4c2",  # tap sparkle core
}

STAGE_PALETTES = {
    1: {  # Pedagang Kaki Lima - terracotta, lusuh
        "r": "#c9432a", "W": "#f3e9d8",
        "g": "#6b7a3a", "G": "#4a5528", "L": "#8a9a4e",
        "a": "#d8c8a0", "A": "#ae9a72", "q": "#9c8660",
        "p": "#3e3a4a", "P": "#2c2836", "f": "#6b4a32",
    },
    2: {  # Juragan Warung Tenda - teal
        "c": "#f3ead8", "C": "#cfc3ad", "B": "#c9432a",
        "g": "#4f86a6", "G": "#2e5570", "L": "#7fb0cc",
        "a": "#f1e9d6", "A": "#c8bb9f", "q": "#c9432a",
        "p": "#3e3a4a", "P": "#2c2836", "f": "#6b4a32",
        "n": "#8b4a2b", "y": "#f2c94c",
    },
    3: {  # Pemilik Kedai - putih + gold
        "c": "#fbf6ec", "C": "#d4cab8",
        "g": "#f3efe6", "G": "#c4bbab", "L": "#ffffff",
        "k": "#c7a34b", "y": "#e8c86a",
        "p": "#3a3446", "P": "#28232f", "f": "#2a2430", "F": "#16121a",
    },
    4: {  # CEO Resto Modern - charcoal teal + neon cyan
        "c": "#fbf6ec", "C": "#d4cab8", "B": "#4b7a8c", "T": "#2a4b57",
        "g": "#3d6272", "G": "#28434f", "L": "#5f97ab",
        "k": "#7cf5e8", "y": "#7cf5e8",
        "p": "#1f1b26", "P": "#141119", "f": "#1a1620", "F": "#0d0b10",
        "d": "#4b7a8c",
    },
    5: {  # Empu Rasa / Kaisar Kuliner - purple + gold + pink glow
        "c": "#fffaf0", "C": "#e3d3b0",
        "g": "#6b3fa0", "G": "#3e2263", "L": "#8e62c4",
        "k": "#f2c94c", "K": "#b8892a", "J": "#ff8fdc",
        "v": "#ff8fdc", "y": "#fff2a8",
        "M": "#f2c94c", "N": "#b8892a", "d": "#6b3fa0",
    },
}


def row(left, mid, right):
    assert len(left) == 6, (left, len(left))
    assert len(mid) == 20, (mid, len(mid))
    assert len(right) == 6, (right, len(right))
    return left + mid + right


E6 = "......"
EMPTY = "." * W

# --- shared head (rows 9-23) ------------------------------------------------
HEAD = {
    9: row(E6, "....OOOOOOOOOOOO....", E6),
    10: row(E6, "..OOhhhhhhhhhhhhOO..", E6),
    11: row(E6, ".OhhhHHHhhhhhhhhhhO.", E6),
    12: row(E6, "OhhHHHhhhhhhhhhhhhhO", E6),
    13: row(E6, "OhhHhhhhhhhhhhhhhhhO", E6),
    14: row(E6, "OhhhhhhhhhhhhhhhhhhO", E6),
    15: row(E6, "OhhhshhhhsshhhhshhhO", E6),
    16: row(E6, "Oh" + "s" * 16 + "hO", E6),
    17: row(E6, "Ohsss" + "we" + "ssssss" + "we" + "ssshO", E6),
    18: row(E6, "Ohsss" + "ee" + "ssssss" + "ee" + "ssshO", E6),
    19: row(E6, "Ohsss" + "ee" + "ssssss" + "ee" + "ssshO", E6),
    20: row(E6, "OSsbbsssmssmsssbbsSO", E6),
    21: row(E6, ".OSssssssmmsssssSSO.", E6),
    22: row(E6, "..OSssssssssssSSSO..", E6),
    23: row(E6, "...OOOOOOOOOOOOOO...", E6),
}

# Happy "^ ^" face with open mouth for the tap frame.
HAPPY_FACE = {
    17: row(E6, "Ohsss" + "ss" + "ssssss" + "ss" + "ssshO", E6),
    18: row(E6, "Ohsss" + "ee" + "ssssss" + "ee" + "ssshO", E6),
    19: row(E6, "Ohsse" + "ss" + "esssse" + "ss" + "esshO", E6),
    20: row(E6, "OSsbbsssmmmmsssbbsSO", E6),
    21: row(E6, ".OSsssssmbbmsssssSO.", E6),
    22: row(E6, "..OSsssssmmssssSSO..", E6),
}

# --- spatula (sutil) held in the viewer-right hand ---------------------------
SPATULA = {
    19: ".OOOO.",
    20: ".OMMO.",
    21: ".OMNO.",
    22: ".ONNO.",
    23: "..OO..",
    24: "..d...",
    25: "..d...",
    26: ".d....",
    27: ".d....",
    28: "d.....",
    29: "d.....",
    30: "O.....",
    31: "O.....",
}

# --- headwear per stage ----------------------------------------------------------
HAT = {
    1: {  # ikat kepala merah-putih with knot tails
        13: row(E6, "OrrrrrrrrrrrrrrrrrrO", "rO...."),
        14: row(E6, "OWWWWWWWWWWWWWWWWWWO", "rrO..."),
        15: row(E6, "OhhhshhhhsshhhhshhhO", "rrO..."),
        16: row(E6, "Oh" + "s" * 16 + "hO", ".rO..."),
        17: row(E6, "Ohsss" + "we" + "ssssss" + "we" + "ssshO", ".O...."),
    },
    2: {  # topi koki kain
        7: row(E6, "......OOOOOOOO......", E6),
        8: row(E6, "....OOccccccccOO....", E6),
        9: row(E6, "...OcccccccccccCO...", E6),
        10: row(E6, "..OccccccccccccCCO..", E6),
        11: row(E6, ".OccccccccccccccCCO.", E6),
        12: row(E6, "OBBBBBBBBBBBBBBBBBBO", E6),
    },
    3: {  # toque pendek
        4: row(E6, "......OOOOOOOO......", E6),
        5: row(E6, "....OOccccccccOO....", E6),
        6: row(E6, "...OcccccccccccCO...", E6),
        7: row(E6, "...OccccccccccCCO...", E6),
        8: row(E6, "...OccccccccccCCO...", E6),
        9: row(E6, "...OcCcCcCcCcCcCO...", E6),
        10: row(E6, "..OOkkkkkkkkkkkkOO..", E6),
        11: row(E6, ".OhOCCCCCCCCCCCCOhO.", E6),
        12: row(E6, "OhhOOOOOOOOOOOOOOhhO", E6),
    },
    4: {  # toque lebih tinggi, band neon cyan
        3: row(E6, "......OOOOOOOO......", E6),
        4: row(E6, "....OOccccccccOO....", E6),
        5: row(E6, "...OcccccccccccCO...", E6),
        6: row(E6, "...OccccccccccCCO...", E6),
        7: row(E6, "...OccccccccccCCO...", E6),
        8: row(E6, "...OccccccccccCCO...", E6),
        9: row(E6, "...OcccccccccCCCO...", E6),
        10: row(E6, "..OOBBBBBBBBBBBBOO..", E6),
        11: row(E6, ".OhOkkkkkkkkkkkkOhO.", E6),
        12: row(E6, "OhhOOOOOOOOOOOOOOhhO", E6),
        # earpiece
        18: row(E6, "Ohsss" + "ee" + "ssssss" + "ee" + "sssyO", E6),
        19: row(E6, "Ohsss" + "ee" + "ssssss" + "ee" + "sssyO", E6),
    },
    5: {  # toque tinggi putih-emas dengan permata
        2: row(E6, "....OOOOOOOOOOOO....", E6),
        3: row(E6, "..OOccccccccccccOO..", E6),
        4: row(E6, ".OccccccccccccccCCO.", E6),
        5: row(E6, ".OccccccccccccccCCO.", E6),
        6: row(E6, ".OcccccccccccccCCCO.", E6),
        7: row(E6, "..OOcccccccccCCCOO..", E6),
        8: row(E6, "...OccccccccccCCO...", E6),
        9: row(E6, "...OkkkkkkkkkkkkO...", E6),
        10: row(E6, "..OOKkkkkJJkkkkKOO..", E6),
        11: row(E6, ".OhOKKKKKKKKKKKKOhO.", E6),
        12: row(E6, "OhhOOOOOOOOOOOOOOhhO", E6),
    },
}

# --- bodies (rows 24-39) ---------------------------------------------------------
LEGS_SANDAL = {
    35: row(E6, "....OppppOOpppPO....", E6),
    36: row(E6, "....OpppPOOppPPO....", E6),
    37: row(E6, "....OppPPOOpPPPO....", E6),
    38: row(E6, "...OlssssOOssssSO...", E6),
    39: row(E6, "...OfffffOOfffffO...", E6),
}

BODY_APRON = {  # stage 1 & 2: kaos + celemek
    24: row(E6, "..OLggggSSSSggggGO..", E6),
    25: row(E6, ".OLgggggLSSLgggggGO.", E6),
    26: row(E6, "OLggOggaaaaaagGOgGGO", E6),
    27: row(E6, "OGGGOggaaaaaagGOGGGO", E6),
    28: row(E6, "OlsSOggaaaaaagGOsSSO", E6),
    29: row(E6, "OlsSOAAAAAAAAAAOsSSO", E6),
    30: row(E6, "OsssOaaaaaaaaaAOssss", E6),
    31: row(E6, "OsSSOaaaqaaaaaAOsSSS", E6),
    32: row(E6, ".OOOOaaaaaaaaaAOOOOO", E6),
    33: row(E6, "....OaaaaaaaaAAO....", E6),
    34: row(E6, "....OAAAAAAAAAAO....", E6),
    **LEGS_SANDAL,
}

LEGS_SHOES = {
    33: row(E6, "....OpppppppppPO....", E6),
    34: row(E6, "....OppppOOpppPO....", E6),
    35: row(E6, "....OppppOOpppPO....", E6),
    36: row(E6, "....OpppPOOppPPO....", E6),
    37: row(E6, "....OppPPOOpPPPO....", E6),
    38: row(E6, "...OfffffOOfffffO...", E6),
    39: row(E6, "...OFFFFFOOFFFFFO...", E6),
}

BODY_JACKET = {  # stage 3 & 4: seragam koki double-breasted
    24: row(E6, "..OLggggSSSSggggGO..", E6),
    25: row(E6, ".OLgggggLSSLgggggGO.", E6),
    26: row(E6, "OLggOgkgggyykgGOgGGO", E6),
    27: row(E6, "OLggOgggggggggGOgGGO", E6),
    28: row(E6, "OLggOgkgggggkgGOgGGO", E6),
    29: row(E6, "OGkGOgggggggggGOGGGO", E6),
    30: row(E6, "OsssOgkgggggkgGOssss", E6),
    31: row(E6, "OsSSOgggggggggGOsSSS", E6),
    32: row(E6, ".OOOOGGGGGGGGGGOOOOO", E6),
    **LEGS_SHOES,
}

BODY_ROBE = {  # stage 5: jubah ungu + sabuk salib emas
    24: row(E6, "..OLggggSSSSggggGO..", E6),
    25: row(E6, ".OLgkgggLSSLgggkgGO.", E6),
    26: row(E6, "OLggOgkggggggkGOgGGO", E6),
    27: row(E6, "OLggOggkggggkgGOgGGO", E6),
    28: row(E6, "OLggOgggkggkggGOgGGO", E6),
    29: row(E6, "OkkkOkkkkJJkkkkOkkkO", E6),
    30: row(E6, "OsssOgggkggkggGOssss", E6),
    31: row(E6, "OsSSOggkggggkgGOsSSS", E6),
    32: row(E6, ".OOOOgkggggggkGOOOOO", E6),
    33: row(E6, "...OLgggggggggGGO...", E6),
    34: row(E6, "...OLggggggggGGGO...", E6),
    35: row(E6, "..OLggggggggggGGGO..", E6),
    36: row(E6, "..OkkkkkkkkkkkkkkO..", E6),
    37: row(E6, "..OOOOOOOOOOOOOOOO..", E6),
    38: row(E6, "....OkkkkOOkkkKO....", E6),
    39: row(E6, "....OKKKKOOKKKKO....", E6),
}

# Stage 2: small recipe notebook in the viewer-left hand (seed of "Buku Resep Kuno").
NOTEBOOK = {
    29: ("..OOOO", "O"),
    30: ("..Onyn", "O"),
    31: ("..Onnn", "O"),
    32: ("..Onnn", "O"),
    33: ("..OOOO", "O"),
}

# Stage 5: legendary flame ("Bara Api Legenda") on the golden spatula.
FLAME = {
    15: "...v..",
    16: "..vk..",
    17: "..kyv.",
    18: ".vkyk.",
}

# Stage 5 floating particles; two sets so the idle loop twinkles.
PARTICLES = {
    "a": [(2, 14, "v"), (4, 22, "k"), (1, 34, "v"), (29, 34, "k"), (27, 11, "v")],
    "b": [(3, 16, "k"), (2, 25, "v"), (4, 32, "k"), (30, 30, "v"), (28, 9, "k")],
}

# Tap reaction sparkles (little "+" bursts).
TAP_SPARKLES = [(3, 8), (28, 5), (1, 26)]

BODIES = {1: BODY_APRON, 2: BODY_APRON, 3: BODY_JACKET, 4: BODY_JACKET, 5: BODY_ROBE}


def build_base(stage):
    grid = [list(EMPTY) for _ in range(H)]
    layers = [HEAD, HAT[stage], BODIES[stage]]
    for layer in layers:
        for y, line in layer.items():
            grid[y] = list(line)
    for y, seg in SPATULA.items():
        for i, ch in enumerate(seg):
            if ch != ".":
                grid[y][26 + i] = ch
    if stage == 2:
        for y, (left, mid0) in NOTEBOOK.items():
            for i, ch in enumerate(left):
                if ch != ".":
                    grid[y][i] = ch
            grid[y][6] = mid0
    if stage == 5:
        for y, seg in FLAME.items():
            for i, ch in enumerate(seg):
                if ch != ".":
                    grid[y][26 + i] = ch
    return grid


def put(grid, x, y, ch):
    if 0 <= x < W and 0 <= y < H:
        grid[y][x] = ch


def add_particles(grid, stage, which):
    if stage != 5:
        return
    for x, y, ch in PARTICLES[which]:
        put(grid, x, y, ch)


def frame_idle1(stage):
    g = build_base(stage)
    add_particles(g, stage, "a")
    return g


def frame_idle2(stage):
    # Squash: drop a torso row so head + shoulders dip 1px (breathing bounce).
    g = build_base(stage)
    del g[27]
    g.insert(0, list(EMPTY))
    add_particles(g, stage, "b")
    return g


def frame_tap(stage):
    g = build_base(stage)
    face = dict(HAPPY_FACE)
    if stage == 4:  # keep the earpiece
        for y in (18, 19):
            face[y] = face[y][:24] + "y" + face[y][25:]
    for y, line in face.items():
        g[y][6:26] = list(line[6:26])
    # Hop up 2px.
    g = g[2:] + [list(EMPTY), list(EMPTY)]
    for x, y in TAP_SPARKLES:
        put(g, x, y, "z")
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            put(g, x + dx, y + dy, "Z")
    add_particles(g, stage, "a")
    return g


def render(grid, stage):
    pal = {k: hexc(v) for k, v in {**BASE_PALETTE, **STAGE_PALETTES[stage]}.items()}
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = img.load()
    for y, line in enumerate(grid):
        for x, ch in enumerate(line):
            if ch == ".":
                continue
            if ch not in pal:
                raise KeyError(f"stage {stage}: unknown key {ch!r} at {x},{y}")
            px[x, y] = pal[ch]
    return img


def checker(w, h, cell=8):
    bg = Image.new("RGBA", (w, h))
    px = bg.load()
    for y in range(h):
        for x in range(w):
            c = 58 if ((x // cell) + (y // cell)) % 2 else 46
            px[x, y] = (c, c - 8, c + 4, 255)
    return bg


FRAMES = [("idle1", frame_idle1), ("idle2", frame_idle2), ("tap", frame_tap)]
STAGE_NAMES = {
    1: "kaki_lima",
    2: "warung_tenda",
    3: "kedai",
    4: "resto_modern",
    5: "empire",
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sheet = Image.new("RGBA", (W * len(FRAMES), H * 5), (0, 0, 0, 0))
    for stage in range(1, 6):
        stage_dir = OUT / f"stage{stage}_{STAGE_NAMES[stage]}"
        stage_dir.mkdir(exist_ok=True)
        for col, (name, fn) in enumerate(FRAMES):
            img = render(fn(stage), stage)
            img.save(stage_dir / f"{name}.png")
            img.resize((W * 4, H * 4), Image.NEAREST).save(stage_dir / f"{name}@4x.png")
            sheet.paste(img, (col * W, (stage - 1) * H))
        # Animated preview of the idle loop (+ tap) at 8x.
        frames = [render(fn(stage), stage).resize((W * 8, H * 8), Image.NEAREST)
                  for _, fn in FRAMES]
        seq = [frames[0], frames[1], frames[0], frames[1], frames[2]]
        bg = checker(W * 8, H * 8, 32)
        seq = [Image.alpha_composite(bg, f).convert("P", palette=Image.ADAPTIVE) for f in seq]
        seq[0].save(stage_dir / "preview.gif", save_all=True, append_images=seq[1:],
                    duration=[400, 400, 400, 400, 300], loop=0, disposal=2)

    sheet.save(OUT / "main_character_sheet.png")
    big = sheet.resize((sheet.width * 8, sheet.height * 8), Image.NEAREST)
    Image.alpha_composite(checker(big.width, big.height, 32), big).save(
        OUT / "main_character_sheet_preview.png")
    print(f"wrote sprites to {OUT}")


if __name__ == "__main__":
    main()
