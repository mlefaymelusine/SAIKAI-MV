# A turning star sky as a real sphere of stars (C2, W2, the outro). Stars are directions in 3D; the sky turns about
# a pole; a pinhole camera (yaw, pitch, roll, fov) looks at it, and every star leaves a short arc of its own path
# behind it, so the turning reads as a vortex round the pole (v1 S37, user 10-24). The Milky Way is a band of faint
# light and fine stars across the sphere. The camera can follow a Blender camera (W2: the city, tilting up).
#   python v4/tools/starsky.py <shot> <outdir> [frame ...]       shot: c2 | w2 | outro
#   python v4/tools/starsky.py pole v4/src/data/outro_pole.json   (where the pole is on screen in the outro, per frame)
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

W, H, FPS = 1920, 1080, 30
rng = np.random.default_rng(37)

def hexc(h): h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)
ZENITH, HORIZON = hexc('#0c0e1e'), hexc('#262c52')
STAR, VIOLET, RED, WARM = hexc('#ece8f4'), hexc('#9a93ff'), hexc('#d62838'), hexc('#f2dcb4')

def unit(v): return v / np.linalg.norm(v, axis=-1, keepdims=True)
def rot(axis, a):
    axis = axis / np.linalg.norm(axis); x, y, z = axis; c, s = math.cos(a), math.sin(a); C = 1 - c
    return np.array([[c + x * x * C, x * y * C - z * s, x * z * C + y * s], [y * x * C + z * s, c + y * y * C, y * z * C - x * s], [z * x * C - y * s, z * y * C + x * s, c + z * z * C]])

# ---------- the sky: world frame x east, y north, z up ----------
POLE_EL = math.radians(48)
POLE = np.array([0, math.cos(POLE_EL), math.sin(POLE_EL)])
GAL = unit(np.array([0.55, -0.35, 0.76]))                     # the Milky Way's plane normal (sky frame)
N1, N2 = 15000, 8000
d1 = unit(rng.normal(size=(N1, 3)))
d2 = unit(rng.normal(size=(N2, 3)))
d2 = unit(d2 - np.outer(d2 @ GAL, GAL) * (1 - np.abs(rng.normal(0, 0.16, N2))[:, None].clip(0, 1)))   # pulled into the band
DIRS = np.vstack([d1, d2])
NS = len(DIRS)
mag = np.concatenate([rng.random(N1) ** 2.6, rng.random(N2) ** 4 * 0.32])  # 0..1, most faint
pick = rng.random(NS)
COL = np.tile(STAR, (NS, 1))
COL[pick < 0.16] = VIOLET; COL[(pick >= 0.16) & (pick < 0.19)] = WARM; COL[(pick >= 0.19) & (pick < 0.215)] = RED
COL = COL * (0.85 + 0.15 * rng.random((NS, 1)))
TW = rng.random(NS) * 6.28

# Milky Way glow: an equirect texture in the sky frame (lon, lat) of a soft band with clumps
TEX_W, TEX_H = 1024, 512
lon = (np.arange(TEX_W) + 0.5) / TEX_W * 2 * np.pi - np.pi
lat = np.pi / 2 - (np.arange(TEX_H) + 0.5) / TEX_H * np.pi
LON, LAT = np.meshgrid(lon, lat)
V = np.stack([np.cos(LAT) * np.cos(LON), np.cos(LAT) * np.sin(LON), np.sin(LAT)], -1)
g = V @ GAL
fbm = sum(ndimage.gaussian_filter(rng.random((TEX_H, TEX_W)), s, mode='wrap') * w for s, w in ((40, 1.0), (14, 0.6), (5, 0.35)))
fbm = (fbm - fbm.min()) / (fbm.max() - fbm.min())
lane = ndimage.gaussian_filter(np.clip((fbm - 0.5) * 3, 0, 1), 6, mode='wrap')
MW = np.exp(-(g / 0.2) ** 2) * (0.3 + 0.8 * fbm ** 1.4) * (1 - 0.55 * lane * np.exp(-(g / 0.07) ** 2))
MW = np.clip(MW, 0, None)
MW_COL = hexc('#8f8cc0')

def sky_rot(theta): return rot(POLE, theta)

# ---------- camera ----------
def basis(yaw, pitch, roll):
    """yaw: azimuth from north toward east; pitch: elevation; roll about the view axis (radians)"""
    fwd = np.array([math.sin(yaw) * math.cos(pitch), math.cos(yaw) * math.cos(pitch), math.sin(pitch)])
    right = unit(np.cross(fwd, [0, 0, 1.0]))
    up = np.cross(right, fwd)
    if roll:
        R_ = rot(fwd, roll); right, up = R_ @ right, R_ @ up
    return fwd, right, up

class Splats:
    """bilinear splats gathered over many calls, then summed in one bincount per channel"""
    def __init__(self): self.i, self.w, self.c = [], [], []
    def add(self, x, y, col, a):
        m = (x > -2) & (x < W + 1) & (y > -2) & (y < H + 1) & (a > 0.002)
        x, y, col, a = x[m], y[m], col[m], a[m]
        x0 = np.floor(x).astype(np.int64); y0 = np.floor(y).astype(np.int64); fx = x - x0; fy = y - y0
        for dx, dy, w in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
            xi, yi = x0 + dx, y0 + dy
            k = (xi >= 0) & (xi < W) & (yi >= 0) & (yi < H)
            self.i.append((yi * W + xi)[k]); self.w.append((w * a)[k]); self.c.append(col[k])
    def image(self):
        out = np.zeros((H * W, 4))
        if self.i:
            i, w, c = np.concatenate(self.i), np.concatenate(self.w), np.concatenate(self.c)
            out[:, 3] = np.bincount(i, w, H * W)
            for ch in range(3): out[:, ch] = np.bincount(i, w * c[:, ch], H * W)
        return out.reshape(H, W, 4)

PY, PX = np.mgrid[0:H, 0:W].astype(float)
def render(theta, cam, trail=0.0, exposure=1.0, mw=1.0, horizon=True, grade=None, bg=None):
    """theta: sky angle now; cam = (yaw, pitch, roll, hfov); trail: angle the trails cover behind each star"""
    if isinstance(cam, dict):                                  # a Blender camera, as written by roof.py (variant T)
        fwd, right, up, hfov = (np.array(cam[k], float) for k in ('fwd', 'right', 'up', 'hfov'))
        hfov = float(hfov)
    else:
        yaw, pitch, roll, hfov = cam
        fwd, right, up = basis(yaw, pitch, roll)
    tf = math.tan(hfov / 2)
    # background: sky gradient by elevation of each pixel's ray + the Milky Way
    u = (PX + 0.5 - W / 2) / (W / 2) * tf; v = -(PY + 0.5 - H / 2) / (W / 2) * tf
    rays = fwd[None, None] + u[..., None] * right[None, None] + v[..., None] * up[None, None]
    rays = rays / np.linalg.norm(rays, axis=-1, keepdims=True)
    el = rays[..., 2]
    k = np.clip(el / 0.75, 0, 1) ** 0.6 if horizon else np.ones_like(el)
    img = HORIZON * (1 - k[..., None]) + ZENITH * k[..., None] if bg is None else bg(el, u / tf)
    Rs = sky_rot(theta)
    sr = rays @ Rs                                              # into the sky frame (R^-1 = R^T)
    lo = np.arctan2(sr[..., 1], sr[..., 0]); la = np.arcsin(np.clip(sr[..., 2], -1, 1))
    tx = (lo + np.pi) / (2 * np.pi) * TEX_W - 0.5; ty = (np.pi / 2 - la) / np.pi * TEX_H - 0.5
    mwv = ndimage.map_coordinates(MW, [ty.ravel(), tx.ravel()], order=1, mode='wrap').reshape(H, W)
    img = img + MW_COL[None, None] * (mwv * 0.2 * mw)[..., None]
    # stars, with their arcs
    sp = Splats()
    scale = (math.radians(60) / hfov)
    focal = (W / 2) / tf
    steps = 1 + int(min(200, trail * focal / 1.8)) if trail > 0 else 1     # under two pixels apart along the longest arcs
    # only the stars that can reach the frame
    diag = math.atan(tf * math.hypot(1, H / W))
    vis = (DIRS @ sky_rot(theta).T) @ fwd > math.cos(min(math.pi, diag + trail + 0.05))
    D_, M_, C_, T_ = DIRS[vis], mag[vis], COL[vis], TW[vis]
    bright = M_
    tw = 0.8 + 0.2 * np.sin(theta * 40 + T_)
    for i in range(steps):
        th = theta - trail * i / max(1, steps - 1)
        dw = D_ @ sky_rot(th).T
        x = dw @ right; y = dw @ up; z = dw @ fwd
        ok = z > 0.05
        px = W / 2 + (x / np.where(ok, z, 1)) / tf * (W / 2); py = H / 2 - (y / np.where(ok, z, 1)) / tf * (W / 2)
        if horizon: ok &= dw[:, 2] > -0.02
        fall = (1 - i / steps) ** 1.3 if steps > 1 else 1.0
        a = np.where(ok, (0.25 + 0.75 * bright) * tw * fall * (1.0 if i == 0 else 0.62) * exposure, 0)
        sp.add(px, py, C_, a)
        if i == 0:                                          # the bright ones are bigger
            big = ok & (M_ > 0.45)
            for ox, oy in ((1, 0), (0, 1), (1, 1), (-1, 0), (0, -1)):
                sp.add(px[big] + ox * scale ** 0.5, py[big] + oy * scale ** 0.5, C_[big], a[big] * 0.55)
    buf = sp.image()
    if steps > 1: buf = ndimage.gaussian_filter(buf, (0.6, 0.6, 0))      # close the small gaps along the arcs
    acc = buf[..., 3:4]; pc = buf[..., :3] / np.maximum(acc, 1e-6); pa = np.clip(acc, 0, 1)
    glow = ndimage.gaussian_filter(buf[..., :3], (2.2, 2.2, 0)) * 0.9 + ndimage.gaussian_filter(buf[..., :3], (9, 9, 0)) * 0.5
    img = img * (1 - pa) + pc * pa + glow
    if grade is not None: img = grade(img)
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))

# C2 (user 10-24, the rooftop key image): blue-violet, going pale and a little pink toward the horizon
C2_STOPS = [(0.0, '#dccdf0'), (0.03, '#aa9ae4'), (0.10, '#5e51b6'), (0.22, '#30297a'), (0.4, '#1a1648'), (0.7, '#0d0b22')]
def c2_bg(el, ux):
    e = np.clip(el, 0, 1)
    xs = [a for a, _ in C2_STOPS]; cs = np.array([hexc(c) for _, c in C2_STOPS])
    out = np.stack([np.interp(e, xs, cs[:, ch]) for ch in range(3)], -1)
    glow = np.exp(-(np.clip(el, 0, None) / 0.05) ** 2) * np.exp(-(ux / 0.8) ** 2)         # brightest low and in the middle
    out = out + glow[..., None] * hexc('#fff4fa') * 0.18
    return np.where((el < 0)[..., None], hexc('#231d44'), out)

# ---------- the shots ----------
def sm(a, b, t): x = min(1.0, max(0.0, (t - a) / (b - a))); return x * x * (3 - 2 * x)
SHOTS = {
    # C2 96.2–107.0: from the roof, looking north and up at the pole; the sky turns, the arcs grow as it speeds up
    # (the rooftop key image) out through the door: the horizon low in the frame, the sky turning slowly, short arcs
    'c2': dict(t0=96.2, n=324, cam=lambda t: (math.radians(-14), math.radians(11 + 1.2 * sm(96.2, 107, t)), 0.0, math.radians(78)),
               theta=lambda t: 0.9 + 0.012 * (t - 96.2), trail=lambda t: 0.02, bg=c2_bg, mw=1.6, exposure=1.35),
    # the outro 280.0–324.0: the pole sits behind the sheath; we draw back (284.6–299.6) and the arcs grow round it.
    # The book (301.7–310.4) covers the middle, so those frames are never rendered. O3 goes a little further back.
    'outro': dict(t0=280.0, n=1321, cam=lambda t: outro_cam(t), skip=(653, 912),
                  theta=lambda t: 2.0 + 0.035 * (t - 280.0),
                  trail=lambda t: lerp(0.05, 0.24, sm(285.5, 299.6, t)) if t < 305 else 0.16),
}
def lerp(a, b, k): return a + (b - a) * k
def outro_cam(t):
    k = sm(284.6, 299.6, t) if t < 305 else 1 + 0.1 * sm(310.4, 324.0, t)
    return 0.0, math.radians(lerp(46.14, 39.0, k)), 0.0, math.radians(lerp(50, 96, k))
def outro_pole(out):
    """screen position of the pole and the zoom (focal / focal at the start), per frame, for the sheath in D.tsx"""
    S = SHOTS['outro']; f0 = None; rows = []
    for i in range(1, S['n'] + 1):
        t = S['t0'] + (i - 1) / FPS
        yaw, pitch, roll, hfov = S['cam'](t)
        fwd, right, up = basis(yaw, pitch, roll); tf = math.tan(hfov / 2)
        x, y, z = POLE @ right, POLE @ up, POLE @ fwd
        f = 1 / tf; f0 = f0 or f
        rows.append([round(W / 2 + x / z / tf * W / 2, 2), round(H / 2 - y / z / tf * W / 2, 2), round(f / f0, 5)])
    json.dump(rows, open(out, 'w'), separators=(',', ':'))

def w2_frame(i, city_dir):
    """W2: the Blender city (transparent sky) over the turning sky, through the same camera"""
    cams = W2_CAMS.setdefault(city_dir, json.load(open(os.path.join(city_dir, 'camera.json'))))
    t = 149.0 + (i - 1) / FPS
    sky = np.asarray(render(1.4 + 0.03 * (t - 149.0), cams[i - 1], trail=0.05 + 0.07 * sm(152, 156.5, t))).astype(float)
    fp = os.path.join(city_dir, f'{i:04d}.png')
    if not os.path.exists(fp): fp = os.path.join(city_dir, f'prev_T_{i:04d}.png')
    city = np.asarray(Image.open(fp).convert('RGBA')).astype(float)
    a = city[..., 3:4] / 255
    return Image.fromarray(np.clip(sky * (1 - a) + city[..., :3] * a, 0, 255).astype(np.uint8))
W2_CAMS = {}

if __name__ == '__main__':
    shot, out = sys.argv[1], sys.argv[2]
    if shot != 'pole': os.makedirs(out, exist_ok=True)
    if shot == 'w2':                                           # ... w2 <outdir> <city png dir> [frame ...]
        city = sys.argv[3]
        n = len(json.load(open(os.path.join(city, 'camera.json'))))
        for i in [int(x) for x in sys.argv[4:]] or range(1, n + 1):
            w2_frame(i, city).save(os.path.join(out, f'{i:04d}.jpg'), quality=92)
            if i % 30 == 0: print(i, flush=True)
        sys.exit()
    if shot == 'pole': outro_pole(out); sys.exit()      # ... pole <json out>
    S = SHOTS[shot]
    sk = S.get('skip', (0, -1))
    frames = [int(x) for x in sys.argv[3:]] or [i for i in range(1, S['n'] + 1) if not sk[0] <= i <= sk[1]]
    for i in frames:
        t = S['t0'] + (i - 1) / FPS
        fp = os.path.join(out, f'{i:04d}.jpg')
        if os.environ.get('SAIKAI_OVERWRITE', '1') == '0' and os.path.exists(fp): continue
        render(S['theta'](t), S['cam'](t), trail=S['trail'](t), bg=S.get('bg'), mw=S.get('mw', 1.0), exposure=S.get('exposure', 1.0)).save(fp, quality=92)
        if i % 30 == 0: print(i, flush=True)
