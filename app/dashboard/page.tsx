'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SiteNav } from '../../components/SiteNav'
import { SiteFooter } from '../../components/SiteFooter'
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
    <><SiteNav solid /><main className="dash"><div className="wrap"><p role="status" className="dash-sub">Loading your trips…</p></div></main></>
  )

  const tabs = [
    { id: 'trips', label: 'Trips', count: trips.length },
    { id: 'looks', label: 'Looks', count: looks.length },
    { id: 'checklists', label: 'Packing lists', count: checklists.length },
  ] as const

  return (
    <>
      <SiteNav solid />
      <main className="dash">
        <div className="wrap">
          <header className="dash-head">
            <div>
              <h1 className="r-title">{user?.firstName ? `${user.firstName}’s trips.` : 'Your trips.'}</h1>
              <p className="dash-sub">Signed in as {user?.primaryEmailAddress?.emailAddress}</p>
            </div>
            <div className="r-actions">
              <Link href="/#plan" className="btn btn--rouge">Plan a new trip</Link>
              <button className="btn btn--line" onClick={() => signOut({ redirectUrl: '/' })}>Sign out</button>
            </div>
          </header>

          <div className="seg dash-tabs" role="tablist" aria-label="Saved items">
            {tabs.map(t => (
              <button key={t.id} role="tab" aria-selected={activeTab === t.id} onClick={() => setActiveTab(t.id)}>{t.label} ({t.count})</button>
            ))}
          </div>

          {activeTab === 'trips' && (trips.length === 0
            ? <EmptyState title="No saved trips yet" desc="Open a travel edit and choose Save this trip to keep it here." cta="Plan a trip" />
            : <div className="dash-grid">
                {trips.map(trip => (
                  <article key={trip.id} className="dash-card">
                    <Link href={`/destinations/${trip.destination_slug}`} className="dash-card-link">
                      <div className="dash-card-img">{trip.photo_url ? <img src={trip.photo_url} alt="" /> : <span className="emblem" aria-hidden />}</div>
                      <p className="place-country">{trip.destination_country}</p>
                      <p className="dash-card-name">{trip.destination_name}</p>
                      {trip.travel_dates && <p className="dash-card-meta">{trip.travel_dates}</p>}
                    </Link>
                    <button className="text-btn" onClick={() => removeTrip(trip.id)}>Remove<span className="visually-hidden"> {trip.destination_name}</span></button>
                  </article>
                ))}
              </div>)}

          {activeTab === 'looks' && (looks.length === 0
            ? <EmptyState title="No saved looks yet" desc="Save a look from any travel edit and it will wait for you here." cta="Find a look" />
            : <div className="dash-grid">
                {looks.map(look => (
                  <article key={look.id} className="dash-card">
                    <Link href={`/destinations/${look.destination_slug}`} className="dash-card-link">
                      <div className="dash-card-img">{look.photo_url ? <img src={look.photo_url} alt="" /> : <span className="emblem" aria-hidden />}</div>
                      <p className="place-country">{look.destination_name}</p>
                      <p className="dash-card-name">{look.look_title}</p>
                      {look.look_desc && <p className="dash-card-meta dash-clamp">{look.look_desc}</p>}
                    </Link>
                    <button className="text-btn" onClick={() => removeLook(look.id)}>Remove<span className="visually-hidden"> {look.look_title}</span></button>
                  </article>
                ))}
              </div>)}

          {activeTab === 'checklists' && (checklists.length === 0
            ? <EmptyState title="No packing lists yet" desc="Tick pieces off in any travel edit to track what is already in your bag." cta="Start packing" />
            : <ul className="dash-lists">
                {checklists.map(cl => {
                  const items = Object.keys(cl.checked_items)
                  const done = Object.values(cl.checked_items).filter(Boolean).length
                  const pct = items.length ? Math.round((done / items.length) * 100) : 0
                  return (
                    <li key={cl.id}>
                      <div><p className="dash-card-name">{cl.destination_name}</p><p className="dash-card-meta">{done} of {items.length} packed</p>
                        <div className="dash-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div></div>
                      <Link href={`/destinations/${cl.destination_slug}`} className="link">Continue packing</Link>
                    </li>
                  )
                })}
              </ul>)}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function EmptyState({ title, desc, cta }: { title: string; desc: string; cta: string }) {
  return (
    <div className="dash-empty">
      <p className="dash-card-name">{title}</p>
      <p>{desc}</p>
      <Link href="/#plan" className="btn">{cta}</Link>
    </div>
  )
}
