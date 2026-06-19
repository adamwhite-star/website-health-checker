'use client'

import type { SiteAnalysis } from '@/lib/types'
import ScoreGauge from './ScoreGauge'

const PAGE_TYPE_LABELS: Record<string, string> = {
  homepage: 'Homepage',
  service: 'Service',
  blog: 'Blog / Article',
  product: 'Product',
  collection: 'Collection',
  contact: 'Contact',
  about: 'About',
  other: 'Other',
}

const SEVERITY_COLOURS: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
}

const SEVERITY_DOT: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-400',
  low: 'bg-blue-400',
}

export default function SiteSummary({ analysis }: { analysis: SiteAnalysis }) {
  const { siteScore, totalPages, issueCount, pageTypeBreakdown, issues } = analysis

  return (
    <div className="space-y-6">
      {/* Score + stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
          <ScoreGauge score={siteScore} size="lg" theme="light" />
          <p className="mt-3 text-sm font-medium text-gray-500">Overall site score</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center gap-4">
          <div>
            <p className="text-3xl font-bold text-gray-900">{totalPages}</p>
            <p className="text-sm text-gray-500 mt-0.5">Pages audited</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{issueCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">Total issues found</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Page types</p>
          <div className="space-y-2">
            {Object.entries(pageTypeBreakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{PAGE_TYPE_LABELS[type] ?? type}</span>
                <span className="text-sm font-semibold text-gray-900 bg-gray-100 rounded-full px-2 py-0.5">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issues list */}
      {issues.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Issues across your site</h3>
          <div className="space-y-3">
            {issues.map(issue => (
              <div key={issue.type} className={`rounded-xl border px-4 py-3 ${SEVERITY_COLOURS[issue.severity]}`}>
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${SEVERITY_DOT[issue.severity]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{issue.count} page{issue.count > 1 ? 's' : ''}</span>
                      <span className="text-sm">{issue.label}</span>
                    </div>
                    {issue.urls && issue.urls.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {issue.urls.map(url => (
                          <li key={url} className="text-xs truncate opacity-75">{url}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wide opacity-60 flex-shrink-0">{issue.severity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
