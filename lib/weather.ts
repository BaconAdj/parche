import { dateNumber, type Trip } from './trip'

export type WeatherDay = { date: string; low: number; high: number; rain: number; code: number }
export type TripWeather = {
  kind: 'forecast' | 'seasonal' | 'unavailable'
  location: string
  low: number | null
  high: number | null
  rainDays: number | null
  days: WeatherDay[]
  note: string
  sampleYears: number[]
}
type ProviderDay = { datetime?: string; tempmin?: number | null; tempmax?: number | null; precip?: number | null; icon?: string; source?: string }
type Timeline = { resolvedAddress?: string; timezone?: string; days?: ProviderDay[] }

// Regional searches use an explicitly labelled reference town, never a made-up coordinate.
const REGIONS: Record<string, string> = {
  'bali': 'Denpasar, Indonesia', 'amalfi coast': 'Amalfi, Italy', 'santorini': 'Fira, Greece',
  'maldives': 'Male, Maldives', 'french riviera': 'Nice, France', 'riviera maya': 'Playa del Carmen, Mexico',
  'hawaii': 'Honolulu, United States', 'maui': 'Kahului, United States', 'fiji': 'Nadi, Fiji',
  'seychelles': 'Victoria, Seychelles', 'algarve': 'Faro, Portugal', 'cinque terre': 'Monterosso al Mare, Italy',
}

// Only a free account without billing details should be configured for this launch.
// The provider enforces that account's daily allowance; no paid fallback is used.
const pending = new Map<string, Promise<Timeline>>()
async function timeline(destination: string, start?: string, end?: string): Promise<Timeline> {
  const key = process.env.VISUAL_CROSSING_API_KEY
  if (!key) throw new Error('Weather provider not configured')
  const name = REGIONS[destination.split(',')[0].toLowerCase().trim()] || destination.trim()
  const params = new URLSearchParams({ key, unitGroup: 'metric', include: 'days', contentType: 'json', elements: 'datetime,tempmin,tempmax,precip,icon,source' })
  const dates = start && end ? `/${start}/${end}` : ''
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(name)}${dates}?${params}`
  // Share concurrent requests from the outfit and shopping routes. Next's persistent
  // fetch cache shares forecast data across trip dates and historical rows for 30 days.
  const existing = pending.get(url)
  if (existing) return existing
  const request = (async () => {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000), next: { revalidate: start ? 86400 * 30 : 21600 } })
    if (!res.ok) throw new Error('Weather provider unavailable')
    return await res.json() as Timeline
  })()
  pending.set(url, request)
  try { return await request } finally { pending.delete(url) }
}

export function parseDays(rows: ProviderDay[] | undefined): WeatherDay[] {
  if (!Array.isArray(rows)) return []
  const codes: Record<string, number> = { 'clear-day': 0, 'clear-night': 0, 'partly-cloudy-day': 2, 'partly-cloudy-night': 2, cloudy: 3, fog: 45, rain: 61, snow: 71, wind: 3 }
  return rows.flatMap(row => {
    const { datetime: date, tempmin: low, tempmax: high, precip: rain } = row
    if (!date || !Number.isFinite(dateNumber(date)) || typeof low !== 'number' || !Number.isFinite(low) || typeof high !== 'number' || !Number.isFinite(high) || typeof rain !== 'number' || !Number.isFinite(rain) || low > high || rain < 0) return []
    return [{ date, low, high, rain, code: codes[row.icon || ''] ?? 3 }]
  })
}

function completePeriod(days: WeatherDay[], start: string, end: string): boolean {
  const count = (dateNumber(end) - dateNumber(start)) / 86400000 + 1
  return days.length === count && days.every((day, i) => dateNumber(day.date) === dateNumber(start) + i * 86400000)
}

export function weatherWindow(trip: Pick<Trip, 'start' | 'end'>, today: string): 'forecast' | 'seasonal' {
  // Use a single historical basis for the whole trip if any day is beyond the forecast horizon.
  return trip.start >= today && dateNumber(trip.end) - dateNumber(today) <= 14 * 86400000 ? 'forecast' : 'seasonal'
}

export function historicWindow(trip: Pick<Trip, 'start' | 'end'>, year: number): { start: string; end: string } {
  const shift = (value: string, targetYear: number) => {
    const month = Number(value.slice(5, 7)), day = Number(value.slice(8, 10))
    const lastDay = new Date(Date.UTC(targetYear, month, 0)).getUTCDate()
    return `${targetYear}-${String(month).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`
  }
  return { start: shift(trip.start, year), end: shift(trip.end, year + Number(trip.end.slice(0, 4)) - Number(trip.start.slice(0, 4))) }
}

export function unavailableWeather(location: string): TripWeather {
  return { kind: 'unavailable', location, low: null, high: null, rainDays: null, days: [], sampleYears: [], note: 'Weather data is unavailable right now. Your dates are saved; check conditions before departure.' }
}

export async function getTripWeather(trip: Trip, now = new Date()): Promise<TripWeather> {
  try {
    const forecast = await timeline(trip.destination)
    if (!forecast.timezone || !forecast.resolvedAddress) throw new Error('Invalid location')
    const location = forecast.resolvedAddress
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: forecast.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
    const kind = weatherWindow(trip, today)
    let days: WeatherDay[] = []
    const sampleYears: number[] = []
    if (kind === 'forecast') {
      // Never label statistical future estimates as a live forecast.
      const rows = (forecast.days || []).filter(d => d.datetime && d.datetime >= trip.start && d.datetime <= trip.end)
      if (rows.some(d => d.source !== 'fcst' && d.source !== 'comb')) return unavailableWeather(location)
      days = parseDays(rows)
      if (!completePeriod(days, trip.start, trip.end)) return unavailableWeather(location)
    } else {
      // Three completed comparison seasons conserve the free daily allowance. December–January trips must end in a completed year.
      const crossesYear = trip.end.slice(0, 4) !== trip.start.slice(0, 4)
      const latestYear = Number(today.slice(0, 4)) - (crossesYear ? 2 : 1)
      const samples = await Promise.allSettled(Array.from({ length: 3 }, async (_, i) => {
        const year = latestYear - i, window = historicWindow(trip, year)
        const data = await timeline(trip.destination, window.start, window.end)
        const rows = parseDays(data.days)
        if (!completePeriod(rows, window.start, window.end)) throw new Error('Incomplete historical season')
        return { year, rows }
      }))
      for (const sample of samples) if (sample.status === 'fulfilled') { days.push(...sample.value.rows); sampleYears.push(sample.value.year) }
      if (sampleYears.length < 3) return unavailableWeather(location)
    }
    if (!days.length) return unavailableWeather(location)
    const average = (key: 'low' | 'high') => Math.round(days.reduce((sum, d) => sum + d[key], 0) / days.length)
    const low = kind === 'forecast' ? Math.round(Math.min(...days.map(d => d.low))) : average('low')
    const high = kind === 'forecast' ? Math.round(Math.max(...days.map(d => d.high))) : average('high')
    return {
      kind, location, low, high, rainDays: Math.round(days.filter(d => d.rain >= 1).length / days.length * 100),
      days: kind === 'forecast' ? days : [], sampleYears,
      note: kind === 'forecast' ? 'Forecast for your travel dates. Conditions can change.' : `Average daily lows and highs for the same calendar period across ${sampleYears.length} past years (${Math.min(...sampleYears)}–${Math.max(...sampleYears) + Number(trip.end.slice(0, 4) !== trip.start.slice(0, 4))}). Historical guidance, not a forecast.`,
    }
  } catch { return unavailableWeather(trip.destination) }
}
