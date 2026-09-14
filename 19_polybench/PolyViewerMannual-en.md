# Poly Viewer — User Manual

**A 3D model viewer that runs entirely in your browser**

Poly Viewer lets you drag in a 3D model — OBJ, STL, PLY, glTF, GLB, FBX, or USD/USDZ — and inspect it immediately: rotate it, check its wireframe, play back any embedded animation, and see its vertex/triangle/material counts. Everything happens locally in your browser; nothing is uploaded anywhere. This viewer is display-only — for format conversion, use the companion tool "Poly Bench".

The interface is bilingual: use the **EN / 日本語** toggle in the top-right corner to switch between English and Japanese at any time. All labels, panel headings, tooltips, and status messages update immediately.

---

## 1. Requirements

- A modern desktop browser (Chrome, Edge, Firefox, or Safari) with WebGL support.
- An internet connection the first time you open the file, to load the Google Fonts used in the interface. The 3D engine itself is bundled directly into the file, so no other network access is required — model loading and rendering work fully offline after that.
- Open the HTML file directly by double-clicking it, or dragging it into a browser window. It does not need a server.

## 2. Loading a Model

1. **Drag and drop** one or more files onto the drop zone, or click **Choose Files** to open a file picker.
2. **Select every related file together** when your model needs more than one file:
   - An **.obj** with materials needs its **.mtl** file, plus any texture images (.png/.jpg/.jpeg/.webp/.tga/.bmp) it references.
   - A **.gltf** (the non-binary form) needs its **.bin** file and any texture images. A single **.glb** is self-contained.
   - **.stl**, **.ply**, **.fbx**, and **.usd/.usda/.usdc/.usdz** are typically self-contained, though FBX and USD can also reference external textures.
3. Poly Viewer picks the first file with a recognized extension (obj, stl, ply, gltf, glb, fbx, usd, usda, usdc, usdz) as the model to load and treats the rest as its supporting files (materials, buffers, textures).
4. Once loaded, the drop zone disappears and the viewport shows your model. Click **Load a Different Model** in the inspector panel at any time to load something else.

If none of the dropped files has a supported extension, or the file fails to parse, a message explains what went wrong in place of the drop zone's instructions — see [Troubleshooting](#8-troubleshooting).

## 3. The Viewport

Once a model is loaded, a heads-up display and a toolbar appear over the 3D view:

- **Format chip** (top-left) — shows the detected file format (OBJ, STL, GLTF, etc.).
- **Triangle count chip** — the total triangle count in the loaded mesh.
- **Experimental-parser chip** — appears only for FBX and USD/USDZ files, since those parsers are newer and less battle-tested than the others (see [Supported Formats](#6-supported-formats--limitations)).
- **Toolbar** (bottom-left), four buttons:
  - **Reset view** — reframes the camera on the model.
  - **Toggle wireframe** — shows the mesh as edges only.
  - **Toggle grid** — shows or hides the reference floor grid.
  - **Toggle auto-rotate** — spins the model slowly around its vertical axis.
- **Mouse/touch controls** — drag to orbit, scroll (or pinch) to zoom, right-drag to pan (standard orbit-camera controls).

## 4. Animation Playback

If the loaded model contains one or more animation clips (common with glTF/GLB and FBX), a transport bar appears at the bottom-center of the viewport:

- **Play / Pause** button.
- **Clip selector** — pick which animation clip to play, when a model has more than one.
- **Scrubber** — drag to jump to any point in the current clip.
- **Time label** — current time / total clip duration, in seconds.

Models without animation data simply don't show this bar.

## 5. The Inspector Panel

The right-hand panel has three sections:

**Loaded Model** — the filename, followed by six stats: Vertices, Triangles, Materials, Textures, Animations, and Bones. These reflect the model exactly as loaded, before any display option (like wireframe) changes how it's rendered.

**Display Settings** — five toggles, all optional and purely visual (none of them affect the exported understanding of the model, since Poly Viewer never exports anything):
- **Studio Lighting (IBL)** — image-based lighting for a more realistic, evenly-lit look. On by default.
- **Show Environment as Background** — shows the lighting environment itself behind the model instead of the plain background. Off by default.
- **Show Grid** — the reference floor grid. On by default; mirrors the grid toggle in the viewport toolbar.
- **Auto-Rotate** — mirrors the toolbar's auto-rotate toggle.
- **Wireframe** — mirrors the toolbar's wireframe toggle.

**Supported Formats & Limitations** — a reference table, always visible (see next section).

## 6. Supported Formats & Limitations

| Format | Support |
|---|---|
| OBJ | Supports MTL and textures |
| STL | Supports both ASCII and binary |
| PLY | Supports ASCII / binary and vertex colors |
| glTF/GLB | Supports PBR materials, bones, and animation |
| FBX | Supports geometry, materials, bones, and animation (experimental) |
| USD/USDZ | Supports basic meshes and materials (experimental; layer composition and similar are not supported) |

Two things to know regardless of format:

- **Draco-compressed glTF/GLB is not supported.** If a .glb was exported with Draco mesh compression, it will fail to load — re-export it without Draco compression.
- **FBX and USD/USDZ parsers are experimental.** They cover the common cases but are less mature than the OBJ/STL/PLY/glTF parsers, so some files in these formats may not display correctly or may fail to load.

## 7. Privacy

Everything — reading the file, parsing it, and rendering it — happens on your device inside your browser. No file, filename, or model data is ever sent anywhere. You can safely inspect proprietary or unpublished models.

## 8. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| "No file with a supported extension... was found" | None of the files you dropped had a recognized extension (obj/stl/ply/gltf/glb/fbx/usd/usda/usdc/usdz). Check the file type, or that the model file itself (not only its textures) was included. |
| "Failed to load: ..." | The file matched a supported extension but couldn't be parsed — it may be corrupted, use an unsupported feature (e.g. Draco compression), or reference a missing related file (.mtl, .bin, or a texture). |
| Model loads but has no texture / looks grey | A referenced texture or .mtl/.bin file wasn't included in the selection. Reload, selecting all related files together. |
| FBX or USD file looks wrong or fails to load | These parsers are experimental (see section 6) — some files aren't fully supported yet. |
| Nothing happens when I drop a folder | Drop or select the individual files inside it, not the folder itself. |
| Animation transport bar doesn't appear | The loaded model has no animation clips. |
| I want to convert this file to another format | Poly Viewer is display-only by design. Use the companion tool "Poly Bench" for conversion. |
