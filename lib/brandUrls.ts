// ─────────────────────────────────────────────────────────────
// BRAND CATEGORY URLS — locale-aware
// ─────────────────────────────────────────────────────────────

type Category = 'tops' | 'bottoms' | 'outerwear' | 'dresses' | 'footwear' | 'accessories' | 'swimwear'
type Gender = 'women' | 'men' | 'unisex'

// Detect user locale from browser
function detectLocale(): string {
  if (typeof navigator === 'undefined') return 'en-US'
  return navigator.language || 'en-US'
}

// Map locale to region code
function getRegion(): 'ca' | 'us' | 'gb' | 'fr' | 'de' | 'au' | 'other' {
  const lang = detectLocale().toLowerCase()
  if (lang.includes('en-ca') || lang === 'fr-ca') return 'ca'
  if (lang.includes('en-us'))                      return 'us'
  if (lang.includes('en-gb'))                      return 'gb'
  if (lang.startsWith('fr'))                       return 'fr'
  if (lang.startsWith('de'))                       return 'de'
  if (lang.includes('en-au'))                      return 'au'
  return 'us'
}

// ── Brand category URL builders ──────────────────────────────

type BrandUrlBuilder = (category: Category, gender: Gender) => string

const BRANDS: Record<string, BrandUrlBuilder> = {

  'Zara': (cat, gender) => {
    const region = getRegion()
    const locale = { ca:'en-ca', us:'en-us', gb:'en-gb', fr:'fr-fr', de:'de-de', au:'en-au', other:'en-us' }[region]
    const g = gender === 'men' ? 'man' : 'woman'
    const cats: Record<Category, string> = {
      tops:        `${g}/shirts`,
      bottoms:     `${g}/${gender === 'men' ? 'trousers' : 'trousers-jeans'}`,
      outerwear:   `${g}/coats`,
      dresses:     gender === 'men' ? `${g}/suits` : `${g}/dresses`,
      footwear:    `${g}/shoes`,
      accessories: `${g}/bags`,
      swimwear:    gender === 'men' ? `${g}/swimwear` : `${g}/swimwear`,
    }
    return `https://www.zara.com/${locale}/${cats[cat]}/`
  },

  'Mango': (cat, gender) => {
    const region = getRegion()
    const locale = { ca:'en-ca', us:'en-us', gb:'en-gb', fr:'fr-fr', de:'de-de', au:'en-au', other:'en-us' }[region]
    const g = gender === 'men' ? 'he' : 'she'
    const cats: Record<Category, string> = {
      tops:        `${g}/shirts`,
      bottoms:     `${g}/trousers`,
      outerwear:   `${g}/coats`,
      dresses:     gender === 'men' ? `${g}/suits` : `${g}/dresses`,
      footwear:    `${g}/shoes`,
      accessories: `${g}/bags`,
      swimwear:    `${g}/swimwear`,
    }
    return `https://shop.mango.com/${locale}/${cats[cat]}`
  },

  'COS': (cat, gender) => {
    const region = getRegion()
    const currency = { ca:'cad', us:'usd', gb:'gbp', fr:'eur', de:'eur', au:'aud', other:'usd' }[region]
    const g = gender === 'men' ? 'men/menswear' : 'women/womenswear'
    const cats: Record<Category, string> = {
      tops:        'tops',
      bottoms:     'trousers-and-shorts',
      outerwear:   'jackets-and-coats',
      dresses:     gender === 'men' ? 'suits-and-blazers' : 'dresses-and-skirts',
      footwear:    'shoes',
      accessories: 'bags-and-accessories',
      swimwear:    'swimwear',
    }
    return `https://www.cos.com/en_${currency}/${g}/${cats[cat]}/`
  },

  'Arket': (cat, gender) => {
    const g = gender === 'men' ? 'men' : 'women'
    const cats: Record<Category, string> = {
      tops:        'tops-shirts',
      bottoms:     'trousers-shorts',
      outerwear:   'jackets-coats',
      dresses:     gender === 'men' ? 'trousers-shorts' : 'dresses-skirts',
      footwear:    'shoes',
      accessories: 'accessories',
      swimwear:    'swimwear',
    }
    return `https://www.arket.com/en_usd/${g}/${cats[cat]}/`
  },

  '& Other Stories': (cat, gender) => {
    const g = gender === 'men' ? 'men' : 'women'
    const cats: Record<Category, string> = {
      tops:        'tops',
      bottoms:     'trousers',
      outerwear:   'jackets-coats',
      dresses:     'dresses',
      footwear:    'shoes',
      accessories: 'bags-accessories',
      swimwear:    'swimwear',
    }
    return `https://www.stories.com/en/${g}/${cats[cat]}/`
  },

  'Uniqlo': (cat, gender) => {
    const region = getRegion()
    const baseUrls: Record<string, string> = {
      ca: 'https://www.uniqlo.com/ca/en',
      us: 'https://www.uniqlo.com/us/en',
      gb: 'https://www.uniqlo.com/uk/en',
      fr: 'https://www.uniqlo.com/fr/fr',
      de: 'https://www.uniqlo.com/de/de',
      au: 'https://www.uniqlo.com/au/en',
      other: 'https://www.uniqlo.com/us/en',
    }
    const baseUrl = baseUrls[region]
    const g = gender === 'men' ? 'men' : 'women'
    const cats: Record<Category, string> = {
      tops:        `${g}/tops-and-t-shirts`,
      bottoms:     `${g}/pants-and-shorts`,
      outerwear:   `${g}/outerwear`,
      dresses:     gender === 'men' ? `${g}/pants-and-shorts` : `${g}/dresses-and-skirts`,
      footwear:    `${g}/socks-and-legwear`,
      accessories: `${g}/bags-and-accessories`,
      swimwear:    `${g}/swimwear`,
    }
    return `${baseUrl}/${cats[cat]}/`
  },

  'H&M': (cat, gender) => {
    const region = getRegion()
    const locale = { ca:'en_ca', us:'en_us', gb:'en_gb', fr:'fr_fr', de:'de_de', au:'en_au', other:'en_us' }[region]
    const g = gender === 'men' ? 'men' : 'women'
    const cats: Record<Category, string> = {
      tops:        `${g}/tops`,
      bottoms:     `${g}/trousers`,
      outerwear:   `${g}/jackets-and-coats`,
      dresses:     gender === 'men' ? `${g}/trousers` : `${g}/dresses`,
      footwear:    `${g}/shoes`,
      accessories: `${g}/accessories`,
      swimwear:    `${g}/swimwear`,
    }
    return `https://www2.hm.com/${locale}/${cats[cat]}.html`
  },

  'ASOS': (cat, gender) => {
    const g = gender === 'men' ? 'men' : 'women'
    // ASOS category IDs
    const cats: Record<Gender, Record<Category, string>> = {
      women: { tops:'4169', bottoms:'2625', outerwear:'4171', dresses:'8799', footwear:'4172', accessories:'1003012', swimwear:'6751' },
      men:   { tops:'4617', bottoms:'4616', outerwear:'4615', dresses:'4614', footwear:'4618', accessories:'4619', swimwear:'4620' },
      unisex:{ tops:'4617', bottoms:'4616', outerwear:'4615', dresses:'8799', footwear:'4618', accessories:'4619', swimwear:'4620' },
    }
    const cid = cats[gender]?.[cat] || cats['women'][cat]
    return `https://www.asos.com/${g}/cat/?cid=${cid}`
  },

  'Reformation': (cat, gender) => {
    const cats: Record<Category, string> = {
      tops:        'tops',
      bottoms:     'bottoms',
      outerwear:   'outerwear',
      dresses:     'dresses',
      footwear:    'shoes',
      accessories: 'accessories',
      swimwear:    'swim',
    }
    return `https://www.thereformation.com/collections/${cats[cat]}`
  },

  'Aritzia': (cat, gender) => {
    const cats: Record<Category, string> = {
      tops:        'tops',
      bottoms:     'bottoms',
      outerwear:   'jackets-coats',
      dresses:     'dresses',
      footwear:    'shoes',
      accessories: 'accessories',
      swimwear:    'swim',
    }
    return `https://www.aritzia.com/en/clothing/${cats[cat]}`
  },

  'Patagonia': (cat, gender) => {
    const g = gender === 'men' ? 'mens' : 'womens'
    const cats: Record<Category, string> = {
      tops:        'shirts-tops',
      bottoms:     'pants-shorts',
      outerwear:   'jackets-vests',
      dresses:     gender === 'men' ? 'pants-shorts' : 'dresses-skirts',
      footwear:    'footwear',
      accessories: 'hats-accessories',
      swimwear:    'swim',
    }
    return `https://www.patagonia.com/shop/${g}-${cats[cat]}`
  },

  "Arc'teryx": (cat, gender) => {
    const g = gender === 'men' ? 'mens' : 'womens'
    const cats: Record<Category, string> = {
      tops:        'midlayers',
      bottoms:     'pants',
      outerwear:   'shells',
      dresses:     gender === 'men' ? 'pants' : 'shells',
      footwear:    'footwear',
      accessories: 'accessories',
      swimwear:    'midlayers',
    }
    return `https://arcteryx.com/en/c/${g}/${cats[cat]}`
  },

  'Canada Goose': (cat, gender) => {
    const g = gender === 'men' ? 'mens' : 'womens'
    const cats: Record<Category, string> = {
      tops:        'mid-layers',
      bottoms:     'pants',
      outerwear:   'parkas',
      dresses:     gender === 'men' ? 'pants' : 'snow-suits',
      footwear:    'footwear',
      accessories: 'accessories',
      swimwear:    'mid-layers',
    }
    return `https://www.canadagoose.com/en-us/collections/${g}-${cats[cat]}`
  },

  'Faithfull the Brand': (cat, _gender) => {
    const cats: Record<Category, string> = {
      tops:        'tops',
      bottoms:     'bottoms',
      outerwear:   'outerwear',
      dresses:     'dresses',
      footwear:    'accessories',
      accessories: 'accessories',
      swimwear:    'swimwear',
    }
    return `https://faithfullthebrand.com/collections/${cats[cat]}`
  },

  'Faithfull': (cat, gender) => BRANDS['Faithfull the Brand'](cat, gender),

  'Sézane': (cat, _gender) => {
    const cats: Record<Category, string> = {
      tops:        'tops',
      bottoms:     'pants-and-skirts',
      outerwear:   'jackets-and-coats',
      dresses:     'dresses',
      footwear:    'shoes',
      accessories: 'accessories',
      swimwear:    'summer',
    }
    return `https://www.sezane.com/en/${cats[cat]}`
  },

  'Acne Studios': (cat, gender) => {
    const g = gender === 'men' ? 'men' : 'women'
    return `https://www.acnestudios.com/en/search?q=${cat}&gender=${g}`
  },

  'A.P.C.': (cat, gender) => {
    const g = gender === 'men' ? 'homme' : 'femme'
    const cats: Record<Category, string> = {
      tops:        'tops-et-t-shirts',
      bottoms:     'pantalons',
      outerwear:   'manteaux-et-vestes',
      dresses:     gender === 'men' ? 'pantalons' : 'robes',
      footwear:    'chaussures',
      accessories: 'accessoires',
      swimwear:    'maillots-de-bain',
    }
    return `https://www.apc.fr/en/${g}/${cats[cat]}/`
  },

  'Toteme': (cat, _gender) => {
    const cats: Record<Category, string> = {
      tops:        'tops',
      bottoms:     'bottoms',
      outerwear:   'outerwear',
      dresses:     'dresses',
      footwear:    'shoes',
      accessories: 'bags',
      swimwear:    'resort',
    }
    return `https://toteme-studio.com/collections/${cats[cat]}`
  },

  'Our Legacy': (cat, gender) => {
    const g = gender === 'men' ? 'men' : 'women'
    return `https://www.ourlegacy.se/collections/${g}-${cat}`
  },

  'Norse Projects': (cat, gender) => {
    const g = gender === 'men' ? 'mens' : 'womens'
    const cats: Record<Category, string> = {
      tops:        'shirts',
      bottoms:     'trousers',
      outerwear:   'outerwear',
      dresses:     'trousers',
      footwear:    'footwear',
      accessories: 'accessories',
      swimwear:    'swimwear',
    }
    return `https://norseprojects.com/collections/${g}-${cats[cat]}`
  },

  'Maison Kitsuné': (cat, gender) => {
    const g = gender === 'men' ? 'men' : 'women'
    return `https://maisonkitsune.com/en/${g}/clothing/${cat}/`
  },

  'Carhartt WIP': (cat, gender) => {
    const g = gender === 'men' ? 'men' : 'women'
    const cats: Record<Category, string> = {
      tops:        'shirts',
      bottoms:     'pants',
      outerwear:   'jackets',
      dresses:     gender === 'men' ? 'pants' : 'dresses',
      footwear:    'footwear',
      accessories: 'accessories',
      swimwear:    'swimwear',
    }
    return `https://www.carhartt-wip.com/en/${g}/${cats[cat]}/`
  },

  'Carhartt': (cat, gender) => BRANDS['Carhartt WIP'](cat, gender),

  'Stüssy': (cat, gender) => {
    const g = gender === 'men' ? 'mens' : 'womens'
    return `https://www.stussy.com/collections/${g}-${cat}`
  },

  'Stussy': (cat, gender) => BRANDS['Stüssy'](cat, gender),

  'Birkenstock': (_cat, _gender) => `https://www.birkenstock.com/en/sandals/`,

  'Veja': (cat, gender) => {
    const g = gender === 'men' ? 'men' : 'women'
    return `https://www.veja-store.com/en/${g}/sneakers/`
  },

  'Onia': (cat, gender) => {
    const g = gender === 'men' ? 'mens' : 'womens'
    return `https://onia.com/collections/${g}-swimwear`
  },

  'Vilebrequin': (_cat, _gender) => `https://www.vilebrequin.com/en/swimwear/`,

  'Orlebar Brown': (cat, _gender) => `https://www.orlebarbrown.com/collections/swimwear`,

  'Hunza G': (_cat, _gender) => `https://www.hunzag.com/collections/swimwear`,

  'Seafolly': (_cat, _gender) => `https://us.seafolly.com/collections/swimwear`,
}

// ── Main export ──────────────────────────────────────────────
export function getBrandCategoryUrl(
  brand: string,
  category: string,
  gender: string
): string {
  const cat = (category || 'tops') as Category
  const gen = (['women','men'].includes(gender) ? gender : 'women') as Gender

  // Exact match
  const builder = BRANDS[brand]
  if (builder) return builder(cat, gen)

  // Case-insensitive match
  const key = Object.keys(BRANDS).find(k => k.toLowerCase() === brand.toLowerCase())
  if (key) return BRANDS[key](cat, gen)

  // Generic Google Shopping fallback
  const genderLabel = gen === 'men' ? "men's" : "women's"
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(`${brand} ${genderLabel} ${category}`)}`
}

// Keep backward compat
export function getBrandSearchUrl(brand: string, itemName: string): string {
  return getBrandCategoryUrl(brand, 'tops', 'women')
}
