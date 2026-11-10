# echen.io: the town

A single-page pixel-art town. Buildings are links. Built with [Astro](https://astro.build), shipped as plain static files.

```sh
nvm use            # Node 24 (Astro 7 needs 22.12+)
npm install
npm run dev        # http://localhost:4321
npm run build      # -> dist/
```

## Where things live

| To change… | Edit |
| --- | --- |
| Any text: name, tagline, panel copy, links, email | `src/content/site.js` |
| Page title, description, Open Graph tags | `src/content/site.js` (`site`) and `src/pages/index.astro` |
| Colors of the UI (cards, buttons) | `src/styles/town.css` |
| Art | `public/art/{day,night}/<name>.png` (see below) |
| Photo booth prints | `public/photos/` + the `photos` list in `src/content/site.js` (see below) |

The scene code in `src/scripts/`:

| File | What it does |
| --- | --- |
| `main.js` | Boot: loads art, wires everything up |
| `scene.js` | Sizing to the screen, sky/skyline/street/side houses, frame loop |
| `sprites.js` | Code-drawn placeholder sprites + the `OBJECTS` table (positions, sizes) |
| `art.js` | PNG loading with fallback to code sprites; alpha masks |
| `effects.js` | Neon flicker, reflections, rain/petals, clouds, stars, cat tail, hearts, day/night fade |
| `hotspots.js` | Clickable shapes (from alpha), hover outlines and labels, touch tap-twice |
| `panels.js` | Opening/closing cards, focus handling, copy email |
| `theme.js` | Day/night toggle |
| `palette.js`, `pixel.js` | Colors and small drawing helpers |

## Art pipeline

Each object loads `public/art/day/<name>.png` and `public/art/night/<name>.png` if they exist. If one is missing, the code-drawn sprite is used, so you can replace art one piece (and one mode) at a time.

| name | size (px) | top-left in the 320×180 scene |
| --- | --- | --- |
| `library` | 76 × 66 | 6, 62 |
| `booth` | 22 × 42 | 86, 86 |
| `shop` | 62 × 54 | 114, 74 |
| `cart` | 40 × 46 | 182, 82 |
| `mailbox` | 10 × 16 | 226, 112 |
| `cat` | 10 × 9 | 226, 103 |
| `mall` | 80 × 70 | 238, 58 |

Exporting from Pixquare:
- Export at **1×** (no upscaling) as PNG with a **transparent background**. The page scales it up with crisp pixels.
- Transparent pixels don't count: hotspots, hover outlines, and label positions all come from the PNG's alpha.
- A PNG of a different size still works. It's anchored to the object's bottom-left so it stays on the sidewalk, and the browser console warns you.
- The mall's storefront links (GitHub, X, LinkedIn) are rectangles inside the mall: x 3, 29, 55 (each 22 wide), y 43 to 70. Keep storefronts roughly there, or edit `SPOTS` in `hotspots.js`.
- Which PNGs exist is checked at build time, so missing files never cause 404s. In `npm run dev`, just refresh after adding one.

Once an object uses a PNG, the code-only animations drawn on top of it switch off so they don't paint over your art: the shop's monitor, the cat's tail and blink, the cart's string lights, that object's neon signs, and the reading cat's glowing eye. Lamps, rain/petals, and the sky keep running. To bring a neon glow back for your art, add its sign rectangle to `NEON` in `effects.js`.

To add a new building: draw it, add a row to `OBJECTS` in `sprites.js` (a `draw` function is optional if you only ship PNGs; give it `draw: () => {}`), a hotspot in `SPOTS` in `hotspots.js`, and its text in `places` in `src/content/site.js`.

### Third-party art

During the transition it's fine to use downloaded art. Prefer CC0 or clearly licensed packs, never AI-generated images, and list anything you use here:

| File | Source | License |
| --- | --- | --- |
| _none yet_ | | |

## Photo booth

Each print needs two files in `public/photos/`, a 900px photo and a 480px thumbnail, plus an entry in `panels.photos.photos` in `src/content/site.js` (caption, longer note, alt text). Convert with `cwebp`, which also strips GPS and camera metadata:

```sh
cwebp -q 78 photo.jpg -o public/photos/name.webp
cwebp -q 75 -resize 480 0 photo.jpg -o public/photos/name-thumb.webp
```

Landscape 4:3 photos fit the frames best; other shapes are center-cropped in the thumbnail and shown whole when opened.

## Icons and link preview

- `npm run build && npm run og && npm run build` re-screenshots the town into `public/og.png` (the image shown when the link is shared). It uses your local Chrome.
- `node scripts/make-icons.mjs` regenerates the favicon from the pixel grid in that file. Or export your own `favicon.svg` / `favicon-32.png` / `apple-touch-icon.png` (180×180) into `public/`.

## Accessibility

- Every place is a real `<button>` or `<a>` in tab order; focusing one shows its label.
- Panels trap focus (the page behind is `inert`) and Escape closes them.
- With reduced motion on, rain, petals, flicker, the fade, and other animation stop; neon stays lit.
- Without JavaScript, a plain list of links is shown.

Deploying: see [DEPLOY.md](DEPLOY.md).
