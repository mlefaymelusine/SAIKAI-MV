# SAIKAI v4, gpt-image round 4 (user 10-24 21:28 approved gpt-image for W5; 22:01: fix the perspective, head tilted on
# her left arm, faceless, one indigo streak in the hair). Only the W5 girl behind the glass.
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

W5 = """Edit image 1. Image 1 is a rough layout for a close-up shot in a hand-made cut-paper animation, seen by a low camera at about the height of her face, just above the table top. A teenage girl, Araya (about 15), sits at a table facing us and leans forward: her forearms are folded on the table and she rests her head on her left forearm (the arm on the right side of the picture). Her head is tilted about 40 degrees: the top of her head points up and to the right of the picture, and her left cheek rests on that arm. Redraw it as a finished illustration with exactly the same framing, camera height, positions, sizes and tilt: her head, face, hair, shoulders and arms must stay exactly where they are, so that it lines up with a glass that will be composited in front of her later.

Image 2 is an earlier frame of the same film that the director approved: match its style, colours and paper texture exactly (cream washi paper wall, large flat cut-paper shapes with crisp scissor-cut edges and a soft offset paper drop shadow, no black outlines, no gradients, no realistic shading). Only her pose and the camera change.

Her: long straight black hair with a blunt straight fringe; because her head is tilted, the hair falls with gravity, down over her shoulders, and on the right it spills over her left forearm onto the table. In that hair there is ONE thin indigo-blue streak (#4a4fb0), like the blue-violet inner hair of the girl in image 3 (use image 3 only for that colour, not for its drawing style or face). Face: no facial features at all, a blank paper face, like a paper doll. White school blouse with long sleeves, navy vest (#26345c); her hands are hidden in the folded sleeves.
The table: a large pale warm beige table top (#d9cab0) seen in perspective from the low camera, filling the lower part of the picture; its far edge is a straight horizontal line behind her, at about the height of her elbows; no front edge is visible. A soft paper shadow of her arms on the table.
Do NOT draw a glass, cup, tap, water or anything else in the foreground: the lower middle of the picture must stay clear, empty table top (a glass will be composited there later)."""

JOBS = [
    {'id': 'w5_tilt', 'n': 2, 'size': '1536x1024', 'background': 'opaque',
     'images': [os.path.join(IN, 'w5_layout4.png'), os.path.join(IN, 'w5_style.png'), os.path.join(OFFICIAL, 'Araya.png')], 'prompt': W5},
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
