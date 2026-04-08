interface SparklineProps {
  data: number[]
}

function trendColor(data: number[]): string {
  if (data.length < 14) return 'text-gray-400'
  const recent = data.slice(-7)
  const prior = data.slice(-14, -7)
  const avgRecent = recent.reduce((a, b) => a + b, 0) / 7
  const avgPrior = prior.reduce((a, b) => a + b, 0) / 7
  if (avgPrior === 0 && avgRecent === 0) return 'text-gray-400'
  if (avgRecent > avgPrior * 1.05) return 'text-emerald-500'
  if (avgRecent < avgPrior * 0.95) return 'text-red-400'
  return 'text-gray-400'
}

export default function Sparkline({ data }: SparklineProps) {
  const W = 60
  const H = 24
  const PAD = 2

  const color = trendColor(data)
  const strokeColor =
    color === 'text-emerald-500'
      ? '#10b981'
      : color === 'text-red-400'
      ? '#f87171'
      : '#9ca3af'

  if (data.length === 0 || data.every(v => v === 0)) {
    return <svg width={W} height={H} className="opacity-30" aria-hidden="true"><line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} stroke={strokeColor} strokeWidth={1} strokeDasharray="2 2" /></svg>
  }

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((v, i) => {
      const x = PAD + (i / (data.length - 1)) * (W - PAD * 2)
      const y = H - PAD - ((v - min) / range) * (H - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg width={W} height={H} aria-hidden="true" className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
