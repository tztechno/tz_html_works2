import { fromArrayBuffer } from 'https://cdn.jsdelivr.net/npm/geotiff@3.0.5/+esm';
import proj4 from 'https://cdn.jsdelivr.net/npm/proj4@2.22.0/+esm';
import { CESIUM_BASE, IMAGERY, createTerrainView, demSizeMeters } from './viewer.js';

// ---------- CRS ----------

// Japan Plane Rectangular CS zones I–XIX: [lat_0, lon_0]
const JPRCS = [
  [33, 129.5], [33, 131], [36, 132 + 1 / 6], [33, 133.5], [36, 134 + 1 / 3], [36, 136], [36, 137 + 1 / 6],
  [36, 138.5], [36, 139 + 5 / 6], [40, 140 + 5 / 6], [44, 140.25], [44, 142.25], [44, 144.25], [26, 142],
  [26, 127.5], [26, 124], [26, 131], [20, 136], [26, 154],
];

function builtinProj4(code) {
  if (code === 6668 || code === 4612) return '+proj=longlat +ellps=GRS80 +no_defs';
  if (code === 4269) return '+proj=longlat +datum=NAD83 +no_defs';
  const jp = (zone) => {
    const [lat0, lon0] = JPRCS[zone];
    return `+proj=tmerc +lat_0=${lat0} +lon_0=${lon0} +k=0.9999 +x_0=0 +y_0=0 +ellps=GRS80 +units=m +no_defs`;
  };
  if (code >= 6669 && code <= 6687) return jp(code - 6669);
  if (code >= 2443 && code <= 2461) return jp(code - 2443);
  if (code >= 6688 && code <= 6692) return `+proj=utm +zone=${code - 6637} +ellps=GRS80 +units=m +no_defs`;
  if (code >= 32601 && code <= 32660) return `+proj=utm +zone=${code - 32600} +datum=WGS84 +units=m +no_defs`;
  if (code >= 32701 && code <= 32760) return `+proj=utm +zone=${code - 32700} +south +datum=WGS84 +units=m +no_defs`;
  if (code >= 26901 && code <= 26923) return `+proj=utm +zone=${code - 26900} +datum=NAD83 +units=m +no_defs`;
  return null;
}

async function resolveCrs(code) {
  const name = `EPSG:${code}`;
  if (proj4.defs(name)) return name;
  let def = builtinProj4(code);
  if (!def) {
    try {
      const res = await fetch(`https://epsg.io/${code}.proj4`);
      if (res.ok) def = (await res.text()).trim();
    } catch {}
  }
  if (!def) throw new Error(`Unknown CRS ${name} (not built in and epsg.io lookup failed).`);
  proj4.defs(name, def);
  return name;
}

function epsgOf(geoKeys) {
  const code = geoKeys.ProjectedCSTypeGeoKey ?? geoKeys.GeographicTypeGeoKey;
  if (!code) throw new Error('This GeoTIFF has no CRS, so it cannot be located on the map.');
  if (code === 32767) throw new Error('User-defined CRS is not supported. Please re-save with an EPSG code.');
  return code;
}

// ---------- DEM → regular WGS84 lon/lat grid ----------

async function loadDem(buffer, maxDim) {
  const img = await (await fromArrayBuffer(buffer)).getImage();
  const crs = await resolveCrs(epsgOf(img.getGeoKeys()));
  const [x0, y0, x1, y1] = img.getBoundingBox();
  const nd = img.getGDALNoData();
  const nodata = nd === null ? null : Number(nd);
  const W = img.getWidth(), H = img.getHeight();
  const s = Math.min(1, (2 * maxDim) / Math.max(W, H));
  const sw = Math.max(2, Math.round(W * s)), sh = Math.max(2, Math.round(H * s));
  const [src] = await img.readRasters({ samples: [0], width: sw, height: sh, resampleMethod: 'nearest' });
  const px = (x1 - x0) / sw, py = (y1 - y0) / sh;
  const valid = (v) => Number.isFinite(v) && v !== nodata && v > -12000;

  // lon/lat bounding box from densified edges
  const fwd = proj4(crs, 'EPSG:4326');
  let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
  for (let k = 0; k <= 21; k++) {
    const t = k / 21;
    for (const p of [[x0 + t * (x1 - x0), y0], [x0 + t * (x1 - x0), y1], [x0, y0 + t * (y1 - y0)], [x1, y0 + t * (y1 - y0)]]) {
      const [lon, lat] = fwd.forward(p);
      west = Math.min(west, lon); east = Math.max(east, lon);
      south = Math.min(south, lat); north = Math.max(north, lat);
    }
  }

  // target grid: roughly square cells in meters, at native resolution capped by maxDim
  const cosLat = Math.cos(((south + north) / 2) * (Math.PI / 180));
  const spanX = (east - west) * 111320 * cosLat, spanY = (north - south) * 111320;
  const res = Math.max(spanX / sw, Math.max(spanX, spanY) / maxDim);
  const w = Math.max(2, Math.ceil(spanX / res - 1e-6)), h = Math.max(2, Math.ceil(spanY / res - 1e-6));
  const dLon = (east - west) / w, dLat = (north - south) / h;

  const inv = proj4('EPSG:4326', crs);
  const data = new Float32Array(w * h).fill(NaN);
  let min = Infinity, max = -Infinity;
  for (let j = 0; j < h; j++) {
    const lat = north - (j + 0.5) * dLat;
    for (let i = 0; i < w; i++) {
      const [x, y] = inv.forward([west + (i + 0.5) * dLon, lat]);
      const fx = (x - x0) / px - 0.5, fy = (y1 - y) / py - 0.5;
      if (fx < -0.5 || fy < -0.5 || fx > sw - 0.5 || fy > sh - 0.5) continue;
      const cx = Math.max(0, Math.min(sw - 2, Math.floor(fx))), cy = Math.max(0, Math.min(sh - 2, Math.floor(fy)));
      const tx = Math.min(1, Math.max(0, fx - cx)), ty = Math.min(1, Math.max(0, fy - cy));
      const a = src[cy * sw + cx], b = src[cy * sw + cx + 1], c = src[(cy + 1) * sw + cx], d = src[(cy + 1) * sw + cx + 1];
      let z;
      if (valid(a) && valid(b) && valid(c) && valid(d)) z = (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
      else {
        const n = src[Math.round(fy) * sw + Math.round(fx)];
        if (!valid(n)) continue;
        z = n;
      }
      data[j * w + i] = z;
      if (z < min) min = z;
      if (z > max) max = z;
    }
  }
  if (!Number.isFinite(min)) throw new Error('The DEM contains no valid elevation values.');
  return { data, w, h, west, south, east, north, min, max };
}

// ---------- UI ----------

const $ = (id) => document.getElementById(id);
const fileInput = $('file'), drop = $('drop'), dropText = $('dropText'), sourceSel = $('source');
const maxDim = $('maxDim'), vExag = $('vExag'), detail = $('detail'), clip = $('clip'), outline = $('outline');
const statusEl = $('status'), statsEl = $('stats'), downloadBtn = $('download'), pngBtn = $('png'), plot = $('plot');

IMAGERY.forEach((s, i) => sourceSel.add(new Option(s.label, String(i))));
for (const [input, outId, fmt] of [[maxDim, 'maxDimOut', (v) => v], [vExag, 'vExagOut', (v) => `${v}×`], [detail, 'detailOut', (v) => `${v}×`]]) {
  const out = $(outId);
  const update = () => (out.value = fmt(input.value));
  input.addEventListener('input', update);
  update();
}

let buffer = null, baseName = 'terrain', dem = null, demKey = '', view = null, runId = 0;

function setStatus(msg, cls = '') {
  statusEl.textContent = msg;
  statusEl.className = cls;
}

function showStats(d) {
  const size = demSizeMeters(d);
  const rows = [
    ['Grid', `${d.w} × ${d.h}`],
    ['Cell', `≈ ${(size.x / d.w).toFixed(1)} m`],
    ['Area', `${(size.x / 1000).toFixed(2)} × ${(size.y / 1000).toFixed(2)} km`],
    ['Elevation', `${d.min.toFixed(0)} – ${d.max.toFixed(0)} m`],
    ['Center', `${((d.south + d.north) / 2).toFixed(4)}, ${((d.west + d.east) / 2).toFixed(4)}`],
  ];
  statsEl.innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
}

function onImageryError(failed) {
  if (failed) setStatus(`${failed} imagery tile request(s) failed (shown in gray). GSI imagery only covers Japan.`, 'warn');
  else if (statusEl.className === 'warn') setStatus('');
}

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

async function render() {
  if (!buffer) return;
  const id = ++runId;
  try {
    const key = `${baseName}|${buffer.byteLength}|${maxDim.value}`;
    if (key === demKey && view) return;
    setStatus('Reading DEM...');
    await nextFrame();
    const d = await loadDem(buffer, Number(maxDim.value));
    if (id !== runId) return;
    // keep the camera when only the resolution changed
    const camera = view && demKey.startsWith(`${baseName}|${buffer.byteLength}|`) ? view.getCamera() : undefined;
    view?.destroy();
    plot.querySelector('.placeholder')?.remove();
    dem = d;
    demKey = key;
    view = createTerrainView(plot, dem, {
      imagery: Number(sourceSel.value),
      exaggeration: Number(vExag.value),
      detail: Number(detail.value),
      clip: clip.checked,
      outline: outline.checked,
      camera,
      onImageryError,
    });
    showStats(dem);
    downloadBtn.disabled = pngBtn.disabled = false;
    setStatus('');
  } catch (e) {
    if (id !== runId) return;
    console.error(e);
    setStatus(`Error: ${e.message}`, 'err');
  }
}

async function loadBuffer(name, buf) {
  baseName = name.replace(/\.[^.]+$/, '');
  dropText.textContent = name;
  buffer = buf;
  demKey = '';
  await render();
}

fileInput.addEventListener('change', async () => {
  const f = fileInput.files?.[0];
  if (f) await loadBuffer(f.name, await f.arrayBuffer());
});
for (const el of [drop, document.body]) {
  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('over');
  });
  el.addEventListener('dragleave', () => drop.classList.remove('over'));
  el.addEventListener('drop', async (e) => {
    e.preventDefault();
    drop.classList.remove('over');
    const f = e.dataTransfer?.files[0];
    if (f) await loadBuffer(f.name, await f.arrayBuffer());
  });
}

maxDim.addEventListener('change', render);
sourceSel.addEventListener('change', () => view?.setImagery(Number(sourceSel.value)));
vExag.addEventListener('input', () => view?.setExaggeration(Number(vExag.value)));
detail.addEventListener('input', () => view?.setDetail(Number(detail.value)));
clip.addEventListener('change', () => view?.setClip(clip.checked));
outline.addEventListener('change', () => view?.setOutline(outline.checked));

function download(href, filename) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.click();
}

pngBtn.addEventListener('click', () => view && download(view.snapshot(), `${baseName}_3d.png`));

function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

downloadBtn.addEventListener('click', async () => {
  if (!view) return;
  const viewerSrc = (await (await fetch(new URL('./viewer.js', import.meta.url))).text()).replace(/<\/script/gi, '<\\/script');
  const { data, ...meta } = dem;
  const { onImageryError: _, ...opts } = view.opts;
  opts.camera = view.getCamera();
  const title = `${baseName} 3D`.replace(/</g, '&lt;');
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>
<link rel="stylesheet" href="${CESIUM_BASE}Widgets/widgets.css">
<script src="${CESIUM_BASE}Cesium.js"><\/script>
<style>html,body{margin:0;height:100%;background:#111}#v{position:relative;width:100%;height:100%}</style></head>
<body><div id="v"></div><script type="module">
${viewerSrc}
const meta = ${JSON.stringify(meta)};
const bytes = Uint8Array.from(atob("${toBase64(new Uint8Array(data.buffer))}"), (c) => c.charCodeAt(0));
createTerrainView(document.getElementById("v"), { ...meta, data: new Float32Array(bytes.buffer) }, ${JSON.stringify(opts)});
<\/script></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  download(url, `${baseName}_3d.html`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// ?dem=<url> loads a GeoTIFF from a URL (CORS must allow it)
const demUrl = new URLSearchParams(location.search).get('dem');
if (demUrl) {
  setStatus('Downloading DEM...');
  fetch(demUrl)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.arrayBuffer();
    })
    .then((buf) => loadBuffer(decodeURIComponent(demUrl.split('/').pop().split('?')[0]), buf))
    .catch((e) => setStatus(`Error loading ${demUrl}: ${e.message}`, 'err'));
}
