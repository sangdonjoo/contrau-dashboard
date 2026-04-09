"use client"

import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'

interface CashFlowPeriod {
  month: string
  operating: number
  investing: number
  financing: number
  net: number
}

interface ApiResponse {
  available: boolean
  company: string
  year: number
  month: number | null
  operating: number
  investing: number
  financing: number
  netChange: number
  openingBalance: number
  closingBalance: number
  monthly: CashFlowPeriod[]
}

const COMPANIES = [
  { code: 'all',        label: 'All (Consolidated)' },
  { code: 'CONTRAU_KR', label: 'Contrau KR (F0)' },
  { code: 'CTSF',       label: 'Contrau Seafood Imexco' },
  { code: 'CINV',       label: 'Contrau Investment' },
  { code: 'CTPLUS',     label: 'Contrau Plus' },
  { code: 'ECCM',       label: 'Eco CM (Shrimp)' },
  { code: 'ENTOFLOW',   label: 'Entoflow (BSF)' },
  { code: 'CTAT',       label: 'Contrau Aqua Tech' },
  { code: 'SOLAGRON',   label: 'Solagron (Algae)' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)
const MONTHS = [
  { value: '', label: 'Full Year' },
  { value: '1', label: 'Jan' }, { value: '2', label: 'Feb' }, { value: '3', label: 'Mar' },
  { value: '4', label: 'Apr' }, { value: '5', label: 'May' }, { value: '6', label: 'Jun' },
  { value: '7', label: 'Jul' }, { value: '8', label: 'Aug' }, { value: '9', label: 'Sep' },
  { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' },
]

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

function SummaryRow({
  label,
  value,
  bold = false,
  color,
}: {
  label: string
  value: number
  bold?: boolean
  color?: string
}) {
  const isPositive = value >= 0
  const valueColor = color ?? (isPositive ? 'text-emerald-600' : 'text-red-500')
  return (
    <div className={`flex justify-between items-center py-2 text-sm ${bold ? 'font-semibold border-t border-gray-200 mt-1' : ''}`}>
      <span className={bold ? 'text-gray-900' : 'text-gray-700'}>{label}</span>
      <span className={valueColor}>
        {value > 0 ? '+' : ''}{formatB(value)} ₫
      </span>
    </div>
  )
}

function BalanceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center py-2 text-sm">
      <span className="text-gray-700">{label}</span>
      <span className="text-gray-900 font-medium">{formatB(value)} ₫</span>
    </div>
  )
}

function SkeletonBlock({ lines = 6 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${50 + (i % 4) * 12}%` }} />
      ))}
    </div>
  )
}

function formatMonthLabel(month: string): string {
  const parts = month.split('-')
  if (parts.length < 2) return month
  return parts[1].replace(/^0/, '') + '/' + parts[0].slice(2)
}

export default function CashFlowPage() {
  const [company, setCompany] = useState('all')
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState('')
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams({
      company,
      year: String(year),
      ...(month ? { month } : {}),
    })
    fetch(`/api/accounting/cash-flow?${params}`)
      .then(r => r.json())
      .then((json: ApiResponse) => { if (!cancelled) setResult(json) })
      .catch(err => { console.error('Cash flow fetch error:', err); if (!cancelled) setResult(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [company, year, month])

  useEffect(() => { return load() }, [load])

  const chartData = result?.monthly?.map(p => ({
    label: formatMonthLabel(p.month),
    operating: p.operating,
    investing: p.investing,
    financing: p.financing,
  })) ?? []

  const hasNegative = chartData.some(d => d.operating < 0 || d.investing < 0 || d.financing < 0)

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
          <label className="block text-xs text-gray-500 mb-1">Year</label>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Month</label>
          <select
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5"><SkeletonBlock lines={8} /></div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 h-64"><SkeletonBlock lines={4} /></div>
        </div>
      )}

      {!loading && (!result?.available) && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-400">
          No data available
        </div>
      )}

      {!loading && result?.available && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cash Flow Statement */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Cash Flow Statement
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {year}{month ? ` / ${month.padStart(2, '0')}` : ' (Full Year)'}
                </span>
              </h2>

              <div className="divide-y divide-gray-50">
                <SummaryRow label="Operating Activities" value={result.operating} />
                <SummaryRow label="Investing Activities" value={result.investing} />
                <SummaryRow label="Financing Activities" value={result.financing} />
                <SummaryRow label="Net Cash Change" value={result.netChange} bold />
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 divide-y divide-gray-50">
                <BalanceRow label="Opening Balance" value={result.openingBalance} />
                <BalanceRow label="Closing Balance" value={result.closingBalance} />
              </div>
            </div>

            {/* Monthly Chart */}
            {chartData.length > 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Monthly Cash Flow Trend</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      tickFormatter={(v: number) => {
                        const abs = Math.abs(v)
                        if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
                        if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
                        if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}K`
                        return String(v)
                      }}
                    />
                    {hasNegative && <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="4 2" />}
                    <Tooltip
                      formatter={(value, name) => {
                        const labels: Record<string, string> = {
                          operating: 'Operating',
                          investing: 'Investing',
                          financing: 'Financing',
                        }
                        return [formatVND(Number(value)), labels[String(name)] ?? String(name)]
                      }}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Legend
                      formatter={(value: string) => {
                        const labels: Record<string, string> = {
                          operating: 'Operating',
                          investing: 'Investing',
                          financing: 'Financing',
                        }
                        return labels[value] ?? value
                      }}
                      wrapperStyle={{ fontSize: 12 }}
                    />
                    <Bar dataKey="operating" fill="#3B82F6" radius={[2, 2, 0, 0]} barSize={16} />
                    <Bar dataKey="investing" fill="#F59E0B" radius={[2, 2, 0, 0]} barSize={16} />
                    <Bar dataKey="financing" fill="#10B981" radius={[2, 2, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {chartData.length <= 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-center text-sm text-gray-400">
                Chart available for multi-month view
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
