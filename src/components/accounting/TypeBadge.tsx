import type { WorkflowType } from '@/api/accounting/types'
import { getTypeLabel } from '@/api/accounting/utils'

const TYPE_COLORS: Record<WorkflowType, string> = {
  PURCHASE: 'bg-blue-100 text-blue-700',
  SALES: 'bg-green-100 text-green-700',
  EXPENSE: 'bg-yellow-100 text-yellow-700',
  CAPEX: 'bg-purple-100 text-purple-700',
  INVENTORY: 'bg-cyan-100 text-cyan-700',
  PAYROLL: 'bg-indigo-100 text-indigo-700',
  TAX: 'bg-red-100 text-red-700',
  MONTH_CLOSE: 'bg-gray-100 text-gray-700',
  BANK: 'bg-teal-100 text-teal-700',
  FIXED_ASSET: 'bg-orange-100 text-orange-700',
}

interface Props {
  type: WorkflowType
}

export default function TypeBadge({ type }: Props) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TYPE_COLORS[type]}`}>
      {getTypeLabel(type)}
    </span>
  )
}
