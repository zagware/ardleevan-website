import { esc, para, paras, list, head, productDetail, structuredData } from "./lib.mjs";

const IMG = "../assets/img/";


const DOT = '<span class="dot">&bull;</span>';
const fonts = `<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">`;

function productCard(product) {
  const stats = Object.entries(product.constituents)
    .map(
      ([k, v]) =>
        `<div class="stat"><dt>${esc(k.replace(/^Crude /, "").replace(" content", ""))}</dt><dd>${esc(v)}</dd></div>`,
    )
    .join("");
  return `
<article class="pcard" id="${esc(product.id)}">
  <header class="pcard-head">
    <div class="pcard-shot">
      <img src="${IMG}${esc(product.image)}" alt="${esc(product.imageAlt)}" loading="lazy" width="500" height="650">
    </div>
    <div class="pcard-intro">
      <span class="tag">${esc(product.stage)}</span>
      <h3>${esc(product.name)}</h3>
      <p class="pcard-tagline">${para(product.tagline)}</p>
      <p class="pcard-summary">${para(product.summary)}</p>
      <dl class="stats">${stats}</dl>
      ${list(product.highlights, "bullets")}
      <p class="pcard-meta"><span class="meta-key">Best for</span> ${esc(product.bestFor)}</p>
      <p class="pcard-meta"><span class="meta-key">Bag</span> ${esc(product.weight)} <span class="sep"></span> ${
        product.price
          ? `<span class="meta-key">Guide price</span> &pound;${esc(product.price)}`
          : `<span class="meta-key">Price</span> on enquiry`
      }</p>
      <details>
        <summary><span>Full spec &amp; feeding guide</span></summary>
        <div class="detail-inner">
          ${paras(product.description)}
          ${productDetail(product)}
        </div>
      </details>
    </div>
  </header>
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
      <td class="tight">${esc(p.bestFor)}</td>
      <td class="num">${get("Protein")}</td>
      <td class="num">${get("Fat")}</td>
      <td class="num">${get("Fibres")}</td>
      <td class="num">${get("Ash")}</td>
      <td class="num">${esc(p.weight)}</td>
      <td class="num">${p.price ? `&pound;${esc(p.price)}` : "On enquiry"}</td>
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
    bodyClass: "modern",
    extra: fonts,
  })}
<a class="skip" href="#main">Skip to content</a>

<header class="site-head">
  <div class="wrap head-in">
    <a class="brand" href="#top"><img src="${IMG}Ardleevan600.jpg" alt="Ardleevan" width="200" height="64"></a>
    <input type="checkbox" id="navtoggle" class="navtoggle">
    <label for="navtoggle" class="burger" aria-hidden="true"><span></span></label>
    <nav class="nav">
      ${site.nav.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join("")}
      <a class="nav-cta" href="${esc(c.whatsappHref)}" rel="noopener">WhatsApp us</a>
    </nav>
  </div>
</header>

<main id="main">
<section class="hero" id="top">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow"><span class="pip"></span>${esc(site.hero.eyebrow)}</p>
      <h1>${para(site.hero.heading)}</h1>
      <p class="lede">${para(site.hero.lede)}</p>
      <div class="cta">
        <a class="btn btn--solid" href="#range">Explore the range</a>
        <a class="btn btn--line" href="#compare">Compare diets</a>
      </div>
      <dl class="hero-stats">
        <div><dt>Varieties</dt><dd>${products.length}</dd></div>
        <div><dt>Protein range</dt><dd>20&ndash;29%</dd></div>
        <div><dt>Bag sizes</dt><dd>${[...new Set(products.map((p) => p.weight))].sort().join(" / ")}</dd></div>
        <div><dt>Preservatives</dt><dd>Natural</dd></div>
      </dl>
    </div>
    <figure class="hero-shot">
      <img src="${IMG}${esc(site.hero.image)}" alt="${esc(site.hero.imageAlt)}" width="1200" height="900">
      <figcaption>${esc(site.strapline)} &middot; ${esc(site.substrapline)}</figcaption>
    </figure>
  </div>
</section>

<section class="marquee" aria-hidden="true">
  <div class="marquee-in">
    ${Array.from({ length: 2 })
      .map(() => products.map((p) => `<span>${esc(p.shortName)}</span>`).join(DOT) + DOT)
      .join("")}
  </div>
</section>

<section class="section" id="range">
  <div class="wrap">
    <header class="sec-head">
      <p class="kicker">01 &mdash; The range</p>
      <h2>Every Chapel Farm diet, in full</h2>
      <p class="section-lede">All ${products.length} varieties are 100% complete and totally balanced, including two grain-free Invest &lsquo;N&rsquo; Digest recipes. Open any card for composition, analytical constituents, nutritional additives and the feeding guide.</p>
    </header>
    <div class="pgrid">
      ${products.map(productCard).join("\n")}
    </div>
  </div>
</section>

<section class="section section--alt" id="compare">
  <div class="wrap">
    <header class="sec-head">
      <p class="kicker">02 &mdash; At a glance</p>
      <h2>Which diet suits your dog?</h2>
    </header>
    ${compareTable(products)}
    <p class="fineprint">${para(site.priceNote)}</p>
  </div>
</section>

<section class="section" id="quality">
  <div class="wrap">
    <header class="sec-head">
      <p class="kicker">03 &mdash; Ingredients</p>
      <h2>${esc(site.quality.heading)}</h2>
    </header>
    <div class="qgrid">
      ${site.quality.points
        .map(
          (p, i) =>
            `<div class="qcard"><span class="qnum">${String(i + 1).padStart(2, "0")}</span><h3>${esc(p.title)}</h3><p>${para(p.text)}</p></div>`,
        )
        .join("")}
    </div>
    <div class="qbody">${paras(site.quality.body)}</div>
  </div>
</section>

<section class="quote">
  <div class="wrap">
    <blockquote>
      <p>${para(site.quote.text)}</p>
      <cite>${esc(site.quote.attribution)}<span>${esc(site.quote.role)}</span></cite>
    </blockquote>
  </div>
</section>

<section class="section" id="about">
  <div class="wrap about-grid">
    <div>
      <p class="kicker">04 &mdash; Our story</p>
      <h2>${esc(site.about.heading)}</h2>
      ${paras(site.about.body)}
      <div class="chapel">
        <h3>${esc(site.chapelFarm.heading)}</h3>
        <p>${para(site.chapelFarm.body)}</p>
      </div>
    </div>
    <div class="about-media">
      <img src="${IMG}${esc(site.about.image)}" alt="${esc(site.about.imageAlt)}" loading="lazy" width="800" height="600">
      ${site.gallery
        .slice(0, 2)
        .map(
          (g) =>
            `<img src="${IMG}${esc(g.image)}" alt="${esc(g.alt)}" loading="lazy" width="800" height="600">`,
        )
        .join("")}
    </div>
  </div>
</section>

<section class="section section--alt" id="buy">
  <div class="wrap">
    <header class="sec-head">
      <p class="kicker">05 &mdash; Stockist</p>
      <h2>${esc(site.buying.heading)}</h2>
      <p class="section-lede">${para(site.buying.lede)}</p>
    </header>
    <div class="bgrid">
      ${site.buying.cards
        .map(
          (card) => `<div class="bcard">
        <h3>${esc(card.title)}</h3>
        <p>${para(card.text)}</p>
        ${card.link ? `<a class="card-link" href="${esc(card.link.href)}" rel="noopener">${esc(card.link.label)} &rarr;</a>` : ""}
      </div>`,
        )
        .join("")}
    </div>
  </div>
</section>

<section class="contact" id="contact">
  <div class="wrap">
    <p class="kicker kicker--light">06 &mdash; ${esc(c.area)}</p>
    <h2>${esc(c.heading)}</h2>
    <p class="section-lede">${para(c.lede)}</p>
    <div class="contact-grid">
      <a class="ccard" href="${esc(c.whatsappHref)}" rel="noopener"><span>WhatsApp</span><strong>${esc(c.phoneDisplay)}</strong></a>
      <a class="ccard" href="${esc(c.phoneHref)}"><span>Phone</span><strong>${esc(c.phoneDisplay)}</strong></a>
      <a class="ccard" href="mailto:${esc(c.email)}"><span>Email</span><strong>${esc(c.email)}</strong></a>
      <a class="ccard" href="${esc(c.facebook)}" rel="noopener"><span>Facebook</span><strong>${esc(c.facebookLabel)}</strong></a>
    </div>
  </div>
</section>
</main>

<footer class="site-foot">
  <div class="wrap foot-in">
    <p>&copy; ${new Date().getFullYear()} ${esc(site.brand)} Dog Food &mdash; information only, no online ordering.</p>
    <p>GB customers order from <a href="https://chapelfarmdogfood.co.uk" rel="noopener">Chapel Farm Dog Foods</a>.</p>
  </div>
</footer>
${structuredData(site, products)}
</body>
</html>
`;
}
