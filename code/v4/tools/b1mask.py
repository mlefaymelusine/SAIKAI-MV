# gpt-image rounds 6-7 -> masks for B1 (comp/b1sil.tsx FIGS): black silhouette on white -> white on transparent, cropped,
# placed in the figure's local units (feet / hip on 0 0). Reads the outputs staged from the user's PC; prints FIGS.
import json, sys
import numpy as np
from scipy.ndimage import grey_dilation
from PIL import Image, ImageDraw
GEN = '/mnt/user-data/uploads/mv_saikai/v4/gen/'
OUT = '/home/user/saikai/v4/public/img4/b1/'
# which file (the Ryoshu of now from round 7: user 10-26 02:26, her sword clearly in her hand), the height in units
# (head top to floor), the anchor (the middle of the legs, or his back) and where it goes
PICK = {'past': ('r6/out/past_2.png', 650, 'legs', 6), 'now': ('r7/out/now_1.png', 650, 'legs', 0), 'rien': ('r6/out/rien_1.png', 305, 'back', 66)}
# (user 10-26 02:26: the young Ryoshu's sword did not read as hers) cut away, in local units: it is redrawn by hand
# (PastSword) through the same fist
ERASE = {'past': [[(60, -386), (84, -380), (94, -372), (94, -352), (60, -356)],
                  [(125.5, -376), (430, -322), (430, -276), (125.5, -326)]],
         # (02:44: the Ryoshu of now wears it at the waist instead) round 7's sword below her hand, its guard and scabbard
         'now': [[(4, -292), (36, -292), (36, -284), (186, -6), (186, 8), (156, 8), (2, -262)]]}
# where round 7's hilt and gripping hand were only cut lines inside her body: filled solid (the arm under the jacket)
FILL = {'now': [[(-56, -364), (-40, -364), (-14, -339), (4, -339), (4, -292), (2, -262), (-34, -258), (-56, -296)],
                [(-12, -276), (3, -276), (5, -254), (-12, -249)],
                # (03:02) the gap between her body and the jacket's front edge, closed at the bottom once the hand was
                # gone, read as a hole: the arm hangs there under the jacket
                [(-24, -470), (8, -470), (8, -336), (-24, -336)]]}
# (03:02: her legs and body too slender; 03:03: only the Ryoshu of now) thickened by this many units all round below
# the head, less through the neck, none above the chin
THICKEN = {'now': 5.0}
CHIN = -575
res = {}
for w, (f, HU, how, ax) in PICK.items():
    L = np.asarray(Image.open(GEN + f).convert('L')).astype(np.float32)
    a = np.clip((232 - L) / (232 - 50), 0, 1)
    a[a < 0.04] = 0
    on = a > 0.5
    rows = np.where(on.any(1))[0]
    top = rows[0]
    cnt = on.sum(1)
    bottom = (np.where(cnt > 25)[0][-1] if how == 'legs' else rows[-1]) + 1
    s = HU / (bottom - top)  # units per px
    if how == 'legs':
        cs = []
        for y in range(int(top + 0.70 * (bottom - top)), int(top + 0.90 * (bottom - top))):
            r = on[y].astype(np.int8); d = np.diff(np.concatenate([[0], r, [0]]))
            st, en = np.where(d == 1)[0], np.where(d == -1)[0]
            if len(st): k = np.argmax(en - st); cs.append((st[k] + en[k]) / 2)
        anchor = float(np.median(cs))
    else:
        anchor = float(np.where(on[int(top + 0.5 * (bottom - top)):bottom].any(0))[0][-1])
    for polys, v in ((FILL.get(w, []), 1), (ERASE.get(w, []), 0)):
        if not polys: continue
        m = Image.new('L', (a.shape[1], a.shape[0]), 0); d = ImageDraw.Draw(m)
        for poly in polys: d.polygon([(anchor + (x - ax) / s, bottom + y / s) for x, y in poly], fill=255)
        a[np.asarray(m) > 0] = v
    if w in THICKEN:
        # rows by height in local units: 0 above the chin, a third and two thirds of it through the neck, all of it below
        yl = (np.arange(a.shape[0]) - bottom) * s
        out = a.copy()
        for frac, lo, hi in ((1 / 3, CHIN, CHIN + 15), (2 / 3, CHIN + 15, CHIN + 30), (1, CHIN + 30, 1e9)):
            r = THICKEN[w] * frac / s
            n = int(np.ceil(r)); yy, xx = np.mgrid[-n:n + 1, -n:n + 1]
            dil = grey_dilation(a, footprint=(xx * xx + yy * yy) <= r * r)
            band = (yl >= lo) & (yl < hi)
            out[band] = dil[band]
        out[int(bottom):] = 0   # nothing below the floor
        a = out
    on = a > 0.5
    rows = np.where(on.any(1))[0]; cols = np.where(on.any(0))[0]
    x0, x1 = max(cols[0] - 4, 0), min(cols[-1] + 5, L.shape[1]); y0, y1 = max(rows[0] - 4, 0), min(rows[-1] + 5, L.shape[0])
    crop = a[y0:y1, x0:x1]
    img = np.zeros(crop.shape + (4,), np.uint8); img[..., :3] = 255; img[..., 3] = (crop * 255 + 0.5).astype(np.uint8)
    Image.fromarray(img, 'RGBA').save(OUT + w + '.png', optimize=True)
    res[w] = {'src': f'img4/b1/{w}.png', 'x': round(float(ax + (x0 - anchor) * s), 1), 'y': round(float((y0 - bottom) * s), 1),
              'w': round(float((x1 - x0) * s), 1), 'h': round(float((y1 - y0) * s), 1)}
    print(w, f, 'top', top, 'bottom', bottom, 'anchor', anchor, 'scale', round(s, 4), res[w])
json.dump(res, open('/tmp/claude-0/c/r6/figs.json', 'w'))
