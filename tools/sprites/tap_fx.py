"""Tap feedback: spinning coin, burst, and the cooked dish popping up.

Sprites: koin_putar1-4 (12x12), ledakan1-4 (20x20), lingkar_makanan (28x28, backdrop
behind the food icon so it reads over any scene). tap_fx.json describes timing.
"""

import json
import math

from PIL import Image

from . import food, scenes
from .core import ASSETS, render, scale
from .draw import Canvas
from .menu import MENU

OUT = ASSETS.parent / "ui" / "efek_tap"
PAL = {"O": "#2a1c24", "y": "#f2c94c", "Y": "#fff2a8", "G": "#b8892a", "w": "#fbf6ec",
       "W": "#f3e9d8aa", "p": "#ff8fdc"}


def koin_putar(frame):
    cv = Canvas(12, 12)
    rx = [5, 3, 1, 3][frame]
    cv.ellipse(6, 6, rx, 5, "y")
    if rx > 1:
        cv.ellipse(6, 6, max(0, rx - 2), 3, "G")
        cv.px(6 - rx + 1, 4, "Y")
    else:
        cv.vline(6, 1, 11, "G")
    cv.outline("O")
    return render(cv.g, PAL)


def ledakan(frame):
    cv = Canvas(20, 20)
    r = [3, 6, 8, 9][frame]
    for i in range(8):
        a = math.radians(i * 45 + frame * 10)
        x, y = 10 + round(r * math.cos(a)), 10 + round(r * math.sin(a))
        cv.px(x, y, "Y" if frame < 3 else "W")
        if frame < 2:
            cv.px(10 + round((r - 2) * math.cos(a)), 10 + round((r - 2) * math.sin(a)), "y")
    if frame == 0:
        cv.disc(10, 10, 2, "w")
    return render(cv.g, PAL)


def lingkar_makanan():
    cv = Canvas(28, 28)
    cv.disc(14, 14, 13, "W")
    cv.ring(14, 14, 13, "w")
    return render(cv.g, PAL)


def _fade(img, a):
    out = img.copy()
    alpha = out.getchannel("A").point(lambda v: int(v * a))
    out.putalpha(alpha)
    return out


def generate():
    OUT.mkdir(parents=True, exist_ok=True)
    for i in range(4):
        koin_putar(i).save(OUT / f"koin_putar{i + 1}.png")
        scale(koin_putar(i), 4).save(OUT / f"koin_putar{i + 1}@4x.png")
        ledakan(i).save(OUT / f"ledakan{i + 1}.png")
    lingkar_makanan().save(OUT / "lingkar_makanan.png")
    (OUT / "tap_fx.json").write_text(json.dumps({
        "urutan": [
            {"efek": "ledakan1-4", "mulai_ms": 0, "durasi_ms": 240, "posisi": "titik tap"},
            {"efek": "koin_putar1-4 (loop 80ms)", "mulai_ms": 0, "durasi_ms": 700,
             "gerak": "naik 40px, geser acak ±8px, pudar di 60% terakhir", "teks": "+jumlah koin"},
            {"efek": "lingkar_makanan + ikon menu yang dimasak", "mulai_ms": 80, "durasi_ms": 900,
             "gerak": "muncul skala 0.5 -> 1.1 -> 1.0, naik 28px melengkung, pudar di akhir"},
        ],
        "catatan": "Ikon makanan = ikon menu yang barusan terjual (food/<kota>/<id>.png)."},
        indent=2) + "\n")

    base = scenes.scene("jakarta", 1)
    icon = food.icon(MENU["jakarta"][0])
    tx, ty = 120, 190
    frames = []
    for f in range(12):
        im = base.copy()
        if f < 4:
            im.alpha_composite(ledakan(f), (tx - 10, ty - 10))
        t = f / 11
        a = 1.0 if t < 0.6 else max(0.0, 1 - (t - 0.6) / 0.4)
        im.alpha_composite(_fade(koin_putar(f % 4), a), (tx - 6 + round(6 * t), ty - 6 - round(40 * t)))
        if f >= 1:
            t2 = (f - 1) / 10
            fx = tx + 10 + round(14 * t2)
            fy = ty - 20 - round(28 * math.sin(t2 * math.pi / 2))
            im.alpha_composite(_fade(lingkar_makanan(), a), (fx - 14, fy - 14))
            im.alpha_composite(_fade(icon, a), (fx - 12, fy - 12))
        frames.append(scale(im, 2).convert("P", palette=Image.ADAPTIVE))
    frames[0].save(OUT / "preview_tap.gif", save_all=True, append_images=frames[1:], duration=80,
                   loop=0)
