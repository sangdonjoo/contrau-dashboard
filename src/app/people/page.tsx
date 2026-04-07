'use client'

import { useState, useEffect } from 'react'
import ContributionBar from '@/components/ContributionBar'
import StreakBadge from '@/components/StreakBadge'
import HeadcountPanel from '@/components/people/HeadcountPanel'
import OrgChart from '@/components/people/OrgChart'
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

export default function PeoplePage() {
  const [people, setPeople] = useState<ContributionPerson[]>([])
  const [period, setPeriod] = useState<Period>('7d')

  useEffect(() => {
    fetchContributions().then(setPeople)
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <HeadcountPanel />
        <OrgChart />
      </div>

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
              <div className="hidden sm:flex w-24 shrink-0 justify-end">
                <StreakBadge days={person.streak_days} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
