# v4 Blender helpers: flat emission colour, Freestyle cut-paper edges, Cycles CPU (renders headless anywhere).
import bpy, math, sys, os

def lin(h):
    """'#rrggbb' -> linear RGB, so that an emission of strength 1 renders the exact palette colour."""
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)

INK, PAPER, WHITE, RED, NAVY, GREY = '#0e0b10', '#ece4d4', '#faf8f2', '#c0182c', '#26345c', '#8d8780'

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def flat(name, hexcol, strength=1.0, image=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); e = nt.nodes.new('ShaderNodeEmission')
    e.inputs[0].default_value = (*lin(hexcol), 1); e.inputs[1].default_value = strength
    if image:
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(image); t.interpolation = 'Cubic'
        nt.links.new(t.outputs[0], e.inputs[0])
    nt.links.new(e.outputs[0], o.inputs[0])
    return m

def give(o, m):
    o.data.materials.clear(); o.data.materials.append(m); return o

def parent(c, p):
    bpy.context.view_layer.update()
    c.parent = p; c.matrix_parent_inverse = p.matrix_world.inverted()

def nolines_collection():
    c = bpy.data.collections.get('nolines')
    if not c:
        c = bpy.data.collections.new('nolines'); bpy.context.scene.collection.children.link(c)
    return c

def move_to(o, coll):
    for c in o.users_collection: c.objects.unlink(o)
    coll.objects.link(o)

def setup(out, fs, fe, bg=INK, samples=10, w=1920, h=1080):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples
    sc.cycles.use_denoising = False; sc.cycles.max_bounces = 0
    sc.render.resolution_x = w; sc.render.resolution_y = h; sc.render.resolution_percentage = 100
    sc.frame_start = fs; sc.frame_end = fe; sc.render.fps = 30
    sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 90
    sc.render.filepath = out
    sc.render.use_overwrite = os.environ.get('SAIKAI_OVERWRITE', '1') == '1'   # 0 = resume, keep frames already on disk
    sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'
    wd = bpy.data.worlds.new('W'); sc.world = wd; wd.use_nodes = True
    b = next(n for n in wd.node_tree.nodes if n.type == 'BACKGROUND')
    b.inputs[0].default_value = (*lin(bg), 1); b.inputs[1].default_value = 1.0
    sc.render.film_transparent = False

def lineart(hexcol, width=1.8, far_fade=None, crease=125):
    """Freestyle edges in one palette colour; optional thinning with distance (near, far, min_width)."""
    sc = bpy.context.scene
    sc.render.use_freestyle = True; sc.render.line_thickness_mode = 'ABSOLUTE'
    vl = bpy.context.view_layer; vl.use_freestyle = True
    fs = vl.freestyle_settings; fs.crease_angle = math.radians(crease)
    ls = fs.linesets[0] if len(fs.linesets) else fs.linesets.new('L')
    ls.select_by_visibility = True; ls.visibility = 'VISIBLE'
    ls.select_silhouette = True; ls.select_border = True; ls.select_crease = True
    ls.select_material_boundary = False; ls.select_edge_mark = True
    nl = bpy.data.collections.get('nolines')
    if nl:
        ls.select_by_collection = True; ls.collection = nl; ls.collection_negation = 'EXCLUSIVE'
    st = ls.linestyle or bpy.data.linestyles.new('LS'); ls.linestyle = st
    st.color = lin(hexcol); st.thickness = width; st.alpha = 1.0
    st.caps = 'ROUND'
    if far_fade:
        near, far, wmin = far_fade
        m = st.thickness_modifiers.new('dist', 'DISTANCE_FROM_CAMERA')
        m.range_min = near; m.range_max = far; m.value_min = 1.0; m.value_max = wmin / width
        m.mapping = 'LINEAR'; m.blend = 'MULTIPLY'
    return ls

def args():
    a = sys.argv; return a[a.index('--') + 1:] if '--' in a else []

def ease(t):
    t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)
