"use client"

import type { ArchiveFilterState, Subsidiary, WorkflowType } from '@/api/accounting/types'
import SearchInput from './SearchInput'
import DateRangePicker from './DateRangePicker'

interface Props {
  filters: ArchiveFilterState
  onChange: (f: ArchiveFilterState) => void
  totalCount: number
}

const SUBSIDIARIES: Array<{ value: Subsidiary | 'all'; label: string }> = [
  { value: 'all', label: 'All Entities' },
  { value: 'CONTRAU_ECO', label: 'Eco' },
  { value: 'CONTRAU_SHRIMP', label: 'Shrimp' },
  { value: 'CONTRAU_ALGAE', label: 'Algae' },
  { value: 'CONTRAU_BSF', label: 'BSF' },
  { value: 'CONTRAU_KR', label: 'KR HQ' },
]

const TYPES: Array<{ value: WorkflowType | 'all'; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'PURCHASE', label: 'Purchase' },
  { value: 'SALES', label: 'Sales' },
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'CAPEX', label: 'CAPEX' },
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'PAYROLL', label: 'Payroll' },
  { value: 'TAX', label: 'Tax' },
  { value: 'MONTH_CLOSE', label: 'Month Close' },
  { value: 'BANK', label: 'Bank/Cash' },
  { value: 'FIXED_ASSET', label: 'Fixed Asset' },
]

export default function ArchiveFilterBar({ filters, onChange, totalCount }: Props) {
  const selectClass = 'text-sm border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <div className="flex items-center flex-wrap gap-3 px-4 py-2 bg-white border-b border-gray-100">
      <SearchInput
        value={filters.keyword}
        onChange={v => onChange({ ...filters, keyword: v, page: 1 })}
      />

      <select
        className={selectClass}
        value={filters.subsidiary}
        onChange={e => onChange({ ...filters, subsidiary: e.target.value as ArchiveFilterState['subsidiary'], page: 1 })}
      >
        {SUBSIDIARIES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select
        className={selectClass}
        value={filters.type}
        onChange={e => onChange({ ...filters, type: e.target.value as ArchiveFilterState['type'], page: 1 })}
      >
        {TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <DateRangePicker
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onChangeFrom={v => onChange({ ...filters, dateFrom: v, page: 1 })}
        onChangeTo={v => onChange({ ...filters, dateTo: v, page: 1 })}
      />

      <span className="text-xs text-gray-500 ml-auto">{totalCount} items</span>
    </div>
  )
}
