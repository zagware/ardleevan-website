# Ardleevan Dog Food — website

Information-only single-page site for Ardleevan, the Northern Ireland / Ireland distributor of
Chapel Farm Premium Dog Food. **No ordering, no cart, no payment** — enquiries go to WhatsApp,
phone, email or Facebook.

Design: *Heritage Field* — forest green and cream, serif headlines, full-bleed field photography,
alternating product rows. Served at `/`.

## Local development

```sh
node build.mjs --serve      # build + http://localhost:4173
node build.mjs              # build only, into dist/
```

No dependencies, no install step. Requires Node 18+.

## Editing content

All words, prices and contact details live in two files. Never edit `dist/` — it is generated.

- `content/site.json` — brand copy, hero, about, quality, where-to-buy, contact details, nav
- `content/products.json` — every Chapel Farm variety, each with composition, analytical
  constituents, additives, nutritional additives and the full feeding guide

Layout lives in `build/heritage.mjs` (shared helpers in `build/lib.mjs`); styling in
`styles/heritage.css`. Images live in `assets/img/` — drop a higher-resolution file over an existing
name and rebuild.

Page-relative paths matter: the page is served from the site root, so image `src` values are
`assets/img/…` with no leading `../`.

## Deployment

Pushing to `main` triggers `.github/workflows/pages.yml`, which runs `node build.mjs` and publishes
`dist/` to GitHub Pages. Pages must be set to **Source: GitHub Actions** in repository settings.

Preview: <https://zagware.github.io/ardleevan-website/>

## Cutting over to ardleevandogfood.co.uk

The custom domain is deliberately *not* configured yet, so the preview stays reachable while the
WordPress site remains live on the domain. Setting it early would 301 the preview URL onto a domain
still pointing at WordPress.

This repo publishes via a GitHub Actions workflow, so the domain binding lives **only** in repository
settings — a `CNAME` file in the artifact is ignored and is not required.

Owner-facing DNS instructions: [`DNS-CUTOVER.md`](DNS-CUTOVER.md). Once the owner confirms the zone
is updated:

1. Settings → Pages → **Custom domain** = `ardleevandogfood.co.uk`, Save.
2. Enable *Enforce HTTPS* once the certificate issues.
