'use client'

interface Props {
  score: number
  size?: 'md' | 'lg'
  theme?: 'dark' | 'light'
}

export default function ScoreGauge({ score, size = 'md', theme = 'dark' }: Props) {
  const dim = size === 'lg' ? 160 : 140
  const cx = dim / 2
  const radius = size === 'lg' ? 62 : 54
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

  const trackColor = theme === 'light' ? '#e5e7eb' : '#1a1a2e'
  const scoreColor = theme === 'light' ? '#111827' : 'white'
  const subColor = theme === 'light' ? '#6b7280' : '#888'
  const fontSize = size === 'lg' ? 32 : 28

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <circle
          cx={cx} cy={cx} r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth="12"
        />
        <circle
          cx={cx} cy={cx} r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x={cx} y={cx - 8} textAnchor="middle" dominantBaseline="middle"
          fill={scoreColor} fontSize={fontSize} fontWeight="700" fontFamily="sans-serif">
          {score}
        </text>
        <text x={cx} y={cx + 14} textAnchor="middle" dominantBaseline="middle"
          fill={subColor} fontSize="11" fontFamily="sans-serif">
          / 100
        </text>
      </svg>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}
