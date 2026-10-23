// Pulls in-stock products from brand stores' public Shopify feeds (/products.json).
// Each record keeps the store's own image, exact product URL and listed price together.
// Usage: node scripts/catalogue/ingest-shopify.mjs [domain ...]   (default: every source in sources.json)
import fs from 'node:fs'
import path from 'node:path'
import { ROOT, classify, detectGender, clean, writeJson, slug } from './lib.mjs'

const sources = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/catalogue/sources.json'), 'utf8')).shopify
const only = new Set(process.argv.slice(2))
const UA = 'Mozilla/5.0 (compatible; parche-catalogue/1.0; +https://github.com/BaconAdj/parche)'
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function getPage(base, page) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(`${base}/products.json?limit=250&page=${page}`, { headers: { 'user-agent': UA, accept: 'application/json' }, signal: AbortSignal.timeout(30000) })
      if (res.status === 429 || res.status >= 500) { await sleep(4000 * (attempt + 1)); continue }
      if (!res.ok) return { error: `HTTP ${res.status}` }
      const json = await res.json()
      return { products: json.products || [] }
    } catch (e) { await sleep(3000); if (attempt === 3) return { error: e.message } }
  }
  return { error: 'rate limited' }
}

const report = []
for (const src of sources) {
  if (only.size && !only.has(src.domain)) continue
  const base = `https://${src.domain}${src.prefix || ''}`
  const out = []
  let seen = 0, error = ''
  // The store's own base currency, so prices are never mislabelled.
  let currency = src.currency
  try { const meta = await (await fetch(`https://${src.domain}/meta.json`, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(15000) })).json(); if (meta.currency) currency = meta.currency } catch {}
  if (!currency) { report.push(`${src.domain}\tno currency`); continue }
  for (let page = 1; page <= (src.maxPages || 6); page++) {
    const r = await getPage(base, page)
    if (r.error) { error = r.error; break }
    if (!r.products.length) break
    seen += r.products.length
    for (const p of r.products) {
      const variants = (p.variants || []).filter(v => v.available !== false)
      const image = p.images?.[0]?.src
      if (!variants.length || !image) continue
      const tags = Array.isArray(p.tags) ? p.tags.join(' ') : String(p.tags || '')
      const title = clean(p.title)
      const kind = classify(title, p.product_type || '')
      if (!kind) continue
      const gender = detectGender(`${title} ${p.product_type || ''} ${tags} ${p.handle}`, src.gender)
      if (!gender) continue
      const price = Math.min(...variants.map(v => parseFloat(v.price)).filter(n => n > 0))
      if (!Number.isFinite(price)) continue
      // Pair the photo with a specific colour only when the store links them; otherwise keep the name colour-neutral.
      const colourIdx = (p.options || []).findIndex(o => /colou?r/i.test(o.name))
      const pictured = variants.find(v => v.featured_image?.src)
      let img = image, colour = '', url = `${base}/products/${p.handle}`
      if (pictured && colourIdx >= 0) {
        img = pictured.featured_image.src
        colour = pictured[`option${colourIdx + 1}`] || ''
        url += `?variant=${pictured.id}`
      } else if (colourIdx >= 0 && p.options[colourIdx].values?.length === 1) {
        colour = p.options[colourIdx].values[0]
      }
      out.push({
        source: `shopify:${src.domain}`,
        brand: src.brand,
        id: `${slug(src.brand)}-${p.handle}`.slice(0, 90),
        name: colour && !title.toLowerCase().includes(String(colour).toLowerCase()) ? `${title} — ${colour}` : title,
        title, type: p.product_type || '',
        gender, kind, price, currency,
        productUrl: url,
        imageUrl: img.startsWith('//') ? `https:${img}` : img,
        text: `${title} ${p.product_type || ''} ${tags} ${colour}`.slice(0, 400),
        details: clean(p.body_html).split(/(?<=\.)\s/)[0]?.slice(0, 140) || '',
      })
    }
    await sleep(900)
  }
  writeJson(path.join(ROOT, 'data/raw/shopify', `${src.domain}.json`), out)
  report.push(`${src.domain}\tseen ${seen}\tkept ${out.length}${error ? `\t${error}` : ''}`)
  console.log(report.at(-1))
}
fs.writeFileSync(path.join(ROOT, 'data/raw/shopify-report.tsv'), report.join('\n') + '\n')
