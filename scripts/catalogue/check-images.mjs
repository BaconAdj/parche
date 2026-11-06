// Runs after build.mjs: asks every product photo's CDN whether the image still exists and drops products whose photo
// is gone (404/410), so a card never shows a broken picture. Blocked or slow answers change nothing.
// Usage: node scripts/catalogue/check-images.mjs
import fs from 'node:fs'
import path from 'node:path'
import { ROOT } from './lib.mjs'

const file = path.join(ROOT, 'data/catalogue.json')
const catalogue = JSON.parse(fs.readFileSync(file, 'utf8'))
const UA = 'Mozilla/5.0 (compatible; parche-catalogue/1.0; +https://github.com/BaconAdj/parche)'

async function status(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, headers: { 'user-agent': UA, ...(method === 'GET' ? { range: 'bytes=0-0' } : {}) }, redirect: 'follow', signal: AbortSignal.timeout(10000) })
      res.body?.cancel?.().catch?.(() => {})
      if (res.status === 405 || res.status === 501) continue
      return res.status
    } catch { return 0 }
  }
  return 0
}

const urls = [...new Set(catalogue.map(p => p.imageUrl))]
const result = new Map()
let i = 0
await Promise.all(Array.from({ length: 24 }, async () => { while (i < urls.length) { const u = urls[i++]; result.set(u, await status(u)) } }))
const gone = new Set(urls.filter(u => [404, 410].includes(result.get(u))))
const unknown = urls.filter(u => { const s = result.get(u); return !s || s >= 400 && !gone.has(u) }).length

// A sudden wave of 404s means a CDN is refusing the checker, not that thousands of photos vanished overnight.
const lines = ['', '## Photo check', '']
if (gone.size > urls.length * 0.05) {
  lines.push(`Skipped removals: ${gone.size} of ${urls.length} photos answered 404/410, which looks like blocking rather than removals.`)
} else {
  const kept = catalogue.filter(p => !gone.has(p.imageUrl))
  fs.writeFileSync(file, JSON.stringify(kept, null, 1))
  lines.push(`${urls.length} photos checked: ${gone.size} gone (products removed), ${unknown} could not be checked (left as is).`,
    ...catalogue.filter(p => gone.has(p.imageUrl)).slice(0, 40).map(p => `- ${p.brand} — ${p.name}`))
}
fs.appendFileSync(path.join(ROOT, 'data/catalogue-report.md'), lines.join('\n') + '\n')
console.log(lines.slice(3, 4).join(''))
