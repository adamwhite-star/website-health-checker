'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ScoreGauge from './ScoreGauge'
import CheckItem from './CheckItem'
import type { AuditResult, AuditError } from '@/lib/types'

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-36 h-36 rounded-full bg-white/10" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
      </div>
      {[...Array(7)].map((_, i) => (
        <div key={i} className="h-16 bg-white/5 rounded-xl border border-white/10" />
      ))}
    </div>
  )
}

export default function AuditResults() {
  const params = useSearchParams()
  const router = useRouter()
  const url = params.get('url') ?? ''

  const [result, setResult] = useState<AuditResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!url) {
      router.push('/')
      return
    }
    setLoading(true)
    setResult(null)
    setError(null)

    fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) {
          const e = data as AuditError
          setError(e.error)
        } else {
          setResult(data as AuditResult)
        }
      })
      .catch(() => setError('Something went wrong. Please try again.'))
      .finally(() => setLoading(false))
  }, [url, router])

  const passCount = result?.checks.filter(c => c.status === 'pass').length ?? 0
  const warnCount = result?.checks.filter(c => c.status === 'warn').length ?? 0
  const failCount = result?.checks.filter(c => c.status === 'fail').length ?? 0

  return (
    <div className="w-full max-w-2xl mx-auto">
      {loading && (
        <div>
          <p className="text-gray-400 text-sm mb-6 text-center">
            Auditing <span className="text-white font-mono text-xs bg-white/10 px-2 py-0.5 rounded">{url}</span>…
          </p>
          <Skeleton />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-v-pink/30 bg-v-pink/10 p-6 text-center space-y-4">
          <div className="text-3xl">⚠️</div>
          <p className="text-white font-semibold">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-v-pink text-sm hover:underline"
          >
            ← Try a different URL
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Score header */}
          <div className="rounded-2xl border border-white/10 bg-v-dark2 p-6 flex flex-col sm:flex-row items-center gap-6">
            <ScoreGauge score={result.score} />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-gray-400 text-xs mb-1 font-mono truncate">{result.url}</p>
              <h2 className="text-white text-xl font-bold font-heading mb-3">Your SEO health score</h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400" />{passCount} passed
                </span>
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />{warnCount} warnings
                </span>
                <span className="flex items-center gap-1.5 text-v-pink">
                  <span className="w-2 h-2 rounded-full bg-v-pink" />{failCount} failed
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-3">
                Audited {new Date(result.fetchedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Check items */}
          <div className="space-y-3">
            {result.checks.map(check => (
              <CheckItem key={check.id} check={check} />
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-r from-v-pink to-v-purple p-px">
            <div className="rounded-2xl bg-v-dark2 p-6 text-center space-y-3">
              <p className="text-white font-bold text-lg font-heading">
                {failCount > 0
                  ? `${failCount} issue${failCount > 1 ? 's' : ''} found — let's fix them`
                  : 'Want to go deeper?'}
              </p>
              <p className="text-gray-300 text-sm">
                Versantus can audit your full site — content, rankings, competitor gaps, and Core Web Vitals — and build you a prioritised fix plan.
              </p>
              <a
                href="https://versantus.co.uk/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-xl font-bold text-white text-sm
                  bg-gradient-to-r from-v-pink to-v-purple hover:opacity-90 transition-opacity mt-1"
              >
                Get a full SEO audit →
              </a>
            </div>
          </div>

          {/* Check another */}
          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              ← Check another site
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
