# Café Pause — Operation Manual

A self-contained 3D walkthrough of a fictional retro Japanese *kissaten* (coffee house), built with Three.js. Everything renders directly in the browser — no installation required.

## Opening the scene

Open `cafe-pause-3d.html` in a modern desktop or mobile browser (Chrome, Safari, Edge, or Firefox). The page needs an internet connection on first load, since it fetches the Three.js library and the Google Fonts used in the title text. Once loaded, everything else — the room, textures, and lighting — is generated locally and needs no further network access.

A short "Brewing the coffee…" loading screen appears for a moment while the 3D engine initializes.

## Controls

| Action | Input |
|---|---|
| Look around freely | Click once, then just move the mouse — the view turns wherever you point, without holding the button down |
| Look around (fallback) | Click (or tap) and drag, if your browser doesn't allow the free-look mode above |
| Release the cursor | Press `Esc` |
| Walk forward / back | `W` / `S`, or the up/down on-screen arrow |
| Strafe left / right | `A` / `D`, or the left/right on-screen arrow |
| Walk with arrow keys | Arrow keys work identically to WASD |
| Move on touch devices | Use the on-screen directional pad in the bottom-right corner |

Clicking the scene requests full mouse-look (the browser's Pointer Lock feature): once granted, the camera turns freely from wherever you are standing, in any direction, just by moving the mouse — press `Esc` at any time to release the cursor. If the browser or the page you've embedded this in doesn't allow that (some sandboxed environments block it), the scene automatically falls back to click-and-drag looking instead, so it always works one way or the other.

The on-screen directional pad is always visible and works on both desktop and mobile — it's the most reliable way to move if a physical keyboard ever doesn't respond (for example, if the browser hasn't yet given the page keyboard focus). Clicking anywhere in the scene first will also make keyboard input more reliable.

Movement is limited to the footprint of the room — you can't walk through the exterior walls, though you can currently walk through furniture.

## What's in the scene

- A checkerboard tiled floor and dark wood wainscoting, typical of a Shōwa-era coffee house
- An L-shaped wooden counter with bar stools, a cup shelf, and two working siphon coffee brewers (their burners flicker like a real flame)
- Four Tiffany-style stained-glass pendant lamps hanging from the beamed ceiling, each with a soft flicker
- Three leather booth seats and four freestanding café tables with bentwood chairs — seven tables in total
- A night-lit window looking out on a softly glowing street, and a neon "COFFEE" sign by the entrance
- A wall clock, framed wall art, and potted plants for atmosphere

## Using it on a smartphone

The scene works on phones and tablets, with a few differences from desktop:

- **Looking around**: phones don't support the browser's Pointer Lock feature, so tapping and dragging with a finger is how you look around (the same drag control that desktop falls back to if pointer lock isn't available there either).
- **Walking**: use the on-screen directional pad in the bottom-right corner — there's no keyboard on a phone, so this is the primary way to move.
- **Two-finger operation**: because looking and walking are separate gestures, moving *and* turning at the same time takes one thumb on the pad and one finger dragging elsewhere on the screen, similar to the twin-stick controls in many mobile games.
- **Performance**: the scene renders in real time with lighting and shadows, so it runs best on phones from the last few years. Older or lower-end devices may see reduced frame rates, but the scene will still load and be usable.
- **Rotating the phone**: switching between portrait and landscape is supported — the view resizes automatically after a brief moment.

## Sharing or reusing the file

`cafe-pause-3d.html` is a single, self-contained file — you can rename it, attach it to an email, or drop it into any static web host. It has no dependencies other than the two items it loads over the network (Three.js and the Google Fonts stylesheet), so it will keep working anywhere as long as those two hosts are reachable.

## Troubleshooting

- **Blank dark screen with no controls hint fading in:** check your internet connection — the page could not download Three.js. Reload once the connection is back.
- **Movement feels stuck at the edge of the room:** this is expected — the camera is clamped to stay inside the walls.
- **Text looks like a fallback font instead of the intended serif/gothic pairing:** the Google Fonts stylesheet didn't load; the scene still works, only the title styling is affected.
