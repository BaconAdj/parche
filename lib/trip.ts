export const ACTIVITIES = [
  { value: 'relaxing', label: 'Mostly relaxing' },
  { value: 'walking', label: 'Exploring on foot' },
  { value: 'active', label: 'Active adventures' },
  { value: 'mixed', label: 'A mix' },
] as const

export const STYLES = [
  { value: 'understated', label: 'Understated' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'statement', label: 'Statement' },
  { value: 'polished', label: 'Polished' },
] as const

export const WEARS = [
  { value: 'women', label: 'Womenswear' },
  { value: 'men', label: 'Menswear' },
  { value: 'unisex', label: 'Unisex' },
] as const

export type Wear = typeof WEARS[number]['value']
export type Activity = typeof ACTIVITIES[number]['value']
export type PersonalStyle = typeof STYLES[number]['value']
export type Trip = { destination: string; start: string; end: string; activity: Activity | ''; style: PersonalStyle | ''; wear: Wear }
const DAY = 86_400_000

// Calendar dates must never be converted through the browser's UTC offset.
export function localDateISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function dateNumber(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN
  const n = Date.parse(`${value}T12:00:00Z`)
  return Number.isFinite(n) && new Date(n).toISOString().slice(0, 10) === value ? n : NaN
}

export function dateError(start: string, end: string, today = localDateISO(new Date())): string | null {
  if (!start || !end) return 'Choose departure and return dates to see your travel edit.'
  if (!Number.isFinite(dateNumber(start)) || !Number.isFinite(dateNumber(end))) return 'Choose valid travel dates.'
  if (end < start) return 'Your return date must be on or after your departure.'
  if (start < today) return 'Choose a departure date today or later.'
  if ((dateNumber(end) - dateNumber(start)) / DAY > 89) return 'Choose a trip of up to 90 days.'
  if ((dateNumber(end) - dateNumber(today)) / DAY > 730) return 'Choose dates within the next two years.'
  return null
}

export function parseTrip(params: URLSearchParams, today?: string): Trip {
  const destination = (params.get('destination') || '').trim()
  if (destination.length < 2 || destination.length > 120 || /[\x00-\x1f]/.test(destination)) throw new Error('Enter a destination between 2 and 120 characters.')
  const start = params.get('start') || ''
  const end = params.get('end') || ''
  const error = dateError(start, end, today)
  if (error) throw new Error(error)
  const activity = params.get('activity') || ''
  const style = params.get('style') || ''
  if (activity && !ACTIVITIES.some(a => a.value === activity)) throw new Error('Choose one of the activity options.')
  if (style && !STYLES.some(s => s.value === style)) throw new Error('Choose one of the style options.')
  const wear = params.get('wear') || 'unisex'
  if (!WEARS.some(w => w.value === wear)) throw new Error('Choose womenswear, menswear or unisex.')
  return { destination, start, end, activity: activity as Trip['activity'], style: style as Trip['style'], wear: wear as Wear }
}

export function tripParams(trip: Trip): URLSearchParams {
  const params = new URLSearchParams({ destination: trip.destination, start: trip.start, end: trip.end })
  if (trip.activity) params.set('activity', trip.activity)
  if (trip.style) params.set('style', trip.style)
  if (trip.wear && trip.wear !== 'unisex') params.set('wear', trip.wear)
  return params
}

export function formatTripDates(start: string, end: string): string {
  if (!Number.isFinite(dateNumber(start)) || !Number.isFinite(dateNumber(end))) return 'Choose your travel dates'
  const format = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  return `${format.format(new Date(dateNumber(start)))} – ${format.format(new Date(dateNumber(end)))}`
}

export function weatherIcon(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code >= 95) return '⛈️'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return '❄️'
  if (code >= 51) return '🌧️'
  return '🌫️'
}

