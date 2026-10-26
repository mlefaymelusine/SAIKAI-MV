# Page art for Rien's picture book: ink on paper, a spider and its web, the canon story, a blank last page.
from PIL import Image, ImageDraw, ImageFont
import math, os, random
D = os.path.dirname(os.path.abspath(__file__))
W, H = 1100, 1500
PAPER, INK, GREY = (250, 248, 242), (14, 11, 16), (141, 135, 128)
font = lambda s: ImageFont.truetype(os.path.join(D, '../tools/ttf/sc_500_normal_1.ttf'), s)
S = 2  # supersample

def page():
    im = Image.new('RGB', (W * S, H * S), PAPER); return im, ImageDraw.Draw(im)

def done(im, name):
    im.resize((W, H), Image.LANCZOS).save(os.path.join(D, 'tex', name))

def spiral(d, cx, cy, r0, r1, turns, w, spokes=8, rot=0.0):
    pts = []
    n = int(turns * 120)
    for i in range(n + 1):
        t = i / n; a = rot + t * turns * 2 * math.pi; r = r0 + (r1 - r0) * t
        pts.append(((cx + r * math.cos(a)) * S, (cy + r * math.sin(a)) * S))
    d.line(pts, fill=INK, width=int(w * S), joint='curve')
    for k in range(spokes):
        a = rot + k / spokes * 2 * math.pi
        d.line([((cx + r0 * 0.3 * math.cos(a)) * S, (cy + r0 * 0.3 * math.sin(a)) * S), ((cx + (r1 + 30) * math.cos(a)) * S, (cy + (r1 + 30) * math.sin(a)) * S)], fill=INK, width=int(w * 0.8 * S))

def orb(d, cx, cy, r, turns, w, spokes=18, seed=1, hub=0.1, anchors=4):
    """an orb web as spiders really make it (user 10-24: the old one was a plain spiral): a frame of a few straight
    threads, uneven radii out to it, a small tight hub, an empty ring, then the sticky spiral laid as straight
    chords from radius to radius, each sagging a little toward the centre"""
    R = random.Random(seed)
    ang = sorted((k + (R.random() - 0.5) * 0.5) / spokes * 2 * math.pi for k in range(spokes))
    rim = [r * (0.88 + 0.22 * R.random()) for _ in ang]
    P = lambda a, rr: ((cx + rr * math.cos(a)) * S, (cy + rr * math.sin(a)) * S)
    fr = [P(a, rr) for a, rr in zip(ang, rim)]
    d.line(fr + [fr[0]], fill=INK, width=int(w * 1.2 * S), joint='curve')                      # the frame
    for k in range(anchors):                                                                   # anchor lines off the page
        i = int(k * spokes / anchors + R.random() * 2) % spokes
        d.line([fr[i], P(ang[i], rim[i] * 4)], fill=INK, width=int(w * 1.2 * S))
    for a, rr in zip(ang, rim): d.line([P(a, 0), P(a, rr)], fill=INK, width=int(w * S))     # the radii
    pts = []                                                                                   # the hub
    for i in range(int(4 * spokes) + 1):
        k = i / spokes; a = ang[i % spokes] + 2 * math.pi * (i // spokes); pts.append(P(a, r * hub * (0.25 + 0.75 * k / 4)))
    d.line(pts, fill=INK, width=int(w * 0.8 * S), joint='curve')
    r_in = r * hub * 1.9
    n = int(turns * spokes)
    prev = None
    for i in range(n + 1):
        j = i % spokes; a = ang[j] + 2 * math.pi * (i // spokes)
        rr = r_in + (rim[j] * 0.93 - r_in) * (i / n)
        q = P(a, rr)
        if prev is not None:
            (x0, y0), (x1, y1) = prev, q
            mx, my = (x0 + x1) / 2, (y0 + y1) / 2
            cxs, cys = cx * S, cy * S
            dist = math.hypot(mx - cxs, my - cys) or 1
            sag = 0.05 * math.hypot(x1 - x0, y1 - y0)
            m2 = (mx - (mx - cxs) / dist * sag, my - (my - cys) / dist * sag)
            d.line([prev, m2, q], fill=INK, width=int(w * 0.75 * S), joint='curve')
        prev = q

def spider(d, cx, cy, s, up=0.0):
    """a round paper-cut spider: body, head, eight bent legs; up rotates it to look upward"""
    def P(x, y):
        a = up; return ((cx + (x * math.cos(a) - y * math.sin(a)) * s) * S, (cy + (x * math.sin(a) + y * math.cos(a)) * s) * S)
    for side in (-1, 1):
        for k in range(4):
            a0 = -0.9 + k * 0.55
            kx, ky = side * (0.9 + 0.2 * math.cos(a0)), 0.6 * math.sin(a0) * 1.6 - 0.15
            fx, fy = side * 1.55, 0.9 * math.sin(a0) * 1.9 + 0.35
            d.line([P(side * 0.35, ky * 0.3), P(kx, ky - 0.35), P(fx, fy)], fill=INK, width=int(0.11 * s * S), joint='curve')
    d.ellipse([P(-0.55, -0.1)[0], P(-0.55, -0.1)[1], P(0.55, 1.1)[0], P(0.55, 1.1)[1]] if up == 0 else _bb([P(-0.55, -0.1), P(0.55, 1.1)]), fill=INK)
    d.ellipse(_bb([P(-0.33, -0.7), P(0.33, -0.05)]), fill=INK)

def _bb(ps):
    xs = [p[0] for p in ps]; ys = [p[1] for p in ps]; return [min(xs), min(ys), max(xs), max(ys)]

def text(d, lines, y0, size, gap=1.7):
    f = font(size * S)
    for i, l in enumerate(lines):
        w = d.textlength(l, font=f)
        d.text(((W * S - w) / 2, (y0 + i * size * gap) * S), l, font=f, fill=INK)

def num(d, n):
    f = font(26 * S); d.text(((W / 2 - 8) * S, (H - 70) * S), str(n), font=f, fill=GREY)

# 1 recto: the web and the spider in it (title page, no title)
im, d = page(); orb(d, 550, 640, 420, 16, 2.2, seed=3); spider(d, 550, 620, 42); num(d, 1); done(im, 'p1r.png')
# 1 verso: the spider at the edge of the web, looking up at a sky it cannot reach
im, d = page()
orb(d, 550, 1560, 760, 18, 2.2, spokes=22, seed=5, anchors=2)
d.ellipse([(760 - 70) * S, (230 - 70) * S, (760 + 70) * S, (230 + 70) * S], fill=INK)
d.ellipse([(790 - 62) * S, (210 - 62) * S, (790 + 62) * S, (210 + 62) * S], fill=PAPER)
random.seed(4)
for i in range(26):
    x, y = random.uniform(80, 1020), random.uniform(80, 600); r = random.choice((4, 5, 7))
    d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=INK)
spider(d, 550, 860, 46, up=0.0); num(d, 2); done(im, 'p1v.png')
# 2 recto: the sage's instruction
im, d = page(); text(d, ['将蜘蛛网绕转三千轮。', '如果不见改变，', '则再次绕转三千轮。'], 520, 58); num(d, 3); done(im, 'p2r.png')
# 2 verso: round after round
im, d = page(); orb(d, 550, 600, 470, 38, 1.6, spokes=24, seed=8); text(d, ['心怀希望的蜘蛛就那么转啊转啊，', '甚至数不清绕过了多少圈。'], 1180, 44); num(d, 4); done(im, 'p2v.png')
# 3 recto: blank (the story never got its last page)
im, d = page(); done(im, 'p3r.png')
# endpapers and the cover label
im, d = page(); done(im, 'blank.png')
im = Image.new('RGB', (600 * S, 340 * S), PAPER); d = ImageDraw.Draw(im)
def spiral2(cx, cy, r0, r1, turns, w):
    pts = [((cx + (r0 + (r1 - r0) * i / 600) * math.cos(i / 600 * turns * 6.283)) * S, (cy + (r0 + (r1 - r0) * i / 600) * math.sin(i / 600 * turns * 6.283)) * S) for i in range(601)]
    d.line(pts, fill=INK, width=int(w * S), joint='curve')
spiral2(300, 170, 8, 120, 5, 3)
im.resize((600, 340), Image.LANCZOS).save(os.path.join(D, 'tex', 'label.png'))
print('ok')
