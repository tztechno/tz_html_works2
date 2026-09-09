# Particle Bloom — User Manual

*A guide to `particle-bloom.html`.*

---

## 1. Overview

**Particle Bloom** takes any picture you choose and dissolves it into a mosaic of small square tiles, each colored from the image itself. While the particles are still moving, you're looking at a particle field; once they settle, the app quietly swaps in the real image at full resolution, so the resting picture is visually indistinguishable from the original photo. Dragging your cursor (or finger) through it — or clicking/tapping — pushes the particles aside and reveals the mosaic doing the disturbing. Until you load a picture, it shows a "Hello, World" particle demo.

---

## 2. What you'll see

- The same deep indigo, starfield backdrop throughout.
- By default: the "Hello, World" particle text.
- After choosing an image: the particles reassemble into that image's shapes and colors, then — once they stop moving — the real photo quietly fades in on top, pixel for pixel.
- A "Choose image" button, top-right.
- A footer status line showing either the demo's rotating print-statement, or the loaded file's name and particle count.
- Moving the cursor (or dragging a finger) opens a soft "window" that always shows the particles actually being disturbed, wherever it is on the image — even while the rest of the picture is sitting fully resolved.

---

## 3. Controls

| Action (desktop) | Action (touch) | Effect |
|---|---|---|
| Click "Choose image" | Tap "Choose image" | Opens a picker to select any image (JPEG, PNG, WebP, etc.) — on phones this also offers the camera |
| Drag an image file onto the page | — | Drops it in the same way as choosing one (desktop only) |
| Move the cursor | Drag a finger | Nearby particles are pushed aside; a window opens there showing the mosaic in motion |
| Click anywhere | Tap anywhere | Scatters all particles outward, then springs them back into formation |
| Load a new image at any time | Same | The current particles morph into the new image instead of resetting |

---

## 4. Technical notes

- Everything happens locally in your browser. The chosen image is never uploaded anywhere.
- **Mosaic sampling**: the image is fitted into a box on screen, then divided into a fine grid (roughly 17,000–22,000 tiles depending on image shape). Each tile's color is the *average* of every source pixel inside it — not a single sampled point — so edges and gradients stay smooth instead of noisy. Tiles are square, not round, so they tile edge-to-edge like a real mosaic.
- **"Indistinguishable from the original"**: once a tile's particles are within a few pixels of their target position, the app fades in the actual source image at full resolution on top of the mosaic. This is a crossfade driven by how settled the particles currently are — so the picture you see at rest isn't limited by the particle count at all.
- **Local disturbance window**: moving the cursor doesn't just nudge particles — it also cuts a soft, cursor-sized hole into that crisp overlay (on its own off-screen layer, so it reveals the real particle motion underneath rather than the page background). That's what keeps the "avoiding the cursor" effect visible even when the rest of the image has already resolved to full sharpness.
- Pixels that are mostly transparent (a PNG with a cut-out background) are skipped, so a logo or sticker keeps its silhouette.
- Particle motion is a lightweight spring simulation (pull toward target + damping) — no physics library involved.
- If your OS has "reduce motion" turned on, the animation simplifies automatically.
- **Mobile**: the page includes a proper viewport tag, disables pinch-zoom/pull-to-refresh so touch gestures control the particles instead of the browser, adds safe-area padding for notches, and re-fits itself on rotation. Touch has no hover, so the hint text and interaction switch to "drag to disturb · tap to reform" automatically.
- Fonts: **Fraunces** (the default "Hello, World" demo only) and **JetBrains Mono** (UI text), both from Google Fonts.

---

## 5. File

`particle-bloom.html` — open directly in a browser (double-click, or drag it into a browser window) on desktop or mobile. No build step, no server, and no account needed.
