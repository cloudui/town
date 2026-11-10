// The photo booth panel: a grid of polaroid prints, and a viewer that shows one
// print large with its story. Arrow keys flip through; Escape goes back to the grid.
// The prints come from `panels.photos.photos` in src/content/site.js.

let current = -1;

const parts = (body) => ({
  grid: body.querySelector("[data-prints]"),
  viewer: body.querySelector("[data-viewer]"),
  prints: [...body.querySelectorAll("[data-photo]")],
});

function show(body, i) {
  const { grid, viewer, prints } = parts(body);
  if (!viewer || !prints.length) return;
  current = (i + prints.length) % prints.length;
  const p = prints[current], thumb = p.querySelector("img");
  const img = viewer.querySelector("img");

  // Show the thumbnail right away, then swap in the full-size photo once it's loaded.
  img.src = thumb.currentSrc || thumb.src;
  img.alt = thumb.alt;
  const full = new Image();
  const want = current;
  full.onload = () => { if (current === want) img.src = full.src; };
  full.src = p.dataset.full;

  viewer.querySelector("figcaption").textContent = p.dataset.caption;
  viewer.querySelector(".note").textContent = p.dataset.note;
  viewer.querySelector(".count").textContent = `${current + 1} / ${prints.length}`;

  const opening = viewer.hidden;
  grid.hidden = true;
  viewer.hidden = false;
  if (opening) {
    body.closest(".card").scrollTop = 0;
    viewer.querySelector("[data-back]").focus();
  }
}

function back(body) {
  const { grid, viewer, prints } = parts(body);
  viewer.hidden = true;
  grid.hidden = false;
  prints[current]?.focus();
  current = -1;
}

const viewing = (body) => { const v = body.querySelector("[data-viewer]"); return !!v && !v.hidden; };

/** Click inside the panel. Returns true if it was a photo booth control. */
export function photoClick(e, body) {
  const print = e.target.closest("[data-photo]");
  if (print) { show(body, Number(print.dataset.photo)); return true; }
  const step = e.target.closest("[data-step]");
  if (step) { show(body, current + Number(step.dataset.step)); return true; }
  if (e.target.closest("[data-back]")) { back(body); return true; }
  return false;
}

/** Key press while the panel is open. Returns true if handled. */
export function photoKey(e, body) {
  if (!viewing(body)) return false;
  if (e.key === "ArrowLeft") { show(body, current - 1); return true; }
  if (e.key === "ArrowRight") { show(body, current + 1); return true; }
  if (e.key === "Escape") { back(body); return true; }
  return false;
}
