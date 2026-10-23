'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useUser, SignInButton } from '@clerk/nextjs'
import { createClient } from '../../../lib/supabase'
import { findDestination, type Destination } from '../../../lib/destinations'
import { productsForNeed, type Product } from '../../../lib/product-catalogue'
import type { PackingKind, PackingNeed } from '../../../lib/packing'
import { parseTrip, tripParams, formatTripDates, type Trip } from '../../../lib/trip'
import { buildTravelEdit, type TravelEdit } from '../../../lib/travel-edit'
import { TripDates, TripRefinements, TripWeatherPanel } from './trip-controls'
import { SiteNav } from '../../../components/SiteNav'
import { SiteFooter } from '../../../components/SiteFooter'
import { ProductCard } from '../../../components/ProductCard'

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
const GROUPS: PackingNeed['group'][] = ['Clothing', 'Footwear', 'Accessories', 'Daily essentials']

function ShopTheList({ edit, items, loading, error }: { edit: TravelEdit; items: Product[]; loading: boolean; error: string }) {
  const [gender, setGender] = useState<'women' | 'men'>('women')
  const [selected, setSelected] = useState<PackingKind | null>(null)
  const [packed, setPacked] = useState<Record<string, boolean>>({})
  const plan = edit.packingPlan
  const optionsFor = (kind: PackingKind) => productsForNeed(items, kind, gender, plan, edit.trip.style)
  const current = plan.needs.find(n => n.id === selected) || plan.needs.find(n => optionsFor(n.id).length > 0) || plan.needs[0]
  const options = optionsFor(current.id)
  const done = plan.needs.filter(n => packed[n.id]).length
  const choose = (kind: PackingKind) => {
    setSelected(kind)
    if (window.innerWidth < 900) document.getElementById('shop-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="shop" className="shop" aria-labelledby="shop-title">
      <div className="wrap">
        <div className="shop-head">
          <div>
            <p className="kicker">Your list</p>
            <h2 id="shop-title" className="h2">What to pack for {edit.destination.name}.</h2>
            <p className="lede">{plan.note}</p>
          </div>
          <div className="shop-tools">
            <div className="seg" role="group" aria-label="Show pieces for">
              {(['women', 'men'] as const).map(g => <button key={g} aria-pressed={gender === g} onClick={() => setGender(g)}>{g === 'women' ? 'Womenswear' : 'Menswear'}</button>)}
            </div>
            <p className="shop-progress" role="status">{done} of {plan.needs.length} packed</p>
          </div>
        </div>

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
                      const count = optionsFor(need.id).length
                      const active = need.id === current.id
                      return (
                        <li key={need.id} className={`need${active ? ' is-active' : ''}${packed[need.id] ? ' is-packed' : ''}`}>
                          <input type="checkbox" id={`pk-${need.id}`} checked={!!packed[need.id]} onChange={e => setPacked(p => ({ ...p, [need.id]: e.target.checked }))} aria-label={`Already packed: ${need.title}`} />
                          <button type="button" className="need-btn" aria-pressed={active} onClick={() => choose(need.id)}>
                            <span className="need-title">{need.title}{need.optional && <span className="need-opt"> (optional)</span>}</span>
                            <span className="need-meta">&times;{need.quantity}{count ? `, ${count} to shop` : ''}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>

          <div id="shop-panel" className="shop-panel" tabIndex={-1} aria-live="polite">
            <h3 className="serif shop-panel-title">{current.title}</h3>
            <p className="shop-panel-why">{current.reason}</p>
            {loading ? <p role="status" className="shop-status">Finding the pieces…</p>
              : error ? <p role="status" className="shop-status">{error}</p>
              : options.length ? (
                <>
                  <div className="shop-products">
                    {options.map(p => <ProductCard key={p.id} product={p} destination={edit.destination.name} kind={current.id} />)}
                  </div>
                  {options.length < 3 && <p className="shop-foot">These are the verified matches we have for this piece so far.</p>}
                </>
              ) : (
                <p className="shop-status">We haven&apos;t verified a product for this one yet. Use the note above when you choose your own.</p>
              )}
            <p className="shop-foot">Prices are shown in each retailer&apos;s currency and were checked on {options[0]?.checkedAt || 'the review date'}. Confirm sizes, stock and delivery on the product page.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Results ──
function ResultsView({ edit, onTripChange }: { edit: TravelEdit; onTripChange: (updates: Partial<Trip>) => void }) {
  const { destination: dest, trip } = edit
  const [editingDates, setEditingDates] = useState(false)
  const queryKey = tripParams(trip).toString()
  const [items, setItems] = useState<Product[]>([])
  const [itemsLoading, setItemsLoading] = useState(true)
  const [itemsError, setItemsError] = useState('')
  const [hero, setHero] = useState<UnsplashPhoto | null>(null)
  const [lookPhotos, setLookPhotos] = useState<(UnsplashPhoto | null)[]>([null, null, null])

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false
    const timer = setTimeout(async () => {
      setItemsLoading(true); setItemsError('')
      try {
        const res = await fetch(`/api/clothing?${queryKey}`, { signal: controller.signal })
        const json = await res.json()
        if (!res.ok || !Array.isArray(json.data?.items)) throw new Error(json.error)
        if (!cancelled) setItems(json.data.items)
      } catch {
        if (!cancelled) { setItems([]); setItemsError('The shop list didn’t load. Your looks above are ready; refresh to try the list again.') }
      } finally { if (!cancelled) setItemsLoading(false) }
    }, 250)
    return () => { cancelled = true; clearTimeout(timer); controller.abort() }
  }, [queryKey])

  useEffect(() => {
    let cancelled = false
    const climate = edit.packingPlan.climate
    const mood = climate === 'cold' ? 'winter coat' : climate === 'hot' ? 'summer linen' : 'smart casual'
    Promise.all([
      fetchPhoto(`${dest.name} street architecture`, 'portrait'),
      fetchPhoto(`woman ${mood} outfit editorial portrait`),
      fetchPhoto(`woman evening ${mood} outfit editorial portrait`),
      fetchPhoto(`${mood} travel style editorial portrait`),
    ]).then(([h, a, b, c]) => { if (!cancelled) { setHero(h); setLookPhotos([a, b, c]) } })
    return () => { cancelled = true }
  }, [dest.name, edit.packingPlan.climate])

  const weatherLine = edit.weather.low === null ? 'Weather to confirm closer to departure' : `${edit.weather.low}–${edit.weather.high}°C, ${edit.weather.kind === 'forecast' ? 'forecast' : 'typical for these dates'}`

  return (
    <main className="results">
      <header className="r-hero">
        <div className="wrap r-hero-grid">
          <div className="r-hero-copy">
            <p className="kicker">{formatTripDates(trip.start, trip.end)}</p>
            <h1 className="r-title">What to wear in <span className="r-city">{dest.name}.</span></h1>
            <p className="r-weather">{weatherLine}{dest.country ? `. ${dest.country}` : ''}</p>
            <div className="r-actions">
              <a href="#shop" className="btn btn--rouge">Shop the list</a>
              <button type="button" className="btn btn--line" aria-expanded={editingDates} onClick={() => setEditingDates(v => !v)}>Change dates</button>
              <SaveTripButton dest={dest} photo={hero?.urls.regular || null} />
            </div>
            {editingDates && <div className="r-dates"><TripDates key={trip.start + trip.end} start={trip.start} end={trip.end} onApply={(start, end) => { onTripChange({ start, end }); setEditingDates(false) }} /></div>}
          </div>
          <figure className="r-hero-img">
            {hero ? <><img src={hero.urls.regular} alt={hero.alt_description || dest.name} /><PhotoCredit photo={hero} /></> : <div className="r-hero-fallback" aria-hidden><span className="emblem" /></div>}
          </figure>
        </div>
      </header>

      <TripWeatherPanel weather={edit.weather} />

      <section className="looks" aria-labelledby="looks-title">
        <div className="wrap">
          <p className="kicker">The looks</p>
          <h2 id="looks-title" className="h2">Three outfits that cover the trip.</h2>
          <div className="looks-grid">
            {edit.looks.map((look, i) => (
              <article key={look.title} className="look">
                {lookPhotos[i] && <figure className="look-img"><img src={lookPhotos[i]!.urls.regular} alt="" loading="lazy" /><PhotoCredit photo={lookPhotos[i]!} /></figure>}
                <h3 className="look-title">{look.title}</h3>
                <p className="look-desc">{look.desc}</p>
                <SaveLookButton dest={dest} title={look.title} desc={look.desc} photo={lookPhotos[i]?.urls.regular || null} />
              </article>
            ))}
          </div>
          {lookPhotos.some(Boolean) && <p className="shop-foot">Photos are mood references, not the items in your list.</p>}
        </div>
      </section>

      <div className="wrap"><TripRefinements trip={trip} onChange={(key, value) => onTripChange({ [key]: value })} /></div>

      <ShopTheList key={trip.destination + trip.start + trip.end} edit={edit} items={items} loading={itemsLoading} error={itemsError} />
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
  const request = new URLSearchParams({ destination, start, end, activity, style })
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

  function updateTrip(updates: Partial<Trip>) {
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
    ) : current?.edit ? <ResultsView key={weatherKey} edit={buildTravelEdit(trip, current.edit.weather)} onTripChange={updateTrip} />
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
