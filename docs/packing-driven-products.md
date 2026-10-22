# Packing-driven wardrobe

The packing plan is the source of truth for product selection. Weather sets cold/mild/hot/unknown needs; location adds coastal or coverage context and a styling palette; activity adds technical categories; style ranks matching options; trip length sets quantities capped at a seven-day laundry rotation. Unknown weather never implies a temperature. Seasonal weather stays labelled as historical guidance.

## Design lock and decisions
Primary target: existing parché results screen (white canvas, black type, sand section labels, rounded merchant image cards). User request controls the workflow: expanded clothing/accessory list first, exact product suggestions from each item. Refero craft-details supplies semantic checkboxes, 44px targets, focus rings, reserved image slots, responsive columns and anchor scroll offset. Prior live Refero access was unavailable; no paid research subscription added.

Packing categories remain visible even when no merchant product exists. Each row provides a quantity, rationale, optional status and link to relevant options. Packed state is local to the mounted trip view and resets on a new destination/date range. Mobile stacks groups and product cards. No budget intake and no monetization messaging.

## Catalogue
30 reviewed products from official Sunspel/ASKET pages and Organic Basics' public catalogue cover everyday tops, shirts, trousers, knitwear, swimwear, hats, scarves and day bags. Exact category and climate matches are mandatory; wardrobe selection respects women/men/unisex labels. Within each tier, style and destination palette rank products deterministically. A missing technical top, rain shell, coat, footwear, lightweight trouser or daypack produces guidance rather than a fabricated substitute. Not every category has all three tiers yet.

Product page URLs, photos, currency and prices remain together. Snapshot review date: 2026-10-22. Records expire after 30 days. Merchant inventory and shipping are not live guarantees. Paid AI and affiliate setup are not used.

## Validation
22 automated tests cover differing city/coastal/cold/active lists, weekly quantity limits, missing weather, exact category matching, tier selection, style ranking, and existing trip/weather behavior. TypeScript and production build required. Preview checks cover packing-to-product interaction and destination changes.
