'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import posthog from 'posthog-js'
import { ACCOUNTS_ENABLED } from '../lib/flags'

// Transparent over a red hero, solid white once the page scrolls (or always, with solid).
export function SiteNav({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const { isSignedIn, isLoaded, user } = useUser()
  const wasSignedIn = useRef(false)
  // Links analytics to the Clerk account on sign-in, and starts a fresh visitor on sign-out.
  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn && user) {
      posthog.identify(user.id)
      wasSignedIn.current = true
    } else if (wasSignedIn.current) {
      posthog.reset()
      wasSignedIn.current = false
    }
  }, [isLoaded, isSignedIn, user])
  useEffect(() => {
    if (solid) return
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [solid])

  return (
    <nav className={`nav${solid || scrolled ? ' nav--solid' : ''}`} aria-label="Main">
      <Link href="/" className="nav-logo" aria-label="parché home"><span className="wordmark" aria-hidden /></Link>
      <ul className="nav-links">
        <li><Link href="/#edit">The edit</Link></li>
        <li><Link href="/#how">How it works</Link></li>
        <li><Link href="/#places">Destinations</Link></li>
      </ul>
      <div className="nav-right">
        {ACCOUNTS_ENABLED && isLoaded && isSignedIn && <Link href="/dashboard" className="nav-text-btn hide-sm">My trips</Link>}
        {ACCOUNTS_ENABLED && isLoaded && !isSignedIn && (
          <SignInButton mode="modal"><button className="nav-text-btn hide-sm">Sign in</button></SignInButton>
        )}
        {ACCOUNTS_ENABLED && isLoaded && isSignedIn && <UserButton />}
      </div>
    </nav>
  )
}
