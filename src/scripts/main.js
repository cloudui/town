// Boot: load any PNG art, then start the town.

import { loadArt } from "./art.js";
import { state } from "./state.js";
import { initScene, setMode } from "./scene.js";
import { initHotspots, placeTag, setHover } from "./hotspots.js";
import { initPanels, openPanel } from "./panels.js";
import { initTheme, currentMode, paintToggle } from "./theme.js";
import { addHeart } from "./effects.js";

const $ = (id) => document.getElementById(id);
const data = JSON.parse($("town-data").textContent);

function activate(id, el) {
  if (el.dataset.pet !== undefined) {
    state.pets++;
    addHeart();
    setHover(id);
    placeTag();
    return;
  }
  if (el.dataset.panel) openPanel(el.dataset.panel, el);
}

async function boot() {
  await loadArt(data.art, data.artBase);

  state.mode = currentMode();
  paintToggle(state.mode);
  initTheme(() => state.mode, (animate) => {
    if (setMode(currentMode(), animate)) paintToggle(state.mode);
  });

  initPanels();
  initHotspots($("stage"), $("tag"), activate);
  initScene({ scroller: $("scroller"), stage: $("stage"), canvas: $("town"), hint: $("hint") });
}

boot();
