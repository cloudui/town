import { defineConfig } from "astro/config";

// SITE_URL and BASE_PATH are set by the deploy workflow from GitHub Pages, so the build
// works at https://cloudui.github.io/town/ now and at https://echen.io later with no edits.
export default defineConfig({
  site: process.env.SITE_URL || "https://echen.io",
  base: process.env.BASE_PATH || "/",
});
