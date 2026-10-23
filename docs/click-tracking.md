# Click tracking and affiliate links

Every "Shop" button links to `/go/<product-id>?d=<destination>&k=<packing-kind>`. The route:

1. Logs a `parche.product_click` JSON line (visible in Vercel → Logs).
2. Inserts the same event into the Supabase table `product_clicks` if it exists (best effort, 1.5 s timeout, never blocks the redirect).
3. Redirects (302) to the product's `affiliateUrl` when one is set, otherwise to the exact `productUrl` tagged with `utm_source=parche&utm_medium=referral&utm_campaign=travel-edit`.

## Turning on affiliate revenue

When a programme approves parché (Awin, Rakuten, Impact, Partnerize, Amazon…), generate the tracking link for the exact product and add it to that record in `lib/product-catalogue.ts`:

```ts
"affiliateUrl": "https://www.awin1.com/cread.php?awinmid=…&ued=…",
```

No UI change is needed. Zara has no public affiliate programme; H&M and UNIQLO programmes vary by region, so those links currently send untracked (UTM-only) traffic.

## Optional Supabase table

Run once in the Supabase SQL editor:

```sql
create table if not exists public.product_clicks (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  product_id text not null,
  brand text,
  tier text,
  kind text,
  destination text,
  affiliate boolean default false,
  referrer text
);
alter table public.product_clicks enable row level security;
create policy "anyone can log a click" on public.product_clicks for insert to anon with check (true);
```

Reads stay private (no select policy). Query clicks per brand or destination from the dashboard.

## Catalogue maintenance

Records expire 30 days after `checkedAt` (`reviewedProducts`). Re-verify name, price, image and URL on each retailer page before bumping the date. Retailer prices can include temporary sale pricing.
