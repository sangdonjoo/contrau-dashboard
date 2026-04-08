"use client"

import { useEffect, useState, useCallback } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface BalanceSheetData {
  cash: number
  accountsReceivable: number
  inventory: number
  otherCurrentAssets: number
  totalCurrentAssets: number
  fixedAssets: number
  accumulatedDepreciation: number
  constructionInProgress: number
  otherNonCurrentAssets: number
  totalNonCurrentAssets: number
  totalAssets: number
  accountsPayable: number
  advancesReceived: number
  otherShortTermLiabilities: number
  totalShortTermLiabilities: number
  longTermDebt: number
  otherLongTermLiabilities: number
  totalLongTermLiabilities: number
  totalLiabilities: number
  paidInCapital: number
  retainedEarnings: number
  otherEquity: number
  totalEquity: number
  totalLiabilitiesAndEquity: number
}

interface ApiResponse {
  available: boolean
  asOf: string
  company: string
  data: BalanceSheetData
}

const COMPANIES = [
  { code: 'all',         label: 'All (Consolidated)' },
  { code: 'CPLUS',       label: 'Contrau Plus (CECO)' },
  { code: 'SOLAGRON',    label: 'Solagron (Algae)' },
  { code: 'ECCM',        label: 'Eco CM (Shrimp)' },
  { code: 'ENTOFLOW',    label: 'Entoflow (BSF)' },
  { code: 'CONTRAU_KR',  label: 'Contrau KR' },
]

const PIE_COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE']

function formatB(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toLocaleString()
}

function formatVND(value: number): string {
  return value.toLocaleString('en-US') + ' ₫'
}

function Row({
  label,
  value,
  indent = false,
  bold = false,
  negative = false,
}: {
  label: string
  value: number
  indent?: boolean
  bold?: boolean
  negative?: boolean
}) {
  const display = negative ? -value : value
  return (
    <div className={`flex justify-between py-1 text-sm ${bold ? 'font-semibold border-t border-gray-200 mt-1 pt-2' : ''} ${indent ? 'pl-4 text-gray-600' : 'text-gray-800'}`}>
      <span>{label}</span>
      <span className={display < 0 ? 'text-red-500' : ''}>{formatB(display)}</span>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-1 pb-1 border-b border-gray-100">
      {title}
    </div>
  )
}

function SkeletonBlock({ lines = 6 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${60 + (i % 3) * 15}%` }} />
      ))}
    </div>
  )
}

export default function BalanceSheetPage() {
  const [company, setCompany] = useState('all')
  const [asOf, setAsOf] = useState(() => new Date().toISOString().slice(0, 10))
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/accounting/balance-sheet?company=${company}&asOf=${asOf}`)
      .then(r => r.json())
      .then((json: ApiResponse) => { if (!cancelled) setResult(json) })
      .catch(err => { console.error('Balance sheet fetch error:', err); if (!cancelled) setResult(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [company, asOf])

  useEffect(() => { return load() }, [load])

  const d = result?.data

  const pieData = d ? [
    { name: 'Cash', value: Math.max(0, d.cash) },
    { name: 'Receivables', value: Math.max(0, d.accountsReceivable) },
    { name: 'Inventory', value: Math.max(0, d.inventory) },
    { name: 'Fixed Assets', value: Math.max(0, d.fixedAssets - d.accumulatedDepreciation) },
    { name: 'Other', value: Math.max(0, d.otherCurrentAssets + d.otherNonCurrentAssets + d.constructionInProgress) },
  ].filter(x => x.value > 0) : []

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Company</label>
          <select
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {COMPANIES.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">As of Date</label>
          <input
            type="date"
            value={asOf}
            onChange={e => setAsOf(e.target.value)}
            className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5"><SkeletonBlock lines={14} /></div>
          <div className="bg-white rounded-lg border border-gray-200 p-5"><SkeletonBlock lines={14} /></div>
        </div>
      )}

      {!loading && (!result?.available || !d) && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-400">
          No data available
        </div>
      )}

      {!loading && result?.available && d && (
        <>
          {/* Balance check notice */}
          {Math.abs(d.totalAssets - d.totalLiabilitiesAndEquity) > 1 && (
            <div className="mb-4 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              Note: Assets ({formatVND(d.totalAssets)}) ≠ Liabilities + Equity ({formatVND(d.totalLiabilitiesAndEquity)}) — partial data may be loaded.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assets Column */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Assets</h2>

              <SectionHeader title="Current Assets" />
              <Row label="Cash & Cash Equivalents" value={d.cash} indent />
              <Row label="Accounts Receivable" value={d.accountsReceivable} indent />
              <Row label="Inventory" value={d.inventory} indent />
              <Row label="Other Current Assets" value={d.otherCurrentAssets} indent />
              <Row label="Total Current Assets" value={d.totalCurrentAssets} bold />

              <SectionHeader title="Non-Current Assets" />
              <Row label="Fixed Assets (Gross)" value={d.fixedAssets} indent />
              <Row label="Accumulated Depreciation" value={d.accumulatedDepreciation} indent negative />
              <Row label="Construction in Progress" value={d.constructionInProgress} indent />
              <Row label="Other Non-Current Assets" value={d.otherNonCurrentAssets} indent />
              <Row label="Total Non-Current Assets" value={d.totalNonCurrentAssets} bold />

              <div className="flex justify-between py-2 text-sm font-bold border-t-2 border-gray-300 mt-2">
                <span>Total Assets</span>
                <span>{formatB(d.totalAssets)}</span>
              </div>
            </div>

            {/* Liabilities + Equity Column */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Liabilities & Equity</h2>

              <SectionHeader title="Short-Term Liabilities" />
              <Row label="Accounts Payable" value={d.accountsPayable} indent />
              <Row label="Other Short-Term Liabilities" value={d.otherShortTermLiabilities} indent />
              <Row label="Total Short-Term Liabilities" value={d.totalShortTermLiabilities} bold />

              <SectionHeader title="Long-Term Liabilities" />
              <Row label="Long-Term Debt" value={d.longTermDebt} indent />
              <Row label="Other Long-Term Liabilities" value={d.otherLongTermLiabilities} indent />
              <Row label="Total Long-Term Liabilities" value={d.totalLongTermLiabilities} bold />

              <Row label="Total Liabilities" value={d.totalLiabilities} bold />

              <SectionHeader title="Equity" />
              <Row label="Paid-in Capital" value={d.paidInCapital} indent />
              <Row label="Retained Earnings" value={d.retainedEarnings} indent />
              <Row label="Other Equity" value={d.otherEquity} indent />
              <Row label="Total Equity" value={d.totalEquity} bold />

              <div className="flex justify-between py-2 text-sm font-bold border-t-2 border-gray-300 mt-2">
                <span>Total Liabilities & Equity</span>
                <span>{formatB(d.totalLiabilitiesAndEquity)}</span>
              </div>
            </div>
          </div>

          {/* Asset Composition Pie Chart */}
          {pieData.length > 0 && (
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Asset Composition</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatVND(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
