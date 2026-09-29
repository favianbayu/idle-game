"""City-specific passers-by (side view, facing right; the game flips them for leftward).

Humans are regular NPCs from the face kit with extra elements, same as passersby.py.

- jakarta : ondel-ondel ngamen (+ pengamen), bajaj ngebul
- bandung : delman (kuda + kusir), pengamen angklung
- bali    : iring-iringan gebogan (dua ibu), monyet bawa kacamata curian
- surabaya: becak + penumpang, sepeda kerupuk
- semua   : tukang bakso ting-ting (juga malam hari)
"""

from PIL import Image

from . import face
from .character import BODY_DASTER, BODY_KAOS, compose, full_palette
from .core import ASSETS, contact_sheet, render, save_set
from .draw import Canvas
from .npc_anim import customer_frames
from .props import angklung, bajaj, ondel_ondel
from .props import OUTLINE as O

OUT = ASSETS / "lewat"


def _fin(cv, pal, skip=(".",)):
    cv.outline("O", skip=skip)
    return render(cv.g, {**pal, "O": O})


HAT_DEFAULT = {"c": "#c9432a", "C": "#8a1f12", "B": "#e8664a", "T": "#2b2530", "k": "#f3e9d8", "K": "#b0923e",
               "J": "#f2c94c", "W": "#fbf6ec", "r": "#d8322a"}


def _npc(look, outfit, body=BODY_KAOS, hat=None, extras=()):
    lk = face.look(**look)
    pal = full_palette(lk, {"p": "#3e3a4a", "P": "#2c2836", "f": "#2a2430", "F": "#16121a", **HAT_DEFAULT,
                            **outfit})
    hat = None if lk["hair"] == "kerudung" else hat

    def build(e):
        return compose(lk, body, hat=hat, extras=extras, expression=e)
    return build, pal


def _walk(look, outfit, **kw):
    build, pal = _npc(look, outfit, **kw)
    return [im for _, im in customer_frames(build, pal, 34 if kw.get("body") is BODY_DASTER else 27)[:4]]


def _seated(look, outfit, **kw):
    """Upper body (rows 0-31) for riders / passengers."""
    build, pal = _npc(look, outfit, **kw)
    return render(build(None), pal).crop((0, 0, 32, 32))


def _prop(fn, *a, **kw):
    cv, pal = fn(*a, **kw)
    return render(cv.g, pal)


def _stack(size, *layers):
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    for im, (x, y) in layers:
        img.alpha_composite(im, (x, y))
    return img


# ------------------------------------------------------------------ Jakarta
PENGAMEN = dict(hair="cepak", skin="sawo_matang", mouth="ketawa", brows="tebal")
PENGAMEN_OUTFIT = {"g": "#2b2530", "G": "#1e1420", "L": "#4a4250", "q": "#d8322a"}


def _kecrek(dx):
    cv = Canvas(8, 8)
    cv.rect(2 + dx, 1, 4, 4, "y")
    cv.px(3 + dx, 2, "Y"), cv.px(4 + dx, 3, "Y")
    cv.vline(4, 5, 3, "w")
    return _fin(cv, {"y": "#e2c678", "Y": "#fff2a8", "w": "#6b4a32"})


def ondel_ngamen():
    """Ondel-ondel berjalan diiringi pengamen dengan kecrek. 4 frame."""
    doll = _prop(ondel_ondel, False)
    kid = _walk(PENGAMEN, PENGAMEN_OUTFIT)
    out = []
    for i in range(4):
        bob = (0, -1, 0, -1)[i]
        feet = Canvas(26, 4)                                      # kaki pembawa di bawah kain
        for x in ((8, 16), (9, 15), (8, 16), (7, 17))[i]:
            feet.rect(x - 1, 0, 3, 3, "f")
        feet.outline("O")
        img = _stack((64, 62), (kid[i], (0, 22)), (_kecrek(i % 2), (21, 36)),
                     (render(feet.g, {"f": "#3a2a30", "O": O}), (36, 57)), (doll, (36, bob)))
        out.append(img)
    return out


def bajaj_ngebul():
    """Bajaj dengan sopir + kepulan asap knalpot. 2 frame."""
    body = _prop(bajaj)
    sopir = _seated(dict(hair="pendek", skin="kuning_langsat", mouth="nyengir", facial_hair="kumis_tipis"),
                    {"g": "#3f8ac6", "G": "#1f4a7a", "L": "#7fb0cc", "q": "#3f8ac6"}, hat="topi_pet")
    out = []
    for i in range(2):
        smoke = Canvas(14, 12)
        for cx, cy, r in (((4, 7, 3), (10, 4, 2)) if i == 0 else ((3, 6, 2), (8, 5, 3))):
            smoke.disc(cx, cy, r, "a")
        smoke.outline("A")
        head = sopir.crop((4, 2, 28, 30))
        img = _stack((60, 40), (render(smoke.g, {"a": "#e8e4dc", "A": "#9a948c"}), (0, 22 - i)),
                     (body, (12, 6 + i)), (head.resize((15, 17), Image.NEAREST), (21, 11 + i)))
        out.append(img)
    return out


# ------------------------------------------------------------------ Bandung
DELMAN = {"h": "#9a5e36", "H": "#6b3a22", "n": "#2b2530", "k": "#1e1420", "r": "#d8322a", "y": "#f2c94c",
          "c": "#3f8a4a", "C": "#285e32", "t": "#6b4a32", "T": "#4a3222", "w": "#b07a4a", "s": "#fbf6ec",
          "m": "#9aa3a8"}


def _kuda(cv, f, ox, oy):
    lift = [(0, 2, 2, 0), (2, 0, 0, 2)][f % 2]
    for x, l in zip((1, 5, 15, 19), lift):                               # kaki
        cv.rect(ox + x, oy + 12, 2, 12 - l, "H" if x in (5, 19) else "h")
        cv.rect(ox + x, oy + 23 - l, 2, 1, "k")
    cv.ellipse(ox + 10, oy + 9, 11, 6, "h")
    cv.hline(ox + 2, oy + 13, 16, "H")
    cv.poly([(ox + 16, oy + 8), (ox + 22, oy - 4), (ox + 26, oy - 2), (ox + 21, oy + 10)], "h")
    cv.ellipse(ox + 26, oy - 3, 4, 3, "h")
    cv.poly([(ox + 27, oy - 5), (ox + 32, oy - 1), (ox + 30, oy + 1), (ox + 26, oy)], "h")    # moncong
    cv.px(ox + 31, oy - 1, "k")
    cv.px(ox + 26, oy - 4, "k")
    cv.rect(ox + 23, oy - 8, 2, 3, "h")                                  # telinga
    for j in range(8):                                                    # surai
        cv.px(ox + 21 - j // 2 + 1, oy - 5 + j * 1, "n")
        cv.px(ox + 20 - j // 2 + 1, oy - 5 + j * 1, "n")
    cv.disc(ox + 24, oy - 11, 2, "r"), cv.px(ox + 24, oy - 14, "y")      # jambul hias
    cv.line(ox, oy + 5, ox - 3, oy + 14 + f % 2, "n"), cv.line(ox + 1, oy + 5, ox - 2, oy + 15, "n")
    cv.hline(ox + 6, oy + 7, 10, "y")                                     # tali kekang
    cv.line(ox + 16, oy + 7, ox + 27, oy - 3, "y")


def delman():
    """Delman: kuda berjalan, kusir, roda besar. 2 frame."""
    kusir = _seated(dict(hair="pendek", skin="sawo_matang", mouth="senyum", facial_hair="kumis_baplang"),
                    {"g": "#2b2530", "G": "#1e1420", "L": "#4a4250", "q": "#2b2530", "c": "#6b3a22",
                     "C": "#c9a060"}, hat="iket")
    out = []
    for f in range(2):
        cv = Canvas(84, 56)
        cv.box(4, 24, 36, 12, "c", light="C")
        cv.hline(5, 27, 34, "y")
        cv.poly([(2, 6), (28, 6), (30, 10), (0, 10)], "C")                # atap
        cv.hline(2, 7, 26, "c")
        for x in (4, 26):
            cv.vline(x, 10, 14, "T")
        cv.line(38, 32, 58, 28, "w")                                      # sais
        cv.ring(20, 44, 10, "t", thick=2)
        cv.disc(20, 44, 1, "m")
        for dx, dy in (((0, -8), (0, 8), (-8, 0), (8, 0)) if f == 0 else ((6, -6), (-6, 6), (-6, -6), (6, 6))):
            cv.line(20, 44, 20 + dx, 44 + dy, "T")
        body = _fin(cv, DELMAN)
        horse = Canvas(84, 56)
        _kuda(horse, f, 50, 30)
        img = _stack((84, 56), (body, (0, 0)), (kusir, (22, -2)), (_fin(horse, DELMAN), (0, 0)))
        cover = Canvas(84, 56)                                            # pagar depan menutupi pinggang kusir
        cover.box(26, 26, 16, 4, "c", light="C")
        img.alpha_composite(_fin(cover, DELMAN))
        out.append(img)
    return out


def angklung_ngamen():
    frames = _walk(dict(hair="pendek", skin="kuning_langsat", mouth="ketawa", eyes="berbinar"),
                   {"g": "#2b2530", "G": "#1e1420", "L": "#4a4250", "q": "#2b2530", "c": "#6b3a22",
                    "C": "#c9a060"}, hat="iket")
    ak = _prop(angklung)
    return [_stack((40, 40), (fr, (0, 0)), (ak, (18 + (i % 2), 14 - (i % 2)))) for i, fr in enumerate(frames)]


# --------------------------------------------------------------------- Bali
GEBOGAN = {"s": "#d8dde0", "S": "#8a9298", "r": "#d8322a", "o": "#f0902a", "y": "#f2c94c", "g": "#5fae4a",
           "G": "#2f7a3a", "p": "#ff8fdc", "w": "#fbf6ec"}


def _gebogan():
    cv = Canvas(18, 24)
    cv.rect(4, 20, 10, 2, "s"), cv.rect(6, 22, 6, 2, "S")               # dulang
    for j, (w, keys) in enumerate(((12, "rogyr"), (10, "gyor"), (8, "royg"), (6, "yr"), (4, "g"))):
        y = 17 - j * 3
        for i in range(w // 2):
            cv.disc(9 - w // 2 + 1 + i * 2, y, 1, keys[i % len(keys)])
    cv.vline(9, 1, 4, "G"), cv.px(8, 2, "g"), cv.px(10, 3, "g")
    cv.px(9, 0, "p")
    return _fin(cv, GEBOGAN)


def gebogan_iring():
    """Dua ibu berkebaya menjunjung gebogan. 4 frame."""
    looks = [(dict(hair="cepol", skin="sawo_matang", mouth="senyum", eyes="ramah" if "ramah" in face.EYES else "bulat"),
              {"g": "#fbf6ec", "G": "#cfc6b6", "L": "#ffffff", "k": "#f2c94c"}),
             (dict(hair="cepol", skin="cokelat", mouth="senyum"),
              {"g": "#f2e08a", "G": "#c7a34b", "L": "#fff4c2", "k": "#d8322a"})]
    walks = [_walk(lk, o, body=BODY_DASTER) for lk, o in looks]
    geb = _gebogan()
    out = []
    for i in range(4):
        layers = []
        for n, w in enumerate(walks):
            j = (i + n) % 4
            bob = 1 if j % 2 else 0
            layers += [(w[j], (n * 26, 20)), (geb, (n * 26 + 7, 1 + bob))]
        out.append(_stack((58, 60), *layers))
    return out


MONYET = {"b": "#8a7a62", "B": "#5e5242", "f": "#e0b89a", "e": "#1e1420", "k": "#2b2530", "K": "#5ab0e0"}


def monyet(frame):
    cv = Canvas(24, 20)
    legs = [(5, 9, 14, 17), (6, 8, 15, 16), (7, 7, 16, 15), (6, 8, 15, 16)][frame % 4]
    for i, x in enumerate(legs):
        cv.vline(x, 12, 6 if i % 2 == 0 else 5, "b" if i < 2 else "B")
    cv.ellipse(11, 11, 7, 4, "b")
    cv.hline(6, 14, 11, "B")
    for i, (x, y) in enumerate(((4, 10), (3, 9), (2, 7), (2, 5), (3, 3), (4, 2))):      # ekor melengkung
        cv.px(x, y - (frame % 2) * (i // 3), "b")
    cv.disc(19, 8, 4, "b")
    cv.ellipse(20, 9, 2, 2, "f")
    cv.px(20, 7, "e"), cv.px(22, 7, "e")
    cv.px(22, 10, "B")
    cv.hline(18, 7, 6, "k")                                                # kacamata curian!
    cv.rect(19, 6, 2, 2, "K"), cv.rect(22, 6, 2, 2, "K")
    return _fin(cv, MONYET)


# ----------------------------------------------------------------- Surabaya
BECAK = {"r": "#c9432a", "R": "#8a1f12", "b": "#f2c94c", "B": "#b0923e", "M": "#6d777d", "k": "#2b2530",
         "t": "#2b2530"}


def _becak_terbuka():
    """Becak (kap dilipat) supaya penumpangnya kelihatan."""
    cv = Canvas(48, 38)
    cv.poly([(3, 10), (8, 9), (8, 24), (3, 24)], "r")                         # sandaran
    cv.rect(5, 18, 18, 6, "b")
    cv.hline(5, 18, 18, "B")
    cv.line(22, 24, 38, 18, "M"), cv.line(22, 25, 38, 19, "M")
    cv.vline(38, 12, 14, "M")
    cv.rect(35, 11, 6, 2, "k")
    cv.line(38, 26, 42, 30, "M")
    for cx, r in ((8, 6), (20, 6), (41, 6)):
        cv.ring(cx, 30, r, "t", thick=2)
        cv.disc(cx, 30, 1, "M")
    cv.hline(3, 24, 21, "R")
    return _fin(cv, BECAK)


def _becak_depan():
    cv = Canvas(48, 38)                                                        # dinding depan kursi
    cv.poly([(2, 20), (24, 20), (22, 25), (4, 25)], "r")
    cv.hline(4, 22, 18, "b")
    return _fin(cv, BECAK)


def becak_lewat():
    """Tukang becak mengayuh + penumpang ibu-ibu. 2 frame."""
    tukang = _seated(dict(hair="cepak", skin="cokelat", mouth="ketawa", brows="tebal"),
                     {"g": "#fbf6ec", "G": "#cfc6b6", "L": "#ffffff", "q": "#d8322a", "c": "#c7a34b",
                      "C": "#8c6f2e"}, hat="caping")
    penumpang = _seated(dict(hair="kerudung", hijab_color="hijau" if "hijau" in face.HIJAB_COLORS
                             else list(face.HIJAB_COLORS)[0], skin="kuning_langsat", mouth="senyum"),
                        {"g": "#c9432a", "G": "#8a1f12", "L": "#e8664a", "q": "#c9432a"}, body=BODY_DASTER)
    cart = _becak_terbuka()
    out = []
    for f in range(2):
        legs = Canvas(60, 60)
        ox, oy = 12, 22
        knee = [(ox + 42, oy + 20), (ox + 40, oy + 22)][f]
        foot = [(ox + 41, oy + 26), (ox + 36, oy + 25)][f]
        for dx in (0, 1):
            legs.line(ox + 38 + dx, oy + 12, knee[0] + dx, knee[1], "p")
            legs.line(knee[0] + dx, knee[1], foot[0] + dx, foot[1], "p")
        legs.rect(foot[0] - 1, foot[1], 4, 2, "f")
        img = _stack((64, 60), (cart, (ox, oy)), (penumpang, (ox - 3, oy + 21 - 31)),
                     (_becak_depan(), (ox, oy)),
                     (tukang.crop((0, 0, 32, 32)), (ox + 22, 0)),
                     (_fin(legs, {"p": "#3e3a4a", "f": "#2a2430"}), (0, 0)))
        spoke = Canvas(64, 60)
        for cx in (8, 20, 41):
            d = ((0, -3), (0, 3)) if f == 0 else ((-3, 0), (3, 0))
            for dx, dy in d:
                spoke.line(ox + cx, oy + 30, ox + cx + dx, oy + 30 + dy, "m")
        img.alpha_composite(render(spoke.g, {"m": "#9aa3a8"}))
        out.append(img)
    return out


KERUPUK = {"p": "#3e3a4a", "s": "#c68a5a", "t": "#2b2530", "m": "#9aa3a8", "M": "#5d666b", "c": "#f3ecd6cc", "C": "#cfc6b6cc",
           "k": "#f6e6b0", "K": "#e0a060", "r": "#d8322a", "b": "#3f8ac6"}


def kerupuk_lewat():
    """Sepeda onthel dengan tumpukan plastik kerupuk raksasa. 2 frame."""
    rider = _seated(dict(hair="pendek", skin="sawo_matang", mouth="nyengir", facial_hair="kumis_tipis"),
                    {"g": "#3f8ac6", "G": "#1f4a7a", "L": "#7fb0cc", "q": "#fbf6ec"}, hat="topi_pet")
    out = []
    for f in range(2):
        cv = Canvas(64, 62)
        for cx in (12, 46):
            cv.ring(cx, 52, 8, "t", thick=2)
            cv.disc(cx, 52, 1, "m")
            for dx, dy in (((0, -6), (0, 6)) if f == 0 else ((-6, 0), (6, 0))):
                cv.line(cx, 52, cx + dx, 52 + dy, "M")
        cv.line(12, 52, 28, 52, "m"), cv.line(28, 52, 40, 38, "m"), cv.line(12, 52, 24, 38, "m")
        cv.line(24, 38, 40, 38, "m"), cv.line(40, 38, 46, 52, "m"), cv.line(42, 34, 40, 38, "m")
        cv.hline(40, 33, 5, "M")
        cv.rect(24, 36, 6, 2, "t")                                               # sadel
        cv.rect(2, 36, 22, 2, "M")                                           # boncengan
        for bx, by in ((1, 18), (12, 18), (1, 2), (12, 2), (6, -12)):           # plastik kerupuk
            if by < 0:
                continue
            cv.box(bx, by, 12, 16, "c", edge=None)
            for kx, ky in ((3, 4), (8, 6), (4, 10), (9, 11)):
                cv.disc(bx + kx, by + ky, 2, "k")
                cv.px(bx + kx, by + ky, "K")
            cv.hline(bx + 2, by, 8, "r")
        body = _fin(cv, KERUPUK, skip=(".", "c"))
        img = _stack((64, 62), (body, (0, 0)), (rider, (14, 6)))
        front = Canvas(64, 62)
        knee = [(34, 42), (32, 44)][f]
        foot = [(30, 50), (26, 54)][f]
        for dx in (0, 1):
            front.line(28 + dx, 36, knee[0] + dx, knee[1], "p")
            front.line(knee[0] + dx, knee[1], foot[0] + dx, foot[1], "p")
        front.rect(foot[0] - 1, foot[1], 4, 2, "t")
        front.line(36, 32, 41, 33, "s")                                          # lengan ke setang
        img.alpha_composite(render(front.g, KERUPUK))
        out.append(img)
    return out


# ------------------------------------------------------------------- semua
BAKSO = {"w": "#fbf6ec", "W": "#cfc6b6", "b": "#3f8ac6", "B": "#1f4a7a", "g": "#bfe6f0cc", "m": "#9aa3a8",
         "M": "#5d666b", "t": "#2b2530", "r": "#d8322a", "y": "#f2c94c", "a": "#e8e4dcaa", "k": "#b08a5a"}


def _gerobak_bakso(f):
    cv = Canvas(44, 44)
    cv.box(6, 22, 34, 12, "b", light="w", dark="B")
    cv.rect(6, 12, 34, 10, "g")                                               # kaca
    for x in (10, 18):
        cv.disc(x, 18, 2, "k"), cv.disc(x + 3, 19, 2, "k")                     # bakso di etalase
    cv.rect(26, 15, 10, 6, "m")                                               # panci
    cv.hline(25, 14, 12, "M")
    cv.hline(6, 11, 34, "w"), cv.hline(6, 10, 34, "r")
    for x in (7, 38):
        cv.vline(x, 4, 7, "M")
    cv.hline(5, 3, 36, "r"), cv.hline(5, 4, 36, "y")                          # atap kecil
    cv.line(6, 24, 0, 30, "M")                                                # pegangan
    for cx in (14, 32):
        cv.disc(cx, 38, 4, "t")
        cv.disc(cx, 38, 1, "m")
    for bx in (13, 27):                                                       # gambar mangkok (tanpa huruf,
        cv.poly([(bx - 4, 26), (bx + 5, 26), (bx + 3, 31), (bx - 2, 31)], "w")   # sprite bisa dibalik)
        cv.hline(bx - 3, 28, 7, "r")
        cv.disc(bx - 1, 25, 1, "k"), cv.disc(bx + 2, 25, 1, "k")
    steam = Canvas(44, 44)
    for i, (x, y) in enumerate(((29, 10), (32, 7), (30, 4))):
        steam.px(x + (f + i) % 2, y, "a")
    img = _fin(cv, BAKSO, skip=(".", "g"))
    img.alpha_composite(render(steam.g, BAKSO))
    return img


def bakso_lewat():
    frames = _walk(dict(hair="cepak", skin="sawo_matang", mouth="senyum", brows="ramah" if "ramah" in face.BROWS else "tebal"),
                   {"g": "#fbf6ec", "G": "#cfc6b6", "L": "#ffffff", "q": "#3f8ac6"}, hat="topi_kain")
    out = []
    for i, fr in enumerate(frames):
        cart = _gerobak_bakso(i)
        out.append(_stack((76, 44), (fr, (0, 4)), (cart, (32, 0))))
    return out


# ------------------------------------------------------------------ registry
# name -> (frames, durations); `jalan{n}` in the game.
CITY_WALKERS = {
    "ondel_ngamen": lambda: ondel_ngamen(),
    "bajaj": lambda: bajaj_ngebul(),
    "delman": lambda: delman(),
    "angklung_ngamen": lambda: angklung_ngamen(),
    "gebogan": lambda: gebogan_iring(),
    "monyet": lambda: [monyet(i) for i in range(4)],
    "becak": lambda: becak_lewat(),
    "kerupuk": lambda: kerupuk_lewat(),
    "bakso": lambda: bakso_lewat(),
}


def generate():
    OUT.mkdir(parents=True, exist_ok=True)
    rows = []
    for name, fn in CITY_WALKERS.items():
        frames = fn()
        save_set(OUT / name, [(f"jalan{i + 1}", im) for i, im in enumerate(frames)],
                 durations=[160] * len(frames))
        rows.append(frames[0])
    contact_sheet([rows[:5], rows[5:]], k=4, pad=10).save(OUT / "lewat_kota_preview.png")
