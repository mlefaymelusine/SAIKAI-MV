# P2 (user 10-24: the ball of yarn was too plain): one red thread wound into a ball, turn by turn, as a real 3D path.
# Each turn is a great circle; every few turns the winding axis swings round the point the thread has reached, so the
# path never jumps and the ball fills out in crossing bands like a hand-wound ball. Strands are drawn back to front
# with a dark edge, shaded by how much they face us, and the near half of the ball hides the far half.
# User 10-24 (3rd look): still far too fast, about a quarter of the speed; so the camera comes down the thread from the
# opening and finds the ball already well wound, and it winds on slowly; no more laying the two ends together: it ends
# on the ball with its thread going up, and the first end hangs out of the bottom of the ball and runs on down out of
# the frame, so the ball is a knot in one thread (the user suggested both).
#   python v4/tools/yarn.py <outdir> [t ...]       no t: the whole shot, 11.2-30.2 s, to <outdir>/NNNN.jpg (0001 = 11.2)
import math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H, FPS, SS = 1920, 1080, 30, 2
T0, T1 = 11.2, 30.2
WIND0, WIND1, MEET = 11.2, 27.0, 27.4
N0, RATE = 36.2976, 0.16                         # turns wound when we come in; turns a second at most (was up to 4.2;
                                                # 10-25: 0.7, then 0.5; once the whole ball turned with it, half that:
                                                # about 3 s a turn of the ball). The ball comes in more wound, so it
                                                # still ends on time; where the thread goes in no longer depends on it.
                                                # 10-25 (9th look): 0.8 of that (0.25 -> 0.2), coming in more wound
                                                # so it still stops at WIND1 after the same 2.52 s slowing
                                                # 10-25 (after the full film): 0.8 again (0.2 -> 0.16); it now comes
                                                # in past the big turn-over at 36, so only the small one at 37 is left
if os.environ.get('YARN_RATE'): RATE = float(os.environ['YARN_RATE']); N0 = float(os.environ['YARN_N0'])
TJ, RAMP = 12.6, 5.0                            # user 10-24 (5th look): the ball keeps still while P1 cross-fades out
                                                # (the thread twisted about as it came in), then starts slowly and comes
                                                # up to RATE over RAMP s (today's pace is the most it may go); 10-25:
                                                # it still seemed to set off fast at 13 s, so a longer ramp; 10-25
                                                # (2nd): the speed goes up in a straight line (an eased ramp still had
                                                # a moment where it suddenly sped up)
BOW, LAG = 28.0, 0.3                            # the free thread's slow sway (px) and how far behind the winding it
                                                # follows (s): 10-25, it hung dead straight once it had joined
INK = (14, 11, 16)
RED, RED_DK, RED_HI, EDGE = np.array((196, 26, 46.)), np.array((92, 8, 22.)), np.array((236, 104, 104.)), (40, 4, 12)
rng = np.random.default_rng(9)

def unit(v): return v / np.linalg.norm(v)
def rot(axis, a):
    x, y, z = unit(axis); c, s = math.cos(a), math.sin(a); C = 1 - c
    return np.array([[c + x * x * C, x * y * C - z * s, x * z * C + y * s], [y * x * C + z * s, c + y * y * C, y * z * C - x * s], [z * x * C - y * s, z * y * C + x * s, c + z * z * C]])
def sm(a, b, t): x = min(1.0, max(0.0, (t - a) / (b - a))); return x * x * (3 - 2 * x)
def lerp(a, b, k): return a + (b - a) * k

# ---------- the path ----------
K, SEG, GROUP = 38, 96, 2                       # user 10-24 (2nd look): 150 turns in 13 s was far too fast
TW = 0.084                                      # thread width (ball radius at the end = 1)
def rad(k): return 0.16 + 0.84 * ((k + 1) / K) ** (1 / 3)
pts, kk, turns = [], [], []
d = unit(np.array([0.3, -0.5, 0.8]))            # where the thread starts (and the first end comes out)
axis = unit(np.cross(d, [0, 0, 1.0]))
for k in range(K):
    # every turn swings the winding axis a little round the point the thread has reached; every few turns, a lot.
    # Each turn also goes on past where it began, so the crossings spread over the ball instead of piling up.
    big = k % GROUP == 0 and k
    axis = rot(d, math.radians(rng.uniform(55, 105) if big else rng.uniform(4, 10)) * (rng.choice([-1, 1]) if big else 1)) @ axis
    u = unit(d - axis * (d @ axis)); v = np.cross(axis, u)
    r0, r1 = rad(k - 1) if k else rad(0), rad(k)
    span = 2 * math.pi + math.radians(rng.uniform(50, 140))
    turns.append((u, v, span, axis))
    for i in range(SEG):
        a = span * i / SEG
        p = (math.cos(a) * u + math.sin(a) * v) * lerp(r0, r1, i / SEG)
        pts.append(p); kk.append(k + i / SEG)
    d = unit(math.cos(span) * u + math.sin(span) * v)
pts.append(d * rad(K - 1)); kk.append(K)
# where the axis swings, the thread does not turn a corner: it bends round from the old turn into the new one over RB
# points either side (user 10-25, 9th look: the corner went under the thread at 17.8-18.2 s and twisted it into a Z)
RB = 12
for k in range(1, K):
    (u0, v0, s0, _), (u1, v1, s1, _) = turns[k - 1], turns[k]
    for j in range(-RB, RB):
        a0, a1 = s0 * (SEG + j) / SEG, s1 * j / SEG
        p0, p1 = math.cos(a0) * u0 + math.sin(a0) * v0, math.cos(a1) * u1 + math.sin(a1) * v1
        wj = (j + RB) / (2 * RB); wj = wj * wj * (3 - 2 * wj)
        pts[k * SEG + j] = unit(lerp(p0, p1, wj)) * np.linalg.norm(pts[k * SEG + j])
PTS, KK = np.array(pts), np.array(kk)
# the two ends. The winding stops at PK; the first end is drawn out of the middle of the ball a little way off (a
# centre-pull ball), and the last end lifts off the surface and arcs over to it, so their tips touch.
PK = unit(PTS[-1])
D0 = unit(rot(unit(np.cross(PK, [0.2, 1.0, 0.1])), math.radians(28)) @ PK)
SIDE = unit(np.cross(D0, PK))
TAIL = np.array([D0 * (0.9 + 0.55 * s) + SIDE * 0.08 * s ** 2 for s in np.linspace(0, 1, 30)])   # its outer part
TIP = TAIL[-1]
def slerp(a, b, s):
    om = math.acos(np.clip(a @ b, -1, 1))
    return a if om < 1e-6 else (math.sin((1 - s) * om) * a + math.sin(s * om) * b) / math.sin(om)
TUCK = np.array([slerp(PK, unit(TIP - SIDE * 0.03), s) * lerp(1.0, np.linalg.norm(TIP), s ** 1.5) + unit(slerp(PK, D0, s)) * 0.3 * math.sin(math.pi * s) ** 1.2 for s in np.linspace(0, 1, 60)])
MEET_DIR = unit(TIP)

# ---------- the ball's turn (user 10-25, 6th look: the thread went in behind the ball while the winding went on round
# its front; the way the thread moved had nothing to do with the way the ball was being wound). Now the thread keeps
# still and the ball turns: the thread comes down to one point on the ball's front left, level with its middle
# (CONTACT), and the ball is turned under it so that the turn being laid always arrives there heading straight up the
# thread (D_IN), rolling it on; so it turns about the level axis through its front right (AXIS), which faces us, and
# is seen to turn round. (10-25, 8th look: a contact further round the left edge made the thread bend round the
# ball's outline before it went on; back to this one.) The first end comes out of the ball's underside at the back
# (LOWER), a little right of the middle where the user drew it, and hangs down behind the ball, so it shows from under
# the ball's lower edge (from the front it looked stuck on; the user: behind, as before). It is off the axis, so strictly
# it would be wound round; it is hidden there, so it just hangs.
CONTACT = unit(np.array([-1.0, 0.0, 1.0]))       # x right, y up, z toward us
D_IN = np.array([0.0, 1.0, 0.0])
AXIS = np.cross(D_IN, CONTACT)                   # (0.71, 0, 0.71)
LOWER = unit(np.array([0.38, -0.80, -0.46]))
# Where the winding swings to a new axis (every other turn, by 55-105 deg) the path has a corner, and the ball has to
# be turned over to wind on the new way. 10-25 (3rd look at the stutter): that turn-over came in steps (the new axis
# was blended in by 13 samples, so it jumped every two or three frames at 17.6 s), so the axis is now blended over
# TSM turns either side with a smooth weight worked out exactly, and the point under the thread rounds the corner
# over TPH turns, so the ball turns over in one slow, even movement.
NK = np.array([tr[3] for tr in turns])          # each turn's axis
TSM, TPH = 0.14, 0.02                            # (10-25, 9th: the path now bends round itself)
PH_D = np.linspace(-TPH, TPH, 41); PH_W = (1 + np.cos(np.pi * PH_D / TPH)) / 2 + 1e-3
def path_at(n):
    """the point the winding has reached after n turns"""
    n = min(float(K), max(float(KK[1]), n))
    m = min(len(PTS) - 1, max(1, int(np.searchsorted(KK, n))))
    f = min(1.0, max(0.0, (n - KK[m - 1]) / max(1e-6, KK[m] - KK[m - 1])))
    return lerp(PTS[m - 1], PTS[m], f)
def turn_axis(n):
    """the axis the winding is on after n turns, blended smoothly into the next over TSM turns either side"""
    def cum(x): x = min(TSM, max(-TSM, x)); return (x + TSM) / 2 + TSM / (2 * math.pi) * math.sin(math.pi * x / TSM)
    ax = np.zeros(3)
    for k in range(int(math.floor(n - TSM)) - 1, int(math.floor(n + TSM)) + 2):
        wk = cum(k + 1 - n) - cum(k - n)
        if wk > 0: ax += wk * NK[min(K - 1, max(0, k))]
    return unit(ax)
def ball_turn(n):
    """the ball's rotation (body -> world) when n turns are wound"""
    ph = unit(sum(w_ * path_at(n + d_) for w_, d_ in zip(PH_W, PH_D)))
    ax = turn_axis(n); tg = unit(np.cross(ax, ph))
    body = np.stack([ph, tg, np.cross(ph, tg)], 1)
    world = np.stack([CONTACT, D_IN, np.cross(CONTACT, D_IN)], 1)
    return world @ body.T
def spin(t): return ball_turn(wound(t))

# ---------- camera ----------
CX, CY, RPX = 800, 520, 255
def wound(t):
    # still until TJ; the rate goes up evenly from 0 to RATE over RAMP s; even; then the last `dec` s slow evenly to a stop at WIND1
    T = WIND1 - TJ; dec = 2 * (T - RAMP / 2 - (K - N0) / RATE)
    x = min(T, max(0.0, t - TJ))
    if x <= RAMP:
        u = x / RAMP; return N0 + RATE * RAMP * u * u / 2
    n = N0 + RATE * RAMP / 2
    if x <= T - dec: return n + RATE * (x - RAMP)
    n += RATE * (T - dec - RAMP); y = x - (T - dec)
    return min(float(K), n + RATE * (y - y * y / (2 * dec)))
def cam(t):
    """zoom (world -> px factor on RPX), screen centre of the ball"""
    z = lerp(1.12, 1.0, sm(14.0, 27.0, t))
    dy = 940 * (1 - sm(11.2, 16.4, t)) - 300 * sm(27.2, 31.0, t)
    return z, (CX, CY + dy)

def frame(t):
    img = Image.new('RGB', (W * SS, H * SS), INK)
    dr = ImageDraw.Draw(img)
    z, (cx, cy) = cam(t)
    S = spin(t)
    sc = RPX * z * SS
    def scr(P):                                    # world (n,3) -> screen px (n,2), depth
        Q = P @ S.T
        x = cx * SS + Q[:, 0] * sc; y = cy * SS - Q[:, 1] * sc
        return np.stack([x, y], 1), Q[:, 2]
    n = wound(t)
    m = int(np.searchsorted(KK, n))
    P = PTS[:m + 1].copy()
    if m < len(PTS) - 1 and m > 0:                 # the turn in progress ends where the thread is now
        f = (n - KK[m - 1]) / max(1e-6, KK[m] - KK[m - 1]); P[-1] = lerp(PTS[m - 1], PTS[m], f)
    rcur = rad(min(K - 1, int(n))) if n > 0 else rad(0)
    xy, dep = scr(P)
    w = TW * sc
    # the free thread, from above, down to the ball's CONTACT point, where it goes on as the turn being laid
    # While P1 fades out (to 12.8 s) it runs exactly as P1's thread does down to P1's tip (753.8, 442), then on to the
    # ball below (P1's thread fades out into the dark above that point, so the two meet softly: user 10-24, 5th look,
    # the thread is one thread all along, already on the ball). User 10-25: never dead straight, a slow bow sways along
    # it; it comes over to the contact in one long curve and arrives there straight down, as the ball takes it. It
    # relaxes into one soft curve from the top as the ball comes up (10-25, 9th look: done by 15.2 s, before the ball
    # is up close under P1's tip, where the old line would have to swing over in a short S). It hangs in front of the
    # ball's upper left, so it is drawn over the ball. Its last 40% bends gently into the strand it goes on as.
    end = xy[-1]
    sx, sy = (753.8 + 60 * math.sin(t * 1.1)) * SS, -60 * SS
    TX, TY, k = 753.8 * SS, 442.0 * SS, sm(12.9, 15.2, t)
    ex, ey = end
    def bow(v): return BOW * SS * math.sin(math.pi * v) ** 2 * math.sin(0.62 * t + 1.1 - 1.4 * v)
    def ss(v): return v * v * (3 - 2 * v)
    slope = ((TX - sx) - 18 * SS * math.sin(3 + 0.6 * t)) / (TY - sy)     # P1's line as it reaches TY, carried on
    ds = scr(path_at(n - 0.035)[None])[0][0] - xy[-1]   # toward the strand a little way back (not the last chord:
                                                         # it swung right round as the corner went under the thread)
    mfoot = float(np.clip(ds[0] / max(1e-6, ds[1]), -1.2, 1.2)) if ds[1] > 0 else 0.0   # dx/dy of the strand below
    pts_ = []
    for s in np.linspace(0, 1, 120):
        y = lerp(sy, ey, s)
        if y <= TY:
            u = (y - sy) / (TY - sy); xp = lerp(sx, TX, u) + 18 * SS * math.sin(u * 3 + 0.6 * t) * (1 - u)
        else:
            v = min(1.0, (y - TY) / max(1.0, ey - TY))
            xp = TX + slope * (y - TY) * (1 - v) ** 2 + (ex - TX) * ss(v) + bow(v)
        xr = sx + (ex - sx) * ss(s) + 18 * SS * math.sin(s * 3 + 0.6 * t) * (1 - s) ** 2 + bow(s)
        pts_.append((lerp(xp, xr, k) + mfoot * (y - ey) * sm(0.6, 1.0, s), y))
    # the first end, from LOWER behind the ball down out of the frame: out a little to the right and back, as drawn,
    # with a slow sway that grows down it; in the ball's shadow where it comes out from under it, lighter below
    rp = np.linalg.norm(P[-1]); lx, ly = cx * SS + LOWER[0] * rp * sc, cy * SS - LOWER[1] * rp * sc
    def hang_dx(yr):                               # yr: px below LOWER
        return (20 * math.sin(yr / 100.0) + 14 * math.sin(0.45 * t + yr / 240.0) * sm(0.0, 260.0, yr)) * SS
    hang = [(lx + hang_dx(yr / SS), ly + yr) for yr in np.linspace(0, 1, 90) ** 1.6 * (H * SS + 500 * SS - ly)]
    ysil = cy * SS + math.sqrt(max(0.0, 1 - LOWER[0] ** 2)) * rp * sc          # the ball's lower edge there
    low_f = [lerp(0.3, 0.72, sm(ysil - 0.05 * rp * sc, ysil + 0.5 * rp * sc, y_)) for _, y_ in hang]
    # the threads off the ball are drawn the way the strands on it are (user 10-25: they looked pasted on, flat and
    # square-ended): the same width, dark edge, shade and highlight, with round joints, so where the free thread lies
    # down on the ball it simply goes on as the strand. q 0..1 along it: 0 is P1's thread (19 px, plain red), which
    # it has to match while P1 fades out over it; 1 is a strand facing us as the contact does
    F_C = float(CONTACT[2])
    def body_col(f): return lerp(RED_DK, RED, max(0.0, min(1.0, 0.15 + 0.85 * f)) ** 1.3)
    def hl_col(body, f, q=1.0):
        # the highlight along a strand facing the light; it fades in from the strand's own colour where the strand
        # turns toward the light (10-25: it came on all at once, a step in colour where the thread joined the ball)
        h = lerp(RED, RED_HI, 0.4 * min(1.0, max(0.0, (f - 0.35) / 0.4)))
        return tuple(int(v) for v in lerp(body, h, min(1.0, max(0.0, (f - 0.35) / 0.15)) * q))
    def strand_line(pts, qs, fs=None):
        pts = np.asarray(pts, float); qs = np.asarray(qs, float)
        fs = np.full(len(pts), F_C) if fs is None else np.asarray(fs, float)
        wid = lerp(0.8 * w, w, qs); edge = wid + lerp(2 * SS, 2.4 * SS, qs)
        cols = [tuple(int(v) for v in lerp(RED, body_col(f_), q_)) for q_, f_ in zip(qs, fs)]
        for pass_ in (0, 1):
            for i in range(len(pts) - 1):
                a_, b_ = tuple(pts[i]), tuple(pts[i + 1])
                wd = edge[i] if pass_ == 0 else wid[i]; col = EDGE if pass_ == 0 else cols[i]
                if i == 0:                                  # a round end where it starts
                    r_ = wd / 2; dr.ellipse([a_[0] - r_, a_[1] - r_, a_[0] + r_, a_[1] + r_], fill=col)
                dr.line([a_, b_], fill=col, width=int(max(1, wd)))
                if i < len(pts) - 2:
                    r_ = wd / 2; dr.ellipse([b_[0] - r_, b_[1] - r_, b_[0] + r_, b_[1] + r_], fill=col)
        o = np.array([-0.5, -0.6]) * w * 0.2
        for i in range(len(pts) - 1):
            if qs[i] < 0.05 or fs[i] < 0.35: continue
            dr.line([tuple(pts[i] + o), tuple(pts[i + 1] + o)], fill=hl_col(np.array(cols[i], float), fs[i], qs[i]), width=int(max(1, w * 0.16)))
    # segments, back to front
    segs = []
    if len(P) > 1:
        a, b = xy[:-1], xy[1:]; zz = (dep[:-1] + dep[1:]) / 2
        rr = np.linalg.norm((P[:-1] + P[1:]) / 2, axis=1)
        facing = zz / np.maximum(rr, 1e-6)
        for i in range(len(zz)):
            segs.append((zz[i], 'w', a[i], b[i], facing[i]))
    segs.sort(key=lambda s: s[0])
    disc_r = 0.95 * rad(n - 7) * sc if n > 7 else 0
    drawn_disc = False
    def seg(a, b, f, width):
        col = tuple(int(v) for v in body_col(f))
        dr.line([tuple(a), tuple(b)], fill=EDGE, width=int(width + 2.4 * SS))
        dr.line([tuple(a), tuple(b)], fill=col, width=int(max(1, width)))
    drawn_low = False
    for zz, kind, a, b, f in segs:
        if not drawn_low and zz > LOWER[2] * rp:   # the first end, among the turns at its depth
            strand_line(hang, np.ones(len(hang)), low_f); drawn_low = True
        if not drawn_disc and zz > 0 and disc_r > 0:
            dr.ellipse([cx * SS - disc_r, cy * SS - disc_r, cx * SS + disc_r, cy * SS + disc_r], fill=(96, 10, 26))
            drawn_disc = True
        seg(a, b, f, w)
    if not drawn_low: strand_line(hang, np.ones(len(hang)), low_f)
    if not drawn_disc and disc_r > 0:
        dr.ellipse([cx * SS - disc_r, cy * SS - disc_r, cx * SS + disc_r, cy * SS + disc_r], fill=(96, 10, 26))
    # highlights on the strands that face the light (upper left), a thin lighter line along each
    L = unit(np.array([-0.5, 0.6, 0.62]))
    for zz, kind, a, b, f in segs:
        if zz <= 0: continue
        if f < 0.35: continue
        o = np.array([-0.5, -0.6]) * w * 0.2
        dr.line([tuple(a + o), tuple(b + o)], fill=hl_col(body_col(f), f), width=int(max(1, w * 0.16)))
    # the free thread, over the ball: like P1's thread above P1's tip while P1 is still there, like a strand below it
    # and everywhere once P1 has gone
    # It goes on into the strand it is being laid as: the last of the winding, from the contact back down round the
    # front of the ball, is the outermost thread there, so it is drawn over the rest with the free thread, as one line
    qt = sm(12.8, 14.0, t)
    qs = [max(qt, sm(TY, TY + 0.6 * max(1.0, ey - TY), y_)) if ey > TY else 1.0 for _, y_ in pts_]
    j = len(P) - 1; arc = []
    while j > 0 and KK[min(j, len(KK) - 1)] > n - 0.45 and dep[j] > 0.1 * np.linalg.norm(P[j]):
        arc.append(j); j -= 1
    fa = [dep[i] / np.linalg.norm(P[i]) for i in arc]
    strand_line(list(pts_) + [tuple(xy[i]) for i in arc[1:]], qs + [1.0] * (len(arc) - 1), [F_C] * len(pts_) + fa[1:])
    out = img.resize((W, H), Image.LANCZOS)
    return out

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    ts = [float(x) for x in sys.argv[2:]]
    if ts:
        for t in ts: frame(t).save(os.path.join(out, f'y_{t:.2f}.jpg'), quality=92)
        sys.exit()
    n = int(round((T1 - T0) * FPS)) + 1
    a, b = int(os.environ.get('A', 1)), int(os.environ.get('B', n))
    for i in range(a, b + 1):
        frame(T0 + (i - 1) / FPS).save(os.path.join(out, f'{i:04d}.jpg'), quality=92)
        if i % 30 == 0: print(i, flush=True)
