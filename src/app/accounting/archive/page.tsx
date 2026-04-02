"use client"

import { useState, useEffect } from 'react'
import type { WorkflowTransaction, ArchiveFilterState } from '@/api/accounting/types'
import { fetchArchiveTransactions } from '@/api/accounting'
import ArchiveFilterBar from '@/components/accounting/ArchiveFilterBar'
import ArchiveTable from '@/components/accounting/ArchiveTable'
import Pagination from '@/components/accounting/Pagination'

const DEFAULT_FILTERS: ArchiveFilterState = {
  subsidiary: 'all',
  type: 'all',
  threshold: 'all',
  dateFrom: null,
  dateTo: null,
  keyword: '',
  page: 1,
  pageSize: 20,
}

export default function AccountingArchivePage() {
  const [filters, setFilters] = useState<ArchiveFilterState>(DEFAULT_FILTERS)
  const [transactions, setTransactions] = useState<WorkflowTransaction[]>([])
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchArchiveTransactions(filters).then(({ transactions, totalCount }) => {
      setTransactions(transactions)
      setTotalCount(totalCount)
    })
  }, [filters])

  return (
    <div className="flex flex-col h-full">
      <ArchiveFilterBar filters={filters} onChange={setFilters} totalCount={totalCount} />
      <div className="flex-1 overflow-auto">
        <ArchiveTable transactions={transactions} />
      </div>
      <Pagination
        page={filters.page}
        pageSize={filters.pageSize}
        totalCount={totalCount}
        onChange={page => setFilters(f => ({ ...f, page }))}
      />
    </div>
  )
}
