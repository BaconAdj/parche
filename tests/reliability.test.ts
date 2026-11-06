import test from 'node:test'
import assert from 'node:assert/strict'
import { alternativesFor, liveProducts, shopifyAvailability, shopifyStatusUrl } from '../lib/selection'
import type { Product } from '../lib/catalogue-types'

const base: Product = {
  id: 'p', gender: 'women', tier: 'Quality', brand: 'A', name: 'Tee', price: 50, currency: 'CAD', productUrl: 'https://a.example/products/tee',
  imageUrl: 'https://a.example/tee.jpg', details: '', checkedAt: '2026-11-01', kinds: ['tee'], climates: ['mild'], colours: [], styles: ['understated'],
}
const make = (o: Partial<Product>): Product => ({ ...base, productUrl: `https://a.example/products/${o.id}`, ...o })

test('products re-checked daily hide sooner when nobody confirms them', () => {
  const daily = make({ id: 'daily', maxAgeDays: 10 })
  const plain = make({ id: 'plain' })
  assert.deepEqual(liveProducts([daily, plain], new Date('2026-11-10')).map(p => p.id), ['daily', 'plain'])
  assert.deepEqual(liveProducts([daily, plain], new Date('2026-11-12')).map(p => p.id), ['plain'])
  assert.deepEqual(liveProducts([daily, plain], new Date('2026-12-02')).map(p => p.id), [])
})

test('sold-out alternatives: same piece and wardrobe, same tier first, nearest price, two per brand at most', () => {
  const sold = make({ id: 'sold', price: 50 })
  const pool = [
    sold,
    make({ id: 'a1', brand: 'B', price: 52 }), make({ id: 'a2', brand: 'B', price: 49 }), make({ id: 'a3', brand: 'B', price: 50 }),
    make({ id: 'c1', brand: 'C', price: 20, tier: 'Budget' }),
    make({ id: 'd1', brand: 'D', price: 70 }),
    make({ id: 'men', brand: 'E', gender: 'men', price: 50 }),
    make({ id: 'shirt', brand: 'F', kinds: ['shirt'], price: 50 }),
    make({ id: 'same-link', brand: 'A', productUrl: 'https://a.example/products/sold' }),
  ]
  const ids = alternativesFor(sold, pool).map(p => p.id)
  assert.deepEqual(ids, ['a3', 'a2', 'd1', 'c1'])
})

test('click-time check only asks stores with a live feed, and decides on the exact colour', () => {
  assert.equal(shopifyStatusUrl(base), null)
  const feed = make({ feed: 'shopify', productUrl: 'https://shop.example/en-ca/products/linen-shirt?variant=42' })
  assert.equal(shopifyStatusUrl(feed), 'https://shop.example/en-ca/products/linen-shirt.js')
  assert.equal(shopifyAvailability(feed, 404, null), 'unavailable')
  assert.equal(shopifyAvailability(feed, 503, null), 'unknown')
  assert.equal(shopifyAvailability(feed, 200, { available: true, variants: [{ id: 42, available: false }, { id: 7, available: true }] }), 'unavailable')
  assert.equal(shopifyAvailability(feed, 200, { available: false, variants: [{ id: 42, available: true }] }), 'available')
  assert.equal(shopifyAvailability(feed, 200, { available: true, variants: [{ id: 7, available: true }] }), 'unavailable')
  const noVariant = make({ feed: 'shopify', productUrl: 'https://shop.example/products/tote' })
  assert.equal(shopifyAvailability(noVariant, 200, { available: true }), 'available')
  assert.equal(shopifyAvailability(noVariant, 200, {}), 'unknown')
})
