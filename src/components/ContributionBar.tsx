'use client'

import { formatScore } from '@/api/people-contributions'

interface ContributionBarProps {
  contextScore7d: number
  gitScore7d: number
  max7d: number
}

export default function ContributionBar({ contextScore7d, gitScore7d, max7d }: ContributionBarProps) {
  const scale = 0.85
  const total7d = contextScore7d + gitScore7d

  const pctTotal = max7d > 0 ? (total7d / max7d) * 100 * scale : 0
  const ratio = total7d > 0 ? gitScore7d / total7d : 0
  const pctGit = pctTotal * ratio
  const pctContext = pctTotal - pctGit

  return (
    <div className="flex-1 relative h-4">
      <div className="absolute inset-0 bg-gray-100 rounded-full" />
      {/* git — green (left) */}
      {pctGit > 0 && (
        <div
          className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-700 ease-out"
          style={{
            width: `${pctGit}%`,
            borderRadius: pctContext === 0 ? '9999px' : '9999px 0 0 9999px',
          }}
        />
      )}
      {/* context — blue (right) */}
      <div
        className="absolute inset-y-0 bg-blue-500 transition-all duration-700 ease-out"
        style={{
          left: `${pctGit}%`,
          width: `${pctContext}%`,
          borderRadius: pctGit === 0 ? '9999px' : '0 9999px 9999px 0',
        }}
      />
      {/* 7d total score label */}
      <span
        className="absolute top-1/2 -translate-y-1/2 text-[11px] font-semibold text-blue-700 whitespace-nowrap"
        style={{ left: `calc(${pctTotal}% + 8px)` }}
      >
        {formatScore(total7d)}
      </span>
    </div>
  )
}
