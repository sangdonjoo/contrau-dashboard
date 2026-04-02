"use client"

import { useState, useEffect } from 'react'
import type { WorkflowTransaction, FilterState } from '@/api/accounting/types'
import { fetchAllTransactions } from '@/api/accounting'
import FilterBar from '@/components/accounting/FilterBar'
import TransactionListView from '@/components/accounting/TransactionListView'

const DEFAULT_FILTERS: FilterState = {
  subsidiary: 'all',
  type: 'all',
  threshold: 'all',
}

type StatusFilter = 'active' | 'archived'

export default function AccountingPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [allTransactions, setAllTransactions] = useState<WorkflowTransaction[]>([])

  useEffect(() => {
    fetchAllTransactions({ ...filters, keyword }).then(setAllTransactions)
  }, [filters, keyword])

  const transactions = allTransactions.filter(t => t.status === statusFilter)

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <input
          type="text"
          placeholder="Search (title, vendor, ref)"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="active">Active</option>
          <option value="archived">Completed</option>
        </select>
      </div>
      <FilterBar filters={filters} onChange={setFilters} activeCount={transactions.length} />
      <div className="mt-3">
        <TransactionListView transactions={transactions} />
      </div>
    </div>
  )
}
