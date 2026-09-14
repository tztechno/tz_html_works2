# Terrain Mesh Converter — User Manual

**GeoTIFF (DEM) → OBJ / STL Converter**

This tool converts a GeoTIFF elevation raster (DEM) — such as SRTM data — into a 3D terrain mesh you can use in Blender, PolyBench 3D Converter, MuJoCo, Unity, or any other tool that reads OBJ or STL. Everything runs locally in your browser; no file is ever uploaded to a server.

The interface is bilingual: use the **EN / 日本語** toggle in the top-right corner to switch between English and Japanese at any time. Switching updates all labels, the currently selected file's status, and the results panel immediately; lines already written to the processing log stay in whichever language was active when they were logged.

---

## 1. Requirements

- A modern desktop browser (Chrome, Edge, Firefox, or Safari).
- An internet connection the first time you open the file — it loads the `geotiff.js` parsing library from a CDN, and (only if you use the Preview button) the `three.js` 3D library the first time you click **Preview**. After each library has loaded once, no further network access is needed.
- A browser with WebGL support is required for the **Preview** feature specifically; conversion and download work without it.
- Open `tif-to-obj-converter.html` directly by double-clicking it (or dragging it into a browser window). It does not need a server.

## 2. Basic Workflow

1. **Load a file** — drag a `.tif` / `.tiff` file onto the drop zone, or click the drop zone to open a file picker.
2. **Set parameters** — adjust *Max grid resolution* and *Vertical exaggeration* if needed (defaults work for most files; see below).
3. **(Optional) Preview** — click **Preview** to open an interactive 3D view of the terrain right in the browser, without generating any file. See [section 4](#4-3d-preview-no-export-needed) below.
4. **Click "Convert"** — the tool reads the raster, builds the mesh, and shows progress in the log panel.
5. **Check the stats** — vertex/triangle counts, elevation range, and output file sizes appear once conversion finishes.
6. **Download** — click **Download OBJ** and/or **Download STL (binary)** to save the result to your computer.

You can change the parameters and click Convert (or Preview) again as many times as you like without reloading the file.

## 3. Parameters

### Max grid resolution (cells per side)

Caps how many grid cells the output mesh has along its longer side. The source DEM is downsampled (strided sampling, not averaged) to fit this limit.

- **Default: 400** — a good balance of detail and file size for most SRTM tiles.
- **Higher values** (e.g. 800–1000) preserve more terrain detail but produce much larger OBJ/STL files and take longer to generate.
- **Lower values** (e.g. 100–200) are useful for quick previews or when the mesh will be viewed at a small scale.
- Range: 20–2000.

### Vertical exaggeration

Multiplies every elevation value before building the mesh.

- **1** = true scale (1 unit of height = 1 unit of horizontal distance, e.g. 1 meter = 1 meter).
- **2–4** is a common range for making subtle terrain relief more visible, especially over large or relatively flat areas.
- Range: 0.1–20.

This only affects the Z coordinate of the mesh — it does not change the X/Y footprint.

## 4. 3D Preview (No Export Needed)

The **Preview** button answers a common question: *can I look at the terrain without producing an OBJ or STL file?* Click it any time after loading a file — it does not require clicking Convert first, and it does not create any downloadable file.

What happens:

- The tool reads the GeoTIFF and builds an elevation grid, exactly as Convert does, then hands it to a lightweight Three.js 3D viewer that opens in a modal window.
- The mesh is colored with a simple hypsometric ramp — green at the lowest points, tan through the middle range, near-white at the highest — so relief is easy to read at a glance.
- **Drag** with the mouse to rotate the view; **scroll** to zoom in and out.
- For smooth interaction, the preview grid is automatically capped at 300 cells per side, even if *Max grid resolution* is set higher. This only affects what you see in the preview window — clicking Convert afterwards still uses your full requested resolution. The log records when this cap was applied.
- *Vertical exaggeration* is applied to the preview the same way it is applied to the exported mesh, so you can dial it in visually before converting.
- Close the preview with the **×** button, by pressing **Esc**, or by clicking outside the modal.

This is the fastest way to sanity-check orientation, relief, and NoData artifacts before committing to a full conversion and download.

## 5. Reading the Results

After a successful conversion, the stats panel shows:

| Field | Meaning |
|---|---|
| Vertices | Total mesh vertices = downsampled grid rows × columns |
| Triangles | Two triangles per grid cell (a quad split diagonally) |
| OBJ size | Size of the plain-text `.obj` file |
| STL size | Size of the binary `.stl` file |
| Elevation range | Minimum–maximum elevation in the source data, after vertical exaggeration is applied |

The processing log (dark panel) records each step — grid size, detected extent, NoData value if present, downsampling stride, and which coordinate projection was used. Check it if a conversion looks wrong.

## 6. Which Output Format Should I Use?

- **OBJ** — plain text, human-readable, universally supported. Larger file size. Good default choice, and required by tools that expect vertex/face lists (e.g. custom pipelines, some game engines).
- **STL (binary)** — compact binary format, standard for 3D printing and many CAD/mesh tools (Blender, MeshLab, PolyBench 3D Converter). No vertex reuse — each triangle stores its own 3 vertices — so file size scales with triangle count rather than vertex count.

Both formats describe the exact same mesh; there is no quality difference, only file format and size.

## 7. Coordinate Handling

The tool automatically decides how to interpret the GeoTIFF's coordinate reference system (CRS):

- **Geographic coordinates (degrees, e.g. EPSG:4326)** — detected automatically when the bounding box looks like valid longitude/latitude values spanning a reasonably small area. In this case the tool projects the data to approximate real-world meters using a simple equirectangular (plate carrée) approximation centered on the tile, so a 1×1 grid unit in the output mesh corresponds to roughly 1 meter.
- **Projected coordinates (already in meters or another linear unit)** — used as-is, with no additional transformation.

This is a lightweight, local approximation intended for single DEM tiles — it is not a substitute for a full geodetic projection library, and accuracy decreases for very large or high-latitude extents.

## 8. NoData Values

If the GeoTIFF specifies a NoData value (read from GDAL metadata), matching cells are treated as missing and filled with the minimum valid elevation found in the raster, so the mesh has no holes or spikes at NoData pixels. This is a simple fill strategy, not interpolation — for DEMs with large NoData regions, consider pre-processing the source file (e.g. with GDAL) before conversion.

## 9. Tips & Limitations

- **Large files**: very high-resolution source rasters (e.g. full-resolution SRTM tiles) can take noticeably longer to read and may use significant browser memory. Lowering "Max grid resolution" is the main lever if a conversion is slow or the browser becomes unresponsive.
- **Single elevation band only**: the tool reads only the first raster band; multi-band GeoTIFFs (e.g. RGB imagery) are not meaningful inputs.
- **No smoothing**: downsampling is done by picking every *n*-th sample (stride), not by averaging. For a smoother result at low resolutions, pre-resample the source DEM with GDAL or similar before loading it here.
- **Everything stays local**: since there is no upload step, you can safely convert proprietary or embargoed elevation data.
- **Re-converting**: adjusting a parameter and clicking Convert again fully regenerates the mesh from the original loaded file — it does not build on the previous result.
- **Preview vs. export resolution**: the 3D preview is capped at 300 cells per side regardless of the *Max grid resolution* setting; this is purely a viewing convenience and never affects the OBJ/STL you download.

## 10. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| "Error: ..." in the log | Check the file is a valid GeoTIFF with an elevation band; corrupted or unsupported compression can cause `geotiff.js` to throw. |
| Mesh looks flat or has no relief | Increase Vertical exaggeration, or confirm the source file actually contains elevation values (not a classified/categorical raster). |
| Conversion is slow / tab freezes | Lower Max grid resolution before converting a large source file. |
| Download buttons stay disabled | Conversion did not complete — check the log for an error message. |
| Convert button is disabled | No file has been loaded yet — select or drop a `.tif` file first. |
| "Failed to load three.js from CDN" | No internet connection was available the first time you clicked Preview. Reconnect and click Preview again — Convert and Download do not need this library. |
| Preview shows "WebGL is not available in this browser" | Your browser or device does not support WebGL, or it has been disabled. Try a different browser, or use Convert + Download and view the mesh in Blender or another desktop tool instead. |
