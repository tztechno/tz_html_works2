
Fetch news · PY
#!/usr/bin/env python3
"""Fetch the NYT World RSS feed and write it to data/news.json.
 
Standard library only, so it runs anywhere without `pip install`.
 
Usage:
    python3 scripts/fetch_news.py                  # fetch the live feed
    python3 scripts/fetch_news.py --input feed.xml # parse a saved feed instead
"""
import argparse
import json
import os
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
 
FEED_URL = "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "news.json"
 
# XML namespaces used by the NYT feed
NS = {
    "media": "http://search.yahoo.com/mrss/",
    "dc": "http://purl.org/dc/elements/1.1/",
}
 
# A browser-like User-Agent avoids being rejected by some CDNs
USER_AGENT = "Mozilla/5.0 (compatible; static-news-reader/1.0)"
 
 
def fetch(url: str) -> bytes:
    """Download the feed and return the raw XML bytes."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()
 
 
def text(node, path: str) -> str:
    """Return the stripped text of a child element, or an empty string."""
    child = node.find(path, NS)
    return (child.text or "").strip() if child is not None else ""
 
 
def to_iso(pub_date: str):
    """Convert an RFC 822 date string to ISO 8601 (UTC). Returns None on failure."""
    if not pub_date:
        return None
    try:
        dt = parsedate_to_datetime(pub_date)
    except (TypeError, ValueError):
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
 
 
def best_image(item) -> dict:
    """Pick the widest media:content image of an item (falls back to media:thumbnail)."""
    best, best_width = None, -1
    for m in item.findall("media:content", NS):
        url = m.get("url")
        if not url or m.get("medium", "image") != "image":
            continue
        try:
            width = int(m.get("width", 0))
        except ValueError:
            width = 0
        if width > best_width:
            best, best_width = m, width
    if best is None:
        thumb = item.find("media:thumbnail", NS)
        if thumb is not None and thumb.get("url"):
            return {"image": thumb.get("url"), "image_credit": ""}
        return {"image": "", "image_credit": ""}
    return {"image": best.get("url"), "image_credit": text(item, "media:credit")}
 
 
def parse(xml_bytes: bytes) -> dict:
    """Parse RSS 2.0 XML into the JSON structure consumed by index.html."""
    root = ET.fromstring(xml_bytes)
    channel = root.find("channel")
    if channel is None:
        raise ValueError("Not an RSS 2.0 feed: <channel> not found")
 
    items = []
    seen = set()
    for it in channel.findall("item"):
        link = text(it, "link")
        title = text(it, "title")
        if not link or not title or link in seen:
            continue
        seen.add(link)
        entry = {
            "title": title,
            "link": link,
            "summary": text(it, "description"),
            "author": text(it, "dc:creator"),
            "published": to_iso(text(it, "pubDate")),
            "categories": [c.text.strip() for c in it.findall("category") if c.text],
        }
        entry.update(best_image(it))
        items.append(entry)
 
    # Newest first (items without a date go last)
    items.sort(key=lambda e: e["published"] or "", reverse=True)
 
    return {
        "source": FEED_URL,
        "title": text(channel, "title") or "NYT World",
        "fetched_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "sample": False,
        "items": items,
    }
 
 
def write_atomic(path: Path, data: dict) -> None:
    """Write JSON via a temp file so a failed run never leaves a broken news.json."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, path)
 
 
def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--input", help="Parse a local XML file instead of fetching the feed")
    ap.add_argument("--output", default=str(OUT_PATH), help="Output JSON path")
    args = ap.parse_args()
 
    try:
        xml_bytes = Path(args.input).read_bytes() if args.input else fetch(FEED_URL)
        data = parse(xml_bytes)
    except Exception as exc:  # keep the previous news.json on any failure
        print(f"error: {exc}", file=sys.stderr)
        return 1
 
    if not data["items"]:
        print("error: feed contained no items; keeping the existing file", file=sys.stderr)
        return 1
 
    write_atomic(Path(args.output), data)
    print(f"wrote {len(data['items'])} items to {args.output}")
    return 0
 
 
if __name__ == "__main__":
    sys.exit(main())
 
