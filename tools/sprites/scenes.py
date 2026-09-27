"""Scene previews: each stage building with the cast on a mood sky.

Preview only (the real backgrounds come later) - checks scale, colour mood and
where the vendor stands.
"""

from PIL import Image, ImageDraw, ImageFont

from . import buildings, main_character, npcs
from .core import hexc, render, scale

OUT = buildings.OUT
W, H = 224, 256
GROUND = 238

BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]

SCENES = {
    1: {"sky": ["#3b2a4a", "#6b3f5a", "#c9784a", "#f4d9a0"], "ground": ("#5a4a4a", "#7a6660"),
        "backdrop": "kampung", "cast": [("bu_yanti", 1, -104)]},
    2: {"sky": ["#141a2e", "#1f2a44", "#2e3f5e", "#4f6f96"], "ground": ("#3a3a48", "#55556a"),
        "backdrop": "stars", "cast": [("bu_yanti", 2, -40)]},
    3: {"sky": ["#6a78a8", "#d9a36a", "#f2c94c", "#fff2c8"], "ground": ("#8a7a6a", "#a8977a"),
        "backdrop": None, "cast": [("karyawan", "stage3_kedai", 38), ("bu_yanti", 3, -60)]},
    4: {"sky": ["#0d0b1a", "#1b1436", "#2a2350", "#3a4a6e"], "ground": ("#2a2830", "#3e3c48"),
        "backdrop": "skyline", "cast": [("bramantyo", None, -70), ("karyawan", "stage4_resto_modern", 44)]},
    5: {"sky": ["#2a1a4a", "#6b3fa0", "#b36ad0", "#ff8fdc"], "ground": None,
        "backdrop": "clouds", "cast": [("pencicip", None, -92), ("bu_yanti", 5, -44)]},
}


def _sky(colors):
    img = Image.new("RGBA", (W, H))
    px = img.load()
    cols = [hexc(c) for c in colors]
    n = len(cols) - 1
    for y in range(H):
        t = min(y / (GROUND if GROUND < H else H), 1) * n
        i = min(int(t), n - 1)
        frac = t - i
        for x in range(W):
            px[x, y] = cols[i + 1] if frac * 16 > BAYER[y % 4][x % 4] + 0.5 else cols[i]
    return img


def _backdrop(img, kind):
    d = ImageDraw.Draw(img)
    if kind == "stars" or kind == "skyline":
        for i in range(40):
            x, y = (i * 53) % W, (i * 29) % 110
            d.point((x, y), fill=(243, 233, 216, 255 if i % 3 else 140))
    if kind == "kampung":
        col = (74, 46, 70, 255)
        for x0, w, h in ((0, 40, 26), (36, 30, 20), (62, 44, 30), (150, 36, 24), (180, 44, 32)):
            y0 = GROUND - h
            d.rectangle((x0, y0, x0 + w, GROUND), fill=col)
            d.polygon([(x0 - 3, y0), (x0 + w // 2, y0 - 10), (x0 + w + 3, y0)], fill=col)
        for x in range(W):                                               # kabel listrik
            sag = round(8 * (1 - ((x - W / 2) / (W / 2)) ** 2))
            d.point((x, GROUND - 120 + sag), fill=(42, 28, 36, 255))
            d.point((x, GROUND - 114 + sag), fill=(42, 28, 36, 255))
        d.rectangle((6, GROUND - 124, 8, GROUND), fill=(42, 28, 36, 255))   # tiang listrik
    if kind == "skyline":
        for i, (x0, w, h) in enumerate(((0, 24, 120), (22, 30, 90), (50, 20, 140), (160, 28, 130),
                                        (186, 38, 100), (204, 20, 150))):
            d.rectangle((x0, GROUND - h, x0 + w, GROUND), fill=(22, 18, 40, 255))
            for wy in range(GROUND - h + 6, GROUND - 4, 8):
                for wx in range(x0 + 3, x0 + w - 2, 6):
                    if (wx * 7 + wy * 3 + i) % 5 == 0:
                        d.rectangle((wx, wy, wx + 1, wy + 2), fill=(242, 196, 106, 255))
    if kind == "clouds":
        for cx, cy, r in ((30, 200, 22), (70, 214, 18), (190, 190, 26), (150, 222, 20),
                          (20, 60, 10), (200, 80, 12)):
            d.ellipse((cx - r * 2, cy - r, cx + r * 2, cy + r), fill=(233, 190, 240, 200))


def _ground(img, colors):
    d = ImageDraw.Draw(img)
    d.rectangle((0, GROUND, W, H), fill=hexc(colors[0]))
    d.line((0, GROUND, W, GROUND), fill=hexc(colors[1]))
    for x in range(8, W, 24):
        d.line((x, GROUND + 8, x + 10, GROUND + 8), fill=hexc(colors[1]))


def _cast_frame(kind, arg, stage):
    if kind == "bu_yanti":
        return npcs.bu_yanti_frames(arg)[0][1]
    if kind == "karyawan":
        return npcs.karyawan_frames(arg, "a")[0][1]
    if kind == "bramantyo":
        return npcs.bramantyo_frames()[0][1]
    if kind == "pencicip":
        return npcs.pencicip_frames()[0][1]
    raise KeyError(kind)


def scene(stage):
    sc = SCENES[stage]
    st = buildings.STAGES[stage]
    img = _sky(sc["sky"])
    _backdrop(img, sc["backdrop"])
    if sc["ground"]:
        _ground(img, sc["ground"])
    cv = st["frames"]()[0]
    b = render(cv.g, st["palette"])
    bx = (W - b.width) // 2
    by = (GROUND + 1 - b.height) if sc["ground"] else H - b.height - 8
    img.alpha_composite(b, (bx, by))

    vx, vy = st["vendor_spot"]
    foot_x, foot_y = bx + vx, by + vy
    for kind, arg, dx in sc["cast"]:
        c = _cast_frame(kind, arg, stage)
        cy = foot_y - c.height + 1 - (6 if kind == "pencicip" else 0)
        img.alpha_composite(c, (foot_x - 16 + dx, cy))
    hero = main_character.stage_frames(stage)[0][1]
    img.alpha_composite(hero, (foot_x - 16, foot_y - 39))
    if stage >= 2:
        rempi = npcs.rempi_frames()[0][1]
        img.alpha_composite(rempi, (foot_x + 14, foot_y - 52))
    return img


def generate():
    shots = [scene(s) for s in buildings.STAGES]
    k = 2
    sheet = Image.new("RGBA", (len(shots) * (W * k + 8) - 8, H * k + 18), (27, 20, 32, 255))
    d = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for i, im in enumerate(shots):
        x = i * (W * k + 8)
        sheet.alpha_composite(scale(im, k), (x, 0))
        label = f"Stage {i + 1} - {buildings.STAGES[i + 1]['slug'].replace('_', ' ')}"
        d.text((x + 4, H * k + 3), label, fill=(243, 233, 216, 255), font=font)
    sheet.save(OUT / "scene_preview.png")
