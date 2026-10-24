// Decides which packing-list piece a product is, from what the product actually is.
//
// The garment is found first: the last garment word in the main part of the title, ignoring colours,
// fabric names and anything after " - ", " | " or " with " ("Waffle Knit Jogger" is a jogger, "Trucker Hat"
// is a hat, "Dress with Tiered Skirt" is a dress). Modifier words only refine the piece inside that garment
// family ("Linen Shirt" → linen shirt, "Swim Short" → swimwear), so a fabric, colour or style word can never
// move a product into an unrelated category. When the title has no garment word, or only an ambiguous one,
// the retailer's own product type decides; failing that, a short list of single-category specialist brands.
// Anything still unclear is rejected rather than guessed.

const KIDS = /\b(kids?|girls?|boys?|baby|babies|toddler|infant|youth|junior|teen|little kids|big kids|newborn|grade school|preschool)\b/i
const NOT_APPAREL = /gift ?card|(frame|soft|hard|glasses|eyewear|sunglass(es)?) (case|pouch)|(glasses|eyewear|sunglass(es)?) (cord|chain|strap)|wristlet|e-?gift|gift pack|corp(orate)? |\(\d+ units?\)|\bsample\b|warranty|insurance|shipping protection|route package|donation|candle|\bmug\b|poster|sticker|keychain|key ?ring|\bcharm\b|iron-on patch|\bpatches\b|enamel pin|lapel pin|face mask|\bdog\b|\bpet\b|\bcat\b|blanket|pillow|towel|bedding|sheet set|duvet|cleaner|care kit|cleaning|repair kit|replacement|spare lens|\blaces\b|insole|\bfootbeds\b|deodor|lotion|perfume|fragrance|lipstick|makeup|card ?holder|card ?case|wallet|clamp|sensor|\btracker\b|hanger|garment bag|(two|three)-piece suit|tuxedo|\bsuit set\b|headband|scrunchie|hair ?clip|earring|necklace|bracelet|jewel|smartwatch|watch band|earmuff|balaclava|briefcase|slipper|\bski bib\b|\bbib\b|snow pant|ski pant|cover-?up|duffel bag|duffle bag|\bduffel\b(?!\s+coat)|weekender bag|suitcase|luggage|carry-?on|toiletry|dopp|cosmetic|laundry|shoe bag|dust bag|gift bag|storage bag|reusable bag|packing cube|organi[sz]er|bag strap|lens cloth|glasses case|sunglass(es)? case|umbrella stand|swim cap|bottle/i
// Multipacks and bundles only make sense for underwear and socks; elsewhere they distort the price.
const PACK = /\b\d+[- ]?(pack|pk)\b|\bpack of \d|\bbundle\b|\bset of\b|gift set|\bduo\b|\btrio\b|\b\d+ ?[×x] /i
const PACK_OK = new Set(['underwear', 'socks'])

// Context tests. They are only applied inside the garment family the title already established.
const has = (re, s) => re.test(s)
const SWIM = /\b(swim\w*|bikini|board ?shorts?|boardshorts?|rash ?guards?|tankini|bathing|surf (short|trunk)s?)\b/i
const SLEEP = /\b(sleep\w*|pj'?s?|pajamas?|pyjamas?|nightshirt|nightgown|nightie|loungewear|lounge (shorts?|pants?|joggers?|sets?))\b/i
const BASE = /\b(base ?layers?|baselayer|thermals?|heattech|long underwear|long johns?)\b/i
const BASE_WEIGHT = /\b(lightweight|midweight|heavyweight|microweight|expedition)\b/i
const WOOLLY = /\b(wool|merino)\b/i
const ACTIVE = /\b(training|running|run|workout|gym|yoga|sports?|athletic|performance|dri-?fit|aeroready|dry-?ex|active|tennis|cycling|compression|pilates|softmove|drymove|sculptmove|airism)\b/i
const ACTIVE_BOTTOM = /\b(track|bike|biker|hiking|trail|leggings?|tights)\b/i
const LINEN = /\b(linen|gauze|seersucker|ramie)\b/i
const LIGHT_LEG = /\b(linen|palazzo|culottes?|gauze|seersucker|ramie|parachute)\b/i
const WARM_LEG = /\b(wool|corduroy|cords|lined|flannel|fleece|sherpa|insulated|warm|thermal-lined|heattech|tweed)\b/i
const WARM_KNIT = /\b(cashmere|chunky|cable|wool|lambswool|fisherman|alpaca|mohair|shetland|sherpa|fleece|heavyweight|boucl[eé]|yak|camel hair|fair isle|turtleneck|hoodies?|hooded)\b/i
const RAIN = /\b(rain\w*|waterproof|gore-?tex|h2no|dryvent|omni-?tech|stormproof|storm ?shell|torrentshell|mac)\b|\bshell (jacket|parka|coat)\b|\b(hard ?shell)\b/i
const SOFTSHELL = /\bsoft ?shell\b/i
const COAT = /\b(parka|puffer|down|insulated|overcoat|winter|duffle|duffel|peacoat|pea coat|shearling|expedition|chilliwack|ballistic|padded|fur|bunny|primaloft|thermoball|nuptse|quilted coat|wool coat|car coat|cocoon|sherpa-lined|fleece-lined)\b/i
const HEELED = /\b(heel(ed)?s?|kitten|block|stiletto|platform)\b/i
const KNIT_HAT = /\b(knit|wool|cashmere|cable|winter|fleece|pom|ribbed|beanie|merino|alpaca|mohair|fur|shearling|sherpa|earflaps?|trapper|aviator)\b/i
const LIGHT_SCARF = /\b(silk|cotton|linen|modal|bandana|neckerchief|sarong|pareo|square|neck scarf|headscarf|lightweight|chiffon|voile|printed)\b/i
const SPORT_SHOE = /\b(basketball|skate|football|soccer|cleats?|golf|spikes?|weightlift\w*|boxing|wrestling|bowling|futsal|track spike)\b/i
const TRAIL = /\b(trail|hiking|hiker|approach|gore-?tex|terrex|speedcross|x ultra|moab|trek\w*)\b/i

// Garment words. `re` must match a whole word; order inside a family does not matter (the last word in the
// title wins, longer phrases win ties). `amb` marks words that also mean something else, so the product type
// is consulted before they are trusted.
const N = (fam, re, resolve, amb = false) => ({ fam, re: new RegExp(`\\b(?:${re})\\b`, 'gi'), resolve, amb })
const NOUNS = [
  // Bottoms
  N('bottom', 'pants?|trousers?|joggers?|chinos?|slacks|sweatpants?|track ?pants?|cargo pants?|cargos|culottes?|palazzos?|capris?|leggings?|tights|bottoms?', c => bottoms(c, 'pant')),
  N('bottom', 'shorts?|bermudas?|jorts?|shortie', c => bottoms(c, 'short')),
  N('bottom', 'skirts?|skorts?', c => has(SWIM, c.ctx) ? 'swim' : 'skirt'),
  N('bottom', 'jeans?', c => 'jeans'),
  // Tops
  N('top', 'shirts?|blouses?|pop-?overs?|button[- ]?(?:ups?|downs?)|oxfords?|camp shirts?', c => shirt(c)),
  N('top', 't-?shirts?|tees?|tanks?|tank tops?|camis?|camisoles?|polos?|bodysuits?|crop tops?|crops?|tube tops?|tops?|singlets?|tunics?', c => tee(c)),
  N('top', 'henleys?|rugbys?|longsleeves?|long sleeves?', c => longSleeve(c)),
  N('top', 'undershirts?', c => tee(c)),
  N('top', 'base ?layers?|baselayers?|base layer tops?', () => 'base-layer-top'),
  N('top', 'sweaters?|cardigans?|jumpers?|pullovers?|crewnecks?|turtlenecks?|mock ?necks?|v-?necks?|quarter[- ]zips?|half[- ]zips?|1\\/4 zips?|1\\/2 zips?|sweatshirts?|hoodies?|fleeces?|knits?|shrugs?|capes?|ponchos?|sweater vests?|cowl ?necks?|coatigans?', c => knit(c)),
  N('top', 'crews?', c => has(/\bsocks?\b/i, c.type) ? 'socks' : knit(c), true),
  N('top', 'hoods?', c => knit({ ...c, ctx: c.ctx + ' hoodie' }), true),
  N('top', 'body', c => tee(c), true),
  N('top', 'jerseys?', c => tee(c), true),
  N('top', 'flannels?', c => shirt({ ...c, ctx: c.ctx + ' flannel' }), true),
  // Outerwear
  N('outer', 'jackets?|coats?|parkas?|puffers?|overcoats?|peacoats?|anoraks?|bombers?|windbreakers?|raincoats?|blousons?|trenches|trench coats?|trench|macs?|overshirts?|shackets?|shirt jackets?|ski jackets?', c => outer(c)),
  N('outer', 'blazers?|sport coats?|suit jackets?|tailored jackets?', () => 'blazer'),
  N('outer', 'vests?|gilets?', c => has(/\b(sweater|knit)\b/i, c.ctx) ? 'knit' : null),
  N('outer', 'truckers?', c => 'light-jacket', true),
  // Dresses
  N('dress', 'dress|dresses|sundress|shirtdress|gowns?|kaftans?|caftans?|jumpsuits?|rompers?|playsuits?|boiler ?suits?', c => has(SWIM, c.title) ? 'swim' : has(SLEEP, c.ctx) || SLEEP_BRANDS.has(c.brand) && /\b(slip|night|shirt ?dress)\b/i.test(c.ctx) ? 'sleepwear' : 'dress'),
  // Footwear
  N('foot', 'sneakers?|trainers?|running shoes?|shoes?|slip-?ons?|runners?|walking shoes?|high[- ]tops?|low[- ]tops?|mid[- ]tops?', c => shoes(c)),
  N('foot', 'boots?|booties|chelsea boots?|wellies', c => has(TRAIL, c.ctx) ? 'trail-shoes' : 'boots'),
  N('foot', 'hikers?|trail runners?', () => 'trail-shoes'),
  N('foot', 'sandals?|slides?|flip[- ]?flops?|thong sandals?|espadrilles?|jellies', () => 'sandals'),
  N('foot', 'mules?|clogs?', c => has(HEELED, c.ctx) ? 'dress-shoes' : 'sandals'),
  N('foot', 'loafers?|flats?|ballet flats?|ballerinas?|heels|pumps?|slingbacks?|mary janes?|derbys?|derbies|brogues?|oxford shoes?|moccasins?|boat shoes?|dress shoes?|stilettos?|kitten heels?', () => 'dress-shoes'),
  // Underwear, socks, swim
  N('under', 'bras?|bralettes?|sports bras?|bra tops?', c => has(SWIM, c.ctx) ? 'swim' : has(/\b(sports?|running|active|high[- ]impact|medium[- ]impact|low[- ]impact|support|workout|training|yoga)\b/i, c.ctx) ? 'sports-bra' : 'bra'),
  N('under', 'boxers?|boxer shorts?|boxer briefs?|briefs?|thongs?|panty|panties|underwear|hipsters?|cheeky|knickers?|boyshorts?|bikini briefs?|french cuts?|g-strings?', c => has(/\bswim\b/i, c.ctx) ? 'swim' : 'underwear'),
  N('under', 'trunks?', c => has(SWIM, c.ctx) || /swim|board/i.test(c.type) || /\d+(\.\d+)?\s*("|”|''|inch|in\b)/i.test(c.title) ? 'swim' : 'underwear', true),
  N('sock', 'socks?', () => 'socks'),
  N('sock', 'no-?shows?', () => 'socks', true),
  N('sock', 'quarters?', c => has(/\b(cushion|sock|merino|crew)\b/i, c.ctx + ' ' + c.type) ? 'socks' : null, true),
  N('swim', 'swimsuits?|swimwear|bikinis?|tankinis?|one[- ]?pieces?|monokinis?|swim trunks?|board ?shorts?|boardshorts?|rash ?guards?|swim shorts?|swim briefs?', () => 'swim'),
  N('sleep', 'robes?|pyjamas?|pajamas?|pjs|sleepshirts?|nightshirts?|nightgowns?|nighties?|sleep sets?|pj sets?', () => 'sleepwear'),
  // Bags
  N('bag', 'backpacks?|daypacks?|rucksacks?|kånken|kanken|day packs?', () => 'daypack'),
  N('bag', 'bags?|totes?|totebags?|crossbody|cross-body|crossbodies|slings?|pouch|pouches|clutch|clutches|belt bags?|fanny packs?|hip packs?|bum bags?|handbags?|messengers?|purses?|wristlets?|satchels?|shoulder bags?|bucket bags?', () => 'bag'),
  // Hats
  N('hat', 'hats?|caps?|ballcaps?|snapbacks?|visors?|fedoras?|panamas?|berets?|bucket hats?|dad hats?|trucker hats?|baseball caps?', c => /\b(ball ?cap|snapback|baseball|trucker|dad hat|visor|bucket|fedora|panama|straw|sun hat)\b/i.test(c.seg) ? 'sun-hat' : has(KNIT_HAT, c.seg) ? 'beanie' : 'sun-hat'),
  N('hat', 'beanies?|toques?|tuques?|bonnets?|knit hats?|winter hats?|watch caps?', () => 'beanie'),
  N('hat', 'buckets?', () => 'sun-hat', true),
  // Words that mostly appear in retailer product types ("Outerwear", "Footwear", "Denim").
  N('outer', 'outerwear', c => outer(c), true),
  N('foot', 'footwear', c => shoes(c), true),
  N('top', 'knitwear', c => knit(c), true),
  N('sleep', 'sleepwear|loungewear|nightwear', () => 'sleepwear', true),
  N('bottom', 'denim', () => 'jeans', true),
  // Accessories
  N('acc', 'sunglasses|sunnies|shades|aviators?|wayfarers?|slingshots', () => 'sunglasses'),
  N('acc', 'umbrellas?', () => 'umbrella'),
  N('acc', 'gloves?|mittens?|mitts?', c => has(/\b(golf|baseball|boxing|garden|batting|goalie)\b/i, c.ctx) ? null : 'gloves'),
  N('acc', 'scarf|scarves|mufflers?|neck warmers?|snoods?|neck gaiters?|wraps?|stoles?|shawls?', c => has(LIGHT_SCARF, c.ctx) ? 'light-scarf' : 'scarf'),
  N('acc', 'bandanas?|neckerchiefs?|sarongs?|pareos?|headscarf|headscarves', () => 'light-scarf'),
  N('acc', 'belts?', () => 'belt'),
]

function bottoms(c, noun) {
  const t = c.ctx
  if (has(SWIM, t)) return 'swim'
  if (has(SLEEP, t)) return 'sleepwear'
  if (has(BASE, t) || (has(BASE_WEIGHT, t) && has(WOOLLY, t) && /\b(leggings?|tights|bottoms?)\b/i.test(t))) return 'base-layer-bottoms'
  if (/\bbottoms?\b/i.test(c.word)) return null // "bottoms" on its own is a set piece we cannot place
  if (noun === 'short') return has(ACTIVE, t) || /\b(bike|biker|running|track)\b/i.test(t) ? 'active-bottoms' : 'shorts'
  if (/\b(leggings?|tights)\b/i.test(c.word) || has(ACTIVE, t) || /\btrack ?pants?\b/i.test(c.word)) return 'active-bottoms'
  if (/\b(hiking|trail)\b/i.test(t)) return 'active-bottoms'
  if (/\b(rain|snow|ski|shell|waterproof)\b/i.test(t)) return null
  if (/\b(jeans?|denim)\b/i.test(t) && !/\bchambray\b/i.test(t)) return 'jeans'
  if (has(WARM_LEG, t)) return 'warm-trousers'
  if (has(LIGHT_LEG, t)) return 'light-trousers'
  return 'trousers'
}
function shirt(c) {
  const t = c.ctx
  if (has(SLEEP, t)) return 'sleepwear'
  if (has(SWIM, t)) return 'swim'
  if (has(BASE, t)) return 'base-layer-top'
  if (/\bpolo\b/i.test(t) && !/\b(button|oxford)\b/i.test(t)) return tee(c)
  if (has(ACTIVE, t) && /\b(training|running|workout|gym|dri-?fit|aeroready|dry-?ex|athletic)\b/i.test(t)) return 'active-top'
  if (has(LINEN, t)) return 'linen-shirt'
  return 'shirt'
}
function tee(c) {
  const t = c.ctx
  if (/\bsinglets?\b/i.test(c.word)) return 'active-top'
  if (has(SWIM, t)) return 'swim'
  if (has(SLEEP, t)) return 'sleepwear'
  if (has(BASE, t)) return 'base-layer-top'
  if (has(ACTIVE, t)) return 'active-top'
  // A sweater tank, polo or top is knitwear in a tee's shape.
  if (/\bsweater\b/i.test(c.seg)) return has(WARM_KNIT, t) ? 'warm-knit' : 'knit'
  if (c.long) return has(BASE_WEIGHT, t) && has(WOOLLY, t) ? 'base-layer-top' : 'long-sleeve-top'
  return 'tee'
}
function longSleeve(c) {
  const t = c.ctx
  if (has(SLEEP, t)) return 'sleepwear'
  if (has(BASE, t) || (has(BASE_WEIGHT, t) && has(WOOLLY, t))) return 'base-layer-top'
  if (has(ACTIVE, t)) return 'active-top'
  if (/\bhenley\b/i.test(c.word) && c.short) return 'tee'
  return 'long-sleeve-top'
}
function knit(c) {
  const t = c.ctx
  if (/\bponchos?\b/i.test(c.word) && has(RAIN, t)) return 'rain-shell'
  if (has(SLEEP, t)) return 'sleepwear'
  if (has(BASE, t)) return 'base-layer-top'
  // Fine merino is a light knit; "merino wool" alone should not make it a heavy winter sweater.
  return has(WARM_KNIT, t.replace(/\bmerino wool\b/gi, 'merino').replace(/\bmerino\b/gi, '')) ? 'warm-knit' : 'knit'
}
function outer(c) {
  const t = c.ctx
  if (/\b(blazer|sport coat|suit jacket|tailored jacket)\b/i.test(t)) return 'blazer'
  const insulated = /\b(puffer|insulated|padded|quilted|down)\b/i.test(t)
  if (c.brand === 'rains') return insulated ? 'coat' : 'rain-shell'
  if (has(RAIN, t) && !has(SOFTSHELL, t)) return 'rain-shell'
  // Expedition-wear brands: their jackets are winter coats unless clearly something lighter.
  if (['canada goose', 'moose knuckles'].includes(c.brand) && !/\b(windbreaker|fleece|lightweight|shirt|bomber|cardigan|knit)\b/i.test(t)) return 'coat'
  if (/\b(parkas?|puffers?|overcoats?|peacoats?)\b/i.test(c.word) || has(COAT, t)) return 'coat'
  if (/\bcoats?\b/i.test(c.word) && !/\b(trench|shirt coat|rain|lab)\b/i.test(t)) return 'coat'
  return 'light-jacket'
}
function shoes(c) {
  const t = c.ctx
  if (has(SPORT_SHOE, t)) return null
  if (has(TRAIL, t)) return 'trail-shoes'
  if (/\b(loafer|derby|brogue|oxford shoe|boat shoe|dress shoe|heel|pump)\b/i.test(t)) return 'dress-shoes'
  return 'walking-shoes'
}

// Brands that only sell one thing, for titles that are just a model name ("Air Heart", "Metro"). Strict
// specialists also settle ambiguous words ("Max Cushion Quarter" from a sock brand is a sock).
const STRICT = {
  sunglasses: ['quay', 'knockaround', 'krewe', 'sunski', 'le specs', 'ray-ban', 'oakley', 'warby parker', 'goodr'],
  umbrella: ['blunt', 'shedrain', 'repel', 'senz'],
  socks: ['darn tough', 'feetures', 'stance', 'bombas'],
  boots: ['blundstone'],
}
const LOOSE = {
  underwear: ['saxx', 'mack weldon', 'cdlp', 'knix'],
  'walking-shoes': ['allbirds', 'veja', 'on', 'hoka'],
}
const of = m => Object.fromEntries(Object.entries(m).flatMap(([k, bs]) => bs.map(b => [b, k])))
const STRICT_OF = of(STRICT), LOOSE_OF = of(LOOSE)
// Brands that only make shoes and bags (or only umbrellas): a clothing word in their titles is a colour or a
// model name ("Sophia Dress Blue Denim" is a sandal), so the product type has to confirm the category.
// Single-product brands whose model names borrow clothing words. For brands marked `models`, such a word is a
// model name ("Mary Janes" and "Trail Blazers" are Knockaround sunglasses); for the others the product is dropped.
const BRAND_FAMILIES = {
  knockaround: { fams: ['acc'], models: true }, quay: { fams: ['acc'], models: true }, goodr: { fams: ['acc'], models: true },
  blundstone: { fams: ['foot'], models: true }, blunt: { fams: ['acc'], models: false },
}
const SLEEP_BRANDS = new Set(['lunya', 'eberjey'])
const KIND_FAMILY = {
  'sports-bra': 'under', bra: 'under', underwear: 'under', socks: 'sock', swim: 'swim', sleepwear: 'sleep',
  'base-layer-top': 'top', 'base-layer-bottoms': 'bottom', 'rain-shell': 'outer', coat: 'outer', blazer: 'outer', 'light-jacket': 'outer',
  dress: 'dress', 'active-top': 'top', 'active-bottoms': 'bottom', 'linen-shirt': 'top', shirt: 'top', 'warm-knit': 'top', knit: 'top',
  'long-sleeve-top': 'top', tee: 'top', jeans: 'bottom', shorts: 'bottom', skirt: 'bottom', 'light-trousers': 'bottom', 'warm-trousers': 'bottom',
  trousers: 'bottom', 'trail-shoes': 'foot', boots: 'foot', sandals: 'foot', 'dress-shoes': 'foot', 'walking-shoes': 'foot',
  daypack: 'bag', bag: 'bag', sunglasses: 'acc', umbrella: 'acc', 'sun-hat': 'hat', beanie: 'hat', gloves: 'acc', scarf: 'acc', 'light-scarf': 'acc', belt: 'acc',
}
export const kindFamily = k => KIND_FAMILY[k]

// Fabric named after the colour or after " in " still describes the garment ("Straight Leg (Corduroy)").
const MATERIAL = /\b(linen|wool|cashmere|merino|denim|silk|cotton|corduroy|cord|fleece|alpaca|mohair|seersucker|gauze|tweed|flannel|sherpa|ramie)\b/i

const SLEEVE = /\b(short|long|cap|3\/4|three[- ]quarter|half|elbow|puff|flutter|bell|balloon|raglan|ss|ls)[- ]?sleeve[sd]?\b/gi

// The part of the title that names the product, without colour or fabric suffixes.
function segments(title) {
  return title.replace(/\s+(?:with|w\/)\s+.*$/i, '')
    .split(/\s+(?:-|–|—|--|\||\/\/)\s+|\s+in\s+(?=\S)|\s*\(|\)\s*/i)
    .map(s => s.trim()).filter(Boolean)
}

function headNoun(text) {
  const long = /\b(long|3\/4|three[- ]quarter|ls)[- ]?sleeve/i.test(text)
  const short = /\b(short|cap|half|ss)[- ]?sleeve/i.test(text)
  const stripped = text.replace(SLEEVE, ' ')
  let best = null
  for (const n of NOUNS) for (const m of stripped.matchAll(n.re)) {
    const end = m.index + m[0].length
    const better = !best || (best.n.amb && !n.amb) || (best.n.amb === n.amb && (end > best.end || (end === best.end && m[0].length > best.word.length)))
    if (better) best = { n, word: m[0], end }
  }
  // "Midweight Wool Long Sleeve": the sleeve phrase is the garment.
  if (!best && long) best = { n: NOUNS.find(n => n.re.source.includes('henleys')), word: 'long sleeve', end: 0 }
  return best && { ...best, long, short }
}

// Returns a kind id, or null when the product should not be listed.
export function classify(title, type = '', brand = '') {
  const b = String(brand).toLowerCase()
  if (KIDS.test(`${title} ${type}`)) return null
  const segs = segments(title)
  const typeHead = type ? headNoun(type) : null
  // The garment is named in the first segment; if it is not, the product type comes before later segments,
  // which are usually colours ("Explorer Base Layer - Duffel Bag" is not a bag).
  let at = segs.length && headNoun(segs[0]) ? 0 : -1
  // A later segment names the garment only after a one-word qualifier ("Midweight - Men's Wool Long Sleeve");
  // otherwise later segments are colours ("ʻAhi Kai - Seagreen / Trench Blue" is a shoe, not a trench coat).
  if (at < 0 && !typeHead && segs.length > 1 && (segs[0].split(/\s+/).length === 1 || BASE_WEIGHT.test(segs[0]))) at = segs.findIndex(s => headNoun(s))
  let head = at >= 0 ? headNoun(segs[at]) : null
  const naming = at >= 0 ? segs.slice(0, at + 1).join(' ') : (segs[0] || title)
  // Exclusions look at what the product is called, not its colour ("Pullover - Duffel Bag" is a pullover).
  if (NOT_APPAREL.test(naming) || /gift ?card|warranty|shipping protection|route package|donation/i.test(title)) return null
  // Two-piece sets fit one slot only when they are sleepwear.
  if (/\bsets?\b/i.test(naming) && !/\b(set of|setting)\b/i.test(naming)) {
    const sleep = has(SLEEP, `${title} ${type}`) || /\b(cami|shortie|robe)\b/i.test(naming) || SLEEP_BRANDS.has(b)
    return sleep && !PACK.test(title) ? 'sleepwear' : null
  }
  const limit = BRAND_FAMILIES[b]
  const allowed = limit?.fams
  if (head && allowed && !allowed.includes(head.n.fam)) { if (!limit.models) return null; head = null }
  if ((!head || (head.n.amb && typeHead && !typeHead.n.amb)) && typeHead) head = typeHead
  let kind = null
  if (head) {
    const tail = segs.slice(at + 1).filter(s => MATERIAL.test(s)).join(' ')
    const ctx = `${naming} ${tail} ${type}`
    kind = head.n.resolve({ ctx, title, seg: at >= 0 ? segs[at] : naming, type, word: head.word, long: head.long, short: head.short, brand: b })
    if (head.n.amb && !(typeHead && !typeHead.n.amb)) kind = STRICT_OF[b] || (!typeHead && LOOSE_OF[b]) || kind
  } else kind = STRICT_OF[b] || LOOSE_OF[b] || (/\blens\b/i.test(title) ? 'sunglasses' : null)
  if (kind && allowed && !allowed.includes(KIND_FAMILY[kind])) return null
  if (kind && b === 'minus33' && ['tee', 'long-sleeve-top', 'knit'].includes(kind) && !/\b(sweater|cardigan|hoodie|jacket)\b/i.test(title)) kind = 'base-layer-top'
  if (kind && b === 'minus33' && ['trousers', 'active-bottoms'].includes(kind)) kind = 'base-layer-bottoms'
  if (kind === 'sunglasses' && /\b(cases?|pouch|cords?|straps?|cleaning|cloth)\b/i.test(title)) return null
  if (!kind || (PACK.test(title) && !PACK_OK.has(kind))) return null
  return kind
}

// Exposed for the audit: the garment family a title names, so a stored kind can be cross-checked.
export function garmentFamily(title, type = '') {
  for (const s of segments(title)) { const h = headNoun(s); if (h) return h.n.fam }
  const t = type && headNoun(type)
  return t ? t.n.fam : null
}

export function excluded(title, kind) {
  return KIDS.test(title) || NOT_APPAREL.test(title) || (PACK.test(title) && !PACK_OK.has(kind)) || (/\b(\d-piece|sets?)\b/i.test(title) && !/\bset of\b/i.test(title) && kind !== 'sleepwear')
}
