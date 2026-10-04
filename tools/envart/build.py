#!/usr/bin/env python3
"""Build every Rimbasari environment asset, its manifest and a preview scene.

  python3 tools/envart/build.py --out assets/environment
  python3 tools/envart/build.py --out assets/environment --char path/to/indah_anchor.png

Outputs (under --out):
  <category>/<id>.png        one sprite per asset, trimmed, with a soft contact shadow
  tanaman/<crop>.png         crops as 5-frame strips (benih, tunas, muda, dewasa, panen)
  tanah/<id>.png             96 x 48 ground tiles
  environment.json           size, pivot and footprint of every asset
  preview.png / preview_2x.png   a small farm scene with everything in place

Pivot = the pixel that goes on the ground point the object stands on (for a
one-tile object, the centre of its tile). For buildings, `grid_origin` is the
pixel of the footprint's north corner (grid cell (0,0)'s top), so the sprite is
placed at Iso.grid_to_screen(rect origin) - grid_origin.
"""
import argparse
import json
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pix  # noqa: E402
import debris  # noqa: E402
import house  # noqa: E402
import plants  # noqa: E402
import rocks  # noqa: E402
import tiles  # noqa: E402
import trees  # noqa: E402

SHADOW_RGBA = (18, 30, 26, 78)


def finish(cv, pivot, shadow=None, outline=True, margin=2):
    """Outline, add the contact shadow under the sprite, trim. Returns (Image, pivot)."""
    if outline:
        cv.outline()
    img = cv.image()
    if shadow:
        rx, ry = shadow
        sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
        px = sh.load()
        cx, cy = pivot
        for y in range(int(cy - ry - 1), int(cy + ry + 2)):
            for x in range(int(cx - rx - 1), int(cx + rx + 2)):
                if 0 <= x < img.width and 0 <= y < img.height:
                    dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
                    if dx * dx + dy * dy <= 1:
                        px[x, y] = SHADOW_RGBA
        sh = chunky_image(sh)
        sh.alpha_composite(img)
        img = sh
    a = np.array(img)[..., 3]
    ys, xs = np.nonzero(a)
    x0, y0 = max(0, xs.min() - margin), max(0, ys.min() - margin)
    x0, y0 = x0 - x0 % pix.PIXEL, y0 - y0 % pix.PIXEL     # keep the block grid
    x1, y1 = min(img.width, xs.max() + 1 + margin), min(img.height, ys.max() + 1 + margin)
    img = img.crop((x0, y0, x1, y1))
    return img, (int(pivot[0] - x0), int(pivot[1] - y0))


def chunky_image(img):
    """A soft layer (shadow) drawn in PIXEL x PIXEL blocks."""
    n = pix.PIXEL
    if n == 1:
        return img
    w, h = img.size
    small = img.resize(((w + n - 1) // n, (h + n - 1) // n), Image.NEAREST)
    return small.resize((small.width * n, small.height * n), Image.NEAREST).crop((0, 0, w, h))


def iso_shadow(cv_img, ms_scr, lx, ly, pad=6):
    """A soft footprint-shaped shadow under a building (diamond, offset down-right)."""
    sh = Image.new("RGBA", cv_img.size, (0, 0, 0, 0))
    px = sh.load()
    pts = [ms_scr((-pad, -pad, 0)), ms_scr((lx + pad, -pad, 0)), ms_scr((lx + pad, ly + pad, 0)), ms_scr((-pad, ly + pad, 0))]
    pts = [(x + 8, y + 4) for x, y in pts]
    from PIL import ImageDraw
    ImageDraw.Draw(sh).polygon(pts, fill=SHADOW_RGBA)
    sh = chunky_image(sh)
    sh.alpha_composite(cv_img)
    return sh


def build_all(out, char=None):
    manifest = {"tile": {"w": tiles.TW, "h": tiles.TH, "note": "isometric 2:1, Iso.TILE_W x TILE_H"},
                "pixel": pix.PIXEL,
                "light": "top left", "assets": {}}

    def save(cat, name, img, pivot, **meta):
        d = os.path.join(out, cat)
        os.makedirs(d, exist_ok=True)
        path = os.path.join(d, name + ".png")
        img.save(path)
        e = {"file": f"{cat}/{name}.png", "size": [img.width, img.height], "pivot": list(pivot)}
        e.update(meta)
        manifest["assets"][f"{cat}/{name}"] = e
        return img

    placed = {}     # for the preview: id -> (img, pivot)

    def put(cat, name, cv, pivot, shadow=None, outline=True, **meta):
        img, pv = finish(cv, pivot, shadow, outline)
        save(cat, name, img, pv, **meta)
        placed[f"{cat}/{name}"] = (img, pv)

    # ---------------------------------------------------------- trees
    t = trees
    for name, (cv, pv), sh in [
        ("mangga", t.broadleaf(1, kind="mangga"), (34, 13)),
        ("mangga_berbuah", t.broadleaf(2, kind="mangga", fruit=True), (34, 13)),
        ("pohon_hutan", t.broadleaf(5, kind="hutan"), (36, 14)),
        ("jati", t.broadleaf(3, kind="jati"), (30, 12)),
        ("pohon_kemarau", t.broadleaf(9, kind="kemarau"), (36, 14)),
        ("kelapa", t.palm(4), (16, 7)),
        ("pisang", t.banana(5), (18, 8)),
        ("bibit_0", t.sapling(6, 0), (6, 3)),
        ("bibit_1", t.sapling(6, 1), (10, 4)),
        ("bibit_2", t.sapling(6, 2), (20, 8)),
        ("tunggul", t.stump(7), (14, 6)),
        ("tunggul_besar", t.stump(8, big=True), (24, 9)),
    ]:
        put("pohon", name, cv, pv, sh, footprint=[1, 1])

    # ---------------------------------------------------------- rocks
    r = rocks
    for name, (cv, pv), sh in [
        ("batu_kecil", r.rock("a", 1, 48, 40, 18, 13), (16, 6)),
        ("batu_kecil_2", r.rock("d", 4, 48, 40, 16, 12, stone="stone_warm"), (15, 6)),
        ("batu_lumut", r.rock("b", 2, 48, 40, 18, 13, moss="mossy"), (16, 6)),
        ("batu_besar", r.rock("c", 3, 100, 76, 40, 28, cracks=3, moss="mossy", facets=8), (38, 13)),
        ("bijih_tembaga", r.ore_rock(5, "copper"), (20, 7)),
        ("bijih_besi", r.ore_rock(6, "ironore"), (20, 7)),
        ("bijih_emas", r.ore_rock(7, "gold"), (20, 7)),
        ("bijih_permata", r.ore_rock(8, "gem"), (20, 7)),
        ("kerikil", r.pebbles(9), None),
    ]:
        put("batu", name, cv, pv, sh, footprint=[2, 2] if name == "batu_besar" else [1, 1])

    # ---------------------------------------------------------- debris and ruins
    d = debris
    for name, (cv, pv), sh, outline in [
        ("ranting", d.ranting(1), None, True),
        ("daun_kering", d.daun_kering(2), None, True),
        ("kayu_tumbang", d.kayu_tumbang(3), (40, 12), True),
        ("peti", d.peti(14), (24, 10), False),
        ("peti_rusak", d.peti(15, broken=True), (24, 10), False),
        ("papan_patah", d.papan_patah(16), (30, 10), False),
        ("pagar_bambu", d.pagar_bambu(17), None, False),
        ("pagar_bambu_rusak", d.pagar_bambu(18, broken=True), None, False),
        ("reruntuhan_bata", d.reruntuhan(19), (40, 14), False),
        ("tembok_runtuh", d.tembok_runtuh(20), None, False),
        ("tiang_lapuk", d.tiang_lapuk(21), (8, 4), False),
    ]:
        fp = {"kayu_tumbang": [2, 1], "pagar_bambu": [2, 1], "pagar_bambu_rusak": [2, 1], "tembok_runtuh": [2, 1],
              "reruntuhan_bata": [2, 2]}.get(name, [1, 1])
        put("puing", name, cv, pv, sh, outline, footprint=fp)

    # ---------------------------------------------------------- wild plants, bushes, flowers
    for name, (cv, pv), sh in [
        ("rumput_liar", d.rumput(4, "tuft"), None),
        ("rumput_daun", d.rumput(5, "leafy"), None),
        ("pakis", d.rumput(6, "pakis"), None),
        ("alang_alang", d.rumput(7, "alang"), None),
        ("semak", d.semak(8), (28, 9)),
        ("semak_buah", d.semak(9, "buah"), (28, 9)),
        ("semak_kembang_sepatu", d.semak(10, "sepatu"), (28, 9)),
        ("semak_melati", d.semak(11, "melati"), (28, 9)),
        ("bunga_liar_kuning", d.bunga_liar(12, "yellow"), None),
        ("bunga_liar_merah_muda", d.bunga_liar(13, "pink"), None),
    ]:
        put("vegetasi", name, cv, pv, sh, footprint=[1, 1])

    # ---------------------------------------------------------- crops (5-frame strips)
    for crop, fn in plants.CROPS.items():
        fw, fh = plants.CROP_W, plants.CROP_H
        strip = Image.new("RGBA", (fw * 5, fh), (0, 0, 0, 0))
        for s in range(5):
            cv = fn(s)
            cv.outline()
            strip.alpha_composite(cv.image(), (s * fw, 0))
            placed[f"tanaman/{crop}_{s}"] = (cv.image(), plants.CROP_PIVOT)
        save("tanaman", crop, strip, plants.CROP_PIVOT, frame=[fw, fh], frames=5, stages=plants.STAGES,
             footprint=[1, 1], note="pivot is per frame; put it on the tile centre")

    # ---------------------------------------------------------- ground tiles
    for name, cv in [
        ("rumput_0", tiles.grass(1, 0)), ("rumput_1", tiles.grass(1, 1)), ("rumput_2", tiles.grass(1, 2)),
        ("tanah_olah", tiles.soil(2)), ("tanah_olah_basah", tiles.soil(2, wet=True)),
        ("jalan_tanah", tiles.path(3)), ("jalan_batu", tiles.path(3, "batu")),
    ]:
        cv.chunky(min_cover=1)
        img = cv.image()
        save("tanah", name, img, (tiles.TW // 2, tiles.TH // 2), note="diamond tile; pivot = tile centre")
        placed[f"tanah/{name}"] = (img, (tiles.TW // 2, tiles.TH // 2))

    # ---------------------------------------------------------- house
    for door in ("SW", "SE"):
        cv, ms = house.build(door)
        img = iso_shadow(cv.image(), ms.scr, house.LX, house.LY)
        a = np.array(img)[..., 3]
        ys, xs = np.nonzero(a)
        x0, y0 = xs.min() - 2, ys.min() - 2
        x0, y0 = x0 - x0 % pix.PIXEL, y0 - y0 % pix.PIXEL
        img = img.crop((x0, y0, xs.max() + 3, ys.max() + 3))
        ox, oy = ms.scr((0, 0, 0))
        door_px = ms.scr(((98 + 142) / 2, house.LY + 8, 0))
        fp = [house.LX // 48, house.LY // 48] if door == "SW" else [house.LY // 48, house.LX // 48]
        door_cell = [2, 4] if door == "SW" else [4, 2]
        save("bangunan", f"rumah_utama_{door.lower()}", img, (int(door_px[0] - x0), int(door_px[1] - y0)),
             grid_origin=[int(round(ox - x0)), int(round(oy - y0))], footprint=fp, door_face=door,
             door_cell=door_cell,
             note="pivot = the ground point in front of the door steps; grid_origin = north corner of the footprint")
        placed[f"bangunan/rumah_utama_{door.lower()}"] = (img, (int(round(ox - x0)), int(round(oy - y0))))

    with open(os.path.join(out, "environment.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    preview(out, placed, char)
    catalog(out, manifest)
    return manifest


def catalog(out, manifest):
    """Every asset on one labelled sheet (crops show all five stages)."""
    from PIL import ImageDraw
    groups = {}
    for key, e in manifest["assets"].items():
        groups.setdefault(key.split("/")[0], []).append((key, e))
    order = ["bangunan", "pohon", "tanaman", "batu", "puing", "vegetasi", "tanah"]
    W = 1600
    pad = 14
    rows = []
    for cat in order:
        items = groups.get(cat, [])
        x, row, rh = pad, [], 0
        rows.append(("title", cat))
        for key, e in items:
            im = Image.open(os.path.join(out, e["file"]))
            if x + max(im.width, len(key.split('/')[1]) * 6) + pad > W and row:
                rows.append(("row", row, rh))
                x, row, rh = pad, [], 0
            row.append((key, im, x))
            x += max(im.width, len(key.split("/")[1]) * 6 + 4) + pad
            rh = max(rh, im.height)
        if row:
            rows.append(("row", row, rh))
    H = sum(28 if r[0] == "title" else r[2] + 26 for r in rows) + pad
    sheet = Image.new("RGBA", (W, H), (62, 94, 52, 255))
    dr = ImageDraw.Draw(sheet)
    y = pad
    for r in rows:
        if r[0] == "title":
            dr.text((pad, y + 6), r[1].upper(), fill=(250, 240, 200, 255))
            y += 28
            continue
        _, row, rh = r
        for key, im, x in row:
            sheet.alpha_composite(im, (x, y + rh - im.height))
            dr.text((x, y + rh + 4), key.split("/")[1], fill=(225, 235, 210, 255))
        y += rh + 26
    sheet.save(os.path.join(out, "catalog.png"))


def preview(out, P, char=None):
    """A little corner of Kebun Warisan with the house, a field and the clutter."""
    N = 14
    W, H = N * 96 + 40, N * 48 + 260
    img = Image.new("RGBA", (W, H), (34, 52, 36, 255))
    ox, oy = W // 2, 230

    def g2s(gx, gy):
        return ox + (gx - gy) * 48, oy + (gx + gy) * 24

    field = {(x, y) for x in range(8, 12) for y in range(1, 5)}
    path = {(x, 6) for x in range(0, N)} | {(4, y) for y in range(6, N)}
    for gy in range(N):
        for gx in range(N):
            if (gx, gy) in field:
                k = "tanah/tanah_olah_basah" if (gx + gy) % 3 == 0 else "tanah/tanah_olah"
            elif (gx, gy) in path:
                k = "tanah/jalan_batu" if gx == 4 else "tanah/jalan_tanah"
            else:
                k = f"tanah/rumput_{(gx * 7 + gy * 3) % 3}"
            t, pv = P[k]
            sx, sy = g2s(gx + 0.5, gy + 0.5)
            img.alpha_composite(t, (int(sx - pv[0]), int(sy - pv[1])))
    objs = []

    def at(key, gx, gy):
        im, pv = P[key]
        sx, sy = g2s(gx, gy)
        objs.append((sy, im, int(sx - pv[0]), int(sy - pv[1])))

    # house at grid (1,1), door SW (faces the path at y = 6)
    im, go = P["bangunan/rumah_utama_sw"]
    sx, sy = g2s(1, 1)
    objs.append((g2s(1 + 5, 1 + 4)[1] - 30, im, int(sx - go[0]), int(sy - go[1])))
    crops = list(plants.CROPS)
    for i, (x, y) in enumerate(sorted(field)):
        c = crops[((y - 1) + (3 if x >= 10 else 0)) % len(crops)]
        stage = min(4, 1 + (x - 8) + (y % 2))
        at(f"tanaman/{c}_{stage}", x + 0.5, y + 0.5)
    for key, gx, gy in [
        ("pohon/mangga_berbuah", 0.5, 8.5), ("pohon/kelapa", 12.5, 8.5), ("pohon/pisang", 7.5, 1.0),
        ("pohon/pohon_hutan", 11.0, 12.0), ("pohon/jati", 1.5, 12.5), ("pohon/bibit_2", 7.5, 9.5),
        ("pohon/tunggul_besar", 9.5, 8.5), ("pohon/tunggul", 2.5, 9.5),
        ("batu/batu_besar", 7.0, 12.5), ("batu/batu_lumut", 9.5, 11.5), ("batu/batu_kecil", 3.0, 8.0),
        ("batu/bijih_tembaga", 12.5, 11.5), ("batu/kerikil", 6.5, 7.5),
        ("puing/kayu_tumbang", 10.5, 9.5), ("puing/ranting", 5.5, 8.5), ("puing/peti", 0.6, 5.5),
        ("puing/peti_rusak", 12.5, 3.5), ("puing/reruntuhan_bata", 12.5, 0.8), ("puing/tembok_runtuh", 10.5, 0.4),
        ("puing/pagar_bambu", 8.0, 5.3), ("puing/pagar_bambu_rusak", 10.0, 5.3), ("puing/papan_patah", 13.0, 5.4),
        ("puing/tiang_lapuk", 13.3, 2.2), ("puing/daun_kering", 2.0, 7.5),
        ("vegetasi/semak_kembang_sepatu", 0.5, 6.0 - 0.6), ("vegetasi/semak", 7.5, 4.5), ("vegetasi/semak_buah", 5.5, 11.5),
        ("vegetasi/semak_melati", 3.0, 13.5), ("vegetasi/alang_alang", 8.5, 13.0), ("vegetasi/rumput_liar", 6.0, 9.5),
        ("vegetasi/rumput_daun", 8.5, 10.5), ("vegetasi/pakis", 2.5, 11.0), ("vegetasi/bunga_liar_kuning", 6.0, 13.0),
        ("vegetasi/bunga_liar_merah_muda", 12.0, 13.5), ("vegetasi/rumput_liar", 11.5, 7.5),
    ]:
        at(key, gx, gy)
    if char and os.path.exists(char):
        c = Image.open(char).convert("RGBA")
        sx, sy = g2s(4.5, 6.5)
        objs.append((sy, c, int(sx - 48), int(sy - 116)))
    objs.sort(key=lambda o: o[0])
    for _, im, x, y in objs:
        img.alpha_composite(im, (x, y))
    img.save(os.path.join(out, "preview.png"))
    img.resize((W * 2, H * 2), Image.NEAREST).save(os.path.join(out, "preview_2x.png"))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="assets/environment")
    ap.add_argument("--char", default=None, help="a character frame (96 x 128, feet at 48,116) shown for scale")
    ap.add_argument("--pixel", type=int, default=1, help="art pixel size: 2 draws every sprite in 2 x 2 blocks, same sprite size")
    a = ap.parse_args()
    pix.PIXEL = a.pixel
    m = build_all(a.out, a.char)
    print(f"{len(m['assets'])} assets -> {a.out}")
