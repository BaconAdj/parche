import { NextRequest, NextResponse } from 'next/server'
import { parseTrip } from '../../../lib/trip'
import { getTripWeather } from '../../../lib/weather'
import { buildTravelEdit } from '../../../lib/travel-edit'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  try {
    const trip = parseTrip(request.nextUrl.searchParams)
    const weather = await getTripWeather(trip)
    const edit = buildTravelEdit(trip, weather)
    return NextResponse.json({ data: edit.destination, edit })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to prepare your travel edit.' }, { status: 400 })
  }
}
