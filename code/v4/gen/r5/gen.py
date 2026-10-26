# SAIKAI v4, gpt-image round 5 (user 10-24 23:30: the ox on the opening folding screen can be redrawn with gpt-image).
# Only the ox, alone on a transparent background, to be composited into the screen picture (src/comp/hellscreen.ts).
# Run from anywhere:  python gen.py
# Reads the OpenAI key from the environment (OPENAI_API_KEY, or the Windows user environment). Never prints it.
# Writes PNGs to ./out/ next to this file and a log without secrets to ./out/log.json.
import base64, json, os, sys, time, uuid, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
IN, OUT = os.path.join(HERE, 'in'), os.path.join(HERE, 'out')
os.makedirs(OUT, exist_ok=True)
OFFICIAL = os.path.normpath(os.path.join(HERE, '..', '..', '..', 'work', 'official'))
MODELS = ['gpt-image-2', 'gpt-image-1.5', 'gpt-image-1']

def key():
    k = os.environ.get('OPENAI_API_KEY')
    if not k and sys.platform == 'win32':
        import winreg
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, 'Environment') as h:
                k = winreg.QueryValueEx(h, 'OPENAI_API_KEY')[0]
        except OSError:
            k = None
    if not k:
        sys.exit('no OPENAI_API_KEY in the environment')
    return k

def multipart(fields, files):
    b = uuid.uuid4().hex
    out = []
    for n, v in fields.items():
        out += [f'--{b}\r\nContent-Disposition: form-data; name="{n}"\r\n\r\n{v}\r\n'.encode()]
    for n, path in files:
        mime = 'image/png' if path.lower().endswith('.png') else 'image/jpeg'
        with open(path, 'rb') as f: data = f.read()
        out += [f'--{b}\r\nContent-Disposition: form-data; name="{n}"; filename="{os.path.basename(path)}"\r\nContent-Type: {mime}\r\n\r\n'.encode(), data, b'\r\n']
    out += [f'--{b}--\r\n'.encode()]
    return b''.join(out), f'multipart/form-data; boundary={b}'

def edit(job, K, log):
    last = None
    for model in MODELS:
        fields = {'model': model, 'prompt': job['prompt'], 'size': job['size'], 'quality': 'high', 'n': str(job['n'])}
        if job.get('background'): fields['background'] = job['background']
        if model != 'dall-e-2': fields['output_format'] = 'png'
        body, ctype = multipart(fields, [('image[]', p) for p in job['images']])
        req = urllib.request.Request('https://api.openai.com/v1/images/edits', data=body, method='POST',
                                     headers={'Authorization': 'Bearer ' + K, 'Content-Type': ctype})
        t0 = time.time()
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                res = json.loads(r.read())
        except urllib.error.HTTPError as e:
            msg = e.read().decode('utf-8', 'replace')[:400]
            last = f'{model}: HTTP {e.code} {msg}'
            log.append({'job': job['id'], 'model': model, 'error': last})
            print(job['id'], 'failed with', model, '-', e.code, flush=True)
            continue
        names = []
        for i, d in enumerate(res.get('data', [])):
            name = f"{job['id']}_{i + 1}.png"
            with open(os.path.join(OUT, name), 'wb') as f: f.write(base64.b64decode(d['b64_json']))
            names.append(name)
        log.append({'job': job['id'], 'model': model, 'files': names, 'secs': round(time.time() - t0, 1), 'usage': res.get('usage')})
        print(job['id'], 'ok with', model, names, flush=True)
        return
    print(job['id'], 'gave up:', last, flush=True)

OX = """Image 1 is a frame from a hand-made cut-paper animation: a folding-screen picture of the burning ox-cart from Akutagawa's "Hell Screen" (Jigokuhen), Heian Japan. Everything in it is flat cut paper: solid black ink-paper shapes with thin cream cut lines for detail, red accents, gold clouds, on cream paper. The ox on the right that pulls the cart is drawn badly: a box on stick legs.

Draw a new ox to replace it: ONLY the ox, alone, on a fully transparent background, and nothing else (no cart, no shafts, no clouds, no ground line, no shadow, no text).
A strong Japanese black bullock (kuroushi) of the kind that pulled Heian ox-carts (gissha), in strict side view facing RIGHT, walking slowly with its head a little lowered, as in classical yamato-e scroll paintings of ox-carts. Natural anatomy: heavy shoulders, deep chest with a hanging dewlap, a long straight back, rounded haunches, legs with real knees and hocks and cloven hooves, a thin tail with a tuft hanging down behind. Short horns curving forward and up. Across the top of its neck, just in front of the shoulders, a plain black wooden yoke bar where the cart shafts will be fastened. A thin red nose cord from its nose running back along the neck.

Style: exactly the style of image 1. One solid black (#0e0b10) flat silhouette, no gradients, no realistic shading, no outline strokes around it; the muscles, the folds of the dewlap, the eye, the ear and the curly forelock are shown only by a few thin, elegant cream (#ece4d4) cut lines and small cut-out shapes, like Japanese kirie paper-cutting. The cord is flat red (#c0182c). Crisp scissor-cut edges. The ox fills most of the picture, whole, with a small margin around it, its hooves on one level line near the bottom."""

JOBS = [
    {'id': 'ox', 'n': 2, 'size': '1536x1024', 'background': 'transparent',
     'images': [os.path.join(IN, 'ox_screen.png')], 'prompt': OX},
]

if __name__ == '__main__':
    only = sys.argv[1:]
    K = key()
    log = []
    for job in JOBS:
        if only and job['id'] not in only: continue
        missing = [p for p in job['images'] if not os.path.exists(p)]
        if missing:
            print(job['id'], 'missing input', missing, flush=True); continue
        edit(job, K, log)
    with open(os.path.join(OUT, 'log.json'), 'w', encoding='utf-8') as f: json.dump(log, f, indent=1, ensure_ascii=False)
    print('done', flush=True)
