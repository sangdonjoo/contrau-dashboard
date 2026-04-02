interface Props {
  confidence: number | null
  requester: string | null
}

export default function AiAutoBadge({ confidence, requester }: Props) {
  if (confidence === null || confidence < 85 || requester !== 'AI Agent') return null
  return (
    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
      AI Auto
    </span>
  )
}
