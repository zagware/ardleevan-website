import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

export async function loadContent() {
  const [site, products] = await Promise.all([
    readFile(new URL("content/site.json", root), "utf8").then(JSON.parse),
    readFile(new URL("content/products.json", root), "utf8").then(JSON.parse),
  ]);
  return { site, products };
}

const ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escape for HTML text and double-quoted attribute contexts. */
export const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ENTITIES[c]);

/** Escape then convert typographic markers that appear in the source copy. */
export const para = (value) => esc(value).replace(/--/g, "&mdash;");

export const paras = (list, cls = "") =>
  list.map((p) => `<p${cls ? ` class="${cls}"` : ""}>${para(p)}</p>`).join("\n");

export const list = (items, cls = "") =>
  `<ul${cls ? ` class="${cls}"` : ""}>${items.map((i) => `<li>${para(i)}</li>`).join("")}</ul>`;

/** Ardleevan does not publish NI pricing for every variety; those are enquiry-only. */
export const priceLabel = (price) =>
  price ? `guide price &pound;${esc(price)}` : "price on enquiry";

/** Two-column definition table from an object or array of [key, value] pairs. */
export function pairTable(pairs, cls = "") {
  const rows = (Array.isArray(pairs) ? pairs : Object.entries(pairs))
    .map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`)
    .join("");
  return `<table${cls ? ` class="${cls}"` : ""}><tbody>${rows}</tbody></table>`;
}

export function dataTable({ caption, headers, rows }, cls = "") {
  const head = `<thead><tr>${headers.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>`;
  const body = `<tbody>${rows
    .map(
      (r) =>
        `<tr>${r
          .map((cell, i) => (i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`))
          .join("")}</tr>`,
    )
    .join("")}</tbody>`;
  return `<table${cls ? ` class="${cls}"` : ""}>${
    caption ? `<caption>${esc(caption)}</caption>` : ""
  }${head}${body}</table>`;
}

/** Full nutrition + feeding disclosure, shared by both styles. */
export function productDetail(product, { cls = "" } = {}) {
  const na = pairTable(product.nutritionalAdditives, "spec-table");
  return `
<div class="detail ${cls}">
  <div class="detail-block detail-block--wide">
    <h4>Composition</h4>
    <p>${para(product.composition)}</p>
  </div>
  <div class="detail-block">
    <h4>Analytical constituents</h4>
    ${pairTable({ ...product.constituents, ...(product.extraConstituents ?? {}) }, "spec-table")}
  </div>
  <div class="detail-block">
    <h4>Additives</h4>
    <p>${para(product.additives)}</p>
    <h4>Nutritional additives</h4>
    ${na}
  </div>
  <div class="detail-block detail-block--wide">
    <h4>Feeding guide</h4>
    ${paras(product.feeding.intro)}
    <div class="table-scroll">${dataTable(product.feeding.table, "feed-table")}</div>
    ${list(product.feeding.notes, "notes")}
  </div>
</div>`;
}

export function structuredData(site, products) {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.brand,
        url: site.url,
        description: site.description,
        email: site.contact.email,
        telephone: site.contact.phoneHref.replace("tel:", ""),
        areaServed: "Northern Ireland and Ireland",
        sameAs: [site.contact.facebook],
      },
      ...products.map((p) => ({
        "@type": "Product",
        name: p.name,
        description: p.summary,
        brand: { "@type": "Brand", name: "Chapel Farm" },
        weight: p.weight,
        image: `${site.url}/assets/img/${p.image}`,
      })),
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

export function head({ site, title, description, css, bodyClass, extra = "" }) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_GB">
<link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${extra}
<link rel="stylesheet" href="${css}">
</head>
<body class="${bodyClass}">`;
}
