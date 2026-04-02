import type { WorkflowTransaction } from '@/api/accounting/types'
import { STAGE_ORDER } from '@/api/accounting/utils'
import KanbanColumn from './KanbanColumn'

interface Props {
  transactions: WorkflowTransaction[]
}

export default function KanbanBoard({ transactions }: Props) {
  const grouped = STAGE_ORDER.reduce<Record<string, WorkflowTransaction[]>>((acc, stage) => {
    acc[stage] = transactions.filter(t => t.current_stage === stage)
    return acc
  }, {})

  return (
    <div className="flex gap-3 p-4 overflow-x-auto h-full">
      {STAGE_ORDER.map(stage => (
        <KanbanColumn key={stage} stage={stage} transactions={grouped[stage]} />
      ))}
    </div>
  )
}
