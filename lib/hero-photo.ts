// Picks the destination hero photo. A single "city + street architecture" search often returned
// a shopfront, a restaurant or a tired facade, so we now search several scenic angles, pool the
// results and score each photo: popular, clearly of the place, scenic, and free of the subjects
// that make a hero look random (food, interiors, signage, cars, close-up people).

export type HeroPhoto = {
  id: string; url: string; thumb: string; color: string; alt: string; width: number; height: number; likes: number
  credit: { name: string; link: string }
}

export type UnsplashResult = {
  id: string; width: number; height: number; likes?: number; color?: string
  alt_description?: string | null; description?: string | null
  tags?: { title?: string }[]
  urls: { raw?: string; full?: string; regular: string; small: string }
  user: { name: string }; links: { html: string }
}

// Places where the water is the postcard. Everything else leads with skyline and landmarks.
const SEASIDE = new Set([
  'bali', 'amalfi-coast', 'santorini', 'tulum', 'maldives', 'mykonos', 'positano', 'capri', 'ibiza', 'phuket', 'cancun',
  'riviera-maya', 'hawaii', 'maui', 'fiji', 'bora-bora', 'koh-samui', 'seychelles', 'zanzibar', 'cinque-terre', 'french-riviera',
  'nice', 'monaco', 'dubrovnik', 'hvar', 'kotor', 'mallorca', 'menorca', 'algarve', 'costa-rica', 'cartagena', 'palawan', 'boracay',
  'lombok', 'raja-ampat', 'ha-long-bay', 'langkawi', 'goa', 'miami', 'san-juan', 'rio-de-janeiro', 'sydney', 'valletta',
])
const NATURE = new Set(['petra', 'cappadocia', 'masai-mara', 'patagonia', 'queenstown', 'reykjavik', 'luang-prabang', 'cusco'])

export const slugOf = (name: string) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

export function heroQueries(name: string, country = ''): string[] {
  const slug = slugOf(name)
  const place = country && !name.toLowerCase().includes(country.toLowerCase()) ? `${name} ${country}` : name
  if (SEASIDE.has(slug)) return [`${name} beach`, `${name} coast aerial`, `${place} travel`]
  if (NATURE.has(slug)) return [`${name} landscape`, `${name} sunrise`, `${place} travel`]
  return [`${name} skyline`, `${name} landmark`, `${place} cityscape`]
}

const SCENIC = /\b(beach|coast(line)?|ocean|sea|bay|lagoon|turquoise|island|cliffs?|harbou?r|skyline|aerial|drone|panorama|cityscape|sunset|sunrise|golden hour|dusk|landmark|cathedral|basilica|temple|palace|castle|tower|bridge|old town|rooftops?|view|mountains?|lake|river|canal|valley|landscape|nature)\b/gi
const UNWANTED = /\b(restaurant|cafe|café|coffee|bar|pub|food|dish|meal|plate|menu|cocktail|drink|beer|wine|kitchen|interior|indoors?|room|bedroom|bed|hotel room|lobby|office|store|shop(ping)?|mall|market stall|sign(age)?|billboard|neon|logo|text|car|cars|truck|traffic|parking|bus|taxi|construction|crane|scaffold|abandoned|dilapidated|derelict|graffiti|trash|garbage|laptop|phone|portrait|selfie|face|wedding)\b/gi
const PEOPLE = /\b(man|woman|girl|boy|person|people|couple|crowd|tourists?|dog|cat)\b/gi

const textOf = (p: UnsplashResult) => [p.alt_description, p.description, ...(p.tags || []).map(t => t.title)].filter(Boolean).join(' ').toLowerCase()
const count = (re: RegExp, s: string) => new Set((s.match(re) || []).map(m => m.toLowerCase())).size

export function scorePhoto(p: UnsplashResult, name: string): number {
  const text = textOf(p)
  const words = slugOf(name).split('-').filter(w => w.length > 2)
  const aboutPlace = words.length > 0 && words.every(w => text.includes(w))
  const ratio = p.width / Math.max(1, p.height)
  let score = Math.log10((p.likes || 0) + 1) * 2          // crowd-tested photos rise
  score += aboutPlace ? 3 : 0                               // clearly of the destination
  score += Math.min(count(SCENIC, text), 3) * 1.5           // scenic subject matter
  score -= count(UNWANTED, text) * 4                        // the "random building or restaurant" problem
  score -= count(PEOPLE, text) * 1.5                        // a figure is fine on a beach; a close-up is not a hero
  score += ratio >= 1.3 ? 1 : ratio < 1 ? -2 : 0            // wide frames survive cropping into a banner
  score += p.width >= 4000 ? 0.5 : p.width < 2400 ? -1.5 : 0
  return score
}

// A storefront or a plate of food is never the hero, unless the frame is plainly a wide scenic view.
export const isOffSubject = (p: UnsplashResult) => { const t = textOf(p); return count(UNWANTED, t) > 0 && count(SCENIC, t) < 2 }

export function pickHero(results: UnsplashResult[], name: string): HeroPhoto[] {
  const seen = new Set<string>()
  return results
    .filter(p => !seen.has(p.id) && seen.add(p.id))
    .filter(p => !isOffSubject(p))
    .map(p => ({ p, s: scorePhoto(p, name) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map(({ p }) => {
      const base = p.urls.raw || p.urls.regular
      const sized = (w: number) => base.includes('?') ? `${base}&w=${w}&q=80&fit=crop&auto=format` : base
      return {
        id: p.id, url: p.urls.raw ? sized(2400) : p.urls.regular, thumb: p.urls.small, color: p.color || '#14213D',
        alt: p.alt_description || `${name}`, width: p.width, height: p.height, likes: p.likes || 0,
        credit: { name: p.user.name, link: p.links.html },
      }
    })
}
