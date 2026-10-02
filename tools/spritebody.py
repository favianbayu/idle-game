#!/usr/bin/env python3
"""Drawing engine shared by the character builders (arya_build.py, indah_build.py).

A body is a list of rounded shapes (ellipsoids, tapered tubes, lofts of
horizontal slices, rounded boxes) sampled densely on their surfaces. Each
frame they are turned to the facing direction, projected to the 96 x 128
frame with the isometric camera and kept per pixel by depth, so limbs always
grow out of the body. Each pixel then takes a tone of its material's 4-tone
ramp by how much it faces the light (top left), and a 1 px outline is drawn
round the silhouette and wherever a nearer piece overlaps a farther one,
never at a joint.

A character module supplies its Style (materials, outline colour, parts) and
its shapes; paints may give single points a material code with a fixed tone
(Style.code(mat, tone)) for drawn details such as seams, straps and pockets.
"""
import math

import numpy as np

FW, FH = 96, 128
PIVOT = (48, 116)
DIRS = ["SE", "S", "SW", "W", "NW", "N", "NE", "E"]
YAW = {"S": 0, "SE": 45, "E": 90, "NE": 135, "N": 180, "NW": -135, "W": -90, "SW": -45}
ELEV = math.radians(24)
BOB = [0, 1, -1, 0, 1, -1]              # screen px, + is down: lowest on "down", highest on "passing"
LIGHT = np.array([-0.55, 0.62, 0.56])   # screen right, up, toward us: light from the top left
LIGHT = LIGHT / np.linalg.norm(LIGHT)
STEP = 0.32                             # surface sampling, px: dense enough to leave no holes


# a left foot through the walk (the Prompt Sprite phase table): ankle forward
# (z), lifted off the ground, toe pitch in degrees (+ toe up: on the heel;
# - heel up: on the toe); the right foot runs three frames behind
STEPS = [
    (7.0, 0.0, 18.0),       # contact A: ahead, heel down, toe up
    (3.6, 0.0, 0.0),        # down A: flat, taking the weight
    (0.0, 0.0, 0.0),        # passing A: straight under the body
    (-6.6, 0.0, -30.0),     # contact B: behind, pushing off its toes
    (-4.8, 2.4, -40.0),     # down B: lifting off
    (1.0, 3.2, -10.0),      # passing B: swinging through, lifted
]
WALK_DIP = 1            # the hips ride this much lower walking than standing (whole px: a head layer follows)


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


class Style:
    """A character's materials (4-tone ramps, dark to light), outline colour and parts
    (a part is one piece for internal lines: the joints inside a part never get one)."""

    def __init__(self, outline, ramp, parts, lit=("skin",)):
        self.outline = outline
        self.ramp = ramp
        self.mat = {m: i + 1 for i, m in enumerate(ramp)}       # 0 = empty
        self.part = {p: i + 1 for i, p in enumerate(parts)}
        self.lit = lit                                          # materials kept readable in shadow

    def code(self, mat, tone=None):
        """Material code: the material, and optionally a fixed tone (0-3) for drawn lines."""
        return self.mat[mat] * 10 + (0 if tone is None else tone + 1)


class Pose:
    """What one walk frame (k = 0-5, None = standing) asks of the body: the bob,
    each foot's step and each arm's swing (-1 back .. +1 forward)."""

    def __init__(self, k):
        self.k = k
        walking = k is not None
        bob = BOB[k] if walking else 0
        self.lift = -bob - (WALK_DIP if walking else 0.0)  # whole body up (+) or down (-)
        self.legs = {}
        for side in (+1, -1):                              # +1 = the character's left
            if walking:
                ph = (k + (0 if side > 0 else 3)) % 6
                z, up, pitch = STEPS[ph]
            else:
                z, up, pitch = 0.0, 0.0, 0.0
            self.legs[side] = (z, up, pitch)
        # arms swing against the legs: an arm goes forward with the opposite foot
        self.arms = {}
        for side in (+1, -1):
            if walking:
                swing = STEPS[(k + (3 if side > 0 else 0)) % 6][0] / STEPS[0][0]
            else:
                swing = 0.0
            self.arms[side] = swing


def leg_joints(step, hip, x, thigh, shin, ankle_y, heel, toe):
    """Ankle and knee for a foot step (z, lift, pitch): the ankle's height follows
    from what touches the ground (the heel, the toe or the whole sole), the knee
    from a two-bone solve, bending forward. Returns (ankle, knee, pitch in radians)."""
    z, up, pitch = step
    pr = math.radians(pitch)
    if pr > 0:
        y = ankle_y * math.cos(pr) + heel * math.sin(pr)
    elif pr < 0:
        y = ankle_y * math.cos(pr) + toe * math.sin(-pr)
    else:
        y = ankle_y
    ankle = np.array([x, y + up, z])
    d = ankle - hip
    dist = np.linalg.norm(d)
    dist_c = min(dist, thigh + shin - 1e-3)
    a = (thigh ** 2 - shin ** 2 + dist_c ** 2) / (2 * dist_c)
    h = math.sqrt(max(thigh ** 2 - a * a, 0.0))
    u = d / dist
    fwd = np.array([0.0, 0.0, 1.0]) - u * u[2]
    fwd = fwd / (np.linalg.norm(fwd) + 1e-9)
    knee = hip + u * a + fwd * h
    if dist > thigh + shin:
        ankle = hip + u * (thigh + shin)
    return ankle, knee, pr


# ---------------------------------------------------------------- geometry
def rot_x(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def rot_y(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def rot_z(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def frame_of(axis):
    """An orthonormal frame whose y axis runs along axis."""
    y = axis / np.linalg.norm(axis)
    ref = np.array([0.0, 0.0, 1.0]) if abs(y[2]) < 0.9 else np.array([1.0, 0.0, 0.0])
    x = np.cross(y, ref)
    x /= np.linalg.norm(x)
    z = np.cross(x, y)
    return np.stack([x, y, z], 1)


class Shape:
    """Surface samples of one primitive: points, normals, a material (a name, or a
    code per point) and the part it belongs to."""

    def __init__(self, P, N, mat, part):
        self.P, self.N, self.mat, self.part = P, N, mat, part


def ellipsoid(c, r, part, mat, R=np.eye(3), paint=None):
    r = np.asarray(r, float)
    n_t = max(8, int(math.pi * r.max() / STEP))
    n_p = max(12, int(2 * math.pi * r.max() / STEP))
    t, p = np.meshgrid(np.linspace(0, math.pi, n_t), np.linspace(0, 2 * math.pi, n_p, endpoint=False))
    u = np.stack([np.sin(t) * np.cos(p), np.cos(t), np.sin(t) * np.sin(p)], -1).reshape(-1, 3)
    local = u * r
    n = u / r
    n /= np.linalg.norm(n, axis=1, keepdims=True)
    P = local @ R.T + c
    N = n @ R.T
    return Shape(P, N, paint(local) if paint else mat, part)


def tube(p0, p1, r0, r1, part, mat, paint=None, caps=(True, True)):
    """A tapered tube from p0 to p1 with round ends; paint(t, angle) may colour it."""
    p0, p1 = np.asarray(p0, float), np.asarray(p1, float)
    axis = p1 - p0
    length = np.linalg.norm(axis)
    F = frame_of(axis)
    rmax = max(r0, r1)
    n_l = max(2, int(length / STEP) + 1)
    n_a = max(12, int(2 * math.pi * rmax / STEP))
    t, a = np.meshgrid(np.linspace(0, 1, n_l), np.linspace(0, 2 * math.pi, n_a, endpoint=False))
    t, a = t.ravel(), a.ravel()
    r = r0 + (r1 - r0) * t
    local = np.stack([r * np.cos(a), t * length, r * np.sin(a)], 1)
    n = np.stack([np.cos(a), np.zeros_like(a), np.sin(a)], 1)
    P = local @ F.T + p0
    N = n @ F.T
    shapes = [Shape(P, N, paint(t, a) if paint else mat, part)]
    if caps[0]:
        shapes.append(ellipsoid(p0, (r0, r0, r0), part, mat))
    if caps[1]:
        shapes.append(ellipsoid(p1, (r1, r1, r1), part, mat))
    return shapes


def loft(y0, y1, half, part, mat, paint=None, centre=None):
    """A body of horizontal elliptical slices: half(y) = (half width, half depth),
    centre(y) = (x, z) of the slice (default 0, 0)."""
    ys = np.arange(y0, y1 + 1e-6, STEP * 0.8)
    pts, nrm = [], []
    for y in ys:
        a, b = half(y)
        if a <= 0 or b <= 0:
            continue
        cx, cz = centre(y) if centre else (0.0, 0.0)
        n_a = max(16, int(2 * math.pi * max(a, b) / STEP))
        ang = np.linspace(0, 2 * math.pi, n_a, endpoint=False)
        x, z = a * np.cos(ang), b * np.sin(ang)
        a2, b2 = half(y + 0.5)
        da = (a2 - a) / 0.5
        n = np.stack([np.cos(ang) / a, -da * np.ones_like(ang) / max(a, 1e-3), np.sin(ang) / b], 1)
        pts.append(np.stack([x + cx, np.full_like(x, y), z + cz], 1))
        nrm.append(n / np.linalg.norm(n, axis=1, keepdims=True))
    # close the bottom and top with discs
    for y, sgn in ((ys[0], -1), (ys[-1], 1)):
        a, b = half(y)
        cx, cz = centre(y) if centre else (0.0, 0.0)
        rr, ang = np.meshgrid(np.arange(0, 1, STEP / max(a, b, 1)), np.linspace(0, 2 * math.pi, 64))
        x, z = (rr * a * np.cos(ang)).ravel(), (rr * b * np.sin(ang)).ravel()
        pts.append(np.stack([x + cx, np.full_like(x, y), z + cz], 1))
        nrm.append(np.tile([0.0, sgn, 0.0], (len(x), 1)))
    P = np.concatenate(pts)
    N = np.concatenate(nrm)
    return Shape(P, N, paint(P, N) if paint else mat, part)


def superbox(c, half, R, part, mat, power=4.0, paint=None):
    """A box with rounded edges (a superellipsoid), sampled on its surface."""
    half = np.asarray(half, float)
    step = STEP / half.max()
    g = np.arange(-1, 1 + 1e-6, step)
    faces = []
    for ax in range(3):
        for sgn in (-1, 1):
            u, v = np.meshgrid(g, g)
            f = np.zeros((u.size, 3))
            others = [i for i in range(3) if i != ax]
            f[:, ax] = sgn
            f[:, others[0]] = u.ravel()
            f[:, others[1]] = v.ravel()
            faces.append(f)
    q = np.concatenate(faces)
    q = q / (np.abs(q) ** power).sum(1, keepdims=True) ** (1 / power)
    local = q * half
    n = np.sign(q) * np.abs(q) ** (power - 1) / half
    n /= np.linalg.norm(n, axis=1, keepdims=True)
    P = local @ R.T + c
    N = n @ R.T
    return Shape(P, N, paint(local) if paint else mat, part)


# ---------------------------------------------------------------- drawing
def render(shapes, yaw, style):
    """Project the shapes for a facing (yaw, radians) and keep the nearest per pixel."""
    P = np.concatenate([s.P for s in shapes])
    N = np.concatenate([s.N for s in shapes])
    M = np.concatenate([np.full(len(s.P), style.code(s.mat)) if isinstance(s.mat, str) else s.mat
                        for s in shapes])
    Q = np.concatenate([np.full(len(s.P), style.part[s.part]) for s in shapes])
    SID = np.concatenate([np.full(len(sh.P), i + 1) for i, sh in enumerate(shapes)])
    c, s = math.cos(yaw), math.sin(yaw)
    wx = P[:, 0] * c + P[:, 2] * s
    wz = -P[:, 0] * s + P[:, 2] * c
    nx = N[:, 0] * c + N[:, 2] * s
    nz = -N[:, 0] * s + N[:, 2] * c
    sx = PIVOT[0] + wx
    sy = PIVOT[1] - P[:, 1] + wz * math.sin(ELEV)
    depth = wz * math.cos(ELEV) + P[:, 1] * math.sin(ELEV)
    # how much each point faces the camera, which looks down at 24 degrees
    vnz = nz * math.cos(ELEV) + N[:, 1] * math.sin(ELEV)
    light = nx * LIGHT[0] + N[:, 1] * LIGHT[1] + nz * LIGHT[2]
    # faces and hands stay readable on the shadow side too
    lit = np.isin(M // 10, [style.mat[m] for m in style.lit if m in style.mat])
    light = np.where(lit, 0.55 * light + 0.32, light)
    ix, iy = np.floor(sx).astype(int), np.floor(sy).astype(int)
    ok = (ix >= 0) & (ix < FW) & (iy >= 0) & (iy < FH) & (vnz > -0.2)
    order = np.argsort(depth[ok])
    sel = np.nonzero(ok)[0][order]
    buf = dict(depth=np.full((FH, FW), -1e9), mat=np.zeros((FH, FW), int),
               light=np.zeros((FH, FW)), part=np.zeros((FH, FW), int), sid=np.zeros((FH, FW), int),
               facing=np.zeros((FH, FW)))
    buf["depth"][iy[sel], ix[sel]] = depth[sel]
    buf["mat"][iy[sel], ix[sel]] = M[sel]
    buf["light"][iy[sel], ix[sel]] = light[sel]
    buf["part"][iy[sel], ix[sel]] = Q[sel]
    buf["sid"][iy[sel], ix[sel]] = SID[sel]
    buf["facing"][iy[sel], ix[sel]] = vnz[sel]
    return buf


def despeckle(tone, mat, free):
    """A lone pixel of a tone none of its 4 neighbours of the same material share
    takes their most common tone: clean bands, no single-pixel noise."""
    out = tone.copy()
    nbs = [(np.roll(np.roll(tone, dy, 0), dx, 1), np.roll(np.roll(mat, dy, 0), dx, 1))
           for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0))]
    same = sum(((nm == mat) & (nt == tone)).astype(int) for nt, nm in nbs)
    lone = free & (same == 0) & (mat > 0)
    for y, x in zip(*np.nonzero(lone)):
        votes = [int(nt[y, x]) for nt, nm in nbs if nm[y, x] == mat[y, x]]
        if votes:
            out[y, x] = max(set(votes), key=votes.count)
    return out


def shade(buf, style):
    """Each material on its 4-tone ramp by how much the surface faces the light."""
    mat, light = buf["mat"], buf["light"]
    tone = np.digitize(light, [-0.05, 0.38, 0.78])
    img = np.zeros((FH, FW, 4), np.uint8)
    base, forced = mat // 10, mat % 10
    tone = despeckle(tone, mat, forced == 0)
    tone = np.where(forced > 0, forced - 1, tone)
    for name, i in style.mat.items():
        sel = base == i
        if sel.any():
            img[sel, :3] = np.array([hexrgb(c) for c in style.ramp[name]])[tone[sel]]
            img[sel, 3] = 255
    return img


def outline(img, buf, style):
    """1 px outline round the silhouette and where a nearer piece overlaps a farther one."""
    a = img[..., 3] > 0
    depth, part, facing = buf["depth"], buf["part"], buf["facing"]
    line = np.zeros_like(a)
    for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
        na = np.roll(np.roll(a, dy, 0), dx, 1)
        nd = np.roll(np.roll(depth, dy, 0), dx, 1)
        npart = np.roll(np.roll(part, dy, 0), dx, 1)
        nface = np.roll(np.roll(facing, dy, 0), dx, 1)
        line |= a & ~na
        other = a & na & (npart != part)
        # a nearer piece in front of this pixel: this pixel takes the line
        line |= other & (nd > depth + 2.2)
        # two pieces side by side where one turns its edge to us (an arm by the
        # shirt, the hem over the trousers); where they grow into each other
        # (shoulder into sleeve) both face us and no line is drawn
        line |= other & (nd >= depth - 0.3) & (np.minimum(facing, nface) < 0.32)
    img[line, :3] = hexrgb(style.outline)
    return img


def paste(img, layer, dy, where=None):
    """Lay a full-frame layer over img, moved down by dy whole pixels; where (a
    mask in img's frame) limits which of its pixels land."""
    out = img.copy()
    src = layer[max(0, -dy):FH - max(0, dy)]
    sel = src[..., 3] > 0
    if where is not None:
        sel &= where[max(0, dy):FH - max(0, -dy)]
    region = out[max(0, dy):FH - max(0, -dy)]
    region[sel] = src[sel]
    return out
