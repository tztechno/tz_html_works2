# Background Remover — User Manual (English)

A web app that removes image backgrounds with AI and saves the result as a transparent PNG. Anything the AI misses can be cleaned up by hand with the eraser.

日本語版: [MANUAL.ja.md](MANUAL.ja.md)

## 1. Features

- Automatic background removal, saved as a transparent PNG
- Everything runs inside your browser; images are never uploaded to any server
- Eraser, Restore brush and Undo (up to 10 steps) for manual touch-ups
- Japanese / English interface (picked automatically from your browser language, switchable at any time)

## 2. Requirements

- A recent Chrome or Edge is recommended. The app is faster when WebGPU is available and still works without it (it falls back to WASM, which is slower).
- An internet connection is needed on the first run only, to download the AI model (about 170 MB). After that the browser caches it.

## 3. Starting the app

1. Open a terminal in the `bg-remover` folder.
2. Run:

   ```
   python3 -m http.server 8000
   ```

3. Open `http://localhost:8000` in your browser.
4. To stop the app, press `Ctrl + C` in the terminal.

Notes:

- Opening `index.html` directly by double-clicking may prevent the model from being cached. Use the method above.
- The model cache is stored per origin, including the port number. Always start the server on the same port (for example 8000) to avoid downloading the model again.

## 4. Basic workflow

1. **Load an image**: drop it onto the box, click the box to choose a file, or paste with ⌘V (Ctrl+V on Windows). PNG, JPG and WebP are supported.
2. **Wait for processing**: on the first run the model download progress is shown. Then "Removing the background…" appears, followed by the result.
3. **Check the result**: transparent areas are shown as a checkerboard. Switch to the "Original" tab to compare with the source image.
4. **Touch up if needed** (see the next section).
5. **Save**: click "Save transparent PNG". The file is saved as `<original name>_transparent.png`.

## 5. Touch-ups (Eraser and Restore)

The tools appear above the result.

| Tool | What it does |
|---|---|
| Eraser | Makes the area you paint over transparent |
| Restore | Brings the area you paint over back to the original image (use it when you erased too much) |
| Size | Sets the brush size from 4 to 200 px. The brush outline is shown over the image |
| Undo | Reverts the last action, up to 10 times. Keyboard: ⌘Z (Ctrl+Z) |

Tips:

- Use a large brush for big areas and a small one for fine details such as hair edges.
- If you erase too much, try Undo first. To repair something from earlier, paint over it with the Restore brush.
- Restore paints back the original image pixels. It does not return to the AI's result.

## 6. Switching language

Use the "日本語 / English" switch at the top right. Your choice is remembered for next time.

## 7. Limitations

- Images larger than 4096 px are downscaled so the longer side is 4096 px.
- Undo keeps at most 10 steps.
- Clicking "New image", or loading another image, discards your current edits. Save first if you need them.
- One image at a time (no batch processing).

## 8. License and permitted use

- The model is briaai/RMBG-1.4, released under a **non-commercial license**. **Use is limited to personal use.** To sell the tool or use it for business, you need to switch to a model that allows commercial use, or obtain a commercial license from the provider (BRIA).
- The inference library (transformers.js) is, as far as I know, Apache-2.0 licensed.

## 9. Troubleshooting

| Symptom | What to do |
|---|---|
| "Processing failed" is shown | Check your internet connection. Company or school networks may block `huggingface.co` and `cdn.jsdelivr.net`. The cause is shown in the browser developer tools console (⌥⌘I). |
| The first run is slow | The model (about 170 MB) is being downloaded. Later runs are faster. |
| The model downloads every time | Start the server on the same port every time. Clearing the browser's site data also removes the cached model. |
| The removal is not accurate enough | Clean it up with the Eraser and Restore brush. Images where the subject and background have similar colors are harder. |
| Processing is slow or the browser feels heavy | Without WebGPU the app uses WASM, which takes longer. Shrinking very large images beforehand helps. |
