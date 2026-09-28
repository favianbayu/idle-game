"""Expansion cities: names, signature foods and visual identity.

Every city gets its own environment per stage (landmark, house style, street
props) and its own variant of each stage building. Foods listed here are the
city specials; the first ones also appear on the shop signs.
"""

CITIES = {
    "jakarta": {
        "name": "Jakarta",
        "culture": "Betawi",
        "landmark": "Monas",
        "props": ["ondel_ondel", "bajaj"],
        "specials": [
            {"id": "kerak_telor", "name": "Kerak Telor"},
            {"id": "soto_betawi", "name": "Soto Betawi"},
            {"id": "nasi_uduk", "name": "Nasi Uduk"},
            {"id": "ketoprak", "name": "Ketoprak"},
            {"id": "asinan_betawi", "name": "Asinan Betawi"},
        ],
        # Shop sign text per stage (must fit the sign; stage 3/4 keep the big title).
        "signs": {1: "KERAK TELOR", 2: "SOTO BETAWI * KETOPRAK * UDUK",
                  3: "NASI UDUK", 4: "RESTO", 5: None},
        "accent": ("#e0662a", "#a8401a"),      # oranye Betawi
        "accent2": ("#3f8a4a", "#285e32"),     # hijau Betawi
    },
    "bandung": {
        "name": "Bandung",
        "culture": "Sunda",
        "landmark": "Gedung Sate & Tangkuban Perahu",
        "props": ["pinus", "angklung"],
        "specials": [
            {"id": "batagor", "name": "Batagor"},
            {"id": "seblak", "name": "Seblak"},
            {"id": "surabi", "name": "Surabi"},
            {"id": "mie_kocok", "name": "Mie Kocok"},
            {"id": "cireng", "name": "Cireng"},
        ],
        "signs": {1: "BATAGOR", 2: "SEBLAK * SURABI * CIRENG",
                  3: "MIE KOCOK", 4: "RESTO", 5: None},
        "accent": ("#3f8a6a", "#285e48"),      # hijau teh
        "accent2": ("#e2c678", "#b0923e"),     # bambu
    },
    "bali": {
        "name": "Bali",
        "culture": "Bali",
        "landmark": "Gunung Agung & pantai",
        "props": ["penjor", "kamboja", "canang"],
        "specials": [
            {"id": "sate_lilit", "name": "Sate Lilit"},
            {"id": "ayam_betutu", "name": "Ayam Betutu"},
            {"id": "nasi_campur_bali", "name": "Nasi Campur Bali"},
            {"id": "lawar", "name": "Lawar"},
            {"id": "tipat_cantok", "name": "Tipat Cantok"},
        ],
        "signs": {1: "SATE LILIT", 2: "BETUTU * LAWAR * TIPAT",
                  3: "NASI CAMPUR", 4: "RESTO", 5: None},
        "accent": ("#b5553c", "#843826"),      # bata merah
        "accent2": ("#e0b04a", "#a8801e"),     # prada emas
    },
    "surabaya": {
        "name": "Surabaya",
        "culture": "Jawa Timur (Suroboyoan)",
        "landmark": "Jembatan Suramadu & Tugu Pahlawan",
        "props": ["becak", "bendera"],
        "specials": [
            {"id": "rawon", "name": "Rawon"},
            {"id": "lontong_balap", "name": "Lontong Balap"},
            {"id": "rujak_cingur", "name": "Rujak Cingur"},
            {"id": "tahu_tek", "name": "Tahu Tek"},
            {"id": "sate_klopo", "name": "Sate Klopo"},
        ],
        "signs": {1: "RAWON", 2: "LONTONG BALAP * TAHU TEK",
                  3: "SATE KLOPO", 4: "RESTO", 5: None},
        "accent": ("#c9432a", "#8a1f12"),      # merah
        "accent2": ("#2e4a7a", "#1c2f52"),     # biru pelabuhan
    },
}

CITY_ORDER = ["jakarta", "bandung", "bali", "surabaya"]
