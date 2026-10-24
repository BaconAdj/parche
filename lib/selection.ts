// Pure selection logic, shared by the shop API and the tests. No catalogue data is imported here.
import kindsData from '../data/kinds.json'
import type { PackingKind, PackingPlan } from './packing'
import type { Trip, Wear } from './trip'
import { TIERS, TIER_LABEL, type Product, type Tier, type TierOptions } from './catalogue-types'

const FX = kindsData.fx as Record<string, number>
export const cad = (p: Product) => p.price * (FX[p.currency] || 1)

// A price older than 30 days is no longer shown: the weekly refresh re-checks every live product.
export const MAX_AGE_DAYS = 30
export function liveProducts(products: Product[], now = new Date()): Product[] {
  return products.filter(p => {
    const age = now.getTime() - Date.parse(p.checkedAt + 'T00:00:00Z')
    return age >= -86400000 && age < MAX_AGE_DAYS * 86400000
  })
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

