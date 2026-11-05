import posthog from 'posthog-js'

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

if (token) {
  try {
    posthog.init(token, {
      api_host: host,
      defaults: '2026-05-30',
      // Cookie persistence lets the /go route attach shop clicks to the same visitor.
      persistence: 'localStorage+cookie',
      capture_exceptions: true,
    })
    // One PostHog project holds several apps; this tells their events apart.
    posthog.register({ app: 'parche' })
  } catch {
    // Analytics must never stop the site from loading.
  }
} else if (process.env.NODE_ENV !== 'production') {
  console.error(new Error(
    'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured',
  ))
}
