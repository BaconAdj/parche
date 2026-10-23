import { dateNumber, type Trip } from './trip'
import type { TripWeather } from './weather'
import kindsData from '../data/kinds.json'

export type PackingKind =
  | 'tee' | 'long-sleeve-top' | 'shirt' | 'linen-shirt' | 'knit' | 'warm-knit' | 'dress'
  | 'trousers' | 'light-trousers' | 'warm-trousers' | 'jeans' | 'shorts' | 'skirt'
  | 'light-jacket' | 'blazer' | 'coat' | 'rain-shell'
  | 'walking-shoes' | 'dress-shoes' | 'boots' | 'sandals' | 'trail-shoes'
  | 'bag' | 'daypack' | 'sunglasses' | 'sun-hat' | 'beanie' | 'gloves' | 'scarf' | 'light-scarf' | 'belt' | 'umbrella'
  | 'swim' | 'active-top' | 'active-bottoms' | 'sports-bra'
  | 'underwear' | 'bra' | 'socks' | 'sleepwear' | 'base-layer-top' | 'base-layer-bottoms'

export type PackingGroup = 'Tops & dresses' | 'Bottoms' | 'Outerwear' | 'Footwear' | 'Accessories' | 'Active & swim' | 'Underwear & sleep'
export const GROUPS: PackingGroup[] = ['Tops & dresses', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories', 'Active & swim', 'Underwear & sleep']
export type PackingNeed = { id: PackingKind; title: string; group: PackingGroup; quantity: number; reason: string; optional?: boolean }
export type PackingPlan = { days: number; note: string; climate: 'cold' | 'mild' | 'hot' | 'unknown'; palette: string[]; needs: PackingNeed[]; total: number }

const GROUP_OF = Object.fromEntries(kindsData.kinds.map(k => [k.id, k.group])) as Record<PackingKind, PackingGroup>

// The complete list: every garment, shoe, accessory and essential, with how many to pack.
// Weather sets the base; destination, activity, personal style and wardrobe change what goes in.
// Location adds styling context; it never supplies invented weather.
export function buildPackingPlan(trip: Trip, weather: TripWeather): PackingPlan {
  const place = trip.destination.toLowerCase()
  const coastal = /\b(bali|tulum|amalfi|maldives|phuket|sanya|hawaii|maui|santorini|ibiza|barbados|cancun|mykonos|positano|capri|nice|algarve|mallorca|menorca|hvar|dubrovnik|cartagena|miami|rio|sydney|cape town|zanzibar|seychelles|fiji|bora bora|koh samui|langkawi|palawan|boracay|goa|riviera|costa rica|san juan|havana|tel aviv|lisbon|barcelona)\b/.test(place)
  const coverage = /\b(marrakech|marrakesh|fez|casablanca|cairo|dubai|abu dhabi|muscat|amman|petra|istanbul|jerusalem|bali|jaipur|delhi|mumbai|kathmandu|yangon|siem reap|luang prabang|vatican|rome)\b/.test(place)
  const city = /\b(tokyo|seoul|london|paris|new york|montreal|montréal|lisbon|rome|milan|berlin|copenhagen|amsterdam|madrid|vienna|prague|toronto|chicago|singapore|hong kong|shanghai|mexico city|buenos aires|stockholm|florence|barcelona)\b/.test(place)
  const cold = weather.low !== null && weather.low < 8
  const freezing = weather.low !== null && weather.low <= 0
  const hot = !cold && weather.high !== null && weather.high >= 25
  const wet = weather.rainDays !== null && weather.rainDays >= 30
  const unknown = weather.kind === 'unavailable'
  const climate: PackingPlan['climate'] = unknown ? 'unknown' : cold ? 'cold' : hot ? 'hot' : 'mild'
  const mild = climate === 'mild' || climate === 'unknown'
  const days = Math.round((dateNumber(trip.end) - dateNumber(trip.start)) / 86400000) + 1
  const r = Math.min(days, 7) // seven-day laundry rotation
  const a = trip.activity, s = trip.style
  const active = a === 'active', walking = a === 'walking', relaxing = a === 'relaxing', mixed = a === 'mixed'
  const polished = s === 'polished', statement = s === 'statement', relaxed = s === 'relaxed', understated = s === 'understated'
  const womenswear = trip.wear === 'women'
  const palette = statement ? ['red', 'blue', 'green', 'pink', 'yellow'] : /marrakech|lisbon|bali|mexico|tulum/.test(place) ? ['brown', 'sand', 'cream', 'green'] : coastal ? ['blue', 'navy', 'white', 'sand'] : ['black', 'navy', 'grey', 'white', 'cream']
  const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(n)))

  const needs: PackingNeed[] = []
  const add = (id: PackingKind, title: string, quantity: number, reason: string, optional = false) => {
    if (quantity < 1) return
    const existing = needs.find(n => n.id === id)
    if (existing) { existing.quantity = Math.max(existing.quantity, quantity); existing.optional = existing.optional && optional; return }
    needs.push({ id, title, group: GROUP_OF[id], quantity, reason, optional })
  }

  // ── Tops & dresses ──
  const topCount = clamp(r * (hot ? 0.8 : cold ? 0.45 : 0.6), 1, hot ? 6 : 5)
  add('tee', hot ? 'T-shirts and tanks' : cold ? 'Base T-shirts' : 'T-shirts', topCount, hot ? 'Breathable tops for the hottest hours; one a day keeps you fresh.' : 'Coordinating basics that sit under every other layer in this list.')
  if (!hot) add('long-sleeve-top', 'Long-sleeve tops', cold ? clamp(r / 3, 1, 3) : 1, coverage ? 'Long sleeves keep shoulders and arms covered at religious and traditional sites.' : 'A middle layer between a tee and knitwear for cooler mornings.')
  if (hot || (coastal && mild)) add('linen-shirt', coverage ? 'Lightweight long-sleeve linen shirts' : 'Linen shirts', clamp(r / 3, 1, 3), 'Linen stays cool in heat and dresses up for dinner; wear it open over a tank too.')
  add('shirt', polished ? 'Crisp button-up shirts' : 'Button-up shirts', polished ? clamp(r / 2.5, 1, 3) : hot ? (city ? 1 : 0) : clamp(r / 4, 1, 2), polished ? 'Structured shirts carry your polished look from day meetings to dinner.' : 'One sharp shirt turns any outfit here into an evening look.')
  if (!hot) add('knit', 'Light knitwear', cold ? 1 : clamp(r / 4, 1, 2), unknown ? 'Weather is still unconfirmed, so pack an adaptable layer.' : 'A fine knit for cooler evenings, flights and air-conditioned museums.')
  if (hot) add('knit', 'Light layer for air-conditioning', 1, 'Planes, trains and restaurants run cold even in the heat.', true)
  if (cold) add('warm-knit', 'Warm sweaters', days > 4 ? 2 : 1, freezing ? 'At or below freezing you need real insulation under your coat: wool, cashmere or fleece.' : 'Wool or cashmere does the heavy lifting on cold days; rewear between washes.')
  if (womenswear && !cold) add('dress', hot ? 'Dresses' : 'Dress', relaxing || statement || polished ? (hot ? clamp(r / 3, 1, 3) : 1) : 1, hot ? 'The easiest outfit in the heat: one piece, day to dinner.' : 'One dress covers your dressiest evening without packing a full extra outfit.', !(hot || polished || statement || relaxing))
  if (womenswear && cold && polished) add('dress', 'Knit or long-sleeve dress', 1, 'Pair with tights and boots for a dressier evening in the cold.', true)

  // ── Bottoms ──
  if (mild) add('trousers', polished ? 'Tailored trousers' : 'Everyday trousers', clamp(r / 3, 1, 3), 'Neutral trousers repeat across days; change the top and shoes, not the bottom.')
  if (cold) add('warm-trousers', 'Warm trousers', days > 4 ? 2 : 1, 'Wool, corduroy or lined trousers block the wind far better than cotton.')
  if (hot) add('light-trousers', 'Lightweight trousers', coverage ? clamp(r / 3, 1, 3) : clamp(r / 4, 1, 2), coverage ? 'Long, airy trousers cover legs where shorts are frowned upon.' : 'Airy full-length trousers for evenings, sun cover and mosquitoes.')
  if (!hot && !polished) add('jeans', 'Jeans', 1, relaxed ? 'Your go-to relaxed bottom for walking days.' : 'Hard-wearing and easy to rewear; dark denim dresses up.')
  if ((hot || (coastal && !cold) || relaxing) && !coverage) add('shorts', 'Shorts', hot ? clamp(r / 3, 1, 3) : 1, 'For beach days, hot walks and slow afternoons.', !hot)
  if (womenswear && !cold && (polished || statement || relaxing || hot)) add('skirt', 'Skirt', 1, coverage ? 'Choose a midi or maxi length for covered-up sightseeing.' : 'A skirt swaps in for trousers to create a new outfit with the same tops.', !(polished || statement))
  if (womenswear && cold && polished) add('skirt', 'Midi skirt for evenings', 1, 'Wear with tights, boots and a knit for dinner.', true)

  // ── Outerwear ──
  if (cold) add('coat', freezing ? 'Insulated winter coat' : 'Warm coat', 1, freezing ? 'Below freezing, a down or insulated coat with a hood matters more than anything else in your bag.' : 'A wool or insulated coat, sized to fit a sweater underneath.')
  if (mild) add('light-jacket', 'Light jacket', 1, 'A denim, bomber or overshirt layer for evenings and breezy days.')
  if (hot && !coverage) add('light-jacket', 'Light evening layer', 1, 'Coastal and desert nights cool down quickly after sunset.', true)
  if (polished && !hot) add('blazer', 'Blazer', 1, 'Instantly sharpens jeans or trousers for dinner and meetings.')
  if (!polished && city && mild) add('blazer', 'Blazer', 1, 'An easy way to dress up for a nicer restaurant.', true)
  if (wet) add('rain-shell', 'Rain jacket', 1, `About ${weather.rainDays}% of days on your dates see rain; a waterproof shell beats a cotton layer.`)
  else if (active && !hot) add('rain-shell', 'Packable rain jacket', 1, 'Mountain and outdoor weather changes fast; it packs into its own pocket.', true)

  // ── Footwear ──
  add('walking-shoes', 'Walking sneakers', walking && days > 5 ? 2 : 1, walking ? 'You will be on your feet all day: bring broken-in pairs and rotate them.' : /lisbon|porto|rome|amalfi|positano|dubrovnik|kotor|santorini/.test(place) ? 'Steep, polished stone streets need grip and cushioning.' : 'Comfortable all-day sneakers you have already broken in.')
  if (!(relaxing && hot)) add('dress-shoes', womenswear ? 'Evening shoes (flats, loafers or heels)' : 'Evening shoes (loafers or derbies)', 1, polished ? 'Finish your polished looks properly; sneakers will not do for dinner.' : 'One smarter pair for dinners and nights out.', !polished && relaxed)
  if (cold || (wet && !hot)) add('boots', cold ? 'Warm, grippy boots' : 'Water-resistant boots', 1, cold ? 'Insulated or lined boots with grip for cold, wet or icy streets.' : 'Keeps feet dry through rainy days.')
  if (hot || (coastal && !cold) || relaxing) add('sandals', 'Sandals', 1, 'For beach, pool and hot evenings; save walking for your sneakers.', !hot && !relaxing)
  if (active) add('trail-shoes', 'Hiking or trail shoes', 1, 'Grip and support for trails; fashion sneakers slip on dirt and rock.')

  // ── Accessories ──
  add('bag', relaxing ? 'Tote or beach bag' : 'Crossbody day bag', 1, walking || city ? 'A zipped crossbody keeps valuables in front of you in crowds and on transit.' : 'A bag big enough for a water bottle, sunscreen and a layer.')
  if (active) add('daypack', 'Daypack', 1, 'Carry water, snacks and a spare layer on long active days.')
  else if (walking) add('daypack', 'Small daypack', 1, 'Handy for long sightseeing days and day trips.', true)
  add('sunglasses', 'Sunglasses', 1, cold ? 'Winter sun and snow glare are harsh; check the retailer lists UV protection.' : 'Check the retailer lists UV protection, not just tinted lenses.')
  if (hot || (coastal && !cold) || active || relaxing) add('sun-hat', 'Sun hat or cap', 1, 'Shade for long hours outdoors.', !hot && !coastal)
  if (cold) {
    add('beanie', 'Warm beanie', 1, 'You lose a lot of heat from your head; one hat covers the whole trip.')
    add('gloves', 'Gloves', 1, freezing ? 'Essential below freezing, especially for phone-in-hand sightseeing.' : 'For cold mornings and evening walks.', !freezing)
    add('scarf', 'Warm scarf', 1, 'Seals the gap at your collar and dresses up a plain coat.')
  }
  if (coverage) add('light-scarf', 'Light scarf or wrap', 1, 'Covers shoulders or hair where venues require it; pack it every day.')
  else if (statement || hot) add('light-scarf', statement ? 'Statement scarf' : 'Light scarf or wrap', 1, statement ? 'The easiest way to add colour and print to a capsule wardrobe.' : 'Sun cover, a beach wrap or an evening accent.', !statement)
  add('belt', 'Belt', 1, 'Finishes trousers and dresses, and sharpens untucked looks.', !(polished || understated))
  if (wet) add('umbrella', 'Compact umbrella', 1, 'For the walk between cafés and museums on wet days.', active)
  else if (unknown) add('umbrella', 'Compact umbrella', 1, 'Weather is unconfirmed; a folding umbrella weighs almost nothing.', true)

  // ── Active & swim ──
  if ((coastal && !cold) || (relaxing && hot)) add('swim', 'Swimwear', days > 3 ? 2 : 1, 'Two lets one dry while you wear the other.')
  else if (hot) add('swim', 'Swimwear', 1, 'For hotel pools and day trips to the water.', true)
  if (active) {
    add('active-top', 'Workout tops', clamp(r / 2, 1, 3), 'Quick-dry technical tops; cotton stays wet and heavy.')
    add('active-bottoms', 'Workout leggings or shorts', clamp(r / 3, 1, 2), 'Stretch pieces for hikes, runs and classes.')
    if (womenswear) add('sports-bra', 'Sports bras', clamp(r / 3, 1, 2), 'Proper support for active days.')
  } else if (mixed) {
    add('active-top', 'Workout top', 1, 'For the one active day in your plans.')
    add('active-bottoms', 'Workout leggings or shorts', 1, 'Movement-friendly bottoms for that day.')
    if (womenswear) add('sports-bra', 'Sports bra', 1, 'For your active day.')
  }

  // ── Underwear & sleep ──
  add('underwear', 'Underwear', days > 1 ? Math.min(r + 1, 8) : 1, 'One pair a day plus a spare between laundry stops.')
  add('socks', walking || active ? 'Cushioned socks' : 'Socks', relaxing && hot ? clamp(r / 2, 1, 4) : Math.min(r + (walking || active ? 2 : 0), 9), cold ? 'Warm wool-blend socks keep feet comfortable in boots.' : walking || active ? 'Extra pairs prevent blisters on long walking days.' : 'One pair a day for closed shoes.')
  if (womenswear) add('bra', 'Bras', days > 1 ? clamp(r / 3 + 1, 2, 4) : 1, 'An everyday bra plus a seamless option for fitted tops.')
  add('sleepwear', 'Sleepwear', days > 7 ? 2 : 1, 'Keep a clean set separate from what you wear out.')
  if (cold && (freezing || active)) {
    add('base-layer-top', 'Thermal base layer tops', clamp(r / 3, 1, 3), 'A merino or thermal layer under your clothes is the warmest thing per gram.')
    add('base-layer-bottoms', 'Thermal leggings', clamp(r / 4, 1, 2), 'Under trousers on the coldest days.')
  } else if (cold) {
    add('base-layer-top', 'Thermal base layer top', 1, 'For the coldest day of the trip.', true)
  }

  // ── Fit the list to the length of the trip ──
  // A short trip is a capsule: fewer kinds of clothing, each worn more than once. Lists are trimmed by priority,
  // so what is left is what this trip needs most, and every count still adds up to the days away.
  const weekend = days <= 3, short = days <= 6
  if (weekend) {
    // Nice-to-haves don't earn space in a weekend bag (unconfirmed weather keeps its umbrella).
    for (let i = needs.length - 1; i >= 0; i--) if (needs[i].optional && !(needs[i].id === 'umbrella' && unknown)) needs.splice(i, 1)
  }
  const drop = (id: PackingKind) => { const i = needs.findIndex(n => n.id === id); if (i >= 0) needs.splice(i, 1) }
  const get = (id: PackingKind) => needs.find(n => n.id === id)
  // Reduce a group to `budget` pieces, taking from the lowest-priority kinds first (the order lists highest first).
  const fit = (order: PackingKind[], budget: number) => {
    const inGroup = () => order.map(get).filter((n): n is PackingNeed => !!n && !n.optional)
    let count = inGroup().reduce((t, n) => t + n.quantity, 0)
    for (const id of [...order].reverse()) {
      const n = get(id)
      if (!n || n.optional) continue
      while (count > budget && n.quantity > 0) { n.quantity--; count-- }
      if (n.quantity === 0) drop(id)
    }
  }
  if (short) {
    // Tops: one per day plus an evening option on a weekend; under a week, roughly one per day.
    const topOrder: PackingKind[] = hot
      ? ['tee', 'linen-shirt', 'dress', 'shirt', 'long-sleeve-top']
      : cold ? ['tee', 'long-sleeve-top', 'shirt', 'dress', 'linen-shirt'] : polished ? ['shirt', 'tee', 'long-sleeve-top', 'dress', 'linen-shirt'] : ['tee', 'shirt', 'long-sleeve-top', 'dress', 'linen-shirt']
    fit(topOrder, weekend ? days + 1 : days)
    // Bottoms: the pair you travel in, plus one more from three days; shorts for the beach in the heat.
    const bottomOrder: PackingKind[] = hot
      ? (coverage ? ['light-trousers', 'skirt', 'shorts', 'trousers', 'jeans'] : ['shorts', 'light-trousers', 'skirt', 'trousers', 'jeans'])
      : cold ? ['warm-trousers', 'jeans', 'trousers', 'skirt'] : relaxed ? ['jeans', 'trousers', 'shorts', 'skirt'] : ['trousers', 'jeans', 'skirt', 'shorts']
    fit(bottomOrder, days <= 2 ? (hot ? 2 : 1) : weekend ? 2 : 3)
    // Layers: one jacket and one knit is plenty; the coat in the cold is the jacket.
    const layerOrder: PackingKind[] = cold ? ['coat', 'warm-knit', 'knit', 'blazer', 'light-jacket'] : polished ? ['blazer', 'knit', 'light-jacket'] : ['light-jacket', 'knit', 'blazer']
    fit(layerOrder, weekend ? 2 : 3)
    if (weekend && get('rain-shell') && !cold) drop('light-jacket') // the rain jacket is the jacket
    // Shoes: the pair you travel in plus one; boots double as walking shoes in the cold.
    if (weekend && get('boots') && !walking && !active) drop('walking-shoes')
    const shoeOrder: PackingKind[] = ['trail-shoes', 'boots', 'walking-shoes', ...(hot || relaxing ? ['sandals', 'dress-shoes'] : ['dress-shoes', 'sandals']) as PackingKind[]]
    fit(shoeOrder, weekend ? 2 : 3)
  }
  if (weekend) {
    if (!polished) drop('belt')
    if (mixed) for (const id of ['active-top', 'active-bottoms', 'sports-bra'] as PackingKind[]) drop(id)
    const bra = get('bra'); if (bra) bra.quantity = Math.min(bra.quantity, days)
    const swim = get('swim'); if (swim) swim.quantity = 1
  }

  // A single piece reads as a single piece: "1× T-shirt", not "1× T-shirts".
  for (const n of needs) if (n.quantity === 1) n.title = n.title.replace(/T-shirts and tanks/, 'T-shirt or tank').replace(/\b(shirt|top|sweater|bra|tank)s\b/g, '$1').replace(/\bDresses\b/, 'Dress')
  const total = needs.filter(n => !n.optional).reduce((t, n) => t + n.quantity, 0)
  const length = weekend ? `A ${days}-day capsule: ${total} pieces, each worn more than once` : `${days}-day trip, ${total} pieces in total`
  const note = `${length}. Quantities include what you wear on the way${days > 7 ? ' and assume one laundry stop a week' : ''}.`
  return { days, climate, palette, needs, total, note }
}
