import { esc, para, paras, list, head, productDetail, pairTable, structuredData } from "./lib.mjs";

const IMG = "../assets/img/";

const fonts = `<link href="https://fonts.googleapis.com/css2?family=Bitter:wght@400;600;700&family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet">`;

function productRow(product, index) {
  const chips = Object.entries(product.constituents)
    .map(([k, v]) => `<span class="chip"><b>${esc(v)}</b> ${esc(k.replace(/^Crude /, ""))}</span>`)
    .join("");
  return `
<article class="row ${index % 2 ? "row--flip" : ""}" id="${esc(product.id)}">
  <div class="row-media">
    <img src="${IMG}${esc(product.image)}" alt="${esc(product.imageAlt)}" loading="lazy" width="500" height="650">
  </div>
  <div class="row-body">
    <p class="row-stage">${esc(product.stage)}</p>
    <h3>${esc(product.name)}</h3>
    <p class="row-tagline">${para(product.tagline)}</p>
    <p class="row-summary">${para(product.summary)}</p>
    ${list(product.highlights, "ticks")}
    <div class="chips">${chips}</div>
    <p class="row-meta"><span>Best for: ${esc(product.bestFor)}</span><span>${esc(product.weight)} bag &middot; guide price &pound;${esc(product.price)}</span></p>
    <details>
      <summary>Full composition &amp; feeding guide</summary>
      <div class="detail-inner">
        ${paras(product.description)}
        ${productDetail(product)}
      </div>
    </details>
  </div>
</article>`;
}

function compareTable(products) {
  const thead = `<thead><tr><th scope="col">Variety</th><th scope="col">Best for</th><th scope="col">Protein</th><th scope="col">Fat</th><th scope="col">Fibre</th><th scope="col">Ash</th><th scope="col">Bag</th><th scope="col">Guide price</th></tr></thead>`;
  const rows = products
    .map((p) => {
      const c = p.constituents;
      const get = (k) => c[k] ?? c[`Crude ${k}`] ?? c[`${k} content`] ?? "&mdash;";
      return `<tr>
      <th scope="row"><a href="#${esc(p.id)}">${esc(p.shortName)}</a></th>
      <td>${esc(p.bestFor)}</td>
      <td>${get("Protein")}</td>
      <td>${get("Fat")}</td>
      <td>${get("Fibres")}</td>
      <td>${get("Ash")}</td>
      <td>${esc(p.weight)}</td>
      <td>&pound;${esc(p.price)}</td>
    </tr>`;
    })
    .join("");
  return `<div class="table-scroll"><table class="compare">${thead}<tbody>${rows}</tbody></table></div>`;
}

export function render({ site, products }) {
  const c = site.contact;
  return `${head({
    site,
    title: site.title,
    description: site.description,
    css: "style.css",
    bodyClass: "heritage",
    extra: fonts,
  })}
<a class="skip" href="#main">Skip to content</a>

<div class="topbar">
  <div class="wrap topbar-in">
    <span>${esc(site.strapline)}</span>
    <span class="dot">&bull;</span>
    <span>${esc(site.substrapline)}</span>
  </div>
</div>

<header class="site-head">
  <div class="wrap head-in">
    <a class="brand" href="#top">
      <img src="${IMG}Ardleevan600.jpg" alt="Ardleevan" width="220" height="70">
    </a>
    <input type="checkbox" id="navtoggle" class="navtoggle">
    <label for="navtoggle" class="burger" aria-hidden="true"><span></span></label>
    <nav class="nav">
      ${site.nav.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join("")}
    </nav>
  </div>
</header>

<main id="main">
<section class="hero" id="top">
  <img class="hero-bg" src="${IMG}${esc(site.hero.image)}" alt="${esc(site.hero.imageAlt)}" width="1600" height="900">
  <div class="wrap hero-in">
    <p class="eyebrow">${esc(site.hero.eyebrow)}</p>
    <h1>${para(site.hero.heading)}</h1>
    <p class="lede">${para(site.hero.lede)}</p>
    <div class="cta">
      <a class="btn btn--solid" href="#range">See the range</a>
      <a class="btn btn--ghost" href="#contact">Ask about pricing</a>
    </div>
  </div>
</section>

<section class="trust">
  <div class="wrap trust-in">
    ${site.quality.points
      .map((p) => `<div class="trust-item"><h3>${esc(p.title)}</h3><p>${para(p.text)}</p></div>`)
      .join("")}
  </div>
</section>

<section class="band" id="range">
  <div class="wrap">
    <p class="kicker">The complete Chapel Farm range</p>
    <h2>A diet for every stage</h2>
    <p class="section-lede">${products.length} varieties, every one 100% complete and totally balanced &mdash; including two grain-free Invest &lsquo;N&rsquo; Digest recipes for sensitive dogs. Expand any variety for its full composition, analytical constituents and feeding guide.</p>
  </div>
  <div class="wrap rows">
    ${products.map(productRow).join("\n")}
  </div>
</section>

<section class="quote">
  <img class="quote-bg" src="${IMG}Siloulette.jpg" alt="" aria-hidden="true" width="1600" height="900">
  <div class="wrap quote-in">
    <blockquote>
      <p>&ldquo;${para(site.quote.text)}&rdquo;</p>
      <cite>${esc(site.quote.attribution)}<span>${esc(site.quote.role)}</span></cite>
    </blockquote>
  </div>
</section>

<section class="band band--tint" id="compare">
  <div class="wrap">
    <p class="kicker">At a glance</p>
    <h2>Compare the range</h2>
    ${compareTable(products)}
    <p class="fineprint">${para(site.priceNote)}</p>
  </div>
</section>

<section class="band" id="quality">
  <div class="wrap quality-in">
    <div>
      <p class="kicker">Ingredients</p>
      <h2>${esc(site.quality.heading)}</h2>
      ${paras(site.quality.body)}
    </div>
    <aside class="fact-card">
      <h3>${esc(site.chapelFarm.heading)}</h3>
      <p>${para(site.chapelFarm.body)}</p>
      ${pairTable(
        [
          ["Calcium (core adult range)", "1.2% – 2.0%"],
          ["Preservatives", "Natural antioxidants only"],
          ["Grain-free options", "Salmon & Duck"],
          ["Bag sizes", [...new Set(products.map((p) => p.weight))].join(" & ")],
        ],
        "spec-table",
      )}
    </aside>
  </div>
</section>

<section class="band band--dark" id="about">
  <div class="wrap about-in">
    <div class="about-media">
      <img src="${IMG}${esc(site.about.image)}" alt="${esc(site.about.imageAlt)}" loading="lazy" width="800" height="600">
    </div>
    <div class="about-body">
      <p class="kicker">Our story</p>
      <h2>${esc(site.about.heading)}</h2>
      ${paras(site.about.body)}
    </div>
  </div>
</section>

<section class="gallery">
  ${site.gallery
    .map(
      (g) =>
        `<figure><img src="${IMG}${esc(g.image)}" alt="${esc(g.alt)}" loading="lazy" width="800" height="600"><figcaption>${esc(g.caption)}</figcaption></figure>`,
    )
    .join("")}
</section>

<section class="band band--tint" id="buy">
  <div class="wrap">
    <p class="kicker">Stockist</p>
    <h2>${esc(site.buying.heading)}</h2>
    <p class="section-lede">${para(site.buying.lede)}</p>
    <div class="cards">
      ${site.buying.cards
        .map(
          (card) => `<div class="card">
        <h3>${esc(card.title)}</h3>
        <p>${para(card.text)}</p>
        ${card.link ? `<a class="card-link" href="${esc(card.link.href)}" rel="noopener">${esc(card.link.label)}</a>` : ""}
      </div>`,
        )
        .join("")}
    </div>
  </div>
</section>

<section class="contact" id="contact">
  <div class="wrap contact-in">
    <div>
      <p class="kicker">${esc(site.contact.area)}</p>
      <h2>${esc(site.contact.heading)}</h2>
      <p class="section-lede">${para(site.contact.lede)}</p>
    </div>
    <div class="contact-actions">
      <a class="btn btn--solid" href="${esc(c.whatsappHref)}" rel="noopener">WhatsApp ${esc(c.phoneDisplay)}</a>
      <a class="btn btn--ghost" href="${esc(c.phoneHref)}">Call ${esc(c.phoneDisplay)}</a>
      <a class="btn btn--ghost" href="mailto:${esc(c.email)}">${esc(c.email)}</a>
      <a class="btn btn--ghost" href="${esc(c.facebook)}" rel="noopener">${esc(c.facebookLabel)}</a>
    </div>
  </div>
</section>
</main>

<footer class="site-foot">
  <div class="wrap foot-in">
    <p>&copy; ${new Date().getFullYear()} ${esc(site.brand)} Dog Food. Information only &mdash; no online ordering.</p>
    <p>GB customers: order from <a href="https://chapelfarmdogfood.co.uk" rel="noopener">Chapel Farm Dog Foods</a>.</p>
  </div>
</footer>
${structuredData(site, products)}
</body>
</html>
`;
}
