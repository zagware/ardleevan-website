#!/usr/bin/env node
/**
 * Static build. Renders both candidate styles from one content source into dist/.
 *   node build.mjs           -> build
 *   node build.mjs --serve   -> build, then serve dist/ on http://localhost:4173
 */
import { cp, mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContent, esc } from "./build/lib.mjs";
import { render as renderHeritage } from "./build/heritage.mjs";
import { render as renderModern } from "./build/modern.mjs";

const root = fileURLToPath(new URL("./", import.meta.url));
const dist = join(root, "dist");

const STYLES = [
  {
    slug: "heritage",
    name: "Heritage Field",
    render: renderHeritage,
    css: "styles/heritage.css",
    blurb:
      "Traditional country-sporting character. Deep forest green and cream, serif headlines, full-bleed field photography, alternating product rows.",
    swatch: ["#1f3a2b", "#b28437", "#f6f1e6"],
  },
  {
    slug: "modern",
    name: "Modern Performance",
    render: renderModern,
    css: "styles/modern.css",
    blurb:
      "Bright, data-forward and contemporary. Off-white canvas with an amber accent, geometric type, product cards with nutrition stat blocks.",
    swatch: ["#0e1a16", "#e07a1f", "#fbfaf8"],
  },
];

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#1f3a2b"/><path d="M20 46V18h7.4l8.2 17.6L43.8 18H51v28h-6.4V29.3L38 43.6h-4.9L26.4 29.3V46z" fill="#f6f1e6"/></svg>`;

function chooser(styles) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ardleevan — choose a site style</title>
<meta name="robots" content="noindex">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin:0; font:400 17px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
         background:#12201a; color:#f6f1e6; display:grid; place-items:center; min-height:100vh; padding:3rem 1.5rem; }
  .in { width:min(920px,100%); }
  h1 { font-size:clamp(1.9rem,4vw,2.8rem); margin:0 0 .4rem; letter-spacing:-.02em; }
  .sub { color:rgba(246,241,230,.66); margin:0 0 2.5rem; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; }
  a.card { display:block; padding:1.8rem; border-radius:16px; text-decoration:none; color:inherit;
           background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.14); transition:.18s; }
  a.card:hover { background:rgba(255,255,255,.1); transform:translateY(-3px); }
  h2 { margin:.6rem 0 .4rem; font-size:1.35rem; }
  p.blurb { margin:0 0 1.2rem; font-size:.95rem; color:rgba(246,241,230,.7); }
  .sw { display:flex; gap:.4rem; }
  .sw i { width:26px; height:26px; border-radius:6px; border:1px solid rgba(255,255,255,.2); }
  .go { font-weight:700; color:#d3a55f; }
  footer { margin-top:2.5rem; font-size:.85rem; color:rgba(246,241,230,.45); }
  @media (max-width:720px){ .grid{grid-template-columns:1fr} }
</style>
</head>
<body>
<div class="in">
  <h1>Ardleevan — pick a style</h1>
  <p class="sub">Two complete single-page builds from the same content. Same words, same five diets, different design language.</p>
  <div class="grid">
    ${styles
      .map(
        (s) => `<a class="card" href="${s.slug}/">
      <div class="sw">${s.swatch.map((c) => `<i style="background:${c}"></i>`).join("")}</div>
      <h2>${esc(s.name)}</h2>
      <p class="blurb">${esc(s.blurb)}</p>
      <span class="go">View ${esc(s.slug)} &rarr;</span>
    </a>`,
      )
      .join("")}
  </div>
  <footer>Information-only site &middot; no ordering &middot; built from content/site.json + content/products.json</footer>
</div>
</body>
</html>
`;
}

async function build() {
  const content = await loadContent();
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  await cp(join(root, "assets"), join(dist, "assets"), { recursive: true });
  await writeFile(join(dist, "assets/img/favicon.svg"), FAVICON);

  for (const style of STYLES) {
    const dir = join(dist, style.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "index.html"), style.render(content));
    await cp(join(root, style.css), join(dir, "style.css"));
  }

  await writeFile(join(dist, "index.html"), chooser(STYLES));
  await writeFile(join(dist, ".nojekyll"), "");

  const cname = join(root, "CNAME");
  await readFile(cname, "utf8")
    .then((v) => writeFile(join(dist, "CNAME"), v))
    .catch(() => {});

  console.log(
    `built ${STYLES.length} styles -> dist/  (${content.products.length} products, ${STYLES.map((s) => s.slug).join(", ")})`,
  );
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
