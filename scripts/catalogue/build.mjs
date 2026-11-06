// Builds data/catalogue.json from every raw source and writes a coverage report.
// Run locally: node scripts/catalogue/ingest-shopify.mjs && node scripts/catalogue/build.mjs
// Raw sources: data/raw/shopify/*.json (brand feeds) and data/raw/seed/*.json (verified listing extractions).
import fs from 'node:fs'
import { kindFamily } from './classify.mjs'
import path from 'node:path'
import { ROOT, KINDS, classify, excluded, garmentFamily, tierFor, climatesFor, colours, styles, writeJson, slug } from './lib.mjs'

const today = process.env.CATALOGUE_DATE || new Date().toISOString().slice(0, 10)
const readDir = dir => fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')).flatMap(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))) : []
const raw = [...readDir(path.join(ROOT, 'data/raw/shopify')), ...readDir(path.join(ROOT, 'data/raw/seed'))]
const kindIds = new Set(KINDS.kinds.map(k => k.id))
const previous = fs.existsSync(path.join(ROOT, 'data/catalogue.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'data/catalogue.json'), 'utf8')) : []

// How long a product may go unconfirmed before the site hides it (lib/selection.ts reads maxAgeDays).
// Feed products and seed brands covered by a recent daily sweep are re-confirmed daily, so a short window is safe;
// everything else keeps the 30-day default.
const FEED_MAX_AGE = 10, SWEPT_MAX_AGE = 10
const sweepState = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data/raw/sweep-state.json'), 'utf8')) } catch { return {} } })()
const sweepIsRecent = sweepState.lastRun && (Date.parse(today) - Date.parse(sweepState.lastRun)) / 86400000 <= 2
const sweptBrands = new Set(sweepIsRecent ? sweepState.sweptBrands || [] : [])
const maxAgeFor = r => r.source?.startsWith('shopify:') ? FEED_MAX_AGE : sweptBrands.has(r.brand) ? SWEPT_MAX_AGE : undefined

// For listing extractions, the product's own code must appear in its image URL, so a photo can never belong to a neighbouring tile.
const PAIRING = {
  'zara': (u, i) => { const m = u.match(/-p(\d{8})\.html/); return !!m && i.includes(m[1]) },
  'massimo dutti': (u, i) => { const m = u.match(/-l(\d{8})/); return !!m && i.includes(m[1].slice(0, 8)) },
  'uniqlo': (u, i) => { const m = u.match(/E(\d{6})-/); return !!m && i.includes(m[1]) },
  'mango': (u, i) => { const m = u.match(/\/(\d{8})\//); return !!m && i.includes(m[1]) },
  'nike': (u, i) => { const m = u.match(/\/t\/([^/]+)\//); return !!m && i.toLowerCase().includes(m[1].toLowerCase().split('-').slice(0, 2).join('-')) },
  // Aritzia tiles lazy-load: the photo must carry both the style number and the colour code of its link.
  'aritzia': (u, i) => { const m = u.match(/\/(\d{5,6})\.html\?color=(\d+)/); return !!m && i.includes(`_${m[1]}_${m[2]}_`) },
  'adidas': (u, i) => { const m = u.match(/\/([A-Z0-9]{6})\.html/i); return !!m && i.toUpperCase().includes(m[1].toUpperCase()) },
}

const seen = new Set()
const rejected = []
const byKey = new Map()
for (const r of raw) {
  // Re-classify with the current rules so a rule fix applies without re-fetching. Records without a stored
  // title (older raw files) are checked by their name, and keep their stored kind only when the name is ambiguous.
  if (r.title !== undefined) r.kind = classify(r.title, r.type, r.brand)
  else if (r.kind) {
    const stem = r.name.split(' — ')[0]
    const byName = classify(stem, '', r.brand)
    r.kind = byName || (excluded(stem, r.kind) ? null : r.kind)
  }
  if (r.unavailableSince) { rejected.push([r.id, 'sold out']); continue }
  if (!r.kind) { rejected.push([r.id, 'not classified']); continue }
  if (!kindIds.has(r.kind) || !/^https:\/\//.test(r.productUrl) || !/^https:\/\//.test(r.imageUrl) || !(r.price > 0)) { rejected.push([r.id, 'invalid']); continue }
  const check = r.source?.startsWith('seed:') ? PAIRING[r.brand.toLowerCase()] : null
  if (check && !check(r.productUrl, r.imageUrl)) { rejected.push([r.id, 'image/product mismatch']); continue }
  let id = slug(r.id).slice(0, 90)
  if (seen.has(id)) continue
  seen.add(id)
  const text = `${r.name} ${r.text || ''}`
  const product = {
    id, gender: r.gender, tier: r.tier || tierFor(r.kind, r.price, r.currency), brand: r.brand, name: r.name,
    price: Math.round(r.price * 100) / 100, currency: r.currency, productUrl: r.productUrl, imageUrl: r.imageUrl,
    details: r.details || '', checkedAt: r.checkedAt || today, kinds: [r.kind],
    climates: r.climates || climatesFor(r.kind, text), colours: r.colours || colours(text), styles: r.styles || styles(text),
  }
  if (r.affiliateUrl) product.affiliateUrl = r.affiliateUrl
  if (r.source?.startsWith('shopify:')) product.feed = 'shopify'
  const maxAge = maxAgeFor(r)
  if (maxAge) product.maxAgeDays = maxAge
  // Diversity: at most 8 products per brand × piece × gender.
  const key = `${product.brand}|${r.kind}|${product.gender}`
  const list = byKey.get(key) || []
  if (list.length >= 8) continue
  // Avoid near-duplicates (same style in many colours): two colours per style name at most.
  const stem = product.name.split(' — ')[0].toLowerCase()
  if (list.filter(p => p.name.split(' — ')[0].toLowerCase() === stem).length >= 2) continue
  list.push(product)
  byKey.set(key, list)
}
// A store whose feed failed today keeps yesterday's products with their original check date, so a brief outage
// doesn't empty its shelf; they disappear on their own if the feed stays down past the feed window.
const reportFile = path.join(ROOT, 'data/raw/shopify-report.tsv')
const failedDomains = fs.existsSync(reportFile) ? fs.readFileSync(reportFile, 'utf8').split('\n').map(l => l.split('\t')).filter(c => c[0] && (c[1] === 'no currency' || (c[2] === 'kept 0' && c[3]))).map(c => c[0]) : []
const carried = []
const built = [...byKey.values()].flat()
const builtIds = new Set(built.map(p => p.id))
for (const p of previous) {
  if (builtIds.has(p.id) || !failedDomains.some(d => p.productUrl.startsWith(`https://${d}/`))) continue
  carried.push({ ...p, feed: 'shopify', maxAgeDays: FEED_MAX_AGE })
}
const catalogue = [...built, ...carried].sort((a, b) => a.kinds[0].localeCompare(b.kinds[0]) || a.id.localeCompare(b.id))
writeJson(path.join(ROOT, 'data/catalogue.json'), catalogue)

// Coverage report: options per piece × wardrobe × tier, so gaps are visible.
const tiers = ['High-end', 'Quality', 'Budget']
const lines = [`# Catalogue coverage (${today})`, '', `${catalogue.length} products from ${new Set(catalogue.map(p => p.brand)).size} brands. Rejected: ${rejected.length}.`, '', '| Piece | Women L/M/B | Men L/M/B |', '|---|---|---|']
for (const k of KINDS.kinds) {
  const cell = g => tiers.map(t => catalogue.filter(p => p.kinds[0] === k.id && (p.gender === g || p.gender === 'unisex') && p.tier === t).length).join(' / ')
  lines.push(`| ${k.label} | ${cell('women')} | ${cell('men')} |`)
}
const window = catalogue.reduce((a, p) => (a[p.maxAgeDays || 30] = (a[p.maxAgeDays || 30] || 0) + 1, a), {})
lines.push('', '## Reliability', '', `Hidden if unconfirmed for: ${Object.entries(window).map(([d, n]) => `${d} days (${n} products)`).join(', ')}.`,
  `Daily sweep: ${sweepIsRecent ? `last run ${sweepState.lastRun}, brands ${[...sweptBrands].join(', ') || 'none'}` : 'not active'}.`,
  `Sold out and hidden: ${rejected.filter(r => r[1] === 'sold out').length}.`,
  `Feeds that failed today (yesterday's products kept): ${failedDomains.length ? `${failedDomains.join(', ')} (${carried.length} products)` : 'none'}.`)
lines.push('', '## Brands', '', ...Object.entries(catalogue.reduce((a, p) => (a[p.brand] = (a[p.brand] || 0) + 1, a), {})).sort((a, b) => b[1] - a[1]).map(([b, n]) => `- ${b}: ${n}`))
// Category audit: the garment word in each name should belong to the family of the piece it is listed under.
// Expected crossings (lounge pants filed as sleepwear, bikini tops as swim, crew socks, vests as knitwear) are not flagged.
const EXPECTED = new Set(['top>sleep', 'bottom>sleep', 'dress>sleep', 'top>swim', 'bottom>swim', 'under>swim', 'dress>swim', 'top>sock', 'bottom>sock', 'bottom>under', 'outer>top', 'top>outer', 'under>bottom'])
const odd = catalogue.filter(p => { const f = garmentFamily(p.name.split(' — ')[0]), k = kindFamily(p.kinds[0]); return f && f !== k && !EXPECTED.has(`${f}>${k}`) })
lines.push('', '## Category audit', '', `${odd.length} products whose name names a different kind of garment than their piece.`, '', ...odd.slice(0, 60).map(p => `- ${p.kinds[0]}: ${p.brand} — ${p.name}`))
fs.writeFileSync(path.join(ROOT, 'data/catalogue-report.md'), lines.join('\n') + '\n')
console.log(lines.slice(0, 3).join('\n'))
