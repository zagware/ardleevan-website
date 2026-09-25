// Ardleevan — Chapel Farm Premium Dog Food stockist (information-only site).
//
// Copy lives in content/site.json and content/products.json (unchanged from the
// hand-built version, so the owner's edits keep the same shape). This file maps
// that content onto Zagware framework sections. Run `npx zsite components` to
// see every section type.
import { readFileSync } from "node:fs";

const load = (file) => JSON.parse(readFileSync(new URL(`./content/${file}`, import.meta.url), "utf8"));
const site = load("site.json");
const products = load("products.json");

// The source data spells constituent keys three ways ("Crude Protein", "Protein", "Fat content").
const constituent = (p, key) => p.constituents[key] ?? p.constituents[`Crude ${key}`] ?? p.constituents[`${key} content`] ?? "–";
const shortLabel = (key) => key.replace(/^Crude /, "");
const bagSizes = [...new Set(products.map((p) => p.weight))].join(" & ");
const c = site.contact;

const showcaseItems = products.map((p) => ({
  id: p.id,
  eyebrow: p.stage,
  title: p.name,
  tagline: p.tagline,
  text: p.summary,
  image: `img/${p.image}`,
  imageAlt: p.imageAlt,
  bullets: p.highlights,
  chips: Object.entries(p.constituents).map(([k, v]) => ({ value: v, label: shortLabel(k) })),
  meta: [`Best for: ${p.bestFor}`, `${p.weight} bag · guide price £${p.price}`],
  details: {
    summary: "Full composition & feeding guide",
    text: p.description,
    groups: [
      { heading: "Composition", text: p.composition, wide: true },
      { heading: "Analytical constituents", pairs: { ...p.constituents, ...(p.extraConstituents ?? {}) } },
      { heading: "Additives", text: p.additives },
      { heading: "Nutritional additives", pairs: p.nutritionalAdditives, wide: true },
      { heading: "Feeding guide", wide: true, text: p.feeding.intro, table: p.feeding.table, bullets: p.feeding.notes },
    ],
  },
  schema: { "@type": "Product", brand: { "@type": "Brand", name: "Chapel Farm" }, weight: p.weight },
}));

export default {
  name: site.brand,
  description: site.description,
  lang: "en-GB",
  urls: {
    production: `${site.url}/`,
    pages: "https://zagware.github.io/ardleevan-website-next/",
  },
  logo: { src: "img/Ardleevan600.jpg", width: 600, height: 202, wordmark: true },
  topbar: [site.strapline, site.substrapline],
  theme: {
    preset: "heritage",
    tokens: { "--nav-h": "84px", "--logo-h": "58px" },
  },
  nav: site.nav.map((n) => ({ label: n.label, href: `/${n.href}` })),
  socials: [{ network: "facebook", href: c.facebook, label: c.facebookLabel }],
  footer: {
    owner: `${site.brand} Dog Food`,
    text: "Information only -- no online ordering.",
    smallprint: "GB customers: order from [Chapel Farm Dog Foods](https://chapelfarmdogfood.co.uk).",
  },
  seo: {
    ogImage: `img/${site.hero.image}`,
    organization: {
      description: site.description,
      email: c.email,
      telephone: c.phoneHref.replace("tel:", ""),
      areaServed: "Northern Ireland and Ireland",
    },
  },
  privacy: {
    controller: { name: `${site.brand} Dog Food`, email: c.email, phone: c.phoneDisplay, address: c.area },
    regulator: "ico",
    updated: "24 September 2026",
  },

  pages: [
    {
      path: "/",
      title: "Ardleevan | Chapel Farm Premium Dog Food for Working Dogs",
      sections: [
        {
          type: "hero",
          eyebrow: site.hero.eyebrow,
          title: site.hero.heading,
          lede: site.hero.lede,
          image: `img/${site.hero.image}`,
          imageAlt: site.hero.imageAlt,
          overlay: 0.45,
          actions: [
            { label: "See the range", href: "/#range", style: "accent" },
            { label: "Ask about pricing", href: "/#contact", style: "outline" },
          ],
        },
        {
          type: "cards",
          tone: "dark",
          style: "plain",
          columns: 4,
          items: site.quality.points.map((p) => ({ title: p.title, text: p.text })),
        },
        {
          type: "showcase",
          id: "range",
          eyebrow: "The complete Chapel Farm range",
          heading: "A diet for every stage",
          intro: `${products.length} varieties, every one 100% complete and totally balanced -- including two grain-free Invest ‘N’ Digest recipes for sensitive dogs. Expand any variety for its full composition, analytical constituents and feeding guide.`,
          items: showcaseItems,
        },
        {
          type: "quote",
          background: "img/Siloulette.jpg",
          text: site.quote.text,
          author: site.quote.attribution,
          role: site.quote.role,
        },
        {
          type: "table",
          id: "compare",
          tone: "alt",
          eyebrow: "At a glance",
          heading: "Compare the range",
          headers: ["Variety", "Best for", "Protein", "Fat", "Fibre", "Ash", "Bag", "Guide price"],
          rows: products.map((p) => [
            `[${p.shortName}](/#${p.id})`,
            p.bestFor,
            constituent(p, "Protein"),
            constituent(p, "Fat"),
            constituent(p, "Fibres"),
            constituent(p, "Ash"),
            p.weight,
            `£${p.price}`,
          ]),
          note: site.priceNote,
        },
        {
          type: "split",
          id: "quality",
          eyebrow: "Ingredients",
          heading: site.quality.heading,
          paragraphs: site.quality.body,
          factsHeading: site.chapelFarm.heading,
          factsText: site.chapelFarm.body,
          facts: [
            { label: "Calcium (core adult range)", value: "1.2% – 2.0%" },
            { label: "Preservatives", value: "Natural antioxidants only" },
            { label: "Grain-free options", value: "Salmon & Duck" },
            { label: "Bag sizes", value: bagSizes },
          ],
        },
        {
          type: "split",
          id: "about",
          tone: "dark",
          reverse: true,
          eyebrow: "Our story",
          heading: site.about.heading,
          paragraphs: site.about.body,
          image: `img/${site.about.image}`,
          imageAlt: site.about.imageAlt,
        },
        {
          type: "gallery",
          columns: 3,
          images: site.gallery.map((g) => ({ src: `img/${g.image}`, alt: g.alt, caption: g.caption })),
        },
        {
          type: "cards",
          id: "buy",
          tone: "alt",
          eyebrow: "Stockist",
          heading: site.buying.heading,
          intro: site.buying.lede,
          columns: 4,
          items: site.buying.cards.map((card) => ({
            title: card.title,
            text: card.text,
            ...(card.link ? { href: card.link.href, linkLabel: card.link.label } : {}),
          })),
        },
        {
          type: "contact",
          id: "contact",
          tone: "dark",
          eyebrow: c.area,
          heading: c.heading,
          body: c.lede,
          methods: [
            { kind: "whatsapp", label: `WhatsApp ${c.phoneDisplay}`, href: c.whatsappHref, style: "accent" },
            { kind: "phone", label: `Call ${c.phoneDisplay}`, href: c.phoneHref, style: "outline" },
            { kind: "email", label: c.email, href: `mailto:${c.email}`, style: "outline" },
            { kind: "facebook", label: c.facebookLabel, href: c.facebook, style: "outline" },
          ],
        },
      ],
    },
    {
      path: "/privacy/",
      title: "Privacy notice",
      description: "How Ardleevan Dog Food handles personal information.",
      sections: [{ type: "privacy-notice" }],
    },
  ],
};
