# Procedural washi paper: warm off-white, soft mottling, long faint fibres.
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
W, H = 2400, 1350
rng = np.random.default_rng(7)
def blurnoise(scale, sigma):
    n = rng.standard_normal((H // scale + 2, W // scale + 2)).astype(np.float32)
    im = Image.fromarray(((n - n.min()) / (n.max() - n.min()) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    return np.asarray(im.filter(ImageFilter.GaussianBlur(sigma)), np.float32) / 255 - 0.5
m = blurnoise(60, 30) * 1.0 + blurnoise(12, 6) * 0.5 + blurnoise(2, 0.8) * 0.25
base = np.array([238, 232, 219], np.float32)
img = base[None, None, :] + m[..., None] * np.array([10, 10, 12])
fib = Image.new('L', (W, H), 0); d = ImageDraw.Draw(fib)
for _ in range(2600):
    x, y = rng.uniform(0, W), rng.uniform(0, H); a = rng.uniform(0, np.pi); L = rng.uniform(20, 140)
    pts = []
    for t in np.linspace(0, 1, 8):
        a += rng.normal(0, 0.25); x += np.cos(a) * L / 8; y += np.sin(a) * L / 8; pts.append((x, y))
    d.line(pts, fill=int(rng.uniform(40, 120)), width=1)
f = np.asarray(fib.filter(ImageFilter.GaussianBlur(0.7)), np.float32) / 255
img = img + f[..., None] * np.array([7, 6, 4]) * np.where(rng.random((H, W, 1)) > 0.5, 1, -1)
yy, xx = np.mgrid[0:H, 0:W]; r = np.hypot((xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2))
img *= (1 - 0.07 * np.clip(r - 0.5, 0, None) ** 1.5)[..., None]
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save('public/washi.jpg', quality=92)
