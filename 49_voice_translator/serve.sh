#!/usr/bin/env bash
# Serve Kotoba Booth on http://localhost:8000
# (localhost is allowed by Ollama's default CORS policy and lets the browser cache the model)
cd "$(dirname "$0")"
PORT=${PORT:-8000}
( sleep 1; open "http://localhost:$PORT/" 2>/dev/null || xdg-open "http://localhost:$PORT/" 2>/dev/null ) &
echo "Kotoba Booth: http://localhost:$PORT/  (Ctrl+C to stop)"
python3 -m http.server "$PORT" --bind 127.0.0.1
