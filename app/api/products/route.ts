import { NextRequest, NextResponse } from 'next/server'
import { findProduct, reviewedProducts } from '../../../lib/product-catalogue'
import type { Product } from '../../../lib/catalogue-types'

// Small product lookups for the home page: specific ids, or a varied showcase across brands and pieces.
export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get('ids')
  if (ids) {
    const items = ids.split(',').slice(0, 24).map(id => findProduct(id.trim())).filter((p): p is Product => Boolean(p))
    return NextResponse.json({ data: { items } }, { headers: { 'Cache-Control': 'public, s-maxage=3600' } })
  }
  const count = Math.min(Number(request.nextUrl.searchParams.get('count')) || 24, 48)
  const live = reviewedProducts()
  // One brand's spotlight: its pieces spread across categories, at most two of each.
  const brand = request.nextUrl.searchParams.get('brand')
  if (brand) {
    const own = live.filter(p => p.brand.toLowerCase() === brand.toLowerCase())
    const perKind = new Map<string, number>()
    const items: Product[] = []
    for (let round = 0; round < 2 && items.length < count; round++) for (const p of own) {
      if (items.length >= count || items.includes(p) || (perKind.get(p.kinds[0]) || 0) > round) continue
      perKind.set(p.kinds[0], (perKind.get(p.kinds[0]) || 0) + 1); items.push(p)
    }
    return NextResponse.json({ data: { items, total: own.length } }, { headers: { 'Cache-Control': 'public, s-maxage=3600' } })
  }
  // One product per brand × piece, spread across the catalogue, changing daily.
  const day = Math.floor(Date.now() / 86400000)
  const seen = new Set<string>()
  const items: Product[] = []
  const step = Math.max(1, Math.floor(live.length / (count * 4)))
  for (let i = 0; items.length < count && i < live.length * 2; i++) {
    const p = live[(i * step * 7 + day * 131) % live.length]
    const key = `${p.brand}|${p.kinds[0]}`
    if (seen.has(key) || seen.has(p.brand + '#') && items.filter(x => x.brand === p.brand).length >= 2) continue
    seen.add(key); seen.add(p.brand + '#'); items.push(p)
  }
  const brands = Object.entries(live.reduce<Record<string, number>>((a, p) => (a[p.brand] = (a[p.brand] || 0) + 1, a), {})).sort((a, b) => b[1] - a[1]).map(([b]) => b)
  return NextResponse.json({ data: { items, total: live.length, brands } }, { headers: { 'Cache-Control': 'public, s-maxage=3600' } })
}
