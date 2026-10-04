"""Small pixel-art drawing kit for the Rimbasari environment builders.

Everything is drawn in code, pixel by pixel, so every asset can be rebuilt,
re-coloured or resized from source. A Canvas keeps colour, coverage and a
depth per pixel; shapes are painted back to front (or by depth), shaded with
hand-picked colour ramps (darkest first, hue-shifted: shadows lean cool and
purple, highlights lean warm and yellow, like Stardew Valley's palette), and
finished with a 1 px coloured outline that is darker on the shadow side
(bottom right) than on the lit side (top left).

Light comes from the top left of the screen, as for the character sprites.
"""
import math

import numpy as np
from PIL import Image


def hexrgb(h):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def R(*hexes):
    """A colour ramp, darkest first."""
    return [hexrgb(h) for h in hexes]


# --------------------------------------------------------------------- palette
RAMPS = {
    # foliage
    "leaf": R("#13261f", "#1d3b2a", "#2a5530", "#3d7233", "#568f35", "#78ad3c", "#9fc94f", "#cbe36f"),
    "leaf_dark": R("#0f1f1c", "#16302a", "#1f4430", "#2e5c34", "#427838", "#5c9440"),
    "leaf_yellow": R("#2a3418", "#46521e", "#6b7424", "#93942c", "#bcb53c", "#dfd45a", "#f2ea8c"),
    "palm": R("#142a22", "#1f4230", "#2e5d35", "#457d38", "#64993c", "#8ab748", "#b8d468"),
    "banana": R("#16301f", "#22502a", "#327135", "#4a9140", "#6cae48", "#95c95a", "#c4e37c"),
    "grass": R("#1b3324", "#27502c", "#386f30", "#4f8c34", "#6ea73a", "#93c14a", "#bfdc6a"),
    "straw": R("#4a3317", "#6f4f1f", "#977127", "#bc9332", "#d9b447", "#ecd170", "#f7e9a6"),
    "rice_green": R("#1d3a22", "#2c5a2a", "#427a30", "#5f9a36", "#86b947", "#b3d466"),
    # wood
    "bamboo": R("#2c2a16", "#4a4520", "#6c652b", "#8f8638", "#ada34a", "#c8bd68", "#e0d695"),
    "bark": R("#24140f", "#3a2016", "#53301d", "#6c4126", "#875532", "#a26c40", "#bd8a55"),
    "bark_grey": R("#26221f", "#3c3530", "#554b43", "#6e6256", "#887a6a", "#a39582"),
    "palm_bark": R("#2a1d14", "#45301f", "#634529", "#7f5c35", "#9b7646", "#b8955e", "#d2b47c"),
    "plank": R("#2b1810", "#462718", "#633a22", "#814f2d", "#9e663a", "#bb824b", "#d6a265", "#ebc387"),
    "plank_old": R("#262019", "#3b3126", "#544533", "#6d5a41", "#877151", "#a18a65", "#b9a47e"),
    "wood_cut": R("#5a3820", "#8a5a32", "#b88346", "#d8a862", "#eccb8a"),
    "teak": R("#2a1408", "#4a240f", "#6d3816", "#904d1f", "#b0662a", "#cb853a"),
    # stone and earth
    "stone": R("#1c1a26", "#2a2735", "#3b3747", "#4f4a5b", "#666070", "#7f7987", "#9a95a0", "#b9b5bb", "#d8d5d6"),
    "stone_warm": R("#231d1e", "#372d2b", "#4e423c", "#68594f", "#837265", "#9f8d7d", "#bbab97", "#d6c9b3"),
    "mossy": R("#18261c", "#24391f", "#355223", "#4b6a29", "#678535", "#86a043"),
    "soil": R("#22140e", "#361f14", "#4d2d1b", "#673e24", "#82522f", "#9c683c", "#b5814d"),
    "soil_wet": R("#170c09", "#24130d", "#341c12", "#462718", "#5a3420", "#6e4229"),
    "dirt": R("#3a2618", "#55391f", "#704d29", "#8c6434", "#a77d44", "#c09858", "#d7b373"),
    "sand": R("#6d5536", "#8c7045", "#ab8d58", "#c6a96d", "#dcc387", "#ecdaa6"),
    "clay": R("#3d1611", "#62231a", "#8a3322", "#ab462b", "#c75f36", "#df7e47", "#ee9f60", "#f7c084"),
    "plaster": R("#5b5048", "#7c6f63", "#9e9080", "#bdb09c", "#d6cbb6", "#e9e1cf", "#f6f1e4"),
    "paint_green": R("#0f2a24", "#173e33", "#205442", "#2d6c51", "#3f8762", "#5aa275", "#80bd8f"),
    "iron": R("#1b1a1f", "#2c2a31", "#403d45", "#57535b", "#706b72", "#8b868b"),
    "copper": R("#3a1a12", "#64301a", "#8f4a22", "#b9672c", "#d9893c", "#efae5c", "#f9d38a"),
    "ironore": R("#2b1612", "#4c271c", "#713a26", "#965032", "#b46a45", "#cf8c64"),
    "gold": R("#4a2c0c", "#7a4f12", "#a87818", "#d1a322", "#efc842", "#fbe57c", "#fff6c4"),
    "gem": R("#10203f", "#183568", "#22529a", "#3279c4", "#55a3e0", "#8fcdf2", "#d6f2ff"),
    "glass": R("#162433", "#203448", "#2c4a63", "#3e6683", "#5d88a3", "#8cb2c6", "#c8e0e8"),
    "water": R("#14283c", "#1b3a55", "#24506e", "#2f6888", "#3f82a2", "#5ea0ba"),
    "cloth_white": R("#6b6460", "#8d8680", "#b0a99f", "#cec8bd", "#e6e1d6", "#f7f4ec"),
    # fruit, flowers, vegetables
    "red": R("#3b0d14", "#661520", "#931f26", "#bf2f2c", "#e04a36", "#f3794c", "#fbae78"),
    "tomato": R("#3d0f0e", "#6b1a14", "#9c2618", "#c9381d", "#e85828", "#f68844", "#fcbf7a"),
    "orange": R("#4a1c0c", "#7a3210", "#aa4d14", "#d36d1c", "#ef912e", "#f8b85a", "#fde0a0"),
    "yellow": R("#4d3a0c", "#7d5f10", "#ab8614", "#d3ac1f", "#eccd35", "#f8e46c", "#fff6b8"),
    "purple": R("#1b0d24", "#2e1440", "#46205c", "#5f2f78", "#7b4394", "#9a62ad", "#bd8ccb"),
    "pink": R("#3e1226", "#6b1d3d", "#992a57", "#c43d73", "#e05c92", "#f087b0", "#fbbad3"),
    "white": R("#6f6a73", "#948e97", "#b8b3b9", "#d6d2d4", "#ecebe8", "#fbfaf6"),
    "melon": R("#14260f", "#203d16", "#2f581c", "#437424", "#5d922f", "#80ae42", "#aacb67"),
    "melon_stripe": R("#0d1a0b", "#142810", "#1e3a15"),
    "corn_husk": R("#2f3a16", "#4b5a1e", "#6c7d29", "#8f9e38", "#b4bb52", "#d6d579"),
    "corn": R("#5a3d08", "#8a610c", "#b88a12", "#dcb122", "#f2d040", "#fbe878", "#fff5c0"),
    "cassava_root": R("#3a2010", "#5c3418", "#7f4c24", "#a06634", "#bb8350"),
}


def ramp(name):
    return RAMPS[name]


def mix(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def darker(c, f=0.55, cool=True):
    """A shadow version of a colour: darker, more saturated, nudged to blue/purple."""
    r, g, b = [x / 255 for x in c]
    r, g, b = r * f, g * f, b * f
    if cool:
        r, g, b = r * 0.92, g * 0.95, min(1.0, b * 1.12 + 0.015)
    return (int(r * 255), int(g * 255), int(b * 255))


BAYER4 = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0


def bayer(x, y):
    x, y = int(x) // PIXEL, int(y) // PIXEL
    return BAYER4[y & 3, x & 3]


class Noise:
    """Smooth value noise, seeded, for organic wobble and texture."""

    def __init__(self, seed, size=64):
        rs = np.random.RandomState(seed)
        self.g = rs.rand(size, size)
        self.n = size

    def __call__(self, x, y):
        n = self.n
        x0, y0 = math.floor(x), math.floor(y)
        fx, fy = x - x0, y - y0
        fx = fx * fx * (3 - 2 * fx)
        fy = fy * fy * (3 - 2 * fy)
        g = self.g
        a = g[y0 % n, x0 % n]
        b = g[y0 % n, (x0 + 1) % n]
        c = g[(y0 + 1) % n, x0 % n]
        d = g[(y0 + 1) % n, (x0 + 1) % n]
        return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy

    def fbm(self, x, y, octaves=3):
        v, amp, tot = 0.0, 1.0, 0.0
        for i in range(octaves):
            v += self(x * (2 ** i) + 17.3 * i, y * (2 ** i) + 5.1 * i) * amp
            tot += amp
            amp *= 0.5
        return v / tot


# Art pixel size in screen pixels. With PIXEL = 2 every sprite keeps its size
# but is drawn with 2 x 2 blocks: shapes are drawn as usual, then each 2 x 2
# block takes the colour most of its pixels have, and the outline is drawn
# around the blocks (see Canvas.outline / Canvas.chunky).
PIXEL = 1
TIE_DARK = True     # a 2-2 tie in a block goes to the darker colour, so seams and creases survive

LIGHT3 = np.array([-0.55, -0.62, 0.56])   # screen x right, y down, z toward viewer
LIGHT3 = LIGHT3 / np.linalg.norm(LIGHT3)


class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.rgb = np.zeros((h, w, 3), np.uint8)
        self.a = np.zeros((h, w), bool)
        self.depth = np.full((h, w), -1e9)
        self.noline = np.zeros((h, w), bool)   # pixels that never get an outline next to them

    # -- basic pixel access
    def inside(self, x, y):
        return 0 <= x < self.w and 0 <= y < self.h

    def put(self, x, y, c, depth=None):
        x, y = int(x), int(y)
        if not self.inside(x, y):
            return
        if PIXEL > 1:
            # draw the whole art pixel (block) this screen pixel falls in
            x, y = x - x % PIXEL, y - y % PIXEL
            if depth is not None:
                if depth < self.depth[y, x]:
                    return
                self.depth[y:y + PIXEL, x:x + PIXEL] = depth
            self.rgb[y:y + PIXEL, x:x + PIXEL] = c
            self.a[y:y + PIXEL, x:x + PIXEL] = True
            return
        if depth is not None:
            if depth < self.depth[y, x]:
                return
            self.depth[y, x] = depth
        self.rgb[y, x] = c
        self.a[y, x] = True

    def get(self, x, y):
        if self.inside(x, y) and self.a[y, x]:
            return tuple(int(v) for v in self.rgb[y, x])
        return None

    def erase(self, x, y):
        if self.inside(x, y):
            self.a[y, x] = False

    # -- shapes
    def line(self, x0, y0, x1, y1, c, depth=None):
        x0, y0, x1, y1 = int(round(x0)), int(round(y0)), int(round(x1)), int(round(y1))
        dx, dy = abs(x1 - x0), -abs(y1 - y0)
        sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
        err = dx + dy
        while True:
            self.put(x0, y0, c, depth)
            if x0 == x1 and y0 == y1:
                break
            e2 = 2 * err
            if e2 >= dy:
                err += dy
                x0 += sx
            if e2 <= dx:
                err += dx
                y0 += sy

    def rect(self, x0, y0, w, h, c):
        for y in range(int(y0), int(y0 + h)):
            for x in range(int(x0), int(x0 + w)):
                self.put(x, y, c)

    def blit(self, other, ox, oy):
        for y in range(other.h):
            for x in range(other.w):
                if other.a[y, x]:
                    self.put(ox + x, oy + y, tuple(other.rgb[y, x]))

    # -- shaded volumes ---------------------------------------------------
    def blob(self, cx, cy, rx, ry, rmp, *, wobble=0.0, noise=None, nscale=0.18,
             light=LIGHT3, lo=0, hi=None, bias=0.0, rim=True, dither=True,
             tex=None, depth=None, flat=0.0, clip=None):
        """A shaded ellipsoid (rock, leaf clump, fruit...).

        The outline is wobbled by `noise`; each pixel gets the sphere normal,
        Lambert light, and a ramp tone between lo and hi. `tex(x, y)` may
        return a tone offset for texture. Rim: the edge pixels on the shadow
        side take the darkest tone so overlapping volumes stay readable.
        """
        hi = len(rmp) - 1 if hi is None else hi
        mask = {}
        x0, x1 = int(cx - rx - 3), int(cx + rx + 3)
        y0, y1 = int(cy - ry - 3), int(cy + ry + 3)
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                dx = (x + 0.5 - cx) / rx
                dy = (y + 0.5 - cy) / ry
                r2 = dx * dx + dy * dy
                lim = 1.0
                if noise is not None and wobble:
                    ang = math.atan2(dy, dx)
                    lim = 1.0 + wobble * (noise(math.cos(ang) * 2.2 + cx * 0.05, math.sin(ang) * 2.2 + cy * 0.05) - 0.5) * 2
                if r2 <= lim * lim:
                    if clip is not None and not clip(x, y):
                        continue
                    mask[(x, y)] = (dx / lim, dy / lim)
        for (x, y), (dx, dy) in mask.items():
            r2 = min(1.0, dx * dx + dy * dy)
            nz = math.sqrt(1 - r2)
            nz = nz * (1 - flat) + flat
            n = np.array([dx, dy, nz])
            n /= np.linalg.norm(n)
            l = float(n @ light)
            v = 0.5 + 0.5 * l + bias
            if tex is not None:
                v += tex(x, y)
            if dither:
                v += (bayer(x, y) - 0.5) * 0.10
            t = lo + v * (hi - lo + 0.999)
            t = int(max(lo, min(hi, math.floor(t))))
            if rim:
                # shadow-side rim
                ex = (x + PIXEL, y) not in mask
                ey = (x, y + PIXEL) not in mask
                if (ex or ey) and dx + dy > -0.2:
                    t = max(lo, min(t, lo + 1) - (1 if dy > 0.3 else 0))
            d = None if depth is None else depth + nz * min(rx, ry)
            self.put(x, y, rmp[t], d)
        return mask

    # -- finishing --------------------------------------------------------
    def downsample(self, n, min_cover=2):
        """One pixel per n x n block: kept if at least min_cover of its pixels
        are drawn, coloured with the colour most of them have."""
        sw, sh = (self.w + n - 1) // n, (self.h + n - 1) // n
        small = Canvas(sw, sh)
        for by in range(sh):
            for bx in range(sw):
                counts = {}
                for y in range(by * n, min(self.h, by * n + n)):
                    for x in range(bx * n, min(self.w, bx * n + n)):
                        if self.a[y, x]:
                            c = tuple(int(v) for v in self.rgb[y, x])
                            counts[c] = counts.get(c, 0) + 1
                tot = sum(counts.values())
                if tot < min_cover:
                    continue
                best = max(counts.items(), key=lambda kv: (kv[1], -sum(kv[0]) if TIE_DARK else sum(kv[0])))
                small.rgb[by, bx] = best[0]
                small.a[by, bx] = True
                small.noline[by, bx] = any(
                    self.noline[y, x] for y in range(by * n, min(self.h, by * n + n))
                    for x in range(bx * n, min(self.w, bx * n + n)))
        return small

    def take_upscaled(self, small, n):
        big_rgb = np.repeat(np.repeat(small.rgb, n, axis=0), n, axis=1)[: self.h, : self.w]
        big_a = np.repeat(np.repeat(small.a, n, axis=0), n, axis=1)[: self.h, : self.w]
        self.rgb = np.ascontiguousarray(big_rgb)
        self.a = np.ascontiguousarray(big_a)
        self.noline = np.repeat(np.repeat(small.noline, n, axis=0), n, axis=1)[: self.h, : self.w].copy()

    def chunky(self, min_cover=2):
        """Redraw the canvas in PIXEL x PIXEL blocks (no-op when PIXEL is 1)."""
        if PIXEL > 1:
            self.take_upscaled(self.downsample(PIXEL, min_cover), PIXEL)

    def outline(self, f=0.42, lit_f=0.62, color=None):
        """1 px outline outside the silhouette, coloured from the pixel it wraps.

        Lit side (the outline pixel lies up/left of its sprite pixel) is lighter
        than the shadow side, like hand-placed selective outlines. With PIXEL > 1
        the canvas is first turned into blocks and the outline is one block wide.
        """
        if PIXEL > 1:
            small = self.downsample(PIXEL)
            small._outline1(f, lit_f, color)
            self.take_upscaled(small, PIXEL)
            return
        self._outline1(f, lit_f, color)

    def _outline1(self, f, lit_f, color):
        a = self.a
        h, w = a.shape
        new_rgb = self.rgb.copy()
        new_a = a.copy()
        for y in range(h):
            for x in range(w):
                if a[y, x]:
                    continue
                src = None
                lit = False
                for dx, dy, l in ((0, 1, True), (1, 0, True), (0, -1, False), (-1, 0, False)):
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < w and 0 <= yy < h and a[yy, xx] and not self.noline[yy, xx]:
                        src = tuple(int(v) for v in self.rgb[yy, xx])
                        lit = l
                        if not l:
                            break
                if src is None:
                    continue
                if color is not None:
                    c = color
                else:
                    c = darker(src, lit_f if lit else f)
                    # outlines never lighter than a deep tone
                    c = tuple(min(v, m) for v, m in zip(c, (92, 78, 74)))
                new_rgb[y, x] = c
                new_a[y, x] = True
        self.rgb, self.a = new_rgb, new_a

    def clean_orphans(self):
        """Drop lonely single pixels that read as noise."""
        a = self.a
        h, w = a.shape
        kill = []
        for y in range(h):
            for x in range(w):
                if not a[y, x]:
                    continue
                n = 0
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        if (dx or dy) and 0 <= x + dx < w and 0 <= y + dy < h and a[y + dy, x + dx]:
                            n += 1
                if n == 0:
                    kill.append((x, y))
        for x, y in kill:
            a[y, x] = False

    def bbox(self):
        ys, xs = np.nonzero(self.a)
        if len(xs) == 0:
            return (0, 0, 1, 1)
        return (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)

    def image(self):
        out = np.zeros((self.h, self.w, 4), np.uint8)
        out[..., :3] = self.rgb
        out[..., 3] = np.where(self.a, 255, 0)
        return Image.fromarray(out, "RGBA")


def shadow_ellipse(cv, cx, cy, rx, ry, color=(24, 32, 22), alpha=0.0):
    """Contact shadow (drawn into its own layer by the builder, see build.py)."""
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - rx - 1), int(cx + rx + 2)):
            dx = (x + 0.5 - cx) / rx
            dy = (y + 0.5 - cy) / ry
            if dx * dx + dy * dy <= 1:
                cv.put(x, y, color)
