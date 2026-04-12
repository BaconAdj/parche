'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { featuredDestinations } from '../lib/destinations'


// ── Unsplash ────────────────────────────────────────────────
const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || ''

type UnsplashPhoto = {
  id: string
  urls: { regular: string; small: string }
  alt_description: string
  user: { name: string }
  links: { html: string }
}

async function fetchPhoto(query: string, orientation: 'landscape' | 'portrait' = 'landscape'): Promise<string | null> {
  if (!UNSPLASH_KEY) return null
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=${orientation}&content_filter=high`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    )
    const data = await res.json()
    return data.results?.[0]?.urls?.regular || null
  } catch { return null }
}

// ── Types ──────────────────────────────────────────────
type DateRange = { start: Date | null; end: Date | null }

// ── Calendar ───────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDateRange(r: DateRange): string {
  if (!r.start) return 'Select dates'
  if (!r.end)   return `${MONTHS_SHORT[r.start.getMonth()]} ${r.start.getDate()} – ?`
  return `${MONTHS_SHORT[r.start.getMonth()]} ${r.start.getDate()} – ${MONTHS_SHORT[r.end.getMonth()]} ${r.end.getDate()}`
}

function Calendar({
  range, onChange, onClose, anchorRef
}: {
  range: DateRange
  onChange: (r: DateRange) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLDivElement>
}) {
  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [hover, setHover] = useState<Date | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [pos, setPos]   = useState({ top: 0, left: 0 })
  const [isMobile, setIsMobile] = useState(false)

  const CAL_HEIGHT = 380 // approximate calendar height in px
  const [flipUp, setFlipUp] = useState(false)

  useEffect(() => {
    const mobile = window.innerWidth <= 640
    setIsMobile(mobile)
    if (!mobile && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      const w    = 316
      const vh   = window.innerHeight
      const spaceBelow = vh - rect.bottom - 16
      const spaceAbove = rect.top - 16

      let left = rect.left + rect.width / 2 - w / 2
      if (left + w > window.innerWidth - 12) left = window.innerWidth - w - 12
      if (left < 12) left = 12

      // Flip above if not enough space below
      const fitsBelow = spaceBelow >= CAL_HEIGHT
      const top = fitsBelow
        ? rect.bottom + 10
        : rect.top - CAL_HEIGHT - 10

      setFlipUp(!fitsBelow)
      setPos({ top, left })
    }
  }, [anchorRef])

  // Reposition on scroll so calendar tracks with the search bar
  useEffect(() => {
    if (isMobile) return
    function reposition() {
      if (!anchorRef.current) return
      const rect = anchorRef.current.getBoundingClientRect()
      const w    = 316
      const vh   = window.innerHeight
      const spaceBelow = vh - rect.bottom - 16

      let left = rect.left + rect.width / 2 - w / 2
      if (left + w > window.innerWidth - 12) left = window.innerWidth - w - 12
      if (left < 12) left = 12

      const fitsBelow = spaceBelow >= CAL_HEIGHT
      const top = fitsBelow
        ? rect.bottom + 10
        : rect.top - CAL_HEIGHT - 10

      setFlipUp(!fitsBelow)
      setPos({ top, left })
    }
    window.addEventListener('scroll', reposition, { passive: true })
    return () => window.removeEventListener('scroll', reposition)
  }, [isMobile, anchorRef])

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        wrapRef.current && !wrapRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onClose, anchorRef])

  // Close on Escape
  useEffect(() => {
    function handle(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function pickDay(date: Date) {
    const { start, end } = range
    if (!start || (start && end)) {
      onChange({ start: date, end: null })
    } else {
      if (date.getTime() === start.getTime()) {
        onChange({ start: null, end: null })
      } else if (date < start) {
        onChange({ start: date, end: start })
        setTimeout(onClose, 320)
      } else {
        onChange({ start, end: date })
        setTimeout(onClose, 320)
      }
    }
  }

  // Build grid cells
  const first = new Date(year, month, 1)
  const last  = new Date(year, month + 1, 0)
  const cells: (Date | null)[] = []
  for (let i = 0; i < first.getDay(); i++) cells.push(null)
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d))

  const { start, end } = range
  const rangeEnd = end || hover

  function dayClass(date: Date): string {
    const isPast   = date < today
    const isToday  = date.getTime() === today.getTime()
    const isStart  = start && date.getTime() === start.getTime()
    const isEnd    = end   && date.getTime() === end.getTime()
    const inRange  = start && rangeEnd && date > start && date < rangeEnd

    let cls = 'cal-day'
    if (isPast)   return cls + ' past'
    if (isToday)  cls += ' today'
    if (isStart)  cls += ' start'
    else if (isEnd) cls += ' end'
    else if (inRange) {
      cls += ' in-range'
      const prevD = new Date(year, month, date.getDate() - 1)
      const nextD = new Date(year, month, date.getDate() + 1)
      if (start && prevD.getTime() === start.getTime()) cls += ' range-s'
      if (rangeEnd && nextD.getTime() === rangeEnd.getTime()) cls += ' range-e'
      if (date.getDay() === 0 || date.getDate() === 1) cls += ' range-s'
      if (date.getDay() === 6 || date.getDate() === last.getDate()) cls += ' range-e'
    }
    return cls
  }

  const calStyle: React.CSSProperties = isMobile
    ? {}
    : { position: 'fixed', top: pos.top, left: pos.left, width: 316 }

  return (
    <>
      {isMobile && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.4)', zIndex: 9998 }}
          onClick={onClose}
        />
      )}
      <div
        ref={wrapRef}
        className={`cal-wrap${isMobile ? ' cal-mobile' : ''}${flipUp ? ' flip-up' : ''}`}
        style={calStyle}
        onClick={e => e.stopPropagation()}
      >
        <div className="cal-header">
          <button className="cal-nav" onClick={prevMonth}>‹</button>
          <span className="cal-month-label">{MONTHS[month]} {year}</span>
          <button className="cal-nav" onClick={nextMonth}>›</button>
        </div>
        <div className="cal-dow">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d}>{d}</span>)}
        </div>
        <div className="cal-days">
          {cells.map((date, i) => {
            if (!date) return <div key={`e${i}`} className="cal-day empty" />
            const isPast = date < today
            return (
              <button
                key={date.getDate()}
                type="button"
                className={dayClass(date)}
                disabled={isPast}
                onClick={() => pickDay(date)}
                onMouseEnter={() => { if (start && !end) setHover(date) }}
                onMouseLeave={() => setHover(null)}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
        <div className="cal-footer">
          <span className="cal-hint">
            {!start ? 'Select departure' : !end ? 'Now select return' : formatDateRange(range)}
          </span>
          <button className="cal-clear" onClick={() => { onChange({ start: null, end: null }); setHover(null) }}>
            Clear
          </button>
        </div>
      </div>
    </>
  )
}

// ── Search Bar ─────────────────────────────────────────
const ALL_DESTINATIONS = [
  { label: 'Bali',               sublabel: 'Indonesia · Asia',           slug: 'bali' },
  { label: 'Amalfi Coast',       sublabel: 'Italy · Mediterranean',      slug: 'amalfi-coast' },
  { label: 'Santorini',          sublabel: 'Greece · Mediterranean',     slug: 'santorini' },
  { label: 'Marrakech',          sublabel: 'Morocco · North Africa',     slug: 'marrakech' },
  { label: 'Tulum',              sublabel: 'Mexico · Caribbean',         slug: 'tulum' },
  { label: 'Maldives',           sublabel: 'Indian Ocean · Island',      slug: 'maldives' },
  { label: 'Mykonos',            sublabel: 'Greece · Mediterranean',     slug: 'mykonos' },
  { label: 'Positano',           sublabel: 'Italy · Mediterranean',      slug: 'positano' },
  { label: 'Capri',              sublabel: 'Italy · Mediterranean',      slug: 'capri' },
  { label: 'Ibiza',              sublabel: 'Spain · Mediterranean',      slug: 'ibiza' },
  { label: 'Phuket',             sublabel: 'Thailand · Southeast Asia',  slug: 'phuket' },
  { label: 'Cancun',             sublabel: 'Mexico · Caribbean',         slug: 'cancun' },
  { label: 'Riviera Maya',       sublabel: 'Mexico · Caribbean',         slug: 'riviera-maya' },
  { label: 'Hawaii',             sublabel: 'USA · Pacific Island',       slug: 'hawaii' },
  { label: 'Maui',               sublabel: 'USA · Pacific Island',       slug: 'maui' },
  { label: 'Fiji',               sublabel: 'Pacific · Island',           slug: 'fiji' },
  { label: 'Bora Bora',          sublabel: 'French Polynesia · Island',  slug: 'bora-bora' },
  { label: 'Koh Samui',          sublabel: 'Thailand · Southeast Asia',  slug: 'koh-samui' },
  { label: 'Seychelles',         sublabel: 'Indian Ocean · Island',      slug: 'seychelles' },
  { label: 'Zanzibar',           sublabel: 'Tanzania · East Africa',     slug: 'zanzibar' },
  { label: 'Cinque Terre',       sublabel: 'Italy · Mediterranean',      slug: 'cinque-terre' },
  { label: 'French Riviera',     sublabel: 'France · Mediterranean',     slug: 'french-riviera' },
  { label: 'Nice',               sublabel: 'France · Mediterranean',     slug: 'nice' },
  { label: 'Monaco',             sublabel: 'Monaco · Mediterranean',     slug: 'monaco' },
  { label: 'Dubrovnik',          sublabel: 'Croatia · Adriatic',         slug: 'dubrovnik' },
  { label: 'Hvar',               sublabel: 'Croatia · Adriatic',         slug: 'hvar' },
  { label: 'Kotor',              sublabel: 'Montenegro · Adriatic',      slug: 'kotor' },
  { label: 'Mallorca',           sublabel: 'Spain · Mediterranean',      slug: 'mallorca' },
  { label: 'Menorca',            sublabel: 'Spain · Mediterranean',      slug: 'menorca' },
  { label: 'Algarve',            sublabel: 'Portugal · Atlantic',        slug: 'algarve' },
  { label: 'Costa Rica',         sublabel: 'Central America · Tropical', slug: 'costa-rica' },
  { label: 'Medellin',           sublabel: 'Colombia · South America',   slug: 'medellin' },
  { label: 'Cartagena',          sublabel: 'Colombia · Caribbean',       slug: 'cartagena' },
  { label: 'Palawan',            sublabel: 'Philippines · Asia',         slug: 'palawan' },
  { label: 'Boracay',            sublabel: 'Philippines · Asia',         slug: 'boracay' },
  { label: 'Lombok',             sublabel: 'Indonesia · Asia',           slug: 'lombok' },
  { label: 'Raja Ampat',         sublabel: 'Indonesia · Asia',           slug: 'raja-ampat' },
  { label: 'Luang Prabang',      sublabel: 'Laos · Southeast Asia',      slug: 'luang-prabang' },
  { label: 'Hoi An',             sublabel: 'Vietnam · Southeast Asia',   slug: 'hoi-an' },
  { label: 'Ha Long Bay',        sublabel: 'Vietnam · Southeast Asia',   slug: 'ha-long-bay' },
  { label: 'Langkawi',           sublabel: 'Malaysia · Southeast Asia',  slug: 'langkawi' },
  { label: 'Petra',              sublabel: 'Jordan · Middle East',       slug: 'petra' },
  { label: 'Cappadocia',         sublabel: 'Turkey · Middle East',       slug: 'cappadocia' },
  { label: 'Masai Mara',         sublabel: 'Kenya · East Africa',        slug: 'masai-mara' },
  { label: 'Patagonia',          sublabel: 'Argentina / Chile',          slug: 'patagonia' },
  { label: 'Tokyo',              sublabel: 'Japan · East Asia',          slug: 'tokyo' },
  { label: 'Kyoto',              sublabel: 'Japan · East Asia',          slug: 'kyoto' },
  { label: 'Osaka',              sublabel: 'Japan · East Asia',          slug: 'osaka' },
  { label: 'Seoul',              sublabel: 'South Korea · East Asia',    slug: 'seoul' },
  { label: 'Singapore',          sublabel: 'Singapore · Southeast Asia', slug: 'singapore' },
  { label: 'Hong Kong',          sublabel: 'China · East Asia',          slug: 'hong-kong' },
  { label: 'Shanghai',           sublabel: 'China · East Asia',          slug: 'shanghai' },
  { label: 'Beijing',            sublabel: 'China · East Asia',          slug: 'beijing' },
  { label: 'Bangkok',            sublabel: 'Thailand · Southeast Asia',  slug: 'bangkok' },
  { label: 'Chiang Mai',         sublabel: 'Thailand · Southeast Asia',  slug: 'chiang-mai' },
  { label: 'Hanoi',              sublabel: 'Vietnam · Southeast Asia',   slug: 'hanoi' },
  { label: 'Ho Chi Minh City',   sublabel: 'Vietnam · Southeast Asia',   slug: 'ho-chi-minh-city' },
  { label: 'Kuala Lumpur',       sublabel: 'Malaysia · Southeast Asia',  slug: 'kuala-lumpur' },
  { label: 'Jakarta',            sublabel: 'Indonesia · Southeast Asia', slug: 'jakarta' },
  { label: 'Mumbai',             sublabel: 'India · South Asia',         slug: 'mumbai' },
  { label: 'Delhi',              sublabel: 'India · South Asia',         slug: 'delhi' },
  { label: 'Jaipur',             sublabel: 'India · South Asia',         slug: 'jaipur' },
  { label: 'Goa',                sublabel: 'India · South Asia',         slug: 'goa' },
  { label: 'Kathmandu',          sublabel: 'Nepal · South Asia',         slug: 'kathmandu' },
  { label: 'Colombo',            sublabel: 'Sri Lanka · South Asia',     slug: 'colombo' },
  { label: 'Taipei',             sublabel: 'Taiwan · East Asia',         slug: 'taipei' },
  { label: 'Manila',             sublabel: 'Philippines · Asia',         slug: 'manila' },
  { label: 'Phnom Penh',         sublabel: 'Cambodia · Southeast Asia',  slug: 'phnom-penh' },
  { label: 'Siem Reap',          sublabel: 'Cambodia · Southeast Asia',  slug: 'siem-reap' },
  { label: 'Yangon',             sublabel: 'Myanmar · Southeast Asia',   slug: 'yangon' },
  { label: 'Tbilisi',            sublabel: 'Georgia · Caucasus',         slug: 'tbilisi' },
  { label: 'Baku',               sublabel: 'Azerbaijan · Caucasus',      slug: 'baku' },
  { label: 'Paris',              sublabel: 'France · Europe',            slug: 'paris' },
  { label: 'London',             sublabel: 'UK · Europe',                slug: 'london' },
  { label: 'Rome',               sublabel: 'Italy · Europe',             slug: 'rome' },
  { label: 'Florence',           sublabel: 'Italy · Europe',             slug: 'florence' },
  { label: 'Venice',             sublabel: 'Italy · Europe',             slug: 'venice' },
  { label: 'Milan',              sublabel: 'Italy · Europe',             slug: 'milan' },
  { label: 'Barcelona',          sublabel: 'Spain · Europe',             slug: 'barcelona' },
  { label: 'Madrid',             sublabel: 'Spain · Europe',             slug: 'madrid' },
  { label: 'Seville',            sublabel: 'Spain · Europe',             slug: 'seville' },
  { label: 'Granada',            sublabel: 'Spain · Europe',             slug: 'granada' },
  { label: 'Lisbon',             sublabel: 'Portugal · Europe',          slug: 'lisbon' },
  { label: 'Porto',              sublabel: 'Portugal · Europe',          slug: 'porto' },
  { label: 'Amsterdam',          sublabel: 'Netherlands · Europe',       slug: 'amsterdam' },
  { label: 'Brussels',           sublabel: 'Belgium · Europe',           slug: 'brussels' },
  { label: 'Berlin',             sublabel: 'Germany · Europe',           slug: 'berlin' },
  { label: 'Munich',             sublabel: 'Germany · Europe',           slug: 'munich' },
  { label: 'Hamburg',            sublabel: 'Germany · Europe',           slug: 'hamburg' },
  { label: 'Vienna',             sublabel: 'Austria · Europe',           slug: 'vienna' },
  { label: 'Prague',             sublabel: 'Czech Republic · Europe',    slug: 'prague' },
  { label: 'Budapest',           sublabel: 'Hungary · Europe',           slug: 'budapest' },
  { label: 'Warsaw',             sublabel: 'Poland · Europe',            slug: 'warsaw' },
  { label: 'Krakow',             sublabel: 'Poland · Europe',            slug: 'krakow' },
  { label: 'Stockholm',          sublabel: 'Sweden · Scandinavia',       slug: 'stockholm' },
  { label: 'Copenhagen',         sublabel: 'Denmark · Scandinavia',      slug: 'copenhagen' },
  { label: 'Oslo',               sublabel: 'Norway · Scandinavia',       slug: 'oslo' },
  { label: 'Helsinki',           sublabel: 'Finland · Scandinavia',      slug: 'helsinki' },
  { label: 'Reykjavik',          sublabel: 'Iceland · North Atlantic',   slug: 'reykjavik' },
  { label: 'Edinburgh',          sublabel: 'Scotland · UK',              slug: 'edinburgh' },
  { label: 'Dublin',             sublabel: 'Ireland · Europe',           slug: 'dublin' },
  { label: 'Athens',             sublabel: 'Greece · Europe',            slug: 'athens' },
  { label: 'Istanbul',           sublabel: 'Turkey · Europe / Asia',     slug: 'istanbul' },
  { label: 'Zurich',             sublabel: 'Switzerland · Europe',       slug: 'zurich' },
  { label: 'Geneva',             sublabel: 'Switzerland · Europe',       slug: 'geneva' },
  { label: 'Bruges',             sublabel: 'Belgium · Europe',           slug: 'bruges' },
  { label: 'Ghent',              sublabel: 'Belgium · Europe',           slug: 'ghent' },
  { label: 'Valletta',           sublabel: 'Malta · Mediterranean',      slug: 'valletta' },
  { label: 'Tallinn',            sublabel: 'Estonia · Europe',           slug: 'tallinn' },
  { label: 'Riga',               sublabel: 'Latvia · Europe',            slug: 'riga' },
  { label: 'Vilnius',            sublabel: 'Lithuania · Europe',         slug: 'vilnius' },
  { label: 'Ljubljana',          sublabel: 'Slovenia · Europe',          slug: 'ljubljana' },
  { label: 'Sarajevo',           sublabel: 'Bosnia · Europe',            slug: 'sarajevo' },
  { label: 'Bucharest',          sublabel: 'Romania · Europe',           slug: 'bucharest' },
  { label: 'Sofia',              sublabel: 'Bulgaria · Europe',          slug: 'sofia' },
  { label: 'Belgrade',           sublabel: 'Serbia · Europe',            slug: 'belgrade' },
  { label: 'Thessaloniki',       sublabel: 'Greece · Europe',            slug: 'thessaloniki' },
  { label: 'Dubai',              sublabel: 'UAE · Middle East',          slug: 'dubai' },
  { label: 'Abu Dhabi',          sublabel: 'UAE · Middle East',          slug: 'abu-dhabi' },
  { label: 'Tel Aviv',           sublabel: 'Israel · Middle East',       slug: 'tel-aviv' },
  { label: 'Jerusalem',          sublabel: 'Israel · Middle East',       slug: 'jerusalem' },
  { label: 'Amman',              sublabel: 'Jordan · Middle East',       slug: 'amman' },
  { label: 'Beirut',             sublabel: 'Lebanon · Middle East',      slug: 'beirut' },
  { label: 'Muscat',             sublabel: 'Oman · Middle East',         slug: 'muscat' },
  { label: 'Cairo',              sublabel: 'Egypt · North Africa',       slug: 'cairo' },
  { label: 'Casablanca',         sublabel: 'Morocco · North Africa',     slug: 'casablanca' },
  { label: 'Fez',                sublabel: 'Morocco · North Africa',     slug: 'fez' },
  { label: 'Nairobi',            sublabel: 'Kenya · East Africa',        slug: 'nairobi' },
  { label: 'Cape Town',          sublabel: 'South Africa · Africa',      slug: 'cape-town' },
  { label: 'Johannesburg',       sublabel: 'South Africa · Africa',      slug: 'johannesburg' },
  { label: 'Lagos',              sublabel: 'Nigeria · West Africa',      slug: 'lagos' },
  { label: 'Accra',              sublabel: 'Ghana · West Africa',        slug: 'accra' },
  { label: 'Addis Ababa',        sublabel: 'Ethiopia · East Africa',     slug: 'addis-ababa' },
  { label: 'Dakar',              sublabel: 'Senegal · West Africa',      slug: 'dakar' },
  { label: 'Tunis',              sublabel: 'Tunisia · North Africa',     slug: 'tunis' },
  { label: 'New York',           sublabel: 'USA · North America',        slug: 'new-york' },
  { label: 'Los Angeles',        sublabel: 'USA · North America',        slug: 'los-angeles' },
  { label: 'Miami',              sublabel: 'USA · North America',        slug: 'miami' },
  { label: 'Chicago',            sublabel: 'USA · North America',        slug: 'chicago' },
  { label: 'San Francisco',      sublabel: 'USA · North America',        slug: 'san-francisco' },
  { label: 'New Orleans',        sublabel: 'USA · North America',        slug: 'new-orleans' },
  { label: 'Las Vegas',          sublabel: 'USA · North America',        slug: 'las-vegas' },
  { label: 'Nashville',          sublabel: 'USA · North America',        slug: 'nashville' },
  { label: 'Seattle',            sublabel: 'USA · North America',        slug: 'seattle' },
  { label: 'Boston',             sublabel: 'USA · North America',        slug: 'boston' },
  { label: 'Washington DC',      sublabel: 'USA · North America',        slug: 'washington-dc' },
  { label: 'Austin',             sublabel: 'USA · North America',        slug: 'austin' },
  { label: 'Toronto',            sublabel: 'Canada · North America',     slug: 'toronto' },
  { label: 'Montreal',           sublabel: 'Canada · North America',     slug: 'montreal' },
  { label: 'Vancouver',          sublabel: 'Canada · North America',     slug: 'vancouver' },
  { label: 'Quebec City',        sublabel: 'Canada · North America',     slug: 'quebec-city' },
  { label: 'Calgary',            sublabel: 'Canada · North America',     slug: 'calgary' },
  { label: 'Mexico City',        sublabel: 'Mexico · North America',     slug: 'mexico-city' },
  { label: 'Oaxaca',             sublabel: 'Mexico · North America',     slug: 'oaxaca' },
  { label: 'Guadalajara',        sublabel: 'Mexico · North America',     slug: 'guadalajara' },
  { label: 'Havana',             sublabel: 'Cuba · Caribbean',           slug: 'havana' },
  { label: 'San Juan',           sublabel: 'Puerto Rico · Caribbean',    slug: 'san-juan' },
  { label: 'Santo Domingo',      sublabel: 'Dominican Republic · Caribbean', slug: 'santo-domingo' },
  { label: 'Bogota',             sublabel: 'Colombia · South America',   slug: 'bogota' },
  { label: 'Lima',               sublabel: 'Peru · South America',       slug: 'lima' },
  { label: 'Cusco',              sublabel: 'Peru · South America',       slug: 'cusco' },
  { label: 'Buenos Aires',       sublabel: 'Argentina · South America',  slug: 'buenos-aires' },
  { label: 'Mendoza',            sublabel: 'Argentina · South America',  slug: 'mendoza' },
  { label: 'Santiago',           sublabel: 'Chile · South America',      slug: 'santiago' },
  { label: 'Rio de Janeiro',     sublabel: 'Brazil · South America',     slug: 'rio-de-janeiro' },
  { label: 'São Paulo',          sublabel: 'Brazil · South America',     slug: 'sao-paulo' },
  { label: 'Caracas',            sublabel: 'Venezuela · South America',  slug: 'caracas' },
  { label: 'Quito',              sublabel: 'Ecuador · South America',    slug: 'quito' },
  { label: 'La Paz',             sublabel: 'Bolivia · South America',    slug: 'la-paz' },
  { label: 'Montevideo',         sublabel: 'Uruguay · South America',    slug: 'montevideo' },
  { label: 'Asuncion',           sublabel: 'Paraguay · South America',   slug: 'asuncion' },
  { label: 'Sydney',             sublabel: 'Australia · Oceania',        slug: 'sydney' },
  { label: 'Melbourne',          sublabel: 'Australia · Oceania',        slug: 'melbourne' },
  { label: 'Brisbane',           sublabel: 'Australia · Oceania',        slug: 'brisbane' },
  { label: 'Perth',              sublabel: 'Australia · Oceania',        slug: 'perth' },
  { label: 'Auckland',           sublabel: 'New Zealand · Oceania',      slug: 'auckland' },
  { label: 'Queenstown',         sublabel: 'New Zealand · Oceania',      slug: 'queenstown' },
  { label: 'Wellington',         sublabel: 'New Zealand · Oceania',      slug: 'wellington' },
]

// Aliases for common search shortcuts
const ALIASES: Record<string, string> = {
  'nyc': 'new-york', 'ny': 'new-york',
  'la': 'los-angeles', 'sf': 'san-francisco',
  'mtl': 'montreal', 'yvr': 'vancouver', 'yyz': 'toronto',
  'hcmc': 'ho-chi-minh-city', 'saigon': 'ho-chi-minh-city',
  'kl': 'kuala-lumpur',
  'rio': 'rio-de-janeiro',
  'ba': 'buenos-aires',
  'cape': 'cape-town',
  'greek islands': 'santorini',
  'french polynesia': 'bora-bora',
  'nz': 'queenstown',
  'auckland nz': 'auckland',
  'greek': 'santorini',
  'morroco': 'marrakech', 'morocco': 'marrakech',
  'bkk': 'bangkok',
}

function SearchBar() {
  const router = useRouter()
  const [query, setQuery]             = useState('')
  const [range, setRange]             = useState<DateRange>({ start: null, end: null })
  const [calOpen, setCalOpen]         = useState(false)
  const [suggestions, setSuggestions] = useState<typeof ALL_DESTINATIONS>([])
  const [activeIdx, setActiveIdx]     = useState(-1)
  const [selected, setSelected]       = useState<typeof ALL_DESTINATIONS[0] | null>(null)
  const [dropPos, setDropPos]         = useState({ top: 0, left: 0, width: 0 })
  const dateRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sfRef    = useRef<HTMLDivElement>(null)

  // Filter suggestions as user types
  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (!q || selected) { setSuggestions([]); return }

    // Check alias first
    const aliasSlug = ALIASES[q]
    const aliasMatch = aliasSlug ? ALL_DESTINATIONS.filter(d => d.slug === aliasSlug) : []

    const matches = aliasMatch.length > 0 ? aliasMatch : ALL_DESTINATIONS.filter(d =>
      d.label.toLowerCase().includes(q) ||
      d.sublabel.toLowerCase().includes(q) ||
      d.slug.replace(/-/g, ' ').includes(q)
    )
    setSuggestions(matches.slice(0, 8)) // cap at 8 results
    setActiveIdx(-1)
    // Position dropdown below the destination input field
    if (sfRef.current) {
      const rect = sfRef.current.getBoundingClientRect()
      // Width spans destination + date fields — estimate based on search-box
      const searchBox = sfRef.current.closest('.search-box') as HTMLElement | null
      const totalWidth = searchBox ? searchBox.getBoundingClientRect().width : rect.width + 130
      setDropPos({ top: rect.bottom + 4, left: rect.left, width: totalWidth })
    }
  }, [query, selected])

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      const target = e.target as Node
      if (inputRef.current && !inputRef.current.contains(target)) {
        setSuggestions([])
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Close on scroll
  useEffect(() => {
    const handle = () => setSuggestions([])
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])

  function pickSuggestion(d: typeof ALL_DESTINATIONS[0]) {
    setQuery(d.label)
    setSelected(d)
    setSuggestions([])
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (suggestions.length === 0) {
      if (e.key === 'Enter') search()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0) pickSuggestion(suggestions[activeIdx])
      else if (suggestions.length > 0) pickSuggestion(suggestions[0])
      else search()
    } else if (e.key === 'Escape') {
      setSuggestions([])
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setSelected(null)
  }

  function search() {
    const q = query.trim()
    if (!q) return

    // 1. Exact match from selected or typed
    const dest = selected || ALL_DESTINATIONS.find(d =>
      d.label.toLowerCase() === q.toLowerCase()
    )
    if (dest) { router.push(`/destinations/${dest.slug}`); return }

    // 2. Alias match
    const aliasSlug = ALIASES[q.toLowerCase()]
    if (aliasSlug) { router.push(`/destinations/${aliasSlug}`); return }

    // 3. Starts-with match
    const partial = ALL_DESTINATIONS.find(d =>
      d.label.toLowerCase().startsWith(q.toLowerCase())
    )
    if (partial) { router.push(`/destinations/${partial.slug}`); return }

    // 4. Unknown destination — navigate anyway, results page handles it gracefully
    router.push(`/destinations/${q.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`)
  }

  return (
    <div className="search-wrap">
      <div className="search-box">
        {/* Destination */}
        <div ref={sfRef} className="sf">
          <span className="sf-label">Destination</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Tokyo, Tulum, Santorini..."
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        {/* Dates */}
        <div
          ref={dateRef}
          className="sf sf-date"
          onClick={() => { setSuggestions([]); setCalOpen(o => !o) }}
        >
          <span className="sf-label">Travel dates</span>
          <span className={`date-display${range.start ? ' has-dates' : ''}`}>
            {formatDateRange(range)}
          </span>
        </div>

        <button className="s-btn" onClick={() => { setSuggestions([]); search() }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          Search
        </button>
      </div>

      {/* Autocomplete dropdown — rendered via fixed positioning to escape overflow:hidden */}
      {suggestions.length > 0 && (
        <div
          className="autocomplete-dropdown"
          style={{
            position: 'fixed',
            top: dropPos.top,
            left: dropPos.left,
            width: dropPos.width,
            zIndex: 99999,
          }}
        >
          {suggestions.map((d, i) => (
            <button
              key={d.slug}
              className={`autocomplete-item${i === activeIdx ? ' active' : ''}`}
              onMouseDown={e => { e.preventDefault(); pickSuggestion(d) }}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <span className="ac-label">{d.label}</span>
              <span className="ac-sub">{d.sublabel}</span>
            </button>
          ))}
        </div>
      )}

      {/* Popular chips */}
      <div className="hints">
        <span className="h-label">Popular:</span>
        {['Amalfi Coast', 'Bali', 'Marrakech', 'Lisbon', 'Tokyo'].map(d => {
          const dest = ALL_DESTINATIONS.find(x => x.label === d)!
          return (
            <button
              key={d}
              className="chip"
              onClick={() => { setQuery(d); setSelected(dest); setSuggestions([]) }}
            >
              {d}
            </button>
          )
        })}
      </div>

      {/* Calendar */}
      {calOpen && (
        <Calendar
          range={range}
          onChange={setRange}
          onClose={() => setCalOpen(false)}
          anchorRef={dateRef}
        />
      )}
    </div>
  )
}

// ── Nav ────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <a href="/" className="nav-logo">
          <span className="logo-text">parche</span>
        </a>
        <ul className="nav-links">
          <li><a href="#destinations">Destinations</a></li>
          <li><a href="#trending">Trending</a></li>
          <li><a href="#guides">Style Guides</a></li>
          <li><a href="#about">About</a></li>
        </ul>
        <div className="nav-right">
          <a href="#" className="btn-ghost">Sign in</a>
          <a href="#" className="btn-primary">Plan my trip</a>
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <ul className="mob-links">
          {[
            ['Destinations', '#destinations'],
            ['Trending',     '#trending'],
            ['Style Guides', '#guides'],
            ['About',        '#about'],
            ['Sign in',      '#'],
          ].map(([label, href]) => (
            <li key={label}>
              <a href={href} onClick={() => setMenuOpen(false)}>
                {label} <span className="arr">↗</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mob-dest-section">
          <p className="mob-dest-label">Popular destinations</p>
          <div className="mob-dest-chips">
            {['Amalfi Coast','Bali','Marrakech','Lisbon','Tokyo','Tulum','Santorini','Kyoto'].map(d => (
              <a key={d} href={`/destinations/${d.toLowerCase().replace(/\s+/g,'-')}`} className="mob-chip">
                {d}
              </a>
            ))}
          </div>
        </div>
        <div className="mob-footer">
          <a href="#" className="mob-cta">Plan my trip →</a>
          <a href="#" className="mob-signin">Already have an account? Sign in</a>
        </div>
      </div>
    </>
  )
}

// ── Destination Card ───────────────────────────────────
function DestCard({ dest, delay }: { dest: typeof featuredDestinations[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVis(true)
        obs.disconnect()
        fetchPhoto(`woman ${dest.name} fashion travel style outfit editorial`, 'portrait').then(setPhoto)
      }
    }, { threshold: 0.1 })
    obs.observe(el); return () => obs.disconnect()
  }, [dest.name])
  return (
    <div ref={ref} className={`dc reveal delay-${delay}${vis ? ' visible' : ''}`}>
      <a href={`/destinations/${dest.slug}`} className="dc-img-link">
        <div className="dc-img">
          {photo
            ? <img src={photo} alt={dest.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
            : <div className={`dc-bg ${dest.bgClass}`} />
          }
          <div className="dc-overlay">
            <span className="dc-temp">{dest.temp}</span>
          </div>
        </div>
      </a>
      <p className="dc-region">{dest.country} · {dest.region}</p>
      <p className="dc-name">{dest.name}</p>
      <div className="dc-tags">
        {dest.tags.slice(0,3).map(t => <span key={t} className="tag tag-sand">{t}</span>)}
      </div>
    </div>
  )
}

// ── Reveal wrapper ─────────────────────────────────────
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.08 })
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return <div ref={ref} className={`reveal${vis ? ' visible' : ''} ${className}`}>{children}</div>
}

// ── Trending Section ───────────────────────────────────────
const TRENDING_ITEMS = [
  { likes: '3.2M likes this week', name: 'Linen co-ord sets — coastal summer', dest: 'Mediterranean · Beach Club', platform: 'TikTok · Viral', plClass: 'p-tiktok', featured: true,  query: 'woman linen outfit Mediterranean beach summer fashion editorial' },
  { likes: '1.1M likes',           name: 'Tokyo street layers',                 dest: 'Japan · City',               platform: 'Instagram',      plClass: 'p-insta',  featured: false, query: 'Tokyo women street fashion minimal outfit editorial' },
  { likes: '780K saves',           name: 'Tulum boho resort',                   dest: 'Mexico · Caribbean',         platform: 'Pinterest',      plClass: 'p-pin',    featured: false, query: 'woman boho resort beach Tulum vacation outfit editorial' },
  { likes: '920K likes',           name: 'Desert earth tones',                  dest: 'Morocco · Desert',           platform: 'TikTok',         plClass: 'p-tiktok', featured: false, query: 'woman earth tones desert fashion elegant outfit editorial' },
  { likes: '540K likes',           name: 'Santorini blue & white',              dest: 'Greece · Island',            platform: 'Instagram',      plClass: 'p-insta',  featured: false, query: 'woman Santorini Greece white dress fashion editorial' },
]

function TrendingSection() {
  const [photos, setPhotos] = useState<(string | null)[]>(TRENDING_ITEMS.map(() => null))

  useEffect(() => {
    Promise.all(
      TRENDING_ITEMS.map((t, i) => fetchPhoto(t.query, i === 0 ? 'portrait' : 'portrait'))
    ).then(setPhotos)
  }, [])

  return (
    <Reveal>
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Social trending</p>
          <h2 className="section-title">What the world is <span className="it">wearing.</span></h2>
        </div>
        <a href="#" className="link-arrow">All trends →</a>
      </div>
      <div className="trending-grid">
        {TRENDING_ITEMS.map((t, i) => (
          <div key={i} className={`trend-card${t.featured ? ' trend-featured' : ''}`}>
            <div className={`trend-img${t.featured ? ' trend-img-tall' : ''}`}>
              {photos[i]
                ? <img src={photos[i]!} alt={t.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                : <div className="trend-bg-placeholder" />
              }
              <span className={`trend-platform ${t.plClass}`}>{t.platform}</span>
            </div>
            <div className="trend-body">
              <p className="trend-likes">{t.likes}</p>
              <p className={`trend-name display${t.featured ? ' trend-name-lg' : ''}`}>{t.name}</p>
              {t.dest && <p className="trend-dest">{t.dest}</p>}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  )
}

// ── Editorial Section ──────────────────────────────────────
const EDITORIAL_ITEMS = [
  { dest: 'Lisbon · October',       query: 'woman fashion portrait autumn coat style editorial',             title: 'The Art of the European City Break',           desc: "Lisbon in October sits at 18°C on a good day. The cobblestones demand flat shoes. The fado bars demand a collar. Nine pieces that cover all of it.", tags: ['City','Layers','Chic'] },
  { dest: 'Marrakech · Any season', query: 'woman fashion model linen dress sunny warm portrait editorial',  title: 'Dressing Modestly Without Sacrificing Style',  desc: "Morocco requires covered shoulders in the medina. There\'s a much better approach than shapeless coverups — breathable, elegant, beautiful.", tags: ['Desert','Modest','Breathable'] },
  { dest: 'Bali · Year-round',      query: 'woman beach resort fashion model tropical dress editorial',      title: "Resort Wear That Doesn\'t Look Like a Tourist", desc: "The difference between belonging in Seminyak and looking fresh off a package tour is three pieces: a linen shirt, a quality sarong, and real shoes.", tags: ['Tropical','Boho','Resort'] },
]

function EditorialSection() {
  const [photos, setPhotos] = useState<(string | null)[]>(EDITORIAL_ITEMS.map(() => null))

  useEffect(() => {
    Promise.all(EDITORIAL_ITEMS.map(e => fetchPhoto(e.query, 'portrait'))).then(setPhotos)
  }, [])

  return (
    <Reveal>
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Editorial</p>
          <h2 className="section-title">Style guides by <span className="it">destination.</span></h2>
        </div>
        <a href="#" className="link-arrow">All guides →</a>
      </div>
      <div className="editorial-grid">
        {EDITORIAL_ITEMS.map((e, i) => (
          <Reveal key={i} className={`delay-${i+1}`}>
            <div className="ed-card">
              <div className="ed-img">
                {photos[i]
                  ? <img src={photos[i]!} alt={e.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.7s' }} />
                  : <div className="ed-bg-placeholder" />
                }
              </div>
              <div className="ed-body">
                <p className="ed-dest">{e.dest}</p>
                <h3 className="ed-title">{e.title}</h3>
                <p className="ed-desc">{e.desc}</p>
                <div className="ed-tags">
                  {e.tags.map(t => <span key={t} className="tag tag-sky">{t}</span>)}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Reveal>
  )
}


// ── Destinations Section (tabbed) ─────────────────────────
const TAB_DESTINATIONS: Record<string, { name: string; country: string; region: string; slug: string; temp: string; bgClass: string; tags: string[]; query: string }[]> = {
  All: [
    { name: 'Lisbon',       country: 'Portugal',   region: 'Europe',          slug: 'lisbon',       temp: '16–22°C', bgClass: 'bg-lisbon',    tags: ['City','Layers','Chic'],         query: 'woman stylish outfit Lisbon city fashion editorial' },
    { name: 'Bali',         country: 'Indonesia',  region: 'Asia',            slug: 'bali',         temp: '27–32°C', bgClass: 'bg-bali',      tags: ['Beach','Boho','Resort'],        query: 'woman Bali resort beach fashion editorial' },
    { name: 'Marrakech',    country: 'Morocco',    region: 'North Africa',    slug: 'marrakech',    temp: '18–36°C', bgClass: 'bg-marrakech', tags: ['Desert','Modest','Earthy'],     query: 'woman elegant Marrakech Morocco fashion editorial' },
    { name: 'Amalfi Coast', country: 'Italy',      region: 'Mediterranean',   slug: 'amalfi-coast', temp: '24–30°C', bgClass: 'bg-amalfi',    tags: ['Beach','Mediterranean','Resort'], query: 'woman Amalfi Coast Italy summer fashion editorial' },
  ],
  Beach: [
    { name: 'Bali',         country: 'Indonesia',  region: 'Asia',            slug: 'bali',         temp: '27–32°C', bgClass: 'bg-bali',      tags: ['Beach','Boho','Resort'],       query: 'woman Bali beach resort fashion editorial' },
    { name: 'Tulum',        country: 'Mexico',     region: 'Caribbean',       slug: 'tulum',        temp: '28–34°C', bgClass: 'bg-tulum',     tags: ['Beach','Boho','Tropical'],     query: 'woman Tulum beach boho fashion editorial' },
    { name: 'Maldives',     country: 'Maldives',   region: 'Indian Ocean',    slug: 'maldives',     temp: '28–32°C', bgClass: 'bg-bali',      tags: ['Beach','Resort','Island'],     query: 'woman Maldives beach luxury resort fashion editorial' },
    { name: 'Amalfi Coast', country: 'Italy',      region: 'Mediterranean',   slug: 'amalfi-coast', temp: '24–30°C', bgClass: 'bg-amalfi',    tags: ['Beach','Mediterranean','Chic'], query: 'woman Amalfi Coast Italy fashion editorial' },
  ],
  City: [
    { name: 'Tokyo',        country: 'Japan',      region: 'East Asia',       slug: 'tokyo',        temp: '8–16°C',  bgClass: 'bg-tokyo',     tags: ['City','Street','Minimal'],     query: 'woman Tokyo street fashion minimal outfit editorial' },
    { name: 'Paris',        country: 'France',     region: 'Europe',          slug: 'paris',        temp: '10–22°C', bgClass: 'bg-lisbon',    tags: ['City','Elegant','Chic'],       query: 'woman Paris France fashion elegant outfit editorial' },
    { name: 'Lisbon',       country: 'Portugal',   region: 'Europe',          slug: 'lisbon',       temp: '16–22°C', bgClass: 'bg-lisbon',    tags: ['City','Layers','Casual'],      query: 'woman Lisbon Portugal city fashion street style editorial' },
    { name: 'Barcelona',    country: 'Spain',      region: 'Europe',          slug: 'barcelona',    temp: '18–28°C', bgClass: 'bg-amalfi',    tags: ['City','Casual','Smart'],       query: 'woman Barcelona Spain fashion summer outfit editorial' },
  ],
  Mountain: [
    { name: 'Queenstown',   country: 'New Zealand', region: 'Oceania',        slug: 'queenstown',   temp: '5–15°C',  bgClass: 'bg-tokyo',     tags: ['Mountain','Outdoor','Layers'], query: 'woman Queenstown New Zealand mountain fashion outdoor editorial' },
    { name: 'Reykjavik',    country: 'Iceland',    region: 'North Atlantic',  slug: 'reykjavik',    temp: '-2–12°C', bgClass: 'bg-tokyo',     tags: ['Cold','Outdoor','Layers'],     query: 'woman Iceland mountain fashion winter outfit editorial' },
    { name: 'Patagonia',    country: 'Argentina',  region: 'South America',   slug: 'patagonia',    temp: '2–16°C',  bgClass: 'bg-tokyo',     tags: ['Outdoor','Layers','Cold'],     query: 'woman Patagonia outdoor adventure fashion editorial' },
    { name: 'Kyoto',        country: 'Japan',      region: 'East Asia',       slug: 'kyoto',        temp: '12–26°C', bgClass: 'bg-tokyo',     tags: ['City','Elegant','Cultural'],   query: 'woman Kyoto Japan fashion elegant outfit editorial' },
  ],
  Desert: [
    { name: 'Marrakech',    country: 'Morocco',    region: 'North Africa',    slug: 'marrakech',    temp: '18–36°C', bgClass: 'bg-marrakech', tags: ['Desert','Modest','Earthy'],    query: 'woman elegant Marrakech Morocco fashion editorial' },
    { name: 'Dubai',        country: 'UAE',        region: 'Middle East',     slug: 'dubai',        temp: '20–40°C', bgClass: 'bg-marrakech', tags: ['Desert','Elegant','Resort'],   query: 'woman Dubai fashion elegant outfit desert editorial' },
    { name: 'Cappadocia',   country: 'Turkey',     region: 'Middle East',     slug: 'cappadocia',   temp: '8–28°C',  bgClass: 'bg-marrakech', tags: ['Desert','Cultural','Earthy'],  query: 'woman Cappadocia Turkey fashion travel outfit editorial' },
    { name: 'Oaxaca',       country: 'Mexico',     region: 'North America',   slug: 'oaxaca',       temp: '15–28°C', bgClass: 'bg-marrakech', tags: ['Cultural','Boho','Earthy'],    query: 'woman Oaxaca Mexico fashion boho travel outfit editorial' },
  ],
  Island: [
    { name: 'Santorini',    country: 'Greece',     region: 'Mediterranean',   slug: 'santorini',    temp: '22–30°C', bgClass: 'bg-amalfi',    tags: ['Island','Resort','Elegant'],   query: 'woman Santorini Greece white dress fashion editorial' },
    { name: 'Mykonos',      country: 'Greece',     region: 'Mediterranean',   slug: 'mykonos',      temp: '22–30°C', bgClass: 'bg-amalfi',    tags: ['Island','Resort','Chic'],      query: 'woman Mykonos Greece fashion summer outfit editorial' },
    { name: 'Bora Bora',    country: 'French Polynesia', region: 'Pacific',   slug: 'bora-bora',    temp: '26–30°C', bgClass: 'bg-bali',      tags: ['Island','Beach','Luxury'],     query: 'woman Bora Bora beach resort luxury fashion editorial' },
    { name: 'Mallorca',     country: 'Spain',      region: 'Mediterranean',   slug: 'mallorca',     temp: '20–30°C', bgClass: 'bg-amalfi',    tags: ['Island','Beach','Casual'],     query: 'woman Mallorca Spain beach fashion summer editorial' },
  ],
  Winter: [
    { name: 'Montreal',     country: 'Canada',     region: 'North America',   slug: 'montreal',     temp: '-15–4°C', bgClass: 'bg-tokyo',     tags: ['City','Cold','Layers'],        query: 'woman winter coat snow city fashion editorial' },
    { name: 'Stockholm',    country: 'Sweden',     region: 'Scandinavia',     slug: 'stockholm',    temp: '-2–8°C',  bgClass: 'bg-tokyo',     tags: ['City','Minimal','Cold'],       query: 'woman Stockholm Sweden winter fashion minimal outfit editorial' },
    { name: 'Tokyo',        country: 'Japan',      region: 'East Asia',       slug: 'tokyo',        temp: '4–10°C',  bgClass: 'bg-tokyo',     tags: ['City','Street','Layers'],      query: 'woman Tokyo winter street fashion layers outfit editorial' },
    { name: 'Edinburgh',    country: 'Scotland',   region: 'UK',              slug: 'edinburgh',    temp: '4–12°C',  bgClass: 'bg-tokyo',     tags: ['City','Layering','Classic'],   query: 'woman Edinburgh Scotland fashion winter outfit editorial' },
  ],
}

const TAB_LABELS = ['All','Beach','City','Mountain','Desert','Island','Winter']

function DestCard2({ dest, delay }: { dest: typeof TAB_DESTINATIONS.All[0]; delay: number }) {
  const ref   = useRef<HTMLDivElement>(null)
  const [vis, setVis]     = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)

  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVis(true)
        obs.disconnect()
        fetchPhoto(dest.query, 'portrait').then(setPhoto)
      }
    }, { threshold: 0.05 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [dest.query])

  return (
    <div ref={ref} className={`dc reveal delay-${delay}${vis ? ' visible' : ''}`}>
      <a href={`/destinations/${dest.slug}`} className="dc-img-link">
        <div className="dc-img">
          {photo
            ? <img src={photo} alt={dest.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} />
            : <div className={`dc-bg ${dest.bgClass}`} />
          }
          <div className="dc-overlay">
            <span className="dc-temp">{dest.temp}</span>
          </div>
        </div>
      </a>
      <p className="dc-region">{dest.country} · {dest.region}</p>
      <p className="dc-name">{dest.name}</p>
      <div className="dc-tags">
        {dest.tags.slice(0,3).map(t => <span key={t} className="tag tag-sand">{t}</span>)}
      </div>
    </div>
  )
}

function DestinationsSection() {
  const [activeTab, setActiveTab] = useState('All')
  const dests = TAB_DESTINATIONS[activeTab] || TAB_DESTINATIONS.All

  return (
    <>
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Explore</p>
          <h2 className="section-title">Where are you <span className="it">headed?</span></h2>
        </div>
      </div>
      <div className="tabs">
        {TAB_LABELS.map(t => (
          <button
            key={t}
            className={`tab${activeTab === t ? ' active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="dest-grid">
        {dests.map((d, i) => (
          <DestCard2 key={`${activeTab}-${d.slug}`} dest={d} delay={i + 1} />
        ))}
      </div>
    </>
  )
}


// ── Hero Mosaic ────────────────────────────────────────────
const MOSAIC_TILES = [
  { name: 'Amalfi Coast', sub: 'Linen · Sandals · Sundresses', temp: '28°C · Sunny', bgClass: 'bg-amalfi',    slug: 'amalfi-coast', query: 'Amalfi Coast Italy fashion summer' },
  { name: 'Marrakech',    sub: 'Earthy · Modest',               temp: '33°C',         bgClass: 'bg-marrakech', slug: 'marrakech',    query: 'Marrakech Morocco fashion travel' },
  { name: 'Bali',         sub: 'Boho · Resort',                 temp: '29°C',         bgClass: 'bg-bali',      slug: 'bali',         query: 'woman Bali Indonesia resort fashion beach outfit editorial' },
]

function HeroMosaic() {
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null])

  useEffect(() => {
    Promise.all(
      MOSAIC_TILES.map((t, i) =>
        fetchPhoto(t.query, i === 0 ? 'landscape' : 'portrait')
      )
    ).then(setPhotos)
  }, [])

  return (
    <div className="hero-mosaic">
      {MOSAIC_TILES.map((t, i) => (
        <a key={t.slug} href={`/destinations/${t.slug}`} className={`mosaic-tile${i === 0 ? ' mosaic-large' : ''}`}>
          {photos[i]
            ? <img src={photos[i]!} alt={t.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.8s ease' }} />
            : <div className={`mosaic-bg ${t.bgClass}`} />
          }
          <span className="mosaic-badge">{t.temp}</span>
          <div className="mosaic-info">
            <p className="mosaic-city display">{t.name}</p>
            <p className="mosaic-sub">{t.sub}</p>
          </div>
        </a>
      ))}
    </div>
  )
}


// ── Page ───────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Nav />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-emblem">
          <Image src="/logos/parche_emblem_black.png" alt="" width={600} height={600} aria-hidden />
        </div>
        <div className="hero-left">
          <span className="hero-eyebrow">Destination fashion, curated</span>
          <h1 className="hero-title">
            Dress for<br />where you&apos;re<br />
            <span className="display" style={{ color: 'var(--sand)' }}>going.</span>
          </h1>
          <p className="hero-desc">
            Enter your destination and travel dates. We&apos;ll tell you exactly what to wear — curated for the weather, the culture, and the vibe.
          </p>
          <SearchBar />
        </div>
        <HeroMosaic />
      </section>

      {/* ── TICKER ── */}
      <div className="ticker">
        <div className="ticker-track">
          {[
            'Linen sets for the Mediterranean',
            'New: Tokyo street style guide',
            '120+ destinations covered',
            'Real weather · Real style',
            'New: Bali resort wear drop',
            'Curated for your trip, not the algorithm',
          ].concat([
            'Linen sets for the Mediterranean',
            'New: Tokyo street style guide',
            '120+ destinations covered',
            'Real weather · Real style',
            'New: Bali resort wear drop',
            'Curated for your trip, not the algorithm',
          ]).map((item, i) => (
            <span key={i} className="ticker-item">
              {item} <span className="ticker-sep">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURE STRIP ── */}
      <Reveal>
        <div className="feature-strip">
          {[
            {
              title: 'Destination-aware',
              desc: 'Every recommendation is built around your exact destination, dates, and the local weather forecast — not generic advice.',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
              ),
            },
            {
              title: 'Curated, not generated',
              desc: "Real editorial judgment behind every pick. We care about what locals actually wear, not just what\u2019s trending.",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              ),
            },
            {
              title: 'Shop at every price',
              desc: 'New arrivals and secondhand together. Same look, at luxury, mid-range, and budget — your call.',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              ),
            },
          ].map(f => (
            <div key={f.title} className="feat">
              <div className="feat-icon">{f.icon}</div>
              <p className="feat-title">{f.title}</p>
              <p className="feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── DESTINATIONS ── */}
      <section id="destinations" className="section">
        <DestinationsSection />
      </section>

      {/* ── AD ── */}
      <div className="ad-band">
        <p className="ad-sponsor-label">Sponsored</p>
        <div className="ad-slot" style={{ height: 90, maxWidth: 728, margin: '0 auto' }}>
          <span className="ad-slot-size">728 × 90</span>
          <span className="ad-slot-label">Leaderboard</span>
        </div>
      </div>

      {/* ── TRENDING ── */}
      <section id="trending" className="section section-alt">
        <TrendingSection />
      </section>

      {/* ── EDITORIAL ── */}
      <section id="guides" className="section">
        <EditorialSection />
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="newsletter">
        <div>
          <h2 className="nl-title">
            Never pack<br />the <em className="display" style={{ color: 'var(--sand)' }}>wrong thing.</em>
          </h2>
          <p className="nl-desc">Weekly destination guides, trending looks, and style dispatches. Good taste, once a week. No noise.</p>
        </div>
        <div>
          <div className="nl-form">
            <input className="nl-input" type="email" placeholder="your@email.com" />
            <button className="nl-btn">Subscribe</button>
          </div>
          <p className="nl-fine">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <Image
              src="/logos/parche_emblem_white.png"
              alt=""
              width={32}
              height={32}
              style={{ width: '32px', height: '32px', display: 'block', objectFit: 'contain' }}
            />
            <span className="footer-wordmark">parche</span>
            </div>
            <p className="footer-tagline">
              Destination fashion, curated by real weather data and local style knowledge.
              We earn a small commission on purchases — at no extra cost to you.
            </p>
          </div>
          {[
            { title: 'Explore',  links: ['Beach & Island','City Breaks','Mountain','Desert','All Destinations'] },
            { title: 'Style',    links: ['Trending Now','Packing Guides','By Temperature','Budget Picks','Luxury Picks'] },
            { title: 'Company', links: ['About','Advertise','Affiliate Disclosure','Privacy Policy','Contact'] },
          ].map(col => (
            <div key={col.title} className="footer-col">
              <p className="footer-col-title">{col.title}</p>
              <ul>{col.links.map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>© 2026 parche. All rights reserved.</p>
          <p>Affiliate links may earn us a commission. <a href="#">Disclosure</a></p>
        </div>
      </footer>

      <style>{pageStyles}</style>
    </>
  )
}

// ── Styles ─────────────────────────────────────────────
const pageStyles = `
/* NAV */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 500;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 3rem;
  height: 72px;
  background: #ffffff;
  border-bottom: 1px solid var(--border);
  transition: height 0.3s;
}
.nav.scrolled {
  height: 64px;
}
.nav-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}
.logo-text {
  font-family: var(--font-body);
  font-size: 1.85rem;
  font-weight: 300;
  letter-spacing: -0.04em;
  color: var(--black);
  line-height: 1;
  display: block;
}
.nav-links { display: flex; gap: 2.5rem; list-style: none; }
.nav-links a { color: var(--char); text-decoration: none; font-size: 0.9rem; font-weight: 400; letter-spacing: 0.01em; transition: color 0.2s; }
.nav-links a:hover { color: var(--black); }
.nav-right { display: flex; align-items: center; gap: 1rem; }

/* HAMBURGER */
.hamburger {
  display: none; flex-direction: column; justify-content: center;
  align-items: center; width: 40px; height: 40px; gap: 5px;
  background: none; border: none; cursor: pointer;
}
.hamburger span {
  display: block; width: 22px; height: 1.5px; background: var(--black);
  border-radius: 2px;
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s, width 0.3s;
  transform-origin: center;
}
.hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; width: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

/* MOBILE MENU */
.mobile-menu {
  position: fixed; inset: 0; z-index: 800;
  background: var(--white);
  display: flex; flex-direction: column;
  padding: 6rem 1.5rem 2rem;
  transform: translateX(100%);
  transition: transform 0.45s cubic-bezier(0.4,0,0.2,1);
  overflow-y: auto;
}
.mobile-menu.open { transform: translateX(0); }
.mob-links { list-style: none; border-top: 1px solid var(--border); margin-bottom: 2rem; }
.mob-links li { border-bottom: 1px solid var(--border); }
.mob-links a {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.1rem 0; color: var(--black); text-decoration: none;
  font-size: 1.3rem; font-weight: 200; letter-spacing: -0.02em;
  transition: color 0.2s;
}
.mob-links a:hover { color: var(--sand); }
.arr { font-size: 0.9rem; color: var(--light); }
.mob-dest-section { margin-bottom: 2rem; }
.mob-dest-label { font-size: 0.55rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--light); margin-bottom: 0.8rem; }
.mob-dest-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.mob-chip { font-size: 0.72rem; padding: 0.4rem 1rem; border: 1px solid var(--border-s); border-radius: 100px; color: var(--char); text-decoration: none; transition: all 0.2s; }
.mob-chip:hover { border-color: var(--sand); color: var(--sand); }
.mob-footer { margin-top: auto; }
.mob-cta { display: block; text-align: center; background: var(--black); color: var(--white); padding: 1rem; border-radius: 14px; font-size: 0.85rem; font-weight: 500; text-decoration: none; margin-bottom: 1rem; transition: background 0.2s; }
.mob-cta:hover { background: var(--char); }
.mob-signin { display: block; text-align: center; color: var(--mid); font-size: 0.8rem; text-decoration: none; }

/* HERO */
.hero {
  min-height: 100svh; background: var(--white);
  position: relative; overflow: hidden;
  display: grid; grid-template-columns: 1fr 1fr;
  padding-top: 72px;
}
.hero-emblem {
  position: absolute; right: -8vw; top: 50%; transform: translateY(-50%);
  width: 60vw; height: 60vw; opacity: 0.04; pointer-events: none; z-index: 0;
}
.hero-emblem img { width: 100%; height: 100%; object-fit: contain; }
.hero-left {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; justify-content: center;
  padding: 4rem 3rem;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 0.6rem;
  font-size: 0.62rem; letter-spacing: 0.3em; text-transform: uppercase;
  color: var(--sand); margin-bottom: 1.8rem;
}
.hero-eyebrow::before { content: ''; width: 1.5rem; height: 1px; background: var(--sand); }
.hero-title {
  font-size: clamp(2.8rem, 5vw, 6rem); font-weight: 200; line-height: 1;
  letter-spacing: -0.03em; color: var(--black); margin-bottom: 1.5rem;
}
.hero-desc { font-size: 0.88rem; line-height: 1.85; color: var(--mid); max-width: 25rem; margin-bottom: 2.5rem; }

/* HERO MOSAIC */
.hero-mosaic {
  position: relative; z-index: 2;
  display: grid; grid-template-columns: 1fr 1fr;
  grid-template-rows: 58% 42%;
  gap: 3px; padding: 4rem 3rem 4rem 1rem;
}
.mosaic-tile {
  position: relative; overflow: hidden; border-radius: 16px;
  text-decoration: none; display: block;
}
.mosaic-tile:first-child { grid-column: 1 / -1; grid-row: 1; }
.mosaic-bg { position: absolute; inset: 0; transition: transform 0.8s ease; }
.mosaic-tile:hover .mosaic-bg { transform: scale(1.05); }
.mosaic-tile::after {
  content: ''; position: absolute; inset: 0; border-radius: 16px;
  background: linear-gradient(to top, rgba(10,10,10,0.65) 0%, transparent 55%);
  z-index: 1;
}
.mosaic-info { position: absolute; bottom: 0; left: 0; right: 0; padding: 1.1rem 1.2rem; z-index: 2; }
.mosaic-city { font-size: 1.8rem; color: var(--white); line-height: 1; margin-bottom: 0.15rem; }
.mosaic-tile:not(:first-child) .mosaic-city { font-size: 1.2rem; }
.mosaic-sub { font-size: 0.57rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.55); }
.mosaic-badge {
  position: absolute; top: 0.8rem; right: 0.8rem; z-index: 2;
  background: rgba(255,255,255,0.88); backdrop-filter: blur(8px);
  border: 1px solid rgba(10,10,10,0.08); color: var(--black);
  font-size: 0.58rem; letter-spacing: 0.08em;
  padding: 0.28rem 0.7rem; border-radius: 100px;
}

/* SEARCH */
.search-wrap { position: relative; }
.search-box {
  display: flex; border: 1.5px solid var(--black); border-radius: 14px;
  overflow: hidden; background: var(--white); transition: box-shadow 0.3s;
}
.search-box:focus-within { box-shadow: 0 4px 24px rgba(10,10,10,0.1); }
.sf { flex: 1; padding: 0.9rem 1.1rem; display: flex; flex-direction: column; gap: 0.1rem; border-right: 1px solid var(--border); min-width: 0; }
.sf-label { font-size: 0.48rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--light); }
.sf input { border: none; outline: none; background: transparent; font-family: var(--font-body); font-size: 0.82rem; font-weight: 300; color: var(--black); width: 100%; }
.sf input::placeholder { color: var(--mist); }
.sf-date { min-width: 130px; flex-shrink: 0; cursor: pointer; user-select: none; }
.date-display { font-size: 0.82rem; font-weight: 300; color: var(--mist); padding-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.date-display.has-dates { color: var(--black); }
.s-btn {
  background: var(--black); color: var(--white); border: none;
  padding: 0 1.4rem; cursor: pointer; white-space: nowrap;
  font-family: var(--font-body); font-size: 0.68rem; font-weight: 500;
  letter-spacing: 0.1em; display: flex; align-items: center; gap: 0.45rem;
  transition: background 0.2s;
}
.s-btn:hover { background: var(--char); }
.hints { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.85rem; flex-wrap: wrap; }
.h-label { font-size: 0.6rem; color: var(--light); letter-spacing: 0.08em; flex-shrink: 0; }
.chip {
  font-size: 0.6rem; padding: 0.22rem 0.75rem;
  border: 1px solid var(--border-s); border-radius: 100px;
  color: var(--char); cursor: pointer; transition: all 0.2s;
  background: none; font-family: var(--font-body);
}
.chip:hover { border-color: var(--sand); color: var(--sand); }

/* CALENDAR */
.cal-wrap {
  position: fixed; z-index: 99999;
  background: var(--white); border: 1.5px solid var(--black);
  border-radius: 18px; padding: 1.4rem; width: 316px;
  box-shadow: 0 20px 60px rgba(10,10,10,0.2);
}
.cal-wrap::before {
  content: ''; position: absolute; top: -7px; left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px; height: 12px; background: var(--white);
  border-left: 1.5px solid var(--black); border-top: 1.5px solid var(--black);
}
.cal-wrap.flip-up::before {
  top: auto; bottom: -7px;
  border-left: none; border-top: none;
  border-right: 1.5px solid var(--black); border-bottom: 1.5px solid var(--black);
}
.cal-mobile {
  position: fixed !important; top: auto !important; bottom: 0 !important;
  left: 0 !important; right: 0 !important; width: 100% !important;
  border-radius: 20px 20px 0 0; border-bottom: none;
  padding: 1.8rem 1.2rem 3rem;
  box-shadow: 0 -8px 40px rgba(10,10,10,0.22);
}
.cal-mobile::before { display: none; }
.cal-mobile::after {
  content: ''; position: absolute; top: 0.7rem; left: 50%; transform: translateX(-50%);
  width: 36px; height: 3px; border-radius: 2px; background: var(--mist);
}
.cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; }
.cal-month-label { font-size: 0.82rem; font-weight: 500; letter-spacing: 0.04em; }
.cal-nav {
  background: none; border: none; cursor: pointer;
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--mid); font-size: 1.1rem; line-height: 1;
  font-family: var(--font-body); transition: background 0.12s;
}
.cal-nav:hover { background: var(--off); color: var(--black); }
.cal-dow { display: grid; grid-template-columns: repeat(7,1fr); margin-bottom: 0.4rem; }
.cal-dow span { text-align: center; font-size: 0.54rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--light); padding: 0.2rem 0; }
.cal-days { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; }
.cal-day {
  aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 300; border-radius: 50%; border: none;
  background: none; font-family: var(--font-body); color: var(--black);
  position: relative; transition: background 0.1s, color 0.1s; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.cal-day:not(.empty):not(.past):hover { background: var(--off); }
.cal-day.past { color: var(--mist); pointer-events: none; }
.cal-day.empty { pointer-events: none; }
.cal-day.today::after {
  content: ''; position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%);
  width: 3px; height: 3px; border-radius: 50%; background: var(--sand);
}
.cal-day.start, .cal-day.end { background: var(--black) !important; color: var(--white) !important; border-radius: 50%; }
.cal-day.in-range { background: var(--sand-p); color: var(--sand-d); border-radius: 0; }
.cal-day.range-s { border-radius: 50% 0 0 50%; }
.cal-day.range-e { border-radius: 0 50% 50% 0; }
.cal-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
.cal-hint { font-size: 0.62rem; color: var(--light); }
.cal-clear { font-size: 0.62rem; color: var(--mid); background: none; border: none; cursor: pointer; font-family: var(--font-body); text-decoration: underline; text-underline-offset: 2px; padding: 0; }
.cal-clear:hover { color: var(--black); }

/* TICKER */
.ticker { background: var(--black); padding: 0.62rem 0; overflow: hidden; white-space: nowrap; }
.ticker-track { display: inline-flex; animation: ticker 32s linear infinite; gap: 3rem; }
.ticker-item { font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.45); flex-shrink: 0; }
.ticker-sep { color: var(--sand); margin: 0 0.25rem; }

/* FEATURE STRIP */
.feature-strip { display: grid; grid-template-columns: repeat(3,1fr); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.feat { padding: 2.5rem 3rem; border-right: 1px solid var(--border); }
.feat:last-child { border-right: none; }
.feat-icon { width: 42px; height: 42px; border-radius: 12px; background: var(--off); display: flex; align-items: center; justify-content: center; margin-bottom: 1.1rem; }
.feat-title { font-size: 0.95rem; font-weight: 500; margin-bottom: 0.5rem; letter-spacing: -0.01em; }
.feat-desc { font-size: 0.73rem; color: var(--mid); line-height: 1.8; }

/* SECTION HEADER */
.section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; gap: 1rem; }
.link-arrow { font-size: 0.68rem; color: var(--light); text-decoration: none; border-bottom: 1px solid var(--border); padding-bottom: 0.1rem; transition: color 0.2s, border-color 0.2s; white-space: nowrap; }
.link-arrow:hover { color: var(--black); border-color: var(--black); }

/* TABS */
.tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 2.5rem; overflow-x: auto; scrollbar-width: none; }
.tabs::-webkit-scrollbar { display: none; }
.tab { padding: 0.6rem 1.1rem; font-size: 0.62rem; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; color: var(--light); background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; font-family: var(--font-body); font-weight: 400; transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
.tab:hover { color: var(--black); }
.tab.active { color: var(--black); border-bottom-color: var(--black); }

/* DEST GRID */
.dest-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.2rem; }
.dc { cursor: pointer; }
.dc-img-link { display: block; text-decoration: none; }
.dc-img { width: 100%; aspect-ratio: 3/4; position: relative; overflow: hidden; border-radius: 16px; margin-bottom: 0.9rem; }
.dc-bg { position: absolute; inset: 0; transition: transform 0.7s ease; }
.dc:hover .dc-bg { transform: scale(1.05); }
.dc-img::after { content: ''; position: absolute; inset: 0; border-radius: 16px; background: linear-gradient(to top, rgba(10,10,10,0.58) 0%, transparent 55%); }
.dc-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 1rem 1.1rem; z-index: 2; }
.dc-temp { font-size: 0.57rem; letter-spacing: 0.1em; color: var(--black); background: rgba(255,255,255,0.85); backdrop-filter: blur(4px); padding: 0.2rem 0.65rem; border-radius: 100px; }
.dc-region { font-size: 0.57rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--mid); margin-bottom: 0.2rem; }
.dc-name { font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 1.3rem; margin-bottom: 0.4rem; line-height: 1; }
.dc-tags { display: flex; gap: 0.35rem; flex-wrap: wrap; }

/* AD BAND */
.ad-band { padding: 0 3rem 3rem; text-align: center; background: var(--white); }
.ad-sponsor-label { font-size: 0.5rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--light); margin-bottom: 0.6rem; }

/* TRENDING */
.trending-grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr; grid-template-rows: auto auto; gap: 1px; background: var(--mist); border-radius: 16px; overflow: hidden; }
.trend-card { background: var(--white); overflow: hidden; }
.trend-featured { grid-row: 1 / 3; }
.trend-img { width: 100%; aspect-ratio: 4/3; position: relative; overflow: hidden; }
.trend-img-tall { aspect-ratio: 2/3; }
.trend-bg { position: absolute; inset: 0; transition: transform 0.7s ease; }
.trend-card:hover .trend-bg { transform: scale(1.04); }
.trend-bg-placeholder { position: absolute; inset: 0; background: linear-gradient(175deg, #ece8e0, #d8d2c8); }
.ed-bg-placeholder { width: 100%; height: 100%; background: linear-gradient(175deg, #ece8e0, #d8d2c8); }
.trend-img::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,10,10,0.5) 0%, transparent 60%); }
.trend-platform { position: absolute; top: 0.8rem; left: 0.8rem; z-index: 2; font-size: 0.52rem; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.22rem 0.75rem; border-radius: 100px; color: white; font-weight: 500; }
.p-tiktok { background: #010101; }
.p-insta  { background: #e1306c; }
.p-pin    { background: #e60023; }
.trend-body { padding: 1.2rem 1.4rem; }
.trend-featured .trend-body { padding: 1.5rem 1.8rem; }
.trend-likes { font-size: 0.6rem; color: var(--light); margin-bottom: 0.3rem; }
.trend-name { font-size: 1.1rem; margin-bottom: 0.4rem; line-height: 1.15; }
.trend-name-lg { font-size: 1.6rem; }
.trend-dest { font-size: 0.6rem; color: var(--mid); margin-bottom: 0.5rem; }
.trend-price { font-size: 0.7rem; color: var(--sand-d); }

/* EDITORIAL */
.editorial-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; }
.ed-card { border-radius: 16px; overflow: hidden; border: 1px solid var(--border); background: var(--white); transition: transform 0.35s, box-shadow 0.35s; }
.ed-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(10,10,10,0.08); }
.ed-img { width: 100%; aspect-ratio: 4/5; position: relative; overflow: hidden; }
.ed-bg { position: absolute; inset: 0; transition: transform 0.7s; }
.ed-card:hover .ed-bg { transform: scale(1.04); }
.ed-body { padding: 1.4rem; }
.ed-dest { font-size: 0.57rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--sand); margin-bottom: 0.5rem; }
.ed-title { font-size: 1rem; font-weight: 500; margin-bottom: 0.6rem; line-height: 1.25; letter-spacing: -0.01em; }
.ed-desc { font-size: 0.73rem; color: var(--mid); line-height: 1.8; margin-bottom: 1rem; }
.ed-tags { display: flex; gap: 0.35rem; flex-wrap: wrap; }

/* NEWSLETTER */
.newsletter { padding: var(--sp-12) var(--sp-6); background: var(--black); display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
.nl-title { font-size: clamp(2rem, 4vw, 3.8rem); font-weight: 200; letter-spacing: -0.02em; color: var(--white); line-height: 1; margin-bottom: 1rem; }
.nl-desc { font-size: 0.82rem; color: rgba(255,255,255,0.4); line-height: 1.8; }
.nl-form { display: flex; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); margin-bottom: 0.8rem; }
.nl-input { flex: 1; min-width: 0; background: rgba(255,255,255,0.06); border: none; border-right: 1px solid rgba(255,255,255,0.08); padding: 0.9rem 1.1rem; color: var(--white); font-family: var(--font-body); font-size: 0.8rem; outline: none; }
.nl-input::placeholder { color: rgba(255,255,255,0.2); }
.nl-btn { background: var(--sand); color: var(--black); border: none; padding: 0.9rem 1.4rem; font-family: var(--font-body); font-size: 0.62rem; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; font-weight: 600; transition: background 0.2s; white-space: nowrap; }
.nl-btn:hover { background: var(--sand-d); color: var(--white); }
.nl-fine { font-size: 0.6rem; color: rgba(255,255,255,0.2); line-height: 1.6; }

/* FOOTER */
footer { background: #060606; color: var(--white); padding: 4rem 3rem 2.5rem; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; padding-bottom: 3rem; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 2rem; }
.footer-logo { display: flex; margin-bottom: 1rem; }
.footer-tagline { font-size: 0.72rem; color: rgba(255,255,255,0.28); line-height: 1.8; max-width: 18rem; }
.footer-col-title { font-size: 0.52rem; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.22); margin-bottom: 1.1rem; font-weight: 500; }
.footer-col ul { list-style: none; }
.footer-col li { margin-bottom: 0.6rem; }
.footer-col a { color: rgba(255,255,255,0.38); text-decoration: none; font-size: 0.74rem; transition: color 0.2s; }
.footer-col a:hover { color: var(--white); }
.footer-bottom { display: flex; justify-content: space-between; font-size: 0.6rem; color: rgba(255,255,255,0.18); letter-spacing: 0.04em; flex-wrap: wrap; gap: 0.5rem; }
.footer-bottom a { color: rgba(255,255,255,0.28); text-decoration: none; }

/* AUTOCOMPLETE */
.autocomplete-dropdown {
  background: var(--white);
  border: 1.5px solid var(--black);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(10,10,10,0.14);
}
.autocomplete-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.1rem;
  background: none;
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  font-family: var(--font-body);
  text-align: left;
  transition: background 0.1s;
}
.autocomplete-item:last-child { border-bottom: none; }
.autocomplete-item:hover,
.autocomplete-item.active { background: var(--off); }
.ac-label { font-size: 0.85rem; font-weight: 400; color: var(--black); }
.ac-sub   { font-size: 0.62rem; color: var(--light); letter-spacing: 0.04em; }

/* NAV LOGO FIX */
.nav-logo img { display: block; object-fit: contain; }

/* RESPONSIVE */
@media (max-width: 1024px) {
  .nav-links { display: none; }
  .btn-ghost { display: none; }
  .hamburger { display: flex; }
  .hero { grid-template-columns: 1fr; }
  .hero-mosaic { display: none; }
  .dest-grid { grid-template-columns: repeat(2,1fr); }
  .feature-strip { grid-template-columns: 1fr; }
  .feat { border-right: none; border-bottom: 1px solid var(--border); }
  .feat:last-child { border-bottom: none; }
  .trending-grid { grid-template-columns: 1fr 1fr; }
  .trend-featured { grid-row: auto; grid-column: 1 / -1; }
  .trend-img-tall { aspect-ratio: 16/9; }
  .editorial-grid { grid-template-columns: repeat(2,1fr); }
  .newsletter { grid-template-columns: 1fr; gap: 2.5rem; }
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
}
@media (max-width: 640px) {
  .hero { padding-top: 4rem; }
  .hero-left { padding: 2rem 1.25rem; justify-content: center; min-height: 80svh; }
  .hero-title { font-size: clamp(2.4rem, 9vw, 3.5rem); }
  .search-box { flex-direction: column; border-radius: 14px; }
  .sf { border-right: none; border-bottom: 1px solid var(--border); max-width: 100%; }
  .sf-date { min-width: 100%; }
  .s-btn { padding: 1rem; justify-content: center; border-radius: 0 0 12px 12px; }
  .dest-grid { grid-template-columns: repeat(2,1fr); gap: 0.9rem; }
  .trending-grid { grid-template-columns: 1fr; }
  .editorial-grid { grid-template-columns: 1fr; }
  .newsletter { grid-template-columns: 1fr; gap: 2rem; padding: 3.5rem 1.25rem; }
  .nl-form { flex-direction: column; }
  .nl-input { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); border-radius: 12px 12px 0 0; }
  .nl-btn { border-radius: 0 0 12px 12px; padding: 0.9rem; text-align: center; }
  .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
  .footer-bottom { flex-direction: column; }
  .section-header { flex-direction: column; align-items: flex-start; }
  .tabs { gap: 0; }
  .tab { padding: 0.6rem 0.9rem; font-size: 0.58rem; }
  .feat { padding: 1.8rem 1.25rem; }
  .ad-band { padding: 0 1.25rem 2rem; }
}
`
