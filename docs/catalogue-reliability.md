# Catalogue reliability

Goal: a shopper who clicks through a packing list never lands on a run of dead or wrongly priced products.
Five layers keep the catalogue honest, cheapest first. All of them run in `.github/workflows/catalogue-refresh.yml`, every day at 09:17 UTC, except the click-time check, which runs on the site.

## 1. Shopify feed brands, daily (about 85% of products)

`scripts/catalogue/ingest-shopify.mjs` reads every store's full `/products.json` feed and keeps only variants marked available, with the store's current price and photo. Sold-out or discontinued products drop out on the next daily run. No Firecrawl, no cost.

If a store's feed fails on a given day, `build.mjs` keeps that store's products from the previous catalogue with their original check date, so a short outage doesn't empty its shelf. They disappear on their own if the feed stays down past the 10-day feed window.

## 2. Hand-captured brands: the daily sweep (`scripts/catalogue/sweep.mjs`)

For brands without a public feed (H&M, UNIQLO, ZARA, Nike, The North Face, Columbia, adidas and the others in `data/raw/seed/`):

1. **Listing pages.** The pages in `scripts/catalogue/sweep-sources.json` are re-captured through the Firecrawl API and parsed by `scripts/catalogue/parsers.mjs` (no AI extraction; a photo is kept only when it carries the product's own code). One page re-confirms 20–100 products. New-season pieces are added.
2. **Product pages.** Displayed products the listings didn't confirm are opened one by one, most-clicked first, up to `SWEEP_PAGE_BUDGET` pages a day (default 60). The verdict comes from the retailer's own schema.org data for that exact colour (Nike: the Firecrawl Nike product provider):

| Verdict | What happens |
|---|---|
| Still sold | Re-checked today; price updated if it changed |
| Sold out | Hidden at once; re-checked weekly; dropped after 30 days if it never comes back |
| Gone (404, or that colour no longer offered) | Removed after the second sighting on a separate day |
| Unknown (blocked, no structured data) | Nothing changes; never acted on |

A brand whose pages load but never carry product data is skipped for two weeks so credits aren't wasted. Outages and blocks never trigger that.

Each run writes `data/raw/sweep-report.md` (what was checked, price changes, removals) and `data/raw/sweep-state.json`.

**Turning it on** (repository → Settings → Secrets and variables → Actions):

- Secret `FIRECRAWL_API_KEY` (required). Without it the sweep step skips and seed products keep the 30-day window.
- Secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (optional): rank product checks by clicks from the `product_clicks` table. The service-role key is needed because clicks are not publicly readable.
- Variable `SWEEP_PAGE_BUDGET` (optional): product pages checked per day.

**Cost estimate:** about 25 listing pages (1 credit each, more when Firecrawl needs its anti-blocking proxy), 10 Nike searches (5 credits each) and up to 60 product checks (1 credit each, 5 for Nike), so roughly 150–250 credits a day at the default budget. Lower `SWEEP_PAGE_BUDGET` to spend less; raise it to cycle through every displayed product faster.

## 3. Short freshness window

`lib/selection.ts` hides a product once it has gone unconfirmed for `maxAgeDays`:

- Feed products: 10 days.
- Seed products of brands the sweep covered in the last 2 days: 10 days.
- Everything else (brands the sweep can't reach yet, curated picks): 30 days. The twice-monthly scheduled refresh re-captures those.

If the sweep stops (key removed, Firecrawl down), the window goes back to 30 days on its own rather than emptying those brands.

## 4. Photo check (`scripts/catalogue/check-images.mjs`)

After each build, every product photo is requested from its CDN. Products whose photo is gone (404/410) are removed. Blocked or slow answers change nothing, and if more than 5% of photos suddenly answer 404 the step assumes blocking and removes nothing.

## 5. Click-time check (`app/go/[id]/route.ts`)

Every Shop button goes through `/go/<id>`. For Shopify feed products the route asks the store (`/products/<handle>.js`, 0.9 s timeout) whether that exact colour is still for sale. If it isn't, the shopper lands on `/unavailable/<id>`, which shows the closest alternatives for the same piece (same wardrobe, same tier first, nearest price, at most two per brand). Anything slow or unclear sends the shopper on to the retailer as usual. Each catch is logged as `parche.product_unavailable` in Vercel logs.

Retailers that block automated requests (H&M, Nike, ZARA…) can't be checked at click time; layers 2 and 3 cover them.

## Tests

`npm test` covers the freshness windows, alternatives ranking, click-time availability decisions (`tests/reliability.test.ts`) and the parsers, product verdicts and seed merging (`scripts/catalogue/parsers.test.mjs`).
