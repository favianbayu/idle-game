"""Portrait Bimo 480x480, bust-up 3/4 menghadap kanan, gaya pixel art anime (acuan: lembar ekspresi Arya).
Tanpa anti-alias, palet terbatas, garis tepi gelap, cel shading.
Jalankan: python bimo_480.py [ekspresi]   ekspresi: biasa (default)"""
import math, os, sys
import numpy as np
from PIL import Image, ImageDraw

N = 480
HERE = os.path.dirname(os.path.abspath(__file__))
H = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
C = dict(
    skin_o=H("#5a2818"), skin_s2=H("#8c4c2e"), skin_s=H("#aa683e"), skin=H("#c88352"), skin_l=H("#d99a66"), skin_h=H("#e8b482"),
    hair_o=H("#0c0706"), hair_d=H("#1a110e"), hair=H("#291b16"), hair_m=H("#3d2920"), hair_h=H("#5c3f30"), hair_hh=H("#8a6248"),
    shirt_o=H("#5e5040"), shirt_s2=H("#b8a688"), shirt_s=H("#d8cab0"), shirt=H("#f0e8d8"), shirt_l=H("#faf6ec"),
    eye_o=H("#140a06"), iris_d=H("#3a1c0e"), iris=H("#6a3818"), iris_l=H("#9a5a2a"), iris_ll=H("#c88a48"), white=H("#fffdf6"),
    sclera=H("#f8f0e6"), brow=H("#1a0e0a"), mouth=H("#7a2e22"), mouth_d=H("#4a1a12"), blush=H("#d8705a"), blush_l=H("#e88a72"),
    pen=H("#2a3a6a"), pen_l=H("#4a6aa8"), badge=H("#e8b830"), badge_d=H("#9a6a18"), crumb=H("#f0c060"),
)
img = Image.new("RGBA", (N, N), (0, 0, 0, 0))
D = ImageDraw.Draw(img)
reg = np.zeros((N, N), np.int16)      # id region untuk garis tepi
REG_OUT = {}

def catmull(pts, n=8):
    P = [pts[-1]] + list(pts) + [pts[0], pts[1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n; t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    return out

def mask_of(draw_fn):
    m = Image.new("L", (N, N), 0); d = ImageDraw.Draw(m); draw_fn(d); return np.array(m) > 0

def poly_mask(pts, smooth=True):
    pts = catmull(pts) if smooth else pts
    return mask_of(lambda d: d.polygon(pts, fill=255))

def ell_mask(cx, cy, rx, ry, rot=0):
    yy, xx = np.mgrid[0:N, 0:N]
    a = math.radians(rot); x, y = xx + .5 - cx, yy + .5 - cy
    u, v = x * math.cos(a) + y * math.sin(a), -x * math.sin(a) + y * math.cos(a)
    return (u / rx) ** 2 + (v / ry) ** 2 <= 1

arr = np.zeros((N, N, 4), np.uint8)
def paint(m, col, rid=None, clip=None):
    if clip is not None: m = m & clip
    arr[m] = col + (255,)
    if rid is not None: reg[m] = rid
    return m

def outline(rid, col, w=3, against_lower=True):
    m = reg == rid
    # piksel tepi: punya tetangga (dalam jarak w) yang bukan region ini dan id-nya lebih kecil
    edge = np.zeros_like(m)
    for dy in range(-w, w + 1):
        for dx in range(-w, w + 1):
            if dx * dx + dy * dy > w * w: continue
            sh = np.roll(np.roll(reg, dy, 0), dx, 1)
            edge |= m & ((sh < rid) if against_lower else (sh != rid))
    arr[edge] = col + (255,)

def line(pts, col, w, smooth=False):
    if smooth: pts = catmull(pts)[:-7]
    im = Image.fromarray(arr, "RGBA"); d = ImageDraw.Draw(im)
    d.line(pts, fill=col + (255,), width=w, joint="curve")
    for p in (pts[0], pts[-1]):
        r = w / 2 - .5; d.ellipse((p[0] - r, p[1] - r, p[0] + r, p[1] + r), fill=col + (255,))
    arr[:] = np.array(im)

def bands(m, cx, cy, ang, cols, widths):
    """Cel shading: pita warna sejajar arah cahaya. ang = arah datangnya bayangan (derajat)."""
    yy, xx = np.mgrid[0:N, 0:N]
    a = math.radians(ang); t = (xx - cx) * math.cos(a) + (yy - cy) * math.sin(a)
    for col, w in zip(cols, widths):
        arr[m & (t > w)] = col + (255,)

# ============ BAJU (region 1)
shirt = poly_mask([(-20, 480), (10, 440), (40, 405), (110, 378), (180, 368), (230, 384), (282, 380), (350, 384), (410, 402), (455, 440), (500, 480)])
paint(shirt, C["shirt"], 1)
paint(shirt & poly_mask([(10, 480), (30, 430), (80, 395), (120, 420), (110, 480)]), C["shirt_s"])          # sisi kiri lebih gelap
paint(shirt & poly_mask([(110, 480), (126, 430), (140, 470)]), C["shirt_s2"])                               # lipatan
paint(shirt & poly_mask([(330, 480), (352, 432), (372, 440), (360, 480)]), C["shirt_s"])
paint(shirt & poly_mask([(400, 410), (440, 432), (470, 480), (430, 480), (420, 440)]), C["shirt_s"])
# ============ LEHER (region 2)
neck = poly_mask([(190, 320), (290, 330), (296, 400), (240, 418), (186, 396)])
paint(neck, C["skin_s"], 2)
paint(neck & poly_mask([(240, 330), (296, 336), (296, 400), (250, 408)]), C["skin"])
# ============ KERAH (region 3)
col_l = [(176, 352), (232, 396), (214, 448), (150, 410), (120, 392)]
col_r = [(298, 352), (252, 398), (284, 446), (348, 406), (372, 392)]
paint(poly_mask(col_l), C["shirt_l"], 3); paint(poly_mask(col_l) & poly_mask([(120, 392), (176, 352), (196, 372), (150, 410)]), C["shirt_s"])
paint(poly_mask(col_r), C["shirt_l"], 3); paint(poly_mask(col_r) & poly_mask([(252, 398), (284, 446), (300, 430), (270, 392)]), C["shirt_s"])
# ============ TELINGA (region 4)
ear = ell_mask(150, 248, 22, 30, -8)
paint(ear, C["skin_s"], 4); paint(ell_mask(154, 248, 11, 18, -8), C["skin_s2"]); paint(ell_mask(158, 244, 6, 11, -8), C["skin_s"])
# ============ WAJAH (region 5): pipi tembam, 3/4 menghadap kanan
face = poly_mask([(158, 168), (210, 128), (282, 126), (330, 150), (348, 192), (354, 226), (362, 254), (366, 286), (356, 318),
                  (330, 346), (290, 364), (242, 364), (200, 346), (170, 312), (156, 268), (152, 216)])
paint(face, C["skin"], 5)
bands(face, 300, 250, 180, [C["skin_s"]], [118])           # sisi jauh (dekat telinga) lebih gelap
paint(face & poly_mask([(170, 300), (210, 336), (260, 352), (230, 360), (180, 330)]), C["skin_s"])   # bayangan bawah rahang
paint(face & ell_mask(306, 262, 34, 24, -15), C["skin_l"])  # pipi kanan terang
paint(face & ell_mask(312, 254, 14, 8, -15), C["skin_h"])
paint(face & ell_mask(270, 168, 40, 12, -5), C["skin_l"])   # dahi terang

# ============ RAMBUT KERITING (region 6): massa rambut + helai ikal berbentuk lengkung
import random
rng = random.Random(7)
blobs = [(148, 196, 24), (138, 176, 34), (150, 134, 36), (180, 100, 38), (222, 80, 40), (268, 74, 42), (312, 84, 40),
         (348, 108, 36), (370, 146, 32), (378, 184, 26), (370, 212, 18), (132, 190, 24),
         (200, 130, 40), (250, 118, 44), (300, 124, 40), (336, 150, 34), (180, 166, 34), (356, 186, 24), (166, 190, 22),
         (204, 176, 22), (236, 166, 24), (270, 164, 24), (304, 168, 22), (330, 180, 20), (346, 202, 16)]
hair = np.zeros((N, N), bool)
for (x, y, r) in blobs:
    hair |= ell_mask(x, y, r, r * .9)
# tepi bergerigi: tonjolan ikal kecil di sepanjang tepi
yy, xx = np.mgrid[0:N, 0:N]
for (x, y, r) in blobs:
    for k in range(7):
        t = rng.uniform(0, 2 * math.pi)
        hair |= ell_mask(x + (r + 2) * math.cos(t), y + (r * .9 + 2) * math.sin(t), 9, 8)
hair &= ~(face & poly_mask([(150, 330), (160, 236), (190, 220), (240, 214), (290, 212), (330, 220), (352, 240), (370, 340)]))
paint(hair, C["hair_d"], 6)
# helai ikal: lengkung tebal + kilau tipis, digambar dari belakang (atas) ke depan (bawah)
locks = []
for gy in range(64, 240, 21):
    for gx in range(116, 400, 24):
        x, y = gx + rng.uniform(-6, 6) + (12 if (gy // 21) % 2 else 0), gy + rng.uniform(-5, 5)
        if 0 <= int(x) < N and 0 <= int(y) < N and hair[int(y), int(x)]:
            locks.append((x, y))
locks.sort(key=lambda p: p[1])
def arc(cx, cy, r, a0, a1, step=12):
    return [(cx + r * math.cos(math.radians(t)), cy + r * .85 * math.sin(math.radians(t))) for t in range(int(a0), int(a1) + 1, step)]
for (x, y) in locks:
    r = rng.uniform(14, 19); a0 = rng.uniform(150, 220)
    line(arc(x, y, r, a0, a0 + 260), C["hair"], 13)
    line(arc(x, y, r - 1, a0 + 10, a0 + 130), C["hair_m"], 7)
    line(arc(x, y, r - 1, a0 + 35, a0 + 95), C["hair_h"], 4)
    line(arc(x, y, r - 2, a0 + 50, a0 + 75), C["hair_hh"], 2)
    line(arc(x, y, r + 6.5, a0 + 150, a0 + 260), C["hair_o"], 3)
arr[~hair & (reg == 6)] = 0
# kembalikan piksel di luar massa rambut yang tertimpa garis
over = ~hair & (np.array(Image.fromarray(arr, "RGBA"))[:, :, 3] > 0) & (reg == 0)
outline(6, C["hair_o"], 4)
# bayangan rambut jatuh di dahi
fs = face & ~(reg == 6) & poly_mask([(160, 190), (200, 186), (236, 182), (272, 184), (310, 186), (344, 208), (348, 232), (318, 222), (290, 216), (262, 222), (232, 216), (200, 226), (164, 240)])
arr[fs] = C["skin_s"] + (255,)

# ---- garis tepi kulit, telinga, baju, kerah
outline(5, C["skin_o"], 3); outline(4, C["skin_o"], 3); outline(2, C["skin_o"], 3)
outline(1, C["shirt_o"], 3); outline(3, C["shirt_o"], 3)

EXP = sys.argv[1] if len(sys.argv) > 1 else "biasa"

# ============ ALIS
def brow(pts, w=9):
    line(pts, C["brow"], w, smooth=False)
brow([(208, 226), (222, 218), (240, 215), (258, 218)], 9)
brow([(296, 216), (310, 212), (326, 214), (336, 220)], 8)

# ============ MATA anime
def eye(cx, cy, w, h, look=(4, 0)):
    sc = ell_mask(cx, cy, w, h)
    paint(sc, C["sclera"])
    ix, iy = cx + look[0], cy + look[1] + 2
    ir = ell_mask(ix, iy, w * .62, h * .98) & sc
    paint(ir, C["iris_d"])
    paint(ir & ell_mask(ix, iy + h * .25, w * .52, h * .7), C["iris"])
    paint(ir & ell_mask(ix + 2, iy + h * .55, w * .4, h * .35), C["iris_l"])
    paint(ir & ell_mask(ix + 2, iy + h * .72, w * .24, h * .16), C["iris_ll"])
    paint(ell_mask(ix, iy - 1, w * .26, h * .38) & sc, C["eye_o"])          # pupil
    paint(ell_mask(ix - w * .26, iy - h * .38, w * .17, h * .2), C["white"])  # kilau besar
    paint(ell_mask(ix + w * .24, iy + h * .3, w * .08, h * .09), C["white"])  # kilau kecil
    # kelopak atas tebal + ekor bulu mata
    up = [(cx - w * 1.08, cy + h * .1), (cx - w * .6, cy - h * .78), (cx, cy - h * 1.02), (cx + w * .65, cy - h * .82), (cx + w * 1.1, cy - h * .2)]
    line(catmull(up + [(cx, cy - h)])[:33], C["eye_o"], 9)
    line([(cx + w * 1.0, cy - h * .3), (cx + w * 1.4, cy - h * .6)], C["eye_o"], 6)
    line([(cx - w * 1.0, cy - h * .1), (cx - w * 1.25, cy - h * .05)], C["eye_o"], 4)
    # kelopak bawah tipis
    line([(cx - w * .7, cy + h * .86), (cx, cy + h * 1.0), (cx + w * .72, cy + h * .82)], C["skin_s2"], 3)
    line([(cx + w * .7, cy + h * .78), (cx + w * .95, cy + h * .45)], C["eye_o"], 3)
eye(232, 254, 25, 24, (5, 0))
eye(320, 250, 17, 23, (3, 0))      # mata jauh lebih sempit (perspektif)

# ============ HIDUNG
line([(330, 286), (338, 288), (343, 284)], C["skin_s2"], 4)
paint(ell_mask(340, 272, 3, 5), C["skin_h"])
# ============ MULUT: senyum lebar tertutup, pipi naik
line([(268, 318), (284, 325), (302, 325), (318, 318)], C["mouth_d"], 5)
line([(318, 318), (325, 311)], C["mouth_d"], 4)
line([(286, 333), (302, 332)], C["skin_s"], 3)       # bibir bawah
# ============ PERONA: elips + garis miring khas anime
for (cx, cy, rx, ry) in [(212, 292, 30, 13), (324, 290, 22, 11)]:
    paint(ell_mask(cx, cy, rx, ry) & face, C["blush"])
    paint(ell_mask(cx - 4, cy - 3, rx * .6, ry * .5) & face, C["blush_l"])
    for k in range(-2, 3):
        line([(cx + k * 10 - 3, cy + 6), (cx + k * 10 + 4, cy - 6)], C["skin_s2"], 2)
# dagu ganda halus
line([(250, 352), (272, 357), (296, 355), (314, 348)], C["skin_s"], 3)
# remah kerupuk khas Bimo
for (x, y, r) in [(334, 322, 3), (340, 328, 2), (322, 340, 2)]:
    paint(ell_mask(x, y, r, r), C["crumb"])
# ============ SAKU, PULPEN, BADGE
line([(300, 440), (300, 480)], C["shirt_s2"], 3); line([(300, 440), (372, 440)], C["shirt_s2"], 3); line([(372, 440), (376, 480)], C["shirt_s2"], 3)
paint(poly_mask([(318, 418), (326, 418), (326, 452), (318, 452)], False), C["pen"]); paint(poly_mask([(320, 418), (322, 418), (322, 448), (320, 448)], False), C["pen_l"])
paint(ell_mask(350, 424, 8, 9), C["badge"]); paint(ell_mask(350, 426, 3, 4), C["badge_d"])
# kancing & garis placket
line([(242, 418), (246, 480)], C["shirt_s2"], 3)
for y in (440, 470): paint(ell_mask(250, y, 4, 4), C["shirt_s2"])

out = Image.fromarray(arr, "RGBA")
out.save(os.path.join(HERE, f"bimo_480_{EXP}.png"))
bg = Image.new("RGBA", (N, N), (255, 255, 255, 255)); bg.alpha_composite(out); bg.convert("RGB").save(os.path.join(HERE, f"bimo_480_{EXP}_putih.png"))
print("ok")
