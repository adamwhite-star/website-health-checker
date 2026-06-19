'use client'

import { useEffect, useState } from 'react'

interface Props {
  score: number
  size?: 'md' | 'lg'
}

export default function ScoreGauge({ score, size = 'md' }: Props) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 60); return () => clearTimeout(t) }, [score])

  const dim = size === 'lg' ? 156 : 136
  const cx = dim / 2
  const radius = size === 'lg' ? 60 : 52
  const strokeW = 10
  const circumference = 2 * Math.PI * radius
  const targetOffset = circumference - (score / 100) * circumference
  const offset = animated ? targetOffset : circumference

  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#FFB800' : '#F0146E'
  const label = score >= 70 ? 'Good' : score >= 40 ? 'Needs work' : 'Poor'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {/* Track */}
        <circle cx={cx} cy={cx} r={radius} fill="none"
          stroke="currentColor"
          className="text-gray-200 dark:text-white/10"
          strokeWidth={strokeW} />
        {/* Fill */}
        <circle cx={cx} cy={cx} r={radius} fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition: 'stroke-dashoffset 0.85s cubic-bezier(0.4,0,0.2,1)' }}
        />
        {/* Score number */}
        <text x={cx} y={cx - 6} textAnchor="middle" dominantBaseline="middle"
          fill="currentColor"
          className="text-gray-900 dark:text-white"
          fontSize={size === 'lg' ? 30 : 26} fontWeight="700" fontFamily="sans-serif"
          style={{ fill: 'currentColor' }}>
          {score}
        </text>
        <text x={cx} y={cx + 14} textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fontFamily="sans-serif"
          fill="currentColor"
          className="text-gray-400 dark:text-gray-500"
          style={{ fill: 'currentColor', opacity: 0.6 }}>
          / 100
        </text>
      </svg>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}
