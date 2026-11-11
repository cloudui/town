// Pixel-art logos for the job signs in the Kernel works panel.
// Each logo is a grid of characters: "." is empty, any other character is looked up
// in `colors`. Every row must be the same length. `px` is the size of one cell on screen.
// To add one: draw the grid here, then use its key as `logo` in a `jobs` entry in site.js.

export const logos = {
  meta: {
    px: 3,
    colors: { a: "#0064e1", b: "#0073ee", c: "#0082fb" },
    rows: [
      "....aaaa....cccc....",
      "..aaaaaaa..ccccccc..",
      ".aaa...aaaccc...ccc.",
      ".aa.....aabc.....cc.",
      "aaa.....aaac.....ccc",
      "aa......baaa......cc",
      "bb.....ccaaa......cc",
      "bb.....cc.aaa.....cc",
      "cc....ccc..aab....cc",
      "cc....cc....abb...cc",
      "ccc..ccc....bbb..ccc",
      ".cccccc......bbbbcc.",
      "..cccc........bbbb..",
    ],
  },
  viam: {
    px: 3,
    colors: { k: "#000000", w: "#ffffff" },
    rows: [
      "kkkkkkkkkkkkkk",
      "kkkkkkkkkkkkkk",
      "kkkkkkkkkkkkkk",
      "kkkkkkkkkkkkkk",
      "kkwwwkkkkwwwkk",
      "kkkwwwkkwwwkkk",
      "kkkkwwkkwwkkkk",
      "kkkkwwwwwwkkkk",
      "kkkkkwwwwkkkkk",
      "kkkkkkwwkkkkkk",
      "kkkkkkkkkkkkkk",
      "kkkkkkkkkkkkkk",
      "kkkkkkkkkkkkkk",
      "kkkkkkkkkkkkkk",
    ],
  },
  // Bitcamp's flame is pixel art already; this is its real 8x10 grid.
  bitcamp: {
    px: 4,
    colors: { r: "#ff3e44", o: "#ff713e", a: "#ffb03e", y: "#ffee3e", w: "#fffef8" },
    rows: [
      "...r....",
      "..r.....",
      ".rr..r..",
      "rro...r.",
      "oooo.oo.",
      "oaaaaaoo",
      "oayyyaao",
      "oaywyyao",
      ".aywwya.",
      "..yyyy..",
    ],
  },
};
