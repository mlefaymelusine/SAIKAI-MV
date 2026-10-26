# I1 the House of Spiders: the web tunnel of v1/v2 (v1/blender/webtunnel.py, the same web from the same seed),
# re-rendered for v4 in Cycles with flat colours. User 10-24 (2nd look): the song is slow, so the flight is slower:
# the camera covers 0.6 of the old distance, and the roll is 55 degrees, not 90. The silk is a little thicker
# than v1's bevels, as Cycles draws it without EEVEE's bloom.
# python3.11 webtunnel.py -- <outdir>/ [frames] [first]
import bpy, math, sys, os, random
sys.path.append(os.path.dirname(__file__))
from common4 import *

out = args()[0]; F = 390
first = int(args()[2]) if len(args()) > 2 else 1
last = int(args()[1]) if len(args()) > 1 else F
reset(); random.seed(3)
silk = flat('silk', '#e9e4dd'); red = flat('red', '#b01a2c')
def curve(name, pts, bev, m):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = bev; cu.bevel_resolution = 1
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for i, p in enumerate(pts): sp.points[i].co = (*p, 1)
    ob = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(ob); cu.materials.append(m); return ob
L = 120
for k in range(0, L, 3):
    y = k + random.uniform(-0.6, 0.6); R = 4.5 + random.uniform(-0.5, 0.8); n = random.choice([7, 8, 9])
    rot = random.random() * 6.28
    for i in range(n):
        a = rot + i / n * 6.28; r0 = 1.6 + random.random() * 0.8
        curve(f's{k}_{i}', [(r0 * math.cos(a), y, r0 * math.sin(a)), (R * 1.6 * math.cos(a), y + random.uniform(-1, 1), R * 1.6 * math.sin(a))], 0.0095, silk)
    for ring in range(3):
        rr = r0 + 0.8 + ring * 1.1
        pts = [(rr * math.cos(rot + i / n * 6.28) * (1 + random.uniform(-0.05, 0.05)), y, rr * math.sin(rot + i / n * 6.28)) for i in range(n + 1)]
        curve(f'r{k}_{ring}', pts, 0.0068, silk)
for j in range(40):
    a = random.random() * 6.28; r = random.uniform(3, 7)
    pts = [(r * math.cos(a) + random.uniform(-.3, .3), y, r * math.sin(a) + random.uniform(-.3, .3)) for y in range(-5, L + 5, 10)]
    curve(f'l{j}', pts, 0.008, silk)
pts = [(0.6 * math.sin(t * 0.13), t, -0.7 + 0.4 * math.sin(t * 0.09)) for t in [x * 0.5 for x in range(-10, 2 * L)]]
curve('red', pts, 0.025, red)
sc = bpy.context.scene
bpy.ops.object.camera_add(location=(0, -4, 0)); cam = bpy.context.object; sc.camera = cam; cam.data.lens = 24
END = -4 + 0.6 * (L - 12 + 4)
cam.location = (0, -4, 0); cam.keyframe_insert('location', frame=1)
cam.location = (0, END, 0); cam.keyframe_insert('location', frame=F)
cam.rotation_euler = (math.radians(90), 0, 0); cam.keyframe_insert('rotation_euler', frame=1)
cam.rotation_euler = (math.radians(90), math.radians(55), 0); cam.keyframe_insert('rotation_euler', frame=F)
for fc in cam.animation_data.action.fcurves:
    for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'
setup(out, first, last, samples=12)
sc.render.threads_mode = 'FIXED'; sc.render.threads = 3
bpy.ops.render.render(animation=True)
