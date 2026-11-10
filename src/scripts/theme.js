// Day / night. Follows the system setting until you press the toggle,
// which sets data-theme on <html> (that also switches the CSS colors).

const root = document.documentElement;
const darkMQ = matchMedia("(prefers-color-scheme: dark)");
const btn = document.getElementById("mode");

export function currentMode() {
  const t = root.getAttribute("data-theme");
  if (t === "dark") return "night";
  if (t === "light") return "day";
  return darkMQ.matches ? "night" : "day";
}

// 8x8 pixel icons: sun (shown at night, "switch to day") and moon.
const SUN = [[3,0],[3,7],[0,3],[7,3],[1,1],[6,1],[1,6],[6,6],[2,2],[3,2],[4,2],[5,2],[2,3],[3,3],[4,3],[5,3],[2,4],[3,4],[4,4],[5,4],[2,5],[3,5],[4,5],[5,5]];
const MOON = [[2,0],[3,0],[4,0],[1,1],[2,1],[0,2],[1,2],[0,3],[1,3],[0,4],[1,4],[0,5],[1,5],[2,5],[1,6],[2,6],[3,6],[4,6],[5,6],[2,7],[3,7],[4,7],[6,5]];

export function paintToggle(mode) {
  const night = mode === "night";
  document.getElementById("mode-label").textContent = night ? "Day" : "Night";
  btn.setAttribute("aria-pressed", String(night));
  btn.setAttribute("aria-label", night ? "Switch to day" : "Switch to night");
  document.getElementById("mode-icon").innerHTML = (night ? SUN : MOON)
    .map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1"/>`)
    .join("");
}

/** onChange(animate) runs whenever the effective mode might have changed. */
export function initTheme(getMode, onChange) {
  btn.addEventListener("click", () => {
    root.setAttribute("data-theme", getMode() === "night" ? "light" : "dark");
    onChange(true);
  });
  new MutationObserver(() => onChange(true)).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  darkMQ.addEventListener("change", () => onChange(true));
}
