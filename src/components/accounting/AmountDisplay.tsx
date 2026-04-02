import { formatVND, getThresholdLabel } from '@/api/accounting/utils'

interface Props {
  amount: number
}

const COLOR_MAP: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
}

export default function AmountDisplay({ amount }: Props) {
  if (amount === 0) {
    return <span className="text-sm text-gray-400">No amount</span>
  }
  const { label, color } = getThresholdLabel(amount)
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-sm font-semibold text-gray-900">{formatVND(amount)}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${COLOR_MAP[color]}`}>{label}</span>
    </span>
  )
}
