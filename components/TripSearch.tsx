'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { WEARS, dateError, localDateISO, type Wear } from '../lib/trip'

// ── Types ──────────────────────────────────────────────
type DateRange = { start: Date | null; end: Date | null }

// ── Calendar ───────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDateRange(r: DateRange): string {
  if (!r.start) return 'Add dates'
  if (!r.end)   return `${MONTHS_SHORT[r.start.getMonth()]} ${r.start.getDate()} – ?`
  return `${MONTHS_SHORT[r.start.getMonth()]} ${r.start.getDate()} – ${MONTHS_SHORT[r.end.getMonth()]} ${r.end.getDate()}`
}

function Calendar({
  range, onChange, onClose, anchorRef
}: {
  range: DateRange
  onChange: (r: DateRange) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLDivElement | null>
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
        onChange({ start, end: date })
        onClose()
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
          <button aria-label="Previous month" className="cal-nav" onClick={prevMonth}>‹</button>
          <span className="cal-month-label">{MONTHS[month]} {year}</span>
          <button aria-label="Next month" className="cal-nav" onClick={nextMonth}>›</button>
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
                aria-label={date.toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                aria-pressed={Boolean(range.start && range.end && date >= range.start && date <= range.end)}
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
export const ALL_DESTINATIONS = [
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

export type DestinationOption = typeof ALL_DESTINATIONS[number]

// Destination + dates search. onQueryChange lets the hero headline follow what the traveller types.
export function TripSearch({ onQueryChange }: { onQueryChange?: (label: string) => void }) {
  const router = useRouter()
  const [query, setQuery]             = useState('')
  const [searchError, setSearchError] = useState('')
  const [range, setRange]             = useState<DateRange>({ start: null, end: null })
  const [calOpen, setCalOpen]         = useState(false)
  const [wear, setWear]               = useState<Wear>('women')
  useEffect(() => {
    try { const v = localStorage.getItem('parche.wear'); if (v === 'women' || v === 'men' || v === 'unisex') setWear(v) } catch {}
  }, [])
  const [suggestions, setSuggestions] = useState<typeof ALL_DESTINATIONS>([])
  const [activeIdx, setActiveIdx]     = useState(-1)
  const [selected, setSelected]       = useState<typeof ALL_DESTINATIONS[0] | null>(null)
  const [dropPos, setDropPos]         = useState({ top: 0, left: 0, width: 0 })
  const dateRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sfRef    = useRef<HTMLDivElement>(null)

  useEffect(() => { onQueryChange?.(selected?.label || query) }, [query, selected, onQueryChange])

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
    if (!q) { setSearchError('Where are you going? Enter a destination.'); inputRef.current?.focus(); return }
    const start = range.start ? localDateISO(range.start) : ''
    const end = range.end ? localDateISO(range.end) : ''
    const error = dateError(start, end)
    if (error) { setSearchError(error); setCalOpen(true); return }
    setSearchError('')
    const dest = selected || ALL_DESTINATIONS.find(d => d.label.toLowerCase() === q.toLowerCase())
      || ALL_DESTINATIONS.find(d => d.slug === ALIASES[q.toLowerCase()])
      || ALL_DESTINATIONS.find(d => d.label.toLowerCase().startsWith(q.toLowerCase()))
    const slug = dest?.slug || q.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const location = dest ? `${dest.label}, ${dest.sublabel.split(' · ')[0]}` : q
    const params = new URLSearchParams({ destination: location, start, end, wear })
    try { localStorage.setItem('parche.wear', wear) } catch {}
    router.push(`/destinations/${slug}?${params}`)
  }

  return (
    <div className="search-wrap">
      <div className="search-box">
        {/* Destination */}
        <div ref={sfRef} className="sf">
          <label htmlFor="trip-destination" className="sf-label">Where to</label>
          <input
            ref={inputRef}
            id="trip-destination"
            aria-describedby={searchError ? "trip-search-error" : undefined}
            type="text"
            placeholder="Lisbon, Tokyo, Tulum"
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
          role="button"
          tabIndex={0}
          aria-label={`Travel dates: ${formatDateRange(range)}`}
          aria-expanded={calOpen}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCalOpen(o => !o) } }}
          onClick={() => { setSuggestions([]); setCalOpen(o => !o) }}
        >
          <span className="sf-label">When</span>
          <span className={`date-display${range.start ? ' has-dates' : ''}`}>
            {formatDateRange(range)}
          </span>
        </div>

        {/* Wardrobe */}
        <div className="sf sf-wear" role="radiogroup" aria-label="Shop for">
          <span className="sf-label">Shop for</span>
          <div className="wear-seg">
            {WEARS.map(w => (
              <button key={w.value} type="button" role="radio" aria-checked={wear === w.value} onClick={() => setWear(w.value)}>
                {w.value === 'women' ? 'Women' : w.value === 'men' ? 'Men' : 'Unisex'}
              </button>
            ))}
          </div>
        </div>

        <button className="s-btn" onClick={() => { setSuggestions([]); search() }}>
          Show me what to wear
        </button>
      </div>

      {searchError && <p id="trip-search-error" role="alert" className="trip-search-error">{searchError}</p>}

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
        <span className="h-label">Or try</span>
        {['Lisbon', 'Tokyo', 'Marrakech', 'Amalfi Coast', 'Montreal'].map(d => {
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
          onChange={r => { setRange(r); setSearchError('') }}
          onClose={() => setCalOpen(false)}
          anchorRef={dateRef}
        />
      )}
    </div>
  )
}

