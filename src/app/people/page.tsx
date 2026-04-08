'use client'

import { useState, useEffect } from 'react'
import ContributionBar from '@/components/ContributionBar'
import StreakBadge from '@/components/StreakBadge'
import Sparkline from '@/components/Sparkline'
import HeadcountPanel from '@/components/people/HeadcountPanel'
import OrgChart from '@/components/people/OrgChart'
import RelationshipGraph from '@/components/people/RelationshipGraph'
import { fetchContributions } from '@/api/people-contributions'
import type { ContributionPerson } from '@/api/people/contribution-types'

const PROJECT_COLORS: Record<string, string> = {
  HQ: 'bg-gray-100 text-gray-600',
  MicroAlgae: 'bg-emerald-50 text-emerald-600',
  Shrimp: 'bg-orange-50 text-orange-600',
  BSFL: 'bg-amber-50 text-amber-600',
  Flower: 'bg-pink-50 text-pink-600',
}

function ProjectBadge({ project }: { project: string | null }) {
  if (!project) return null
  const style = PROJECT_COLORS[project] ?? 'bg-gray-50 text-gray-500'
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${style}`}>
      {project}
    </span>
  )
}

function PlBadge({ pl }: { pl: number | null }) {
  if (pl == null) return null
  const styles: Record<number, string> = {
    1: 'text-purple-600',
    2: 'text-blue-600',
    3: 'text-emerald-600',
    4: 'text-gray-500',
    5: 'text-gray-400',
  }
  return (
    <span className={`text-[10px] font-medium ${styles[pl] ?? 'text-gray-400'}`}>
      PL{pl}
    </span>
  )
}

type Period = '7d' | '30d'

function KeyPersonRiskCard({ sorted, period }: { sorted: ContributionPerson[]; period: Period }) {
  if (sorted.length === 0) return null

  const scores = sorted.map(p => period === '7d' ? p.score_7d : p.score_30d)
  const totalScore = scores.reduce((a, b) => a + b, 0)
  if (totalScore === 0) return null

  const top3Score = scores.slice(0, 3).reduce((a, b) => a + b, 0)
  const pct = Math.round((top3Score / totalScore) * 100)

  let icon: React.ReactNode = null
  let cardStyle = 'bg-gray-50 border-gray-200 text-gray-600'

  if (pct > 80) {
    cardStyle = 'bg-red-50 border-red-200 text-red-700'
    icon = (
      <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    )
  } else if (pct > 60) {
    cardStyle = 'bg-amber-50 border-amber-200 text-amber-700'
    icon = (
      <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    )
  }

  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-medium mb-3 ${cardStyle}`}>
      {icon}
      <span>
        상위 3인이 전체 기여도의 <strong>{pct}%</strong> 차지
      </span>
    </div>
  )
}

export default function PeoplePage() {
  const [people, setPeople] = useState<ContributionPerson[]>([])
  const [period, setPeriod] = useState<Period>('7d')
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({})

  useEffect(() => {
    fetchContributions().then(setPeople)
    fetch('/api/people/sparklines')
      .then(r => r.ok ? r.json() : { sparklines: {} })
      .then((data: { sparklines: Record<string, number[]> }) => setSparklines(data.sparklines))
      .catch(() => {/* silently ignore */})
  }, [])

  const sorted = [...people]
    .filter(p => p.person_id !== 'others')
    .sort((a, b) =>
      period === '7d' ? b.score_7d - a.score_7d : b.score_30d - a.score_30d
    )

  const maxScore = Math.max(
    ...sorted.map(p => period === '7d' ? p.score_7d : p.score_30d),
    1
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <HeadcountPanel />
      <OrgChart />
      <RelationshipGraph />

      <header className="mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Context Contribution</h1>
          {/* 기간 토글 */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            {(['7d', '30d'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  period === p
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          AI-measured context contribution — {period}
          <span className="ml-3 inline-flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500" /> context (Zalo, Telegram, interviews)
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" /> git (code commits, file changes)
          </span>
        </p>
      </header>

      <KeyPersonRiskCard sorted={sorted} period={period} />

      <div className="space-y-2">
        {sorted.map((person, idx) => {
          const contextScore = period === '7d' ? person.context_score_7d : person.context_score_30d
          const gitScore     = period === '7d' ? person.git_score_7d    : person.git_score_30d
          const eventCount   = period === '7d' ? person.event_count_7d  : person.event_count_30d
          const promoted     = period === '7d' ? person.promoted_count_7d : person.promoted_count_30d

          return (
            <div
              key={person.person_id}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3.5 hover:shadow-md hover:border-emerald-200 transition-all"
            >
              <div className="flex items-center gap-2 w-28 sm:w-40 shrink-0">
                <span className="text-xs font-medium text-gray-400 w-5 text-right">
                  #{idx + 1}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-gray-800">{person.name_en}</span>
                    <PlBadge pl={person.pl} />
                    {person.score_7d === 0 && person.streak_days === 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-red-100 text-red-600 leading-none">
                        7일 침묵
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <ProjectBadge project={person.project} />
                    <span className="text-[10px] text-gray-400">
                      {eventCount} events
                      {promoted > 0 && ` / ${promoted} R1`}
                    </span>
                  </div>
                </div>
              </div>
              <ContributionBar
                contextScore7d={contextScore}
                gitScore7d={gitScore}
                max7d={maxScore}
              />
              <div className="hidden sm:flex items-center gap-3 w-36 shrink-0 justify-end">
                <Sparkline data={sparklines[person.person_id] ?? []} />
                <StreakBadge days={person.streak_days} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
