import { NextRequest, NextResponse } from 'next/server'
import { parseTrip } from '../../../lib/trip'
import { reviewedProducts } from '../../../lib/product-catalogue'
import { buildPackingPlan } from '../../../lib/packing'
import { getTripWeather } from '../../../lib/weather'

export async function GET(request: NextRequest) {
  let trip
  try { trip = parseTrip(request.nextUrl.searchParams) }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid trip.' }, { status: 400 }) }
  const weather = await getTripWeather(trip)
  const plan = buildPackingPlan(trip, weather)
  const kinds = new Set(plan.needs.map(n => n.id))
  const items = reviewedProducts().filter(p => p.kinds.some(k => kinds.has(k)) && p.climates.includes(plan.climate))
  return NextResponse.json({ data: { items } })
}
