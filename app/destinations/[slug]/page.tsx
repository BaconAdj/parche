'use client'

import { Suspense, useState, useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useUser, SignInButton } from '@clerk/nextjs'
import { ACCOUNTS_ENABLED } from '../../../lib/flags'
import { createClient } from '../../../lib/supabase'
import { findDestination, type Destination } from '../../../lib/destinations'
import { TIER_LABEL, type Product, type ShopPayload } from '../../../lib/catalogue-types'
import { GROUPS, type PackingKind } from '../../../lib/packing'
import { ACTIVITIES, STYLES, WEARS, parseTrip, tripParams, formatTripDates, type Trip } from '../../../lib/trip'
import { buildTravelEdit, type TravelEdit } from '../../../lib/travel-edit'
import { cad } from '../../../lib/selection'
import { TripDates, TripWeatherPanel } from './trip-controls'
import { SiteNav } from '../../../components/SiteNav'
import { SiteFooter } from '../../../components/SiteFooter'
import { ProductCard } from '../../../components/ProductCard'
import Counter from '../../../components/react-bits/Counter'
import LogoLoop from '../../../components/react-bits/LogoLoop'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// ── Unsplash (optional editorial photography; never used for products) ──
const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || ''
type UnsplashPhoto = { id: string; urls: { regular: string; small: string }; alt_description: string; user: { name: string }; links: { html: string } }

async function fetchPhoto(query: string, orientation: 'landscape' | 'portrait' = 'portrait'): Promise<UnsplashPhoto | null> {
  if (!UNSPLASH_KEY) return null
  try {
    const params = new URLSearchParams({ query, per_page: '3', orientation, content_filter: 'high' })
    const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } })
    const data = await res.json()
    return data.results?.[0] || null
  } catch { return null }
}

function PhotoCredit({ photo }: { photo: UnsplashPhoto }) {
  return <a href={`${photo.links.html}?utm_source=parche&utm_medium=referral`} target="_blank" rel="noopener noreferrer" className="photo-credit">Photo: {photo.user.name}, Unsplash</a>
}

// ── Saving (Supabase, signed-in only) ──
function SaveTripButton({ dest, photo }: { dest: Destination; photo: string | null }) {
  const { isSignedIn, user } = useUser()
  const supabase = useMemo(() => createClient(), [])
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isSignedIn || !user) return
    supabase.from('saved_trips').select('id').eq('user_id', user.id).eq('destination_slug', dest.slug).single()
      .then(({ data }: { data: { id: string } | null }) => { if (data) setSaved(true) })
  }, [isSignedIn, user, dest.slug, supabase])

  if (!isSignedIn) return <SignInButton mode="modal"><button className="btn btn--line">Save this trip</button></SignInButton>
  async function toggle() {
    if (!user) return
    setLoading(true)
    if (saved) {
      await supabase.from('saved_trips').delete().eq('user_id', user.id).eq('destination_slug', dest.slug)
      setSaved(false)
    } else {
      await supabase.from('saved_trips').upsert({ user_id: user.id, destination_slug: dest.slug, destination_name: dest.name, destination_country: dest.country, destination_temp: dest.temp, photo_url: photo })
      setSaved(true)
    }
    setLoading(false)
  }
  return <button className="btn btn--line" aria-pressed={saved} onClick={toggle} disabled={loading}>{saved ? 'Saved to my trips' : 'Save this trip'}</button>
}

function SaveLookButton({ dest, title, desc, photo }: { dest: Destination; title: string; desc: string; photo: string | null }) {
  const { isSignedIn, user } = useUser()
  const supabase = useMemo(() => createClient(), [])
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  if (!isSignedIn) return <SignInButton mode="modal"><button className="text-btn">Save this look</button></SignInButton>
  async function toggle() {
    if (!user) return
    setLoading(true)
    if (saved) {
      await supabase.from('saved_looks').delete().eq('user_id', user.id).eq('destination_slug', dest.slug).eq('look_title', title)
      setSaved(false)
    } else {
      await supabase.from('saved_looks').insert({ user_id: user.id, destination_slug: dest.slug, destination_name: dest.name, look_title: title, look_desc: desc, photo_url: photo })
      setSaved(true)
    }
    setLoading(false)
  }
  return <button className="text-btn" aria-pressed={saved} onClick={toggle} disabled={loading}>{saved ? 'Saved' : 'Save this look'}</button>
}

// ── Shop the list ──
const money = (p: Product) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: p.currency, currencyDisplay: p.currency === 'CAD' ? 'narrowSymbol' : 'code', maximumFractionDigits: 0 }).format(p.price)
type ShopState = { payload: ShopPayload | null; loading: boolean; error: string }

function ShopTheList({ edit, shop }: { edit: TravelEdit; shop: ShopState }) {
  const [selected, setSelected] = useState<PackingKind | null>(null)
  const [packed, setPacked] = useState<Record<string, boolean>>({})
  const panel = useRef<HTMLDivElement>(null)
  const plan = edit.packingPlan
  const byNeed = useMemo(() => new Map(shop.payload?.needs.map(n => [n.id, n.tiers]) || []), [shop.payload])
  const picks = useMemo(() => new Set(shop.payload?.needs.flatMap(n => n.picks || []) || []), [shop.payload])
  const styled = shop.payload?.edit
  const current = plan.needs.find(n => n.id === selected) || plan.needs[0]
  const tiers = byNeed.get(current.id) || []
  const done = plan.needs.filter(n => packed[n.id]).reduce((t, n) => t + n.quantity, 0)
  const choose = (kind: PackingKind) => {
    setSelected(kind)
    if (window.innerWidth < 900) document.getElementById('shop-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useGSAP(() => {
    if (!panel.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(panel.current.querySelectorAll('.pcard'), { y: 28, autoAlpha: 0, rotate: () => gsap.utils.random(-2.5, 2.5) },
      { y: 0, autoAlpha: 1, rotate: 0, duration: .7, ease: 'expo.out', stagger: { each: .05, grid: 'auto' } })
    gsap.fromTo(panel.current.querySelector('.shop-panel-title'), { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .6, ease: 'expo.out' })
  }, { dependencies: [current.id, shop.payload], scope: panel })

  return (
    <section id="shop" className="shop" aria-labelledby="shop-title">
      <div className="wrap">
        <div className="shop-head">
          <div>
            <p className="kicker">Your complete packing list</p>
            <h2 id="shop-title" className="h2">
              <span className="shop-count"><Counter value={plan.total} fontSize="1em" fontWeight={400} textColor="currentColor" padding={0} gap={0} /></span> pieces for {edit.destination.name}.
            </h2>
            <p className="lede">{plan.note} Tick items off as you pack; pick a piece to see options at every price.</p>
          </div>
          <p className="shop-progress" role="status">{done} of {plan.total} pieces packed</p>
        </div>
        {styled && <a className="edit-strip" href="#edit">
          <span className="edit-strip-label">Styled as</span>
          <span className="edit-strip-name">{styled.name}</span>
          <span className="edit-strip-swatches" aria-hidden>{styled.swatches.map(s => <i key={s.label} style={{ background: s.hex }} />)}</span>
          <span className="edit-strip-cta">See the three looks</span>
        </a>}

        <div className="shop-grid">
          <div className="shop-list">
            {GROUPS.map(group => {
              const needs = plan.needs.filter(n => n.group === group)
              if (!needs.length) return null
              return (
                <div key={group} className="shop-group">
                  <h3>{group}</h3>
                  <ul>
                    {needs.map(need => {
                      const active = need.id === current.id
                      return (
                        <li key={need.id} className={`need${active ? ' is-active' : ''}${packed[need.id] ? ' is-packed' : ''}`}>
                          <input type="checkbox" id={`pk-${need.id}`} checked={!!packed[need.id]} onChange={e => setPacked(p => ({ ...p, [need.id]: e.target.checked }))} aria-label={`Already packed: ${need.title}`} />
                          <button type="button" className="need-btn" aria-pressed={active} onClick={() => choose(need.id)}>
                            <span className="need-title">{need.title}{need.optional && <span className="need-opt"> (optional)</span>}</span>
                            <span className="need-qty" aria-label={`Pack ${need.quantity}`}>{need.quantity}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>

          <div id="shop-panel" ref={panel} className="shop-panel" tabIndex={-1} aria-live="polite">
            <p className="kicker">Pack {current.quantity}</p>
            <h3 className="serif shop-panel-title">{current.title}</h3>
            <p className="shop-panel-why">{current.reason}</p>
            {shop.loading && !shop.payload ? <div className="shop-skeleton" aria-label="Finding the pieces" role="status">{Array.from({ length: 6 }, (_, i) => <span key={i} />)}</div>
              : shop.error ? <p role="status" className="shop-status">{shop.error}</p>
              : tiers.length ? tiers.map(t => (
                <div key={t.tier} className="tier-row">
                  <h4 className="tier-label"><span>{t.label}</span><small>{t.products.length} {t.products.length === 1 ? 'option' : 'options'}</small></h4>
                  <div className="shop-products">
                    {t.products.map(p => <ProductCard key={p.id} product={p} destination={edit.destination.name} kind={current.id} showTier={false} badge={picks.has(p.id) && styled ? `In the ${styled.name} edit` : undefined} />)}
                  </div>
                </div>
              )) : (
                <p className="shop-status">We&apos;re still sourcing this piece for {edit.trip.wear === 'unisex' ? 'this wardrobe' : edit.trip.wear === 'women' ? 'womenswear' : 'menswear'}. The note above says what to look for.</p>
              )}
            <p className="shop-foot">Prices are shown in each retailer&apos;s currency and refreshed weekly{shop.payload?.checkedAt ? ` (oldest checked ${shop.payload.checkedAt})` : ''}. Confirm sizes, stock and delivery on the product page.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── The parché edit: one direction for the trip, three looks built from pieces on the list ──
const cadMoney = (n: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(Math.round(n / 10) * 10)

function EditLooks({ edit, shop, onEdit }: { edit: TravelEdit; shop: ShopState; onEdit: (id: string) => void }) {
  const root = useRef<HTMLElement>(null)
  const styled = shop.payload?.edit
  useGSAP(() => {
    if (!root.current || !styled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from(root.current.querySelectorAll('.edit-name .w'), { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: root.current, start: 'top 75%' } })
    gsap.from(root.current.querySelectorAll('.edit-swatches li'), { scale: .4, autoAlpha: 0, duration: .7, ease: 'back.out(2)', stagger: .07, scrollTrigger: { trigger: root.current, start: 'top 70%' } })
    root.current.querySelectorAll<HTMLElement>('.board').forEach(board => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: board, start: 'top 78%' }, defaults: { ease: 'expo.out' } })
      tl.from(board.querySelectorAll('.board-tile'), { clipPath: 'inset(100% 0 0 0)', duration: 1.1, stagger: .08 })
        .from(board.querySelectorAll('.board-tile img'), { scale: 1.18, duration: 1.4, stagger: .08 }, 0)
        .from(board.querySelectorAll('.board-copy > *'), { y: 24, autoAlpha: 0, duration: .8, stagger: .06 }, .2)
    })
  }, { dependencies: [styled?.id, styled?.looks.map(l => l.pieces.map(p => p.product.id).join()).join()], scope: root, revertOnUpdate: true })

  if (shop.loading && !styled) return <section className="edit" aria-busy="true"><div className="wrap"><p className="kicker" role="status">Our stylists are pulling the looks…</p><div className="shop-skeleton">{Array.from({ length: 4 }, (_, i) => <span key={i} />)}</div></div></section>
  if (!styled || !styled.looks.length) return null
  const go = (id: string, kind: string) => `/go/${id}?d=${encodeURIComponent(edit.destination.name)}&k=${kind}`
  return (
    <section ref={root} id="edit" className="edit" aria-labelledby="edit-title">
      <div className="wrap">
        <header className="edit-head">
          <p className="kicker">The parché edit for {edit.destination.name}</p>
          <h2 id="edit-title" className="edit-name">{styled.name.split(' ').map((w, i) => <span key={i} className="w-mask"><span className="w">{w}</span></span>)}</h2>
          <p className="edit-line">{styled.line}</p>
          <ul className="edit-swatches" aria-label="The palette">
            {styled.swatches.map(s => <li key={s.label}><span style={{ background: s.hex }} aria-hidden /> {s.label}</li>)}
          </ul>
          <p className="edit-rule"><strong>The rule.</strong> {styled.rule}</p>
          {styled.alternates.length > 0 && <div className="edit-alts">
            <span>Or dress the trip as</span>
            {styled.alternates.map(a => <button key={a.id} type="button" title={a.line} onClick={() => onEdit(a.id)}>{a.name}</button>)}
          </div>}
        </header>

        <div className="edit-boards">
          {styled.looks.map((look, i) => {
            const total = look.pieces.reduce((t, p) => t + cad(p.product), 0)
            const [hero, ...rest] = look.pieces
            return (
              <article key={look.id} className={`board${i % 2 ? ' board--flip' : ''}`}>
                <div className="board-grid" data-count={rest.length}>
                  <a className="board-tile board-tile--hero" href={go(hero.product.id, hero.kind)} target="_blank" rel="noopener sponsored">
                    <img src={hero.product.imageUrl} alt={`${hero.product.brand} ${hero.product.name}`} loading="lazy" referrerPolicy="no-referrer" />
                    <span className="board-badge">1</span>
                  </a>
                  {rest.map((p, j) => (
                    <a key={p.product.id} className="board-tile" href={go(p.product.id, p.kind)} target="_blank" rel="noopener sponsored">
                      <img src={p.product.imageUrl} alt={`${p.product.brand} ${p.product.name}`} loading="lazy" referrerPolicy="no-referrer" />
                      <span className="board-badge">{j + 2}</span>
                    </a>
                  ))}
                </div>
                <div className="board-copy">
                  <p className="board-kicker"><span className="board-num">{String(i + 1).padStart(2, '0')}</span> {look.occasion} · {TIER_LABEL[look.tier]} edit</p>
                  <h3 className="board-title">{look.title}</h3>
                  <p className="board-note">{look.note}</p>
                  <ol className="board-pieces">
                    {look.pieces.map((p, j) => (
                      <li key={p.product.id}>
                        <span className="board-n">{j + 1}</span>
                        <div>
                          <p className="board-role">{p.role}</p>
                          <a href={go(p.product.id, p.kind)} target="_blank" rel="noopener sponsored"><strong>{p.product.brand}</strong> {p.product.name}<em>{money(p.product)}</em></a>
                          <p className="board-why">{p.note}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="board-total">The full look, about {cadMoney(total)}</p>
                  {ACCOUNTS_ENABLED && <SaveLookButton dest={edit.destination} title={look.title} desc={look.note} photo={hero.product.imageUrl} />}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function BrandRibbon({ shop }: { shop: ShopState }) {
  const brands = [...new Set(shop.payload?.needs.flatMap(n => n.tiers.flatMap(t => t.products.map(p => p.brand))) || [])]
  if (brands.length < 6) return null
  return (
    <div className="brand-ribbon" aria-label={`Brands in this edit: ${brands.join(', ')}`}>
      <LogoLoop logos={brands.map(b => ({ node: <span className="brand-ribbon-item">{b}</span>, title: b }))} speed={60} gap={48} logoHeight={34} fadeOut fadeOutColor="#14213D" pauseOnHover scaleOnHover ariaLabel="Brands in this edit" />
    </div>
  )
}

// ── Trip controls in the hero, so wardrobe, activity and style change the list in place ──
function TripControls({ trip, onChange }: { trip: Trip; onChange: (updates: Partial<Trip>) => void }) {
  return (
    <div className="r-controls">
      <div className="r-control">
        <span className="r-control-label">Shop for</span>
        <div className="seg" role="radiogroup" aria-label="Shop for">
          {WEARS.map(w => <button key={w.value} type="button" role="radio" aria-checked={trip.wear === w.value} onClick={() => onChange({ wear: w.value })}>{w.value === 'women' ? 'Women' : w.value === 'men' ? 'Men' : 'Unisex'}</button>)}
        </div>
      </div>
      <div className="r-control">
        <span className="r-control-label">Your trip</span>
        <div className="trip-choices">{ACTIVITIES.map(a => <button type="button" key={a.value} aria-pressed={trip.activity === a.value} onClick={() => onChange({ activity: trip.activity === a.value ? '' : a.value })}>{a.label}</button>)}</div>
      </div>
      <div className="r-control">
        <span className="r-control-label">Your style</span>
        <div className="trip-choices">{STYLES.map(s => <button type="button" key={s.value} aria-pressed={trip.style === s.value} onClick={() => onChange({ style: trip.style === s.value ? '' : s.value })}>{s.label}</button>)}</div>
      </div>
    </div>
  )
}

// ── Results ──
function ResultsView({ edit, editId, onTripChange, onEdit }: { edit: TravelEdit; editId: string; onTripChange: (updates: Partial<Trip>) => void; onEdit: (id: string) => void }) {
  const { destination: dest, trip } = edit
  const [editingDates, setEditingDates] = useState(false)
  const queryKey = tripParams(trip).toString() + (editId ? `&edit=${encodeURIComponent(editId)}` : '')
  const [shop, setShop] = useState<ShopState>({ payload: null, loading: true, error: '' })
  const [hero, setHero] = useState<UnsplashPhoto | null>(null)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false
    const timer = setTimeout(async () => {
      setShop(s => ({ ...s, loading: true, error: '' }))
      try {
        const res = await fetch(`/api/clothing?${queryKey}`, { signal: controller.signal })
        const json = await res.json()
        if (!res.ok || !Array.isArray(json.data?.needs)) throw new Error(json.error)
        if (!cancelled) setShop({ payload: json.data, loading: false, error: '' })
      } catch {
        if (!cancelled) setShop({ payload: null, loading: false, error: 'The shopping options didn’t load. Your list is complete above; refresh to try again.' })
      }
    }, 150)
    return () => { cancelled = true; clearTimeout(timer); controller.abort() }
  }, [queryKey])

  useEffect(() => {
    let cancelled = false
    fetchPhoto(`${dest.name} street architecture`, 'portrait').then(h => { if (!cancelled) setHero(h) })
    return () => { cancelled = true }
  }, [dest.name])

  useGSAP(() => {
    if (!heroRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.from('.r-title > *', { yPercent: 110, duration: 1, stagger: .08 })
      .from('.r-weather, .r-controls .r-control', { y: 16, autoAlpha: 0, duration: .7, stagger: .07 }, '-=.6')
      .from('.r-hero-img', { clipPath: 'inset(0 0 100% 0)', duration: 1.2 }, 0)
    gsap.to('.r-hero-img img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true } })
  }, { scope: heroRef })

  const weatherLine = edit.weather.low === null ? 'Weather to confirm closer to departure' : `${edit.weather.low}–${edit.weather.high}°C, ${edit.weather.kind === 'forecast' ? 'forecast' : 'typical for these dates'}`

  return (
    <main className="results">
      <header ref={heroRef} className="r-hero r-hero--compact">
        <div className="wrap r-hero-grid">
          <div className="r-hero-copy">
            <p className="kicker">{formatTripDates(trip.start, trip.end)} · {edit.packingPlan.days} {edit.packingPlan.days === 1 ? 'day' : 'days'}</p>
            <h1 className="r-title"><span className="r-line">What to wear in</span> <span className="r-line r-city">{dest.name}.</span></h1>
            <p className="r-weather">{weatherLine}.</p>
            <TripControls trip={trip} onChange={onTripChange} />
            <div className="r-actions">
              <a href="#shop" className="btn btn--rouge">See the {edit.packingPlan.total}-piece list</a>
              <button type="button" className="btn btn--line" aria-expanded={editingDates} onClick={() => setEditingDates(v => !v)}>Change dates</button>
              {ACCOUNTS_ENABLED && <SaveTripButton dest={dest} photo={hero?.urls.regular || null} />}
            </div>
            {editingDates && <div className="r-dates"><TripDates key={trip.start + trip.end} start={trip.start} end={trip.end} onApply={(start, end) => { onTripChange({ start, end }); setEditingDates(false) }} /></div>}
          </div>
          <figure className="r-hero-img">
            {hero ? <><img src={hero.urls.regular} alt={hero.alt_description || dest.name} /><PhotoCredit photo={hero} /></> : <div className="r-hero-fallback" aria-hidden><span className="emblem" /></div>}
          </figure>
        </div>
      </header>

      <ShopTheList key={trip.destination + trip.start + trip.end} edit={edit} shop={shop} />
      <BrandRibbon shop={shop} />
      <EditLooks edit={edit} shop={shop} onEdit={onEdit} />
      <TripWeatherPanel weather={edit.weather} />
    </main>
  )
}

function LoadingState({ name }: { name: string }) {
  return (
    <main className="results">
      <header className="r-hero r-hero--loading">
        <div className="wrap">
          <p className="kicker" role="status">Checking the weather and building your list</p>
          <h1 className="r-title">What to wear in <span className="r-city">{name}.</span></h1>
          <div className="skeleton" aria-hidden><span /><span /><span /></div>
        </div>
      </header>
    </main>
  )
}

function DestinationContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawSlug = Array.isArray(params.slug) ? params.slug[0] : (params.slug ?? '')
  const slug = decodeURIComponent(rawSlug)
  const staticDest = findDestination(slug)
  const name = staticDest?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const destination = searchParams.get('destination') || (staticDest ? `${staticDest.name}, ${staticDest.country}` : name)
  const start = searchParams.get('start') || '', end = searchParams.get('end') || ''
  const activity = searchParams.get('activity') || '', style = searchParams.get('style') || ''
  const wear = searchParams.get('wear') || 'unisex'
  const request = new URLSearchParams({ destination, start, end, activity, style, wear })
  let trip: Trip | null = null, validation = ''
  try { trip = parseTrip(request) } catch (error) { validation = error instanceof Error ? error.message : 'Choose your travel dates.' }
  const weatherKey = new URLSearchParams({ destination, start, end }).toString()
  const [result, setResult] = useState<{ key: string; edit?: TravelEdit; error?: string } | null>(null)
  const [retry, setRetry] = useState(0)
  const valid = Boolean(trip)

  useEffect(() => {
    if (!valid) return
    const controller = new AbortController()
    fetch(`/api/destinations?${weatherKey}`, { signal: controller.signal })
      .then(async r => { const json = await r.json(); if (!r.ok || !json.edit) throw new Error(json.error || 'Unable to prepare your travel edit.'); return json.edit as TravelEdit })
      .then(edit => { if (!controller.signal.aborted) setResult({ key: weatherKey, edit }) })
      .catch(() => { if (!controller.signal.aborted) setResult({ key: weatherKey, error: 'Your travel edit didn’t load. Check your connection and try again.' }) })
    return () => controller.abort()
  }, [valid, weatherKey, retry])

  // A new wardrobe, activity or style re-picks the edit; choosing an alternate edit keeps everything else.
  function updateTrip(updates: Partial<Trip>) { updateParams({ ...updates, edit: '' }) }
  function updateParams(updates: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString())
    next.set('destination', destination)
    for (const [key, value] of Object.entries(updates)) { if (value) next.set(key, value); else next.delete(key) }
    router.push(`/destinations/${encodeURIComponent(slug)}?${next}`, { scroll: false })
  }

  const current = result?.key === weatherKey ? result : null
  return <>
    <SiteNav solid />
    {!trip ? (
      <main className="results">
        <header className="r-hero">
          <div className="wrap r-ask">
            <p className="kicker">Your travel edit</p>
            <h1 className="r-title">When are you going to <span className="r-city">{name}?</span></h1>
            <p className="r-weather">{start || end ? validation : 'Add your dates and we’ll check the weather for exactly those days.'}</p>
            <TripDates key={start + end} start={start} end={end} onApply={(s, e) => updateTrip({ start: s, end: e, activity: '', style: '' })} />
            <p><Link className="link" href="/#plan">Choose a different destination</Link></p>
          </div>
        </header>
      </main>
    ) : current?.edit ? <ResultsView key={weatherKey} edit={buildTravelEdit(trip, current.edit.weather)} editId={searchParams.get('edit') || ''} onTripChange={updateTrip} onEdit={id => updateParams({ edit: id })} />
      : current?.error ? (
        <main className="results"><header className="r-hero"><div className="wrap r-ask">
          <h1 className="r-title">Your travel edit</h1>
          <p role="alert" className="r-weather">{current.error}</p>
          <div className="r-actions"><button className="btn" onClick={() => setRetry(n => n + 1)}>Try again</button><Link className="btn btn--line" href="/#plan">New search</Link></div>
        </div></header></main>
      ) : <LoadingState name={name} />}
    <SiteFooter photoCredit={Boolean(UNSPLASH_KEY)} />
  </>
}

export default function DestinationPage() {
  return <Suspense fallback={<p className="wrap" style={{ paddingTop: '8rem' }} role="status">Preparing your travel edit…</p>}><DestinationContent /></Suspense>
}
