// Converts retailer data captured with Firecrawl (structured provider output or a page's own embedded
// product JSON) into catalogue records. Deterministic: no AI extraction, so every image belongs to its product.
// Usage:
//   node scripts/catalogue/seed-parsers.mjs nike <rows.tsv>
//   node scripts/catalogue/seed-parsers.mjs hm <page.html> [more.html ...]
//   node scripts/catalogue/seed-parsers.mjs zara <page.html> [...]
import fs from 'node:fs'
import path from 'node:path'
import { ROOT, classify, detectGender, writeJson, slug } from './lib.mjs'

const [mode, ...files] = process.argv.slice(2)
const today = new Date().toISOString().slice(0, 10)
const outFile = path.join(ROOT, 'data/raw/seed', `${mode}.json`)
const existing = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : []
const byId = new Map(existing.map(r => [r.id, r]))
const add = r => { if (r && r.kind && r.gender) byId.set(r.id, { ...r, checkedAt: today }) }

const nextData = html => {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  return m ? JSON.parse(m[1]) : null
}
function* walk(o) {
  if (Array.isArray(o)) { yield o; for (const v of o) yield* walk(v) }
  else if (o && typeof o === 'object') for (const v of Object.values(o)) yield* walk(v)
}

const parsers = {
  nike(file) {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const [url, title, subtitle, color, price, img] = line.split('\t')
      if (!url || !img || !(+price > 0)) continue
      const text = `${title} ${subtitle}`
      if (/basketball|skate|football|soccer|cleat|golf|spike|weightlift|boxing|wrestling/i.test(text)) continue
      const kind = classify(text)
      add({ source: 'seed-api:nike', brand: 'Nike', id: `nike-${url.split('/').pop()}`, name: `${title} ${subtitle.replace(/^(Men's|Women's)\s*/i, '')} — ${color}`.replace(/\s+/g, ' '),
        title: `${title} ${subtitle}`, type: '', gender: detectGender(subtitle, 'unisex'), kind, price: +price, currency: 'USD',
        productUrl: url.startsWith('http') ? url : `https://www.nike.com/t/${url}`,
        imageUrl: img.startsWith('http') ? img : `https://static.nike.com/a/images/t_web_pdp_936_v2/${img}`, text })
    }
  },
  hm(file) {
    const data = nextData(fs.readFileSync(file, 'utf8'))
    if (!data) return
    for (const list of walk(data)) {
      if (!list.length || !list[0] || typeof list[0] !== 'object' || !('pdpUrl' in list[0]) || !('articleCode' in list[0])) continue
      for (const p of list) {
        const img = p.imageProductSrc || p.imageModelSrc
        const price = p.prices?.find(x => x.priceType === 'redPrice')?.price ?? p.prices?.[0]?.price
        if (!img || !(price > 0) || !p.pdpUrl) continue
        const cat = String(p.category || '').replace(/_/g, ' ')
        const gender = /^men/.test(p.category || '') ? 'men' : /^ladies|^women|^divided/.test(p.category || '') ? 'women' : detectGender(cat, 'unisex')
        const colour = p.productColor?.colorName || ''
        const text = `${p.title} ${cat} ${colour}`
        add({ source: 'seed-page:hm', brand: 'H&M', id: `hm-${p.articleCode}`, name: colour ? `${p.title} — ${colour}` : p.title,
          title: p.title, type: cat, gender, kind: classify(p.title, cat), price, currency: 'CAD',
          productUrl: p.pdpUrl.startsWith('http') ? p.pdpUrl : `https://www2.hm.com${p.pdpUrl}`, imageUrl: img.replace(/\?.*$/, '') + '?imwidth=1260', text })
      }
    }
  },
}

if (!parsers[mode]) { console.error('Unknown mode', mode); process.exit(1) }
for (const f of files) parsers[mode](f)
const out = [...byId.values()]
writeJson(outFile, out)
const kinds = out.reduce((a, r) => (a[r.kind] = (a[r.kind] || 0) + 1, a), {})
console.log(mode, out.length, JSON.stringify(kinds))
void slug
