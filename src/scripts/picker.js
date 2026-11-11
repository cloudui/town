// Pick-one rows inside a panel: the Library's bookshelf and the Kernel works job signs.
// Hovering, focusing, or clicking an item shows its blurb in the box below the row.
//
// Markup (see Panels.astro): a [data-picker] wrapper holding the items ([data-pick])
// and one [data-blurb] per item, in the same order. All blurbs are stacked in one grid
// cell (town.css), so the box never changes height.
//
// Items that are links (books) open on click. On touch, the first tap picks the item
// and the second tap follows the link, like places in town.

function pick(item) {
  const group = item.closest("[data-picker]");
  const blurbs = group.querySelectorAll("[data-blurb]");
  group.querySelectorAll("[data-pick]").forEach((el, i) => {
    const on = el === item;
    el.classList.toggle("on", on);
    if (el.hasAttribute("aria-pressed")) el.setAttribute("aria-pressed", on);
    blurbs[i].classList.toggle("on", on);
  });
}

export function initPickers(panel) {
  let touch = false, wasOn = false;
  const itemAt = (e) => e.target.closest?.("[data-pick]");

  panel.addEventListener("pointerover", (e) => {
    const item = e.pointerType === "mouse" && itemAt(e);
    if (item) pick(item);
  });
  panel.addEventListener("focusin", (e) => {
    const item = itemAt(e);
    if (item) pick(item);
  });
  // Runs before focus moves, so `wasOn` is what the item looked like before this tap.
  panel.addEventListener("pointerdown", (e) => {
    const item = itemAt(e);
    touch = e.pointerType === "touch";
    wasOn = !!item && item.classList.contains("on");
  });
  panel.addEventListener("click", (e) => {
    const item = itemAt(e);
    if (!item) return;
    if (touch && !wasOn && item.matches("a")) e.preventDefault();
    pick(item);
  });
}
