"""Ekspor daerah luar kota (guide 86) dari docs/desain-sma/peta/peta_dunia.py ke JSON untuk game Three.js.

Pakai:  python export_dunia.py <folder berisi peta_dunia.py> <output.json>
peta_dunia() dijalankan apa adanya (seed tetap). Semua pemanggilan area/jalan/bangunan/pohon/penanda di LUAR kota
dicatat (isi kota dilewati, karena kota sudah punya kota.json). Koordinat sama dengan peta (petak, x timur, y selatan).
"""
import json, math, sys
sys.path.insert(0, sys.argv[1])
import peta_organik as po
import peta_dunia as pd
from shapely.geometry import Point

R = dict(areas=[], polys=[], roads=[], rivers=[], rails=[], bldgs=[], trees=[], marks=[], labels=[])
rnd = lambda v: round(v, 2)
pts_ = lambda pts: [[rnd(x), rnd(y)] for x, y in pts]
S = {"skip": False, "kind": None}

M = po.Map
_area, _river, _rail, _road, _bldg, _mark, _text, _sawah, _forest = M.area, M.river, M.rail, M.road, M.bldg, M.mark, M.text, M.sawah, M.forest

def area(self, pts, color, smooth=True, alpha=255, outline=None, block=False, width=2):
    poly = _area(self, pts, color, smooth, alpha, outline, block, width)
    if not S["skip"]: R["areas"].append(dict(pts=pts_(poly.exterior.coords), color=list(color)[:3], alpha=alpha, kind=S["kind"], block=block))
    return poly

def sawah(self, pts, angle=20):
    S["kind"] = "sawah"; _sawah(self, pts, angle); S["kind"] = None
    if not S["skip"]: R["areas"][-1]["angle"] = angle

def forest(self, pts, n, tint=(78, 120, 64), r=(1.0, 2.0)):
    S["kind"] = "forest"; p = _forest(self, pts, n, tint, r); S["kind"] = None; return p

def river(self, pts, width):
    sm = _river(self, pts, width)
    if not S["skip"]: R["rivers"].append(dict(pts=pts_(sm), w=width))
    return sm

def rail(self, pts):
    sm = _rail(self, pts)
    if not S["skip"]: R["rails"].append(dict(pts=pts_(sm)))
    return sm

def road(self, pts, kind="jalan", width=None, closed=False, name=None):
    sm = _road(self, pts, kind, width, closed, name)
    if not S["skip"]: R["roads"].append(dict(pts=pts_(self.roads[-1][0]), w=self.roads[-1][1], kind=kind, name=name, closed=closed))
    return sm

def bldg(self, cx, cy, w, h, ang=0, color=(200, 180, 160), roof=True, block=True, outline=(60, 50, 44)):
    g = _bldg(self, cx, cy, w, h, ang, color, roof, block, outline)
    if not S["skip"]: R["bldgs"].append(dict(x=rnd(cx), y=rnd(cy), w=rnd(w), h=rnd(h), a=round(math.radians(ang), 4), color=list(color)[:3], roof=roof))
    return g

def mark(self, x, y, num, desc, color=(196, 40, 40)):
    _mark(self, x, y, num, desc, color)
    if not S["skip"]: R["marks"].append(dict(x=x, y=y, n=num, desc=desc))

def text(self, x, y, t, size=13, bold=True, fill=(30, 30, 30), bg=None, center=True):
    _text(self, x, y, t, size, bold, fill, bg, center)
    if not S["skip"]: R["labels"].append(dict(x=x, y=y, t=t, big=size >= 20))

def trees(self, region, n, r=(0.8, 1.6), block=False):
    minx, miny, maxx, maxy = region.bounds
    tries = placed = 0
    while placed < n and tries < n * 30:
        tries += 1
        x, y = self.rng.uniform(minx, maxx), self.rng.uniform(miny, maxy)
        rr = self.rng.uniform(*r)
        g = Point(x, y).buffer(rr * 0.8)
        if region.contains(g) and self.free(g):
            self.rng.choice([0, 1])
            if not S["skip"]: R["trees"].append([rnd(x), rnd(y), rnd(rr)])
            placed += 1
            if block: self.blocked.append(g)

_isi = po.isi_kota
def isi_kota(m):
    S["skip"] = True
    try: return _isi(m)
    finally: S["skip"] = False

_rows, _poly = pd.rows, pd.poly_draw
def rows(m, pts, color, line, angle=0, step=2.2):
    S["kind"] = "teh"; p = _rows(m, pts, color, line, angle, step); S["kind"] = None
    R["areas"][-1]["angle"] = angle; return p
def poly_draw(m, g, fill, outline=None, hole=None, width=2):
    for p in getattr(g, "geoms", [g]):
        R["polys"].append(dict(pts=pts_(p.exterior.coords), holes=[pts_(i.coords) for i in p.interiors], color=list(fill)[:3]))
    return _poly(m, g, fill, outline, hole, width)

M.area, M.sawah, M.forest, M.river, M.rail, M.road, M.bldg, M.mark, M.text, M.trees = area, sawah, forest, river, rail, road, bldg, mark, text, trees
M.finish = lambda self, path, notes=(): None
po.isi_kota, pd.rows, pd.poly_draw = isi_kota, rows, poly_draw
pd.peta_dunia()
R["track"] = pts_(po.catmull(pd.TRACK, 14, closed=True)); R["pit"] = pts_(po.catmull(pd.PIT, 8))
R["bounds"] = [pd.X0, pd.Y0, pd.W, pd.H]
json.dump(R, open(sys.argv[2], "w"), separators=(",", ":"))
print({k: len(v) for k, v in R.items() if isinstance(v, list)})
