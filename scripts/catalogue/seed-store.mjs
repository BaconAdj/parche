// Shared helpers for reading and updating data/raw/seed/*.json.
import fs from 'node:fs'
import path from 'node:path'
import { ROOT } from './lib.mjs'

export const SEED_DIR = path.join(ROOT, 'data/raw/seed')
export const SEED_FILE = { hm: 'hm', uniqlo: 'uniqlo', zara: 'zara', tnf: 'the-north-face', columbia: 'columbia', adidas: 'adidas', nike: 'nike' }
export const readSeed = file => { const f = path.join(SEED_DIR, `${file}.json`); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : [] }
export const writeSeed = (file, records) => fs.writeFileSync(path.join(SEED_DIR, `${file}.json`), JSON.stringify(records, null, 1))
export const seedFiles = () => fs.readdirSync(SEED_DIR).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''))
export const daysBetween = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000)
const urlKey = u => String(u || '').toLowerCase()

// Fresh captures replace the matching record (same id or same product link) and mark it re-checked today.
// Fields only hand-curation adds (details, climates, styles…) are kept. New products are appended.
export function mergeRecords(existing, fresh, today) {
  const records = existing.map(r => ({ ...r }))
  const byId = new Map(records.map(r => [r.id, r]))
  const byUrl = new Map(records.map(r => [urlKey(r.productUrl), r]))
  let added = 0, updated = 0
  for (const f of fresh) {
    if (!f || !f.gender || !f.productUrl || !f.imageUrl || !(f.price > 0)) continue
    const hit = byId.get(f.id) || byUrl.get(urlKey(f.productUrl))
    if (hit) {
      Object.assign(hit, { ...f, id: hit.id, checkedAt: today })
      delete hit.unavailableSince
      updated++
    } else {
      const r = { ...f, checkedAt: today }
      records.push(r); byId.set(r.id, r); byUrl.set(urlKey(r.productUrl), r)
      added++
    }
  }
  // One record per product link: the most recently checked wins.
  const best = new Map()
  for (const r of records) { const k = urlKey(r.productUrl); const b = best.get(k); if (!b || (r.checkedAt || '') > (b.checkedAt || '')) best.set(k, r) }
  const keep = new Set(best.values())
  return { records: records.filter(r => keep.has(r)), added, updated }
}

// Housekeeping: drop records nobody has been able to confirm for 60 days, and sold-out records after 30 days.
// Both are already hidden from the site long before this.
export function pruneRecords(records, today) {
  return records.filter(r => !(r.checkedAt && daysBetween(r.checkedAt, today) > 60) && !(r.unavailableSince && daysBetween(r.unavailableSince, today) > 30))
}
