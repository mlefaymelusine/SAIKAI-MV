from PIL import Image, ImageDraw, ImageFilter
import numpy as np, math, sys
from scipy import ndimage
import os
HERE=os.path.dirname(os.path.abspath(__file__))
W=os.path.join(HERE,'../../work/')   # mv_saikai/work
OUT=sys.argv[1] if len(sys.argv)>1 else 'walk_frame.jpg'
A=np.asarray(Image.open(W+'gen_r2/walk_r2_2.png').convert('RGB')).astype(int)
B=np.asarray(Image.open(W+'gen_r1/walk_4.png').convert('RGB')).astype(int)
H,Wd=A.shape[:2]
def masks(a):
    lum=a.mean(2); red=((a[...,0]-a[...,2])>70)&(a[...,0]>110)
    return (lum<110)&~red, red, (lum>225)&(a[...,2]>215)
dA,rA,wA=masks(A); dB,rB,wB=masks(B)
X=np.arange(Wd)[None,:].repeat(H,0); Y=np.arange(H)[:,None].repeat(Wd,1)
def poly(pts):
    m=Image.new('L',(Wd,H),0); ImageDraw.Draw(m).polygon(pts,fill=255); return np.asarray(m)>0
# --- Ryoshu (walk_r2_2) ---
ryo_white=wA&(X<560)&(Y<600)
lab,n=ndimage.label(ryo_white); sz=ndimage.sum(ryo_white,lab,range(1,n+1)); ryo_white=np.isin(lab,np.where(sz>3000)[0]+1)
ryo_fig=ndimage.binary_closing(dA&(X<695)&(Y<=940),iterations=3)&(X<695)&(Y<=940)
ryo_line=np.clip((A.mean(2)-30)/70,0,1)*(ryo_fig&~ndimage.binary_dilation(ryo_white,iterations=3)&ndimage.binary_erosion(ryo_fig,iterations=1))
# face + neck cut out of the bob (coords = crop(380,40) + scaled/3); the bob hem stays black
c=lambda x,y:(380+x/3,40+y/3)
face=poly([c(448,281),c(640,281),c(640,560),c(230,560),c(240,418),c(448,500)])&(ryo_fig|ryo_white)&~ryo_white
face=np.asarray(Image.fromarray((face*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5)))>127
bg=~ryo_fig&~wA
face_line=face&~ndimage.binary_erosion(face,iterations=2)&ndimage.binary_dilation(bg,iterations=3)
# --- Araya (walk_4): solid figure, keylines re-cut continuously ---
lab,n=ndimage.label(rB&(X>655)); sz=ndimage.sum(rB&(X>655),lab,range(1,n+1)); obi=(lab==(np.argmax(sz)+1))
dB2=ndimage.binary_opening(dB&~ndimage.binary_dilation(rB&~obi,iterations=3),iterations=2)
lab,n=ndimage.label(dB2); sz=ndimage.sum(dB2,lab,range(1,n+1)); dB2=np.isin(lab,np.where(sz>300)[0]+1)
fig=ndimage.binary_closing(dB2|obi,iterations=3)&(X>655)&(Y<955)
fig=ndimage.binary_fill_holes(fig)
lab,n=ndimage.label(fig); sz=ndimage.sum(fig,lab,range(1,n+1)); fig=np.isin(lab,np.where(sz>300)[0]+1)
line=np.clip((B.mean(2)-30)/70,0,1)*(fig&~ndimage.binary_dilation(obi,iterations=2)&ndimage.binary_erosion(fig,iterations=1))
dx,dy=30,-14
def shift(m):
    o=np.zeros_like(m); o[max(0,dy):H+min(0,dy), max(0,dx):Wd+min(0,dx)] = m[max(0,-dy):H-max(0,dy), max(0,-dx):Wd-max(0,dx)]; return o
ara_fig,ara_line,ara_red=shift(fig),shift(line),shift(obi)
import os
PAPER=(236,228,212); BLACK=(22,20,22); NAVY=(38,52,92); RED=(176,30,40); WHITE=(250,248,242)
# v4 layer export: WALK_BG = background used to solve alpha, WALK_ALONE = Ryoshu by herself with the white sheath
BG=tuple(int(v) for v in os.environ.get('WALK_BG','236,228,212').split(','))
NOISE=float(os.environ.get('WALK_NOISE','4'))
ALONE=os.environ.get('WALK_ALONE')=='1'
THREAD=os.environ.get('WALK_THREAD','1')=='1'
S=2
rng=np.random.default_rng(3)
o=np.clip(np.full((H,Wd,3),BG,float)+rng.normal(0,NOISE,(H,Wd,1)),0,255).astype(np.uint8)
def put(m,col,clean=True,blur=0.8):
    if m.dtype!=bool:
        o[:]=(o*(1-m[...,None])+np.array(col)*m[...,None]).astype(np.uint8); return
    if clean: m=ndimage.binary_opening(ndimage.binary_closing(m,iterations=1),iterations=1)
    m=m.astype(float)
    if blur: m=np.asarray(Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur))).astype(float)/255
    o[:]=(o*(1-m[...,None])+np.array(col)*m[...,None]).astype(np.uint8)
def layer(draw_fn):
    L=Image.new('RGBA',(Wd*S,H*S),(0,0,0,0)); draw_fn(ImageDraw.Draw(L)); L=L.resize((Wd,H),Image.LANCZOS)
    im=Image.fromarray(o); im.paste(L,(0,0),L); o[:]=np.asarray(im)
# sword worn at the waist: tsuba at the coat's front edge, hilt forward-up, scabbard back-down behind the coat
gx,gy=556,470          # tsuba
ang=math.radians(163)  # direction from tsuba toward scabbard tip
def P(dist,off):
    x=gx+math.cos(ang)*dist; y=gy+math.sin(ang)*dist
    c=-0.00012*dist*(dist-470)*-1 if dist>0 else 0  # slight sori on the scabbard
    nx,ny=-math.sin(ang),math.cos(ang); return ((x+nx*(off+c))*S,(y+ny*(off+c))*S)
def band(d0,d1,w,col,dr):
    pts=[P(d0+(d1-d0)*i/20,-w) for i in range(21)]+[P(d1-(d1-d0)*i/20,w) for i in range(21)]; dr.polygon(pts,fill=col)
def scabbard(dr):
    if ALONE:  # the white sheath Arayashiki, with a cut-paper keyline
        band(8,470,11,BLACK+(255,),dr); band(10,467,8.4,WHITE+(255,),dr)
        band(60,74,11.6,BLACK+(255,),dr); band(63,71,9.0,WHITE+(255,),dr)   # kurikata
        band(462,470,11,BLACK+(255,),dr); return
    band(8,470,11,BLACK+(255,),dr)
    band(452,470,11.5,RED+(255,),dr)   # red kojiri
def hilt(dr):
    band(-118,-4,9.5,BLACK+(255,),dr)
    for k in range(7): band(-112+k*16,-105+k*16,10,RED+(255,),dr)
    band(-6,8,16,BLACK+(255,),dr)   # tsuba
    x0,y0=P(-118,0)
    dr.line([(x0,y0),(x0+3*S,y0+40*S)],fill=RED+(255,),width=3*S)
    dr.polygon([(x0-3*S,y0+38*S),(x0+9*S,y0+38*S),(x0+11*S,y0+80*S),(x0-6*S,y0+80*S)],fill=RED+(255,))
layer(scabbard)
# red thread from Araya's trailing hand off to the right (behind figures)
def thread(dr):
    pts=[((700+(1470-700)*t)*S,(590+(942-590)*(t**0.55))*S) for t in [i/60 for i in range(61)]]
    dr.line(pts,fill=RED+(255,),width=3*S,joint='curve')
if THREAD: layer(thread)
layer(hilt)
put(ryo_fig,BLACK); put(ryo_line,PAPER,clean=False,blur=0.4); put(ryo_white,WHITE)

if ALONE:  # no small hand to hold: her own hand closes into a loose fist (the source cut it at x=695)
    ua=math.atan2(0.85,1.0)
    fist=poly([(691+15*math.cos(t)*math.cos(ua)-11*math.sin(t)*math.sin(ua),577+15*math.cos(t)*math.sin(ua)+11*math.sin(t)*math.cos(ua)) for t in [i/24*2*math.pi for i in range(24)]])
    put(fist|(ryo_fig&(X>=680)&(X<=695)&(Y>=555)&(Y<=595)),BLACK,clean=False,blur=0.6)
if not ALONE: put(ara_fig,NAVY); put(ara_red,RED); put(ara_line,PAPER,clean=False,blur=0.4)
# --- head transplant: use the reunion_r2_3 head (bob to the chin, narrow face) on the walking body ---
head=np.asarray(Image.open(os.path.join(HERE,'ryoshu_head_r2_3.png'))).astype(float)/255      # Ryoshu ink only
lab_,n_=ndimage.label(head>0.5); szs=ndimage.sum(head>0.5,lab_,range(1,n_+1))
keep=[i+1 for i in range(n_) if szs[i]>500 and ndimage.find_objects((lab_==i+1).astype(int))[0][1].start>2]   # hair+face, not the shoulder
head*=ndimage.binary_dilation(np.isin(lab_,keep),iterations=2)
hm=Image.fromarray((head*255).astype(np.uint8)); s_=0.68
hm=hm.resize((int(hm.width*s_),int(hm.height*s_)),Image.LANCZOS); hm=np.asarray(hm).astype(float)/255
# erase the generated head above the collar (walk crop coords + (380,40))
er=poly([(380+x,40+y) for x,y in [(15,-10),(270,-10),(270,175),(150,178),(78,170),(76,138),(15,105)]])
o[er]=np.clip(np.full((H,Wd,3),BG,float)+rng.normal(0,NOISE,(H,Wd,1)),0,255)[er].astype(np.uint8)
put(ryo_white&er,WHITE)
# place so the reunion neck base (crop 140,250 -> head-local 92,250) lands on the walk collar (480,195)
ox0=int(round(482-92*s_)); oy0=int(round(199-247*s_))
# v7: no neck at all. The head is lowered until the hem of the bob rests on the coat collar and the chin sits
# just above the shirt, the way the reunion draws her (user: "just put the head on the collar")
HDX,HDY=int(os.environ.get('HEAD_DX','-3')),int(os.environ.get('HEAD_DY','27'))
ox=ox0+HDX; oy=oy0+HDY
hh,ww=hm.shape
hm[194-oy0:]=0   # drop the cut-off end of the reunion throat line (head-local rows)
_hy,_hx=np.mgrid[0:hh,0:ww]; _gx,_gy=_hx+ox0,_hy+oy0   # head-local, in v5 placement coords
hm[(_gx>=478)&(_gx<=512)&(_gy>160+(_gx-460)*30/70+3)]=0   # and the throat fragment under the hair
reg=o[oy:oy+hh,ox:ox+ww].astype(float)
o[oy:oy+hh,ox:ox+ww]=(reg*(1-hm[...,None])+np.array(BLACK)*hm[...,None]).astype(np.uint8)
put(ryo_fig&(X<=459)&(Y>=186)&(Y<=230),BLACK,clean=False,blur=0.6)   # the coat collar the head erase clipped
_bx=(X>=478)&(X<=495)&(Y>=210)&(Y<=218)&(o.mean(2)>45)   # a stray scrap of the old collar line by the lapel tip
o[_bx]=np.clip(np.full((H,Wd,3),BG,float)+rng.normal(0,NOISE,(H,Wd,1)),0,255)[_bx].astype(np.uint8)
o[946:950,60:1480]=BLACK
Image.fromarray(o).save(OUT)
