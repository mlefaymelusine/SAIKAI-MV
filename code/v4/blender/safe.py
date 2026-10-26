# The time-safe (V1 opens). User 10-24 reference (only for shape; the look stays black paper with cream cut edges):
# an upright safe, taller than it is wide, three hinges down the left, a brass lever and a brass dial. Inside there
# is one small space and nothing else ("小到只够装下一个孩子", no shelf), its walls and the inside of the door scored
# with scratches, and on its floor a little coil of red thread. The light comes up inside when the door opens.
# Scratch textures: safe_tex.py.
import bpy, math, os, sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from common4 import *
reset()
sc = bpy.context.scene
D = os.path.dirname(os.path.abspath(__file__))
OUT, F = args()[0], int(args()[1])
FL = flat('flat', INK)
TICK = flat('tick', PAPER)
BRASS = flat('brass', '#a68a48')
BRASS_DK = flat('brassdk', '#6f5a2c')
REDM = flat('redthread', '#c0182c')
NL = nolines_collection()

def box(name, loc, size, mat=FL, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o = bpy.context.object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        m = o.modifiers.new('bv', 'BEVEL'); m.width = bevel; m.segments = 2
    return give(o, mat)

def cyl(name, loc, r, depth, mat=FL, verts=64, rot=(math.radians(90), 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; return give(o, mat)

def img_node(nt, name, proj='BOX'):
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(D, 'tex', name))
    t.image.colorspace_settings.name = 'Non-Color'; t.projection = proj; t.projection_blend = 0.15; t.interpolation = 'Cubic'
    return t

# body (taller than wide) with a cavity open to the front, on a low plinth
BW, BD, BH, Z0 = 1.12, 1.1, 1.84, 0.12
ZC = Z0 + BH / 2
body = box('body', (0, 0, ZC), (BW, BD, BH))
cav = box('cav', (0, -0.13, ZC), (0.92, 1.0, 1.6))
b = body.modifiers.new('cut', 'BOOLEAN'); b.object = cav; b.operation = 'DIFFERENCE'
bpy.context.view_layer.objects.active = body; bpy.ops.object.modifier_apply(modifier='cut'); bpy.data.objects.remove(cav)
m = body.modifiers.new('bv', 'BEVEL'); m.width = 0.022; m.segments = 2; m.limit_method = 'ANGLE'
box('plinth', (0, 0, Z0 / 2), (BW + 0.08, BD + 0.08, Z0), bevel=0.01)

# glow spill on the floor (no cut edges)
GLOW = bpy.data.materials.new('glow'); GLOW.use_nodes = True
nt = GLOW.node_tree; nt.nodes.clear()
o_ = nt.nodes.new('ShaderNodeOutputMaterial'); e_ = nt.nodes.new('ShaderNodeEmission'); mx = nt.nodes.new('ShaderNodeMix')
mx.data_type = 'RGBA'; mx.inputs[6].default_value = (*lin(INK), 1); mx.inputs[7].default_value = (*lin(PAPER), 1)
nt.links.new(mx.outputs[2], e_.inputs[0]); nt.links.new(e_.outputs[0], o_.inputs[0]); e_.inputs[1].default_value = 1.0
SPILL = GLOW.copy(); SPILL.name = 'spill'
SPILL.node_tree.nodes['Mix'].inputs[7].default_value = (*lin('#4a443e'), 1)
# the inside: walls taking the light, brightest at the back, scored with claw marks (multiplied in)
INSIDE = bpy.data.materials.new('inside'); INSIDE.use_nodes = True
nt = INSIDE.node_tree; nt.nodes.clear()
o_ = nt.nodes.new('ShaderNodeOutputMaterial'); e_ = nt.nodes.new('ShaderNodeEmission'); e_.inputs[1].default_value = 1.0
tc = nt.nodes.new('ShaderNodeTexCoord'); sx = nt.nodes.new('ShaderNodeSeparateXYZ'); mr = nt.nodes.new('ShaderNodeMapRange')
mr.interpolation_type = 'SMOOTHSTEP'; mr.inputs['From Min'].default_value = -0.65; mr.inputs['From Max'].default_value = 0.37
pw = nt.nodes.new('ShaderNodeMath'); pw.operation = 'POWER'; pw.inputs[1].default_value = 1.4
mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.name = 'lit'; mul.inputs[1].default_value = 0.0
mx2 = nt.nodes.new('ShaderNodeMix'); mx2.data_type = 'RGBA'
mx2.inputs[6].default_value = (*lin(INK), 1); mx2.inputs[7].default_value = (*lin(PAPER), 1)
scr = img_node(nt, 'scratch_wall.png')
mm = nt.nodes.new('ShaderNodeMix'); mm.data_type = 'RGBA'; mm.blend_type = 'MULTIPLY'; mm.inputs[0].default_value = 0.9
nt.links.new(tc.outputs['Object'], sx.inputs[0]); nt.links.new(sx.outputs['Y'], mr.inputs['Value'])
nt.links.new(mr.outputs['Result'], pw.inputs[0]); nt.links.new(pw.outputs[0], mul.inputs[0]); nt.links.new(mul.outputs[0], mx2.inputs[0])
nt.links.new(tc.outputs['Generated'], scr.inputs[0])
nt.links.new(mx2.outputs[2], mm.inputs[6]); nt.links.new(scr.outputs[0], mm.inputs[7])
nt.links.new(mm.outputs[2], e_.inputs[0]); nt.links.new(e_.outputs[0], o_.inputs[0])
X0, X1, Y0, Y1, ZA, ZB = -0.455, 0.455, -0.545, 0.365, Z0 + 0.125, Z0 + BH - 0.125
vs = [(X0, Y0, ZA), (X1, Y0, ZA), (X1, Y1, ZA), (X0, Y1, ZA), (X0, Y0, ZB), (X1, Y0, ZB), (X1, Y1, ZB), (X0, Y1, ZB)]
fs = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 3, 7, 4), (1, 5, 6, 2), (3, 2, 6, 7)]          # floor, ceiling, left, right, back
mesh = bpy.data.meshes.new('inside'); mesh.from_pydata(vs, [], fs)
ins = bpy.data.objects.new('inside', mesh); sc.collection.objects.link(ins); give(ins, INSIDE)
mesh = bpy.data.meshes.new('spill'); mesh.from_pydata([(-0.45, -0.64, 0.003), (0.45, -0.64, 0.003), (1.7, -3.3, 0.003), (-0.8, -3.3, 0.003)], [], [(0, 1, 2, 3)])
sp = bpy.data.objects.new('spill', mesh); NL.objects.link(sp); give(sp, SPILL)
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0)); fl = give(bpy.context.object, FL); move_to(fl, NL)

# a little coil of red thread on the floor of it, one end running out toward the door
bpy.ops.curve.primitive_bezier_circle_add(radius=1, location=(0, 0, 0)); cu = bpy.context.object; bpy.data.objects.remove(cu)
cd = bpy.data.curves.new('coil', 'CURVE'); cd.dimensions = '3D'; cd.bevel_depth = 0.0045; cd.bevel_resolution = 2
spl = cd.splines.new('POLY')
import random as _r
R_ = _r.Random(5); pts = []
cx_, cy_ = 0.05, -0.03
for loop in range(7):                                  # a loose tangle: loops of different sizes, each a little off
    ox, oy, rr = cx_ + (R_.random() - 0.5) * 0.06, cy_ + (R_.random() - 0.5) * 0.05, 0.035 + R_.random() * 0.045
    a0 = R_.random() * 6.28; tilt = (R_.random() - 0.5) * 0.8
    for i in range(36):
        a = a0 + i / 35 * 2 * math.pi
        pts.append((ox + rr * math.cos(a), oy + rr * math.sin(a) * (0.6 + 0.3 * math.cos(tilt)), ZA + 0.006 + 0.012 * (0.5 + 0.5 * math.sin(a + tilt)) * (loop % 3) / 2))
for i in range(1, 30):                                 # and the end, run out toward the door
    t = i / 29; pts.append((pts[-1][0] + 0.004 + 0.002 * math.sin(t * 9), pts[-1][1] - 0.016, ZA + 0.005))
spl.points.add(len(pts) - 1)
for p, q in zip(spl.points, pts): p.co = (*q, 1)
coil = bpy.data.objects.new('coil', cd); NL.objects.link(coil); give(coil, REDM)

# door on a hinge at its back-left edge; three hinges down the left
DW, DT, DH = 0.98, 0.13, 1.66
YF = -BD / 2
bpy.ops.object.empty_add(location=(-DW / 2, YF, ZC)); hinge = bpy.context.object
door = box('door', (0, YF - DT / 2, ZC), (DW, DT, DH), bevel=0.018); parent(door, hinge)
panel = box('panel', (0, YF - DT - 0.006, ZC), (DW - 0.14, 0.012, DH - 0.16)); parent(panel, door)
for z in (ZC - 0.62, ZC, ZC + 0.62):
    h_ = cyl('hingepin', (-DW / 2 - 0.02, YF - DT / 2, z), 0.04, 0.2, rot=(0, 0, 0)); parent(h_, hinge)
# the inside of the door: dark, its scratches catching the light from inside
DIN = bpy.data.materials.new('doorin'); DIN.use_nodes = True
nt = DIN.node_tree; nt.nodes.clear()
o_ = nt.nodes.new('ShaderNodeOutputMaterial'); e_ = nt.nodes.new('ShaderNodeEmission'); e_.inputs[1].default_value = 1.0
tc = nt.nodes.new('ShaderNodeTexCoord'); ds = img_node(nt, 'scratch_door.png', proj='FLAT')
mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.name = 'lit'; mul.inputs[1].default_value = 0.0
mx3 = nt.nodes.new('ShaderNodeMix'); mx3.data_type = 'RGBA'
mx3.inputs[6].default_value = (*lin(INK), 1); mx3.inputs[7].default_value = (*lin('#b9b0a0'), 1)
nt.links.new(tc.outputs['UV'], ds.inputs[0]); nt.links.new(ds.outputs[0], mul.inputs[0]); nt.links.new(mul.outputs[0], mx3.inputs[0])
nt.links.new(mx3.outputs[2], e_.inputs[0]); nt.links.new(e_.outputs[0], o_.inputs[0])
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, YF + 0.004, ZC), rotation=(math.radians(90), 0, 0)); din = bpy.context.object
din.scale = (DW - 0.06, DH - 0.06, 1); give(din, DIN); move_to(din, NL); parent(din, door)

# the brass dial (right) and the brass lever (left), as in the reference
DX, DZ, YD = 0.2, ZC + 0.08, YF - DT - 0.012
bpy.ops.object.empty_add(location=(DX, YD, DZ)); dial = bpy.context.object; parent(dial, door)
d0 = cyl('dial', (DX, YD - 0.02, DZ), 0.17, 0.05, mat=BRASS); parent(d0, dial)
d1 = cyl('knob', (DX, YD - 0.06, DZ), 0.07, 0.06, mat=BRASS_DK); parent(d1, dial)
for i in range(40):
    a = i / 40 * 2 * math.pi; L = 0.04 if i % 5 == 0 else 0.022
    r = 0.165 - L / 2
    t = box('tick', (DX + r * math.cos(a), YD - 0.047, DZ + r * math.sin(a)), (L, 0.004, 0.007 if i % 5 else 0.011), mat=TICK)
    t.rotation_euler = (0, -a, 0); move_to(t, NL); parent(t, dial)
mk = bpy.data.meshes.new('idx'); mk.from_pydata([(DX - 0.02, YD + 0.004, DZ + 0.215), (DX + 0.02, YD + 0.004, DZ + 0.215), (DX, YD + 0.004, DZ + 0.185)], [], [(0, 1, 2)])
idx = bpy.data.objects.new('idx', mk); NL.objects.link(idx); give(idx, TICK); parent(idx, door)
LX, LZ = -0.2, ZC + 0.08
bpy.ops.object.empty_add(location=(LX, YD, LZ)); lever = bpy.context.object; parent(lever, door)
hub = cyl('hub', (LX, YD - 0.02, LZ), 0.06, 0.05, mat=BRASS); parent(hub, lever)
bar = box('bar', (LX, YD - 0.05, LZ - 0.16), (0.045, 0.04, 0.3), mat=BRASS, bevel=0.01); bar.rotation_euler = (0, math.radians(-28), 0); parent(bar, lever)
grip = cyl('grip', (LX + 0.07, YD - 0.05, LZ - 0.3), 0.032, 0.09, mat=BRASS_DK, rot=(0, 0, 0)); parent(grip, lever)

cam_target = bpy.data.objects.new('tgt', None); sc.collection.objects.link(cam_target); cam_target.location = (0, -0.3, 1.0)
bpy.ops.object.camera_add(location=(2.5, -5.6, 1.9)); cam = bpy.context.object; sc.camera = cam; cam.data.lens = 50
c = cam.constraints.new('TRACK_TO'); c.target = cam_target; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'

def k(o, path, fr, val):
    setattr(o, path, val); o.keyframe_insert(path, frame=fr)
f = lambda x: max(1, int(round(x * F)))
# combination: right, back, right; then the lever; then the door swings out and the light comes up
for fr, deg in ((0.0, 0), (0.15, 250), (0.27, 110), (0.37, 200)):
    k(dial, 'rotation_euler', f(fr), (0, math.radians(deg), 0))
k(lever, 'rotation_euler', f(0.40), (0, 0, 0)); k(lever, 'rotation_euler', f(0.47), (0, math.radians(70), 0))
k(hinge, 'rotation_euler', f(0.50), (0, 0, 0)); k(hinge, 'rotation_euler', f(0.96), (0, 0, math.radians(-112)))
s = SPILL.node_tree.nodes['Mix'].inputs[0]
s.default_value = 0.0; s.keyframe_insert('default_value', frame=f(0.50))
s.default_value = 1.0; s.keyframe_insert('default_value', frame=F)
k(cam, 'location', 1, (2.5, -5.6, 1.9)); k(cam, 'location', F, (1.8, -4.4, 1.6))
for mat_ in (INSIDE, DIN):
    s = mat_.node_tree.nodes['lit'].inputs[1]
    s.default_value = 0.0; s.keyframe_insert('default_value', frame=f(0.50))
    s.default_value = 1.0; s.keyframe_insert('default_value', frame=F)
for o in (dial, lever, hinge, cam):
    if o.animation_data:
        for fc in o.animation_data.action.fcurves:
            for kp in fc.keyframe_points: kp.interpolation = 'BEZIER'; kp.easing = 'AUTO'
setup(OUT, 1, F, bg=INK, samples=10)
lineart(PAPER, width=2.0)
if len(args()) > 2:  # preview frames
    for fr in map(int, args()[2].split(',')):
        sc.frame_set(fr); sc.render.filepath = OUT + f'prev_{fr:04d}'; bpy.ops.render.render(write_still=True)
else:
    bpy.ops.render.render(animation=True)
