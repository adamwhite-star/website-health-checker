'use client'

import { useState } from 'react'
import type { CheckResult } from '@/lib/types'

interface Props {
  check: CheckResult
}

const icons = {
  pass: (
    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  warn: (
    <svg className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  fail: (
    <svg className="w-5 h-5 text-v-pink shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

const statusBg = {
  pass: 'border-green-500/20 bg-green-500/5',
  warn: 'border-yellow-400/20 bg-yellow-400/5',
  fail: 'border-v-pink/20 bg-v-pink/5',
}

export default function CheckItem({ check }: Props) {
  const [open, setOpen] = useState(check.status !== 'pass')

  return (
    <div className={`rounded-xl border ${statusBg[check.status]} overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/5 transition-colors"
      >
        {icons[check.status]}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-white text-sm">{check.label}</span>
            <svg
              className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm mt-0.5 truncate">{check.value}</p>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0">
          <div className="ml-8 border-t border-white/5 pt-3">
            <p className="text-gray-300 text-sm leading-relaxed">{check.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  )
}
