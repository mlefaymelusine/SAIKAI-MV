# Download Google Fonts subsets covering every non-ASCII char used in src/.
import re, glob, urllib.request, urllib.parse
txt = "".join(open(f, encoding="utf-8").read() for f in glob.glob("src/**/*.ts*", recursive=True) + ["src/data/lyrics.json"])
chars = "".join(sorted(set(c for c in txt if ord(c) > 127)))
asc = "".join(chr(i) for i in range(32, 127))
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
fams = [("Noto Serif SC", "wght@300", "sc", chars + asc), ("Yuji Syuku", "wght@400", "brush", chars + asc),
        ("Cormorant Garamond", "ital,wght@1,400", "en_i", asc + "·—–’‘“”…"), ("Cormorant Garamond", "wght@400", "en", asc + "·—–’‘“”…")]
for fam, w, key, text in fams:
    url = f"https://fonts.googleapis.com/css2?family={urllib.parse.quote(fam)}:{w}&text={urllib.parse.quote(text)}"
    css = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA})).read().decode()
    srcs = re.findall(r"url\((.*?)\)", css)
    assert len(srcs) == 1, (fam, len(srcs))
    open(f"public/fonts/{key}.woff2", "wb").write(urllib.request.urlopen(urllib.request.Request(srcs[0], headers={"User-Agent": UA})).read())
    print(key, len(text))
