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
type Place = { name: string; country: string; latitude: number; longitude: number; timezone: string }
type Daily = { time: string[]; temperature_2m_min: (number | null)[]; temperature_2m_max: (number | null)[]; precipitation_sum: (number | null)[]; weather_code: (number | null)[] }

// Regional searches use an explicitly labelled reference town, never a made-up coordinate.
const REGIONS: Record<string, string> = {
  'bali': 'Denpasar, Indonesia', 'amalfi coast': 'Amalfi, Italy', 'santorini': 'Fira, Greece',
  'maldives': 'Male, Maldives', 'french riviera': 'Nice, France', 'riviera maya': 'Playa del Carmen, Mexico',
  'hawaii': 'Honolulu, United States', 'maui': 'Kahului, United States', 'fiji': 'Nadi, Fiji',
  'seychelles': 'Victoria, Seychelles', 'algarve': 'Faro, Portugal', 'cinque terre': 'Monterosso al Mare, Italy',
}

function apiURL(service: 'geocoding' | 'forecast' | 'archive', path: string, params: URLSearchParams): string {
  const key = process.env.OPEN_METEO_API_KEY
  // The free endpoint is for evaluation only. Commercial deployments need a customer key.
  if (!key && process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview') throw new Error('Weather provider not configured')
  const host = service === 'forecast' ? 'api' : `${service}-api`
  if (key) params.set('apikey', key)
  return `https://${key ? 'customer-' : ''}${host}.open-meteo.com/${path}?${params}`
}

async function getJSON(url: string, revalidate: number) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000), next: { revalidate } })
  if (!res.ok) throw new Error('Weather provider unavailable')
  return res.json()
}

export async function resolvePlace(destination: string): Promise<Place> {
  const base = destination.split(',')[0].toLowerCase().trim()
  const name = REGIONS[base] || destination
  const data = await getJSON(apiURL('geocoding', 'v1/search', new URLSearchParams({ name, count: '5', language: 'en', format: 'json' })), 86400)
  const places = (data.results || []) as Place[]
  if (!places.length) throw new Error('Location not found')
  const place = places[0]
  if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude) || !place.timezone) throw new Error('Invalid location')
  return place
}

export function parseDays(daily: Daily | undefined): WeatherDay[] {
  if (!daily || !Array.isArray(daily.time)) return []
  return daily.time.flatMap((date, i) => {
    const low = daily.temperature_2m_min?.[i], high = daily.temperature_2m_max?.[i], rain = daily.precipitation_sum?.[i], code = daily.weather_code?.[i]
    if (typeof low !== 'number' || !Number.isFinite(low) || typeof high !== 'number' || !Number.isFinite(high) || typeof rain !== 'number' || !Number.isFinite(rain) || typeof code !== 'number' || !Number.isFinite(code)) return []
    return [{ date, low, high, rain, code }]
  })
}

export function weatherWindow(trip: Pick<Trip, 'start' | 'end'>, today: string): 'forecast' | 'seasonal' {
  // Use a single historical basis for the whole trip if any day is beyond the forecast horizon.
  return trip.start >= today && dateNumber(trip.end) - dateNumber(today) <= 15 * 86400000 ? 'forecast' : 'seasonal'
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
    const place = await resolvePlace(trip.destination)
    const location = `${place.name}, ${place.country}`
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: place.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
    const kind = weatherWindow(trip, today)
    const params = () => new URLSearchParams({ latitude: String(place.latitude), longitude: String(place.longitude), timezone: place.timezone, daily: 'temperature_2m_min,temperature_2m_max,precipitation_sum,weather_code' })
    let days: WeatherDay[] = []
    const sampleYears: number[] = []
    if (kind === 'forecast') {
      const query = params()
      query.set('start_date', trip.start); query.set('end_date', trip.end)
      const data = await getJSON(apiURL('forecast', 'v1/forecast', query), 3600)
      days = parseDays(data.daily)
      const count = (dateNumber(trip.end) - dateNumber(trip.start)) / 86400000 + 1
      if (days.length !== count || days[0]?.date !== trip.start || days.at(-1)?.date !== trip.end) return unavailableWeather(location)
    } else {
      // Five completed comparison seasons. December–January trips must end in a completed year.
      const crossesYear = trip.end.slice(0, 4) !== trip.start.slice(0, 4)
      const latestYear = Number(today.slice(0, 4)) - (crossesYear ? 2 : 1)
      const samples = await Promise.allSettled(Array.from({ length: 5 }, async (_, i) => {
        const year = latestYear - i, window = historicWindow(trip, year), query = params()
        query.set('start_date', window.start); query.set('end_date', window.end); query.set('models', 'era5')
        const data = await getJSON(apiURL('archive', 'v1/archive', query), 86400 * 30)
        const rows = parseDays(data.daily)
        const expected = (dateNumber(window.end) - dateNumber(window.start)) / 86400000 + 1
        if (rows.length !== expected) throw new Error('Incomplete historical season')
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
