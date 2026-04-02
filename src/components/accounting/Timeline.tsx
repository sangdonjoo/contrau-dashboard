import type { WorkflowStep } from '@/api/accounting/types'
import TimelineNode from './TimelineNode'

interface Props {
  steps: WorkflowStep[]
}

export default function Timeline({ steps }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Processing Timeline</h3>
      {steps.length === 0 ? (
        <p className="text-sm text-gray-400">No processing history</p>
      ) : (
        <div>
          {steps.map((step, i) => (
            <TimelineNode key={step.id} step={step} isLast={i === steps.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}
