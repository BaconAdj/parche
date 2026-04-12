import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 30

const SYSTEM_PROMPT = `You are parche's destination fashion expert. When given a travel destination, you generate a precise, culturally aware fashion and packing guide.

You must respond with valid JSON only — no markdown, no explanation, no preamble. The JSON must exactly match this structure:

{
  "name": "Display name of destination",
  "country": "Country name",
  "region": "Geographic region (e.g. Europe, Southeast Asia, Caribbean)",
  "temp": "Temperature range (e.g. 18–26°C)",
  "weather": "Brief weather description (e.g. Mild · Some rain · Humid evenings)",
  "type": "Trip character (e.g. City break · Walking-heavy)",
  "forecast": [
    { "day": "Today", "icon": "☀️", "temp": "22°" },
    { "day": "Tue",   "icon": "⛅", "temp": "20°" },
    { "day": "Wed",   "icon": "🌧", "temp": "17°" },
    { "day": "Thu",   "icon": "☀️", "temp": "23°" },
    { "day": "Fri",   "icon": "🌤", "temp": "21°" }
  ],
  "products": [
    {
      "brand": "Brand name (real brand appropriate for this style)",
      "name": "Product name, colour/style",
      "price": "$XX",
      "badge": "edit",
      "avail": "on",
      "availTxt": "Ships before your trip",
      "bg": "linear-gradient(175deg, #e8e4dc 0%, #d4cec4 100%)"
    }
  ],
  "guide": "2-3 sentence packing philosophy for this destination. Culturally aware, practical, specific.",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"]
}

Rules:
- Products array must have exactly 9 items
- badge must be one of: "edit", "sale", "2nd", ""
- avail must be one of: "on", "st"  
- availTxt for "on" should be "Ships before your trip", "Free returns", "Online + In-store", or "Ships in X days"
- availTxt for "st" should be "X sizes available" or "X available"
- bg must be a subtle neutral gradient using only hex values in range #c8-#f5 (light, muted tones — no saturated colors)
- Mix badge types: 3-4 "edit", 1-2 "", 1-2 "2nd", 0-1 "sale"
- Mix avail types: 6-7 "on", 2-3 "st"
- Use real brand names appropriate to the destination's style (e.g. for Japan: Uniqlo, COS, Acne; for Mediterranean: Mango, Faithfull, ASOS; for cold: Canada Goose, Arc'teryx, Uniqlo Heattech)
- tags should be 3-5 short descriptive words (e.g. Beach, City, Layers, Modest, Resort, Tropical, Street, Minimal)
- temp should use °C
- forecast icons must be weather emoji: ☀️ 🌤 ⛅ 🌦 🌧 ❄️ 🌨
- guide must be specific to the destination — mention actual places, clothing considerations, cultural norms where relevant
- Consider the season intelligently — if no date context given, use the most popular travel season for that destination`

// Simple in-memory cache (resets on cold start, but works within a session)
const cache = new Map<string, object>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const destination = searchParams.get('destination')
  const dates       = searchParams.get('dates') || ''

  if (!destination) {
    return NextResponse.json({ error: 'No destination provided' }, { status: 400 })
  }

  const cacheKey = `${destination.toLowerCase()}-${dates}`

  // Return cached result if available
  if (cache.has(cacheKey)) {
    return NextResponse.json({ data: cache.get(cacheKey), cached: true })
  }

  const userPrompt = dates
    ? `Generate a fashion and packing guide for: ${destination} (travel dates: ${dates})`
    : `Generate a fashion and packing guide for: ${destination}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Claude API error:', err)
      return NextResponse.json({ error: 'Failed to generate guide' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    // Parse JSON from Claude's response
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed  = JSON.parse(cleaned)

    // Add the slug for internal routing
    parsed.slug = destination.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // Cache it
    cache.set(cacheKey, parsed)

    return NextResponse.json({ data: parsed, cached: false })
  } catch (err) {
    console.error('Error generating destination guide:', err)
    return NextResponse.json({ error: 'Failed to generate guide' }, { status: 500 })
  }
}
