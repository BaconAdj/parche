import { NextRequest, NextResponse } from 'next/server'
import { heroQueries, pickHero, type UnsplashResult } from '../../../lib/hero-photo'

// Destination hero photography. Runs on the server so the scoring sees ~45 candidates per place
// instead of the first search hit, and caches for a week so each destination costs a few API calls.
const KEY = process.env.UNSPLASH_ACCESS_KEY || process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || ''
const WEEK = 60 * 60 * 24 * 7

async function search(query: string): Promise<UnsplashResult[]> {
  const params = new URLSearchParams({ query, per_page: '15', orientation: 'landscape', content_filter: 'high', order_by: 'relevant' })
  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${KEY}`, 'Accept-Version': 'v1' },
      next: { revalidate: WEEK },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.results) ? data.results : []
  } catch { return [] }
}

export async function GET(request: NextRequest) {
  const name = (request.nextUrl.searchParams.get('name') || '').trim().slice(0, 80)
  const country = (request.nextUrl.searchParams.get('country') || '').trim().slice(0, 80)
  if (!name) return NextResponse.json({ error: 'Missing destination.' }, { status: 400 })
  if (!KEY) return NextResponse.json({ photos: [] })
  const results = (await Promise.all(heroQueries(name, country).map(search))).flat()
  const photos = pickHero(results, name)
  return NextResponse.json({ photos }, { headers: { 'Cache-Control': `public, s-maxage=${WEEK}, stale-while-revalidate=${WEEK * 4}` } })
}
