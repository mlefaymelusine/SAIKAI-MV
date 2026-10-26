# Scratches for the inside of the safe (user 10-24 reference: the walls and the inside of the door are covered in
# them). Claw marks: three or four strokes side by side, dragged mostly downward, most of them low, where a small
# child could reach. scratch_wall.png: ink on white (multiplied); scratch_door.png: light on black (a mask).
from PIL import Image, ImageDraw
import math, os, random
D = os.path.dirname(os.path.abspath(__file__))
N, S = 1024, 2

def marks(seed, n, fine):
    R = random.Random(seed)
    im = Image.new('L', (N * S, N * S), 0); d = ImageDraw.Draw(im)
    def stroke(x, y, a, L, w, curve):
        pts = []
        for i in range(24):
            t = i / 23
            pts.append(((x + math.cos(a) * L * t + math.cos(a + 1.57) * curve * math.sin(math.pi * t)) * S,
                        (y + math.sin(a) * L * t + math.sin(a + 1.57) * curve * math.sin(math.pi * t)) * S))
        for i in range(23):
            t = i / 22
            d.line([pts[i], pts[i + 1]], fill=int(255 * (0.55 + 0.45 * math.sin(math.pi * t))), width=max(1, int(w * S * math.sin(math.pi * (0.1 + 0.8 * t)))))
    for _ in range(n):
        y = N * (0.25 + 0.75 * R.random() ** 0.7); x = R.random() * N
        a = math.radians(90 + (R.random() - 0.5) * 70)                 # downward, give or take
        L = 60 + R.random() * 220; k = R.randint(3, 4); gap = 9 + R.random() * 6; curve = (R.random() - 0.5) * 30
        for j in range(k):
            ox = math.cos(a + 1.57) * gap * (j - k / 2); oy = math.sin(a + 1.57) * gap * (j - k / 2)
            stroke(x + ox + R.random() * 4, y + oy + R.random() * 10, a + (R.random() - 0.5) * 0.06, L * (0.75 + 0.35 * R.random()), 3.2, curve)
    for _ in range(fine):
        x, y = R.random() * N, R.random() * N; a = R.random() * math.pi * 2
        stroke(x, y, a, 20 + R.random() * 90, 1.2, (R.random() - 0.5) * 10)
    return im.resize((N, N), Image.LANCZOS)

m = marks(7, 46, 160)
Image.eval(m, lambda v: 255 - int(v * 0.85)).save(os.path.join(D, 'tex', 'scratch_wall.png'))
marks(19, 38, 140).save(os.path.join(D, 'tex', 'scratch_door.png'))
print('ok')
