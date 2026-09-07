# Penny Packer 16 — User Manual

## Overview

Penny Packer 16 is an interactive, browser-based puzzle. The goal is to arrange 16 identical circular "coins" inside a quarter-circle (90°) sector so that all 16 coins fit entirely within the sector without overlapping one another. It's a visual take on a classic circle-packing problem.

## Opening the App

The app is a single self-contained HTML file (`index.html`). Just double-click it, or open it in any modern browser (Chrome, Firefox, Safari, Edge). No installation or internet connection is required.

## Screen Layout

- **Left — Canvas (600×600):** shows the quarter-circle sector (light-blue fill with a blue outline, its corner at the bottom-left, and a red dot marking the origin) plus light grid lines every 50 pixels (1 unit) for reference. The 16 numbered coins are drawn on top.
- **Right — Control panel:**
  - **Status box** — shows how many of the 16 coins are currently valid (fully inside the sector and not overlapping any other coin)
  - **Coin Radius** slider — sets the size of every coin (10–50 px, default 25)
  - **Sector Radius** slider — sets the size of the quarter circle (100–400 px, default 200)
  - **Color legend**
  - **Six action buttons**
  - A scrolling **log / output** panel

## How to Play

1. Coins start arranged in a 4×4 grid near the corner of the sector.
2. Click and hold a coin, drag it to a new position, and release the mouse button to drop it.
3. Watch each coin's color: **green** = valid, **orange** = overlapping another coin, **red** = partly outside the sector.
4. Rearrange all 16 coins until the status box reads "16/16 Valid" — that's a solved layout.
5. Moving either slider immediately re-scores every coin, since a coin that's valid at one sector size may become invalid at another.

## Color Legend

| Color | Meaning |
|---|---|
| Green | Valid — inside the sector, no overlap |
| Orange | Overlapping another coin |
| Red | Outside the sector's boundary (a straight edge or the arc) |

## Controls Reference

### Sliders

- **Coin Radius** (10–50, step 1, default 25): the radius of every coin, in pixels. Larger coins are harder to fit.
- **Sector Radius** (100–400, step 1, default 200): the radius of the quarter circle, in pixels. A larger sector gives more room to work with.

### Buttons

- **Reset Positions** — returns all 16 coins to the initial 4×4 grid layout.
- **Check Solution** — prints a text summary (valid count, current radii, pass/fail) to the log panel below.
- **Save Config** — prompts for a name and stores the current coin positions, radii, and valid count in the browser's memory (not written to disk). You can save multiple named configurations.
- **Load Config** — lists previously saved configuration names and restores the one you choose.
- **Randomize** — scatters all 16 coins to random positions (useful for experimenting; unlikely to produce a valid layout on its own).
- **Export JSON** — prints the current configuration as JSON to the log panel and copies it to your clipboard.

## Notes and Tips

- Coordinates use logical units where 1 unit = 50 pixels (the `scale` constant). The origin (0, 0) is the sector's corner, marked with a red dot.
- Save Config / Load Config only persist for the current browser tab session — reloading the page clears them. Use **Export JSON** if you want a record outside the browser (paste the copied JSON into a text file to keep it).
- A coin counts as "inside" the sector only if the *entire circle* — center plus radius — fits within both straight edges and the arc. A coin whose center is inside but which pokes past an edge or the arc will still show red.
- There is no server component, and no data is ever transmitted — everything runs locally in your browser tab.

## Troubleshooting

- **Dragging doesn't work:** make sure you click and hold directly on a coin; clicking empty canvas space does nothing.
- **"Load Config" says no configurations exist:** you need to use Save Config at least once first, within the same browser session.
- **Export JSON's clipboard copy fails:** some browsers block clipboard access if the page doesn't have focus or the right permissions. The JSON is always printed in the log panel as well, so you can copy it from there manually.
