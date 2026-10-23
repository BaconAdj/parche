import type { PackingKind, PackingPlan } from './packing'
import type { Trip } from './trip'
// Merchant page, photo and price are kept together as one reviewed record.
// affiliateUrl is optional: once a programme approves parché, paste its tracking link here and
// /go/[id] starts sending traffic through it — no UI change needed.
export type Product = { id: string; gender: 'women' | 'men' | 'unisex'; tier: 'High-end' | 'Quality' | 'Budget'; brand: string; name: string; price: number; currency: string; productUrl: string; imageUrl: string; details: string; checkedAt: string; kinds: PackingKind[]; climates: PackingPlan['climate'][]; colours: string[]; styles: Trip['style'][]; affiliateUrl?: string }
export const catalogue: Product[] = [
  {
    "id": "sunspel-w-tee",
    "gender": "women",
    "tier": "High-end",
    "brand": "Sunspel",
    "name": "Classic T-shirt — White",
    "price": 95,
    "currency": "USD",
    "productUrl": "https://us.sunspel.com/products/womens-cotton-t-shirt-in-white-wtsh0032",
    "imageUrl": "https://us.sunspel.com/cdn/shop/files/wtsh0183-whaa-1_33c0ef39-0a94-4ee1-b392-f8fbae9c7a16.jpg?v=1789057745&width=800",
    "details": "Supima cotton; made in England.",
    "checkedAt": "2026-10-22",
    "kinds": [
      "tee"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [
      "understated",
      "relaxed"
    ],
    "colours": [
      "white"
    ]
  },
  {
    "id": "asket-w-tee",
    "gender": "women",
    "tier": "Quality",
    "brand": "ASKET",
    "name": "The T-Shirt — White",
    "price": 75,
    "currency": "CAD",
    "productUrl": "https://www.asket.com/en-ca/womens-t-shirt-white",
    "imageUrl": "https://images.asket.com/products/images/440_YTE-WS-WHI-slideshow_1-original.jpg",
    "details": "Organic cotton with a straight, relaxed fit.",
    "checkedAt": "2026-10-22",
    "kinds": [
      "tee"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [
      "understated",
      "relaxed"
    ],
    "colours": [
      "white"
    ]
  },
  {
    "id": "ob-w-tee",
    "gender": "women",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "True Regular Tee — White",
    "price": 36,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/womens-true-regular-tee-white",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/cqt2mfxyz1mjrph7su0w.jpg?v=1723549862",
    "details": "Organic cotton with a ribbed crewneck.",
    "checkedAt": "2026-10-22",
    "kinds": [
      "tee"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [
      "understated",
      "relaxed"
    ],
    "colours": [
      "white"
    ]
  },
  {
    "id": "sunspel-m-tee",
    "gender": "men",
    "tier": "High-end",
    "brand": "Sunspel",
    "name": "Classic T-shirt — White",
    "price": 98,
    "currency": "USD",
    "productUrl": "https://us.sunspel.com/products/mens-short-sleeve-crew-neck-t-shirt-white",
    "imageUrl": "https://us.sunspel.com/cdn/shop/files/mtsh0001-whaa-1_930c05cc-bbc8-473f-b115-6d34fa3c02f2.jpg?v=1791899277&width=800",
    "details": "Supima cotton; made in England.",
    "checkedAt": "2026-10-22",
    "kinds": [
      "tee"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [
      "understated",
      "relaxed"
    ],
    "colours": [
      "white"
    ]
  },
  {
    "id": "asket-m-tee",
    "gender": "men",
    "tier": "Quality",
    "brand": "ASKET",
    "name": "The T-Shirt — Black",
    "price": 75,
    "currency": "CAD",
    "productUrl": "https://www.asket.com/en-ca/mens-t-shirt-black",
    "imageUrl": "https://images.asket.com/products/images/2_TEE-MA-BLA-slideshow_1-original.jpg",
    "details": "Organic cotton in a versatile black colour.",
    "checkedAt": "2026-10-22",
    "kinds": [
      "tee"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [
      "understated",
      "relaxed"
    ],
    "colours": [
      "black"
    ]
  },
  {
    "id": "ob-m-tee",
    "gender": "men",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "True Boxy Fit Tee — Artichoke",
    "price": 25.9,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/mens-true-boxy-fit-tee-artichoke",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/dg_organic_basics-men-organic_cotton-true-boxy_fit_tee-artichoke-studio-1.jpg?v=1734604826",
    "details": "Organic cotton with a boxy fit. Sale price; final-sale terms may apply.",
    "checkedAt": "2026-10-22",
    "kinds": [
      "tee"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [
      "understated",
      "relaxed"
    ],
    "colours": [
      "green"
    ]
  },
  {
    "id": "womens-core-straight-leg-pants-black",
    "gender": "women",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "Core Straight Leg Pants — Black",
    "price": 75,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/womens-core-straight-leg-pants-black",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/dg_ob-wonen-organic_cotton-core-straight_leg_pants-black-studio-1.jpg?v=1738671379",
    "kinds": [
      "trousers"
    ],
    "climates": [
      "mild",
      "unknown"
    ],
    "styles": [],
    "colours": [
      "black"
    ],
    "details": "Check the exact fit, fabric and available sizes on the product page.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "womens-everyday-straight-leg-pants-stone-blue",
    "gender": "women",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "Everyday Straight Leg Pants — Stone Blue",
    "price": 56,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/womens-everyday-straight-leg-pants-stone-blue",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/ynj3r8sugcfi4ici3tjp.jpg?v=1723645443",
    "kinds": [
      "trousers"
    ],
    "climates": [
      "mild",
      "unknown"
    ],
    "styles": [
      "relaxed",
      "statement"
    ],
    "colours": [
      "blue"
    ],
    "details": "Check the exact fit, fabric and available sizes on the product page.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "true-knit-sweater-almond",
    "gender": "women",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "True Knit Sweater — Almond",
    "price": 83,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/true-knit-sweater-almond",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/dg_organic_basics-women-organic_cotton-true_knit-sweater-almond-studio-2.jpg?v=1726402741",
    "kinds": [
      "knit"
    ],
    "climates": [
      "mild",
      "unknown"
    ],
    "styles": [
      "relaxed"
    ],
    "colours": [
      "almond"
    ],
    "details": "Check the exact fit, fabric and available sizes on the product page.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "true-knit-sweater-navy",
    "gender": "women",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "True Knit Sweater — Navy",
    "price": 83,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/true-knit-sweater-navy",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/dg_organic_basics-women-organic_cotton-true_knit-sweater-navy-studio-4.jpg?v=1726402324",
    "kinds": [
      "knit"
    ],
    "climates": [
      "mild",
      "unknown"
    ],
    "styles": [
      "understated"
    ],
    "colours": [
      "navy"
    ],
    "details": "Check the exact fit, fabric and available sizes on the product page.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "womens-fine-knit-v-neck-sweater-dark-grey-melange",
    "gender": "women",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "Fine Knit V-Neck Sweater — Dark Grey",
    "price": 74.2,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/womens-fine-knit-v-neck-sweater-dark-grey-melange",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/FineKnitVNeck_Grey_e5417ac7-e00d-4793-b087-a60b33ab8376.jpg?v=1764775587",
    "kinds": [
      "knit"
    ],
    "climates": [
      "mild",
      "unknown",
      "hot"
    ],
    "styles": [
      "polished"
    ],
    "colours": [
      "grey"
    ],
    "details": "Check the exact fit, fabric and available sizes on the product page.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "womens-swim-open-back-one-piece-dove-blue",
    "gender": "women",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "Swim Open Back One-Piece — Dove Blue",
    "price": 48.5,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/womens-swim-open-back-one-piece-dove-blue",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/dg_organic_basics-women-swim-open_back_one_piece-dove_blue-studio-1.jpg?v=1738670580",
    "kinds": [
      "swim"
    ],
    "climates": [
      "hot",
      "mild",
      "unknown"
    ],
    "styles": [],
    "colours": [
      "blue"
    ],
    "details": "Check the exact fit, fabric and available sizes on the product page.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "core-casual-cap-sandstone",
    "gender": "unisex",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "Core Casual Cap — Sandstone",
    "price": 19.5,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/core-casual-cap-sandstone",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/dg_ob-unisex-organic_cotton-core-casual-cap-sandstone-packshot-1.jpg?v=1751370694",
    "kinds": [
      "sun-hat"
    ],
    "climates": [
      "hot",
      "mild",
      "unknown"
    ],
    "styles": [
      "understated"
    ],
    "colours": [
      "sandstone"
    ],
    "details": "Check the exact fit, fabric and available sizes on the product page.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "core-casual-cap-azure-blue",
    "gender": "unisex",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "Core Casual Cap — Azure Blue",
    "price": 19.5,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/core-casual-cap-azure-blue",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/dg_ob-unisex-organic_cotton-core-casual-cap-azure_blue-packshot-1.jpg?v=1751370706",
    "kinds": [
      "sun-hat"
    ],
    "climates": [
      "hot",
      "mild",
      "unknown"
    ],
    "styles": [
      "understated"
    ],
    "colours": [
      "blue"
    ],
    "details": "Check the exact fit, fabric and available sizes on the product page.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "core-casual-cap-black",
    "gender": "unisex",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "Core Casual Cap — Black",
    "price": 35,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/core-casual-cap-black",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/dg_ob-unisex-organic_cotton-core-casual-cap-black-packshot-1.jpg?v=1751370682",
    "kinds": [
      "sun-hat"
    ],
    "climates": [
      "hot",
      "mild",
      "unknown"
    ],
    "styles": [
      "understated"
    ],
    "colours": [
      "black"
    ],
    "details": "Check the exact fit, fabric and available sizes on the product page.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "core-casual-cap-vibrant-red",
    "gender": "unisex",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "Core Casual Cap — Vibrant Red",
    "price": 19.5,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/core-casual-cap-vibrant-red",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/dg_ob-unisex-organic_cotton-core-casual-cap-red-packshot-1.jpg?v=1751370727",
    "kinds": [
      "sun-hat"
    ],
    "climates": [
      "hot",
      "mild",
      "unknown"
    ],
    "styles": [
      "statement"
    ],
    "colours": [
      "red"
    ],
    "details": "Check the exact fit, fabric and available sizes on the product page.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "womens-alley-copenhagen-shoulder-bag-midnight-blue",
    "gender": "women",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "Alley Copenhagen Shoulder Bag — Midnight Blue",
    "price": 60,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/womens-alley-copenhagen-shoulder-bag-midnight-blue",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/dg_organic_basics-women-organic_cotton-alley-copenhagen_sholder_bag-midnight_blue-studio-1.jpg?v=1783942144",
    "kinds": [
      "bag"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [],
    "colours": [
      "navy"
    ],
    "details": "Check the exact fit, fabric and available sizes on the product page.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "womens-alley-copenhagen-shoulder-bag-black",
    "gender": "women",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "Alley Copenhagen Shoulder Bag — Black",
    "price": 60,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/womens-alley-copenhagen-shoulder-bag-black",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/dg_organic_basics-women-organic_cotton-alley-copenhagen_sholder_bag-black-studio-1.jpg?v=1783942131",
    "kinds": [
      "bag"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [],
    "colours": [
      "black"
    ],
    "details": "Check the exact fit, fabric and available sizes on the product page.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "mens-alley-copenhagen-shoulder-bag-black",
    "gender": "men",
    "tier": "Budget",
    "brand": "Organic Basics",
    "name": "Alley Copenhagen Shoulder Bag — Black",
    "price": 60,
    "currency": "USD",
    "productUrl": "https://us.organicbasics.com/products/mens-alley-copenhagen-shoulder-bag-black",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0677/0340/6886/files/dg_organic_basics-men-organic_cotton-alley-copenhagen_sholder_bag-black-studio-1.jpg?v=1783942116",
    "kinds": [
      "bag"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [],
    "colours": [
      "black"
    ],
    "details": "Check the exact fit, fabric and available sizes on the product page.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "womens-wool-trousers-charcoal-melange",
    "gender": "women",
    "tier": "Quality",
    "brand": "ASKET",
    "name": "The Wool Trousers — Charcoal",
    "price": 360,
    "currency": "CAD",
    "productUrl": "https://www.asket.com/en-ca/womens-wool-trousers-charcoal-melange",
    "imageUrl": "https://images.asket.com/products/images/302_WTR-WR-CLM-slideshow_6-original.jpg",
    "kinds": [
      "warm-trousers"
    ],
    "climates": [
      "cold",
      "mild"
    ],
    "styles": [
      "polished"
    ],
    "colours": [
      "grey"
    ],
    "details": "Merino wool trousers with a high waist and loose fit.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "mens-wool-trousers-charcoal-melange",
    "gender": "men",
    "tier": "Quality",
    "brand": "ASKET",
    "name": "The Wool Trousers — Charcoal",
    "price": 360,
    "currency": "CAD",
    "productUrl": "https://www.asket.com/en-ca/mens-wool-trousers-charcoal-melange",
    "imageUrl": "https://images.asket.com/products/images/300_WT3-MQ-CLM-slideshow_1-original.jpg",
    "kinds": [
      "warm-trousers"
    ],
    "climates": [
      "cold",
      "mild"
    ],
    "styles": [
      "polished"
    ],
    "colours": [
      "grey"
    ],
    "details": "Merino wool trousers with a mid-rise waist and loose fit.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "mens-heavy-wool-sweater-charcoal-melange",
    "gender": "men",
    "tier": "Quality",
    "brand": "ASKET",
    "name": "The Heavy Wool Sweater — Charcoal",
    "price": 290,
    "currency": "CAD",
    "productUrl": "https://www.asket.com/en-ca/mens-heavy-wool-sweater-charcoal-melange",
    "imageUrl": "https://images.asket.com/products/images/131_HWS-MA-CLM-slideshow_1-original.jpg",
    "kinds": [
      "warm-knit"
    ],
    "climates": [
      "cold"
    ],
    "styles": [
      "relaxed"
    ],
    "colours": [
      "grey"
    ],
    "details": "A chunky wool-blend crewneck for layering.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "mens-oxford-shirt-dark-navy",
    "gender": "men",
    "tier": "Quality",
    "brand": "ASKET",
    "name": "The Oxford Shirt — Dark Navy",
    "price": 210,
    "currency": "CAD",
    "productUrl": "https://www.asket.com/en-ca/mens-oxford-shirt-dark-navy",
    "imageUrl": "https://images.asket.com/products/images/5_OXF-MA-DKN-slideshow_1-original.jpg",
    "kinds": [
      "shirt"
    ],
    "climates": [
      "mild",
      "unknown",
      "cold"
    ],
    "styles": [
      "polished"
    ],
    "colours": [
      "navy"
    ],
    "details": "Midweight organic cotton with a button-down collar.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "mens-loose-twill-chino-dark-navy",
    "gender": "men",
    "tier": "Quality",
    "brand": "ASKET",
    "name": "The Loose Twill Chino — Dark Navy",
    "price": 260,
    "currency": "CAD",
    "productUrl": "https://www.asket.com/en-ca/mens-loose-twill-chino-dark-navy",
    "imageUrl": "https://images.asket.com/products/images/237_TC4-MK-DKN-slideshow_1-original.jpg",
    "kinds": [
      "trousers"
    ],
    "climates": [
      "mild",
      "unknown"
    ],
    "styles": [
      "relaxed"
    ],
    "colours": [
      "navy"
    ],
    "details": "Sturdy organic cotton twill with a loose, straight leg.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "ribbed-wool-beanie-black",
    "gender": "unisex",
    "tier": "Quality",
    "brand": "ASKET",
    "name": "The Ribbed Wool Beanie — Black",
    "price": 75,
    "currency": "CAD",
    "productUrl": "https://www.asket.com/en-ca/ribbed-wool-beanie-black",
    "imageUrl": "https://images.asket.com/products/images/15_MWH-MD-BLA-slideshow_1-original.jpg",
    "kinds": [
      "beanie"
    ],
    "climates": [
      "cold"
    ],
    "styles": [],
    "colours": [
      "black"
    ],
    "details": "Extra-fine merino wool with a folded rib knit.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "oversized-cashmere-wool-scarf-dark-navy",
    "gender": "unisex",
    "tier": "Quality",
    "brand": "ASKET",
    "name": "Oversized Cashmere Wool Scarf — Navy",
    "price": 180,
    "currency": "CAD",
    "productUrl": "https://www.asket.com/en-ca/oversized-cashmere-wool-scarf-dark-navy",
    "imageUrl": "https://images.asket.com/products/images/98_OWS-UD-DKN-slideshow_1-original.jpg",
    "kinds": [
      "scarf"
    ],
    "climates": [
      "cold"
    ],
    "styles": [],
    "colours": [
      "navy"
    ],
    "details": "Recycled wool and cashmere in an oversized winter scarf.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "sunspel-w-linen",
    "gender": "women",
    "tier": "High-end",
    "brand": "Sunspel",
    "name": "Linen Shirt — Hazelwood",
    "price": 210,
    "currency": "USD",
    "productUrl": "https://us.sunspel.com/products/womens-linen-shirt-in-hazelwood-wsht2055-brgt",
    "imageUrl": "https://us.sunspel.com/cdn/shop/files/wsht2055-brgt-1.jpg?v=1773852893&width=800",
    "kinds": [
      "linen-shirt",
      "shirt"
    ],
    "climates": [
      "hot",
      "mild",
      "unknown"
    ],
    "styles": [
      "relaxed"
    ],
    "colours": [
      "hazelwood"
    ],
    "details": "Relaxed linen shirt with a curved hem.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "sunspel-m-linen",
    "gender": "men",
    "tier": "High-end",
    "brand": "Sunspel",
    "name": "Linen Shirt — Sky Blue/Navy",
    "price": 374,
    "currency": "CAD",
    "productUrl": "https://www.sunspel.com/en-ca/products/mens-linen-shirt-in-sky-blue-navy-msht2106-stol",
    "imageUrl": "https://www.sunspel.com/cdn/shop/files/msht2106-stol-1_796d3c26-28c5-41e3-9d83-78f990dac29c.jpg?v=1764767738&width=800",
    "kinds": [
      "linen-shirt",
      "shirt"
    ],
    "climates": [
      "hot",
      "mild",
      "unknown"
    ],
    "styles": [
      "polished",
      "statement"
    ],
    "colours": [
      "blue",
      "navy"
    ],
    "details": "Regular-fit linen shirt for wearing buttoned or as a light open layer.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "sunspel-m-swim",
    "gender": "men",
    "tier": "High-end",
    "brand": "Sunspel",
    "name": "Tailored Swim Shorts — Navy",
    "price": 200,
    "currency": "USD",
    "productUrl": "https://us.sunspel.com/products/mens-upcycled-marine-plastic-tailored-swim-short-in-navy",
    "imageUrl": "https://us.sunspel.com/cdn/shop/files/mshr3704-buaa-5.jpg?v=1773852753&width=800",
    "kinds": [
      "swim"
    ],
    "climates": [
      "hot",
      "mild",
      "unknown"
    ],
    "styles": [],
    "colours": [
      "navy"
    ],
    "details": "Recycled polyester swim shorts with an adjustable waist.",
    "checkedAt": "2026-10-22"
  },
  {
    "id": "asket-w-cardigan",
    "gender": "women",
    "tier": "Quality",
    "brand": "ASKET",
    "name": "The Wool Cardigan — Charcoal",
    "price": 330,
    "currency": "CAD",
    "productUrl": "https://www.asket.com/en-ca/womens-wool-cardigan-charcoal-melange",
    "imageUrl": "https://images.asket.com/pim-images/1781698899-asket_ywc-ws-clm_slideshow_1.jpg",
    "details": "Structured wool-blend cardigan with a relaxed fit.",
    "checkedAt": "2026-10-22",
    "kinds": [
      "warm-knit"
    ],
    "climates": [
      "cold"
    ],
    "styles": [
      "polished"
    ],
    "colours": [
      "grey"
    ]
  },
  {
    "id": "uniqlo-w-475649",
    "gender": "women",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Premium Linen Skipper Collar Shirt",
    "price": 29.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E475649-000/00?colorDisplayCode=00",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/475649/item/cagoods_00_475649_3x4.jpg?width=600",
    "details": "100% European linen with an open skipper collar.",
    "kinds": [
      "linen-shirt"
    ],
    "climates": [
      "hot",
      "mild"
    ],
    "styles": [
      "relaxed",
      "understated"
    ],
    "colours": [
      "white"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-w-491380",
    "gender": "women",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Oxford Boxy Long Sleeve Shirt",
    "price": 49.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E491380-000/00?colorDisplayCode=65",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/491380/item/cagoods_65_491380_3x4.jpg?width=600",
    "details": "Boxy oxford cotton that layers easily over a tee.",
    "kinds": [
      "shirt"
    ],
    "climates": [
      "mild",
      "cold",
      "unknown"
    ],
    "styles": [
      "relaxed",
      "understated"
    ],
    "colours": [
      "blue"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-w-487959",
    "gender": "women",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Smart Easy Pants",
    "price": 49.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E487959-000/00?colorDisplayCode=09",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/487959/item/cagoods_09_487959_3x4.jpg?width=600",
    "details": "Elastic-waist trousers with a smart, tailored look.",
    "kinds": [
      "trousers"
    ],
    "climates": [
      "mild",
      "unknown"
    ],
    "styles": [
      "polished",
      "understated"
    ],
    "colours": [
      "black"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-w-487185",
    "gender": "women",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Warm Lined Pants",
    "price": 69.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E487185-000/00?colorDisplayCode=09",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/487185/item/cagoods_09_487185_3x4.jpg?width=600",
    "details": "Lined for colder days without extra bulk.",
    "kinds": [
      "warm-trousers"
    ],
    "climates": [
      "cold"
    ],
    "styles": [
      "understated",
      "relaxed"
    ],
    "colours": [
      "black"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-w-469410",
    "gender": "women",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Merino Crew Neck Sweater",
    "price": 59.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E469410-000/00?colorDisplayCode=55",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/469410/item/cagoods_55_469410_3x4.jpg?width=600",
    "details": "Fine merino wool; packs flat and resists odour.",
    "kinds": [
      "knit"
    ],
    "climates": [
      "mild",
      "cold",
      "unknown"
    ],
    "styles": [
      "understated",
      "polished"
    ],
    "colours": [
      "green"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-w-465734",
    "gender": "women",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Cashmere Crew Neck Sweater",
    "price": 129.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E465734-000/00?colorDisplayCode=99",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/465734/item/cagoods_99_465734_3x4.jpg?width=600",
    "details": "100% cashmere for real warmth at a light weight.",
    "kinds": [
      "warm-knit"
    ],
    "climates": [
      "cold"
    ],
    "styles": [
      "polished",
      "understated"
    ],
    "colours": [
      "grey"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-w-478579",
    "gender": "women",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Seamless Down Long Coat",
    "price": 249.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E478579-000/00?colorDisplayCode=09",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/478579/item/cagoods_09_478579_3x4.jpg?width=600",
    "details": "Down-filled long coat with sealed, seamless quilting.",
    "kinds": [
      "coat"
    ],
    "climates": [
      "cold"
    ],
    "styles": [
      "understated",
      "polished"
    ],
    "colours": [
      "black"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-u-481610",
    "gender": "unisex",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Round Mini Shoulder Bag",
    "price": 24.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E481610-000/00?colorDisplayCode=58",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/481610/item/goods_58_481610_3x4.jpg?width=600",
    "details": "The cult crossbody: compact, water-repellent nylon.",
    "kinds": [
      "bag"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [
      "understated",
      "relaxed",
      "statement"
    ],
    "colours": [
      "green"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-u-488858",
    "gender": "unisex",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Utility Backpack",
    "price": 59.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E488858-000/00?colorDisplayCode=09",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/488858/item/goods_09_488858_3x4.jpg?width=600",
    "details": "Everyday daypack with organised pockets.",
    "kinds": [
      "daypack"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [
      "understated"
    ],
    "colours": [
      "black"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-m-455957",
    "gender": "men",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Premium Linen Shirt",
    "price": 29.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E455957-000/00?colorDisplayCode=34",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/455957/item/cagoods_34_455957_3x4.jpg?width=600",
    "details": "100% European linen in a relaxed regular fit.",
    "kinds": [
      "linen-shirt"
    ],
    "climates": [
      "hot",
      "mild"
    ],
    "styles": [
      "relaxed",
      "understated"
    ],
    "colours": [
      "sand",
      "brown"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-m-470086",
    "gender": "men",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Super Non Iron Stretch Slim Fit Shirt",
    "price": 49.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E470086-000/00?colorDisplayCode=01",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/470086/item/goods_01_470086_3x4.jpg?width=600",
    "details": "Non-iron stretch cotton that comes out of a suitcase smooth.",
    "kinds": [
      "shirt"
    ],
    "climates": [
      "mild",
      "cold",
      "unknown"
    ],
    "styles": [
      "polished",
      "understated"
    ],
    "colours": [
      "white"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-m-487214",
    "gender": "men",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Barrel Chino Pants",
    "price": 49.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E487214-000/00?colorDisplayCode=09",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/487214/item/cagoods_09_487214_3x4.jpg?width=600",
    "details": "A relaxed barrel leg in sturdy cotton twill.",
    "kinds": [
      "trousers"
    ],
    "climates": [
      "mild",
      "unknown"
    ],
    "styles": [
      "relaxed",
      "statement"
    ],
    "colours": [
      "black"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-m-482920",
    "gender": "men",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Linen Blend Relaxed Pants",
    "price": 59.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E482920-000/00?colorDisplayCode=69",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/482920/item/cagoods_69_482920_3x4.jpg?width=600",
    "details": "Breathable linen blend with an easy drawstring waist.",
    "kinds": [
      "light-trousers"
    ],
    "climates": [
      "hot"
    ],
    "styles": [
      "relaxed",
      "understated"
    ],
    "colours": [
      "navy"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-m-487261",
    "gender": "men",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Warm Lined Pants",
    "price": 69.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E487261-000/00?colorDisplayCode=36",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/487261/item/cagoods_36_487261_3x4.jpg?width=600",
    "details": "Lined trousers for cold-weather city days.",
    "kinds": [
      "warm-trousers"
    ],
    "climates": [
      "cold"
    ],
    "styles": [
      "understated"
    ],
    "colours": [
      "brown"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-m-450535",
    "gender": "men",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Merino Crew Neck Sweater",
    "price": 59.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E450535-000/00?colorDisplayCode=69",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/450535/item/cagoods_69_450535_3x4.jpg?width=600",
    "details": "Fine merino wool; layers under a coat or over a shirt.",
    "kinds": [
      "knit"
    ],
    "climates": [
      "mild",
      "cold",
      "unknown"
    ],
    "styles": [
      "understated",
      "polished"
    ],
    "colours": [
      "navy"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-m-450543",
    "gender": "men",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Cashmere Crew Neck Sweater",
    "price": 129.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E450543-000/00?colorDisplayCode=76",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/450543/item/cagoods_76_450543_3x4.jpg?width=600",
    "details": "100% cashmere crew neck.",
    "kinds": [
      "warm-knit"
    ],
    "climates": [
      "cold"
    ],
    "styles": [
      "polished",
      "understated"
    ],
    "colours": [
      "brown"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-m-478280",
    "gender": "men",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Seamless Down Coat",
    "price": 249.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E478280-000/00?colorDisplayCode=07",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/478280/item/cagoods_07_478280_3x4.jpg?width=600",
    "details": "Down-filled with seamless, wind-resistant construction.",
    "kinds": [
      "coat"
    ],
    "climates": [
      "cold"
    ],
    "styles": [
      "understated"
    ],
    "colours": [
      "grey"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-m-482299",
    "gender": "men",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "DRY-EX T-Shirt",
    "price": 29.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E482299-000/00?colorDisplayCode=56",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/482299/item/cagoods_56_482299_3x4.jpg?width=600",
    "details": "Quick-drying, moisture-wicking performance tee.",
    "kinds": [
      "active-top"
    ],
    "climates": [
      "hot",
      "mild",
      "cold",
      "unknown"
    ],
    "styles": [
      "understated"
    ],
    "colours": [
      "green"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "uniqlo-m-485744",
    "gender": "men",
    "tier": "Budget",
    "brand": "UNIQLO",
    "name": "Extra Stretch Active Jogger Pants",
    "price": 49.9,
    "currency": "CAD",
    "productUrl": "https://www.uniqlo.com/ca/en/products/E485744-000/00?colorDisplayCode=68",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/485744/item/cagoods_68_485744_3x4.jpg?width=600",
    "details": "Four-way stretch joggers for movement-heavy days.",
    "kinds": [
      "active-bottoms"
    ],
    "climates": [
      "hot",
      "mild",
      "cold",
      "unknown"
    ],
    "styles": [
      "understated",
      "relaxed"
    ],
    "colours": [
      "blue"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "zara-w-00340151",
    "gender": "women",
    "tier": "Quality",
    "brand": "ZARA",
    "name": "Knotted Linen Shirt — Light blue",
    "price": 45.9,
    "currency": "CAD",
    "productUrl": "https://www.zara.com/ca/en/knotted-linen-shirt-p00340151.html",
    "imageUrl": "https://static.zara.net/assets/public/9171/5181/afc74ca09792/0be54922673d/00340151406-p/00340151406-p.jpg?w=900",
    "details": "Linen shirt with a knotted front hem.",
    "kinds": [
      "linen-shirt"
    ],
    "climates": [
      "hot",
      "mild"
    ],
    "styles": [
      "relaxed",
      "statement"
    ],
    "colours": [
      "blue"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "zara-w-08372248",
    "gender": "women",
    "tier": "Quality",
    "brand": "ZARA",
    "name": "Barrel Pants — Khaki",
    "price": 55.9,
    "currency": "CAD",
    "productUrl": "https://www.zara.com/ca/en/barrel-pants-p08372248.html",
    "imageUrl": "https://static.zara.net/assets/public/7ebe/5499/3056497d870b/8a763405d3de/08372248756-a1/08372248756-a1.jpg?w=900",
    "details": "Curved barrel leg; dress up or down.",
    "kinds": [
      "trousers"
    ],
    "climates": [
      "mild",
      "unknown"
    ],
    "styles": [
      "relaxed",
      "statement"
    ],
    "colours": [
      "green",
      "sand"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "zara-w-02745319",
    "gender": "women",
    "tier": "Quality",
    "brand": "ZARA",
    "name": "Wool-Blend Belted Long Coat — Black",
    "price": 219,
    "currency": "CAD",
    "productUrl": "https://www.zara.com/ca/en/long-wool-belted-coat-p02745319.html",
    "imageUrl": "https://static.zara.net/assets/public/9ce1/29e2/2b1e4f4293c6/5858d45169cd/02745319800-p/02745319800-p.jpg?w=900",
    "details": "Long belted wool-blend coat.",
    "kinds": [
      "coat"
    ],
    "climates": [
      "cold"
    ],
    "styles": [
      "polished",
      "understated"
    ],
    "colours": [
      "black"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "zara-w-08851172",
    "gender": "women",
    "tier": "Quality",
    "brand": "ZARA",
    "name": "Basic Knit Sweater — Navy",
    "price": 45.9,
    "currency": "CAD",
    "productUrl": "https://www.zara.com/ca/en/basic-knit-sweater-p08851172.html",
    "imageUrl": "https://static.zara.net/assets/public/2923/0692/9c214abd98e0/ba93307de791/08851172401-p/08851172401-p.jpg?w=900",
    "details": "A simple knit layer for cool evenings.",
    "kinds": [
      "knit"
    ],
    "climates": [
      "mild",
      "unknown"
    ],
    "styles": [
      "understated",
      "polished"
    ],
    "colours": [
      "navy"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "zara-w-02142283",
    "gender": "women",
    "tier": "Quality",
    "brand": "ZARA",
    "name": "Soft Knit Sweater — Grey marl",
    "price": 79.9,
    "currency": "CAD",
    "productUrl": "https://www.zara.com/ca/en/soft-knit-sweater-p02142283.html",
    "imageUrl": "https://static.zara.net/assets/public/5f32/081a/3da34f0db9df/96bb36dab273/02142283803-p/02142283803-p.jpg?w=900",
    "details": "Soft, chunky knit for cold days.",
    "kinds": [
      "warm-knit"
    ],
    "climates": [
      "cold"
    ],
    "styles": [
      "relaxed",
      "understated"
    ],
    "colours": [
      "grey"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "zara-m-01957102",
    "gender": "men",
    "tier": "Quality",
    "brand": "ZARA",
    "name": "100% Linen Regular Fit Shirt — White",
    "price": 69.9,
    "currency": "CAD",
    "productUrl": "https://www.zara.com/ca/en/100-linen-regular-fit-shirt-p01957102.html",
    "imageUrl": "https://static.zara.net/assets/public/5342/19c0/54ae486cb04b/537bc1a14d1d/01957102250-p/01957102250-p.jpg?w=900",
    "details": "Pure linen in a regular fit.",
    "kinds": [
      "linen-shirt"
    ],
    "climates": [
      "hot",
      "mild"
    ],
    "styles": [
      "polished",
      "understated",
      "relaxed"
    ],
    "colours": [
      "white"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "zara-m-00975785",
    "gender": "men",
    "tier": "Quality",
    "brand": "ZARA",
    "name": "Cotton-Linen Regular Fit Shirt — White",
    "price": 69.9,
    "currency": "CAD",
    "productUrl": "https://www.zara.com/ca/en/cotton-linen-regular-fit-shirt-p00975785.html",
    "imageUrl": "https://static.zara.net/assets/public/83ce/de9b/e7344a3eaa22/90cacc0a8a38/00975785250-p/00975785250-p.jpg?w=900",
    "details": "Cotton-linen blend that breathes from day to dinner.",
    "kinds": [
      "shirt"
    ],
    "climates": [
      "mild",
      "unknown"
    ],
    "styles": [
      "polished",
      "understated"
    ],
    "colours": [
      "white"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "zara-m-01063442",
    "gender": "men",
    "tier": "Quality",
    "brand": "ZARA",
    "name": "Straight Fit Chino Pants — Light khaki",
    "price": 79.9,
    "currency": "CAD",
    "productUrl": "https://www.zara.com/ca/en/straight-fit-chino-pants-p01063442.html",
    "imageUrl": "https://static.zara.net/assets/public/7a54/9f34/a7a9446da6a9/89471ac75619/01063442506-p/01063442506-p.jpg?w=900",
    "details": "Classic straight chino.",
    "kinds": [
      "trousers"
    ],
    "climates": [
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [
      "understated",
      "polished"
    ],
    "colours": [
      "sand",
      "green"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "zara-m-04592381",
    "gender": "men",
    "tier": "Quality",
    "brand": "ZARA",
    "name": "100% Wool Suit Pants — Black",
    "price": 99.9,
    "currency": "CAD",
    "productUrl": "https://www.zara.com/ca/en/100-wool-suit-pants-p04592381.html",
    "imageUrl": "https://static.zara.net/assets/public/3cf5/4743/b5cd478ea12f/191ce057fb63/04592381800-p/04592381800-p.jpg?w=900",
    "details": "Pure wool trousers for cold-weather dinners.",
    "kinds": [
      "warm-trousers"
    ],
    "climates": [
      "cold"
    ],
    "styles": [
      "polished"
    ],
    "colours": [
      "black"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "zara-m-08281615",
    "gender": "men",
    "tier": "Quality",
    "brand": "ZARA",
    "name": "Wool-Blend Relaxed Fit Coat — Black",
    "price": 169,
    "currency": "CAD",
    "productUrl": "https://www.zara.com/ca/en/wool-blend-relaxed-fit-coat-p08281615.html",
    "imageUrl": "https://static.zara.net/assets/public/e058/0eec/09d84cfdaacb/aab80c8989b0/08281615800-p/08281615800-p.jpg?w=900",
    "details": "Relaxed wool-blend overcoat.",
    "kinds": [
      "coat"
    ],
    "climates": [
      "cold"
    ],
    "styles": [
      "understated",
      "polished"
    ],
    "colours": [
      "black"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "zara-m-03284341",
    "gender": "men",
    "tier": "Quality",
    "brand": "ZARA",
    "name": "Regular Fit Purl Knit Sweater — Grey marl",
    "price": 65.9,
    "currency": "CAD",
    "productUrl": "https://www.zara.com/ca/en/regular-fit-knit-sweater-p03284341.html",
    "imageUrl": "https://static.zara.net/assets/public/3aab/dc83/77cd416cb12b/9523629e732d/03284341803-p/03284341803-p.jpg?w=900",
    "details": "Textured purl knit layer.",
    "kinds": [
      "knit"
    ],
    "climates": [
      "mild",
      "unknown"
    ],
    "styles": [
      "understated",
      "relaxed"
    ],
    "colours": [
      "grey"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "zara-m-00304330",
    "gender": "men",
    "tier": "Quality",
    "brand": "ZARA",
    "name": "Basic Turtleneck Jumper — Black",
    "price": 65.9,
    "currency": "CAD",
    "productUrl": "https://www.zara.com/ca/en/basic-turtleneck-jumper-p00304330.html",
    "imageUrl": "https://static.zara.net/assets/public/49d5/349c/25ae415181cc/569cf790cb54/00304330800-p/00304330800-p.jpg?w=900",
    "details": "A neat turtleneck for layering under a coat.",
    "kinds": [
      "warm-knit"
    ],
    "climates": [
      "cold"
    ],
    "styles": [
      "polished",
      "understated"
    ],
    "colours": [
      "black"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "hm-w-one-shoulder-swimsuit-navy",
    "gender": "women",
    "tier": "Budget",
    "brand": "H&M",
    "name": "Padded-Cup One-Shoulder Swimsuit — Navy blue",
    "price": 44.99,
    "currency": "CAD",
    "productUrl": "https://www2.hm.com/en_ca/productpage.1315160005.html",
    "imageUrl": "https://image.hm.com/assets/hm/2d/e4/2de4d3ca3a140e8a5066c23febffa285ed41d7f2.jpg?imwidth=1260",
    "details": "Fully lined, removable cup inserts, medium back coverage.",
    "kinds": [
      "swim"
    ],
    "climates": [
      "hot",
      "mild",
      "unknown"
    ],
    "styles": [
      "understated",
      "polished"
    ],
    "colours": [
      "navy"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "hm-m-swim-shorts-blue",
    "gender": "men",
    "tier": "Budget",
    "brand": "H&M",
    "name": "Swim Shorts — Blue",
    "price": 59.99,
    "currency": "CAD",
    "productUrl": "https://www2.hm.com/en_ca/productpage.1339969001.html",
    "imageUrl": "https://image.hm.com/assets/hm/d7/29/d72976fa7032bf6906e12b8e26930fe3e602cc13.jpg?imwidth=1260",
    "details": "Knee-length nylon with mesh liner and a zip back pocket.",
    "kinds": [
      "swim"
    ],
    "climates": [
      "hot",
      "mild",
      "unknown"
    ],
    "styles": [
      "relaxed",
      "understated"
    ],
    "colours": [
      "blue"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "hm-polarized-aviator-brown",
    "gender": "unisex",
    "tier": "Budget",
    "brand": "H&M",
    "name": "Polarized Aviator Sunglasses — Dark brown",
    "price": 20.99,
    "currency": "CAD",
    "productUrl": "https://www2.hm.com/en_ca/productpage.1284775006.html",
    "imageUrl": "https://image.hm.com/assets/hm/71/41/7141f653945f58c80f55ab947f77e2992e1c2219.jpg?imwidth=1260",
    "details": "Retailer lists tinted, UV-protective, polarized lenses.",
    "kinds": [
      "sunglasses"
    ],
    "climates": [
      "hot",
      "mild",
      "cold",
      "unknown"
    ],
    "styles": [
      "polished",
      "statement"
    ],
    "colours": [
      "brown"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "hm-w-softmove-sports-top",
    "gender": "women",
    "tier": "Budget",
    "brand": "H&M",
    "name": "Sports Top with SoftMove™ — Choco mocha",
    "price": 24.99,
    "currency": "CAD",
    "productUrl": "https://www2.hm.com/en_ca/productpage.1355688001.html",
    "imageUrl": "https://image.hm.com/assets/hm/1c/5e/1c5ec0bd7d184a6d3338cf1cace67de565f99fae.jpg?imwidth=1260",
    "details": "Moisture-wicking DryMove™ fabric, slim fit.",
    "kinds": [
      "active-top"
    ],
    "climates": [
      "hot",
      "mild",
      "cold",
      "unknown"
    ],
    "styles": [
      "understated"
    ],
    "colours": [
      "brown"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "hm-w-drymove-leggings-black",
    "gender": "women",
    "tier": "Budget",
    "brand": "H&M",
    "name": "Sports Leggings with Cool Handfeel DryMove™ — Black",
    "price": 44.99,
    "currency": "CAD",
    "productUrl": "https://www2.hm.com/en_ca/productpage.1292463001.html",
    "imageUrl": "https://image.hm.com/assets/hm/c2/b3/c2b3d710ea28cb6ef5ef50f8aa9455bd50d2852c.jpg?imwidth=1260",
    "details": "Cooling, moisture-wicking fabric with a wide waistband.",
    "kinds": [
      "active-bottoms"
    ],
    "climates": [
      "hot",
      "mild",
      "cold",
      "unknown"
    ],
    "styles": [
      "understated"
    ],
    "colours": [
      "black"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "hm-cotton-neck-scarf-paisley",
    "gender": "unisex",
    "tier": "Budget",
    "brand": "H&M",
    "name": "Cotton Neck Scarf — Red paisley",
    "price": 19.99,
    "currency": "CAD",
    "productUrl": "https://www2.hm.com/en_ca/productpage.1370457002.html",
    "imageUrl": "https://image.hm.com/assets/hm/bd/03/bd03c21e62783292fae3030e8e08c123e6755a5a.jpg?imwidth=1260",
    "details": "Lightweight woven cotton; an easy cover-up or accent.",
    "kinds": [
      "light-scarf"
    ],
    "climates": [
      "hot",
      "mild",
      "unknown"
    ],
    "styles": [
      "statement",
      "relaxed"
    ],
    "colours": [
      "red"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "hm-wool-blend-scarf-grey",
    "gender": "unisex",
    "tier": "Budget",
    "brand": "H&M",
    "name": "Woven Scarf — Dark grey",
    "price": 10.99,
    "currency": "CAD",
    "productUrl": "https://www2.hm.com/en_ca/productpage.1243624002.html",
    "imageUrl": "https://image.hm.com/assets/hm/7b/bc/7bbccddfbbd3a0ee50df84075664c4b869374333.jpg?imwidth=1260",
    "details": "Soft woven blend with 12% wool; fringed ends.",
    "kinds": [
      "scarf"
    ],
    "climates": [
      "cold",
      "unknown"
    ],
    "styles": [
      "understated"
    ],
    "colours": [
      "grey"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "rains-long-jacket-black",
    "gender": "unisex",
    "tier": "High-end",
    "brand": "Rains",
    "name": "Long Jacket — Black",
    "price": 140,
    "currency": "USD",
    "productUrl": "https://us.rains.com/products/long-jacket-female?variant=50305181024496",
    "imageUrl": "https://us.rains.com/cdn/shop/files/rains_long_jacket_w3_black_rainwear_pack_1_288c208e-7657-4a86-b057-ab7d0b3fd404.jpg?v=1788270419&width=900",
    "details": "Waterproof unisex rain jacket in a matte Danish design.",
    "kinds": [
      "rain-shell"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [
      "understated",
      "polished"
    ],
    "colours": [
      "black"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "veja-campo-white-natural",
    "gender": "unisex",
    "tier": "High-end",
    "brand": "VEJA",
    "name": "Campo Leather — White Natural",
    "price": 175,
    "currency": "USD",
    "productUrl": "https://www.veja-store.com/en_us/p/campo-leather-white-natural-CP0502429.html",
    "imageUrl": "https://media.veja-store.com/images/t_sfcc-pdp-desktop-v2/c_limit,w_1200/v1781690726/VEJA/PACKSHOTS/CP0502429_1/CP0502429_1.jpg",
    "details": "Clean leather sneaker that goes from sightseeing to dinner.",
    "kinds": [
      "walking-shoes"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [
      "understated",
      "relaxed",
      "polished"
    ],
    "colours": [
      "white"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "birkenstock-arizona-black",
    "gender": "unisex",
    "tier": "High-end",
    "brand": "BIRKENSTOCK",
    "name": "Arizona Birko-Flor — Black",
    "price": 145,
    "currency": "CAD",
    "productUrl": "https://www.birkenstock.com/ca/arizona-birko-flor/arizona-core-birkoflor-0-eva-u_1.html",
    "imageUrl": "https://www.birkenstock.com/dw/image/v2/BLZD_PRD/on/demandware.static/-/Sites-master-catalog-amer/default/dwb3d5222b/51791/51791.jpg?sw=900&sh=900&sm=fit&q=75",
    "details": "Contoured cork-latex footbed with adjustable straps.",
    "kinds": [
      "sandals"
    ],
    "climates": [
      "hot",
      "mild"
    ],
    "styles": [
      "relaxed",
      "understated"
    ],
    "colours": [
      "black"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "fjallraven-kanken-black-oak",
    "gender": "unisex",
    "tier": "High-end",
    "brand": "Fjällräven",
    "name": "Kånken Backpack",
    "price": 115,
    "currency": "CAD",
    "productUrl": "https://www.fjallraven.com/ca/en-ca/bags-gear/kanken/kanken-bags/kanken/",
    "imageUrl": "https://www.fjallraven.com/4a853d/globalassets/catalogs/fjallraven/f2/f235/f23510/f294/kanken_23510-294_a_main2.jpg?width=800&height=800&rmode=BoxPad&bgcolor=fff&quality=90",
    "details": "Water-resistant Vinylon daypack; colour shown may vary on the product page.",
    "kinds": [
      "daypack"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [
      "relaxed",
      "statement"
    ],
    "colours": [
      "brown"
    ],
    "checkedAt": "2026-10-22"
  },
  {
    "id": "salomon-x-ultra-360-gtx-m",
    "gender": "men",
    "tier": "High-end",
    "brand": "Salomon",
    "name": "X Ultra 360 GORE-TEX",
    "price": 155,
    "currency": "USD",
    "productUrl": "https://www.salomon.com/en-us/product/x-ultra-360-gore-tex-li5205",
    "imageUrl": "https://cdn.dam.salomon.com/2d8c0305-bca1-4001-8fe5-b2f40093437d/L47865300/PNG-2000px-max-72dpi.png?pad=0.12,0.12,0.12,0.12",
    "details": "Waterproof hiking shoe with all-terrain grip.",
    "kinds": [
      "trail-shoes"
    ],
    "climates": [
      "cold",
      "mild",
      "hot",
      "unknown"
    ],
    "styles": [
      "understated"
    ],
    "colours": [
      "green",
      "brown"
    ],
    "checkedAt": "2026-10-22"
  }
]
export function reviewedProducts(now = new Date()): Product[] {
  return catalogue.filter(p => {
    const age = now.getTime() - Date.parse(p.checkedAt + 'T00:00:00Z')
    return age >= 0 && age < 30 * 86400000
  })
}

export const TIERS = ['High-end', 'Quality', 'Budget'] as const

export function findProduct(id: string): Product | undefined {
  return catalogue.find(p => p.id === id)
}

// Where an outbound click should land: an approved affiliate link when one exists, otherwise the exact product page.
export function outboundUrl(product: Product): string {
  const url = new URL(product.affiliateUrl || product.productUrl)
  if (!product.affiliateUrl) {
    url.searchParams.set('utm_source', 'parche')
    url.searchParams.set('utm_medium', 'referral')
    url.searchParams.set('utm_campaign', 'travel-edit')
  }
  return url.toString()
}

// Exact category match is mandatory. Never fill a missing rain shell with a tee.
// One pick per price tier first, then up to `limit` total from the best remaining matches.
export function productsForNeed(products: Product[], kind: PackingKind, gender: 'women' | 'men', plan: PackingPlan, style: Trip['style'], limit = 4): Product[] {
  if (!plan.needs.some(n => n.id === kind)) return []
  const score = (p: Product) => (p.styles.includes(style) ? 3 : 0) + p.colours.filter(c => plan.palette.includes(c)).length * 2 + (p.gender === gender ? 1 : 0)
  const matched = products.filter(p => p.kinds.includes(kind) && (p.gender === gender || p.gender === 'unisex') && p.climates.includes(plan.climate)).sort((a,b) => score(b) - score(a) || a.id.localeCompare(b.id))
  const picks = TIERS.flatMap(tier => {
    const product = matched.find(p => p.tier === tier)
    return product ? [product] : []
  })
  for (const p of matched) if (picks.length < limit && !picks.includes(p)) picks.push(p)
  return picks.sort((a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier))
}
