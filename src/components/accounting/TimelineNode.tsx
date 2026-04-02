import type { WorkflowStep } from '@/api/accounting/types'
import { getStageLabel, relativeTime } from '@/api/accounting/utils'
import ActorIcon from './ActorIcon'
import ResultBadge from './ResultBadge'
import AttachmentLink from './AttachmentLink'

interface Props {
  step: WorkflowStep
  isLast: boolean
}

export default function TimelineNode({ step, isLast }: Props) {
  const isPending = step.result === null

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <ActorIcon actorType={step.actor_type} />
        {!isLast && <div className="w-px flex-1 bg-gray-200 mt-1" />}
      </div>

      <div className={`pb-4 flex-1 ${isPending ? 'opacity-60' : ''}`}>
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-xs font-semibold text-gray-700">{getStageLabel(step.stage)}</span>
          <ResultBadge result={step.result} />
        </div>
        <p className="text-sm text-gray-800">{step.action}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">{step.actor}</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">{relativeTime(step.started_at)}</span>
        </div>
        {step.attachments && step.attachments.length > 0 && (
          <AttachmentLink attachments={step.attachments} />
        )}
        {step.result === 'BLOCKED' && step.details?.['missing_docs'] !== undefined && (
          <p className="text-xs text-red-600 mt-1">Missing: {String(step.details['missing_docs'])}</p>
        )}
      </div>
    </div>
  )
}
