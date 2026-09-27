"""Generate every character sprite: python3 tools/gen_sprites.py (needs Pillow)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from sprites import customization, main_character, npcs  # noqa: E402

if __name__ == "__main__":
    main_character.generate()
    npcs.generate()
    customization.generate()
    print("done")
