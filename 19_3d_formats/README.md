# Poly Bench

A 3D model format converter that runs entirely in your browser. Drop in a model, preview it in an interactive 3D viewport, and export it to a different format — no server, no upload, no installation.

## What it does

Poly Bench loads a 3D model, renders it in a live viewport, and lets you convert it to one of several common exchange formats. All parsing, rendering, and export happen client-side; model data is never transmitted anywhere.

## Supported formats

**Input:** OBJ, STL, PLY, glTF, GLB (plus companion files such as `.mtl`, `.bin`, and textures — select them together with the main model file)

**Output:**
- glTF (`.gltf`, text)
- GLB (`.glb`, binary)
- OBJ (`.obj`)
- STL (`.stl`, binary or text)
- PLY (`.ply`, binary or text)

FBX and USD/USDZ are intentionally not supported, for licensing reasons.

## Data retained by format

Different formats carry different amounts of information. When converting, keep in mind what each target format can actually hold:

| Format | Data retained |
|---|---|
| OBJ | Vertices, faces, UVs (materials not supported) |
| STL | Triangle mesh only (no color or texture) |
| PLY | Vertices, normals, vertex colors |
| glTF/GLB | Mesh, PBR materials, textures, bones, animations |

## Using it

1. Drop a model file (or a group of related files) onto the page, or click **Choose files** to pick them.
2. Poly Bench parses the model and displays it in the viewport, along with stats: vertex count, triangle count, materials, textures, animations, and bones.
3. Use the viewport toolbar to reset the view or toggle wireframe display.
4. Pick an output format from the **Output settings** panel.
5. Click **Convert and download** to export the converted file.

A rough guideline is about 100MB per file set. Larger models may be slow or run into browser memory limits.

## Privacy

Everything — loading, conversion, and export — happens locally in your browser. No model data is ever sent to a server.
