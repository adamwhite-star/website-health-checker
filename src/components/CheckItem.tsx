'use client'

import { useState } from 'react'
import type { CheckResult } from '@/lib/types'

const icons = {
  pass: (
    <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  warn: (
    <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  fail: (
    <svg className="w-4 h-4 text-v-pink shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

const statusRing: Record<string, string> = {
  pass: 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5',
  warn: 'border-amber-200  dark:border-amber-400/20  bg-amber-50  dark:bg-amber-400/5',
  fail: 'border-v-pink/25  dark:border-v-pink/20      bg-rose-50   dark:bg-v-pink/5',
}

export default function CheckItem({ check }: { check: CheckResult }) {
  const [open, setOpen] = useState(check.status !== 'pass')

  return (
    <div className={`rounded-xl border ${statusRing[check.status]} overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left
          hover:bg-black/[0.02] dark:hover:bg-white/5 transition-colors"
      >
        {icons[check.status]}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">{check.label}</span>
            <svg className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate">{check.value}</p>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-3 pt-0">
          <div className="ml-7 border-t border-gray-200 dark:border-white/10 pt-2.5">
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{check.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  )
}
