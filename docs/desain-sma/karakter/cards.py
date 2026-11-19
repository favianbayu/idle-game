import os, sys, json
from PIL import Image, ImageDraw, ImageFont
RAW, OUT = sys.argv[1], sys.argv[2]
F = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"; FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
f = lambda s, b=False: ImageFont.truetype(FB if b else F, s)
GROUPS = [
 ("Tokoh utama", (120, 160, 220), [("raka", "Raka"), ("rani", "Rani")]),
 ("Keluarga & rumah", (230, 170, 110), [("omDarto", "Om Darto"), ("cici", "Cici"), ("buNarti", "Bu Narti")]),
 ("Sahabat", (120, 190, 130), [("bimo", "Bimo"), ("tegar", "Tegar"), ("jojo", "Jojo"), ("uti", "Uti"), ("fajar", "Mas Fajar")]),
 ("Romance", (230, 140, 170), [("nadia", "Nadia"), ("sekar", "Sekar"), ("laras", "Laras"), ("dimas", "Dimas"), ("arga", "Arga"), ("rizal", "Rizal")]),
 ("Rival & antagonis", (200, 90, 90), [("bram", "Bram"), ("rio", "Rio"), ("kevin", "Kevin"), ("sasha", "Sasha"), ("pakHaris", "Pak Haris"), ("kobar", "Kobar"), ("pakGito", "Pak Gito")]),
 ("Klub motor", (210, 170, 60), [("bangJaka", "Bang Jaka")]),
 ("Guru & staf", (150, 140, 200), [("buHartini", "Bu Hartini"), ("buRatna", "Bu Ratna"), ("pakHendro", "Pak Hendro"), ("pakWawan", "Pak Wawan"), ("buSinta", "Bu Sinta"), ("mrAnton", "Mr. Anton"), ("pakGunadi", "Pak Gunadi"), ("buMelati", "Bu Melati"), ("pakUjang", "Pak Ujang"), ("makIyah", "Mak Iyah")]),
]
def load(id, k): return Image.open(os.path.join(RAW, f"{id}_{k}.png")).convert("RGBA")
def portrait(id, color, size=280):
    fr = load(id, "front"); bb = fr.getbbox(); fr = fr.crop(bb)
    h = int(fr.height * 0.56); crop = fr.crop((0, 0, fr.width, h))
    side = max(crop.width + 4, h + 2)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0)); sq.paste(crop, ((side - crop.width) // 2, side - h), crop)
    big = sq.resize((size, size), Image.NEAREST)
    bg = Image.new("RGBA", (size, size), color + (255,)); d = ImageDraw.Draw(bg)
    for i in range(0, size, 2):  # gradasi
        a = int(70 * i / size); d.line((0, i, size, i), fill=(255, 255, 255, a) if False else tuple(max(0, c - a // 2) for c in color) + (255,))
    d.ellipse((size * .1, size * .15, size * .9, size * 1.0), fill=tuple(min(255, c + 40) for c in color) + (255,))
    bg.alpha_composite(big); return bg
os.makedirs(OUT, exist_ok=True)
lineup_rows = []
for gname, color, items in GROUPS:
    for id, name in items:
        W, H = 1290, 330
        card = Image.new("RGBA", (W, H), (248, 246, 240, 255)); d = ImageDraw.Draw(card)
        d.rectangle((0, 0, W - 1, H - 1), outline=(80, 80, 80), width=2)
        p = portrait(id, color); card.paste(p, (16, 34))
        d.rectangle((16, 34, 296, 314), outline=(50, 50, 50), width=3)
        d.text((16, 8), f"{name}", font=f(18, True), fill=(30, 30, 30))
        d.text((310, 8), f"{gname}  |  id gaya: {id}", font=f(13), fill=(90, 90, 90))
        x = 314
        for k, lab in (("front", "depan"), ("side", "samping"), ("back", "belakang")):
            im = load(id, k); im = im.crop(im.getbbox()); im = im.resize((im.width * 6, im.height * 6), Image.NEAREST)
            card.alpha_composite(im, (x, 300 - im.height)); d.text((x, 306), lab, font=f(11), fill=(90, 90, 90)); x += im.width + 24
        d.line((x, 40, x, 316), fill=(200, 200, 200), width=2); x += 16
        v = load(id, "views"); vb = v.getbbox(); v = v.crop((0, vb[1], v.width, vb[3]))
        card.alpha_composite(v, (x, 300 - v.height))
        for i, lab in enumerate(("in-game: depan", "serong", "samping", "belakang")):
            d.text((x + 20 + i * 150 - (0 if i else 0), 306), lab, font=f(11), fill=(90, 90, 90))
        d.text((x, 30), "tampak di game (sprite stacking)", font=f(11, True), fill=(90, 90, 90))
        d.text((314, 30), "proyeksi ortografis", font=f(11, True), fill=(90, 90, 90))
        card.convert("RGB").save(os.path.join(OUT, f"{id}.png"))
        lineup_rows.append((gname, color, id, name))
# lineup semua tokoh
cols = 9; cw, ch = 150, 250
rows = (len(lineup_rows) + cols - 1) // cols
L = Image.new("RGB", (cols * cw + 20, rows * ch + 70), (248, 246, 240)); d = ImageDraw.Draw(L)
d.text((14, 12), "Semua tokoh 'Lonceng Pulang' (render dari renderer voxel, tampak depan)", font=f(20, True), fill=(30, 30, 30))
for i, (g, color, id, name) in enumerate(lineup_rows):
    cx, cy = 10 + (i % cols) * cw, 56 + (i // cols) * ch
    d.rectangle((cx + 4, cy, cx + cw - 4, cy + ch - 10), fill=tuple(min(255, c + 60) for c in color))
    im = load(id, "front"); im = im.crop(im.getbbox()); im = im.resize((im.width * 5, im.height * 5), Image.NEAREST)
    L.paste(im, (cx + (cw - im.width) // 2, cy + ch - 46 - im.height), im)
    d.text((cx + 10, cy + ch - 38), name, font=f(13, True), fill=(30, 30, 30))
    d.text((cx + 10, cy + ch - 22), g, font=f(10), fill=(60, 60, 60))
L.save(os.path.join(OUT, "_semua_tokoh.png"))
print("ok", len(lineup_rows))
