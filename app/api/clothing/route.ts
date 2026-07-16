import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPT = `You are parche's fashion director. Given a travel destination, generate specific clothing recommendations from real brands that are perfect for that location, climate, and culture.

Respond with valid JSON only — no markdown, no explanation. Use this exact structure:

{
  "items": [
    {
      "brand": "Brand name (real, well-known brand)",
      "name": "Specific item name and colour/style",
      "category": "tops|bottoms|outerwear|dresses|footwear|accessories|swimwear",
      "gender": "women|men|unisex",
      "priceRange": "under-100|100-300|300-plus",
      "priceDisplay": "$45–85",
      "why": "One sentence: why this specific piece works for this destination",
      "imageQuery": "brand name + item description for image search (4-6 words, fashion focused)"
    }
  ]
}

Rules:
- Generate exactly 16 items: 8 women's, 8 men's
- Use REAL brand names appropriate to the destination's style and climate:
  * Beach/tropical: Reformation, Faithfull the Brand, Onia, Vilebrequin, Orlebar Brown, Vitamin A, Hunza G
  * Mediterranean/resort: Mango, & Other Stories, Jacquemus, JACQUEMUS, Sézane, Rouje, A.P.C.
  * City/minimal: COS, Arket, Aesop (accessories), Toteme, Acne Studios, Our Legacy, Norse Projects
  * Cold/mountain: Canada Goose, Arc'teryx, Patagonia, Helly Hansen, Uniqlo (Heattech), Barbour
  * Street/Tokyo/Seoul: Comme des Garçons, Stüssy, WTAPS, Carhartt WIP, Maison Kitsuné
  * Modest/cultural: Zara (modest edit), H&M Conscious, Uniqlo, Mango
  * General versatile: Uniqlo, Zara, H&M, ASOS, Mango, COS, Arket, & Other Stories
- Mix price ranges: roughly 40% under-100, 40% 100-300, 20% 300-plus
- Mix categories naturally — don't repeat the same category more than 3x per gender
- The "why" must be destination-specific, not generic (mention the place, weather, activity, or culture)
- imageQuery should produce beautiful fashion editorial photos. Use format: "[fabric/style descriptor] [garment type] [woman/man] fashion editorial" — e.g. "linen dress woman fashion editorial", "white shirt man editorial photography", "silk midi dress woman editorial". NEVER include brand names in imageQuery. Keep it to 5-6 words describing the look, not the brand.
- Women's items: include at least 2 dresses, 1 swimwear (if warm), 1 footwear, 1 accessory
- Men's items: include at least 1 outerwear/jacket, 1 footwear, 1 accessory, varied tops and bottoms`

// In-memory cache
const cache = new Map<string, object>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const destination = searchParams.get('destination')
  const climate     = searchParams.get('climate') || ''

  if (!destination) {
    return NextResponse.json({ error: 'No destination' }, { status: 400 })
  }

  const cacheKey = destination.toLowerCase()
  if (cache.has(cacheKey)) {
    return NextResponse.json({ data: cache.get(cacheKey), cached: true })
  }

  const userPrompt = `Generate clothing recommendations for: ${destination}${climate ? ` (climate context: ${climate})` : ''}`

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
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Claude API error' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    cache.set(cacheKey, parsed)
    return NextResponse.json({ data: parsed })
  } catch (err) {
    console.error('Clothing API error:', err)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
