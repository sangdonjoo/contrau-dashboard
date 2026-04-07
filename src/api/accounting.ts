import type { WorkflowTransaction, WorkflowStep, JournalPreview, FilterState, ArchiveFilterState } from './accounting/types'
import stepsData from '@/data/accounting/steps.json'
import journalPreviewsData from '@/data/accounting/journal-previews.json'

const steps = stepsData as WorkflowStep[]
const journalPreviews = journalPreviewsData as JournalPreview[]

interface TransactionApiResponse {
  available: boolean
  items: WorkflowTransaction[]
  total: number
  hasMore: boolean
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? ''

async function fetchFromApi(params: Record<string, string | number | undefined>): Promise<TransactionApiResponse> {
  try {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        searchParams.set(key, String(value))
      }
    }
    const res = await fetch(`${BASE_URL}/api/accounting/transactions?${searchParams.toString()}`, {
      cache: 'no-store',
    })
    if (!res.ok) return { available: false, items: [], total: 0, hasMore: false }
    return res.json() as Promise<TransactionApiResponse>
  } catch {
    return { available: false, items: [], total: 0, hasMore: false }
  }
}

function matchesThreshold(amount: number, threshold: string): boolean {
  if (threshold === 'all') return true
  if (threshold === 'small') return amount <= 5_000_000
  if (threshold === 'medium') return amount > 5_000_000 && amount <= 20_000_000
  return amount > 20_000_000
}

export async function fetchTransactions(filters?: FilterState): Promise<WorkflowTransaction[]> {
  const params: Record<string, string | number | undefined> = {
    limit: 200,
    offset: 0,
    type: filters?.type !== 'all' ? filters?.type : undefined,
  }
  const response = await fetchFromApi(params)
  if (!response.available) return []

  let result = response.items
  if (filters) {
    if (filters.subsidiary !== 'all') result = result.filter(t => t.subsidiary === filters.subsidiary)
    if (filters.threshold !== 'all') result = result.filter(t => matchesThreshold(t.amount, filters.threshold))
  }
  return result
}

export async function fetchAllTransactions(filters?: FilterState & { keyword?: string }): Promise<WorkflowTransaction[]> {
  const params: Record<string, string | number | undefined> = {
    limit: 200,
    offset: 0,
    type: filters?.type !== 'all' ? filters?.type : undefined,
    subsidiary: filters?.subsidiary !== 'all' ? filters?.subsidiary : undefined,
    keyword: filters?.keyword,
  }
  const response = await fetchFromApi(params)
  if (!response.available) return []

  let result = response.items
  if (filters) {
    if (filters.threshold !== 'all') result = result.filter(t => matchesThreshold(t.amount, filters.threshold))
  }
  return result
}

export async function fetchTransactionDetail(id: string): Promise<{
  transaction: WorkflowTransaction
  steps: WorkflowStep[]
  journalPreviews: JournalPreview[]
}> {
  // Fetch detail from API; fall back to empty shell if not found in mock steps/journals
  const response = await fetchFromApi({ limit: 500, offset: 0 })
  const transaction = response.items.find(t => t.id === id)

  if (!transaction) {
    // Return a minimal shell to avoid crashes when navigating to a Supabase-sourced detail
    throw new Error(`Transaction ${id} not found`)
  }

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
  const page = filters?.page ?? 1
  const pageSize = filters?.pageSize ?? 20
  const offset = (page - 1) * pageSize

  const params: Record<string, string | number | undefined> = {
    limit: pageSize,
    offset,
    type: filters?.type !== 'all' ? filters?.type : undefined,
    keyword: filters?.keyword || undefined,
    dateFrom: filters?.dateFrom ?? undefined,
    dateTo: filters?.dateTo ?? undefined,
  }

  const response = await fetchFromApi(params)
  if (!response.available) return { transactions: [], totalCount: 0 }

  let result = response.items
  // All Supabase records are archived (historical); apply subsidiary filter client-side
  if (filters?.subsidiary && filters.subsidiary !== 'all') {
    result = result.filter(t => t.subsidiary === filters!.subsidiary)
  }

  return { transactions: result, totalCount: response.total }
}
