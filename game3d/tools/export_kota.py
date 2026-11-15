"""Ekspor tata letak peta kota dari docs/desain-sma/peta/peta_organik.py ke JSON untuk game Three.js.

Pakai:  python export_kota.py <folder berisi peta_organik.py> <output.json>
Fungsi peta_kota() dijalankan apa adanya (seed tetap), tapi tiap pemanggilan area/jalan/bangunan/pohon
dicatat, jadi game memakai tata letak yang persis sama dengan gambar peta_kota.png.
Koordinat dalam petak (x ke timur, y ke selatan).
"""
import json, math, random, sys
sys.path.insert(0, sys.argv[1])
import peta_organik as po
from shapely.geometry import Point

R = dict(areas=[], roads=[], rivers=[], rails=[], bldgs=[], trees=[], marks=[], labels=[])
rnd = lambda v: round(v, 2)
pts_ = lambda pts: [[rnd(x), rnd(y)] for x, y in pts]

M = po.Map
_area, _river, _rail, _road, _bldg, _mark, _text, _sawah = M.area, M.river, M.rail, M.road, M.bldg, M.mark, M.text, M.sawah

def area(self, pts, color, smooth=True, alpha=255, outline=None, block=False, width=2):
    poly = _area(self, pts, color, smooth, alpha, outline, block, width)
    R["areas"].append(dict(pts=pts_(poly.exterior.coords), color=list(color), alpha=alpha, kind=getattr(self, "_kind", None)))
    return poly

def sawah(self, pts, angle=20):
    self._kind = "sawah"; _sawah(self, pts, angle); self._kind = None
    R["areas"][-1]["angle"] = angle

def river(self, pts, width):
    sm = _river(self, pts, width); R["rivers"].append(dict(pts=pts_(sm), w=width)); return sm

def rail(self, pts):
    sm = _rail(self, pts); R["rails"].append(dict(pts=pts_(sm))); return sm

def road(self, pts, kind="jalan", width=None, closed=False, name=None):
    sm = _road(self, pts, kind, width, closed, name)
    R["roads"].append(dict(pts=pts_(self.roads[-1][0]), w=self.roads[-1][1], kind=kind, name=name, closed=closed)); return sm

def bldg(self, cx, cy, w, h, ang=0, color=(200, 180, 160), roof=True, block=True, outline=(60, 50, 44)):
    g = _bldg(self, cx, cy, w, h, ang, color, roof, block, outline)
    R["bldgs"].append(dict(x=rnd(cx), y=rnd(cy), w=rnd(w), h=rnd(h), a=round(math.radians(ang), 4), color=list(color))); return g

def mark(self, x, y, num, desc, color=(196, 40, 40)):
    _mark(self, x, y, num, desc, color); R["marks"].append(dict(x=x, y=y, n=num, desc=desc))

def text(self, x, y, t, size=13, bold=True, fill=(30, 30, 30), bg=None, center=True):
    _text(self, x, y, t, size, bold, fill, bg, center); R["labels"].append(dict(x=x, y=y, t=t, big=size >= 20))

def trees(self, region, n, r=(0.8, 1.6), block=False):
    # salinan Map.trees (urutan rng sama) yang juga mencatat posisi pohon
    minx, miny, maxx, maxy = region.bounds
    tries = placed = 0
    while placed < n and tries < n * 30:
        tries += 1
        x, y = self.rng.uniform(minx, maxx), self.rng.uniform(miny, maxy)
        rr = self.rng.uniform(*r)
        g = Point(x, y).buffer(rr * 0.8)
        if region.contains(g) and self.free(g):
            self.rng.choice([0, 1])
            R["trees"].append([rnd(x), rnd(y), rnd(rr)])
            placed += 1
            if block:
                self.blocked.append(g)

M.area, M.sawah, M.river, M.rail, M.road, M.bldg, M.mark, M.text, M.trees = area, sawah, river, rail, road, bldg, mark, text, trees
M.finish = lambda self, path, notes=(): None   # jangan timpa png asli
po.peta_kota()
R["size"] = [260, 180]
json.dump(R, open(sys.argv[2], "w"), separators=(",", ":"))
print({k: len(v) for k, v in R.items()})
