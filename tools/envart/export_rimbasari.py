"""Copy the environment set into the Godot prototype (Desa Rimbasari 0.7) so it
can be reviewed in game.

    python3 tools/envart/build.py                      # assets/environment first
    python3 tools/envart/export_rimbasari.py PATH/TO/Rimbasari

The prototype reads fixed sprite sheets (see its tools/gen_art.py). This
script repacks our sprites into those sheets, each sprite placed so its pivot
lands on the sheet's anchor. Sheets we only partly cover (village trees,
decorations) keep their other frames. The prototype's data files are not
touched here; the sheet layouts that changed are listed in SHEETS_NOTE.
"""
import json
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ENV = os.path.join(HERE, "..", "..", "assets", "environment")

# ground.png: one 96 x 48 tile per FarmMap.TILE_INDEX entry, in that order
GROUND = ["rumput_0", "rumput_2", "rumput_1", "tanah_olah", "tanah_olah_basah", "jalan_tanah", "air", "lumpur",
          "lantai", "sawah", "batas", "jalan_batu", "tanah_kosong", "pasir", "lantai_gua", "dinding_gua",
          "air_dalam", "jurang"]
# prototype crop id -> our crop strip
CROPS = {"padi_lokal": "padi", "jagung_manis": "jagung", "cabai_rawit": "cabai", "cabai_keriting": "cabai",
         "tomat": "tomat", "terung_ungu": "terong", "semangka": "semangka"}
# puing.png, 96 x 96 frames, tile centre at (48, 72)
PUING = ["vegetasi/rumput_liar", "vegetasi/rumput_daun", "vegetasi/pakis",      # rumput_liar, 3 variants
         "batu/batu_kecil", "batu/batu_kecil_2", "batu/batu_lumut",             # batu, 3 variants
         "puing/ranting",                                                       # ranting
         "pohon/tunggul"]                                                       # tunggul_pohon
# pohon_liar.png: sengon, mahoni, waru (frames 144 x 208, trunk base at 72, 196)
WILD = ["pohon/jati", "pohon/pohon_hutan", "pohon/mangga"]
# pohon_desa.png frame -> our tree (192 x 256, trunk base at 96, 244)
VILLAGE = {2: "pohon/pohon_hutan", 4: "pohon/mangga_berbuah", 7: "pohon/pisang", 8: "pohon/kelapa"}
# dekor.png frame -> our sprite (96 x 224, tile centre at 48, 208)
DECOR = {1: "vegetasi/bunga_liar_kuning", 5: "vegetasi/semak", 6: "vegetasi/alang_alang", 7: "batu/batu_kecil_2",
         20: "vegetasi/bunga_liar_merah_muda", 22: "batu/batu_besar"}

SHEETS_NOTE = {
    "puing.png": "8 frames: rumput_liar 0-2, batu 3-5, ranting 6, tunggul_pohon 7",
    "pohon_liar.png": "3 frames of 144 x 208, trunk base at (72, 196)",
    "rumah_utama.png": "house sprite; footprint 5 x 4 with the door on the SW face",
}


def load_env():
    with open(os.path.join(ENV, "environment.json")) as f:
        man = json.load(f)["assets"]

    def get(key):
        e = man[key]
        return Image.open(os.path.join(ENV, e["file"])).convert("RGBA"), tuple(e["pivot"]), e
    return get


def place(sheet, img, pivot, frame_xy, anchor, size, name):
    """Paste img into the frame at frame_xy so pivot lands on anchor; never past the frame."""
    fx, fy = frame_xy
    fw, fh = size
    x, y = anchor[0] - pivot[0], anchor[1] - pivot[1]
    box = (max(0, -x), max(0, -y), min(img.width, fw - x), min(img.height, fh - y))
    full = img.getbbox()
    lost = full and (full[0] < box[0] or full[1] < box[1] or full[2] > box[2] or full[3] > box[3])
    if lost:
        print(f"  warning: {name} is cut by its {fw} x {fh} frame")
    part = img.crop(box)
    sheet.alpha_composite(part, (fx + x + box[0], fy + y + box[1]))


def clear(sheet, box):
    sheet.paste(Image.new("RGBA", (box[2] - box[0], box[3] - box[1]), (0, 0, 0, 0)), box[:2])


def export(game):
    get = load_env()
    a = os.path.join(game, "assets")

    g = Image.new("RGBA", (96 * len(GROUND), 48), (0, 0, 0, 0))
    for i, name in enumerate(GROUND):
        im, _, _ = get(f"tanah/{name}")
        g.alpha_composite(im, (i * 96, 0))
    g.save(os.path.join(a, "tiles/ground.png"))

    for cid, ours in CROPS.items():
        strip, pv, e = get(f"tanaman/{ours}")
        fw, fh = e["frame"]
        out = Image.new("RGBA", (96 * 5, 96), (0, 0, 0, 0))
        for k in range(5):
            place(out, strip.crop((k * fw, 0, (k + 1) * fw, fh)), pv, (k * 96, 0), (48, 72), (96, 96), f"{cid}:{k}")
        out.save(os.path.join(a, f"crops/{cid}.png"))

    sh = Image.new("RGBA", (96 * len(PUING), 96), (0, 0, 0, 0))
    for i, key in enumerate(PUING):
        im, pv, _ = get(key)
        place(sh, im, pv, (i * 96, 0), (48, 72), (96, 96), key)
    sh.save(os.path.join(a, "props/puing.png"))

    im, pv, _ = get("pohon/tunggul_tua")
    sh = Image.new("RGBA", (192, 160), (0, 0, 0, 0))
    place(sh, im, pv, (0, 0), (96, 112), (192, 160), "tunggul_tua")
    sh.save(os.path.join(a, "props/tunggul.png"))

    sh = Image.new("RGBA", (144 * len(WILD), 208), (0, 0, 0, 0))
    for i, key in enumerate(WILD):
        im, pv, _ = get(key)
        place(sh, im, pv, (i * 144, 0), (72, 196), (144, 208), key)
    sh.save(os.path.join(a, "props/pohon_liar.png"))

    im, pv, _ = get("pohon/mangga")
    sh = Image.new("RGBA", (144, 192), (0, 0, 0, 0))
    place(sh, im, pv, (0, 0), (72, 180), (144, 192), "pohon")
    sh.save(os.path.join(a, "props/pohon.png"))

    for fname, frames, (fw, fh), anchor in (("pohon_desa.png", VILLAGE, (192, 256), (96, 244)),
                                            ("dekor.png", DECOR, (96, 224), (48, 208))):
        path = os.path.join(a, "props", fname)
        sh = Image.open(path).convert("RGBA")
        for i, key in frames.items():
            clear(sh, (i * fw, 0, (i + 1) * fw, fh))
            im, pv, _ = get(key)
            place(sh, im, pv, (i * fw, 0), anchor, (fw, fh), key)
        sh.save(path)

    im, pv, e = get("bangunan/rumah_utama_sw")
    im.save(os.path.join(a, "props/rumah_utama.png"))
    print(f"  rumah_utama.png {im.width} x {im.height}, north corner of the footprint at {e['grid_origin']}")
    for k, v in SHEETS_NOTE.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    export(sys.argv[1])
    print("ok")
