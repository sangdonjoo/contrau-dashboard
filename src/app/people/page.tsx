'use client'

import { useState, useEffect } from 'react'
import ContributionBar from '@/components/ContributionBar'
import StreakBadge from '@/components/StreakBadge'
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

export default function PeoplePage() {
  const [people, setPeople] = useState<ContributionPerson[]>([])

  useEffect(() => {
    fetchContributions().then(setPeople)
  }, [])

  const sorted = [...people].filter(p => p.person_id !== 'others').sort((a, b) => b.score_7d - a.score_7d)
  const max30d = Math.max(...sorted.map(p => p.score_30d), 1)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">People — Context Contribution</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          AI 맥락 기여도 — 7d / 30d
          <span className="ml-3 inline-flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500" /> context
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" /> git
          </span>
        </p>
      </header>
      <div className="space-y-2">
        {sorted.map((person, idx) => (
          <div
            key={person.person_id}
            className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3.5 hover:shadow-md hover:border-emerald-200 transition-all"
          >
            <div className="flex items-center gap-2 w-40 shrink-0">
              <span className="text-xs font-medium text-gray-400 w-5 text-right">
                {person.person_id !== 'others' ? `#${idx + 1}` : ''}
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-gray-800">{person.name_en}</span>
                  <PlBadge pl={person.pl} />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <ProjectBadge project={person.project} />
                  <span className="text-[10px] text-gray-400">
                    {person.event_count_7d} events
                    {person.promoted_count_7d > 0 && ` / ${person.promoted_count_7d} R1`}
                  </span>
                </div>
              </div>
            </div>
            <ContributionBar
              contextScore7d={person.context_score_7d}
              gitScore7d={person.git_score_7d}
              score30d={person.score_30d}
              max30d={max30d}
            />
            <div className="w-24 shrink-0 flex justify-end">
              <StreakBadge days={person.streak_days} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
