# SAIKAI v4, gpt-image round 3 (user approved 10-24 21:28/21:29: W5 girl behind the glass, C2 rooftop figures).
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

C2 = """Edit image 1. Image 1 is a layout of the foreground of one shot from a hand-made cut-paper animation: two figures seen from behind, sitting on a flat rooftop at night, looking up at two moons; between them a small glowing lunch box; to the right a small red cup and a red randoseru (Japanese school backpack). Image 2 shows the whole shot these figures will be placed into (starry blue-violet sky, hydrangea bushes, the dark doorway we look out from). Image 3 is the original illustration this shot is inspired by: use it only to understand the poses and the mood, do not copy it.

Redraw ONLY these foreground figures and objects, in exactly the same positions and at the same sizes as in image 1, on a fully transparent background: no sky, no roof, no floor, no doorway, no moons, no bushes, no shadows on the ground.

Style: flat cut-paper (kirie) silhouettes at night, matching image 2: solid blue-black shapes (#0b0914) with crisp scissor-cut edges and a thin pale lavender rim light (#c4b6f4) along their upper and left edges from the moonlit sky. No faces, no gradients, no texture inside the shapes, no outlines other than the rim light. The lunch box is pale lilac-white with a soft warm glow; the cup and the randoseru are flat red (#c0182c) with a darker red side, also with a thin rim light.

LEFT figure: Ryoshu, an adult woman, slim, kneeling upright (seiza) with her back to us; short straight black bob haircut, chin length; a long coat over her shoulders. She carries a long Japanese katana in its scabbard slung diagonally across her back: the hilt rises above her left shoulder and the scabbard runs down behind her to the floor at her right. Hilt, guard and scabbard form ONE perfectly straight, rigid line: the sword must not bend or kink.
RIGHT figure: Araya, her small daughter, about seven years old, sitting on the floor close to her mother with her back to us, leaning a little toward her; very long straight black hair down past her waist; a small white ribbon bow in her hair.
Correct, natural anatomy and proportions. Do not draw any red thread or string. Keep everything else empty and transparent."""

W5 = """Edit image 1. Image 1 is a layout for a close-up shot in a hand-made cut-paper animation: a teenage girl, Araya (about 15), faces the viewer at table height, her chin resting on her folded arms on a table, looking a little down and to the left at something in front of her. Redraw it as a finished illustration with exactly the same framing, positions and sizes: her face, hair, shoulders and arms must stay where they are, so that it lines up with the rest of the shot.

Style: flat cut-paper (kirie) collage like the rest of the film: a warm cream washi paper wall (#ece4d4) with a faint paper fibre texture; large clean flat shapes with crisp scissor-cut edges and a soft offset paper drop shadow; no black outlines, no gradients, no realistic shading.
Her: long straight black hair with a blunt straight fringe, falling over her shoulders onto her arms; a white school blouse with long sleeves and a navy vest (#26345c). FACE. Her folded forearms rest on the table, one hand just showing.
Image 2 is a reference for her hair and school uniform only: do not copy its drawing style.
Do NOT draw a glass, cup, tap, water or anything in front of her: the space in front of her face must stay clear (a glass will be composited there later). The table: a pale beige top and a slightly darker front edge."""
EYES = "Face: minimal and quiet: two small dark eyes with a tiny white highlight, looking down-left; no nose, at most a tiny calm mouth; a little sad, not cute, not glossy anime."
BLANK = "Face: no facial features at all, a blank paper face, like a paper doll."

JOBS = [
    {'id': 'c2_pair', 'n': 3, 'size': '1536x1024', 'background': 'transparent',
     'images': [os.path.join(IN, 'c2_layout.png'), os.path.join(IN, 'c2_full.jpg'), os.path.join(IN, 'c2_ref_cg.png')], 'prompt': C2},
    {'id': 'w5_eyes', 'n': 2, 'size': '1536x1024', 'background': 'opaque',
     'images': [os.path.join(IN, 'w5_layout.png'), os.path.join(OFFICIAL, 'Araya_Teen.png')], 'prompt': W5.replace('FACE.', EYES)},
    {'id': 'w5_blank', 'n': 1, 'size': '1536x1024', 'background': 'opaque',
     'images': [os.path.join(IN, 'w5_layout.png'), os.path.join(OFFICIAL, 'Araya_Teen.png')], 'prompt': W5.replace('FACE.', BLANK)},
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
