# Softlight User Manual

Softlight is a browser-based portrait retoucher. You upload a photo, and every adjustment — skin smoothing, tone, and a light facial reshape — happens entirely inside your browser using the HTML5 Canvas API. No photo is ever uploaded to a server.

This manual covers the interface, what each control does, how the effect is calculated, and its limitations.

## 1. Getting Started

1. Open `softlight.html` in a modern desktop or mobile browser (Chrome, Edge, Safari, or Firefox).
2. Drop a JPG or PNG portrait onto the frame, or click **Choose Photo** to pick one from disk.
3. The app analyzes the image for a moment ("Analyzing image…") and then displays the **Before / After** comparison view with default adjustments already applied.
4. Drag the vertical divider left or right to compare the original and retouched photo.

No sign-in, upload, or internet connection is required after the page itself has loaded (aside from loading the Google Fonts used for the interface).

## 2. The Focus Reticle

A dashed gold oval — the **focus reticle** — appears over the photo once it loads. It marks the area the retouching effect is concentrated on, so the background and hair are not blurred along with the skin.

- **Move it**: click and drag anywhere inside the oval to recenter it on the face.
- **Resize it**: drag the small gold handle at its bottom-right corner.
- **Auto-placement**: in browsers that support the experimental `FaceDetector` API (some Chromium builds), Softlight will attempt to position the reticle automatically when a photo loads. Everywhere else, it defaults to a centered oval and you position it manually.
- **Apply across full frame**: check this box in the toolbar under the photo to turn off the reticle and apply every adjustment evenly across the whole image (useful for close-up crops that are already just skin, or for photos where the oval mask doesn't fit well).

## 3. The Controls

Controls are grouped into four stages, reflecting the order in which a photo retoucher would typically work.

### Stage 01 — Skin

| Control | What it does |
|---|---|
| **Skin Smoothing** | Blends a heavily blurred copy of the photo back into the original, reducing the visibility of fine lines, pores, and blemishes. Higher values smooth more aggressively. |
| **Detail Retention** | Dials back how much smoothing is allowed even inside the focus area, so skin keeps some natural texture instead of looking airbrushed. Raise it if results look too "plastic." |

Under the hood this is a simplified **frequency separation**: the app blurs the photo, measures the difference between the original and the blur (the "high-frequency" detail — wrinkles, pores, small shadows), and then reduces that difference before recombining. An edge map (computed once per photo) protects strong contours — eyes, lips, eyebrows, hairline — so smoothing targets flatter skin rather than blurring away entire facial features.

### Stage 02 — Tone

| Control | What it does |
|---|---|
| **Exposure** | Brightens or darkens the whole photo. |
| **Warmth** | Shifts color balance toward orange (positive) or blue (negative), similar to a white-balance adjustment. |
| **Vibrance** | Increases or decreases color saturation relative to each pixel's brightness. |

### Stage 03 — Light

| Control | What it does |
|---|---|
| **Highlight & Shadow Lift** | Brightens near-white areas (the whites of eyes, teeth, skin highlights) and — inside the focus area only — lifts near-black shadow tones toward mid-grey, softening dark circles under the eyes and harsh fold shadows. |

### Stage 04 — Sculpt

| Control | What it does |
|---|---|
| **Eye Size** | Applies a subtle outward "bulge" warp centered on two estimated eye positions inside the focus oval, making the eyes appear slightly larger. |
| **Jaw Slimming** | Applies a subtle inward "pinch" warp centered on two estimated jaw positions near the bottom corners of the focus oval, narrowing the visual width of the lower face. |

Eye and jaw positions are estimated proportionally from the focus oval's size and position — Softlight does not use facial landmark detection for this step. For the warp to land correctly, make sure the focus oval is centered on the face and sized so its edges roughly follow the hairline and jawline before raising these two sliders.

### Reset and Change Photo

- **Reset Adjustments** returns all sliders and the focus oval to their defaults without removing the loaded photo.
- **Change Photo** opens the file picker again to load a different image.

## 4. Saving Your Result

Softlight does not include a "Download" button. This is a deliberate limitation of the hosted version of the app (script-triggered downloads are blocked in that environment), not a missing feature.

To save your result:

1. Right-click (or, on a touchscreen, press and hold) the photo on the right side of the comparison view.
2. Choose **Save Image As…** (wording varies slightly by browser).
3. The image saves at the working resolution described below — not the original file's full resolution.

## 5. Technical Notes and Limitations

- **Working resolution**: photos are downscaled so their longest side is at most 1000 pixels before processing, to keep the sliders responsive. This keeps the app fast even on large phone photos, but the saved result will not exceed that resolution.
- **Not AI-generated de-aging**: Softlight does not use a generative model to imagine a younger face. Every adjustment is a classic photo-retouching technique (blur-based skin smoothing, tone grading, and simple geometric warps) applied with plain pixel math. It will not change bone structure, remove grey hair, or produce results comparable to a machine-learning face-aging model — it produces a softer, brighter, subtly reshaped version of the photo you provide.
- **No face landmark detection**: eye and jaw positions used by Stage 04 are geometric estimates based on the focus oval, not detected facial features. Results will look better the more accurately the oval is aligned to the actual face.
- **Privacy**: all processing happens locally in your browser's memory using the Canvas API. The photo is never sent over the network. Closing or reloading the page discards it — Softlight does not save anything between sessions.
- **Browser support**: requires a browser with Canvas 2D support and the CSS `filter` property (all modern browsers). The optional auto-face-placement feature requires the non-standard `FaceDetector` API, currently only available in some Chromium-based browsers.

## 6. Quick Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| The effect looks too subtle | Raise Skin Smoothing, Exposure, Highlight & Shadow Lift, or check that "Apply across full frame" isn't limiting the mask incorrectly. |
| Skin looks unnaturally smooth or plastic | Raise Detail Retention, or lower Skin Smoothing slightly. |
| Eyes/jaw look distorted or asymmetric | Re-center and resize the focus oval so it matches the face more closely, then re-adjust Eye Size / Jaw Slimming. |
| Nothing happens when I drop a photo | Confirm the file is a JPG or PNG; other formats (HEIC, WebP in some browsers, PDF, etc.) may not load via the file input. |
| Right-click doesn't offer "Save Image" | Some mobile browsers require a long-press instead; on desktop, make sure you're right-clicking directly on the photo, not the surrounding panel. |
