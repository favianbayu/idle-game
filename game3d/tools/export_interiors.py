"""Ekspor data interior guide 92 (docs/desain-sma/peta/interior_data.py) ke JSON untuk game Three.js.

Pakai:  python export_interiors.py <folder berisi interior_data.py> <output.json>
Koordinat petak dari pojok kiri atas denah; pintu masuk utama biasanya di sisi bawah (= sisi jalan).
"""
import json, sys
sys.path.insert(0, sys.argv[1])
import interior_data as d

out = []
for i in d.I:
    isi = []
    for e in i["isi"]:
        k = e[0]
        if k == "R": isi.append(dict(t="R", x=e[1], y=e[2], w=e[3], h=e[4], kind=e[5], label=e[6]))
        elif k == "F": isi.append(dict(t="F", x=e[1], y=e[2], w=e[3], h=e[4], kind=e[5], label=e[6], fn=e[7]))
        elif k == "D": isi.append(dict(t="D", x=e[1], y=e[2], n=e[3], v=bool(e[4]), label=e[5]))
        elif k == "M": isi.append(dict(t="M", x=e[1], y=e[2], n=e[3], desc=e[4]))
        elif k == "S": isi.append(dict(t="S", x=e[1], y=e[2], w=e[3], h=e[4], label=e[5], v=bool(e[6])))
    out.append(dict(id=i["id"], name=i["nama"], w=i["w"], h=i["h"], isi=isi, plus=i["plus"], minus=i["minus"], mood=i["suasana"]))
json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, separators=(",", ":"))
print(len(out), "interior")
