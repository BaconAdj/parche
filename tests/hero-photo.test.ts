import test from 'node:test'
import assert from 'node:assert/strict'
import { heroQueries, pickHero, scorePhoto, type UnsplashResult } from '../lib/hero-photo'

const photo = (id: string, alt: string, likes = 200, width = 5000, height = 3300): UnsplashResult => ({
  id, alt, alt_description: alt, width, height, likes, urls: { raw: `https://images.unsplash.com/${id}?ixid=x`, regular: `r-${id}`, small: `s-${id}` },
  user: { name: 'A' }, links: { html: `https://unsplash.com/photos/${id}` },
} as UnsplashResult & { alt: string })

test('seaside destinations lead with the water, cities with the skyline', () => {
  assert.match(heroQueries('Cancun', 'Mexico')[0], /beach/)
  assert.match(heroQueries('Paris', 'France')[0], /skyline/)
})

test('a scenic shot of the place beats a popular restaurant photo', () => {
  const beach = photo('beach', 'turquoise water and white sand beach in Cancun, aerial view', 120)
  const diner = photo('diner', 'restaurant sign on a building in Cancun', 900)
  assert.ok(scorePhoto(beach, 'Cancun') > scorePhoto(diner, 'Cancun'))
  const picked = pickHero([diner, beach], 'Cancun')
  assert.equal(picked[0].id, 'beach')
  assert.ok(!picked.some(p => p.id === 'diner'), 'unattractive candidates are dropped, not just ranked lower')
})

test('portrait and low-resolution frames lose to wide ones', () => {
  const wide = photo('wide', 'Lisbon skyline at sunset', 100)
  const tall = photo('tall', 'Lisbon skyline at sunset', 100, 3000, 4500)
  assert.ok(scorePhoto(wide, 'Lisbon') > scorePhoto(tall, 'Lisbon'))
})

test('duplicates across queries are removed and the url is sized for a banner', () => {
  const p = photo('dup', 'Tokyo skyline at night, tower view', 500)
  const picked = pickHero([p, p], 'Tokyo')
  assert.equal(picked.length, 1)
  assert.match(picked[0].url, /w=2400/)
})

test('accented captions still count as the place', () => {
  const accented = photo('acc', 'Clear blue ocean on the sandy shore in Cancún', 1200)
  const generic = photo('gen', 'landscape photo of a beach resort', 55)
  assert.equal(pickHero([generic, accented], 'Cancun')[0].id, 'acc')
})
