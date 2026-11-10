// Code-drawn placeholder sprites, and the table of objects that sit on the street.
// Each sprite draws in its own local coordinates (0,0 = top-left of the object).
// Any of these can be replaced by a PNG; see art.js.

import { R, txt, textW, rng } from "./pixel.js";

function sLibrary(c, p) {
  const L = p.lib, G = p.gcat;
  for (let i = 0; i < 10; i++) { const hw = Math.round(6 + i * 32 / 9); R(c, 38 - hw, i, hw * 2, 1, i === 9 ? L.roofS : L.roof); }
  R(c, 2, 10, 72, 6, L.shade);
  R(c, 22, 9, 32, 7, L.sign); txt(c, "LIBRARY", 24, 10, L.signT);
  R(c, 4, 16, 68, 40, L.wall);
  R(c, 30, 30, 16, 26, L.door); R(c, 32, 28, 12, 2, L.door); R(c, 34, 27, 8, 1, L.door); R(c, 37, 30, 2, 26, L.doorS);
  for (const wx of [13, 57]) { R(c, wx - 1, 21, 6, 14, L.shade); R(c, wx, 22, 4, 12, L.win); R(c, wx, 27, 4, 1, L.shade); }
  for (const cx of [6, 18, 50, 62]) { R(c, cx - 1, 16, 8, 2, L.col); R(c, cx, 18, 6, 36, L.col); R(c, cx + 4, 18, 2, 36, L.colS); R(c, cx - 1, 54, 8, 2, L.colS); }
  R(c, 10, 56, 56, 3, L.col); R(c, 10, 58, 56, 1, L.colS);
  R(c, 6, 59, 64, 3, L.col); R(c, 6, 61, 64, 1, L.colS);
  R(c, 2, 62, 72, 4, L.col); R(c, 2, 65, 72, 1, L.colS);
  // grey cat reading on the steps
  R(c, 19, 55, 3, 1, G.furS); R(c, 21, 53, 1, 3, G.fur); R(c, 22, 51, 6, 5, G.fur); R(c, 22, 54, 6, 1, G.furS);
  R(c, 25, 47, 5, 4, G.fur); R(c, 25, 46, 1, 1, G.fur); R(c, 29, 46, 1, 1, G.fur); R(c, 28, 48, 1, 1, G.eye);
  R(c, 29, 50, 4, 4, G.book); R(c, 30, 50, 2, 1, G.page); R(c, 28, 52, 1, 1, G.fur);
}

function sBooth(c, p) {
  const B = p.booth;
  R(c, 0, 0, 22, 7, B.sign); txt(c, "PHOTO", 1, 1, B.signT);
  R(c, 0, 7, 22, 33, B.body); R(c, 19, 7, 3, 33, B.shade); R(c, 2, 9, 10, 1, B.shade);
  R(c, 2, 10, 10, 28, B.cur); for (const x of [4, 7, 10]) R(c, x, 10, 1, 28, B.curS);
  R(c, 14, 12, 4, 15, B.paper); R(c, 15, 13, 2, 3, B.frame); R(c, 15, 17, 2, 3, B.frame); R(c, 15, 21, 2, 3, B.frame);
  R(c, 14, 30, 4, 2, B.shade);
  R(c, 1, 40, 2, 2, B.feet); R(c, 19, 40, 2, 2, B.feet);
}

function sShop(c, p) {
  const S = p.shop, r = rng(11);
  R(c, 1, 3, 60, 51, S.wall); R(c, 0, 0, 62, 3, S.trim);
  for (let i = 0; i < 22; i++) R(c, 2 + (r() * 55 | 0), 13 + (r() * 38 | 0), 3, 1, S.shade);
  R(c, 15, 4, 32, 7, S.sign); txt(c, "KERNELS", 17, 5, S.signT);
  for (let x = 3; x < 29; x++) R(c, x, 12, 1, 3, (x >> 1) % 2 ? S.awnA : S.awnB);
  R(c, 3, 15, 26, 1, S.shade);
  R(c, 5, 16, 22, 16, S.trim); R(c, 7, 17, 18, 12, S.screen); R(c, 6, 31, 20, 1, S.shade);
  R(c, 31, 21, 28, 1, S.trim); R(c, 32, 22, 26, 32, S.door);
  for (let y = 28; y < 54; y += 3) R(c, 32, y, 26, 1, S.doorL);
  R(c, 32, 22, 26, 5, S.dark);
  R(c, 27, 46, 5, 3, S.leaf); R(c, 28, 49, 3, 5, S.pot);
}

function sCart(c, p) {
  const C = p.cart, hw = [4, 8, 11, 13, 15, 16, 17, 18, 19, 20];
  for (let i = 0; i < 10; i++) for (let x = 20 - hw[i]; x < 20 + hw[i]; x++) R(c, x, i, 1, 1, Math.floor(x / 5) % 2 ? C.umbA : C.umbB);
  for (let x = 0; x < 40; x++) if (x % 5 < 3) R(c, x, 10, 1, 1, Math.floor(x / 5) % 2 ? C.umbA : C.umbB);
  R(c, 19, 11, 2, 17, C.pole);
  [6, 12, 26].forEach((x, i) => { R(c, x - 1, 19, 5, 3, C.scoops[i]); R(c, x, 18, 3, 1, C.scoops[i]); R(c, x, 22, 3, 2, C.cone); R(c, x + 1, 24, 1, 3, C.cone); });
  R(c, 2, 27, 36, 2, C.shade); R(c, 4, 29, 32, 11, C.body); R(c, 4, 38, 32, 2, C.shade);
  txt(c, "SCOOPS", 8, 31, C.text);
  for (const wx of [7, 28]) { R(c, wx, 40, 5, 6, C.wheel); R(c, wx + 2, 42, 1, 2, C.hub); }
}

function sMailbox(c, p) {
  const M = p.mail;
  R(c, 2, 0, 6, 1, M.body); R(c, 1, 1, 8, 1, M.body); R(c, 0, 2, 10, 10, M.body); R(c, 8, 2, 2, 10, M.shade);
  R(c, 2, 4, 6, 1, M.slot); R(c, 1, 12, 8, 1, M.shade); R(c, 2, 13, 2, 3, M.shade); R(c, 6, 13, 2, 3, M.shade);
}

function sCat(c, p) {
  const K = p.cat;
  R(c, 2, 0, 1, 1, K.fur); R(c, 7, 0, 1, 1, K.fur); R(c, 2, 1, 6, 4, K.fur); R(c, 4, 1, 2, 1, K.furS);
  R(c, 3, 2, 1, 1, K.eye); R(c, 6, 2, 1, 1, K.eye); R(c, 4, 3, 2, 1, K.nose);
  R(c, 2, 5, 6, 2, K.fur); R(c, 1, 7, 8, 2, K.fur); R(c, 4, 5, 2, 4, K.light); R(c, 3, 8, 1, 1, K.furS); R(c, 6, 8, 1, 1, K.furS);
}

export const MALL_STORES = ["GH", "X", "IN"];

function sMall(c, p) {
  const M = p.mall;
  R(c, 0, 0, 80, 70, M.wall); R(c, 0, 0, 80, 3, M.shade); R(c, 0, 3, 80, 2, M.stA); R(c, 0, 5, 80, 2, M.stB);
  R(c, 22, 8, 36, 13, M.sign); txt(c, "MALL", 25, 10, M.signT, 2);
  for (let i = 0; i < 5; i++) { const wx = 4 + i * 15; R(c, wx, 25, 10, 10, M.glassS); R(c, wx + 1, 26, 8, 8, M.glass); R(c, wx + 2, 27, 2, 1, M.shine); }
  R(c, 0, 38, 80, 2, M.stA); R(c, 0, 40, 80, 1, M.shade);
  MALL_STORES.forEach((lab, i) => {
    const sx = 3 + i * 26;
    R(c, sx, 43, 22, 7, M.awn[i]); for (let j = 0; j < 22; j += 2) R(c, sx + j, 50, 1, 1, M.awn[i]);
    txt(c, lab, sx + Math.floor((22 - textW(lab)) / 2), 44, M.awnT[i]);
    R(c, sx + 1, 51, 20, 19, M.frame); R(c, sx + 2, 52, 18, 18, M.glass); R(c, sx + 8, 57, 6, 13, M.glassS);
    R(c, sx + 3, 63, 3, 7, M.items[i]); R(c, sx + 16, 61, 2, 9, M.items[(i + 1) % 3]); R(c, sx + 3, 53, 2, 1, M.shine);
  });
  R(c, 0, 69, 80, 1, M.shade);
}

// Objects on the street, in drawing order (later ones sit on top).
// x, y: top-left in the 320x180 scene. w, h: native size of the art.
// `id` is also the PNG filename: public/art/day/<id>.png and public/art/night/<id>.png.
export const OBJECTS = [
  { id: "library", x: 6,   y: 62,  w: 76, h: 66, draw: sLibrary },
  { id: "booth",   x: 86,  y: 86,  w: 22, h: 42, draw: sBooth },
  { id: "shop",    x: 114, y: 74,  w: 62, h: 54, draw: sShop },
  { id: "cart",    x: 182, y: 82,  w: 40, h: 46, draw: sCart },
  { id: "mailbox", x: 226, y: 112, w: 10, h: 16, draw: sMailbox },
  { id: "cat",     x: 226, y: 103, w: 10, h: 9,  draw: sCat },
  { id: "mall",    x: 238, y: 58,  w: 80, h: 70, draw: sMall },
];
