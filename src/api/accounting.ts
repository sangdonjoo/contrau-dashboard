import type { WorkflowTransaction, WorkflowStep, JournalPreview, FilterState, ArchiveFilterState } from './accounting/types'
import transactionsData from '@/data/accounting/transactions.json'
import stepsData from '@/data/accounting/steps.json'
import journalPreviewsData from '@/data/accounting/journal-previews.json'

const transactions = transactionsData as WorkflowTransaction[]
const steps = stepsData as WorkflowStep[]
const journalPreviews = journalPreviewsData as JournalPreview[]

function matchesThreshold(amount: number, threshold: string): boolean {
  if (threshold === 'all') return true
  if (threshold === 'small') return amount <= 5_000_000
  if (threshold === 'medium') return amount > 5_000_000 && amount <= 20_000_000
  return amount > 20_000_000
}

export async function fetchTransactions(filters?: FilterState): Promise<WorkflowTransaction[]> {
  let result = transactions.filter(t => t.status === 'active')
  if (filters) {
    if (filters.subsidiary !== 'all') result = result.filter(t => t.subsidiary === filters.subsidiary)
    if (filters.type !== 'all') result = result.filter(t => t.type === filters.type)
    if (filters.threshold !== 'all') result = result.filter(t => matchesThreshold(t.amount, filters.threshold))
  }
  return result
}

export async function fetchAllTransactions(filters?: FilterState & { keyword?: string }): Promise<WorkflowTransaction[]> {
  let result = [...transactions]
  result.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
  if (filters) {
    if (filters.subsidiary !== 'all') result = result.filter(t => t.subsidiary === filters.subsidiary)
    if (filters.type !== 'all') result = result.filter(t => t.type === filters.type)
    if (filters.threshold !== 'all') result = result.filter(t => matchesThreshold(t.amount, filters.threshold))
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(kw) ||
        (t.vendor?.toLowerCase().includes(kw)) ||
        (t.invoice_ref?.toLowerCase().includes(kw))
      )
    }
  }
  return result
}

export async function fetchTransactionDetail(id: string): Promise<{
  transaction: WorkflowTransaction
  steps: WorkflowStep[]
  journalPreviews: JournalPreview[]
}> {
  const transaction = transactions.find(t => t.id === id)!
  const txSteps = steps.filter(s => s.transaction_id === id).sort(
    (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
  )
  const txJournals = journalPreviews.filter(j => j.transaction_id === id)
  return { transaction, steps: txSteps, journalPreviews: txJournals }
}

export async function fetchArchiveTransactions(filters?: ArchiveFilterState): Promise<{
  transactions: WorkflowTransaction[]
  totalCount: number
}> {
  let result = transactions.filter(t => t.status === 'archived')
  if (filters) {
    if (filters.subsidiary !== 'all') result = result.filter(t => t.subsidiary === filters.subsidiary)
    if (filters.type !== 'all') result = result.filter(t => t.type === filters.type)
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(kw) ||
        (t.vendor?.toLowerCase().includes(kw)) ||
        (t.invoice_ref?.toLowerCase().includes(kw))
      )
    }
    if (filters.dateFrom) result = result.filter(t => t.updated_at >= filters.dateFrom!)
    if (filters.dateTo) result = result.filter(t => t.updated_at <= filters.dateTo! + 'T23:59:59')
  }
  const totalCount = result.length
  const page = filters?.page ?? 1
  const pageSize = filters?.pageSize ?? 20
  const start = (page - 1) * pageSize
  return { transactions: result.slice(start, start + pageSize), totalCount }
}
