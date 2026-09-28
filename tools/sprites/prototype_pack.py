"""Pack the assets the playable prototype needs into a few atlas sheets + data.json.

Output: prototype/atlas0.png, atlas1.png, ... and prototype/data.json
(atlas map, menu, cities, building meta, easter eggs, time-of-day tints).
"""

import json
import shutil

from PIL import Image

from .buildings import STAGES as BSTAGES
from .cities import CITIES, CITY_ORDER
from .core import ASSETS

ROOT = ASSETS.parent
OUT = ROOT.parent / "prototype"
SHEET = 2048
TODS = ["pagi", "siang", "sore", "malam"]
HERO_FRAMES = ["idle1", "idle2", "tap", "masak1", "masak2", "masak3", "masak4"]
CUST_FRAMES = ["jalan1", "jalan2", "jalan3", "jalan4", "tunggu1", "tunggu2", "senang1", "senang2",
               "senang3"]
CUSTOMERS = ["pelanggan_01", "pelanggan_02", "pelanggan_03", "pelanggan_04", "bu_yanti"]


def _collect():
    items = {}

    def add(name, path):
        items[name] = Image.open(path).convert("RGBA")

    for city in CITY_ORDER:
        for s in range(1, 5):
            for tod in TODS:
                add(f"env:{city}:{s}:{tod}", ROOT / "environments" / city / f"stage{s}" / "waktu" / f"{tod}.png")
        add(f"env:{city}:5:fantasi", ROOT / "environments" / city / "stage5" / "bg.png")
        for s in range(1, 6):
            folder = ROOT / "buildings" / city / f"stage{s}_{BSTAGES[s]['slug']}"
            for f in (1, 2):
                add(f"bld:{city}:{s}:{f}", folder / f"frame{f}.png")
                if (folder / f"frame{f}_lampu.png").exists():
                    add(f"bldL:{city}:{s}:{f}", folder / f"frame{f}_lampu.png")
            for fr in HERO_FRAMES:
                add(f"hero:{city}:{s}:{fr}", ASSETS / "main" / "kota" / city / f"stage{s}" / f"{fr}.png")
    lw = ASSETS / "lewat"
    for n in ("jalan1", "jalan2", "jalan3", "jalan4", "duduk1", "duduk2"):
        add(f"lewat:kucing:{n}", lw / "kucing" / f"{n}.png")
    for n in ("jalan1", "jalan2", "matuk1", "matuk2"):
        add(f"lewat:ayam:{n}", lw / "ayam" / f"{n}.png")
    for m in ("motor_ojek", "motor_ojek_hujan", "motor_keluarga", "motor_keluarga_hujan"):
        for n in ("jalan1", "jalan2"):
            add(f"lewat:{m}:{n}", lw / m / f"{n}.png")
    for m in ("tukang_sayur", "tukang_sayur_hujan"):
        for n in ("jalan1", "jalan2", "jalan3", "jalan4"):
            add(f"lewat:{m}:{n}", lw / m / f"{n}.png")
    for c in ("merah", "biru", "kuning", "hijau"):
        add(f"payung:{c}", lw / f"payung_{c}.png")
    for fr in ("float1", "float2", "senang"):
        add(f"rempi:{fr}", ASSETS / "npc" / "rempi" / f"{fr}.png")
    anim = ASSETS / "npc" / "animasi"
    for c in CUSTOMERS:
        for fr in CUST_FRAMES:
            add(f"cust:{c}:{fr}", anim / c / f"{fr}.png")
    eggs = json.loads((ASSETS / "npc" / "easter_egg" / "easter_egg.json").read_text())["npc"]
    for e in eggs:
        for fr in CUST_FRAMES:
            add(f"cust:{e['id']}:{fr}", ASSETS / "npc" / "easter_egg" / e["id"] / f"{fr}.png")
    for k in ("pesan", "tunggu", "senang", "kesal"):
        add(f"bubble:{k}", anim / f"gelembung_{k}.png")
    menu = json.loads((ROOT / "food" / "menu.json").read_text())
    for city, cd in menu["cities"].items():
        for it in cd["menu"]:
            add(f"food:{city}:{it['id']}", ROOT / it["icon"])
            add(f"food:{city}:{it['id']}:locked", ROOT / it["icon_locked"])
    atlas = json.loads((ROOT / "ui" / "ui_icons_atlas.json").read_text())
    for n in atlas["icons"]:
        add(f"ui:{n}", ROOT / "ui" / f"{n}.png")
    fx = ROOT / "ui" / "efek_tap"
    for n in ["koin_putar1", "koin_putar2", "koin_putar3", "koin_putar4", "ledakan1", "ledakan2",
              "ledakan3", "ledakan4", "lingkar_makanan"]:
        add(f"fx:{n}", fx / f"{n}.png")
    ef = ROOT / "environments" / "efek"
    for n in ["awan_besar", "awan_sedang", "awan_kecil", "burung1", "burung2", "burung3", "hujan1",
              "hujan2", "hujan3", "hujan4", "kunang1", "kunang2"]:
        add(f"fx:{n}", ef / f"{n}.png")
    return items, menu, eggs


def _pack(items):
    order = sorted(items, key=lambda n: (-items[n].height, -items[n].width, n))
    sheets, mapping = [], {}
    x = y = shelf_h = 0
    cur = Image.new("RGBA", (SHEET, SHEET), (0, 0, 0, 0))
    for n in order:
        im = items[n]
        if x + im.width > SHEET:
            x, y, shelf_h = 0, y + shelf_h + 1, 0
        if y + im.height > SHEET:
            sheets.append(cur)
            cur = Image.new("RGBA", (SHEET, SHEET), (0, 0, 0, 0))
            x = y = shelf_h = 0
        cur.alpha_composite(im, (x, y))
        mapping[n] = [len(sheets), x, y, im.width, im.height]
        x += im.width + 1
        shelf_h = max(shelf_h, im.height)
    sheets.append(cur)
    # crop last sheet
    used = [m for m in mapping.values() if m[0] == len(sheets) - 1]
    h = max(m[2] + m[4] for m in used) + 1
    w = max(m[1] + m[3] for m in used) + 1
    sheets[-1] = sheets[-1].crop((0, 0, w, h))
    return sheets, mapping


def generate():
    OUT.mkdir(parents=True, exist_ok=True)
    items, menu, eggs = _collect()
    sheets, mapping = _pack(items)
    for i, sh in enumerate(sheets):
        sh.save(OUT / f"atlas{i}.png", optimize=True)
    for old in OUT.glob("atlas*.png"):
        if int(old.stem[5:]) >= len(sheets):
            old.unlink()
    bmeta = json.loads((ROOT / "buildings" / "buildings.json").read_text())
    waktu = json.loads((ROOT / "environments" / "waktu.json").read_text())
    data = {
        "sheets": [f"atlas{i}.png" for i in range(len(sheets))],
        "atlas": mapping,
        "cities": {c: {"name": CITIES[c]["name"], "culture": CITIES[c]["culture"],
                       "landmark": CITIES[c]["landmark"]} for c in CITY_ORDER},
        "cityOrder": CITY_ORDER,
        "stageNames": {s: BSTAGES[s]["slug"] for s in BSTAGES},
        "buildings": bmeta,
        "menu": menu["cities"],
        "easter": eggs,
        "customers": CUSTOMERS,
        "tint": waktu["tint_latar_depan"],
        "tods": TODS,
    }
    kit = OUT / "kit"
    kit.mkdir(exist_ok=True)
    for f in (ROOT / "ui" / "kit_v2").glob("*.png"):
        if f.name != "kit_v2_preview.png":
            shutil.copy(f, kit / f.name)
    (OUT / "data.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
