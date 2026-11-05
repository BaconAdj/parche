import { PostHog } from 'posthog-node'

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

// Server routes are short-lived, so events are sent one at a time and the client is shut down after use.
export function getPostHogServer(): PostHog | null {
  if (!token) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(new Error(
        'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured',
      ))
    }
    return null
  }
  return new PostHog(token, { host, flushAt: 1, flushInterval: 0 })
}

// The browser SDK keeps the visitor's id in a cookie named ph_<token>_posthog.
export function visitorIdFromCookies(cookies: { get(name: string): { value: string } | undefined }): string | null {
  if (!token) return null
  const raw = cookies.get(`ph_${token}_posthog`)?.value
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as { distinct_id?: unknown }
    return typeof parsed.distinct_id === 'string' && parsed.distinct_id ? parsed.distinct_id : null
  } catch {
    return null
  }
}
