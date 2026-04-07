"use client"

import { useRouter } from 'next/navigation'
import type { WorkflowTransaction } from '@/api/accounting/types'
import { formatVND, getStageLabel, getStageIndex, getSubsidiaryShort, getTypeLabel, relativeTime, STAGE_ORDER } from '@/api/accounting/utils'

const isArchived = (tx: WorkflowTransaction) => tx.status === 'archived'

function StageDots({ current }: { current: string }) {
  const idx = getStageIndex(current as Parameters<typeof getStageIndex>[0])
  return (
    <div className="flex gap-0.5 items-center">
      {STAGE_ORDER.map((s, i) => (
        <div
          key={s}
          className={`w-1.5 h-1.5 rounded-full ${
            i < idx ? 'bg-green-400' : i === idx ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function ThresholdDot({ amount }: { amount: number }) {
  const color = amount <= 5_000_000 ? 'bg-green-400' : amount <= 20_000_000 ? 'bg-orange-400' : 'bg-red-400'
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
}

function ConfidencePill({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Exported</span>
  const color = value >= 85 ? 'text-blue-600 bg-blue-50' : value >= 60 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'
  return <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${color}`}>{value}%</span>
}

export default function TransactionListView({ transactions }: { transactions: WorkflowTransaction[] }) {
  const router = useRouter()

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="hidden md:grid grid-cols-[1fr_100px_80px_120px_70px_60px_80px] gap-2 px-4 py-2 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
        <span>Title</span>
        <span>Type</span>
        <span>Subsidiary</span>
        <span className="text-right">Amount</span>
        <span className="text-center">AI</span>
        <span className="text-center">Progress</span>
        <span className="text-right">Updated</span>
      </div>

      <div className="divide-y divide-gray-50">
        {transactions.map(tx => (
          <div
            key={tx.id}
            onClick={() => router.push(`/accounting/detail/${tx.id}`)}
            className={`cursor-pointer hover:bg-gray-50 transition-colors ${isArchived(tx) ? 'opacity-50' : ''}`}
          >
            <div className="hidden md:grid grid-cols-[1fr_100px_80px_120px_70px_60px_80px] gap-2 px-4 py-2.5 items-center">
              <div className="flex items-center gap-2 min-w-0">
                <ThresholdDot amount={tx.amount} />
                <span className={`text-sm truncate ${isArchived(tx) ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{tx.title}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                  isArchived(tx) ? 'bg-gray-50 text-gray-400' : 'bg-gray-100 text-gray-500'
                }`}>
                  {getStageLabel(tx.current_stage)}
                </span>
              </div>
              <span className="text-xs text-gray-600">{getTypeLabel(tx.type)}</span>
              <span className="text-xs text-gray-500">{getSubsidiaryShort(tx.subsidiary)}</span>
              <span className="text-sm text-gray-900 text-right font-mono tabular-nums">{formatVND(tx.amount)}</span>
              <div className="flex justify-center"><ConfidencePill value={tx.ai_confidence} /></div>
              <div className="flex justify-center"><StageDots current={tx.current_stage} /></div>
              <span className="text-xs text-gray-400 text-right">{relativeTime(tx.updated_at)}</span>
            </div>

            <div className="md:hidden px-4 py-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <ThresholdDot amount={tx.amount} />
                <span className={`text-sm font-medium truncate flex-1 ${isArchived(tx) ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{tx.title}</span>
                <ConfidencePill value={tx.ai_confidence} />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="px-1.5 py-0.5 rounded bg-gray-100">{getStageLabel(tx.current_stage)}</span>
                <span>{getTypeLabel(tx.type)}</span>
                <span>{getSubsidiaryShort(tx.subsidiary)}</span>
                <span className="ml-auto font-mono">{formatVND(tx.amount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <StageDots current={tx.current_stage} />
                <span className="text-xs text-gray-400 ml-auto">{relativeTime(tx.updated_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-gray-400">No transactions</div>
      )}
    </div>
  )
}
