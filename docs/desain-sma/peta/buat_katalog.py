"""Katalog bangunan: lembar fasad per tipe, lembar papan nama, aturan tapak, denah interior detail, dan guide 91-92.

Jalankan:  python buat_katalog.py   (butuh Pillow; memakai buat_sekolah_luar.py, buat_interior.py, katalog_data.py, interior_data.py)
Hasil: peta/katalog/*.png, peta/interior/detail_*.png, guide/91-bangunan-detail.md, guide/92-interior-detail.md
"""
import math, os
from PIL import Image, ImageDraw
from buat_sekolah_luar import Elev, C, INK, hx, shade, font, FH
from buat_interior import Plan, FURN
import katalog_data as KD
import interior_data as ID

HERE = os.path.dirname(os.path.abspath(__file__))
KAT = os.path.join(HERE, "katalog"); os.makedirs(KAT, exist_ok=True)
INT = os.path.join(HERE, "interior")
GUIDE = os.path.join(HERE, "..", "guide")


# ============================================================ FASAD
def fit(E, t, maxpx, size, bold):
    f = font(size, bold)
    while E.d.textbbox((0, 0), t, font=f)[2] > maxpx and size > 7:
        size -= 1; f = font(size, bold)
    return f


def sign(E, x, y, w, h, text, col=None, fg=(240, 210, 120), size=12):
    E.box(x, y, w, h, col)
    f = fit(E, text, w * E.s - 6, size, True); b = E.d.textbbox((0, 0), text, font=f)
    E.d.text((E.X(x + w / 2) - (b[2] - b[0]) / 2, E.Y(y + h / 2) - (b[3] - b[1]) / 2 - 2), text, font=f, fill=fg)


def label(E, x, w, t, sub=""):
    c = x + w / 2; w = max(w, 5.6); x = c - w / 2
    f = fit(E, t, w * E.s, 12, True); b = E.d.textbbox((0, 0), t, font=f)
    E.d.text((E.X(x + w / 2) - (b[2] - b[0]) / 2, E.Y(E.gy) + 3), t, font=f, fill=INK)
    if sub:
        f2 = fit(E, sub, w * E.s, 10, False); b = E.d.textbbox((0, 0), sub, font=f2)
        E.d.text((E.X(x + w / 2) - (b[2] - b[0]) / 2, E.Y(E.gy) + 18), sub, font=f2, fill=(60, 60, 60))


def door(E, x, col=None, w=1.0, h=1.8):
    E.box(x, E.gy - h, w, h, col or C["kusen"])
    E.box(x + w * 0.7, E.gy - h * 0.5, 0.12, 0.12, C["emas"], width=0)


def win(E, x, y, w=0.9, h=0.9, kaca=None, kusen=None):
    E.box(x, y, w, h, kusen or C["kusen"]); E.box(x + 0.1, y + 0.1, w - 0.2, h - 0.2, kaca or C["kaca"], width=1)
    E.d.line((E.X(x + w / 2), E.Y(y + 0.1), E.X(x + w / 2), E.Y(y + h - 0.1)), fill=kusen or C["kusen"], width=2)


def tandon(E, x, y):
    E.box(x, y - 0.9, 0.8, 0.9, hx("e8823a")); E.box(x - 0.1, y, 1.0, 0.15, hx("6a6a70"), width=1)


def jemuran(E, x, w):
    y = E.gy - 1.6
    E.d.line((E.X(x), E.Y(y), E.X(x + w), E.Y(y)), fill=INK, width=1)
    for i, c in enumerate(["e85a5a", "f2f2f2", "3a7ac0", "f2c94c"]):
        E.box(x + 0.2 + i * w / 4, y, w / 5, 0.6, hx(c), width=1)


def pot(E, x):
    E.box(x, E.gy - 0.4, 0.4, 0.4, hx("b06a4a"), width=1); E.d.ellipse((E.X(x - 0.1), E.Y(E.gy - 0.9), E.X(x + 0.5), E.Y(E.gy - 0.35)), fill=hx("5f8f4a"), outline=INK)


def motor_side(E, x, c="c83a3a"):
    for dx in (0.25, 1.35):
        E.d.ellipse((E.X(x + dx - 0.25), E.Y(E.gy - 0.5), E.X(x + dx + 0.25), E.Y(E.gy)), fill=INK)
    E.box(x + 0.2, E.gy - 0.75, 1.2, 0.35, hx(c), width=1); E.box(x + 0.5, E.gy - 0.95, 0.6, 0.2, INK, width=0)


def car_side(E, x, c="e8e8e8"):
    E.box(x, E.gy - 0.9, 3.2, 0.6, hx(c)); E.box(x + 0.6, E.gy - 1.35, 1.9, 0.5, hx(c)); E.box(x + 0.8, E.gy - 1.28, 1.5, 0.36, C["kaca"], width=1)
    for dx in (0.7, 2.5):
        E.d.ellipse((E.X(x + dx - 0.3), E.Y(E.gy - 0.6), E.X(x + dx + 0.3), E.Y(E.gy)), fill=INK)


def fasad_kampung():
    GAP = 2.2
    E = Elev("x", "Katalog fasad: rumah kampung K1-K8 (tampak depan, warna contoh)", 74, 9.5, s=16, ground=1.6)
    W = lambda k: hx(["e8d8b8", "b8d8b0", "a8c8d8", "e8b8b0", "f0d890", "b06a4a", "d8c8e8", "c8e0d0"][k])
    RF = [hx("b4583e"), hx("8a6a5a"), hx("a8a8a0"), hx("a8523a")]
    x = 1
    # K1 rumah petak
    top = E.wall(x, 3, 1, W(0)); E.gable(x, 3, top, 1.4, RF[0], eave=0.3); door(E, x + 0.3); win(E, x + 1.7, E.gy - 1.6)
    jemuran(E, x + 3.3, 1.6); label(E, x, 5, "K1 Rumah petak", "3x4, pelana"); x += GAP + 6.5
    # K2 rumah teras
    top = E.wall(x, 4, 1, W(1)); E.gable(x - 0.6, 5.2, top - 0.1, 1.5, RF[0], eave=0.2)
    E.columns(x - 0.4, 4.8, 2, top + 0.1, C["putih"]); door(E, x + 1.5); win(E, x + 0.2, E.gy - 1.6); win(E, x + 2.9, E.gy - 1.6); pot(E, x + 2.6); motor_side(E, x + 4.6)
    label(E, x, 5.5, "K2 Rumah teras", "4x5, teras 2 tiang"); x += GAP + 7.5
    # K3 rumah tumbuh
    top = E.wall(x, 4, 1, W(2)); E.box(x, top - FH * 0.8, 4, FH * 0.8, C["bata"]); E.gable(x, 4, top - FH * 0.8, 1.2, RF[2], eave=0.2)
    for i in range(3):
        E.box(x + 0.4 + i * 1.5, top - FH * 0.8 - 1.1, 0.1, 1.1, hx("6a6a70"), width=0)
    door(E, x + 0.4); win(E, x + 2.4, E.gy - 1.6); tandon(E, x + 3, top - FH * 0.8 - 0.4)
    label(E, x, 4, "K3 Rumah tumbuh", "lt 2 bata telanjang"); x += GAP + 6
    # K4 rumah L
    top = E.wall(x, 3, 1, W(3)); E.gable(x, 3, top, 1.3, RF[1], eave=0.2); E.wall(x + 3, 2.5, 1, shade(W(3), 0.92)); E.shed(x + 3, 2.5, top + 0.4, top + 0.9, RF[1])
    door(E, x + 3.6); win(E, x + 0.9, E.gy - 1.6); E.tree(x + 6.2, 1.3, 3.8)
    label(E, x, 6, "K4 Rumah L", "halaman + pohon mangga"); x += GAP + 8
    # K5 rumah warung
    top = E.wall(x, 4, 1, W(4)); E.gable(x, 4, top, 1.3, RF[0], eave=0.2)
    E.box(x + 0.3, E.gy - 1.7, 2.6, 1.7, hx("4a4a4a")); E.box(x + 0.4, E.gy - 0.9, 2.4, 0.9, C["kaca"]); E.shed(x - 0.2, 3.6, top + 0.3, top + 0.9, hx("3a7ac0"))
    for i in range(6):
        E.box(x + 0.4 + i * 0.4, top + 0.9, 0.3, 0.5, [hx("e85a5a"), hx("f2c230"), hx("3a7ac0")][i % 3], width=0)
    door(E, x + 3.0, w=0.8); sign(E, x + 0.3, top - 0.05 + 0.25, 2.6, 0.45, "WARUNG BU SUM", col=hx("c83a3a"), fg=(255, 255, 255), size=9)
    label(E, x, 4, "K5 Rumah warung", "depan etalase + renceng"); x += GAP + 6
    # K6 rumah gang sempit
    top = E.wall(x, 2.5, 2, W(5)); E.gable(x, 2.5, top, 1.1, RF[3], eave=0.2); E.balcony(x, 2.5, 1, hx("3a3a3a")); door(E, x + 0.8, w=0.9); win(E, x + 0.7, E.gy - FH - 1.6, 1.1)
    E.d.line((E.X(x - 0.5), E.Y(top + 0.3), E.X(x + 3), E.Y(top + 1.2)), fill=INK, width=2)   # kabel
    label(E, x, 2.5, "K6 Gang sempit", "2 lt, balkon besi"); x += GAP + 4.5
    # K7 rumah kopel
    top = E.wall(x, 6, 1, W(6)); E.box(x + 3, top, 3, FH, W(7)); E.hip(x, 6, top, 1.3, RF[0], eave=0.3)
    door(E, x + 0.4); win(E, x + 1.7, E.gy - 1.6); door(E, x + 4.6, col=hx("2a5a8a")); win(E, x + 3.3, E.gy - 1.6)
    E.box(x + 2.95, top, 0.1, FH, INK, width=0); label(E, x, 6, "K7 Rumah kopel", "2 keluarga, 1 atap, beda cat"); x += GAP + 8
    # K8 rumah bata + pagar tembok
    top = E.wall(x, 4.5, 1, C["bata"]); E.hip(x, 4.5, top, 1.4, RF[2], eave=0.3); door(E, x + 1.8, col=hx("2f6a4a")); win(E, x + 0.4, E.gy - 1.6); win(E, x + 3.3, E.gy - 1.6)
    E.box(x - 0.6, E.gy - 1.0, 5.7, 1.0, hx("d8d0c0")); E.box(x + 1.6, E.gy - 1.0, 1.4, 1.0, hx("3a3a3a"), width=1)
    label(E, x, 4.5, "K8 Bata + pagar tembok", "kanopi baja ringan"); x += GAP + 7
    E.note("Tiap rumah kampung = tipe + warna dinding (8) + warna atap (4) + 1-3 tambahan (jemuran, tandon, pot, motor, sangkar burung, parabola, "
           "kandang ayam, bendera 17-an). Kusen hijau tua atau biru. Dinding kampung diberi kotor di kaki & lumut di sisi utara.")
    E.im.save(os.path.join(KAT, "fasad_kampung.png"))


def fasad_perum():
    GAP = 1.6
    E = Elev("x", "Katalog fasad: rumah Perumahan Bukit Asri P1-P6", 76, 11, s=16, ground=1.6)
    x = 1
    # P1 minimalis
    top = E.wall(x, 7, 2, hx("f2eee6")); E.box(x + 4, top - 0.3, 3, 0.3, hx("4a5058")); E.box(x - 0.2, top, 4.5, 0.3, hx("4a5058"))
    E.box(x + 0.3, E.gy - FH - 1.5, 3.2, 1.3, C["kaca"]); E.box(x + 4.5, E.gy - 1.8, 2.2, 1.8, hx("8a5a34"))
    win(E, x + 4.5, E.gy - FH - 1.6, 2, 1.2, kusen=hx("2a2c30")); car_side(E, x + 7.3)
    E.box(x - 0.4, E.gy - 1.0, 11, 0.12, hx("2a2c30"), width=0)
    label(E, x, 11, "P1 Minimalis", "atap datar, kaca besar, carport"); x += GAP + 12
    # P2 klasik
    top = E.wall(x, 8, 2, hx("e6dcc8")); E.hip(x, 8, top, 2, hx("2a2c30"), eave=0.5); E.columns(x + 2.4, 3.2, 2, top + 0.2, hx("faf8f2"))
    E.gable(x + 2.2, 3.6, top + 0.1, 1.0, hx("faf8f2"), eave=0.1); door(E, x + 3.5, col=hx("8a5a34"), w=1.0, h=2.0)
    for wx in (0.5, 6.3):
        win(E, x + wx, E.gy - 1.7, 1.1, 1.2); win(E, x + wx, E.gy - FH - 1.7, 1.1, 1.2)
    label(E, x, 8, "P2 Klasik", "pilar putih, limas hitam"); x += GAP + 10
    # P3 tropis
    top = E.wall(x, 7, 2, hx("e6dcc8")); E.hip(x, 7, top, 1.6, hx("5a6a80"), eave=1.0)
    E.box(x, E.gy - FH, 7, 0.25, hx("8a5a34")); E.box(x + 0.4, E.gy - FH - 1.6, 6.2, 1.2, hx("8a5a34")); E.box(x + 0.6, E.gy - FH - 1.4, 5.8, 0.8, C["kaca"], width=1)
    door(E, x + 3, col=hx("8a5a34")); E.tree(x + 8, 1.2, 3.6)
    label(E, x, 8, "P3 Tropis", "kayu, limas menjorok"); x += GAP + 10.5
    # P4 sudut L
    top = E.wall(x, 5, 2, hx("f2eee6")); E.hip(x, 5, top, 1.8, hx("4a5058")); E.wall(x + 5, 4, 1, hx("c8c2b8")); E.shed(x + 5, 4, E.gy - FH - 0.2, E.gy - FH, hx("4a5058"))
    win(E, x + 0.6, E.gy - 1.7, 1.2, 1.2); win(E, x + 2.8, E.gy - FH - 1.7, 1.2, 1.2); door(E, x + 6.2, col=hx("8a5a34")); car_side(E, x + 9.2, "3a6aa8")
    label(E, x, 12, "P4 Rumah sudut", "L, taman, 2 mobil"); x += GAP + 13.5
    # P5 industrial
    top = E.wall(x, 7, 2, hx("3a3c40")); E.box(x - 0.2, top - 0.25, 7.4, 0.25, hx("2a2c30"))
    for i in range(10):
        E.box(x + 0.3 + i * 0.35, E.gy - FH - 1.8, 0.2, 1.6, hx("8a5a34"), width=0)
    E.box(x + 4, E.gy - FH - 1.6, 2.6, 1.3, C["kaca"]); E.box(x + 0.4, E.gy - 1.9, 3, 1.9, hx("9a9a96")); door(E, x + 5, col=hx("8a5a34"))
    label(E, x, 7, "P5 Industrial", "hitam, roster kayu"); x += GAP + 9
    # P6 mediterania
    top = E.wall(x, 7, 2, hx("f2e6d0")); E.hip(x, 7, top, 1.4, hx("d0703a"), eave=0.5)
    for wx in (0.6, 2.9, 5.2):
        E.d.pieslice((E.X(x + wx), E.Y(E.gy - FH - 1.9), E.X(x + wx + 1.2), E.Y(E.gy - FH - 0.7)), 180, 360, fill=hx("7a4a2a"), outline=INK)
        E.box(x + wx, E.gy - FH - 1.3, 1.2, 1.0, C["kaca"])
    E.d.pieslice((E.X(x + 2.8), E.Y(E.gy - 2.6), E.X(x + 4.2), E.Y(E.gy - 1.2)), 180, 360, fill=hx("8a5a34"), outline=INK); E.box(x + 2.8, E.gy - 1.9, 1.4, 1.9, hx("8a5a34"))
    label(E, x, 7, "P6 Mediterania", "lengkung, genteng oranye")
    E.note("Perumahan: bersih, halaman rumput, pagar besi hitam / tembok rendah batu alam, lampu taman. Variasi: warna dinding (putih tulang, abu hangat, krem), "
           "atap (abu tua, hitam, biru batu, oranye P6), 1-2 mobil, ayunan, kolam ikan, ring basket di carport.")
    E.im.save(os.path.join(KAT, "fasad_perumahan.png"))


def fasad_ruko():
    GAP = 2.0
    E = Elev("x", "Katalog fasad: ruko & bangunan komersial pusat kota", 86, 13, s=15, ground=1.6)
    x = 1
    def rolling(x, w):
        E.box(x, E.gy - 1.9, w, 1.9, hx("9aa0a6"))
        for i in range(8):
            E.d.line((E.X(x), E.Y(E.gy - 1.9 + i * 0.24), E.X(x + w), E.Y(E.gy - 1.9 + i * 0.24)), fill=hx("7a8088"), width=1)
    # R1 ruko lama
    top = E.wall(x, 3.2, 2, hx("e0dcd2")); E.box(x - 0.1, top - 0.3, 3.4, 0.3, hx("bcbab4")); rolling(x + 0.2, 2.8)
    win(E, x + 0.4, E.gy - FH - 1.4, 2.4, 0.9, kusen=hx("8a8a86")); sign(E, x + 0.1, E.gy - FH + 0.05, 3, 0.5, "TOKO SUMBER REJEKI", col=hx("c83a3a"), fg=(255, 255, 255), size=8)
    E.box(x + 2.6, E.gy - FH - 0.6, 0.5, 0.4, hx("d8d8d8"), width=1)
    label(E, x, 3.2, "R1 Ruko lama", "rolling, nako, AC karat"); x += GAP + 5
    # R2 ruko baru
    top = E.wall(x, 3.6, 3, hx("bcbab4")); E.box(x + 0.2, E.gy - 3 * FH + 0.2, 3.2, 2 * FH - 0.4, C["kaca"]); E.box(x + 0.2, E.gy - 1.9, 3.2, 1.9, C["kaca"])
    sign(E, x + 0.2, E.gy - FH + 0.05, 3.2, 0.55, "CELLULAR 88", col=hx("2a6ac0"), fg=(255, 255, 255), size=9)
    label(E, x, 3.6, "R2 Ruko baru", "kaca, neon box"); x += GAP + 5.2
    # R3 ruko gandeng
    top = E.wall(x, 6.4, 2, hx("ece2c4")); rolling(x + 0.2, 2.8); E.box(x + 3.4, E.gy - 1.9, 2.8, 1.9, C["kaca"])
    sign(E, x + 0.2, E.gy - FH + 0.05, 6, 0.55, "TOKO MAS & ELEKTRONIK JAYA", col=hx("f2c230"), fg=(40, 30, 20), size=9)
    for i in range(3):
        win(E, x + 0.5 + i * 2, E.gy - FH - 1.4, 1.4, 1.0)
    label(E, x, 6.4, "R3 Ruko gandeng", "2 unit jadi 1 toko"); x += GAP + 8
    # R4 ruko balkon 3 lantai
    top = E.wall(x, 3.4, 3, hx("e8d8c0")); E.balcony(x, 3.4, 1, hx("3a7a5a")); E.balcony(x, 3.4, 2, hx("3a7a5a")); rolling(x + 0.3, 2.8)
    for f in (1, 2):
        win(E, x + 0.8, E.gy - f * FH - 1.5, 1.8, 1.0)
    E.shed(x - 0.2, 3.8, E.gy - FH + 0.1, E.gy - FH + 0.6, hx("c8503a")); label(E, x, 3.4, "R4 Ruko balkon", "3 lt, kanopi seng warna"); x += GAP + 5.4
    # R5 hotel melati / kos
    top = E.wall(x, 3.2, 4, hx("ece2c4"))
    for f in range(4):
        win(E, x + 0.5, E.gy - f * FH - 1.5, 1.0, 1.0); win(E, x + 1.8, E.gy - f * FH - 1.5, 1.0, 1.0)
    E.box(x + 3.2, E.gy - 4 * FH + 0.5, 0.6, 6, hx("c83a3a"))
    for i, ch in enumerate("HOTEL"):
        E.d.text((E.X(x + 3.3), E.Y(E.gy - 4 * FH + 0.8 + i * 1.1)), ch, font=font(12, True), fill=(255, 255, 255))
    door(E, x + 1.0); label(E, x, 3.8, "R5 Hotel melati / kos", "4 lt, papan vertikal"); x += GAP + 5.6
    # R6 bank
    top = E.wall(x, 6, 5, hx("d8e0e8")); E.box(x + 0.2, E.gy - 5 * FH + 0.2, 5.6, 4 * FH, C["kaca"])
    for i in range(1, 4):
        E.box(x + i * 1.5, E.gy - 5 * FH + 0.2, 0.1, 4 * FH, hx("8a9aa8"), width=0)
    E.columns(x + 0.8, 4.4, 4, E.gy - FH, C["putih"]); sign(E, x + 1.2, E.gy - FH - 0.1, 3.6, 0.6, "BANK WIRA", col=hx("1e4a8a"), fg=(255, 255, 255), size=11)
    E.box(x + 5.4, E.gy - 1.6, 0.6, 1.6, hx("c8c8cc")); label(E, x, 6, "R6 Kantor bank", "kaca 5 lt, ATM samping"); x += GAP + 7.6
    # R7 rumah makan padang
    top = E.wall(x, 5, 1, hx("f0e0b0")); E.poly([(x - 0.5, top), (x + 5.5, top), (x + 5.8, top - 2.2), (x + 2.5, top - 0.9), (x - 0.8, top - 2.2)], hx("7a3a1a"))
    E.box(x + 0.3, E.gy - 1.8, 4.4, 1.8, C["kaca"]); sign(E, x + 0.4, top + 0.1, 4.2, 0.6, "RM PADANG SALERO", col=hx("7a1a1a"), fg=(250, 220, 120), size=9)
    for i in range(4):
        E.box(x + 0.6 + i * 1.0, E.gy - 1.5, 0.7, 0.4, hx("e8a040"), width=1)
    label(E, x, 5, "R7 RM Padang", "atap gonjong, etalase piring"); x += GAP + 6.8
    # MM minimarket
    top = E.wall(x, 6, 1, hx("f6f6f2")); E.box(x - 0.2, top - 1.0, 6.4, 1.0, hx("2a5ab0"))
    for i, c in enumerate(["f2c230", "c83a3a"]):
        E.box(x - 0.2, top - 0.3 + i * 0.15, 6.4, 0.15, hx(c), width=0)
    E.d.text((E.X(x + 1.6), E.Y(top - 0.9)), "INDOMURAH", font=font(13, True), fill=hx("f2c230"))
    E.box(x + 0.3, E.gy - 1.9, 5.4, 1.9, C["kaca"]); motor_side(E, x + 6.3, "3a6aa8")
    label(E, x, 6, "MM Indomurah", "kaca penuh, parkir depan"); x += GAP + 8.6
    # PK lahan parkir
    E.box(x, E.gy - 1.6, 1.6, 1.6, hx("d8d0c0")); sign(E, x + 1.8, E.gy - 2.6, 0.9, 0.9, "P", col=hx("2a5ab0"), fg=(255, 255, 255), size=14)
    E.box(x + 2.15, E.gy - 1.7, 0.2, 1.7, hx("5a5a5a"), width=0); car_side(E, x + 3); motor_side(E, x + 6.4)
    label(E, x, 8, "PK Lahan parkir", "pos jaga, papan P")
    E.note("Pusat kota: tiap ruko punya papan nama sendiri (lihat lembar papan nama), kanopi seng warna (merah, biru, hijau, kuning), AC outdoor, "
           "tralis, kabel. Baris belakang ruko = gedung lebih tinggi (hotel, kantor). Lantai 1 terbuka ke trotoar, lantai 2-3 hunian.")
    E.im.save(os.path.join(KAT, "fasad_ruko.png"))


def fasad_desa():
    GAP = 1.6
    E = Elev("x", "Katalog fasad: rumah panggung bantaran, rumah desa, rumah pesisir", 66, 10, s=16, ground=1.6)
    x = 1
    def panggung(x, w, wall, roof, stilt=1.0):
        for i in range(int(w) + 1):
            E.box(x + i * w / int(w) - 0.1, E.gy - stilt, 0.2, stilt, hx("6a4a30"), width=1)
        E.box(x, E.gy - stilt - FH * 0.9, w, FH * 0.9, wall)
        for i in range(int(w * 3)):
            E.d.line((E.X(x + i / 3), E.Y(E.gy - stilt - FH * 0.9), E.X(x + i / 3), E.Y(E.gy - stilt)), fill=shade(wall, 0.85), width=1)
        return E.gy - stilt - FH * 0.9
    top = panggung(x, 3, hx("9a7a56"), None); E.shed(x - 0.3, 3.6, top - 0.2, top + 0.2, hx("8a5a44")); win(E, x + 0.4, top + 0.4, 0.8, 0.7); E.box(x + 1.8, top + 0.3, 0.9, 1.6, hx("6a4a30"))
    E.box(x + 3, E.gy - 1, 1.2, 0.15, hx("6a4a30")); label(E, x, 4, "B1 Panggung papan", "seng karat"); x += GAP + 6
    top = panggung(x, 3, hx("c8b088"), None, 1.2); E.gable(x, 3, top, 1.0, hx("2a6ac0"), eave=0.3); win(E, x + 1.8, top + 0.4, 0.8, 0.7); jemuran(E, x + 3.2, 1.6)
    label(E, x, 4.6, "B2 Panggung triplek", "atap terpal biru"); x += GAP + 6.5
    top = panggung(x, 4, hx("8a9098"), None, 0.8); E.gable(x, 4, top, 1.2, hx("8a5a44"), eave=0.3); win(E, x + 0.4, top + 0.4); win(E, x + 2.4, top + 0.4); pot(E, x + 4.3)
    label(E, x, 4, "B3 Panggung seng", "dinding seng tambal"); x += GAP + 6.5
    # D1 rumah panggung kayu desa (Sukamekar)
    top = panggung(x, 5, hx("a87a4a"), None, 0.9); E.gable(x, 5, top, 1.8, hx("5a3a2a"), eave=0.6, tymp=hx("c89a6a"))
    for wx in (0.5, 3.4):
        win(E, x + wx, top + 0.4, 1.0, 0.8)
    E.box(x - 0.6, E.gy - 0.9, 0.6, 0.12, hx("6a4a30")); label(E, x, 5, "D1 Rumah panggung desa", "kayu, gevel ukir"); x += GAP + 7
    # D2 rumah limasan sawah
    top = E.wall(x, 5, 1, hx("f0e8d0")); E.hip(x, 5, top, 1.8, hx("a8523a"), eave=0.8); door(E, x + 2, col=hx("6a4a30")); win(E, x + 0.5, E.gy - 1.6); win(E, x + 3.6, E.gy - 1.6)
    E.box(x - 0.8, E.gy - 0.5, 1.4, 0.5, hx("c8b070")); label(E, x, 5, "D2 Limasan sawah", "bale-bale bambu"); x += GAP + 7
    # D3 rumah bilik bambu
    top = E.wall(x, 4, 1, hx("d8c08a"))
    for i in range(12):
        E.d.line((E.X(x), E.Y(top + i * 0.18), E.X(x + 4), E.Y(top + i * 0.18)), fill=hx("b8a06a"), width=1)
    E.gable(x, 4, top, 1.3, hx("8a7a5a"), eave=0.3); door(E, x + 1.5, col=hx("8a6a48")); label(E, x, 4, "D3 Bilik bambu", "anyaman, atap ijuk"); x += GAP + 6
    # N1 rumah nelayan
    top = E.wall(x, 4, 1, hx("7ab0d0")); E.gable(x, 4, top, 1.2, hx("c84a3a"), eave=0.3); door(E, x + 0.5, col=hx("f2c230")); win(E, x + 2.4, E.gy - 1.6, kusen=hx("f2f2f2"))
    E.box(x + 4.3, E.gy - 0.6, 2.4, 0.6, hx("c84a3a")); E.box(x + 4.3, E.gy - 0.75, 2.4, 0.15, hx("f2c230"), width=0)
    label(E, x, 6.5, "N1 Rumah nelayan", "cat terang, jaring, perahu"); x += GAP + 8
    # N2 warung pantai
    for i in range(4):
        E.box(x + i * 1.4, E.gy - 2.4, 0.15, 2.4, hx("8a6a48"), width=0)
    E.shed(x - 0.3, 4.6, E.gy - 2.6, E.gy - 2.2, hx("c8a050")); E.box(x + 0.2, E.gy - 0.9, 3.8, 0.9, hx("3a8ac0"))
    sign(E, x + 0.3, E.gy - 2.2, 3.6, 0.45, "SEAFOOD", col=hx("ffffff"), fg=hx("3a8ac0"), size=9)
    label(E, x, 4.5, "N2 Warung pantai", "rumbia, terbuka")
    E.note("Bantaran: tambal-sulam, tiap rumah beda bahan. Desa (Sukamekar, Tegalsari, Pandansari): kayu & genteng tanah, halaman tanah luas, kandang ayam. "
           "Pesisir: cat terang (biru, hijau laut, kuning), jaring ikan dijemur, perahu di depan rumah.")
    E.im.save(os.path.join(KAT, "fasad_desa_pesisir.png"))


# ============================================================ PAPAN NAMA
def papan_sheet():
    items = [(b["nama"], p) for b in KD.B for p in b["papan"] if p["ukuran"] != "-"]
    cols, cw, rh = 3, 470, 92
    rows = math.ceil(len(items) / cols)
    im = Image.new("RGB", (cols * cw + 20, rows * rh + 70), (238, 236, 230)); d = ImageDraw.Draw(im)
    d.text((14, 14), "Lembar papan nama & spanduk (warna, teks, gaya). Ukuran dalam petak, posisi relatif bangunan.", font=font(16, True), fill=INK)
    for i, (nama, p) in enumerate(items):
        cx, cy = 10 + (i % cols) * cw, 50 + (i // cols) * rh
        bg, fg = hx(p["bg"]), hx(p["fg"])
        txt = p["teks"]; f = font(15, True)
        while d.textbbox((0, 0), txt, font=f)[2] > cw - 60 and f.size > 9:
            f = font(f.size - 1, True)
        tw = d.textbbox((0, 0), txt, font=f)[2]
        bw = min(cw - 30, tw + 30)
        d.rectangle((cx + 6, cy + 6, cx + 6 + bw, cy + 42), fill=bg, outline=INK, width=2)
        d.text((cx + 6 + (bw - tw) / 2, cy + 14), txt, font=f, fill=fg)
        d.text((cx + 6, cy + 48), nama[:58], font=font(11, True), fill=INK)
        d.text((cx + 6, cy + 63), (p["gaya"] + " | " + p["ukuran"] + " | " + p["posisi"])[:78], font=font(10), fill=(80, 80, 80))
    im.save(os.path.join(KAT, "papan_nama.png"))


# ============================================================ ATURAN TAPAK
def aturan_tapak():
    s = 22
    im = Image.new("RGB", (3 * 14 * s + 80, 16 * s + 140), (250, 248, 242)); d = ImageDraw.Draw(im)
    d.text((16, 12), "Aturan tapak: posisi bangunan & objek terhadap jalan (dilihat dari atas, jalan selalu di bawah = DEPAN)", font=font(15, True), fill=INK)
    def lot(ox, title, w, dep, setback, zones, props):
        X = lambda x: ox + (x + 7) * s; Y = lambda y: 50 + y * s
        d.rectangle((X(-7), Y(13), X(7), Y(16)), fill=C["aspal"])
        d.text((X(-6.5), Y(14)), "JALAN", font=font(12, True), fill=(250, 250, 250))
        d.rectangle((X(-7), Y(12), X(7), Y(13)), fill=C["paving"])
        d.rectangle((X(-6), Y(1), X(6), Y(12)), fill=C["rumput"], outline=(150, 150, 140), width=2)   # kavling
        for (x0, y0, x1, y1, col, t) in zones:
            d.rectangle((X(x0), Y(y0), X(x1), Y(y1)), fill=col, outline=(120, 120, 110))
            d.text((X(x0) + 4, Y(y0) + 3), t, font=font(10, True), fill=INK)
        top = 12 - setback - dep
        d.rectangle((X(-w / 2), Y(top), X(w / 2), Y(top + dep)), fill=hx("e8d8b8"), outline=INK, width=3)
        d.text((X(-w / 2) + 5, Y(top) + 5), "BANGUNAN", font=font(11, True), fill=INK)
        d.rectangle((X(-0.6), Y(top + dep) - 4, X(0.6), Y(top + dep) + 4), fill=hx("c4783c"))   # pintu
        d.text((X(0.8), Y(top + dep) - 16), "pintu", font=font(10, True), fill=hx("a0502a"))
        for (x, y, t, col) in props:
            d.ellipse((X(x) - 6, Y(y) - 6, X(x) + 6, Y(y) + 6), fill=col, outline=INK)
            d.text((X(x) + 8, Y(y) - 7), t, font=font(10), fill=INK)
        d.line((X(7.3), Y(top + dep), X(7.3), Y(12)), fill=(200, 40, 40), width=2)
        d.text((X(5.3), Y(top + dep + setback / 2) - 6), f"{setback} p", font=font(10, True), fill=(200, 40, 40))
        t1, t2 = title.split(": ", 1)
        d.text((X(-7), Y(16) + 6), t1, font=font(13, True), fill=INK); d.text((X(-7), Y(16) + 24), t2, font=font(12), fill=(70, 70, 70))
    lot(16, "Kampung (K1-K8): mundur 1-1.5, teras langsung ke gang", 6, 5, 1.5,
        [(-6, 10.5, 6, 12, hx("d8d0c0"), "teras / semen"), (3.5, 3, 6, 10, hx("cfe0b0"), "samping: jemuran")],
        [(-2.5, 11.2, "kursi plastik", hx("d23a3a")), (2, 11.3, "pot", hx("5f8f4a")), (-4.5, 9, "motor", hx("3a6aa8")), (4.7, 5, "jemuran", hx("f2c230")),
         (0, 2, "kamar mandi / sumur (belakang)", hx("78b0d6")), (-5, 2.5, "kandang ayam", hx("c8a878"))])
    lot(16 + 14 * s + 10, "Perumahan (P1-P6): mundur 3-4, carport di sisi", 7, 6, 3.5,
        [(-6, 8.5, -2.6, 12, hx("b8b8b2"), "carport"), (-2.4, 8.5, 6, 12, hx("b8d090"), "taman depan")],
        [(-4.3, 10.3, "mobil", hx("e8e8e8")), (2.5, 10.5, "lampu taman", hx("f2e2a0")), (4.5, 11.6, "pagar besi", hx("2a2c30")), (0, 11.6, "gerbang", hx("2a2c30")),
         (4, 3, "kolam ikan / ayunan", hx("78b0d6"))])
    lot(16 + 2 * (14 * s + 10), "Ruko (R1-R7, MM): nempel trotoar, parkir di depan", 10, 8, 0.6,
        [(-6, 11.4, 6, 12, hx("c8c2b2"), "teras ruko")],
        [(-3, 12.5, "motor parkir liar", hx("3a6aa8")), (3.5, 12.5, "papan kaki A", hx("f2c230")), (0, 3.2, "papan nama di atas pintu", hx("c83a3a")),
         (5, 6, "AC outdoor (samping/lt2)", hx("d8d8d8")), (-5, 6, "tangga ke lt 2", hx("a8a8a0"))])
    d.text((16, 16 * s + 94), "Aturan: pintu & fasad selalu menghadap jalan terdekat; sisi samping boleh polos; objek pendukung tidak boleh di badan jalan;", font=font(12), fill=(70, 70, 70))
    d.text((16, 16 * s + 110), "jarak antar-rumah minimal 0.4 (kampung) / 1.5 (perumahan); rumah di sudut menghadap jalan yang lebih besar.", font=font(12), fill=(70, 70, 70))
    im.save(os.path.join(KAT, "aturan_tapak.png"))


# ============================================================ INTERIOR
def gambar_interior():
    for it in ID.I:
        s = 22 if max(it["w"], it["h"]) <= 16 else 16 if it["w"] <= 30 else 13
        p = Plan("x", it["w"], it["h"], s, it["nama"])
        for e in it["isi"]:
            if e[0] == "R":
                _, x, y, w, h, kind, lab = e; p.room(x, y, w, h, kind, lab, 11 if s < 20 else 12)
        for e in it["isi"]:
            if e[0] == "F":
                _, x, y, w, h, kind, lab, _f = e; p.f(x, y, w, h, kind, lab, 9)
            elif e[0] == "S":
                _, x, y, w, h, t, v = e; p.stairs(x, y, w, h, t, v)
            elif e[0] == "D":
                _, x, y, n, v, t = e; p.door(x, y, n, v, t)
        furn = [e for e in it["isi"] if e[0] == "F" and e[6]]
        for e in it["isi"]:
            if e[0] == "M":
                mx, my = e[1], e[2]
                for f in furn:   # titik di atas perabot berlabel: geser ke pojok kiri atas perabot supaya label terbaca
                    if f[1] <= mx <= f[1] + f[3] and f[2] <= my <= f[2] + f[4]:
                        mx, my = f[1] + 0.45, f[2] + 0.45; break
                p.mark(mx, my, e[3])
        p.note("Suasana: " + it["suasana"] + ".  " + "  ".join(f"{e[3]} = {e[4]}." for e in it["isi"] if e[0] == "M"))
        p.im.save(os.path.join(INT, f"detail_{it['id']}.png"))


# ============================================================ GUIDE
def tulis_guide():
    L = ["# 91. Detail Tiap Bangunan di Peta", "",
         "Semua bangunan bernama di peta kota (1-36) dan peta daerah (40-64): bentuk, warna, papan nama, objek pendukung beserta",
         "posisinya, kelebihan & kekurangan untuk pemain, jam buka, dan interiornya (kalau bisa dimasuki). Tipe rumah umum ada di segmen 90.", "",
         "**Posisi objek** ditulis (x, z) dalam petak dari tengah fasad depan: x ke kanan dilihat dari jalan, z positif = ke arah jalan,",
         "z negatif = ke belakang. Sama dengan bingkai lokal game (depan = +z).", "",
         "![Lembar papan nama](../peta/katalog/papan_nama.png)", ""]
    for b in KD.B:
        L.append(f"## {b['no']}. {b['nama']}")
        L.append("")
        L.append("| | |"); L.append("|---|---|")
        L.append(f"| Wilayah | {b['wilayah']} |")
        L.append(f"| Bentuk | {b['bentuk']} |")
        L.append(f"| Warna | {', '.join(b['warna'])} |")
        if b["jam"]:
            L.append(f"| Jam | {b['jam']} |")
        if b["plus"]:
            L.append(f"| Kelebihan | {'; '.join(b['plus'])} |")
        if b["minus"]:
            L.append(f"| Kekurangan | {'; '.join(b['minus'])} |")
        if b["interior"]:
            L.append(f"| Interior | {b['interior']} |")
        L.append("")
        ps = [p for p in b["papan"] if p["ukuran"] != "-"]
        if ps:
            L.append("| Papan nama | Warna | Gaya | Ukuran | Letak |"); L.append("|---|---|---|---|---|")
            for p in ps:
                L.append(f"| **{p['teks']}** | latar `{p['bg']}`, huruf `{p['fg']}` | {p['gaya']} | {p['ukuran']} | {p['posisi']} |")
            L.append("")
        if b["props"]:
            L.append("Objek pendukung: " + "; ".join(f"{n} `({x:g}, {z:g})`" if (x, z) != (0, 0) else n for n, (x, z) in b["props"]) + ".")
            L.append("")
    open(os.path.join(GUIDE, "91-bangunan-detail.md"), "w").write("\n".join(L))
    L = ["# 92. Interior Detail (isi & posisi objek)", "",
         "Denah dalam bangunan yang bisa dimasuki, lengkap dengan posisi tiap objek. Melengkapi segmen 81 (sekolah) dan 82 (rumah Om Darto,",
         "markas, Toko Buku Pena, Bengkel Mas Fajar). Koordinat (x, y) dalam petak dari pojok kiri atas denah; pintu masuk utama di sisi bawah",
         "(= sisi jalan) kecuali disebut lain. Grid tipis = 1 petak. Interior = scene terpisah, boleh lebih luas dari tampak luar.", "",
         "Aturan umum: jalur jalan di dalam minimal 1.6 petak; objek interaksi diberi lampu sorot kecil / ikon; tiap interior punya",
         "minimal 1 objek hidup (NPC, kipas berputar, TV menyala, kucing) dan 1 suara khas.", ""]
    for it in ID.I:
        L.append(f"## {it['nama']}"); L.append("")
        L.append(f"![{it['nama']}](../peta/interior/detail_{it['id']}.png)"); L.append("")
        L.append(f"Ukuran {it['w']} x {it['h']} petak. Suasana: {it['suasana']}.  ")
        L.append(f"Kelebihan: {'; '.join(it['plus'])}. Kekurangan: {'; '.join(it['minus'])}."); L.append("")
        L.append("| Objek | Posisi (x, y) | Ukuran | Fungsi |"); L.append("|---|---|---|---|")
        for e in it["isi"]:
            if e[0] == "F" and e[6]:
                _, x, y, w, h, kind, lab, fung = e
                L.append(f"| {lab} | ({x:g}, {y:g}) | {w:g} x {h:g} | {fung or '-'} |")
            elif e[0] == "S":
                L.append(f"| {e[5]} | ({e[1]:g}, {e[2]:g}) | {e[3]:g} x {e[4]:g} | pindah lantai |")
        ms = [e for e in it["isi"] if e[0] == "M"]
        if ms:
            L.append(""); L.append("Titik interaksi: " + "; ".join(f"**{e[3]}** ({e[1]:g}, {e[2]:g}) {e[4]}" for e in ms) + ".")
        L.append("")
    open(os.path.join(GUIDE, "92-interior-detail.md"), "w").write("\n".join(L))


if __name__ == "__main__":
    fasad_kampung(); fasad_perum(); fasad_ruko(); fasad_desa(); papan_sheet(); aturan_tapak(); gambar_interior(); tulis_guide()
    print("selesai", len(KD.B), "bangunan,", len(ID.I), "interior")
