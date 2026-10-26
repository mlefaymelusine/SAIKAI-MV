# P1's folding screen, modelled (user 10-24, 4th look: the CSS panels split apart as they opened; "would a screen
# modelled in Blender and folded be more natural?"). A pair of three-panel screens (三曲一双) standing in a shallow
# zigzag, one picture across both (tex/screen_seq: the ScreenTex composition, one image a frame, so the flames move).
# Each screen folds up the way a folding door does (user 10-25, 5th look, with a video of one): held at its outer edge,
# its zigzag closes like an accordion, every hinge going on the way it already bends, until the three panels stand
# packed together end-on at the side; the packed screens are then carried off to either side. The hinges turn on the
# faces that close together (fronts at the back hinge, backs at the front one), so no panel passes through another
# and none comes apart from its neighbour.
# Flat colour like the rest of v4 (emission), each face lit only by how it turns to a light from the upper left, so
# the folds read. Transparent film: Remotion lays it over the dark and the thread behind (shots/A.tsx).
#   python3.11 screen.py -- <outdir> [first last]      -> <outdir>/NNNN.webp, 0001 = 0.0 s
import bpy, bmesh, math, os, sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from common4 import *
reset()
sc = bpy.context.scene
A = args()
OUT = A[0]; F0 = int(A[1]) if len(A) > 1 else 1; F1 = int(A[2]) if len(A) > 2 else 334
D = os.path.dirname(os.path.abspath(__file__))
NTEX = 346

# 1 unit = 100 px of the picture at zoom 1; the picture is 1500 x 620 (comp/hellscreen.ts)
PW, PH, T = 2.5, 6.2, 0.045
GAP = 0.012                       # the seam between neighbouring panels
LACQ, BACK, GOLD = '#140f12', '#b6a079', '#b89a5a'
LIGHT = (-0.35, -0.85, 0.42)      # to the light (upper left, in front)

def unit(v):
    n = math.sqrt(sum(c * c for c in v)); return tuple(c / n for c in v)
L = unit(LIGHT)

def lit(nt, col_socket, base=0.36, k=0.74):
    """emission = colour * (base + k * max(0, N.L)): the face's own colour, darker as it turns from the light"""
    geo = nt.nodes.new('ShaderNodeNewGeometry')
    dot = nt.nodes.new('ShaderNodeVectorMath'); dot.operation = 'DOT_PRODUCT'; dot.inputs[1].default_value = L
    nt.links.new(geo.outputs['Normal'], dot.inputs[0])
    mx = nt.nodes.new('ShaderNodeMath'); mx.operation = 'MAXIMUM'; mx.inputs[1].default_value = 0.0
    nt.links.new(dot.outputs['Value'], mx.inputs[0])
    ma = nt.nodes.new('ShaderNodeMath'); ma.operation = 'MULTIPLY_ADD'; ma.inputs[1].default_value = k; ma.inputs[2].default_value = base
    nt.links.new(mx.outputs[0], ma.inputs[0])
    e = nt.nodes.new('ShaderNodeEmission'); nt.links.new(col_socket, e.inputs[0]); nt.links.new(ma.outputs[0], e.inputs[1])
    o = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(e.outputs[0], o.inputs[0])

def mat_plain(name, hexcol, base=0.36, k=0.74):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    rgb = nt.nodes.new('ShaderNodeRGB'); rgb.outputs[0].default_value = (*lin(hexcol), 1)
    lit(nt, rgb.outputs[0], base, k); return m

def mat_front():
    """the picture, with each panel's black lacquer frame and a thin gold line just inside it"""
    m = bpy.data.materials.new('front'); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    uvp = nt.nodes.new('ShaderNodeUVMap'); uvp.uv_map = 'pic'
    tex = nt.nodes.new('ShaderNodeTexImage')
    img = bpy.data.images.load(os.path.join(D, 'tex', 'screen_seq', '0001.jpg')); img.source = 'SEQUENCE'
    tex.image = img; tex.interpolation = 'Cubic'; tex.extension = 'EXTEND'
    iu = tex.image_user; iu.frame_duration = NTEX; iu.frame_start = 1; iu.frame_offset = 0; iu.use_auto_refresh = True; iu.use_cyclic = False
    nt.links.new(uvp.outputs['UV'], tex.inputs[0])
    uvl = nt.nodes.new('ShaderNodeUVMap'); uvl.uv_map = 'local'
    sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(uvl.outputs['UV'], sep.inputs[0])
    def edge_dist(a, scale):
        # distance (in units) to the nearer edge along one axis: min(a, 1 - a) * size
        one = nt.nodes.new('ShaderNodeMath'); one.operation = 'SUBTRACT'; one.inputs[0].default_value = 1.0; nt.links.new(a, one.inputs[1])
        mn = nt.nodes.new('ShaderNodeMath'); mn.operation = 'MINIMUM'; nt.links.new(a, mn.inputs[0]); nt.links.new(one.outputs[0], mn.inputs[1])
        mu = nt.nodes.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = scale; nt.links.new(mn.outputs[0], mu.inputs[0])
        return mu.outputs[0]
    dx = edge_dist(sep.outputs['X'], PW); dy = edge_dist(sep.outputs['Y'], PH)
    d = nt.nodes.new('ShaderNodeMath'); d.operation = 'MINIMUM'; nt.links.new(dx, d.inputs[0]); nt.links.new(dy, d.inputs[1])
    frame = nt.nodes.new('ShaderNodeMath'); frame.operation = 'LESS_THAN'; frame.inputs[1].default_value = 0.07
    nt.links.new(d.outputs[0], frame.inputs[0])
    g0 = nt.nodes.new('ShaderNodeMath'); g0.operation = 'GREATER_THAN'; g0.inputs[1].default_value = 0.105; nt.links.new(d.outputs[0], g0.inputs[0])
    g1 = nt.nodes.new('ShaderNodeMath'); g1.operation = 'LESS_THAN'; g1.inputs[1].default_value = 0.125; nt.links.new(d.outputs[0], g1.inputs[0])
    gl = nt.nodes.new('ShaderNodeMath'); gl.operation = 'MULTIPLY'; nt.links.new(g0.outputs[0], gl.inputs[0]); nt.links.new(g1.outputs[0], gl.inputs[1])
    m1 = nt.nodes.new('ShaderNodeMix'); m1.data_type = 'RGBA'; nt.links.new(gl.outputs[0], m1.inputs[0])
    nt.links.new(tex.outputs[0], m1.inputs[6]); m1.inputs[7].default_value = (*lin(GOLD), 1)
    m2 = nt.nodes.new('ShaderNodeMix'); m2.data_type = 'RGBA'; nt.links.new(frame.outputs[0], m2.inputs[0])
    nt.links.new(m1.outputs[2], m2.inputs[6]); m2.inputs[7].default_value = (*lin(LACQ), 1)
    lit(nt, m2.outputs[2])
    return m, img

FRONT, IMG = mat_front()
BACKM = mat_plain('back', BACK)
SIDE = mat_plain('side', LACQ, 0.6, 0.6)

def panel(name, col, outer_left):
    """a panel as a thin box; its origin on its outer hinge edge (left edge for the left screen, right for the right),
    front face toward -y. col: which sixth of the picture it shows."""
    bm = bmesh.new()
    x0, x1 = (0.0, PW - GAP) if outer_left else (-(PW - GAP), 0.0)
    v = {}
    for ix, x in enumerate((x0, x1)):
        for iy, y in enumerate((-T / 2, T / 2)):
            for iz, z in enumerate((0.0, PH)):
                v[ix, iy, iz] = bm.verts.new((x, y, z))
    def f(a, b, c, d_, mi):
        fa = bm.faces.new((v[a], v[b], v[c], v[d_])); fa.material_index = mi; return fa
    f((0, 0, 0), (1, 0, 0), (1, 0, 1), (0, 0, 1), 0)      # front (y = -T/2)
    f((1, 1, 0), (0, 1, 0), (0, 1, 1), (1, 1, 1), 1)      # back
    f((0, 1, 0), (0, 0, 0), (0, 0, 1), (0, 1, 1), 2)      # sides, top, bottom
    f((1, 0, 0), (1, 1, 0), (1, 1, 1), (1, 0, 1), 2)
    f((0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1), 2)
    f((0, 1, 0), (1, 1, 0), (1, 0, 0), (0, 0, 0), 2)
    bm.normal_update()
    pic = bm.loops.layers.uv.new('pic'); loc = bm.loops.layers.uv.new('local')
    for fa in bm.faces:
        for lp in fa.loops:
            x, y, z = lp.vert.co
            lu = (x - x0) / (x1 - x0)
            lp[loc].uv = (lu, z / PH)
            lp[pic].uv = ((col + lu) / 6.0, z / PH)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    for m in (FRONT, BACKM, SIDE): o.data.materials.append(m)
    return o

LEFT = [panel('L0', 0, True), panel('L1', 1, True), panel('L2', 2, True)]
RIGHT = [panel('R0', 5, False), panel('R1', 4, False), panel('R2', 3, False)]

def sm(a, b, t):
    x = max(0.0, min(1.0, (t - a) / (b - a))); return x * x * (3 - 2 * x)
def lerp(a, b, k): return a + (b - a) * k

Z0 = [15.0, -15.0, 15.0]          # the zigzag it stands in: outer panel back, middle forward, inner back (deg)
ZMAX = 85.0                       # how far it closes: packed, a little zigzag still in it
def angles(t):
    """yaw of each panel from outer to inner (deg; + turns its inner end away from us): the zigzag closes evenly"""
    th = lerp(Z0[0], ZMAX, sm(5.6, 9.4, t))
    return [th, -th, th]
REACH = sum(PW * math.cos(math.radians(a)) for a in Z0)
def carry(t):
    """how far each folded screen has been carried out (x) and back (y)"""
    k = sm(8.6, 11.4, t); return 6.6 * k, 1.4 * k
HINGE = [-1, 1]                   # which face each hinge turns on: -1 the front (the back hinge, fronts close), +1 the back

def pose(t):
    ang = angles(t); out, back = carry(t)
    for side, chain in ((-1, LEFT), (1, RIGHT)):
        ox, oy = side * (REACH + GAP / 2 + out), back
        ix = -side                                      # the inner direction along a flat panel
        for i, (o, a) in enumerate(zip(chain, ang)):
            r = math.radians(a) if side < 0 else -math.radians(a)
            c, s_ = math.cos(r), math.sin(r)
            if i:                                       # hang this panel on the previous one's hinge
                hx, hy = -ix * GAP / 2, HINGE[i - 1] * T / 2
                ox, oy = Hx - (c * hx - s_ * hy), Hy - (s_ * hx + c * hy)
            o.location = (ox, oy, 0.0); o.rotation_euler = (0.0, 0.0, r)
            if i < len(chain) - 1:
                hx, hy = ix * (PW - GAP / 2), HINGE[i] * T / 2
                Hx, Hy = ox + c * hx - s_ * hy, oy + s_ * hx + c * hy

# camera: P1's zoom (0.92 -> 1.06 over 0-10.8 s, eased) as a dolly; the screen's centre 20 px above the frame's
cam_d = bpy.data.cameras.new('cam'); cam_d.lens = 50; cam_d.sensor_width = 36; cam_d.sensor_fit = 'HORIZONTAL'
cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
cam.rotation_euler = (math.radians(90), 0, 0)
def eio(x):
    x = max(0.0, min(1.0, x))
    # bezier 0.65,0,0.35,1 (util.eio), close enough by a smootherstep
    return x * x * x * (x * (x * 6 - 15) + 10)
D0 = 9.6 / math.tan(math.atan(18 / 50))        # distance at which the frame is 19.2 units wide (zoom 1)
def place_cam(t):
    z = lerp(0.92, 1.06, eio(t / 10.8))
    cam.location = (0.0, -D0 / z, PH / 2 - 0.2)

setup(os.path.join(OUT, '####'), F0, F1, samples=8)
sc.cycles.max_bounces = 0
sc.render.film_transparent = True
sc.render.image_settings.file_format = 'WEBP'; sc.render.image_settings.color_mode = 'RGBA'; sc.render.image_settings.quality = 92
os.makedirs(OUT, exist_ok=True)
FR = [int(x) for x in os.environ['FRAMES'].split(',')] if os.environ.get('FRAMES') else range(F0, F1 + 1)
for f in FR:
    t = (f - 1) / 30.0
    sc.frame_set(f)
    pose(t); place_cam(t)
    sc.render.filepath = os.path.join(OUT, f'{f:04d}')
    bpy.ops.render.render(write_still=True)
    print('frame', f, flush=True)
