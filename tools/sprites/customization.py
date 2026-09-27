"""Export the face kit for in-game customization.

Writes one transparent 32x40 PNG per option (all on the same anchor, so the
game just stacks them), a manifest.json describing draw order + colour swaps,
and a visual catalogue.
"""

import json

from . import face
from .character import BODY_KAOS, HATS, compose, full_palette
from .core import ASSETS, BASE_PALETTE, blank, contact_sheet, paint, render

OUT = ASSETS / "custom"
PREVIEW_OUTFIT = {"g": "#6b7a3a", "G": "#4a5528", "L": "#8a9a4e", "q": "#6b7a3a",
                  "p": "#3e3a4a", "P": "#2c2836", "f": "#2a2430", "F": "#16121a"}

DRAW_ORDER = ["hair_back", "body", "head", "eyes", "mouth", "blush", "facial_hair",
              "hair_front", "brows", "accessory", "hat", "item"]

LAYERED = [
    ("eyes", face.EYES),
    ("brows", face.BROWS),
    ("mouth", face.MOUTHS),
    ("facial_hair", face.FACIAL_HAIR),
    ("accessory", face.ACCESSORIES),
]


def _layer_png(layer, lk):
    g = blank()
    paint(g, layer)
    pal = {**BASE_PALETTE, **face.palette(lk)}
    pal.setdefault("x", "#3a2a30")
    pal.setdefault("X", "#5a6a7a")
    return render(g, pal)


def _swap_table(ramps, default_id, keys):
    base = ramps[default_id]
    return {
        "default": default_id,
        "keys": keys,
        "options": {
            oid: {"name": opt["name"],
                  "replace": {base[k].lower(): opt[k].lower() for k in keys}}
            for oid, opt in ramps.items()
        },
    }


def _catalog():
    """One row per category, each option shown on the default look (head crop)."""
    rows, labels = [], []

    def shot(lk):
        pal = full_palette(lk, PREVIEW_OUTFIT)
        img = render(compose(lk, BODY_KAOS), pal)
        return img.crop((0, 3, 32, 31))

    groups = [
        ("skin", face.SKIN_TONES), ("hair", face.HAIR), ("hair_color", face.HAIR_COLORS),
        ("hijab_color", face.HIJAB_COLORS), ("eyes", face.EYES), ("brows", face.BROWS),
        ("mouth", face.MOUTHS), ("facial_hair", face.FACIAL_HAIR),
        ("accessory", face.ACCESSORIES),
    ]
    for cat, opts in groups:
        extra = {}
        if cat == "hijab_color":
            extra = {"hair": "kerudung"}
        if cat == "hair_color":
            extra = {"hair": "gondrong"}
        if cat == "brows":
            extra = {"hair": "cepak"}
        rows.append([shot(face.look(**{**extra, cat: oid})) for oid in opts])
        labels.append([opts[oid]["name"] for oid in opts])
    return contact_sheet(rows, k=5, labels=labels, pad=6)


def generate():
    parts = OUT / "parts"
    lk = face.look()
    manifest = {
        "canvas": [32, 40],
        "anchor": "semua layer 32x40, ditumpuk di posisi (0,0) yang sama",
        "draw_order": DRAW_ORDER,
        "frame_offsets": {
            "idle1": 0,
            "idle2": "baris 0-26 turun 1px (kepala + bahu), baris 27+ diam",
            "tap": "semua naik 2px, pakai ekspresi 'senang'",
        },
        "hat_hides_hair_above_row": {k: v["clip"] for k, v in HATS.items()},
        "colour_swaps": {
            "skin": {**_swap_table(face.SKIN_TONES, "sawo_matang", ["s", "S", "l"]),
                     "apply_to": "seluruh sprite (kulit juga ada di tangan & kaki)"},
            "hair_color": {**_swap_table(face.HAIR_COLORS, "hitam", ["h", "H"]),
                           "apply_to": ["hair_front", "hair_back", "brows", "facial_hair"]},
            "hijab_color": {**_swap_table(face.HIJAB_COLORS, "hijau", ["i", "I", "j"]),
                            "apply_to": ["hair_front"]},
        },
        "layers": {"head": "parts/base/head.png", "blush": "parts/base/blush.png"},
        "options": {},
        "expressions": {},
    }

    (parts / "base").mkdir(parents=True, exist_ok=True)
    _layer_png(face.HEAD_BASE, lk).save(parts / "base" / "head.png")
    _layer_png(face.BLUSH, lk).save(parts / "base" / "blush.png")

    hair_dir = parts / "hair"
    hair_dir.mkdir(parents=True, exist_ok=True)
    manifest["options"]["hair"] = {}
    for oid, opt in face.HAIR.items():
        hl = face.look(hair=oid)
        entry = {"name": opt["name"], "front": f"parts/hair/{oid}.png"}
        _layer_png(opt["front"], hl).save(hair_dir / f"{oid}.png")
        if "back" in opt:
            _layer_png(opt["back"], hl).save(hair_dir / f"{oid}_back.png")
            entry["back"] = f"parts/hair/{oid}_back.png"
        manifest["options"]["hair"][oid] = entry

    for cat, opts in LAYERED:
        d = parts / cat
        d.mkdir(parents=True, exist_ok=True)
        manifest["options"][cat] = {}
        for oid, opt in opts.items():
            if not opt["layer"]:
                manifest["options"][cat][oid] = {"name": opt["name"], "layer": None}
                continue
            _layer_png(opt["layer"], face.look(**{cat: oid})).save(d / f"{oid}.png")
            manifest["options"][cat][oid] = {"name": opt["name"], "layer": f"parts/{cat}/{oid}.png"}

    d = parts / "expression"
    d.mkdir(parents=True, exist_ok=True)
    for eid, layer in face.EXPRESSION_EYES.items():
        _layer_png(layer, lk).save(d / f"eyes_{eid}.png")
    for name, expr in face.EXPRESSIONS.items():
        manifest["expressions"][name] = {
            "eyes": f"parts/expression/eyes_{expr['eyes']}.png" if "eyes" in expr else None,
            "mouth": f"parts/mouth/{expr['mouth']}.png",
        }

    manifest["default_look"] = face.DEFAULT_LOOK
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    _catalog().save(OUT / "catalog_preview.png")
