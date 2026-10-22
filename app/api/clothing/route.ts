import { NextRequest, NextResponse } from 'next/server'
import { parseTrip } from '../../../lib/trip'
import { reviewedProducts } from '../../../lib/product-catalogue'

export async function GET(request: NextRequest) {
  try { parseTrip(request.nextUrl.searchParams) }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid trip.' }, { status: 400 }) }
  return NextResponse.json({ data: { items: reviewedProducts() } })
}
