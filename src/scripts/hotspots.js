// Clickable places in town.
//
// Each place's shape comes from its sprite's alpha channel, so the clickable area,
// the hover outline, and the label position all follow the art (PNG or code-drawn).
// The <button>/<a> elements are rendered by index.astro: they sit over each place
// for keyboard focus and screen readers, but pointer input is hit-tested here
// against the pixels, so clicks on transparent corners fall through.

import { mk } from "./pixel.js";
import { sprite, OBJECTS } from "./art.js";
import { state } from "./state.js";

// `obj` is the sprite that defines the shape. `rect` (optional, in the object's local
// coordinates) narrows it to one part, like a single mall storefront.
export const SPOTS = [
  { id: "library", obj: "library" },
  { id: "booth",   obj: "booth" },
  { id: "shop",    obj: "shop" },
  { id: "cart",    obj: "cart" },
  { id: "cat",     obj: "cat" },
  { id: "mail",    obj: "mailbox" },
  { id: "mall",    obj: "mall", rect: [0, 0, 80, 43] },
  { id: "gh",      obj: "mall", rect: [3, 43, 22, 27] },
  { id: "x",       obj: "mall", rect: [29, 43, 22, 27] },
  { id: "in",      obj: "mall", rect: [55, 43, 22, 27] },
];

const objIndex = Object.fromEntries(OBJECTS.map((o, i) => [o.id, i]));
const objById = Object.fromEntries(OBJECTS.map((o) => [o.id, o]));
// Topmost first, so the cat wins over the mailbox it sits on.
const hitOrder = [...SPOTS].sort((a, b) => objIndex[b.obj] - objIndex[a.obj]);

let stage, tagEl, els = {}, geo = {}, onActivate;
let lastPT = "mouse", armed = false;

/**
 * Work out each spot's shape for the current mode: the sprite, its tight bounds
 * (sprite-local), and a hover outline. Call after the scene is rebuilt.
 */
export function buildHotspots(outlineColor) {
  geo = {};
  for (const sp of SPOTS) {
    const s = sprite(sp.obj, state.mode);
    let x0 = 0, y0 = 0, x1 = s.w, y1 = s.h;
    if (sp.rect) {
      const dy = objById[sp.obj].h - s.h; // PNGs are bottom-anchored
      const [rx, ry, rw, rh] = sp.rect;
      x0 = Math.max(0, rx); y0 = Math.max(0, ry - dy);
      x1 = Math.min(s.w, rx + rw); y1 = Math.min(s.h, ry - dy + rh);
    }
    // shrink to the opaque pixels
    let tx0 = x1, ty0 = y1, tx1 = x0, ty1 = y0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      if (!s.mask[y * s.w + x]) continue;
      if (x < tx0) tx0 = x; if (x >= tx1) tx1 = x + 1;
      if (y < ty0) ty0 = y; if (y >= ty1) ty1 = y + 1;
    }
    if (tx1 <= tx0) continue; // nothing to click
    const w = tx1 - tx0, h = ty1 - ty0;

    const crop = mk(w, h);
    crop.getContext("2d").drawImage(s.canvas, tx0, ty0, w, h, 0, 0, w, h);
    const o = mk(w + 2, h + 2), oc = o.getContext("2d");
    for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) oc.drawImage(crop, dx, dy);
    oc.globalCompositeOperation = "source-in";
    oc.fillStyle = outlineColor;
    oc.fillRect(0, 0, w + 2, h + 2);

    geo[sp.id] = { s, x0: tx0, y0: ty0, x1: tx1, y1: ty1, crop, outline: o };
  }
  positionSpots();
}

/** Scene-space box for a spot (art pixels, including the wide-screen offset). */
function sceneBox(id) {
  const g = geo[id];
  if (!g) return null;
  const x = state.ox + g.s.x + g.x0, y = state.oy + g.s.y + g.y0;
  return { x, y, w: g.x1 - g.x0, h: g.y1 - g.y0 };
}

function positionSpots() {
  const S = state.S;
  for (const sp of SPOTS) {
    const el = els[sp.id], b = sceneBox(sp.id);
    if (!el) continue;
    el.hidden = !b;
    if (!b) continue;
    el.style.left = b.x * S + "px";
    el.style.top = b.y * S + "px";
    el.style.width = b.w * S + "px";
    el.style.height = b.h * S + "px";
  }
  placeTag();
}

/** Which spot is under the pointer? `tol` widens the test for fingers. */
function hitTest(e, tol) {
  const r = stage.getBoundingClientRect();
  const px = Math.floor((e.clientX - r.left) / state.S), py = Math.floor((e.clientY - r.top) / state.S);
  for (const sp of hitOrder) {
    const g = geo[sp.id];
    if (!g) continue;
    const lx = px - (state.ox + g.s.x), ly = py - (state.oy + g.s.y);
    if (lx < g.x0 - tol || lx >= g.x1 + tol || ly < g.y0 - tol || ly >= g.y1 + tol) continue;
    for (let dy = -tol; dy <= tol; dy++) for (let dx = -tol; dx <= tol; dx++) {
      const x = lx + dx, y = ly + dy;
      if (x < g.x0 || x >= g.x1 || y < g.y0 || y >= g.y1) continue;
      if (g.s.mask[y * g.s.w + x]) return sp.id;
    }
  }
  return null;
}

/** Draw the hovered place with its outline. */
export function drawHover(ctx) {
  const b = state.hover && sceneBox(state.hover);
  if (!b) return;
  const g = geo[state.hover];
  ctx.drawImage(g.outline, b.x - 1, b.y - 1);
  ctx.drawImage(g.crop, b.x, b.y);
}

export function setHover(id) {
  state.hover = id;
  placeTag();
}

/** The little sign that floats above the hovered place. */
export function placeTag() {
  const el = state.hover && els[state.hover], b = state.hover && sceneBox(state.hover);
  if (!el || !b) { tagEl.hidden = true; return; }
  const name = el.dataset.name, p = state.pets;
  const sub = el.dataset.pet !== undefined && p ? `Petted ${p} ${p === 1 ? "time" : "times"}` : el.dataset.blurb;
  tagEl.replaceChildren(name, Object.assign(document.createElement("small"), { textContent: sub }));
  tagEl.style.left = (b.x + b.w / 2) * state.S + "px";
  tagEl.style.top = b.y * state.S + "px";
  tagEl.hidden = false;
}

/**
 * Wire up the rendered spot elements.
 * activate(id, el): open a panel or pet the cat. Links navigate on their own.
 */
export function initHotspots(stageEl, tag, activate) {
  stage = stageEl;
  tagEl = tag;
  onActivate = activate;

  for (const el of stage.querySelectorAll("[data-spot]")) {
    const id = el.dataset.spot;
    els[id] = el;
    el.addEventListener("focus", () => setHover(id));
    el.addEventListener("blur", () => { if (state.hover === id && lastPT !== "touch") setHover(null); });
    // Keyboard, screen readers, and the forwarded pointer clicks below all land here.
    el.addEventListener("click", () => onActivate(id, el));
  }

  stage.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const id = hitTest(e, 0);
    if (id !== state.hover) setHover(id);
    stage.style.cursor = id ? "pointer" : "";
  });
  stage.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse" && state.hover && !els[state.hover]?.matches(":focus")) setHover(null);
  });
  stage.addEventListener("pointerdown", (e) => {
    lastPT = e.pointerType;
    const id = hitTest(e, lastPT === "touch" ? 2 : 0);
    armed = !!id && state.hover === id;
    if (!id) setHover(null);
  });
  stage.addEventListener("click", (e) => {
    if (e.target.closest("[data-spot]")) return; // already handled by the element itself
    const id = hitTest(e, lastPT === "touch" ? 2 : 0);
    if (!id) return;
    const el = els[id];
    // On touch, the first tap shows the label and the second tap goes in.
    if (lastPT === "touch" && !armed && el.dataset.pet === undefined) {
      setHover(id);
      armed = true;
      return;
    }
    lastPT = "mouse";
    el.click(); // follows the link or runs activate()
  });
}
