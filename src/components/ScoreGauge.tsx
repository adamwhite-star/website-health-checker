'use client'

interface Props {
  score: number
}

export default function ScoreGauge({ score }: Props) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 70 ? '#22c55e' :
    score >= 40 ? '#FFB800' :
    '#F0146E'

  const label =
    score >= 70 ? 'Good' :
    score >= 40 ? 'Needs work' :
    'Poor'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth="12"
        />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x="70" y="66" textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="28" fontWeight="700" fontFamily="sans-serif">
          {score}
        </text>
        <text x="70" y="86" textAnchor="middle" dominantBaseline="middle"
          fill="#888" fontSize="11" fontFamily="sans-serif">
          / 100
        </text>
      </svg>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}
