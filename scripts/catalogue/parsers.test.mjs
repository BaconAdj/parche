// node --test scripts/catalogue/parsers.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { listingParsers, verifyProductPage, verifyNike } from './parsers.mjs'
import { mergeRecords, pruneRecords } from './seed-store.mjs'

const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`
const group = (offers) => ld({ '@type': 'ProductGroup', name: 'Boot', hasVariant: offers.map(([url, price, av, cur = 'CAD']) => ({ '@type': 'Product', offers: { '@type': 'Offer', url, price, priceCurrency: cur, availability: `https://schema.org/${av}` } })) })
const rec = { brand: 'Columbia', currency: 'CAD', price: 160, productUrl: 'https://www.columbiasportswear.ca/en/p/boot-1594731.html?color=014', imageUrl: 'x' }

test('product check reads only the offers for the record’s own colour', () => {
  const html = group([['https://x/boot.html?color=217&size=10', '96.00', 'InStock'], ['https://x/boot.html?color=014&size=10', '150.00', 'InStock'], ['https://x/boot.html?color=014&size=11', '150.00', 'OutOfStock']])
  assert.deepEqual(verifyProductPage(rec, html, 200), { status: 'ok', price: 150, currency: 'CAD' })
})

test('sold out, gone and unknown are told apart, and only proof changes anything', () => {
  assert.equal(verifyProductPage(rec, group([['https://x/boot.html?color=014&size=10', '150', 'OutOfStock']]), 200).status, 'soldout')
  assert.equal(verifyProductPage(rec, group([['https://x/boot.html?color=217&size=10', '96', 'InStock']]), 200).status, 'gone')
  assert.equal(verifyProductPage(rec, '<html>Access denied</html>', 403).status, 'unknown')
  assert.equal(verifyProductPage(rec, '<html>no data</html>', 200).status, 'unknown')
  assert.equal(verifyProductPage(rec, '', 404).status, 'gone')
})

test('offers without any availability are unknown, not sold out', () => {
  const html = ld({ '@type': 'Product', offers: { '@type': 'Offer', url: 'https://x/boot.html?color=014', price: '150', priceCurrency: 'CAD' } })
  assert.equal(verifyProductPage(rec, html, 200).status, 'unknown')
})

test('a price in another currency than the record is never applied', () => {
  const v = verifyProductPage(rec, group([['https://x/boot.html?color=014&size=10', '130', 'InStock', 'USD']]), 200)
  assert.equal(v.status, 'ok')
  assert.equal(v.price, undefined)
})

test('H&M colours are matched by article number', () => {
  const hm = { brand: 'H&M', currency: 'CAD', price: 34.99, productUrl: 'https://www2.hm.com/en_ca/productpage.1289456022.html', imageUrl: 'x' }
  const html = ld({ '@type': 'ProductGroup', hasVariant: [
    { '@type': 'Product', offers: { '@type': 'Offer', url: 'https://www2.hm.com/en_ca/productpage.1289456001.html', price: 13.99, priceCurrency: 'CAD', availability: 'https://schema.org/InStock' } },
    { '@type': 'Product', offers: { '@type': 'Offer', url: 'https://www2.hm.com/en_ca/productpage.1289456022.html', price: 29.99, priceCurrency: 'CAD', availability: 'https://schema.org/InStock' } }] })
  assert.deepEqual(verifyProductPage(hm, html, 200), { status: 'ok', price: 29.99, currency: 'CAD' })
})

test('Nike provider verdicts', () => {
  const nike = { currency: 'USD', productUrl: 'https://www.nike.com/t/stride-OA8tPWfZ/IF2088-506' }
  assert.deepEqual(verifyNike(nike, { available: true, style_color: 'IF2088-506', price: { current: 63.97, currency: 'USD' } }), { status: 'ok', price: 63.97, currency: 'USD' })
  assert.equal(verifyNike(nike, { available: false, style_color: 'IF2088-506' }).status, 'soldout')
  assert.equal(verifyNike(nike, { available: true, style_color: 'OTHER-1' }).status, 'unknown')
})

test('UNIQLO tiles: department label, price from the link label, photo must carry colour and product code', () => {
  const tile = (colour, img, dept = 'MEN, XS-XXL') => `<a class="x" href="https://www.uniqlo.com/ca/en/products/E486928-000/00?colorDisplayCode=${colour}" aria-label="HEATTECH Tights, CA $ 19.90, Online Exclusive"><img src="https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/486928/item/${img}_3x4.jpg?width=300"><span>${dept}</span></a>`
  const ok = listingParsers.uniqlo(tile('08', 'goods_08_486928'))
  assert.equal(ok.length, 1)
  assert.equal(ok[0].price, 19.9)
  assert.equal(ok[0].gender, 'men')
  assert.equal(listingParsers.uniqlo(tile('08', 'goods_09_486928')).length, 0)
  assert.equal(listingParsers.uniqlo(tile('08', 'goods_08_486928', 'KIDS, 110-160')).length, 0)
})

test('merging a fresh capture refreshes the record, keeps curation fields, clears sold-out, adds new pieces', () => {
  const existing = [{ id: 'a', productUrl: 'https://x/a', imageUrl: 'i', price: 10, gender: 'men', checkedAt: '2026-10-01', details: 'curated', unavailableSince: '2026-10-20' }]
  const fresh = [{ id: 'a2', productUrl: 'https://x/A', imageUrl: 'j', price: 12, gender: 'men' }, { id: 'b', productUrl: 'https://x/b', imageUrl: 'k', price: 5, gender: 'women' }]
  const { records, added, updated } = mergeRecords(existing, fresh, '2026-11-06')
  assert.equal(added, 1); assert.equal(updated, 1)
  assert.deepEqual(records[0], { id: 'a', productUrl: 'https://x/A', imageUrl: 'j', price: 12, gender: 'men', checkedAt: '2026-11-06', details: 'curated' })
  assert.equal(records[1].checkedAt, '2026-11-06')
})

test('housekeeping drops records unconfirmed for 60 days and sold out for 30', () => {
  const kept = pruneRecords([{ checkedAt: '2026-09-01' }, { checkedAt: '2026-10-01', unavailableSince: '2026-10-01' }, { checkedAt: '2026-10-01' }], '2026-11-06')
  assert.deepEqual(kept, [{ checkedAt: '2026-10-01' }])
})

test('PVH tiles (Calvin Klein, Tommy): photo must carry the style and colour code, one price only', () => {
  const attr = p => JSON.stringify({ product: p }).replace(/"/g, '&quot;')
  const tile = (pid, img, prices) => `<div class="product" data-pid="${pid}" data-category="{&quot;product_master_category&quot;:&quot;men:underwear&quot;}" data-product-image-attr="${attr({ url: `/en/men/underwear/trunk/${pid}.html?journey=x`, available: true, images: [{ absURL: img, alt: 'Cotton Trunk, Black' }] })}">${prices.map(v => `<span class="sales"> <span class="value" content="${v}">$${v}</span>`).join('')}</div>`
  const img = 'https://calvinklein.scene7.com/is/image/CalvinKlein/'
  const html = tile('NB1897-001', `${img}NB1897_001_main`, ['42.00']) + tile('NB2000-100', `${img}NB1897_001_main`, ['30.00']) + tile('NB3000-100', `${img}NB3000_100_main`, ['30.00', '20.00'])
  const out = listingParsers.calvinklein(html)
  assert.equal(out.length, 1)
  assert.deepEqual([out[0].name, out[0].price, out[0].gender, out[0].productUrl, out[0].imageUrl], ['Cotton Trunk — Black', 42, 'men', 'https://www.calvinklein.ca/en/men/underwear/trunk/NB1897-001.html?journey=x', `${img}NB1897_001_main`])
})

test('Mango tiles: that colour’s own link and photo, single price, gender from the link', () => {
  const tile = (code, col, imgCol, prices) => `<div data-slot="${code}:${col}"><div aria-label="Images of Wool coat in Black colour"><meta content="https://media.mango.com/is/image/punto/${code}-${imgCol}-002"></div><a href="https://shop.mango.com/ca/en/p/women/coats/coats/wool-coat/${code}/${col}/00">x</a>${prices.map(p => `<span>$ ${p}</span>`).join('')}</div>`
  const out = listingParsers.mango(tile('37017807', '99', '99', ['379.99']) + tile('37017808', '99', '70', ['379.99']) + tile('37017809', '99', '99', ['379.99', '299.99']))
  assert.equal(out.length, 1)
  assert.deepEqual([out[0].id, out[0].name, out[0].gender, out[0].price], ['Mango-37017807-99', 'Wool coat — Black', 'women', 379.99])
})

test('a footwear label’s toque is filed as a beanie, its boots stay boots', async () => {
  const { classify } = await import('./classify.mjs')
  assert.equal(classify('Blundstone Toque - Black', '', 'Blundstone'), 'beanie')
  assert.equal(classify('Blundstone 585 Chelsea Boot - Rustic Brown', '', 'Blundstone'), 'boots')
  assert.equal(classify('Original 500 - Stout Brown', '', 'Blundstone'), 'boots')
})
