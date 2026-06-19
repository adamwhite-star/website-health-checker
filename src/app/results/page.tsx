import { Suspense } from 'react'
import CrawlResults from '@/components/CrawlResults'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Site Audit | Website Health Checker',
}

function MissingUrl() {
  return (
    <div className="min-h-screen bg-white dark:bg-v-dark flex items-center justify-center p-6">
      <div className="bg-white dark:bg-v-dark2 rounded-2xl border border-gray-200 dark:border-white/10
        shadow-sm p-8 max-w-md w-full text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No URL provided.</p>
        <a href="/" className="inline-block bg-gradient-to-r from-v-pink to-v-purple
          text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
          Start a new audit
        </a>
      </div>
    </div>
  )
}

export default function ResultsPage({ searchParams }: { searchParams: { url?: string } }) {
  const url = searchParams.url
  if (!url) return <MissingUrl />

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-v-dark flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-v-pink border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CrawlResults url={url} />
    </Suspense>
  )
}
