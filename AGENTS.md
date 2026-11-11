# echen.io: the town

Eric Chen's homepage: a single-page pixel-art street where each building is a link or opens a card. Astro 7, no UI framework, shipped as static files to GitHub Pages. `README.md` is the owner-facing manual (art sizes, photo conversion, icons); `DEPLOY.md` covers domains. Keep both current when you change what they describe.

## Commands

```sh
nvm use            # Node 24 (.nvmrc). The default shell Node may be older; Astro 7 needs 22.12+
npm run dev        # http://localhost:4321
npm run build      # runs `npm run books` first, then builds to dist/
npm run books      # refresh src/content/books.json from the live blog
npm run og         # re-screenshot public/og.png from dist/ (needs local Chrome)
```

There are no tests or linters. Verify changes by building and looking at the page in both day and night mode, at a desktop size and a phone size. `scripts/og-image.mjs` shows how to drive headless Chrome over the DevTools protocol with no extra packages, if you need screenshots.

## How it fits together

- **Content** is all in `src/content/site.js` (name, links, `places`, `panels`, `directory`). Text changes belong there, not in components.
- **Markup**: `src/pages/index.astro` renders the HUD, one invisible `<button>`/`<a>` per place (for keyboard and screen readers), and `src/components/Panels.astro`, which renders every panel into a `<template id="t-<name>">`. `panels.js` clones the right template into the card.
- **Scene**: one `<canvas>` drawn at 320×180 "art pixels" and scaled up with crisp pixels. `scene.js` builds two static layers per mode (sky, street) and runs a ~30 fps loop that draws animated effects from `effects.js` on top.
- **Sprites**: each street object is a row in `OBJECTS` (`sprites.js`) with a code-drawn `draw(ctx, palette)` function in its own local coordinates. A PNG at `public/art/{day,night}/<id>.png` replaces the code-drawn version for that mode (`art.js`), bottom-left anchored.
- **Hotspots**: `hotspots.js` derives click areas, hover outlines, and label positions from each sprite's alpha mask. Pointer input is hit-tested against pixels; the DOM elements only handle focus and activation.
- **Job signs**: `panels.work.jobs` in `site.js` renders as signs on a string in the Kernel works panel, with pixel logos drawn from character grids in `src/content/logos.js` by `PixelLogo.astro`. They share `picker.js` and the stacked `.blurbs` box with the bookshelf: every blurb sits in one grid cell so the box keeps the height of the tallest. Don't swap text into a single blurb; that makes the card jump.
- **Modes**: "day" and "night" follow the system color scheme until the toggle sets `data-theme` on `<html>` (`theme.js`). Canvas colors come from `P.day` / `P.night` in `palette.js`; UI colors are CSS variables in `town.css`. `theme.js` also sets `data-mode="day|night"` on `<html>` for the mode actually showing; use `[data-mode="night"]` when a component needs a different look at night (the job signs turn neon), rather than duplicating rules for the media query and `data-theme`.
- **Library shelf**: `scripts/sync-books.mjs` scrapes the five newest posts from blog.echen.io's front page into `src/content/books.json` (committed, used as the fallback when the fetch fails). `picker.js` handles hover/focus/tap on the books. The blog's source is a separate Hugo repo, usually checked out at `../blogstack`; this repo never reads it directly.

## Rules that are easy to break

- **Coordinates are coupled.** If you move or resize a sprite, also update: its `OBJECTS` row, anything in `effects.js` positioned relative to it (`NEON` sign rectangles, the shop monitor and chimney smoke, cat tail, cart lights, the reading cat's eye), `SPOTS` rects in `hotspots.js` (mall storefronts), and the size table in `README.md`. Objects stand on the sidewalk at y = 128, so `y + h` should stay 128.
- **Effects tied to code-drawn art must go through `coded(id)`** in `effects.js`, so they switch off when the owner supplies a PNG for that object.
- **Every color goes in `palette.js` for both modes.** Don't hardcode a color in a sprite; night is a full neon repaint, not a darkened day.
- **Respect reduced motion.** Anything animated checks `reduceMQ.matches` and draws a sensible still frame. CSS transitions get a `prefers-reduced-motion` override.
- **Keep it deterministic.** Static layers use the seeded `rng()` from `pixel.js`; adding or removing `r()` calls in `scene.js` reshuffles everything drawn after them. `Math.random()` is only for per-frame effects.
- **Adding a place** means four edits: sprite + `OBJECTS` row, `SPOTS` entry, `places` entry (key must match the spot id), and a panel in `panels` if it opens one. The 320px street is full; a new building needs room made for it.
- **Paths must honor the base path.** The site is served from a subpath on GitHub Pages until the custom domain is switched. Build URLs from `import.meta.env.BASE_URL` (see `Panels.astro`), never a leading `/`.
- **Accessibility is part of the design**: panels trap focus via `inert`, Escape closes, everything reachable by keyboard, and touch uses "tap to preview, tap again to enter". New interactive pieces should follow the same pattern.
- **No AI-generated images** in `public/art` or `public/photos`. Third-party art must be licensed and listed in the README table.
- **No new dependencies** without asking. The scripts in `scripts/` deliberately use only Node built-ins.

## Style

Plain modern JS modules, terse but commented: each file opens with a short comment saying what it owns, and non-obvious lines get a "why" comment. Pixel drawing uses the `R(ctx, x, y, w, h, color)` and `txt()` helpers. Copy on the site is first person, short, and plain; no em dashes.

## Deploy

Pushing to `main` builds and publishes via `.github/workflows/deploy.yml`, which also runs weekly so new blog posts reach the Library shelf. Don't commit or push unless asked.
