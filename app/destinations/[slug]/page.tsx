'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import { createClient } from '../../../lib/supabase'
import { destinations, findDestination, type Destination } from '../../../lib/destinations'
import type { Product } from '../../../lib/product-catalogue'
import { parseTrip, tripParams, formatTripDates, type Trip } from '../../../lib/trip'
import { buildTravelEdit, type TravelEdit } from '../../../lib/travel-edit'
import { TripDates, TripRefinements, TripWeatherPanel } from './trip-controls'

// ─────────────────────────────────────────────────────────────
// UNSPLASH
// ─────────────────────────────────────────────────────────────
const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || ''

type UnsplashPhoto = {
  id: string
  urls: { regular: string; small: string }
  alt_description: string
  user: { name: string }
  links: { html: string }
}

async function fetchPhoto(query: string, orientation: 'landscape' | 'portrait' = 'landscape', collections?: string): Promise<UnsplashPhoto | null> {
  if (!UNSPLASH_KEY) return null
  try {
    const params = new URLSearchParams({
      query,
      per_page: '3',
      orientation,
      content_filter: 'high',
    })
    if (collections) params.set('collections', collections)
    const res = await fetch(
      `https://api.unsplash.com/search/photos?${params.toString()}`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    )
    const data = await res.json()
    return data.results?.[0] || null
  } catch { return null }
}

function UnsplashCredit({ photo, dark = false }: { photo: UnsplashPhoto; dark?: boolean }) {
  return (
    <a
      href={`${photo.links.html}?utm_source=parche&utm_medium=referral`}
      target="_blank"
      rel="noopener noreferrer"
      className={`photo-credit${dark ? ' dark' : ''}`}
    >
      {photo.user.name} / Unsplash
    </a>
  )
}

// ─────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────
function Nav() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const { isSignedIn, isLoaded } = useUser()
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <nav className={`r-nav${scrolled ? ' scrolled' : ''}`}>
      <Link href="/" className="nav-logo"><span className="logo-text">parche</span></Link>
      <ul className="nav-links">
        <li><Link href="/#destinations">Destinations</Link></li>
        <li><Link href="/#trending">Trending</Link></li>
        <li><Link href="/#guides">Style Guides</Link></li>
      </ul>
      <div className="nav-right">
        <button className="btn-ghost" onClick={() => router.back()}>← Back</button>
        {isLoaded && isSignedIn && (
          <Link href="/dashboard" className="btn-ghost">My wardrobe</Link>
        )}
        {isLoaded && !isSignedIn && (
          <SignInButton mode="modal">
            <button className="btn-ghost">Sign in</button>
          </SignInButton>
        )}
        {isLoaded && isSignedIn
          ? <UserButton />
          : <Link href="/" className="btn-primary">New search</Link>
        }
      </div>
    </nav>
  )
}

// ─────────────────────────────────────────────────────────────
// LOADING
// ─────────────────────────────────────────────────────────────
function LoadingSkeleton({ name }: { name: string }) {
  return (
    <div className="loading-page">
      <div className="loading-hero">
        <div className="loading-hero-bg" />
        <div className="loading-hero-content">
          <p className="loading-eyebrow">Building your style guide for</p>
          <h1 className="loading-name">
            {name}
            <span className="loading-dots"><span /><span /><span /></span>
          </h1>
          <p className="loading-sub">Checking local weather · Cultural dress codes · Best styles for your trip</p>
        </div>
      </div>
      <div className="loading-body">
        {[0,1,2].map(i => <div key={i} className="skeleton-block" style={{ animationDelay: `${i*0.15}s` }} />)}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// WEATHER WIDGET
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// PACKING CHECKLIST
// ─────────────────────────────────────────────────────────────
type CheckCat = { label: string; icon: string; items: string[] }

function buildChecklist(dest: Destination): CheckCat[] {
  const tags    = dest.tags.map(t => t.toLowerCase())
  const isBeach = tags.some(t => ['beach','tropical','resort','island'].includes(t))
  const isCold  = parseInt(dest.temp) < 10
  const isModest= tags.some(t => ['modest','cultural','desert'].includes(t))
  const isCity  = tags.some(t => ['city','street','minimal','layers'].includes(t))

  if (isBeach) return [
    { label: 'Clothing',    icon: '👗', items: ['Swimsuit or bikini', 'Linen cover-up or sarong', 'Light sundress × 2', 'Linen shorts or wide-leg trousers', 'Casual tank tops × 3'] },
    { label: 'Footwear',   icon: '👡', items: ['Sandals or flip flops', 'Espadrilles for evenings', 'Water shoes (optional)'] },
    { label: 'Accessories',icon: '🕶', items: ['Wide-brim sun hat', 'Polarized sunglasses', 'Lightweight tote bag', 'Waterproof watch'] },
    { label: 'Essentials', icon: '✈️', items: ['SPF 50 sunscreen', 'Reef-safe sunscreen', 'Insect repellent', 'Reusable water bottle', 'Portable fan'] },
  ]
  if (isCold) return [
    { label: 'Clothing',    icon: '🧥', items: ['Warm coat or parka', 'Wool or fleece mid-layer', 'Thermal base layers × 2', 'Warm trousers', 'Knitwear × 2', 'Smart shirt or blouse'] },
    { label: 'Footwear',   icon: '👢', items: ['Insulated waterproof boots', 'Thick socks × 4 pairs', 'Sneakers for indoors'] },
    { label: 'Accessories',icon: '🧣', items: ['Warm hat or beanie', 'Scarf or snood', 'Waterproof gloves', 'Backpack'] },
    { label: 'Essentials', icon: '✈️', items: ['Lip balm', 'Hand cream', 'Hand warmers', 'Portable charger', 'Travel adapter'] },
  ]
  if (isModest) return [
    { label: 'Clothing',    icon: '👗', items: ['Lightweight maxi dress', 'Loose linen trousers', 'Long-sleeve linen shirt', 'Light cardigan or blazer', 'Scarf (doubles as cover-up)'] },
    { label: 'Footwear',   icon: '👟', items: ['Flat sandals or loafers', 'Comfortable walking shoes'] },
    { label: 'Accessories',icon: '👜', items: ['Lightweight scarf', 'Crossbody bag', 'Sunglasses', 'Sun hat'] },
    { label: 'Essentials', icon: '✈️', items: ['SPF 30 sunscreen', 'Reusable water bottle', 'Wet wipes', 'Small first aid kit'] },
  ]
  return [
    { label: 'Clothing',    icon: '👕', items: ['Smart-casual trousers or quality jeans', 'Versatile shirt or blouse × 2', 'Light jacket or blazer', 'One elevated dinner outfit', 'Comfortable everyday layer × 2'] },
    { label: 'Footwear',   icon: '👟', items: ['Clean walking sneakers', 'Loafers or ankle boots for evenings'] },
    { label: 'Accessories',icon: '🎒', items: ['Quality daypack or tote', 'Crossbody bag for evenings', 'Sunglasses', 'Compact umbrella'] },
    { label: 'Essentials', icon: '✈️', items: ['Portable charger', 'Reusable water bottle', 'Travel adapter', 'Hand sanitiser'] },
  ]
}

function PackingChecklist({ dest }: { dest: Destination }) {
  const cats   = buildChecklist(dest)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const total  = cats.reduce((s, c) => s + c.items.length, 0)
  const done   = Object.values(checked).filter(Boolean).length
  const pct    = total ? Math.round((done / total) * 100) : 0

  function toggle(k: string) { setChecked(p => ({ ...p, [k]: !p[k] })) }

  return (
    <div className="checklist-wrap">
      <div className="checklist-head">
        <div>
          <p className="section-eyebrow">Packing checklist</p>
          <h2 className="checklist-title">What to pack for {dest.name}</h2>
        </div>
        <div className="progress-wrap">
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
          <p className="progress-label">{done} / {total} packed</p>
          {done > 0 && <button className="checklist-reset" onClick={() => setChecked({})}>Reset</button>}
        </div>
      </div>
      <div className="checklist-grid">
        {cats.map(cat => (
          <div key={cat.label} className="check-cat">
            <p className="check-cat-label">{cat.icon} {cat.label}</p>
            <ul>
              {cat.items.map(item => {
                const k = `${cat.label}-${item}`
                const done = checked[k]
                return (
                  <li key={k} className={`check-item${done ? ' done' : ''}`} onClick={() => toggle(k)}>
                    <span className="check-box">{done ? '✓' : ''}</span>
                    <span className="check-text">{item}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MORE DESTINATIONS
// ─────────────────────────────────────────────────────────────
function MoreDestinations({ current }: { current: string }) {
  const dests = destinations.filter(d => d.slug !== current).slice(0, 4)
  const [photos, setPhotos] = useState<(UnsplashPhoto | null)[]>(dests.map(() => null))

  useEffect(() => {
    Promise.all(
      dests.map(d => fetchPhoto(`woman ${d.name} fashion travel style editorial`, 'portrait'))
    ).then(setPhotos)
  }, [current])

  return (
    <div className="more-grid">
      {dests.map((d, i) => (
        <a key={d.slug} href={`/destinations/${d.slug}`} className="more-card">
          <div className="more-img">
            {photos[i]?.urls?.regular
              ? <img src={photos[i]!.urls.regular} alt={d.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} />
              : <div className={`more-img-placeholder ${d.bgClass}`} />
            }
          </div>
          <div className="more-body">
            <p className="more-name">{d.name}</p>
            <p className="more-meta">{d.country} · {d.temp}</p>
          </div>
        </a>
      ))}
    </div>
  )
}


// ─────────────────────────────────────────────────────────────
// SAVE TRIP BUTTON
// ─────────────────────────────────────────────────────────────
function SaveTripButton({ dest, heroPhoto }: { dest: Destination; heroPhoto: string | null }) {
  const { isSignedIn, user } = useUser()
  const supabase = createClient()
  const [saved, setSaved]     = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isSignedIn || !user) return
    supabase
      .from('saved_trips')
      .select('id')
      .eq('user_id', user.id)
      .eq('destination_slug', dest.slug)
      .single()
      .then(({ data }: { data: { id: string } | null }) => { if (data) setSaved(true) })
  }, [isSignedIn, user, dest.slug])

  async function toggle() {
    if (!isSignedIn || !user) return
    setLoading(true)
    if (saved) {
      await supabase.from('saved_trips').delete()
        .eq('user_id', user.id).eq('destination_slug', dest.slug)
      setSaved(false)
    } else {
      await supabase.from('saved_trips').upsert({
        user_id: user.id,
        destination_slug: dest.slug,
        destination_name: dest.name,
        destination_country: dest.country,
        destination_temp: dest.temp,
        photo_url: heroPhoto,
      })
      setSaved(true)
    }
    setLoading(false)
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="save-trip-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          Save trip
        </button>
      </SignInButton>
    )
  }

  return (
    <button className={`save-trip-btn${saved ? ' saved' : ''}`} onClick={toggle} disabled={loading}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      {saved ? 'Saved' : 'Save trip'}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// SAVE LOOK BUTTON
// ─────────────────────────────────────────────────────────────
function SaveLookButton({ dest, title, desc, photoUrl }: { dest: Destination; title: string; desc: string; photoUrl: string | null }) {
  const { isSignedIn, user } = useUser()
  const supabase = createClient()
  const [saved, setSaved]     = useState(false)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!isSignedIn || !user) return
    setLoading(true)
    if (saved) {
      await supabase.from('saved_looks').delete()
        .eq('user_id', user.id).eq('destination_slug', dest.slug).eq('look_title', title)
      setSaved(false)
    } else {
      await supabase.from('saved_looks').insert({
        user_id: user.id,
        destination_slug: dest.slug,
        destination_name: dest.name,
        look_title: title,
        look_desc: desc,
        photo_url: photoUrl,
      })
      setSaved(true)
    }
    setLoading(false)
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="save-look-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          Save look
        </button>
      </SignInButton>
    )
  }

  return (
    <button className={`save-look-btn${saved ? ' saved' : ''}`} onClick={toggle} disabled={loading}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      {saved ? 'Saved' : 'Save look'}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// CLOTHING GRID
// ─────────────────────────────────────────────────────────────
function ClothingCard({ item }: { item: Product }) {
  const [failed, setFailed] = useState(false)
  return <article className="clothing-card">
    <div className="clothing-img">
      {failed ? <p className="product-image-missing">Photo unavailable · view the item at {item.brand}</p>
        : <img src={item.imageUrl} alt={`${item.brand} ${item.name}`} loading="lazy" onError={() => setFailed(true)} />}
    </div>
    <div className="clothing-body">
      <p className="product-tier">{item.tier}</p>
      <p className="clothing-brand">{item.brand}</p>
      <h3 className="clothing-name">{item.name}</h3>
      <p className="product-price">{item.currency} {item.price.toFixed(2)}</p>
      <p className="clothing-why">{item.details}</p>
      <p className="product-checked">Price checked {item.checkedAt}. Confirm sizes, shipping and current price with the retailer.</p>
      <a className="product-link" href={item.productUrl} target="_blank" rel="noopener noreferrer">View exact item at {item.brand} ↗</a>
    </div>
  </article>
}

function ClothingGrid({ edit, items, loading }: { edit: TravelEdit; items: Product[]; loading: boolean }) {
  const [gender, setGender] = useState<'women' | 'men'>('women')
  const cold = edit.weather.low !== null && edit.weather.low < 8
  const context = cold ? 'An indoor or layering piece; add the warm layers in your packing edit for outdoor days.'
    : edit.trip.activity === 'active' ? 'For travel days and downtime. Choose activity-specific clothing for your adventures.'
    : 'Wear with the trousers in your travel edit, and add a removable layer for cooler moments.'
  return <section className="clothing-section" aria-label="Shop your travel edit">
    <div className="clothing-header"><p className="section-eyebrow">One essential · three ways</p>
      <h2 className="clothing-title">The everyday tee</h2>
      <p className="product-intro">A starting piece for {edit.destination.name}. {context}</p>
      <p className="product-intro">Our first selection covers cotton tees. More wardrobe essentials are being added.</p>
    </div>
    <div className="clothing-gender-tabs" role="group" aria-label="Product selection">
      {(['women', 'men'] as const).map(g => <button key={g} className={`gender-tab${gender === g ? ' active' : ''}`} aria-pressed={gender === g} onClick={() => setGender(g)}>{g === 'women' ? "Women's" : "Men's"}</button>)}
    </div>
    {loading ? <p role="status">Loading the selection…</p> : <div className="product-options">
      {(['High-end', 'Quality', 'Budget'] as const).map(tier => {
        const item = items.find(p => p.gender === gender && p.tier === tier)
        return item ? <ClothingCard key={item.id} item={item} /> : <article className="product-unavailable" key={tier}><h3>{tier}</h3><p>We are reviewing an option for this tier. Check back soon.</p></article>
      })}
    </div>}
    <p className="product-footnote">Prices use each retailer’s listed currency. Taxes and delivery may be extra. These are direct retailer links; affiliate commissions are not enabled yet.</p>
  </section>
}

// ─────────────────────────────────────────────────────────────
// RESULTS VIEW
// ─────────────────────────────────────────────────────────────
function ResultsView({ edit, onTripChange }: { edit: TravelEdit; onTripChange: (updates: Partial<Trip>) => void }) {
  const { destination: dest, trip } = edit
  const [editingDates, setEditingDates] = useState(false)
  const queryKey = tripParams(trip).toString()
  const [clothingError, setClothingError] = useState('')
  const [heroPhoto,      setHeroPhoto]      = useState<UnsplashPhoto | null>(null)
  const [stylePhotos,    setStylePhotos]    = useState<(UnsplashPhoto | null)[]>([null, null, null])
  const [clothingItems,  setClothingItems]  = useState<Product[]>([])
  const [clothingLoading, setClothingLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false
    async function loadClothing() {
      setClothingLoading(true)
      setClothingError('')
      try {
        const res = await fetch(`/api/clothing?${queryKey}`, { signal: controller.signal })
        const json = await res.json()
        if (!res.ok || !Array.isArray(json.data?.items)) throw new Error(json.error || 'Unable to load clothing suggestions.')
        if (!cancelled) setClothingItems(json.data.items)
      } catch {
        if (!cancelled) { setClothingItems([]); setClothingError('Clothing suggestions are temporarily unavailable. Your travel looks are ready above.') }
      } finally { if (!cancelled) setClothingLoading(false) }
    }
    const timer = setTimeout(loadClothing, 300)
    return () => { cancelled = true; clearTimeout(timer); controller.abort() }
  }, [queryKey])

  useEffect(() => {
    let cancelled = false
    async function load() {
      // Derive climate context from tags and temp for smarter photo queries
      const tags = (findDestination(dest.slug)?.tags || []).map((t: string) => t.toLowerCase())
      const tempStr = dest.temp || ''
      const tempNum = Number.isFinite(parseFloat(tempStr)) ? parseFloat(tempStr) : 20
      const isCold = tempNum < 10
      const isBeach = tempNum >= 22 && tags.some((t: string) => ['beach','tropical','resort','island'].includes(t))
      const isModest  = tags.some((t: string) => ['modest','cultural','desert'].includes(t))
      const isBoho    = !isCold && tags.some((t: string) => ['boho','bohemian'].includes(t))
      const isCity    = tags.some((t: string) => ['city','street','minimal'].includes(t))
      const isWarm    = tempNum >= 22

      // Climate-based queries — no city name to avoid documentary results
      const heroQuery  = `${dest.name} ${isBeach ? 'beach' : isCity ? 'city' : 'travel'} fashion editorial`
      const style1     = isBeach   ? 'woman beach resort fashion model sundress editorial portrait'
                       : isCold    ? 'woman winter coat fashion model city editorial portrait'
                       : isModest  ? 'woman elegant linen dress modest fashion model editorial portrait'
                       : isWarm    ? 'woman summer fashion model outfit editorial portrait'
                       : 'woman casual city fashion model outfit editorial portrait'
      const style2     = isBeach   ? 'woman evening beach resort fashion model dress editorial portrait'
                       : isCold    ? 'woman elegant winter fashion evening outfit model portrait'
                       : isModest  ? 'woman evening elegant maxi dress fashion editorial portrait'
                       : isWarm    ? 'woman evening summer fashion outfit model editorial portrait'
                       : 'woman smart casual evening fashion outfit model portrait'
      const style3     = isBoho    ? 'woman boho fashion style relaxed outfit editorial portrait'
                       : isBeach   ? 'woman local beach fashion relaxed linen editorial portrait'
                       : isCold    ? 'woman layered winter street fashion editorial portrait'
                       : isModest  ? 'woman modest fashion elegant editorial portrait'
                       : 'woman fashion street style editorial portrait'

      const [hero, s1, s2, s3] = await Promise.all([
        fetchPhoto(heroQuery, 'landscape'),
        fetchPhoto(style1, 'portrait'),
        fetchPhoto(style2, 'portrait'),
        fetchPhoto(style3, 'portrait'),
      ])
      if (!cancelled) { setHeroPhoto(hero); setStylePhotos([s1, s2, s3]) }
    }
    load()
    return () => { cancelled = true }
  }, [dest.name, dest.temp, dest.slug])

  const styleCards = edit.looks

  return (
    <div className="results-page">

      {/* HERO */}
      <div className="dest-hero">
        {heroPhoto
          ? <img className="dest-hero-img" src={heroPhoto.urls.regular} alt={`${dest.name} style`} />
          : <div className={`dest-hero-placeholder ${dest.bgClass}`} />
        }
        <div className="dest-hero-overlay" />
        <div className="dest-hero-content">
          <p className="dest-eyebrow">
            {dest.country} · {dest.region}

          </p>
          <h1 className="dest-title">
            What to wear in<br />
            <em className="display">{dest.name}</em>
          </h1>
          <p className="trip-date-label">{formatTripDates(trip.start, trip.end)}</p>
          <button type="button" className="trip-edit-dates" aria-expanded={editingDates} onClick={() => setEditingDates(!editingDates)}>Change dates</button>
          <div className="dest-pills">
            <span className="dest-pill">{dest.temp}</span>
            <span className="dest-pill">{dest.weather}</span>
            <span className="dest-pill">{dest.type}</span>
          </div>
          <div style={{ marginTop: '1.2rem' }}>
            <SaveTripButton dest={dest} heroPhoto={heroPhoto?.urls?.regular || null} />
          </div>
        </div>
        {heroPhoto && <UnsplashCredit photo={heroPhoto} dark />}
      </div>

      {/* WEATHER */}
      {editingDates && <div className="trip-date-editor"><TripDates key={trip.start + trip.end} start={trip.start} end={trip.end} onApply={(start, end) => { onTripChange({ start, end }); setEditingDates(false) }} /></div>}
      <TripWeatherPanel weather={edit.weather} />

      {/* STYLE GUIDE */}
      <section className="style-section">
        <p className="section-eyebrow">Style guide</p>
        <h2 className="style-title">
          Dressing for <em className="display">{dest.name}</em>
        </h2>
        <p className="product-footnote">Outfit inspiration · photos do not depict the shop items below.</p>
        <p className="trip-edit-summary">{dest.guide.split("For " + dest.name)[0]}</p>
        <div className="style-grid">
          {styleCards.map((card, i) => (
            <div key={i} className="style-card">
              <div className="style-img">
                {stylePhotos[i]
                  ? <>
                      <img src={stylePhotos[i]!.urls.regular} alt={card.title} loading="lazy" />
                      <UnsplashCredit photo={stylePhotos[i]!} />
                    </>
                  : <div className="style-placeholder" />
                }
              </div>
              <div className="style-body">
                <p className="style-card-title">{card.title}</p>
                <p className="style-card-desc">{card.desc}</p>
                <div style={{ marginTop: '0.8rem' }}>
                  <SaveLookButton
                    dest={dest}
                    title={card.title}
                    desc={card.desc}
                    photoUrl={stylePhotos[i]?.urls?.regular || null}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <TripRefinements trip={trip} onChange={(key, value) => onTripChange({ [key]: value })} />
      <p className="trip-update-status" role="status" aria-live="polite">{trip.activity || trip.style ? 'Your looks reflect your choices.' : 'Your travel edit is ready. Refine it whenever you like.'}</p>
      <details className="trip-packing"><summary>Your packing essentials</summary><ul>{edit.packing.map(item => <li key={item}>{item}</li>)}</ul></details>

      {/* CLOTHING RECOMMENDATIONS */}
      {clothingError ? <p className="trip-clothing-error" role="status">{clothingError}</p> : <ClothingGrid edit={edit} items={clothingItems} loading={clothingLoading} />}

      {/* TAGS + KEFFY CTA */}
      <section className="cta-section">
        <div className="dest-tags">
          {dest.tags.map(t => <span key={t} className="dest-tag">{t}</span>)}
        </div>

      </section>

      {/* MORE DESTINATIONS */}
      <section className="more-section">
        <p className="section-eyebrow">More destinations</p>
        <MoreDestinations current={dest.slug} />
      </section>

      <footer className="r-footer">
        <div className="r-footer-inner">
          <p>© 2026 parche.</p>
          <p>Photos from <a href="https://unsplash.com?utm_source=parche&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a></p>
        </div>
      </footer>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────
function ErrorState({ name }: { name: string }) {
  return (
    <div style={{ paddingTop: '8rem', padding: '10rem 3rem 4rem', maxWidth: 600, margin: '0 auto' }}>
      <p className="section-eyebrow">Not yet covered</p>
      <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 200, marginBottom: '1rem' }}>
        No guide for <em className="display" style={{ color: 'var(--sand)' }}>{name}</em> yet.
      </h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: '1.5rem' }}>We&apos;re adding new destinations every week. Try one of these:</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
        {destinations.slice(0, 6).map(d => (
          <a key={d.slug} href={`/destinations/${d.slug}`} className="suggestion-chip">{d.name}</a>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="btn-primary-dark" onClick={() => window.location.reload()}>Try again</button>
        <Link href="/" style={{ fontSize: '0.88rem', color: 'var(--mid)', textDecoration: 'none' }}>← New search</Link>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────
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
      .catch(() => { if (!controller.signal.aborted) setResult({ key: weatherKey, error: 'We could not load your travel edit. Please try again.' }) })
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
    <Nav />
    {!trip ? <main className="trip-start">
      <p className="section-eyebrow">Your travel edit</p><h1>When are you going to {name}?</h1>
      <p>{validation}</p>
      <TripDates key={start + end} start={start} end={end} onApply={(s, e) => updateTrip({ start: s, end: e, activity: '', style: '' })} />
      <Link href="/">Choose a different destination</Link>
    </main> : current?.edit ? <ResultsView key={weatherKey} edit={buildTravelEdit(trip, current.edit.weather)} onTripChange={updateTrip} />
      : current?.error ? <main className="trip-start"><h1>Your travel edit</h1><p role="alert">{current.error}</p><button className="btn-primary" onClick={() => setRetry(n => n + 1)}>Try again</button><Link href="/">New search</Link></main>
      : <LoadingSkeleton name={name} />}
    <style>{css}</style>
  </>
}

export default function DestinationPage() {
  return <Suspense fallback={<p className="trip-start" role="status">Preparing your travel edit…</p>}><DestinationContent /></Suspense>
}

const css = `
.product-options { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1.5rem; }
.product-options .clothing-img img { object-fit:contain; }
.product-options .clothing-card { display:flex; flex-direction:column; }
.product-options .clothing-body { flex:1; display:flex; flex-direction:column; gap:.6rem; padding:1.4rem; }
.product-tier { font-size:.75rem; text-transform:uppercase; letter-spacing:.16em; font-weight:600; }
.product-price { font-size:1.2rem; }
.product-intro { max-width:760px; line-height:1.7; margin-top:1rem; color:var(--mid); }
.product-checked,.product-footnote { font-size:.75rem; line-height:1.6; color:var(--mid); }
.product-footnote { margin:1.5rem 0; }
.product-link { display:flex; align-items:center; min-height:44px; margin-top:auto; padding:.7rem 0; color:var(--black); text-underline-offset:4px; }
.product-image-missing,.product-unavailable { padding:2rem; line-height:1.7; }
.clothing-gender-tabs .gender-tab { min-height:44px; }
.product-link:focus-visible,.gender-tab:focus-visible { outline:2px solid var(--black); outline-offset:4px; }
@media(max-width:640px) { .product-options { grid-template-columns:1fr; } }

.display { font-family:'Playfair Display',serif; font-style:italic; font-weight:400; }
.section-eyebrow {
  font-size:0.58rem; letter-spacing:0.35em; text-transform:uppercase; color:var(--sand);
  display:flex; align-items:center; gap:0.6rem; margin-bottom:0.6rem;
}
.section-eyebrow::before { content:''; width:1.4rem; height:1px; background:var(--sand); flex-shrink:0; }

/* NAV */
.r-nav {
  position:fixed; top:0; left:0; right:0; z-index:500;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 3rem; height:72px; background:transparent; transition:background 0.4s, height 0.3s;
}
.r-nav.scrolled { background:rgba(255,255,255,0.97); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); height:64px; }
.r-nav.scrolled .logo-text { color:var(--black); }
.r-nav.scrolled .nav-links a { color:var(--char); }
.r-nav.scrolled .btn-ghost { color:var(--mid); }
.r-nav.scrolled .btn-primary { background:var(--black); color:var(--white); }
.nav-logo { display:flex; align-items:center; text-decoration:none; }
.logo-text { font-family:var(--font-body); font-size:1.85rem; font-weight:300; letter-spacing:-0.04em; color:var(--white); line-height:1; transition:color 0.4s; }
.nav-links { display:flex; gap:2.5rem; list-style:none; }
.nav-links a { color:rgba(255,255,255,0.75); text-decoration:none; font-size:0.9rem; font-weight:400; transition:color 0.2s; }
.nav-links a:hover { color:var(--white); }
.nav-right { display:flex; align-items:center; gap:1rem; }
.btn-ghost { color:rgba(255,255,255,0.75); font-size:0.88rem; background:none; border:none; cursor:pointer; font-family:var(--font-body); transition:color 0.2s; }
.btn-ghost:hover { color:var(--white); }
.btn-primary { background:var(--white); color:var(--black); padding:0.65rem 1.6rem; border-radius:100px; font-size:0.88rem; font-weight:500; text-decoration:none; display:inline-block; border:none; cursor:pointer; font-family:var(--font-body); transition:all 0.2s; }
.btn-primary:hover { background:var(--off); }
.btn-primary-dark { background:var(--black); color:var(--white); padding:0.65rem 1.6rem; border-radius:100px; font-size:0.88rem; font-weight:500; border:none; cursor:pointer; font-family:var(--font-body); transition:background 0.2s; }
.btn-primary-dark:hover { background:var(--char); }

/* HERO */
.dest-hero { position:relative; width:100%; height:92vh; min-height:580px; overflow:hidden; display:flex; align-items:flex-end; }
.dest-hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center; }
.dest-hero-placeholder { position:absolute; inset:0; background:linear-gradient(160deg, #1c1c1c 0%, #2e2e2e 100%); }
.dest-hero-overlay { position:absolute; inset:0; background:linear-gradient(to bottom, rgba(5,5,5,0.5) 0%, transparent 30%, transparent 55%, rgba(5,5,5,0.88) 100%); z-index:1; }
.dest-hero-content { position:relative; z-index:2; padding:0 4rem 4rem; width:100%; }
.dest-eyebrow { font-size:0.65rem; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.5); margin-bottom:1rem; display:flex; align-items:center; gap:0.8rem; }
.ai-tag { background:var(--sand); color:var(--black); font-size:0.52rem; padding:0.15rem 0.6rem; border-radius:100px; font-weight:600; letter-spacing:0.12em; }
.dest-title { font-size:clamp(3.2rem,7vw,6.5rem); font-weight:200; letter-spacing:-0.03em; color:var(--white); line-height:0.92; margin-bottom:1.5rem; }
.dest-title em { color:var(--sand); }
.dest-pills { display:flex; gap:0.5rem; flex-wrap:wrap; }
.dest-pill { font-size:0.68rem; padding:0.35rem 1rem; border-radius:100px; border:1px solid rgba(255,255,255,0.18); color:rgba(255,255,255,0.65); background:rgba(255,255,255,0.07); backdrop-filter:blur(8px); }
.photo-credit { position:absolute; bottom:0.8rem; right:1rem; z-index:3; font-size:0.5rem; color:rgba(255,255,255,0.2); text-decoration:none; }
.photo-credit:hover { color:rgba(255,255,255,0.4); }
.photo-credit.dark { position:absolute; bottom:0.5rem; right:0.5rem; font-size:0.48rem; background:rgba(0,0,0,0.3); padding:0.15rem 0.4rem; border-radius:3px; }

/* WEATHER */
.wx-band { background:var(--black); padding:1.8rem 4rem; }
.wx-wrap { display:flex; align-items:center; gap:3rem; flex-wrap:wrap; }
.wx-label { font-size:0.55rem; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.25); flex-shrink:0; }
.wx-days { display:flex; gap:4px; }
.wx-day { text-align:center; padding:0.55rem 0.75rem; border:1px solid rgba(255,255,255,0.07); border-radius:8px; min-width:50px; }
.wx-day.now { border-color:var(--sand); }
.wx-icon { display:block; font-size:1rem; margin-bottom:0.25rem; }
.wx-temp { display:block; font-size:0.9rem; font-weight:400; color:var(--white); margin-bottom:0.15rem; }
.wx-dl { font-size:0.52rem; color:rgba(255,255,255,0.28); }
.wx-day.now .wx-dl { color:var(--sand); }
.wx-pills { display:flex; gap:0.4rem; flex-wrap:wrap; }
.wx-pill { font-size:0.62rem; padding:0.28rem 0.75rem; border-radius:100px; border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.4); }

/* STYLE GUIDE */
.style-section { padding:6rem 4rem; background:var(--white); max-width:100%; }
.style-title { font-size:clamp(2rem,4vw,3.2rem); font-weight:200; letter-spacing:-0.02em; color:var(--black); line-height:1.05; margin-bottom:3rem; }
.style-title em { color:var(--sand); }
.style-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.style-card { border-radius:16px; overflow:hidden; border:1px solid var(--border); background:var(--white); transition:transform 0.35s, box-shadow 0.35s; }
.style-card:hover { transform:translateY(-4px); box-shadow:0 16px 48px rgba(10,10,10,0.1); }
.style-img { width:100%; aspect-ratio:3/4; position:relative; overflow:hidden; background:var(--off); }
.style-img img { width:100%; height:100%; object-fit:cover; transition:transform 0.7s; }
.style-card:hover .style-img img { transform:scale(1.04); }
.style-placeholder { width:100%; height:100%; background:linear-gradient(175deg,#ece8e0,#d8d2c8); }
.style-body { padding:1.4rem; }
.style-card-title { font-size:1rem; font-weight:500; margin-bottom:0.6rem; letter-spacing:-0.01em; line-height:1.2; }
.style-card-desc { font-size:0.78rem; color:var(--mid); line-height:1.8; }

/* CHECKLIST */
.checklist-section { padding:6rem 4rem; background:var(--off); }
.checklist-wrap { max-width:1200px; margin:0 auto; }
.checklist-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2.5rem; gap:2rem; flex-wrap:wrap; }
.checklist-title { font-size:clamp(1.8rem,3.5vw,2.8rem); font-weight:200; letter-spacing:-0.02em; margin-top:0.3rem; }
.progress-wrap { text-align:right; flex-shrink:0; }
.progress-bar { width:180px; height:3px; background:var(--mist); border-radius:2px; overflow:hidden; margin-bottom:0.4rem; }
.progress-fill { height:100%; background:var(--sand); transition:width 0.4s ease; }
.progress-label { font-size:0.65rem; color:var(--mid); }
.checklist-reset { font-size:0.6rem; color:var(--light); background:none; border:none; cursor:pointer; text-decoration:underline; margin-top:0.3rem; font-family:var(--font-body); display:block; margin-left:auto; }
.checklist-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.5rem; }
.check-cat { background:var(--white); border-radius:14px; padding:1.4rem; border:1px solid var(--border); }
.check-cat-label { font-size:0.62rem; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; color:var(--black); margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid var(--border); }
.check-cat ul { list-style:none; }
.check-item { display:flex; align-items:flex-start; gap:0.6rem; padding:0.45rem 0; cursor:pointer; border-bottom:1px solid var(--border); transition:opacity 0.2s; }
.check-item:last-child { border-bottom:none; }
.check-item.done { opacity:0.4; }
.check-item.done .check-text { text-decoration:line-through; }
.check-box { width:16px; height:16px; border:1.5px solid var(--border-s); border-radius:4px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:0.6rem; margin-top:1px; transition:all 0.15s; color:var(--white); }
.check-item.done .check-box { background:var(--black); border-color:var(--black); }
.check-text { font-size:0.75rem; color:var(--char); line-height:1.4; }

/* CTA + TAGS */
.cta-section { padding:4rem; background:var(--white); border-top:1px solid var(--border); }
.dest-tags { display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:2.5rem; }
.dest-tag { font-size:0.62rem; padding:0.35rem 1rem; border-radius:100px; border:1px solid var(--border-s); color:var(--char); background:var(--off); letter-spacing:0.05em; }






/* MORE */
.more-section { padding:5rem 4rem; background:var(--off); }
.more-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-top:1.5rem; }
.more-card { border-radius:14px; overflow:hidden; text-decoration:none; border:1px solid var(--border); background:var(--white); transition:transform 0.3s, box-shadow 0.3s; }
.more-card:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(10,10,10,0.08); }
.more-img { width:100%; aspect-ratio:4/3; overflow:hidden; position:relative; }
.more-img img { width:100%; height:100%; object-fit:cover; transition:transform 0.6s ease; }
.more-card:hover .more-img img { transform:scale(1.04); }
.more-img-placeholder { width:100%; height:100%; }
.more-body { padding:0.9rem 1rem; }
.more-name { font-size:0.9rem; font-weight:500; color:var(--black); margin-bottom:0.2rem; letter-spacing:-0.01em; }
.more-meta { font-size:0.6rem; color:var(--light); letter-spacing:0.05em; }

/* ERROR */
.suggestion-chip { font-size:0.72rem; padding:0.4rem 1rem; border:1px solid var(--border-s); border-radius:100px; color:var(--char); text-decoration:none; transition:all 0.2s; }
.suggestion-chip:hover { border-color:var(--sand); color:var(--sand); }

/* FOOTER */
.r-footer { background:#060606; color:var(--white); padding:2rem 4rem; }
.r-footer-inner { display:flex; justify-content:space-between; font-size:0.62rem; color:rgba(255,255,255,0.2); flex-wrap:wrap; gap:0.5rem; }
.r-footer-inner a { color:rgba(255,255,255,0.3); text-decoration:none; }
.r-footer-inner a:hover { color:var(--white); }

/* LOADING */
.loading-page { min-height:100vh; background:var(--black); }
.loading-hero { position:relative; height:92vh; display:flex; align-items:flex-end; overflow:hidden; }
.loading-hero-bg { position:absolute; inset:0; background:linear-gradient(135deg,#1a1a1a,#0a0a0a); animation:loadPulse 2s ease-in-out infinite; }
@keyframes loadPulse { 0%,100%{opacity:1}50%{opacity:0.6} }
.loading-hero-content { position:relative; z-index:2; padding:0 4rem 4rem; }
.loading-eyebrow { font-size:0.65rem; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.3); margin-bottom:1rem; }
.loading-name { font-size:clamp(3rem,7vw,6rem); font-weight:200; color:var(--white); letter-spacing:-0.03em; line-height:0.9; margin-bottom:1.5rem; display:flex; align-items:baseline; gap:0.5rem; flex-wrap:wrap; }
.loading-sub { font-size:0.82rem; color:rgba(255,255,255,0.25); line-height:1.7; max-width:30rem; }
.loading-dots { display:inline-flex; gap:5px; align-items:center; }
.loading-dots span { width:7px; height:7px; border-radius:50%; background:var(--sand); opacity:0.3; animation:dotBounce 1.4s infinite; }
.loading-dots span:nth-child(2){animation-delay:0.2s}
.loading-dots span:nth-child(3){animation-delay:0.4s}
@keyframes dotBounce { 0%,80%,100%{opacity:0.25;transform:scale(0.85)}40%{opacity:1;transform:scale(1.1)} }
.loading-body { padding:4rem; display:flex; flex-direction:column; gap:1.2rem; }
.skeleton-block { height:80px; border-radius:12px; background:linear-gradient(90deg,#1a1a1a 25%,#242424 50%,#1a1a1a 75%); background-size:200% 100%; animation:shimmer 1.8s infinite; }
@keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }

/* SAVE BUTTONS */
.save-trip-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: rgba(255,255,255,0.12); color: var(--white);
  border: 1px solid rgba(255,255,255,0.25); padding: 0.55rem 1.2rem;
  border-radius: 100px; font-size: 0.75rem; font-weight: 500;
  cursor: pointer; font-family: var(--font-body);
  backdrop-filter: blur(8px); transition: all 0.2s;
}
.save-trip-btn:hover { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.4); }
.save-trip-btn.saved { background: var(--white); color: var(--black); border-color: var(--white); }
.save-look-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: none; color: var(--mid);
  border: 1px solid var(--border-s); padding: 0.4rem 0.9rem;
  border-radius: 100px; font-size: 0.68rem; font-weight: 500;
  cursor: pointer; font-family: var(--font-body); transition: all 0.2s;
}
.save-look-btn:hover { border-color: var(--black); color: var(--black); }
.save-look-btn.saved { background: var(--black); color: var(--white); border-color: var(--black); }

/* CLOTHING SECTION */
.clothing-section { padding:5rem 4rem; background:var(--white); border-top:1px solid var(--border); }
.clothing-header { margin-bottom:2rem; }
.clothing-title { font-size:clamp(1.8rem,3.5vw,2.8rem); font-weight:200; letter-spacing:-0.02em; margin-top:0.3rem; line-height:1.05; }
.clothing-title em { color:var(--sand); }

/* Gender tabs */
.clothing-gender-tabs { display:flex; gap:2px; background:var(--off); border-radius:100px; padding:3px; width:fit-content; margin-bottom:1.5rem; }
.gender-tab { padding:0.5rem 1.8rem; border-radius:100px; border:none; background:none; font-family:var(--font-body); font-size:0.82rem; font-weight:400; cursor:pointer; color:var(--mid); transition:all 0.2s; }
.gender-tab.active { background:var(--white); color:var(--black); font-weight:500; box-shadow:0 1px 6px rgba(10,10,10,0.1); }

/* Filter rows */
.clothing-filters { display:flex; flex-direction:column; gap:0.75rem; margin-bottom:2rem; }
.filter-group-row { display:flex; align-items:center; gap:1rem; flex-wrap:wrap; }
.filter-row-label { font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--light); flex-shrink:0; width:60px; }
.filter-pills { display:flex; gap:0.4rem; flex-wrap:wrap; }
.filter-pill { padding:0.35rem 0.9rem; border-radius:100px; border:1px solid var(--border-s); background:none; font-family:var(--font-body); font-size:0.68rem; cursor:pointer; color:var(--mid); transition:all 0.15s; white-space:nowrap; }
.filter-pill:hover { border-color:var(--black); color:var(--black); }
.filter-pill.active { background:var(--black); color:var(--white); border-color:var(--black); }

/* Clothing grid */
.clothing-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.2rem; }
.clothing-card { border-radius:14px; overflow:hidden; border:1px solid var(--border); background:var(--white); transition:transform 0.3s, box-shadow 0.3s; text-decoration:none; display:block; color:inherit; }
.clothing-card:hover { transform:translateY(-3px); box-shadow:0 12px 36px rgba(10,10,10,0.1); }
.clothing-img { width:100%; aspect-ratio:3/4; position:relative; overflow:hidden; background:var(--off); }
.clothing-img img { width:100%; height:100%; object-fit:cover; object-position:top; transition:transform 0.7s; }
.clothing-card:hover .clothing-img img { transform:scale(1.04); }
.clothing-placeholder { width:100%; height:100%; background:linear-gradient(175deg,#ece8e0,#d8d2c8); }
.clothing-price-badge { position:absolute; top:0.6rem; right:0.6rem; background:rgba(255,255,255,0.92); backdrop-filter:blur(8px); border-radius:100px; padding:0.2rem 0.65rem; font-size:0.58rem; font-weight:600; color:var(--black); }
.clothing-cat-badge { position:absolute; top:0.6rem; left:0.6rem; background:var(--black); border-radius:100px; padding:0.2rem 0.65rem; font-size:0.52rem; font-weight:500; color:var(--white); letter-spacing:0.08em; text-transform:uppercase; }
.clothing-shop-overlay {
  position:absolute; bottom:0; left:0; right:0;
  background:rgba(10,10,10,0.75); backdrop-filter:blur(4px);
  color:var(--white); font-size:0.68rem; font-weight:500;
  text-align:center; padding:0.65rem;
  opacity:0; transform:translateY(4px);
  transition:opacity 0.2s, transform 0.2s;
}
.clothing-card:hover .clothing-shop-overlay { opacity:1; transform:translateY(0); }
.clothing-body { padding:1rem; }
.clothing-brand { font-size:0.58rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--sand-d); margin-bottom:0.2rem; font-weight:600; }
.clothing-name { font-size:0.9rem; font-weight:500; margin-bottom:0.4rem; letter-spacing:-0.01em; line-height:1.2; }
.clothing-why { font-size:0.7rem; color:var(--mid); line-height:1.6; }
.clothing-more-wrap { text-align:center; margin-top:2rem; }
.clothing-more-btn {
  background:none; border:1.5px solid var(--border-s);
  padding:0.7rem 2rem; border-radius:100px;
  font-family:var(--font-body); font-size:0.78rem;
  color:var(--char); cursor:pointer;
  transition:all 0.2s;
}
.clothing-more-btn:hover { border-color:var(--black); color:var(--black); }

/* Loading shimmer */
.clothing-loading { text-align:center; }
.clothing-shimmer-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.2rem; margin-bottom:1.5rem; }
.clothing-shimmer { aspect-ratio:3/4; border-radius:14px; background:linear-gradient(90deg,var(--off) 25%,var(--mist) 50%,var(--off) 75%); background-size:200% 100%; animation:shimmer 1.6s infinite; }
@keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
.clothing-loading-text { font-size:0.78rem; color:var(--mid); }
.clothing-empty { text-align:center; padding:3rem; color:var(--mid); font-size:0.85rem; display:flex; flex-direction:column; align-items:center; gap:1rem; }

/* RESPONSIVE */
@media(max-width:1024px){
  .nav-links{display:none}
  .dest-hero-content,.wx-band,.style-section,.checklist-section,.cta-section,.more-section,.clothing-section{padding-left:2rem;padding-right:2rem}
  .style-grid{grid-template-columns:1fr 1fr}
  .checklist-grid{grid-template-columns:1fr 1fr}
  .more-grid{grid-template-columns:1fr 1fr}
  .clothing-grid{grid-template-columns:repeat(3,1fr)}
  .clothing-shimmer-grid{grid-template-columns:repeat(3,1fr)}
}
@media(max-width:640px){
  .r-nav{padding:0 1.25rem;height:64px}
  .btn-ghost{display:none}
  .dest-hero{height:80vh}
  .dest-hero-content{padding:0 1.5rem 2.5rem}
  .dest-title{font-size:clamp(2.6rem,9vw,4rem)}
  .wx-band{padding:1.2rem 1.25rem}
  .wx-wrap{gap:1rem}
  .wx-day{padding:0.5rem 0.55rem;min-width:44px}
  .style-section,.checklist-section,.cta-section,.more-section,.clothing-section{padding:3rem 1.25rem}
  .style-grid{grid-template-columns:1fr}
  .checklist-grid{grid-template-columns:1fr}
  .checklist-head{flex-direction:column}
  .progress-wrap{text-align:left;width:100%}
  .progress-bar{width:100%}
  .more-grid{grid-template-columns:1fr 1fr;gap:0.8rem}
  .clothing-grid{grid-template-columns:repeat(2,1fr);gap:0.8rem}
  .clothing-shimmer-grid{grid-template-columns:repeat(2,1fr)}
  .clothing-gender-tabs{width:100%}
  .gender-tab{flex:1;text-align:center}
  .filter-group-row{flex-direction:column;align-items:flex-start}
  .filter-row-label{width:auto}
  .r-footer{padding:1.5rem 1.25rem}
  .loading-hero-content{padding:0 1.5rem 2.5rem}
  .loading-body{padding:2rem 1.25rem}
}
`

