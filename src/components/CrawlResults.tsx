'use client'

import { useEffect, useRef, useState } from 'react'
import type { PageAuditResult, SiteAnalysis, CrawlEvent } from '@/lib/types'
import SiteSummary from './SiteSummary'
import PageTable from './PageTable'
import ThemeToggle from './ThemeToggle'

type Phase =
  | { type: 'discovering' }
  | { type: 'discovered'; total: number }
  | { type: 'auditing'; done: number; total: number }
  | { type: 'done' }
  | { type: 'error'; message: string }

function scoreColor(score: number) {
  if (score >= 70) return 'bg-emerald-400'
  if (score >= 40) return 'bg-amber-400'
  return 'bg-v-pink'
}

export default function CrawlResults({ url }: { url: string }) {
  const [phase, setPhase] = useState<Phase>({ type: 'discovering' })
  const [pages, setPages] = useState<PageAuditResult[]>([])
  const [analysis, setAnalysis] = useState<SiteAnalysis | null>(null)
  const [exporting, setExporting] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDone = useRef(false)
  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')

  useEffect(() => {
    isDone.current = false
    const encoded = encodeURIComponent(url)
    const es = new EventSource(`/api/crawl?url=${encoded}`)

    es.onmessage = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as CrawlEvent

      if (event.type === 'discovering') {
        setPhase({ type: 'discovering' })
      } else if (event.type === 'discovered') {
        setPhase({ type: 'discovered', total: event.total })
        transitionTimer.current = setTimeout(() => {
          setPhase({ type: 'auditing', done: 0, total: event.total })
        }, 400)
      } else if (event.type === 'page') {
        if (transitionTimer.current) { clearTimeout(transitionTimer.current); transitionTimer.current = null }
        setPages(p => [...p, event.result])
        setPhase({ type: 'auditing', done: event.index, total: event.total })
      } else if (event.type === 'analysis') {
        if (transitionTimer.current) { clearTimeout(transitionTimer.current); transitionTimer.current = null }
        isDone.current = true
        setAnalysis(event.analysis)
        setPhase({ type: 'done' })
        es.close()
      } else if (event.type === 'error') {
        isDone.current = true
        setPhase({ type: 'error', message: event.message })
        es.close()
      }
    }

    es.onerror = () => {
      if (!isDone.current) setPhase({ type: 'error', message: 'Connection lost. Please try again.' })
      es.close()
    }

    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current)
      es.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  async function exportCsv() {
    if (!analysis) return
    setExporting('loading')
    try {
      const res = await fetch('/api/export-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages, analysis, siteUrl: url }),
      })
      if (!res.ok) { setExporting('error'); return }
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="([^"]+)"/)
      const filename = match?.[1] ?? 'seo-audit.csv'
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
      setExporting('done')
    } catch {
      setExporting('error')
    }
  }

  if (phase.type === 'error') {
    return (
      <div className="min-h-screen bg-white dark:bg-v-dark flex items-center justify-center p-6">
        <div className="bg-white dark:bg-v-dark2 rounded-2xl border border-gray-200 dark:border-white/10
          shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-v-pink/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-v-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Audit failed</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{phase.message}</p>
          <a href="/" className="inline-block bg-gradient-to-r from-v-pink to-v-purple
            text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
            Try another URL
          </a>
        </div>
      </div>
    )
  }

  const isLoading = phase.type !== 'done'
  const pct = phase.type === 'auditing' ? Math.round((phase.done / phase.total) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-v-dark">

      {/* Nav */}
      <nav className="bg-white/90 dark:bg-v-dark2/90 backdrop-blur border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a href="/" className="font-heading font-bold text-lg bg-gradient-to-r from-v-pink to-v-purple
              bg-clip-text text-transparent flex-shrink-0">
              SiteCheck
            </a>
            <span className="text-gray-200 dark:text-white/20 hidden sm:inline">/</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate hidden sm:inline">
              {displayUrl}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />
            <a href="/"
              className="text-sm font-medium text-gray-500 dark:text-gray-400
                hover:text-gray-800 dark:hover:text-white transition-colors">
              ← New audit
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-8 space-y-5">

        {/* Progress card */}
        {isLoading && (
          <div className="bg-white dark:bg-v-dark2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0 w-10 h-10">
                <svg className="w-10 h-10 animate-spin text-v-pink" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-15" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                {phase.type === 'discovering' && (
                  <>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">Discovering pages…</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                      Checking sitemap and crawling links on {displayUrl}
                    </p>
                  </>
                )}
                {phase.type === 'discovered' && (
                  <>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      Found {phase.total} page{phase.total !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Starting audit…</p>
                  </>
                )}
                {phase.type === 'auditing' && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        Auditing page {phase.done} of {phase.total}
                      </p>
                      <span className="text-xs font-semibold text-gray-400 tabular-nums">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-v-pink to-v-purple rounded-full
                          transition-all duration-300 relative overflow-hidden"
                        style={{ width: `${pct}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Live trickle */}
            {pages.length > 0 && phase.type === 'auditing' && (
              <div className="mt-4 border-t border-gray-100 dark:border-white/5 pt-4
                space-y-1.5 max-h-36 overflow-y-auto">
                {[...pages].reverse().map(p => (
                  <div key={p.url} className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 animate-fade-in">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${scoreColor(p.score)}`} />
                    <span className="truncate flex-1">{p.url}</span>
                    <span className="flex-shrink-0 font-semibold tabular-nums
                      text-gray-700 dark:text-gray-300">{p.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Site summary */}
        {analysis && <SiteSummary analysis={analysis} />}

        {/* Page table */}
        {pages.length > 0 && <PageTable pages={pages} />}

        {/* Export + CTA */}
        {phase.type === 'done' && analysis && (
          <>
            {/* CSV export */}
            <div className="bg-white dark:bg-v-dark2 rounded-2xl border border-gray-200 dark:border-white/10
              shadow-sm p-5 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/10
                  flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">Download as CSV</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">All pages + issues — opens in Excel or Google Sheets</p>
                </div>
              </div>
              <button onClick={exportCsv} disabled={exporting === 'loading'}
                className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60
                  text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors
                  flex items-center gap-2">
                {exporting === 'loading' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path fill="currentColor" className="opacity-80" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Preparing…
                  </>
                ) : exporting === 'done' ? 'Download again' : 'Download CSV'}
              </button>
              {exporting === 'error' && (
                <span className="text-sm text-v-pink flex-shrink-0">Failed — try again</span>
              )}
            </div>

            {/* Versantus CTA */}
            <div className="bg-gradient-to-r from-v-pink to-v-purple rounded-2xl p-8 text-white text-center">
              <h3 className="font-heading font-bold text-xl mb-2">Want us to fix these issues?</h3>
              <p className="text-white/70 mb-6 text-sm max-w-md mx-auto">
                Our team at Versantus can improve your SEO, fix technical issues, and grow your organic traffic.
              </p>
              <a href="https://versantus.co.uk/contact" target="_blank" rel="noopener noreferrer"
                className="inline-block bg-white text-v-pink font-bold px-8 py-3 rounded-xl
                  hover:bg-pink-50 transition-colors shadow-lg shadow-black/10">
                Talk to Versantus →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
