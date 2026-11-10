// Screenshots the built town (day mode) into public/og.png for link previews.
//   npm run build && npm run og && npm run build
// Re-run whenever the art changes. Uses your local Chrome (no extra packages);
// set CHROME=/path/to/chrome to override. Needs Node 22+ for the built-in WebSocket.

import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const W = 1200, H = 630, OUT = "public/og.png";

const chrome =
  process.env.CHROME ||
  ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) =>
    fs.existsSync(p),
  );
if (!chrome) throw new Error("Chrome not found. Set CHROME=/path/to/chrome.");
if (!fs.existsSync("dist/index.html")) throw new Error("Run `npm run build` first.");

// 1. Serve dist/ on a throwaway port.
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff" };
const server = http.createServer((req, res) => {
  let file = path.join("dist", decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!path.extname(file)) file = path.join(file, "index.html");
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    res.end(buf);
  });
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const pageUrl = `http://127.0.0.1:${server.address().port}/`;

// 2. Start headless Chrome with the DevTools protocol on.
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "og-chrome-"));
const proc = spawn(chrome, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  const browserWs = await new Promise((resolve, reject) => {
    let log = "";
    proc.stderr.on("data", (d) => {
      log += d;
      const m = log.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) resolve(m[1]);
    });
    proc.on("exit", () => reject(new Error("Chrome exited early:\n" + log)));
  });
  const port = new URL(browserWs).port;
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();

  // 3. Tiny DevTools-protocol client.
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const pending = new Map(), listeners = [];
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    else listeners.forEach((fn) => fn(msg));
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
      ws.send(JSON.stringify({ id: n, method, params }));
    });

  // 4. Exact viewport, day mode, no particles mid-air, then shoot.
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await send("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-color-scheme", value: "light" },
      { name: "prefers-reduced-motion", value: "reduce" },
    ],
  });
  await send("Page.enable");
  const loaded = new Promise((r) => listeners.push((m) => m.method === "Page.loadEventFired" && r()));
  await send("Page.navigate", { url: pageUrl });
  await loaded;
  await sleep(1000); // fonts + first frames
  const { data } = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
  fs.writeFileSync(OUT, Buffer.from(data, "base64"));
  console.log(`Wrote ${OUT}`);
  ws.close();
} finally {
  const exited = new Promise((r) => (proc.exitCode !== null ? r() : proc.once("exit", r)));
  proc.kill();
  await Promise.race([exited, sleep(3000)]);
  server.close();
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
