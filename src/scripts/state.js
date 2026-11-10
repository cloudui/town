// Shared, mutable scene state. Everything is in art pixels unless noted.

import { BW, BH } from "./pixel.js";

export const state = {
  W: BW,          // canvas width (wider than 320 on wide screens)
  H: BH,          // canvas height
  S: 4,           // CSS pixels per art pixel
  ox: 0,          // where the 320x180 town starts inside the canvas
  oy: 0,
  scrollMode: false, // phone/portrait: town is taller than the screen is wide, swipe sideways
  mode: "day",    // "day" | "night"
  hover: null,    // id of the hotspot being hovered or focused
  pets: 0,
};

export const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
export const touchMQ = matchMedia("(hover: none)");
