"use client"

import { useState, useEffect } from 'react'
import type { WorkflowTransaction, FilterState } from '@/api/accounting/types'
import { fetchTransactions } from '@/api/accounting'
import FilterBar from '@/components/accounting/FilterBar'
import KanbanBoard from '@/components/accounting/KanbanBoard'

const DEFAULT_FILTERS: FilterState = {
  subsidiary: 'all',
  type: 'all',
  threshold: 'all',
}

export default function AccountingPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [transactions, setTransactions] = useState<WorkflowTransaction[]>([])

  useEffect(() => {
    fetchTransactions(filters).then(setTransactions)
  }, [filters])

  return (
    <div className="flex flex-col h-full">
      <FilterBar filters={filters} onChange={setFilters} activeCount={transactions.length} />
      <div className="flex-1 overflow-hidden">
        <KanbanBoard transactions={transactions} />
      </div>
    </div>
  )
}
