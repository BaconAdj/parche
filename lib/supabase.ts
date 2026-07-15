import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a no-op proxy during SSR or when env vars are missing
    // This prevents crashes — actual DB calls only happen client-side in useEffect
    return {
      from: () => ({
        select: () => ({ eq: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }), order: () => Promise.resolve({ data: [] }) }), order: () => Promise.resolve({ data: [] }) }),
        insert: () => Promise.resolve({ error: null }),
        upsert: () => Promise.resolve({ error: null }),
        delete: () => ({ eq: () => ({ eq: () => Promise.resolve({ error: null }), single: () => Promise.resolve({ data: null }) }) }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null } }),
        signOut: () => Promise.resolve({}),
      },
    } as any
  }

  return createBrowserClient(url, key)
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
