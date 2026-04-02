"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { WorkflowTransaction, WorkflowStep, JournalPreview } from '@/api/accounting/types'
import { fetchTransactionDetail } from '@/api/accounting'
import TransactionMeta from '@/components/accounting/TransactionMeta'
import Timeline from '@/components/accounting/Timeline'
import JournalPreviewTable from '@/components/accounting/JournalPreviewTable'

export default function AccountingDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const [transaction, setTransaction] = useState<WorkflowTransaction | null>(null)
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [journals, setJournals] = useState<JournalPreview[]>([])

  useEffect(() => {
    if (!id) return
    fetchTransactionDetail(id).then(({ transaction, steps, journalPreviews }) => {
      setTransaction(transaction)
      setSteps(steps)
      setJournals(journalPreviews)
    })
  }, [id])

  if (!transaction) {
    return <div className="p-4 text-sm text-gray-400">Loading...</div>
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <button
        onClick={() => router.push('/accounting')}
        className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="md:w-80 md:flex-shrink-0">
          <TransactionMeta transaction={transaction} />
        </div>
        <div className="flex-1">
          <Timeline steps={steps} />
        </div>
      </div>

      <JournalPreviewTable entries={journals} />
    </div>
  )
}
