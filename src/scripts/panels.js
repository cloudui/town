// The pop-up cards. Their content is rendered from src/content/site.js into
// <template id="t-<name>"> elements by Panels.astro; this file just shows them.

const app = document.getElementById("app");
const panel = document.getElementById("panel");
const body = document.getElementById("panel-body");
const closeBtn = document.getElementById("panel-close");
let returnFocus = null;

export function openPanel(id, from) {
  const tpl = document.getElementById("t-" + id);
  if (!tpl) return;
  if (panel.hidden) returnFocus = from || document.activeElement;
  body.replaceChildren(tpl.content.cloneNode(true));
  panel.hidden = false;
  app.inert = true; // keep Tab inside the card
  closeBtn.focus();
}

export function closePanel() {
  panel.hidden = true;
  app.inert = false;
  if (returnFocus && returnFocus.focus) returnFocus.focus();
  returnFocus = null;
}

function copy(btn) {
  const el = document.getElementById(btn.dataset.copy), msg = body.querySelector("[data-copied]");
  const say = (text) => { if (msg) { msg.textContent = text; msg.hidden = false; } };
  const fallback = () => {
    const sel = getSelection(), range = document.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
    say("Selected. Press Ctrl+C or ⌘C to copy.");
  };
  try {
    navigator.clipboard.writeText(el.textContent.trim()).then(() => say("Copied to your clipboard."), fallback);
  } catch {
    fallback();
  }
}

export function initPanels() {
  closeBtn.addEventListener("click", closePanel);
  panel.addEventListener("click", (e) => {
    if (e.target === panel) return closePanel();
    const open = e.target.closest("[data-open]");
    if (open) return openPanel(open.dataset.open);
    const btn = e.target.closest("[data-copy]");
    if (btn) copy(btn);
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) closePanel(); });
  document.getElementById("dir-btn").addEventListener("click", (e) => openPanel("directory", e.currentTarget));
}
