import { dateNumber, type Trip } from './trip'
import type { TripWeather } from './weather'

export type PackingKind = 'tee' | 'linen-shirt' | 'shirt' | 'trousers' | 'warm-trousers' | 'light-trousers' | 'knit' | 'warm-knit' | 'coat' | 'rain-shell' | 'walking-shoes' | 'trail-shoes' | 'sandals' | 'swim' | 'sun-hat' | 'beanie' | 'scarf' | 'light-scarf' | 'bag' | 'daypack' | 'sunglasses' | 'umbrella' | 'active-top' | 'active-bottoms' | 'underwear' | 'socks' | 'sleepwear'
export type PackingNeed = { id: PackingKind; title: string; group: 'Clothing' | 'Footwear' | 'Accessories' | 'Daily essentials'; quantity: number; reason: string; optional?: boolean }
export type PackingPlan = { days: number; note: string; climate: 'cold' | 'mild' | 'hot' | 'unknown'; palette: string[]; needs: PackingNeed[] }

// Location changes the styling context, never supplies invented weather.
export function buildPackingPlan(trip: Trip, weather: TripWeather): PackingPlan {
  const place = trip.destination.toLowerCase()
  const coastal = /\b(bali|tulum|amalfi|maldives|phuket|sanya|hawaii|maui|santorini|ibiza|barbados|cancun)\b/.test(place)
  const coverage = /\b(marrakech|marrakesh|fez|cairo|dubai|abu dhabi|bali)\b/.test(place)
  const city = /\b(tokyo|seoul|london|paris|new york|montreal|montréal|lisbon|rome|milan|berlin)\b/.test(place)
  const cold = weather.low !== null && weather.low < 8
  const hot = !cold && weather.high !== null && weather.high >= 25
  const wet = weather.rainDays !== null && weather.rainDays >= 30
  const climate = weather.kind === 'unavailable' ? 'unknown' : cold ? 'cold' : hot ? 'hot' : 'mild'
  const days = Math.round((dateNumber(trip.end) - dateNumber(trip.start)) / 86400000) + 1
  const rotation = Math.min(days, 7)
  const active = trip.activity === 'active'
  const polished = trip.style === 'polished'
  const palette = trip.style === 'statement' ? ['red', 'blue', 'green'] : /marrakech|lisbon|bali/.test(place) ? ['brown', 'almond', 'sand', 'hazelwood'] : coastal ? ['blue', 'navy', 'sand'] : ['black', 'navy', 'grey']
  const needs: PackingNeed[] = []
  const add = (id: PackingKind, title: string, group: PackingNeed['group'], quantity: number, reason: string, optional = false) => needs.push({id,title,group,quantity,reason,optional})
  // Put the most distinctive weather need first, rather than a universal white tee.
  if (cold) {
    add('warm-knit','Warm knitwear','Clothing',days > 4 ? 2 : 1,'Wear over a base layer for the cooler conditions in your weather summary.')
    add('warm-trousers','Warm trousers','Clothing',days > 4 ? 2 : 1,'A full-length wool or lined trouser anchors your cooler-day looks.')
    add('coat','Insulated outer layer','Clothing',1,'Choose insulation for the temperatures shown; allow room for knitwear underneath.')
  } else if (hot) {
    add('linen-shirt',coverage ? 'Lightweight long-sleeve shirt' : 'Breathable linen shirt','Clothing',Math.min(3,Math.ceil(rotation / 3)),'An airy shirt works for daytime and dinner; roll sleeves or wear open over a base top.')
    add('light-trousers','Loose lightweight trousers','Clothing',Math.min(3,Math.ceil(rotation / 3)),'Choose airy fabric and an easy fit for warm days; full-length options also provide coverage.')
  } else {
    add('trousers',polished ? 'Tailored everyday trousers' : 'Versatile everyday trousers','Clothing',Math.min(3,Math.ceil(rotation / 3)),'Repeat a neutral trouser across daytime and evening outfits.')
    add('shirt',coverage ? 'Long-sleeve shirt for coverage' : 'Day-to-evening shirt','Clothing',Math.min(3,Math.ceil(rotation / 3)),coverage ? 'Keep shoulders covered where venues request it; check the dress code for each visit.' : city ? 'Pair with trousers for city days, then adjust your shoes and accessories for dinner.' : 'A button-through shirt gives you an extra layer and a considered evening look.')
    add('knit','Removable knit layer','Clothing',1,climate === 'unknown' ? 'Weather is unavailable, so start with an adaptable layer and recheck conditions.' : 'A light knit adds flexibility for cooler mornings, evenings and indoor spaces.')
  }
  add('tee',cold ? 'Everyday base tops' : 'Mix-and-match tops','Clothing',Math.min(5,Math.max(2,Math.ceil(rotation * .7))),'Rotate a few coordinating tops; these are the base of your outfits, not the whole wardrobe.')
  if (hot) add('knit','Light indoor layer','Clothing',1,'Optional for air-conditioned transport or indoor spaces.',true)
  if (wet) add('rain-shell','Packable rain shell','Clothing',1,'Your weather summary includes wet days. Look for waterproof protection rather than a cotton overshirt.')
  if (active) {
    add('active-top','Quick-drying activity tops','Clothing',Math.min(3,rotation),'Keep a separate rotation for sweaty activity; cotton everyday tops are not a technical substitute.')
    add('active-bottoms','Stretch activity trousers or shorts','Clothing',Math.min(2,rotation),'Choose movement-friendly pieces suited to your actual activity and terrain.')
  }
  if (coastal && !cold) add('swim','Swimwear','Clothing',days > 3 ? 2 : 1,climate === 'unknown' ? 'Optional if swimming is planned; water and air conditions are not confirmed.' : 'For planned beach or pool time; a second piece can dry while you wear the other.',true)
  add(active ? 'trail-shoes' : 'walking-shoes',active ? 'Activity-appropriate shoes' : 'Comfortable walking shoes','Footwear',1,active ? 'Match grip and support to the route; everyday fashion sneakers are not a trail-shoe substitute.' : /lisbon/.test(place) ? 'Choose secure fit and grip for hills and uneven paving.' : 'Choose a comfortable pair you can wear for a full day; break them in before departure.')
  if (coastal && hot) add('sandals','Secure sandals','Footwear',1,'A second pair for beach or pool days; use walking shoes for longer outings.',true)
  add(active ? 'daypack' : 'bag',active ? 'Small daypack' : trip.activity === 'relaxing' ? 'Easy day bag' : 'Compact day bag','Accessories',1,active ? 'Leave room for a spare layer and the essentials for your route.' : 'Choose a closure and carrying style that keeps your essentials close while moving around.')
  if (cold) {
    add('beanie','Warm beanie','Accessories',1,'An easy layer for cooler outdoor stretches.')
    add('scarf','Warm scarf','Accessories',1,'Add warmth around the neck without packing another bulky garment.')
  } else {
    if (hot || coastal || active) add('sun-hat','Sun hat or cap','Accessories',1,'A practical shade layer for time outdoors; brim coverage varies by design.')
    add('sunglasses','UV-protective sunglasses','Accessories',1,'Check the retailer specifies UV protection; lens colour alone is not enough.')
    if (coverage) add('light-scarf','Lightweight scarf or wrap','Accessories',1,'An optional extra coverage layer for individual venues; check requirements before visiting.',true)
  }
  if (wet && !active) add('umbrella','Compact umbrella','Accessories',1,'Useful between indoor stops when rain is in the weather summary.',true)
  add('underwear','Underwear','Daily essentials',rotation,'One change per day between laundry stops.')
  add('socks','Socks for your footwear','Daily essentials',rotation,cold ? 'Choose warmer socks that still fit comfortably inside your shoes.' : 'Bring enough pairs for walking days and laundry rotation.')
  add('sleepwear','Sleepwear','Daily essentials',days > 7 ? 2 : 1,'Keep one comfortable set separate from your daytime clothing.')
  return { days, climate, palette, needs, note: `${days}-day trip. Quantities include what you wear in transit. ${days > 7 ? 'Plan laundry about once a week; quantities use a seven-day rotation.' : 'Rewear trousers and layers; adjust for your laundry plans.'} Optional pieces depend on your itinerary.` }
}
