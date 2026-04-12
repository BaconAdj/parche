'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { destinations, findDestination, type Destination } from '../../../lib/destinations'

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

async function fetchPhoto(query: string, orientation: 'landscape' | 'portrait' = 'landscape'): Promise<UnsplashPhoto | null> {
  if (!UNSPLASH_KEY) return null
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=${orientation}&content_filter=high`,
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
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <nav className={`r-nav${scrolled ? ' scrolled' : ''}`}>
      <a href="/" className="nav-logo"><span className="logo-text">parche</span></a>
      <ul className="nav-links">
        <li><a href="/#destinations">Destinations</a></li>
        <li><a href="/#trending">Trending</a></li>
        <li><a href="/#guides">Style Guides</a></li>
      </ul>
      <div className="nav-right">
        <button className="btn-ghost" onClick={() => router.back()}>← Back</button>
        <a href="/" className="btn-primary">New search</a>
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
function WeatherWidget({ dest }: { dest: Destination }) {
  return (
    <div className="wx-wrap">
      <p className="wx-label">Forecast</p>
      <div className="wx-days">
        {dest.forecast.map((f, i) => (
          <div key={i} className={`wx-day${i === 0 ? ' now' : ''}`}>
            <span className="wx-icon">{f.icon}</span>
            <span className="wx-temp">{f.temp}</span>
            <span className="wx-dl">{f.day}</span>
          </div>
        ))}
      </div>
      <div className="wx-pills">
        <span className="wx-pill">{dest.temp}</span>
        <span className="wx-pill">{dest.weather}</span>
        <span className="wx-pill">{dest.type}</span>
      </div>
    </div>
  )
}

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
// RESULTS VIEW
// ─────────────────────────────────────────────────────────────
function ResultsView({ dest, isGenerated = false }: { dest: Destination; isGenerated?: boolean }) {
  const [heroPhoto,   setHeroPhoto]   = useState<UnsplashPhoto | null>(null)
  const [stylePhotos, setStylePhotos] = useState<(UnsplashPhoto | null)[]>([null, null, null])

  useEffect(() => {
    async function load() {
      // Derive climate context from tags and temp for smarter photo queries
      const tags    = (dest.tags || []).map((t: string) => t.toLowerCase())
      const tempStr = dest.temp || ''
      const tempNum = parseInt(tempStr.replace(/[^-\d]/g, '')) || 20
      const isBeach   = tags.some((t: string) => ['beach','tropical','resort','island'].includes(t))
      const isCold    = tempNum < 10
      const isModest  = tags.some((t: string) => ['modest','cultural','desert'].includes(t))
      const isBoho    = tags.some((t: string) => ['boho','bohemian'].includes(t))
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
      setHeroPhoto(hero)
      setStylePhotos([s1, s2, s3])
    }
    load()
  }, [dest.name, dest.tags, dest.temp])

  const styleCards = [
    {
      title: `The ${dest.name} day look`,
      desc: dest.guide,
    },
    {
      title: 'Evening upgrade',
      desc: `After sunset in ${dest.name}, the vibe shifts. ${dest.tags.includes('Beach') ? 'Beach cover-ups give way to something with more shape — a maxi dress, linen trousers, a good sandal.' : 'A single elevated layer — a blazer, a silk shirt — takes your daytime outfit straight to dinner.'}`,
    },
    {
      title: 'What locals actually wear',
      desc: `Forget generic travel blog advice. In ${dest.name}, locals favour ${dest.tags.includes('Minimal') ? 'clean lines and understated quality over logos or trends.' : dest.tags.includes('Boho') ? 'relaxed silhouettes, natural fabrics, nothing that looks like it tried too hard.' : 'pieces that work across contexts — dressed up or down depending on the moment.'}`,
    },
  ]

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
            {isGenerated && <span className="ai-tag">AI Guide</span>}
          </p>
          <h1 className="dest-title">
            What to wear in<br />
            <em className="display">{dest.name}</em>
          </h1>
          <div className="dest-pills">
            <span className="dest-pill">{dest.temp}</span>
            <span className="dest-pill">{dest.weather}</span>
            <span className="dest-pill">{dest.type}</span>
          </div>
        </div>
        {heroPhoto && <UnsplashCredit photo={heroPhoto} dark />}
      </div>

      {/* WEATHER */}
      <div className="wx-band"><WeatherWidget dest={dest} /></div>

      {/* STYLE GUIDE */}
      <section className="style-section">
        <p className="section-eyebrow">Style guide</p>
        <h2 className="style-title">
          Dressing for <em className="display">{dest.name}</em>
        </h2>
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
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PACKING CHECKLIST */}
      <section className="checklist-section">
        <PackingChecklist dest={dest} />
      </section>

      {/* TAGS + KEFFY CTA */}
      <section className="cta-section">
        <div className="dest-tags">
          {dest.tags.map(t => <span key={t} className="dest-tag">{t}</span>)}
        </div>
        <div className="keffy-cta">
          <div>
            <p className="keffy-title">Planning your trip to {dest.name}?</p>
            <p className="keffy-desc">Keffy is an AI travel concierge that handles flights, hotels, and itineraries — so you can focus on what to wear.</p>
          </div>
          <a href="https://keffy.com" target="_blank" rel="noopener noreferrer" className="keffy-btn">
            Plan with Keffy →
          </a>
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
        <a href="/" style={{ fontSize: '0.88rem', color: 'var(--mid)', textDecoration: 'none' }}>← New search</a>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────
export default function DestinationPage() {
  const params   = useParams()
  const rawSlug  = Array.isArray(params.slug) ? params.slug[0] : (params.slug ?? '')
  const slug     = decodeURIComponent(rawSlug)
  const staticDest = findDestination(slug)

  const [state, setState]   = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [generated, setGen] = useState<Destination | null>(null)

  useEffect(() => {
    if (staticDest) return
    setState('loading')
    const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    fetch(`/api/destinations?destination=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(json => { if (json.data) { setGen(json.data); setState('done') } else setState('error') })
      .catch(() => setState('error'))
  }, [slug, staticDest])

  const displayName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <>
      <Nav />
      {staticDest && <ResultsView dest={staticDest} />}
      {!staticDest && state === 'loading' && <LoadingSkeleton name={displayName} />}
      {!staticDest && state === 'done' && generated && <ResultsView dest={generated} isGenerated />}
      {!staticDest && state === 'error' && <ErrorState name={displayName} />}
      <style>{css}</style>
    </>
  )
}

const css = `
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
.keffy-cta { background:var(--black); border-radius:20px; padding:2.5rem 3rem; display:flex; align-items:center; justify-content:space-between; gap:2rem; flex-wrap:wrap; }
.keffy-title { font-size:1.2rem; font-weight:300; color:var(--white); letter-spacing:-0.01em; margin-bottom:0.5rem; }
.keffy-desc { font-size:0.78rem; color:rgba(255,255,255,0.4); line-height:1.7; max-width:36rem; }
.keffy-btn { background:var(--sand); color:var(--black); padding:0.8rem 2rem; border-radius:100px; font-size:0.85rem; font-weight:600; text-decoration:none; white-space:nowrap; flex-shrink:0; transition:all 0.2s; }
.keffy-btn:hover { background:var(--sand-d); color:var(--white); transform:translateY(-1px); }

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

/* RESPONSIVE */
@media(max-width:1024px){
  .nav-links{display:none}
  .dest-hero-content,.wx-band,.style-section,.checklist-section,.cta-section,.more-section{padding-left:2rem;padding-right:2rem}
  .style-grid{grid-template-columns:1fr 1fr}
  .checklist-grid{grid-template-columns:1fr 1fr}
  .more-grid{grid-template-columns:1fr 1fr}
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
  .style-section,.checklist-section,.cta-section,.more-section{padding:3rem 1.25rem}
  .style-grid{grid-template-columns:1fr}
  .checklist-grid{grid-template-columns:1fr}
  .checklist-head{flex-direction:column}
  .progress-wrap{text-align:left;width:100%}
  .progress-bar{width:100%}
  .keffy-cta{flex-direction:column;padding:1.8rem}
  .keffy-btn{width:100%;text-align:center}
  .more-grid{grid-template-columns:1fr 1fr;gap:0.8rem}
  .r-footer{padding:1.5rem 1.25rem}
  .loading-hero-content{padding:0 1.5rem 2.5rem}
  .loading-body{padding:2rem 1.25rem}
}
`
