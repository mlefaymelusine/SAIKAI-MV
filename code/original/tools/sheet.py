# python tools/sheet.py <dir> <out.jpg> [cols] : grid of all jpgs in dir with timestamps
import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
fs = sorted(glob.glob(os.path.join(d, 'f_*.jpg')), key=lambda f: float(os.path.basename(f)[2:-4]))
w, h = 480, 270
rows = (len(fs) + cols - 1) // cols
S = Image.new('RGB', (cols * w, rows * (h + 22)), (30, 30, 30)); D = ImageDraw.Draw(S)
for i, f in enumerate(fs):
    im = Image.open(f).resize((w, h)); x, y = (i % cols) * w, (i // cols) * (h + 22)
    S.paste(im, (x, y + 22)); t = float(os.path.basename(f)[2:-4]); D.text((x + 6, y + 4), f'{int(t // 60)}:{t % 60:05.2f}', fill=(230, 230, 230))
S.save(out, quality=85)
