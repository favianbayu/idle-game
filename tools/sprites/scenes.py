"""Scene previews: city environment + stage building + cast, for every city x stage.

Shows how the layers fit together in game (scale, lighting, where the vendor
stands). The game itself composes these layers at runtime.
"""

from PIL import Image, ImageDraw, ImageFont

from . import buildings, environments, main_character, npcs
from .cities import CITIES, CITY_ORDER
from .core import ASSETS, scale

OUT = ASSETS.parent / "scenes"
W, H = environments.W, environments.H
GROUND = environments.GROUND

CAST = {
    1: [("bu_yanti", 1, -104)],
    2: [("bu_yanti", 2, -40)],
    3: [("karyawan", "stage3_kedai", 38), ("bu_yanti", 3, -60)],
    4: [("bramantyo", None, -70), ("karyawan", "stage4_resto_modern", 44)],
    5: [("pencicip", None, -92), ("bu_yanti", 5, -44)],
}


def _cast_frame(kind, arg):
    if kind == "bu_yanti":
        return npcs.bu_yanti_frames(arg)[0][1]
    if kind == "karyawan":
        return npcs.karyawan_frames(arg, "a")[0][1]
    if kind == "bramantyo":
        return npcs.bramantyo_frames()[0][1]
    if kind == "pencicip":
        return npcs.pencicip_frames()[0][1]
    raise KeyError(kind)


def scene(city, stage):
    img, _ = environments.build(city, stage)
    b = buildings.render_frames(city, stage)[0]
    bx = (W - b.width) // 2
    by = (GROUND + 1 - b.height) if stage != 5 else H - b.height - 8
    img.alpha_composite(b, (bx, by))

    vx, vy = buildings.STAGES[stage]["vendor_spot"]
    foot_x, foot_y = bx + vx, by + vy
    for kind, arg, dx in CAST[stage]:
        c = _cast_frame(kind, arg)
        cy = foot_y - c.height + 1 - (6 if kind == "pencicip" else 0)
        img.alpha_composite(c, (foot_x - 16 + dx, cy))
    hero = main_character.stage_frames(stage)[0][1]
    img.alpha_composite(hero, (foot_x - 16, foot_y - 39))
    if stage >= 2:
        img.alpha_composite(npcs.rempi_frames()[0][1], (foot_x + 14, foot_y - 52))
    return img


def generate():
    font = ImageFont.load_default()
    rows = []
    for city in CITY_ORDER:
        row = []
        for stage in range(1, 6):
            im = scene(city, stage)
            d = OUT / city
            d.mkdir(parents=True, exist_ok=True)
            scale(im, 2).save(d / f"stage{stage}.png")
            row.append(im)
        rows.append(row)
        # one strip per city
        strip = Image.new("RGBA", (5 * (W * 2 + 8) - 8, H * 2 + 18), (27, 20, 32, 255))
        dr = ImageDraw.Draw(strip)
        for i, im in enumerate(row):
            x = i * (W * 2 + 8)
            strip.alpha_composite(scale(im, 2), (x, 0))
            slug = buildings.STAGES[i + 1]["slug"].replace("_", " ")
            dr.text((x + 4, H * 2 + 3), f"{CITIES[city]['name']} - stage {i + 1} ({slug})",
                    fill=(243, 233, 216, 255), font=font)
        strip.save(OUT / f"{city}_preview.png")
    # overview grid of all cities x stages at 1x
    grid = Image.new("RGBA", (5 * (W + 4) + 64, 4 * (H + 4)), (27, 20, 32, 255))
    dr = ImageDraw.Draw(grid)
    for r, row in enumerate(rows):
        dr.text((4, r * (H + 4) + H // 2), CITIES[CITY_ORDER[r]]["name"],
                fill=(243, 233, 216, 255), font=font)
        for c, im in enumerate(row):
            grid.alpha_composite(im, (64 + c * (W + 4), r * (H + 4)))
    grid.save(OUT / "overview.png")
