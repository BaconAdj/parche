// Daily reliability sweep for hand-captured (seed) products, run by .github/workflows/catalogue-refresh.yml.
//  1. Re-captures each brand's listing pages (sweep-sources.json) through the Firecrawl API: every product seen
//     gets its current price and photo and is marked checked today; new-season pieces are added.
//  2. Opens the product pages of displayed products that the listings did not confirm, most-clicked first,
//     up to SWEEP_PAGE_BUDGET pages, and reads the retailer's own structured data:
//       still sold → re-checked today (price updated if it changed)
//       sold out   → hidden at once (unavailableSince), re-checked weekly, dropped after 30 days
//       gone (404 / colour no longer offered) on two separate days → removed
//       unknown (blocked, no structured data) → nothing changes
// Needs FIRECRAWL_API_KEY; exits quietly without it. Optional: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to rank checks by clicks.
import fs from 'node:fs'
import path from 'node:path'
import { ROOT, slug } from './lib.mjs'
import { listingParsers, nikeFromSearch, brandMode, verifyProductPage, verifyNike } from './parsers.mjs'
import { SEED_FILE, readSeed, writeSeed, seedFiles, mergeRecords, pruneRecords, daysBetween } from './seed-store.mjs'

const KEY = process.env.FIRECRAWL_API_KEY
if (!KEY) { console.log('FIRECRAWL_API_KEY not set: skipping the seed sweep (seed products keep the 30-day window).'); process.exit(0) }
const today = process.env.CATALOGUE_DATE || new Date().toISOString().slice(0, 10)
const BUDGET = Number(process.env.SWEEP_PAGE_BUDGET || 60)
const STATE_FILE = path.join(ROOT, 'data/raw/sweep-state.json')
const sources = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/catalogue/sweep-sources.json'), 'utf8'))
const state = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : {}
state.strikes ||= {}; state.unverifiable ||= {}
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function firecrawl(body) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
        method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(150000),
      })
      if (res.status === 429 || res.status >= 500) { await sleep(5000 * (attempt + 1)); continue }
      const json = await res.json()
      if (!res.ok || !json.success) return { error: json.error || `HTTP ${res.status}` }
      return json.data
    } catch (e) { if (attempt === 2) return { error: e.message }; await sleep(3000) }
  }
  return { error: 'rate limited' }
}
const page = url => firecrawl({ url, formats: ['rawHtml'], maxAge: 0, proxy: 'auto', timeout: 90000, waitFor: 3000 })
async function pool(items, n, fn) { const out = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]) } })); return out }

const summary = { listings: {}, checks: { ok: 0, priceChanged: 0, soldout: 0, gone: 0, removed: 0, unknown: 0, restocked: 0 }, priceChanges: [], removed: [], unknownBrands: {} }
const touched = new Map() // seed file → records
const load = file => { if (!touched.has(file)) touched.set(file, readSeed(file)); return touched.get(file) }

// ── 1. Listing pages ──
const fresh = {}
const swept = new Set()
await pool(sources.listings, 4, async src => {
  const d = await page(src.url)
  const records = d.error ? [] : listingParsers[src.mode](d.rawHtml || '')
  ;(fresh[src.mode] ||= []).push(...records)
  summary.listings[src.url] = d.error ? `failed: ${d.error}` : `${records.length} products`
})
for (let i = 0; i < (sources.nike || []).length; i += 10) {
  const calls = sources.nike.slice(i, i + 10).map(options => ({ provider: 'nike-com', capability: 'products/search', options }))
  const d = await firecrawl({ alexandria: calls })
  ;(d.alexandria || []).forEach((r, k) => {
    const records = r.error ? [] : nikeFromSearch(r.data)
    ;(fresh.nike ||= []).push(...records)
    summary.listings[`nike: ${JSON.stringify(calls[k].options)}`] = r.error ? `failed: ${r.error.code || r.error}` : `${records.length} products`
  })
  if (d.error) summary.listings[`nike batch ${i / 10 + 1}`] = `failed: ${d.error}`
}
for (const [mode, records] of Object.entries(fresh)) {
  if (records.length < 5) continue // a blocked or empty page set proves nothing about the brand
  const file = SEED_FILE[mode]
  const { records: merged, added, updated } = mergeRecords(load(file), records, today)
  touched.set(file, merged)
  swept.add(records[0].brand)
  for (const r of records) delete state.strikes[r.id]
  summary.listings[`${mode} total`] = `${records.length} seen, ${added} new, ${updated} refreshed`
}

// ── 2. Direct product checks ──
async function clickCounts() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return new Map()
  try {
    const since = new Date(Date.now() - 30 * 86400000).toISOString()
    const res = await fetch(`${url}/rest/v1/product_clicks?select=product_id&created_at=gte.${since}&limit=50000`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(20000) })
    const rows = res.ok ? await res.json() : []
    return rows.reduce((m, r) => m.set(r.product_id, (m.get(r.product_id) || 0) + 1), new Map())
  } catch { return new Map() }
}
const clicks = await clickCounts()
const catalogueIds = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/catalogue.json'), 'utf8')).map(p => p.id))
const displayId = r => slug(r.id).slice(0, 90)
const candidates = []
for (const file of seedFiles()) for (const r of load(file)) {
  if (state.unverifiable[r.brand] && daysBetween(state.unverifiable[r.brand], today) < 14) continue
  if (r.unavailableSince) { if (!r.lastCheckAt || daysBetween(r.lastCheckAt, today) >= 7) candidates.push({ file, r, restock: true }); continue }
  if (!catalogueIds.has(displayId(r)) || (r.checkedAt && daysBetween(r.checkedAt, today) < 3)) continue
  candidates.push({ file, r })
}
candidates.sort((a, b) => Number(!!a.restock) - Number(!!b.restock) || (clicks.get(displayId(b.r)) || 0) - (clicks.get(displayId(a.r)) || 0) || String(a.r.checkedAt).localeCompare(String(b.r.checkedAt)))
const restockShare = Math.ceil(BUDGET * 0.1)
const chosen = [...candidates.filter(c => !c.restock).slice(0, BUDGET - Math.min(restockShare, candidates.filter(c => c.restock).length)), ...candidates.filter(c => c.restock).slice(0, restockShare)]

const verdicts = await pool(chosen, 4, async ({ r }) => {
  if (brandMode(r.brand) === 'nike') {
    const d = await firecrawl({ alexandria: { provider: 'nike-com', capability: 'products/product', options: { style_color: r.productUrl.split('/').pop() } } })
    const item = d.alexandria?.[0]
    return d.error || item?.error ? { status: 'unknown', note: String(d.error || item.error.code || item.error) } : verifyNike(r, item?.data)
  }
  const d = await page(r.productUrl)
  return d.error ? { status: 'unknown', note: d.error } : verifyProductPage(r, d.rawHtml, d.metadata?.statusCode)
})
const removed = new Set()
chosen.forEach(({ r, restock }, i) => {
  const v = verdicts[i]
  r.lastCheckAt = today
  if (v.status === 'unknown') {
    summary.checks.unknown++
    const c = (summary.unknownBrands[r.brand] ||= { unknown: 0, known: 0, structural: 0 })
    c.unknown++
    if (v.note === 'no structured offers') c.structural++ // the page loaded but carries no product data: a site limitation, not an outage
    return
  }
  ;(summary.unknownBrands[r.brand] ||= { unknown: 0, known: 0, structural: 0 }).known++
  if (v.status === 'ok') {
    summary.checks.ok++
    if (restock) summary.checks.restocked++
    if (v.price && Math.abs(v.price - r.price) > 0.005) { summary.checks.priceChanged++; summary.priceChanges.push(`${r.brand} ${r.name}: ${r.price} → ${v.price} ${r.currency}`); r.price = v.price }
    r.checkedAt = today
    delete r.unavailableSince
    delete state.strikes[r.id]
  } else if (v.status === 'soldout') {
    summary.checks.soldout++
    r.unavailableSince ||= today
  } else if (v.status === 'gone') {
    summary.checks.gone++
    const s = state.strikes[r.id]
    if (s && s.last !== today) { removed.add(r); summary.removed.push(`${r.brand} ${r.name} (${v.note || 'gone'})`); delete state.strikes[r.id] }
    else state.strikes[r.id] = { count: 1, last: today }
  }
})
summary.checks.removed = removed.size
// A brand whose pages never yield an answer is skipped for two weeks instead of spending credits on it daily.
// Outages and blocks never count here, so a bad day can't switch a brand's checks off.
for (const [brand, c] of Object.entries(summary.unknownBrands)) if (c.structural >= 3 && c.known === 0) state.unverifiable[brand] = today

// ── Save ──
for (const [file, records] of touched) writeSeed(file, pruneRecords(records.filter(r => !removed.has(r)), today))
for (const [id, s] of Object.entries(state.strikes)) if (daysBetween(s.last, today) > 14) delete state.strikes[id]
Object.assign(state, { lastRun: today, sweptBrands: [...swept].sort(), lastSummary: { listings: Object.keys(summary.listings).length, checked: chosen.length, ...summary.checks } })
fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 1) + '\n')

const lines = [`# Seed sweep (${today})`, '', `Swept brands: ${[...swept].join(', ') || 'none'}.`, `Product pages checked: ${chosen.length} of ${candidates.length} due (budget ${BUDGET}${clicks.size ? ', ranked by clicks' : ''}).`, '',
  `| Still sold | Price changed | Sold out (hidden) | Back in stock | Gone (1st strike) | Removed | Unknown |`, '|---|---|---|---|---|---|---|',
  `| ${summary.checks.ok} | ${summary.checks.priceChanged} | ${summary.checks.soldout} | ${summary.checks.restocked} | ${summary.checks.gone - removed.size} | ${removed.size} | ${summary.checks.unknown} |`, '',
  '## Listing pages', '', ...Object.entries(summary.listings).map(([k, v]) => `- ${k}: ${v}`), '',
  '## Price changes', '', ...(summary.priceChanges.length ? summary.priceChanges.map(s => `- ${s}`) : ['None.']), '',
  '## Removed', '', ...(summary.removed.length ? summary.removed.map(s => `- ${s}`) : ['None.']), '',
  '## Brands that could not be verified this run', '', ...((u => u.length ? u : ['None.'])(Object.entries(summary.unknownBrands).filter(([, c]) => c.unknown).map(([b, c]) => `- ${b}: ${c.unknown} unknown, ${c.known} answered`))), '']
fs.writeFileSync(path.join(ROOT, 'data/raw/sweep-report.md'), lines.join('\n'))
console.log(lines.slice(0, 8).join('\n'))
