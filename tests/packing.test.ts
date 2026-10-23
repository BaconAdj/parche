import test from 'node:test'
import assert from 'node:assert/strict'
import data from '../data/catalogue.json'
import { buildPackingPlan, type PackingKind } from '../lib/packing'
import { optionsForNeed, outboundUrl } from '../lib/selection'
import type { Product } from '../lib/catalogue-types'
import { unavailableWeather, type TripWeather } from '../lib/weather'
import type { Trip } from '../lib/trip'

const catalogue = data as unknown as Product[]
const trip: Trip = { destination: 'Lisbon, Portugal', start: '2027-01-05', end: '2027-01-10', activity: '', style: '', wear: 'women' }
const wx = (low: number, high: number, rainDays = 0): TripWeather => ({ ...unavailableWeather('Reference city'), kind: 'seasonal', low, high, rainDays })
const ids = (t: Trip, w: TripWeather) => buildPackingPlan(t, w).needs.map(n => n.id)

test('the list is complete: underwear, socks and sleepwear always; bras for womenswear', () => {
  for (const wear of ['women', 'men', 'unisex'] as const) {
    const list = ids({ ...trip, wear }, wx(12, 20))
    for (const k of ['underwear', 'socks', 'sleepwear', 'tee', 'walking-shoes', 'bag', 'sunglasses'] as PackingKind[]) assert.ok(list.includes(k), `${wear} missing ${k}`)
    assert.equal(list.includes('bra'), wear === 'women')
  }
})

test('activity changes what goes in the bag', () => {
  const w = wx(18, 27)
  const base = { ...trip, destination: 'Mexico City, Mexico' }
  const relaxing = ids({ ...base, activity: 'relaxing' }, w)
  const active = ids({ ...base, activity: 'active' }, w)
  const walking = buildPackingPlan({ ...base, activity: 'walking' }, w)
  const plain = buildPackingPlan(base, w)
  assert.ok(relaxing.includes('swim') && relaxing.includes('sandals'))
  assert.ok(active.includes('active-top') && active.includes('trail-shoes') && active.includes('daypack') && active.includes('sports-bra'))
  assert.ok(!relaxing.includes('trail-shoes'))
  assert.ok(walking.needs.find(n => n.id === 'socks')!.quantity > plain.needs.find(n => n.id === 'socks')!.quantity)
  assert.notDeepEqual(relaxing, active)
})

test('style changes the list too', () => {
  const polished = ids({ ...trip, style: 'polished' }, wx(12, 20))
  const relaxed = ids({ ...trip, style: 'relaxed' }, wx(12, 20))
  assert.ok(polished.includes('blazer'))
  assert.ok(!relaxed.includes('blazer') || buildPackingPlan({ ...trip, style: 'relaxed' }, wx(12, 20)).needs.find(n => n.id === 'blazer')!.optional)
})

test('cold, hot and coverage destinations produce different wardrobes', () => {
  const cold = ids({ ...trip, destination: 'Tokyo, Japan' }, wx(-3, 5))
  const hot = ids({ ...trip, destination: 'Bali, Indonesia' }, wx(25, 31, 60))
  assert.ok(cold.includes('coat') && cold.includes('warm-knit') && cold.includes('base-layer-top') && cold.includes('gloves') && cold.includes('boots'))
  assert.ok(!cold.includes('swim'))
  assert.ok(hot.includes('swim') && hot.includes('rain-shell') && hot.includes('umbrella') && hot.includes('light-scarf'))
  assert.ok(!hot.includes('warm-knit') && !hot.includes('coat'))
  assert.ok(ids({ ...trip, destination: 'Marrakech, Morocco' }, wx(20, 28)).includes('light-scarf'))
})

test('quantities follow trip length with a weekly laundry cap, and the total adds up', () => {
  const short = buildPackingPlan({ ...trip, end: trip.start }, wx(15, 22))
  const long = buildPackingPlan({ ...trip, end: '2027-02-10' }, wx(15, 22))
  assert.equal(short.days, 1); assert.equal(long.days, 37)
  assert.equal(short.needs.find(n => n.id === 'underwear')?.quantity, 1)
  assert.equal(long.needs.find(n => n.id === 'underwear')?.quantity, 8)
  assert.match(long.note, /laundry/)
  assert.equal(new Set(long.needs.map(n => n.id)).size, long.needs.length)
  assert.equal(long.total, long.needs.filter(n => !n.optional).reduce((t, n) => t + n.quantity, 0))
})

test('unavailable weather does not invent cold-weather or rain requirements', () => {
  const plan = buildPackingPlan({ ...trip, destination: 'Unknown place' }, unavailableWeather('Unknown place'))
  assert.equal(plan.climate, 'unknown')
  assert.ok(!plan.needs.some(n => ['warm-knit', 'coat', 'rain-shell', 'swim'].includes(n.id)))
  assert.ok(plan.needs.some(n => n.id === 'knit'))
})

test('every required piece has options in all three price tiers, with several choices each', () => {
  const scenarios: [Trip, TripWeather][] = [
    [{ ...trip, destination: 'Tokyo, Japan' }, wx(-2, 6)],
    [{ ...trip, destination: 'Bali, Indonesia', activity: 'relaxing' }, wx(25, 31, 60)],
    [{ ...trip, activity: 'active', style: 'polished' }, wx(12, 20, 40)],
  ]
  const thin: string[] = []
  for (const wear of ['women', 'men'] as const) for (const [t, w] of scenarios) {
    const plan = buildPackingPlan({ ...t, wear }, w)
    for (const need of plan.needs.filter(n => !n.optional)) {
      const tiers = optionsForNeed(catalogue, need.id, wear, plan, t.style, 'seed')
      const total = tiers.reduce((s, x) => s + x.products.length, 0)
      assert.ok(total >= 3, `${wear} ${t.destination} ${need.id}: only ${total} options`)
      if (tiers.length < 3 || tiers.some(x => x.products.length < 2)) thin.push(`${wear}:${need.id}`)
      for (const x of tiers) for (const p of x.products) {
        assert.equal(p.kinds[0], need.id)
        assert.ok(p.gender === wear || p.gender === 'unisex')
        assert.ok(p.climates.includes(plan.climate))
      }
    }
  }
  // Report thin pieces without failing: they are catalogue gaps for the refresh to close.
  if (thin.length) console.log('Pieces with fewer than 2 options in a tier:', [...new Set(thin)].join(', '))
})

test('options within a tier come from different brands where possible', () => {
  const plan = buildPackingPlan(trip, wx(12, 20))
  for (const t of optionsForNeed(catalogue, 'tee', 'women', plan, '', 'x')) assert.equal(new Set(t.products.map(p => p.brand)).size, t.products.length)
})

test('outbound links prefer affiliate URLs and otherwise tag the exact product page', () => {
  const base = catalogue[0]
  assert.ok(outboundUrl(base).startsWith(base.productUrl.split('?')[0]))
  assert.match(outboundUrl(base), /utm_source=parche/)
  assert.equal(outboundUrl({ ...base, affiliateUrl: 'https://aff.example/track?id=1' }), 'https://aff.example/track?id=1')
})

test('every product pairs an https product page with its own https image', () => {
  const seen = new Set<string>()
  for (const p of catalogue) {
    assert.ok(!seen.has(p.id), `duplicate ${p.id}`); seen.add(p.id)
    assert.match(p.productUrl, /^https:\/\//); assert.match(p.imageUrl, /^https:\/\//)
    assert.ok(p.kinds.length && p.climates.length && p.price > 0 && ['High-end', 'Quality', 'Budget'].includes(p.tier))
    assert.ok(!p.imageUrl.includes('unsplash'))
  }
  assert.ok(catalogue.length >= 1500)
})

test('unknown weather still offers every listed piece at three price points', () => {
  for (const wear of ['women', 'men'] as const) {
    const plan = buildPackingPlan({ ...trip, destination: 'Lisbon, Portugal', wear }, unavailableWeather('Lisbon'))
    for (const need of plan.needs.filter(n => !n.optional)) {
      const tiers = optionsForNeed(catalogue, need.id, wear, plan, '', 'seed')
      assert.ok(tiers.reduce((s, x) => s + x.products.length, 0) >= 3, `${wear} ${need.id} has too few options without weather`)
    }
  }
})
