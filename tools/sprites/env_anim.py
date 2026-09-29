"""Environment animation: time of day, clouds, birds, rain, fireflies, smoke.

- Every city/stage (1-4) background is rendered at 4 times of day
  (pagi, siang, sore, malam) -> environments/<kota>/stageN/waktu/<waktu>.png
- Loose animated sprites for the engine: awan (3 sizes), burung (3 frames),
  hujan (4 frames, full-screen overlay), kunang-kunang (2 frames), asap (6 frames).
- Preview GIFs show a full day cycle and a rainy night.
"""

import copy
import json
import math

from PIL import Image

from . import buildings, environments, main_character, npcs
from .cities import CITY_ORDER
from .core import ASSETS, render, scale
from .draw import Canvas

OUT = ASSETS.parent / "environments"
FX = OUT / "efek"
W, H = environments.W, environments.H

TIMES = {
    "pagi": {"sky": ["#6aa8d8", "#a8d0e8", "#f0d8b0", "#f8ecd0"],
             "far": ("#9aa8c0", "#8898b0", "#dce6f0"), "tint": (250, 240, 228),
             "haze": ("#f0d8b0", 0.18), "stars": False, "lights": False, "fg": (255, 248, 240)},
    "siang": {"sky": ["#3f8ad8", "#6ab0e8", "#a8d8f0", "#e0f4fa"],
              "far": ("#98b0cc", "#88a0bc", "#e0ecf4"), "tint": (255, 255, 255),
              "haze": ("#a8d8f0", 0.12), "stars": False, "lights": False, "fg": (255, 255, 255)},
    "sore": {**environments.STAGE_LIGHT[1], "fg": (255, 225, 200)},
    "malam": {**environments.STAGE_LIGHT[2], "fg": (165, 170, 215)},
}


def build_at(city, stage, tod):
    """Render a background at a time of day by swapping the stage light preset."""
    saved = copy.deepcopy(environments.STAGE_LIGHT[stage])
    light = dict(TIMES[tod])
    light["ground"] = saved["ground"]
    light.pop("fg", None)
    environments.STAGE_LIGHT[stage] = light
    try:
        return environments.build(city, stage)
    finally:
        environments.STAGE_LIGHT[stage] = saved


# ----------------------------------------------------------------- sprites
def awan(size):
    w, h = {"besar": (56, 20), "sedang": (40, 16), "kecil": (24, 10)}[size]
    cv = Canvas(w, h)
    for cx, cy, rx, ry in ((w // 3, h - 7, w // 4, h // 3), (w // 2, h // 2 - 1, w // 4, h // 2 - 2),
                           (2 * w // 3, h - 7, w // 4, h // 3)):
        cv.ellipse(cx, cy, rx, ry, "w")
    cv.rect(2, h - 5, w - 4, 3, "w")
    for y in range(h):
        for x in range(w):
            if cv.get(x, y) == "w" and (cv.get(x, y + 2) == "." or y >= h - 3):
                cv.px(x, y, "W")
    return render(cv.g, {"w": "#fbf6ec", "W": "#d8d4e4"})


def burung(frame):
    cv = Canvas(9, 6)
    wing = [((0, 1), (1, 1), (2, 2), (3, 3)), ((0, 3), (1, 3), (2, 3), (3, 3)),
            ((0, 4), (1, 4), (2, 3), (3, 3))][frame]
    for x, y in wing:
        cv.px(x, y, "b")
        cv.px(8 - x, y, "b")
    cv.rect(4, 3, 1, 2, "b")
    return render(cv.g, {"b": "#2a1c24"})


def hujan(frame):
    cv = Canvas(W, H)
    for i in range(110):
        x = (i * 37 + frame * 5) % W
        y = (i * 53 + frame * 16) % H
        for k in range(5):
            cv.px(x - k // 2, y + k, "r")
    for i in range(24):                                          # cipratan di tanah
        x = (i * 29 + frame * 11) % W
        if (i + frame) % 2:
            cv.px(x, environments.GROUND + 1, "s"), cv.px(x - 1, environments.GROUND, "s")
            cv.px(x + 1, environments.GROUND, "s")
    return render(cv.g, {"r": "#bfd8f0aa", "s": "#d8e8f8cc"})


def kunang(frame):
    cv = Canvas(5, 5)
    if frame == 0:
        cv.px(2, 2, "y")
        for d in ((1, 2), (3, 2), (2, 1), (2, 3)):
            cv.px(*d, "g")
    else:
        cv.px(2, 2, "g")
    return render(cv.g, {"y": "#f8ffb0", "g": "#c8f06088"})


def asap(frame):
    cv = Canvas(12, 26)
    for k in range(3):
        t = (frame + k * 2) % 6
        y = 22 - t * 4
        x = 6 + round(2 * math.sin((t + k) / 1.5))
        r = 1 + t // 2
        cv.disc(x, y, r, "x" if t < 4 else "X")
    return render(cv.g, {"x": "#f3e9d8cc", "X": "#f3e9d866"})


# ----------------------------------------------------------------- preview
def _tint(img, rgb):
    return environments._tint(img, rgb)


def _day_scene(city, stage, tod, frame):
    """Background + building + hero at a time of day, with moving fx."""
    bg, _ = build_at(city, stage, tod)
    img = bg.copy()
    clouds = [("besar", 40, 20), ("sedang", 160, 44), ("kecil", 100, 12)]
    if tod in ("pagi", "siang", "sore"):
        for size, x0, y in clouds:
            c = awan(size)
            if tod == "sore":
                c = _tint(c, (255, 200, 180))
            x = (x0 + frame * 3) % (W + 60) - 60
            img.alpha_composite(c, (x, y))
        for b in range(3):
            bx = (frame * 5 + b * 14) % (W + 20) - 10
            img.alpha_composite(burung((frame + b) % 3), (bx, 60 + b * 6 + round(2 * math.sin(frame + b))))
    fg = TIMES[tod]["fg"]
    b_img = buildings.render_frames(city, stage)[frame % 2]
    bx = (W - b_img.width) // 2
    by = environments.GROUND + 1 - b_img.height
    img.alpha_composite(_tint(b_img, fg), (bx, by))
    vx, vy = buildings.STAGES[stage]["vendor_spot"]
    hero = main_character.stage_frames(stage)[(frame // 2) % 2][1]
    img.alpha_composite(_tint(hero, fg), (bx + vx - 16, by + vy - 39))
    if stage >= 2:
        img.alpha_composite(_tint(npcs.rempi_frames()[frame % 2][1], fg), (bx + vx + 14, by + vy - 52))
    if tod == "malam":
        for i in range(8):
            fx = (i * 31 + frame * 2) % W
            fy = 150 + (i * 17) % 60 + round(3 * math.sin(frame / 2 + i))
            img.alpha_composite(kunang((frame + i) % 2), (fx, fy))
    return img


def _gif(frames, path, ms):
    frames = [scale(f, 2).convert("P", palette=Image.ADAPTIVE) for f in frames]
    frames[0].save(path, save_all=True, append_images=frames[1:], duration=ms, loop=0)


def generate():
    meta = {"waktu": list(TIMES), "urutan_siklus": ["pagi", "siang", "sore", "malam"],
            "saran_durasi_menit": {"pagi": 3, "siang": 5, "sore": 3, "malam": 5},
            "tint_latar_depan": {k: v["fg"] for k, v in TIMES.items()},
            "lampu_menyala": {k: v["lights"] for k, v in TIMES.items()}}
    for city in CITY_ORDER:
        for stage in range(1, 5):
            d = OUT / city / f"stage{stage}" / "waktu"
            d.mkdir(parents=True, exist_ok=True)
            for tod in TIMES:
                build_at(city, stage, tod)[0].save(d / f"{tod}.png")
    FX.mkdir(parents=True, exist_ok=True)
    for size in ("besar", "sedang", "kecil"):
        awan(size).save(FX / f"awan_{size}.png")
    for i in range(3):
        burung(i).save(FX / f"burung{i + 1}.png")
    for i in range(4):
        hujan(i).save(FX / f"hujan{i + 1}.png")
    for i in range(2):
        kunang(i).save(FX / f"kunang{i + 1}.png")
    for i in range(6):
        asap(i).save(FX / f"asap{i + 1}.png")
    (OUT / "waktu.json").write_text(json.dumps(meta, indent=2) + "\n")

    frames = []
    for tod in ("pagi", "siang", "sore", "malam"):
        for f in range(8):
            frames.append(_day_scene("jakarta", 1, tod, f))
    _gif(frames, OUT / "preview_siklus_hari.gif", 180)
    rain = []
    for f in range(8):
        im = _day_scene("bandung", 2, "malam", f)
        im.alpha_composite(hujan(f % 4))
        rain.append(im)
    _gif(rain, OUT / "preview_hujan.gif", 110)
    strip = Image.new("RGBA", (W * 4 + 12, H), (27, 20, 32, 255))
    for i, tod in enumerate(("pagi", "siang", "sore", "malam")):
        strip.alpha_composite(_day_scene("bali", 1, tod, 0), (i * (W + 4), 0))
    scale(strip, 2).save(OUT / "preview_waktu_bali.png")
