export type Product = {
  brand: string
  name: string
  price: string
  old?: string
  badge: 'edit' | 'sale' | '2nd' | ''
  avail: 'on' | 'st'
  availTxt: string
  bg: string
  affiliateUrl?: string  // Amazon or other affiliate link
  imageUrl?: string      // Real product photo when available
}

export type ForecastDay = {
  day: string
  icon: string
  temp: string
}

export type Destination = {
  slug: string
  name: string
  country: string
  region: string
  temp: string
  weather: string
  type: string
  bgClass: string
  forecast: ForecastDay[]
  products: Product[]
  guide: string
  tags: string[]
}

export const destinations: Destination[] = [
  {
    slug: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    region: 'Europe',
    temp: '16–22°C',
    weather: 'Partly cloudy · Some rain',
    type: 'City break · Walking-heavy',
    bgClass: 'bg-lisbon',
    forecast: [
      { day: 'Today', icon: '⛅', temp: '19°' },
      { day: 'Thu',   icon: '🌧', temp: '16°' },
      { day: 'Fri',   icon: '☀️', temp: '22°' },
      { day: 'Sat',   icon: '⛅', temp: '18°' },
      { day: 'Sun',   icon: '🌤', temp: '20°' },
    ],
    products: [
      { brand: 'Mango',    name: 'Linen Blazer, Camel',          price: '$89',  badge: 'edit', avail: 'on', availTxt: 'Ships before your trip',  bg: 'linear-gradient(175deg,#e8e4d8,#d4cec0)' },
      { brand: 'ASOS',     name: 'Trench Coat, Olive',           price: '$145', old: '$190',   badge: 'sale', avail: 'on', availTxt: 'Free returns', bg: 'linear-gradient(175deg,#e0e4e0,#ccd0cc)' },
      { brand: 'Vinted',   name: 'Leather Loafers, Tan',         price: '$38',  old: '$120 new', badge: '2nd', avail: 'st', availTxt: '3 sizes available', bg: 'linear-gradient(175deg,#ece8e0,#d8d0c4)' },
      { brand: 'Zara',     name: 'Merino Knit, Slate',           price: '$65',  badge: '',     avail: 'on', availTxt: 'Online + In-store',         bg: 'linear-gradient(175deg,#e4e8ec,#d0d8e0)' },
      { brand: 'H&M',      name: 'Wide-leg Linen Trousers',      price: '$44',  badge: '',     avail: 'on', availTxt: 'Ships in 3 days',           bg: 'linear-gradient(175deg,#f0ece4,#ddd8cc)' },
      { brand: '& Other',  name: 'Relaxed Linen Shirt, White',   price: '$59',  badge: 'edit', avail: 'on', availTxt: 'Ships before your trip',   bg: 'linear-gradient(175deg,#f0f0ec,#e0e0d8)' },
      { brand: 'Depop',    name: 'Vintage Silk Scarf',            price: '$22',  badge: '2nd',  avail: 'st', availTxt: '2 available',              bg: 'linear-gradient(175deg,#ece4dc,#d8ccc0)' },
      { brand: 'Arket',    name: 'Cotton Turtleneck, Navy',       price: '$78',  badge: '',     avail: 'on', availTxt: 'Free delivery',            bg: 'linear-gradient(175deg,#e0e4ec,#ccd4e0)' },
      { brand: 'Mango',    name: 'Leather Crossbody Bag',         price: '$115', badge: 'edit', avail: 'on', availTxt: 'Ships before your trip',  bg: 'linear-gradient(175deg,#ece8e0,#d8d0c4)' },
    ],
    guide: "Lisbon in October sits at 18°C on a good day, 13°C on a bad one. The cobblestones demand flat shoes. The fado bars demand something with a collar. Layer a merino knit under a linen blazer and you're covered for everything in between.",
    tags: ['City', 'Layers', 'Chic', 'Autumn'],
  },
  {
    slug: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    temp: '27–32°C',
    weather: 'Humid · Tropical showers',
    type: 'Beach & Culture · Mixed terrain',
    bgClass: 'bg-bali',
    forecast: [
      { day: 'Today', icon: '🌤', temp: '30°' },
      { day: 'Thu',   icon: '🌦', temp: '28°' },
      { day: 'Fri',   icon: '☀️', temp: '32°' },
      { day: 'Sat',   icon: '⛅', temp: '29°' },
      { day: 'Sun',   icon: '🌧', temp: '27°' },
    ],
    products: [
      { brand: 'Faithfull',  name: 'Linen Co-ord Set, Terracotta', price: '$195', badge: 'edit', avail: 'on', availTxt: 'Ships before your trip', bg: 'linear-gradient(175deg,#ede8e0,#d8d0c4)' },
      { brand: 'Vinted',     name: 'Vintage Batik Kimono',          price: '$28',  old: '$95 new', badge: '2nd', avail: 'st', availTxt: '4 available', bg: 'linear-gradient(175deg,#e4ece8,#ccd8d0)' },
      { brand: 'ASOS',       name: 'Linen Wide-leg Trousers',        price: '$55',  badge: '',     avail: 'on', availTxt: 'Free returns',            bg: 'linear-gradient(175deg,#f0ece0,#ddd8cc)' },
      { brand: 'Billabong',  name: 'Printed Sarong Wrap',            price: '$42',  badge: '',     avail: 'on', availTxt: 'Ships in 2 days',         bg: 'linear-gradient(175deg,#e4ecea,#ccd8d6)' },
      { brand: 'Havaianas',  name: 'Classic Flip Flops',             price: '$35',  badge: '',     avail: 'on', availTxt: 'Free delivery',           bg: 'linear-gradient(175deg,#ece8e4,#d8d0cc)' },
      { brand: 'Lack of',    name: 'Breezy Linen Shirt, White',      price: '$88',  badge: 'edit', avail: 'on', availTxt: 'Ships before your trip',  bg: 'linear-gradient(175deg,#f0f0ec,#e0e0d8)' },
      { brand: 'Depop',      name: 'Crochet Beach Bag',              price: '$18',  badge: '2nd',  avail: 'st', availTxt: '1 available',             bg: 'linear-gradient(175deg,#ece4d8,#d8ccc0)' },
      { brand: 'Quay',       name: 'Oversized Sunglasses',           price: '$65',  badge: '',     avail: 'on', availTxt: 'Online + In-store',       bg: 'linear-gradient(175deg,#e8e8e8,#d4d4d4)' },
      { brand: 'Mango',      name: 'Raffia Sun Hat',                 price: '$49',  badge: 'edit', avail: 'on', availTxt: 'Ships before your trip',  bg: 'linear-gradient(175deg,#ede8dc,#d8d0c4)' },
    ],
    guide: "Bali is hot, humid, and endlessly varied — beach clubs, rice terraces, temple visits, rooftop dinners. Linen is your best friend. Avoid anything that doesn't breathe. Pack a sarong — it doubles as a beach wrap and temple cover.",
    tags: ['Beach', 'Boho', 'Resort', 'Tropical'],
  },
  {
    slug: 'marrakech',
    name: 'Marrakech',
    country: 'Morocco',
    region: 'North Africa',
    temp: '18–36°C',
    weather: 'Dry · Sunny · Cool evenings',
    type: 'Culture & Medina · Walking-heavy',
    bgClass: 'bg-marrakech',
    forecast: [
      { day: 'Today', icon: '☀️', temp: '34°' },
      { day: 'Thu',   icon: '☀️', temp: '36°' },
      { day: 'Fri',   icon: '🌤', temp: '32°' },
      { day: 'Sat',   icon: '☀️', temp: '35°' },
      { day: 'Sun',   icon: '⛅', temp: '28°' },
    ],
    products: [
      { brand: 'Zara',        name: 'Linen Wide Trousers, Ecru',   price: '$58',  badge: 'edit', avail: 'on', availTxt: 'Ships before your trip', bg: 'linear-gradient(175deg,#f0ece0,#ddd8cc)' },
      { brand: 'Mango',       name: 'Embroidered Kaftan Dress',    price: '$89',  badge: 'edit', avail: 'on', availTxt: 'Ships before your trip', bg: 'linear-gradient(175deg,#ede8e0,#d8d0c4)' },
      { brand: 'Arket',       name: 'Cotton Maxi Dress, Sand',     price: '$118', badge: '',     avail: 'on', availTxt: 'Free delivery',          bg: 'linear-gradient(175deg,#f0ece8,#ddd8d0)' },
      { brand: 'Vinted',      name: 'Vintage Linen Shirt',         price: '$24',  old: '$80 new', badge: '2nd', avail: 'st', availTxt: '2 available', bg: 'linear-gradient(175deg,#eceae4,#d8d4c8)' },
      { brand: 'Birkenstock', name: 'Arizona Sandals, Taupe',      price: '$140', badge: '',     avail: 'on', availTxt: 'Online + In-store',      bg: 'linear-gradient(175deg,#ece8e0,#d8d0c4)' },
      { brand: 'ASOS',        name: 'Lightweight Linen Blazer',    price: '$72',  badge: '',     avail: 'on', availTxt: 'Free returns',           bg: 'linear-gradient(175deg,#e8e8e4,#d4d4d0)' },
      { brand: 'Local',       name: 'Leather Babouche Slippers',   price: '$35',  badge: 'edit', avail: 'on', availTxt: 'Available in Marrakech', bg: 'linear-gradient(175deg,#ece4dc,#d8ccc0)' },
      { brand: 'H&M',         name: 'Oversized Linen Scarf',       price: '$28',  badge: '',     avail: 'on', availTxt: 'Ships in 3 days',        bg: 'linear-gradient(175deg,#f0ece4,#ddd8cc)' },
      { brand: 'Quay',        name: 'Round Sunglasses, Gold',      price: '$75',  badge: '',     avail: 'on', availTxt: 'Free delivery',          bg: 'linear-gradient(175deg,#e8e8e4,#d4d4d0)' },
    ],
    guide: "Marrakech requires covered shoulders and knees in the medina — but that doesn't mean shapeless. Light linen trousers, an embroidered kaftan, babouche slippers. The key is breathable fabric in earthy tones that don't show dust.",
    tags: ['Desert', 'Modest', 'Earthy', 'Cultural'],
  },
  {
    slug: 'amalfi-coast',
    name: 'Amalfi Coast',
    country: 'Italy',
    region: 'Mediterranean',
    temp: '24–30°C',
    weather: 'Sunny · Low humidity · Breezy',
    type: 'Beach & Villages · Mixed terrain',
    bgClass: 'bg-amalfi',
    forecast: [
      { day: 'Today', icon: '☀️', temp: '28°' },
      { day: 'Thu',   icon: '☀️', temp: '30°' },
      { day: 'Fri',   icon: '🌤', temp: '27°' },
      { day: 'Sat',   icon: '☀️', temp: '29°' },
      { day: 'Sun',   icon: '☀️', temp: '28°' },
    ],
    products: [
      { brand: 'Faithfull', name: 'Floral Wrap Dress, Positano', price: '$215', badge: 'edit', avail: 'on', availTxt: 'Ships before your trip', bg: 'linear-gradient(175deg,#ede8e0,#d8d0c4)' },
      { brand: 'Mango',     name: 'Linen Sundress, Yellow',      price: '$79',  badge: '',     avail: 'on', availTxt: 'Free delivery',           bg: 'linear-gradient(175deg,#f0ece0,#ddd8cc)' },
      { brand: 'Vinted',    name: 'Vintage Linen Co-ord Set',    price: '$45',  old: '$160 new', badge: '2nd', avail: 'st', availTxt: '1 available', bg: 'linear-gradient(175deg,#ece8e0,#d8d0c4)' },
      { brand: 'Ancient',   name: 'Greek Leather Sandals',       price: '$95',  badge: 'edit', avail: 'on', availTxt: 'Ships before your trip',  bg: 'linear-gradient(175deg,#ece8e0,#d8d0c4)' },
      { brand: 'Seafolly',  name: 'Swimsuit, Cobalt Blue',       price: '$120', badge: '',     avail: 'on', availTxt: 'Online + In-store',        bg: 'linear-gradient(175deg,#e4e8ec,#ccd4da)' },
      { brand: 'ASOS',      name: 'Linen Wide Trousers, White',  price: '$55',  badge: '',     avail: 'on', availTxt: 'Free returns',             bg: 'linear-gradient(175deg,#f0f0ec,#e0e0d8)' },
      { brand: 'Lack of',   name: 'Striped Linen Shirt',         price: '$92',  badge: 'edit', avail: 'on', availTxt: 'Ships before your trip',   bg: 'linear-gradient(175deg,#e8e8ec,#d4d4da)' },
      { brand: 'Mango',     name: 'Woven Straw Tote Bag',        price: '$49',  badge: '',     avail: 'on', availTxt: 'Ships in 2 days',           bg: 'linear-gradient(175deg,#ece8e0,#d8d0c4)' },
      { brand: 'Quay',      name: 'Cat-eye Sunglasses, Tort',    price: '$70',  badge: '',     avail: 'on', availTxt: 'Free delivery',             bg: 'linear-gradient(175deg,#e8e4dc,#d4cec8)' },
    ],
    guide: "The Amalfi Coast is all about that effortless Italian summer. Floral wrap dresses, linen shirts you can throw over a swimsuit, leather sandals that handle cobblestones. Pack light but pack right — the villages are steep.",
    tags: ['Beach', 'Mediterranean', 'Resort', 'Summer'],
  },
  {
    slug: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    region: 'East Asia',
    temp: '8–16°C',
    weather: 'Clear · Crisp · Variable',
    type: 'City · Walking-intensive',
    bgClass: 'bg-tokyo',
    forecast: [
      { day: 'Today', icon: '🌤', temp: '14°' },
      { day: 'Thu',   icon: '☀️', temp: '16°' },
      { day: 'Fri',   icon: '⛅', temp: '12°' },
      { day: 'Sat',   icon: '🌤', temp: '13°' },
      { day: 'Sun',   icon: '☀️', temp: '15°' },
    ],
    products: [
      { brand: 'COS',     name: 'Oversized Wool Coat, Camel',  price: '$320', badge: 'edit', avail: 'on', availTxt: 'Ships before your trip', bg: 'linear-gradient(175deg,#ece8e0,#d8d0c4)' },
      { brand: 'Uniqlo',  name: 'Merino Turtleneck',           price: '$49',  badge: 'edit', avail: 'on', availTxt: 'Online + In-store',      bg: 'linear-gradient(175deg,#e8e8e8,#d4d4d4)' },
      { brand: 'Vinted',  name: "Vintage Levi's 501, Indigo",  price: '$55',  old: '$120 new', badge: '2nd', avail: 'st', availTxt: '2 sizes', bg: 'linear-gradient(175deg,#e4e8ec,#ccd4da)' },
      { brand: 'Acne',    name: 'Wool Scarf, Charcoal',        price: '$180', badge: '',     avail: 'on', availTxt: 'Free delivery',           bg: 'linear-gradient(175deg,#e8e8e8,#d8d8d8)' },
      { brand: 'Common',  name: 'Track Sneakers, White',       price: '$95',  badge: 'edit', avail: 'on', availTxt: 'Ships before your trip',  bg: 'linear-gradient(175deg,#f0f0f0,#e4e4e4)' },
      { brand: 'Arket',   name: 'Slim Wool Trousers, Navy',    price: '$145', badge: '',     avail: 'on', availTxt: 'Free delivery',           bg: 'linear-gradient(175deg,#e4e8ec,#ccd4da)' },
      { brand: 'COS',     name: 'Oversized Blazer, Black',     price: '$210', badge: '',     avail: 'on', availTxt: 'Free delivery',           bg: 'linear-gradient(175deg,#e8e8e8,#d4d4d4)' },
      { brand: 'Depop',   name: 'Vintage Japanese Workwear',   price: '$68',  badge: '2nd',  avail: 'st', availTxt: '1 available',             bg: 'linear-gradient(175deg,#e8eae8,#d4d8d4)' },
      { brand: 'Uniqlo',  name: 'Heattech Long-sleeve, Black', price: '$22',  badge: '',     avail: 'on', availTxt: 'Online + In-store',       bg: 'linear-gradient(175deg,#e8e8e8,#d4d4d4)' },
    ],
    guide: "Tokyo in autumn demands effortless layering. The locals are precise — an oversized coat, clean sneakers, a good scarf. Nothing fussy, nothing underdressed. Uniqlo Heattech underneath everything is an insider move.",
    tags: ['City', 'Street', 'Minimal', 'Layers'],
  },
  {
    slug: 'tulum',
    name: 'Tulum',
    country: 'Mexico',
    region: 'Caribbean',
    temp: '28–34°C',
    weather: 'Hot · Humid · Occasional rain',
    type: 'Beach Club · Jungle · Cenotes',
    bgClass: 'bg-tulum',
    forecast: [
      { day: 'Today', icon: '☀️', temp: '32°' },
      { day: 'Thu',   icon: '🌤', temp: '34°' },
      { day: 'Fri',   icon: '🌦', temp: '30°' },
      { day: 'Sat',   icon: '☀️', temp: '33°' },
      { day: 'Sun',   icon: '☀️', temp: '32°' },
    ],
    products: [
      { brand: 'Agua Bendita', name: 'Floral Bikini Set',          price: '$185', badge: 'edit', avail: 'on', availTxt: 'Ships before your trip', bg: 'linear-gradient(175deg,#ede8e0,#d8d0c4)' },
      { brand: 'ASOS',         name: 'Linen Co-ord, Sage',         price: '$75',  badge: '',     avail: 'on', availTxt: 'Free returns',           bg: 'linear-gradient(175deg,#e4ece8,#ccd8d0)' },
      { brand: 'Vinted',       name: 'Crochet Beach Coverup',      price: '$32',  old: '$120 new', badge: '2nd', avail: 'st', availTxt: '2 available', bg: 'linear-gradient(175deg,#f0ece0,#ddd8cc)' },
      { brand: 'Birkenstock',  name: 'Arizona Sandals, White',     price: '$140', badge: '',     avail: 'on', availTxt: 'Online + In-store',      bg: 'linear-gradient(175deg,#f0f0e8,#e0e0d8)' },
      { brand: 'Spell',        name: 'Boho Maxi Dress',            price: '$210', badge: 'edit', avail: 'on', availTxt: 'Ships before your trip', bg: 'linear-gradient(175deg,#ede8e4,#d8d0cc)' },
      { brand: 'Lack of',      name: 'Linen Shirt Dress, Ecru',    price: '$112', badge: '',     avail: 'on', availTxt: 'Free delivery',          bg: 'linear-gradient(175deg,#f0ece8,#ddd8d0)' },
      { brand: 'Depop',        name: 'Vintage Crochet Bag',        price: '$28',  badge: '2nd',  avail: 'st', availTxt: '1 available',            bg: 'linear-gradient(175deg,#ece8e0,#d8d0c4)' },
      { brand: 'Quay',         name: 'Oval Sunglasses, Tortoise',  price: '$70',  badge: '',     avail: 'on', availTxt: 'Free delivery',          bg: 'linear-gradient(175deg,#e8e4dc,#d4cec8)' },
      { brand: 'Matteau',      name: 'One-shoulder Swimsuit, Navy',price: '$220', badge: 'edit', avail: 'on', availTxt: 'Ships before your trip', bg: 'linear-gradient(175deg,#e4e8ec,#ccd4da)' },
    ],
    guide: "Tulum is about that effortless boho-beach energy. Crochet, linen, swimwear that doubles as a top. Pack light, breathable fabrics in earthy and tropical tones. Good sandals are essential — you'll be going from beach to jungle to dinner.",
    tags: ['Beach', 'Boho', 'Tropical', 'Resort'],
  },
]

// Helper — find destination by slug or fuzzy name match
export function findDestination(query: string): Destination | null {
  const q = query.toLowerCase().trim()
  // exact slug
  const bySlug = destinations.find(d => d.slug === q)
  if (bySlug) return bySlug
  // name match
  const byName = destinations.find(d => d.name.toLowerCase() === q)
  if (byName) return byName
  // partial
  const partial = destinations.find(
    d => d.slug.includes(q) || q.includes(d.slug) || d.name.toLowerCase().includes(q)
  )
  return partial || null
}

// All featured destinations for homepage grid
export const featuredDestinations = destinations.slice(0, 4)
