// Small pixel-drawing helpers shared by every module.

// The scene is drawn at 320x180 "art pixels" and scaled up to fit the screen.
export const BW = 320;
export const BH = 180;

// 4x4 ordered-dither matrix, used for sky gradients, halos, and tree shading.
export const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

// 3x5 pixel font for signs. Each glyph is 15 bits, row by row.
const FONT = {A:"010101111101101",B:"110101110101110",C:"011100100100011",D:"110101101101110",E:"111100110100111",F:"111100110100100",G:"011100101101011",H:"101101111101101",I:"111010010010111",J:"001001001101010",K:"101101110101101",L:"100100100100111",M:"101111111101101",N:"110101101101101",O:"010101101101010",P:"110101110100100",Q:"010101101110011",R:"110101110101101",S:"011100010001110",T:"111010010010010",U:"101101101101111",V:"101101101101010",W:"101101111111101",X:"101101010101101",Y:"101101010010010",Z:"111001010100111"," ":"000000000000000"};

export const HEART = ["01010", "11111", "01110", "00100"];

/** New offscreen canvas. */
export function mk(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/** Fill a rectangle. */
export function R(c, x, y, w, h, col) {
  c.fillStyle = col;
  c.fillRect(x, y, w, h);
}

/** Draw text in the 3x5 font at scale `sc`. */
export function txt(c, s, x, y, col, sc = 1) {
  c.fillStyle = col;
  for (let i = 0; i < s.length; i++) {
    const g = FONT[s[i]] || FONT[" "];
    for (let r = 0; r < 5; r++)
      for (let k = 0; k < 3; k++)
        if (g[r * 3 + k] === "1") c.fillRect(x + i * 4 * sc + k * sc, y + r * sc, sc, sc);
  }
}

export function textW(s, sc = 1) {
  return s.length * 4 * sc - sc;
}

export function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Seeded random numbers (mulberry32), so the town looks the same on every load. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
