import { NextRequest, NextResponse, after } from 'next/server'
import { findProduct, outboundUrl } from '../../../lib/product-catalogue'
import { getPostHogServer, visitorIdFromCookies } from '../../../lib/posthog-server'

// Every shop link goes through here so clicks are measurable and affiliate links can be swapped in centrally.
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
  await recordClick(event)

  // Sent after the redirect goes out, so the shopper never waits on analytics.
  const visitorId = visitorIdFromCookies(request.cookies)
  after(async () => {
    const posthog = getPostHogServer()
    if (!posthog) return
    try {
      posthog.capture({
        distinctId: visitorId || crypto.randomUUID(),
        event: 'product_clicked',
        properties: { ...event, app: 'parche', ...(visitorId ? {} : { $process_person_profile: false }) },
      })
      await posthog.shutdown()
    } catch {
      // Tracking must never block the shopper.
    }
  })

  const response = NextResponse.redirect(outboundUrl(product), 302)
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('Referrer-Policy', 'origin')
  return response
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
