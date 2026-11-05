'use client'

import { useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import type { Product, ShopPayload } from '../../../lib/catalogue-types'
import type { PackingKind } from '../../../lib/packing'
import type { TravelEdit } from '../../../lib/travel-edit'
import LogoLoop from '../../../components/react-bits/LogoLoop'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type CuratedItem = { product: Product; kind: PackingKind; label: string; role?: string }
const BASICS = new Set<PackingKind>(['underwear', 'bra', 'socks', 'sleepwear', 'base-layer-top', 'base-layer-bottoms', 'sports-bra'])
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const money = (p: Product) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: p.currency, currencyDisplay: p.currency === 'CAD' ? 'narrowSymbol' : 'code', maximumFractionDigits: 0 }).format(p.price)
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
// Retailer names often repeat the brand ("Nike Nike Moon Shoe"); show it once.
const nameOf = (p: Product) => p.name.toLowerCase().startsWith(p.brand.toLowerCase() + ' ') ? p.name.slice(p.brand.length + 1) : p.name
export const goHref = (p: Product, kind: string, destination: string) => `/go/${p.id}?d=${encodeURIComponent(destination)}&k=${kind}`

// One ideal piece per thing worth buying for this trip, regardless of price tier: first the pieces the
// stylist built the looks from, then the best-fitting option for each remaining piece on the list.
// Ranking comes from the same selection every brand competes in; nothing here weights a label.
export function curate(edit: TravelEdit, payload: ShopPayload | null, limit = 12): CuratedItem[] {
  if (!payload) return []
  const titles = new Map(edit.packingPlan.needs.map(n => [n.id, n.title]))
  const items: CuratedItem[] = [], seen = new Set<string>(), kinds = new Set<PackingKind>()
  const add = (product: Product, kind: PackingKind, role?: string) => {
    if (seen.has(product.id) || items.length >= limit) return
    seen.add(product.id); kinds.add(kind)
    items.push({ product, kind, label: titles.get(kind) || product.name, role })
  }
  for (const look of payload.edit?.looks || []) for (const p of look.pieces) if (!kinds.has(p.kind)) add(p.product, p.kind, p.role)
  for (const need of payload.needs) {
    if (BASICS.has(need.id) || kinds.has(need.id)) continue
    const tier = need.tiers.find(t => t.tier === 'Quality' && t.products.length) || need.tiers.find(t => t.products.length)
    if (tier) add(tier.products[0], need.id)
  }
  return items
}

// ── The curated rail: the first thing under the hero, so suggestions are never a scroll away ──
export function CuratedRail({ edit, payload, loading }: { edit: TravelEdit; payload: ShopPayload | null; loading: boolean }) {
  const items = useMemo(() => curate(edit, payload), [edit, payload])
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [failed, setFailed] = useState<Set<string>>(new Set())
  const month = edit.trip.start ? MONTHS[Number(edit.trip.start.slice(5, 7)) - 1] : ''
  const styled = payload?.edit

  useGSAP(() => {
    if (!root.current || !items.length || reduced()) return
    gsap.from(root.current.querySelectorAll('.ccard'), { y: 60, autoAlpha: 0, rotate: () => gsap.utils.random(-3, 3), duration: 1, ease: 'expo.out', stagger: .06, delay: .15 })
    gsap.from(root.current.querySelectorAll('.cur-title .w'), { yPercent: 110, duration: 1, ease: 'expo.out', stagger: .05 })
  }, { scope: root, dependencies: [items.map(i => i.product.id).join()], revertOnUpdate: true })

  const nudge = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' })
  const onScroll = () => {
    const t = track.current
    if (t) setProgress(t.scrollWidth > t.clientWidth ? t.scrollLeft / (t.scrollWidth - t.clientWidth) : 1)
  }

  if (!loading && !items.length) return null
  return (
    <section ref={root} id="curated" className="cur" aria-labelledby="cur-title">
      <div className="wrap">
        <div className="cur-panel">
          <header className="cur-head">
            <div>
              <p className="kicker">Curated for {edit.destination.name}{month ? ` in ${month}` : ''}</p>
              <h2 id="cur-title" className="cur-title">{'The pieces we’d pack.'.split(' ').map((w, i) => <span key={i} className="w-mask"><span className="w">{w}</span></span>)}</h2>
            </div>
            <p className="cur-line">{styled ? <><strong>Styled as {styled.name}.</strong> {styled.line}</> : edit.packingPlan.note}</p>
            <div className="cur-nav">
              <button type="button" onClick={() => nudge(-1)} aria-label="Previous pieces" disabled={progress <= 0.01}>←</button>
              <button type="button" onClick={() => nudge(1)} aria-label="More pieces" disabled={progress >= 0.99}>→</button>
            </div>
          </header>
          <div ref={track} className="cur-track" onScroll={onScroll} tabIndex={0} aria-label="Curated pieces, scroll sideways for more">
            {loading && !items.length
              ? Array.from({ length: 5 }, (_, i) => <div key={i} className="ccard ccard--ghost" aria-hidden><div className="ccard-img" /></div>)
              : items.filter(item => !failed.has(item.product.id)).map((item, i) => (
                <a key={item.product.id} className="ccard" href={goHref(item.product, item.kind, edit.destination.name)} target="_blank" rel="noopener sponsored">
                  <div className="ccard-img">
                    <img src={item.product.imageUrl} alt={`${item.product.brand} ${item.product.name}`} loading={i < 5 ? 'eager' : 'lazy'} referrerPolicy="no-referrer" onError={() => setFailed(f => new Set(f).add(item.product.id))} />
                    <span className="ccard-n">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p className="ccard-label">{item.label}{item.role && <span> · {item.role.replace('The ', '')}</span>}</p>
                  <p className="ccard-name"><strong>{item.product.brand}</strong> {nameOf(item.product)}</p>
                  <p className="ccard-price">{money(item.product)}</p>
                </a>
              ))}
            <a className="ccard ccard--more" href="#shop"><span className="serif">Every piece, every price</span><span className="ccard-more-cta">See the full list ↓</span></a>
          </div>
          <div className="cur-progress" aria-hidden><span style={{ transform: `scaleX(${Math.max(progress, 0.08)})` }} /></div>
        </div>
      </div>
    </section>
  )
}

// ── Drift: products pass slowly through the page like a shop window seen from the street ──
export function DriftStrip({ edit, payload }: { edit: TravelEdit; payload: ShopPayload | null }) {
  const products = useMemo(() => {
    const out: { p: Product; kind: PackingKind }[] = [], seen = new Set<string>()
    for (const need of payload?.needs || []) {
      if (BASICS.has(need.id)) continue
      for (const t of need.tiers) for (const p of t.products.slice(0, 1)) if (!seen.has(p.id)) { seen.add(p.id); out.push({ p, kind: need.id }) }
    }
    return out.slice(0, 28)
  }, [payload])
  if (products.length < 8) return null
  return (
    <div className="drift" aria-label={`More for ${edit.destination.name}`}>
      <p className="drift-label"><span className="emblem" aria-hidden /> Seen in {edit.destination.name}</p>
      <LogoLoop
        logos={products.map(({ p, kind }) => ({
          node: <a className="drift-item" href={goHref(p, kind, edit.destination.name)} target="_blank" rel="noopener sponsored" title={`${p.brand} ${p.name}, ${money(p)}`}>
            <img src={p.imageUrl} alt={`${p.brand} ${p.name}`} loading="lazy" referrerPolicy="no-referrer" onError={e => { const li = e.currentTarget.closest('li'); if (li) li.style.display = 'none' }} />
            <span className="drift-tag">{p.brand} · {money(p)}</span>
          </a>,
          title: `${p.brand} ${p.name}`,
        }))}
        speed={24} hoverSpeed={4} scrollBoost={0.35} gap={18} logoHeight={200} fadeOut fadeOutColor="#FFFFFF" ariaLabel={`Pieces for ${edit.destination.name}`}
      />
    </div>
  )
}
