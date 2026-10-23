// Server-only: the full catalogue is several megabytes, so pages receive selections through /api/clothing.
// data/catalogue.json is rebuilt weekly by .github/workflows/catalogue-refresh.yml (scripts/catalogue).
import 'server-only'
import data from '../data/catalogue.json'
import type { PackingPlan } from './packing'
import type { Trip } from './trip'
import type { NeedOptions, Product } from './catalogue-types'
import { liveProducts, optionsForNeed } from './selection'

export type { Product } from './catalogue-types'
export { outboundUrl } from './selection'

export const catalogue = data as unknown as Product[]
const byId = new Map(catalogue.map(p => [p.id, p]))

export const reviewedProducts = (now = new Date()) => liveProducts(catalogue, now)
export const findProduct = (id: string): Product | undefined => byId.get(id)

export function optionsForPlan(plan: PackingPlan, trip: Trip, now = new Date()): NeedOptions[] {
  const live = reviewedProducts(now)
  const seed = `${trip.destination}|${trip.start}`
  return plan.needs.map(n => ({ id: n.id, tiers: optionsForNeed(live, n.id, trip.wear, plan, trip.style, seed) }))
}
