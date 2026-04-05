interface StreakBadgeProps {
  days: number
}

export default function StreakBadge({ days }: StreakBadgeProps) {
  if (days === 0) return null

  if (days >= 7) {
    return (
      <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-md border bg-orange-50 text-orange-600 border-orange-200">
        {days}d streak
      </span>
    )
  }

  if (days >= 3) {
    return (
      <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-md border bg-blue-50 text-blue-600 border-blue-200">
        {days}d streak
      </span>
    )
  }

  return (
    <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-md border bg-gray-50 text-gray-500 border-gray-200">
      {days}d streak
    </span>
  )
}
