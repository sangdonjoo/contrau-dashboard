import type { WorkflowTransaction, StageCode } from '@/api/accounting/types'
import { getStageLabel } from '@/api/accounting/utils'
import TransactionCard from './TransactionCard'

interface Props {
  stage: StageCode
  transactions: WorkflowTransaction[]
}

export default function KanbanColumn({ stage, transactions }: Props) {
  return (
    <div className="flex-shrink-0 w-60 flex flex-col">
      <div className="flex items-center justify-between px-2 py-1.5 mb-2">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {getStageLabel(stage)}
        </span>
        {transactions.length > 0 && (
          <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5 font-medium">
            {transactions.length}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {transactions.map(t => (
          <TransactionCard key={t.id} transaction={t} />
        ))}
        {transactions.length === 0 && (
          <div className="text-xs text-gray-300 text-center py-4">Empty</div>
        )}
      </div>
    </div>
  )
}
