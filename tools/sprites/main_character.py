"""Tokoh utama: 5 evolution stages, face fully customizable via `face.look()`."""

from PIL import Image

from . import face
from .character import (BODY_APRON, BODY_JACKET, BODY_ROBE, BUKU_RESEP, compose,
                        full_palette, standard_frames)
from .core import ASSETS, contact_sheet, mid, save_set

OUT = ASSETS / "main"

STAGES = {
    1: {
        "slug": "kaki_lima", "body": BODY_APRON, "hat": "ikat_kepala", "extras": [],
        "palette": {  # terracotta, lusuh
            "r": "#c9432a", "W": "#f3e9d8",
            "g": "#6b7a3a", "G": "#4a5528", "L": "#8a9a4e",
            "a": "#d8c8a0", "A": "#ae9a72", "q": "#9c8660",
            "p": "#3e3a4a", "P": "#2c2836", "f": "#6b4a32",
        },
    },
    2: {
        "slug": "warung_tenda", "body": BODY_APRON, "hat": "topi_kain", "extras": [BUKU_RESEP],
        "palette": {  # teal warung
            "c": "#f3ead8", "C": "#cfc3ad", "B": "#c9432a",
            "g": "#4f86a6", "G": "#2e5570", "L": "#7fb0cc",
            "a": "#f1e9d6", "A": "#c8bb9f", "q": "#c9432a",
            "p": "#3e3a4a", "P": "#2c2836", "f": "#6b4a32",
            "n": "#8b4a2b", "y": "#f2c94c",
        },
    },
    3: {
        "slug": "kedai", "body": BODY_JACKET, "hat": "toque_pendek", "extras": [],
        "palette": {  # putih + gold
            "c": "#fbf6ec", "C": "#d4cab8",
            "g": "#f3efe6", "G": "#c4bbab", "L": "#ffffff",
            "k": "#c7a34b", "y": "#e8c86a",
            "p": "#3a3446", "P": "#28232f", "f": "#2a2430", "F": "#16121a",
        },
    },
    4: {
        "slug": "resto_modern", "body": BODY_JACKET, "hat": "toque_modern",
        "extras": [{18: mid("..................y."), 19: mid("..................y.")}],  # earpiece
        "palette": {  # charcoal teal + neon cyan
            "c": "#fbf6ec", "C": "#d4cab8", "B": "#4b7a8c",
            "g": "#3d6272", "G": "#28434f", "L": "#5f97ab",
            "k": "#7cf5e8", "y": "#7cf5e8",
            "p": "#1f1b26", "P": "#141119", "f": "#1a1620", "F": "#0d0b10",
            "d": "#4b7a8c",
        },
    },
    5: {
        "slug": "empire", "body": BODY_ROBE, "hat": "toque_empu",
        "extras": [{  # "Bara Api Legenda" on the golden spatula
            15: "." * 26 + "...v..",
            16: "." * 26 + "..vk..",
            17: "." * 26 + "..kyv.",
            18: "." * 26 + ".vkyk.",
        }],
        "palette": {  # purple + gold + pink glow
            "c": "#fffaf0", "C": "#e3d3b0",
            "g": "#6b3fa0", "G": "#3e2263", "L": "#8e62c4",
            "k": "#f2c94c", "K": "#b8892a", "J": "#ff8fdc",
            "v": "#ff8fdc", "y": "#fff2a8",
            "M": "#f2c94c", "N": "#b8892a", "d": "#6b3fa0",
        },
    },
}

PARTICLES = {  # stage 5 twinkle, alternating sets
    "idle1": [(2, 14, "v"), (4, 22, "k"), (1, 34, "v"), (29, 34, "k"), (27, 11, "v")],
    "idle2": [(3, 16, "k"), (2, 25, "v"), (4, 32, "k"), (30, 30, "v"), (28, 9, "k")],
    "tap": [(2, 14, "v"), (4, 22, "k"), (1, 34, "v"), (29, 34, "k"), (27, 11, "v")],
}


def stage_frames(stage, lk=None):
    lk = lk or face.look()
    st = STAGES[stage]
    pal = full_palette(lk, {}, ["sutil"])
    pal.update(st["palette"])

    def build(expression):
        return compose(lk, st["body"], hat=st["hat"], items=["sutil"], extras=st["extras"],
                       expression=expression)

    particles = (lambda name: PARTICLES[name]) if stage == 5 else None
    return standard_frames(build, pal, extra_points=particles)


# A few sample looks to show the face customization on the main character.
SAMPLE_LOOKS = [
    ("default", face.look()),
    ("brewok", face.look(hair="cepak", facial_hair="brewok", brows="tebal", skin="cokelat")),
    ("kerudung", face.look(hair="kerudung", hijab_color="merah_bata", skin="kuning_langsat",
                           eyes="berbinar")),
    ("gondrong", face.look(hair="gondrong", hair_color="cokelat_tua", facial_hair="kumis_tipis",
                           skin="gelap")),
    ("kacamata", face.look(hair="belah_tengah", accessory="kacamata", eyes="sipit",
                           skin="pucat")),
]


def generate():
    OUT.mkdir(parents=True, exist_ok=True)
    rows = []
    for stage, st in STAGES.items():
        frames = stage_frames(stage)
        save_set(OUT / f"stage{stage}_{st['slug']}", frames, gif_order=[0, 1, 0, 1, 2],
                 durations=[400, 400, 400, 400, 300])
        rows.append([img for _, img in frames])

    # Transparent 1x sheet for the game (checker only in previews).
    raw = Image.new("RGBA", (32 * 3, 40 * 5), (0, 0, 0, 0))
    for y, r in enumerate(rows):
        for x, im in enumerate(r):
            raw.paste(im, (x * 32, y * 40))
    raw.save(OUT / "main_character_sheet.png")
    contact_sheet(rows, k=8).save(OUT / "main_character_sheet_preview.png")

    # Customization demo: each sample look across stage 1 / 3 / 5 idle.
    demo_rows, demo_labels = [], []
    for name, lk in SAMPLE_LOOKS:
        demo_rows.append([stage_frames(s, lk)[0][1] for s in (1, 3, 5)])
        demo_labels.append([f"{name} / stage {s}" for s in (1, 3, 5)])
    contact_sheet(demo_rows, k=6, labels=demo_labels, pad=8).save(OUT / "custom_looks_preview.png")
    return rows
