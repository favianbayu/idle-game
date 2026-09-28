"""Hari-hari besar Indonesia: kostum pelanggan, selempang karakter utama, dekorasi jalan.

Output (assets/events/):
  <id>/untai1-2.png         : untaian dekorasi selebar layar (224 px), 2 frame goyang/kedip
  <id>/tiang1-n.png         : dekorasi tiang di kiri-kanan jalan (opsional)
  <id>/ikon.png             : ikon 24x24 untuk notifikasi
  <id>/selempang.png        : overlay 32x40 di atas karakter utama
  <id>/pelanggan/<nama>/    : frame pelanggan (jalan/tunggu/senang) berkostum event
  lewat/balap_karung, lewat/barongsai (characters/lewat): pejalan khusus event
  events.json               : daftar event, tanggal, dan aset
Tanggal dicek oleh game (lihat EVENTS di prototype/game.js); tanggal Lebaran/Imlek/Galungan
bergeser tiap tahun, jadi disimpan sebagai tabel.
"""

import json
import math

from PIL import Image

from . import face, npcs
from .character import BODY_DASTER, BODY_KAOS, HATS, TAS_BELANJA, compose, full_palette
from .core import ASSETS, W, contact_sheet, render, save_set
from .draw import Canvas
from .npc_anim import customer_frames

ROOT = ASSETS.parent
OUT = ROOT / "events"
O = "#2a1c24"
SW = 224

# key khusus event (tidak dipakai kit wajah/badan): ( ) * %
RED, WHITE = "#d8322a", "#fbf6ec"


# ------------------------------------------------------------------- topi event
def _layer(cv):
    return {y: "".join(r) for y, r in enumerate(cv.g) if any(ch != "." for ch in r)}


HATS["ikat_mp"] = {"clip": None, "layer": {
    y: s.replace("r", "(").replace("W", ")") for y, s in HATS["ikat_kepala"]["layer"].items()}}


def _santa():
    cv = Canvas(W, 40)
    cv.poly([(8, 11), (24, 11), (21, 4), (15, 2)], "(")
    cv.line(20, 3, 26, 7, "("), cv.line(21, 4, 26, 8, "(")
    cv.disc(27, 9, 2, ")")
    cv.rect(6, 10, 20, 3, ")")
    cv.outline("O")
    return _layer(cv)


def _pesta():
    cv = Canvas(W, 40)
    cv.poly([(11, 10), (21, 10), (17, 1), (15, 1)], "(")
    for y in range(2, 10, 3):
        cv.recolor(0, y, W, 1, {"(": ")"})
    cv.disc(16, 0, 1, "*")
    cv.outline("O")
    return _layer(cv)


def _bunga():
    cv = Canvas(W, 40)
    for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)):
        cv.px(23 + dx, 9 + dy, "(")
    cv.px(23, 9, "*")
    cv.px(21, 8, ")"), cv.px(20, 9, ")"), cv.px(21, 10, ")")
    cv.outline("O")
    return _layer(cv)


HATS["santa"] = {"clip": 10, "layer": _santa()}
HATS["pesta"] = {"clip": None, "layer": _pesta()}
BUNGA = _bunga()


def _pattern(grid, keys="g", every=4):
    """Motif batik/renda: titik-titik '%' di atas kain baju (baris 24-38)."""
    for y in range(24, 39):
        for x in range(len(grid[0])):
            if grid[y][x] in keys and ((x + y) % every == 0 or (x - y) % (every * 2) == 0):
                grid[y][x] = "%"
    return grid


# ------------------------------------------------------------------ event list
PASTEL = [("#9fd8b8", "#5fa884", "#c8f0d8"), ("#f3e3b8", "#c7ae78", "#fff6d8"),
          ("#a8cfee", "#6a98c0", "#d0e8fa"), ("#cdb4ea", "#9a80c0", "#e6d6f8")]
KEBAYA = [("#f6c6d6", "#d08aa4"), ("#fbf0dc", "#d8c4a0"), ("#d6c4f0", "#a08ac8"), ("#c8ecd8", "#88c0a0")]

EVENTS = {
    "kemerdekaan": dict(name="HUT Kemerdekaan RI", pesan="Dirgahayu Republik Indonesia! Merdeka!",
                        tanggal="1-31 Agustus", sash=(RED, WHITE), flag=True),
    "batik": dict(name="Hari Batik Nasional", pesan="Semua pakai batik hari ini.", tanggal="1-4 Oktober",
                  sash=("#7a4a22", "#e0b04a")),
    "lebaran": dict(name="Idul Fitri", pesan="Minal aidin wal faizin, mohon maaf lahir batin.",
                    tanggal="H-7 s/d H+7 Lebaran (tabel)", sash=("#3f8a4a", "#f2c94c")),
    "imlek": dict(name="Tahun Baru Imlek", pesan="Gong xi fa cai! Semoga rezeki melimpah.",
                  tanggal="H-3 s/d Cap Go Meh (tabel)", sash=("#c9322a", "#f2c94c")),
    "natal": dict(name="Natal", pesan="Selamat Natal, damai di bumi.", tanggal="20-27 Desember",
                  sash=("#c9322a", "#3f8a4a")),
    "tahun_baru": dict(name="Tahun Baru", pesan="Selamat tahun baru! Kembang api tiap malam.",
                       tanggal="28 Desember - 2 Januari", sash=("#7b4fb0", "#f2c94c")),
    "kartini": dict(name="Hari Kartini", pesan="Habis gelap terbitlah terang. Kebaya day!",
                    tanggal="19-23 April", sash=("#e87aa0", WHITE)),
    "galungan": dict(name="Galungan & Kuningan", pesan="Rahajeng Galungan! Penjor berjajar di jalan.",
                     tanggal="Galungan s/d Kuningan (tiap 210 hari, hanya Bali)", sash=("#f2c94c", WHITE),
                     kota="bali"),
}
# Hari Pahlawan (10 Nov) memakai aset kemerdekaan.
ALIAS = {"pahlawan": dict(pakai="kemerdekaan", name="Hari Pahlawan", tanggal="8-12 November",
                          pesan="Selamat Hari Pahlawan, arek-arek Suroboyo!")}


def costume(ev, idx, lk, body, outfit):
    """-> (look, outfit, hat, extras, post-process)"""
    lk = dict(lk)
    o = dict(outfit)
    hijab = lk["hair"] == "kerudung"
    hat, extras, post = None, [], None
    pal = {"(": RED, ")": WHITE, "*": "#f2c94c", "%": "#e0b04a"}

    def shirt(g, G, L, q=None):
        o.update({"g": g, "G": G, "L": L, "q": q or g})

    def veil(i, I, j):
        o.update({"i": i, "I": I, "j": j})

    if ev == "kemerdekaan":
        if idx % 2 == 0:
            shirt(RED, "#8a1f12", "#f06a5a", WHITE)
            o["k"] = WHITE
            veil(RED, "#8a1f12", "#f06a5a")
        else:
            shirt(WHITE, "#cfc6b6", "#ffffff", RED)
            o["k"] = RED
            veil(WHITE, "#cfc6b6", "#ffffff")
        hat = "ikat_mp"
    elif ev == "batik":
        shirt(*[("#8a5a2a", "#5e3a1a", "#b07a4a"), ("#2e4a7a", "#1c2f52", "#4a6a9a"),
                ("#6b2e1a", "#4a1e10", "#8a4a2a"), ("#3f6a4a", "#285e32", "#5a8a64")][idx % 4])
        o["k"] = "#e0b04a"
        veil("#8a5a2a", "#5e3a1a", "#b07a4a")
        post = lambda g: _pattern(g, "gqLk", 3)                            # noqa: E731
    elif ev == "lebaran":
        g, G, L = PASTEL[idx % 4]
        shirt(g, G, L, WHITE)
        o["k"] = WHITE
        veil(g, G, L)
        hat = "peci"
        pal.update({"c": "#1e1822", "C": "#6a5a78"})
        post = lambda g: _pattern(g, "q", 2)                               # noqa: E731  bordir koko
        pal["%"] = "#fffaf0"
    elif ev == "imlek":
        shirt("#c9322a", "#8a1f12", "#e8664a", "#f2c94c")
        o["k"] = "#f2c94c"
        veil("#c9322a", "#8a1f12", "#e8664a")
        post = lambda g: _pattern(g, "q", 5)                               # noqa: E731
    elif ev == "natal":
        shirt(*[("#3f8a4a", "#285e32", "#6fb07a"), ("#c9322a", "#8a1f12", "#e8664a")][idx % 2], WHITE)
        veil("#c9322a", "#8a1f12", "#e8664a")
        hat = "santa"
    elif ev == "tahun_baru":
        hat = "pesta"
        pal.update({"(": ["#7b4fb0", "#3f8ac6", "#d8322a", "#3fae5a"][idx % 4], ")": "#f2c94c", "*": WHITE})
    elif ev == "kartini":
        g, G = KEBAYA[idx % 4]
        shirt(g, G, "#ffffff", WHITE)
        o["k"] = G
        veil(g, G, "#ffffff")
        post = lambda g: _pattern(g, "gLk", 3)                             # noqa: E731  renda
        pal.update({"%": "#ffffff", "(": "#ff8fb0", ")": "#fbf6ec"})
        extras = [BUNGA]
    elif ev == "galungan":
        shirt(WHITE, "#cfc6b6", "#ffffff", "#f2c94c")
        o["k"] = "#f2c94c"
        veil(WHITE, "#cfc6b6", "#ffffff")
        hat = "udeng"
        pal.update({"c": "#f3efe6", "C": "#c9c1b3"})
    if hijab:
        hat = None
    o.update(pal)
    return lk, o, hat, extras, post


def _cast():
    cast = [(n, lk, body, outfit, []) for n, lk, body, outfit in npcs.roll_customers()[:4]]
    bu_pal = dict(npcs.BU_YANTI_STAGES[1]["palette"])
    bu_pal.setdefault("x", "#3a2a30")
    cast.append(("bu_yanti", npcs.BU_YANTI_LOOK, BODY_DASTER, bu_pal, [TAS_BELANJA]))
    return cast


def customer_event_frames(ev):
    out = {}
    for idx, (name, lk, body, outfit, items) in enumerate(_cast()):
        lk2, o, hat, extras, post = costume(ev, idx, lk, body, outfit)
        pal = full_palette(lk2, o)
        for it in items:
            pal.update(it.get("palette", {}) if isinstance(it, dict) else {})

        def build(e, lk2=lk2, body=body, hat=hat, extras=extras, post=post, items=items):
            g = compose(lk2, body, hat=hat, items=items, extras=extras, expression=e)
            return post(g) if post else g
        out[name] = customer_frames(build, pal, 34 if body is BODY_DASTER else 27)
    return out


# ------------------------------------------------------------ selempang hero
def sash(ev):
    a, b = EVENTS[ev]["sash"]
    cv = Canvas(W, 40)
    for y in range(24, 33):
        x0 = 9 + round((y - 24) * 1.4)
        cv.px(x0 - 1, y, "O")
        cv.px(x0, y, "a"), cv.px(x0 + 1, y, "a"), cv.px(x0 + 2, y, "b"), cv.px(x0 + 3, y, "b")
        cv.px(x0 + 4, y, "O")
    if EVENTS[ev].get("flag"):
        cv.vline(4, 11, 20, "M")
        cv.rect(0, 12, 4, 3, "a"), cv.rect(0, 15, 4, 3, "b")
        cv.px(4, 10, "y")
    pal = {"a": a, "b": b, "M": "#6b4a32", "y": "#f2c94c", "O": O}
    img = render(cv.g, pal)
    if EVENTS[ev].get("flag"):
        f = Canvas(W, 40)
        f.rect(0, 12, 4, 6, "x")
        f.outline("O")
        f.rect(0, 12, 4, 6, ".")
        img = Image.alpha_composite(render(f.g, {"x": a, "O": O}), img)
    return img


# ---------------------------------------------------------------- dekorasi
def rope_y(x, y0, sag):
    t = (x - SW / 2) / (SW / 2)
    return round(y0 + sag * (1 - t * t))


def _rope(cv, y0, sag, key="r"):
    for x in range(SW):
        cv.px(x, rope_y(x, y0, sag), key)


def untai(ev, f):
    """String decoration across the street. Returns an RGBA image SWx44."""
    cv = Canvas(SW, 44)
    y0, sag = 3, 14
    pal = {"r": "#3a2a30", "O": O}
    _rope(cv, y0, sag)
    sw = 1 if f else -1
    if ev == "kemerdekaan":
        pal.update({"a": RED, "b": WHITE})
        for i, x in enumerate(range(4, SW, 9)):
            y = rope_y(x, y0, sag) + 1
            cv.poly([(x - 3, y), (x + 4, y), (x + (sw if i % 2 else -sw), y + 9)], "ab"[i % 2])
    elif ev == "batik":
        cols = [("#8a5a2a", "#e0b04a"), ("#2e4a7a", "#f3e9d8"), ("#6b2e1a", "#e0b04a"), ("#3f6a4a", "#f2e08a")]
        for i, x in enumerate(range(10, SW, 22)):
            y = rope_y(x, y0, sag) + 1
            k1, k2 = "abcd"[i % 4], "ABCD"[i % 4]
            pal[k1], pal[k2] = cols[i % 4]
            cv.rect(x - 6 + (sw if i % 2 else 0), y, 12, 16, k1)
            cv.fill_fn(x - 5, y + 1, 10, 14, lambda a, b, k2=k2: k2 if (a + b) % 4 == 0 or (a - b) % 6 == 0 else None)
            cv.hline(x - 6, y, 12, k2)
    elif ev == "lebaran":
        pal.update({"g": "#5fae4a", "G": "#2f7a3a", "y": "#f2c94c", "l": "#fff2a8", "L": "#f0902a"})
        for i, x in enumerate(range(8, SW, 16)):
            y = rope_y(x, y0, sag)
            if i % 2 == 0:
                x += sw
                cv.vline(x, y + 1, 3, "y")
                cv.poly([(x, y + 3), (x + 5, y + 8), (x, y + 13), (x - 5, y + 8)], "g")
                for d in range(-3, 4, 2):
                    cv.line(x + d - 2, y + 7 + abs(d) // 2, x + d + 2, y + 9 - abs(d) // 2, "G")
                cv.line(x - 1, y + 13, x - 2, y + 17, "y"), cv.line(x + 1, y + 13, x + 2, y + 17, "y")
            else:
                cv.rect(x - 1, y + 1, 3, 4, "l" if f else "L")
    elif ev == "imlek":
        pal.update({"a": "#d8322a", "A": "#8a1f12", "y": "#f2c94c", "Y": "#b8892a"})
        for i, x in enumerate(range(12, SW, 25)):
            y = rope_y(x, y0, sag)
            cv.vline(x, y + 1, 2, "Y")
            cv.rect(x - 3, y + 3, 7, 2, "y")
            cv.ellipse(x, y + 10, 6, 5, "a")
            for d in (-3, 0, 3):
                cv.vline(x + d, y + 6, 9, "A")
            cv.rect(x - 3, y + 15, 7, 2, "y")
            t = x + (sw if i % 2 else -sw)
            cv.vline(t, y + 17, 5, "y")
    elif ev == "natal":
        cols = ["#d8322a", "#f2c94c", "#3fae5a", "#3f8ac6"]
        for i, c in enumerate(cols):
            pal["abcd"[i]] = c
            pal["ABCD"[i]] = "#5a4a50"
        for i, x in enumerate(range(3, SW, 7)):
            y = rope_y(x, y0, sag) + 1
            on = (i + f) % 2 == 0
            k = ("abcd" if on else "ABCD")[i % 4]
            cv.rect(x, y + 1, 2, 3, k)
            cv.px(x, y, "r")
        pal["g"] = "#2f7a3a"
        for x in range(0, SW, 3):                                    # garland daun
            cv.px(x, rope_y(x, y0, sag) - 1, "g")
    elif ev == "tahun_baru":
        pal.update({"y": "#f2c94c", "s": "#d8dde0", "p": "#b08ae0", "c": "#7cd8e8"})
        for i, x in enumerate(range(3, SW, 6)):
            y = rope_y(x, y0, sag) + 1
            k = "yspc"[i % 4]
            for j in range(0, 10 + (i % 3) * 3):
                cv.px(x + ((j // 2 + f + i) % 2), y + j, k)
    elif ev == "kartini":
        pal.update({"w": WHITE, "p": "#ff8fb0", "y": "#f2c94c", "g": "#5fae4a"})
        for x in range(0, SW, 2):
            y = rope_y(x, y0, sag)
            cv.px(x, y, "w" if x % 4 else "g")
        for i, x in enumerate(range(6, SW, 12)):
            y = rope_y(x, y0, sag) + 2
            for j in range(0, 8 + (i % 2) * 4, 2):
                cv.px(x + (sw if j > 4 else 0), y + j, "w")
            cx, cy = x + (sw if i % 2 else 0), y + 10 + (i % 2) * 4
            for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)):
                cv.px(cx + dx, cy + dy, "p")
            cv.px(cx, cy, "y")
    elif ev == "galungan":
        pal.update({"y": "#f2e08a", "Y": "#c7a34b", "w": WHITE, "k": "#d8322a"})
        for i, x in enumerate(range(4, SW, 8)):                      # untaian janur (tamiang)
            y = rope_y(x, y0, sag) + 1
            cv.poly([(x - 3, y), (x + 3, y), (x + (sw if i % 2 else -sw), y + 7)], "y")
            cv.vline(x, y, 6, "Y")
            if i % 4 == 0:
                cv.disc(x, y + 10, 2, "w"), cv.px(x, y + 10, "k")
    cv.outline("O", skip=(".", "r"))
    return render(cv.g, pal)


def pohon_natal(f):
    cv = Canvas(26, 44)
    cv.rect(11, 36, 4, 5, "t")
    cv.rect(8, 40, 10, 4, "k")
    for i, (top, half) in enumerate(((4, 5), (12, 8), (20, 11))):
        cv.poly([(13 - half, top + 12), (13 + half + 1, top + 12), (13, top)], "g")
        cv.hline(13 - half + 1, top + 11, half * 2, "G")
    cv.disc(13, 3, 2, "y")
    cols = "rbywrby"
    for i, (x, y) in enumerate(((11, 12), (15, 14), (9, 20), (16, 23), (12, 27), (7, 30), (18, 30))):
        cv.px(x, y, cols[(i + f) % len(cols)])
    cv.outline("O")
    return render(cv.g, {"t": "#6b4a32", "k": "#c9322a", "g": "#2f7a3a", "G": "#1f5a2a", "y": "#f2c94c",
                         "r": "#ff5a5a", "b": "#7cd8e8", "w": WHITE, "O": O})


def tiang(ev):
    from .props import bendera, penjor
    if ev == "kemerdekaan":
        out = []
        for w in range(4):
            cv, pal = bendera(h=64, wave=w)
            out.append(render(cv.g, pal))
        return out
    if ev == "galungan":
        cv, pal = penjor(h=110)
        return [render(cv.g, pal)]
    if ev == "natal":
        return [pohon_natal(0), pohon_natal(1)]
    return []


def ikon(ev):
    cv = Canvas(12, 12)
    pal = {"O": O}
    if ev == "kemerdekaan":
        cv.vline(1, 0, 12, "M"), cv.rect(2, 1, 9, 3, "a"), cv.rect(2, 4, 9, 3, "b")
        pal.update({"M": "#9aa3a8", "a": RED, "b": WHITE})
    elif ev == "batik":
        cv.rect(1, 1, 10, 10, "a")
        cv.fill_fn(2, 2, 8, 8, lambda a, b: "b" if (a + b) % 3 == 0 else None)
        pal.update({"a": "#8a5a2a", "b": "#e0b04a"})
    elif ev == "lebaran":
        cv.poly([(6, 0), (11, 5), (6, 10), (1, 5)], "g")
        cv.line(3, 4, 7, 8, "G"), cv.line(5, 2, 9, 6, "G"), cv.line(9, 4, 5, 8, "G"), cv.line(7, 2, 3, 6, "G")
        cv.px(5, 11, "y"), cv.px(7, 11, "y")
        pal.update({"g": "#5fae4a", "G": "#2f7a3a", "y": "#f2c94c"})
    elif ev == "imlek":
        cv.rect(4, 0, 4, 1, "y"), cv.ellipse(6, 5, 5, 4, "a"), cv.vline(4, 2, 7, "A"), cv.vline(8, 2, 7, "A")
        cv.rect(4, 9, 4, 1, "y"), cv.vline(6, 10, 2, "y")
        pal.update({"a": "#d8322a", "A": "#8a1f12", "y": "#f2c94c"})
    elif ev == "natal":
        cv.poly([(1, 10), (11, 10), (6, 0)], "g"), cv.px(6, 0, "y"), cv.px(4, 6, "r"), cv.px(8, 8, "y")
        cv.rect(5, 10, 2, 2, "t")
        pal.update({"g": "#2f7a3a", "y": "#f2c94c", "r": "#ff5a5a", "t": "#6b4a32"})
    elif ev == "tahun_baru":
        for a in range(0, 360, 45):
            r = math.radians(a)
            cv.line(6, 6, 6 + round(5 * math.cos(r)), 6 + round(5 * math.sin(r)), "abc"[a // 45 % 3])
        cv.px(6, 6, "w")
        pal.update({"a": "#f2c94c", "b": "#ff5a7a", "c": "#7cd8e8", "w": WHITE})
    elif ev == "kartini":
        for cx, cy in ((6, 3), (3, 6), (9, 6), (6, 9), (4, 4), (8, 4), (4, 8), (8, 8)):
            cv.disc(cx, cy, 1, "p")
        cv.disc(6, 6, 1, "y")
        pal.update({"p": "#ff8fb0", "y": "#f2c94c"})
    elif ev == "galungan":
        for i in range(10):
            cv.px(2 + round(i * 0.7), 11 - i, "k")
        cv.line(9, 2, 11, 5, "k"), cv.rect(10, 5, 2, 3, "y"), cv.rect(2, 7, 2, 2, "r")
        pal.update({"k": "#e2c678", "y": "#f2e08a", "r": "#c9432a"})
    cv.outline("O")
    return render(cv.g, pal).resize((24, 24), Image.NEAREST)


# ------------------------------------------------------------ pejalan event
def balap_karung():
    lk = face.look(hair="cepak", skin="sawo_matang", mouth="ketawa", eyes="berbinar")
    pal = full_palette(lk, {"g": RED, "G": "#8a1f12", "L": "#f06a5a", "q": WHITE, "p": "#3e3a4a",
                            "P": "#2c2836", "f": "#2a2430", "F": "#16121a", "(": RED, ")": WHITE,
                            "k": "#c8a468", "K": "#8a6a3a", "n": "#5e4a2a"})
    out = []
    for dy, squash in ((6, True), (0, False), (3, False)):
        g = compose(lk, BODY_KAOS, hat="ikat_mp", expression="senang")
        cv = Canvas(W, 40)
        cv.g = g
        cv.rect(7, 27, 18, 13, "k")                                   # karung goni
        cv.hline(7, 27, 18, "K")
        cv.fill_fn(8, 29, 16, 10, lambda a, b: "K" if (a + b) % 5 == 0 else None)
        cv.px(8, 27, "s"), cv.px(23, 27, "s")                          # tangan memegang
        if squash:
            cv.rect(7, 38, 18, 2, "k")
        img = render(cv.g, pal)
        frame = Image.new("RGBA", (32, 46), (0, 0, 0, 0))
        frame.alpha_composite(img, (0, dy))
        out.append(frame)
    return out


BARONG = {"a": "#d8322a", "A": "#8a1f12", "y": "#f2c94c", "Y": "#b8892a", "w": WHITE, "e": "#1e1420",
          "g": "#3fae5a", "p": "#f2c94c", "P": "#b8892a", "f": "#fbf6ec"}


def barongsai(f):
    cv = Canvas(64, 44)
    lift = [(0, 3, 3, 0), (3, 0, 0, 3)][f % 2]
    for x, l in zip((8, 16, 34, 42), lift):                               # 4 kaki penari
        cv.rect(x, 28, 5, 12 - l, "p")
        cv.rect(x, 38 - l, 5, 2, "f")
        cv.rect(x - 1, 40 - l, 7, 2, "e")
    cv.poly([(2, 18), (8, 10), (40, 8), (48, 14), (48, 30), (4, 30)], "a")  # badan kain
    for x in range(6, 46, 6):
        cv.vline(x, 12, 16, "y")
    cv.fill_fn(4, 29, 44, 2, lambda a, b: "w" if a % 2 == b % 2 else "f")   # rumbai
    cv.poly([(2, 18), (0, 12), (4, 14)], "a"), cv.px(0, 11, "w")          # ekor
    hy = 2 + (f % 2)
    cv.box(42, hy + 4, 20, 16, "a", edge=None)                            # kepala
    cv.hline(42, hy + 4, 20, "y"), cv.hline(42, hy + 5, 20, "Y")
    cv.disc(50, hy + 9, 3, "w"), cv.disc(57, hy + 9, 3, "w")
    cv.px(51, hy + 9, "e"), cv.px(58, hy + 9, "e")
    cv.rect(46, hy, 3, 4, "g"), cv.px(47, hy - 1, "y")                     # tanduk
    cv.fill_fn(42, hy + 20, 20, 2, lambda a, b: "w" if a % 2 else "f")    # jenggot rumbai
    mouth = hy + 15
    cv.rect(46, mouth, 16, 2 + (2 if f == 2 else 0), "e" if f == 2 else "A")
    cv.hline(46, mouth, 16, "w")
    cv.outline("O")
    return render(cv.g, {**BARONG, "O": O})


# ------------------------------------------------------------------- generate
def generate():
    OUT.mkdir(parents=True, exist_ok=True)
    meta, sheet = {}, []
    for ev, e in EVENTS.items():
        d = OUT / ev
        d.mkdir(parents=True, exist_ok=True)
        for f in range(2):
            untai(ev, f).save(d / f"untai{f + 1}.png")
        poles = tiang(ev)
        for i, im in enumerate(poles):
            im.save(d / f"tiang{i + 1}.png")
        ikon(ev).save(d / "ikon.png")
        sash(ev).save(d / "selempang.png")
        cust = customer_event_frames(ev)
        for name, frames in cust.items():
            save_set(d / "pelanggan" / name, frames,
                     gif_order=[0, 1, 2, 3, 0, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8],
                     durations=[140] * 8 + [500] * 4 + [160, 160, 300])
        meta[ev] = {"name": e["name"], "pesan": e["pesan"], "tanggal": e["tanggal"], "tiang": len(poles),
                    "kota": e.get("kota"), "pelanggan": list(cust)}
        sheet.append([ikon(ev), untai(ev, 0).crop((0, 0, 112, 44))] + poles[:1] +
                     [frames[4][1] for frames in cust.values()])
    for ev, a in ALIAS.items():
        meta[ev] = {**meta[a["pakai"]], **{k: v for k, v in a.items()}}
    lw = ASSETS / "lewat"
    save_set(lw / "balap_karung", [(f"jalan{i + 1}", im) for i, im in enumerate(balap_karung())],
             durations=[200, 160, 200])
    save_set(lw / "barongsai", [(f"jalan{i + 1}", barongsai(i)) for i in range(3)], durations=[200, 200, 300])
    sheet.append(balap_karung() + [barongsai(i) for i in range(3)])
    contact_sheet(sheet, k=3, pad=8).save(OUT / "events_preview.png")
    (OUT / "events.json").write_text(json.dumps({
        "catatan": "Tanggal dicek di game. Lebaran/Imlek/Galungan memakai tabel per tahun.",
        "events": meta}, indent=2, ensure_ascii=False) + "\n")
