import type { Metadata } from 'next'
import { Outfit, Open_Sans } from 'next/font/google'
import Providers from '@/components/Providers'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' })

export const metadata: Metadata = {
  title: 'Free Website Health Checker | SEO Audit Tool',
  description: 'Check any website for SEO issues in seconds. Audit title tags, meta descriptions, H1s, schema markup, canonical tags, and mobile readiness — free, no login required.',
  openGraph: {
    title: 'Free Website Health Checker | SEO Audit Tool',
    description: 'Check any website for SEO issues in seconds. Free, instant, no login required.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${openSans.variable}`} suppressHydrationWarning>
      <body className="font-body min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
