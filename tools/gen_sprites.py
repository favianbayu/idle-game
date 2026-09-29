"""Generate every asset (characters, NPCs, face kit, buildings, environments, cities).

Run: python3 tools/gen_sprites.py (needs Pillow).
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from sprites import (buildings, costumes, customization, easter, env_anim, environments,  # noqa: E402
                     events, food, lewat_kota, main_character, npc_anim, npcs, passersby, prototype_pack, scenes, tap_fx, ui_icons,
                     ui_kit2, ui_layout, world)

if __name__ == "__main__":
    main_character.generate()
    npcs.generate()
    costumes.generate()
    npc_anim.generate()
    easter.generate()
    passersby.generate()
    lewat_kota.generate()
    events.generate()
    customization.generate()
    buildings.generate()
    environments.generate()
    env_anim.generate()
    food.validate()
    food.generate()
    ui_icons.generate()
    world.generate()
    scenes.generate()
    ui_layout.generate()
    tap_fx.generate()
    ui_kit2.generate()
    prototype_pack.generate()
    print("done")
