# Ardleevan Dog Food: website

Information-only site for Ardleevan, the Northern Ireland / Ireland distributor of Chapel Farm Premium Dog Food. There is **no ordering, cart or payment**. Enquiries go to WhatsApp, phone, email or Facebook.

It is built with the [Zagware website framework](https://github.com/zagware/website-framework) (`@zagware/site-framework`, pinned in `package.json`) and uses the *heritage* theme.

| | URL |
|---|---|
| Preview (framework version, noindex) | https://zagware.github.io/ardleevan-website-next/ |
| Original hand-built preview (for comparison) | https://zagware.github.io/ardleevan-website/ |
| Production (after cutover) | https://ardleevandogfood.co.uk/ |

## Develop

```sh
npm install
npx zsite dev .          # http://localhost:4173, live reload (--port to change)
npx zsite check .        # builds every target; fails on warnings, broken links, undeclared third parties
```

## Editing content

All wording, prices and contact details are in two files. Never edit `dist/`; it is generated.

- `content/site.json`: brand copy, hero, about, quality, where-to-buy, contact details, nav.
- `content/products.json`: every Chapel Farm variety, each with composition, analytical constituents, additives, nutritional additives and the full feeding guide.

`site.config.mjs` maps that content onto framework sections (hero, showcase, table, split, gallery, cards, contact, privacy notice). Site-only styling lives in `styles/site.css`.

Images live in `assets/img/`. To replace one, drop a new file over the existing name. Responsive WebP versions are generated at build time.

## Deploy

- **Preview:** every push to `main` runs `.github/workflows/preview-pages.yml` and publishes to GitHub Pages.
- **Production:** the site is hosted on Cloudflare. Follow [CLOUDFLARE-CUTOVER.md](CLOUDFLARE-CUTOVER.md), then `git tag v1.0.0 && git push --tags`, which runs `.github/workflows/deploy-cloudflare.yml`.
- [DNS-CUTOVER.md](DNS-CUTOVER.md) is the earlier plan to serve the domain from GitHub Pages. It still works as a fallback, but Cloudflare is now the recommended host.

## Privacy

The site sets no cookies and loads nothing from third parties: fonts are self-hosted and there are no embeds or analytics. `/privacy/` is generated from what the site does. **The owner should review it before launch.**
