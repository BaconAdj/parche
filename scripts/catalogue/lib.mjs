// Shared helpers for the catalogue pipeline. Plain Node 22, no dependencies.
import fs from 'node:fs'
import path from 'node:path'

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
export const KINDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/kinds.json'), 'utf8'))
export const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)

// Classification lives in classify.mjs.
export { classify, excluded, garmentFamily } from './classify.mjs'

export function detectGender(text, hint) {
  const t = ` ${text.toLowerCase()} `
  const w = /\b(women|womens|women's|woman|ladies|female|her)\b/.test(t)
  const m = /\b(men|mens|men's|man|male|his)\b/.test(t)
  if (/\bunisex\b|gender ?neutral|all gender/.test(t) || (w && m)) return 'unisex'
  if (w) return 'women'
  if (m) return 'men'
  return hint || null
}

const COLOURS = ['black', 'white', 'ivory', 'cream', 'ecru', 'navy', 'blue', 'grey', 'gray', 'charcoal', 'beige', 'sand', 'tan', 'camel', 'brown', 'chocolate', 'olive', 'green', 'khaki', 'red', 'burgundy', 'pink', 'purple', 'yellow', 'orange', 'almond', 'stone', 'oat', 'taupe']
export function colours(text) {
  const t = text.toLowerCase()
  const found = COLOURS.filter(c => new RegExp(`\\b${c}\\b`).test(t)).map(c => c === 'gray' ? 'grey' : c === 'ivory' || c === 'ecru' || c === 'oat' ? 'cream' : c === 'tan' || c === 'camel' || c === 'taupe' || c === 'stone' ? 'sand' : c === 'charcoal' ? 'grey' : c === 'chocolate' ? 'brown' : c)
  return [...new Set(found)].slice(0, 3)
}

export function styles(text) {
  const t = text.toLowerCase()
  const out = []
  if (/tailor|blazer|loafer|silk|pleat|oxford|wool|cashmere|leather|satin|trouser|structured|polished|heel|derby/.test(t)) out.push('polished')
  if (/relaxed|linen|wide|oversiz|jogger|drawstring|boxy|easy|lounge|sweat|slouch|tee|short/.test(t)) out.push('relaxed')
  if (/print|stripe|sequin|leopard|floral|paisley|check|plaid|metallic|\bred\b|\bpink\b|\bgreen\b|yellow|orange|graphic/.test(t)) out.push('statement')
  if (/black|white|navy|grey|gray|beige|basic|classic|essential|core|cream|ecru|minimal|plain/.test(t) || out.length === 0) out.push('understated')
  return [...new Set(out)]
}

const kindById = Object.fromEntries(KINDS.kinds.map(k => [k.id, k]))
export function tierFor(kind, price, currency) {
  const k = kindById[kind]
  const cad = price * (KINDS.fx[currency] || 1)
  if (cad <= k.bands[0]) return 'Budget'
  if (cad <= k.bands[1]) return 'Quality'
  return 'High-end'
}

export function climatesFor(kind, text) {
  let c = [...kindById[kind].climates]
  const t = text.toLowerCase()
  if (/linen|seersucker|mesh|airy|lightweight|breathable/.test(t)) c = c.filter(x => x !== 'cold')
  if (/wool|cashmere|down\b|fleece|thermal|insulated|sherpa|shearling|lined|heattech|puffer|flannel|corduroy|alpaca|mohair/.test(t)) c = c.filter(x => x !== 'hot')
  return c.length ? c : [...kindById[kind].climates]
}

export const clean = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’').replace(/\s+/g, ' ').trim()

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 1))
}
