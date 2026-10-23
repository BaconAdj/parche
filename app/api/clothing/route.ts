import { NextRequest, NextResponse } from 'next/server'
import { parseTrip } from '../../../lib/trip'
import { optionsForPlan } from '../../../lib/product-catalogue'
import { buildPackingPlan } from '../../../lib/packing'
import { getTripWeather } from '../../../lib/weather'
import type { ShopPayload } from '../../../lib/catalogue-types'

// Returns, for every piece on the trip's packing list, options in each price tier for the chosen wardrobe.
export async function GET(request: NextRequest) {
  let trip
  try { trip = parseTrip(request.nextUrl.searchParams) }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid trip.' }, { status: 400 }) }
  const weather = await getTripWeather(trip)
  const plan = buildPackingPlan(trip, weather)
  const needs = optionsForPlan(plan, trip)
  const dates = needs.flatMap(n => n.tiers.flatMap(t => t.products.map(p => p.checkedAt))).sort()
  const data: ShopPayload = { wear: trip.wear, needs, checkedAt: dates[0] || null }
  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } })
}
