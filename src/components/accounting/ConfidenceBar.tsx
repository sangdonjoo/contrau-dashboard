interface Props {
  confidence: number | null
}

export default function ConfidenceBar({ confidence }: Props) {
  if (confidence === null) return null
  const color = confidence >= 85 ? 'bg-blue-500' : confidence >= 60 ? 'bg-yellow-500' : 'bg-red-400'
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${confidence}%` }} />
      </div>
      <span className="text-xs text-gray-500 tabular-nums">{confidence}%</span>
    </div>
  )
}
