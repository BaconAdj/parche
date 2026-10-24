// The parché edit: one designer direction per trip, and three looks built around a statement piece.
// Directions come from the FW26 runways and Resort 2027 forecasts (Vogue, Net-a-Porter, GQ, Style Arcade, Mango);
// every look uses only real products from the trip's own packing list, so what we style is what we pack.
import type { Product, Tier } from './catalogue-types'
import type { PackingKind, PackingPlan } from './packing'
import type { Trip, Wear } from './trip'
import { profileOf, trendNote, type Family, type StyleProfile } from './style'

type Climate = PackingPlan['climate']
type Swatch = { label: string; hex: string }
export type Direction = {
  id: string; name: string; line: string; rule: string
  climates: Climate[]; wear?: Exclude<Wear, 'unisex'>[]; styles: Trip['style'][]; activities?: Trip['activity'][]; places?: RegExp
  neutrals: Family[]; accents: Family[]; twoAccents?: boolean; fabrics: string[]; trends: string[]; patterns?: string[]
  swatches: Swatch[]
}

export const DIRECTIONS: Direction[] = [
  {
    id: 'mocha-cherry', name: 'Mocha & Cherry',
    line: 'Chocolate does the work of black this season. One hit of cherry red makes it modern.',
    rule: 'Keep everything else chocolate, camel or cream, and let the red appear exactly once.',
    climates: ['cold', 'mild'], styles: ['polished', 'statement', 'understated'],
    places: /paris|london|new york|copenhagen|montr[eé]al|toronto|milan|rome|florence|madrid|vienna|prague|chicago|quebec/i,
    neutrals: ['brown', 'sand', 'cream', 'black', 'denim'], accents: ['red', 'burgundy'],
    fabrics: ['suede', 'leather', 'wool', 'cashmere', 'merino'], trends: ['suede', 'rollneck', 'volume-leg', 'flat-shoe', 'trench', 'messenger'],
    swatches: [{ label: 'Chocolate', hex: '#4B2E22' }, { label: 'Camel', hex: '#B88A5A' }, { label: 'Cream', hex: '#EFE6D6' }, { label: 'Cherry', hex: '#9E1B22' }],
  },
  {
    id: 'bottle-green', name: 'Bottle Green Academia',
    line: 'Poet-core, grown up: corduroy, a cable knit, a proper loafer and one bottle-green piece.',
    rule: 'Brown, cream and navy around a single green. Texture over shine.',
    climates: ['cold', 'mild'], styles: ['understated', 'relaxed', 'polished'],
    places: /london|edinburgh|dublin|oxford|cambridge|boston|amsterdam|copenhagen|kyoto|bruges|stockholm|oslo|montr[eé]al/i,
    neutrals: ['brown', 'cream', 'sand', 'navy', 'grey', 'denim', 'olive'], accents: ['green'],
    fabrics: ['corduroy', 'tweed', 'wool', 'knit', 'merino', 'suede'], trends: ['cable', 'check', 'corduroy', 'vest', 'cardigan', 'flat-shoe', 'messenger', 'barn'], patterns: ['check'],
    swatches: [{ label: 'Bottle green', hex: '#1F4D3A' }, { label: 'Walnut', hex: '#5C4030' }, { label: 'Ecru', hex: '#E9E1CF' }, { label: 'Navy', hex: '#1E2A44' }],
  },
  {
    id: 'grape-tomato', name: 'Grape & Tomato',
    line: 'The colour clash of the season: purple and red, worn like you mean it.',
    rule: 'Two colours, never three. Black or cream for everything that isn’t grape or tomato.',
    climates: ['cold', 'mild', 'hot'], styles: ['statement'],
    places: /mexico|marrakech|lisbon|barcelona|seoul|tokyo|berlin|milan|cartagena|havana/i,
    neutrals: ['black', 'cream', 'charcoal', 'white', 'denim'], accents: ['purple', 'red', 'burgundy', 'pink'], twoAccents: true,
    fabrics: ['satin', 'silk', 'knit', 'leather', 'velvet'], trends: ['satin', 'velvet', 'stripe', 'flat-shoe', 'tailoring'],
    swatches: [{ label: 'Grape', hex: '#5B2A6E' }, { label: 'Tomato', hex: '#D2382B' }, { label: 'Black', hex: '#141414' }, { label: 'Cream', hex: '#F1EADB' }],
  },
  {
    id: 'butter-slate', name: 'Butter & Slate',
    line: 'Butter yellow against cool grey. The softest way to wear colour this fall.',
    rule: 'Greys, charcoal and white do the heavy lifting; butter is the one warm note.',
    climates: ['cold', 'mild', 'unknown'], styles: ['understated', 'relaxed', 'statement'],
    places: /copenhagen|stockholm|berlin|amsterdam|seoul|tokyo|zurich|helsinki|vancouver|san francisco/i,
    neutrals: ['grey', 'charcoal', 'white', 'cream', 'navy', 'denim', 'black'], accents: ['yellow'],
    fabrics: ['knit', 'wool', 'merino', 'cashmere', 'poplin'], trends: ['zip-knit', 'cardigan', 'cable', 'volume-leg', 'flat-shoe', 'trench'],
    swatches: [{ label: 'Butter', hex: '#F2DC8C' }, { label: 'Slate', hex: '#6B7480' }, { label: 'Charcoal', hex: '#34373C' }, { label: 'White', hex: '#F7F6F2' }],
  },
  {
    id: 'after-dark', name: 'After Dark',
    line: 'Black on black on charcoal, sharpened with satin and leather. Nothing loud, everything deliberate.',
    rule: 'Tonal from collar to shoe. Change the texture, never the colour.',
    climates: ['cold', 'mild', 'unknown'], styles: ['polished', 'understated'],
    places: /new york|tokyo|seoul|berlin|paris|london|hong kong|singapore|shanghai|milan|antwerp|los angeles/i,
    neutrals: ['black', 'charcoal', 'grey', 'white', 'cream', 'navy'], accents: ['metallic', 'burgundy'],
    fabrics: ['leather', 'satin', 'silk', 'wool', 'velvet', 'cashmere'], trends: ['satin', 'velvet', 'tailoring', 'trench', 'flat-shoe', 'rollneck'],
    swatches: [{ label: 'Black', hex: '#111111' }, { label: 'Charcoal', hex: '#3A3B3E' }, { label: 'Ash', hex: '#9C9C9A' }, { label: 'Bone', hex: '#E8E2D6' }],
  },
  {
    id: 'heritage-camel', name: 'Heritage Camel',
    line: 'Camel, grey and navy, the way Milan does it: soft tailoring, a quarter-zip, a coat with some weight.',
    rule: 'Warm neutrals only. If something shines, it’s the shoe.',
    climates: ['cold', 'mild'], styles: ['polished', 'understated', ''],
    places: /milan|florence|rome|vienna|madrid|zurich|geneva|munich|turin|bologna|lake como|london/i,
    neutrals: ['sand', 'brown', 'grey', 'navy', 'cream', 'charcoal', 'denim'], accents: ['burgundy', 'olive'],
    fabrics: ['wool', 'cashmere', 'tweed', 'merino', 'suede', 'leather'], trends: ['zip-knit', 'check', 'trench', 'tailoring', 'flat-shoe', 'polo'], patterns: ['check'],
    swatches: [{ label: 'Camel', hex: '#B4874F' }, { label: 'Flannel', hex: '#7E7F82' }, { label: 'Navy', hex: '#1D2840' }, { label: 'Oxblood', hex: '#5E1B1F' }],
  },
  {
    id: 'winter-white', name: 'Winter White',
    line: 'Snow-day dressing in ecru and oatmeal: chunky knits, shearling, nothing that fights the landscape.',
    rule: 'Cream, oat and stone, with chocolate as the only dark note.',
    climates: ['cold'], styles: ['understated', 'relaxed', 'polished', ''],
    places: /zermatt|chamonix|aspen|whistler|banff|st\.? moritz|niseko|lapland|reykjavik|troms|quebec|montr[eé]al|innsbruck|courchevel|verbier|helsinki|oslo/i,
    neutrals: ['cream', 'white', 'sand', 'grey', 'brown'], accents: ['brown', 'metallic'],
    fabrics: ['shearling', 'cashmere', 'wool', 'alpaca', 'knit', 'merino'], trends: ['cable', 'fur', 'rollneck', 'zip-knit'],
    swatches: [{ label: 'Ecru', hex: '#ECE3D0' }, { label: 'Oat', hex: '#D7C7A8' }, { label: 'Stone', hex: '#B6AA98' }, { label: 'Cocoa', hex: '#5A3B2B' }],
  },
  {
    id: 'riviera-blue', name: 'Riviera Blue',
    line: 'Blue and white, lived-in: crumpled linen, a bold stripe and sun-faded denim.',
    rule: 'Blue, white and sand. One stripe per outfit, and let the linen crease.',
    climates: ['hot', 'mild'], styles: ['relaxed', 'understated', 'polished', ''],
    places: /amalfi|positano|capri|nice|santorini|mykonos|ibiza|mallorca|menorca|lisbon|barcelona|hvar|dubrovnik|algarve|porto|cannes|saint[- ]tropez|sicily|sardinia|greece|croatia/i,
    neutrals: ['white', 'cream', 'navy', 'sand', 'denim'], accents: ['blue'],
    fabrics: ['linen', 'poplin', 'raffia', 'crochet', 'denim'], trends: ['linen', 'stripe', 'poplin', 'fisherman', 'crochet'], patterns: ['stripe'],
    swatches: [{ label: 'Riviera', hex: '#2E5FA8' }, { label: 'Navy', hex: '#1B2A4A' }, { label: 'Alabaster', hex: '#F4F0E6' }, { label: 'Sand', hex: '#D9C3A0' }],
  },
  {
    id: 'celadon-alabaster', name: 'Celadon & Alabaster',
    line: 'Resort 2027’s quietest flex: alabaster linen washed with celadon and sage.',
    rule: 'Cream, white and sand, with soft green as the only colour. Natural fibres only.',
    climates: ['hot'], styles: ['understated', 'relaxed', ''],
    places: /bali|tulum|maldives|phuket|hawaii|maui|fiji|seychelles|costa rica|koh samui|langkawi|zanzibar|mauritius|bora bora|sri lanka|palawan/i,
    neutrals: ['cream', 'white', 'sand', 'olive', 'brown'], accents: ['green', 'yellow'],
    fabrics: ['linen', 'crochet', 'raffia', 'poplin', 'silk'], trends: ['linen', 'crochet', 'fisherman', 'poplin'],
    swatches: [{ label: 'Celadon', hex: '#A9C4A6' }, { label: 'Alabaster', hex: '#F3EFE4' }, { label: 'Sand', hex: '#D6C29E' }, { label: 'Sage', hex: '#7F9474' }],
  },
  {
    id: 'terracotta', name: 'Terracotta Heat',
    line: 'Sunbaked rust, sand and olive in long, loose shapes that move in the heat.',
    rule: 'Earth tones only. Cover more skin, in lighter fabric, and you’ll look better and feel cooler.',
    climates: ['hot', 'mild'], styles: ['relaxed', 'statement', 'understated', ''],
    places: /marrakech|marrakesh|fez|dubai|abu dhabi|mexico|oaxaca|seville|jaipur|cairo|cartagena|sedona|muscat|amman|petra|santa fe|palm springs|joshua tree|tulum/i,
    neutrals: ['sand', 'cream', 'brown', 'olive', 'white'], accents: ['orange', 'burgundy', 'red', 'yellow'],
    fabrics: ['linen', 'crochet', 'raffia', 'suede', 'leather', 'poplin'], trends: ['linen', 'crochet', 'fisherman', 'suede', 'volume-leg'],
    swatches: [{ label: 'Terracotta', hex: '#B5522F' }, { label: 'Sand', hex: '#D8BE94' }, { label: 'Olive', hex: '#5F6537' }, { label: 'Bone', hex: '#EEE6D6' }],
  },
  {
    id: 'trail-to-table', name: 'Trail to Table',
    line: 'Technical where it matters, considered everywhere else: merino, one bright shell, and nothing that looks like gym kit at dinner.',
    rule: 'Black, olive and stone for every layer; the brightest colour goes on the outermost one.',
    climates: ['cold', 'mild', 'hot', 'unknown'], styles: ['relaxed', 'understated', ''], activities: ['active'],
    places: /banff|patagonia|iceland|reykjavik|queenstown|dolomites|swiss alps|moab|yosemite|kyoto|cape town|peru|cusco|nepal|kathmandu|scotland|highlands/i,
    neutrals: ['black', 'olive', 'sand', 'grey', 'charcoal', 'navy', 'brown'], accents: ['orange', 'blue', 'red', 'yellow', 'green'],
    fabrics: ['merino', 'tech', 'wool', 'knit'], trends: ['zip-knit', 'barn', 'fur'],
    swatches: [{ label: 'Olive', hex: '#4E5634' }, { label: 'Stone', hex: '#B9AE98' }, { label: 'Black', hex: '#151515' }, { label: 'Signal orange', hex: '#E0602A' }],
  },
  {
    id: 'new-lady', name: 'The New Lady',
    line: 'Defined shoulders, a nipped waist, ballet flats: ladylike, with an edge.',
    rule: 'Black, navy and cream, with baby pink or burgundy as the single soft note.',
    climates: ['cold', 'mild', 'unknown'], wear: ['women'], styles: ['polished', 'statement'],
    places: /paris|london|new york|milan|rome|vienna|monaco|madrid|tokyo|seoul/i,
    neutrals: ['black', 'navy', 'cream', 'grey', 'sand', 'white'], accents: ['pink', 'burgundy', 'red'],
    fabrics: ['tweed', 'wool', 'satin', 'silk', 'cashmere', 'leather'], trends: ['tailoring', 'cardigan', 'flat-shoe', 'satin', 'trench'],
    swatches: [{ label: 'Black', hex: '#121212' }, { label: 'Ivory', hex: '#F1EBDD' }, { label: 'Baby pink', hex: '#F2C6CF' }, { label: 'Burgundy', hex: '#5F1A2A' }],
  },
]

export type LookPiece = { kind: PackingKind; product: Product; role: 'The statement' | 'The base' | 'The layer' | 'The shoe' | 'The finish'; note: string }
export type StyledLook = { id: string; title: string; occasion: string; note: string; tier: Tier; pieces: LookPiece[] }
export type StyledEdit = { id: string; name: string; line: string; rule: string; swatches: Swatch[]; looks: StyledLook[]; alternates: { id: string; name: string; line: string }[] }

function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0 }
const jitter = (seed: string) => (hash(seed) % 1000) / 1000
const pick = <T>(list: T[], seed: string) => list[hash(seed) % list.length]

const TIER_ORDER: Tier[] = ['Budget', 'Quality', 'High-end']
const fitsWear = (p: Product, wear: Wear) => wear === 'unisex' || p.gender === wear || p.gender === 'unisex'
const fitsClimate = (p: Product, climate: Climate) => climate === 'unknown' || p.climates.includes(climate)
const UNIVERSAL: Family[] = ['black', 'white', 'cream', 'navy', 'grey', 'charcoal']

// How well a product sits in a direction, before the look around it is considered.
export function directionFit(p: Product, d: Direction): number {
  const s = profileOf(p)
  if (s.novelty) return -20
  let x = 0
  if (!s.family) x -= 1.5
  else if (d.neutrals.includes(s.family)) x += 2
  else if (d.accents.includes(s.family)) x += 3
  else if (UNIVERSAL.includes(s.family)) x -= 0.5
  else x -= 4
  x += s.trends.filter(t => d.trends.includes(t)).length * 1.5 + s.fabrics.filter(f => d.fabrics.includes(f)).length
  if (s.pattern && !d.patterns?.includes(s.pattern)) x -= 1
  if (s.clearance) x -= 0.5
  return x + s.prestige * 0.5
}

type Ctx = { d: Direction; tier: Tier; formality: number; hero: boolean; accents: number; pattern: boolean; brands: Set<string>; fabrics: Map<string, number>; active: boolean; cold: boolean; hot: boolean; seed: string }
function pieceScore(p: Product, c: Ctx): number {
  const s = profileOf(p)
  if (s.novelty) return -Infinity
  if (s.lounge && !c.active) return -Infinity
  // Shorts, tanks and sandals are never styled into a cold-weather look, whatever the listing's tags say.
  if (c.cold && /\b(shorts?(?![- ]sleeve)|tank|sleeveless|sandals?|slides?)\b/i.test(p.name)) return -Infinity
  // And nothing furry, padded or fleecy goes into a hot-weather look.
  if (c.hot && /\b(faux fur|fur|shearling|sherpa|fleece|puffer|down|quilted|padded|cashmere|wool coat|boots?)\b/i.test(p.name)) return -Infinity
  let x = 0
  // One hero texture per look: a second suede piece is a choice, a fourth is a costume.
  for (const f of s.fabrics) x -= (c.fabrics.get(f) || 0) * 2.2
  if (!s.family) x -= c.hero ? 6 : 2.5
  else if (c.d.accents.includes(s.family) && !(c.d.neutrals.includes(s.family) && !c.hero)) {
    const room = (c.d.twoAccents ? 2 : 1) - c.accents
    x += c.hero ? 7 : room > 0 ? 1.5 : -7
  } else if (c.d.neutrals.includes(s.family)) x += c.hero ? 2.5 : 3.5
  else if (UNIVERSAL.includes(s.family)) x -= 1
  else x -= 7
  if (s.pattern) x += c.pattern ? -7 : c.d.patterns?.includes(s.pattern) ? 2.5 : c.hero ? 0 : -2
  x += s.trends.filter(t => c.d.trends.includes(t)).length * 2 + Math.min(s.trends.length, 2) * 0.5
  x += s.fabrics.filter(f => c.d.fabrics.includes(f)).length * 1.5
  if (s.seasonShade) x += 1
  x -= Math.abs(s.formality - c.formality) * 1.3
  const gap = Math.abs(TIER_ORDER.indexOf(p.tier) - TIER_ORDER.indexOf(c.tier))
  x += gap === 0 ? 2.5 : gap === 1 ? 0.3 : -2
  x += s.prestige * (c.hero ? 1.5 : 0.5)
  if (s.clearance) x -= 1
  if (c.brands.has(p.brand)) x -= 1.5
  return x + jitter(c.seed + p.id) * 0.9
}

type Slot = { role: LookPiece['role']; kinds: PackingKind[] }
type Recipe = { id: string; titles: string[]; occasion: string; tier: Tier; formality: number; hero: PackingKind[]; slots: Slot[] }

const TOPS: PackingKind[] = ['shirt', 'linen-shirt', 'knit', 'long-sleeve-top', 'tee', 'warm-knit', 'active-top', 'base-layer-top']
const LAYERS: PackingKind[] = ['coat', 'light-jacket', 'blazer', 'warm-knit', 'knit', 'rain-shell']

function recipes(trip: Trip, plan: PackingPlan, has: (k: PackingKind) => boolean): Recipe[] {
  const { climate } = plan
  const hot = climate === 'hot', cold = climate === 'cold'
  const women = trip.wear === 'women'
  const polished = trip.style === 'polished'
  const bottoms: PackingKind[] = hot ? ['light-trousers', 'shorts', 'skirt', 'trousers', 'jeans'] : cold ? ['warm-trousers', 'jeans', 'trousers', 'skirt'] : ['trousers', 'jeans', 'skirt', 'light-trousers', 'shorts']
  const day: Recipe = {
    id: 'day', titles: ['The daytime uniform', 'Gallery, then lunch', 'Long walk, good coffee', 'Morning to golden hour'], occasion: 'By day', tier: 'Quality', formality: polished ? 2 : 1.5,
    hero: hot ? ['linen-shirt', 'dress', 'shirt', 'light-trousers', 'skirt', 'sun-hat'] : cold ? ['coat', 'warm-knit', 'boots', 'light-jacket'] : ['light-jacket', 'knit', 'trousers', 'blazer', 'jeans'],
    slots: [
      { role: 'The layer', kinds: cold ? ['coat', 'light-jacket', 'warm-knit'] : hot ? [] : ['light-jacket', 'knit', 'blazer', 'rain-shell'] },
      { role: 'The base', kinds: hot ? ['tee', 'linen-shirt', 'shirt'] : ['tee', 'long-sleeve-top', 'shirt', 'knit', 'warm-knit'] },
      { role: 'The base', kinds: bottoms },
      { role: 'The shoe', kinds: hot ? ['sandals', 'walking-shoes'] : cold ? ['boots', 'walking-shoes'] : ['walking-shoes', 'boots', 'dress-shoes'] },
      { role: 'The finish', kinds: hot ? ['sun-hat', 'sunglasses', 'bag'] : cold ? ['scarf', 'beanie', 'bag', 'gloves'] : ['bag', 'sunglasses', 'belt'] },
      { role: 'The finish', kinds: ['sunglasses', 'bag', 'belt', 'light-scarf'] },
    ],
  }
  const evening: Recipe = {
    id: 'evening', titles: ['Dinner at nine', 'The reservation', 'After dark', 'Last table on the terrace'], occasion: 'Evening', tier: 'High-end', formality: 2.6,
    hero: women ? (cold ? ['dress', 'coat', 'blazer', 'skirt', 'dress-shoes'] : ['dress', 'skirt', 'blazer', 'shirt', 'linen-shirt', 'light-trousers', 'dress-shoes']) : (cold ? ['blazer', 'coat', 'knit', 'shirt', 'dress-shoes'] : ['blazer', 'shirt', 'linen-shirt', 'knit', 'dress-shoes']),
    slots: [
      { role: 'The layer', kinds: hot ? ['blazer', 'light-scarf'] : cold ? ['coat', 'blazer'] : ['blazer', 'light-jacket', 'coat'] },
      { role: 'The base', kinds: ['shirt', 'knit', 'linen-shirt', 'long-sleeve-top', 'tee', 'warm-knit'] },
      { role: 'The base', kinds: women ? ['skirt', 'trousers', 'warm-trousers', 'light-trousers', 'jeans'] : ['trousers', 'warm-trousers', 'light-trousers', 'jeans'] },
      { role: 'The shoe', kinds: hot ? ['dress-shoes', 'sandals'] : ['dress-shoes', 'boots'] },
      { role: 'The finish', kinds: ['bag', 'belt', 'scarf', 'light-scarf'] },
    ],
  }
  const swimTrip = has('swim') && (hot || trip.activity === 'relaxing')
  const third: Recipe = trip.activity === 'active' ? {
    id: 'active', titles: ['Trail to terrace', 'Up early, back for lunch', 'Summit, then a cold drink'], occasion: 'Active day', tier: 'Quality', formality: 0.6,
    hero: cold ? ['rain-shell', 'coat', 'light-jacket', 'warm-knit'] : ['rain-shell', 'light-jacket', 'active-top', 'trail-shoes'],
    slots: [
      { role: 'The layer', kinds: cold ? ['coat', 'rain-shell', 'light-jacket'] : ['rain-shell', 'light-jacket'] },
      { role: 'The base', kinds: cold ? ['base-layer-top', 'active-top', 'long-sleeve-top', 'warm-knit'] : ['active-top', 'long-sleeve-top', 'tee'] },
      { role: 'The base', kinds: cold ? ['warm-trousers', 'active-bottoms', 'trousers'] : ['active-bottoms', 'shorts', 'trousers'] },
      { role: 'The shoe', kinds: has('trail-shoes') ? ['trail-shoes'] : cold ? ['boots', 'walking-shoes'] : ['walking-shoes'] },
      { role: 'The finish', kinds: ['daypack', 'sun-hat', 'beanie'] },
      { role: 'The finish', kinds: ['sunglasses'] },
    ],
  } : swimTrip ? {
    id: 'water', titles: ['Salt and sun', 'Long lunch by the water', 'Swim, nap, repeat'], occasion: 'By the water', tier: 'Quality', formality: 0.9,
    hero: ['swim', 'linen-shirt', 'sun-hat'],
    slots: [
      { role: 'The base', kinds: ['swim'] },
      { role: 'The layer', kinds: ['linen-shirt', 'shirt', 'light-scarf'] },
      { role: 'The base', kinds: ['shorts', 'skirt', 'light-trousers'] },
      { role: 'The shoe', kinds: ['sandals'] },
      { role: 'The finish', kinds: ['sun-hat', 'bag'] },
      { role: 'The finish', kinds: ['sunglasses', 'bag'] },
    ],
  } : {
    id: 'off-duty', titles: ['Off-duty', 'Sunday market', 'The slow day', 'Neighbourhood wandering'], occasion: 'Off-duty', tier: 'Budget', formality: 1.1,
    hero: cold ? ['warm-knit', 'knit', 'light-jacket', 'boots'] : hot ? ['tee', 'shorts', 'dress', 'linen-shirt'] : ['knit', 'jeans', 'light-jacket', 'long-sleeve-top', 'tee'],
    slots: [
      { role: 'The layer', kinds: cold ? ['coat', 'light-jacket', 'warm-knit'] : hot ? [] : ['light-jacket', 'knit', 'rain-shell'] },
      { role: 'The base', kinds: ['tee', 'long-sleeve-top', 'knit', 'shirt', 'linen-shirt'] },
      { role: 'The base', kinds: hot ? ['shorts', 'light-trousers', 'skirt', 'jeans'] : ['jeans', 'trousers', 'warm-trousers', 'skirt'] },
      { role: 'The shoe', kinds: hot ? ['sandals', 'walking-shoes'] : ['walking-shoes', 'boots'] },
      { role: 'The finish', kinds: cold ? ['beanie', 'scarf', 'bag'] : ['bag', 'sunglasses', 'sun-hat'] },
    ],
  }
  return [day, evening, third]
}

const shadeOf = (s: StyleProfile) => s.shade && !['natural', 'heather'].includes(s.shade) ? s.shade : ''
const describe = (p: Product) => { const s = profileOf(p); return [shadeOf(s), s.noun].filter(Boolean).join(' ') }
const possessive = (brand: string) => brand.endsWith('s') ? `${brand}’` : `${brand}’s`

function pieceNote(piece: LookPiece, hero: LookPiece, d: Direction, seed: string): string {
  const s = profileOf(piece.product)
  const trend = s.trends.find(t => d.trends.includes(t)) || (piece.role === 'The statement' ? s.trends[0] : undefined)
  const heroShade = shadeOf(profileOf(hero.product)) || 'statement piece'
  if (piece.role === 'The statement') {
    if (s.family && d.accents.includes(s.family)) return `The ${shadeOf(s) || 'colour'} is the point of the look. ${trend ? trendNote(trend) : 'Everything else steps back for it.'}`
    return trend ? trendNote(trend)! : 'The piece the outfit is built around; everything else is chosen to agree with it.'
  }
  if (trend && hash(seed + piece.product.id) % 2 === 0) return trendNote(trend)!
  if (piece.role === 'The shoe') return pick(['Walkable all day, sharp enough for the evening.', 'A shoe with intent: it finishes the line of the trouser.', 'Keeps the look grounded and the pace easy.'], seed + piece.product.id)
  if (piece.role === 'The finish') return pick(['The detail people notice second, and remember first.', 'Small, deliberate, and in the palette.', 'Finishes the look without adding noise.'], seed + piece.product.id)
  if (piece.role === 'The layer') return pick(['Wear it open, or over the shoulders once the sun goes.', 'The layer that makes the outfit look considered rather than packed.', 'Adds structure without adding colour.'], seed + piece.product.id)
  return pick([`Quiet on purpose, so the ${heroShade} can do the talking.`, 'A clean base in the palette; it will work with everything else in the case.', `Keeps the proportion right under the ${hero.kind === 'coat' ? 'coat' : profileOf(hero.product).noun}.`], seed + piece.product.id)
}

const list = (xs: string[]) => xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}` : xs[0] || ''
const the = (p: Product) => `the ${describe(p)}`

// The look's note reads like a stylist talking you through it: the statement first, then what goes with it and why.
function lookNote(look: { id: string; pieces: LookPiece[] }, seed: string): string {
  const [hero, ...rest] = look.pieces
  const h = `${possessive(hero.product.brand)} ${describe(hero.product)}`
  const open = look.id === 'evening'
    ? pick([`Tonight is about ${h}.`, `Dinner starts with ${h}.`, `${h[0].toUpperCase()}${h.slice(1)} does the dressing up for you.`], seed)
    : look.id === 'water' ? pick([`By the water, ${h} is all the statement you need.`, `Start with ${h}; everything else is for the walk back.`], seed)
    : look.id === 'active' ? pick([`On the move, ${h} is the piece that earns its place.`, `Built around ${h}: technical, but never gym kit.`], seed)
    : pick([`Build the day around ${h}.`, `Everything here answers to ${h}.`, `${h[0].toUpperCase()}${h.slice(1)} is the reason this outfit works.`], seed)
  const layer = rest.find(p => p.role === 'The layer')
  const bases = rest.filter(p => p.role === 'The base').map(p => the(p.product))
  const shoe = rest.find(p => p.role === 'The shoe')
  const finish = rest.filter(p => p.role === 'The finish').map(p => the(p.product))
  const lines = [open]
  if (bases.length) lines.push(isOuter(hero.kind) ? `Underneath, ${list(bases)}.` : `Wear it with ${list(bases)}.`)
  if (layer) lines.push(look.id === 'evening' ? `Put ${the(layer.product)} over your shoulders, not your arms.` : `Throw ${the(layer.product)} over the top.`)
  if (shoe) {
    const plural = /s$/.test(profileOf(shoe.product).noun)
    lines.push(`${the(shoe.product)[0].toUpperCase()}${the(shoe.product).slice(1)} ${look.id === 'evening' ? (plural ? 'finish' : 'finishes') + ' the line' : (plural ? 'keep' : 'keeps') + ' you walking'}.`)
  }
  if (finish.length) lines.push(`Add ${list(finish)} and stop there.`)
  return lines.join(' ')
}

function buildLook(r: Recipe, d: Direction, pool: (k: PackingKind) => Product[], used: Set<string>, seed: string, climate: Climate): StyledLook | null {
  const brands = new Set<string>()
  const fabrics = new Map<string, number>()
  let accents = 0, pattern = false
  const take = (p: Product) => {
    const s = profileOf(p)
    if (s.family && d.accents.includes(s.family) && !(d.neutrals.includes(s.family))) accents++
    if (s.pattern) pattern = true
    for (const f of s.fabrics) if (!['knit', 'jersey', 'canvas'].includes(f)) fabrics.set(f, (fabrics.get(f) || 0) + 1)
    brands.add(p.brand); used.add(p.id)
  }
  const best = (kinds: PackingKind[], role: LookPiece['role'], hero: boolean) => {
    let top: { kind: PackingKind; product: Product; score: number } | null = null
    kinds.forEach((kind, i) => {
      for (const p of pool(kind)) {
        if (used.has(p.id)) continue
        const score = (hero ? -i * 1.2 : -i * 0.6) + pieceScore(p, { d, tier: r.tier, formality: r.formality, hero, accents, pattern, brands, fabrics, active: r.id === 'active', cold: climate === 'cold', hot: climate === 'hot', seed: seed + r.id })
        if (!top || score > top.score) top = { kind, product: p, score }
      }
    })
    return top as { kind: PackingKind; product: Product; score: number } | null
  }
  const heroPick = best(r.hero, 'The statement', true)
  if (!heroPick) return null
  const pieces: LookPiece[] = [{ kind: heroPick.kind, product: heroPick.product, role: 'The statement', note: '' }]
  take(heroPick.product)
  const covered = new Set<PackingKind>([heroPick.kind])
  const dress = heroPick.kind === 'dress'
  const has = (test: (k: PackingKind) => boolean) => pieces.some(p => test(p.kind))
  for (const slot of r.slots) {
    if (pieces.length >= 6) break
    const kinds = slot.kinds.filter(k => {
      if (covered.has(k)) return false
      if (slot.role === 'The base') return isBottom(k) ? !dress && !has(isBottom) : TOPS.includes(k) ? !dress && !has(k2 => TOPS.includes(k2)) : true
      if (slot.role === 'The layer') return !has(isOuter) && (isOuter(k) || has(k2 => TOPS.includes(k2)))
      if (slot.role === 'The shoe') return !has(isShoe)
      return true
    })
    if (!kinds.length) continue
    const found = best(kinds, slot.role, false)
    if (!found || found.score < -4) continue
    pieces.push({ kind: found.kind, product: found.product, role: slot.role, note: '' })
    take(found.product); covered.add(found.kind)
  }
  // Every outfit needs something on top, something below (or a dress) and shoes before it is shown.
  if (!dress && !(has(k => TOPS.includes(k)) || r.id === 'water')) return null
  if (pieces.length < 3) return null
  const order: LookPiece['role'][] = ['The statement', 'The layer', 'The base', 'The shoe', 'The finish']
  pieces.sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role))
  for (const p of pieces) p.note = pieceNote(p, pieces[0], d, seed)
  const look = { id: r.id, title: pick(r.titles, seed + r.id), occasion: r.occasion, tier: r.tier, pieces, note: '' }
  look.note = lookNote(look, seed + r.id)
  return look
}
const BOTTOMS: PackingKind[] = ['trousers', 'light-trousers', 'warm-trousers', 'jeans', 'shorts', 'skirt', 'active-bottoms']
const isBottom = (k: PackingKind) => BOTTOMS.includes(k)
const isOuter = (k: PackingKind) => ['coat', 'light-jacket', 'blazer', 'rain-shell'].includes(k)
const isShoe = (k: PackingKind) => ['walking-shoes', 'dress-shoes', 'boots', 'sandals', 'trail-shoes'].includes(k)

// Which directions suit this trip, best first: climate and wardrobe decide eligibility; style, destination,
// activity and how much of the palette the catalogue can actually dress decide the order.
export function rankDirections(products: Product[], trip: Trip, plan: PackingPlan, seed: string): Direction[] {
  const core = plan.needs.filter(n => !n.optional && ['Tops & dresses', 'Bottoms', 'Outerwear', 'Footwear'].includes(n.group))
  const byKind = new Map<PackingKind, Product[]>()
  for (const p of products) {
    if (!fitsWear(p, trip.wear) || !fitsClimate(p, plan.climate) || profileOf(p).novelty) continue
    const list = byKind.get(p.kinds[0]) || []
    list.push(p); byKind.set(p.kinds[0], list)
  }
  const relevant = plan.needs.flatMap(n => byKind.get(n.id) || [])
  const eligible = DIRECTIONS.filter(d => (d.climates.includes(plan.climate) || (plan.climate === 'unknown' && d.climates.includes('mild')))
    && (!d.wear || (trip.wear !== 'unisex' && d.wear.includes(trip.wear))))
  const scored = eligible.map(d => {
    const accentCount = relevant.filter(p => { const f = profileOf(p).family; return f && d.accents.includes(f) }).length
    const supported = core.filter(n => (byKind.get(n.id) || []).filter(p => directionFit(p, d) >= 2).length >= 2).length / Math.max(core.length, 1)
    let score = supported * 5 + Math.min(accentCount, 30) / 10 + jitter(seed + d.id) * 2.5
    if (trip.style && d.styles.includes(trip.style)) score += 4
    if (trip.style === 'statement' && d.id === 'grape-tomato') score += 2
    if (d.places?.test(trip.destination)) score += 3
    if (d.activities) score += trip.activity && d.activities.includes(trip.activity) ? 8 : -6
    if (accentCount < 4) score -= 6
    return { d, score }
  })
  return scored.sort((a, b) => b.score - a.score).map(x => x.d)
}

export function buildEdit(products: Product[], trip: Trip, plan: PackingPlan, seed: string, requested?: string): StyledEdit | null {
  const ranked = rankDirections(products, trip, plan, seed)
  const d = ranked.find(x => x.id === requested) || ranked[0]
  if (!d) return null
  const kinds = new Set(plan.needs.map(n => n.id))
  const byKind = new Map<PackingKind, Product[]>()
  for (const p of products) {
    const k = p.kinds[0]
    if (!kinds.has(k) || !fitsWear(p, trip.wear) || !fitsClimate(p, plan.climate)) continue
    const list = byKind.get(k) || []
    list.push(p); byKind.set(k, list)
  }
  const pool = (k: PackingKind) => byKind.get(k) || []
  const used = new Set<string>()
  const looks = recipes(trip, plan, k => kinds.has(k)).map(r => buildLook(r, d, pool, used, seed, plan.climate)).filter((l): l is StyledLook => !!l)
  return {
    id: d.id, name: d.name, line: d.line, rule: d.rule, swatches: d.swatches, looks,
    alternates: ranked.filter(x => x.id !== d.id).slice(0, 3).map(x => ({ id: x.id, name: x.name, line: x.line })),
  }
}
