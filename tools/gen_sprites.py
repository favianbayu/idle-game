"""Generate every asset (characters, NPCs, face kit, buildings, environments, cities).

Run: python3 tools/gen_sprites.py (needs Pillow).
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from sprites import (buildings, customization, environments, main_character, npcs,  # noqa: E402
                     scenes, world)

if __name__ == "__main__":
    main_character.generate()
    npcs.generate()
    customization.generate()
    buildings.generate()
    environments.generate()
    world.generate()
    scenes.generate()
    print("done")
