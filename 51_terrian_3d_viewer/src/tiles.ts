import type { Dem } from "./dem";

export const ORIGIN = 20037508.342789244; // half of the Web Mercator world width (m)
const TILE_PX = 256;

export interface TileSource {
  label: string;
  url: string; // {z} {x} {y} placeholders
  maxZoom: number;
  attribution: string;
}

export const TILE_SOURCES: TileSource[] = [
  {
    label: "Esri World Imagery (global)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
    attribution: "Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  },
  {
    label: "GSI Seamless Photo (Japan only)",
    url: "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
    maxZoom: 18,
    attribution: "地理院タイル（全国最新写真（シームレス））",
  },
];

export type Bounds = [number, number, number, number]; // left, bottom, right, top

export function demBounds(d: Dem): Bounds {
  return [d.left, d.top - d.res * d.h, d.left + d.res * d.w, d.top];
}

/** Inclusive XYZ tile index range covering Web Mercator bounds at zoom z. */
export function tileRange(b: Bounds, z: number) {
  const size = (2 * ORIGIN) / 2 ** z;
  const n = 2 ** z - 1;
  const clamp = (v: number) => Math.min(Math.max(v, 0), n);
  return {
    x0: clamp(Math.floor((b[0] + ORIGIN) / size)),
    x1: clamp(Math.floor((b[2] + ORIGIN) / size)),
    y0: clamp(Math.floor((ORIGIN - b[3]) / size)),
    y1: clamp(Math.floor((ORIGIN - b[1]) / size)),
  };
}

/** Smallest zoom that reaches targetRes, without exceeding maxTiles. */
export function chooseZoom(b: Bounds, targetRes: number, maxZoom: number, maxTiles: number): number {
  let best = 0;
  for (let z = 0; z <= maxZoom; z++) {
    const { x0, x1, y0, y1 } = tileRange(b, z);
    if ((x1 - x0 + 1) * (y1 - y0 + 1) > maxTiles) break;
    best = z;
    if ((2 * ORIGIN) / (TILE_PX * 2 ** z) <= targetRes) break;
  }
  return best;
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // required to read pixels back from the canvas
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export interface Mosaic {
  canvas: HTMLCanvasElement;
  left: number; // EPSG:3857 of the mosaic's top-left corner
  top: number;
  res: number; // meters per mosaic pixel
  failed: number;
  total: number;
  zoom: number;
}

export async function fetchMosaic(b: Bounds, z: number, src: TileSource): Promise<Mosaic> {
  const { x0, x1, y0, y1 } = tileRange(b, z);
  const nx = x1 - x0 + 1, ny = y1 - y0 + 1;
  const canvas = document.createElement("canvas");
  canvas.width = nx * TILE_PX;
  canvas.height = ny * TILE_PX;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#808080"; // gray fallback for missing tiles
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const jobs: Promise<boolean>[] = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const url = src.url.replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(y));
      jobs.push(
        loadImage(url).then((img) => {
          if (!img) return false;
          ctx.drawImage(img, (x - x0) * TILE_PX, (y - y0) * TILE_PX, TILE_PX, TILE_PX);
          return true;
        }),
      );
    }
  }
  const ok = await Promise.all(jobs);
  const size = (2 * ORIGIN) / 2 ** z;
  return {
    canvas,
    left: -ORIGIN + x0 * size,
    top: ORIGIN - y0 * size,
    res: size / TILE_PX,
    failed: ok.filter((v) => !v).length,
    total: ok.length,
    zoom: z,
  };
}

/** Resample the mosaic onto the DEM grid -> RGBA pixels (w*h*4). */
export function drape(m: Mosaic, d: Dem): Uint8ClampedArray {
  const out = document.createElement("canvas");
  out.width = d.w;
  out.height = d.h;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const sx = (d.left - m.left) / m.res;
  const sy = (m.top - d.top) / m.res;
  const s = d.res / m.res;
  ctx.drawImage(m.canvas, sx, sy, d.w * s, d.h * s, 0, 0, d.w, d.h);
  return ctx.getImageData(0, 0, d.w, d.h).data;
}
