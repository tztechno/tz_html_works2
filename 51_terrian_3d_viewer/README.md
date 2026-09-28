# Terrain 3D Viewer

Drop a terrain GeoTIFF (DEM) and get an interactive, rotatable 3D map with the matching aerial photo draped on it. Everything runs in the browser — no server.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/ (deploy anywhere: Cloudflare Pages, Netlify, GitHub Pages)
```

## How it works

| Step | File | What happens |
|---|---|---|
| Read DEM | `src/dem.ts` | geotiff.js reads band 1 (downsampled via overviews), proj4 reprojects to Web Mercator (EPSG:3857) on a grid capped at *Mesh resolution* px per side. Nodata → NaN. |
| CRS | `src/crs.ts` | Built-in defs for JGD2011/JGD2000 plane zones I–XIX, JGD2011 UTM, WGS84/NAD83 UTM, geographic. Other EPSG codes are looked up on epsg.io. |
| Imagery | `src/tiles.ts` | Picks the zoom that matches the DEM resolution (capped by *Max imagery tiles*), fetches XYZ tiles, stitches them on a canvas, and resamples onto the DEM grid. |
| 3D | `src/mesh.ts` | Plotly `mesh3d` with per-vertex photo colors. Horizontal units are corrected from Mercator to ground meters. |

Imagery sources: Esri World Imagery (global), GSI Seamless Photo (Japan only). Keep the attribution shown in the plot when publishing.

## Notes

- The GeoTIFF must have an EPSG code in its geokeys (user-defined CRS is rejected).
- Mesh resolution 600 means up to ~360k vertices; slower machines may lag.
- "Download standalone HTML" saves the current view (including camera angle); it loads plotly from jsDelivr.
