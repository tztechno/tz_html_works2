// Cesium scene for a DEM grid on WGS84 lon/lat.
// No imports: this file relies on the global `Cesium` so it can be inlined into the exported standalone HTML.

export const CESIUM_BASE = 'https://cdn.jsdelivr.net/npm/cesium@1.146.0/Build/Cesium/';

export const IMAGERY = [
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

// dem: { data: Float32Array (row-major, north row first, NaN = nodata), w, h, west, south, east, north (degrees), min, max }
// Samples are at cell centers. `margin` (in cells) extends the edge values outward so terrain tiles meet the DEM border cleanly.
export function sampleDem(dem, lon, lat, margin = 0) {
  const { w, h, data } = dem;
  let fx = ((lon - dem.west) / (dem.east - dem.west)) * w - 0.5;
  let fy = ((dem.north - lat) / (dem.north - dem.south)) * h - 0.5;
  if (fx < -0.5 - margin || fy < -0.5 - margin || fx > w - 0.5 + margin || fy > h - 0.5 + margin) return null;
  fx = Math.min(Math.max(fx, 0), w - 1);
  fy = Math.min(Math.max(fy, 0), h - 1);
  const x0 = Math.min(Math.floor(fx), w - 2), y0 = Math.min(Math.floor(fy), h - 2);
  const tx = fx - x0, ty = fy - y0, i = y0 * w + x0;
  const a = data[i], b = data[i + 1], c = data[i + w], d = data[i + w + 1];
  if (a === a && b === b && c === c && d === d) return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  const n = data[Math.round(fy) * w + Math.round(fx)];
  return Number.isNaN(n) ? null : n;
}

function demTerrain(dem) {
  const size = 65;
  const tiling = new Cesium.GeographicTilingScheme();
  const toDeg = Cesium.Math.toDegrees;
  const margin = 2;
  const cellLon = (dem.east - dem.west) / dem.w, cellLat = (dem.north - dem.south) / dem.h;
  return new Cesium.CustomHeightmapTerrainProvider({
    width: size,
    height: size,
    tilingScheme: tiling,
    callback(x, y, level) {
      const heights = new Float32Array(size * size);
      const r = tiling.tileXYToRectangle(x, y, level);
      const west = toDeg(r.west), east = toDeg(r.east), south = toDeg(r.south), north = toDeg(r.north);
      if (east < dem.west - margin * cellLon || west > dem.east + margin * cellLon ||
          north < dem.south - margin * cellLat || south > dem.north + margin * cellLat) return heights;
      for (let j = 0; j < size; j++) {
        const lat = north - ((north - south) * j) / (size - 1);
        for (let i = 0; i < size; i++) {
          const lon = west + ((east - west) * i) / (size - 1);
          heights[j * size + i] = sampleDem(dem, lon, lat, margin) ?? 0;
        }
      }
      return heights;
    },
  });
}

const METERS_PER_DEG = 111320;

export function demSizeMeters(dem) {
  const cosLat = Math.cos(Cesium.Math.toRadians((dem.south + dem.north) / 2));
  return { x: (dem.east - dem.west) * METERS_PER_DEG * cosLat, y: (dem.north - dem.south) * METERS_PER_DEG };
}

// opts: { imagery, exaggeration, detail, clip, outline, camera?, onImageryError?(failedCount) }
export function createTerrainView(container, dem, opts) {
  const viewer = new Cesium.Viewer(container, {
    baseLayer: false,
    terrainProvider: demTerrain(dem),
    animation: false,
    timeline: false,
    geocoder: false,
    baseLayerPicker: false,
    infoBox: false,
    selectionIndicator: false,
    navigationInstructionsInitiallyVisible: false,
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
  });
  const { scene, camera } = viewer;
  const globe = scene.globe;
  globe.baseColor = Cesium.Color.fromCssColorString('#2a2a2e');
  globe.depthTestAgainstTerrain = true;
  scene.backgroundColor = Cesium.Color.fromCssColorString('#111');
  scene.verticalExaggerationRelativeHeight = dem.min;

  const readout = document.createElement('div');
  readout.style.cssText = 'position:absolute;left:8px;top:8px;padding:4px 8px;border-radius:4px;background:rgba(0,0,0,.6);' +
    'color:#e6e6e6;font:12px/1.4 system-ui,sans-serif;font-variant-numeric:tabular-nums;pointer-events:none;display:none;z-index:1';
  container.appendChild(readout);

  let outlineEntity = null;
  const rect = Cesium.Rectangle.fromDegrees(dem.west, dem.south, dem.east, dem.north);

  const ctl = {
    viewer,
    dem,
    opts: { ...opts },

    setImagery(idx) {
      ctl.opts.imagery = idx;
      const src = IMAGERY[idx];
      const provider = new Cesium.UrlTemplateImageryProvider({
        url: src.url,
        maximumLevel: src.maxZoom,
        credit: new Cesium.Credit(src.attribution),
      });
      let failed = 0;
      provider.errorEvent.addEventListener(() => opts.onImageryError?.(++failed));
      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(provider);
      opts.onImageryError?.(0);
      scene.requestRender();
    },

    setExaggeration(v) {
      ctl.opts.exaggeration = v;
      scene.verticalExaggeration = v;
      if (ctl.opts.outline) ctl.setOutline(true);
      scene.requestRender();
    },

    // detail 1 = Cesium default (max screen-space error 2); higher = sharper, slower
    setDetail(v) {
      ctl.opts.detail = v;
      globe.maximumScreenSpaceError = 2 / v;
      scene.requestRender();
    },

    setClip(on) {
      ctl.opts.clip = on;
      globe.cartographicLimitRectangle = on ? rect : Cesium.Rectangle.MAX_VALUE;
      // hide atmosphere/fog so the area outside the DEM shows the plain background
      globe.showGroundAtmosphere = !on;
      globe.undergroundColor = on ? scene.backgroundColor : Cesium.Color.BLACK;
      scene.skyAtmosphere.show = !on;
      scene.fog.enabled = !on;
      scene.requestRender();
    },

    // drawn at the exaggerated DEM height (ground-clamped polylines ignore vertical exaggeration)
    setOutline(on) {
      ctl.opts.outline = on;
      if (outlineEntity) viewer.entities.remove(outlineEntity);
      outlineEntity = null;
      if (on) {
        const ex = scene.verticalExaggeration, n = 200, pts = [];
        const add = (lon, lat) => {
          const z = sampleDem(dem, lon, lat) ?? 0;
          pts.push(lon, lat, dem.min + (z - dem.min) * ex + 3);
        };
        const inLon = (dem.east - dem.west) / dem.w / 2, inLat = (dem.north - dem.south) / dem.h / 2;
        const w = dem.west + inLon, e = dem.east - inLon, s = dem.south + inLat, nn = dem.north - inLat;
        for (let i = 0; i <= n; i++) add(w + ((e - w) * i) / n, nn);
        for (let i = 1; i <= n; i++) add(e, nn - ((nn - s) * i) / n);
        for (let i = 1; i <= n; i++) add(e - ((e - w) * i) / n, s);
        for (let i = 1; i <= n; i++) add(w, s + ((nn - s) * i) / n);
        outlineEntity = viewer.entities.add({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(pts),
            width: 2,
            material: Cesium.Color.fromCssColorString('#4da3ff'),
          },
        });
      }
      scene.requestRender();
    },

    resetView(duration = 0) {
      const size = demSizeMeters(dem);
      const span = Math.max(size.x, size.y);
      const ex = scene.verticalExaggeration;
      const midH = dem.min + ((dem.min + dem.max) / 2 - dem.min) * ex;
      const center = Cesium.Cartesian3.fromDegrees((dem.west + dem.east) / 2, (dem.south + dem.north) / 2, midH);
      camera.flyToBoundingSphere(new Cesium.BoundingSphere(center, span / 2), {
        offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(-45), Cesium.Math.toRadians(-35), span * 1.25),
        duration,
      });
      scene.requestRender();
    },

    getCamera() {
      const p = camera.positionWC;
      return { position: [p.x, p.y, p.z], heading: camera.heading, pitch: camera.pitch, roll: camera.roll };
    },

    setCamera(c) {
      camera.setView({
        destination: new Cesium.Cartesian3(...c.position),
        orientation: { heading: c.heading, pitch: c.pitch, roll: c.roll },
      });
      scene.requestRender();
    },

    snapshot() {
      viewer.render();
      return scene.canvas.toDataURL('image/png');
    },

    destroy() {
      viewer.destroy();
      readout.remove();
    },
  };

  ctl.setImagery(opts.imagery ?? 0);
  ctl.setExaggeration(opts.exaggeration ?? 1.5);
  ctl.setDetail(opts.detail ?? 1);
  ctl.setClip(opts.clip ?? true);
  ctl.setOutline(opts.outline ?? false);
  if (opts.camera) ctl.setCamera(opts.camera);
  else ctl.resetView();

  viewer.homeButton.viewModel.command.beforeExecute.addEventListener((e) => {
    e.cancel = true;
    ctl.resetView(1);
  });
  const handler = viewer.screenSpaceEventHandler;
  handler.setInputAction(() => ctl.resetView(1), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

  let pending = null;
  handler.setInputAction((m) => {
    pending = m.endPosition;
    requestAnimationFrame(() => {
      if (!pending) return;
      const ray = camera.getPickRay(pending);
      pending = null;
      const hit = ray && globe.pick(ray, scene);
      if (!hit) return void (readout.style.display = 'none');
      const c = Cesium.Cartographic.fromCartesian(hit);
      const lon = Cesium.Math.toDegrees(c.longitude), lat = Cesium.Math.toDegrees(c.latitude);
      const z = sampleDem(dem, lon, lat);
      readout.textContent = `${lat.toFixed(5)}, ${lon.toFixed(5)}` + (z === null ? '' : `  ·  Elev ${z.toFixed(1)} m`);
      readout.style.display = 'block';
    });
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  return ctl;
}
