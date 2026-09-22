# Ardleevan Dog Food — website

Information-only single-page site for Ardleevan, the Northern Ireland / Ireland distributor of
Chapel Farm Premium Dog Food. **No ordering, no cart, no payment** — enquiries go to WhatsApp,
phone, email or Facebook.

Two candidate designs are built from one shared content source so the copy can never drift apart:

| Style | Path | Character |
| --- | --- | --- |
| Heritage Field | `/heritage/` | Forest green + cream, serif headlines, full-bleed field photography, alternating product rows |
| Modern Performance | `/modern/` | Off-white + amber, geometric type, product cards with nutrition stat blocks |

`/` serves a chooser page linking to both. Once a style is picked, see *Promoting the chosen style*.

## Local development

```sh
node build.mjs --serve      # build + http://localhost:4173
node build.mjs              # build only, into dist/
```

No dependencies, no install step. Requires Node 18+.

## Editing content

All words, prices and contact details live in two files. Never edit `dist/` — it is generated.

- `content/site.json` — brand copy, hero, about, quality, where-to-buy, contact details, nav
- `content/products.json` — all five Chapel Farm varieties, each with composition, analytical
  constituents, additives, nutritional additives and the full feeding guide

Layout lives in `build/heritage.mjs` and `build/modern.mjs`; styling in `styles/*.css`.
Images live in `assets/img/` — drop a higher-resolution file over an existing name and rebuild.

## Deployment

Pushing to `main` triggers `.github/workflows/pages.yml`, which runs `node build.mjs` and publishes
`dist/` to GitHub Pages. Pages must be set to **Source: GitHub Actions** in repository settings.

### Cutting over to ardleevandogfood.co.uk

The custom domain is deliberately *not* configured yet, so the preview stays reachable at
`https://zagware.github.io/ardleevan-website/` while the WordPress site remains live on the domain.

To cut over:

1. Point DNS at GitHub Pages — four `A` records for the apex (`185.199.108.153`, `185.199.109.153`,
   `185.199.110.153`, `185.199.111.153`) and a `CNAME` for `www` → `zagware.github.io`.
2. `echo ardleevandogfood.co.uk > CNAME && git commit -am "Add custom domain" && git push`
   (the build copies a root `CNAME` into `dist/` automatically).
3. Set the custom domain in Settings → Pages and enable *Enforce HTTPS* once the certificate issues.

## Promoting the chosen style

In `build.mjs`, drop the losing entry from `STYLES`, change the winner's `slug` to `"."`, or simply
have the build write the winner to `dist/index.html` instead of the chooser. Then delete the unused
template and stylesheet.
