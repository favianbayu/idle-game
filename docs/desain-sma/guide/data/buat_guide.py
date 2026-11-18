"""Bangun segmen 35 (rutinitas), 36 (kado), 37 (event hati) dan data/npc.json dari data/*.py.

Pakai:  python3 buat_guide.py   (dari folder guide/data)
"""
import json, math, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from tempat import T, MODA
import npc_utama
import npc_lain  # noqa: F401  (mengisi N)
from npc_utama import N
from kado import ITEM, K
from event_hati import E, POLA, PAKAI_POLA

OUT = pathlib.Path(__file__).resolve().parent.parent
HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
HARI_PANJANG = dict(Sen="Senin", Sel="Selasa", Rab="Rabu", Kam="Kamis", Jum="Jumat", Sab="Sabtu", Min="Minggu")
COWOK_MUSLIM = {"dimas", "arga", "rizal", "tegar", "bram", "andra", "gilang", "bimo", "fajar", "jaka", "kobar", "om_darto",
                "pak_rt", "ujang", "rio", "kevin", "hendro", "wawan", "anton", "gunadi", "kyai_mahfud", "abah_karta",
                "serma_hadi", "sudarmaji", "wak_kodir", "kang_ujo", "mandor_sabar", "pak_yusuf", "mbah_darmo", "tito"}
WARN = []


def menit(s):
    h, m = s.split(".")
    return int(h) * 60 + int(m)


def norm(slot):
    a, b, tp, keg, anim, out, *o = slot
    return dict(mulai=a, selesai=b, tempat=tp, kegiatan=keg, anim=anim, outfit=out, **(o[0] if o else {}))


def jarak(a, b):
    ta, tb = T[a], T[b]
    return math.hypot(ta[1] - tb[1], ta[2] - tb[2])


def hari_slots(n, h):
    """Daftar slot untuk satu hari (Sen..Min) atau 'Libur'."""
    H = n["hari"]
    if h == "Libur":
        base = [norm(s) for s in H.get("M", H["S"])]
        for l in [norm(s) for s in H.get("L", [])]:
            la, lb = menit(l["mulai"]), menit(l["selesai"])
            base = [s for s in base if not (menit(s["mulai"]) < lb and menit(s["selesai"]) > la and menit(s["mulai"]) < menit(s["selesai"]))]
            base.append(l)
        return sorted(base, key=lambda s: (menit(s["mulai"]) - 240) % 1440)
    key = "S" if h in HARI[:5] else ("B" if h == "Sab" else "M")
    src = H.get(key) or H.get("S")
    out = [s for s in map(norm, src) if "h" not in s or h in s["h"].split()]
    if h == "Jum" and key == "S":   # sekolah pulang 11.30
        jum = []
        for s in out:
            a, b = menit(s["mulai"]), menit(s["selesai"])
            if a >= 690 and b <= 840 and a < b and n["id"] not in ("ujang", "iyah"):
                continue
            if s["tempat"].startswith("sma.") and a < 690 < b <= 840:
                s = dict(s, selesai="11.30")
            jum.append(s)
        if any(s["tempat"].startswith("sma.x") or s["tempat"] == "sma.xi1" for s in out):
            if n["id"] in COWOK_MUSLIM:
                jum.append(dict(mulai="11.45", selesai="12.45", tempat="masjid", kegiatan="Salat Jumat di Masjid Agung", anim="salat", outfit=list(n["outfit"])[0]))
            nxt = min((menit(s["mulai"]) for s in jum if menit(s["mulai"]) >= 765 and menit(s["mulai"]) < 1080), default=None)
            if nxt and nxt > 765:
                nx = next(s for s in sorted(jum, key=lambda s: menit(s["mulai"])) if menit(s["mulai"]) == nxt)
                dekat = nx["tempat"] if T[nx["tempat"]][3] in ("Kawasan Sekolah", "Pusat Kota", "Perkampungan Kenanga", "Kampung Bantaran") else n["rumah"]
                jum.append(dict(mulai="12.45" if n["id"] in COWOK_MUSLIM else "11.30", selesai="%02d.%02d" % divmod(nxt, 60),
                                tempat=dekat, kegiatan="Jumat pulang awal: makan siang & santai sebelum kegiatan sore", anim="makan" if dekat == n["rumah"] else "duduk",
                                outfit=list(n["outfit"])[0]))
        out = jum
    return sorted(out, key=lambda s: (menit(s["mulai"]) - 240) % 1440)


def rute(n, prev, s):
    if prev is None or prev == s["tempat"]:
        return None
    if prev.startswith("sma") and s["tempat"].startswith("sma"):
        return dict(moda="jalan", dari=prev, ke=s["tempat"], via="di dalam sekolah", menit=2)
    d = jarak(prev, s["tempat"])
    m = s.get("m") or n["moda"]
    if not s.get("m") and T[prev][3] == T[s["tempat"]][3] and m in ("angkot", "bus"):
        m = "jalan"
    if m in ("motor", "mobil", "angkot", "bus") and d < 10:
        m = "jalan"
    if m == "bus" and d < 60:
        m = "angkot"
    sp = MODA[m][1]
    return dict(moda=m, dari=prev, ke=s["tempat"], via=s.get("via", "jalan terdekat (pathfinding)"),
                jarak=round(d), menit=max(2, round(d / sp * 60)))


def cek(n, h, sl):
    for a, b in zip(sl, sl[1:]):
        ea = menit(a["selesai"]); sb = menit(b["mulai"])
        if (ea - sb) % 1440 not in (0,) and (sb - ea) % 1440 > 600:
            WARN.append(f"{n['id']} {h}: tumpang {a['mulai']}-{a['selesai']} / {b['mulai']}")
    for s in sl:
        if s["tempat"] not in T:
            WARN.append(f"{n['id']}: tempat tidak dikenal {s['tempat']}")
        if s["outfit"] not in n["outfit"]:
            WARN.append(f"{n['id']}: outfit tidak dikenal {s['outfit']}")


def koor(tp):
    t = T[tp]
    return f"{t[1]}, {t[2]}" + ("~" if t[4] else "")


# ------------------------------------------------------------------ JSON
data = dict(tempat={k: dict(nama=v[0], x=v[1], y=v[2], wilayah=v[3], perkiraan=v[4]) for k, v in T.items()},
            moda={k: dict(nama=v[0], petak_per_jam=v[1], jalur=v[2]) for k, v in MODA.items()},
            npc={}, item={k: dict(nama=v[0], harga=v[1], toko=v[2], kategori=v[3]) for k, v in ITEM.items()},
            event=[dict(npc=e[0], hati=e[1], judul=e[2], tempat=e[3], hari=e[4].split(), jam=e[5], bab_min=e[6], syarat=e[7], segmen=e[8]) for e in E])
for nid, n in N.items():
    n["id"] = nid
    jad = {}
    for h in HARI + ["Libur"]:
        sl = hari_slots(n, h)
        cek(n, h, sl)
        prev = sl[-1]["tempat"] if sl else None
        rows = []
        for s in sl:
            r = rute(n, prev, s)
            rows.append(dict(mulai=s["mulai"], selesai=s["selesai"], tempat=s["tempat"], kegiatan=s["kegiatan"], anim=s["anim"],
                             outfit=s["outfit"], rute=r))
            prev = s["tempat"]
        jad[h] = rows
    k = K.get(nid, {})
    data["npc"][nid] = dict(nama=n["nama"], rumah=n["rumah"], moda=n["moda"], outfit=n["outfit"], jadwal=jad,
                            kado=dict(favorit=k.get("fav", []), suka=k.get("suka", []), biasa=k.get("biasa", []),
                                      benci=k.get("benci", []), catatan=k.get("catatan", "")))
    for lst in ("fav", "suka", "biasa", "benci"):
        for it in k.get(lst, []):
            if it not in ITEM:
                WARN.append(f"{nid}: item tidak dikenal {it}")
for e in E:
    if e[3] not in T:
        WARN.append(f"event {e[0]} {e[1]}: tempat {e[3]}")
(OUT / "data" / "npc.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")

# ------------------------------------------------------------------ 35 rutinitas
GRUP = [("NPC utama cewek", ["nadia", "sekar", "laras", "uti", "sasha", "kirana", "mei", "wulan"]),
        ("NPC utama cowok", ["dimas", "arga", "rizal", "tegar", "jojo", "bram", "andra", "gilang"]),
        ("Keluarga, kampung & geng", ["om_darto", "cici", "bimo", "fajar", "jaka", "kobar", "narti", "pak_rt", "rio", "kevin"]),
        ("Staf & guru sekolah", ["ujang", "iyah", "ama", "hartini", "ratna", "hendro", "wawan", "sinta", "anton", "gunadi", "melati"]),
        ("NPC wilayah luar kota", ["kyai_mahfud", "abah_karta", "serma_hadi", "sudarmaji", "wak_kodir", "romlah", "kang_ujo",
                                   "mandor_sabar", "pak_yusuf", "mbak_sri", "mbah_darmo", "nek_sumi", "tito", "neng_ayu"])]
assert sorted(sum((g[1] for g in GRUP), [])) == sorted(N), set(N) ^ set(sum((g[1] for g in GRUP), []))

L = ["# 35. Rutinitas Harian NPC", "",
     "Jadwal per jam semua NPC bernama: **di mana** (tempat + koordinat petak), **sedang apa** (kegiatan + animasi), **pakai baju",
     "apa** (outfit), dan **lewat mana** ke tempat itu (moda, jalan, perkiraan waktu tempuh). Segmen ini dibangkitkan dari",
     "`guide/data/*.py` oleh `guide/data/buat_guide.py`. Versi mesin ada di `guide/data/npc.json` (semua hari Senin-Minggu dan",
     "Libur Panjang sudah dijabarkan, termasuk rute). Kalau ada yang diubah, ubah file data lalu jalankan ulang skripnya.", "",
     "## Aturan umum", "",
     "| Aturan | Isi |", "|---|---|",
     "| Jam game | 1 jam = 40 detik nyata. Hari mulai 06.00, pemain ketiduran kalau belum tidur jam 02.00. Slot sebelum 06.00 menentukan posisi NPC saat hari dimulai |",
     "| Jenis hari | **S** = Senin-Jumat, **B** = Sabtu, **M** = Minggu & tanggal merah, **Libur** = Libur Panjang (pakai M, ditambah slot khusus kalau ada). Kolom *hari* di slot membatasi slot ke hari tertentu |",
     "| Jumat | Sekolah pulang 11.30. Cowok muslim salat Jumat 11.45-12.45 di Masjid Agung, lalu pulang sampai slot sore berikutnya. Sudah dijabarkan di JSON |",
     "| Seragam | `sekolah` = putih abu Senin-Selasa & Kamis, Pramuka hari Rabu, batik hari Jumat (sesuai sekolah masing-masing) |",
     "| Hujan | Kalau hujan, outfit diganti `hujan` (kalau NPC punya) dan slot luar ruang (taman, lapangan, alun-alun) pindah ke tempat beratap terdekat atau rumah |",
     "| Bab | Slot yang menyebut bab (liga, track day, koki warkop) baru aktif setelah bab itu (segmen 04). Sebelumnya NPC tetap di slot sebelumnya |",
     "| Event | Event cerita di kalender (segmen 04) menimpa jadwal hari itu. Event hati (segmen 37) hanya muncul saat NPC ada di tempat & jam pemicu |",
     "| Rute | Kolom rute = cara NPC sampai ke tempat slot itu dari slot sebelumnya. NPC berangkat lebih awal sebesar waktu tempuh supaya tiba tepat jam mulai. Jarak < 10 petak selalu jalan kaki |",
     "| Koordinat | Petak, sama dengan peta kota/daerah. Tanda `~` = perkiraan (rumah, toko kecil): pakai pintu bangunan terdekat. Ruang sekolah `sma.*` memakai denah segmen 81/83 |",
     "",
     "### Moda perjalanan", "", "| Moda | Kecepatan (petak/jam game) | Jalur |", "|---|---|---|"]
L += [f"| {v[0]} | {v[1]} | {v[2]} |" for v in MODA.values()]
L += ["", "### Animasi", "",
      "`duduk`, `duduk_tulis`, `baca`, `ngobrol`, `makan`, `masak`, `jualan`, `kasir`, `sapu`, `jongkok`, `berdiri`, `jalan`, `lari`,",
      "`tidur`, `tidur_meja`, `tidur_kursi`, `salat`, `mengajar`, `gitar`, `piano`, `nyanyi`, `basket`, `futsal`, `olahraga`, `skate`,",
      "`silat`, `mancing`, `servis`, `naik_motor`, `sepeda`, `foto`, `gambar`, `lukis`, `hp`, `angkut`, `petik`, `jala`, `kerja_mesin`,",
      "`hilang` (NPC keluar peta, misal sekolah lain). Nama mengikuti segmen 71; animasi yang belum ada pakai yang paling mirip.", ""]

NAMA_HARI = dict(S="Senin-Jumat", B="Sabtu", M="Minggu & tanggal merah", L="Libur Panjang (tambahan, sisanya ikut Minggu)")
for gname, ids in GRUP:
    L += [f"## {gname}", ""]
    for nid in ids:
        n = N[nid]
        L += [f"### {n['nama']}", "",
              f"Rumah: **{T[n['rumah']][0]}** ({koor(n['rumah'])}). Moda utama: {MODA[n['moda']][0].lower()}.", "",
              "| Outfit | Isi |", "|---|---|"]
        L += [f"| `{k}` | {v} |" for k, v in n["outfit"].items()]
        for hk in ("S", "B", "M", "L"):
            if hk not in n["hari"]:
                continue
            L += ["", f"**{NAMA_HARI[hk]}**", "", "| Jam | Tempat (x, y) | Kegiatan | Anim | Outfit | Rute ke sini |", "|---|---|---|---|---|---|"]
            sl = [norm(s) for s in n["hari"][hk]]
            prev = sl[-1]["tempat"]
            for s in sl:
                r = rute(n, prev, s)
                rt = "" if r is None else (r["via"] if r["via"] == "di dalam sekolah" else
                                           f"{MODA[r['moda']][0]} dari {T[r['dari']][0].split(',')[0].split('(')[0].strip()}, {r['via']}, ±{r['menit']} mnt")
                hari = f" ({s['h'].replace(' ', ', ')})" if "h" in s else ""
                L.append(f"| {s['mulai']}-{s['selesai']}{hari} | {T[s['tempat']][0]} ({koor(s['tempat'])}) | {s['kegiatan']} | `{s['anim']}` | `{s['outfit']}` | {rt} |")
                if "h" not in s:
                    prev = s["tempat"]
        if nid not in ("ujang",) and "B" not in n["hari"] and nid in sum((g[1] for g in GRUP[2:]), []):
            L += ["", "Tanpa tabel Sabtu/Minggu: Sabtu, Minggu, dan libur memakai jadwal hari kerja di atas."]
        L.append("")
(OUT / "35-rutinitas-npc.md").write_text("\n".join(L), encoding="utf-8")

# ------------------------------------------------------------------ 36 kado
L = ["# 36. Kado", "",
     "Katalog item kado (harga & toko) dan selera tiap NPC. Aturan poin tetap segmen 03: **favorit +80, suka +45, biasa +20,",
     "benci -40**, kado di hari ulang tahun x4, maksimal 2 kado per minggu per tokoh. Item yang tidak ada di daftar tokoh = biasa,",
     "kecuali sampah (-40 untuk semua). Data mesin: `guide/data/npc.json` (`item` dan `npc.*.kado`).", "",
     "## Aturan tambahan", "",
     "| Aturan | Isi |", "|---|---|",
     "| Bungkus kado | Kertas kado di toko buku Rp 2.000: +5 poin (kecuali Jojo, yang benci kado dibungkus rapi) |",
     "| Kado yang sama | Item sama ke tokoh sama dalam 7 hari: poin setengah |",
     "| Di depan orang | Beberapa tokoh berubah reaksi kalau diberi di tempat ramai (lihat catatan Sasha, Bram, Serma Hadi) |",
     "| Kado buatan sendiri | Es kopi susu buatan pemain di warkop & Gelang Benang buatan sendiri dihitung +10 poin dari nilai biasanya |",
     "| Kiriman ibu | Paket bulanan dari ibu (kerupuk, sambal, beras) jadi item `kerupuk_desa`, gratis, disukai banyak NPC dewasa |",
     "| Rokok | Tidak bisa dibeli pemain (pelajar). Item ini hanya muncul dari event; semua NPC dewasa membencinya kalau datang dari pemain |",
     "", "## Katalog item", "", "| Id | Item | Harga | Beli di | Kategori |", "|---|---|---|---|---|"]
for k, v in ITEM.items():
    harga = "gratis / tidak dijual" if not v[1] else f"Rp {v[1]:,}".replace(",", ".")
    L.append(f"| `{k}` | {v[0]} | {harga} | {T[v[2]][0] if v[2] else '-'} | {v[3]} |")
L += ["", "## Selera tiap NPC", "", "| NPC | Favorit (+80) | Suka (+45) | Biasa (+20) | Benci (-40) | Catatan |", "|---|---|---|---|---|---|"]
nm = lambda ids: ", ".join(ITEM[i][0] for i in ids)
for gname, ids in GRUP:
    L.append(f"| **{gname}** | | | | | |")
    for nid in ids:
        k = K.get(nid)
        if k:
            L.append(f"| {N[nid]['nama']} | {nm(k['fav'])} | {nm(k['suka'])} | {nm(k.get('biasa', []))} | {nm(k['benci'])} | {k.get('catatan', '')} |")
(OUT / "36-kado.md").write_text("\n".join(L) + "\n", encoding="utf-8")

# ------------------------------------------------------------------ 37 event hati
L = ["# 37. Event Hati: Pemicu", "",
     "Daftar pemicu semua event hati dalam satu tabel. Adegan, pilihan, dan hasil tetap di segmen tokohnya (kolom *Segmen*).",
     "Game mengecek event saat pemain ngobrol dengan NPC: hati sudah cukup, event sebelumnya selesai, NPC & pemain di **tempat**",
     "pemicu, jam di dalam rentang **jam**, hari cocok, dan bab sudah sampai. Data mesin: `guide/data/npc.json` (`event`).", "",
     "## Aturan", "",
     "| Aturan | Isi |", "|---|---|",
     "| Urutan | Event 2 → 4 → 6 → 8. Hati tidak bisa naik melewati event yang belum selesai (poin ditahan di 99 dari hati berikutnya) |",
     "| Ikon | Ikon hati merah muda muncul di peta HP di tempat pemicu saat syarat terpenuhi |",
     "| Kelewatan | Kalau pemain tidak datang, event menunggu kesempatan berikutnya (tidak hilang), kecuali event bertanggal (pensi, final, banjir): yang bertanggal jadi versi 'telat' di kesempatan berikutnya dengan poin setengah |",
     "| Event 8 | Tokoh utama: Gelang Benang di inventori + pilih jalur romance → pacaran. Tanpa gelang / pilih sahabat → sahabat sejati. Tokoh pendukung & wilayah selalu jalur sahabat |",
     "| Jadwal | Tempat & jam pemicu dipilih dari rutinitas segmen 35, jadi NPC memang ada di sana pada jam itu |",
     "", "## Daftar pemicu", "", "| NPC | Hati | Judul | Tempat (x, y) | Hari | Jam | Bab min | Syarat lain | Segmen |", "|---|---|---|---|---|---|---|---|---|"]
for e in E:
    L.append(f"| {N[e[0]]['nama']} | {e[1]} | {e[2]} | {T[e[3]][0]} ({koor(e[3])}) | {e[4].replace(' ', ', ') or 'semua'} | {e[5] or 'kapan saja'} | {e[6] or '-'} | {e[7]} | {e[8]} |")
L += ["", "## NPC dengan pola event umum", "",
      "NPC berikut memakai pola 4 event dari segmen 30. Pemicunya: tempat & jam slot kerja utamanya di segmen 35, hari apa saja.", "",
      "| Hati | Pola |", "|---|---|"] + [f"| {k} | {v} |" for k, v in POLA.items()]
L += ["", "Berlaku untuk: " + ", ".join(N[i]["nama"] for i in PAKAI_POLA) + ". Event 8 memberi bonus permanen di segmen 30 / 33.", ""]
(OUT / "37-event-hati.md").write_text("\n".join(L), encoding="utf-8")

print("NPC", len(N), "item", len(ITEM), "event", len(E))
print("\n".join(WARN) if WARN else "tanpa peringatan")
