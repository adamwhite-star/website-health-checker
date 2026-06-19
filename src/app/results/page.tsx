import { Suspense } from 'react'
import CrawlResults from '@/components/CrawlResults'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Site Audit | Website Health Checker',
}

function ResultsLoader({ url }: { url: string }) {
  return <CrawlResults url={url} />
}

function MissingUrl() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        <p className="text-gray-600 mb-4">No URL provided.</p>
        <a href="/" className="inline-block bg-gradient-to-r from-[#F0146E] to-[#A445B2] text-white rounded-xl px-6 py-3 text-sm font-semibold">
          Start a new audit
        </a>
      </div>
    </div>
  )
}

export default function ResultsPage({
  searchParams,
}: {
  searchParams: { url?: string }
}) {
  const url = searchParams.url
  if (!url) return <MissingUrl />

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#F0146E] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResultsLoader url={url} />
    </Suspense>
  )
}
