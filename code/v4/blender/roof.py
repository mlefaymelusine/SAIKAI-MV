# The rooftop at night (C2 with you, W2 the world and more, O2 the burned roof).
# variant A: behind the parapet where the two sit, looking out over the city (slow push)
# variant B: from the parapet, a pan across the city
# variant burned: A's camera, the roof scorched, the parapet broken, the tank fallen, lines grey
# variant T (W2, 10-24): from the parapet, the city first, then the view tilts up into the sky; rendered with a
#   transparent sky (PNG) and the camera written out per frame, so tools/starsky.py can put the turning sky behind it
import bpy, bmesh, math, os, sys, random
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from common4 import *
reset()
sc = bpy.context.scene
OUT, F, VAR = args()[0], int(args()[1]), args()[2]
PREV = args()[3] if len(args()) > 3 else None
burned = VAR == 'burned'
FL = flat('flat', INK)
NL = nolines_collection()
random.seed(9)

def boxmesh(parts, name, mat=FL, coll=None):
    """one object from many axis-aligned boxes: parts = [(x0,y0,z0,x1,y1,z1,rotz_deg?)]"""
    bm = bmesh.new()
    for p in parts:
        x0, y0, z0, x1, y1, z1 = p[:6]; rz = math.radians(p[6]) if len(p) > 6 else 0.0
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        vs = []
        for z in (z0, z1):
            for (x, y) in ((x0, y0), (x1, y0), (x1, y1), (x0, y1)):
                dx, dy = x - cx, y - cy
                vs.append(bm.verts.new((cx + dx * math.cos(rz) - dy * math.sin(rz), cy + dx * math.sin(rz) + dy * math.cos(rz), z)))
        for f in ((0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)):
            bm.faces.new([vs[i] for i in f])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); (coll or sc.collection).objects.link(o); give(o, mat); return o

def quads(qs, name, mat):
    """window panes: list of 4-point quads, no cut edges"""
    vs, fs = [], []
    for q in qs:
        fs.append(tuple(range(len(vs), len(vs) + 4))); vs.extend(q)
    me = bpy.data.meshes.new(name); me.from_pydata(vs, [], fs)
    o = bpy.data.objects.new(name, me); NL.objects.link(o); give(o, mat); return o

# ---- the city ----
city, wins, wins2 = [], [], []
pitched = []
y = 14.0
while y < 520:
    depth = random.uniform(16, 28)
    x = -330.0
    while x < 330:
        wdt = random.uniform(10, 26)
        if abs(x) < 16 and y < 30:  # leave the street right below us
            x += wdt + 9; continue
        far = (y - 14) / 500
        hmax = 12 + 22 * far + (55 * far if random.random() < 0.08 else 0)
        h = random.uniform(5, hmax)
        x0, x1, y0, y1 = x + 0.8, x + wdt - 0.8, y + 0.8, y + depth - 0.8
        city.append((x0, y0, 0, x1, y1, h))
        if h < 11 and y < 140 and random.random() < 0.5:  # tiled gable roofs nearby
            pitched.append((x0, y0, x1, y1, h, random.uniform(2.0, 3.6)))
        elif random.random() < 0.35:  # a tank or a box on the roof
            cx_, cy_ = random.uniform(x0 + 2, x1 - 4), random.uniform(y0 + 2, y1 - 4)
            city.append((cx_, cy_, h, cx_ + random.uniform(1.5, 3), cy_ + random.uniform(1.5, 3), h + random.uniform(1.5, 3)))
        # windows on the face toward us (y0) and on the side toward the centre line
        if not burned or random.random() < 0.35:
            for zz in [2.2 + 3.1 * k for k in range(int((h - 2) / 3.1))]:
                for xx in [x0 + 1.4 + 2.6 * k for k in range(int((x1 - x0 - 2) / 2.6))]:
                    r = random.random()
                    if r < 0.26 * (0.4 if burned else 1):
                        (wins if r < 0.17 else wins2).append([(xx, y0 - 0.05, zz), (xx + 1.1, y0 - 0.05, zz), (xx + 1.1, y0 - 0.05, zz + 1.3), (xx, y0 - 0.05, zz + 1.3)])
                # the side that faces the middle of the view
                fx = x1 + 0.05 if x1 < 0 else (x0 - 0.05 if x0 > 0 else None)
                if fx is not None:
                    for yy in [y0 + 1.4 + 2.6 * k for k in range(int((y1 - y0 - 2) / 2.6))]:
                        r = random.random()
                        if r < 0.2 * (0.4 if burned else 1):
                            (wins if r < 0.12 else wins2).append([(fx, yy, zz), (fx, yy + 1.1, zz), (fx, yy + 1.1, zz + 1.3), (fx, yy, zz + 1.3)])
        x += wdt
    y += depth + random.uniform(7, 11)
boxmesh(city, 'city')
# gable roofs as prisms
bm = bmesh.new()
for (x0, y0, x1, y1, h, rh) in pitched:
    v = [bm.verts.new(p) for p in ((x0 - 0.4, y0 - 0.4, h), (x1 + 0.4, y0 - 0.4, h), (x1 + 0.4, y1 + 0.4, h), (x0 - 0.4, y1 + 0.4, h), (x0 - 0.4, (y0 + y1) / 2, h + rh), (x1 + 0.4, (y0 + y1) / 2, h + rh))]
    for f in ((0, 1, 5, 4), (2, 3, 4, 5), (0, 4, 3), (1, 2, 5), (0, 3, 2, 1)):
        bm.faces.new([v[i] for i in f])
me = bpy.data.meshes.new('gables'); bm.to_mesh(me); bm.free()
g = bpy.data.objects.new('gables', me); sc.collection.objects.link(g); give(g, FL)
quads(wins, 'wins', flat('win', PAPER, 1.0 if not burned else 0.7))
quads(wins2, 'wins2', flat('win2', '#b9b2a6', 1.0 if not burned else 0.6))
bpy.ops.mesh.primitive_plane_add(size=1600, location=(0, 300, 0)); gr = give(bpy.context.object, FL); move_to(gr, NL)

# ---- our roof ----
R = 20.0
parts = [(-14, -24, 0, 14, 4, R)]  # the building
if not burned:
    parts += [(-14, 3.75, R, 14, 4.0, R + 0.55)]  # the parapet they sit on
    parts += [(-14, -24, R, -13.75, 4, R + 0.55), (13.75, -24, R, 14, 4, R + 0.55)]
else:  # broken: gaps, a fallen piece, rubble
    parts += [(-14, 3.75, R, -3.2, 4.0, R + 0.55), (-1.6, 3.75, R, 0.9, 4.0, R + 0.32), (2.6, 3.75, R, 14, 4.0, R + 0.55)]
    parts += [(-2.9, 2.6, R, -0.9, 2.85, R + 0.25, 24), (0.9, 2.2, R, 1.6, 2.6, R + 0.18, -30), (-0.6, 1.6, R, -0.1, 1.9, R + 0.12, 50)]
    parts += [(-14, -24, R, -13.75, 4, R + 0.55), (13.75, -24, R, 14, 4, R + 0.38)]
parts += [(5.5, -3.5, R, 7.5, -1.5, R + 1.0)]  # vent box
boxmesh(parts, 'roof')
# water tank on legs (fallen on its side when burned)
bpy.ops.object.empty_add(location=(-7.2, -2.4, R)); tank = bpy.context.object
bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=1.25, depth=2.4, location=(-7.2, -2.4, R + 2.5)); t = give(bpy.context.object, FL); parent(t, tank)
bpy.ops.mesh.primitive_cone_add(vertices=40, radius1=1.3, radius2=0.2, depth=0.6, location=(-7.2, -2.4, R + 4.0)); t = give(bpy.context.object, FL); parent(t, tank)
for dx in (-0.9, 0.9):
    for dy in (-0.9, 0.9):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(-7.2 + dx, -2.4 + dy, R + 0.65)); t = bpy.context.object; t.scale = (0.12, 0.12, 1.3); give(t, FL); parent(t, tank)
if burned:
    tank.rotation_euler = (math.radians(-84), 0, math.radians(30)); tank.location = (-6.0, -1.0, R + 1.3)
# antenna
bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.05, depth=4.5, location=(9.5, -6, R + 2.25)); ant = give(bpy.context.object, FL)
for k_, w_ in ((3.8, 1.6), (3.2, 1.2), (2.6, 0.9)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(9.5, -6, R + k_)); t = bpy.context.object; t.scale = (w_, 0.05, 0.05); give(t, FL)
if burned:
    ant.rotation_euler = (math.radians(28), 0, 0)
    # embers: a few red points on the scorched roof (no cut edges)
    em = []
    for i in range(32):
        ex, ey = random.uniform(-6, 6), random.uniform(-3, 3.6); s_ = random.uniform(0.03, 0.07)
        em.append([(ex, ey, R + 0.01), (ex + s_, ey, R + 0.01), (ex + s_, ey + s_, R + 0.01), (ex, ey + s_, R + 0.01)])
    quads(em, 'embers', flat('ember', RED, 1.0))

# ---- camera ----
tgt = bpy.data.objects.new('tgt', None); sc.collection.objects.link(tgt)
bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam; cam.data.lens = 32; cam.data.clip_end = 2000
c = cam.constraints.new('TRACK_TO'); c.target = tgt; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
def k(o, path, fr, val):
    setattr(o, path, val); o.keyframe_insert(path, frame=fr)
if VAR in ('A', 'burned'):
    cam.data.lens = 30
    k(tgt, 'location', 1, (0.5, 40, R - 1.5)); k(tgt, 'location', F, (0.4, 40, R - 1.8))
    k(cam, 'location', 1, (-0.3, -6.5, R + 2.4)); k(cam, 'location', F, (-0.2, -4.6, R + 2.2))
elif VAR == 'T':
    def aim(fr, yaw, pitch):
        a, p_ = math.radians(yaw), math.radians(pitch)
        k(tgt, 'location', fr, (0.5 + math.sin(a) * math.cos(p_) * 100, 3.0 + math.cos(a) * math.cos(p_) * 100, R + 1.8 + math.sin(p_) * 100))
    k(cam, 'location', 1, (0.5, 3.0, R + 1.8)); k(cam, 'location', F, (0.5, 3.4, R + 1.9))
    aim(1, 12, -4); aim(int(F * 0.40), 5, -2.5); aim(int(F * 0.93), 0, 44); aim(F, 0, 45)
else:  # B: stand at the parapet and look across the city, right to left, rising a little
    for fr, ang, z in ((1, 32, 1.6), (F, -26, 2.4)):
        a = math.radians(ang)
        k(cam, 'location', fr, (0.5, 3.0, R + z))
        k(tgt, 'location', fr, (0.5 + math.sin(a) * 100, 3.0 + math.cos(a) * 100, R - 8))
for o in (cam, tgt):
    for fc in o.animation_data.action.fcurves:
        for kp in fc.keyframe_points: kp.interpolation = 'BEZIER'
setup(OUT, 1, F, bg=INK, samples=8)
lineart(GREY if burned else PAPER, width=2.2, far_fade=(4, 260, 0.55))
if VAR == 'T':
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
    import json
    camf = []
    for fr in range(1, F + 1):
        sc.frame_set(fr); m = cam.matrix_world
        camf.append({'right': list(m.col[0][:3]), 'up': list(m.col[1][:3]), 'fwd': [-x for x in m.col[2][:3]], 'hfov': cam.data.angle_x})
    json.dump(camf, open(os.path.join(OUT, 'camera.json'), 'w'))
if PREV:
    for fr in map(int, PREV.split(',')):
        sc.frame_set(fr); sc.render.filepath = OUT + f'prev_{VAR}_{fr:04d}'; bpy.ops.render.render(write_still=True)
else:
    bpy.ops.render.render(animation=True)
