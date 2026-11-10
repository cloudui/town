// Art pipeline: use public/art/{day,night}/<id>.png when it exists,
// otherwise fall back to the code-drawn sprite in sprites.js.
//
// The page is told at build time which PNGs exist (see index.astro), so missing
// files never cause 404 requests. PNGs are drawn 1:1 at their native size.
// If a PNG is a different size than expected, it is still used, anchored to the
// object's bottom-left corner so it stays on the ground, and a warning is logged.

import { mk } from "./pixel.js";
import { P } from "./palette.js";
import { OBJECTS } from "./sprites.js";

const byId = Object.fromEntries(OBJECTS.map((o) => [o.id, o]));
const images = {}; // "day/library" -> loaded <img>
const cache = {};  // "day/library" -> sprite record

/** Load every PNG listed in the manifest: { day: ["library", ...], night: [...] }. */
export async function loadArt(manifest, base = "/art/") {
  const jobs = [];
  for (const mode of ["day", "night"]) {
    for (const id of manifest[mode] || []) {
      const obj = byId[id];
      if (!obj) {
        console.warn(`art/${mode}/${id}.png doesn't match any object. Known names: ${Object.keys(byId).join(", ")}`);
        continue;
      }
      jobs.push(
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            if (img.naturalWidth !== obj.w || img.naturalHeight !== obj.h)
              console.warn(`art/${mode}/${id}.png is ${img.naturalWidth}x${img.naturalHeight}, expected ${obj.w}x${obj.h}. Using it anyway, anchored bottom-left.`);
            images[`${mode}/${id}`] = img;
            resolve();
          };
          img.onerror = () => {
            console.warn(`Couldn't load art/${mode}/${id}.png; using the code-drawn sprite.`);
            resolve();
          };
          img.src = `${base}${mode}/${id}.png`;
        }),
      );
    }
  }
  await Promise.all(jobs);
}

/**
 * The sprite for an object in a mode:
 *   canvas  the pixels
 *   mask    1 where alpha > 0 (used for hit-testing and hover outlines)
 *   x, y    top-left in scene coordinates (before the wide-screen offset)
 *   w, h    size in art pixels
 *   custom  true when it came from a PNG (code-only animations are then skipped)
 */
export function sprite(id, mode) {
  const key = `${mode}/${id}`;
  if (cache[key]) return cache[key];
  const obj = byId[id], img = images[key];
  let canvas;
  if (img) {
    canvas = mk(img.naturalWidth, img.naturalHeight);
    canvas.getContext("2d").drawImage(img, 0, 0);
  } else {
    canvas = mk(obj.w, obj.h);
    obj.draw(canvas.getContext("2d"), P[mode]);
  }
  const w = canvas.width, h = canvas.height;
  const px = canvas.getContext("2d").getImageData(0, 0, w, h).data;
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < mask.length; i++) mask[i] = px[i * 4 + 3] > 0 ? 1 : 0;
  return (cache[key] = { id, canvas, mask, w, h, x: obj.x, y: obj.y + obj.h - h, custom: !!img });
}

export { OBJECTS };
