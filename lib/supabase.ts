import { createBrowserClient } from '@supabase/ssr'

// Lazy client — only initializes in the browser where env vars are available
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === 'undefined') {
    // Return a dummy during SSR — never actually used since all pages are client-only
    return null as any
  }
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}

export type SavedTrip = {
  id: string
  destination_slug: string
  destination_name: string
  destination_country?: string
  destination_temp?: string
  travel_dates?: string
  photo_url?: string
  created_at: string
}

export type SavedChecklist = {
  id: string
  destination_slug: string
  destination_name: string
  checked_items: Record<string, boolean>
  updated_at: string
}

export type SavedLook = {
  id: string
  destination_slug: string
  destination_name: string
  look_title: string
  look_desc?: string
  photo_url?: string
  created_at: string
}
