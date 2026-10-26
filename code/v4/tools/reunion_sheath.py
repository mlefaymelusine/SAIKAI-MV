# G2-G4 as one continuous shot (266.8-280.4): the reunion; Araya comes away as points of light from her hair ends,
# night falls into a turning star field, and the points come back down to build the sheath (sheathed_h) around
# Ryoshu's blade (sword_h), from both ends inward. Everything analytic in t, so any frame renders on its own.
#   python v4/tools/reunion_sheath.py <outdir> [t ...]      (no t: the whole run at 30 fps, 0001.jpg = 266.8 s)
import math, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '../../work/gen_r2/reunion_r2_3.png')
IMG = os.path.join(HERE, '../public/img')
W, H, FPS = 1920, 1080, 30
T0, T1 = 266.8, 280.4

PAPER = np.array((236, 228, 212.)); INK = np.array((14, 11, 16.)); BLACK = np.array((22, 20, 22.))
NAVY = np.array((38, 52, 92.)); STAR = np.array((214, 220, 240.)); NIGHT_T = np.array((22, 28, 58.)); NIGHT_B = np.array((12, 11, 20.))

def sm(a, b, t):
    x = np.clip((t - a) / (b - a), 0.0, 1.0); return x * x * (3 - 2 * x)
def eio(x):
    x = np.clip(x, 0.0, 1.0); return x * x * (3 - 2 * x)
def prog(t, a, b): return np.clip((t - a) / (b - a), 0.0, 1.0)

# ---------- layers of the reunion picture (same separation as reunion_seq.py) ----------
a = np.asarray(Image.open(SRC).convert('RGB')).astype(float)
IH, IW = a.shape[:2]
lum = a.mean(2)
paper_l = np.median(lum[:60, :60])
a_red = np.clip(((a[..., 0] - a[..., 1]) - 40) / 40, 0, 1) * (a[..., 0] > 70)
ink = np.clip((paper_l - lum) / (paper_l - 15), 0, 1)
dark = lum < 90
navy = dark & ((a[..., 2] - a[..., 0]) > 12)
navy = ndimage.binary_opening(navy, iterations=2)
lab, n = ndimage.label(navy); sz = ndimage.sum(navy, lab, range(1, n + 1)); navy = np.isin(lab, np.where(sz > 2000)[0] + 1)
navy = ndimage.binary_fill_holes(ndimage.binary_closing(navy, iterations=4))
blk = ndimage.binary_opening(dark & ~navy, iterations=2)
lab, n = ndimage.label(blk); sz = ndimage.sum(blk, lab, range(1, n + 1)); ryo_mass = np.isin(lab, np.where(sz > 300)[0] + 1)
ryo_zone = ndimage.binary_dilation(ryo_mass, iterations=3)
ara_zone = ~ryo_zone | navy
near_ryo = ndimage.binary_dilation(ryo_mass, iterations=4)
a_ara = ink * ara_zone
a_ryo = np.maximum(ink * ~ara_zone * near_ryo, ndimage.binary_dilation(a_red > 0.05, iterations=2) * 1.0)   # red lining -> black
# Ryoshu's hand on Araya's back: a paper piece with a black keyline, it stays with Ryoshu
pap = lum > 150
lab, n = ndimage.label(pap); sz = ndimage.sum(pap, lab, range(1, n + 1))
Xg = np.arange(IW)[None, :]; Yg = np.arange(IH)[:, None]
box = (Xg >= 800) & (Xg <= 975) & (Yg >= 460) & (Yg <= 590)
cand = set(i + 1 for i in range(n) if sz[i] < 20000)
hand = np.isin(lab, [l for l in np.unique(lab[box]) if l in cand]) & box
hand = ndimage.binary_fill_holes(ndimage.binary_closing(hand, iterations=4))
lab2, n2 = ndimage.label(hand); hand = lab2 == (np.argmax(ndimage.sum(hand, lab2, range(1, n2 + 1))) + 1)
hand_lines = ink * ndimage.binary_erosion(hand, iterations=3)
hand_edge = hand & ~ndimage.binary_erosion(hand, iterations=2)
a_ara = a_ara * ~ndimage.binary_dilation(hand, iterations=1)
ryo_all = np.clip(a_ryo + hand, 0, 1)
# the narrow gaps Araya's arms filled between Ryoshu's arms close up black, so no slivers show once she has gone
gaps = ndimage.binary_closing(ryo_all > 0.5, iterations=10) & ~(ryo_all > 0.5) & (a_ara > 0.3)
ryo_all = np.maximum(ryo_all, ndimage.gaussian_filter(gaps * 1.0, 0.7))
ryo_rim = np.clip(ndimage.binary_dilation(ryo_all > 0.5, iterations=3) & ~(ryo_all > 0.5), 0, 1) * 1.0
ryo_rim = ndimage.gaussian_filter(ryo_rim, 0.8)

# release time per pixel of Araya: hair ends and hem first, the face pressed to her mother last
rng = np.random.default_rng(7)
noise = ndimage.gaussian_filter(rng.random((IH, IW)), 2.0); noise = (noise - noise.min()) / (noise.max() - noise.min())
CX, CY = 430, 170                                      # her cheek against Ryoshu's
far = np.hypot(Xg - CX, (Yg - CY) * 0.9); far = far / far[a_ara > 0.5].max()
REL0, REL1 = 266.95, 271.6
R = REL0 + (REL1 - REL0) * np.clip(0.72 * (1 - far) + 0.28 * noise, 0, 1) ** 1.3
# Ryoshu's arm round the girl's head ends where Araya covered it; as Araya leaves, that edge sinks into the night
# instead of showing a cut-off sleeve (the hand on her back and the arm below it are left alone)
d_ara, (iy_, ix_) = ndimage.distance_transform_edt(~(a_ara > 0.5), return_indices=True)
R_NEAR = R[iy_, ix_]
MELT = ndimage.gaussian_filter(np.clip(1 - d_ara / 70, 0, 1) ** 1.5 * np.clip((470 - Yg) / 50, 0, 1) * ~ndimage.binary_dilation(hand, iterations=20), 6)

# picture -> screen (G2 framing of v4: the 1536x1024 picture at 0.80625, top-left at (340.8, 31.6))
BS, BX, BY = 0.80625, 340.8, 31.6
O = np.array((960.0, 440.0))
CAMFIX = None                                  # (scale, shift) set by the G1 framings below
def fix(F, S, z):
    """framing: the point F of the picture as seen at camera 1.0 goes to screen point S, at zoom z"""
    return z, (S[0] - O[0] - (F[0] - O[0]) * z, S[1] - O[1] - (F[1] - O[1]) * z)
def cam(t):
    """camera scale about O: the hug push carries on, then a push into her arms"""
    if CAMFIX is not None: return CAMFIX
    c = 1.0 + 0.05 * prog(t, 249.7, 266.9) + 0.03 * prog(t, 266.9, 274.2)
    push = eio(prog(t, 274.0, 275.4))
    return c * (1 + 0.5 * push), (0.0 * push, -60.0 * push)   # scale, extra shift
def to_screen(px, py, t):
    s, sh = cam(t)
    x = BX + BS * px; y = BY + BS * py
    return O[0] + (x - O[0]) * s + sh[0], O[1] + (y - O[1]) * s + sh[1]

# ---------- the sheath (G4 framing: 1560x152 box at (180,400), rotate -4deg about its centre, slow scale) ----------
SW, SH_ = 1560, 152
def sheath_affine(t):
    s = 1.0 + 0.04 * prog(t, 274.5, 280.4)
    ang = math.radians(-4); ca, sa = math.cos(ang), math.sin(ang)
    return s, ca, sa
def box_to_screen(u, v, t):                    # u, v in box pixels
    s, ca, sa = sheath_affine(t)
    x = (u - SW / 2) * s; y = (v - SH_ / 2) * s
    return 960 + x * ca - y * sa, 476 + x * sa + y * ca
def load_box(name):
    im = Image.open(os.path.join(IMG, name)).convert('RGBA').resize((SW, SH_), Image.LANCZOS)
    return np.asarray(im).astype(float) / 255
SHEATHED = load_box('sheathed_h.png'); SWORD = load_box('sword_h.png')
def warp_box(arr, t):
    """box-space RGBA -> screen RGBA"""
    s, ca, sa = sheath_affine(t)
    # inverse map: screen -> box
    inv = (ca / s, sa / s, -sa / s, ca / s)
    cx, cy = 960, 476
    im = Image.fromarray((arr * 255).astype(np.uint8), 'RGBA')
    # PIL affine: box = A * screen + c
    A = (ca / s, sa / s, SW / 2 - (ca * cx + sa * cy) / s, -sa / s, ca / s, SH_ / 2 - (-sa * cx + ca * cy) / s)
    out = im.transform((W, H), Image.AFFINE, A, resample=Image.BILINEAR)
    return np.asarray(out).astype(float) / 255
K0, K1 = 275.3, 279.1                          # the sheath closes over this span (as v4 G4)
def arrive_u(u):                               # u in 0..1 along the box -> arrival time
    k = u / 0.48 if u < 0.48 else (1 - u) / 0.52
    k = float(np.clip(k, 0.0, 1.0))
    # invert smoothstep
    x = 0.5 - math.sin(math.asin(1 - 2 * k) / 3)
    return K0 + (K1 - K0) * x
uu = np.arange(SW) / (SW - 1)
ARR_U = np.array([arrive_u(x) for x in uu])
ARR_BOX = ARR_U[None, :] + (ndimage.gaussian_filter(rng.random((SH_, SW)), 1.5) - 0.5) * 0.9   # grain on the arrival front

# ---------- particles ----------
ys, xs = np.nonzero(a_ara[::2, ::2] > 0.5); ys = ys * 2 + rng.integers(0, 2, ys.size); xs = xs * 2 + rng.integers(0, 2, xs.size)
NP = xs.size
p_tr = R[ys, xs]
p_hx, p_hy = xs.astype(float), ys.astype(float)
p_seed = rng.random((NP, 4))
p_big = rng.random(NP) < 0.05
p_spark = rng.random(NP) < 0.14
# targets on the sheath: the drawing's pixels (box space), one per particle where there are enough
ty, tx = np.nonzero(SHEATHED[..., 3] > 0.45)
sel = rng.permutation(tx.size)[:min(NP, tx.size)]
tx, ty = tx[sel], ty[sel]
has_t = np.zeros(NP, bool); idx = rng.permutation(NP)[:tx.size]; has_t[idx] = True
p_tu = np.zeros(NP); p_tv = np.zeros(NP); p_tu[idx] = tx; p_tv[idx] = ty
p_ta = np.full(NP, 1e9); p_ta[idx] = ARR_BOX[ty, tx]
p_tcol = np.tile(STAR, (NP, 1)); p_tcol[idx] = SHEATHED[ty, tx, :3] * 255
FLY = 1.5

# vortex: one global swirl angle, faster in the middle of "And S is not for sayonara"
V = np.array((960.0, 400.0))
def omega(t): return 0.06 + 0.66 * sm(268.0, 270.5, t) * (1 - 0.6 * sm(273.5, 276.0, t))
_TT = np.linspace(T0 - 1, T1 + 1, 4000); _OM = np.array([omega(x) for x in _TT]); _TH = np.concatenate([[0], np.cumsum((_OM[1:] + _OM[:-1]) / 2 * np.diff(_TT))])
def Theta(t): return np.interp(t, _TT, _TH)

EY = 0.62                                       # the sky turns on an ellipse, wider than tall
def free_pos(t, sel_):
    """released particles (no target pull) at time t: a little puff upward, then out onto an orbit of the turning sky"""
    tr = p_tr[sel_]; tau = np.maximum(0, t - tr)
    hx, hy = to_screen(p_hx[sel_], p_hy[sel_], np.minimum(tr, 274.0))
    dx, dy = hx - V[0], (hy - V[1]) / EY
    r0 = np.hypot(dx, dy); th0 = np.arctan2(dy, dx)
    sd = p_seed[sel_]
    rt = 30 + 730 * sd[:, 0] ** 0.8 + 420 * sd[:, 0] ** 5   # a soft full core, a thin tail outward (no hole in the middle)
    r = r0 + (rt - r0) * (1 - np.exp(-tau / 1.7))
    f = 1.0 / (1 + r / 900)
    th = th0 + (Theta(t) - Theta(tr)) * f * (0.8 + 0.4 * sd[:, 1])
    x = V[0] + r * np.cos(th); y = V[1] + r * np.sin(th) * EY
    lift = (60 + 160 * sd[:, 2]) * np.exp(-tau / 1.4) * (1 - np.exp(-tau / 0.35))
    wob = 5 * np.sin(tau * (1.5 + 2 * sd[:, 3]) + 20 * sd[:, 0])
    return x + wob, y - lift + wob * 0.6

def particles(t):
    rel = p_tr <= t
    sel_ = np.nonzero(rel)[0]
    x, y = free_pos(t, sel_)
    tau = t - p_tr[sel_]
    # colour: navy -> starlight in the first second
    k = np.clip(tau / 1.1, 0, 1)[:, None]
    col = NAVY * (1 - k) + STAR * k
    tw = 0.7 + 0.3 * np.sin(t * (4 + 5 * p_seed[sel_, 0]) + 30 * p_seed[sel_, 1])
    alpha = np.clip(tau / 0.15, 0, 1) * np.where(p_spark[sel_], 1.0 * tw, 0.22 + 0.5 * np.exp(-tau / 0.8))
    rr = np.hypot(x - V[0], (y - V[1]) / EY)
    alpha = alpha * np.clip(1.3 - rr / 1000, 0.25, 1)
    # pull to the sheath
    ht = has_t[sel_]
    ta = p_ta[sel_]
    td = ta - FLY
    pull = np.where(ht, np.clip((t - td) / FLY, 0, 1), 0.0)
    if pull.any():
        m = pull > 0
        si = sel_[m]
        # where it was when it set off
        x0, y0 = free_pos(td[m], si)
        tgx, tgy = box_to_screen(p_tu[si], p_tv[si], t)
        s = pull[m]; e = s * s * (3 - 2 * s)
        bow = np.sin(math.pi * s) * (40 + 80 * p_seed[si, 1]) * np.where(p_seed[si, 2] > 0.5, 1, -1)
        nx_, ny_ = -(tgy - y0), (tgx - x0); nl = np.hypot(nx_, ny_) + 1e-6
        x[m] = x0 + (tgx - x0) * e + bow * nx_ / nl
        y[m] = y0 + (tgy - y0) * e + bow * ny_ / nl
        col[m] = col[m] * (1 - e[:, None]) + p_tcol[si] * e[:, None]
        alpha[m] = alpha[m] * (1 - np.clip((t - ta[m]) / 0.35, 0, 1))      # landed: the drawing takes over
    # free particles (no target) dim to faint stars once the sheath starts
    alpha = np.where(ht, alpha, alpha * (1 - 0.65 * sm(274.0, 276.0, t)))
    return x, y, col, alpha, p_big[sel_] | (p_spark[sel_] & (p_seed[sel_, 2] > 0.6))

def splat(buf, x, y, col, alpha):
    ok = (x >= 0) & (x < W - 1) & (y >= 0) & (y < H - 1) & (alpha > 0.003)
    x, y, col, alpha = x[ok], y[ok], col[ok], alpha[ok]
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int); fx = x - x0; fy = y - y0
    for dx, dy, w in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
        ww = (w * alpha)[:, None]
        np.add.at(buf, (y0 + dy, x0 + dx), np.concatenate([col * ww, ww], 1))

# ---------- stars ----------
NS = 2600
s_r = np.sqrt(rng.random(NS)) * 1700; s_th = rng.random(NS) * 2 * math.pi
s_b = rng.random(NS) ** 2.2; s_col = np.tile(STAR, (NS, 1)); red_ = rng.random(NS) < 0.025; s_col[red_] = (214, 60, 70)
def stars(t, buf):
    vis = sm(267.8, 270.2, t)
    if vis <= 0: return
    th = s_th + Theta(t) * (1.0 / (1 + s_r / 700))
    tw = 0.75 + 0.25 * np.sin(t * 3 + s_th * 40)
    for k in range(7):                               # short trails
        tt = t - k * 0.06
        thk = s_th + Theta(tt) * (1.0 / (1 + s_r / 700))
        x = V[0] + s_r * np.cos(thk); y = V[1] + s_r * np.sin(thk) * EY
        a_ = vis * (0.35 + 0.65 * s_b) * tw * (1 - k / 7) ** 2 * (1.0 if k == 0 else 0.45)
        splat(buf, x, y, s_col, a_)

# ---------- one frame ----------
fib = np.random.default_rng(3).normal(0, 3.5, (H, W, 1))
def layer_to_screen(arr, t, mode='L'):
    s, sh = cam(t)
    # screen = O + (BX + BS*p - O)*s + sh  ->  p = ((screen - O - sh)/s + O - B)/BS
    A = (1 / (BS * s), 0, (-O[0] - sh[0]) / (BS * s) + (O[0] - BX) / BS,
         0, 1 / (BS * s), (-O[1] - sh[1]) / (BS * s) + (O[1] - BY) / BS)
    im = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8), 'L')
    return np.asarray(im.transform((W, H), Image.AFFINE, A, resample=Image.BICUBIC)).astype(float) / 255
yy = np.linspace(0, 1, H)[:, None, None]
NIGHT = NIGHT_T * (1 - yy) + NIGHT_B * yy
YN = np.linspace(0, 1, H)[:, None, None]
DUSK = np.array((178, 140, 150.))
def _dusk_field():
    gy, gx = np.mgrid[0:H, 0:W].astype(float)
    prox = np.exp(-(((gx - 900) / 620) ** 2 + ((gy - 470) / 420) ** 2))
    nz = ndimage.gaussian_filter(np.random.default_rng(11).standard_normal((H, W)), 170)
    nz = (nz - nz.mean()) / nz.std()
    d = 0.35 * (gy / H) + 0.65 * prox + 0.035 * nz
    d = (d - d.min()) / (d.max() - d.min())
    return (267.1 + 1.45 * d)[..., None]
DUSK_T = _dusk_field()
def frame(t):
    night = float(sm(267.6, 270.4, t))
    nrow = sm(DUSK_T, DUSK_T + 1.1, t)          # night closes in from the top and the edges, the pair last
    to_ink = float(sm(274.2, 275.6, t))
    sky = NIGHT * (1 - to_ink) + INK * to_ink
    edge = 4 * nrow * (1 - nrow)                # a faint afterglow where the night has only just reached
    bg = PAPER * (1 - nrow) + sky * nrow
    bg = bg * (1 - 0.4 * edge) + DUSK * 0.4 * edge
    o = np.broadcast_to(bg, (H, W, 3)) + fib * (1 - 0.6 * nrow)
    o = o.copy()
    # stars + particles, glowing
    buf = np.zeros((H, W, 4))
    stars(t, buf)
    x, y, col, al, big = particles(t)
    hand_over = 1 - sm(274.5, 275.5, t)
    splat(buf, x, y, col, al * hand_over)
    if big.any():
        for ox, oy in ((1, 0), (0, 1), (1, 1)):
            splat(buf, x[big] + ox, y[big] + oy, col[big], al[big] * 0.8 * hand_over)
    acc = buf[..., 3:4]; pc = buf[..., :3] / np.maximum(acc, 1e-6); pa = np.clip(acc, 0, 1)
    glow = ndimage.gaussian_filter(buf[..., :3], (3, 3, 0)) * 0.9
    o = o * (1 - pa) + pc * pa + glow * (0.35 + 0.65 * night)        # behind Ryoshu
    # Ryoshu (black paper; a paper keyline comes up as night falls) and what is left of Araya
    fade_ryo = 1 - sm(270.0, 271.0, t)               # she fades out as 再见 comes up: only the turning light and the words
    if t < REL1 + 0.2:
        rem = a_ara * np.clip((R - t) / 0.12, 0, 1)
        A_ara = layer_to_screen(rem, t)
        keep = 1 - MELT * sm(R_NEAR, R_NEAR + 0.8, t)
        A_ryo = layer_to_screen(ryo_all * keep, t) * fade_ryo
        A_rim = layer_to_screen(ryo_rim * keep, t) * night * 0.55 * fade_ryo
        A_hand = layer_to_screen(hand * 1.0, t) * fade_ryo
        A_hl = layer_to_screen(np.maximum(hand_edge * 1.0, hand_lines), t) * fade_ryo
        def lay(al, c):
            nonlocal o; o = o * (1 - al[..., None]) + np.asarray(c) * al[..., None]
        lay(A_rim, PAPER)
        lay(A_ryo, BLACK)
        lay(A_hand * (1 - night), PAPER); lay(A_hl, BLACK)
        lay(A_ara, NAVY)
    # the blade, then the sheath built where the light has landed
    blade = sm(274.4, 275.2, t)
    if blade > 0:
        SWs = warp_box(SWORD, t)
        al = SWs[..., 3] * blade
        o = o * (1 - al[..., None]) + SWs[..., :3] * 255 * al[..., None]
        rev = np.clip((t - ARR_BOX) / 0.3, 0, 1)
        Sb = SHEATHED.copy(); Sb[..., 3] *= rev
        SSs = warp_box(Sb, t)
        al = SSs[..., 3]
        o = o * (1 - al[..., None]) + SSs[..., :3] * 255 * al[..., None]
    # the landing light sits over the sheath
    land = np.zeros((H, W, 4))
    if t > 274.5:
        x, y, col, al, big = particles(t)
        near = np.ones_like(al, bool)
        splat(land, x, y, col, al * sm(274.5, 275.5, t))
        if big.any():
            for ox, oy in ((1, 0), (0, 1), (1, 1)):
                splat(land, x[big] + ox, y[big] + oy, col[big], al[big] * 0.8 * sm(274.5, 275.5, t))
        la = np.clip(land[..., 3:4], 0, 1); lc = land[..., :3] / np.maximum(land[..., 3:4], 1e-6)
        o = o * (1 - la) + lc * la + ndimage.gaussian_filter(land[..., :3], (2, 2, 0)) * 0.6
    return Image.fromarray(np.clip(o, 0, 255).astype(np.uint8))

# ---------- G1 (249.2-266.8) ----------
# User 10-24 (2nd look): no more cuts between framings. "But now I know that / Sacrifice is the easy path" is a new
# picture (D.tsx G1a, the footprints); from "My absence" (255.4) we start close on the two faces (the old framing 1)
# and draw back, in one move, to the framing the run starts from (cam() at 266.8, scale 1.05 about O).
HUG_T0, HUG_N = 249.2, 528                     # 0001.jpg = 249.2 s; G1b uses frames 187..528
PULL0, PULL1 = 255.4, 266.8
PULL_F = np.array((975.0, 245.0))              # the cheeks, as seen at camera 1.0
def hug_pull(t):
    k = eio(prog(t, PULL0, PULL1))
    z = math.exp(math.log(2.12) + (math.log(1.05) - math.log(2.12)) * k)
    S = np.array((960.0, 470.0)) * (1 - k) + (O + (PULL_F - O) * 1.05) * k
    return fix(PULL_F, S, z)
def hug_frame(t):
    global CAMFIX
    CAMFIX = hug_pull(t); im = frame(t); CAMFIX = None
    return im

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    if sys.argv[2:] == ['hug']:
        frame(249.7).save(os.path.join(out, 'reunion_hug.jpg'), quality=94); sys.exit()
    if sys.argv[2:3] == ['hugseq']:            # ... public/seq/reunionHug hugseq [a b]: frames a..b of G1
        a_, b_ = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (1, HUG_N)
        for i in range(a_, b_ + 1):
            fp = os.path.join(out, f'{i:04d}.jpg')
            if os.environ.get('SAIKAI_OVERWRITE', '1') == '0' and os.path.exists(fp): continue
            hug_frame(HUG_T0 + (i - 1) / FPS).save(fp, quality=90)
        sys.exit()
    if sys.argv[2:3] == ['hugt']:              # stills of G1 at the given times
        for x in sys.argv[3:]:
            hug_frame(float(x)).save(os.path.join(out, f'h_{float(x):.2f}.jpg'), quality=90)
        sys.exit()
    ts = [float(x) for x in sys.argv[2:]]
    if ts:
        for t in ts:
            frame(t).save(os.path.join(out, f't_{t:.2f}.jpg'), quality=90); print(t, flush=True)
    else:
        n = int(round((T1 - T0) * FPS))
        for i in range(n):
            fp = os.path.join(out, f'{i + 1:04d}.jpg')
            if os.environ.get('SAIKAI_OVERWRITE', '1') == '0' and os.path.exists(fp): continue
            frame(T0 + i / FPS).save(fp, quality=90)
            if i % 30 == 0: print(i, flush=True)
