// Each entry is reviewed against its exact retailer page. Never generate product facts.
export type Product = { id: string; gender: 'women' | 'men'; tier: 'High-end' | 'Quality' | 'Budget'; brand: string; name: string; price: number; currency: string; productUrl: string; imageUrl: string; details: string; checkedAt: string }
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
    "checkedAt": "2026-10-22"
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
    "checkedAt": "2026-10-22"
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
    "checkedAt": "2026-10-22"
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
    "checkedAt": "2026-10-22"
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
    "checkedAt": "2026-10-22"
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
    "checkedAt": "2026-10-22"
  }
]

// Expire unreviewed snapshots instead of silently presenting old prices as current.
export function reviewedProducts(now = new Date()): Product[] {
  return catalogue.filter(p => {
    const age = now.getTime() - Date.parse(p.checkedAt + 'T00:00:00Z')
    return age >= 0 && age < 30 * 86400000
  })
}
