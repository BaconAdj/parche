// Pulls in-stock products from brand stores running Magento, through the store's public GraphQL API.
// Same rules as the Shopify feed: one record keeps the store's own photo, exact product page and listed price,
// and a photo is kept only when its file name carries the product's own style-and-colour code.
// Usage: node scripts/catalogue/ingest-magento.mjs [domain ...]   (default: every "magento" source in sources.json)
import fs from 'node:fs'
import path from 'node:path'
import { ROOT, classify, clean, writeJson, slug } from './lib.mjs'

const sources = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/catalogue/sources.json'), 'utf8')).magento || []
const only = new Set(process.argv.slice(2))
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 parche-catalogue/1.0'
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function gql(domain, query) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      // GET is the cacheable form of a Magento GraphQL read; some storefront firewalls refuse POST from servers.
      const res = await fetch(`https://${domain}/graphql?query=${encodeURIComponent(query.replace(/\s+/g, ' '))}`, {
        headers: { 'user-agent': BROWSER_UA, accept: 'application/json', 'accept-language': 'en-CA,en;q=0.9', store: 'default' },
        signal: AbortSignal.timeout(45000),
      })
      if (res.status === 403 && attempt === 0) console.log(`${domain}: 403`, (await res.text()).slice(0, 200))
      if (res.status === 429 || res.status >= 500) { await sleep(4000 * (attempt + 1)); continue }
      if (!res.ok) return { error: `HTTP ${res.status}` }
      const json = await res.json()
      if (json.errors?.length) return { error: json.errors[0].message }
      return { data: json.data }
    } catch (e) { await sleep(3000); if (attempt === 3) return { error: e.message } }
  }
  return { error: 'rate limited' }
}

const PAGE = `items { sku name url_key stock_status
  image { url } small_image { url }
  description { html }
  categories { name url_path }
  price_range { minimum_price { final_price { value currency } } } }
  page_info { total_pages }`

// "STYLE 52527-45 BLACK / COLLECTION SOFIA" is how Shan writes colour and collection in each description.
const field = (text, label) => text.match(new RegExp(`\\b${label}\\s+(?:[\\d-]+\\s+)?([A-ZÀ-Ý][A-ZÀ-Ý '&/-]+?)\\s*(?:\\n|$|COLLECTION|STYLE|Designed)`))?.[1]?.trim()
const title = s => s.toLowerCase().replace(/(^|[\s/-])\p{L}/gu, c => c.toUpperCase())

const report = []
for (const src of sources) {
  if (only.size && !only.has(src.domain)) continue
  const out = new Map()
  let seen = 0, error = '', mismatched = 0
  for (let page = 1; page <= (src.maxPages || 120); page++) {
    const r = await gql(src.domain, `{ products(search: "", pageSize: 100, currentPage: ${page}) { ${PAGE} } }`)
    if (r.error) { error = r.error; break }
    const { items, page_info } = r.data.products
    seen += items.length
    for (const p of items) {
      if (p.stock_status !== 'IN_STOCK' || out.has(p.sku)) continue
      const paths = p.categories.map(c => c.url_path)
      const women = paths.some(u => u === 'women' || u.startsWith('women/'))
      const men = paths.some(u => u === 'men' || u.startsWith('men/'))
      if (!women && !men) continue
      const gender = women && men ? 'unisex' : women ? 'women' : 'men'
      const image = p.image?.url || p.small_image?.url
      if (!image || /placeholder/.test(image)) continue
      // The photo must be this exact style in this exact colour, never a neighbouring colourway.
      // Shan names photos by style and colour code (42550-17-800-01-...); a style-only file is accepted when nothing follows the style code.
      const file = image.split('/').pop()
      const style = p.sku.split('-').slice(0, 2).join('-')
      if (/noecomimage/.test(file) || !(file.includes(p.sku) || new RegExp(`^${style}(\\.|-0\\d[.-])`).test(file))) { mismatched++; continue }
      const text = clean(p.description?.html || '')
      const raw = p.description?.html?.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '\n') || ''
      const colour = field(raw, 'STYLE')
      const collection = field(raw, 'COLLECTION')
      // The deepest shopping category ("Skirts", "One-piece") tells the classifier what the piece is.
      const deepest = p.categories.filter(c => /^(women|men)\//.test(c.url_path) && !/occasion|discover|new|sale|collection/.test(c.url_path))
        .sort((a, b) => b.url_path.split('/').length - a.url_path.split('/').length)[0]
      // "One-piece" under the swim department is a swimsuit, so the department travels with the category name.
      const type = deepest ? `${/swim/.test(deepest.url_path) && !/swim/i.test(deepest.name) ? 'Swim ' : ''}${deepest.name}` : ''
      const name0 = clean(p.name)
      const kind = classify(name0, title(type), src.brand)
      if (!kind) continue
      const price = p.price_range?.minimum_price?.final_price
      if (!(price?.value > 0)) continue
      const styled = collection && !name0.toLowerCase().includes(collection.toLowerCase()) ? `${title(collection)} ${name0.charAt(0).toLowerCase()}${name0.slice(1)}` : name0
      out.set(p.sku, {
        source: `magento:${src.domain}`, brand: src.brand,
        id: `${slug(src.brand)}-${p.sku}`.slice(0, 90),
        name: colour ? `${styled} — ${title(colour)}` : styled,
        title: name0, type: title(type), gender, kind, price: price.value, currency: price.currency || src.currency,
        productUrl: `https://${src.domain}/${p.url_key}.html`,
        imageUrl: image,
        text: `${name0} ${type} ${colour || ''} ${collection || ''}`.slice(0, 400),
        details: text.split(/(?<=\.)\s/)[0]?.slice(0, 140) || '',
      })
    }
    if (page >= page_info.total_pages) break
    await sleep(700)
  }
  const list = [...out.values()]
  writeJson(path.join(ROOT, 'data/raw/shopify', `magento-${src.domain}.json`), list)
  report.push(`${src.domain}\tseen ${seen}\tkept ${list.length}\tphoto mismatch ${mismatched}${error ? `\t${error}` : ''}`)
}
fs.appendFileSync(path.join(ROOT, 'data/raw/shopify-report.tsv'), report.map(l => `${l}\n`).join(''))
console.log(report.join('\n'))
