// three.js scene for a DEM grid on Web Mercator (EPSG:3857) with a draped imagery texture.
// Imports resolve through the page's import map, so this file can also be inlined into the exported standalone HTML.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const THREE_BASE = 'https://cdn.jsdelivr.net/npm/three@0.186.1/';
export const R_EARTH = 6378137;

// Mercator scale at the DEM center: multiply mercator meters by this to get ground meters.
export function groundScale(dem) {
  const y = dem.top - (dem.res * dem.h) / 2;
  return Math.cos(2 * Math.atan(Math.exp(y / R_EARTH)) - Math.PI / 2);
}

export function mercToLonLat(x, y) {
  return [(x / R_EARTH) * (180 / Math.PI), (2 * Math.atan(Math.exp(y / R_EARTH)) - Math.PI / 2) * (180 / Math.PI)];
}

export function contourInterval(dem) {
  const raw = (dem.max - dem.min) / 20;
  const p = 10 ** Math.floor(Math.log10(Math.max(raw, 1e-6)));
  return [1, 2, 5, 10].map((m) => m * p).find((v) => v >= raw);
}

const vertexShader = /* glsl */ `
  attribute float elev;
  uniform float exag;
  varying float vElev;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vElev = elev;
    vUv = uv;
    // the mesh is only scaled in y, so the inverse-transpose is diag(1, 1/exag, 1)
    vNormal = normalize(vec3(normal.x, normal.y / exag, normal.z));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform int mode;          // 0 photo, 1 elevation colors, 2 hillshade
  uniform float shading;     // 0..1
  uniform vec3 lightDir;
  uniform float elevMin, elevMax;
  uniform float contour;     // interval in m, 0 = off
  varying float vElev;
  varying vec2 vUv;
  varying vec3 vNormal;

  vec3 ramp(float t) {
    vec3 c0 = vec3(0.16, 0.42, 0.33), c1 = vec3(0.55, 0.70, 0.38), c2 = vec3(0.89, 0.82, 0.55),
         c3 = vec3(0.70, 0.50, 0.34), c4 = vec3(0.96, 0.96, 0.96);
    t = clamp(t, 0.0, 1.0) * 4.0;
    if (t < 1.0) return mix(c0, c1, t);
    if (t < 2.0) return mix(c1, c2, t - 1.0);
    if (t < 3.0) return mix(c2, c3, t - 2.0);
    return mix(c3, c4, t - 3.0);
  }

  void main() {
    vec3 n = normalize(vNormal);
    float lambert = max(dot(n, lightDir), 0.0);
    vec3 color;
    float s = shading;
    if (mode == 0) color = texture2D(map, vUv).rgb;
    else if (mode == 1) color = ramp((vElev - elevMin) / max(elevMax - elevMin, 1e-6));
    else { color = vec3(0.78); s = 1.0; }
    // normalized so flat ground keeps its color; slopes facing the light brighten, slopes facing away darken
    float shade = clamp(0.45 + 0.55 * lambert / lightDir.y, 0.0, 1.25);
    color *= mix(1.0, shade, s);
    float f = vElev / contour;
    float w = fwidth(f);
    // skip perfectly flat areas (e.g. sea at exactly 0 m), which would otherwise be filled by a contour
    if (contour > 0.0 && w > 1e-5) {
      float line = 1.0 - smoothstep(0.0, w * 1.2, abs(fract(f - 0.5) - 0.5));
      float index = 1.0 - smoothstep(0.0, w * 2.2, abs(fract(f / 5.0 - 0.5) - 0.5) * 5.0);
      color = mix(color, vec3(0.08), max(line * 0.55, index * 0.85));
    }
    gl_FragColor = vec4(color, 1.0);
  }
`;

// dem: { data: Float32Array (row-major, north row first, NaN = nodata), w, h, left, top, res (EPSG:3857 m), min, max }
// imagery: { image (canvas | img), left, top, res (EPSG:3857 m per pixel), attribution }
// opts: { exaggeration, surface, shading, contours, walls, grid, camera? }
export function createTerrainView(container, dem, imagery, opts) {
  const { w, h, data } = dem;
  const k = groundScale(dem);
  const cell = dem.res * k; // ground meters per DEM cell
  const span = Math.max(w, h) * cell;
  const valid = (i) => !Number.isNaN(data[i]);

  // ---------- terrain geometry ----------
  const pos = new Float32Array(w * h * 3), uv = new Float32Array(w * h * 2), elev = new Float32Array(w * h);
  const imgW = imagery.image.width * imagery.res, imgH = imagery.image.height * imagery.res;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const p = j * w + i;
      const z = valid(p) ? data[p] : dem.min;
      pos[p * 3] = (i - (w - 1) / 2) * cell;
      pos[p * 3 + 1] = z - dem.min;
      pos[p * 3 + 2] = (j - (h - 1) / 2) * cell; // +z = south
      elev[p] = z;
      const mx = dem.left + (i + 0.5) * dem.res, my = dem.top - (j + 0.5) * dem.res;
      uv[p * 2] = (mx - imagery.left) / imgW;
      uv[p * 2 + 1] = 1 - (imagery.top - my) / imgH;
    }
  }
  const index = [];
  for (let j = 0; j < h - 1; j++) {
    for (let i = 0; i < w - 1; i++) {
      const a = j * w + i, b = a + 1, c = a + w, d = c + 1;
      if (valid(a) && valid(c) && valid(b)) index.push(a, c, b);
      if (valid(b) && valid(c) && valid(d)) index.push(b, c, d);
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geom.setAttribute('elev', new THREE.BufferAttribute(elev, 1));
  geom.setIndex(index);
  geom.computeVertexNormals();

  const texture = new THREE.CanvasTexture(imagery.image);
  texture.colorSpace = THREE.NoColorSpace; // shader works in sRGB directly
  texture.anisotropy = 8;

  const az = THREE.MathUtils.degToRad(315), alt = THREE.MathUtils.degToRad(45); // light from the NW, as in a hillshade
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
      map: { value: texture },
      mode: { value: 0 },
      shading: { value: 0.4 },
      exag: { value: 1 },
      lightDir: { value: new THREE.Vector3(Math.sin(az) * Math.cos(alt), Math.sin(alt), -Math.cos(az) * Math.cos(alt)).normalize() },
      elevMin: { value: dem.min },
      elevMax: { value: dem.max },
      contour: { value: 0 },
    },
  });
  const terrain = new THREE.Mesh(geom, material);

  // ---------- base walls (diorama look) ----------
  const baseDepth = Math.max((dem.max - dem.min) * 0.15, span * 0.01);
  const wallPos = [];
  const edges = [
    [...Array(w).keys()].map((i) => i),
    [...Array(h).keys()].map((j) => j * w + w - 1),
    [...Array(w).keys()].map((i) => (h - 1) * w + (w - 1 - i)),
    [...Array(h).keys()].map((j) => (h - 1 - j) * w),
  ];
  for (const edge of edges) {
    for (let e = 0; e < edge.length - 1; e++) {
      const a = edge[e], b = edge[e + 1];
      if (!valid(a) || !valid(b)) continue;
      const ax = pos[a * 3], az2 = pos[a * 3 + 2], ay = pos[a * 3 + 1];
      const bx = pos[b * 3], bz = pos[b * 3 + 2], by = pos[b * 3 + 1];
      wallPos.push(ax, ay, az2, ax, -baseDepth, az2, bx, by, bz, bx, by, bz, ax, -baseDepth, az2, bx, -baseDepth, bz);
    }
  }
  const wallGeom = new THREE.BufferGeometry();
  wallGeom.setAttribute('position', new THREE.Float32BufferAttribute(wallPos, 3));
  const walls = new THREE.Mesh(wallGeom, new THREE.MeshBasicMaterial({ color: 0x3a3a40, side: THREE.DoubleSide }));

  const group = new THREE.Group();
  group.add(terrain, walls);

  // ---------- grid ----------
  const gridStep = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000].find((s) => span / s <= 12) ?? 100000;
  const gridSize = Math.ceil(span / gridStep) * gridStep;
  const grid = new THREE.GridHelper(gridSize, gridSize / gridStep, 0x666666, 0x3a3a3a);

  // ---------- scene ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x111111);
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';

  const scene = new THREE.Scene();
  scene.add(group, grid);
  const camera = new THREE.PerspectiveCamera(45, 1, span / 2000, span * 50);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.screenSpacePanning = true;
  controls.maxPolarAngle = Math.PI * 0.495;

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;font:12px/1.4 system-ui,sans-serif;color:#e6e6e6';
  overlay.innerHTML =
    '<div data-r style="position:absolute;left:8px;top:8px;padding:4px 8px;border-radius:4px;background:rgba(0,0,0,.6);font-variant-numeric:tabular-nums;display:none"></div>' +
    '<div style="position:absolute;right:12px;top:10px;text-align:center;font-weight:600"><svg data-n width="28" height="28" viewBox="-14 -14 28 28"><path d="M0-12 5 6 0 2-5 6Z" fill="#e6e6e6"/></svg><div>N</div></div>' +
    '<div data-c style="position:absolute;left:8px;bottom:6px;font-size:10px;color:#999"></div>';
  container.appendChild(overlay);
  const readout = overlay.querySelector('[data-r]'), north = overlay.querySelector('[data-n]');
  overlay.querySelector('[data-c]').textContent = imagery.attribution;

  function render() {
    // north arrow follows the camera azimuth
    north.style.transform = `rotate(${THREE.MathUtils.radToDeg(controls.getAzimuthalAngle())}deg)`;
    renderer.render(scene, camera);
  }
  let queued = false;
  const requestRender = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      render();
    });
  };
  controls.addEventListener('change', requestRender);

  const resize = () => {
    const { clientWidth: cw, clientHeight: ch } = container;
    if (!cw || !ch) return;
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch;
    camera.updateProjectionMatrix();
    requestRender();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  // ---------- hover: march the ray over the heightfield ----------
  const heightAt = (x, z) => {
    const fx = x / cell + (w - 1) / 2, fz = z / cell + (h - 1) / 2;
    if (fx < 0 || fz < 0 || fx > w - 1 || fz > h - 1) return null;
    const i = Math.min(Math.floor(fx), w - 2), j = Math.min(Math.floor(fz), h - 2), tx = fx - i, tz = fz - j, p = j * w + i;
    const a = data[p], b = data[p + 1], c = data[p + w], d = data[p + w + 1];
    if (a !== a || b !== b || c !== c || d !== d) return null;
    return (a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz;
  };
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pick(clientX, clientY) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const ray = raycaster.ray, ex = group.scale.y;
    const box = new THREE.Box3(
      new THREE.Vector3((-(w - 1) / 2) * cell, 0, (-(h - 1) / 2) * cell),
      new THREE.Vector3(((w - 1) / 2) * cell, (dem.max - dem.min) * ex, ((h - 1) / 2) * cell),
    );
    const enter = new THREE.Vector3();
    if (!ray.intersectBox(box, enter)) return null;
    let t = Math.max(0, ray.origin.distanceTo(enter) - 1e-6);
    const step = cell * 0.5, p = new THREE.Vector3();
    let prev = null;
    for (let n = 0; n < 20000; n++, t += step) {
      ray.at(t, p);
      if (!box.containsPoint(p) && prev !== null) break;
      const z = heightAt(p.x, p.z);
      const below = z !== null && p.y <= (z - dem.min) * ex;
      if (below) {
        let lo = prev ?? t - step, hi = t; // refine
        for (let m = 0; m < 12; m++) {
          const mid = (lo + hi) / 2;
          ray.at(mid, p);
          const zm = heightAt(p.x, p.z);
          if (zm !== null && p.y <= (zm - dem.min) * ex) hi = mid;
          else lo = mid;
        }
        ray.at(hi, p);
        return { x: p.x, z: p.z, elev: heightAt(p.x, p.z) };
      }
      prev = t;
    }
    return null;
  }
  let pending = null;
  const onMove = (e) => {
    const first = pending === null;
    pending = e;
    if (!first) return;
    requestAnimationFrame(() => {
      const ev = pending;
      pending = null;
      const hit = pick(ev.clientX, ev.clientY);
      if (!hit || hit.elev === null) return void (readout.style.display = 'none');
      const cx = dem.left + (dem.res * w) / 2, cy = dem.top - (dem.res * h) / 2;
      const [lon, lat] = mercToLonLat(cx + hit.x / k, cy - hit.z / k);
      readout.textContent = `E ${hit.x.toFixed(0)} m  N ${(-hit.z).toFixed(0)} m  ·  ${lat.toFixed(5)}, ${lon.toFixed(5)}  ·  Elev ${hit.elev.toFixed(1)} m`;
      readout.style.display = 'block';
    });
  };
  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('pointerleave', () => (readout.style.display = 'none'));
  renderer.domElement.addEventListener('dblclick', () => ctl.resetView());

  const ctl = {
    dem,
    imagery,
    opts: { ...opts },

    setExaggeration(v) {
      ctl.opts.exaggeration = v;
      group.scale.y = v;
      material.uniforms.exag.value = v;
      grid.position.y = -baseDepth * v - span * 0.001;
      requestRender();
    },
    setSurface(mode) {
      ctl.opts.surface = mode;
      material.uniforms.mode.value = { photo: 0, elevation: 1, hillshade: 2 }[mode] ?? 0;
      requestRender();
    },
    setShading(v) {
      ctl.opts.shading = v;
      material.uniforms.shading.value = v;
      requestRender();
    },
    setContours(on) {
      ctl.opts.contours = on;
      material.uniforms.contour.value = on ? contourInterval(dem) : 0;
      requestRender();
    },
    setWalls(on) {
      ctl.opts.walls = on;
      walls.visible = on;
      requestRender();
    },
    setGrid(on) {
      ctl.opts.grid = on;
      grid.visible = on;
      requestRender();
    },
    resetView() {
      const midY = ((dem.max - dem.min) / 2) * group.scale.y;
      controls.target.set(0, midY, 0);
      camera.position.set(span * 0.85, midY + span * 0.8, span * 0.85); // from the south-east, like the Plotly version
      controls.update();
      requestRender();
    },
    getCamera() {
      return { position: camera.position.toArray(), target: controls.target.toArray() };
    },
    setCamera(c) {
      camera.position.fromArray(c.position);
      controls.target.fromArray(c.target);
      controls.update();
      requestRender();
    },
    snapshot() {
      render();
      return renderer.domElement.toDataURL('image/png');
    },
    // a self-contained textured mesh in ground meters (y up), for glTF export
    exportMesh() {
      const g = geom.clone();
      g.deleteAttribute('elev');
      g.scale(1, group.scale.y, 1);
      g.computeVertexNormals();
      const tex = new THREE.CanvasTexture(imagery.image);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.userData.mimeType = 'image/jpeg'; // GLTFExporter embeds PNG by default, which is far larger
      return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0, side: THREE.DoubleSide }));
    },
    destroy() {
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      geom.dispose();
      wallGeom.dispose();
      texture.dispose();
      material.dispose();
      renderer.domElement.remove();
      overlay.remove();
    },
  };

  ctl.setExaggeration(opts.exaggeration ?? 1.5);
  ctl.setSurface(opts.surface ?? 'photo');
  ctl.setShading(opts.shading ?? 0.4);
  ctl.setContours(opts.contours ?? false);
  ctl.setWalls(opts.walls ?? true);
  ctl.setGrid(opts.grid ?? false);
  resize();
  if (opts.camera) ctl.setCamera(opts.camera);
  else ctl.resetView();
  return ctl;
}
