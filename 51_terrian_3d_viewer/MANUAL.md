# Terrain 3D Viewer — User Manual

Turn a terrain GeoTIFF (DEM) into a rotatable 3D map with the matching aerial photo draped on top. Everything runs in your browser; your file is never uploaded anywhere.

---

## 1. Quick start

1. Open the app in a browser (Chrome, Edge, Safari, Firefox — any recent version with WebGL).
2. Drop a DEM GeoTIFF onto the box in the left panel (or click it and pick a file).
3. Wait a few seconds: the DEM is read, the aerial photo is downloaded, and the 3D map appears.
4. Rotate, zoom and pan the map with the mouse.

---

## 2. Screen layout

| Area | What it is |
|---|---|
| Drop box | Load a `.tif` / `.tiff` file. Shows the file name once loaded. |
| Aerial imagery | Choose the photo source (see §4). |
| Mesh resolution | Max grid size per side (100–600). Higher = more detail, slower. |
| Vertical exaggeration | Stretches elevation (0.5×–10×). Updates instantly. |
| Max imagery tiles | Upper limit on photo tiles downloaded (4–256). Higher = sharper photo, slower. |
| Show axes | Toggle the East / North / Elevation axes and grid. |
| Status line | Progress messages, warnings (yellow) and errors (red). |
| Stats | Grid size, elevation range, imagery zoom level and tile count, center lat/lon. |
| Download standalone HTML | Saves the current 3D view (with its camera angle) as a single HTML file. |
| Main area | The 3D map. |

---

## 3. Mouse controls

| Action | Result |
|---|---|
| Left drag | Rotate |
| Scroll wheel | Zoom |
| Right drag (or Shift + left drag) | Pan |
| Double-click | Reset the view |
| Hover | Shows East / North (m from center) and elevation |

The toolbar in the top-right of the map also has orbit / turntable / pan / zoom modes and a PNG snapshot button.

---

## 4. Aerial imagery sources

| Source | Coverage | Notes |
|---|---|---|
| Esri World Imagery | Worldwide | Default. |
| GSI Seamless Photo (地理院タイル) | Japan only | Often newer / sharper for Japan. Outside Japan the tiles come back gray. |

The credit line for the selected source is shown bottom-left of the map. Keep it visible if you publish screenshots or exported HTML.

The zoom level is chosen automatically to match the DEM resolution, capped by **Max imagery tiles**. If the photo looks blurry, raise that limit.

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

**Nodata** values (declared in the file, or below −12000 such as −9999 / −32768) are cut out of the mesh.

**Where to get DEMs**
- Japan: GSI 基盤地図情報 数値標高モデル — downloaded as XML/GML, so convert to GeoTIFF first (e.g. with QGIS plugins or GDAL-based converters).
- Worldwide: OpenTopography (SRTM, Copernicus DEM 30 m), USGS EarthExplorer.

**Size guide**: files of tens of MB are fine; the app reads a downsampled copy. Very wide areas (hundreds of km) work but the photo becomes coarse because of the tile limit.

---

## 6. Tips

- Flat areas look better with **Vertical exaggeration** at 2–5×.
- Start with **Mesh resolution 300**. Go to 450–600 only on a fast machine.
- Changing **Vertical exaggeration** or **Show axes** is instant; changing resolution, imagery source or tile limit rebuilds the map.
- The exported HTML opens on any computer with internet (it loads plotly from a CDN) — handy for sharing or embedding.

---

## 7. Troubleshooting

| Message / symptom | Cause | Fix |
|---|---|---|
| *This GeoTIFF has no CRS* | File has no coordinate system | Re-export from QGIS/GDAL with a CRS assigned. |
| *User-defined CRS is not supported* | Custom projection without an EPSG code | Reproject to a standard EPSG (e.g. 6677 or 4326). |
| *Unknown CRS EPSG:xxxx* | Uncommon code and epsg.io unreachable | Check internet, or reproject to a common EPSG. |
| *The DEM contains no valid elevation values* | Whole file is nodata | Check the file in QGIS. |
| *n/N tiles could not be fetched (gray)* | Network issue, or GSI chosen outside Japan | Switch to Esri, or retry. |
| Map is all gray | All tiles blocked (offline, firewall, ad-blocker) | Check network / disable blocker for the site. |
| Map is very slow or tab crashes | Mesh too large | Lower **Mesh resolution**. |
| Page is blank after deploying | Unbuilt source was published | See §8. |

---

## 8. Hosting

The app is a static site. Publish the **built** files (`index.html` + `assets/`), never the raw `src/*.ts`.

| Where | How |
|---|---|
| Local | `npm install` → `npm run dev` → open http://localhost:5173 |
| GitHub Pages (no Actions) | `npm run build:docs`, push, then Settings → Pages → Deploy from a branch → `main` / `/docs`. |
| Cloudflare Workers (repo connected) | Build command `npm run build`, deploy command `npx wrangler deploy` (uses `wrangler.jsonc`). |
| Cloudflare Pages (repo connected) | Preset Vite, build `npm run build`, output `dist`. |
| Cloudflare direct upload | Upload only the built files (`index.html` + `assets/`). |

---

## 9. Privacy

- Your GeoTIFF is processed entirely inside the browser and is never sent to a server.
- The only network requests are the imagery tiles (Esri / GSI) for the map area, and an epsg.io lookup for uncommon coordinate systems.
