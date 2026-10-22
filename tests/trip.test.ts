import test from 'node:test'
import assert from 'node:assert/strict'
import { dateError, parseTrip, tripParams, localDateISO, type Trip } from '../lib/trip'
import { weatherWindow, historicWindow, parseDays, getTripWeather, unavailableWeather } from '../lib/weather'
import { buildTravelEdit } from '../lib/travel-edit'

const trip: Trip = { destination: 'Lisbon, Portugal', start: '2027-01-05', end: '2027-01-10', activity: '', style: '' }

test('dates and optional preferences survive URL serialization without a budget field', () => {
  const selected: Trip = { ...trip, activity: 'walking', style: 'polished' }
  assert.deepEqual(parseTrip(tripParams(selected), '2026-10-22'), selected)
  assert.equal(tripParams(selected).has('budget'), false)
  assert.equal(localDateISO(new Date(2027, 0, 5)), '2027-01-05')
})

test('date validation handles missing, invalid, reversed, past and overlong dates', () => {
  for (const [start, end] of [['', ''], ['2027-02-29', '2027-03-02'], ['2027-04-31', '2027-05-02'], ['2027-01-10', '2027-01-05'], ['2026-10-21', '2026-10-22'], ['2027-01-01', '2027-05-01']]) assert.ok(dateError(start, end, '2026-10-22'))
  assert.equal(dateError('2028-02-29', '2028-02-29', '2026-10-22'), null)
  assert.throws(() => parseTrip(new URLSearchParams({ ...trip, activity: 'bad' }), '2026-10-22'))
})

test('entire trip must fit the 16-day forecast window', () => {
  assert.equal(weatherWindow({ start: '2026-10-22', end: '2026-11-06' }, '2026-10-22'), 'forecast')
  assert.equal(weatherWindow({ start: '2026-10-22', end: '2026-11-07' }, '2026-10-22'), 'seasonal')
  assert.equal(weatherWindow(trip, '2026-10-22'), 'seasonal')
})

test('historical comparisons handle leap days and year-crossing trips', () => {
  assert.deepEqual(historicWindow({ start: '2028-02-29', end: '2028-03-02' }, 2025), { start: '2025-02-28', end: '2025-03-02' })
  assert.deepEqual(historicWindow({ start: '2026-12-28', end: '2027-01-03' }, 2024), { start: '2024-12-28', end: '2025-01-03' })
})

test('missing provider temperatures are not silently converted to zero', () => {
  assert.deepEqual(parseDays({ time: ['2027-01-05'], temperature_2m_min: [null], temperature_2m_max: [20], precipitation_sum: [0], weather_code: [0] }), [])
})

test('preferences change actual looks while preserving location and dates', () => {
  const weather = { ...unavailableWeather('Lisbon'), kind: 'forecast' as const, low: 4, high: 12, rainDays: 50 }
  const initial = buildTravelEdit(trip, weather)
  const refined = buildTravelEdit({ ...trip, activity: 'active', style: 'statement' }, weather)
  assert.notDeepEqual(refined.looks, initial.looks)
  assert.match(refined.looks[0].desc, /trail shoes/)
  assert.match(refined.looks[0].desc, /expressive colour/)
  assert.equal(refined.trip.start, trip.start)
  assert.equal(refined.trip.destination, trip.destination)
  assert.match(initial.destination.guide, /4–12°C/)
  assert.deepEqual(initial.destination.forecast, [])
})

test('unavailable weather never fabricates a forecast or a temperature', () => {
  const edit = buildTravelEdit(trip, unavailableWeather('Lisbon'))
  assert.equal(edit.destination.temp, 'Weather unavailable')
  assert.deepEqual(edit.destination.forecast, [])
  assert.doesNotMatch(edit.destination.guide, /°C/)
})

function installWeatherMock() {
  const calls: URL[] = []
  const original = globalThis.fetch
  globalThis.fetch = async (input) => {
    const url = new URL(String(input)); calls.push(url)
    if (url.hostname.includes('geocoding')) return Response.json({ results: [{ name: 'Lisbon', country: 'Portugal', latitude: 38.7, longitude: -9.1, timezone: 'Europe/Lisbon' }] })
    const start = url.searchParams.get('start_date')!, end = url.searchParams.get('end_date')!
    const dates: string[] = []
    for (let d = Date.parse(start + 'T12:00:00Z'); d <= Date.parse(end + 'T12:00:00Z'); d += 86400000) dates.push(new Date(d).toISOString().slice(0, 10))
    return Response.json({ daily: { time: dates, temperature_2m_min: dates.map(() => 10), temperature_2m_max: dates.map(() => 20), precipitation_sum: dates.map(() => 2), weather_code: dates.map(() => 61) } })
  }
  return { calls, restore: () => { globalThis.fetch = original } }
}

test('forecast integration requests actual trip days and returns sourced daily rows', async () => {
  const mock = installWeatherMock()
  try {
    const weather = await getTripWeather({ ...trip, start: '2026-10-23', end: '2026-10-26' }, new Date('2026-10-22T12:00:00Z'))
    assert.equal(weather.kind, 'forecast'); assert.equal(weather.days.length, 4)
    assert.equal(weather.days[0].date, '2026-10-23'); assert.equal(weather.rainDays, 100)
    assert.equal(mock.calls[1].searchParams.get('end_date'), '2026-10-26')
  } finally { mock.restore() }
})

test('seasonal integration averages five historical periods, never presents them as future daily forecasts', async () => {
  const mock = installWeatherMock()
  try {
    const weather = await getTripWeather(trip, new Date('2026-10-22T12:00:00Z'))
    assert.equal(weather.kind, 'seasonal'); assert.equal(weather.sampleYears.length, 5)
    assert.equal(weather.low, 10); assert.equal(weather.high, 20); assert.deepEqual(weather.days, [])
    assert.match(weather.note, /not a forecast/)
    assert.equal(mock.calls.length, 6)
  } finally { mock.restore() }
})

test('provider failures fall back safely without rejecting the travel edit', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => { throw new Error('network unavailable') }
  try { assert.equal((await getTripWeather(trip)).kind, 'unavailable') } finally { globalThis.fetch = original }
})

test('commercial production does not silently use the non-commercial endpoint', async () => {
  const saved = { NODE_ENV: process.env.NODE_ENV, VERCEL_ENV: process.env.VERCEL_ENV, OPEN_METEO_API_KEY: process.env.OPEN_METEO_API_KEY }
  Object.assign(process.env, { NODE_ENV: 'production', VERCEL_ENV: 'production' }); delete process.env.OPEN_METEO_API_KEY
  const mock = installWeatherMock()
  try { assert.equal((await getTripWeather(trip)).kind, 'unavailable'); assert.equal(mock.calls.length, 0) }
  finally { mock.restore(); for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v } }
})

test('API rejects invalid dates before calling a provider', async () => {
  const { NextRequest } = await import('next/server')
  const { GET } = await import('../app/api/destinations/route')
  const mock = installWeatherMock()
  try {
    const response = await GET(new NextRequest('https://parche.store/api/destinations?destination=Lisbon&start=2027-02-30&end=2027-03-01'))
    assert.equal(response.status, 400)
    assert.equal(mock.calls.length, 0)
  } finally { mock.restore() }
})

test('clothing API uses trip preferences in prompts and isolates cached results', async () => {
  const { NextRequest } = await import('next/server')
  const { GET } = await import('../app/api/clothing/route')
  const original = globalThis.fetch, savedKey = process.env.ANTHROPIC_API_KEY
  process.env.ANTHROPIC_API_KEY = 'test-only-placeholder'
  const prompts: string[] = []
  const future = new Date(); future.setDate(future.getDate() + 30)
  const selected = { ...trip, start: localDateISO(future), end: localDateISO(future) }
  globalThis.fetch = async (input, init) => {
    if (String(input).includes('anthropic.com')) {
      prompts.push(String(init?.body))
      return Response.json({ content: [{ text: JSON.stringify({ items: [{ brand: 'Test brand', name: 'Test shirt', category: 'tops', gender: 'unisex', priceRange: 'under-100', priceDisplay: '$50', why: 'Test rationale', imageQuery: 'shirt' }] }) }] })
    }
    throw new Error('Weather deliberately unavailable in this test')
  }
  try {
    for (const style of ['', '', 'statement']) {
      const response = await GET(new NextRequest('https://parche.store/api/clothing?' + tripParams({ ...selected, style: style as Trip['style'] })))
      assert.equal(response.status, 200)
    }
    assert.equal(prompts.length, 2)
    const data = JSON.parse(JSON.parse(prompts[1]).messages[0].content)
    assert.equal(data.personalStyle, 'statement'); assert.equal(data.departure, selected.start)
    assert.match(data.weatherContext, /unavailable/)
  } finally {
    globalThis.fetch = original
    if (savedKey === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = savedKey
  }
})
