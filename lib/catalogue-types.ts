import type { PackingKind, PackingPlan } from './packing'
import type { Trip, Wear } from './trip'

// Merchant page, photo and price are kept together as one record from the retailer's own data.
// affiliateUrl is optional: once a programme approves parché, its tracking link goes here and
// /go/[id] starts sending traffic through it, with no UI change needed.
export type Product = {
  id: string; gender: 'women' | 'men' | 'unisex'; tier: Tier; brand: string; name: string; price: number; currency: string
  productUrl: string; imageUrl: string; details: string; checkedAt: string; kinds: PackingKind[]
  climates: PackingPlan['climate'][]; colours: string[]; styles: Trip['style'][]; affiliateUrl?: string
}
export const TIERS = ['High-end', 'Quality', 'Budget'] as const
export type Tier = typeof TIERS[number]
export const TIER_LABEL: Record<Tier, string> = { 'High-end': 'Luxury', Quality: 'Mid-range', Budget: 'Budget' }

// What the shop API returns for one piece on the list: options grouped by price tier.
export type TierOptions = { tier: Tier; label: string; products: Product[] }
export type NeedOptions = { id: PackingKind; tiers: TierOptions[] }
export type ShopPayload = { wear: Wear; needs: NeedOptions[]; checkedAt: string | null }
