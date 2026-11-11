// Colors for the code-drawn scene. Day = golden hour, night = neon.

export const P = {
  day: {
    sky: ["#e9ad7c","#f2c28d","#f8d7a6","#fbe8c5"], sun: "#fff4d2", halo: "#fde2a6",
    far: ["#e6c2ae","#dcb3a2"], hill: "#b7c58f",
    walk: "#e8d3b2", walkL: "#d6bc97", curb: "#c8a983", road: "#8f857a", roadL: "#f1e2c4",
    outline: "#fffaf0", cloud: "#fff6e6", cloudS: "#f7dcc0",
    lib: {roof:"#b8735a",roofS:"#985a46",shade:"#d9c19c",sign:"#5b4a3c",signT:"#f9f0de",wall:"#efe0c4",door:"#6e4b3c",doorS:"#5a3c30",win:"#a8cdd6",col:"#f9f0de",colS:"#ddc9a6"},
    gcat: {fur:"#9a9aa3",furS:"#7c7c86",eye:"#2b2b33",book:"#5a7fb0",page:"#f9f0de"},
    booth: {sign:"#f8ecd4",signT:"#b3424f",body:"#e9a8a0",shade:"#cf8a83",cur:"#b3424f",curS:"#8e3340",paper:"#fffaf0",frame:"#7a5a55",feet:"#5b4a3c"},
    shop: {wall:"#b7c79a",shade:"#a2b484",trim:"#6f7f5a",sign:"#f8ecd4",signT:"#4f6b45",awnA:"#e9737f",awnB:"#fbf1df",screen:"#26314a",screenFg:"#8ff0c9",door:"#e2d6bb",doorL:"#cbbd9c",dark:"#4a4038",pot:"#b8735a",leaf:"#6f9a55",chim:"#b8735a",chimS:"#985a46",smoke:"#fffaf0",smokeS:"#e6cdbb"},
    cart: {umbA:"#f08da0",umbB:"#fbf1df",pole:"#8a7a70",body:"#f6c9cf",shade:"#e3a6ae",text:"#a8475c",cone:"#d9a35f",scoops:["#f7d7e0","#bfe3c6","#f3e3b0"],wheel:"#6b5148",hub:"#d9c19c"},
    mail: {body:"#c4504a",shade:"#9d3c38",slot:"#3d2522"},
    mall: {wall:"#f0d2c9",shade:"#d8b2a8",stA:"#7cc6c0",stB:"#b59ad6",sign:"#fbf3e4",signT:"#7a5aa8",glass:"#a7d3dc",glassS:"#86b6c2",shine:"#eef8fa",frame:"#7a5aa8",awn:["#4a4452","#2f2a2d","#4f7fa6"],awnT:["#a6d68f","#fbf3e4","#fbf3e4"],items:["#a6d68f","#e9737f","#8fb7d6"]},
    cat: {fur:"#e8964f",furS:"#c9763a",light:"#f6c48f",eye:"#2b1d14",nose:"#e07a78"},
    lamp: {post:"#4f4a52",head:"#f6e6b8"},
    tree: {leaf:"#9bb878",leafS:"#7f9f62",trunk:"#7a5a45",pink:"#f3c3cf",pinkS:"#e7a3b4"},
    house: {walls:["#f0dcc0","#e8c1b5","#c9d6b0","#f1e2b8"],roofs:["#b8735a","#8a6f9a","#6f8a6a"],win:"#a8cdd6",door:"#6e4b3c"}
  },
  night: {
    sky: ["#060918","#0c1130","#151646","#2a1a55"], moon: "#f3efe0", halo: "#2b2a66",
    far: ["#14173a","#1a1c46"], farWin: ["#ff4fa3","#3ff0ff","#ffb347","#b06cff"], hill: "#0e1128",
    walk: "#1e2140", walkL: "#272b52", curb: "#30346a", road: "#0b0e22", roadL: "#2e3366",
    outline: "#3ff0ff",
    lib: {roof:"#33285a",roofS:"#271e46",shade:"#1b1e3c",sign:"#121432",signT:"#ffb347",wall:"#262a4e",door:"#0e0c1c",doorS:"#3a2a1a",win:"#ffb347",col:"#30345c",colS:"#22264a"},
    gcat: {fur:"#0a0a14",furS:"#0a0a14",eye:"#3ff0ff",book:"#0a0a14",page:"#0a0a14"},
    booth: {sign:"#121432",signT:"#ff4fa3",body:"#2b2350",shade:"#1f1940",cur:"#5a1a3a",curS:"#3d1229",paper:"#ffd6ea",frame:"#7a2a55",feet:"#0b0c18"},
    shop: {wall:"#1f2b40",shade:"#18233a",trim:"#2c3b55",sign:"#0c1324",signT:"#3ff0ff",awnA:"#3a1630",awnB:"#1a2234",screen:"#04101a",screenFg:"#3ff0ff",door:"#1a2234",doorL:"#141a29",dark:"#05060d",pot:"#241a2a",leaf:"#10241e",chim:"#2c3b55",chimS:"#18233a"},
    cart: {umbA:"#4a1f45",umbB:"#2a2448",pole:"#141225",body:"#3a2550",shade:"#2a1b3d",text:"#ff4fa3",cone:"#4a3324",scoops:["#6b3d5a","#2f4f45","#5a4d36"],wheel:"#0b0a16",hub:"#2a2448"},
    mail: {body:"#3a1830",shade:"#2a1124",slot:"#0b0610"},
    mall: {wall:"#211d45",shade:"#18153a",stA:"#3ff0ff",stB:"#b06cff",sign:"#0f0d26",signT:"#ff4fa3",glass:"#24366a",glassS:"#1a2650",shine:"#5f7fd0",frame:"#2e2860",awn:["#1a1830","#120f1c","#0f2a44"],awnT:["#6bff9e","#f3efe0","#4fb3ff"],items:["#6bff9e","#ff4fa3","#4fb3ff"]},
    cat: {fur:"#0a0a14",furS:"#0a0a14",light:"#0a0a14",eye:"#ffd84a",nose:"#0a0a14"},
    lamp: {post:"#0b0c1c",head:"#ffd38a"},
    tree: {leaf:"#13233a",leafS:"#0f1b2e",trunk:"#0b0c18",pink:"#2a1838",pinkS:"#20122c"},
    house: {walls:["#20234a","#251f44","#1c2942","#262546"],roofs:["#141532","#1b1438","#10203a"],lit:["#ffb347","#ff4fa3","#3ff0ff","#1a1c3a","#1a1c3a","#1a1c3a"],door:"#0e0c1c"}
  }
};
