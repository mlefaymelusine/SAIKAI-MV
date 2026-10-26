"""Subset the MV fonts from Google Fonts to exactly the characters v4 uses.
woff2 -> public/fonts (names match theme.ts); --ttf TEXT writes TTFs for PIL/Blender into tools/ttf. Run: python v4/tools/fonts.py"""
import re, sys, glob, json, urllib.request, urllib.parse, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FACES = [  # file stem, family, axis spec
    ('sc_300_normal_0', 'Noto Serif SC', 'wght@300'),
    ('sc_500_normal_1', 'Noto Serif SC', 'wght@500'),
    ('jp_400_normal_0', 'Shippori Mincho B1', 'wght@400'),
    ('brush_400_normal_0', 'Yuji Syuku', 'wght@400'),
    ('en_i_400_italic_0', 'Cormorant Garamond', 'ital,wght@1,400'),
    ('en_i_600_italic_1', 'Cormorant Garamond', 'ital,wght@1,600'),
    ('en_400_normal_0', 'Cormorant Garamond', 'wght@400'),
    ('en_600_normal_1', 'Cormorant Garamond', 'wght@600'),
]
NEW_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
OLD_UA = 'Mozilla/4.0'  # gets truetype

def fetch(family, spec, text, ua):
    q = urllib.parse.urlencode({'family': f'{family}:{spec}', 'text': text})
    css = urllib.request.urlopen(urllib.request.Request('https://fonts.googleapis.com/css2?' + q, headers={'User-Agent': ua}), timeout=60).read().decode()
    urls = re.findall(r'url\((https://[^)]+)\)', css)
    return [urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': ua}), timeout=60).read() for u in urls]

def used_text():
    chars = set()
    for f in glob.glob(os.path.join(ROOT, 'src/**/*.*'), recursive=True):
        chars |= set(open(f, encoding='utf-8').read())
    chars |= set('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ .,;:!?\'"-–—…·「」“”‘’（）()／/')
    return ''.join(sorted(c for c in chars if c.isprintable()))

if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--ttf':
        text = sys.argv[2]
        for stem, fam, spec in FACES:
            if stem.startswith(('sc_500', 'brush', 'en_400', 'en_i_400')):
                data = fetch(fam, spec, text, OLD_UA)[0]
                open(os.path.join(ROOT, 'tools/ttf', stem + '.ttf'), 'wb').write(data)
                print(stem, len(data))
        sys.exit()
    text = used_text()
    out = os.path.join(ROOT, 'public/fonts'); os.makedirs(out, exist_ok=True)
    for stem, fam, spec in FACES:
        parts = fetch(fam, spec, text, NEW_UA)
        assert len(parts) == 1, (stem, len(parts))
        open(os.path.join(out, stem + '.woff2'), 'wb').write(parts[0])
        print(stem, len(parts[0]))
    print(len(text), 'chars')
