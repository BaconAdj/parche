import { findDestination, type Destination } from './destinations'
import { ACTIVITIES, STYLES, type Trip } from './trip'
import type { TripWeather } from './weather'

export type Look = { title: string; desc: string }
export type TravelEdit = { trip: Trip; destination: Destination; weather: TripWeather; looks: Look[]; packing: string[] }

// Outfit suggestions, not claims about current local trends or product inventory.
export function buildTravelEdit(trip: Trip, weather: TripWeather): TravelEdit {
  const name = trip.destination.split(',')[0].trim()
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const base = findDestination(slug)
  const cold = weather.low !== null && weather.low < 8
  const hot = !cold && weather.high !== null && weather.high >= 25
  const wet = weather.rainDays !== null && weather.rainDays >= 30
  const active = trip.activity === 'active', walking = trip.activity === 'walking'
  const relaxed = trip.activity === 'relaxing'
  const tops = cold ? 'a fine knit over a long-sleeve base layer' : hot ? 'a breathable linen or cotton shirt' : 'a cotton shirt with an easy removable layer'
  const bottoms = active ? 'stretch trousers that move comfortably' : trip.style === 'polished' ? 'tailored trousers' : 'relaxed straight-leg trousers'
  const shoes = active ? 'grippy trail shoes suited to your planned terrain' : walking ? 'supportive walking sneakers you have already broken in' : cold || wet ? 'closed-toe shoes with a grippy sole' : 'comfortable flats or clean sneakers'
  const layer = cold ? 'an insulated coat' : wet ? 'a packable rain shell' : 'a light jacket for cooler moments'
  const styleLine: Record<Trip['style'], string> = {
    '': 'Build around a coordinated palette so the pieces work across several looks.',
    understated: 'Keep the palette tonal, the lines clean, and accessories discreet.',
    relaxed: 'Choose loose silhouettes, soft fabrics, and unfussy layers.',
    statement: 'Use one expressive colour or print as the focal point, with quieter pieces around it.',
    polished: 'Choose structured silhouettes, neat layers, and a refined finishing accessory.',
  }
  const activityLine = active ? 'Keep movement and traction at the centre of your daytime outfit.' : walking ? 'Prioritize all-day walking comfort and a secure crossbody bag.' : relaxed ? 'Lean into easy pieces that move from a slow morning to a relaxed lunch.' : 'Choose versatile pieces for sightseeing, downtime, and dinner.'
  const weatherLine = weather.kind === 'unavailable' ? 'Start with adaptable layers while weather details are unavailable.' : weather.kind === 'seasonal' ? `Historical conditions suggest ${weather.low}–${weather.high}°C; plan flexible layers and check the forecast closer to departure.` : `The current forecast spans ${weather.low}–${weather.high}°C during your trip.`
  const destinationDirection: Record<string, string> = {
    lisbon: 'For the Lisbon edit, use relaxed tailoring, textured layers and an earthy accent.',
    tokyo: 'For the Tokyo edit, play with layered proportions, clean sneakers and one architectural accessory.',
    bali: 'For the Bali edit, favour relaxed natural textures and an easy overshirt; choose coverage appropriate to individual venues.',
    'amalfi-coast': 'For the Amalfi edit, build around crisp separates, a coastal colour accent and a simple evening accessory.',
    marrakech: 'For the Marrakech edit, try fluid longer silhouettes, covered layering options and warm colour accents.',
    tulum: 'For the Tulum edit, explore relaxed shapes, tactile fabrics and understated accessories.',
  }
  const direction = destinationDirection[slug] || 'Let a cohesive palette connect the different looks in your suitcase.'
  const day = `For ${name}, pair ${tops} with ${bottoms} and ${shoes}. ${activityLine} ${direction} ${styleLine[trip.style]}`
  const evening = `Keep the trousers and switch to ${cold ? 'a fine-gauge knit and a structured coat' : 'a fluid shirt or an easy dress with a light outer layer'}. ${trip.style === 'statement' ? 'Add a bold accessory to carry your statement through to dinner.' : trip.style === 'relaxed' ? 'Keep the fit easy and finish with one considered accessory.' : 'Finish with a simple bag and a refined shoe.'} Check individual venues for dress codes.`
  const third = active ? `For active days in ${name}, add a quick-drying top, stretch trousers, and a small daypack. ${wet ? 'Bring a rain shell.' : 'Carry a removable outer layer.'} Match your footwear to the actual route.` : relaxed ? `For slower days in ${name}, repeat your most comfortable separates with ${cold ? 'soft knitwear and warm socks' : 'a loose overshirt and an easy tote'}. ${styleLine[trip.style]}` : `For exploring ${name}, repeat your core outfit with ${layer}, ${shoes}, and a secure small bag. ${wet ? 'Keep rain protection close at hand.' : 'Use removable layers so you can adjust through the day.'}`
  const activityLabel = ACTIVITIES.find(a => a.value === trip.activity)?.label || 'A versatile travel edit'
  const styleLabel = STYLES.find(s => s.value === trip.style)?.label
  const destination: Destination = {
    slug, name: base?.name || name, country: base?.country || trip.destination.split(',').slice(1).join(',').trim(), region: base?.region || 'Your destination',
    bgClass: base?.bgClass || '', temp: weather.low === null ? 'Weather unavailable' : `${weather.low}–${weather.high}°C`,
    weather: weather.kind === 'forecast' ? 'Trip forecast' : weather.kind === 'seasonal' ? 'Historical seasonal guidance' : 'Check conditions before departure',
    type: activityLabel, forecast: [], products: [], guide: `${weatherLine} ${day}`,
    tags: [...(base?.tags || []).filter(t => !['autumn', 'winter', 'summer', 'spring', 'layers'].includes(t.toLowerCase())), ...(cold ? ['Layers'] : []), ...(styleLabel ? [styleLabel] : [])],
  }
  return { trip, destination, weather, looks: [{ title: `Your ${name} day look`, desc: day }, { title: 'The evening edit', desc: evening }, { title: active ? 'Ready to move' : relaxed ? 'Slow mornings, easy afternoons' : 'An exploring-day layer', desc: third }], packing: [tops, bottoms, shoes, layer, active ? 'A small daypack' : 'A secure crossbody bag', ...(wet ? ['A compact umbrella'] : [])] }
}
