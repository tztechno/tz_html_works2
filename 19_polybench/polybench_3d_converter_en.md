# Poly Bench — User Manual

**A 3D model format converter that runs entirely in your browser**

Poly Bench lets you drag in a 3D model — OBJ, STL, PLY, glTF, or GLB — and convert it to any of the other supported formats, then download the result. Everything happens locally in your browser; nothing is uploaded anywhere. This tool is conversion-only — to inspect or rotate a model without converting it, use the companion tool "Poly Viewer".

The interface is bilingual: use the **EN / 日本語** toggle in the top-right corner to switch between English and Japanese at any time. All labels, panel headings, and status messages update immediately.

---

## 1. Requirements

- A modern desktop browser (Chrome, Edge, Firefox, or Safari) with WebGL support.
- An internet connection the first time you open the file, to load the Google Fonts used in the interface. The 3D engine itself is bundled directly into the file, so no other network access is required — loading and converting models work fully offline after that.
- Open the HTML file directly by double-clicking it, or dragging it into a browser window. It does not need a server.

## 2. Loading a Model

1. **Drag and drop** one or more files onto the drop zone, or click **Choose Files** to open a file picker.
2. **Select every related file together** when your model needs more than one file:
   - An **.obj** with materials needs its **.mtl** file, plus any texture images (.png/.jpg/.jpeg/.webp/.tga/.bmp) it references.
   - A **.gltf** (the non-binary form) needs its **.bin** file and any texture images. A single **.glb** is self-contained.
   - **.stl** and **.ply** are self-contained.
3. Poly Bench picks the first file with a recognized extension (obj, stl, ply, gltf, glb) as the model to load and treats the rest as its supporting files (materials, buffers, textures). FBX and USD/USDZ are not accepted as input — see [Limitations](#6-limitations).
4. Once loaded, the drop zone disappears, the viewport shows your model, and the **Output settings** panel appears in the inspector. Click **Load a Different Model** at any time to start over with something else.

## 3. The Viewport

Once a model is loaded, a small heads-up display and toolbar appear over the 3D view:

- **Format chip** (top-left) — shows the detected file format.
- **Triangle count chip** — the total triangle count in the loaded mesh.
- **Toolbar** (bottom-left), two buttons:
  - **Reset view** — reframes the camera on the model.
  - **Toggle wireframe** — shows the mesh as edges only.
- **Mouse/touch controls** — drag to orbit, scroll (or pinch) to zoom, right-drag to pan (standard orbit-camera controls).

Poly Bench's viewport is there to help you confirm you loaded the right file — it is not a full inspector. For animation playback, bones, or a detailed stats panel, use "Poly Viewer".

## 4. Choosing an Output Format and Converting

The **Output settings** panel has one control: the **Output format** dropdown, offering seven choices:

| Option | Produces |
|---|---|
| glTF (.gltf, text) | A JSON glTF file (materials, textures, bones, and animation referenced or embedded) |
| GLB (.glb, binary) | The binary, single-file form of glTF |
| OBJ (.obj) | A plain-text OBJ (geometry and UVs only) |
| STL (.stl, binary) | A binary STL (triangle mesh only) |
| STL (.stl, text) | An ASCII STL (triangle mesh only) |
| PLY (.ply, binary) | A binary PLY (geometry, normals, and vertex colors) |
| PLY (.ply, text) | An ASCII PLY (geometry, normals, and vertex colors) |

Below the dropdown, a **compatibility note** updates automatically whenever you change the format:

- A green checkmark means the chosen format retains everything the loaded model has.
- An amber warning lists exactly what will be **lost** in the conversion — for example, "OBJ can't retain the following: Animation, Bones / Skinning, Textures" if you loaded an animated, textured glTF and chose OBJ as the output.

Once you're happy with the format, click **Convert and Download**. Poly Bench converts the model in memory and saves the result to your downloads with a matching filename and extension. A status line below the button reports progress ("Exporting…") and the outcome ("Saved: model.glb") or any error.

## 5. What Each Format Retains

This is the same information shown in the **Data retained by format** table in the inspector, for reference regardless of which model you have loaded:

| Format | Data retained |
|---|---|
| OBJ | Vertices, faces, UVs (materials not supported) |
| STL | Triangle mesh only (no color or texture) |
| PLY | Vertices, normals, vertex colors |
| glTF/GLB | Mesh, PBR materials, textures, bones, animations |

Converting from a richer format (glTF/GLB) to a simpler one (OBJ, STL, PLY) is a one-way trip: whatever the target format can't represent is dropped, and there's no way to get it back by converting again. Always check the compatibility note before converting if you need to keep specific data.

## 6. Limitations

- **FBX and USD/USDZ are not supported**, for licensing reasons. Poly Bench can't load or export either format. If you need to work with them, convert to glTF/GLB first with another tool, or use "Poly Viewer" (which can at least display FBX and USD/USDZ, experimentally) as a stopgap for inspection.
- **Draco-compressed glTF/GLB is not supported** as input. If a .glb was exported with Draco mesh compression, it will fail to load — re-export it without Draco compression.
- File sets are capped at roughly **100MB** total.
- If you opened Poly Bench from inside a Claude conversation's live preview rather than as a downloaded, standalone HTML file, direct downloads may not be available for some or all output formats — the app will tell you and point you to the standalone file. See [Troubleshooting](#8-troubleshooting).

## 7. Privacy

Everything — reading the file, converting it, and generating the output — happens on your device inside your browser. No file, filename, or model data is ever sent anywhere. You can safely convert proprietary or unpublished models.

## 8. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Dropping a file does nothing | None of the files you dropped had a recognized extension (obj/stl/ply/gltf/glb). FBX and USD/USDZ are not accepted — see [Limitations](#6-limitations). |
| "Failed to load: ..." | The file matched a supported extension but couldn't be parsed — it may be corrupted, use an unsupported feature (e.g. Draco compression), or reference a missing related file (.mtl, .bin, or a texture). |
| The compatibility note shows warnings I didn't expect | The source model has data (animation, bones, materials, textures, or vertex colors) that the chosen output format can't represent. Pick a richer format (glTF/GLB) if you need to keep it. |
| "Downloads aren't available in this preview..." | You're running Poly Bench inside a Claude conversation's live preview, which can't save these file types directly. Download the standalone HTML file from the conversation and open it in your browser instead — everything works normally from there. |
| "This preview can't save '.xxx' files directly..." | Same cause as above, for one specific format. Use the standalone HTML file. |
| "Save cancelled." | You (or the browser) cancelled a save dialog. Click **Convert and Download** again. |
| I want to just view or rotate this model, not convert it | Use the companion tool "Poly Viewer", which is display-only and also shows animations, bones, and detailed stats. |
