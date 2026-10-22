import type { PackingKind, PackingPlan } from './packing'
import type { Trip } from './trip'
// Merchant page, photo and price are kept together as one reviewed record.
export type Product = { id: string; gender: 'women' | 'men' | 'unisex'; tier: 'High-end' | 'Quality' | 'Budget'; brand: string; name: string; price: number; currency: string; productUrl: string; imageUrl: string; details: string; checkedAt: string; kinds: PackingKind[]; climates: PackingPlan['climate'][]; colours: string[]; styles: Trip['style'][] }
export const catalogue: Product[] = [
  {
    "id": "sunspel-w-tee",
    "gender": "women",
    "tier": "High-end",
    "brand": "Sunspel",
    "name": "Classic T-shirt \u2014 White",
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
    "name": "The T-Shirt \u2014 White",
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
    "name": "True Regular Tee \u2014 White",
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
    "name": "Classic T-shirt \u2014 White",
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
    "name": "The T-Shirt \u2014 Black",
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
    "name": "True Boxy Fit Tee \u2014 Artichoke",
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
    "name": "Core Straight Leg Pants \u2014 Black",
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
    "name": "Everyday Straight Leg Pants \u2014 Stone Blue",
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
    "name": "True Knit Sweater \u2014 Almond",
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
    "name": "True Knit Sweater \u2014 Navy",
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
    "name": "Fine Knit V-Neck Sweater \u2014 Dark Grey",
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
    "name": "Swim Open Back One-Piece \u2014 Dove Blue",
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
    "name": "Core Casual Cap \u2014 Sandstone",
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
    "name": "Core Casual Cap \u2014 Azure Blue",
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
    "name": "Core Casual Cap \u2014 Black",
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
    "name": "Core Casual Cap \u2014 Vibrant Red",
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
    "name": "Alley Copenhagen Shoulder Bag \u2014 Midnight Blue",
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
    "name": "Alley Copenhagen Shoulder Bag \u2014 Black",
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
    "name": "Alley Copenhagen Shoulder Bag \u2014 Black",
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
    "name": "The Wool Trousers \u2014 Charcoal",
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
    "name": "The Wool Trousers \u2014 Charcoal",
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
    "name": "The Heavy Wool Sweater \u2014 Charcoal",
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
    "name": "The Oxford Shirt \u2014 Dark Navy",
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
    "name": "The Loose Twill Chino \u2014 Dark Navy",
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
    "name": "The Ribbed Wool Beanie \u2014 Black",
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
    "name": "Oversized Cashmere Wool Scarf \u2014 Navy",
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
    "name": "Linen Shirt \u2014 Hazelwood",
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
    "name": "Linen Shirt \u2014 Sky Blue/Navy",
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
    "name": "Tailored Swim Shorts \u2014 Navy",
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
    "name": "The Wool Cardigan \u2014 Charcoal",
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
  }
]
export function reviewedProducts(now = new Date()): Product[] {
  return catalogue.filter(p => {
    const age = now.getTime() - Date.parse(p.checkedAt + 'T00:00:00Z')
    return age >= 0 && age < 30 * 86400000
  })
}

// Exact category match is mandatory. Never fill a missing rain shell with a tee.
export function productsForNeed(products: Product[], kind: PackingKind, gender: 'women' | 'men', plan: PackingPlan, style: Trip['style']): Product[] {
  if (!plan.needs.some(n => n.id === kind)) return []
  const score = (p: Product) => (p.styles.includes(style) ? 3 : 0) + p.colours.filter(c => plan.palette.includes(c)).length * 2
  const matched = products.filter(p => p.kinds.includes(kind) && (p.gender === gender || p.gender === 'unisex') && p.climates.includes(plan.climate)).sort((a,b) => score(b) - score(a) || a.id.localeCompare(b.id))
  return (['High-end','Quality','Budget'] as const).flatMap(tier => {
    const product = matched.find(p => p.tier === tier)
    return product ? [product] : []
  })
}
