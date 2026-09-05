#!/usr/bin/env python3
"""
Sync conversation-deck.html with questions.csv.

Workflow for adding more examples later:
  1. Open questions.csv in Excel / Numbers / a text editor.
  2. Add rows: domain,hue,icon,question,tip1,tip2
     - domain: the topic name. Reuse an existing name to add another
       question to that topic, or use a brand-new name to create a new
       topic (also pick a hue 0-359 and an SVG path for the icon field,
       or just copy an existing topic's icon).
     - hue: 0-359, the color used for that topic's badge.
     - icon: an SVG <path d="..."> value (no commas in the path data,
       since this is a CSV column). Reuse an existing topic's icon if
       you don't want to draw a new one.
     - question: the interview question, in English.
     - tip1 / tip2: optional phrase-bank hints. Leave blank if unused.
       HTML like <em>...</em> and "smart quotes" are fine inside them.
  3. Run:  python3 regenerate.py
     This rewrites the embedded data block inside conversation-deck.html
     so the app matches the CSV. The app itself needs no internet
     connection and no local server -- it can still be opened by double
     -clicking the file.
"""
import csv
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CSV_PATH = HERE / "questions.csv"
HTML_PATH = HERE / "conversation-deck.html"

BEGIN_MARK = "/* BEGIN:GENERATED_DATA */"
END_MARK = "/* END:GENERATED_DATA */"


def load_rows():
    rows = []
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        required = {"domain", "hue", "icon", "question"}
        missing = required - set(reader.fieldnames or [])
        if missing:
            sys.exit(f"questions.csv is missing columns: {', '.join(sorted(missing))}")
        for i, row in enumerate(reader, start=2):  # header is line 1
            domain = (row.get("domain") or "").strip()
            question = (row.get("question") or "").strip()
            if not domain or not question:
                continue  # skip blank/incomplete rows
            try:
                hue = int(float(row.get("hue") or 0)) % 360
            except ValueError:
                sys.exit(f"questions.csv line {i}: hue must be a number")
            icon = (row.get("icon") or "").strip()
            tips = [t.strip() for t in (row.get("tip1", ""), row.get("tip2", "")) if t and t.strip()]
            rows.append({"domain": domain, "hue": hue, "icon": icon, "q": question, "tips": tips})
    if not rows:
        sys.exit("questions.csv has no usable rows")
    return rows


def main():
    if not CSV_PATH.exists():
        sys.exit(f"Couldn't find {CSV_PATH.name} next to this script.")
    if not HTML_PATH.exists():
        sys.exit(f"Couldn't find {HTML_PATH.name} next to this script.")

    rows = load_rows()
    data_js = "var GENERATED_ROWS = " + json.dumps(rows, ensure_ascii=False, indent=2) + ";"
    block = BEGIN_MARK + "\n" + data_js + "\n" + END_MARK

    html = HTML_PATH.read_text(encoding="utf-8")
    pattern = re.compile(re.escape(BEGIN_MARK) + r".*?" + re.escape(END_MARK), re.DOTALL)
    if not pattern.search(html):
        sys.exit("Couldn't find the GENERATED_DATA markers in conversation-deck.html.")
    html = pattern.sub(block, html, count=1)
    HTML_PATH.write_text(html, encoding="utf-8")

    domains = sorted(set(r["domain"] for r in rows))
    print(f"Synced {len(rows)} questions across {len(domains)} topics into {HTML_PATH.name}.")


if __name__ == "__main__":
    main()
