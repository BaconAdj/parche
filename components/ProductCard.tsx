'use client'

import { useState } from 'react'
import { TIER_LABEL, type Product } from '../lib/catalogue-types'
import { localCredit } from '../lib/local-brands'

const money = (p: Product) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: p.currency, currencyDisplay: p.currency === 'CAD' ? 'narrowSymbol' : 'code' }).format(p.price)

// Image, price and link all come from the same reviewed record, so the photo is always the item you land on.
export function ProductCard({ product, destination, kind, showTier = true, badge }: { product: Product; destination?: string; kind?: string; showTier?: boolean; badge?: string }) {
  const [failed, setFailed] = useState(false)
  const qs = new URLSearchParams()
  if (destination) qs.set('d', destination)
  if (kind) qs.set('k', kind)
  const href = `/go/${product.id}${qs.size ? `?${qs}` : ''}`
  return (
    <a className={`pcard${badge ? ' pcard--pick' : ''}`} href={href} target="_blank" rel="noopener sponsored">
      <div className="pcard-img">
        {failed
          ? <p className="pcard-missing">Photo unavailable. See it at {product.brand}.</p>
          : <img src={product.imageUrl} alt={`${product.brand} ${product.name}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />}
        {showTier && <span className="pcard-tier">{TIER_LABEL[product.tier]}</span>}
        {badge && <span className="pcard-pick">{badge}</span>}
      </div>
      <div className="pcard-meta"><span className="pcard-brand">{product.brand}</span><span className="pcard-price">{money(product)}</span></div>
      <p className="pcard-name">{product.name}</p>
      {localCredit(product.brand) && <p className="pcard-local">{localCredit(product.brand)}</p>}
      <p className="pcard-why">{product.details}</p>
      <span className="pcard-cta">Shop at {product.brand}<span className="visually-hidden"> (opens the retailer&apos;s site)</span></span>
    </a>
  )
}
