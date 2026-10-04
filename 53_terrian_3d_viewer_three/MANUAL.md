# Terrain 3D Viewer (three.js) — User Manual

Turn a terrain GeoTIFF (DEM) into a 3D diorama with the matching aerial photo, hillshade, elevation colors or contour lines. Everything runs in your browser; your file is never uploaded anywhere.

This is the three.js version of [51_terrian_3d_viewer](../51_terrian_3d_viewer/) (Plotly) — see also the CesiumJS version [52_terrian_3d_viewer_cesium](../52_terrian_3d_viewer_cesium/). No build step is needed.

---

## 1. Quick start

1. Open `index.html` through a web server (GitHub Pages, `python3 -m http.server`, etc. — ES modules do not load from `file://`).
2. Drop a DEM GeoTIFF onto the box in the left panel (or click it and pick a file).
3. Wait a few seconds: the DEM is read, the aerial photo is downloaded, and the 3D model appears.
4. Rotate, zoom and pan with the mouse.

You can also load a DEM from a URL: `index.html?dem=https://example.com/dem.tif` (the server must allow CORS).

---

## 2. Screen layout

| Area | What it is |
|---|---|
| Drop box | Load a `.tif` / `.tiff` file. Shows the file name once loaded. |
| Aerial imagery | Choose the photo source (see §4). Re-downloads the photo. |
| Mesh resolution | Max grid size per side (100–1000). Higher = more detail, slower. |
| Max imagery tiles | Upper limit on photo tiles downloaded (4–1024). Higher = sharper photo, slower. |
| Vertical exaggeration | Stretches elevation (0.5×–10×). Instant. |
| Surface | Aerial photo / Elevation colors / Hillshade. Instant. |
| Relief shading | How much sun shading (light from the north-west) is mixed into the photo or colors. Instant. |
| Contour lines | Contours at an automatic interval (shown in Stats), every 5th line bold. Instant. |
| Base walls | Side walls that make the model look like a cut-out block. Instant. |
| Ground grid | Grid under the model (spacing chosen automatically). Instant. |
| Status line | Progress messages, warnings (yellow) and errors (red). |
| Stats | Grid size and cell size, area, elevation range, contour interval, imagery zoom / tiles / texture size, center. |
| Save PNG | Saves the current view as an image. |
| Download GLB | Saves the textured terrain as a glTF binary 3D model (meters, Y up, current exaggeration) for Blender, Unity, etc. |
| Download standalone HTML | Saves the current view (DEM, photo, settings and camera) as a single HTML file. |
| Main area | The 3D model. Top-left: position under the cursor. Top-right: north arrow. Bottom-left: imagery credit. |

---

## 3. Mouse controls

| Action | Result |
|---|---|
| Left drag | Rotate |
| Scroll wheel | Zoom |
| Right drag (or Shift / Ctrl + left drag) | Pan |
| Double-click | Reset the view |
| Hover | East / North (m from center), lat/lon and elevation |

Touch: one finger rotates, two fingers zoom and pan.

---

## 4. Aerial imagery sources

| Source | Coverage | Notes |
|---|---|---|
| Esri World Imagery | Worldwide | Default. |
| GSI Seamless Photo (地理院タイル) | Japan only | Often newer / sharper for Japan. Outside Japan the tiles come back gray. |

The photo is a texture, so it can be much sharper than the mesh. The zoom level is the finest one that fits **Max imagery tiles** and the GPU texture limit (8192 px per side). If the photo looks blurry, raise **Max imagery tiles**.

The credit line for the selected source is shown bottom-left. Keep it visible if you publish screenshots, models or exported HTML.

---

## 5. What files work

**Required**
- GeoTIFF (`.tif` / `.tiff`) with elevation in band 1.
- An **EPSG code** embedded in the file (normal for files exported from QGIS / GDAL).

**Coordinate systems handled offline**
- JGD2011 / JGD2000 Japan Plane Rectangular CS, zones I–XIX (EPSG:6669–6687, 2443–2461)
- JGD2011 UTM 51–55N (EPSG:6688–6692)
- WGS84 UTM (EPSG:326xx / 327xx), NAD83 UTM (EPSG:269xx)
- Geographic lat/lon: WGS84 (4326), JGD2011 (6668), JGD2000 (4612), NAD83 (4269)
- Web Mercator (3857)

Any other EPSG code is looked up automatically on epsg.io (needs internet).

The DEM is reprojected to a Web Mercator grid (to match the photo tiles) and shown in true ground meters around its center.

**Nodata** values (declared in the file, or below −12000 such as −9999 / −32768) are cut out of the mesh as holes.

---

## 6. Tips

- Flat areas look better with **Vertical exaggeration** at 2–5×.
- **Hillshade** + **Contour lines** gives a clean topographic-map look; **Elevation colors** shows height bands at a glance.
- Changing resolution, imagery source or tile limit rebuilds the model (the camera is kept); every other control is instant.
- GLB files are large when the photo is large: lower **Max imagery tiles** for a lighter model.
- The exported HTML embeds the DEM and photo and loads three.js from a CDN — it opens on any computer with internet.

---

## 7. Troubleshooting

| Message / symptom | Cause | Fix |
|---|---|---|
| *This GeoTIFF has no CRS* | File has no coordinate system | Re-export from QGIS/GDAL with a CRS assigned. |
| *User-defined CRS is not supported* | Custom projection without an EPSG code | Reproject to a standard EPSG (e.g. 6677 or 4326). |
| *Unknown CRS EPSG:xxxx* | Uncommon code and epsg.io unreachable | Check internet, or reproject to a common EPSG. |
| *The DEM contains no valid elevation values* | Whole file is nodata | Check the file in QGIS. |
| *n/N tiles could not be fetched (gray)* | Network issue, or GSI chosen outside Japan | Switch to Esri, or retry. |
| Slow or tab crashes | Mesh or photo too large | Lower **Mesh resolution** or **Max imagery tiles**. |
| Blank page | Opened via `file://`, or WebGL disabled | Serve over HTTP; enable hardware acceleration. |

---

## 8. Files

| File | Role |
|---|---|
| `index.html` | Page layout; import map for three.js (jsDelivr). |
| `style.css` | Sidebar styles. |
| `app.js` | GeoTIFF reading (geotiff.js), reprojection (proj4), imagery tiles, UI, exports. |
| `viewer.js` | three.js scene: mesh, terrain shader (photo / colors / hillshade / contours), walls, grid, controls, hover. Inlined into exported HTML. |

---

## 9. Privacy

- Your GeoTIFF is processed entirely inside the browser and is never sent to a server.
- Network requests: three.js / geotiff.js / proj4 from jsDelivr, imagery tiles (Esri / GSI) for the map area, and an epsg.io lookup for uncommon coordinate systems.
