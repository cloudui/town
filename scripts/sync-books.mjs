// Copies the newest published posts from the blog into src/content/books.json,
// which the Library panel shows as a shelf of books.
//   npm run books      (also runs automatically before every `npm run build`)
//
// It reads the blog's live front page, so drafts and unpublished posts never show up.
// If the blog can't be reached or its markup changes, the committed books.json is kept.

import fs from "node:fs";

const BLOG = "https://blog.echen.io/";
const OUT = new URL("../src/content/books.json", import.meta.url);
const COUNT = 5;

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…" };
const text = (html = "") =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n] ?? m)
    .replace(/\s+/g, " ")
    .trim();

/** Pull { title, desc, date, href } out of each <article> on the blog's front page. */
export function parse(html) {
  const books = [];
  for (const [article] of html.matchAll(/<article[\s>][\s\S]*?<\/article>/g)) {
    const head = article.match(/class="?article-title"?[^>]*>\s*<a[^>]*?href="?([^"\s>]+)"?[^>]*>([\s\S]*?)<\/a>/);
    if (!head) continue;
    const sub = article.match(/class="?article-subtitle"?[^>]*>([\s\S]*?)<\/h3>/);
    const time = article.match(/class="?article-time--published"?[^>]*>([\s\S]*?)<\/time>/);
    books.push({
      title: text(head[2]),
      desc: text(sub?.[1]),
      date: text(time?.[1]),
      href: new URL(head[1], BLOG).href,
    });
  }
  return books.filter((b) => b.title).slice(0, COUNT);
}

try {
  const res = await fetch(BLOG, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const books = parse(await res.text());
  if (!books.length) throw new Error("no posts found in the page");
  const next = JSON.stringify(books, null, 2) + "\n";
  const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (next !== prev) fs.writeFileSync(OUT, next);
  console.log(`books: ${books.length} posts from ${BLOG}${next === prev ? " (no change)" : " (updated)"}`);
} catch (err) {
  console.warn(`books: couldn't sync from ${BLOG} (${err.message}); keeping the existing books.json`);
}
