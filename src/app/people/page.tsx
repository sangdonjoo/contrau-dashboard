"use client"

import { useState, useEffect } from 'react'
import { fetchTokenUsers, formatTokenCount } from '@/api/people-tokens'
import type { TokenUser } from '@/api/people/types'

function PlanBadge({ plan }: { plan: 'max' | 'premium' | 'standard' }) {
  const styles = {
    max: 'bg-purple-50 text-purple-600 border-purple-200',
    premium: 'bg-blue-50 text-blue-600 border-blue-200',
    standard: 'bg-gray-50 text-gray-500 border-gray-200',
  }
  const labels = { max: 'Max', premium: 'Premium', standard: 'Standard' }
  return (
    <span className={`px-2.5 py-0.5 text-[11px] font-medium rounded-md border ${styles[plan]}`}>
      {labels[plan]}
    </span>
  )
}

function OverlappingBar({ value7d, value30d, max30d }: { value7d: number; value30d: number; max30d: number }) {
  const scale = 0.65
  const pct30 = max30d > 0 ? (value30d / max30d) * 100 * scale : 0
  const pct7 = max30d > 0 ? (value7d / max30d) * 100 * scale : 0

  return (
    <div className="flex-1 relative h-4">
      <div className="absolute inset-0 bg-gray-100 rounded-full" />
      <div
        className="absolute inset-y-0 left-0 bg-blue-100 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct30}%` }}
      />
      <div
        className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct7}%` }}
      />
      <span
        className="absolute top-1/2 -translate-y-1/2 text-[11px] font-semibold text-blue-700 whitespace-nowrap"
        style={{ left: `calc(${pct7}% + 8px)` }}
      >{formatTokenCount(value7d)}</span>
      <span
        className="absolute top-1/2 -translate-y-1/2 text-[11px] font-medium text-blue-300 whitespace-nowrap"
        style={{ left: `calc(${pct30}% + 8px)` }}
      >{formatTokenCount(value30d)}</span>
    </div>
  )
}

export default function PeoplePage() {
  const [users, setUsers] = useState<TokenUser[]>([])

  useEffect(() => {
    fetchTokenUsers().then(setUsers)
  }, [])

  const max30d = Math.max(...users.map(u => u.total30d), 1)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">People</h1>
        <p className="text-xs text-gray-400 mt-0.5">Claude 토큰 사용량 — 7일 / 30일</p>
      </header>
      <div className="space-y-2">
        {users.map(user => (
          <div
            key={user.profile.id}
            className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className="flex items-center gap-3 w-28 shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                {user.profile.nameEn[0]}
              </div>
              <span className="text-sm font-semibold text-gray-800">{user.profile.nameEn}</span>
            </div>
            <OverlappingBar value7d={user.total7d} value30d={user.total30d} max30d={max30d} />
            <div className="w-20 shrink-0 flex justify-end">
              <PlanBadge plan={user.profile.plan} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
