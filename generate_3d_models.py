import os

import bpy


PRODUCTS_DIR = "/home/kali/Dr Ona/public/products"
IMAGE_NAMES = [
    "ghost-hoodie.jpg",
    "grace-hoodie.jpg",
    "astroworld-hoodie.jpg",
    "bigfish-tee.jpg",
    "pink-octopus.jpg",
    "product-6.jpg",
    "product-7.jpg",
]


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def create_model(image_path):
    clear_scene()

    bpy.ops.mesh.primitive_plane_add(size=10, location=(0, 0, 0))
    plane = bpy.context.object
    plane.name = os.path.splitext(os.path.basename(image_path))[0]

    material = bpy.data.materials.new(name=f"{plane.name}_Material")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()

    output = nodes.new(type="ShaderNodeOutputMaterial")
    output.location = (620, 0)
    principled = nodes.new(type="ShaderNodeBsdfPrincipled")
    principled.location = (260, 80)
    image_texture = nodes.new(type="ShaderNodeTexImage")
    image_texture.location = (-420, 80)
    image_texture.image = bpy.data.images.load(image_path, check_existing=True)
    displacement = nodes.new(type="ShaderNodeDisplacement")
    displacement.location = (260, -180)
    displacement.inputs["Scale"].default_value = 0.5
    displacement.inputs["Midlevel"].default_value = 0.0

    links.new(image_texture.outputs["Color"], principled.inputs["Base Color"])
    links.new(image_texture.outputs["Color"], displacement.inputs["Height"])
    links.new(principled.outputs["BSDF"], output.inputs["Surface"])
    links.new(displacement.outputs["Displacement"], output.inputs["Displacement"])

    plane.data.materials.append(material)
    modifier = plane.modifiers.new(name="Subdivision Surface", type="SUBSURF")
    modifier.subdivision_type = "CATMULL_CLARK"
    modifier.levels = 4
    modifier.render_levels = 4
    bpy.context.view_layer.objects.active = plane
    plane.select_set(True)
    bpy.ops.object.modifier_apply(modifier=modifier.name)

    output_path = os.path.join(PRODUCTS_DIR, f"{plane.name}.glb")
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format="GLB",
        export_apply=True,
    )
    print(f"Exported {output_path}")


for image_name in IMAGE_NAMES:
    image_path = os.path.join(PRODUCTS_DIR, image_name)
    if not os.path.isfile(image_path):
        raise FileNotFoundError(image_path)
    create_model(image_path)

print("Finished generating all BIGFISH 3D models.")