#!/usr/bin/env python3
"""
Voice Translator (EN <-> JA) for macOS

- Speech input : faster-whisper (local, offline)
- Translation  : Ollama (default: gemma4:e4b)
- Speech output: macOS `say` command (Kyoko / Samantha)

Usage:
    python voice_translator.py [--model gemma4:e4b] [--whisper small]
"""

import argparse
import json
import queue
import re
import subprocess
import threading
import tkinter as tk
import urllib.request
from tkinter import ttk, messagebox

import numpy as np
import sounddevice as sd

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
OLLAMA_URL = "http://localhost:11434/api/chat"
SAMPLE_RATE = 16000
VOICES = {"ja": "Kyoko", "en": "Samantha"}
JA_CHAR_RE = re.compile(r"[぀-ヿ㐀-鿿ｦ-ﾟ]")

SYSTEM_PROMPT = (
    "You are a professional translator between Japanese and English. "
    "Translate the user's text into {target}. "
    "Output ONLY the translation, with no explanations, quotes, or notes. "
    "Keep the tone and register of the original."
)


# ---------------------------------------------------------------------------
# Core helpers
# ---------------------------------------------------------------------------
def detect_lang(text: str) -> str:
    """Return 'ja' if the text contains Japanese characters, otherwise 'en'."""
    return "ja" if JA_CHAR_RE.search(text) else "en"


def translate(text: str, target: str, model: str) -> str:
    """Translate text via the Ollama chat API (non-streaming)."""
    target_name = "natural Japanese" if target == "ja" else "natural English"
    payload = {
        "model": model,
        "stream": False,
        "options": {"temperature": 0.2},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT.format(target=target_name)},
            {"role": "user", "content": text},
        ],
    }
    req = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    out = data["message"]["content"].strip()
    # Strip reasoning blocks if the model emits them
    out = re.sub(r"<think>.*?</think>", "", out, flags=re.S).strip()
    return out


class Speaker:
    """Wrapper around macOS `say` that can interrupt the current utterance."""

    def __init__(self):
        self.proc = None

    def speak(self, text: str, lang: str, rate: int):
        self.stop()
        if not text.strip():
            return
        cmd = ["say", "-v", VOICES.get(lang, "Samantha"), "-r", str(rate), text]
        self.proc = subprocess.Popen(cmd)

    def stop(self):
        if self.proc and self.proc.poll() is None:
            self.proc.terminate()
        self.proc = None


class Recorder:
    """Push-to-toggle microphone recorder (16 kHz mono float32)."""

    def __init__(self):
        self.frames = []
        self.stream = None

    def start(self):
        self.frames = []
        self.stream = sd.InputStream(
            samplerate=SAMPLE_RATE, channels=1, dtype="float32",
            callback=lambda indata, *_: self.frames.append(indata.copy()),
        )
        self.stream.start()

    def stop(self) -> np.ndarray:
        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None
        if not self.frames:
            return np.zeros(0, dtype=np.float32)
        return np.concatenate(self.frames, axis=0).flatten()


# ---------------------------------------------------------------------------
# GUI
# ---------------------------------------------------------------------------
class App:
    def __init__(self, root: tk.Tk, args):
        self.root = root
        self.args = args
        self.recorder = Recorder()
        self.speaker = Speaker()
        self.whisper = None
        self.recording = False
        self.ui_queue = queue.Queue()

        root.title("Voice Translator  EN ⇄ JA")
        root.geometry("820x600")
        root.minsize(640, 460)

        # --- Top controls ---
        top = ttk.Frame(root, padding=10)
        top.pack(fill="x")

        ttk.Label(top, text="Direction:").pack(side="left")
        self.direction = tk.StringVar(value="auto")
        for label, val in [("Auto", "auto"), ("JA → EN", "ja2en"), ("EN → JA", "en2ja")]:
            ttk.Radiobutton(top, text=label, value=val, variable=self.direction).pack(side="left", padx=4)

        self.auto_speak = tk.BooleanVar(value=True)
        ttk.Checkbutton(top, text="Auto speak", variable=self.auto_speak).pack(side="left", padx=12)

        ttk.Label(top, text="Rate").pack(side="left")
        self.rate = tk.IntVar(value=180)
        ttk.Spinbox(top, from_=100, to=300, increment=10, width=5, textvariable=self.rate).pack(side="left", padx=4)

        # --- Source panel ---
        self.src_label = ttk.Label(root, text="Source", padding=(10, 0))
        self.src_label.pack(anchor="w")
        self.src = tk.Text(root, height=8, wrap="word", font=("Hiragino Sans", 15), undo=True)
        self.src.pack(fill="both", expand=True, padx=10, pady=(2, 6))

        # --- Action buttons ---
        mid = ttk.Frame(root, padding=(10, 0))
        mid.pack(fill="x")
        self.rec_btn = ttk.Button(mid, text="🎤  Record", command=self.toggle_record)
        self.rec_btn.pack(side="left")
        ttk.Button(mid, text="Translate  (⌘↩)", command=self.on_translate).pack(side="left", padx=6)
        ttk.Button(mid, text="🔊 Speak source", command=lambda: self.speak_box(self.src)).pack(side="left", padx=6)
        ttk.Button(mid, text="⇅ Swap", command=self.swap).pack(side="left", padx=6)
        ttk.Button(mid, text="Clear", command=self.clear).pack(side="right")

        # --- Target panel ---
        self.dst_label = ttk.Label(root, text="Translation", padding=(10, 6, 10, 0))
        self.dst_label.pack(anchor="w")
        self.dst = tk.Text(root, height=8, wrap="word", font=("Hiragino Sans", 15))
        self.dst.pack(fill="both", expand=True, padx=10, pady=(2, 6))

        bottom = ttk.Frame(root, padding=(10, 0, 10, 10))
        bottom.pack(fill="x")
        ttk.Button(bottom, text="🔊 Speak translation", command=lambda: self.speak_box(self.dst)).pack(side="left")
        ttk.Button(bottom, text="⏹ Stop", command=self.speaker.stop).pack(side="left", padx=6)
        ttk.Button(bottom, text="Copy", command=self.copy_result).pack(side="left", padx=6)

        self.status = tk.StringVar(value=f"Ready  |  LLM: {args.model}  |  Whisper: {args.whisper}")
        ttk.Label(root, textvariable=self.status, relief="sunken", anchor="w", padding=4).pack(fill="x", side="bottom")

        # Shortcuts
        root.bind("<Command-Return>", lambda e: self.on_translate())
        root.bind("<Command-r>", lambda e: self.toggle_record())
        root.protocol("WM_DELETE_WINDOW", self.on_close)

        self.root.after(100, self.poll_queue)
        # Warm up whisper in the background so the first recording is fast
        threading.Thread(target=self.load_whisper, daemon=True).start()

    # ---- Thread-safe UI updates ----
    def post(self, fn, *a):
        self.ui_queue.put((fn, a))

    def poll_queue(self):
        try:
            while True:
                fn, a = self.ui_queue.get_nowait()
                fn(*a)
        except queue.Empty:
            pass
        self.root.after(80, self.poll_queue)

    def set_status(self, msg):
        self.post(self.status.set, msg)

    def set_text(self, box: tk.Text, text: str):
        def _do():
            box.delete("1.0", "end")
            box.insert("1.0", text)
        self.post(_do)

    # ---- Whisper ----
    def load_whisper(self):
        if self.whisper is not None:
            return
        self.set_status(f"Loading Whisper ({self.args.whisper})...")
        from faster_whisper import WhisperModel
        self.whisper = WhisperModel(self.args.whisper, device="cpu", compute_type="int8")
        self.set_status(f"Ready  |  LLM: {self.args.model}  |  Whisper: {self.args.whisper}")

    def forced_src_lang(self):
        d = self.direction.get()
        return {"ja2en": "ja", "en2ja": "en"}.get(d)

    # ---- Recording ----
    def toggle_record(self):
        if not self.recording:
            self.speaker.stop()
            try:
                self.recorder.start()
            except Exception as e:
                messagebox.showerror("Mic error", str(e))
                return
            self.recording = True
            self.rec_btn.config(text="⏺  Stop recording")
            self.status.set("Recording... press again to stop")
        else:
            self.recording = False
            self.rec_btn.config(text="🎤  Record")
            audio = self.recorder.stop()
            threading.Thread(target=self.transcribe_and_translate, args=(audio,), daemon=True).start()

    def transcribe_and_translate(self, audio: np.ndarray):
        if audio.size < SAMPLE_RATE * 0.3:
            self.set_status("Recording too short")
            return
        try:
            self.load_whisper()
            self.set_status("Transcribing...")
            segments, info = self.whisper.transcribe(
                audio, language=self.forced_src_lang(), beam_size=5, vad_filter=True,
            )
            text = "".join(s.text for s in segments).strip()
            if not text:
                self.set_status("No speech detected")
                return
            src_lang = info.language if info.language in ("ja", "en") else detect_lang(text)
            self.set_text(self.src, text)
            self.run_translation(text, src_lang)
        except Exception as e:
            self.set_status(f"Error: {e}")

    # ---- Translation ----
    def on_translate(self):
        text = self.src.get("1.0", "end").strip()
        if not text:
            return
        src_lang = self.forced_src_lang() or detect_lang(text)
        threading.Thread(target=self.run_translation, args=(text, src_lang), daemon=True).start()

    def run_translation(self, text: str, src_lang: str):
        target = "en" if src_lang == "ja" else "ja"
        self.post(self.src_label.config, {"text": f"Source ({src_lang.upper()})"})
        self.post(self.dst_label.config, {"text": f"Translation ({target.upper()})"})
        self.set_status(f"Translating {src_lang.upper()} → {target.upper()} ...")
        try:
            result = translate(text, target, self.args.model)
        except Exception as e:
            self.set_status(f"Ollama error: {e}  (is `ollama serve` running?)")
            return
        self.set_text(self.dst, result)
        self.set_status(f"Done  {src_lang.upper()} → {target.upper()}")
        if self.auto_speak.get():
            self.speaker.speak(result, target, self.rate.get())

    # ---- Misc actions ----
    def speak_box(self, box: tk.Text):
        text = box.get("1.0", "end").strip()
        self.speaker.speak(text, detect_lang(text), self.rate.get())

    def swap(self):
        a = self.src.get("1.0", "end").strip()
        b = self.dst.get("1.0", "end").strip()
        self.src.delete("1.0", "end"); self.src.insert("1.0", b)
        self.dst.delete("1.0", "end"); self.dst.insert("1.0", a)

    def clear(self):
        self.src.delete("1.0", "end")
        self.dst.delete("1.0", "end")

    def copy_result(self):
        self.root.clipboard_clear()
        self.root.clipboard_append(self.dst.get("1.0", "end").strip())
        self.status.set("Copied to clipboard")

    def on_close(self):
        self.speaker.stop()
        if self.recording:
            self.recorder.stop()
        self.root.destroy()


def main():
    p = argparse.ArgumentParser(description="EN <-> JA voice translator")
    p.add_argument("--model", default="gemma4:e4b", help="Ollama model name")
    p.add_argument("--whisper", default="small",
                   help="faster-whisper model: tiny/base/small/medium/large-v3")
    args = p.parse_args()

    root = tk.Tk()
    App(root, args)
    root.mainloop()


if __name__ == "__main__":
    main()
