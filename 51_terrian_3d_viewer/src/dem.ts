import { fromArrayBuffer } from "geotiff";
import proj4 from "proj4";
import { ensureCrs, epsgFromGeoKeys } from "./crs";

/** DEM resampled onto a north-up Web Mercator grid. */
export interface Dem {
  data: Float32Array; // row-major, NaN = nodata
  w: number;
  h: number;
  left: number; // EPSG:3857 bounds
  top: number;
  res: number; // meters (Mercator) per pixel
  min: number;
  max: number;
}

export const WEB_MERCATOR = "EPSG:3857";

export async function loadDem(buf: ArrayBuffer, maxDim: number): Promise<Dem> {
  const tiff = await fromArrayBuffer(buf);
  const img = await tiff.getImage();
  const crs = await ensureCrs(epsgFromGeoKeys(img.getGeoKeys() as Record<string, unknown>));

  const [minx, miny, maxx, maxy] = img.getBoundingBox();
  const nodataRaw = img.getGDALNoData();
  const nodata = nodataRaw === null ? null : Number(nodataRaw);

  // Read a downsampled copy (uses overviews if present) — no need for more than ~2x the output grid
  const W = img.getWidth(), H = img.getHeight();
  const scale = Math.min(1, (2 * maxDim) / Math.max(W, H));
  const rw = Math.max(2, Math.round(W * scale));
  const rh = Math.max(2, Math.round(H * scale));
  const rasters = await img.readRasters({ samples: [0], width: rw, height: rh, resampleMethod: "nearest" });
  const src = rasters[0] as unknown as ArrayLike<number>;
  const pxW = (maxx - minx) / rw, pxH = (maxy - miny) / rh;

  const isValid = (v: number) => Number.isFinite(v) && v !== nodata && v > -12000;

  // Densified bounds in Web Mercator
  const fwd = proj4(crs, WEB_MERCATOR);
  let left = Infinity, right = -Infinity, bottom = Infinity, top = -Infinity;
  const N = 21;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    for (const [x, y] of [
      [minx + t * (maxx - minx), miny], [minx + t * (maxx - minx), maxy],
      [minx, miny + t * (maxy - miny)], [maxx, miny + t * (maxy - miny)],
    ]) {
      const [mx, my] = fwd.forward([x, y]);
      left = Math.min(left, mx); right = Math.max(right, mx);
      bottom = Math.min(bottom, my); top = Math.max(top, my);
    }
  }

  const extent = Math.max(right - left, top - bottom);
  const nativeRes = (right - left) / rw;
  const res = Math.max(nativeRes, extent / maxDim);
  const w = Math.max(2, Math.ceil((right - left) / res));
  const h = Math.max(2, Math.ceil((top - bottom) / res));

  // Inverse-map each output pixel center to the source grid and sample bilinearly
  const data = new Float32Array(w * h).fill(NaN);
  const inv = proj4(WEB_MERCATOR, crs);
  let vmin = Infinity, vmax = -Infinity;

  for (let r = 0; r < h; r++) {
    const my = top - (r + 0.5) * res;
    for (let c = 0; c < w; c++) {
      const mx = left + (c + 0.5) * res;
      const [sx, sy] = inv.forward([mx, my]);
      const fc = (sx - minx) / pxW - 0.5;
      const fr = (maxy - sy) / pxH - 0.5;
      if (fc < -0.5 || fr < -0.5 || fc > rw - 0.5 || fr > rh - 0.5) continue;

      const c0 = Math.max(0, Math.min(rw - 2, Math.floor(fc)));
      const r0 = Math.max(0, Math.min(rh - 2, Math.floor(fr)));
      const dx = Math.min(1, Math.max(0, fc - c0)), dy = Math.min(1, Math.max(0, fr - r0));
      const v00 = src[r0 * rw + c0], v01 = src[r0 * rw + c0 + 1];
      const v10 = src[(r0 + 1) * rw + c0], v11 = src[(r0 + 1) * rw + c0 + 1];

      let v: number;
      if (isValid(v00) && isValid(v01) && isValid(v10) && isValid(v11)) {
        v = (v00 * (1 - dx) + v01 * dx) * (1 - dy) + (v10 * (1 - dx) + v11 * dx) * dy;
      } else {
        // Fall back to nearest neighbor near nodata edges
        const n = src[Math.round(fr) * rw + Math.round(fc)];
        if (!isValid(n)) continue;
        v = n;
      }
      data[r * w + c] = v;
      if (v < vmin) vmin = v;
      if (v > vmax) vmax = v;
    }
  }

  if (!Number.isFinite(vmin)) throw new Error("The DEM contains no valid elevation values.");
  return { data, w, h, left, top, res, min: vmin, max: vmax };
}
