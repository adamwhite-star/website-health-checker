'use client'

import { useState } from 'react'
import type { PageAuditResult } from '@/lib/types'

const CHECK_IDS = ['https', 'title', 'meta-description', 'h1', 'viewport', 'canonical', 'schema', 'open-graph', 'word-count', 'image-alt']
const CHECK_SHORT: Record<string, string> = {
  'https': 'HTTPS', 'title': 'Title', 'meta-description': 'Meta', 'h1': 'H1',
  'viewport': 'Viewport', 'canonical': 'Canonical', 'schema': 'Schema',
  'open-graph': 'OG', 'word-count': 'Words', 'image-alt': 'Alt',
}

const STATUS_DOT: Record<string, string> = {
  pass: 'bg-emerald-400',
  warn: 'bg-amber-400',
  fail: 'bg-v-pink',
}

const STATUS_CHIP: Record<string, string> = {
  pass: 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5',
  warn: 'border-amber-200 dark:border-amber-400/20 bg-amber-50 dark:bg-amber-400/5',
  fail: 'border-v-pink/25 dark:border-v-pink/20 bg-rose-50 dark:bg-v-pink/5',
}

type SortKey = 'url' | 'score' | 'pageType'

function scoreColor(score: number) {
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 40) return 'text-amber-600 dark:text-amber-400'
  return 'text-v-pink'
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
    else cmp = a.pageType.localeCompare(b.pageType)
    return asc ? cmp : -cmp
  })

  function SortBtn({ k, label }: { k: SortKey; label: string }) {
    const active = sort === k
    return (
      <button onClick={() => toggleSort(k)}
        className={`flex items-center gap-1 text-xs font-semibold transition-colors
          ${active ? 'text-v-pink' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
        {label}
        <span className="opacity-60">{active ? (asc ? '↑' : '↓') : '↕'}</span>
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-v-dark2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-white/10
        flex items-center justify-between bg-gray-50 dark:bg-white/[0.03]">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          All pages <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">({pages.length})</span>
        </h3>
        <div className="flex gap-4">
          <SortBtn k="url" label="URL" />
          <SortBtn k="pageType" label="Type" />
          <SortBtn k="score" label="Score" />
        </div>
      </div>

      {/* Check legend */}
      <div className="px-5 py-2 border-b border-gray-50 dark:border-white/5 hidden md:flex items-center gap-3 flex-wrap
        bg-gray-50/50 dark:bg-transparent">
        <span className="text-xs text-gray-300 dark:text-gray-600">Checks:</span>
        {CHECK_IDS.map(id => (
          <span key={id} className="text-xs text-gray-400 dark:text-gray-600">{CHECK_SHORT[id]}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50 dark:divide-white/5">
        {sorted.map((page, i) => {
          const isOpen = expanded === page.url
          return (
            <div key={page.url} className={i % 2 === 0 ? '' : 'bg-gray-50/40 dark:bg-white/[0.015]'}>
              <button
                onClick={() => setExpanded(isOpen ? null : page.url)}
                className="w-full px-5 py-3 flex items-center gap-3
                  hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
              >
                {/* Score */}
                <span className={`text-sm font-bold w-8 flex-shrink-0 tabular-nums ${scoreColor(page.score)}`}>
                  {page.score}
                </span>

                {/* Check dots */}
                <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
                  {CHECK_IDS.map(id => {
                    const check = page.checks.find(c => c.id === id)
                    return (
                      <span key={id}
                        title={`${CHECK_SHORT[id]}: ${check?.status ?? 'n/a'}`}
                        className={`w-2 h-2 rounded-full ${check ? STATUS_DOT[check.status] : 'bg-gray-200 dark:bg-white/10'}`}
                      />
                    )
                  })}
                </div>

                {/* URL */}
                <p className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate min-w-0">{page.url}</p>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/10 dark:text-gray-500
                    rounded-full px-2.5 py-0.5">
                    {page.pageType}
                  </span>
                  <svg className={`w-3.5 h-3.5 text-gray-300 dark:text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded checks */}
              {isOpen && (
                <div className="px-5 pb-4 pt-1 border-t border-gray-100 dark:border-white/5
                  bg-gray-50 dark:bg-white/[0.02]">
                  <div className="mt-3 space-y-2">
                    {page.checks.map(check => (
                      <div key={check.id}
                        className={`rounded-xl border px-4 py-3 text-sm ${STATUS_CHIP[check.status]}`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[check.status]}`} />
                          <span className="font-semibold text-gray-800 dark:text-gray-100">{check.label}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">{check.value}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mt-1.5 ml-3.5 leading-relaxed text-xs">
                          {check.recommendation}
                        </p>
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
