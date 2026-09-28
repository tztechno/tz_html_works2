import Plotly from "plotly.js-dist-min";
import proj4 from "proj4";
import "./style.css";
import { loadDem, WEB_MERCATOR, type Dem } from "./dem";
import { aspect, axisStyle, buildFigure, toStandaloneHtml, type Figure } from "./mesh";
import { chooseZoom, demBounds, drape, fetchMosaic, TILE_SOURCES, type Mosaic } from "./tiles";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const fileInput = $<HTMLInputElement>("file");
const drop = $<HTMLLabelElement>("drop");
const dropText = $<HTMLSpanElement>("dropText");
const sourceSel = $<HTMLSelectElement>("source");
const maxDimIn = $<HTMLInputElement>("maxDim");
const vExagIn = $<HTMLInputElement>("vExag");
const maxTilesIn = $<HTMLInputElement>("maxTiles");
const axesIn = $<HTMLInputElement>("axes");
const statusEl = $<HTMLDivElement>("status");
const statsEl = $<HTMLDListElement>("stats");
const downloadBtn = $<HTMLButtonElement>("download");
const plotEl = $<HTMLElement>("plot");

TILE_SOURCES.forEach((s, i) => sourceSel.add(new Option(s.label, String(i))));

// Show slider values next to their labels
for (const [inp, out] of [[maxDimIn, "maxDimOut"], [vExagIn, "vExagOut"], [maxTilesIn, "maxTilesOut"]] as const) {
  const o = $<HTMLOutputElement>(out);
  const sync = () => (o.value = inp.value);
  inp.addEventListener("input", sync);
  sync();
}

// App state and small caches so slider changes don't refetch unnecessarily
let fileBuf: ArrayBuffer | null = null;
let fileName = "terrain";
let dem: Dem | null = null;
let demKey = "";
let mosaic: Mosaic | null = null;
let mosaicKey = "";
let figure: Figure | null = null;
let runId = 0;

function setStatus(msg: string, kind: "" | "warn" | "err" = "") {
  statusEl.textContent = msg;
  statusEl.className = kind;
}

function renderStats(d: Dem, m: Mosaic) {
  const inv = proj4(WEB_MERCATOR, "EPSG:4326");
  const [lon, lat] = inv.forward([d.left + (d.w * d.res) / 2, d.top - (d.h * d.res) / 2]);
  const rows: [string, string][] = [
    ["Grid", `${d.w} × ${d.h}`],
    ["Elevation", `${d.min.toFixed(0)} – ${d.max.toFixed(0)} m`],
    ["Imagery", `zoom ${m.zoom} (${m.total} tiles)`],
    ["Center", `${lat.toFixed(4)}, ${lon.toFixed(4)}`],
  ];
  statsEl.innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
}

// Yield to the browser so status text repaints before heavy synchronous work
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

async function run() {
  if (!fileBuf) return;
  const id = ++runId;
  const src = TILE_SOURCES[Number(sourceSel.value)];
  const maxDim = Number(maxDimIn.value);

  try {
    const dk = `${fileName}|${fileBuf.byteLength}|${maxDim}`;
    if (dk !== demKey) {
      setStatus("Reading DEM...");
      await nextFrame();
      dem = await loadDem(fileBuf, maxDim);
      demKey = dk;
      mosaicKey = "";
    }
    if (id !== runId || !dem) return;

    const b = demBounds(dem);
    const z = chooseZoom(b, dem.res / 2, src.maxZoom, Number(maxTilesIn.value));
    const mk = `${demKey}|${sourceSel.value}|${z}`;
    if (mk !== mosaicKey) {
      setStatus(`Fetching imagery (zoom ${z})...`);
      mosaic = await fetchMosaic(b, z, src);
      mosaicKey = mk;
    }
    if (id !== runId || !mosaic) return;

    setStatus("Building 3D mesh...");
    await nextFrame();
    const rgba = drape(mosaic, dem);
    figure = buildFigure(dem, rgba, Number(vExagIn.value), axesIn.checked, src.attribution);
    plotEl.querySelector(".placeholder")?.remove();
    await Plotly.react(plotEl, figure.data, figure.layout, { responsive: true, displaylogo: false });

    renderStats(dem, mosaic);
    downloadBtn.disabled = false;
    if (mosaic.failed) {
      setStatus(`${mosaic.failed}/${mosaic.total} tiles could not be fetched (shown in gray). GSI imagery only covers Japan.`, "warn");
    } else {
      setStatus("");
    }
  } catch (e) {
    if (id !== runId) return;
    console.error(e);
    setStatus(`Error: ${(e as Error).message}`, "err");
  }
}

async function loadFile(f: File) {
  fileName = f.name.replace(/\.[^.]+$/, "");
  dropText.textContent = f.name;
  fileBuf = await f.arrayBuffer();
  demKey = "";
  await run();
}

// File input + drag and drop
fileInput.addEventListener("change", () => fileInput.files?.[0] && loadFile(fileInput.files[0]));
for (const t of [drop, document.body]) {
  t.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
  t.addEventListener("dragleave", () => drop.classList.remove("over"));
  t.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("over");
    const f = (e as DragEvent).dataTransfer?.files[0];
    if (f) loadFile(f);
  });
}

// Controls that need a full rebuild
for (const el of [sourceSel, maxDimIn, maxTilesIn]) el.addEventListener("change", run);

// Controls that only need a relayout (cheap)
vExagIn.addEventListener("input", () => {
  if (!dem || !figure) return;
  const ar = aspect(dem, Number(vExagIn.value));
  (figure.layout.scene as Record<string, unknown>).aspectratio = ar;
  Plotly.relayout(plotEl, { "scene.aspectratio": ar });
});
axesIn.addEventListener("change", () => {
  if (!figure) return;
  const upd: Record<string, unknown> = {};
  const scene = figure.layout.scene as Record<string, Record<string, unknown>>;
  for (const a of ["xaxis", "yaxis", "zaxis"]) {
    upd[`scene.${a}.visible`] = axesIn.checked;
    Object.assign(scene[a], axisStyle(axesIn.checked));
  }
  Plotly.relayout(plotEl, upd);
});

downloadBtn.addEventListener("click", () => {
  if (!figure) return;
  // Keep the current camera angle in the exported file
  const cam = (plotEl as unknown as { _fullLayout?: { scene?: { camera?: unknown } } })._fullLayout?.scene?.camera;
  const layout = structuredClone(figure.layout) as Record<string, Record<string, unknown>>;
  if (cam) layout.scene.camera = structuredClone(cam);
  const html = toStandaloneHtml({ data: figure.data, layout }, `${fileName} 3D`);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  a.download = `${fileName}_3d.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
