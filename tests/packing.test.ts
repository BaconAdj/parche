import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPackingPlan } from '../lib/packing'
import { catalogue, productsForNeed } from '../lib/product-catalogue'
import { unavailableWeather, type TripWeather } from '../lib/weather'
import type { Trip } from '../lib/trip'
const trip: Trip = {destination:'Lisbon, Portugal',start:'2027-01-05',end:'2027-01-10',activity:'',style:''}
const wx = (low:number,high:number,rainDays=0): TripWeather => ({...unavailableWeather('Reference city'),kind:'seasonal',low,high,rainDays})

test('cold city and hot coastal trips produce different wardrobes and matching products',()=>{
 const cold=buildPackingPlan({...trip,destination:'Tokyo, Japan'},wx(2,9))
 const hot=buildPackingPlan({...trip,destination:'Bali, Indonesia'},wx(25,31,60))
 assert.ok(cold.needs.some(n=>n.id==='warm-knit'))
 assert.ok(!cold.needs.some(n=>n.id==='swim'))
 assert.ok(hot.needs.some(n=>n.id==='swim'))
 assert.ok(hot.needs.some(n=>n.id==='rain-shell'))
 assert.ok(!hot.needs.some(n=>n.id==='warm-knit'))
 for(const gender of ['women','men'] as const){
  assert.ok(productsForNeed(catalogue,'warm-knit',gender,cold,'').length)
  assert.ok(productsForNeed(catalogue,'linen-shirt',gender,hot,'').length)
  assert.ok(productsForNeed(catalogue,'swim',gender,hot,'').length)
  assert.equal(productsForNeed(catalogue,'warm-knit',gender,hot,'').length,0)
 }
})
test('location affects itinerary needs even at the same temperature',()=>{
 const city=buildPackingPlan(trip,wx(20,28))
 const beach=buildPackingPlan({...trip,destination:'Tulum, Mexico'},wx(20,28))
 assert.ok(!city.needs.some(n=>n.id==='swim'))
 assert.ok(beach.needs.some(n=>n.id==='swim'))
 const coverage=buildPackingPlan({...trip,destination:'Marrakech, Morocco'},wx(20,28))
 assert.ok(coverage.needs.some(n=>n.id==='light-scarf'))
})
test('active trips add technical needs and never substitute cotton tees or shoulder bags',()=>{
 const plan=buildPackingPlan({...trip,activity:'active'},wx(12,22))
 assert.ok(plan.needs.some(n=>n.id==='active-top'))
 assert.ok(plan.needs.some(n=>n.id==='daypack'))
 for(const [kind,gender] of [['active-top','women'],['daypack','men']] as const){
  const picks=productsForNeed(catalogue,kind,gender,plan,'')
  assert.ok(picks.length)
  assert.ok(picks.every(p=>p.kinds.includes(kind)&&!p.kinds.includes('tee')&&!p.kinds.includes('bag')))
 }
})
test('outbound links prefer affiliate URLs and otherwise tag the exact product page',async()=>{
 const { outboundUrl } = await import('../lib/product-catalogue')
 const base=catalogue[0]
 assert.ok(outboundUrl(base).startsWith(base.productUrl.split('?')[0]))
 assert.match(outboundUrl(base),/utm_source=parche/)
 assert.equal(outboundUrl({...base,affiliateUrl:'https://aff.example/track?id=1'}),'https://aff.example/track?id=1')
})
test('every product pairs an https product page with its own https image',()=>{
 const ids=new Set<string>()
 for(const p of catalogue){
  assert.ok(!ids.has(p.id)); ids.add(p.id)
  assert.match(p.productUrl,/^https:\/\//); assert.match(p.imageUrl,/^https:\/\//)
  assert.ok(p.kinds.length&&p.climates.length&&p.price>0)
 }
})
test('trip duration sets quantities with a weekly laundry cap',()=>{
 const short=buildPackingPlan({...trip,end:trip.start},wx(15,22))
 const long=buildPackingPlan({...trip,end:'2027-02-10'},wx(15,22))
 assert.equal(short.days,1);assert.equal(long.days,37)
 assert.equal(short.needs.find(n=>n.id==='underwear')?.quantity,1)
 assert.equal(long.needs.find(n=>n.id==='underwear')?.quantity,7)
 assert.match(long.note,/laundry/)
 assert.equal(new Set(long.needs.map(n=>n.id)).size,long.needs.length)
})
test('style and destination palette change ranked accessory options without changing category',()=>{
 const base={...trip,destination:'Bali, Indonesia'}
 const quiet=buildPackingPlan({...base,style:'understated'},wx(24,29))
 const bold=buildPackingPlan({...base,style:'statement'},wx(24,29))
 const a=productsForNeed(catalogue,'sun-hat','women',quiet,'understated')
 const b=productsForNeed(catalogue,'sun-hat','women',bold,'statement')
 assert.notEqual(a[0].id,b[0].id)
 assert.ok([...a,...b].every(p=>p.kinds.includes('sun-hat')))
})
test('unavailable weather does not invent cold-weather or rain requirements',()=>{
 const plan=buildPackingPlan({...trip,destination:'Unknown place'},unavailableWeather('Unknown place'))
 assert.equal(plan.climate,'unknown')
 assert.ok(!plan.needs.some(n=>['warm-knit','coat','rain-shell','swim'].includes(n.id)))
 assert.ok(plan.needs.some(n=>n.id==='knit'))
})
