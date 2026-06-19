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
    if (!trimmed) {
      setError('Enter a URL to audit')
      return
    }
    setError('')
    router.push(`/results?url=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none pointer-events-none">
            🔗
          </span>
          <input
            type="text"
            value={value}
            onChange={e => { setValue(e.target.value); setError('') }}
            placeholder="yourwebsite.com"
            className="w-full pl-10 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400
              focus:outline-none focus:border-v-pink focus:ring-2 focus:ring-v-pink/20 transition-all text-base"
            autoComplete="url"
            inputMode="url"
          />
        </div>
        <button
          type="submit"
          className="px-8 py-4 rounded-xl font-bold text-white text-base transition-all
            bg-v-pink hover:bg-v-pink/90 active:scale-95 shadow-lg shadow-v-pink/30 whitespace-nowrap"
        >
          Run free audit
        </button>
      </div>
      {error && <p className="mt-2 text-v-pink text-sm">{error}</p>}
      <p className="mt-3 text-gray-500 text-xs text-center sm:text-left">
        No login required · Works on any public URL
      </p>
    </form>
  )
}
