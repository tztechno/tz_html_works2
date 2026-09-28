import type { Dem } from "./dem";

const EARTH_R = 6378137.0;

export interface Figure {
  data: Record<string, unknown>[];
  layout: Record<string, unknown>;
}

/** Aspect ratio in ground meters, with vertical exaggeration. */
export function aspect(d: Dem, vExag: number) {
  const k = groundScale(d);
  const xr = d.w * d.res * k, yr = d.h * d.res * k;
  const m = Math.max(xr, yr);
  const zr = Math.max(d.max - d.min, 1e-6);
  return { x: xr / m, y: yr / m, z: Math.max((zr * vExag) / m, 0.01) };
}

// Web Mercator stretches distances by 1/cos(lat); this factor converts back to ground meters
function groundScale(d: Dem): number {
  const yc = d.top - (d.res * d.h) / 2;
  const lat = 2 * Math.atan(Math.exp(yc / EARTH_R)) - Math.PI / 2;
  return Math.cos(lat);
}

export function axisStyle(visible: boolean) {
  return { visible, showbackground: false, gridcolor: "#444", color: "#bbb" };
}

export function buildFigure(d: Dem, rgba: Uint8ClampedArray, vExag: number, showAxes: boolean, attribution: string): Figure {
  const { w, h, data } = d;
  const k = groundScale(d);
  const step = d.res * k;
  const n = w * h;

  const x = new Array<number>(n), y = new Array<number>(n), z = new Array<number>(n);
  const color = new Array<string>(n);
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const idx = r * w + c;
      x[idx] = Math.round((c - (w - 1) / 2) * step * 10) / 10;
      y[idx] = Math.round(((h - 1) / 2 - r) * step * 10) / 10;
      const v = data[idx];
      z[idx] = Number.isNaN(v) ? d.min : Math.round(v * 10) / 10;
      color[idx] = `rgb(${rgba[idx * 4]},${rgba[idx * 4 + 1]},${rgba[idx * 4 + 2]})`;
    }
  }

  // Two triangles per grid cell, skipping any that touch nodata
  const I: number[] = [], J: number[] = [], K: number[] = [];
  const bad = (i: number) => Number.isNaN(data[i]);
  for (let r = 0; r < h - 1; r++) {
    for (let c = 0; c < w - 1; c++) {
      const a = r * w + c, b = a + 1, cc = a + w, dd = cc + 1;
      if (!(bad(a) || bad(b) || bad(cc))) { I.push(a); J.push(b); K.push(cc); }
      if (!(bad(b) || bad(dd) || bad(cc))) { I.push(b); J.push(dd); K.push(cc); }
    }
  }

  const ax = axisStyle(showAxes);
  return {
    data: [{
      type: "mesh3d",
      x, y, z, i: I, j: J, k: K,
      vertexcolor: color,
      flatshading: false,
      // Full ambient light so the photo colors are shown as-is
      lighting: { ambient: 1, diffuse: 0, specular: 0, roughness: 1, fresnel: 0 },
      hovertemplate: "E %{x:.0f} m<br>N %{y:.0f} m<br>Elev %{z:.1f} m<extra></extra>",
    }],
    layout: {
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: "#111",
      scene: {
        xaxis: { title: { text: "East (m)" }, ...ax },
        yaxis: { title: { text: "North (m)" }, ...ax },
        zaxis: { title: { text: "Elevation (m)" }, ...ax },
        aspectmode: "manual",
        aspectratio: aspect(d, vExag),
        camera: { eye: { x: 1.2, y: -1.2, z: 0.8 } },
        bgcolor: "#111",
      },
      annotations: [{
        text: attribution, x: 0.01, y: 0.01, xref: "paper", yref: "paper",
        showarrow: false, font: { size: 10, color: "#999" },
      }],
    },
  };
}

/** Standalone HTML that loads plotly from CDN. */
export function toStandaloneHtml(fig: Figure, title: string): string {
  const esc = (s: string) => s.replace(/</g, "\\u003c");
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${title.replace(/</g, "&lt;")}</title>
<script src="https://cdn.jsdelivr.net/npm/plotly.js-dist-min@4.1.1/plotly.min.js"></script>
<style>html,body{margin:0;height:100%;background:#111}#p{width:100%;height:100%}</style></head>
<body><div id="p"></div><script>
Plotly.newPlot("p", ${esc(JSON.stringify(fig.data))}, ${esc(JSON.stringify(fig.layout))}, {responsive: true});
</script></body></html>`;
}
