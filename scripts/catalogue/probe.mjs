// Probe which brand stores expose a public Shopify product feed from this runner.
const domains = process.argv.slice(2)
for (const d of domains) {
  try {
    const r = await fetch(`https://${d}/products.json?limit=250&page=1`, { headers: { 'user-agent': 'Mozilla/5.0 (parche catalogue bot; +https://parche.vercel.app)', accept: 'application/json' }, redirect: 'follow', signal: AbortSignal.timeout(20000) })
    const t = await r.text()
    let n = '-'
    try { n = JSON.parse(t).products.length } catch {}
    console.log(`${d}\t${r.status}\t${r.url}\t${n}`)
  } catch (e) { console.log(`${d}\tERR\t${e.message}`) }
}
