# SAIKAI v4, gpt-image round 6 (user 10-26 01:49: B1 as silhouettes, after a friend's idea; draw them by hand first, then
# have gpt-image clean them up together with the CGs). Three figures, each one black silhouette on white, to be used as
# masks in src/comp/b1sil.tsx: the young Ryoshu, the Ryoshu of now, Rien slumped against the wall.
# Inputs in ./in: sketch_*.png (my hand-drawn shapes, the pose and framing to keep), cg_cut.png and cg_rien.png (the
# Canto IX CGs the user sent); the official sprites are read from work/official as outfit references only.
# Run from anywhere:  python gen.py [job ids]
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
        fields['output_format'] = 'png'
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

STYLE = """Style: ONE flat, solid, pure black (#000000) silhouette on a pure white (#ffffff) background, like a Japanese kirie paper cut-out or a shadow-puppet figure. No gradients, no shading, no grey, no outlines, no inner detail lines, no facial features, no floor line, no cast shadow, no text, nothing else in the picture. The outline alone must tell the story: the profile of the face (brow, nose, lips, chin), the hair, the clothes, the hands, and clear gaps of white wherever the background would show through (between an arm and the body, between the legs, between the blade and the body). Crisp, smooth, elegant scissor-cut edges, natural proportions (about 7.5 heads tall for a standing adult). Keep the same place, size and framing as the sketch in image 1, the whole figure inside the frame with a margin."""

PAST = """Image 1 is my rough hand-made sketch for one shot of a cut-paper animation: a solid black silhouette on white. It shows the pose and the framing I want, but it is drawn clumsily (stick legs, a box for a body, a stiff arm).

Redraw it as a clean, graceful, anatomically correct silhouette of the same person in the same pose:
A slender young woman of about twenty standing in strict side view, facing RIGHT, her feet on one level line near the bottom of the picture. Very long, straight black hair falling down her back to her hips, straight-cut bangs. Her outfit as in image 3 (use it only for the clothes and the hair; ignore the faces and the sheath on her back): a fitted black zip-up track jacket, slim black trousers, chunky sneakers. Her near arm reaches down and forward and her hand grips the hilt of a drawn Japanese katana (a round tsuba hand guard), held low; the long, thin, slightly curved blade points forward, almost level, a little downwards, towards a man sitting off-frame to the right. Her other arm hangs at her side. She stands still with her weight on both feet, her head a little bowed, looking at him. Image 2 is the scene this comes from (she is on the left, her blade reaching towards him): take her hair, the way she holds the sword and the stillness from it, not its camera angle.

""" + STYLE

NOW = """Image 1 is my rough hand-made sketch for one shot of a cut-paper animation: a solid black silhouette on white. It shows the pose and the framing I want, but it is drawn clumsily (stick legs, a box for a body).

Redraw it as a clean, graceful, anatomically correct silhouette of the same person in the same pose:
The same woman years later, about thirty, standing in strict side view, facing LEFT, her back turned to a man sitting off-frame to the right, her feet on one level line near the bottom of the picture. Her outfit and hair as in image 2 (use it only for the clothes, the hair and the sword; ignore the faces): a short black bob cut straight at the jaw with straight bangs; a long black suit jacket worn draped over her shoulders like a cape, its sleeves hanging empty, falling to mid-thigh and flaring a little behind her; slim black trousers; black flat shoes. Her hand comes out from under the jacket and holds a Japanese katana by the hilt at her side (a round tsuba hand guard); the long, thin, slightly curved blade is let down and trails back behind her, its point near the floor behind her heels, as in the sketch. She stands still, upright, her head a little bowed.

""" + STYLE

RIEN = """Image 1 is my rough hand-made sketch for one shot of a cut-paper animation: a solid black silhouette on white. It shows the pose and the framing I want, but it is drawn clumsily (tubes for limbs, a box for a body).

Redraw it as a clean, anatomically correct silhouette of the same man in the same pose:
A tall, slim man sitting on the floor, slumped back against a wall (the wall itself is not drawn), seen in strict side view, facing LEFT. He is badly wounded and spent, as in image 2: his back against the wall, his head fallen forward and down onto his chest, one leg stretched out along the floor towards the left with the shoe tipped up, the other knee drawn up, the near arm hanging down with the fist resting on the floor beside his hip. His figure and clothes as in image 3 (use it only for the build, the hair and the suit; ignore the face): a black suit with a long jacket and a tie, its skirt spread on the floor around him, short slicked-back hair with a few strands falling forward over the face. Image 2 shows him from the front; turn the same pose to a side view facing left.

""" + STYLE

JOBS = [
    {'id': 'past', 'n': 2, 'size': '1024x1536',
     'images': [os.path.join(IN, 'sketch_past.png'), os.path.join(IN, 'cg_cut.png'), os.path.join(OFFICIAL, 'body', 'Ryoshu_Past.png')], 'prompt': PAST},
    {'id': 'now', 'n': 2, 'size': '1024x1536',
     'images': [os.path.join(IN, 'sketch_now.png'), os.path.join(OFFICIAL, 'Ryoshu.png')], 'prompt': NOW},
    {'id': 'rien', 'n': 2, 'size': '1536x1024',
     'images': [os.path.join(IN, 'sketch_rien.png'), os.path.join(IN, 'cg_rien.png'), os.path.join(OFFICIAL, 'body', 'IndexFather.png')], 'prompt': RIEN},
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
