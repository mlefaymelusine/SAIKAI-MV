import math, os
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np, math, sys
from scipy import ndimage
SRC=os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../work/gen_r2/reunion_r2_3.png')   # mv_saikai/work
a=np.asarray(Image.open(SRC).convert('RGB')).astype(float)
H,W=a.shape[:2]
lum=a.mean(2)
PAPER=np.array((236,228,212.)); BLACK=np.array((22,20,22.)); NAVY=np.array((38,52,92.)); RED=np.array((176,30,40.)); WHITE=np.array((250,248,242.))
paper_l=np.median(lum[:60,:60])
a_red=np.clip(((a[...,0]-a[...,1])-40)/40,0,1)*(a[...,0]>70)
red=a_red>0.5
ink=np.clip((paper_l-lum)/(paper_l-15),0,1)          # soft coverage, keeps keylines + AA
ink[red]=0
dark=lum<90
navy=dark&((a[...,2]-a[...,0])>12)
navy=ndimage.binary_opening(navy,iterations=2)
lab,n=ndimage.label(navy); sz=ndimage.sum(navy,lab,range(1,n+1)); navy=np.isin(lab,np.where(sz>2000)[0]+1)
navy=ndimage.binary_fill_holes(ndimage.binary_closing(navy,iterations=4))
blk=ndimage.binary_opening(dark&~navy,iterations=2)
lab,n=ndimage.label(blk); sz=ndimage.sum(blk,lab,range(1,n+1)); ryo_mass=np.isin(lab,np.where(sz>300)[0]+1)
ryo_zone=ndimage.binary_dilation(ryo_mass,iterations=3)
ara_zone=~ryo_zone|navy
near_ryo=ndimage.binary_dilation(ryo_mass,iterations=4)
a_ara=ink*ara_zone; a_ryo=ink*~ara_zone*near_ryo
def comp(layers):
    o=np.tile(PAPER,(H,W,1))
    for al,col in layers: o=o*(1-al[...,None])+col*al[...,None]
    return Image.fromarray(np.clip(o,0,255).astype(np.uint8))

# ---------- dissolve: Araya's navy plate goes, the white sheath stays ----------
pap=lum>150
lab,n=ndimage.label(pap); sz=ndimage.sum(pap,lab,range(1,n+1))
Xg=np.arange(W)[None,:]; Yg=np.arange(H)[:,None]
box=(Xg>=800)&(Xg<=975)&(Yg>=460)&(Yg<=590)
cand=[i+1 for i in range(n) if sz[i]<20000]
hand_parts=np.isin(lab,[l for l in np.unique(lab[box]) if l in set(cand)])&box
hand=ndimage.binary_fill_holes(ndimage.binary_closing(hand_parts,iterations=4))
lab2,n2=ndimage.label(hand); hand=lab2==(np.argmax(ndimage.sum(hand,lab2,range(1,n2+1)))+1)
hand_lines=ink*ndimage.binary_erosion(hand,iterations=3)                                   # finger cuts inside the hand
hand_edge=hand&~ndimage.binary_erosion(hand,iterations=2)
rng=np.random.default_rng(7)
def rank(v): return v.argsort(None).argsort().reshape(v.shape)/v.size
Nf=rank(ndimage.gaussian_filter(rng.random((H,W)),1.2))
sx0,sy0,sx1,sy1=790,300,1150,950
t=np.clip(((Xg-sx0)*(sx1-sx0)+(Yg-sy0)*(sy1-sy0))/((sx1-sx0)**2+(sy1-sy0)**2),0,1)
dist=np.hypot(Xg-(sx0+(sx1-sx0)*t),Yg-(sy0+(sy1-sy0)*t))
Dn=np.clip(dist/400,0,1)
N=0.45*Nf+0.55*(1-Dn)          # high N = near the sheath = goes last
fib=rng.normal(0,4,(H,W,1))
VIOLET=np.array((92,83,231.))
font=ImageFont.truetype(os.path.join(os.path.dirname(os.path.abspath(__file__)),'sc500.ttf'),23)
SX0,SY0,SX1,SY1=790,300,1150,950          # mouth near her cheek -> tip near the ground
def sh_axis(t):
    ang=math.atan2(SY1-SY0,SX1-SX0); nx,ny=-math.sin(ang),math.cos(ang)
    c=-26*math.sin(math.pi*t)                       # sori, bowing away from her body
    return SX0+(SX1-SX0)*t+nx*c, SY0+(SY1-SY0)*t+ny*c, nx, ny
def sheath_layer():
    S=2; L=Image.new('RGBA',(W*S,H*S),(0,0,0,0)); d=ImageDraw.Draw(L)
    def P(t,off):
        x,y,nx,ny=sh_axis(t); return ((x+nx*off)*S,(y+ny*off)*S)
    def hw(t): return 19-5*t                        # slight taper
    def band(t0,t1,extra,col,n=60):
        ts=[t0+(t1-t0)*i/n for i in range(n+1)]
        d.polygon([P(t,-(hw(t)+extra)) for t in ts]+[P(t,hw(t)+extra) for t in ts[::-1]],fill=col)
    BK=(22,20,22,255); WH=(250,248,242,255)
    band(0,1,0,BK,120); band(0.004,0.994,-2.6,WH,120)          # white saya, cut-paper keyline
    band(0.035,0.042,0,BK)                                     # koiguchi line
    band(0.15,0.175,4,BK); band(0.154,0.171,1.4,WH)            # kurikata
    band(0.982,1.0,0,BK)                                       # kojiri
    L=L.resize((W,H),Image.LANCZOS); return np.asarray(L).astype(float)/255
def sheath_text(level):
    T=Image.new('RGBA',(W,H),(0,0,0,0))
    phrases=['三生缘分','三千世界','三世因果']; slots=[]
    t=0.42
    for k,ph in enumerate(phrases):
        for ch in ph: slots.append((k,ch,t)); t+=0.039
        t+=0.022
    for k,ch,t in slots:
        al=np.clip(level*3-k,0,1)
        if al<=0: continue
        x,y,_,_=sh_axis(t); x2,y2,_,_=sh_axis(t+0.01)
        rot=math.degrees(math.atan2(x2-x,y2-y))
        g=Image.new('RGBA',(60,60),(0,0,0,0)); ImageDraw.Draw(g).text((30,30),ch,font=font,fill=(92,83,231,int(255*al)),anchor='mm')
        g=g.rotate(rot,resample=Image.BICUBIC)
        T.paste(g,(int(x-30),int(y-30)),g)
    return T
SH=sheath_layer()
def frame(p,text=0.0):
    o=np.tile(PAPER,(H,W,1))+fib
    def lay(al,col): 
        nonlocal o; o=o*(1-al[...,None])+np.asarray(col)*al[...,None]
    lay(a_ryo,BLACK); lay(a_red if KEEP_RED else np.clip(ndimage.binary_dilation(a_red>0.05,iterations=2)*1.0,0,1),RED if KEEP_RED else BLACK)
    gone=np.clip((p*1.3-0.15-N)/0.06,0,1)              # 1 where the navy plate has gone
    # sheath shows through where Araya has gone, and is fully there by the end
    sh_a=SH[...,3]*np.clip(gone+np.clip((p-0.75)/0.25,0,1),0,1)
    o=o*(1-sh_a[...,None])+(SH[...,:3]*255)*sh_a[...,None]
    dx,dy=int(round(10*p)),int(round(-5*p))           # the plate drifts off register as it goes
    ara=np.roll(np.roll(a_ara,dy,0),dx,1)*(1-np.roll(np.roll(gone,dy,0),dx,1))
    lay(ara,NAVY)
    hp=1.0                        # Ryoshu's hand becomes its own white piece
    lay(hand*hp*1.0,WHITE); lay(np.maximum(hand_edge*1.0,hand_lines)*hp,BLACK)
    img=Image.fromarray(np.clip(o,0,255).astype(np.uint8))
    if text>0:
        T=sheath_text(text); img.paste(T,(0,0),T)
    return img
KEEP_RED=False
# G2 sequence: p 0 -> 0.42, each frame placed on a 1920x1080 sheet of v4 paper
OUT=sys.argv[1]; NF=int(sys.argv[2]); os.makedirs(OUT,exist_ok=True)
rng2=np.random.default_rng(11)
sheet=np.clip(np.tile(PAPER,(1080,1920,1))+rng2.normal(0,3.5,(1080,1920,1)),0,255)
for i in range(NF):
    p=0.42*i/(NF-1)
    im=frame(p).resize((1440,960),Image.LANCZOS)
    o=sheet.copy(); o[60:1020,240:1680]=np.asarray(im).astype(float)
    Image.fromarray(o.astype(np.uint8)).save(os.path.join(OUT,f'{i+1:04d}.jpg'),quality=90)
    print(i,end=' ',flush=True)
