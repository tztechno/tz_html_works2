import { fromArrayBuffer } from 'https://cdn.jsdelivr.net/npm/geotiff@3.0.5/+esm';
import proj4 from 'https://cdn.jsdelivr.net/npm/proj4@2.22.0/+esm';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { THREE_BASE, createTerrainView, groundScale, mercToLonLat, contourInterval } from './viewer.js';

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

// ---------- DEM → regular Web Mercator grid ----------

const MERC = 'EPSG:3857';

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

  // mercator bounding box from densified edges
  const fwd = proj4(crs, MERC);
  let left = Infinity, right = -Infinity, bottom = Infinity, top = -Infinity;
  for (let k = 0; k <= 21; k++) {
    const t = k / 21;
    for (const p of [[x0 + t * (x1 - x0), y0], [x0 + t * (x1 - x0), y1], [x0, y0 + t * (y1 - y0)], [x1, y0 + t * (y1 - y0)]]) {
      const [x, y] = fwd.forward(p);
      left = Math.min(left, x); right = Math.max(right, x);
      bottom = Math.min(bottom, y); top = Math.max(top, y);
    }
  }
  const res = Math.max((right - left) / sw, Math.max(right - left, top - bottom) / maxDim);
  const w = Math.max(2, Math.ceil((right - left) / res - 1e-6)), h = Math.max(2, Math.ceil((top - bottom) / res - 1e-6));

  const inv = proj4(MERC, crs);
  const data = new Float32Array(w * h).fill(NaN);
  let min = Infinity, max = -Infinity;
  for (let j = 0; j < h; j++) {
    const my = top - (j + 0.5) * res;
    for (let i = 0; i < w; i++) {
      const [x, y] = inv.forward([left + (i + 0.5) * res, my]);
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
  return { data, w, h, left, top, res, min, max };
}

// ---------- imagery tiles → one canvas ----------

const HALF = 20037508.342789244, TILE = 256;
const IMAGERY = [
  {
    label: 'Esri World Imagery (global)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    attribution: 'Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  },
  {
    label: 'GSI Seamless Photo (Japan only)',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
    maxZoom: 18,
    attribution: '地理院タイル（全国最新写真（シームレス））',
  },
];

function tileRange(bbox, z) {
  const size = (2 * HALF) / 2 ** z, last = 2 ** z - 1;
  const c = (v) => Math.min(Math.max(v, 0), last);
  return {
    x0: c(Math.floor((bbox[0] + HALF) / size)), x1: c(Math.floor((bbox[2] + HALF) / size)),
    y0: c(Math.floor((HALF - bbox[3]) / size)), y1: c(Math.floor((HALF - bbox[1]) / size)),
  };
}

// deepest zoom that is no finer than needed and fits both the tile budget and the max texture size
function pickZoom(bbox, targetRes, maxZoom, maxTiles, maxTex) {
  let best = 0;
  for (let z = 0; z <= maxZoom; z++) {
    const { x0, x1, y0, y1 } = tileRange(bbox, z);
    const nx = x1 - x0 + 1, ny = y1 - y0 + 1;
    if (nx * ny > maxTiles || nx * TILE > maxTex || ny * TILE > maxTex) break;
    best = z;
    if ((2 * HALF) / (TILE * 2 ** z) <= targetRes) break;
  }
  return best;
}

const loadImage = (url) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });

async function fetchImagery(bbox, z, src) {
  const { x0, x1, y0, y1 } = tileRange(bbox, z);
  const canvas = document.createElement('canvas');
  canvas.width = (x1 - x0 + 1) * TILE;
  canvas.height = (y1 - y0 + 1) * TILE;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const jobs = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const url = src.url.replace('{z}', z).replace('{x}', x).replace('{y}', y);
      jobs.push(loadImage(url).then((img) => (img ? (ctx.drawImage(img, (x - x0) * TILE, (y - y0) * TILE, TILE, TILE), true) : false)));
    }
  }
  const ok = await Promise.all(jobs);
  const size = (2 * HALF) / 2 ** z;
  return {
    image: canvas,
    left: -HALF + x0 * size,
    top: HALF - y0 * size,
    res: size / TILE,
    zoom: z,
    total: ok.length,
    failed: ok.filter((v) => !v).length,
    attribution: src.attribution,
  };
}

const maxTextureSize = (() => {
  const gl = document.createElement('canvas').getContext('webgl2');
  return Math.min(8192, gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 4096);
})();

// ---------- UI ----------

const $ = (id) => document.getElementById(id);
const fileInput = $('file'), drop = $('drop'), dropText = $('dropText'), sourceSel = $('source');
const maxDim = $('maxDim'), vExag = $('vExag'), maxTiles = $('maxTiles'), surface = $('surface'), shading = $('shading');
const contours = $('contours'), walls = $('walls'), gridChk = $('grid');
const statusEl = $('status'), statsEl = $('stats'), plot = $('plot');
const pngBtn = $('png'), glbBtn = $('glb'), htmlBtn = $('download');

IMAGERY.forEach((s, i) => sourceSel.add(new Option(s.label, String(i))));
for (const [input, outId, fmt] of [
  [maxDim, 'maxDimOut', (v) => v],
  [vExag, 'vExagOut', (v) => `${v}×`],
  [maxTiles, 'maxTilesOut', (v) => v],
  [shading, 'shadingOut', (v) => `${Math.round(v * 100)}%`],
]) {
  const out = $(outId);
  const update = () => (out.value = fmt(input.value));
  input.addEventListener('input', update);
  update();
}

let buffer = null, baseName = 'terrain', dem = null, demKey = '', imagery = null, imgKey = '', view = null, runId = 0;

function setStatus(msg, cls = '') {
  statusEl.textContent = msg;
  statusEl.className = cls;
}

function showStats() {
  const k = groundScale(dem);
  const [lon, lat] = mercToLonLat(dem.left + (dem.w * dem.res) / 2, dem.top - (dem.h * dem.res) / 2);
  const rows = [
    ['Grid', `${dem.w} × ${dem.h} (≈ ${(dem.res * k).toFixed(1)} m)`],
    ['Area', `${((dem.w * dem.res * k) / 1000).toFixed(2)} × ${((dem.h * dem.res * k) / 1000).toFixed(2)} km`],
    ['Elevation', `${dem.min.toFixed(0)} – ${dem.max.toFixed(0)} m`],
    ['Contours', `every ${contourInterval(dem)} m (bold ×5)`],
    ['Imagery', `zoom ${imagery.zoom}, ${imagery.total} tiles, ${imagery.image.width}×${imagery.image.height} px`],
    ['Center', `${lat.toFixed(4)}, ${lon.toFixed(4)}`],
  ];
  statsEl.innerHTML = rows.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('');
}

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

function viewOpts() {
  return {
    exaggeration: Number(vExag.value),
    surface: surface.value,
    shading: Number(shading.value),
    contours: contours.checked,
    walls: walls.checked,
    grid: gridChk.checked,
  };
}

async function render() {
  if (!buffer) return;
  const id = ++runId;
  try {
    const dKey = `${baseName}|${buffer.byteLength}|${maxDim.value}`;
    const sameFile = demKey.startsWith(`${baseName}|${buffer.byteLength}|`);
    if (dKey !== demKey) {
      setStatus('Reading DEM...');
      await nextFrame();
      const d = await loadDem(buffer, Number(maxDim.value));
      if (id !== runId) return;
      dem = d;
      demKey = dKey;
    }
    const bbox = [dem.left, dem.top - dem.res * dem.h, dem.left + dem.res * dem.w, dem.top];
    const src = IMAGERY[Number(sourceSel.value)];
    // the photo is a texture, so it can be much finer than the mesh (limited by tiles / texture size)
    const z = pickZoom(bbox, dem.res / 16, src.maxZoom, Number(maxTiles.value), maxTextureSize);
    const iKey = `${demKey}|${sourceSel.value}|${z}`;
    if (iKey !== imgKey) {
      setStatus(`Fetching imagery (zoom ${z})...`);
      const im = await fetchImagery(bbox, z, src);
      if (id !== runId) return;
      imagery = im;
      imgKey = iKey;
    }
    setStatus('Building 3D mesh...');
    await nextFrame();
    const camera = view && sameFile ? view.getCamera() : undefined;
    view?.destroy();
    plot.querySelector('.placeholder')?.remove();
    view = createTerrainView(plot, dem, imagery, { ...viewOpts(), camera });
    showStats();
    pngBtn.disabled = glbBtn.disabled = htmlBtn.disabled = false;
    if (imagery.failed) setStatus(`${imagery.failed}/${imagery.total} tiles could not be fetched (shown in gray). GSI imagery only covers Japan.`, 'warn');
    else setStatus('');
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
  demKey = imgKey = '';
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

for (const el of [maxDim, maxTiles, sourceSel]) el.addEventListener('change', render);
vExag.addEventListener('input', () => view?.setExaggeration(Number(vExag.value)));
surface.addEventListener('change', () => view?.setSurface(surface.value));
shading.addEventListener('input', () => view?.setShading(Number(shading.value)));
contours.addEventListener('change', () => view?.setContours(contours.checked));
walls.addEventListener('change', () => view?.setWalls(walls.checked));
gridChk.addEventListener('change', () => view?.setGrid(gridChk.checked));

function download(href, filename) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.click();
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  download(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

pngBtn.addEventListener('click', () => view && download(view.snapshot(), `${baseName}_3d.png`));

glbBtn.addEventListener('click', async () => {
  if (!view) return;
  setStatus('Exporting GLB...');
  const glb = await new GLTFExporter().parseAsync(view.exportMesh(), { binary: true });
  downloadBlob(new Blob([glb], { type: 'model/gltf-binary' }), `${baseName}_3d.glb`);
  setStatus('');
});

function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

htmlBtn.addEventListener('click', async () => {
  if (!view) return;
  setStatus('Building standalone HTML...');
  const viewerSrc = (await (await fetch(new URL('./viewer.js', import.meta.url))).text()).replace(/<\/script/gi, '<\\/script');
  const { data, ...demMeta } = dem;
  const { image, ...imgMeta } = imagery;
  const opts = { ...view.opts, camera: view.getCamera() };
  const title = `${baseName} 3D`.replace(/</g, '&lt;');
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>
<script type="importmap">{"imports":{"three":"${THREE_BASE}build/three.module.js","three/addons/":"${THREE_BASE}examples/jsm/"}}<\/script>
<style>html,body{margin:0;height:100%;background:#111}#v{position:relative;width:100%;height:100%;overflow:hidden}</style></head>
<body><div id="v"></div><script type="module">
${viewerSrc}
const demMeta = ${JSON.stringify(demMeta)};
const imgMeta = ${JSON.stringify(imgMeta)};
const bytes = Uint8Array.from(atob("${toBase64(new Uint8Array(data.buffer))}"), (c) => c.charCodeAt(0));
const img = new Image();
img.onload = () => createTerrainView(document.getElementById("v"), { ...demMeta, data: new Float32Array(bytes.buffer) }, { ...imgMeta, image: img }, ${JSON.stringify(opts)});
img.src = "${image.toDataURL('image/jpeg', 0.88)}";
<\/script></body></html>`;
  downloadBlob(new Blob([html], { type: 'text/html' }), `${baseName}_3d.html`);
  setStatus('');
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
