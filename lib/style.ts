// How a stylist reads a product: its colour, fabric, pattern, formality and what it says about the season.
// Everything is read from the retailer's own product name, so a note on the site never claims more than the listing does.
import type { Product } from './catalogue-types'
import type { PackingKind } from './packing'

export type Family =
  | 'black' | 'charcoal' | 'grey' | 'white' | 'cream' | 'sand' | 'brown' | 'navy' | 'denim' | 'olive'
  | 'blue' | 'green' | 'yellow' | 'red' | 'burgundy' | 'pink' | 'purple' | 'orange' | 'metallic'

// Neutrals carry an outfit; the rest are accents. Brown, olive and denim behave as neutrals in a wardrobe.
export const NEUTRALS = new Set<Family>(['black', 'charcoal', 'grey', 'white', 'cream', 'sand', 'brown', 'navy', 'denim', 'olive'])

// Retailer colour words → colour family. Order matters only within a name: the most specific word wins.
const COLOUR_WORDS: [Family, string[]][] = [
  ['black', ['black', 'onyx', 'noir', 'jet', 'pitch', 'caviar', 'licorice', 'raven', 'black out', 'obsidian', 'jet black', 'true black']],
  ['charcoal', ['charcoal', 'graphite', 'anthracite', 'asphalt', 'iron', 'meteorite', 'granite', 'cinder', 'shadow', 'smoke', 'thunder', 'peppercorn', 'shale', 'carbon', 'lava', 'storm', 'pewter grey', 'dark grey', 'dark heather', 'black heather']],
  ['grey', ['grey', 'gray', 'heather', 'heather grey', 'ash', 'dove', 'fog', 'mist', 'cement', 'gravel', 'pebble', 'pavement', 'steel', 'cloud', 'melange', 'marl', 'wolf', 'mineral', 'titanium', 'haze', 'flint', 'silver grey', 'light grey', 'grey marl', 'graystone', 'greystone', 'heather gray']],
  ['white', ['white', 'optic', 'optic white', 'chalk', 'salt', 'snow', 'egret', 'whitecap', 'coconut', 'sea salt', 'paper', 'milk', 'blizzard', 'alabaster', 'pearl', 'swan', 'frost', 'bright white', 'off-white', 'off white']],
  ['cream', ['cream', 'ivory', 'ecru', 'bone', 'oat', 'oatmeal', 'natural', 'vanilla', 'parchment', 'seashell', 'birch', 'sugar', 'eggshell', 'porcelain', 'undyed', 'almond', 'champagne', 'butter cream', 'buttermilk', 'canvas']],
  ['sand', ['sand', 'beige', 'tan', 'camel', 'taupe', 'stone', 'khaki', 'dune', 'desert', 'biscuit', 'fawn', 'wheat', 'straw', 'sandstone', 'limestone', 'driftwood', 'mushroom', 'latte', 'cappuccino', 'nude', 'flax', 'clay', 'beachwood', 'putty', 'greige', 'oak']],
  ['brown', ['brown', 'chocolate', 'espresso', 'mocha', 'coffee', 'java', 'walnut', 'chestnut', 'cocoa', 'cacao', 'ganache', 'truffle', 'bark', 'cedar', 'timber', 'tobacco', 'umber', 'cinnamon', 'saddle', 'cognac', 'whiskey', 'mole', 'sepia', 'praline', 'nutmeg', 'toffee', 'caramel', 'hazel', 'hazelnut', 'cola', 'brownstone', 'sable', 'fudge', 'mink', 'tortoise', 'tortoiseshell', 'chicory', 'acorn', 'pecan', 'dark brown', 'pinecone', 'havana', 'dark roast', 'arabica', 'roast', 'leather brown', 'cognac brown']],
  ['navy', ['navy', 'midnight', 'marine', 'nightfall', 'eclipse', 'nocturnal', 'ink', 'dark navy', 'dark sapphire', 'deep navy', 'night sky']],
  ['denim', ['indigo', 'rinse', 'dark rinse', 'chambray', 'denim', 'mid wash', 'medium wash', 'light wash', 'dark wash', 'vintage wash', 'stonewash']],
  ['olive', ['olive', 'military', 'fatigue', 'surplus', 'army', 'drab', 'moss', 'loden', 'khaki green', 'dark olive']],
  ['blue', ['blue', 'sky', 'azure', 'cobalt', 'royal', 'ocean', 'sea', 'pacific', 'lake', 'harbour', 'harbor', 'bluebell', 'river', 'tide', 'aqua', 'turquoise', 'teal', 'powder blue', 'slate', 'riviera', 'cornflower', 'cerulean', 'lagoon', 'baby blue', 'ice blue', 'sapphire', 'periwinkle', 'blues']],
  ['green', ['green', 'forest', 'pine', 'sage', 'ivy', 'spruce', 'juniper', 'cypress', 'fern', 'kelp', 'seaweed', 'clover', 'emerald', 'evergreen', 'hunter', 'bottle green', 'jade', 'mint', 'celadon', 'pistachio', 'lime', 'chartreuse', 'agave', 'palm', 'meadow', 'thyme', 'basil', 'matcha', 'everglade', 'woodland', 'eucalyptus', 'kelly green', 'leaf']],
  ['yellow', ['yellow', 'butter', 'ochre', 'mustard', 'marigold', 'honey', 'sunshine', 'lemon', 'canary', 'saffron', 'maize', 'corn', 'golden', 'butter yellow', 'daffodil']],
  ['red', ['red', 'cherry', 'tomato', 'scarlet', 'crimson', 'poppy', 'ruby', 'maraschino', 'cranberry', 'brick', 'fire', 'flame', 'lipstick', 'rouge', 'cherry red', 'true red']],
  ['burgundy', ['burgundy', 'bordeaux', 'wine', 'cabernet', 'pinot', 'syrah', 'oxblood', 'maroon', 'merlot', 'garnet', 'beet', 'mulberry', 'claret', 'sangria', 'raisin', 'rosewood', 'black cherry', 'deep red', 'jam', 'cherry wine']],
  ['pink', ['pink', 'rose', 'blush', 'rosewater', 'candy', 'hibiscus', 'dusty rose', 'ballet', 'petal', 'flamingo', 'fuchsia', 'magenta', 'bubblegum', 'peony', 'dahlia', 'quartz', 'baby pink', 'salmon', 'shell pink']],
  ['purple', ['purple', 'plum', 'grape', 'eggplant', 'aubergine', 'lilac', 'lavender', 'violet', 'iris', 'orchid', 'amethyst', 'acai', 'fig', 'mauve', 'wisteria', 'ube']],
  ['orange', ['orange', 'rust', 'terracotta', 'coral', 'papaya', 'tangerine', 'burnt orange', 'ember', 'amber', 'copper', 'persimmon', 'apricot', 'peach', 'paprika', 'cider', 'pumpkin', 'sienna', 'tile', 'oxide', 'sedona', 'canyon', 'russet', 'marmalade', 'spice', 'rooibos']],
  ['metallic', ['gold', 'silver', 'metallic', 'chrome', 'bronze', 'pewter', 'gunmetal']],
]
const WORD_TO_FAMILY = new Map<string, Family>()
for (const [fam, words] of COLOUR_WORDS) for (const w of words) WORD_TO_FAMILY.set(w, fam)
const COLOUR_RE = new RegExp(`\\b(${[...WORD_TO_FAMILY.keys()].sort((a, b) => b.length - a.length).map(w => w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi')

const DEPTH: Partial<Record<Family, 'light' | 'mid' | 'dark'>> = {
  black: 'dark', charcoal: 'dark', navy: 'dark', brown: 'dark', burgundy: 'dark', olive: 'mid', grey: 'mid', denim: 'mid',
  white: 'light', cream: 'light', sand: 'light', yellow: 'light', pink: 'light',
}

const PATTERNS: [string, RegExp][] = [
  ['stripe', /\b(stripe[sd]?|striped|breton|pinstripe|ticking)\b/i],
  ['check', /\b(check(ed)?|plaid|gingham|tartan|houndstooth|herringbone|prince of wales|windowpane|buffalo)\b/i],
  ['floral', /\b(floral|flower|ditsy|botanical|bloom|rose print|daisy)\b/i],
  ['animal', /\b(leopard|zebra|snake|python|croc|cheetah|tiger|animal|cow print|bambi|fawn print)\b/i],
  ['dot', /\b(polka|dots?)\b/i],
  ['print', /\b(print(ed)?|paisley|jacquard|fair ?isle|argyle|tie[- ]?dye|camo|multi|graphic|logo|monogram|ikat|batik|geo)\b/i],
]

const FABRICS: [string, RegExp][] = [
  ['linen', /\blinen\b/i], ['silk', /\bsilk\b/i], ['satin', /\bsatin\b/i], ['cashmere', /\bcashmere\b/i],
  ['merino', /\bmerino\b/i], ['wool', /\b(wool|lambswool|boiled wool|felted)\b/i], ['alpaca', /\b(alpaca|mohair)\b/i],
  ['tweed', /\b(tweed|boucl[eé])\b/i], ['corduroy', /\b(corduroy|cord)\b/i], ['suede', /\bsuede\b/i],
  ['leather', /\b(leather|nappa)\b/i], ['shearling', /\b(shearling|sherpa|faux fur|teddy|fur)\b/i],
  ['denim', /\bdenim\b/i], ['crochet', /\b(crochet|macram[eé]|open[- ]knit|pointelle)\b/i], ['raffia', /\b(raffia|straw|woven palm|jute)\b/i],
  ['knit', /\b(knit|cable|rib(bed)?|waffle)\b/i], ['velvet', /\bvelvet\b/i], ['lace', /\blace\b/i], ['sequin', /\b(sequin|sparkle|shimmer)\b/i],
  ['poplin', /\b(poplin|oxford cloth|seersucker)\b/i], ['tech', /\b(nylon|ripstop|tech|performance|gore-?tex|softshell|polartec|fleece|dwr)\b/i],
  ['jersey', /\b(jersey|terry|french terry|fleece)\b/i], ['crepe', /\bcrepe\b/i], ['canvas', /\b(canvas|twill|drill)\b/i],
]

// What the season is about (FW26 runways and Resort 2027 forecasts), as signals a product name can carry.
export type Trend = { id: string; re: RegExp; note: string }
export const TRENDS: Trend[] = [
  { id: 'suede', re: /\bsuede\b/i, note: 'Suede is the texture of the season, and it reads expensive at any price.' },
  { id: 'barn', re: /\b(barn|chore|field|work(wear)?|utility|ranch|trucker) (jacket|coat|shirt)\b/i, note: 'A workwear jacket is the season’s easiest outer layer; wear it over tailoring as much as denim.' },
  { id: 'cable', re: /\b(cable|fair ?isle|fisherman|aran|chunky)\b/i, note: 'Textured, slightly vintage knits are the backbone of this fall’s runways.' },
  { id: 'zip-knit', re: /\b(quarter|half|1\/4|1\/2)[- ]?zip\b/i, note: 'The quarter-zip is back, worn over a collared shirt like a sweater vest’s cooler cousin.' },
  { id: 'vest', re: /\b(sweater vest|knit vest|vest|gilet|tank cardigan)\b/i, note: 'A knit vest over a shirt is one of the season’s defining layers.' },
  { id: 'cardigan', re: /\bcardigan\b/i, note: 'A fitted cardigan, buttoned and worn as a top, is how this season does polish.' },
  { id: 'rollneck', re: /\b(rollneck|roll neck|turtleneck|mock ?neck|funnel)\b/i, note: 'A high neck under everything is the season’s cleanest line.' },
  { id: 'check', re: /\b(check(ed)?|plaid|herringbone|houndstooth|tweed|prince of wales|tartan)\b/i, note: 'Checks open a print-heavy year; tonal and muted is the modern way in.' },
  { id: 'corduroy', re: /\b(corduroy|cord)\b/i, note: 'Corduroy is poet-core’s favourite fabric: soft, warm and a little academic.' },
  { id: 'fur', re: /\b(faux fur|shearling|sherpa|teddy)\b/i, note: 'Faux fur and shearling are everywhere this winter, on collars, coats and bags.' },
  { id: 'volume-leg', re: /\b(barrel|balloon|horseshoe|wide[- ]leg|curve|bow[- ]leg|baggy|pleated)\b/i, note: 'A curved, roomy leg is the shape of the moment in denim and trousers.' },
  { id: 'flat-shoe', re: /\b(ballet flats?|ballerinas?|mary janes?|loafers?|penny|low[- ]profile|derby|derbies)\b/i, note: 'Flatter shoes are the season’s rule: ballet flats, loafers and slim low-profile sneakers.' },
  { id: 'messenger', re: /\b(messenger|crossbody|bowling|east[- ]west|baguette|hobo|slouch)\b/i, note: 'Messenger and slouchy shoulder bags are the season’s carry, for everyone.' },
  { id: 'satin', re: /\b(satin|silk|charmeuse|slip dress|slip skirt)\b/i, note: 'Satin and silk bring evening shine into daytime.' },
  { id: 'velvet', re: /\b(velvet|lace|sheer|mesh|sequin)\b/i, note: 'Velvet, lace and sheer layers carry the season’s romantic, after-dark mood.' },
  { id: 'stripe', re: /\b(stripe[sd]?|striped|breton|rugby)\b/i, note: 'Bold stripes are a fall 2026 signature; one striped piece is all an outfit needs.' },
  { id: 'animal', re: /\b(leopard|zebra|cheetah|snake|python)\b/i, note: 'Animal print works as a neutral when everything around it is plain.' },
  { id: 'polo', re: /\b(polo|rugby)\b/i, note: 'The knitted polo is the most refined way to wear a collar this season.' },
  { id: 'trench', re: /\b(trench|mac|car coat|overcoat|topcoat|chesterfield)\b/i, note: 'A long, clean coat is the investment piece every runway agreed on.' },
  { id: 'tailoring', re: /\b(blazer|tailored|suit|pleat(ed)?|pinstripe|waistcoat)\b/i, note: 'Softer tailoring is back: one-button blazers and pleated trousers worn with knits, not ties.' },
  { id: 'linen', re: /\blinen\b/i, note: 'Linen is the resort fabric; let it crease, that’s the point.' },
  { id: 'crochet', re: /\b(crochet|macram[eé]|open[- ]knit|pointelle|raffia|straw)\b/i, note: 'Crochet and raffia are the handmade textures of Resort 2027.' },
  { id: 'fisherman', re: /\b(fisherman sandals?|huaraches?|espadrilles?|woven (sandals?|slides?|mules?|flats?))\b/i, note: 'A woven or fisherman sandal is the summer shoe with the most character.' },
  { id: 'poplin', re: /\b(poplin|oversized shirt|boyfriend shirt|seersucker)\b/i, note: 'Crisp poplin and seersucker look fresh even after a day of travel.' },
]

// Shades the season is wearing, for copy: FW26 (bottle green, ochre, scarlet, purple, eggplant, butter, baby pink, chocolate)
// and Resort 2027 (chartreuse, Riviera blue, burgundy, celadon, alabaster).
const SEASON_SHADES = /\b(chocolate|mocha|espresso|cherry|tomato|scarlet|burgundy|oxblood|bordeaux|cabernet|wine|grape|plum|eggplant|aubergine|purple|butter|ochre|bottle green|forest|olive|chartreuse|celadon|mint|riviera|cobalt|baby pink|ballet|alabaster|ecru|camel|rust|terracotta)\b/i

// Brands with a clear design point of view weigh more when choosing a look's statement piece.
const DESIGN_LED = new Set(['lemaire', 'burberry', 'staud', 'by far', 'rouje', 'frame', 'agolde', 'citizens of humanity', 'mother', 'cdlp', 'sunspel', 'cuyana', 'larroudé', 'margaux', 'canada goose', 'moose knuckles', 'mackage', 'rudsak', 'ralph lauren', 'krewe', 'le specs', 'faithfull the brand', 'lisa says gah', 'naadam', 'massimo dutti', 'aritzia', 'taylor stitch', 'asket', 'koio', 'onia', 'frankies bikinis', 'solid & striped', 'eberjey', 'lunya', 'banana republic', 'calvin klein', 'rains', 'zara', 'mango', 'cos', 'veja', 'blundstone', 'skims', 'alo', 'outerknown', 'faherty', 'quay', 'sunski', 'parker clay', 'dagne dover', 'kit and ace', 'mack weldon', 'reigning champ', 'herschel'])
const STRONG = new Set(['lemaire', 'burberry', 'staud', 'by far', 'rouje', 'frame', 'mother', 'cdlp', 'sunspel', 'larroudé', 'ralph lauren', 'krewe', 'agolde', 'citizens of humanity', 'canada goose', 'mackage', 'lisa says gah', 'faithfull the brand', 'naadam', 'toteme', 'cuyana', 'margaux'])

// Licensed characters, team merchandise and clearance language never make a styled look.
const NOVELTY = /\b(snoopy|peanuts|disney|marvel|star wars|ninja turtles|lego|pok[eé]mon|barbie|harry potter|hello kitty|sesame|looney|nfl|nba|nhl|mlb|bruins|blackhawks|canadiens|avalanche|maple leafs|yankees|lakers|team usa|halloween|christmas|holiday|ugly sweater|novelty|souvenir|gift|super bowl|world cup|olympic|initiative|charity|foundation|welcome to the party|shoe shapers?|shoe trees?|insoles?|wine tote|cooler|lunch bag|bandana)\b/i
// Gym and sofa clothes are packed, but never styled into a look outside an active day.
const LOUNGE = /\b(sweat ?pants?|sweatshirt|sweat ?shorts?|joggers?|lounge|pajamas?|pyjamas?|hoodie|track ?pants?|training|leggings?|sweats|onesie|fleece (wide[- ]leg )?(pants?|shorts?)|pointelle (shorts?|pants?)|practice jersey|mesh jersey|hockey|football jersey|soccer jersey|basketball)\b/i
const CLEARANCE = /\b(final sale|last call|sale|clearance|archive)\b/i

const KIND_FORMALITY: Partial<Record<PackingKind, number>> = {
  'active-top': 0, 'active-bottoms': 0, 'sports-bra': 0, swim: 0.5, sleepwear: 0, 'trail-shoes': 0.5, daypack: 0.5,
  tee: 1, shorts: 1, sandals: 1, 'sun-hat': 1, beanie: 1, jeans: 1.5, 'walking-shoes': 1, 'light-jacket': 1.5, 'long-sleeve-top': 1.5,
  'rain-shell': 1, knit: 2, 'warm-knit': 1.5, shirt: 2, 'linen-shirt': 1.5, trousers: 2, 'warm-trousers': 2, 'light-trousers': 1.5,
  skirt: 2, boots: 1.5, coat: 2.5, bag: 2, scarf: 2, 'light-scarf': 2, belt: 2, sunglasses: 2, gloves: 2, blazer: 3, 'dress-shoes': 3, dress: 2.5, umbrella: 1,
}

export type StyleProfile = {
  family: Family | null; shade: string | null; neutral: boolean; depth: 'light' | 'mid' | 'dark' | null
  pattern: string | null; fabrics: string[]; formality: number; trends: string[]; seasonShade: boolean
  novelty: boolean; clearance: boolean; lounge: boolean; prestige: number; noun: string
}

// The colour words usually follow the style name: "Silk Shirt — Cabernet", "Waffle Jogger - Basil".
function colourText(name: string): string {
  const em = name.split(' — ')
  if (em.length > 1) return em.slice(1).join(' ')
  const bar = name.split(' | ')
  if (bar.length > 1) return bar.slice(1).join(' ')
  const tail = name.match(/-([A-Z][A-Z ]+)(?:-[A-Z ]+)*$/)
  if (tail) return tail[0].replace(/-/g, ' ')
  const dash = name.split(' - ')
  return dash.length > 1 ? dash.slice(1).join(' ') : ''
}

const TEXTURE = new Set(['heather', 'melange', 'marl', 'heathered'])
function findColour(text: string): { family: Family; shade: string } | null {
  let best: { family: Family; shade: string; end: number } | null = null
  for (const m of text.matchAll(COLOUR_RE)) {
    const w = m[0].toLowerCase()
    const family = WORD_TO_FAMILY.get(w)
    if (!family) continue
    // The first colour is the main one ("Black/White" is black), but in a two-word shade the second word is the hue:
    // "Hunter Navy" is navy, "Heather Grey" is grey, "Washed Black" is black.
    const compound: boolean = !!best && /^\s+$/.test(text.slice(best.end, m.index))
    if (best && compound) {
      // Texture words describe the yarn, not the hue: "Brown Melange" stays brown.
      const texture = TEXTURE.has(w)
      best = { family: texture ? best.family : family, shade: best.shade === w ? w : `${best.shade} ${w}`, end: m.index! + m[0].length }
    } else if (!best) best = { family, shade: w, end: m.index! + m[0].length }
  }
  return best && { family: best.family, shade: best.shade }
}

// A short noun for copy, from the garment word in the name: "suede bomber", "pleated trousers".
const NOUNS = /\b(trench|parka|puffer|peacoat|overcoat|topcoat|car coat|coat|bomber|blazer|overshirt|shacket|chore jacket|barn jacket|field jacket|trucker jacket|denim jacket|jacket|anorak|shell|cardigan|quarter[- ]zip|half[- ]zip|vest|gilet|turtleneck|rollneck|mock neck|crewneck|crew|v-neck|sweater|jumper|knit|hoodie|polo|rugby|henley|button[- ]?(?:down|up)|oxford|shirt|blouse|tank|camisole|cami|bodysuit|tee|t-shirt|top|slip dress|shirtdress|dress|jumpsuit|romper|skirt|jeans|trousers|chinos?|pants?|shorts?(?![- ]sleeve)|joggers?|leggings|shorts|loafers?|mules?|ballet flats?|flats|mary janes?|slingbacks?|heels|pumps|derbies|derby|oxfords|sneakers?|trainers|boots?|chelsea boots?|sandals?|slides|espadrilles|tote|crossbody|shoulder bag|bag|clutch|pouch|messenger|backpack|beanie|cap|hat|bucket hat|scarf|wrap|belt|sunglasses|bikini|swimsuit|one-piece|trunks?|board shorts|sarong|kaftan|caftan)\b/gi
const KIND_NOUN: Partial<Record<PackingKind, string>> = {
  tee: 'tee', 'long-sleeve-top': 'long-sleeve top', shirt: 'shirt', 'linen-shirt': 'linen shirt', knit: 'knit', 'warm-knit': 'sweater',
  dress: 'dress', trousers: 'trousers', 'light-trousers': 'trousers', 'warm-trousers': 'trousers', jeans: 'jeans', shorts: 'shorts', skirt: 'skirt',
  'light-jacket': 'jacket', blazer: 'blazer', coat: 'coat', 'rain-shell': 'rain jacket', 'walking-shoes': 'sneakers', 'dress-shoes': 'shoes',
  boots: 'boots', sandals: 'sandals', 'trail-shoes': 'trail shoes', bag: 'bag', daypack: 'daypack', sunglasses: 'sunglasses', 'sun-hat': 'hat',
  beanie: 'beanie', gloves: 'gloves', scarf: 'scarf', 'light-scarf': 'scarf', belt: 'belt', umbrella: 'umbrella', swim: 'swimsuit',
  'active-top': 'top', 'active-bottoms': 'leggings', 'sports-bra': 'sports bra',
}

const cache = new Map<string, StyleProfile>()
export function profileOf(p: Product): StyleProfile {
  const hit = cache.get(p.id)
  if (hit) return hit
  const kind = p.kinds[0]
  const name = p.name
  const ctext = colourText(name)
  const style = ctext ? name.slice(0, name.length - ctext.length).replace(/\s*(—|\||-)\s*$/, '').trim() || name : name
  // Without a colour segment, the style name is read too, but never for metals ("Gold Series" is a range, not a colour).
  const fromStyle = findColour(style)
  const colour = findColour(ctext) || (fromStyle?.family === 'metallic' ? null : fromStyle)
  const family = colour?.family ?? (/\bdenim\b|\bjeans?\b/i.test(style) ? 'denim' : null)
  const pattern = PATTERNS.find(([, re]) => re.test(name))?.[0] ?? null
  const fabrics = FABRICS.filter(([, re]) => re.test(style)).map(([f]) => f)
  const trends = TRENDS.filter(t => t.re.test(style)).map(t => t.id)
  let formality = KIND_FORMALITY[kind] ?? 1.5
  if (/\b(satin|silk|tailored|pleat(ed)?|cashmere|heel|slingback|loafer|crepe|tuxedo|velvet|wool trouser|leather)\b/i.test(style)) formality += 0.75
  if (/\b(graphic|logo|sweat|jogger|hoodie|cargo|camo|athletic|track|gym|lounge|fleece)\b/i.test(style)) formality -= 0.75
  const nouns = [...style.matchAll(NOUNS)].map(m => m[0].toLowerCase())
  const raw = nouns.at(-1)
  const garment = (raw === 'short' ? 'shorts' : raw === 'rugby' ? 'rugby shirt' : raw) || KIND_NOUN[kind] || 'piece'
  const material = fabrics.find(f => ['suede', 'leather', 'linen', 'silk', 'satin', 'cashmere', 'corduroy', 'velvet', 'shearling', 'crochet', 'raffia', 'tweed', 'merino', 'wool', 'denim'].includes(f))
  const noun = material && !garment.includes(material) && !(material === 'denim' && garment === 'jeans') && !colour?.shade.includes(material) ? `${material === 'shearling' && /faux fur/i.test(style) ? 'faux-fur' : material} ${garment}` : garment
  const b = p.brand.toLowerCase()
  const profile: StyleProfile = {
    family, shade: colour?.shade ?? null, neutral: family ? NEUTRALS.has(family) : false, depth: family ? DEPTH[family] ?? 'mid' : null,
    pattern, fabrics, formality, trends, seasonShade: SEASON_SHADES.test(ctext || style),
    novelty: NOVELTY.test(name), clearance: CLEARANCE.test(name), lounge: LOUNGE.test(style), prestige: STRONG.has(b) ? 2 : DESIGN_LED.has(b) ? 1 : 0, noun,
  }
  cache.set(p.id, profile)
  return profile
}

export const trendNote = (id: string) => TRENDS.find(t => t.id === id)?.note
