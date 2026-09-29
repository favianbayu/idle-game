"""Tiny pixel-art drawing canvas for larger sprites (carts, buildings, props).

Works on the same palette-key grids as core.py, so everything renders through
core.render(). Coordinates are (x, y) from the top-left.
"""

FONT = {  # 3x5 uppercase pixel font
    "A": [".#.", "#.#", "###", "#.#", "#.#"], "B": ["##.", "#.#", "##.", "#.#", "##."],
    "C": [".##", "#..", "#..", "#..", ".##"], "D": ["##.", "#.#", "#.#", "#.#", "##."],
    "E": ["###", "#..", "##.", "#..", "###"], "F": ["###", "#..", "##.", "#..", "#.."],
    "G": [".##", "#..", "#.#", "#.#", ".##"], "H": ["#.#", "#.#", "###", "#.#", "#.#"],
    "I": ["###", ".#.", ".#.", ".#.", "###"], "J": ["..#", "..#", "..#", "#.#", ".#."],
    "K": ["#.#", "#.#", "##.", "#.#", "#.#"], "L": ["#..", "#..", "#..", "#..", "###"],
    "M": ["#...#", "##.##", "#.#.#", "#...#", "#...#"], "N": ["#..#", "##.#", "#.##", "#..#", "#..#"],
    "O": [".#.", "#.#", "#.#", "#.#", ".#."], "P": ["##.", "#.#", "##.", "#..", "#.."],
    "Q": [".#.", "#.#", "#.#", "##.", ".##"], "R": ["##.", "#.#", "##.", "#.#", "#.#"],
    "S": [".##", "#..", ".#.", "..#", "##."], "T": ["###", ".#.", ".#.", ".#.", ".#."],
    "U": ["#.#", "#.#", "#.#", "#.#", "###"], "V": ["#.#", "#.#", "#.#", "#.#", ".#."],
    "W": ["#...#", "#...#", "#.#.#", "##.##", "#...#"], "X": ["#.#", "#.#", ".#.", "#.#", "#.#"],
    "Y": ["#.#", "#.#", ".#.", ".#.", ".#."], "Z": ["###", "..#", ".#.", "#..", "###"],
    " ": ["...", "...", "...", "...", "..."], "-": ["...", "...", "###", "...", "..."],
    ".": ["...", "...", "...", "...", ".#."], "*": ["...", ".#.", "###", ".#.", "..."],
    "&": [".#.", "#.#", ".#.", "#.#", ".##"],
    "0": ["###", "#.#", "#.#", "#.#", "###"], "1": [".#.", "##.", ".#.", ".#.", "###"],
    "2": ["##.", "..#", ".#.", "#..", "###"], "3": ["##.", "..#", ".#.", "..#", "##."],
    "4": ["#.#", "#.#", "###", "..#", "..#"], "5": ["###", "#..", "##.", "..#", "##."],
    "6": [".##", "#..", "###", "#.#", "###"], "7": ["###", "..#", ".#.", ".#.", ".#."],
    "8": ["###", "#.#", "###", "#.#", "###"], "9": ["###", "#.#", "###", "..#", "##."],
    ":": [".", "#", ".", "#", "."], "/": ["..#", "..#", ".#.", "#..", "#.."],
    "+": ["...", ".#.", "###", ".#.", "..."], "%": ["#.#", "..#", ".#.", "#..", "#.#"],
    "!": ["#", "#", "#", ".", "#"], "?": ["##.", "..#", ".#.", "...", ".#."],
    ",": ["..", "..", "..", ".#", "#."], "(": [".#", "#.", "#.", "#.", ".#"],
    ")": ["#.", ".#", ".#", ".#", "#."], "=": ["...", "###", "...", "###", "..."],
    "'": ["#", "#", ".", ".", "."],
}
FONT["."] = [".", ".", ".", ".", "#"]


class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.g = [["."] * w for _ in range(h)]

    # -- basics --------------------------------------------------------------
    def get(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.g[y][x]
        return "."

    def px(self, x, y, c):
        if c and 0 <= x < self.w and 0 <= y < self.h:
            self.g[y][x] = c

    def rect(self, x, y, w, h, c):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.px(xx, yy, c)

    def hline(self, x, y, w, c):
        self.rect(x, y, w, 1, c)

    def vline(self, x, y, h, c):
        self.rect(x, y, 1, h, c)

    def frame(self, x, y, w, h, c):
        self.hline(x, y, w, c)
        self.hline(x, y + h - 1, w, c)
        self.vline(x, y, h, c)
        self.vline(x + w - 1, y, h, c)

    def box(self, x, y, w, h, fill, edge="O", light=None, dark=None):
        """Filled rectangle with outline and optional 1px bevel (light top-left)."""
        self.rect(x, y, w, h, fill)
        if light:
            self.hline(x + 1, y + 1, w - 2, light)
            self.vline(x + 1, y + 1, h - 2, light)
        if dark:
            self.hline(x + 1, y + h - 2, w - 2, dark)
            self.vline(x + w - 2, y + 1, h - 2, dark)
        if edge:
            self.frame(x, y, w, h, edge)

    def line(self, x0, y0, x1, y1, c):
        dx, dy = abs(x1 - x0), -abs(y1 - y0)
        sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
        err = dx + dy
        while True:
            self.px(x0, y0, c)
            if x0 == x1 and y0 == y1:
                return
            e2 = 2 * err
            if e2 >= dy:
                err += dy
                x0 += sx
            if e2 <= dx:
                err += dx
                y0 += sy

    def ellipse(self, cx, cy, rx, ry, c):
        for y in range(-ry, ry + 1):
            for x in range(-rx, rx + 1):
                if (x * x) / ((rx + 0.5) ** 2) + (y * y) / ((ry + 0.5) ** 2) <= 1:
                    self.px(cx + x, cy + y, c)

    def disc(self, cx, cy, r, c):
        self.ellipse(cx, cy, r, r, c)

    def ring(self, cx, cy, r, c, thick=1):
        for y in range(-r, r + 1):
            for x in range(-r, r + 1):
                d = (x * x + y * y) ** 0.5
                if r - thick < d <= r + 0.5:
                    self.px(cx + x, cy + y, c)

    def poly(self, pts, c):
        """Filled polygon (even-odd scanline)."""
        ys = [p[1] for p in pts]
        for y in range(min(ys), max(ys) + 1):
            xs = []
            for i, (x0, y0) in enumerate(pts):
                x1, y1 = pts[(i + 1) % len(pts)]
                if y0 == y1:
                    continue
                if min(y0, y1) <= y + 0.5 < max(y0, y1):
                    xs.append(x0 + (y + 0.5 - y0) * (x1 - x0) / (y1 - y0))
            xs.sort()
            for a, b in zip(xs[::2], xs[1::2]):
                for x in range(round(a), round(b)):
                    self.px(x, y, c)

    def fill_fn(self, x, y, w, h, fn):
        """fn(i, j) -> key or None, for patterns (bricks, tiles, stripes)."""
        for j in range(h):
            for i in range(w):
                self.px(x + i, y + j, fn(i, j))

    def recolor(self, x, y, w, h, mapping):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                c = self.get(xx, yy)
                if c in mapping:
                    self.px(xx, yy, mapping[c])

    # -- text ----------------------------------------------------------------
    @staticmethod
    def text_width(s, scale=1):
        return (sum(len(FONT[ch][0]) + 1 for ch in s.upper()) - 1) * scale

    def text(self, x, y, s, c, scale=1, shadow=None):
        cx = x
        for ch in s.upper():
            glyph = FONT[ch]
            for j, line in enumerate(glyph):
                for i, bit in enumerate(line):
                    if bit == "#":
                        ox, oy = cx + i * scale, y + j * scale
                        if shadow:
                            self.rect(ox + 1, oy + 1, scale, scale, shadow)
                        self.rect(ox, oy, scale, scale, c)
            cx += (len(glyph[0]) + 1) * scale
        # redraw letters over shadows of neighbours
        if shadow:
            self.text(x, y, s, c, scale)

    def text_center(self, cx, y, s, c, scale=1, shadow=None):
        self.text(cx - self.text_width(s, scale) // 2, y, s, c, scale, shadow)

    # -- composition ---------------------------------------------------------
    def outline(self, c="O", skip=(".",)):
        """Add a 1px outline around the silhouette (4-neighbourhood)."""
        add = []
        for y in range(self.h):
            for x in range(self.w):
                if self.g[y][x] != ".":
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    n = self.get(x + dx, y + dy)
                    if n not in skip and n != c:
                        add.append((x, y))
                        break
        for x, y in add:
            self.g[y][x] = c

    def paste(self, grid, x, y):
        for j, line in enumerate(grid):
            for i, ch in enumerate(line):
                if ch != ".":
                    self.px(x + i, y + j, ch)

    def copy(self):
        c = Canvas(self.w, self.h)
        c.g = [r[:] for r in self.g]
        return c

    def shifted(self, dy):
        c = Canvas(self.w, self.h)
        for y in range(self.h):
            sy = y - dy
            if 0 <= sy < self.h:
                c.g[y] = self.g[sy][:]
        return c
