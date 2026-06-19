'use client'

import type { SiteAnalysis } from '@/lib/types'
import ScoreGauge from './ScoreGauge'

const PAGE_TYPE_LABELS: Record<string, string> = {
  homepage: 'Homepage', service: 'Service pages', blog: 'Blog / Articles',
  product: 'Products', collection: 'Collections', contact: 'Contact',
  about: 'About', other: 'Other',
}

const SEVERITY: Record<string, { bar: string; text: string; badge: string }> = {
  high:   { bar: 'bg-v-pink',   text: 'text-v-pink',   badge: 'bg-v-pink/10   text-v-pink   dark:bg-v-pink/15' },
  medium: { bar: 'bg-amber-400', text: 'text-amber-600', badge: 'bg-amber-100  text-amber-700 dark:bg-amber-400/15 dark:text-amber-300' },
  low:    { bar: 'bg-blue-400',  text: 'text-blue-600',  badge: 'bg-blue-100   text-blue-700  dark:bg-blue-400/15  dark:text-blue-300' },
}

export default function SiteSummary({ analysis }: { analysis: SiteAnalysis }) {
  const { siteScore, totalPages, issueCount, pageTypeBreakdown, issues } = analysis

  return (
    <div className="space-y-4">

      {/* Score row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Gauge */}
        <div className="bg-white dark:bg-v-dark2 rounded-2xl border border-gray-200 dark:border-white/10
          p-6 flex flex-col items-center justify-center shadow-sm">
          <ScoreGauge score={siteScore} size="lg" />
          <p className="mt-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Overall site score</p>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-v-dark2 rounded-2xl border border-gray-200 dark:border-white/10
          p-6 flex flex-col justify-center gap-5 shadow-sm">
          <div>
            <p className="text-4xl font-heading font-bold text-gray-900 dark:text-white">{totalPages}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Pages audited</p>
          </div>
          <div>
            <p className="text-4xl font-heading font-bold text-gray-900 dark:text-white">{issueCount}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Issues found</p>
          </div>
        </div>

        {/* Page types */}
        <div className="bg-white dark:bg-v-dark2 rounded-2xl border border-gray-200 dark:border-white/10
          p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">Page types</p>
          <div className="space-y-2.5">
            {Object.entries(pageTypeBreakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">{PAGE_TYPE_LABELS[type] ?? type}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white
                  bg-gray-100 dark:bg-white/10 rounded-full px-2.5 py-0.5 tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="bg-white dark:bg-v-dark2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Issues across your site</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {issues.map(issue => {
              const s = SEVERITY[issue.severity]
              return (
                <div key={issue.type} className="px-6 py-4 flex items-start gap-4">
                  {/* Left color bar */}
                  <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${s.bar}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                        {issue.count} page{issue.count > 1 ? 's' : ''}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{issue.label}</span>
                    </div>
                    {issue.urls && issue.urls.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {issue.urls.map(url => (
                          <li key={url} className="text-xs text-gray-400 dark:text-gray-600 truncate">{url}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <span className={`flex-shrink-0 text-xs font-semibold uppercase tracking-wide
                    rounded-full px-2.5 py-0.5 ${s.badge}`}>
                    {issue.severity}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
