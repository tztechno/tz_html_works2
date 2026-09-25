# Voice Translator (EN ⇄ JA) — Mac local

Fully offline English ⇄ Japanese translator with voice input and voice output.

| Stage | Engine |
|---|---|
| Speech input | faster-whisper (auto language detection) |
| Translation | Ollama (`gemma4:e4b` by default) |
| Speech output | macOS `say` (Kyoko for JA, Samantha for EN) |

## Setup

```bash
# Homebrew Python blocks global pip (PEP 668), so use a venv
brew install python-tk          # if tkinter is missing
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
ollama pull gemma4:e4b
ollama serve   # if not already running
```

The first run downloads the Whisper model. Grant microphone access to Terminal (System Settings → Privacy & Security → Microphone).

## Run

```bash
python voice_translator.py
python voice_translator.py --model gemma4:e4b --whisper medium
```

## Usage

- **🎤 Record** (⌘R): press to start, press again to stop → transcribe → translate → speak
- **Translate** (⌘↩): translate the typed text
- **Direction**: Auto detects the language; JA→EN / EN→JA forces it
- **Auto speak**: reads the translation aloud automatically
- **Swap**: swap the source and translation

## Web version (`kotoba_booth_local.html`)

Open it in Chrome or Safari. The 🎤 日本語 / 🎤 English buttons use Web Speech recognition, 🔊 uses the browser's speech synthesis, and translation goes to Ollama at `localhost:11434` (same model setting). If the browser blocks the request, start Ollama with `OLLAMA_ORIGINS="*" ollama serve`.

The UI switches between English and Japanese (button at the top). A bilingual user manual is in `site/manual.html` (also `manual.html`), linked from the app's `?` button. Deploy the whole `site/` folder so the link works.

### In-browser engine (phones, no Ollama)

Engine "In-browser (FuguMT)" runs FuguMT (Marian, int8 ONNX) via Transformers.js/WASM. First use of each direction downloads ~145 MB, then it is cached. For smartphone use (mic needs HTTPS), host `site/index.html` on any HTTPS static host (Netlify, GitHub Pages, Cloudflare Pages) and open it in Safari / Chrome.

The published Artifact version uses Claude for translation and speaks results aloud. Microphones are blocked inside Artifacts, so for voice input there use macOS dictation (press fn twice) in the text box.

For better Japanese voices, download Kyoko (Enhanced) under System Settings → Accessibility → Spoken Content → System Voice → Manage Voices.
