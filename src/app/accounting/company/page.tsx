"use client"

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

const MONTHS = [
  '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10',
  '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04',
]

const subsidiaries: SubsidiaryFinancials[] = [
  {
    id: 'eco', name: 'Contrau Eco', nameKo: 'Parent Co.',
    data: [
      { month: '2025-05', grossProfit: 95, operatingIncome: 22 },
      { month: '2025-06', grossProfit: 88, operatingIncome: 18 },
      { month: '2025-07', grossProfit: 102, operatingIncome: 28 },
      { month: '2025-08', grossProfit: 91, operatingIncome: 20 },
      { month: '2025-09', grossProfit: 85, operatingIncome: 17 },
      { month: '2025-10', grossProfit: 98, operatingIncome: 25 },
      { month: '2025-11', grossProfit: 110, operatingIncome: 32 },
      { month: '2025-12', grossProfit: 118, operatingIncome: 35 },
      { month: '2026-01', grossProfit: 105, operatingIncome: 30 },
      { month: '2026-02', grossProfit: 92, operatingIncome: 21 },
      { month: '2026-03', grossProfit: 99, operatingIncome: 26 },
      { month: '2026-04', grossProfit: 108, operatingIncome: 29 },
    ],
  },
  {
    id: 'shrimp', name: 'Contrau Shrimp', nameKo: 'Shrimp',
    data: [
      { month: '2025-05', grossProfit: 210, operatingIncome: 45 },
      { month: '2025-06', grossProfit: 185, operatingIncome: 38 },
      { month: '2025-07', grossProfit: 195, operatingIncome: 41 },
      { month: '2025-08', grossProfit: 220, operatingIncome: 50 },
      { month: '2025-09', grossProfit: 240, operatingIncome: 55 },
      { month: '2025-10', grossProfit: 265, operatingIncome: 62 },
      { month: '2025-11', grossProfit: 310, operatingIncome: 72 },
      { month: '2025-12', grossProfit: 348, operatingIncome: 80 },
      { month: '2026-01', grossProfit: 330, operatingIncome: 76 },
      { month: '2026-02', grossProfit: 295, operatingIncome: 68 },
      { month: '2026-03', grossProfit: 255, operatingIncome: 58 },
      { month: '2026-04', grossProfit: 228, operatingIncome: 52 },
    ],
  },
  {
    id: 'algae', name: 'Contrau Algae', nameKo: 'Algae',
    data: [
      { month: '2025-05', grossProfit: 32, operatingIncome: -8 },
      { month: '2025-06', grossProfit: 35, operatingIncome: -5 },
      { month: '2025-07', grossProfit: 38, operatingIncome: -3 },
      { month: '2025-08', grossProfit: 42, operatingIncome: 2 },
      { month: '2025-09', grossProfit: 45, operatingIncome: 5 },
      { month: '2025-10', grossProfit: 48, operatingIncome: 7 },
      { month: '2025-11', grossProfit: 52, operatingIncome: 10 },
      { month: '2025-12', grossProfit: 55, operatingIncome: 12 },
      { month: '2026-01', grossProfit: 58, operatingIncome: 13 },
      { month: '2026-02', grossProfit: 50, operatingIncome: 8 },
      { month: '2026-03', grossProfit: 44, operatingIncome: 3 },
      { month: '2026-04', grossProfit: 40, operatingIncome: -2 },
    ],
  },
  {
    id: 'bsf', name: 'Contrau BSF', nameKo: 'BSF',
    data: [
      { month: '2025-05', grossProfit: 52, operatingIncome: 6 },
      { month: '2025-06', grossProfit: 55, operatingIncome: 8 },
      { month: '2025-07', grossProfit: 58, operatingIncome: 10 },
      { month: '2025-08', grossProfit: 62, operatingIncome: 13 },
      { month: '2025-09', grossProfit: 65, operatingIncome: 15 },
      { month: '2025-10', grossProfit: 68, operatingIncome: 17 },
      { month: '2025-11', grossProfit: 72, operatingIncome: 19 },
      { month: '2025-12', grossProfit: 78, operatingIncome: 22 },
      { month: '2026-01', grossProfit: 82, operatingIncome: 23 },
      { month: '2026-02', grossProfit: 79, operatingIncome: 21 },
      { month: '2026-03', grossProfit: 85, operatingIncome: 24 },
      { month: '2026-04', grossProfit: 88, operatingIncome: 25 },
    ],
  },
  {
    id: 'feed', name: 'Contrau Feed', nameKo: 'Feed',
    data: [
      { month: '2025-05', grossProfit: 155, operatingIncome: 32 },
      { month: '2025-06', grossProfit: 162, operatingIncome: 34 },
      { month: '2025-07', grossProfit: 170, operatingIncome: 36 },
      { month: '2025-08', grossProfit: 175, operatingIncome: 38 },
      { month: '2025-09', grossProfit: 180, operatingIncome: 40 },
      { month: '2025-10', grossProfit: 190, operatingIncome: 43 },
      { month: '2025-11', grossProfit: 205, operatingIncome: 48 },
      { month: '2025-12', grossProfit: 218, operatingIncome: 52 },
      { month: '2026-01', grossProfit: 228, operatingIncome: 56 },
      { month: '2026-02', grossProfit: 235, operatingIncome: 58 },
      { month: '2026-03', grossProfit: 242, operatingIncome: 59 },
      { month: '2026-04', grossProfit: 248, operatingIncome: 60 },
    ],
  },
]

function buildConsolidated(): MonthlyFinancial[] {
  return MONTHS.map(month => {
    let grossProfit = 0, operatingIncome = 0
    for (const sub of subsidiaries) {
      const d = sub.data.find(x => x.month === month)
      if (d) { grossProfit += d.grossProfit; operatingIncome += d.operatingIncome }
    }
    return { month, grossProfit, operatingIncome }
  })
}

function formatMonth(month: string): string {
  return month.split('-')[1].replace(/^0/, '')
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
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v: number) => `${v}M₫`} />
          {hasNegative && <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="4 2" />}
          <Tooltip
            formatter={(value, name) => [
              `${value}M₫`,
              name === 'grossProfit' ? 'Gross Profit' : 'Operating Income'
            ]}
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

export default function AccountingCompanyPage() {
  const consolidatedData = buildConsolidated()
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
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
