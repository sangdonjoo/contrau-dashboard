"use client"

import { useState } from 'react'
import workflowsData from '@/data/accounting/workflows.json'

type Subsidiary = 'CONTRAU_ECO' | 'CONTRAU_SHRIMP' | 'CONTRAU_ALGAE' | 'CONTRAU_BSF' | 'CONTRAU_FEED'

const SUBS: { key: Subsidiary; label: string }[] = [
  { key: 'CONTRAU_ECO', label: 'Eco' },
  { key: 'CONTRAU_SHRIMP', label: 'Shrimp' },
  { key: 'CONTRAU_ALGAE', label: 'Algae' },
  { key: 'CONTRAU_BSF', label: 'BSF' },
  { key: 'CONTRAU_FEED', label: 'Feed' },
]

interface Approver {
  person: string
  ai_eligible: boolean
  ai_active: boolean
  ai_confidence: number | null
}

interface Step {
  stage: string
  label: string
  approvers: Record<string, Approver>
}

interface Workflow {
  id: string
  name: string
  type: string
  steps: Step[]
}

const workflows = workflowsData as Workflow[]

function ApproverCell({ approver }: { approver: Approver }) {
  if (approver.ai_active) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">AI</span>
        <span className="text-xs text-gray-400 line-through">{approver.person}</span>
        <span className="text-xs text-blue-500">{approver.ai_confidence}%</span>
      </div>
    )
  }
  if (approver.ai_eligible && !approver.ai_active) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-900">{approver.person}</span>
        <span className="text-xs px-1 py-0.5 rounded bg-yellow-50 text-yellow-600">{approver.ai_confidence}%</span>
      </div>
    )
  }
  return <span className="text-xs font-medium text-gray-900">{approver.person}</span>
}

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'PURCHASE', label: 'Purchase' },
  { key: 'SALES', label: 'Sales' },
  { key: 'EXPENSE', label: 'Expense' },
  { key: 'CAPEX', label: 'CAPEX' },
  { key: 'INVENTORY', label: 'Inventory' },
  { key: 'PAYROLL', label: 'Payroll' },
  { key: 'FIXED_ASSET', label: 'Fixed Asset' },
  { key: 'BANK', label: 'Bank/Cash' },
  { key: 'TAX', label: 'Tax' },
  { key: 'MONTH_CLOSE', label: 'Month Close' },
]

export default function AccountingWorkflowPage() {
  const [selectedSub, setSelectedSub] = useState<string>('CONTRAU_ECO')
  const [selectedCat, setSelectedCat] = useState<string>('all')

  const visibleSubs = selectedSub === 'all' ? SUBS : SUBS.filter(s => s.key === selectedSub)
  const visibleWorkflows = selectedCat === 'all' ? workflows : workflows.filter(wf => wf.type === selectedCat)

  return (
    <div>
      <div className="py-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex gap-2">
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            <select
              value={selectedSub}
              onChange={e => setSelectedSub(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Subsidiaries</option>
              {SUBS.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:ml-auto flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-blue-500" />AI Auto</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-yellow-400" />AI Pending</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-gray-300" />Human Only</span>
          </div>
        </div>

        <div className="space-y-6">
          {visibleWorkflows.map(wf => (
            <div key={wf.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{wf.name}</span>
                <span className="text-xs text-gray-400">{wf.steps.length} Steps</span>
                {(() => {
                  const totalCells = wf.steps.length * visibleSubs.length
                  const aiCells = wf.steps.reduce((sum, step) =>
                    sum + visibleSubs.filter(s => step.approvers[s.key]?.ai_active).length, 0)
                  const pct = totalCells > 0 ? Math.round(aiCells / totalCells * 100) : 0
                  return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">AI {pct}%</span>
                })()}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-2 text-xs font-medium text-gray-400 min-w-[140px]">Step</th>
                      {visibleSubs.map(s => (
                        <th key={s.key} className="px-3 py-2 text-xs font-medium text-gray-400">{s.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {wf.steps.map((step, i) => (
                      <tr key={step.stage} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-gray-100 text-xs flex items-center justify-center text-gray-500 font-medium shrink-0">{i + 1}</span>
                            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{step.label}</span>
                          </div>
                        </td>
                        {visibleSubs.map(s => (
                          <td key={s.key} className="px-3 py-2.5">
                            <ApproverCell approver={step.approvers[s.key]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="block md:hidden divide-y divide-gray-100">
                {wf.steps.map((step, i) => (
                  <div key={step.stage} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-gray-100 text-xs flex items-center justify-center text-gray-500 font-medium shrink-0">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{step.label}</span>
                    </div>
                    <div className="pl-7 space-y-1.5">
                      {visibleSubs.map(s => (
                        <div key={s.key} className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 w-14 shrink-0">{s.label}</span>
                          <ApproverCell approver={step.approvers[s.key]} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
