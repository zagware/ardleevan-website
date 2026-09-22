#!/usr/bin/env node
/**
 * Static build. Renders the site into dist/.
 *   node build.mjs           -> build
 *   node build.mjs --serve   -> build, then serve dist/ on http://localhost:4173
 */
import { cp, mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContent } from "./build/lib.mjs";
import { render } from "./build/heritage.mjs";

const root = fileURLToPath(new URL("./", import.meta.url));
const dist = join(root, "dist");

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#1f3a2b"/><path d="M20 46V18h7.4l8.2 17.6L43.8 18H51v28h-6.4V29.3L38 43.6h-4.9L26.4 29.3V46z" fill="#f6f1e6"/></svg>`;

async function build() {
  const content = await loadContent();
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  await cp(join(root, "assets"), join(dist, "assets"), { recursive: true });
  await writeFile(join(dist, "assets/img/favicon.svg"), FAVICON);

  await writeFile(join(dist, "index.html"), render(content));
  await cp(join(root, "styles/heritage.css"), join(dist, "style.css"));
  await writeFile(join(dist, ".nojekyll"), "");

  const cname = join(root, "CNAME");
  await readFile(cname, "utf8")
    .then((v) => writeFile(join(dist, "CNAME"), v))
    .catch(() => {});

  console.log(`built -> dist/  (${content.products.length} products)`);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".json": "application/json",
};

function serve(port = 4173) {
  createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (path.endsWith("/")) path += "index.html";
    const file = join(dist, normalize(path).replace(/^(\.\.[/\\])+/, ""));
    try {
      const body = await readFile(file);
      res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("404");
    }
  }).listen(port, () => console.log(`serving dist/ on http://localhost:${port}`));
}

await build();
if (process.argv.includes("--serve")) serve();
