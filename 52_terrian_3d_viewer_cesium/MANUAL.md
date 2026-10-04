# Terrain 3D Viewer (Cesium) — User Manual

Turn a terrain GeoTIFF (DEM) into a 3D map on a CesiumJS globe, with aerial imagery draped on top. Everything runs in your browser; your file is never uploaded anywhere.

This is the CesiumJS port of [51_terrian_3d_viewer](../51_terrian_3d_viewer/). No build step and no Cesium ion token are needed.

---

## 1. Quick start

1. Open `index.html` through a web server (GitHub Pages, `python3 -m http.server`, etc. — ES modules do not load from `file://`).
2. Drop a DEM GeoTIFF onto the box in the left panel (or click it and pick a file).
3. The DEM is read and the 3D terrain appears; imagery tiles stream in as you move.
4. Rotate, zoom and pan with the mouse.

You can also load a DEM from a URL: `index.html?dem=https://example.com/dem.tif` (the server must allow CORS).

---

## 2. Screen layout

| Area | What it is |
|---|---|
| Drop box | Load a `.tif` / `.tiff` file. Shows the file name once loaded. |
| Aerial imagery | Choose the photo source (see §4). Switches instantly. |
| DEM resolution | Max grid size per side (100–1000) the DEM is resampled to. Higher = more detail, slower to load. |
| Vertical exaggeration | Stretches elevation (0.5×–10×) relative to the lowest point. Updates instantly. |
| Detail | Terrain/imagery refinement (Cesium screen-space error). Higher = sharper, more tiles. |
| Clip globe to DEM area | On: only the DEM rectangle is drawn. Off: the whole globe is shown (flat outside the DEM). |
| Show DEM outline | Draws the DEM boundary. |
| Status line | Progress messages, warnings (yellow) and errors (red). |
| Stats | Grid size, cell size, area, elevation range, center lat/lon. |
| Save PNG | Saves the current view as an image. |
| Download standalone HTML | Saves the current 3D view (DEM, settings and camera) as a single HTML file. |
| Main area | The 3D map. Top-left shows lat/lon and elevation under the cursor. |

---

## 3. Mouse controls (CesiumJS defaults)

| Action | Result |
|---|---|
| Left drag | Pan |
| Scroll wheel / right drag | Zoom |
| Middle drag, or Ctrl + left drag | Rotate / tilt |
| Double-click / 🏠 button | Reset the view |
| Hover | Shows lat/lon and DEM elevation |

The ? button (top-right) shows mouse and touch help. The globe button switches 3D / 2D / Columbus view.

---

## 4. Aerial imagery sources

| Source | Coverage | Notes |
|---|---|---|
| Esri World Imagery | Worldwide | Default. |
| GSI Seamless Photo (地理院タイル) | Japan only | Often newer / sharper for Japan. Outside Japan the tiles fail and the terrain is gray. |

Credits for the selected source appear via "Data attribution" at the bottom-left. Keep them visible if you publish screenshots or exported HTML.

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

The DEM is reprojected to a WGS84 lon/lat grid and fed to Cesium as a custom heightmap terrain. Heights are used as-is (no geoid correction).

**Nodata** values (declared in the file, or below −12000 such as −9999 / −32768) are drawn at 0 m.

**Where to get DEMs**
- Japan: GSI 基盤地図情報 数値標高モデル — downloaded as XML/GML, so convert to GeoTIFF first.
- Worldwide: OpenTopography (SRTM, Copernicus DEM 30 m), USGS EarthExplorer.

---

## 6. Tips

- Flat areas look better with **Vertical exaggeration** at 2–5×.
- Imagery sharpness is no longer limited by a tile count: zoom in and Cesium loads finer tiles automatically. Raise **Detail** for a crisper overview.
- Changing **DEM resolution** re-reads the file (the camera is kept); every other control is instant.
- The exported HTML embeds the resampled DEM and loads CesiumJS from a CDN — open it on any computer with internet.

---

## 7. Troubleshooting

| Message / symptom | Cause | Fix |
|---|---|---|
| *This GeoTIFF has no CRS* | File has no coordinate system | Re-export from QGIS/GDAL with a CRS assigned. |
| *User-defined CRS is not supported* | Custom projection without an EPSG code | Reproject to a standard EPSG (e.g. 6677 or 4326). |
| *Unknown CRS EPSG:xxxx* | Uncommon code and epsg.io unreachable | Check internet, or reproject to a common EPSG. |
| *The DEM contains no valid elevation values* | Whole file is nodata | Check the file in QGIS. |
| *n imagery tile request(s) failed* | Network issue, or GSI chosen outside Japan | Switch to Esri, or retry. |
| Blank page | Opened via `file://`, or WebGL disabled | Serve over HTTP; enable hardware acceleration. |

---

## 8. Files

| File | Role |
|---|---|
| `index.html` | Page layout; loads CesiumJS from jsDelivr. |
| `style.css` | Sidebar styles. |
| `app.js` | GeoTIFF reading (geotiff.js), reprojection (proj4), UI, export. |
| `viewer.js` | Cesium scene: custom heightmap terrain, imagery, camera, hover readout. Inlined into exported HTML. |

---

## 9. Privacy

- Your GeoTIFF is processed entirely inside the browser and is never sent to a server.
- Network requests: CesiumJS / geotiff.js / proj4 from jsDelivr, imagery tiles (Esri / GSI), and an epsg.io lookup for uncommon coordinate systems.
