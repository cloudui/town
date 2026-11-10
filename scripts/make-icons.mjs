// Generates the favicon set from a 16x16 pixel grid (the town cat).
//   node scripts/make-icons.mjs
// Writes public/favicon.svg, public/favicon-32.png, public/apple-touch-icon.png.
// To use your own Pixquare icon instead, export PNGs over these files and skip this.

import fs from "node:fs";
import zlib from "node:zlib";

const PALETTE = {
  X: "#3a2b26", // outline
  O: "#e8964f", // fur
  S: "#c9763a", // shade
  L: "#f6c48f", // muzzle
  E: "#2b1d14", // eyes
  N: "#e07a78", // nose / inner ear
};
const GRID = [
  "................",
  ".XX..........XX.",
  ".XOX........XOX.",
  ".XNOX......XONX.",
  ".XOOOXXXXXXOOOX.",
  "XOOOOOOOOOOOOOOX",
  "XOOOOOOOOOOOOOOX",
  "XOOEEOOOOOOEEOOX",
  "XOOEEOOOOOOEEOOX",
  "XOOOOOOLLOOOOOOX",
  "XSOOOOLNNLOOOOSX",
  "XSOOOLLLLLLOOOSX",
  ".XSOOLLLLLLOOSX.",
  "..XSSOOOOOOSSX..",
  "...XXXXXXXXXX...",
  "................",
];
for (const row of GRID) if (row.length !== 16) throw new Error(`row is ${row.length} wide: ${row}`);

// SVG: one rect per pixel, crisp edges.
const rects = [];
GRID.forEach((row, y) => [...row].forEach((ch, x) => {
  if (PALETTE[ch]) rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${PALETTE[ch]}"/>`);
}));
fs.writeFileSync(
  "public/favicon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">${rects.join("")}</svg>\n`,
);

// PNG: nearest-neighbour upscale, optional solid background and padding.
function png(size, { bg = null, pad = 0 } = {}) {
  const scale = Math.floor((size - pad * 2) / 16), off = Math.floor((size - scale * 16) / 2);
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const gx = Math.floor((x - off) / scale), gy = Math.floor((y - off) / scale);
      const ch = GRID[gy]?.[gx];
      const col = PALETTE[ch] ? [...hex(PALETTE[ch]), 255] : bg ? [...hex(bg), 255] : [0, 0, 0, 0];
      col.forEach((v, i) => (raw[y * (size * 4 + 1) + 1 + x * 4 + i] = v));
    }
  }
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

fs.writeFileSync("public/favicon-32.png", png(32));
fs.writeFileSync("public/apple-touch-icon.png", png(180, { bg: "#fbe8c5", pad: 20 }));
console.log("Wrote public/favicon.svg, public/favicon-32.png, public/apple-touch-icon.png");
