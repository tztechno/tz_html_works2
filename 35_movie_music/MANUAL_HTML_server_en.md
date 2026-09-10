# Shorts Video/Audio Combiner — User Manual

A single self-contained HTML file that trims a video and an audio track to
a short-form length and combines them, entirely inside your web browser
using ffmpeg.wasm. Nothing is uploaded anywhere — all processing happens
on your own machine, in the browser tab.

## 1. Requirements

- A modern desktop browser (Chrome, Safari, or Firefox)
- An internet connection the first time you use it (it downloads the
  ffmpeg.wasm engine, ~30MB, from a CDN)
- Python 3, just to run the one-line local server command in step 2
  (already installed on macOS/Linux by default)
- No other installation — no Flask, no ffmpeg binary needed

## 2. Opening the file — read this before double-clicking it

**Do not open this file by double-clicking it.** Browsers block a piece
this app needs (a background "Worker") on any page opened directly from
disk as `file://...` — this is confirmed, reproducible browser behavior,
not something a page's own code can work around. Serving the exact same
file over a local web server fixes it completely; this was verified with
an automated test that ran a full conversion successfully once served
this way, and reproduced the same failure you saw when opened as
`file://...`.

This local server is a single built-in Python command — it is **not**
Flask, not a Python app, and involves no code at all. It just makes the
same HTML file available at a `http://` address instead of a `file://`
path.

1. Open a terminal and go to the folder containing the HTML file, e.g.:
   ```
   cd ~/Downloads
   ```
2. Start the local server:
   ```
   python3 -m http.server 8000
   ```
3. In your browser, open (adjust the filename to match what you downloaded):
   ```
   http://localhost:8000/video_audio_combiner.html
   ```
4. When you're done, go back to the terminal and press `Ctrl+C` to stop
   the server.

If you use VS Code, the "Live Server" extension works too — right-click the
HTML file and choose "Open with Live Server".

## 3. Using the app

1. **Video file** — click **Choose File** and pick the source video.
2. **Audio file** — click **Choose File** and pick the audio track to lay
   over it.
3. **Audio volume (0.0 – 2.0)** — multiplier applied to the audio track's
   volume. `1.0` keeps the original level; `0.08` makes it very quiet.
4. **Max short duration (seconds)** — the output is capped to this length
   when short-form mode is on. `178` matches the common ~3-minute limit
   used by YouTube Shorts / TikTok-style short-form video.
5. **Short-form mode** checkbox:
   - **Checked**: output is cropped/padded to a 1080×1920 portrait frame
     and capped to the max duration above.
   - **Unchecked**: the original video's dimensions and full length are
     kept.
6. Click **Convert**. The first run downloads the ffmpeg core (~30MB) —
   you'll see "Downloading ffmpeg core..." in the status line, then a log
   of ffmpeg's own output while it processes. This can take anywhere from
   several seconds to a couple of minutes depending on your machine and
   the video's length, since all decoding/encoding runs in the browser via
   WebAssembly rather than native code.
7. When it finishes, a preview and a **Download** link appear below the
   log.

## 4. Troubleshooting

- **"Please choose both a video file and an audio file."** — one or both
  file pickers were left empty.
- **Any error mentioning "Worker", "cannot be accessed from origin",
  "publicPath", or "Cannot find module 'blob:null/...'"** — you opened the
  file directly (`file://...`) instead of through the local server in
  section 2. This is the one and only cause of that whole family of
  errors; go back and serve it over `http://localhost` instead.
- **The page just hangs on "Downloading ffmpeg core..."** — check your
  internet connection; the ffmpeg.wasm engine is fetched from a CDN on
  first use.
- Large videos can be slow or memory-hungry in a browser tab, since all
  decoding/encoding runs in WebAssembly rather than native code — a very
  long or high-resolution source may be slow or, in rare cases, run the
  tab out of memory.
