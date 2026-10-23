import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { SmoothScroll } from '../components/SmoothScroll'
import '@fontsource/young-serif/400.css'
import '@fontsource-variable/schibsted-grotesk/wght.css'
import './globals.css'

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "parché — Dress for where you're going", template: '%s · parché' },
  description: "Tell parché where and when you're travelling. See what to wear there, and shop the exact pieces you're missing.",
  keywords: ['travel fashion', 'what to wear', 'packing list', 'destination style', 'travel outfits'],
  openGraph: {
    title: "parché — Dress for where you're going",
    description: 'What to wear in any city, with every piece linked to the shop that sells it.',
    type: 'website',
    siteName: 'parché',
  },
  twitter: { card: 'summary_large_image', title: "parché — Dress for where you're going" },
}

export const viewport: Viewport = { themeColor: '#EE3A27' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body suppressHydrationWarning>
          <SmoothScroll />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
