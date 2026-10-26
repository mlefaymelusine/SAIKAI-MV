# Rien's picture book (cover: tex/cover.png, drawn from comp/objects.tsx PictureBook). 'open' (R1, light paper): the cover opens, two pages turn, the last right page is blank,
# a bookmark lies on it. 'close' (O2, black paper): from that spread the book shuts.
import bpy, bmesh, math, os, sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from common4 import *
reset()
sc = bpy.context.scene
OUT, F, MODE = args()[0], int(args()[1]), args()[2]
PREV = args()[3] if len(args()) > 3 else None
dark = MODE == 'close'
D = os.path.dirname(os.path.abspath(__file__))
NL = nolines_collection()
Wp, Hp, TH, EPS, NX = 0.22, 0.30, 0.006, 0.0009, 48
Wc, Hc = Wp + 0.008, Hp + 0.012
N = 3

def page_mat(name, recto, verso):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); e = nt.nodes.new('ShaderNodeEmission')
    tc = nt.nodes.new('ShaderNodeTexCoord'); geo = nt.nodes.new('ShaderNodeNewGeometry')
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Location'].default_value[0] = 1.0; mp.inputs['Scale'].default_value[0] = -1.0
    tr = nt.nodes.new('ShaderNodeTexImage'); tr.image = bpy.data.images.load(os.path.join(D, 'tex', recto))
    tv = nt.nodes.new('ShaderNodeTexImage'); tv.image = bpy.data.images.load(os.path.join(D, 'tex', verso))
    for t in (tr, tv): t.interpolation = 'Cubic'; t.extension = 'EXTEND'
    mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'
    nt.links.new(tc.outputs['UV'], tr.inputs[0]); nt.links.new(tc.outputs['UV'], mp.inputs[0]); nt.links.new(mp.outputs[0], tv.inputs[0])
    nt.links.new(geo.outputs['Backfacing'], mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[6]); nt.links.new(tv.outputs[0], mx.inputs[7])
    nt.links.new(mx.outputs[2], e.inputs[0]); nt.links.new(e.outputs[0], o.inputs[0])
    return m

def sheet(name, mat):
    vs, fs, uvs = [], [], []
    for i in range(NX + 1):
        for j in (0, 1):
            vs.append((Wp * i / NX, -Hp / 2 + Hp * j, 0))
    for i in range(NX):
        fs.append((2 * i, 2 * i + 2, 2 * i + 3, 2 * i + 1))
    me = bpy.data.meshes.new(name); me.from_pydata(vs, [], fs)
    uv = me.uv_layers.new()
    for poly in me.polygons:
        for li in poly.loop_indices:
            v = me.vertices[me.loops[li].vertex_index].co
            uv.data[li].uv = (v.x / Wp, (v.y + Hp / 2) / Hp)
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); give(o, mat); return o

def curl(o, t, zr, zl):
    """t: 0 lying on the right .. 1 lying on the left; the free edge lags behind the spine mid-turn"""
    e = ease(t)
    phi0 = math.pi * e
    bend = 1.1 * math.sin(math.pi * min(1, max(0, t)))
    zb = zr + (zl - zr) * e + 0.012 * math.sin(math.pi * min(1, max(0, t)))
    x = z = 0.0; du = Wp / NX
    pos = [(0.0, zb)]
    for i in range(1, NX + 1):
        u = (i - 0.5) / NX
        ph = min(math.pi, max(0.0, phi0 - bend * u * (1 - e) + bend * u * e * 0.0))
        x += math.cos(ph) * du; z += math.sin(ph) * du
        pos.append((x, zb + z))
    me = o.data
    for i in range(NX + 1):
        for j in (0, 1):
            v = me.vertices[2 * i + j]; v.co.x = pos[i][0]; v.co.z = pos[i][1]
    me.update()

COVER = flat('cover', '#ece4d4')                  # user 10-24: the cover as in I2/B1, the monkey and the frog
mats = [page_mat('s1', 'p1r.png', 'p1v.png'), page_mat('s2', 'p2r.png', 'p2v.png'), page_mat('s3', 'p3r.png', 'blank.png')]
sheets = [sheet(f'sheet{i + 1}', mats[i]) for i in range(N)]
# back cover under the right stack
bpy.ops.mesh.primitive_cube_add(size=1, location=(Wc / 2, 0, TH / 2)); back = bpy.context.object; back.scale = (Wc, Hc, TH)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True); give(back, COVER)
# front cover on a hinge at the spine
zTop = TH + (N + 1) * EPS
bpy.ops.object.empty_add(location=(0, 0, zTop)); hinge = bpy.context.object
bpy.ops.mesh.primitive_cube_add(size=1, location=(Wc / 2, 0, zTop + TH / 2)); front = bpy.context.object; front.scale = (Wc, Hc, TH)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True); give(front, COVER); parent(front, hinge)
bpy.ops.mesh.primitive_plane_add(size=1, location=(Wc / 2, 0, zTop + TH + 0.0004)); lab = bpy.context.object
# user 10-25: no words on the cover; when it shuts at the end (O2), while Araya is still speaking, it is hers: her randoseru
# with the Golden Bough in it (tex/cover_close.png, PictureBook cover='bough')
COVER_TEX = 'cover_close.png' if dark and os.path.exists(os.path.join(D, 'tex', 'cover_close.png')) else 'cover.png'
lab.scale = (Wc, Hc, 1); give(lab, flat('coverart', PAPER, image=os.path.join(D, 'tex', COVER_TEX))); move_to(lab, NL); parent(lab, hinge)
bpy.ops.mesh.primitive_plane_add(size=1, location=(Wc / 2, 0, zTop - 0.0004)); endp = bpy.context.object
endp.scale = (Wp, Hp, 1); give(endp, flat('endpaper', PAPER, image=os.path.join(D, 'tex', 'blank.png'))); move_to(endp, NL); parent(endp, hinge)
# bookmark: a grey ribbon from the head of the spine across the last page and over its foot
rib = [(0.035, Hp / 2 + 0.004), (0.05, 0.05), (0.068, -0.08), (0.074, -Hp / 2), (0.075, -Hp / 2 - 0.05)]
vs, fs = [], []
for k, (x, y) in enumerate(rib):
    zz = TH + 1 * EPS + 0.0004 - (0.004 if k == len(rib) - 1 else 0)
    vs += [(x - 0.0032, y, zz), (x + 0.0032, y, zz)]
for k in range(len(rib) - 1):
    fs.append((2 * k, 2 * k + 1, 2 * k + 3, 2 * k + 2))
me = bpy.data.meshes.new('rib'); me.from_pydata(vs, [], fs); ribbon = bpy.data.objects.new('rib', me); NL.objects.link(ribbon)
RIBMAT = flat('ribbon', GREY); give(ribbon, RIBMAT)
def ribbon_to_thread(r):
    """close (user 10-26): as the book shuts the grey bookmark slowly goes red and thins to a red thread, its tail
    running on a little further out from under the book"""
    g, red = lin(GREY), lin('#d62838')
    RIBMAT.node_tree.nodes['Emission'].inputs[0].default_value = (*[a + (b - a) * r for a, b in zip(g, red)], 1)
    hw = 0.0032 + (0.0007 - 0.0032) * r
    for k, (x, y) in enumerate(rib):
        if k == len(rib) - 1: y -= 0.05 * r
        for j, sx in enumerate((-1, 1)):
            v = ribbon.data.vertices[2 * k + j]; v.co.x = x + sx * hw; v.co.y = y
    ribbon.data.update()

zr = lambda i: TH + (N - i) * EPS          # i = 0 is the top sheet
zl = lambda i: TH + (i + 1) * EPS
def ride(o, k):
    """close: sheet k lies flat on the inside of the cover and turns with it, (k + 1) * EPS in from it, so that it
    cannot come through it (user 10-25: the curl's lift at the spine pushed the pages out past the cover mid-swing)"""
    th = hinge.rotation_euler[1] * -1; hz = hinge.location[2]; off = (k + 1) * EPS
    me = o.data
    for i in range(NX + 1):
        s_ = Wp * i / NX
        x = s_ * math.cos(th) + off * math.sin(th); z = hz + s_ * math.sin(th) - off * math.cos(th)
        for j in (0, 1):
            v = me.vertices[2 * i + j]; v.co.x = x; v.co.z = z
    me.update()
def cover_angle(a, fr):
    hinge.rotation_euler = (0, -math.pi * ease(a), 0)
    hinge.location = (0, 0, zTop + (TH - zTop) * ease(a))

tgt = bpy.data.objects.new('tgt', None); sc.collection.objects.link(tgt); tgt.location = (0.0, 0.01, 0.0)
bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam; cam.data.lens = 50; cam.data.clip_start = 0.01
c = cam.constraints.new('TRACK_TO'); c.target = tgt; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
setup(OUT, 1, F, bg=INK if dark else PAPER, samples=10)
lineart(PAPER if dark else INK, width=1.8)
seg = lambda f, a, b: max(0.0, min(1.0, (f - a) / (b - a)))

def pose(f):
    if MODE == 'open':
        cover_angle(seg(f, 0.08 * F, 0.28 * F), f)
        curl(sheets[0], seg(f, 0.45 * F, 0.64 * F), zr(0), zl(0))
        curl(sheets[1], seg(f, 0.76 * F, 0.95 * F), zr(1), zl(1))
        curl(sheets[2], 0.0, zr(2), zl(2))
        k = seg(f, 1, F); op = ease(seg(f, 0.06 * F, 0.32 * F))
        cam.location = (0.115 * (1 - op), -0.66 + 0.04 * k, 0.88 - 0.05 * k)
        tgt.location = (0.115 * (1 - op), 0.012, 0)
    else:  # close: the left side swings back over as one
        a = 1 - seg(f, 0.2 * F, 0.85 * F)
        cover_angle(a, f)
        ride(sheets[0], 0); ride(sheets[1], 1); curl(sheets[2], 0.0, zr(2), zl(2))
        ribbon_to_thread(ease(seg(f, 1, 0.8 * F)))
        k = seg(f, 1, F); op = ease(a)
        cam.location = (0.115 * (1 - op), -0.64 + 0.03 * k, 0.86 - 0.04 * k); tgt.location = (0.115 * (1 - op), 0.012, 0)

frames = [int(x) for x in PREV.split(',')] if PREV else range(1, F + 1)
for f in frames:
    if not PREV and not sc.render.use_overwrite and os.path.exists(OUT + f'{f:04d}.jpg'):
        continue   # resume
    sc.frame_set(f); pose(f)
    sc.render.filepath = (OUT + f'prev_{MODE}_{f:04d}') if PREV else (OUT + f'{f:04d}')
    bpy.ops.render.render(write_still=True)
