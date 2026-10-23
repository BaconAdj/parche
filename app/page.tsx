'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SplitText from '../components/react-bits/SplitText'
import Magnet from '../components/react-bits/Magnet'
import { SiteNav } from '../components/SiteNav'
import { SiteFooter } from '../components/SiteFooter'
import { ProductCard } from '../components/ProductCard'
import { TripSearch, ALL_DESTINATIONS } from '../components/TripSearch'
import { findProduct, type Product } from '../lib/product-catalogue'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const CYCLE = ['Lisbon', 'Tokyo', 'Marrakech', 'Montréal', 'Amalfi', 'Mexico City']

// One fully worked example, built only from verified catalogue records.
const EXAMPLE_EDIT: { id: string; why: string; label: string }[] = [
  { id: 'zara-w-08372248', label: 'Trousers', why: 'A relaxed leg that works for a museum morning and a late dinner in Bairro Alto.' },
  { id: 'veja-campo-white-natural', label: 'Shoes', why: 'Clean sneakers with real grip for steep, polished limestone streets.' },
  { id: 'uniqlo-w-469410', label: 'Layer', why: 'Fine merino for evenings by the river, when it drops a few degrees.' },
  { id: 'uniqlo-u-481610', label: 'Bag', why: 'A small crossbody that stays close on crowded trams.' },
]

const PLACES: { slug: string; name: string; hint: string }[] = [
  { slug: 'lisbon', name: 'Lisbon', hint: 'Hills, cobbles and long lunches. Grip first, linen second.' },
  { slug: 'tokyo', name: 'Tokyo', hint: 'Clean layers and shoes you can slip off at the door.' },
  { slug: 'marrakech', name: 'Marrakech', hint: 'Light, covered layers that move with the heat.' },
  { slug: 'amalfi-coast', name: 'Amalfi Coast', hint: 'Crisp separates, swimwear and one good evening piece.' },
  { slug: 'montreal', name: 'Montréal', hint: 'Four seasons, sometimes in a week. Plan for the layer.' },
  { slug: 'paris', name: 'Paris', hint: 'Fewer pieces, better pieces, and comfortable flats.' },
  { slug: 'mexico-city', name: 'Mexico City', hint: 'Warm afternoons, cool nights at altitude.' },
  { slug: 'bali', name: 'Bali', hint: 'Breathable fabrics with cover for temple visits.' },
]

const BRANDS = ['UNIQLO', 'ZARA', 'H&M', 'VEJA', 'Birkenstock', 'Sunspel', 'ASKET', 'Rains', 'Fjällräven', 'Salomon', 'Organic Basics']

const REDUCED = '(prefers-reduced-motion: reduce)'
function useReducedMotion() {
  return useSyncExternalStore(
    cb => { const m = window.matchMedia(REDUCED); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) },
    () => window.matchMedia(REDUCED).matches,
    () => false,
  )
}

// The hero headline: "Dress for ___." The blank cycles through cities until the traveller types their own.
function HeroCity({ typed }: { typed: string }) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const inner = useRef<HTMLSpanElement>(null)
  const cleaned = typed.trim().replace(/\s+/g, ' ').slice(0, 22)
  const word = cleaned ? cleaned.replace(/\b\p{L}/gu, c => c.toUpperCase()) : CYCLE[index]

  useEffect(() => {
    if (cleaned || reduced) return
    const id = setInterval(() => setIndex(i => (i + 1) % CYCLE.length), 2600)
    return () => clearInterval(id)
  }, [cleaned, reduced])

  useGSAP(() => {
    if (reduced || !inner.current) return
    gsap.fromTo(inner.current, { yPercent: 105 }, { yPercent: 0, duration: cleaned ? 0.35 : 0.8, ease: 'expo.out' })
  }, { dependencies: [word, reduced] })

  const size = word.length > 13 ? 'clamp(2.4rem, 6.4vw, 6.2rem)' : word.length > 9 ? 'clamp(3rem, 8.6vw, 8.4rem)' : undefined
  return (
    <span className="hero-city" style={size ? { fontSize: size } : undefined} aria-live="polite">
      <span ref={inner} className="hero-city-inner">{word}.</span>
    </span>
  )
}

function ExampleEdit() {
  const products = EXAMPLE_EDIT.map(e => ({ ...e, product: findProduct(e.id) })).filter((e): e is typeof e & { product: Product } => Boolean(e.product))
  const grid = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.utils.toArray<HTMLElement>('.pcard-img', grid.current).forEach(el => {
      gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, {
        clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      })
    })
  }, { scope: grid })

  return (
    <section id="edit" className="edit" aria-labelledby="edit-title">
      <div className="wrap edit-grid">
        <div className="edit-copy">
          <p className="kicker">An example edit</p>
          <h2 id="edit-title" className="h2">Lisbon in October.</h2>
          <p className="lede">Mild days, cooler evenings, and a city built on hills. Here is what to wear, and where to get it.</p>
          <ul className="edit-reasons">
            {products.map(e => <li key={e.id}><strong>{e.label}</strong><span>{e.why}</span></li>)}
          </ul>
          <p className="edit-note">Every photo is the retailer&apos;s own image of the exact item, and every link opens that item&apos;s page. Prices were checked on the date shown in each trip edit.</p>
        </div>
        <div ref={grid} className="edit-products">
          {products.map(e => <ProductCard key={e.id} product={e.product} destination="Lisbon" kind={e.label.toLowerCase()} showTier={false} />)}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [typed, setTyped] = useState('')
  const onQueryChange = useCallback((label: string) => setTyped(label), [])
  const country = (slug: string) => ALL_DESTINATIONS.find(d => d.slug === slug)?.sublabel.split(' · ')[0] || ''

  return (
    <>
      <SiteNav />
      <main>
        <section id="plan" className="hero rouge-field" aria-labelledby="hero-title">
          <div className="hero-emblem" aria-hidden><span className="emblem" /></div>
          <h1 id="hero-title" className="hero-title">
            <SplitText text="Dress for" tag="span" className="line" splitType="chars" effect="rise" mask trigger="load" delay={35} duration={1.1} textAlign="left" />
            <HeroCity typed={typed} />
          </h1>
          <div className="hero-foot">
            <TripSearch onQueryChange={onQueryChange} />
            <p className="hero-desc">Tell us where and when. We&apos;ll show you what to wear there, and link the pieces you&apos;re missing.</p>
          </div>
        </section>

        <ExampleEdit />

        <section id="how" className="steps" aria-labelledby="how-title">
          <div className="wrap">
            <p className="kicker">How it works</p>
            <h2 id="how-title" className="h2">From itinerary to outfit in a minute.</h2>
            <ol className="steps-list">
              <li><h3>Tell us the trip</h3><p>Destination and dates. Add what you&apos;ll be doing and your style if you want it sharper.</p></li>
              <li><h3>See what to wear</h3><p>Complete looks built around the real forecast or seasonal weather, the terrain and the evenings.</p></li>
              <li><h3>Shop what you&apos;re missing</h3><p>Every piece links to the exact item at UNIQLO, ZARA, H&amp;M and smaller labels, at three price points.</p></li>
            </ol>
          </div>
        </section>

        <section id="places" className="places" aria-labelledby="places-title">
          <div className="wrap">
            <div className="places-head">
              <div>
                <p className="kicker">Destinations</p>
                <h2 id="places-title" className="h2">Where to next?</h2>
              </div>
              <Magnet padding={60} magnetStrength={4}>
                <Link href="/#plan" className="btn btn--rouge">Plan your own trip</Link>
              </Magnet>
            </div>
            <div className="places-grid">
              {PLACES.map(p => (
                <Link key={p.slug} href={`/destinations/${p.slug}`} className="place">
                  <span className="place-country">{country(p.slug)}</span>
                  <span>
                    <span className="place-name">{p.name}</span>
                    <p className="place-hint" style={{ marginTop: '.75rem' }}>{p.hint}</p>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="brands" aria-labelledby="brands-title">
          <div className="wrap brands-inner">
            <div className="brands-copy">
              <h2 id="brands-title" className="kicker">Pieces from</h2>
              <p>Big names for the basics, smaller labels for the pieces worth investing in. Links go straight to each brand&apos;s product page.</p>
            </div>
            <ul className="brands-list">{BRANDS.map(b => <li key={b}>{b}</li>)}</ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
