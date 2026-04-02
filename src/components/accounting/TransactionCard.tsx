"use client"

import { useRouter } from 'next/navigation'
import type { WorkflowTransaction } from '@/api/accounting/types'
import { relativeTime } from '@/api/accounting/utils'
import TypeBadge from './TypeBadge'
import SubsidiaryBadge from './SubsidiaryBadge'
import AmountDisplay from './AmountDisplay'
import ConfidenceBar from './ConfidenceBar'
import AiAutoBadge from './AiAutoBadge'

interface Props {
  transaction: WorkflowTransaction
}

export default function TransactionCard({ transaction: t }: Props) {
  const router = useRouter()

  const isPendingApproval = t.current_stage === 'PENDING_APPROVAL'
  const isCompleted = t.current_stage === 'COMPLETED'

  let cardClass = 'relative bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-sm transition-shadow'
  if (isPendingApproval) cardClass += ' border-l-4 border-l-orange-400'
  if (isCompleted) cardClass += ' opacity-60'

  return (
    <div className={cardClass} onClick={() => router.push(`/accounting/detail/${t.id}`)}>
      <div className="flex items-start justify-between gap-1 mb-2">
        <div className="flex items-center gap-1 flex-wrap">
          <TypeBadge type={t.type} />
          <SubsidiaryBadge subsidiary={t.subsidiary} />
        </div>
        <AiAutoBadge confidence={t.ai_confidence} requester={t.requester} />
      </div>

      <p className="text-sm font-medium text-gray-900 leading-snug mb-2 line-clamp-2">{t.title}</p>

      <div className="mb-2">
        <AmountDisplay amount={t.amount} />
      </div>

      {t.ai_confidence !== null && (
        <div className="mb-2">
          <ConfidenceBar confidence={t.ai_confidence} />
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{t.assignee ?? 'Unassigned'}</span>
        <span>{relativeTime(t.updated_at)}</span>
      </div>
    </div>
  )
}
