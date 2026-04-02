import type { StepResult } from '@/api/accounting/types'

interface Props {
  result: StepResult
}

export default function ResultBadge({ result }: Props) {
  if (result === 'SUCCESS') {
    return <span className="text-green-600 text-xs font-medium">Done</span>
  }
  if (result === 'BLOCKED') {
    return <span className="text-red-600 text-xs font-medium">Blocked</span>
  }
  if (result === 'REJECTED') {
    return <span className="text-red-500 text-xs font-medium">Rejected</span>
  }
  return <span className="text-gray-400 text-xs font-medium">In Progress</span>
}
