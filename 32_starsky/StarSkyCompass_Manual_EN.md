# Star Sky Compass — User Manual

Star Sky Compass is a browser-based planetarium. Pick a place on Earth, a date and time, and a direction to look, and it draws the sky exactly as it would appear from there — stars, constellations, the Sun, the Moon, and the five naked-eye planets — including whether it would actually be light or dark out at that moment.

It runs entirely in your browser: `starsky_en.html` (this English build) and `starsky_ja.html` (a Japanese-language build with the same features) are both self-contained files. Double-click either one to open it — no installation, account, or internet connection required after the page loads.

## Quick start

Open the file. You'll see the night sky over Tokyo, facing north, right now. From there:

- **Drag anywhere on the sky** to look around, the way you'd turn your head. Scroll (or pinch, on a trackpad) to zoom in and out.
- Open the **Location** panel to jump to a different place, either through the city dropdown or by typing latitude and longitude directly.
- Open **Date & Time** to move to a different moment — a specific eclipse, a birthday, next week, or a thousand years from now.

Everything else below fills in the details.

## Location

- **Preset** — a dropdown of sample cities across a range of latitudes, from Naha to the South Pole. Picking one sets latitude and longitude for you.
- **Latitude / Longitude** — type exact coordinates for any point on Earth. Latitude is positive north of the equator, negative south. Longitude is positive east of Greenwich, negative west.
- **Use My Location** — asks your browser for your current GPS or network-based location and fills in the coordinates automatically. Your browser will prompt for permission; if it's denied or unavailable, enter coordinates manually instead.

## Date & Time

The date/time field uses **your computer's own clock and timezone**. That's deliberate: whatever moment you set is a real, single instant in universal time, and the app then shows what that instant looks like from wherever you've set the location — the same way "what does the sky look like over Paris right now" has one correct answer no matter where you are when you ask it. If you want to explore a different place's local evening, remember to convert to your own timezone first (e.g., 7 PM in Paris is a different clock time where you are).

- **Now** — jumps back to the current moment.
- **−1h / +1h / −1d / +1d** — step backward or forward by an hour or a day, useful for watching how the sky shifts.
- **Live** — advances the clock continuously (30 simulated seconds per real second) so you can watch the sky slowly turn, and the Sun rise or set, in real time.

The app accepts any date your browser's date picker allows, from the distant past to the distant future. Accuracy is best within a few decades of the present (see **Accuracy notes** below).

## Viewing direction

There are three ways to change where you're looking, and they all stay in sync:

1. **Drag on the sky** — the most direct way. Drag left/right to pan around the horizon, up/down to tilt your view.
2. **The compass dial** — click or drag inside the circular dial to set azimuth (the compass direction you're facing) directly.
3. **The sliders** — fine-grained numeric control over:
   - **Azimuth** — compass direction, 0° = North, 90° = East, 180° = South, 270° = West.
   - **Altitude** — how far up you're looking, from −30° (slightly below the horizon) to 90° (straight up, the zenith).
   - **Field of view (FOV)** — how wide a slice of sky is shown at once, from a narrow 30° (binocular-like) to a wide 170° (fisheye). Scrolling on the sky also adjusts this.

Quick buttons jump straight to **Zenith** (straight up), **Horizon** (level), or the four cardinal directions **N / E / S / W**.

## Reading the sky

- **Stars** are colored by their actual temperature — bluish-white for hot stars, orange-red for cool ones — and sized by brightness. Only stars actually bright enough to see under the current sky brightness are drawn, so daytime shows none, twilight shows a handful of the brightest, and full night shows thousands.
- **Constellation lines and names** connect and label the 88 official constellations. They're always drawn as a reference (dimmed during the day, since you couldn't really see them then), and constellation names hide automatically at wide fields of view to avoid clutter.
- **The ground** — the lower half of your view, below the horizon, is filled in as solid ground, just as it would be if you were standing outside. Turn it off in Display if you'd rather see the full celestial sphere.
- **The sky color itself** changes with the Sun's position: blue by day, shifting through orange and purple at sunset and sunrise, deep blue through the three stages of twilight (civil, nautical, astronomical), and black at full night. The status readout at the top names the current state.
- **The Sun** is drawn as a glowing disc whenever it's near or above the horizon.
- **The Moon** is drawn with an actual crescent or gibbous shape matching its real phase for the date you've chosen, along with its percentage illumination and whether it's waxing or heading toward waning.
- **Planets** (Mercury, Venus, Mars, Jupiter, Saturn) appear as colored dots at their true positions for the date.

## The readout strip

Across the top of the sky view:

- **Sidereal time** — the local sidereal time, a clock that astronomers use to track which stars are on the meridian; mostly of interest if you already know what it's for.
- **Sun altitude** and the current light state (Day / Civil twilight / Nautical twilight / Astronomical twilight / Night).
- **Moon illumination** — the percentage of the Moon's disc that's lit, and whether it's waxing or waning.
- **View az / alt / FOV** — exactly where you're currently looking and how wide the view is.

## Display options

- **Constellation lines** / **Constellation names** — toggle the star-pattern overlays independently.
- **Alt/Az grid** — a faint reference grid of altitude circles and azimuth lines, useful if you want to read off exact coordinates.
- **Show ground** — toggle the horizon silhouette on or off.

## Accuracy notes

This app calculates real astronomical positions rather than using pre-rendered images, so it works for any date, any place. A few notes on precision:

- **Stars**, corrected for precession, are accurate to a small fraction of a degree for dates within a century or so of today.
- **The Sun's** position is accurate to about 0.01°.
- **The Moon's** position is accurate to a few arcminutes (well within the width of the Moon's own disc).
- **Planets** use compact orbital approximations accurate to roughly an arcminute for several decades around the present; over centuries the error grows gradually.

None of this affects what the naked eye would notice — the app is built for realistic sky-watching and learning, not telescope pointing.

## Tips

- To recreate "the sky I saw last night," set the date/time to when you actually looked up, and your real coordinates.
- To see a full sweep of the sky at once, set a wide FOV (150°–170°) and Altitude around 30–50°.
- To watch a sunset or moonrise happen, position the view toward the right horizon direction, then press Live and let time run forward from a bit earlier.
- Your last location and viewing direction are remembered in the browser for next time you open the same file.
