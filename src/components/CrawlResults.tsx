'use client'

import { useEffect, useRef, useState } from 'react'
import type { PageAuditResult, SiteAnalysis, CrawlEvent } from '@/lib/types'
import SiteSummary from './SiteSummary'
import PageTable from './PageTable'

type Phase =
  | { type: 'discovering' }
  | { type: 'discovered'; total: number }
  | { type: 'auditing'; done: number; total: number }
  | { type: 'done' }
  | { type: 'error'; message: string }

export default function CrawlResults({ url }: { url: string }) {
  const [phase, setPhase] = useState<Phase>({ type: 'discovering' })
  const [pages, setPages] = useState<PageAuditResult[]>([])
  const [analysis, setAnalysis] = useState<SiteAnalysis | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller

    const encoded = encodeURIComponent(url)
    const es = new EventSource(`/api/crawl?url=${encoded}`)

    es.onmessage = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as CrawlEvent

      if (event.type === 'discovering') {
        setPhase({ type: 'discovering' })
      } else if (event.type === 'discovered') {
        setPhase({ type: 'discovered', total: event.total })
        setTimeout(() => setPhase({ type: 'auditing', done: 0, total: event.total }), 400)
      } else if (event.type === 'page') {
        setPages(p => [...p, event.result])
        setPhase({ type: 'auditing', done: event.index, total: event.total })
      } else if (event.type === 'analysis') {
        setAnalysis(event.analysis)
        setPhase({ type: 'done' })
        es.close()
      } else if (event.type === 'error') {
        setPhase({ type: 'error', message: event.message })
        es.close()
      }
    }

    es.onerror = () => {
      if (phase.type !== 'done') {
        setPhase({ type: 'error', message: 'Connection lost. Please try again.' })
      }
      es.close()
    }

    return () => {
      es.close()
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  if (phase.type === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Audit failed</h2>
          <p className="text-gray-500 text-sm mb-6">{phase.message}</p>
          <a href="/" className="inline-block bg-gradient-to-r from-[#F0146E] to-[#A445B2] text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
            Try another URL
          </a>
        </div>
      </div>
    )
  }

  const isLoading = phase.type !== 'done'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a href="/" className="text-lg font-bold bg-gradient-to-r from-[#F0146E] to-[#A445B2] bg-clip-text text-transparent flex-shrink-0">
              SiteCheck
            </a>
            <span className="text-gray-300 hidden sm:inline">/</span>
            <span className="text-sm text-gray-600 truncate hidden sm:inline">{displayUrl}</span>
          </div>
          <a
            href="/"
            className="flex-shrink-0 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← New audit
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Progress banner */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <svg className="w-10 h-10 animate-spin text-[#F0146E]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                {phase.type === 'discovering' && (
                  <>
                    <p className="font-semibold text-gray-800">Discovering pages…</p>
                    <p className="text-sm text-gray-500">Checking sitemap and following links on {displayUrl}</p>
                  </>
                )}
                {phase.type === 'discovered' && (
                  <>
                    <p className="font-semibold text-gray-800">Found {phase.total} page{phase.total !== 1 ? 's' : ''}</p>
                    <p className="text-sm text-gray-500">Starting audit…</p>
                  </>
                )}
                {phase.type === 'auditing' && (
                  <>
                    <p className="font-semibold text-gray-800">
                      Auditing page {phase.done} of {phase.total}
                    </p>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#F0146E] to-[#A445B2] rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((phase.done / phase.total) * 100)}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Live pages trickle in */}
            {pages.length > 0 && phase.type === 'auditing' && (
              <div className="mt-4 border-t border-gray-50 pt-4 space-y-1 max-h-40 overflow-y-auto">
                {[...pages].reverse().map(p => (
                  <div key={p.url} className="flex items-center gap-2 text-xs text-gray-500 animate-fade-in">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.score >= 70 ? 'bg-emerald-400' : p.score >= 40 ? 'bg-amber-400' : 'bg-red-500'}`} />
                    <span className="truncate">{p.url}</span>
                    <span className="flex-shrink-0 font-semibold text-gray-700">{p.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Site summary — show once analysis ready */}
        {analysis && <SiteSummary analysis={analysis} />}

        {/* Page table — show as soon as we have pages */}
        {pages.length > 0 && <PageTable pages={pages} />}

        {/* CTA */}
        {phase.type === 'done' && (
          <div className="bg-gradient-to-r from-[#F0146E] to-[#A445B2] rounded-2xl p-8 text-white text-center">
            <h3 className="text-xl font-bold mb-2">Want us to fix these issues?</h3>
            <p className="text-white/80 mb-6 text-sm max-w-md mx-auto">
              Our team at Versantus can improve your SEO, fix technical issues, and grow your organic traffic.
            </p>
            <a
              href="https://versantus.co.uk/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-[#F0146E] font-bold px-8 py-3 rounded-xl hover:bg-pink-50 transition-colors"
            >
              Talk to Versantus →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
