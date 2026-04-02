import type { WorkflowTransaction } from '@/api/accounting/types'
import { getStageLabel, relativeTime } from '@/api/accounting/utils'
import TypeBadge from './TypeBadge'
import SubsidiaryBadge from './SubsidiaryBadge'
import AmountDisplay from './AmountDisplay'
import ConfidenceBar from './ConfidenceBar'
import AiAutoBadge from './AiAutoBadge'
import MetaField from './MetaField'

interface Props {
  transaction: WorkflowTransaction
}

export default function TransactionMeta({ transaction: t }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <TypeBadge type={t.type} />
          <SubsidiaryBadge subsidiary={t.subsidiary} />
          <AiAutoBadge confidence={t.ai_confidence} requester={t.requester} />
        </div>
        <h2 className="text-base font-semibold text-gray-900 leading-snug">{t.title}</h2>
      </div>

      <MetaField label="Current Stage">
        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">
          {getStageLabel(t.current_stage)}
        </span>
      </MetaField>

      <MetaField label="Amount">
        <AmountDisplay amount={t.amount} />
      </MetaField>

      {t.ai_confidence !== null && (
        <MetaField label="AI Confidence">
          <ConfidenceBar confidence={t.ai_confidence} />
        </MetaField>
      )}

      {t.vendor && <MetaField label="Vendor">{t.vendor}</MetaField>}
      {t.invoice_ref && <MetaField label="Invoice No.">{t.invoice_ref}</MetaField>}
      <MetaField label="Requester">{t.requester ?? '—'}</MetaField>
      <MetaField label="Assignee">{t.assignee ?? 'Unassigned'}</MetaField>
      <MetaField label="Last Updated">{relativeTime(t.updated_at)}</MetaField>

      {t.notes && (
        <div>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide block mb-1">Notes</span>
          <p className="text-sm text-gray-700 leading-relaxed">{t.notes}</p>
        </div>
      )}
    </div>
  )
}
