// Pure selection logic, shared by the shop API and the tests. No catalogue data is imported here.
import kindsData from '../data/kinds.json'
import type { PackingKind, PackingPlan } from './packing'
import type { Trip, Wear } from './trip'
import { TIERS, TIER_LABEL, type Product, type Tier, type TierOptions } from './catalogue-types'

const FX = kindsData.fx as Record<string, number>
export const cad = (p: Product) => p.price * (FX[p.currency] || 1)

// A product nobody has confirmed recently is no longer shown. Feed products and swept seed brands are re-checked
// daily and carry a shorter maxAgeDays; everything else falls back to 30 days.
export const MAX_AGE_DAYS = 30
export function liveProducts(products: Product[], now = new Date()): Product[] {
  return products.filter(p => {
    const age = now.getTime() - Date.parse(p.checkedAt + 'T00:00:00Z')
    return age >= -86400000 && age < (p.maxAgeDays || MAX_AGE_DAYS) * 86400000
  })
}

// When a product turns out to be sold out at click time: the closest replacements for the same piece.
// Same piece and wardrobe, same price tier first, then the nearest price; at most two per brand so the shopper
// sees a real choice. The order is purely rule-based, so no label is favoured.
export function alternativesFor(product: Product, products: Product[], limit = 6): Product[] {
  const kind = product.kinds[0]
  const price = cad(product)
  const fits = (p: Product) => product.gender === 'unisex' || p.gender === product.gender || p.gender === 'unisex'
  const ranked = products
    .filter(p => p.id !== product.id && p.kinds[0] === kind && fits(p) && p.productUrl !== product.productUrl)
    .sort((a, b) => Number(b.tier === product.tier) - Number(a.tier === product.tier) || Math.abs(cad(a) - price) - Math.abs(cad(b) - price) || a.id.localeCompare(b.id))
  const perBrand = new Map<string, number>()
  const out: Product[] = []
  for (const p of ranked) {
    if ((perBrand.get(p.brand) || 0) >= 2) continue
    perBrand.set(p.brand, (perBrand.get(p.brand) || 0) + 1)
    out.push(p)
    if (out.length >= limit) break
  }
  return out
}

// Shopify stores answer /products/<handle>.js with live availability. The exact colour (?variant=) decides when present.
export function shopifyStatusUrl(product: Product): string | null {
  if (product.feed !== 'shopify') return null
  try {
    const u = new URL(product.productUrl)
    if (!/\/products\/[^/]+$/.test(u.pathname)) return null
    return `${u.origin}${u.pathname}.js`
  } catch { return null }
}
type ShopifyProductJs = { available?: boolean; variants?: { id: number; available?: boolean }[] }
export function shopifyAvailability(product: Product, status: number, body: ShopifyProductJs | null): 'available' | 'unavailable' | 'unknown' {
  if (status === 404) return 'unavailable'
  if (status !== 200 || !body) return 'unknown'
  const variant = new URL(product.productUrl).searchParams.get('variant')
  const v = variant ? body.variants?.find(x => String(x.id) === variant) : undefined
  if (variant && body.variants && !v) return 'unavailable'
  const available = v ? v.available : body.available
  return available === false ? 'unavailable' : available === true ? 'available' : 'unknown'
}

// Where an outbound click should land: an approved affiliate link when one exists, otherwise the exact product page.
export function outboundUrl(product: Product): string {
  const url = new URL(product.affiliateUrl || product.productUrl)
  if (!product.affiliateUrl) {
    url.searchParams.set('utm_source', 'parche')
    url.searchParams.set('utm_medium', 'referral')
    url.searchParams.set('utm_campaign', 'travel-edit')
  }
  return url.toString()
}

const fitsWear = (p: Product, wear: Wear) => wear === 'unisex' ? true : p.gender === wear || p.gender === 'unisex'

// A stable per-trip shuffle so different destinations surface different pieces from a large pool.
function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0 }

// Exact category match is mandatory: a missing rain shell is never filled with a tee.
// Each piece gets up to `perTier` options in each of luxury, mid-range and budget, from different brands where possible.
// When a price band is thin, the closest-priced options from the neighbouring band fill it, so every piece still offers a choice.
// `fit` lets the trip's edit lean the ranking toward its palette; `pinned` products (pieces styled into a look) are always shown.
export function optionsForNeed(products: Product[], kind: PackingKind, wear: Wear, plan: PackingPlan, style: Trip['style'], seed = '', perTier = 3, fit?: (p: Product) => number, pinned: Product[] = []): TierOptions[] {
  const score = (p: Product) =>
    (style && p.styles.includes(style) ? 4 : 0) +
    p.colours.filter(c => plan.palette.includes(c)).length * 2 +
    (wear !== 'unisex' && p.gender === wear ? 1 : 0) + (wear === 'unisex' && p.gender === 'unisex' ? 2 : 0) +
    (fit ? fit(p) : 0) +
    (hash(seed + p.id) % 1000) / 1000
  const matched = products.filter(p => p.kinds[0] === kind && fitsWear(p, wear) && (plan.climate === 'unknown' || p.climates.includes(plan.climate)))
  // Unknown weather never narrows the shop: the packing plan has already chosen which pieces apply.
  const ranked = new Map(matched.map(p => [p.id, score(p)]))
  const bucket: Record<Tier, Product[]> = { 'High-end': [], Quality: [], Budget: [] }
  for (const p of matched) bucket[p.tier].push(p)
  for (const t of TIERS) bucket[t].sort((a, b) => cad(a) - cad(b))

  // Borrow boundary items from a neighbouring band without leaving it short.
  const borrow = (to: Tier, from: Tier, fromCheap: boolean) => {
    while (bucket[to].length < perTier && bucket[from].length > perTier) {
      const item = fromCheap ? bucket[from].shift()! : bucket[from].pop()!
      bucket[to].push(item)
    }
  }
  borrow('Budget', 'Quality', true)
  borrow('High-end', 'Quality', false)
  borrow('Quality', 'Budget', false)
  borrow('Quality', 'High-end', true)

  return TIERS.map(tier => {
    const pool = [...bucket[tier]].sort((a, b) => ranked.get(b.id)! - ranked.get(a.id)!)
    const picks: Product[] = []
    const brands = new Set<string>()
    for (const p of pool) if (picks.length < perTier && !brands.has(p.brand)) { picks.push(p); brands.add(p.brand) }
    for (const p of pool) if (picks.length < perTier && !picks.includes(p)) picks.push(p)
    for (const p of pinned) if (bucket[tier].some(x => x.id === p.id) && !picks.some(x => x.id === p.id)) { if (picks.length >= perTier) picks.pop(); picks.unshift(p) }
    return { tier, label: TIER_LABEL[tier], products: picks.sort((a, b) => cad(b) - cad(a)) }
  }).filter(t => t.products.length)
}

