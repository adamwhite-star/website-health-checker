'use client'

import { useState } from 'react'
import type { PageAuditResult } from '@/lib/types'
const CHECK_IDS = ['https', 'title', 'meta-description', 'h1', 'viewport', 'canonical', 'schema', 'open-graph', 'word-count', 'image-alt']

const CHECK_SHORT: Record<string, string> = {
  'https': 'HTTPS',
  'title': 'Title',
  'meta-description': 'Meta',
  'h1': 'H1',
  'viewport': 'Viewport',
  'canonical': 'Canonical',
  'schema': 'Schema',
  'open-graph': 'OG',
  'word-count': 'Words',
  'image-alt': 'Alt',
}

const STATUS_DOT: Record<string, string> = {
  pass: 'bg-emerald-400',
  warn: 'bg-amber-400',
  fail: 'bg-red-500',
}

type SortKey = 'url' | 'score' | 'pageType'

function scoreColour(score: number) {
  if (score >= 70) return 'text-emerald-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-600'
}

export default function PageTable({ pages }: { pages: PageAuditResult[] }) {
  const [sort, setSort] = useState<SortKey>('score')
  const [asc, setAsc] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  function toggleSort(key: SortKey) {
    if (sort === key) setAsc(a => !a)
    else { setSort(key); setAsc(true) }
  }

  const sorted = [...pages].sort((a, b) => {
    let cmp = 0
    if (sort === 'score') cmp = a.score - b.score
    else if (sort === 'url') cmp = a.url.localeCompare(b.url)
    else if (sort === 'pageType') cmp = a.pageType.localeCompare(b.pageType)
    return asc ? cmp : -cmp
  })

  function SortBtn({ k, label }: { k: SortKey; label: string }) {
    return (
      <button
        onClick={() => toggleSort(k)}
        className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
      >
        {label}
        <span className="text-gray-300">{sort === k ? (asc ? '↑' : '↓') : '↕'}</span>
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">All pages ({pages.length})</h3>
        <div className="flex gap-4">
          <SortBtn k="url" label="URL" />
          <SortBtn k="pageType" label="Type" />
          <SortBtn k="score" label="Score" />
        </div>
      </div>

      {/* Check legend */}
      <div className="px-4 py-2 border-b border-gray-50 bg-gray-50 hidden md:flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 mr-1">Checks:</span>
        {CHECK_IDS.map(id => (
          <span key={id} className="text-xs text-gray-500">{CHECK_SHORT[id]}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {sorted.map(page => {
          const isOpen = expanded === page.url
          return (
            <div key={page.url}>
              <button
                onClick={() => setExpanded(isOpen ? null : page.url)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                {/* Score */}
                <span className={`text-sm font-bold w-8 flex-shrink-0 ${scoreColour(page.score)}`}>
                  {page.score}
                </span>

                {/* Check dots */}
                <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
                  {CHECK_IDS.map(id => {
                    const check = page.checks.find(c => c.id === id)
                    return (
                      <span
                        key={id}
                        title={`${CHECK_SHORT[id]}: ${check?.status ?? 'n/a'}`}
                        className={`w-2 h-2 rounded-full ${check ? STATUS_DOT[check.status] : 'bg-gray-200'}`}
                      />
                    )
                  })}
                </div>

                {/* URL + type */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{page.url}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{page.pageType}</span>
                  <span className="text-gray-300 text-xs">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Expanded checks */}
              {isOpen && (
                <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                  <div className="mt-3 space-y-2">
                    {page.checks.map(check => (
                      <div
                        key={check.id}
                        className={`rounded-xl border px-4 py-3 text-sm ${
                          check.status === 'pass'
                            ? 'border-emerald-200 bg-emerald-50'
                            : check.status === 'warn'
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[check.status]}`} />
                          <span className="font-semibold text-gray-800">{check.label}</span>
                          <span className="text-gray-500 ml-1">{check.value}</span>
                        </div>
                        <p className="text-gray-600 mt-1.5 ml-4 leading-relaxed">{check.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
