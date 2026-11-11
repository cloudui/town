// Moving parts drawn every frame: twinkling stars, drifting clouds, neon signs that
// flicker on at night, wet-road reflections, petals by day and rain by night,
// the kernel-shop monitor and chimney smoke, the town cat's tail, cart string lights, and hearts.
//
// Effects tied to a code-drawn sprite (the monitor, the cat's tail, sign positions)
// switch off for an object once you give it a PNG, so they never paint over your art.

import { R, HEART, textW, rgba, rng } from "./pixel.js";
import { sprite } from "./art.js";
import { OBJECTS, MALL_STORES } from "./sprites.js";
import { state, reduceMQ } from "./state.js";

export const fx = {
  stars: [],       // set by scene.js while drawing the sky
  lamps: [],       // set by scene.js
  clouds: [],
  parts: [],
  signs: [],
  reflections: [],
  hearts: [],
  fade: null,
};

// Neon signs in each object's local coordinates. `reflect` signs shimmer on the wet road.
const NEON = {
  library: (p) => [{ x: 24, y: 10, w: 27, h: 5, col: "#ffb347", off: p.lib.sign, reflect: true }],
  booth: (p) => [{ x: 1, y: 1, w: 19, h: 5, col: "#ff4fa3", off: p.booth.sign, reflect: true }],
  shop: (p) => [{ x: 17, y: 13, w: 27, h: 5, col: "#3ff0ff", off: p.shop.sign, reflect: true }],
  cart: (p) => [{ x: 8, y: 31, w: 23, h: 5, col: "#ff4fa3", off: p.cart.body, reflect: true }],
  mall: (p) => [
    { x: 25, y: 10, w: 30, h: 10, col: "#ff4fa3", off: p.mall.sign, reflect: true },
    ...MALL_STORES.map((lab, i) => ({
      x: 3 + i * 26 + Math.floor((22 - textW(lab)) / 2), y: 44, w: textW(lab), h: 5,
      col: p.mall.awnT[i], off: p.mall.awn[i],
    })),
  ],
};

/** The sprite for `id` if it's code-drawn, or null if it came from a PNG. */
function coded(id) {
  const s = sprite(id, state.mode);
  return s.custom ? null : s;
}

/** Rebuild per-mode effect state. Called by scene.build(). */
export function setupEffects(p) {
  const { ox, oy, W, mode } = state;
  const night = mode === "night";

  fx.signs = [];
  fx.reflections = [];
  if (night) {
    for (const o of OBJECTS) {
      const s = coded(o.id);
      if (!s || !NEON[o.id]) continue;
      for (const n of NEON[o.id](p)) {
        const sign = { ...n, x: ox + s.x + n.x, y: oy + s.y + n.y, onAt: 0, sputter: 0 };
        fx.signs.push(sign);
        if (n.reflect) fx.reflections.push({ x: sign.x, w: sign.w, col: sign.col });
      }
    }
    for (const L of fx.lamps) fx.reflections.push({ x: L.x, w: 3, col: "#ffd38a" });
  }

  // Clouds keep drifting across rebuilds unless the canvas width changed.
  if (!fx.clouds.length || fx.clouds.W !== W) {
    const cr = rng(3);
    fx.clouds = [];
    for (let i = 0; i < 5; i++) fx.clouds.push({ x: cr() * W, y: (cr() * (oy + 50)) | 0, v: 0.03 + cr() * 0.05, s: cr() < 0.5 });
    fx.clouds.W = W;
  }

  fx.parts = [];
  const n = night ? Math.round(W * 0.35) : Math.round(W * 0.09);
  for (let i = 0; i < n; i++) fx.parts.push(newPart(true));
}

function newPart(anywhere) {
  const { W, H } = state;
  return state.mode === "night"
    ? { x: Math.random() * (W + 40), y: anywhere ? Math.random() * H : -4, v: 2.4 + Math.random() * 1.4 }
    : { x: Math.random() * W - 20, y: anywhere ? Math.random() * H : -2, v: 0.18 + Math.random() * 0.2, ph: Math.random() * 6.28, c: Math.random() < 0.5 ? "#f4b6c6" : "#fbd3dc", w: Math.random() < 0.4 ? 2 : 1 };
}

/** Schedule the neon signs to buzz on one after another, starting at t0. */
export function armNeon(t0) {
  fx.signs.forEach((s, i) => { s.onAt = t0 + 120 * i + Math.random() * 280; s.sputter = 0; });
}

function signOn(s, t) {
  if (reduceMQ.matches) return true;
  if (t < s.onAt) return false;
  if (t < s.onAt + 380) return Math.random() > 0.4;
  if (t < s.sputter) return Math.random() > 0.5;
  return true;
}

function glow(ctx, x, y, r, col, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a));
  g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** Behind the street: twinkling stars at night, drifting clouds by day. */
export function drawSky(ctx, t, p) {
  const still = reduceMQ.matches;
  if (state.mode === "night") {
    if (!still) for (const s of fx.stars) if (Math.sin(t * s.sp + s.ph) > 0.75) R(ctx, s.x, s.y, 1, 1, p.sky[1]);
    return;
  }
  for (const c of fx.clouds) {
    if (!still) { c.x += c.v; if (c.x > state.W + 4) c.x = -30; }
    const x = Math.round(c.x), y = c.y;
    if (c.s) { R(ctx, x + 4, y, 10, 2, p.cloud); R(ctx, x + 1, y + 2, 18, 3, p.cloud); R(ctx, x, y + 5, 22, 2, p.cloudS); }
    else { R(ctx, x + 6, y, 8, 2, p.cloud); R(ctx, x + 2, y + 2, 20, 2, p.cloud); R(ctx, x, y + 4, 26, 2, p.cloud); R(ctx, x + 1, y + 6, 24, 1, p.cloudS); }
  }
}

/** On top of the street: reflections, little animations, neon, and glows. */
export function drawStreet(ctx, t, p) {
  const { ox, oy, H } = state, night = state.mode === "night", still = reduceMQ.matches;

  // wet-road reflections
  if (night) {
    const top = oy + 143;
    for (const s of fx.reflections) for (let y = top; y < H; y++) {
      if (((y + ((t / 140) | 0)) % 3) === 0) continue;
      const k = (y - top) / (H - top), wob = still ? 0 : Math.round(Math.sin(y * 0.9 + t / 280));
      ctx.globalAlpha = 0.4 * (1 - k);
      R(ctx, s.x + wob, y, s.w, 1, s.col);
    }
    ctx.globalAlpha = 1;
  }

  // the kernel monitor: a little throughput chart
  const shop = coded("shop");
  let mx = 0, my = 0;
  if (shop) {
    mx = ox + shop.x + 7; my = oy + shop.y + 25;
    R(ctx, mx, my, 18, 12, p.shop.screen);
    for (let i = 0; i < 5; i++) { const h = still ? 4 + i : 2 + Math.round(4.5 + 4.5 * Math.sin(t / 420 + i * 0.9)); R(ctx, mx + 2 + i * 3, my + 11 - h, 2, h, p.shop.screenFg); }
    if (((t / 500) | 0) % 2 || still) R(ctx, mx + 16, my + 1, 1, 2, p.shop.screenFg);
  }

  // chimney smoke while the works are running; the fire's out at night
  if (shop && !night) {
    const sx = ox + shop.x + 48, sy = oy + shop.y;
    for (let i = 0; i < 6; i++) {
      const k = still ? (i + 0.5) / 6 : (t / 4200 + i / 6) % 1; // 0 = just out, 1 = gone
      const size = 2 + Math.floor(k * 4);
      const x = sx + Math.round(k * k * 12 + Math.sin(k * 6 + i * 2.4) * 1.5) - (size >> 1);
      const y = sy - Math.round(k * 26) - size;
      ctx.globalAlpha = Math.min(1, 1.6 * (1 - k));
      R(ctx, x, y, size, size, p.shop.smokeS);
      R(ctx, x, y, size, size - 1, p.shop.smoke);
    }
    ctx.globalAlpha = 1;
  }

  // town cat: tail and blink
  const cat = coded("cat");
  let kx = 0, ky = 0, blink = false;
  if (cat) {
    kx = ox + cat.x; ky = oy + cat.y;
    const K = p.cat, k = still ? 1 : Math.round(1 + Math.sin(t / 350));
    R(ctx, kx + 8, ky + 7, 2, 1, K.fur); R(ctx, kx + 9, ky + 4 + k, 1, 3 - k, K.fur);
    blink = !still && (t % 4300) < 140;
    if (blink) { R(ctx, kx + 3, ky + 2, 1, 1, K.fur); R(ctx, kx + 6, ky + 2, 1, 1, K.fur); }
  }

  // cart string lights
  const cart = coded("cart"), bulbs = [];
  if (night && cart) {
    const x0 = ox + cart.x, y = oy + cart.y + 10;
    for (let i = 0, x = x0 + 1; x < x0 + 39; x += 4, i++) {
      const on = still || ((i + ((t / 450) | 0)) % 3) !== 0, col = i % 2 ? "#ffb347" : "#ff4fa3";
      R(ctx, x, y, 1, 1, on ? col : p.cart.umbB);
      if (on) bulbs.push([x + 0.5, y + 0.5, col]);
    }
  }

  if (!night) return;

  // neon on/off
  const lit = [];
  if (!still && Math.random() < 0.004 && fx.signs.length) fx.signs[(Math.random() * fx.signs.length) | 0].sputter = t + 260;
  for (const s of fx.signs) { if (signOn(s, t)) lit.push(s); else R(ctx, s.x, s.y, s.w, s.h, s.off); }

  // glows
  ctx.globalCompositeOperation = "lighter";
  for (const L of fx.lamps) { glow(ctx, L.x + 1.5, L.y + 2, 16, "#ffb347", 0.38); glow(ctx, L.x + 1.5, oy + 134, 12, "#ffb347", 0.14); }
  for (const s of lit) glow(ctx, s.x + s.w / 2, s.y + s.h / 2, Math.max(s.w, s.h) * 0.75 + 5, s.col, 0.34);
  if (shop) glow(ctx, mx + 9, my + 6, 16, "#3ff0ff", 0.22);
  for (const [x, y, c] of bulbs) glow(ctx, x, y, 4, c, 0.4);
  if (cat && !blink) { glow(ctx, kx + 3.5, ky + 2.5, 3, "#ffd84a", 0.6); glow(ctx, kx + 6.5, ky + 2.5, 3, "#ffd84a", 0.6); }
  const lib = coded("library");
  if (lib) glow(ctx, ox + lib.x + 28.5, oy + lib.y + 48.5, 3, "#3ff0ff", 0.4); // reading cat's eye
  ctx.globalCompositeOperation = "source-over";
}

/** Petals by day, rain by night. Off with reduced motion. */
export function drawWeather(ctx, t) {
  if (reduceMQ.matches) return;
  const night = state.mode === "night", { W, H } = state;
  for (let i = 0; i < fx.parts.length; i++) {
    const q = fx.parts[i];
    if (night) { q.y += q.v; q.x -= q.v * 0.25; ctx.globalAlpha = 0.45; R(ctx, q.x | 0, q.y | 0, 1, 3, "#7fa8ff"); }
    else { q.y += q.v; q.x += 0.15 + Math.sin(q.ph + t / 700) * 0.2; R(ctx, q.x | 0, q.y | 0, q.w, 1, q.c); }
    if (q.y > H || q.x > W + 4 || q.x < -44) fx.parts[i] = newPart(false);
  }
  ctx.globalAlpha = 1;
}

/** A heart floats up from the cat when it's petted. */
export function addHeart() {
  const c = sprite("cat", state.mode);
  fx.hearts.push({ x: state.ox + c.x + 2 + ((Math.random() * 4) | 0), y: state.oy + c.y - 4, t0: performance.now() });
}

export function drawHearts(ctx, t) {
  fx.hearts = fx.hearts.filter((h) => t - h.t0 < 1300);
  const col = state.mode === "night" ? "#ff4fa3" : "#e9737f";
  for (const h of fx.hearts) {
    const y = Math.round(h.y - (t - h.t0) / 70);
    ctx.globalAlpha = 1 - (t - h.t0) / 1300;
    HEART.forEach((row, ry) => { for (let rx = 0; rx < 5; rx++) if (row[rx] === "1") R(ctx, h.x + rx, y + ry, 1, 1, col); });
  }
  ctx.globalAlpha = 1;
}

/** Cross-fade from a snapshot of the old scene when switching day/night. */
export function startFade(snapshot) {
  fx.fade = { cv: snapshot, t0: performance.now() };
}

export function drawFade(ctx, t) {
  if (!fx.fade) return;
  const a = 1 - (t - fx.fade.t0) / 650;
  if (a <= 0) { fx.fade = null; return; }
  ctx.globalAlpha = a;
  ctx.drawImage(fx.fade.cv, 0, 0);
  ctx.globalAlpha = 1;
}
