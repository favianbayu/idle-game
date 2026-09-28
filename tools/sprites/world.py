"""Export city data (specials, landmarks, asset paths) and the street props."""

import json

from . import buildings, props
from .cities import CITIES, CITY_ORDER
from .core import ASSETS, scale

ROOT_ASSETS = ASSETS.parent
PROPS_OUT = ROOT_ASSETS / "props"


def generate():
    PROPS_OUT.mkdir(parents=True, exist_ok=True)
    for name in props.PROPS:
        im = props.image(name)
        im.save(PROPS_OUT / f"{name}.png")
        scale(im, 4).save(PROPS_OUT / f"{name}@4x.png")

    data = {"order": CITY_ORDER, "cities": {}}
    for cid in CITY_ORDER:
        c = CITIES[cid]
        data["cities"][cid] = {
            "name": c["name"],
            "culture": c["culture"],
            "landmark": c["landmark"],
            "specials": c["specials"],
            "shop_signs": {f"stage{k}": v for k, v in c["signs"].items() if v},
            "props": c["props"],
            "stages": {
                f"stage{s}": {
                    "environment": f"environments/{cid}/stage{s}/bg.png",
                    "environment_layers": [
                        f"environments/{cid}/stage{s}/layer_{n}.png"
                        for n in ("sky", "far", "mid", "near")
                        if (ROOT_ASSETS / f"environments/{cid}/stage{s}/layer_{n}.png").exists()],
                    "building": f"buildings/{cid}/stage{s}_{buildings.STAGES[s]['slug']}/",
                }
                for s in range(1, 6)
            },
        }
    (ROOT_ASSETS / "cities.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
