'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function URLInput() {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) { setError('Enter a URL to audit'); return }
    setError('')
    router.push(`/results?url=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex flex-col sm:flex-row gap-3 p-1.5 rounded-2xl
        bg-white dark:bg-v-dark2
        border border-gray-200 dark:border-white/15
        shadow-xl shadow-black/5 dark:shadow-black/30
        focus-within:border-v-pink dark:focus-within:border-v-pink
        focus-within:ring-4 focus-within:ring-v-pink/10 transition-all">

        <div className="flex-1 flex items-center gap-3 px-4">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <input
            type="text"
            value={value}
            onChange={e => { setValue(e.target.value); setError('') }}
            placeholder="yourwebsite.com"
            className="flex-1 bg-transparent py-3 text-base text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none"
            autoComplete="url"
            inputMode="url"
          />
        </div>

        <button
          type="submit"
          className="flex-shrink-0 px-7 py-3 rounded-xl font-bold text-white text-sm
            bg-gradient-to-r from-v-pink to-v-purple
            hover:opacity-90 active:scale-95
            shadow-lg shadow-v-pink/25 transition-all whitespace-nowrap"
        >
          Run free audit
        </button>
      </div>

      {error && <p className="mt-2 text-v-pink text-sm text-center">{error}</p>}
      <p className="mt-3 text-gray-400 dark:text-gray-600 text-xs text-center">
        No login required · Works on any public URL
      </p>
    </form>
  )
}
