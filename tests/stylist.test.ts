import test from 'node:test'
import assert from 'node:assert/strict'
import data from '../data/catalogue.json'
import { buildPackingPlan, type PackingKind } from '../lib/packing'
import { liveProducts } from '../lib/selection'
import { buildEdit, DIRECTIONS } from '../lib/stylist'
import { profileOf } from '../lib/style'
import type { Product } from '../lib/catalogue-types'
import { unavailableWeather, type TripWeather } from '../lib/weather'
import type { Trip } from '../lib/trip'

const newest = (data as unknown as Product[]).map(p => p.checkedAt).sort().at(-1)!
const live = liveProducts(data as unknown as Product[], new Date(newest + 'T12:00:00Z'))
const wx = (low: number, high: number, rainDays = 0): TripWeather => ({ ...unavailableWeather('Reference city'), kind: 'seasonal', low, high, rainDays })
const base: Trip = { destination: 'Paris, France', start: '2027-01-05', end: '2027-01-10', activity: '', style: '', wear: 'women' }
const scenarios: [Trip, TripWeather][] = [
  [base, wx(3, 9, 40)],
  [{ ...base, wear: 'men', style: 'polished' }, wx(3, 9, 40)],
  [{ ...base, destination: 'Tulum, Mexico', activity: 'relaxing' }, wx(22, 30)],
  [{ ...base, destination: 'Lisbon, Portugal', wear: 'men', activity: 'walking' }, wx(12, 19, 30)],
  [{ ...base, destination: 'Banff, Canada', wear: 'men', activity: 'active' }, wx(-15, -3)],
  [{ ...base, destination: 'Positano, Italy', style: 'polished', activity: 'relaxing' }, wx(19, 28)],
  [{ ...base, destination: 'Somewhere', wear: 'unisex' }, unavailableWeather('Somewhere')],
]

test('every trip gets one named edit with three complete looks', () => {
  for (const [trip, w] of scenarios) {
    const plan = buildPackingPlan(trip, w)
    const edit = buildEdit(live, trip, plan, trip.destination)
    assert.ok(edit, `${trip.destination}: no edit`)
    assert.equal(edit.looks.length, 3, `${trip.destination} ${trip.wear}: ${edit.looks.length} looks`)
    for (const look of edit.looks) {
      assert.equal(look.pieces[0].role, 'The statement')
      assert.ok(look.pieces.length >= 3 && look.pieces.length <= 7)
      assert.ok(look.note.includes(look.pieces[0].product.brand))
      assert.ok(look.pieces.every(p => p.note.length > 10))
    }
  }
})

test('looks only use pieces on the packing list, in the right wardrobe and climate, never twice', () => {
  for (const [trip, w] of scenarios) {
    const plan = buildPackingPlan(trip, w)
    const edit = buildEdit(live, trip, plan, trip.destination)!
    const kinds = new Set<PackingKind>(plan.needs.map(n => n.id))
    const seen = new Set<string>()
    for (const look of edit.looks) for (const { product, kind } of look.pieces) {
      assert.ok(kinds.has(kind) && product.kinds[0] === kind, `${product.name} is not a ${kind} on the list`)
      assert.ok(trip.wear === 'unisex' || product.gender === trip.wear || product.gender === 'unisex')
      assert.ok(plan.climate === 'unknown' || product.climates.includes(plan.climate))
      assert.ok(!seen.has(product.id), `${product.name} styled twice`); seen.add(product.id)
      assert.ok(!profileOf(product).novelty, `${product.name} is novelty merchandise`)
    }
  }
})

test('looks hold together: palette colours, one pattern, no gym or sofa clothes off the trail', () => {
  for (const [trip, w] of scenarios) {
    const plan = buildPackingPlan(trip, w)
    const edit = buildEdit(live, trip, plan, trip.destination)!
    const d = DIRECTIONS.find(x => x.id === edit.id)!
    for (const look of edit.looks) {
      const profiles = look.pieces.map(p => profileOf(p.product))
      assert.ok(profiles.filter(s => s.pattern).length <= 1, `${look.title}: two patterns`)
      const offPalette = profiles.filter(s => s.family && !d.neutrals.includes(s.family) && !d.accents.includes(s.family) && !['black', 'white', 'cream', 'navy', 'grey', 'charcoal'].includes(s.family))
      assert.ok(offPalette.length <= 1, `${look.title}: ${offPalette.length} pieces outside the ${d.name} palette`)
      if (look.id !== 'active') assert.ok(!profiles.some(s => s.lounge), `${look.title}: loungewear in a styled look`)
      const tops = look.pieces.filter(p => ['shirt', 'linen-shirt', 'knit', 'long-sleeve-top', 'tee', 'warm-knit', 'active-top', 'base-layer-top'].includes(p.kind))
      const bottoms = look.pieces.filter(p => ['trousers', 'light-trousers', 'warm-trousers', 'jeans', 'shorts', 'skirt', 'active-bottoms'].includes(p.kind))
      assert.ok(tops.length <= 2 && bottoms.length <= 1, `${look.title}: ${tops.length} tops, ${bottoms.length} bottoms`)
    }
  }
})

test('the edit follows the trip: style and activity change the direction, and alternates can be chosen', () => {
  const plan = (t: Trip, w: TripWeather) => buildPackingPlan(t, w)
  const active = { ...base, destination: 'Banff, Canada', activity: 'active' as const }
  assert.equal(buildEdit(live, active, plan(active, wx(-15, -3)), 'x')!.id, 'trail-to-table')
  const hot = { ...base, destination: 'Bali, Indonesia' }
  const hotEdit = buildEdit(live, hot, plan(hot, wx(25, 31)), 'x')!
  assert.ok(['celadon-alabaster', 'riviera-blue', 'terracotta', 'grape-tomato'].includes(hotEdit.id))
  const alt = hotEdit.alternates[0]
  assert.equal(buildEdit(live, hot, plan(hot, wx(25, 31)), 'x', alt.id)!.id, alt.id)
})
