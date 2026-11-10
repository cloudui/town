// Everything a visitor reads lives in this file. Edit freely.
// Plain strings only; links go in `link` / `items[].link` fields.

export const site = {
  name: "Eric Chen",
  tagline: "GPU kernels & LLM inference · San Francisco",
  title: "Eric Chen · echen.io",
  description:
    "Eric Chen's pixel town. GPU kernels, LLM inference, writing, and photos, all in one little street.",
  url: "https://echen.io",
  twitter: "@below_ocean",
};

export const links = {
  github: { label: "GitHub", handle: "cloudui", href: "https://github.com/cloudui" },
  x: { label: "X", handle: "@below_ocean", href: "https://x.com/below_ocean" },
  linkedin: { label: "LinkedIn", handle: "ericchen03", href: "https://linkedin.com/in/ericchen03" },
  blog: { label: "Blog", handle: "blog.echen.io", href: "https://blog.echen.io" },
  instagram: { label: "Instagram", handle: "@violeric", href: "https://instagram.com/violeric" },
  email: "ericchen314@gmail.com",
};

// Places in town. The key must match a hotspot in src/scripts/hotspots.js.
// `name` and `blurb` show in the hover label. A place opens a `panel` or goes to an `href`.
export const places = {
  library: { name: "Library", blurb: "Writing & blog", panel: "writing" },
  booth: { name: "Photo booth", blurb: "Photography", panel: "photos" },
  shop: { name: "Kernel works", blurb: "GPU kernels & inference", panel: "work" },
  cart: { name: "Ice cream stand", blurb: "About me", panel: "about" },
  cat: { name: "Town cat", blurb: "Say hi", pet: true },
  mail: { name: "Mailbox", blurb: "Email me", panel: "contact" },
  mall: { name: "The mall", blurb: "Every link in one place", panel: "directory" },
  gh: { name: links.github.label, blurb: links.github.handle, href: links.github.href },
  x: { name: links.x.label, blurb: links.x.handle, href: links.x.href },
  in: { name: links.linkedin.label, blurb: links.linkedin.handle, href: links.linkedin.href },
};

// Panels that open when you click a place.
//   body:  paragraphs (the first one can be marked lede: true in `lede`)
//   items: cards with a title, a small chip, text, and a link
//   link:  one link under the text
//   email: shows the address with a Copy button
export const panels = {
  work: {
    title: "Kernel works",
    lede: true,
    body: [
      "I write GPU kernels and work on LLM inference. Before this I was a machine learning engineer at Meta, working on ranking for Facebook Reels.",
    ],
    items: [
      {
        title: "Llama 3.1 8B inference engine",
        chip: "97% of bandwidth floor",
        text: "Written in Triton. It runs at 97% of the memory-bandwidth floor and keeps pace with vLLM from batch 1 to 128.",
        link: { label: "Code on GitHub →", href: "https://github.com/cloudui/inference" },
      },
      {
        title: "FlashAttention-2 in CuTe",
        chip: "Walkthrough",
        text: "A step-by-step build of FlashAttention-2 using CUTLASS's CuTe layouts.",
        link: {
          label: "Read it on the blog →",
          href: "https://blog.echen.io/p/flashattention-2-in-cute-from-scratch/",
        },
      },
    ],
  },
  writing: {
    title: "Library",
    body: [
      "I write about behavior, emotions, relationships, and how I think about life. Lately, also about GPU kernels.",
    ],
    link: { label: "Visit the blog at blog.echen.io →", href: links.blog.href },
  },
  photos: {
    title: "Photo booth",
    body: [
      "Photos of cities, food, and whatever catches my eye. A proper gallery is being built. For now the prints are on Instagram.",
    ],
    link: { label: "@violeric on Instagram →", href: links.instagram.href },
  },
  about: {
    title: "Ice cream stand",
    body: [
      "Hi, I'm Eric. I live in San Francisco and studied computer engineering at the University of Maryland.",
      "I'm into photography, books, cities, good food, and cats. This town is still being built, so expect new buildings.",
    ],
  },
  contact: {
    title: "Mailbox",
    body: ["Email is the best way to reach me."],
    email: links.email,
  },
};

// The mall's directory: places first, then outside links.
export const directory = {
  title: "Town directory",
  places: [
    { panel: "work", name: "Kernel works", note: "GPU kernels & projects" },
    { panel: "writing", name: "Library", note: "Writing" },
    { panel: "photos", name: "Photo booth", note: "Photography" },
    { panel: "about", name: "Ice cream stand", note: "About me" },
    { panel: "contact", name: "Mailbox", note: "Email" },
  ],
  links: [links.github, links.x, links.linkedin, links.blog],
};
