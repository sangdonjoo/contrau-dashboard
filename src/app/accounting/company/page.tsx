"use client"

import { useEffect, useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts'

interface MonthlyFinancial {
  month: string
  grossProfit: number
  operatingIncome: number
}

interface SubsidiaryFinancials {
  id: string
  name: string
  nameKo: string
  data: MonthlyFinancial[]
}

function formatMonth(month: string): string {
  return month.split('-')[1].replace(/^0/, '')
}

function buildConsolidated(subsidiaries: SubsidiaryFinancials[]): MonthlyFinancial[] {
  if (subsidiaries.length === 0) return []
  // Collect all unique months
  const monthSet = new Set<string>()
  for (const sub of subsidiaries) {
    for (const d of sub.data) monthSet.add(d.month)
  }
  const months = Array.from(monthSet).sort()
  return months.map(month => {
    let grossProfit = 0, operatingIncome = 0
    for (const sub of subsidiaries) {
      const d = sub.data.find(x => x.month === month)
      if (d) { grossProfit += d.grossProfit; operatingIncome += d.operatingIncome }
    }
    return { month, grossProfit, operatingIncome }
  })
}

function FinancialChart({ title, data, height = 250 }: { title: string; data: MonthlyFinancial[]; height?: number }) {
  const hasNegative = data.some(d => d.operatingIncome < 0)
  const chartData = data.map(d => ({ ...d, monthLabel: formatMonth(d.month) }))

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v: number) => {
            if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M₫`
            if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K₫`
            return `${v}₫`
          }} />
          {hasNegative && <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="4 2" />}
          <Tooltip
            formatter={(value, name) => {
              const v = Number(value)
              const formatted = v >= 1_000_000
                ? `${(v / 1_000_000).toFixed(2)}M₫`
                : v >= 1_000
                ? `${(v / 1_000).toFixed(0)}K₫`
                : `${v}₫`
              return [formatted, name === 'grossProfit' ? 'Gross Profit' : 'Operating Income']
            }}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend
            formatter={(value: string) => value === 'grossProfit' ? 'Gross Profit' : 'Operating Income'}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="grossProfit" fill="#BFDBFE" radius={[2, 2, 0, 0]} barSize={24} />
          <Line type="monotone" dataKey="operatingIncome" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: '#2563EB' }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function SkeletonChart({ height = 250 }: { height?: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
      <div className="bg-gray-100 rounded" style={{ height }} />
    </div>
  )
}

export default function AccountingCompanyPage() {
  const [subsidiaries, setSubsidiaries] = useState<SubsidiaryFinancials[]>([])
  const [loading, setLoading] = useState(true)
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/accounting/financials?months=12')
      .then(r => r.json())
      .then((json: { available: boolean; data: SubsidiaryFinancials[] }) => {
        if (cancelled) return
        setAvailable(json.available ?? false)
        setSubsidiaries(Array.isArray(json.data) ? json.data : [])
      })
      .catch(err => {
        console.error('Financials fetch error:', err)
        if (!cancelled) { setAvailable(false); setSubsidiaries([]) }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const consolidatedData = buildConsolidated(subsidiaries)

  if (loading) {
    return (
      <div className="py-2">
        <div className="mb-6">
          <SkeletonChart height={300} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <SkeletonChart key={i} />)}
        </div>
      </div>
    )
  }

  if (!available || subsidiaries.length === 0) {
    return (
      <div className="py-2">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-400">
          No financial data available
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="py-2">
        <div className="mb-6">
          <FinancialChart title="Consolidated" data={consolidatedData} height={300} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subsidiaries.map(sub => (
            <FinancialChart key={sub.id} title={sub.name} data={sub.data} />
          ))}
        </div>
      </div>
    </div>
  )
}
