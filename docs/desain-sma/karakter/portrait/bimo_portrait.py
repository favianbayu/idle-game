"""Portrait Bimo, pixel art 120x120 bust-up. Digambar prosedural piksel per piksel.
Jalankan: python bimo_portrait.py  -> bimo_120.png (asli) + bimo_120_x4.png (pratinjau diperbesar)
Palet diambil dari sprite voxel Bimo (kulit #c98e66, rambut keriting hitam, seragam putih)."""
import math, os
import numpy as np
from PIL import Image

N = 120
HERE = os.path.dirname(os.path.abspath(__file__))
hexc = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))

PAL = {
    "bg": [hexc("#5f9e78"), hexc("#6fb088"), hexc("#82c29a"), hexc("#97d3ac")],
    "skin": [hexc("#7a4630"), hexc("#a8684a"), hexc("#c98e66"), hexc("#dca880"), hexc("#ecc39c")],
    "hair": [hexc("#0a0708"), hexc("#151012"), hexc("#221a1a"), hexc("#3a2e2c")],
    "shirt": [hexc("#8a8e9a"), hexc("#b8bcc6"), hexc("#dfe2e8"), hexc("#f6f6f2")],
    "out_skin": hexc("#4a2618"), "out_hair": hexc("#060404"), "out_shirt": hexc("#4a4e5a"),
    "mouth": hexc("#5a1a1a"), "tongue": hexc("#d4646a"), "teeth": hexc("#fbf6ee"),
    "blush": hexc("#e2786a"), "eye": hexc("#1a1010"), "crumb": hexc("#f0c060"), "crumb2": hexc("#c08a30"),
    "badge": hexc("#e8c040"), "badge2": hexc("#9a6a1a"), "brow": hexc("#160e0c"), "sweat": hexc("#bfe6ff"),
}
L = np.array([-0.55, -0.65, 0.52]); L = L / np.linalg.norm(L)

img = np.zeros((N, N, 3), np.uint8)
layer = np.zeros((N, N), np.int16)   # id lapisan untuk garis tepi
kind = np.full((N, N), "", object)
yy, xx = np.mgrid[0:N, 0:N]

def tone(ramp, s):
    i = int(np.clip(round(s * (len(ramp) - 1)), 0, len(ramp) - 1)); return ramp[i]

def ellipse(cx, cy, rx, ry, ramp, lid, k, amb=0.35, bias=0.0, mask=None):
    dx, dy = (xx + 0.5 - cx) / rx, (yy + 0.5 - cy) / ry
    m = dx * dx + dy * dy <= 1
    if mask is not None: m &= mask
    for y, x in zip(*np.nonzero(m)):
        nx, ny = dx[y, x], dy[y, x]; nz = math.sqrt(max(0, 1 - nx * nx - ny * ny))
        s = amb + (1 - amb) * max(0, nx * L[0] + ny * L[1] + nz * L[2]) + bias
        img[y, x] = tone(ramp, min(1, s)); layer[y, x] = lid; kind[y, x] = k
    return m

def px(x, y, c):
    if 0 <= x < N and 0 <= y < N: img[y, x] = c

# ---- latar
for y in range(N):
    for x in range(N):
        d = math.hypot(x - 60, y - 54) / 70
        img[y, x] = tone(PAL["bg"], 1 - d * 0.9 + (0.06 if (x // 6 + y // 6) % 2 else 0))
# ---- badan & seragam
ellipse(60, 132, 58, 40, PAL["shirt"], 1, "shirt", amb=0.45)
# leher
ellipse(60, 92, 13, 12, PAL["skin"], 2, "skin", amb=0.2, bias=-0.15)
# kerah: dua segitiga putih di kiri-kanan leher
for y in range(90, 108):
    t = (y - 90) / 18
    for x in range(int(60 - 22 + t * 8), int(60 - 6 + t * 4)):
        if x < 60 - 4: img[y, x] = PAL["shirt"][3 if x < 46 else 2]; layer[y, x] = 3; kind[y, x] = "shirt"
    for x in range(int(60 + 6 - t * 4), int(60 + 22 - t * 8)):
        if x > 60 + 3: img[y, x] = PAL["shirt"][2 if x > 74 else 3]; layer[y, x] = 3; kind[y, x] = "shirt"
# celah kerah (leher dalam / kaus dalam)
for y in range(96, 112):
    w = max(0, 5 - (y - 96) // 3)
    for x in range(60 - w, 60 + w + 1):
        img[y, x] = PAL["shirt"][1]; layer[y, x] = 3; kind[y, x] = "shirt"
# kancing
for y in (110, 117):
    px(60, y, PAL["shirt"][0]); px(61, y, PAL["shirt"][1])
# saku & badge OSIS
for y in range(106, 118):
    px(34, y, PAL["shirt"][1]); px(48, y, PAL["shirt"][1])
for x in range(34, 49): px(x, 106, PAL["shirt"][1])
for (x, y) in [(39, 101), (40, 100), (41, 100), (42, 100), (43, 101), (39, 102), (43, 102), (40, 103), (41, 104), (42, 103)]:
    px(x, y, PAL["badge"])
px(41, 102, PAL["badge2"]); px(41, 101, PAL["badge2"])
# lipatan seragam karena bahu bulat
for x in range(22, 34): px(x, 112 + (x - 22) // 4, PAL["shirt"][1])
for x in range(87, 99): px(x, 115 - (x - 87) // 4, PAL["shirt"][1])

# ---- telinga
ellipse(29, 64, 6, 8, PAL["skin"], 4, "skin", amb=0.3)
ellipse(91, 64, 6, 8, PAL["skin"], 4, "skin", amb=0.3)
# ---- kepala: bulat + pipi tembam
headA = ellipse(60, 56, 30, 30, PAL["skin"], 5, "skin", amb=0.42)
ellipse(60, 68, 32, 20, PAL["skin"], 5, "skin", amb=0.42)
# dagu ganda halus
for x in range(48, 73): px(x, 86 + (1 if abs(x - 60) > 8 else 0), PAL["skin"][1])

# ---- rambut keriting: gumpalan lingkaran
curls = []
for a in np.linspace(math.radians(195), math.radians(345), 13):
    curls.append((60 + 30 * math.cos(a), 56 + 29 * math.sin(a), 8.5))
for a in np.linspace(math.radians(215), math.radians(325), 8):
    curls.append((60 + 18 * math.cos(a), 54 + 22 * math.sin(a), 8))
curls += [(60, 26, 9), (50, 30, 8), (70, 30, 8), (44, 38, 7), (76, 38, 7), (34, 46, 7), (86, 46, 7), (31, 55, 5.5), (89, 55, 5.5)]
def curl(cx, cy, r, rr=0.92):
    ellipse(cx, cy, r, r * rr, PAL["hair"], 6, "hair", amb=0.1)
    # lengkung gelap di sisi kanan-bawah tiap ikal supaya terbaca keriting
    for a in np.linspace(math.radians(-10), math.radians(120), 14):
        x, y = int(cx + (r - 1.2) * math.cos(a)), int(cy + (r * rr - 1.2) * math.sin(a))
        px(x, y, PAL["hair"][0])
    # kilau kecil kiri-atas
    px(int(cx - r * 0.35), int(cy - r * 0.45), PAL["hair"][3]); px(int(cx - r * 0.35) + 1, int(cy - r * 0.45), PAL["hair"][2])
for (cx, cy, r) in sorted(curls, key=lambda c: c[1]):
    curl(cx, cy, r)
# poni keriting jatuh di dahi
# bayangan rambut di dahi
for x in range(38, 84):
    for y in range(43, 47):
        if layer[y, x] == 5: img[y, x] = PAL["skin"][1] if y < 45 else PAL["skin"][2]
for (cx, cy, r) in [(46, 39, 5), (54, 37, 5), (62, 38, 5), (70, 39, 5), (77, 41, 4.5), (40, 42, 4.5)]:
    curl(cx, cy, r, 0.85)

# ---- garis tepi (outline) per lapisan
out = img.copy()
for y in range(N):
    for x in range(N):
        lid = layer[y, x]
        if lid == 0: continue
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            X, Y = x + dx, y + dy
            if not (0 <= X < N and 0 <= Y < N): continue
            if layer[Y, X] < lid and not (kind[y, x] == "shirt" and kind[Y, X] == "shirt"):
                out[y, x] = PAL["out_" + kind[y, x]]; break
img = out

# ---- wajah
# alis tebal, sedikit naik (ekspresi ceria)
for i in range(10):
    for t in range(3 if 2 < i < 8 else 2):
        px(40 + i, 54 - (1 if 3 < i < 7 else 0) + t, PAL["brow"])
        px(70 + i, 54 - (1 if 3 < i < 7 else 0) + t, PAL["brow"])
# mata sipit tertawa: lengkung ^
def happy_eye(cx):
    pts = [(-5, 2), (-4, 1), (-3, 0), (-2, -1), (-1, -1), (0, -1), (1, -1), (2, 0), (3, 1), (4, 2)]
    for dx, dy in pts:
        px(cx + dx, 60 + dy, PAL["eye"]); px(cx + dx, 61 + dy, PAL["eye"])
    px(cx - 1, 63, PAL["skin"][1]); px(cx, 63, PAL["skin"][1]); px(cx + 1, 63, PAL["skin"][1])  # lipatan kantung mata
happy_eye(45); happy_eye(75)
# hidung bulat kecil
for (x, y, c) in [(59, 69, 1), (60, 70, 1), (61, 70, 1), (62, 69, 1), (60, 68, 4), (61, 68, 4)]:
    px(x, y, PAL["skin"][c])
# pipi merona
for (cx, cy) in [(41, 72), (79, 72)]:
    for dy in range(-2, 3):
        for dx in range(-5, 6):
            if (dx / 5.5) ** 2 + (dy / 2.6) ** 2 <= 1 and (dx + dy) % 2 == 0:
                px(cx + dx, cy + dy, PAL["blush"])
# mulut nyengir lebar
for y in range(74, 84):
    for x in range(48, 73):
        dx, dy = (x + 0.5 - 60) / 12, (y + 0.5 - 75) / 8
        if dx * dx + dy * dy <= 1 and y >= 75:
            img[y, x] = PAL["mouth"]
            if y <= 77 and abs(x - 60) < 10: img[y, x] = PAL["teeth"]
            if y >= 80 and abs(x - 60) < 6: img[y, x] = PAL["tongue"]
for x in range(48, 73):  # bibir atas gelap
    dx = (x + 0.5 - 60) / 12
    if abs(dx) <= 1: px(x, 74, PAL["out_skin"])
px(47, 73, PAL["out_skin"]); px(73, 73, PAL["out_skin"])   # sudut senyum naik
px(60, 75, PAL["teeth"][::-1] if False else (220, 210, 200))  # celah gigi depan
# remah kerupuk di sudut mulut
for (x, y, c) in [(74, 78, "crumb"), (75, 79, "crumb"), (75, 78, "crumb2"), (72, 82, "crumb"), (78, 88, "crumb"), (79, 88, "crumb2")]:
    px(x, y, PAL[c])
Image.fromarray(img).save(os.path.join(HERE, "bimo_120.png"))
Image.fromarray(img).resize((480, 480), Image.NEAREST).save(os.path.join(HERE, "bimo_120_x4.png"))
print("ok")
