// Pulls in-stock products from brand stores running Magento, through the store's public GraphQL API.
// Same rules as the Shopify feed: one record keeps the store's own photo, exact product page and listed price,
// and a photo is kept only when its file name carries the product's own style-and-colour code.
// Usage: node scripts/catalogue/ingest-magento.mjs [domain ...]   (default: every "magento" source in sources.json)
//        node scripts/catalogue/ingest-magento.mjs --from <domain> <colours.json> <page.json ...>
// Shan's storefront sits behind a bot challenge that refuses data-centre servers (GitHub Actions gets a 403), so its
// GraphQL pages are captured with Firecrawl and converted here with --from; the result is the seed data/raw/seed/shan.json.
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
  description { html } color meta_description
  categories { name url_path }
  price_range { minimum_price { final_price { value currency } } } }
  page_info { total_pages }`

// "STYLE 52527-45 BLACK / COLLECTION SOFIA" is how Shan writes colour and collection in each description.
const field = (text, label) => text.match(new RegExp(`\\b${label}\\s+(?:[\\d-]+\\s+)?([A-ZÀ-Ý][A-ZÀ-Ý '&/-]+?)\\s*(?:\\n|$|COLLECTION|STYLE|Designed)`))?.[1]?.trim()
const title = s => s.toLowerCase().replace(/(^|[\s/-])\p{L}/gu, c => c.toUpperCase())

// Shan's colour attribute: "110 BEIGE NATURAL / BEIGE NATUREL" → "Beige Natural".
const colourName = label => label ? title(label.split('/')[0].replace(/^\s*\d+\s*/, '').trim()) : ''

// A photo belongs to the record only when it shows this style in this colour. Shan files photos by style and colour code
// (42550-17-800-01-...); carry-over styles reuse the previous season's photo, which differs only in the season digit
// (42760-01-800 shown as 42560-01-800). A style-only file is accepted when no colour code follows.
function photoMatches(sku, file) {
  if (/noecomimage|placeholder|chatgpt|imageweb/i.test(file)) return false
  if (file.includes(sku)) return true
  const [a, b, c] = sku.split('-')
  const m = file.match(/^(\d{5})-(\d{2})(?:-(\d{3}))?/)
  if (!m || !a || !b) return false
  const sameLine = m[1].slice(0, 2) === a.slice(0, 2) && m[1].slice(3) === a.slice(3) && m[2] === b
  return sameLine && (m[3] ? m[3] === (c || '').slice(0, 3) : /^\d{5}-\d{2}(\.|-0\d[.-])/.test(file))
}

function toRecord(p, src, colours) {
  if (!p || p.stock_status !== 'IN_STOCK') return { skip: 'stock' }
  const paths = (p.categories || []).map(c => c.url_path)
  const women = paths.some(u => u === 'women' || u.startsWith('women/'))
  const men = paths.some(u => u === 'men' || u.startsWith('men/') || /men-s-collections/.test(u))
  // New-arrival pages sometimes carry only collection paths; Shan's collections are womenswear unless marked menswear.
  const gender = women && men ? 'unisex' : men ? 'men' : 'women'
  const image = p.image?.url || p.small_image?.url
  if (!image) return { skip: 'photo' }
  const file = image.split('/').pop()
  if (!photoMatches(p.sku, file)) return { skip: 'photo' }
  const raw = p.description?.html?.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '\n') || ''
  const colour = field(raw, 'STYLE') || colourName(colours.get(String(p.color)))
  const collection = field(raw, 'COLLECTION') || ''
  const deepest = (p.categories || []).filter(c => /^(women|men)\//.test(c.url_path) && !/occasion|discover|new|sale|collection/.test(c.url_path))
    .sort((a, b) => b.url_path.split('/').length - a.url_path.split('/').length)[0]
  // "One-piece" under the swim department is a swimsuit, so the department travels with the category name.
  const type = deepest ? `${/swim/.test(deepest.url_path) && !/swim/i.test(deepest.name) ? 'Swim ' : ''}${deepest.name}` : ''
  const name0 = clean(p.name).replace(/\s+/g, ' ').trim()
  if (!name0 || name0 === name0.toUpperCase()) return { skip: 'name' }
  const kind = classify(name0, title(type), src.brand)
  if (!kind) return { skip: 'kind' }
  const price = p.price_range?.minimum_price?.final_price
  if (!(price?.value > 0)) return { skip: 'price' }
  const styled = collection && !name0.toLowerCase().includes(collection.toLowerCase()) ? `${title(collection)} ${name0.charAt(0).toLowerCase()}${name0.slice(1)}` : `${name0.charAt(0).toUpperCase()}${name0.slice(1)}`
  const details = clean(p.meta_description || p.description?.html || '').split(/(?<=\.)\s/)[0]?.slice(0, 140) || ''
  return { record: {
    source: `magento:${src.domain}`, brand: src.brand,
    id: `${slug(src.brand)}-${p.sku}`.slice(0, 90),
    name: colour && !styled.toLowerCase().includes(colour.toLowerCase()) ? `${styled} — ${colour}` : styled,
    title: name0, type: title(type), gender, kind, price: price.value, currency: price.currency || src.currency,
    productUrl: `https://${src.domain}/${p.url_key}.html`,
    imageUrl: image,
    text: `${name0} ${type} ${colour} ${collection}`.slice(0, 400),
    details,
  } }
}

const report = []
if (process.argv[2] === '--from') {
  // Convert captured GraphQL pages (Firecrawl results: {rawHtml: "<graphql json>"} or the GraphQL JSON itself).
  const [, domain, colourFile, ...pages] = process.argv.slice(2)
  const src = sources.find(s => s.domain === domain)
  if (!src) throw new Error(`No magento source for ${domain}`)
  const unwrap = f => { const j = JSON.parse(fs.readFileSync(f, 'utf8')); return j.rawHtml ? JSON.parse(j.rawHtml) : j }
  const colours = new Map(unwrap(colourFile).data.customAttributeMetadata.items[0].attribute_options.map(o => [String(o.value), o.label]))
  const out = new Map(), skipped = {}
  for (const f of pages) for (const p of unwrap(f).data.products.items) {
    if (p && out.has(p.sku)) continue
    const r = toRecord(p, src, colours)
    if (r.record) out.set(p.sku, { ...r.record, checkedAt: new Date().toISOString().slice(0, 10) })
    else skipped[r.skip] = (skipped[r.skip] || 0) + 1
  }
  const file = path.join(ROOT, 'data/raw/seed', `${slug(src.brand)}.json`)
  writeJson(file, [...out.values()].map(r => ({ ...r, source: `seed:${slug(src.brand)}` })))
  console.log(`${domain}: kept ${out.size}`, skipped, '→', path.relative(ROOT, file))
  process.exit(0)
}

for (const src of sources) {
  if (only.size && !only.has(src.domain)) continue
  const out = new Map()
  let seen = 0, error = '', mismatched = 0
  const meta = await gql(src.domain, `{ customAttributeMetadata(attributes: [{ attribute_code: "color", entity_type: "4" }]) { items { attribute_options { value label } } } }`)
  const colours = new Map((meta.data?.customAttributeMetadata?.items?.[0]?.attribute_options || []).map(o => [String(o.value), o.label]))
  for (let page = 1; page <= (src.maxPages || 120); page++) {
    const r = await gql(src.domain, `{ products(search: "", pageSize: 100, currentPage: ${page}) { ${PAGE} } }`)
    if (r.error) { error = r.error; break }
    const { items, page_info } = r.data.products
    seen += items.length
    for (const p of items) {
      if (!p || out.has(p.sku)) continue
      const t = toRecord(p, src, colours)
      if (t.record) out.set(p.sku, t.record)
      else if (t.skip === 'photo') mismatched++
    }
    if (page >= page_info.total_pages) break
    await sleep(700)
  }
  const list = [...out.values()]
  // Never replace a good capture with an empty one when the store refuses the request.
  if (list.length) writeJson(path.join(ROOT, 'data/raw/shopify', `magento-${src.domain}.json`), list)
  report.push(`${src.domain}\tseen ${seen}\tkept ${list.length}\tphoto mismatch ${mismatched}${error ? `\t${error}` : ''}`)
}
fs.appendFileSync(path.join(ROOT, 'data/raw/shopify-report.tsv'), report.map(l => `${l}\n`).join(''))
console.log(report.join('\n'))
