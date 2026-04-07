"use client"

import type { FilterState, Subsidiary, WorkflowType } from '@/api/accounting/types'

interface Props {
  filters: FilterState
  onChange: (f: FilterState) => void
  activeCount: number
}

const SUBSIDIARIES: Array<{ value: Subsidiary | 'all'; label: string }> = [
  { value: 'all', label: 'All Entities' },
  { value: 'CONTRAU_ECO', label: 'HQ (Contrau Plus)' },
  { value: 'CONTRAU_SHRIMP', label: 'Eco Ca Mau' },
  { value: 'CONTRAU_ALGAE', label: 'Solagron' },
  { value: 'CONTRAU_BSF', label: 'Entoflow' },
  { value: 'CONTRAU_FEED', label: 'Seafood Imexco' },
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

const THRESHOLDS: Array<{ value: FilterState['threshold']; label: string }> = [
  { value: 'all', label: 'All Amounts' },
  { value: 'small', label: 'Small (≤5M)' },
  { value: 'medium', label: 'Medium (5~20M)' },
  { value: 'large', label: 'Large (>20M)' },
]

export default function FilterBar({ filters, onChange, activeCount }: Props) {
  const selectClass = 'text-sm border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-100 flex-wrap">
      <select
        className={selectClass}
        value={filters.subsidiary}
        onChange={e => onChange({ ...filters, subsidiary: e.target.value as FilterState['subsidiary'] })}
      >
        {SUBSIDIARIES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select
        className={selectClass}
        value={filters.type}
        onChange={e => onChange({ ...filters, type: e.target.value as FilterState['type'] })}
      >
        {TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select
        className={selectClass}
        value={filters.threshold}
        onChange={e => onChange({ ...filters, threshold: e.target.value as FilterState['threshold'] })}
      >
        {THRESHOLDS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <span className="text-xs text-gray-500 ml-auto">{activeCount} active</span>
    </div>
  )
}
