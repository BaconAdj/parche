import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'parche — Dress for where you\'re going',
  description: 'Destination fashion, curated. Enter where you\'re going and we\'ll tell you exactly what to wear.',
  keywords: 'travel fashion, destination style, packing guide, what to wear',
  openGraph: {
    title: 'parche — Dress for where you\'re going',
    description: 'Destination fashion, curated for every trip.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
