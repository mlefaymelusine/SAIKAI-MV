# Solve a clean RGBA cut-out of the walk composite by rendering it on black and on white.
import os, subprocess, sys, tempfile, numpy as np
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__))
T = tempfile.mkdtemp()
OUTDIR = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, '../public/img4')
def run(bg, out, extra):
    env = dict(os.environ, WALK_BG=bg, WALK_NOISE='0', WALK_THREAD='0', **extra)
    subprocess.run([sys.executable, os.path.join(D, 'walk_layers.py'), out], env=env, check=True)
for name, extra in (('walk_pair', {}), ('walk_alone', {'WALK_ALONE': '1'})):
    run('0,0,0', os.path.join(T, '_wb.png'), extra); run('255,255,255', os.path.join(T, '_ww.png'), extra)
    b = np.asarray(Image.open(os.path.join(T, '_wb.png'))).astype(float); w = np.asarray(Image.open(os.path.join(T, '_ww.png'))).astype(float)
    a = np.clip(1 - (w - b).mean(2) / 255, 0, 1)
    rgb = np.where(a[..., None] > 0.004, b / np.maximum(a[..., None], 0.004), 0)
    out = np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)
    im = Image.fromarray(out, 'RGBA'); bb = im.getbbox(); print(name, im.size, bb)
    im.save(os.path.join(OUTDIR, name + '.png'))
