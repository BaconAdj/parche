import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import kindsData from '../../../data/kinds.json'
import { findProduct, reviewedProducts } from '../../../lib/product-catalogue'
import { alternativesFor } from '../../../lib/selection'
import { ProductCard } from '../../../components/ProductCard'
import { SiteNav } from '../../../components/SiteNav'
import { SiteFooter } from '../../../components/SiteFooter'

export const metadata: Metadata = { title: 'Just sold out — parché', robots: { index: false, follow: false } }

const LABEL = Object.fromEntries(kindsData.kinds.map(k => [k.id, k.label])) as Record<string, string>

// Reached from /go/[id] when the store reports the piece sold out at the moment of the click.
// Shows the closest replacements for the same piece instead of sending the shopper to a dead page.
export default async function UnavailablePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { id } = await params
  const query = await searchParams
  const product = findProduct(decodeURIComponent(id))
  if (!product) notFound()
  const destination = typeof query.d === 'string' ? query.d.slice(0, 80) : undefined
  const kind = typeof query.k === 'string' ? query.k.slice(0, 40) : product.kinds[0]
  const alternatives = alternativesFor(product, reviewedProducts())
  const piece = (LABEL[product.kinds[0]] || 'piece').toLowerCase()

  return (
    <>
      <SiteNav />
      <main id="main" className="wrap" style={{ paddingBlock: 'clamp(6rem, 12vw, 9rem) clamp(3rem, 8vw, 6rem)' }}>
        <p className="kicker">Just sold out</p>
        <h1 className="h2">{product.brand} {product.name.split(' — ')[0]} sold out moments ago.</h1>
        <p className="lede">We checked with {product.brand} as you clicked{destination ? `, so your ${destination} list stays reliable` : ''}. Here are the closest alternatives for your {piece}.</p>
        {alternatives.length
          ? <div className="shop-products">{alternatives.map(p => <ProductCard key={p.id} product={p} destination={destination} kind={kind} />)}</div>
          : <p className="lede">We don&apos;t have another {piece} that fits right now. Head back to your list for the rest of your pieces.</p>}
      </main>
      <SiteFooter />
    </>
  )
}
