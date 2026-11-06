// Converts retailer pages captured with Firecrawl into seed records, using the deterministic parsers in parsers.mjs.
// No AI extraction, so every image belongs to its product. The daily sweep (sweep.mjs) uses the same parsers.
// Usage:
//   node scripts/catalogue/seed-parsers.mjs nike <rows.tsv>                       (url, title, subtitle, colour, price, image per line)
//   node scripts/catalogue/seed-parsers.mjs <hm|uniqlo|zara|tnf|columbia|adidas> <page.html | firecrawl-result.json> [...]
import fs from 'node:fs'
import path from 'node:path'
import { ROOT } from './lib.mjs'
import { listingParsers, nikeRecord } from './parsers.mjs'
import { mergeRecords, SEED_FILE } from './seed-store.mjs'

const [mode, ...files] = process.argv.slice(2)
const today = new Date().toISOString().slice(0, 10)
if (mode !== 'nike' && !listingParsers[mode]) { console.error('Unknown mode', mode); process.exit(1) }

const fresh = []
for (const f of files) {
  const raw = fs.readFileSync(f, 'utf8')
  if (mode === 'nike') {
    for (const line of raw.split('\n')) {
      const [url, title, subtitle, color, price, img] = line.split('\t')
      const r = nikeRecord({ url, title, subtitle, color, price, img })
      if (r) fresh.push(r)
    }
    continue
  }
  // Accept either raw HTML or a saved Firecrawl result ({ rawHtml } or { data: { rawHtml } }).
  let html = raw
  if (raw.trimStart().startsWith('{')) { const j = JSON.parse(raw); html = j.rawHtml || j.data?.rawHtml || '' }
  fresh.push(...listingParsers[mode](html))
}
const outFile = path.join(ROOT, 'data/raw/seed', `${SEED_FILE[mode]}.json`)
const existing = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : []
const { records, added, updated } = mergeRecords(existing, fresh, today)
fs.writeFileSync(outFile, JSON.stringify(records, null, 1))
console.log(mode, `parsed ${fresh.length}, added ${added}, refreshed ${updated}, file ${records.length}`)
