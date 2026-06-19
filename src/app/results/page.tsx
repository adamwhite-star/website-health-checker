import { Suspense } from 'react'
import AuditResults from '@/components/AuditResults'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Audit Results | Website Health Checker',
}

export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-v-dark">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-v-dark2 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/" className="font-heading font-bold text-white hover:text-v-pink transition-colors">
            Website Health Checker
          </a>
          <a href="https://versantus.co.uk" target="_blank" rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-v-pink transition-colors">
            by Versantus →
          </a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <Suspense fallback={
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-v-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading…</p>
          </div>
        }>
          <AuditResults />
        </Suspense>
      </div>

      <footer className="border-t border-white/5 py-6 px-6 text-center mt-10">
        <p className="text-gray-600 text-xs">
          Built by{' '}
          <a href="https://versantus.co.uk" target="_blank" rel="noopener noreferrer"
            className="text-gray-500 hover:text-v-pink transition-colors">
            Versantus
          </a>
          {' '}— Oxford&apos;s Drupal &amp; digital agency
        </p>
      </footer>
    </main>
  )
}
