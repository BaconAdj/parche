'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { type SavedTrip, type SavedChecklist, type SavedLook } from '../../lib/supabase'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const { signOut }        = useClerk()
  const router             = useRouter()

  const [trips, setTrips]           = useState<SavedTrip[]>([])
  const [checklists, setChecklists] = useState<SavedChecklist[]>([])
  const [looks, setLooks]           = useState<SavedLook[]>([])
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState<'trips' | 'looks' | 'checklists'>('trips')

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push('/sign-in'); return }
    async function load() {
      const { createClient } = await import('../../lib/supabase')
      const supabase = createClient()
      const userId = user!.id
      const [t, c, l] = await Promise.all([
        supabase.from('saved_trips').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('saved_checklists').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
        supabase.from('saved_looks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ])
      setTrips(t.data || [])
      setChecklists(c.data || [])
      setLooks(l.data || [])
      setLoading(false)
    }
    load()
  }, [isLoaded, user])

  async function removeTrip(id: string) {
    const { createClient } = await import('../../lib/supabase')
    const supabase = createClient()
    await supabase.from('saved_trips').delete().eq('id', id)
    setTrips(t => t.filter(x => x.id !== id))
  }

  async function removeLook(id: string) {
    const { createClient } = await import('../../lib/supabase')
    const supabase = createClient()
    await supabase.from('saved_looks').delete().eq('id', id)
    setLooks(l => l.filter(x => x.id !== id))
  }

  if (!isLoaded || loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-body)' }}>
      <p style={{ color:'var(--mid)', fontSize:'0.85rem' }}>Loading your wardrobe...</p>
    </div>
  )

  return (
    <div className="dash-page">
      <div className="dash-header">
        <a href="/" className="dash-logo">parche</a>
        <div className="dash-user">
          <span className="dash-email">{user?.primaryEmailAddress?.emailAddress}</span>
          <button className="dash-signout" onClick={() => signOut({ redirectUrl: '/' })}>Sign out</button>
        </div>
      </div>

      <div className="dash-inner">
        <div className="dash-hero">
          <h1 className="dash-title">
            {user?.firstName ? `${user.firstName}'s wardrobe.` : 'Your travel wardrobe.'}
          </h1>
          <p className="dash-sub">Saved trips, curated looks, and packing lists — all in one place.</p>
        </div>

        <div className="dash-stats">
          <div className="stat"><span className="stat-n">{trips.length}</span><span className="stat-l">Saved trips</span></div>
          <div className="stat"><span className="stat-n">{looks.length}</span><span className="stat-l">Saved looks</span></div>
          <div className="stat"><span className="stat-n">{checklists.length}</span><span className="stat-l">Packing lists</span></div>
        </div>

        <div className="dash-tabs">
          {(['trips','looks','checklists'] as const).map(t => (
            <button key={t} className={`dash-tab${activeTab===t?' active':''}`} onClick={() => setActiveTab(t)}>
              {t === 'trips' ? '✈️ Trips' : t === 'looks' ? '👗 Looks' : '📋 Checklists'}
            </button>
          ))}
        </div>

        {activeTab === 'trips' && (
          trips.length === 0
            ? <EmptyState icon="✈️" title="No saved trips yet" desc="Browse destinations and save the ones you're planning." cta="Explore destinations" href="/" />
            : <div className="dash-grid">
                {trips.map(trip => (
                  <div key={trip.id} className="dash-card">
                    <div className="dash-card-img">
                      {trip.photo_url ? <img src={trip.photo_url} alt={trip.destination_name} /> : <div className="dash-card-placeholder" />}
                      <button className="dash-remove" onClick={() => removeTrip(trip.id)}>✕</button>
                    </div>
                    <div className="dash-card-body">
                      <p className="dash-card-country">{trip.destination_country}</p>
                      <p className="dash-card-name">{trip.destination_name}</p>
                      {trip.travel_dates && <p className="dash-card-dates">{trip.travel_dates}</p>}
                      {trip.destination_temp && <p className="dash-card-temp">{trip.destination_temp}</p>}
                      <a href={`/destinations/${trip.destination_slug}`} className="dash-card-link">View guide →</a>
                    </div>
                  </div>
                ))}
              </div>
        )}

        {activeTab === 'looks' && (
          looks.length === 0
            ? <EmptyState icon="👗" title="No saved looks yet" desc="Visit a destination guide and save style cards that inspire you." cta="Browse style guides" href="/" />
            : <div className="dash-grid">
                {looks.map(look => (
                  <div key={look.id} className="dash-card">
                    <div className="dash-card-img">
                      {look.photo_url ? <img src={look.photo_url} alt={look.look_title} /> : <div className="dash-card-placeholder" />}
                      <button className="dash-remove" onClick={() => removeLook(look.id)}>✕</button>
                    </div>
                    <div className="dash-card-body">
                      <p className="dash-card-country">{look.destination_name}</p>
                      <p className="dash-card-name">{look.look_title}</p>
                      {look.look_desc && <p className="dash-card-desc">{look.look_desc}</p>}
                      <a href={`/destinations/${look.destination_slug}`} className="dash-card-link">View destination →</a>
                    </div>
                  </div>
                ))}
              </div>
        )}

        {activeTab === 'checklists' && (
          checklists.length === 0
            ? <EmptyState icon="📋" title="No saved checklists yet" desc="Open a destination guide and save your packing progress." cta="Plan a trip" href="/" />
            : <div className="dash-checklist-list">
                {checklists.map(cl => {
                  const items = Object.keys(cl.checked_items)
                  const done  = Object.values(cl.checked_items).filter(Boolean).length
                  const pct   = items.length ? Math.round((done / items.length) * 100) : 0
                  return (
                    <div key={cl.id} className="cl-card">
                      <div className="cl-card-left">
                        <p className="cl-name">{cl.destination_name}</p>
                        <p className="cl-meta">{done} / {items.length} items packed</p>
                        <div className="cl-bar"><div className="cl-fill" style={{ width:`${pct}%` }} /></div>
                      </div>
                      <a href={`/destinations/${cl.destination_slug}`} className="cl-link">Continue packing →</a>
                    </div>
                  )
                })}
              </div>
        )}
      </div>

      <style>{`
        .dash-page { min-height:100vh; background:var(--off); font-family:var(--font-body); }
        .dash-header { background:var(--white); border-bottom:1px solid var(--border); padding:0 3rem; height:72px; display:flex; align-items:center; justify-content:space-between; }
        .dash-logo { font-size:1.85rem; font-weight:300; letter-spacing:-0.04em; color:var(--black); text-decoration:none; }
        .dash-user { display:flex; align-items:center; gap:1.5rem; }
        .dash-email { font-size:0.78rem; color:var(--mid); }
        .dash-signout { background:none; border:1px solid var(--border-s); padding:0.45rem 1rem; border-radius:100px; font-family:var(--font-body); font-size:0.72rem; cursor:pointer; color:var(--char); transition:all 0.2s; }
        .dash-signout:hover { border-color:var(--black); color:var(--black); }
        .dash-inner { max-width:1200px; margin:0 auto; padding:3rem 2rem 6rem; }
        .dash-hero { margin-bottom:2.5rem; }
        .dash-title { font-size:clamp(2rem,4vw,3rem); font-weight:200; letter-spacing:-0.02em; margin-bottom:0.5rem; }
        .dash-sub { font-size:0.85rem; color:var(--mid); }
        .dash-stats { display:flex; gap:1px; background:var(--border); border-radius:14px; overflow:hidden; margin-bottom:2.5rem; }
        .stat { flex:1; background:var(--white); padding:1.5rem; text-align:center; }
        .stat-n { display:block; font-size:2rem; font-weight:200; letter-spacing:-0.02em; color:var(--black); }
        .stat-l { display:block; font-size:0.62rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--light); margin-top:0.2rem; }
        .dash-tabs { display:flex; gap:0.5rem; margin-bottom:2rem; }
        .dash-tab { padding:0.6rem 1.4rem; border-radius:100px; border:1px solid var(--border-s); background:none; font-family:var(--font-body); font-size:0.78rem; cursor:pointer; color:var(--mid); transition:all 0.2s; }
        .dash-tab.active { background:var(--black); color:var(--white); border-color:var(--black); }
        .dash-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
        .dash-card { background:var(--white); border-radius:14px; overflow:hidden; border:1px solid var(--border); }
        .dash-card-img { width:100%; aspect-ratio:3/4; position:relative; overflow:hidden; background:var(--off); }
        .dash-card-img img { width:100%; height:100%; object-fit:cover; }
        .dash-card-placeholder { width:100%; height:100%; background:linear-gradient(175deg,#ece8e0,#d8d2c8); }
        .dash-remove { position:absolute; top:0.6rem; right:0.6rem; width:28px; height:28px; border-radius:50%; background:rgba(10,10,10,0.6); border:none; color:white; font-size:0.65rem; cursor:pointer; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s; }
        .dash-card:hover .dash-remove { opacity:1; }
        .dash-card-body { padding:1rem; }
        .dash-card-country { font-size:0.58rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--light); margin-bottom:0.2rem; }
        .dash-card-name { font-size:1rem; font-weight:500; margin-bottom:0.3rem; letter-spacing:-0.01em; }
        .dash-card-dates { font-size:0.68rem; color:var(--sand-d); margin-bottom:0.2rem; }
        .dash-card-temp { font-size:0.65rem; color:var(--mid); margin-bottom:0.6rem; }
        .dash-card-desc { font-size:0.7rem; color:var(--mid); line-height:1.6; margin-bottom:0.6rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .dash-card-link { font-size:0.68rem; color:var(--sand-d); text-decoration:none; font-weight:500; }
        .dash-checklist-list { display:flex; flex-direction:column; gap:0.75rem; }
        .cl-card { background:var(--white); border:1px solid var(--border); border-radius:14px; padding:1.5rem 2rem; display:flex; align-items:center; justify-content:space-between; gap:2rem; }
        .cl-name { font-size:1rem; font-weight:500; margin-bottom:0.25rem; letter-spacing:-0.01em; }
        .cl-meta { font-size:0.72rem; color:var(--mid); margin-bottom:0.6rem; }
        .cl-bar { width:200px; height:3px; background:var(--mist); border-radius:2px; }
        .cl-fill { height:100%; background:var(--sand); border-radius:2px; }
        .cl-link { font-size:0.75rem; color:var(--black); text-decoration:none; font-weight:500; white-space:nowrap; border-bottom:1px solid var(--border-s); padding-bottom:1px; }
        @media(max-width:1024px) { .dash-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:640px) {
          .dash-header { padding:0 1.25rem; }
          .dash-email { display:none; }
          .dash-inner { padding:2rem 1.25rem 4rem; }
          .dash-grid { grid-template-columns:1fr 1fr; gap:0.75rem; }
          .cl-card { flex-direction:column; align-items:flex-start; }
          .cl-bar { width:100%; }
        }
      `}</style>
    </div>
  )
}

function EmptyState({ icon, title, desc, cta, href }: { icon:string; title:string; desc:string; cta:string; href:string }) {
  return (
    <div style={{ textAlign:'center', padding:'4rem 2rem', background:'var(--white)', borderRadius:16, border:'1px solid var(--border)' }}>
      <p style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>{icon}</p>
      <p style={{ fontSize:'1rem', fontWeight:500, marginBottom:'0.5rem' }}>{title}</p>
      <p style={{ fontSize:'0.78rem', color:'var(--mid)', marginBottom:'1.5rem', maxWidth:300, margin:'0 auto 1.5rem' }}>{desc}</p>
      <a href={href} style={{ background:'var(--black)', color:'var(--white)', padding:'0.65rem 1.5rem', borderRadius:100, fontSize:'0.82rem', fontWeight:500, textDecoration:'none' }}>{cta}</a>
    </div>
  )
}
