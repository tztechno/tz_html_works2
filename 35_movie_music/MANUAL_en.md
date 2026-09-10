# Shorts Video/Audio Combiner — User Manual

A small local web app that trims a video and an audio track to a short-form
length and combines them, using real `ffmpeg` on your own machine.

## 1. Requirements

- Python 3.8 or newer
- `ffmpeg` installed and available on your system PATH
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt install ffmpeg`
  - Windows: install from [ffmpeg.org](https://ffmpeg.org/download.html) and add it to PATH
- The two files provided with this manual: `app.py` and `requirements.txt`

## 2. Installation

Open a terminal in the folder containing `app.py` and `requirements.txt`, then run:

```
pip install -r requirements.txt
```

This installs Flask and `ffmpeg-python`. It does **not** install `ffmpeg`
itself — that's a separate system package, installed as shown above.

## 3. Running the app

From the same folder, run:

```
python app.py
```

You should see output ending with something like:

```
 * Running on http://127.0.0.1:5000
```

Open that address (`http://127.0.0.1:5000`) in your web browser. Leave the
terminal window open while you use the app — closing it stops the server.

To stop the app, go back to the terminal and press `Ctrl+C`.

If the browser instead shows a page saying **"ffmpeg is not installed"**,
it means the app started fine but couldn't find the `ffmpeg` command — go
back to step 1 and install it, then restart `python app.py`.

## 4. Using the app

1. **Video file** — choose the source video (e.g. a `.mov` or `.mp4` file).
2. **Audio file** — choose the audio track to lay over it (e.g. an `.mp3`).
3. **Audio volume** — a multiplier applied to the audio track's volume.
   `1.0` keeps the original level, `0.08` makes it very quiet, values above
   `1.0` amplify it. Adjust to taste.
4. **Max short duration (seconds)** — the output is capped to this length
   when short-form mode is on. `178` matches the common ~3-minute limit
   used by YouTube Shorts / TikTok-style short-form video.
5. **Short-form mode** checkbox:
   - **Checked**: the output is cropped/padded to a 1080×1920 portrait
     frame (scaled to fit, with black bars added if needed) and capped to
     the max duration above.
   - **Unchecked**: the original video's dimensions and full length are
     kept — no portrait cropping, no duration cap.
6. Click **Convert**. Processing time depends on the video's length and
   your machine — a short clip usually finishes in a few seconds.
7. On success you'll see a preview of the result with a **Download**
   button to save the `.mp4` file. Click **Convert another** to start over.

## 5. What happens internally

For reference, each conversion does the following with `ffmpeg`:

1. Reads the source video's duration.
2. If short-form mode is on, the target duration is
   `min(source duration, max duration)`; otherwise it's the full source
   duration.
3. Trims the audio to the target duration and applies the volume filter,
   writing a temporary standalone audio file.
4. Trims the video to the same target duration, combines it with the
   trimmed audio (explicitly mapping video from the video file and audio
   from the trimmed audio file, so ffmpeg can't mix them up), and — in
   short-form mode — scales and pads the video to 1080×1920.
5. Encodes the result as H.264 video + AAC audio in an MP4 container with
   `faststart` enabled (so the file starts playing before it's fully
   downloaded).
6. Temporary uploaded files and the intermediate trimmed-audio file are
   deleted after each conversion; the final output stays in an `outputs`
   folder next to `app.py` until you delete it yourself.

## 6. Troubleshooting

- **"Please choose both a video file and an audio file."** — you submitted
  the form without selecting one or both files.
- **"ffmpeg failed" page with a long log** — this is `ffmpeg`'s own error
  output, most often caused by an unsupported or corrupted input file. The
  log text usually names the specific problem near the end.
- **Port already in use** — another program is already using port 5000. Stop
  it, or edit the last line of `app.py` (`app.run(debug=True, port=5000)`)
  to use a different port, e.g. `port=5001`.
- This app is for local/personal use only — it runs Flask's built-in
  development server, which isn't meant to be exposed to the internet.
