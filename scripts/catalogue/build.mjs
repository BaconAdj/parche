// Builds data/catalogue.json from every raw source and writes a coverage report.
// Run locally: node scripts/catalogue/ingest-shopify.mjs && node scripts/catalogue/build.mjs
// Raw sources: data/raw/shopify/*.json (brand feeds) and data/raw/seed/*.json (verified listing extractions).
import fs from 'node:fs'
import path from 'node:path'
import { ROOT, KINDS, tierFor, climatesFor, colours, styles, writeJson, slug } from './lib.mjs'

const today = process.env.CATALOGUE_DATE || new Date().toISOString().slice(0, 10)
const readDir = dir => fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')).flatMap(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))) : []
const raw = [...readDir(path.join(ROOT, 'data/raw/shopify')), ...readDir(path.join(ROOT, 'data/raw/seed'))]
const kindIds = new Set(KINDS.kinds.map(k => k.id))

// For listing extractions, the product's own code must appear in its image URL, so a photo can never belong to a neighbouring tile.
const PAIRING = {
  'zara': (u, i) => { const m = u.match(/-p(\d{8})\.html/); return !!m && i.includes(m[1]) },
  'massimo dutti': (u, i) => { const m = u.match(/-l(\d{8})/); return !!m && i.includes(m[1].slice(0, 8)) },
  'uniqlo': (u, i) => { const m = u.match(/E(\d{6})-/); return !!m && i.includes(m[1]) },
  'mango': (u, i) => { const m = u.match(/_(\d{8})/); return !!m && i.includes(m[1]) },
  'nike': (u, i) => { const m = u.match(/\/t\/([^/]+)\//); return !!m && i.toLowerCase().includes(m[1].toLowerCase().split('-').slice(0, 2).join('-')) },
  'adidas': (u, i) => { const m = u.match(/\/([A-Z0-9]{6})\.html/i); return !!m && i.toUpperCase().includes(m[1].toUpperCase()) },
}

const seen = new Set()
const rejected = []
const byKey = new Map()
for (const r of raw) {
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
  // Diversity: at most 14 products per brand × piece × gender.
  const key = `${product.brand}|${r.kind}|${product.gender}`
  const list = byKey.get(key) || []
  if (list.length >= 14) continue
  // Avoid near-duplicates (same style in many colours): two colours per style name at most.
  const stem = product.name.split(' — ')[0].toLowerCase()
  if (list.filter(p => p.name.split(' — ')[0].toLowerCase() === stem).length >= 2) continue
  list.push(product)
  byKey.set(key, list)
}
const catalogue = [...byKey.values()].flat().sort((a, b) => a.kinds[0].localeCompare(b.kinds[0]) || a.id.localeCompare(b.id))
writeJson(path.join(ROOT, 'data/catalogue.json'), catalogue)

// Coverage report: options per piece × wardrobe × tier, so gaps are visible.
const tiers = ['High-end', 'Quality', 'Budget']
const lines = [`# Catalogue coverage (${today})`, '', `${catalogue.length} products from ${new Set(catalogue.map(p => p.brand)).size} brands. Rejected: ${rejected.length}.`, '', '| Piece | Women L/M/B | Men L/M/B |', '|---|---|---|']
for (const k of KINDS.kinds) {
  const cell = g => tiers.map(t => catalogue.filter(p => p.kinds[0] === k.id && (p.gender === g || p.gender === 'unisex') && p.tier === t).length).join(' / ')
  lines.push(`| ${k.label} | ${cell('women')} | ${cell('men')} |`)
}
lines.push('', '## Brands', '', ...Object.entries(catalogue.reduce((a, p) => (a[p.brand] = (a[p.brand] || 0) + 1, a), {})).sort((a, b) => b[1] - a[1]).map(([b, n]) => `- ${b}: ${n}`))
fs.writeFileSync(path.join(ROOT, 'data/catalogue-report.md'), lines.join('\n') + '\n')
console.log(lines.slice(0, 3).join('\n'))
