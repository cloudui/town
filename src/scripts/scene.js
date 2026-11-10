// The town: sizing to the screen, drawing the static layers, and the frame loop.
//
// Layout: the town is 320x180 art pixels. On wide screens the canvas grows sideways
// and the extra space is filled with houses and trees. On tall screens (phones)
// the town fills the height and you swipe sideways to look around.

import { BW, BH, BAYER, mk, R, rng } from "./pixel.js";
import { P } from "./palette.js";
import { sprite, OBJECTS } from "./art.js";
import { state, reduceMQ, touchMQ } from "./state.js";
import { fx, setupEffects, armNeon, drawSky, drawStreet, drawWeather, drawHearts, drawFade, startFade } from "./effects.js";
import { buildHotspots, drawHover, placeTag } from "./hotspots.js";

let scroller, stage, cv, ctx, hintEl;
let bgC = null, fgC = null; // static layers: sky (behind clouds) and street

/** Draw the static layers for the current size and mode. */
function build() {
  const p = P[state.mode], night = state.mode === "night";
  const { W, H, ox, oy } = state;
  bgC = mk(W, H);
  fgC = mk(W, H);
  const b = bgC.getContext("2d"), f = fgC.getContext("2d");
  const r = rng(7);

  // sky (dithered bands)
  const horizon = oy + 124, img = b.createImageData(W, H);
  const cols = p.sky.map((h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; });
  for (let y = 0; y < H; y++) {
    const fy = Math.min(1, Math.max(0, (y - oy * 0.4) / (horizon - oy * 0.4))) * (cols.length - 1);
    const i = Math.min(cols.length - 2, Math.floor(fy)), fr = fy - i;
    for (let x = 0; x < W; x++) {
      const c = BAYER[y & 3][x & 3] < fr * 16 ? cols[i + 1] : cols[i], o = (y * W + x) * 4;
      img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255;
    }
  }
  b.putImageData(img, 0, 0);

  // sun or moon with a dithered halo
  const cx = night ? ox + 150 : ox + 206, cy = night ? oy + 28 : oy + 60, rad = night ? 7 : 9;
  for (let y = -rad - 9; y <= rad + 9; y++) for (let x = -rad - 9; x <= rad + 9; x++) {
    const d = Math.hypot(x, y), px = cx + x, py = cy + y;
    if (d > rad && d < rad + 9 && BAYER[py & 3][px & 3] < (1 - (d - rad) / 9) * 12) R(b, px, py, 1, 1, p.halo);
  }
  for (let y = -rad; y <= rad; y++) for (let x = -rad; x <= rad; x++) {
    if (x * x + y * y > rad * rad) continue;
    if (night && (x - 3) * (x - 3) + (y + 2) * (y + 2) <= 36) continue;
    R(b, cx + x, cy + y, 1, 1, night ? p.moon : p.sun);
  }

  // stars (always generated so the random sequence below stays the same)
  fx.stars = [];
  for (let i = 0; i < 90; i++) {
    const s = { x: (r() * W) | 0, y: (r() * (oy + 92)) | 0, sp: 0.001 + r() * 0.003, ph: r() * 6.28, c: r() < 0.7 ? "#f3efe0" : "#9fb0ff" };
    if (night && Math.hypot(s.x - cx, s.y - cy) > 12) { R(b, s.x, s.y, 1, 1, s.c); fx.stars.push(s); }
  }

  // far skyline
  for (let x = 0, k = 0; x < W; k++) {
    const w = 6 + ((r() * 12) | 0), h = 8 + ((r() * 26) | 0), top = oy + 120 - h;
    R(b, x, top, w, h + 8, p.far[k % 2]);
    const n = (w * h / 22) | 0;
    for (let j = 0; j < n; j++) {
      const wx = x + 1 + ((r() * (w - 2)) & ~1), wy = top + 2 + ((r() * (h - 4)) & ~1), pick = r();
      if (night && pick < 0.6) R(b, wx, wy, 1, 1, p.farWin[(pick * 6.6) | 0]);
    }
    x += w;
  }
  // near hills
  for (let x = 0; x < W; x++) {
    const top = oy + 113 + Math.round(3 * Math.sin(x * 0.045) + 2 * Math.sin(x * 0.11 + 1.3));
    R(b, x, top, 1, oy + 128 - top, p.hill);
  }

  // ground
  const base = oy + 128;
  R(f, 0, base, W, 11, p.walk); R(f, 0, base, W, 1, p.walkL);
  for (let x = ((ox % 12) + 12) % 12; x < W; x += 12) R(f, x, base, 1, 11, p.walkL);
  R(f, 0, base + 11, W, 2, p.curb); R(f, 0, base + 13, W, H - base - 13, p.road);
  for (let x = ((ox % 16) + 16) % 16; x < W; x += 16) R(f, x, oy + 160, 8, 1, p.roadL);

  // side filler (wide screens only)
  const house = (x, w) => {
    const h = 26 + ((r() * 22) | 0), wall = p.house.walls[(r() * 4) | 0], roof = p.house.roofs[(r() * 3) | 0];
    R(f, x, base - h, w, h, wall); R(f, x - 1, base - h - 3, w + 2, 3, roof);
    for (let wy = base - h + 5; wy < base - 12; wy += 9) for (let wx = x + 3; wx < x + w - 5; wx += 7) {
      const q = r();
      R(f, wx, wy, 4, 5, night ? p.house.lit[(q * 6) | 0] : p.house.win);
    }
    R(f, x + (w >> 1) - 2, base - 8, 4, 8, p.house.door);
  };
  const tree = (x) => {
    const pink = r() < 0.4, T = p.tree;
    R(f, x + 7, base - 10, 2, 10, T.trunk);
    for (let dy = -7; dy <= 6; dy++) for (let dx = -8; dx <= 8; dx++) {
      if (dx * dx / 64 + dy * dy / 49 > 1) continue;
      const px = x + 8 + dx, py = base - 17 + dy, sh = BAYER[py & 3][px & 3] < ((dx + dy + 6) / 14) * 16;
      R(f, px, py, 1, 1, pink ? (sh ? T.pinkS : T.pink) : (sh ? T.leafS : T.leaf));
    }
  };
  for (let x = ox - 3; x > -40;) { if (r() < 0.6) { const w = 22 + ((r() * 14) | 0); x -= w; house(x, w); x -= 4; } else { x -= 17; tree(x); x -= 2; } }
  for (let x = ox + BW + 3; x < W + 40;) { if (r() < 0.6) { const w = 22 + ((r() * 14) | 0); house(x, w); x += w + 4; } else { tree(x); x += 19; } }

  // street lamps
  fx.lamps = [{ x: ox + 83, y: oy + 96 }, { x: ox + 178, y: oy + 96 }];
  for (const L of fx.lamps) { R(f, L.x + 1, L.y + 3, 1, 29, p.lamp.post); R(f, L.x, L.y, 3, 3, p.lamp.post); R(f, L.x, L.y + 2, 3, 1, p.lamp.head); R(f, L.x, L.y + 30, 3, 2, p.lamp.post); }

  // buildings and friends (PNG art or code-drawn)
  for (const o of OBJECTS) {
    const s = sprite(o.id, state.mode);
    f.drawImage(s.canvas, ox + s.x, oy + s.y);
  }

  setupEffects(p);
  buildHotspots(p.outline);
}

function draw(t) {
  if (!bgC) return;
  const p = P[state.mode];
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.drawImage(bgC, 0, 0);
  drawSky(ctx, t, p);
  ctx.drawImage(fgC, 0, 0);
  drawHover(ctx);
  drawStreet(ctx, t, p);
  drawWeather(ctx, t);
  drawHearts(ctx, t);
  drawFade(ctx, t);
}

let last = 0;
function loop(t) {
  requestAnimationFrame(loop);
  if (t - last < 33) return; // ~30 fps is plenty for pixel art
  last = t;
  draw(t);
}

function layout() {
  const vw = scroller.clientWidth, vh = scroller.clientHeight;
  if (!vw || !vh) return;
  state.scrollMode = vw / vh < 1.25;
  if (state.scrollMode) {
    state.S = vh / BH; state.W = BW; state.H = BH;
  } else {
    state.S = Math.min(vh / BH, vw / BW);
    state.W = Math.max(BW, Math.ceil(vw / state.S));
    state.H = Math.max(BH, Math.ceil(vh / state.S));
  }
  state.ox = Math.floor((state.W - BW) / 2);
  state.oy = state.H - BH;

  cv.width = state.W; cv.height = state.H;
  ctx.imageSmoothingEnabled = false;
  const cw = state.W * state.S, ch = state.H * state.S;
  cv.style.width = cw + "px"; cv.style.height = ch + "px";
  stage.style.width = cw + "px"; stage.style.height = ch + "px";
  scroller.style.overflowX = state.scrollMode ? "auto" : "hidden";
  scroller.scrollLeft = (cw - vw) / 2;

  build();
  if (state.mode === "night") armNeon(-1e9);
  placeTag();
  hintEl.textContent = touchMQ.matches
    ? (state.scrollMode ? "Swipe to look around. Tap a place, tap again to go in." : "Tap a place, tap again to go in.")
    : "Hover around town. Click a place to go in.";
}

/** Switch day/night, cross-fading unless reduced motion is on. */
export function setMode(mode, animate) {
  if (mode === state.mode && bgC) return false;
  if (animate && bgC && !reduceMQ.matches) {
    const snap = mk(state.W, state.H);
    snap.getContext("2d").drawImage(cv, 0, 0);
    startFade(snap);
  }
  state.mode = mode;
  if (!bgC) return true; // first layout() will build
  build();
  if (mode === "night") armNeon(animate ? performance.now() + 250 : -1e9);
  return true;
}

export function initScene(els) {
  ({ scroller, stage, canvas: cv, hint: hintEl } = els);
  ctx = cv.getContext("2d");
  let rt = 0;
  new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(layout, bgC ? 120 : 0); }).observe(scroller);
  layout();
  requestAnimationFrame(loop);
}
