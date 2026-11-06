import { NextRequest, NextResponse } from 'next/server'
import { findProduct, outboundUrl } from '../../../lib/product-catalogue'
import { shopifyAvailability, shopifyStatusUrl } from '../../../lib/selection'
import type { Product } from '../../../lib/catalogue-types'

// Every shop link goes through here so clicks are measurable and affiliate links can be swapped in centrally.
// For stores that publish live availability (Shopify), the product is checked at the moment of the click: a sold-out
// piece sends the shopper to parché's alternatives for that same piece instead of a dead page.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = findProduct(id)
  if (!product) return NextResponse.redirect(new URL('/', request.url), 302)

  const destination = request.nextUrl.searchParams.get('d')?.slice(0, 80) || null
  const kind = request.nextUrl.searchParams.get('k')?.slice(0, 40) || null
  const event = {
    product_id: product.id,
    brand: product.brand,
    tier: product.tier,
    kind,
    destination,
    affiliate: Boolean(product.affiliateUrl),
    referrer: request.headers.get('referer')?.slice(0, 300) || null,
  }
  // Structured line for Vercel logs; always available even before the table exists.
  console.log(JSON.stringify({ type: 'parche.product_click', ...event, at: new Date().toISOString() }))
  const [, availability] = await Promise.all([recordClick(event), liveAvailability(product)])

  let target = outboundUrl(product)
  if (availability === 'unavailable') {
    console.log(JSON.stringify({ type: 'parche.product_unavailable', product_id: product.id, brand: product.brand, at: new Date().toISOString() }))
    const alt = new URL(`/unavailable/${encodeURIComponent(product.id)}`, request.url)
    if (destination) alt.searchParams.set('d', destination)
    if (kind) alt.searchParams.set('k', kind)
    target = alt.toString()
  }
  const response = NextResponse.redirect(target, 302)
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('Referrer-Policy', 'origin')
  return response
}

// Asks the store whether this exact product is still for sale. Anything slow or unclear sends the shopper on as usual:
// the check may only ever prevent a dead click, never block a good one.
async function liveAvailability(product: Product): Promise<'available' | 'unavailable' | 'unknown'> {
  const url = shopifyStatusUrl(product)
  if (!url) return 'unknown'
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(900) })
    const body = res.status === 200 ? await res.json().catch(() => null) : null
    return shopifyAvailability(product, res.status, body)
  } catch {
    return 'unknown'
  }
}

// Optional: stores the click in Supabase when the product_clicks table exists (see docs/click-tracking.md).
async function recordClick(event: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return
  try {
    await fetch(`${url}/rest/v1/product_clicks`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(1500),
    })
  } catch {
    // Tracking must never block the shopper.
  }
}
