# SAIKAI v4, gpt-image round 7 (user 10-26 02:26, on preview 57: the Ryoshu of now is caught between wearing her sword
# at the waist and holding it; pick one). Picked: holding it, as in the official sprite (the sheathed katana gripped by
# the scabbard below the guard). Only that figure is redone, from round 6's now_1.png; the young Ryoshu's sword is
# redrawn by hand in src/comp/b1sil.tsx.
# Inputs: ../r6/out/now_1.png (the figure to keep), ./in/ryoshu_body.png (a crop of the official sprite, for the grip).
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

STYLE = """Style: exactly as image 1. ONE flat, solid, pure black (#000000) silhouette on a pure white (#ffffff) background, like a Japanese kirie paper cut-out or a shadow-puppet figure. No gradients, no shading, no grey, no outlines, no facial features, no floor line, no cast shadow, no text, nothing else in the picture. Crisp, smooth scissor-cut edges. Clear gaps of white wherever the background shows through: between her arm and her body, between the scabbard and her legs."""

NOW = """Image 1 is a silhouette from my cut-paper animation, black on white. Keep this woman exactly as she is: the same place and size in the frame, the same short bob and bowed head in profile facing LEFT, the same long jacket draped over her shoulders like a cape, the same slim trousers and shoes, the same stance.

Change ONLY her sword, because right now it is unclear whether it is tucked into her belt or held in her hand. Make it unmistakable that she HOLDS it in her hand, the way this character does in image 2 (the official art; use it only for how she holds the sword and what the sword looks like): her near arm comes out from under the front edge of the jacket and hangs down relaxed at her side, a little in front of her thigh, the gloved hand clearly visible as a hand, gripping her SHEATHED katana by the scabbard just below the large round guard. The long scabbard slants forward and down in front of her legs (with a thin white gap between it and her legs), its end near the floor in front of her toes; the last third of the scabbard is bound in criss-cross cord, shown as a few thin white diagonal cut lines. Above her hand, the large round tsuba guard and the long hilt point up and back behind her, partly hidden by the jacket. Remove the old drawn blade completely: no bare blade anywhere.

""" + STYLE

HERE_R6 = os.path.join(HERE, '..', 'r6', 'out')
JOBS = [
    {'id': 'now', 'n': 2, 'size': '1024x1536',
     'images': [os.path.join(HERE_R6, 'now_1.png'), os.path.join(IN, 'ryoshu_body.png')], 'prompt': NOW},
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
