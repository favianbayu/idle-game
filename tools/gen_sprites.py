"""Generate every asset (characters, NPCs, face kit, buildings, environments, cities).

Run: python3 tools/gen_sprites.py (needs Pillow).
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from sprites import (buildings, customization, environments, food, main_character,  # noqa: E402
                     npcs, scenes, ui_icons, ui_layout, world)

if __name__ == "__main__":
    main_character.generate()
    npcs.generate()
    customization.generate()
    buildings.generate()
    environments.generate()
    food.validate()
    food.generate()
    ui_icons.generate()
    world.generate()
    scenes.generate()
    ui_layout.generate()
    print("done")
