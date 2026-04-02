"use client"

import { useRouter } from 'next/navigation'
import type { WorkflowTransaction } from '@/api/accounting/types'
import { getStageLabel, relativeTime } from '@/api/accounting/utils'
import TypeBadge from './TypeBadge'
import SubsidiaryBadge from './SubsidiaryBadge'
import AmountDisplay from './AmountDisplay'

interface Props {
  transactions: WorkflowTransaction[]
}

export default function ArchiveTable({ transactions }: Props) {
  const router = useRouter()

  if (transactions.length === 0) {
    return <div className="text-sm text-gray-400 text-center py-8">No results</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-2">Title</th>
            <th className="text-left px-4 py-2">Type</th>
            <th className="text-left px-4 py-2">Entity</th>
            <th className="text-right px-4 py-2">Amount</th>
            <th className="text-left px-4 py-2">Final Stage</th>
            <th className="text-left px-4 py-2">Completed</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr
              key={t.id}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/accounting/detail/${t.id}`)}
            >
              <td className="px-4 py-2.5 max-w-xs">
                <span className="font-medium text-gray-900 truncate block">{t.title}</span>
                {t.invoice_ref && <span className="text-xs text-gray-400">{t.invoice_ref}</span>}
              </td>
              <td className="px-4 py-2.5"><TypeBadge type={t.type} /></td>
              <td className="px-4 py-2.5"><SubsidiaryBadge subsidiary={t.subsidiary} /></td>
              <td className="px-4 py-2.5 text-right"><AmountDisplay amount={t.amount} /></td>
              <td className="px-4 py-2.5">
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                  {getStageLabel(t.current_stage)}
                </span>
              </td>
              <td className="px-4 py-2.5 text-xs text-gray-400">{relativeTime(t.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
