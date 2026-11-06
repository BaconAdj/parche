// Deterministic retailer parsers shared by seed-parsers.mjs (manual captures) and sweep.mjs (daily automated sweep).
// No AI extraction: every field comes from the retailer's own page data, and a photo is only kept when it
// carries the product's own code (or comes from the retailer's structured product data), so it can never
// belong to a neighbouring tile.
import { classify, detectGender } from './lib.mjs'

function* walk(o) { if (Array.isArray(o)) { yield o; for (const v of o) yield* walk(v) } else if (o && typeof o === 'object') { yield o; for (const v of Object.values(o)) yield* walk(v) } }
const decode = s => String(s || '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
const nextData = html => { const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/); try { return m ? JSON.parse(m[1]) : null } catch { return null } }
const ldBlocks = html => [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m => { try { return [JSON.parse(m[1])] } catch { return [] } })
const KIDS = /\b(kids?|youth|infant|toddler|baby|boys?|girls?|little kids'?|big kids'?)\b/i

// Each listing parser takes a page's raw HTML and returns seed records (without checkedAt).
export const listingParsers = {
  hm(html) {
    const data = nextData(html)
    if (!data) return []
    const out = []
    for (const list of walk(data)) {
      if (!Array.isArray(list) || !list.length || !list[0] || typeof list[0] !== 'object' || !('pdpUrl' in list[0]) || !('articleCode' in list[0])) continue
      for (const p of list) {
        const img = p.imageProductSrc || p.imageModelSrc
        const price = p.prices?.find(x => x.priceType === 'redPrice')?.price ?? p.prices?.[0]?.price
        if (!img || !(price > 0) || !p.pdpUrl) continue
        const cat = String(p.category || '').replace(/_/g, ' ')
        if (/^kids|^baby/.test(p.category || '')) continue
        const gender = /^men/.test(p.category || '') ? 'men' : /^ladies|^women|^divided/.test(p.category || '') ? 'women' : detectGender(cat, 'unisex')
        const colour = p.productColor?.colorName || ''
        out.push({ source: 'seed-page:hm', brand: 'H&M', id: `hm-${p.articleCode}`, name: colour ? `${p.title} — ${colour}` : p.title,
          title: p.title, type: cat, gender, kind: classify(p.title, cat, 'H&M'), price, currency: 'CAD',
          productUrl: p.pdpUrl.startsWith('http') ? p.pdpUrl : `https://www2.hm.com${p.pdpUrl}`, imageUrl: img.replace(/\?.*$/, '') + '?imwidth=1260', text: `${p.title} ${cat} ${colour}` })
      }
    }
    return out
  },

  // The tile link's aria-label carries name and price; the department label sits in the tile; the photo is the one
  // whose filename carries both the colour code and the product code.
  uniqlo(html) {
    const out = []
    for (const seg of html.split(/<a (?=[^>]*aria-label="[^"]*CA \$)/).slice(1)) {
      const a = seg.match(/^[^>]*?href="(https:\/\/www\.uniqlo\.com\/ca\/en\/products\/(E(\d{6})-\d{3})\/(\d{2})\?colorDisplayCode=(\d{2}))"[^>]*aria-label="([^"]+)"/)
      if (!a) continue
      const [, url, style, code, sub, colour, label] = a
      const lm = label.match(/^(.*?), CA \$ ([\d.,]+)(?:,|$)/)
      if (!lm) continue
      const dept = (seg.replace(/<[^>]*>/g, '~').match(/~\s*((?:WOMEN|MEN|UNISEX|KIDS|BABY|GIRLS|BOYS)[^~]*)~/) || [])[1]
      if (!dept || KIDS.test(dept)) continue
      const img = (seg.match(new RegExp(`src="(https://image\\.uniqlo\\.com/[^"]*?goods_${colour}_${code}_3x4\\.jpg)[^"]*"`)) || [])[1]
      if (!img) continue
      const name = decode(lm[1])
      out.push({ source: 'seed:uniqlo', brand: 'UNIQLO', id: `UNIQLO-${style}-${sub}`, name, title: name, type: '', gender: detectGender(dept, 'unisex'),
        price: +lm[2].replace(/,/g, ''), currency: 'CAD', productUrl: url, imageUrl: `${img}?width=600`, text: `${name} ${dept}` })
    }
    return out
  },

  // window.zara.viewPayload product components; the photo is the colour's own media, whose path carries the product code.
  zara(html) {
    const s = html.indexOf('window.zara.viewPayload = ')
    if (s < 0) return []
    let payload
    try { payload = JSON.parse(html.slice(s + 26, html.indexOf(';</script>', s))) } catch { return [] }
    const section = (JSON.stringify(payload).match(/"section":"(MAN|WOMAN)"/) || [])[1]
    const out = []
    for (const o of walk(payload)) {
      if (o.type !== 'Product' || !o.seo?.keyword || !o.seo?.seoProductId || !o.detail?.colors?.length) continue
      const c = o.detail.colors[0]
      const code = String(o.seo.seoProductId).padStart(8, '0')
      const xs = (c.xmedia || []).filter(x => x.url && x.type === 'image' && x.path?.includes(code))
      const media = xs.find(x => /-p$/.test(x.name)) || xs.find(x => x.kind === 'plain') || xs[0]
      const img = media?.url ? media.url.replace('{width}', '1024') : null
      const price = (c.price ?? o.price) / 100
      if (!img || !img.includes(code) || !(price > 0)) continue
      const name = o.name.charAt(0) + o.name.slice(1).toLowerCase()
      const sec = o.sectionName || section || ''
      out.push({ source: 'seed:zara', brand: 'ZARA', id: `zara-${code}`, name: c.name ? `${name} — ${c.name}` : name, title: name, type: o.familyName || o.subfamilyName || '',
        gender: sec === 'WOMAN' ? 'women' : sec === 'MAN' ? 'men' : 'unisex', price, currency: 'CAD',
        productUrl: `https://www.zara.com/ca/en/${o.seo.keyword}-p${code}.html`, imageUrl: img, text: `${name} ${o.familyName || ''} ${c.name || ''}` })
    }
    return out
  },

  // schema.org ItemList; the colour comes from the hero image filename (<style><colour>-HERO) and that exact ?color= link must be on the page.
  tnf(html) {
    const out = []
    for (const d of ldBlocks(html)) for (const p of walk(d)) {
      if (p['@type'] !== 'Product' || !p.url || !p.offers) continue
      const path = new URL(p.url).pathname
      const style = (path.match(/-(NF0A[A-Z0-9]+)$/) || [])[1]
      if (!style) continue
      const re = new RegExp(`/(${style})([A-Z0-9]{3})-HERO/`)
      const img = (Array.isArray(p.image) ? p.image : [p.image]).map(x => typeof x === 'string' ? x : x?.url).find(u => u && re.test(u))
      if (!img) continue
      const colour = img.match(re)[2]
      if (!html.includes(`${path}?color=${colour}`)) continue
      const price = +(p.offers.price ?? p.offers.lowPrice)
      if (!(price > 0) || p.offers.priceCurrency !== 'CAD') continue
      const name = decode(p.name).replace(/[™®]/g, '').replace(/’/g, "'")
      if (KIDS.test(`${name} ${p.category || ''}`)) continue
      out.push({ source: 'seed:the north face', brand: 'The North Face', id: `tnf-${style}-${colour}`, name, title: name, type: p.category || '',
        gender: detectGender(`${name} ${p.category || ''}`, 'unisex'), price, currency: 'CAD', productUrl: `${p.url}?color=${colour}`, imageUrl: img, text: `${name} ${p.category || ''}` })
    }
    return out
  },

  // Single listed price only (price ranges mean the colour's own price is ambiguous); photo must carry style number and colour code.
  columbia(html) {
    const out = []
    for (const s0 of html.split(/(?=<a class="chakra-link product[^"]*" data-masterpid="\d+" data-testid="product-tile")/).slice(1)) {
      const s = s0.slice(0, 20000)
      const a = s.match(/^<a [^>]*aria-label="View ([^"]+)" href="(https:\/\/www\.columbiasportswear\.ca\/en\/p\/[a-z0-9-]+-(\d{7})\.html\?color=(\w+))"/)
      if (!a) continue
      const [, rawName, url, pid, colour] = a
      const img = (s.match(new RegExp(`src="(https://media\\.columbia\\.com/i/columbia/${pid}_${colour}_f_[a-z]+)\\?`)) || [])[1]
      const text = s.replace(/<[^>]+>/g, '~').split('~').map(x => x.trim()).filter(Boolean)
      const prices = [...new Set(text.filter(x => /^\$ [\d,.]+ CAD$/.test(x)))]
      if (!img || prices.length !== 1 || text.some(x => /^- \$/.test(x))) continue
      const name = decode(rawName)
      if (KIDS.test(name)) continue
      out.push({ source: 'seed:columbia', brand: 'Columbia', id: `Columbia-p-${url.split('/p/')[1].split('?')[0]}-${colour}`, name, title: name, type: '', gender: detectGender(name, 'unisex'),
        price: +prices[0].replace(/[^\d.]/g, ''), currency: 'CAD', productUrl: url, imageUrl: `${img}?w=600&fmt=auto`, text: name })
    }
    return out
  },

  // Product card: the link's code must appear in the card's primary photo; single listed price only.
  adidas(html) {
    const out = []
    for (const s0 of html.split(/(?=<a href="https:\/\/www\.adidas\.com\/us\/[^"]+" target="_self" rel=" " data-testid="product-card-image-link")/).slice(1)) {
      const s = s0.slice(0, 8000)
      const a = s.match(/^<a href="(https:\/\/www\.adidas\.com\/us\/[a-z0-9-]+\/([A-Z0-9]{6})\.html)"/)
      if (!a) continue
      const [, url, code] = a
      const img = (s.match(/data-testid="product-card-primary-image"[^>]*src="([^"]+)"/) || [])[1]
      const pc = (s.match(/data-testid="price-component"([\s\S]*?)<\/div><\/div>/) || [])[1] || ''
      const prices = [...pc.matchAll(/\$([\d,.]+)/g)].map(m => m[1])
      const title = (s.match(/data-testid="product-card-title"[^>]*>([^<]+)</) || [])[1]
      const sub = decode((s.match(/data-testid="product-card-subtitle"[^>]*>([^<]+)</) || [])[1] || '')
      if (!img || !img.includes(`_${code}_`) || prices.length !== 1 || !title || !s.includes(`href="${url}" data-testid="product-card-description-link"`)) continue
      if (KIDS.test(`${title} ${sub}`)) continue
      const name = decode(title)
      const colour = (img.match(new RegExp(`_([A-Z][a-z]+)_${code}_`)) || [])[1] || ''
      out.push({ source: 'seed:adidas', brand: 'adidas', id: `adidas-${code}`, name: colour ? `${name} — ${colour}` : name, title: `${name} ${sub}`.trim(), type: sub,
        gender: detectGender(sub, 'unisex'), price: +prices[0].replace(/,/g, ''), currency: 'USD', productUrl: url, imageUrl: img, text: `${name} ${sub}` })
    }
    return out
  },
}

const NIKE_SKIP = /basketball|skate|football|soccer|cleat|golf|spike|weightlift|boxing|wrestling/i
// One Nike record, from a row of the Nike search provider's data (or the manual TSV format).
export function nikeRecord({ url, title, subtitle = '', color = '', price, img }) {
  if (!url || !img || !(+price > 0)) return null
  const text = `${title} ${subtitle}`
  if (NIKE_SKIP.test(text) || KIDS.test(subtitle)) return null
  return { source: 'seed-api:nike', brand: 'Nike', id: `nike-${url.split('/').pop()}`, name: `${title} ${subtitle.replace(/^(Men's|Women's)\s*/i, '')} — ${color}`.replace(/\s+/g, ' '),
    title: text, type: '', gender: detectGender(subtitle, 'unisex'), kind: classify(text, '', 'Nike'), price: +price, currency: 'USD',
    productUrl: url.startsWith('http') ? url : `https://www.nike.com/t/${url}`,
    imageUrl: img.startsWith('http') ? img.replace('/t_default/', '/t_web_pdp_936_v2/') : `https://static.nike.com/a/images/t_web_pdp_936_v2/${img}`, text }
}
// Records from the Nike search provider (data.groups[].variants[]); at most three colours per style.
export function nikeFromSearch(data) {
  const out = [], perStyle = new Map()
  for (const g of data?.groups || []) for (const v of g.variants || []) {
    if (!/\/t\//.test(v.url || '')) continue
    const key = `${v.title}|${v.subtitle}`
    if ((perStyle.get(key) || 0) >= 3) continue
    const r = nikeRecord({ url: v.url, title: v.title, subtitle: v.subtitle, color: v.color, price: v.price?.current, img: v.images?.square })
    if (r) { out.push(r); perStyle.set(key, (perStyle.get(key) || 0) + 1) }
  }
  return out
}

// Which listing parser and product verifier a seed record belongs to.
export const brandMode = brand => ({ 'H&M': 'hm', UNIQLO: 'uniqlo', ZARA: 'zara', 'The North Face': 'tnf', Columbia: 'columbia', adidas: 'adidas', Nike: 'nike' })[brand] || 'generic'

// Which offers on a product page belong to this record's exact colour.
function variantMatcher(record) {
  const u = new URL(record.productUrl)
  const hm = u.pathname.match(/productpage\.(\d+)\.html/)
  if (hm) return o => (o.url || '').includes(`productpage.${hm[1]}.html`)
  if (record.brand === 'ZARA') {
    const colour = (record.imageUrl.match(/\/\d{8}(\d{3})-/) || [])[1]
    return colour ? (o, node) => String(node?.sku || o.sku || '').split('-')[1] === colour : () => true
  }
  for (const k of ['color', 'colorDisplayCode', 'pelement', 'variant']) {
    const v = u.searchParams.get(k)
    if (v) return o => new RegExp(`[?&]${k}=${v}(?:&|$)`).test(o.url || '') || String(o.sku || '').includes(v)
  }
  return () => true
}

const AVAILABLE = /InStock|LimitedAvailability|PreOrder|BackOrder|OnlineOnly|InStoreOnly/i
// Reads a product page's own schema.org data and decides whether this exact record is still sold, and at what price.
// Returns { status: 'ok' | 'soldout' | 'gone' | 'unknown', price?, currency?, note? }.
// 'unknown' means the page could not prove anything either way (blocked, no structured data): never act on it.
export function verifyProductPage(record, html, statusCode) {
  if (statusCode === 404 || statusCode === 410) return { status: 'gone', note: `HTTP ${statusCode}` }
  if (!html || (statusCode && statusCode >= 400)) return { status: 'unknown', note: `HTTP ${statusCode || 'none'}` }
  const offers = []
  for (const d of ldBlocks(html)) for (const node of walk(d)) {
    if (!node || Array.isArray(node) || !/^(Product|ProductGroup)$/.test(node['@type'])) continue
    for (const o of [node.offers].flat().filter(Boolean)) {
      if (o['@type'] === 'AggregateOffer') offers.push({ ...o, price: o.lowPrice ?? o.price, node })
      else if (o['@type'] === 'Offer' || o.price !== undefined) offers.push({ ...o, node })
    }
  }
  if (!offers.length) return { status: 'unknown', note: 'no structured offers' }
  const match = variantMatcher(record)
  const mine = offers.filter(o => match(o, o.node))
  if (!mine.length) return { status: 'gone', note: 'colour no longer offered' }
  const live = mine.filter(o => AVAILABLE.test(String(o.availability || '')))
  if (!live.length) return { status: 'soldout' }
  const prices = live.map(o => +o.price).filter(n => n > 0)
  const currency = live[0].priceCurrency
  // Some retailers mislabel the currency in their structured data; only trust a price in the record's own currency.
  if (!prices.length || currency !== record.currency) return { status: 'ok', note: currency !== record.currency ? `page says ${currency}` : 'no price' }
  return { status: 'ok', price: Math.min(...prices), currency }
}

// Nike product provider data → same verdict shape.
export function verifyNike(record, data) {
  if (!data) return { status: 'unknown', note: 'no data' }
  if (data.style_color && !record.productUrl.endsWith(data.style_color)) return { status: 'unknown', note: 'different style' }
  if (!data.available) return { status: 'soldout' }
  const price = +data.price?.current
  return price > 0 && data.price.currency === record.currency ? { status: 'ok', price, currency: data.price.currency } : { status: 'ok', note: 'no price' }
}
