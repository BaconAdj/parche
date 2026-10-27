// Server-only: the full catalogue is several megabytes, so pages receive selections through /api/clothing.
// data/catalogue.json is rebuilt weekly by .github/workflows/catalogue-refresh.yml (scripts/catalogue).
import 'server-only'
import data from '../data/catalogue.json'
import type { PackingPlan } from './packing'
import type { Trip } from './trip'
import type { NeedOptions, Product } from './catalogue-types'
import { liveProducts, optionsForNeed } from './selection'
import { buildEdit, directionFit, DIRECTIONS, type StyledEdit } from './stylist'

export type { Product } from './catalogue-types'
export { outboundUrl } from './selection'

export const catalogue = data as unknown as Product[]
const byId = new Map(catalogue.map(p => [p.id, p]))

export const reviewedProducts = (now = new Date()) => liveProducts(catalogue, now)
export const findProduct = (id: string): Product | undefined => byId.get(id)

// The trip's edit decides the looks, and leans every piece's options toward its palette.
// The pieces styled into a look are the first option in their tier and carry the parché pick.
export function shopForTrip(plan: PackingPlan, trip: Trip, requestedEdit?: string, now = new Date()): { needs: NeedOptions[]; edit: StyledEdit | null } {
  const live = reviewedProducts(now)
  const seed = `${trip.destination}|${trip.start}`
  const edit = buildEdit(live, trip, plan, seed, requestedEdit)
  const direction = DIRECTIONS.find(d => d.id === edit?.id)
  const styled = edit?.looks.flatMap(l => l.pieces) || []
  const needs = plan.needs.map(n => {
    const pinned = styled.filter(p => p.kind === n.id).map(p => p.product)
    const tiers = optionsForNeed(live, n.id, trip.wear, plan, trip.style, seed, 3, direction ? p => directionFit(p, direction) * 0.8 : undefined, pinned)
    return { id: n.id, tiers, picks: pinned.map(p => p.id) }
  })
  return { needs, edit }
}

export function optionsForPlan(plan: PackingPlan, trip: Trip, now = new Date()): NeedOptions[] {
  return shopForTrip(plan, trip, undefined, now).needs
}
